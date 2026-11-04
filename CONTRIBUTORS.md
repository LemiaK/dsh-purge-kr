# 기여자 / Contributors

코드, 문제 재현, 분석, 검증에 기여한 모든 분께 감사한다. 아래는 기여 유형별로 기록하며, 문제 보고를 코드 작성자로 잘못 기재하지 않는다.

| 기여자 | 기여 |
| --- | --- |
| [샤오양 / YuJunZhiXue](https://github.com/YuJunZhiXue) | 원본 dsh-purge 프로젝트 저자. 원본 Git 이력, MIT 라이선스, 서명을 보존한다. |
| [kingcharleslzy-ai](https://github.com/kingcharleslzy-ai) | Purge Community 브랜치 유지, 릴리스, 통합. |
| [luowang-ui](https://github.com/luowang-ui) | [PR #1](https://github.com/kingcharleslzy-ai/dsh-purge/pull/1): 데스크톱 CLI 복구 절차가 비동기 복사를 잘못 쓰던 문제를 고쳐 동기 원자 복사로 바꿨다. |
| [heigit](https://github.com/heigit) | [issue #3](https://github.com/kingcharleslzy-ai/dsh-purge/issues/3): Web/Headless 백업과 업데이트 문제의 재현, 소스 분석, 환경 변수 workaround, 검증 피드백을 제공하고 현재 인스턴스 자체 점검 요구를 보강했다. 대응 수정은 [PR #4](https://github.com/kingcharleslzy-ai/dsh-purge/pull/4) 참고. |
| [OGHong](https://github.com/OGHong) | [issue #5](https://github.com/kingcharleslzy-ai/dsh-purge/issues/5): Electron ASAR 파일 시스템이 원인이 된 자체 점검 양방향 오판을 규명하고 최소 수정과 실행 증거를 제공했다. [#12](https://github.com/kingcharleslzy-ai/dsh-purge/issues/12) 명령 충돌과 [#15](https://github.com/kingcharleslzy-ai/dsh-purge/issues/15) 권한 자체 점검 오탐의 재현, 분석, 정정. |
| [Wangxiaolu0716](https://github.com/Wangxiaolu0716) | [PR #11](https://github.com/kingcharleslzy-ai/dsh-purge/pull/11): Windows 아카이브 패키지 교체 실패 후의 대기 복구 방안과 재현. |
| [wtfsb19](https://github.com/wtfsb19) | [issue #10](https://github.com/kingcharleslzy-ai/dsh-purge/issues/10): Windows 생애주기 장애 분석, 대조 실측, 검증 경계. |
| [MingShi350](https://github.com/MingShi350) | [issue #9](https://github.com/kingcharleslzy-ai/dsh-purge/issues/9): 현대 설정 인터페이스와 legacy shim 충돌의 규명과 검증. |
| [loLollipop / Lollipopdamn](https://github.com/loLollipop) | [PR #27](https://github.com/kingcharleslzy-ai/dsh-purge/pull/27): 진단 오탐, 버전 비교, 상태 스탬프, 파일 점유, 롤백 경로 수정과 회귀 테스트. |
| [youki258 / youki](https://github.com/youki258) | [PR #33](https://github.com/kingcharleslzy-ai/dsh-purge/pull/33): npm 중첩 호스트 자체 점검 오탐의 재현, 디렉터리 정규화 방안, 통계 테스트를 제공했다. |
| [SimonQvQ / Simon](https://github.com/SimonQvQ) | [PR #42](https://github.com/kingcharleslzy-ai/dsh-purge/pull/42): Linux CLI/Web 설치, 사용자 호스트 사본 지원, CachyOS 실기 검증. |
| [alexopenfan-xiaxin / alex.xin](https://github.com/alexopenfan-xiaxin) | [#44](https://github.com/kingcharleslzy-ai/dsh-purge/issues/44) 느린 네트워크 업데이트 실측과 분석; [PR #45](https://github.com/kingcharleslzy-ai/dsh-purge/pull/45) 중복 설정 정리, [PR #46](https://github.com/kingcharleslzy-ai/dsh-purge/pull/46) 감사 소유자 수정 제안, [PR #47](https://github.com/kingcharleslzy-ai/dsh-purge/pull/47) 선택적 미러 다운로드 제안. 통합 버전에서 무결성, 권한, 설치 롤백 인수 검증을 보강했다. |

| [Minervaowl7](https://github.com/Minervaowl7) | [PR #88](https://github.com/kingcharleslzy-ai/dsh-purge/pull/88): 누락 파일 예외와 잔여 유지보수 잠금 수정 제안, 회귀 테스트; #87 / #89 의 Windows 장애 증거. |
| [ShiTan-677](https://github.com/ShiTan-677) | PR #88 논의에서의 macOS 독립 재검토와 누락 파일 예외 버전 규명. |

| [Minggle](https://github.com/Minggle) | [PR #99](https://github.com/kingcharleslzy-ai/dsh-purge/pull/99): 업데이트 프록시, GitHub token 설정 및 UI 기여; 통합 시 요청 격리와 실제 TLS 테스트를 보강했다. |
| [Steooenwolf-666](https://github.com/Steooenwolf-666) / [hans](https://github.com/a320583781-create) | [PR #103](https://github.com/kingcharleslzy-ai/dsh-purge/pull/103): 호스트 기본 스킬 디렉터리 발견 복원과 회귀 테스트. |

서드파티 코드 출처는 [NOTICE.md](NOTICE.md) 를 따로 본다. issue 로 재현과 검증 피드백을 제공하거나 PR 로 코드를 기여할 수 있다.

## 아바타 명단 유지

README 의 아바타는 `scripts/update-contributors.mjs` 가 생성하며, 이 페이지의 프로필 링크와 GitHub contributors API 를 병합하고 `.github/contributors.json` 에 과거 명단을 보존한다. 원저자, 업스트림 커밋터, 수동 감사 기록 모두 보존한다.

- 새 문제 분석/검증 기여자: 위 표에 프로필과 구체적 기여를 추가한다. 병합 후 자동 갱신된다.
- 새 코드 기여자: 매일 예약 작업이 기본 브랜치의 GitHub contributors 데이터에서 보충한다. GitHub 통계는 지연될 수 있다.
- 수동 갱신: Actions → **Update contributor avatars** → **Run workflow**; 로컬에서 `GH_TOKEN` 을 설정한 뒤 `node scripts/update-contributors.mjs` 를 실행해도 된다.
- 오프라인 확인: `node scripts/update-contributors.mjs --check`. README 의 `CONTRIBUTORS:START/END` 블록을 직접 고치지 않는다.

워크플로 예약은 매일 베이징 시간 10:23 에 실행되며(GitHub 스케줄은 지연될 수 있다), 생성된 명단과 README 만 커밋한다. API 이상이나 명단 불완전 시 실패로 종료하고 기존 감사 기록을 비우지 않는다. 과거 서명을 정정하려면 이 페이지와 명단 스냅샷을 함께 확인한다.
