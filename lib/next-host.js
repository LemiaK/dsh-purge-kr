/**
 * DSH NEXT 호스트 계열(서드파티 데스크톱 셸 `dsh-desktop-next`).
 *
 * 설계 제약(리뷰 의견 대응):
 *  1. 패키지 증거만 인정한다: 루트 `package.json` 의 `name` + `main` 이 존재해야 하며, exe 파일명은 절대 보지 않는다;
 *  2. 공식 `@deepseek-ai/dsh-desktop-host` 계열과 완전히 분리하며,
 *     `QUALIFIED_HOST_VERSIONS` 자격 판정에 들어가지 않고, 공식 경로의 실패 의미도 바꾸지 않는다;
 *  3. 레이아웃 차이는 여기서 모아 설명한다: NEXT 의 `@deepseek-ai` 는 앱 루트 `node_modules/` 에 있고,
 *     공식처럼 `dsh/node_modules/` 접두사를 두지 않는다.
 */
import path from "node:path";

export const NEXT_FAMILY = Object.freeze({
  id: "dsh-desktop-next",
  product: "DSH NEXT",
  // 독립 계열: 패치 앵커를 항목별로 회귀 검증하지 않았으므로 공식 qualified 판정에 참여하지 않는다
  qualified: false,
});

/** 이 package.json 이 NEXT 계열(서드파티 데스크톱 셸)인지 판별한다. */
export function isNextPackage(meta) {
  return Boolean(meta) && meta.name === NEXT_FAMILY.id;
}

/** 루트 package.json 을 신원 객체로 변환한다; 공식 identity 의 반환 형태와 같게 유지한다. */
export function nextIdentity(meta) {
  if (!isNextPackage(meta)) return null;
  return {
    kind: "next",
    family: NEXT_FAMILY.id,
    product: NEXT_FAMILY.product,
    package: meta.name,
    version: typeof meta.version === "string" ? meta.version : "",
  };
}

/** NEXT 의 @deepseek-ai 는 이 두 위치에만 있을 수 있다(언팩 디렉터리가 아카이브 우회보다 우선). */
export function nextAiBaseCandidates(resources) {
  if (!resources) return [];
  return [
    path.join(resources, "app", "node_modules", "@deepseek-ai"),
    path.join(resources, "app.asar.unpacked", "node_modules", "@deepseek-ai"),
  ];
}

/** NEXT 의 공식 CLI 복구 위치("복구가 정말 해당 없음"인지 판단할 때 쓴다). */
export function nextCliShim(resources) {
  return resources ? path.join(resources, "runtime", "cli", "bin", "dsh") : "";
}

/**
 * CLI 복구 판정. NEXT 에는 공식의 `runtime/cli/bin/dsh` shim 이 없다:
 *  - shim 없음 → 명확히 notApplicable, `ok` 는 false 유지(실제로 복구하지 않았고 검증도 하지 않았다);
 *  - shim 이 있는 경우 → 알 수 없는 변형이므로 실패로 처리하고, 호출자가 패키지 교체를 막게 한다.
 * "건너뜀"을 표현하려고 `ok: true` 를 돌려주지 않는다.
 */
export function nextCliRepairVerdict({ shimExists = false } = {}) {
  if (shimExists) {
    return {
      ok: false,
      notApplicable: false,
      status: "unsupported_family",
      reason: "next_family_cli_shim_present_but_unsupported",
    };
  }
  return {
    ok: false,
    notApplicable: true,
    status: "not_applicable",
    reason: "next_family_has_no_runtime_cli",
  };
}
