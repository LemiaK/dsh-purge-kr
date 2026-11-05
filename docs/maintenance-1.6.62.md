# 1.6.62 유지보수 기록

## rc.5 증거

- 출처: `https://download.deepseek.com/dsh-desk/bin/mac-arm64/deepseek-harness-0.2.1-rc.5-mac-arm64.zip`(nightly feed, 2026-10-29).
- 방법: `app.asar` + `app.asar.unpacked` 를 풀어 `@deepseek-ai` 전체 트리에 `patchDrift` 를 실행했다: `checked 82 / drifted 0`. `optionalDrift` 는 #76 뿐(프리셋 본문은 처리할 필요 없음)이고 `missing` 은 서드파티 대상뿐이다.
- 데스크톱 셸: app 디렉터리를 `Resources/app` 로 두면 #45/#46/#82/#83/#84 가 모두 적용 가능하다.
- 경계: 소스 수준 드리프트 0 + 실제 치환 검증. 런타임 동작은 사용자가 업데이트 후 `selfcheck`/`diagnose` 를 실행해 확인해야 한다.

## #107 판단 근거

- `lib/identity.js` 는 `<|im_start|>system:` 만 남긴다. `<|im_end|>` 는 `stripChatmlTags` 의 삭제 분기에만 나온다.
- 호스트 트리 `@deepseek-ai/*` 검색: `im_start`, `im_end`, `project_instructions` 모두 0 건.
- 보고자 로그 `anchorApplied=false 653/653`, `policy=fallback` 은 "호스트에 ChatML 앵커 없음"과 일치한다.
- 규칙: 짝을 이룬 봉투는 보존, 한쪽만 있는 열린 태그는 삭제, `<project_instructions>` 의 닫힘은 그대로 둔다.

## #91 / #92 출처

PR #113 의 `lib/core.js` 패치 두 개와 `client-connection` 대상을 가져왔다. 그 PR 의 중복 릴리스와 대체판 릴리스 노트는 채택하지 않았다.
