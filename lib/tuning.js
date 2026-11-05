// Plugin-owned tuning state. Deliberately NOT stored in the profile cordis config:
// switching a behaviour must never require editing a DSH file or a restart of the
// profile's YAML, and must survive `dsh plugin add`.
import fs from "node:fs";
import path from "node:path";
import { findDshHome } from "./core.js";
import { logAudit } from "./audit.js";

export const TUNING_FILE = "tuning.json";

/** 기본값이 곧 "전부 켜짐"이다: 탈옥이 이 플러그인의 유일한 목적이므로 기본값에 게이트를 남기지 않는다. */
export const TUNING_DEFAULTS = Object.freeze({
  boost: true, // 꼬리 강화 섹션
  injectPosition: "head", // head | tail | both —— 시스템 프롬프트에서 주입되는 위치
  askNoBlock: true, // 호환 필드: 지금은 -1(무한 대기)만 300s 로 줄인다. 패치 #89 참고
  rewind: true, // 입력창 오른쪽의 "되돌리기" 버튼(원판 기능이라 필요하면 숨길 수 있다)
  refusalRetry: false, // 모델이 회피할 때 강화 문구를 한 번 덧붙여 재시도한다(llm/stream 훅)
  extraPatches: [], // 명시적으로 켜는 "기본 꺼짐" 패치 id(#18 중복 호출 알림, #19 도구 결과 트리밍)
});

function tuningPath(dshHome) {
  const home = dshHome || findDshHome();
  if (!home) return "";
  return path.join(home, "dsh-purge", TUNING_FILE);
}

export function readTuning(dshHome) {
  const file = tuningPath(dshHome);
  if (!file) return { ...TUNING_DEFAULTS };
  let saved = {};
  try {
    saved = JSON.parse(fs.readFileSync(file, "utf8")) || {};
  } catch {
    saved = {};
  }
  const merged = { ...TUNING_DEFAULTS, ...saved };
  if (!["head", "tail", "both"].includes(merged.injectPosition)) {
    merged.injectPosition = TUNING_DEFAULTS.injectPosition;
  }
  merged.extraPatches = Array.isArray(merged.extraPatches)
    ? [...new Set(merged.extraPatches.map(Number).filter((n) => Number.isInteger(n) && n > 0))].sort((a, b) => a - b)
    : [];
  return merged;
}

export function writeTuning(patch = {}, dshHome) {
  const file = tuningPath(dshHome);
  if (!file) throw new Error("DSH 데이터 디렉터리를 찾지 못해 tuning 을 저장할 수 없습니다");
  const before = readTuning(dshHome);
  const next = { ...before, ...patch };
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, JSON.stringify(next, null, 2), { mode: 0o600 });
  const effective = readTuning(dshHome);
  // Record effective values, not invalid input that readTuning normalizes away.
  // Only known, non-secret settings belong in the public audit schema.
  for (const key of Object.keys(TUNING_DEFAULTS)) {
    if (!Object.prototype.hasOwnProperty.call(patch, key) || before[key] === effective[key]) continue;
    const auditValue = (value) => key === "injectPosition"
      ? (["head", "tail", "both"].includes(value) ? value : "invalid")
      : key === "extraPatches"
        ? (Array.isArray(value) ? value.map(Number).join(",") : "invalid")
        : (typeof value === "boolean" ? value : "invalid");
    logAudit("tuning_setting", { key, from: auditValue(before[key]), to: auditValue(effective[key]) }, path.dirname(path.dirname(file)));
  }
  return effective;
}
