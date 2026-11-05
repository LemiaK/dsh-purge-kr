#!/usr/bin/env node
// 호스트 앵커 복원기.
// 패치 표의 `pattern`/`markers`/`replace` 는 호스트 소스와 짝을 이루는 문자열이라 번역하면 안 된다.
// 실수로 번역된 구간을 업스트림 원문으로 되돌린다.
//
// 복원 대상
//   1) 여러 줄 문자열 스팬(호스트 스니펫): 순서·개수가 같고 내용만 다르면 업스트림 텍스트로 교체
//   2) pattern/markers/replace 줄: 양쪽의 "한글·한자를 지운 골격"이 같고 업스트림에 한자가 있으면 업스트림 줄로 복원
//
// 사용: node scripts/i18n-restore-anchors.mjs --manifest .sync/changed.txt [--write]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scanCode, applySpans } from "./i18n/spans.mjs";

const args = process.argv.slice(2);
const arg = (n, d = undefined) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const write = args.includes("--write");
const manifest = arg("--manifest", path.join(".sync", "changed.txt"));
const git = (a) => spawnSync("git", a, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
const cjk = (t) => /[\u3400-\u4DBF\u4E00-\u9FFF]/.test(t);
const bare = (t) => t.replace(/[\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7A3]/g, "").replace(/\s+/g, " ").trim();

const files = fs.existsSync(manifest)
  ? fs.readFileSync(manifest, "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
  : [];
const targets = files.filter((f) => /^lib\/(patches|core)\//.test(f) || f === "lib/core.js");

let restoredSpans = 0;
let restoredLines = 0;
const touched = [];

for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  const up = git(["show", `upstream/master:${file}`]);
  if (up.status !== 0) continue;
  const upstream = up.stdout;
  const current = fs.readFileSync(file, "utf8");
  if (upstream === current) continue;

  // 1) 여러 줄 문자열 스팬 복원
  const pick = (text) => scanCode(text).filter((s) => s.kind === "string" && /\n/.test(s.text) && s.text.length > 40);
  const A = pick(upstream);
  const B = pick(current);
  let next = current;
  if (A.length === B.length) {
    const repl = [];
    for (let i = 0; i < A.length; i += 1) {
      if (A[i].text !== B[i].text) {
        repl.push({ start: B[i].start, end: B[i].end, text: A[i].text });
        restoredSpans += 1;
      }
    }
    if (repl.length) next = applySpans(current, repl);
  }

  // 2) pattern/markers/replace 줄 복원
  const aLines = next.split("\n");
  const bLines = upstream.split("\n");
  if (aLines.length === bLines.length) {
    let changed = false;
    for (let i = 0; i < aLines.length; i += 1) {
      if (aLines[i] === bLines[i]) continue;
      const key = /(pattern|markers?|replace(ments)?)\s*[:\[]/.test(bLines[i]) || /(pattern|markers?|replace(ments)?)\s*[:\[]/.test(aLines[i]);
      if (!key) continue;
      if (!cjk(bLines[i])) continue;
      if (bare(aLines[i]) !== bare(bLines[i])) continue; // 골격이 다르면 진짜 코드 차이 — 손대지 않는다
      aLines[i] = bLines[i];
      restoredLines += 1;
      changed = true;
    }
    if (changed) next = aLines.join("\n");
  }

  if (next !== current) {
    touched.push(file);
    if (write) fs.writeFileSync(file, next, "utf8");
  }
}

console.log(`restore-anchors: files=${targets.length} spans=${restoredSpans} lines=${restoredLines} changed=${touched.length}${write ? "" : " (dry-run)"}`);
for (const f of touched) console.log("  " + f);
if (!write && touched.length) process.exit(1);
