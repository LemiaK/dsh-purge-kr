// 우회 계약: 이 25 개는 "게이트"다. 누구든(이후 최적화 포함) 이들을 바꾸면
// 지문이 달라지고 CI 가 즉시 빨개진다 — 손대려면 먼저 이유를 밝히고 여기 지문을 갱신해야 한다.
// 품질 최적화는 게이트가 아닌 패치에만 손댈 수 있다(예: 이미 제거된 #18/#19).
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { ALL_PATCHES, patchEnabled } from "../lib/core.js";

const GATE_FINGERPRINTS = {
  5: "13e205e4c8f319e3",
  6: "5d03a6507943f586",
  7: "2e490a6fd7e2a07e",
  8: "004ed85a11810181",
  9: "e1f2c1fa551e2fa0",
  10: "1e1197b70cd4bcd9",
  11: "f732bb54043fe3f6",
  12: "e7e94c2c5d5d6e0f",
  13: "eac61898ab7bddde",
  14: "f57e00b29794289d",
  15: "68bd19d2e61b65bb",
  16: "9698a6c3b4e9e7ba",
  17: "975df12b54173ecb",
  30: "c844cddcc7933514",
  31: "f80165c28dc19a5e",
  34: "1ecd46f5b4067b0f",
  35: "eab9ef59d3ca00b8",
  36: "fd8e27dd7b1b21b3",
  59: "fc2fc00d258210b1",
  60: "9e13ac2da676e434",
  61: "c17dcb85eded7e36",
  63: "b92dd05efb4ba817",
  66: "a97a223234457fee",
  67: "8cfd0fd1a4e97f0a",
  68: "2590e742617f1242",
};

function fingerprint(patch) {
  const shape = JSON.stringify({
    name: patch.name,
    replacements: (patch.replacements || []).map((r) => ({
      p: String(r.pattern).slice(0, 400),
      r: String(r.replace).slice(0, 400),
    })),
  });
  return crypto.createHash("sha256").update(shape).digest("hex").slice(0, 16);
}

test("all 25 bypass gates exist with unchanged semantics", () => {
  const byId = new Map(ALL_PATCHES.map((p) => [p.id, p]));
  const problems = [];
  for (const [id, expected] of Object.entries(GATE_FINGERPRINTS)) {
    const patch = byId.get(Number(id));
    if (!patch) {
      problems.push(`#${id} missing`);
      continue;
    }
    const actual = fingerprint(patch);
    if (actual !== expected) problems.push(`#${id} ${patch.name} changed (${expected} -> ${actual})`);
  }
  assert.deepEqual(problems, [], problems.join("; "));
});

test("quality-reducing patches stay opt-in and off by default", () => {
  // #18/#19 가 끄는 것은 컨텍스트 보호(중복 호출 알림, 도구 결과 트리밍)이고 게이트가 아니다.
  // 이들은 disabledByDefault 형태로 존재한다: 명시적으로 켤 수 있지만 기본값으로는 호스트에 절대 쓰지 않는다.
  for (const id of [18, 19]) {
    const patch = ALL_PATCHES.find((p) => p.id === id);
    assert.ok(patch, `#${id} should exist as an opt-in patch`);
    assert.equal(patch.disabledByDefault, true, `#${id} must stay off by default`);
    assert.equal(patchEnabled(patch, []), false, `#${id} must not apply without an explicit opt-in`);
  }
});
