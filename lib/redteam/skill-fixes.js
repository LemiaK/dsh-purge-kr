/**
 * 스킬 수리 안내 문구 (무의존, 순수 ESM)
 *
 * 용도: 콘솔 "스킬 라이브러리" 탭용 — **사용 불가** 스킬마다 "어떻게 고치는지"를 사용자에게 바로 알려야 합니다,
 * "무엇이 없는지"만 알려주는 데 그치지 않습니다. `skill-availability.js` 가 판정하고(환경 변수 누락 / 도구 누락 / 자리표시자 미기입 / 같은 이름 스킬에 가려짐),
 * 여기서는 각 판정 유형을 실행 가능한 단계로 옮깁니다:
 *   · `TOOL_FIXES`   —— 도구별 설치법 (`scripts/redteam-setup.sh` 와 일치: 자동 설치가 되는 것은 해당 스크립트를 실행하게 합니다)
 *   · `SKILL_FIXES`  —— 스킬별 추가 수리 단계 (FOFA_KEY, VPS 주소, 브라우저 확장…)
 *   · `toolNameOfPath` / `fixesForIssue` —— "특정 경로가 없습니다" 같은 판정을 구체적 제안으로 바꿉니다
 *
 * 문구 규약: 한국어, "이것이 무엇인지/어떻게 채우는지"를 한 문장으로, 명령은 모두 백틱으로 감쌉니다, URL 과 버전 번호는 지어내지 않습니다,
 * 본문에 markdown 강조 기호를 쓰지 않습니다(패널이 순수 텍스트로 렌더링합니다). `fixesForIssue()` 가 판정 분기별로 내는 제안은 **단일 행**입니다
 * (목록 항목으로 렌더링해도 무너지지 않습니다). `SKILL_FIXES` 로 폴백할 때는 개행이 들어갈 수 있습니다 — 스킬 문구는 1–3행까지 허용합니다.
 */

/** 저장소에 포함된 원클릭 수리 진입점 (도구 다운로드, FOFA_KEY/VPS 안내가 모두 이 한 스크립트에 있습니다). */
const SETUP = 'bash $DSH_HOME/redteam/setup.sh --yes'

/** 무엇이 빠졌는지 전혀 알 수 없을 때의 폴백 제안. */
const GENERIC_FIX = '사용자가 `' + SETUP + '` 를 실행해 도구와 설정을 채웁니다(멱등, 반복 실행 가능; 빠진 것은 내려받고 손상된 것은 지우고 다시 받습니다),'
  + '`$DSH_HOME/.env` 를 고친 뒤 `dsh web` 를 재시작해야 적용됩니다; 그래도 안 되면 redteam 플러그인을 다시 설치하고 자체 점검을 한 번 더 합니다.'

/** 툴킷 첨부가 실제로 담고 있는 것. "없으면 첨부에서 풀어 쓰세요"라고 쓰지 않습니다. */
const TOOLKIT_TARBALL = '업스트림 dsh-redteam-mode 의 release 자산 `dsh-redteam-mode-<버전>-toolkit.tar.gz` (현재 안에는 README, 스킬 md 몇 개, redteam-setup.sh 만 있고 아래 바이너리나 스크립트는 들어 있지 않습니다)'

/* ── 도구별 수리법 ───────────────────────────────────────────────────────────── */

const FRP_FIX = {
  what: 'frp 내부망 터널링: `frps` 는 VPS 에서 서버로, `frpc` 는 대상에서 클라이언트로 실행합니다(같은 release 패키지의 두 바이너리)',
  install: '`' + SETUP + '` 를 한 번 실행하면 `frpc` + `frps` 가 `$DSH_HOME/redteam/toolkit/frp/` 에 풀립니다;'
    + '스크립트가 처리하지 못하면 fatedier/frp 의 GitHub releases 에서 `frp_<버전>_linux_amd64.tar.gz` 를 직접 받아 압축을 풀고 `frpc`/`frps` 를 같은 디렉터리에 넣은 뒤 `chmod +x` 합니다',
}

const LIGOLO_FIX = {
  what: 'ligolo-ng TUN 터널 (`proxy` 서버 + `agent` 대상 측). chisel/frp 외의 대체 경로이며 가상 NIC 생성에 root 가 필요합니다',
  install: '`' + SETUP + '` 를 실행하면 `$DSH_HOME/redteam/toolkit/ligolo/proxy` 와 `.../ligolo/agent` 에 설치됩니다;'
    + '또는 nicocha30/ligolo-ng 의 GitHub releases 에서 `proxy_*_linux_amd64.tar.gz` / `agent_*_linux_amd64.tar.gz` 를 받아 압축을 풀고 위 이름 그대로 `toolkit/ligolo/` 에 넣은 뒤 `chmod +x` 합니다',
}

export const TOOL_FIXES = {
  /* ── setup.sh 가 toolkit/ 에 내려받는 바이너리 ── */
  fscan: {
    what: '내부망 종합 스캔 (생존/포트/서비스 식별/28종 약한 암호/미인가/고위험 취약점, v2.2.1)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/fscan/fscan` 을 채웁니다;'
      + '`fscan.zip` 만 받고 압축을 풀지 않았다면 직접 풀어서 `fscan` 바이너리를 꺼내고 `chmod +x` 합니다; 스크립트로도 채워지지 않으면 shadow1ng/fscan 의 GitHub releases 에서 해당 플랫폼 바이너리(`fscan_windows_x64.exe`, `fscan_linux_arm64` 포함)를 받아 그 디렉터리에 넣습니다',
  },
  gogo: {
    what: '내부망 매핑·지문 엔진 (v2.15.0, 능동+수동 지문, 핵심 정보 추출, nuclei 템플릿 POC)',
    install: 'setup.sh 는 gogo 에 대해 안내만 하고 자동 다운로드하지 않습니다(업스트림 자산 이름이 고정되지 않음): `' + SETUP + '` 를 실행해 안내를 확인하고,'
      + '직접 chainreactors/gogo 의 GitHub releases 에서 플랫폼별 바이너리를 받습니다. 본체는 `$DSH_HOME/redteam/toolkit/gogo/gogo` 에, Windows/arm64 변형(`gogo_windows_amd64.exe`, `gogo_linux_arm64`)은 같은 디렉터리에 두고 모두 `chmod +x` 합니다',
  },
  suo5: {
    what: 'suo5: WebShell/HTTP 로 SOCKS5 터널을 세우는 내부망 돌파 핵심 도구 (v2.2.0, 정적 Go 무의존)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/suo5/suo5-linux-amd64` 에 설치합니다;'
      + '또는 zema1/suo5 의 GitHub releases 에서 `suo5-linux-amd64` 를 받아 그 경로에 두고 `chmod +x` 합니다',
  },
  chisel: {
    what: 'chisel HTTP 터널 (서버와 클라이언트가 같은 바이너리, v1.12.0)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/chisel/chisel` 에 설치합니다;'
      + '또는 jpillora/chisel 의 GitHub releases 에서 `chisel_<버전>_linux_amd64.gz` 를 받아 `gunzip` 한 뒤 `chmod +x` 합니다',
  },
  frp: FRP_FIX,
  frpc: FRP_FIX,
  frps: FRP_FIX,
  subfinder: {
    what: '수동 서브도메인 열거 (ProjectDiscovery, v2.16.0, 다중 소스 집계)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/subfinder/subfinder` 에 설치합니다;'
      + '또는 projectdiscovery/subfinder 의 GitHub releases 에서 `subfinder_<버전>_linux_amd64.zip` 을 받아 압축을 풀어 넣고 `chmod +x` 합니다',
  },
  dnsx: {
    what: '대량 DNS 해석/브루트포스/와일드카드 해석 필터 (ProjectDiscovery, v1.3.1)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/dnsx/dnsx` 에 설치합니다;'
      + '또는 projectdiscovery/dnsx 의 GitHub releases 에서 `dnsx_<버전>_linux_amd64.zip` 을 받아 압축을 풀어 넣고 `chmod +x` 합니다',
  },
  naabu: {
    what: '고속 포트 스캔 (ProjectDiscovery, v2.6.1; SYN 은 root 필요, 비root 는 `-scan-type c` 추가)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/naabu/naabu` 에 설치합니다;'
      + '또는 projectdiscovery/naabu 의 GitHub releases 에서 `naabu_<버전>_linux_amd64.zip` 을 받아 압축을 풀어 넣고 `chmod +x` 합니다',
  },
  httpx: {
    what: 'HTTP 생존/제목/상태 코드/기술 스택 탐지 (ProjectDiscovery 판, v1.12.0; `/usr/bin/httpx` 는 Python httpx 라이브러리의 CLI 이므로 이것이 아닙니다)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/httpx/httpx` 에 설치합니다;'
      + '또는 projectdiscovery/httpx 의 GitHub releases 에서 `httpx_<버전>_linux_amd64.zip` 을 받아 압축을 풀어 넣고 `chmod +x` 합니다;'
      + '명령줄에서는 래퍼 스크립트 `pd-httpx` 와 함께 호출합니다(`pd-httpx` 항목 참조)',
  },
  ksubdomain: {
    what: '무상태 서브도메인 브루트포스 (knownsec ksubdomain v0.7, dnsx 브루트포스보다 빠르고 패킷 송신에 root 필요)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/ksubdomain/ksubdomain` 에 설치합니다;'
      + '또는 knownsec/ksubdomain 의 GitHub releases 에서 linux 판 압축 파일을 받아 풀어 넣고 `chmod +x` 합니다',
  },
  ligolo: LIGOLO_FIX,
  'ligolo-proxy': LIGOLO_FIX,
  'ligolo-agent': LIGOLO_FIX,
  gowitness: {
    what: '대량 웹페이지 스크린샷 증적 (sensepost/gowitness)',
    install: '`' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/gowitness/gowitness` 에 설치합니다;'
      + '또는 sensepost/gowitness 의 GitHub releases 에서 `gowitness-<버전>-linux-amd64` 를 받아 넣고 `chmod +x` 합니다 — '
      + '다운로드가 완전해야 합니다(잘린 바이너리도 존재하고 권한도 맞지만 실행하면 출력이 0 이 됩니다)',
  },
  oneforall: {
    what: 'OneForAll 서브도메인 수집 올인원 (v0.4.5, 소스 + `.venv`, 느리지만 망라적)',
    install: '`' + SETUP + '` 를 실행하면 소스가 `$DSH_HOME/redteam/toolkit/oneforall/OneForAll-0.4.5/` 에 놓이고 `.venv` 의존성이 구성됩니다;'
      + '설치되지 않아도 주 흐름에는 영향이 없습니다 — `subfinder` + `ksubdomain` 으로 대체하면 됩니다',
  },
  vps: {
    what: 'VPS 접속 방식(`REDTEAM_VPS_HOST` / `REDTEAM_VPS_KEY`)과 중계 스크립트 `vps.sh`: 리버스 셸, 페이로드 전달, 터널 출구의 착지 지점',
    install: '`' + SETUP + '` 를 실행하면 VPS 주소와 개인 키 경로를 기록하도록 안내합니다; 개인 키는 `$DSH_HOME/redteam/toolkit/vps/id_rsa` 에 두고 `chmod 600` 합니다(연결 확인은 '
      + '`ssh -i $DSH_HOME/redteam/toolkit/vps/id_rsa -o BatchMode=yes <user>@<ip> \'echo ok\'` 로 합니다);'
      + '스크립트 `$DSH_HOME/redteam/toolkit/vps/vps.sh` 는 툴킷 첨부에 없습니다: 스킬 `vps-reverse-shell` 의 하위 명령에 맞춰 실행 가능한 스크립트로 직접 작성하고(최소한 `serve <port>` 와 `exec` 는 있어야 합니다) `chmod +x` 합니다',
  },
  'nuclei-templates': {
    what: 'nuclei 템플릿 라이브러리 (13,000+ 템플릿, `nuclei -t` 와 `redteam_poc_search` 가 모두 이것에 의존합니다)',
    install: '`' + SETUP + '` 를 실행하면 `~/.local/nuclei-templates` 에 설치됩니다; `nuclei -update-templates` 를 따로 실행해도 됩니다(주 1회를 넘기지 않습니다);'
      + '템플릿 수가 1000 미만이면 전부 받지 못한 것이므로 한 번 더 실행하고 `nuclei -tl` 로 템플릿 라이브러리가 정상인지 확인합니다',
  },

  /* ── 스킬에서 참조하지만 setup.sh 가 내려받지 않고 툴킷 첨부에도 없는 것 ── */
  dirsearch: {
    what: '디렉터리/파일 브루트포스 (Python, v0.5.0, 사전이 망라적이고 보고가 깔끔하며 자체 런타임 포함)',
    install: 'setup.sh 의 다운로드 목록에 없습니다: maurosoria/dirsearch 의 GitHub releases 에서 소스 패키지를 받아 `$DSH_HOME/redteam/toolkit/dirsearch/` 에 둡니다 '
      + '(`toolkit/dirsearch/dirsearch` 가 실행 가능해야 하며 `chmod +x`); 임시로는 `feroxbuster` / `ffuf` / `gobuster` 로 대체할 수 있습니다',
  },
  behinder: {
    what: 'Behinder v4.1 클라이언트 + 암호화 웹셸 템플릿 (`toolkit/Behinder/server/*.jsp|php|aspx`, WebShell 전달 주력)',
    install: 'setup.sh 는 내려받지 않습니다. ' + TOOLKIT_TARBALL + '. Behinder 배포 페이지에서 클라이언트를 직접 받아 `toolkit/Behinder/` 에 둡니다;'
      + '웹셸 템플릿만 필요하면 `toolkit/Behinder/server/` 의 템플릿 일곱 개를 그대로 두면 됩니다(GUI 없이도 `sed` 로 키를 바꿔 생성 가능); `java -jar` 가 필요하므로 로컬에 Java 가 있어야 합니다',
  },
  godzilla: {
    what: 'Godzilla v4.0.1 클라이언트 (`godzilla.jar`, GUI 로 JSP/PHP/ASPX 완전 암호화 payload 생성)',
    install: 'setup.sh 는 내려받지 않습니다. ' + TOOLKIT_TARBALL + '. Godzilla 배포 페이지에서 `godzilla.jar` 를 직접 받아 `toolkit/Godzilla/` 에 둡니다;'
      + '실행에는 Java(`apt install openjdk-17-jre`)와 그래픽 세션(`DISPLAY=:10.0`)이 필요합니다',
  },
  antsword: {
    what: 'AntSword (Loader + 소스 디렉터리, 첫 실행 시 소스 디렉터리 `antSword-2.1.16` 선택 필요)',
    install: 'setup.sh 는 내려받지 않습니다. ' + TOOLKIT_TARBALL + '. AntSword 공식 저장소에서 Loader 와 소스 디렉터리를 받아 `toolkit/AntSword/` 에 둡니다 ('
      + '`toolkit/AntSword/AntSword-Loader-v4.0.3-linux-x64/AntSword` 는 실행 가능해야 합니다)',
  },
  netexec: {
    what: 'netexec (nxc) 내부망 횡적 이동/프로토콜 열거 도구 (`toolkit/netexec/`, Kali 에서는 `apt install netexec` 도 가능)',
    install: '`apt install netexec`; 로컬 툴킷 판은 `$DSH_HOME/redteam/toolkit/netexec/` 에 있고,'
      + '없으면 ' + TOOLKIT_TARBALL + ' 에서 풀어내거나, 공식 문서대로 `pipx install netexec` 를 씁니다',
  },

  /* ── 스킬에 나오지만 setup.sh 가 다루지 않는 로컬 스크립트/바이너리 ── */
  'pd-httpx': {
    what: 'ProjectDiscovery httpx 래퍼 스크립트 (`~/.local/bin/pd-httpx`) — Python httpx 라이브러리 CLI 와 이름이 겹치지 않게 합니다',
    install: '먼저 `' + SETUP + '` 를 실행해 `$DSH_HOME/redteam/toolkit/httpx/httpx` 를 설치하고, 래퍼 스크립트를 다시 만든 뒤 실행 권한을 줍니다:'
      + '`printf \'#!/usr/bin/env bash\\nexec "\${DSH_HOME:-$HOME/.dsh}/redteam/toolkit/httpx/httpx" "$@"\\n\' > ~/.local/bin/pd-httpx && chmod +x ~/.local/bin/pd-httpx`',
  },
  'kimi-chrome': {
    what: 'Kimi WebBridge 확장으로 제어할 수 있는 브라우저를 띄우는 실행 스크립트 (`~/.local/bin/kimi-chrome`)',
    install: '먼저 브라우저를 설치합니다: `apt install google-chrome-stable` (또는 `apt install chromium`); 이어서 `~/.local/bin/kimi-chrome` 을 만듭니다:'
      + '기본값은 `exec /usr/bin/google-chrome --no-first-run --no-default-browser-check "$@"` 이고, `KIMI_BROWSER=chromium` 이면 `/usr/bin/chromium` 을 씁니다,'
      + '앞부분에서 `systemctl start kimi-webbridge` 로 데몬을 함께 올리고, 마지막에 `chmod +x ~/.local/bin/kimi-chrome` 합니다',
  },
  'kimi-webbridge': {
    what: 'Kimi WebBridge 로컬 데몬 (systemd 서비스 `kimi-webbridge`, `127.0.0.1:10086` 대기, 스킬이 이것으로 실제 브라우저를 제어합니다)',
    install: '데몬은 `~/.kimi-webbridge/bin/kimi-webbridge` 에 있고 `/etc/systemd/system/kimi-webbridge.service` 가 관리합니다:'
      + '다시 설치한 뒤 `sudo systemctl enable --now kimi-webbridge` 를 실행하고, `~/.kimi-webbridge/bin/kimi-webbridge status` 로 `"running": true` 를 확인합니다;'
      + '브라우저 확장은 엔터프라이즈 정책으로 Chrome 웹 스토어에서 자동 설치됩니다(ID `fldmhceldgbpfpkbgopacenieobmligc`). Chrome 137+ 에서는 압축 해제 로딩을 쓰지 않습니다',
  },
  chromium: {
    what: 'Chromium 브라우저 (headless 로 렌더링 후 DOM 수집 / 스크린샷 / PDF 생성의 무의존 방식, `/usr/bin/chromium`)',
    install: '`apt install chromium` (`google-chrome-stable` 도 가능); 사용법: `/usr/bin/chromium --headless=new --no-sandbox --dump-dom <url>`,'
      + '스크린샷은 `--screenshot=runs/shot.png` 를 추가합니다',
  },
  'playwright-cli': {
    what: 'Playwright CLI (클릭/대기/다중 탭이 필요할 때의 브라우저 자동화, `npx --yes @playwright/cli@latest`)',
    install: '`npx --yes @playwright/cli@latest`; 브라우저가 없으면 `npx playwright install chromium` 를 실행합니다;'
      + '호출할 때 반드시 `--browser chromium` 을 붙입니다(기본 chrome 채널로 가면 `Chromium distribution \'chrome\' is not found` 가 납니다)',
  },

  /* ── 시스템 도구 (setup.sh 는 점검만 하고, 없으면 apt 로 채웁니다) ── */
  nmap: {
    what: '포트/서비스/스크립트 스캔 (Kali 기본 포함, 능동 스캔 주력)',
    install: '`apt install nmap`; SYN 스캔(`-sS`)에는 `sudo` 가 필요하고, 권한이 없으면 `-sT` 를 씁니다',
  },
  masscan: {
    what: '초고속 포트 스캔 (큰 대역을 훑는 용도, 노이즈가 큽니다)',
    install: '`apt install masscan`; 패킷 송신에 root 가 필요하므로 `--rate` 와 승인 범위를 먼저 한정합니다',
  },
  nuclei: {
    what: '템플릿 기반 취약점 스캔 (Nday/1day 탐지 주력, 로컬 경로는 `/usr/bin/nuclei`)',
    install: '`apt install nuclei`; 설치 후 템플릿 라이브러리도 채웁니다: `nuclei -update-templates` (템플릿 위치 `~/.local/nuclei-templates`)',
  },
  sqlmap: {
    what: 'SQL 인젝션 탐지와 악용',
    install: '`apt install sqlmap`',
  },
  ffuf: {
    what: 'Web fuzz / 디렉터리 브루트포스 (가장 빠르고 유연하며 다중 사전, vhost, 파라미터 fuzz 지원)',
    install: '`apt install ffuf`',
  },
  feroxbuster: {
    what: '재귀 디렉터리 브루트포스 (Rust, 디렉터리 계층을 자동으로 따라갑니다, 디렉터리 브루트포스 1순위)',
    install: '`apt install feroxbuster`',
  },
  gobuster: {
    what: '경량 디렉터리/DNS/vhost 브루트포스 (dir/dns/vhost 세 모드)',
    install: '`apt install gobuster`',
  },
  hydra: {
    what: '온라인 약한 암호 브루트포스 (50+ 프로토콜: SSH/FTP/RDP/SMB/MySQL/MSSQL/Web 폼)',
    install: '`apt install hydra`',
  },
  john: {
    what: 'John the Ripper 오프라인 해시 크래킹 (CPU 방식, 작은 사전/규칙에 적합)',
    install: '`apt install john`; 사전이 없으면 `apt install wordlists` 후 `gunzip /usr/share/wordlists/rockyou.txt.gz` 를 합니다',
  },
  hashcat: {
    what: 'hashcat 오프라인 해시/패스워드 크래킹 (GPU 우선, CPU 는 매우 느립니다)',
    install: '`apt install hashcat`; 먼저 `hashcat --identify hashes.txt` 로 모드 번호를 확인합니다(예: NTLM `-m 1000`, Kerberoast `-m 13100`)',
  },
  wpscan: {
    what: 'WordPress 취약점 및 사용자 열거 스캔',
    install: '`apt install wpscan`; 취약점 DB 가 필요하면 안내에 따라 `wpscan --update` 를 실행합니다',
  },
  nikto: {
    what: 'Web 서버 설정과 알려진 문제 스캔',
    install: '`apt install nikto`',
  },
  whatweb: {
    what: 'Web 지문 식별 (CMS/프레임워크/미들웨어/버전)',
    install: '`apt install whatweb`',
  },
  amass: {
    what: '서브도메인 열거와 자산 매핑 (OWASP Amass)',
    install: '`apt install amass`; 수동 모드는 `amass enum -passive -d <domain>`',
  },
  theharvester: {
    what: '공개 소스 이메일/서브도메인/호스트 수집 (theHarvester)',
    install: '`apt install theharvester`',
  },
  msfconsole: {
    what: 'Metasploit 프레임워크 (`exploit/multi/handler` 로 리버스 셸 수신, `web_delivery` 로 페이로드 전달)',
    install: '`apt install metasploit-framework` (`msfconsole` 제공); 처음 쓸 때는 `msfdb init` 을 먼저 실행합니다',
  },
  searchsploit: {
    what: '로컬 Exploit-DB 검색 (구성 요소/버전으로 공개 POC 를 찾습니다)',
    install: '`apt install exploitdb` (`searchsploit` 제공); DB 갱신은 `searchsploit -u`',
  },
  proxychains4: {
    what: '단일 명령의 TCP 트래픽을 내부망으로 프록시 (socks5 터널과 함께 씁니다)',
    install: '`apt install proxychains4`; `-f` 로 `runs/` 아래 임시 설정만 지정합니다(예: `proxychains4 -f runs/proxychains-1080.conf ...`). `/etc/proxychains4.conf` 는 고치지 않습니다',
  },
  socat: {
    what: '풀 TTY 리버스 셸 수신 / 포트 포워딩 (nc 보다 안정적, PTY 확보 가능)',
    install: '`apt install socat`',
  },
  nc: {
    what: 'netcat: 리버스 셸 수신과 연결 테스트 (`nc -lvnp <port>`)',
    install: '`apt install netcat-traditional` (`nc` 제공; Debian 계열의 `netcat-openbsd` 도 가능)',
  },
  tmux: {
    what: '세션 유지: 수신과 터널은 반드시 tmux 안에서 실행합니다. 아니면 SSH 가 끊길 때 함께 사라집니다',
    install: '`apt install tmux`; 사용법: `tmux new -s handler`, `tmux a -t handler`',
  },
  impacket: {
    what: 'Impacket 프로토콜 모음 (PtH/PsExec/WMI/DCOM/Kerberos/자격 증명 덤프, Kali 에 `impacket-*` 명령 61개 기본 포함)',
    install: '`apt install python3-impacket`; 자주 쓰는 명령 `impacket-wmiexec` / `impacket-psexec` / `impacket-secretsdump` / `impacket-GetNPUsers`',
  },
  enum4linux: {
    what: 'SMB/도메인 환경 정보 열거 (사용자, 공유, 그룹, 암호 정책)',
    install: '`apt install enum4linux` (신버전에는 `enum4linux-ng` 도 있습니다)',
  },
  'redis-cli': {
    what: 'Redis 클라이언트 (미인가 Redis 의 읽기 전용 탐지와 웹셸 기입)',
    install: '`apt install redis-tools` (`redis-cli` 제공)',
  },
  mysql: {
    what: 'MySQL/MariaDB 클라이언트 (미인가/약한 암호 MySQL 에 접속해 데이터 추출)',
    install: '`apt install default-mysql-client` (Kali 에서는 `mariadb-client`)',
  },
}

/* ── 스킬별 수리법 ───────────────────────────────────────────────────────────── */

export const SKILL_FIXES = {
  'active-scan': '스캐너 설치: `apt install nmap masscan`; `toolkit/naabu/naabu` 가 없으면 `' + SETUP + '` 를 실행합니다.'
    + '비root 일 때는 naabu 에 `-scan-type c` 를 붙이고, nmap/masscan 의 SYN 스캔에는 반드시 `sudo` 가 필요합니다; 스캔 전에 대상이 승인 범위 안에 있는지 확인합니다.',

  'asset-correlation': 'DB 저장/연관 전용 스킬로 외부 도구에 의존하지 않고 환경 변수도 읽지 않습니다; 사용 불가라면 대개 스킬 파일 누락이거나 플러그인 버전이 낡은 것입니다 — '
    + 'redteam 플러그인을 다시 설치한 뒤 `dsh web` 를 재시작하고, `redteam_asset_link` 도구를 쓸 수 있는지 확인합니다.',

  'browser-automation': '브라우저 설치: `apt install chromium` (또는 `google-chrome-stable`); playwright 경로라면 `npx playwright install chromium` 도 실행합니다.'
    + '호출할 때 반드시 `--browser chromium` 을 붙입니다(기본 chrome 채널로 가면 `Chromium distribution \'chrome\' is not found` 가 납니다).',

  'chisel-tunnel': '`toolkit/chisel/chisel` 바이너리 채우기: `' + SETUP + '` 를 실행합니다.\n'
    + '터널 양 끝에 VPS 를 씁니다: `$DSH_HOME/.env` 에 `REDTEAM_VPS_HOST` / `REDTEAM_VPS_USER` / `REDTEAM_VPS_KEY` 가 있는지 확인하고,'
    + '명령 앞에서 `set -a; . "$DSH_HOME/.env"; set +a` 를 실행합니다; `.env` 를 고친 뒤에는 `dsh web` 을 재시작해야 하고, 보안 그룹에서 터널 포트를 열어 둡니다.',

  'cn-proxy-pool': '`curl` / `python3` 만 씁니다(없으면 `apt install curl`); 사용 불가라면 대개 스킬 파일 누락입니다 — 플러그인을 다시 설치한 뒤 `dsh web` 를 재시작합니다.'
    + '프록시는 단일 명령에서 `-proxy` / `-x` / `--proxy` 로만 지정합니다. 로컬 시스템 프록시나 `/etc/proxychains4.conf` 는 건드리지 않습니다.',

  'credential-attack': '`apt install hydra hashcat john`; 사전은 `sudo apt install wordlists` 후 `gunzip /usr/share/wordlists/rockyou.txt.gz` 로 준비합니다.'
    + '로컬에 GPU 가 없으면 `hashcat` 이 매우 느리므로 작은 사전 + 규칙(`-r /usr/share/hashcat/rules/best64.rule`)을 우선합니다.',

  'dir-bruteforce': '`apt install feroxbuster ffuf gobuster`; `toolkit/dirsearch/dirsearch` 는 setup.sh 의 다운로드 목록에 없습니다 — '
    + 'maurosoria/dirsearch 의 GitHub releases 에서 소스를 받아 `$DSH_HOME/redteam/toolkit/dirsearch/` 에 두고 실행 가능하게 만듭니다.',

  'fofa-recon': '`FOFA_KEY` 설정: <https://fofa.info> 로그인 → 개인 센터 → API Key.\n'
    + '`$DSH_HOME/.env` 에 적거나(`FOFA_KEY=YOUR_KEY`, `chmod 600`) 임시로 `export FOFA_KEY=…` 한 뒤 `dsh web` 를 재시작해야 현재 프로세스에 적용됩니다;'
    + '자가 점검은 `curl -s "https://fofa.info/api/v1/info/my?key=$FOFA_KEY"` 가 `"error":false` 를 반환하면 됩니다.\n'
    + '사용자가 `' + SETUP + '` 를 실행해도 됩니다(스크립트가 대신 써 주고 그 자리에서 검증합니다).',

  'frp-tunnel': '`toolkit/frp/frps`, `toolkit/frp/frpc` 채우기: `' + SETUP + '` 를 실행합니다(한 번에 두 바이너리가 풀립니다).\n'
    + 'VPS 측에는 `REDTEAM_VPS_HOST` / `REDTEAM_VPS_KEY` 가 필요합니다(`$DSH_HOME/.env`). 명령 앞에서 `set -a; . "$DSH_HOME/.env"; set +a` 를 실행하고,'
    + '고친 뒤 `dsh web` 을 재시작하고, 클라우드 보안 그룹에서 frps 대기 포트를 열어 둡니다.',

  'fscan-intranet': '`toolkit/fscan/fscan` 채우기: `' + SETUP + '` 를 실행합니다; `fscan.zip` 만 받았다면 직접 압축을 풀어 `fscan` 을 꺼내고 `chmod +x` 합니다.\n'
    + '스킬 본문의 `<VPS_IP>` 는 자리표시자입니다: `$DSH_HOME/.env` 에 `REDTEAM_VPS_HOST=<REAL_IP>` 를 적고 `dsh web` 을 재시작하거나,'
    + '또는 `$DSH_HOME/skills/fscan-intranet.md` 를 직접 고쳐 `<VPS_IP>` 를 실제 주소로 바꿉니다(페이로드 서비스: VPS 에서 `vps.sh serve 9100` 실행).',

  'gogo-intranet': '`gogo` 는 setup.sh 가 자동 다운로드하지 않습니다: chainreactors/gogo 의 GitHub releases 에서 플랫폼별 바이너리를 받아'
    + '`$DSH_HOME/redteam/toolkit/gogo/gogo` 에 두고(Windows/arm64 변형은 같은 디렉터리) `chmod +x` 합니다.\n'
    + '`<VPS_IP>` 자리표시자는 `fscan-intranet` 과 같은 방법으로 채웁니다: `.env` 에 `REDTEAM_VPS_HOST` 를 적고 `dsh web` 을 재시작하거나,'
    + '또는 `$DSH_HOME/skills/gogo-intranet.md` 를 직접 고쳐 자리표시자를 바꿉니다.',

  'kimi-webbridge': '브라우저 확장 + 런처 두 가지입니다: 확장은 엔터프라이즈 정책으로 Chrome 웹 스토어에서 자동 설치되고(ID `fldmhceldgbpfpkbgopacenieobmligc`),'
    + 'Chrome 137+ 에서는 `--load-extension` 를 쓰지 않습니다; Chrome/Chromium 이 없으면 먼저 `apt install chromium` 또는 `google-chrome-stable` 을 설치합니다.\n'
    + '런처 `~/.local/bin/kimi-chrome` 을 만들고(기본은 `/usr/bin/google-chrome`, `KIMI_BROWSER=chromium` 이면 Chromium) `chmod +x` 합니다;'
    + '데몬은 `sudo systemctl enable --now kimi-webbridge` 로 올립니다.\n'
    + '`curl -s http://127.0.0.1:10086/status` 에서 `extension_connected` 가 `false` 이면 브라우저(`kimi-chrome`)를 먼저 띄운 뒤 다시 확인합니다.',

  'lateral-movement': '`apt install python3-impacket enum4linux smbclient` (Kali 에 `/usr/bin/impacket-*` 61개 기본 포함); 오프라인 크래킹은 `apt install hashcat`.'
    + '내부망 대상에 대한 모든 명령은 터널을 거칩니다: `proxychains4 -f runs/proxychains-<port>.conf ...`. 시스템 `proxychains` 설정은 고치지 않습니다.',

  'nuclei-scan': '`apt install nuclei`; 템플릿 라이브러리 `~/.local/nuclei-templates` 가 없으면 `nuclei -update-templates` 를 실행합니다(`' + SETUP + '` 를 실행해도 설치됩니다).'
    + '갱신 후 `nuclei -tl` 로 템플릿 라이브러리가 정상인지 확인합니다. 템플릿 수가 1000 미만이면 전부 받지 못한 것입니다.',

  'passive-recon': '`curl` / `dig` / `jq` 만 씁니다: `apt install curl dnsutils jq`; 이 스킬에는 API key 가 필요 없습니다.'
    + '사용 불가라면 대개 스킬 파일 누락이거나 플러그인 버전이 낡은 것입니다 — 플러그인을 다시 설치한 뒤 `dsh web` 를 재시작합니다.',

  'recon-pipeline': '툴킷을 한 번에 채웁니다: `' + SETUP + '` 를 실행합니다(subfinder / dnsx / naabu / httpx / ksubdomain 이 모두 들어 있습니다).\n'
    + '`~/.local/bin/pd-httpx` 는 `toolkit/httpx/httpx` 를 가리키는 래퍼 스크립트입니다. 없으면 `TOOL_FIXES["pd-httpx"]` 대로 다시 만듭니다;'
    + 'OneForAll 은 설치되지 않아도 주 흐름에 영향이 없습니다. subfinder + ksubdomain 으로 대체합니다.',

  'redteam-setup': '환경 스크립트는 `$DSH_HOME/redteam/setup.sh` 에 있습니다; 이 파일이 없으면 npm 판이므로 프로젝트 GitHub Release 에서 '
    + '`dsh-redteam-mode-<버전>-toolkit.tar.gz` 를 내려받아 압축을 풀고, 그 안의 README 단계를 사용자가 직접 수행합니다.\n'
    + '`FOFA_KEY` 와 VPS 설정을 마친 뒤 `dsh web` 을 재시작하고 완료 표식을 남깁니다: `mkdir -p "$DSH_HOME/redteam" && date -Is > "$DSH_HOME/redteam/.setup-complete"`. 마지막으로 `redteam_preflight` 를 한 번 더 실행해 재확인합니다.',

  'shell-handler': '로컬 수신 도구: `apt install netcat-traditional socat tmux` (MSF 경로라면 `apt install metasploit-framework` 추가).\n'
    + 'VPS 변수는 `$DSH_HOME/.env` 에서 읽습니다: 명령 앞에서 `set -a; . "$DSH_HOME/.env"; set +a`; `REDTEAM_VPS_HOST` 가 없으면 `' + SETUP + '` 를 실행해 채우고,'
    + '`.env` 를 고친 뒤에는 `dsh web` 을 재시작해야 합니다. 수신은 항상 tmux 안에서 실행해 SSH 가 끊겨도 세션이 사라지지 않게 합니다.',

  'suo5-tunnel': '`toolkit/suo5/suo5-linux-amd64` 채우기: `' + SETUP + '` 를 실행하거나 zema1/suo5 의 GitHub releases 에서 같은 이름의 바이너리를 받아 `chmod +x` 합니다.\n'
    + '터널 출구/중계는 VPS 에 의존합니다: `$DSH_HOME/.env` 에 `REDTEAM_VPS_HOST` / `REDTEAM_VPS_KEY` 를 설정하고 `dsh web` 을 재시작합니다;'
    + '터널 입구의 WebShell 은 Behinder 웹셸/Godzilla 웹셸이어야 합니다(스킬 `webshell-toolkit` 참조). 아니면 사용자가 재사용할 수 없습니다.',

  'unauth-exploit': '클라이언트 설치: `apt install redis-tools default-mysql-client python3-impacket` (MSSQL 은 `impacket-mssqlclient`).\n'
    + '내부망 대상에는 터널이 필요합니다: `apt install proxychains4` 후 `-f runs/proxychains-<port>.conf` 를 쓰거나, 먼저 스킬 `suo5-tunnel` 대로 socks5 를 세웁니다;'
    + '`REDTEAM_VPS_HOST` 가 설정되지 않으면 VPS 에 의존하는 단계는 사용 불가로 판정됩니다.',

  'vps-reverse-shell': 'VPS 채우기: `' + SETUP + '` 를 실행하면 `REDTEAM_VPS_HOST`(`USER@HOST`)와 `REDTEAM_VPS_KEY`(개인 키 경로, 기본 `$DSH_HOME/redteam/toolkit/vps/id_rsa`) 기록을 안내합니다.\n'
    + '`$DSH_HOME/.env` 를 직접 적고 `dsh web` 을 재시작해도 되고, `$DSH_HOME/skills/vps-reverse-shell.md` 를 직접 고쳐 `<VPS_IP>` / `<VPS_HOSTNAME>` 을 실제 주소로 바꿔도 됩니다.\n'
    + '개인 키는 반드시 `chmod 600`, 연결 확인은 `ssh -i $DSH_HOME/redteam/toolkit/vps/id_rsa -o BatchMode=yes <user>@<ip> \'echo ok\'` 로 합니다; 보안 그룹에서 22 와 9000-9999 를 열어 둡니다.',

  'web-fingerprint': '`~/.local/bin/pd-httpx` 가 없으면 `TOOL_FIXES["pd-httpx"]` 대로 다시 만듭니다(이것이 `toolkit/httpx/httpx` 를 exec 합니다);'
    + '`nuclei` 가 없으면 `apt install nuclei`, 기술 식별 템플릿 라이브러리는 `nuclei -update-templates` 로 채웁니다.',

  'webshell-toolkit': '`toolkit/Behinder`, `toolkit/Godzilla`, `toolkit/AntSword` 는 setup.sh 에도 없고 ' + TOOLKIT_TARBALL + ' 에도 없습니다:'
    + '각자 배포 페이지에서 직접 받아 해당 디렉터리에 둡니다.\n'
    + 'GUI 에는 Java 와 그래픽 세션이 필요합니다: `java -version` 으로 확인하고(없으면 `apt install openjdk-17-jre`), `DISPLAY=:10.0` 을 씁니다;'
    + 'GUI 가 없으면 `sed` 로 키를 바꿔 Behinder 웹셸을 바로 생성합니다(템플릿은 `toolkit/Behinder/server/`).',
}

/* ── 내부 도구 ─────────────────────────────────────────────────────────────── */

/** 흔한 확장자 (`fscan_windows_x64.exe`, `vps.sh`, `godzilla.jar` …). */
const EXT_RE = /\.(exe|zip|tar\.gz|tgz|gz|bz2|xz|jar|sh|py|bin|txt|md|json)$/i
/** 플랫폼 접미사 (`_windows_x64`, `-linux-amd64`, `_darwin_arm64` …). */
const PLATFORM_RE = /[-_](windows|win32|win64|win|linux|darwin|macos|osx|freebsd)[-_][a-z0-9_.]+$/
/** 아키텍처 접미사 (맨 `_amd64` / `-arm64`). */
const ARCH_RE = /[-_](amd64|x86_64|x64|arm64|aarch64|arm|386|i386|i686|mips[a-z0-9]*)$/

/**
 * 바이너리/디렉터리 이름을 도구 이름으로 정리합니다: 확장자를 떼고, 플랫폼·아키텍처 접미사를 떼고, 소문자로 바꿉니다.
 * 정리한 결과에 ASCII 문자가 없으면(예: `목록.md`, 순수 기호) null 을 반환합니다 — 그것은 도구 이름이 아닙니다.
 */
function cleanToolName(raw) {
  let out = String(raw == null ? '' : raw).trim()
  if (out === '') return null
  out = out.replace(EXT_RE, '')
  let prev = ''
  while (out !== '' && out !== prev) {
    prev = out
    out = out.replace(PLATFORM_RE, '').replace(ARCH_RE, '')
  }
  out = out.toLowerCase()
  return /[a-z]/.test(out) ? out : null
}

/**
 * 경로에서 도구 이름을 뽑습니다(뽑을 수 없으면 `null` 반환).
 *   · `…/redteam/toolkit/<도구>/…` → `toolkit/` 뒤의 첫 디렉터리 이름 (`suo5-linux-amd64` → `suo5`)
 *   · `~/.local/bin/xxx`, `/usr/bin/xxx`, `~/.local/xxx` → 파일 이름
 *   · 맨 이름 (`fscan_windows_x64.exe`, `gogo_linux_arm64`) → 플랫폼 접미사를 뗀 이름
 *   · 그 밖의 경로 (`/usr/share/wordlists/rockyou.txt`, `skills/x.md`) → `null`
 */
export function toolNameOfPath(p) {
  if (typeof p !== 'string') return null
  const s = p.trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/[\uFF0C\u3002\uFF1B\u3001\uFF1A,;:)\]}>\uFF09\u3011]+$/, '')
    .replace(/\\/g, '/')
  if (s === '') return null
  let candidate = null
  const at = s.lastIndexOf('toolkit/')
  if (at !== -1) {
    candidate = s.slice(at + 'toolkit/'.length).split('/').filter((seg) => seg !== '')[0] || null
  } else if (/\/bin\//.test(s) || /(^|\/)\.local\//.test(s)) {
    const segs = s.split('/').filter((seg) => seg !== '')
    candidate = segs.length > 0 ? segs[segs.length - 1] : null
  } else if (!s.includes('/')) {
    candidate = s
  }
  return candidate === null ? null : cleanToolName(candidate)
}

/** 별칭 정규화: `impacket-wmiexec` 같은 명령은 `impacket` 수리법 하나로 모읍니다. */
function canonicalTool(name) {
  const n = String(name || '')
  if (n.startsWith('impacket-')) return 'impacket'
  if (n.startsWith('enum4linux-')) return 'enum4linux'
  return n
}

/** 환경 변수는 어떻게 얻는지(확실하지 않으면 지어내지 않고 사용자가 값을 채우게 합니다). */
const ENV_HINTS = {
  FOFA_KEY: '<https://fofa.info> 로그인 → 개인 센터 → API Key 에서 얻습니다; `curl -s "https://fofa.info/api/v1/info/my?key=$FOFA_KEY"` 가 `"error":false` 를 반환하면 유효합니다',
  REDTEAM_VPS_HOST: 'VPS 접속 주소 `USER@HOST` 를 채웁니다(예: `export REDTEAM_VPS_HOST=ubuntu@203.0.113.10`)',
  REDTEAM_VPS_USER: 'VPS 접속 사용자를 채웁니다(기본 `ubuntu`)',
  REDTEAM_VPS_KEY: 'VPS 개인 키 경로를 채웁니다(기본 `$DSH_HOME/redteam/toolkit/vps/id_rsa`, 권한은 반드시 `chmod 600`)',
}

function asArray(v) {
  if (Array.isArray(v)) return v.filter((x) => typeof x === 'string' && x.trim() !== '')
  if (typeof v === 'string' && v.trim() !== '') return [v]
  return []
}

/**
 * `skill-availability.js` 의 판정으로 수리 제안 한 줄을 만듭니다.
 *
 * @param issue - `{ kind, skill, paths?, env?, placeholder? }`,
 *   `kind` ∈ `'file-missing' | 'content-missing' | 'env-missing' | 'path-missing' | 'placeholder' | 'shadowed'`.
 *   `checkSkill()` 가 반환하는 `problems` 외의 보충 필드도 받습니다; 필드 타입은 느슨합니다(문자열도 배열도 가능).
 * @returns 제안 한 줄(개행 없음; 명령은 모두 백틱 안에 있습니다). 확실하지 않으면 `SKILL_FIXES[skill]` 로, 그것도 없으면 일반 제안으로 폴백합니다.
 */
export function fixesForIssue(issue) {
  const it = issue && typeof issue === 'object' ? issue : {}
  const kind = typeof it.kind === 'string' ? it.kind : ''
  const skill = typeof it.skill === 'string' ? it.skill : ''
  const skillName = skill === '' ? '<SKILL_NAME>' : skill
  const skillHint = skill !== '' && Object.prototype.hasOwnProperty.call(SKILL_FIXES, skill) ? SKILL_FIXES[skill] : ''
  const parts = []

  if (kind === 'path-missing') {
    const tools = []
    const seen = new Set()
    for (const p of asArray(it.paths)) {
      const name = toolNameOfPath(p)
      if (name === null) continue
      const canon = canonicalTool(name)
      if (seen.has(canon)) continue          // 같은 도구는 한 번만 나열합니다
      seen.add(canon)
      tools.push({ name, canon, path: p })
    }
    if (tools.length > 0) {
      const items = tools.map(({ name, canon, path }) => {
        const fix = Object.prototype.hasOwnProperty.call(TOOL_FIXES, canon) ? TOOL_FIXES[canon] : null
        if (fix === null) {
          return '`' + name + '`(' + path + '): 로컬에 이 도구가 없습니다. `' + SETUP + '` 를 실행해 채웁니다;'
            + '그래도 없으면 해당 도구의 공식 배포 페이지에서 플랫폼에 맞는 바이너리를 받아 이 경로에 두고 `chmod +x` 합니다'
        }
        return '`' + name + '`(' + path + '): ' + fix.what + '. 수리법: ' + fix.install
      })
      parts.push('도구 ' + tools.length + '개가 없습니다. 하나씩 고칩니다: ' + items.join('; '))
      parts.push('확실하지 않으면 먼저 `' + SETUP + '` 를 실행합니다(멱등: 빠진 것은 내려받고 손상된 것은 지우고 다시 받습니다). 그다음 자체 점검을 다시 합니다.')
    }
  } else if (kind === 'env-missing') {
    const names = asArray(it.env)
    if (names.length > 0) {
      const items = names.map((n) => {
        const hint = Object.prototype.hasOwnProperty.call(ENV_HINTS, n) ? ENV_HINTS[n] : '값은 직접 제공해야 합니다'
        return '`' + n + '`: `export ' + n + '=<VALUE>` (' + hint + ')'
      })
      parts.push('환경 변수 누락: ' + items.join('; ') + '.')
      parts.push('영구 반영: `$DSH_HOME/.env` 에 적습니다(한 줄에 `NAME=VALUE` 하나, `chmod 600` 권장). 고친 뒤 `dsh web` 을 재시작해야 현재 프로세스가 읽습니다;'
        + '또는 사용자가 `' + SETUP + '` 를 실행합니다(스크립트가 안내하고 `FOFA_KEY`, VPS 관련 변수를 그 자리에서 검증합니다).')
    }
  } else if (kind === 'placeholder') {
    const ph = typeof it.placeholder === 'string' && it.placeholder.trim() !== '' ? it.placeholder.trim() : '외부 인프라 주소'
    parts.push('스킬 본문의 `' + ph + '` 가 아직 자리표시자입니다(이 환경에 VPS 가 아직 설정되지 않았다는 뜻입니다).')
    parts.push('채우는 법: `' + SETUP + '` 를 실행해 `REDTEAM_VPS_HOST`(`USER@HOST`)와 `REDTEAM_VPS_KEY`(개인 키 경로, 기본 `$DSH_HOME/redteam/toolkit/vps/id_rsa`)를 기록합니다;'
      + '`$DSH_HOME/.env` 를 직접 적고 `dsh web` 을 재시작하거나, `$DSH_HOME/skills/' + skillName + '.md` 를 직접 고쳐 자리표시자를 실제 주소로 바꿔도 됩니다(개인 키 `chmod 600` 잊지 않습니다).')
  } else if (kind === 'shadowed') {
    parts.push('스킬이 같은 이름의 판으로 가려졌습니다: `' + skillName + '` 이 다른 스킬 루트에 (설정이 더 갖춰진) 같은 이름 스킬로 하나 더 있고,'
      + '현재 스킬 루트 순서로는 앞에 있는 불완전한 것만 로드됩니다.')
    parts.push('수리법: 설정이 갖춰진 그 스킬 루트를 스킬 루트 순서의 맨 앞으로 옮기고(플러그인/스킬 디렉터리 설정에서 순서 조정), `dsh web` 을 재시작한 뒤 자체 점검을 다시 합니다;'
      + '다른 한 벌이 필요 없으면 지우거나 이름을 바꿔 다시 가려지지 않게 합니다.')
  } else if (kind === 'file-stale') {
    parts.push('스킬이 기록한 파일 경로가 로컬에 없습니다(스킬 본문은 여전히 로드되므로 호출에는 영향이 없습니다): 이런 경로는 이전에 어느 장비에서 해석된 절대 경로라서 장비를 바꾸면 반드시 빈 곳을 가리킵니다.')
    parts.push('수리법: `dsh web` 을 한 번 재시작합니다(플러그인 시작 시 동봉 스킬을 로컬 `$DSH_HOME/redteam/skills` 로 동기화합니다);'
      + '로컬 `DSH_HOME` 이 호스트가 실제로 쓰는 디렉터리와 다르면(드라이브를 바꿨거나 기본이 아닌 디렉터리에 설치), `DSH_HOME` 을 호스트가 실제로 쓰는 곳으로 지정하고 다시 재시작합니다.')
  } else if (kind === 'file-missing') {
    parts.push('스킬 파일이 없습니다: redteam 플러그인을 다시 설치하거나(또는 스킬 디렉터리를 스킬 루트에 다시 연결) 스킬 파일을 덮어쓴 뒤, `dsh web` 을 재시작하고 자체 점검을 한 번 더 합니다.')
    parts.push('직접 넣은 스킬이라면 파일이 스킬 루트 아래에 있고 파일 이름이 스킬 이름과 같은지(`<SKILL_NAME>.md`) 확인합니다.')
  } else if (kind === 'content-missing') {
    parts.push('스킬 본문을 읽을 수 없습니다(메타데이터만 있어 사용 가능 여부를 판정할 수 없습니다): redteam 플러그인을 다시 설치해 스킬 파일을 덮어씁니다;'
      + '원격 스킬 소스라면 소스에 접근 가능한지 확인한 뒤 다시 받아오고, `dsh web` 을 재시작합니다.')
    parts.push('임시로 사용 가능한지 확인하려면 에이전트가 `skill` 도구로 `' + skillName + '` 를 실제로 한 번 로드하게 합니다.')
  }

  if (parts.length === 0) parts.push(skillHint !== '' ? skillHint : GENERIC_FIX)
  return parts.join(' ')
}
