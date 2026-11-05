/**
 * IP / 텍스트 정규화 도구(순수 함수, 의존성 0).
 *
 * core.js 에서 뽑아낸 첫 모듈 묶음 중 하나: 이 함수들은 데이터베이스를 건드리지 않고 Store 인스턴스에도 의존하지 않지만
 * 5000 줄짜리 core.js 안에 흩어져 있어 단위 테스트를 하려면 SQLite 까지 함께 로딩해야 했다.
 * 빼낸 뒤에는 따로 테스트하고 따로 읽을 수 있고, core.js 는 "사실 라이브러리 의미"에 집중할 수 있다.
 *
 * 내보내기 표면은 이전과 완전히 같다(core.js 가 그대로 다시 내보낸다). 그래서 호출자가 바꿀 것은 없다.
 */

/**
 * IPv4 → 32 비트 정수(ORDER BY 자연 정렬용).
 * IPv6 는 이 길로 갈 수 없다(문자열 split('.') 은 한 구간만 나온다). null 을 돌려주고
 * ip_int 를 NULL 로 둬 정렬이 ip 텍스트 기준으로 물러나게 한다. 0 을 지어내거나 주소를 망가뜨리지 않는다.
 */
export const ipToInt = (ip) => {
  const text = String(ip || '').trim()
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) return null
  return text.split('.').reduce((n, o) => (n * 256 + Number(o)) >>> 0, 0)
}

/** IPv6 리터럴인가(:: 축약과 IPv4-mapped 표기 포함). */
export function isIpv6(ip) {
  const text = String(ip || '').trim()
  if (!text.includes(':')) return false
  return /^[0-9a-fA-F:]+(:\d{1,3}(\.\d{1,3}){3})?$/.test(text) && text.split(':').length <= 9
}

/** IPv6 를 8 조의 16 진수로 펼친다(앞 4 조로 /64 를 계산할 때만 쓰고 완전 엄밀성은 추구하지 않는다). */
export function expandIpv6(ip) {
  const text = String(ip || '').trim().replace(/^\[|\]$/g, '')
  const [head, tail] = text.split('::')
  const left = head === '' ? [] : head.split(':')
  const right = tail === undefined || tail === '' ? [] : tail.split(':')
  const missing = 8 - left.length - right.length
  const groups = left.concat(new Array(Math.max(missing, 0)).fill('0')).concat(right)
  return groups.map((g) => (g === '' ? '0' : g.toLowerCase()))
}

/**
 * 이 IP 가 어느 "구간"에 속하는지(자산 매핑 왼쪽의 C 구간 그룹).
 *   · IPv4 → 앞 세 구간 + .0/24(기존 동작 유지);
 *   · IPv6 → 앞 네 조 + ::/64(IPv6 의 "한 네트워크"는 /64 이고 IPv4 의 /24 에 대응한다);
 *   · 알아볼 수 없으면 → 원문을 돌려주고, 2001:db8::1.0/24 같은 어정쩡한 값을 만들지 않는다.
 *     무조건 split('.') 로 ".0/24" 를 붙이면 안 된다: IPv6 자산이 더러운 CIDR 이 되어
 *     패널 왼쪽에 가짜 네트워크가 하나 생기고 자산 귀속도 틀어진다.
 */
export const cidrOf = (ip) => {
  const text = String(ip || '').trim()
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) return text.split('.').slice(0, 3).join('.') + '.0/24'
  if (isIpv6(text)) {
    const groups = expandIpv6(text)
    return groups.slice(0, 4).join(':') + '::/64'
  }
  return text
}

/**
 * IP 가 내부망인지 외부망인지 판정한다(패널이 이것으로 "내부 C 구간 / 외부 C 구간"을 묶는다).
 *   · IPv4: 10/8, 192.168/16, 127/8, 169.254/16, 172.16-31/12, 100.64-127/10(CGNAT);
 *   · IPv6: ULA(fc00::/7)와 링크 로컬(fe80::/10)을 내부망으로 본다;
 *   · IPv4-mapped 인 ::ffff:a.b.c.d 는 껍질을 벗겨 IPv4 로 판정한다.
 * @param ip - 판정할 주소.
 * @returns 'internal' | 'external'
 */
export function scopeOfIp(ip) {
  const s = String(ip || '')
  /* IPv6: ULA(fc00::/7)와 링크 로컬(fe80::/10)은 내부망이고, IPv4-mapped 인 ::ffff:a.b.c.d 는 껍질을 벗겨 IPv4 로 판정한다 */
  const mapped = /^::ffff:(\d{1,3}(\.\d{1,3}){3})$/i.exec(s)
  if (mapped !== null) return scopeOfIp(mapped[1])
  if (/^f[cd][0-9a-f]{2}:/i.test(s) || /^fe[89ab][0-9a-f]:/i.test(s)) return 'internal'
  if (/^(10\.|192\.168\.|127\.|169\.254\.)/.test(s)) return 'internal'
  const m = /^172\.(\d{1,3})\./.exec(s)
  if (m !== null) {
    const n = Number(m[1])
    if (n >= 16 && n <= 31) return 'internal'
  }
  const c = /^100\.(\d{1,3})\./.exec(s)
  if (c !== null) {
    const n = Number(c[1])
    if (n >= 64 && n <= 127) return 'internal'
  }
  return 'external'
}

/** 임의의 이름을 slug 로 정규화한다(전부 소문자, 영숫자가 아닌 문자는 하이픈). */
export function slugify(name) {
  const s = String(name || '').trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return s === '' ? 'engagement-' + Date.now() : s
}

/**
 * 대상(IP / URL / C 구간)을 공격 파일 디렉터리 이름으로 정규화한다.
 *  · IP 또는 ip:port → IP 만 취한다(같은 IP 의 여러 포트는 한 폴더로 묶인다)
 *  · URL → host 만 취한다(프로토콜, 포트, 경로 제거)
 *  · C 구간 10.0.0.0/24 → 10.0.0.0_24
 */
export function slugTarget(target) {
  const raw = String(target || '').trim()
  if (raw === '') return 'unknown'
  const ipMatch = /^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/.exec(raw)
  if (ipMatch !== null) return ipMatch[1]
  const urlMatch = /^https?:\/\/([^/?#]+)/i.exec(raw)
  const hostPort = urlMatch !== null ? urlMatch[1] : raw
  const host = hostPort.replace(/:(\d+)$/, '')
  return host.replace(/[^\w.\-]/g, '_').replace(/_+$/, '') || 'unknown'
}

/** 지식 베이스 항목의 안정 식별자를 만든다: 컴포넌트 + 번호/제목. 에이전트가 바로 인용할 수 있다. */
export function slugPoc(title, cve) {
  const t = String(title || '').trim()
  const c = String(cve || '').trim()
  /* 제목에 이미 CVE 가 적혀 있는 경우가 많으니 다시 붙이지 않는다(안 그러면 code 가 xxx-cve-2023-21839-cve-2023-21839 가 된다) */
  const flat = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
  const base = (c !== '' && !flat(t).includes(flat(c))) ? c + ' ' + t : t
  const slug = base.toLowerCase()
    .replace(/cve[-_ ]?(\d{4})[-_ ]?(\d+)/g, 'cve-$1-$2')
    .replace(/[^\w\u4e00-\u9fa5.-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')
  return slug === '' ? 'poc-' + Date.now() : slug
}

/** 언어에 맞는 본문 파일 이름을 준다(에이전트가 그대로 따라 실행할 수 있다). */
export function defaultPocFilename(title, kind, language) {
  const ext = {
    python: 'py', py: 'py', go: 'go', java: 'java', bash: 'sh', sh: 'sh', shell: 'sh',
    js: 'js', node: 'js', php: 'php', ruby: 'rb', powershell: 'ps1', http: 'http', nuclei: 'yaml', yaml: 'yaml',
  }[String(language || '').toLowerCase()]
  if (ext) return 'poc.' + ext
  if (kind === 'template') return 'poc.yaml'
  return 'poc.txt'
}

/** ISO 타임스탬프(출구를 하나로 모아 테스트 주입이 쉽다). */
export const nowIso = () => new Date().toISOString()
