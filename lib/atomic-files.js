/** Atomic replacement with ordinary POSIX permissions retained (issue #20). */
import path from "node:path";
import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { hostFs } from "./extract-asar.js";

export function atomicFiles(fs = hostFs) {
  const fsp = fs.promises;
  const modeOf = (file, allowMissing = false) => {
    try { return fs.statSync(file).mode & 0o777; }
    catch (error) {
      if (allowMissing && error.code === "ENOENT") return undefined;
      throw error;
    }
  };
  const temporary = file => `${file}.${process.pid}.${randomUUID()}.tmp`;
  // Windows 에서 대상 파일을 패널 폴링이나 백신이 잠깐 열어 두면 rename 이 EPERM/EACCES/EBUSY 를 던진다.
  // extract-asar.js 에 이미 같은 종류의 재시도(renameBusy)가 있으므로, 상태 파일을 쓰는 경로에도 여기서 보강한다.
  const RENAME_BUSY_CODES = new Set(["EPERM", "EACCES", "EBUSY"]);
  const sleepSync = ms => { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); };
  function renameSyncRetry(from, to, tries = 5) {
    for (let i = 0; ; i += 1) {
      try { return fs.renameSync(from, to); }
      catch (error) {
        if (!error || !RENAME_BUSY_CODES.has(error.code) || i >= tries - 1) throw error;
        sleepSync(50 * (i + 1));
      }
    }
  }
  async function renameRetry(from, to, tries = 5) {
    for (let i = 0; ; i += 1) {
      try { return await fsp.rename(from, to); }
      catch (error) {
        if (!error || !RENAME_BUSY_CODES.has(error.code) || i >= tries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 50 * (i + 1)));
      }
    }
  }
  function atomicWriteSync(file, content, encoding = "utf8", options = {}) {
    const mode = modeOf(file, true) ?? options.mode, tmp = temporary(file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    try {
      fs.writeFileSync(tmp, content, { encoding, mode, flag: "wx" });
      // writeFile's mode is masked by umask. Apply the exact previous rwx bits
      // before publication, preserving private configs as well as executables.
      if (mode !== undefined) fs.chmodSync(tmp, mode);
      renameSyncRetry(tmp, file);
    } catch (error) {
      try { fs.unlinkSync(tmp); } catch {}
      throw error;
    }
  }
  async function atomicWriteFile(file, content, encoding = "utf8", options = {}) {
    const mode = modeOf(file, true) ?? options.mode, tmp = temporary(file);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    try {
      await fsp.writeFile(tmp, content, { encoding, mode, flag: "wx" });
      if (mode !== undefined) fs.chmodSync(tmp, mode);
      await renameRetry(tmp, file);
    } catch (error) {
      try { await fsp.unlink(tmp); } catch {}
      throw error;
    }
  }
  function atomicCopyFileSync(src, dest) {
    const mode = modeOf(src), tmp = temporary(dest);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    try {
      fs.copyFileSync(src, tmp, constants.COPYFILE_EXCL);
      fs.chmodSync(tmp, mode);
      renameSyncRetry(tmp, dest);
    } catch (error) {
      try { fs.unlinkSync(tmp); } catch {}
      throw error;
    }
  }
  async function atomicCopyFile(src, dest) {
    const mode = modeOf(src), tmp = temporary(dest);
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    try {
      await fsp.copyFile(src, tmp, constants.COPYFILE_EXCL);
      fs.chmodSync(tmp, mode);
      await renameRetry(tmp, dest);
    } catch (error) {
      try { await fsp.unlink(tmp); } catch {}
      throw error;
    }
  }
  return { atomicWriteSync, atomicWriteFile, atomicCopyFileSync, atomicCopyFile };
}

export const { atomicWriteSync, atomicWriteFile, atomicCopyFileSync, atomicCopyFile } = atomicFiles();
