# NEXT 호스트 계열(`dsh-desktop-next`)

이 문서는 서드파티 데스크톱 셸 **DSH NEXT** 에 별도 호스트 계열이 왜 필요한지, 신원을 어떻게 판정하는지, 패키지 교체와 복구가 어느 경로로 가는지, 그리고 공식 `@deepseek-ai/dsh-desktop-host` 계열과의 경계를 설명한다.

## 1. 왜 따로 계열로 두는가

DSH NEXT 의 배포 패키지는 `dsh-desktop-next`(현재 관측 버전 `2.0.19-next`)이며:

- `@deepseek-ai/dsh-desktop-host` 패키지가 없다;
- DSH 컴포넌트를 애플리케이션 루트 `node_modules/@deepseek-ai` 에 두고, 공식처럼 `dsh/node_modules/` 접두사를 쓰지 않는다;
- 공식 `resources/runtime/cli/bin/dsh` CLI shim 이 없다;
- 진입점은 애플리케이션 루트의 `lib/host.js` / `lib/main.js` 이고, 패키징 환경에서 `process.argv[1]` 이 스크립트를 가리키지도 않는다.

따라서 "공식 패치 표 + 공식 신원 판정"으로 그대로 덮을 수 없다: 공식 `QUALIFIED_HOST_VERSIONS` 의 항목별 앵커 회귀도, `repairOfficialCliAfterUnpack` 의 실패 의미론도 이 셸에는 적용되지 않는다.

## 2. 신원 판정(패키지 증거만 본다)

`lib/next-host.js`:

| 입력 | 결론 |
|---|---|
| `resources/app/package.json` 의 `name === "dsh-desktop-next"` 이고 `main` 이 있음 | `kind: "next"` 로 인정 |
| `resources/app.asar/package.json` 도 같음(Electron 의 asar 인식 fs 로 읽기 가능) | 위와 같음 |
| 같은 이름 exe 만 있고 `resources` 가 비어 있음 | 거부 |
| `resources/app` 이 다른 Electron 앱에 속함 | 거부 |
| 아카이브는 있지만 `package.json` 이 NEXT 가 아님 | 거부 |

**exe 파일 이름은 보지 않는다.** 이름 목록(`dsh next`, `deepseek harness` 등)은 안내와 정렬에만 쓰고 적법성 판정에는 넣지 않는다 — 그렇게 하면 같은 이름의 아무 exe 나 "세탁할 호스트"로 취급되기 때문이다.

## 3. 인스턴스 해석(더 이상 전역 `findAiBase` 폴백을 쓰지 않는다)

`lib/instance.js#resolveInstance()` 가 유일한 진입점이며 해석 순서는 다음과 같다:

1. `DSH_BASE`(명시)
2. `PURGE_DSH_CLI`(명시; 파일이 없거나 `@deepseek-ai/dsh` 패키지 안이 아니면 바로 오류)
3. 현재 프로세스 자신의 진입점(`argv[1]` / `process.resourcesPath` / Electron `app.getAppPath()`)

`DSH_HOME`, npm prefix, shim 디렉터리, 다른 설치는 **스캔하지 않는다**. 인스턴스를 잘못 가리키면 `{ resolved: false, host: "", reason: ... }` 를 반환하고, 패널은 "미확인"으로 표시하며 다른 설치의 상태로 대신 채우지 않는다.

`/dsh-purge/status` 와 `/dsh-purge/selfcheck` 도 이 진입점을 쓰도록 바뀌었다; `gatherState({ aiBase: "" })` 는 core 계층에서 "명시적 빈 대상"이며 발견 로직을 트리거하지 않는다.

### 부분 언팩

`diagnosticHost()` 는 후보 디렉터리가 **실제로 사용 가능할 때**(`dsh-agent-instructions/lib` 포함)만 보고한다. `app.asar.unpacked` 안의 불완전한 사본 몇 개는 호스트로 취급하지 않고, 이 설치의 "예상 경로"인 `resources/app/node_modules/@deepseek-ai` 를 반환하며 `compatibility()` 가 `no-host` 로 보고한다.

## 4. 패키지 교체와 복구

NEXT 와 공식은 언팩/커밋 원시 연산을 공유하지만, 복구 의미론은 계열 안에서 따로 검증한다:

```
extractAsarToSide(asar, resources/app)   → resources/app.dshpurge-next
overlayAsarUnpacked(asar, next)          → 네이티브 .node 를 우회 디렉터리에 덮어쓰기
commitExtractedDir(app, next)            → app → app.dshpurge-prev; next → app
```

- 지난번 중단으로 남은 `.dshpurge-next` 는 다음 언팩 전에 버려지므로 새 디렉터리를 오염시키지 않는다;
- 커밋 실패(볼륨 간 `EXDEV`, 점유 등)는 이전 `app` 과 새 디렉터리를 모두 보존하고 `app.dshpurge-recover.json`(`error` / `prev` / `prevRestored`)을 기록한 뒤 재시도할 수 있게 한다;
- `.dshpurge-prev` 만 남았을 때는 `newestPreservedDir()` + `restoreSealedExtract()` 로 이전 디렉터리를 되돌릴 수 있다;
- 패키지 교체의 마지막 단계에서 `renameAsarAside()` 가 아카이브를 `app.asar.bak` 으로 보존한다; Windows 교체는 handoff 도우미가 `app.asar.purge-<uuid>.bak` 으로 이름을 바꾸고 `archive_sha256`(백업 실제 해시와 일치)을 기록한다.

## 5. CLI 수리: `ok: true` 가 아니라 `notApplicable`

`repairOfficialCliAfterUnpack()` 는 NEXT 에 대해 다음을 반환한다:

```js
{ ok: false, notApplicable: true, status: "not_applicable", reason: "next_family_has_no_runtime_cli" }
```

`ok` 는 `false` 로 유지한다: 우리가 실제로 고치지도, 검증하지도 않았다. 예상 밖으로 `runtime/cli/bin/dsh` 가 있으면 `status: "unsupported_family"` 를 반환하고 실패로 처리한다.

적용 허용 판정은 `lib/apply-gate.js#cliRepairBlocksApply()` 로 모인다:

| `cliRepair` | 동작 |
|---|---|
| `ok: true` | 허용 |
| `notApplicable: true` | 허용(명확한 해당 없음) |
| 그 밖의 `ok: false` | 차단, 아카이브 보존 |
| 결론 없음 | 차단 |

이렇게 해서 공식 빌드의 `not_official` 거부 경로는 그대로이고, NEXT 도 성공을 위조해 허용을 얻지 않는다.

## 6. 공식 패치 표와의 관계

- NEXT 는 `QUALIFIED_HOST_VERSIONS` 에 **들어가지 않는다**; `NEXT_FAMILY.qualified === false`.
- 패치는 같은 `ALL_PATCHES` 에서 오지만, 항목별 앵커 적중/드리프트를 하나씩 보고하며 "계열 전체 회귀 완료" 결론은 내리지 않는다.
- 실기(0.2.1-rc.2 내부) 결과: 61/69 쓰기 성공; `#82/#83/#84` 는 NEXT 의 `lib/main.js` 가 공식과 달라 `drifted` 이며 이는 예상된 결과다.

## 7. 테스트

`test/desktop-next-host.test.mjs`(`node --test test/desktop-next-host.test.mjs`, 12예)가 다루는 것:

- 신원: NEXT 패키지 증거 수용; 잘못된 이름 / `main` 누락 / 맨 exe / 다른 Electron 앱 거부
- 공식 bundled-host 신원 회귀(이 계열의 영향을 받지 않음)
- `resolveInstance`: 명시 선택자 우선, 잘못 가리킬 때 폴백 없음, `PURGE_DSH_CLI` 부재 시 오류
- `diagnosticHost`: 부분 언팩 시 예상 경로 반환
- CLI 수리 결론과 교체 게이트 매트릭스
- 교체: 언팩/overlay/잔여 정리/커밋 시 이전 디렉터리 보존
- 커밋 실패: `recover.json`, 이전 디렉터리 불변, 새 디렉터리 보존
- 중단 복구: `.dshpurge-prev` 에서 복원
- 아카이브 이름 변경과 백업 보존
- 패치 쓰기 실패: 상태를 명시적 실패로 기록, 원문과 백업으로 롤백 가능, 복구 후 재시도

## 8. 다루지 않은 것

- NEXT 자체 업데이트 후 `app.asar` 재생성: 패키지 교체를 한 번 더 실행해야 함(자동 회귀 없음)
- 실제 OS 수준 점유(백신/인덱서)로 인한 sharing violation: 볼륨 간 `EXDEV` 로 대체 주입
- macOS handoff

## 9. 호환성 약속

1. 공식 빌드의 신원 판정, `not_official` 거부 경로, `app.asar` 보존 의미론은 바뀌지 않는다;
2. "파일 이름만으로 호스트를 인정"하는 경로를 새로 만들지 않는다;
3. 패널 상태는 **이 프로세스 인스턴스**만 반영하며, 미확인이면 미확인으로 표시한다.
