/**
 * RedTeam 콘솔 — Host 절반
 *
 * 역할: 브라우저 쪽에 이 패키지 전용 HTTP 브리지 `POST /redteam/api` 를 제공합니다:
 *   · 자산 라이브러리 관련 op 는 `ctx.redteam`(dsh-redteam-store 가 게시하는 프로세스 수준 서비스)으로 넘깁니다;
 *   · 세션 연결성 op(probeSessions)는 host 측에서 실제 TCP/HTTP 프로브를 보냅니다;
 *   · 스킬 카탈로그 op(skillCatalog / skillRead)는 `ctx.skills` 를 직접 읽고, 레드팀 preset
 *     의 standing scope 로 목록을 가져옵니다 — 스킬은 DSH 네이티브 skill 체계가 관리합니다($DSH_HOME/skills,
 *     프로젝트 .dsh/skills, .agents/skills). 콘솔은 조회만 합니다.
 *
 * 왜 typert/@Remote 대신 webServer 를 쓰는가: 이 패키지와 store 패키지 모두 의도적으로 외부 의존성 0 을 유지합니다
 * (profile 에서 node_modules 가 해석되지 않으므로) 명명 라우트가 가장 작고 안정된 접합점입니다.
 * 교차 출처 요청은 Origin/Host 검증으로 막습니다(동일 출처 POST 만 통과).
 */
import { fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, realpathSync } from 'node:fs'
import { homedir } from 'node:os'
import { spawn, execFileSync } from 'node:child_process'
import { request as httpsRequest } from 'node:https'
import { dispatch, dispatchAsync } from './store-core.js'
/* 스킬 가용성 판정은 redteam_preflight 와 같은 구현을 공유합니다(환경 변수 / 로컬 경로 / placeholder) */
import { checkSkill, officialSkillSummaries, skillLibraryOf, summarizeSkills } from './skill-availability.js'
import { maxAgentsOf, maxAgentsSourceOf, saveMaxAgents, DEFAULT_MAX_AGENTS, MAX_AGENTS_LIMIT } from './settings.js'
import {
  loadPlatformConfig, mergeConfigEnv, redteamRoot, envAdaptStatus, markEnvAdaptSkip,
  platformSummary, savePlatformConfig, assignToolkitFolder,
} from './platform-config.js'

/** DSH_HOME: 명시적 환경 변수를 우선하고, Windows 에서 HOME 은 흔히 비어 있으므로 homedir() 로 폴백. */
function dshHomeOf() {
  if (process.env.DSH_HOME) return process.env.DSH_HOME
  return join(homedir(), '.dsh')
}

/**
 * 이 패키지에 내장된 스킬 디렉터리 후보.
 * 데스크톱에서 profile/node_modules 심볼릭 링크로 로드될 때 import.meta.url 만으로 상대 경로를 조립하면
 * 존재하지 않는 위치를 가리킬 수 있습니다(공백 포함 경로, 미해석 junction). 그래서 여러 경로를 탐색하고 realpath 를 씁니다.
 * index.js 에서 packagePaths 를 가져오지 않습니다 — cordis 플러그인 진입점과 상호 끌어당김을 피합니다.
 */
/** `$DSH_HOME` 의 두 가지 가능한 출처(플러그인 프로세스 env 와 호스트 dshHomePath 가 쓰는 home 은 갈라질 수 있습니다). */
function dshHomeCandidates() {
  const out = []
  const push = (p) => { if (p && !out.includes(p)) out.push(p) }
  push(process.env.DSH_HOME)
  push(join(homedir(), '.dsh'))
  return out
}

function resolvePluginSkillsDir() {
  const candidates = []
  try {
    const root = fileURLToPath(new URL('../..', import.meta.url))
    candidates.push(join(root, 'skills', 'redteam'))
  } catch { /* ignore */ }
  try {
    candidates.push(resolve(fileURLToPath(new URL('../../skills/redteam/', import.meta.url))))
  } catch { /* ignore */ }
  /* installBundledSkills 기록 위치: 패키지 내부 경로가 무효여도 스킬을 나열할 수 있어야 합니다. 두 후보 home 을 모두 탐색. */
  for (const home of dshHomeCandidates()) {
    candidates.push(join(home, 'redteam', 'skills'))
    for (const profile of ['desktop', 'web', 'headless']) {
      candidates.push(join(home, 'profiles', profile, 'node_modules', 'dsh-purge', 'skills', 'redteam'))
    }
  }
  /* 공식 $DSH_HOME/skills 는 스캔하지 않습니다: 스킬은 이 패키지 / 동기화 사본만 인정합니다(업스트림 플러그인 내 배포와 같습니다). */
  for (const raw of candidates) {
    if (!raw) continue
    try {
      if (!existsSync(raw)) continue
      const real = realpathSync(raw)
      const md = readdirSync(real).filter((f) => f.endsWith('.md'))
      if (md.length > 0 || /skills[/\\]redteam$/i.test(real) || /[/\\]skills$/i.test(real)) return real
    } catch { /* try next */ }
  }
  return null
}

const PLUGIN_SKILLS_DIR = resolvePluginSkillsDir()

function readOfficialSkill(name) {
  if (typeof name !== 'string' || name.length === 0) return { ok: false, error: 'name required' }
  const found = officialSkillSummaries().find((skill) => skill.name === name)
  if (!found) return { ok: false, error: 'skill not found: ' + name }
  return {
    ok: true,
    name: found.name,
    description: found.description,
    whenToUse: '',
    provider: 'dsh',
    source: 'official',
    path: found.path,
    content: found.content,
    library: 'official',
  }
}

function officialCatalogItems() {
  return officialSkillSummaries().map((skill) => ({
    name: skill.name,
    description: skill.description,
    whenToUse: '',
    provider: 'dsh',
    source: 'official',
    dir: skill.resourceBase && skill.resourceBase.path,
    path: skill.path,
    modelInvocable: true,
    userInvocable: true,
    fromPlugin: false,
    library: 'official',
    availability: 'listed',
    problems: [],
    needs_user: [],
  }))
}

function withBothLibraries(payload) {
  if (!payload || payload.ok === false || !Array.isArray(payload.items)) return payload
  const redteam = payload.items.map((item) => Object.assign({ library: 'redteam' }, item, {
    library: item.library === 'official' ? 'official' : 'redteam',
  }))
  const seen = new Set(redteam.filter((item) => item.library === 'official').map((item) => item.name))
  const official = officialCatalogItems().filter((item) => !seen.has(item.name))
  const items = redteam.concat(official)
  return Object.assign({}, payload, {
    items,
    total: items.length,
    libraries: {
      redteam: items.filter((item) => item.library !== 'official').length,
      official: items.filter((item) => item.library === 'official').length,
    },
  })
}
/** 디렉터리 비교는 정규화가 필요합니다: 레지스트리는 `/a/b/skills` 를 주고, URL 조립 결과에는 끝 슬래시가 붙을 수 있습니다. */
const sameDir = (a, b) => {
  if (a === null || b === null) return false
  try {
    const left = existsSync(a) ? realpathSync(a) : resolve(a)
    const right = existsSync(b) ? realpathSync(b) : resolve(b)
    return left === right
  } catch {
    try { return resolve(a) === resolve(b) } catch { return false }
  }
}

/** Cordis 플러그인 이름. */
export const name = 'dsh-purge-redteam-ui'

/**
 * 하드 의존성은 자산 라이브러리 + HTTP 만 남깁니다.
 * skills / agentPresets 는 데스크톱에서 로드 순서가 더 늦거나 이름이 다릅니다. 하드 의존성으로 쓰면
 * `/redteam/api` 가 아예 붙지 않아 UI 의 스킬 라이브러리/지식 베이스/SQLite 가 전부 읽히지 않습니다.
 */
export const inject = ['redteam', 'webServer']

/** 요청 본문 상한(자산 가져오기는 클 수 있습니다). */
const MAX_BODY_BYTES = 8 * 1024 * 1024

/* ------------------------------------------------------------------ 버전과 업데이트 */

/** 타임아웃과 함께 shell 명령을 실행합니다. `{ code, stdout, stderr, timedOut }` 반환. */
function run(command, args, options = {}) {
  return new Promise((resolvePromise) => {
    let child
    try {
      /* ⚠️ 세 가지 모두 실제로 겪었습니다:
         · env 는 반드시 process.env 를 명시적으로 넘겨야 합니다 — spawn 기본값은 빈 환경이라, 빈 PATH 에서
           npm/pnpm 은 `spawn npm ENOENT` 를 냅니다(버전 검사가 영원히 실패);
         · cwd 는 **실제로 존재하는** 디렉터리여야 합니다 — 존재하지 않는 경로도 똑같이 ENOENT 이고
           (오류가 "명령을 찾을 수 없음"처럼 보여 오판하기 쉽습니다);
         · Windows 에서 npm/npx/pnpm/yarn 은 모두 .cmd 배치 파일이라, Node 의 spawn 이
           shell 을 거치지 않으면 실행 파일을 찾지 못합니다 — `shell: true`(또는 .cmd 접미사 보충)가
           있어야 PATHEXT 가 해석됩니다. 아니면 레드팀 패널의 "새 버전 확인"이 영원히 code=-1. */
      const cwd = typeof options.cwd === 'string' && options.cwd !== '' && existsSync(options.cwd) ? options.cwd : undefined
      const isWin = process.platform === 'win32'
      const needsShim = isWin && /^(npm|npx|pnpm|pnpx|yarn)$/i.test(command)
      child = spawn(needsShim ? `${command}.cmd` : command, args, {
        cwd,
        env: options.env || process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: needsShim,
        windowsHide: isWin,
      })
    } catch (error) {
      resolvePromise({ code: -1, stdout: '', stderr: error && error.message ? error.message : String(error) })
      return
    }
    let stdout = ''
    let stderr = ''
    let settled = false
    const CHILD_IO_CAP = 1 << 20 // 자식 프로세스 stdout/stderr 각 1MB 상한, 폭주하는 자식이 호스트를 OOM 내는 것을 방지
    const done = (value) => { if (!settled) { settled = true; resolvePromise(value) } }
    const cleanupPipes = () => {
      try { child.stdout.removeAllListeners(); child.stderr.removeAllListeners() } catch { /* ignore */ }
      try { child.stdout.destroy(); child.stderr.destroy() } catch { /* ignore */ }
    }
    // 자손까지 kill: child.kill 은 직계 자식만 죽이고 손자(npm → node → tool)는 살아남습니다. Windows 는 taskkill /T 로 트리를 죽이고,
    // POSIX 는 SIGKILL 폴백 + process group kill 시도.
    const killTree = () => {
      try { child.kill('SIGKILL') } catch { /* ignore */ }
      try {
        if (process.platform === 'win32' && child.pid) {
          execFileSync('taskkill', ['/T', '/F', '/PID', String(child.pid)], {
            stdio: 'ignore', windowsHide: true, timeout: 2000,
          })
        } else if (child.pid) {
          try { process.kill(-child.pid, 'SIGKILL') } catch { /* group leader 가 아니면 무시 */ }
        }
      } catch { /* taskkill 실패는 무방, child.kill 이 이미 먼저 실행됨 */ }
    }
    const timer = setTimeout(() => {
      killTree()
      cleanupPipes()
      done({ code: -1, stdout: stdout, stderr: stderr, timedOut: true })
    }, Math.max(Number(options.timeoutMs) || 30000, 1000))
    child.stdout.on('data', (c) => {
      if (settled) return
      if (stdout.length + c.length > CHILD_IO_CAP) {
        killTree()
        clearTimeout(timer); cleanupPipes()
        done({ code: -1, stdout, stderr, oversize: 'stdout' }); return
      }
      stdout += c.toString('utf8')
    })
    child.stderr.on('data', (c) => {
      if (settled) return
      if (stderr.length + c.length > CHILD_IO_CAP) {
        killTree()
        clearTimeout(timer); cleanupPipes()
        done({ code: -1, stdout, stderr, oversize: 'stderr' }); return
      }
      stderr += c.toString('utf8')
    })
    child.on('error', (error) => {
      clearTimeout(timer); cleanupPipes()
      done({ code: -1, stdout: stdout, stderr: String((error && error.message) || error) })
    })
    child.on('close', (code) => {
      clearTimeout(timer); cleanupPipes()
      done({ code: code === null ? -1 : code, stdout: stdout, stderr: stderr })
    })
  })
}

/** 이 플러그인 패키지의 신원(store 셸이 package.json 을 읽어 붙입니다; 읽지 못하면 "알 수 없는 버전" 으로 보고). */
function pluginIdentity(ctx) {
  const store = ctx.redteam
  const info = store && store.plugin ? store.plugin : null
  return {
    name: (info && info.name) || 'dsh-purge',
    version: (info && info.version) || null,
    description: (info && info.description) || '',
    homepage: (info && info.homepage) || null,
  }
}

/**
 * profile 디렉터리: DSH 의 `ctx.baseUrl` 이 바로 이것입니다(loader.internal.import(name, profileDir) 의 base).
 * ⚠️ `ctx.baseUrl` 은 실제로 `file:///...` URL 입니다 — 경로로 착각해 join/existsSync 에 넘기면
 *    `node_modules` 가 URL 뒤에 붙어 `updatePreflight` 가 `devLinked` 를 영구히 true 로 판정하고,
 *    이후 패널의 "업데이트" 버튼이 영원히 비활성으로 남습니다. 반드시 fileURLToPath 로 시스템 경로로 되돌려야 합니다.
 */
function profileDirOf(ctx) {
  try {
    const raw = ctx && typeof ctx.baseUrl === 'string' ? ctx.baseUrl : ''
    if (raw) return raw.startsWith('file://') ? fileURLToPath(raw) : raw
  } catch { /* 무시: 변환 실패 시 폴백 경로 사용 */ }
  return join(dshHomeOf(), 'profiles', 'web')
}

/**
 * 환경 적응 op: 패널 EnvTab 이 `$DSH_HOME/redteam/config.json` 을 읽고 씁니다.
 * @returns JSON 결과, 또는 이 op 가 아니면 undefined.
 */
function handlePlatformOp(store, request) {
  const op = request && request.op
  if (op !== 'platformConfigGet' && op !== 'platformConfigSave' && op !== 'platformAssignToolkit'
    && op !== 'platformEnvAdaptStatus' && op !== 'platformEnvAdaptSkip') {
    return undefined
  }
  const root = (store && store.root) || redteamRoot()
  // EnvAdaptSendGate 가 준비 상태를 폴링 / "나중에 설정"; 이 분기가 없으면 프론트엔드가 영원히 ready 를 받지 못합니다.
  if (op === 'platformEnvAdaptStatus') return Object.assign({ ok: true }, envAdaptStatus(root))
  if (op === 'platformEnvAdaptSkip') {
    return Object.assign({ ok: true }, markEnvAdaptSkip(root, request.skip === undefined ? true : !!request.skip))
  }
  if (op === 'platformConfigGet') return platformSummary(root)
  if (op === 'platformConfigSave') {
    savePlatformConfig(request.config || {}, root)
    return platformSummary(root)
  }
  return assignToolkitFolder(request.dir, root)
}

/** profile 의 package.json 을 읽습니다(의존성 선언 + dsh.profile.bundles). */
function readProfilePackage(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  } catch { return null }
}

/** 패키지 관리자: profile 에 pnpm-lock / pnpm-workspace 가 있으면 pnpm, 없으면 npm. */
function packageManagerOf(dir) {
  if (existsSync(join(dir, 'pnpm-lock.yaml')) || existsSync(join(dir, 'pnpm-workspace.yaml'))) return 'pnpm'
  return 'npm'
}

/**
 * 업데이트 사전 검사: 배포판이 설치되어 있는지(profile 에서 이 패키지 이름이 해석되는지),
 * 실행 중인 에이전트가 있는지(업데이트는 dsh web 을 재시작하므로 이들을 끊습니다).
 */
async function updatePreflight(ctx) {
  const dir = profileDirOf(ctx)
  const pkg = pluginIdentity(ctx)
  const profilePkg = readProfilePackage(dir)
  const deps = (profilePkg && profilePkg.dependencies) || {}
  const declared = typeof deps[pkg.name] === 'string' ? deps[pkg.name] : null
  const installedDir = join(dir, 'node_modules', pkg.name)
  const blockers = []
  const notes = []

  /* ① 개발 상태(소스 심볼릭 링크): profile 에 이 패키지 이름이 없음 → 패키지 관리자로 업데이트할 수 없음 */
  const devLinked = declared === null && !existsSync(join(installedDir, 'package.json'))
  if (devLinked) {
    blockers.push('현재는 **개발 상태 설치** 입니다(profile 의존성에 ' + pkg.name + ' 가 없고, 소스 심볼릭 링크/수동 마운트 상태). 패키지 관리자 업데이트를 적용할 수 없습니다.')
    notes.push('개발 상태에서는 이 저장소에서 업그레이드하세요: `git pull && npm run build:client` 후 DeepSeek Harness 를 재시작하세요.')
  }

  /* ② 실행 중인 에이전트가 있음: 재시작이 이들을 끊습니다 */
  let running = []
  try {
    const subagents = ctx.get('subagents')
    const sessions = ctx.get('sessions')
    if (subagents !== undefined && subagents !== null && sessions !== undefined && sessions !== null && typeof sessions.list === 'function') {
      const roots = sessions.list().filter((s) => {
        const header = s && s.header
        return header && (header.parentSession === undefined || header.parentSession === null)
      })
      for (const root of roots) {
        try {
          const kids = await subagents.listChildren(root.id)
          for (const k of Array.isArray(kids) ? kids : []) {
            if (k && k.kind === 'child' && k.activity === 'running') running.push({ session: String(root.id), label: k.label || String(k.id) })
          }
        } catch { /* 세션 하나를 읽지 못해도 나머지에 영향 없음 */ }
      }
    }
  } catch { /* 레지스트리를 쓸 수 없으면 막지 않습니다(보호 계층 하나가 빠질 뿐) */ }
  if (running.length > 0) {
    blockers.push('에이전트 ' + running.length + '개가 실행 중입니다(' + running.map((r) => r.label).join(', ') + '): 업데이트는 현재 호스트를 재시작하므로 이들을 끊습니다. 종료될 때까지 기다리세요.')
  }
  return { dir, declared, packageManager: packageManagerOf(dir), devLinked, running, blockers, notes }
}

/** package.json 의 homepage/repository 에서 `owner/repo` 를 뽑습니다; 없으면 기본 저장소를 반환. */
function githubRepoOf(homepage) {
  const m = String(homepage || '').match(/github\.com[/:]+([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/#?].*)?$/i)
  if (m) return `${m[1]}/${m[2]}`
  return 'YuJunZhiXue/dsh-purge'
}

/** 간이 JSON 조회(10초 타임아웃, 30xx 자동 리다이렉트 없음 — api.github.com 은 리다이렉트하지 않습니다). */
function fetchJsonFromGithub(url) {
  return new Promise((resolveP) => {
    try {
      const req = httpsRequest(url, {
        method: 'GET',
        headers: {
          'user-agent': 'dsh-purge-updater',
          accept: 'application/vnd.github+json',
          'x-github-api-version': '2022-11-28',
        },
      }, (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          resolveP({ ok: false, error: `HTTP ${res.statusCode}` })
          return
        }
        let body = ''
        const BODY_CAP = 1 << 20 // 1MB: github tags/releases JSON 은 보통 수 KB~수십 KB, 1MB 면 충분하고 OOM 방지에도 충분
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          if (body.length + chunk.length > BODY_CAP) {
            try { res.destroy(new Error('body too large')) } catch { /* 무시 */ }
            resolveP({ ok: false, error: 'response body too large' })
            return
          }
          body += chunk
        })
        res.on('end', () => {
          try { resolveP({ ok: true, data: JSON.parse(body) }) }
          catch { resolveP({ ok: false, error: 'JSON parse error' }) }
        })
      })
      // req.setTimeout 은 socket 이 할당된 뒤에야 동작하고, DNS 조회 단계에서 멈추면 트리거되지 않습니다. setTimeout 폴백을 덧붙입니다.
      const extTimer = setTimeout(() => {
        try { req.destroy(new Error('timeout')) } catch { /* 무시 */ }
        resolveP({ ok: false, error: 'timeout' })
      }, 12000)
      req.setTimeout(10000, () => { try { req.destroy(new Error('timeout')) } catch { /* 무시 */ } })
      req.on('error', (e) => { clearTimeout(extTimer); resolveP({ ok: false, error: String(e && e.message || e) }) })
      req.on('close', () => clearTimeout(extTimer))
      req.end()
    } catch (e) {
      resolveP({ ok: false, error: String(e && e.message || e) })
    }
  })
}

/** 프리릴리스 버전 이름 판별: `-beta`/`-rc`/`-pre` 같은 것은 stable 로 보지 않습니다. */
function isPrereleaseName(name) {
  return /[-._](?:alpha|beta|rc|pre|preview|dev|snapshot|test)(?:[-._\d]|$)/i.test(String(name || ''))
}

/** GitHub Tags 폴백: dsh-purge 는 npm 에 배포하지 않으므로 `npm view` 는 반드시 404 다. 안정 tag 만 사용합니다. */
async function checkLatestFromGithub(homepage) {
  const repo = githubRepoOf(homepage)
  const r = await fetchJsonFromGithub(`https://api.github.com/repos/${repo}/tags?per_page=50`)
  if (!r.ok || !Array.isArray(r.data)) return { ok: false, error: r.error || 'GitHub tags 를 사용할 수 없습니다' }
  let latest = null
  for (const row of r.data) {
    const name = String(row && row.name || '').trim()
    if (!/^v?\d+\.\d+\.\d+/.test(name)) continue
    const ver = name.replace(/^v/, '')
    /* 프리릴리스 tag(1.2.0-beta.1, 2.0.0-rc1)는 core 번호가 stable 보다 크면 그대로 채택할 경우
       아직 정식 배포되지 않은 버전을 "최신"으로 삼게 됩니다 — update.js 의 latestStableVersion 기준을 재사용해
       건너뜁니다. */
    if (isPrereleaseName(ver)) continue
    if (!latest || versionLess(latest, ver)) latest = ver
  }
  if (!latest) return { ok: false, error: 'GitHub 에서 식별 가능한 안정 버전 tag 가 없습니다' }
  return { ok: true, latest, registry: 'github' }
}

/** npm registry 에서 최신 버전을 조회합니다(패키지 관리자를 경유해 자체 네트워크 스택을 피합니다). dsh-purge 는 npm 에 없으므로 → GitHub 으로 바로 갑니다. */
async function checkLatest(ctx, dir, name) {
  const pkg = pluginIdentity(ctx)
  const pm = packageManagerOf(dir)
  const args = ['view', name, 'version', '--json']
  const r = await run(pm, args, { cwd: dir, timeoutMs: 60000 })
  if (r.code === 0) {
    const raw = String(r.stdout || '').trim().replace(/^"|"$/g, '')
    const latest = raw.split('\n').map((x) => x.trim().replace(/^"|"$/g, '')).filter(Boolean).pop() || null
    if (latest) return { ok: true, latest, registry: pm }
  }
  /* npm 폴백 실패(가장 흔한 것은 404 — dsh-purge 는 npmjs 에 배포된 적이 없습니다, 업스트림 issue #93) 또는 Windows
     PATH 미설정으로 인한 ENOENT, 어느 쪽이든 GitHub Tags 로 갑니다: 이것이 이 저장소의 권위 있는 버전 소스입니다. */
  const gh = await checkLatestFromGithub(pkg.homepage)
  if (gh.ok) return gh
  const stderr = String(r.stderr || r.stdout || '').trim().slice(0, 400)
  return { ok: false, error: `최신 버전 조회 실패(${pm} view: ${stderr || 'code ' + r.code}; github: ${gh.error})` }
}

/** `a < b`(숫자 구간만 비교, 충분합니다; 프리릴리스 접미사는 "더 오래됨" 으로 처리). */
function versionLess(a, b) {
  const parse = (v) => String(v || '').split('-')[0].split('.').map((x) => Number(x) || 0)
  const [x, y] = [parse(a), parse(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    if ((x[i] || 0) < (y[i] || 0)) return true
    if ((x[i] || 0) > (y[i] || 0)) return false
  }
  return false
}

/**
 * 재시작 스크립트: 이전 프로세스 종료 + 포트 해제를 기다린 뒤 같은 인자로 dsh web 을 다시 띄웁니다.
 *
 * 생성되는 것은 **자족적인 node 스크립트**다(shell 스크립트가 아닙니다). 세 가지 일을 합니다:
 *   ① 이전 pid 종료 대기(최대 60초);
 *   ② 포트가 더 이상 리슨되지 않을 때까지 대기(최대 30초, net 으로 프로브, ss/lsof 에 의존하지 않음);
 *   ③ spawn(command, ARGS_ARRAY) 로 argv 배열을 넘겨 새 프로세스를 띄웁니다.
 *
 * 왜 shell 을 쓰지 않는가: 원 구현은 명령과 인자를 shell 문자열로 이어 붙여 수제 인용부호 이스케이프가
 * 필요했고(작은따옴표 안에 작은따옴표, 다시 큰따옴표 이스케이프), 한 곳만 빠져도 명령 주입이었습니다 —
 * 그리고 이 스크립트는 "프로그램이 생성해 사용자 권한으로 실행"되는 것이라 주입 면이 가장 없어야 합니다.
 * argv 배열을 spawn 에 넘기면 shell 이 전혀 개입하지 않아 이스케이프 문제가 근본적으로 사라집니다.
 *
 * @param pid - 현재 프로세스 pid(이것이 종료되기를 기다립니다).
 * @param port - dsh web 포트(해제되기를 기다립니다).
 * @param command - 실행 파일(보통 process.argv[0]).
 * @param args - 인자 배열(process.argv.slice(1)).
 * @param logPath - 로그 파일 경로(추가 기록).
 * @param cwd - 새 프로세스의 작업 디렉터리.
 * @returns 스크립트 본문.
 */
function restartScript(pid, port, command, args, logPath, cwd) {
  const payload = {
    oldPid: Number(pid),
    port: Number(port) || 0,
    command: String(command),
    args: args.map((a) => String(a)),
    log: String(logPath),
    cwd: String(cwd),
  }
  return [
    '#!/usr/bin/env node',
    '/* RedTeam 콘솔의 "자동 업데이트"가 생성: 이전 dsh web 이 종료되면 원래 argv 로 다시 띄웁니다.',
    '   인자는 배열 형태로 spawn 에 전달됩니다 — shell 이 개입하지 않으므로 인용부호 이스케이프와 명령 주입 문제가 없습니다. */',
    "'use strict'",
    'const { spawn } = require("node:child_process")',
    'const { appendFileSync, mkdirSync } = require("node:fs")',
    'const { connect } = require("node:net")',
    'const { dirname } = require("node:path")',
    'const CFG = ' + JSON.stringify(payload, null, 2),
    '',
    'const log = (msg) => {',
    '  const line = "[" + new Date().toISOString() + "] " + msg + "\\n"',
    '  try { mkdirSync(dirname(CFG.log), { recursive: true }); appendFileSync(CFG.log, line) } catch (e) { /* 로그를 쓰지 못해도 재시작에 영향을 주면 안 됩니다 */ }',
    '}',
    '',
    'const sleep = (ms) => new Promise((r) => setTimeout(r, ms))',
    '',
    '/** 이전 프로세스가 아직 살아 있는가(kill -0 의 등가물). */',
    'const alive = (pid) => { try { process.kill(pid, 0); return true } catch (e) { return false } }',
    '',
    '/** 포트에 아직 리스너가 있는가(ss/lsof 에 의존하지 않음). */',
    'const portBusy = (port) => new Promise((resolve) => {',
    '  if (!port) { resolve(false); return }',
    '  const sock = connect({ host: "127.0.0.1", port: port })',
    '  let done = false',
    '  const finish = (busy) => { if (!done) { done = true; try { sock.destroy() } catch (e) {} resolve(busy) } }',
    '  sock.setTimeout(800)',
    '  sock.on("connect", () => finish(true))',
    '  sock.on("timeout", () => finish(false))',
    '  sock.on("error", () => finish(false))',
    '})',
    '',
    'async function main() {',
    '  log("이전 프로세스 pid=" + CFG.oldPid + " 종료 대기…")',
    '  for (let i = 0; i < 60; i += 1) {',
    '    if (!alive(CFG.oldPid)) break',
    '    await sleep(1000)',
    '  }',
    '  for (let i = 0; i < 30; i += 1) {',
    '    if (!(await portBusy(CFG.port))) break',
    '    await sleep(1000)',
    '  }',
    '  log("시작: " + CFG.command + " " + CFG.args.join(" "))',
    '  const child = spawn(CFG.command, CFG.args, {',
    '    cwd: CFG.cwd,',
    '    detached: true,',
    '    stdio: ["ignore", "ignore", "ignore"],',
    '    env: process.env,',
    '  })',
    '  child.unref()',
    '  log("새 프로세스 pid=" + child.pid + " 를 띄웠습니다")',
    '}',
    '',
    'main().catch((error) => { log("재시작 실패: " + (error && error.message ? error.message : String(error))) })',
    '',
  ].join('\n')
}

/** 업데이트 적용: 새 버전 설치 + 재시작 스크립트 생성 + 현재 프로세스 종료. */
async function applyUpdate(ctx, dir, name, targetVersion) {
  const pm = packageManagerOf(dir)
  const spec = targetVersion ? name + '@' + targetVersion : name
  const args = pm === 'pnpm' ? ['add', spec] : ['install', spec, '--save']
  const r = await run(pm, args, { cwd: dir, timeoutMs: 300000 })
  if (r.code !== 0) {
    return { ok: false, error: '설치 실패(' + pm + ' ' + args.join(' ') + '): ' + String(r.stderr || r.stdout || '').trim().slice(0, 1200) }
  }
  /* 재시작: 현재 프로세스의 시작 명령을 그대로 다시 실행 */
  const argv = process.argv.slice()
  const command = argv[0]
  const rest = argv.slice(1)
  const port = (() => {
    try { return String(ctx.webServer.port) } catch { return '3080' }
  })()
  const root = (() => {
    try { return ctx.redteam.root } catch { return join(process.env.DSH_HOME || '.', 'redteam') }
  })()
  mkdirSync(root, { recursive: true })
  const logPath = join(root, 'update.log')
  const scriptPath = join(root, 'restart-dsh-web.sh')
  writeFileSync(scriptPath, restartScript(process.pid, port, command, rest, logPath, process.cwd()), { encoding: 'utf8', mode: 0o755 })
  const child = spawn(process.execPath, [scriptPath], { detached: true, stdio: 'ignore' })
  child.unref()
  /* 브라우저가 응답을 받을 시간을 준 뒤 종료 — 새 프로세스는 스크립트가 원래 명령줄로 띄웁니다 */
  setTimeout(() => { process.exit(0) }, 1200).unref()
  return {
    ok: true, installed: spec, packageManager: pm,
    restart: { script: scriptPath, log: logPath, port, command: [command].concat(rest).join(' '), pid: process.pid },
  }
}


/** 요청 본문 전체를 읽습니다; 상한을 넘으면 즉시 중단. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false
    const done = (fn, arg) => { if (!settled) { settled = true; fn(arg) } }
    req.on('data', (chunk) => {
      if (settled) return
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        // Error 를 담아 destroy → socket 이 즉시 RST, 클라이언트가 더 보내지 않으므로 종단 간 정리.
        const err = new Error('request body too large')
        done(reject, err)
        try { req.destroy(err) } catch { /* 무시 */ }
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => done(resolve, Buffer.concat(chunks).toString('utf8')))
    req.on('error', (err) => done(reject, err))
  })
}

/** 통일된 JSON 응답. */
function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  })
  res.end(body)
}

/** 스킬 가용성 캐시: `{ at, scope, byName: Map }`; 30초 안에는 재사용. */
let skillAvailabilityCache = null
const SKILL_AVAILABILITY_TTL_MS = 30000

/**
 * Cordis 서비스를 안전하게 얻습니다: inject 되지 않았을 때 ctx.get / 속성 접근은 예외를 던지므로 400 으로 새어 나가면 안 됩니다.
 */
function softService(ctx, name) {
  if (!ctx) return undefined
  try {
    if (typeof ctx.get === 'function') return ctx.get(name)
  } catch { /* not injected */ }
  try {
    return ctx[name]
  } catch { /* proxy throw */ }
  return undefined
}

/**
 * 스킬별 가용성(본문 읽기 → 공유 판정 모듈).
 * @param skillsSvc - 이미 얻은 skills 서비스(null 가능).
 * @param list - `skills.list()` 의 반환값(SkillSummary[]).
 * @param scope - 현재 스코프.
 * @param force - true 이면 빠른 캐시를 건너뜁니다.
 */
async function skillAvailabilityOf(skillsSvc, list, scope, force) {
  const now = Date.now()
  // scope 서명을 cache key 에 포함: preset 을 바꾸면 scope 가 달라져, 이전 cache 는 잘못된 가용성 스냅샷일 수 있습니다.
  const scopeSig = scope == null ? '' : String(scope)
  if (!force && skillAvailabilityCache !== null
    && now - skillAvailabilityCache.at < SKILL_AVAILABILITY_TTL_MS
    && skillAvailabilityCache.size === list.length
    && skillAvailabilityCache.scope === scopeSig) {
    return { at: skillAvailabilityCache.at, cached: true, byName: skillAvailabilityCache.byName }
  }
  const rootsWith = new Map()
  for (const x of list) {
    const dir = x.resourceBase && x.resourceBase.kind === 'directory' ? x.resourceBase.path : null
    if (dir === null) continue
    if (!rootsWith.has(x.name)) rootsWith.set(x.name, [])
    if (!rootsWith.get(x.name).includes(dir)) rootsWith.get(x.name).push(dir)
  }
  const byName = new Map()
  for (const summary of list) {
    let def
    try {
      def = skillsSvc && typeof skillsSvc.get === 'function'
        ? await skillsSvc.get(summary.name, { scope })
        : undefined
    } catch { def = undefined }
    const path = def && typeof def.path === 'string'
      ? def.path
      : (summary.resourceBase && summary.resourceBase.kind === 'directory' ? summary.resourceBase.path : null)
    const root = summary.resourceBase && summary.resourceBase.kind === 'directory' ? summary.resourceBase.path : null
    const verdict = checkSkill({ name: summary.name, content: def && def.content, path, root },
      { env: mergeConfigEnv(process.env, loadPlatformConfig(redteamRoot())), sameNameIn: rootsWith.get(summary.name) || [] })
    byName.set(summary.name, verdict)
  }
  skillAvailabilityCache = { at: now, scope: scope == null ? '' : String(scope), size: list.length, byName }
  return { at: now, cached: false, byName }
}

/**
 * 스킬 카탈로그: 데스크톱은 기본적으로 이 패키지의 `skills/redteam/*.md` 를 읽습니다;
 * skills + agentPresets 가 모두 사용 가능할 때만 네이티브 레지스트리를 사용합니다.
 */
async function handleSkillOp(ctx, request) {
  if (request.op !== 'skillCatalog' && request.op !== 'skillRead') return undefined

  /* 데스크톱에서는 "without inject" 가 새어 나가면 안 됩니다: 항상 softService + 파일 폴백. */
  const skillsSvc = softService(ctx, 'skills')
  const presetsSvc = softService(ctx, 'agentPresets')

  let scope = null
  let registryReady = false
  if (skillsSvc && typeof skillsSvc.list === 'function' && presetsSvc) {
    const standing = presetsSvc.standingKeyFor
    if (typeof standing === 'function') {
      try {
        scope = await standing.call(presetsSvc, 'redteam')
        registryReady = scope != null
      } catch {
        registryReady = false
      }
    }
  }

  if (!registryReady) {
    return withBothLibraries(handleSkillOpFromPluginDir(request))
  }

  if (request.op === 'skillCatalog') {
    let list = []
    try {
      list = await skillsSvc.list({ scope })
    } catch {
      list = []
    }
    if (!Array.isArray(list) || list.length === 0) {
      return withBothLibraries(handleSkillOpFromPluginDir(request))
    }
    const redteamList = list.filter((s) => skillLibraryOf(s) !== 'official')
    const availability = await skillAvailabilityOf(skillsSvc, redteamList, scope, request.refresh === true)
    const pluginDir = resolvePluginSkillsDir()
    const bySource = new Map()
    const byDir = new Map()
    const items = list.map((s) => {
      const dir = s.resourceBase && s.resourceBase.kind === 'directory' ? s.resourceBase.path : null
      const name = dir === null ? '(비파일시스템 소스)' : dir
      byDir.set(name, (byDir.get(name) || 0) + 1)
      bySource.set(s.source, (bySource.get(s.source) || 0) + 1)
      const library = skillLibraryOf(s) === 'official' ? 'official' : 'redteam'
      const avail = availability.byName.get(s.name)
      return {
        name: s.name,
        description: s.description,
        whenToUse: s.whenToUse || '',
        provider: s.provider,
        source: s.source,
        dir: dir,
        modelInvocable: s.invocation ? s.invocation.modelInvocable !== false : true,
        userInvocable: s.invocation ? s.invocation.userInvocable !== false : true,
        fromPlugin: sameDir(dir, pluginDir),
        library,
        availability: library === 'official' ? 'listed' : (avail ? avail.status : 'unknown'),
        problems: library === 'official' ? [] : (avail ? avail.problems : ['미검사']),
        needs_user: library === 'official' ? [] : (avail ? avail.needs_user : []),
      }
    })
    const availSummary = summarizeSkills(Array.from(availability.byName.values()))
    return withBothLibraries({
      ok: true,
      total: items.length,
      fromPlugin: items.filter((x) => x.fromPlugin).length,
      availability: {
        summary: availSummary,
        checked_at: availability.at,
        cached: availability.cached,
        broken: Array.from(availability.byName.values()).filter((x) => x.status === 'broken')
          .map((x) => ({ name: x.name, problems: x.problems, needs_user: x.needs_user })),
        note: '가용성 = 스킬 파일이 존재하고 본문을 로드할 수 있음. 도구 부재, 키 부재, VPS placeholder 는 결손 항목에 기록하고 스킬 전체를 사용 불가로 표시하지 않습니다.',
      },
      bySource: Array.from(bySource, ([k, n]) => ({ key: k, n })).sort((a, b) => b.n - a.n),
      byDir: Array.from(byDir, ([k, n]) => ({ key: k, n })).sort((a, b) => b.n - a.n),
      note: '레드팀 스킬과 공식 스킬은 분리합니다. 레드팀 스킬만 도구 경로 검사를 하고, 공식 스킬은 $DSH_HOME/skills 에서 호스트가 작업에 따라 호출합니다.',
      items,
    })
  }
  if (request.library === 'official') return readOfficialSkill(request.name)
  if (typeof request.name !== 'string' || request.name.length === 0) {
    return { ok: false, error: 'name required' }
  }
  try {
    const skill = await skillsSvc.get(request.name, { scope })
    if (skill !== undefined) {
      return {
        ok: true,
        name: skill.name,
        description: skill.description,
        whenToUse: skill.whenToUse || '',
        provider: skill.provider,
        source: skill.source,
        path: skill.path || null,
        content: skill.content || '',
      }
    }
  } catch { /* fall through */ }
  return handleSkillOpFromPluginDir(request)
}

/** 이 패키지의 skills/redteam 디렉터리로 스킬 카탈로그를 구성하고 실제 가용성 검사를 합니다(호스트 skills 주입에 의존하지 않음). */
function handleSkillOpFromPluginDir(request) {
  const dir = resolvePluginSkillsDir() || PLUGIN_SKILLS_DIR
  if (!dir || !existsSync(dir)) {
    return { ok: false, error: '이 패키지의 skills/redteam 디렉터리가 없고 호스트 skills 서비스도 사용할 수 없습니다' }
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  const parseMeta = (text) => {
    const out = { description: '', whenToUse: '' }
    const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
    if (!m) {
      const first = String(text || '').split(/\r?\n/).find((l) => l.trim()) || ''
      out.description = first.replace(/^#\s*/, '').trim()
      return out
    }
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^(\w+)\s*:\s*(.*)$/.exec(line)
      if (!kv) continue
      if (kv[1] === 'description') out.description = kv[2].trim().replace(/^['"]|['"]$/g, '')
      if (kv[1] === 'when_to_use' || kv[1] === 'whenToUse') out.whenToUse = kv[2].trim().replace(/^['"]|['"]$/g, '')
    }
    return out
  }
  /* 환경 변수: 프로세스 + 플랫폼 config.json(빈 필드는 덮어쓰지 않음) */
  const cfg = loadPlatformConfig(redteamRoot())
  const checkEnv = mergeConfigEnv(process.env, cfg)

  if (request.op === 'skillCatalog') {
    const byName = new Map()
    const items = files.map((file) => {
      const name = file.replace(/\.md$/i, '')
      const path = join(dir, file)
      let description = ''
      let whenToUse = ''
      let content = ''
      try {
        content = readFileSync(path, 'utf8')
        const meta = parseMeta(content)
        description = meta.description
        whenToUse = meta.whenToUse
      } catch { /* ignore */ }
      const verdict = checkSkill(
        { name, content, path, root: dir },
        { env: checkEnv },
      )
      byName.set(name, verdict)
      return {
        name,
        description,
        whenToUse,
        provider: 'dsh-purge',
        source: 'plugin',
        dir,
        modelInvocable: true,
        userInvocable: true,
        fromPlugin: true,
        library: 'redteam',
        availability: verdict.status,
        problems: verdict.problems,
        needs_user: verdict.needs_user,
      }
    }).sort((a, b) => a.name.localeCompare(b.name))
    const availSummary = summarizeSkills(Array.from(byName.values()))
    return withBothLibraries({
      ok: true,
      total: items.length,
      fromPlugin: items.length,
      availability: {
        summary: availSummary,
        checked_at: Date.now(),
        cached: false,
        broken: Array.from(byName.values()).filter((x) => x.status === 'broken')
          .map((x) => ({ name: x.name, problems: x.problems, needs_user: x.needs_user })),
        note: '이 패키지의 스킬 파일로 자체 점검(환경 적응 config.json 포함). 도구 경로, 키, VPS placeholder 는 결손 항목에만 기록하고 스킬 전체를 사용 불가로 표시하지 않습니다.',
      },
      bySource: [{ key: 'plugin', n: items.length }],
      byDir: [{ key: dir, n: items.length }],
      note: '이 패키지 skills/redteam 에 스킬 ' + items.length + '개; 가용성은 본문과 로컬 설정으로 검사했습니다.',
      items,
    })
  }
  if (request.library === 'official') return readOfficialSkill(request.name)
  if (typeof request.name !== 'string' || request.name.length === 0) {
    return { ok: false, error: 'name required' }
  }
  const file = join(dir, request.name.endsWith('.md') ? request.name : (request.name + '.md'))
  if (!existsSync(file)) return { ok: false, error: 'skill not found: ' + request.name }
  let content = ''
  try { content = readFileSync(file, 'utf8') } catch (error) {
    return { ok: false, error: error && error.message ? error.message : String(error) }
  }
  const meta = parseMeta(content)
  return {
    ok: true,
    name: request.name.replace(/\.md$/i, ''),
    description: meta.description,
    whenToUse: meta.whenToUse,
    provider: 'dsh-purge',
    source: 'plugin',
    path: file,
    content,
  }
}

/**
 * 에이전트 동시성 상태("에이전트" 탭에서 사용): subagents 레지스트리에서 "실제로 실행 중"인 자식 세션을 직접 읽습니다.
 * 도구 계층의 `redteam_agent_slot` 과 같은 기준을 쓰지만, 여기서는 읽기만 하고 슬롯을 차지하지 않습니다.
 * @param ctx - 플러그인 컨텍스트.
 * @param request - `{ op: 'agentsStatus' }`.
 * @returns JSON 결과, 또는 이 op 가 아니면 undefined.
 */
async function handleAgentsOp(ctx, request) {
  if (request.op !== 'agentsStatus' && request.op !== 'setAgentsMax') return undefined
  const root = (() => { try { return ctx.redteam.root } catch { return undefined } })()
  if (request.op === 'setAgentsMax') {
    const next = saveMaxAgents(root, request.max)
    return {
      ok: true, max: next, source: 'settings', limit: MAX_AGENTS_LIMIT,
      note: '동시 실행 에이전트 ' + next + '개로 저장했습니다. **즉시 적용**됩니다(작업 배분 시 새 값으로 허용, dsh web 재시작 불필요).',
    }
  }
  const max = maxAgentsOf(root, process.env)
  const subagents = ctx.get('subagents')
  const sessions = ctx.get('sessions')
  if (subagents === undefined || subagents === null || sessions === undefined || sessions === null || typeof sessions.list !== 'function') {
    return { ok: false, error: 'subagents / sessions 레지스트리를 사용할 수 없습니다: 동시 점유를 읽을 수 없습니다.', max }
  }
  const children = []
  try {
    const roots = sessions.list().filter((s) => {
      const header = s && s.header
      return header && (header.parentSession === undefined || header.parentSession === null)
    })
    for (const root of roots) {
      try {
        const kids = await subagents.listChildren(root.id)
        for (const k of Array.isArray(kids) ? kids : []) {
          if (k && k.kind === 'child') children.push({ parent: String(root.id), label: k.label || String(k.id), activity: k.activity, mode: k.mode })
        }
      } catch { /* 세션 하나를 읽지 못하면 건너뜁니다 */ }
    }
  } catch (error) {
    return { ok: false, error: '자식 세션 나열 실패: ' + (error && error.message ? error.message : String(error)), max }
  }
  const running = children.filter((c) => c.activity === 'running')
  return {
    ok: true, max, used: running.length, free: Math.max(max - running.length, 0),
    running: running.slice(0, 20), total_children: children.length,
    source: maxAgentsSourceOf(root, process.env),
    limit: MAX_AGENTS_LIMIT,
    default_max: DEFAULT_MAX_AGENTS,
    note: '같은 세션(타깃)에서 동시에 최대 ' + max + '개 실행 에이전트; 기본은 순차 배분입니다.',
  }
}

/**
 * 버전/업데이트 계열 op(패널 우상단 "버전 + 자동 업데이트"에서 사용).
 * 자산 라이브러리는 건드리지 않고 profile 과 npm/pnpm 을 직접 다룹니다; 전부 host 측에서 실행됩니다.
 * @param ctx - 플러그인 컨텍스트.
 * @param request - `{ op: 'version' | 'updateCheck' | 'updateApply', target? }`.
 * @returns JSON 결과, 또는 업데이트 계열 op 가 아니면 undefined.
 */
async function handleUpdateOp(ctx, request) {
  if (!['version', 'updateCheck', 'updateApply'].includes(request.op)) return undefined
  const pkg = pluginIdentity(ctx)
  const pre = await updatePreflight(ctx)
  if (request.op === 'version') {
    const check = pre.devLinked ? null : await checkLatest(ctx, pre.dir, pkg.name)
    return {
      ok: true,
      plugin: pkg,
      install: {
        mode: pre.devLinked ? 'dev' : 'package',
        dir: pre.dir,
        declared: pre.declared,
        packageManager: pre.packageManager,
      },
      latest: check && check.ok ? check.latest : null,
      updateAvailable: check && check.ok && pkg.version ? versionLess(pkg.version, check.latest) : false,
      /* 로컬 버전이 registry 보다 최신: 이 머신은 아직 배포되지 않은 개발 버전을 실행 중입니다.
         이 경우를 구분하지 않으면 "업데이트 확인" 이 계속 "최신입니다" 를 보여 주어, "이 버전은 배포된 적이 없습니다" 는 사실을 감춥니다. */
      localAhead: check && check.ok && pkg.version ? versionLess(check.latest, pkg.version) : false,
      check_error: check && check.ok === false ? check.error : undefined,
      blockers: pre.blockers,
      notes: pre.notes,
      running_agents: pre.running,
    }
  }
  if (request.op === 'updateCheck') {
    const check = await checkLatest(ctx, pre.dir, pkg.name)
    if (check.ok !== true) return { ok: false, error: check.error, current: pkg.version, install: { mode: pre.devLinked ? 'dev' : 'package' } }
    const localAhead = pkg.version ? versionLess(check.latest, pkg.version) : false
    return {
      ok: true, current: pkg.version, latest: check.latest,
      updateAvailable: pkg.version ? versionLess(pkg.version, check.latest) : true,
      localAhead,
      install: { mode: pre.devLinked ? 'dev' : 'package', dir: pre.dir, packageManager: pre.packageManager },
      blockers: pre.blockers,
      notes: pre.notes.concat(localAhead
        ? ['로컬 버전(' + pkg.version + ')이 npm 의 최신 버전(' + check.latest + ')보다 최신입니다: '
           + '현재 실행 중인 것은 아직 배포되지 않은 개발 버전이라 패키지 관리자 업데이트를 적용할 수 없습니다(버전을 되돌리려면 명시적으로 지정하세요).']
        : []),
      running_agents: pre.running,
    }
  }
  /* updateApply */
  if (pre.blockers.length > 0) {
    return { ok: false, error: '지금은 업데이트할 수 없습니다: ' + pre.blockers.join(' '), blockers: pre.blockers, notes: pre.notes }
  }
  /* target 은 그대로 `npm install <target>` 에 결합됩니다: 검증하지 않으면 "임의 패키지 설치 + 프로세스 재시작" 을
     브라우저 측 입력에 노출하는 것과 같습니다. 순수 semver(v 접두사 허용)만 받고 나머지는 이유를 밝혀 거부합니다. */
  const rawTarget = typeof request.target === 'string' ? request.target.trim() : ''
  if (rawTarget !== '' && !/^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(rawTarget)) {
    return {
      ok: false,
      current: pkg.version,
      error: 'updateApply 의 target 은 순수 버전 번호여야 합니다(예: 0.11.0). 받은 값: ' + JSON.stringify(rawTarget)
        + '. 패키지 이름, 경로, URL, npm 인자는 받지 않습니다 — 그대로 패키지 관리자에 전달되므로 원격에서 설치 내용을 지정하는 것과 같습니다.',
    }
  }
  const result = await applyUpdate(ctx, pre.dir, pkg.name, rawTarget || null)
  if (result.ok !== true) return Object.assign({ current: pkg.version }, result)
  return Object.assign({ current: pkg.version, latest: request.target || null }, result, {
    note: '설치했습니다. 현재 호스트를 재시작하는 중입니다(페이지가 몇 초 안에 끊기며, 재시작이 끝난 뒤 새로고침하면 새 버전을 볼 수 있습니다). 재시작 로그: ' + result.restart.log,
  })
}

/**
 * @param ctx - 플러그인 컨텍스트(redteam / webServer / skills / agentPresets 사용 가능이 보장된 상태).
 */
export function apply(ctx) {
  const store = ctx.redteam

  /* 레드팀 세션 전송 후의 하드 폴백: 환경이 준비되지 않았으면 첫 단계를 reject 해 바로 시작하는 일을 막습니다 */
  try {
    if (!ctx.__dshpEnvAdaptPreStep) {
      ctx.__dshpEnvAdaptPreStep = true
      const root = store && store.root ? store.root : redteamRoot()
      const hook = async (payload, next) => {
        try {
          const agent = payload && payload.agent
          const header = agent && agent.session && agent.session.header
          const preset = header && header.agentPreset
          if (preset === 'redteam') {
            const turn = Number(payload && payload.turn) || 0
            const step = Number(payload && payload.step) || 0
            if (turn <= 1 && step <= 1) {
              const status = envAdaptStatus(root)
              if (!status.ready) {
                return {
                  kind: 'reject',
                  reason: status.message
                    || '환경이 적응되지 않았습니다: dsh-purge → 환경 적응 설정 도구를 열거나, 나중에 설정하지 않기로 확인한 뒤 전송하세요.',
                  messages: [],
                }
              }
            }
          }
        } catch { /* 게이트 예외는 차단하지 않습니다 */ }
        return next()
      }
      // ctx.effect 로 감싸면 plugin dispose 시 hook 이 자동 해제되어, 이벤트 핸들러가 남아 언로드된 코드를 실행하는 일을 피합니다.
      // installed flag 로 중복 등록 방지(cordis 는 같은 handler 의 중복 등록을 허용해 여러 번 트리거됩니다).
      ctx.effect(() => {
        let installed = false
        let disposer = null
        const install = () => {
          if (installed) return
          try {
            disposer = ctx.on('agent/pre-step', hook, { global: true, prepend: true })
            installed = true
          } catch { /* ignore */ }
        }
        install()
        queueMicrotask(install)
        const timer = setTimeout(install, 800)
        return () => {
          clearTimeout(timer)
          try { if (typeof disposer === 'function') disposer() } catch { /* ignore */ }
          delete ctx.__dshpEnvAdaptPreStep
        }
      })
    }
  } catch { /* ignore */ }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/redteam/api',
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { ok: false, error: 'POST only' })
        return
      }
      /* 출처 검증: 로컬 루프백은 항상 통과(공식 데스크톱의 Origin 은 흔히 app:// / file:// 이고,
         이전 로직은 Origin.host 를 빈 값으로 판정해 곧바로 403 을 내 스킬 라이브러리/지식 베이스/SQL 이 전부 죽었습니다).
         루프백이 아닐 때만 Origin 과 Host 의 동일 출처를 요구합니다. */
      const remote = req.socket && req.socket.remoteAddress ? String(req.socket.remoteAddress) : ''
      const loopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1'
      const host = typeof req.headers.host === 'string' ? req.headers.host : ''
      const hostLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host)
      const origin = req.headers.origin
      const originOk = (() => {
        if (loopback) return true
        /* 공식 데스크톱: Origin 은 흔히 app:// / null, Host 는 여전히 127.0.0.1:port */
        if (hostLocal) {
          if (origin === undefined || origin === '' || origin === 'null') return true
          if (typeof origin === 'string' && /^app:/i.test(origin)) return true
          try {
            const oh = new URL(origin).host
            if (oh === host || oh === '' ) return true
          } catch { /* fall through */ }
        }
        if (typeof origin !== 'string' || origin === '') return false
        let originHost = null
        try { originHost = new URL(origin).host } catch { originHost = null }
        return originHost !== null && originHost === host
      })()
      if (!originOk) {
        sendJson(res, 403, { ok: false, error: 'cross-origin request rejected' })
        return
      }
      try {
        const raw = await readBody(req)
        const request = raw.trim() ? JSON.parse(raw) : {}
        const platformResult = handlePlatformOp(store, request)
        if (platformResult !== undefined) {
          sendJson(res, 200, platformResult)
          return
        }
        const agentsResult = await handleAgentsOp(ctx, request)
        if (agentsResult !== undefined) {
          sendJson(res, 200, agentsResult)
          return
        }
        const updateResult = await handleUpdateOp(ctx, request)
        if (updateResult !== undefined) {
          sendJson(res, 200, updateResult)
          return
        }
        let skillResult
        try {
          skillResult = await handleSkillOp(ctx, request)
        } catch (skillErr) {
          /* 데스크톱에서 inject 가 없을 때 절대 400 을 내지 않습니다: 파일 폴백으로 바로 갑니다 */
          if (request && (request.op === 'skillCatalog' || request.op === 'skillRead')) {
            skillResult = handleSkillOpFromPluginDir(request)
            if (!skillResult || skillResult.ok === false) {
              skillResult = {
                ok: false,
                error: '스킬 읽기 실패: ' + (skillErr && skillErr.message ? skillErr.message : String(skillErr)),
              }
            }
          } else {
            throw skillErr
          }
        }
        sendJson(res, 200, skillResult === undefined ? await dispatchAsync(store, request) : skillResult)
      } catch (error) {
        sendJson(res, 400, { ok: false, error: error && error.message ? error.message : String(error) })
      }
    },
  }))
}
