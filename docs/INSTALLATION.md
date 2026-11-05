# 설치, 업그레이드 및 장애 점검

현재 버전 **1.6.78**. 사용자와 설치를 돕는 Agent 를 위한 문서다. 지원 설치기 환경: Linux CLI/Web; macOS Desktop; Windows 11 의 PowerShell 5.1/7. Windows 호스트 패치 및 UI 전체 검수는 설치기 테스트와 분리되며, 설치가 통과했다고 전체 기능이 정상이라고 주장할 수 없다.

## 설치 전

- 사용자 승인을 확인하고 실제 DSH 버전과 앱 경로를 읽고, 먼저 한 번 실행해 profile 초기화를 마친다.
- 기본 데이터 디렉터리는 `~/.dsh` 이다; 옛 Desktop CLI 기본 profile 은 `desktop` 이고, 독립 `@deepseek-ai/dsh` CLI 가 붙은 새 데스크톱 셸과 CLI/Web 설치기 기본값은 `web` 이다. 다른 디렉터리/profile 은 명시적으로 지정해야 하며 다른 인스턴스를 자동으로 고르지 않는다.
- 실행 중인 작업은 보존한다; 설치는 프로세스를 중지하거나 자동 재시작하지 않는다. 사용자가 작업이 끝난 뒤 직접 다시 연다.
- 관리자 권한이나 전역 Node/pnpm 이 필요 없다; Desktop 진입점은 그 앱의 Electron 런타임과 CLI 를 쓴다. 권한 문제가 나오면 먼저 경로를 확인하고, 무작정 권한 상승을 권하지 않는다.

## 새 데스크톱 레이아웃과 업데이트 미러(1.6.75)

Windows 의 `DSH Desktop.exe` 와 옛 `DeepSeek Harness.exe` 는 모두 후보가 될 수 있다; 그래도 패키지 안 CLI 신원을 확인해야 한다. 새 레이아웃은 `@deepseek-ai/dsh/package.json` 의 `bin` 에서 진입점을 읽고, 같은 설치의 `harness-node-entry.mjs`, 번들 pnpm, 잠금 복구 런처를 그대로 쓴다. "pnpm 을 찾을 수 없다"를 피하려고 전역 pnpm 을 설치하거나 다른 DSH 사본을 고르지 않는다. 후보가 여러 개면 `-DshExe` 로 명확히 지정한다. 사용자 정의 profile 은 항상 `-Profile` / `--profile` 로 지정하고, 초기화 정보가 없으면 중단하며 사용자 데이터를 옮겨 추측하지 않는다.

`sealed_host: true` 는 `app.asar` 안에서 호스트를 인식했다는 뜻이며 아직 쓰기 가능한 언팩 디렉터리가 아니다. 진단은 이제 이것을 "호스트 없음"으로 보지 않고, 가상 아카이브 경로를 직접 파일 쓰기에 넘기지도 않는다. 이미 있는 언팩 디렉터리가 손상되었으면 계속 누락이나 읽기 실패로 보고한다.

플러그인의 "업데이트 채널"에는 선택 사항인 HTTPS 미러 접두사를 저장할 수 있다(예: `https://gh-proxy.org/`). 미러는 릴리스 조회, raw 메타데이터, 패키지 전송을 담당한다; GitHub Token 은 미러가 유발한 리다이렉트를 포함해 미러로 보내지 않는다. 프록시와 미러는 동시에 쓸 수 있고 플러그인 업데이트 요청에만 영향을 주며 시스템이나 모델 프록시를 바꾸지 않는다. 미러를 명시적으로 비우면 비활성화되고, 옛 설정에 이 필드가 없으면 `PURGE_GH_MIRROR` 를 계속 지원한다.

**미러는 검증 출처가 아니다**: 설치에는 여전히 GitHub 공식 인터페이스로 받은 릴리스 다이제스트가 필요하고, 옛 릴리스는 필요할 때 공식 SHA256SUMS 를 읽는다. GitHub 연결은 기존 업데이트 프록시를 쓸 수 있다. 공식 검증에 도달할 수 없으면 중단하며, 미러가 스스로 보고한 다이제스트를 받아들이지 않고 TLS 나 SHA256 을 끄지 않는다. 최초 설치 스크립트의 다운로드 경로는 플러그인 내부 업데이트 채널과 별개이므로, 아직 설치되지 않은 플러그인이 그 업데이트 설정을 읽는다고 말할 수 없다.

## 먼저 공식 진입점과 커뮤니티 설치기를 구분한다

- **DSH 공식 방식**: 플러그인 UI 의 설치 확인 대화상자, 또는 `dsh plugin --profile <실제 이름> add <패키지 소스>`. 이것이 profile 의존성과 bundle 을 관리한다; 서드파티 마켓은 목록만 제공하고 설치 동작은 호스트가 수행한다.
- **Purge 커뮤니티 설치기**: 이 저장소의 `scripts/install.sh` / `scripts/install.ps1` 와 bootstrap. 공식 CLI 위에 Release 다운로드/SHA256, 영구 아카이브, 스냅샷, 옛 패키지 마이그레이션, 실패 복구를 더한 것으로 DeepSeek 공식 스크립트가 아니다.
- 첫 설치는 어느 쪽이든 가능하다; 이미 `dsh-purge` 나 분리 패널이 설치되어 있으면 커뮤니티 설치기로 마이그레이션해 진입점 중복을 피한다. 먼저 제거하지 말고, 같은 이름의 npm 패키지도 설치하지 않는다.

공식 출처: [CLI 와 bundle](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.zh.md), [플러그인 마켓](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.zh.md).

## 복사 가능한 명령과 전제

[README 의 설치 절](../README.md#installation)에 다운로드부터 시작하는 macOS, Windows, Linux 명령과 고정 릴리스 TGZ 의 공식 CLI 명령이 있다. 이들은 이 저장소를 clone 할 필요가 없다. 소스 디렉터리가 없는 사용자에게 저장소 내 상대 경로 명령을 붙여 주지 않는다.

macOS 는 기본으로 `/Applications/DeepSeek Harness.app` 를 요구한다. 사용자 지정 설치 위치는 `DSH_APP`(`.app` 을 지정), 사용자 지정 데이터 디렉터리는 `DSH_HOME` 을 쓴다; 두 번 호출할 때 같은 `--profile=실제 이름` 을 넘긴다. Windows 는 `-DshExe`(실제 exe 전체 경로), `-DshHome`, `-Profile`, `-Version` 을 지원한다. 경로가 유일하지 않으면 중단하고 명확히 지정해야 하며, 다른 사본을 추측하지 않는다.  macOS 설치기는 시스템 `plutil` 로 XML 또는 바이너리 plist 를 읽고 `CFBundleExecutable` 이 패키지 안의 유효한 파일 이름인지 요구한다; 누락, 손상, 경로 범위 초과, 심볼릭 링크는 오류를 내며 추측한 실행 파일로 대체하지 않는다. 이름을 바꾼 앱은 `DSH_APP` 으로 명시 선택할 수 있다. 앱 신원은 DSH 호스트 패키지와 CLI 파일로 판단하며 창 이름이나 `app.asar` 만으로 판단하지 않는다. 이는 레이아웃 검증이며 서명이나 배포자 인증을 뜻하지 않는다.

`--dry-run` / `-DryRun` 은 profile 확인, CLI 위치 확인, 릴리스 패키지 다운로드와 SHA256 대조를 수행한다; **pnpm 실행, 마이그레이션, 롤백, 전체 기동 검증은 하지 않는다**. 이 인자를 빼야 정식 설치가 된다. 기본값은 최신 안정 Release 를 읽는다; 이번 릴리스를 고정하려면 shell 은 두 호출 모두에 `--version=1.6.48`, PowerShell 은 두 호출 모두에 `-Version 1.6.48` 을 더한다. 진입 스크립트와 bootstrap 은 여전히 이 저장소 master 에서 오므로, 버전 인자가 모든 다운로드 스크립트를 고정한다고 해석하면 안 된다.

정식 설치 후에는 종료 코드, 반환된 버전, `backup_id`, 대상 profile 의 의존성/bundle 과 패키지 진입점을 확인한다; 이미 실행 중인 프로세스가 옛 코드를 계속 쓰는 것은 설치 실패가 아니다. 프로세스는 건드리지 않고, 사용자가 편할 때 직접 다시 열어 실행 버전을 확인한다.

### Linux CLI / Web

CachyOS x86_64, DSH 0.2.1-rc.2 에서 검증했다. 저장소 안에서 `sh scripts/install.sh --dry-run` 을 실행하고, 출처와 SHA256 을 대조한 뒤 `--dry-run` 을 빼고 설치한다. 기본값은 PATH 의 `node` / `dsh` 와 `web` profile 을 쓴다; `DSH_NODE`, `PURGE_DSH_CLI`, `DSH_HOME`, `--profile=이름` 을 설정할 수 있고, 이미 Linux Electron 데스크톱 프로그램이 있으면 `DSH_APP` 을 명시할 수 있으며 기본 profile 이 그에 따라 `desktop` 으로 바뀐다.

이 브랜치의 미배포 코드를 설치할 때는 먼저 패키징한 뒤 `--archive=/절대경로/패키지.tgz --sha256=예상 다이제스트` 를 쓴다. 로컬 패키지도 패키지 이름, 버전, 저장소 신원을 검증하며 의존성 설치에는 여전히 네트워크나 캐시가 필요하다. 전체 명령은 [README 의 Linux 설치 진입점](../README.md#installation)에 있다.

시스템 npm 디렉터리에 쓸 수 없으면 설치기는 원래 설치를 보존하고 호스트 전체를 사용자 디렉터리로 복사하며, 플러그인 마이그레이션이 성공한 뒤에야 `~/.local/bin/dsh` 를 만들거나 전환한다. 마이그레이션이 실패하면 원래 진입점을 유지한다; 활성화되지 않은 사본은 재시도에 재사용한다. 진입점이 동시에 수정되었으면 중단하고 사용자 명령을 덮어쓰지 않는다. 옛 서비스를 종료하고 이 진입점으로 기동한 뒤 패치를 적용한다; 웹 새로고침으로는 진입점이 바뀌지 않는다. 기존의 무관한 런처는 덮어쓰지 않고, dry run 은 호스트를 복사하지 않으며, `/usr` 권한을 바꾸지 않는다. 시스템 DSH 를 업데이트한 뒤에는 새 시스템 CLI 를 명시적으로 선택해 설치기를 다시 실행해야 새 사본이 만들어진다.

## 설치기 보장과 경계

1. 이 저장소의 안정 GitHub Release 에서만 다운로드하고, 리다이렉트 출처, 다운로드 크기, 대기 시간을 제한한다.
2. SHA256 은 다운로드한 버전 패키지에만 일치하면 되고, 매니페스트의 안정 별칭까지 다운로드되었을 것을 요구하지 않는다; 중복 항목이나 검증 불일치는 중단한다.
3. 정식 설치는 언팩 전에 파일 경로를 검사하고 package name/version/repository 를 대조한 뒤 릴리스 패키지 마이그레이터를 호출한다. dry-run 은 SHA256 검증 후 끝나며 이 설치 단계들을 실행하지 않는다.
4. 마이그레이터는 먼저 스냅샷을 만들고 패키지를 영구 디렉터리에 보관한 뒤 DSH CLI 에 넘겨, 다음 해석이 정리된 임시 파일을 가리키지 않게 한다.
5. 기존 프롬프트, 규칙, 다른 플러그인 설정은 다시 쓰지 않는다; Purge 의 의존성 버전과 활성화 진입점은 갱신되고 profile 잠금 파일은 DSH 패키지 관리자가 유지한다.
6. 종료 코드가 0 이 아니면 실패이며, 임시 다운로드는 정리하고 영구 스냅샷은 보존한다. 자동 apply 나 DSH 재시작은 없다.
7. 언팩 데스크톱의 `app/runtime` 이 없거나 손상되었으면 옛 링크를 보존하고 같은 설치의 runtime 을 가리키는 링크를 만들 수 있다; 작업 중인 다른 대상이나 불완전한 실제 디렉터리는 충돌로 보고한다. Linux 시스템 호스트가 읽기 전용일 때의 사용자 사본/런처 동작은 위 절을 본다. "설치기는 호스트 디렉터리에 절대 쓰지 않는다"고 약속하지 않는다.
8. SHA256 은 Release TGZ 에 대응한다; 진입 스크립트와 bootstrap 은 이 저장소의 HTTPS master 로 다운로드되며 독립 서명 보장은 없다.

## Issue #7: 미러 버전 누락

로그 특징: `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`, 유일한 실패 항목은 `@dsh-ops/bash-win32-x64@<버전>`, 원인은 명확히 `version not present in registry manifest` 이다.

조사 시점에 npm 공식 소스에는 0.2.1 이 있었고 npmmirror 메타데이터에는 이 버전이 없었다. 이 상태는 변할 수 있으므로 미러 누락을 영구 가정하지 않는다; 설치기는 이 오류를 만날 때마다 실시간으로 공식 메타데이터를 대조한다.

복구 범위는 매우 좁다: 현재 profile 의 유효 소스를 읽고, 해당 scope 또는 기본 소스가 명확히 `https://registry.npmmirror.com/` 이며 공식 응답의 패키지 이름, 버전, 배포 시각, SHA512, tarball 출처가 완전할 때만 이번 CLI 에 `--config.@dsh-ops:registry=https://registry.npmjs.org/` 를 추가해 한 번 재시도한다. 다른 의존성은 원래 소스를 유지한다; `.npmrc` 에 쓰지 않는다. pnpm 은 여전히 배포 시각, 무결성, 신뢰 정책을 스스로 검사하므로 공식에 패키지가 있다고 반드시 설치가 허용되는 것은 아니다.

사설/미지 소스는 폴백하지 않는다; 실제 "배포 시각 미달", integrity/trust 오류도 폴백하지 않는다; 공식 조회가 실패하거나 재시도가 실패하면 중단하고 계속 추측하지 않는다.

마켓 JSON 최초 설치는 DSH 의 패키지 관리자를 먼저 실행하며 플러그인이 아직 로드되지 않아 플러그인 내부 수정을 쓸 수 없다. DSH 설치 대화상자에서 npm 공식 소스를 골라 재시도하거나 이 버전의 독립 설치기를 쓴다. tarball 만 바꿔도 호스트 의존성 검증 단계에서 실패할 수 있다. 우리가 공식 DSH 설치기를 수정했다고 주장하지 않는다.

`HEAD https://github.com/... UND_ERR_DESTROYED` 는 GitHub 네트워크 문제다. 민감정보를 제거한 전체 로그를 보존해 오류를 구분한다; npm 소스를 바꾸는 것이 GitHub 연결 문제 해결을 보장하지 않는다.

## 시작 경고: Cannot find package 'dsh-purge'

호스트 기동이나 패널이 다음과 같이 보고한다:

```
dsh: warning: 1 entry did not activate
dsh-purge (dsh-purge): failed to import
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'dsh-purge' imported from <profile>
```

이 오류는 현재 profile 이 어떤 진입점 참조를 해석하지 못했다는 뜻이며, **오류 문구만으로 중복 설정이라고 단정할 수 없다**. 아카이브된 업스트림 README 의 옛 독립 패키지 예시를 그대로 베끼면 옛 패키지 이름을 가리키는 수동 진입점이 남을 수 있고, 의존성이 설치되지 않았거나, 링크가 끊겼거나, profile 을 잘못 골랐거나, bundle 이 활성화되지 않았을 때도 가져오기 실패가 난다.

다음 순서로 점검하고, 제거 후 재설치하거나 이름 접두사로 일괄 삭제하지 않는다:

1. 오류를 낸 프로세스의 DSH, home, profile, 실제 활성화된 bundle 을 확인한다. 그 profile 의 의존성, 실제 패키지의 `package.json`, 링크 대상이 존재하는지 본다. 커뮤니티 패키지 이름은 `dsh-purge-community` 이다; 역사적 의존성 별칭 `dsh-purge` 가 실제로 커뮤니티 패키지로 해석된다면 그것도 지원되므로, **별칭이라는 이유만으로 삭제할 수 없다**.
2. 수정 전에 그 profile 의 `cordis.patch.yml`, `package.json`, 기존 잠금 파일을 백업한다. 전체 오류, 진입점 ID, 해석 경로를 보존해 대조에 쓰고, 로그를 공유할 때는 민감정보를 제거한다.
3. bundle 이 이미 해당 진입점을 제공하는데 profile 이 같은 진입점을 수동으로 삽입한 것이 확인된 경우에만 이 중복 항목 하나를 마이그레이션한다. 원래 항목의 **모든 `config`(프롬프트, 미지 필드, 명시적 false/빈 문자열 포함)** 를 같은 ID 의 profile 설정 오버라이드로 병합한다; 같은 이름의 필드가 충돌하면 사용자에게 어느 값을 남길지 먼저 묻고 기본값으로 덮어쓰지 않는다. 원래 항목에 의미를 확인할 수 없는 진입점 필드가 남아 있으면 먼저 보존하고 보고하며, 임의로 버리지 않는다.
4. 설정 보존을 확인한 뒤, 중복이라고 확인된 삽입 항목만 제거한다. 하나의 `insert` 컨테이너에 다른 플러그인이 있을 수 있으므로 반드시 보존하고, 컨테이너가 비었을 때만 빈 컨테이너를 제거할 수 있다. `dsh-purge-redteam*` 등은 bundle 의 정당한 진입점이며 **접두사로 삭제할 수 없고**, 이미 설치된 패키지 안의 bundle 원본 파일을 직접 고치지 않는다.
5. 진입점이 bundle 에만 있다면 profile 에 같은 `id` 의 설정 오버라이드를 추가하고 `insert` 나 `name` 을 다시 넣지 않는다. 아래는 구조 예시일 뿐이다; 실제 마이그레이션은 사용자의 원래 전체 설정을 써야 하며 예시 값을 그대로 복사해 덮어쓰지 않는다:

```yaml
- id: dsh-purge
  config:
    autoUpdateOnStart: false
```

6. 최종 유효 진입점, 의존성 해석, 보존된 설정을 확인한 뒤에는 사용자가 직접 완전히 종료하고 다시 열 시점을 정하며, 자동 재시작하지 않는다. 여전히 실패하면 전체 예외를 기준으로 의존성, 링크, profile, 서비스 고장을 구분하고, **중복 진입점이 더 있다고 단정해 계속 삭제하지 않는다**. 모호하면 마이그레이션을 중단하고 백업과 현장을 보존한다.

설치기는 안전하게 판단할 수 없는 수동 진입점을 만나면 여전히 마이그레이션을 거부하고 설정을 보존한다; 이 문서가 설정 자동 삭제 로직을 추가하지는 않는다. 더 자세한 설정 병합 설명은 [유지보수 안내](maintenance-issue-53.md) 를 본다.

## 실패, 백업, 롤백

- 실패 단계, DSH/플러그인 버전, profile, 다운로드 소스, backup_id 를 기록한다; 사용자 이름, 사설 주소, token 은 가린다.
- 다운로드/검증 실패는 마이그레이션을 수행하지 않았으므로 설치 변경이 없어야 한다. 마이그레이션 실패는 스냅샷을 보존하며 백업을 먼저 지울 수 없다.
- `purge-community backup` 으로 명시 백업하고, `purge-community rollback <id>` 는 스냅샷을 검증한 뒤 플러그인 코드와 진입점을 롤백하며 현재 사용자 내용을 보존한다. 원래 잠금 파일은 대조용으로 스냅샷에 보관하고 다른 플러그인의 새 의존성을 무작정 덮어쓰지 않는다.
- 실패로 플러그인이 기동되지 않으면 검증된 릴리스 패키지의 `bin/community.js rollback <id>` 를 명확한 현재 CLI/home/profile 과 함께 쓸 수 있다. [유지보수 문서](MAINTENANCE.md)를 본다.
- 일반적인 "수리" 동작은 금지한다: 잠금 파일 전부 삭제, 전역 캐시 비우기, minimumReleaseAge/trust/integrity 끄기, 전역 소스 교체, 자동 재시작, 호스트 패치 자동 재적용.

<a id="cli-rollback"></a>
## CLI 롤백과 명령 위치 확인

롤백은 스냅샷에 있는 기존 플러그인 버전을 복원하는 것이지 제거가 아니다. 최초 설치 전의 빈 스냅샷에는 복원할 Purge 패키지가 없어 CLI 가 명확히 오류를 낸다; 이것을 "클릭 한 번으로 미설치 상태로 복귀"라고 쓰면 안 된다. 기존 버전의 업그레이드/마이그레이션 스냅샷만 옛 버전 복원에 쓴다.

패널이 있으면 "Purge → 상태 → 로컬 백업"의 백업을 우선 고르고, 기록이 이번 설치에 해당하는지 확인한다. 패널을 쓸 수 없으면 아래 방식으로 현재 profile 에 설치된 CLI 를 실행한다. `purge-community` 는 profile 내부 bin 이며 전역 PATH 에 있다고 보장되지 않는다; **명령을 보충하려고 `npm install -g` 를 하지 않는다**.

CLI/Web(macOS, Linux; Node ≥18 과 해당 인스턴스의 `dsh` 명령이 이미 있음):

```sh
export DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
export DSH_PROFILE="${DSH_PROFILE:-web}"
export PURGE_DSH_CLI="$(command -v dsh)"
node "$DSH_HOME/profiles/$DSH_PROFILE/node_modules/dsh-purge-community/bin/community.js" status
```

`status` 는 유지보수 상태의 `backups` 배열을 반환한다. 실제로 존재하는 `id` 를 고른 뒤 같은 명령 끝의 `status` 를 `rollback "실제 백업 ID"` 로 바꾼다; 예시나 다른 인스턴스의 ID 를 쓰지 않는다. 롤백 후 버전과 bundle 을 확인하고, 롤백 후 새로 추가된 사용자 설정은 보존한다; 옛 프로세스는 여전히 사용자가 직접 다시 열어야 한다.

macOS Desktop(아래 예시는 실행 파일 이름이 여전히 `DeepSeek Harness` 인 설치에 해당한다; 사용자 지정 앱 경로는 먼저 `DSH_APP` 을 바꾸고, 이름을 바꾼 실행 파일은 그 앱 plist 에서 이미 확인한 이름을 써야 하며 다른 설치를 추측하면 안 된다):

```sh
export DSH_APP="${DSH_APP:-/Applications/DeepSeek Harness.app}"
export DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
export DSH_PROFILE="${DSH_PROFILE:-desktop}"
ELECTRON_RUN_AS_NODE=1 "$DSH_APP/Contents/MacOS/DeepSeek Harness" "$DSH_HOME/profiles/$DSH_PROFILE/node_modules/dsh-purge-community/bin/community.js" status
```

해당 인스턴스의 백업을 고른 뒤 끝의 `status` 를 `rollback "실제 백업 ID"` 로 바꾼다. 여기서는 Electron 의 Node 모드로 유지보수 명령을 실행하며 DSH 창을 열거나 재시작하지 않는다. 원래 설치가 손상되었다면 먼저 README 대로 릴리스 패키지를 내려받아 검증하고, 보존한 복구 디렉터리에 언팩한 뒤 그 안의 `bin/community.js` 로 위 플러그인 스크립트 경로를 교체한다; 다른 home 을 가리키지 않는다.

Windows Desktop: 설치기 오류 안내나 실제 설치 위치로 exe 를 먼저 확정하고, 아래에서는 첫 줄의 실제 경로만 채우면 된다. 여기서는 명확한 프로세스 대기를 쓰며, GUI 서브시스템 프로그램의 완료 여부를 `& exe` 뒤의 `$LASTEXITCODE` 로 판단할 수 없다.

```powershell
$DshExe = Read-Host '현재 DSH exe 의 전체 경로를 입력한다(따옴표 불필요)'
if (-not (Test-Path -LiteralPath $DshExe -PathType Leaf)) { throw 'DSH exe 가 없다' }
$env:DSH_HOME = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$env:DSH_PROFILE = if ($env:DSH_PROFILE) { $env:DSH_PROFILE } else { 'desktop' }
$PurgeCli = Join-Path $env:DSH_HOME "profiles\$env:DSH_PROFILE\node_modules\dsh-purge-community\bin\community.js"
if (-not (Test-Path -LiteralPath $PurgeCli)) { throw '현재 profile 에서 커뮤니티판 CLI 를 찾을 수 없다; 안내대로 검증된 복구 패키지를 쓴다' }
$PurgeLog = Join-Path $env:TEMP ('purge-status-' + [guid]::NewGuid().ToString('N'))
$PreviousElectronMode = $env:ELECTRON_RUN_AS_NODE
try {
    $env:ELECTRON_RUN_AS_NODE = '1'
    $p = Start-Process -FilePath $DshExe -ArgumentList @(('"' + $PurgeCli + '"'), 'status') -Wait -PassThru -NoNewWindow -RedirectStandardOutput "$PurgeLog.out" -RedirectStandardError "$PurgeLog.err"
    Get-Content -LiteralPath "$PurgeLog.out", "$PurgeLog.err" -Encoding UTF8
    if ($p.ExitCode -ne 0) { throw "유지보수 명령 실패: $($p.ExitCode)" }
} finally { $env:ELECTRON_RUN_AS_NODE = $PreviousElectronMode }
```

출력에서 백업 ID 를 고르고 `-ArgumentList` 의 `'status'` 를 `'rollback', '실제 백업 ID'` 로 바꿔 같은 블록을 실행한다. 출력에 있는 이 인스턴스의 백업 ID 만 받아들이고 예시를 그대로 베끼지 않는다. CLI 가 손상되었으면 검증된 복구 패키지의 `bin/community.js` 를 쓰되 현재 인스턴스의 exe, home, profile 을 그대로 따른다. 사용자 대신 재시작하지 않는다.

## 개발 검수

`node --test test/install-registry.test.mjs test/bootstrap-install.test.mjs` 는 정상 설치, 정확한 오류 재시도, 사설 소스, 혼합 오류, 공식 메타데이터 누락, 네트워크 실패, SHA256 안정 별칭, 임시 경로, 자식 프로세스를 포괄한다. `test/install-windows.ps1` 은 Windows PowerShell 5.1 과 PowerShell 7 에서 진입 인자, 경로, 종료 상태, 환경 복원을 검증한다. CI 는 Linux/macOS/Windows 에서 설치기 테스트를 실행한다. 실제 DSH 격리 profile 의 마이그레이션/롤백은 따로 기록한다; 이 테스트들은 Windows DSH UI/호스트 패치 전체 검수를 대신하지 못한다.

## Windows 과거 실제 런타임 회귀

공식 Desktop 은 GUI 서브시스템 exe 이므로 PowerShell call operator 로는 설치 종료를 증명할 수 없다. 설치기는 Start-Process 로 프로세스를 기다리고 실제 종료 코드와 UTF-8 출력을 읽은 뒤에야 임시 스크립트를 삭제한다. CI 에는 bootstrap 을 지연해 읽는 GUI 서브시스템 테스트를 추가해 가짜 성공과 MODULE_NOT_FOUND 재발을 막는다. 프로덕션 설치에는 .NET 컴파일러가 필요 없다; GUI 테스트 프로그램은 개발/CI 에서만 컴파일한다.

과거 버전은 실제 Windows 11 프로페셔널(build 26300)에서 서명이 유효한 공식 Desktop 0.2.1-rc.2 런타임, 독립 앱 사본, DSH_HOME 과 user-data-dir 로 다운로드 검증, 설치, 스냅샷, 롤백, 설정 보존을 검증했고 PowerShell 5.1/7 회귀도 통과했다. 이 증거는 로그인, 전체 UI, 호스트 패치 전체가 검수되었다는 뜻이 아니다. 자세한 내용은 [1.6.10 기록](releases/1.6.10.md)을 본다.

1.6.14 는 macOS CLI 실행 비트 유실을 수정하고 읽기 전용 host-status 를 추가했다. 현재 버전의 테스트 범위는 [1.6.14 검수 기록](releases/1.6.14.md)을 본다; 과거 Windows 데스크톱 검수를 이 버전에서 전체 UI 검수를 다시 수행한 것으로 쓰면 안 된다.

## 1.6.29: 롤백과 네트워크

패널 롤백은 아카이브 설치로 진행하고 새 프로세스 로드를 검증하며, 실패하면 이번 작업 이전의 의존성 그래프를 복구한다. 업데이트 프록시는 플러그인 요청에만 작용하고 시스템을 바꾸지 않는다; 토큰은 GitHub API 로만 보낸다. 환경 변수는 실제 호스트 프로세스가 상속해야 한다. 옛 버전의 손상된 link 는 검증된 새 릴리스 패키지로 독립 진입점을 통해 복구한다; 사용자 설정이나 전역 캐시를 삭제하지 않는다. 제한과 실측 방법은 [유지보수 안내](maintenance-issues-34-35.md)를 본다.

## 1.6.39: 느린 네트워크 업데이트와 감사 소유자

아카이브 예산은 `PURGE_DOWNLOAD_TIMEOUT_MS` 를 쓴다(기본 180000, 범위 30000–900000); 선택 사항인 `PURGE_GH_MIRROR` 는 커뮤니티 TGZ 만 전송하며 공식 다이제스트를 쓸 수 없으면 중단한다. 컨테이너 root home 은 서비스 UID/GID 를 명확히 해야 한다; 권한을 넓히거나 전역 프록시를 바꾸지 않는다. 전체 절차, 변수, 테스트 경계는 [유지보수 안내](maintenance-issues-44-47.md)를 본다. 자동 재시작은 없다.

## #52: 다운로드 실패와 대체 경로

새 독립 설치기는 `[download] stage=archive host=github.com transport=fetch attempt=1/3 code=…` 를 보고한다. 최대 두 번의 fetch 와 한 번의 시스템 curl 을 쓰며, 출처·인증서·SHA256 기준은 그 때문에 완화되지 않는다. 먼저 진입 스크립트를 다시 내려받아 dry-run 을 실행하고, 실패 단계와 오류 코드만 보존하면 된다; 프록시 암호, 전체 환경 변수, 서명된 다운로드 URL 을 붙여 넣지 않는다. 자세한 내용은 [다운로드 진단](maintenance-issue-52.md)을 본다.

## 1.6.41: 업데이트 상태 대조

실행 버전과 현재 profile 의 디스크 버전을 따로 대조한다; 옛 pendingVersion 은 현재 설치를 뜻하지 않는다. 미지 버전이나 읽기 실패는 계속 경고하고, 설치 실패가 성공 점검으로 가려지지 않는다. 옛 버전이 이미 멈춰 있으면 먼저 새 버전을 수동 설치하고 사용자가 직접 한 번 종료 후 재실행한다; 설정을 삭제하거나 업데이트 스위치를 바꾸거나 자동 재시작하지 않는다. 자세한 내용은 [상태 마이그레이션과 테스트 안내](maintenance-update-state.md)를 본다.

<a id="isolated-acceptance"></a>
## 설치 명령의 격리 검수(2026-10-23)

PR #78 의 후보 패키지는 실제 CLI 생애주기 검수 다섯 가지를 추가했다: 공식 최초 설치, 커뮤니티 부트스트래퍼 최초 설치, 원본 마이그레이션, 커뮤니티판 업그레이드, 옛 별칭 업그레이드; 각각 롤백, 재업그레이드, 실패 복구, 사용자 후속 수정 보존을 계속 테스트한다. 실행 방식, 후보 패키지 다이제스트, 미포괄 범위는 [PR #78 설치 무결성 기록](pr78-runtime-integrity.md)을 본다. 이 결과는 마켓 UI, 콜드 캐시 다운로드, 호스트 기능 검수를 대신하지 못하며, 해당 PR 의 미해결 대상 식별 문제도 없애지 않는다.

유지보수자는 `scripts/check-install-instructions-runtime.mjs` 로 이 문서의 설치 규약을 검증한다. 명시적 테스트 런타임, 같은 사본의 공식 CLI, 옛 버전 아카이브, 검증된 릴리스 아카이브, 테스트 루트 디렉터리를 요구한다; macOS 테스트 런타임으로 정식 앱을 받지 않는다.

```sh
node scripts/check-install-instructions-runtime.mjs "$TEST_RUNTIME" "$TEST_DSH_CLI" "$LEGACY_TGZ" "$RELEASE_TGZ" "$TEST_FIXTURE_ROOT"
```

이것은 **개발 검수 명령**이며 변수는 테스트 리소스의 실제 경로여야 하고 사용자 설치 명령이 아니다. Windows 는 독립 Desktop 사본을 쓰고 루트 디렉터리에 `.purge-install-test-fixture` 표식이 있어야 한다; 테스트는 데스크톱 창을 띄우지 않는다. macOS 는 먼저 `node scripts/prepare-install-cli-fixture.mjs "/테스트소스/Contents"` 로 명령줄 사본을 만들고 출력된 경로를 쓴다. 소스는 이미 준비된 테스트 호스트여야 하며, 정식 앱을 언팩하지 않는다.

macOS 는 최상위 `Info.plist` 를 복사하지 않고 `.app` 경로를 만들지 않으며 Finder, `open`, LaunchServices 로 기동하지 않는다; 새로 만든 테스트 실행 파일에만 독립 식별자를 가진 로컬 개발 서명을 쓰고 정식 앱이나 시스템 보안 정책을 바꾸지 않는다. 검수 스크립트는 운영체제 샌드박스로 `/Applications`, 기본 `.dsh`, DSH 의 Application Support 와 로그 디렉터리에 대한 쓰기를 막고 모든 설치 자식 프로세스가 그 제한을 상속한다. "정식 런타임 읽기 전용" 옵션으로 사용자의 DSH 실행을 대체할 수 없다. 테스트가 시스템에 차단되면 테스트 사본 점검을 중단해야 하며, 정식 앱의 격리 속성을 제거하거나 정식 앱을 재서명하거나 사용자에게 재설치를 요구하지 않는다.

이번 실제 검수: macOS / Windows 11, Electron 44.7.0, DSH CLI 0.2.1-rc.2, 커뮤니티판 1.6.47, 옛 패키지 1.1.71. 두 플랫폼에서 공식 CLI 최초 설치, 내려받은 커뮤니티 설치기의 dry-run 과 정식 설치, 옛 패키지 마이그레이션, 스냅샷 목록과 롤백을 수행하고 패키지 버전, bundle, 마이그레이션 전후 설정 내용을 대조했으며, 롤백이 설치 후 추가된 사용자 설정을 보존하는지 검증했다. 각 시나리오는 새로 만든 `DSH_HOME` 과 CLI 가 초기화할 수 있는 `web` profile 을 쓴다; 이는 Desktop 이 가진 CLI/런타임과 설치기 경로를 검증한 것으로 **이번 라운드에서 데스크톱 로그인, 마켓 클릭 흐름, 호스트 패치 기능을 테스트했다는 뜻이 아니다**. 실제 사용자의 Desktop profile 은 여전히 `desktop` 이므로 검수용 profile 을 그대로 베끼지 않는다.

### 앱 위치 지정 경계(PR #78)

명확히 지정한 `DSH_APP` / `DSH_EXE` 대상 검증이 실패하면 즉시 중단하며 자동으로 다른 앱으로 바꾸지 않는다. 유지보수 코드는 마운트 볼륨, 작업 디렉터리, 임의 인자의 상위 디렉터리를 순회하지 않는다; 사용자 지정 설치는 실제 경로를 제공한다. 자동 탐색을 명시적으로 요청한 경우에만 알려진 기본 위치와 시스템 등록을 조회할 수 있지만, 유효한 대상이 여러 개면 사용자가 선택해야 한다.

아키텍처별 런타임은 현재 실행 프로세스의 `process.arch` 로 선택하고 아키텍처를 넘겨 추측하지 않는다. 공식 CLI 는 `app/runtime/primary-runtime/...` 을 요구하므로 새 링크는 유효한 아키텍처 하위 디렉터리를 직접 가리킨다. 이미 있는 실제 디렉터리나 다른 유효 디렉터리를 가리키는 링크는 보존한다; 충돌은 명확히 오류로 내고 자동으로 덮어쓰지 않는다. 실측 범위와 재현 절차는 [PR #78 검수 기록](pr78-runtime-integrity.md)을 본다.
