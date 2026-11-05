/**
 * 드릴 콘솔 인가는 현재 $DSH_HOME/dsh-purge 에 기록한다. 플러그인 패키지에도, 사용자 홈의 공유 폴더에도 넣지 않는다.
 * 플러그인 업데이트는 node_modules 만 교체하므로 이 파일은 남아 있고, 그래서 팝업을 다시 띄우지 않는다.
 * 정상 제거는 이 사본을 지운다. Web 과 데스크톱은 각자 따로 기록한다. 파일이 없을 때만 다시 확인한다.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export function drillGrantPath(dshHome) {
  return join(dshHome, "dsh-purge", "drill-grant.json");
}

export function readDrillGrant(dshHome) {
  const file = drillGrantPath(dshHome);
  if (!existsSync(file)) return { granted: false, path: file };
  try {
    const raw = JSON.parse(readFileSync(file, "utf8"));
    return {
      granted: !!(raw && raw.granted === true),
      path: file,
      at: raw && raw.at ? raw.at : null,
    };
  } catch {
    return { granted: false, path: file };
  }
}

export function writeDrillGrant(dshHome) {
  const file = drillGrantPath(dshHome);
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  const at = new Date().toISOString();
  writeFileSync(tmp, `${JSON.stringify({ granted: true, at }, null, 2)}\n`, "utf8");
  try {
    if (existsSync(file)) unlinkSync(file);
    renameSync(tmp, file);
  } catch (error) {
    try { unlinkSync(tmp); } catch { /* 임시 파일을 지우지 못하면 원래 오류를 그대로 던진다 */ }
    throw error;
  }
  return readDrillGrant(dshHome);
}

/** 현재 설치의 인가 파일만 삭제한다. 실패하면 위로 던지고 디렉터리 전체를 지우지 않는다. */
export function clearDrillGrant(dshHome) {
  const file = drillGrantPath(dshHome);
  if (!existsSync(file)) return false;
  unlinkSync(file);
  return true;
}
