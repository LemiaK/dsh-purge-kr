// 로컬 재앵커 오버라이드: 호스트 업그레이드로 앵커가 깨졌을 때, 어떤 패치의 어떤 pattern 을
// "현재 호스트에서 뽑아낸 실제 스니펫"으로 바꿀 수 있게 한다. 플러그인 소스는 건드리지 않는다.
//
// 오버라이드는 $DSH_HOME/dsh-purge/anchor-overrides.json 에 있다:
//   { "24": { "0": { "pattern": "...", "at": "...", "host": "0.2.1-rc.2" } } }
// 적용 시 패치 표 위에 덧씌워지고, 파일을 지우면 출하 앵커로 돌아간다.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// core 를 일부러 import 하지 않는다: core 가 이 모듈을 import 해서 순환 의존이 된다.
// 여기서는 "데이터 디렉터리"만 필요하므로 같은 해석 순서를 그대로 쓴다.
function dshHome() {
  const env = String(process.env.DSH_HOME || "").trim();
  if (env) return env;
  return path.join(os.homedir(), ".dsh");
}

export const OVERRIDES_FILE = "anchor-overrides.json";

function file(explicit) {
  const home = explicit || dshHome();
  if (!home) return "";
  return path.join(home, "dsh-purge", OVERRIDES_FILE);
}

export function readOverrides(dshHome) {
  const fp = file(dshHome);
  if (!fp) return {};
  try {
    const data = JSON.parse(fs.readFileSync(fp, "utf8"));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function writeOverride(dshHome, patchId, index, pattern, extra = {}) {
  const fp = file(dshHome);
  if (!fp) throw new Error("DSH 데이터 디렉터리를 찾지 못해 재앵커 오버라이드를 쓸 수 없습니다");
  const all = readOverrides(dshHome);
  const key = String(patchId);
  all[key] = all[key] || {};
  all[key][String(index)] = {
    pattern,
    at: new Date().toISOString(),
    ...extra,
  };
  fs.mkdirSync(path.dirname(fp), { recursive: true, mode: 0o700 });
  fs.writeFileSync(fp, JSON.stringify(all, null, 2), { mode: 0o600 });
  return all;
}

export function clearOverride(dshHome, patchId, index) {
  const all = readOverrides(dshHome);
  const key = String(patchId);
  if (!all[key]) return all;
  if (index === undefined) delete all[key];
  else delete all[key][String(index)];
  if (all[key] && Object.keys(all[key]).length === 0) delete all[key];
  const fp = file(dshHome);
  if (fp) fs.writeFileSync(fp, JSON.stringify(all, null, 2), { mode: 0o600 });
  return all;
}

/** 오버라이드를 한 패치의 replacements 위에 덧씌운다(원본 객체는 바꾸지 않는다). */
export function applyOverrides(patch, overrides) {
  const all = overrides || {};
  const mine = all[String(patch && patch.id)];
  if (!mine) return patch;
  const list = Array.isArray(patch.replacements)
    ? patch.replacements.slice()
    : (patch.patterns ?? []).map((pat) => ({ pattern: pat, replace: patch.replace }));
  let changed = false;
  for (const [index, entry] of Object.entries(mine)) {
    const i = Number(index);
    if (!Number.isInteger(i) || i < 0 || i >= list.length) continue;
    if (!entry || typeof entry.pattern !== "string" || !entry.pattern) continue;
    list[i] = { ...list[i], pattern: entry.pattern };
    changed = true;
  }
  if (!changed) return patch;
  return { ...patch, replacements: list, overridden: true };
}
