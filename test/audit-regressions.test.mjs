// 감사 회귀: 이 테스트 묶음은 보고와 사실이 어긋나는 결함 네 건에 대응한다. 고치기 전에는 전부 실패했다.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { rollupLayers } from "../lib/selfcheck.js";
import { versionIsNewer, sameRev } from "../lib/update-state.js";
import { atomicFiles } from "../lib/atomic-files.js";
import { dirBackup, dirRestore } from "../lib/update-install.js";

const tmp = (tag) => fs.mkdtempSync(path.join(os.tmpdir(), `purge ${tag} `));

test("패치 상태를 읽지 못하면 자기 점검을 전부 초록으로 보고하지 않는다", () => {
  // patchStatus 가 예외를 던지면 selfCheck 는 status={} + statusError 를 넘긴다: 모든 계층이 unknown 이어야 한다.
  const failed = rollupLayers({}, true, { statusError: "patchStatus boom" });
  assert(failed.every((l) => l.state === "unknown" && l.ok === false));
  assert(failed.every((l) => l.broken.length === 0), "상태를 읽지 못한 것은 패치 손상과 같지 않다");
  assert(failed[0].note.includes("patchStatus boom"));
  assert.equal(failed[0].status_error, "patchStatus boom");

  // 빈 상태 표는 대상 누락을 증명하지 못한다: 반환되지 않은 상태는 여전히 미지여야 한다.
  assert(rollupLayers({}, true).every((l) => l.state === "unknown"));
  // 호스트를 찾지 못한 경우도 unknown 이며, 위의 오류 분기에 삼켜지지 않는다.
  assert(rollupLayers({}, false).every((l) => l.state === "unknown"));
});

test("프리릴리스 구간은 숫자로 비교한다: rc.2 가 rc.10 보다 새롭지 않다", () => {
  assert.equal(versionIsNewer("0.2.1-rc.2", "0.2.1-rc.10"), false);
  assert.equal(versionIsNewer("0.2.1-rc.10", "0.2.1-rc.2"), true);
  assert.equal(versionIsNewer("0.2.1-rc.2", "0.2.1"), false);
  assert.equal(versionIsNewer("0.2.1", "0.2.1-rc.2"), true);
  assert.equal(versionIsNewer("1.6.27", "1.6.9"), true);
  assert.equal(versionIsNewer("1.6.100", "1.6.99"), true);
});

test("sameRev 는 git sha 에만 접두 비교를 하고 apply:<버전> 을 같은 개정으로 보지 않는다", () => {
  assert.equal(sameRev("apply:1.6.2", "apply:1.6.27"), false);
  assert.equal(sameRev("abc1234", "abc1234def"), true);
  assert.equal(sameRev("abc1234", "fff9999"), false);
});

test("rename 이 일시적 점유를 만나면 물러섰다 재시도하고, 상태 파일 쓰기를 바로 실패시키지 않는다", () => {
  const root = tmp("rename");
  const file = path.join(root, "state.json");
  fs.writeFileSync(file, "old");
  try {
    let calls = 0;
    const fake = { ...fs, promises: { ...fs.promises } };
    fake.renameSync = (from, to) => {
      calls += 1;
      if (calls <= 2) throw Object.assign(Error("busy"), { code: "EBUSY" });
      return fs.renameSync(from, to);
    };
    atomicFiles(fake).atomicWriteSync(file, "new");
    assert.equal(fs.readFileSync(file, "utf8"), "new");
    assert.equal(calls, 3, "앞의 두 번 EBUSY 뒤에 한 번 더 시도해야 한다");
    assert.deepEqual(fs.readdirSync(root), ["state.json"], "재시도가 임시 파일을 남기면 안 된다");

    // 점유 계열이 아닌 오류는 재시도하지 않는다: 권한 오류 재시도는 의미가 없다.
    let fatal = 0;
    const deny = { ...fs, promises: { ...fs.promises } };
    deny.renameSync = () => {
      fatal += 1;
      throw Object.assign(Error("denied"), { code: "ENOENT" });
    };
    assert.throws(() => atomicFiles(deny).atomicWriteSync(file, "x"), /denied/);
    assert.equal(fatal, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("디렉터리 롤백은 백업이 의도적으로 건너뛴 node_modules 를 지켜 낸다", () => {
  const root = tmp("dirrestore");
  const home = path.join(root, "home");
  const dir = path.join(root, "plugin");
  try {
    fs.mkdirSync(path.join(dir, "lib"), { recursive: true });
    fs.mkdirSync(path.join(dir, "node_modules", "yaml"), { recursive: true });
    fs.writeFileSync(path.join(dir, "lib", "index.js"), "v1");
    fs.writeFileSync(path.join(dir, "node_modules", "yaml", "index.js"), "dep");
    const backup = dirBackup(dir, { home, reason: "test" });
    // 업그레이드가 소스를 망가뜨렸지만 node_modules 는 여전히 디스크에 있다
    fs.writeFileSync(path.join(dir, "lib", "index.js"), "broken");
    dirRestore(backup, dir);
    assert.equal(fs.readFileSync(path.join(dir, "lib", "index.js"), "utf8"), "v1");
    assert.equal(
      fs.existsSync(path.join(dir, "node_modules", "yaml", "index.js")),
      true,
      "롤백 뒤에도 의존성이 남아 있어야 한다. 없으면 플러그인의 import yaml 이 바로 실패한다",
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
