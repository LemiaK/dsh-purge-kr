#!/usr/bin/env node
// 동기화 결과 검토기.
//  1) 결정론 검사: 델타 파일마다 "코드 골격"이 업스트림과 같은지, 패치 파일의 문자열(앵커)이
//     그대로인지, 번역 대상이 남았는지 확인한다.
//  2) AI 검토(선택): 새로 번역된 (원문→번역) 쌍을 모델에 보여 주고 톤·용어·오역만 지적하게 한다.
//     지적이 오면 --apply-fixes 로 TM 을 교정하고 해당 파일을 다시 번역한다.
//  3) .sync/review.md 를 남긴다. 문제가 남으면 exit 2(워크플로는 draft PR + 라벨로 남긴다).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scanCode, scanMarkdown, hasCjk, codeFingerprint, kindOf } from "./i18n/spans.mjs";
import { loadTm, saveTm, tmKey } from "./i18n/tm.mjs";
import { llmConfig, sanitize, postChat, parseJsonContent } from "./i18n/translate.mjs";

const args = process.argv.slice(2);
const arg = (name, fallback = undefined) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const flag = (name) => args.includes(name);
const reportPath = arg("--report", path.join(".sync", "review.md"));
const manifestPath = arg("--manifest", path.join(".sync", "changed.txt"));
const allowNetwork = flag("--allow-network");
const applyFixes = flag("--apply-fixes");
const limitFixes = Number(arg("--max-fixes", "20"));

const git = (a) => spawnSync("git", a, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
const upstreamBlob = (file) => {
  const res = git(["show", `upstream/master:${file}`]);
  return res.status === 0 ? res.stdout : null;
};

const changed = fs.existsSync(manifestPath)
  ? fs.readFileSync(manifestPath, "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
  : [];
const problems = [];
const warnings = [];

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
  if (kindOf(file) === "code" && codeFingerprint(upstream) !== codeFingerprint(current)) {
    problems.push({ file, kind: "skeleton", detail: "번역 외 코드가 바뀌었습니다(골격 불일치)" });
  }
  // (2) 패치/코어 파일은 문자열(앵커)을 절대 바꾸지 않는다.
  if (/^lib\/(patches|core)\//.test(file) || file === "lib/core.js") {
    const isAnchor = (x) => x.kind === "string" && /\\n|\n/.test(x.text) && x.text.length > 40;
    const a = spansFor(file, upstream).filter(isAnchor);
    const b = spansFor(file, current).filter(isAnchor);
    if (a.length !== b.length) {
      problems.push({ file, kind: "anchor", detail: `문자열 스팬 수가 다릅니다(업스트림 ${a.length} vs 현재 ${b.length})` });
    } else {
      for (let i = 0; i < a.length; i += 1) {
        if (a[i].text !== b[i].text) {
          problems.push({ file, kind: "anchor", detail: `문자열 스팬 ${i} 이(가) 바뀌었습니다(앵커 번역 금지)` });
          break;
        }
      }
    }
  }
  // (3) 번역 대상이 남았는지(참고용 경고).
  if (hasCjk(current) && !/^docs\/releases\//.test(file)) {
    const leftover = (current.match(/[\u3400-\u4DBF\u4E00-\u9FFF]/g) || []).length;
    warnings.push({ file, note: `남은 중국어 ${leftover}자(앵커/의도된 원문일 수 있음)` });
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
    const tm = loadTm();
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
console.log(`review: files=${changed.length} problems=${problems.length} aiIssues=${aiIssues.length} fixed=${fixed}${aiError ? " aiError=" + aiError : ""}`);
if (problems.length) process.exit(2);
if (aiIssues.length && !applyFixes) process.exit(2);
