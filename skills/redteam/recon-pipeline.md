---
name: recon-pipeline
description: ProjectDiscovery 정보 수집 파이프라인: subfinder→dnsx→naabu→httpx→katana 로 도메인 자산면을 한 번에 펼친다
whenToUse: 정보 수집 단계에서 도메인/기관명을 확보한 뒤 서브도메인→해석→포트→생존→페이지와 엔드포인트를 체계적으로 펼칠 때
role: recon
enabled: true
---

# 외부 정보 수집 파이프라인(ProjectDiscovery)

"도메인 하나"를 "제목, 기술 스택, 포트가 붙은 생존 자산 목록"으로 바꾸는 것이 정보 수집 단계의 표준 동작이다.
네 도구는 **순서가 고정되어 있다**: 먼저 서브도메인 열거 → 다음 해석 → 다음 포트 탐지 → 다음 생존 판정 → 마지막으로 페이지와 엔드포인트 수집.

## 로컬 도구

| 도구 | 경로 | 버전 | 역할 |
| --- | --- | --- | --- |
| subfinder | `$DSH_HOME/redteam/toolkit/subfinder/subfinder` | v2.16.0 | 수동 서브도메인 열거(다중 소스 집계) |
| dnsx | `$DSH_HOME/redteam/toolkit/dnsx/dnsx` | v1.3.1 | 배치 해석, DNS 브루트포스, 와일드카드 해석 필터링 |
| naabu | `$DSH_HOME/redteam/toolkit/naabu/naabu` | v2.6.1 | 고속 포트 스캔(SYN 은 root 필요, 아니면 `-scan-type c`) |
| httpx | `$DSH_HOME/redteam/toolkit/httpx/httpx`(래퍼 `~/.local/bin/pd-httpx`) | v1.12.0 | HTTP 생존/제목/기술 스택/상태 코드 |
| katana | ❌ 미설치(수집이 필요하면 스킬 `browser-automation` 사용) | — | 크롤러로 페이지와 엔드포인트 수집 |
| ksubdomain | `$DSH_HOME/redteam/toolkit/ksubdomain/ksubdomain` | v0.7 | 무상태 서브도메인 브루트포스(dnsx 브루트포스보다 빠름) |
| OneForAll | `$DSH_HOME/redteam/toolkit/oneforall/OneForAll-0.4.5/`(소스, `.venv` 필요) | v0.4.5 | 서브도메인 수집 종합 세트(사전이 커서 느리지만 빠짐없다) |

> ⚠️ **`/usr/bin/httpx` 는 Python httpx 라이브러리의 CLI 이며 ProjectDiscovery 의 것이 아니다** — 반드시 `pd-httpx` 또는 절대 경로를 쓴다.

## 표준 파이프라인

```bash
mkdir -p runs
TK=$DSH_HOME/redteam/toolkit
D=example.com

# ① 서브도메인 열거(수동, 다중 소스)
$TK/subfinder/subfinder -d $D -all -silent -o runs/subfinder-$D.txt
# 보충: 무상태 브루트포스(사전이 있을 때)
# $TK/ksubdomain/ksubdomain -d $D -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt

# ② 와일드카드 해석 필터링 + 해석 생존(dnsx 가 와일드카드 노이즈를 제거한다, 이 단계가 핵심이다)
cat runs/subfinder-$D.txt | $TK/dnsx/dnsx -silent -a -resp -o runs/dnsx-$D.txt
awk '{print $1}' runs/dnsx-$D.txt | sort -u > runs/alive-domains-$D.txt

# ③ 포트 스캔(먼저 top100 으로 빠르게 훑고, 그다음 생존 호스트의 전체 포트를 스캔)
$TK/naabu/naabu -l runs/alive-domains-$D.txt -top-ports 100 -silent -o runs/naabu-$D.txt
# 전체 포트(느리므로 범위 안인지 확인한 뒤 한다): -p - -rate 1000

# ④ HTTP 생존과 지문(제목/상태 코드/기술 스택/서버)
$TK/httpx/httpx -l runs/alive-domains-$D.txt -ports 80,443,8080,8443,8000,8888,9000 \
  -title -status-code -tech-detect -web-server -follow-redirects -silent \
  -json -o runs/httpx-$D.jsonl

# ⑤ 자산 목록으로 정리(URL 목록은 디렉터리 브루트포스/취약점 스캔에 쓴다)
python3 - <<'PY'
import json
out=set()
for line in open('runs/httpx-'+'$D'+'.jsonl'):
    try: j=json.loads(line)
    except: continue
    if j.get('url'): out.add(j['url'])
open('runs/alive-urls.txt','w').write('\n'.join(sorted(out)))
print('생존 URL:', len(out))
PY
```

## 단일 명령 빠른 참조(전체 흐름을 돌리지 않을 때)

```bash
# 서브도메인만
$TK/subfinder/subfinder -d example.com -all -silent

# 생존 URL 만(도메인 목록이 이미 있을 때)
pd-httpx -l domains.txt -silent -o alive.txt

# 포트만(단일 IP, 전체 포트)
nmap -sS -p- --min-rate 1000 -T4 1.2.3.4 -oX runs/nmap-1.2.3.4.xml   # 스킬 active-scan
$TK/naabu/naabu -host 1.2.3.4 -p - -rate 1000 -silent
```

## 다른 스킬과의 역할 분담

| 상황 | 사용할 것 |
| --- | --- |
| 기관명/도메인 → 인터넷 자산면(미등록, 동일 주체 포함) | **`fofa-recon`**(측정, 가장 빠짐없이 찾는다) |
| 도메인 → 서브도메인 → 생존 → 지문 | **이 스킬**(파이프라인, 표준화) |
| 대상에 접촉하지 않음(순수 수동) | `passive-recon`(crt.sh/dig/whois) |
| 내부망 대역 측정 | `gogo-intranet`(**이 스킬로 내부망을 치지 않는다**) |
| SPA/JS 렌더링 페이지, 엔드포인트 목록 | `browser-automation` / `kimi-webbridge` |
| 생존 호스트 포트/서비스 버전 | `active-scan`(nmap/masscan) |

**권장 순서**: `fofa-recon` 으로 면을 펼치고(기관 자산 전경 확보) → 이 스킬로 도메인마다 파이프라인을 돌리고(생존과 지문 확보) → `active-scan` 으로 핵심 IP 의 버전을 확정한다.

## 규율

1. **승인 범위 안의 대상만 테스트한다**: naabu 전체 포트, ksubdomain 브루트포스는 모두 **능동** 행위이므로 범위 안인지 확인한 뒤 한다.
2. **속도 제한**: `naabu -rate 1000` 부터 시작한다; `subfinder` 는 수동 소스만 쓰고 `-all` 을 붙이지 않으면 더 조용하다(쿼터 소모도 적다).
3. **와일드카드 해석**: `dnsx` 가 걸러 준다; 결과에 같은 IP 의 무작위 서브도메인이 대량으로 나오면 대상에 와일드카드 해석이 있다는 뜻이므로 `-wd` 로 바꾸거나 브루트포스 사전을 교체한다.
4. **API key(선택적 강화)**: `subfinder` 에 `~/.config/subfinder/provider-config.yaml` 를 설정하면
   Shodan/Censys/VirusTotal 같은 소스를 붙일 수 있다(**사용자가 key 를 제공해야 한다**, 스킬 `redteam-setup` 참조); key 가 없어도 무료 소스를 쓸 수 있다.

## 출력과 적재(강제)

1. **건별 `redteam_asset_add`**: `target`(도메인/IP), `names`(도메인), `ports`(`url=host`, `title`, `product=server` 포함),
   `provenance=passive`(subfinder/dnsx 단계) 또는 `active`(naabu/httpx 능동 탐지), `tool`(구체적 도구 이름).
2. **/24 기준 C 대역 자동 생성**(`redteam_asset_add` 가 자동 처리한다) → `redteam_asset_link` 로
   `resolves`(도메인→IP), `contains`(C 대역→IP) 관계를 만들어 그래프를 형성한다(스킬 `asset-correlation`).
3. 단계마다 `redteam_chain_add` 를 남긴다: `stage_code=recon`, `tool` 에는 실제 명령 원문을 쓰고 `result` 에는 수량 요약을 쓴다
   (예: `subfinder 적중 42 서브도메인 → dnsx 생존 31 → naabu 개방 87 포트 → httpx 생존 19 사이트`).
4. **경계 자산을 중점 표시한다**: 테스트/프리프로덕션 환경(test/dev/uat/pre/staging), 노후 시스템, 비표준 포트,
   등록 주체는 다르지만 같은 C 대역/IP 인 사이트 — `note` 에 적는다, 이런 것이 자산 정리 단계의 고우선순위 대상이다.
5. 지휘자에게 결론을 줄 때는 **숫자로 준다**: 서브도메인 수 / 생존 IP 수 / 개방 포트 수 / 생존 사이트 수 / 그중 고우선순위 몇 건.
