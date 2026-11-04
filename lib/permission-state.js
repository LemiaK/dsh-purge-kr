import { parseDocument } from "yaml";

const full = (value) => value.sandbox === "danger-full-access" && value.approval === "never";
const permissionEntry = (entry) => entry?.name === "@deepseek-ai/dsh-permission-presets"
  || (["permission", "permission-presets"].includes(entry?.id) && !entry?.name);

/** Read YAML as data only. In particular, never evaluate Cordis !!js expressions. */
export function readPermissionConfig(text) {
  if (!text.trim()) return { pinned: false, config: {} };
  const doc = parseDocument(text, { customTags: [], maxAliasCount: 20 });
  if (doc.errors.length) throw Error(`권한 설정 YAML 을 파싱할 수 없습니다: ${doc.errors[0].message}`);
  const data = doc.toJS({ maxAliasCount: 20 });
  if (!Array.isArray(data)) return { pinned: false, config: {}, unsupported: true };
  // Cordis patch lists can contain several updates for one plugin; merge only this plugin's config.
  let config = {};
  for (const entry of data) {
    if (permissionEntry(entry) && entry.config && typeof entry.config === "object") {
      config = { ...config, ...entry.config, presets: { ...config.presets, ...entry.config.presets } };
    }
  }
  const pinned = typeof config.defaultPreset === "string" && /^[a-z][a-z-]*$/.test(config.defaultPreset);
  return { pinned, config };
}

/** Runtime default for future sessions, not a claim about every session's overrides. */
export function livePermissionState(ctx) {
  if (!ctx) return null;
  const service = ctx.get?.("permissionPresets");
  if (service) {
    const preset = service.defaultPreset;
    return { preset, ...service.resolve(preset), source: "runtime:permissionPresets" };
  }
  const sandbox = ctx.get?.("shell")?.sandboxMode;
  const approval = ctx.get?.("approval")?.config?.policy;
  if (sandbox && approval) return { sandbox, approval, source: "runtime:defaults" };
  return null;
}

export function permissionState(text, ctx) {
  let parsed, parseError = "";
  try { parsed = readPermissionConfig(text); }
  catch (error) { parseError = error.message; }
  const pinned = parsed?.pinned ?? false;
  let observed, runtimeError = "";
  try { observed = livePermissionState(ctx); }
  catch (error) { runtimeError = error.message; }
  const config = parsed?.config || {};
  const preset = config.defaultPreset;
  if (pinned && observed?.source === "runtime:defaults") observed = null;
  const staticSpec = typeof preset === "string" && !preset.startsWith("!!") ? config.presets?.[preset] : null;
  // A standalone CLI cannot resolve includes, !!js, runtime settings or environment values.
  // File evidence is explicitly labelled and never upgraded to a live observation.
  const literal = (value) => typeof value === "string" && /^[a-z][a-z-]*$/.test(value);
  if (!observed && !runtimeError && literal(preset) && literal(staticSpec?.sandbox) && literal(staticSpec?.approval)) {
    observed = { preset, sandbox: staticSpec.sandbox, approval: staticSpec.approval, source: "profile-file" };
  }
  const known = literal(observed?.sandbox) && literal(observed?.approval);
  const state = !known ? "unknown" : !full(observed) ? "broken" : pinned ? "ok" : "inferred";
  return {
    preset: observed?.preset || (pinned ? String(preset) : "(명시 설정 없음)"),
    sandbox: known ? observed.sandbox : "?",
    approval: known ? observed.approval : "?",
    source: observed?.source || "unobserved",
    scope: "profile-default", pinned, state, ok: state === "ok",
    error: [parseError, runtimeError].filter(Boolean).join("; "),
    note: state === "unknown" ? "실제 권한을 확인하지 못했습니다; 명시 설정이 없다고 해서 적용되지 않은 것은 아닙니다. 실행 중인 패널에서 다시 측정하세요. 권한은 자동으로 바꾸지 않습니다."
      : state === "inferred" ? "호스트가 현재 완전 접근 / never 로 추론합니다; 명시적으로 고정되지 않아 환경이나 설정이 바뀌면 결과가 달라질 수 있습니다."
      : state === "broken" ? "관찰된 기본 권한이 완전 접근 / never 가 아닙니다; 의도한 설정이라면 조정하지 않아도 됩니다."
      : observed.source === "profile-file" ? "profile 파일에 완전 접근 / never 가 명시되어 있습니다; 실행 중 인스턴스는 아직 대조하지 않았습니다."
      : "실행 중 인스턴스의 기본 권한이 완전 접근 / never 이고, profile 에도 명시 선택이 있습니다.",
  };
}
