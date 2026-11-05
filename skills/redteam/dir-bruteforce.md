---
name: dir-bruteforce
description: 디렉터리와 파일 브루트포스: 관리 화면 진입점, 백업 파일, 설정 노출, 소스와 버전 관리 저장소 노출(ffuf/feroxbuster/dirsearch/gobuster)
whenToUse: Web 이 살아 있는 것은 확인했지만 지문에 직접적인 Nday 단서가 없을 때; 관리 화면 진입점, 백업, 설정, 소스, 업로드 지점 같은 숨은 경로를 찾아야 할 때
role: vuln-scan
enabled: true
---

# 디렉터리와 파일 브루트포스(진입점을 찾는 주력)

**실전에서 대부분의 진입점은 CVE 로 뚫은 것이 아니라 디렉터리 브루트포스로 찾아낸다**: 관리 화면 `/admin`, 백업 `www.zip`, 설정 `.env`,
소스 `.git/`, 인터페이스 문서 `swagger-ui.html`, 업로드 지점, 디버그 페이지, actuator/druid 모니터링 콘솔.
이 스킬은 로컬에 준비된 네 가지 도구를 다룬다. **하나만 쓰지 않는다** —— 사전과 판정 로직이 달라 서로 보완한다.

## 로컬 도구

| 도구 | 경로 | 버전 | 특징 |
| --- | --- | --- | --- |
| **feroxbuster** | `/usr/bin/feroxbuster` | 2.13.1 | Rust, 재귀 브루트포스가 가장 강력하고 디렉터리 계층을 자동으로 따라간다. **우선 선택** |
| **ffuf** | `/usr/bin/ffuf` | 2.1.0-dev | 가장 빠르고 유연하다. 다중 사전/vhost/파라미터 fuzz 지원 |
| **dirsearch** | `$DSH_HOME/redteam/toolkit/dirsearch/dirsearch` | v0.5.0 | Python. `setup.sh` 가 내려받지 않으므로 그 경로에 직접 넣어야 한다 |
| **gobuster** | `/usr/bin/gobuster` | — | 가볍고 안정적, dir/dns/vhost 세 모드 |

## 1. feroxbuster(우선 선택: 재귀 + 자동 필터)

```bash
feroxbuster -u https://target.example.com \
  -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt \
  -x php,asp,aspx,jsp,html,js,zip,tar.gz,bak,sql,txt,xml,json,config \
  -d 3 -t 30 --rate-limit 80 --timeout 10 \
  --filter-status 404 --filter-size 0 \
  -o runs/ferox-target.txt --json -o runs/ferox-target.json
```

요점: `-d 3`(재귀 깊이)을 너무 크게 열지 않는다; `--rate-limit` 으로 서버가 숨 쉴 틈을 준다; `-x` 확장자 목록에는 반드시 **백업과 설정 계열**을 넣는다.

## 2. ffuf(가장 빠름, 다중 사전 / vhost / 파라미터)

```bash
# 디렉터리와 파일(두 라운드: 먼저 디렉터리, 다음 적중한 디렉터리에 확장자를 붙인다)
ffuf -u https://target/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt \
  -mc 200,204,301,302,307,401,403,500 -fc 404 -t 40 -rate 80 -timeout 10 \
  -o runs/ffuf-dir.json -of json

# 민감 파일(백업/설정/소스/키)
ffuf -u https://target/FUZZ -w /usr/share/seclists/Discovery/Web-Content/quickhits.txt \
  -mc all -fc 404 -t 40 -o runs/ffuf-quick.json -of json

# vhost 가상 호스트 발견(같은 IP 의 여러 사이트, 주변 자산이 여기서 자주 나온다)
ffuf -u https://target/ -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt \
  -fs 0 -mc all -t 50 -o runs/ffuf-vhost.json -of json
```

## 3. dirsearch(사전이 풍부해 누락 보완에 적합)

```bash
$DSH_HOME/redteam/toolkit/dirsearch/dirsearch \
  -u https://target.example.com -e php,asp,aspx,jsp,zip,bak,txt,sql,json \
  --random-agent -t 30 --delay 0.1 --exclude-status 404 \
  -r -R 3 --format json -o runs/dirsearch-target.json
```

## 4. gobuster(가벼운 최후 수단)

```bash
gobuster dir -u https://target -w /usr/share/seclists/Discovery/Web-Content/common.txt \
  -x php,asp,aspx,jsp,zip,bak -t 30 -k -o runs/gobuster-target.txt
```

## 사전(로컬에 이미 있으므로 이것을 우선 쓴다)

| 용도 | 경로 |
| --- | --- |
| 대형 디렉터리 사전 | `/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt` |
| 중형 디렉터리 사전 | `/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt` |
| 흔한 파일 | `/usr/share/seclists/Discovery/Web-Content/common.txt` |
| 민감 파일(quickhits) | `/usr/share/seclists/Discovery/Web-Content/quickhits.txt` |
| 서브도메인(vhost 용) | `/usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt` |

사전 디렉터리: `/usr/share/seclists`, `/usr/share/wordlists`. **사전이 없을 때**는 `redteam_credential_list` 에 이미 수집된
기관 단어(브랜드명, 병음 약어)로 작은 사전을 직접 만든다 —— 표적 맞춤 사전의 적중률이 범용 대형 사전보다 높은 경우가 많다.

## 중점 목표(스캔에서 나오면 끝까지 따라간다)

| 적중 | 다음 단계 |
| --- | --- |
| `/admin`, `/manage`, `/login`, 관리 화면 경로 | 계정 권한 경로로 넘긴다: 기본 비밀번호/약한 비밀번호(스킬 `credential-attack`) |
| `.git/`, `.svn/`, `.env`, `config.php.bak`, `www.zip`, `web.rar` | **소스와 설정 노출**: 내려받아 데이터베이스 연결 문자열, 키, 하드코딩된 계정을 찾는다 → `redteam_credential_add` |
| `swagger-ui.html`, `/v2/api-docs`, `/openapi.json` | 전체 인터페이스 목록 추출 → 무단 접근과 권한 우회 탐지(스킬 `unauth-exploit`) |
| `actuator`, `druid`, `/console`, `/jmx` | 무단 접근 모니터링 콘솔, 흔히 RCE 나 데이터베이스로 직결된다 |
| 업로드 지점, 가져오기, 백업 복원, 템플릿/리포트 디자인 | 취약점 익스플로잇 역할에 넘겨 getshell 체인을 잇는다 |
| `.ssh/`, `id_rsa`, `*.pem`, `*.jks` | 개인 키 노출 → 바로 로그인 시도(`ssh -i`) |

## 노이즈 감소와 자체 보호

1. **소프트 404 를 반드시 먼저 걸러낸다**: 존재하지 않는 무작위 경로를 먼저 요청해 상태 코드와 응답 길이를 보고, 그것으로 `--filter-size` / `-fs` 를 정한다.
2. **속도 제한**: `-rate 80` / `--delay 0.1` / `-t 30` 으로 시작한다; WAF 에 막히면(403/429 대량) 먼저 5–10 req/s 로 낮춘다.
3. **위험 경로는 건드리지 않는다**: `/logout`, `/reboot`, `/shutdown`, `/delete*`, `/reset*` 처럼 상태를 바꾸는 경로는 브루트포스하지 않고,
   사전에 있더라도 제외한다(업무 중단을 유발하고, 드릴 득점으로도 인정되지 않는다).
4. **차단이 3회를 넘으면** 그 자산을 포기하고(`redteam_asset_test` status=abandoned + blocked=true) 다음으로 넘어간다.
5. **내부망 대상은 터널을 쓴다**: feroxbuster `--proxy socks5://127.0.0.1:1080`, ffuf `-x socks5://127.0.0.1:1080`
   (스킬 `suo5-tunnel`).

## 출력과 적재(강제)

1. **숨은 경로 자체는 득점 항목이 아니지만, 무언가를 얻은 경로는 모두 적재한다**:
   - 관리 화면/업로드 지점/인터페이스 문서를 찾으면 → 그 자산의 `redteam_asset_test` `surface` 에 기록하고(추가식), 취약점 발견/익스플로잇의 다음 동작으로 넘긴다;
   - 소스/설정/키/자격 증명이 노출되면 → `redteam_credential_add`(`source=설정 노출`, `tool` 에 경로와 명령, 평문은 `secret_value`);
   - 무단 접근 가능한 인터페이스/모니터링 콘솔 → 바로 `redteam_vuln_add`(`evidence` 회신 포함) + `redteam_http_evidence_add`.
2. 핵심 동작마다 `redteam_chain_add`: `stage_code=internet`(또는 `internal`),
   `tool` 에 실제 명령 원문(예: `feroxbuster -u https://target -w raft-large-directories.txt -x php,zip,bak -d 3 --rate-limit 80`),
   `result` 에 적중 요약(예: `/admin/, /backup/www.zip, /.env 적중`).
3. 실행이 끝나면 즉시 `redteam_asset_test` 로 `status`/`test`/`surface` 를 환류한다 —— 상태를 쓰지 않으면 다음 사람이 반드시 다시 스캔한다.
4. 사전과 결과 파일은 모두 `runs/` 에 둔다(보고서가 재현 가능해야 한다).
