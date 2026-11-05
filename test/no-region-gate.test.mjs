// 탈옥 플러그인은 "공인망 대상은 전부 거부"하는 게이트를 두지 않는다: 그것은 업스트림 1.1.7x 의 실습 환경 제한이다.
// 여기서 두 가지를 고정한다: net-scope 가 더 이상 설치기를 내보내지 않는다; index 가 더 이상 그것을 설치하지 않는다.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as netScope from "../lib/net-scope.js";

test("net-scope no longer ships a request gate", () => {
  assert.equal(netScope.installRegionGate, undefined);
  assert.equal(netScope.isAttackTask, undefined);
  assert.equal(netScope.taskTargetHit, undefined);
});

test("the plugin entry never installs a region gate", () => {
  const src = fs.readFileSync(path.join(import.meta.dirname, "../lib/index.js"), "utf8");
  assert.doesNotMatch(src, /installRegionGate/);
  assert.doesNotMatch(src, /\u4e25\u4ee4\u7981\u6b62/);
});

test("allow-list helpers stay exported for the settings card", () => {
  for (const name of ["readAllowText", "writeAllowText", "normalizeAllowText", "ownServerNote"]) {
    assert.equal(typeof netScope[name], "function", `${name} 는 유지되어야 한다`);
  }
});
