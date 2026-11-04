---
name: nuclei-scan
description: nuclei 템플릿 기반 취약점 스캔: 13,000+ 템플릿이 CVE/노출 면/설정 결함/기본 비밀번호를 커버하며, Nday 와 1day 탐지의 주력 수단이다
whenToUse: 취약점 발견 단계에서 생존 자산 목록을 확보한 뒤 Nday/1day 를 일괄 점검할 때; 또는 알려진 컴포넌트 버전으로 기존 템플릿 여부를 빠르게 확인하고 싶을 때
role: vuln-scan
enabled: true
---

# nuclei(템플릿 기반 취약점 탐지)

`nuclei` 는 취약점 발견 단계의 **주력**이다: 명령 하나로 CVE, 노출 면, 잘못된 설정, 기본 비밀번호, 무단 접근을 커버한다.
로컬 템플릿 라이브러리가 이미 준비되어 있으므로(경로는 아래 참조) **인터넷에서 POC 를 다시 찾지 않는다**.

## 로컬 바이너리와 템플릿

| 항목 | 값 |
| --- | --- |
| 바이너리 | `/usr/bin/nuclei`(v3.11.1) |
| 템플릿 라이브러리 | `~/.local/nuclei-templates`(**13,742개 템플릿**) |
| 템플릿 버전 | v10.9(2026-09-18 갱신) |
| 설정 | `~/.config/nuclei/config.yaml`, `.templates-config.json` |

템플릿 분포(보고서 작성 시 분류별로 인용한다): `http/` 11,364(그중 `http/cves` 4,320, `http/misconfiguration` 981,
`http/vulnerabilities` 961, `http/exposures` 707, `http/default-logins` 307), `cloud/` 663, `file/` 447,
`network/` 282, `dast/` 251.

**템플릿 갱신**: `nuclei -update-templates`(주 1회를 넘기지 않는다; 갱신 후에는 먼저 `-tl` 로 이상이 없는지 확인한다).

## 기본 사용법

```bash
# 1) 단일 대상 빠른 점검(무엇이 걸리는지 먼저 보고, 실제로 때리지는 않는다)
nuclei -u https://target.example.com -severity critical,high,medium -rl 30 -c 15

# 2) 일괄: 자산 라이브러리에서 내보낸 생존 URL 목록
nuclei -l runs/alive-urls.txt -severity critical,high -rl 50 -c 25 \
  -jsonl -o runs/nuclei-$(date +%m%d-%H%M).jsonl

# 3) 템플릿 지정(컴포넌트 버전을 알 때 → 정밀 타격, 적중률이 높고 노이즈가 작다)
nuclei -u http://target:8080 -t http/cves/2021/CVE-2021-44228.yaml
nuclei -u http://target -t http/exposures/ -t http/default-logins/

# 4) 태그(tags) 기준 일괄
nuclei -l runs/alive-urls.txt -tags seeyon,weaver,panel,exposure -rl 20

# 5) 실행될 템플릿만 나열(전송 없이 커버리지를 먼저 평가)
nuclei -l runs/alive-urls.txt -tags cve -tl
```

## 핵심 인자(이 시나리오에서 자주 쓴다)

| 인자 | 역할 | 권장 |
| --- | --- | --- |
| `-rl` | 초당 요청 상한 | 인터넷 측 30–50; WAF 에 걸린 뒤에는 5 로 낮춘다 |
| `-c` | 동시 템플릿 수 | 15–25, 너무 높으면 작은 사이트를 죽인다 |
| `-severity` | 지정 등급만 실행 | 드릴은 `critical,high` 만 신경 쓴다(중저위는 득점 없음) |
| `-tags` / `-t` | 템플릿 필터 | 지문 단서가 있으면 우선 사용하고, 전량 폭격은 하지 않는다 |
| `-jsonl -o` | 구조화 출력 | **반드시 `runs/` 에 남긴다**. 보고서에서 인용한다 |
| `-proxy` | 프록시 사용 | 노이즈 감소는 `cn-proxy-pool`; **내부망 대상은 suo5 터널에 `-proxy socks5://127.0.0.1:1080` 을 붙인다** |
| `-H` | 사용자 정의 헤더 | Cookie/Token 을 붙여 로그인 후 기능을 점검한다 |
| `-duc` | 템플릿 갱신 확인 비활성 | 일괄 실행 시 시간을 아낀다 |
| `-stats -si 30` | 진행 출력 | 긴 작업의 진행을 본다 |

## 지식 베이스와의 연동(먼저 조회하고 때린다, 중복 노동 금지)

손을 대기 전에 `redteam_poc_search` 를 먼저 실행한다(CVE / 컴포넌트 / 버전 / 본문 특징 기준). 이것은 두 계층을 한 번에 조회한다: **로컬 POC 지식 베이스 + 로컬 nuclei 템플릿 라이브러리**.
적중하면 `redteam_poc_get` 으로 전문을 받거나 바로 `nuclei -t <템플릿>` 을 쓴다; 두 계층에 모두 없을 때만 인터넷에서 찾고, 그것도 안 되면 직접 만든다.

검증에 성공한 새 템플릿/EXP 는 `redteam_poc_add` 로 지식 베이스에 환류한다(`category` + `engagement` + `asset_target` + `verified` + `verified_note` 를 포함하고, 이번 표적 정보는 비식별화한다).

## 노이즈 감소와 자체 보호(중요)

1. **기본 ignore 가 위험 태그를 이미 제외한다**: `~/.config/nuclei/.nuclei-ignore` 에 `dos`, `local`, `fuzz`, `bruteforce`, `txt-service` 가 기본 무시된다 ——
   **"더 넓게 때리려고" 이 무시 항목을 지우지 않는다**. DoS 계열 템플릿은 운영 시스템을 죽여 드릴 자체를 망친다.
2. **먼저 탐색 후 발사**: `-severity critical,high` 로 한 라운드 돌린다; 적중한 뒤에 그 항목만 깊게 본다. 처음부터 전량을 돌리지 않는다.
3. **WAF/차단 처리**: 막히면 먼저 `-rl` 을 5 로 낮추고 `--delay 1s` 를 붙이며 UA 를 바꾼다(`-H "User-Agent: ..."`),
   필요하면 스킬 `cn-proxy-pool` 로 출구를 바꾼다; **같은 대상에서 누적 3회를 넘게 차단되면 즉시 포기**하고(`redteam_asset_test` status=abandoned + blocked=true) 다음 대상으로 넘어간다.
4. **운영 시스템은 업무 피크를 피한다**: 스케줄 작업, 일괄 작업 계열 템플릿(동기화나 인덱스 재생성을 유발하는 것)은 먼저 테스트/스테이징 자산에서 검증한다.

## 출력과 적재(강제)

실행이 끝나면 즉시 적재한다. **마지막까지 모아 두지 않는다**:

1. `runs/nuclei-*.jsonl` 을 읽고 항목마다 `redteam_vuln_add`:
   - `title`(템플릿명 + 적중 지점), `severity`, `cve`(템플릿의 `classification.cve-id`), `target`(**포트 포함**),
     `evidence`(적중 회신/응답 특징/matched-at), `confidence=confirmed`(nuclei 적중은 응답 수준에서 이미 확인된 것이다),
     `gained`(이것으로 무엇을 얻을 수 있는가), `agent=vuln-scan`.
2. **확인된 취약점마다 `redteam_http_evidence_add` 한 건**: 요청 라인 + Host + 핵심 요청 헤더 + 응답 요약(템플릿의 `curl-command` 필드를 그대로 쓸 수 있다).
3. 핵심 동작마다 `redteam_chain_add`: `stage_code=recon` 또는 `internet`,
   `tool` 에 **실제 명령 원문**(예: `nuclei -l runs/alive-urls.txt -severity critical,high -rl 50 -jsonl -o runs/nuclei-0918.jsonl`),
   `result` 에 회신 요약(예: `3건 적중: CVE-2023-xxxx(critical)…`).
4. 해당 자산 점검이 끝나면 즉시 `redteam_asset_test` 로 환류: `status`(testing/tested/no_surface/blocked), `test`(추가식 결론), `surface`(무엇이 남아 있는가).
5. **득점 가능한 면만 기록한다**: 득점과 무관한 정보 노출, 버전 노출, CORS/CSRF, SSL 과 응답 헤더 계열 문제는 **한 줄짜리 제외 결론으로만 남기고** 깊게 파지 않으며 반복 실행하지 않는다.

## 흔한 함정

| 증상 | 원인 | 처리 |
| --- | --- | --- |
| 하나도 적중하지 않음 | 대상이 HTTP 가 아니거나 템플릿이 ignore 됨 | `-tl` 을 붙여 실제로 어떤 템플릿이 돌았는지 보고, 프로토콜을 확인한다(`-t http/` vs `network/`) |
| `could not resolve` 대량 발생 | URL 목록에 죽은 링크가 있다 | `pd-httpx` 로 생존 필터: `pd-httpx -l all.txt -o alive-urls.txt -silent` |
| low/info 가 잔뜩 적중 | severity 를 제한하지 않았다 | 드릴에서는 `-severity critical,high,medium` 을 붙인다 |
| 대상이 죽음 | 동시성이 너무 높거나 dos 템플릿이 돌았다 | `-rl`/`-c` 를 낮춘다; ignore 파일이 건드려지지 않았는지 확인한다 |
| 내부망 대상에 닿지 않음 | 터널을 쓰지 않았다 | `-proxy socks5://127.0.0.1:<suo5 포트>` 를 붙인다(스킬 `suo5-tunnel`) |
