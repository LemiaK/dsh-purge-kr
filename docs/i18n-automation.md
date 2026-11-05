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
             → 영역별 커밋 → 번들 재생성 → 게이트 → PR
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
| 호스트 앵커 | `lib/patches|core` 의 여러 줄 문자열(앵커)이 업스트림과 바이트 동일한가 | `problems` → exit 2 |
| 남은 중국어 | 번역 대상에 중국어가 남았는가(경고) | 경고만 |
| AI 검토 | 새로 번역된 쌍의 톤·용어·보간(`${...}`) 오류 | 지적 시 exit 2, `--apply-fixes` 면 TM 교정 후 재번역 |

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
- 시도 횟수(기본 2회)를 넘기면 `.sync/failure.md` 를 만들고 exit 3 → 워크플로가 **이슈로 남긴다**(로그·검토 결과 포함)
