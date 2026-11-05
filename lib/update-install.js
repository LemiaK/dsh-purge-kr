import { removeTreeNoFollow, removeTreeNoFollowSync } from "./remove-tree.js";
// Updater filesystem layer: backups, rollback, zip overlay, git checkout helpers.
// YuJunZhiXue/dsh-purge lib/update.js 에서 파생(MIT, Copyright (c) 2026 샤오양).
// Community fork rule: every write into an install directory is preceded by a
// snapshot (Maintenance backup when a manager exists, otherwise this directory
// backup) and restored when the write throws.
import fs from "node:fs";
import { sourceManifest, verifySourceTree } from "./update-integrity.js";
import { promises as fsp } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { execFileSync } from "node:child_process";
import { atomicWriteSync, findDshHome } from "./core.js";
import { extractZipArchive, extractZipBuffer } from "./zip-extract.js";
import { fetchRes, archiveZipUrl, MAX_UPDATE_BYTES } from "./update-net.js";

export const COPY_NAMES = [
  "lib",
  "bin",
  "docs",
  "presets",
  "skills",
  "client.js",
  "cordis.patch.yml",
  "screenshots.json",
  "package.json",
  "README.md",
  "LICENSE",
  "NOTICE.md",
];

const HIDDEN = {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
  windowsHide: true,
  timeout: 20000,
};

export function realPath(dir) {
  try {
    return fs.realpathSync(dir);
  } catch {
    return path.resolve(dir);
  }
}

export function isLinkSpec(spec) {
  const s = String(spec || "");
  return /^(link|file):/i.test(s) || s === "." || /^\.\.?(?:[/\\]|$)/.test(s);
}

export function resolveLinkDir(profileDir, spec) {
  const raw = String(spec).replace(/^(link|file):/i, "");
  return path.resolve(profileDir, raw);
}

export function isGitCheckout(dir) {
  return Boolean(dir) && fs.existsSync(path.join(dir, ".git"));
}

export function canGit(dir) {
  if (!isGitCheckout(dir)) return false;
  try {
    execFileSync("git", ["-C", dir, "rev-parse", "--is-inside-work-tree"], HIDDEN);
    return true;
  } catch {
    return false;
  }
}

export function gitHead(dir) {
  if (!dir) return "";
  try {
    return execFileSync("git", ["-C", dir, "rev-parse", "HEAD"], HIDDEN).trim();
  } catch {
    return "";
  }
}

export function gitTrackedDirty(dir) {
  try {
    const out = execFileSync(
      "git",
      ["-C", dir, "status", "--porcelain", "--untracked-files=no", "--", ...COPY_NAMES],
      HIDDEN,
    ).trim();
    return Boolean(out);
  } catch {
    return true;
  }
}

export function runGit(dir, args, timeout = 20000) {
  try {
    return execFileSync("git", ["-C", dir, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      timeout,
    });
  } catch (e) {
    const detail = [e.stderr, e.stdout, e.message].filter(Boolean).join("\n").trim();
    throw new Error(detail || `git ${args.join(" ")}`);
  }
}

export function gitResetTo(dir, ref, { force = false, fallbackRef = "master" } = {}) {
  if (!force && gitTrackedDirty(dir)) {
    throw new Error("로컬 플러그인 파일에 커밋되지 않은 변경이 있어 덮어쓰지 않았습니다");
  }
  const target = String(ref || fallbackRef);
  try {
    runGit(dir, ["fetch", "origin", "--tags"], 60000);
  } catch {
    runGit(dir, ["fetch", "origin", "--tags", target], 60000);
  }
  if (target === "master" || target === "beta") {
    try {
      runGit(dir, ["checkout", "-B", target, `origin/${target}`]);
      return;
    } catch {
      runGit(dir, ["reset", "--hard", `origin/${target}`]);
      return;
    }
  }
  try {
    runGit(dir, ["fetch", "origin", "--tags", target], 60000);
  } catch {
    // 위에서 이미 모든 브랜치를 fetch 했다.
  }
  runGit(dir, ["reset", "--hard", target]);
}

/* ------------------------------------------------------------------ */
/* 디렉터리 스냅샷: Maintenance 를 쓸 수 없을 때의 원본 zip/디렉터리 백업 로직        */
/* ------------------------------------------------------------------ */

function backupRoot(home) {
  return path.join(home || findDshHome(), "dsh-purge", "backups");
}

export function copyTree(source, dest, { skip = new Set() } = {}) {
  const st = fs.lstatSync(source);
  if (st.isSymbolicLink()) throw new Error("백업 대상에 심볼릭 링크가 있어 중단했습니다");
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true, mode: 0o700 });
    for (const name of fs.readdirSync(source)) {
      if (skip.has(name)) continue;
      copyTree(path.join(source, name), path.join(dest, name), { skip });
    }
    return dest;
  }
  if (!st.isFile()) throw new Error("일반 파일과 디렉터리만 백업합니다");
  fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o700 });
  fs.copyFileSync(source, dest);
  fs.chmodSync(dest, st.mode & 0o777);
  return dest;
}

/** 설치 디렉터리를 스냅샷으로 뜨고 {id, folder, dir} 를 돌려준다. 디렉터리가 없으면 null. */
export function dirBackup(dir, { home, reason = "before-update", label = "" } = {}) {
  if (!dir || !fs.existsSync(dir)) return null;
  const resolved = realPath(dir);
  const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomBytes(4).toString("hex")}`;
  const folder = path.join(backupRoot(home), `dir-${id}`);
  copyTree(resolved, folder, { skip: new Set(["node_modules", ".git", "manifest.json"]) });
  atomicWriteSync(
    path.join(folder, "manifest.json"),
    `${JSON.stringify({ schema: 1, id, kind: "dir", dir: resolved, reason, label, at: new Date().toISOString() }, null, 2)}\n`,
  );
  return { id, folder, dir: resolved };
}

/** 스냅샷으로 디렉터리를 롤백한다. 실패하면 던지고 호출자가 모아 보고한다. */
export function dirRestore(backup, targetDir = "") {
  if (!backup || !backup.folder || !fs.existsSync(backup.folder)) {
    throw new Error("백업이 없어 롤백할 수 없습니다");
  }
  const dest = realPath(targetDir || backup.dir);
  const staged = `${dest}.restore-${randomBytes(4).toString("hex")}`;
  copyTree(backup.folder, staged, { skip: new Set(["manifest.json"]) });
  const retired = `${dest}.retired-${randomBytes(4).toString("hex")}`;
  if (fs.existsSync(dest)) fs.renameSync(dest, retired);
  try {
    fs.renameSync(staged, dest);
  } catch (e) {
    if (fs.existsSync(retired) && !fs.existsSync(dest)) fs.renameSync(retired, dest);
    throw e;
  }
  // These trees are deliberately absent from backups. Transfer them as part
  // of the transaction; if any transfer fails restore the pre-rollback install.
  const moved = [];
  try {
    for (const name of ["node_modules", ".git"]) {
      const from = path.join(retired, name);
      if (!fs.existsSync(from)) continue;
      fs.renameSync(from, path.join(dest, name));
      moved.push(name);
    }
  } catch (error) {
    try {
      for (const name of moved.reverse()) fs.renameSync(path.join(dest, name), path.join(retired, name));
      fs.renameSync(dest, staged);
      fs.renameSync(retired, dest);
      removeTreeNoFollowSync(staged);
    } catch (recovery) {
      throw new Error(`롤백 실패 및 복구 미완료. ${retired} 와 ${staged} 를 보존합니다: ${recovery.message}`, { cause: error });
    }
    throw new Error(`롤백 실패, 롤백 전 디렉터리로 복구했습니다: ${error.message}`, { cause: error });
  }
  try { removeTreeNoFollowSync(retired); } catch { /* empty retired directory only */ }
  return dest;
}

/* ------------------------------------------------------------------ */
/* 아카이브 다운로드 / 해제 / 덮어쓰기                                          */
/* ------------------------------------------------------------------ */

export function extractZip(zip, dest) {
  // win32: tar(bsdtar) → powershell. darwin/linux: tar → unzip → python3 → bsdtar.
  // 외부 도구를 모두 쓸 수 없으면 Node 로 zip 을 푼다. Linux 에서 powershell 을 다시 부르지 않는다.
  return extractZipArchive(zip, dest);
}

/** zip 을 내려받아 플러그인 루트(package.json 이 있는 계층)를 푼다. */
export async function downloadPluginArchive(ref, { tmpDir, ms = 45000, zipUrl = "" } = {}, services = {}) {
  const manifest = await sourceManifest(ref, { json: services.json, ms });
  const url = archiveZipUrl(manifest.sha);
  if (zipUrl && zipUrl !== url) throw Error("ZIP 출처는 검증된 업스트림 commit 과 같아야 합니다");
  const root = tmpDir || (await fsp.mkdtemp(path.join(os.tmpdir(), "dsh-purge-upd-")));
  const zip = path.join(root, "plugin.zip");
  try {
    const res = await (services.fetch || fetchRes)(url, ms);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > MAX_UPDATE_BYTES) throw new Error("업데이트 패키지가 크기 상한을 넘었습니다");
    await fsp.writeFile(zip, buffer);
    const content = path.join(root, "source");
    await fsp.mkdir(content);
    // Node extraction creates only regular files, never archive symlinks.
    extractZipBuffer(buffer, content);
    const names = await fsp.readdir(content);
    if (names.length !== 1) throw Error("ZIP 에 소스 루트 디렉터리가 하나만 있어야 합니다");
    const unpacked = path.join(content, names[0]);
    if (!fs.lstatSync(unpacked).isDirectory()) throw Error("ZIP 소스 루트가 올바르지 않습니다");
    const verification = verifySourceTree(unpacked, manifest);
    return { root, zip, unpacked, ...verification };
  } catch (error) {
    if (!tmpDir) await removeTreeNoFollow(root);
    throw error;
  }
}

/** 덮어쓰기 전에 백업하고, 어느 디렉터리든 쓰기에 실패하면 전부 스냅샷으로 롤백한다. */
/**
 * 실제 디렉터리(또는 아직 없는 대상)만 남긴다.
 * issue #118: 의존성이 `file:<tgz>` 인 경우 계획 단계에서 tar 경로를 설치 디렉터리로 오인할 수 있고,
 * 그러면 path.join(dest, "lib") 가 `<tgz>/lib` → ENOTDIR 이 되어 매 업데이트가 같은 지점에서 막힌다.
 */
export function filterDirs(dests, stat = (p) => fs.statSync(p)) {
  const kept = [];
  const skipped = [];
  for (const dest of dests || []) {
    if (!dest) continue;
    let isDir = false;
    let exists = false;
    try {
      const st = stat(dest);
      exists = true;
      isDir = st.isDirectory();
    } catch {
      exists = false; // 대상이 없음: 허용(새 설치의 덮어쓰기 대상)
    }
    if (!exists || isDir) kept.push(dest);
    else skipped.push(dest);
  }
  return { kept, skipped };
}

export async function overlayFromZip(dests, ref, { home, reason = "before-update", zipUrl = "" } = {}, services = {}) {
  const filtered = filterDirs((dests || []).map((d) => realPath(d)));
  const unique = [...new Set(filtered.kept)];
  const skipped = filtered.skipped;
  if (!unique.length) return { dests: [], backups: [], skipped };
  const backups = unique.map((dest) => ({ dest, backup: dirBackup(dest, { home, reason, label: ref }) }));
  const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), "dsh-purge-upd-"));
  const touched = new Set();
  try {
    const { unpacked, sha, verifiedFiles } = await downloadPluginArchive(ref, { tmpDir: tmp, zipUrl }, services);
    for (const dest of unique) {
      for (const name of COPY_NAMES) {
        const from = path.join(unpacked, name);
        const to = path.join(dest, name);
        if (!fs.existsSync(from)) continue;
        touched.add(dest);
        if (name === "lib" || name === "docs" || name === "bin" || name === "presets" || name === "skills") {
          try {
            await removeTreeNoFollow(to);
          } catch (e) {
            // 지울 수 없다는 것은 파일을 프로세스가 붙잡고 있다는 뜻이다. 계속 cp 하면 새 파일과 옛 파일이 반반 섞인 반쪽 업그레이드가 되고,
            // 호스트와 플러그인의 버전이 어긋난다. 차라리 롤백해 사용자가 호스트를 완전히 종료한 뒤 다시 시도하게 한다.
            throw new Error(`${to} 덮어쓰기 실패(${e.message || e}). 프로세스가 붙잡고 있을 수 있으니 호스트를 완전히 종료한 뒤 다시 시도하세요.`);
          }
        }
        await fsp.cp(from, to, { recursive: true, force: true });
      }
    }
    return { dests: unique, backups, skipped, sha, verifiedFiles };
  } catch (e) {
    const rollbackErrors = [];
    for (const { dest, backup } of backups) {
      if (!touched.has(dest)) continue;
      try {
        if (backup) dirRestore(backup, dest);
        else removeTreeNoFollowSync(dest);
      } catch (err) {
        rollbackErrors.push(`${dest}: ${err.message || err}`);
      }
    }
    const suffix = rollbackErrors.length ? `; 롤백 실패: ${rollbackErrors.join("; ")}` : touched.size ? "; 업데이트 전 스냅샷으로 롤백했습니다" : "; 설치 디렉터리를 건드리지 않았습니다";
    throw new Error(`${e.message || e}${suffix}`);
  } finally {
    await removeTreeNoFollow(tmp).catch(() => {});
  }
}

/** 풀어낸 플러그인 디렉터리를 대상 위치로 통째로 바꾸고, 실패하면 자동 롤백한다. */
export function swapDir(staged, target) {
  const backup = dirBackup(target, { reason: "before-upstream-update", label: "upstream" });
  const retired = fs.existsSync(target) ? `${target}.old-${randomBytes(4).toString("hex")}` : "";
  try {
    if (retired) fs.renameSync(target, retired);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(staged, target);
  } catch (e) {
    try {
      if (fs.existsSync(target)) removeTreeNoFollowSync(target);
      if (retired && fs.existsSync(retired)) fs.renameSync(retired, target);
      else if (backup) dirRestore(backup, target);
    } catch (err) {
      throw new Error(`${e.message || e}; 롤백 실패: ${err.message || err}`);
    }
    throw new Error(`${e.message || e}; 롤백했습니다`);
  }
  if (retired) {
    try {
      removeTreeNoFollowSync(retired);
    } catch {
      // 옛 디렉터리를 지우지 못해도 결과에는 영향이 없다.
    }
  }
  return backup;
}
