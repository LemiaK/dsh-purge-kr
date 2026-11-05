// 증거 장부 도구는 실제로 도구면에 붙어 있어야 한다: 1.6.78 은 모듈만 복사하고 배선하지 않아 죽은 코드였다.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib", "redteam", "tools.js"),
  "utf8",
);

const TOOLS = [
  "redteam_evidence_record",
  "redteam_evidence_verify",
  "redteam_evidence_upgrade",
  "redteam_evidence_list",
  "redteam_unverified_count",
  "redteam_unknown_record",
  "redteam_unknown_resolve",
  "redteam_unknown_list",
];

test("evidence ledger tools are registered, not just imported", () => {
  assert.match(source, /from '\.\/evidence-ledger\.mjs'/);
  for (const name of TOOLS) {
    assert.ok(source.includes(`name: '${name}'`), `${name} 는 도구면에 등록되어야 한다`);
  }
  assert.match(source, /function ledgerOf\(/, "장부를 가져오는 도우미 함수가 있어야 한다");
  assert.match(source, /function unknownsOf\(/, "미지 등록을 가져오는 도우미 함수가 있어야 한다");
});

test("knowledge-base tools stay available in this fork", () => {
  for (const name of ["redteam_poc_search", "redteam_poc_add"]) {
    assert.ok(source.includes(`name: '${name}'`), `${name} 는 업스트림의 오픈소스 정리에 휩쓸려 빠지면 안 된다`);
  }
});
