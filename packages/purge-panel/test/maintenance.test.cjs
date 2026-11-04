const { test } = require("node:test"),
  assert = require("node:assert/strict");
const vm = require("node:vm"),
  path = require("node:path");
const React = require("react"),
  { create, act } = require("react-test-renderer");
const { buildSync } = require("esbuild");
const bundle = buildSync({
  entryPoints: [path.join(__dirname, "../src/components/maintenance.js")],
  bundle: true,
  write: false,
  format: "cjs",
  platform: "browser",
  external: ["react", "react-dom"],
}).outputFiles[0].text;
const backup = (id) => ({
  id,
  created_at: "2026-10-18T00:00:00Z",
  plugins: [{ version: "1.6.3" }],
});
const reply = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });
function harness(transport, component = "CommunityMaintenance") {
  const calls = [],
    context = {
      module: { exports: {} },
      exports: {},
      require,
      console,
      URL,
      AbortController,
      setTimeout,
      clearTimeout,
      window: { location: { origin: "http://test" }, confirm: () => true },
      fetch: async (url, init = {}) => {
        const call = {
          url: String(url),
          method: init.method || "GET",
          body: init.body ? JSON.parse(init.body) : null,
        };
        calls.push(call);
        return transport(call);
      },
    };
  context.exports = context.module.exports;
  vm.runInNewContext(bundle, context);
  return { Component: context.module.exports[component], calls };
}
const flush = () => new Promise((resolve) => setImmediate(resolve));
const text = (tree) => JSON.stringify(tree.toJSON());
const button = (tree, label) =>
  tree.root.findAllByType("button").find((b) => b.children.join("") === label);
async function mount(h) {
  let tree;
  await act(async () => {
    tree = create(React.createElement(h.Component));
    await flush();
  });
  return tree;
}
async function click(tree, label) {
  await act(async () => {
    await button(tree, label).props.onClick();
    await flush();
  });
}
async function unmount(tree) {
  await act(async () => tree.unmount());
}

test("mount/remount load existing backups and never preselect a rollback target", async () => {
  let rows = [backup("first")];
  const h = harness(() => reply({ ok: true, backups: rows }));
  let tree = await mount(h);
  assert(text(tree).includes("first"));
  assert.equal(
    tree.root.findByProps({ "aria-label": "롤백할 백업 선택" }).props.value,
    "",
  );
  assert(button(tree, "플러그인 롤백").props.disabled);
  await unmount(tree);
  rows = [backup("second")];
  tree = await mount(h);
  assert(text(tree).includes("second"));
  assert(!text(tree).includes("first"));
  assert.equal(h.calls.filter((c) => c.method === "GET").length, 2);
  assert(!h.calls.some((c) => c.method === "POST"));
  await unmount(tree);
});
test("loading, read failure and empty backup lists are distinct; refresh recovers", async () => {
  let resolve;
  let mode = "pending";
  const h = harness(() =>
    mode === "pending"
      ? new Promise((r) => {
          resolve = r;
        })
      : reply({ ok: true, backups: [] }),
  );
  const tree = await mount(h);
  assert(text(tree).includes("백업을 읽는 중…"));
  assert(!text(tree).includes("백업 없음"));
  await act(async () => {
    resolve(reply({ ok: false, error: "profile ambiguous" }));
    await flush();
  });
  assert(text(tree).includes("백업 읽기 실패: profile ambiguous"));
  assert(!text(tree).includes("백업 없음"));
  mode = "empty";
  await click(tree, "백업 목록 새로 고침");
  assert(text(tree).includes("백업 없음"));
  await unmount(tree);
});
test("HTTP 200 business failure shows the update error and rereads recovery backups without replaying writes", async () => {
  let recovered = false;
  const h = harness((c) => {
    if (c.method === "GET")
      return reply({
        ok: true,
        backups: recovered ? [backup("recovery")] : [],
      });
    if (c.body.op === "check")
      return reply({
        ok: true,
        versions: [
          { asset: "tgz", ref: "v1.6.4", label: "Purge Community 1.6.4" },
        ],
        hasUpdate: true,
        remoteVersion: "1.6.4",
      });
    recovered = true;
    return reply({ ok: false, errors: ["CLI not located"] });
  });
  const tree = await mount(h);
  await click(tree, "커뮤니티판 업데이트 확인");
  await click(tree, "선택한 버전 설치");
  assert(text(tree).includes("CLI not located"));
  assert(text(tree).includes("recovery"));
  assert(!text(tree).includes("백업을 만들었다: undefined"));
  assert.equal(h.calls.filter((c) => c.body?.op === "update").length, 1);
  assert.equal(
    tree.root.findByProps({ "aria-label": "롤백할 백업 선택" }).props.value,
    "",
  );
  await unmount(tree);
});
test("successful update reports its version and DSH process restart, not a backup notice", async () => {
  const h = harness((c) =>
    c.method === "GET"
      ? reply({ ok: true, backups: [] })
      : c.body.op === "check"
        ? reply({
            ok: true,
            versions: [{ asset: "tgz", ref: "v1.6.4", label: "1.6.4" }],
          })
        : reply({
            ok: true,
            applied: true,
            localVersion: "1.6.4",
            needRestart: true,
          }),
  );
  const tree = await mount(h);
  await click(tree, "커뮤니티판 업데이트 확인");
  await click(tree, "선택한 버전 설치");
  assert(text(tree).includes("플러그인을 설치했습니다: 1.6.4"));
  assert(
    text(tree).includes("브라우저만 새로 고치면 새 백엔드가 로드되지 않습니다"),
  );
  assert(!text(tree).includes("백업을 만들었다: "));
  await unmount(tree);
});
test("no-op, backup success and partial update failure keep their own result semantics", async () => {
  const h = harness((c) =>
    c.method === "GET"
      ? reply({ ok: true, backups: [] })
      : reply({ ok: true, id: "created" }),
  );
  const tree = await mount(h);
  await click(tree, "지금 백업");
  assert(text(tree).includes("백업을 만들었다: created"));
  await unmount(tree);
  const context = { module: { exports: {} }, exports: {}, require };
  context.exports = context.module.exports;
  vm.runInNewContext(bundle, context);
  const { maintenanceNotice, assertMaintenanceResult } = context.module.exports;
  assert(
    maintenanceNotice("update", { ok: true, applied: false }).includes(
      "새 버전을 설치하지 않았습니다",
    ),
  );
  assert.match(
    maintenanceNotice("update", {
      ok: true,
      applied: true,
      cleanup_warnings: [{ stage: "checkpoint", code: "EPERM" }],
    }),
    /정리를 마치지 못했습니다.*checkpoint:EPERM.*남은 파일은 보존했습니다/,
  );
  assert.throws(
    () =>
      assertMaintenanceResult({
        ok: false,
        applied: true,
        error: "one target failed",
      }),
    /일부 대상은 이미 업데이트했습니다/,
  );
});
test("late reads from an unmounted panel cannot update a new panel", async () => {
  let resolve,
    reads = 0;
  const h = harness(() =>
    ++reads === 1
      ? new Promise((r) => {
          resolve = r;
        })
      : reply({ ok: true, backups: [backup("current")] }),
  );
  let tree = await mount(h);
  await unmount(tree);
  tree = await mount(h);
  await act(async () => {
    resolve(reply({ ok: true, backups: [backup("stale")] }));
    await flush();
  });
  assert(text(tree).includes("current"));
  assert(!text(tree).includes("stale"));
  await unmount(tree);
});

test("update switches save separate preferences without invoking install or restart", async () => {
  const prefs = { autoCheck: true, autoInstall: false, intervalHours: 6 };
  const h = harness((c) => {
    if (c.method === "GET")
      return reply({
        ok: true,
        backups: [],
        update_preferences: prefs,
        update_status: { restartRequired: true, pendingVersion: "1.6.5" },
      });
    assert.equal(c.body.op, "preferences");
    Object.assign(prefs, c.body.value);
    return reply({ ok: true, update_preferences: prefs });
  });
  const tree = await mount(h);
  assert(text(tree).includes("DSH 를 직접 재시작하기를 기다립니다"));
  await act(async () => {
    await tree.root
      .findByProps({ "aria-label": "자동 업데이트 설치" })
      .props.onChange({ target: { checked: true } });
    await flush();
  });
  assert.equal(h.calls.at(-1).body.value.autoInstall, true);
  assert.equal(
    tree.root.findByProps({ "aria-label": "자동 업데이트 확인" }).props.checked,
    true,
  );
  await act(async () => {
    await tree.root
      .findByProps({ "aria-label": "자동 업데이트 확인" })
      .props.onChange({ target: { checked: false } });
    await flush();
  });
  assert.equal(
    tree.root.findByProps({ "aria-label": "자동 업데이트 설치" }).props.checked,
    true,
  );
  assert.equal(
    tree.root.findByProps({ "aria-label": "업데이트 확인 간격" }).props.disabled,
    true,
  );
  assert(
    h.calls.every((c) => c.method === "GET" || c.body.op === "preferences"),
  );
  await act(async () => {
    tree.root
      .findByProps({ "aria-label": "자동 업데이트 설치 (설명 보기)" })
      .props.onMouseEnter();
  });
  assert(text(tree).includes("DSH 를 자동으로 재시작하지 않습니다"));
  await unmount(tree);
});

test("selfcheck inferred and unknown values show warning labels and explanation instead of red or all-green", async () => {
  const h = harness(
    ({ url }) =>
      reply(
        url.endsWith("/boost")
          ? { enabled: true }
          : {
              state: "unknown",
              layers: [
                {
                  title: "현재 profile 의 권한 선택",
                  kind: "config",
                  state: "inferred",
                  ok: false,
                  applied: 0,
                  total: 1,
                  broken: [],
                  note: "명시적으로 고정되지 않았고 호스트 추론이 이미 적용됐다",
                },
                {
                  title: "호스트 실행 방식",
                  kind: "layout",
                  state: "unknown",
                  ok: false,
                  applied: 0,
                  total: 1,
                  broken: [],
                  note: "현재 프로세스에서 호스트를 찾지 못했다",
                },
              ],
            },
      ),
    "StatusExtras",
  );
  const tree = await mount(h);
  const rendered = text(tree);
  assert(rendered.includes("2개 계층 확인 필요"));
  assert(rendered.includes("호스트 추론"));
  assert(rendered.includes("미확인"));
  assert(!rendered.includes("계층 미적용"));
  assert(!rendered.includes("모두 정상"));
  assert(!rendered.includes("is-bad"));
  await unmount(tree);
});

test("cached releases and failed fallbacks are visible instead of claiming latest", async () => {
  for (const failed of [false, true]) {
    const h = harness((c) =>
      c.method === "GET"
        ? reply({ ok: true, backups: [] })
        : reply(
            failed
              ? {
                  ok: false,
                  error: "API 할당량 소진; Atom 대체 실패: 프록시 시간 초과",
                }
              : {
                  ok: true,
                  versions: [],
                  hasUpdate: false,
                  stale: true,
                  degraded: "API 할당량 소진, 최근 성공 목록을 그대로 쓴다",
                },
          ),
    );
    const tree = await mount(h);
    await click(tree, "커뮤니티판 업데이트 확인");
    assert(text(tree).includes("할당량 소진"));
    assert(text(tree).includes(failed ? "프록시 시간 초과" : "캐시 목록"));
    assert(!text(tree).includes("이미 최신 정식 버전입니다"));
    await unmount(tree);
  }
});

test("update status distinguishes loaded code, pending disk version and independent failures", async () => {
  const h = harness(() => reply({ ok: true }), "UpdatePreferences");
  let tree;
  const render = async (status) =>
    act(async () => {
      const props = {
        value: { autoCheck: true, autoInstall: true, intervalHours: 24 },
        status,
        onSaved() {},
      };
      if (tree) tree.update(React.createElement(h.Component, props));
      else tree = create(React.createElement(h.Component, props));
    });
  await render({
    runningVersion: "1.6.40",
    pendingVersion: "1.6.41",
    restartRequired: true,
  });
  assert(text(tree).includes("디스크 버전 1.6.41, 현재 실행 1.6.40"));
  await render({
    runningVersion: "1.6.41",
    restartRequired: false,
    checkedAt: "2026-10-21T00:00:00Z",
    installError: "web rollback failed",
  });
  assert(!text(tree).includes("DSH 를 직접 재시작하기를 기다립니다"));
  assert(text(tree).includes("web rollback failed"));
  await render({
    restartRequired: true,
    pendingVersion: "1.6.33",
    reconciliationError: "package unreadable",
    error: "network timeout",
    installError: "web rollback failed",
  });
  assert(text(tree).includes("설치 상태 확인 대기"));
  assert(text(tree).includes("package unreadable"));
  assert(text(tree).includes("network timeout"));
  assert(text(tree).includes("web rollback failed"));
  assert(!text(tree).includes("DSH 를 직접 재시작하기를 기다립니다"));
  assert.equal(
    h.calls.length,
    0,
    "rendering status must never install or restart",
  );
  await unmount(tree);
});

test("saving a token does not erase masked proxy credentials or auto-update preferences", async () => {
  const h = harness(
    () => reply({ ok: true, update_preferences: { hasGithubToken: true } }),
    "UpdateChannelDialog",
  );
  let tree,
    saved = false;
  await act(async () => {
    tree = create(
      React.createElement(h.Component, {
        value: {
          proxyUrl: "socks5://proxy.test:1080",
          hasProxyCredentials: true,
          hasGithubToken: true,
        },
        onSaved() {
          saved = true;
        },
        onClose() {},
      }),
    );
  });
  const field = tree.root
    .findAllByType("input")
    .find((n) => n.props.type === "password");
  assert.equal(field.props.value, "");
  await act(async () =>
    field.props.onChange({ target: { value: "fixture-token" } }),
  );
  await click(tree, "저장");
  assert(saved);
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].body, {
    op: "preferences",
    value: { githubToken: "fixture-token" },
  });
  await unmount(tree);
});
