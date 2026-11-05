# #40: 데스크톱 아카이브 진입점과 디스크 진단 대상 불일치

## 재현된 근본 원인

1.6.31 의 패널 상태는 `gatherState → findAiBase` 로 실제 디렉터리를 찾고, 자체 점검은
`currentHost → normalizeHostBase` 로 현재 기동 스크립트에서 위치를 잡는다. Electron 이
`Resources/app.asar/dsh/.../dsh-desktop-host/lib/index.js` 에서 기동되면 후자는 아카이브 내부 루트를 얻는다.
패치 검사기의 `isFile` 은 `.asar/` 내부 경로를 명시적으로 제외하므로, 같은 설치의 `Resources/app/dsh/...` 에 해당 파일이 이미 있어도 그 안의 필수 대상을
`missing_file` 로 보고한다.

실제 Electron 44.7.0 의 임시 아카이브에서 재현했다: 같은 테스트 파일이 실제 디렉터리에서는 `applied`,
아카이브 경로에서는 `missing_file` 이었다. 이는 코드 결함이 존재함을 증명하지만, 보고자의 스크린샷만으로
각 빨간 항목의 원인이 모두 확인되었다는 뜻은 아니다. #40 은 여전히 DSH 버전, 기동 방식, 대상 경로, 레이아웃 상세를 보강해야 한다.

## 1.6.32 의 처리

- 읽기 전용 `diagnosticHost` 를 추가해 패널 status, 자체 점검, diagnose, CLI diagnose 가 공유한다.
- 선택된 설치의 아카이브 진입점만 같은 Resources 아래의 실제 디렉터리로 해석한다: 우선 `app`,
  그다음 `app.asar.unpacked`. 이미 존재하지만 불완전하거나 읽을 수 없는 우선 디렉터리는 더 건강한 디렉터리로 전환하지 않는다.
- 명시적 실제 경로는 원래 대상을 유지한다; 기동 증거나 명시적 인스턴스 증거가 없으면 unknown 을 반환하고 다른 설치를 스캔하지 않는다.
- `currentHost`, 설치, 적용, 패치 표, 마이그레이션, 프롬프트, 권한 로직은 변경하지 않는다.
- 원본 패치 상세와 계층별 자체 점검은 같은 디스크 대상을 쓴다; 패널의 병합 표시 그룹과 원본 항목 수는 여전히 다르고,
  #76 의 읽기 전용 프리셋 적용 가능성 판단도 유지되므로 두 숫자를 억지로 맞출 수 없다.
- `app.asar` 가 여전히 존재하면 레이아웃 문제를 계속 보고한다; 파일 누락, 실패, 미지, 권한 불일치를 모두 숨기지 않는다.
  디스크에 적용되었다는 것이 현재 프로세스가 그 수정을 로드했다는 증명은 아니다.

## 검증

`npm run test:electron` 에 실제 ASAR 시나리오를 추가하고, Cordis 에 등록된 실제
status/selfcheck/diagnose HTTP handler 로 대상 일치를 검증한다. 중립적인 진단 픽스처를 쓰고 모델을 호출하지 않는다.
실제 누락 항목, 밀봉 아카이브, 의도적으로 설정한 권한 차이가 여전히 오류로 보고되는지도 확인하고, 임시 프롬프트/profile 바이트는 그대로 유지된다.
`test/instance.test.mjs` 는 두 가지 물리 디렉터리, 부분 디렉터리, 미언팩, 권한 거부,
명시적 대상, 인스턴스 증거 없음을 포괄한다. 기존 기본 프리셋, 미지/실패 우선순위, npm 중첩 디렉터리 테스트도 계속 실행한다.

CI 는 macOS 와 Windows 에서 실제 Electron 진단을 실행한다; 세 플랫폼에서 설치기와 패키징 테스트를 계속 수행한다.
실제 데스크톱 UI, 보고자의 macOS 15 설치, 현재 프로세스 로드 상태를 이 테스트가 대신하지는 않는다.

## 점검과 롤백 경계

먼저 DSH 정확한 버전, 설치/기동 방식, 최근 DSH 업데이트 여부를 수집하고, status.ai_base,
selfcheck.host, host-status 의 disk/process 필드와 오류 항목을 대조한다. 공유 전에 사용자 이름과
개인 디렉터리 이름을 가린다; 프롬프트, 자격 증명, 전체 설정, 백업 전체를 업로드하지 않는다.

빨간 표시를 없애려고 권한을 바꾸거나 아카이브를 삭제하거나 패치를 전부 다시 적용하지 않는다.
사용자가 완전히 종료해야 할 때는 이유를 먼저 설명하며 자동 재시작할 수 없다. 이 수정은 사용자 데이터를
마이그레이션하지 않는다; 플러그인 패키지를 롤백하면 옛 진단 동작이 돌아오지만 옛 사용자 설정을 복원해서는 안 된다.

Windows CI 의 전체 Node 테스트는 `--test-concurrency=2` 로 고정해 여러 테스트 파일이 동시에
PowerShell 을 기동할 때의 콜드 스타트 경합을 피한다. GitHub runner 에서 12초 상태 대기 타임아웃과 다른
PowerShell 케이스의 약 26초 소요를 재현한 적이 있다; 같은 소스가 4090 에서는 전체 통과했다.
테스트 동시성만 제한하며, 테스트 목록, 단언, 프로덕션 도우미 타임아웃, 실패 검사는 그대로 둔다.

## 1.6.35: 보고자 보강 후의 독립 근본 원인과 처리

보고자가 macOS 15.7.4, 공식 Desktop 0.2.1-rc.2 nightly, 독립 Homebrew CLI 및 현장 디스크 증거를 보강했다. 1.6.32 의 대상 분열은 사라졌다; 남은 아카이브 상태는 공식 원본이며 가짜 빨간 표시가 아니다. macOS 의 HTTP apply 는 당시 Windows 처럼 종료 대기 도우미를 예약하지 않았으므로 "재시작 안내"가 패키지 교체를 보장하지 못했다.

이제 macOS apply 는 별도 CJS 도우미를 예약하고, 앱 밖 임시 디렉터리에서 실행되며 실제 디스크 fs 를 쓰고, 선택된 `.app/Contents` 안의 모든 프로세스 종료를 기다린다(도우미 자신은 제외). 백업은 같은 파일 시스템의 배타적 하드 링크를 쓰고 inode, 장치, SHA-256 을 대조한 뒤 원래 진입점을 제거한다; 이미 있는 백업을 덮어쓰지 않는다. 대기 중에 아카이브 신원을 검증하고, 종료 후 주 진입점과 알려진 runtime 링크를 다시 검증한다. 쓰기 권한 없음, 잠금 충돌, 아카이브 갱신, 언팩 불완전은 모두 중단하고 원본을 보존하며 권한을 자동 상승시키지 않는다.

- `handoff`: `not_scheduled`, `starting/ready/waiting_for_quit/moving`, `complete`, `failed/expired/helper_stopped/unreadable` 등. 대기는 최대 30분이며, 미지의 옛 잠금은 선점하지 않는다. 옛 완료 기록이 새 아카이브를 만나면 `archive_reappeared` 를, 백업이 사라지면 `backup_missing` 을 반환한다.
- `disk` 와 `process` 는 여전히 독립이다: 패키지 교체 완료가 다음 실행에서 코드가 로드되었다는 증명은 아니다; 독립 CLI 의 process/권한 unknown 도 그대로 남는다.
- Desktop shell 경로는 명시적 대상의 Resources 에서 해석하므로, 터미널 자체가 Web/Node 라서 생기던 #83 가짜 누락이 다시 발생하지 않는다; 대상 파일이 실제로 없을 때 다른 설치로 대체하지 않는다.
- #71 의 패밀리 검출은 현재 DSH_HOME 으로 한정한다: 로컬 프리셋, 각 profile 의 실제 패키지, fallback 패키지, 의존성 선언. 패밀리가 없을 때만 na 이며, 설치가 불완전하면 계속 missing, YAML 이 손상되면 계속 unmatched, 읽기나 의존성 해석이 부족하면 계속 unknown 이다. 패치 표나 기존 처리 기능은 바꾸지 않는다.

### 사용자 조작과 민감정보 제거 진단

먼저 플러그인을 업그레이드한다; 데스크톱 패널에서 "적용"을 누르고 "완전 종료 대기"가 보이면 **⌘Q** 를 누른다. 도우미는 DSH 를 자동으로 열지 않는다. 터미널에서 이미 대조한 같은 설치 경로로 점검할 수 있다:

```sh
PURGE_DSH_CLI='/실제설치/Contents/Resources/app/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js' purge-community host-status --profile desktop
PURGE_DSH_CLI='/실제설치/Contents/Resources/app/dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js' purge-community selfcheck --json --profile desktop
```

shell 진단을 위해 DSH_SURFACE 를 따로 설정할 필요는 없다; 예시 경로를 실제 경로로 쓰지 않는다. 명확한 대상이 없는 bare CLI 가 계속 unknown 을 보고하는 것이 올바른 경계다. `handoff.phase=complete` 후 직접 열어 패널에서 다시 시험한다. 피드백에는 플러그인/DSH/macOS 버전, handoff.phase/detail, disk/process, 남은 빨간 항목만 있으면 되고 경로는 가려도 되며, 프롬프트/키/전체 설정은 보내지 않는다.

### 실패와 롤백

1. 미완료 시 원본 아카이브는 보통 남아 있다. 먼저 phase/detail, 같은 설치의 프로세스 잔존 여부, 언팩 진입점/runtime, 현재 디렉터리 쓰기 권한을 확인한다; 잠금이나 아카이브를 바로 삭제하거나 권한을 전역으로 바꾸지 않는다. 도우미가 failed/expired 된 뒤 원래 문제를 해결하고 사용자가 다시 적용한다; 미지의 옛 잠금은 소유자를 직접 확인해야 한다.
2. 완료 후 다음 실행이 비정상이면 먼저 사용자가 완전히 종료한다. 상태 기록에서 **같은 설치**의 backup 경로와 archive_sha256 을 대조한다; 원래 app.asar 가 존재하지 않아야 하고, 백업이 존재하며 해시가 일치해야 하며, 그다음 백업을 app.asar 로 복원한다. 새 아카이브가 이미 있으면 덮어쓰지 않고 먼저 버전 충돌을 진단한다. 복원 후에도 사용자가 직접 연다.
3. 플러그인 패키지 롤백은 기존 스냅샷 절차를 쓴다; 옛 프롬프트, profile, 권한, 그림 라이브러리 데이터를 되쓰지 않는다. 호스트 아카이브 복구와 플러그인 롤백은 따로 수행한다.

### 추가된 실제 검증

`test/macos-handoff.test.mjs` 는 실제 독립 프로세스를 실행해 수동 종료 대기, 중복 요청, 백업, 아카이브 갱신, 손상된 진입점/runtime, 타임아웃, 손상된 기록, 옛 잠금, 기동 실패, 옛 완료 기록 무효화를 포괄한다.
`scripts/check-macos-handoff.mjs` 는 독립 **Electron.app 44.7.0** 사본으로 실제 ASAR 기동을 수행하고, 적용 후 테스트 앱이 스스로 quit 해 도우미 생존, 백업 해시, 자동 재실행 없음을 확인하고, 명시적으로 두 번째 기동을 해 진입점이 `Resources/app` 임을 확인한다; 격리 설정 해시는 변하지 않는다.
이것이 보고자의 서명, 권한, nightly 빌드를 검증한 것과 같지는 않으며, 여전히 보고자가 위 절차대로 결과를 알려야 한다. Windows 원 도우미 코드는 바꾸지 않았고 Windows Electron 과 전체 설치/롤백 테스트를 계속 실행한다.
