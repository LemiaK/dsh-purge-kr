/**
 * 기록 전 검증과 정규화(무의존).
 *
 * core.js 에서 뽑아낸 모듈: 이 함수들이 "어떤 값이 라이브러리에 들어올 수 있는지"를 결정하며
 * 보안 경계가 여기에 있다(경로 탈출, 잘못된 열거 값). 별도 위치에서 따로 읽고 따로 테스트할 가치가 있다.
 */

import { assertWithinRoots } from '../path-boundary.js'

export const WEBSHELL_TYPES = ['behinder', 'godzilla', 'antSword', 'antsword', 'custom']
export const WEBSHELL_STATUSES = ['online', 'offline', 'dead', 'unknown']

/**
 * 웹셸 타입 정규화: 대소문자 무시, 중국어 별칭(Behinder/Godzilla/AntSword) 허용.
 * 알아보지 못하면 원문을 조용히 저장하지 않고 오류를 던진다. 패널의 "사용자가 연결하지 못함" 빨간 표시와 세션 페이지의 연결 암호 복사가
 * 모두 이 필드로 판정하므로, 잘못 입력한 값을 저장하면 오류 없이 두 판정이 조용히 무효가 된다.
 * @param value - 원본 값(비어 있을 수 있다).
 * @returns 정규화된 값 또는 null(빈 값은 허용 = 미선언).
 */
export function normalizeShellType(value) {
  const raw = value === undefined || value === null ? '' : String(value).trim()
  if (raw === '') return null
  const lower = raw.toLowerCase()
  if (/behinder|\u51b0\u874e/.test(lower)) return 'behinder'
  if (/godzilla|\u54e5\u65af\u62c9/.test(lower)) return 'godzilla'
  if (/antsword|\u8681\u5251/.test(lower)) return 'antSword'
  if (lower === 'custom' || lower === 'custom-shell' || /\u81ea\u5b9a\u4e49|\u81ea\u7814/.test(raw)) return 'custom'
  throw new Error("webshell shell_type 이 올바르지 않다: " + JSON.stringify(value)
    + '. 전달 요건은 **비헨더 웹셸(behinder) / 갓질라 웹셸(godzilla)** 이다(사용자가 직접 연결할 수 있어야 한다).'
    + ' 그 밖의 타입은 custom 으로 채운다(임시 중계 전용이며, 패널에 "사용자가 연결할 수 없음"으로 표시된다).')
}

/** 웹셸 상태 정규화(인터페이스는 online/offline/unknown 3상태로 표시한다). */
export function normalizeShellStatus(value) {
  const raw = String(value === undefined || value === null ? '' : value).trim().toLowerCase()
  const aliases = { up: 'online', alive: 'online', down: 'offline', failed: 'offline', removed: 'dead' }
  const normalized = aliases[raw] || raw
  if (normalized === '') return 'online'
  if (!WEBSHELL_STATUSES.includes(normalized)) {
    throw new Error("webshell status 가 올바르지 않다: " + JSON.stringify(value) + ". 허용 값은 " + WEBSHELL_STATUSES.join(" / ") + " 뿐이다.")
  }
  return normalized
}


/**
 * 경로는 허용된 루트 안에 있어야 한다(디렉터리 탈출 방지).
 *
 * 필요한 이유: `readAttackFile` / `pocGet` 은 **데이터베이스의 path 열**을 읽는데,
 * 그 열은 에이전트가 `addAttackFile` / `savePoc` 을 통해 직접 기록한 값, 즉 신뢰할 수 없는 입력이다.
 * `/etc/passwd` 나 `~/.ssh/id_rsa` 로 채워지면 패널 클릭 한 번에 파일이 브라우저로 읽혀 나간다.
 * `deletePoc` 에는 일찍부터 startsWith 방어가 있었지만 읽기 경로와 쓰기 경로는 빠져 있었으므로 여기서 공용 구현으로 보완한다.
 * @param target - 검증할 경로.
 * @param allowedRoots - 허용 루트 목록(배열).
 * @returns 정규화된 절대 경로.
 * @throws 범위를 벗어나면 오류를 던진다(호출자는 "찾을 수 없음"으로 처리하고 내용을 조용히 반환하지 않는다).
 */
export function assertPathWithin(target, allowedRoots) {
  return assertWithinRoots(target, allowedRoots)
}
