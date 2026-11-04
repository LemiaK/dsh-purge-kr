// #89: 모델이 준 대기 시간을 존중하고, -1(무한 대기)만 300초로 줄인다.
// 동시에 옛 버전이 "1초로 강제 고정"하던 마이그레이션도 덮는다: 업그레이드 후에는 timeout = 1 이 다시 나타나지 않아야 한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_PATCHES, applyReplacementsToText } from "../lib/core.js";

const patch = ALL_PATCHES.find((p) => p.id === 89);
const NATIVE = '\t\t\tconst timeout = validateTimeout(args.timeout ?? defaultTimeout);';
const OLD = '\t\t\tconst timeout = 1; // [dsh-purge] ask_user_question never blocks a turn';
const NEW = '[dsh-purge] -1 capped at 300s';

test("native host line becomes a capped wait", () => {
  const out = applyReplacementsToText(NATIVE, patch, "x").text;
  assert.match(out, /args\.timeout === -1 \? 300/);
  assert.match(out, /args\.timeout \?\? defaultTimeout/);
  assert.match(out, new RegExp(NEW.replace(/[[\]]/g, "\\$&")));
});

test("an installation carrying the old 1-second patch is migrated", () => {
  const out = applyReplacementsToText(OLD, patch, "x").text;
  assert.doesNotMatch(out, /timeout = 1;/);
  assert.match(out, /args\.timeout === -1 \? 300/);
});

test("applying twice is idempotent", () => {
  const once = applyReplacementsToText(NATIVE, patch, "x").text;
  const twice = applyReplacementsToText(once, patch, "x").text;
  assert.equal(twice, once);
});
