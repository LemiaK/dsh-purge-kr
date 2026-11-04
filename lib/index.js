import { injectionPolicy, excludedPresetIds, withoutPurgeInjection, rememberPromptRewrite, requestInjectionContext } from "./preset-injection.js";
import { registerCommand } from "./command-registration.js";
import { createUpdateController, preferences, savePreferences, publicPreferences, updateEnv } from "./update-policy.js";
import { withUpdateEnvironment } from "./update-http.js";
import { scheduleDesktopHandoff } from "./desktop-handoff.js";
import { currentHost, diagnosticHost, hostSurface } from "./instance.js";
import { Maintenance, compatibility, QUALIFIED_HOST_VERSIONS, REPOSITORY } from "./community.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fsFor } from "./extract-asar.js";
import * as core from "./core.js";
import * as desktop from "./desktop.js";
import * as hostctl from "./host.js";
import * as rules from "./rules.js";
import * as skills from "./skills.js";
import * as updater from "./update.js";
import * as reapply from "./reapply.js";
import * as officialUpdate from "./official-update.js";
import {
  GLOBAL_PROMPT_ORDER,
  adaptInjectForMinimalPreset,
  isMnemonPluginMessage,
  isRedteamSession,
  installAssembleGuard,
  modePromptText,
  peelChatmlEnvelope,
  escapeDshInterpolation,
  rewritePromptAssembly,
} from "./identity.js";
import { capabilityProtocolText, CAPABILITY_SECTION } from "./capability-protocol.js";
import { installSubagentRoleCapture, resolveSubagentRoleText } from "./redteam/role-section.js";
import * as rewind from "./rewind.js";
import { streamWithRefusalRetry } from "./refusal-retry.js";
import * as continueRetry from "./continue-retry.js";
import * as uninstaller from "./uninstall.js";
import * as selfcheck from "./selfcheck.js";
import { BOOST_TEXT, readBoost, writeBoost } from "./boost.js";
import { readTuning, writeTuning } from "./tuning.js";
import { PROBE_SECTION, createProbe, probeText, readProbe } from "./probe.js";
import { logAudit, readAudit } from "./audit.js";
import { readDrillGrant, writeDrillGrant } from "./drill-grant.js";
import { readAllowText, writeAllowText } from "./net-scope.js";
import {
  applyShouldRestart,
  isInactiveContextError,
  settleDelayMs,
  settleMayReapply,
  settleMayRestart,
  watchContextLife,
} from "./settle-policy.js";

export const name = "dsh-purge-community";

// pluginPackages 를 inject 에 쓰지 않는다: Cordis 가 map 의 모든 key 를 빈 채로 기다린다.
// 휴대용 복사본 / Hub 불완전 설치에는 이 서비스가 없는 경우가 많아, 쓰는 순간 pending → 호스트 종료 코드 1.
export const inject = ["systemPrompt", "tools"];

let bootFullQuit = false;

const DEFAULTS = {
  enabled: true,
  excludePresets: [],
  autoApplyOnStart: false,
  autoUpdateOnStart: false,
  autoRevertOnMissing: false,
  injectOnce: false,
  stripMnemon: true,
  postPrompt: "",
  postPromptOrder: 5100,
  verbose: false,
  autoRetry: true,
  retryMax: 3,
  autoContinue: false,
  continueMax: 3,
  continueText: "계속",
  // Codex 스타일: 모델이 skill / MCP 를 스스로 찾도록 가르친다; 공식 등록과 도구 면은 건드리지 않는다.
  capabilityProtocol: true,
  hooksDenyBypass: true,
};

// 호스트 자체 section 은 모두 -1000…10200 구간에 있다: persona-prefix 0, 도구 구간
// 1000–3000, MCP 3100, TOOLS_SDK 5000, DELIVERABLE 9000, STRUCTURED_OUTPUT 9900,
// HARNESS_SOURCE 10000, WEB_SURFACE 10100, persona-suffix 10200.
// GLOBAL_PROMPT_ORDER 는 -100000 이라 "맨 앞" 에만 맞는다; "맨 뒤" 가 필요하면 호스트
// 구간의 절대 order 를 써야 한다. 그렇지 않으면 GLOBAL_PROMPT_ORDER + n 도 음수라 persona 앞에 놓여,
// 긴 컨텍스트에서 가장 먼저 잘려 나가는 구간이 바로 그것이 된다.
const HOST_PERSONA_SUFFIX_ORDER = 10200;
const TAIL_PROMPT_ORDER = 10150; // WEB_SURFACE 뒤, persona-suffix 앞
// 강화 단락 위치: 기본 9500(DELIVERABLE 뒤, STRUCTURED_OUTPUT 앞).
// A/B 시에는 환경 변수나 $DSH_HOME/dsh-purge/boost-order.json 의 {"order": -50000} 로 덮어쓸 수 있고;
// 파일은 section 등록마다 다시 읽으므로, 파일을 고치면 새 세션에서 바로 적용되고 재시작이 필요 없다.
// 실측(1.6.48, 같은 6개 거절 유발 요청): 맨 앞에 두면 0/6 첫 거절, 9500 에 두면 2/6 첫 거절,
// 따라서 기본값은 "맨 앞" 으로 돌아가고, 필요하면 env / boost-order.json 으로 덮어쓴다.
const DEFAULT_BOOST_ORDER = GLOBAL_PROMPT_ORDER + 50000;
function boostPromptOrder() {
  const fromEnv = Number(process.env.PURGE_BOOST_ORDER);
  if (Number.isFinite(fromEnv) && fromEnv !== 0) return fromEnv;
  try {
    const home = process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
    const raw = JSON.parse(fs.readFileSync(path.join(home, "dsh-purge", "boost-order.json"), "utf8"));
    const n = Number(raw?.order);
    if (Number.isFinite(n) && n !== 0) return n;
  } catch { /* 파일이 없거나 읽을 수 없음 → 기본값 사용 */ }
  return DEFAULT_BOOST_ORDER;
}

const log = (config, ...args) => {
  if (config?.verbose) console.log("[dsh-purge]", ...args);
};


function fsExists(fp) {
  const list = Array.isArray(fp) ? fp : [fp];
  return list.some((p) => {
    if (!p || typeof p !== "string") return false;
    try {
      return fsFor(p).existsSync(p);
    } catch {
      return false;
    }
  });
}

function line(title, value, ok = null) {
  const mark = ok === null ? "·" : ok ? "✓" : "✗";
  return `${mark} ${title}: ${value}`;
}

function renderStatus(state) {
  const out = [];
  out.push("dsh-purge 상태 / Status");
  out.push(line("호스트 / surface", state.surface || hostctl.currentSurface()));
  out.push(line("DSH_HOME", state.dsh_home));
  if (state.desktop_install) out.push(line("데스크톱 설치 / desktop", state.desktop_install));
  if (state.ai_base) {
    out.push(line("플러그인 루트 / plugin root", state.ai_base));
    for (const [key, fp] of Object.entries(state.files)) {
      const list = Array.isArray(fp) ? fp : [fp];
      const shown = list.length <= 1 ? String(list[0] || "") : `${list[0]} (+${list.length - 1})`;
      out.push(`    ${fsExists(fp) ? "✓" : "✗"} ${key.padEnd(22)} ${shown}`);
    }
  } else {
    out.push(line("플러그인 루트 / plugin root", core.missingAiBaseMessage(), false));
  }
  out.push(line("shim 디렉터리", state.shim_dir || "미확인 / not found", !!state.shim_dir));
  if (state.desktop_runtimes?.length) {
    out.push(line("Desktop runtime", `${state.desktop_runtimes.length} sealed (shim OK; bak external)`, true));
    for (const d of state.desktop_runtimes) out.push(`    · ${d}`);
  }
  out.push(line("백업 / backup", state.has_backup ? "있음 / yes" : "없음 / no", state.has_backup));
  out.push(line("주입 파일 / inject", state.override_path));
  out.push(line("주입 상태 / override", state.override_status));
  if (state.asar_still_sealed) {
    out.push(line("app.asar", "대상 디스크에 아카이브가 있습니다; 이것만으로 현재 프로세스가 디렉터리 내용을 로드하는지 판단할 수 없습니다", false));
  }
  if (state.host_layout) out.push(line("실행 진입 증거", state.host_layout.note));
  out.push("");
  const displayRows = Array.isArray(state.display_patches)
    ? state.display_patches
    : core.groupPatchesForDisplay(core.ALL_PATCHES, state.patch_status || {});
  const displayTally = core.tallyDisplayPatches(displayRows);
  out.push(`패치 / patches: ${displayTally.applied}/${displayTally.total || 0} applied, ${displayTally.pending} pending`);
  for (const row of displayRows) {
    const s = row.status || "n/a";
    const mark = s === "applied" ? "✓" : s === "pending" ? "✗" : "·";
    const patch = core.ALL_PATCHES.find((item) => item.id === row.id);
    const label = patch ? patch.name : `patch-${row.id}`;
    const layer = patch ? `${patch.layer}/${patch.layer_en}` : row.layer || "";
    out.push(`  ${mark} [#${String(row.id).padEnd(2)}] ${label.padEnd(30)} ${layer} — ${s}`);
  }
  out.push("");
  out.push(`shim: dsh.cmd=${state.shim_cmd}  dsh.ps1=${state.shim_ps1}  dsh=${state.shim_bin}`);
  return out.join("\n");
}

function injectAllowedNow(config, context) {
  return injectionPolicy(config, context).allowed;
}

/** 프롬프트 상자 자체 수정 > prompt-inject.md > 암호화 기본값(rules.resolveInjectText 참고). */
// mtime 스로틀: 400ms setInterval + pre-step 마다 + preset-selected 마다 + readInjectFallback 마다
// 의 고빈도 트리거 아래에서 disk sync + hashOverride 3회 + 모듈 수준 대입 2회가 한 라운드에 20번까지 발생한다.
// 짧은 창에서는 이전 결과 재사용: home 불변 + 파일 mtime 불변 + 직전과 < 200ms 면 캐시를 바로 반환.
let hungCache = { home: "", mtime: 0, at: 0, resolved: null };
const HUNG_CACHE_MS = 200;
function statInjectMtimeMs(home) {
  if (!home) return 0;
  try {
    return Math.floor(fs.statSync(core.findOverrideFile(home)).mtimeMs);
  } catch { return 0; }
}
function refreshHungOperator(dshHome = core.findDshHome()) {
  const home = core.pinDshHome() || dshHome || core.findDshHome();
  const now = Date.now();
  const mtimeBefore = statInjectMtimeMs(home);
  if (
    hungCache.resolved
    && hungCache.home === home
    && hungCache.mtime === mtimeBefore
    && now - hungCache.at < HUNG_CACHE_MS
  ) {
    return hungCache.resolved;
  }
  try { core.syncPromptInjectOnDiskSync(home); } catch { /* 동기화 실패해도 resolve 경로로 진행 */ }
  const resolved = rules.resolveInjectText(home);
  // 폴백 순서: resolved.text > 암호화 기본값 > 절대 빈 문자열 아님(2라운드 fallbackInject 가 비어 purge[] 잔재로 가는 것을 방지).
  const fallback = core.normalizeOverride(core.defaultOverrideText()) || "";
  // 상자, 디스크, 암호화 슬롯은 그대로 둔다. 모델에 보낼 때만 ChatML 을 줄 단위로 정리하고 누락된 닫는 태그를 보충한다.
  const text = resolved.text || fallback;
  if (text) {
    core.hangOperatorPrompt(text);
    // "저장" 클릭과 동일하게 고정: 저장을 누르지 않아도 조립 시 이 전문을 읽어야 한다.
    core.rememberCommittedOverride(home, text);
  }
  const out = { ...resolved, text: text || resolved.text };
  // sync 이후의 mtime 으로 cache 를 저장해, 다음 고빈도 폴링(파일이 외부에서 바뀌지 않음)에서 바로 히트.
  hungCache = { home, mtime: statInjectMtimeMs(home), at: now, resolved: out };
  return out;
}

export function installHungPromptGlobal(config = {}, isActive = () => true) {
  // host 측 inject 폴백: 정상 cordis assemble 훅(rewriteLiveAssembly)과 이 경로는 상호 배타적이라
  // 중복 주입되지 않는다; 플러그인 첫 설치 / preset 전환 / hung session / 새 대화 첫 라운드의 훅 미준비 구간을 여기서 막는다.
  // [v10 4중 fallback] 새 대화 첫 라운드에서 refreshHungOperator 가 cache 미준비 / sync disk 실패 /
  // resolveInjectText 빈 반환(극단적 상황) 중 어느 하나라도 비면 host 가 읽는 inject 가 진공이 되어 모델이 스스로
  // "나는 Claude" 라고 말하게 된다. 4중 폴백으로 어떤 경로에서도 빈 문자열을 host 에 넘기지 않게 한다:
  //   1) refreshHungOperator — 전체 경로(sync disk + resolve + pin)
  //   2) hungOperatorPrompt   — 지난번에 걸어 둔 메모리 핀(프로세스 수명)
  //   3) readPromptInjectFileSync — 디스크의 prompt-inject.md 직접 읽기, sync/resolve 우회
  //   4) defaultOverrideText — 암호화 슬롯 언패킹, 플러그인 설치가 불완전하지 않으면 비어 있지 않다
  const fn = (context) => {
    if (!isActive()) return "";
    if (!injectAllowedNow(config, context)) return "";
    const norm = (s) => peelChatmlEnvelope(String(s || "").replace(/\r\n/g, "\n"));
    let home = "";
    try { home = core.findDshHome(); } catch { home = ""; }
    try {
      const text = norm(refreshHungOperator(home).text);
      if (text) { purgeLog("host.hungFn", { tier: "refresh", bytes: text.length }); return text; }
    } catch (e) { purgeLog("host.hungFn", { tier: "refresh", err: String(e?.message || e) }); }
    try {
      const hung = norm(core.hungOperatorPrompt());
      if (hung) { purgeLog("host.hungFn", { tier: "hung", bytes: hung.length }); return hung; }
    } catch (e) { purgeLog("host.hungFn", { tier: "hung", err: String(e?.message || e) }); }
    try {
      const disk = norm(core.readPromptInjectFileSync(home));
      if (disk) { purgeLog("host.hungFn", { tier: "disk", bytes: disk.length }); return disk; }
    } catch (e) { purgeLog("host.hungFn", { tier: "disk", err: String(e?.message || e) }); }
    try {
      const sealed = norm(core.defaultOverrideText());
      if (sealed) { purgeLog("host.hungFn", { tier: "sealed", bytes: sealed.length }); return sealed; }
    } catch (e) { purgeLog("host.hungFn", { tier: "sealed", err: String(e?.message || e) }); }
    purgeLog("host.hungFn", { tier: "empty", bytes: 0 });
    return "";
  };
  globalThis.__dshPurgeHungPrompt = fn;
  return fn;
}

// 항상 전문. 도구 단계에서 6000 자로 자르거나 .hung-disabled 로 나누면 HARD OUTPUT 이 잘려 2라운드 작업이 반드시 거절된다.
function shouldInjectAssembly(context) {
  const decision = { mode: "full", taskKind: "general", lastRole: "full", isSubagent: false };
  try {
    decision.isSubagent = context?.agent?.session?.header?.origin === "subagent";
  } catch {}
  if (globalThis.__dshPurgeRetryPending) {
    globalThis.__dshPurgeRetryPending = false;
    decision.lastRole = "retry";
  }
  return decision;
}

function readSessionEvents(session) {
  if (!session) return [];
  try {
    if (typeof session.snapshotEvents === "function") return session.snapshotEvents() || [];
  } catch { /* ignore */ }
  try {
    if (Array.isArray(session.events)) return session.events;
  } catch { /* ignore */ }
  return [];
}

// [방안2] 로그 프로브. 내부 파일에 기록해 host stderr 를 오염시키지 않는다. Monitor 는 tail -F 로 실시간 추적.
const PURGE_INTERNAL_LOG = path.join(os.tmpdir(), "dsh-purge-desktop.log");
// 로그 롤링: 약 1024 회 기록마다 크기를 확인해, >2MB 이면 현재 파일을 .1 로 rename 해 이전 .1 을 덮고,
// 새 파일은 자동으로 처음부터 시작. 긴 세션 / 핫 리로드가 assemble decision 을 반복 트리거해도 tmp 가 터지지 않는다.
const PURGE_INTERNAL_LOG_MAX = 2 << 20;
let _purgeLogWriteCount = 0;
function rotatePurgeInternalLog() {
  try {
    const st = fs.statSync(PURGE_INTERNAL_LOG);
    if (st.size > PURGE_INTERNAL_LOG_MAX) {
      try { fs.renameSync(PURGE_INTERNAL_LOG, `${PURGE_INTERNAL_LOG}.1`); } catch { /* 동시성 실패 시 다음에 재시도 */ }
    }
  } catch { /* 파일 없음 */ }
}
// 한 줄 ISO 타임스탬프 + 태그 + k=v... 형식. tail -F 추적 / grep 모두 읽기 쉽다.
// 값 안의 공백은 kv 를 쪼개므로 일괄 _ 로 바꿔 grep 이 안정적이게 한다.
function purgeLog(tag, kv) {
  try {
    if ((++_purgeLogWriteCount & 0x3ff) === 0) rotatePurgeInternalLog();
    let line = `${new Date().toISOString()} [${tag}]`;
    if (kv) {
      for (const k of Object.keys(kv)) {
        const raw = kv[k];
        const v = raw === undefined || raw === null ? "" : String(raw).replace(/\s+/g, "_");
        line += ` ${k}=${v}`;
      }
    }
    fs.appendFileSync(PURGE_INTERNAL_LOG, line + "\n", "utf8");
  } catch {}
}
function logAssembleDecision(where, decision) {
  purgeLog(`assemble.${where}`, {
    mode: decision.mode,
    task: decision.taskKind,
    last: decision.lastRole,
    sub: decision.isSubagent,
  });
}

function injectSnapshot(dshHome = core.findDshHome()) {
  const resolved = rules.resolveInjectText(dshHome);
  return {
    injectSource: resolved.source,
    injectRuleId: resolved.ruleId,
    needPrompt: resolved.source === "none",
  };
}

/** 상자에 표시 중인 텍스트 우선; 상자가 비면 resolveInjectText(prompt-inject.md 포함). */
function injectSnapshotFromBox(dshHome, boxText) {
  if (typeof boxText === "string" && core.normalizeOverride(boxText)) {
    return { injectSource: "prompt", injectRuleId: null, needPrompt: false };
  }
  const resolved = rules.resolveInjectText(dshHome);
  if (resolved.text) {
    return { injectSource: resolved.source, injectRuleId: null, needPrompt: false };
  }
  return { injectSource: "none", injectRuleId: null, needPrompt: true };
}

const NEED_PROMPT_ERROR = "프롬프트와 규칙 세트가 모두 비어 있습니다. 먼저 프롬프트를 추가해야 합니다";

function rejectIfNeedPrompt(dshHome, boxText) {
  const snap = injectSnapshotFromBox(dshHome, boxText);
  if (!snap.needPrompt) return null;
  return { ...snap, error: NEED_PROMPT_ERROR };
}

async function ensureRestartReady() {
  return core.ensureHostClean();
}

/** 프롬프트 서비스 자체의 ctx 는 대개 scope 가 없어 단락이 전역 계층으로 들어간다. 플러그인이 어떤 scope 에 붙어 있으면 preset 프록시의 부모 체인이 그 계층을 보지 못한다. */
function addPromptSection(ctx, section) {
  const hosts = [];
  const push = (host) => {
    if (host && !hosts.includes(host)) hosts.push(host);
  };
  try { push(ctx?.systemPrompt?.ctx); } catch { /* 프록시가 inject 되지 않았을 때 속성 접근은 예외를 던진다 */ }
  push(ctx);
  const disposers = [];
  let registered = false;
  let lastError = null;
  for (const host of hosts) {
    try {
      const d = host.systemPrompt.section(section);
      registered = true;
      if (typeof d === "function") disposers.push(d);
    } catch (error) {
      const msg = String(error && error.message || error);
      if (msg.includes("already registered")) registered = true;
      else lastError = error;
    }
  }
  if (!registered && lastError) throw lastError;
  // ctx.effect 로 reload / dispose 시 section 도 함께 철회되게 한다; host.systemPrompt.section
  // 현재는 대개 disposer 를 반환하지 않으므로, 이 부분은 function 을 반환하는 구현에만 적용되고 기존 동작을 바꾸지 않는다.
  if (disposers.length && typeof ctx?.effect === "function") {
    try {
      ctx.effect(() => () => {
        for (const d of disposers) {
          try { d(); } catch { /* ignore */ }
        }
      });
    } catch { /* 죽은 ctx */ }
  }
}

export function registerPromptSections(ctx, config) {
  const injectText = (context) =>
    !injectAllowedNow(config, context)
      ? ""
      : escapeDshInterpolation(
          peelChatmlEnvelope(
            adaptInjectForMinimalPreset(readInjectFallback(context), context),
          ),
        );
  const tuning = readTuning();
  const injectPosition = tuning.injectPosition;
  // head: 안정된 접두사, 토큰 절약, 캐시 친화적; tail: 출력에 밀착, 다중 라운드 감쇠 최소; both: 양쪽 모두 고정.
  if (injectPosition === "head" || injectPosition === "both") {
    addPromptSection(ctx, {
      name: "dsh-purge",
      order: GLOBAL_PROMPT_ORDER,
      interpolate: false,
      text: injectText,
    });
  }
  if (injectPosition === "tail" || injectPosition === "both") {
    addPromptSection(ctx, {
      name: "dsh-purge-tail",
      order: TAIL_PROMPT_ORDER,
      interpolate: false,
      text: injectText,
    });
  }
  if (injectPosition === "tail") {
    // tail 모드에서도 빈 헤더 자리표시자를 남겨, 호스트/패치가 이름으로 dsh-purge 단락을 찾을 때 빗나가지 않게 한다.
    addPromptSection(ctx, {
      name: "dsh-purge",
      order: GLOBAL_PROMPT_ORDER,
      interpolate: false,
      text: () => "",
    });
  }

  if (config.capabilityProtocol !== false) {
    addPromptSection(ctx, {
      name: CAPABILITY_SECTION,
      order: GLOBAL_PROMPT_ORDER + 1,
      interpolate: false,
      text: (context) => {
        if (!injectAllowedNow(config, context)) return "";
        const redteam = isRedteamSession(context);
        return capabilityProtocolText({
          redteam,
          redteamChild: redteam && context?.agent?.session?.header?.origin === "subagent",
          enabled: true,
        });
      },
    });
  }

  if (readBoost()) {
    // 꼬리 boost 단락: order 가 일반 section 보다 훨씬 커서 긴 컨텍스트에서도 마지막에 온다.
    addPromptSection(ctx, {
      name: "dsh-purge-boost",
      order: boostPromptOrder(),
      interpolate: false,
      text: (context) => (injectAllowedNow(config, context) ? BOOST_TEXT : ""),
    });
  }

  // 런타임 프로브: probe.json 이 존재하고 만료되지 않았을 때만 걸고, 만료되면 자동으로 사라진다.
  addPromptSection(ctx, {
    name: PROBE_SECTION,
    order: GLOBAL_PROMPT_ORDER + 60000,
    interpolate: false,
    text: (context) => (injectAllowedNow(config, context) ? probeText() : ""),
  });

  const postPrompt = typeof config.postPrompt === "string" ? config.postPrompt.trim() : "";
  if (!postPrompt) return;
  if (!Number.isFinite(config.postPromptOrder) || config.postPromptOrder <= GLOBAL_PROMPT_ORDER) {
    // 예전에는 throw 가 apply 전체를 망가뜨렸다; postPrompt 는 부가 단락이라 skip 으로 낮춰도 핵심 주입에 영향 없다.
    console.warn(
      `[dsh-purge] postPromptOrder (${config.postPromptOrder}) 는 ${GLOBAL_PROMPT_ORDER} 보다 큰 유한수여야 합니다; postPrompt 단락을 건너뜁니다`,
    );
    return;
  }
  addPromptSection(ctx, {
    name: "dsh-purge:post",
    order: config.postPromptOrder,
    text: (context) => (injectAllowedNow(config, context) ? postPrompt : ""),
  });
}

function readInjectFallback(context) {
  let home = "";
  try { home = core.findDshHome(); } catch { home = ""; }
  const refreshed = refreshHungOperator(home);
  let text = refreshed.text || "";
  let source = text ? "refresh" : "none";
  if (!text) {
    const fallback = rules.ensureOperatorBody(home);
    if (fallback) { text = fallback; source = "ensure"; }
  }
  if (!text) {
    purgeLog("inject.read", { source: "empty", bytes: 0 });
    return "";
  }
  let redteam = false;
  try { redteam = isRedteamSession(context); } catch { redteam = false; }
  let subagent = false;
  try { subagent = context?.agent?.session?.header?.origin === "subagent"; } catch {}
  const out = modePromptText(text, redteam);
  purgeLog("inject.read", {
    source,
    srcTag: refreshed.source || "n/a",
    redteam,
    sub: subagent,
    rawBytes: text.length,
    outBytes: out.length,
  });
  return out;
}

function installMnemonMessageStrip(ctx, config = {}) {
  if (typeof ctx.on !== "function") return;
  if (ctx.__dshPurgeMnemonStrip) return;
  ctx.__dshPurgeMnemonStrip = true;
  const strip = config.stripMnemon !== false;
  const wrap = async (_payload, next) => {
    const decision = await next();
    if (!decision) return decision;
    // agent-loop 는 decision.messages.length 를 읽는다; 배열이 없으면 2라운드에서 gateway/internal 이 바로 터진다.
    const incoming = Array.isArray(decision.messages) ? decision.messages : [];
    const messages = strip ? incoming.filter((message) => !isMnemonPluginMessage(message)) : incoming;
    if (messages.length === incoming.length && Array.isArray(decision.messages)) return decision;
    return { ...decision, messages };
  };
  // 예전에는 late() + queueMicrotask(late) + setTimeout(late, 1500) 세 갈래가 모두 성공하면,
  // 같은 wrap 이 agent/pre-step 워터폴에 3겹 쌓이고, 중간 플러그인이 반환한 decision 이 라운드마다 3번 필터링됐다.
  // 여기서는 mounted 게이트를 쓴다: 처음 성공적으로 걸리면 재시도하지 않고, disposer 를 받아 ctx.effect 로 회수한다.
  let mounted = false;
  let dispose = null;
  const late = () => {
    if (mounted) return;
    try {
      const d = ctx.on("agent/pre-step", wrap, { global: true, prepend: true });
      mounted = true;
      if (typeof d === "function") dispose = d;
    } catch { /* 다음에 재시도 */ }
  };
  late();
  if (!mounted) queueMicrotask(late);
  let retryTimer = null;
  if (!mounted) {
    retryTimer = setTimeout(late, 1500);
    if (typeof retryTimer.unref === "function") retryTimer.unref();
  }
  try {
    ctx.effect(() => () => {
      if (retryTimer) clearTimeout(retryTimer);
      try { dispose?.(); } catch { /* ignore */ }
    });
  } catch { /* 죽은 ctx 에는 effect 가 없으니 다음 apply 가 덮는다 */ }
}

export function rewriteLiveAssembly(config, assembled, context, decision = { mode: "full", taskKind: "general" }) {
  const selection = injectionPolicy(config, context);
  const scoped = excludedPresetIds(config).length > 0;
  if (!selection.allowed && scoped) {
    purgeLog("assemble.excluded", { preset: selection.preset, excluded: selection.excluded, unknown: selection.unknown, policy: "always", injectBytes: 0 });
    return withoutPurgeInjection(assembled);
  }
  if (scoped) assembled = withoutPurgeInjection(assembled, { keepPluginSections: true });
  const enabled = config.enabled !== false;
  const redteam = enabled && isRedteamSession(context);
  const full = enabled ? readInjectFallback(context) : "";
  const dshHome = enabled ? core.findDshHome() : "";
  let cwd = "";
  try { cwd = String(context?.agent?.session?.header?.cwd || "").trim(); } catch { /* ignore */ }
  if (dshHome && cwd) {
    try { rules.writeLastCwd(dshHome, cwd); } catch { /* ignore */ }
  }
  const policy = enabled && dshHome ? rules.readWorkspacePolicy(dshHome) : "always";
  // 프롬프트 상자가 비었을 때만 선택된 로컬 cwd 규칙 폴백을 켠다; prompt-inject.md 와 겹쳐 오염되는 것을 피한다.
  let localInject = "";
  if (enabled && dshHome && !String(full || "").trim()) {
    try { localInject = rules.readSelectedCwdInject(dshHome, cwd); } catch { /* ignore */ }
  }
  const effectiveFull = String(full || "").trim() ? full : localInject;
  const inject = effectiveFull;
  const anchorApplied = false;
  const hasInject = Boolean(String(inject || "").trim());
  let dropWorkspaceBaseline = false;
  if (enabled) {
    if (policy === "strict") dropWorkspaceBaseline = true;
    else if (policy === "fallback") dropWorkspaceBaseline = hasInject;
    else dropWorkspaceBaseline = false;
  }
  const roleText = redteam ? resolveSubagentRoleText(context) : "";
  const rewritten = rewritePromptAssembly(assembled, {
    fallbackInject: inject,
    dropMnemon: config.stripMnemon !== false,
    dropPurgeAfterFold: false,
    capabilityProtocol: config.capabilityProtocol !== false,
    context,
    roleText,
    dropWorkspaceBaseline,
  });
  const closerFollow = closerFollowBytes(rewritten?.sections);
  purgeLog("assemble.rewrite", {
    enabled,
    redteam,
    mode: decision?.mode || "full",
    task: decision?.taskKind || "general",
    last: decision?.lastRole || "unknown",
    fullBytes: full.length,
    localBytes: localInject.length,
    injectBytes: inject.length,
    anchorApplied,
    roleBytes: roleText.length,
    cap: config.capabilityProtocol !== false,
    strip: config.stripMnemon !== false,
    policy,
    dropWorkspaceBaseline,
    injectHead: Array.isArray(rewritten?.sections) && rewritten.sections[0]?.name === "dsh-purge",
    chatml: Array.isArray(rewritten?.sections) && /<project_instructions>|<\|im_start\|>/i.test(String(rewritten.sections[0]?.text || "")),
    afterCloser: closerFollow,
    cwd,
  });
  return scoped ? rememberPromptRewrite(assembled, rewritten) : rewritten;
}

function closerFollowBytes(sections) {
  const closer = "</project_instructions>";
  const joined = (Array.isArray(sections) ? sections : [])
    .map((section) => (typeof section?.text === "string" ? section.text : ""))
    .filter(Boolean)
    .join("\n\n");
  const at = joined.lastIndexOf(closer);
  if (at < 0) return -1;
  return joined.length - (at + closer.length);
}

/** 레지스트리가 이전 파일로 rev 를 계산해 두었다면 즉시 rebuilt 해, 페이지가 받는 주소와 캐시를 일치시킨다(#63). */
function publishClientBundleRevs(ctx, packageNames) {
  if (!Array.isArray(packageNames) || packageNames.length === 0) return;
  let mods = null;
  try {
    mods = ctx?.get?.("clientModules", false);
  } catch {
    mods = null;
  }
  if (!mods || typeof mods.rebuilt !== "function") return;
  for (const id of packageNames) {
    try { mods.rebuilt(id); } catch { /* 이 패키지가 아직 레지스트리에 없음, 다음 스냅샷에서 새 파일을 읽는다 */ }
  }
}

/** Cordis 의 ctx 는 Proxy 라, inject 를 선언하지 않았을 때 속성 접근은 "cannot get property ... without inject" 를 던진다. 그래서 두 구간 모두 try 로 감싼다. */
function permissionPresetsOf(ctx) {
  try {
    const direct = ctx?.permissionPresets;
    if (direct && typeof direct.set === "function") return direct;
  } catch {
    /* 이 서비스를 inject 하지 않았을 때 Cordis 프록시가 던지는데, 새 세션의 전체 권한 고정이 실패하게 두면 안 된다. */
  }
  try {
    const svc = ctx?.get?.("permissionPresets");
    if (svc && typeof svc.set === "function") return svc;
  } catch {
    /* 이 서비스가 없다. */
  }
  return null;
}

function shouldKeepFreshFullAccess(session, svc) {
  if (session?.header?.origin === "subagent") return false;
  const state = typeof svc.permissionState === "function" ? svc.permissionState(session) : null;
  const preset = state?.preset;
  if (preset === "danger-full-access" || preset === "auto" || preset === "custom") return false;
  const events = typeof session?.snapshotEvents === "function" ? session.snapshotEvents() : [];
  const pins = Array.isArray(events) ? events.filter((event) => event?.type === "permission/preset") : [];
  if (pins.length > 1) return false;
  return preset == null || preset === "workspace-write" || preset === "read-only";
}

function upgradeFreshSessionAccess(ctx, session) {
  try {
    const svc = permissionPresetsOf(ctx);
    if (!svc || !shouldKeepFreshFullAccess(session, svc)) return;
    svc.set(session, "danger-full-access");
  } catch (error) {
    console.warn("[dsh-purge] full-access pin:", error instanceof Error ? error.message : String(error));
  }
}

/** 빈 세션 화면은 배포 기본값대로 전체 권한을 표시한다; 세션 생성 시 workspace-write 로 고정하면 메시지 전송 후 칩이 떨어진다. */
function installFreshFullAccess(ctx) {
  if (typeof ctx.on !== "function" || ctx.__dshPurgeFullPin) return;
  ctx.__dshPurgeFullPin = true;
  // ctx.effect: plugin dispose 시 session/created 를 해제한다. 아니면 handler 가 남고 핫 리로드마다 배가된다.
  ctx.effect(() => {
    let disposer = null;
    try { disposer = ctx.on("session/created", (session) => {
      queueMicrotask(() => upgradeFreshSessionAccess(ctx, session));
    }); } catch { /* ignore */ }
    return () => {
      try { if (typeof disposer === "function") disposer(); } catch { /* ignore */ }
      delete ctx.__dshPurgeFullPin;
    };
  });
}

function installCwdCapture(ctx) {
  if (!ctx || ctx.__dshPurgeCwdCapture) return;
  if (typeof ctx.on !== "function") return;
  ctx.__dshPurgeCwdCapture = true;
  const home = core.findDshHome();
  let lastWritten = "";
  const flush = (session) => {
    try {
      const cwd = String(session?.header?.cwd || "").trim();
      if (!cwd || !home || cwd === lastWritten) return;
      rules.writeLastCwd(home, cwd);
      lastWritten = cwd;
    } catch { /* ignore */ }
  };
  try {
    const store = ctx.get?.("sessions");
    const all = typeof store?.all === "function" ? store.all()
      : typeof store?.list === "function" ? store.list()
      : [];
    for (const session of all || []) flush(session);
  } catch { /* ignore */ }
  ctx.effect(() => {
    const disposers = [];
    try { disposers.push(ctx.on("session/created", flush)); } catch { /* ignore */ }
    try { disposers.push(ctx.on("session/event", (session) => flush(session))); } catch { /* ignore */ }
    return () => {
      for (const d of disposers) {
        try { if (typeof d === "function") d(); } catch { /* ignore */ }
      }
      delete ctx.__dshPurgeCwdCapture;
    };
  });
}

function installRewindDeriveFilter(ctx) {
  if (!ctx || ctx.__dshPurgeRewindDerive) return;
  ctx.__dshPurgeRewindDerive = true;
  const wrapOne = (session) => {
    try { rewind.wrapSessionDeriveMessages(session); } catch { /* ignore */ }
  };
  try {
    const store = ctx.get?.("sessions");
    const all = typeof store?.all === "function" ? store.all()
      : typeof store?.list === "function" ? store.list()
      : [];
    for (const session of all || []) wrapOne(session);
  } catch { /* ignore */ }
  ctx.effect(() => {
    let disposer = null;
    try { disposer = ctx.on("session/created", (session) => wrapOne(session)); } catch { /* ignore */ }
    return () => {
      try { if (typeof disposer === "function") disposer(); } catch { /* ignore */ }
      delete ctx.__dshPurgeRewindDerive;
    };
  });
}

export function installIdentityOverride(ctx, config = {}) {
  if (typeof ctx.on !== "function") return;
  let active = true;
  installSubagentRoleCapture(ctx);
  // installAssembleGuard 멱등: slot.rewrite 가 이미 건 prompt 객체는 rewriteFn 만 새로 고치고,
  // 새 dispose 를 반환하지 않는다. 원 구현은 400ms 마다 + pre-step 마다 noop closure 를 Set 에 넣어,
  // 2시간 세션에서 수만 개가 쌓였다. 그래서 처음 실제로 걸린 disposer 만 추적하도록 바꿨다.
  const wrapDisposers = new Set();
  const wrappedPrompts = new WeakSet();
  const trackDisposer = (d, prompt) => {
    if (typeof d !== "function") return d;
    if (prompt) {
      if (wrappedPrompts.has(prompt)) return d;
      wrappedPrompts.add(prompt);
    }
    wrapDisposers.add(d);
    return d;
  };
  const rewriteFn = (assembled, context) => {
    if (!active) return assembled;
    // [방안2] installAssembleGuard 도 이 경로를 쓰며 full/anchor 를 같은 방식으로 결정한다.
    const decision = shouldInjectAssembly(context);
    logAssembleDecision("rewriteFn", decision);
    return rewriteLiveAssembly(config, assembled, context, decision);
  };
  // interval 하트비트가 400ms 마다 호출되고 정상 상태에서는 모든 인자가 불변 — 상태가 뒤집히거나 오류일 때만 로그를 써서,
  // 하루 수백만 건의 guard.wrap 이 7MB 로그를 밀어내고 실제 이벤트를 묻는 것을 막는다.
  let lastGuardSig = "";
  const wrapAssemble = (caller = "unknown") => {
    if (!active) return false;
    try {
      const prompt = ctx.systemPrompt;
      const d = installAssembleGuard(prompt, rewriteFn);
      const mounted = typeof d === "function";
      const tracked = trackDisposer(d, prompt);
      const sig = `${!!prompt}|${mounted}`;
      if (sig !== lastGuardSig) {
        purgeLog("guard.wrap", { caller, prompt: !!prompt, mounted });
        lastGuardSig = sig;
      }
      return tracked;
    } catch (e) {
      purgeLog("guard.wrap", { caller, err: String(e?.message || e) });
      lastGuardSig = "";
      return false;
    }
  };
  if (!ctx.__dshPurgeAssembleHook) {
    ctx.__dshPurgeAssembleHook = true;
    // cordis 버전에 따라 waterfall 이 (assembly, context) 또는 (assembly, context, next) 일 수 있다:
    // 예전 방식은 `next` 를 함수로 보고 3번째 인자를 그대로 썼는데, 구형 호스트에서는 context 가 next 가 되어 await next() 가 즉시 던진다.
    // disposer 는 wrapDisposers 에 넣지 않는다: ctx.effect cleanup 은 child scope 종료/preset 전환에서도 트리거되고,
    // 거기에 넣으면 잘못 해제되어 이후 다시 걸 수 없다. cordis 가 실제 dispose 할 때 listener 는 ctx 와 함께 풀린다.
    try {
      ctx.on("system-prompt/assemble", async (...args) => {
        const [assembly, context] = args;
        const next = args.length >= 3 ? args[args.length - 1] : null;
        // 진입 즉시 기록 — 요청이 실제로 우리 handler 에 도달했는지 본다; hasNext=false 면 cordis 가
        // 구형 시그니처를 쓰는 것이고, 하위 waterfall 은 전부 우리가 반환한 assembled 에 의존한다.
        let eventsLen = 0;
        try { eventsLen = readSessionEvents(context?.agent?.session).length; } catch {}
        purgeLog("assemble.entry", {
          hasNext: typeof next === "function",
          sections: Array.isArray(assembly?.sections) ? assembly.sections.length : -1,
          events: eventsLen,
        });
        let assembled = assembly;
        if (typeof next === "function") {
          try {
            assembled = await next();
          } catch (err) {
            // 하위 waterfall 어느 단계든 던지면 assemble 전체가 죽어 UI 가 멈추고 전송되지 않는다.
            // 삼키고 상위 조립으로 폴백해 inject 가 최소한 걸리게 한다.
            try { console.warn("[dsh-purge] system-prompt/assemble waterfall rejected:", err?.message || err); } catch {}
            purgeLog("assemble.waterfall", { err: String(err?.message || err) });
            assembled = assembly;
          }
        }
        if (!active) return assembled;
        try {
          // [v10] 이벤트 핸들러는 시작 시 능동적으로 refresh 한다: 새 대화 첫 라운드에서 hungCache 가 null 일 수 있고,
          // installAssembleGuard 가 아직 systemPrompt 를 감싸지 못했을 수 있어, 여기서 pinned/디스크를 강제로 데운다.
          // readInjectFallback → refreshHungOperator 가 데워진 cache 를 맞혀 빈 값 경로로 돌아가지 않게 보장한다.
          try { refreshHungOperator(core.findDshHome()); } catch { /* resolve 과정 예외는 막지 않는다 */ }
          const decision = shouldInjectAssembly(context);
          logAssembleDecision("event", decision);
          return rewriteLiveAssembly(config, assembled, context, decision);
        } catch (err) {
          try { console.warn("[dsh-purge] rewriteLiveAssembly failed:", err?.message || err); } catch {}
          purgeLog("assemble.rewriteFail", { err: String(err?.message || err) });
          return assembled;
        }
      }, { global: true, prepend: true });
    } catch { /* ctx.on 구형 시그니처 예외, 다음 apply 가 덮는다 */ }
  }
  // preset 을 바꾸면 assemble 이 교체된다. pre-step 워터폴은 assemble 이후에 돌아 첫 전송에는 걸리지 않는다.
  // 호스트가 assemble 전에 이 함수를 호출하면 현재 모드 자체의 systemPrompt 를 쓴다.
  const prepareAssemble = (loopCtx) => {
    if (!active) return null;
    try { refreshHungOperator(core.findDshHome()); } catch { /* 주 디렉터리에 아직 프롬프트가 없다 */ }
    // loopCtx 는 호스트의 Proxy 일 수 있어 .systemPrompt 접근 자체가 던진다(프록시 계층에 서비스 미주입).
    let prompt = null;
    try { prompt = loopCtx && loopCtx.systemPrompt; } catch { prompt = null; }
    if (prompt) {
      try {
        trackDisposer(installAssembleGuard(prompt, rewriteFn), prompt);
      } catch { /* 이 계층 프록시를 감쌀 수 없으면 아래에서 플러그인 자신의 것을 감싼다 */ }
    }
    try {
      const iso = (loopCtx && loopCtx.ctx) || loopCtx;
      if (iso && iso !== ctx) registerPromptSections(iso, config);
    } catch { /* 격리 계층에 아직 systemPrompt 가 없다 */ }
    wrapAssemble("prepareAssemble");
    return prompt || null;
  };
  globalThis.__dshPurgePrepareAssemble = prepareAssemble;
  const hungFn = installHungPromptGlobal(config, () => active);
  // complete:true 는 waterfall 이후 sections 를 덮어쓴다; assemble 반환값을 감싸 매 라운드 주입을 되돌려 넣는다.
  wrapAssemble("init");
  // guard 는 cordis 가 systemPrompt 프록시를 바꿀 때마다 다시 걸어야 한다(세션 내 preset 전환, subagent fork,
  // live-mount). 원래는 20초 뒤 clearInterval 해서 이후 프록시 교체 시 감싸지 못했고 → 2라운드 inject 가 네이티브
  // assemble 로 가 → 호스트가 토큰 예산으로 잘라냄 → 사용자는 "일부만 잘렸다" 를 본다. installAssembleGuard 는 멱등이고
  // (wrappedPrompts WeakSet + 객체 identity 검사) 400ms 로 ctx dispose 까지 계속 돌아도 CPU 비용은 무시할 수 있다.
  // 400ms 로 되돌린 이유: 2000ms 창이면 새 대화 첫 assemble 이 훅이 걸리기 전에 돌아 inject 가 무너진다.
  // 멱등 wrap 의 CPU 비용은 "새 대화 무효" 라는 사용자 체감에 비하면 논할 가치도 없다.
  const timer = setInterval(() => wrapAssemble("interval"), 400);
  if (typeof timer.unref === "function") timer.unref();
  // 아래 세 ctx.on 은 반드시 flag 를 써야 한다: installIdentityOverride 가 같은 ctx 에 두 번 apply 되면
  // (dispose 후 재마운트 / 핫 리로드) listener 가 겹쳐 inject 가 N 번 돌고 wrap 도 N 겹이 된다.
  if (!ctx.__dshPurgeSessionHook) {
    ctx.__dshPurgeSessionHook = true;
    try {
      ctx.on("session/created", () => {
        try { refreshHungOperator(core.findDshHome()); } catch { /* 주 디렉터리에 아직 프롬프트가 없다 */ }
        wrapAssemble("sessionCreated");
      });
    } catch { /* ignore */ }
  }
  if (!ctx.__dshPurgePresetHook) {
    ctx.__dshPurgePresetHook = true;
    try {
      ctx.on("agent-preset/selected", () => {
        try { refreshHungOperator(core.findDshHome()); } catch { /* 주 디렉터리에 아직 프롬프트가 없다 */ }
        wrapAssemble("presetSelected");
      }, { global: true });
    } catch { /* ignore */ }
  }
  if (!ctx.__dshPurgePreStepHook) {
    ctx.__dshPurgePreStepHook = true;
    try {
      ctx.on("agent/pre-step", (payload, next) => {
        wrapAssemble("preStep");
        return typeof next === "function" ? next() : payload;
      }, { global: true, prepend: true });
    } catch { /* ignore */ }
  }
  // 핫 리로드/언로드 시 일괄 회수: 폴링 timer, guard 프록시 계층, agent loop 에 노출한 전역 훅,
  // 모두 같은 effect 안에서 정리한다; 다음 apply 가 또 한 겹 묶어 여러 번 쓰는 것을 막는다.
  try {
    ctx.effect(() => () => {
      active = false;
      clearInterval(timer);
      if (globalThis.__dshPurgePrepareAssemble === prepareAssemble) delete globalThis.__dshPurgePrepareAssemble;
      if (globalThis.__dshPurgeHungPrompt === hungFn) delete globalThis.__dshPurgeHungPrompt;
      for (const d of wrapDisposers) {
        try { d(); } catch { /* ignore */ }
      }
      wrapDisposers.clear();
      // flag 를 비워 다음 apply 가 listener 를 다시 걸 수 있게 한다; 아니면 ctx 재사용 시 조용히 무응답이 된다.
      delete ctx.__dshPurgeSessionHook;
      delete ctx.__dshPurgePresetHook;
      delete ctx.__dshPurgePreStepHook;
      // [v10] AssembleHook 도 비워야 한다. 원래 삭제를 빠뜨려, ctx 재사용 시 새 apply 가 flag=true 를 보고 건너뛰어
      // ctx.on("system-prompt/assemble", ...) 이 영원히 설치되지 않고 → 새 대화 첫 라운드가
      // 400ms setInterval wrapAssemble guard 에 전적으로 의존해, 시간 창을 놓치면 inject 가 진공이 된다.
      delete ctx.__dshPurgeAssembleHook;
      // Only remove callbacks owned by this scope; a newer plugin instance keeps its hooks.
    });
  } catch { /* effect 가 없으면 unref + 다음 apply 의 자기 덮어쓰기에 맡긴다 */ }
}

function shimNeedsPatch(state) {
  if (hostctl.currentSurface() === "desktop") return false;
  return (
    state.shim_cmd === "original" ||
    state.shim_ps1 === "original" ||
    state.shim_bin === "original"
  );
}

function currentSettleScope() {
  let sealed = false;
  try { sealed = core.desktopAsarStillSealed(); } catch { /* 데스크톱이 아니거나 설치 디렉터리를 아직 찾지 못함 */ }
  return { surface: hostctl.currentSurface(), sealed };
}

async function settleInstalledPatches(config, ctx, life) {
  if (life && !life.alive) return "skip:inactive";
  try { core.rememberUnpackedArchive(); } catch { /* 공식 설치 디렉터리가 없으면 아카이브를 기억할 필요가 없다 */ }
  try {
    reapply.ensureInstalledRevSeed();
  } catch (e) {
    log(config, "seed installed-rev failed:", String(e && e.message ? e.message : e));
  }
  try {
    if (reapply.healEmptyAppliedStamp()) log(config, "healed empty applied stamp");
  } catch (e) {
    log(config, "heal applied stamp failed:", String(e && e.message ? e.message : e));
  }

  if (config.autoApplyOnStart !== true) {
    try {
      if (await reapply.patchesMatchInstallStrict() || await reapply.hostCleanEnoughToKeep()) {
        reapply.markPatchesApplied();
        log(config, "boot: host files left untouched; stamp kept");
        return "boot:host-untouched";
      }
    } catch { /* 스탬프가 없어도 무방, 사용자가 적용을 누를 때까지 기다린다 */ }
    log(config, "boot: skip host writes (Apply once)");
    return "skip:boot-no-host-write";
  }

  const scope = currentSettleScope();
  if (!(await reapply.patchesMatchInstallStrict())) {
    if (!settleMayReapply(scope)) {
      log(config, "sealed desktop: skip startup reapply (wait for Apply)");
      return "skip:sealed-wait-apply";
    }
    if (await reapply.hostCleanEnoughToKeep()) {
      reapply.markPatchesApplied();
      log(config, "host already clean; kept patches and refreshed stamp");
      return "already-clean";
    }
    if (officialUpdate.upgradeMarkerExists(process.execPath)) {
      const upgraded = await reapply.reapplyInstalled({ scheduleSwap: false, upgrade: true });
      if (life && !life.alive) return "skip:inactive";
      if (!upgraded.ok) {
        log(config, "official upgrade reapply failed:", upgraded.error || "");
        return "reapply-failed";
      }
      officialUpdate.clearUpgradeMarker(process.execPath);
      officialUpdate.clearStaleExtractedApps(process.execPath);
      if (!settleMayRestart(currentSettleScope()) || reapply.shouldSkipSettleRestart()) {
        if (upgraded.needsFullQuit) bootFullQuit = true;
        log(config, "official upgrade reapplied; skip settle restart");
        return "reapplied-no-restart";
      }
      reapply.markSettleRestart();
      log(config, "official upgrade reapplied; restarting onto the new build");
      // ctx 는 reapply.reapplyInstalled 의 await 중에 dispose 될 수 있다; 재시작 전에 한 번 더 확인한다.
      if (life && !life.alive) return "skip:inactive";
      try {
        hostctl.scheduleRestart(null, ctx, { openBrowser: false });
      } catch (e) {
        log(config, "restart after official upgrade failed:", String(e && e.message ? e.message : e));
        return "restart-failed";
      }
      return "restarting";
    }

    // 시작 시 자가 치유는 디스크 기록만 하고 asar 교체 / 프로세스 종료를 하지 않아, 공식 Host Fiber._reload 가 INACTIVE_EFFECT 를 만나지 않게 한다.
    const result = await reapply.reapplyInstalled({ scheduleSwap: false });
    if (life && !life.alive) return "skip:inactive";
    if (!result.ok) {
      log(config, "reapply failed:", result.error || "");
      return "reapply-failed";
    }
    // reapply 성공 후 비어 있지 않은 스탬프를 강제로 보장해, clean 경로가 빠뜨려 헛도는 것을 막는다(#59/#60).
    try { reapply.markPatchesApplied(); } catch { /* ignore */ }
    if (result.needsFullQuit) {
      bootFullQuit = true;
      log(config, "reapply wrote patches; official host needs a full quit");
      return "full-quit";
    }
    if (!settleMayRestart(currentSettleScope())) {
      log(config, "reapply wrote patches; desktop settle does not restart");
      return "reapplied-no-restart";
    }
    if (reapply.shouldSkipSettleRestart()) {
      log(config, "reapply wrote patches; skip settle restart (cooldown)");
      return "reapplied-no-restart";
    }
    // 이미 정렬되었으면 재시작할 필요가 없다; stamp/호스트가 여전히 불일치할 때만 한 번 재시작한다.
    if (await reapply.patchesMatchInstallStrict()) {
      log(config, "reapply wrote patches; already aligned, no restart");
      return "reapplied";
    }
    reapply.markSettleRestart();
    log(config, "reapply wrote patches; restarting");
    // reapplyInstalled 는 await 를 포함한다; 재시작 전에 life 를 한 번 더 확인해 disposed ctx 에 scheduleRestart 를 걸지 않게 한다.
    if (life && !life.alive) return "skip:inactive";
    try {
      // web: 자가 치유 재시작은 브라우저를 띄우지 않고, 창을 닫은 뒤 다시 새 창이 반복해서 뜨면 안 된다(#59/#61).
      hostctl.scheduleRestart(null, ctx, { openBrowser: false });
    } catch (e) {
      log(config, "restart after reapply failed:", String(e && e.message ? e.message : e));
      return "restart-failed";
    }
    return "restarting";
  }

  return autoApply(config);
}

async function autoApply(config) {
  try {
    core.applyRuntimeEnv();
    const sanitized = core.sanitizeDesktopCommandRuntimes();
    if (sanitized.length) log(config, "desktop runtime sanitized:", JSON.stringify(sanitized));

    core.refreshHooksDenySettings();
    if (core.getHooksDenySettings().hooksDenyBypass === false) {
      const restored = await core.restoreHookDenyForBases(core.enumeratePatchAiBases());
      if (restored.failed.length) {
        log(config, "hooks-deny restore leftover:", restored.failed.join(","));
      }
    }

    const state = await core.gatherState();
    if (!state.ai_base) {
      log(config, "skip auto-apply: plugin root not found");
      return "skip:plugin_root_not_found";
    }
    try {
      const flash = core.silenceCmdFlash(state.ai_base);
      log(config, "cmd-flash:", JSON.stringify(flash));
      if (!flash.ok) log(config, "cmd-flash incomplete:", flash.entry);
    } catch (e) {
      log(config, "cmd-flash failed:", String(e));
    }

    if (state.patches_pending === 0) {
      if (config.autoApplyOnStart && shimNeedsPatch(state)) {
        await core.patchAllShims();
        core.silenceCmdFlash(state.ai_base);
        log(config, "auto-apply: patches clean, shim refreshed");
        return "already_clean:shim_patched";
      }
      log(config, "auto-apply: already clean");
      return "already_clean";
    }
    if (!config.autoApplyOnStart) {
      log(config, "auto-apply disabled");
      return "disabled";
    }
    const autoMulti = await core.applyPatchesAllHosts(core.ALL_PATCHES, { preserveClientBundles: true });
    await core.patchAllShims();
    const report = autoMulti.report;
    const flash = core.silenceCmdFlash(autoMulti.hosts[0]?.aiBase || state.ai_base);
    const applied = report.filter((r) => r.status === "applied").length;
    log(config, `auto-apply done: ${applied} applied; cmd-flash=${flash.entry} ok=${flash.ok}`);
    return flash.ok ? `applied:${applied}` : `applied:${applied}:cmd_flash_incomplete`;
  } catch (e) {
    console.warn("[dsh-purge] auto-apply error:", String(e));
    return `error:${e}`;
  }
}

/** 적용 직후의 재시작. 밀봉 패키지를 종료 후 다시 열어, 사용자가 직접 종료하기만 기다리지 않는다. */
function scheduleApplyRestart(shouldRestart, ctx = null) {
  if (!shouldRestart) return { restarting: false };
  if (core.desktopAsarStillSealed()) {
    // ctx 를 코어 계층에 그대로 넘겨, 밀봉 패키지 재시작도 PowerShell 로 Electron 즉시 kill + requestRestart
    // 이중 안전 경로를 타게 해 "host stopped" 크래시 대화상자가 다시 뜨지 않게 한다 (#64).
    const planned = core.restartSealedDesktopIfNeeded({ ctx });
    return {
      ...(planned || {}),
      restarting: Boolean(planned && (planned.restarting || planned.asarSwap)),
    };
  }
  // issue #19: 현재 surface 가 아카이브를 보지 못하는 경우(대표적으로 Web GUI 패널에서 적용을 누름),
  // 실제로는 데스크톱 설치가 아직 app.asar 를 밀봉하고 있다. 예전에는 여기서 일반 재시작으로 가 아카이브를 영원히 옮기지 못했다.
  const foreign = core.sealedDesktopHandoffAnySurface();
  const desktopPid = foreign?.asar ? desktop.runningDesktopPid(foreign.exe) : 0;
  const decision = core.planApplyRestartAction({ foreign, desktopPid });
  if (decision.action === "swap-foreign") {
    try {
      desktop.scheduleAsarSwapRestart({
        exe: foreign.exe,
        asar: foreign.asar,
        waitPid: decision.waitPid,
        exit: true,
        ctx,
      });
      return {
        restarting: true,
        asarSwap: true,
        crossSurface: true,
        note: "데스크톱 호스트에 패키지 교체를 요청했습니다: 호스트가 종료되고 app.asar 이름을 바꾼 뒤 다시 열립니다.",
      };
    } catch (error) {
      return { restarting: false, crossSurface: true, error: String(error && error.message ? error.message : error) };
    }
  }
  if (decision.action === "manual") {
    return {
      restarting: false,
      asarSwap: false,
      needsDesktopApply: true,
      note: "패치를 디스크에 기록했지만 데스크톱 호스트가 실행 중이 아니라 종료 후 패키지 교체를 할 수 없습니다; 데스크톱 버전을 열고 데스크톱 창에서 적용을 한 번 더 누르세요.",
    };
  }
  try {
    const planned = hostctl.scheduleRestart(null, ctx);
    if (planned && (planned.restarting === false || planned.clean === false)) return planned;
    return planned || { restarting: true };
  } catch (error) {
    return { restarting: false, error: String(error && error.message ? error.message : error) };
  }
}

async function handlePurgeCommand(rawInput, config, ctx = null) {
  const args = (rawInput || "").trim().split(/\s+/).filter(Boolean);
  const sub = (args[0] || "status").toLowerCase();

  switch (sub) {
    case "status":
    case "s": {
      const state = await core.gatherState();
      return { kind: "success", text: renderStatus(state) };
    }
    case "apply":
    case "a": {
      core.applyRuntimeEnv();
      core.clearDesktopLocateCache();
      const home = core.pinDshHome();
      const scrubbed = core.sanitizeDesktopCommandRuntimes();
      const state = await core.gatherState();
      if (home) state.dsh_home = home;
      let located;
      try {
        located = await core.resolveOfficialAiBase(state.ai_base, { forApply: true });
      } catch (e) {
        return { kind: "error", text: String(e && e.message ? e.message : e) };
      }
      if (!located.aiBase) return { kind: "error", text: core.missingAiBaseMessage() };
      state.ai_base = located.aiBase;
      if (located.extracted && located.handoff?.archive) {
        core.writeUnpackedAsarStamp(located.handoff.archive);
      }
      const blocked = rejectIfNeedPrompt(state.dsh_home);
      if (blocked) return { kind: "error", text: blocked.error };
      const applyMulti = await core.applyPatchesAllHosts(core.ALL_PATCHES, {
        preserveClientBundles: false,
        forApply: true,
      });
      const report = applyMulti.report;
      const shimResult = await core.patchAllShims();
      const flash = core.silenceCmdFlash(applyMulti.hosts[0]?.aiBase || state.ai_base);
      const lines = [];
      for (const h of applyMulti.hosts) lines.push(`   호스트 / host → ${h.aiBase}`);
      lines.push(...report.map((r) => {
        const m = r.status === "applied" ? "✓ 정리됨" : r.status === "already" ? "- 이미 최신" : r.status === "missing_file" ? "⚠ 파일 없음" : `✗ ${r.status}`;
        return `  ${m} patch #${String(r.patch_id).padEnd(2)} ${r.name}`;
      }));
      lines.push("", "shim:");
      for (const [dir, st] of Object.entries(shimResult)) {
        lines.push(`  · ${dir} → ${typeof st === "object" ? JSON.stringify(st) : st}`);
      }
      lines.push(`  cmd-flash=${flash.entry} phase-1=${flash.phase1} ok=${flash.ok}`);
      if (scrubbed.length) {
        lines.push("", "Desktop in-bin .bak scrub:");
        for (const row of scrubbed) lines.push(`  ✓ ${row.dir} → ${row.cleaned.join(", ")}`);
      }
      lines.push("Desktop: host-commands 밀봉 디렉터리는 정리만 하고 주입하지 않습니다; bak 은 bin 에 쓰지 않습니다(issue #9).");
      const summary = core.summarizeApplyReport(report);
      const hostWritten = core.allPatchHostsWritten(applyMulti.hosts) || core.hostCleanMarkersPresent(state.ai_base);
      const hookDenyRestoreFailed = (applyMulti.hookDenyRestoreFailed || []).length > 0;
      const complete = summary.failed.length === 0 && flash.ok === true && hostWritten && !hookDenyRestoreFailed;
      const promptReady = summary.failed.length > 0 && summary.failed.every((item) => item.status === "pattern_not_found");
      const shouldRestart = applyShouldRestart({
        complete: complete || (promptReady && hostWritten),
        sealed: core.desktopAsarStillSealed(),
        appliedCount: summary.applied,
        promptReady: promptReady && hostWritten,
      });
      if (shouldRestart) reapply.markSettleRestart();
      try { core.seedPromptInjectAtBoot(state.dsh_home); } catch { /* 주 디렉터리가 아직 준비되지 않음 */ }
      try { refreshHungOperator(state.dsh_home); } catch { /* ignore */ }
      const planned = scheduleApplyRestart(shouldRestart, ctx);
      if (planned && planned.clean === false) {
        lines.push("", "정리가 현재 호스트에 기록되지 않아 재시작을 취소했습니다.");
      } else if (planned && planned.restarting === false && planned.error) {
        lines.push("", String(planned.error));
      } else if (shouldRestart && planned && planned.restarting !== false) {
        lines.push("", "재시작 중입니다.");
      } else if (!complete) {
        lines.push("", "정리가 끝나지 않아 재시작하지 않았습니다.");
      } else {
        lines.push("", "패치가 이미 호스트에 있어 더 재시작하지 않습니다.");
      }
      return { kind: "success", text: lines.join("\n") };
    }
    case "revert":
    case "r": {
      const state = await core.gatherState();
      const lines = [];
      if (state.ai_base) {
        const { reverted, errors } = await core.revertAll(state.ai_base);
        lines.push(...reverted.map((p) => `  ✓ 되돌림 / Reverted ${p}`));
        for (const [p, e] of errors) lines.push(`  ⚠ 되돌리기 실패 ${p}: ${e}`);
        if (reverted.length === 0) lines.push("  - 되돌릴 패치 백업 없음 / no patch backup");
      }
      const shimRevert = await core.revertAllShims();
      for (const [dir, st] of Object.entries(shimRevert)) {
        lines.push(`  shim ${dir}: ${typeof st === "object" ? JSON.stringify(st) : st}`);
      }
      lines.push("", "롤백 완료 / Revert done. dsh 재시작 후 복구됩니다 / restart to restore.");
      lines.push("참고: prompt-inject.md 유지(사용자 파일) / prompt-inject.md kept (user file)");
      return { kind: "success", text: lines.join("\n") };
    }
    case "uninstall":
    case "remove": {
      const result = await uninstaller.uninstallPurge();
      const lines = [];
      if (result.applied) lines.push("패치가 감지되어 원본으로 되돌렸습니다.");
      else lines.push("적용된 패치가 감지되지 않았습니다. 그래도 플러그인 파일은 제거합니다.");
      if (result.patches) {
        lines.push(`   되돌린 파일 ${result.patches.reverted?.length || 0}개`);
      }
      if (result.override?.removed) lines.push(`   삭제됨 ${result.override.path}`);
      if (result.stripped?.length) lines.push(`   profile 에서 제거: ${result.stripped.join(", ")}`);
      if (result.errors?.length) {
        for (const e of result.errors) lines.push(`  ⚠ ${e}`);
      }
      lines.push("", "dsh 를 재시작하세요. 재시작 후 플러그인은 더 이상 로드되지 않습니다.");
      return { kind: result.ok ? "success" : "error", text: lines.join("\n") };
    }
    case "edit":
    case "e": {
      const state = await core.gatherState();
      let r = core.editOverride(state.dsh_home);
      let created = false;
      if (!r.ok && r.needCreate) {
        await core.installOverride(state.dsh_home, true);
        r = core.editOverride(state.dsh_home);
        created = true;
      }
      // 예전 구현: r.ok 가 false 여도 kind:"success" 를 반환해 사용자는 "열림" 을 보지만 프로세스는 전혀 뜨지 않았다.
      if (!r.ok) {
        return { kind: "error", text: r.error || "편집기 열기 실패" };
      }
      return {
        kind: "success",
        text: created
          ? `기본 주입 파일을 만들고 편집기를 열었습니다: ${r.path}\ndsh 재시작 후 적용됩니다.`
          : `${r.editor} 로 주입 파일을 열었습니다: ${r.path}\n편집을 마친 뒤 dsh 를 재시작하면 적용됩니다.`,
      };
    }
    case "help":
    case "h":
    default:
      return {
        kind: "success",
        text: "dsh-purge 명령:\n" +
          "  /purge status     상태 표시\n" +
          "  /purge apply      전체 정리 적용(프롬프트+코드+shim+override)\n" +
          "  /purge revert     롤백 및 복원\n" +
          "  /purge uninstall  플러그인 제거(적용된 경우 먼저 복원)\n" +
          "  /purge edit       주입 파일 prompt-inject.md 편집\n" +
          "  /purge help       도움말 표시\n" +
          "규칙 세트 전환은 /rules 참고(list | use <id> | create | delete | reset)\n" +
          "공식 Skill 설치는 /skills 참고(list | import <경로> | create <id> [설명] | delete <id>)",
      };
  }
}

function renderRulesStatus(st) {
  const out = [];
  out.push("규칙 세트 / Rule Sets");
  out.push(`   저장 디렉터리 / store  ${st.rules_dir}`);
  const targetLine = st.active
    ? `${st.agents_path} (${st.active_target})`
    : "(활성 없음)";
  out.push(`   대상 파일 / target ${targetLine} — exists=${st.agents_exists}, synced=${st.agents_synced}`);
  out.push("");
  if (st.rules.length === 0) {
    out.push("  (규칙 없음 / no rules — /rules create <id> 또는 설정 페이지에서 생성)");
  }
  for (const r of st.rules) {
    const isActive = r.id === st.active;
    const label = r.name !== r.id ? `${r.name} (${r.id})` : r.id;
    out.push(`  ${isActive ? "▶" : "·"} ${label}${isActive ? " ★ 현재" : ""} [${r.target}] (${rules.formatSize(r.size)})`);
  }
  return out.join("\n");
}

async function handleRulesCommand(rawInput) {
  const args = (rawInput || "").trim().split(/\s+/).filter(Boolean);
  const sub = (args[0] || "list").toLowerCase();
  const dshHome = core.findDshHome();

  switch (sub) {
    case "list":
    case "ls":
    case "s":
      return { kind: "success", text: renderRulesStatus(await rules.rulesStatus(dshHome)) };
    case "use":
    case "activate":
    case "u": {
      const id = args[1];
      if (!id) return { kind: "error", text: "사용법: /rules use <id>" };
      try {
        const meta = await rules.activateRule(dshHome, id);
        refreshHungOperator(dshHome);
        return {
          kind: "success",
          text: `✓ 규칙 활성화 ${meta.name}(${id}) → ${rules.targetPath(dshHome, meta.target)} 에 기록하고 systemPrompt 에 주입했습니다. 새 세션에서 적용됩니다.`,
        };
      } catch (e) {
        return { kind: "error", text: `활성화 실패: ${e.message}` };
      }
    }
    case "create":
    case "new":
    case "c": {
      const id = args[1];
      if (!id) return { kind: "error", text: "사용법: /rules create <id> [별칭] [AGENTS.md|CLAUDE.md]" };
      const name = args[2] || id;
      const target = args[3] || "AGENTS.md";
      if (!rules.validTarget(target)) {
        return { kind: "error", text: `잘못된 대상: ${target}(AGENTS.md 또는 CLAUDE.md 만 가능)` };
      }
      try {
        await rules.saveRule(dshHome, id, "", { name, target });
        return {
          kind: "success",
          text: `✓ 규칙 생성 ${name}(${id} → ${target}). 설정 페이지 "규칙 설정" 에서 내용을 편집하고 저장하세요.`,
        };
      } catch (e) {
        return { kind: "error", text: `생성 실패: ${e.message}` };
      }
    }
    case "delete":
    case "rm":
    case "d": {
      const id = args[1];
      if (!id) return { kind: "error", text: "사용법: /rules delete <id>" };
      try {
        await rules.deleteRule(dshHome, id);
        refreshHungOperator(dshHome);
        return { kind: "success", text: `✓ 규칙 삭제 ${id}.` };
      } catch (e) {
        return { kind: "error", text: `삭제 실패: ${e.message}` };
      }
    }
    case "reset":
    case "restore":
    case "\u8fd8\u539f": {
      try {
        const r = await rules.resetToOriginal(dshHome);
        refreshHungOperator(dshHome);
        const lines = [];
        if (r.removed.length > 0) lines.push(`✓ 플러그인이 기록한 대상 파일 삭제: ${r.removed.join(", ")}`);
        if (r.skipped.length > 0) {
          lines.push(`⚠ 건너뜀(파일 내용이 규칙과 달라 수동 수정 가능): ${r.skipped.join(", ")}`);
        }
        lines.push("활성 상태를 비웠습니다. 규칙 라이브러리 내용은 유지되어 언제든 다시 활성화할 수 있습니다. 이제 출하 상태로 돌아갔습니다: 전역 지시 없음.");
        return { kind: "success", text: lines.join("\n") };
      } catch (e) {
        return { kind: "error", text: `되돌리기 실패: ${e.message}` };
      }
    }
    case "help":
    case "h":
    default:
      return {
        kind: "success",
        text: "규칙 세트 명령:\n" +
          "  /rules list                         모든 규칙 나열\n" +
          "  /rules use <id>                     규칙 활성화(AGENTS.md/CLAUDE.md 에 기록, systemPrompt 주입)\n" +
          "  /rules create <id> [별칭] [대상]     규칙 생성\n" +
          "  /rules delete <id>                  규칙 삭제\n" +
          "  /rules reset                        원래 상태로 되돌리기\n" +
          "  /rules help                         도움말 표시",
      };
  }
}

function renderSkillsStatus(st) {
  const out = [];
  out.push("공식 사용자 Skill / $DSH_HOME/skills");
  out.push(`  ${st.skills_dir}`);
  out.push("  플러그인은 디렉터리에 설치만 합니다. 호출은 공식 경로입니다: 작업이 description/whenToUse 와 맞으면 모델이 skill 도구를 부르고, 채팅에 /이름 을 입력하면 즉시 로드됩니다.");
  out.push("  본문에 \"활성\" 이라고 써도 트리거되지 않습니다. 공식이 인정하는 것은 name, description, whenToUse, disable-model-invocation, user-invocable.");
  out.push("");
  if (!st.skills.length) {
    out.push("  (사용자 Skill 없음 — /skills import <압축 파일 또는 폴더> 또는 설정 페이지에서 가져오기)");
    return out.join("\n");
  }
  for (const item of st.skills) {
    const mark = item.valid ? "·" : "!";
    const desc = item.description || "(설명 없음)";
    const how = item.valid
      ? [
        item.userInvocable ? `/${item.id}` : "호출 불가 /이름",
        item.modelInvocable ? "모델 호출 가능" : "모델 호출 불가",
      ].join(" · ")
      : "";
    out.push(`  ${mark} ${item.id}  ${desc}  (${skills.formatSize(item.size)})`);
    if (how) out.push(`      ${how}`);
    if (!item.valid && item.error) out.push(`      ${item.error}`);
  }
  return out.join("\n");
}

async function handleSkillsCommand(rawInput) {
  const args = (rawInput || "").trim().split(/\s+/).filter(Boolean);
  const sub = (args[0] || "list").toLowerCase();
  const dshHome = core.findDshHome();

  switch (sub) {
    case "list":
    case "ls":
    case "s":
      return { kind: "success", text: renderSkillsStatus(await skills.skillsStatus(dshHome)) };
    case "create":
    case "new":
    case "c": {
      const id = args[1];
      if (!id) return { kind: "error", text: "사용법: /skills create <id> [설명]" };
      if (!skills.validSkillName(id)) {
        return { kind: "error", text: "id 는 kebab-case 여야 합니다. 예: code-review" };
      }
      const description = args.slice(2).join(" ").trim() || id;
      try {
        const saved = skills.toPublicSkill(dshHome, await skills.saveSkill(dshHome, id, "", description));
        return {
          kind: "success",
          text: `✓ 공식 디렉터리에 기록했습니다: ${saved.path}\n새 세션에서 공식 Skill 디렉터리에 나타나며, 작업이 맞거나 /${id} 를 입력하면 공식이 로드합니다.`,
        };
      } catch (e) {
        return { kind: "error", text: `설치 실패: ${e.message}` };
      }
    }
    case "import":
    case "i": {
      const src = args.slice(1).join(" ").trim();
      if (!src) return { kind: "error", text: "사용법: /skills import <압축 파일 또는 폴더>" };
      try {
        const packed = await skills.importFromPath(dshHome, src);
        const names = packed.imported.map((item) => item.id).join(", ");
        return { kind: "success", text: `✓ 공식 $DSH_HOME/skills 에 가져왔습니다: ${names}` };
      } catch (e) {
        return { kind: "error", text: `가져오기 실패: ${e.message}` };
      }
    }
    case "delete":
    case "rm":
    case "d": {
      const id = args[1];
      if (!id) return { kind: "error", text: "사용법: /skills delete <id>" };
      try {
        const removed = skills.toPublicSkill(dshHome, await skills.deleteSkill(dshHome, id));
        return {
          kind: "success",
          text: `✓ 공식 디렉터리에서 삭제 ${id}${removed.backup ? `\n백업: ${removed.backup}` : ""}`,
        };
      } catch (e) {
        return { kind: "error", text: `삭제 실패: ${e.message}` };
      }
    }
    case "help":
    case "h":
    default:
      return {
        kind: "success",
        text: "공식 Skill 설치:\n" +
          "  /skills list                 $DSH_HOME/skills 나열\n" +
          "  /skills create <id> [설명]   <id>/SKILL.md 기록\n" +
          "  /skills import <경로>        압축 파일 또는 폴더를 공식 디렉터리로 가져오기\n" +
          "  /skills delete <id>          해당 디렉터리 삭제(공식이 디렉터리에서 제거)\n" +
          "  직접 $DSH_HOME/skills/<id> 를 지워도 됩니다\n" +
          "  호출: 채팅에 /<id> 입력, 또는 모델이 description 에 따라 skill 도구를 호출\n" +
          "  systemPrompt 에 주입하지 않으며 프롬프트를 대체하지 않습니다",
      };
  }
}

export function apply(ctx, config) {
  const cfg = { ...DEFAULTS, ...(config || {}) };
  // 거절 감지 + 1회 재시도: 기본 비활성, tuning.refusalRetry === true 일 때만 동작을 넘겨받는다.
  ctx.on("llm/stream", (options, next) => {
    let on = false;
    try {
      on = readTuning().refusalRetry === true;
    } catch {
      on = false;
    }
    if (!cfg.enabled || !on || !injectAllowedNow(cfg, requestInjectionContext(ctx, options))) return next();
    return streamWithRefusalRetry((opts) => next(opts), options);
  });
  const updateHome = core.findDshHome();
  const updateRequest = fn => withUpdateEnvironment(updateEnv(updateHome,cfg),fn);
  const updates = createUpdateController({
    home: updateHome, legacy: cfg, runningVersion: updater.runningVersion(),
    readInstalledVersion: () => updater.installedVersion(updateHome),
    check: () => updateRequest(() => updater.checkUpdate()),
    install: (result) => {
      const lane = updater.channelPublic();
      if (lane.pin || lane.channel !== "stable") return { ok: true, applied: false, skipped: "pinned-or-upstream" };
      return updateRequest(() => updater.applyUpdate(undefined, {
        ref: result.lanes?.stable?.latestRef || result.remoteVersion,
        source: "fork", channel: "stable", pin: false, reason: "auto",
      }));
    },
    onResult: (result) => log(cfg, "update status:", JSON.stringify(result)),
  });
  // 유지보수 객체는 반드시 지연 생성해야 한다: profile 디렉터리, DSH_HOME 이 어느 단계에서든 사용 불가라도
  // 유지보수 인터페이스만 오류를 내고, 플러그인 전체가 activate 단계에서 죽으면 안 된다.
  const maintenance = () => new Maintenance({ home: core.findDshHome(), aiBase: currentHost() });
  ctx.inject(["webServer"], host => host.effect(() => host.webServer.register({
    kind:"exact",path:"/dsh-purge/community",
    handler:async(request,response)=>{
      if(!allowPluginRequest(request,response))return;
      try {
        let result;
        if(request.method==="GET") {
          const manager=maintenance();
          result={ok:true,name:"dsh-purge Community",version:updater.runningVersion(),repository:REPOSITORY,compatibility:compatibility(diagnosticHost()),profile:manager.profile,backups:manager.list(),backup_usage:manager.usage(),update_preferences:publicPreferences(preferences(updateHome,cfg)),update_status:updates.status()};
        }
        else if(request.method==="POST") {
          const body=await readJsonBody(request);
          if(body.op==="preferences") {
            const value=savePreferences(updateHome,body.value,cfg);
            updates.refresh();
            result={ok:true,update_preferences:publicPreferences(value)};
          }
          else if(body.op==="backup")result={ok:true,...await maintenance().backup("manual")};
          else if(body.op==="rollback")result=await maintenance().rollback(body.id);
          else if(body.op==="prune")result=await maintenance().pruneLocked({keepLast:body.keepLast,keepDays:body.keepDays,maxTotalBytes:body.maxTotalBytes});
          else if(body.op==="check")result=await updateRequest(() => updater.checkUpdate());
          else if(body.op==="update")result=await updateRequest(() => updater.handleUpdateOp({ref:body.ref}));
          else throw Error("유지보수 작업이 유효하지 않습니다");
        } else {response.writeHead(405);response.end();return;}
        sendJson(response,200,result);
      }catch(e){sendJson(response,400,{ok:false,error:e.message});}
    }
  },"purge-community maintenance")));
  try {
    const compat = compatibility(core.findAiBase());
    if (!compat.qualified) {
      console.warn(`[dsh-purge-community] ${compat.message}`);
    }
    purgeLog("compat", compat);
  } catch (e) {
    console.warn("[dsh-purge-community] compatibility probe failed:", String(e && e.message ? e.message : e));
  }
  if (!cfg.enabled) {
    purgeLog("boot", { enabled: false });
    return;
  }
  purgeLog("boot", {
    enabled: true,
    surface: hostctl.currentSurface(),
    stripMnemon: cfg.stripMnemon !== false,
    cap: cfg.capabilityProtocol !== false,
  });
  core.setHooksDenyConfigValue(cfg.hooksDenyBypass);
  core.refreshHooksDenySettings();
  try {
    const home = core.pinDshHome() || core.findDshHome();
    purgeLog("home", { home: home || "(none)" });
    try {
      if (home) {
        const flag = path.join(home, ".hung-disabled");
        if (fs.existsSync(flag)) {
          fs.unlinkSync(flag);
          purgeLog("hung-disabled", { removed: flag });
        }
      }
    } catch (e) { purgeLog("hung-disabled", { err: String(e?.message || e) }); }
    let bootActive = true;
    const bootHung = installHungPromptGlobal(cfg, () => bootActive);
    ctx.effect(() => () => {
      bootActive = false;
      if (globalThis.__dshPurgeHungPrompt === bootHung) delete globalThis.__dshPurgeHungPrompt;
    });
    // Apply→cleanup→restart 성공 후 기본적으로 암호화 프롬프트를 prompt-inject.md 에 seed 한다.
    // 사용자가 이미 수정한 파일은 건드리지 않고, "없음" 또는 "여전히 빈 파일" 일 때만 다시 쓴다.
    try {
      const seed = core.seedPromptInjectAtBoot(home);
      log(cfg, "seed prompt-inject:", seed?.action || "noop", seed?.reason || "");
    } catch (e) {
      console.warn("[dsh-purge] seed prompt-inject failed:", String(e && e.message ? e.message : e));
    }
    refreshHungOperator(home);
  } catch { /* 주 디렉터리가 아직 없으면 조립 시 내장 기본값을 다시 건다 */ }
  // 시작 시에는 호스트 패키지를 쓰지 않는다. 패치 / bak / client.js / runtime 은 적용을 누를 때 한 번만 쓴다.
  const life = watchContextLife(ctx);
  if (!life.alive) {
    console.warn("[dsh-purge] skip apply: inactive context");
    return;
  }
  const diagnostics = { commands: [] };
  installWebServer(ctx, cfg, diagnostics);
  log(cfg, "plugin enabled");
  ctx.effect(() => {
    updates.start();
    return () => updates.stop();
  });
  core.applyRuntimeEnv();
  try {
    const home = core.pinDshHome() || core.findDshHome();
    refreshHungOperator(home);
  } catch { /* 주 디렉터리가 아직 없으면 조립 시 내장 기본값을 다시 건다 */ }

  const settleTimer = setTimeout(() => {
    if (!life.alive) {
      log(cfg, "settle skipped: inactive context");
      return;
    }
    settleInstalledPatches(cfg, ctx, life)
      .then((r) => log(cfg, "settle:", r))
      .catch((e) => {
        if (isInactiveContextError(e)) {
          log(cfg, "settle skipped: inactive context");
          return;
        }
        console.warn("[dsh-purge] settle error:", String(e));
      });
    rules.ensureInitialState(core.findDshHome())
      .then((r) => log(cfg, "rules init:", JSON.stringify(r)))
      .catch((e) => console.warn("[dsh-purge] rules init error:", String(e)));
  }, settleDelayMs(hostctl.currentSurface()));
  try {
    ctx.effect(() => () => clearTimeout(settleTimer));
  } catch (e) {
    if (isInactiveContextError(e)) {
      clearTimeout(settleTimer);
      console.warn("[dsh-purge] skip apply: inactive context");
      return;
    }
    throw e;
  }

  try {
    applyHostHooks(ctx, cfg, diagnostics);
  } catch (e) {
    if (isInactiveContextError(e)) {
      console.warn("[dsh-purge] skip apply: inactive context");
      return;
    }
    throw e;
  }
}

function applyHostHooks(ctx, cfg, diagnostics) {
  try {
    const home = core.pinDshHome() || core.findDshHome();
    refreshHungOperator(home);
  } catch { /* 주 디렉터리가 아직 준비되지 않음 */ }
  installIdentityOverride(ctx, cfg);
  installFreshFullAccess(ctx);
  installRewindDeriveFilter(ctx);
  installCwdCapture(ctx);
  installMnemonMessageStrip(ctx, cfg);
  registerPromptSections(ctx, cfg);

  // 이번 apply 스코프 안의 continue-retry 상태; 이전 ctx dispose 가 이 클로저들을 함께 정리한다.
  const continuePluginCfg = cfg;
  const savedContinueSettings = continueRetry.loadSettings(core.findDshHome());
  const continueRuntime = continueRetry.installContinueRetry(ctx, {
    getConfig: () => continueRetry.mergeConfig(continuePluginCfg, savedContinueSettings),
  });
  try {
    ctx.effect(() => () => {
      try { continueRuntime?.dispose?.(); } catch { /* ignore */ }
    });
  } catch { /* effect 가 없으면 cordis scope 가 스스로 회수한다 */ }

  installCommands(ctx, cfg, diagnostics);

  if (ctx.tools) {
    ctx.tools.register({
      name: "purge_status",
      description: `dsh 지시 권위 정리 상태 조회(${core.ALL_PATCHES.length} patch 정리 진행률, shim 주입, override 파일).`,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { text: { type: "string" } },
        },
        render: (_args, value) => [{ type: "text", text: String(value?.text ?? "") }],
      },
      async execute() {
        const state = await core.gatherState();
        return { text: renderStatus(state) };
      },
    });
    ctx.tools.register({
      name: "purge_apply",
      description: `dsh 지시 권위 정리 적용: ${core.ALL_PATCHES.length} patch(프롬프트 계층+코드 기본값+엔진 레벨 승인/샌드박스 우회) + shim 주입 + override 파일. 완전 적용에는 dsh 재시작이 필요합니다.`,
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { text: { type: "string" } },
        },
        render: (_args, value) => [{ type: "text", text: String(value?.text ?? "") }],
      },
      async execute() {
        core.applyRuntimeEnv();
        const scrubbed = core.sanitizeDesktopCommandRuntimes();
        const state = await core.gatherState();
        if (!state.ai_base) return { text: "ERROR: " + core.missingAiBaseMessage() };
        const blocked = rejectIfNeedPrompt(state.dsh_home);
        if (blocked) return { text: "ERROR: " + blocked.error };
        const toolMulti = await core.applyPatchesAllHosts(core.ALL_PATCHES, {
          preserveClientBundles: false,
          forApply: true,
        });
        await core.patchAllShims();
        const flash = core.silenceCmdFlash(toolMulti.hosts[0]?.aiBase || state.ai_base);
        const report = toolMulti.report;
        const applied = report.filter((r) => r.status === "applied").length;
        const already = report.filter((r) => r.status === "already").length;
        const scrubNote = scrubbed.length ? ` desktop_scrub=${scrubbed.length}` : "";
        return { text: `정리 완료 / applied=${applied}, already=${already}.${scrubNote} phase-1=${flash.phase1} dsh 재시작 후 적용됩니다.` };
      },
    });
    ctx.tools.register({
      name: "purge_revert",
      description: "dsh 지시 권위 정리를 백업 원본으로 롤백합니다(prompt-inject.md 사용자 파일은 보존).",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {},
      },
      output: {
        schema: {
          type: "object",
          additionalProperties: false,
          properties: { text: { type: "string" } },
        },
        render: (_args, value) => [{ type: "text", text: String(value?.text ?? "") }],
      },
      async execute() {
        const state = await core.gatherState();
        const lines = [];
        if (state.ai_base) {
          const { reverted, errors } = await core.revertAll(state.ai_base);
          lines.push(`reverted=${reverted.length}${errors.length ? ` errors=${errors.length}` : ""}`);
        }
        const shimRevert = await core.revertAllShims();
        lines.push(`shim_dirs=${Object.keys(shimRevert).length}`);
        return { text: `롤백 완료 / ${lines.join(", ")}. dsh 재시작 후 복원됩니다.` };
      },
    });
  }

}

export function installCommands(ctx, cfg, diagnostics = { commands: [] }) {
  ctx.inject(["commands"], (host) => {
    const commands = host.get("commands");
    diagnostics.commands = [];
    host.effect(() => () => { diagnostics.commands = []; });
    const register = (definition, fallback) => diagnostics.commands.push(registerCommand(commands, definition, fallback));
    register({
      name: "purge",
      description: "dsh 지시 권위 정리(status/apply/revert/uninstall/edit/help)",
      input: { hint: "status | apply | revert | uninstall | edit | help" },
      handler: async (invocation) => handlePurgeCommand(invocation.rawInput ?? "", cfg, ctx),
    }, "purge-community");
    register({
      name: "rules",
      description: "규칙 세트 전환(AGENTS.md/CLAUDE.md 기록): list | use <id> | create <id> [별칭] [대상] | delete <id> | reset | help",
      input: { hint: "list | use <id> | create <id> [별칭] [대상] | delete <id> | reset | help" },
      handler: async (invocation) => handleRulesCommand(invocation.rawInput ?? ""),
    }, "purge-rules");
    register({
      name: "skills",
      description: "공식 사용자 Skill($DSH_HOME/skills): list | import <경로> | create <id> [설명] | delete <id> | help",
      input: { hint: "list | import <경로> | create <id> [설명] | delete <id> | help" },
      handler: async (invocation) => handleSkillsCommand(invocation.rawInput ?? ""),
    }, "purge-skills");
    register({
      name: "rewind",
      description: "되돌리기: 서브에이전트는 한 번 바로 되돌리고, 메인 에이전트는 /rewind once 또는 /rewind round",
      input: { hint: "once | round" },
      handler: async (invocation) => {
        const sessionId = rewind.invocationSessionId(invocation);
        const arg = String(invocation.rawInput || "").trim().split(/\s+/)[0]?.toLowerCase() || "";
        const info = await rewind.analyzeRewind(ctx, sessionId);
        const commandName = diagnostics.commands.find(row => row.name === "rewind")?.registered || "rewind";
        if (info.ok && info.kind === "main" && arg !== "once" && arg !== "round") {
          return {
            kind: "success",
            text: `메인 에이전트에서 선택하세요: /${commandName} once 는 한 번 되돌리고, /${commandName} round 는 직전 라운드(이번 라운드 서브에이전트 포함)를 되돌립니다.`,
          };
        }
        const mode = arg === "round" ? "round" : "once";
        const result = await rewind.applyRewind(ctx, sessionId, mode);
        if (!result.ok) return { kind: "error", text: result.error };
        return {
          kind: "success",
          text: mode === "round"
            ? "직전 라운드를 되돌렸습니다. 여전히 이 대화 안이며, 직전 발화는 입력 상자로 돌아갔습니다. 다시 전송해도 이전 응답은 함께 전달되지 않습니다."
            : "한 번 되돌렸습니다. 여전히 이 대화 안이며, 직전 발화는 입력 상자로 돌아갔습니다. 다시 전송해도 이전 응답은 함께 전달되지 않습니다.",
        };
      },
    }, "purge-rewind");
  });
}

function headerOf(request, name) {
  const headers = request?.headers;
  if (!headers) return "";
  const value = headers[name] ?? headers[String(name).toLowerCase()];
  if (Array.isArray(value)) return String(value[0] || "");
  return String(value || "");
}

function denyCrossOrigin(response) {
  response.writeHead(403, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify({ ok: false, error: "cross-origin blocked" }));
}

function allowPluginRequest(request, response) {
  const site = headerOf(request, "sec-fetch-site").toLowerCase();
  if (site === "cross-site") {
    denyCrossOrigin(response);
    return false;
  }
  const origin = headerOf(request, "origin").trim();
  if (origin === "null") {
    denyCrossOrigin(response);
    return false;
  }
  if (!origin) return true;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    denyCrossOrigin(response);
    return false;
  }
  const host = headerOf(request, "host").trim();
  if (!host || originHost.toLowerCase() !== host.toLowerCase()) {
    denyCrossOrigin(response);
    return false;
  }
  return true;
}

export function installWebServer(ctx, cfg, diagnostics = { commands: [] }) {
  const updateRequest = fn => withUpdateEnvironment(updateEnv(core.findDshHome(),cfg),fn);
  // 데스크톱은 @deepseek-ai/dsh-web-app 을 내장하고 설정 페이지도 webServer(흔히 43120)를 타므로, 공식 dsh web 전용이 아니다.
  ctx.inject(["webServer"], (host) => {
    host.effect(() => {
      // 모든 하위 라우트의 unregister disposer 를 모은다; host.effect 의 cleanup 이 한 번에 전부 철회한다.
      // 예전 버전은 등록만 하고 수거하지 않아 plugin reload 시 이전 라운드 handler 가 남아 새 것이 그 위에 겹쳤다.
      const routeDisposers = [];
      const trackRoute = (d) => {
        if (typeof d === "function") routeDisposers.push(d);
        return d;
      };
      const registerPluginRoute = (spec, label) => trackRoute(host.webServer.register({
        ...spec,
        handler: async (request, response) => {
          if (!allowPluginRequest(request, response)) return;
          return spec.handler(request, response);
        },
      }, label));
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/status",
        handler: async (request, response) => {
          if (request.method !== "GET") {
            response.writeHead(405, { allow: "GET" });
            response.end();
            return;
          }
          try {
            const target = diagnosticHost();
            const state = await core.gatherState({aiBase:target,surface:hostSurface(target)});
            const patch_names = {};
            for (const p of core.ALL_PATCHES) patch_names[String(p.id)] = p.name;
            sendJson(response, 200, {
              ok: true,
              ready: true,
              surface: state.surface || hostctl.currentSurface(),
              ai_base: state.ai_base,
              desktop_install: state.desktop_install || "",
              desktop_exe: state.desktop_exe || "",
              host_layout: state.host_layout,
              asar_still_sealed: state.asar_still_sealed || false,
              asar_handoff: state.asar_handoff || null,
              missing_ai_base: state.ai_base ? "" : core.missingAiBaseMessage(),
              patches_applied: state.ai_base ? state.patches_applied : 0,
              patches_pending: state.display_pending ?? state.patches_pending,
              patches_skipped: state.display_skipped ?? state.patches_skipped ?? 0,
              patches_ready: state.display_ready ?? state.patches_ready ?? 0,
              patches_na: state.patches_na || 0,
              patches_total: state.ai_base ? (state.patches_total ?? 0) : 0,
              patches_total_all: core.ALL_PATCHES.length,
              patches_na: state.patches_na ?? 0,
              patches_lost: reapply.patchesLostAfterHostReset(),
              patch_status: state.patch_status,
              patch_files: state.patch_files || {},
              patches: (state.display_patches || []).map((p) => ({
                id: p.id,
                ids: p.ids,
                layer: p.layer || "",
                status: p.status,
              })),
              patch_names,
              shim_cmd: state.shim_cmd,
              shim_ps1: state.shim_ps1,
              shim_bin: state.shim_bin,
              has_backup: state.has_backup,
              override_status: state.override_status,
              override_path: state.override_path,
              dsh_home: state.dsh_home,
              plugin_version: updater.runningVersion(),
              community: true,
              commands: diagnostics.commands,
              compatibility: compatibility(state.ai_base),
              boot_full_quit: bootFullQuit,
              update: updater.lastUpdateResult(),
              ...updater.channelPublic(),
              hooks_deny_bypass: core.getHooksDenySettings().hooksDenyBypass,
              ...(await skills.skillsStatus(core.findDshHome()).catch(() => ({ skills: [] }))),
            });
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: status");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/diagnose",
        handler: async (request, response) => {
          if (request.method !== "GET") {
            response.writeHead(405, { allow: "GET" });
            response.end();
            return;
          }
          try {
            const target = diagnosticHost();
            const state = await core.gatherState({aiBase:target,surface:hostSurface(target)});
            const compat = compatibility(state.ai_base);
            if (!state.ai_base) {
              sendJson(response, 200, {
                ok: true,
                ai_base: "",
                compatibility: compat,
                checked: 0,
                drifted: [],
                optionalDrift: [],
                chained: [],
                missing: [],
              });
              return;
            }
            const drift = await core.patchDrift(state.ai_base, core.ALL_PATCHES, {surface:state.surface,dshHome:state.dsh_home});
            sendJson(response, 200, { ok: true, ai_base: state.ai_base, compatibility: compat, ...drift });
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: diagnose");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/selfcheck",
        handler: async (request, response) => {
          if (request.method !== "GET") {
            response.writeHead(405, { allow: "GET" });
            response.end();
            return;
          }
          try {
            sendJson(response, 200, { ok: true, ...(await selfcheck.selfCheck(currentHost(), core.findDshHome(), { ctx: host })) });
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: selfcheck");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/boost",
        handler: async (request, response) => {
          if (request.method === "GET") {
            sendJson(response, 200, { ok: true, enabled: readBoost(), rewind: readTuning().rewind !== false });
            return;
          }
          if (request.method === "POST") {
            try {
              const body = await readJsonBody(request);
              if (body && Object.prototype.hasOwnProperty.call(body, "rewind")) {
                const next = writeTuning({ rewind: body.rewind === true });
                sendJson(response, 200, { ok: true, rewind: next.rewind, restart_required: true });
                return;
              }
              const enabled = writeBoost(body?.enabled === true);
              sendJson(response, 200, { ok: true, enabled, restart_required: true });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
        },
      }, "dsh-purge: boost");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/probe",
        handler: async (request, response) => {
          try {
            if (request.method === "GET") {
              const probe = readProbe();
              sendJson(response, 200, { ok: true, active: !!probe, nonce: probe?.nonce || "" });
              return;
            }
            if (request.method === "POST") {
              sendJson(response, 200, { ok: true, ...createProbe() });
              return;
            }
            response.writeHead(405, { allow: "GET, POST" });
            response.end();
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: probe");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/audit",
        handler: async (request, response) => {
          if (request.method !== "GET") {
            response.writeHead(405, { allow: "GET" });
            response.end();
            return;
          }
          const n = Number(new URL(request.url || "/", "http://x").searchParams.get("limit") || 20);
          sendJson(response, 200, { ok: true, entries: readAudit({ limit: Number.isFinite(n) ? n : 20 }) });
        },
      }, "dsh-purge: audit");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/hooks-deny",
        handler: async (request, response) => {
          if (request.method === "GET") {
            try {
              const settings = core.refreshHooksDenySettings();
              sendJson(response, 200, { ok: true, hooksDenyBypass: settings.hooksDenyBypass });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          if (request.method === "POST") {
            try {
              const body = await readJsonBody(request);
              if (typeof body?.hooksDenyBypass !== "boolean") {
                sendJson(response, 400, { ok: false, error: "hooksDenyBypass must be boolean" });
                return;
              }
              const saved = core.setHooksDenySettings({ hooksDenyBypass: body.hooksDenyBypass });
              sendJson(response, 200, { ok: true, hooksDenyBypass: saved.hooksDenyBypass });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
        },
      }, "dsh-purge: hooks-deny");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/last-user",
        handler: async (request, response) => {
          if (request.method !== "GET") {
            response.writeHead(405, { allow: "GET" });
            response.end();
            return;
          }
          try {
            const url = new URL(request.url, "http://127.0.0.1");
            const sessionId = String(url.searchParams.get("sessionId") || "").trim();
            sendJson(response, 200, await rewind.readLastUserText(ctx, sessionId));
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: last user");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/rewind/options",
        handler: async (request, response) => {
          if (request.method !== "GET") {
            response.writeHead(405, { allow: "GET" });
            response.end();
            return;
          }
          try {
            const url = new URL(request.url, "http://127.0.0.1");
            const sessionId = String(url.searchParams.get("sessionId") || "").trim();
            sendJson(response, 200, await rewind.analyzeRewind(ctx, sessionId));
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: rewind options");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/rewind",
        handler: async (request, response) => {
          if (request.method === "GET") {
            try {
              const url = new URL(request.url, "http://127.0.0.1");
              const sessionId = url.searchParams.get("sessionId");
              if (sessionId) {
                const draft = rewind.takeDraft(sessionId);
                sendJson(response, 200, { ok: true, ...(draft || {}) });
                return;
              }
              const pending = rewind.getPending();
              sendJson(response, 200, { ok: true, ...(pending || {}) });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          if (request.method === "POST") {
            try {
              const body = await readJsonBody(request);
              const sessionId = String(body?.sessionId || "").trim();
              if (!sessionId) {
                sendJson(response, 400, { ok: false, error: "sessionId 가 필요합니다" });
                return;
              }
              const mode = body?.mode === "round" ? "round" : "once";
              const result = await rewind.applyRewind(ctx, sessionId, mode);
              sendJson(response, result.ok ? 200 : 409, result);
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
        },
      }, "dsh-purge: rewind");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/update",
        handler: async (request, response) => {
          if (request.method === "GET") {
            try {
              sendJson(response, 200, await updateRequest(() => updater.checkUpdate()));
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          if (request.method === "POST") {
            try {
              const body = await readJsonBody(request);
              const result = await updateRequest(() => updater.handleUpdateOp(body || {}));
              if (result && result.needsFullQuit) bootFullQuit = true;
              sendJson(response, 200, result);
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
        },
      }, "dsh-purge: update");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/apply",
        handler: async (request, response) => {
          if (request.method !== "POST") {
            response.writeHead(405, { allow: "POST" });
            response.end();
            return;
          }
          try {
            const body = await readJsonBody(request);
            const incoming = typeof body?.content === "string" ? body.content : null;
            core.applyRuntimeEnv();
            core.clearDesktopLocateCache();
            const home = core.pinDshHome();
            const scrubbed = core.sanitizeDesktopCommandRuntimes();
            const state = await core.gatherState();
            if (home) state.dsh_home = home;
            let located;
            try {
              located = await core.resolveOfficialAiBase(state.ai_base, { forApply: true });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
              return;
            }
            if (!located.aiBase) {
              sendJson(response, 500, { ok: false, error: core.missingAiBaseMessage() });
              return;
            }
            state.ai_base = located.aiBase;
            if (located.extracted) {
              const arch = located.handoff?.archive;
              if (arch) core.writeUnpackedAsarStamp(arch);
            }
            const handoff = located.handoff && located.handoff.swapAsar ? located.handoff : null;
            const blocked = rejectIfNeedPrompt(state.dsh_home, incoming === null ? undefined : incoming);
            if (blocked) {
              const ui = await core.readOverrideForUi(state.dsh_home);
              sendJson(response, 400, {
                ok: false,
                needPrompt: true,
                override_content: incoming || "",
                defaultContent: ui.defaultContent,
                ...blocked,
              });
              return;
            }
            try {
              await core.commitOverrideOnApply(state.dsh_home, incoming);
            } catch (e) {
              console.warn("[dsh-purge] apply override:", String(e && e.message ? e.message : e));
            }
            const httpMulti = await core.applyPatchesAllHosts(core.ALL_PATCHES, {
              preserveClientBundles: false,
              forApply: true,
            });
            const report = httpMulti.report;
            const shim = await core.patchAllShims();
            let cliRepair = null;
            try {
              cliRepair = core.repairOfficialCliAfterUnpack();
            } catch (e) {
              cliRepair = { ok: false, error: String(e && e.message ? e.message : e) };
            }
            const flash = core.silenceCmdFlash(httpMulti.hosts[0]?.aiBase || state.ai_base);
            const summary = core.summarizeApplyReport(report);
            const hostWritten =
              core.allPatchHostsWritten(httpMulti.hosts) || core.hostCleanMarkersPresent(state.ai_base);
            const hookDenyRestoreFailed = (httpMulti.hookDenyRestoreFailed || []).length > 0;
            const complete = summary.failed.length === 0 && flash.ok === true && hostWritten && !hookDenyRestoreFailed;
            const sealedNow = core.desktopAsarStillSealed();
            if (handoff && sealedNow && cliRepair?.ok === false) {
              sendJson(response, 500, { ok: false, error: "Desktop CLI runtime repair failed; original archive retained.", cli_repair: cliRepair });
              return;
            }
            const promptReady = summary.failed.length > 0 && summary.failed.every((item) => item.status === "pattern_not_found");
            if (flash.ok === true && (complete || promptReady) && hostWritten) {
              reapply.markPatchesApplied();
            }
            // 전부 정리되고 호스트에 표시된 뒤에야 재시작을 제안한다; 밀봉 패키지는 재시작 시 asar 를 교체한다.
            const shouldRestart = applyShouldRestart({
              complete: complete || (promptReady && hostWritten),
              sealed: sealedNow,
              appliedCount: summary.applied,
              promptReady: promptReady && hostWritten,
            });
            const manualHandoff = ["win32", "darwin"].includes(process.platform) && shouldRestart && handoff && sealedNow
              ? scheduleDesktopHandoff({ exe: handoff.exe, asar: handoff.asar }) : null;
            if (shouldRestart && handoff && sealedNow) bootFullQuit = true;
            else bootFullQuit = false;
            if (shouldRestart) reapply.markSettleRestart();
            let promptInjectInstall = "skipped";
            if (hostWritten && flash.ok === true) {
              // Apply → cleanup → restart 성공 후 기본적으로 암호화 프롬프트를 prompt-inject.md 에 seed 한다.
              // 사용자가 고친 내용은 유지하고, 파일이 없거나 아직 플러그인 이전 기본값일 때만 쓴다.
              try {
                const seed = core.seedPromptInjectAtBoot(state.dsh_home);
                promptInjectInstall = seed?.action || "noop";
              } catch (e) {
                promptInjectInstall = `error:${String(e && e.message ? e.message : e)}`;
              }
            }
            const hung = refreshHungOperator(state.dsh_home);
            const override = await core.readOverrideForUi(state.dsh_home);
            sendJson(response, 200, {
              ok: true,
              complete,
              restarting: false,
              manualQuit: Boolean(manualHandoff),
              handoff: manualHandoff?.handoff || null,
              restart_after_apply: shouldRestart,
              unpacked_asar: shouldRestart,
              needs_full_quit: shouldRestart,
              asar_still_sealed: sealedNow,
              asar_swap_started: Boolean(manualHandoff),
              applied: summary.applied,
              already: summary.already,
              failed: summary.failed.length,
              failed_items: summary.failed.map((r) => ({
                id: r.patch_id,
                name: r.name,
                status: r.status,
              })),
              report: report.map((r) => ({ id: r.patch_id, name: r.name, status: r.status })),
              override_content: hung.text || override.content,
              defaultContent: override.defaultContent,
              ...injectSnapshot(state.dsh_home),
              override_path: override.path,
              override_installed: promptInjectInstall,
              shim,
              desktop_scrubbed: scrubbed,
              cli_repair: cliRepair,
              cmd_flash: flash,
              // Report the existing completion inputs; do not infer failure from a missing field.
              host_written: hostWritten,
              hook_restore_failed: hookDenyRestoreFailed,
            });
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: apply");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/revert",
        handler: async (request, response) => {
          if (request.method !== "POST") {
            response.writeHead(405, { allow: "POST" });
            response.end();
            return;
          }
          try {
            const state = await core.gatherState();
            const result = {};
            if (state.ai_base) {
              const { reverted, errors } = await core.revertAll(state.ai_base);
              result.reverted = reverted.length;
              result.errors = errors.length;
            }
            result.shim = await core.revertAllShims();
            sendJson(response, 200, { ok: true, ...result, note: "dsh 재시작 후 복원; prompt-inject.md 유지" });
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: revert");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/uninstall",
        handler: async (request, response) => {
          if (request.method !== "POST") {
            response.writeHead(405, { allow: "POST" });
            response.end();
            return;
          }
          try {
            const result = await uninstaller.uninstallPurge();
            sendJson(response, result.ok ? 200 : 500, {
              ...result,
              surface: hostctl.currentSurface(),
              fullApp: hostctl.currentSurface() === "desktop",
              note: result.ok ? hostctl.restartNote() : undefined,
            });
            if (result.ok) {
              uninstaller.scheduleCleanupRestart({
                request,
                cleanup: result.cleanup,
                ctx,
              });
            }
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
          }
        },
      }, "dsh-purge: uninstall");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/drill-grant",
        handler: async (request, response) => {
          const home = core.findDshHome();
          if (request.method === "GET") {
            sendJson(response, 200, { ok: true, ...readDrillGrant(home) });
            return;
          }
          if (request.method === "POST") {
            sendJson(response, 200, { ok: true, ...writeDrillGrant(home) });
            return;
          }
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
        },
      }, "dsh-purge: drill-grant");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/override",
        handler: async (request, response) => {
          if (request.method === "GET") {
            try {
              const home = core.findDshHome();
              // 패널이 override 패널을 열 때 기본 암호화 프롬프트가 seed 되었는지 확인한다; 사용자 수정은 유지.
              try { core.seedPromptInjectAtBoot(home); } catch { /* ignore */ }
              refreshHungOperator(home);
              const ui = await core.readOverrideForUi(home);
              sendJson(response, 200, { ok: true, ...ui, ...injectSnapshot(home) });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          if (request.method === "POST") {
            try {
              const body = await readJsonBody(request);
              const content = typeof body?.content === "string" ? body.content : null;
              if (content === null) {
                sendJson(response, 400, { ok: false, error: "content must be a string" });
                return;
              }
              const home = core.findDshHome();
              const blocked = rejectIfNeedPrompt(home, content);
              if (blocked) {
                sendJson(response, 400, {
                  ok: false,
                  content,
                  ...blocked,
                });
                return;
              }
              const saved = await core.saveOverrideContent(home, content);
              const hung = refreshHungOperator(home);
              const ui = await core.readOverrideForUi(home);
              sendJson(response, 200, {
                ok: true,
                content: hung.text,
                defaultContent: saved.defaultContent,
                customized: ui.customized,
                usingDefault: ui.usingDefault,
                path: ui.path,
                ...injectSnapshot(home),
              });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e) });
            }
            return;
          }
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
        },
      }, "dsh-purge: override");
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/own-servers",
        handler: async (request, response) => {
          const home = core.findDshHome();
          if (request.method === "GET") {
            sendJson(response, 200, { ok: true, content: readAllowText(home) });
            return;
          }
          if (request.method === "POST") {
            try {
              const body = await readJsonBody(request);
              const content = typeof body?.content === "string" ? body.content : null;
              if (content === null) {
                sendJson(response, 400, { ok: false, error: "content must be a string" });
                return;
              }
              const saved = await writeAllowText(home, content);
              sendJson(response, 200, { ok: true, content: saved.text, dropped: saved.dropped });
            } catch (e) {
              sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
            }
            return;
          }
          response.writeHead(405, { allow: "GET, POST" });
          response.end();
        },
      }, "dsh-purge: own-servers");
      trackRoute(installRulesHttp(host.webServer));
      trackRoute(installSkillsHttp(host.webServer));
      registerPluginRoute({
        kind: "exact",
        path: "/dsh-purge/restart",
        handler: async (request, response) => {
          if (request.method !== "POST") {
            response.writeHead(405, { allow: "POST" });
            response.end();
            return;
          }
          try {
            const ready = await ensureRestartReady();
            if (!ready.ok) {
              bootFullQuit = false;
              sendJson(response, 200, {
                ok: false,
                error: ready.error || "정리가 끝나지 않아 재시작을 취소했습니다",
                restarting: false,
                pending: ready.pending || [],
              });
              return;
            }
            const surface = hostctl.currentSurface();
            let planned = null;
            if (core.desktopAsarStillSealed()) {
              planned = core.restartSealedDesktopIfNeeded({ ctx });
            } else {
              planned = hostctl.scheduleRestart(request, ctx);
            }
            if (planned && planned.clean === false) {
              bootFullQuit = false;
              sendJson(response, 200, {
                ok: false,
                error: "정리가 현재 호스트에 기록되지 않아 재시작을 취소했습니다",
                restarting: false,
              });
              return;
            }
            // 사용자가 이미 재시작을 눌렀다: 점착 플래그를 지워 같은 프로세스에서 잘못 새로고침/패널 재진입 시 또 뜨는 것을 막는다.
            bootFullQuit = false;
            const restarting = Boolean(planned && !planned.manualQuit && (planned.restarting || planned.asarSwap));
            const restartError = planned && planned.error ? String(planned.error) : "";
            sendJson(response, 200, {
              ok: restarting || !restartError,
              surface,
              fullApp: surface === "desktop",
              restarting,
              already: Boolean(planned && planned.already),
              manualQuit: Boolean(planned?.manualQuit),
              handoff: planned?.handoff || null,
              needsFullQuit: Boolean(planned && planned.asarSwap),
              asar_still_sealed: core.desktopAsarStillSealed(),
              error: restartError || undefined,
              note: planned?.manualQuit ? "DSH 를 완전히 종료하세요(macOS 는 ⌘Q, Windows 는 시스템 트레이에서 종료); 패키지 교체 상태는 조회할 수 있습니다. 완료 후 직접 열어야 하며, 플러그인은 자동 재시작하지 않습니다." : restarting ? "재시작 중입니다." : restartError,
            });
          } catch (e) {
            sendJson(response, 500, { ok: false, error: String(e) });
          }
        },
      }, "dsh-purge: restart");
      return () => {
        for (let i = routeDisposers.length - 1; i >= 0; i -= 1) {
          try { routeDisposers[i](); } catch { /* ignore */ }
        }
        routeDisposers.length = 0;
      };
    }, "dsh-purge: http routes");
  });
}

function methodNotAllowed(request, response, allow) {
  if (allow.includes(request.method)) return false;
  response.writeHead(405, { allow: allow.join(", ") });
  response.end();
  return true;
}

async function handleRulesOp(op, body, queryId, queryCwd) {
  const dshHome = core.findDshHome();
  const id = typeof body?.id === "string" ? body.id : String(queryId || "");
  const cwdHint = typeof body?.cwd === "string" && body.cwd.trim()
    ? body.cwd.trim()
    : (typeof queryCwd === "string" && queryCwd.trim() ? queryCwd.trim() : "");
  if (cwdHint) {
    try { rules.writeLastCwd(dshHome, cwdHint); } catch { /* ignore */ }
  }
  if (op === "status") {
    return { ok: true, ...(await rules.rulesStatus(dshHome, cwdHint)) };
  }
  if (op === "scan-cwd" || op === "scan") {
    const effective = cwdHint || rules.readLastCwd(dshHome);
    const candidates = effective ? rules.scanCwdInstructions(effective) : [];
    const selections = rules.readCwdSelections(dshHome);
    return {
      ok: true,
      cwd: effective,
      candidates: candidates.map((item) => ({ ...item, selected: selections.includes(item.path) })),
      selections,
    };
  }
  if (op === "toggle-cwd") {
    const target = typeof body?.path === "string" ? body.path.trim() : "";
    if (!target) return { status: 400, ok: false, error: "path required" };
    const enabled = body?.enabled !== false;
    const next = await rules.toggleCwdSelection(dshHome, target, enabled);
    return { ok: true, selections: next };
  }
  if (op === "set-policy" || op === "workspace-policy") {
    const policy = typeof body?.policy === "string" ? body.policy.trim() : "";
    if (!rules.WORKSPACE_POLICIES.includes(policy)) {
      return { status: 400, ok: false, error: `invalid policy: ${policy}` };
    }
    const applied = await rules.writeWorkspacePolicy(dshHome, policy);
    return { ok: true, policy: applied, policies: [...rules.WORKSPACE_POLICIES] };
  }
  if (op === "read") {
    if (!rules.validRuleId(id)) return { status: 400, ok: false, error: "invalid id" };
    const content = await rules.readRule(dshHome, id);
    if (content === null) return { status: 404, ok: false, error: `rule not found: ${id}` };
    const meta = await rules.readRuleMeta(dshHome, id);
    return { ok: true, id, name: meta.name, target: meta.target, content };
  }
  if (op === "save") {
    const content = typeof body?.content === "string" ? body.content : null;
    if (!rules.validRuleId(id) || content === null) {
      return { status: 400, ok: false, error: "id and content (string) required" };
    }
    const target = typeof body?.target === "string" ? body.target : undefined;
    // 예전 버전은 body.target 을 그대로 rules.saveRule 에 넣었다; 잘못된 대상은 agents_path 추론을 오염시킨다.
    if (target !== undefined && !rules.validTarget(target)) {
      return { status: 400, ok: false, error: `invalid target: ${target}(AGENTS.md 또는 CLAUDE.md 만 가능)` };
    }
    await rules.saveRule(dshHome, id, content, {
      name: typeof body?.name === "string" ? body.name : undefined,
      target,
    });
    refreshHungOperator(dshHome);
    return { ok: true, id, ...injectSnapshot(dshHome) };
  }
  if (op === "activate") {
    if (!rules.validRuleId(id)) return { status: 400, ok: false, error: "invalid id" };
    const meta = await rules.activateRule(dshHome, id);
    refreshHungOperator(dshHome);
    return {
      ok: true,
      id,
      name: meta.name,
      target: meta.target,
      agents_path: rules.targetPath(dshHome, meta.target),
      note: "대상 파일에 기록하고 systemPrompt 에 주입했습니다. 새 세션에서 적용됩니다",
      ...injectSnapshot(dshHome),
    };
  }
  if (op === "delete") {
    if (!rules.validRuleId(id)) return { status: 400, ok: false, error: "invalid id" };
    await rules.deleteRule(dshHome, id);
    refreshHungOperator(dshHome);
    return { ok: true, id };
  }
  if (op === "reset") {
    const r = await rules.resetToOriginal(dshHome);
    refreshHungOperator(dshHome);
    return { ok: true, ...r, note: "출하 상태로 되돌렸습니다(전역 지시 없음); 극칙 라이브러리는 유지" };
  }
  return { status: 400, ok: false, error: `unknown op: ${op}` };
}

function rulesHttpHandler(forcedOp) {
  return async (request, response) => {
    if (request.method === "OPTIONS") {
      sendOptions(response);
      return;
    }
    try {
      const url = new URL(request.url ?? "", "http://127.0.0.1");
      const tail = url.pathname.replace(/^\/dsh-purge\/rules\/?/, "").replace(/\/$/, "");
      let body = {};
      if (request.method === "POST") body = await readJsonBody(request);
      else if (methodNotAllowed(request, response, forcedOp ? ["GET", "POST"] : ["GET", "POST"])) return;
      const op = forcedOp || body.op || tail || "status";
      const result = await handleRulesOp(op, body, url.searchParams.get("id"), url.searchParams.get("cwd"));
      sendJson(response, result.status || 200, result);
    } catch (e) {
      sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
    }
  };
}

async function handleSkillsOp(op, body, queryId) {
  const dshHome = core.findDshHome();
  const id = typeof body?.id === "string" ? body.id : String(queryId || "");
  if (op === "status") {
    return { ok: true, ...(await skills.skillsStatus(dshHome)) };
  }
  if (op === "read") {
    if (!skills.validSkillName(id)) return { status: 400, ok: false, error: "invalid skill name" };
    const item = await skills.readSkill(dshHome, id);
    if (!item) return { status: 404, ok: false, error: `skill not found: ${id}` };
    return { ok: true, ...skills.toPublicSkill(dshHome, item) };
  }
  if (op === "save") {
    if (!skills.validSkillName(id)) return { status: 400, ok: false, error: "id 는 kebab-case 여야 합니다. 예: code-review" };
    const content = typeof body?.content === "string" ? body.content : "";
    const description = typeof body?.description === "string" ? body.description : "";
    const saved = await skills.saveSkill(dshHome, id, content, description);
    return { ok: true, ...skills.toPublicSkill(dshHome, saved) };
  }
  if (op === "delete") {
    if (!skills.validSkillName(id)) return { status: 400, ok: false, error: "invalid skill name" };
    const removed = await skills.deleteSkill(dshHome, id);
    return { ok: true, ...skills.toPublicSkill(dshHome, removed) };
  }
  if (op === "import") {
    if (body?.path || body?.source || body?.folder) {
      return { status: 400, ok: false, error: "이 머신에서 압축 파일 또는 폴더를 선택해 가져오세요" };
    }
    if (typeof body?.data === "string" && body.data.trim()) {
      const packed = await skills.importArchive(dshHome, Buffer.from(body.data, "base64"), body.name || "skill.zip");
      return { ok: true, ...packed };
    }
    if (Array.isArray(body?.files) && body.files.length) {
      const packed = await skills.importFileTree(dshHome, body.files, body.name || "");
      return { ok: true, ...packed };
    }
    return { status: 400, ok: false, error: "압축 파일 또는 폴더를 선택하세요" };
  }
  return { status: 400, ok: false, error: `unknown op: ${op}` };
}

function skillsHttpHandler(forcedOp) {
  return async (request, response) => {
    if (request.method === "OPTIONS") {
      sendOptions(response);
      return;
    }
    if (request.method !== "GET" && request.method !== "POST") {
      response.writeHead(405, { allow: "GET, POST, OPTIONS" });
      response.end();
      return;
    }
    try {
      const url = new URL(request.url ?? "", "http://127.0.0.1");
      const tail = skillRouteTail(url.pathname);
      const body = request.method === "POST" ? await readJsonBody(request, 14 * 1024 * 1024) : {};
      const op = forcedOp
        || body.op
        || tail
        || url.searchParams.get("op")
        || (url.searchParams.get("id") ? "read" : "status");
      const result = await handleSkillsOp(op, body, url.searchParams.get("id"));
      sendJson(response, result.status || 200, result);
    } catch (e) {
      sendJson(response, 500, { ok: false, error: String(e && e.message ? e.message : e) });
    }
  };
}

function skillRouteTail(pathname) {
  const match = String(pathname || "").match(/^\/dsh-purge\/skills?(?:\/(.*))?$/i);
  if (!match) return "";
  return String(match[1] || "").replace(/\/$/, "");
}

function installSkillsHttp(webServer) {
  // 예전에는 /dsh-purge/skills[/op] 와 /dsh-purge/skill[/op] 를 각각 exact 로 10여 개 등록하고 prefix 폴백을 더했다;
  // handler 내부가 원래 tail 로 op 를 분배하므로 exact 목록은 라우트 테이블만 부풀리고 핫 리로드 해제도 더 어렵게 만들 뿐이었다.
  // prefix 2개로 전부 덮고, handler 의 forcedOp="" 로 body.op/tail/op 쿼리 문자열이 계속 동작한다.
  const stop = [];
  stop.push(registerRoute(webServer, {
    kind: "prefix", path: "/dsh-purge/skills", handler: skillsHttpHandler(""),
  }));
  stop.push(registerRoute(webServer, {
    kind: "prefix", path: "/dsh-purge/skill", handler: skillsHttpHandler(""),
  }));
  return () => {
    for (let i = stop.length - 1; i >= 0; i -= 1) {
      try { stop[i]?.(); } catch { /* ignore */ }
    }
  };
}

function installRulesHttp(webServer) {
  // skills 와 동일: prefix 하나로 /dsh-purge/rules[/op] 를 덮고, handler 가 tail 로 op 를 분배한다.
  const stop = [];
  stop.push(registerRoute(webServer, {
    kind: "prefix", path: "/dsh-purge/rules", handler: rulesHttpHandler(""),
  }));
  return () => {
    for (let i = stop.length - 1; i >= 0; i -= 1) {
      try { stop[i]?.(); } catch { /* ignore */ }
    }
  };
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function sendOptions(response) {
  response.writeHead(204, { "cache-control": "no-store" });
  response.end();
}

function registerRoute(webServer, spec) {
  try {
    const handler = spec.handler;
    return webServer.register({
      ...spec,
      handler: async (request, response) => {
        if (!allowPluginRequest(request, response)) return;
        return handler(request, response);
      },
    });
  } catch (e) {
    console.warn("[dsh-purge] route", spec?.path, String(e && e.message ? e.message : e));
    return () => {};
  }
}

async function readJsonBody(request, maxBytes = 512 * 1024) {
  const chunks = [];
  let size = 0;
  const limit = Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : 512 * 1024;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limit) throw new Error("request body too large");
    chunks.push(buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

const plugin = {
  name,
  inject,
  apply,
};

export default plugin;
