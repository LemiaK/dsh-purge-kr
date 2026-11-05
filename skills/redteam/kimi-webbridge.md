---
name: kimi-webbridge
description: Moonshot 의 Kimi 브라우저 확장(WebBridge)으로 사용자의 실제 Chrome/Chromium 을 구동: 탐색, 페이지 읽기, 클릭, 폼 입력, JS 실행, 스크린샷
whenToUse: 브라우저 로그인 세션으로 백오피스에 접근해야 하거나 / JS 렌더링 페이지가 필요하거나 / 실제 브라우저 지문이 필요할 때
role: recon
enabled: true
---

# Kimi WebBridge(브라우저 확장 + 로컬 데몬)

설치되어 실행 중이다: 데몬 **v2.0.8**(systemd 서비스 `kimi-webbridge`, 부팅 시 자동 시작), `127.0.0.1:10086` 리스닝, 바이너리 `~/.kimi-webbridge/bin/kimi-webbridge`.

## 현재 상태(2026-09 실측)
- 데몬: **systemd 가 관리한다**(`/etc/systemd/system/kimi-webbridge.service`, `enabled` + `active`, `Restart=on-failure`).
  상태 확인: `systemctl status kimi-webbridge`; 재시작은 `sudo systemctl restart kimi-webbridge`.
  **`kimi-webbridge start`/`upgrade` 를 수동으로 다시 실행하지 않는다**, 그러면 떠도는 프로세스가 생기고 systemd 는 오히려 inactive 가 된다; 업그레이드는 다음 순서로 한다
  `sudo systemctl stop kimi-webbridge && ~/.kimi-webbridge/bin/kimi-webbridge upgrade && sudo systemctl start kimi-webbridge`.
- 확장: **Kimi WebBridge v2.0.8, 기업 정책으로 Chrome 웹 스토어에서 자동 설치된다**(확장 ID `fldmhceldgbpfpkbgopacenieobmligc`).
  정책 파일 `/etc/opt/chrome/policies/managed/kimi-webbridge.json` 와 `/etc/chromium/policies/managed/kimi-webbridge.json`
  둘 다 `ExtensionSettings.force_installed` + `ExtensionInstallForcelist` 를 설정하므로 **Chrome / Chromium 은 어떤 profile 로 열어도 확장이 기본 포함되고 자동 업데이트되며 상시 활성화된다**.
- Chrome 137+ 는 `--load-extension` 을 무시하며(`--disable-features=…` 우회로도 통하지 않는다), 따라서 **압축 해제 로딩 경로를 다시 쓰지 않는다**.
- `status` 에 `extension_connected: false` 가 보이면: 99% 는 **브라우저가 실행 중이 아닌 것**뿐이므로, 아무 브라우저나 기동하면(`kimi-chrome` 또는 Chrome/Chromium 아이콘 직접 클릭) 5초 안에 자동으로 연결된다.
- 단순 페이지 내용 추출은 스킬 `browser-automation` 을 우선 쓴다(더 빠르고 브라우저 창에 의존하지 않는다); **실제 로그인 세션을 재사용해야 할 때는 반드시 이 스킬을 쓴다**

## 전제 조건
1. 데몬이 실행 중이어야 한다: `~/.kimi-webbridge/bin/kimi-webbridge status` 가 `"running": true` 를 보여야 한다(부팅 시 자동 시작, 정상이라면 개입할 필요 없다).
2. **브라우저 하나가 반드시 실행 중이어야 한다**(확장은 브라우저 프로세스가 살아 있을 때만 연결을 유지한다). 런처 `~/.local/bin/kimi-chrome`:
   - 기본적으로 Chrome **기본 profile** 을 실행한다(실제 로그인 세션이 담겨 있고, 브리지의 가치가 여기에 있다);
   - `KIMI_BROWSER=chromium kimi-chrome` 로 Chromium 을 쓴다; `KIMI_PROFILE=/path kimi-chrome` 로 별도 profile 을 지정한다(로그인 세션 없음).
3. 연결 확인:
```bash
curl -s http://127.0.0.1:10086/status | python3 -m json.tool
# "extension_connected": true 가 보여야 하며, 아니면 이후 명령이 실패한다
```

## 호출 방식
```bash
WB=http://127.0.0.1:10086/command
call() { printf '%s' "$2" > /tmp/wb.json; curl -s -X POST $WB -H 'Content-Type: application/json' --data-binary @/tmp/wb.json; }
```
> 유니코드(한글)가 포함된 JSON 은 항상 임시 파일 + `--data-binary` 로 보낸다, echo/heredoc 으로 인라인하지 않는다.

### 자주 쓰는 액션
```bash
# 페이지 열기(새 탭)
call navigate '{"action":"navigate","args":{"url":"https://target.example.com/login","newTab":true,"group_title":"recon"},"session":"recon1"}'

# 페이지 순수 텍스트 읽기(가장 많이 쓴다)
call evaluate '{"action":"evaluate","args":{"code":"(() => document.body.innerText.slice(0,6000))()"},"session":"recon1"}'

# 접근성 트리 가져오기(@e 요소 참조가 포함되어 이후 click/fill 에 편하다)
call snapshot '{"action":"snapshot","args":{},"session":"recon1"}'

# 임의 JS 실행: 프런트엔드 엔드포인트 목록 수집(정보 수집/엔드포인트 발견의 핵심)
call evaluate '{"action":"evaluate","args":{"code":"(() => {const s=new Set();for(const e of performance.getEntriesByType(\"resource\"))s.add(e.name);const m=document.documentElement.innerHTML.match(/[\\\"\\x27]\\/(api|v[0-9])\\/[a-zA-Z0-9_\\-\\/{}]+/g)||[];m.forEach(x=>s.add(x));return [...s].slice(0,200).join(\"\\n\")})()"},"session":"recon1"}'

# 클릭 / 폼 입력
call click '{"action":"click","args":{"ref":"@e12"},"session":"recon1"}'
call fill  '{"action":"fill","args":{"ref":"@e15","value":"admin"},"session":"recon1"}'

# 스크린샷(파일 경로를 반환하며 base64 가 아니다)
call screenshot '{"action":"screenshot","args":{"path":"$DSH_HOME/redteam/engagements/<TARGET>/runs/shot.png"},"session":"recon1"}'

# 네트워크 요청 수집(엔드포인트 찾기)
call network '{"action":"network","args":{},"session":"recon1"}'

# 탭 목록/닫기
call list_tabs '{"action":"list_tabs","args":{},"session":"recon1"}'
call close_session '{"action":"close_session","args":{},"session":"recon1"}'
```
원시 CDP 패스스루(고급): `{"action":"cdp","args":{"method":"Network.getAllCookies"}}`.

## 레드팀 흐름에서의 사용법
- **엔드포인트 발견**: 사이트를 열고 → `evaluate` 로 resource timing + 페이지 내 JS 의 엔드포인트 경로를 수집하고 → 엔드포인트 목록을 취약점 탐지 역할에 넘겨 권한 우회/비인가 테스트를 한다.
- **로그인 세션 페이지**: 사용자가 브라우저에서 이미 로그인한 백오피스는 `navigate` + `evaluate` 로 바로 내용을 읽을 수 있고 다시 로그인할 필요가 없다.
- **JS 렌더링 사이트**: curl 보다 실제에 가깝고 SPA 렌더링 후의 DOM 을 얻을 수 있다.
- 발견한 URL/제목은 평소대로 `redteam_asset_add` 로 되돌려 기록한다(`tool="kimi-webbridge"`).

## 제약(반드시 알아야 한다)
- **headless 없음**: 그래픽 세션이 반드시 있어야 한다(이 PC 는 `DISPLAY=:10.0` 사용 가능).
- Chrome/Edge 만 지원한다; 교차 출처 iframe 은 지원하지 않는다; `click`/`fill` 은 합성 이벤트이므로 캡차/은행 보안 컨트롤에는 동작하지 않는다.
- 확장과 데몬 버전이 강하게 결합되어 있다: `status` 의 `update_available` 이 비어 있지 않으면 위의 systemd 정지 → `upgrade` → 기동 절차로 데몬을 업그레이드한다; 확장은 정책에 따라 최신 버전으로 자동 업데이트된다.
- Linux 는 공식 지원 매트릭스에 없다(동작하지만 보장하지 않는다).

## 확장이 없을 때의 대체 수단
스킬 `browser-automation` 을 참조한다(headless chromium 무의존성 방식).
