const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { buildSync } = require("esbuild");
const code = buildSync({
  entryPoints: [path.join(__dirname, "../src/components/page.js")],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  loader: { ".css": "text" },
  external: ["react", "react-dom"],
  define: { __PANEL_VERSION__: '"test"', __COMMUNITY__: "true" },
}).outputFiles[0].text;
const sandbox = { module: { exports: {} }, require, console };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(code, sandbox);
const { LayoutNotice } = sandbox.module.exports;
test("layout notice never equates a disk archive or absent archive with loaded code", () => {
  const render = (info) =>
    renderToStaticMarkup(React.createElement(LayoutNotice, { info }));
  const legacy = render({ asar_still_sealed: true });
  assert.match(legacy, /로드 출처는 아직 확인되지 않았습니다/);
  assert.doesNotMatch(legacy, /현재 프로세스가 여전히 로드/);
  const unpacked = render({
    asar_still_sealed: false,
    host_layout: {
      state: "unpacked_entry",
      process: { matches_target: true },
      note: "진입점 위치만으로는 이후에 기록한 내용이 다시 로드되었다고 증명하지 못한다.",
      disk: { archive_exists: false },
    },
  });
  // 패키지 교체가 정상이면 설명은 details 로 접히지만 내용은 그대로 남는다. "이미 로드됨" 같은 단정은 절대 나오면 안 된다
  assert.match(unpacked, /증명하지 못한다/);
  assert.match(unpacked, /언팩 디렉터리에서 시작됨/);
  assert.doesNotMatch(unpacked, /app\.asar 를 로드|로드된 app\.asar/);
  const different = render({
    asar_still_sealed: true,
    host_layout: {
      note: "현재 서비스 진입점이 선택한 대상 설치와 다르다.",
      disk: { archive_exists: true },
    },
  });
  assert.match(different, /설치와 다르다/);
  assert.match(different, /대상 디스크에 아직 app\.asar 가 있습니다/);
});

test("unknown, different and unreadable layouts never claim handoff completion", () => {
  for (const state of ["unknown_runtime", "different_instance", "unreadable"]) {
    const html = renderToStaticMarkup(
      React.createElement(LayoutNotice, {
        info: {
          asar_still_sealed: false,
          host_layout: {
            state,
            process: { matches_target: state !== "different_instance" },
            disk: { archive_exists: false },
            note: state,
          },
          asar_handoff: {
            phase: "failed",
            detail: "<failure>",
            error: { win32_code: 183 },
          },
        },
      }),
    );
    assert.doesNotMatch(html, /패키지 교체 완료/);
    assert.match(html, /183/);
    assert.match(html, /&lt;failure&gt;/);
  }
});

test("only a confirmed Web target without desktop evidence or failures gets a neutral notice", () => {
  const web = {
    ok: true,
    surface: "web",
    desktop_exe: "",
    desktop_install: "",
    host_layout: {
      state: "unknown_runtime",
      disk: { surface: "web", archive_exists: null, unpacked_exists: null },
      process: { entry_layout: "unknown", matches_target: null },
    },
    asar_handoff: { phase: "unknown_target" },
  };
  const render = (info) =>
    renderToStaticMarkup(React.createElement(LayoutNotice, { info }));
  const html = render(web);
  assert.match(html, /해당 없음\(Web 호스트\)/);
  assert.match(html, /unknown_runtime/);
  assert.doesNotMatch(html, /dshpp-warn|교체 완료/);
  for (const info of [
    { ...web, surface: "desktop" },
    { ...web, desktop_exe: "host.exe" },
    { ...web, asar_still_sealed: true },
    { ...web, host_layout: { ...web.host_layout, state: "unknown_target" } },
    {
      ...web,
      host_layout: {
        ...web.host_layout,
        disk: { ...web.host_layout.disk, archive_exists: true },
      },
    },
    {
      ...web,
      host_layout: { ...web.host_layout, errors: [{ code: "EACCES" }] },
    },
    { ...web, asar_handoff: { phase: "failed", detail: "access denied" } },
    { ...web, surface: undefined },
  ]) {
    assert.match(render(info), /dshpp-warn/);
    assert.doesNotMatch(render(info), /해당 없음\(Web 호스트\)/);
  }
});
