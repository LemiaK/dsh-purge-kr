#!/usr/bin/env node
// TM 시드 생성기: 과거(혹은 직전) 업스트림 트리와 우리 번역 트리를 스팬 단위로 정렬해
// "중국어 원문 → 한국어" 쌍을 뽑는다. 이렇게 만든 TM 이 이후 동기화의 뼈대가 된다.
//
// 사용: node scripts/i18n-build-tm.mjs --ref <upstream-commit-or-tag> [--paths a.js,b.md] [--write]
//   --ref 없으면 1.6.78 병합 지점(1fd6768)과 현재 트리를 비교한다.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { scanCode, scanMarkdown, hasCjk, kindOf, skeleton } from "./i18n/spans.mjs";
import { saveTm, tmKey, TM_PATH } from "./i18n/tm.mjs";

const args = process.argv.slice(2);
const arg = (name, fallback = undefined) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const write = args.includes("--write");
const ref = arg("--ref", "1fd6768");
const pathArg = arg("--paths");

const git = (a) => spawnSync("git", a, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });

function spansOf(file, text) {
  const kind = kindOf(file);
  if (kind === "code") return scanCode(text);
  if (kind === "markdown") return scanMarkdown(text);
  return [];
}
function bodyOf(span) {
  if (span.kind !== "string") return span.text;
  const quote = span.text[0];
  const closed = span.text.length > 1 && span.text.endsWith(quote);
  return span.text.slice(1, closed ? -1 : undefined);
}
const hangul = (t) => /[\uAC00-\uD7A3]/.test(t);

const listed = pathArg
  ? pathArg.split(",").map((s) => s.trim()).filter(Boolean)
  : git(["ls-tree", "-r", "--name-only", "HEAD"]).stdout.split("\n").filter(Boolean);

const entries = [];
const perFile = [];
for (const file of listed) {
  if (!fs.existsSync(file)) continue;
  const kind = kindOf(file);
  if (kind === "other" || kind === "data") continue;
  if (/^(docs\/releases|docs\/upstream|test\/fixtures)\//.test(file)) continue;
  const show = git(["show", `${ref}:${file}`]);
  if (show.status !== 0) continue;
  const upstreamText = show.stdout;
  const currentText = fs.readFileSync(file, "utf8");
  const a = spansOf(file, upstreamText).map((s) => ({ ...s, body: bodyOf(s) }));
  const b = spansOf(file, currentText).map((s) => ({ ...s, body: bodyOf(s) }));
  if (a.length !== b.length) { perFile.push({ file, aligned: false, upstream: a.length, current: b.length }); continue; }
  let pairs = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (!hasCjk(a[i].body) || !hangul(b[i].body)) continue;
    if (skeleton(a[i].body) !== skeleton(b[i].body)) continue;
    const ctx = a[i].kind;
    entries.push({ k: tmKey(ctx, a[i].body), ctx, src: a[i].body, ko: b[i].body, v: "seed:" + ref.slice(0, 7) });
    pairs += 1;
  }
  perFile.push({ file, aligned: true, upstream: a.length, current: b.length, pairs });
}

const total = entries.length;
const dup = new Map();
for (const e of entries) dup.set(e.k, (dup.get(e.k) || 0) + 1);
const unique = [...new Map(entries.map((e) => [e.k, e])).values()];

console.log(`seed: ref=${ref} files=${perFile.length} pairs=${total} unique=${unique.length} conflicting=${[...dup.values()].filter((n) => n > 1).length}`);
for (const row of perFile.filter((r) => !r.aligned).slice(0, 10)) console.log("  misaligned:", row.file, row.upstream, "vs", row.current);
if (write) {
  const size = saveTm(unique, TM_PATH);
  console.log(`seed: wrote ${size} entries to ${TM_PATH}`);
}
if (!write) console.log("seed: dry-run (--write 로 저장)");
void path;
