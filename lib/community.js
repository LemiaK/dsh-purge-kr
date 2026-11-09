import {diskFs} from "./extract-asar.js";
import { removeTreeNoFollowSync } from "./remove-tree.js";
import { downloadArchive, mirrorPrefix } from './update-download.js';
import fs from "node:fs";
import { acquireMaintenanceLock } from "./maintenance-lock.js";
import { atomicFiles } from "./atomic-files.js";
const writeProfilePatch = atomicFiles(fs).atomicWriteSync;
import { migrateReferences, installedYaml, readProfilePatch, aliasRollbackReferences } from "./market-migration.js";
import { requestUpdate } from "./update-http.js";
import { repairRuntimeForCli } from "./runtime-layout.js";
import { resolveProfile, resolveDshCli, normalizeHostBase, desktopResourcesForHost } from "./instance.js";
import { desktopIdentity, sealedHostEvidence } from "./desktop-identity.js";
import path from "node:path";
import { createHash, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { installWithRegistryRecovery } from "./install-registry.js";
import { packRestoredPackage, verifyInstalledPackage, checkpointProfile } from "./rollback-transaction.js";
const exec = promisify(execFile);
export const REPOSITORY = "wnduddld0513/dsh-purge-kr";
export const PACKAGE = "dsh-purge-community";
export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const PURGE_PACKAGES = ["dsh-purge", "dsh-purge-panel", PACKAGE];

export function readJSON(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}
export function atomic(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const tmp = file + "." + randomBytes(6).toString("hex") + ".tmp";
  const fd = fs.openSync(tmp, "wx", 0o600);
  try {
    fs.writeFileSync(fd, value);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, file);
}
const hash = (data) => createHash("sha256").update(data).digest("hex");
function treeBytes(root) {
  let total = 0;
  const walk = (dir) => {
    try { if (fs.lstatSync(dir).isSymbolicLink()) return; } catch { return; }
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fp = path.join(dir, entry.name);
      try {
        const stat = fs.lstatSync(fp);
        if (stat.isSymbolicLink()) continue;
        if (stat.isDirectory()) walk(fp);
        else if (stat.isFile()) total += stat.size;
      } catch { /* 동시 삭제 경합이면 무시 */ }
    }
  };
  walk(root);
  return total;
}

/**
 * 패치를 하나씩 검증해 앵커가 맞는 것이 확인된 호스트 버전.
 * 항목을 추가하려면 "원본 호스트 소스 회귀" 증거(test/patch-anchors 케이스)를 함께 내야 한다.
 * 이 기기에서 그냥 돌아갔다는 이유만으로 넣으면 안 된다.
 */
// 원본 호스트 소스에서 ALL_PATCHES 전부의 앵커를 하나씩 대조해(patchDrift => drifted 0) 확인한 뒤에야 이 목록에 들어온다.
// 0.2.1-rc.5: 공식 nightly 2026-10-29 빌드, 패치 82개 드리프트 0, 데스크톱 셸 5개
// (#45/#46/#82/#83/#84) 또한 Resources/app 레이아웃에서 동일하게 적중했다. 런타임 동작은 사용자가 업데이트한 뒤 자체 점검으로 확인해야 한다.
export const QUALIFIED_HOST_VERSIONS = Object.freeze(["0.2.2-rc.1", "0.2.1-rc.1", "0.2.1-rc.2", "0.2.1-rc.3", "0.2.1-rc.5"]);

function readVersion(reader, aiBase, pkg) {
  try {
    return JSON.parse(
      reader.readFileSync(path.join(aiBase, pkg, "package.json"), "utf8"),
    ).version;
  } catch {
    return "";
  }
}

/** 호스트 계열(패키지 증거만 본다). 빈 문자열이면 이 경로가 데스크톱 resources 안에 없다는 뜻이다. */
function hostFamilyOf(aiBase) {
  const resources = desktopResourcesForHost(aiBase);
  if (!resources) return "";
  try {
    return (desktopIdentity(resources) || {}).kind || "";
  } catch {
    return "";
  }
}

/**
 * 호환성 보고. **진단만 하고 비활성화는 하지 않는다**:
 * 호스트를 찾으면 패치 기록을 허용하고(기록 전에는 반드시 백업), 앵커 드리프트는 항목별 진단으로 보고한다.
 * 더 이상 전역 스위치 하나로 모든 버전의 패치를 한꺼번에 멈추지 않는다.
 *
 * 판정은 두 계층으로 나눈다. 더 이상 하나의 qualified 로 합치지 않는다:
 * - kernel: 내부 컴포넌트 버전이 항목별 회귀를 거친 목록에 있는지
 * - family: 이 데스크톱 셸(공식 bundled-host / 서드파티 NEXT / legacy community)의
 *   전체 설치와 패키지 교체 경로가 회귀를 거쳤는지
 * 서드파티 셸은 내부 버전이 목록에 들어 있어도 전체 설치로는 qualified 가 아니다 — 그 셸 코드 자체를 검증한 적이 없다.
 */
export function compatibility(aiBase, reader = fs) {
  aiBase = normalizeHostBase(aiBase, reader);
  const resources = desktopResourcesForHost(aiBase);
  let sealed = null;
  if (resources) {
    let unpacked = false;
    try { diskFs().lstatSync(path.join(resources, "app")); unpacked = true; }
    catch (error) { if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error; }
    if (!unpacked) sealed = sealedHostEvidence(resources);
  }
  const version = sealed?.version || readVersion(reader, aiBase, "dsh-agent-loop");
  const promptVersion = sealed?.promptVersion || readVersion(reader, aiBase, "dsh-system-prompt");
  const mixed = !!version && !!promptVersion && version !== promptVersion;
  let layout = false;
  try {
    layout = !!aiBase
      && reader.statSync(
        path.join(aiBase, "dsh-agent-instructions", "lib"),
      ).isDirectory();
  } catch {
    layout = false;
  }
  layout = layout || Boolean(sealed);
  const kernelQualified = !mixed
    && !!version
    && version === promptVersion
    && QUALIFIED_HOST_VERSIONS.includes(version);
  const family = hostFamilyOf(aiBase);
  // NEXT 는 독립 계열이다: 패치 앵커를 그 셸에서 항목별로 회귀한 적이 없으므로 전체 설치를 검증된 것으로 볼 수 없다.
  const familyQualified = family !== "next" && family !== "bundled-cli";
  const qualified = kernelQualified && familyQualified;
  // "호스트를 아예 찾지 못한" 경우에만 기록할 수 없다고 본다. 컴포넌트 버전 불일치도 보고일 뿐이다:
  // 기록할 패치는 하나도 빠뜨리지 않고, 기록 오류 위험은 항목별 상태와 백업으로 막는다. 전역 스위치를 함께 잃지 않는다.
  const patchWritesAllowed = layout && !sealed;
  const runtimeSupported = !mixed && !!version && !!promptVersion && version === promptVersion;
  return {
    host_version: version || "unknown",
    prompt_version: promptVersion || "unknown",
    runtime_supported: runtimeSupported,
    patch_writes_allowed: patchWritesAllowed,
    layout_found: layout,
    host_family: family || "unknown",
    kernel: {
      version: version || "unknown",
      prompt_version: promptVersion || "unknown",
      qualified: kernelQualified,
    },
    family_qualified: familyQualified,
    qualified,
    sealed_host: Boolean(sealed),
    level: mixed
      ? "mixed"
      : sealed ? "sealed"
      : !layout
        ? "no-host"
        : qualified
          ? "qualified"
          : kernelQualified && !familyQualified
            ? "kernel-verified"
            : "unverified",
    message: sealed ? `아카이브 안의 호스트를 찾았습니다; 컴포넌트 버전: agent-loop ${version || "누락/미확인"}, system-prompt ${promptVersion || "누락/미확인"}${mixed ? "(버전 불일치)" : ""}. 아직 언팩하지 않았으므로 아카이브에 직접 쓸 수 없습니다; 플러그인 설치가 호스트 변경 적용을 뜻하지는 않습니다.` : mixed
      ? "호스트 컴포넌트 버전이 다릅니다(agent-loop 과 system-prompt 가 다른 버전): 그래도 패치 표대로 기록하며 항목별 상태가 기준입니다. 설치를 고치는 편이 좋습니다."
      : !layout
        ? "호스트 @deepseek-ai 디렉터리를 찾지 못했습니다. 공식 데스크톱판에서 “적용”을 누르면 app.asar 를 푼 뒤 재시작하고 자동으로 이어서 진행합니다."
        : qualified
          ? `DSH ${version}: 항목별 패치 앵커 회귀 검증을 통과했으므로 바로 적용할 수 있습니다. 기록 전에 자동 백업합니다.`
          : kernelQualified && !familyQualified
            ? `DSH ${version} 커널 버전은 항목별 회귀를 통과했습니다; 다만 ${family} 호스트 계열의 전체 설치와 패키지 교체 경로는 검증되지 않아 회귀 완료 버전으로 보고하지 않습니다. 적용은 가능하고 기록 전에 백업하며, 결과는 항목별 진단으로 확인합니다.`
            : `DSH ${version} 은 검증 목록에 없습니다: 적용은 가능하고 기록 전에 백업합니다. 적용 후 항목별 진단으로 앵커 드리프트를 확인하세요.`,
  };
}

/**
 * 옛 호출 지점과 호환된다. 지금은 "호스트를 전혀 찾지 못했을 때"만 오류를 던지고,
 * 버전 미확인/앵커 드리프트는 더 이상 막지 않는다. 그것은 상태 표시이지 기록 게이트가 아니다.
 */
export function requirePatchCompatibility(aiBase, reader = fs) {
  const value = compatibility(aiBase, reader);
  if (!value.layout_found)
    throw Error(`Purge: 호스트 디렉터리를 찾지 못해 기록할 수 없습니다. ${value.message}`);
  if (value.sealed_host) throw Error("Purge: 호스트가 아직 읽기 전용 app.asar 안에 있습니다. 대상 설치의 언팩을 먼저 마치세요. 아카이브나 다른 설치에는 기록하지 않았습니다.");
  // mixed 는 더 이상 막지 않고 보고만 한다. 호출자가 알리고 싶으면 value.message 를 읽는다.
  if (value.level === "mixed") console.warn(`[dsh-purge] ${value.message}`);
  return value;
}

/** 항목별 앵커 진단: 호스트 업그레이드 후 어느 패치의 위치 문자열이 바뀌었는지 확인할 때 쓴다. */
export async function diagnosePatches(aiBase, coreModule) {
  const core = coreModule || (await import("./core.js"));
  const status = await core.patchStatus(aiBase);
  return core.ALL_PATCHES.map((p) => ({
    id: p.id,
    name: p.name,
    layer: p.layer,
    optional: !!p.optional,
    status: status[p.id],
    keys: Array.isArray(p.file) ? p.file.slice() : [p.file],
  })).filter((row) => row.status !== "applied" && row.status !== "na");
}
/** Shared by maintenance and read-only diagnostics; never guess desktop. */
export function defaultProfile(home, options) {
  return resolveProfile(home, options).directory;
}
function copyTree(source, dest) {
  const st = fs.lstatSync(source);
  if (st.isSymbolicLink()) throw Error("백업 내용에 심볼릭 링크가 있어 진행하지 않았습니다");
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true, mode: 0o700 });
    for (const name of fs.readdirSync(source))
      if (!["node_modules", ".git"].includes(name))
        copyTree(path.join(source, name), path.join(dest, name));
  } else if (st.isFile()) {
    fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
    fs.copyFileSync(source, dest);
    fs.chmodSync(dest, 0o600);
  } else throw Error("일반 파일과 디렉터리만 백업합니다");
}
/**
 * 내용 주소 기반 중복 제거: DEDUPE_MIN 보다 큰 파일은 base/objects/<sha256> 에 한 번만 저장하고,
 * 백업 디렉터리에는 중복해서 두지 않는다. 작은 파일은 예전처럼 복사한다(수백 바이트 때문에 객체를 잔뜩 만들지 않는다).
 * 같은 client.js 는 8 개 스냅샷에 있어도 공간을 한 벌만 차지한다.
 */
export const DEDUPE_MIN = 32 * 1024;

function copyTreeDedup(source, dest, objects, blobs, rel = "", beat = null) {
  // Check ownership during synchronous snapshot traversal too.
  beat?.();
  const st = fs.lstatSync(source);
  if (st.isSymbolicLink()) throw Error("백업 내용에 심볼릭 링크가 있어 진행하지 않았습니다");
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true, mode: 0o700 });
    for (const name of fs.readdirSync(source))
      if (!["node_modules", ".git"].includes(name))
        copyTreeDedup(
          path.join(source, name),
          path.join(dest, name),
          objects,
          blobs,
          rel ? path.posix.join(rel, name) : name,
          beat,
        );
    return;
  }
  if (!st.isFile()) throw Error("일반 파일과 디렉터리만 백업합니다");
  const key = rel;
  if (st.size >= DEDUPE_MIN) {
    const data = fs.readFileSync(source);
    const sum = hash(data);
    const blob = path.join(objects, sum);
    if (!fs.existsSync(blob)) {
      fs.mkdirSync(objects, { recursive: true, mode: 0o700 });
      const tmp = blob + "." + randomBytes(4).toString("hex") + ".tmp";
      fs.writeFileSync(tmp, data, { mode: 0o600 });
      fs.renameSync(tmp, blob);
    }
    blobs[key] = sum;
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
  fs.copyFileSync(source, dest);
  fs.chmodSync(dest, 0o600);
}

/** 백업 안의 하위 트리를 꺼내 쓴다. 중복 제거 객체는 rel 접두사로 되찾는다. */
function materializeTree(folder, relDir, dest, blobs, objects) {
  const abs = path.join(folder, relDir);
  if (fs.existsSync(abs)) copyTree(abs, dest);
  const prefix = relDir.split(path.sep).join(path.posix.sep) + "/";
  for (const [rel, sum] of Object.entries(blobs || {})) {
    if (!rel.startsWith(prefix)) continue;
    const target = path.join(dest, rel.slice(prefix.length));
    fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
    fs.copyFileSync(path.join(objects, sum), target);
    fs.chmodSync(target, 0o600);
  }
}

function blobsIn(manifest) {
  return manifest && manifest.blobs ? manifest.blobs : {};
}

function treeHashes(root, rel = "", out = {}, beat = null) {
  for (const name of fs.readdirSync(path.join(root, rel))) {
    beat?.();
    const key = path.posix.join(rel, name),
      p = path.join(root, key),
      st = fs.lstatSync(p);
    if (st.isSymbolicLink()) throw Error("백업에 심볼릭 링크가 있습니다");
    if (st.isDirectory()) treeHashes(root, key, out, beat);
    else if (st.isFile()) out[key] = hash(fs.readFileSync(p));
  }
  return out;
}
function validId(id) {
  if (!/^[0-9TZa-f-]{15,80}$/.test(id || "")) throw Error("백업 ID 가 유효하지 않습니다");
  return id;
}
export class Maintenance {
  constructor({
    home,
    profile,
    root = ROOT,
    aiBase = "",
    installer = installWithDsh,
    verifier = verifyInstalledPackage,
  } = {}) {
    if (!home) throw Error("DSH 데이터 디렉터리를 확정하지 못했습니다");
    try {
      this.home = fs.realpathSync(home);
    } catch {
      throw Error(`DSH 데이터 디렉터리를 찾지 못했습니다: ${home}`);
    }
    try {
      const selected = resolveProfile(this.home, { profile });
      this.profile = selected.directory;
      this.profileName = selected.name;
    } catch (e) {
      throw Error(`현재 profile 을 찾지 못했습니다: ${e.message} (PURGE_PROFILE_DIR 로 지정할 수 있습니다)`);
    }
    this.root = path.resolve(root);
    this.aiBase = aiBase;
    this.installer = installer;
    this.preflight = installer === installWithDsh ? () => resolveDshCli({aiBase:this.aiBase}) : () => {};
    this.verifier = verifier;
    this.base = path.join(this.home, "dsh-purge-community");
    this.backups = path.join(this.base, "backups");
    this.objects = path.join(this.base, "objects");
    // Synchronous file work and every post-await commit check ownership.
    this.beat = null;
  }
  async locked(fn) {
    fs.mkdirSync(this.base, { recursive: true, mode: 0o700 });
    fs.chmodSync(this.base, 0o700);
    const guard = acquireMaintenanceLock(this.base);
    this.beat = guard.check;
    this.maintenanceCommitted = false;
    let result;
    const warn = error => {
      result.cleanup_warnings ??= [];
      result.cleanup_warnings.push(error);
      result.note = (result.note || '') + ` 유지보수 마무리 미완료: ${error.stage}:${error.code}, 현장을 보존했으니 확인한 뒤 다시 유지보수하세요.`;
    };
    try {
      result = await fn();
      try { guard.check(); }
      catch(error) {
        if(!this.maintenanceCommitted) throw error;
        warn({stage:'post-commit-lock',code:error.code || 'LOCK_CHECK_FAILED'});
      }
      return result;
    } finally {
      this.beat = null;
      const warning=guard.release();
      if(warning && result && typeof result==='object') warn(warning);
    }
  }
  list() {
    if (!fs.existsSync(this.backups)) return [];
    return fs
      .readdirSync(this.backups)
      .flatMap((id) => {
        if (!/^[0-9TZa-f-]{15,80}$/.test(id)) return [];
        const m = readJSON(path.join(this.backups, id, "manifest.json"));
        return m?.complete
          ? [
              {
                id,
                created_at: m.created_at,
                reason: m.reason,
                host_version: m.host_version,
                plugins: m.plugins.map((p) => ({
                  name: p.name,
                  version: p.version,
                })),
              },
            ]
          : [];
      })
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  backup(reason = "manual") {
    return this.locked(async () => {
      const saved = this.snapshot(reason);
      this.prune();
      return saved;
    });
  }
  pruneLocked(options) {
    return this.locked(() => this.prune(options));
  }
  /** 현재 백업 점유량(패널/CLI 표시용). */
  usage() {
    const list = this.list();
    let bytes = 0;
    for (const item of list) bytes += treeBytes(path.join(this.backups, item.id));
    const objects = treeBytes(this.objects);
    return { count: list.length, bytes: bytes + objects, snapshots: bytes, objects };
  }
  /** 어떤 백업에서도 참조하지 않는 중복 제거 객체를 지운다. */
  gcObjects() {
    this.beat?.();
    if (!fs.existsSync(this.objects)) return { removed: 0, freed: 0 };
    const referenced = new Set();
    for (const item of this.list()) {
      const m = readJSON(path.join(this.backups, item.id, "manifest.json"));
      for (const sum of Object.values((m && m.blobs) || {})) referenced.add(sum);
    }
    let removed = 0;
    let freed = 0;
    for (const name of fs.readdirSync(this.objects)) {
      this.beat?.();
      if (referenced.has(name)) continue;
      const fp = path.join(this.objects, name);
      try {
        const size = fs.statSync(fp).size;
        fs.rmSync(fp, { force: true });
        removed += 1;
        freed += size;
      } catch {
        /* ignore */
      }
    }
    return { removed, freed };
  }
  /**
   * 보존 정책: 최근 keepLast 개는 반드시 남기고, 나머지는 날짜당 최대 1 개, 최대 keepDays 일까지 남긴다.
   * 마지막으로 총 크기 상한에 맞춰 오래된 것부터 정리한다. "사용 중" 상태인 백업은 삭제하지 않는다.
   * 롤백 대상은 verify() 가 먼저 검증하며, 호출자가 protect 를 넘겨 보호한다.
   */
  prune({ keepLast = 5, keepDays = 7, maxTotalBytes = 200 * 1024 * 1024, protect = "" } = {}) {
    this.beat?.();
    const list = this.list(); // 새 것 → 옛 것
    if (!list.length) return { removed: [], freed: 0, kept: 0 };
    const keep = new Set(list.slice(0, Math.max(1, keepLast)).map((b) => b.id));
    if (protect) keep.add(protect);
    const days = new Set();
    for (const item of list) {
      if (keep.has(item.id)) {
        days.add(String(item.created_at).slice(0, 10));
        continue;
      }
      const day = String(item.created_at).slice(0, 10);
      if (days.size >= keepDays || days.has(day)) continue;
      days.add(day);
      keep.add(item.id);
    }
    const removed = [];
    const errors = [];
    let freed = 0;
    for (const item of list.slice().reverse()) {
      // 가장 오래된 것부터 지운다.
      if (keep.has(item.id)) continue;
      const folder = path.join(this.backups, item.id);
      this.beat?.();
      try {
        const size = treeBytes(folder);
        removeTreeNoFollowSync(folder);
        removed.push(item.id);
        freed += size;
      } catch (error) { errors.push({ stage: "prune", code: error.code || "CLEANUP_FAILED" }); }
    }
    let total = 0;
    const survivors = this.list();
    for (const item of survivors) total += treeBytes(path.join(this.backups, item.id));
    for (const item of survivors.slice().reverse()) {
      if (total <= maxTotalBytes) break;
      if (item.id === protect || item.id === survivors[0].id) continue;
      const folder = path.join(this.backups, item.id);
      this.beat?.();
      try {
        const size = treeBytes(folder);
        removeTreeNoFollowSync(folder);
        removed.push(item.id);
        freed += size;
        total -= size;
      } catch (error) { errors.push({ stage: "prune", code: error.code || "CLEANUP_FAILED" }); }
    }
    const gc = this.gcObjects();
    return { removed, freed, kept: Math.max(0, this.list().length), gc, errors };
  }
  snapshot(reason) {
    this.beat?.();
    const id =
      new Date().toISOString().replace(/[:.]/g, "-") +
      "-" +
      randomBytes(4).toString("hex");
    const folder = path.join(this.backups, id);
    fs.mkdirSync(folder, { recursive: true, mode: 0o700 });
    const pkg = readJSON(path.join(this.profile, "package.json"), {}),
      plugins = [],
      blobs = {};
    try {
      for (const name of PURGE_PACKAGES) {
        const logical = path.join(this.profile, "node_modules", name);
        if (!fs.existsSync(logical)) continue;
        const source = fs.realpathSync(logical),
          meta = readJSON(path.join(source, "package.json"));
        if (meta?.name !== name && !(name === "dsh-purge" && meta?.name === PACKAGE)) throw Error("플러그인 패키지 식별자가 일치하지 않습니다");
        const rel = path.join("plugins", name);
        copyTreeDedup(source, path.join(folder, rel), this.objects, blobs, path.posix.join("plugins", name), this.beat);
        plugins.push({ name, ...(meta.name !== name ? {packageName:meta.name} : {}), version: meta.version, folder: rel });
      }
      for (const [label, p] of [
        ["profile-package", path.join(this.profile, "package.json")],
        ["profile-config", path.join(this.profile, "cordis.patch.yml")],
        ["profile-lock", path.join(this.profile, "pnpm-lock.yaml")],
        ["prompt", path.join(this.home, "prompt-inject.md")],
        ["purge-state", path.join(this.home, "dsh-purge")],
        ["rules", path.join(this.home, "rules")],
      ]) {
        if (fs.existsSync(p))
          copyTreeDedup(p, path.join(folder, "settings", label), this.objects, blobs, path.posix.join("settings", label), this.beat);
      }
      const sums = treeHashes(folder, "", {}, this.beat);
      const m = {
        schema: 2,
        id,
        created_at: new Date().toISOString(),
        reason,
        host_version: compatibility(this.aiBase).host_version,
        profile: this.profile,
        home: this.home,
        plugins,
        sums,
        blobs,
        bundles: (pkg.dsh?.profile?.bundles || []).filter((n) =>
          PURGE_PACKAGES.includes(n),
        ),
        complete: true,
      };
      this.beat?.();
      atomic(path.join(folder, "manifest.json"), JSON.stringify(m, null, 2));
      return {
        id,
        folder,
        plugins: plugins.map((p) => ({ name: p.name, version: p.version })),
      };
    } catch (e) {
      this.beat?.();
      atomic(
        path.join(folder, "failed.json"),
        JSON.stringify({ error: e.message }),
      );
      throw e;
    }
  }
  verify(id) {
    const folder = path.join(this.backups, validId(id));
    if (fs.realpathSync(folder) !== folder)
      throw Error("백업 경로는 심볼릭 링크일 수 없습니다");
    const m = readJSON(path.join(folder, "manifest.json"));
    if (
      !m?.complete ||
      ![1, 2].includes(m.schema) ||
      m.id !== id ||
      m.home !== this.home ||
      m.profile !== this.profile
    )
      throw Error("이 백업은 현재 데이터 디렉터리나 profile 의 것이 아닙니다");
    const actual = treeHashes(folder);
    delete actual["manifest.json"];
    const blobs = m.blobs || {};
    if (
      JSON.stringify(Object.keys(actual).sort()) !==
      JSON.stringify(Object.keys(m.sums).sort())
    )
      throw Error("백업 파일 집합이 일치하지 않습니다");
    for (const [rel, sum] of Object.entries(m.sums))
      if (actual[rel] !== sum) throw Error("백업 검증 실패: " + rel);
    for (const [rel, sum] of Object.entries(blobs)) {
      const blob = path.join(this.objects, sum);
      if (!fs.existsSync(blob)) throw Error("중복 제거 객체가 없습니다: " + rel);
      if (hash(fs.readFileSync(blob)) !== sum) throw Error("중복 제거 객체 검증 실패: " + rel);
    }
    for (const p of m.plugins)
      if (
        !PURGE_PACKAGES.includes(p.name) ||
        (p.packageName !== undefined && !(p.name === "dsh-purge" && p.packageName === PACKAGE)) ||
        p.folder !== path.join("plugins", p.name)
      )
        throw Error("백업의 플러그인 경로가 유효하지 않습니다");
    return { m, folder };
  }
  finishCleanup(checkpoint, protect) {
    this.maintenanceCommitted = true;
    const warnings = [];
    try {
      this.beat?.();
      const result = this.prune({ protect });
      warnings.push(...(result.errors || []));
    } catch (error) { warnings.push({ stage: "prune", code: error.code || "CLEANUP_FAILED" }); }
    try { this.beat?.(); checkpoint.finish(); }
    catch (error) { warnings.push({ stage: "checkpoint", code: error.code || "CLEANUP_FAILED" }); }
    return warnings;
  }
  rollback(id) {
    return this.locked(async () => {
      const { m, folder } = this.verify(id);
      if (!m.plugins.length) throw Error("이 백업에는 롤백할 플러그인이 없습니다");
      this.preflight();
      const safety = this.snapshot("before-rollback");
      const migrationFile = path.join(this.base, "migrations", id + ".json");
      const migration = fs.existsSync(migrationFile) ? JSON.parse(fs.readFileSync(migrationFile, "utf8")) : null;
      if (migration && (migration.schema !== 1 || !Array.isArray(migration.changes))) throw Error("마이그레이션 기록이 유효하지 않아 롤백하지 않았습니다");
      const patch = readProfilePatch(this.profile);
      const restoreAlias = m.bundles.includes('dsh-purge') && !m.bundles.includes(PACKAGE)
        && m.plugins.some(p => p.name === 'dsh-purge' && p.packageName === PACKAGE);
      const reverse = migration?.changes?.length ? migration.changes : restoreAlias ? aliasRollbackReferences() : [];
      const reverted = reverse.length
        ? migrateReferences(patch.text, installedYaml(this.profile), reverse) : {text: patch.text, changes: []};
      const revertedPatch = reverted.text;
      // Stage immutable restored copies, install through DSH; never restore a whole profile/config file.
      const stage = path.join(
        this.base,
        "restored",
        id + "-" + randomBytes(6).toString("hex"),
      );
      fs.mkdirSync(stage, { recursive: true, mode: 0o700 });
      const archives = [];
      for (const p of m.plugins) {
        const base = path.join(stage, p.name);
        const to = path.join(base, "package");
        materializeTree(folder, p.folder, to, blobsIn(m), this.objects);
        const meta = readJSON(path.join(to,"package.json"));
        if (meta?.name !== (p.packageName || p.name) || meta.version !== p.version) throw Error("롤백 패키지 식별자가 유효하지 않습니다");
        const archive = path.join(base, p.name + ".tgz");
        await packRestoredPackage(to, archive);
        this.beat?.();
        archives.push({archive, meta:{...meta, dependencyName:p.name}});
      }
      const checkpoint = checkpointProfile(this.profile, path.join(stage, "recovery"));
      try {
        for (const {archive,meta} of archives) {
          this.beat?.();
          await this.installer(archive, this, {dependencyName:meta.dependencyName});
          this.beat?.();
          await this.verifier(this.profile,meta);
          this.beat?.();
        }
        const file = path.join(this.profile, "package.json"),
          pkg = readJSON(file);
        if (!pkg) throw Error("profile package.json 이 유효하지 않습니다");
        pkg.dsh ??= {};
        pkg.dsh.profile ??= {};
        pkg.dsh.profile.bundles = [
          ...(pkg.dsh.profile.bundles || []).filter(
            (n) => !PURGE_PACKAGES.includes(n),
          ),
          ...m.bundles,
        ];
        atomic(file, JSON.stringify(pkg, null, 2) + "\n");
        if (revertedPatch !== patch.text) {
          if (readProfilePatch(this.profile).text !== patch.text) throw Error("설정이 동시에 수정되어 덮어쓰지 않았습니다");
          atomic(path.join(this.base, "migrations", safety.id + ".json"), JSON.stringify({schema: 1, changes: reverted.changes}));
          writeProfilePatch(patch.file, revertedPatch);
        }
        // Cleanup is best-effort after verified success; cleanup failure must not
        // enter recovery after the checkpoint has already been removed.
        const cleanupWarnings = this.finishCleanup(checkpoint, id);
        return {
          ok: true,
          backup_id: safety.id,
          restored_id: id,
          restart_required: true,
          preserved_settings: true,
          cleanup_warnings: cleanupWarnings,
          note: (cleanupWarnings.length ? "정리 미완료(" + cleanupWarnings.map(w => w.stage + ":" + w.code).join(", ") + "), 잔여물은 보존했습니다. 설치 결과는 검증되었고 자동 롤백은 하지 않습니다." : "") + "플러그인을 롤백하고 그 활성화 진입점을 복원했습니다. 현재 프롬프트, 규칙, 연결 설정, 다른 플러그인은 덮어쓰지 않았습니다. DSH 를 직접 종료하고 다시 실행하세요.",
        };
      } catch (error) {
        let recovery;
        try { this.beat?.(); checkpoint.restore(); recovery = "롤백 전 의존성, 설치, 매니페스트를 복원했습니다"; }
        catch (restoreError) { recovery = "자동 복원 미완료: " + restoreError.message; }
        throw Error(`롤백 실패: ${error.message}; ${recovery}; 백업 ${safety.id} 은 보존했습니다`);
      }
    });
  }
  async install(file, { reason = "before-update" } = {}) {
    return this.locked(async () => {
      const expected = await validateArchive(file);
      this.preflight();
      this.beat?.();
      // tgz 를 영속 디렉터리로 복사한다: pnpm 은 file: 경로를 package.json 에 기록하므로,
      // /tmp 나 Downloads 의 원본을 그대로 쓰면 다음 install/remove 때 패키지를 찾지 못한다.
      const stable = path.join(this.base, "pkgs", hash(fs.readFileSync(file)));
      fs.mkdirSync(stable, { recursive: true, mode: 0o700 });
      const keep = path.join(stable, path.basename(file));
      if (path.resolve(file) !== path.resolve(keep)) fs.copyFileSync(file, keep);
      file = keep;
      const before = this.snapshot(reason),
        manifestFile = path.join(this.profile, "package.json");
      const prior = fs.existsSync(manifestFile) ? readJSON(manifestFile) : {};
      if (!prior) throw Error("업그레이드 전 profile package.json 이 유효하지 않습니다");
      const priorSpec = prior.dependencies?.[PACKAGE];
      const fromLatest = typeof priorSpec === "string" &&
        /^https:\/\/github\.com\/kingcharleslzy-ai\/dsh-purge\/releases\/latest\/download\/dsh-purge-community(?:-[0-9]+\.[0-9]+\.[0-9]+)?\.tgz$/.test(priorSpec);
      const keepDisabled = fromLatest && !(prior.dsh?.profile?.bundles || []).some(name => PURGE_PACKAGES.includes(name));
      const patch = readProfilePatch(this.profile);
      const checkpoint = checkpointProfile(this.profile, path.join(this.base, "install-recovery", before.id));
      try {
        this.beat?.();
        if (fromLatest) {
          // pnpm may re-resolve the old URL before processing "add <tgz>".
          // The existing checkpoint covers the manifest and lock on failure.
          const current = readJSON(manifestFile);
          if (current?.dependencies?.[PACKAGE] !== priorSpec) throw Error("업그레이드 전 의존성이 변경되었습니다");
          current.dependencies[PACKAGE] = "file:" + path.relative(this.profile, file).split(path.sep).join("/");
          atomic(manifestFile, JSON.stringify(current, null, 2) + "\n");
        }
        await this.installer(file, this);
        this.beat?.();
        const installed = readJSON(path.join(this.profile, "node_modules", PACKAGE, "package.json"));
        if (installed?.name !== PACKAGE || installed.version !== expected.version) {
          throw Error(`Installed plugin mismatch: expected ${PACKAGE}@${expected.version}, found ${installed?.name || "missing"}@${installed?.version || "unknown"}; backup retained.`);
        }
        await this.verifier(this.profile, expected);
        this.beat?.();
        // Only migrate references, never copy a stock configuration over the
        // user's profile. Older packages remain available for rollback.
        const migration = /dsh-purge(?:[/'"\s]|$)/.test(patch.text)
          ? migrateReferences(patch.text, installedYaml(this.profile, {dependencyName:PACKAGE})) : {text: patch.text, changes: []};
        if (readProfilePatch(this.profile).text !== patch.text) throw Error("설정이 동시에 수정되어 덮어쓰지 않았습니다");
        const pkg = readJSON(manifestFile);
        if (!pkg) throw Error("설치 후 profile package.json 이 유효하지 않습니다");
        if (fromLatest) {
          const spec = pkg.dependencies?.[PACKAGE];
          if (typeof spec !== "string" || !spec.startsWith("file:") ||
              fs.realpathSync(path.resolve(this.profile, spec.slice(5))) !== fs.realpathSync(file))
            throw Error("DSH 가 옛 버전의 유동 의존성을 검증된 영구 로컬 아카이브로 옮기지 않았습니다");
        }
        pkg.dsh ??= {};
        pkg.dsh.profile ??= {};
        pkg.dsh.profile.bundles = [
          ...(pkg.dsh.profile.bundles || []).filter(
            (n) => !PURGE_PACKAGES.includes(n),
          ),
          ...(keepDisabled ? [] : [PACKAGE]),
        ];
        atomic(manifestFile, JSON.stringify(pkg, null, 2) + "\n");
        if (migration.changes.length) {
          atomic(path.join(this.base, "migrations", before.id + ".json"), JSON.stringify({schema: 1, changes: migration.changes}));
          writeProfilePatch(patch.file, migration.text);
        }
        const cleanupWarnings = this.finishCleanup(checkpoint, before.id);
        return {
          migrated_references: migration.changes.length,
          ok: true,
          backup_id: before.id,
          restart_required: true,
          preserved_settings: true,
          cleanup_warnings: cleanupWarnings,
          note: (cleanupWarnings.length ? "정리 미완료(" + cleanupWarnings.map(w => w.stage + ":" + w.code).join(", ") + "), 잔여물은 보존했습니다. 설치 결과는 검증되었고 자동 롤백은 하지 않습니다." : "") + "설치를 마쳤습니다. DSH 를 직접 종료하고 다시 실행한 뒤 왼쪽 “Purge → 상태”에서 “적용”을 눌러 호스트 패치를 기록하세요(기록 전에 자동 백업).",
        };
      } catch (e) {
        let recovery;
        try { this.beat?.(); checkpoint.restore(); recovery = "설치 전 의존성, 설치, 매니페스트를 복원했습니다"; }
        catch (restoreError) { recovery = "자동 복원 미완료: " + restoreError.message; }
        throw Error(`설치 실패: ${e.message}; ${recovery}; 원래 플러그인 백업 ${before.id} 은 보존했습니다`);
      }
    });
  }
}
export async function installWithDsh(file, manager, options = {}) {
  const runtime = resolveDshCli({ aiBase: manager.aiBase, ...options });
  const layout = repairRuntimeForCli(runtime.cli);
  if (!layout.ok) throw Error(`Desktop runtime repair failed: ${layout.error || layout.reason}; existing files retained.`);
  const profile = manager.profileName || path.basename(manager.profile);
  let target;
  try {
    target = fs.realpathSync(path.join(manager.home, "profiles", profile));
  } catch {}
  if (target !== manager.profile)
    throw Error("대상 profile 이 현재 DSH_HOME/profiles 에 속하지 않아 이 CLI 로 설치할 수 없습니다");
  const execute = options.execute || exec;
  const cli = async (args) => execute(
    runtime.command,
    [...runtime.args, "plugin", "--profile", profile, ...args],
    {
      cwd: manager.profile,
      timeout: 180000,
      maxBuffer: 2 * 1024 * 1024,
      windowsHide: true,
      env: {
        ...(options.env || process.env),
        ...runtime.env,
        ...(runtime.node ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
        DSH_HOME: manager.home,
        DSH_PROFILE: profile,
      },
    },
  );
  // A rollback directory link can pin pnpm to the old source even when add
  // succeeds. Detach only links owned by our rollback staging, retaining their
  // targets and the link itself. A fresh immutable tarball location also avoids
  // reusing an earlier misleading lockfile resolution. No lockfile is deleted,
  // no --force/policy exemption is used, and unrelated links remain untouched.
  const dependencyName = options.dependencyName || PACKAGE;
  if (!PURGE_PACKAGES.includes(dependencyName)) throw Error("설치 의존성 이름이 유효하지 않습니다");
  const link = path.join(manager.profile, "node_modules", dependencyName);
  let savedLink = "";
  try {
    const target = fs.realpathSync(link);
    const relative = path.relative(path.join(manager.base, "restored"), target);
    if (fs.lstatSync(link).isSymbolicLink() && relative && !relative.startsWith("..") && !path.isAbsolute(relative)
      && readJSON(path.join(target, "package.json"))?.name === PACKAGE) {
      const dir = path.join(manager.base, "detached-links", randomBytes(8).toString("hex"));
      fs.mkdirSync(dir, { recursive: true });
      savedLink = path.join(dir, PACKAGE);
      if (fs.statSync(file).isFile()) {
        const stage = path.join(manager.base, "pkgs", randomBytes(8).toString("hex"));
        fs.mkdirSync(stage, { recursive: true });
        const fresh = path.join(stage, path.basename(file));
        fs.copyFileSync(file, fresh);
        file = fresh;
      }
      fs.renameSync(link, savedLink);
    }
  } catch (e) { if (e.code !== "ENOENT") throw e; }
  try {
    // The native hoisted linker can retain a link resolution in its importer
    // even after the symlink is detached. Remove only this managed package via
    // DSH's own CLI, then add the requested source. Maintenance owns the backup
    // and restores the prior manifest/link if this transaction fails.
    if (savedLink) await cli(["remove", dependencyName]);
    if (process.platform === "win32") {
      // pnpm canonicalizes its workspace to the long Windows path. Passing an
      // 8.3/junction alias makes its file: specifier climb out and back in,
      // overflowing the store index filename for restored archives.
      try { file = fs.realpathSync.native(file); }
      catch (error) { if (error.code !== "ENOENT") throw error; }
    }
    await installWithRegistryRecovery({
      run: flags => cli(["add", options.dependencyName ? `${dependencyName}@file:${file}` : file, ...flags]),
      config: async key => (await cli(["config", "get", key])).stdout,
      request: options.request,
      warn: options.warn,
    });
  } catch (error) {
    if (savedLink && !fs.existsSync(link)) fs.renameSync(savedLink, link);
    throw error;
  }
}
export async function download(url, max = 50 * 1024 * 1024, request, authoritative = false) {
  return (await requestUpdate(url, {timeout:30000,maxBytes:max,fetch:request,authoritative,headers:{accept:"application/vnd.github+json"}})).body;
}
export async function releasedVersions() {
  const data = JSON.parse(
    (
      await download(
        `https://api.github.com/repos/${REPOSITORY}/releases?per_page=20`,
        2 * 1024 * 1024,
      )
    ).toString(),
  );
  if (!Array.isArray(data)) throw Error("발행 목록이 유효하지 않습니다");
  return data
    .filter(
      (r) => !r.draft && !r.prerelease && /^v\d+\.\d+\.\d+$/.test(r.tag_name),
    )
    .flatMap((r) => {
      const version = r.tag_name.slice(1),
        name = `${PACKAGE}-${version}.tgz`;
      const asset = r.assets?.find((a) => a.name === name),
        sums = r.assets?.find((a) => a.name === "SHA256SUMS.txt");
      return asset && sums
        ? [
            {
              id: r.tag_name,
              ref: r.tag_name,
              version,
              channel: "stable",
              label: `dsh-purge Community ${version}`,
              url: r.html_url,
              asset: asset.browser_download_url,
              sums: sums.browser_download_url,
            },
          ]
        : [];
    });
}
export async function prepareRelease(manager, release, request) {
  if (!/^v\d+\.\d+\.\d+$/.test(release.ref)) throw Error("정식 발행 버전만 설치합니다");
  if (release.ref !== `v${release.version}`) throw Error("발행 버전과 태그가 일치하지 않습니다");
  const name = `${PACKAGE}-${release.version}.tgz`;
  const officialBase = `https://github.com/${REPOSITORY}/releases/download/${release.ref}/`;
  if (release.asset !== officialBase + name || release.sums !== officialBase + 'SHA256SUMS.txt')
    throw Error('발행 패키지나 검증 파일이 이 프로젝트의 공식 발행 출처가 아닙니다');
  let expected;
  if (mirrorPrefix()) {
    // Fetch trusted metadata directly from GitHub, never from the mirror or a cached caller field.
    const metadata = JSON.parse((await download(`https://api.github.com/repos/${REPOSITORY}/releases/tags/${release.ref}`, 2 * 1024 * 1024, request, true)).toString());
    const asset = metadata.assets?.find(a => a.name === name);
    if (metadata.tag_name !== release.ref || metadata.draft || metadata.prerelease || asset?.browser_download_url !== release.asset)
      throw Error("공식 발행 메타데이터가 일치하지 않습니다");
    if (/^sha256:[a-f0-9]{64}$/.test(asset?.digest || '')) expected = asset.digest.slice(7);
  }
  if (!expected) {
    // Older releases without an API digest still require the official checksum file.
    const sums = (await download(release.sums, 65536, request, true)).toString();
    expected = sums.split(/\r?\n/).map(l => l.trim().split(/\s+/))
      .find(parts => parts[1]?.replace(/^\*/, '') === name)?.[0];
  }
  if (!/^[a-f0-9]{64}$/.test(expected || '')) throw Error("발행 패키지에 유효한 SHA256 이 없습니다");
  const bytes = await downloadArchive(release.asset, { request });
  if (hash(bytes) !== expected) throw Error("설치 패키지 SHA256 검증 실패");
  const cache = path.join(manager.base, "downloads", release.ref);
  fs.mkdirSync(cache, { recursive: true, mode: 0o700 });
  const file = path.join(cache, name);
  atomic(file, bytes);
  await validateArchive(file, release.version);
  return file;
}

export async function installRelease(manager, release, request) {
  return manager.install(await prepareRelease(manager, release, request));
}

export async function validateArchive(file, version) {
  if (!fs.statSync(file).isFile() || fs.statSync(file).size > 50 * 1024 * 1024)
    throw Error("설치 패키지 파일이 유효하지 않거나 너무 큽니다");
  const tar = process.platform === "win32"
    ? path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe") : "tar";
  const filename = path.basename(file), cwd = path.dirname(path.resolve(file));
  const { stdout: list } = await exec(tar, ["-tzf", filename], {
    cwd,
    maxBuffer: 1024 * 1024,
  });
  if (
    list
      .split("\n")
      .some(
        (p) =>
          p &&
          (!p.startsWith("package/") || p.includes("..") || p.includes("\\")),
      )
  )
    throw Error("설치 패키지 경로가 유효하지 않습니다");
  const { stdout: details } = await exec(tar, ["-tvzf", filename], {
    cwd,
    maxBuffer: 1024 * 1024,
  });
  if (details.split("\n").some((l) => l && !["-", "d"].includes(l[0])))
    throw Error("설치 패키지에 링크나 특수 파일은 허용되지 않습니다");
  const { stdout: meta } = await exec(
    tar,
    ["-xOzf", filename, "package/package.json"],
    { cwd, maxBuffer: 65536 },
  );
  const pkg = JSON.parse(meta);
  if (
    pkg.name !== PACKAGE ||
    (version !== undefined && pkg.version !== version) ||
    ![
      "git+https://github.com/" + REPOSITORY + ".git",
      "https://github.com/" + REPOSITORY + ".git",
    ].includes(pkg.repository?.url)
  )
    throw Error("설치 패키지 식별자가 발행 버전과 일치하지 않습니다");
  return pkg;
}
