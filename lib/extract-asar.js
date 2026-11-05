import { assertNoLinkedDescendants, assertWithinRoots } from "./path-boundary.js";
import { removeTreeNoFollowSync } from "./remove-tree.js";
import nodeFs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

let cachedDiskFs;

/**
 * 실제 디스크의 fs.
 * Electron 내장 fs 는 `resources/app` 을 아직 남아 있는 `app.asar` 로 매핑하며,
 * 그 안에 새 파일을 만들면 ENOENT 가 난다. 디렉터리를 푸는 작업과 아카이브가 남아 있을 때의 패치 기록은 여기를 쓴다.
 * Electron 이 아닌 환경에는 original-fs 가 없으므로 node:fs 로 물러난다.
 */
export function diskFs() {
  if (cachedDiskFs) return cachedDiskFs;
  // `--no-deprecation` 이 적용된 상태(컨테이너나 런처가 NODE_OPTIONS=--no-deprecation 을 흔히 넣는다)에서
  // Node 는 기동 단계에서 이것을 읽기 전용 데이터 속성({ value: true, writable: false })으로 정의한다;
  // ESM 엄격 모드에서 대입하면 TypeError: Cannot assign to read only property 가 난다.
  // 발동 조건은 "그 플래그가 이미 적용됨"이며 Node 버전과 무관하다(Node 22 에서 실측 재현된다).
  try {
    process.noDeprecation = true;
  } catch {
    /* 읽기 전용이면 무시한다: 이 표식은 폐기 경고를 억제할 뿐이다 */
  }
  try {
    cachedDiskFs = createRequire(import.meta.url)("original-fs");
  } catch {
    cachedDiskFs = nodeFs;
  }
  return cachedDiskFs;
}

/**
 * asar 판정 캐시(기동 성능 수정 / F14 + F17).
 *
 * `asarShadowsPath()` 는 호출마다 최대 12 계층을 위로 훑고, 계층마다 original-fs 시스템 콜이 1~2 번 나가므로
 * hostFs 를 거치는 **모든** 호출이 약 25 회 시스템 콜이 된다. 실측:
 *   - findAiBaseWeb 의 폴백 디렉터리 스캔 6 만 개: 순수 node:fs 6.2 s → 이 계층을 거치면 94 s;
 *   - 폴백 스캔을 고친 뒤에도, 남은 모듈 로드 구간에서 이 탐침 자체가 호스트 기동 CPU 의 24%를 차지했다
 *     (4117 ms / 17226 ms).
 *
 * 캐시는 두 단계다:
 *   1) 영속 단계: 5 s 유효 기간. hostFs 를 거치는 **쓰기 작업**이 한 번이라도 오면 즉시 비우고, 플러그인이 직접 app.asar 를 옮기는
 *      함수들(renameAsarAside / extractAsarToSide / commitExtractedDir / …)도 명시적으로 비운다.
 *      프로세스 밖의 공식 업데이터가 app.asar 를 바꾸는 경우는 5 s 유효 기간이 받쳐 주며, 공식 업데이트 후에는 어차피 호스트가 재시작된다.
 *   2) 스코프 단계: withFsProbeCache() 로 명시적으로 열고 닫는 강한 캐시. 스코프 안에서는 파일 시스템을 바꾸지 않고,
 *      디렉터리 재귀 스캔처럼 10 만 번 호출되는 일회성 폭주에 쓴다.
 */

const PROBE_TTL_MS = 5000;
const PROBE_MAX_ENTRIES = 400000;

let probePersist = null;
let probePersistEpoch = 0;
let probeScope = null;

/** asar 판정 캐시를 전부 버린다. app.asar 를 바꿀 수 있는 작업 뒤에는 반드시 호출한다. */
export function invalidateAsarProbes() {
  probePersist = new Map();
  probePersistEpoch = Date.now();
}

function activeProbes() {
  if (probeScope) return probeScope;
  const now = Date.now();
  if (!probePersist || now - probePersistEpoch >= PROBE_TTL_MS) invalidateAsarProbes();
  return probePersist;
}

/** 주어진 동기 함수 안에서 강한 캐시를 켠다(스코프 안에서 파일 시스템을 바꾸면 안 된다). 재진입 가능하다. */
export function withFsProbeCache(fn) {
  if (probeScope) return fn();
  probeScope = new Map();
  try {
    return fn();
  } finally {
    probeScope = null;
  }
}

function probeKey(kind, p) {
  return kind + String(p).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}

function probeAsarFileIn(dir) {
  try {
    const asar = path.join(dir, "app.asar");
    return diskFs().existsSync(asar) && diskFs().statSync(asar).isFile();
  } catch {
    return false;
  }
}

function asarFileIn(dir) {
  if (!dir) return false;
  const cache = activeProbes();
  const k = probeKey("f:", dir);
  const hit = cache.get(k);
  if (hit !== undefined) return hit;
  const v = probeAsarFileIn(dir);
  if (cache.size < PROBE_MAX_ENTRIES) cache.set(k, v);
  return v;
}

function computeAsarShadows(raw) {
  let dir = path.normalize(raw);
  for (let i = 0; i < 12; i += 1) {
    const base = path.basename(dir).toLowerCase();
    if ((base === "app" || base.endsWith(".asar")) && asarFileIn(path.dirname(dir))) return true;
    if (asarFileIn(dir)) return true;
    const parent = path.dirname(dir);
    if (!parent || parent === dir) break;
    dir = parent;
  }
  return false;
}

/** 이 경로는 Electron 이 옆의 app.asar 로 매핑한다. 이미 풀었고 아카이브를 치웠으면 거짓이다. */
export function asarShadowsPath(targetPath) {
  const raw = String(targetPath || "").trim();
  if (!raw) return false;
  const cache = activeProbes();
  const k = probeKey("s:", raw);
  const hit = cache.get(k);
  if (hit !== undefined) return hit;
  const v = computeAsarShadows(raw);
  if (cache.size < PROBE_MAX_ENTRIES) cache.set(k, v);
  return v;
}

/**
 * 호스트 파일에 어느 fs 를 쓸지.
 * app.asar 가 없으면(Web, 서드파티 데스크톱, 공식 패키지가 이미 풀려 아카이브를 치운 상태) 계속 node:fs 를 쓴다.
 * 아카이브가 남아 Electron 이 resources/app 을 매핑하는 상황이면 실제 디스크로 바꾼다.
 */
export function fsFor(targetPath) {
  return asarShadowsPath(targetPath) ? diskFs() : nodeFs;
}

function fsForPair(left, right) {
  return asarShadowsPath(left) || asarShadowsPath(right) ? diskFs() : nodeFs;
}

// 이 메서드들은 파일 시스템을 바꿔 app.asar 를 만들거나 지울 수 있으므로 호출 전에 탐침 캐시를 반드시 무효화한다.
// openSync 는 일부러 넣지 않았다: 대부분 읽기 전용 열기이고, 넣으면 캐시가 계속 날아간다.
const HOST_WRITE = new Set([
  "writeFileSync", "mkdirSync", "chmodSync", "unlinkSync", "rmdirSync", "rmSync",
  "renameSync", "appendFileSync", "symlinkSync", "copyFileSync",
]);

function route(method, pair) {
  const isWrite = HOST_WRITE.has(method);
  return (first, ...rest) => {
    if (isWrite) invalidateAsarProbes();
    const f = pair ? fsForPair(first, rest[0]) : fsFor(first);
    return f[method](first, ...rest);
  };
}

const HOST_SYNC = [
  "existsSync", "statSync", "lstatSync", "readFileSync", "writeFileSync",
  "readdirSync", "mkdirSync", "realpathSync", "chmodSync", "unlinkSync",
  "rmSync", "rmdirSync", "renameSync", "appendFileSync", "openSync", "symlinkSync",
];

/** 경로에 따라 node:fs 나 실제 디스크를 고른다. 패치, 탐지, 상태가 모두 이것 하나를 쓴다. */
export const hostFs = {
  // Descriptors opened through original-fs still need a real close. Missing
  // closeSync leaked backup placeholders and made Windows atomic rename EPERM.
  closeSync: (fd) => diskFs().closeSync(fd),
  copyFileSync: route("copyFileSync", true),
  promises: {
    readFile: (p, ...args) => fsFor(p).promises.readFile(p, ...args),
    writeFile: (p, ...args) => { invalidateAsarProbes(); return fsFor(p).promises.writeFile(p, ...args); },
    mkdir: (p, ...args) => { invalidateAsarProbes(); return fsFor(p).promises.mkdir(p, ...args); },
    unlink: (p, ...args) => { invalidateAsarProbes(); return fsFor(p).promises.unlink(p, ...args); },
    rm: (p, ...args) => { invalidateAsarProbes(); return fsFor(p).promises.rm(p, ...args); },
    copyFile: (src, dest, ...args) => { invalidateAsarProbes(); return fsForPair(src, dest).promises.copyFile(src, dest, ...args); },
    rename: (src, dest, ...args) => { invalidateAsarProbes(); return fsForPair(src, dest).promises.rename(src, dest, ...args); },
  },
};
for (const method of HOST_SYNC) hostFs[method] = route(method, false);

/** Electron 은 app.asar 를 디렉터리처럼 위장한다. 아카이브를 읽으려면 original-fs 로 가야 하고, 아니면 isFile 이 거짓이 되어 풀 수 없다. */
function archiveFs() {
  return diskFs();
}

function renameBusy(error) {
  const code = error && error.code;
  return code === "EBUSY" || code === "EPERM" || code === "EACCES";
}

export function renameAsarAside(asarPath) {
  // 이 단계는 app.asar 의 유무를 직접 바꾸므로 asar 판정 캐시를 즉시 무효화해야 한다.
  invalidateAsarProbes();
  const afs = archiveFs();
  if (!asarPath || !afs.existsSync(asarPath)) return { renamed: false };
  const bak = `${asarPath}.bak`;
  try {
    if (afs.existsSync(bak)) afs.rmSync(bak, { force: true });
    afs.renameSync(asarPath, bak);
    return { renamed: true, bak };
  } catch (error) {
    if (renameBusy(error)) return { renamed: false, busy: true, bak };
    throw error;
  }
}

export function asarArchiveIsFile(p) {
  try {
    const afs = archiveFs();
    return Boolean(p) && afs.existsSync(p) && afs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/** 크기와 수정 시간으로 같은 아카이브인지 알아본다. */
export function asarFileIdentity(asarPath) {
  try {
    const st = archiveFs().statSync(asarPath);
    if (!st.isFile()) return null;
    return { size: st.size, mtimeMs: Math.round(st.mtimeMs) };
  } catch {
    return null;
  }
}

export function sameAsarIdentity(left, right) {
  return Boolean(
    left && right
    && left.size === right.size
    && left.mtimeMs === right.mtimeMs,
  );
}

/**
 * 쓸 수 있는 디렉터리에 같은 아카이브를 연결: 풀지 않는다.
 * 디렉터리가 없거나 기록된 아카이브 크기/시간이 바뀌었으면 한 번 푼다.
 * 업그레이드 표식이 다른 아카이브를 만나면 역시 한 번 푼다. 디렉터리는 있는데 기록이 없고 업그레이드도 아니면 이 아카이브를 인정하고 풀지 않는다.
 */
export function shouldExtractAsar({ usable, identity, recorded, upgrade }) {
  if (!identity) return false;
  if (!usable) return true;
  const same = sameAsarIdentity(identity, recorded);
  if (upgrade && !same) return true;
  if (recorded && !same) return true;
  return false;
}

function readHeader(fd, afs) {
  const pre = Buffer.alloc(16);
  if (afs.readSync(fd, pre, 0, 16, 0) !== 16) throw new Error("asar header truncated");
  if (pre.readUInt32LE(0) !== 4) throw new Error("not an asar archive");
  const headerSize = pre.readUInt32LE(4);
  const jsonSize = pre.readUInt32LE(12);
  if (headerSize < 8 + jsonSize || !jsonSize || jsonSize > 256 * 1024 * 1024 || 8 + headerSize > afs.fstatSync(fd).size) throw new Error("asar header size invalid");
  const jsonBuf = Buffer.alloc(jsonSize);
  if (afs.readSync(fd, jsonBuf, 0, jsonSize, 16) !== jsonSize) throw new Error("asar header short");
  return {
    header: JSON.parse(jsonBuf.toString("utf8")),
    dataOffset: 8 + headerSize,
  };
}

function safeArchiveName(name) {
  // Reject both platform syntaxes so an archive cannot become unsafe after transfer.
  if (!name || name === "." || name === ".." || /[\\/\x00-\x1f:]/.test(name)
    || /[. ]$/.test(name) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) {
    throw new Error(`Invalid asar entry name: ${JSON.stringify(name)}`);
  }
}
function walk(node, prefix, out, unpacked = false) {
  const files = node && node.files;
  if (!files || typeof files !== "object" || Array.isArray(files)) throw new Error(`Invalid asar directory: ${prefix}`);
  for (const [name, raw] of Object.entries(files)) {
    safeArchiveName(name);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`Invalid asar entry: ${name}`);
    const info = {...raw, unpacked: unpacked || raw.unpacked === true};
    const rel = prefix ? `${prefix}/${name}` : name;
    if (info.files) {
      if (info.link !== undefined) throw new Error(`Ambiguous asar entry: ${rel}`);
      out.push({rel, info, directory: true});
      walk(info, rel, out, info.unpacked);
    } else out.push({rel, info});
  }
}
function archiveLinkPath(link) {
  if (typeof link !== "string" || !link) throw new Error("Invalid asar link");
  // ASAR link targets are relative to the archive root (not the link's parent).
  const parts = link.replace(/\\/g, "/").split("/");
  for (const part of parts) safeArchiveName(part);
  return parts.join(path.sep);
}

function copyRange(afs, fd, offset, size, outPath, mode = 0o644) {
  const outFs = diskFs();
  const out = outFs.openSync(outPath, "wx", mode);
  try {
    const buf = Buffer.alloc(Math.min(1024 * 1024, Math.max(size, 1)));
    let left = size;
    let pos = offset;
    while (left > 0) {
      const n = afs.readSync(fd, buf, 0, Math.min(buf.length, left), pos);
      if (n <= 0) throw new Error(`asar short read at ${outPath}`);
      outFs.writeSync(out, buf, 0, n);
      pos += n;
      left -= n;
    }
  } finally {
    outFs.closeSync(out);
  }
}

/** asar 에 unpacked 로 표시된 네이티브 파일은 아카이브 본문에 없다. 디렉터리를 풀어 기동하기 전에 resources/app 에 채워야 한다. */
export function overlayAsarUnpacked(asarPath, destDir) {
  const outFs = diskFs();
  const unpacked = `${asarPath}.unpacked`;
  if (!destDir) throw new Error("Missing extraction destination");
  try { outFs.lstatSync(unpacked); }
  catch (error) { if (error.code === "ENOENT") return { copied: 0, missing: true }; throw error; }
  assertNoLinkedDescendants(unpacked, unpacked, outFs);
  assertNoLinkedDescendants(destDir, destDir, outFs);
  let copied = 0;
  const walk = (dir) => {
    for (const ent of outFs.readdirSync(dir, { withFileTypes: true })) {
      const from = path.join(dir, ent.name);
      const to = path.join(destDir, path.relative(unpacked, from));
      assertNoLinkedDescendants(unpacked, from, outFs);
      assertNoLinkedDescendants(destDir, to, outFs);
      if (ent.isDirectory()) {
        outFs.mkdirSync(to, { recursive: true });
        walk(from);
      } else if (ent.isFile()) {
        if (outFs.existsSync(to)) continue;
        outFs.mkdirSync(path.dirname(to), { recursive: true });
        outFs.copyFileSync(from, to);
        copied += 1;
      }
    }
  };
  walk(unpacked);
  return { copied };
}

function discardDir(dir) {
  if (!dir) return;
  try { removeTreeNoFollowSync(dir, { fs: diskFs() }); } catch { /* 잔여 디렉터리는 다음에 정리 */ }
}

/** 대상 옆 디렉터리로 푼다. 실패하면 반쯤 만든 것을 지우고 이미 쓰는 사본은 건드리지 않는다. */
export function extractAsarToSide(asarPath, destDir) {
  const next = `${destDir}.dshpurge-next`;
  discardDir(next);
  try {
    const count = extractAsar(asarPath, next);
    return { next, count };
  } catch (error) {
    discardDir(next);
    throw error;
  }
}

function restoreFromPrev(fs, destDir, prev) {
  if (!prev || fs.existsSync(destDir)) return false;
  try {
    fs.renameSync(prev, destDir);
    return true;
  } catch {
    return false;
  }
}

/** 풀기가 끝난 뒤에야 옛 디렉터리를 치우고 새 디렉터리를 끼운다. 끼우지 못하면 옛 디렉터리를 되돌리고, 그래도 실패하면 recover.json 을 기록해 nextDir 을 다음 재시도용으로 남긴다. */
export function commitExtractedDir(destDir, nextDir) {
  const fs = diskFs();
  if (!nextDir || !fs.existsSync(nextDir)) throw new Error("푼 디렉터리가 없습니다");
  let prev = "";
  if (fs.existsSync(destDir)) {
    prev = `${destDir}.dshpurge-prev`;
    if (fs.existsSync(prev)) prev = `${destDir}.dshpurge-prev-${Date.now()}`;
    fs.renameSync(destDir, prev);
  }
  try {
    fs.renameSync(nextDir, destDir);
  } catch (error) {
    const restored = restoreFromPrev(fs, destDir, prev);
    const recoverFp = `${destDir}.dshpurge-recover.json`;
    try {
      fs.writeFileSync(recoverFp, JSON.stringify({
        when: new Date().toISOString(),
        destDir,
        nextDir,
        prev,
        prevRestored: restored,
        error: String(error?.message || error),
      }, null, 2));
    } catch { /* 구제 정보는 best effort */ }
    const err = new Error(
      `commitExtractedDir failed; nextDir kept at ${nextDir}, prev at ${prev}, recover=${recoverFp}: ${error && error.message || error}`
    );
    err.cause = error;
    err.recover = recoverFp;
    throw err;
  }
  return { prev };
}

/** 업그레이드 스크립트가 미리 치운 옛 디렉터리. 패치를 다 쓰지 못했을 때 되돌리는 데 쓴다. */
export function newestPreservedDir(destDir) {
  const fs = diskFs();
  const parent = path.dirname(destDir);
  const prefix = `${path.basename(destDir)}.dshpurge-prev`;
  let names = [];
  try { names = fs.readdirSync(parent); } catch { return ""; }
  let best = "";
  let bestTime = -1;
  for (const name of names) {
    if (name !== prefix && !name.startsWith(`${prefix}-`)) continue;
    const full = path.join(parent, name);
    let time = 0;
    try { time = fs.statSync(full).mtimeMs; } catch { continue; }
    if (time >= bestTime) {
      best = full;
      bestTime = time;
    }
  }
  return best;
}

/** 패치를 다 쓰지 못했을 때, 방금 치운 옛 디렉터리를 원위치로 되돌린다. */
export function restoreExtractedDir(destDir, prev) {
  const fs = diskFs();
  if (!prev || !fs.existsSync(prev)) return false;
  let failed = "";
  if (fs.existsSync(destDir)) {
    failed = `${destDir}.dshpurge-failed-${Date.now()}`;
    fs.renameSync(destDir, failed);
  }
  try {
    fs.renameSync(prev, destDir);
  } catch (error) {
    if (failed && !fs.existsSync(destDir)) {
      try { fs.renameSync(failed, destDir); } catch { /* 옛 디렉터리는 prev 에 남아 있다 */ }
    }
    throw error;
  }
  if (failed) {
    try { removeTreeNoFollowSync(failed, { fs }); } catch { /* 깨진 디렉터리는 되돌린 사본에 영향이 없다 */ }
  }
  return true;
}

export function extractAsar(asarPath, destDir) {
  const afs = archiveFs();
  const fd = afs.openSync(asarPath, "r");
  let count = 0;
  try {
    const { header, dataOffset } = readHeader(fd, afs);
    const entries = [];
    walk(header, "", entries);
    const outFs = diskFs();
    const archiveSize = afs.fstatSync(fd).size;
    // Validate the entire plan before creating any output. No partial-success skip.
    for (const entry of entries) {
      entry.outPath = assertNoLinkedDescendants(destDir, path.resolve(destDir, ...entry.rel.split("/")), outFs);
      const info = entry.info;
      if (typeof info.link === "string") {
        entry.linkPath = assertNoLinkedDescendants(destDir, path.resolve(destDir, archiveLinkPath(info.link)), outFs);
      } else if (!entry.directory && !info.unpacked) {
        const size = info.size;
        const offset = Number(info.offset);
        if (!Number.isSafeInteger(size) || size < 0 || !/^\d+$/.test(String(info.offset))
          || !Number.isSafeInteger(offset) || offset < 0 || offset + size > archiveSize - dataOffset) {
          throw new Error(`Invalid asar data range: ${entry.rel}`);
        }
      }
    }
    outFs.mkdirSync(destDir, { recursive: true });
    for (const entry of entries) {
      const {info, outPath} = entry;
      assertNoLinkedDescendants(destDir, outPath, outFs);
      if (info.unpacked || entry.linkPath) continue;
      if (entry.directory) { outFs.mkdirSync(outPath, {recursive: true}); continue; }
      outFs.mkdirSync(path.dirname(outPath), { recursive: true });
      assertNoLinkedDescendants(destDir, outPath, outFs);
      copyRange(afs, fd, dataOffset + Number(info.offset), info.size, outPath, info.executable ? 0o755 : 0o644);
      count += 1;
    }
    // Create links last: no archive file writes can traverse an archive-created link.
    for (const {outPath, linkPath, info} of entries) {
      if (!linkPath || info.unpacked) continue;
      assertNoLinkedDescendants(destDir, outPath, outFs);
      assertWithinRoots(linkPath, [destDir], outFs);
      outFs.mkdirSync(path.dirname(outPath), {recursive: true});
      outFs.symlinkSync(path.relative(path.dirname(outPath), linkPath), outPath);
    }
  } finally {
    afs.closeSync(fd);
  }
  return count;
}
