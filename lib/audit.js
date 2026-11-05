// 감사 로그: 플러그인이 수행한 "호스트/프리셋/스위치 변경" 동작마다 한 줄씩 기록을 남긴다.
//
// 경계 주의: 호스트 패치는 **DSH 소스에 기록**되므로 플러그인 런타임은 "어떤 도구 호출이 어느 패치로 허용되었는지" 볼 수 없다.
// 여기서 기록하는 것은 관측 가능한 부분, 즉 누가 언제 무엇을 바꿨고 결과가 어땠는지이며, 문제를 찾을 때
// "이번 적용이 적용되지 않았는지", "누군가 boost 를 껐는지"를 판정하기에 충분하다.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const AUDIT_FILE = "audit.jsonl";
export const AUDIT_MAX_BYTES = 1024 * 1024;
export const AUDIT_KEEP = 2;

function dshHome(explicit) {
  const env = String(process.env.DSH_HOME || "").trim();
  if (env) return env;
  return path.join(os.homedir(), ".dsh");
}

function auditPath(home) {
  return path.join(home || dshHome(), "dsh-purge-community", AUDIT_FILE);
}

// Operate only on known audit files, never recursively on backup/config directories.
function fileHandle(file, flags, owner) {
  try { if (fs.lstatSync(file).isSymbolicLink()) throw Error('감사 파일은 심볼릭 링크일 수 없습니다'); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  const fd = fs.openSync(file, flags | (fs.constants.O_NOFOLLOW || 0) | (fs.constants.O_NONBLOCK || 0), 0o600);
  try {
    const st = fs.fstatSync(fd);
    if (!st.isFile() || st.nlink !== 1) throw Error('감사 파일은 일반 파일이어야 하며 하드 링크일 수 없습니다');
    if (owner && st.uid !== owner.uid) {
      if (st.uid !== 0) throw Error('감사 파일 소유자가 맞지 않아 자동으로 수정하지 않았습니다');
      fs.fchownSync(fd, owner.uid, owner.gid);
    }
    return fd;
  } catch (e) { fs.closeSync(fd); throw e; }
}
function checkExisting(file, owner) {
  try { fs.closeSync(fileHandle(file, fs.constants.O_RDONLY, owner)); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
}
function rotate(file) {
  let st;
  try { st = fs.statSync(file); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
  if (st.size < AUDIT_MAX_BYTES) return;
  for (let i = AUDIT_KEEP; i >= 1; i -= 1) {
    const from = i === 1 ? file : `${file}.${i - 1}`;
    try { fs.renameSync(from, `${file}.${i}`); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
}
/**
 * 감사 기록을 한 건 추가한다. 기록 실패가 주 흐름을 끊어서는 안 된다(감사가 가용성 위험이 되면 안 된다).
 * @param event - 이벤트 이름. 예: apply/revert/uninstall/boost/probe/preset/reanchor
 * @param data - 추가 필드(그대로 저장되므로 키를 넣지 않는다)
 */
let warnedAuditFailure = false;

function auditOwner(home) {
  if (typeof process.getuid !== 'function' || process.getuid() !== 0) return null;
  const st = fs.statSync(home);
  const uidText = process.env.PURGE_AUDIT_UID, gidText = process.env.PURGE_AUDIT_GID;
  if (uidText !== undefined || gidText !== undefined) {
    if (![uidText, gidText].every(v => /^\d+$/.test(v || '') && Number(v) > 0 && Number(v) < 2 ** 32 - 1))
      throw Error('PURGE_AUDIT_UID / PURGE_AUDIT_GID 에는 유효한 비-root 숫자 ID 를 함께 지정해야 합니다');
    if (st.uid !== 0 && st.uid !== Number(uidText)) throw Error('감사 실행 사용자와 DSH_HOME 소유자가 일치하지 않습니다');
    return { uid: Number(uidText), gid: Number(gidText) };
  }
  // A root-owned container mount is ambiguous: keep ownership, do not guess a user.
  return { uid: st.uid, gid: st.gid };
}
function openAuditDir(file) {
  const home = fs.realpathSync(path.dirname(path.dirname(file)));
  const dir = path.join(home, 'dsh-purge-community');
  const owner = auditOwner(home);
  if (owner && owner.uid !== 0 && process.platform !== 'linux')
    throw Error('사용자 간 감사 복구는 현재 Linux 만 지원합니다. 실행 사용자가 디렉터리와 로그를 관리합니다');
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  if (fs.lstatSync(dir).isSymbolicLink()) throw Error('감사 디렉터리는 심볼릭 링크일 수 없습니다');
  if (process.platform === 'win32') return { fd: null, file: path.join(dir, AUDIT_FILE), owner: null };
  const fd = fs.openSync(dir, fs.constants.O_RDONLY | (fs.constants.O_DIRECTORY || 0) | (fs.constants.O_NOFOLLOW || 0));
  try {
    const st = fs.fstatSync(fd);
    if (!st.isDirectory()) throw Error('감사 경로가 디렉터리가 아닙니다');
    if (owner && st.uid !== owner.uid) {
      if (process.platform !== 'linux') throw Error('사용자 간 감사 디렉터리 복구는 현재 Linux 만 지원합니다. 실행 사용자가 디렉터리를 관리합니다');
      if (st.uid !== 0) throw Error('감사 디렉터리 소유자가 맞지 않아 자동으로 수정하지 않았습니다');
      fs.fchownSync(fd, owner.uid, owner.gid);
    }
    // Pin Linux operations to the opened directory even if its pathname is replaced.
    const base = process.platform === 'linux' ? `/proc/self/fd/${fd}` : dir;
    return { fd, file: path.join(base, AUDIT_FILE), owner };
  } catch (e) { fs.closeSync(fd); throw e; }
}

export function logAudit(event, data = {}, home) {
  try {
    const store = openAuditDir(auditPath(home));
    try {
      for (let i = 0; i <= AUDIT_KEEP; i++) checkExisting(store.file + (i ? `.${i}` : ''), store.owner);
      rotate(store.file);
      const fd = fileHandle(store.file, fs.constants.O_WRONLY | fs.constants.O_APPEND | fs.constants.O_CREAT, store.owner);
      try {
        const row = { at: new Date().toISOString(), event, pid: process.pid, ...data };
        fs.writeFileSync(fd, JSON.stringify(row) + "\n");
      } finally { fs.closeSync(fd); }
    } finally { if (store.fd !== null) fs.closeSync(store.fd); }
    return true;
  } catch (e) {
    // 감사 기록을 못 쓰는 것은 치명적이지 않지만 조용히 넘어갈 수도 없다. 호출자가 false 를 보고 "최근 동작"이 비어 있음을 알게 된다.
    if (!warnedAuditFailure) {
      warnedAuditFailure = true;
      try {
        console.error(`[dsh-purge] 감사 기록 실패: ${e && e.message ? e.message : e}`);
      } catch {
        /* stderr 도 쓸 수 없을 때는 포기한다 */
      }
    }
    return false;
  }
}

export function readAudit({ limit = 50, home } = {}) {
  const file = auditPath(home);
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw Error(`감사 로그를 읽지 못했습니다(${e.code || 'unknown'}). DSH 실행 사용자와 감사 파일 소유자를 확인하세요`);
  }
  const rows = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      /* 반 줄(기록 중단)은 건너뛴다 */
    }
  }
  const n = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 500) : 50;
  return rows.slice(-n).reverse();
}
