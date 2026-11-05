# PR #128: 모듈 분리 후 설정 마이그레이션 의존성 보존

`collapseDuplicateLegacyApplyPath` 와 `rewriteStaleLegacyApplyCall` 는 `lib/core/shared.mjs` 로 옮겨졌지만, `endOfBalancedBlock` 과 `SETTINGS_APPLY_CALL` 은 옛 모듈 스코프에 남아 있었다. 그래서 레거시 경로가 ReferenceError 를 던졌다. 기존 헬퍼와 상수는 이제 호출자 옆에 있고, 내용과 패치 정의는 그대로이며 순환 import 도 생기지 않는다.

## 2026-11-04 검증

- macOS 와 Windows 11 에서 대상 설정 테스트 여덟 개가 통과했고, 각각 일반 Node 와 명시적으로 격리된 Electron 실행 파일의 Node 모드에서 실행했다.
- 테스트는 비공개가 아닌 픽스처 설정으로 VM 안에서 마이그레이션된 설정 콜백을 실행한다. LF/CRLF, 중복 헬퍼, 중복 없는 오래된 콜백, 멱등성, 무관한 텍스트와 네이티브 설정 보존, 알 수 없는 수정 shim 거부, 옛/네이티브 API 동작을 다룬다.
- 원본 PR head 는 새 레거시 마이그레이션 음성 대조에서 ReferenceError 로 실패한다; 이것은 import 점검만이 아니라 실제로 실행한 회귀다.
- 추출된 core 와 패치 모듈에 대해 ESLint no-undef 점검이 통과한다.

`node --test test/settings-migration-modules.test.mjs test/settings-api.test.mjs` 를 실행한다. 새 파일은 npm test 에 포함된다. 이 결과는 설정 마이그레이션 컴포넌트/런타임 테스트이며, 전체 설치/롤백이나 리팩터링 전체가 모든 CI 를 통과했다는 주장이 아니다. 사용자 설정이나 정식 DSH 설치를 사용하거나 수정하지 않았다. 어떤 기능이나 패치 정의도 삭제하지 않았다.
