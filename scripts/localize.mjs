#!/usr/bin/env node
// 국소 번역 실행기.
//  1) 정책(config.json)에 따라 번역 대상 스팬만 뽑는다(문자열/주석/마크다운 줄).
//  2) TM(i18n/tm.ko.jsonl)에 있는 것은 그대로 재사용한다 — "뼈대 번역".
//  3) TM 에 없는 것만 LLM 에 배치로 물어본다(--allow-network 필요).
//  4) 스팬 위치에 그대로 되돌려 넣는다. 코드 골격·앵커는 이 과정에서 바뀌지 않는다.
//
// 사용:
//   node scripts/localize.mjs --paths lib/instance.js --dry-run
//   node scripts/localize.mjs --manifest .sync/changed.txt --allow-network --write
//   node scripts/localize.mjs --paths docs/README.md --check
import fs from "node:fs";
import path from "node:path";
import { kindOf, applySpans, structuralSkeleton } from "./i18n/spans.mjs";
import { collectTranslatable, loadConfig, policyFor } from "./i18n/policy.mjs";
import { loadTm, saveTm, tmKey } from "./i18n/tm.mjs";
import { llmConfig, translateAll, sanitize } from "./i18n/translate.mjs";

const REPORT_PATH = path.join("i18n", "last-report.json");

function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : true;
}
const flag = (name) => process.argv.includes(name);

async function main() {
  const cfg = loadConfig();
  const dryRun = flag("--dry-run") || !flag("--write");
  const allowNetwork = flag("--allow-network");
  const checkOnly = flag("--check");
  const failOnMiss = flag("--fail-on-miss");
  const writeTm = flag("--write-tm") || (flag("--write") && allowNetwork);

  const manifest = arg("--manifest");
  const listArg = arg("--paths");
  let files = [];
  if (typeof manifest === "string") {
    files = fs.readFileSync(manifest, "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
  } else if (typeof listArg === "string") {
    files = listArg.split(",").map((s) => s.trim()).filter(Boolean);
  } else {
    console.error("usage: localize.mjs --paths a.js,b.md | --manifest file [--dry-run] [--allow-network] [--write] [--check]");
    process.exit(2);
  }

  const tm = loadTm();
  const tmAdditions = [];
  const report = { files: [], totals: { tm: 0, ai: 0, miss: 0, rewritten: 0, review: 0, leftoverCjk: 0 } };
  let pending = []; // {file, span, id}
  const perFile = new Map();

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const policy = policyFor(file, cfg);
    if (policy.skip) { report.files.push({ file, skipped: true }); continue; }
    if (policy.review) {
      const raw = fs.readFileSync(file, "utf8");
      const cjk = (raw.match(/[\u3400-\u4DBF\u4E00-\u9FFF]/g) || []).length;
      report.files.push({ file, review: true, cjk });
      if (cjk) report.totals.review += 1;
      continue;
    }
    const source = fs.readFileSync(file, "utf8");
    const spans = collectTranslatable(file, source, cfg);
    if (!spans.length) { report.files.push({ file, tm: 0, ai: 0, miss: 0 }); continue; }

    const entry = { file, tm: 0, ai: 0, miss: 0, spans };
    for (const span of spans) {
      const ctx = span.kind;
      const key = tmKey(ctx, span.body);
      if (tm.has(key)) { span.ko = tm.get(key); entry.tm += 1; }
      else pending.push({ file, span, ctx, key });
    }
    perFile.set(file, entry);
    report.files.push(entry);
  }

  // AI 는 TM 미스만, 그리고 네트워크 허용 시에만
  let aiError = "";
  if (pending.length && allowNetwork && !checkOnly) {
    const cfgLlm = llmConfig();
    if (!cfgLlm.key) {
      aiError = "LLM_API_KEY is not set — 남은 문자열은 보고서에만 남깁니다";
    } else {
      try {
        const items = pending.map((p, i) => ({ id: i, text: p.span.body }));
        const got = await translateAll(items, cfgLlm);
        pending.forEach((p, i) => {
          const ko = got.get(i);
          if (typeof ko === "string" && ko.trim()) {
            p.span.ko = ko;
            perFile.get(p.file).ai += 1;
            tmAdditions.push({ k: p.key, ctx: p.ctx, src: p.span.body, ko, v: process.env.SYNC_VERSION || "" });
          }
        });
      } catch (error) {
        aiError = sanitize(error?.message ?? String(error));
      }
    }
  }

  // 남은 미스 집계
  let leftover = 0;
  for (const [file, entry] of perFile) {
    const misses = entry.spans.filter((s) => typeof s.ko !== "string");
    entry.miss = misses.length;
    leftover += misses.length;
    report.totals.tm += entry.tm;
    report.totals.ai += entry.ai;
    report.totals.miss += entry.miss;
    if (!entry.ko && !misses.length) continue;

    if (!checkOnly && !dryRun) {
      const source = fs.readFileSync(file, "utf8");
      const replaced = entry.spans
        .filter((s) => typeof s.ko === "string")
        .map((s) => ({ start: s.start, end: s.end, text: s.prefix + s.ko + s.suffix }));
      if (!replaced.length) continue;
      const next = applySpans(source, replaced);
      // 코드 골격 불변 확인: 번역 전후의 영숫자 골격이 같아야 한다(문자열/주석만 바뀐다).
      if (structuralSkeleton(next, kindOf(file)) !== structuralSkeleton(source, kindOf(file))) {
        throw new Error("skeleton changed while rewriting " + file);
      }
      fs.writeFileSync(file, next, "utf8");
      report.totals.rewritten += 1;
    }
  }
  report.totals.leftoverCjk = leftover;
  report.aiError = aiError || undefined;

  if (writeTm && tmAdditions.length) {
    const total = saveTm(tmAdditions);
    report.tmSize = total;
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  const t = report.totals;
  console.log(`localize: files=${report.files.length} tm=${t.tm} ai=${t.ai} miss=${t.miss} rewritten=${t.rewritten} review=${t.review} leftover=${t.leftoverCjk}`);
  if (aiError) console.error("localize: " + aiError);
  if (checkOnly && leftover > 0) {
    console.error(`localize: 번역 대상이 ${leftover}개 남았습니다(정책 기준).`);
    process.exit(1);
  }
  if (failOnMiss && leftover > 0) process.exit(1);
}

main().catch((error) => {
  console.error("localize: " + sanitize(error?.message ?? String(error)));
  process.exit(1);
});
