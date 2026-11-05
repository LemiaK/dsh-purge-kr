#!/usr/bin/env node
// 자동 복구기: 게이트 실패 로그를 모델에 보여 주고, 최소 편집(search/replace)만 받아 적용한 뒤 게이트를 다시 돌린다.
//  - 번역·코드·테스트·문서 모두 대상(단, 워크플로/잠금 파일/번들 산출물/시크릿은 금지).
//  - 편집은 "정확히 한 번" 일치해야 적용한다(모호하면 거부).
//  - 시도 횟수를 넘기거나 복구 실패면 exit 3 → 워크플로가 이슈로 남긴다.
//
// 사용: node scripts/i18n-repair.mjs --log .sync/failure.log [--attempts 2] [--allow-network] [--write]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { llmConfig, sanitize } from "./i18n/translate.mjs";

const args = process.argv.slice(2);
const arg = (n, d = undefined) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const flag = (n) => args.includes(n);
const logPath = arg("--log", path.join(".sync", "failure.log"));
const attempts = Number(arg("--attempts", "2"));
const allowNetwork = flag("--allow-network");
const write = flag("--write");
const reportPath = arg("--report", path.join(".sync", "repair.md"));
const OUT = path.join(".sync");

const FORBIDDEN = [/^\.github\//, /^node_modules\//, /^package-lock\.json$/, /^client\.js$/, /^packages\/purge-panel\/client\.js$/, /^i18n\/tm\.ko\.jsonl$/];

const run = (cmd, a) => spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const gates = () => {
  const results = [];
  const one = (name, cmd, a) => {
    const r = run(cmd, a);
    results.push({ name, status: r.status, out: (r.stdout || "") + (r.stderr || "") });
    return r.status === 0;
  };
  one("build", "node", ["packages/purge-panel/scripts/build.mjs"]);
  one("build-community", "node", ["packages/purge-panel/scripts/build.mjs", "--community"]);
  one("check:docs", "node", ["scripts/check-docs.mjs"]);
  one("bundle --check", "node", ["packages/purge-panel/scripts/build.mjs", "--check"]);
  one("community --check", "node", ["packages/purge-panel/scripts/build.mjs", "--community", "--check"]);
  one("npm test", "npm", ["test"]);
  const failed = results.filter((r) => r.status !== 0);
  return { ok: failed.length === 0, results, failed };
};

function trimLog(text, maxLines = 220) {
  const lines = String(text).split("\n").filter((l) => l.trim());
  const tail = lines.slice(-maxLines);
  return tail.map((l) => l.replace(/\d{4}-\d\d-\d\dT[\d:.]+Z?/g, "<ts>")).join("\n");
}

/** 모델이 준 편집을 적용한다. 정확히 한 번 일치할 때만 바꾼다. */
export function applyEdits(edits, root = process.cwd()) {
  const applied = [];
  const rejected = [];
  for (const edit of edits) {
    const file = String(edit?.file ?? "");
    const search = String(edit?.search ?? "");
    const replace = String(edit?.replace ?? "");
    if (!file || !search) { rejected.push({ file, reason: "빈 편집" }); continue; }
    if (FORBIDDEN.some((re) => re.test(file))) { rejected.push({ file, reason: "보호 경로" }); continue; }
    const abs = path.join(root, file);
    if (!fs.existsSync(abs)) { rejected.push({ file, reason: "파일 없음" }); continue; }
    const before = fs.readFileSync(abs, "utf8");
    const hits = before.split(search).length - 1;
    if (hits !== 1) { rejected.push({ file, reason: `일치 ${hits}회(1회여야 함)` }); continue; }
    fs.writeFileSync(abs, before.replace(search, replace), "utf8");
    applied.push(file);
  }
  return { applied: [...new Set(applied)], rejected };
}

function commitIfDirty(message) {
  const dirty = run("git", ["status", "--porcelain"]).stdout.trim();
  if (!dirty) return false;
  run("git", ["add", "-A"]);
  const res = run("git", ["commit", "-q", "-m", message, "-m", "Applied from the failing gate logs. Protected paths, lockfiles and bundles are excluded."]);
  return res.status === 0;
}

function writeReport(rows) {
  fs.mkdirSync(OUT, { recursive: true });
  const body = ["# 자동 복구 시도", "", ...rows].join("\n") + "\n";
  fs.writeFileSync(reportPath, body, "utf8");
}

async function askModel(logText, gateName, cfg) {
  const prompt = {
    repo: "dsh-purge-community (Korean localization fork of dsh-purge)",
    failing_gate: gateName,
    rules: [
      "Fix ONLY what makes the failing gate pass. Keep the Korean localization and the English-only README.",
      "Never edit .github/**, package-lock.json, client.js, packages/purge-panel/client.js or i18n/tm.ko.jsonl.",
      "Never touch host patch anchors (pattern/markers/replace snippets) — they must stay byte-identical to upstream.",
      "Prefer test expectation updates when a localized message changed; prefer code fixes when behavior is wrong.",
      "Return JSON: {\"edits\":[{\"file\":\"<repo-relative>\",\"search\":\"<exact unique text>\",\"replace\":\"<new text>\"}],\"reason\":\"...\"}",
      "search must occur exactly once in the file. Keep edits minimal.",
    ],
    log: trimLog(logText),
  };
  const res = await fetch(cfg.baseUrl + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + cfg.key },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0,
      ...(cfg.reasoningEffort ? { reasoning_effort: cfg.reasoningEffort } : {}),
      messages: [
        { role: "system", content: "You repair a failing CI job by emitting minimal, exact text edits. Output JSON only." },
        { role: "user", content: JSON.stringify(prompt) },
      ],
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(cfg.timeoutMs),
  });
  if (!res.ok) throw new Error("repair http " + res.status);
  const payload = JSON.parse((await res.json())?.choices?.[0]?.message?.content ?? "{}");
  return { edits: Array.isArray(payload.edits) ? payload.edits : [], reason: payload.reason ?? "" };
}

async function main() {
  const cfg = llmConfig();
  const rows = [];
  const initial = gates();
  if (initial.ok) {
    rows.push("- 처음부터 게이트 통과 — 복구 불필요");
    writeReport(rows);
    console.log("repair: nothing to do");
    return 0;
  }
  let failure = initial;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const logText = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "";
    const combined = [logText, ...failure.failed.map((f) => `### ${f.name}\n${f.out}`)].join("\n");
    rows.push(`## 시도 ${attempt}`, `- 실패 게이트: ${failure.failed.map((f) => f.name).join(", ")}`);
    if (!allowNetwork || !cfg.key) {
      rows.push("- AI 복구 비활성(키 없음/네트워크 미허용) — 로그만 보고합니다");
      break;
    }
    let edits = [];
    try {
      const answer = await askModel(combined, failure.failed[0]?.name ?? "unknown", cfg);
      edits = answer.edits;
      rows.push(`- 제안 편집: ${edits.length}건 — ${sanitize(answer.reason).slice(0, 200)}`);
    } catch (error) {
      rows.push(`- AI 호출 실패: ${sanitize(error?.message ?? String(error))}`);
      break;
    }
    const { applied, rejected } = applyEdits(edits);
    rows.push(`- 적용: ${applied.length}건 ${applied.length ? "(" + applied.slice(0, 6).join(", ") + ")" : ""}`);
    for (const r of rejected.slice(0, 8)) rows.push(`  - 거부: ${r.file} — ${r.reason}`);
    if (!applied.length) break;
    if (write) commitIfDirty(`fix(ci): apply AI repair (attempt ${attempt})`);
    const next = gates();
    failure = next;
    rows.push(`- 재검증: ${next.ok ? "통과" : "실패(" + next.failed.map((f) => f.name).join(", ") + ")"}`);
    if (next.ok) {
      writeReport(rows);
      console.log("repair: fixed after attempt " + attempt);
      return 0;
    }
  }
  writeReport(rows);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "failure.md"), ["# 남은 실패", "", ...rows].join("\n") + "\n", "utf8");
  console.log("repair: unresolved");
  return 3;
}

if (process.argv[1] && process.argv[1].endsWith("i18n-repair.mjs")) {
  main().then((code) => process.exit(code)).catch((error) => {
    console.error("repair: " + sanitize(error?.message ?? String(error)));
    process.exit(3);
  });
}
