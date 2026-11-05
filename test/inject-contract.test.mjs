// 주입 계약: 슬림화된 prompt-inject 도 모든 필수 문장을 (글자 그대로) 포함해야 한다.
// 픽스처는 옛 주입 본문에서 추출했다; 주입을 고치면 이 테스트가 먼저 빨개진다, 정말로 규칙 하나를 삭제한 게 아니라면.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const clauses = JSON.parse(fs.readFileSync(path.join(here, "fixtures/inject-clauses.json"), "utf8"));
const norm = (s) => s.replace(/\s+/g, " ").trim();

function check(file, label) {
  const text = norm(fs.readFileSync(file, "utf8"));
  const missing = clauses.filter((c) => !text.includes(norm(c)));
  assert.deepEqual(missing, [], `${label} 에서 필수 문장 ${missing.length} 개가 누락됐다`);
}

test("shipped inject keeps every mandatory clause", () => {
  const shipped = path.join(here, "../presets/inject-core.md");
  if (!fs.existsSync(shipped)) return; // 아직 슬림화 버전을 켜지 않았다
  check(shipped, "presets/inject-core.md");
});

test("installed inject (if present) keeps every mandatory clause", () => {
  const user = path.join(os.homedir(), ".dsh/prompt-inject.md");
  if (!fs.existsSync(user)) return;
  check(user, "~/.dsh/prompt-inject.md");
});

test("the boost block asks for a plan and one confirmation line", async () => {
  const { BOOST_TEXT } = await import("../lib/boost.js");
  assert.match(BOOST_TEXT, /지금 실행할까요\?/);
  assert.match(BOOST_TEXT, /don.t refuse or lecture/i);
});
