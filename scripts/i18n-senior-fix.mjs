#!/usr/bin/env node
// 선임 수정 패스(1회). 사람 이슈를 열기 **전에** 권한이 더 넓은 모델이 직접 고친다.
//
// 다루는 실패(자동 번역만으로는 풀리지 않는 것들)
//  1) 업스트림이 호스트 문자열을 바꿔 앵커가 어긋난 패치
//     → `pattern` 을 새 호스트 문자열과 바이트 단위로 맞추고, `replace` 의 한국어 주입 문장을 다시 만든다.
//  2) 모델이 번역 대신 다른 문장을 준 경우(번역 대상에 중국어가 남음)
//     → 검증(한글 포함·중국어 감소·코드펜스 금지·길이 상한)을 통과한 번역만 스팬에 직접 넣는다.
//  3) 게이트 실패(코드·테스트·문서)
//     → 실패 로그를 보고 최소 편집을 받아 적용한다.
//
// 권한 경계: `.github/**`, 잠금 파일, 번들 산출물(client.js), TM 원본은 직접 고치지 않는다.
//   TM 은 API(saveTm)로만 쓰고, `[dsh-purge]` 표식을 지우는 편집은 거부한다.
//
// 사용:
//   node scripts/i18n-senior-fix.mjs --manifest .sync/changed.txt --base <sha> \
//     [--review .sync/review.json] [--log .sync/failure.log] [--report .sync/senior-fix.md] \
//     [--allow-network] [--write] [--attempts 2]
// 종료 코드: 0 = 고쳤고 재검증 통과, 3 = 남음(워크플로가 이슈로 남긴다), 1 = 사용법/환경 오류
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { collectTranslatable, loadConfig } from "./i18n/policy.mjs";
import { patternDrift, lostPayloads, hasHangul } from "./i18n/anchors.mjs";
import { saveTm, tmKey } from "./i18n/tm.mjs";
import { llmConfig, sanitize, postChat, parseJsonContent } from "./i18n/translate.mjs";

const OUT = path.join(".sync");
const MARKER = "[dsh-purge]";

/** 직접 고칠 수 없는 경로. 선임 패스도 여기만은 건드리지 않는다. */
export const SENIOR_FORBIDDEN = [
  /^\.github\//,
  /^node_modules\//,
  /^package-lock\.json$/,
  /^client\.js$/,
  /^packages\/purge-panel\/client\.js$/,
  /^i18n\/tm\.ko\.jsonl$/,
  /^i18n\/last-report\.json$/,
  /^\.sync\//,
];

const cjkCount = (text) => (String(text ?? "").match(/[\u3400-\u4DBF\u4E00-\u9FFF]/g) || []).length;

/**
 * 번역 결과가 "번역" 인지 검사한다(거부 문구 판정이 아니라 형태 판정이다).
 *  - 원문과 같으면 번역이 아니다.
 *  - 한글이 없으면 번역이 아니다(중국어 그대로/영어 설명문).
 *  - 중국어가 줄지 않으면 번역이 아니다.
 *  - 코드펜스/과도한 길이는 설명문으로 본다.
 */
export function looksTranslated(src, ko) {
  const a = String(src ?? "");
  const b = String(ko ?? "");
  if (!a.trim() || !b.trim()) return false;
  if (a === b) return false;
  if (!hasHangul(b)) return false;
  if (cjkCount(b) >= cjkCount(a) && cjkCount(a) > 0) return false;
  if (/```/.test(b)) return false;
  if (b.length > Math.max(160, a.length * 3 + 80)) return false;
  return true;
}

/** 문자열 스팬 편집이면 (원문, 번역) 쌍을 뽑는다. TM 에 쌓아 다음 동기화가 재사용한다. */
export function derivePair(search, replace) {
  const s = String(search ?? "");
  const r = String(replace ?? "");
  const q = s[0];
  if (q !== '"' && q !== "'" && q !== "`") return null;
  if (s.length < 3 || r.length < 3 || r[0] !== q || !s.endsWith(q) || !r.endsWith(q)) return null;
  return { src: s.slice(1, -1), ko: r.slice(1, -1) };
}

/**
 * 모델이 준 편집을 적용한다. 정확히 한 번 일치할 때만 바꾸고, 표식을 지우는 편집은 거부한다.
 * @returns {{applied:string[], rejected:{file:string,reason:string}[], pairs:{file:string,src:string,ko:string}[]}}
 */
export function applySeniorEdits(edits, root = process.cwd()) {
  const applied = [];
  const rejected = [];
  const pairs = [];
  for (const edit of Array.isArray(edits) ? edits : []) {
    const file = String(edit?.file ?? "");
    const search = String(edit?.search ?? "");
    const replace = String(edit?.replace ?? "");
    if (!file || !search) { rejected.push({ file, reason: "빈 편집" }); continue; }
    if (SENIOR_FORBIDDEN.some((re) => re.test(file))) { rejected.push({ file, reason: "보호 경로" }); continue; }
    if (search.includes(MARKER) && !replace.includes(MARKER)) {
      rejected.push({ file, reason: "표식 제거" });
      continue;
    }
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) { rejected.push({ file, reason: "파일 없음" }); continue; }
    const before = fs.readFileSync(abs, "utf8");
    const hits = before.split(search).length - 1;
    if (hits !== 1) { rejected.push({ file, reason: `일치 ${hits}회(1회여야 함)` }); continue; }
    fs.writeFileSync(abs, before.replace(search, replace), "utf8");
    applied.push(file);
    const pair = derivePair(search, replace);
    if (pair && looksTranslated(pair.src, pair.ko)) pairs.push({ file, ...pair });
  }
  return { applied: [...new Set(applied)], rejected, pairs };
}

const git = (a) => spawnSync("git", a, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
const blobAt = (ref, file) => {
  if (!ref) return null;
  const res = git(["show", `${ref}:${file}`]);
  return res.status === 0 ? res.stdout : null;
};
const upstreamBlob = (file) => blobAt("upstream/master", file);
const snippet = (text, max = 500) => String(text ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const tail = (text, maxLines = 200) =>
  String(text ?? "").split("\n").filter((l) => l.trim()).slice(-maxLines).join("\n");

/**
 * 실패 목록을 모은다. 검토 JSON 이 있으면 그것을 우선 쓰고, 없으면 직접 계산한다.
 * @returns {{blocking:boolean, anchor:object[], leftover:object[], problems:object[], gateLog:string, files:string[]}}
 */
export function collectFindings({ manifestPath, baseRef = "", reviewPath, logPath, root = process.cwd(), cfg = loadConfig(), blobs = null } = {}) {
  const manifestAbs = manifestPath ? (path.isAbsolute(manifestPath) ? manifestPath : path.join(root, manifestPath)) : "";
  const files = manifestAbs && fs.existsSync(manifestAbs) && fs.statSync(manifestAbs).isFile()
    ? fs.readFileSync(manifestAbs, "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  const problems = [];
  const anchor = [];
  const leftover = [];
  let gateLog = "";
  const upstreamOf = (file) => (blobs?.upstream?.[file] ?? upstreamBlob(file));
  const previousOf = (file) => (blobs?.previous?.[file] ?? blobAt(baseRef, file));
  const fromRoot = (p) => (p ? (path.isAbsolute(p) ? p : path.join(root, p)) : "");

  const logAbs = fromRoot(logPath);
  if (logAbs && fs.existsSync(logAbs)) gateLog = tail(fs.readFileSync(logAbs, "utf8"));

  let reviewed = null;
  const reviewAbs = fromRoot(reviewPath);
  if (reviewAbs && fs.existsSync(reviewAbs)) {
    try { reviewed = JSON.parse(fs.readFileSync(reviewAbs, "utf8")); } catch { reviewed = null; }
  }

  if (reviewed && Array.isArray(reviewed.problems)) {
    for (const p of reviewed.problems) {
      problems.push(p);
      if (p.kind === "anchor" || p.kind === "lost-localization" || p.kind === "skeleton") anchor.push(p);
      if (p.kind === "leftover") leftover.push(p);
    }
  } else {
    // 검토 JSON 이 없으면 같은 규칙으로 직접 계산한다(독립 실행/테스트 경로).
    for (const file of files) {
      const abs = path.join(root, file);
      if (!fs.existsSync(abs)) continue;
      const current = fs.readFileSync(abs, "utf8");
      const upstream = upstreamOf(file);
      if (upstream !== null && (/^lib\/(patches|core)\//.test(file) || file === "lib/core.js")) {
        for (const row of patternDrift(upstream, current).drift) {
          anchor.push({ file, kind: "anchor", detail: `pattern ${row.index} 불일치`, upstream: snippet(row.upstream), current: snippet(row.current) });
        }
        const previous = previousOf(file);
        if (previous !== null) {
          for (const row of lostPayloads(previous, current).lost) {
            anchor.push({
              file, kind: "lost-localization", detail: `문자열 ${row.index} 한국어 소실`,
              previous: snippet(row.previous), current: snippet(row.current),
            });
          }
        }
      }
      const spans = collectTranslatable(file, current, cfg);
      if (spans.length) {
        leftover.push({
          file, kind: "leftover", detail: `번역 대상 ${spans.length}개가 아직 중국어입니다`,
          samples: spans.slice(0, 10).map((s) => ({ kind: s.kind, body: snippet(s.body, 300) })),
        });
      }
    }
    problems.push(...anchor, ...leftover);
  }

  return {
    blocking: problems.length > 0 || Boolean(gateLog),
    anchor,
    leftover,
    problems,
    gateLog,
    files,
  };
}

/** 모델에 보내는 작업 명세. 앵커와 번역을 함께 다루되 규칙은 분리해 적는다. */
export function buildTask(findings) {
  return {
    repo: "dsh-purge-community — Korean localization fork of dsh-purge (DSH host patch plugin)",
    why_you: "The normal translation pass could not fix this. You have wider scope: patch anchors, patch tables, tests and docs.",
    rules: [
      "Return JSON only: {\"edits\":[{\"file\":\"<repo-relative>\",\"search\":\"<exact unique text>\",\"replace\":\"<new text>\",\"why\":\"<short>\"}],\"reason\":\"<short>\"}",
      "search must occur exactly once in the file. Keep every edit minimal and surgical.",
      "HOST ANCHORS: `pattern` strings must stay byte-identical to the upstream host source. Never translate, reformat or re-indent them. If upstream changed the host string, make `pattern` match the new host string exactly as given in `upstream`.",
      "INJECTED PAYLOADS: strings under `replace`/`markers` are our own text. They must stay Korean (polite 합니다체), keep the [dsh-purge] marker, and keep ${...}/{{model}} placeholders and identifiers verbatim. When upstream replaced a Korean payload with Chinese, rewrite the Chinese payload into Korean that says the same thing.",
      "UNTRANSLATED STRINGS: when a translatable string/comment/markdown line is still Chinese, translate it to Korean. Do not return the source unchanged, do not answer with an explanation, do not wrap output in code fences.",
      "Never edit .github/**, package-lock.json, client.js, packages/purge-panel/client.js, i18n/tm.ko.jsonl or .sync/**.",
      "Do not remove or weaken tests to make them pass; fix the code or the localized message instead.",
    ],
    anchor_findings: findings.anchor.slice(0, 12),
    untranslated_findings: findings.leftover.slice(0, 12),
    other_problems: findings.problems.filter((p) => !findings.anchor.includes(p) && !findings.leftover.includes(p)).slice(0, 8),
    failing_gate_log: findings.gateLog,
  };
}

async function askModel(findings, cfg, feedback = "") {
  const task = buildTask(findings);
  if (feedback) task.previous_attempt_failed = feedback;
  const payload = await postChat(cfg, () => ({
    model: cfg.model,
    messages: [
      {
        role: "system",
        content:
          "You are the senior reviewer of a localization pipeline. You repair patch anchors, restore Korean injection payloads, " +
          "and translate strings the normal pass missed. You emit exact text edits as JSON and nothing else.",
      },
      { role: "user", content: JSON.stringify(task) },
    ],
  }));
  const parsed = parseJsonContent(payload?.choices?.[0]?.message?.content ?? "{}");
  return {
    edits: Array.isArray(parsed.edits) ? parsed.edits : [],
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
  };
}

const run = (cmd, a) => spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });

/** 편집한 JS 파일의 문법부터 확인한다(전체 게이트보다 빠른 피드백). */
function syntaxCheck(files) {
  const bad = [];
  for (const file of files) {
    if (!/\.(mjs|cjs|js)$/i.test(file) || !fs.existsSync(file)) continue;
    const res = run(process.execPath, ["--check", file]);
    if (res.status !== 0) bad.push({ file, out: tail((res.stdout || "") + (res.stderr || ""), 20) });
  }
  return bad;
}

/** 검토 + 게이트를 다시 돌린다. */
function verify({ manifestPath, baseRef, allowNetwork }) {
  const reviewArgs = ["scripts/i18n-review.mjs", "--manifest", manifestPath, "--strict-leftover", "--json", path.join(OUT, "review.json"), "--report", path.join(OUT, "review.md")];
  if (baseRef) reviewArgs.push("--base", baseRef);
  if (allowNetwork) reviewArgs.push("--allow-network", "--apply-fixes");
  const review = run(process.execPath, reviewArgs);
  const gates = [];
  const one = (name, cmd, a) => {
    const res = run(cmd, a);
    gates.push({ name, status: res.status, out: res.status === 0 ? "" : tail((res.stdout || "") + (res.stderr || ""), 40) });
    return res.status === 0;
  };
  one("build", process.execPath, ["packages/purge-panel/scripts/build.mjs"]);
  one("build-community", process.execPath, ["packages/purge-panel/scripts/build.mjs", "--community"]);
  one("check:docs", process.execPath, ["scripts/check-docs.mjs"]);
  one("bundle --check", process.execPath, ["packages/purge-panel/scripts/build.mjs", "--check"]);
  one("community --check", process.execPath, ["packages/purge-panel/scripts/build.mjs", "--community", "--check"]);
  one("npm test", "npm", ["test"]);
  const ok = review.status === 0 && gates.every((g) => g.status === 0);
  return { ok, reviewStatus: review.status, reviewOut: tail((review.stdout || "") + (review.stderr || ""), 40), gates };
}

function commit(message, body = "") {
  const dirty = git(["status", "--porcelain"]).stdout.trim();
  if (!dirty) return false;
  git(["add", "-A"]);
  const args = ["commit", "-q", "-m", message];
  if (body) args.push("-m", body);
  return git(args).status === 0;
}

function writeReport(lines, reportPath = path.join(OUT, "senior-fix.md")) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, ["# 선임 수정 패스", "", ...lines].join("\n") + "\n", "utf8");
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (n, d = undefined) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
  const flag = (n) => args.includes(n);
  const manifestPath = arg("--manifest", path.join(OUT, "changed.txt"));
  const baseRef = arg("--base", "");
  const reviewPath = arg("--review", path.join(OUT, "review.json"));
  const logPath = arg("--log", path.join(OUT, "failure.log"));
  const reportPath = arg("--report", path.join(OUT, "senior-fix.md"));
  const allowNetwork = flag("--allow-network");
  const write = flag("--write");
  const attempts = Math.max(1, Number(arg("--attempts", "2")));

  const rows = [];
  let findings = collectFindings({ manifestPath, baseRef, reviewPath, logPath });
  if (!findings.blocking) {
    rows.push("- 남은 실패 없음 — 선임 패스 불필요");
    writeReport(rows, reportPath);
    console.log("senior-fix: nothing to do");
    return 0;
  }
  rows.push(`- 앵커 문제: ${findings.anchor.length}`, `- 미번역: ${findings.leftover.length}`, `- 기타 문제: ${findings.problems.length - findings.anchor.length - findings.leftover.length}`);
  rows.push(`- 게이트 로그: ${findings.gateLog ? "있음" : "없음"}`);

  const cfg = llmConfig();
  if (!allowNetwork || !cfg.key) {
    rows.push("- AI 비활성(키 없음/네트워크 미허용) — 고치지 못했습니다");
    writeReport(rows, reportPath);
    console.log("senior-fix: skipped (no key or no network)");
    return 3;
  }

  let feedback = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    rows.push("", `## 시도 ${attempt}`);
    let answer;
    try {
      answer = await askModel(findings, cfg, feedback);
    } catch (error) {
      rows.push(`- AI 호출 실패: ${sanitize(error?.message ?? String(error), cfg.key)}`);
      break;
    }
    rows.push(`- 제안 편집: ${answer.edits.length}건 — ${sanitize(answer.reason, cfg.key).slice(0, 300)}`);
    const { applied, rejected, pairs } = applySeniorEdits(answer.edits);
    rows.push(`- 적용: ${applied.length}건${applied.length ? " (" + [...new Set(applied)].slice(0, 8).join(", ") + ")" : ""}`);
    for (const r of rejected.slice(0, 10)) rows.push(`  - 거부: ${r.file} — ${r.reason}`);
    if (pairs.length) {
      const rowsTm = pairs.map((p) => ({ k: tmKey("string", p.src), ctx: "string", src: p.src, ko: p.ko, v: "senior" }));
      saveTm(rowsTm);
      rows.push(`- TM 반영: ${rowsTm.length}건`);
    }
    if (!applied.length) {
      feedback = "The edits were empty or rejected. Return edits with search text that occurs exactly once in the file.";
      rows.push("- 적용된 편집이 없습니다");
      continue;
    }
    const bad = syntaxCheck(applied);
    if (bad.length) {
      feedback = "These files no longer parse: " + bad.map((b) => b.file).join(", ") + "\n" + bad[0].out;
      rows.push(`- 문법 오류: ${bad.map((b) => b.file).join(", ")}`);
      continue;
    }
    if (write) commit(`fix(i18n): senior review pass for the upstream delta (attempt ${attempt})`,
      "Restores host anchors and Korean injection payloads, and translates strings the normal pass missed.");
    const verdict = verify({ manifestPath, baseRef, allowNetwork });
    rows.push(`- 재검증: ${verdict.ok ? "통과" : "실패"}`);
    for (const g of verdict.gates) rows.push(`  - ${g.name}: ${g.status === 0 ? "ok" : "FAIL"}`);
    if (verdict.ok) {
      if (write) commit("fix(i18n): rebuild bundles after the senior review pass", "Bundles regenerated by the senior pass.");
      writeReport(rows, reportPath);
      console.log("senior-fix: fixed and verified");
      return 0;
    }
    feedback = [
      "The re-review still reports problems.",
      "review: " + verdict.reviewOut,
      ...verdict.gates.filter((g) => g.status !== 0).map((g) => `gate ${g.name}:\n${g.out}`),
    ].join("\n\n");
    findings = collectFindings({ manifestPath, baseRef, reviewPath, logPath });
    if (!findings.blocking) findings = { ...findings, blocking: true, problems: [{ file: "(gate)", kind: "gate", detail: "게이트 실패" }], gateLog: feedback };
  }

  writeReport(rows, reportPath);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "failure.md"), ["# 선임 패스 이후에도 남은 실패", "", ...rows].join("\n") + "\n", "utf8");
  console.log("senior-fix: unresolved");
  return 3;
}

if (process.argv[1] && process.argv[1].endsWith("i18n-senior-fix.mjs")) {
  main().then((code) => process.exit(code)).catch((error) => {
    console.error("senior-fix: " + sanitize(error?.message ?? String(error)));
    process.exit(3);
  });
}
