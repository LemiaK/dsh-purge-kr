/**
 * RedTeam 자산 라이브러리 — Cordis Host 플러그인 셸
 *
 * 역할: {@link RedteamStore} 를 프로세스 수준 서비스 `ctx.redteam` 으로 게시해,
 *   · 클라이언트 인터페이스(dsh-redteam-ui 의 HTTP 브리지 경유)
 *   · 각 역할 에이전트의 도구 행(preset 평면, ctx.redteam 주입)
 * 이 같은 SQLite 팩트베이스를 함께 읽게 한다.
 *
 * 평면 소속: host. 자산 데이터는 세션을 넘어 이후 취약점 탐지/익스플로잇/내부망 에이전트가 공유해야 하므로,
 * 서비스 인스턴스는 프로세스 수준에서 유일해야 하며 preset 에 넣을 수 없다.
 *
 * 외부 의존 없음: node: 내장 모듈만 쓰므로 profile 아래에서 node_modules 해석 실패를 피한다.
 */
import { join } from 'node:path'
import { homedir } from 'node:os'
import { readFileSync } from 'node:fs'
import { RedteamStore } from './store-core.js'

/** Cordis 플러그인 이름. */
export const name = 'redteam-store'

/** 하드 의존 없음: 데이터 계층은 다른 서비스 없이도 활성화된다. */
export const inject = []

/**
 * 데이터 루트 디렉터리 결정: 명시적 설정 > REDTEAM_HOME > $DSH_HOME/redteam.
 * 조합 계층은 보통 `!!js dshHomePath('redteam')` 로 절대 경로를 직접 준다.
 */
function resolveRoot(config) {
  if (config && typeof config.root === 'string' && config.root.length > 0) return config.root
  if (process.env.REDTEAM_HOME) return process.env.REDTEAM_HOME
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, 'redteam')
}

/**
 * 이 플러그인 자신의 패키지 이름과 버전(인터페이스의 "버전 + 자동 업데이트" 용).
 *
 * 두 곳을 모두 시도하는 이유: 마켓 패키지 `dsh-redteam-mode` 의 package.json 은 이 파일과 같은 위치
 * (생성물 lib/)에 있고, 이 패키지를 따로 마운트하면 한 단계 위에 있다. 읽지 못하면 null 을 반환하고,
 * 인터페이스는 "버전 미상"으로 표시하며 어떤 기능에도 영향을 주지 않는다.
 */
function readSelfPackage() {
  for (const rel of ['../package.json', '../../package.json']) {
    try {
      const pkg = JSON.parse(readFileSync(new URL(rel, import.meta.url), 'utf8'))
      if (pkg && typeof pkg.name === 'string' && typeof pkg.version === 'string') {
        return {
          name: pkg.name,
          version: pkg.version,
          description: typeof pkg.description === 'string' ? pkg.description : '',
          homepage: typeof pkg.homepage === 'string' ? pkg.homepage : null,
        }
      }
    } catch { /* 다음 후보로 넘어간다 */ }
  }
  return null
}

/**
 * @param ctx - 플러그인 컨텍스트.
 * @param config - `{ root?: string }`.
 */
export function apply(ctx, config = {}) {
  const root = resolveRoot(config)
  const store = new RedteamStore(root)
  /* 패키지 신원은 store 에 붙인다: 인터페이스 브리지 계층(redteam-ui)의 버전 표시와 업데이트 로직이 모두 여기서 읽으므로
      생성물에 버전 번호를 하드코딩하지 않는다. */
  const self = readSelfPackage()
  if (self !== null) {
    try { store.plugin = Object.freeze(self) } catch { /* 무시 */ }
  }

  // 서비스는 fiber 언로드와 함께 닫힌다: 모든 SQLite 핸들을 같은 곳에서 해제한다.
  ctx.effect(() => () => store.close())

  ctx.provide('redteam', store)
}

export { RedteamStore }
