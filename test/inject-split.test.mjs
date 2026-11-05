// 주입 본문의 제목은 "CTF Core Contract" 이고, 상수는 전부 대문자다.
// 줄 전체를 기준으로, 대소문자를 무시하고 비교한다: 대소문자 때문에 무효가 되어도 안 되고, 본문 안의 동명 표현을 잘못 건드려도 안 된다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { splitRedteamInject, withoutCtfContract } from "../lib/identity.js";

const REAL = "머리말 단락\n\nCTF Core Contract\n\nCTF Scope and Evidence\n\n대회 샌드박스 규칙\n";

test("the real mixed-case heading is split off", () => {
  const { common, ctfTail } = splitRedteamInject(REAL);
  assert.equal(common.trim(), "머리말 단락");
  assert.match(ctfTail, /대회 샌드박스 규칙/);
});

test("user prose mentioning the words inline is untouched", () => {
  const prose = "우리 문서의 제목은 CTF Core Contract 인 이 절이며, 아래에서 설명한다.";
  assert.equal(splitRedteamInject(prose).ctfTail, "");
  assert.equal(withoutCtfContract(prose), prose);
});

test("a fenced example is not treated as a structural marker", () => {
  const fenced = "머리말\n\n```\nCTF Core Contract\n```\n\n본문 뒷부분\n";
  assert.equal(splitRedteamInject(fenced).ctfTail, "");
});
