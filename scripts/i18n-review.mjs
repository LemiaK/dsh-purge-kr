#!/usr/bin/env node
// 동기화 결과 검토기.
//  1) 결정론 검사
//     - 코드 골격: 번역은 문자열/주석만 바꿔야 한다(영숫자 골격 불변).
//     - 패치 표 앵커: `pattern` 은 업스트림과 바이트 단위로 같아야 하고,
//       `replace` 안의 한국어 주입 문장이 병합으로 사라지면 문제로 본다.
//     - 남은 중국어: 정책상 번역 대상인데 아직 중국어인 스팬(--strict-leftover 면 문제, 아니면 경고).
//  2) AI 검토(선택): 새로 번역된 (원문→번역) 쌍을 보여 주고 톤·용어·오역만 지적하게 한다.
//     지적이 오면 --apply-fixes 로 TM 을 교정하고 해당 파일을 다시 번역한다.
//  3) .sync/review.md / .sync/review.json 을 남긴다. 문제가 남으면 exit 2.
//     (워크플로는 선임 수정 패스 → 그래도 남으면 draft PR + 이슈로 넘긴다.)
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scanCode, scanMarkdown, hasCjk, codeFingerprint, kindOf } from "./i18n/spans.mjs";
import { patternDrift, lostPayloads } from "./i18n/anchors.mjs";
import { collectTranslatable, loadConfig } from "./i18n/policy.mjs";
import { loadTm, saveTm, tmKey } from "./i18n/tm.mjs";
import { llmConfig, sanitize, postChat, parseJsonContent } from "./i18n/translate.mjs";

const args = process.argv.slice(2);
const arg = (name, fallback = undefined) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const flag = (name) => args.includes(name);
const reportPath = arg("--report", path.join(".sync", "review.md"));
const jsonPath = arg("--json", path.join(".sync", "review.json"));
const manifestPath = arg("--manifest", path.join(".sync", "changed.txt"));
const baseRef = arg("--base", "");
const allowNetwork = flag("--allow-network");
const applyFixes = flag("--apply-fixes");
const strictLeftover = flag("--strict-leftover");
const limitFixes = Number(arg("--max-fixes", "20"));

const git = (a) => spawnSync("git", a, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
const upstreamBlob = (file) => {
  const res = git(["show", `upstream/master:${file}`]);
  return res.status === 0 ? res.stdout : null;
};
const blobAt = (ref, file) => {
  if (!ref) return null;
  const res = git(["show", `${ref}:${file}`]);
  return res.status === 0 ? res.stdout : null;
};
const snippet = (text, max = 160) => String(text ?? "").replace(/\s+/g, " ").trim().slice(0, max);

const changed = fs.existsSync(manifestPath)
  ? fs.readFileSync(manifestPath, "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
  : [];
const problems = [];
const warnings = [];
const policy = loadConfig();

/** 번역 대상 스팬만 뽑는다(지역화 파이프라인과 같은 규칙). */
function spansFor(file, text) {
  const kind = kindOf(file);
  if (kind === "code") return scanCode(text);
  if (kind === "markdown") return scanMarkdown(text);
  return [];
}

for (const file of changed) {
  if (!fs.existsSync(file)) continue;
  const upstream = upstreamBlob(file);
  const current = fs.readFileSync(file, "utf8");
  if (upstream === null) {
    warnings.push({ file, note: "업스트림에 없는 파일(포크 추가분) — 검토 대상 아님" });
    continue;
  }
  // (1) 코드 골격 불변: 번역은 문자열/주석만 바꿔야 한다.
  //     포크가 이미 구조적으로 다른 파일(자체 패치 추가·파일 분리 등)은 "새로 생긴 차이" 가 아니므로 경고만 한다.
  const previous = blobAt(baseRef, file);
  if (kindOf(file) === "code" && codeFingerprint(upstream) !== codeFingerprint(current)) {
    if (previous !== null && codeFingerprint(previous) !== codeFingerprint(upstream)) {
      warnings.push({ file, note: "포크가 이미 구조적으로 다른 파일입니다(골격 검사 건너뜀)" });
    } else {
      problems.push({ file, kind: "skeleton", detail: "번역 외 코드가 바뀌었습니다(골격 불일치)" });
    }
  }
  // (2) 패치 표 앵커: pattern 은 호스트 소스와 같아야 하고, replace 의 한국어는 유지되어야 한다.
  if (/^lib\/(patches|core)\//.test(file) || file === "lib/core.js") {
    const drift = patternDrift(upstream, current);
    const wasAligned = (index) => {
      if (previous === null) return true;
      const before = patternDrift(upstream, previous);
      return before.drift.every((row) => row.index !== index);
    };
    for (const row of drift.drift.slice(0, 10)) {
      if (!wasAligned(row.index)) continue; // 이전에도 달랐다면 포크 고유 차이 — 새 드리프트가 아니다
      problems.push({
        file,
        kind: "anchor",
        detail: `pattern ${row.index} 이(가) 업스트림과 다릅니다(앵커 번역/변형 금지)`,
        upstream: snippet(row.upstream, 400),
        current: snippet(row.current, 400),
      });
    }
    if (drift.upstreamCount !== drift.currentCount) {
      warnings.push({
        file,
        note: `pattern 개수 차이(업스트림 ${drift.upstreamCount} vs 현재 ${drift.currentCount}) — 포크 구조 차이일 수 있음`,
      });
    }
    if (previous !== null) {
      const lost = lostPayloads(previous, current);
      if (lost.misaligned) {
        warnings.push({ file, note: `문자열 개수가 달라 소실 검사를 건너뜁니다(이전 ${lost.previousCount} vs 현재 ${lost.currentCount})` });
      }
      for (const row of lost.lost.slice(0, 20)) {
        problems.push({
          file,
          kind: "lost-localization",
          detail: `문자열 ${row.index} 의 한국어 문장이 사라졌습니다(병합으로 중국어가 되돌아옴)`,
          previous: snippet(row.previous, 400),
          current: snippet(row.current, 400),
        });
      }
    }
  }
  // (3) 남은 중국어: 정책상 번역 대상인데 아직 중국어인 스팬.
  //     포크에 원래 있던 미번역(기존 부채)은 경고로 두고, 이번 동기화에서 **새로 생긴** 미번역만 문제로 본다.
  const leftover = collectTranslatable(file, current, policy);
  if (leftover.length) {
    const before = previous !== null ? collectTranslatable(file, previous, policy).length : 0;
    const isNew = previous === null ? strictLeftover : leftover.length > before;
    const detail = `번역 대상 ${leftover.length}개가 아직 중국어입니다${previous === null ? "" : `(이전 ${before}개)`}`;
    const entry = {
      file,
      kind: "leftover",
      detail,
      samples: leftover.slice(0, 8).map((s) => ({ kind: s.kind, body: snippet(s.body, 240) })),
    };
    if (strictLeftover && isNew) problems.push(entry);
    else warnings.push({ file, note: `${detail} — 예: ${snippet(leftover[0].body, 120)}` });
  } else if (hasCjk(current) && !/^docs\/releases\//.test(file)) {
    const count = (current.match(/[\u3400-\u4DBF\u4E00-\u9FFF]/g) || []).length;
    warnings.push({ file, note: `남은 중국어 ${count}자(앵커/의도된 원문일 수 있음)` });
  }
}

// (4) AI 검토: 이번 동기화에서 새로 번역된 쌍을 모아 톤·용어만 본다.
let aiIssues = [];
let aiError = "";
if (allowNetwork && !problems.length && changed.length) {
  const cfg = llmConfig();
  if (!cfg.key) {
    aiError = "LLM_API_KEY is not set — AI 검토는 건너뜁니다";
  } else {
    const pairs = [];
    for (const file of changed) {
      if (!fs.existsSync(file)) continue;
      const upstream = upstreamBlob(file);
      if (upstream === null) continue;
      const a = spansFor(file, upstream).filter((s) => hasCjk(s.text));
      const b = spansFor(file, fs.readFileSync(file, "utf8"));
      if (a.length !== b.length) continue;
      for (let i = 0; i < a.length; i += 1) {
        const src = a[i].text;
        const ko = b[i].text;
        if (src === ko || !hasCjk(src)) continue;
        pairs.push({ file, src, ko });
        if (pairs.length >= 120) break;
      }
      if (pairs.length >= 120) break;
    }
    if (pairs.length) {
      try {
        const payload = await postChat(cfg, () => ({
          model: cfg.model,
          messages: [
            {
              role: "system",
              content: [
                "You review Korean translations of a JavaScript repository's Chinese strings.",
                "Flag only real defects: mistranslation, tone mismatch (must be polite 합니다체, labels noun-form),",
                "broken interpolation such as ${...}/{{model}}, or translated identifiers/paths/CLI flags.",
                "Do not suggest stylistic rewrites. Return JSON: {\"issues\":[{\"file\":...,\"src\":...,\"ko\":...,\"problem\":...}]},",
                "and an empty array when everything is fine.",
              ].join(" "),
            },
            { role: "user", content: JSON.stringify({ pairs }) },
          ],
        }));
        const parsed = parseJsonContent(payload?.choices?.[0]?.message?.content ?? "{}");
        aiIssues = (parsed.issues ?? []).filter((x) => x && typeof x.src === "string" && typeof x.ko === "string");
      } catch (error) {
        aiError = sanitize(error?.message ?? String(error), cfg.key);
      }
    }
  }
}

// (5) AI 지적 교정: TM 을 덮어쓰고 해당 파일을 다시 번역한다.
let fixed = 0;
if (applyFixes && aiIssues.length) {
  const ctxOf = (file) => (kindOf(file) === "code" ? "string" : "markdown");
  const rows = [];
  for (const issue of aiIssues.slice(0, limitFixes)) {
    const ctx = ctxOf(issue.file);
    rows.push({ k: tmKey(ctx, issue.src), ctx, src: issue.src, ko: issue.ko, v: "review" });
  }
  saveTm(rows);
  for (const issue of aiIssues.slice(0, limitFixes)) {
    if (fs.existsSync(issue.file)) {
      spawnSync(process.execPath, ["scripts/localize.mjs", "--paths", issue.file, "--write"], { encoding: "utf8" });
      fixed += 1;
    }
  }
}

const lines = [
  "# 동기화 검토 결과",
  "",
  `- 델타 파일: ${changed.length}`,
  `- 결정론 문제: ${problems.length}`,
  `- 경고: ${warnings.length}`,
  `- AI 지적: ${aiIssues.length}${applyFixes ? ` (교정 적용 ${fixed})` : ""}`,
  aiError ? `- AI 오류: ${aiError}` : null,
  "",
  problems.length ? "## 문제" : null,
  ...problems.map((p) => `- \`${p.file}\` — ${p.detail} (${p.kind})`),
  aiIssues.length ? "## AI 지적" : null,
  ...aiIssues.map((i) => `- \`${i.file}\`: ${i.problem ?? ""} — \`${i.src}\` → \`${i.ko}\``),
  warnings.length ? "## 경고" : null,
  ...warnings.map((w) => `- \`${w.file}\`: ${w.note}`),
  "",
].filter(Boolean);

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join("\n") + "\n", "utf8");
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(
  jsonPath,
  JSON.stringify({ changed, problems, warnings, aiIssues, aiError, fixed, base: baseRef, strictLeftover }, null, 2) + "\n",
  "utf8",
);
console.log(`review: files=${changed.length} problems=${problems.length} aiIssues=${aiIssues.length} fixed=${fixed}${aiError ? " aiError=" + aiError : ""}`);
if (problems.length) process.exit(2);
if (aiIssues.length && !applyFixes) process.exit(2);
