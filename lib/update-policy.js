/** Independent update preferences and scheduler. Never applies host patches or restarts. */
import fs from "node:fs";
import {normalizeMirror} from "./update-mirror.js";
import path from "node:path";
import {protectSecretFile,writeSecretFile} from "./update-secrets.js";
import { atomicWriteSync } from "./core.js";

const prefFields = new Set(["autoCheck", "autoInstall", "intervalHours"]);
const channelFields = new Set(["proxyUrl", "githubToken", "clearGithubToken", "mirrorUrl"]);
const fields = new Set([...prefFields, ...channelFields]);
const prefPath = (home) =>
  path.join(home, "dsh-purge", "update-preferences.json");
// 업데이트 채널의 프록시와 키는 따로 기록한다: 네트워크 자격 증명이므로
// "자동 확인/설치" 같은 동작 선호와 분리해, 사용자가 따로 백업하거나 제외하기 쉽게 한다.
const channelPath = (home) =>
  path.join(home, "dsh-purge", "update-channel.json");
const statePath = (home) => path.join(home, "dsh-purge", "update-status.json");
function read(file, sensitive=false) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return null;
    if(sensitive) throw Error(`업데이트 키 설정을 읽지 못했습니다(${e instanceof SyntaxError?'JSON 형식 손상':String(e.code || 'READ_FAILED').replace(/[^A-Z0-9_]/g,'')}). 파일 형식이나 읽기 권한을 확인하세요`);
    throw Error(`업데이트 설정/상태를 읽지 못했습니다: ${e.message}`);
  }
}
/** 별도 파일의 채널 설정. 파일이 없으면 기존 업데이트 환경을 그대로 물려받는다. */
export function channelSettings(home) {
  protectSecretFile(channelPath(home));
  const saved = read(channelPath(home),true) || {};
  const value = {
    mirrorUrl: normalizeMirror(saved.mirrorUrl ?? ""),
    proxyUrl: typeof saved.proxyUrl === "string" ? saved.proxyUrl : "",
    githubToken: typeof saved.githubToken === "string" ? saved.githubToken : "",
  };
  validateChannel(value);
  return value;
}
export function preferences(home, legacy = {}) {
  const saved = read(prefPath(home));
  const channel = channelSettings(home);
  const value = {
    autoCheck: legacy.autoCheckUpdates !== false,
    autoInstall: legacy.autoUpdateOnStart === true,
    intervalHours: legacy.updateCheckIntervalHours ?? 6,
    ...(saved || {}),
    proxyUrl: channel.proxyUrl,
    mirrorUrl: channel.mirrorUrl,
    githubToken: channel.githubToken,
  };
  validate(value);
  return {
    autoCheck: value.autoCheck,
    autoInstall: value.autoInstall,
    intervalHours: value.intervalHours,
    proxyUrl: value.proxyUrl,
    mirrorUrl: value.mirrorUrl,
    githubToken: value.githubToken,
  };
}
function validateChannel(value) {
  normalizeMirror(value.mirrorUrl ?? "");
  if (typeof value.proxyUrl !== "string")
    throw Error("업데이트 프록시는 문자열이어야 합니다");
  if (value.proxyUrl.trim()) {
    let parsed;
    try {
      parsed = new URL(value.proxyUrl.trim());
    } catch {
      throw Error("업데이트 프록시 주소가 올바르지 않습니다. 예: http://127.0.0.1:7890 또는 socks5://127.0.0.1:1080");
    }
    if (!["http:", "https:", "socks5:", "socks5h:", "socks:"].includes(parsed.protocol))
      throw Error("업데이트 프록시는 http / https / socks5 프로토콜만 지원합니다");
    if (!parsed.hostname) throw Error("업데이트 프록시에 호스트 이름이 없습니다");
  }
  if (typeof value.githubToken !== "string")
    throw Error("GitHub 키는 문자열이어야 합니다");
  if (value.githubToken.trim() && !/^[A-Za-z0-9_-]{20,255}$/.test(value.githubToken.trim()))
    throw Error("GitHub 키 형식이 올바르지 않습니다(20–255 자 영숫자, 공백 없음)");
}
function validate(value) {
  if (
    typeof value.autoCheck !== "boolean" ||
    typeof value.autoInstall !== "boolean"
  )
    throw Error("자동 확인과 자동 설치는 스위치 값이어야 합니다");
  if (
    !Number.isInteger(value.intervalHours) ||
    value.intervalHours < 1 ||
    value.intervalHours > 168
  )
    throw Error("확인 간격은 1–168 시간 범위의 정수여야 합니다");
  validateChannel(value);
}
/** 업데이트 채널 전용 환경 변수: 업데이트 요청에만 영향을 주고 호스트 프로세스 환경은 바꾸지 않는다. */
export function updateEnv(home, legacy = {}, inherited = process.env) {
  const value = preferences(home, legacy);
  const env = {...inherited};
  // A saved blank mirror explicitly disables an inherited mirror; absent old
  // settings preserve the previous environment behaviour.
  const channel = read(channelPath(home), true);
  if (channel && Object.hasOwn(channel, 'mirrorUrl')) env.PURGE_GH_MIRROR = value.mirrorUrl;
  if (value.proxyUrl) env.PURGE_HTTPS_PROXY = value.proxyUrl.trim();
  if (value.githubToken) env.GITHUB_TOKEN = value.githubToken.trim();
  return env;
}
export function publicPreferences(value) {
  let proxyUrl=value.proxyUrl;
  let hasProxyCredentials=false;
  if(proxyUrl) {
    const url=new URL(proxyUrl);
    hasProxyCredentials=Boolean(url.username || url.password);
    if(hasProxyCredentials){url.username='';url.password='';proxyUrl=url.href;}
  }
  return {...value,proxyUrl,githubToken:'',hasGithubToken:Boolean(value.githubToken),hasProxyCredentials};
}

function writeChannel(file,value) {
  writeSecretFile(file,JSON.stringify(value,null,2)+'\n');
}
export function savePreferences(home, patch, legacy = {}) {
  if (
    !patch ||
    typeof patch !== "object" ||
    Array.isArray(patch) ||
    Object.keys(patch).some((k) => !fields.has(k))
  )
    throw Error("업데이트 설정에 알 수 없는 필드가 있습니다");
  const current = preferences(home, legacy);
  const next = { ...patch };
  // 삭제 스위치는 불리언 참값만 인정한다: "yes"/1 같은 값을 넘기면 오류여야 하며, 아니면 화면에
  // "지우기를 눌렀는데 키가 남아 있다"는 조용한 실패가 생긴다.
  if ("clearGithubToken" in next && typeof next.clearGithubToken !== "boolean")
    throw Error("키 삭제 스위치는 불리언이어야 합니다");
  // 키는 화면에 되돌려 주지 않으므로 빈 문자열은 "기존 값 유지"를 뜻한다. 명시적 삭제는 clearGithubToken 을 쓴다.
  if (next.githubToken === "" || next.githubToken === undefined)
    delete next.githubToken;
  const value = { ...current, ...next };
  if (patch.clearGithubToken === true) value.githubToken = "";
  delete value.clearGithubToken;
  validate(value);
  // 동작 선호와 채널 자격 증명은 따로 기록한다: 해당 필드가 실제로 바뀌었을 때만 그 파일을 쓰고,
  // "자동 확인 간격만 바꿨다"는 이유로 키가 들어 있는 파일을 다시 쓰지 않는다.
  const prefTouched = Object.keys(patch).some((k) => prefFields.has(k));
  const channelTouched = Object.keys(patch).some((k) => channelFields.has(k));
  if (channelTouched)
    writeChannel(channelPath(home),{...read(channelPath(home),true),proxyUrl:value.proxyUrl.trim(),githubToken:value.githubToken.trim(),...(Object.hasOwn(patch,"mirrorUrl")?{mirrorUrl:normalizeMirror(value.mirrorUrl)}:{})});
  if (prefTouched || !channelTouched)
    atomicWriteSync(
      prefPath(home),
      JSON.stringify(
        { autoCheck: value.autoCheck, autoInstall: value.autoInstall, intervalHours: value.intervalHours },
        null,
        2,
      ) + "\n",
    );
  return value;
}
export function updateStatus(home) {
  return read(statePath(home)) || {};
}

// Reconcile only the current instance. Disk evidence must come from its logical
// profile path (not an old pnpm-store path retained by the loaded module).
export function reconcileUpdateStatus(state, runningVersion, installedVersion) {
  const valid = (v) => typeof v === "string" && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(v);
  if (!valid(runningVersion) || !valid(installedVersion))
    throw Error("현재 실행 버전이나 디스크 설치 버전을 확인할 수 없어 재시작 대기 기록을 지우지 않았습니다");
  const next = { ...state, runningVersion, installedVersion, reconciliationError: "" };
  if (installedVersion !== runningVersion) {
    // Includes both upgrades and rollbacks. Do not let an old process install
    // again over a newer (or deliberately rolled-back) on-disk package.
    next.pendingVersion = installedVersion;
    next.restartRequired = true;
  } else {
    if (state.pendingVersion || state.restartRequired) {
      next.lastPendingVersion = state.pendingVersion || "";
      next.pendingResolution = state.pendingVersion === runningVersion ? "loaded" : "replaced";
    }
    next.pendingVersion = "";
    next.restartRequired = false;
  }
  // installError/targets are intentionally retained, even after a restart or
  // successful metadata check: one profile loading says nothing about others.
  return next;
}

export function createUpdateController({
  home,
  legacy = {},
  runningVersion,
  readInstalledVersion,
  check,
  install,
  now = Date.now,
  timers = { setTimeout, clearTimeout },
  onResult = () => {},
}) {
  let active = false,
    timer,
    inflight = null;
  const settings = () => preferences(home, legacy);
  const record = (value) => {
    const result = { ...updateStatus(home), ...value };
    atomicWriteSync(statePath(home), JSON.stringify(result, null, 2) + "\n");
    onResult(result);
    return result;
  };
  function status() {
    const state = updateStatus(home);
    try {
      return reconcileUpdateStatus(state, runningVersion, readInstalledVersion());
    } catch (e) {
      return { ...state, runningVersion, installedVersion: "", reconciliationError: e.message };
    }
  }
  function reconcile() {
    const next = status();
    if (JSON.stringify(next) !== JSON.stringify(updateStatus(home))) record(next);
    return next;
  }
  async function run() {
    if (!active || inflight) return inflight;
    inflight = (async () => {
      try {
        reconcile();
        if (!settings().autoCheck) return;
        const result = await check();
        if (!active) return;
        record({
          checkedAt: new Date(now()).toISOString(),
          availableVersion: result.remoteVersion || "",
          hasUpdate: !!result.hasUpdate,
          error: result.ok === false ? result.error || "업데이트 확인 실패" : updateStatus(home).installError || "",
        });
        if (result.ok === false) return;
        // Read again after network I/O: disabling either switch cancels installation.
        const current = settings(),
          state = reconcile();
        if (
          !current.autoCheck ||
          !current.autoInstall ||
          !result.hasUpdate ||
          result.pinned ||
          (result.channel && result.channel !== "stable")
        )
          return;
        if (state.reconciliationError) return;
        if (state.restartRequired && !(result.retryIncomplete && result.remoteVersion === state.pendingVersion)) return;
        let installed;
        try { installed = await install(result); }
        catch (e) {
          record({ error: e.message, installError: e.message });
          return;
        }
        if (installed?.applied) {
          // Persist even if disposed during installation: a new context must not install twice.
          record({
            pendingVersion:
              installed.release?.version ||
              installed.localVersion ||
              result.remoteVersion,
            installedAt: new Date(now()).toISOString(),
            hasUpdate: installed.ok === false,
            targets: installed.targets || [],
            restartRequired: true,
            installError: installed.ok === false ? installed.error || "일부 대상 업데이트 실패. 유지보수 기록을 확인하세요" : "",
            error:
              installed.ok === false
                ? installed.error || "일부 대상 업데이트 실패. 유지보수 기록을 확인하세요"
                : "",
          });
        } else if (installed?.ok === false)
          record({ error: installed.error || "자동 설치 실패, 백업을 보존했습니다", installError: installed.error || "자동 설치 실패, 백업을 보존했습니다", targets: installed.targets || [] });
      } catch (e) {
        if (active) {
          try {
            record({ error: e.message });
          } catch {
            onResult({ error: e.message });
          }
        }
      }
    })().finally(() => {
      inflight = null;
    });
    return inflight;
  }
  function schedule(delay) {
    timers.clearTimeout(timer);
    if (!active) return;
    let p;
    try {
      p = settings();
    } catch (e) {
      onResult({ error: e.message });
    }
    if (p && !p.autoCheck) return;
    timer = timers.setTimeout(
      async () => {
        await run();
        schedule();
      },
      delay ?? (p?.intervalHours || 6) * 3600000,
    );
    timer?.unref?.();
  }
  return {
    start() {
      if (active) return;
      active = true;
      try {
        reconcile();
      } catch (e) {
        onResult({ error: e.message });
      }
      schedule(30000);
    },
    refresh() {
      schedule(30000);
    },
    stop() {
      active = false;
      timers.clearTimeout(timer);
    },
    run,
    status,
    settings,
  };
}
