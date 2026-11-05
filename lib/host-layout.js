import { readDesktopHandoff } from './desktop-handoff.js';
/** Read-only evidence: on-disk layout is not proof of loaded process code. */
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import { diskFs } from "./extract-asar.js";
import { desktopResourcesForHost, hostSurface } from "./instance.js";

export function hostLayoutEvidence(host, options = {}) {
  const reader = options.reader || diskFs();
  const argv = options.argv || process.argv;
  const execArgv = options.execArgv || process.execArgv;
  const resources = desktopResourcesForHost(host);
  const disk = { surface: hostSurface(host), archive_exists: null, unpacked_exists: null };
  const errors = [];
  const probe = (file, kind) => {
    try { return reader.statSync(file)[kind](); }
    catch (error) {
      if (error.code === "ENOENT") return false;
      errors.push({ code: error.code || "UNKNOWN", message: error.message });
      return null;
    }
  };
  if (resources) {
    disk.archive_exists = probe(path.join(resources, "app.asar"), "isFile");
    disk.unpacked_exists = probe(path.join(resources, "app"), "isDirectory");
  }
  // Never scan all argv strings: prompts or unrelated file arguments are not
  // process entry evidence. Do not return env, tokens or the full command line.
  const flags = [...execArgv, ...argv];
  let entry = "", source = "unknown";
  for (let i = 0; i < flags.length; i++) {
    if (flags[i]?.startsWith("--app-path=")) {
      entry = flags[i].slice(11); source = "app-path"; break;
    }
    if (flags[i] === "--app-path" && flags[i + 1]) {
      entry = flags[i + 1]; source = "app-path"; break;
    }
  }
  if (!entry && argv[1] && !argv[1].startsWith("-")) {
    entry = argv[1]; source = "script";
  }
  if (!entry) {
    // app.getAppPath is actual Electron entry evidence. resources/app existing
    // on disk alone cannot prove where this process was launched from.
    let appPath = options.appPath;
    if (appPath === undefined && process.versions.electron && process.type === "browser") {
      try { appPath = require("electron").app?.getAppPath(); } catch { /* retain unknown */ }
    }
    if (typeof appPath === "string" && path.isAbsolute(appPath)) {
      entry = appPath; source = "electron-app-path";
    }
  }
  const normalized = String(entry).replace(/\\/g, "/");
  const match = /^(.*\/resources)\/(app\.asar|app\.asar\.unpacked|app)(?:\/|$)/i.exec(normalized);
  let layout = "unknown", matches_target = null;
  if (match) {
    layout = match[2].toLowerCase() === "app.asar" ? "archive" : "unpacked";
    const normalize = value => {
      const v = path.normalize(value).replace(/\\/g, "/");
      return (options.platform || process.platform) === "win32" ? v.toLowerCase() : v;
    };
    // A known process entry does not identify an unknown selected target.
    // Keep this indeterminate rather than asserting a different installation.
    matches_target = resources ? normalize(match[1]) === normalize(resources) : null;
  } else { source = "unknown"; }
  const state = errors.length ? "unreadable"
    : matches_target === false ? "different_instance"
    : layout === "unknown" ? "unknown_runtime"
    : !resources ? "unknown_target"
    : layout === "archive" ? "archive_entry" : "unpacked_entry";
  const notes = {
    unreadable: "디스크 레이아웃을 읽지 못했습니다; 현재 실행 버전을 확인할 수 없습니다.",
    different_instance: "현재 서비스 진입점이 선택한 대상 설치와 다릅니다; 이 프로세스로 대상이 로드되었다고 증명할 수 없습니다.",
    unknown_target: "현재 서비스 진입점은 확보했지만 선택한 대상 설치를 아직 찾지 못했습니다; 동일 인스턴스인지 판단할 수 없습니다.",
    unknown_runtime: "현재 서비스의 데스크톱 진입 증거를 얻지 못했습니다; 아카이브 존재 여부나 디스크 기록 횟수 모두 로드되었음을 증명하지 못합니다.",
    archive_entry: "현재 서비스 기동 진입점이 app.asar 를 가리킵니다; 이 증거는 디스크 디렉터리 내용이 로드되었다는 뜻이 아닙니다.",
    unpacked_entry: "현재 서비스 기동 진입점이 언팩 디렉터리를 가리킵니다; 진입점 위치만으로 이후 기록된 내용이 다시 로드되었다고 증명할 수 없습니다.",
  };
  return {
    state, disk,
    handoff: resources ? (readDesktopHandoff(path.join(resources, "app.asar"), options.platform) || {phase:"not_scheduled"}) : {phase:"unknown_target"},
    process: { pid: options.pid ?? process.pid, entry_layout: layout, source, matches_target },
    note: notes[state],
    ...(errors.length ? { errors } : {}),
  };
}
