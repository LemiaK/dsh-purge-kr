/**
 * 보고서 재현 도구(순수 함수, 의존성 0).
 *
 * 목표: 보고서의 **모든 득점 항목**에 "따라 할 수 있는" 재현 진입점을 붙인다. "원본 요청 기록이 없다"는
 * 한 줄로 끝나지 않게 한다. 데이터는 이미 라이브러리에 있으므로(공격 단계의 tool, 대상 URL, 근거 텍스트),
 * 여기서 Yakit 이 재생할 수 있는 패킷과 터미널에서 바로 돌릴 수 있는 명령으로 정리한다.
 *
 * 두 가지 원칙:
 *   · **합성한 것은 출처를 반드시 표기한다**(`synthesized: true`). 추론한 요청과 실제 캡처는
 *     신뢰도가 다르므로 보고서에서 한눈에 구분되어야 하고, 검수자가 추론을 실증으로 오해하면 안 된다.
 *   · 합성은 "정보가 충분할 때"만 한다: URL 이 있거나 명확한 curl/httpie 명령이 있어야 합성하고,
 *     아니면 차라리 비워 두고 보충 안내를 준다. 지어내지 않는다.
 */

/**
 * target 에서 scheme / host / port / path 를 해석해 합성 요청을 채우는 데 쓴다.
 *
 * IPv6 대괄호 표기를 반드시 명시적으로 처리한다: `http://[2001:db8::1]:8080/x` 에서는
 * "IPv6 주소 내부의 콜론"과 "포트 구분 콜론"이 섞여 있어 정규식 하나로 함께 잡으면 자리가 어긋난다
 * (실측에서 host 가 `2001:db8:`, path 가 `:8080/x` 로 해석되었고
 *  합성된 패킷 첫 줄이 `GET :8080/x HTTP/1.1` 이 되었다).
 * 그래서 두 단계로 나눈다: 먼저 대괄호로 authority 를 뽑고, 그다음 "마지막 콜론"으로 포트를 떼어낸다.
 *
 * @param target - `http://h:8080/p` / `10.0.0.5:6379` / `[::1]:22` 형태의 문자열.
 * @returns `{ scheme, host, port, path, authority }`, 해석할 수 없으면 null.
 */
function parseTarget(target) {
  const t = String(target || '').trim()
  if (t === '') return null
  const url = /^([a-z][a-z0-9+.-]*):\/\/([^/?#\s]+)([^?#\s]*)?/i.exec(t)
  if (url !== null) {
    const scheme = url[1].toLowerCase()
    const authority = url[2]
    const path = url[3] && url[3] !== '' ? url[3] : '/'
    /* 대괄호 IPv6: [2001:db8::1]:8080 → host 2001:db8::1, port 8080 */
    const bracket = /^\[([^\]]+)\](?::(\d{1,5}))?$/.exec(authority)
    if (bracket !== null) {
      return {
        scheme, host: bracket[1], port: bracket[2] === undefined ? (scheme === 'https' ? 443 : 80) : Number(bracket[2]),
        path, authority, ipv6: true,
      }
    }
    const portMatch = /:(\d{1,5})$/.exec(authority)
    const host = portMatch === null ? authority : authority.slice(0, -portMatch[0].length)
    return {
      scheme, host,
      port: portMatch === null ? (scheme === 'https' ? 443 : 80) : Number(portMatch[1]),
      path, authority, ipv6: false,
    }
  }
  /* 프로토콜이 없으면: host[:port], 역시 대괄호를 먼저 인정한다 */
  const bracket = /^\[([^\]]+)\](?::(\d{1,5}))?$/.exec(t)
  if (bracket !== null) {
    return { scheme: null, host: bracket[1], port: bracket[2] === undefined ? null : Number(bracket[2]), path: null, authority: t, ipv6: true }
  }
  const bare = /^([^\s/?#:]+)(?::(\d{1,5}))?$/.exec(t)
  if (bare !== null) {
    return { scheme: null, host: bare[1], port: bare[2] === undefined ? null : Number(bare[2]), path: null, authority: t, ipv6: false }
  }
  /* 알아볼 수 없는 형태(경로가 붙은 맨 호스트 등): 첫 구간만 호스트로 쓰고 나머지는 호출자에게 넘긴다 */
  const head = /^([^\s/?#]+)/.exec(t)
  if (head === null) return null
  return { scheme: null, host: head[1], port: null, path: null, authority: t, ipv6: false }
}

/** 이 명령이 어떤 도구처럼 보이는지(재현 명령으로 바로 쓸 수 있는지 판단용). */
function commandKind(tool) {
  const t = String(tool || '').trim()
  if (t === '') return null
  if (/^curl\b/i.test(t)) return 'curl'
  if (/^http(ie| x)?\b/i.test(t) || /^http\s/i.test(t)) return 'httpie'
  if (/^(nuclei|ffuf|feroxbuster|gobuster|dirsearch|sqlmap|hydra|nmap|masscan|fscan|gogo)\b/i.test(t)) return 'scanner'
  if (/^(msfconsole|use\s|set\s)/i.test(t)) return 'msf'
  if (/^(python|python3|java|go run|node)\b/i.test(t)) return 'script'
  return 'other'
}

/**
 * curl 명령 하나에서 URL 과 메서드를 뽑는다(재생 가능한 HTTP 패킷을 보충하는 데 쓴다).
 * 보수적으로만 해석한다: 뽑지 못하면 null 을 돌려주고 추측하지 않는다.
 */
function parseCurl(tool) {
  const t = String(tool || '').trim()
  if (!/^curl\b/i.test(t)) return null
  const urlMatch = /(https?:\/\/[^\s'"]+)/i.exec(t)
  if (urlMatch === null) return null
  const methodMatch = /(?:-X|--request)\s+([A-Z]+)/i.exec(t)
  const dataMatch = /(?:-d|--data(?:-raw|-binary|-urlencode)?)\s+(?:'([^']*)'|"([^"]*)"|(\S+))/i.exec(t)
  const headerMatches = Array.from(t.matchAll(/(?:-H|--header)\s+(?:'([^']*)'|"([^"]*)")/gi))
    .map((m) => m[1] !== undefined ? m[1] : m[2])
    .filter((x) => typeof x === 'string' && x.includes(':'))
  const cookieMatch = /(?:-b|--cookie)\s+(?:'([^']*)'|"([^"]*)"|(\S+))/i.exec(t)
  const data = dataMatch === null ? null : (dataMatch[1] ?? dataMatch[2] ?? dataMatch[3] ?? null)
  const method = methodMatch !== null ? methodMatch[1].toUpperCase() : (data === null ? 'GET' : 'POST')
  return {
    url: urlMatch[1], method, data,
    headers: headerMatches,
    cookie: cookieMatch === null ? null : (cookieMatch[1] ?? cookieMatch[2] ?? cookieMatch[3] ?? null),
    insecure: /(^|\s)-k(\s|$)|--insecure/.test(t),
    followRedirect: /(^|\s)-L(\s|$)|--location/.test(t),
  }
}

/**
 * Yakit Repeater 에 붙여 넣을 수 있는 HTTP 패킷을 합성한다.
 * @param options - `{ url, method, data, headers, cookie, insecure, followRedirect }`
 * @returns 패킷 텍스트, 정보가 부족하면 null.
 */
function buildHttpRequest(options = {}) {
  const target = parseTarget(options.url)
  if (target === null) return null
  const scheme = target.scheme || 'http'
  /* IPv6 의 Host 헤더는 대괄호가 필수다(RFC 3986). 아니면 잘못된 헤더다 */
  const hostText = target.ipv6 ? '[' + target.host + ']' : target.host
  const defaultPort = scheme === 'https' ? 443 : 80
  const hostHeader = (target.port !== null && target.port !== defaultPort)
    ? hostText + ':' + target.port
    : hostText
  const path = options.path !== undefined && options.path !== null && options.path !== ''
    ? options.path
    : (target.path || '/')
  const method = String(options.method || (options.data === undefined || options.data === null ? 'GET' : 'POST')).toUpperCase()
  const lines = [method + ' ' + path + ' HTTP/1.1', 'Host: ' + hostHeader]
  const headers = Array.isArray(options.headers) ? options.headers.slice() : []
  const hasHeader = (name) => headers.some((h) => String(h).toLowerCase().startsWith(name.toLowerCase() + ':'))
  if (!hasHeader('User-Agent')) headers.push('User-Agent: Mozilla/5.0')
  if (!hasHeader('Accept')) headers.push('Accept: */*')
  if (options.cookie && !hasHeader('Cookie')) headers.push('Cookie: ' + options.cookie)
  const body = options.data === undefined || options.data === null ? '' : String(options.data)
  if (body !== '' && !hasHeader('Content-Type')) {
    headers.push(/^\{.*\}$/.test(body.trim()) ? 'Content-Type: application/json' : 'Content-Type: application/x-www-form-urlencoded')
  }
  if (body !== '' && !hasHeader('Content-Length')) headers.push('Content-Length: ' + Buffer.byteLength(body, 'utf8'))
  if (!hasHeader('Connection')) headers.push('Connection: close')
  return [lines[0], ...headers, '', body].join('\r\n')
}

/**
 * "터미널에서 바로 돌릴 수 있는" 재현 명령을 합성한다.
 * 실제 curl 명령이 있으면 그것을 우선 쓴다(그대로 보존, 가장 신뢰도가 높다). 없으면 URL/메서드로 한 줄 조립한다.
 */
function buildCurlCommand(options = {}) {
  const raw = String(options.tool || '').trim()
  if (commandKind(raw) === 'curl') return raw          /* 실제 명령은 그대로 준다, 고치지 않는다 */
  const target = parseTarget(options.url)
  if (target === null) return null
  const scheme = target.scheme || 'http'
  const hostText = target.ipv6 ? '[' + target.host + ']' : target.host
  const defaultPort = scheme === 'https' ? 443 : 80
  const hostPart = target.port !== null && target.port !== defaultPort
    ? hostText + ':' + target.port
    : hostText
  const url = scheme + '://' + hostPart + (options.path || target.path || '/')
  const parts = ['curl -i -s' + (options.insecure ? ' -k' : '') + (options.followRedirect ? ' -L' : '')]
  if (options.method && String(options.method).toUpperCase() !== 'GET') parts.push('-X ' + String(options.method).toUpperCase())
  if (options.cookie) parts.push("-b '" + options.cookie + "'")
  if (options.data !== undefined && options.data !== null && options.data !== '') parts.push("-d '" + String(options.data).replace(/'/g, "'\\''") + "'")
  parts.push("'" + url + "'")
  return parts.join(' ')
}

/**
 * 이 득점 항목에 **이미 기록된 정보**로 액션 템플릿의 자리표시자를 채운다.
 *
 * 왜 하는가: 데이터베이스/터미널/터널 같은 득점 항목의 템플릿은 이렇게 생겼고
 *   `mysql -h <host> -u <user> -p -e "..."`
 * 이 득점 항목 자체가 host(target)와 계정(마운트된 자격 증명)을 알고 있다. 알려진 부분을 채우면
 * 현장에서 보고서를 받아 바로 돌릴 수 있다. 채우지 못한 자리표시자는 **그대로 두고 사실대로 보고**하며 추측하지 않는다.
 *
 * @param template - `<placeholder>` 가 들어 있는 명령 템플릿.
 * @param values - `{ host, port, user, pass, url, listen }` 등 알려진 값.
 * @returns `{ cmd, filled, remaining }`: 채운 명령 + 채운 항목 + 남은 자리표시자.
 */
function fillTemplate(template, values = {}) {
  let cmd = String(template || '')
  const filled = []
  const table = [
    [/<host>/gi, values.host],
    [/<ip>/gi, values.host],
    [/<port>/gi, values.port],
    [/<user(name)?>/gi, values.user],
    [/<\u8d26\u53f7>/g, values.user],
    [/<\u7528\u6237\u540d>/g, values.user],
    [/<pass(word)?>/gi, values.pass],
    [/<\u53e3\u4ee4>/g, values.pass],
    [/<\u5bc6\u94a5>/g, values.pass],
    [/<pwd>/gi, values.pass],
    [/<url>/gi, values.url],
    [/<\u57df\u540d>/g, values.host],
    [/<\u76ee\u6807IP>/g, values.host],
    [/<\u5185\u7f51IP>/g, values.host],
    [/<\u7aef\u53e3>/g, values.port],
    [/<listen\u7aef\u53e3>/g, values.port],
    [/<u>/g, values.user],
    [/<p>/g, values.pass],
  ]
  for (const [re, value] of table) {
    if (value === undefined || value === null || String(value) === '') continue
    const needle = new RegExp(re.source, re.flags.replace('g', ''))
    if (!needle.test(cmd)) continue
    cmd = cmd.replace(new RegExp(re.source, re.flags), String(value))
    /* 무엇을 채웠는지 기록한다. 보고서에 사실대로 적어야 한다(템플릿이 바뀌었으니 독자가 무엇이 보충되었는지 알아야 한다) */
    filled.push(re.source.replace(/[\\<>?()/]|gi$/g, '') + ' → ' + String(value))
  }
  const remaining = Array.from(new Set(Array.from(cmd.matchAll(/<[^>\s]{1,24}>/g)).map((m) => m[0])))
  return { cmd, filled, remaining }
}

export { parseTarget, commandKind, parseCurl, buildHttpRequest, buildCurlCommand, fillTemplate }
