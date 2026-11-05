# #38: 기본 프리셋의 진단 상태

## 근본 원인

1.6.30 의 집계 강화는 필수 파일이 없는데도 성공으로 표시되는 것을 막기 위한 것이었지만, 기본 제공 프리셋의 실제 상태를 놓쳤다. #76 은 일치하는 대상이 없을 때 핵심 상태가 여전히 skipped 이며, 옛 집계는 선택 항목을 무시했고 새 집계는 이를 broken 으로 판정했다.

## 수정 경계

#76 에 넓은 settleWhenAbsent 를 추가하지 않고 core 의 검사나 쓰기 로직을 바꾸지 않는다. selfCheck 안에서만 #76 의 skipped 를 세분화한다: 명확한 DSH_HOME 아래 `.agent-presets/unrestricted/agent.cordis.yml` 을 읽고 YAML AST 로 단일 persona 의 리터럴 prefix 를 검사한다. !!js 를 실행하지 않고 별칭을 해석하거나 다른 home 에서 보충해 읽지 않는다.

- 본문에 해당 목표 문장이 없음: not_needed. 자체 점검 필수 분모에서만 제외하고 설명은 남긴다.
- 본문에 목표 문장은 있으나 현재 앵커가 맞지 않음: skipped/broken 을 유지한다.
- 읽기 불가, 구조 이상, 동적 또는 상속 설정: unknown. 완료됐다고 주장하지 않으며 반복 적용이나 권한 수정으로 없애라고 권하지 않는다.
- pending/applied/na 와 다른 패치 상태는 바뀌지 않는다. 모든 optional/skipped 를 성공으로 계산하도록 일반화하지 않는다.

따라서 핵심 status/diagnose 와 selfcheck 의 원본 상태가 다를 수 있다. selfcheck 는 읽기 전용 정적 증거를 더하며, not_needed 는 한 번의 성공 적용이 아니다.

## 테스트와 유지보수

node --test test/selfcheck.test.mjs 는 실제 기본 프리셋, 실제 patchStatus, selfCheck 집계, 예외 경계를 포함한다. 소스와 릴리스 패키지를 모두 테스트한다. 설치 경로와 백업/롤백 구현은 바뀌지 않았고 이 버전에는 사용자 설정 마이그레이션이 없다. 옛 버전으로 롤백하면 옛 오탐이 돌아오지만 사용자 프리셋 파일을 복원하거나 덮어쓸 필요는 없다.

실기 검증: macOS 207/212 통과, 5 항목 플랫폼 건너뜀. Windows 209/212 통과, 3 항목 플랫폼 건너뜀(실제 TLS 와 Electron 인계 모두 실행). 양쪽 모두 Electron 44.7.0 과 릴리스 패키지 smoke 를 통과했다. 테스트 스크립트의 ASAR 파일은 Electron 테스트 하위 프로세스가 끝난 뒤 삭제해야 하고, Windows 의 npm.cmd 는 고정 명령으로 기동한다. 이 모두 실제 설치기나 호스트를 바꾸지 않는다. 3 플랫폼 CI 에 패키징 검사를 추가해 이후 릴리스 게이트로 쓴다.
