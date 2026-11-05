// #86: applyPatches() must not abort the whole run when one patch's target file
// is absent. 1.6.58 added `detail[p.id].push({...})` to the missing-target
// branch without declaring `detail`, so every host that lacks one of the 65
// targets (hooks for Claude Code / Codex, LiangShen cache, …) died mid-apply
// with `ReferenceError: detail is not defined` and the panel stayed at 4/65.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { ALL_PATCHES, applyPatches, patchStatus } from "../lib/core.js";
import { NATIVE_QUEUE_GUARD, OLD_QUEUE_FALLBACK } from "../lib/steering.js";
import { removeTreeNoFollowSync } from "../lib/remove-tree.js";

// 실제로 적용되는 패치 하나(단일 호스트, 대상 파일 두 개가 모두 fixture 안에 있다). 그 패치의 applied
// 결과로 앞 패치의 대상 누락이 뒤 패치를 연좌하지 않았음을 증명한다.
const APPLIES = ALL_PATCHES.find((p) => p.id === 90);
assert.ok(APPLIES, "패치 90 은 ALL_PATCHES 에 반드시 있어야 한다. 없으면 아래 모든 어서션이 의미를 잃는다");
const fixtureSource = JSON.parse(
  fs.readFileSync(new URL("./fixtures/steering-rc2.json", import.meta.url), "utf8"),
);
// fixtures 의 controller 는 이미 패치된 형태이므로 호스트 원문으로 되돌려야 패치 대기 상태가 된다;
// replace 가 적중하지 않으면 원문이 조용히 반환되어 테스트가 엉뚱한 already 를 받는다. 그래서 먼저 어서션한다.
const RESTORED_CONTROLLER = fixtureSource.controller.replace(
  NATIVE_QUEUE_GUARD,
  OLD_QUEUE_FALLBACK,
);
assert.notEqual(
  RESTORED_CONTROLLER,
  fixtureSource.controller,
  "fixture 에는 NATIVE_QUEUE_GUARD 가 있어야 한다. 없으면 패치 대기 상태의 호스트 원문으로 되돌릴 수 없다",
);

function fixture({ withHostFiles = false }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "purge-apply-missing-"));
  const home = path.join(root, "home");
  const aiBase = path.join(root, "node_modules", "@deepseek-ai");
  fs.mkdirSync(path.join(home, "profiles", "desktop"), { recursive: true });
  fs.writeFileSync(path.join(home, "profiles", "desktop", "package.json"), "{}");
  fs.mkdirSync(aiBase, { recursive: true });
  const targets = {};
  if (withHostFiles) {
    targets.controller = path.join(aiBase, "dsh-api-session-controller", "lib", "index.js");
    targets.loop = path.join(aiBase, "dsh-agent-loop", "lib", "index.js");
    for (const file of Object.values(targets)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
    }
    fs.writeFileSync(targets.controller, RESTORED_CONTROLLER);
    fs.writeFileSync(targets.loop, fixtureSource.agentMethods);
  }
  return { root, home, aiBase, targets, close: () => removeTreeNoFollowSync(root) };
}

async function withFixture(options, fn) {
  const f = fixture(options);
  const prevHome = process.env.DSH_HOME;
  const prevSurface = process.env.DSH_SURFACE;
  // fixture 를 가리킨다: apply 전 profile 스냅샷은 임시 home 에 쓰고 실제 ~/.dsh 는 절대 건드리지 않는다.
  process.env.DSH_HOME = f.home;
  process.env.DSH_SURFACE = "desktop";
  try {
    return await fn(f);
  } finally {
    if (prevHome === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prevHome;
    if (prevSurface === undefined) delete process.env.DSH_SURFACE;
    else process.env.DSH_SURFACE = prevSurface;
    f.close();
  }
}

/**
 * 대상 파일이 이 fixture 안에 하나도 없는 패치를 patchStatus 로 실증해 고른다.
 * ALL_PATCHES 순서를 믿고 첫 번째가 빠졌다고 가정하지 않는다 — #74/#87 같은 패치의 대상은
 * fixture 에서 만들어 둔 agent-loop 이라, 순서 운에 기대면 패치가 재배열된 뒤 오판한다.
 */
async function absentPatch(f) {
  const opts = { dshHome: f.home, surface: "desktop" };
  const status = await patchStatus(f.aiBase, ALL_PATCHES, opts);
  const found = ALL_PATCHES.find(
    (p) => p.id !== APPLIES.id && status[p.id] === "missing_file",
  );
  assert.ok(found, "이 fixture 에는 대상 파일이 전부 없는 패치가 적어도 하나 있어야 한다");
  return found;
}

test("a patch whose target files are all absent is reported, not thrown", async () => {
  await withFixture({}, async (f) => {
    const absent = await absentPatch(f);
    const report = await applyPatches(f.aiBase, [absent]);
    assert.equal(report.length, 1);
    assert.equal(report[0].patch_id, absent.id);
    assert.equal(
      report[0].status,
      "missing_file",
      "대상 파일이 전부 없으면 missing_file 로 기록하고, apply 전체가 예외를 던져서는 안 된다",
    );
    assert.ok(report[0].missing > 0);
  });
});

test("a missing target does not stop the patches that follow it", async () => {
  await withFixture({ withHostFiles: true }, async (f) => {
    const absent = await absentPatch(f);
    const report = await applyPatches(f.aiBase, [absent, APPLIES]);
    assert.equal(report.length, 2, "두 번째 패치도 반드시 처리되어야 한다");
    assert.equal(report[0].patch_id, absent.id);
    assert.equal(report[0].status, "missing_file");
    const applied = report[1];
    assert.equal(applied.patch_id, APPLIES.id);
    assert.equal(applied.status, "applied", "뒤 패치는 앞 패치의 대상 누락에 연좌되어서는 안 된다");
    assert.ok(
      (fs.readFileSync(f.targets.controller, "utf8")).includes(NATIVE_QUEUE_GUARD),
      "패치 내용은 실제로 디스크에 기록되어야 한다",
    );
  });
});

test("re-applying after a missing target stays idempotent", async () => {
  await withFixture({ withHostFiles: true }, async (f) => {
    const absent = await absentPatch(f);
    await applyPatches(f.aiBase, [absent, APPLIES]);
    const once = fs.readFileSync(f.targets.controller, "utf8");
    const report = await applyPatches(f.aiBase, [absent, APPLIES]);
    assert.equal(report[1].status, "already", "두 번째는 already 로 판정하고 다시 쓰지 않는다");
    assert.equal(fs.readFileSync(f.targets.controller, "utf8"), once);
  });
});
