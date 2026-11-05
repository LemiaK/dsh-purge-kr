/**
 * 레드팀 증거 원장(REA 의 Evidence 사상을 그대로 베끼지 않고 살려서 씁니다)
 *
 * rea 의 Evidence 는 "정적 분석 결론"에 내용 주소를 부여하는 것입니다 — observed/derived/inferred
 * 세 단계 신뢰도, 그리고 결론마다 SHA-256 의미 해시.
 *
 * 여기서는 레드팀 의미론으로 바꿉니다:
 * · `claimed`   = 서브에이전트가 말로 보고한 "제가 확보했습니다" — 위험 신호이며, 지휘 에이전트는 절대 그대로 믿지 않습니다
 * · `observed`  = 실제 도구 회신/데이터베이스 기록으로 확인된 것 — 지휘 에이전트가 대조한 뒤 채택합니다
 * · `derived`   = observed 증거에서 추론한 것
 * · `inferred`  = 서브에이전트/지휘 에이전트의 추측이며, 반드시 표기해야 합니다
 *
 * 모든 evidence 는 `ev_id = "ev_" + sha256(정규화된 의미)` 를 가집니다 — 같은 내용이면 해시가 반드시 같고,
 * 한 글자만 바뀌어도 해시가 달라지므로, 저장 시점에 "서브에이전트가 A 라고 했는데 원장에 기록된 것도 정말 A 인가"를 검증할 수 있습니다.
 *
 * ResidualUnknown 은 rea 에서 가져왔지만 의미를 바꿨습니다: rea 는 "분석이 미치지 못한 미지"를 기록하지만,
 * 여기서는 "레드팀 작전에서 **아직 끝내지 못했고 증거도 부족한** 문제"를 기록합니다 — 예를 들어 "이 내부망 장비의
 * 22 포트가 SSH 일 수 있지만 아직 자격 증명을 시험해 보지 못했습니다".
 *
 * 이 모듈은 의존성이 없고 Node 내장 crypto/sqlite 만 씁니다. 어떤 Cordis 서비스에도 의존하지 않습니다.
 */

import { createHash } from 'node:crypto'

/* ── 신뢰도와 근거 등급 열거 ───────────────────────────────────────────── */

export const EVIDENCE_CONFIDENCE = ['claimed', 'observed', 'derived', 'inferred']

export const EVIDENCE_AUTHORITY = [
  'tool-output',      // 도구 회신 원문(nmap/fscan/curl 원시 출력)
  'database-record',  // 라이브러리에 이미 있는 행(SELECT 로 조회한 것)
  'screenshot',       // 현장 스크린샷
  'request-replay',   // HTTP 원시 요청 재전송 성공
  'subagent-report',  // 서브에이전트 보고(= claimed, 반드시 대조해야 함)
  'operator-input',   // 사용자/운영자 제공
]

/** 서브에이전트 보고는 검증을 거쳐야만 claimed 에서 observed 로 승격됩니다 */
export const CONFIDENCE_REQUIRES_VERIFICATION = new Set(['claimed', 'inferred'])

/* ── 해시 도구 ────────────────────────────────────────────────────────── */

/** 정규화 JSON: 키를 코드 포인트 순으로 정렬해, 의미가 같으면 해시도 반드시 같게 합니다 */
const canonicalize = (value) => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`
  const keys = Object.keys(value).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`
}

/** evidence 의 의미 해시를 계산해 "ev_" 접두사가 붙은 hex digest 를 돌려줍니다 */
export const evidenceId = (semantic) => {
  const canonical = canonicalize(semantic)
  return 'ev_' + createHash('sha256').update(canonical, 'utf8').digest('hex')
}

/* ── Evidence DDL(독립 테이블, 기존 schema 는 건드리지 않음)─────────────── */

export const EVIDENCE_LEDGER_DDL = `
CREATE TABLE IF NOT EXISTS evidence (
  ev_id TEXT PRIMARY KEY,
  confidence TEXT NOT NULL CHECK(confidence IN ('claimed','observed','derived','inferred')),
  authority TEXT NOT NULL,
  operation TEXT NOT NULL,
  parameters TEXT NOT NULL DEFAULT '{}',
  result TEXT NOT NULL,
  raw_ref TEXT,
  limitations TEXT NOT NULL DEFAULT '[]',
  supporting_ev_ids TEXT NOT NULL DEFAULT '[]',
  recorded_by TEXT,
  recorded_at TEXT,
  source_agent TEXT,
  engagement_id TEXT
);
CREATE INDEX IF NOT EXISTS ix_evidence_operation ON evidence(operation);
CREATE INDEX IF NOT EXISTS ix_evidence_confidence ON evidence(confidence);
CREATE INDEX IF NOT EXISTS ix_evidence_engagement ON evidence(engagement_id);

CREATE TABLE IF NOT EXISTS evidence_verification (
  claim_id TEXT PRIMARY KEY REFERENCES evidence(ev_id),
  observation_id TEXT NOT NULL REFERENCES evidence(ev_id)
);

CREATE TABLE IF NOT EXISTS residual_unknown (
  unk_id TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 1,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK(status IN ('open','investigating','blocked','contradicted','resolved','withdrawn')),
  severity TEXT NOT NULL DEFAULT 'medium'
    CHECK(severity IN ('low','medium','high','critical')),
  domain TEXT NOT NULL DEFAULT 'general',
  scope_digest TEXT,
  supporting_ev_ids TEXT NOT NULL DEFAULT '[]',
  contradicting_ev_ids TEXT NOT NULL DEFAULT '[]',
  required_authority TEXT,
  required_confidence TEXT,
  recommended_probe TEXT,
  resolution TEXT,
  recorded_by TEXT,
  recorded_at TEXT,
  resolved_at TEXT,
  engagement_id TEXT
);
CREATE INDEX IF NOT EXISTS ix_unknown_status ON residual_unknown(status);
CREATE INDEX IF NOT EXISTS ix_unknown_engagement ON residual_unknown(engagement_id);
`

/* ── EvidenceLedger 클래스 ────────────────────────────────────────────── */

/**
 * 대상 SQLite 핸들에 붙는 증거 원장입니다.
 *
 * 사용법:
 *   import { EvidenceLedger, EVIDENCE_LEDGER_DDL } from './evidence-ledger.mjs'
 *   const ledger = new EvidenceLedger(db)   // db 는 대상 데이터베이스의 DatabaseSync 핸들입니다
 *   ledger.record({ operation: 'nmap_scan', result: {...}, ... })
 *
 * 데이터베이스를 직접 open/close 하지 않아 이중 소유를 피합니다; RedteamStore.db() 가 관리하는 핸들을 넘겨받습니다.
 */
export class EvidenceLedger {
  /** @param db DatabaseSync 핸들(이미 열려 있고 migrate 까지 끝난 상태) */
  constructor(db) {
    this.db = db
    initializeLedger(db)
  }

  /**
   * evidence 한 건을 기록합니다.
   *
   * @param {object} input
   * @param {string} input.operation       작업 이름(예: "nmap_scan", "suo5_tunnel_established")
   * @param {object} input.parameters      호출 파라미터(정규화 후 해시에 포함됩니다)
   * @param {object} input.result          정규화한 결과(해시에 포함됩니다)
   * @param {string} [input.confidence]    기본값 'inferred'
   * @param {string} [input.authority]     기본값 'tool-output'
   * @param {string[]} [input.limitations] 기본값 []
   * @param {string[]} [input.supporting_ev_ids] 기본값 []
   * @param {string} [input.recorded_by]   누가 기록했는지(지휘 에이전트/서브 역할 이름)
   * @param {string} [input.source_agent]  어떤 서브에이전트가 만들어 냈는지
   * @param {string} [input.engagement_id] 대상 id
   *
   * @returns {{ok:true, ev_id:string, duplicate:boolean}|{ok:false, error:string}}
   */
  record(input) {
    const {
      operation,
      parameters = {},
      result,
      confidence = 'inferred',
      authority = 'tool-output',
      limitations = [],
      supporting_ev_ids = [],
      recorded_by,
      source_agent,
      engagement_id,
      raw_ref,
    } = input

    if (!operation || typeof operation !== 'string') {
      return { ok: false, error: 'operation is required and must be a string' }
    }
    if (result === undefined || result === null) {
      return { ok: false, error: 'result is required' }
    }
    if (!EVIDENCE_CONFIDENCE.includes(confidence)) {
      return { ok: false, error: `confidence must be one of ${EVIDENCE_CONFIDENCE.join(',')}` }
    }
    if (!EVIDENCE_AUTHORITY.includes(authority)) {
      return { ok: false, error: `authority must be one of ${EVIDENCE_AUTHORITY.join(',')}` }
    }

    if (!Array.isArray(supporting_ev_ids) || !Array.isArray(limitations)) {
      return { ok: false, error: 'supporting_ev_ids and limitations must be arrays' }
    }
    if ((confidence === 'claimed' || authority === 'subagent-report') && !source_agent?.trim()) {
      return { ok: false, error: 'source_agent required for claims and subagent reports' }
    }
    if (confidence === 'observed' && authority === 'subagent-report') {
      return { ok: false, error: 'subagent-report requires verification' }
    }
    const ev_id = semanticId({operation, parameters, result, confidence, authority, limitations, supporting_ev_ids})

    try {
      const existing = this.get(ev_id)
      if (existing) return { ok: true, ev_id, duplicate: true }

      this.db
        .prepare(
          `INSERT INTO evidence
           (ev_id, confidence, authority, operation, parameters, result,
            raw_ref, limitations, supporting_ev_ids,
            recorded_by, recorded_at, source_agent, engagement_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          ev_id,
          confidence,
          authority,
          operation,
          JSON.stringify(parameters),
          JSON.stringify(result),
          raw_ref ?? null,
          JSON.stringify(limitations),
          JSON.stringify(supporting_ev_ids),
          recorded_by ?? null,
          new Date().toISOString(),
          source_agent ?? null,
          engagement_id ?? null,
        )
      return { ok: true, ev_id, duplicate: false }
    } catch (err) {
      return { ok: false, error: String(err.message ?? err) }
    }
  }

  /** ev_id 로 evidence 한 건을 가져옵니다(JSON 필드는 이미 파싱된 상태) */
  get(ev_id) {
    const row = this.db.prepare('SELECT * FROM evidence WHERE ev_id = ?').get(ev_id)
    return row && parseEvidenceRow(row)
  }

  /**
   * 대조: 서브에이전트가 "제가 X 를 해서 Y 를 얻었습니다"라고 할 때, 지휘 에이전트가 이것으로 검증합니다.
   * { matched: true } 또는 { matched: false, expected_ev_id, actual_ev_id } 를 돌려줍니다
   */
  verify(input) {
    const expected_ev_id = semanticId(input)
    const found = this.get(expected_ev_id)
    return found
      ? { matched: true, ev_id: expected_ev_id, confidence: found.confidence }
      : { matched: false, expected_ev_id, actual_ev_id: null, note: 'no matching evidence in ledger' }
  }

  /**
   * claimed / inferred 를 observed 로 승격합니다.
   * 레드팀 상황: 서브에이전트가 webshell 이 올라갔다고 보고(claimed)하면, 지휘 에이전트가 curl 로 실제 확인한 뒤 승격합니다.
   *
   * @returns {{ok:true, ev_id:string}|{ok:false, error:string}}
   */
  upgrade(input) {
    const { claimed_ev_id, verified_by, verified_result } = input
    const existing = this.get(claimed_ev_id)
    if (!existing) return { ok: false, error: `evidence not found: ${claimed_ev_id}` }
    if (existing.confidence === 'observed') return { ok: true, ev_id: claimed_ev_id }
    if (!CONFIDENCE_REQUIRES_VERIFICATION.has(existing.confidence)) {
      return { ok: false, error: `confidence '${existing.confidence}' does not require upgrade` }
    }

    if (!verified_result || typeof verified_result !== 'object' || Array.isArray(verified_result) || !Object.keys(verified_result).length) {
      return { ok: false, error: 'non-empty verified_result required' }
    }

    // existing 은 이미 parseEvidenceRow 가 처리한 행입니다: JSON 필드가 이미 객체이므로 다시 parse 하지 않습니다.
    this.db.exec('SAVEPOINT record_verification')
    try {
      const observation = this.record({
        operation: existing.operation,
        parameters: existing.parameters,
        result: verified_result,
        confidence: 'observed',
        authority: existing.authority === 'subagent-report' ? 'tool-output' : existing.authority,
        limitations: existing.limitations,
        supporting_ev_ids: [claimed_ev_id],
        recorded_by: verified_by ?? 'coordinator',
        source_agent: existing.source_agent,
        engagement_id: existing.engagement_id,
      })
      if (!observation.ok) throw new Error(observation.error)
      this.db.prepare('INSERT OR REPLACE INTO evidence_verification(claim_id, observation_id) VALUES (?, ?)').run(claimed_ev_id, observation.ev_id)
      this.db.exec('RELEASE record_verification')
      return observation
    } catch (error) {
      this.db.exec('ROLLBACK TO record_verification; RELEASE record_verification')
      throw error
    }
  }

  /** 필터 조건을 만족하는 evidence 를 나열합니다(페이지 단위) */
  list(filter = {}) {
    const { operation, confidence, engagement_id, limit = 50, offset = 0 } = filter
    const conditions = []
    const params = []
    if (operation) { conditions.push('operation = ?'); params.push(operation) }
    if (confidence) { conditions.push('confidence = ?'); params.push(confidence) }
    if (engagement_id) { conditions.push('engagement_id = ?'); params.push(engagement_id) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const rows = this.db
      .prepare(`SELECT * FROM evidence ${where} ORDER BY recorded_at DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset)
    return rows.map(parseEvidenceRow)
  }

  /**
   * 원장에 있는 claimed / inferred 의 **총 건수**입니다(검증이 닫힌 것까지 포함).
   * 감사와 디버깅용이며, "아직 몇 건이 검증되지 않았는가"를 알고 싶으면 countUnresolvedClaims 를 쓰십시오.
   */
  countUnverified(engagement_id) {
    return this.db.prepare("SELECT count(*) AS n FROM evidence WHERE engagement_id = ? AND confidence IN ('claimed','inferred')").get(engagement_id).n
  }

  /** Generic citations and legacy upgrades are retained, but only explicit verifications close claims. */
  countUnresolvedClaims(engagement_id) {
    let pending = 0
    const observations = new Map()
    const links = []
    const rows = this.db.prepare(`
      SELECT e.*, v.claim_id, v.observation_id FROM evidence e
      LEFT JOIN evidence_verification v ON e.ev_id = v.claim_id
      UNION ALL
      SELECT e.*, v.claim_id, v.observation_id FROM evidence_verification v
      LEFT JOIN evidence e ON e.ev_id = v.claim_id WHERE e.ev_id IS NULL
    `)
    for (const row of rows.iterate()) {
      if (!row.ev_id) throw new Error('missing verified claim: ' + row.claim_id)
      const record = parseEvidenceRow(row)
      if (record.engagement_id !== engagement_id) throw new Error('evidence engagement mismatch: ' + record.ev_id)
      if (record.confidence === 'observed') observations.set(record.ev_id, record.supporting_ev_ids)
      if (CONFIDENCE_REQUIRES_VERIFICATION.has(record.confidence)) {
        if (row.claim_id) links.push([row.claim_id, row.observation_id])
        else pending++
      } else if (row.claim_id) throw new Error('invalid verified claim: ' + row.claim_id)
    }
    for (const [claim, observation] of links) {
      if (!observations.get(observation)?.includes(claim)) throw new Error('invalid evidence verification: ' + claim)
    }
    return pending
  }
}

/* ── ResidualUnknown(레드팀 의미론: 미해결이고 증거가 아직 부족한 작전 문제)────── */

export class UnknownRegistry {
  constructor(db) {
    this.db = db
    initializeLedger(db)
    migrateUnknownStatus(db)
  }

  /**
   * 아직 "해결되지 않은" 작전 문제를 기록합니다.
   *
   * 예:
   *   unk.record({
   *     question: '10.0.3.7:22 의 SSH 자격 증명은 무엇인가?',
   *     severity: 'high',
   *     domain: 'internal-recon',
   *     recommended_probe: 'hydra -l root -P /wordlists/ssh.txt 10.0.3.7 ssh',
   *   })
   */
  record(input) {
    const {
      question,
      severity = 'medium',
      domain = 'general',
      recommended_probe,
      supporting_ev_ids = [],
      engagement_id,
      recorded_by = 'coordinator',
    } = input

    if (!question || typeof question !== 'string') {
      return { ok: false, error: 'question is required' }
    }
    if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
      return { ok: false, error: `severity must be low|medium|high|critical` }
    }

    const unk_id = 'unk_' + createHash('sha256')
      .update(canonicalize({ question: question.replace(/\s+/gu, ' ').trim(), domain }))
      .digest('hex')

    try {
      const existing = this.db
        .prepare('SELECT unk_id FROM residual_unknown WHERE unk_id = ?')
        .get(unk_id)
      if (existing) return { ok: true, unk_id, duplicate: true }

      this.db
        .prepare(
          `INSERT INTO residual_unknown
           (unk_id, revision, question, status, severity, domain,
            supporting_ev_ids, recommended_probe, recorded_by, recorded_at, engagement_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          unk_id,
          1,
          question.trim(),
          'open',
          severity,
          domain,
          JSON.stringify(supporting_ev_ids),
          recommended_probe ?? null,
          recorded_by,
          new Date().toISOString(),
          engagement_id ?? null,
        )
      return { ok: true, unk_id, duplicate: false }
    } catch (err) {
      return { ok: false, error: String(err.message ?? err) }
    }
  }

  /** resolved(증거가 충분함) 또는 contradicted(잘못된 것으로 드러남)로 표시합니다 */
  resolve(unk_id, disposition, resolution, resolved_by = 'coordinator') {
    if (!['resolved', 'contradicted', 'withdrawn'].includes(disposition)) {
      return { ok: false, error: 'disposition must be resolved|contradicted|withdrawn' }
    }
    try {
      const update = this.db
        .prepare(
          `UPDATE residual_unknown
           SET status = ?, resolution = ?, resolved_at = ?
           WHERE unk_id = ?`,
        )
        .run(disposition, resolution ?? null, new Date().toISOString(), unk_id)
      if (!update.changes) return { ok: false, error: `unknown not found: ${unk_id}` }
      return { ok: true, unk_id }
    } catch (err) {
      return { ok: false, error: String(err.message ?? err) }
    }
  }

  /** 현재 미해결 unknowns 를 나열합니다(지휘 에이전트가 다음에 누구를 보낼지 결정할 때 씁니다) */
  list(filter = {}) {
    const { status, severity, engagement_id, limit = 50, offset = 0 } = filter
    const conditions = []
    const params = []
    if (status) { conditions.push('status = ?'); params.push(status) }
    if (severity) { conditions.push('severity = ?'); params.push(severity) }
    if (engagement_id) { conditions.push('engagement_id = ?'); params.push(engagement_id) }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    return this.db
      .prepare(`SELECT * FROM residual_unknown ${where} ORDER BY recorded_at DESC LIMIT ? OFFSET ?`)
      .all(...params, limit, offset)
      .map(parseUnknownRow)
  }
}

/* ── 내부 도구 ────────────────────────────────────────────────────────── */

function initializeLedger(db) {
  const existing = db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name IN ('evidence','residual_unknown','evidence_verification')").all()
  const names = new Set(existing.map(row => row.name))
  if (names.size && (!names.has('evidence') || !names.has('residual_unknown'))) {
    throw new Error('incomplete evidence ledger schema')
  }
  if (names.size < 3) db.exec(EVIDENCE_LEDGER_DDL)
}

function migrateUnknownStatus(db) {
  const schema = db.prepare("SELECT sql FROM sqlite_schema WHERE type='table' AND name='residual_unknown'")
  if (schema.get().sql.includes("'withdrawn'")) return
  db.exec('BEGIN IMMEDIATE')
  try {
    const sql = schema.get().sql
    if (!sql.includes("'withdrawn'")) {
      const oldCheck = "status IN ('open','investigating','blocked','contradicted','resolved')"
      if (!sql.includes(oldCheck)) throw new Error('unrecognized residual_unknown status constraint')
      const dependents = db.prepare("SELECT sql FROM sqlite_schema WHERE tbl_name='residual_unknown' AND type IN ('index','trigger') AND sql IS NOT NULL").all()
      const replacement = sql.replace(oldCheck, oldCheck.slice(0, -1) + ",'withdrawn')").replace(/CREATE TABLE "?residual_unknown"?/i, 'CREATE TABLE residual_unknown_migration')
      db.exec(replacement)
      db.exec('INSERT INTO residual_unknown_migration SELECT * FROM residual_unknown; DROP TABLE residual_unknown; ALTER TABLE residual_unknown_migration RENAME TO residual_unknown')
      for (const item of dependents) db.exec(item.sql)
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

function semanticId({operation, parameters = {}, result, confidence = 'inferred', authority = 'tool-output', limitations = [], supporting_ev_ids = []}) {
  return evidenceId({operation, parameters: sanitizeForHash(parameters), result: sanitizeForHash(result),
    confidence, authority, limitations, supporting_ev_ids: [...supporting_ev_ids].sort()})
}

function parseEvidenceRow(row) {
  const record = { ...row, parameters: JSON.parse(row.parameters), result: JSON.parse(row.result),
    limitations: JSON.parse(row.limitations), supporting_ev_ids: JSON.parse(row.supporting_ev_ids) }
  if ((record.confidence === 'observed' && record.authority === 'subagent-report') ||
      !Array.isArray(record.supporting_ev_ids) || !Array.isArray(record.limitations) || semanticId(record) !== row.ev_id) {
    throw new Error('evidence integrity mismatch: ' + row.ev_id)
  }
  return record
}

function parseUnknownRow(row) {
  return {
    ...row,
    supporting_ev_ids: safeJsonParse(row.supporting_ev_ids, []),
    contradicting_ev_ids: safeJsonParse(row.contradicting_ev_ids, []),
  }
}

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

/** 해시에 넣기 전에 함수/undefined/BigInt 처럼 JSON 으로 표현할 수 없는 값을 정리합니다 */
function sanitizeForHash(value) {
  if (value === undefined) return null
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'function') return '[function]'
  if (typeof value === 'symbol') return '[symbol]'
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(sanitizeForHash)
  const out = Object.create(null)
  for (const [k, v] of Object.entries(value)) out[k] = sanitizeForHash(v)
  return out
}
