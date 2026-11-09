# DSH 사용자 지정 마켓 인덱스

공식 소스 주소: **https://wnduddld0513.github.io/dsh-purge-kr/index.json**

DSH 의 「플러그인 → 실험적 플러그인 → 더 보기 → 사용자 지정 플러그인 마켓」을 켠 뒤 「발견 → 인덱스 소스 추가」에 이 주소를 붙여 넣습니다. 이 기능이 없는 옛 호스트는 GitHub Release 로 설치할 수 있습니다.

인덱스는 공식 format 1 을 따르며 Purge(1.6.5 부터), Qwen Studio, Breeze Voice, H3 비디오 워크벤치의 정식 버전을 담습니다. 소스 설치 주소는 전체 Git 커밋으로 고정되며 가변 브랜치를 가리키지 않습니다. 릴리스 워크플로가 성공하면 인덱스를 만들어 GitHub Pages 에 배포하므로, 인덱스를 직접 고칠 필요가 없습니다.

각 항목은 검증한 호스트 버전 범위를 따로 선언하며, 다른 호스트까지 검증했다고 주장하지 않습니다. 마켓에 표시된다는 것이 DeepSeek 공식 보증을 뜻하지 않고, 호스트 패치를 자동으로 적용하지도 않습니다.

커뮤니티 디렉터리 등재와 직접 만든 소스는 별개입니다: 직접 만든 소스는 사용자가 추가하고, 커뮤니티 디렉터리는 항목을 제출해 유지보수자 검토를 기다려야 합니다.

공식 규격: https://deepseek-harness.github.io/deepseek-harness/en/guide/plugin-market

새 Breeze Voice 버전을 내면, 릴리스 패키지의 미리 컴파일된 Git 스냅샷 커밋과 배포 시각, 호스트 호환 범위를 `market/breeze-voice.json` 에 등록하고 검증한 뒤 인덱스를 배포합니다.
