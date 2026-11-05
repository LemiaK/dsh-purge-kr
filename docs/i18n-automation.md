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
