---
name: browser-automation
description: 무의존성으로 Chrome/Chromium 을 구동해 JS 렌더링 페이지 수집, 스크린샷, JS 실행, 엔드포인트 목록 수집(headless 폴백 + playwright-cli)
whenToUse: SPA 렌더링 / JS 로 생성된 콘텐츠 추출 / 스크린샷 증거 확보 / 대량 페이지 수집이 필요할 때(Kimi 확장을 쓸 수 없을 때 우선 선택)
role: recon
enabled: true
---

# 브라우저 자동화(headless Chrome)

이 PC: `/usr/bin/chromium` 150.0.7871.181, `DISPLAY=:10.0`, Node v22.23.2.

## 1. 무의존성: chromium 명령줄(가장 안정적)
```bash
CHROME=/usr/bin/chromium
FLAGS="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage --virtual-time-budget=8000"

# 1) 렌더링된 DOM 수집(SPA 에서도 콘텐츠를 얻는다)
$CHROME $FLAGS --dump-dom "https://target.example.com/" 2>/dev/null > runs/page.html

# 2) 순수 텍스트만 추출
$CHROME $FLAGS --dump-dom "https://target.example.com/" 2>/dev/null \
  | python3 -c "import sys,re;h=sys.stdin.read();print(re.sub(r'<[^>]+>',' ',re.sub(r'(?is)<(script|style).*?</\1>',' ',h)))" | head -200

# 3) 스크린샷으로 증거 보존
$CHROME $FLAGS --window-size=1440,900 --screenshot=runs/shot-$(date +%s).png "https://target.example.com/"

# 4) Cookie 를 포함해 접근(로그인 세션 재사용: Burp/브라우저에서 Cookie 를 내보낸 뒤 기록)
$CHROME $FLAGS --user-data-dir=/tmp/rt-profile --dump-dom "https://target.example.com/admin"

# 5) PDF 생성
$CHROME $FLAGS --print-to-pdf=runs/page.pdf "https://target.example.com/"
```

### 프런트엔드 엔드포인트 목록 수집(정보 수집의 핵심)
```bash
# chromium 으로 JS 를 실행하고 결과를 출력
$CHROME $FLAGS --dump-dom "https://target.example.com/" 2>/dev/null > runs/page.html
python3 - <<'PY'
import re, json, pathlib
html = pathlib.Path('runs/page.html').read_text(errors='ignore')
paths = set(re.findall(r'["\'](/(?:api|rest|v[0-9]|admin|user|order|upload|file)[A-Za-z0-9_\-/{}.:]{0,80})["\']', html))
print('\n'.join(sorted(paths)))
PY
# 이어서 JS 리소스를 개별로 내려받아 추출한다:
grep -oE 'src="[^"]+\.js[^"]*"' runs/page.html | sed 's/src="//;s/"$//' | while read u; do
  case "$u" in http*) url="$u";; /*) url="https://target.example.com$u";; *) url="https://target.example.com/$u";; esac
  curl -s "$url" | grep -oE '["\'](/(api|rest|v[0-9])[A-Za-z0-9_\-/{}.:]{0,80})["\']' | tr -d '"'"'" >> runs/interfaces.txt
done
sort -u runs/interfaces.txt
```

## 2. playwright-cli(상호작용/대기가 필요하거나 페이지가 많을 때)
**이 PC 에는 브라우저가 이미 설치되어 있다**(`~/.cache/ms-playwright/chromium-1243`, `npx playwright install chromium` 은 한 번 실행 완료). 주의: **기본값인 chrome 채널로 가면 `Chromium distribution 'chrome' is not found` 오류가 나므로 반드시 `--browser chromium` 을 붙인다**.

```bash
PW="npx --yes @playwright/cli@latest"
$PW -s=recon1 open --browser chromium "https://target.example.com/"   # 열기(-s 로 세션 이름 지정)
$PW -s=recon1 snapshot                                                # 접근성 트리 + @e 요소 참조
$PW -s=recon1 eval "() => document.title"                             # JS 실행
$PW -s=recon1 find "로그인"                                            # 스냅샷에서 텍스트 검색
$PW -s=recon1 click "@e5"                                             # 클릭
$PW -s=recon1 fill "@e7" "admin"                                      # 폼 입력
$PW -s=recon1 screenshot --path runs/pw.png                           # 스크린샷
$PW -s=recon1 --persistent --profile runs/pw-profile open --browser chromium URL   # 로그인 세션 재사용
$PW -s=recon1 close                                                   # 세션 닫기
```

로그인 세션 재사용: `--persistent --profile <dir>`; 최초 로그인 후 해당 profile 이 Cookie 를 보존하므로 이후 같은 profile 로 열면 이미 로그인된 상태다.
자주 쓰는 하위 명령: `open / goto / snapshot / find / eval / click / fill / press / upload / screenshot / resize / reload / go-back / close / list`.

## 3. 선택 가이드
| 상황 | 사용할 것 |
|---|---|
| 페이지 내용/스크린샷/엔드포인트 목록만 필요 | chromium 명령줄(무의존성, 가장 빠름) |
| 클릭/폼 입력/대기/다중 탭이 필요 | playwright-cli(`--browser chromium`)|
| 사용자의 실제 로그인 세션을 재사용해야 함 | Kimi WebBridge(스킬 `kimi-webbridge`, 확장 필요) |

## 주의사항
- `--no-sandbox` 는 이 PC 의 드릴 환경에서만 사용한다; 이 파라미터를 운영으로 가져가지 않는다.
- 수집한 URL/제목은 `redteam_asset_add` 로 되돌려 기록하고(`url`/`title` 필드), 엔드포인트 목록은 `runs/` 에 쓰고 공격 체인에서 참조한다.
- 스크린샷과 페이지 내용에는 민감 데이터가 포함될 수 있으므로 `runs/` 에만 두고 자산 라이브러리에 기록하지 않는다.
