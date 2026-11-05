---
name: passive-recon
description: 수동 정보 수집: 대상 호스트에 접촉하지 않고 공개 데이터 소스만 사용
whenToUse: 자신을 노출하지 않으면서 대상 자산 정보를 수집해야 할 때
role: recon
enabled: true
---



## 데이터 소스
- 인증서 투명성 로그(crt.sh): `curl -s "https://crt.sh/?q=%25.<domain>&output=json" | jq -r '.[].name_value' | sort -u`
- DNS 레코드: `dig +short <domain> A/AAAA/MX/TXT/NS`
- whois: 등록자, 네트워크 대역, ASN
- 검색 엔진과 코드 호스팅 플랫폼: 유출된 서브도메인, 키, 내부 주소
- 공개 포트 측정 데이터(Shodan/Censys/FOFA 등, API 권한 필요)

## 적재 요구사항
발견할 때마다 redteam_asset_upsert 를 호출하고, provenance 는 `passive` 로 고정하며 tool 에 구체적 데이터 소스를 기록한다.


