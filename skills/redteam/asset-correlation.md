---
name: asset-correlation
description: 자산 연관: 도메인↔IP↔C 대역↔인증서↔서비스의 그래프화
whenToUse: 정보 수집 단계를 마무리하며, 자산 관계 뷰를 만들어야 할 때
role: recon
enabled: true
---

## 연관 규칙
- 도메인 해석 → `resolves` 간선(domain → asset)
- C 대역 소속 → `contains` 간선(segment → asset)
- 포트 개방 → `exposes` 간선(asset → port)
- 인증서 SAN 공유 → `shares_cert` 간선

## 적재 요구사항
redteam_asset_link 로 edge 테이블에 기록한다; 중복 관계는 멱등이다.
