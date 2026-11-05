> 아카이브 스냅샷: 원본 업스트림 저장소 `YuJunZhiXue/dsh-purge` 는 더 이상 접근할 수 없다. 이 문서의 업스트림 링크는 기록용이며 클릭하면 404 가 날 수 있다.

# 1.1.71

## 한국어

- 버전 **1.1.71**.
- 1.1.70 의 `??` 와 `||` 혼용을 수정했다: 플러그인을 켜면 `failed to import` 가 났다(데스크톱 / Web 동일 진입점).
- #86 은 UI 대기열만 steer → followup 으로 바꾼다. 공용 `steer()` 는 next-step 으로 되돌렸고, 에이전트 간 `send_message` 는 여전히 다음 단계에 삽입된다.
- `installed-rev` 는 버전이 바뀌어도 옛 `apply:x.y.z` 를 그대로 쓰지 않는다. #88 은 현재 `renderedPrompt` / 옛 `system` 앵커 중 실제로 적중한 쪽에 표식을 남긴다.
- 릴리스 전에 `node --check` 로 주 진입점을 검사해 문법 오류가 다시 Release 에 실리지 않게 한다.

## English

- **1.1.71**.
- Fix 1.1.70 `??` mixed with `||`: enable failed to import on desktop and web.
- #86 keeps UI queue steer → followup. Public `steer()` is next-step again so `send_message` inserts at the next step.
- Stale `apply:x.y.z` in `installed-rev` refreshes across versions. #88 marks the host anchor that actually exists (`renderedPrompt` or `system`).
- Release CI syntax-checks the plugin entry.

# 1.1.70

## 한국어

- 버전 **1.1.70**.
- Hub / 잔여 설치가 `dsh-purge` 에 `pluginPackages` 를 덧붙이면 Cordis 가 계속 pending 으로 남고 호스트가 종료 코드 1 로 죽는다. 이 버전은 의존성을 `systemPrompt` + `tools` 로 다시 고정한다.
- 정리 페이지는 업그레이드 체인(면책, 승인, 전체 부착, hooks 등)을 표시용으로만 합쳐 보여준다. Apply 는 여전히 모든 패치를 적용한다.
- 쓸모없어진 #81 / #89 목록 행을 제거했다. 전체 부착은 #87 로 합쳤고, 공식 phase-1 은 조용히 통과시킨다.
- 지휘 측은 '사용자가 준 목표대로 착수'로 바꿨다. #97 / #98 / #99 를 병합했다.

## English

- **1.1.70**.
- Hub / incomplete installs that inject `pluginPackages` leave dsh-purge pending and kill the host. Dependencies are pinned to `systemPrompt` + `tools`.
- Clean page groups upgrade-chain patches for display only; Apply still writes every patch.
- Dropped dead #81 / #89 rows. Hang lives in #87. Official phase-1 keep is silent.
- Commander bind: start from the user's target. Includes #97 / #98 / #99.

# 1.1.69

## 한국어

- 버전 **1.1.69**.
- 전송할 때 ChatML / `project_instructions` 를 벗겨낸다. 입력창과 디스크는 그대로 둔다.
- 적용 + 재시작이면 현재 기본값이 걸린다. 저장을 다시 누를 필요가 없다. 입력창이 아직 플러그인 옛 기본값이면 암호화 슬롯 값으로 갱신된다.
- 레드팀은 배치만 하고 접지 않는다: 주입 → cap → 레드팀 본문. 목표 카드/역할 섹션 이름을 `dshpg-*` 로 바꿨다.
- 격리 ctx 도 inject/cap 을 등록한다. #86 steer 는 next-turn 으로 바꿨고, #87 hang 은 LF 로 비교한다.
- 레드팀 운용 원고는 '위의 프롬프트를 기준으로 한다'로 고정했다. 지휘 측에서 '회사 이름을 줬으니 권한이 있다'는 문구를 뺐다.

## English

- **1.1.69**.
- Peel ChatML / `project_instructions` on the wire; box and disk stay intact.
- Apply + restart hangs the current default; no extra Save. Stale plugin defaults refresh from the sealed slot.
- Redteam: inject → cap → ops only (no fold). Card/role sections renamed `dshpg-*`.
- Isolated ctx also registers inject/cap. #86 steer → next-turn. #87 hang needle uses LF.
- Redteam ops note: inject wins. Commander no longer says a company name means authorized.

# 1.1.68

## 한국어

- 버전 **1.1.68**.
- **#92**: 스킬 패널이 YAML 블록 스칼라 `description`(`|` / `>`)을 인식해 더는 사용 불가로 잘못 보고하지 않는다.
- **#93**: 레드팀 '버전/업데이트': `file://` 를 로컬 경로로 바꾸고, Windows 는 `.cmd` + `shell` 로 npm/pnpm 을 띄우며, npm 404 면 GitHub tags 로 되돌린다.
- **#94**: 공식 데스크톱 CLI 진입점에 `app.asar.unpacked` 폴백을 보강했다. Hub 최초 설치에서는 여전히 공식 asar 경로와 부딪힐 수 있다.
- **#95**: `refusal-recover` 를 철거했다(잘못된 필드를 읽어 절대 발동하지 않았고, 고치면 무한 반복이 된다).
- **#96**: bash 포그라운드 대기를 플러그인이 표시했던 600초에서 60초로 되돌려, 이후 도구가 10분씩 막히지 않는다.
- 주입을 맨 앞에 둔다. capability 섹션 이름을 `dshpg-capabilities` 로 바꿨고, 사용자 prompt 는 일률적으로 followup 이며(#85), 자동 '계속'은 기본적으로 꺼져 있다.

## English

- **1.1.68**.
- **#92**: Skill panel parses YAML block-scalar `description`.
- **#93**: Redteam update: `file://` → fs path; Windows npm/pnpm via `.cmd`; GitHub tags if registry 404.
- **#94**: Desktop CLI falls back to `app.asar.unpacked`. Hub first-install may still hit stock asar.
- **#95**: Removed `refusal-recover` (dead reader / unbounded nudge loop).
- **#96**: Restore marked bash foreground wait 600s → 60s.
- Inject leads; capability section renamed; user prompt always followup; autoContinue default off.

# 1.1.67

## 한국어

- 버전 **1.1.67**.
- **#85**: continue 이어 달리기가 전송/429 연속 오류에서 더는 무한히 맴돌지 않는다. `takeContinue` 에 failStreak 임계값을 넣었고, `refundContinue` 는 `lastContinueSeq` 를 지우지 않으며, 연속 실패 3회면 바로 포기한다.
- **#84**: 영역 차단의 빈 Assistant 스트림을 한 번에 묶은 `text-chunks` 기록(`.length` 포함)으로 바꿔, 더는 호스트 UI 가 멈추지 않는다.
- 기동 시드: 프로세스 시작 시 `$DSH_HOME/prompt-inject.md` 가 비었거나 없으면 암호화 기본 원고를 한 번 써 둔다. 사용자가 고친 원고는 건드리지 않는다. 정리를 마치고 재시작을 누르면 재시작 성공 즉시 기본 프롬프트를 쓸 수 있다.
- Windows 공식 패키지 재시작: restart 스크립트 이름을 `pid+random` 으로 바꿔 첫 기동이 동시 실행 인스턴스와 부딪히지 않는다. 남는 `.cmd` 중개를 지우고 `wscript.exe //nologo //B` 로 스크립트를 직접 띄운다. 이 PC 의 옛 버전(pid 접미사 없음) 스크립트/로그가 24시간을 넘기면 기동 시 자동으로 정리한다.
- 프로세스 종료 범위 축소: `ASAR_SWAP_PS1` 이 더는 `/IM` 으로 같은 이름 프로세스를 전부 죽이지 않고, 설치 루트 아래 pid 만 중지해 동명의 서드파티를 잘못 건드리지 않는다.
- 공식 CLI shim 을 제자리에서 다시 쓰기 전에 `.dsh-purge.bak` 를 먼저 남기고 원자 쓰기로 처리해, 정전이나 디스크 가득 참에서도 되돌릴 수 있다.
- 최초 설치 시나리오가 막히지 않는다: WScript 가 clean 을 판정할 때 양쪽 모두 null(파일 없음 또는 읽기 실패)이면 기동을 허용하고, 어느 한쪽이 명확히 dirty 일 때만 막는다.
- 탐색 캐시: `runningExes` / `shortcutExes` 의 빈 결과는 더 캐시하지 않는다. '적용' 전에 `clearDesktopLocateCache()` 로 강제 갱신하는 것은 그대로다.
- `scheduleAsarRenameWhenIdle` 의 `.rename-pending` 잠금: 시계가 되돌아가거나 30분을 넘기면 무효로 보고 지운 뒤 다시 한다.
- `execFileSync` 의 PowerShell 호출 세 곳에 `maxBuffer: 8MB` 를 넣어, 큰 결과가 조용히 ENOBUFS 로 빠지지 않는다.
- 그 외: net-scope region gate 지수 백오프 + IPv6 정규식 강화; identity `injectMatchers` 가 4096자를 넘는 페이로드를 분할 매칭하고 `installAssembleGuard` 가 멱등; hooks-deny 는 R0 폴백 규칙을 지우고 원자 쓰기로 바꿨다; extract-asar 커밋은 `nextDir` 를 지우지 않고 `.dshpurge-recover.json` 을 써서 되돌릴 수 있게 했다; client.js redteam preset 다중 검출, `shell.submit` WeakMap 정리 보강.

## English

- **1.1.67**.
- **#85**: Continue loop no longer spins forever on TRANSPORT/429 streaks. `takeContinue` adds a failStreak gate; `refundContinue` leaves `lastContinueSeq` set; 3 consecutive failures abandon.
- **#84**: Region-gate empty-assistant stream becomes one batched `text-chunks` record (with `.length`), no longer hangs the host UI.
- Boot-time seeding: on startup, if `$DSH_HOME/prompt-inject.md` is empty or missing, the encrypted default is written once; a user-edited file is untouched. After the Apply → cleanup → restart cycle, the default prompt is active immediately.
- Windows official-build restart: restart script name now includes `pid+random`, so concurrent instances don't clobber each other; the `.cmd` intermediary is dropped — `wscript.exe //nologo //B` is spawned directly; legacy unsuffixed scripts/logs older than 24h are purged on each startup.
- Kill scope tightened: `ASAR_SWAP_PS1` no longer uses `/IM` to kill by full name — only pids under the install root are stopped, so same-named third-party processes aren't collateral.
- Official CLI shim repair now saves `.dsh-purge.bak` and uses atomic write before overwriting, so power loss / disk full is recoverable.
- First-install not blocked: when WScript checks for clean markers, two nulls (missing or unreadable) now pass through; only an explicit `false` blocks startup.
- Probe caches: `runningExes` / `shortcutExes` no longer cache empty results; `clearDesktopLocateCache()` on Apply still forces a refresh.
- `scheduleAsarRenameWhenIdle` `.rename-pending` lock: clock skew or ≥30-min-old lock is treated as stale and cleared.
- Three `execFileSync` PowerShell calls get `maxBuffer: 8MB` so large results no longer silent-fail with ENOBUFS.
- Also: net-scope region-gate exponential backoff + stricter IPv6 regex; identity `injectMatchers` segments >4096-char payloads, `installAssembleGuard` is idempotent; hooks-deny drops R0 fallback and uses atomic write for state; extract-asar commit no longer deletes `nextDir` and writes `.dshpurge-recover.json` for rollback; client.js redteam preset detection broadened; `shell.submit` WeakMap cleanup wired.

# 1.1.66

## 한국어

- 버전 **1.1.66**.
- **#80**: 정리 페이지에서 hooks deny / ask 우회를 끌 수 있다. 끄고 파일이 깨끗하면 건너뜀으로 표시하며 적용됨에 넣지 않는다. 껐다가 다시 켜면 64/65 를 공식 형태로 한 번 더 적용한다.
- **#81**: 계속 / 거부 재시도의 출처 kind 를 `dsh-purge` 로 바꿨다. 속도 제한과 전송 실패는 더 자동으로 한 라운드를 이어 가지 않는다.
- 재시작 후에는 저장을 누르지 않아도 기본 프롬프트가 걸린다. 매 라운드마다 전문을 다시 채운다. 빈 적용 요청은 디스크의 프롬프트를 더는 비우지 않는다.
- 선언된 overlay 가 `.dshpurge.bak` 로만 남아 있으면 적용 시 먼저 복사해 온 뒤 로드한다.
- 레드팀 보고서에 득점 항목 약칭을 보강했다. 중국어 README 는 배너 이미지와 미리보기 이미지를 복구했다.

## English

- **1.1.66**.
- **#80**: The clean page can turn off the hooks deny/ask bypass. Off + clean files show skipped and are not counted as applied. Turning it back on reapplies 64/65 from the official form.
- **#81**: Continue / refusal-recover use source kind `dsh-purge`. RATE_LIMIT and TRANSPORT no longer start another continue turn.
- Restart hangs the default prompt without a Save click; every step puts the full text back. An empty Apply body no longer wipes the disk prompt.
- A declared overlay that exists only as `.dshpurge.bak` is copied back before load.
- Red-team reports get short score-point names. Chinese README restores the banner and preview images.

# 1.1.65

## 한국어

- 버전 **1.1.65**.
- 기본 프롬프트를 `lib/default-prompt-inject.md` 기준으로 다시 암호화해 슬롯에 넣었다. 디스크에 아직 사용자가 고친 원고가 있으면 덮어쓰지 않는다.
- 레드팀에 스크린샷 등록, 득점 항목 이미지 보기, 보고서 6단 구성을 붙였다. 특정 드릴을 디렉터리로 내보낼 수 있다.
- 스킬 본문에 도구 경로, 키, VPS 가 아직 자리표시자로 빠져 있어도 스킬 전체를 사용 불가로 표시하지 않는다. 빈틈은 상세에 남긴다.
- 페이지를 열거나 프롬프트를 조립할 때 현재 기본 원고를 디스크로 동기화하므로 저장을 먼저 누를 필요가 없다.
- 호출되지 않는 데스크톱 기동 래퍼, 옛 마이그레이션 스크립트, 이미 주석 처리된 수동 계속 진입점을 삭제했다.

## English

- **1.1.65**.
- The default prompt is sealed again from `lib/default-prompt-inject.md`. A prompt the user already edited on disk is left as-is.
- Red team gains shot registration, score-point images, and the six-part report. An engagement can be exported to a folder.
- A skill stays usable when a documented tool path, key, or VPS placeholder is missing. The gap stays on the skill detail.
- Opening the page or assembling the prompt writes the current default to disk, without a Save click first.
- Unused desktop launch helpers, the old migration script, and the commented manual-continue entry are removed.

# 1.1.64

## 한국어

- 버전 **1.1.64**.
- 레드팀 흐름 여덟 가지. 역할 원고는 **새 표적을 만들 때만** 심는다. 이미 만들어 둔 표적은 드릴 콘솔에서 에이전트를 한 번 동기화해야 새 원고로 바뀐다.
- **내부망**을 리프 노드로 바꿔 스스로 수집, 정리, 발견, 이용을 하고 더는 아래로 작업을 나누지 않는다.
- 동시 실행 정원: key 없는 release 는 가장 이른 한 건만 비운다. 서브에이전트 종료는 서버가 자동으로 풀어 주고, 수동 해제는 acquire 가 돌려준 key 를 반드시 붙여야 한다.
- 사전 점검에 `include` 를 붙이면 지정한 스킬만 점검하고, 전역 키 누락 때문에 실패로 끌려가지 않는다. 빠진 항목에는 사용자가 실행할 수정 안내를 붙인다.
- IPv6 득점은 콜론이 최소 두 개 필요해 `dc01:389` 같은 호스트 이름이 더는 ×3 이 되지 않는다. 득점은 `score-rules.js` 에만 둔다.
- 공격 체인 득점은 비활성화된 득점 항목을 건너뛴다.
- `.env` 는 `export KEY=value` 를 인식한다. 따옴표 없는 인라인 주석은 떼고, 따옴표 안의 `#` 는 유지한다.
- 내부망 득점 code 를 `central-system`, `boundary-logical`, `boundary-strong` 등으로 바꾸며, `redteam_score_list` 의 실제 반환을 기준으로 한다.
- 취약점 발견과 이용은 `priority=high` 에서 시작한다. 우선순위가 비면 먼저 지휘 측에 회신해 평가 한 라운드를 보충한다.
- 호출되지 않는 코드를 삭제했다. 설정 페이지의 만료된 `legacyApplyPath(...)` 호출은 `applyPathOp` 로 바꿨다.

## English

- **1.1.64**.
- Eight red-team flow fixes. Role prompts seed **new** engagements only; sync agents on an existing engagement to pick them up.
- The internal role is a leaf and does collect, assess, scan, and exploit itself.
- A release without a key drops only the oldest reservation. Ending a subagent auto-releases; a manual release must carry the acquire key.
- Preflight `include` checks only the named skills. Broken items include fixes for the user to run.
- IPv6 scoring needs at least two colons, so `dc01:389` is no longer ×3. Scoring lives only in `score-rules.js`.
- Attack-chain scoring skips disabled score points.
- `.env` accepts `export KEY=value` and strips unquoted inline comments. A `#` inside quotes stays.
- Internal score codes match the live list (`central-system`, `boundary-logical`, `boundary-strong`, and the rest), taken from `redteam_score_list`.
- Vuln-scan and exploit start at `priority=high`. If priority is empty, report back and run another assess first.
- Unused code removed. Stale settings calls to `legacyApplyPath` now call `applyPathOp`.

# 1.1.63

## 한국어

- 버전 **1.1.63**.
- 공식 업데이트 스크립트에서 중국어 주석을 빼 `official update script is not ASCII` 를 피한다.

## English

- **1.1.63**.
- Official update script is ASCII only, so the handoff no longer fails the ASCII check.

# 1.1.62

## 한국어

- 버전 **1.1.62**.
- 계속/재시도를 다시 켰다.
- 앵커 게이트: 첫 라운드 출력 상한 1024→8192, 최대 2단계. 도구를 이미 호출했으면 풀리고, 영어로 사고해 we 앵커를 통과하지 못해도 더는 막히지 않는다.
- 이미 있는 프리셋의 앵커 설정이 패키지 내부와 다르면 동기화하고, 통째로 덮어쓰지 않는다.

## English

- **1.1.62**.
- Continue/retry is on again.
- Anchor gate: bootstrap cap 8192, max 2 steps; promote after the first tool call.
- Existing presets sync the anchor-gate block when it differs from the package.

# 1.1.61

## 한국어

- 버전 **1.1.61**.
- **다중 호스트 적용**: npm-global 과 데스크톱 `resources/app` 을 함께 패치한다(#72 계열 경로 문제).
- **#73**: 프록시 / IP / DNS 같은 무해한 주제가 더는 공격 게이트를 잘못 건드리지 않는다(`net-scope.js`).
- **#74**: 사용자 지정 프롬프트 영속화 — `resolveInjectText` 가 `prompt-inject.md` 를 읽고, UI 저장은 `saveOverrideContent` 를 거치며, 기동 시 `ensureOperatorBody` 를 호출한다.
- **미니멀**: #80 은 공식 persistent-shell 을 유지하고, UI 에서 minimal 을 고르면 `agent-preset/selected` 를 기준으로 하며(더는 세션 헤더의 `standard` 에 속지 않는다), `adaptInjectForMinimalPreset` 이 shell-only 도구 표에 맞춘다.
- **거부 재시도**: `refusal-recover` 가 '나는 하지 않는다 / 참여하지 않는다' 같은 문형을 인식한다.
- 주입 체인: `injectMatchers` 가 중복 섹션을 막고, 기본 프롬프트를 `asset-table.js` 에 다시 암호화해 넣는다.

## English

- **1.1.61**.
- **Multi-host Apply**: patch npm-global and desktop `resources/app` together.
- **#73**: Benign proxy/IP/DNS topics no longer trip the attack gate.
- **#74**: Custom prompt persists via `prompt-inject.md` + `saveOverrideContent`.
- **Minimal**: #80 official shell-only preset; preset from `agent-preset/selected`; runtime `adaptInjectForMinimalPreset`.
- **Refusal recover**: broader Chinese refusal phrasing.
- Inject assembly dedupe; default prompt re-sealed.

# 1.1.60

## 한국어

- 버전 **1.1.60**.
- **미니멀 / PTC**: 표준에서는 되는 같은 작업이 막히면 대개 preset 안의 `run_code`, 샌드박스, plan 문구가 정리되지 않았거나 내장 minimal 에 `agent-instructions` 가 빠진 탓이다. 이 버전은 #60/#61/#63 을 뒤집고 minimal 에 플러그인을 보강한다(#26). **완전 종료 → 적용 → 재시작 → 새 대화** 후 다시 테스트한다.
- **되돌리기 → 다시 보내기**: '되돌리기 한 번 / 이전 라운드로 되돌리기'는 현재 대화에 남는다. 보낸 문장은 입력창으로 돌아가고 이번 라운드의 어시스턴트 출력과 todo 는 철회된다. **1.1.60** 부터는 **현재 라운드** 기준으로 위치를 잡아 여러 라운드를 지나도 첫 사용자 메시지로 되돌아가지 않는다(#74/#75 + `lib/rewind.js`).
- **적용 / 재시작**: 사용자가 적용, 재시작을 누를 때 client 번들을 기록해 '정리가 끝나지 않아 재시작을 취소했다'는 잘못된 보고를 막는다.
- 기본 프롬프트를 `default-prompt-inject.md` 에서 `asset-table.js` 로 **다시 암호화**해 넣었다. 런타임은 암호화 슬롯만 읽는다.
- **#66** Windows `app.asar` 에 JScript 가 없을 때 PowerShell 패키지 교체; **#67** `dsh.cmd` 언팩 경로; **#69** 드릴 콘솔 `position:fixed`; **#71** assemble 가드 멱등; **#70** 스킬 경로를 이 PC 의 OS 로 판정; **#68** 문서를 `desktop` profile + `.tar.gz` 로 변경(Hub 원클릭은 여전히 git 을 쓴다, README 참고).

## English

- **1.1.60**.
- **Minimal / PTC**: Same task blocked while standard works → uncleared `run_code`, sandbox, or plan text, or minimal preset missing `agent-instructions`. This release flips #60/#61/#63 and adds the plugin on minimal (#26). **Quit fully → Apply → Restart → new chat** before retesting.
- **Rewind → resend**: Rewind buttons stay in the same chat; your last user line returns to the composer and this round’s assistant output/todos drop. From **1.1.60**, bounds follow the **current turn**, not the first user message (#74/#75 + `lib/rewind.js`).
- **Apply / restart**: User Apply/Restart writes client bundles so restart is not cancelled as “clean incomplete”.
- Default prompt **re-sealed** into `asset-table.js`; runtime reads the encrypted slot only.
- **#66** asar swap PS fallback; **#67** `dsh.cmd`; **#69** dock fixed; **#71** idempotent assemble guard; **#70** skill paths per host OS; **#68** docs: `desktop` + `.tar.gz` (Hub one-click still git — see README).

# 1.1.59

## 한국어

- 버전이 1.1.59 로 올라갔다.
- 적용 후 호스트 경로나 옛 표식이 맞지 않는다는 이유로 '정리가 현재 호스트에 기록되지 않았다'고 더는 보고하지 않는다(#65).
- `resources\app\node_modules` 와 `resources\app\dsh\node_modules` 를 모두 인정한다. 원문에 이미 공식 신원 문장이 없고 주입을 빠뜨린 작성도 없으면 그 두 표식을 요구하지 않는다.
- complete 섹션 패치는 tab 과 공백을 함께 인정한다.

## English

- Version 1.1.59.
- Apply no longer reports that the clean missed the current host just because the package path or the old markers do not match (#65).
- Both `resources/app/node_modules` and `resources/app/dsh/node_modules` count. If the official identity sentence and the inject-dropping return are already gone, those two markers are not required.
- The complete-prompt patch matches both tab and space indentation.

# 1.1.58

## 한국어

- 버전이 1.1.58 로 올라갔다.
- 열기, 적용, 재시작 모두 프롬프트를 건다. 디스크에 본문이 있으면 디스크를, 없으면 규칙 세트를, 그것도 없으면 내장 기본값을 쓰므로 저장을 다시 누를 필요가 없다.
- 기동 시 페이지가 나간 뒤에는 프런트엔드 client.js 를 더는 다시 쓰지 않아, 모듈 버전이 맞지 않아 입력창이 사라지지 않는다(#63).
- macOS / Linux 언팩 데스크톱에서는 적용 후 종료하고 다시 열린다. 정리 표식은 두 가지 표기를 모두 인정한다(#64).

## English

- Version 1.1.58.
- Open, Apply, and restart all hang the prompt. A saved file wins, then the active rule set, then the built-in default. Save is not required.
- Startup no longer rewrites frontend client.js after the page has taken a module revision, so the composer does not disappear (#63).
- Unpacked macOS and Linux desktop builds quit and relaunch after Apply. Both inject markers count as clean (#64).

# 1.1.57

## 한국어

- 버전이 1.1.57 로 올라갔다.
- 적용 후 재시작하면 설정 상자의 프롬프트가 시스템 섹션에 바로 걸린다. 상자가 비면 현재 규칙 세트를 쓴다. 둘 다 비면 멈추고 입력을 요구한다.
- cordis, PTC, 미니멀, unrestricted, liangshen 도 표준 모드와 같이 차단과 금지를 걷어내고 각자의 도구 흐름을 지킨다.
- 드릴 인증은 이 PC 디렉터리에 저장되어 업데이트 후 다시 인증하지 않아도 된다. 제거가 성공한 뒤에만 지운다. 빈 환경 초기화는 더는 설정 완료로 보지 않는다.
- 공식 Messages 요청의 system 필드는 첫 스냅샷에 고정하지 않고 현재 시스템 프롬프트를 쓴다.

## English

- Version 1.1.57.
- After Apply and restart, the settings-box prompt is hung on the system section. An empty box uses the active rule set. If both are empty, Apply stops and asks for a prompt.
- Cordis, PTC, minimal, unrestricted, and Liangshen clear intercepts and bans the same way standard does, and keep their own tools.
- Drill authorization is stored in this install and survives updates. It is cleared only after uninstall succeeds. An empty environment init is no longer treated as configured.
- The official Messages request system field uses the current system prompt instead of the first snapshot.

# 1.1.56

## 한국어

- 버전이 1.1.56 로 올라갔다.
- 적용은 설정 상자, 현재 규칙 세트, 공식 시스템 프롬프트 순서로 고른다. 상자가 비고 규칙도 없으면 멈추고 입력을 요구하며, 내장 기본값을 디스크에 더는 쓰지 않는다.
- 정리 페이지와 드릴 콘솔이 DSH 테마를 따르는 투명 유리로 바뀌고 수동 색상 전환이 사라졌다.
- 설명은 공식 Web 과 공식 데스크톱만 남긴다.

## English

- Version 1.1.56.
- Apply uses the settings box, then the active rule set, then the official system prompt. An empty box with no rules asks for a prompt and does not write the built-in default to disk.
- The clean page and the drill console use transparent glass that follows the DSH theme. The manual theme switch is gone.
- Docs keep official Web and the official desktop only.

# 1.1.55

## 한국어

- 버전이 1.1.55 로 올라갔다.
- '적용'을 누르고 재시작하면 매 라운드 assemble 이 프롬프트를 다시 맨 앞에 보충한다. 호스트가 새 assemble 로 바꿔도 한 번 더 감싸 두 번째 라운드에서 주입이 빠지지 않는다.
- 빈 상자가 프런트엔드에서 적용을 잘못 취소하지 않고, 재시작 전에 기본 프롬프트를 먼저 내려 둔다. 밀봉 asar 는 현재 프로세스가 아직 옛 패키지라는 이유로 재시작을 취소하지 않는다.
- 두 번째 적용은 쿨다운 때문에 재시작/주입을 취소로 취급하지 않는다. 밀봉 패키지는 교체되기 전까지 적용마다 한 번 재시작하고, 패치 기록이 끝나면 더는 공회전하지 않는다.

## English

- Version 1.1.55.
- After Apply + restart, every assemble turn puts the operator prompt back at the front. If the host replaces assemble, it is wrapped again so turn 2 does not drop the inject.
- An empty settings box no longer cancels Apply on the client; Restart seeds the default prompt first. A sealed asar no longer cancels restart just because the running process still has the old archive.
- A second Apply is not treated as a cancel because of settle cooldown. A sealed archive still restarts on each Apply until swapped; after patches are in, it does not loop.

# 1.1.54

## 한국어

- 버전이 1.1.54 로 올라갔다.
- 공식 데스크톱의 밀봉 asar 기동은 더는 중간에 언팩하거나 프로세스를 죽이지 않는다. Host Fiber._reload 의 INACTIVE_EFFECT / DesktopHostFatalError 를 피하고, 패치는 설정 페이지 '적용'으로 넘긴다.
- 데스크톱 settle 은 늦추고 context 가 비활성화되면 종료한다. 기동 자가 복구는 디스크에 쓰기만 하고 scheduleRestart 를 하지 않는다(#59 / #60 / #61).
- 마켓 tar 설치와 빈 sha / `installed-rev` 누락 시의 무한 재시작 수정은 그대로다(#58–#61, 1.1.53).

## English

- Version 1.1.54.
- Official desktop no longer unpacks or kills the host mid-boot on a sealed asar; that raced Fiber._reload and threw INACTIVE_EFFECT / DesktopHostFatalError. Patches wait for Settings Apply.
- Desktop settle is delayed and aborts on an inactive context; startup self-heal writes files only and does not scheduleRestart (#59 / #60 / #61).
- Marketplace tarball install and empty-sha / missing installed-rev restart loops remain fixed (#58–#61, 1.1.53).

# 1.1.53

## 한국어

- 버전이 1.1.53 로 올라갔다.
- '적용' 후 무한 재시작을 수정했다(#59 / #60 / #61). tarball 설치에 `installed-rev` 가 없거나 `applied.json` 의 sha 가 비면 기동 시 reapply+restart 를 반복하지 않고, 정렬된 뒤에는 공회전 재시작을 하지 않으며 쿨다운을 둔다.
- web 자가 복구 재시작이 더는 브라우저를 자동으로 띄우지 않아, 창을 닫은 뒤 새 창이 반복해서 올라오지 않는다(#59 / #61).
- 빈 sha 는 비밀봉 상태이고 정리 표식이 남아 있거나 플러그인 루트를 찾을 수 없을 때만 보충해, 밀봉 호스트의 자가 복구를 덮어쓰지 않는다(#56 / #57).
- 마켓 설치: `package.json` 이 tar.gz/zip 우선을 명시해 Hub 가 실패하는 `git ls-remote` 로 되돌아가지 않는다(#58).

## English

- Version 1.1.53.
- Stop Apply/startup infinite restart (#59 / #60 / #61): missing `installed-rev` after tarball install or empty `applied.json` sha no longer reapply+restart every boot; skip restart once aligned, with a cooldown.
- Web self-heal restart does not open a browser, so closing the window no longer respawns tabs (#59 / #61).
- Empty-sha heal only runs when the host is not sealed and markers are present (or the plugin root is missing), so sealed-host self-heal still works (#56 / #57).
- Marketplace install prefers tar.gz/zip in `package.json` so Hub does not fall back to a failing `git ls-remote` (#58).

# 1.1.52

## 한국어

- 버전이 1.1.52 로 올라갔다.
- 공식 데스크톱의 '적용/재시작'이 더는 공식 installer 를 자동 실행하지 않는다(#57). 호스트 버전은 사용자가 직접 올리고, 플러그인은 언팩과 패치만 한다. 기록 전에 실패로 잘못 판정해 `resources\\app` 를 지우는 일을 막는다.
- `applied.json` 은 있는데 호스트가 다시 sealed 이거나 플러그인 루트를 찾을 수 없으면 미정렬로 판정해 자가 복구로 다시 적용한다. 패널은 '패치가 사라졌다, 다시 적용한다'고 알린다.
- 플러그인 기동 경로는 절대 자동 업데이트하지 않고 패널에서만 수동 업데이트한다.
- 기본 프롬프트를 로컬 `default-prompt-inject.md` 기준으로 다시 암호화해 `asset-table.js` 에 쓴다.
- 사용자가 고친 프롬프트를 '적용'이 암호화 기본값으로 덮지 않는다. 디스크 본문이 내장과 다르면 일률적으로 보존하며, 런타임 내장 기본값은 암호화 슬롯에서만 읽는다.
- 되돌리기 절단점을 라운드 전체로 넓히고 교체 후 derive 캐시를 비워, 다음 전송에 철회된 내용이 실리지 않게 했다.

## English

- Version 1.1.52.
- Official desktop Apply/Restart no longer auto-runs the official installer (#57); users upgrade the host themselves; the plugin only unpacks and patches.
- If `applied.json` exists but the host is sealed again / plugin root is missing, treat as mismatched and reapply; UI shows patches-lost.
- Plugin startup never auto-updates; update only from the panel.
- Reseal the default prompt from local `default-prompt-inject.md` into `asset-table.js`.
- Keep user-replaced prompts: never overwrite disk text that differs from the bundled sealed default; runtime bundled default comes only from the sealed slot.
- Rewind cuts the whole last turn and invalidates derive cache so the next send does not keep undone content.

# 1.1.51

## 한국어

- 버전이 1.1.51 로 올라갔다.
- `/skills import` 가 `$DSH_HOME/skills` 자신을 가져올 때 먼저 지우고 복사해 스킬이 비는 문제를 수정했다(#54).
- `platformEnvAdaptStatus` / `platformEnvAdaptSkip` 를 채워 전송 게이트가 '환경이 아직 준비되지 않았다'고 더는 잘못 막지 않는다(#55).
- 공식 데스크톱 수정: 버전이 없거나 같은 버전인 `installer.exe` 를 대기 업데이트로 보고 재시작을 가로채지 않고, 업데이트 실패 시 `resources/app` 를 복원하며, 빈 sha 의 applied stamp 는 reapply 를 건너뛰지 않는다(#56, 0.1.7/0.2 동일 경로).
- 패치 #52 는 `.volatile()` 이 없는 표기도 호환하고, #57 은 `useDeveloperRole` 까지 따라가 responses 경로를 덮으며, #48 은 업스트림이 문장을 지운 경우 소프트 완료로 처리한다. 상태에 `patches_ready` 를 내보내고, 데스크톱 shim 은 '이 단말에서는 필요 없다'를 표시한다.

## English

- Version 1.1.51.
- Reject `/skills import` when source overlaps `$DSH_HOME/skills` so delete-then-copy cannot wipe skills (#54).
- Implement `platformEnvAdaptStatus` / `platformEnvAdaptSkip` so the send gate no longer false-blocks ready environments (#55).
- Official desktop: ignore unversioned/same-version `installer.exe` pending updates; restore `resources/app` if update handoff fails; empty applied stamp sha no longer skips reapply (#56, same path on 0.1.7 and 0.2).
- Patch #52 matches non-`.volatile()` defaults; #57 follows `useDeveloperRole` and covers responses; #48 soft-settles when upstream removed the caution text; export `patches_ready`; desktop shim shows not-needed-here.

# 1.1.50

## 한국어

- 버전 **1.1.50**.
- macOS 공식 데스크톱을 수정한다: '적용' 클릭 시 '실패: 재시작 중.'이라는 가짜 실패가 뜨던 문제, 언팩 후 `dsh` CLI가 동작하지 않던 문제, status가 잘못 ✗ 로 표시되던 문제(#53).
- '적용' 클릭 후 재시작하면 기본 프롬프트가 주입되지 않던 문제를 수정한다: 수정한 적이 없으면 내장 기본값을 자동으로 기록하므로 먼저 저장을 누를 필요가 없다.

## English

- Version 1.1.50.
- Fix macOS official desktop: Apply false "Failed: Restarting.", broken `dsh` CLI after asar unpack, and status ✗ false negatives (#53).
- Fix default prompt not injecting after Apply + restart; bundled default is written without requiring Save first.

# 1.1.49-beta.1

## 한국어

- 버전 **1.1.49-beta.1**(#53 테스트 버전).
- macOS 공식 데스크톱에서 '적용'을 누르면 '실패: 재시작 중.'이라는 가짜 실패가 뜨던 문제를 수정한다: `scheduleRestart` 의 helper/runtime 분기에 `restarting: true` 를 되살린다; Darwin 재시작은 osascript 정상 종료 + SIGTERM/SIGKILL 로 바꾸고, CLI 프로세스를 제외한 뒤 `open` 으로 다시 연다(ELECTRON_RUN_AS_NODE 제거).
- app.asar 언팩 후 공식 `dsh` CLI 진입점을 자동으로 보수하고(asar/`app/` 폴백) `app/runtime -> ../runtime` 를 추가해, `dsh web` 등을 포함한 전체가 MODULE_NOT_FOUND 로 죽지 않게 한다.
- `/purge status` 는 다중 경로 파일 목록을 배열로 항목별 판정하며, 이미 패치된 파일을 ✗ 로 표시하지 않는다.
- 프런트엔드 재시작 실패 문구가 성공 분기의 note 를 error 로 쓰지 않는다.

## English

- Version 1.1.49-beta.1 (prerelease for #53).
- Fix macOS official desktop Apply false failure "Failed: Restarting.": helper/runtime branches of scheduleRestart return restarting:true; Darwin restart uses osascript quit then SIGTERM/SIGKILL, skips CLI processes, relaunches via open without ELECTRON_RUN_AS_NODE.
- After unpacking app.asar, auto-patch the official dsh CLI entry (asar/app fallback) and add app/runtime -> ../runtime so dsh web and other subcommands keep working.
- /purge status treats multi-path file lists correctly instead of marking patched files as missing.
- Restart failure UI no longer uses the success note as the error detail.

# 1.1.48

## 한국어

- 버전 **1.1.48**.
- 레드팀 지휘의 '작업만 배분한다' 제약이 조립 과정에서 잘못 삭제되어 subagent 를 배분하지 않던 문제를 수정한다; 프리셋이 Agent Teams 아래에서 classic subagent 를 강제로 다시 켠다.
- 작업에 맞춰 skill/MCP 를 고르는 프로토콜을 추가한다(먼저 목차를 읽고, 그다음 작업에 맞춰 호출한다; 서브에이전트와 레드팀도 동일); 공식 등록과 도구 표면은 바꾸지 않는다.
- 서브에이전트 maxDepth 가 default 가 없는 0.2 스키마에 맞춰지고, 기본값 10 을 되살린다.

## English

- Version 1.1.48.
- Fix redteam lead dispatch-only SOP being stripped during assemble; re-enable classic subagent under Agent Teams in the redteam preset.
- Add task-matched skill/MCP selection protocol (read catalog, then call what the task needs; same for subagents and redteam). Does not change official registration.
- Raise subagent maxDepth default to 10 on 0.2 schemas that dropped .default().

# 1.1.47

## 한국어

- 버전 **1.1.47**.
- 드릴 콘솔의 '환경 적응'을 `platformConfigGet` / `Save` / `AssignToolkit` 에 연결해 `unknown op: platformConfigGet` 를 수정하고, 도구 경로와 FOFA/VPS 설정을 정상적으로 읽고 쓸 수 있게 한다.
- 스킬 라이브러리 디렉터리 탐색에 `$DSH_HOME/redteam/skills` 를 추가하고, Windows 에서는 `homedir()` 로 폴백해 빈 `HOME` 만 믿지 않는다.
- 지식 베이스는 환경 적응의 nuclei 템플릿 경로를 우선 사용한다; 라이브러리가 비어 있으면 로컬 `knowledge.db` 경로를 표시해 인터페이스가 죽었다고 잘못 판정하지 않는다.
- 최초 설치 시 사용자 안내를 띄운다: 용도, 무료 오픈 소스, GitHub 저장소 주소를 설명한다; 저자를 등에 업고 영리 행위를 하면 법적 책임을 묻는다는 점과 불법 용도 금지를 함께 고지한다. 확인하면 그 기기에서는 다시 띄우지 않는다.
- 데스크톱 위치 탐지와 표면 감지를 완화해, 설치 디렉터리 이름에 `DeepseekHarnessDesktop` 등이 들어 있어도 로컬 Harness 를 찾는다; 실패한 위치 캐시가 '아직 탐지되지 않음'에 계속 걸리지 않는다.
- 되돌리기와 요청 경로를 소폭 수정해 뒷 라운드가 멈추거나 진행률이 가짜로 보이는 상황을 줄인다.

## English

- Version 1.1.47.
- Wire drill Env adapt ops `platformConfigGet` / `Save` / `AssignToolkit`, fixing `unknown op: platformConfigGet` so tool paths and FOFA/VPS config work again.
- Skill catalog also probes `$DSH_HOME/redteam/skills` and falls back with `homedir()` on Windows when `HOME` is empty.
- Knowledge prefers nuclei templates from Env adapt; empty libraries show the local `knowledge.db` path so a missing API is not assumed.
- First install shows a user notice: what the plugin does, that it is free/open source, the GitHub repo URL, legal warning against profit behind the author, and illegal-use prohibitions. After confirm it does not show again on that machine.
- Broader desktop locate/surface detection (including `DeepseekHarnessDesktop` installs); failed locate caches no longer stick on "host not located".
- Small rewind/request-path fixes to reduce later-turn hangs and misleading progress.

# 1.1.46

## 한국어

- 버전 **1.1.46**. 1.1.45 는 버그가 있으니 건너뛰고 설치하지 않는다.
- `default-prompt-inject.md` 로 기본 프롬프트를 다시 봉인한다.
- 주입 불안정 수정: 두 번째 턴이나 작업 도중 페르소나가 사라지던 문제, 모델이 시스템 주입을 `project_instructions` 로 오해해 거부한 경우를 포함한다.
- 교체/스코프 워크스페이스 intro 가 다시 0.1.7 과 일치한다: system, developer, 사용자 직접 지시를 덮지 않는다. main intro 의 소프트 거부 방지 문구는 유지한다. 중첩된 스코프 문단은 그 한 문장으로 다시 접는다.
- 텍스트가 모델에 도달하기 전에 바깥 ChatML / `<project_instructions>` 래퍼를 벗겨, 실제 시스템 주입이 프로젝트 지시로 읽히지 않게 한다.
- 조립된 시스템 프롬프트 섹션을 정리해 `text` 가 항상 문자열이 되게 한다; 세션에 전체 섹션을 고정하지 않아, 두 번째 턴에서 `renderPrompt` 가 `undefined.length` 로 죽고 `(gateway/internal)` 를 내던 문제를 막는다.
- `agent/pre-step` 에서 `decision.messages` 를 항상 배열로 정규화해, 두 번째 전송이 messages 목록 누락으로 죽지 않게 한다.
- 지역 게이트: 해석된 IP 하나가 통제 지역에 있다는 이유만으로 다중 주소 호스트를 막지 않는다(CDN/노이즈).
- 되돌리기 후 `deriveMessages` / `systemNodes` 가 누락된 `content` 를 허용해, 재전송이 `(gateway/internal)` 로 실패하지 않는다.
- 정리 진행률: 호스트를 찾기 전에 겁주는 `0/63` 을 표시하지 않는다; 이 설치에 필요 없는 항목은 준비됨으로 계산해 가짜 `48/63` 이 나타나지 않는다.
- 적용이 기본 프롬프트를 기록하고 주입한다; 입력 상자가 비어 있으면 내장 기본값을 쓰므로 따로 저장할 필요가 없다.
- 되돌리기 수정: 빈 `snapshotEvents()` 가 더 이상 `undefined.length` 를 읽지 않아, 실행 취소가 `(gateway/internal)` 로 실패하지 않는다.

## English

- Version 1.1.46. Skip 1.1.45; that version has bugs. Do not install it.
- Reseal the default prompt from `default-prompt-inject.md`.
- Fix unstable inject: persona dropping on the second turn or mid-task, including cases where the model treated the system inject as `project_instructions` and rejected it.
- Replacement and scope workspace intros match 0.1.7 again: they do not override system, developer, or direct user instructions. The main intro anti-soft-refuse text stays. A stacked scope paragraph is collapsed back to that one sentence.
- Strip outer ChatML / `<project_instructions>` wrappers before the text reaches the model, so a real system inject is not read as project instructions.
- Sanitize assembled system-prompt sections so `text` is always a string; stop pinning full sections for a session, which could make the second turn crash in `renderPrompt` on `undefined.length` with `(gateway/internal)`.
- Always normalize `decision.messages` to an array in `agent/pre-step`, so a second send does not die on a missing messages list.
- Region gate: multi-address hosts are no longer blocked just because one resolved IP is in a controlled region (CDN/noise).
- After rewind, `deriveMessages` / `systemNodes` tolerate missing `content`, so resend no longer fails with `(gateway/internal)`.
- Clean progress: do not show a scary `0/63` before the host is located; items not needed on this install count as ready, so a fake `48/63` no longer appears.
- Apply writes and injects the default prompt; an empty box uses the bundled default, so a separate Save is not required.
- Fix rewind: empty `snapshotEvents()` no longer reads `undefined.length`, so undo no longer fails with `(gateway/internal)`.

# 1.1.44

## 한국어

- 버전 **1.1.44**.
- `app.asar` 언팩은 `resources/app` 옆에 쓰고, 언팩이 끝난 뒤에만 교체한다. 그 디렉터리를 쓸 수 있게 되면 이후 기동은 그 파일들만 수정한다. 같은 아카이브가 다시 나타나면 옆으로 치운다. 크기나 mtime 이 새 값이거나 디렉터리가 없으면 한 번 언팩한다. 언팩이 멈추거나 그 패치 라운드가 끝나지 않으면 이전 디렉터리를 되돌리고 업그레이드 표식을 다음 기동까지 남긴다.
- 이전 라운드를 되돌리면 그 전송 메시지와 그 응답만 제거한다. 이전 라운드는 화면에 남고 다음 모델 요청에서 빠진다. 남은 되돌리기 표식은 다음 모델 요청에 실리지 않으므로, 다음 전송은 새 메시지가 된다.
- 편집 가능한 프롬프트는 시스템 프롬프트 맨 앞에 한 번만 놓인다. 매 단계에서 첫 시스템 프롬프트를 그 현재 텍스트로 교체한다.
- deepseek.com 용 지시는 system 역할에 남는다. 사고 과정은 계속 전송한다.
- 지역 검사는 이 작업의 대상만 본다. 내 서버는 그 정확한 주소나 호스트 이름이 목록에 있을 때만 허용한다. 거부 문장을 쓴 뒤 턴이 끝난다.
- 공식 모드는 CTF 를 포함해 항상 기본 프롬프트를 쓴다. 레드팀은 활성 규칙 세트만 쓰거나, CTF 를 뺀 기본 프롬프트 뒤에 레드팀 단계를 붙인다. 서브에이전트는 메인 세션과 같은 주입을 받는다. 프롬프트 파일이 비어 있으면 기동 시 저장을 요구하지 않고 내장 기본값을 쓴다.

## English

- Version 1.1.44.
- Unpacking `app.asar` writes beside `resources/app` and swaps in only after the unpack finishes. Once that directory is usable, later starts only edit those files. The same archive showing up again is moved aside. A new size or mtime, or a missing directory, is unpacked once. If unpacking sticks or that patch round does not finish, the previous directory is put back and the upgrade marker stays for the next start.
- Rewinding the previous round removes only that sent message and its reply. Earlier rounds stay on screen and leave the next model request. Leftover rewind markers stay off the next model request, so the next send is a new message.
- The editable prompt is placed once at the front of the system prompt. Each step replaces the first system prompt with that current text.
- Instructions for deepseek.com stay on the system role. Thinking is still sent.
- The region check looks only at this task's target. An own server is allowed only when that exact address or hostname is on the list. The turn ends after the denial sentence is written.
- Official mode always uses the default prompt, including CTF. Red team uses only the active rule set, or the default prompt without CTF followed by the red team steps. Subagents receive the same inject as the main session. If the prompt file is empty, startup uses the bundled default without requiring Save.

# 1.1.43

## 한국어

- 버전 **1.1.43**.
- 이 설치의 위치를 찾기 전에는 행을 건너뜀으로 표시하지 않고, 건너뜀은 그룹 합계에서 완료로 세지 않는다.
- 패치 목록이 52개 항목을 모두 포함해 총계가 그룹과 일치한다.
- 호스트 디렉터리를 찾는 중의 미적중을 프로세스가 끝날 때까지 캐시하지 않는다.

## English

- Version 1.1.43.
- Before this install is located, rows are no longer shown as skipped, and a skip no longer counts as done in the group total.
- The patch list now includes all 52 items, so the total matches the groups.
- A miss while looking up the host directory is not cached for the rest of the process.

# 1.1.42

## 한국어

- 버전 **1.1.42**.
- 정리 페이지의 프롬프트 아래에서 내 서버를 등록한다: 한 줄에 IP 하나 또는 정확한 호스트 이름, 그다음 목록을 저장한다. 문서에 절차와 스크린숏이 있다.
- 새 대화는 프롬프트를 시스템 프롬프트 맨 앞에 놓는다. 도크는 프로스트 유리이고, 라이트·잉크 두 테마 모두 읽을 수 있다.
- 패치 수는 적용된 항목만 센다. 이후 문장 재작성 후에도 web-surface identity 행은 적용 상태로 남는다.
- 0.1.x 진입점용 needle 을 추가했다. 이미 패치된 0.2.0 호스트는 다시 쓰지 않는다.

## English

- Version 1.1.42.
- Under Prompt on the Clean page, register your own server: one IP or exact hostname per line, then Save list. The docs include the steps and a screenshot.
- New chats place the prompt at the front of the system prompt. The dock is frosted glass, and both the light and ink themes stay readable.
- The patch count includes only applied items. The web-surface identity row stays applied after the later sentence rewrite.
- Needles for 0.1.x entry points were added. An already patched 0.2.0 host is not rewritten.

# 1.1.41

## 한국어

- 버전 **1.1.41**.
- 공식 모드는 편집 가능한 프롬프트를 주입하고, 규칙 세트가 켜져 있으면 활성 규칙 세트를 주입한다. 레드팀은 운영 섹션도 유지한다.
- 되돌리기는 현재 세션에 머문다: 한 단계 또는 마지막 라운드를 고르고, 마지막 줄을 입력창으로 되돌리고, 이미 전송된 내용을 지운다.
- 호스트가 정리되지 않았거나 주입 텍스트가 없으면 재시작을 취소한다.
- 전체 접근 기본값이 다시 제한 프리셋으로 고정되지 않는다. 공식 모델 Session Log 업로드는 기본으로 꺼져 있다.
- 주소가 중국 본토, 홍콩, 마카오에 속하는 대상은 중단한다.

## English

- Version 1.1.41.
- Official modes inject the editable prompt, or the active rule set when one is enabled. Red team also keeps its operating section.
- Rewind stays on the current session: choose one step or the last round, return the last line to the composer, and clear what was already sent.
- Restart is cancelled unless the host is cleaned and inject text is present.
- A full-access default is no longer pinned back to a restricted preset. Official model Session Log upload is off by default.
- Targets whose addresses fall in mainland China, Hong Kong, or Macau are stopped.

# 1.1.40

## 한국어

- 버전 **1.1.40**.
- **DSH 0.2.0-rc.2** 에서 Anthropic OAuth 가 더 이상 시스템 프롬프트 앞에 "You are Claude Code" 를 붙이지 않아, 사용자 `prompt-inject` 가 Claude 정체성 블록 뒤로 밀리지 않는다.
- 0.2 에서 해당 needle 이 사라졌으므로 **패치 41**(developer-role 재매핑)을 제거했다.
- 설정에서 **적용** 후 호스트가 **자동으로 재시작**된다; 재시작 확인을 위해 플러그인을 다시 열 필요가 없다.

## English

- Version 1.1.40.
- For **DSH 0.2.0-rc.2**, Anthropic OAuth no longer prepends "You are Claude Code" ahead of your system prompt, so custom `prompt-inject` is not pushed behind a Claude identity block.
- Removed **patch 41** (developer-role remap) because those needles are gone in 0.2.
- After **Apply** in settings, the host **restarts automatically**; you no longer need to open the plugin again to confirm restart.

# 1.1.39

## 한국어

- 버전 **1.1.39**.
- 중국어 Windows 에서 공식 데스크톱의 설치 후 재시작이 '재시작 준비 중'에 계속 머물지 않는다. 업데이트 스크립트가 ASCII 주석으로 시작하고, 비ASCII 경로를 `\u` 이스케이프로 써서 Windows Script Host 가 파일을 GBK 로 읽을 때 개행을 삼키지 않는다.
- macOS 와 Linux 는 이 스크립트를 쓰지 않는다. 두 플랫폼의 재시작 경로는 변하지 않는다.

## English

- Version 1.1.39.
- On Chinese Windows, the official desktop install-and-restart no longer stays on preparing to restart. The update script starts with an ASCII comment, and non-ASCII paths are written as `\u` escapes, so Windows Script Host does not swallow the newline when it reads the file as GBK.
- macOS and Linux do not use this script. Their restart path is unchanged.

# 1.1.38

## 한국어

- 버전 **1.1.38**.
- 레드팀이 더 이상 도구를 대신 내려받지 않는다. 설치 스크립트가 없으면 안내가 드릴 콘솔 환경 페이지를 가리켜, 사용자가 경로를 채우게 한다.
- 장기 작업은 시스템 프롬프트에 대상 카드를 유지한다. 지휘자와 서브에이전트가 같은 카드를 본다: 그 조직에 머물고, 결과에 나타난 다른 이름으로 바꾸지 않는다. 각 서브에이전트는 자기 역할 텍스트를 로드하고, 배분된 작업은 카드의 이름을 써야 한다.
- 도구 조회가 Kali 의 `httpx-toolkit`, `impacket-secretsdump` 같은 배포판 파일 이름을 받아들이고, Python 의 `httpx` 를 스캐너로 취급하지 않는다.
- 공식 데스크톱 앱이 macOS 와 Linux 에서 `app.asar` 를 찾는다(Mac 은 `Contents/Resources`). Windows 밖에서는 `require` 를 깨뜨리던 콘솔 숨김 래퍼를 설치하지 않는다.
- 레드팀은 앵커 게이트를 쓴다: 첫 단계의 출력을 1024 토큰으로 제한하고, 첫 사고 블록에 `we` 가 있고 `let me` 가 없으면 제한이 풀리며, 그렇지 않으면 그 턴에서 최대 4단계까지 유지되고, 컨텍스트 압축이 게이트를 다시 닫는다. 레드팀 도구와 페르소나는 그대로다.
- 번들 스킬은 `$DSH_HOME/redteam/skills` 로 복사되고 프리셋은 기기별 `node_modules` 경로 대신 `dshHomePath` 로 그곳을 가리킨다. 사용자 스킬은 `$DSH_HOME/skills` 에 남고 같은 이름에서 우선한다.
- 레드팀 모드가 다시 모드 목록에 보인다. 경로 변수가 빠졌다는 이유로 프리셋 선언이 조기 종료되지 않는다.
- 후원 주소가 README 에 다시 들어갔다.

## English

- Version 1.1.38.
- Red team no longer downloads tools for you. When the setup script is missing, the guide points at the drill console environment page so you fill in the paths.
- Long jobs keep a target card in the system prompt. The commander and subagents see the same card: stay on that organization, and do not switch to other names that show up in results. Each subagent loads its own role text, and dispatched work must use the name on the card.
- Tool lookup accepts distro filenames such as Kali's `httpx-toolkit` and `impacket-secretsdump`, and does not treat Python's `httpx` as the scanner.
- The official desktop app can find `app.asar` on macOS and Linux (`Contents/Resources` on Mac). Outside Windows, the console-hide wrapper that broke `require` is not installed.
- Red team uses an anchor gate: the first steps are capped at 1024 output tokens, the cap lifts when the first reasoning block contains `we` and not `let me`, otherwise it lasts at most 4 steps in that turn, and a context compaction closes the gate again. Red team tools and the persona stay as they are.
- Bundled skills are copied to `$DSH_HOME/redteam/skills` and the preset points there with `dshHomePath`, instead of a machine-specific `node_modules` path. Your own skills stay in `$DSH_HOME/skills` and win on the same name.
- Red team mode shows in the mode list again. Declaring the preset no longer exits early because a path variable was missing.
- The sponsor addresses are back in the readme.

# 1.1.37

## 한국어

- 버전 **1.1.37**.
- 드릴 콘솔 환경 페이지가 스크롤되어 나머지 설정도 채울 수 있다.

## English

- Version 1.1.37.
- The drill console environment page scrolls, so the rest of the settings can be filled in.

# 1.1.36

## 한국어

- 버전 **1.1.36**.
- 레드팀 모드가 정리된 프롬프트를 거부하던 문제를 수정한다.

## English

- Version 1.1.36.
- Fix red team mode refusing the cleaned prompt.

# 1.1.35

## 한국어

- 버전 **1.1.35**.
- 기동 시 자동 업데이트를 하지 않는다; 패널에서 업데이트를 고른다.
- dsh-purge 항목이 Context 옆에 있어 다른 플러그인 버튼을 가리지 않는다.
- 채점이 업스트림과 일치한다: 25개 항목, 다른 웹 앱을 위한 폴백 버킷 포함.
- 14개 지식 범주가 로컬 nuclei 템플릿을 세고, 범주가 목록을 필터링한다.
- 스킬 경로가 `$DSH_HOME` 을 따른다. 이 기기에 예시 경로가 없다는 이유만으로 스킬을 사용 불가로 표시하지 않는다.

## English

- Version 1.1.35.
- Startup no longer auto-updates; choose the update in the panel.
- The dsh-purge entry sits beside Context, so it no longer covers other plugin buttons.
- Scoring matches upstream: 25 items, with a fallback bucket for other web apps.
- The 14 knowledge categories count local nuclei templates, and a category filters the list.
- Skill paths follow `$DSH_HOME`. A skill is no longer marked unavailable just because an example path is missing on this machine.

# 1.1.34

## 한국어

- 버전 **1.1.34**.
- **드릴 지식 페이지가 로컬 템플릿을 나열한다.** 지식을 열면 nuclei 템플릿 페이지가 나오고, CVE 또는 컴포넌트로 페이징과 검색을 한다. 더 이상 템플릿 개수만 보여주지 않는다.
- **업데이트 아카이브가 Windows, macOS, Linux 에서 압축을 푼다.** Linux 는 PowerShell 을 호출하지 않는다. Windows 는 tar, 그다음 PowerShell 을 시도한다. macOS 와 Linux 는 tar, unzip, python3, bsdtar 순으로 시도한다. 모두 없으면 Node 가 zip 을 직접 푼다. Kali 에서 `spawnSync powershell ENOENT` 를 보고한 #44 의 @cracer4869 에 감사한다.

## English

- Version 1.1.34.
- **The drill knowledge page lists local templates.** Opening Knowledge shows a page of nuclei templates, with paging and search by CVE or component. It no longer shows only the template count.
- **Update archives extract on Windows, macOS, and Linux.** Linux does not call PowerShell. Windows tries tar, then PowerShell. macOS and Linux try tar, unzip, python3, then bsdtar. If none of those exist, Node extracts the zip itself. Thanks to @cracer4869 for reporting `spawnSync powershell ENOENT` on Kali in #44.

# 1.1.33

## 한국어

- 버전 **1.1.33**.
- **이미 재시작한 뒤 재시작 대화상자가 다시 뜨는 문제를 수정한다.** 공식 앱이 이미 언팩된 `resources/app` 에서 실행 중이면, 이 프로세스가 공식 프로세스라는 이유로 패널을 열 때 다시 종료를 요구하지 않는다. 재시작 안내는 이번 실행에서 `app.asar` 가 실제로 옮겨졌을 때만 나타난다.

## English

- Version 1.1.33.
- **Fix the restart dialog coming back after you already restarted.** When the official app is already running from the unpacked `resources/app`, opening the panel no longer asks you to quit again just because this is the official process. The restart prompt appears only when `app.asar` was actually moved aside in this run.

# 1.1.32

## 한국어

- 버전 **1.1.32**.
- **beta 의 도크 레이아웃을 stable 로 가져온다**: 패널을 드래그하고 크기를 조절할 수 있으며, 라이트와 다크가 호스트 테마를 따른다.
- **플러그인이 더 이상 설정 페이지에 나타나지 않는다.** 세션 제목 옆 dsh-purge 에서 오른쪽 도크를 연다. 정리와 드릴이 모두 그 도크에 있다.

## English

- Version 1.1.32.
- **Bring the beta dock layout onto stable**: the panel can be dragged and resized, and light and dark follow the host theme.
- **The plugin no longer appears on the Settings page.** Open the right dock from dsh-purge beside the session title. Clean and Drill are both in that dock.

# 1.1.31

## 한국어

- 버전 **1.1.31**.
- **드릴 콘솔이 stable 릴리스에 들어왔다.** 오른쪽 도크에 정리와 드릴 두 페이지가 있다. 드릴을 처음 열면 고지를 읽고 권한을 확인한다. 자산, 스킬, 로컬 환경은 이 플러그인 안에 포함된다.
- **되돌리기가 매번 브랜치를 남기던 문제를 수정한다.** 호스트는 세션을 제자리에서 자를 수 없다. 되돌리기 후 옛 세션이 사이드바에서 빠지므로 반복 실행 취소가 브랜치를 쌓지 않는다.

## English

- Version 1.1.31.
- **Drill console is on the stable release.** The right dock has two pages: Clean and Drill. The first time you open Drill you read the notice and confirm authorization. Assets, skills, and the local environment ship inside this plugin.
- **Fix rewind leaving a branch every time.** The host cannot truncate a session in place. After rewind the old session leaves the sidebar, so repeated undo does not pile up branches.

# 1.1.30

## 한국어

- 버전 **1.1.30**.
- **데스크톱 앱과 web 의 버전 전환을 수정한다**: `dsh plugin add` 로 설치하는 방식을 중단한다. pnpm 의 GitHub 아카이브 fetch 가 `http 302` 또는 `fetch failed` 를 낸다. 플러그인이 패키지를 직접 내려받는다.
- **사고·출력 루프를 수정한다**: 정지 조건이 없던 기본 프롬프트 리셋을 제거한다.

## English

- Version 1.1.30.
- **Fix version switching on the desktop app and web**: stop installing through `dsh plugin add`. pnpm's fetch of the GitHub archive returns `http 302` or `fetch failed`. The plugin downloads the package itself.
- **Fix the thinking and output loop**: remove the default-prompt reset that had no stop condition.

# 1.1.28

## 한국어

- **업데이트 실패 `http 302` 수정**: `codeload.github.com` 으로 내려받고 리다이렉트를 직접 따라가, Electron/일부 Node 빌드가 github.com → codeload 302 에서 멈추지 않게 한다.
- **빈 beta 목록 수정**: 클라이언트의 `keepListedVersion` 이 서버와 일치해, stable 이 나온 뒤에도 beta tip / `beta` 브랜치를 목록에 유지한다; tip SHA 를 가져올 수 없으면 raw/jsDelivr 로 폴백한다.

## English

- **Fix update failure `http 302`**: download via `codeload.github.com` and follow redirects manually so Electron/some Node builds no longer stall on github.com → codeload 302.
- **Fix empty beta list**: client `keepListedVersion` matches the server — keep the beta tip / `beta` branch after stable ships; fall back to raw/jsDelivr when tip SHA cannot be fetched.

# 1.1.27

## 한국어

- **적용 + 재시작 성공 후에도 재시작 안내가 남는 문제 수정**: 수동 적용이 성공하면 `applied` 스탬프를 기록해, settle 이 패치를 구버전으로 판단하지 않게 한다.
- 재시작을 클릭하면 고착된 `boot_full_quit` 를 지운다; status 가 그 boolean 으로 모달을 동기화한다.
- Web 의 `waitForRestart` 는 옛 프로세스가 내려간 뒤에만 재시작을 성공으로 보아, 같은 프로세스에서의 가짜 새로고침을 피한다.

## English

- **Fix restart prompt still showing after Apply + successful restart**: write the `applied` stamp on successful manual Apply so settle does not think patches are out of date.
- Clear sticky `boot_full_quit` when Restart is clicked; status syncs the modal from the boolean.
- Web `waitForRestart` requires the old process to go down before treating restart as success, avoiding same-process false refresh.

# 1.1.26

## 한국어

- **같은 번호 stable 에 가려진 beta 레인 수정**: `1.1.25` stable 이후 `1.1.25-beta.*` 가 'stable caught up' 필터로 사라졌다; **beta 브랜치 tip 은 항상 목록에 남는다**(병렬 채널; beta 가 레드팀을 담는다).
- 이미 따라잡힌 옛 beta **태그**는 계속 숨는다; `1.1.11-beta` 는 철회 상태로 남는다.

## English

- **Fix beta lane hidden by same-number stable**: after `1.1.25` stable, `1.1.25-beta.*` vanished via the "stable caught up" filter; the **beta branch tip always stays listed** (parallel channels; beta carries red-team).
- Older caught-up beta **tags** still hide; `1.1.11-beta` stays withdrawn.
# 1.1.25

## 한국어

- **수정 [#43](https://github.com/YuJunZhiXue/dsh-purge/issues/43)**: `backupAll`/`revertAll` 에 `profiles/*/cordis.patch.yml`(사용자 패치 계층)을 더 이상 포함하지 않아, 업그레이드 재적용이 이후 사용자 `insert` 위에 옛 bak 을 복원하지 않는다.
- 낡은 `cordis.patch.yml.dshpurge.bak` 는 복원하지 않고 버린다; 실제 사용자 파일은 유지한다.
- `npm run test:profile-patch` 를 추가한다.

## English

- **Fix [#43](https://github.com/YuJunZhiXue/dsh-purge/issues/43)**: stop including `profiles/*/cordis.patch.yml` (user patch layer) in `backupAll`/`revertAll`, so upgrade reapply no longer restores an old bak over later user `insert`s.
- Drop stale `cordis.patch.yml.dshpurge.bak` without restoring; keep the live user file.
- Add `npm run test:profile-patch`.
# 1.1.24

## 한국어

- **수정 [#40](https://github.com/YuJunZhiXue/dsh-purge/issues/40)**: `pathLooksDesktop` 이 경로에 `deepseek-harness` 가 들어 있다는 이유만으로 소스 트리를 데스크톱으로 보지 않는다; 설치 형태(`resources/`, `.exe`, `.app`)를 요구한다.
- **수정 [#41](https://github.com/YuJunZhiXue/dsh-purge/issues/41)**: 소스 `apps/cli` 빌드 산출물에 콘솔 숨김 주입을 건너뛴다; `.dshpurge.bak` 이 없으면 `revertAll` 이 대상을 삭제하지 않는다.
- `npm run test:surface` 를 추가한다.

## English

- **Fix [#40](https://github.com/YuJunZhiXue/dsh-purge/issues/40)**: `pathLooksDesktop` no longer treats source trees as desktop just because the path contains `deepseek-harness`; require install shapes (`resources/`, `.exe`, `.app`).
- **Fix [#41](https://github.com/YuJunZhiXue/dsh-purge/issues/41)**: skip hide-console injection into source `apps/cli` build output; `revertAll` never deletes targets when `.dshpurge.bak` is missing.
- Add `npm run test:surface`.
# 1.1.23

## 한국어

- **수정 [#38](https://github.com/YuJunZhiXue/dsh-purge/issues/38)**: 프롬프트 패치 `#1`/`#2`/`#3` 이 `apply` 마다 약 +841자씩 늘어나 수렴하지 않았다.
- **원인**: 교체 텍스트가 여전히 이전 패턴으로 시작하고 `skipIfMarked` 가 없어, `autoApplyOnStart` 가 매 기동마다 다시 썼다.
- **수정**: `#1`/`#2`/`#3` 에 `skipIfMarked: true` 를 설정한다([#42](https://github.com/YuJunZhiXue/dsh-purge/pull/42)); `npm run test:idempotence` 를 추가한다.
- 이미 비대해진 호스트 파일은 자동으로 줄지 않는다 — `.dshpurge.bak` 을 복원하거나 dsh 를 재설치한 뒤 다시 적용한다.

## English

- **Fix [#38](https://github.com/YuJunZhiXue/dsh-purge/issues/38)**: prompt patches `#1`/`#2`/`#3` grew by ~+841 chars on every `apply` and never converged.
- **Cause**: replacement text still starts with the previous pattern, and `skipIfMarked` was missing, so `autoApplyOnStart` rewrote every boot.
- **Fix**: set `skipIfMarked: true` on `#1`/`#2`/`#3` ([#42](https://github.com/YuJunZhiXue/dsh-purge/pull/42)); add `npm run test:idempotence`.
- Already-bloated host files are not auto-shrunk — restore `.dshpurge.bak` or reinstall dsh, then apply again.

# 1.1.22

## 한국어

- **공식 데스크톱에서 적용할 때 나던 ENOENT 를 수정한다.** `app.asar` 가 아직 있는 동안 `dsh-purge-child-process-hide.mjs` 생성이 실패했다. 경로가 `resources\app.asar\...\dsh-purge-child-process-hide.mjs` 로 바뀌어 패치가 계속 pending 이었다.
- **원인**: 아카이브가 남아 있으면 Electron 이 `resources\app` 를 `app.asar` 로 매핑한다. 아카이브에 아직 없는 파일을 일반 파일 API 로 만들면 ENOENT 가 난다.
- **두 쓰기 경로를 모두 유지한다.** 아카이브가 남아 있으면 실제 `resources\app` 디렉터리에 쓴다. `app.asar` 가 없으면 이전 `node:fs` 경로가 그대로다. Web, 커뮤니티 데스크톱, 이미 언팩되어 아카이브가 `app.asar.bak` 으로 옮겨진 공식 설치를 모두 포함한다.
- 설치 경로를 드라이브 문자에 고정하지 않는다. Web 과 커뮤니티 데스크톱은 기존 적용·재시작을 유지한다. 호스트 대상은 계속 **dsh 0.1.7-rc.2** 다.

## English

- **Fixes ENOENT when Apply runs on the official desktop.** While `app.asar` is still present, creating `dsh-purge-child-process-hide.mjs` failed. The path was rewritten to `resources\app.asar\...\dsh-purge-child-process-hide.mjs`, and patches stayed pending.
- **Cause**: with the archive still in place, Electron maps `resources\app` into `app.asar`. Creating a file that is not already in the archive through the normal file API throws ENOENT.
- **Both write paths stay.** If the archive is still there, files are written on the real `resources\app` directory. If there is no `app.asar`, the previous `node:fs` path is unchanged. That covers Web, community desktop, and an official install that has already been unpacked and had the archive moved to `app.asar.bak`.
- Install paths are not pinned to a drive letter. Web and community desktop keep their existing Apply and restart. The host target remains **dsh 0.1.7-rc.2**.

# 1.1.21

## 한국어

- **필수 패치 실패 #43, #9, #15, #23, #42 수정.** 적용이 이 다섯 때문에 정리를 미완으로 보고하지 않는다. 프롬프트는 이미 기록되었고, 실패 때문에 플러그인이 죽은 것처럼 보였다.
- **원인**: 상위 폴더 이름이 DeepSeek Harness 이면 공식 데스크톱 설치로 처리해 Web npm 패키지가 제외되고 이 다섯이 기록되지 않았다. 설치 경로를 드라이브 문자에 고정하지 않는다. 데스크톱 실행 파일이 옆에 있거나 경로가 그 설치의 `resources/app` 아래일 때만 데스크톱 설치로 본다. Web, 커뮤니티 데스크톱, 공식 데스크톱이 각자 자기 패키지를 패치한다.
- **#43**: 네 가지 내장 Web 프리셋(standard, ptc, cordis, minimal)에서 정체성 문장을 제거한다. 남겨두면 그 문장이 주입 옆에 계속 붙어 있다.
- **#9**: 승인 요청이 자동 승인된다.
- **#15**: 샌드박스 `confine` 이 더 이상 명령을 감싸지 않는다.
- **#23**: 서브에이전트 기본 깊이가 1에서 10으로 올라간다.
- **#42**: 설정 서비스가 옛 `register` / `get` 메서드를 되찾아, 여전히 호출하는 플러그인이 로드된다.
- 파일은 있는데 이 버전에 그 원본 텍스트가 없으면 행이 skipped 로 표시되고 적용은 그대로 완료된다. 존재하는 텍스트는 계속 기록된다.

## English

- **Fixes required-patch failures #43, #9, #15, #23, and #42.** Apply no longer reports the cleanse as incomplete because of these five. The prompt was already written; the failure made the plugin look dead.
- **Cause**: a parent folder named DeepSeek Harness was treated as the official desktop install, so the Web npm packages were excluded and these five were never written. Install paths are not pinned to a drive letter. A tree counts as the desktop install only when the desktop executable is beside it, or the path is under that install's `resources/app`. Web, community desktop, and official desktop each patch their own packages.
- **#43**: strips the identity sentence from the four built-in Web presets (standard, ptc, cordis, minimal). Left in place, that sentence stays next to the inject.
- **#9**: approval requests are auto-granted.
- **#15**: sandbox `confine` no longer wraps the command.
- **#23**: subagent default depth moves from 1 to 10.
- **#42**: the settings service gets the old `register` / `get` methods back, so plugins that still call them can load.
- When the file exists but this version does not contain that original text, the row shows skipped and Apply still completes. Text that is present is still written.

# 1.1.20

## 한국어

- **호스트 버전**: 현재 대상은 **dsh 0.1.7-rc.2** 다. 이전 대상 **0.1.7-rc.1**(`0.1.7-rc.1.20260924.1` 포함) 앵커도 계속 매칭된다.
- **공식 데스크톱 업그레이드**: 내려받은 업데이트는 재시작 시 또는 앱 내 설치 후 재시작 동작에서 설치되고, 새 빌드가 언팩되어 패치된다. 대기 중인 업데이트가 없으면 재시작은 현재 클라이언트를 닫았다 다시 열 뿐이다. 설치 경로를 드라이브 문자에 고정하지 않는다.
- **패치**: #14 와 #35 가 rc.2 에스컬레이션 텍스트와 매칭되어 이제 필수 패치 실패가 나지 않는다. #29, #33, #36 은 새 프롬프트 문구를 따른다.
- Web 과 커뮤니티 DSH Desktop 은 기존 적용·재시작을 유지한다.

## English

- **Host version**: current target is **dsh 0.1.7-rc.2**. Anchors for the previous target, **0.1.7-rc.1** (including `0.1.7-rc.1.20260924.1`), still match.
- **Official desktop upgrade**: a downloaded update installs on Restart, or on the in-app install-and-restart action, then the new build is unpacked and patched. With no pending update, Restart still closes and reopens the current client. Install paths are not pinned to a drive letter.
- **Patches**: #14 and #35 match the rc.2 escalation text, so Apply no longer fails those required patches. #29, #33, and #36 follow the new prompt wording.
- Web and community DSH Desktop keep their existing Apply and restart.

# 1.1.19

## 한국어

- **공식 데스크톱 EXE**: 공식 DeepSeek Harness 에서 적용하면 `app.asar` 를 언팩하고 네이티브 모듈을 복원한 뒤, 재시작이 클라이언트를 닫았다 다시 연다. Web 과 커뮤니티 DSH Desktop 은 기존 적용·재시작을 유지한다.
- **재시작**: 공식 호스트 종료가 더 이상 크래시로 처리되지 않고, PowerShell 프로세스도 남지 않는다. 헬퍼가 `toISOString` 을 호출하지 않아 Windows Script Host 런타임 오류 팝업이 사라졌다. 새 프로세스가 `ELECTRON_RUN_AS_NODE` 를 상속하지 않아 즉시 종료되지 않는다.
- **업데이트**: 버전을 전환하거나 롤백하면 수동 되돌리기 없이 그 버전의 패치가 복원·재적용된다.
- **패치 목록**: 이미 `dsh-web-fetch-http` 에 의존하는 호스트는 영구히 skipped 로 남던 #20 을 더 이상 표시하지 않는다. 설치 경로를 드라이브 문자에 고정하지 않는다.

## English

- **Official desktop EXE**: Apply on official DeepSeek Harness unpacks `app.asar`, restores native modules, then Restart closes the client and opens it again. Web and community DSH Desktop keep their existing Apply and restart.
- **Restart**: exiting the official host is no longer treated as a crash, and no PowerShell process is left behind. The helper no longer calls `toISOString`, which made Windows Script Host pop a runtime error. The new process does not inherit `ELECTRON_RUN_AS_NODE`, which made it exit immediately.
- **Updates**: switching or rolling back a version restores and reapplies that version's patches without a manual revert first.
- **Patch list**: hosts that already depend on `dsh-web-fetch-http` no longer show a permanently skipped #20. Install paths are not pinned to a drive letter.

# 1.1.18

## 한국어

- **재시작**: 옛 페이지 토큰이 프로세스와 함께 사라져 새로고침하면 재시작이 아무것도 하지 않은 것처럼 보인다. 이제 재시작이 포트를 해제하고 새 `dsh web:` URL 로 브라우저를 연다. 그 페이지에서 새 대화를 시작한다.
- **설정**: 적용이 이전 1.1.17 패치가 남긴 중복 `legacyApplyPath` 를 합쳐 `dsh-settings` 가 로드되게 한다. 그 적용 후 한 번 재시작한다.

## English

- **Restart**: the old page token dies with the process, so a refresh looks like restart did nothing. Restart now frees the port and opens the browser at the new `dsh web:` URL. Use that page and start a new chat.
- **Settings**: Apply collapses duplicate `legacyApplyPath` left by earlier 1.1.17 patches so `dsh-settings` can load. Restart once after that apply.

# 1.1.17

## 한국어

- **안정성**: 패치 #42 가 dsh 0.1.7 에 중복 `legacyApplyPath` 를 쌓지 않아 `@deepseek-ai/dsh-settings`, 프로바이더 카탈로그 로딩, 하위 플러그인이 깨지지 않는다. `skipIfMarked` 를 쓰고, 공식 패키지가 이미 포함한 헬퍼를 다시 삽입하지 않는다.
- **워크스페이스 인트로**: 패치 #1/#2 가 `WORKSPACE_*` 와 `AGENT_*` 상수 이름을 모두 매칭해, 구버전 설치에서 행이 Skipped 로 보이지 않는다.
- **거부/소프트 거부**: 더 강한 공식 워크스페이스 인트로와 고정된 `dsh-purge:rules` 섹션. 프롬프트 변경은 **dsh 를 재시작하고 새 대화를 시작**해야 반영된다.

## English

- **Stability**: patch #42 no longer stacks duplicate `legacyApplyPath` on dsh 0.1.7, which broke `@deepseek-ai/dsh-settings`, provider catalog loading, and downstream plugins. Uses `skipIfMarked` and does not re-insert the helper the official package already ships.
- **Workspace intros**: patches #1/#2 match both `WORKSPACE_*` and `AGENT_*` constant names so rows no longer show Skipped on older installs.
- **Refusal / soft refusal**: stronger official workspace intros plus a fixed `dsh-purge:rules` section. **Restart dsh and start a new chat** for prompt changes.

# 1.1.16

## 한국어

- **dsh 0.1.7-rc.1** 에 맞췄다. 워크스페이스 지시 상수가 이제 `AGENT_INSTRUCTIONS_INTRO` 다. 문장은 그대로이고 패치가 그것을 따른다.
- 샌드박스 `confine()` 이 이제 `async confine(argv, policy, signal)` 이고, 패치가 그 함수와 매칭된다. 통과 동작은 이전 릴리스와 같다.
- 서브에이전트 깊이는 `dsh-subagent` 에 있다. 기본값이 1에서 10으로 바뀐다. 깊이 검사는 그대로다.
- 설정 서비스가 옛 `register` / `get` 메서드를 다시 노출해 `dsh-mnemon`, `dsh-better-reasoning-effort` 같은 플러그인이 계속 동작한다. 공식 `describe` / `update` 는 유지된다. 패치는 한 번 적용되고 기동 시 스스로 다시 삽입되지 않는다.
- 0.1.7 에 더 이상 없는 패치 텍스트를 제거했다. `dsh-base` 에 붙이던 `dsh-web-fetch-http` 의존도 포함된다. 공식 패키지가 이미 의존한다.
- 네 가지 내장 Web 프리셋(standard, ptc, cordis, minimal)은 정체성 문장만 잃는다. 작업 디렉터리 접미사, 도구 목록, `ptc` 모드, minimal 의 `complete: true` 와 `includeRuntimeContext: false` 는 유지된다.
- `complete: true` 일 때 `prompt-inject.md` 는 여전히 그 섹션 앞에 붙는다. 호스트 업그레이드나 섹션을 떨어뜨리는 옛 훅이 주입을 잃지 않는다. 적용 후에도 재시작을 클릭하고 새 대화를 시작해야 세션에 들어간다.
- `dsh-compaction-instant` 웹 클라이언트가 제거된 `settingsScope` 대신 `configForms` 를 써서, 페이지가 '플러그인 로드 실패'에서 멈추지 않는다.
- 0.1.7 의 되돌리기는 새 세션을 만들고도 UI를 옛 대화에 남겨 클릭이 죽은 것처럼 보였다. 0.1.7 에는 `sessions.open` 이 없다. 이제 버튼이 `uiWorkspace.openSession` 으로 새 세션을 열고 이전 사용자 줄을 입력창에 되돌린다. 실패는 버튼에 표시된다.
- README 후원 블록이 이제 비영리 고지다: 상업 재판매와 그레이 마켓 수익 없음, 기술 참조 목적만.

## English

- Aligned with **dsh 0.1.7-rc.1**. The workspace-instruction constant is now `AGENT_INSTRUCTIONS_INTRO`. The sentence is unchanged, and the patch follows it.
- Sandbox `confine()` is now `async confine(argv, policy, signal)`, and the patch matches that function. Passthrough behavior is the same as the previous release.
- Subagent depth lives on `dsh-subagent`. The default moves from 1 to 10. The depth check remains.
- The settings service again exposes the old `register` / `get` methods, so plugins such as `dsh-mnemon` and `dsh-better-reasoning-effort` keep working. Official `describe` / `update` stay. The patch applies once and does not insert itself again on startup.
- Patch text that no longer exists in 0.1.7 is removed, including the extra `dsh-web-fetch-http` dependency on `dsh-base`. The official package already depends on it.
- The four built-in Web presets (standard, ptc, cordis, minimal) lose only the identity sentence. The working-directory suffix, tool lists, `ptc` mode, and minimal's `complete: true` plus `includeRuntimeContext: false` stay.
- When `complete: true`, `prompt-inject.md` is still prepended to that section. A host upgrade or an older hook that drops the section does not drop the inject. After Apply you still click Restart and start a new chat before it enters the session.
- The `dsh-compaction-instant` web client uses `configForms` instead of the removed `settingsScope`, so the page no longer stops on Failed to load plugins.
- Rewind on 0.1.7 created the new session and left the UI on the old chat, so the click looked dead. 0.1.7 has no `sessions.open`. The button now opens the new session with `uiWorkspace.openSession` and puts the previous user line back in the composer. A failure shows on the button.
- The README sponsor block is now a non-profit notice: no commercial resale and no gray-market profit; technical reference only.
