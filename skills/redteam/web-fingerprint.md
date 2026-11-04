---
name: web-fingerprint
description: Web 서비스 지문 식별: 프레임워크, 미들웨어, CMS, 컴포넌트 버전
whenToUse: HTTP/HTTPS 서비스를 이미 발견했고 기술 스택을 식별해야 할 때
role: recon
enabled: true
---

## 방법
1. 응답 헤더: `Server`, `X-Powered-By`, `Set-Cookie` 특징.
2. 페이지 특징: favicon 해시, 정적 리소스 경로, 오류 페이지, robots.txt.
3. 능동 탐지: nuclei 기술 식별 템플릿 `nuclei -u <url> -tags tech`; HTTP 생존과 기술 스택 집계는 `~/.local/bin/pd-httpx -l urls.txt -tech-detect -title -status-code -web-server` 로 한다(**ProjectDiscovery 판은 반드시 pd-httpx 를 써야 한다, `/usr/bin/httpx` 는 Python 라이브러리의 CLI 이다**).
4. 대역 단위 대량 지문은 스킬 `gogo-intranet` 을 쓴다(`gogo -i <cidr> -p top2 -v --af`, 능동 지문에는 `-v` 를 붙인다).
5. 버전 대조: 지문에서 제품과 버전을 추론해 취약점 탐지에 대비한다.

## 적재 요구사항
fingerprint 테이블에 기록한다: category(프레임워크/미들웨어/CMS/컴포넌트), vendor, product, version, evidence.
