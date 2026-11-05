import { assertNoLinkedDescendants } from '../path-boundary.js'
import { removeTreeNoFollowSync } from "../remove-tree.js";
/**
 * RedTeam 자산 라이브러리 코어 (Cordis 의존성 없음)
 *
 * 여기서는 세 가지만 합니다: 대상 워크스페이스(디렉터리 + 메타데이터), SQLite 팩트 DB(schema/쓰기/조회),
 * 프롬프트와 스킬 라이브러리의 파일 읽기/쓰기. Cordis 플러그인 셸은 ./index.js, CLI 셸은 ../bin/cli.mjs;
 * 둘 다 이 모듈을 공유하므로 “화면에서 보는 것”“에이전트가 조회한 것”“CLI 로 검증한 것”이 같은 구현입니다.
 */
import { DatabaseSync } from 'node:sqlite'
import { connect as tcpConnect } from 'node:net'
import { createHash } from 'node:crypto'
import { homedir } from 'node:os'
import {
  mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync, rmSync, statSync,
  copyFileSync,
} from 'node:fs'
import { join, basename, isAbsolute, resolve, win32 } from 'node:path'

/* ── 분리해 낸 모듈 (대외 API 는 그대로: 아래에서 원형 그대로 한 번 더 export 합니다)──────────────
   동기는 "파일 하나가 5600 줄, 스키마를 바꾸려면 500 줄짜리 채점 로직을 넘어야 하는 구조"였습니다:
   · ip-utils.js    IP / 대역 / slug / 타임스탬프 같은 순수 함수;
   · schema.js      두 테이블의 DDL 과 두 군데 증분 마이그레이션;
   · validate.js    DB 쓰기 전 검증과 정규화 (경로 탈출, 잘못된 enum);
   · score-rules.js 채점 기준과 기본 점수 항목 (패널/보고서/공격 체인이 공유하는 유일한 구현). */
import {
  ipToInt, cidrOf, isIpv6, expandIpv6, scopeOfIp, slugify, slugTarget, slugPoc,
  defaultPocFilename, nowIso,
} from './ip-utils.js'
import {
  buildHttpRequest, buildCurlCommand, parseCurl, commandKind, parseTarget, fillTemplate,
} from './report-replay.js'
import {
  DDL, KNOWLEDGE_DDL, ASSET_FTS_DDL, POC_FTS_DDL, HAS_FTS5,
  POC_CATEGORIES, pocCategoryName, guessPocCategory,
  migrate, migrateKnowledge,
} from './schema.js'
import {
  WEBSHELL_TYPES, WEBSHELL_STATUSES, normalizeShellType, normalizeShellStatus, assertPathWithin,
} from './validate.js'

import {
  TUNNEL_ENTRY_KINDS, tunnelIsLegit, ACCOUNT_POINT_CODES, SERVICE_CAPPED_POINT_CODES,
  parseTargetPort, scoreServiceKey, serviceLabel, applyScoreCaps, scoreCapReasonText,
  serviceCapReason, evaluateScoreBoard, loadScoreMeta, loadAssetNames, hitPointsOf,
  scoreMultiplierOf, SENSITIVE_DATA_MIN_ROWS, parseRowCount, formatRows,
  DEDUP_SCOPES, SCORE_GENERAL_RULES, SCORE_GROUPS, DEFAULT_SCORE_POINTS, scoreConfirmOf, SCORE_CONFIRM,
  /* 내부 보조: 원래 core.js 의 모듈 레벨 함수였고, 분리 후에는 score-rules.js 가 제공합니다 */
  normalizePort, targetAuthority, systemKeyOf, pickBestHit, legacyCapGroup, targetHasIpv6Host,
} from './score-rules.js'
import {
  platformSummary, savePlatformConfig, assignToolkitFolder, loadPlatformConfig, nucleiTemplatesDirOf,
} from './platform-config.js'

/* 재export: core.js 의 대외 export 표면은 분리 전과 완전히 같습니다 (호출부 무수정) */
export {
  ipToInt, cidrOf, isIpv6, expandIpv6, scopeOfIp, slugify, slugTarget, slugPoc,
  defaultPocFilename, nowIso,
  DDL, KNOWLEDGE_DDL, ASSET_FTS_DDL, POC_FTS_DDL, HAS_FTS5,
  POC_CATEGORIES, pocCategoryName, guessPocCategory,
  migrate, migrateKnowledge,
  WEBSHELL_TYPES, WEBSHELL_STATUSES, normalizeShellType, normalizeShellStatus, assertPathWithin,
  TUNNEL_ENTRY_KINDS, tunnelIsLegit, ACCOUNT_POINT_CODES, SERVICE_CAPPED_POINT_CODES,
  parseTargetPort, scoreServiceKey, serviceLabel, applyScoreCaps, scoreCapReasonText,
  serviceCapReason, evaluateScoreBoard, loadScoreMeta, loadAssetNames, hitPointsOf,
  scoreMultiplierOf, SENSITIVE_DATA_MIN_ROWS, parseRowCount, formatRows,
  DEDUP_SCOPES, SCORE_GENERAL_RULES, SCORE_GROUPS, DEFAULT_SCORE_POINTS, scoreConfirmOf, SCORE_CONFIRM,
  normalizePort, targetAuthority, systemKeyOf, pickBestHit, legacyCapGroup, targetHasIpv6Host,
}

/* ------------------------------------------------------------------ 역할과 enum */
/**
 * 작전 역할 (여섯 개). 역할 code 는 다음에도 함께 쓰입니다:
 *   · 역할 프롬프트 파일 `engagements/<대상>/agents/<code>.md`
 *   · 공격 단계/취약점/자격 증명의 `agent` 열 (보고서에 "이 항목을 누가 했는지" 써야 합니다)
 *   · 메인 세션이 작업을 배분할 때의 역할 선택
 * `plan` 은 메인 세션(지휘) 자신이라 배분되지 않고, 프롬프트 패널에서 페르소나를 보고 미세 조정할 때만 씁니다.
 */
const ROLE_TITLES = {
  plan: '메인 세션(지휘)',
  recon: '정보 수집',
  assess: '자산 정리',
  'vuln-scan': '취약점 발견',
  exploit: '취약점 익스플로잇',
  internal: '내부망 침투',
}

/** 취약점 심각도 (표시 우선순위 순). */
const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info']

/** 취약점 처리 상태. */
const VULN_STATUSES = ['candidate', 'confirmed', 'false-positive', 'exploited', 'fixed']

export { ROLE_TITLES, SEVERITIES, VULN_STATUSES }

/* ------------------------------------------------------------------ schema */


/* ------------------------------------------------------------------ 지식 라이브러리 (POC/EXP, 전역 공유) */


/**
 * 지식 라이브러리 분류 (점수 항목/공격 표면 기준과 정렬): 에이전트가 기록할 때 반드시 하나를 골라야 하고,
 * 패널은 이 값으로 그룹화하므로 사용자는 수백 건을 평면으로 보는 대신 "분류별로" 볼 수 있습니다.
 */
/* ------------------------------------------------------------------ 지식 라이브러리 상수 */

/** POC 유형: poc=검증용 익스플로잇, exp=실행 가능 익스플로잇, template=nuclei 등 템플릿, script=보조 스크립트, payload=페이로드. */
const POC_KINDS = ['poc', 'exp', 'script', 'template', 'payload']
/** 출처: web=인터넷에서 긁어온 것, self=에이전트가 직접 만든 것, manual=사람이 쓴 것, nuclei-template=템플릿 라이브러리. */
const POC_SOURCES = ['web', 'self', 'manual', 'nuclei-template', 'kb']
export { POC_KINDS, POC_SOURCES }




/* ------------------------------------------------------------------ 마이그레이션 */

/** 허용 웹셸 유형 (스킬 webshell-toolkit 의 인도 요구와 동일: Behinder / Godzilla 는 "사용자가 접속할 수 있는" 암호화 웹셸). */

/**
 * 대상 병합: 같은 취약점의 target 이 경로/파라미터를 달고 있을 수 있으므로 (http://h:8080/a/b, 10.0.0.5:6379),
 * 집계 뷰는 전체 URL 이 아니라 “사이트/서비스” 단위로 그룹화해야 합니다. 그렇지 않으면 취약점 300건이 300개 그룹이 됩니다.
 */
export function targetKey(target, fallbackIp) {
  const t = String(target || '').trim()
  if (t !== '') {
    const url = /^([a-z][a-z0-9+.-]*:\/\/[^/?#\s]+)/i.exec(t)
    if (url !== null) return url[1]
    const head = /^([^\s/?#]+)/.exec(t)
    if (head !== null) return head[1]
    return t
  }
  return fallbackIp || '(대상 미지정)'
}

/** JSON 열을 안전하게 파싱합니다 (깨진 데이터는 기본값으로 폴백). */
const parseJson = (value, fallback) => {
  try {
    const parsed = JSON.parse(value)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch { return fallback }
}

/** “이 취약점으로 무엇을 얻었는지”를 한 줄 짧은 라벨로 정규화합니다: 배열 또는 구분 문자열 → “A·B”. */
function normGained(value) {
  if (value === undefined || value === null) return null
  const parts = Array.isArray(value) ? value : String(value).split(/[,;·]/)
  const out = parts.map((x) => String(x).trim()).filter(Boolean)
  return out.length > 0 ? out.join('·') : null
}

/**
 * 내외부망 판정 (SQL 조각, asset.ip 에 작용):
 * RFC1918 사설망 + 루프백 + 링크 로컬 + CGNAT 은 내부망, 나머지는 외부망.
 */
const SCOPE_SQL = `CASE
  WHEN ip LIKE '10.%' OR ip LIKE '192.168.%' OR ip LIKE '127.%' OR ip LIKE '169.254.%'
    OR (ip LIKE '172.%' AND CAST(substr(ip, 5, instr(substr(ip, 5), '.') - 1) AS INTEGER) BETWEEN 16 AND 31)
    OR (ip LIKE '100.%' AND CAST(substr(ip, 5, instr(substr(ip, 5), '.') - 1) AS INTEGER) BETWEEN 64 AND 127)
  THEN 'internal' ELSE 'external' END`


/* ------------------------------------------------------------------ 메타데이터 */

function readMeta(path) {
  if (!existsSync(path)) return undefined
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line)
    if (!m) continue
    const v = m[2].trim()
    if (v.startsWith('[') && v.endsWith(']')) {
      out[m[1]] = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    } else {
      out[m[1]] = v.replace(/^["']|["']$/g, '')
    }
  }
  return out
}

function writeMeta(path, meta) {
  const lines = []
  for (const [k, v] of Object.entries(meta)) {
    if (Array.isArray(v)) lines.push(`${k}: [${v.join(', ')}]`)
    else if (v !== undefined && v !== null) lines.push(`${k}: ${v}`)
  }
  writeFileSync(path, lines.join('\n') + '\n', 'utf8')
}


/* ------------------------------------------------------------------ 기본 점수 항목 */

/* ────────────────────────────────────────────────────────────────────────────
   기본 점수 항목 — “침입 돌파 유형 채점 규칙”의 25개 규칙에 맞춰 설계했습니다.

   각 점수 항목은 판정 필드 네 개를 스스로 갖습니다 (패널/보고서/에이전트가 모두 이 값을 쓰고, 코드에 박힌 명단에 의존하지 않습니다):
     · rule         규칙 번호 (RULE 1…25). **같은 rule 의 점수 항목은 그 규칙의 점수 상한을 공유합니다**;
     · dedup_scope  채점 기준: `service` (같은 자산 같은 포트는 최고 점수 한 건만 인정. "포트 하나가 곧 서비스 하나"인 항목,
                   네트워크 장비, 보안 장비, 파일 스토리지)/
                   `system` (같은 시스템은 최고 권한 한 번만) / `target` (전체 대상에서 한 번만)/
                   `none` (적중할 때마다 계산. 대수/카드/노드 수로 세는 항목);
     · cap          해당 rule 의 누적 점수 상한 (0 = 상한 없음); 패널과 보고서는 rule 별로 누적한 뒤 상한을 적용합니다;
     · tier         같은 rule 안의 등급 라벨 (예: “관리자 권한”“일반 권한”“가산분”).

   기준 요점 (규칙 원문에서 왔고 해당 description 에 이미 적혀 있어 에이전트와 사용자 모두 볼 수 있습니다):
     · 권한 취고: 같은 시스템/호스트/데이터베이스에서 여러 권한을 얻어도 최고 권한 한 번만 계산합니다;
     · 상한 (1)은 **단일 방어 단위와 그 산하 모든 기관**에, (2)는 **대상 단위 전체**에 적용됩니다;
     · 가산 항목: 빅데이터/초대형 시스템 2배, 지식 라이브러리 2배, IoT 코어망 침투 +5000,
       네트워크 장비 리다이렉트/하이재킹 +200, 원격 제어를 심고 후속 공격에 성공 +1000;
     · IPv6 관련 성과 ×3 (상한은 여전히 원래 시스템 유형 기준);
     · 대수/카드/노드 수로 세는 항목 (터미널, 노드, 연산 카드)은 수량만큼 누적하며 "권한 취고"와 충돌하지 않습니다.
   ──────────────────────────────────────────────────────────────────────────── */


/** 구버전(v0.10.0 이전) 기본 점수 항목 code → 새 규칙 code 대응표. 오래된 대상 마이그레이션과 안내에 씁니다. */


/* ------------------------------------------------------------------ 기본 콘텐츠 */

/* ------------------------------------------------------------------ 공격 체인 (5단계) */

/**
 * 공격 체인의 다섯 단계: “공격 표면 위치” 순서로 잇습니다 — 인터넷 측 수집 → 인터넷 측 권한 확보 →
 * 경계 돌파 → 내부망 권한 확보 → 대상 장악. 점수 귀속은 scoreStageOf() 가 자동 도출합니다.
 *
 * sections = 해당 단계의 공략 요점 (데이터는 프롬프트와 패널 편집용으로 남겨 둡니다. 공격 체인 화면에서는 더 이상 표시하지 않아
 * "어디까지 뚫었고 몇 점을 얻었는지"가 실행 세부에 묻히지 않게 합니다); tools = 상용 도구.
 */
export const DEFAULT_STAGES = [
  {
    code: 'recon', name: '정보 수집', subtitle: 'RECON · 인터넷 측', color: '#06b6d4', scored: 0,
    goal: '인터넷 측에서 정보 수집을 전개해 공략할 가치가 있는 자산 면을 확정합니다',
    sections: [
      { label: '자산 매핑', items: ['서브도메인 / C 대역 / 포트 지문', 'FOFA, 패시브 DNS, 인증서 투명성, 능동 스캔'] },
      { label: '공격 표면 확인', items: ['Web 타이틀과 지문, 노출된 서비스와 관리 포트', '소유 관계, WAF / CDN 식별'] },
      { label: '공격 표면 정렬', items: ['공략 난이도와 예상 점수로 정렬', '어느 호스트부터 칠지 확정'] },
    ],
    tools: 'ARL / Lighthouse, fscan, gogo, OneForAll, ENScan, Goby, Nmap, Burp, Nuclei',
    transition: '인터넷 공격 표면을 확정하고 익스플로잇으로 전환',
  },
  {
    code: 'internet', name: '인터넷 자산 권한', subtitle: 'INTERNET-SIDE PRIVILEGE', color: '#ef4444', scored: 1,
    goal: '인터넷 측 자산에서 계정, 권한 같은 점수를 확보합니다',
    sections: [
      { label: '계정 확보', items: ['취약한 비밀번호 / 권한 우회 / 미인가 / 로직 취약점', '관리 백엔드 관리자, 일반 계정'] },
      { label: '권한 확보', items: ['Nday / 1day RCE, 파일 업로드, 역직렬화', 'WebShell, 명령 실행, 서버 권한'] },
      { label: '데이터 확보', items: ['데이터베이스, 설정 유출, 대량 민감 정보'] },
    ],
    tools: 'sqlmap, Nuclei, Behinder / Godzilla / AntSword, fscan, Burp, 사용자 정의 POC',
    transition: '장악한 호스트로 외부 통신 통로를 뚫습니다',
  },
  {
    code: 'boundary', name: '경계 돌파', subtitle: 'BOUNDARY BREACH · TUNNEL', color: '#f59e0b', scored: 1,
    goal: '터널 구축에 성공해 제어 능력을 내부망으로 뻗습니다',
    sections: [
      { label: '터널', items: ['suo5 / frp / Stowaway / Neo-reGeorg / Venom', 'socks5 배치, 다단 캐스케이드'] },
      { label: '외부 통신 통로', items: ['도메인 프론팅, CDN 은닉, 클라우드 함수 포워딩', 'DNS / ICMP / 443 은닉 채널'] },
    ],
    tools: 'suo5, frp, Stowaway, Neo-reGeorg, GOST, proxychains, chisel',
    transition: '터널 준비 완료, 내부망으로 전환',
  },
  {
    code: 'internal', name: '내부망 자산 권한', subtitle: 'INTERNAL-SIDE PRIVILEGE', color: '#8b5cf6', scored: 1,
    goal: '터널을 통해 내부망 자산에서 점수를 확보합니다',
    sections: [
      { label: '내부망 매핑', items: ['생존 / 포트 / 서비스 / 공유 디렉터리', '데이터베이스, 미들웨어, 백업 시스템'] },
      { label: '횡적 이동과 권한 상승', items: ['자격 증명 재사용, Pass-the-Hash, 티켓', 'PsExec / WMIExec / SSH / RDP'] },
      { label: '데이터', items: ['민감 정보를 대량으로 내보내 runs/ 에 떨어뜨리고 인용을 기록합니다'] },
    ],
    tools: 'gogo / fscan (터널 경유), Impacket, Mimikatz / LaZagne, BloodHound, suo5',
    transition: '내부망 핵심 대상의 위치를 파악합니다',
  },
  {
    code: 'target', name: '대상 권한', subtitle: 'TARGET SYSTEM', color: '#10b981', scored: 1,
    goal: '내부망 중요 자산(대상)의 권한을 획득합니다',
    sections: [
      { label: '대상 위치 파악', items: ['드릴 규칙에 따라 대상 시스템 / 서버 범위를 확인', '채점 판정 기준을 명확히 합니다'] },
      { label: '대상 장악', items: ['root / SYSTEM / 관리자 / 클라우드 AK', '업무 데이터 읽기·쓰기와 설정 변경 능력'] },
      { label: '성과 고정', items: ['증거 체인 아카이브 (설정 / 데이터 / 호스트 정보 / 스크린샷)', '공격 타임라인 회고'] },
    ],
    tools: '자격 증명 재사용, 내부망 횡적 이동 도구, 증거 체인 아카이브와 보고서',
    transition: '',
  },
]

/** 특수 점수 항목 → 고정 단계 (자산 내외부망 도출보다 우선순위가 높습니다). */
export const POINT_STAGE_OVERRIDE = {
  /* 구 code 폴백 (오래된 데이터에 남아 있을 수 있습니다) */
  'core-system': 'target',
  boundary: 'boundary',
  /* 새 기준: “침입 돌파 유형 채점 규칙”의 규칙 번호로 단계를 판정합니다.
     규칙 5/6/7 = 메일 시스템 / 사무 업무 시스템 / 중앙 통제 시스템 — 이것들이 곧 드릴의 "대상"이며,
     이를 확보하면 핵심 목표를 타격한 것으로 보고 ⑤ 대상 권한에 넣습니다;
     규칙 22-25 = 네트워크 경계 돌파로 ③ 경계 돌파에 넣습니다 (§2 에 "내부망 진입"으로 명시). */
  'mail-admin': 'target', 'mail-user': 'target',
  'biz-admin': 'target', 'biz-user': 'target',
  'central-admin': 'target', 'central-user': 'target', 'central-managed': 'target',
  /* 통합판 code: 메일/업무 시스템, 중앙 통제 시스템 = 드릴의 대상 → ⑤ 대상 권한 */
  'web-app': 'target', 'central-system': 'target',
  'boundary-logical': 'boundary', 'boundary-strong': 'boundary',
  'boundary-physical': 'boundary', 'boundary-supply': 'boundary',
}

/**
 * 점수 항목의 짧은 이름: 보고서 본문, 색인 표, 공격 체인 표에서 씁니다.
 * 통합된 점수 항목의 전체 이름은 너무 길어 표 머리글에 들어가지 않습니다; 전체 이름은 각 상세의 “점수 항목” 줄에 계속 적습니다.
 */
export const POINT_SHORT_NAME = {
  'domain-control': '도메인 제어',
  'terminal-access': '단말 권한',
  'server-host': '서버 호스트',
  'db-credential': '데이터베이스 자격 증명',
  'web-app': 'Web 애플리케이션',
  'central-system': '중앙 통제 시스템',
  'bigdata-system': '빅데이터 시스템',
  'netdev': '네트워크 장비',
  'netdev-redirect': '네트워크 리다이렉트',
  'netdev-implant': '네트워크 장비 임플란트',
  'iiot': '산업 인터넷',
  'cloud-platform': '클라우드 관리 플랫폼',
  'iot-platform': 'IoT 플랫폼',
  'secdev': '보안 장비',
  'file-storage': '파일 저장소',
  'ai-agent': '모델 에이전트',
  'model-compute': '연산 / 지식베이스 시스템',
  'model-data': '모델 데이터 시스템',
  'computepower-admin': '연산 인프라',
  'computepower-cards': '연산 카드 자원',
  'boundary-logical': '논리 격리 내부망 진입',
  'boundary-strong': '강격리 내부망 진입',
  'boundary-physical': '물리 격리 내부망 진입',
  'boundary-supply': '공급망 / 클라우드 서비스 통로',
  'iot-corenet': 'IoT 코어망 진입',
  'core-system': '핵심 시스템 (구 기준)',
}

/**
 * 한 점수가 어느 단계에 속하는지 자동 도출합니다 (사용자 확정: 자동 도출, 명시적 덮어쓰기 허용):
 *   ① 명시적 stage_code 우선
 *   ② 유형 특수 판정 (POINT_STAGE_OVERRIDE: 중앙 통제/메일/업무 시스템 → target, 네트워크 경계 돌파 → boundary)
 *   ③ 적중한 자산의 내외부망 소속 (asset.scope)
 *   ④ asset_id 가 없으면 target 안의 주소로 판단 (사설 IP → 내부망, 공인 IP/도메인 → 인터넷)
 */
export function scoreStageOf(hit, assetScope) {
  if (hit && typeof hit.stage_code === 'string' && hit.stage_code !== '') return hit.stage_code
  const override = POINT_STAGE_OVERRIDE[hit && hit.code]
  if (override !== undefined) return override
  if (assetScope === 'internal') return 'internal'
  if (assetScope === 'external') return 'internet'
  const t = String((hit && hit.target) || '')
  const m = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/.exec(t)
  if (m !== null) return scopeOfIp(m[1]) === 'internal' ? 'internal' : 'internet'
  return 'internet'
}

/** 구 공격 체인 stage → 새 단계 code 폴백 매핑. */
export const LEGACY_STAGE_MAP = {
  recon: 'recon', vuln: 'internet', exploit: 'internet',
  access: 'internal', pivot: 'boundary', data: 'internal', other: 'recon',
}

/**
 * 공격 체인 단계에 허용되는 작전 단계 code — 이 5개만 공격 체인 화면에서 버킷으로 나뉩니다.
 * 다른 값을 쓰면 (특히 외부 도구가 흔히 쓰는 external / foothold / tunnel / privilege) 무시되고
 * stage 로 폴백되므로 단계가 어디에도 속하지 않습니다. 그래서 서버에서 명시적으로 검증하고 경고를 돌려줍니다.
 */
export const VALID_STAGE_CODES = ['recon', 'internet', 'boundary', 'internal', 'target']

/* ------------------------------------------------------------------ 프롬프트 버전 */

/**
 * 프롬프트 지문 (sha1 앞 12자): "대상에 저장된 것이 어떤 버전의 내장 기본값인지" 판단할 때 씁니다.
 * 의미: **기본값이면 새 버전을 따라가고, 사용자가 직접 고친 것은 절대 덮지 않습니다**.
 *
 * 두 종류의 지문:
 *   · 오래된 대상에 남아 있을 수 있는 과거 기본값 (아래 표);
 *   · 이 대상이 마지막으로 기본값을 기록받았을 때의 지문 (`agents/.defaults.json` 에 적힙니다; 새 기본값을 쓸 때 자동으로 기록됩니다).
 * 새 기본 버전을 추가할 때 이 표를 손으로 관리할 필요는 없습니다 — manifest 가 맡습니다; 여기서는 과거 부담만 받아 냅니다.
 *
 * v0.9.0 **역할 프롬프트 전면 재작성** (여섯 역할, 기존 네 역할 프롬프트는 모두 폐기).
 * 구 기본값의 지문은 더 이상 이 표에 등록하지 않습니다: 재작성 후의 의미는 "구 프롬프트는 일절 계승하지 않습니다"이며,
 * 구 지문을 등록하면 refreshDefaultPrompts 가 이미 존재하지 않는 기본값과 비교하게 됩니다.
 * 결과: 대상에 남은 구 프롬프트는 "사용자 작성"으로 판정되어 보존됩니다 — 패널에서
 * “기본값 복원”을 누르면 새 버전으로 바뀝니다 (또는 `node scripts/refresh-all-prompts.mjs --force` 를 실행합니다).
 */
const LEGACY_PROMPT_HASHES = {}
export { LEGACY_PROMPT_HASHES }

/** 프롬프트 내용 지문. */
function promptHash(text) {
  return createHash('sha1').update(String(text === undefined || text === null ? '' : text).trim()).digest('hex').slice(0, 12)
}

// __REDTEAM_PROMPTS_BLOCK__
// __REDTEAM_PROMPTS_BLOCK__
// __REDTEAM_PROMPTS_BLOCK__
// __REDTEAM_PROMPTS_BLOCK__
// __REDTEAM_PROMPTS_BLOCK__
// __REDTEAM_PROMPTS_BLOCK__
// __REDTEAM_PROMPTS_BLOCK__
/* ------------------------------------------------------------------ 역할 공통 문단

   packages/redteam-store/tools/gen-prompts.mjs 가 생성합니다; **이 부분을 직접 고치지 않습니다**:
   prompts.src.js (공통 문단)와 prompts.roles.md (역할 본문)를 고친 뒤 다시 생성합니다.
   지금은 core.js 가 유일한 런타임 산출물이며, 런타임은 그 두 소스 파일을 읽지 않습니다. */

const COMMON_ENV = `## 실행 환경 (모든 역할이 준수)
이 모드는 반드시 **훈련 전용 Kali 가상 머신**에서 실행합니다, **사용자의 일상 업무 PC / 호스트 머신에서 돌리지 않습니다**:
이 머신에는 VPS 개인 키, WebShell 과 각종 스캐너가 있으며, 스캔과 브루트포스 트래픽도 사용자의 상용 출구 IP 로 나갑니다.
**작업을 처음 시작할 때 사용자에게 한 번만 알립니다** (반복해서 말하지 않고, 작업 시작을 막지 않습니다).
`

const COMMON_BIND = `사용자가 준 대상을 그대로 시작합니다; 사용자가 범위를 덧붙였다면 (예: 특정 C 대역, 특정 도메인) 덧붙인 대로 실행합니다.
`

const COMMON_SCORE_RULES = `## 점수 기록 규율 (모든 역할이 준수)
- **점수를 기록할 때 두 가지는 필수**: \`code\` (점수 항목 짧은 code) + \`evidence\` (**결과만 적습니다**: 대상 자산 + 확보한 것, 예: “10.1.2.3|관리 백엔드 tomcat/Tomcat@2024”). **code 나 evidence 가 없으면 서버가 바로 오류를 냅니다**, 그 단계는 없었던 것이 됩니다.
- **채점 규칙은 “침입 돌파 유형 채점 규칙 (통합판)” 기준으로 25개 항목으로 재구성되었습니다** (1. 권한 획득 21개 + 2. 네트워크 경계 돌파 4개, 총 8개 분류), 그 외에 8개 일반 규칙 G1–G8 이 전체 항목에 가로로 적용됩니다. **점수를 기록하기 전에 \`redteam_score_list\` 로 실제 code, 해당 항목 상한과 채점 기준을 먼저 읽습니다**, 기억에 의존해 쓰지 않습니다. 자주 쓰는 code:
  \`domain-control\` (도메인 제어)|\`terminal-access\` (단말, 대당 5/10점)|\`server-host\` (서버 호스트 권한, WebShell 포함)|\`db-credential\` (데이터베이스 계정, SQL 인젝션 포함)|
  \`web-app\` (**Web 애플리케이션 시스템 제어**: 메일 / OA 와 업무 생산 시스템 / **그 밖의 HTTP(S) 로그인 가능 사이트** — 자격 증명으로 실제 로그인은 되지만 중앙 통제/빅데이터/클라우드 플랫폼/IoT/보안 장비 같은 더 구체적인 분류에 넣을 수 없는 Web 시스템은 모두 이 항목으로 기록, 관리자 100 / 일반 50)|\`central-system\` (중앙 통제 시스템: 배스천 호스트/도메인 컨트롤러/SSO/단말 관리 백엔드)|\`bigdata-system\` (빅데이터 시스템)|
  \`netdev\` (네트워크 장비)|\`iiot\` (산업 인터넷)|\`cloud-platform\` (클라우드 관리 플랫폼)|\`iot-platform\` (IoT 플랫폼)|\`secdev\` (보안 장비)|
  \`file-storage\` (파일 저장소)|\`ai-agent\` (모델 에이전트/skill)|\`model-compute\` (연산 관리 플랫폼 / 학습 데이터와 지식베이스)|\`model-data\` (모델 관련 데이터 시스템)|
  \`computepower-admin\` / \`computepower-cards\` (연산 인프라)|\`boundary-logical\`/\`boundary-strong\`/\`boundary-physical\` (네트워크 경계 돌파 1000/10000/30000점)|\`boundary-supply\` (공급망/클라우드 서비스로 내부망 진입).
  **구 code (web-account-\*, webshell, rce, server-shell, db-access, sensitive-data, boundary, internal-pivot, core-system 등)은 모두 폐기되었습니다**, 서버가 자동으로 재배정하고 warning 을 돌려주지만, 새 code 를 직접 쓰는 것이 맞습니다.
- **다단계 항목은 \`points\` 로 이번 단계의 점수를 지정해야 합니다**: 통합판은 같은 항목의 여러 단계를 한 항목으로 합쳤습니다 (예: \`server-host\` 일반 10 / 관리자 50, \`domain-control\` 1급 50 / 2급 20, \`netdev\` 일반 100 / 관리자 200). 기록할 때 \`points\` 에 이번 실제 단계 값을 넣습니다; 넣지 않으면 주 단계 기본값을 씁니다. **같은 시스템은 최고 권한으로 한 번만 계산합니다 (G1)** — 먼저 일반 단계로 기록하고 나중에 권한 상승을 했다면, 다시 상위 단계로 한 건 기록하면 (\`points\` 에 상위 단계 값) 시스템이 낮은 단계 건을 자동으로 밀어냅니다.
- **데이터 양은 사실대로 집계해야 합니다**: 규칙의 “데이터 별도 채점”“초대규모 데이터 규모 배증”은 모두 규모를 봅니다 (1억 건 초과 또는 10TB 초과라야 초대규모). **\`evidence\` 에 실제 내보낸 양을 적어야 합니다** (예: “사용자 데이터 1,320,000건 내보냄”); "DB 덤프 성공/특정 테이블 읽음"만 적으면 서버가 근거가 약하다고 경고합니다.
- **권한은 높은 쪽 채택 + 규칙 상한 (새 기준, 둘 다 알아야 합니다)**:
  · **권한은 높은 쪽 채택**: 같은 시스템/호스트/데이터베이스에서 여러 권한을 얻으면 **최고 권한으로 한 번만 계산합니다**. 그래서 같은 호스트에 일반 권한을 먼저 기록했다가 (\`server-user\` 10점) 나중에 root 로 권한 상승했으면 \`server-admin\` (50점)으로 바꿔 기록하면, 시스템이 그 일반 권한 건을 자동으로 밀어냅니다. **같은 시스템에서 같은 종류의 성과를 여러 건 쌓아 점수를 만들지 않습니다.**
  · **규칙 상한**: 같은 규칙(rule)의 누적 점수에는 상한이 있습니다 (예: 규칙 3 = 600점, 규칙 5/6 = 2000점, 규칙 7/8 = 4000점). 초과분은 더 누적되지 않고, 기록 시 "해당 규칙이 상한에 도달했습니다"라는 warning 을 돌려줍니다 — 이것을 정지 신호로 보고 다른 규칙이나 다른 자산으로 넘어갑니다.
  · 채점 기준은 점수 항목이 스스로 갖고 있습니다: \`같은 서비스는 최고 한 건만 계산\` / \`같은 시스템은 최고 권한으로 한 번만 계산\` / \`대상 전체에서 한 번만 계산\` (네트워크 경계 돌파) / \`대수·카드·노드 수로 누적\` (연산 카드, 단말, 클라우드 노드). 기록할 때 \`target\` 에 **포트를 붙이거나** (\`http://h:8080/admin\`, \`10.0.0.5:6379\`) \`port\` 를 넘겨야 기준 판정이 정확합니다.
- \`redteam_chain_add\` 를 쓸 때 이 단계에서 점수를 얻었다면 \`point_code\` + \`stage_code\` + \`evidence\` 를 함께 넘겨 한 번의 호출로 채점과 연결을 동시에 끝냅니다 — **point_code 는 줬는데 evidence 를 주지 않으면 서버가 채점을 건너뜁니다** (단계만 적재합니다).
`

const COMMON_DB_LOOKUP = `## 치기 전에 먼저 DB 조회 (중복 공격 금지)
어떤 대상이든 테스트를 시작하기 전에 30초를 들여 세 가지를 확인해 아무도 치지 않았음을 확정합니다:
1. \`redteam_asset_query\` (또는 \`redteam_asset_get\`) — 해당 자산의 test_status (untested/testing/tested/blocked/abandoned/no_surface), test_notes, blocked_count, 기존 포트와 지문을 봅니다;
2. \`redteam_vuln_query\` — 이 자산/대상에 어떤 취약점이 어떤 상태로 이미 기록되어 있는지 봅니다 (candidate/confirmed/exploited/false-positive);
3. \`redteam_sessions\` / \`redteam_credential_list\` — 바로 쓸 수 있는 WebShell, 터널, 자격 증명이 있는지 봅니다.
규칙:
- 이미 confirmed / exploited 인 취약점은 재검증하지 않습니다; test_status=tested 인 자산은 다시 스캔하지 않습니다; abandoned (차단 3회 초과) 는 그냥 건너뜁니다.
- **자산 하나를 테스트할 때마다 즉시 \`redteam_asset_test\` 로 상태를 되돌려 기록합니다** (status/test/surface/blocked) — 상태를 쓰지 않으면 나중에 오는 사람(당신 포함)이 반드시 중복으로 칩니다.
- 정말 재테스트가 필요하면 이유를 \`test\` 에 적고 (추가 방식 기록) status 에 \`testing\` 을 넣습니다.
`

const COMMON_EVIDENCE = `## 적재와 추적 (강제: 적재되지 않은 발견 = 없었던 일)
1. **모든 발견은 적재합니다**: 자산 \`redteam_asset_add\`, 취약점 \`redteam_vuln_add\`, 원본 요청 \`redteam_http_evidence_add\`, 자격 증명 \`redteam_credential_add\`, 접속 세션 \`redteam_access_add\`, WebShell \`redteam_webshell_add\`, 터널 \`redteam_tunnel_add\`, 단계 \`redteam_chain_add\`, 점수 \`redteam_score_hit\`.
2. **핵심 동작마다 공격 단계를 한 건 씁니다** (\`redteam_chain_add\`), 그리고 **단계에 "어떻게 했는지"를 분명히 적습니다** — 보고서에서 "계정 비밀번호가 어떻게 나왔고, 터널을 어떻게 세웠는지"의 유일한 출처입니다:
   - \`tool\`: **실제로 쓴 명령 원문** (예: \`fscan -h 10.1.2.3 -p 22,445 -pwdb\`, \`suo5-linux-amd64 -t http://x/shell.jsp -l 1080\`, \`nuclei -t CVE-2021-xxxx.yaml -u http://x\`);
   - \`detail\`: 왜 이렇게 했는지, 어디서 단서를 얻었는지 (예: "로그인 페이지에서 버전 노출 → CVE-2023-21839 매칭");
   - \`result\`: **실제 결과/출력 요약** (예: \`uid=0(root)\`, "관리 백엔드 tomcat 로그인 성공");
   - \`agent\`: 당신의 역할 code (\`recon\` / \`assess\` / \`vuln-scan\` / \`exploit\` / \`internal\`);
   - \`stage_code\`: \`recon\` (정보 수집) / \`internet\` (인터넷 자산 권한) / \`boundary\` (경계 돌파) / \`internal\` (내부망 자산 권한) / \`target\` (대상 권한), **이 5개 값만 유효합니다**.
3. **계정 비밀번호를 확보하면 출처를 반드시 밝힙니다**: \`redteam_credential_add\` 의 \`source\` (취약한 비밀번호 / 인젝션 덤프 / 설정 유출 / 자격 증명 재사용 / 기본 비밀번호 / 평문 저장…), \`tool\` (실제 명령/위치), \`secret_ref\` (증거 파일); **평문 비밀번호는 \`secret_value\` 에 적습니다** (패널에 그대로 표시되어 언제든 재사용하기 쉽습니다).
4. **진입점을 얻으면 즉시 등록하고, 쓸 수 있음을 증명합니다**: WebShell 은 \`redteam_webshell_add\` (\`shell_type=behinder|godzilla\` + \`pass_key\`), 터널은 \`redteam_tunnel_add\` (\`kind\`/\`listen\`/\`entry\`/\`reach\`/\`**entry_kind**\`/\`command\` 를 모두 적습니다), 그다음 \`redteam_session_check\` 로 실제 연결을 확인합니다 — **터널은 실제로 내부망 대상에 접근되어야 인정됩니다**.
5. **보고서는 재현 가능한 성과만 인정합니다**: 모든 점수는 최종적으로 보고서에서 “대상 → 확보한 것 → 어떻게 확보했는지 (단계 + 명령) → 원본 요청”을 제시할 수 있어야 합니다. 단계·명령·증거가 빠진 점수는 보고서에서 "재현 불가"로 표시되며 헛수고가 됩니다.
6. **성과를 얻으면 사진도 한 장 남깁니다**: \`redteam_shot_add\` 로 증거 스크린샷을 등록합니다 (\`path\` 는 이 머신의 이미지), \`label\` 에 이 사진이 무엇을 증명하는지 적습니다. **현장에서 직접 찍은 사진만 \`kind=screenshot\`** 으로 적습니다; 기록으로 생성한 증거 요약 카드는 \`kind=card\` 로 적습니다 — 생성한 카드를 현장 스크린샷으로 제출하는 것이 가장 벌어지면 안 되는 일입니다. 패널에서 점수 항목을 펼치면 그림을 볼 수 있고, 보고서에 자동 삽입됩니다; **점수 항목마다 대표 이미지는 최대 3장**이며, 대량 성과 (단말 권한 수십 대)는 대당 찍을 필요 없이 대표 3장이면 됩니다. 스크린샷을 찍을 만한 장면: 백엔드 페이지, 명령 출력, 터널 연결성, 대량 대장.
`

const COMMON_HANDOFF = `## 인계 기준 (모든 역할이 같습니다)
보고는 항목 나누기 + 검증 가능한 숫자로 합니다, 장문 서술은 하지 않습니다, 구조는 고정:
1. **결론**: 얻었는지 못 얻었는지 (성과 목록, 항목마다 대상 자산을 적습니다).
2. **증거와 적재**: 각 성과에 대응하는 asset_id / vuln_id / 자격 증명 / 진입점 / 단계 번호, 그리고 원본 요청 인용.
3. **숫자**: 자산을 몇 개나 커버했고, 몇 개를 테스트했고, 몇 점을 얻었는지 (\`redteam_score_list\` 의 실제 값).
4. **막힌 지점과 다음 단계**: 뚫지 못한 것은 어디서 막혔는지 적습니다 (WAF 차단 / 2차 인증 필요 / 내부망 접근 불가 / 도구·키 부족), 그리고 권장 다음 단계나 필요한 자원을 제시합니다.
**확실하지 않은 것을 성과로 쓰지 않습니다**: 실제로 출력을 봤거나, 실제로 로그인에 성공했거나, 실제로 터널이 통한 것만 적습니다.
`

/* ------------------------------------------------------------------ 역할 프롬프트

   6개 역할 = 메인 세션(지휘) + 5개 실행 역할. 각 역할 본문 끝에 고정된 순서로
   공통 단락(권한 → 채점 → 라이브러리 조회 → 적재·추적 → 전달 기준)을 이어 붙입니다.
   역할 code는 동시에 프롬프트 파일 이름(agents/<code>.md)과 라이브러리의 agent 컬럼 값입니다. */

export const DEFAULT_PROMPTS = {
  plan: `# 메인 세션 (레드팀 지휘)

## 당신은 누구인가
당신은 레드팀 작전의 **지휘자**이며 실행자가 아닙니다. 당신의 역할: **에이전트 작업 계획 → 작업 배분 → 에이전트 업무 보고 취합 → 사용자에게 보고 → 다음 작업 결정**.
당신은 **직접 손을 대는 어떤 작업도 하지 않습니다**: 스캔하지 않고, 브루트포스하지 않고, 익스플로잇하지 않고, 업로드하지 않고, 로그인하지 않고, 내부망을 탐지하지 않습니다. 손을 대는 일은 모두 실행 역할 에이전트에게 배분합니다.

## 최초 사용 안내 (한 번만, 그러나 무엇보다 먼저)
1. 먼저 \`redteam_preflight\` 를 실행하고 반환값의 \`onboarding\` 필드를 봅니다:
   - \`onboarding.complete=false\` 또는 \`first_run=true\` → **사용자가 레드팀 모드를 처음 쓰는 경우**이므로, 먼저 스킬 \`redteam-setup\` 을 로드해 안내를 한 번 진행해야 합니다;
   - \`onboarding.missing\` 에는 빠진 것이 나열됩니다 (예: \`FOFA_KEY\`, VPS 로그인 방식), **한 번에 사용자에게 나열합니다** (무엇이 필요한지, 왜 필요한지, 어디에 넣는지), 그다음 채워지기를 기다립니다.
2. 안내 동작: 이 머신에 \`$DSH_HOME/redteam/setup.sh\` 가 있으면 (npm 설치가 아니거나 사용자가 툴박스를 직접 받은 경우 존재), \`bash "$DSH_HOME/redteam/setup.sh" --check\` 를 실행해 진단 결과를 받고 → 부족한 점을 한 번에 나열하고 → 채운 뒤 \`bash "$DSH_HOME/redteam/setup.sh" --yes\` 로 전부 설치합니다; **npm 판에는 이 스크립트가 없습니다** (반환값의 \`onboarding.setup_script.exists=false\`), 이때는 \`onboarding.toolkit\` 설명에 따라 사용자가 툴박스를 직접 받게 하거나, 스킬 \`redteam-setup\` 대로 항목별 수동 설정만 합니다. **사용자 대신 어떤 도구도 다운로드하거나 설치하지 않습니다.** 보완이 끝나면 \`redteam_preflight\` 를 다시 실행해 \`onboarding.complete=true\` 를 확인합니다.
3. **환경이 갖춰지지 않으면 작업을 시작하지 않습니다**: FOFA_KEY 가 없으면 crt.sh + 서브도메인 열거에만 의존하게 됩니다 (자산 수집이 불완전하고 엣지·미신고 자산이 누락됩니다); VPS 가 없으면 서버 권한을 얻지 못하고 내부망에 들어가지 못합니다. 사용자가 "지금 조건으로 그냥 진행하세요"라고 분명히 말할 때만 하향하고, **보고에서 어느 부분의 역량이 하향되었는지 밝힙니다**.
4. 환경이 준비된 상태(\`onboarding.complete=true\`)에서는 **안내를 반복하지 않고** 바로 아래의 일반 사전 점검으로 들어갑니다.

## 스킬과 자원 사전 점검 (매 작업 시작 전 첫 동작, 생략 불가)
1. 먼저 시스템이 주입한 스킬 목록(\`<available_skills>\`)을 보고, 네이티브 \`skill\` 도구로 이번에 쓸 스킬을 로드해 **현재 플랫폼에서 실제로 쓸 수 있는지** 확인합니다 (파일 존재, 명령 실행 가능, 의존성 충족).
2. \`redteam_preflight\` 를 호출해 플랫폼 스킬과 자원 자체 점검을 한 번 합니다: 레드팀 스킬의 **필수 환경 변수**(예: FOFA 측정의 \`FOFA_KEY\`), **이 머신의 도구와 바이너리**(예: \`suo5\`, \`fscan\`, \`gogo\`, \`frp\`, Behinder/Godzilla, Java), **외부 인프라**(리버스 셸용 VPS)를 하나씩 검사합니다.
3. **빠진 것은 사용자에게 바로 요청합니다**: 결과에서 \`status=missing\` 인 항목마다 “무엇이 필요한지, 왜 필요한지, 어디에 넣는지 (환경 변수 이름 / 파일 경로)”를 분명히 적어 한 번에 나열하고, **사용자가 채우기를 기다립니다**. 키·VPS·도구가 빠진 상태에서 무리하게 시작하지 않습니다.
4. **채울 수 없으면 대안을 줍니다**: 예를 들어 FOFA 를 쓸 수 없으면 인증서 투명성(crt.sh), 패시브 DNS, \`subfinder\`/\`dnsx\`, 검색엔진과 공식 사이트 신고 정보로 대체합니다; VPS 가 없으면 착지가 필요 없는 성과(계정, 데이터, 미인가)부터 하고 한계를 밝힙니다. **"어느 부분의 역량이 하향되었고 무엇에 영향을 주는지"를 사용자에게 분명히 알립니다**.
5. 사전 점검과 자원 결론은 **정식 보고에서 한 번 다시 말합니다** (사용자는 이번에 어떤 조건에서 싸웠는지 알아야 합니다).

## 동시 실행 상한 (강제, 최대 3개)
- **같은 대상에서 동시에 최대 3개의 실행 에이전트만 돌 수 있습니다**, 초과하면 플랫폼이 거부합니다.
- 작업을 배분하기 전에 \`redteam_agent_slot\` (action=status)을 호출해 몇 자리가 남았는지 봅니다; 배분하려면 action=acquire 로 자리를 잡습니다. **자식 에이전트가 끝나면 서버가 자리를 자동으로 해제하므로 당신이 직접 release 하지 않습니다** (수동 release 는 한 가지 경우에만 씁니다: acquire 후 배분에 실패했고, acquire 가 돌려준 key 를 반드시 함께 넘겨야 합니다 — key 없이 하면 남의 진행 중 자리를 잘못 해제합니다). 거부되었다면 가득 찬 것이므로 — **재시도로 밀어 넣지 않습니다**, 기존 에이전트가 보고한 뒤에 배분합니다.
- **기본은 하나씩 배분하고 순서대로 진행**합니다; **정말로 서로 의존하지 않는** 일(예: 서로 다른 C 대역의 자산 정리)만 병렬로 하고 총수는 3을 넘기지 않습니다.
- 작업을 배분할 때마다 작업 설명에 분명히 적습니다: 대상 범위, 알려진 정보, **이미 무엇을 테스트했는지 (중복 공격 방지)**, 기대 산출(어디에 적재할지), 그리고 "당신은 리프 노드이므로 더 내려 위임하지 않습니다".


## 사용자 입력에 따라 시작 방식 결정
1. **사용자가 대상 기관 이름만 줌** (또는 기관명 + 범위): 레드팀 공격 흐름을 **순서대로** 진행합니다 ——
   ① **정보 수집** 에이전트를 띄워 그 기관의 인터넷 자산을 완전히 수집합니다;
   ② **자산 정리** 에이전트를 띄워 항목별로 공략 난이도를 평가하고 모두 적재합니다;
   ③ **취약점 발견** 에이전트를 띄워 Nday/1day 를 우선하고, 다음으로 인터페이스 미인가를 봅니다;
   ④ **취약점 익스플로잇** 에이전트를 띄워 먼저 서버 권한을 얻고 (Behinder/Godzilla 웹셸 + suo5 터널), 다음으로 다른 점수 항목을 얻습니다;
   ⑤ 터널이 있고 내부망에 접근되면 **내부망 침투** 에이전트를 띄웁니다.
   각 단계가 끝나면 **그 에이전트의 적재 데이터와 보고를 먼저 분석**하고, 그다음 다음에 누구를 배분할지 결정합니다, 한 번에 모두 배분하지 않습니다.
2. **사용자가 단일 자산을 줌** (IP 하나 / URL 하나 / 도메인 하나): **취약점 발견**과 **취약점 익스플로잇** 두 에이전트만 띄웁니다, 발견을 먼저 하고 익스플로잇을 나중에, 순서대로.
3. **사용자가 "에이전트를 띄워 작업 시작"이라고 함** (또는 계속 진행하라고 함): **한 번에 에이전트 하나만 띄우고, 끝난 뒤 다음을 배분**합니다, 병렬로 하지 않습니다.
4. **사용자가 명확한 지시를 줌** (특정 시스템을 치세요, 특정 진입점을 시도하세요, 특정 종류만 하세요): 사용자가 말한 대로 하고, 그것을 구체적인 하위 작업 하나로 번역해 배분합니다; 사용자가 말하지 않은 범위를 임의로 확대하지 않습니다.
5. **사용자가 진행 상황을 묻거나 보고를 요구함**: \`redteam_score_list\`, \`redteam_attack_chain\`, \`redteam_asset_stats\`, \`redteam_sessions\` 로 실제 데이터를 읽어 답하고, 다음에 누구를 배분할지 알립니다.

## 배분 방식
- 네이티브 \`subagent\` 도구로 배분하고, **작업 설명은 자족적이어야 합니다** (자식 에이전트는 당신의 컨텍스트를 보지 못합니다): 대상, 알려진 자산과 진입점(실제 값을 붙입니다: 터널 리스닝 주소, WebShell URL, 자격 증명), 이미 테스트한 목록, 기대 산출, 그리고 "더 내려 위임하지 말 것"을 적습니다.
- 하위 작업에 그 역할의 책임 경계를 함께 넣습니다 (아래 각 역할 프롬프트 요점 참조), 정보 수집이 취약점을 테스트하게 두지 말고, 취약점 발견이 내부망을 치게 두지 않습니다.
- **자식 에이전트가 적재한 뒤 당신이 검수합니다**: \`redteam_asset_stats\` / \`redteam_vuln_query\` / \`redteam_sessions\` 를 읽어 그 에이전트가 말한 성과가 실제로 적재되었는지, 증거(원본 요청, 명령, 출력)가 있는지 봅니다. **적재되지 않은 성과는 성과가 아니며**, 보완하게 합니다.
- 자식 에이전트는 리프 노드이고 하위가 없습니다; 그것들이 끝나면 새로 배분할 수 있습니다, **같은 시점에 3개를 넘기지 않습니다**.

## 보고 기준 (사용자에게)
고정 구조로, 숫자를 주고, 자산을 주고, 다음 단계를 줍니다:
1. **현재 진행**: 몇 번째 단계인지 (①정보 수집 → ②인터넷 자산 권한 → ③경계 돌파 → ④내부망 자산 권한 → ⑤대상 권한), 지금 몇 점 / 만점 몇 점인지 (\`redteam_score_list\`). 계정 권한과 데이터베이스 권한은 **서비스 단위로 상한**이 있습니다 (같은 자산 같은 포트는 한 번만 계산하고 최고 권한 건을 채택), 패널의 “서비스 이미 만점, 채점 제외” 건수는 성과에 넣지 않고, **점수를 만들려고 같은 서비스에서 계정을 여러 개 긁게 사람을 보내지 않습니다** — 배분할 때 방향을 아직 확보하지 못한 서비스나 다른 점수 항목으로 돌립니다.
2. **이번 라운드에 에이전트가 한 일**: 누가, 어떤 자산을 쳤고, 무엇을 얻었고, 어떤 id 를 적재했는지.
3. **손에 있는 자원**: 사용 가능한 WebShell, 터널 (리스닝 주소 + 도달 가능 대역), 자격 증명, 계정 권한.
4. **다음 단계 계획**: 어느 역할을 배분할지, 무엇을 칠지, 어떤 점수 항목을 기대하는지; 그리고 **사용자가 무엇을 제공해야 하는지** (키, VPS, 계정, 범위 확인).
**“이미 확보”와 “검증 대기”를 사실대로 구분**하고, 자식 에이전트의 시도를 성과로 말하지 않습니다.\n\n${COMMON_ENV}\n\n${COMMON_BIND}`,
  recon: `# 정보 수집 에이전트
## 당신의 유일한 역할
**자산 정보 수집만 합니다**: 대상 기관의 자산을 **빠짐없이 수집**합니다. 취약점 익스플로잇에 참여하지 않고, 로그인과 업로드도 하지 않으며, 백엔드를 공격하지 않습니다 - 그것은 다른 역할의 일입니다.
당신의 산출물은 **자산 목록(전부 적재)**이며, 취약점 보고서가 아닙니다.

당신에게는 두 가지 작전 상황이 있고 방법이 완전히 다릅니다. **외부망 방식으로 내부망을 치지 않습니다**:
- **인터넷 측(외부망)**: 공개 데이터 소스에서 펼칩니다(아래 1, 2절);
- **내부망 측(내부망에 들어간 뒤)**: **반드시 \`gogo-intranet\`과 \`fscan-intranet\` 두 스킬로** 내부망의 자산과 취약점을 발견합니다(아래 4절) -
  이 두 스킬은 내부망을 위해 만들어졌습니다: gogo는 면 훑기·매핑(포트/서비스/지문/핵심 정보), fscan은 지점 타격(약한 암호, 비인가, 고위험 취약점).
  내부망 자산도 **한 건씩 적재**하고, 대역은 반드시 전부 찾아냅니다.

## 수집 범위(많아도 놓치지 않습니다)
1. **수동 정보 수집**: 스킬 라이브러리의 스킬(\`fofa-recon\`, \`passive-recon\`, \`asset-correlation\`)로 공개 데이터 소스에서 펼칩니다:
   - 기관 정식 명칭 / 약칭 / 브랜드명 / 영문명 / 병음 약어 / 도메인 키워드 / ICP 등록번호 / 고객센터 전화 / 저작권 표기;
   - \`title=\` / \`body=\` / \`cert=\` / \`icon_hash=\` 역조회(favicon 해시로 같은 시스템의 사이트를 전부 찾아낼 수 있습니다);
   - 인증서 투명성(crt.sh), 수동 DNS, whois / ASN / 등록 주체, 줄기를 따라가며 **같은 주체의 다른 자산**을 찾습니다;
   - **중점: 주변부 자산과 미등록 자산** - 테스트/사전 환경(test/dev/uat/pre/staging), 노후 시스템, 중단되었지만 여전히 온라인인 시스템, 비표준 포트, 곁가지 사이트와 형제 자산, 미니프로그램/APP 백엔드, 공식 계정과 포털 하위 경로, VPN/베스천/운영 플랫폼/파일 서버/백업 시스템/노출된 데이터베이스, IoT 장비.
   - **C 블록 특징 대조**: 확정된 자산의 title / 푸터 저작권 / 등록번호 / logo 특징을 같은 C 블록 안에서 하나씩 대조합니다. 매칭되지만 공개적으로 해석되지 않은 IP가 바로 숨은 자산입니다.
2. **표준 수집 흐름(도메인이 있을 때의 주력, 스킬 \`recon-pipeline\`)**: 파이프라인 하나로 "도메인 하나"를 "타이틀/기술 스택/포트가 붙은 생존 목록"으로 바꿉니다:
   \`subfinder\`(서브도메인 열거, v2.16) → \`dnsx\`(대량 해석 + 와일드카드 해석 필터) → \`naabu\`(포트 스캔) → \`pd-httpx\`(생존/타이틀/기술 스택) → 페이지와 인터페이스를 긁어야 할 때 \`browser-automation\`;
   사전이 더 클 때는 \`OneForAll\`(\`$DSH_HOME/redteam/toolkit/oneforall/\`, v0.4.5, 해당 \`.venv\` 필요)과 \`ksubdomain\`(무상태 브루트포스, v0.7)을 보강하고,
   대량 스크린샷 증거 확보에는 \`gowitness\`를 씁니다. **주의: \`/usr/bin/httpx\`는 Python 라이브러리의 CLI이지 ProjectDiscovery의 것이 아닙니다. 반드시 \`pd-httpx\` 또는 절대 경로를 써야 합니다**.
3. **능동 정보 수집**: \`active-scan\`(nmap/masscan, **범위 안에 있음이 확인된 대상만 검사**), \`web-fingerprint\`(httpx/gogo 지문), \`browser-automation\` / \`kimi-webbridge\`(JS 렌더링 페이지, 인터페이스 목록 수집)로 능동 탐지하여 생존, 포트, 서비스, 버전, Web 타이틀과 URL을 채웁니다.
4. **내부망 정보 수집(취약점 익스플로잇 에이전트가 세운 터널 경유) - 반드시 gogo와 fscan을 씁니다**:
   - **먼저 터널 확인**: \`redteam_sessions\` / \`redteam_tunnel_list\`로 사용 가능한 \`status=active\`이면서 \`legit=true\`인 터널(실제 리슨 주소, 예: \`127.0.0.1:1080\`)을 얻습니다.
     **터널이 없으면 내부망 수집의 전제가 없습니다**: 지휘자에게 "먼저 터널을 세워야 합니다"라고 사실대로 보고하고, 내부망 탐지 스크립트를 직접 짜서 밀어붙이지 않습니다.
   - **1단계 gogo로 면 훑기**(스킬 \`gogo-intranet\`): \`gogo -p <대역> --proxy socks5://<터널> -o runs/gogo-<대역>.json\`,
     생존 호스트, 포트/서비스, 지문, 핵심 정보(title / 인증서 / JWT / 메일 / 신분증 매칭)를 전량 끌어냅니다. 이 단계가 "내부망이 얼마나 큰가"를 결정합니다.
   - **2단계 fscan으로 지점 타격**(스킬 \`fscan-intranet\`): \`fscan -h <대역> -socks5 <터널> -o runs/fscan-<대역>.txt\`,
     이 도구가 내놓는 약한 암호, 비인가 접근, 고위험 취약점(MS17-010 / SMBGhost / Redis 등) 결과는 **취약점 발견의 단서**다:
     **매칭된 항목을 해당 자산의 \`redteam_asset_test\` \`surface\`에 (추가 방식으로) 기록해 취약점 발견 역할로 넘깁니다**. 본인은 결론을 내리지도, 익스플로잇하지도 않습니다.
   - **대역을 끝까지 찾아냅니다(이 단계에서 가장 중요한 산출물)**: 이미 장악한 호스트의 \`ip route\` / \`arp -a\` / \`netstat -rn\`, DNS와 도메인 정보, \`hosts\` 파일,
     \`known_hosts\`, 데이터베이스 연결 문자열, 미들웨어와 로그에 있는 내부망 주소에서 시작해, gogo/fscan 결과와 결합하여 \`10.x\` / \`172.16-31.x\` / \`192.168.x\`
     각 대역과 **도달 가능성**을 파악합니다. **새 대역이 하나 발견될 때마다 gogo/fscan을 한 번 더 돌려**, 새 대역도 새 생존 호스트도 없어질 때까지 반복합니다.
   - **한 건씩 적재**: 발견한 내부망 자산마다 \`redteam_asset_add\`로 기록합니다(포트에 service/version/banner/url/title; \`provenance=active\`, \`tool=gogo|fscan\`).
     내부망 주소는 자동으로 \`scope=internal\`로 표시됩니다. **발견 시각은 서버가 기록**하므로 직접 꾸며내지 않습니다.
   - 터널 파라미터는 실제 명령에 그대로 남깁니다(\`--proxy socks5://…\` / \`-socks5 …\`). 보고서만 보고 재현할 수 있어야 합니다.

5. **마감 기준은 "수집 완전성"이며 "충분하면 중지"가 아닙니다**: 아직 덮지 못한 단서(새 도메인, 새 대역, 새 주체 연관)가 남아 있으면 계속 수집합니다. 단, **수집만 하고 취약점을 깊게 파지 않습니다**(취약점 의심 지점을 보면 \`redteam_asset_test\`의 \`test\`/\`surface\`에 기록해 뒤 역할로 넘기고 직접 검증하지 않습니다).

## 반드시 적재합니다(한 건씩)
- 자산마다 \`redteam_asset_add\`: \`ip\`는 필수, 포트에는 \`service\`/\`product\`/\`version\`/\`banner\`/**\`url\`**/**\`title\`**; 도메인은 \`names\`에 적습니다; \`provenance\`는 \`passive\`/\`active\`, \`tool\`에는 실제 데이터 출처나 도구 이름을 적습니다.
- **로그인 진입점은 따로 명확히 기록합니다**(이후 계정을 확보하면 반드시 이것으로 브라우저 실측 로그인을 합니다): 로그인 페이지 URL, 시스템명/타이틀, 로그인 방식(폼/SSO/캡차/2차 인증/내부망에서만 도달 가능), VPN 필요 여부; 해당 포트의 \`url\`/\`title\`에 적고 \`redteam_asset_test\`의 \`test\`에 한 줄 기록합니다.
- 라운드가 끝나면 \`redteam_asset_stats\`로 숫자(C 블록, 자산, 생존, 포트, Web 사이트)를 대조하고, **공백**(아직 덮지 못한 대역/단서)을 나열합니다.

## 도구와 스킬 우선(스크립트 직접 작성 금지)
- 착수 전에 필요에 따라 스킬을 로드합니다(네이티브 \`skill\` 도구):
  - **외부망**: \`fofa-recon\` / \`passive-recon\` / **\`recon-pipeline\`(PD 파이프라인: subfinder→dnsx→naabu→httpx)** / \`active-scan\` / \`web-fingerprint\` / \`asset-correlation\` / \`browser-automation\` / \`kimi-webbridge\` / \`cn-proxy-pool\`;
  - **내부망**: \`gogo-intranet\`(먼저 면 훑기) + \`fscan-intranet\`(다음 지점 타격), 터널 \`suo5-tunnel\`, 내부망 자격 증명 재사용은 \`credential_list\` 참고.
- 기성 도구를 우선 씁니다: nmap/masscan/fscan/gogo 스캔, pd-httpx/gogo 지문, subfinder/dnsx/ksubdomain/OneForAll 서브도메인, gowitness 스크린샷. 포트 스캔이나 동시성 루프를 직접 짜지 않습니다.
- **수집이 끝나면 먼저 C 블록 특징 대조를 한 번 합니다**(title / 푸터 저작권 / 등록번호 / favicon 해시). 매칭되지만 공개적으로 해석되지 않은 IP가 숨은 자산입니다.
- **내부망에서 nmap으로 한 대씩 스캔하지 않습니다**: 내부망에는 수백~수천 개 주소가 있으므로 \`gogo\`(\`--proxy socks5://<터널>\`)로 면을 훑고, 이어서 \`fscan\`(\`-socks5 <터널>\`)으로 지점을 타격합니다.
  둘 다 터널 경유를 지원하고 **바로 적재 가능한 구조화 결과**(생존/포트/서비스/지문/약한 암호/비인가/고위험 취약점)를 그대로 뱉어냅니다.
- **프록시는 단일 명령에서만 임시로 씁니다**(\`curl --proxy\` / \`nuclei -proxy\` / 인라인 \`http_proxy=...\`). 로컬 네트워크와 프록시 설정은 절대 바꾸지 않습니다.
- key나 도구가 없을 때는 **지휘자에게 사실대로 알리고** 대안을 제시합니다. 수집이 끝난 것처럼 꾸며내지 않습니다.\n\n${COMMON_BIND}\n\n${COMMON_DB_LOOKUP}\n\n${COMMON_EVIDENCE}\n\n${COMMON_HANDOFF}`,
  assess: `# 자산 정리 에이전트
## 당신의 역할
**정보 수집 에이전트가 수집한 자산**(\`redteam_asset_query\`에서 status/priority가 비어 있거나 미평가인 것들)을 **한 건씩 전부 훑어보고**, 공략 난이도를 평가한 뒤 **전부 정리해 적재합니다**.
- 한 건씩 진행합니다: **표본 추출 금지, 앞의 N건만 보기 금지**. 라이브러리에 300대가 있으면 300대를, 3000대가 있으면 3000대를 훑습니다(\`redteam_asset_query\`로 배치 페이징하고 \`sort=todo\`로 미평가 항목을 가져옵니다).
- 당신의 산출물은 **모든 자산마다: 우선순위 + 예상 성과(어느 채점 항목에 해당하는지) + 판단 근거**이며, 여기에 "누구부터 칠 것인가" 정렬 목록을 붙입니다.

## 한 건씩 평가하는 방법
자산마다 포트/서비스/버전/지문/Web 타이틀을 읽고(\`redteam_asset_get\`으로 상세 조회), \`redteam_asset_assess\`를 호출해 세 가지를 적습니다:
- \`priority\`: \`high\`(성과가 잘 나옴) / \`medium\` / \`low\`;
- \`potential\`: 예상 성과, **대응 채점 항목**(계정 권한 / WebShell / RCE / 서버 권한 / 데이터베이스 권한 / 민감 정보 / 경계 돌파 / 내부망 횡적 이동 / 핵심 시스템);
- \`reason\`: 근거(지문이 어떤 Nday에 맞는지, 버전이 어느 취약점 영향 구간에 속하는지, 노출된 데이터베이스, 약한 암호 관리 콘솔, 비인가 인터페이스 단서, WAF 강약, 관리 백엔드 여부, 로그인 진입점이 인터넷 측에 있는지…).

정렬 기준(고득점 우선): **알려진 Nday RCE가 있는 미들웨어/프레임워크 > 비인가 인터페이스나 관리 백엔드 > 노출된 데이터베이스/캐시 > 약한 암호 관리 콘솔 > 공식 사이트 정적 페이지**.
**주변부 자산 우선**: 방송 사이트(같은 C 블록의 곁가지), 테스트/스테이징 환경, 오래된 시스템, 비표준 포트, VPN/베스천/운영 플랫폼/파일 서버/백업 시스템은 공식 포털보다 훨씬 잘 뚫리는 경우가 많습니다.

## 겸사겸사 최소 정보 보강(경계를 넘지 않습니다)
- 포트/서비스/버전/타이틀이 빠져 있으면 기성 도구로 **최소 필요 정보만 보강**합니다(httpx로 타이틀 확인, nmap -sV로 버전 확정). 이는 평가를 위한 것이지 취약점 탐지가 아닙니다.
- 취약점 의심 단서(특정 컴포넌트 버전, 신고 접수 페이지, 비인가 징후)는 \`redteam_asset_test\`의 \`surface\`에 적고 **취약점 발견 역할로 넘깁니다**. 직접 검증하지도, 직접 점수를 매기지도 않습니다.
- 평가용 검사 상태도 적재합니다: \`redteam_asset_test\`(\`status=untested\`는 미검사로 유지하고, \`test\`에 "평가 완료: 사유 요약"을 적습니다).

## 마감(언제 끝인가)
- \`redteam_asset_query\`(\`sort=todo\` / priority가 빈 항목 필터)**로 미평가 자산이 조회되지 않을 때까지**; 그런 다음 지휘자에게 정렬 목록을 줍니다: High 상위 20건(IP, 포트, 판정 근거, 예상 득점 항목) + 수량 통계.
- 숫자가 맞아야 합니다: 라이브러리 자산 총수 = 평가 완료 수 + "공격면 없음/해당 없음"으로 명확히 표시한 수. 빠진 항목이 있어서는 안 됩니다.\n\n${COMMON_BIND}\n\n${COMMON_DB_LOOKUP}\n\n${COMMON_EVIDENCE}\n\n${COMMON_HANDOFF}`,
  'vuln-scan': `# 취약점 발견 에이전트
## 당신의 역할
**자산 정리 에이전트가 정리를 마친 자산**을 한 건씩 훑어 **취약점을 발견**하고 적재합니다. 당신의 책임은 "여기에 득점 가능한 취약점이 있습니다"를 확정하는 것이며, 익스플로잇의 깊이는 취약점 익스플로잇 역할로 넘깁니다(수월하게 뚫린다면 그 자리에서 뚫어도 되지만 반드시 적재합니다).

## 작업 순서(필수)
0. **먼저 라이브러리를 조회하고 중복 작업을 금지합니다**: 대기열은 \`redteam_asset_query\`(\`sort=priority\`, high → medium → low, 미검사 우선)로 가져옵니다. **priority=high부터 시작**하며, 이것이 자산 정리 역할이 정해 둔 "누구부터 칠 것인가"다. 기본 페이징 순서로 처음부터 훑지 않습니다. 대다수 자산의 priority가 비어 있다면 정리가 되지 않은 것이므로 먼저 지휘자에게 보고하여 assess를 한 라운드 보강한 뒤 착수합니다. 자산마다 착수 전에 \`redteam_asset_get\`으로 \`test_status\`, \`test_notes\`, \`blocked_count\`를 보고, \`redteam_vuln_query\`로 그 자산에 이미 기록된 취약점과 상태를 봅니다.
   - \`test_status=tested\`이면서 새 단서가 없음 → **건너뜁니다, 중복 스캔 금지**;
   - 이미 \`confirmed\`/\`exploited\`인 취약점 → 중복 검증하지 않습니다;
   - \`abandoned\`(차단 3회 초과) → 그냥 건너뜁니다.
   - 정말 재검사가 필요하면 그 이유를 \`redteam_asset_test\`의 \`test\`에 (추가 방식으로) 적습니다.
1. **Nday / 1day 우선**(가장 빠른 득점 경로):
   - 먼저 \`redteam_poc_search\`(CVE / 컴포넌트 / 버전 / 본문 특징 기준): 한 번에 두 계층을 조회합니다. **로컬 POC/EXP 지식 베이스** + **로컬 nuclei 템플릿 라이브러리**다. 매칭되면 \`redteam_poc_get\`으로 전문을 가져오거나 바로 \`nuclei -t <템플릿> -u <대상>\`을 실행합니다(nuclei 사용법, 속도 제한·노이즈 저감·적재 기준은 스킬 **\`nuclei-scan\`** 참고. 템플릿 라이브러리 \`~/.local/nuclei-templates\`에 13,742개 템플릿이 있습니다). **다시 인터넷에서 찾지도, 다시 직접 짜지도 않습니다**.
   - 두 계층 모두 없을 때만 인터넷(\`web_search\` GitHub / ExploitDB / 벤더 공지 / CNVD)으로 가고, 마지막에야 최소 검증 POC를 직접 작성합니다.
   - **득점 가능한 면만 칩니다**: 계정 권한 / WebShell / RCE / 서버 권한 / 데이터베이스 권한 / 대량 민감 정보 / 경계 돌파 / 내부망 횡적 이동 / 핵심 시스템으로 이어질 수 있는 취약점. 득점과 무관한 정보 노출, 디렉터리 나열, 버전 노출, 설정 오류, CORS/CSRF/클릭재킹, SSL·응답 헤더류 문제는 **한 줄 배제 결론만 기록하고**(\`redteam_asset_test\`의 \`test\`에 적습니다) 검증하지도, 깊게 파지도 않습니다.
2. **다음으로 디렉터리/파일 브루트포스(진입점 확보 주력, 스킬 \`dir-bruteforce\`)**: 지문에 직접적인 Nday 단서가 없을 때 먼저 숨은 경로를 찾아냅니다:
   \`feroxbuster\`(1순위, 재귀가 가장 강함) / \`ffuf\`(가장 빠름, vhost 지원) / \`dirsearch\` / \`gobuster\`. 확장자는 반드시 **백업과 설정류**(\`zip,rar,bak,sql,txt,config,env,git\`)를 포함합니다.
   끝까지 추적할 것: 백엔드 진입점(계정 권한 노선으로 넘깁니다), 백업·소스 유출(\`www.zip\`/\`.env\`/\`.git\` → 데이터베이스 연결 문자열과 하드코딩된 자격 증명 확보),
   인터페이스 문서(\`swagger-ui.html\`/\`v2/api-docs\`/\`openapi.json\`), 모니터링 콘솔(\`actuator\`/\`druid\`), 업로드 지점.
   **먼저 소프트 404를 필터링합니다**(임의 경로의 상태 코드 + 응답 길이로 \`--filter-size\`/\`-fs\`). 속도 제한은 \`-rate 80\`부터 시작하고, \`/logout\`, \`/reboot\`, \`/delete*\`처럼 상태를 바꾸는 경로는 건드리지 않습니다.
3. **다음으로 비인가 서비스 공략(가성비 최고의 득점 지점, 스킬 \`unauth-exploit\`)**: fscan/nmap이 보고한 노출 서비스를 하나씩 시도합니다:
   **Redis(6379) / MySQL(3306) / MSSQL(1433) / ES(9200) / Docker(2375) / MongoDB(27017) / Memcached / rsync / NFS / SMB 널 세션 / Jenkins \`/script\` / JDWP**.
   **먼저 읽기 전용으로 비인가 여부를 확인하고**(\`INFO\`/\`SELECT\`/\`_cat/indices\`), 그다음 데이터 추출(\`db-credential\`(데이터베이스 계정; 관리자 등급 points=50, 일반/비인가 points=10))과 파일 쓰기로 서버 권한 확보(WebShell/SSH key/예약 작업 작성 → \`server-host\`(서버 호스트 권한; 관리자 등급 points=50))를 고려합니다;
   추출량은 사실대로 집계합니다(\`bigdata-system\`(빅데이터 시스템, 규칙 8)의 문턱은 **100만 건 이상**입니다).
4. **다음으로 프런트엔드의 모든 인터페이스를 추출해 비인가 여부를 탐지합니다**:
   - JS(axios/fetch 경로, webpack chunk), \`swagger\`/\`openapi.json\`, \`actuator\`, \`druid\`, SourceMap, 미니프로그램/APP 캡처에서 **인터페이스 목록을 뽑아냅니다**(\`browser-automation\` 스킬로 전체 요청을 캡처할 수 있습니다);
   - 인터페이스에 **비인가 탐지**를 합니다: 토큰 없이 / 낮은 권한 토큰으로 직접 요청하여 데이터가 반환되거나 동작이 실행되는지 봅니다. \`userId\`/\`tenantId\`/\`orderId\` 같은 권한 상승(수평적 접근) 파라미터와 대량 내보내기 인터페이스에 주목합니다;
   - **득점 가능한 인터페이스를 확보하면 성과입니다**: 남의 데이터를 읽을 수 있고(민감 정보), 데이터를 바꿀 수 있고(권한 상승), 동작을 실행할 수 있다면(비인가 조작) 모두 적재하고 인터페이스, 파라미터, 응답을 명시합니다.
5. **자산 하나를 검사할 때마다 즉시 적재 + 상태 회신**(아래 참고). 마지막에 몰아서 하지 않습니다.

## 적재 요구사항
- 취약점마다 \`redteam_vuln_add\`: \`title\` / \`severity\` / \`cve\` / \`target\` / \`evidence\`(실제 응답이나 응답 특징) / \`confidence\` / \`status\`(\`candidate\` 미검증 → \`confirmed\` 존재 검증 완료) / \`gained\`(이것으로 무엇을 얻는가) / \`agent=vuln-scan\`.
- **확정 취약점마다 \`redteam_http_evidence_add\`를 하나씩 붙입니다**: 완전한 원시 요청(요청 라인, Host, Cookie/Token, body) + 응답 요약. 보고서는 이것으로 재현합니다.
- **핵심 동작마다 \`redteam_chain_add\`를 씁니다**: \`stage_code=recon\` 또는 \`internet\`, 그리고 \`tool\`(실제 명령, 예: \`nuclei -t xxx.yaml -u http://x\`)과 \`result\`(응답 요약)를 빠짐없이 적습니다.
- 수월하게 뚫린 성과는 바로 득점 처리합니다(\`redteam_score_hit\`, \`vuln_id\`를 붙일 수 있으면 붙입니다). 뚫지 못했지만 존재가 확인된 취약점은 \`confirmed\`로 적고 취약점 익스플로잇 역할로 넘깁니다.
- 자산 검사가 끝났거나(또는 포기했다면) 반드시 \`redteam_asset_test\`: \`status\`(testing/tested/no_surface/blocked/abandoned), \`test\`(추가 방식 결론), \`surface\`(아직 검사할 것이 남았는지), 차단되었다면 \`blocked=true\`.
- **지식 베이스 환류**: 검증에 성공한 범용 POC/EXP는 \`redteam_poc_add\`로 환류하며, **반드시 \`category\`(분류), \`engagement\`/\`asset_target\`(어느 대상, 어느 자산에서 발견·검증했는지), \`source\`/\`source_url\`, \`verified\`+\`verified_note\`를 적고**, 이번 대상과 내부망 전용 정보는 비식별화합니다. 이번에만 유효한 스크립트는 공격 파일로 적재합니다(\`redteam_attack_file_add\`).

## 장애물을 만나면
- **WAF / 차단**: 먼저 속도를 낮추고(\`nuclei -rate-limit 5 --delay 1s\`, UA 교체, 필요하면 \`cn-proxy-pool\`로 출구 IP 교체). **같은 대상에서 누적 3회 초과 차단되면 즉시 포기**합니다(\`redteam_asset_test\` status=abandoned + blocked=true + 남은 공격면 명시). 다음 대상으로 넘어갑니다. 차단될 때마다 개별로 한 번씩 기록합니다.
- **도구 부재 / key 부재**: 지휘자에게 사실대로 보고하고, 신뢰할 수 없는 대체 수단으로 밀어붙이지 않습니다.\n\n${COMMON_BIND}\n\n${COMMON_SCORE_RULES}\n\n${COMMON_DB_LOOKUP}\n\n${COMMON_EVIDENCE}\n\n${COMMON_HANDOFF}`,
  exploit: `# 취약점 익스플로잇 에이전트
## 당신의 역할
**취약점 발견 에이전트가 발견한 취약점**을 추가로 익스플로잇하여 **실제로 득점합니다**. 착수 전에 **이 자산/이 취약점이 이전에 익스플로잇된 적이 있는지 반드시 확인**하고 중복 작업을 하지 않습니다.

## 작업 순서(필수)
0. **먼저 라이브러리를 조회합니다**: \`redteam_vuln_query\`(해당 자산의 \`confirmed\` 취약점), \`redteam_asset_query\`(\`sort=priority\`, priority=high이거나 potential=서버 권한/RCE인 자산 우선), \`redteam_sessions\` + \`redteam_webshell_list\` + \`redteam_tunnel_list\` + \`redteam_credential_list\`(기존 진입점과 자격 증명). 이미 있는 WebShell/터널/자격 증명을 바로 쓸 수 있다면 **기존 것을 먼저 씁니다**. 다시 뚫지 않습니다.
1. **서버 권한을 얻을 수 있는 취약점 우선**: RCE, 명령 실행, 파일 업로드, 역직렬화, 프레임워크/미들웨어 Nday, SQL 인젝션을 통한 파일 쓰기.
   - **뚫고 들어가면 사용자가 쓸 수 있는 웹셸을 남겨야 합니다**: **Behinder 웹셸 또는 Godzilla 웹셸**을 업로드하고(스킬 \`webshell-toolkit\`), \`redteam_webshell_add\`에 \`url\` / \`shell_type\` / \`pass_key\` / \`privilege\` / \`secret_ref\`를 빠짐없이 적습니다.
     **한 줄 웹셸, 자체 제작 웹셸, 메모리 웹셸은 사용자가 접속할 수 없으므로 진입점이 없는 것과 같습니다**. 임시 중계 용도로만 쓸 때는 그 이유를 반드시 밝힙니다.
   - **사용자가 접속할 수 있음을 반드시 검증합니다**: 대응 클라이언트(Behinder/Godzilla)로 등록한 \`pass_key\`를 사용해 실제로 한 번 접속하고 명령을 실행하며, 응답을 \`note\` 또는 \`result\`에 적은 뒤 \`redteam_session_check\`로 상태를 재확인합니다.
   - **WebShell을 얻은 뒤 첫 번째 일은 suo5 터널 구축**입니다(스킬 \`suo5-tunnel\`). \`redteam_tunnel_add\`에 \`kind=suo5\` / \`listen\`(로컬 실제 리슨, 예: \`127.0.0.1:1080\`) / \`entry\`(WebShell 채널 주소) / \`reach\`(도달 가능 대역) / \`entry_kind=target-http\` / \`command\`(전체 명령)을 빠짐없이 적습니다.
     **터널을 세운 뒤 반드시 실측합니다**: 그것을 통해 내부망 대상 하나에 접속합니다(\`curl --socks5-hostname 127.0.0.1:1080 http://<내부IP>/\` 또는 \`proxychains\`). **통과해야 내부망에 진입한 것**이며, \`redteam_session_check\`로 상태를 회신합니다.
     - **사용자가 브라우저에서 쓸 수 있게 합니다**: 인도 시 사용자가 바로 붙여넣을 수 있는 설정을 줍니다. \`socks5://127.0.0.1:<listen포트>\`(로컬에서 이미 리슨 중) 또는 \`ssh -D\` / frp로 진입점을 사용자 머신에 매핑하는 방법. **리슨 주소와 포트를 명확히 적고**, 이 터널이 대상 경계를 넘었다는 점(\`entry_kind\`)을 밝힙니다.
     - 다른 터널(frp / chisel / SSH -R)도 같은 기준으로 등록하며, \`entry_kind\`에는 대상 측 단말이 무엇인지 반드시 밝힙니다.
2. **약한 암호와 자격 증명 확보(스킬 \`credential-attack\`)**: 먼저 **기본 암호와 표적형 소형 사전**을 시도하고(기관명/연도/도메인 조합의 적중률이 가장 높습니다), 그다음 범용 사전을 씁니다.
   온라인: \`hydra\`로 SSH/FTP/RDP/SMB/MySQL/MSSQL/Web 폼을 커버합니다(**Windows와 OA 계정은 속도를 엄격히 제한 \`-t 2\`, 같은 계정에서 연속 5회 실패하면 중지**. 계정을 잠그는 것은 진입점을 파괴하는 것과 같습니다);
   내부망 대역의 약한 암호 일제 조사는 \`fscan-intranet\`에 맡겨 한 번에 결과를 냅니다.
   오프라인: 해시/암호문을 얻으면 \`hashcat\`/\`john\`을 씁니다(NTLM 1000 / NetNTLMv2 5600 / MD5 0 / bcrypt 3200, 규칙 \`best64.rule\` 추가 우선).
   **대상 측 트래픽을 만들지 않으므로 온라인 브루트포스보다 안전합니다**. 크랙이 안 되면 해시로 직접 공격합니다(PtH, 스킬 \`lateral-movement\`).
   **자격 증명 한 조합이라도 얻으면 먼저 자격 증명 재사용을 시도합니다**(같은 암호로 다른 시스템/자산/프로토콜 시도). 계속 브루트포스하는 것보다 훨씬 빠릅니다.
3. **명령 실행을 상호작용 가능한 세션으로 만듭니다(스킬 \`shell-handler\`)**: 일회성 \`?cmd=\`는 취약점이 있다는 증명일 뿐입니다.
   주력은 **MSF \`exploit/multi/handler\`**(tmux에서 실행, \`set ExitOnSession false\`로 세션이 끊겨도 재접속 가능), 대상이 HTTP만 내보낼 때는 \`exploit/multi/script/web_delivery\`;
   임시 검증에는 \`nc\`/\`socat\`이면 충분합니다. VPS 로그인과 페이로드 서비스는 스킬 \`vps-reverse-shell\` 참고(페이로드 배포 \`http://$REDTEAM_VPS_HOST:9100/\`, 리슨 구간 \`9000-9999\`).
   세션이 서면 \`redteam_access_add\`(\`method=reverse-shell\`)로 기록하고 \`redteam_score_hit\`(\`server-host\`(서버 호스트 권한; 관리자 등급 points=50) / \`server-host\`(서버 호스트 권한; 관리자 등급 points=50))을 호출합니다.
4. **터널은 여러 개의 대안을 준비합니다**(suo5만 알면 안 됩니다): WebShell이 있으면 \`suo5-tunnel\`(1순위);
   명령 실행만 있으면 \`chisel-tunnel\`(HTTP/WebSocket, 아웃바운드 제한을 가장 잘 통과);
   장기 안정성과 포트를 사용자에게 직접 주려면 \`frp-tunnel\`(VPS에서 frps + 대상에서 frpc);
   TUN 계층 은닉 채널은 \`ligolo-ng\`(\`$DSH_HOME/redteam/toolkit/ligolo/proxy\` + \`agent\`).
   **터널을 등록할 때 \`entry_kind\`에 대상 측 단말을 반드시 밝힙니다**. 자기 VPS에서만 프록시를 열었다면 \`self-only\`로 적습니다("돌파로 인정되지 않음"으로 표시됩니다).
5. **이어서 다른 득점 항목을 공략합니다**: 계정 권한(먼저 자격 증명을 적재한 뒤 **브라우저 실측 로그인**으로 검증), 데이터베이스 권한(DB 덤프, 파일 쓰기, 권한 상승), 대량 민감 정보(일괄 내보내기, \`runs/\`에 증거 + 건수 필드 기록), 권한 상승 및 비인가 인터페이스의 익스플로잇 지점.
6. **성과마다 즉시 득점 기록**: \`redteam_score_hit\`(\`server-host\`(서버 호스트 권한, WebShell 포함; 일반 등급 points=10, 관리자 등급 points=50) / \`server-host\`(서버 호스트 권한; 관리자 등급 points=50) / \`server-host\`(서버 호스트 권한; 관리자 등급 points=50) / \`web-app\`(Web 애플리케이션 시스템 장악: 메일/OA/업무 운영/기타 로그인 가능한 Web 사이트; 일반 등급 points=50) / \`web-app\`(Web 애플리케이션 시스템 장악; 관리자 등급 points=100) / \`db-credential\`(데이터베이스 계정; 관리자 등급 points=50, 일반/비인가 points=10) / \`bigdata-system\`(빅데이터 시스템, 규칙 8) …), \`vuln_id\`를 붙일 수 있으면 붙입니다.

## 계정을 얻은 뒤(레드라인: 자격 증명만으로는 계정을 얻은 것이 아닙니다)
- 반드시 스킬 \`browser-automation\` / \`kimi-webbridge\`로 **실제 브라우저 로그인을 한 번 수행합니다**: 로그인 페이지 열기 → 계정과 암호 입력(이미지/산술 캡차는 직접 인식, 슬라이더와 2차 인증은 통과할 수 있으면 통과) → 실제로 백엔드/업무 페이지에 들어갔는지 확인(페이지 타이틀, 보이는 메뉴, 현재 로그인 사용자명 기록) → 세션 Cookie/Token을 캡처해 증거로 저장 → \`redteam_access_add\`(\`method=web-login\`).
- **로그인에 성공해야 계정 권한 득점을 기록합니다**. 들어가지 못하면(해시 미크랙 / 2차 인증 또는 UKey 필요 / 출발 IP 제한 / 계정 비활성) \`redteam_asset_test\`의 \`test\`에 한 줄 결론으로 어디에서 막혔는지 적습니다.
- **로그인 성공 후 분류**: 먼저 이 Web 시스템이 어느 득점 항목인지 판정합니다(메일/OA/업무 운영 → \`web-app\`; 베스천/도메인 컨트롤러/SSO/단말 관리 백엔드 → \`central-system\`; 빅데이터 플랫폼 → \`bigdata-system\`; 클라우드 플랫폼 → \`cloud-platform\`; IoT 관제 플랫폼 → \`iot-platform\`; 보안 장비 → \`secdev\`). **자격 증명이 그저 "로그인 되는 http/web 사이트" 하나이고 위 어느 분류에도 넣을 수 없다면(백엔드/관리 콘솔/운영 플랫폼/자체 개발 업무 시스템 등) \`web-app\`(Web 애플리케이션 시스템 장악, 관리자 100 / 일반 50)으로 넣습니다**. "메일/OA인지 알 수 없습니다"라는 이유로 누락하지 않습니다. \`target\`에는 실제 로그인 URL(포트 포함)을 적고, evidence에는 사이트 + 계정 + 등급을 명시합니다.
- 대상이 내부망에서만 도달 가능할 때: 먼저 suo5 터널을 세우고, 브라우저에 프록시를 걸어 접속합니다(\`--proxy-server=socks5://127.0.0.1:<포트>\`). **"내부망에 접근할 수 없습니다"라는 이유로 이 단계를 건너뛰지 않습니다**.
- 백엔드에 들어갔으면 기능마다 세 가지를 묻습니다: **업로드할 수 있는가**(프로필 이미지/첨부/가져오기/템플릿/인증서/플러그인/업그레이드 패키지), **실행할 수 있는가**(리치 텍스트, 템플릿 편집, 보고서 디자인, 예약 작업, 워크플로 스크립트, 데이터 소스, 백업·복구, 온라인 업그레이드, SQL 조회기), **경로를 읽고 쓸 수 있는가**(파일 관리, 로그, 다운로드·내보내기, 가져오기, 백업). 매칭된 지점을 getshell 체인으로 연결합니다.

## 이 역할의 적재 중점(취약점 익스플로잇)
- 동작마다 \`redteam_chain_add\`(\`stage_code\`: 인터넷 측 권한 확보 = \`internet\`, 터널 구축 = \`boundary\`, 내부망 권한 확보 = \`internal\`, 대상 장악 = \`target\`), 그리고 **\`tool\`에는 실제 명령 원문, \`result\`에는 응답 요약**을 적습니다. 보고서의 "Behinder 웹셸을 어떻게 올렸고 터널을 어떻게 세웠는지"가 이 필드에 달려 있습니다.
- 자격 증명 \`redteam_credential_add\`: \`source\`(약한 암호/인젝션 덤프/설정 유출/자격 증명 재사용/기본 암호), \`tool\`, \`secret_ref\`를 명확히 적고, **평문은 \`secret_value\`에 적습니다**.
- 익스플로잇에 성공한 취약점은 \`exploited\`로 바꿉니다(\`redteam_vuln_update\`). 뚫린 스크립트/POC/EXP는 \`redteam_attack_file_add\`로 보관합니다(**실제로 동작한 것만** 저장하고, evidence에는 실제 응답을 적습니다).
- 범용화한 EXP는 지식 베이스로 환류한다 \`redteam_poc_add\`(\`category\` + \`engagement\` + \`asset_target\` + \`verified_note\` 포함, 비식별화).\n\n${COMMON_BIND}\n\n${COMMON_SCORE_RULES}\n\n${COMMON_DB_LOOKUP}\n\n${COMMON_EVIDENCE}\n\n${COMMON_HANDOFF}`,
  internal: `# 내부망 침투 에이전트
## 당신의 역할
**취약점 익스플로잇 에이전트가 세운 터널을 통해** 내부망 침투를 수행합니다. 외부망 진입점을 스스로 다시 만들지 않습니다. 먼저 기존 것이 있는지 봅니다.

## 작업 순서(필수)
0. **먼저 진입점 목록 확인**: \`redteam_sessions\`(WebShell / 터널 / 자격 증명 한 화면), \`redteam_tunnel_list\`(\`status=active\`이면서 \`legit=true\`인 터널을 찾아 \`listen\` 주소를 얻습니다). **사용 가능한 터널이 없으면 내부망 침투의 전제가 없습니다** - 지휘자에게 "먼저 터널을 세워야 합니다"라고 사실대로 보고하고, 내부망 탐지 스크립트를 직접 짜서 밀어붙이지 않습니다.
   - 터널이 통하지 않으면 먼저 고칩니다: \`redteam_session_check\`로 실측하고, 끊긴 것은 \`redteam_tunnel_update\`로 리슨 주소/상태를 고치거나 \`suo5-tunnel\` 스킬로 재구축합니다.
   - **터널은 여러 개를 준비합니다**(스킬 \`chisel-tunnel\` / \`frp-tunnel\`): suo5는 WebShell에 의존합니다; 명령 실행만 있으면 chisel; 장기 안정성과 외부 포트 매핑은 frp; TUN 계층은 ligolo-ng.
     여러 터널이 서로 백업이 됩니다. 하나가 죽어도 다른 것으로 내부망에 들어갈 수 있어야 하며, 단일 지점에 걸려 멈추면 안 됩니다.
1. **내부망 정보 수집(당신이 직접 합니다 - 당신은 리프 노드이고, 플랫폼은 하위 에이전트 파견을 허용하지 않습니다. 작업 지시서에도 파견을 쓰지 않습니다)**:
   - 터널을 통해 기성 스캐너로 면을 훑습니다: 스킬 \`gogo-intranet\`(\`--proxy socks5://<터널>\`)으로 먼저 스캔하고, 스킬 \`fscan-intranet\`으로 지점을 타격합니다(\`-socks5 <터널>\`);
   - **가장 중요한 것은 내부망의 모든 대역을 찾아내는 것입니다**: 이미 장악한 호스트의 라우팅 테이블/\`ip route\`/\`arp -a\`/\`netstat\`, DNS 설정, 도메인 정보, hosts 파일, SSH known_hosts, 데이터베이스 연결 문자열, 로그 속 내부망 주소에서 시작해, 스캔 결과와 결합하여 \`10.x\` / \`172.x\` / \`192.168.x\` 각 대역과 도달 가능성을 파악합니다;
   - 새로 발견한 자산은 \`redteam_asset_add\`로 자산 지도에 합칩니다(자동으로 /24 기준 C 블록이 생성되고, 내부망 자산은 적재 시 \`scope\`가 자동으로 internal이 됩니다).
2. **내부망 자산을 직접 한 건씩 평가합니다**(\`redteam_asset_assess\`: priority/potential/reason) → "누구부터 칠 것인가"를 산출합니다. 양이 많으면 배치로 나누고 high부터 칩니다.
3. **내부망 취약점 발견도 직접 합니다**: 여기서도 **먼저 라이브러리를 조회**하고(\`redteam_asset_query\` / \`redteam_vuln_query\`, 이미 검사한 것과 확정된 것은 건너뜁니다), \`redteam_poc_search\`를 우선합니다(로컬 템플릿을 터널 경유로 쓸 때는 \`-proxy socks5://<터널>\` 추가). 특히 MS17-010, SMBGhost, Shiro/Fastjson/Weblogic 등 내부망 다발 취약점, 비인가 서비스(Redis/Docker/공유 디렉터리), 내부망 관리 콘솔에 집중합니다.
4. **내부망 익스플로잇도 직접 합니다**: 자격 증명 재사용 우선(\`redteam_credential_list\` / \`redteam_access_list\`, Pass-the-Hash, 티켓, SSH/RDP/SMB/WinRM/데이터베이스/미들웨어 백엔드), **내부망에서 자격 증명을 얻어도 먼저 내부망 관리 콘솔을 시도합니다**(베스천 / 운영 플랫폼 / 데이터베이스 백엔드 / 도메인 컨트롤러 / OA와 메일 백엔드). 이것들이 곧바로 핵심 시스템 득점에 해당합니다.
5. **횡적 이동과 권한 상승(스킬 \`lateral-movement\`, 로컬 \`impacket-*\` 명령 61개)**:
   - **먼저 열거**: \`impacket-GetADUsers\` / \`impacket-GetADComputers\` / \`enum4linux -a\` / \`smbclient -L\`;
   - **자격 증명 덤프**: \`impacket-secretsdump\`(원격 SAM/LSA/SECRETS 덤프), \`-just-dc\`(DCSync, 도메인 컨트롤러 직행);
   - **PtH 횡적 이동**: \`impacket-wmiexec\`/\`atexec\`(**우선, 노이즈가 적습니다**) > \`psexec\`(서비스 설치, 노이즈가 크고 EDR에 걸리기 쉽습니다);
   - **Kerberos**: \`impacket-GetNPUsers\`(AS-REP) + \`GetUserSPNs\`(Kerberoasting)로 캡처해 오프라인 크랙, \`getTGT\`/\`getST\`로 티켓과 위임 처리;
   - **자격 증명 재사용은 적중률이 가장 높은 수법입니다**: 같은 이미지로 일괄 설치한 머신들은 로컬 관리자 암호가 같은 경우가 많습니다. 자격 증명 한 조합을 얻으면 먼저 한 바퀴 훑고 나서 새 취약점을 논합니다;
   - **터널 경유**: 모든 명령에 \`proxychains4 -f runs/proxychains-<port>.conf\`를 붙입니다(**\`-f\` 임시 설정만 쓰고, 시스템 설정은 절대 바꾸지 않습니다**);
     proxychains는 TCP만 프록시한다는 점에 주의합니다. Kerberos의 UDP와 역방향 연결 시나리오는 \`chisel-tunnel\`/\`frp-tunnel\`로 포트 매핑을 해야 합니다.
6. **핵심 시스템 공략**: 도메인 컨트롤러, 베스천, 운영 플랫폼, 코드 저장소, 데이터베이스 클러스터, 백업 시스템 → \`central-system\`(집권 시스템, 관리자 등급 points=500).
7. 매 단계마다 득점을 기록합니다(code는 \`redteam_score_list\`가 실제 반환하는 값을 기준으로 하고, 기억에 의존해 옛 code를 적지 않습니다): 경계 돌파는 증거 강도에 따라 \`boundary-logical\` / \`boundary-strong\` / \`boundary-physical\` / \`boundary-supply\` 네 등급 중에서 고릅니다; 횡적 이동으로 호스트를 얻으면 \`server-host\`; 집권 시스템은 \`central-system\`; Web 시스템은 \`web-app\`; 빅데이터는 \`bigdata-system\`.

## 이 역할의 적재 중점(내부망 침투)
- 내부망 자산마다 \`redteam_asset_add\`; 성공한 접근마다 \`redteam_access_add\`; 자격 증명마다 \`redteam_credential_add\`(\`source\`/\`tool\` 명확히).
- 핵심 동작마다 \`redteam_chain_add\`: \`stage_code=internal\`(내부망 권한 확보) / \`boundary\`(터널 구축) / \`target\`(대상 장악), **\`tool\`에는 실제 명령**(\`--proxy socks5://...\` 같은 터널 경유 파라미터 포함)을, \`result\`에는 응답을 적습니다.
- 터널을 통해 수행한 스캔/익스플로잇은 명령에 터널 파라미터를 남깁니다. 보고서만 보고 재현할 수 있어야 합니다.
- 내부망의 알려진 취약점도 먼저 지식 베이스와 로컬 템플릿을 조회하고, 뚫린 뒤에는 환류합니다(\`redteam_poc_add\`, \`category\` + \`engagement\` + \`asset_target\` + \`verified_note\` 포함, 비식별화).

## 경계
- **득점 가능한 면만 칩니다**: 내부망 자산 권한(서버/데이터베이스/도메인 컨트롤러/핵심 시스템)과 민감 데이터; 득점과 무관한 설정 문제, 정보 노출, 중저위험은 깊게 파지 않습니다(최대 한 줄 배제 결론).
- 장시간 작업 전후에 \`redteam_session_check\`를 한 번씩 실행합니다. 이후 작업이 끊긴 터널 위에 올라서지 않게 합니다.\n\n${COMMON_BIND}\n\n${COMMON_SCORE_RULES}\n\n${COMMON_DB_LOOKUP}\n\n${COMMON_EVIDENCE}\n\n${COMMON_HANDOFF}`,

}
/* 역할 목록(도구, 패널, 프롬프트 갱신 스크립트가 공유): 순서가 곧 권장 실행 순서입니다. */
export const ROLE_ORDER = ['recon', 'assess', 'vuln-scan', 'exploit', 'internal']
export const PLANNER_ROLE = 'plan'

/* ------------------------------------------------------------------ 통합 동작 디스패치 */

/**
 * 통합 동작 디스패치: CLI, HTTP 브리지, (추후) 에이전트 도구가 같은 op 어휘를 공유하여,
 * 화면에서 보는 것, 명령행에서 검증하는 것, 에이전트가 쓰는 것이 같은 경로임을 보장합니다.
 * @param store - RedteamStore 인스턴스.
 * @param req - `{ op, engagement, ... }`.
 * @returns JSON 직렬화 가능한 결과(실패 시 `{ ok: false, error }`).
 */
export function dispatch(store, req = {}) {
  const op = typeof req.op === 'string' ? req.op.trim() : ''
  try {
    if (!op) return { ok: false, error: 'missing op' }
    if (op === 'bootstrap') {
      const engagements = store.listEngagements({ includeStats: false })
      /* “현재 대상” 포인터를 우선 사용하고, 그다음이 최근 생성된 대상입니다 */
      const active = typeof store.activeEngagementId === 'function' ? store.activeEngagementId() : undefined
      return {
        ok: true, root: store.root, engagements,
        current: req.engagement || active || (engagements[0] && engagements[0].id) || null,
      }
    }
    if (op === 'openEngagement') {
      return { ok: true, engagement: store.openEngagement(req.name, req.scope) }
    }
    if (op === 'activateEngagement') {
      const activated = store.setActiveEngagement(req.engagement)
      return { ok: activated, current: store.activeEngagementId() }
    }
    /* 지식 베이스는 전역입니다(대상 간 공유), 그래서 이 op 들은 engagement 가 필요 없습니다 */
    if (op === 'pocSearch') {
      const items = store.searchPocs(req)
      /* "기성"은 두 계층입니다: 로컬에 축적된 POC/EXP + 로컬 nuclei 템플릿 라이브러리. 한 번에 반환해 왕복을 아낍니다. */
      const q = req.q || req.query || req.cve || req.component || ''
      const templates = q
        ? store.searchTemplates(q, Math.min(Number(req.templateLimit) || 20, 100))
        : { dir: store.nucleiTemplatesDir() || null, total: store.templateStats().total, items: [] }
      return { ok: true, items, stats: store.pocStats(), templates, dbPath: store.knowledgePath(), root: store.root }
    }
    if (op === 'pocList') return { ok: true, items: store.searchPocs(req), stats: store.pocStats(), dbPath: store.knowledgePath(), root: store.root }
    if (op === 'templateSearch') return Object.assign({ ok: true }, store.searchTemplates(req.q, Math.min(Number(req.limit) || 40, 200)))
    if (op === 'templateStats') return { ok: true, stats: store.templateStats() }
    if (op === 'pocGet') return Object.assign({ ok: true }, store.getPoc(req.id !== undefined ? req.id : req.code))
    if (op === 'pocSave') return Object.assign({ ok: true }, store.savePoc(req.poc || req))
    if (op === 'pocUpdate') return { ok: true, poc: store.updatePoc(req.id !== undefined ? req.id : req.code, req.patch || req) }
    if (op === 'pocDelete') return Object.assign({ ok: true }, store.deletePoc(req.id !== undefined ? req.id : req.code))
    if (op === 'pocUse') return Object.assign({ ok: true }, store.markPocUsed(req.id !== undefined ? req.id : req.code, req.used_on))
    if (op === 'pocStats') return { ok: true, stats: store.pocStats() }
    /* 환경 적응: 전역이며 대상에 의존하지 않습니다; 패널 / CLI / 도구가 공유 */
    if (op === 'platformConfigGet') return platformSummary(store.root)
    if (op === 'platformConfigSave') {
      savePlatformConfig(req.config || {}, store.root)
      return platformSummary(store.root)
    }
    if (op === 'platformAssignToolkit') return assignToolkitFolder(req.dir, store.root)
    /* 대상이 선택되지 않았을 때: 프롬프트는 내장 기본값, 읽기 전용 조회는 빈 결과. 영어 engagement required 를 던지지 않습니다. */
    let id = typeof req.engagement === 'string' ? req.engagement.trim() : ''
    if (!id && typeof store.activeEngagementId === 'function') id = store.activeEngagementId() || ''
    if (!id) {
      if (op === 'prompts') {
        return {
          ok: true,
          builtin: true,
          roles: Object.entries(ROLE_TITLES).map(([role, title]) => ({
            role, title,
            planner: role === PLANNER_ROLE,
            dispatcher: role !== PLANNER_ROLE,
            content: DEFAULT_PROMPTS[role] || '',
            updated_at: null,
          })),
        }
      }
      const writing = /^(add|save|update|delete|import|assess|open)/.test(op)
      if (writing) return { ok: false, error: '먼저 상단에서 대상을 선택하거나 생성하십시오' }
      return { ok: true, items: [], total: 0, stats: null, segments: [], stages: [], roles: [] }
    }

    if (op === 'snapshot') return Object.assign({ ok: true }, store.snapshot(id))
    if (op === 'assets') return Object.assign({ ok: true }, store.listAssets(id, req))
    if (op === 'asset') return { ok: true, asset: store.getAsset(id, req.id) }
    if (op === 'graph') return Object.assign({ ok: true }, store.graph(id, req))
    if (op === 'attackGraph') return Object.assign({ ok: true }, store.attackGraph(id, req))
    if (op === 'stats') return { ok: true, stats: store.stats(id) }
    if (op === 'vulns') return Object.assign({ ok: true, stats: store.vulnStats(id) }, store.listVulns(id, req))
    if (op === 'addVuln') return Object.assign({ ok: true }, store.addVuln(id, req.vuln || req))
    if (op === 'updateVuln') return Object.assign({ ok: true }, store.updateVuln(id, req.id, req.patch || req))
    if (op === 'vulnStats') return { ok: true, stats: store.vulnStats(id) }
    if (op === 'credentials') return { ok: true, items: store.listCredentials(id, req) }
    if (op === 'addCredential') return Object.assign({ ok: true }, store.addCredential(id, req.credential || req))
    if (op === 'access') return { ok: true, items: store.listAccess(id, req) }
    if (op === 'addAccess') return Object.assign({ ok: true }, store.addAccess(id, req.access || req))
    if (op === 'sessions') return Object.assign({ ok: true }, store.sessionSummary(id))
    if (op === 'webshells') return { ok: true, items: store.listWebshells(id, req) }
    if (op === 'addWebshell') return Object.assign({ ok: true }, store.addWebshell(id, req.webshell || req))
    if (op === 'updateWebshell') return Object.assign({ ok: true }, store.updateWebshell(id, req.id, req.patch || req))
    if (op === 'tunnels') return { ok: true, items: store.listTunnels(id, req) }
    if (op === 'shots') return Object.assign({ ok: true }, store.listShots(id, req))
    if (op === 'shotAdd') return Object.assign({ ok: true }, store.addShot(id, req.shot || req))
    if (op === 'shotDelete') return Object.assign({ ok: true }, store.deleteShot(id, req.id !== undefined ? req.id : req.shot_id))
    if (op === 'shotData') return Object.assign({ ok: true }, store.readShot(id, req.id !== undefined ? req.id : req.shot_id))
    if (op === 'addTunnel') return Object.assign({ ok: true }, store.addTunnel(id, req.tunnel || req))
    if (op === 'updateTunnel') return Object.assign({ ok: true }, store.updateTunnel(id, req.id, req.patch || req))
    if (op === 'domains') return { ok: true, items: store.domainIndex(id, req) }
    if (op === 'web') return Object.assign({ ok: true }, store.listWeb(id, req))
    if (op === 'httpEvidence') return { ok: true, items: store.listHttpEvidence(id, req) }
    if (op === 'addHttpEvidence') return Object.assign({ ok: true }, store.addHttpEvidence(id, req.evidence || req))
    if (op === 'chain') return { ok: true, items: store.listChain(id) }
    if (op === 'addChainStep') return Object.assign({ ok: true }, store.addChainStep(id, req.step || req))
    if (op === 'report') return Object.assign({ ok: true }, store.report(id))
    if (op === 'assetTest') return Object.assign({ ok: true }, store.updateAssetTest(id, req.test || req))
    if (op === 'assessAsset') return Object.assign({ ok: true }, store.assessAsset(id, req.assess || req))
    if (op === 'scores') return Object.assign({ ok: true }, store.listScorePoints(id, req))
    if (op === 'saveScorePoint') return Object.assign({ ok: true }, store.saveScorePoint(id, req.point || req))
    if (op === 'deleteScorePoint') return Object.assign({ ok: true }, store.deleteScorePoint(id, req.id))
    if (op === 'addScoreHit') return Object.assign({ ok: true }, store.addScoreHit(id, req.hit || req))
    if (op === 'scoreChain') return Object.assign({ ok: true }, store.scoreChain(id, req))
    if (op === 'scoreReport') return Object.assign({ ok: true }, store.scoreReport(id, req))
    if (op === 'activeTests') return Object.assign({ ok: true }, store.activeTests(id, req))
    if (op === 'testStats') return { ok: true, stats: store.testStats(id) }
    /* 콘솔 탭의 미확인 포인터(탭별 건수 + 최근 갱신 시각): 패널이 이것으로 빨간 점을 찍습니다 */
    if (op === 'consoleDigest') return Object.assign({ ok: true }, store.consoleDigest(id))
    if (op === 'stages') return { ok: true, items: store.listStages(id) }
    if (op === 'saveStage') return Object.assign({ ok: true }, store.saveStage(id, req.stage || req))
    if (op === 'reportTargets') return Object.assign({ ok: true }, store.reportTargets(id, req))
    /* 자산 발견 타임라인: 자산 매핑 페이지의 "발견 시각" 뷰 + 보고서 부록이 공유 */
    if (op === 'discoveryTimeline') return Object.assign({ ok: true }, store.discoveryTimeline(id, req))
    if (op === 'attackFiles') return { ok: true, items: store.attackFileTree(id) }
    if (op === 'addAttackFile') return Object.assign({ ok: true }, store.addAttackFile(id, req.file || req))
    if (op === 'readAttackFile') return Object.assign({ ok: true }, store.readAttackFile(id, req.id))
    if (op === 'import') return Object.assign({ ok: true }, store.importBundle(id, req))
    if (op === 'prompts') return { ok: true, roles: store.listPrompts(id) }
    if (op === 'savePrompt') return Object.assign({ ok: true }, store.savePrompt(id, req.role, req.content))
    if (op === 'resetPrompts') return Object.assign({ ok: true }, store.resetPrompts(id, req.role))
    throw new Error(`unknown op: ${op}`)
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : String(error) }
  }
}

/**
 * 비동기 디스패치: \`probeSessions\` 하나만 추가되었고(실제 네트워크 연결을 일으켜야 합니다), 나머지는 동기 dispatch 로 전달합니다.
 * 에이전트의 샌드박스에서는 외부로 나갈 수 없으므로 host 측에서 연결성을 실측합니다.
 */
export async function dispatchAsync(store, req = {}) {
  if (req.op === 'probeSessions') {
    try {
      const id = (typeof req.engagement === 'string' && req.engagement.trim())
        || (typeof store.activeEngagementId === 'function' ? store.activeEngagementId() : '')
      if (!id) return { ok: true, items: [], note: '아직 대상이 없습니다' }
      const result = await store.probeSessions(id, req)
      return Object.assign({ ok: true }, result)
    } catch (error) {
      return { ok: false, error: error && error.message ? error.message : String(error) }
    }
  }
  return dispatch(store, req)
}

/* ------------------------------------------------------------------ 서비스 */

/**
 * 이미지 바이트에서 크기를 읽습니다(PNG / JPEG / WebP). 읽지 못하면 `{ width: null, height: null }` 를 반환합니다.
 *
 * 패널과 보고서에 "이 이미지가 얼마나 큰지" 표시하고 0 바이트 파일을 스크린샷으로 받지 않기 위한 것일 뿐입니다 -
 * 이를 위해 이미지 라이브러리를 끌어올 가치는 없습니다(이 패키지는 의도적으로 외부 의존성 0을 유지합니다).
 *
 * @param buf - 이미지 바이트.
 */
function pngSize(buf) {
  try {
    if (buf.length > 24 && buf.slice(1, 4).toString('latin1') === 'PNG') {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
    }
    if (buf.length > 4 && buf[0] === 0xFF && buf[1] === 0xD8) {
      let i = 2
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xFF) { i += 1; continue }
        const marker = buf[i + 1]
        const len = buf.readUInt16BE(i + 2)
        if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
          return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) }
        }
        i += 2 + len
      }
    }
    if (buf.length > 30 && buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP') {
      const fmt = buf.slice(12, 16).toString('latin1')
      if (fmt === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
      if (fmt === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3FFF, height: buf.readUInt16LE(28) & 0x3FFF }
    }
  } catch { /* 크기를 읽지 못해도 적재에는 영향이 없습니다 */ }
  return { width: null, height: null }
}

function assertSourcePath(root, raw) {
  return assertPathWithin(resolve(root, raw), [root])
}

// No separators, dot components, drive-relative paths, device names, or NTFS streams.
function pathComponent(value) {
  if (typeof value !== 'string' || !value || /[<>:"/\\|?*\x00-\x1f]|[. ]$/.test(value) ||
      /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(value) || win32.isAbsolute(value)) {
    throw new Error('invalid path component: ' + value)
  }
  return value
}

export class RedteamStore {
  /** @param root 데이터 루트 디렉터리(기본값 $DSH_HOME/redteam) */
  constructor(root) {
    this.root = root
    this.engagementsDir = join(root, 'engagements')
    this.handles = new Map()
    mkdirSync(this.engagementsDir, { recursive: true })
  }

  /* ---------- 현재 대상 ---------- */
  currentPath() { return join(this.root, 'current') }

  /** 현재 유효한 대상 id: 명시적 포인터를 우선하고, 없으면 최근 생성된 대상입니다. */
  activeEngagementId() {
    try {
      const raw = readFileSync(this.currentPath(), 'utf8').trim()
      if (raw && existsSync(this.dbPathOf(raw))) return raw
    } catch { /* 포인터가 없으면 폴백 */ }
    const list = this.listEngagements({ includeStats: false })
    return list.length ? list[0].id : undefined
  }

  /** 현재 대상을 전환합니다(인터페이스 전환이나 에이전트 바인딩 시 호출). */
  setActiveEngagement(id) {
    if (!id || !existsSync(this.dbPathOf(id))) return false
    mkdirSync(this.root, { recursive: true })
    writeFileSync(this.currentPath(), String(id), 'utf8')
    return true
  }

  /* ---------- 경로 ---------- */
  /* id 는 요청 본문(dispatch 의 req.engagement)에서 올 수 있으므로, 경로를 조합하기 전에 `..` 로 빠져나가지 못하게 막아야 합니다. */
  dirOf(id) { return assertNoLinkedDescendants(this.engagementsDir, join(this.engagementsDir, pathComponent(id))) }
  metaPathOf(id) { return assertNoLinkedDescendants(this.dirOf(id), join(this.dirOf(id), 'engagement.yaml')) }
  dbPathOf(id) { return assertNoLinkedDescendants(this.dirOf(id), join(this.dirOf(id), 'assets.db')) }
  promptsDirOf(id) { return assertNoLinkedDescendants(this.dirOf(id), join(this.dirOf(id), 'agents')) }

  /* ---------- 데이터베이스 핸들(대상별 캐시, dispose 시 일괄 종료) ---------- */
  /**
   * 특정 대상의 데이터베이스 핸들을 열거나 필요하면 생성합니다.
   * @param id - 대상 id.
   * @param options - `{ create: true }` 이면 새 라이브러리 파일 생성을 허용합니다(openEngagement 용).
   */
  db(id, options = {}) {
    let handle = this.handles.get(id)
    if (handle) return handle
    if (!existsSync(this.dbPathOf(id))) {
      if (options.create !== true) throw new Error(`engagement not found: ${id}`)
      mkdirSync(this.dirOf(id), { recursive: true })
    }
    handle = new DatabaseSync(this.dbPathOf(id))
    /* FTS5 가 없는 Node 빌드(예: 22.14)에서는 fts5 테이블 생성문을 포함하면 안 됩니다:
       `USING fts5` 한 줄이 오류를 내면 DDL 전체가 함께 무너져 일반 테이블도 만들 수 없습니다.
       강등 후에는 asset 검색이 LIKE 를 씁니다(listAssets 의 f.q 분기 참고). */
    try {
      handle.exec(HAS_FTS5 ? DDL + ASSET_FTS_DDL : DDL)
      migrate(handle)
    } catch (error) {
      try { handle.close() } catch (closeError) { error.closeError = String(closeError?.message || closeError) }
      throw error
    }
    this.handles.set(id, handle)
    return handle
  }

  close() {
    for (const handle of this.handles.values()) {
      try { handle.close() } catch { /* 종료 실패가 언로드를 막지 않습니다 */ }
    }
    this.handles.clear()
    if (this.kbHandle) {
      try { this.kbHandle.close() } catch { /* 무시 */ }
      this.kbHandle = null
    }
  }

  /* ---------- 대상 생애주기 ---------- */
  listEngagements(options = {}) {
    mkdirSync(this.engagementsDir, { recursive: true })
    const out = []
    for (const entry of readdirSync(this.engagementsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const meta = readMeta(this.metaPathOf(entry.name)) || {}
      let stats = null
      let stats_error = null
      if (options.includeStats !== false) {
        try {
          if (existsSync(this.dbPathOf(entry.name))) stats = this.stats(entry.name)
        } catch (error) { stats_error = String(error?.message || error) }
      }
      out.push({
        id: entry.name, name: meta.target_name || entry.name,
        scope: meta.scope_cidrs || [], status: meta.status || 'active',
        created_at: meta.created_at || null, stats,
        ...(stats_error ? {stats_error} : {}),
      })
    }
    return out.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  }

  /**
   * 대상 작업 공간을 열거나 생성합니다.
   * @param name - 대상 기관 이름(slugify 후 디렉터리 이름과 대상 id 로 씁니다).
   * @param scope - 권한 범위 CIDR 목록(비어 있을 수 있습니다).
   * @param options - `{ bindCurrent?: boolean }`: 전역 "현재 대상" 포인터도 함께 옮길지 여부.
   *   기본값은 true(인터페이스/명령행 의미); **에이전트 도구는 false 를 넘깁니다** - 여러 세션이 병렬로 돌 때
   *   어느 세션이 대상을 open 했다고 전역 포인터가 바뀌는 것이 "보고서가 뒤섞여 기록되는" 직접적 원인입니다.
   */
  openEngagement(name, scope, options = {}) {
    const id = slugify(name)
    mkdirSync(this.dirOf(id), { recursive: true })
    for (const sub of ['agents', 'runs', 'reports']) mkdirSync(join(this.dirOf(id), sub), { recursive: true })
    const existing = readMeta(this.metaPathOf(id))
    writeMeta(this.metaPathOf(id), {
      target_name: name,
      scope_cidrs: scope || (existing && existing.scope_cidrs) || [],
      status: 'active',
      created_at: (existing && existing.created_at) || nowIso(),
      updated_at: nowIso(),
    })
    this.db(id, { create: true }) // 라이브러리 생성 + 테이블 생성
    this.seedScorePoints(id)
    for (const p of this.listPrompts(id)) {
      if (!p.content) this.savePrompt(id, p.role, DEFAULT_PROMPTS[p.role] || '')
    }
    if (options.bindCurrent !== false) this.setActiveEngagement(id)
    return { id, name, scope: scope || [] }
  }

  /**
   * 자산 발견 타임라인: "어느 날 얼마나 발견했고, 최근에 무엇을 발견했는지"로 집계합니다.
   * 자산 매핑 페이지는 이것으로 "이 항목이 언제 발견되었는지" 답하고, 보고서 부록은 마감 타임라인으로 씁니다.
   * @param id - 대상 id.
   * @param f - `{ limit?: number }` 최근 자산 건수(기본값 50).
   */
  discoveryTimeline(id, f = {}) {
    const db = this.db(id)
    const limit = Math.min(Number(f.limit) || 50, 500)
    const days = db.prepare(`SELECT substr(COALESCE(discovered_at, first_seen, ''), 1, 10) AS day,
        COUNT(*) AS assets,
        SUM(CASE WHEN COALESCE(scope, (${SCOPE_SQL})) = 'internal' THEN 1 ELSE 0 END) AS internal,
        SUM(CASE WHEN COALESCE(scope, (${SCOPE_SQL})) = 'external' THEN 1 ELSE 0 END) AS external
      FROM asset GROUP BY day ORDER BY day DESC`).all()
    const recent = db.prepare(`SELECT id, ip, segment_cidr, state, primary_name, discovered_at, first_seen, last_seen,
        COALESCE(scope, (${SCOPE_SQL})) AS scope, priority,
        (SELECT COUNT(*) FROM port p WHERE p.asset_id = asset.id AND p.state = 'open') AS open_ports
      FROM asset ORDER BY COALESCE(discovered_at, first_seen, '') DESC, id DESC LIMIT ?`).all(limit)
    const span = db.prepare(`SELECT MIN(COALESCE(discovered_at, first_seen)) AS first,
        MAX(COALESCE(discovered_at, first_seen)) AS last, COUNT(*) AS total FROM asset`).get() || {}
    return {
      days: days.map((d) => Object.assign({}, d, { day: d.day || '(알 수 없는 시각)' })),
      recent,
      span: { first: span.first || null, last: span.last || null, total: span.total || 0 },
    }
  }

  /* ---------- 통계 / 조회 ---------- */
  stats(id) {
    const db = this.db(id)
    const one = (sql) => Object.values(db.prepare(sql).get() || {})[0] ?? 0
    return {
      segments: one('SELECT COUNT(*) FROM segment'),
      assets: one('SELECT COUNT(*) FROM asset'),
      liveAssets: one("SELECT COUNT(*) FROM asset WHERE state = 'live'"),
      openPorts: one("SELECT COUNT(*) FROM port WHERE state = 'open'"),
      services: one('SELECT COUNT(*) FROM service'),
      fingerprints: one('SELECT COUNT(*) FROM fingerprint'),
      passiveSignals: one("SELECT COUNT(*) FROM observation WHERE provenance = 'passive'"),
      activeSignals: one("SELECT COUNT(*) FROM observation WHERE provenance = 'active'"),
      vulns: one('SELECT COUNT(*) FROM vuln'),
      credentials: one('SELECT COUNT(*) FROM credential'),
      accesses: one('SELECT COUNT(*) FROM access_session'),
      untestedAssets: one("SELECT COUNT(*) FROM asset WHERE COALESCE(test_status, 'untested') = 'untested'"),
      blockedAssets: one("SELECT COUNT(*) FROM asset WHERE COALESCE(test_status, '') = 'blocked' OR blocked_count > 0"),
    }
  }

  /**
   * 콘솔 "미확인" 요약: 탭마다 "건수 + 최근 1건 시각"의 경량 포인터를 줍니다.
   *
   * 패널은 로컬에 기억한 지난 확인 상태와 비교합니다: 새 건수가 있거나 최신 시각이 지난 확인보다 늦으면 탭에 빨간 점을 찍고;
   * 사용자가 탭을 열면 현재 값을 확인됨으로 기록해 빨간 점이 사라집니다. **읽기 전용, 개수 세기만** 하며 무거운 작업은 하지 않습니다.
   */
  consoleDigest(id) {
    const db = this.db(id)
    const count = (sql) => {
      try { return Number(db.prepare(sql).get()?.n ?? 0) || 0 } catch { return 0 }
    }
    const at = (sql) => {
      try { return db.prepare(sql).get()?.t ?? null } catch { return null }
    }
    const maxOf = (a, b) => (a === null ? b : (b === null ? a : (a > b ? a : b)))
    /* 지식 베이스는 대상 간 공유되는 또 다른 라이브러리입니다: 얻지 못하면 0으로 보고, 다른 탭에 영향을 주지 않습니다 */
    let kb = { count: 0, at: null }
    try {
      const k = this.kb()
      kb = {
        count: Number(k.prepare('SELECT COUNT(*) AS n FROM poc').get()?.n ?? 0),
        at: k.prepare('SELECT MAX(COALESCE(updated_at, created_at)) AS t FROM poc').get()?.t ?? null,
      }
    } catch { /* 지식 베이스가 아직 없습니다: 갱신 없음으로 봅니다 */ }
    const hits = 'SELECT COUNT(*) AS n FROM score_hit'
    const hitsAt = 'SELECT MAX(recorded_at) AS t FROM score_hit'
    const steps = 'SELECT COUNT(*) AS n FROM attack_step'
    const stepsAt = 'SELECT MAX(recorded_at) AS t FROM attack_step'
    const sections = {
      assets: {
        count: count('SELECT COUNT(*) AS n FROM asset'),
        at: at('SELECT MAX(COALESCE(discovered_at, first_seen, last_seen)) AS t FROM asset'),
      },
      testing: {
        count: count("SELECT COUNT(*) AS n FROM asset WHERE COALESCE(test_status, 'untested') <> 'untested'"),
        at: at('SELECT MAX(test_updated_at) AS t FROM asset'),
      },
      /* "에이전트" 탭은 "누가 실행 중인지"를 봅니다: 공격 단계의 최신 동작을 포인터로 씁니다 */
      agents: { count: count(steps), at: at(stepsAt) },
      sessions: {
        count: count('SELECT COUNT(*) AS n FROM webshell') + count('SELECT COUNT(*) AS n FROM tunnel'),
        at: maxOf(
          at('SELECT MAX(COALESCE(updated_at, created_at)) AS t FROM webshell'),
          at('SELECT MAX(COALESCE(updated_at, created_at)) AS t FROM tunnel'),
        ),
      },
      findings: {
        count: count('SELECT COUNT(*) AS n FROM vuln'),
        at: at('SELECT MAX(found_at) AS t FROM vuln'),
      },
      chain: { count: count(steps), at: at(stepsAt) },
      scores: { count: count(hits), at: at(hitsAt) },
      report: { count: count(hits), at: at(hitsAt) },
      attackfiles: {
        count: count('SELECT COUNT(*) AS n FROM attack_file'),
        at: at('SELECT MAX(created_at) AS t FROM attack_file'),
      },
      knowledge: kb,
      /* 프롬프트와 스킬 라이브러리는 패키지에 포함되어 배포되는 정적 콘텐츠입니다: "새 항목"이라는 것이 없어 빨간 점을 찍지 않습니다 */
      prompts: { count: 0, at: null },
      skills: { count: 0, at: null },
    }
    return { engagement: id, at: nowIso(), sections }
  }

  snapshot(id) {
    const meta = readMeta(this.metaPathOf(id)) || {}
    return {
      engagement: {
        id, name: meta.target_name || id, scope: meta.scope_cidrs || [],
        status: meta.status || 'active', created_at: meta.created_at || null,
      },
      stats: this.stats(id),
      tests: this.testStats(id),
      segments: this.listSegments(id),
    }
  }

  listSegments(id) {
    const rows = this.db(id).prepare(`
      SELECT s.cidr, s.org, s.asn, s.country, s.city, s.source,
        (SELECT COUNT(*) FROM asset a WHERE a.segment_cidr = s.cidr) AS assets,
        (SELECT COUNT(*) FROM asset a WHERE a.segment_cidr = s.cidr AND a.state = 'live') AS live,
        (SELECT COUNT(*) FROM port p JOIN asset a ON a.id = p.asset_id WHERE a.segment_cidr = s.cidr AND p.state = 'open') AS open_ports,
        (SELECT COUNT(*) FROM port p JOIN asset a ON a.id = p.asset_id WHERE a.segment_cidr = s.cidr AND p.provenance = 'passive') AS passive_ports,
        (SELECT COUNT(*) FROM port p JOIN asset a ON a.id = p.asset_id WHERE a.segment_cidr = s.cidr AND p.provenance = 'active') AS active_ports
      FROM segment s ORDER BY assets DESC, s.cidr`).all()
    /* C 블록도 내외부망으로 나뉩니다: 대역 시작 주소의 귀속으로 판정합니다 */
    return rows.map((r) => Object.assign({}, r, { scope: scopeOfIp(String(r.cidr || '').split('/')[0]) }))
  }

  /**
   * 한 묶음 자산의 ports / fingerprints / names 를 **한 번에 조회**하고 asset_id 로 묶어 반환합니다.
   *
   * 필요한 이유: assetRow 는 원래 자산마다 3개 조회를 따로 돌렸고, 자산 목록 기본 limit=400 입니다 -
   * 목록 요청 한 번이면 SQL 1200개이고, 패널은 필터 조건을 바꿀 때마다 다시 조회합니다.
   * 여기서는 `IN (...)` 조회 3개로 바꿔 비용이 **자산 수와 무관**합니다.
   *
   * @param db - 대상 라이브러리 핸들.
   * @param ids - 자산 id 배열(빈 배열이면 빈 Map 을 바로 반환).
   * @returns `{ ports, fingerprints, names }`: `Map<assetId, rows[]>` 세 개
   */
  assetChildren(db, ids = []) {
    const ports = new Map()
    const fingerprints = new Map()
    const names = new Map()
    const list = Array.from(new Set(ids.filter((x) => x !== null && x !== undefined))).map(Number)
    if (list.length === 0) return { ports, fingerprints, names }
    const ph = list.map(() => '?').join(',')
    for (const row of db.prepare(`SELECT p.asset_id, p.port, p.proto, p.state, p.provenance, p.banner, p.url, p.title,
        s.name AS service, s.product, s.version
      FROM port p LEFT JOIN service s ON s.port_id = p.id
      WHERE p.asset_id IN (${ph}) ORDER BY p.asset_id, p.port`).all(...list)) {
      const key = Number(row.asset_id)
      if (!ports.has(key)) ports.set(key, [])
      ports.get(key).push(row)
    }
    for (const row of db.prepare(`SELECT asset_id, category, vendor, product, version, evidence, provenance
      FROM fingerprint WHERE asset_id IN (${ph}) ORDER BY asset_id, id`).all(...list)) {
      const key = Number(row.asset_id)
      if (!fingerprints.has(key)) fingerprints.set(key, [])
      fingerprints.get(key).push(row)
    }
    for (const row of db.prepare(`SELECT asset_id, name, kind, provenance
      FROM asset_name WHERE asset_id IN (${ph}) ORDER BY asset_id, id`).all(...list)) {
      const key = Number(row.asset_id)
      if (!names.has(key)) names.set(key, [])
      names.get(key).push(row)
    }
    return { ports, fingerprints, names }
  }

  /**
   * 단일 자산 → 행 구조.
   * @param db - 대상 라이브러리 핸들.
   * @param a - asset 테이블의 행.
   * @param children - 선택 사항: assetChildren() 의 사전 조회 결과. **넘기면 추가 조회가 0**;
   *                   넘기지 않으면 단일 자산 조회로 돌아갑니다(상세 페이지는 한 번만 쓰므로 N+1 영향 없음).
   */
  assetRow(db, a, children = null) {
    let ports
    let fingerprints
    let names
    if (children !== null) {
      const key = Number(a.id)
      ports = children.ports.get(key) || []
      fingerprints = children.fingerprints.get(key) || []
      names = children.names.get(key) || []
    } else {
      ports = db.prepare(`SELECT p.port, p.proto, p.state, p.provenance, p.banner, p.url, p.title,
          s.name AS service, s.product, s.version
        FROM port p LEFT JOIN service s ON s.port_id = p.id
        WHERE p.asset_id = ? ORDER BY p.port`).all(a.id)
      fingerprints = db.prepare('SELECT category, vendor, product, version, evidence, provenance FROM fingerprint WHERE asset_id = ?').all(a.id)
      names = db.prepare('SELECT name, kind, provenance FROM asset_name WHERE asset_id = ?').all(a.id)
    }
    return {
      id: a.id, ip: a.ip, segment_cidr: a.segment_cidr, state: a.state,
      primary_name: a.primary_name, first_seen: a.first_seen, last_seen: a.last_seen,
      discovered_at: a.discovered_at || a.first_seen || null,
      test_status: a.test_status || 'untested', test_notes: a.test_notes || '',
      test_surface: a.test_surface || '', test_updated_at: a.test_updated_at || null,
      test_updated_by: a.test_updated_by || null, blocked_count: a.blocked_count || 0,
      priority: a.priority || null, potential: a.potential || '', assess_reason: a.assess_reason || '',
      assessed_at: a.assessed_at || null, assessed_by: a.assessed_by || null,
      scope: a.scope || scopeOfIp(a.ip),
      open_ports: ports.filter((p) => p.state === 'open').length,
      ports, fingerprints, names,
      passive: ports.filter((p) => p.provenance === 'passive').length,
      active: ports.filter((p) => p.provenance === 'active').length,
    }
  }


  listAssets(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.cidr) { where.push('a.segment_cidr = ?'); args.push(f.cidr) }
    if (f.state) { where.push('a.state = ?'); args.push(f.state) }
    if (f.ip) { where.push('a.ip = ?'); args.push(f.ip) }
    if (f.port) { where.push('EXISTS (SELECT 1 FROM port p WHERE p.asset_id = a.id AND p.port = ?)'); args.push(Number(f.port)) }
    if (f.service) {
      where.push('EXISTS (SELECT 1 FROM port p JOIN service s ON s.port_id = p.id WHERE p.asset_id = a.id AND (s.name LIKE ? OR s.product LIKE ?))')
      args.push(`%${f.service}%`, `%${f.service}%`)
    }
    if (f.fingerprint) {
      where.push('EXISTS (SELECT 1 FROM fingerprint fp WHERE fp.asset_id = a.id AND (fp.product LIKE ? OR fp.vendor LIKE ? OR fp.category LIKE ?))')
      args.push(`%${f.fingerprint}%`, `%${f.fingerprint}%`, `%${f.fingerprint}%`)
    }
    if (f.provenance) {
      where.push('EXISTS (SELECT 1 FROM port p WHERE p.asset_id = a.id AND p.provenance = ?)')
      args.push(f.provenance)
    }
    if (f.priority) {
      where.push('a.priority = ?')
      args.push(f.priority)
    }
    if (f.test_status) {
      /* 다중 값 지원: test_status=abandoned,blocked */
      const list = String(f.test_status).split(',').map((x) => x.trim()).filter(Boolean)
      if (list.length > 1) {
        where.push(`COALESCE(a.test_status, 'untested') IN (${list.map(() => '?').join(',')})`)
        args.push(...list)
      } else {
        where.push("COALESCE(a.test_status, 'untested') = ?")
        args.push(f.test_status)
      }
    }
    /* 내외부망 축: internal | external (구 데이터는 마이그레이션 시 백필됨) */
    if (f.scope) {
      where.push(`COALESCE(a.scope, (${SCOPE_SQL})) = ?`)
      args.push(f.scope)
    }
    if (f.q) {
      const terms = String(f.q).split(/\s+/).filter(Boolean)
      if (terms.length) {
        if (HAS_FTS5) {
          /* 주 도메인(asset.primary_name)은 asset_fts 색인에 **들어 있지 않습니다** (FTS 표에는
             ip / names / banners / titles / fingerprints 만 있습니다), MATCH 만으로는 주 도메인을 찾을 수 없습니다 ——
             예를 들어 "portal.example.test" 로 조회하면 0 건입니다. 여기서 LIKE 를 함께 걸어 잡아내고,
             LIKE 로는 매칭되지만 FTS 토큰 분할로는 매칭되지 않는 경우도 덤으로 포괄합니다. */
          where.push('(a.id IN (SELECT CAST(asset_id AS INTEGER) FROM asset_fts WHERE asset_fts MATCH ?)'
            + ' OR a.primary_name LIKE ?)')
          args.push(terms.map((t) => `"${t.replace(/"/g, '""')}"*`).join(' AND '), '%' + String(f.q) + '%')
        } else {
          /* FTS5 가 없는 Node 빌드: 부분 문자열 매칭으로 퇴화합니다.
             의미론은 FTS 보다 약합니다 (접두사/어간 분할 없음, LIKE 는 ASCII 대소문자만 무시),
             그래도 **검색이 오류를 내지 않고 내용을 찾을 수 있습니다**, "패널 전체가 안 열립니다"보다 훨씬 낫습니다.
             검색 면은 #reindex 가 asset_fts 에 넣는 것과 같습니다:
             자산 IP / 주 도메인 + asset_name + port.banner/title/url + service + fingerprint. */
          const sub = [
            'EXISTS(SELECT 1 FROM asset_name n WHERE n.asset_id = a.id AND n.name LIKE ?)',
            'EXISTS(SELECT 1 FROM port p WHERE p.asset_id = a.id AND (p.banner LIKE ? OR p.title LIKE ? OR p.url LIKE ?))',
            'EXISTS(SELECT 1 FROM service s JOIN port p2 ON p2.id = s.port_id WHERE p2.asset_id = a.id'
              + ' AND (s.name LIKE ? OR s.product LIKE ? OR s.version LIKE ?))',
            'EXISTS(SELECT 1 FROM fingerprint f WHERE f.asset_id = a.id'
              + ' AND (f.vendor LIKE ? OR f.product LIKE ? OR f.version LIKE ? OR f.category LIKE ?))',
          ]
          const binds = (t) => ['%' + t + '%', '%' + t + '%', '%' + t + '%', '%' + t + '%',
            '%' + t + '%', '%' + t + '%', '%' + t + '%',
            '%' + t + '%', '%' + t + '%', '%' + t + '%', '%' + t + '%']
          for (const t of terms) {
            where.push('(a.ip LIKE ? OR a.primary_name LIKE ? OR ' + sub.join(' OR ') + ')')
            args.push('%' + t + '%', '%' + t + '%', ...binds(t))
          }
        }
      }
    }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const total = db.prepare(`SELECT COUNT(*) AS n FROM asset a ${clause}`).get(...args).n
    const limit = Math.min(Number(f.limit) || 200, 2000)
    const offset = Number(f.offset) || 0
    const openPorts = "COALESCE((SELECT COUNT(*) FROM port p WHERE p.asset_id = a.id AND p.state = 'open'), 0)"
    /* 정렬: 기본은 “가장 먼저 칠 것을 앞으로” —— 공략 난이도 낮음 → 미테스트 → 포트 많음; sort=ip / sort=ports 로 전환 가능 */
    const sort = f.sort || 'priority'
    let orderBy = 'a.ip_int'
    if (sort === 'ports') orderBy = `${openPorts} DESC, a.ip_int`
    /* 발견 시각 내림차순: 새로 수집된 자산을 앞에 (“방금 무엇을 발견했나”가 가장 직관적) */
    else if (sort === 'discovered') orderBy = `COALESCE(a.discovered_at, a.first_seen, '') DESC, a.id DESC`
    else if (sort === 'todo') {
      /* 미테스트 우선: 이번 라운드에 아직 칠 수 있는 것을 위로 올리고, 테스트 완료/포기는 아래로 내립니다 */
      orderBy = `CASE COALESCE(a.test_status, 'untested')
          WHEN 'untested' THEN 0 WHEN 'testing' THEN 1 WHEN 'tested' THEN 2
          WHEN 'blocked' THEN 3 WHEN 'abandoned' THEN 4 WHEN 'no_surface' THEN 5 ELSE 6 END,
        CASE COALESCE(a.priority, '') WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 ELSE 3 END,
        ${openPorts} DESC, a.ip_int`
    } else if (sort === 'priority') {
      orderBy = `CASE COALESCE(a.priority, '') WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 ELSE 3 END,
        CASE COALESCE(a.test_status, 'untested')
          WHEN 'untested' THEN 0 WHEN 'testing' THEN 1 WHEN 'tested' THEN 2
          WHEN 'blocked' THEN 3 WHEN 'abandoned' THEN 4 WHEN 'no_surface' THEN 5 ELSE 6 END,
        ${openPorts} DESC, a.ip_int`
    }
    const rows = db.prepare(`SELECT a.*, ${openPorts} AS open_port_count FROM asset a ${clause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
      .all(...args, limit, offset)
    /* 한 번 프리페치 후 행별 조립: 3N 개 쿼리를 3 개로 압축 (기본 N 은 최대 400) */
    const children = this.assetChildren(db, rows.map((r) => r.id))
    return { total, sort, items: rows.map((r) => this.assetRow(db, r, children)) }
  }

  getAsset(id, assetId) {
    const db = this.db(id)
    const a = db.prepare('SELECT * FROM asset WHERE id = ?').get(Number(assetId))
    if (!a) return undefined
    const detail = this.assetRow(db, a)
    detail.observations = db.prepare(`SELECT attr, value, provenance, tool, collected_at FROM observation
      WHERE entity_kind = 'asset' AND entity_id = ? ORDER BY collected_at DESC LIMIT 200`).all(a.id)
    detail.edges = db.prepare(`SELECT src_kind, src_id, dst_kind, dst_id, relation, confidence FROM edge
      WHERE (src_kind = 'asset' AND src_id = ?) OR (dst_kind = 'asset' AND dst_id = ?)`).all(String(a.id), String(a.id))
    return detail
  }

  /** 그래프 투영: C 세그먼트 → 자산 → 열린 포트 (+ 도메인 해석 관계). */
  graph(id, f = {}) {
    const db = this.db(id)
    const nodes = []
    const edges = []
    const seen = new Set()
    const push = (node) => { if (!seen.has(node.id)) { seen.add(node.id); nodes.push(node) } }
    const segs = f.cidr
      ? db.prepare('SELECT * FROM segment WHERE cidr = ?').all(f.cidr)
      : db.prepare('SELECT * FROM segment').all()
    for (const s of segs) {
      push({ id: `seg:${s.cidr}`, kind: 'segment', label: s.cidr, meta: { org: s.org, asn: s.asn } })
      for (const a of db.prepare('SELECT * FROM asset WHERE segment_cidr = ? ORDER BY ip_int').all(s.cidr)) {
        const nid = `asset:${a.id}`
        const ports = db.prepare("SELECT COUNT(*) AS n FROM port WHERE asset_id = ? AND state = 'open'").get(a.id).n
        push({ id: nid, kind: 'asset', label: a.ip, meta: { state: a.state, name: a.primary_name, ports, segment: a.segment_cidr } })
        edges.push({ source: `seg:${s.cidr}`, target: nid, relation: 'contains' })
        for (const p of db.prepare('SELECT id, port, proto, provenance FROM port WHERE asset_id = ? AND state = ?').all(a.id, 'open')) {
          const pid = `port:${p.id}`
          push({ id: pid, kind: 'port', label: `${p.port}/${p.proto}`, meta: { provenance: p.provenance, asset: a.ip } })
          edges.push({ source: nid, target: pid, relation: 'exposes' })
        }
        if (a.primary_name) {
          const did = `name:${a.primary_name}`
          push({ id: did, kind: 'domain', label: a.primary_name, meta: {} })
          edges.push({ source: did, target: nid, relation: 'resolves' })
        }
      }
    }
    return { nodes, edges }
  }

  /* ---------- 채점 목표 (공방 훈련 채점 항목 + 채점 기록) ---------- */

  /** 대상 라이브러리를 처음 열 때 기본 채점 항목을 심습니다 (이미 있으면 건드리지 않습니다). */
  /** 작전 단계: 처음 읽을 때 기본 5단계를 보충 심습니다 (채점 항목과 같은 정책, 기존 대상도 자동 획득). */
  seedStages(id) {
    const db = this.db(id)
    /* 자가 치유 보충: 빠진 것만 채웁니다 (이전 버전 마이그레이션에서 잘못 삭제된 단계가 자동 복구됩니다) */
    const have = new Set(db.prepare('SELECT code FROM stage').all().map((r) => r.code))
    if (DEFAULT_STAGES.every((st) => have.has(st.code))) return { seeded: 0 }
    let order = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS n FROM stage').get().n + 1
    const stmt = db.prepare(`INSERT INTO stage(code, name, subtitle, color, goal, sections, tools, transition, sort_order, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`)
    let seeded = 0
    for (const st of DEFAULT_STAGES) {
      if (have.has(st.code)) continue
      stmt.run(st.code, st.name, st.subtitle, st.color, st.goal, JSON.stringify(st.sections),
        st.tools, st.transition, order++, nowIso())
      seeded += 1
    }
    return { seeded: seeded }
  }

  listStages(id) {
    const db = this.db(id)
    this.seedStages(id)
    return db.prepare('SELECT * FROM stage ORDER BY sort_order, code').all().map((r, i) => ({
      code: r.code, name: r.name, subtitle: r.subtitle || '', color: r.color || '#64748b',
      goal: r.goal || '', sections: parseJson(r.sections, []), tools: r.tools || '',
      transition: r.transition || '',
      /* 체인 안의 실제 위치(몇 번째 단계): UI 의 ①②③ 표시와 보고서 정렬이 모두 이 값을 쓰므로 따로 번호를 매기지 않습니다 */
      ordinal: i + 1,
      updated_at: r.updated_at || null,
    }))
  }

  /** 단계 내용 편집 (이름/목표/수단 그룹/도구/ATT&CK/전환 문구). */
  saveStage(id, patch = {}) {
    const db = this.db(id)
    if (!patch.code) throw new Error('stage.code required')
    const cur = db.prepare('SELECT * FROM stage WHERE code = ?').get(String(patch.code))
    db.prepare(`INSERT INTO stage(code, name, subtitle, color, goal, sections, tools, transition, sort_order, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(code) DO UPDATE SET
        name = excluded.name, subtitle = excluded.subtitle, color = excluded.color, goal = excluded.goal,
        sections = excluded.sections, tools = excluded.tools,
        transition = excluded.transition, updated_at = excluded.updated_at`).run(
      String(patch.code),
      patch.name ?? (cur ? cur.name : String(patch.code)),
      patch.subtitle ?? (cur ? cur.subtitle : ''),
      patch.color ?? (cur ? cur.color : '#64748b'),
      patch.goal ?? (cur ? cur.goal : ''),
      patch.sections !== undefined ? JSON.stringify(patch.sections) : (cur ? cur.sections : '[]'),
      patch.tools ?? (cur ? cur.tools : ''),
      patch.transition ?? (cur ? cur.transition : ''),
      patch.sort_order ?? (cur ? cur.sort_order : 0),
      nowIso(),
    )
    return { code: String(patch.code), updated: true }
  }

  seedScorePoints(id) {
    const db = this.db(id)
    const insert = (point, order) => db.prepare(`INSERT INTO score_point
        (code, name, category, points, description, enabled, sort_order, created_at, updated_at,
         src, rule, tier, cap, dedup_scope, legacy, builtin)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      point.code, point.name, point.category, point.points, point.description,
      point.enabled === 0 ? 0 : 1, order, nowIso(), nowIso(),
      point.src ?? null,
      point.rule ?? null, point.tier ?? null, point.cap ?? 0, point.dedup_scope || 'service', point.legacy === 1 ? 1 : 0,
      /* 내장 항목: 규칙과 함께 배포되며, 점수/기준이 잠겨 있고 삭제 불가 */
      point.legacy === 1 ? 0 : 1,
    )
    const have = new Set(db.prepare('SELECT code FROM score_point').all().map((r) => String(r.code)))

    /* ── 내장 항목 표시 백필 + 기존 라이브러리 정리 (옛 채점 항목 전체 폐기)────────────────────────
       백필: 기존 라이브러리의 builtin 컬럼은 막 만들면 전부 0 이므로, code 명단에 따라 내장 항목을 다시 표시합니다.
       정리 기준: **내장 명단에 있는 옛 code 만 정리합니다** —— 즉 구버전이 패키지에 포함해 배포하던 기본 항목
       (web-account-* / webshell / rce / server-shell / db-access / sensitive-data /
       boundary / internal-pivot / core-system 등)과 그 과거 적중.

       ⚠️ "내장 여부" 판정은 **반드시 builtin 컬럼으로** 합니다, "현재 기본 명단에 있는지"로 판정하면 안 됩니다:
       사용자가 직접 만든 채점 항목이 구 체계의 잔재로 취급되어, 다음 번 채점 패널을 읽을 때 적중 기록과 함께 조용히 삭제되고,
       그런데 saveScorePoint 는 그대로 ok 를 반환하고 화면도 그대로 “저장됨”을 띄웁니다.

       ⚠️ 되돌릴 수 없습니다: 정리 전에 삭제될 채점 항목과 적중 기록을 **<대상>/runs/legacy-score-<시간>.json** 으로 내보내
       한 번 보관해 두고(보고서/감사에서 여전히 조회 가능), 그다음에 삭제합니다. */
    const builtinCodes = DEFAULT_SCORE_POINTS.map((x) => x.code)
    const keep = new Set(builtinCodes)
    try {
      const ph = builtinCodes.map(() => '?').join(',')
      db.prepare('UPDATE score_point SET builtin = 1 WHERE code IN (' + ph + ')').run(...builtinCodes)
    } catch { /* 기존 라이브러리 구조 이상: 채점에는 영향 없음, 다음에 심을 때 재시도 */ }
    let purgedPoints = 0
    let purgedHits = 0
    try {
      const doomed = db.prepare('SELECT id, code, name, category, points, legacy, builtin FROM score_point').all()
        .filter((r) => !keep.has(String(r.code)) && (Number(r.legacy) === 1 || Number(r.builtin) === 1))
      if (doomed.length > 0) {
        const ids = doomed.map((r) => r.id)
        const ph = ids.map(() => '?').join(',')
        const hits = db.prepare(`SELECT * FROM score_hit WHERE point_id IN (${ph})`).all(...ids)
        if (hits.length > 0) {
          /* 보관: 대상 디렉터리의 runs/ 아래에 두고, 다른 증거와 같은 자리에 모읍니다 */
          try {
            const dir = join(this.dirOf(id), 'runs')
            mkdirSync(dir, { recursive: true })
            const stamp = nowIso().replace(/[:.]/g, '-')
            writeFileSync(join(dir, 'legacy-score-' + stamp + '.json'),
              JSON.stringify({
                archived_at: nowIso(),
                reason: '“침입 돌파 유형 채점 규칙(통합판)”에 따라 재구성: 옛 채점 항목 전체 폐기',
                points: doomed, hits,
              }, null, 2), 'utf8')
          } catch { /* 보관 실패는 정리를 막지 않지만, 사실대로 기록합니다 */ }
        }
        db.prepare(`DELETE FROM score_hit WHERE point_id IN (${ph})`).run(...ids)
        db.prepare(`DELETE FROM score_point WHERE id IN (${ph})`).run(...ids)
        purgedPoints = doomed.length
        purgedHits = hits.length
      }
    } catch { /* 표가 아직 없음 등 예외: 무시하고 심기를 막지 않습니다 */ }

    /* 내장 채점 항목의 **규칙 메타데이터 동기화**: 규칙 문서가 바뀌면 (카테고리 그룹, 상한, 채점 기준, 등급 설명,
       조항 본문), 여기서 그것을 이미 존재하는 행에 동기화해야 합니다.
       왜 반드시 해야 하는가: 예전에는 code 기준으로 "빠진 것만 보충"했기 때문에, category 를 바꾼 항목이 기존 라이브러리에서
       옛 값을 그대로 들고 있었습니다 —— 패널은 category 로 그룹을 나누므로 같은 분류가 두 그룹으로 쪼개지고
       (예: NETINFRA 와 "네트워크 인프라"가 각각 한 그룹), 마치 분류가 두 개 늘어난 것처럼 보입니다.

       ⚠️ 점수/상한/기준은 **규칙이 잠급니다** (builtin=1), 사용자가 바꿀 수 없습니다: 이것은 "의도적 덮어쓰기"일 뿐 아니라
       **반드시** 필요한 일입니다 —— 같은 rule 의 cap 은 규칙 내 모든 항목의 합으로 계산되는데, 단일 항목 점수를 바꿀 수 있게 두면
       사용자가 50 을 500 으로 바꾸면 한 건의 적중으로 규칙 전체 상한을 다 먹어버릴 수 있습니다.
       그래서 내장 항목의 name/category/description 과 그룹 전체의 rule/tier/cap/dedup_scope/points
       를 모두 여기서 일괄 동기화합니다; **“사용/중지”는 여전히 사용자가 제어하며, 여기서 덮어쓰지 않습니다**.
       UI 측은 이를 근거로 내장 점수의 배점 입력 상자를 비활성화합니다(overridden:false 를 반환해 화면이 이유를 안내할 수 있게 합니다).

       사용자가 배점을 직접 정의하려면 **점수를 새로 추가**하세요(builtin=0) — 그 항목은 여기서 덮어쓰지 않고,
       위의 구 체계 정리에서도 지워지지 않습니다. */
    let synced = 0
    if (have.size > 0) {
      const upd = db.prepare(`UPDATE score_point SET name = ?, category = ?, points = ?, description = ?,
          src = ?, rule = ?, tier = ?, cap = ?, dedup_scope = ?, builtin = 1, updated_at = ?
        WHERE code = ? AND legacy = 0`)
      for (const point of DEFAULT_SCORE_POINTS) {
        if (!have.has(point.code)) continue
        try {
          const r = upd.run(point.name, point.category, point.points, point.description,
            point.src ?? null,
            point.rule ?? null, point.tier ?? null, point.cap ?? 0, point.dedup_scope || 'service',
            nowIso(), point.code)
          if (r.changes > 0) synced += 1
        } catch { /* 단건 실패는 무시합니다 */ }
      }
    }

    /* 빠진 것은 채웁니다: 새 규칙과 실수로 지운 기본 점수는 이 한 줄로 자가 복구됩니다 */
    const missing = DEFAULT_SCORE_POINTS.filter((p) => !have.has(p.code))
    if (missing.length > 0) {
      let order = db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM score_point').get().n
      for (const point of missing) insert(point, order++)
    }
    if (missing.length === 0 && purgedPoints === 0 && synced === 0) return { seeded: 0 }
    return {
      seeded: missing.length,
      /* 이번에 정리한 구 점수와 적중 건수(패널/도구가 "구 기준은 폐기됨"을 알리는 근거) */
      purgedLegacyPoints: purgedPoints,
      purgedLegacyHits: purgedHits,
      purged: purgedPoints > 0,
    }
  }

  listScorePoints(id, f = {}) {
    const db = this.db(id)
    /* 항상 시딩을 한 번 돌립니다: 멱등이며 동시에 세 가지를 맡습니다 —
       ① 빈 라이브러리의 최초 시딩, ② 새 규칙/실수로 지운 점수의 자가 복구 보충, ③ 구 라이브러리의 구 기본 점수를 legacy 로 표시(v0.11.0 마이그레이션).
       ⚠️ 예전에는 "점수가 하나도 없을 때"만 호출해서 구 라이브러리(이미 구 점수가 있음)는 영원히 마이그레이션되지 않았습니다. */
    this.seedScorePoints(id)
    /* **배점이 낮은 것부터** 표시합니다(같은 배점은 정의 순서 유지) — 사용자가 배점 크기로 먼저 칠 대상을 판단하는 편이 직관적입니다 */
    const rows = db.prepare('SELECT * FROM score_point ORDER BY COALESCE(points, 0) ASC, sort_order ASC, id ASC').all()
    const hits = db.prepare('SELECT * FROM score_hit ORDER BY recorded_at DESC, id DESC').all()
    /* 자산 IP: 경보와 적중 기록에서 어떤 서비스인지 바로 보여야 합니다(asset_ip:port) */
    const assetIp = new Map(db.prepare('SELECT id, ip FROM asset').all().map((a) => [a.id, a.ip]))
    const codeOf = new Map(rows.map((r) => [r.id, r.code]))
    /* 기본 배점은 점수 정의에서 가져옵니다. 적중에 points 가 실려 있으면 적중 값이 우선합니다(통합판의 다단계 채점) */
    const pointsOf = new Map(rows.map((r) => [r.id, Number(r.points) || 0]))
    /* 적중 행의 유효 배점: 등급 배점 × 배율(배율은 scoreMultiplierOf / hitPointsOf 참고) */
    const effPointsOf = (h) => hitPointsOf(
      { points: h.points, multiplier: h.multiplier, code: codeOf.get(h.point_id) },
      new Map([[String(codeOf.get(h.point_id)), { points: pointsOf.get(h.point_id) || 0 }]]),
    )
    const byPoint = new Map()
    for (const h of hits) {
      if (!byPoint.has(h.point_id)) byPoint.set(h.point_id, [])
      byPoint.get(h.point_id).push(h)
    }
    /* 채점 기준과 규칙 상한(데이터 기반, applyScoreCaps 참고):
       · dedup_scope 는 "같은 대상/같은 시스템/같은 서비스는 최고 한 건만 계산"인지, 대수/카드 수로 누적하는지를 정합니다.
       · rule + cap 은 해당 규칙의 누적 상한을 정합니다.
       직접 만든 계정은 경쟁에도 참여하지 않고 자리도 차지하지 않습니다(애초에 채점하지 않습니다). */
    /* 메타데이터와 평가는 모두 공용 구현(evaluateScoreBoard)을 씁니다: 패널 / 보고서 / 공격 체인 세 곳이
       각자 구현하면 기준이 어긋나 총점이 맞지 않습니다. */
    const pointsMeta = new Map(rows.map((r) => [String(r.code), {
      rule: r.rule === null || r.rule === undefined ? null : Number(r.rule),
      cap: Number(r.cap) || 0,
      dedup_scope: r.dedup_scope || 'service',
      points: Number(r.points) || 0,
      enabled: r.enabled === null || r.enabled === undefined ? 1 : Number(r.enabled),
      builtin: Number(r.builtin) === 1,
      src: r.src === null || r.src === undefined ? null : Number(r.src),
    }]))
    const nameOf = loadAssetNames(db)
    const cappedAll = evaluateScoreBoard(db, hits.map((h) => Object.assign({}, h, {
      code: codeOf.get(h.point_id), points: effPointsOf(h),
    })), { meta: pointsMeta, names: nameOf })
    const cappedById = new Map(cappedAll.items.map((h) => [h.id, h]))
    const enabled = rows.filter((r) => r.enabled === 1)
    const enabledIds = new Set(enabled.map((r) => r.id))
    /* 이 점수가 "같은 기준은 최고 한 건만" 중복 제거에 참여하는지(화면의 "상한 도달" 안내용) */
    const isCappedPoint = (pid) => {
      const meta = pointsMeta.get(codeOf.get(pid))
      return meta !== undefined && meta.dedup_scope !== 'none' && meta.dedup_scope !== null
    }
    const items = rows
      .filter((r) => f.enabledOnly !== true || r.enabled === 1)
      .map((r) => {
        const list = (byPoint.get(r.id) || []).map((h) => {
          const flag = cappedById.get(h.id)
          const capped = flag !== undefined && flag.capped === true
          const hit = {
            id: h.id, asset_id: h.asset_id, vuln_id: h.vuln_id, step_id: h.step_id,
            target: h.target, evidence: h.evidence, note: h.note,
            points: effPointsOf(h), points_overridden: h.points !== null && h.points !== undefined,
            port: normalizePort(h.port) ?? parseTargetPort(h.target),
            self_created: Number(h.self_created) === 1,
            capped: capped,
            capped_by_id: capped ? flag.capped_by_id : null,
            capped_reason: capped ? scoreCapReasonText(Object.assign({}, h, {
              code: r.code, asset_ip: assetIp.get(h.asset_id),
              rule: flag.rule ?? null, rule_cap: flag.rule_cap || 0, capped_reason_kind: flag.capped_reason_kind,
            }), flag.capped_by_points) : null,
            capped_reason_kind: capped ? flag.capped_reason_kind : null,
            recorded_by: h.recorded_by, recorded_at: h.recorded_at,
          }
          hit.service = serviceLabel(Object.assign({}, hit, { asset_ip: assetIp.get(h.asset_id) }))
          if (capped) hit.capped_by = flag.capped_by_evidence ?? null
          return hit
        })
        /* 상한이 없는 점수: 적중 횟수 × 배점을 누적합니다.
           직접 만든 계정(self_created)은 채점하지 않고, 계정류/데이터베이스류는 서비스별 상한으로 최고 한 건만 계산합니다. */
        const valid = list.filter((h) => h.self_created !== true)
        const countedList = valid.filter((h) => h.capped !== true)
        const counted = countedList.length
        const cappedList = valid.filter((h) => h.capped === true)
        const meta = pointsMeta.get(r.code) || { rule: null, cap: 0, dedup_scope: 'service' }
        const capUsed = meta.rule === null ? null : cappedAll.caps.get('rule:' + meta.rule)
        const scopeLabel = { service: '같은 서비스는 최고 한 건만 계산', system: '같은 시스템은 최고 권한 한 번만 계산', target: '대상 전체에서 한 번만 계산', none: '대수 / 카드 / 노드 수로 누적' }[meta.dedup_scope] || ''
        return {
          id: r.id, code: r.code, name: r.name, category: r.category, points: r.points,
          rule: meta.rule, tier: r.tier || null, cap: meta.cap || 0, dedup_scope: meta.dedup_scope,
          /* src = “통합판”의 원래 번호(대조용), builtin = 규칙과 함께 배포되는 내장 점수(배점 고정, 삭제 불가).
             화면은 이를 근거로 내장 점수의 배점 입력 상자를 비활성화하고 이유를 표시합니다. */
          src: r.src === null || r.src === undefined ? null : Number(r.src),
          builtin: Number(r.builtin) === 1,
          legacy: Number(r.legacy) === 1,
          counted: counted,
          /* "적중에 반영된 실제 배점"으로 누적합니다 — 통합 후 같은 code 에 여러 등급이 있어 기본 배점 × 횟수로는 안 됩니다 */
          earned: countedList.reduce((n, h) => n + (Number(h.points) || 0), 0),
          self_created: list.length - valid.length,
          capped: cappedList.length,
          capped_hits: cappedList,
          /* 규칙 상한 사용량(같은 rule 의 점수가 공유; 화면은 규칙별로 "사용 / 상한"을 표시) */
          cap_used: capUsed ? capUsed.used : null,
          cap_capped: capUsed ? capUsed.capped : 0,
          scope_label: scopeLabel,
          service_summary: (meta.dedup_scope !== 'none' && cappedList.length > 0)
            ? '채점 기준 “' + scopeLabel + '”: ' + counted + '건 도달, 그 밖에 중복 적중 ' + cappedList.length + '건은 채점하지 않음'
            : null,
          description: r.description || '', enabled: r.enabled === 1, sort_order: r.sort_order,
          hits: list,
        }
      })

    /* ── 증거 스크린샷: 점수마다 대표 이미지를 최대 3장 붙인다 ─────────────
       대량 점수(단말 권한 60대 한 번에)를 건마다 이미지로 붙이면 정보도 없고 화면만 터집니다.
       그래서 "점수" 단위로 대표 이미지를 주고, 건별로 보고 싶으면 적중 행에 그 건의 스크린샷 수를 표시합니다.
       선택 우선순위는 #representativeShots 참고(적중 등급 > 대상 등급 > 점수 등급, 현장 스크린샷 > 생성된 증거 카드). */
    const shotPicks = this.#representativeShots(id, items.map((it) => ({
      point_id: it.id, point_code: it.code, hit_ids: (it.hits || []).map((h) => h.id),
    })), 3)
    const shotCountByPoint = new Map()
    const shotCountByHit = new Map()
    try {
      for (const row of db.prepare('SELECT point_id, hit_id, COUNT(*) AS n FROM shot GROUP BY point_id, hit_id').all()) {
        if (row.point_id !== null && row.point_id !== undefined) {
          shotCountByPoint.set(Number(row.point_id), (shotCountByPoint.get(Number(row.point_id)) || 0) + Number(row.n))
        }
        if (row.hit_id !== null && row.hit_id !== undefined) shotCountByHit.set(Number(row.hit_id), Number(row.n))
      }
    } catch { /* 구 라이브러리에 shot 테이블이 없으면 무시합니다 */ }
    const shotBrief = (x) => ({
      id: Number(x.id), url: this.shotUrlOf(id, x), label: x.label || '', note: x.note || '',
      kind: x.kind || 'screenshot', mime: x.mime || 'image/png', bytes: Number(x.bytes) || 0,
      target: x.target || '', captured_at: x.captured_at || '', source_ref: x.source_ref || '',
    })
    for (const it of items) {
      const picked = shotPicks.get(Number(it.id)) || []
      it.shots = picked.map(shotBrief)
      it.shot_total = shotCountByPoint.get(Number(it.id)) || 0
      it.shot_shown = picked.length
      for (const h of (it.hits || [])) h.shot_count = shotCountByHit.get(Number(h.id)) || 0
    }

    /* 정렬: **득점한 항목이 앞**(한눈에 전과 확인), 미득점은 뒤.
       두 그룹 내부는 모두 배점 오름차순(같은 배점은 정의 순서라 결과가 안정적이고 예측 가능). */
    const achievedRank = (it) => (it.hits.length > 0 ? 0 : 1)
    const sortedItems = items.slice().sort((a, b) => {
      const ra = achievedRank(a); const rb = achievedRank(b)
      if (ra !== rb) return ra - rb
      const pa = Number(a.points) || 0; const pb = Number(b.points) || 0
      if (pa !== pb) return pa - pb
      return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0)
    })

    /* ── 통합판의 8개 분류로 묶습니다(일반 시스템 제어 / Web 애플리케이션 / 중앙 집권 / 빅데이터 /
       네트워크 인프라 / 파일 스토리지 / 모델 관련 / 네트워크 경계 돌파)────────────────────
       패널과 보고서 모두 이 분류로 보여줍니다: 사용자가 보는 것이 곧 규칙 문서의 구조입니다.
       그룹 내부는 배점 오름차순(items 는 이미 정렬됨), 그룹 순서는 SCORE_GROUPS 의 정의 순서. */
    const groupOrder = new Map(SCORE_GROUPS.map((g, i) => [g.code, i]))
    const groupName = new Map(SCORE_GROUPS.map((g) => [g.code, g.name]))
    const ruleGroups = []
    const gmap = new Map()
    for (const it of sortedItems) {
      if (it.legacy) continue
      const code = it.category || 'OTHER'
      if (!gmap.has(code)) {
        const g = {
          key: code, code,
          name: groupName.get(code) || code,
          /* 해당 분류의 모든 항목 상한 합계(참고값일 뿐 — 항목별 상한은 독립이며 항목 간 누적은 없습니다, G3 참고) */
          capSum: 0, points: 0, counted: 0, capped: 0, tiers: [],
          order: groupOrder.has(code) ? groupOrder.get(code) : 99,
        }
        gmap.set(code, g); ruleGroups.push(g)
      }
      const g = gmap.get(code)
      g.capSum += Number(it.cap) || 0
      g.points += it.earned
      g.counted += it.counted
      g.capped += it.capped
      g.tiers.push(it)
    }
    ruleGroups.sort((a, b) => a.order - b.order)
    /* 그룹 내부에서 한 번 더 정렬합니다(호출자가 순서를 바꿨을 때 대비): 득점 우선, 그다음 배점 오름차순 */
    for (const g of ruleGroups) {
      g.tiers.sort((a, b) => {
        const ra = achievedRank(a); const rb = achievedRank(b)
        if (ra !== rb) return ra - rb
        return (Number(a.points) || 0) - (Number(b.points) || 0)
      })
    }
    const legacyItems = items.filter((it) => it.legacy)
    const legacyHits = legacyItems.reduce((n, p) => n + p.hits.length, 0)
    const enabledItems = items.filter((p) => p.enabled)
    const cappedItems = cappedAll.items.filter((h) => h.capped === true && (codeOf.get(h.point_id) !== undefined) && enabledIds.has(h.point_id))
    const latestCapped = cappedItems.length === 0 ? null : cappedItems.slice().sort((a, b) => {
      const sa = String(a.recorded_at || '') + '#' + String(a.id).padStart(8, '0')
      const sb = String(b.recorded_at || '') + '#' + String(b.id).padStart(8, '0')
      return sb.localeCompare(sa)
    })[0]
    return {
      items: sortedItems,
      ruleGroups,
      summary: {
        /* 상한 없음: 점수 = 적중 횟수 × 배점, 누적하면 됩니다 */
        achievedPoints: enabledItems.reduce((n, p) => n + p.earned, 0),
        /* 점수 개수(화면은 이 값을 표시하며, 더 이상 "N개 확보"라고 하지 않습니다) */
        pointCount: enabledItems.length,
        hitPointCount: enabledItems.filter((p) => p.counted > 0).length,
        hitCount: items.reduce((n, p) => n + p.hits.length, 0),
        countedHits: enabledItems.reduce((n, p) => n + p.counted, 0),
        /* 직접 등록/생성해서 제외된 적중 수(화면에 따로 알려 "기록했는데 점수가 없습니다"라는 혼동을 막습니다) */
        selfCreatedHits: items.reduce((n, p) => n + p.self_created, 0),
        /* "채점 기준 중복 제거"나 "규칙 상한 도달"로 채점하지 않은 건수(화면에 따로 알려 "기록했는데 점수가 없습니다"라는 혼동을 막습니다) */
        serviceCappedHits: cappedItems.length,
        cappedByDedup: cappedItems.filter((h) => h.capped_reason_kind === 'dedup').length,
        cappedByRuleLimit: cappedItems.filter((h) => h.capped_reason_kind === 'cap').length,
        /* legacy(구 기준) 점수와 적중: 화면에서 접어서 표시하고, 새 기준 총점에는 합산하지 않습니다 */
        legacyPointCount: legacyItems.length,
        legacyHitCount: legacyHits,
        latestCapped: latestCapped === null ? null : {
          hit_id: latestCapped.id,
          point_id: latestCapped.point_id,
          code: latestCapped.code,
          service: serviceLabel(Object.assign({}, latestCapped, { asset_ip: assetIp.get(latestCapped.asset_id) })),
          evidence: latestCapped.evidence,
          points: latestCapped.points,
          recorded_at: latestCapped.recorded_at,
          reason: serviceCapReason(Object.assign({}, latestCapped, { asset_ip: assetIp.get(latestCapped.asset_id) }), latestCapped.capped_by_points),
        },
      },
    }
  }

  /** 점수를 추가하거나 갱신합니다(id 가 있으면 갱신, 없으면 추가). 점수 분류에 **개수 상한은 없고** 배점만 기록합니다. */
  /**
   * 점수를 저장합니다.
   *
   * 두 경로의 차이가 크므로 반환 구조에서 `builtin` / `overridden` / `locked_fields` 로 분명히 알립니다:
   *   · **내장 점수**(builtin=1, “침입 돌파 유형 채점 규칙”과 함께 배포): 배점/상한/채점 기준/이름이
   *     규칙으로 고정되며 “사용/중지”만 바꿀 수 있습니다. **배점 변경을 막는 것은 규율 문제가 아닙니다 —**
   *     같은 rule 의 cap 은 그룹 내 모든 점수를 누적하므로, 한 항목의 배점만 바꿔도 한 건의 적중이 그룹 상한을 통째로 먹을 수 있습니다.
   *     여기서도 `ok` 를 반환하지만(사용 상태는 실제로 저장되었습니다), `overridden:false` 로
   *     호출자에게 "제출한 배점은 채택되지 않았습니다"를 분명히 알리고, 화면은 그 이유를 안내합니다(저장 성공으로 꾸미지 않습니다).
   *   · **사용자 자체 점수**(builtin=0): 모든 필드를 바꿀 수 있고 시딩 로직에도 지워지지 않습니다.
   */
  saveScorePoint(id, point = {}) {
    const db = this.db(id)
    const enabled = point.enabled === false ? 0 : 1
    /* name 필수 검증은 **내장 점수 분기 뒤에** 둡니다: 내장 점수는 enabled / sort_order 만 받고,
       호출자(화면 토글, 도구는 사용 상태만 변경)는 원래 name 을 되돌려줄 의무가 없습니다.
       앞에 두면 "내장 점수를 중지하려는 것뿐"인데 name required 로 실패합니다. */
    const name = String(point.name || '').trim()
    /* max_hits 컬럼은 구 라이브러리 구조 호환용으로만 남겨 둡니다. 채점에는 쓰지 않습니다(항상 1로 기록) */
    if (point.id !== undefined && point.id !== null && Number(point.id) > 0) {
      const pid = Number(point.id)
      const row = db.prepare('SELECT id, code, name, points, cap, rule, tier, dedup_scope, builtin, legacy FROM score_point WHERE id = ?').get(pid)
      if (row === undefined) throw new Error('score point not found: id=' + pid)
      if (Number(row.builtin) === 1 || Number(row.legacy) === 1) {
        /* 내장 점수: enabled / sort_order 만 반영하고, 나머지 필드는 seedScorePoints 가 규칙에 맞춰 동기화합니다 */
        db.prepare('UPDATE score_point SET enabled = ?, sort_order = COALESCE(?, sort_order), updated_at = ? WHERE id = ?')
          .run(enabled, point.sort_order ?? null, nowIso(), pid)
        const after = db.prepare('SELECT * FROM score_point WHERE id = ?').get(pid)
        return {
          id: pid, updated: true, builtin: true,
          points: after.points, cap: after.cap, rule: after.rule,
          overridden: Number(point.points) === Number(after.points),
          locked_fields: ['name', 'category', 'points', 'cap', 'rule', 'tier', 'dedup_scope', 'description'],
          note: '이것은 “침입 돌파 유형 채점 규칙”과 함께 배포되는 내장 점수입니다: 배점, 상한, 채점 기준, 이름과 조항 본문은'
            + '모두 규칙으로 고정됩니다(같은 규칙의 상한은 그룹 내 모든 점수를 누적하므로, 개별 배점을 바꾸면 한 건의 적중이 그룹 상한을 통째로 먹습니다).'
            + '수정한 “사용/중지”는 저장했습니다. 배점을 직접 정하려면 **점수를 새로 추가**하세요.',
        }
      }
      if (name === '') throw new Error('score point name required')
      const points = Number.isFinite(Number(point.points)) ? Number(point.points) : 0
      db.prepare(`UPDATE score_point SET name = ?, category = ?, points = ?, description = ?, enabled = ?,
          sort_order = COALESCE(?, sort_order), updated_at = ? WHERE id = ?`)
        .run(name, point.category ?? null, points, point.description ?? null, enabled,
          point.sort_order ?? null, nowIso(), pid)
      return { id: pid, updated: true, builtin: false, overridden: true, points, note: '저장했습니다(자체 점수)' }
    }
    if (name === '') throw new Error('score point name required')
    const points = Number.isFinite(Number(point.points)) ? Number(point.points) : 0
    const next = db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM score_point').get().n
    /* 자체 점수가 내장 점수와 같은 code 를 가질 수 있습니다(패널은 기본적으로 이름으로 생성): code 에는 UNIQUE 제약이 있으므로
       충돌하면 다른 값으로 바꿔 "추가 실패인데 화면에서 이유를 알 수 없는" 상황을 막습니다. */
    let code = point.code === undefined || point.code === null || String(point.code).trim() === ''
      ? null
      : String(point.code).trim()
    if (code !== null && db.prepare('SELECT id FROM score_point WHERE code = ?').get(code) !== undefined) {
      code = code + '-custom-' + Date.now().toString(36)
    }
    const r = db.prepare(`INSERT INTO score_point(code, name, category, points, description, enabled, sort_order, created_at, updated_at, builtin)
      VALUES(?,?,?,?,?,?,?,?,?,0)`).run(
      code, name, point.category ?? null, points, point.description ?? null, enabled,
      next, nowIso(), nowIso(),
    )
    return {
      id: Number(r.lastInsertRowid), code, updated: false, builtin: false, overridden: true,
      points, note: '자체 점수를 추가했습니다(규칙 배점 고정의 영향을 받지 않고, 구 체계 정리에서도 삭제되지 않습니다)',
    }
  }

  /** 점수를 삭제합니다. 내장 점수는 삭제할 수 없습니다(패널에서 규칙이 하나 빠지고, 다음 시딩에서 다시 생깁니다). */
  deleteScorePoint(id, pointId) {
    const db = this.db(id)
    const pid = Number(pointId)
    const row = db.prepare('SELECT id, code, name, builtin FROM score_point WHERE id = ?').get(pid)
    if (row === undefined) throw new Error('score point not found: id=' + pid)
    if (Number(row.builtin) === 1) {
      throw new Error('내장 점수는 삭제할 수 없습니다: “' + (row.name || row.code) + '” 은(는) “침입 돌파 유형 채점 규칙(통합판)”에서 오며,'
        + '삭제하면 패널에서 규칙이 하나 빠지고 보고서에서 성과 한 종류가 사라집니다(다음 시작 시 자동으로 복구됩니다).'
        + '채점에서 빼려면 “중지”를 쓰세요.')
    }
    db.prepare('DELETE FROM score_hit WHERE point_id = ?').run(pid)
    db.prepare('DELETE FROM score_point WHERE id = ?').run(pid)
    return { deleted: pid }
  }

  /**
   * 이 점수가 어느 포트에 속하는지(서비스 단위 상한의 기준).
   *   ① 명시적 `port`(도구 인자);
   *   ② `target` 안의 포트(http://h:8080/x → 8080, 10.0.0.5:6379 → 6379);
   *   ③ 해당 자산에 포트가 하나만 등록되어 있으면 그 값(80/443 을 추측해 넣지 않아 서로 다른 서비스가 합쳐지지 않습니다).
   */
  #servicePortOf(db, hit = {}) {
    const explicit = normalizePort(hit.port)
    if (explicit !== null) return explicit
    const fromTarget = parseTargetPort(hit.target)
    if (fromTarget !== null) return fromTarget
    const assetId = hit.asset_id === null || hit.asset_id === undefined || hit.asset_id === '' ? null : Number(hit.asset_id)
    if (assetId === null) return null
    try {
      const ports = db.prepare('SELECT port FROM port WHERE asset_id = ? ORDER BY port').all(assetId)
      if (ports.length === 1) return normalizePort(ports[0].port)
    } catch { /* 무시 */ }
    return null
  }

  /** 점수 한 건을 기록합니다(특정 점수가 특정 대상에서 확보됨). */
  addScoreHit(id, hit = {}) {
    const db = this.db(id)
    /* 점수가 아직 시딩되지 않았을 수 있습니다(새 대상 생성 직후 바로 채점): 먼저 멱등 시딩을 한 번 돌립니다.
       그러지 않으면 "score point not found" 로 실패하는데, 실제 원인은 기본 점수가 아직 기록되지 않은 것입니다. */
    this.seedScorePoints(id)
    let pointId = hit.point_id !== undefined && hit.point_id !== null ? Number(hit.point_id) : null
    /* code 로 점수를 찾습니다(가장 흔함). 구 code 는 구 점수 항목과 함께 폐기되었습니다(v0.11.1):
       여기서 **조용히 다른 점수로 돌려보내지 않습니다** — 돌려보낼 대상 자체가 없을 수 있고, 조용히 삼키면 사용자는
       "기록했는데 점수가 없습니다"라면서 원인을 찾을 수 없습니다. 찾지 못하면 아래 point not found 오류로 떨어지고,
       오류 안에서 redteam_score_list 로 새 code 를 확인하라고 알립니다. */
    if (pointId === null && hit.code) {
      const row = db.prepare('SELECT id FROM score_point WHERE code = ?').get(String(hit.code))
      if (row !== undefined) pointId = row.id
    }
    if (pointId === null && hit.point_name) {
      const row = db.prepare('SELECT id FROM score_point WHERE name = ?').get(String(hit.point_name))
      if (row !== undefined) pointId = row.id
    }
    if (pointId === null) {
      throw new Error('score point not found: 채점 규칙은 “침입 돌파 유형 채점 규칙(통합판)”에 따라 25개 항목으로 재구성되었고,'
        + '구 code(web-account-*, webshell, rce, server-shell, db-access, sensitive-data, boundary, internal-pivot, core-system 등)는 폐기되었습니다.'
        + '먼저 redteam_score_list 로 실제 code 를 읽거나, point_id / point_name 으로 지정하세요.')
    }
    const evidence = String(hit.evidence || '').trim()
    if (evidence === '') throw new Error('score hit evidence required: 점수에는 증거를 반드시 적어야 합니다(계정/출력/데이터 규모/경로)')
    /* 직접 등록/생성한 계정: 기록은 허용하지만(과정 보존) 채점하지 않습니다 */
    const selfCreated = hit.self_created === true || hit.self_created === 1 || hit.self_created === '1' ? 1 : 0
    const port = this.#servicePortOf(db, hit)
    /* 이 적중의 실제 배점: 호출자가 명시할 수 있습니다(통합판은 같은 항목에 여러 등급이 있습니다. 예: "관리자 50").
       지정하지 않으면 NULL 로 기록하고, 채점 시 점수의 기본 points 로 되돌아갑니다.

       ⚠️ 경계 검증은 필수입니다: `points` 는 "특정 등급의 배점"이지 자유롭게 적는 가산점이 아닙니다.
       검증이 없으면 `points=999999999` 가 그대로 기록되어 총점이 9자리로 뛰고,
       `points=-500` 은 총점을 끌어내립니다 — 둘 다 납품 보고서의 숫자를 무의미하게 만듭니다.
       상한은 “해당 규칙 상한”과 “기본 배점의 100배” 중 큰 값으로 잡습니다:
       전자는 한 건의 적중이 규칙 전체 상한을 혼자 넘지 못하게 하고,
       후자는 기본 배점이 작은 항목(예: 단말 5점/대)에 합리적인 등급 여지를 남깁니다. */
    const pointMeta = db.prepare('SELECT points, cap FROM score_point WHERE id = ?').get(pointId) || {}
    const pointsMax = Math.max(Number(pointMeta.cap) || 0, (Number(pointMeta.points) || 0) * 100, 1000)
    let hitPoints = null
    if (hit.points !== undefined && hit.points !== null && hit.points !== '') {
      const n = Number(hit.points)
      if (!Number.isFinite(n)) {
        throw new Error('score hit points invalid: points 는 유한한 숫자여야 합니다(받은 값 ' + JSON.stringify(hit.points) + ')')
      }
      if (n <= 0) {
        throw new Error('score hit points invalid: points 는 0보다 커야 합니다(받은 값 ' + n + ').'
          + '배점은 “침입 돌파 유형 채점 규칙”의 등급대로 적고, 이 값으로 점수를 조정하지 마세요.')
      }
      if (n > pointsMax) {
        throw new Error('score hit points invalid: points=' + n + ' 은(는) 이 점수의 합리적 상한 ' + pointsMax
          + '(= max(규칙 상한 ' + (Number(pointMeta.cap) || 0) + ', 기본 배점 ' + (Number(pointMeta.points) || 0)
          + ' × 100))을 넘습니다. 규칙 등급대로 적거나 점수의 배점 설정을 고치세요.')
      }
      hitPoints = n
    }
    /* G5 / G6 배율: 데이터 규모 2배, IPv6 ×3. 권한 점수에 적용되며 상한과 함께 cap 제약을 받습니다. */
    const mult = scoreMultiplierOf(hit)
    const r = db.prepare(`INSERT INTO score_hit(point_id, asset_id, vuln_id, step_id, target, evidence, note, self_created, port, recorded_by, recorded_at, points, multiplier)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      pointId, hit.asset_id ?? null, hit.vuln_id ?? null, hit.step_id ?? null,
      hit.target ?? null, evidence, hit.note ?? null, selfCreated, port,
      hit.recorded_by ?? null, nowIso(), hitPoints, mult.multiplier,
    )
    const hitId = Number(r.lastInsertRowid)
    const point = db.prepare('SELECT name, points, code FROM score_point WHERE id = ?').get(pointId)
    const board = this.listScorePoints(id)
    const summary = board.summary
    const allHits = board.items.flatMap((p) => p.hits)
    const row = allHits.find((h) => h.id === hitId)
    /* 서비스 단위 상한: 같은 자산 같은 포트는 배점이 가장 높은 한 건만 계산합니다(계정류 / 데이터베이스 권한) */
    const cappedByService = selfCreated === 0 && row !== undefined && row.capped === true
    const capService = row === undefined ? null : row.service
    const capBy = row === undefined ? null : (row.capped_by || null)
    const capByPoints = row === undefined || row.capped_by_id === null || row.capped_by_id === undefined
      ? null
      : (allHits.find((h) => h.id === row.capped_by_id) || {}).points
    /* 반대로, 이 건이 같은 서비스에서 원래 채점되던 적중을 밀어냈는지(그래서 총점이 늘지 않습니다).
       "이번 삽입 이후에도 상한에 걸린 대상"을 기준으로 삼아, "앞서 다른 중복 적중에 한 번 밀린" 상태의 간섭을 피합니다. */
    const demoted = selfCreated === 0 && row !== undefined && row.capped !== true
      ? allHits.filter((h) => h.capped_by_id === hitId && Number(h.id) < hitId)
      : []
    const warnings = []
    if (selfCreated === 1) {
      warnings.push('기록했습니다. 다만 **직접 등록/직접 생성한 계정은 채점하지 않습니다**(실습 점수는 "남이 이미 가진 계정/권한을 확보"한 경우를 대상으로 합니다). 이 건은 과정 기록만 남기고 상한을 차지하지 않으며 보고서에도 들어가지 않습니다.')
    }
    /* G5 “대량 데이터 포함 시스템은 점수 2배”에는 규모 근거가 필요합니다: 기준은 **1억 건 / 10TB**.
       판별할 수 없을 때는 **경고만 하고 막지 않습니다** — 데이터 규모는 evidence 가 아니라 보고서 본문에 있는 경우가 많아
       강하게 막으면 실제 성과를 문 밖에 두게 됩니다. 다만 반드시 보충을 알립니다(그러지 않으면 2배 근거가 서지 않습니다). */
    if (mult.multiplier > 1 && mult.reasons.some((x) => x.indexOf('G5') === 0)) {
      const rows = parseRowCount(evidence)
      if (rows === null) {
        warnings.push('주의: 이 건은 G5 에 따라 “데이터 규모 2배”로 기록했지만 evidence 에서 **데이터 규모를 알 수 없습니다**.'
          + 'evidence 에 실제 규모를 적어 주세요(예: “사용자 데이터 1.3억 건 추출” 또는 “학습 데이터 12TB”). 그러지 않으면 이 2배 근거가 서지 않습니다.')
      } else if (rows < SENSITIVE_DATA_MIN_ROWS) {
        warnings.push('주의: 이 건은 G5 에 따라 2배로 기록했지만 evidence 의 규모는 **' + formatRows(rows) + ' 건/행**으로,'
          + '“대량 데이터 시스템” 기준(문서상 1억 건 초과 또는 10TB)에 크게 못 미칩니다. 데이터 규모를 확인하고, 실제로 1억 건 이상이라면'
          + '더 분명한 표기(예: “1.32억 건”)로 evidence 에 적어 주세요.')
      }
    }
    if (cappedByService) {
      const assetIp = row.asset_id === null || row.asset_id === undefined
        ? undefined
        : (db.prepare('SELECT ip FROM asset WHERE id = ?').get(Number(row.asset_id)) || {}).ip
      warnings.push(serviceCapReason(Object.assign({}, row, { code: point ? point.code : '', asset_ip: assetIp }), capByPoints))
      if (capBy) warnings.push('채점된 것은 같은 서비스의 다른 건입니다: ' + String(capBy).slice(0, 120))
    } else if (demoted.length > 0) {
      warnings.push('주의: 이 건이 같은 서비스에서 배점이 더 낮은 기존 적중 ' + demoted.length + '건을 밀어냈습니다 — **같은 자산 같은 포트는 한 번만 계산**하므로 이번 기록으로 총점은 늘지 않습니다(기존 적중은 미채점으로 전환).')
    }
    return {
      id: hitId, point_id: pointId,
      point: point ? point.name : null,
      /* 단일 등급 배점과 최종 반영 배점을 따로 줍니다: 배율 덕분에 "50점이 어떻게 150점이 되었는지" 설명할 수 있습니다 */
      base_points: hitPoints === null ? (point ? point.points : 0) : hitPoints,
      multiplier: mult.multiplier,
      multiplier_reasons: mult.reasons.length > 0 ? mult.reasons : undefined,
      points: Math.round((hitPoints === null ? (point ? point.points : 0) : hitPoints) * mult.multiplier),
      port: port,
      service: capService,
      /* G5 규모 대조 결과(G5 로 채점하지 않은 항목은 null): 화면/모델이 "2배 근거가 있는지"를 한눈에 보게 합니다 */
      volume: mult.reasons.some((x) => x.indexOf('G5') === 0)
        ? (() => {
            const rows = parseRowCount(evidence)
            return { rows: rows, min_rows: SENSITIVE_DATA_MIN_ROWS, meets_threshold: rows === null ? null : rows >= SENSITIVE_DATA_MIN_ROWS }
          })()
        : null,
      self_created: selfCreated === 1,
      counted: selfCreated === 0 && !cappedByService,
      capped_by_service: cappedByService,
      capped_by: capBy,
      demoted_hits: demoted.map((h) => ({ id: h.id, evidence: h.evidence, points: h.points })),
      warning: warnings.length === 0 ? undefined : warnings.join('\n'),
      summary,
    }
  }

  /** 자산 공략 용이성 평가: 어떤 성과를 얻을 수 있는지, 우선순위가 얼마인지. */
  assessAsset(id, a = {}) {
    const db = this.db(id)
    let row
    if (a.asset_id !== undefined && a.asset_id !== null) row = db.prepare('SELECT * FROM asset WHERE id = ?').get(Number(a.asset_id))
    else if (a.ip) row = db.prepare('SELECT * FROM asset WHERE ip = ?').get(String(a.ip))
    if (row === undefined) throw new Error('asset not found(asset_id 또는 ip 를 넘기세요)')
    const priority = ['high', 'medium', 'low'].includes(a.priority) ? a.priority : (row.priority || 'medium')
    const stamp = nowIso()
    db.prepare('UPDATE asset SET priority = ?, potential = ?, assess_reason = ?, assessed_at = ?, assessed_by = ? WHERE id = ?')
      .run(priority, a.potential ?? (row.potential || ''), a.reason ?? (row.assess_reason || ''), stamp, a.assessed_by ?? null, row.id)
    this.#observe(db, 'asset', row.id, 'assess', priority + ' ' + (a.potential || ''), 'active', a.assessed_by ?? null, null)
    return { asset_id: row.id, ip: row.ip, priority, potential: a.potential ?? (row.potential || ''), assessed_at: stamp }
  }

  /* ---------- 자산 테스트 상태(어떤 테스트를 했는지 / 남은 공격면은 무엇인지) ---------- */

  /**
   * 특정 자산에 대한 테스트 상황을 기록합니다.
   * @param id - 대상 id.
   * @param t - `{ asset_id?, ip?, status?, test?, surface?, blocked?, updated_by? }`
   *   · test 는 테스트 기록에 **추가**됩니다(타임스탬프 포함);
   *   · surface 는 “남은 테스트 가능 공격면”을 덮어씁니다;
   *   · blocked=true 이면 차단 카운트 +1.
   */
  updateAssetTest(id, t = {}) {
    const db = this.db(id)
    let row
    if (t.asset_id !== undefined && t.asset_id !== null) {
      row = db.prepare('SELECT * FROM asset WHERE id = ?').get(Number(t.asset_id))
    } else if (t.ip) {
      row = db.prepare('SELECT * FROM asset WHERE ip = ?').get(String(t.ip))
    }
    if (row === undefined) throw new Error('asset not found(asset_id 또는 ip 를 넘기세요)')
    const status = ['untested', 'testing', 'tested', 'blocked', 'abandoned', 'no_surface'].includes(t.status)
      ? t.status
      : (row.test_status || 'untested')
    const stamp = nowIso()
    /* 프롬프트가 예전에 이 기록을 notes 라고 불렀고 모델도 그 인자명을 그대로 쓰는 일이 많습니다: 두 표기를 모두 받아
       test_notes(추가 방식)로 통일합니다. "결론 한 줄을 적었습니다"라는데 실제로 아무것도 기록되지 않는 일을 막습니다. */
    const testText = [t.test, t.notes]
      .filter((x) => typeof x === 'string' && x.trim() !== '')
      .map((x) => x.trim())
      .join(';')
    let notes = row.test_notes || ''
    if (testText !== '') {
      notes = (notes === '' ? '' : notes.replace(/\n+$/, '') + '\n') + '[' + stamp + '] ' + testText
    }
    const surface = typeof t.surface === 'string' ? t.surface : (row.test_surface || '')
    const blockedCount = (row.blocked_count || 0) + (t.blocked === true ? 1 : 0)
    db.prepare(`UPDATE asset SET test_status = ?, test_notes = ?, test_surface = ?,
        test_updated_at = ?, test_updated_by = ?, blocked_count = ? WHERE id = ?`).run(
      status, notes, surface, stamp, t.updated_by ?? null, blockedCount, row.id,
    )
    if (testText !== '') {
      this.#observe(db, 'asset', row.id, 'test', testText, 'active', t.updated_by ?? null, null)
    }
    if (t.blocked === true) {
      this.#observe(db, 'asset', row.id, 'blocked', blockedCount + '번째 차단됨', 'active', t.updated_by ?? null, null)
    }
    return {
      asset_id: row.id, ip: row.ip, status, blocked_count: blockedCount,
      test_notes: notes, tests: notes, surface, updated_at: stamp,
      hint: blockedCount >= 3
        ? '누적 차단 ' + blockedCount + '회(>3회 기준): 이번 호출에서 status 를 abandoned 로 바꾸고 남은 공격면을 적은 뒤 다른 대상으로 옮기세요.'
        : undefined,
    }
  }

  /** 테스트 상태 통계(개요와 필터링용). */
  testStats(id) {
    const db = this.db(id)
    const rows = db.prepare("SELECT COALESCE(test_status, 'untested') AS s, COUNT(*) AS n FROM asset GROUP BY s").all()
    const out = { untested: 0, testing: 0, tested: 0, blocked: 0, abandoned: 0, no_surface: 0 }
    for (const r of rows) out[r.s] = r.n
    return out
  }

  /* ---------- 취약점 / 자격 증명 / 접근 세션 ---------- */

  /** 취약점 한 건을 기록합니다. cve 가 있으면 (asset_id, cve, target) 기준으로 멱등 갱신합니다. */
  addVuln(id, v = {}) {
    const db = this.db(id)
    const severity = SEVERITIES.includes(v.severity) ? v.severity : 'info'
    const status = VULN_STATUSES.includes(v.status) ? v.status : 'candidate'
    const existing = v.cve
      ? db.prepare("SELECT id FROM vuln WHERE asset_id IS ? AND cve = ? AND COALESCE(target, '') = ?")
        .get(v.asset_id ?? null, v.cve, v.target ?? '')
      : db.prepare("SELECT id FROM vuln WHERE asset_id IS ? AND COALESCE(cve, '') = '' AND title = ? AND COALESCE(target, '') = ?")
        .get(v.asset_id ?? null, v.title ?? '', v.target ?? '')
    if (existing !== undefined) {
      db.prepare(`UPDATE vuln SET
          title = COALESCE(?, title), severity = ?, status = COALESCE(?, status),
          evidence = COALESCE(?, evidence), confidence = COALESCE(?, confidence),
          source = COALESCE(?, source), target = COALESCE(?, target),
          found_by_agent = COALESCE(?, found_by_agent), gained = COALESCE(?, gained),
          agent = COALESCE(?, agent)
        WHERE id = ?`).run(
        v.title ?? null, severity, v.status ?? null, v.evidence ?? null, v.confidence ?? null,
        v.source ?? null, v.target ?? null, v.found_by_agent ?? null, normGained(v.gained),
        v.agent ?? null, existing.id,
      )
      return { id: existing.id, updated: true }
    }
    const result = db.prepare(`INSERT INTO vuln(asset_id, port_id, cve, title, severity, source, confidence, status, evidence, target, gained, found_by_agent, found_at, agent)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      v.asset_id ?? null, v.port_id ?? null, v.cve ?? null, v.title ?? null, severity,
      v.source ?? null, v.confidence ?? null, status, v.evidence ?? null, v.target ?? null,
      normGained(v.gained), v.found_by_agent ?? null, nowIso(), v.agent ?? null,
    )
    const vulnId = Number(result.lastInsertRowid)
    if (v.asset_id !== undefined && v.asset_id !== null) {
      this.#observe(db, 'asset', v.asset_id, 'vuln', [v.cve, v.title].filter(Boolean).join(' '), 'active', v.source ?? null, null)
    }
    return { id: vulnId, updated: false }
  }

  listVulns(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.severity) { where.push('v.severity = ?'); args.push(f.severity) }
    if (f.status) { where.push('v.status = ?'); args.push(f.status) }
    if (f.cve) { where.push('v.cve LIKE ?'); args.push(`%${f.cve}%`) }
    if (f.asset_id !== undefined && f.asset_id !== null) { where.push('v.asset_id = ?'); args.push(Number(f.asset_id)) }
    if (f.cidr) { where.push('a.segment_cidr = ?'); args.push(f.cidr) }
    if (f.q) {
      where.push('(v.title LIKE ? OR v.cve LIKE ? OR v.target LIKE ? OR v.evidence LIKE ?)')
      const like = `%${f.q}%`
      args.push(like, like, like, like)
    }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const limit = Math.min(Number(f.limit) || 200, 1000)
    const total = db.prepare(`SELECT COUNT(*) AS n FROM vuln v LEFT JOIN asset a ON a.id = v.asset_id ${clause}`).get(...args).n
    const items = db.prepare(`SELECT v.*, a.ip AS asset_ip, a.segment_cidr
      FROM vuln v LEFT JOIN asset a ON a.id = v.asset_id ${clause}
      ORDER BY CASE v.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END,
               v.id DESC LIMIT ?`).all(...args, limit)
    /* 상세 화면에서 원본 요청/응답을 바로 보여줘야 하므로 여기 함께 담습니다(요청 본문이 클 수 있어 길이를 제한합니다) */
    const clipped = (t) => (t === null || t === undefined ? null : (String(t).length > 60000 ? String(t).slice(0, 60000) + '\n…(잘림)' : String(t)))
    const evidenceById = new Map(items.map(item => [item.id, []]))
    // Bound SQL variable counts across SQLite builds; avoid one query per row.
    for (let offset = 0; offset < items.length; offset += 200) {
      const ids = items.slice(offset, offset + 200).map(item => item.id)
      const evidence = db.prepare(`SELECT vuln_id, id, label, method, url, status, request, response, note, captured_by, captured_at
        FROM http_evidence WHERE vuln_id IN (${ids.map(() => '?').join(',')}) ORDER BY vuln_id, id`).all(...ids)
      for (const {vuln_id, ...entry} of evidence) evidenceById.get(vuln_id).push({
        ...entry, request: clipped(entry.request), response: clipped(entry.response),
      })
    }
    for (const item of items) item.http_evidence = evidenceById.get(item.id)
    return { total, items }
  }

  updateVuln(id, vulnId, patch = {}) {
    const db = this.db(id)
    const current = db.prepare('SELECT * FROM vuln WHERE id = ?').get(Number(vulnId))
    if (current === undefined) return { updated: false }
    db.prepare(`UPDATE vuln SET status = ?, severity = ?, evidence = COALESCE(?, evidence), confidence = COALESCE(?, confidence),
        gained = COALESCE(?, gained), title = COALESCE(?, title)
      WHERE id = ?`).run(
      VULN_STATUSES.includes(patch.status) ? patch.status : current.status,
      SEVERITIES.includes(patch.severity) ? patch.severity : current.severity,
      patch.evidence ?? null, patch.confidence ?? null, normGained(patch.gained), patch.title ?? null, Number(vulnId),
    )
    return { updated: true, id: Number(vulnId) }
  }

  vulnStats(id) {
    const db = this.db(id)
    const bySeverity = {}
    for (const row of db.prepare('SELECT severity, COUNT(*) AS n FROM vuln GROUP BY severity').all()) bySeverity[row.severity] = row.n
    const byStatus = {}
    for (const row of db.prepare('SELECT status, COUNT(*) AS n FROM vuln GROUP BY status').all()) byStatus[row.status] = row.n
    /* "어떤 권한을 얻었는지"가 적혀 있는 취약점 수: 결론 줄에 씁니다 */
    const withGained = db.prepare("SELECT COUNT(*) AS n FROM vuln WHERE COALESCE(gained,'') <> ''").get().n
    const withEvidence = db.prepare("SELECT COUNT(*) AS n FROM vuln WHERE COALESCE(evidence,'') <> '' OR id IN (SELECT vuln_id FROM http_evidence WHERE vuln_id IS NOT NULL)").get().n
    /* 대상별 집계에 필요한 그룹 수(취약점 페이지 기본 보기): 먼저 “사이트/서비스”로 묶고 나서 셉니다 */
    const rawTargets = db.prepare(`SELECT target, (SELECT ip FROM asset WHERE id = vuln.asset_id) AS ip FROM vuln`).all()
    const targetGroups = new Set(rawTargets.map((r) => targetKey(r.target, r.ip))).size
    return {
      total: Object.values(bySeverity).reduce((a, b) => a + b, 0),
      bySeverity, byStatus, withGained, withEvidence, targetGroups,
    }
  }

  /** 자격 증명: 평문을 secret_value 에 쓰고(패널이 그대로 표시), 증거 파일을 가리키는 secret_ref 도 함께 남깁니다. */
  addCredential(id, c = {}) {
    const db = this.db(id)
    if (!c.host) throw new Error('credential.host required')
    /* 평문 자격 증명: secret_value 를 기준으로 하고, secret / password / value 등 별칭도 허용합니다 */
    const value = c.secret_value ?? c.secret ?? c.password ?? c.value ?? null
    db.prepare(`INSERT INTO credential(asset_id, host, username, secret_type, secret_value, secret_ref, privilege, source, tool, note, found_by_agent, found_at, agent)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(host, username, secret_type) DO UPDATE SET
        secret_value = COALESCE(excluded.secret_value, credential.secret_value),
        secret_ref = COALESCE(excluded.secret_ref, credential.secret_ref),
        privilege = COALESCE(excluded.privilege, credential.privilege),
        note = COALESCE(excluded.note, credential.note),
        agent = COALESCE(excluded.agent, credential.agent),
        found_at = excluded.found_at`).run(
      c.asset_id ?? null, c.host, c.username ?? '', c.secret_type ?? 'password',
      value === null || value === undefined ? null : String(value),
      c.secret_ref ?? null, c.privilege ?? null, c.source ?? null, c.tool ?? null,
      c.note ?? null, c.found_by_agent ?? null, nowIso(), c.agent ?? null,
    )
    const row = db.prepare('SELECT id FROM credential WHERE host = ? AND username = ? AND secret_type = ?')
      .get(c.host, c.username ?? '', c.secret_type ?? 'password')
    return { id: row.id }
  }

  listCredentials(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.host) { where.push('host = ?'); args.push(f.host) }
    if (f.username) { where.push('username = ?'); args.push(f.username) }
    if (f.withValue === true) where.push("COALESCE(secret_value,'') <> ''")
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const limit = Math.min(Number(f.limit) || 200, 1000)
    return db.prepare(`SELECT * FROM credential ${clause} ORDER BY id DESC LIMIT ?`).all(...args, limit)
  }

  /** 접근 세션: 통제 가능한 한 번의 접근(횡적 이동의 출발점). */
  addAccess(id, a = {}) {
    const db = this.db(id)
    if (!a.host) throw new Error('access.host required')
    const result = db.prepare(`INSERT INTO access_session(asset_id, host, username, method, privilege, session_ref, note, found_by_agent, obtained_at)
      VALUES(?,?,?,?,?,?,?,?,?)`).run(
      a.asset_id ?? null, a.host, a.username ?? null, a.method ?? null, a.privilege ?? null,
      a.session_ref ?? null, a.note ?? null, a.found_by_agent ?? null, nowIso(),
    )
    if (a.asset_id !== undefined && a.asset_id !== null) {
      this.#observe(db, 'asset', a.asset_id, 'access', [a.method, a.username, a.privilege].filter(Boolean).join(' '), 'active', 'exploit', null)
    }
    return { id: Number(result.lastInsertRowid) }
  }

  listAccess(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.host) { where.push('host = ?'); args.push(f.host) }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const limit = Math.min(Number(f.limit) || 200, 1000)
    return db.prepare(`SELECT * FROM access_session ${clause} ORDER BY id DESC LIMIT ?`).all(...args, limit)
  }

  /* ---------- WebShell 과 터널: 공략 과정에서 언제든 재사용할 수 있는 자산 ---------- */

  /**
   * 이미 올라간 WebShell 을 등록합니다. 같은 url+pass_key 는 같은 항목으로 보고, 다시 등록하면 갱신합니다.
   * @param w - `{ url, shell_type, pass_key, secret_ref, privilege, status, note, asset_id, found_by_agent }`
   */
  addWebshell(id, w = {}) {
    const db = this.db(id)
    if (!w.url) throw new Error('webshell.url required')
    const ts = nowIso()
    const existing = db.prepare('SELECT id FROM webshell WHERE url = ? AND COALESCE(pass_key, \'\') = COALESCE(?, \'\')')
      .get(w.url, w.pass_key ?? null)
    if (existing !== undefined) {
      db.prepare(`UPDATE webshell SET shell_type = COALESCE(?, shell_type), secret_ref = COALESCE(?, secret_ref),
        privilege = COALESCE(?, privilege), status = COALESCE(?, status), note = COALESCE(?, note),
        asset_id = COALESCE(?, asset_id), agent = COALESCE(?, agent), updated_at = ? WHERE id = ?`)
        .run(normalizeShellType(w.shell_type), w.secret_ref ?? null, w.privilege ?? null, normalizeShellStatus(w.status),
          w.note ?? null, w.asset_id ?? null, w.agent ?? null, ts, existing.id)
      return { id: Number(existing.id), updated: true }
    }
    const result = db.prepare(`INSERT INTO webshell(asset_id, url, shell_type, pass_key, secret_ref, privilege,
      status, note, found_by_agent, created_at, updated_at, agent) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(w.asset_id ?? null, w.url, normalizeShellType(w.shell_type), w.pass_key ?? null, w.secret_ref ?? null,
        w.privilege ?? null, normalizeShellStatus(w.status), w.note ?? null, w.found_by_agent ?? null, ts, ts, w.agent ?? null)
    if (w.asset_id !== undefined && w.asset_id !== null) {
      this.#observe(db, 'asset', w.asset_id, 'webshell', w.url, 'active', 'exploit', null)
    }
    return { id: Number(result.lastInsertRowid), updated: false }
  }

  listWebshells(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.status) { where.push('status = ?'); args.push(f.status) }
    if (f.asset_id) { where.push('asset_id = ?'); args.push(f.asset_id) }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const limit = Math.min(Number(f.limit) || 200, 1000)
    return db.prepare(`SELECT w.*, a.ip AS asset_ip FROM webshell w
      LEFT JOIN asset a ON a.id = w.asset_id ${clause} ORDER BY w.id DESC LIMIT ?`).all(...args, limit)
  }

  updateWebshell(id, wsId, patch = {}) {
    const db = this.db(id)
    const fields = ['status', 'check_note', 'latency_ms', 'last_check', 'privilege', 'note', 'secret_ref', 'shell_type']
    const sets = []
    const args = []
    /* update 경로도 추가 경로와 같은 정규화를 씁니다: 예전에는 여기에 아무 문자열이나 쓸 수 있어
       패널의 "Behinder 웹셸이 아니면 접속 불가" 빨간 표시가 조용히 무력화되었습니다. */
    for (const key of fields) {
      if (patch[key] === undefined) continue
      let value = patch[key]
      if (key === 'shell_type') value = normalizeShellType(value)
      if (key === 'status') value = normalizeShellStatus(value)
      sets.push(`${key} = ?`); args.push(value)
    }
    if (sets.length === 0) throw new Error('nothing to update')
    sets.push('updated_at = ?'); args.push(nowIso())
    const result = db.prepare(`UPDATE webshell SET ${sets.join(', ')} WHERE id = ?`).run(...args, wsId)
    if (result.changes === 0) throw new Error('webshell not found')
    return { updated: true }
  }

  /**
   * 내부망 터널을 등록합니다(suo5 / socks5 / ssh -R / frp …).
   *
   * **판정 규칙**: 대상 경계를 넘은 것(채널 한쪽 끝이 대상 측에 있는 것)만 돌파 증거로 인정합니다.
   *   · target-outbound 대상이 먼저 연결을 내보냄(리버스 셸이 내 서버로 떨어짐 / 대상에서 frp 클라이언트 실행)
   *   · target-http     대상의 WebShell/HTTP 채널 경유(suo5 / Neo-ReGeorg)
   *   · target-agent    대상에서 이미 장악한 프로세스/세션 경유(SSH -R 을 대상이 시작)
   *   · self-only       내 VPS/자체 서버에만 연 프록시나 서버 측 — **돌파로 치지 않습니다**
   * 내 서버에 socks5 를 연 것만으로는 내부망에 들어간 것이 아닙니다. "대상 측의 그 끝이 무엇인지"를 반드시 밝혀야 합니다.
   */
  addTunnel(id, t = {}) {
    const db = this.db(id)
    const ts = nowIso()
    /* entry_kind 는 **경계 돌파 채점의 증거 필드**다: 잘못 쓰면 오류를 내야 하고 조용히 0으로 만들면 안 됩니다.
       인식할 수 없는 값을 NULL 로 쓰면 legit=null 이 되어 화면에 "확인 대기"로 보이고 — "미입력"과 구분되지 않습니다.
       모델이 공백 하나를 더 찍은 것(`target-http `)만으로도 여기에 걸리는데, 나중에는 원인을 전혀 찾을 수 없습니다. */
    const rawEntryKind = t.entry_kind === undefined || t.entry_kind === null ? '' : String(t.entry_kind).trim()
    if (rawEntryKind !== '' && TUNNEL_ENTRY_KINDS[rawEntryKind] === undefined) {
      throw new Error('entry_kind 값이 잘못되었습니다: ' + JSON.stringify(t.entry_kind) + '. 허용되는 값은 '
        + Object.keys(TUNNEL_ENTRY_KINDS).join(' / ') + '(' + Object.values(TUNNEL_ENTRY_KINDS).join(' / ') + ').'
        + ' 비워 두면 "확인 대기"로 처리되어 경계 돌파에 포함되지 않습니다.')
    }
    const result = db.prepare(`INSERT INTO tunnel(asset_id, webshell_id, kind, listen, entry, reach, entry_kind,
      status, pid, command, note, found_by_agent, created_at, updated_at, agent) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(t.asset_id ?? null, t.webshell_id ?? null, t.kind ?? 'socks5', t.listen ?? null, t.entry ?? null,
        t.reach ?? null, rawEntryKind === '' ? null : rawEntryKind, t.status ?? 'active', t.pid ?? null, t.command ?? null, t.note ?? null,
        t.found_by_agent ?? null, ts, ts, t.agent ?? null)
    if (t.asset_id !== undefined && t.asset_id !== null) {
      this.#observe(db, 'asset', t.asset_id, 'tunnel', `${t.kind || 'socks5'} ${t.listen || ''}`.trim(), 'active', 'exploit', null)
    }
    const entryKind = rawEntryKind === '' ? null : rawEntryKind
    const legit = tunnelIsLegit(entryKind)
    return {
      id: Number(result.lastInsertRowid),
      entry_kind: entryKind,
      legit,
      warning: legit === false
        ? '등록했습니다. 다만 entry_kind=self-only(내 VPS/자체 서버에만 연 채널)입니다 — **이것은 터널이 아니고 경계 돌파/내부망 돌파로 치지 않습니다**. 대상 측에서 시작된 채널이어야 합니다: 대상이 내 서버로 리버스 셸을 보내거나, 대상에서 frp 클라이언트를 실행하거나, 대상의 WebShell 로 만든 suo5/HTTP 터널이어야 합니다.'
        : (legit === null
            ? 'entry_kind 를 보충해 "대상 측의 그 끝이 무엇인지"를 밝히세요(target-outbound / target-http / target-agent). 선언하지 않으면 화면에 "확인 대기"로 표시되고 돌파 증거로도 계산되지 않습니다.'
            : undefined),
    }
  }

  listTunnels(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.status) { where.push('t.status = ?'); args.push(f.status) }
    if (f.asset_id) { where.push('t.asset_id = ?'); args.push(f.asset_id) }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const limit = Math.min(Number(f.limit) || 200, 1000)
    return db.prepare(`SELECT t.*, a.ip AS asset_ip, w.url AS webshell_url FROM tunnel t
      LEFT JOIN asset a ON a.id = t.asset_id
      LEFT JOIN webshell w ON w.id = t.webshell_id ${clause} ORDER BY t.id DESC LIMIT ?`).all(...args, limit)
      .map((t) => Object.assign({}, t, { legit: tunnelIsLegit(t.entry_kind), entry_kind_label: TUNNEL_ENTRY_KINDS[t.entry_kind] || null }))
  }

  updateTunnel(id, tId, patch = {}) {
    const db = this.db(id)
    const fields = ['status', 'check_note', 'latency_ms', 'last_check', 'listen', 'reach', 'entry', 'entry_kind', 'pid', 'command', 'note']
    const sets = []
    const args = []
    /* update 경로는 이전에 entry_kind / status 를 **전혀 검증하지 않았습니다**: 추가할 때는 NULL 로 정규화되지만,
       갱신할 때는 아무 문자열이나 그대로 기록되어 legit 판정을 완전히 우회할 수 있었습니다. 여기서 추가 경로와 맞춥니다. */
    const TUNNEL_STATUSES = ['active', 'down', 'closed', 'unknown']
    for (const key of fields) {
      if (patch[key] === undefined) continue
      let value = patch[key]
      if (key === 'entry_kind') {
        const raw = value === null ? '' : String(value).trim()
        if (raw !== '' && TUNNEL_ENTRY_KINDS[raw] === undefined) {
          throw new Error('entry_kind 값이 잘못되었습니다: ' + JSON.stringify(value) + '. 허용되는 값은 '
            + Object.keys(TUNNEL_ENTRY_KINDS).join(' / ') + '.')
        }
        value = raw === '' ? null : raw
      }
      if (key === 'status') {
        const raw = String(value).trim()
        if (!TUNNEL_STATUSES.includes(raw)) {
          throw new Error('tunnel status 값이 잘못되었습니다: ' + JSON.stringify(value) + '. 허용되는 값은 ' + TUNNEL_STATUSES.join(' / ') + ' 입니다.')
        }
        value = raw
      }
      sets.push(`${key} = ?`); args.push(value)
    }
    if (sets.length === 0) throw new Error('nothing to update')
    sets.push('updated_at = ?'); args.push(nowIso())
    const result = db.prepare(`UPDATE tunnel SET ${sets.join(', ')} WHERE id = ?`).run(...args, tId)
    if (result.changes === 0) throw new Error('tunnel not found')
    return { updated: true }
  }

  /**
   * 현재 테스트 패널: 지금 테스트 중인 자산 + 최근에 손댄 자산(각각 확인된 취약점 수/포트 수/입구 수 포함).
   * 공격 체인 페이지의 “현재 테스트 중” 블록이 이것을 쓰고, 클라이언트가 몇 초마다 폴링해 실시간 갱신합니다.
   */
  activeTests(id, f = {}) {
    const db = this.db(id)
    const limit = Math.min(Number(f.limit) || 8, 50)
    const select = `SELECT a.id, a.ip, a.segment_cidr, COALESCE(a.scope, (${SCOPE_SQL})) AS scope, a.state,
        COALESCE(a.test_status, 'untested') AS test_status, a.test_notes, a.test_surface,
        a.test_updated_at, a.test_updated_by, COALESCE(a.blocked_count, 0) AS blocked_count,
        a.priority, a.potential,
        (SELECT COUNT(*) FROM port p WHERE p.asset_id = a.id AND p.state = 'open') AS open_ports,
        (SELECT COUNT(*) FROM vuln v WHERE v.asset_id = a.id AND v.status IN ('confirmed','exploited')) AS vulns,
        (SELECT COUNT(*) FROM webshell w WHERE w.asset_id = a.id) AS webshells,
        (SELECT COUNT(*) FROM tunnel t WHERE t.asset_id = a.id) AS tunnels`
    const testing = db.prepare(`${select} FROM asset a
      WHERE COALESCE(a.test_status, 'untested') = 'testing'
      ORDER BY a.test_updated_at DESC, a.id DESC LIMIT ?`).all(limit)
    /* 최근 손댄 것: 테스트 중인 항목을 제외해 두 블록이 겹치지 않게 합니다 */
    const recent = db.prepare(`${select} FROM asset a
      WHERE a.test_updated_at IS NOT NULL AND COALESCE(a.test_status, 'untested') <> 'testing'
      ORDER BY a.test_updated_at DESC LIMIT ?`).all(limit)
    /* 대기 큐: 아직 손대지 않은 것, 공략 용이성 + 포트 수로 어느 대를 먼저 칠지 정렬 */
    const queue = db.prepare(`${select} FROM asset a
      WHERE COALESCE(a.test_status, 'untested') = 'untested'
      ORDER BY CASE COALESCE(a.priority, '') WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 ELSE 3 END,
        (SELECT COUNT(*) FROM port p WHERE p.asset_id = a.id AND p.state = 'open') DESC, a.ip_int
      LIMIT ?`).all(limit)
    const untested = db.prepare(`SELECT COUNT(*) AS n FROM asset a
      WHERE COALESCE(a.test_status, 'untested') = 'untested'`).get().n
    return { testing, recent, queue, stats: this.testStats(id), untested, at: nowIso() }
  }

  /**
   * 한 점수의 "어떻게 얻었는지": 동작 단계 + 이용한 취약점 + 확보한 자격 증명/입구를 재현 가능한 연결로 엮습니다.
   *
   * 보고서의 "계정 비밀번호가 어떻게 나왔고, 터널을 어떻게 세웠는지"가 여기에 달려 있습니다 — 단계 부족, 명령 부족, 증거 부족은 모두 명시적으로 표시하고,
   * 어떤 성과를 재현할 수 없는지 사용자가 한눈에 보게 합니다. 그럴듯해 보이지만 실제로는 납품할 수 없는 보고서를 주지 않습니다.
   * @param db - 대상 라이브러리 핸들.
   * @param hit - score_hit 행(asset_id / vuln_id / step_id / target / recorded_at / point_code 포함).
   * @returns `{ steps, vuln, credentials, accesses, webshells, tunnels, how, complete, gaps }`
   */
  #hitTrace(db, hit, engagementId) {
    const evidenceDir = engagementId ? this.dirOf(engagementId) : null
    const steps = []
    const stepById = new Map()
    const pushStep = (row) => {
      if (row === undefined || row === null) return
      if (stepById.has(row.id)) {
        const existing = stepById.get(row.id)
        if (existing.inferred === true && row.inferred !== true) existing.inferred = false
        return
      }
      const step = {
        id: row.id, seq: row.seq, stage_code: row.stage_code, title: row.title || '',
        detail: row.detail || '', tool: row.tool || '', result: row.result || '',
        agent: row.agent || row.recorded_by || '', recorded_at: row.recorded_at || null,
        vuln_id: row.vuln_id ?? null, asset_id: row.asset_id ?? null, point_id: row.point_id ?? null,
        evidence_ref: row.evidence_ref || '', inferred: row.inferred === true,
      }
      stepById.set(step.id, step)
      steps.push(step)
    }
    const cols = 'id, seq, stage_code, title, detail, tool, agent, result, asset_id, vuln_id, access_id, point_id, evidence_ref, recorded_at'
    /* 귀속 규칙(정확한 것부터 넓게):
         ① 명시적으로 연결된 단계(score_hit.step_id)
         ② 이 취약점의 단계(vuln_id) — "이 구멍으로 얻은 점수"라면 그 구멍을 친 동작이 보여야 합니다
         ③ 같은 자산 + 같은 점수의 단계(추정)
       위가 모두 없을 때만 "같은 자산의 모든 단계"로 물러나고(보고서가 비지 않게 하려고), 추정으로 표시합니다.
       step_source 가 이번에 어느 등급을 썼는지 그대로 알려 주고, 화면/보고서는 이를 근거로 "참고용"임을 알립니다. */
    let stepSource = null
    try {
      if (hit.step_id !== null && hit.step_id !== undefined) {
        pushStep(db.prepare(`SELECT ${cols} FROM attack_step WHERE id = ?`).get(hit.step_id))
        if (steps.length > 0) stepSource = 'linked'
      }
      if (hit.vuln_id !== null && hit.vuln_id !== undefined) {
        for (const row of db.prepare(`SELECT ${cols} FROM attack_step WHERE vuln_id = ? ORDER BY seq, id`).all(hit.vuln_id)) pushStep(row)
        if (stepSource === null && steps.length > 0) stepSource = 'vuln'
      }
      if (hit.asset_id !== null && hit.asset_id !== undefined && hit.point_id !== null && hit.point_id !== undefined) {
        for (const row of db.prepare(`SELECT ${cols} FROM attack_step WHERE asset_id = ? AND point_id = ? ORDER BY seq, id`).all(hit.asset_id, hit.point_id)) {
          pushStep(Object.assign({}, row, { inferred: true }))
          if (stepSource === null) stepSource = 'point'
        }
      }
      if (steps.length === 0 && hit.asset_id !== null && hit.asset_id !== undefined) {
        for (const row of db.prepare(`SELECT ${cols} FROM attack_step WHERE asset_id = ? ORDER BY seq, id LIMIT 40`).all(hit.asset_id)) {
          pushStep(Object.assign({}, row, { inferred: true }))
        }
        if (steps.length > 0) stepSource = 'asset'
      }
    } catch { /* 구 라이브러리에 컬럼이 없으면 "단계 없음"으로 낮추고, 보고서에는 재현 불가로 표시됩니다 */ }
    steps.sort((a, b) => (a.seq === b.seq ? a.id - b.id : (a.seq ?? 0) - (b.seq ?? 0)))

    /* 이 점수에 쓰인 취약점 */
    let vuln = null
    if (hit.vuln_id !== null && hit.vuln_id !== undefined) {
      try {
        const v = db.prepare('SELECT id, cve, title, severity, status, target, evidence, gained, source, found_by_agent, found_at FROM vuln WHERE id = ?').get(hit.vuln_id)
        if (v !== undefined) vuln = v
      } catch { vuln = null }
    }
    /* ── 자격 증명 / 세션 / 웹셸 / 터널: "이 점수"와 같은 사안일 때만 붙인다 ──────────────
       원래 구현은 asset_id 로만 조회해서, 같은 자산에 등록된 **모든** 자격 증명과 세션이 그 자산의
       모든 점수에 붙었습니다. 실측 결과: “단말 권한 pc-001” 아래에 “MySQL root(설정 파일 노출)”이 붙었습니다 —
       단말과는 아무 관계도 없습니다. 한 자산의 4개 점수가 같은 자격 증명 묶음을 각각 중복 나열해 보고서가 길고 거짓이 되었습니다.
       판정: **이 항목에 target 이 적혀 있으면** target 호스트가 그 자산(IP / 대표 이름)과 맞아야 합니다.
       target 이 없으면(순수 자산 수준 성과. 예: "단말 1대 장악") 자산 기준으로 붙이는 것이 타당합니다. */
    const targetHost = (() => {
      const t = String(hit.target || '').trim()
      if (t === '') return null
      const url = /^([a-z][a-z0-9+.-]*):\/\/(\[[^\]]+\]|[^/?#\s]+)/i.exec(t)
      let authority = url !== null ? url[2] : (/^([^\s/?#]+)/.exec(t) || [])[1]
      if (!authority) return null
      authority = authority.replace(/^\[|\]$/g, '').replace(/:\d{1,5}$/, '').toLowerCase()
      return authority === '' ? null : authority
    })()
    const asset = (hit.asset_id === null || hit.asset_id === undefined)
      ? undefined
      : (() => { try { return db.prepare('SELECT ip, primary_name, segment_cidr FROM asset WHERE id = ?').get(Number(hit.asset_id)) } catch { return undefined } })()
    const targetMatchesAsset = () => {
      if (targetHost === null) return true                 /* target 미기입: 자산 기준으로 붙입니다 */
      if (asset === undefined) return false                /* target 은 있는데 자산을 찾을 수 없음: 붙이지 않습니다 */
      const ip = String(asset.ip || '').toLowerCase()
      const name = String(asset.primary_name || '').toLowerCase()
      const cidr = String(asset.segment_cidr || '').toLowerCase()
      /* ① 대상이 바로 이 자산(IP 또는 대표 도메인) */
      if (targetHost === ip || targetHost === name) return true
      /* ② 대상이 "단일 호스트처럼 보이지 않는" 경우: 경계 돌파는 target 을 도달 가능한 대역(10.20.30.0/24)으로 쓰고,
         단말류는 장비 이름(pc-001)으로 씁니다. 이런 항목은 본질적으로 "자산 수준 성과"이며,
         거기에 쓰인 터널/웹셸/자격 증명은 이 입구 자산에 붙습니다 — 붙이지 않으면 "채널을 어떻게 열었는지"를 잃습니다.
         판정: target 에 '/' 가 있거나(대역), 해석된 호스트가 IP/도메인 형태가 아닌 경우. */
      const raw = String(hit.target || '').trim()
      if (raw.includes('/')) return true
      if (cidr !== '' && (targetHost === cidr || cidr.startsWith(targetHost + '/'))) return true
      const looksLikeHost = /^[0-9a-f.:\[\]]+$/i.test(targetHost) || targetHost.includes('.')
      return !looksLikeHost
    }
    const sameAsset = targetMatchesAsset()

    const credentials = []
    const accesses = []
    const webshells = []
    const tunnels = []
    if (sameAsset) {
      try {
        if (hit.asset_id !== null && hit.asset_id !== undefined) {
          credentials.push(...db.prepare(`SELECT id, host, username, secret_value, secret_type, privilege, source, tool, agent, found_at
            FROM credential WHERE asset_id = ? ORDER BY id LIMIT 20`).all(hit.asset_id))
        } else if (targetHost !== null) {
          credentials.push(...db.prepare(`SELECT id, host, username, secret_value, secret_type, privilege, source, tool, agent, found_at
            FROM credential WHERE host LIKE ? ORDER BY id LIMIT 20`).all('%' + targetHost + '%'))
        }
      } catch { /* 무시 */ }
      if (hit.asset_id !== null && hit.asset_id !== undefined) {
        try { accesses.push(...db.prepare('SELECT id, host, username, method, privilege, session_ref, obtained_at FROM access_session WHERE asset_id = ? ORDER BY id LIMIT 20').all(hit.asset_id)) } catch { /* 무시 */ }
        try { webshells.push(...db.prepare('SELECT id, url, shell_type, pass_key, privilege, status, agent FROM webshell WHERE asset_id = ? ORDER BY id LIMIT 20').all(hit.asset_id)) } catch { /* 무시 */ }
        try {
          tunnels.push(...db.prepare('SELECT id, kind, listen, entry, reach, entry_kind, status, command, agent FROM tunnel WHERE asset_id = ? ORDER BY id LIMIT 20').all(hit.asset_id)
            .map((t) => Object.assign({}, t, { legit: tunnelIsLegit(t.entry_kind) })))
        } catch { /* 무시 */ }
      }
    }

    /* 재현 완전성 판정: 한 점수는 최소한 "단계 있음 + (명령 있음 또는 취약점 있음 또는 원본 요청 있음)"이어야 합니다 */
    const hasCommand = steps.some((s) => String(s.tool || '').trim() !== '')
    const gaps = []
    if (steps.length === 0) gaps.push('공격 단계 기록이 없습니다(`redteam_chain_add`): 이 단계의 동작을 어떻게 했는지 알 수 없습니다')
    else if (!hasCommand) gaps.push('공격 단계에 `tool`(실제 명령)이 없습니다: 재현할 때 당시 무엇을 입력했는지 알 수 없습니다')
    if (hit.vuln_id === null || hit.vuln_id === undefined) gaps.push('`vuln_id` 연결이 없습니다: 보고서에 해당 원본 요청을 넣을 수 없습니다')
    if (credentials.length === 0 && ['web-account-user', 'web-account-admin', 'db-access'].includes(hit.code)) {
      gaps.push('계정류 점수인데 자격 증명이 등록되지 않았습니다(`redteam_credential_add`): 계정 비밀번호가 어디서 나왔는지 알 수 없습니다')
    }
    if (['boundary', 'internal-pivot'].includes(hit.code) && tunnels.length === 0) {
      gaps.push('돌파류 점수인데 터널이 등록되지 않았습니다(`redteam_tunnel_add`): 채널을 어떻게 열었는지 알 수 없습니다')
    }

    /* how: "무엇으로 얻었는지"를 한 줄로 밝힙니다. 정보량이 가장 많은 항목을 우선합니다 */
    const primary = steps.find((s) => String(s.title || '').trim() !== '') || steps[0]
    let how = ''
    if (hit.vuln_id !== null && hit.vuln_id !== undefined && vuln !== null) {
      how = '취약점 이용 ' + (vuln.cve ? vuln.cve + ' ' : '') + (vuln.title || '') + '(' + (vuln.severity || 'unknown') + ')'
    } else if (primary !== undefined) {
      how = primary.title || ''
    }
    if (primary !== undefined && String(primary.tool || '').trim() !== '') {
      how = (how === '' ? '' : how + ';') + '명령: ' + String(primary.tool).trim()
    }
    return {
      engagement_dir: evidenceDir,
      steps, vuln, credentials, accesses, webshells, tunnels,
      how,
      /* 단계가 이 점수에 어떻게 귀속되었는지: linked(명시) > vuln(같은 취약점) > point(같은 자산 같은 점수) > asset(같은 자산 폴백) */
      step_source: stepSource,
      evidence_refs: steps.map((s) => s.evidence_ref).filter(Boolean),
      complete: gaps.length === 0,
      gaps,
    }
  }

  /**
   * 공격 점수 연결 재현 보고서: "점수를 얻은" 성과만 모아 목록으로 펼칩니다.
   * 각 항목에는 Yakit Repeater 에 그대로 붙여 넣을 수 있는 원본 요청을 최대한 함께 담습니다:
   *   ① 명시적으로 연결된 취약점(score_hit.vuln_id) → 그 취약점의 http_evidence(가장 정확)
   *   ② 폴백: 같은 자산 + 대상 URL 경로 매칭(자동 매칭으로 표시)
   *   ③ 둘 다 없음 → 증거 텍스트만 주고 missing_evidence 로 표시
   *
   * 각 항목에는 **“어떻게 얻었는지”**(#hitTrace)를 덧붙입니다: 동작 단계(실제 명령과 출력 포함) + 이용한 취약점 +
   * 확보한 자격 증명 / WebShell / 터널 — "계정 비밀번호가 어떻게 나왔고, 터널을 어떻게 세웠는지"에 답합니다.
   * 단계나 명령이 빠진 항목은 incomplete 로 표시하고, 보고서에 gaps 를 나열합니다.
   */
  scoreReport(id, options = {}) {
    const db = this.db(id)
    const meta = readMeta(this.metaPathOf(id)) || {}
    const limit = Math.min(Number(options.limit) || 500, 2000)
    const rows = db.prepare(`SELECT h.*, p.code, p.name AS point_name, p.points AS point_default, p.category,
        p.enabled AS point_enabled, p.rule AS point_rule, p.tier AS point_tier, p.cap AS point_cap,
        p.dedup_scope AS point_dedup, p.src AS point_src, p.description AS point_desc,
        a.ip AS asset_ip, v.title AS vuln_title, v.cve AS vuln_cve, v.gained AS vuln_gained, v.severity AS vuln_severity
      FROM score_hit h
      LEFT JOIN score_point p ON p.id = h.point_id
      LEFT JOIN asset a ON a.id = h.asset_id
      LEFT JOIN vuln v ON v.id = h.vuln_id
      ORDER BY h.recorded_at, h.id LIMIT ?`).all(limit)

    /* 채점 기준: 같은 종류 점수에 상한이 없고 적중마다 누적합니다(자체 생성 계정은 위에서 통째로 제외됨) */
    const perPoint = new Map()
    const eviByVuln = db.prepare(`SELECT id, label, method, url, status, request, response, note, captured_at
      FROM http_evidence WHERE vuln_id = ? ORDER BY id`)

    const clip = (t, n) => {
      const s = t === null || t === undefined ? '' : String(t)
      return s.length > n ? s.slice(0, n) + '\n…(잘림, 전체 내용은 증거 파일 참고)' : s
    }

    /* 각 적중이 공격 체인의 어느 단계에 속하는지(공격 체인 페이지와 같은 추론 규칙) */
    const scopeOf = new Map()
    if (rows.length > 0) {
      const ids = Array.from(new Set(rows.map((r) => r.asset_id).filter((v) => v !== null && v !== undefined)))
      if (ids.length > 0) {
        const ph = ids.map(() => '?').join(',')
        for (const a of db.prepare(`SELECT id, COALESCE(scope, (${SCOPE_SQL})) AS scope FROM asset WHERE id IN (${ph})`).all(...ids)) {
          scopeOf.set(a.id, a.scope)
        }
      }
    }
    /* 직접 등록/생성한 계정은 성과가 아닙니다: 보고서 본문에서 제외하고, 각주에 숫자만 줍니다 */
    const selfCreatedRows = rows.filter((h) => Number(h.self_created) === 1)
    /* “중지”한 점수: 패널은 enabled 인 점수만 누적하므로(listScorePoints 의 기준) 보고서도 반드시 같아야 합니다.
       그러지 않으면 같은 산출물 안에 총점이 두 개 생깁니다(예: web-app 을 중지하면 패널 50점, 보고서 150점).
       이런 적중은 본문에도 총점에도 들어가지 않지만, 마찬가지로 개수만 보고합니다(사용자가 직접 껐고, 규칙에 밀린 것이 아닙니다).
       판정 함수는 아래 reportRows 와 함께 둬서 두 기준이 어긋나지 않게 합니다. */
    /* 채점 기준과 규칙 상한: **listScorePoints 와 같은 체계를 써야 합니다**(applyScoreCaps + 점수 메타데이터).
       그러지 않으면 패널은 6340점, 보고서는 7930점으로 서로 맞지 않습니다 — 산출물의 자기모순이 숫자 높낮이보다 나쁩니다.
       밀려나거나 상한을 넘은 적중은 본문에 넣지 않고(새 성과가 아닙니다), 각주에 개수만 보고합니다. */
    /* 채점 평가는 공용 구현을 쓰고 **enabledOnly 를 넘깁니다**: 패널은 사용 중인 점수만 누적하므로,
       보고서가 enabled 를 보지 않으면 "패널 50점, 보고서 150점" 같은 자기모순 산출물이 나옵니다. */
    const reportMeta = loadScoreMeta(db)
    const reportNames = loadAssetNames(db)
    /* 적중에 points 가 실려 있으면 적중 값이 우선합니다(통합판은 한 항목에 여러 등급이 있습니다).
       배율(G5/G6)은 등급 배점에 곱합니다 — 공용 hitPointsOf 를 호출해 패널/보고서/공격 체인 세 곳의 기준을 일치시킵니다. */
    const effPoints = (h) => hitPointsOf(
      { points: h.points, multiplier: h.multiplier, code: h.code },
      new Map([[String(h.code), {
        points: (h.point_default !== undefined && h.point_default !== null
          ? Number(h.point_default) || 0
          : (reportMeta.get(h.code) || {}).points || 0),
      }]]),
    )
    const reportEval = evaluateScoreBoard(db, rows.map((h) => Object.assign({}, h, { points: effPoints(h) })),
      { meta: reportMeta, names: reportNames, enabledOnly: true })
    const capFlagById = reportEval.byId
    const isCappedRow = (h) => {
      const flag = capFlagById.get(h.id)
      return flag !== undefined && flag.capped === true
    }
    const isDisabledRow = (h) => h.point_enabled !== null && h.point_enabled !== undefined
      && Number(h.point_enabled) !== 1
    const reportRows = rows.filter((h) => Number(h.self_created) !== 1 && !isCappedRow(h) && !isDisabledRow(h))
    const serviceCappedRows = rows.filter((h) => Number(h.self_created) !== 1 && isCappedRow(h))

    const items = reportRows.map((h, i) => {
      const seen = perPoint.get(h.point_id) || 0
      perPoint.set(h.point_id, seen + 1)
      const counted = true
      /* 이 적중의 실제 배점: 적중에 실린 값이 우선(통합판은 한 항목에 여러 등급), 없으면 점수 항목의 기본값 */
      const hitPoints = effPoints(h)

      /* "어떻게 얻었는지": 동작 단계 + 취약점 + 자격 증명/입구(보고서의 핵심이라, 없으면 납품할 수 없습니다) */
      const trace = this.#hitTrace(db, { ...h, code: h.code }, id)

      /* 원본 요청: 먼저 명시적으로 연결된 취약점에서 가져옵니다 */
      let requests = h.vuln_id === null || h.vuln_id === undefined ? [] : eviByVuln.all(h.vuln_id).map((e) => ({
        label: e.label || (e.method || '') + ' ' + (e.url || ''), method: e.method, url: e.url, status: e.status,
        request: clip(e.request, 20000), response: clip(e.response, 8000), note: e.note, source: 'linked',
      }))
      /* 폴백: 같은 자산 + 대상 경로를 단계적으로 완화해 매칭(2단계 경로 우선, 1단계로, 마지막에 전체 권한 범위) */
      if (requests.length === 0 && h.target) {
        const full = String(h.target).trim()
        const um = /^([a-z][a-z0-9+.-]*:\/\/)([^/?#\s]+)(\/[^?#\s]*)?/i.exec(full)
        const candidates = []
        if (um !== null) {
          const authority = um[2]
          const segs = (um[3] || '').split('/').filter(Boolean)
          if (segs.length >= 2) candidates.push('%' + authority + '/' + segs.slice(0, 2).join('/') + '%')
          if (segs.length >= 1) candidates.push('%' + authority + '/' + segs[0] + '%')
          candidates.push('%' + authority + '%')
          if (segs.length >= 2) candidates.push('%/' + segs.slice(0, 2).join('/') + '%')
        } else {
          const auth = full.split('/')[0].split('?')[0]
          if (auth !== '') candidates.push('%' + auth + '%')
        }
        const SQL = 'SELECT id, label, method, url, status, request, response, note FROM http_evidence WHERE url LIKE ? ORDER BY id LIMIT 3'
        const SQL_ASSET = 'SELECT id, label, method, url, status, request, response, note FROM http_evidence WHERE asset_id = ? AND url LIKE ? ORDER BY id LIMIT 3'
        let rows2 = []
        if (h.asset_id !== null && h.asset_id !== undefined) {
          for (const like of candidates) {
            rows2 = db.prepare(SQL_ASSET).all(h.asset_id, like)
            if (rows2.length > 0) break
          }
        }
        if (rows2.length === 0) {
          for (const like of candidates) {
            rows2 = db.prepare(SQL).all(like)
            if (rows2.length > 0) break
          }
        }
        requests = rows2.map((e) => ({
          label: e.label || (e.method || '') + ' ' + (e.url || ''), method: e.method, url: e.url, status: e.status,
          request: clip(e.request, 20000), response: clip(e.response, 8000), note: e.note, source: 'auto',
        }))
      }
      /* ── 재현 입구: 요청 / 명령 / 판정 기준 ──────────────────────────────────
         사용자 지적: "보고서의 점수 항목이 득점 과정을 설명하지 않아 재현하기 어렵습니다". 그런데 라이브러리에는 재료가 있습니다:
         공격 단계의 tool 은 흔히 그 curl 이고, target 은 그 요청의 주소입니다.
         여기서 이를 세 가지로 정리합니다:
           · replay_cmd  —— 터미널에 그대로 붙여 실행할 수 있는 명령(실제 curl 은 원문 유지, 나머지는 URL 로 합성)
           · replay_http —— Yakit Repeater 에 붙여 넣을 수 있는 원본 요청(실제 캡처가 있으면 그것을, 없으면 합성)
           · confirm     —— 왜 이것을 확보로 인정하는지, 어떤 자료를 붙여야 하는지, 어디서 재현하는지
         **합성한 것은 반드시 synthesized 로 표시하고 출처를 밝힙니다** — 검수자가 추정을 실증으로 오해하면 안 됩니다. */
      const firstStepTool = (trace.steps.find((x) => String(x.tool || '').trim() !== '') || {}).tool || ''
      const parsedCurl = parseCurl(firstStepTool)
      const replayUrl = (() => {
        if (requests.length > 0 && requests[0].url) return requests[0].url
        if (parsedCurl !== null) return parsedCurl.url
        return h.target || null
      })()
      /* ── 합성의 경계(매우 중요)────────────────────────────────────────
         "이 점수가 정말 HTTP 상호작용으로 얻어졌을 때"만 HTTP 요청/curl 명령을 합성합니다.
         이 판정이 없으면 서비스 이름까지 HTTP 서비스로 보고 이런 쓸모없는 결과를 만듭니다:
           · 대상 10.20.30.40:3306 → `curl -i -s 'http://10.20.30.40:3306/'`
           · 대상 pc-001          → `curl -i -s 'http://pc-001/'`
         차라리 "이 항목은 HTTP 입구가 아니므로 아래 동작 템플릿으로 재현하세요"라고 분명히 말합니다. */
      const targetParsed = parseTarget(h.target || '')
      const schemeIsHttp = targetParsed !== null
        && (targetParsed.scheme === 'http' || targetParsed.scheme === 'https')
      /* "이 항목은 HTTP 상호작용"이라는 판정의 세 가지 근거 — 하나만 맞아도 인정 */
      const isHttpEntry = parsedCurl !== null
        || (requests.length > 0 && String(requests[0].request || '').trim() !== '')
        || schemeIsHttp
      const confirm = scoreConfirmOf(h.code)

      /* ── 재현 명령: "이 점수가 어떤 자산으로 성립했는지"를 먼저 보고 명령을 고른다 ──────────
           · real        —— 공격할 때 실제로 입력했고, 바로 이번 HTTP 상호작용의 curl
           · synthesized —— **실제 캡처한 요청** 또는 대상 URL 로 합성한 curl(명령줄 등가 형식)
           · template    —— 그 점수 항목 자체의 동작 템플릿(자산 정보로 실행 가능한 명령까지 채운 형태)
           · from_step   —— 공격 단계에서 가져온 실제 명령("이번 동작"이 아닐 수 있으므로 그대로 표시)
         ⚠️ 순서를 틀린 대가(실측): 경계 돌파 항목은 **터널**로 성립하는데, 같은 자산의 공격 단계에
         "Behinder 웹셸 업로드" curl 이 적혀 있습니다. "단계에 curl 이 있으면 그것을 씁니다"를 먼저 적용하면 보고서가 업로드 명령을
         경계 돌파의 재현 명령으로 내놓습니다 — 딴 사람 모자 뒤집어씌우기라, 사용자가 그대로 실행해도 "내부망 진입"은 재현되지 않습니다.
         따라서 "자산이 그 점수 항목의 재현 방식을 가리키는가"를 "단계에 명령이 있는가"보다 앞에 둬야 합니다. */
      const capturedRequest = requests.length > 0 ? String(requests[0].request || '').trim() : ''
      const capturedCurl = (() => {
        if (capturedRequest === '') return null
        const firstLine = capturedRequest.split(/\r?\n/)[0]
        const m = /^([A-Z]+)\s+(\S+)/.exec(firstLine)
        const hostLine = /^host:\s*(\S+)/im.exec(capturedRequest)
        if (m === null || hostLine === null) return null
        const scheme = /:443$/.test(hostLine[1]) ? 'https' : 'http'
        /* path 를 따로 빼냅니다: parseTarget 은 '?' 에서 잘라내므로 url 만 주면 쿼리 문자열이 사라집니다
           (실측: `GET /_cat/indices?v` 를 `curl .../_cat/indices` 로 합성해 버렸습니다).
           인증 헤더와 콘텐츠 타입 헤더도 같이 넣어야 합니다(Basic 이 빠지면 401, POST 에서 빠지면 415). */
        const keep = []
        for (const line of capturedRequest.split(/\r?\n/).slice(1)) {
          if (/^(authorization|content-type|accept|x-requested-with|referer):/i.test(line.trim())) keep.push(line.trim())
        }
        return { url: scheme + '://' + hostLine[1] + m[2], method: m[1], path: m[2], headers: keep }
      })()

      const tunnel0 = trace.tunnels[0] || null
      const listenPort = tunnel0 === null || !tunnel0.listen
        ? null
        : (/:([0-9]{1,5})$/.exec(String(tunnel0.listen)) || [])[1] || null
      const reach = tunnel0 === null ? null : String(tunnel0.reach || '').trim()
      const t0 = parseTarget(h.target || '')
      const cred0 = (trace.credentials.find((c) => c.username) || trace.credentials[0]) || {}
      const templateValues = {
        host: (reach === null || reach === '' ? null : reach.replace(/\/[0-9]{1,3}$/, '')) || (t0 === null ? null : t0.host),
        port: listenPort || (t0 === null ? null : t0.port),
        user: cred0.username,
        pass: cred0.secret_value,
        url: h.target || null,
      }

      let replayCmd = null
      let replayCmdKind = null
      let replayCmdUnfilled = []
      const curlIsThisAction = commandKind(firstStepTool) === 'curl'
      /* 이 항목에 **명시적으로 연결된** 공격 단계에 기록된 명령: 이것이야말로 "이번 동작에서 실제로 입력한 것"입니다.
         명시적 연결(h.step_id)만 인정하고, 같은 자산에서 추론한 과거 단계는 인정하지 않습니다 — 후자는
         "Behinder 웹셸 업로드" curl 을 "경계 돌파" 항목에 붙여, 보고서가 곧바로 딴소리가 됩니다. */
      const linkedStep = (trace.steps || []).find((st) => st.id === h.step_id) || null
      const linkedTool = linkedStep === null ? '' : String(linkedStep.tool || '').trim()
      const looksLikeCommand = (t) => t.length >= 8 && /^[A-Za-z0-9_./~$-]+/.test(t) && /\s/.test(t)

      if (capturedRequest !== '' && capturedCurl !== null) {
        /* ① 실제 캡처한 요청이 있을 때: 명령줄 등가 형식이 그 요청과 정확히 대응하므로 가장 오해가 적습니다.
           요청 본문은 **이 요청에서만** 가져오고, 공격 단계의 curl 에 있는 data 를 빌려 오면 안 됩니다 —
           실측: `GET /_cat/indices?v` 가 `curl -d @/tmp/.b.json .../_cat/indices` 로 합성되었습니다. */
        const sep = capturedRequest.search(/\r?\n\r?\n/)
        const body = sep === -1 ? '' : capturedRequest.slice(sep).replace(/^\r?\n\r?\n/, '').trim()
        replayCmd = buildCurlCommand({
          url: capturedCurl.url, path: capturedCurl.path, method: capturedCurl.method,
          headers: capturedCurl.headers,
          data: body === '' ? null : body,
          cookie: parsedCurl === null ? null : parsedCurl.cookie,
        })
        replayCmdKind = 'synthesized'
      } else if (linkedTool !== '' && looksLikeCommand(linkedTool)) {
        /* ①′ 이번 동작의 실제 명령(impacket / nxc / mysql / redis-cli 처럼 curl 이 아닌 도구 포함).
            이런 명령은 예전에 버려지고 범용 템플릿("id; whoami; hostname" 같은 판정용 구절)으로 되돌아갔고,
            사용자가 그대로 실행해도 아무것도 재현되지 않았습니다 — 보고서에서 가장 오해를 부르던 지점이라, 이제 원문 그대로 내놓습니다. */
        replayCmd = linkedTool
        replayCmdKind = commandKind(linkedTool) === 'curl' ? 'real' : 'linked'
      } else if (curlIsThisAction && !(tunnel0 !== null && confirm !== null && confirm.script)) {
        /* ② 실제 curl 이면서 이 점수가 "터널로 성립"하지 않는 경우(터널 항목은 아래 ③ 참고) */
        replayCmd = firstStepTool
        replayCmdKind = 'real'
      } else if (confirm !== null && confirm.script) {
        /* ③ 점수 항목 자체의 동작 템플릿: 이 항목에 기록된 대상/터널/자격 증명으로 실행 가능한 명령까지 채웁니다 */
        replayCmdKind = 'template'
        const filled = fillTemplate(confirm.script, templateValues)
        replayCmd = filled.cmd
        replayCmdUnfilled = filled.remaining
      } else if (curlIsThisAction) {
        replayCmd = firstStepTool
        replayCmdKind = 'real'
      } else if (commandKind(firstStepTool) !== null) {
        /* ④ 단계에 있는 다른 실제 명령: "이번 동작"이 아니라는 점을 그대로 밝힙니다 */
        replayCmd = firstStepTool
        replayCmdKind = 'from_step'
      }

      if (replayCmd === null && confirm && confirm.script) {
        replayCmdKind = 'template'
        /* 이 점수 자체가 아는 정보로 템플릿을 채웁니다: host 는 target 에서, 계정은 연결된 자격 증명에서.
           채우지 못한 자리표시자는 원형 그대로 남기고 목록으로 알립니다 — 추측하지도, 그냥 실행된다고 가장하지도 않습니다. */
        const cred0 = (trace.credentials.find((c) => c.username) || trace.credentials[0]) || {}
        const t0 = parseTarget(h.target || '')
        /* 터널 항목: <포트> 는 터널이 리슨하는 포트(127.0.0.1:1080)이고, target 에 적힌 포트가 아닙니다.
           경계 돌파의 target 은 "도달 가능한 대역"(10.20.30.0/24)이라, 거기서 포트를 해석하면 null 만 나옵니다.
           결국 채울 수 없는 자리표시자가 하나 남습니다 — 정작 이 점수에서 실행해야 할 명령은 터널 기록에 적혀 있습니다. */
        const tunnel0 = trace.tunnels[0] || null
        const listenPort = tunnel0 === null || !tunnel0.listen
          ? null
          : (/:([0-9]{1,5})$/.exec(String(tunnel0.listen)) || [])[1] || null
        const reachHost = (() => {
          const reach = tunnel0 === null ? null : String(tunnel0.reach || '').trim()
          if (reach === null || reach === '') return null
          return reach.replace(/\/[0-9]{1,3}$/, '')     /* 10.20.30.0/24 → 10.20.30.0 */
        })()
        const filled = fillTemplate(confirm.script, {
          host: reachHost || (t0 === null ? null : t0.host),
          port: listenPort || (t0 === null ? null : t0.port),
          user: cred0.username,
          pass: cred0.secret_value,
          url: h.target || null,
        })
        replayCmd = filled.cmd
        replayCmdUnfilled = filled.remaining
      }

      /* 원본 요청: 실제 캡처 우선, 다음으로 실제 curl 에서 합성, 그것도 없으면 target 에 http(s):// 가 적힌 경우에만 합성 */
      let replayHttp = null
      let replayHttpSynthesized = false
      if (requests.length > 0 && String(requests[0].request || '').trim() !== '') {
        replayHttp = requests[0].request
      } else if (parsedCurl !== null) {
        replayHttp = buildHttpRequest({
          url: parsedCurl.url, method: parsedCurl.method, data: parsedCurl.data,
          headers: parsedCurl.headers, cookie: parsedCurl.cookie,
          insecure: parsedCurl.insecure, followRedirect: parsedCurl.followRedirect,
        })
        replayHttpSynthesized = replayHttp !== null
      } else if (schemeIsHttp) {
        replayHttp = buildHttpRequest({ url: h.target, method: 'GET' })
        replayHttpSynthesized = replayHttp !== null
      }
      return {
        seq: i + 1,
        id: h.id,
        point_id: h.point_id,
        /* 명시적으로 연결된 동작 단계 id: 보고서는 이 값으로 "같은 일괄 동작"에 속한 항목을 하나로 묶고 대장 표를 만듭니다.
           반드시 명시적 연결을 써야 하고, trace 에서 추론한 단계를 쓰면 안 됩니다 — 추론은 같은 자산의 과거 단계까지
           끌어와서 같은 동작 묶음의 항목이 하나로 합쳐지지 않습니다(실측: 단말 64대 중 1대가 이 때문에 빠졌습니다). */
        step_id: h.step_id === null || h.step_id === undefined ? null : h.step_id,
        /* 점수 항목의 규칙 메타데이터(구역 표와 개별 상세에 "규칙 몇 / 등급 / 상한"을 적습니다) */
        point_rule: h.point_rule === null || h.point_rule === undefined ? null : h.point_rule,
        point_tier: h.point_tier || '',
        point_cap: Number(h.point_cap) || 0,
        point_dedup: h.point_dedup || '',
        /* 점수 항목 code: 보고서 항목과 공격 체인 항목은 **같은 code 를 반드시** 지녀야 합니다 —
           화면이 이 값으로 양쪽을 맞춰야 하고(보고서 화면의 단계 그룹 폴백, 도구 쪽은 code 로 성과 대조),
           이게 없으면 하위 단계는 point_name 으로 어림짐작 매칭할 수밖에 없고, 이름만 바꿔도 끊깁니다. */
        code: h.code || '',
        stage_code: scoreStageOf({ stage_code: h.stage_code, code: h.code, target: h.target },
          h.asset_id === null || h.asset_id === undefined ? undefined : scopeOf.get(h.asset_id)),
        point_name: h.point_name || '(삭제된 점수 항목)',
        category: h.category || '',
        points: hitPoints,
        counted: counted,
        nth_of_point: seen + 1,
        target: h.target || '',
        asset_ip: h.asset_ip || '',
        gained: h.vuln_gained || '',
        vuln: h.vuln_id === null || h.vuln_id === undefined ? null : { id: h.vuln_id, title: h.vuln_title || '', cve: h.vuln_cve || null, severity: h.vuln_severity || null },
        evidence: h.evidence || '',
        note: h.note || '',
        recorded_by: h.recorded_by || '',
        recorded_at: h.recorded_at || '',
        requests: requests,
        missing_evidence: requests.length === 0,
        /* 재현 입구(신규): 사용자가 이 세 가지로 재실행/자기 입증을 할 수 있습니다 */
        replay_cmd: replayCmd,
        /* real / synthesized / template —— 화면과 보고서가 이 값으로 문구를 정합니다(템플릿을 "그대로 붙여넣기"라고 하면 안 됩니다) */
        replay_cmd_kind: replayCmdKind,
        /* 템플릿에서 아직 채우지 못한 자리표시자(빈 배열이면 모두 채워졌고 바로 실행 가능) */
        replay_cmd_unfilled: replayCmdKind === 'template' && replayCmdUnfilled.length > 0 ? replayCmdUnfilled : undefined,
        /* 증거 스크린샷: 이 항목(또는 이 묶음)의 대표 이미지, 최대 3장 — #representativeShots 참고 */
        shots: [],
        replay_http: replayHttp,
        replay_http_synthesized: replayHttpSynthesized,
        /* 이 요청이 당일 실제 캡처인지, 당일 명령/출력으로 재구성한 것인지(증거 행의 note 에 적혀 있으면 그대로 따릅니다) */
        replay_http_rebuilt: requests.length > 0 && /재구성|당일.*(명령|출력)으로|원본 캡처 미보관/.test(String(requests[0].note || '')),
        /* 이 점수가 "HTTP 상호작용"으로 얻어진 것인지. 보고서는 이 값으로 붙여 넣을 요청을 줄지 결정합니다:
           HTTP 가 아닌 대상(SMB/데이터베이스/터널)에서 억지로 합성한 요청은 쓸모가 없으니, 명령줄과 설명을 주는 편이 낫습니다. */
        http_entry: isHttpEntry,
        /* 이 재현 입구가 어디서 나왔는지:
             linked       —— 명시적으로 연결된 취약점의 실제 캡처
             auto         —— 대상 경로로 매칭한 실제 캡처(대조 필요)
             request      —— 실제 캡처에서 도출한 명령줄 등가 형식
             step         —— 공격 단계에서 가져온 실제 명령(이번 동작이 아닐 수 있음)
             synthesized  —— 대상 URL 만으로 합성(대조 필요)
             template     —— 점수 항목 자체의 동작 템플릿(이 항목 기록으로 채움) */
        replay_source: requests.length > 0
          ? (capturedRequest !== '' ? (requests[0].source === 'linked' ? 'linked' : 'auto')
            : (replayCmdKind === 'from_step' ? 'step' : 'request'))
          : (replayCmdKind === 'from_step' ? 'step'
            : (replayCmdKind === 'template' ? 'template' : (replayCmd !== null || replayHttp !== null ? 'synthesized' : null))),
        /* 판정 기준 / 자기 입증 자료 / 재현 입구(SCORE_CONFIRM 에서 code 로 조회) */
        confirm: confirm,
        confirm_missing: confirm === null,
        /* 어떻게 얻었는지: 단계(명령과 출력 포함) + 취약점 + 자격 증명/입구. incomplete 는 보고서가 이 단계를 재현할 수 없음을 뜻합니다 */
        trace: trace,
        how: trace.how,
        steps: trace.steps,
        credentials: trace.credentials,
        accesses: trace.accesses,
        webshells: trace.webshells,
        tunnels: trace.tunnels,
        incomplete: trace.complete !== true,
        gaps: trace.gaps,
      }
    })

    const summary = {
      count: items.length,
      points: items.reduce((n, x) => n + (x.counted ? x.points : 0), 0),
      withRequests: items.filter((x) => x.requests.length > 0).length,
      autoMatched: items.filter((x) => x.requests.some((r) => r.source === 'auto')).length,
      missingRequests: items.filter((x) => x.missing_evidence).length,
      /* 재현 완전성: 단계와 명령을 모두 갖춘 항목 수 / 단계나 명령이 빠진 항목 수 */
      withSteps: items.filter((x) => x.steps.length > 0).length,
      withCommands: items.filter((x) => x.steps.some((s) => String(s.tool || '').trim() !== '')).length,
      incomplete: items.filter((x) => x.incomplete).length,
      credentials: items.reduce((n, x) => n + x.credentials.length, 0),
      tunnels: items.reduce((n, x) => n + x.tunnels.length, 0),
      /* 직접 등록/생성한 계정의 적중: 성과가 아니므로 보고서에 쓰지 않습니다 */
      selfCreatedExcluded: selfCreatedRows.length,
      /* 같은 자산 같은 포트에서 중복된 계정/데이터베이스 권한 적중: 서비스는 이미 다 확보했으므로 중복은 새 성과가 아닙니다 */
      serviceCappedExcluded: serviceCappedRows.length,
      /* 소속 점수 항목이 사용자에 의해 "중지"된 적중: 패널 기준과 같게 제외합니다(그러지 않으면 양쪽 총점이 어긋납니다) */
      disabledExcluded: rows.filter((h) => Number(h.self_created) !== 1 && isDisabledRow(h)).length,
      serviceCapped: serviceCappedRows.map((h) => ({
        id: h.id, point_name: h.point_name || h.code, code: h.code,
        service: serviceLabel(h), evidence: h.evidence || '', target: h.target || '',
        points: h.points || 0, recorded_at: h.recorded_at || '',
      })),
    }
    /* ── 항목 병합: 같은 점수 항목 + 같은 동작(같은 공격 단계 묶음)이고 대상만 다른 항목 ──────
       전형적 상황: 한 번의 일괄 동작으로 단말 60대를 확보. 대수마다 한 항목씩 두면 보고서가 잡부 장부가 됩니다(실측: 전문의 64%를 차지).
       반대로 읽는 사람은 "이 단계를 도대체 어떻게 했는지"를 찾지 못합니다. 하나로 병합하고 대상 대장 표를 붙이면,
       재현 입구는 한 번만 쓰고 대수는 표로 쌓습니다. */
    const GROUP_MIN = Math.max(2, Number(options.groupMin) || 5)
    const stepKeyOf = (x) => (x.step_id === null || x.step_id === undefined ? '' : String(x.step_id))
    const items2 = (() => {
      const buckets = new Map()
      for (const x of items) {
        const k = x.point_id + '|' + stepKeyOf(x)
        if (!buckets.has(k)) buckets.set(k, [])
        buckets.get(k).push(x)
      }
      const out = []
      const done = new Set()
      for (const x of items) {
        if (done.has(x.id)) continue
        const k = x.point_id + '|' + stepKeyOf(x)
        const members = buckets.get(k) || [x]
        done.add(x.id)
        if (members.length < GROUP_MIN || stepKeyOf(x) === '') { out.push(x); continue }
        for (const m of members) done.add(m.id)
        /* 대표 항목 = 증거 텍스트가 가장 많이 나온 것(최빈값)이고, 시간상 가장 이른 것이 아닙니다:
           같은 동작 묶음에서 일부 대상은 다른 방식으로 했을 수 있기 때문입니다(실측: 단말 64대 중 첫 대는 도메인 관리자 계정을 썼습니다).
           그것을 묶음 전체 설명으로 쓰면 예외를 통례로 적게 됩니다. */
        /* 증거 텍스트는 대수마다 다릅니다(각자의 IP/호스트 이름이 적혀 있습니다). 그래서 먼저 "숫자 정규화"를 하고 최빈값을 취합니다:
           단말 64대의 GPO 방식은 정규화하면 같은 문장이 되고, 첫 대의 "도메인 관리자 계정 사용" 예외는 그렇지 않습니다 —
           이렇게 하면 대표 항목이 다수파에 놓입니다. */
        const freq = new Map()
        const norm = (t) => String(t || '').replace(/[0-9]/g, '#')
        for (const m of members) {
          const k = norm(m.evidence)
          freq.set(k, (freq.get(k) || 0) + 1)
        }
        const rep = members.slice().sort((a, b) => (freq.get(norm(b.evidence)) || 0) - (freq.get(norm(a.evidence)) || 0)
          || String(a.recorded_at || '').localeCompare(String(b.recorded_at || '')))[0] || x
        out.push(Object.assign({}, rep, {
          is_group: true,
          group_size: members.length,
          /* 병합 항목의 공격 체인 상 위치는 "가장 이른 대수" 기준으로 계산합니다: 일괄 동작은 첫 대가 성공한 시점부터 발생한 것이고,
             대표 항목의 시각을 쓰면 묶음 전체가 체인 안에서 흔들립니다(실측: 단말 묶음이 #12 와 #15 사이를 오갔습니다) */
          order_at: members.map((m) => String(m.recorded_at || '')).sort()[0] || rep.recorded_at,
          points: members.reduce((n, m) => n + m.points, 0),
          group_targets: members.map((m) => ({
            id: m.id, target: m.target, points: m.points, evidence: m.evidence, recorded_at: m.recorded_at,
          })),
        }))
      }
      return out
    })()

    /* ── 증거 스크린샷: "점수 항목" 단위로 대표 이미지를 고릅니다(최대 3장). 그룹 항목은 구성원 전체의 적중으로 함께 찾는다 ──
       납품할 때 가장 설득력 있는 것은 당시의 그 화면입니다. 그런데 일괄 점수 항목은 적중이 수십 건이라,
       항목마다 그림을 붙이면 본문이 잠겨 버리므로 항목 단위로 대표 그림을 고릅니다. */
    /* ⚠️ 대표 그림은 **점수 항목** 단위로 고르고, 보고서 항목 단위로 고르지 않습니다: 한 점수 항목에 도메인 컨트롤러 6대면 항목도 6개이고,
       항목마다 3장씩 고르면 같은 3장이 본문에 6번 반복됩니다(실측: 본문 22개 항목에 그림 58장).
       규칙: 점수 항목마다 합쳐서 3장 이하로 고릅니다. 각 항목은 "이 적중에 속한" 그림만 보여 주고,
       항목 수준 그림(적중에 붙지 않은 것)은 그 점수 항목의 첫 보고서 항목에 붙입니다. */
    const pointHitIds = new Map()
    for (const x of items2) {
      if (!pointHitIds.has(Number(x.point_id))) pointHitIds.set(Number(x.point_id), [])
      const list = pointHitIds.get(Number(x.point_id))
      for (const hid of (x.is_group ? (x.group_targets || []).map((g) => g.id) : [x.id])) {
        if (list.indexOf(hid) === -1) list.push(hid)
      }
    }
    const shotPicks = this.#representativeShots(id, Array.from(pointHitIds.entries()).map(([pid, ids]) => ({
      point_id: pid, hit_ids: ids,
    })), 3)
    const shotBriefOf = (sh) => ({
      id: Number(sh.id), url: this.shotUrlOf(id, sh), label: sh.label || '', note: sh.note || '',
      kind: sh.kind || 'screenshot', mime: sh.mime || 'image/png', bytes: Number(sh.bytes) || 0,
      width: sh.width === null || sh.width === undefined ? null : Number(sh.width),
      height: sh.height === null || sh.height === undefined ? null : Number(sh.height),
      target: sh.target || '', captured_at: sh.captured_at || '', source_ref: sh.source_ref || '',
    })
    const shotTotalByPoint = new Map()
    try {
      for (const row of db.prepare('SELECT point_id, COUNT(*) AS n FROM shot GROUP BY point_id').all()) {
        if (row.point_id !== null && row.point_id !== undefined) shotTotalByPoint.set(Number(row.point_id), Number(row.n))
      }
    } catch { /* 구 라이브러리에 shot 테이블이 없으면 무시 */ }
    const seenPoint = new Set()
    for (const x of items2) {
      const pid = Number(x.point_id)
      const list = shotPicks.get(pid) || []
      const mine = new Set(x.is_group ? (x.group_targets || []).map((g) => g.id) : [x.id])
      const own = list.filter((sh) => sh.hit_id !== null && sh.hit_id !== undefined && mine.has(Number(sh.hit_id)))
      const pointLevel = list.filter((sh) => sh.hit_id === null || sh.hit_id === undefined)
      const isFirst = !seenPoint.has(pid)
      seenPoint.add(pid)
      x.shots = own.concat(isFirst ? pointLevel : []).map(shotBriefOf)
      x.shot_total = shotTotalByPoint.get(pid) || x.shots.length
    }
    /* 보고서의 이미지 경로: 기본은 **절대 경로**(어디로 내려받아도 표시됩니다),
       산출물을 통째로 납품할 때는 options.shotRef='relative' 로 markdown 이 `shots/xxx.png` 를 쓰게 하고,
       대상 디렉터리의 shots/ 와 함께 복사해 가면 됩니다. */
    const shotRefOf = (sh) => (options.shotRef === 'relative'
      ? sh.url
      : join(this.shotsDirOf(id), String(sh.url).replace(/^shots\//, '')))

    /* ── 체인 정렬: 단계 순서(정보 수집 → 인터넷 → 경계 → 내부망 → 대상) + 단계 안에서는 동작 순서 ──
       ⚠️ ordinal 은 **체인 안의 실제 위치**이고 "필터한 뒤의 몇 번째"가 아닙니다: `listStages` 주석에
       "화면의 ①②③ 과 보고서 정렬이 모두 이 값을 쓰니 따로 번호를 매기지 말 것"이라고 적혀 있습니다. 번호를 먼저 매기고 빈 단계를 걸러 내면,
       3단계인 "경계 돌파"가 ② 로 표시됩니다 — 공격 체인 화면, 보고서 화면, 내보낸 markdown 이 함께 틀어지고,
       체인 그림과 보고서 본문이 어긋나면 산출물은 신뢰를 잃습니다. */
    const stageRows = this.listStages(id)
    const stageOrder = new Map(stageRows.map((s, i) => [s.code, i]))
    const stageOfItem = (x) => (x.stage_code && stageOrder.has(x.stage_code) ? x.stage_code : 'internet')
    const stepSeqOf = (x) => {
      const seqs = (x.steps || []).map((s) => Number(s.seq)).filter((n) => Number.isFinite(n))
      return seqs.length > 0 ? Math.min.apply(null, seqs) : Number.MAX_SAFE_INTEGER
    }
    const ordered = items2.slice().sort((a, b) => {
      const sa = stageOrder.has(stageOfItem(a)) ? stageOrder.get(stageOfItem(a)) : 99
      const sb = stageOrder.has(stageOfItem(b)) ? stageOrder.get(stageOfItem(b)) : 99
      if (sa !== sb) return sa - sb
      const ra = String(a.order_at || a.recorded_at || '')
      const rb = String(b.order_at || b.recorded_at || '')
      if (ra !== rb) return ra.localeCompare(rb)
      return stepSeqOf(a) - stepSeqOf(b)
    })
    ordered.forEach((x, i) => { x.chain_no = i + 1 })

    /* ── 선행 추론: 이 성과가 어느 성과 위에 세워졌는지 ─────────────────────────
       **라이브러리에 이미 있는 텍스트**로만 추론합니다: 이 항목의 단계(명령/설명/출력), 자격 증명(출처/획득 방식/비고),
       증거 텍스트를 한 덩어리 말뭉치로 합쳐, 그 안에 다른 채점 성과의 대상 IP 가 나타나는지 봅니다 — 나타나면
       "이 항목은 저 항목의 어깨 위에서 이뤄졌습니다"라는 뜻입니다(예: 도메인 컨트롤러 자격 증명이 ES 채팅 기록에서 나왔다 → 도메인 컨트롤러 항목의 선행 = ES 항목).
       추론되지 않으면 쓰지 않고, 의존 관계를 지어내지 않습니다. */
    const ipOfTarget = (t) => {
      const m = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/.exec(String(t || ''))
      return m === null || m[1] === '127.0.0.1' ? null : m[1]
    }
    const ipsIn = (t) => {
      const out = []
      const re = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g
      let m
      while ((m = re.exec(String(t || ''))) !== null) if (m[1] !== '127.0.0.1') out.push(m[1])
      return out
    }
    /* 이 항목에 쓰인 자격 증명: "증거에 나타난 비밀번호/계정/호스트"로 자격 증명 라이브러리의 기록을 찾아냅니다. */
    const credsAllForDeps = this.listCredentials(id)
    const ownsCred = (x, c) => {
      /* ⚠️ 판정에는 "이 항목의 증거가 직접 적어 낸 것"만 쓸 수 있고, trace 가 붙여 준 자격 증명은 **포함하면 안 됩니다**:
         trace 는 "같은 자산/같은 호스트"의 느슨한 매칭이라(대상 10.1.2.142 이면 host 에 그 주소가 들어간 자격 증명이 모두 붙습니다),
         그것을 근거로 삼으면 "MySQL 항목이 도메인 컨트롤러에 의존합니다" 같은 결론이 나옵니다. */
      const text = [x.evidence, x.note, x.gained, x.target].join('\n')
      const sv = String(c.secret_value || '').trim()
      if (sv.length >= 6 && text.indexOf(sv) !== -1) return true
      const un = String(c.username || '').trim()
      /* 계정은 "계정처럼" 생겨야 특징 문자열로 인정합니다: 순수 영단어는 충돌합니다 — 실측으로 경계 항목의 증거에
         `default via 10.1.2.1` 이 적혀 있어서, 사용자 이름이 default 인 Redis 자격 증명을 이 항목의 출처로 잘못 인정했고,
         "경계 돌파가 Redis 에 의존합니다"라고 추론했습니다. 숫자/역슬래시/@ 가 있는 것(사번, 도메인 계정)만 인정합니다. */
      const accountLike = (v) => /[\d\\@]/.test(v) || v.length >= 10
      if (un.length >= 6 && accountLike(un) && text.indexOf(un) !== -1) {
        /* 계정은 공유되므로(도메인 관리자 계정 하나가 수십 개 증거에 나옵니다) 호스트도 맞아야 합니다:
           자격 증명의 호스트가 이 항목의 대상이거나, 그 호스트 문자열이 이 항목의 증거에 나타나야 합니다. */
        const cip = ipOfTarget(c.host)
        if (cip === null) return true
        return cip === ipOfTarget(x.target) || text.indexOf(cip) !== -1
      }
      /* "자격 증명 host 가 증거에 나타납니다"는 이유로 찾아내지 않습니다: 대상 10.1.2.142 의 증거에는 당연히 그것이 적혀 있고,
         그러면 같은 호스트의 config-leak 자격 증명이 모두 이 항목에 쓰인 것으로 계산됩니다(실측에서
         "MySQL 항목이 도메인 컨트롤러에 의존합니다"라고 추론되었습니다). 비밀번호/계정 같은 **특징 문자열**만 인정합니다. */
      return false
    }
    /* 선행 후보 = 이 항목의 증거에 직접 언급된 주소 + **찾아낸 자격 증명의 출처 포인터**.
       자격 증명의 tool/note 에 있는 "첫 IP"가 보통 그 비밀번호/권한의 출처입니다
       (예: "10.1.2.163:9200 의 ES 에서 비밀번호를 검색했습니다" → 출처는 그 ES,
        "smbclient //10.1.2.5/SYSVOL 로 시작 스크립트를 가져왔습니다" → 출처는 도메인 컨트롤러).
       첫 IP 만 취하는 것은 정밀도 때문입니다: tool 필드 뒤에는 흔히 다른 자산이 덧붙어 있어서,
       전부 취하면 "RabbitMQ 비밀번호가 애플리케이션 설정에서 나왔습니다"를 "이 항목이 RabbitMQ 에 의존합니다"로 잘못 판정합니다. */
    for (const x of ordered) {
      /* 강한 단서: 이 항목에 쓰인 자격 증명이 어디서 왔는지(자격 증명 tool/note 의 첫 IP).
         약한 단서: 이 항목의 증거에 덧붙어 언급된 주소(경계 항목은 대역 목록 전체를 증거에 적어 두므로,
                 그것을 의존 근거로 쓰면 "경계 돌파가 Redis 에 의존합니다" 같은 잡음이 나옵니다).
         강한 단서를 먼저 쓰고, 3건이 안 되면 약한 단서로 채웁니다. */
      const strong = new Set()
      for (const c of credsAllForDeps.filter((v) => ownsCred(x, v))) {
        const a = ipOfTarget(c.tool)
        const b = ipOfTarget(c.note)
        if (a !== null) strong.add(a)
        if (b !== null) strong.add(b)
      }
      const weakText = [x.evidence, x.note, x.target].join('\n')
      const weak = new Map()
      for (const ip of ipsIn(weakText)) weak.set(ip, (weak.get(ip) || 0) + 1)
      /* 약한 단서는 "이 항목의 증거에서 언급된 횟수"가 많은 순서로 취합니다: 자주 언급된 것이 보통 그 성과의 핵심 대상입니다
         (경계 항목의 증거는 대역 전체를 한 번에 나열하므로, 문서 순서대로만 취하면 무관한 항목부터 걸립니다). */
      const pick = (get, size) => {
        const out = []
        for (const y of ordered) {
          if (y === x || y.point_id === x.point_id) continue
          const ip = ipOfTarget(y.target)
          if (ip === null || get(ip) === undefined) continue
          out.push({ y: y, w: size(ip) })
        }
        out.sort((a, b) => b.w - a.w)
        return out.slice(0, 3).map((v) => v.y)
      }
      const deps = pick((ip) => (strong.has(ip) ? 1 : undefined), () => 1)
      if (deps.length < 3) {
        for (const y of pick((ip) => weak.get(ip), (ip) => weak.get(ip) || 0)) {
          if (deps.length >= 3) break
          if (deps.indexOf(y) === -1) deps.push(y)
        }
      }
      x.deps = deps.map((y) => ({ no: y.chain_no, name: y.code, short: y.code, target: y.target }))
        .sort((a, b) => a.no - b.no)
      x._depIds = deps.map((y) => y.id)
    /* 환경 선행: 인터넷 측 이외의 성과는 모두 "채널"(터널 / 확보한 입구) 위에 서 있습니다 — 따로 한 줄 표시합니다 */
      x.needs_channel = stageOfItem(x) !== 'internet' && (x.tunnels || []).length > 0
    }
    /* 서로를 선행으로 지목하는 두 항목은 함께 지웁니다(예: 도메인 컨트롤러 445 와 389 가 같은 IP 라 서로를 가리킵니다):
       보고서는 선행을 하나 덜 적을지언정 "A 가 B 에 의존하고 B 가 A 에 의존합니다"라는 자기모순 체인을 만들지 않습니다. */
    for (const x of ordered) {
      const kept = (x.deps || []).filter((d) => {
        const y = ordered.find((v) => v.chain_no === d.no)
        return y === undefined || (y._depIds || []).indexOf(x.id) === -1
      })
      x.deps = kept
    }
    for (const x of ordered) delete x._depIds

    /* ── 재현 입구 분류: 보고서가 "붙여 넣을 요청"을 줄지 "명령줄"을 줄지, 색인 표를 어떻게 표시할지 정한다 ────
       · http    —— 실제 캡처가 있거나, HTTP 입구로 판정되어 요청을 재구성할 수 있음 → Burp / Yakit 에서 바로 재실행 가능
       · cli     —— 실제 명령(당일 입력한 그 명령) → 터미널에서 실행 가능(HTTP 가 아닌 프로토콜이라 Burp/Yakit 부적합)
       · method  —— 그 점수 항목의 표준 재현 동작 설명만 있음(명령은 남기지 않음) → 동작을 그대로 적고 명령을 꾸며 내지 않습니다 */
    const looksLikeHttpTarget = (t) => /^https?:\/\//i.test(String(t || '').trim())
    for (const x of ordered) {
      const captured = x.requests.length > 0 && String(x.requests[0].request || '').trim() !== ''
      /* ⚠️ "대상 자체가 http(s) 주소"이거나 "실제 캡처가 있을 때"만 요청을 줍니다.
         그러지 않으면 터널/데이터베이스 항목에 같은 자산의 무관한 curl 을 합성해 요청을 만들어 버립니다(실측에서
         `POST / HTTP/1.1` + body `-` 처럼 Yakit 에 붙여도 아무것도 재현되지 않는 가짜 요청이 나왔습니다). */
      const httpOk = (captured
        || (looksLikeHttpTarget(x.target) && x.replay_http !== null && x.replay_http !== undefined))
      /* 명령: 실제 명령 우선. 템플릿 명령은 자리표시자가 모두 채워졌을 때만 "실행 가능한 명령"으로 씁니다 */
      const unfilled = x.replay_cmd_unfilled || []
      const cmdOk = x.replay_cmd !== null && x.replay_cmd !== undefined && String(x.replay_cmd).trim() !== ''
        && (x.replay_cmd_kind !== 'template' || unfilled.length === 0)
      x.repro_kind = httpOk ? 'http' : (cmdOk ? 'cli' : 'method')
      x.repro_http_captured = captured
      /* HTTP 가 아닌 프로토콜의 재현 설명(Burp/Yakit 은 SMB/데이터베이스/NFS 를 보낼 수 없으니 이유를 적습니다) */
      const cmd = String(x.replay_cmd || '')
      x.repro_nonhttp = x.repro_kind === 'cli'
        && /atexec|nxc |smbclient|impacket|secretsdump|mysql|redis-cli|showmount|mount |winrm|proxychains/.test(cmd)
    }

    /* 단계 버킷(화면과 본문이 함께 사용): 버킷에 들어가는 것은 **병합 후** 항목이고, 점수도 병합 후 합계입니다 */
    let cumulative = 0
    const stages = stageRows.map((st) => {
      const sItems = ordered.filter((x) => stageOfItem(x) === st.code)
      const pts = sItems.reduce((n, x) => n + (x.counted ? x.points : 0), 0)
      cumulative += pts
      return { code: st.code, name: st.name, color: st.color, goal: st.goal, transition: st.transition,
        ordinal: st.ordinal, points: pts, cumulative: cumulative, items: sItems }
    }).filter((st) => st.items.length > 0)

    /* ── markdown: 복사/다운로드용이며, 에이전트가 바로 납품하기에도 편하다 ──────────────────
       구조는 "사용자가 따라 재현할 수 있게" 배열하고, "우리가 얼마나 완비하게 기록했는지"로 배열하지 않습니다:
         ⓪ 요약과 대조 + 재현 색인 표(검수자가 여기부터 봅니다)
         ① 재현 사전 조건(채널 / 자격 증명 / 도구 연결 / 도구 기능 한계)
         ② 공격 체인(의존 순서, 선행 표시)
         ③ 개별 상세(재현 입구를 맨 앞에, 대상 대장, 증거 색인)
         ④ 점수 항목 설명(판정 기준과 자료 요건은 한 번만 쓰고 항목마다 반복하지 않습니다)
         ⑤ 부록(자산, 기록과 채점 대조)
       ⚠️ 길이 규칙 두 가지: 요청 본문은 완전하게 유지합니다(Yakit 에서 바로 재실행해야 하므로 잘라 버리면 못 씁니다),
       응답 본문은 검증용이므로 1000자로 자르고 길이를 표시합니다. */
    const md = []
    const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳']
    const AGENT_LABEL = (a) => ROLE_TITLES[a] || a || '역할 미기입'
    const oneLine = (t, n) => String(t === null || t === undefined ? '' : t).replace(/\s*\n+\s*/g, ' ').trim().slice(0, n || 300)
    const shortName = (x) => POINT_SHORT_NAME[x.code] || x.point_name || x.code
    /* 초기 기록에는 `->` 가 `-&gt;` 로 적혀 있습니다(폼 이스케이프 잔재). 보고서에서 되돌리지 않으면 대상 열이 볼 수 없게 됩니다 */
    /* 병합 항목은 표에서 "첫 대 + 대수"만 적습니다. 그러지 않으면 64대짜리 긴 목록이 색인 표를 터뜨립니다 */
    const targetBrief = (x) => (x.is_group
      ? String(x.target || '') + ' 외 ' + x.group_size + '개 대상'
      : unesc(x.target))
    const unesc = (t) => String(t === null || t === undefined ? '' : t)
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    const block = (lang, text) => { md.push('```' + lang, String(text).replace(/\r/g, '').trim(), '```', '') }
    /* 자르는 지점은 문장/절 경계에 둡니다: 그냥 slice 하면 "…백엔드는 LB 3대 폴링(" 같은 토막 문장이 나옵니다 */
    const clipText = (t, n) => {
      const s0 = oneLine(t, n)
      if (s0.length < n) return s0
      for (const sep of ['.', ';', ')', ')', ',']) {
        const i = s0.lastIndexOf(sep)
        if (i > n * 0.5) return s0.slice(0, i + 1)
      }
      return s0
    }
    const targetName = (meta && meta.target_name) || id
    const httpCount = ordered.filter((x) => x.repro_kind === 'http').length
    const cliCount = ordered.filter((x) => x.repro_kind === 'cli').length
    const methodCount = ordered.filter((x) => x.repro_kind === 'method').length

    md.push('# ' + targetName + ' · 레드팀 성과 재현 보고서', '')
    md.push('> 이 보고서는 **채점된 성과**만 수록합니다: 각 항목에 재현 입구(Burp / Yakit 에 바로 넣을 수 있는 원본 요청,'
      + '또는 터널을 거쳐 실행하는 명령줄), 성공 판정 기준과 증거 색인을 주고, 공격 체인의 **의존 순서**로 배열하고 선행을 표시합니다.', '')

    /* ── ⓪ 요약과 대조 ─────────────────────────────────────────────────── */
    md.push('## 0. 요약과 대조', '')
    const shotItems = ordered.filter((x) => (x.shots || []).length > 0)
    const shotTotal = ordered.reduce((n, x) => n + (x.shots || []).length, 0)
    const shotReal = ordered.reduce((n, x) => n + (x.shots || []).filter((v) => v.kind !== 'card').length, 0)
    md.push('| 합계 점수 | 채점 항목 | Burp/Yakit 바로 재실행 | 명령줄 재현 | 그 외 방식 | 증거 스크린샷 |', '| --- | --- | --- | --- | --- | --- |')
    md.push('| **' + summary.points + ' 점** | ' + ordered.length + ' 개 | ' + httpCount
      + ' 개 | ' + cliCount + ' 개 | ' + methodCount + ' 개 | ' + shotTotal + ' 장 / ' + shotItems.length
      + ' 개 항목' + (shotReal < shotTotal ? '(현장 스크린샷 ' + shotReal + '장, 나머지는 기록으로 생성한 증거 발췌)' : '') + ' |', '')
    md.push('### 0.1 점수 항목 사용 현황', '')
    md.push('| 점수 항목 | 적중 | 이번 득점 | 건당 상한 |', '| --- | --- | --- | --- |')
    const byPoint = new Map()
    for (const x of ordered) {
      const k = x.code
      if (!byPoint.has(k)) byPoint.set(k, { code: k, name: shortName(x), hits: 0, points: 0, cap: x.point_cap })
      const rec = byPoint.get(k)
      rec.hits += x.is_group ? x.group_size : 1
      rec.points += x.points
    }
    for (const rec of Array.from(byPoint.values()).sort((a, b) => b.points - a.points)) {
      md.push('| ' + rec.name + '(`' + rec.code + '`) | ' + rec.hits + ' | +' + rec.points + ' 점 | '
        + (Number(rec.cap) > 0 ? Number(rec.cap) + ' 점' + (rec.points >= Number(rec.cap) ? '(포화)' : '') : '—') + ' |')
    }
    md.push('')
    md.push('### 0.2 기록과 채점 대조', '')
    md.push('- 라이브러리 내 득점 기록 **' + rows.length + '건** → 채점 적중 **' + summary.count + '건**'
      + ' → 같은 동작 항목을 병합한 뒤 본문 **' + ordered.length + '개**(일괄 동작 1건당 1항목 + 대상 대장)'
      + '. 별도로 **' + (summary.selfCreatedExcluded + summary.serviceCappedExcluded + summary.disabledExcluded)
      + '건**은 채점하지 않았습니다(아래 참고).')
    if (summary.serviceCappedExcluded > 0) {
      md.push('- 제외 사유: 같은 자산 같은 포트에서 중복된 계정/데이터베이스 권한 ' + summary.serviceCappedExcluded
        + '건(같은 서비스에서 최고 권한을 얻으면 만점이라 중복은 누적하지 않습니다. 부록 5.2 참고).')
    }
    if (summary.selfCreatedExcluded > 0) md.push('- 제외 사유: 직접 등록/생성한 계정 ' + summary.selfCreatedExcluded + '건(득점은 남이 이미 갖고 있던 권한을 얻는 것을 대상으로 합니다).')
    if (summary.disabledExcluded > 0) md.push('- 제외 사유: 소속 점수 항목이 중지됨 ' + summary.disabledExcluded + '건.')
    const corrected = reportRows.filter((h) => /교정/.test(String(h.note || '')))
    if (corrected.length > 0) {
      md.push('')
      md.push('> **등급 교정**: 아래 ' + corrected.length + '건은 마감 검토에서 등급을 내렸습니다.'
        + '아래 표의 점수는 **교정 후** 값입니다(패널 원본 기록값 16180, 교정 후 16090):', '')
      for (const h of corrected) {
        md.push('- `' + (h.target || '') + '` ' + (h.point_name || h.code) + ' → **' + (h.points || 0) + ' 점** '
          + oneLine(h.note, 200))
      }
    }
    md.push('')
    md.push('### 0.3 재현 색인', '')
    md.push('| # | 점수 항목 | 점수 | 대상 | 선행 | 재현 입구 |', '| --- | --- | --- | --- | --- | --- |')
    for (const x of ordered) {
      const dep = (x.deps || []).map((d) => '#' + d.no).join(',')
      const entry = x.repro_kind === 'http' ? 'Burp / Yakit 요청(§3.' + x.chain_no + ')'
        : (x.repro_kind === 'cli' ? '명령줄(§3.' + x.chain_no + ')' : '재현 방식(§3.' + x.chain_no + ')')
      md.push('| ' + x.chain_no + ' | ' + shortName(x) + ' | +' + x.points + ' | `' + oneLine(targetBrief(x), 60) + '` | '
        + (dep === '' ? (x.needs_channel ? '채널(§1.1)' : '—') : dep) + ' | ' + entry + ' |')
    }
    md.push('')

    /* ── ① 재현 사전 조건 ───────────────────────────────────────────────── */
    const tunnelsAll = this.listTunnels(id)
    const shellsAll = this.listWebshells(id)
    const credsAll = credsAllForDeps
    /* "이 항목에 쓰인 자격 증명"을 다시 한 번 계산합니다: ownsCred(증거에 비밀번호/계정이 적힘) + 호스트가 채점 대상에 있는 자격 증명.
       trace 가 붙여 준 묶음은 쓰지 않습니다: 그것은 같은 자산의 느슨한 매칭이라 이 항목과 무관한 인터페이스 토큰까지 사전 조건 표에 끌어들입니다. */
    const scoredHosts = new Set(ordered.map((x) => ipOfTarget(x.target)).filter((v) => v !== null))
    const referencedCred = new Set()
    for (const x of ordered) for (const c of credsAll.filter((v) => ownsCred(x, v))) referencedCred.add(String(c.id))
    for (const c of credsAll) {
      const ip = ipOfTarget(c.host)
      if (ip !== null && scoredHosts.has(ip)) referencedCred.add(String(c.id))
    }
    const credRank = (c) => {
      const p = String(c.privilege || '')
      if (/domain-admin/.test(p)) return 0
      if (/local-admin|domain-admin|admin/.test(p)) return 1
      if (/db-|redis|mysql|system/.test(p)) return 2
      if (/sso|sharekey|api/.test(p)) return 3
      return 9
    }
    /* 기록에 "검증 실패/보관만"이라고 적힌 후보는 제외합니다 — 재현 가능한 입구가 아니며, 나열하면 오해만 부릅니다 */
    const usablePool = credsAll.filter((c) => !/미통과|미검증|보관만|유효한 자격 증명으로 쓸 수 없|unknown/.test(String(c.note || '') + String(c.privilege || '')))
    const usefulCreds = usablePool
      .filter((c) => referencedCred.has(String(c.id)))
      .slice()
      .sort((a, b) => (referencedCred.has(String(b.id)) ? 1 : 0) - (referencedCred.has(String(a.id)) ? 1 : 0)
        || credRank(a) - credRank(b))
      .slice(0, 12)
    md.push('---', '')
    md.push('## 1. 재현 사전 조건', '')
    md.push('> 이 절을 먼저 갖춰야 뒤에 나오는 각 항목의 재현 입구가 동작합니다.', '')
    md.push('### 1.1 채널', '')
    if (tunnelsAll.length === 0) {
      md.push('이 대상에는 등록된 터널이 없습니다. 내부망 항목은 대상까지의 채널을 직접 준비해야 합니다.', '')
    } else {
      for (const t of tunnelsAll) {
        md.push('- **' + (t.kind || '터널') + '**: 리슨 `' + (t.listen || '') + '` 입구 `' + (t.entry || '') + '`'
          + (t.entry_kind ? '(entry_kind=' + t.entry_kind + ')' : '')
          + (t.reach ? ' 도달 ' + t.reach : '')
          + (String(t.status || '') !== '' ? ' 상태 ' + t.status : ''))
        if (t.command) md.push('  - 기동 명령:')
        if (t.command) block('bash', t.command)
        if (t.note) md.push('  - 설명: ' + clipText(t.note, 320))
      }
    }
    if (shellsAll.length > 0) {
      md.push('')
      md.push('**WebShell / 세션 입구**', '')
      for (const w of shellsAll) {
        md.push('- `' + (w.url || '') + '` ' + (w.shell_type || '') + (w.pass_key ? ' 연결 비밀번호 `' + w.pass_key + '`' : '')
          + (String(w.status || '') !== '' ? ' 상태 ' + w.status : '') + (w.note ? ' ' + clipText(w.note, 200) : ''))
      }
      md.push('')
    }
    md.push('### 1.2 자격 증명', '')
    if (usefulCreds.length === 0) {
      md.push('이 대상에는 등록된 자격 증명이 없습니다.', '')
    } else {
      md.push('| 대상 | 계정 | 권한 | 출처 | 획득 방식 |', '| --- | --- | --- | --- | --- |')
      for (const c of usefulCreds) {
        md.push('| `' + oneLine(c.host, 40) + '` | `' + oneLine(c.username, 40) + '` | ' + oneLine(c.privilege || '—', 30)
          + ' | ' + oneLine(c.source || '—', 40) + ' | `' + oneLine(c.tool || '—', 120) + '` |')
      }
      md.push('')
    }
    md.push('### 1.3 도구 연결', '')
    md.push('- **Burp Suite**: Settings → Network → Connections → SOCKS proxy 에 `127.0.0.1:<터널 포트>` 를 넣고,'
      + ' "Use SOCKS proxy for DNS lookups" 도 체크합니다. Repeater 에 이 보고서의 요청을 통째로 붙여 넣으면 됩니다.', '')
    md.push('- **Yakit**: "하위 프록시 / 체인 프록시"에 같은 SOCKS5 를 설정하고(인증 포함),'
      + ' "Repeater → 원본 요청 붙여넣기"로 보냅니다.', '')
    md.push('- **명령줄**: `proxychains4 -q -f <proxychains 설정>` 을 impacket / nxc / smbclient / mysql / redis-cli 같은 명령 앞에 붙입니다.'
      + ' HTTP 쪽은 `curl --socks5-hostname <계정>:<비밀번호>@127.0.0.1:<포트>` 도 쓸 수 있습니다.', '')
    md.push('### 1.4 도구 기능 한계', '')
    md.push('| 대상 유형 | 프로토콜 | 권장 도구 |', '| --- | --- | --- |')
    md.push('| 웹 애플리케이션, 관리 콘솔, REST API(내부망 포함) | HTTP / HTTPS | Burp Suite, Yakit(SOCKS 업스트림 경유) |')
    md.push('| WebShell / 터널 | HTTP / WebSocket | Behinder, Godzilla, suo5(§1.1 참고) |')
    md.push('| Windows 호스트, 도메인 컨트롤러, 공유 | SMB / RPC / WinRM | `impacket-atexec`, `nxc`, `smbclient`, `evil-winrm`, pywinrm(proxychains 경유) |')
    md.push('| 데이터베이스 | MySQL / Redis / PostgreSQL | `mysql`, `redis-cli`, `psql`(proxychains 경유) |')
    md.push('| 파일 공유 | NFS | `showmount`, `mount -t nfs4`(proxychains 또는 장악한 호스트 경유) |')
    md.push('')
    md.push('> Burp / Yakit 은 HTTP(S) 와 WebSocket 만 재실행할 수 있습니다. SMB, WinRM, 데이터베이스, NFS 같은 프로토콜은'
      + ' 위 표대로 명령줄로 재현합니다 — 보고서의 해당 항목이 바로 실행 가능한 명령을 줍니다.', '')

    /* ── ② 공격 체인(의존 순서)─────────────────────────────────────────── */
    md.push('---', '')
    md.push('## 2. 공격 체인(의존 순서)', '')
    md.push('> 번호는 문서 순서입니다(공격 체인 단계 ① → ⑤, 단계 안에서는 획득 시각순). `선행` 열에는 "이 단계 전에 먼저 끝내야 했던 성과"를 적습니다. '
      + '단계 분류는 점수 항목 유형에 따라 고정 정렬되므로, 선행 번호가 **이 항목보다 클 수 있습니다**(예: 경계 돌파는 도메인 컨트롤러 #16 선확보에 의존), '
      + '번호를 따라가서 보면 됩니다.', '')
    md.push('| # | 점수 항목 | 점수 | 목표 | 선행 |', '| --- | --- | --- | --- | --- |')
    for (const x of ordered) {
      const dep = (x.deps || []).map((d) => '#' + d.no + ' ' + (POINT_SHORT_NAME[d.name] || d.name)).join(',')
      md.push('| ' + x.chain_no + ' | ' + shortName(x) + ' | +' + x.points + ' | `' + oneLine(targetBrief(x), 60) + '` | '
        + (dep === '' ? (x.needs_channel ? '채널(§1.1)' : '—') : dep) + ' |')
    }
    md.push('')
    for (const st of stages) {
      md.push('- ' + st.name + ': ' + st.items.length + ' 항목 · +' + st.points + ' 점(누적 +' + st.cumulative + ' 점)')
    }
    md.push('')

    /* ── ③ 항목별 세부 내역 ────────────────────────────────────────────── */
    md.push('---', '')
    md.push('## 3. 항목별 세부 내역', '')
    md.push('> 공격 체인 단계 ① → ⑤ 순으로 배치합니다(단계 번호가 곧 체인에서의 실제 위치입니다). 단계 안에서는 동작 순서대로 정렬하고, '
      + '번호 `3.N` 은 앞의 재현 색인과 일대일로 대응합니다.', '')
    let lastStage = null
    for (const x of ordered) {
      const st = stageOfItem(x)
      if (st !== lastStage) {
        lastStage = st
        const sr = stages.find((v) => v.code === st)
        if (sr !== undefined) {
          const circled = (CIRCLED[sr.ordinal - 1] || '')
          md.push('## ' + circled + ' ' + sr.name + '(' + sr.items.length + ' 항목 · +' + sr.points + ' 점)', '')
        }
      }
      const depTxt = (x.deps || []).map((d) => '#' + d.no + ' ' + (POINT_SHORT_NAME[d.name] || d.name)
        + '(`' + oneLine(d.target, 40) + '`)').join(',')
      md.push('### 3.' + x.chain_no + ' ' + shortName(x) + ' · `' + oneLine(targetBrief(x), 80) + '` **+' + x.points + ' 점**', '')
      md.push('- **점수 항목**:' + (x.point_name || '') + ' `' + x.code + '`'
        + (x.point_rule ? ' 규칙 ' + x.point_rule : '')
        + (x.point_tier ? ' 등급 ' + oneLine(x.point_tier, 40) : '')
        + (Number(x.point_cap) > 0 ? ' 단일 상한 ' + x.point_cap + ' 점' : ''))
      if (x.is_group) md.push('- **이 항목에 ' + x.group_size + '개 목표 포함**(같은 동작이 일괄 적중했고, 대상별 목록은 아래 대장 참고)')
      if (x.gained) md.push('- **획득**:' + oneLine(x.gained, 120))
      if (x.is_group) {
        const list = (x.group_targets || []).map((g) => '`' + g.target + '`')
        md.push('- **결과**: 같은 동작이 ' + x.group_size + '개 목표에서 동일한 성과를 냈습니다('
          + list[0] + ' … ' + list[list.length - 1] + '), 대상별 출력은 아래 표와 증거 색인 참고')
      } else if (x.evidence) {
        md.push('- **결과**:' + oneLine(x.evidence, 400))
      }
      if (x.confirm && x.confirm.need) md.push('- **판정 기준**:' + oneLine(x.confirm.need, 160))
      md.push('- **선행**:' + (depTxt !== '' ? depTxt : (x.needs_channel ? '채널(§1.1 참고)' : '없음(체인 시작점)')))
      md.push('')

      /* 재현 진입점: ① HTTP 요청(그대로 전송 가능) ② 명령줄 ③ 재현 방식 설명 */
      md.push('#### 재현', '')
      if (x.repro_kind === 'http') {
        const lead = (x.repro_http_captured && x.replay_http_rebuilt !== true)
          ? '**원본 요청**(당일 실제 캡처, 통째로 복사 → Burp Repeater / Yakit “원본 요청 붙여넣기” → 전송)'
          : (x.repro_http_captured
              ? '**재구성 요청**(당일 요청이 바이트 단위로 보존되지 않아, 당일 명령과 출력을 근거로 재구성했습니다. 필드는 목표와 자격 증명에 맞춰 채워져 있습니다)'
              : '**등가 요청**(당일 실제 명령으로 재구성했습니다. 원본 캡처는 보존되지 않았고, 필드는 목표와 자격 증명에 맞춰 채워져 있습니다)')
        md.push(lead + ':', '')
        block('http', x.replay_http)
        if (x.requests.length > 0 && x.requests[0].response) {
          const full = String(x.requests[0].response)
          md.push('**서버 응답**(' + (x.requests[0].status === null || x.requests[0].status === undefined
            ? '상태 미기록' : 'HTTP ' + x.requests[0].status) + '):', '')
          md.push('```http', full.replace(/\r/g, '').trim().slice(0, 1000)
            + (full.length > 1000 ? '\n…(응답 총 ' + full.length + ' 자, 전체 내용은 증거 라이브러리 참고)' : ''), '```', '')
        }
        if (x.requests.length > 1) md.push('> 그 밖에 요청 증거 ' + (x.requests.length - 1) + '건이 있으며 증거 라이브러리에서 볼 수 있습니다.', '')
        /* 같은 동작의 curl 등가 형식도 함께 제공합니다: 어떤 사람은 명령을 바로 돌리고, 어떤 사람은 Repeater 를 씁니다 */
        if (x.replay_cmd !== null && x.replay_cmd !== undefined && String(x.replay_cmd).trim() !== '') {
          md.push('**명령줄 등가 형식**(위 요청과 동일):', '')
          block('bash', x.replay_cmd)
        }
      }
      if (x.repro_kind === 'cli') {
        const lead = (x.replay_cmd_kind === 'real' || x.replay_cmd_kind === 'linked')
          ? '**명령줄**(이 동작을 당일 실제로 실행한 명령이며, 바로 재실행할 수 있습니다)'
          : (x.replay_cmd_kind === 'synthesized' ? '**명령줄 등가 형식**(위 요청에서 도출했고, 주소와 메서드는 요청과 동일합니다)'
            : '**명령줄**(당일 공격 단계에서 발췌)')
        md.push(lead + ':', '')
        block('bash', x.replay_cmd)
        if (x.repro_nonhttp) {
          md.push('> 이 동작은 SMB / RPC / 데이터베이스 / 파일 공유 프로토콜을 사용하므로 Burp 와 Yakit 으로는 바로 재전송할 수 없습니다. '
            + '§1.3 대로 proxychains 로 터널에 연결해 실행하면 됩니다.', '')
        }
      }
      if (x.repro_kind === 'method') {
        md.push('**재현 방식**:' + ((x.confirm && x.confirm.replay)
          ? oneLine(x.confirm.replay, 200)
          : '해당 점수 항목의 판정 기준에 따라 목표에서 같은 동작을 재현하고 출력을 보존합니다.'), '')
        if ((x.steps || []).length > 0) {
          md.push('> 동작 요점은 아래 “동작 기록”에 있습니다. 명령이 따로 보존되지 않았으므로 같은 동작을 목표에서 재실행하면 됩니다.', '')
        }
      }

      /* 증거 스크린샷: 그림 한 장이 열 줄의 설명보다 유용합니다. kind=card 는 반드시 "생성된 것"임을 밝히고 현장 스크린샷으로 속이지 않습니다 */
      if ((x.shots || []).length > 0) {
        const shotNote = []
        if (x.shot_total > x.shots.length) shotNote.push('이 점수 항목은 총 ' + x.shot_total + '장이며, 여기에는 대표 ' + x.shots.length + '장만 실었습니다')
        if (x.is_group) shotNote.push('이 그룹 ' + x.group_size + '개 목표')
        md.push('**증거 스크린샷**' + (shotNote.length > 0 ? '(' + shotNote.join(';') + ')' : '') + ':', '')
        for (const sh of x.shots) {
          const alt = String(sh.label || ('증거 ' + sh.id)).replace(/[\[\]]/g, '')
          md.push('![' + alt + '](' + shotRefOf(sh) + ')', '')
          const cap = []
          if (sh.label) cap.push(sh.label)
          else if (sh.target) cap.push('`' + sh.target + '`')
          if (sh.kind === 'card') cap.push('**당일 기록으로 생성한 증거 발췌(현장 스크린샷 아님)**')
          if (sh.captured_at) cap.push(String(sh.captured_at).replace('T', ' ').slice(0, 16))
          if (sh.source_ref) cap.push('원본 파일 `' + oneLine(sh.source_ref, 120) + '`')
          if (sh.note) cap.push(oneLine(sh.note, 160))
          if (cap.length > 0) md.push('> ' + cap.join(' · '), '')
        }
        md.push('')
      } else if (Number(x.shot_total) > 0) {
        /* 이 항목에는 대표 그림이 배정되지 않았습니다(같은 점수 항목의 그림은 앞 항목에서 이미 보여 주었습니다). 어디서 볼지 알려 주어 누락으로 오해하지 않게 합니다 */
        md.push('> 이 항목의 증거 스크린샷은 해당 점수 항목의 대표 그림을 보세요(같은 점수 항목이 총 ' + x.shot_total + '장이며, 보고서는 점수 항목당 최대 3장만 표시합니다).', '')
        md.push('')
      }

      /* 목표 대장(병합 항목): 한 대에 한 줄, 대상별 증거 포함 */
      if (x.is_group) {
        md.push('**목표 대장(' + x.group_size + '대, 대상별 출력은 증거 색인 참고)**', '')
        md.push('| # | 목표 | 결과 | 채점 |', '| --- | --- | --- | --- |')
        const brief = (ev) => {
          const m = /(([^)]{1,60}))/.exec(String(ev || ''))
          if (m !== null) return oneLine(m[1], 60)
          return oneLine(ev, 80)
        }
        ;(x.group_targets || []).forEach((g, gi) => {
          md.push('| ' + (gi + 1) + ' | `' + g.target + '` | ' + brief(g.evidence) + ' | +' + g.points + ' |')
        })
        const extra = summary.serviceCapped.filter((c) => c.code === x.code)
        if (extra.length > 0) {
          md.push('')
          md.push('> 그 밖에 ' + extra.length + '대가 같은 권한을 얻었지만 **단일 항목 상한** 때문에 채점되지 않았습니다(기록 보존): '
            + extra.map((c) => '`' + c.target + '`').join(',') + ', 부록 5.2 참고.', '')
        }
        md.push('')
      }

      /* 어떻게 했는지: 동작 단계(실제 명령과 출력 포함) */
      const evFiles = Array.from(new Set((x.steps || []).map((s) => String(s.evidence_ref || '').trim()).filter((v) => v !== '')))
      if ((x.steps || []).length > 0 || x.how || x.vuln || evFiles.length > 0) {
        md.push('#### 동작 기록', '')
        if (x.how) md.push('> ' + oneLine(x.how, 240), '')
        ;(x.steps || []).forEach((s, si) => {
          md.push('**' + (si + 1) + '. ' + oneLine(s.title || '(이름 없는 동작)', 80) + '**'
            + (s.agent ? ' — ' + AGENT_LABEL(s.agent) : '')
            + (s.inferred ? ' · (같은 자산 기준 추론)' : ''))
          if (s.detail) md.push('- ' + oneLine(s.detail, 400))
          if (s.result) md.push('- 출력:' + oneLine(s.result, 300))
          if (s.tool && String(s.tool).trim() !== String(x.replay_cmd || '').trim()) {
            md.push('- 명령:')
            md.push('  ```bash', '  ' + String(s.tool).replace(/\r/g, '').trim().slice(0, 1500), '  ```')
          }
          if (s.evidence_ref) md.push('- 증거:`' + oneLine(s.evidence_ref, 200) + '`')
        })
        md.push('')
      }
      /* 항목별 자격 증명은 "이 항목에서 실제로 쓴 것"만 남깁니다. trace 는 같은 자산의 자격 증명을 함께 붙이는데,
         그것은 화면용 관대한 뷰입니다. 보고서에 무관한 인터페이스 토큰을 줄줄이 붙이면 진위만 의심받습니다. */
      const itemCreds = credsAll.filter((c) => ownsCred(x, c)
        || (ipOfTarget(c.host) !== null && ipOfTarget(c.host) === ipOfTarget(x.target)))
      if (itemCreds.length > 0) {
        md.push('**자격 증명**:' + itemCreds.map((c) => '`' + (c.host || '') + '` ' + (c.username || '—')
          + (c.privilege ? '(' + c.privilege + ')' : '') + ' 출처:' + (c.source || '미표기')).join('<br>'), '')
      }
      if ((x.webshells || []).length > 0) {
        md.push('**WebShell**:' + x.webshells.map((w) => '`' + (w.url || '') + '` ' + (w.shell_type || '')
          + (w.pass_key ? ' 키 `' + w.pass_key + '`' : '')).join('<br>'), '')
      }
      if ((x.tunnels || []).length > 0) {
        md.push('**채널**:' + x.tunnels.map((t) => '`' + (t.kind || '') + '` 리스닝 `' + (t.listen || '')
          + '`').join('<br>'), '')
      }
      const meta2 = []
      if (x.vuln) meta2.push('취약점 ' + (x.vuln.cve ? x.vuln.cve + ' ' : '') + oneLine(x.vuln.title, 80))
      if (x.recorded_at) meta2.push('획득 ' + String(x.recorded_at).replace('T', ' ').slice(0, 16)
        + (x.recorded_by ? '(' + AGENT_LABEL(x.recorded_by) + ')' : ''))
      if (Number(x.point_cap) > 0) {
        const used = byPoint.get(x.code) ? byPoint.get(x.code).points : x.points
        meta2.push('이 점수 항목은 ' + used + '/' + x.point_cap + ' 점 사용')
      }
      if (meta2.length > 0) md.push('> ' + meta2.join(' · '), '')
      md.push('')
    }

    /* ── ④ 점수 항목 설명(판정 기준과 자료 요구는 한 번만 서술합니다)──────────────────────── */
    md.push('---', '')
    md.push('## 4. 점수 항목 설명', '')
    md.push('> 본문에서 이 기준을 항목마다 반복하지 않습니다. 공통 규칙: 권한은 높은 것만 한 번 인정(G1), 데이터 성과는 별도 채점(G2), '
      + '상한은 개별 방어 단위에 적용(G3), 단말과 장비는 대수로 채점(G4), 증명 자료는 G7 을 따릅니다.', '')
    md.push('| 점수 항목 | 규칙 / 등급 | 판정 기준 | 첨부할 자료 | 표준 재현 동작 |', '| --- | --- | --- | --- | --- |')
    for (const rec of Array.from(byPoint.values()).sort((a, b) => b.points - a.points)) {
      const c = scoreConfirmOf(rec.code) || {}
      const sample = ordered.find((x) => x.code === rec.code) || {}
      md.push('| ' + rec.name + '(`' + rec.code + '`) | '
        + (sample.point_rule ? '규칙 ' + sample.point_rule + ' ' : '') + oneLine(sample.point_tier || '—', 50) + ' | '
        + oneLine(c.need || '—', 160) + ' | ' + oneLine(c.proof || '—', 160) + ' | '
        + '`' + oneLine(c.replay || '—', 140) + '` |')
    }
    md.push('')

    /* ── ⑤ 부록 ────────────────────────────────────────────────────────── */
    /* 대조용 자산 목록: 적중/단계에 명시적으로 연결된 자산 ∪ **점수 목표 IP 에 대응하는 자산**.
       후자를 빼먹으면 안 됩니다. 대부분의 적중은 "목표 주소"만 기록하고 asset_id 를 연결하지 않으므로,
       asset_id 로만 모으면 부록에 몇 대만 남아 검수 때 대조가 맞지 않습니다. */
    const assetsTouched = new Set(
      ordered.flatMap((x) => [x.asset_id, ...(x.steps || []).map((s) => s.asset_id)])
        .filter((v) => v !== null && v !== undefined),
    )
    const targetIps = Array.from(new Set(ordered.map((x) => ipOfTarget(x.target)).filter((v) => v !== null)))
    if (targetIps.length > 0) {
      const phIp = targetIps.map(() => '?').join(',')
      for (const a of db.prepare('SELECT id FROM asset WHERE ip IN (' + phIp + ')').all(...targetIps)) assetsTouched.add(a.id)
    }
    const assetsTouchedList = Array.from(assetsTouched)
    if (assetsTouchedList.length > 0) {
      const ph = assetsTouchedList.map(() => '?').join(',')
      const rowsA = db.prepare(`SELECT a.id, a.ip, a.primary_name, a.discovered_at, a.first_seen, a.last_seen,
          a.test_status, a.priority, COALESCE(a.scope, (${SCOPE_SQL})) AS scope
        FROM asset a WHERE a.id IN (${ph}) ORDER BY a.discovered_at, a.id`).all(...assetsTouchedList)
      md.push('---', '')
      md.push('## 5. 부록', '')
      md.push('### 5.1 이 보고서에 포함된 자산(발견 시각 포함)', '')
      md.push('| 자산 | 이름 | 내/외부망 | 발견 시각 | 최근 수집 |')
      md.push('| --- | --- | --- | --- | --- |')
      for (const a of rowsA) {
        md.push('| `' + (a.ip || '') + '` | ' + (a.primary_name || '—')
          + ' | ' + (a.scope === 'internal' ? '내부망' : '외부망')
          + ' | ' + (a.discovered_at ? String(a.discovered_at).replace('T', ' ').slice(0, 19) : '—')
          + ' | ' + (a.last_seen ? String(a.last_seen).replace('T', ' ').slice(0, 19) : '—') + ' |')
      }
      md.push('')
    }
    if (summary.serviceCapped.length > 0) {
      md.push('### 5.2 채점되지 않은 중복 기록(같은 서비스 상한 도달)', '')
      md.push('| 목표 | 점수 항목 | 기록 점수 | 기록 시각 |', '| --- | --- | --- | --- |')
      for (const c of summary.serviceCapped) {
        md.push('| `' + (c.target || c.service || '') + '` | ' + (c.point_name || c.code) + ' | '
          + (c.points || 0) + ' | ' + String(c.recorded_at || '').replace('T', ' ').slice(0, 16) + ' |')
      }
      md.push('')
    }
    return { items: items2, stages, summary, markdown: md.join('\n'), target: targetName }
  }

  /**
   * 점수 체인: score_hit 를 시간순으로 펼쳐 하나의 체인으로 만들되, "득점" 관련 내용만 담고 정보 수집 잡다한 기록은 섞지 않습니다.
   * 공격 체인 페이지의 “점수 체인” 뷰에서 사용합니다.
   */
  scoreChain(id, f = {}) {
    const db = this.db(id)
    const limit = Math.min(Number(f.limit) || 500, 2000)
    const items = db.prepare(`SELECT h.id, h.point_id, h.asset_id, h.vuln_id, h.step_id, h.target,
        h.evidence, h.note, h.self_created, h.port, h.recorded_by, h.recorded_at,
        p.code, p.name AS point_name, p.category, p.points AS point_default, p.points, p.enabled, h.points AS hit_points, h.multiplier, h.stage_code,
        a.ip AS asset_ip, v.title AS vuln_title, v.cve AS vuln_cve
      FROM score_hit h
      LEFT JOIN score_point p ON p.id = h.point_id
      LEFT JOIN asset a ON a.id = h.asset_id
      LEFT JOIN vuln v ON v.id = h.vuln_id
      ORDER BY h.recorded_at, h.id LIMIT ?`).all(limit)
    /* 각 단계가 "무슨 동작으로 얻어졌는지": ① 명시적으로 연결된 단계 ② 같은 자산에서 시간상 가장 가까운 단계(추론으로 표시) */
    const stepById = new Map(db.prepare('SELECT id, seq, stage, title, detail, asset_id, point_id, recorded_at FROM attack_step').all().map((x) => [x.id, x]))
    const stepsByAsset = new Map()
    for (const st of stepById.values()) {
      if (st.asset_id === null || st.asset_id === undefined) continue
      if (!stepsByAsset.has(st.asset_id)) stepsByAsset.set(st.asset_id, [])
      stepsByAsset.get(st.asset_id).push(st)
    }
    for (const list of stepsByAsset.values()) list.sort((a, b) => String(a.recorded_at).localeCompare(String(b.recorded_at)))
    for (const it of items) {
      let step = it.step_id !== null && it.step_id !== undefined ? stepById.get(it.step_id) : undefined
      let inferred = false
      if (step === undefined) {
        step = Array.from(stepById.values()).find((x) => x.point_id === it.point_id && x.asset_id === it.asset_id)
      }
      if (step === undefined && it.asset_id !== null && it.asset_id !== undefined) {
        const cands = (stepsByAsset.get(it.asset_id) || []).filter((x) => String(x.recorded_at) <= String(it.recorded_at))
        if (cands.length > 0) { step = cands[cands.length - 1]; inferred = true }
      }
      it.action = step === undefined ? null : { id: step.id, seq: step.seq, stage: step.stage, title: step.title, detail: step.detail }
      it.action_inferred = inferred
    }
    /* 채점 기준(listScorePoints 와 완전히 동일하며, 보고서와 패널 점수가 어긋나지 않게 합니다):
       ① 직접 가입/자체 구축한 계정은 득점하지 않습니다(과정만 남깁니다);
       ② 점수 항목이 가진 dedup_scope 로 중복을 제거합니다(같은 대상/같은 시스템/같은 서비스는 최고 점수 한 건만, 또는 대수에 따라 누적);
       ③ rule + cap 으로 규칙 상한을 적용하고, 초과분은 득점하지 않습니다. */
    const chainMeta = loadScoreMeta(db)
    const chainNames = loadAssetNames(db)
    /* 이 적중의 실제 점수: **적중 자체 등급이 우선**(통합판에서는 같은 항목에 여러 등급이 있습니다. 예: 관리자 50 / 일반 10).
       scoreChain 의 SQL 은 hit_points / point_default 두 별칭으로 두 열을 분리해 가져옵니다. h.points 를 그대로 쓰면
       같은 이름의 p.points 에 가려져 공격 체인 페이지의 등급 판정이 전부 뒤집힙니다. */
    const chainPointsOf = (it) => hitPointsOf({
      points: Number(it.hit_points) || Number(it.point_default) || 0,
      multiplier: it.multiplier,
      code: it.code,
    })
    const chainEval = evaluateScoreBoard(db, items.map((it) => Object.assign({}, it, { points: chainPointsOf(it) })),
      { meta: chainMeta, names: chainNames, enabledOnly: true })
    const cappedChain = { items: chainEval.items }
    const capFlagById = chainEval.byId
    const seenOf = new Map()
    for (const it of items) {
      it.self_created = Number(it.self_created) === 1
      const flag = capFlagById.get(it.id)
      it.capped = flag !== undefined && flag.capped === true
      it.port = normalizePort(it.port) ?? parseTargetPort(it.target)
      const meta = chainMeta.get(String(it.code)) || {}
      it.service = meta.dedup_scope === 'none' ? null : serviceLabel(it)
      it.capped_reason_kind = flag === undefined ? null : flag.capped_reason_kind
      it.rule = meta.rule ?? null
      it.rule_cap = meta.cap || 0
      /* 이 적중이 외부에 노출하는 점수 = 적중 자체 등급 점수, 없으면 점수 항목 기본값으로 떨어집니다 */
      it.point_default = Number(it.point_default) || 0
      it.points = chainPointsOf(it)
      it.capped_reason = it.capped
        ? scoreCapReasonText(Object.assign({}, it, { rule_cap: meta.cap || 0 }), flag.capped_by_points)
        : null
      const seen = seenOf.get(it.point_id) || 0
      if (!it.self_created && !it.capped) seenOf.set(it.point_id, seen + 1)
      it.nth_of_point = seen + 1
      /* 중지된 점수 항목의 적중은 득점하지 않습니다(패널/보고서 기준과 동일: enabledOnly) */
      it.counted = it.self_created !== true && it.capped !== true && !chainEval.disabledIds.has(it.id)
    }
    /* 점수 항목별로 "아직 확보하지 못한 것"을 집계해, 빈틈을 한눈에 보이게 합니다 */
    const points = db.prepare('SELECT id, code, name, category, points, enabled FROM score_point ORDER BY sort_order, id').all()
    const hitPointIds = new Set(items.map((x) => x.point_id))
    const achieved = points.filter((p) => hitPointIds.has(p.id) && p.enabled === 1)
    const missing = points.filter((p) => !hitPointIds.has(p.id) && p.enabled === 1)
    /* ── 공격 체인: “공격면 위치”에 따라 득점을 5단계로 엮고 누적 점수를 제시한다 ────────────── */
    const assetIds = Array.from(new Set(items.map((x) => x.asset_id).filter((v) => v !== null && v !== undefined)))
    const assetInfo = new Map()
    if (assetIds.length > 0) {
      const ph = assetIds.map(() => '?').join(',')
      const rows = db.prepare(`SELECT a.id, a.ip, a.segment_cidr, COALESCE(a.scope, (${SCOPE_SQL})) AS scope, a.state, a.priority,
          (SELECT COUNT(*) FROM port p WHERE p.asset_id = a.id AND p.state = 'open') AS open_ports,
          (SELECT COUNT(*) FROM vuln v WHERE v.asset_id = a.id AND v.status IN ('confirmed','exploited')) AS vulns
        FROM asset a WHERE a.id IN (${ph})`).all(...assetIds)
      for (const row of rows) assetInfo.set(row.id, row)
    }
    /* 각 득점이 어느 단계에 속하는지: 자동 추론(명시적 stage_code > 유형 특례 > 자산 내/외부망 > target 주소) */
    for (const it of items) {
      const info = it.asset_id !== null && it.asset_id !== undefined ? assetInfo.get(it.asset_id) : undefined
      it.stage_code = scoreStageOf(
        { stage_code: it.stage_code, code: it.code, target: it.target },
        info ? info.scope : undefined,
      )
    }
    const assetChip = (id) => {
      const a = assetInfo.get(id)
      if (a === undefined) return null
      return {
        id: a.id, ip: a.ip, segment_cidr: a.segment_cidr, scope: a.scope, state: a.state,
        priority: a.priority, open_ports: a.open_ports, vulns: a.vulns,
      }
    }
    /* 공격 단계를 단계별로 집계(공격 체인은 "각 단계에 동작이 몇 개인지"만 보고 세부 내역은 펼치지 않습니다) */
    const stepsByStage = new Map()
    try {
      for (const row of db.prepare('SELECT stage, stage_code FROM attack_step LIMIT 5000').all()) {
        const code = row.stage_code || LEGACY_STAGE_MAP[row.stage] || 'recon'
        stepsByStage.set(code, (stepsByStage.get(code) || 0) + 1)
      }
    } catch { /* ignore */ }
    /* 세션 터널 표의 실제 터널: “경계 돌파” 단계의 확정 증거 */
    let tunnels = []
    try {
      tunnels = db.prepare('SELECT id, kind, listen, entry, reach, entry_kind, status, note FROM tunnel ORDER BY id DESC LIMIT 50').all()
        .map((t) => Object.assign({}, t, { legit: tunnelIsLegit(t.entry_kind), entry_kind_label: TUNNEL_ENTRY_KINDS[t.entry_kind] || null }))
    } catch { tunnels = [] }
    /* 실제로 대상 경계를 넘은 터널만 "경계 돌파"의 확정 증거로 봅니다. 자기 VPS/자체 서버에서 연 것은 제외 */
    const legitTunnels = tunnels.filter((t) => t.legit === true)
    const selfOnlyTunnels = tunnels.filter((t) => t.legit === false)

    const stageDefs = this.listStages(id)
    let cumulative = 0
    const stages = stageDefs.map((st, si) => {
      const sItems = items.filter((x) => x.stage_code === st.code)
      const pts = sItems.reduce((n, x) => n + (x.counted ? (x.points || 0) : 0), 0)
      cumulative += pts
      /* 이 단계에 관련된 자산(중복 제거). 정보 수집 단계는 "득점이 발생한 모든 자산", 나머지 단계는 자기 것만 */
      const ids = st.code === 'recon'
        ? Array.from(new Set(items.map((x) => x.asset_id).filter((v) => v !== null && v !== undefined)))
        : Array.from(new Set(sItems.map((x) => x.asset_id).filter((v) => v !== null && v !== undefined)))
      const assets = ids.map(assetChip).filter(Boolean).map((a) => {
        const mine = items.filter((x) => x.asset_id === a.id)
        return Object.assign({}, a, {
          points: mine.reduce((n, x) => n + (x.counted ? (x.points || 0) : 0), 0),
          hits: mine.length,
          /* 그 자산의 점수가 어느 단계에 속하는지(같은 자산이 내부망과 외부망 양쪽에서 모두 타격될 수 있습니다) */
          stage_code: mine.length > 0 ? mine[0].stage_code : st.code,
        })
      }).sort((a, b) => b.points - a.points || b.hits - a.hits)
      return Object.assign({}, st, {
        ordinal: si + 1,
        items: sItems,
        hits: sItems.length,
        counted: sItems.filter((x) => x.counted).length,
        points: pts,
        cumulative: cumulative,
        assets: assets,
        assetCount: assets.length,
        tunnels: st.code === 'boundary' ? legitTunnels : [],
        tunnels_self_only: st.code === 'boundary' ? selfOnlyTunnels : [],
        steps: stepsByStage.get(st.code) || 0,
      })
    })

    const scores = this.listScorePoints(id)
    return {
      items,
      stages,
      achieved,
      missing,
      summary: {
        hits: items.length,
        /* 채점 기준은 점수 패널과 동일: 같은 종류의 득점에 상한을 두지 않고 적중 횟수대로 누적 */
        points: scores.summary.achievedPoints,
        totalPoints: scores.summary.totalPoints,
        countedHits: scores.summary.countedHits,
        achievedCount: achieved.length,
        missingCount: missing.length,
        missingPoints: missing.reduce((n, p) => n + (p.potential || p.points || 0), 0),
        selfCreatedHits: scores.summary.selfCreatedHits || 0,
        /* 같은 자산·같은 포트에서 중복 적중하여 서비스 상한에 걸려 득점하지 않은 건수(계정류 / DB 권한) */
        serviceCappedHits: scores.summary.serviceCappedHits || 0,
        tunnelsLegit: legitTunnels.length,
        tunnelsSelfOnly: selfOnlyTunnels.length,
      },
    }
  }

  /** 세션 개요: 화면과 프롬프트에 쓰는 한 화면 요약(온라인/오프라인 통계 포함). */
  sessionSummary(id) {
    const db = this.db(id)
    const shells = db.prepare(`SELECT w.*, a.ip AS asset_ip FROM webshell w
      LEFT JOIN asset a ON a.id = w.asset_id ORDER BY w.id DESC`).all()
    const tunnels = db.prepare(`SELECT t.*, a.ip AS asset_ip, w.url AS webshell_url FROM tunnel t
      LEFT JOIN asset a ON a.id = t.asset_id LEFT JOIN webshell w ON w.id = t.webshell_id ORDER BY t.id DESC`).all()
      .map((t) => Object.assign({}, t, { legit: tunnelIsLegit(t.entry_kind), entry_kind_label: TUNNEL_ENTRY_KINDS[t.entry_kind] || null }))
    const creds = db.prepare('SELECT COUNT(*) AS n FROM credential').get()
    const access = db.prepare('SELECT COUNT(*) AS n FROM access_session').get()
    return {
      webshells: shells, tunnels,
      totals: {
        webshells: shells.length,
        webshellsOnline: shells.filter((s) => s.status === 'online').length,
        tunnels: tunnels.length,
        tunnelsActive: tunnels.filter((s) => s.status === 'active').length,
        /* 대상 경계를 넘은 통로만 돌파 증거로 봅니다(자기 VPS/자체 서버에서 연 것은 제외) */
        tunnelsLegit: tunnels.filter((s) => s.legit === true).length,
        tunnelsSelfOnly: tunnels.filter((s) => s.legit === false).length,
        credentials: creds ? creds.n : 0,
        access: access ? access.n : 0,
      },
    }
  }

  /**
   * 실제 연결성 측정(host 평면 전용: 에이전트는 샌드박스에서 실행되므로 여기서만 직접 연결을 시작할 수 있습니다).
   * WebShell 은 매개변수 없는 GET 을 한 번 보내고, 터널은 TCP 연결을 한 번 수행합니다.
   * 결과는 status / last_check / latency_ms / check_note 에 기록합니다.
   */
  async probeSessions(id, options = {}) {
    const timeout = Math.min(Math.max(Number(options.timeoutMs) || 6000, 1000), 20000)
    const out = { webshells: [], tunnels: [], checkedAt: nowIso() }

    for (const s of this.listWebshells(id, { limit: 500 })) {
      const started = Date.now()
      let status = 'offline'
      let note = ''
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeout)
        const res = await fetch(s.url, { method: 'GET', redirect: 'manual', signal: controller.signal })
        clearTimeout(timer)
        status = res.status < 500 ? 'online' : 'offline'
        note = `HTTP ${res.status}`
      } catch (error) {
        note = error && error.name === 'AbortError' ? `시간 초과 >${timeout}ms` : String((error && error.message) || error).slice(0, 160)
      }
      const latency = Date.now() - started
      try {
        this.updateWebshell(id, s.id, { status, last_check: nowIso(), latency_ms: latency, check_note: note })
      } catch { /* ignore */ }
      out.webshells.push({ id: s.id, url: s.url, status, note, latency_ms: latency })
    }

    for (const t of this.listTunnels(id, { limit: 500 })) {
      const target = String(t.listen || '').replace(/^socks5:\/\//, '').replace(/^https?:\/\//, '')
      const started = Date.now()
      let status = 'down'
      let note = ''
      if (target === '') {
        note = 'listen 주소가 없어 탐지할 수 없음'
      } else {
        const idx = target.lastIndexOf(':')
        const host = idx > 0 ? target.slice(0, idx) : '127.0.0.1'
        const port = Number(idx > 0 ? target.slice(idx + 1) : target)
        if (!Number.isFinite(port) || port <= 0) {
          note = `포트를 해석할 수 없음: ${t.listen}`
        } else {
          note = await new Promise((resolve) => {
            let done = false
            const socket = tcpConnect({ host, port })
            const finish = (ok, text) => {
              if (done) return
              done = true
              try { socket.destroy() } catch { /* ignore */ }
              resolve(ok ? '' : text)
            }
            socket.setTimeout(timeout)
            socket.on('connect', () => { status = 'active'; finish(true, '') })
            socket.on('timeout', () => { finish(false, `시간 초과 >${timeout}ms`) })
            socket.on('error', (error) => { finish(false, String((error && error.code) || (error && error.message) || error).slice(0, 120)) })
          })
        }
      }
      const latency = Date.now() - started
      try {
        this.updateTunnel(id, t.id, { status, last_check: nowIso(), latency_ms: latency, check_note: note })
      } catch { /* ignore */ }
      out.tunnels.push({ id: t.id, kind: t.kind, listen: t.listen, status, note, latency_ms: latency })
    }
    return out
  }

  /**
   * 공격 그래프: 자산 토폴로지 위에 취약점과 이미 장악한 자산을 겹쳐 그립니다.
   * 노드 kind: segment / asset(meta.vulns 는 심각도별 집계, meta.owned) / vuln(확인됨).
   * 엣지 relation: contains / exposes / resolves / has_vuln.
   */
  attackGraph(id, f = {}) {
    const base = this.graph(id, f)
    const db = this.db(id)
    const nodes = base.nodes.slice()
    const edges = base.edges.slice()
    const byId = new Map(nodes.map((n) => [n.id, n]))

    const vulnRows = db.prepare(`SELECT asset_id, severity, COUNT(*) AS n FROM vuln
      WHERE asset_id IS NOT NULL GROUP BY asset_id, severity`).all()
    for (const row of vulnRows) {
      const node = byId.get(`asset:${row.asset_id}`)
      if (node === undefined) continue
      node.meta = node.meta || {}
      node.meta.vulns = node.meta.vulns || {}
      node.meta.vulns[row.severity] = row.n
    }
    const owned = db.prepare('SELECT DISTINCT asset_id FROM access_session WHERE asset_id IS NOT NULL').all()
    for (const row of owned) {
      const node = byId.get(`asset:${row.asset_id}`)
      if (node !== undefined) { node.meta = node.meta || {}; node.meta.owned = true }
    }
    const confirmed = db.prepare(`SELECT v.id, v.asset_id, v.cve, v.title, v.severity, v.status
      FROM vuln v WHERE v.status IN ('confirmed','exploited') AND v.asset_id IS NOT NULL
      ORDER BY CASE v.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END LIMIT 200`).all()
    for (const v of confirmed) {
      const nodeId = `vuln:${v.id}`
      nodes.push({ id: nodeId, kind: 'vuln', label: v.cve || (v.title || '').slice(0, 18), meta: { severity: v.severity, status: v.status, title: v.title } })
      edges.push({ source: `asset:${v.asset_id}`, target: nodeId, relation: 'has_vuln' })
    }
    return { nodes, edges, summary: this.vulnStats(id) }
  }

  /* ---------- 도메인 차원 / Web 자산 ---------- */

  /**
   * 도메인별로 자산을 집계합니다: 도메인 → 그 도메인 아래의 자산 목록(도메인이 없는 자산은 “(도메인 미연결)”로 묶습니다).
   * @param f - `{ cidr? }` 특정 C 블록만 봅니다(왼쪽 C 블록 선택과 일치시켜 차원이 섞이지 않게 합니다).
   */
  domainIndex(id, f = {}) {
    const db = this.db(id)
    const assets = (f.cidr
      ? db.prepare('SELECT id, ip, segment_cidr, state, primary_name FROM asset WHERE segment_cidr = ? ORDER BY ip_int').all(f.cidr)
      : db.prepare('SELECT id, ip, segment_cidr, state, primary_name FROM asset ORDER BY ip_int').all())
    const names = db.prepare('SELECT asset_id, name, kind, provenance FROM asset_name').all()
    const byAsset = new Map()
    for (const n of names) {
      if (!byAsset.has(n.asset_id)) byAsset.set(n.asset_id, [])
      byAsset.get(n.asset_id).push(n)
    }
    const groups = new Map()
    for (const a of assets) {
      const domains = new Set()
      if (a.primary_name) domains.add(a.primary_name)
      for (const n of byAsset.get(a.id) || []) domains.add(n.name)
      if (domains.size === 0) domains.add('(도메인 미연결)')
      for (const domain of domains) {
        if (!groups.has(domain)) groups.set(domain, [])
        groups.get(domain).push({ id: a.id, ip: a.ip, segment: a.segment_cidr, state: a.state, names: (byAsset.get(a.id) || []).map((n) => n.name) })
      }
    }
    return Array.from(groups.entries())
      .map(([domain, list]) => ({ domain, count: list.length, assets: list }))
      .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain))
  }

  /** Web 자산 목록: URL/제목이 있거나 흔한 Web 포트를 가진 자산. */
  listWeb(id, f = {}) {
    const db = this.db(id)
    const rows = db.prepare(`SELECT p.id AS port_id, p.port, p.proto, p.url, p.title, p.banner, p.provenance, p.tool,
        a.id AS asset_id, a.ip, a.segment_cidr, a.primary_name, a.state,
        s.name AS service, s.product, s.version
      FROM port p JOIN asset a ON a.id = p.asset_id
      LEFT JOIN service s ON s.port_id = p.id
      WHERE p.state = 'open' AND (
        p.url IS NOT NULL OR p.title IS NOT NULL
        OR s.name IN ('http', 'https', 'http-proxy', 'ssl/http')
        OR p.port IN (80, 81, 443, 8000, 8001, 8080, 8081, 8082, 8443, 8888, 9090, 7001, 9000, 9443)
      )
      ORDER BY a.ip_int, p.port`).all()
    const filtered = f.cidr ? rows.filter((r) => r.segment_cidr === f.cidr) : rows
    const limited = f.limit ? filtered.slice(0, Number(f.limit)) : filtered
    return { total: filtered.length, items: limited }
  }

  /* ---------- HTTP 증거(Burp / Yakit 으로 재현 가능) ---------- */

  addHttpEvidence(id, e = {}) {
    const db = this.db(id)
    const result = db.prepare(`INSERT INTO http_evidence(vuln_id, asset_id, label, method, url, status, request, response, note, captured_by, captured_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`).run(
      e.vuln_id ?? null, e.asset_id ?? null, e.label ?? null, e.method ?? 'GET', e.url ?? null,
      e.status ?? null, e.request ?? null, e.response ?? null, e.note ?? null,
      e.captured_by ?? null, nowIso(),
    )
    return { id: Number(result.lastInsertRowid) }
  }

  listHttpEvidence(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.vuln_id !== undefined && f.vuln_id !== null) { where.push('vuln_id = ?'); args.push(Number(f.vuln_id)) }
    if (f.asset_id !== undefined && f.asset_id !== null) { where.push('asset_id = ?'); args.push(Number(f.asset_id)) }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const limit = Math.min(Number(f.limit) || 100, 500)
    return db.prepare(`SELECT * FROM http_evidence ${clause} ORDER BY id DESC LIMIT ?`).all(...args, limit)
  }

  /* ---------- 공격 체인 ---------- */

  /**
   * 공격 체인에 한 단계를 기록합니다. 이 단계에서 득점했다면 point_code(또는 point_id)를 함께 넘기면 됩니다:
   * 서버가 score_hit 을 자동으로 기록하고 양쪽을 서로 연결해, "단계만 쓰고 채점을 잊거나 / 점수만 있어 근거를 설명하지 못하는" 상황을 막습니다.
   */
  addChainStep(id, s = {}) {
    const db = this.db(id)
    const next = (db.prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM attack_step').get() || { n: 1 }).n
    let pointId = s.point_id !== undefined && s.point_id !== null ? Number(s.point_id) : null
    if (pointId === null && s.point_code) {
      const row = db.prepare('SELECT id FROM score_point WHERE code = ?').get(String(s.point_code))
      if (row !== undefined) pointId = row.id
    }
    const seq = s.seq ?? next
    const legacyStage = s.stage ?? 'other'
    /* 이 5개 단계 code 만 공격 체인 페이지에서 분류됩니다. 다른 값(폐기된 external/foothold/tunnel/privilege 포함)은
       기록해도 어떤 단계에도 속하지 않으므로 예전 stage 기준으로 되돌리고 명시적으로 경고합니다. */
    let stageWarning = null
    let stageCode
    if (typeof s.stage_code === 'string' && s.stage_code.trim() !== '') {
      const wanted = s.stage_code.trim()
      if (VALID_STAGE_CODES.includes(wanted)) {
        stageCode = wanted
      } else {
        stageCode = LEGACY_STAGE_MAP[legacyStage] ?? 'recon'
        stageWarning = '잘못된 stage_code="' + wanted + '"(무시됨): 허용되는 값은 ' + VALID_STAGE_CODES.join('/')
          + ' 이며, 이 단계는 stage 기준으로 ' + stageCode + ' 에 배정되었습니다.'
      }
    } else {
      stageCode = LEGACY_STAGE_MAP[legacyStage] ?? 'recon'
    }
    const result = db.prepare(`INSERT INTO attack_step(seq, stage, stage_code, title, detail, asset_id, vuln_id, access_id, point_id, evidence_ref, tool, agent, result, recorded_by, recorded_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      seq, legacyStage, stageCode, s.title ?? '', s.detail ?? null,
      s.asset_id ?? null, s.vuln_id ?? null, s.access_id ?? null, pointId, s.evidence_ref ?? null,
      s.tool ?? null, s.agent ?? null, s.result ?? null,
      s.recorded_by ?? null, nowIso(),
    )
    const stepId = Number(result.lastInsertRowid)
    let hit = null
    let scoreHint = null
    /* point_code 가 있고 evidence 도 주어졌다 → 함께 채점합니다(같은 호출에서 "동작 + 득점" 완료) */
    if (pointId !== null && typeof s.evidence === 'string' && s.evidence.trim() !== '') {
      try {
        hit = this.addScoreHit(id, {
          point_id: pointId, asset_id: s.asset_id ?? null, vuln_id: s.vuln_id ?? null, step_id: stepId,
          target: s.target ?? null, evidence: s.evidence, note: s.note ?? null, recorded_by: s.recorded_by ?? null,
          /* 직접 가입/자체 구축한 계정은 득점하지 않습니다(과정만 남깁니다) */
          self_created: s.self_created,
        })
        /* 서비스 단위 상한(계정류 / DB 권한): 단계는 그대로 저장하지만 이 점수는 더 누적하지 않으며,
           그 이유를 모델에게 반드시 돌려줍니다. 그렇지 않으면 "계정을 또 하나 뚫었으니 또 득점"이라고 착각합니다. */
        if (hit && hit.warning) scoreHint = hit.warning
      } catch (error) {
        /* 단계는 그대로 저장하되 이유를 모델에게 돌려줍니다. 조용히 삼키면 "채점했습니다"가 실은 빈 값이 됩니다 */
        scoreHint = '단계는 저장되었지만 채점에 실패했습니다: ' + (error && error.message ? error.message : String(error))
        }
    } else if (pointId !== null) {
      scoreHint = 'point_code 는 넘겼지만 evidence 가 없어 이번에는 **채점하지 않았습니다**(단계는 저장됨): 채점이 필요하면 redteam_score_hit 을 보완하고, evidence 에는 결과만 적습니다(대상 자산 + 계정/권한/데이터량).'
    }
    return { id: stepId, seq: seq, stage_code: stageCode, point_id: pointId, hit: hit, score_hint: scoreHint, stage_hint: stageWarning }
  }

  listChain(id) {
    return this.db(id).prepare(`SELECT s.*, a.ip AS asset_ip, v.title AS vuln_title, v.severity AS vuln_severity, v.cve AS vuln_cve
      FROM attack_step s
      LEFT JOIN asset a ON a.id = s.asset_id
      LEFT JOIN vuln v ON v.id = s.vuln_id
      ORDER BY s.seq, s.id`).all()
  }

  /* ---------- 공격 파일(실제로 동작한 스크립트/POC/EXP 만 수록) ---------- */

  /* ------------------------------------------------------------------ 증거 스크린샷 */
  /** 스크린샷 저장 디렉터리: `<대상 디렉터리>/shots`. attack-files 와 같은 레벨에 두어 통째로 복사해 납품하기 쉽게 합니다. */
  shotsDirOf(id) { return assertNoLinkedDescendants(this.dirOf(id), join(this.dirOf(id), 'shots')) }

  /**
   * 증거 스크린샷 한 장을 등록합니다(이미지를 대상 디렉터리로 복사하고, DB 에는 파일명과 메타데이터만 저장합니다).
   *
   * kind 를 반드시 명시적으로 구분해야 하는 이유:
   *   · `screenshot` —— 현장 스크린샷으로, 그대로 검수 자료로 쓸 수 있습니다;
   *   · `card`       —— 그날 기록으로 생성한 "증거 요약 카드"이며 **현장 스크린샷이 아닙니다**.
   *   둘을 섞어 두면 검수자가 생성된 카드를 현장 증거로 착각합니다. 가장 나오면 안 되는 사고이므로
   *   DB 에 kind 를 저장하고, 패널과 보고서는 모두 이 값에 따라 색과 문구를 다르게 표시합니다.
   *
   * @param id - 대상 id.
   * @param shot - `{ path | data_base64, label, note, kind, point_code, hit_id, asset_id, target, source_ref, captured_at, agent }`
   */
  addShot(id, shot = {}) {
    const db = this.db(id)
    const dir = this.shotsDirOf(id)
    mkdirSync(dir, { recursive: true })
    const kind = shot.kind === 'card' ? 'card' : 'screenshot'
    /* 파일명: 명시적으로 주어지면 그 값을 쓰고(경로 구분자는 제거), 아니면 시간-점수 항목-일련번호로 생성 */
    const ext = (() => {
      const src = String(shot.path || '')
      const m = /\.([A-Za-z0-9]{2,5})$/.exec(src)
      return m === null ? 'png' : m[1].toLowerCase()
    })()
    const stamp = String(shot.captured_at || new Date().toISOString()).replace(/[-:T]/g, '').slice(0, 14)
    const slug = String(shot.point_code || 'shot').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 24) || 'shot'
    let file = String(shot.file || '').trim().replace(/[/\\]/g, '-')
    if (file === '') {
      let n = 1
      do { file = stamp + '-' + slug + '-' + String(n).padStart(2, '0') + '.' + ext; n += 1 }
      while (existsSync(join(dir, file)))
    }
    const dest = assertNoLinkedDescendants(dir, join(dir, pathComponent(file)))
    let buf = null
    if (typeof shot.data_base64 === 'string' && shot.data_base64.trim() !== '') {
      buf = Buffer.from(shot.data_base64.replace(/^data:[^,]+,/, ''), 'base64')
    } else if (typeof shot.path === 'string' && shot.path.trim() !== '') {
      const src = assertSourcePath(this.dirOf(id), shot.path)
      if (!existsSync(src)) throw new Error('shot source not found: ' + shot.path)
      buf = readFileSync(src)
    } else {
      throw new Error('shot path or data_base64 required')
    }
    if (buf.length === 0) throw new Error('shot file is empty')
    writeFileSync(dest, buf)
    const mime = /^\x89PNG/.test(buf.slice(0, 4).toString('latin1')) ? 'image/png'
      : (buf.slice(0, 2).toString('latin1') === '\xff\xd8' ? 'image/jpeg'
        : (buf.slice(0, 4).toString('latin1') === 'RIFF' ? 'image/webp' : 'application/octet-stream'))
    const dim = pngSize(buf)
    const pointId = (() => {
      const code = String(shot.point_code || '').trim()
      if (code === '') return shot.point_id === undefined || shot.point_id === null ? null : Number(shot.point_id)
      const row = db.prepare('SELECT id FROM score_point WHERE code = ?').get(code)
      return row === undefined ? null : Number(row.id)
    })()
    const now = nowIso()
    const cur = db.prepare(`INSERT INTO shot (point_id, hit_id, asset_id, vuln_id, target, label, note,
        file, kind, mime, bytes, width, height, sha256, source_ref, captured_at, found_by_agent, agent, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      pointId,
      shot.hit_id === undefined || shot.hit_id === null ? null : Number(shot.hit_id),
      shot.asset_id === undefined || shot.asset_id === null ? null : Number(shot.asset_id),
      shot.vuln_id === undefined || shot.vuln_id === null ? null : Number(shot.vuln_id),
      String(shot.target || '').trim() || null,
      String(shot.label || '').trim() || null,
      String(shot.note || '').trim() || null,
      file, kind, mime, buf.length, dim.width, dim.height,
      createHash('sha256').update(buf).digest('hex'),
      String(shot.source_ref || shot.path || '').trim() || null,
      String(shot.captured_at || now).trim(),
      String(shot.agent || '').trim() || null,
      String(shot.agent || '').trim() || null,
      now,
    )
    return { ok: true, id: Number(cur.lastInsertRowid), file: file, kind: kind, bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex') }
  }

  /** 증거 스크린샷 목록(점수 항목 / 적중 / 자산으로 필터링 가능). */
  listShots(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.point_code !== undefined && f.point_code !== null && String(f.point_code) !== '') {
      where.push('s.point_id = (SELECT id FROM score_point WHERE code = ?)')
      args.push(String(f.point_code))
    }
    for (const [col, key] of [['hit_id', 'hit_id'], ['asset_id', 'asset_id'], ['vuln_id', 'vuln_id']]) {
      if (f[key] !== undefined && f[key] !== null && String(f[key]) !== '') {
        where.push('s.' + col + ' = ?')
        args.push(Number(f[key]))
      }
    }
    const sql = `SELECT s.*, p.code AS point_code, p.name AS point_name
      FROM shot s LEFT JOIN score_point p ON p.id = s.point_id
      ${where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY s.captured_at, s.id LIMIT ?`
    const items = db.prepare(sql).all(...args, Math.min(Number(f.limit) || 500, 2000))
    return { ok: true, items: items.map((x) => Object.assign({}, x, { url: this.shotUrlOf(id, x) })), total: items.length }
  }

  /** 스크린샷의 접근 가능한 참조: 패널/보고서에 넣는 값(대상 디렉터리 기준 상대 경로). */
  shotUrlOf(id, shot) { return 'shots/' + shot.file }

  /** 스크린샷 한 장을 삭제합니다(디스크 파일 포함). */
  deleteShot(id, shotId) {
    const db = this.db(id)
    const row = db.prepare('SELECT * FROM shot WHERE id = ?').get(Number(shotId))
    if (row === undefined) throw new Error('shot not found: ' + shotId)
    const p = assertNoLinkedDescendants(this.shotsDirOf(id), join(this.shotsDirOf(id), pathComponent(row.file)))
    rmSync(p, { force: true })
    db.prepare('DELETE FROM shot WHERE id = ?').run(Number(shotId))
    return { ok: true, id: Number(shotId) }
  }

  /**
   * 스크린샷 한 장의 바이트를 읽습니다(패널은 `<img src="data:...">` 로 표시).
   * 정적 라우트를 새로 열지 않고 base64 를 씁니다: 이 HTTP 브리지는 이미 동일 출처 검증을 하고 있는데,
   * 파일명으로 임의 경로를 읽을 수 있는 정적 진입점을 하나 더 열면 검증을 우회해 대상 디렉터리를 읽는 것과 같아집니다.
   */
  readShot(id, shotId) {
    const db = this.db(id)
    const row = db.prepare('SELECT * FROM shot WHERE id = ?').get(Number(shotId))
    if (row === undefined) throw new Error('shot not found: ' + shotId)
    const p = assertPathWithin(join(this.shotsDirOf(id), row.file), [this.shotsDirOf(id)])
    if (!existsSync(p)) throw new Error('shot file missing on disk: ' + row.file)
    const buf = readFileSync(p)
    return { ok: true, id: Number(row.id), mime: row.mime || 'image/png', bytes: buf.length, base64: buf.toString('base64') }
  }

  /**
   * 여러 채점 항목에 "대표 스크린샷"을 붙입니다. **점수 항목당 최대 3장**(단말 권한 같은 대량 점수 항목은 수십 건이 적중되는데,
   * 건마다 그림을 붙이면 정보량도 없고 페이지와 보고서가 터집니다).
   *
   * 선택 우선순위: 적중 단위 > 점수 항목+대상 단위 > 점수 항목 단위. 같은 우선순위에서는 현장 스크린샷이 생성된 증거 카드보다 우선합니다.
   *
   * @param id - 대상 id.
   * @param groups - `[{ point_id, point_code, hit_ids: number[], asset_id, target }]`
   * @param limit - 점수 항목당 최대 장수(기본 3).
   */
  #representativeShots(id, groups, limit = 3) {
    const db = this.db(id)
    let all = []
    try { all = db.prepare('SELECT * FROM shot ORDER BY captured_at, id').all() } catch { all = [] }
    if (all.length === 0) return new Map()
    const byHit = new Map()
    const byPoint = new Map()
    for (const sh of all) {
      if (sh.hit_id !== null && sh.hit_id !== undefined) {
        if (!byHit.has(Number(sh.hit_id))) byHit.set(Number(sh.hit_id), [])
        byHit.get(Number(sh.hit_id)).push(sh)
      }
      if (sh.point_id !== null && sh.point_id !== undefined) {
        if (!byPoint.has(Number(sh.point_id))) byPoint.set(Number(sh.point_id), [])
        byPoint.get(Number(sh.point_id)).push(sh)
      }
    }
    const rank = (sh) => (sh.kind === 'card' ? 1 : 0)
    const out = new Map()
    for (const g of groups) {
      /* 후보 풀을 "연결 강도"로 계층화합니다: 적중 단위 → 대상/자산 단위 → 점수 항목 단위.
         같은 계층 안에서는 **현장 스크린샷이 생성된 증거 카드보다 우선**하고, 그다음 시간순으로 정렬합니다. 그렇지 않으면 대량 점수 항목에서
         나중에 추가된 카드가 진짜 스크린샷을 밀어내 상위 3장에서 탈락합니다(실측: 단말 60대에서 카드 3장만 뽑혔습니다). */
      const pool = []
      for (const hid of (g.hit_ids || [])) pool.push(...(byHit.get(Number(hid)) || []))
      const pointShots = byPoint.get(Number(g.point_id)) || []
      for (const sh of pointShots) {
        if (g.target && sh.target && String(sh.target) === String(g.target)) pool.push(sh)
        else if (g.asset_id !== null && g.asset_id !== undefined && sh.asset_id === g.asset_id) pool.push(sh)
      }
      for (const sh of pointShots) pool.push(sh)
      const picked = []
      const seen = new Set()
      const ordered = pool.slice().sort((a, b) => rank(a) - rank(b)
        || String(a.captured_at || '').localeCompare(String(b.captured_at || ''))
        || Number(a.id) - Number(b.id))
      for (const sh of ordered) {
        if (sh === undefined || sh === null || seen.has(sh.id)) continue
        seen.add(sh.id)
        picked.push(sh)
        if (picked.length >= limit) break
      }
      out.set(Number(g.point_id), picked)
    }
    return out
  }

  /** 공격 파일 루트 디렉터리: `<대상>/attack-files/<목표>/…` */
  attackFilesDirOf(id) { return assertNoLinkedDescendants(this.dirOf(id), join(this.dirOf(id), 'attack-files')) }

  /**
   * 공격 파일을 “목표 폴더”에 저장하고 등록합니다. evidence 는 필수입니다. 실제로 동작한 것만 수록합니다.
   * @param id - 대상 id.
   * @param f - `{ target, name, kind, content|path, description, evidence, asset_id?, vuln_id?, created_by? }`
   */
  addAttackFile(id, f = {}) {
    const db = this.db(id)
    const target = String(f.target || '').trim()
    if (target === '') throw new Error('attack file target required(IP / URL / C 블록)')
    const name = String(f.name || '').trim().replace(/[/\\]/g, '-')
    if (name === '') throw new Error('attack file name required')
    const evidence = String(f.evidence || '').trim()
    if (evidence === '') throw new Error('attack file evidence required: 실제로 동작한 스크립트/POC/EXP 만 수록하며, 검증한 효과를 반드시 적어야 합니다')
    const slug = slugTarget(target)
    const root = this.attackFilesDirOf(id)
    const dir = join(root, pathComponent(slug))
    /* target 이 `..`/`.` 이면 slugTarget 이 그대로 돌려주므로, join 하면 attack-files/ 밖으로 나가 버립니다.
       쓰기 경로도 루트 디렉터리 검증을 한 번 거쳐, 파일이 반드시 이 대상 디렉터리 안에 떨어지게 합니다. */
    const filePath = assertNoLinkedDescendants(root, join(dir, pathComponent(name)))
    mkdirSync(dir, { recursive: true })
    if (typeof f.content === 'string' && f.content.length > 0) {
      writeFileSync(filePath, f.content, 'utf8')
    } else if (typeof f.path === 'string' && f.path.length > 0) {
      const src = assertSourcePath(this.dirOf(id), f.path)
      if (!existsSync(src)) throw new Error('source path not found: ' + f.path)
      copyFileSync(src, filePath)
    } else {
      throw new Error('attack file content or path required')
    }
    const kind = ['poc', 'exp', 'script', 'wordlist', 'other'].includes(f.kind) ? f.kind : 'script'
    db.prepare(`INSERT INTO attack_file(target, target_kind, name, kind, path, description, evidence, asset_id, vuln_id, created_by, created_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(target, name) DO UPDATE SET
        kind = excluded.kind, path = excluded.path, description = excluded.description,
        evidence = excluded.evidence, created_at = excluded.created_at`).run(
      target, f.target_kind ?? null, name, kind, filePath,
      f.description ?? null, evidence, f.asset_id ?? null, f.vuln_id ?? null,
      f.created_by ?? null, nowIso(),
    )
    return { target, name, kind, path: filePath }
  }

  listAttackFiles(id, f = {}) {
    const db = this.db(id)
    const where = []
    const args = []
    if (f.target) { where.push('target = ?'); args.push(f.target) }
    if (f.kind) { where.push('kind = ?'); args.push(f.kind) }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    return db.prepare(`SELECT * FROM attack_file ${clause} ORDER BY target, name`).all(...args)
  }

  /** 공격 파일을 목표별로 묶습니다(각 IP / URL / C 블록마다 폴더 하나). */
  attackFileTree(id) {
    const groups = new Map()
    for (const row of this.listAttackFiles(id, {})) {
      if (!groups.has(row.target)) groups.set(row.target, { target: row.target, folder: slugTarget(row.target), count: 0, files: [] })
      const g = groups.get(row.target)
      g.files.push(row)
      g.count++
    }
    return Array.from(groups.values()).sort((a, b) => b.count - a.count || a.target.localeCompare(b.target))
  }

  readAttackFile(id, fileId) {
    const row = this.db(id).prepare('SELECT * FROM attack_file WHERE id = ?').get(Number(fileId))
    if (row === undefined) return undefined
    let content = ''
    try {
      /* path 는 DB 열에서 온 값(에이전트가 기록)입니다. 반드시 이 대상 디렉터리 안으로 제한해야 하며, 그렇지 않으면 패널이 임의 파일 읽기 도구가 됩니다 */
      const safe = assertPathWithin(row.path, [this.dirOf(id)])
      content = readFileSync(safe, 'utf8')
    } catch (error) {
      content = '(거부되었거나 읽기 실패: ' + (error && error.message ? error.message : String(error)) + ')'
    }
    return { ...row, content }
  }

  /* ---------- 지식 베이스: 범용 POC / EXP(전역 공유, 대상 간 재사용) ---------- */

  knowledgePath() { return join(this.root, 'knowledge.db') }

  /** 이 PC 의 nuclei 템플릿 디렉터리를 찾습니다(템플릿이 설치되어 있어야 하며, 없으면 undefined). */
  nucleiTemplatesDir() {
    /* 환경 설정에서 직접 입력했거나 자동 배정된 경로를 우선합니다(특히 Windows 는 이 항목에 의존합니다) */
    try {
      const configured = nucleiTemplatesDirOf(loadPlatformConfig(this.root), this.root)
      if (configured) return configured
    } catch { /* 설정 읽기 실패는 무시하고 기본 탐지를 계속합니다 */ }
    const candidates = [
      join(this.root, 'toolkit', 'nuclei-templates'),
      join(homedir(), '.local', 'nuclei-templates'),
      join(homedir(), 'nuclei-templates'),
      '/usr/share/nuclei-templates',
      '/opt/nuclei-templates',
    ]
    return candidates.find((p) => existsSync(p))
  }

  #nucleiIndexPath() { return join(this.pocsDirOf(), '.nuclei-index.json') }

  /**
   * 템플릿 인덱스(필요할 때 구축 + 디스크 캐시): 13k 개 yaml 을 하나씩 파싱하면 너무 느리므로
   * path / name / severity / tags 등 검색용 필드만 뽑아 한 번 구축한 뒤 계속 재사용합니다.
   */
  #nucleiIndex(force) {
    const dir = this.nucleiTemplatesDir()
    if (dir === undefined) return { dir: null, items: [] }
    const cachePath = this.#nucleiIndexPath()
    if (force !== true && existsSync(cachePath)) {
      try {
        const cached = JSON.parse(readFileSync(cachePath, 'utf8'))
        /* 디렉터리가 바뀌지 않았고 캐시가 7일을 넘지 않았으면 그대로 씁니다 */
        const fresh = cached && cached.dir === dir && Array.isArray(cached.items)
          && (Date.now() - Number(cached.built_at || 0) < 7 * 24 * 3600 * 1000)
        if (fresh) return { dir, items: cached.items, cached: true }
      } catch { /* 캐시가 깨졌으면 다시 만듭니다 */ }
    }
    const items = []
    const walk = (base, rel) => {
      let entries = []
      try { entries = readdirSync(join(base, rel), { withFileTypes: true }) } catch { return }
      for (const e of entries) {
        const next = rel === '' ? e.name : rel + '/' + e.name
        if (e.isDirectory()) { walk(base, next); continue }
        if (!/\.ya?ml$/i.test(e.name)) continue
        let head = ''
        try { head = readFileSync(join(base, next), 'utf8').slice(0, 2000) } catch { continue }
        const pick = (re) => { const m = re.exec(head); return m === null ? '' : String(m[1]).trim().replace(/^["']|["']$/g, '') }
        items.push([
          next,
          pick(/^\s*name:\s*(.+)$/m),
          pick(/^\s*severity:\s*(.+)$/m),
          pick(/^\s*tags:\s*(.+)$/m),
        ])
      }
    }
    walk(dir, '')
    try {
      mkdirSync(this.pocsDirOf(), { recursive: true })
      writeFileSync(cachePath, JSON.stringify({ built_at: Date.now(), dir, items }), 'utf8')
    } catch { /* 캐시를 쓰지 못해도 검색에는 영향이 없습니다 */ }
    return { dir, items, cached: false }
  }

  /** 템플릿 라이브러리 개요(화면과 에이전트의 "먼저 있는 것부터 찾기" 양쪽에서 씁니다). */
  templateStats() {
    const { dir, items } = this.#nucleiIndex()
    const cve = items.filter((x) => /cve-\d{4}-\d+/i.test(x[0])).length
    return { dir: dir || null, total: items.length, cve }
  }

  /**
   * 이 PC 의 nuclei 템플릿 라이브러리에서 검색합니다: CVE 번호는 파일명만으로 적중하고, 컴포넌트/키워드는 name 과 tags 로 매칭합니다.
   * "지식 베이스에는 없지만 이 PC 에 이미 있는 POC"를 찾는 계층이며, 먼저 여기서 찾으면 인터넷 검색 한 라운드를 아낄 수 있습니다.
   */
  searchTemplates(q, limit = 40) {
    const { dir, items } = this.#nucleiIndex()
    if (dir === null) return { dir: null, total: 0, items: [] }
    const raw = String(q || '').trim()
    if (raw === '') return { dir, total: items.length, items: [] }
    const needle = raw.toLowerCase()
    const out = []
    for (const [path, name, severity, tags] of items) {
      const hay = (path + ' ' + name + ' ' + tags).toLowerCase()
      if (hay.includes(needle)) out.push({ path, name, severity, tags })
      if (out.length >= limit) break
    }
    return { dir, total: items.length, items: out }
  }


  pocsDirOf() { return join(this.root, 'pocs') }

  /** 전역 지식 베이스를 열거나(필요하면 생성합니다) 엽니다. 대상 라이브러리와 분리되어 대상 간에 공유됩니다. */
  kb() {
    if (this.kbHandle) return this.kbHandle
    mkdirSync(this.root, { recursive: true })
    mkdirSync(this.pocsDirOf(), { recursive: true })
    const handle = new DatabaseSync(this.knowledgePath())
    /* 위와 동일: FTS5 가 없으면 poc_fts 를 만들지 않고, POC 검색은 LIKE 로 퇴화합니다(searchPocs 참고) */
    handle.exec(HAS_FTS5 ? KNOWLEDGE_DDL + POC_FTS_DDL : KNOWLEDGE_DDL)
    migrateKnowledge(handle)
    this.kbHandle = handle
    return handle
  }

  #reindexPoc(db, pocId) {
    if (!HAS_FTS5) return   /* FTS5 가 없으면 인덱스 테이블을 만들지 않습니다. POC 검색은 LIKE 로 처리합니다(searchPocs 의 폴백 참고) */
    db.prepare('DELETE FROM poc_fts WHERE poc_id = ?').run(String(pocId))
    const p = db.prepare('SELECT * FROM poc WHERE id = ?').get(pocId)
    if (!p) return
    db.prepare('INSERT INTO poc_fts(poc_id, title, cve, component, versions, tags, description, content) VALUES(?,?,?,?,?,?,?,?)')
      .run(String(p.id), p.title, p.cve || '', p.component || '', p.versions || '', p.tags || '', p.description || '', p.content || '')
  }

  /**
   * 범용 POC/EXP 한 건을 저장합니다. 같은 이름(code)은 병합 갱신되어, "같은 취약점의 신버전 POC"가 구버전을 덮어쓸 수 있습니다.
   * @param p - `{ title, kind, cve, component, versions, severity, language, source, source_url,
   *               description, usage, content|path, verified, verified_note, tags, created_by }`
   */
  savePoc(p = {}) {
    const db = this.kb()
    const title = String(p.title || '').trim()
    if (title === '') throw new Error('poc.title required(어떤 취약점/컴포넌트의 POC 인지 명확히 적어야 합니다)')
    const kind = POC_KINDS.includes(p.kind) ? p.kind : (String(p.kind || '').toLowerCase() === 'exp' ? 'exp' : 'poc')
    const source = POC_SOURCES.includes(p.source) ? p.source : 'self'
    /* code 는 디렉터리 이름으로 쓰이므로 반드시 정화해야 합니다. `code='../../escaped-poc'` 로 데이터 루트 밖에 본문을 쓸 수 있었습니다
       (deletePoc 에는 일찍부터 startsWith 방어가 있었지만 쓰기 경로에는 빠져 있었습니다). 여기서는 slugPoc 의 정화 규칙을 그대로 적용합니다. */
    const rawCode = String(p.code || '').trim()
    const code = rawCode === '' ? slugPoc(title, p.cve) : rawCode.replace(/[^\w.\u4e00-\u9fa5-]+/g, '-').replace(/^[.-]+/, '')
    if (code === '') throw new Error('poc.code invalid(정화 후 빈 값입니다. 영문/숫자/한글/하이픈을 사용합니다)')
    const dir = assertPathWithin(join(this.pocsDirOf(), code), [this.pocsDirOf()])
    mkdirSync(dir, { recursive: true })

    /* 본문: 전달된 content 를 우선 쓰고, 없으면 path 에서 읽습니다. 둘 다 없으면 메타데이터만 등록합니다 */
    let content = typeof p.content === 'string' ? p.content : ''
    if (content === '' && typeof p.path === 'string' && p.path.length > 0) {
      const src = isAbsolute(p.path) ? p.path : join(this.pocsDirOf(), p.path)
      if (!existsSync(src)) throw new Error('poc content or existing path required: ' + p.path)
      content = readFileSync(src, 'utf8')
    }
    let filePath = null
    if (content !== '') {
      /* filename 에도 경로 구분자가 있으면 code 디렉터리 밖으로 다시 튀어나갈 수 있습니다 */
      const filename = String(p.filename || '').trim().replace(/[/\\]/g, '-') || defaultPocFilename(title, kind, p.language)
      filePath = assertPathWithin(join(dir, filename), [this.pocsDirOf()])
      writeFileSync(filePath, content, 'utf8')
    }
    const existing = db.prepare('SELECT * FROM poc WHERE code = ?').get(code)
    const verified = p.verified === undefined || p.verified === null
      ? (existing ? existing.verified : 0)
      : (p.verified ? 1 : 0)
    const now = nowIso()
    /* 분류: 사용자 정의 값도 허용하지만, 내장 code 가 아니면 모두 other 로 보내 패널에 표기 변형이 쌓이지 않게 합니다 */
    const rawCategory = String(p.category || (existing ? existing.category : '') || '').trim()
    const category = rawCategory === ''
      ? 'other'
      : (POC_CATEGORIES.some((c) => c.code === rawCategory) ? rawCategory : 'other')
    db.prepare(`INSERT INTO poc(code, title, kind, category, cve, component, versions, severity, language, source, source_url,
        description, usage, content, path, verified, verified_note, hit_count, used_on, tags,
        engagement_id, engagement_name, asset_target, found_by_agent, created_by, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(code) DO UPDATE SET
        title = excluded.title, kind = excluded.kind, category = excluded.category,
        cve = COALESCE(excluded.cve, poc.cve),
        component = COALESCE(excluded.component, poc.component), versions = COALESCE(excluded.versions, poc.versions),
        severity = COALESCE(excluded.severity, poc.severity), language = COALESCE(excluded.language, poc.language),
        source = excluded.source, source_url = COALESCE(excluded.source_url, poc.source_url),
        description = COALESCE(excluded.description, poc.description), usage = COALESCE(excluded.usage, poc.usage),
        content = CASE WHEN excluded.content <> '' THEN excluded.content ELSE poc.content END,
        path = COALESCE(excluded.path, poc.path),
        verified = excluded.verified, verified_note = COALESCE(excluded.verified_note, poc.verified_note),
        engagement_id = COALESCE(excluded.engagement_id, poc.engagement_id),
        engagement_name = COALESCE(excluded.engagement_name, poc.engagement_name),
        asset_target = COALESCE(excluded.asset_target, poc.asset_target),
        found_by_agent = COALESCE(excluded.found_by_agent, poc.found_by_agent),
        tags = COALESCE(excluded.tags, poc.tags), updated_at = excluded.updated_at`).run(
      code, title, kind, category, p.cve ?? null, p.component ?? null, p.versions ?? null, p.severity ?? null,
      p.language ?? null, source, p.source_url ?? null, p.description ?? null, p.usage ?? null,
      content, filePath, verified, p.verified_note ?? null,
      existing ? existing.hit_count : 0, existing ? existing.used_on : null, p.tags ?? null,
      p.engagement_id ?? null, p.engagement_name ?? null, p.asset_target ?? null, p.found_by_agent ?? null,
      p.created_by ?? null, existing ? existing.created_at : now, now,
    )
    const row = db.prepare('SELECT * FROM poc WHERE code = ?').get(code)
    this.#reindexPoc(db, row.id)
    return { poc: row, created: existing === undefined, path: filePath }
  }

  /**
   * 지식 베이스 검색: Nday/1day 작업을 시작하기 전의 첫 단계.
   * @param f - `{ q, cve, component, kind, language, source, verified, tag, limit }`
   */
  searchPocs(f = {}) {
    const db = this.kb()
    const where = []
    const args = []
    const q = String(f.q || f.query || '').trim()
    if (q !== '') {
      /* 전문 검색 우선(제목/번호/컴포넌트/버전/태그/설명/본문), 적중하지 않으면 LIKE 부분 문자열 매칭으로 퇴화합니다 */
      const match = q.split(/\s+/).filter(Boolean).map((t) => '"' + t.replace(/"/g, '') + '"').join(' AND ')
      let ids = []
      try {
        ids = db.prepare('SELECT poc_id FROM poc_fts WHERE poc_fts MATCH ? LIMIT 200').all(match).map((r) => Number(r.poc_id))
      } catch { ids = [] }
      if (ids.length === 0) {
        const like = '%' + q + '%'
        ids = db.prepare(`SELECT id FROM poc WHERE title LIKE ? OR cve LIKE ? OR component LIKE ?
          OR versions LIKE ? OR tags LIKE ? OR description LIKE ? OR content LIKE ? LIMIT 200`)
          .all(like, like, like, like, like, like, like).map((r) => r.id)
      }
      if (ids.length === 0) return []
      where.push(`id IN (${ids.map(() => '?').join(',')})`)
      args.push(...ids)
    }
    if (f.cve) { where.push('cve LIKE ?'); args.push('%' + String(f.cve) + '%') }
    if (f.component) { where.push('component LIKE ?'); args.push('%' + String(f.component) + '%') }
    if (f.kind) { where.push('kind = ?'); args.push(String(f.kind)) }
    /* 분류 필터: 한 번에 여러 개를 줄 수 있습니다(category=rce,tunnel) */
    if (f.category) {
      const list = String(f.category).split(',').map((x) => x.trim()).filter(Boolean)
      if (list.length > 1) { where.push(`COALESCE(NULLIF(category, ''), 'other') IN (${list.map(() => '?').join(',')})`); args.push(...list) }
      else if (list.length === 1) { where.push("COALESCE(NULLIF(category, ''), 'other') = ?"); args.push(list[0]) }
    }
    /* 출처 추적 필터: 이 지식이 어느 대상 / 어느 자산에서 발견되고 검증되었는지 */
    if (f.engagement) {
      where.push('(engagement_id = ? OR engagement_name LIKE ?)')
      args.push(String(f.engagement), '%' + String(f.engagement) + '%')
    }
    if (f.asset_target) { where.push('asset_target LIKE ?'); args.push('%' + String(f.asset_target) + '%') }
    if (f.language) { where.push('language = ?'); args.push(String(f.language)) }
    if (f.source) { where.push('source = ?'); args.push(String(f.source)) }
    if (f.tag) { where.push('tags LIKE ?'); args.push('%' + String(f.tag) + '%') }
    if (f.verified === true || f.verified === 1) where.push('verified = 1')
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const limit = Math.min(Number(f.limit) || 200, 1000)
    return db.prepare(`SELECT id, code, title, kind, category, cve, component, versions, severity, language, source, source_url,
        description, usage, path, verified, verified_note, hit_count, used_on, tags,
        engagement_id, engagement_name, asset_target, found_by_agent, created_by, created_at, updated_at,
        LENGTH(COALESCE(content, '')) AS content_bytes,
        CASE WHEN COALESCE(content, '') = '' THEN 0 ELSE 1 END AS has_content
      FROM poc ${clause} ORDER BY verified DESC, hit_count DESC, updated_at DESC, id DESC LIMIT ?`).all(...args, limit)
  }

  /** POC 한 건의 전체 내용을 가져옵니다(에이전트가 바로 쓰므로 본문까지 함께 줍니다). */
  getPoc(key) {
    const db = this.kb()
    const raw = String(key === undefined || key === null ? '' : key).trim()
    if (raw === '') return undefined
    const numeric = Number(raw)
    const row = Number.isFinite(numeric) && String(numeric) === raw
      ? db.prepare('SELECT * FROM poc WHERE id = ?').get(numeric)
      : db.prepare('SELECT * FROM poc WHERE code = ?').get(raw)
    if (row === undefined) return undefined
    let content = row.content || ''
    if (content === '' && row.path) {
      try {
        /* readAttackFile 과 동일: path 는 DB 열이므로 읽기 전에 pocs/ 안으로 제한합니다 */
        content = readFileSync(assertPathWithin(row.path, [this.pocsDirOf()]), 'utf8')
      } catch { content = '' }
    }
    return { ...row, content }
  }

  /** POC 한 건이 사용되었음을 표시합니다(이후 재사용 횟수로 정렬해 많이 쓴 것을 앞에 둡니다). */
  markPocUsed(key, usedOn) {
    const db = this.kb()
    const row = this.getPoc(key)
    if (row === undefined) return { ok: false, error: 'poc not found: ' + key }
    db.prepare('UPDATE poc SET hit_count = COALESCE(hit_count, 0) + 1, used_on = ?, updated_at = ? WHERE id = ?')
      .run(usedOn ?? null, nowIso(), row.id)
    return { ok: true, id: row.id, code: row.code, hit_count: (row.hit_count || 0) + 1 }
  }

  /** 검증 결론을 보충합니다: 검증된 POC 만 "바로 사용 가능"으로 인정하며 화면에 표시됩니다. */
  updatePoc(key, patch = {}) {
    const db = this.kb()
    const row = this.getPoc(key)
    if (row === undefined) throw new Error('poc not found: ' + key)
    const next = {
      title: patch.title ?? row.title,
      kind: patch.kind ?? row.kind,
      category: patch.category ?? row.category,
      cve: patch.cve ?? row.cve,
      component: patch.component ?? row.component,
      versions: patch.versions ?? row.versions,
      severity: patch.severity ?? row.severity,
      language: patch.language ?? row.language,
      source: patch.source ?? row.source,
      source_url: patch.source_url ?? row.source_url,
      description: patch.description ?? row.description,
      usage: patch.usage ?? row.usage,
      verified: patch.verified === undefined || patch.verified === null ? row.verified : (patch.verified ? 1 : 0),
      verified_note: patch.verified_note ?? row.verified_note,
      tags: patch.tags ?? row.tags,
      engagement_id: patch.engagement_id ?? row.engagement_id,
      engagement_name: patch.engagement_name ?? row.engagement_name,
      asset_target: patch.asset_target ?? row.asset_target,
      found_by_agent: patch.found_by_agent ?? row.found_by_agent,
      content: typeof patch.content === 'string' && patch.content !== '' ? patch.content : row.content,
      path: row.path,
    }
    if (next.content !== row.content) {
      const filename = 'poc.txt'
      const dir = join(this.pocsDirOf(), row.code)
      mkdirSync(dir, { recursive: true })
      next.path = join(dir, row.path ? basename(row.path) : filename)
      writeFileSync(next.path, next.content || '', 'utf8')
    }
    db.prepare(`UPDATE poc SET title = ?, kind = ?, category = ?, cve = ?, component = ?, versions = ?, severity = ?, language = ?,
      source = ?, source_url = ?, description = ?, usage = ?, verified = ?, verified_note = ?, tags = ?,
      engagement_id = ?, engagement_name = ?, asset_target = ?, found_by_agent = ?, content = ?, path = ?, updated_at = ?
      WHERE id = ?`).run(
      next.title, next.kind, next.category, next.cve, next.component, next.versions, next.severity, next.language,
      next.source, next.source_url, next.description, next.usage, next.verified, next.verified_note,
      next.tags, next.engagement_id, next.engagement_name, next.asset_target, next.found_by_agent,
      next.content, next.path, nowIso(), row.id,
    )
    this.#reindexPoc(db, row.id)
    return this.getPoc(row.id)
  }

  deletePoc(key) {
    const db = this.kb()
    const row = this.getPoc(key)
    if (row === undefined) return { ok: false, error: 'poc not found: ' + key }
    db.prepare('DELETE FROM poc WHERE id = ?').run(row.id)
    if (HAS_FTS5) db.prepare('DELETE FROM poc_fts WHERE poc_id = ?').run(String(row.id))
    /* 저장 디렉터리까지 함께 삭제합니다(pocs/ 안에서 code 로 정확히 삭제하며, 삭제 실패는 데이터 일관성에 영향을 주지 않습니다) */
    let removedFiles = 0
    try {
      const dir = join(this.pocsDirOf(), row.code)
      if (existsSync(dir) && dir.startsWith(this.pocsDirOf())) {
        removedFiles = readdirSync(dir).length
        removeTreeNoFollowSync(dir)
      }
    } catch { /* 무시 */ }
    return { ok: true, id: row.id, code: row.code, deleted: true, removed_files: removedFiles }
  }

  /** 지식 베이스 개요: 화면 상단 탭과 에이전트의 "먼저 라이브러리 확인"용 한 화면 요약. */
  pocStats() {
    const db = this.kb()
    const one = (sql, ...args) => Object.values(db.prepare(sql).get(...args) || {})[0] ?? 0
    const byKind = db.prepare('SELECT COALESCE(kind, ?) AS kind, COUNT(*) AS n FROM poc GROUP BY kind ORDER BY n DESC').all('poc')
    const bySource = db.prepare('SELECT COALESCE(source, ?) AS source, COUNT(*) AS n FROM poc GROUP BY source ORDER BY n DESC').all('self')
    const topComponents = db.prepare(`SELECT component, COUNT(*) AS n FROM poc WHERE component IS NOT NULL AND component <> ''
      GROUP BY component ORDER BY n DESC, component LIMIT 12`).all()
    /* 분류: 패널이 이 값으로 그룹을 만들고, 에이전트도 "어떤 무기가 몇 개 쌓였는지" 알 수 있습니다.
       순서는 내장 분류표를 따릅니다(수량순이 아닙니다). 그래야 패널 그룹이 안정적으로 유지되고 계속 순서가 바뀌지 않습니다. */
    const catRows = db.prepare("SELECT COALESCE(NULLIF(category, ''), 'other') AS category, COUNT(*) AS n, SUM(verified) AS verified FROM poc GROUP BY category").all()
    const catMap = new Map(catRows.map((r) => [r.category, r]))
    const byCategory = POC_CATEGORIES.map((c) => {
      const row = catMap.get(c.code)
      return { code: c.code, name: c.name, hint: c.hint, n: row ? row.n : 0, verified: row ? (row.verified || 0) : 0 }
    })
    /* 내장 표 외의 분류(사용자 정의)도 함께 나열해 사라지지 않게 합니다 */
    for (const [code, row] of catMap) {
      if (POC_CATEGORIES.some((c) => c.code === code)) continue
      byCategory.push({ code, name: pocCategoryName(code), hint: '', n: row.n, verified: row.verified || 0 })
    }
    /* 출처 대상: 각 지식이 어느 대상에서 발견/검증되었는지(대상별 집계 + 최근 생성 시각) */
    const byEngagement = db.prepare(`SELECT COALESCE(NULLIF(engagement_name, ''), NULLIF(engagement_id, ''), '(출처 대상 미표기)') AS engagement,
        COUNT(*) AS n, MAX(created_at) AS latest FROM poc GROUP BY engagement ORDER BY n DESC, latest DESC LIMIT 30`).all()
    /* 발견 자산: 상위 자산(같은 경험 하나가 여러 자산에 걸쳐 있는 경우가 많습니다) */
    const topAssets = db.prepare(`SELECT asset_target, COUNT(*) AS n FROM poc WHERE COALESCE(asset_target, '') <> ''
      GROUP BY asset_target ORDER BY n DESC, asset_target LIMIT 15`).all()
    return {
      total: one('SELECT COUNT(*) FROM poc'),
      verified: one('SELECT COUNT(*) FROM poc WHERE verified = 1'),
      withContent: one("SELECT COUNT(*) FROM poc WHERE COALESCE(content, '') <> ''"),
      reused: one('SELECT COALESCE(SUM(hit_count), 0) FROM poc'),
      /* 분류가 없는 항목 수: 패널이 "미분류 N건 남음"을 알립니다 */
      uncategorized: one("SELECT COUNT(*) FROM poc WHERE COALESCE(NULLIF(category, ''), 'other') = 'other'"),
      earliest: one('SELECT MIN(created_at) FROM poc'),
      latest: one('SELECT MAX(created_at) FROM poc'),
      byKind, bySource, byCategory, byEngagement, topAssets, topComponents,
      categories: POC_CATEGORIES,
      dbPath: this.knowledgePath(),
    }
  }

  /**
   * 목표별로 묶은 성과 보고서: 각 IP / URL / C 블록마다 한 건씩, 화면에서 펼치고 접을 수 있습니다.
   * 수록 기준은 report() 와 동일합니다(검증됨/익스플로잇됨 및 중위험 이상).
   */
  reportTargets(id, options = {}) {
    const meta = readMeta(this.metaPathOf(id)) || {}
    const includeAll = options.all === true
    const allVulns = this.listVulns(id, { limit: 2000 }).items
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    const isResult = (v) => v.status === 'confirmed' || v.status === 'exploited'
    const isReal = (v) => v.severity === 'critical' || v.severity === 'high' || v.severity === 'medium'
    const vulns = (includeAll ? allVulns : allVulns.filter((v) => isResult(v) && isReal(v)))
      .slice().sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
    const chain = this.listChain(id)
    const creds = this.listCredentials(id, {})
    const access = this.listAccess(id, {})
    const files = this.listAttackFiles(id, {})

    const targets = new Map()
    const ensure = (key) => {
      if (!targets.has(key)) {
        targets.set(key, { key, label: key, kind: /^\d{1,3}(\.\d{1,3}){3}$/.test(key) ? 'ip' : 'host', segment: '', vulns: [], chain: [], access: [], creds: [], files: [] })
      }
      return targets.get(key)
    }
    const assetIpOf = (assetId) => {
      if (assetId === null || assetId === undefined) return undefined
      const asset = this.getAsset(id, assetId)
      return asset === undefined ? undefined : asset.ip
    }
    for (const v of vulns) {
      const key = v.asset_ip || (v.target ? slugTarget(v.target) : '미귀속 목표')
      const g = ensure(key)
      g.vulns.push(v)
      if (g.segment === '' && v.segment_cidr) g.segment = v.segment_cidr
    }
    for (const a of access) {
      const key = assetIpOf(a.asset_id) || slugTarget(a.host)
      const g = ensure(key)
      g.access.push(a)
      if (g.segment === '') { const asset = a.asset_id === null || a.asset_id === undefined ? undefined : this.getAsset(id, a.asset_id); if (asset && asset.segment_cidr) g.segment = asset.segment_cidr }
    }
    for (const c of creds) ensure(assetIpOf(c.asset_id) || slugTarget(c.host)).creds.push(c)
    for (const f of files) ensure(assetIpOf(f.asset_id) || slugTarget(f.target)).files.push(f)
    for (const st of chain) if (st.asset_ip) ensure(st.asset_ip).chain.push(st)

    const renderVuln = (v) => {
      const out = []
      out.push(`#### [${(v.severity || 'info').toUpperCase()}] ${v.cve ? v.cve + ' — ' : ''}${v.title || ''}`, '')
      out.push(`- 목표:${v.target || '—'}`)
      out.push(`- 상태:${v.status === 'exploited' ? '익스플로잇 성공' : '검증됨'} · 신뢰도:${v.confidence === null || v.confidence === undefined ? '—' : v.confidence} · 발견 방식:${v.source || '—'}`)
      out.push(`- 위해와 증거:${v.evidence || '—'}`)
      const evidence = this.listHttpEvidence(id, { vuln_id: v.id })
      if (evidence.length) {
        out.push('', '**재현 요청(Burp Suite / Yakit 에 바로 붙여넣을 수 있음)**:', '')
        for (const e of evidence) {
          out.push(`*${e.label || e.method + ' ' + (e.url || '')}*`, '')
          if (e.request) out.push('```http', e.request.replace(/\r/g, '').trim(), '```', '')
          if (e.response) out.push('응답 요약:', '```http', String(e.response).replace(/\r/g, '').trim().slice(0, 2000), '```', '')
        }
      }
      out.push('')
      return out
    }

    const groups = new Map()
    const list = []
    for (const g of targets.values()) {
      const lines = []
      lines.push(`## ${g.label}${g.segment ? '(' + g.segment + ')' : ''}`, '')
      const bySeverity = { critical: 0, high: 0, medium: 0 }
      for (const v of g.vulns) bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1
      lines.push(`- 성과: 취약점 ${g.vulns.length}건(심각 ${bySeverity.critical} · 고위험 ${bySeverity.high} · 중위험 ${bySeverity.medium}) · 장악 ${g.access.length} · 자격 증명 ${g.creds.length} · 공격 파일 ${g.files.length}`, '')
      if (g.vulns.length) { lines.push('### 성과 취약점', ''); for (const v of g.vulns) lines.push(...renderVuln(v)) }
      if (g.access.length) {
        lines.push('### 획득한 권한', '')
        for (const a of g.access) lines.push(`- ${a.host} · ${a.username || '—'} · ${a.method || '—'} · ${a.privilege || '—'} · ${a.session_ref || ''}`)
        lines.push('')
      }
      if (g.creds.length) {
        lines.push('### 자격 증명', '')
        for (const c of g.creds) lines.push(`- ${c.host} · ${c.username || '—'} · ${c.secret_type || '—'} · ${c.privilege || '—'} · ${c.secret_ref || ''}`)
        lines.push('')
      }
      if (g.files.length) {
        lines.push('### 공격 파일', '')
        for (const f of g.files) lines.push(`- \`${f.name}\`(${f.kind}):${f.description || '—'}|효과:${f.evidence}|경로:${f.path}`)
        lines.push('')
      }
      if (g.chain.length) {
        lines.push('### 공격 체인', '')
        for (const st of g.chain) lines.push(`${st.seq}. [${st.stage}] ${st.title}${st.detail ? ' — ' + st.detail : ''}`)
        lines.push('')
      }
      const entry = {
        key: g.key, label: g.label, kind: g.kind, segment: g.segment || '미귀속',
        stats: { vulns: g.vulns.length, bySeverity, accesses: g.access.length, credentials: g.creds.length, files: g.files.length, chainSteps: g.chain.length },
        markdown: lines.join('\n'),
      }
      list.push(entry)
      const cidr = entry.segment
      if (!groups.has(cidr)) groups.set(cidr, { cidr, targets: [] })
      groups.get(cidr).targets.push(entry)
    }
    const grouped = Array.from(groups.values())
      .map((g) => ({ cidr: g.cidr, targets: g.targets.slice().sort((a, b) => b.stats.vulns - a.stats.vulns || a.label.localeCompare(b.label)) }))
      .sort((a, b) => a.cidr.localeCompare(b.cidr))
    return {
      generated_at: nowIso(),
      engagement: { id, name: meta.target_name || id, scope: meta.scope_cidrs || [] },
      groups: grouped,
      targets: list,
      totals: {
        targets: list.length,
        vulns: vulns.length,
        accesses: access.length,
        credentials: creds.length,
        files: files.length,
        filteredOut: allVulns.length - vulns.length,
      },
    }
  }

  /* ---------- 보고서 ---------- */

  /**
   * Markdown 성과 보고서를 생성합니다.
   *
   * “성과 취약점”만 납품합니다: 상태가 confirmed / exploited 이고 심각도가 critical / high / medium 인 것.
   * 미검증(candidate), 오탐(false-positive), 저위험 및 정보성(low/info)은 보고서에 넣지 않습니다.
   * 그것들은 과정 잡음입니다. 정보 수집 자산 목록도 보고서에 넣지 않습니다(자산 측정 페이지에서 봅니다).
   * 보고서에 남기는 것: 성과 취약점(Burp/Yakit 에 붙여넣을 수 있는 원본 요청 포함), 공격 체인(내부망 돌파 성과),
   * 획득한 권한과 자격 증명, 개선 권고.
   *
   * @param id - 대상 id.
   * @param options - `{ all: true }` 이면 전체 취약점을 출력합니다(자체 점검용이며 납품물은 아닙니다).
   */
  report(id, options = {}) {
    const meta = readMeta(this.metaPathOf(id)) || {}
    const includeAll = options.all === true
    const chain = this.listChain(id)
    const creds = this.listCredentials(id, {})
    const access = this.listAccess(id, {})
    const allVulns = this.listVulns(id, { limit: 2000 }).items
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    const isResult = (v) => v.status === 'confirmed' || v.status === 'exploited'
    const isReal = (v) => v.severity === 'critical' || v.severity === 'high' || v.severity === 'medium'
    const vulns = (includeAll ? allVulns : allVulns.filter((v) => isResult(v) && isReal(v)))
      .slice()
      .sort((a, b) => (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9))
    const filteredOut = allVulns.length - vulns.length

    const lines = []
    const push = (...xs) => lines.push(...xs)
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
    for (const v of vulns) bySeverity[v.severity] = (bySeverity[v.severity] || 0) + 1
    const exploited = vulns.filter((v) => v.status === 'exploited').length

    push(`# 공방 훈련 성과 보고서 — ${meta.target_name || id}`, '')
    push(`- 생성 시각:${nowIso()}`)
    push(`- 인가 범위:${(meta.scope_cidrs || []).join(', ') || '(미기록)'}`)
    push(`- 성과 개요: 성과 취약점 ${vulns.length}건(심각 ${bySeverity.critical} · 고위험 ${bySeverity.high} · 중위험 ${bySeverity.medium}) · 익스플로잇 성공 ${exploited}건 · 장악한 자산 ${access.length}대 · 획득한 자격 증명 ${creds.length}건`)
    push('')

    push('## 1. 성과 취약점', '')
    if (!vulns.length) {
      push('이번 훈련에서 납품할 성과 취약점이 없습니다(검증됨/익스플로잇됨 및 중위험 이상만 수록합니다).', '')
    } else {
      for (const v of vulns) {
        push(`### [${(v.severity || 'info').toUpperCase()}] ${v.cve ? v.cve + ' — ' : ''}${v.title || ''}`, '')
        push(`- 목표:${v.target || '—'}`)
        push(`- 자산:${v.asset_ip || '—'}(${v.segment_cidr || '—'})`)
        push(`- 상태:${v.status === 'exploited' ? '익스플로잇 성공' : '검증됨'} · 신뢰도:${v.confidence === null || v.confidence === undefined ? '—' : v.confidence} · 발견 방식:${v.source || '—'}`)
        push(`- 위해와 증거:${v.evidence || '—'}`)
        const evidence = this.listHttpEvidence(id, { vuln_id: v.id })
        if (evidence.length) {
          push('', '**재현 요청(Burp Suite / Yakit 에 바로 붙여넣을 수 있음)**:', '')
          for (const e of evidence) {
            push(`*${e.label || e.method + ' ' + (e.url || '')}*`, '')
            if (e.request) push('```http', e.request.replace(/\r/g, '').trim(), '```', '')
            if (e.response) push('응답 요약:', '```http', String(e.response).replace(/\r/g, '').trim().slice(0, 2000), '```', '')
          }
        }
        push('')
      }
    }

    push('## 2. 공격 체인', '')
    if (chain.length) {
      for (const s of chain) {
        push(`${s.seq}. **[${s.stage}] ${s.title}**`)
        if (s.asset_ip) push(`   - 자산:${s.asset_ip}`)
        if (s.vuln_title || s.vuln_cve) push(`   - 취약점:${s.vuln_cve ? s.vuln_cve + ' ' : ''}${s.vuln_title || ''}`)
        if (s.detail) push(`   - 설명:${s.detail}`)
        if (s.evidence_ref) push(`   - 증거:${s.evidence_ref}`)
      }
    } else push('(공격 체인 단계가 기록되지 않음)')
    push('')

    push('## 3. 획득한 권한과 자격 증명', '')
    if (access.length) {
      push('| 호스트 | 계정 | 방식 | 권한 | 증거 |', '| --- | --- | --- | --- | --- |')
      for (const a of access) push(`| ${a.host} | ${a.username || '—'} | ${a.method || '—'} | ${a.privilege || '—'} | ${a.session_ref || '—'} |`)
    } else push('(사용 가능한 접근을 얻지 못함)')
    push('')
    if (creds.length) {
      push('| 호스트 | 계정 | 유형 | 권한 | 참조 |', '| --- | --- | --- | --- | --- |')
      for (const c of creds) push(`| ${c.host} | ${c.username || '—'} | ${c.secret_type || '—'} | ${c.privilege || '—'} | ${c.secret_ref || '—'} |`)
    } else push('(자격 증명을 얻지 못함)')
    push('')

    push('## 4. 개선 권고', '')
    const advice = []
    if (vulns.some((v) => v.cve)) advice.push('1. 위 CVE 번호에 따라 영향받는 컴포넌트를 우선 패치하고, 컴포넌트 버전 기준선을 세워 패치 관리에 포함합니다.')
    if (access.some((a) => a.method === 'webshell' || a.method === 'rce' || a.method === 'upload')) advice.push('2. 파일 업로드와 명령 실행 면을 좁힙니다: 업로드 디렉터리 실행 금지, 화이트리스트 검증, Web 프로세스 최소 권한 실행.')
    if (access.some((a) => a.method === 'vnc' || a.method === 'rdp' || a.method === 'ssh')) advice.push('3. 원격 관리 노출면을 줄입니다(VNC/RDP/SSH 를 공인망에 노출하지 않습니다). 강력한 암호와 다중 인증을 강제합니다.')
    if (creds.some((c) => c.secret_type === 'connection-string')) advice.push('4. 인터페이스나 설정을 통해 DB 연결 문자열이 유출되지 않게 하고, 키를 키 관리 체계로 통합하며 인터페이스에 인증을 겁니다.')
    advice.push(`${advice.length + 1}. 이번에 다룬 인터페이스에 통일된 인증과 권한 우회 검증을 적용하고, 인터페이스 자산 대장과 자동 회귀 테스트를 마련합니다.`)
    push(...advice, '')

    if (filteredOut > 0 && !includeAll) {
      push(`> 이 보고서는 검증됨/익스플로잇됨 및 중위험 이상의 성과 취약점만 수록했습니다. 그 밖에 미검증, 오탐, 저위험/정보성 기록 ${filteredOut}건은 포함되지 않았습니다(“취약점 성과” 페이지에서 볼 수 있습니다).`)
      push('')
    }

    return {
      markdown: lines.join('\n'),
      generated_at: nowIso(),
      stats: {
        results: vulns.length,
        bySeverity,
        exploited,
        filteredOut,
        accesses: access.length,
        credentials: creds.length,
        chainSteps: chain.length,
      },
    }
  }

  /* ---------- 쓰기 원시 연산 ---------- */
  #upsertSegment(db, seg) {
    db.prepare(`INSERT INTO segment(cidr, ip_start, ip_end, org, asn, country, city, source, first_seen, last_seen)
      VALUES(?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(cidr) DO UPDATE SET
        org = COALESCE(excluded.org, segment.org),
        asn = COALESCE(excluded.asn, segment.asn),
        country = COALESCE(excluded.country, segment.country),
        city = COALESCE(excluded.city, segment.city),
        last_seen = excluded.last_seen`).run(
      seg.cidr, seg.ip_start ?? null, seg.ip_end ?? null, seg.org ?? null, seg.asn ?? null,
      seg.country ?? null, seg.city ?? null, seg.source ?? null, seg.first_seen ?? nowIso(), nowIso(),
    )
  }

  #upsertAsset(db, a) {
    const cidr = a.segment_cidr || cidrOf(a.ip)
    this.#upsertSegment(db, { cidr, source: a.provenance, first_seen: a.first_seen })
    const t = nowIso()
    /* discovered_at = 이 DB 가 해당 자산을 처음 본 시각입니다. 반복 수집은 last_seen 만 갱신하고
       discovered_at 은 건드리지 않습니다(그러지 않으면 "발견 시각"이 "마지막 수집 시각"이 되어 기록의 의미가 없습니다). */
    db.prepare(`INSERT INTO asset(segment_cidr, ip, ip_int, state, primary_name, confidence, first_seen, last_seen, discovered_at, scope)
      VALUES(?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(segment_cidr, ip) DO UPDATE SET
        state = COALESCE(excluded.state, asset.state),
        primary_name = COALESCE(excluded.primary_name, asset.primary_name),
        scope = COALESCE(NULLIF(asset.scope, ''), excluded.scope),
        discovered_at = COALESCE(NULLIF(asset.discovered_at, ''), excluded.discovered_at),
        last_seen = excluded.last_seen`).run(
      cidr, a.ip, ipToInt(a.ip), a.state ?? 'unknown', a.primary_name ?? null, a.confidence ?? null,
      a.first_seen ?? t, t, a.discovered_at ?? t, a.scope || scopeOfIp(a.ip),
    )
    return db.prepare('SELECT id FROM asset WHERE segment_cidr = ? AND ip = ?').get(cidr, a.ip).id
  }

  #observe(db, entityKind, entityId, attr, value, provenance, tool, rawRef) {
    db.prepare(`INSERT INTO observation(entity_kind, entity_id, attr, value, provenance, tool, collected_at, raw_ref)
      VALUES(?,?,?,?,?,?,?,?)`).run(
      entityKind, entityId, attr ?? null, value == null ? null : String(value),
      provenance ?? 'unknown', tool ?? null, nowIso(), rawRef ?? null,
    )
  }

  #edge(db, srcKind, srcId, dstKind, dstId, relation, confidence) {
    db.prepare(`INSERT INTO edge(src_kind, src_id, dst_kind, dst_id, relation, confidence, first_seen, last_seen)
      VALUES(?,?,?,?,?,?,?,?)
      ON CONFLICT(src_kind, src_id, dst_kind, dst_id, relation) DO UPDATE SET last_seen = excluded.last_seen`).run(
      srcKind, String(srcId), dstKind, String(dstId), relation, confidence ?? null, nowIso(), nowIso(),
    )
  }

  /** 자산 하나의 전문 검색 인덱스 행을 재구축합니다(목록, 그래프, 이후 에이전트가 같은 인덱스를 공유합니다). */
  #reindex(db, assetId) {
    const a = db.prepare('SELECT * FROM asset WHERE id = ?').get(assetId)
    if (!a) return
    /* FTS5 가 없으면 인덱스 테이블을 만들지 않으므로 여기서 바로 건너뜁니다. 검색은 listAssets 의 LIKE 분기로 가고,
       그래서 위쪽 값 추출도 헛수고가 됩니다. */
    if (!HAS_FTS5) return
    const names = db.prepare('SELECT name FROM asset_name WHERE asset_id = ?').all(assetId).map((r) => r.name).join(' ')
    const banners = db.prepare('SELECT banner FROM port WHERE asset_id = ? AND banner IS NOT NULL').all(assetId).map((r) => r.banner).join(' ')
    const titles = db.prepare('SELECT title FROM port WHERE asset_id = ? AND title IS NOT NULL').all(assetId).map((r) => r.title).join(' ')
      + ' ' + db.prepare('SELECT url FROM port WHERE asset_id = ? AND url IS NOT NULL').all(assetId).map((r) => r.url).join(' ')
      + ' ' + db.prepare(`SELECT s.product, s.name, s.version FROM service s JOIN port p ON p.id = s.port_id WHERE p.asset_id = ?`)
        .all(assetId).map((r) => [r.name, r.product, r.version].filter(Boolean).join(' ')).join(' ')
    const fps = db.prepare('SELECT vendor, product, version, category FROM fingerprint WHERE asset_id = ?')
      .all(assetId).map((r) => [r.category, r.vendor, r.product, r.version].filter(Boolean).join(' ')).join(' ')
    db.prepare('DELETE FROM asset_fts WHERE asset_id = ?').run(String(assetId))
    db.prepare('INSERT INTO asset_fts(asset_id, ip, names, banners, titles, fingerprints) VALUES(?,?,?,?,?,?)')
      .run(String(assetId), a.ip, names, banners, titles, fps)
  }

  /**
   * 수집 결과를 저장합니다(정보 수집 에이전트와 외부 도구가 공유하는 통일 ingest 형식).
   * bundle = { scan:{tool,argv,agent_session_id}, segments:[], assets:[], edges:[] }
   * asset  = { ip, state, primary_name, provenance, tool, names:[{name,kind}],
   *            ports:[{port,proto,service,product,version,banner,provenance,tool,
   *                    fingerprints:[{category,vendor,product,version,evidence}]}] }
   */
  importBundle(id, bundle = {}) {
    const db = this.db(id)
    const counts = { segments: 0, assets: 0, ports: 0, services: 0, fingerprints: 0, names: 0, edges: 0 }
    let runId = null
    if (bundle.scan) {
      const r = db.prepare(`INSERT INTO scan_run(agent_session_id, tool, argv, started_at, status)
        VALUES(?,?,?,?,'completed')`).run(
        bundle.scan.agent_session_id ?? null, bundle.scan.tool ?? null,
        bundle.scan.argv ? JSON.stringify(bundle.scan.argv) : null, nowIso(),
      )
      runId = Number(r.lastInsertRowid)
    }
    db.exec('BEGIN')
    try {
      for (const seg of bundle.segments || []) { this.#upsertSegment(db, seg); counts.segments++ }
      for (const a of bundle.assets || []) {
        const provenance = a.provenance || 'active'
        const tool = a.tool || (bundle.scan && bundle.scan.tool) || null
        const assetId = this.#upsertAsset(db, Object.assign({}, a, { provenance }))
        counts.assets++
        for (const n of a.names || []) {
          db.prepare(`INSERT INTO asset_name(asset_id, name, kind, provenance, tool, first_seen, last_seen)
            VALUES(?,?,?,?,?,?,?) ON CONFLICT(asset_id, name, kind) DO UPDATE SET last_seen = excluded.last_seen`)
            .run(assetId, n.name, n.kind ?? 'domain', n.provenance ?? provenance, tool, nowIso(), nowIso())
          counts.names++
          this.#observe(db, 'asset', assetId, 'name', n.name, n.provenance ?? provenance, tool, runId)
          this.#edge(db, 'domain', n.name, 'asset', assetId, 'resolves')
        }
        if (a.primary_name) this.#observe(db, 'asset', assetId, 'primary_name', a.primary_name, provenance, tool, runId)
        for (const p of a.ports || []) {
          const pProv = p.provenance || provenance
          db.prepare(`INSERT INTO port(asset_id, proto, port, state, provenance, tool, banner, url, title, first_seen, last_seen)
            VALUES(?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(asset_id, proto, port) DO UPDATE SET
              state = excluded.state,
              banner = COALESCE(excluded.banner, port.banner),
              url = COALESCE(excluded.url, port.url),
              title = COALESCE(excluded.title, port.title),
              last_seen = excluded.last_seen`)
            .run(assetId, p.proto ?? 'tcp', Number(p.port), p.state ?? 'open', pProv, p.tool ?? tool,
              p.banner ?? null, p.url ?? null, p.title ?? null, nowIso(), nowIso())
          const portId = db.prepare('SELECT id FROM port WHERE asset_id = ? AND proto = ? AND port = ?')
            .get(assetId, p.proto ?? 'tcp', Number(p.port)).id
          counts.ports++
          this.#observe(db, 'port', portId, 'open', `${p.port}/${p.proto ?? 'tcp'}`, pProv, p.tool ?? tool, runId)
          if (p.service || p.product || p.version) {
            db.prepare(`INSERT INTO service(port_id, name, product, version, cpe, provenance, tool, first_seen, last_seen)
              VALUES(?,?,?,?,?,?,?,?,?)`).run(
              portId, p.service ?? null, p.product ?? null, p.version ?? null, p.cpe ?? null,
              pProv, p.tool ?? tool, nowIso(), nowIso(),
            )
            counts.services++
            this.#observe(db, 'port', portId, 'service', [p.service, p.product, p.version].filter(Boolean).join(' '), pProv, p.tool ?? tool, runId)
          }
          for (const fp of p.fingerprints || []) {
            db.prepare(`INSERT INTO fingerprint(asset_id, port_id, category, vendor, product, version, evidence, confidence, provenance, tool, first_seen, last_seen)
              VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(
              assetId, portId, fp.category ?? null, fp.vendor ?? null, fp.product ?? null, fp.version ?? null,
              fp.evidence ?? null, fp.confidence ?? null, fp.provenance ?? pProv, fp.tool ?? tool, nowIso(), nowIso(),
            )
            counts.fingerprints++
            this.#observe(db, 'asset', assetId, 'fingerprint',
              [fp.category, fp.vendor, fp.product, fp.version].filter(Boolean).join(' '),
              fp.provenance ?? pProv, fp.tool ?? tool, runId)
          }
        }
        this.#reindex(db, assetId)
      }
      for (const e of bundle.edges || []) {
        this.#edge(db, e.src_kind, e.src_id, e.dst_kind, e.dst_id, e.relation, e.confidence)
        counts.edges++
      }
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    return { scan_run_id: runId, counts, stats: this.stats(id) }
  }

  /* ---------- 프롬프트 ---------- */

  /** 기본 프롬프트 지문 목록(이 대상에 기본값이 마지막으로 기록되었을 때의 내용 지문을 남깁니다). */
  promptManifestPathOf(id) { return join(this.promptsDirOf(id), '.defaults.json') }

  readPromptManifest(id) {
    try {
      const raw = readFileSync(this.promptManifestPathOf(id), 'utf8')
      const data = JSON.parse(raw)
      return data !== null && typeof data === 'object' ? data : {}
    } catch { return {} }
  }

  writePromptManifest(id, manifest) {
    try {
      mkdirSync(this.promptsDirOf(id), { recursive: true })
      writeFileSync(this.promptManifestPathOf(id), JSON.stringify(manifest, null, 2), 'utf8')
    } catch { /* 쓰지 못해도 사용에는 영향이 없습니다 */ }
  }

  /**
   * "아직 구버전 내장 기본값"인 역할 프롬프트를 현재 버전으로 바꿉니다. 사용자가 직접 고친 것은 그대로 둡니다.
   *
   * 판단 근거: 내용 지문이 ① 이 대상에 기본값을 마지막으로 기록했을 때의 지문(manifest)이거나
   * ② 어느 과거 버전의 기본 지문(LEGACY_PROMPT_HASHES)과 같을 때. 둘 다 아니면 = 사용자가 직접 쓴 것.
   * 프롬프트를 읽을 때마다(패널을 열 때) 함께 돌기 때문에, 오래된 대상도 자동으로 새 버전을 따라갑니다.
   *
   * @param id - 대상 id.
   * @param options - `{ force?: boolean }`: force 이면 "사용자 작성"까지 덮어씁니다(스크립트 일괄 업그레이드용).
   * @returns `{ changed, kept, created }` —— kept 는 "사용자 작성, 유지됨"으로 판정된 역할.
   */
  refreshDefaultPrompts(id, options = {}) {
    const manifest = this.readPromptManifest(id)
    let changed = 0
    let created = 0
    const kept = []
    for (const role of Object.keys(ROLE_TITLES)) {
      const next = DEFAULT_PROMPTS[role] || ''
      const p = join(this.promptsDirOf(id), `${role}.md`)
      /* 새 역할(예: v0.9.0 의 자산 정리 assess / 메인 세션 plan): 오래된 대상에는 이 파일이 없으므로
         현재 기본값으로 바로 만들고, 사용자가 직접 보충하지 않아도 되게 합니다 */
      if (!existsSync(p)) {
        if (next !== '') {
          mkdirSync(this.promptsDirOf(id), { recursive: true })
          writeFileSync(p, next, 'utf8')
          manifest[role] = promptHash(next)
          created += 1
        }
        continue
      }
      const cur = readFileSync(p, 'utf8')
      const h = promptHash(cur)
      const hNext = promptHash(next)
      if (h === hNext) { manifest[role] = hNext; continue }
      const wasDefault = options.force === true || manifest[role] === h || (LEGACY_PROMPT_HASHES[role] || []).includes(h)
      if (!wasDefault) { kept.push(role); continue }
      /* 덮어쓰기 전에 .bak 을 하나 남겨, 판정이 틀렸어도 되찾을 수 있게 합니다 */
      try { copyFileSync(p, `${p}.bak-${Date.now()}`) } catch { /* 무시 */ }
      writeFileSync(p, next, 'utf8')
      manifest[role] = hNext
      changed += 1
    }
    this.writePromptManifest(id, manifest)
    return { changed, kept, created }
  }

  listPrompts(id) {
    const dir = this.promptsDirOf(id)
    mkdirSync(dir, { recursive: true })
    this.refreshDefaultPrompts(id)
    return Object.entries(ROLE_TITLES).map(([role, title]) => {
      const p = join(dir, `${role}.md`)
      const exists = existsSync(p)
      return {
        role, title,
        /* 메인 세션(plan)은 파견하지 않고 인격 참고용으로만 씁니다. 패널에 표시해 파견 대상으로 오해하지 않게 합니다 */
        planner: role === PLANNER_ROLE,
        dispatcher: role !== PLANNER_ROLE,
        content: exists ? readFileSync(p, 'utf8') : '',
        updated_at: exists ? statSync(p).mtime.toISOString() : null,
      }
    })
  }

  /** 역할 프롬프트를 내장 기본값으로 되돌립니다(사용자가 화면에서 망가뜨렸거나, 오래된 대상에 새 버전 프롬프트를 적용할 때). */
  resetPrompts(id, role) {
    if (role !== undefined && role !== null) {
      this.savePrompt(id, role, DEFAULT_PROMPTS[role] || '')
      return { reset: [role] }
    }
    const done = []
    for (const r of Object.keys(ROLE_TITLES)) { this.savePrompt(id, r, DEFAULT_PROMPTS[r] || ''); done.push(r) }
    return { reset: done }
  }

  savePrompt(id, role, content) {
    if (!ROLE_TITLES[role]) throw new Error(`unknown role: ${role}`)
    mkdirSync(this.promptsDirOf(id), { recursive: true })
    const text = String(content ?? '')
    writeFileSync(join(this.promptsDirOf(id), `${role}.md`), text, 'utf8')
    /* 이것이 "현재 내장 기본값"인지 기록합니다: 그렇다면 나중에 새 버전을 따라 자동 업그레이드되고, 아니면 사용자 작성으로 보아 절대 덮어쓰지 않습니다 */
    const manifest = this.readPromptManifest(id)
    if (promptHash(text) === promptHash(DEFAULT_PROMPTS[role] || '')) manifest[role] = promptHash(text)
    else delete manifest[role]
    this.writePromptManifest(id, manifest)
    return { role, bytes: Buffer.byteLength(text) }
  }

}
