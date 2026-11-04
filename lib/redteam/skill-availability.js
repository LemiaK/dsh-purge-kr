/**
 * 스킬 가용성 자체 점검(의존성 없음, tools 와 UI 가 함께 쓰는 **유일한** 판정 로직)
 *
 * 왜 필요한가: 스킬 본문에는 "로컬 경로 / 환경 변수 / VPS 주소"가 적혀 있지만 **스킬이 목록에 보인다 ≠ 실제로 돕니다**.
 * `FOFA_KEY` 가 없고, 도구가 `$DSH_HOME/redteam/toolkit/` 에 없고, VPS 가 아직 자리표시자이면 실제로 손을 대야
 * 비로소 발견됩니다. 그때는 이미 실습 환경에 들어와 있습니다. 여기서 판정을 한 벌로 모읍니다:
 *   · 에이전트 측 -- `redteam_preflight` 를 시작 전에 한 번 돌리고, 빠진 것은 사용자에게 바로 요청합니다.
 *   · 패널 측 -- "스킬 라이브러리" 탭이 스킬마다 가용성 상태를 표시합니다.
 *
 * 모든 문제에 **수정 방법**(`issues[].fix`, 문구는 `skill-fixes.js`)을 함께 줍니다: 패널은
 * "어디가 불가능한지"만 말하지 않고 "어떻게 고치는지"를 사용자에게 바로 알려줍니다. `problems` 는 순수 텍스트 뷰로 남깁니다(구 호출자 호환).
 *
 * 판정 차원(모두 스킬 본문에서 객관적으로 읽을 수 있습니다):
 *   ① 본문 로드 가능 여부 -- "본문도 읽히지 않고 파일도 정말 이 머신에 없습니다"일 때만 스킬 전체를 사용 불가로 표시합니다.
 *      본문이 손에 있으면(호스트가 content 를 줬습니다) 모델이 이 스킬을 로드할 수 있다는 뜻입니다. 이때 기록된 경로 부재는 **구 설치 /
 *      다른 머신**의 흔적일 뿐이며(스킬 경로는 절대 경로라 머신이 바뀌면 반드시 빗나갑니다), 그것으로 사용 불가를 보고할 수 없습니다.
 *   ② 환경 변수(`os.environ["X"]` / `process.env.X`; 기본값이 있는 `os.environ.get("X", "...")` 는 제외);
 *   ③ 본문이 인용하는 로컬 경로(toolkit / bin / local 아래 절대 경로, `$DSH_HOME`, `~/`);
 *   ④ 외부 인프라 자리표시자(예: `<VPS_IP>` 가 채워지지 않음).
 * ②③④ 는 결손으로만 기록합니다. 스킬 본문에 대체 방법이 적혀 있으면 도구나 키가 없어도 로드할 수 있습니다.
 *
 * 판정하지 않는 것: 의미적 정확성, 권한, 대상 도달성 -- 실제로 한 번 써봐야 알 수 있습니다.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixesForIssue } from './skill-fixes.js'

/** $DSH_HOME / ${DSH_HOME} / ~ 를 해석합니다(스킬 본문에 여러 표기가 섞여 있습니다). */
export function expandSkillPath(p, env = process.env) {
  const dshHome = env.DSH_HOME || resolve(homedir(), '.dsh')
  let out = String(p).trim()
  out = out.replace(/\$\{DSH_HOME\}/g, dshHome).replace(/\$DSH_HOME/g, dshHome)
  if (out.startsWith('~/')) out = resolve(homedir(), out.slice(2))
  return out
}

/**
 * 이 머신에서 `$DSH_HOME` 이 나올 수 있는 두 가지 출처.
 *
 * 플러그인 프로세스는 `process.env.DSH_HOME || homedir()/.dsh` 로 해석하고, 호스트 측 `dshHomePath()` 는
 * 자기 home 을 씁니다. 디스크를 바꿨거나 profile 을 바꿨거나 `HOME` 이 빈 머신에서는 둘이 갈라지고, 한쪽만 인정하면
 * 스킬 사본과 toolkit 경로를 전부 "존재하지 않음"으로 판정합니다(다른 사람 컴퓨터에서 스킬이 불가능으로 보이는 주원인).
 */
export function dshHomeCandidates(env = process.env) {
  const out = []
  const push = (p) => { if (p && !out.includes(p)) out.push(p) }
  push(env.DSH_HOME)
  push(resolve(homedir(), '.dsh'))
  return out
}

/** 본문의 로컬 경로가 **어느** 후보 home 아래에 존재하면 존재로 봅니다(env 만 보면 toolkit 전체 누락을 잘못 보고합니다). */
export function existsUnderAnyHome(raw, env = process.env) {
  for (const home of dshHomeCandidates(env)) {
    if (existsSync(expandSkillPath(raw, { ...env, DSH_HOME: home }))) return true
  }
  return false
}

/** 스킬 본문에서 "필수지만 설정되지 않은" 환경 변수 이름을 뽑습니다. */
export function requiredEnvOf(content) {
  const names = new Set()
  const body = String(content || '')
  /* Node 측: process.env.X (기본값이라는 개념이 없습니다) */
  for (const m of body.matchAll(/process\.env\.([A-Z][A-Z0-9_]{2,})/g)) names.add(m[1])
  /* Python 측: os.environ["X"] 는 필수; os.environ.get("X", "기본값") 은 폴백이 있어 필수가 아닙니다 */
  for (const m of body.matchAll(/os\.environ(?:\.get)?[\[(]\s*["']([A-Z][A-Z0-9_]{2,})["']\s*(,)?/g)) {
    if (m[2] === undefined) names.add(m[1])
  }
  /* shell 측: ${X:?필수} 는 명시적 필수; 맨 $X 는 판정하지 않습니다(스킬에 $TARGET 같은 자리표시자가 대량으로 나옵니다) */
  for (const m of body.matchAll(/\$\{([A-Z][A-Z0-9_]{2,}):\?/g)) names.add(m[1])
  return Array.from(names)
}

/** 설명 파일은 도구가 아닙니다. 다른 시스템, 다른 CPU 용 파일 이름으로 현재 시스템 불가를 판정하지도 않습니다. */
export function pathCountsOnThisHost(raw, platform = process.platform, arch = process.arch) {
  const base = String(raw).replace(/\\/g, '/').split('/').pop() || ''
  if (/\.(md|txt|json|ya?ml|csv)$/i.test(base)) return false
  const token = (name) => new RegExp('(?:^|[._-])(?:' + name + ')(?:[._-]|$)', 'i').test(base)
  if (platform === 'win32' && /\.(sh|bash)$/i.test(base)) return false
  if (platform === 'win32' && /\/\.local\/|\/\.kimi-webbridge\//.test(String(raw).replace(/\\/g, '/'))) return false
  const isWinName = /\.exe$/i.test(base) || token('windows|win32|win64')
  const isDarwin = token('darwin|macos')
  const isLinux = token('linux')
  const isArm = token('arm64|aarch64')
  const isAmd = token('amd64|x64|x86_64')
  if (platform === 'win32' && (isLinux || isDarwin)) return false
  if (platform === 'darwin' && (isWinName || isLinux)) return false
  if (platform !== 'win32' && platform !== 'darwin' && (isWinName || isDarwin)) return false
  if (isArm && arch !== 'arm64') return false
  if (isAmd && arch !== 'x64') return false
  return true
}

/** 본문이 인용하는, 존재 여부를 판정할 수 있는 로컬 경로(toolkit / bin / local 아래 절대 경로). */
export function referencedPathsOf(content) {
  const out = new Set()
  for (const m of String(content || '').matchAll(/(?:~|\$DSH_HOME|\/home\/[^\s"'`,)]+?)\/[\w./\u4e00-\u9fa5-]+/g)) {
    const raw = m[0].replace(/[\uff0c\u3002\uff1b\u3001\uff1a)\uff09\]]+$/, '')
    if (!/\/(toolkit|bin|local)\//.test(raw)) continue
    if (/[<>{}*|]/.test(raw)) continue
    if (!pathCountsOnThisHost(raw)) continue
    out.add(raw)
  }
  return Array.from(out)
}

/** 호스트 스킬 서비스가 목록을 못 줄 때는 이 패키지의 skills/redteam 과 $DSH_HOME/redteam/skills 를 씁니다. */
export function bundledSkillSummaries() {
  const here = dirname(fileURLToPath(import.meta.url))
  /* 후보 home 을 모두 훑습니다: 호스트가 dshHomePath 로 스킬을 나열할 때는 자기 home 을 쓰므로,
     env 쪽만 훑으면 갈라진 머신에서 "설치했는데 목록이 나오지 않습니다"가 됩니다. */
  const dirs = [join(here, '..', '..', 'skills', 'redteam')]
  for (const home of dshHomeCandidates()) {
    const dir = join(home, 'redteam', 'skills')
    if (!dirs.includes(dir)) dirs.push(dir)
  }
  const seen = new Set()
  const out = []
  for (const dir of dirs) {
    let names
    try { names = readdirSync(dir) } catch { continue }
    for (const file of names) {
      if (!file.endsWith('.md')) continue
      const name = file.slice(0, -3)
      if (seen.has(name)) continue
      const filePath = join(dir, file)
      let content = ''
      try { content = readFileSync(filePath, 'utf8') } catch { content = '' }
      if (!content.trim()) continue
      seen.add(name)
      const title = (content.match(/^#\s+(.+)$/m) || [])[1] || name
      out.push({
        name,
        description: String(title).trim(),
        content,
        path: filePath,
        library: 'redteam',
        resourceBase: { kind: 'directory', path: dir },
      })
    }
  }
  return out
}

/** 공식 스킬은 `$DSH_HOME/skills`. 레드팀 스킬은 이 패키지 `skills/redteam` 또는 `$DSH_HOME/redteam/skills`. */
export function skillLibraryOf(summary) {
  if (!summary || typeof summary !== 'object') return ''
  if (summary.library === 'official' || summary.library === 'redteam') return summary.library
  const n = [summary.path, summary.dir, summary.root, summary.resourceBase && summary.resourceBase.path]
    .filter((item) => typeof item === 'string')
    .join('\n')
    .replace(/\\/g, '/')
  if (/\/skills\/redteam(\/|$)/.test(n) || /\/redteam\/skills(\/|$)/.test(n)) return 'redteam'
  if (/\/skills(\/|$)/.test(n)) return 'official'
  return ''
}

/** 공식 사용자 스킬. 레드팀 도구 경로로 이들의 가용성을 판정하지 않습니다. */
export function officialSkillSummaries() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  const dir = join(home, 'skills')
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return [] }
  const out = []
  const seen = new Set()
  for (const entry of entries) {
    if (!entry || entry.name === '.system' || entry.name.startsWith('.')) continue
    let filePath = ''
    let name = ''
    if (entry.isDirectory()) {
      filePath = join(dir, entry.name, 'SKILL.md')
      name = entry.name
    } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'SKILL.md') {
      filePath = join(dir, entry.name)
      name = entry.name.slice(0, -3)
    } else {
      continue
    }
    if (seen.has(name) || !existsSync(filePath)) continue
    let content = ''
    try { content = readFileSync(filePath, 'utf8') } catch { continue }
    if (!content.trim()) continue
    seen.add(name)
    const title = (content.match(/^description:\s*(.+)$/m) || content.match(/^#\s+(.+)$/m) || [])[1] || name
    out.push({
      name,
      description: String(title).trim().replace(/^['"]|['"]$/g, ''),
      content,
      path: filePath,
      library: 'official',
      resourceBase: { kind: 'directory', path: dir },
    })
  }
  return out
}

/** 레드팀 자체 점검은 레드팀 스킬만 씁니다. 공식 스킬이 호스트 목록에 있어도 경로 판정에 참여하지 않습니다. */
export function redteamSummariesForCheck(summaries, bundled, scoped) {
  const base = Array.isArray(bundled) ? bundled : []
  const names = new Set(base.map((item) => item && item.name).filter(Boolean))
  const picked = []
  const seen = new Set()
  for (const summary of Array.isArray(summaries) ? summaries : []) {
    if (!summary || !summary.name || seen.has(summary.name)) continue
    const library = skillLibraryOf(summary)
    if (library === 'official') continue
    if (library === 'redteam' || scoped === true || names.has(summary.name)) {
      seen.add(summary.name)
      picked.push(summary)
    }
  }
  for (const item of base) {
    if (!item || !item.name || seen.has(item.name)) continue
    seen.add(item.name)
    picked.push(item)
  }
  return picked
}

/** 어떤 스킬 루트에서 같은 이름 스킬의 본문을 읽습니다(읽지 못하면 null). */
export function readSkillFromRoot(root, name) {
  if (typeof root !== 'string' || root === '') return null
  for (const dir of [root, resolve(root, String(name || ''))]) {
    for (const file of [resolve(dir, String(name || '') + '.md'), resolve(dir, 'SKILL.md')]) {
      try { if (existsSync(file)) return { path: file, content: readFileSync(file, 'utf8') } } catch { /* 다음 후보를 계속 시도 */ }
    }
  }
  return null
}

/** 수정 문구 생성기를 호출하되, 어떤 예외든 빈 문자열로 떨어뜨립니다(문구 오류로 가용성 판정이 죽으면 안 됩니다). */
function safeFix(issue) {
  try { return String(fixesForIssue(issue) || '') } catch { return '' }
}

/**
 * 스킬 하나의 가용성을 검사합니다.
 *
 * @param skill - `{ name, description?, content?, path?, root? }` (content 는 스킬 본문, root 는 어느 스킬 루트에서 왔는지).
 * @param options - `{ env?: NodeJS.ProcessEnv, sameNameIn?: string[] }`.
 *   `sameNameIn` 은 **같은 이름 스킬도 등록한 다른 루트** 목록입니다: 같은 이름은 루트 순서로 우선권이 정해져 뒤에 오는 사본은
 *   "가려집니다". 이것으로 "실제 로드된 것은 패키지 동봉 자리표시자 버전이고 사용자가 설정한 버전은 뒤에 있습니다"를 식별합니다.
 * @returns `{ name, status: 'available'|'broken'|'unknown', issues, problems, needs_user, checked, shadowed_by? }`
 *   `issues` 는 `{ kind, detail, fix }` 목록(`kind` ∈ file-missing / content-missing /
 *   env-missing / path-missing / placeholder / shadowed)이고, `problems` 는 그 detail 의 텍스트 뷰입니다.
 *   경로 누락, 키 누락, 자리표시자 미기입은 모두 issues 에 남기고 status 를 broken 으로 만들지 않습니다.
 *   status='unknown' 은 "본문을 읽을 수 없어 판정할 수 없음"입니다(예: 메타데이터만 있고 본문 로드가 실패한 원격 스킬).
 */
export function checkSkill(skill, options = {}) {
  const env = options.env || process.env
  const name = skill && skill.name ? String(skill.name) : '(이름 없음)'
  const content = skill && typeof skill.content === 'string' ? skill.content : ''
  const file = skill && typeof skill.path === 'string' ? skill.path : null
  const root = skill && typeof skill.root === 'string' ? skill.root : null
  const issues = []
  const needsUser = []
  /** 문제 하나를 기록합니다: detail 은 사용자에게 보여줄 "불가 사유", fix 는 "고치는 방법"입니다(skill-fixes.js 참고). */
  const addIssue = (kind, detail, extra) => {
    const payload = Object.assign({ kind, skill: name }, extra || {})
    let fix = ''
    try { fix = String(fixesForIssue(payload) || '') } catch { fix = '' }
    issues.push(Object.assign({ kind, detail, fix }, extra || {}))
  }

  if (content.trim() === '') {
    /* 본문을 읽을 수 없습니다. 여기서 둘로 나눕니다: 파일이 원래 이 머신에 있어야 하는데 없으면(정말 로드 불가 => broken),
       나머지(메타데이터만 / 원격 스킬 소스 / 호스트가 본문을 주지 않음 => 판정 불가 => unknown). */
    const gone = file !== null && !existsSync(file)
    const detail = gone
      ? '스킬 파일이 이 머신에 존재하지 않고 본문도 읽히지 않습니다: ' + file
      : '스킬 본문을 읽을 수 없습니다(메타데이터만 있음): 가용성을 판단할 수 없으니 필요할 때 `skill` 도구로 실제 로드해 봅니다'
    const kind = gone ? 'file-missing' : 'content-missing'
    return {
      name,
      status: gone ? 'broken' : 'unknown',
      issues: [{ kind, detail, fix: safeFix({ kind, skill: name, file: file || undefined }) }],
      problems: [detail],
      needs_user: [],
      checked: { file, env: [], paths: [] },
    }
  }
  /* 본문이 있으면 스킬은 로드 가능합니다. 여기서 경로는 힌트일 뿐입니다: 지난번 어느 머신에서 해석된 절대 경로라,
     머신이 바뀌면 반드시 빗나갑니다. 비차단 file-stale 로 기록하고 스킬 전체를 사용 불가로 만들지 않습니다. */
  if (file !== null && !existsSync(file)) {
    addIssue('file-stale', '스킬에 기록된 파일 경로가 이 머신에 없습니다(본문은 여전히 로드 가능): ' + file, { file })
  }

  const envNames = requiredEnvOf(content)
  const missingEnv = envNames.filter((n) => !env[n])
  for (const n of missingEnv) {
    addIssue('env-missing', '환경 변수 누락: ' + n, { env: n })
  }

  const paths = referencedPathsOf(content)
  const missingPaths = paths.filter((p) => !existsUnderAnyHome(p, env))
  if (missingPaths.length > 0) {
    addIssue('path-missing', '인용된 로컬 경로가 존재하지 않습니다: ' + missingPaths.slice(0, 6).join(', ')
      + (missingPaths.length > 6 ? ' 등 ' + missingPaths.length + '곳' : ''), { paths: missingPaths })
  }

  /* 외부 인프라 자리표시자: 스킬에 `<VPS_IP>` 같은 표기가 있으면 아직 구성되지 않았다는 뜻입니다.
     하지만 **이미 구성된 배포를 잘못 보고하면 안 됩니다**: `REDTEAM_VPS_HOST` 에 값이 있으면
     스킬 본문의 자리표시자는 문서 표기일 뿐이고(실제 명령은 설정값으로 치환됩니다) 더 이상 결손이 아닙니다.
     판정 순서는 반드시 "설정을 먼저, 자리표시자를 나중에"여야 합니다. 아니면 VPS 를 구성한 머신에서
     이 스킬들이 영원히 broken 으로 보입니다(템플릿 자리표시자와 실제 설정이 섞여 있습니다). */
  const vpsConfigured = typeof env.REDTEAM_VPS_HOST === 'string' && env.REDTEAM_VPS_HOST.trim() !== ''
  const placeholders = []
  if (!vpsConfigured) {
    if (content.includes('<\u4f60\u7684VPS_IP>') || content.includes('<VPS_IP>')) placeholders.push('VPS 주소')
    if (content.includes('<\u4f60\u7684VPS_\u4e3b\u673a\u540d>') || content.includes('<VPS \u4e3b\u673a\u540d>')) placeholders.push('VPS 호스트 이름')
  }
  for (const p of placeholders) {
    addIssue('placeholder', p + ' 가 아직 자리표시자입니다(스킬에 자리표시자가 적혀 있다는 것은 이 머신/이 환경이 아직 구성되지 않았다는 뜻)', { placeholder: p })
    needsUser.push(p)
  }
  for (const n of missingEnv) needsUser.push('환경 변수 ' + n)

  /* 폴백: 같은 이름 스킬이 다른 루트에 "문제가 더 적은" 버전으로 있습니다(보통 사용자가 설정해 둔 사본이지만
     앞에 있는 패키지 동봉 자리표시자 버전에 가려진 상태입니다). 이때는 사실대로 알려주고, 사용자가 환경이 구성되지 않았다고 오해하게 두지 않습니다. */
  let shadowed = null
  for (const other of Array.isArray(options.sameNameIn) ? options.sameNameIn : []) {
    if (other === root) continue
    const alt = readSkillFromRoot(other, name)
    if (alt === null || alt.content === content) continue
    const verdict = checkSkill({ name, content: alt.content, path: alt.path }, { env })
    if (verdict.status === 'available' || verdict.problems.length < issues.length) {
      shadowed = { root: other, path: alt.path, status: verdict.status }
      addIssue('shadowed', '`' + other + '` 에 같은 이름 스킬이 하나 더 있습니다(' + verdict.status + '), '
        + '그런데 스킬 루트 순서상 지금 로드된 것은 이 사본입니다(위 불가 사유는 이 사본에서 나온 것)', { other_root: other })
      break
    }
  }

  /* 여기까지 왔으면 본문은 반드시 읽혔다 => 사용 가능. 도구 누락 / 키 누락 / 자리표시자 / 다른 머신에서 온 경로는 모두 결손으로만 기록합니다. */
  return {
    name,
    status: 'available',
    issues,
    problems: issues.map((x) => x.detail),
    needs_user: Array.from(new Set(needsUser)),
    ...(shadowed === null ? {} : { shadowed_by: shadowed.root, shadowed_path: shadowed.path }),
    checked: { file, env: envNames, missing_env: missingEnv, paths, missing_paths: missingPaths },
  }
}

/** 스킬 묶음의 상태를 집계합니다(패널 상단 라벨과 preflight 반환값이 모두 이것을 씁니다). */
export function summarizeSkills(results) {
  const out = { total: results.length, available: 0, broken: 0, unknown: 0 }
  for (const r of results) out[r.status] = (out[r.status] || 0) + 1
  return out
}
