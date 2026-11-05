// Prompt wiring is the part users feel immediately: inject position and the
// boost section must register where we claim, without a live desktop.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { registerPromptSections } from "../lib/index.js";
import { BOOST_TEXT } from "../lib/boost.js";
import { writeTuning } from "../lib/tuning.js";

function harness(home) {
  const sections = [];
  const ctx = {
    systemPrompt: {
      section(spec) {
        sections.push(spec);
        return () => {};
      },
    },
    logger: { warn() {} },
  };
  const config = {
    enabled: true,
    capabilityProtocol: false,
    injectOnce: false,
    postPrompt: "",
    postPromptOrder: 5100,
  };
  return { ctx, config, sections };
}

function withHome(fn) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "purge-prompt-"));
  const prevHome = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  try {
    fn(home);
  } finally {
    if (prevHome === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prevHome;
    fs.rmSync(home, { recursive: true, force: true });
  }
}

test("default tuning registers the inject at the head and the boost at the tail", () => {
  withHome(() => {
    const h = harness();
    registerPromptSections(h.ctx, h.config);
    const byName = Object.fromEntries(h.sections.map((s) => [s.name, s]));
    assert(byName["dsh-purge"], "head inject section");
    assert(!byName["dsh-purge-tail"], "tail inject is opt-in");
    assert(byName["dsh-purge-boost"], "boost section is on by default");
    assert(
      byName["dsh-purge-boost"].order > byName["dsh-purge"].order,
      "boost must sort after the inject",
    );
    assert.equal(byName["dsh-purge-boost"].text({}), BOOST_TEXT);
  });
});

// 호스트 rc.2 의 SECTION_ORDERS: persona-prefix 0, 도구 섹션 1000–3000, MCP 3100,
// TOOLS_SDK 5000, DELIVERABLE 9000, STRUCTURED_OUTPUT 9900, HARNESS_SOURCE 10000,
// WEB_SURFACE 10100, persona-suffix 10200. 0 보다 작은 order 는 persona 앞에 오므로,
// "꼬리" 섹션은 GLOBAL_PROMPT_ORDER + n 으로 만들 수 없다(여전히 음수다).
const HOST_TOOL_SECTIONS_MAX = 5000;
const HOST_PERSONA_SUFFIX = 10200;

test("tail inject lands in the host tail range; the boost keeps its measured default", () => {
  withHome((home) => {
    writeTuning({ injectPosition: "tail" }, home);
    const h = harness();
    registerPromptSections(h.ctx, h.config);
    const byName = Object.fromEntries(h.sections.map((s) => [s.name, s]));
    const tail = byName["dsh-purge-tail"];
    const boost = byName["dsh-purge-boost"];
    // 꼬리 주입은 실제로 도구 섹션 뒤, persona-suffix 앞에 와야 한다.
    assert.ok(tail.order > HOST_TOOL_SECTIONS_MAX && tail.order < HOST_PERSONA_SUFFIX);
    // 강화 섹션의 기본 위치는 실측에서 나왔다: 맨 앞에 두면 같은 거부 유발 요청 세트에서 첫 거부가 0/6, 9500 에 두면 2/6 이었다.
    assert.equal(boost.order, -50000);
  });
});

test("injectPosition=tail moves the text and keeps a named placeholder", () => {
  withHome((home) => {
    writeTuning({ injectPosition: "tail" }, home);
    const h = harness();
    registerPromptSections(h.ctx, h.config);
    const byName = Object.fromEntries(h.sections.map((s) => [s.name, s]));
    assert(byName["dsh-purge"], "placeholder keeps the name patch 74 looks for");
    assert(byName["dsh-purge-tail"], "tail section registered");
    assert(
      byName["dsh-purge-tail"].order > byName["dsh-purge"].order,
      "tail must sort last",
    );
    assert.equal(byName["dsh-purge"].text({}), "", "head placeholder is empty");
  });
});

test("injectPosition=both registers head and tail with the same text", () => {
  withHome((home) => {
    writeTuning({ injectPosition: "both" }, home);
    const h = harness();
    registerPromptSections(h.ctx, h.config);
    const names = h.sections.map((s) => s.name);
    assert(names.includes("dsh-purge"));
    assert(names.includes("dsh-purge-tail"));
  });
});

test("boost order can be pinned for A/B runs", async () => {
  const prev = process.env.PURGE_BOOST_ORDER;
  process.env.PURGE_BOOST_ORDER = "-50000";
  try {
    const mod = await import(`../lib/index.js?ab=${Date.now()}`);
    const sections = [];
    const ctx = { systemPrompt: { section: (s) => (sections.push(s), () => {}) }, logger: { warn() {} } };
    mod.registerPromptSections(ctx, { enabled: true, capabilityProtocol: false, injectOnce: false, postPrompt: "", postPromptOrder: 5100 });
    const boost = sections.find((s) => s.name === "dsh-purge-boost");
    assert.equal(boost.order, -50000);
  } finally {
    if (prev === undefined) delete process.env.PURGE_BOOST_ORDER;
    else process.env.PURGE_BOOST_ORDER = prev;
  }
});

test("boost order can be pinned from boost-order.json without an env var", async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "purge-boost-"));
  fs.mkdirSync(path.join(home, "dsh-purge"), { recursive: true });
  fs.writeFileSync(path.join(home, "dsh-purge", "boost-order.json"), JSON.stringify({ order: -50000 }));
  const prevHome = process.env.DSH_HOME;
  const prevEnv = process.env.PURGE_BOOST_ORDER;
  process.env.DSH_HOME = home;
  delete process.env.PURGE_BOOST_ORDER;
  try {
    const mod = await import(`../lib/index.js?file=${Date.now()}`);
    const sections = [];
    const ctx = { systemPrompt: { section: (s) => (sections.push(s), () => {}) }, logger: { warn() {} } };
    mod.registerPromptSections(ctx, { enabled: true, capabilityProtocol: false, injectOnce: false, postPrompt: "", postPromptOrder: 5100 });
    assert.equal(sections.find((s) => s.name === "dsh-purge-boost").order, -50000);
  } finally {
    if (prevHome === undefined) delete process.env.DSH_HOME; else process.env.DSH_HOME = prevHome;
    if (prevEnv !== undefined) process.env.PURGE_BOOST_ORDER = prevEnv;
  }
});
