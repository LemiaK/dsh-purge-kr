// 업스트림 저장소는 삭제되고 무관한 프로젝트로 교체되었다: 릴리스 소스는 이 저장소를 가리켜야 하며, 그렇지 않으면 beta/zip 경로가 404 가 된다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SOURCE_REPO, UPSTREAM_REPO, archiveZipUrl, archiveTarballUrl } from "../lib/update-net.js";
import { REPOSITORY } from "../lib/community.js";

test("update sources point at this repository", () => {
  assert.equal(SOURCE_REPO, "wnduddld0513/dsh-purge-kr");
  assert.equal(UPSTREAM_REPO, SOURCE_REPO);
  assert.equal(REPOSITORY, SOURCE_REPO);
});

test("archive URLs never reference the removed upstream", () => {
  for (const url of [archiveZipUrl("v1.6.36"), archiveTarballUrl("v1.6.36")]) {
    assert.match(url, /wnduddld0513\/dsh-purge-kr/);
    assert.doesNotMatch(url, /YuJunZhiXue/);
  }
});
