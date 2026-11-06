// 선임 수정 패스(1회)의 안전장치 테스트.
//  - 번역 결과 검증(번역 대신 다른 문장을 준 경우를 걸러낸다)
//  - 앵커 드리프트/주입 문장 소실 판독
//  - 편집 적용 범위(보호 경로·표식 제거 거부, TM 쌍 추출)
//  - 실패 목록 수집과 모델 작업 명세
//  - 키가 없으면 아무것도 고치지 않고 exit 3
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  looksTranslated,
  derivePair,
  applySeniorEdits,
  collectFindings,
  buildTask,
  SENIOR_FORBIDDEN,
} from "../scripts/i18n-senior-fix.mjs";
import { classifySpans, patternDrift, lostPayloads } from "../scripts/i18n/anchors.mjs";

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("a translation is accepted only when it is really Korean", () => {
  assert.equal(looksTranslated("应用补丁", "패치를 적용합니다"), true);
  assert.equal(looksTranslated("应用补丁", "应用补丁"), false, "원문 그대로는 번역이 아니다");
  assert.equal(looksTranslated("应用补丁", "Apply the patch"), false, "한글이 없으면 번역이 아니다");
  assert.equal(looksTranslated("应用补丁", "적용합니다 应用补丁"), false, "중국어가 줄지 않으면 번역이 아니다");
  assert.equal(looksTranslated("应用补丁", "```json\n{\"ko\":\"적용\"}\n```"), false, "코드펜스는 설명문이다");
  assert.equal(looksTranslated("应用", "적용 " + "설명".repeat(400)), false, "지나치게 길면 설명문이다");
  assert.equal(looksTranslated("", "적용"), false, "원문이 비면 번역 대상이 아니다");
});

test("a string edit yields a translation-memory pair", () => {
  assert.deepEqual(derivePair('"应用补丁"', '"패치를 적용합니다"'), { src: "应用补丁", ko: "패치를 적용합니다" });
  assert.deepEqual(derivePair("`应用补丁`", "`패치를 적용합니다`"), { src: "应用补丁", ko: "패치를 적용합니다" });
  assert.equal(derivePair("const a = 1;", "const a = 2;"), null, "문자열 스팬이 아니면 쌍이 아니다");
  assert.equal(derivePair('"应用"', "'적용'"), null, "따옴표가 다르면 쌍이 아니다");
});

test("the senior pass applies exact edits and refuses protected paths or marker removal", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "senior-"));
  fs.mkdirSync(path.join(dir, "lib", "patches"), { recursive: true });
  fs.mkdirSync(path.join(dir, ".github"), { recursive: true });
  fs.mkdirSync(path.join(dir, "i18n"), { recursive: true });
  const patchFile = path.join(dir, "lib", "patches", "prompt.mjs");
  fs.writeFileSync(
    patchFile,
    [
      "export const P = {",
      '  id: 1,',
      '  replacements: [{ pattern: "old host line", replace: "[dsh-purge] 应用补丁" }],',
      "};",
      'export const msg = "应用补丁";',
      "",
    ].join("\n"),
    "utf8",
  );
  fs.writeFileSync(path.join(dir, ".github", "w.yml"), "on: push\n", "utf8");
  fs.writeFileSync(path.join(dir, "i18n", "tm.ko.jsonl"), "{}\n", "utf8");

  const { applied, rejected, pairs } = applySeniorEdits(
    [
      { file: "lib/patches/prompt.mjs", search: '"old host line"', replace: '"new host line"' },              // 앵커 교체 → 적용
      { file: "lib/patches/prompt.mjs", search: '"应用补丁"', replace: '"패치를 적용합니다"' },                 // 번역 → 적용 + TM 쌍
      { file: "lib/patches/prompt.mjs", search: "id: 1,", replace: "id: 2," },                               // 정확히 1회 → 적용
      { file: "lib/patches/prompt.mjs", search: "e", replace: "E" },                                        // 여러 번 → 거부
      { file: "lib/patches/prompt.mjs", search: "[dsh-purge]", replace: "" },                                 // 표식 제거 → 거부
      { file: ".github/w.yml", search: "on: push", replace: "on: pull_request" },                             // 보호 경로 → 거부
      { file: "i18n/tm.ko.jsonl", search: "{}", replace: "{\"k\":\"x\"}" },                                   // TM 직접 편집 → 거부
    ],
    dir,
  );

  assert.deepEqual(applied, ["lib/patches/prompt.mjs"]);
  assert.equal(rejected.length, 4);
  assert.ok(rejected.some((r) => r.reason === "표식 제거"));
  assert.ok(rejected.some((r) => r.reason === "보호 경로"));
  assert.deepEqual(pairs.map((p) => p.src), ["应用补丁"]);
  const text = fs.readFileSync(patchFile, "utf8");
  assert.match(text, /"new host line"/);
  assert.match(text, /패치를 적용합니다/);
  assert.match(text, /\[dsh-purge\]/);
  assert.equal(fs.readFileSync(path.join(dir, ".github", "w.yml"), "utf8"), "on: push\n");
  assert.equal(fs.readFileSync(path.join(dir, "i18n", "tm.ko.jsonl"), "utf8"), "{}\n");
  assert.equal(SENIOR_FORBIDDEN.some((re) => re.test("lib/patches/prompt.mjs")), false, "패치 표는 고칠 수 있다");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("patch anchors are classified by field and drift is detected", () => {
  const table = [
    "export const P = {",
    '  id: 7,',
    '  replacements: [{',
    '    pattern: "first host line\\nsecond host line",',
    '    replace: "const INTRO = `[dsh-purge] 中文说明`",',
    "  }],",
    '  markers: ["[dsh-purge]"],',
    "};",
    "",
  ].join("\n");
  const spans = classifySpans(table);
  assert.ok(spans.some((s) => s.field === "pattern"), "pattern 필드를 찾는다");
  assert.ok(spans.some((s) => s.field === "replace"), "replace 필드를 찾는다");
  assert.ok(spans.some((s) => s.field === "markers"), "markers 필드를 찾는다");

  const upstream = table.replace("first host line", "renamed host line");
  const drift = patternDrift(upstream, table);
  assert.equal(drift.drift.length, 1);
  assert.match(drift.drift[0].upstream, /renamed host line/);

  const previous = table.replace("中文说明", "한국어 설명");
  const lost = lostPayloads(previous, table);
  assert.equal(lost.lost.length, 1, "한국어 주입 문장이 중국어로 되돌아간 것을 잡는다");
  assert.match(lost.lost[0].previous, /한국어 설명/);
  assert.equal(lostPayloads(table, table).lost.length, 0, "그대로면 소실이 아니다");
});

test("findings combine anchor drift, lost payloads and untranslated strings", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "senior-findings-"));
  fs.mkdirSync(path.join(dir, "lib", "patches"), { recursive: true });
  const patchFile = path.join(dir, "lib", "patches", "prompt.mjs");
  const current = 'export const P = { pattern: "old host line", replace: "[dsh-purge] 中文说明文句在这里" };\n';
  fs.writeFileSync(patchFile, current, "utf8");
  fs.writeFileSync(path.join(dir, "lib", "instance.js"), 'const note = "应用补丁";\n', "utf8");
  const manifest = path.join(dir, "changed.txt");
  fs.writeFileSync(manifest, "lib/patches/prompt.mjs\nlib/instance.js\n", "utf8");

  const findings = collectFindings({
    manifestPath: manifest,
    root: dir,
    reviewPath: path.join(dir, "__no-review.json"),
    logPath: path.join(dir, "__no-log.txt"),
    blobs: {
      upstream: { "lib/patches/prompt.mjs": 'export const P = { pattern: "new host line", replace: "[dsh-purge] 中文说明文句在这里" };\n' },
      previous: { "lib/patches/prompt.mjs": 'export const P = { pattern: "old host line", replace: "[dsh-purge] 한국어 설명을 여기에" };\n' },
    },
  });

  assert.equal(findings.blocking, true);
  assert.ok(findings.anchor.some((a) => a.kind === "anchor"), "앵커 드리프트를 잡는다");
  assert.ok(findings.anchor.some((a) => a.kind === "lost-localization"), "주입 문장 소실을 잡는다");
  assert.ok(findings.leftover.some((l) => l.file === "lib/instance.js"), "미번역 문자열을 잡는다");

  const task = buildTask(findings);
  assert.equal(task.rules.some((r) => r.includes("pattern")), true);
  assert.equal(task.rules.some((r) => r.includes("[dsh-purge]")), true);
  assert.ok(task.anchor_findings.length >= 2);
  assert.ok(JSON.stringify(task).length > 100);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("without a key the senior pass fixes nothing and reports a failure", () => {
  const sample = path.join(repo, "scripts", "i18n", "__senior-sample.js");
  const manifest = path.join(repo, ".sync", "__senior-manifest.txt");
  const report = path.join(repo, ".sync", "__senior-report.md");
  fs.mkdirSync(path.dirname(manifest), { recursive: true });
  fs.writeFileSync(sample, "// 中文 주석입니다\nconst x = 1;\n", "utf8");
  fs.writeFileSync(manifest, "scripts/i18n/__senior-sample.js\n", "utf8");
  try {
    const env = { ...process.env };
    delete env.LLM_API_KEY;
    const res = spawnSync(
      process.execPath,
      [
        path.join(repo, "scripts", "i18n-senior-fix.mjs"),
        "--manifest", path.relative(repo, manifest),
        "--review", ".sync/__no-review.json",
        "--report", path.relative(repo, report),
        "--allow-network",
      ],
      { cwd: repo, encoding: "utf8", env },
    );
    assert.equal(res.status, 3, "고치지 못하면 실패로 끝난다");
    assert.match((res.stdout || "") + (res.stderr || ""), /senior-fix:/);
    assert.equal(fs.readFileSync(sample, "utf8"), "// 中文 주석입니다\nconst x = 1;\n", "파일을 건드리지 않는다");
    assert.ok(fs.existsSync(report), "보고서를 남긴다");
    assert.match(fs.readFileSync(report, "utf8"), /AI 비활성/);
  } finally {
    fs.rmSync(sample, { force: true });
    fs.rmSync(manifest, { force: true });
    fs.rmSync(report, { force: true });
  }
});
