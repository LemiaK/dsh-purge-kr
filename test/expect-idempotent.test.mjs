// #93 (SANDBOX_POLICY_BRAND_NEUTRAL) declares expect:3 on the original brand sentence.
// Re-applying to a host that already carries the neutralised sentence counted 0 hits and
// returned hit_mismatch — a hard failure — so every later apply reported the patch red
// even though the file on disk was already correct.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_PATCHES } from "../lib/patches/index.mjs";
import { applyReplacementsToText } from "../lib/core/verify.mjs";

const patch = ALL_PATCHES.find((p) => p.id === 93);
const target = "dsh-sandbox-policy/lib/index.js";

// The three policy lines as shipped upstream, before any patch touched them.
const ORIGINAL = [
  'return "Current DSH file policy: read-only. Any available operation enforced by the DSH file sandbox cannot modify files.";',
  "return `Current DSH file policy: workspace-write. Any available operation enforced by the DSH file sandbox may modify files.`;",
  'return "Current DSH file policy: danger-full-access. The DSH file sandbox does not restrict file modifications by available operations.";',
].join("\n");

test("#93 applied twice is finished, not a hit mismatch", () => {
  const once = applyReplacementsToText(ORIGINAL, patch, target);
  assert.equal(once.hitMismatch, undefined);
  assert.equal(once.changed, true);
  assert.match(once.text, /Current file policy: /);

  const again = applyReplacementsToText(once.text, patch, target);
  assert.equal(again.hitMismatch, undefined);
  assert.equal(again.changed, false);
  assert.equal(again.text, once.text);
});

test("a host that never carried the sentence is still a hit mismatch", () => {
  const drifted = applyReplacementsToText("export const unrelated = 1;\n", patch, target);
  assert.deepEqual(drifted.hitMismatch, { patch_id: 93, expected: 3, actual: 0, file: target });
  assert.equal(drifted.changed, false);
});

test("an unexpected extra copy of the sentence is not silently rewritten", () => {
  const duplicated = `${ORIGINAL}\n${ORIGINAL}`;
  const result = applyReplacementsToText(duplicated, patch, target);
  assert.deepEqual(result.hitMismatch, { patch_id: 93, expected: 3, actual: 6, file: target });
  assert.equal(result.changed, false);
});
