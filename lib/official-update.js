import { removeTreeNoFollowSync } from "./remove-tree.js";
// 공식 클라이언트 업그레이드 후 패치 재기록 표식. wscript 리터럴은 재시작 스크립트가 쓴다.
import path from "node:path";
import { hostFs as fs } from "./extract-asar.js";

const MARKER_NAME = "dsh-purge-reapply-asar";

function harnessExeName(exe) {
  const base = path.basename(String(exe || "")).toLowerCase();
  return base === "deepseek harness.exe" || base === "deepseek-harness.exe";
}

export function upgradeMarkerPath(exe) {
  if (!harnessExeName(exe)) return "";
  return path.join(path.dirname(exe), "resources", MARKER_NAME);
}

export function upgradeMarkerExists(exe) {
  const marker = upgradeMarkerPath(exe);
  return Boolean(marker && fs.existsSync(marker));
}

export function clearUpgradeMarker(exe) {
  const marker = upgradeMarkerPath(exe);
  if (!marker) return;
  try { fs.rmSync(marker, { force: true }); } catch { /* 다음 기동에서 다시 시도한다 */ }
}

export function clearStaleExtractedApps(exe) {
  if (!harnessExeName(exe)) return;
  const resources = path.join(path.dirname(exe), "resources");
  let names = [];
  try { names = fs.readdirSync(resources); } catch { return; }
  for (const name of names) {
    if (!name.startsWith("app.dshpurge-prev")) continue;
    try { removeTreeNoFollowSync(path.join(resources, name), { fs }); } catch { /* 옛 디렉터리를 지우지 못해도 새 버전에는 영향이 없다 */ }
  }
}

/** Windows Script Host 는 BOM 이 없으면 시스템 ANSI 로 파일을 읽는다. 중국어 경로를 \uXXXX 로 적어 스크립트 전체를 ASCII 로 유지한다. */
export function wshLiteral(value) {
  return JSON.stringify(String(value ?? "")).replace(/[\u007f-\uffff]/g, (ch) => {
    return "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0");
  });
}

export function isWshAscii(source) {
  const text = String(source || "");
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) > 0x7f) return false;
  }
  return true;
}
