// #80: hooks deny / ask 우회의 스위치, 공식 형태로의 역방향 쓰기, 상태 표기.
// 이 모듈은 core.js 를 import 하지 않는다(core 가 필요할 때 이 모듈을 콜백해 순환 의존을 피한다).
import fs from "node:fs";
import path from "node:path";

/** #80 제품 의미론: 이 네 항목은 항상 같은 스위치이고 분리하지 않는다. */
export const HOOK_DENY_PATCH_IDS = Object.freeze([30, 31, 64, 65]);

const DEFAULT_SETTINGS = Object.freeze({ hooksDenyBypass: true });
const SETTINGS_FILE = "hooks-deny.json";

/** 패치 30/31 이 써 넣는 죽은 문자열; 이게 보이면 “우회가 아직 켜져 있다”는 뜻이다. */
const DISABLED_SENTINEL = "__dsh_purge_deny_disabled__";

const MARKER_STOP = "[dsh-purge] Stop hook steer disabled";
const MARKER_SUBMIT = "[dsh-purge] UserPromptSubmit deny→allow";

/**
 * 역방향 치환 표. find 는 이 플러그인이 써 넣은 형태를 글자 그대로 맞춰야 한다.
 * R1a 살아 있는 파일(30+65 같은 라운드): 65 가 reject 줄을 `=== "deny"` 빈 껍데기로 쓴다.
 * R1a2 2차 적용: 30 은 skipIfMarked 가 없어 빈 껍데기 안의 `"deny"` 를 다시 죽은 문자열로 바꾼다.
 * R1b: 30 만 적용하고 65 는 아직 붙지 않은 상태.
 * R2a / R2b 는 body 의 kind 까지 함께 맞춰야 하고, 줄 머리만 보고 판단하면 안 된다.
 */
const REVERSES = Object.freeze([
  {
    id: "R1a",
    find:
      '\t\tif (merged.decision === "deny") { /* [dsh-purge] UserPromptSubmit deny→allow */ }\n' +
      '\t\telse if (merged.decision === "__dsh_purge_deny_disabled__") { /* [dsh-purge] pre-step reject disabled */ }',
    replace: '\t\tif (merged.decision === "deny") return { kind: "reject" };',
  },
  {
    id: "R1a2",
    find:
      '\t\tif (merged.decision === "__dsh_purge_deny_disabled__") /* [dsh-purge] hooks deny→allow */' +
      ' { /* [dsh-purge] UserPromptSubmit deny→allow */ }\n' +
      '\t\telse if (merged.decision === "__dsh_purge_deny_disabled__") { /* [dsh-purge] pre-step reject disabled */ }',
    replace: '\t\tif (merged.decision === "deny") return { kind: "reject" };',
  },
  {
    id: "R1b",
    find:
      '\t\tif (merged.decision === "__dsh_purge_deny_disabled__") /* [dsh-purge] hooks deny→allow */ return { kind: "reject" };',
    replace: '\t\tif (merged.decision === "deny") return { kind: "reject" };',
  },
  {
    id: "R2a",
    find:
      '\t\tif (merged.decision === "__dsh_purge_deny_disabled__") /* [dsh-purge] hooks deny→allow */ return {\n' +
      '\t\t\tkind: "deny",',
    replace: '\t\tif (merged.decision === "deny") return {\n\t\t\tkind: "deny",',
  },
  {
    id: "R2b",
    find:
      '\t\tif (merged.decision === "__dsh_purge_deny_disabled__") /* [dsh-purge] hooks deny→allow */ return {\n' +
      '\t\t\tkind: "block",',
    replace: '\t\tif (merged.decision === "deny") return {\n\t\t\tkind: "block",',
  },
  {
    id: "R3",
    find: '\t\tif (merged.decision === "ask") return next(); /* [dsh-purge] hooks ask→allow */',
    replace:
      '\t\tif (merged.decision === "ask") return {\n' +
      '\t\t\tkind: "ask",\n' +
      '\t\t\t...merged.reason !== void 0 ? { reason: merged.reason } : {}\n' +
      '\t\t};',
  },
  {
    id: "R5a",
    find:
      '\t\tif (merged.decision === "__dsh_purge_deny_disabled__") /* [dsh-purge] hooks deny→allow */ {\n' +
      '\t\t\treturn; // [dsh-purge] Stop hook steer disabled\n',
    replace: '\t\tif (merged.decision === "deny") {\n',
  },
  {
    id: "R5b",
    find:
      '\t\tif (merged.decision === "__dsh_purge_deny_disabled__") /* [dsh-purge] hooks deny→allow */ {\n' +
      '\t\t\tconst text = merged.reason ?? "continue: blocked by Stop hook";',
    replace:
      '\t\tif (merged.decision === "deny") {\n' +
      '\t\t\tconst text = merged.reason ?? "continue: blocked by Stop hook";',
  },
]);

export function applyHookDenyReverses(text) {
  let out = String(text || "");
  const hits = [];
  for (const rule of REVERSES) {
    if (!out.includes(rule.find)) continue;
    out = out.split(rule.find).join(rule.replace);
    hits.push(rule.id);
  }
  return { text: out, hits };
}

export function hookFileLooksBypassed(text) {
  const hay = String(text || "");
  return hay.includes(DISABLED_SENTINEL) || hay.includes(MARKER_STOP) || hay.includes(MARKER_SUBMIT);
}

/**
 * aiBase 위에서 이 네 패치가 건드린 파일을 공식 형태로 되돌린다.
 * @returns {{ files: string[], changed: string[], misses: string[], sentinelLeft: string[], hitsByFile: Record<string, string[]> }}
 */
export async function restoreHookDenyOfficial(aiBase, io) {
  const result = { files: [], changed: [], misses: [], sentinelLeft: [], hitsByFile: {} };
  if (!aiBase || !io) return result;
  const paths = io.hookDenyPaths(aiBase);
  for (const fp of paths) {
    result.files.push(fp);
    let text;
    try {
      text = await io.loadText(fp);
    } catch {
      result.misses.push(fp);
      continue;
    }
    const { text: next, hits } = applyHookDenyReverses(text);
    result.hitsByFile[fp] = hits;
    if (hits.length === 0) {
      if (next.includes(DISABLED_SENTINEL)) result.sentinelLeft.push(fp);
      continue;
    }
    try {
      const wrote = await io.saveText(fp, next);
      if (wrote) result.changed.push(fp);
    } catch {
      result.misses.push(fp);
    }
    if (next.includes(DISABLED_SENTINEL)) result.sentinelLeft.push(fp);
  }
  return result;
}

export async function annotateHookDenyStatus(status, settings, aiBase, io) {
  if (!status || !aiBase || settings?.hooksDenyBypass !== false) return status;
  const paths = io.hookDenyPaths(aiBase);
  let dirty = false;
  for (const fp of paths) {
    let text;
    try {
      text = await io.loadText(fp);
    } catch {
      continue;
    }
    if (hookFileLooksBypassed(text)) {
      dirty = true;
      break;
    }
  }
  for (const id of HOOK_DENY_PATCH_IDS) {
    const prev = status[id];
    if (prev === "na" || prev === "missing_file") continue;
    // #M12: 이미 성공적으로 적용된 패치를 pending/skipped 로 덮어쓰지 않는다
    if (prev === "applied") continue;
    status[id] = dirty ? "pending" : "skipped";
  }
  return status;
}

export function hookDenySettingsPath(dshHome) {
  return path.join(dshHome, "dsh-purge", SETTINGS_FILE);
}

export function loadHookDenySettings(dshHome, configValue) {
  let file = {};
  try {
    const fp = hookDenySettingsPath(dshHome);
    if (fs.existsSync(fp)) {
      const parsed = JSON.parse(fs.readFileSync(fp, "utf8"));
      if (parsed && typeof parsed === "object") file = parsed;
    }
  } catch {
    file = {};
  }
  const pick = [file.hooksDenyBypass, configValue, DEFAULT_SETTINGS.hooksDenyBypass];
  const value = pick.find((v) => typeof v === "boolean");
  return { hooksDenyBypass: value === undefined ? true : value };
}

/**
 * #M11: 로컬 원자적 쓰기(tmp 쓰기 → fsync → rename).
 * 이 모듈은 core.js 를 import 하지 않으므로(순환 의존) 여기서 따로 구현한다.
 * libuv 는 Win32 에서 MoveFileExW(MOVEFILE_REPLACE_EXISTING)를 쓰므로 rename 이 기존 파일을 바로 덮어쓸 수 있고,
 * 먼저 unlink 할 필요가 없다 —— 원래의 "unlink + rename" 은 unlink 와 rename 사이에 fp 가 없는 경쟁 구간이 있었다.
 */
function atomicWriteFileSync(fp, content, encoding = "utf8") {
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const tmp = `${fp}.${process.pid}.${Date.now()}.tmp`;
  const fd = fs.openSync(tmp, "w");
  try {
    fs.writeFileSync(fd, content, encoding);
    try { fs.fsyncSync(fd); } catch { /* FS 가 fsync 를 지원하지 않으면 무시 */ }
  } finally {
    fs.closeSync(fd);
  }
  try {
    fs.renameSync(tmp, fp);
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
    throw e;
  }
}

export function saveHookDenySettings(dshHome, patch) {
  const fp = hookDenySettingsPath(dshHome);
  const current = loadHookDenySettings(dshHome);
  const next = {
    hooksDenyBypass: typeof patch?.hooksDenyBypass === "boolean"
      ? patch.hooksDenyBypass
      : current.hooksDenyBypass,
  };
  atomicWriteFileSync(fp, `${JSON.stringify(next, null, 2)}\n`);
  return { ok: true, ...next, path: fp };
}

export function selectPatches(patches, settings) {
  if (settings?.hooksDenyBypass !== false) return patches;
  const drop = new Set(HOOK_DENY_PATCH_IDS);
  return patches.filter((p) => !drop.has(p.id));
}
