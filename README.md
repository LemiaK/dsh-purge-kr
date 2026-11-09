<div align="center">

# dsh-purge Community

**AI가 학습과 스스로 수행하는 실험에 집중하도록 돕습니다.**

DeepSeek Harness용 자체 호스팅 제어 도구(흔히 "탈옥" 플러그인이라고 부릅니다) · 호스트 패치 86개 · 25계층 상태 자체 점검 · 사이드바 전체를 쓰는 페이지 설정

[![Release](https://img.shields.io/github/v/release/wnduddld0513/dsh-purge-kr?label=release)](https://github.com/wnduddld0513/dsh-purge-kr/releases)
[![Checks](https://github.com/wnduddld0513/dsh-purge-kr/actions/workflows/community.yml/badge.svg)](https://github.com/wnduddld0513/dsh-purge-kr/actions/workflows/community.yml)

현재 버전 **1.6.86** · **DSH Desktop 0.2.2-rc.1** 대응 (0.2.1-rc.1 / rc.2 / rc.3 / rc.5 도 같은 방식으로 통과합니다) · [English](docs/README.en.md)

1.6.86은 되감기 메뉴를 화면 안에 유지하고, Web 전용 호스트에서 패키지 교체를 "해당 없음"으로 표시해 잘못된 경고를 내지 않으며, 호환 수준(아카이브 확인됨, 커널만 검증됨, 미확인, 알 수 없는 값, 읽기 실패)을 구분하고, 마켓에 H3 Video 0.4.0과 0.5.0 항목을 추가했습니다. [릴리스 노트](docs/releases/1.6.86.md).

**원본 프로젝트와 작성자**: [샤오양(xiaoyang) / YuJunZhiXue의 dsh-purge](https://github.com/YuJunZhiXue/dsh-purge)를 기반으로 독립적으로 유지보수합니다. 원본 저장소는 복구되었습니다. 원작자의 서명, 저작권, MIT 라이선스는 그대로 보존합니다. 이 저장소는 커뮤니티판을 유지하며, 원작자의 공식 배포판이 아닙니다.

</div>

---

## 함께 쓰기: 로컬 이미지 생성 (Qwen Studio)

탈옥을 적용한 뒤 가장 직접적으로 쓸 수 있는 방법은 이미지 생성을 내 컴퓨터로 옮기는 것입니다. 웹 페이지도, 멤버십도 필요 없고 프롬프트가 다른 사람의 서버로 전송되지 않습니다.

함께 쓰는 플러그인 **Qwen Studio**(`dsh-qwen-studio`)가 Qwen Image 2.1을 DSH에 연결합니다:

- **Apple Silicon Mac**: MLX / MFLUX 로컬 추론을 사용합니다. 모델은 사용하는 동안에만 로드하고 유휴 상태에서는 해제합니다.
- **Windows / Linux + NVIDIA**: 직접 만든 GPU 게이트웨이(ComfyUI 또는 vLLM-Omni 프로토콜)에 연결합니다. 필요할 때 SSH로 실행하는 방법도 지원합니다.
- 참조 이미지 편집(이미지를 보면서 스타일을 바꾸거나 소재를 교체), LoRA, ControlNet, 마스크, 프리셋 묶음, 갤러리, 일괄 작업을 지원합니다.
- 설치한 뒤 세션에서 "그림 그려 줘…" 또는 "이걸 수채화로 바꿔 줘"라고 말하면 에이전트가 `qwen_generate_image`를 호출하고 대화 안에 이미지를 반환합니다.

**함께 쓸 때의 효과**: 탈옥이 에이전트의 "그려도 될까요?" 반복 확인을 없애고, 이미지 플러그인이 실제로 그림을 만들며, 전체 과정이 내 컴퓨터 안에서 끝납니다.

**저장소**: [kingcharleslzy-ai/dsh-qwen-studio](https://github.com/kingcharleslzy-ai/dsh-qwen-studio) · **내려받기**: [최신 릴리스](https://github.com/kingcharleslzy-ai/dsh-qwen-studio/releases/latest) · **설정과 하드웨어 자체 점검**: [docs/SETUP.md](https://github.com/kingcharleslzy-ai/dsh-qwen-studio/blob/main/docs/SETUP.md) (이 컴퓨터에서 실행되는지 먼저 확인하세요)

## 무엇인가요

dsh-purge Community는 내 컴퓨터에서 실행되는 Harness 부가 기능입니다. 일상에서 주의를 가장 많이 소모하는 몇 가지를 한곳에 모았습니다:

- **상태를 명확하게 확인**: 설치, 패치, 주입이 실제로 준비되었는지 명령 하나 또는 패널 한 화면으로 판단합니다.
- **반복 횟수 감소**: 반복되는 확인과 중단을 설정 하나로 정리합니다.
- **언제든 되돌리기**: 적용, 롤백, 켜고 끄기는 모두 기록을 남기며, 작업 전에 자동으로 스냅샷을 만듭니다.
- **간편한 실험**: 프롬프트, 규칙, 프리셋을 한곳에서 관리하고 잘못 수정한 내용을 되돌립니다.

목표는 단순합니다. **어시스턴트가 학습과 스스로 수행하는 실험에 더 일관되게 협조하도록** 만들어, 매 단계마다 멈추고 묻지 않게 하는 것입니다.

커뮤니티에서는 보통 "탈옥" 또는 "무제한 모드" 플러그인이라고 부릅니다. 상호작용 계층의 마찰을 낮춰 에이전트가 작업을 끊김 없이 수행한다는 뜻입니다. 모델 자체를 대체하지도, 하려는 일을 바꾸지도 않습니다.

### 내려받을 때 `fetch failed`가 표시되나요?

1.6.39부터 독립 설치기는 실패한 단계와 오류 코드를 표시하고, 정해진 횟수만큼 재시도한 뒤 시스템 curl로 전환합니다. 두 경로 모두 출처, 인증서, SHA256 검증을 그대로 유지합니다. 설치 스크립트를 다시 내려받아 dry-run을 실행해 보시고, 그래도 실패하면 민감정보를 제거한 진단 줄만 보내 주세요. 자세한 내용은 [내려받기 문제 해결](docs/maintenance-issue-52.md)을 보세요. 프록시를 변경하지 않고 DSH를 재시작하지도 않습니다.

### 프리셋마다 프롬프트를 따로 유지합니다

1.6.40에서 `excludePresets`를 추가했습니다. 기본값은 빈 목록이므로 기존 동작은 그대로입니다. `roleplay`, `minimal` 같은 프리셋을 Purge 프롬프트 주입에서 제외하면서도 명령, 패널, 도구는 계속 사용할 수 있습니다. 프리셋 전환, 병렬 세션, 하위 에이전트는 각자 판단하며, 호스트 폴백도 이 제외를 따릅니다. 설정 예시, 업그레이드 절차, 경계는 [프리셋별 제외](docs/maintenance-issue-53.md)를 보세요. 전역 호스트 패치를 되돌리는 것은 아닙니다.

## 설계 원칙

| 원칙 | 의미 |
| --- | --- |
| 로컬 우선 | 모든 로직은 로컬에서 실행됩니다. 클라우드 계정을 변경하지 않고 프롬프트나 설정을 업로드하지 않습니다 |
| 가시성 | 모든 동작에 상태와 근거가 있습니다. "아마 적용되었을 것" 같은 추측에 의존하지 않습니다 |
| 되돌릴 수 있음 | 적용 / 설치 / 롤백 전에 자동 스냅샷을 만들고 원본 파일과 검증 목록을 보관합니다 |
| 대신 판단하지 않음 | 마찰만 줄이고 목표는 바꾸지 않습니다. 무엇이 변경되고 켜지는지는 사용자가 확인합니다 |

## 언제 사용하나요

로컬 학습, 개인 프로젝트, 자동화 실험, 유지보수 작업에 사용합니다. 내가 소유했거나 허가를 받은 환경에서 사용하세요. 다른 사람의 시스템이 관련되면 먼저 허가를 받으시기 바랍니다.

## 1.6.39 업데이트

독립 설치기가 `fetch failed`만 표시하던 문제를 수정했습니다. 이제 단계별 진단, 정해진 횟수의 재시도, 시스템 curl 폴백 내려받기를 제공하면서도 공식 출처, 인증서, SHA256 검증은 엄격하게 유지합니다. 내려받기가 실패하면 기존 설치를 그대로 둡니다. [릴리스 노트](docs/releases/1.6.48.md) · [설정과 검수](docs/maintenance-issue-52.md)

<a id="installation"></a>
## 설치

### git에서 바로 설치 (권장, 항상 최신 커밋)

```sh
dsh plugin --profile <profile> add "https://github.com/wnduddld0513/dsh-purge-kr.git"
```

저장소를 클론해 현재 `master` 끝을 설치하므로, 인덱스 갱신을 기다리지 않고 최신 릴리스를 항상 받습니다. 빌드된 `client.js`가 커밋되어 있어 로컬에서 컴파일하지 않습니다. `<profile>`은 실제로 기동하는 profile로 바꾸세요(데스크톱 앱은 `desktop`, CLI/Web은 `web`). 그다음 DSH를 재시작하고 Purge 패널을 열어 **「적용」**을 누른 뒤 한 번 더 재시작합니다.

재현 가능한 버전이 필요하면 고정 릴리스 tarball(아래 방법 2)을 설치하거나, 로컬 체크아웃을 `dsh plugin --profile <profile> add /absolute/path/to/dsh-purge-community`로 설치하세요.

**플러그인 설치는 DSH 공식 진입점이 담당합니다. 이 저장소는 아래 커뮤니티 설치기를 유지하며, DeepSeek 공식 스크립트가 아닙니다.** 최초 설치는 공식 UI나 CLI를 사용하세요. 이미 `dsh-purge`나 옛 독립 패널을 설치했다면 먼저 제거하지 말고 커뮤니티 설치기로 그 자리에서 마이그레이션하세요. 설치, 호스트 패치 적용, 직접 재시작은 서로 다른 세 가지 동작입니다.

### 방법 1: DSH 공식 UI (최초 설치)

1. DSH를 먼저 열어 초기화를 마칩니다. 현재 공식 문서에 따라 "플러그인"으로 이동해 "실험적 플러그인" 옆의 "더 보기"를 누르고 "사용자 정의 플러그인 마켓"을 켭니다. 그다음 "탐색 → 인덱스 소스 추가"로 이동합니다.
2. 이 프로젝트의 **커뮤니티 인덱스**: `https://wnduddld0513.github.io/dsh-purge-kr/index.json`.
3. dsh-purge Community를 선택하고, 출처가 `wnduddld0513/dsh-purge-kr`이고 패키지 이름이 `dsh-purge-community`인지 확인한 뒤 설치합니다.

UI와 설치 프로토콜은 DSH가 제공하고, 인덱스와 플러그인은 커뮤니티가 유지합니다. 진입점 문구는 DSH 버전마다 다를 수 있고, 서드파티 `dsh-market`에는 필터와 마이그레이션 제한이 더 있을 수 있습니다. 패키지가 이미 있으면 방법 3을 사용하세요. [공식 마켓 안내](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.zh.md)

### 방법 2: DSH 공식 CLI (최초 설치)

아래 명령은 **`dsh` 명령이 설치되어 있고 `web` profile을 사용하는 CLI/Web 사용자**를 위한 것입니다. macOS/Linux 터미널이나 Windows PowerShell에서 실행하세요. 데스크톱 사용자는 위 UI를 먼저 사용하시기 바랍니다. 플러그인을 설치하려고 `npx`로 다른 호스트를 내려받지 마세요.

```sh
dsh plugin --profile web add "https://github.com/wnduddld0513/dsh-purge-kr/releases/download/v1.6.86/dsh-purge-community-1.6.86.tgz"
```

`web`은 실제로 기동한 profile과 일치해야 하고, 사용자 지정 데이터 디렉터리는 그 인스턴스의 `DSH_HOME`을 따릅니다. 이 명령은 이번 릴리스의 고정 버전 URL을 사용하며, `npm install -g`도 아니고 순수 npm 패키지 이름 설치도 아닙니다. 이 프로젝트는 GitHub 릴리스로 배포하므로 **`add dsh-purge`나 `add dsh-purge-community`로 바꾸지 마세요.** 공식 CLI 설치에는 우리 설치기의 릴리스 SHA256 대조나 마이그레이션 스냅샷이 없습니다. 그것이 필요하면 방법 3을 선택하세요. [공식 CLI 설치 안내](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.zh.md)

### 방법 3: 커뮤니티 설치기 (백업, 옛 버전 마이그레이션, 복원)

DSH를 먼저 설치하고 한 번 열어 실제 profile이 초기화되게 하세요. 아래 명령은 **이 저장소의 스크립트**를 내려받아 검증하고 설치합니다. `dry-run`이 통과했다는 것은 사전 조건 확인, 내려받기, SHA256까지만 통과했다는 뜻이며, 의존성 설치나 마이그레이션, 기동까지 통과했다는 뜻이 아닙니다. 내려받은 스크립트를 사용하기 전에 읽어 보세요.

#### macOS 데스크톱

기본 앱 위치는 `/Applications/DeepSeek Harness.app`, 데이터 디렉터리는 `~/.dsh`, profile은 `desktop`입니다. 두 블록을 같은 터미널 세션에서 실행하세요:

```sh
PURGE_INSTALL_DIR="$(mktemp -d)"
curl -fSL --connect-timeout 20 --max-time 90 "https://raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install.sh" -o "$PURGE_INSTALL_DIR/install.sh"
sh "$PURGE_INSTALL_DIR/install.sh" --dry-run
```

검증이 통과하고 대상 인스턴스를 확인했다면 다음을 실행하세요:

```sh
sh "$PURGE_INSTALL_DIR/install.sh"
```

특정 앱이나 home을 지정하려면 `DSH_APP` / `DSH_HOME`을 먼저 설정하세요. profile을 고정하려면 두 명령에 `--profile=실제-이름`을 붙입니다. 다른 사람의 경로를 그대로 복사하지 마세요. macOS에서는 XML 또는 바이너리 plist에서 실제 실행 파일 이름까지 읽습니다. 메타데이터가 잘못되면 중단하며, 다른 앱으로 교체하지 않습니다. 자세한 내용은 [앱 위치 지정 경계](docs/INSTALLATION.md#앱-위치-지정-경계pr-78)를 보세요.

#### Windows 데스크톱 · PowerShell 5.1 / 7

스크립트가 DSH Desktop 하나를 찾아냅니다. 기본 home은 사용자의 `.dsh`입니다. 옛 Desktop CLI는 profile 기본값이 `desktop`이고, 자체 dsh CLI를 포함한 새 셸은 `web`이므로, 사용자 지정 profile은 `-Profile`로 고정하세요. 관리자 권한을 요구하지 않고 공백이 포함된 경로도 지원합니다.

```powershell
$PurgeInstaller = Join-Path $env:TEMP ('purge-install-' + [guid]::NewGuid().ToString('N') + '.ps1')
Invoke-WebRequest -UseBasicParsing -TimeoutSec 90 -Uri 'https://raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install.ps1' -OutFile $PurgeInstaller
powershell -NoProfile -ExecutionPolicy Bypass -File "$PurgeInstaller" -DryRun
```

앞 명령이 종료 코드 0으로 끝나고 대상 인스턴스를 확인했다면 같은 PowerShell 세션에서 다음을 실행하세요:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$PurgeInstaller"
```

앱을 찾지 못했거나 사본이 여러 개라면 두 명령에 `-DshExe '실제 DeepSeek Harness.exe 전체 경로'`를 붙이세요. 디렉터리는 `-DshHome`, profile은 `-Profile`로 지정합니다. `ExecutionPolicy Bypass`는 이 자식 프로세스에만 적용되고 영구 실행 정책을 변경하지 않습니다. 조직 정책이 실행을 차단할 수도 있으니, 그럴 때는 오류를 있는 그대로 알리고 시스템 정책은 건드리지 마세요.

#### Linux · CLI / Web

Node ≥18과 DSH CLI를 먼저 설치하고, 실제로 사용하는 profile을 초기화하세요. 아래 절차는 내려받기부터 시작하므로 이 저장소를 클론해 둘 필요가 없습니다:

```sh
PURGE_INSTALL_DIR="$(mktemp -d)"
curl -fSL --connect-timeout 20 --max-time 90 "https://raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install.sh" -o "$PURGE_INSTALL_DIR/install.sh"
sh "$PURGE_INSTALL_DIR/install.sh" --dry-run
```

검증이 통과하면 같은 터미널에서 `sh "$PURGE_INSTALL_DIR/install.sh"`를 실행하세요. 기본값은 PATH의 `node` / `dsh`와 `web` profile입니다. 인스턴스를 고정하려면 두 호출에서 `DSH_NODE`, `PURGE_DSH_CLI`, `DSH_HOME`, `--profile=이름`을 동일하게 유지하세요.

### 설치가 변경하는 것과 확인 방법

- 커뮤니티 설치기는 마이그레이션 전에 백업합니다. 그다음 현재 인스턴스의 공식 `dsh plugin --profile … add …`를 호출하고 설치된 버전과 진입점을 확인합니다. 프롬프트, 규칙, 업데이트 선호, 다른 플러그인의 설정은 보존합니다.
- **"호스트 디렉터리를 전혀 건드리지 않는다"는 뜻은 아닙니다**: 언팩된 데스크톱 레이아웃에서 `app/runtime` 링크가 없거나 끊겨 있으면 기존 링크를 보존한 채 그 설치의 런타임을 가리키도록 수정합니다. 충돌하면 중단합니다. Linux 시스템 호스트가 읽기 전용이면 사용자 사본을 만들고, 그것이 성공한 뒤 사용자 런처로 전환할 수 있습니다. 자세한 내용은 [설치 안내](docs/INSTALLATION.md)를 보세요.
- 마켓 설치는 플러그인이 로드되기 전에 실패할 수 있습니다(issue #7). 그때는 플러그인 자체가 아직 실행되지 않은 상태입니다. 먼저 민감정보를 제거한 오류를 읽고 의존성 출처를 확인하세요. 설치기는 모든 마켓·네트워크 오류를 해결해 준다고 약속하지 않습니다.
- 호스트 패치를 자동으로 적용하지 않고, 자동으로 재시작하지 않으며, 프록시를 변경하지 않고, 전역 npm 레지스트리를 수정하지 않고, 캐시를 지우지 않습니다. 스크립트와 bootstrap은 이 저장소의 `master`에서 가져옵니다. 릴리스 패키지는 별도로 SHA256을 검증하지만, 그것이 내려받은 스크립트에 대한 독립 서명 검증은 아닙니다.
- 명령 종료 코드가 0이 아니면 실패로 간주합니다. 설치에 성공하면 `backup_id`를 기록하고 디스크의 버전을 확인하세요. 실행 중인 DSH는 여전히 옛 버전을 표시할 수 있으니, 편할 때 직접 종료하고 다시 여세요. `dry-run` 통과, 백업 존재, 마켓 카드 표시만으로는 설치 성공의 근거가 되지 않습니다.
- 롤백은 "Purge → 상태 → 로컬 백업"에서 이번 설치 이전 백업을 선택하는 방법을 권장합니다. UI가 없으면 [설치 안내의 CLI 롤백](docs/INSTALLATION.md#cli-rollback)을 따르세요. `purge-community`가 시스템 PATH에 추가되었다고 가정하지 마세요.

인스턴스 선택, 롤백, 실패 복구의 전체 절차는 [설치 안내](docs/INSTALLATION.md)에 있습니다. 에이전트는 [AGENTS.md §12](AGENTS.md)를 먼저 읽습니다.

## 패널

사이드바 전체를 사용하는 한 페이지이며, 떠 있는 버튼은 없습니다:

- 상단에서 현재 상태를 한 줄로 설명하고, 주 동작은 「적용」입니다.
- 나머지 구역은 접힌 채로 시작하고, 설명은 필요할 때 펼치는 `?` 안에 있습니다.
- 유지보수 페이지에서 최근 동작, 백업 사용량, 업데이트 선호를 볼 수 있습니다.
- 사용하지 않는 진입점(예: 되감기 버튼)은 숨길 수 있고, 이 설정은 표시에만 영향을 줍니다.

## 자주 쓰는 명령

| 명령 | 역할 |
| --- | --- |
| `purge-community selfcheck [--json]` | 계층별 상태와 근거를 표시합니다. 해당 없음 항목은 따로 표시합니다 |
| `purge-community status` | 호스트 경로와 개수를 표시합니다 |
| `purge-community host-status` | 설치 레이아웃과 현재 진입점을 읽기 전용으로 읽습니다(패키지 교체 없음, 재시작 없음) |
| `purge-community diagnose` | 앵커 드리프트를 진단하고 파일, 행 번호, 후보 위치를 표시합니다 |
| `purge-community reanchor …` | 확인한 새 앵커를 로컬 오버라이드로 고정합니다. 되돌릴 수 있습니다 |
| `purge-community probe [new]` | 주입이 실제로 모델에 도달했는지 확인하는 런타임 프로브를 만듭니다 |
| `purge-community audit [--limit n]` | 최근 동작 기록을 표시합니다 |
| `purge-community boost [on\|off]` | 꼬리 강화 섹션을 켜고 끕니다 |
| `purge-community preset [status\|install]` | "무제한 모드" 프리셋을 디스크에 기록합니다 |
| `purge-community retry [on\|off]` | 중단된 응답에 대한 1회 재시도를 켜고 끕니다 |
| `purge-community usage` / `prune` | 백업 사용량을 확인하고 정리합니다 |
| `purge-community backup` / `rollback <id>` | 스냅샷을 만들거나 플러그인을 롤백합니다 |

## 업데이트

유지보수 페이지에서 "자동 확인"과 "자동 설치"를 따로 설정합니다. 기본값은 확인만, 6시간 간격입니다. 설치가 끝났다고 해서 자동으로 재시작하지 않습니다. 언제 다시 열지는 사용자가 정합니다.

## 호환성

| 구성 요소 | 값 |
| --- | --- |
| 플러그인 | `dsh-purge-community` 1.6.86 |
| 검증된 호스트 | DSH Desktop 0.2.2-rc.1 / 0.2.1-rc.1 / 0.2.1-rc.2 / 0.2.1-rc.3 / 0.2.1-rc.5 |
| 기타 호스트 | 설치할 수 있습니다. 자체 점검이 "미검증"으로 표시하니 `diagnose`를 먼저 보세요 |
| Node | ≥18(데스크톱 빌드에 포함된 런타임이면 충분합니다). 레드팀 도구는 ≥22.5가 필요합니다(`node:sqlite`) |

## 문제가 생겼을 때

```sh
purge-community selfcheck --json     # 먼저 어느 계층이 정상이 아닌지 확인합니다
purge-community diagnose             # 앵커 드리프트가 나오면 후보 위치를 확인합니다
purge-community audit --limit 20     # 최근 동작을 확인합니다
```

패널이 열리지 않으면 버전을 먼저 확인하고 [유지보수 문서](docs/MAINTENANCE.md)에 따라 복구하세요. `Resources/app`을 직접 덮어쓰지 마세요.

## 개발과 검증

```sh
npm test                 # 단위·계약 테스트
npm run check:docs       # 버전과 문서 일치 검사
npm run check:client     # 패널 번들이 소스와 일치하는지 검사
npm run test:electron    # 실제 Electron 환경(임시 디렉터리, 설치 변경 없음)
npm run smoke            # 릴리스 패키지 스모크
```

AI 에이전트용 운영 지침은 [AGENTS.md](AGENTS.md)에 있습니다. 둘이 충돌하면 AGENTS.md를 기준으로 합니다.

**키워드**: 탈옥 · 무제한 모드 · 프롬프트 주입 · DSH 플러그인 · 상태 자체 점검 · 백업 롤백

### DSH Store 등록 정보

DSH Store 신청에는 **Plugin path: `.`**를 반드시 기재해야 합니다. 설치 루트의 `dsh-purge-community`를 가리키며, 비워 두거나 독립 패널 패키지를 선택하면 안 됩니다. 버전별 호환 선언은 manifest에 있고, 검증하지 않은 버전은 `unknown`으로 남습니다. 메타데이터를 수정하는 것과 마켓 설치를 승인하는 것은 다릅니다. [경로, 호환 근거, 등록 경계](docs/DSH-STORE.md)
