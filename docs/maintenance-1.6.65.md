# 1.6.65 유지보수 기록: #18/#19 스위치

## 기본으로 켜지 않는 이유

두 패치 모두 게이트가 아니라 컨텍스트 보호를 해제한다:

| 패치 | 역할 | 이점 | 대가 |
|---|---|---|---|
| #18 REPEAT_TOOL_REMINDER_DISABLED | 반복 호출 알림 끄기 | 도구 루프 프롬프트가 깔끔해진다 | 모델이 같은 지점에서 반복 시행착오를 할 수 있다 |
| #19 TOOL_RESULT_PRUNER_DISABLED | 8192 자 도구 결과 트리밍 끄기 | 모델이 전체 출력을 볼 수 있다 | 도구 출력이 오래 컨텍스트를 차지해 더 빨리 한계에 닿고 비용이 커진다 |

## 상태 의미

- `disabled`: `tuning.extraPatches` 에 나열되지 않은 상태. `patchStatusReady("disabled") === true`(이것은 선택이며 고장이 아니다).
- 자체 점검의 `tallyPatchStatus.disabled` 는 `not_applicable` 로 계산하며 필수 분모에 들어가지 않는다.
- `patchDrift` 는 disabled 를 건너뛰고 드리프트로 보고하지 않는다.
- apply 집계: `disabled` 는 `ALWAYS_SOFT_STATUSES` 에서 소프트 통과로 계산해 `failed` 에 들어가지 않으며, 패널이 "선택에 따라 끔"을 더 이상 빨간 글씨로 렌더링하지 않는다. `write_failed`, 앵커 불일치 같은 실제 실패는 그대로 계산한다.

## 검수

- `test/opt-in-patches.test.mjs`: 기본 상태에서 쓰기 거부, 명시적으로 켠 뒤 쓰기와 상태 전환, tuning 중복 제거 필터. 또한 apply 집계에서 disabled 가 소프트 통과이고 `write_failed` 같은 실제 실패는 여전히 `failed` 에 들어감을 단언한다.
- 실기 흐름: `patches enable 19` → 격리 rc.5 트리에 적용 → 상태 applied. `patches disable 19` → 상태 disabled.
