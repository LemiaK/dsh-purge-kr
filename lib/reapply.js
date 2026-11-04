import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "./core.js";

const PLUGIN_ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

function pluginVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, "package.json"), "utf8"));
    return String(pkg.version || "");
  } catch {
    return "";
  }
}

function installedRevPath() {
  return path.join(core.findDshHome(), "dsh-purge", "installed-rev");
}

function installedRev() {
  try {
    return fs.readFileSync(installedRevPath(), "utf8").trim();
  } catch {
    return "";
  }
}

function appliedStampPath() {
  return path.join(core.findDshHome(), "dsh-purge", "applied.json");
}

function settleGuardPath() {
  return path.join(core.findDshHome(), "dsh-purge", "settle-restart.guard");
}

export function readAppliedStamp() {
  try {
    const raw = JSON.parse(fs.readFileSync(appliedStampPath(), "utf8"));
    return {
      version: String(raw.version || ""),
      sha: String(raw.sha || ""),
    };
  } catch {
    return null;
  }
}

function sameRev(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  // git sha 에는 짧은 접두사만 허용하고, apply:<version> 자리표시자는 문자열 전체가 같아야 한다.
  const isSha = /^[0-9a-f]{7,40}$/i.test(a) && /^[0-9a-f]{7,40}$/i.test(b);
  if (!isSha) return false;
  return a.startsWith(b) || b.startsWith(a);
}

function isApplyPlaceholder(sha) {
  const text = String(sha || "");
  return text.startsWith("apply:") || text === "applied";
}

function applyPlaceholderVersion(sha) {
  const m = String(sha || "").trim().match(/^apply:(.+)$/);
  return m ? m[1] : "";
}

function refreshStaleApplyPlaceholder(sha) {
  const ver = pluginVersion();
  const oldVer = applyPlaceholderVersion(sha);
  if (oldVer && ver && oldVer !== ver) return `apply:${ver}`;
  return String(sha || "").trim();
}

/** 수동 적용은 installed-rev 를 썼다는 보장이 없다. sha 가 비면 settle 이 항상 미정렬로 판정해 무한 재시작한다. */
export function resolveApplySha(explicit) {
  const wanted = String(explicit == null ? "" : explicit).trim();
  if (wanted) return refreshStaleApplyPlaceholder(wanted) || wanted;
  const rev = installedRev();
  if (rev) return refreshStaleApplyPlaceholder(rev) || rev;
  const ver = pluginVersion();
  return ver ? `apply:${ver}` : "applied";
}

function writeInstalledRev(sha) {
  const value = String(sha || "").trim();
  if (!value) return;
  const fp = installedRevPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${value}\n`, "utf8");
}

function writeAppliedStamp(sha) {
  const fp = appliedStampPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${JSON.stringify({
    version: pluginVersion(),
    sha: String(sha || "").trim(),
    at: new Date().toISOString(),
  }, null, 2)}\n`, "utf8");
}

/** 현재 플러그인 버전과 기록된 패치 버전이 같으면 기동 시 복원·재기록이 필요 없다. */
export function stampMatches(stamp, version, rev) {
  if (!stamp || !stamp.version || stamp.version !== version) return false;
  // sha 가 비면 stamp 가 불완전하다(과거에 빈 문자열을 잘못 기록했다). 정렬됨으로 볼 수 없다(#56).
  if (!stamp.sha) return false;
  const current = String(rev || "").trim();
  if (!current) return true;
  // 수동 적용 자리표시자와 이후 git rev 가 함께 있으면 version 만 인정해 다시 헛도는 것을 막는다.
  if (isApplyPlaceholder(stamp.sha) || isApplyPlaceholder(current)) return true;
  if (!sameRev(current, stamp.sha)) return false;
  return true;
}

/**
 * stamp 는 맞지만 호스트가 공식 업데이트로 sealed 로 되돌아갔거나 청소 표식이 사라졌으면 여전히 미정렬이다(#57).
 * 플러그인 루트를 찾지 못한 것(web 기동 초기, 순수 CLI)은 패치 손실이 아니다. 그렇게 보면 무한 재기록+재시작이 된다(#59).
 */
export function hostStillHasAppliedPatches() {
  try {
    if (core.desktopAsarStillSealed()) return false;
  } catch {
    /* 데스크톱 면 아님 */
  }
  try {
    const aiBase = core.findAiBase();
    if (!aiBase) return true;
    return core.hostCleanMarkersPresent(aiBase);
  } catch {
    return true;
  }
}

/** 빈 sha 는 “밀봉도 아니고 표식이 명확히 없는 것도 아닐 때”만 제자리에서 stamp 를 채울 수 있다. */
export function canHealEmptyStamp({ sealed = false, hasAiBase = false, markersPresent = false } = {}) {
  if (sealed) return false;
  if (hasAiBase && !markersPresent) return false;
  return true;
}

export function patchesMatchInstall() {
  if (!stampMatches(readAppliedStamp(), pluginVersion(), installedRev())) return false;
  return hostStillHasAppliedPatches();
}

/**
 * 패치별 실검: patchStatus 에 "pending" 이 나타나야 실제로 할 일이 있다.
 * hostCleanMarkersPresent 는 청소 marker 가 하나라도 있는지만 보므로, DSH 자체 업그레이드 후
 * agent-loop 같은 파일이 통째로 교체되어 #74/#87 marker 가 전부 사라진 드리프트를 찾지 못한다.
 */
export async function hostPatchesStillPending() {
  try {
    const aiBase = core.findAiBase();
    if (!aiBase) return false;
    const status = await core.patchStatus(aiBase);
    return Object.values(status).some((row) => row === "pending");
  } catch {
    return false;
  }
}

/** fast path 를 통과해도 패치별 pending 실검을 한 번 더 한다. DSH 업그레이드로 marker 가 드리프트하면 영원히 재기록하지 않게 되기 때문이다. */
export async function patchesMatchInstallStrict() {
  if (!patchesMatchInstall()) return false;
  if (await hostPatchesStillPending()) return false;
  return true;
}

/**
 * 호스트의 청소는 남아 있고 버전 stamp 만 낡았다. 기동 시 이것 때문에 revertAll 하면
 * 사용자가 적용을 누르고 재시작한 뒤 페이지가 다시 “청소가 필요하다”로 돌아간다.
 */
export async function hostCleanEnoughToKeep() {
  let aiBase = "";
  try {
    aiBase = core.findAiBase() || "";
  } catch {
    return false;
  }
  if (!aiBase || !core.hostCleanMarkersPresent(aiBase)) return false;
  const status = await core.patchStatus(aiBase);
  // "pending" 만 배제하면 부족하다: 앵커 불일치는 "unmatched"(strictFiles 패치)이고,
  // 그것도 “이 패치가 적용되지 않았다”는 뜻이라 “호스트가 청소되었다”로 보고 적용 stamp 를 찍으면 안 된다.
  return !Object.values(status).some((row) => row === "pending" || row === "unmatched");
}

/** applied stamp 는 있는데 호스트가 밀봉 asar 로 돌아갔거나 청소 marker 가 사라졌다: 패널에 “패치 손실”을 알린다(#57). 루트를 찾지 못한 것은 손실로 세지 않는다. */
export function patchesLostAfterHostReset() {
  const stamp = readAppliedStamp();
  if (!stamp?.version || !stamp?.sha) return false;
  try {
    if (core.desktopAsarStillSealed()) return true;
  } catch {
    /* 데스크톱 면 아님 */
  }
  try {
    const aiBase = core.findAiBase();
    if (aiBase && !core.hostCleanMarkersPresent(aiBase)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** 수동 “적용”이 성공한 뒤에도 stamp 를 찍는다. 아니면 재시작 후 settle 이 패치 미정렬로 보고 재시작을 다시 요구한다. */
export function markPatchesApplied(sha) {
  const resolved = resolveApplySha(sha);
  const current = installedRev();
  // 업데이트 채널이 기록한 git rev 가 있으면 그것을 따르고, 없으면 resolve 결과(apply:version 자리표시자 포함)를 쓴다.
  const finalSha = current && !isApplyPlaceholder(current) ? current : resolved;
  writeInstalledRev(finalSha);
  writeAppliedStamp(finalSha);
  return finalSha;
}

/**
 * #59/#60: 빈 sha 나 installed-rev 누락은 settle 이 기동마다 reapply+restart 하게 만든다.
 * 버전이 이미 정렬되어 있으면 먼저 비어 있지 않은 stamp / seed rev 를 채워 자동 재시작을 끊고, 실제로 패치가 빠졌을 때만 이후 로직이 다시 기록한다.
 */
export function healEmptyAppliedStamp() {
  const stamp = readAppliedStamp();
  const version = pluginVersion();
  if (!stamp || stamp.version !== version) return false;
  if (stamp.sha) {
    if (!installedRev()) writeInstalledRev(stamp.sha);
    return false;
  }
  let sealed = false;
  try { sealed = core.desktopAsarStillSealed(); } catch { /* ignore */ }
  let hasAiBase = false;
  let markersPresent = false;
  try {
    const aiBase = core.findAiBase();
    hasAiBase = Boolean(aiBase);
    markersPresent = Boolean(aiBase && core.hostCleanMarkersPresent(aiBase));
  } catch {
    /* 루트를 아직 찾지 못함 */
  }
  // 밀봉이거나 청소 marker 가 명확히 없다: stamp 를 채워 정렬된 척하면 #57 이 더 이상 자체 복구되지 않는다.
  if (!canHealEmptyStamp({ sealed, hasAiBase, markersPresent })) return false;
  markPatchesApplied();
  return true;
}

/** 설치 후 installed-rev 가 아직 없으면 먼저 자리표시자를 기록한다(tarball / 수동 적용에서 흔하다). */
export function ensureInstalledRevSeed() {
  const current = installedRev();
  if (current) {
    // installed-rev 가 이미 있으면 apply:<옛 버전> 을 일방적으로 현재 플러그인 버전으로 올리지 않는다:
    // applied.json 은 markPatchesApplied 만 기록하므로 rev 만 올리면 두 stamp 가 영구히 갈라진다
    // (신버전으로 업그레이드했지만 “적용”을 누르지 않은 경우 rev=신버전 / stamp=옛버전 이 된다).
    return current;
  }
  const stamp = readAppliedStamp();
  if (stamp?.sha) {
    writeInstalledRev(stamp.sha);
    return stamp.sha;
  }
  const sha = resolveApplySha();
  writeInstalledRev(sha);
  return sha;
}

/** settle 이 방금 재시작했다면 쿨다운을 둔다. “재기록→재시작→재기록”이 무한 루프가 되는 것을 막는다. */
export function shouldSkipSettleRestart(windowMs = 180000) {
  try {
    const raw = JSON.parse(fs.readFileSync(settleGuardPath(), "utf8"));
    if (String(raw.version || "") !== pluginVersion()) return false;
    const at = Date.parse(String(raw.at || "")) || 0;
    return at > 0 && Date.now() - at < windowMs;
  } catch {
    return false;
  }
}

export function markSettleRestart() {
  const fp = settleGuardPath();
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, `${JSON.stringify({
    version: pluginVersion(),
    at: new Date().toISOString(),
  }, null, 2)}\n`, "utf8");
}

/**
 * 먼저 호스트 파일을 백업에서 복원한 뒤 현재 이 플러그인의 패치로 다시 기록한다.
 * 낮은 버전은 자기 패치 목록을, 높은 버전은 자기 것을 가진다. 어느 버전으로 되돌리든 그 버전의 패치를 적용한다.
 */
export async function reapplyInstalled(options = {}) {
  core.applyRuntimeEnv();
  let aiBase = null;
  let handoff = null;
  let freshExtract = null;
  try {
    const state = await core.gatherState();
    aiBase = state.ai_base;
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
  const sealed = core.sealedAsarHandoff();
  if (!aiBase || sealed) {
    try {
      const opened = await core.openSealedDesktopHost({
        upgrade: options.upgrade === true,
        forApply: true,
      });
      if (opened.aiBase) aiBase = opened.aiBase;
      if (opened.swapAsar) handoff = opened;
      if (opened.extracted) freshExtract = opened;
    } catch (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) };
    }
  } else {
    core.rememberUnpackedArchive();
  }
  if (!aiBase) return { ok: false, error: core.missingAiBaseMessage() };
  // 방금 푼 것은 공식 원본이다. 이미 쓰고 있는 디렉터리도 먼저 복원한 뒤 이 버전으로 다시 기록한다.
  const preserveClientBundles = options.preserveClientBundles !== false;
  // DSH 자체 업그레이드는 호스트 파일을 통째로 새 버전으로 바꾸지만 옆의 옛 bak 은 그대로다. 이때 곧바로 revertAll 하면
  // 현재 신버전을 옛 버전으로 되돌려 신·구 코드가 섞여 바로 깨진다. 먼저 "원문에 dsh-purge marker 가 없는데 bak 과 바이트가 다른" bak 을
  // current 로 밀어 넣고 revertAll 하면 새 호스트를 망가뜨리지 않으며, 이어서 applyPatches 가 marker 를 복구한다.
  if (!freshExtract) {
    try {
      const refreshed = core.refreshStaleBaksForUpgrade(aiBase);
      if (refreshed.length) {
        console.warn(`[dsh-purge] refreshed ${refreshed.length} stale bak(s) before revert:`, refreshed);
      }
    } catch (e) {
      console.warn("[dsh-purge] refresh stale bak failed:", String(e && e.message ? e.message : e));
    }
  }
  const reverted = freshExtract ? { reverted: [] } : await core.revertAll(aiBase, { preserveClientBundles });
  if (!freshExtract) await core.revertAllShims();
  const multi = await core.applyPatchesAllHosts(core.ALL_PATCHES, { preserveClientBundles, forApply: true });
  await core.patchAllShims();
  const flash = core.silenceCmdFlash(multi.hosts[0]?.aiBase || aiBase);
  const summary = core.summarizeApplyReport(multi.report);
  const clean =
    summary.failed.length === 0 &&
    (core.allPatchHostsWritten(multi.hosts) || core.hostCleanMarkersPresent(aiBase));
  if (clean && flash.ok !== true) {
    console.warn("[dsh-purge] cmd flash patch did not apply cleanly; clean flow continues, UI shows cmdFlashOk=false");
  }
  if (!clean && freshExtract) {
    const restored = core.restoreSealedExtract(freshExtract.appDir, freshExtract.prev);
    return {
      ok: false,
      error: restored ? "청소를 마치지 못해 직전에 푼 디렉터리로 되돌렸습니다" : "청소를 마치지 못했습니다",
      restored,
      version: pluginVersion(),
      reverted: 0,
      applied: summary.applied || 0,
      failed: summary.failed.length,
      renamed: false,
      needsFullQuit: false,
      cmdFlashOk: flash.ok === true,
    };
  }
  if (clean) {
    markPatchesApplied(installedRev() || undefined);
    if (freshExtract?.archive) core.writeUnpackedAsarStamp(freshExtract.archive);
    try {
      const seed = core.seedPromptInjectAtBoot(core.findDshHome());
      if (seed && seed.action === "error") {
        console.warn("[dsh-purge] seed prompt-inject failed:", seed.reason);
      }
    } catch (e) {
      console.warn("[dsh-purge] seed prompt-inject exception:", String(e && e.message ? e.message : e));
    }
  }
  let renamed = false;
  if (clean && handoff?.asar && options.scheduleSwap !== false) {
    const swapped = core.scheduleSealedDesktopRestart(handoff);
    renamed = Boolean(swapped?.renamed);
  }
  const pending = Boolean(handoff?.asar && !renamed && options.scheduleSwap !== false);
  // app.asar 를 실제로 치워야 현재 프로세스가 옛 패키지에 남아 있게 되므로 한 번 더 열어야 한다.
  // 공식 쪽이 이미 resources/app 에서 돌고 있으면 ELECTRON_RUN_AS_NODE 만으로 “재시작 필요”를 띄우면 안 되고,
  // 아니면 패널을 열 때마다 재시작을 다시 요구하게 된다.
  return {
    ok: clean,
    error: clean ? "" : "청소를 마치지 못했습니다",
    version: pluginVersion(),
    reverted: reverted.reverted?.length || 0,
    applied: summary.applied || 0,
    failed: summary.failed.length,
    renamed,
    needsFullQuit: renamed || pending,
    cmdFlashOk: flash.ok === true,
  };
}
