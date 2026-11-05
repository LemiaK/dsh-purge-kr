# DSH Store: 메인 플러그인 경로와 호환성 선언

이 페이지는 [DSH Store #1650](https://github.com/AI-Scarlett/DSH-Store/issues/1650) 의 메타데이터 문제 두 건에 해당한다. DSH Store 는 서드파티 마켓이며, 그 정적 수록 규칙은 DSH 공식 플러그인 규범이 아니고 실행 인수와도 같지 않다.

## 유일한 설치 대상

- 저장소: `https://github.com/wnduddld0513/dsh-purge-kr`
- **Plugin path (optional): `.`**
- manifest: `package.json`
- 패키지명: `dsh-purge-community`
- Bundle: `cordis.patch.yml`

[메인 플러그인 디렉터리를 채운 신청서 열기](https://github.com/AI-Scarlett/DSH-Store/issues/new?template=plugin-submission.yml&repository=https%3A%2F%2Fgithub.com%2Fwnduddld0513%2Fdsh-purge-kr&plugin-path=.). 전송 전에 경로 칸이 여전히 `.` 인지 확인한다. 폼은 현재 "루트 디렉터리는 비워 둔다"고 안내하지만, 그 `safeRelativeDirectory()` 는 빈 값을 자동 탐지로 처리한다. 다중 플러그인 저장소에서는 그래서 `SUBMISSION_PACKAGE_AMBIGUOUS` 가 발생한다. 명시적 `.` 만이 루트 디렉터리를 뜻한다.

`packages/purge-panel` 은 유지되는 독립 패널 패키지이며 이번 메인 플러그인 설치 대상이 아니다. 발견 모호성을 없애려고 그것을 삭제하거나 기능을 바꾸지 않는다. `tree/master` 를 신뢰할 수 있는 루트 선택으로 쓰지 않는다. 현재 파서에서는 여전히 자동 탐지로 돌아간다.

## 호환성 선언의 의미

`package.json` 은 마켓이 실제로 읽는 `dsh.compatibility.dsh`, `profiles`, `dshReleases` 를 쓴다. Node.js 범위는 기존 `engines.node >=18` 을 유지한다. 여기에 `engines.dsh` 설치 차단을 새로 넣지 않고, 플러그인의 기존 호스트 판정과 실행 동작을 바꾸지 않는다.

| DSH 전체 버전 | 선언 | 근거와 제한 |
| --- | --- | --- |
| 0.2.1-rc.1 / rc.2 / rc.3 | compatible | 기존 지원 버전과 격리 호스트 검증. README 호환 표, 유지보수 기록, CI 참조 |
| 0.2.1-rc.4 | unknown | 같은 버전의 완전한 증거가 없어 인접 버전으로 추론하지 않는다 |
| 0.2.1-rc.5 | compatible | [1.6.62 호스트 소스 검증](maintenance-1.6.62.md)과 [1.6.63 실기 진단 기록](maintenance-1.6.63.md). 작성자의 호스트 호환 선언에 해당한다 |
| 0.2.2-alpha.2 | unknown | 그 버전 검증을 완료하지 않았으므로 버전 범위에 걸린다는 이유로 호환으로 표시하지 않는다 |

범위 서술은 목표 호스트 API 릴리스 라인을 뜻하고, 정확한 버전 상태가 마켓의 호환성 선언이다. 여기의 `compatible` 은 모든 플랫폼, 모든 설치 방식, 모든 기능의 엔드투엔드 인수를 마쳤다는 뜻이 아니다. 이번 고정 Commit 의 버전별 `dshOperations` 기록을 제공하지 않았으므로, 마켓은 설치/기동/제거/롤백 증거를 unknown 으로 유지해야 하고 옛 기록을 새 Commit 으로 자동 이관할 수 없다. Windows Defender 탐지는 별개의 설치 환경 문제이며 메타데이터로 면제할 수 없다.

## 재점검과 경계

- 메타데이터 수정이며 메인 브랜치에 이미 있는 SemVer(현재 1.6.64)를 따르고, 기존 Release 자산을 교체하지 않고, 미배포 설치기 후보 버전을 마켓 신청에 섞지 않는다.
- 마켓은 기본 브랜치의 전체 Commit 을 다시 고정한다. 제출 시 루트 디렉터리를 명시적으로 선택한다. 소스가 바뀌면 같은 버전이라도 새 Commit 으로 재점검해야 한다.
- 두 문제를 없앤 것이 등록 완료를 뜻하지 않는다. 의존성, 권한, 정적 소스, 보호된 호스트 조작은 여전히 마켓 원래 규칙으로 심사하며, 실패하면 구체적 이유를 보존한다.
- 마켓 검사를 통과하려고 기능을 삭제하거나, 권한을 숨기거나, 호환성을 위조하거나, 스캔 결과를 조작하지 않는다. 메인 플러그인은 호스트 유지보수 능력을 포함하므로 사실대로 공개해야 한다. 이런 플러그인을 마켓이 받아들이는지는 그 규칙과 유지보수자가 결정한다.

## 2026-10-30 고정 소스 사전 점검

DSH Store 자체 검사기 커밋 `66e6c77a316450da08648458e25da3438e278c46` 으로 공개된 수정 커밋 `96e88852ec3532e12a11955088a3c2e1d216364e` 에 읽기 전용 사전 점검을 실행했다:

- 경로를 비움: `SUBMISSION_PACKAGE_AMBIGUOUS` 재현. 후보는 `.` 과 `packages/purge-panel`.
- 명시적 `.`: 루트 `package.json` 과 `cordis.patch.yml` 만 읽고 패널 manifest 는 더 이상 읽지 않으며 디렉터리 모호성이 사라진다.
- 마켓의 `inferredCompatibility()` 가 정확한 버전 선언을 읽는다. rc.4/alpha.2 는 unknown 유지, rc.5 는 compatible, 항목별 실행 조작 증거는 비어 있고 passed 를 위조하지 않는다.
- 전체 사전 점검은 Bundle 단계에서 계속 멈춘다: `SUBMISSION_PATCH_AMBIGUOUS: Unsupported Patch inline sequence requires review`. 이것은 또 다른 관문이며, 앞의 두 수정을 전체 사전 점검 통과라고 말할 수 없다.

현재 Bundle 에는 `inject: [systemPrompt, tools]`, 옛 플러그인 `disabled` 마이그레이션 항목, `!!js` 경로 설정이 들어 있다. 마켓의 유한 파서는 더 좁은 문법과 조작만 받는다. 문자열에 인용부호를 붙여도 이후 문법/조작은 따로 심사해야 한다. Bundle 은 원래대로 두고, 설정을 삭제하거나 기능을 낮추거나 마켓 검사기를 조작하지 않는다.
