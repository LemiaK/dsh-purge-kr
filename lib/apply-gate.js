/**
 * 패키지 교체 전 CLI 복구 게이트.
 *
 * 기존 구현은 `repairOfficialCliAfterUnpack()` 의 `ok===true` 를
 * "복구 완료"와 "복구 불필요"로 동시에 취급했다. 그래서 서드파티 계열은 `ok:true` 를 위조해야만 패키지 교체를 계속할 수 있었다.
 * 여기서 두 의미를 분리한다:
 *  - `ok === true`            실제로 복구됨
 *  - `notApplicable === true` 명확히 해당 없음(우리가 하지 않았고, 계속 진행 허용)
 *  - 그 외                    실패, 아카이브 보존, 패키지 교체 중단
 */

export function cliRepairBlocksApply({ handoff = null, sealed = false, cliRepair = null } = {}) {
  if (!handoff || !sealed) return false;
  if (!cliRepair) return true;
  if (cliRepair.ok === true) return false;
  if (cliRepair.notApplicable === true) return false;
  return true;
}

/** 패널/로그용 정규화 설명. "건너뜀"을 "성공"으로 표시하지 않게 한다. */
export function describeCliRepair(cliRepair = null) {
  if (!cliRepair) return { state: "missing", ok: false, notApplicable: false };
  if (cliRepair.ok === true) return { ...cliRepair, state: "repaired" };
  if (cliRepair.notApplicable === true) return { ...cliRepair, state: "not_applicable" };
  return { ...cliRepair, state: "failed" };
}
