import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { isAsarSealedPath } from "./desktop.js";
import { diskFs, fsFor } from "./extract-asar.js";

const MARK = "__dshPurgeHideConsole";
const IMPORT_MARK = "dsh-purge-hide-console";

function forceHideOptions(options) {
  if (options == null) return { windowsHide: true };
  if (typeof options !== "object") return options;
  if (options.windowsHide === true) return options;
  return { ...options, windowsHide: true };
}

function wrapSpawn(orig) {
  return function patchedSpawn(file, args, options) {
    if (args != null && !Array.isArray(args)) {
      return orig.call(this, file, forceHideOptions(args));
    }
    return orig.call(this, file, args ?? [], forceHideOptions(options));
  };
}

function wrapExecLike(orig) {
  return function patchedExec(command, options, callback) {
    if (typeof options === "function") {
      return orig.call(this, command, { windowsHide: true }, options);
    }
    return orig.call(this, command, forceHideOptions(options), callback);
  };
}

function wrapExecFile(orig) {
  return function patchedExecFile(file, args, options, callback) {
    if (typeof args === "function") {
      return orig.call(this, file, forceHideOptions(undefined), args);
    }
    if (args != null && !Array.isArray(args)) {
      return orig.call(this, file, forceHideOptions(args), options);
    }
    if (typeof options === "function") {
      return orig.call(this, file, args, { windowsHide: true }, options);
    }
    return orig.call(this, file, args, forceHideOptions(options), callback);
  };
}

function wrapFork(orig) {
  return function patchedFork(modulePath, args, options) {
    if (args != null && !Array.isArray(args)) {
      return orig.call(this, modulePath, forceHideOptions(args));
    }
    return orig.call(this, modulePath, args, forceHideOptions(options));
  };
}

export function isElectronHost(versions = process.versions) {
  return Boolean(versions && versions.electron);
}

/**
 * Windows 비 Electron: builtin 을 패키징해 자식 프로세스에 windowsHide 를 준다.
 * Electron(공식 데스크톱 / 서드파티 DSH Desktop)은 이 구간을 건너뛴다.
 * macOS, Linux, Kali 는 win32 가 아니므로 호출 측에서 바로 건너뛴다.
 * 더 이상 registerHooks 로 node:child_process 를 단락시키지 않는다(#46).
 */
export function hideConsoleDecision(platform = process.platform, versions = process.versions) {
  if (platform !== "win32") return "not_win32";
  if (isElectronHost(versions)) return "electron_host";
  return "wrap_builtin";
}

export function installChildProcessImportHook() {
  // #46: Node 24 가 node:child_process 를 facade 로 단락시키면,
  // CJS require 가 loadBuiltinWithHooks 안에서 undefined.exports 를 읽게 된다.
  // Windows / macOS / Linux 모두 이 resolve 훅을 더 이상 등록하지 않는다.
  return { ok: true, skipped: "no_builtin_short_circuit" };
}

function builtinChildProcess() {
  try {
    if (typeof process.getBuiltinModule === "function") {
      const cp = process.getBuiltinModule("child_process");
      if (cp && typeof cp.spawn === "function") return cp;
    }
  } catch {
    /* Electron 샌드박스에서 getBuiltinModule 이 던질 수 있어, 아래에서 require 를 다시 시도한다 */
  }
  try {
    const cp = createRequire(import.meta.url)("node:child_process");
    if (cp && typeof cp.spawn === "function") return cp;
  } catch {
    return null;
  }
  return null;
}

export function installHideConsole() {
  const decision = hideConsoleDecision();
  if (decision !== "wrap_builtin") return { ok: true, skipped: decision };
  const hook = installChildProcessImportHook();
  const cp = builtinChildProcess();
  if (!cp) return { ok: true, skipped: "builtin_unavailable", hook };
  if (cp[MARK]) return { ok: true, already: true, hook };

  cp.spawn = wrapSpawn(cp.spawn);
  cp.spawnSync = wrapSpawn(cp.spawnSync);
  cp.exec = wrapExecLike(cp.exec);
  cp.execSync = wrapExecLike(cp.execSync);
  cp.execFile = wrapExecFile(cp.execFile);
  cp.execFileSync = wrapExecFile(cp.execFileSync);
  if (typeof cp.fork === "function") cp.fork = wrapFork(cp.fork);

  Object.defineProperty(cp, MARK, { value: true, enumerable: false });
  return { ok: true, patched: true, hook };
}

export function hideConsoleEntrySource() {
  return `// ${IMPORT_MARK} — auto-installed by dsh-purge; do not edit
const MARK = ${JSON.stringify(MARK)};

const isElectron = typeof process.versions !== "undefined" && !!process.versions.electron;
const cp = !isElectron && process.platform === "win32" && typeof process.getBuiltinModule === "function"
  ? process.getBuiltinModule("child_process")
  : null;
if (cp && typeof cp.spawn === "function" && !cp[MARK]) {
  const hide = (options) => {
    if (options == null) return { windowsHide: true };
    if (typeof options !== "object") return options;
    if (options.windowsHide === true) return options;
    return { ...options, windowsHide: true };
  };
  const wrapSpawn = (orig) => function (file, args, options) {
    if (args != null && !Array.isArray(args)) return orig.call(this, file, hide(args));
    return orig.call(this, file, args ?? [], hide(options));
  };
  const wrapExec = (orig) => function (command, options, callback) {
    if (typeof options === "function") return orig.call(this, command, { windowsHide: true }, options);
    return orig.call(this, command, hide(options), callback);
  };
  const wrapExecFile = (orig) => function (file, args, options, callback) {
    if (typeof args === "function") return orig.call(this, file, hide(undefined), args);
    if (args != null && !Array.isArray(args)) return orig.call(this, file, hide(args), options);
    if (typeof options === "function") return orig.call(this, file, args, { windowsHide: true }, options);
    return orig.call(this, file, args, hide(options), callback);
  };
  const wrapFork = (orig) => function (modulePath, args, options) {
    if (args != null && !Array.isArray(args)) return orig.call(this, modulePath, hide(args));
    return orig.call(this, modulePath, args, hide(options));
  };
  cp.spawn = wrapSpawn(cp.spawn);
  cp.spawnSync = wrapSpawn(cp.spawnSync);
  cp.exec = wrapExec(cp.exec);
  cp.execSync = wrapExec(cp.execSync);
  cp.execFile = wrapExecFile(cp.execFile);
  cp.execFileSync = wrapExecFile(cp.execFileSync);
  if (typeof cp.fork === "function") cp.fork = wrapFork(cp.fork);
  Object.defineProperty(cp, MARK, { value: true, enumerable: false });
}
`;
}

function requirePath() {
  return createRequire(import.meta.url)("node:path");
}

function ioFor(explicit, targetPath) {
  return explicit ?? fsFor(targetPath);
}

/** 소스 monorepo 의 apps/cli(tsdown 빌드 산출물). 여기에 주입/복원하면 빌드 출력을 건드리게 되고, bak 이 없으면 스스로 복구할 수 없다(#41). */
export function looksLikeSourceCliRoot(root, { fs, path: nodePath } = {}) {
  const p = nodePath ?? requirePath();
  if (!root) return false;
  const n = String(root).replace(/\\/g, "/").toLowerCase();
  if (/\/apps\/cli\/?$/.test(n)) return true;
  if (/\/node_modules\//.test(n)) return false;
  try {
    const nodeFs = ioFor(fs, root);
    const libDir = p.join(root, "lib");
    if (nodeFs.existsSync(p.join(libDir, "tsconfig.tsbuildinfo"))) return true;
    if (nodeFs.existsSync(p.join(root, "tsdown.config.ts")) || nodeFs.existsSync(p.join(root, "tsdown.config.mjs"))) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function resolveDshBinRoot(hint, { fs, path: nodePath } = {}) {
  const p = nodePath ?? requirePath();
  const tries = [];
  const push = (x) => {
    if (x && !tries.includes(x)) tries.push(x);
  };
  if (hint) {
    push(hint);
    push(p.join(hint, "dsh"));
    push(p.join(hint, "@deepseek-ai", "dsh"));
    if (p.basename(hint) === "@deepseek-ai") {
      push(p.dirname(hint));
      push(p.join(p.dirname(hint), "dsh"));
      push(p.dirname(p.dirname(hint)));
    }
    if (p.basename(hint) === "dsh") push(hint);
  }
  if (typeof process.argv[1] === "string" && /[\\/]bin\.js$/i.test(process.argv[1])) {
    push(p.dirname(p.dirname(process.argv[1])));
  }
  for (const root of tries) {
    try {
      const binJs = p.join(root, "lib", "bin.js");
      if (isAsarSealedPath(root) || isAsarSealedPath(binJs)) continue;
      // 소스 트리는 탐색 후보의 마지막 수단이다; node_modules 패키지를 우선해 apps/cli/lib 를 고쳐 쓰지 않는다(#41).
      if (looksLikeSourceCliRoot(root, { fs, path: p })) continue;
      if (ioFor(fs, binJs).existsSync(binJs)) return p.normalize(root);
    } catch {}
  }
  // 패키지 설치 경로가 없을 때만 argv 가 가리키는 소스 cli 로 폴백한다(주입은 여전히 금지, installHideConsoleIntoBin 참고).
  for (const root of tries) {
    try {
      const binJs = p.join(root, "lib", "bin.js");
      if (isAsarSealedPath(root) || isAsarSealedPath(binJs)) continue;
      if (ioFor(fs, binJs).existsSync(binJs)) return p.normalize(root);
    } catch {}
  }
  return null;
}

const IMPORT_LINE = `import "./${IMPORT_MARK}.js"; // [dsh-purge] hide-console`;

export function installHideConsoleIntoBin(aiBase, { fs, path: nodePath } = {}) {
  if (process.platform !== "win32") return "skipped_not_win32";
  const p = nodePath ?? requirePath();
  const root = resolveDshBinRoot(aiBase, { fs, path: p });
  if (!root) return "missing_bin";
  // 소스 배포의 apps/cli/lib 는 tsdown 산출물이다: 읽기만 허용하고 sidecar 쓰기 / bin.js 수정은 금지한다(#41).
  if (looksLikeSourceCliRoot(root, { fs, path: p })) return "skipped_source_cli";
  const nodeFs = ioFor(fs, root);
  const binJs = p.join(root, "lib", "bin.js");
  const side = p.join(root, "lib", `${IMPORT_MARK}.js`);
  const facadeSide = p.join(root, "lib", "dsh-purge-child-process-hide.mjs");
  if (isAsarSealedPath(root) || isAsarSealedPath(binJs)) return "sealed_asar";

  const facadeSrc = diskFs().readFileSync(
    fileURLToPath(new URL("./child-process-hide.mjs", import.meta.url)),
    "utf8",
  );
  nodeFs.writeFileSync(facadeSide, facadeSrc, "utf8");
  nodeFs.writeFileSync(side, hideConsoleEntrySource(), "utf8");

  let text = nodeFs.readFileSync(binJs, "utf8");
  if (text.includes(IMPORT_MARK) && text.includes(IMPORT_LINE.split(" //")[0])) {
    return "already_injected";
  }
  text = text.replace(/^import "\.\/dsh-purge-hide-console\.js";.*\r?\n/m, "");
  if (/^#!/.test(text)) {
    const nl = text.indexOf("\n");
    text =
      nl >= 0
        ? text.slice(0, nl + 1) + IMPORT_LINE + "\n" + text.slice(nl + 1)
        : text + "\n" + IMPORT_LINE + "\n";
  } else {
    text = IMPORT_LINE + "\n" + text;
  }
  nodeFs.writeFileSync(binJs, text, "utf8");
  return "injected";
}

export function revertHideConsoleFromBin(aiBase, { fs, path: nodePath } = {}) {
  const p = nodePath ?? requirePath();
  const root = resolveDshBinRoot(aiBase, { fs, path: p });
  if (!root) return "missing_bin";
  // 소스 cli: 이 플러그인이 남긴 sidecar 만 정리하고 bin.js 나 다른 빌드 산출물은 절대 고치거나 지우지 않는다(#41).
  const sourceCli = looksLikeSourceCliRoot(root, { fs, path: p });
  const nodeFs = ioFor(fs, root);
  const binJs = p.join(root, "lib", "bin.js");
  const side = p.join(root, "lib", `${IMPORT_MARK}.js`);
  const facadeSide = p.join(root, "lib", "dsh-purge-child-process-hide.mjs");
  let changed = false;
  if (!sourceCli && nodeFs.existsSync(binJs)) {
    try {
      const text = nodeFs.readFileSync(binJs, "utf8");
      const next = text.replace(/^import "\.\/dsh-purge-hide-console\.js";.*\r?\n/gm, "");
      if (next !== text) {
        nodeFs.writeFileSync(binJs, next, "utf8");
        changed = true;
      }
    } catch (e) {
      return `error:${e}`;
    }
  }
  for (const fp of [side, facadeSide]) {
    try {
      if (nodeFs.existsSync(fp)) {
        nodeFs.unlinkSync(fp);
        changed = true;
      }
    } catch {
      // 재시작한 뒤에 삭제한다
    }
  }
  return changed ? "reverted" : "absent";
}

installHideConsole();
