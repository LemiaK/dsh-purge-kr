# Purge 기본 사이드바 버전

이 fork 의 `native-panel` 브랜치는 독립된 `dsh-purge-panel` UI 플러그인을 유지한다. `master` 는 업스트림 상태를 보존한다. 원저자는 YuJunZhiXue/dsh-purge 이며, 저작권과 라이선스는 루트와 UI 패키지의 LICENSE 에 보존되어 있다.

## 설치와 업데이트

공식 `dsh-purge` 와 `dsh-purge-panel` 은 서로 다른 두 패키지다. 전자는 기존 기능을 유지하고, 후자는 오른쪽 Purge 탭 등록, 설정 레이아웃, 구 진입점을 숨기는 스타일을 담당한다. 공식 패키지를 업데이트해도 독립 UI 파일은 덮어써지지 않는다. UI 를 `dsh-purge@1.1.71-local.*` 에 직접 내장하던 초기 버전과 함께 쓰지 않는다.

```sh
cd packages/purge-panel
npm ci --ignore-scripts --legacy-peer-deps
npm run build
npm test
npm pack --ignore-scripts
# 현재 DSH 설치에 포함된 CLI 사용:
dsh plugin --profile desktop add ./dsh-purge-panel-1.1.0.tgz
```

공식 Purge 를 먼저 설치해 활성화한 뒤 UI 패키지를 설치한다. 오른쪽 사이드바의 `+ → Purge` 를 연다. UI 패키지를 비활성화하면 공식 진입점으로 돌아가며, 기존 설정은 삭제되지 않는다.

## 업스트림 따라가기

```sh
git fetch upstream
git switch native-panel
git merge upstream/master
cd packages/purge-panel
npm ci --ignore-scripts --legacy-peer-deps
npm run build
npm test
```

병합 후 공식 `/dsh-purge/*` API 와 `.dshp-launch`, `.dshp-hero-chip`, `.dshp-tab-chip` 진입점 선택자가 바뀌었는지 확인한다. 새 버전을 실측한 뒤 호환 버전 안내와 테스트를 갱신하고 UI 를 패키징한다. 공식에 추가된 설정은 독립 UI 에 자동으로 나타나지 않으므로 명시적으로 맞춰야 한다.

현재 호환 검증 기준은 공식 Purge 1.1.71 이다. 다른 버전에서는 호환 안내가 표시되고, API 를 쓸 수 없을 때도 안내가 나온다. UI 는 `dshpp-` 스타일 접두사와 독립 로케일을 써서 업스트림 스타일과 섞이지 않는다. 공식 설치 파일의 정기 작업이나 로더 패치를 수정하지 않았다.

## 검증

`npm test` 는 기본 탭 등록, 분류 전환 시 초안 보존, 새로고침이 입력을 덮어쓰지 않는지, 조회 화면이 자동 저장하지 않는지, 구 진입점 숨김 규칙, 버전 변경과 서비스 이상 안내를 검증한다. 마이그레이션은 DSH 데스크톱에서 검증했다. 공식 패키지를 원판으로 되돌려도 오른쪽 독립 UI 가 계속 로드되고 원본 프롬프트 파일은 변하지 않았다.

CI 는 테스트와 패키징만 하고 npm, GitHub Release, 플러그인 마켓에 배포하지 않는다. 정식 배포는 별도로 결정한다.

소스 구조와 이번 리팩터링 설명은 [UI 패키지 문서](packages/purge-panel/README.md#110-모듈화)를 참고한다. `client.js` 는 `npm run build` 가 생성하며, 소스를 수정하면 반드시 다시 빌드한다.
