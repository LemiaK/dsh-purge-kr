/**
 * 레드팀 하위 세션의 역할 원고.
 *
 * 지휘자가 작업을 파견할 때 작업 첫 줄에 `redteamRole: <code>` 를 쓴다.
 * 하위 세션이 이 사용자 메시지를 받으면 역할을 기록하고, 시스템 프롬프트를 조립할 때
 * `engagements/<타깃>/agents/<code>.md` 를 정리 원고와 실행 환경 전제 사이에 그대로 넣는다.
 * 이 줄이 없으면 역할을 추측하지 않는다.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isRedteamSession } from '../identity.js'
import { redteamRoot } from './platform-config.js'

const ROLE_TAG = /^[ \t]*redteamRole:[ \t]*(recon|assess|vuln-scan|exploit|internal)[ \t]*$/im

const roleBySession = new Map()
// 모듈 수준 Map 이라 install/dispose 를 오가도 비워지지 않고, 프로세스가 오래 살면 session id 가 계속 쌓인다.
// FIFO 보완: 400 을 넘으면 가장 오래된 100 건을 폐기한다. 역할은 짧은 문자열이라 임계값을 넉넉히 둔다.
const ROLE_SESSION_CAP = 400
const ROLE_SESSION_EVICT = 100

function evictRoleBySessionIfOverflow() {
  if (roleBySession.size < ROLE_SESSION_CAP) return
  let i = 0
  for (const k of roleBySession.keys()) {
    if (i >= ROLE_SESSION_EVICT) break
    roleBySession.delete(k)
    i += 1
  }
}

export function parseRedteamRole(text) {
  const matched = String(text || '').match(ROLE_TAG)
  return matched ? matched[1].toLowerCase() : ''
}

export function textOfMessage(message) {
  if (!message) return ''
  if (typeof message === 'string') return message
  const content = message.content ?? message.text
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map((block) => (typeof block?.text === 'string' ? block.text : '')).join('\n')
}

function remember(agent, role) {
  const ids = [agent?.session?.id, agent?.id].filter((id) => id !== undefined && id !== null)
  if (ids.length) evictRoleBySessionIfOverflow()
  for (const id of ids) roleBySession.set(String(id), role)
}

function isRedteamChild(session, agent) {
  const header = session?.header
  if (header?.origin !== 'subagent' && !((header?.delegationDepth ?? 0) > 0)) return false
  return isRedteamSession({ session, agent: agent ? { ...agent, session } : { session } })
}

export function noteClaimedMessage(payload) {
  const agent = payload?.agent
  const session = agent?.session
  if (!isRedteamChild(session, agent)) return
  const role = parseRedteamRole(textOfMessage(payload?.message))
  if (!role) return
  remember(agent, role)
}

function roleFromSessionEvents(session) {
  const events = []
  try {
    if (typeof session?.snapshotEvents === 'function') {
      const got = session.snapshotEvents()
      if (Array.isArray(got)) events.push(...got)
    }
  } catch { /* 기록을 읽지 못하면 이미 기록된 역할만 쓴다 */ }
  if (Array.isArray(session?.events)) events.push(...session.events)
  let found = ''
  for (const event of events) {
    if (!event || event.type !== 'user/message') continue
    const data = event.data
    const role = parseRedteamRole(textOfMessage(data?.message || data))
    if (role) found = role
  }
  return found
}

function safeEngagementId(id) {
  const text = String(id || '').trim()
  if (!text || text.length > 200) return ''
  if (text.includes('..') || text.includes('/') || text.includes('\\') || text.includes('\0')) return ''
  return text
}

function currentEngagementId() {
  try {
    const root = redteamRoot()
    const id = safeEngagementId(readFileSync(join(root, 'current'), 'utf8'))
    if (!id) return ''
    if (!existsSync(join(root, 'engagements', id, 'agents'))) return ''
    return id
  } catch {
    return ''
  }
}

function readRoleFile(engagementId, role) {
  const id = safeEngagementId(engagementId)
  if (!id || !parseRedteamRole('redteamRole: ' + role)) return ''
  try {
    const path = join(redteamRoot(), 'engagements', id, 'agents', role + '.md')
    if (!existsSync(path)) return ''
    return readFileSync(path, 'utf8').trim()
  } catch {
    return ''
  }
}

export function resolveSubagentRoleText(context) {
  try {
    const agent = context?.agent
    const session = agent?.session || context?.session
    if (!isRedteamChild(session, agent)) return ''
    const sessionId = session?.id ?? agent?.id
    let role = sessionId !== undefined && sessionId !== null
      ? roleBySession.get(String(sessionId)) || ''
      : ''
    if (!role) {
      role = roleFromSessionEvents(session)
      if (role) remember(agent || { session }, role)
    }
    if (!role) return ''
    return readRoleFile(currentEngagementId(), role)
  } catch {
    return ''
  }
}

export function installSubagentRoleCapture(ctx) {
  if (!ctx || typeof ctx.on !== 'function') return
  if (ctx.__dshPurgeRoleCapture) return
  ctx.__dshPurgeRoleCapture = true
  const hook = (payload) => {
    try { noteClaimedMessage(payload) } catch { /* 역할 기록 실패가 메시지 수령을 막지 않는다 */ }
  }
  // ctx.effect: plugin dispose 시 agent/inbox/claimed 를 해제하지 않으면 재로드 후 역할 기록 함수가 N개 겹쳐 실행된다.
  // installed flag: cordis 는 같은 handler 를 여러 번 등록하면 여러 번 실행되므로 한 번만 붙인다.
  const effect = ctx.effect
  if (typeof effect === 'function') {
    effect.call(ctx, () => {
      let installed = false
      let disposer = null
      const install = () => {
        if (installed) return
        try {
          disposer = ctx.on('agent/inbox/claimed', hook, { global: true, prepend: true })
          installed = true
        } catch { /* ignore */ }
      }
      install()
      queueMicrotask(install)
      const timer = setTimeout(install, 800)
      return () => {
        clearTimeout(timer)
        try { if (typeof disposer === 'function') disposer() } catch { /* ignore */ }
        delete ctx.__dshPurgeRoleCapture
      }
    })
    return
  }
  // ctx.effect 를 쓸 수 없을 때(비 cordis 환경)는 원래 로직으로 되돌린다.
  let installed = false
  const install = () => {
    if (installed) return
    try { ctx.on('agent/inbox/claimed', hook, { global: true, prepend: true }); installed = true } catch { /* ignore */ }
  }
  install()
  queueMicrotask(install)
  setTimeout(install, 800)
}
