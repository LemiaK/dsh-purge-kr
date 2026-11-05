import { permissionState } from "./permission-state.js";
import { refinePresetDiagnostic } from "./preset-diagnostic.js";
// Purge self-check: prove, layer by layer, that the bypass actually exists on
// this machine — instead of trusting "플러그인이 설치되었다" as evidence.
// Derived from the dsh-purge patch table (MIT, Copyright (c) 2026 샤오양).
import fs from "node:fs";
import { diskFs } from "./extract-asar.js";
import path from "node:path";
import * as core from "./core.js";
import { compatibility } from "./community.js";
import { resolveProfile, diagnosticHost, hostSurface, desktopResourcesForHost } from "./instance.js";

/**
 * 각 계층은 실제 패치 하나(또는 한 묶음)에 대응하며, `why` 는 "이 계층이 없어지면 무슨 일이 생기는지"를 설명한다.
 * kind: host=호스트 소스 패치, runtime=플러그인 런타임 주입, config=현재 profile 의 선택.
 */
export const BYPASS_LAYERS = Object.freeze([
  { ids: [15], title: "샌드박스 confine 직통", kind: "host",
    why: "read-only / workspace-write 에서도 명령을 bwrap 같은 runner 로 감싸지 않고 denial 시그니처가 비어 있습니다" },
  { ids: [16], title: "파일 시스템 울타리 비활성화", kind: "host",
    why: "읽기 전용이나 워크스페이스 경계 때문에 FS_SANDBOX_DENIED 로 파일 쓰기/수정이 막히지 않습니다" },
  { ids: [17], title: "관찰 정책 통과", kind: "host",
    why: "edit 이 더 이상 먼저 read 를 요구하지 않고 버전 충돌 게이트도 통과합니다" },
  { ids: [6, 33, 48], title: "거부 화법 중립화", kind: "host",
    why: "도구 설명이 더 이상 모델에게 샌드박스 거부를 이유로 승인을 요청하라고 가르치지 않습니다" },
  { ids: [7, 8, 10], title: "기본 정책", kind: "host",
    why: "샌드박스 기본값 danger-full-access, 승인 기본값 never(UI 가 덮어쓸 수 있고 env 에 하드코딩하지 않습니다)" },
  { ids: [9, 35], title: "승인 자동 통과", kind: "host",
    why: "승인 게이트가 곧바로 신뢰되고 rejected/cancelled/unavailable 도 더 이상 턴을 끊는 오류를 던지지 않습니다" },
  { ids: [59], title: "Auto Review 가 도구를 막지 않음", kind: "host",
    why: "공식 자동 심사가 더 이상 도구 호출을 부결하지 않습니다" },
  { ids: [60, 62, 61], title: "도구 승인 fail-open", kind: "host",
    why: "run_code / 승인 채널이 없을 때 통과하고, 사용자가 직접 거절하면 여전히 거절합니다" },
  { ids: [63], title: "계획 모드 하드 블록 없음", kind: "host",
    why: "운영자가 실행을 요구하면 계획 모드가 더 이상 실행을 거부하지 않습니다" },
  { ids: [4, 25, 43, 71, 76], optionalIds: [71, 76], title: "공식 정체성 제거", kind: "host",
    why: "'You are a coding agent powered by ...' 와 내장 프리셋 정체성 문장을 걷어냅니다" },
  { ids: [32, 53], title: "Web 면 정체성 중립화", kind: "host",
    why: "Web 면 프롬프트가 더 이상 자신을 DeepSeek Harness 라 부르지 않고 별도 서비스 기동도 금지하지 않습니다" },
  { ids: [40, 74, 55, 72], title: "주입이 프리셋에 덮이지 않음", kind: "host",
    why: "complete 프리셋, 첫 턴 assemble, 매 단계 system 교체 모두 dsh-purge 주입을 보존합니다" },
  { ids: [26, 28], optionalIds: [28], title: "minimal/Liang Shen 프리셋 주입 보존", kind: "host",
    why: "minimal 프리셋은 open inject, Liang Shen 의 phase-1 은 벗겨지지 않습니다" },
  { ids: [29, 50], title: "외부 콘텐츠가 읽기 전용으로 강등되지 않음", kind: "host",
    why: "web/session 인용 콘텐츠도 여전히 실행 가능한 데이터로 쓸 수 있습니다" },
  { ids: [30, 31, 64, 65], optionalIds: [30, 31, 64, 65], title: "Hooks 가 턴을 부결하지 않음", kind: "host",
    why: "hooks-claude-code / hooks-codex 가 설치된 상태에서 deny 가 더 이상 턴 전체를 reject 하지 않습니다" },
  { ids: [21, 22, 23], title: "도구 상한 완화", kind: "host",
    why: "bash 대기 복원, read 상한 완화, 서브에이전트 깊이 기본 3→10" },
  { ids: [24, 37], title: "프리셋과 서브에이전트에 잠금 없음", kind: "host",
    why: "preset fetch 를 열고, 서브에이전트 scope-lock 문구를 중립화해 스스로 좁히지 않게 합니다" },
  { ids: [51, 52], title: "새 세션과 로그 기본값", kind: "host",
    why: "새 세션은 full access 를 유지하고 공식 session log 는 기본적으로 업로드하지 않습니다" },
  { ids: [56, 58, 75, 77], title: "되돌리기에 잔여 없음", kind: "host",
    why: "되돌리기는 철회된 턴만 숨기고, 표식은 모델 요청에 들어가지 않으며, 작업 회수, append 가 곧 창 교체입니다" },
  { ids: [47, 49, 57, 69], title: "모델 게이트웨이 호환", kind: "host",
    why: "OAuth 가 Claude 정체성을 끼워 넣지 않고, developer role 폴백, stream 연결이 패치로 망가지지 않습니다" },
  { ids: [87, 88, 90], title: "세션 메시지 전달과 마운트", kind: "host",
    why: "대기 중 주입 블록을 LF 앵커로 중복 제거해 두 벌로 겹치지 않게 하고, #90 은 네이티브 끼어들기를 복원합니다: steer 는 next-step 으로 돌아가고 사용자 메시지를 다음 라운드로 강제 배치하지 않습니다" },
  { ids: [82, 83, 84], optionalIds: [82, 83, 84], title: "데스크톱 호스트 기동 폴백", kind: "host",
    why: "DSH_PROFILE 이 없어도 profile 을 찾고, host 가 시그널로 죽거나 정상 종료해도 크래시 상자를 띄우지 않습니다" },
]);

function readProfileConfig(dshHome, options) {
  let file = "";
  try {
    const profile = resolveProfile(dshHome, options);
    file = path.join(profile.directory,"cordis.patch.yml");
    return {file, text:fs.readFileSync(file,"utf8"), profile};
  } catch (e) { return {file, text:"", error:e.message}; }
}

function configLayer(dshHome, options) {
  const { file, text, profile, error } = readProfileConfig(dshHome, options);
  return {
    ...permissionState(text, options?.ctx),
    file,
    profile: profile?.name || "",
    profile_source: profile?.source || "",
    ...(error ? { error, note: `현재 profile 을 읽지 못했습니다: ${error}` } : {}),
  };
}

function runtimeLayer(dshHome) {
  const file = core.findOverrideFile(dshHome);
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    text = "";
  }
  const bytes = Buffer.byteLength(text, "utf8");
  return {
    file,
    bytes,
    ok: bytes > 0,
    note: bytes > 0
      ? `주입 파일 ${bytes} 바이트, 매 단계 dsh-purge section 으로 다시 붙습니다`
      : "주입 파일이 비어 있습니다: 플러그인은 로드되지만 주입할 내용이 없습니다",
  };
}

// Only explicit applicability evidence can remove a patch from the denominator.
function notApplicable(patch, status) {
  return status === "na" || status === "off" || status === "disabled" ||
    (status === "not_needed" && patch?.id === 76) ||
    (status === "missing_file" && !!patch?.optional) ||
    (status === "skipped" && !!patch?.settleWhenAbsent);
}

export function tallyPatchStatus(status, patches = core.ALL_PATCHES) {
  const result = {applied:0, total:0, all:patches.length, na:0, skipped:0, missing_file:0, off:0, disabled:0, not_applicable:0, partial:0};
  for (const patch of patches) {
    const value = status[patch.id];
    if (["na", "skipped", "missing_file", "off", "disabled"].includes(value)) result[value]++;
    if (value === "partial") result.partial++;
    if (notApplicable(patch, value)) result.not_applicable++;
    else {
      result.total++;
      if (value === "applied" || value === "already") result.applied++;
    }
  }
  return result;
}

export function rollupLayers(status, hasHost, options = {}) {
  // 패치 상태를 읽지 못하면 status 는 빈 표다: “알 수 없음”을 “전부 통과”로 접지 않는다.
  const statusFailed = Boolean(options.statusError);
  const layers = [];
  const metadata = new Map((options.patches || core.ALL_PATCHES).map(p => [p.id, p]));
  for (const layer of BYPASS_LAYERS) {
    const optionalIds = new Set(layer.optionalIds || []);
    const rows = layer.ids.map((id) => ({
      id,
      optional: metadata.has(id) ? !!metadata.get(id).optional : optionalIds.has(id),
      status: status[id] || (hasHost ? "unknown" : "unlocated"),
    }));
    // 명확히 해당 없음이거나 선택 대상이 없을 때만 제외한다. 필수 파일 누락을 성공으로 위장할 수는 없다.
    const required = rows.filter((row) => !notApplicable({...metadata.get(row.id), optional:row.optional}, row.status));
    const applied = rows.filter((row) => row.status === "applied" || row.status === "already");
    const pending = required.filter((row) => row.status === "pending");
    // 대기 != 적용 불가: 전자는 “적용”을 한 번 누르면 되고, 후자만 앵커를 고쳐야 한다.
    // partial = 일부 대상 파일은 적중하고 다른 하나는 존재하지만 적중하지 않음: 반드시 이상으로 표시하고 ok 로 보고하지 않는다.
    const broken = required.filter((row) => !["applied", "already", "pending", "unlocated", "unknown"].includes(row.status));
    const absent = rows.filter((row) => notApplicable({...metadata.get(row.id), optional:row.optional}, row.status));
    const unknown = statusFailed || rows.some((row) => row.status === "unlocated" || row.status === "unknown");
    const state = broken.length ? "broken" : unknown ? "unknown" : pending.length ? "pending" : "ok";
    layers.push({
      title: layer.title,
      why: layer.why,
      kind: layer.kind,
      ids: layer.ids,
      ok: state === "ok",
      state,
      applied: applied.length,
      required: required.length,
      total: rows.length,
      pending: pending.map((row) => row.id),
      absent: absent.map((row) => row.id),
      broken: broken.map((row) => ({ id: row.id, status: row.status })),
      note: statusFailed
        ? `패치 상태를 읽지 못해 이 계층은 대조되지 않았습니다: ${options.statusError}`
        : rows.some(row => row.id === 76 && row.status === "unknown") && !statusFailed
          ? "현재 프리셋을 정적으로 대조할 수 없습니다: 가독성, YAML 형식, persona.prefix 를 확인하세요. 동적 표현식은 실행하지 않으므로 미지가 적용됨을 뜻하지 않습니다"
        : unknown ? "호스트를 찾지 못했거나 상태가 불완전해 이 계층을 대조할 수 없습니다. 패치가 미적용이라는 뜻은 아닙니다"
        : rows.some(row => row.status === "not_needed") ? "현재 프리셋 본문을 읽기 전용으로 대조했고 #76 은 처리할 필요가 없습니다. 적용됨으로 세지 않았습니다"
        : absent.length === rows.length ? "대상 플러그인/프리셋이 설치되지 않아 이 계층은 지금 해당 없음" : "",
      ...(statusFailed ? { status_error: options.statusError } : {}),
    });
  }
  return layers;
}

/**
 * 계층별 자기 점검.
 * @param aiBase - 대상 호스트 @deepseek-ai 루트(비면 현재 기동 정보/명시적 환경만 해석).
 * @param dshHome - DSH 데이터 디렉터리(기본값 core.findDshHome()).
 */
export function resolveHost(aiBase, options = {}) {
  return diagnosticHost({...options, aiBase, diskReader: options.reader});
}

/** Read only the requested host, never a different installed Desktop application. */
export function hostLayoutLayer(host, reader = diskFs()) {
  const surface = hostSurface(host);
  const base = {title:"호스트 디스크 레이아웃",kind:"layout",ids:[],pending:[],broken:[]};
  if (surface === "web") return {...base,why:"현재 대상은 npm/Web 호스트라 데스크톱 app.asar 점검이 해당 없습니다",ok:true,state:"na",applicable:false,applied:0,total:0,required:0,note:"해당 없음(Web 호스트)",detail:{surface,asar_still_sealed:null}};
  if (surface === "unknown") return {...base,why:"대상 인스턴스를 확정하지 못했으므로 다른 데스크톱 설치로 대신할 수 없습니다",ok:false,state:"unknown",applied:0,total:1,broken:[],note:"현재 호스트를 찾지 못해 실행 방식을 확인할 수 없습니다",detail:{surface,asar_still_sealed:null}};
  const resources = desktopResourcesForHost(host), archive=path.join(resources,"app.asar");
  let sealed = false;
  try { sealed=reader.statSync(archive).isFile(); }
  catch (e) {
    if (e.code !== "ENOENT") return {...base,why:"현재 대상 인스턴스의 패키징 상태를 읽지 못했습니다",ok:false,state:"broken",applied:0,total:1,broken:[{id:"asar",status:"unreadable"}],detail:{surface,archive,error:e.message,asar_still_sealed:null}};
  }
  return {...base,why:"대상 디스크의 app.asar 만 확인하며 현재 프로세스의 로드 출처를 증명하지 않습니다. 실행 진입 증거는 host-status 를 보세요",ok:!sealed,state:sealed?"broken":"ok",applied:sealed?0:1,total:1,broken:sealed?[{id:"asar",status:"sealed"}]:[],detail:{surface,archive,asar_still_sealed:sealed}};
}

export async function selfCheck(aiBase, dshHome = core.findDshHome(), options = {}) {
  const host = resolveHost(aiBase, options);
  const compat = compatibility(host);
  const services=options.coreModule || core;
  let status = {};
  let statusError = "";
  if (host) {
    try {
      status=await services.patchStatus(host, services.ALL_PATCHES, {surface:hostSurface(host),dshHome});
      status=refinePresetDiagnostic(status,dshHome);
    }
    catch (e) { status={}; statusError=String(e && e.message ? e.message : e); }
  }
  const layers = rollupLayers(status, Boolean(host), {statusError, patches:services.ALL_PATCHES});
  // Some patches have no named layer; missing required targets still need to be
  // visible in the overall verdict, not just a smaller headline count.
  const grouped = new Set(BYPASS_LAYERS.flatMap(layer => layer.ids));
  const missing = services.ALL_PATCHES.filter(p => !grouped.has(p.id) && !p.optional && status[p.id] === "missing_file");
  if (missing.length) layers.push({
    title:"기타 필수 대상 파일", kind:"host", why:"설치에 필수 대상 파일이 빠졌으니 대상 경로나 설치 무결성을 대조해야 합니다",
    ids:missing.map(p=>p.id), ok:false, state:"broken", applied:0, total:missing.length,
    pending:[], broken:missing.map(p=>({id:p.id,status:"missing_file"})),
  });
  const runtime = runtimeLayer(dshHome);
  layers.push({
    title: "런타임 프롬프트 주입",
    why: "prompt-inject.md 가 dsh-purge section 으로 매 단계 system prompt 조립에 참여합니다",
    kind: "runtime",
    ids: [],
    ok: runtime.ok,
    state: runtime.ok ? "ok" : "broken",
    applied: runtime.ok ? 1 : 0,
    total: 1,
    pending: [],
    broken: runtime.ok ? [] : [{ id: "inject", status: "empty" }],
    detail: runtime,
  });
  const config = configLayer(dshHome, options);
  layers.push({
    title: "현재 profile 의 권한 선택",
    why: "화면 계층의 마지막 문: 패치가 무효여도 이 조합은 승인 창을 띄우지 않습니다",
    kind: "config",
    ids: [],
    ok: config.ok,
    state: config.state,
    note: config.note,
    applied: config.ok ? 1 : 0,
    total: 1,
    pending: [],
    broken: config.state === "broken" ? [{ id: "preset", status: `${config.preset}/${config.approval}` }] : [],
    detail: config,
  });
  layers.push(hostLayoutLayer(host, options.reader || diskFs()));

  const byKind = (kind) => layers.filter((layer) => layer.kind === kind && layer.applicable !== false);
  const summarize = (list) => ({
    ok: list.every((layer) => layer.ok),
    passed: list.filter((layer) => layer.ok).length,
    total: list.length,
  });
  const baseSummary = {
    host: summarize(byKind("host")),
    runtime: summarize(byKind("runtime")),
    config: summarize(byKind("config")),
    layout: summarize(byKind("layout")),
  };
  const uncertain = layers.filter((layer) => ["unknown", "inferred"].includes(layer.state));
  const failed = layers.filter((layer) => !layer.ok);
  const pendingLayers = layers.filter((layer) => layer.state === "pending");
  const brokenLayers = layers.filter((layer) => layer.state === "broken");
  return {
    ok: failed.length === 0,
    state: brokenLayers.length ? "broken" : pendingLayers.length ? "pending" : uncertain.some((layer) => layer.state === "unknown") ? "unknown" : uncertain.length ? "inferred" : "ok",
    needsApply: brokenLayers.length === 0 && pendingLayers.length > 0,
    summary: {
      ...baseSummary,
      pending: { layers: pendingLayers.length, patches: pendingLayers.reduce((n, l) => n + l.pending.length, 0) },
      uncertain: { layers: uncertain.length },
      broken: { layers: brokenLayers.length },
    },
    host,
    host_version: compat.host_version,
    qualified: compat.qualified,
    level: compat.level,
    patch: tallyPatchStatus(status, services.ALL_PATCHES),
    layers,
    hints: failed.map((layer) => ({
      title: layer.title,
      action: layer.kind === "config"
        ? (config.error || config.note)
        : layer.kind === "layout"
          ? (layer.detail?.asar_still_sealed === true
            ? "대상 디스크에 app.asar 가 아직 있습니다. host-status 로 현재 서비스 진입점을 대조하세요. 디스크 상태는 로드됨을 뜻하지 않으며 재시작이 필요하면 사용자가 직접 합니다"
            : "현재 대상 인스턴스의 실행 방식을 확정할 수 없습니다: DSH_BASE 나 PURGE_DSH_CLI 를 명확히 하고 다른 설치를 스캔하지 않습니다")
          : layer.kind === "runtime"
            ? "prompt-inject.md 를 기록하거나 플러그인 설정에서 프롬프트를 한 번 저장하세요"
            : layer.status_error
              ? `패치 상태를 읽지 못했습니다: ${layer.status_error}. 먼저 이 오류를 해결하고 그것으로 재설치나 권한 변경을 하지 않습니다`
              : layer.state === "unknown"
                ? (layer.note || "현재 호스트를 찾지 못했습니다. 현재 인스턴스의 DSH_BASE 나 PURGE_DSH_CLI 를 명확히 하면 되고 재설치나 권한 변경은 필요 없습니다")
                : `purge-community diagnose 로 #${layer.ids.join("/#")} 의 앵커를 보세요`,
    })),
  };
}
