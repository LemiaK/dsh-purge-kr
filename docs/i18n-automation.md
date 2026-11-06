# 업스트림 동기화·자동 번역 운영 안내

`upstream-sync.yml` 이 매일(또는 수동 실행 시) 업스트림 `kingcharleslzy-ai/dsh-purge` 를 확인하고,
델타만 번역해 PR 을 만든다. 이 문서는 **운영자가 설정해야 하는 값**과 동작 조건을 정리한다.

## 1. 환경변수 (Environment `localization`)

워크플로 job 에 `environment: localization` 이 걸려 있어, 아래 값은 **그 environment 에서만** 읽힌다.
저장소 전역(Repository secrets/variables)에 두면 다른 워크플로도 읽을 수 있으므로 environment 를 쓴다.

| 이름 | 위치 | 필수 | 기본값 | 의미 |
| --- | --- | --- | --- | --- |
| `LLM_API_KEY` | **Environment secret** | 예(AI 사용 시) | — | 제공자 API 키. 로그·파일·커밋에 남기지 않는다 |
| `LLM_BASE_URL` | Environment **variable** | 아니오 | `https://api.openai.com/v1` | OpenAI 호환 엔드포인트(`/chat/completions` 를 붙여 쓴다) |
| `LLM_MODEL` | Environment variable | 아니오 | `gpt-4o-mini` | 번역 모델 이름 |
| `LLM_REASONING_EFFORT` | Environment variable | 아니오 | (없음) | 추론 강도: `none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`. 없거나 목록 밖 값이면 필드를 보내지 않는다 |
| `LLM_TIMEOUT_MS` | Environment variable | 아니오 | `120000` | 호출 타임아웃(밀리초) |
| `LLM_SESSION_ID` | Environment variable | 아니오 | 실행 id | `x-opencode-session` 헤더 값. **자격 증명이 아니라 라우팅·프롬프트 캐시용 세션 식별자**다(제공자 문서: “stable session ID for each conversation”). 없으면 워크플로 실행 id 를 쓴다 |
| `LLM_EXTRA_HEADERS` | Environment variable | 아니오 | — | 추가 헤더 JSON(예: `{"x-foo":"bar"}`). 값은 로그에 남기지 않는다 |

`LLM_REASONING_EFFORT` 동작:
- 값이 허용 목록에 있으면 요청 본문에 `reasoning_effort` 필드로 실린다. 목록: `none` `minimal` `low` `medium` `high` `xhigh` `max`.
- 제공자가 이 필드를 모르고 `HTTP 400` 을 돌려주면, 필드를 빼고 **한 번 더 시도**한다(실패로 끝나지 않는다).
- 대소문자는 무시되고, 알 수 없는 값은 조용히 무시된다(경고만 남기지 않고 필드 미전송).

## 2. 설정 방법

1. 저장소 → **Settings → Environments → New environment** → 이름 `localization`
2. **Environment secrets** → `LLM_API_KEY`
3. **Environment variables** → `LLM_BASE_URL`, `LLM_MODEL`, `LLM_REASONING_EFFORT`(선택), `LLM_TIMEOUT_MS`(선택)
4. **Deployment branches** → `master` 만 허용
5. (선택) **Required reviewers** 를 걸면 실행이 승인 대기 상태가 된다. 무인 자동을 원하면 비워 둔다.

## 3. 실행 흐름

```
cron/dispatch → upstream 버전 비교
  └ 같으면 종료
  └ 다르면 병합 → 델타 밖 파일 복원 → 델타 번역(TM → 신규만 AI)
             → 영역별 커밋 → 번들 재생성 → 검토 + 게이트
             → (실패) 좁은 복구(repair) → (실패) 선임 수정 1회 → PR
```

키가 없으면 자동으로 `--no-ai` 로 내려가 **TM 재사용 + 미번역 보고서**만 만들고 PR 을 연다.

## 4. 안전장치

- 번역 대상은 **문자열·주석·마크다운 줄**의 스팬뿐이다. `pattern`/`markers`/`replace` 같은 호스트 앵커는 정책상 스팬에서 제외된다.
- 재삽입 뒤 코드 골격(영숫자·기호)이 바뀌면 즉시 실패한다(`skeleton` 검사).
- 실패 로그에는 상태 코드만 남고 응답 본문·키는 남지 않는다(`sanitize`).
- `test/i18n-automation.test.mjs` 가 가짜 키로 “출력·저장소에 키가 없다”를 검증한다.

## 5. 수동 점검

```sh
# 번역 없이 무엇이 대상인지만 확인
node scripts/localize.mjs --paths lib/instance.js,docs/INSTALLATION.md --dry-run

# TM 재적용 결과를 실제로 쓰기(네트워크 없이)
node scripts/localize.mjs --manifest .sync/changed.txt --write

# 신규 문자열까지 AI 로(키 필요)
LLM_API_KEY=... node scripts/localize.mjs --manifest .sync/changed.txt --write --allow-network --write-tm

# 게이트만 확인
node scripts/localize.mjs --manifest .sync/changed.txt --check
```

## 6. 검토(review) 단계

번역·커밋 뒤 PR 을 열기 전에 `scripts/i18n-review.mjs` 가 한 번 더 본다.

| 검사 | 내용 | 실패 시 |
| --- | --- | --- |
| 코드 지문 | 번역 대상(문자열·주석)을 지운 토큰 지문이 업스트림과 같은가 | `problems` → exit 2 |
| 호스트 앵커 | 패치 표의 `pattern` 문자열이 업스트림과 바이트 동일한가(포크 구조 차이는 경고) | `problems` → exit 2 |
| 주입 문장 | 한국어로 두었던 문자열이 병합으로 중국어가 되지 않았는가(`--base` 필요) | `problems` → exit 2 |
| 남은 중국어 | 이번 동기화에서 **새로 생긴** 미번역이 있는가(기존 부채는 경고) | `--strict-leftover` 면 `problems`, 아니면 경고 |
| AI 검토 | 새로 번역된 쌍의 톤·용어·보간(`${...}`) 오류 | 지적 시 exit 2, `--apply-fixes` 면 TM 교정 후 재번역 |

판정 결과는 `.sync/review.md`(사람용)와 `.sync/review.json`(선임 수정 패스 입력)으로 함께 남는다.
잘못 번역된 앵커는 `scripts/i18n-restore-anchors.mjs` 가 업스트림 원문으로 되돌린다.

게이트가 실패하면 워크플로는 PR 을 열되 **자동 머지하지 않고** `.sync/review.md` 를 본문에 붙인다.

## 7. 자동 릴리스

| 단계 | 트리거 | 동작 |
| --- | --- | --- |
| 업스트림 감지 | `schedule` 하루 2회(UTC 03:00 / 15:00) · 수동 · `repository_dispatch` | `upstream/master` 의 버전이 다르면 동기화 시작 |
| 동기화 | 위 | 병합 → 번역 → 영역별 커밋 → 검토 → 게이트 → PR |
| 머지 후 릴리스 | **master push** (`auto-release.yml`) | package.json 버전으로 `v<version>` 태그 생성(없을 때만) → `release.yml` 을 그 태그에서 dispatch |
| 자산 배포 | `release.yml` | 3개 OS 설치기 테스트 → tgz + `SHA256SUMS.txt` → GitHub Release |

동작 규칙:
- 이미 같은 버전 릴리스가 있으면 아무 것도 하지 않는다(멱등).
- 태그만 있고 릴리스가 없으면(중간 실패), 태그는 재사용하고 릴리스만 다시 만든다.
- 태그 push 는 `GITHUB_TOKEN` 으로 하므로 다른 워크플로를 재트리거하지 않는다. 그래서 릴리스는 `workflow_dispatch` 로 **명시 호출**한다(이 이벤트는 예외적으로 허용됨).
- 봇이 만든 커밋으로는 auto-release 가 돌지 않는다(수동 dispatch 는 허용).

### 자동 머지와 릴리스 체인

- 검토가 지적한 항목은 `--apply-fixes` 로 번역 메모리를 교정하고 해당 파일을 다시 번역한 뒤
  `fix(i18n): apply review corrections` 커밋으로 남긴다. 즉 검토는 "읽기"가 아니라 **쓰기**까지 한다.
- 게이트(check:docs · bundle --check ×2 · npm test)가 모두 통과하면 워크플로가 PR 을 **자동 머지**한다.
  - 기본값은 켜짐이며, 저장소 variable `AUTO_MERGE=false` 로 끌 수 있다.
  - 수동 실행 시에는 `auto_merge` 입력으로 그 실행만 끌 수 있다.
- 머지 직후 `auto-release.yml` 을 **명시 호출**한다(봇의 master push 는 워크플로를 재트리거하지 않기 때문).
  → 버전 태그 생성 → `release.yml` 을 태그에서 dispatch → 3개 OS 검증 → tgz·SHA256·릴리스.

## 8. 자동 복구(repair)

게이트가 실패하면 워크플로가 **실패 로그를 모델에 보내고 최소 편집(search/replace)만 받아 적용**한 뒤 게이트를 다시 돌린다.

- 대상: 번역·코드·테스트·문서 (실패 원인을 고치는 데 필요한 최소 편집)
- 금지: `.github/**`, `package-lock.json`, `client.js`, `packages/purge-panel/client.js`, `i18n/tm.ko.jsonl`
- 편집 규칙: `search` 문자열이 파일에 **정확히 1회** 존재해야 적용(모호하면 거부)
- 성공 시 `fix(ci): apply AI repair (attempt N)` 커밋 + 번들 재생성 커밋 후 계속 진행(PR → 머지 → 릴리스)
- 시도 횟수(기본 2회)를 넘기면 `.sync/failure.md` 를 만들고 exit 3 → **선임 수정 패스로 넘어간다**(아래 9장).

## 9. 선임 수정(senior fix) — 이슈를 열기 전 마지막 자동 수정

좁은 복구로도 풀리지 않는 실패는 `scripts/i18n-senior-fix.mjs` 가 **1회** 더 맡는다.
일반 번역 패스보다 **권한이 넓은** 모델 호출이며, 실패하면 그때만 사람 이슈를 만든다.

| 대상 | 무엇을 고치나 | 근거 |
| --- | --- | --- |
| 앵커 드리프트 | 업스트림이 바꾼 호스트 문자열에 맞춰 `pattern` 을 바이트 동일하게 다시 맞춘다 | `scripts/i18n/anchors.mjs` 의 `patternDrift` |
| 주입 문장 소실 | 병합으로 중국어가 되돌아온 문자열을 한국어로 다시 쓴다 | `lostPayloads`(이전 커밋 `--base` 대조) |
| 미번역·다른 문장 | 번역 대상에 남은 중국어를 한국어로 바꾼다. 형태 검증을 통과한 것만 반영한다 | `collectTranslatable` + `looksTranslated` |
| 게이트 실패 | 실패 로그를 보고 코드·테스트·문서를 최소 편집한다 | `.sync/failure.log` |

동작 규칙:

- 편집은 여전히 **정확히 1회** 일치해야 적용하고, `.github/**`·잠금 파일·번들(`client.js`)·`i18n/tm.ko.jsonl`·`.sync/**` 는 금지 경로다.
- `[dsh-purge]` 표식을 지우는 편집은 **거부**한다(패치 적용 판정에 쓰이는 표식이다).
- 번역은 “한글이 있어야 하고, 중국어가 줄어야 하고, 코드펜스·설명문 길이가 아니어야 한다”는 **형태 검증**을 통과해야 반영된다(거부 문구 키워드 판정은 두지 않는다).
- 반영된 (원문→번역) 쌍은 TM 에 쌓여 다음 동기화가 재사용한다.
- 적용 뒤 `node --check` → 검토(`--strict-leftover`) → 게이트(check:docs·bundle --check ×2·npm test)를 **다시** 돌린다. 통과하면 `fix(i18n): senior review pass …` 커밋으로 남기고 계속 진행한다.
- 그래도 실패하면 `.sync/senior-fix.md` 를 남기고 exit 3 → 워크플로가 `.sync/{summary,senior-fix,repair,failure,review}.md` 를 붙여 이슈를 만든다.

수동 실행:

```sh
node scripts/i18n-senior-fix.mjs --manifest .sync/changed.txt --base "$(git rev-parse HEAD~1)" \
  --review .sync/review.json --log .sync/failure.log --allow-network --write
```

## 10. 코드·기능 변경 대응

업스트림은 릴리스마다 기능 추가와 코드 수정을 함께 올린다. 파이프라인은 **코드는 업스트림 그대로 두고 텍스트만** 바꾸도록 설계돼 있다.

| 업스트림 변경 | 처리 | 보강(게이트) |
| --- | --- | --- |
| 새 코드 파일·새 함수 | 파일 전체가 업스트림 그대로 복사되고, 문자열/주석 스팬만 번역된다 | 구조 지문(문자열·주석 제거 후 토큰 비교)이 같아야 통과 |
| 로직 변경·리팩터링 | 코드는 손대지 않는다(스팬 외 바이트 불변) | `node --check` · `npm test` |
| 패치 표 변경(`pattern/markers/replace`) | 그 파일은 **주석만** 자동 번역하고, 호스트 스니펫(`pattern`)은 바이트 동일로 둔다. 병합으로 사라진 한국어 주입 문장은 선임 수정 패스가 다시 쓴다 | 검토의 앵커·주입 문장 비교 + `test/patch-anchors` |
| 새 패치 id 추가 | 주석만 번역, 항목 추가는 업스트림 그대로 | `ALL_PATCHES` 개수·앵커 테스트 |
| 새 UI 문자열(en 키 추가) | ko 사전에 키가 없으면 화면에 영어가 노출된다 | **locale parity 게이트**가 누락 키를 잡고, repair 가 ko 값을 추가하거나 이슈로 남긴다 |
| 새 테스트가 중국어 문구를 단언 | 현지화된 메시지와 불일치로 실패 | 게이트 실패 → AI repair 가 기대값을 맞춘다(실패하면 초안 PR + 이슈) |
| 포맷 변경 | 패널 소스가 바뀌면 `prettier --write` 를 먼저 돌린다 | `format:check` 게이트 |
| 새 문서 | README 는 영문 1벌, `docs/*.md` 는 한국어. `docs/releases/**` 는 원문 유지 | `check:docs` |
| 의존성·락파일 변경 | **손대지 않는다**(금지 경로) | `npm ci` · `npm test` |

### 남는 한계

- 산문(README·AGENTS)의 **의미 정확성**은 사람이 본다.
- 업스트림이 호스트 문자열을 바꿔 앵커가 어긋나면 자동 번역 대상이 아니다. 좁은 복구는 앵커를 건드리지 않으므로 **선임 수정 패스가 1회** 새 호스트 문자열에 맞춰 고치고, 그것도 실패할 때만 이슈로 남긴다.
- 모델이 어떤 이유로든 번역 대신 다른 문장을 돌려주면 그대로 저장된다(거부 판정은 두지 않기로 했다). 대신 선임 수정 패스가 `--strict-leftover` 로 남은 중국어를 **문제**로 올리고, 형태 검증을 통과한 번역만 반영한다. 그래도 남으면 이슈 + 사람 리뷰가 마지막 방어선이다.
