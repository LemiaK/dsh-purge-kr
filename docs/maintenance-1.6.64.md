# 1.6.64 유지보수 기록: 능력 감사와 expect 계약

## 감사 기준

- 패치 표를 `patchStatusDetail` 로 실기 0.2.1-rc.5 에서 항목별로 대조했다. 계층별 집계는 릴리스 노트에 있다.
- 업스트림 1.1.83 과 **name** 기준으로 정렬: 82 대 82, 72 개 replacements 는 글자 단위로 일치한다. 차이 6 건(WEB_SURFACE_IDENTITY_NEUTRAL, COMPLETE_PROMPT_KEEP_INJECT, WEB_SURFACE_PROHIBITION, REWIND_DROP_SENT_ON_APPEND, DEEPSEEK_SYSTEM_ROLE, HUNG_PROMPT_LF_NEEDLE)은 모두 우리 쪽 신규 마이그레이션이나 rc 수정이다.
- 업스트림에만 있는 4 건: #18/#19(컨텍스트 보호, 게이트가 아님), #85/#86(끼어들기, #90 이 이미 포함).

## expect 계약

- 선언 방식: `{ pattern, replace, expect: 1 }`. 리터럴과 정규식을 모두 검사하며 0 회도 불일치로 센다.
- 적용 경로: `hitMismatch` → `notFound += 1`, `lastError = hit_mismatch:<기대>!=<실제>`, 디스크에 쓰지 않는다.
- 실기 프로브: `.dshpurge.bak`(패치 전 원문)을 우선 읽고 리터럴 앵커의 출현 횟수를 세어 1 초과면 실패로 본다.

## #18/#19 를 여전히 켜지 않는 이유

이들은 게이트 패치가 아니라 호스트의 품질 보호를 끄는 패치다: 반복 호출 알림, 도구 결과 트리밍(8192 자 임계값). 켜면 긴 세션의 컨텍스트가 선형으로 불어나 안정성 후퇴가 된다. 업스트림도 1.1.83 에서 계속 유지하고 있다. 필요하면 따로 다시 넣을 수 있지만 기본 표에는 넣지 않는다.
