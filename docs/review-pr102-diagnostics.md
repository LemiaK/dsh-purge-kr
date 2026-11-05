# PR #102: 부분 대상 진단 후속 조치

`resolveInstance` 의 프로세스 진입점 분기는 부분적으로 식별된 호스트와 그 프로브 증거를 버렸고, 명시적 선택자는 그것을 유지했다. 후속 조치는 두 경로에 같은 설명 형태를 반환하며 `resolved: false` 를 유지하고, 누락된 컴포넌트나 EACCES/EIO 오류를 보존한다. 전역 스캔은 추가하지 않는다. #126 의 진단 전용 수정도 포함한다: 비교 대상이 미지이면 `unknown_target` / `matches_target: null` 이며, 다른 설치라고 증명된 것이 아니다.

HTTP 테스트 픽스처는 이제 원래 디스크 파일 시스템을 쓴다. Windows Electron 에서는 자식이 종료될 때까지 ASAR 핸들이 열린 채 남을 수 있다; 명시적 Node 부모 하네스는 그 종료 이후에만 임시 픽스처 디렉터리를 제거하고 삭제 여부를 검증한다. 정리 오류는 계속 치명적이다. 정식 앱으로의 폴백은 없다.

## 2026-11-04 검증

- macOS 와 Windows 11 테스트 머신: 격리 Electron 에서 대상 테스트 16개 통과, 이어서 부모 프로세스의 픽스처 제거 성공.
- 여기에는 임시 공식/NEXT 형태 패키지 및 ASAR 픽스처에 대한 실제 Cordis status/selfcheck/diagnose 핸들러 실행과, 누락 대상, 부분 대상, 읽기 오류 회귀 케이스가 포함된다. 모델을 호출하거나 호스트 패치를 적용하지 않는다.
- 원본 PR head 에 대한 음성 대조: 새 부분 대상/오류 단언 세 개가 실패한다. 원래의 미지 대상 분류기는 세 케이스에서 실패한다.
- 이 테스트는 NEXT 데스크톱 전체 설치, 옛 호스트 패치 마이그레이션, GUI 기동, 업그레이드, 롤백 호환성을 입증하지 않는다. 원본 PR 의 그 부분은 별도의 검토/인수 작업으로 남는다.

일반 Node 에서 대상 Electron 진단을 실행한다:

```sh
PURGE_ELECTRON_EXEC='/absolute/path/to/isolated/electron' node scripts/check-instance-diagnostics-runtime.mjs
```

Windows 에서는 같은 환경 변수를 격리 실행 파일로 설정하고 그 Node 명령을 실행한다. 사용자 profile, 프롬프트, 설정, 프록시는 바뀌지 않으며, 정식 DSH 프로세스를 시작하거나 재시작하지 않는다.
