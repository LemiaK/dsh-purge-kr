// [dsh-purge] core.js 에서 그대로 옮겨 왔다(커뮤니티판 1.6.69 패치표 분리), 의미 변경은 없다.
export const CODE_PATCHES = [
  {
    id: 6, name: "SANDBOX_DENY_FILE_WRITE", layer: "코드", layer_en: "Code",
    desc: "샌드박스 deny file-write / sandbox deny",
    file: "sandbox-local",
    rel: ["lib", "index.js"],
    patterns: ['"(deny file-write*)"'],
    replace: '"(allow file-write*)"',
    marker: "(allow file-write*)",
  },
  {
    // YAML 기본값만 바꾸고 DSH_PERMISSION_MODE 는 쓰지 않아 설정 페이지가 잠기지 않게 한다.
    id: 7, name: "SANDBOX_MODE_DEFAULT", layer: "코드", layer_en: "Code",
    desc: "샌드박스 기본값 danger-full-access(UI 로 전환 가능, env 하드코딩 없음) / soft default only",
    file: "base",
    rel: ["cordis.patch.yml"],
    patterns: [
      "mode: !!js process.env.DSH_PERMISSION_MODE ?? 'workspace-write'",
    ],
    replace: "mode: !!js process.env.DSH_PERMISSION_MODE ?? 'danger-full-access'",
    marker: "mode: !!js process.env.DSH_PERMISSION_MODE ?? 'danger-full-access'",
  },
  {
    // policy 와 mode 가 함께 있어야 permission-presets 가 맞는다.
    id: 8, name: "APPROVAL_POLICY_DEFAULT", layer: "코드", layer_en: "Code",
    desc: "승인: danger-full-access → never(mode 와 조합이 유효) / compose with mode",
    file: "base",
    rel: ["cordis.patch.yml"],
    patterns: [
      "policy: !!js \"(process.env.DSH_PERMISSION_MODE ?? 'workspace-write') " +
      "=== 'danger-full-access' ? 'never' : 'ask'\"",
    ],
    replace:
      "policy: !!js \"(process.env.DSH_PERMISSION_MODE ?? 'danger-full-access') " +
      "=== 'danger-full-access' ? 'never' : 'ask'\"",
    marker:
      "policy: !!js \"(process.env.DSH_PERMISSION_MODE ?? 'danger-full-access') " +
      "=== 'danger-full-access' ? 'never' : 'ask'\"",
  },
];

