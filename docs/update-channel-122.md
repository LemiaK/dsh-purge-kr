# #122: 업데이트 네트워크와 키 파일 권한

이번에는 업데이트 채널과 자격 증명 파일 처리만 수정하고, 호스트 패치, 프롬프트, 권한 선택, 자동 업데이트 스위치는 바꾸지 않는다. DSH 를 자동 재시작하지 않고 시스템 프록시, TUN, Defender, 화이트리스트도 바꾸지 않는다.

## 동작

- Windows 정적 WinINET 설정은 시스템 `reg.exe` 로 읽기 전용 조회를 우선한다. 실패하거나 인코딩·형식이 불명확하면 시스템 Windows PowerShell 5.1 로 UTF-8 로 읽는다. 성공 결과는 30초 캐시하고 실패는 캐시하지 않으며 PAC/WPAD 는 실행하지 않는다. 두 Windows 도우미는 자기 자식 프로세스 안에서만 Windows PowerShell 5.1 시스템 모듈을 써서, PowerShell 7 모듈 경로를 상속해 Get-Acl 같은 명령 로드가 실패하는 것을 피한다. 부모 프로세스와 시스템 환경은 변하지 않는다.
- 기존 명시적 업데이트 프록시, 환경 변수, `NO_PROXY` 우선순위를 유지한다. 프록시 탐지가 실패하면 HTTP 가 아직 전송되지 않았다고 명확히 표시하고 조용히 직접 연결로 바꾸지 않는다. 릴리스 목록 강등도 원래 이유를 유지하고 더 이상 GitHub API 불가로 통칭하지 않는다.
- `ECONNRESET`, `ECONNREFUSED`, `EPIPE`, `ETIMEDOUT`, `EAI_AGAIN`, `ENETUNREACH`, `EHOSTUNREACH` 는 최대 두 번 재시도하고 백오프는 150/300 ms 다. 리다이렉트는 재시도 예산을 공유한다. 탐지, 전송, 백오프 모두 원래 요청의 총 타임아웃을 따른다. 불완전한 본문을 받은 뒤 재시도하면 그 본문을 버린다.
- HTTP 오류, 인증 실패, 인증서 오류, 프록시 설정 오류, 출처 제한, 파일 초과, SHA256 불일치는 이 계층의 재시도로 덮이지 않는다. 기존 Atom/캐시/아카이브 대체 채널 정책은 그대로이며 token 은 여전히 GitHub API 로만 보낸다.
- Windows 의 `update-channel.json` 은 최초 읽기 시 옛 파일 DACL 을 조이지만 내용은 바꾸지 않는다. 새 파일은 먼저 보호된 임시 디렉터리에 보호된 DACL 로 만들고, 그다음 평문을 쓰고 원자 교체한다. 현재 프로세스 사용자, SYSTEM, Administrators 만 허용하고 일반 Users 권한을 상속하지 않는다. 자격 증명은 자식 프로세스 stdin 으로 전달하고 명령 인자, 환경 변수, 오류 출력에 넣지 않는다.
- macOS/Linux 는 파일 `0600` 과 원자 교체를 유지한다. 동작 선호와 자격 증명은 따로 저장하고, 검사 간격만 바꿀 때 token 을 다시 쓰지 않는다. 빈 token 은 보존을 뜻하며 명시적으로 지워야 삭제된다. 비정상 JSON 은 형식 오류만 보고하고 원문을 출력하지 않는다.
- 파일이 점유되었거나, 읽기 전용이거나, 보호 도우미 실행이 실패한 경우 명확히 실패하고 옛 자격 증명을 보존한다. 이번 라운드의 정확한 임시 파일과 디렉터리만 정리하고 링크 대상을 재귀적으로 정리하지 않는다.

## 테스트 진입점

```sh
node --test test/update-http.test.mjs test/update-resilience.test.mjs test/update-secrets.test.mjs test/update-policy.test.mjs test/update-proxy-runtime.test.mjs
# 별도로 내려받은 Electron. 정식 DSH 를 가리키면 안 된다
PURGE_ELECTRON_EXEC=/path/to/isolated/Electron node scripts/check-update-runtime.mjs
# 실제 WinINET 과 공개 GitHub 릴리스 정보만 읽고 프록시나 키 값을 출력하지 않는다
node scripts/check-update-channel-runtime.mjs
```

Windows 대응은 현재 테스트 프로세스에 `PURGE_ELECTRON_EXEC` 를 설정한 뒤 같은 Node 스크립트를 실행한다. TLS 테스트는 임시 자체 서명 CA 를 쓰고 자식 프로세스 `NODE_EXTRA_CA_CERTS` 로만 신뢰한다. TLS 검증을 끄지 않고 시스템 인증서를 바꾸지 않는다. OpenSSL 이 없으면 `key.pem` / `cert.pem` 이 있는 `PURGE_TEST_TLS_DIR` 를 제공하고, 없으면 그 항목은 명확히 스킵하며 인수 완료라고 주장할 수 없다.

## 실측 범위와 경계

- macOS, 이 PC 의 Windows 11 4090: 실제 공개 GitHub 요청이 HTTP 200 을 반환했다. 4090 에서 실제 `reg.exe` 탐지 세 번은 약 9–11 ms 였고 실제 PowerShell 대체 읽기도 이와 일치했다. 이것은 모든 기계의 성능 보장이 아니다.
- 두 플랫폼 격리 Electron 44.7.0: 실제 HTTPS → CONNECT / SOCKS, 연결 리셋, 중도 단절, 타임아웃, 자격 증명 리다이렉트 격리, 다운로드 SHA256 검증. Windows 는 실제 ACL 상속, 옛 파일 마이그레이션, 읽기 전용 파일 실패, 파일 점유 실패와 해제 후 복구. 가짜 token 과 모든 변경은 임시 디렉터리 안에서 이루어졌다.
- 4090 은 실제 PowerShell 7.6.5 모듈 경로로도 재현했다: 옛 도우미는 Get-Acl 로드가 실패했고, 자식 프로세스 모듈 경로를 고친 뒤 성공했다. 실제 8.3 단축 경로와 호환되지 않는 모듈에 대한 자동 회귀도 함께 커버했다.
- 이번에 보고자의 Windows 10 19041 / 특정 Clash TUN fakeIP 환경에서는 실기 재검증하지 않았다. 보고자가 업데이트한 뒤 원래 실패가 사라졌는지 확인해야 한다. 그렇다고 그의 프록시, DNS, 모든 네트워크 장애가 해결되었다고 선언하지 않는다.
- ACL 은 이 PC 의 접근 제어이며 암호화가 아니다. 같은 사용자 프로세스, SYSTEM, 관리자가 읽는 것까지 막을 수는 없다. profile 을 공유하는 서비스는 올바른 실행 계정을 써야 하고, 테스트 통과를 위해 ACL 을 넓히지 않는다. 읽기 권한 검사는 파일 신원과 메타데이터 캐시를 따르며 지속적 파일 모니터링이 아니다.
