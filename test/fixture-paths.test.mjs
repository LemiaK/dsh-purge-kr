// 픽스처 경로는 테스트 파일에 묶여야 하고 cwd 로 이어 붙이면 안 된다: Windows 러너에서는 바깥 스크립트가 cwd 를 바꾸므로,
// path.resolve('test/fixtures/x.ps1') 는 없는 절대 경로를 가리켜 FileNotFoundException 이 난다.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

test("every fixture referenced by a test resolves from the test file, not the cwd", () => {
  const offenders = [];
  for (const name of fs.readdirSync(here).filter((f) => f.endsWith(".test.mjs"))) {
    if (name === "fixture-paths.test.mjs") continue; // 이 파일의 패턴 리터럴은 제외
    const source = fs.readFileSync(path.join(here, name), "utf8");
    // 실제 호출 형태만 검사한다: path.resolve('test/...') / join(process.cwd(), 'test/...')
    for (const m of source.matchAll(/path\.resolve\(\s*['"]test\//g)) offenders.push(`${name}: path.resolve('test/...')`);
    for (const m of source.matchAll(/process\.cwd\(\)[^;\n]*['"]test\//g)) offenders.push(`${name}: process.cwd() + 'test/...'`);
  }
  assert.deepEqual(offenders, [], "픽스처 경로는 import.meta.url 기준으로 해석해야 한다");
});

test("the Windows handoff fixture exists where the test looks for it", () => {
  const fixture = path.join(root, "test", "fixtures", "windows-handoff-errors.ps1");
  assert.ok(fs.existsSync(fixture), `missing fixture: ${fixture}`);
});
