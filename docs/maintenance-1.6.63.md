# 1.6.63 유지보수 기록: 업스트림 1.1.78–1.1.83 대조

commit 과 release notes 를 항목별로 읽고 내린 판단:

| 업스트림 항목 | 결론 |
|---|---|
| #188 drifted 판정(일반 부분) | **채택**: `filePatchOutcome` 에 `drifted` 추가, `ensureHostClean` 이 더 이상 `pattern_not_found` 를 걸러 내지 않음, 패널/자체 점검 동기화 |
| #188 의 expect 적중 수 계약 | 보류: 변경 범위가 82 개 pattern 전부에 걸쳐 별도 검증 라운드가 필요 |
| #174 DSH NEXT 식별 | 미채택: 서드파티 셸은 독립 호스트 계열이 필요(이 저장소 #98 / PR #102) |
| #180 / #185 allowBuilds, pnpm 11/12 | 미채택: 이 fork 는 `pnpm-workspace.yaml` 을 쓰지 않고 `dsh plugin add` 를 쓴다 |
| #191 빈 `[]` cordis.patch.yml | 미채택: 이 fork 는 insert 행을 자동으로 덧붙이지 않는다 |
| #108 selectedDefault 정리 | 미채택: redteam 프리셋이 없고 사용자 기본 선택을 바꾸지 않는다 |
| #170 zip 디렉터리 항목 | 이미 있음(`endsWith("/")` 로 디렉터리 생성) |
| 서브에이전트가 상위 세션을 따라 프리셋을 읽음 | 미채택: #53 계약은 "하위 Agent 가 자기 실제 프리셋으로 판단"이며 이미 테스트로 고정되었다 |
| 공인망 게이트 / 실습 환경 제한 | 일절 채택하지 않는다 |

## 판정 세부

- 자기 표식 패치: `replacements[].pattern` 에 `[dsh-purge]` 가 있으면 pattern 이 플러그인이 직접 쓴 흔적이므로, 찾지 못함 = 넣은 적 없음이 되어 `skipped` 를 유지한다.
- `silentWhenMissing`: "누락이 곧 정상"이라고 명시한 패치(현재는 #76 사용자 프리셋 신원 행뿐). 깨끗한 프리셋을 드리프트로 보고하지 않게 한다.
- 실기 0.2.1-rc.5 결과: 74 applied / 6 na(서드파티 미설치) / 2 skipped, `diagnose` 드리프트 0.
