---
name: cn-proxy-pool
description: 중국 무료 HTTP/SOCKS5 프록시 풀: 수집, 생존 검증, 필요 시 로테이션; 명령 단위 프록시 파라미터만 쓰고 로컬 네트워크와 프록시 설정은 절대 건드리지 않는다
whenToUse: 대상에 WAF/ IP 차단 위험이 있거나 고빈도 요청(엔드포인트 브루트포스, 디렉터리 스캔, 패스워드 스프레이)이 필요할 때
role: vuln-scan
enabled: true
---

# 중국 무료 IP 프록시 풀

무료 프록시는 불안정하므로 목적은 **차단 위험을 낮추는 것**이며 신원을 숨기는 것이 아니다. 핵심 대상에는 자체 출구나 suo5 터널을 우선 쓴다.

## ⛔ 철칙: 로컬 네트워크와 프록시 설정을 건드리지 않는다

프록시는 **단일 명령에 임시로 지정하는 것만** 허용하며, 어떤 경우에도 로컬 설정을 수정하지 않는다. 다음 작업은 일절 금지한다:

| 금지 | 설명 |
|---|---|
| 시스템 프록시 설정 | GNOME/KDE 네트워크 설정, `gsettings set org.gnome.system.proxy …`, `networksetup -setwebproxy`, Windows `netsh winhttp set proxy` |
| 전역 환경 변수 쓰기 | `/etc/environment`, `/etc/profile`, `/etc/profile.d/*`, `~/.bashrc`, `~/.bash_profile`, `~/.profile`, `~/.zshrc` 의 `http_proxy` / `https_proxy` / `all_proxy` / `no_proxy` 수정 |
| 도구 전역 설정 변경 | `~/.curlrc`, `~/.wgetrc`, `~/.npmrc`, `/etc/apt/apt.conf.d/*proxy*`, `/etc/pip.conf`, `~/.docker/config.json`, `~/.gitconfig` 의 proxy 항목 |
| proxychains 전역 설정 변경 | `/etc/proxychains4.conf`, `~/.proxychains/proxychains.conf` 를 수정하지 않는다; 꼭 필요하면 `-f` 로 `runs/` 아래 임시 설정을 가리키고 사용 후 삭제한다 |
| 시스템 네트워크 조작 | iptables/nftables 규칙, 라우팅 테이블, DNS(`/etc/resolv.conf`), NetworkManager, VPN/tun 장치 기동과 중지 |
| export 지속화 | 셸에서 `export http_proxy=…` 로 세션에 남기지 않는다; 넘겨야 하면 해당 명령 앞에 **인라인**으로 붙인다 |

**올바른 방식**(모두 명령 단위, 일회성):

```bash
P=$(shuf -n1 runs/live-proxies.txt)

# 방식 1: 도구 자체의 프록시 파라미터(우선)
curl -s --proxy "http://$P" --max-time 15 -I "https://target.example.com/"
nuclei -u https://target.example.com/ -proxy "http://$P" -rate-limit 20
sqlmap -u "https://target.example.com/item?id=1" --proxy="http://$P" --batch --random-agent
ffuf -u https://target.example.com/api/FUZZ -w wordlist.txt -x "http://$P" -rate 20

# 방식 2: 이 명령에만 환경 변수를 인라인(export 하지 않으므로 프로세스가 끝나면 사라진다)
http_proxy="http://$P" https_proxy="http://$P" curl -s --max-time 15 "https://target.example.com/"

# 방식 3: 원시 TCP 만 지원하는 도구 → suo5 SOCKS5 터널 사용(스킬 suo5-tunnel),
#        이를 위해 시스템 프록시를 바꾸지 않는다; proxychains 는 임시 설정 파일을 쓴다:
proxychains4 -f runs/proxychains.tmp.conf -q nmap -sT -Pn -p 80,443 10.0.0.5
```

## 1. 수집(다중 소스 병합)
```bash
mkdir -p runs && cd runs
curl -s --max-time 20 "https://www.89ip.cn/tqdl.html?api=1&num=50&port=&address=%E4%B8%AD%E5%9B%BD&isp=" \
  | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]{2,5}' >> raw-proxies.txt
curl -s --max-time 20 "http://www.ip3366.net/free/?stype=1" \
  | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}</td>[[:space:]]*<td>[0-9]{2,5}' \
  | sed -E 's#</td>[[:space:]]*<td>#:#' >> raw-proxies.txt
curl -s --max-time 20 "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/countries/CN/data.txt" \
  | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]{2,5}' >> raw-proxies.txt
sort -u raw-proxies.txt -o raw-proxies.txt && wc -l raw-proxies.txt
```

## 2. 검증(동시 생존 측정, 쓸 수 있는 것만 남긴다)
```bash
cat > runs/check_proxy.py <<'PY'
import concurrent.futures, sys, urllib.request
TARGET = "http://www.baidu.com"   # 연결성만 측정하며 민감 데이터를 싣지 않는다
def ok(proxy):
    try:
        op = urllib.request.build_opener(urllib.request.ProxyHandler({"http": "http://" + proxy, "https": "http://" + proxy}))
        with op.open(TARGET, timeout=6) as r:
            return proxy if r.status == 200 else None
    except Exception:
        return None
with open(sys.argv[1]) as f:
    cands = [l.strip() for l in f if l.strip()]
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as ex:
    for res in ex.map(ok, cands):
        if res: print(res, flush=True)
PY
python3 runs/check_proxy.py runs/raw-proxies.txt > runs/live-proxies.txt
wc -l runs/live-proxies.txt
```

## 3. 로테이션과 속도 제한
- 요청마다 프록시를 무작위로 하나 선택한다; 실패하면 자동으로 제외하고 다음 것으로 바꾼다.
- 대상 쪽 속도 제한은 그대로 필요하다(`-rate-limit` / `--delay`); 프록시는 출구 IP 만 바꾸는 것이지 가속기가 아니다.
- 출구 IP 마다 성패를 기록하고, 같은 대상에서 3회 연속 차단되면 취약점 탐지 프롬프트의 규칙에 따라 **그 대상을 포기한다**.

## 4. 주의사항
- **무료 프록시로 자격 증명, Cookie, 업로드한 shell 을 전송하지 않는다** - 무료 프록시는 트래픽을 기록할 수 있다.
- 생존 검증은 연결성만 측정하며 실제 업무 요청으로 검증하지 않는다.
- 고빈도 브루트포스 전에 대상에 계정 잠금 정책이 없는지 확인한다; 잠금이 걸리기 전에 먼저 멈춘다.
- 사용 후 `runs/` 아래 임시 설정(예: `proxychains.tmp.conf`)을 지우고, 시스템에 프록시 흔적을 남기지 않는다.
- 승인된 드릴 범위 안에서만 사용한다.
