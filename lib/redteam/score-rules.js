/**
 * 득점 규칙: 판정 집계 기준 + 기본 득점 항목(의존성 없음, node: 내장 모듈만 사용).
 *
 * core.js 에서 분리한 모듈이며 이 프로젝트에서 **가장 따로 읽어야 하는 코드**다:
 * 패널 / 보고서 / 공격 체인 세 곳의 총점이 반드시 일치하는 근거가 바로 여기의 applyScoreCaps 와
 * evaluateScoreBoard 가 **유일한 구현**이라는 점입니다 — 세 곳에서 각자 구현하면 반드시 서로 다른 집계 기준으로 드리프트합니다.
 *
 * 분업:
 *   · applyScoreCaps       —— 적중 행을 받아 어느 것이 득점으로 계상되고 어느 것이 상한에 걸렸는지 표시합니다;
 *   · evaluateScoreBoard   —— '메타데이터 읽기 + applyScoreCaps 호출 + 표시 되메우기'를 한 진입점으로 묶습니다;
 *   · DEFAULT_SCORE_POINTS —— 규칙 문서를 전개한 득점 항목 정의(src/rule/cap/dedup_scope).
 */

/* targetHasIpv6Host 는 IPv6 리터럴을 판정해야 합니다: ip-utils 의 같은 구현을 재사용해 두 벌의 정규식이 드리프트하는 것을 막습니다 */
import { isIpv6 } from './ip-utils.js'

/* ------------------------------------------------------------------ 판정 규칙 */

/* ------------------------------------------------------------------ 판정 규칙 */

/**
 * 무엇이 "진짜 터널"인가(경계 돌파/내부망 돌파의 자격 증명): **반드시 대상 경계를 넘어야** 하며,
 * 즉 채널의 한쪽 끝이 대상 측에 있어야 합니다. 세 가지 경우:
 *   · target-outbound: 대상이 먼저 내 서버로 접속해 나온 경우(리버스 셸 착지, 대상에서 frp/Stowaway 클라이언트 실행)
 *   · target-http: 대상 WebShell/HTTP 채널 경유(suo5, Neo-ReGeorg, reGeorg, 자체 HTTP 터널)
 *   · target-agent: 대상에서 이미 장악한 프로세스/세션을 경유한 터널(대상이 시작한 SSH -R 등)
 * 해당하지 않는 것: self-only —— 내 VPS / 자체 서버에서만 연 프록시나 서버 측으로, 대상을 건드리지 않았습니다.
 */
const TUNNEL_ENTRY_KINDS = {
  'target-outbound': '대상이 먼저 외부로 접속(리버스 셸 / 대상에서 frp 클라이언트 실행)',
  'target-http': '대상 WebShell/HTTP 채널 경유(suo5 / Neo-ReGeorg)',
  'target-agent': '대상에서 장악한 프로세스/세션 경유(SSH -R 등)',
  'self-only': '내 VPS/자체 서버에서만(돌파 아님)',
}
export { TUNNEL_ENTRY_KINDS }

/** 이 터널이 "대상 경계를 넘었는지". 선언되지 않았으면(옛 데이터/미입력) null 을 반환하고 화면은 '확인 대기'로 표시합니다. */
export function tunnelIsLegit(entryKind) {
  const k = String(entryKind || '').trim()
  if (k === '') return null
  return k !== 'self-only'
}

/**
 * 계정/권한류 득점 항목: **직접 가입하고 직접 만든 계정은 권한 확보로 치지 않습니다**(드릴 득점은 "남이 이미 가진 것을 확보"하는 것입니다).
 * 이 득점 항목이 적중하면 self_created 선언을 요구해, 자가 가입을 성과로 착각하지 않게 합니다.
 */
const ACCOUNT_POINT_CODES = ['web-account-user', 'web-account-admin', 'server-shell', 'db-access', 'internal-pivot', 'core-system']
export { ACCOUNT_POINT_CODES }

/**
 * [서비스] 단위로 상한을 두는 득점 항목: **같은 자산의 같은 포트는 한 번만 득점합니다**.
 *
 *   · 계정류(web-account-user / web-account-admin) —— 최고 권한 계정을 확보하면 그 서비스는 만점:
 *     일반 계정 10점, 관리자 20점이며, 같은 서비스에서 계정을 더 뚫어도 누적되지 않습니다
 *     (두 계정 유형은 **같은 부류**다: 일반 계정을 먼저, 관리자를 나중에 확보하면 관리자 항목만 계상되고 총점은 최고 항목 기준입니다).
 *   · 데이터베이스류(db-access) —— 같은 집계 기준: DB 권한 하나면 만점이며, 같은 서비스에서 두 번째 DB 계정을 뚫어도 중복 계상하지 않습니다.
 *
 * 그 밖의 득점 항목(webshell/rce/sensitive-data/boundary/…)은 여전히 상한이 없고 적중 횟수만큼 누적합니다.
 */
const SERVICE_CAPPED_POINT_CODES = ['web-account-user', 'web-account-admin', 'db-access']
export { SERVICE_CAPPED_POINT_CODES }

/**
 * target 에서 포트를 뽑습니다: `http://h:8080/x`, `10.0.0.5:6379`, `10.0.0.5:22`.
 * 포트가 없거나 뽑을 수 없으면 null 을 반환합니다(**80/443 을 지어내지 않습니다**, 서로 다른 서비스를 하나로 합치게 됩니다).
 */
export function parseTargetPort(target) {
  const t = String(target || '').trim()
  if (t === '') return null
  const url = /^[a-z][a-z0-9+.-]*:\/\/([^/?#\s]+)/i.exec(t)
  const authority = url !== null ? url[1] : (/^([^\s/?#]+)/.exec(t) || [])[1]
  if (!authority) return null
  const m = /:(\d{1,5})$/.exec(authority)
  if (m === null) return null
  const n = Number(m[1])
  return Number.isInteger(n) && n > 0 && n <= 65535 ? n : null
}

/** 라이브러리 컬럼의 port 값(옛 라이브러리는 null/0/빈 문자열일 수 있습니다). */
function normalizePort(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isInteger(n) && n > 0 && n <= 65535 ? n : null
}

/**
 * target 에서 [서비스 식별자]를 뽑습니다: host[:port].
 *   · 포트는 명시적으로 적힌 값을 쓰고, 없으면 프로토콜로 기본 포트를 추론합니다(http→80, https→443, 그 외→추론 안 함),
 *     이렇게 하면 `http://h/x` 와 `http://h:80/y` 가 같은 서비스로 묶입니다;
 *   · 경로/파라미터/쿼리 문자열은 모두 버립니다(`http://h:8080/a/b?c=1` → `h:8080`).
 * host 를 뽑을 수 없으면 null 을 반환합니다.
 */
function targetAuthority(target) {
  const t = String(target || '').trim()
  if (t === '') return null
  const url = /^([a-z][a-z0-9+.-]*):\/\/([^/?#\s]+)/i.exec(t)
  const scheme = url !== null ? url[1].toLowerCase() : null
  const authority = url !== null ? url[2] : (/^([^\s/?#]+)/.exec(t) || [])[1]
  if (!authority) return null
  const host = authority.replace(/:\d{1,5}$/, '').toLowerCase()
  if (host === '') return null
  let port = parseTargetPort(t)
  /* 포트가 없으면 프로토콜로 기본 포트를 채웁니다: 같은 서비스의 두 표기가 서로 다른 서비스로 계상되는 것을 막습니다 */
  if (port === null) {
    if (scheme === 'http') port = 80
    else if (scheme === 'https') port = 443
  }
  return port === null ? host : host + ':' + port
}

/**
 * [서비스] 키: 득점 상한의 단위 = 같은 자산의 같은 포트.
 *   · target 에서 host[:port] 를 뽑을 수 있으면 → 그것을 씁니다(`t10.20.30.40:3306`) ——
 *     같은 서비스에 서로 다른 사람이 득점을 기록할 수 있고, 어떤 이는 asset_id 를 붙이고 어떤 이는 target 만 적습니다.
 *     대상 기준이어야 이들을 한 묶음으로 모을 수 있습니다;
 *   · target 에서 뽑을 수 없으면(누락/이름만 있음) → 자산으로 후퇴합니다: 포트가 있으면 `a<id>:<port>`,
 *     포트가 없으면 `a<id>:0`(그 자산의 알 수 없는 포트)으로 적습니다;
 *   · 둘 다 없으면 → null(서비스 정보를 얻을 수 없어 이 건은 상한 대상에서 제외).
 */
export function scoreServiceKey(hit = {}) {
  const authority = targetAuthority(hit.target)
  if (authority !== null) return 't' + authority
  const assetId = hit.asset_id === null || hit.asset_id === undefined || hit.asset_id === '' ? null : Number(hit.asset_id)
  if (assetId === null) return null
  const port = normalizePort(hit.port)
  return 'a' + assetId + ':' + (port === null ? 0 : port)
}

/** [서비스]의 사람이 읽는 라벨, 경고/보고서용(예: `10.1.2.3:8080`). */
export function serviceLabel(hit = {}, assetIp) {
  const ip = assetIp || hit.asset_ip || ''
  const port = normalizePort(hit.port) ?? parseTargetPort(hit.target)
  if (ip !== '') return port === null ? ip : ip + ':' + port
  /* 자산 id 가 없으면 target 의 host[:port] 를 씁니다(경로와 파라미터를 떼고 URL 전체를 서비스 이름으로 쓰지 않습니다);
     포트가 라이브러리 컬럼에서 왔고 target 에 없으면 채워 넣어, 어느 서비스인지 한눈에 보이게 합니다. */
  const authority = targetAuthority(hit.target)
  if (authority === null) return hit.target ? String(hit.target) : '(서비스 미표기)'
  if (port !== null && !/:\d{1,5}$/.test(authority)) return authority + ':' + port
  return authority
}

/**
 * 득점 상한과 중복 제거의 **유일한 구현**(데이터 기반, v0.11.0 부터).
 *
 * 판정 필드는 득점 항목 자체(`score_point.rule / cap / dedup_scope`)에서 오며, 더는 코드의 하드코딩 명단에 기대지 않습니다:
 *   · `dedup_scope = service` —— 같은 (자산, 포트)에서는 배점이 가장 높은 한 건만 계상합니다;
 *   · `dedup_scope = system`  —— 같은 (자산, 포트, 시스템 이름)에서는 최고 권한 한 건만 계상하며,
 *     "같은 시스템은 최고 권한 배점을 한 번만 계산"하는 데 씁니다(메일/OA/집권 시스템 등);
 *   · `dedup_scope = target`  —— 대상 전체에서 한 번만 계상합니다(네트워크 경계 돌파, IPv6 가산);
 *   · `dedup_scope = none`    —— 중복 제거 없이 대수/카드/노드 수만큼 누적합니다(연산 카드 등).
 * 이후 `rule` 로 묶어 누적하며, 해당 규칙 `cap` 을 넘는 부분은 `capped` 로 표시합니다(cap = 0 이면 상한 없음).
 *
 * `self_created = 1`(직접 가입/직접 만든 계정)은 애초에 계상하지 않으므로 경쟁에도 참여하지 않고 자리도 차지하지 않습니다.
 *
 * @param {Array} rows - 적중 행(code / points / asset_id / port / target / recorded_at 이 필요하며,
 *                        system 집계 기준을 쓰려면 선택적으로 system_key)
 * @param {Map|Object|null} pointsByCode - code → `{rule, cap, dedup_scope, points}`;
 *                        생략하면 "각 code 가 자체 그룹이 되어 중복 제거만 하고 상한은 없음"으로 후퇴합니다(옛 호출 호환)
 * @returns {{capped:number, items:Array, caps:Map}} 표시를 마친 행 + 상한에 걸린 건수 + 규칙별 상한 사용량
 */
export function applyScoreCaps(rows = [], pointsByCode = null, nameByAsset = null) {
  const metaOf = (r) => {
    const m = pointsByCode === null || pointsByCode === undefined
      ? undefined
      : (typeof pointsByCode.get === 'function' ? pointsByCode.get(r.code) : pointsByCode[r.code])
    const rule = m && m.rule !== null && m.rule !== undefined ? Number(m.rule) : null
    const legacyScope = legacyCapGroup(r.code)
    return {
      group: rule === null ? 'code:' + String(r.code || '') : 'rule:' + rule,
      cap: m && Number(m.cap) > 0 ? Number(m.cap) : 0,
      scope: (m && m.dedup_scope) || legacyScope || 'none',
      rule,
    }
  }
  const flagged = (rows || []).map((r) => {
    const m = metaOf(r)
    return {
      ...r, capped: false, capped_by_id: null, capped_reason_kind: null,
      service_key: null, cap_group: m.group, dedup_scope: m.scope, rule: m.rule, rule_cap: m.cap,
    }
  })

  /* ① 득점 집계 기준 중복 제거: 같은 집계 기준 키 안에서 배점이 가장 높은 한 건만 남깁니다(동점이면 더 먼저 기록된 것) */
  const buckets = new Map()
  for (const r of flagged) {
    if (Number(r.self_created) === 1) continue
    const scope = r.dedup_scope
    if (scope === 'none' || scope === null || scope === undefined) continue
    let key
    if (scope === 'target') key = 'target'
    else if (scope === 'system') key = 'sys:' + String(systemKeyOf(r, nameByAsset) || '')
    else {
      /* `service` 집계 기준은 실제 서비스 키(`t<host[:port]>` / `a<id>:<port>`)가 있어야 합니다.
         서비스 정보를 얻을 수 없으면 **중복 제거에 참여시키지 않습니다**. "건마다 자체 키"로 후퇴하면
         `svc:#hit7` 같은 키가 같은 집계 기준의 적중을 서로 밀어내, 실측에서 target 이 없는
         terminal-access 적중 62건 중 61건이 dedup 으로 미계상 판정되어 1건만 남는 식으로 성과를 조용히 삼킵니다.
         상한을 덜 걸지언정 잘못 걸어서는 안 됩니다: 서비스를 알아볼 수 없으면 각자 계상합니다. */
      const svc = scoreServiceKey(r)
      if (svc === null || svc === undefined || String(svc) === '') continue
      key = 'svc:' + String(svc)
    }
    if (key === '' || key === 'svc:null' || key === 'sys:null') continue
    const k = r.cap_group + '|' + key
    if (!buckets.has(k)) buckets.set(k, [])
    buckets.get(k).push(r)
  }
  let capped = 0
  for (const list of buckets.values()) {
    if (list.length < 2) continue
    const best = pickBestHit(list)
    for (const r of list) {
      if (r === best) continue
      r.capped = true
      r.capped_by_id = best.id
      r.capped_by_points = Number(best.points) || 0
      r.capped_by_evidence = best.evidence || null
      r.capped_reason_kind = 'dedup'
      capped += 1
    }
  }

  /* ② 규칙 상한: 같은 rule 의 득점 적중 누계는 cap 을 넘을 수 없습니다(배점 높은 순으로 누적하고 초과분은 capped 로 표시) */
  const caps = new Map()
  const byRule = new Map()
  for (const r of flagged) {
    if (r.capped === true || Number(r.self_created) === 1) continue
    if (r.rule_cap <= 0) continue
    if (!byRule.has(r.cap_group)) byRule.set(r.cap_group, [])
    byRule.get(r.cap_group).push(r)
  }
  for (const [group, list] of byRule.entries()) {
    const cap = list[0].rule_cap
    const ordered = [...list].sort((a, b) => {
      const pa = Number(a.points) || 0; const pb = Number(b.points) || 0
      if (pb !== pa) return pb - pa
      return Number(a.id) - Number(b.id)
    })
    let used = 0; let nCapped = 0
    for (const r of ordered) {
      const pts = Number(r.points) || 0
      if (used + pts > cap) {
        r.capped = true
        r.capped_reason_kind = 'cap'
        r.capped_by_points = null
        nCapped += 1
        capped += 1
      } else {
        used += pts
      }
    }
    caps.set(group, { rule: list[0].rule, cap, used, capped: nCapped })
  }
  return { capped, items: flagged, caps }
}

/**
 * `system` 집계 기준 중복 제거에 참여하는 "시스템 키".
 *
 * 규칙 원문은 "같은 시스템은 최고 권한 배점을 한 번만 계산"(메일, OA, 집권 시스템 등)입니다.
 * 판정 순서:
 *   ① 적중이 가진 `system_key`(호출자가 명시한 값, 가장 정확);
 *   ② 자산의 `primary_name`(시스템 이름/도메인의 우선 이름); 자산 이름은 대개 같은 시스템이라 "같은 시스템"에 가장 가깝습니다;
 *   ③ 서비스 키(자산:포트)로 후퇴.
 * 셋 다 얻을 수 없으면 null 을 반환하며 —— 이때는 **해당 집계 기준 중복 제거에 참여시키지 않고**, 상한을 덜 걸지언정 잘못 걸지 않습니다.
 */
function systemKeyOf(hit = {}, nameByAsset = null) {
  const svc = scoreServiceKey(hit)
  const svcText = svc === null || svc === undefined ? '' : String(svc)

  /* ① 호출자가 명시한 system_key: **서비스 키 접두사(t<host[:port]> / a<id>:<port>)가 붙어 있을 때만 채택합니다**.
     호출자(listScorePoints / scoreReport / scoreChain)는 `자산 이름|포트` 같은 키를 미리 만들며,
     자산에 아직 이름이 없으면 `"|8080"` 으로 퇴화합니다 —— 이를 그대로 채택하면 10.7.7.7:8080 과 10.7.7.8:8080
     이 "같은 시스템"으로 합쳐져 다른 호스트의 성과가 덩달아 상한에 걸립니다.
     채택할 수 없으면 **아래로 계속 진행**해 서비스 키로 보완하며, system 집계 기준 자체를 버리지 않습니다. */
  const explicit = String(hit.system_key || '').trim()
  if (explicit !== '' && (svcText === '' || explicit.includes(svcText))) {
    /* 서비스 키가 없어 검증할 수 없을 때는 "이름 필드가 비어 있지 않을 것"을 요구합니다(포트만 인정하는 임의 키가 모든 서비스를 하나로 합치는 것을 막습니다) */
    const head = explicit.split('|')[0]
    if (svcText !== '' || String(head).trim() !== '') return explicit
  }

  /* ② 자산 이름(시스템 이름/도메인 우선 이름) + 서비스 키 —— **이것이 system 집계 기준의 주 경로**다.
     규칙 원문은 "같은 시스템은 최고 권한 배점을 한 번만 계산"이며, 적용 범위는 "같은 시스템 + 같은 포트"다:
     같은 시스템이 여러 호스트, 여러 포트에서 실행되면 서로 다른 인스턴스이므로 각각 최고 권한을 한 번 계산합니다.
     ⚠️ 정말로 "호스트와 포트를 넘어 한 번만" 계산해야 한다면 system_key 를 명시하고 같은 값을 줘야 합니다
     (위 ① 참조) —— 다만 그때는 이 적중들이 정말 같은 시스템 인스턴스인지 직접 확인합니다. */
  const id = hit.asset_id === null || hit.asset_id === undefined || hit.asset_id === '' ? null : Number(hit.asset_id)
  const nameOf = (assetId) => {
    if (assetId === null || nameByAsset === null || nameByAsset === undefined) return null
    const raw = typeof nameByAsset.get === 'function' ? nameByAsset.get(assetId) : nameByAsset[assetId]
    const text = raw === null || raw === undefined ? '' : String(raw).trim()
    return text === '' ? null : text
  }
  const name = nameOf(id)
  if (name !== null) return name + '|' + svcText

  /* ③ 서비스 키로 후퇴: 같은 (자산, 포트)에서 최고 권한을 한 번만 계산합니다 —— service 집계 기준과 동등하며,
     "같은 호스트의 시스템 권한, 애플리케이션 권한, 데이터베이스 권한은 최고 권한으로 한 번만 득점"(G1)의 보완입니다. */
  if (svcText !== '') return svcText

  /* ④ 셋 다 얻을 수 없을 때(asset_id 없음, 시스템 이름 없음, target 에서 host 도 못 뽑음):
     **이 적중 자신의 id** 로 후퇴합니다 —— 즉 "서로 다름"이며 각자 계상합니다.
     상한을 덜 걸지언정 잘못 걸어서는 안 됩니다: 구분할 수 없는 두 적중을 "같은 시스템"으로 판정하면 사용자의 성과를 헛되게 삼킵니다.
     ⚠️ 여기서 **Math.random() 을 쓰면 안 됩니다**: 같은 hit 이 두 번의 호출(패널 / 보고서 / 공격 체인)에서
     서로 다른 키를 받게 되어 득점 집계 기준이 불안정해집니다. */
  return '#hit' + String(hit.id ?? '0')
}

/** 같은 집계 기준의 적중 묶음에서 "득점으로 계상되는 한 건"을 고릅니다: 배점이 가장 높고, 동점이면 더 먼저 기록된 것(id 가 작은 것). */
function pickBestHit(list) {
  return list.reduce((a, b) => {
    const pa = Number(a.points) || 0; const pb = Number(b.points) || 0
    if (pb !== pa) return pb > pa ? b : a
    return Number(b.id) < Number(a.id) ? b : a
  }, list[0])
}

/** 옛 집계 기준 그룹(v0.10 이하 호환: 계정류와 데이터베이스류는 "같은 자산 같은 포트"로 상한). */
function legacyCapGroup(code) {
  const c = String(code || '').trim()
  if (c === 'web-account-user' || c === 'web-account-admin') return 'service'
  return SERVICE_CAPPED_POINT_CODES.includes(c) ? 'service' : null
}


/**
 * 득점 항목 메타데이터 읽기(code → `{ rule, cap, dedup_scope, points, enabled, builtin, src }`).
 * 패널 / 보고서 / 공격 체인 세 곳이 공유해, "같은 규칙을 세 곳에서 따로 읽고 필드를 하나씩 빠뜨리는" 일을 막습니다.
 * @param db - 대상 라이브러리 핸들.
 */
function loadScoreMeta(db) {
  return new Map(db.prepare('SELECT code, rule, cap, dedup_scope, points, enabled, builtin, src FROM score_point')
    .all()
    .map((r) => [String(r.code), {
      rule: r.rule === null || r.rule === undefined ? null : Number(r.rule),
      cap: Number(r.cap) || 0,
      dedup_scope: r.dedup_scope || 'service',
      points: Number(r.points) || 0,
      enabled: r.enabled === null || r.enabled === undefined ? 1 : Number(r.enabled),
      builtin: Number(r.builtin) === 1,
      src: r.src === null || r.src === undefined ? null : Number(r.src),
    }]))
}

/**
 * 자산 id → 시스템 이름(primary_name), `system` 집계 기준이 "같은 시스템"을 묶는 데 씁니다.
 * @param db - 대상 라이브러리 핸들.
 */
function loadAssetNames(db) {
  return new Map(db.prepare('SELECT id, primary_name FROM asset').all()
    .filter((a) => a.primary_name).map((a) => [Number(a.id), a.primary_name]))
}

/**
 * 이 적중의 **실제 배점** = 등급 배점 × 배율.
 *   · 등급 배점: 적중이 가진 값이 우선하고(병합판은 한 건에 여러 등급이 들어 있습니다), 없으면 득점 항목 기본 배점으로 후퇴합니다;
 *   · 배율: G5 데이터 규모 2배(1억 건 / 10TB 초과, 또는 통제 지식 베이스 관련 시스템) ×2,
 *     G6 IPv6 성과 ×3. 배율은 **권한 배점**에 적용되므로 배점에 곱해지고 상한과 함께 cap 에 제약됩니다
 *     (문서 요구: "상한은 해당 시스템 유형의 원래 상한으로 계산하며 배수 때문에 상한을 넘지 않습니다").
 */
function hitPointsOf(hit = {}, metaByCode = null) {
  let base = 0
  if (hit.points !== null && hit.points !== undefined && hit.points !== '') {
    base = Number(hit.points) || 0
  } else {
    const code = hit.code === null || hit.code === undefined ? null : String(hit.code)
    if (code !== null && metaByCode !== null && metaByCode !== undefined) {
      const meta = typeof metaByCode.get === 'function' ? metaByCode.get(code) : metaByCode[code]
      if (meta !== undefined && meta !== null) base = Number(meta.points) || 0
    }
  }
  const mult = Number(hit.multiplier)
  return Math.round(base * (Number.isFinite(mult) && mult > 0 ? mult : 1))
}

/**
 * 이 target 의 호스트 부분이 IPv6 리터럴인가(http://[2001:db8::1]:8080/x, 2001:db8::1, [::1]:22).
 *
 * 거친 문자 클래스 정규식으로 대신할 수 없습니다: IPv6 에는 16진 문자(a-f)가 섞여 있어
 * /^\[[0-9a-f:]+\]/ 처럼 "콜론과 16진수만 보는" 표기는 문자가 들어간 주소를 놓칩니다
 * (실측에서 2001:db8::1 의 db8 이 누락되어 G6 의 ×3 이 전혀 적용되지 않았습니다).
 * 그래서 호스트 부분 판정은 isIpv6() 에 맡깁니다 —— cidrOf / scopeOfIp 와 같은 구현을 씁니다.
 */
function targetHasIpv6Host(target) {
  const text = String(target || "").trim()
  if (text === "") return false
  const bracket = /^[a-z][a-z0-9+.-]*:\/\/(\[[^\]]+\])/i.exec(text)
  if (bracket !== null) return isIpv6(bracket[1].replace(/^\[|\]$/g, ""))
  const url = /^[a-z][a-z0-9+.-]*:\/\/([^/?#\s]+)/i.exec(text)
  const authority = url !== null ? url[1] : (/^([^\s/?#]+)/.exec(text) || [])[1]
  if (!authority) return false
  /* 맨몸 IPv6 에 포트를 붙이려면 대괄호가 필요하므로, 여기서 대괄호를 제거한 뒤 포트를 떼어 봅니다 */
  const host = authority.replace(/^\[|\]$/g, "").replace(/:\d{1,5}$/, "")
  return isIpv6(host)
}

/**
 * G5 / G6 의 배율 규칙을 배율 값으로 계산합니다(권한 배점에만 적용되며, 원래 상한을 넘지 않습니다 —— cap 이 막습니다).
 *   · `ip_version === 6` 또는 target 이 IPv6 리터럴 → ×3(G6);
 *   · `data_scale === "large"` → ×2(G5: 1억 건 초과 또는 10TB);
 *   · `data_scale === "knowledge-base"` → ×2(G5: 지식 베이스 관련 시스템 통제);
 *   · 둘 다 적중 → 곱합니다. 문서에 중첩 금지가 없으므로 드릴 측에 유리한 해석을 택하고 **이유를 그대로 표기**합니다.
 * @param hit - 적중 파라미터(ip_version / data_scale / target).
 * @returns `{ multiplier, reasons }`
 */
function scoreMultiplierOf(hit = {}) {
  const reasons = []
  let multiplier = 1
  const target = String(hit.target || "")
  const ipv6 = Number(hit.ip_version) === 6 || targetHasIpv6Host(target)
    /* 맨몸 IPv6 를 받쳐 주는 정규식은 콜론이 2개 이상이어야 합니다: dc01:389 / ad01:8080 같은 내부망 호스트명:포트는
       콜론이 하나뿐이라, 옛 정규식은 이를 IPv6 로 잘못 판정해 성과를 조용히 ×3 으로 만들었습니다 */
    || /(^|\/\/)(?:\[[0-9a-f:]+\]|[0-9a-f]*(?::[0-9a-f]*){2,})/i.test(target)
  if (ipv6) { multiplier *= 3; reasons.push("G6 IPv6 성과 ×3") }
  const scale = String(hit.data_scale || "").trim().toLowerCase()
  if (scale === "large") { multiplier *= 2; reasons.push("G5 데이터 규모 1억 건 / 10TB 초과 ×2") }
  else if (scale === "knowledge-base" || scale === "kb") { multiplier *= 2; reasons.push("G5 지식 베이스 관련 시스템 통제 ×2") }
  return { multiplier, reasons }
}

/**
 * **통합 득점 평가**: 패널 / 보고서 / 공격 체인이 모두 이 함수 하나를 호출해 "어느 건이 계상되고 어느 건이 상한에 걸렸는지" 계산합니다.
 *
 * 입력은 "적중 행" 묶음이고 출력은 그 행들의 득점 표시입니다. 호출자는 각 행이
 * `{ id, code, points, asset_id, port, target, self_created }` 와 **이 적중의 실제 배점**
 * (`points` 필드; 득점 항목 기본값을 넘기지 않습니다 —— 병합판은 한 건에 여러 등급이 들어 있어 기본값을 넘기면 어느 건이 계상되는지 반대로 판정됩니다)을 갖추기만 하면 됩니다.
 *
 * @param db - 대상 라이브러리 핸들.
 * @param rows - 적중 행 배열.
 * @param options - `{ meta?, names?, enabledOnly? }`: 이미 읽은 메타데이터를 재사용할 수 있습니다; `enabledOnly` 가 true 이면
 *                   "비활성 득점 항목"의 적중을 곧바로 미계상으로 표시합니다(보고서와 패널 집계 기준이 반드시 일치해야 합니다).
 * @returns `{ byId, items, caps, meta, names, disabledIds }`
 */
function evaluateScoreBoard(db, rows = [], options = {}) {
  const meta = options.meta || loadScoreMeta(db)
  const names = options.names || loadAssetNames(db)
  const prepared = (rows || []).map((h) => {
    const code = h.code === null || h.code === undefined ? null : String(h.code)
    const m = code === null ? undefined : meta.get(code)
    const nm = h.asset_id === null || h.asset_id === undefined ? null : names.get(Number(h.asset_id))
    return Object.assign({}, h, {
      code,
      /* points 는 반드시 "이 적중의 실제 배점"이어야 합니다(위 설명 참조) */
      points: hitPointsOf(h, meta),
      rule: m === undefined || m.rule === undefined ? null : m.rule,
      cap: m === undefined ? 0 : m.cap,
      dedup_scope: m === undefined ? 'service' : m.dedup_scope,
      cap_group: m === undefined || m.rule === null || m.rule === undefined ? 'code:' + String(code) : 'rule:' + m.rule,
      rule_cap: m === undefined ? 0 : m.cap,
      system_key: [nm || '', normalizePort(h.port) ?? parseTargetPort(h.target) ?? ''].join('|'),
    })
  })
  const evaluated = applyScoreCaps(prepared, meta, names)
  const byId = new Map(evaluated.items.map((x) => [x.id, x]))
  const disabledIds = new Set()
  if (options.enabledOnly === true) {
    for (const h of prepared) {
      const m = h.code === null ? undefined : meta.get(h.code)
      if (m !== undefined && Number(m.enabled) !== 1) disabledIds.add(h.id)
    }
  }
  return { byId, items: evaluated.items, caps: evaluated.caps, meta, names, disabledIds }
}

/**
 * 이 적중이 왜 계상되지 않았는지(경고 / 화면 / 보고서가 한 문장을 공유해, 세 곳의 집계 기준이 어긋나지 않게 합니다).
 * @param hit - 적중 행(code / target / port / rule / rule_cap / capped_reason_kind 포함)
 * @param bestPoints - 중복 제거에서 어느 건에 밀렸는지(그 건의 배점)
 */
export function scoreCapReasonText(hit = {}, bestPoints) {
  const label = serviceLabel(hit)
  if (hit.capped_reason_kind === 'cap') {
    return '[' + label + '] 이 건은 계상되지 않습니다: '
      + (hit.rule === null || hit.rule === undefined ? '' : '규칙 ' + hit.rule + ' ')
      + '의 **누적 득점이 해당 규칙 상한(' + (Number(hit.rule_cap) || 0) + '점)에 도달했습니다** —— 같은 규칙에서 상한을 넘는 부분은 더 누적되지 않습니다.'
      + '힘을 다른 규칙이나 다른 자산으로 옮기고, 상한에 도달한 규칙에서 더 쌓지 않습니다.'
  }
  return '[' + label + '] 이 대상에서는 권한을 이미 다 확보했습니다(집계 기준: 같은 대상에서는 배점이 가장 높은 한 건만 계상'
    + (bestPoints === undefined || bestPoints === null ? '' : ', +' + bestPoints + '점')
    + ') —— 이 건은 규칙상 더 계상되지 않고 과정 기록만 남습니다. **대상이나 규칙을 바꿔 진행하고, 같은 대상에서 같은 종류의 성과를 더 쌓지 않습니다**.'
}

/** 옛 이름 호환(v0.10 이하에서는 serviceCapReason). */
export const serviceCapReason = scoreCapReasonText


/**
 * 데이터 규모의 **거친 판정 문턱**: 100만 건/행.
 * 용도는 "대량 민감 정보 득점 항목"에서 G5 2배의 규모 자체 점검으로 바뀌었습니다 —— addScoreHit 의 경고를 봅니다.
 * 문서상 G5 의 정식 문턱은 "1억 건 초과 또는 10TB"이며, 여기서는 더 낮은 단계로 "규모를 적었는지"를 거칠게 걸러
 * 그보다 낮으면 확인을 권고하되 득점을 막지는 않습니다.
 */
export const SENSITIVE_DATA_MIN_ROWS = 1000000

/**
 * 증거 텍스트에서 데이터 규모(행/건/레코드 수)를 뽑습니다.
 * "120만 건", "1300만 행", "1,200,000 건 레코드", "2.5만 행", "1200000 records" 를 지원합니다.
 * **수량 단위(건/행/레코드/records/rows)나 규모 접미사(억/만…)가 붙은 표기만 인정합니다** ——
 * 맨 숫자는 인정하지 않습니다. 그러지 않으면 패스워드 안의 `123456`, 포트 번호를 데이터 규모로 오인합니다.
 * 뽑을 수 없으면 null 을 반환합니다(호출자가 규모 보충을 안내하며, 추측하거나 수를 지어내지 않습니다).
 */
export function parseRowCount(evidence) {
  const text = String(evidence || '')
  if (text.trim() === '') return null
  const units = { '\u4EBF': 1e8, '\u5343\u4E07': 1e7, '\u767E\u4E07': 1e6, '\u5341\u4E07': 1e5, '\u4E07': 1e4, '\u5343': 1e3 }
  const nums = []
  /* "숫자 + 단위 + 건/행/레코드": 단위는 규모 접미사이거나 영어 records/rows/entries */
  const cn = /(\d[\d,]*(?:\.\d+)?)\s*(\u4EBF|\u5343\u4E07|\u767E\u4E07|\u5341\u4E07|\u4E07|\u5343)?\s*(\u6761|\u884C|\u8BB0\u5F55|\u6570\u636E|records?|rows?|entries)/gi
  for (const m of text.matchAll(cn)) {
    const base = Number(String(m[1]).replace(/,/g, ''))
    if (!Number.isFinite(base)) continue
    const mult = m[2] === undefined ? 1 : units[m[2]]
    nums.push(Math.round(base * mult))
  }
  if (nums.length > 0) return Math.max(...nums)
  /* "120만 건 내보냄"처럼 건/행을 안 적은 표기도 인정하되, 규모 접미사가 반드시 붙어야 합니다 */
  for (const m of text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(\u4EBF|\u5343\u4E07|\u767E\u4E07|\u5341\u4E07|\u4E07|\u5343)/g)) {
    const base = Number(String(m[1]).replace(/,/g, ''))
    if (Number.isFinite(base)) nums.push(Math.round(base * units[m[2]]))
  }
  return nums.length === 0 ? null : Math.max(...nums)
}

/** 천 단위 구분 표시, 경고에서 숫자를 읽기 더 직관적입니다. */
export function formatRows(n) {
  return Number(n).toLocaleString('en-US')
}


/* ------------------------------------------------------------------ 기본 득점 항목 */

/**
 * 득점 항목 → 산출 집계 기준(어떻게 확보로 인정하는지, 무엇으로 자증하는지, 어떻게 재현하는지).
 *
 * 왜 `score_point.description` 에 밀어 넣지 않고 표를 따로 두는가:
 * 설명은 "규칙 문서의 조항"(에이전트가 등급을 판정하는 데 씁니다)이고, 이 표는 "검수자에게 보여 줄 재현 집계 기준"이라
 * 두 대상이 다르고 상세 수준도 다릅니다. 보고서와 화면은 code 로 여기 설명을 가져오며,
 * 규칙 문서를 갱신할 때 이 표를 건드릴 필요가 없고 그 반대도 마찬가지입니다.
 *
 * 필드:
 *   · need   —— 판정 기준: 무엇을 충족해야 이 항목을 확보한 것인지(검수자 대조용)
 *   · proof  —— 자기 증명 자료: 어떤 증거를 붙여야 하는지(G7 의 증명 자료 요구)
 *   · replay —— 재현 진입점: 어느 요청 / 어느 명령으로 재생하는지("재현 가능"의 가장 직접적인 답)
 *   · script —— 현장에서 바로 따라 할 수 있는 동작(가능한 한 복사해 실행 가능한 형태)
 */
export const SCORE_CONFIRM = {
  'domain-control': {
    need: '대상 도메인의 DNS 레코드가 우리 쪽 통제로 바뀌었거나(NS/A 레코드 적용), 도메인 관리 콘솔을 조작할 수 있습니다',
    proof: '관리 콘솔 스크린샷 + 레코드 변경 전후의 dig/nslookup 비교',
    replay: 'nslookup <도메인> <우리 NS>; 또는 콘솔 조작 요청 원문',
    script: 'dig NS <도메인> @8.8.8.8\ndig <도메인> @<우리NS>',
  },
  'terminal-access': {
    need: '단말에 명령을 내리고 실행 결과를 돌려받을 수 있습니다("장비를 하나 발견했습니다"가 아닙니다)',
    proof: '장악한 단말에서 id/hostname 을 실행한 출력 + 대상 기관과의 관계 증명(G7)',
    replay: '원격 제어 세션에서 id 실행; 또는 트로이 목마/원격 제어 agent 접속 기록',
    script: 'id; whoami; hostname',
  },
  'server-host': {
    need: '호스트에서 명령을 실행해 출력을 확보했습니다(WebShell / 리버스 셸 / 원격 제어 모두 인정)',
    proof: '명령 출력(id / hostname) + WebShell 접속 요소 또는 세션 기록',
    replay: 'WebShell 요청 원문(그대로 재생 가능); 또는 리버스 셸 리스너 기록',
    script: 'id; uname -a; cat /etc/passwd | head',
  },
  'db-credential': {
    need: '계정으로 데이터베이스에 성공적으로 접속해 조회를 실행했습니다(비인가 접근도 인정: 접속되면 성립)',
    proof: '로그인 성공 후 조회 출력(select user(), version()) + 계정 권한 등급',
    replay: 'mysql -h <host> -P <port> -u <user> -p\'<pass>\' -e "select user(),version()"',
    script: 'mysql -h <host> -u <user> -p -e "select user(),version(),current_user()"',
  },
  'web-app': {
    need: '대상이 이미 가진 계정으로 시스템에 로그인했고(일반 또는 관리자), 보호된 페이지에 접근했습니다',
    proof: '로그인 후 페이지 내용/출력 + 세션 Cookie 또는 Token(패스워드만 확보한 것이 아님을 증명)',
    replay: '로그인 요청 원문(증빙 Cookie/Token 포함) + 세션을 붙인 보호 페이지 요청 1회',
    script: 'curl -i -s -X POST <로그인URL> -d "username=<u>&password=<p>" -c cookie.txt\ncurl -s -b cookie.txt <보호 페이지>',
  },
  'central-system': {
    need: '배스천호스트/도메인 컨트롤러/SSO/단말 관리 콘솔 같은 집권 시스템에 로그인해 관리 권한을 얻었습니다',
    proof: '관리 콘솔 페이지 스크린샷 + "하위 노드를 관제할 수 있음"을 보여 주는 조작(하위 노드 20% 또는 20대 로그인)',
    replay: '로그인 요청 원문 + 관제 조작 1회(예: 관리 호스트 나열)의 요청과 응답',
    script: 'curl -s -b cookie.txt "<관제 목록 엔드포인트>"',
  },
  'bigdata-system': {
    need: '빅데이터 플랫폼(Hadoop/Spark/ES 등)의 관리 또는 일반 권한을 얻었습니다',
    proof: '플랫폼 관리 페이지/엔드포인트 출력 + 접근 가능한 데이터 규모(건수 또는 용량)',
    replay: '플랫폼 엔드포인트 요청 원문(예: ES _cat/indices, YARN /ws/v1/cluster/apps)',
    script: 'curl -s "<플랫폼 엔드포인트>" | head -50',
  },
  netdev: {
    need: '네트워크 장비(방화벽/라우터/스위치/VPN/게이트웨이)에 로그인해 권한을 얻었습니다',
    proof: '장비 관리 페이지 스크린샷 + 라우팅 테이블 또는 연결량 스크린샷(G7 명시 요구)',
    replay: '장비 로그인 요청 원문 + 라우팅 테이블 조회 명령 출력',
    script: 'show ip route    # 또는 display ip routing-table',
  },
  'netdev-redirect': {
    need: '그 장비를 통해 실제로 트래픽 경로를 바꿨습니다(정책/라우팅/DNS 변경이 적용됨)',
    proof: '변경 전후 라우팅 테이블 또는 정책 비교 + 우리 노드가 트래픽을 받은 증거',
    replay: '정책 설정 요청 원문 + 우리가 통제하는 노드의 패킷 캡처/접근 로그',
    script: 'tcpdump -ni any port <포트> -c 10',
  },
  'netdev-implant': {
    need: '장비에 실행 가능한 원격 제어/지속성을 심었고, **그리고** 그것으로 후속 공격을 완료했습니다',
    proof: '원격 제어 프로세스 또는 지속성 항목의 증거 + 그 장비를 경유한 후속 성과 기록',
    replay: '심기 동작의 요청/명령 원문 + 이후 그 장비를 경유한 접근 로그',
    script: '',
  },
  iiot: {
    need: '산업 인터넷 시스템의 관리 권한을 얻었거나, 그 아래 연결 장비를 대량으로 통제했습니다',
    proof: '관리 콘솔 스크린샷 + 장악한 장비 목록과 수량',
    replay: '로그인 요청 원문 + 장비 목록 엔드포인트 응답',
    script: '',
  },
  'cloud-platform': {
    need: '클라우드 관리 플랫폼 관리자 권한; 또는 ak/sk 로 클라우드 노드를 대량 통제(노드 득점은 100개 이상일 때만)',
    proof: '플랫폼 관리 페이지 스크린샷; ak/sk 상황이면 장악 노드 목록과 수량, 또는 관리자 증명(노드 추가/권한 변경)',
    replay: '플랫폼 엔드포인트 요청 원문(인스턴스 나열, 사용자 생성 등)',
    script: 'curl -s -H "Authorization: Bearer <token>" "<플랫폼/인스턴스 목록 엔드포인트>"',
  },
  'iot-platform': {
    need: '사물인터넷 관제 플랫폼 권한을 얻었거나, 그 연결 지점으로 기기를 대량 통제했습니다',
    proof: '플랫폼 관리 페이지 스크린샷 + 연결 지점/기기 수량',
    replay: '플랫폼 로그인과 기기 목록 엔드포인트 원문',
    script: '',
  },
  'iot-corenet': {
    need: '사물인터넷 단말에서 핵심망으로 횡적 이동해 업무 생산 등 중요 시스템을 통제했습니다',
    proof: '경로 설명(어느 단말→핵심망→어느 시스템) + 그 시스템의 통제 증거',
    replay: '단말에서 시작한 횡적 이동 명령 + 핵심망 시스템의 로그인/조작 요청',
    script: '',
  },
  secdev: {
    need: '비집권 보안 장비(IPS/IDS/감사/WAF)의 관리자 권한을 얻었습니다',
    proof: '장비 관리 페이지 스크린샷 + 정책을 통제할 수 있음을 보여 주는 조작',
    replay: '로그인 요청 원문 + 정책 조회 엔드포인트 응답 1건',
    script: '',
  },
  'file-storage': {
    need: '파일 스토리지 시스템 백엔드 권한(FTP/NAS/클라우드 디스크/오브젝트 스토리지)을 얻었거나 그 일반 계정을 확보했습니다',
    proof: '디렉터리 나열 스크린샷 + 읽을 수 있는 파일 목록(데이터 성과는 따로 득점, G2 참조)',
    replay: '디렉터리 나열 요청 원문(FTP LIST / S3 ListObjects / WebDAV PROPFIND)',
    script: 'curl -s "<스토리지 엔드포인트>" | head -50',
  },
  'ai-agent': {
    need: '모델 에이전트/skill 같은 agent 도구를 통제하고, **실제로 그것을 구동해 동작을 수행시켰습니다**',
    proof: '대화 또는 호출 기록 + 구동된 동작과 그 결과(구간 배점은 통제 깊이로 판정)',
    replay: 'agent 를 구동한 요청 원문 + 그 동작의 출력',
    script: '',
  },
  'model-compute': {
    need: '연산 관리 플랫폼/학습 데이터와 지식 베이스 시스템의 시스템 관리 권한을 얻었습니다',
    proof: '관리 콘솔 스크린샷 + 연산 스케줄링 또는 데이터 읽기/쓰기를 보여 주는 조작',
    replay: '플랫폼 로그인과 스케줄링/데이터 엔드포인트 원문',
    script: '',
  },
  'model-data': {
    need: '모델 관련 데이터 시스템 관리자 권한을 얻었습니다(학습/추론/운영에 영향, 가중치 탈취·변조 가능)',
    proof: '관리 콘솔 스크린샷 + 읽기/쓰기 가능한 모델/데이터셋 목록',
    replay: '플랫폼 엔드포인트 원문(모델 나열, 가중치 다운로드)',
    script: '',
  },
  'computepower-admin': {
    need: '연산 인프라 관리자 권한을 얻었습니다',
    proof: '관리 콘솔 스크린샷 + 자원을 스케줄링할 수 있음의 증명',
    replay: '플랫폼 로그인과 자원 목록 엔드포인트 원문',
    script: '',
  },
  'computepower-cards': {
    need: '연산 카드 자원을 실제로 확보했거나(10점/카드) 카드 풀링 플랫폼 통제권을 얻었습니다',
    proof: '카드 자원 목록(수량) + 작업을 제출하거나 카드를 독점할 수 있다는 증거',
    replay: 'nvidia-smi 출력 / 플랫폼 카드 목록 엔드포인트',
    script: 'nvidia-smi -L',
  },
  'boundary-logical': {
    need: '대상 측에서 내부망으로 통하는 채널을 세웠고 **실제로 내부망 대상에 접근했습니다**',
    proof: '터널 등록(입구가 반드시 대상 측) + 터널 경유 내부망 대상 접근 출력/스크린샷(G7)',
    replay: '터널 경유 내부망 대상 접근 명령과 출력; 터널 구축 명령',
    script: 'curl --socks5-hostname 127.0.0.1:<포트> http://<내부IP>/ -i',
  },
  'boundary-strong': {
    need: '게이트웨이류 강격리를 돌파해 강격리 업무 내부망으로 들어가 내부망 대상에 실제 접근했습니다',
    proof: '게이트웨이류 격리 장비의 통제 스크린샷 + 내부망 접근 가능 스크린샷 증명(G7)',
    replay: '강격리 채널 경유 내부망 대상 접근 명령과 출력',
    script: '',
  },
  'boundary-physical': {
    need: '물리적 격리를 돌파해 핵심 생산망으로 들어가 대상에 실제 접근했습니다',
    proof: '방화벽/VPN/멀티 NIC 호스트/게이트웨이의 통제 스크린샷 + 내부망 접근 가능 스크린샷(G7)',
    replay: '핵심망 진입 후 대상 접근 명령과 출력',
    script: '',
  },
  'boundary-supply': {
    need: '공급망 운영 채널 또는 클라우드 서비스를 통해 주 방어 기관 내부망에 들어갔습니다(상황별로 따로 득점)',
    proof: '공급망/클라우드 측 통제 증거 + 주 방어 기관 내부망 진입 증명; 어느 상황인지 명시',
    replay: '공급망 채널에서 내부망으로 들어간 명령과 출력',
    script: '',
  },
}

/** 어떤 득점 항목의 산출 집계 기준을 가져옵니다; 전용 항목이 없으면 null 을 반환합니다(보고서는 evidence 만 표시하는 것으로 후퇴). */
export function scoreConfirmOf(code) {
  const key = String(code || '').trim()
  return SCORE_CONFIRM[key] === undefined ? null : SCORE_CONFIRM[key]
}

export const DEDUP_SCOPES = ['service', 'system', 'target', 'none']

/**
 * 득점 항목 하나의 완전한 정의(팩토리 함수, 22개 객체의 필드 중복을 피합니다).
 *
 * 두 번호는 역할이 다르며 **혼용하지 않습니다**:
 *   · `src`  —— [돌파 침입류 득점 규칙(병합판)] 의 "원 번호"(병합 행은 첫 원 번호를 적습니다),
 *               원표와 한 줄씩 대조할 때만 쓰며 문서와 코드 주석에 나옵니다;
 *   · `rule` —— 이 구현 내부의 **상한 그룹 키**(`applyScoreCaps` 가 이 값으로 cap 을 누적합니다).
 *               반드시 **유일**해야 합니다: 과거에 원 번호를 그대로 그룹 키로 썼더니 16/17 병합 행과
 *               19 의 두 하위 항목이 같은 키를 공유해 —— 한 적중이 다른 적중의 상한을 먹어 버렸고,
 *               `rule` 번호에 중복(19 두 개)과 빈 번호(6/17/20/21)가 생겨
 *               모델이 "규칙 19 가 상한 도달"을 읽어도 어느 것인지 구분할 수 없었습니다.
 *               지금은 1..N 연속 유일로 통일했고 배열 순서와 일대일로 대응합니다.
 */
const sp = (src, rule, tier, code, name, category, points, cap, dedup_scope, description) => ({
  src, rule, tier, code, name, category, points, cap, dedup_scope, description,
})

/* ── 공통 규칙(G1–G8, 전 항목에 횡단 적용; 따로 득점하지 않고 설명과 프롬프트에 씁니다)────────────
   G1 권한은 최고만 한 번 계상 / G2 데이터 성과는 별도 득점 / G3 상한은 단일 방어 기관 기준 /
   G4 장비는 대수(개수)로 득점 / G5 데이터 규모 2배 / G6 IPv6 ×3(원래 상한을 넘지 않음) /
   G7 증명 자료 요구 / G8 보완 조항: 그 밖의 시스템은 전담조가 판정해 배점합니다.
   전체 원문은 docs/ 아래 득점 규칙 병합판 문서를 봅니다. */
export const SCORE_GENERAL_RULES = [
  { code: 'G1', name: '권한은 최고만, 한 번만 계상', detail: '같은 시스템, 같은 호스트, 같은 데이터베이스에서 여러 권한을 얻었을 때는 최고 권한으로 한 번만 계상합니다(관리자와 일반 권한을 모두 얻으면 관리자 권한 배점만 줍니다).' },
  { code: 'G2', name: '데이터 성과는 별도 득점', detail: '메일 데이터, 업무 데이터, 데이터 자산 등 성과는 데이터 중요도로 따로 득점하며 권한 배점과 섞지 않습니다.' },
  { code: 'G3', name: '상한 집계 기준', detail: '각 항목의 배점 상한은 단일 방어 기관과 그 모든 하위 기관에 적용되며, 상한에 도달하면 더 누적하지 않습니다.' },
  { code: 'G4', name: '장비/단말은 대수(개수)로 득점', detail: '프린터, wifi 라우터 5점/대; PC, Pad, 휴대폰, 카메라, 전자 대형 스크린 10점/대; 클라우드 호스트, 컨테이너, 위탁 연결 장비, 사물인터넷 연결 지점 등은 10점/대(개). 대량 통제는 "장악한 노드"로 환산합니다.' },
  { code: 'G5', name: '데이터 규모 2배', detail: '대량 데이터 시스템(중요 데이터량 1억 건 또는 10TB 초과)을 포함하면 득점이 2배; 지식 베이스 관련 시스템을 통제하면 득점이 2배. 시스템이 생성하는 일반 로그 데이터는 포함하지 않습니다.' },
  { code: 'G6', name: 'IPv6 배수', detail: 'IPv6 를 이용해 얻은 성과의 점수 ×3, 다만 상한은 해당 시스템 유형의 원래 상한으로 계산하며 배수 때문에 상한을 넘지 않습니다.' },
  { code: 'G7', name: '증명 자료', detail: '네트워크 경계를 돌파하려면 격리 장비 통제 스크린샷, 내부망 접근 가능 스크린샷 증명 등을 제공해야 합니다; 통제한 휴대폰, Pad 등 단말은 대상 기관과의 관계를 증명할 수 있어야 합니다; 네트워크 장비 권한은 라우팅 테이블 같은 증거 또는 연결량 스크린샷이 필요합니다.' },
  { code: 'G8', name: '보완 조항', detail: '그 밖의 시스템, 서버, 장비 등의 권한은 배점을 미리 정하지 않고 전담조가 판정해 줍니다.' },
]

/**
 * 기본 득점 항목 —— **[돌파 침입류 득점 규칙(병합판)] 과 엄격히 정렬, 총 25 항목**
 * (1. 권한 획득 21건 + 2. 네트워크 경계 돌파 4건, 총 8개 분류; 그중 "같은 행의 서로 다른 과금 단위"는 독립 득점 항목으로 나눕니다. 예: 연산 인프라의 관리자 권한과 연산 카드).
 *
 * 이전 버전과의 차이: 더는 "같은 규칙 안의 권한 등급"으로 항목을 쪼개지 않습니다 —— 한 항목 = 병합판의 한 행
 * (`tier` 필드에 그 항목의 등급/하위 항목을 적습니다), **과금 단위가 다른** 다단계만 하위 항목으로 남깁니다
 * (예: 연산 인프라의 "관리자 권한"과 "연산 카드 10점/카드").
 *
 * 필드 의미:
 *   · src    병합판의 "원 번호"(원표와 한 줄씩 대조하는 데 씁니다);
 *   · group  화면 그룹: GENERAL = 일반 시스템 통제, WEB = Web 애플리케이션 시스템 통제,
 *            CENTRAL = 집권 시스템 통제, BIGDATA = 빅데이터 시스템 통제,
 *            NETINFRA = 네트워크 인프라 통제, STORAGE = 파일 스토리지류 시스템,
 *            MODEL = 모델 관련 시스템 통제, BOUNDARY = 네트워크 경계 돌파;
 *   · points 1회 배점(한 항목에 다단계가 있으면 그 항목의 주 등급을 쓰고 설명에 각 등급을 적습니다);
 *   · cap    그 항목의 상한(0 = 상한 없음); dedup_scope 득점 집계 기준.
 */
export const SCORE_GROUPS = [
  { code: 'GENERAL', name: '일반 시스템 통제' },
  { code: 'WEB', name: 'Web 애플리케이션 시스템 통제' },
  { code: 'CENTRAL', name: '집권 시스템 통제' },
  { code: 'BIGDATA', name: '빅데이터 시스템 통제' },
  { code: 'NETINFRA', name: '네트워크 인프라 통제' },
  { code: 'STORAGE', name: '파일 스토리지류 시스템' },
  { code: 'MODEL', name: '모델 관련 시스템 통제' },
  { code: 'BOUNDARY', name: '네트워크 경계 돌파' },
]

export const DEFAULT_SCORE_POINTS = [
  /* ══ 1. 권한 획득(18 항목)══════════════════════════════════════════════ */

  /* 1 도메인 통제 권한 */
  sp(1, 1, '1급 50 / 2급 20점/개', 'domain-control', '도메인 통제 권한', 'GENERAL', 50, 400, 'system',
    '**1급 도메인 50점/개, 2급 도메인 20점/개**, 도메인 유형으로 배점합니다; 이 항목의 상한은 400점(G3).\n'
    + '계상할 때 evidence 에 도메인과 그 유형을 적습니다; 2급 도메인을 얻었으면 1회 배점을 20 으로 조정합니다.'),

  /* 2 단말 권한 */
  sp(2, 2, '5 / 10점/대', 'terminal-access', '단말 권한(휴대폰, Pad, PC, 프린터, 카메라, wifi 라우터 등)', 'GENERAL', 10, 600, 'system',
    '**프린터, wifi 라우터 5점/대; PC, Pad, 휴대폰, 카메라, 전자 대형 스크린 10점/대**(G4), 대수로 누적; 이 항목의 상한은 600점(G3).\n'
    + '통제한 단말 장비는 대상 기관과의 관계를 증명할 수 있어야 합니다(G7); 5점 등급 장비를 얻었으면 1회 배점을 5 로 조정합니다.\n'
    + '피싱으로 얻은 단말도 같은 항목으로 계상하며, evidence 에 대상 인력의 역할(일반 사무 / IT 운영 / 업무 운영)을 적습니다.'),

  /* 3 서버 호스트 권한 */
  sp(3, 3, '일반 10 / 관리자 50점/개', 'server-host', '서버 호스트 권한(웹셸 권한 포함)', 'GENERAL', 50, 600, 'system',
    '**일반 권한 10점/개, 관리자 권한 50점/개**; 이 항목의 상한은 600점(G3).\n'
    + '같은 호스트는 최고 권한으로 한 번만 계상합니다(G1) — root/SYSTEM 을 얻은 뒤 같은 호스트에서 일반 권한을 더 누적하지 않습니다.\n'
    + '서버 호스트 1대를 얻는 것은 감점이 없습니다; 일반 권한을 얻었으면 1회 배점을 10 으로 조정합니다.'),

  /* 4 데이터베이스 접속 계정/패스워드 */
  sp(4, 4, '일반 10 / 관리자 50 / 미인가 10점/개', 'db-credential', '데이터베이스 접속 계정/패스워드(SQL 인젝션 포함)', 'GENERAL', 50, 400, 'system',
    '**일반 사용자 권한 10점/개, 관리자 권한 50점/개; redis 및 그 밖의 빈 패스워드, 미인가 접근 성과는 일괄 10점/개**; 이 항목의 상한은 400점(G3).\n'
    + '같은 데이터베이스의 동등 권한(관리자 포함)은 한 번만 득점합니다; 같은 호스트의 시스템 권한, 애플리케이션 권한, 데이터베이스 권한은 최고 권한으로 한 번만 득점합니다(G1).\n'
    + '데이터 성과는 따로 계상합니다(G2); 일반 권한/미인가를 얻었으면 1회 배점을 10 으로 조정합니다.'),

  /* 5, 6 메일과 업무 생산 시스템(원표 두 항목이 규칙과 상한을 공유) */
  sp(5, 5, '관리자 100 / 일반 50점/개', 'web-app', '메일 시스템 / 사무 자동화와 업무 생산 시스템 / 그 밖의 Web 애플리케이션 시스템 권한', 'WEB', 100, 2000, 'system',
    '**관리자 권한 100점/개, 일반 사용자 권한 50점/개; 같은 시스템은 최고 권한 점수만 한 번 계산합니다**(G1); 이 항목의 상한은 2000점(G3).\n'
    + '이 항목은 원표 제5, 6항을 병합한 것(규칙과 상한이 완전히 같습니다), **즉 "Web 애플리케이션 시스템 통제" 분류**입니다; 계상할 때 evidence 에 어느 분류인지 적습니다:\n'
    + '· **메일 시스템**;\n'
    + '· **사무 자동화와 업무 생산 시스템**(사무 OA, ERP, 직보 인스턴트 메신저, 재무 시스템, 업무 생산 시스템, 데이터 웨어하우스 등 통제되거나 마비되면 업계나 기관의 업무 생산, 운영 관리, 일상 사무에 영향을 주는 시스템);\n'
    + '· **그 밖의 Web 애플리케이션 시스템(보완 분류)**: 자격 증명 목록의 계정으로 **실측 로그인이 되는** HTTP/HTTPS 사이트 중,'
    + '다른 더 구체적인 득점 항목 분류에 들어가지 않는 것(집권 시스템은 제7항, 빅데이터 시스템은 제8항, 클라우드 관리 플랫폼은 제11항, 사물인터넷 관제 플랫폼은 제12항, 보안 장비는 제13항 등),'
    + '은 일괄 이 항목으로 계상합니다(관리자 100 / 일반 50). **자격 증명에 `host:port` 만 등록되고 시스템 이름이나 업무 귀속이 적히지 않은 Web 로그인(백엔드, 관리 단말, 운영 플랫폼, 자체 개발 업무 시스템 등)도 이 항목으로 갑니다** —'
    + '먼저 더 맞는 분류가 있는지 판정하고, 없으면 "Web 애플리케이션 시스템 통제"로 귀속하며 "메일/OA 인지 알 수 없습니다"라는 이유로 누락하지 않습니다.'
    + '계상할 때 `target` 에는 실제 로그인 URL(포트 포함)을 쓰고, evidence 에 "어떤 사이트 + 어떤 계정 + 관리자/일반 등급"을 적으며, 레드라인 1 에 따라 먼저 실측 로그인합니다.\n'
    + '메일 데이터는 중요도에 따라 다시 따로 계상합니다(G2); 일반 사용자 권한을 얻었으면 1회 배점을 50 으로 조정합니다.'),

  /* 7 집권 시스템 */
  sp(7, 6, '관리자 500 / 일반 50점/개', 'central-system', '집권 시스템 권한(운영 / 신원 / 네트워킹 / 단말 관리 백엔드)', 'CENTRAL', 500, 4000, 'system',
    '**시스템 관리자 권한 500점/개, 일반 권한 50점/개**; 같은 권한은 한 번만 득점합니다. 즉 관리자와 일반 권한을 모두 얻으면 관리자 권한 점수만 줍니다(G1); 이 항목의 상한은 4000점(G3).\n'
    + '집권 시스템에는 네 분류가 있습니다:\n'
    + '· **운영 집권류**: 배스천 호스트, 중앙 관제, 통합 리소스 배포 등;\n'
    + '· **신원 권한 관리류**: SSO, 4A, IAM 등;\n'
    + '· **네트워킹 집권류**: 도메인 컨트롤러, 인증서 인증, SDWAN 통합 컨트롤러 등;\n'
    + '· **단말 호스트 관리 백엔드류**: 단말 관리 소프트웨어 백엔드, 제로 트러스트 컨트롤 센터 등.\n'
    + '⚠️ 집권 시스템이 **위탁 관리하는 호스트, 단말 등 장비는 분류를 넘어 "일반 시스템 통제"의 배점을 인용합니다**(예: PC, 이동 단말 10점/대, G4) —'
    + '**집권 시스템 최고 등급 500점으로 계산하면 안 됩니다**, 그러면 심하게 과대평가됩니다; 대량 통제는 증명을 요구합니다: 위탁 노드 수의 최소 20% 로그인, 최대 20대 로그인이면 됩니다.'),

  /* 8 빅데이터 시스템 */
  sp(8, 7, '관리자 1000 / 일반 100점/개', 'bigdata-system', '빅데이터 시스템 권한', 'BIGDATA', 1000, 4000, 'system',
    '**관리자 권한 1000점, 일반 권한 100점/개**; 같은 권한은 한 번만 득점합니다. 즉 관리자와 일반 권한을 모두 얻으면 관리자 권한 점수만 줍니다(G1); 이 항목의 상한은 4000점(G3).\n'
    + '데이터는 따로 계상합니다(G2); **유효 데이터량이 5억 건 또는 1TB 미만이면 일반 데이터베이스로 계산합니다**(즉 제4항 배점으로 바꿉니다).'),

  /* 9 네트워크 장비 권한 */
  sp(9, 8, '일반 100 / 관리자 200 / 가산 200·1000점', 'netdev', '네트워크 장비 권한(방화벽, 라우터, 스위치, 게이트웨이류 격리, 광 격리, 중계기, VPN 등)', 'NETINFRA', 200, 2000, 'service',
    '**일반 사용자 권한 100점, 관리자 권한 200점**; 이 항목의 상한은 2000점(G3). 라우팅 테이블 같은 증거나 연결량 스크린샷을 제공해야 합니다(G7).\n'
    + '같은 장비에서 다음 동작을 해내면 **추가 득점**합니다(해낸 등급으로 계상):\n'
    + '· 그 장비로 **네트워크 재지향 또는 업무 하이재킹**: +200점;\n'
    + '· 그 장비에 **원격 제어 프로그램을 심고 후속 공격까지 성공**: 1000점.\n'
    + '일반 권한이나 가산 항목을 얻었으면 1회 배점을 실제 등급으로 조정합니다.'),

  /* 10 산업 인터넷 시스템 */
  sp(10, 9, '관리자 200 / 장비 10점/개', 'iiot', '산업 인터넷 시스템 권한', 'NETINFRA', 200, 2000, 'system',
    '**관리 백엔드 관리자 권한 200점; 위탁 연결 장비 10점/개**(G4); 이 항목의 상한은 2000점(G3).\n'
    + '차량 인터넷, 스마트 제조, 원격 진단, 지능형 교통 등을 포함합니다. 장비를 개당 누적할 때는 별도의 적중 기록을 씁니다(배점을 10 으로 조정).'),

  /* 11 클라우드 관리 플랫폼 */
  sp(11, 10, '관리자 500 / 노드 10점/대', 'cloud-platform', '클라우드 관리 플랫폼 통제권(PaaS 클라우드 플랫폼 포함, 예: K8S, 레드햇 OpenShift 등)', 'NETINFRA', 500, 2000, 'system',
    '**관리자 권한 500점; 클라우드 호스트, 컨테이너 10점/대**(G4); 이 항목의 상한은 2000점(G3). 클라우드 상의 업무 시스템은 중요 시스템 규칙에 따라 따로 계상합니다.\n'
    + 'ak/sk 로 대량 통제한 경우 기본적으로 **피통제 노드 점수만 계산하고 관리자 점수는 계산하지 않습니다**, 관리자 권한이 있음을 증명할 때(예: 클라우드 노드 추가, 사용자 권한 관리 등)는 예외입니다.\n'
    + '⚠️ **노드 수가 100 미만이면 일반 Web 애플리케이션으로 배점하고 노드는 배점하지 않습니다**(즉 제5, 6항 집계 기준으로 갑니다).'),

  /* 12 사물인터넷 장비 관제 플랫폼 */
  sp(12, 11, '플랫폼 200 / 연결 지점 10 / 코어망 +5000점', 'iot-platform', '사물인터넷 장비 관제 플랫폼 권한', 'NETINFRA', 200, 2000, 'system',
    '**제어 기능이 있는 사물인터넷 플랫폼 200점; 플랫폼의 연결 지점 수로 10점/대 계산**(G4); 이 항목의 상한은 2000점(G3).\n'
    + '**사물인터넷 엔드포인트 장비로 코어망에 침투해 업무 생산 등 중요 시스템을 통제하면 별도로 5000점을 더합니다**(이 항목의 2000점 상한에 걸리지 않고, 별도 적중 기록으로 계상합니다).'),

  /* 13 보안 장비 */
  sp(13, 12, '관리자 200점', 'secdev', '보안 장비 권한(IPS, IDS, 감사 장비, WAF 등 비집권류 보안 장비)', 'NETINFRA', 200, 1000, 'service',
    '**관리자 권한 200점**; 이 항목의 상한은 1000점(G3). 비집권류 보안 장비에 한합니다(집권류는 제7항으로 갑니다).'),

  /* 14 파일 스토리지류 시스템 */
  sp(14, 13, '관리자 50 / 일반 10점/개', 'file-storage', '파일 스토리지류 시스템 권한(FTP, 오브젝트 스토리지, 기업 NAS, 기업용 클라우드 드라이브 등)', 'STORAGE', 50, 500, 'system',
    '**관리자 권한 50점/개; 일반 사용자 권한, 빈 시스템 또는 테스트 데이터만 있는 시스템 10점/개**; 이 항목의 상한은 500점(G3).\n'
    + 'FTP, 오브젝트 스토리지(시스템 단위 계상), 기업 NAS, 기업용 클라우드 드라이브 등을 포함합니다; 데이터는 따로 계상합니다(G2). 일반 권한을 얻었으면 1회 배점을 10 으로 조정합니다.'),

  /* 15 모델 에이전트 / agent 도구 */
  sp(15, 14, '100–500점/개', 'ai-agent', '모델 에이전트, skill 등 agent 도구(그리고 agent 를 조작해 공격 가능)', 'MODEL', 100, 4000, 'service',
    '**100–500점/개**, 구간 배점이며 통제와 조작 깊이로 판정합니다; 이 항목의 상한은 4000점(G3).\n'
    + '모델 에이전트, skill 등 agent 도구를 포함합니다; 계상할 때 evidence 에 통제/조작 깊이를 적고 판정 등급에 따라 1회 배점을 조정합니다.'),

  /* 16, 17 연산 관리 플랫폼 + 학습 데이터/지식 베이스 시스템(원표 두 항목 규칙이 글자 단위로 같습니다) */
  sp(16, 15, '시스템 관리 권한 500점/개', 'model-compute', '연산 관리 플랫폼 권한 / 학습 데이터와 지식 베이스 시스템 권한', 'MODEL', 500, 4000, 'system',
    '**시스템 관리 권한 500점/개**; 이 항목의 상한은 4000점(G3).\n'
    + '이 항목은 원표 제16, 17항을 병합한 것(규칙이 글자 단위로 같습니다)이며, 계상할 때 evidence 에 어느 분류인지 적습니다:\n'
    + '· **연산 관리 플랫폼**(연산 리소스 관제와 스케줄링 등이 가능);\n'
    + '· **학습 데이터, 지식 베이스 등 관련 시스템**(학습 데이터나 지식 베이스를 탈취/변조하고 데이터 오염을 실행하는 등).\n'
    + '대량 데이터 시스템(1억 건 또는 10TB 초과)을 포함하면 **득점이 2배**, 지식 베이스 관련 시스템을 통제하면 **득점이 2배**(G5).'),

  /* 18 모델 관련 데이터 시스템 */
  sp(18, 16, '시스템 관리자 권한 500점/개', 'model-data', '모델 관련 데이터 시스템 권한', 'MODEL', 500, 4000, 'system',
    '**시스템 관리자 권한 500점/개**; 이 항목의 상한은 4000점(G3).\n'
    + '모델 학습, 추론, 운영 서비스를 방해하고 모델 가중치 파일을 탈취/변조하는 등이 가능합니다.\n'
    + '⚠️ 제16, 17항과의 차이는 **없앨 수 없습니다**: 이 항목에는 **"지식 베이스 관련 시스템 통제 시 득점 2배"가 없고**, 대신 "데이터 자산 성과는 데이터 배점을 참조"합니다(G2);'
    + '초대형 데이터 규모 시스템(1억 건 초과 또는 10TB 초과)은 득점이 2배(G5).'),

  /* 19 연산 인프라(권한과 연산 카드 두 가지 과금 단위, 두 항목 유지) */
  sp(19, 17, '관리자 500점/개', 'computepower-admin', '연산 인프라 · 관리자 권한', 'MODEL', 500, 2000, 'system',
    '**관리자 권한 500점/개**; 이 항목의 상한은 2000점(경로 점수 포함, G3).\n'
    + '이 항목과 [연산 인프라 · 연산 카드 리소스]는 같은 제19항이며 2000점 상한을 공유합니다. 세 가지(관리자 권한 / 대량 연산 카드 리소스 / 연산 카드 풀링 플랫폼)가 각각 득점할 수 있지만 이 항목 총상한의 제약을 받습니다.'),
  sp(19, 18, '10점/카드', 'computepower-cards', '연산 인프라 · 연산 카드 리소스 / 연산 카드 풀링 플랫폼', 'MODEL', 10, 2000, 'none',
    '**10점/카드**, 카드 단위로 누적(G4); 대량 연산 카드 리소스를 얻은 득점, 연산 카드 풀링 플랫폼을 직접 얻은 득점은 각각 상한 2000점이며, [관리자 권한]과 제19항 총상한 2000점을 공유합니다.\n'
    + '계상할 때 evidence 에 카드 수나 플랫폼 이름을 적습니다.'),

  /* ══ 2. 네트워크 경계 돌파(4항목, 대상 기관 전체에서 같은 종류 경계는 한 번만 득점)══════════ */

  sp(22, 19, '1000점', 'boundary-logical', '논리 격리 업무 내부망 진입', 'BOUNDARY', 1000, 0, 'target',
    '**1000점**. 적용 범위: 대상 기관 전체에서 같은 종류의 네트워크 경계 돌파는 한 번만 득점합니다.\n'
    + '증명 자료(G7): 방화벽 격리 장비의 통제 스크린샷, 내부망 접근 가능 스크린샷 증명 등.'),
  sp(23, 20, '10000점', 'boundary-strong', '논리 강격리 업무 내부망 진입', 'BOUNDARY', 10000, 0, 'target',
    '**10000점**. 적용 범위: 대상 기관 전체에서 같은 종류의 네트워크 경계 돌파는 한 번만 득점합니다.\n'
    + '증명 자료(G7): 게이트웨이류 격리 장비의 통제 스크린샷, 내부망 접근 가능 스크린샷 증명 등.'),
  sp(24, 21, '30000점', 'boundary-physical', '물리 격리 내부망, 핵심 생산망 진입', 'BOUNDARY', 30000, 0, 'target',
    '**30000점**. 적용 범위: 대상 기관 전체에서 같은 종류의 네트워크 경계 돌파는 한 번만 득점합니다.\n'
    + '증명 자료(G7): 방화벽, VPN, 다중 NIC 호스트, 네트워크 장비, 게이트웨이류 격리 장비의 통제 스크린샷, 내부망 접근 가능 스크린샷 증명 등.\n'
    + '예: 철도 운행 관제 전용망, 은행 핵심 계정망, 전력 생산 통제 구역, 통신사 신호망, 에너지 생산 사물인터넷 등.'),
  sp(25, 22, '1000점(최대 3000)', 'boundary-supply', '공급망 운영 채널 또는 클라우드 서비스로 내부망 진입', 'BOUNDARY', 1000, 3000, 'service',
    '세 가지 경우로 계상합니다:\n'
    + '· **같은 주방어 기관 내부망** 진입: 1000점;\n'
    + '· **한** 공급망 기관 또는 클라우드 서비스로 **여러** 주방어 기관 내부망 진입: 주방어 기관당 1000점;\n'
    + '· **여러** 공급망 기관 또는 클라우드 서비스로 **한** 주방어 기관 내부망의 서로 다른 네트워크 구역 진입: 구역당 1000점, 최대 3000점.\n'
    + '계상할 때 evidence 에 어느 경우인지, 어느 주방어 기관/어느 네트워크 구역인지 적습니다.'),

  /* ══ 부가 성과 가산(위의 어느 권한 항목에 붙지만 **독립 계상, 독립 상한**)══════════
     이 항목들은 "시스템 권한을 또 하나 얻는 것"이 아니라 "이미 얻은 권한 위에서 어떤 일을 해낸 것"(문서의 +N점)입니다.
     기반 항목에 넣으면 그 rule 상한을 공유해 기반 점수에 먹히므로 독립 득점 항목으로 분리했습니다. */

  /* 9 네트워크 장비 가산: 그 장비로 네트워크 재지향 또는 업무 하이재킹 +200점 */
  sp(9, 23, '재지향 / 업무 하이재킹 +200점', 'netdev-redirect', '네트워크 장비 · 그 장비로 네트워크 재지향 또는 업무 하이재킹', 'NETINFRA', 200, 2000, 'none',
    '**원래 [네트워크 장비 권한] 점수 위에 200점을 더합니다**(문서 제9항).\n'
    + '적용: 라우팅/정책을 바꿔 트래픽을 우리가 통제하는 노드로 유도, DNS 하이재킹, 업무 트래픽 하이재킹 등 실제로 발효된 재지향.\n'
    + '증거를 제공해야 합니다(G7): 라우팅 테이블, 정책 설정 또는 연결량 스크린샷; evidence 에 재지향 방향과 검증 방식을 적습니다.'),

  /* 9 네트워크 장비 가산: 장비에 원격 제어 프로그램을 심고 후속 공격까지 성공 1000점 */
  sp(9, 24, '원격 제어 심기 + 후속 공격 1000점', 'netdev-implant', '네트워크 장비 · 원격 제어 프로그램을 심고 후속 공격까지 성공', 'NETINFRA', 1000, 2000, 'none',
    '**원래 [네트워크 장비 권한] 점수 위에 1000점을 더합니다**(문서 제9항).\n'
    + '"심기 성공 **그리고** 그것으로 후속 공격을 완료" 두 가지를 증명해야 합니다: 원격 제어 프로세스/지속성 증거 + 그 장비를 경유해 발행한 후속 성과.'),

  /* 12 사물인터넷: 엔드포인트 장비로 코어망에 침투해 업무 생산 등 중요 시스템 통제, 별도 5000점 */
  sp(12, 25, '코어망 +5000점', 'iot-corenet', '사물인터넷 · 엔드포인트 장비로 코어망에 침투해 중요 시스템 통제', 'NETINFRA', 5000, 5000, 'none',
    '**문서 제12항이 "별도로 5000점을 더합니다"라고 명시**했으며 그 항목의 2000점 상한을 점유하지 않습니다.\n'
    + '적용: 사물인터넷 엔드포인트 장비에서 코어망으로 횡적 이동해 업무 생산 등 중요 시스템을 통제;\n'
    + 'evidence 에 적습니다: 어느 엔드포인트로 들어갔는지, 코어망에서 무엇을 통제했는지, 어떤 권한을 얻었는지.'),
]

/* ------------------------------------------------------------------ 내부 보조 함수의 내보내기 */

/**
 * 아래 함수들은 원래 core.js 의 모듈 수준 함수(외부 비공개)였는데, 분리한 뒤 core.js 가 쓰게 되어
 * 명시적으로 내보냅니다. "남에게 주는 API"가 아니므로 시그니처를 바꾸기 전에 core.js 의 사용처를 먼저 봅니다.
 */
export {
  normalizePort, targetAuthority, systemKeyOf, pickBestHit, legacyCapGroup,
  targetHasIpv6Host, evaluateScoreBoard, loadScoreMeta, loadAssetNames, hitPointsOf,
  scoreMultiplierOf,
}
