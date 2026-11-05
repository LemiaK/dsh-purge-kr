// [dsh-purge] 패치 상태 판정 묶음: 이 패치가 이 파일에서 완료로 볼 수 있는지 판단한다; core.js 에서 그대로 옮겨 왔고 export 만 보강했다.
import { ALL_PATCHES } from "../patches/index.mjs";
import { adapterFor, detectSurface } from "../surface.js";
import { nativeSteeringRestored } from "../steering.js";
import { asLf, isYamlPath, collapseDuplicateLegacyApplyPath, rewriteStaleLegacyApplyCall, modernSettingsApi, modernSettingsPatch, patchApplied, cloneRegExp, isLayoutSoftPatch, patchReplacements, isBareIdentityNeedle, yamlJsCommentsToHash } from "./shared.mjs";

export function applyReplacementsToText(text, patch, fp = "") {
  let source = text;
  let preChanged = false;
  if (patch?.id === 42 && modernSettingsApi(asLf(source))) return modernSettingsPatch(source, patch);
  if (patch?.id === 42) {
    const collapsed = collapseDuplicateLegacyApplyPath(source);
    if (collapsed !== source) {
      source = collapsed;
      preChanged = true;
    }
    const rewritten = rewriteStaleLegacyApplyCall(source);
    if (rewritten !== source) {
      source = rewritten;
      preChanged = true;
    }
  }
  // 삽입형 패치는 앵커가 남아 있고, 표식이 이미 있으면 replaceAll 을 다시 하지 않는다.
  if (patch.skipIfMarked && patchApplied(source, patch)) {
    return { text: source, changed: preChanged };
  }
  const crlf = typeof source === "string" && source.includes("\r\n");
  const yaml = isYamlPath(fp);
  let out = asLf(source);
  let changed = false;
  for (const rep of patchReplacements(patch)) {
    const { pattern, replace } = rep;
    if (!pattern || typeof replace !== "string") continue;
    // YAML 블록 스칼라의 줄 앞에는 들여쓰기가 있다; 들여쓰기 없는 identity+\n\n 는 6칸을 남기고 다음 구간과 합쳐져 12칸이 된다.
    if (yaml && isBareIdentityNeedle(pattern)) continue;
    const written = yaml ? yamlJsCommentsToHash(asLf(replace)) : asLf(replace);
    // 정규식 pattern: 자기 매칭형 교체에 쓴다(산출물이 원 pattern 을 포함, 예: timeoutMs 에 0 추가).
    if (pattern instanceof RegExp) {
      // 적중 수 계약은 정규식에도 똑같이 적용된다: 공식이 같은 코드를 복제하면 정규식이 두 곳을 함께 바꿔 버린다.
      if (typeof rep.expect === "number") {
        const hits = (out.match(cloneRegExp(pattern, true)) || []).length;
        if (hits !== rep.expect) {
          return { text: source, changed: preChanged, hitMismatch: { patch_id: patch?.id, expected: rep.expect, actual: hits, file: fp } };
        }
      }
      const re = cloneRegExp(pattern, true);
      re.lastIndex = 0;
      if (!re.test(out)) continue;
      re.lastIndex = 0;
      // 문자열 형태로 호출한다: $1..$9 확장 의미를 유지하기 위해서다(콜백 형태는 "$1" 을 리터럴로 파일에 쓴다).
      const next = out.replace(re, written);
      if (next === out) continue;
      out = next;
      changed = true;
      continue;
    }
    const needle = asLf(pattern);
    // 적중 수 계약: expect 를 선언하면 적중 수가 정확히 일치해야만 쓸 수 있다; 0 회도 불일치로 본다.
    // 이것은 동시에 "업스트림이 또 바뀌었다"를 알려 주는 프로브다 — 한 곳이 늘거나 줄면 즉시 드러나고, 무관한 두 번째 곳을 함께 바꾸지 않는다.
    if (typeof rep.expect === "number") {
      const hits = needle ? out.split(needle).length - 1 : 0;
      if (hits !== rep.expect) {
        return { text: source, changed: preChanged, hitMismatch: { patch_id: patch?.id, expected: rep.expect, actual: hits, file: fp } };
      }
    }
    if (!out.includes(needle)) continue;
    const next = out.split(needle).join(written);
    if (next === out) continue;
    out = next;
    changed = true;
  }
  // Do not partially migrate an unrecognized steering implementation.
  if (patch?.id === 90 && changed && !nativeSteeringRestored(out)) {
    // 조용히 버리면 패널은 계속 pending 만 보여 주고 "앵커가 일부만 적중했다"를 알 수 없다.
    console.warn(
      `[dsh-purge] #90 steering 마이그레이션 포기: ${fp || "알 수 없는 파일"} 이 일부만 적중해 재작성하지 않고 원문을 그대로 둡니다`,
    );
    return { text, changed: false };
  }
  // Preserve the existing host backup on repeated apply: otherwise the generic
  // upgrade detector treats a fully restored file as new vendor code.
  if (patch?.id === 90 && changed && !out.includes("// [dsh-purge] native steering restored (#90)")) {
    out = "// [dsh-purge] native steering restored (#90)\n" + out;
  }
  if (crlf) out = out.replace(/\n/g, "\r\n");
  return { text: out, changed: changed || preChanged };
}

export function rollupPatchStatus({ applied, already, missing, notFound, lastError, keyCount, layoutSoft, strictFiles }) {
  if (strictFiles && lastError) return lastError;
  if (strictFiles && notFound > 0) return "pattern_not_found";
  if (applied > 0) return "applied";
  if (already > 0 && (notFound === 0 || layoutSoft)) return "already";
  if (missing === keyCount) return "missing_file";
  if (lastError) return lastError;
  // 파일은 있지만 이 원문은 없다: 목록에서 원래 건너뛰는 항목이므로 전체 적용을 실패로 만들면 안 된다.
  if (notFound === 0) return "skipped";
  return "pattern_not_found";
}

export const ALWAYS_SOFT_STATUSES = new Set(["applied", "already", "missing_file", "skipped", "na", "off", "disabled"]);

export function patchAppliesHere(patch, surface = detectSurface()) {
  const want = patch?.surfaces;
  if (!Array.isArray(want) || want.length === 0) return true;
  const adapter = adapterFor(surface);
  return want.includes(adapter) || want.includes(surface);
}

export function isPatchResultSoftOk(row, patch = null) {
  if (!row) return false;
  if (ALWAYS_SOFT_STATUSES.has(row.status)) return true;
  const p = patch || ALL_PATCHES.find((x) => x.id === row.patch_id || x.id === row.id);
  if (p?.strictFiles && row.status === "pattern_not_found") return false;
  if (p?.optional && row.status === "pattern_not_found") return true;
  if (isLayoutSoftPatch(p) && row.status === "pattern_not_found") return true;
  return false;
}

export function summarizeApplyReport(report, patches = ALL_PATCHES) {
  const byId = new Map(patches.map((p) => [p.id, p]));
  const failed = [];
  const soft = [];
  for (const row of report) {
    const patch = byId.get(row.patch_id) || byId.get(row.id);
    if (isPatchResultSoftOk(row, patch)) soft.push(row);
    else failed.push(row);
  }
  return {
    failed,
    soft,
    applied: report.filter((r) => r.status === "applied").length,
    already: report.filter((r) => r.status === "already").length,
  };
}

export const DISPLAY_GROUP_BY_ID = new Map();

export const DISPLAY_SKIP = new Set(["skipped", "missing_file", "off"]);

export const DISPLAY_DONE = new Set(["applied", "already"]);

export function rollupDisplayStatus(statuses) {
  const list = (statuses || []).filter(Boolean);
  if (list.length === 0) return "skipped";
  if (list.some((s) => s === "pending")) return "pending";
  if (list.some((s) => s === "unmatched")) return "unmatched";
  if (list.every((s) => DISPLAY_SKIP.has(s))) return "skipped";
  if (list.some((s) => DISPLAY_DONE.has(s))) return "applied";
  return "skipped";
}

export function groupPatchesForDisplay(patches = ALL_PATCHES, patch_status = {}, surface) {
  const buckets = new Map();
  for (const p of patches) {
    if (!patchAppliesHere(p, surface)) continue;
    const st = patch_status[p.id];
    if (!st || st === "na") continue;
    const key = DISPLAY_GROUP_BY_ID.get(p.id) || `solo:${p.id}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { lead: p, ids: [], statuses: [] };
      buckets.set(key, bucket);
    }
    bucket.ids.push(p.id);
    bucket.statuses.push(st);
    if (p.id < bucket.lead.id) bucket.lead = p;
  }
  return [...buckets.values()]
    .sort((a, b) => a.lead.id - b.lead.id)
    .map((bucket) => ({
      id: bucket.lead.id,
      ids: bucket.ids,
      layer: bucket.lead.layer || "",
      status: rollupDisplayStatus(bucket.statuses),
    }));
}

export function tallyDisplayPatches(rows) {
  const out = { applied: 0, pending: 0, unmatched: 0, skipped: 0, total: 0, ready: 0 };
  for (const row of rows || []) {
    const st = row.status || row.st;
    out.total += 1;
    if (st === "applied" || st === "already") {
      out.applied += 1;
      out.ready += 1;
    } else if (st === "pending") out.pending += 1;
    else if (st === "unmatched") out.unmatched += 1;
    else {
      out.skipped += 1;
      out.ready += 1;
    }
  }
  return out;
}

export function patchStatusReady(status, patch = null) {
  if (status === "applied" || status === "already" || status === "off" || status === "disabled") return true;
  if (status === "skipped" || status === "missing_file") return true;
  if (status === "na") return false;
  if (status === "pattern_not_found" && patch?.strictFiles) return false;
  if (status === "pattern_not_found" && patch?.optional) return true;
  return false;
}
