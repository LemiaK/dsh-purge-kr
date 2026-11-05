// 자동 번역 파이프라인의 안전장치 테스트.
//  - 스팬 추출/재삽입이 코드 골격을 바꾸지 않는지
//  - TM 왕복
//  - 가짜 키가 출력·로그·저장소에 남지 않는지(시크릿 유출 방지)
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { scanCode, applySpans, skeleton, hasCjk } from "../scripts/i18n/spans.mjs";
import { loadTm, saveTm, tmKey } from "../scripts/i18n/tm.mjs";

const FAKE_KEY = "test11221323213123";
const FAKE_URL = "https://example.invalid/v1";
const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("span scanner finds comments and strings without touching code", () => {
  const source = 'const a = "中文 문자열";\n// 中文 주석\nconst b = 1;\n';
  const spans = scanCode(source);
  assert.ok(spans.some((s) => s.kind === "string" && hasCjk(s.text)));
  assert.ok(spans.some((s) => s.kind === "comment" && hasCjk(s.text)));
  const replaced = spans.map((s) => ({
    start: s.start,
    end: s.end,
    text: s.kind === "string" ? '"번역된 문자열"' : "// 번역된 주석",
  }));
  const next = applySpans(source, replaced);
  assert.equal(skeleton(next), skeleton(source), "코드 골격이 바뀌면 안 된다");
  assert.match(next, /const b = 1;/);
});

test("translation memory round-trips through JSONL", () => {
  const file = path.join(os.tmpdir(), `tm-${process.pid}.jsonl`);
  const key = tmKey("comment", "// 中文");
  saveTm([{ k: key, ctx: "comment", src: "// 中文", ko: "// 번역", v: "test" }], file);
  const loaded = loadTm(file);
  assert.equal(loaded.get(key), "// 번역");
  fs.rmSync(file, { force: true });
});

test("the pipeline never prints the API key", () => {
  const sample = path.join(repo, "scripts", "i18n", "__secret-sample.js");
  fs.writeFileSync(sample, "// 中文 주석입니다\nconst x = 1;\n", "utf8");
  try {
    const res = spawnSync(
      process.execPath,
      [path.join(repo, "scripts", "localize.mjs"), "--paths", "scripts/i18n/__secret-sample.js", "--dry-run"],
      { encoding: "utf8", env: { ...process.env, LLM_API_KEY: FAKE_KEY, LLM_BASE_URL: FAKE_URL } },
    );
    const text = (res.stdout || "") + (res.stderr || "");
    assert.equal(res.status, 0, "dry-run 은 실패하면 안 된다");
    assert.ok(!text.includes(FAKE_KEY), "출력에 키가 남으면 안 된다");
    assert.match(text, /localize: files=1/);
  } finally {
    fs.rmSync(sample, { force: true });
  }
});

test("a network failure is reported without leaking the key", () => {
  const sample = path.join(repo, "scripts", "i18n", "__secret-sample2.js");
  fs.writeFileSync(sample, "// 中文 주석입니다\nconst y = 2;\n", "utf8");
  try {
    const res = spawnSync(
      process.execPath,
      [
        path.join(repo, "scripts", "localize.mjs"),
        "--paths", "scripts/i18n/__secret-sample2.js",
        "--allow-network", "--fail-on-miss",
      ],
      { encoding: "utf8", env: { ...process.env, LLM_API_KEY: FAKE_KEY, LLM_BASE_URL: FAKE_URL, LLM_TIMEOUT_MS: "8000" } },
    );
    const text = (res.stdout || "") + (res.stderr || "");
    assert.notEqual(res.status, 0, "미번역이 남으면 fail-on-miss 는 실패해야 한다");
    assert.ok(!text.includes(FAKE_KEY), "실패 로그에도 키가 없어야 한다");
  } finally {
    fs.rmSync(sample, { force: true });
  }
});

test("no repository file contains the fake key outside this test", () => {
  const tracked = spawnSync("git", ["ls-files"], { cwd: repo, encoding: "utf8" }).stdout.split("\n").filter(Boolean);
  const offenders = [];
  for (const file of tracked) {
    if (file === "test/i18n-automation.test.mjs") continue;
    let text = "";
    try { text = fs.readFileSync(path.join(repo, file), "utf8"); } catch { continue; }
    if (text.includes(FAKE_KEY)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], "가짜 키가 저장소 파일에 남아 있다");
});
