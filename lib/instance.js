/** Instance-local maintenance discovery. No PATH or other-app/global desktop scan. */
import fs from "node:fs";
import { desktopCliFromResources, desktopPackageManager } from "./desktop-cli.js";
import path from "node:path";
import { diskFs } from "./extract-asar.js";
import { desktopIdentity } from "./desktop-identity.js";

function canonical(file, reader) {
  try {
    return reader.realpathSync(file);
  } catch {
    return path.resolve(file);
  }
}
function directory(file, reader) {
  try {
    return reader.statSync(file).isDirectory();
  } catch {
    return false;
  }
}
function profileName(name) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name || ""))
    throw Error("profile 이름이 올바르지 않습니다");
  return name;
}
export function resolveProfile(home, options = {}) {
  const {
    env = process.env,
    argv = process.argv,
    reader = fs,
    profile,
  } = options;
  if (!home) throw Error("DSH_HOME 이 정해지지 않아 현재 profile 을 찾을 수 없습니다");
  const root = canonical(
    path.join(canonical(home, reader), "profiles"),
    reader,
  );
  const select = (value, source, isPath = false) => {
    const dir = isPath
      ? path.resolve(value)
      : path.join(root, profileName(value));
    if (!directory(dir, reader))
      throw Error(`${source} 가 지정한 profile 을 찾지 못했습니다: ${dir}`);
    return {
      directory: canonical(dir, reader),
      name: path.basename(dir),
      source,
    };
  };
  if (profile) return select(profile, "명시적 인자", path.isAbsolute(profile));
  if (env.PURGE_PROFILE_DIR)
    return select(env.PURGE_PROFILE_DIR, "PURGE_PROFILE_DIR", true);
  const paths = [
    ...new Set(
      argv.filter(
        (arg) =>
          typeof arg === "string" &&
          path.isAbsolute(arg) &&
          canonical(path.dirname(arg), reader) === root,
      ),
    ),
  ];
  if (paths.length > 1)
    throw Error("시작 인자에 profile 디렉터리가 여러 개 있어 현재 인스턴스를 정할 수 없습니다");
  if (paths.length) return select(paths[0], "호스트 시작 인자", true);
  if (
    argv.some(
      (arg) =>
        typeof arg === "string" &&
        path.isAbsolute(arg) &&
        /[\\/]profiles[\\/][^\\/]+$/.test(arg),
    )
  ) {
    throw Error(
      "호스트 시작 인자에 있는 profile 이 현재 DSH_HOME 에 속하지 않습니다; 서비스 환경을 확인하고, 다른 디렉터리는 선택하지 않았습니다",
    );
  }

  const flags = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--profile") {
      if (!argv[i + 1] || argv[i + 1].startsWith("--"))
        throw Error("--profile 에 이름이 빠졌습니다");
      flags.push(argv[++i]);
    } else if (argv[i]?.startsWith("--profile=")) flags.push(argv[i].slice(10));
  }
  if (new Set(flags).size > 1)
    throw Error("시작 인자에 --profile 이 여러 번 있어 현재 인스턴스를 정할 수 없습니다");
  if (flags.length) return select(flags[0], "--profile");
  // The official npm CLI also accepts `dsh web` / `dsh <custom-profile>`.
  // Only trust this positional argument at a verified DSH entry, never at an
  // arbitrary plugin script whose first argument may be a maintenance command.
  const shorthand = argv[2];
  const launch = packageAbove(argv[1], reader);
  const launchBin = typeof launch?.meta.bin === "string" ? launch.meta.bin : launch?.meta.bin?.dsh;
  if (
    typeof shorthand === "string" &&
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(shorthand) &&
    shorthand !== "plugin" &&
    launch?.meta.name === "@deepseek-ai/dsh" &&
    launchBin &&
    canonical(argv[1], reader) === canonical(path.resolve(launch.root, launchBin), reader)
  ) return select(shorthand, "DSH profile 약칭");
  if (env.DSH_PROFILE) return select(env.DSH_PROFILE, "DSH_PROFILE");
  let candidates = [];
  try {
    candidates = reader
      .readdirSync(root, { withFileTypes: true })
      .filter(
        (e) =>
          (e.isDirectory() ||
            (e.isSymbolicLink() &&
              directory(path.join(root, e.name), reader))) &&
          /^[a-zA-Z0-9]/.test(e.name) &&
          e.name !== "node_modules" &&
          reader.existsSync(path.join(root, e.name, "package.json")),
      )
      .map((e) => e.name);
  } catch {}
  if (candidates.length === 1)
    return select(candidates[0], "초기화된 유일한 profile");
  throw Error(
    `현재 profile 을 하나로 정할 수 없습니다${candidates.length ? " (" + candidates.join(", ") + ")" : ""}; --profile 을 넘기거나 DSH_PROFILE / PURGE_PROFILE_DIR 을 설정하세요`,
  );
}

function packageAbove(file, reader) {
  if (!file) return null;
  let dir = path.dirname(canonical(file, reader));
  for (let i = 0; i < 8; i++) {
    try {
      const meta = JSON.parse(
        reader.readFileSync(path.join(dir, "package.json"), "utf8"),
      );
      if (
        ["@deepseek-ai/dsh", "@deepseek-ai/dsh-desktop-host"].includes(
          meta.name,
        )
      )
        return { root: dir, meta };
    } catch {}
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
// Published installs use a scope/dsh directory. A workspace link resolves to
// apps/cli instead; its parent is not an npm scope and can contain other apps.
function installationOf(pkg) {
  const parent = path.dirname(pkg.root);
  if (pkg.meta.name === "@deepseek-ai/dsh" &&
      !(path.basename(parent) === "@deepseek-ai" && path.basename(pkg.root) === "dsh")) {
    return pkg.root;
  }
  return parent;
}
/**
 * 플러그인 루트가 실제로 쓸 수 있는지 탐지한다.
 * "경로 없음"만 부재로 본다; EACCES / EIO / EPERM 같은 읽기 예외는 원인을 그대로 올려보내야 하고,
 * 그렇지 않으면 상위 계층은 "미확인"으로만 보고해 실제로 설치되지 않은 상황과 섞인다.
 */
export function probeAiBase(base, reader = fs) {
  if (!base) return { usable: false, reason: "empty", code: "" };
  try {
    const ok = reader
      .statSync(path.join(base, "dsh-agent-instructions", "lib"))
      .isDirectory();
    return ok
      ? { usable: true, reason: "", code: "" }
      : { usable: false, reason: "missing", code: "" };
  } catch (error) {
    const code = error && error.code ? String(error.code) : "";
    if (code === "ENOENT" || code === "ENOTDIR")
      return { usable: false, reason: "missing", code };
    return {
      usable: false,
      reason: "unreadable",
      code,
      error: String(error && error.message ? error.message : error),
    };
  }
}
function usableAiBase(base, reader = fs) {
  return probeAiBase(base, reader).usable;
}
export function desktopResourcesForHost(host) {
  const normalized = String(host || "").replace(/\\/g, "/");
  const match =
    /^(.*\/resources)\/(?:app|app\.asar|app\.asar\.unpacked)\/(?:dsh\/)?node_modules\/@deepseek-ai\/?$/i.exec(
      normalized,
    );
  return match ? path.normalize(match[1]) : "";
}
export function hostSurface(host) {
  if (!host) return "unknown";
  if (desktopResourcesForHost(host)) return "desktop";
  for (const pkg of ["dsh", "dsh-agent-loop", "dsh-system-prompt"]) {
    if (fs.existsSync(path.join(host, pkg, "package.json"))) return "web";
  }
  return "unknown";
}
/** Resolve only known shapes below the selected installation, never PATH/global scans.
 * The result is for component inspection; currentHost remains the installation
 * root so maintenance can still locate the owning package's CLI.
 */
export function normalizeHostBase(base, reader = fs) {
  if (!base) return "";
  const start = canonical(base, reader);
  const candidates = [
    start,
    path.join(start, "node_modules", "@deepseek-ai"),
    path.join(start, "dsh", "node_modules", "@deepseek-ai"),
  ];
  for (const candidate of candidates) {
    // A partial installation stays on its own root and is diagnosed as partial.
    // Requiring all components here would hide missing files behind another root.
    if (["dsh-agent-loop", "dsh-system-prompt", "dsh-agent-instructions"].some(pkg => {
      try { return reader.statSync(path.join(candidate, pkg, "package.json")).isFile(); }
      catch { return false; }
    })) return canonical(candidate, reader);
  }
  return start;
}

export function currentHost(options = {}) {
  const { env = process.env, argv = process.argv, reader = fs } = options;
  if (options.aiBase) return canonical(options.aiBase, reader);
  if (env.DSH_BASE) return canonical(env.DSH_BASE, reader);
  // Explicit CLI means that installation, not an unrelated global/npm binary.
  if (env.PURGE_DSH_CLI) {
    const found = packageAbove(env.PURGE_DSH_CLI, reader);
    if (found) return installationOf(found);
    // Desktop's shipped shell launcher lives under Resources/runtime/cli/bin.
    const launcher = canonical(env.PURGE_DSH_CLI, reader).replace(/\\/g, "/");
    const resources = /^(.*\/resources)\/runtime\/cli\/bin\/dsh$/i.exec(
      launcher,
    )?.[1];
    if (resources) {
      for (const layout of ["app.asar", "app.asar.unpacked", "app"]) {
        const candidate = path.join(
          resources,
          layout,
          "dsh/node_modules/@deepseek-ai",
        );
        if (directory(candidate, reader)) return canonical(candidate, reader);
      }
    }
    return "";
  }
  const running = packageAbove(argv[1], reader);
  return running ? installationOf(running) : "";
}

/**
 * 허용되는 유일한 인스턴스 해석 진입점: 명시적 선택자(DSH_BASE / PURGE_DSH_CLI) → 현재 프로세스 진입점.
 * DSH_HOME, npm prefix, shim 디렉터리, 다른 설치를 절대 스캔하지 않는다 — 그러면 다른 인스턴스 상태가
 * 현재 인스턴스로 표시되고, 그 상태로 패치를 쓰게 된다.
 */
export function resolveInstance(options = {}) {
  const env = options.env || process.env;
  const reader = options.reader || fs;
  const empty = {
    host: "",
    candidate: "",
    source: "unresolved",
    surface: "unknown",
    family: "",
    resolved: false,
    reason: "현재 인스턴스를 확인하지 못했습니다; DSH_BASE / PURGE_DSH_CLI 로 직접 지정할 수 있으며, 다른 설치는 스캔하지 않습니다",
  };
  const describe = (host, source) => {
    const base = normalizeHostBase(host, reader);
    const resources = desktopResourcesForHost(base);
    let family = "";
    try {
      family = resources ? (desktopIdentity(resources) || {}).kind || "" : "";
    } catch {
      family = "";
    }
    const probe = probeAiBase(base, reader);
    const resolved = probe.usable;
    // 대상 디렉터리가 있어도 컴포넌트가 온전하지 않으면 그대로 넘긴다: 상위가 "누락"으로 보고하게 하고,
    // 빈 문자열로 지워 "미확인"으로 되돌리지 않는다. 그러지 않으면 status/diagnose 는 대상을 얻지 못하고
    // selfcheck 는 스스로 물리 경로를 다시 해석해 세 handler 의 판단이 갈린다.
    let present = false;
    try { present = reader.statSync(base).isDirectory(); } catch { present = false; }
    return {
      host: resolved || present ? base : "",
      candidate: base,
      source: resolved || present ? source : "unresolved",
      surface: hostSurface(base),
      family,
      resolved,
      reason: resolved
        ? ""
        : probe.reason === "unreadable"
          ? `${source} 가 가리키는 플러그인 루트를 읽을 수 없습니다(${probe.code || "IO 오류"}): ${probe.error}`
          : source + " 가 가리키는 디렉터리는 유효한 플러그인 루트가 아닙니다(dsh-agent-instructions/lib 필요)",
      probe: { reason: probe.reason, code: probe.code },
    };
  };
  // 명시적 선택자는 "어느 인스턴스를 고를지"만 담당하고, 선택 후의 물리 대상은 기존 진단 사슬을 따른다.
  // describe(raw) 를 그대로 쓰면 DSH_BASE 가 아카이브를 가리킬 때 호스트가 app.asar 에 남아,
  // status/diagnose 는 아카이브를, selfcheck 는 물리 app 을 읽어 두 근거가 충돌한다.
  // 여기서 선택을 느슨하게 하지 않고(잘못 지정하면 여전히 resolved:false), 다른 설치 스캔으로 되돌아가지도 않는다.
  const pinned = (raw, source) =>
    describe(diagnosticHost({ ...options, env, reader, diskReader: reader, aiBase: raw }) || raw, source);
  if (env.DSH_BASE && String(env.DSH_BASE).trim())
    return pinned(String(env.DSH_BASE).trim(), "DSH_BASE");
  if (env.PURGE_DSH_CLI && String(env.PURGE_DSH_CLI).trim()) {
    const cli = canonical(String(env.PURGE_DSH_CLI).trim(), reader);
    if (!reader.existsSync(cli))
      throw Error("PURGE_DSH_CLI 가 가리키는 파일이 없습니다: " + cli);
    const pkg = packageAbove(cli, reader);
    if (!pkg) throw Error("PURGE_DSH_CLI 가 @deepseek-ai/dsh 패키지 안에 있지 않습니다: " + cli);
    return pinned(installationOf(pkg), "PURGE_DSH_CLI");
  }
  const host = diagnosticHost({ ...options, env, reader });
  if (!host) return empty;
  // Partial or unreadable is still evidence about this selected installation.
  // Preserve its target, family and probe error just as for explicit selectors;
  // resolved remains false and no other installation is searched.
  return describe(host, "process-entry");
}

/** Diagnostics inspect physical files in the selected installation, never another app.
 * Keep currentHost() unchanged: it is also used by the installer/CLI launcher.
 */
export function diagnosticHost(options = {}) {
  const selected = currentHost(options);
  const reader = options.diskReader || diskFs();
  if (!selected) {
    const env = options.env || process.env;
    // An invalid explicit selector must never fall through to another host.
    if (options.aiBase || env.DSH_BASE || env.PURGE_DSH_CLI) return "";
    const resources = options.resourcesPath ?? process.resourcesPath;
    const electron = options.electron ?? process.versions.electron;
    // Read-only fallback for a packaged Electron main process (argv[1] may
    // only be --updated). Never scan PATH, neighboring apps or user installs.
    if (!electron || !resources || !path.isAbsolute(resources) || !desktopIdentity(resources)) return "";
    for (const layout of ["app", "app.asar.unpacked"]) {
      const root = path.join(resources, layout);
      let rootPresent = false;
      try { reader.statSync(root); rootPresent = true; }
      catch (error) {
        if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      }
      if (!rootPresent) continue;
      // app.asar 가 남아 있으면 app.asar.unpacked 는 아카이브의 우회 경로(네이티브 모듈)일 뿐 호스트 자체가 아니다.
      // 이때 호스트는 여전히 아카이브이므로 기대 대상은 언팩 이후의 app/ 이어야 한다. 그렇지 않으면
      // dsh-agent-instructions/lib 가 없는 우회 디렉터리를 호스트로 보고, 패널은 "미확인"만 표시하게 된다.
      if (layout === "app.asar.unpacked") {
        let sealed = false;
        try { sealed = reader.statSync(path.join(resources, "app.asar")).isFile(); }
        catch (error) { if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error; }
        if (sealed) continue;
      }
      // 기본 디렉터리가 있으면 그것이 이 설치의 권위 있는 대상이다. 컴포넌트가 빠져도 우회 디렉터리로 되돌지 않는다.
      // 그렇지 않으면 unpacked 의 불완전 사본이 "기본 app 에 뭔가 빠졌다"는 진단을 덮어버린다.
      const candidates = [path.join(root, "node_modules/@deepseek-ai"), path.join(root, "dsh/node_modules/@deepseek-ai")];
      for (const candidate of candidates) {
        let dir = false;
        try { dir = reader.statSync(candidate).isDirectory(); }
        catch (error) { if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error; }
        if (!dir) continue;
        const base = normalizeHostBase(candidate, reader);
        const probe = probeAiBase(base, reader);
        // 읽을 수 있고 온전하면 그것을 쓴다; 있지만 읽을 수 없거나 불완전하면 이 사본으로 고정하고 원인을 상위에 넘긴다.
        if (probe.usable || probe.reason === "unreadable") return base;
        return candidate;
      }
      // scope 전체가 없음: 이 layout 의 기대 경로를 주고 compatibility 가 no-host 로 보고하게 한다.
      return candidates[0];
    }
    // 두 디렉터리가 모두 없음(아카이브가 밀봉된 상태): 기대 경로.
    return path.join(resources, "app/node_modules/@deepseek-ai");
  }
  const normalized = selected.replace(/\\/g, "/");
  const archive = /^(.*\/resources)\/app\.asar\/((?:dsh\/)?node_modules\/@deepseek-ai)\/?$/i.exec(normalized);
  if (!archive) return normalizeHostBase(selected, reader);
  const roots = ["app", "app.asar.unpacked"].map(layout => path.join(archive[1], layout));
  const candidates = roots.map(root => path.join(root, archive[2]));
  // A partial app directory must not be replaced by a healthier sibling.
  for (const [index, candidate] of candidates.entries()) {
    try {
      // Even an incomplete extraction or a file occupying app/ is evidence of
      // this target; do not hide it by selecting the other directory.
      reader.statSync(roots[index]);
      return normalizeHostBase(candidate, reader);
    } catch (error) {
      if (!["ENOENT", "ENOTDIR"].includes(error.code)) return candidate;
    }
  }
  // No extraction yet: keep this same app's expected path, so missing files and
  // the sealed-archive warning remain errors rather than silently passing.
  return candidates[0];
}
function npmCli(host, reader) {
  // Accept outer scope, package root, or its exact nested component root. Never
  // climb arbitrary ancestors: a bad target must not select another installation.
  const roots = [host, path.join(host, "dsh")];
  if (path.basename(host) === "@deepseek-ai" &&
      path.basename(path.dirname(host)) === "node_modules" &&
      path.basename(path.dirname(path.dirname(host))) === "dsh") {
    roots.push(path.dirname(path.dirname(host)));
  }
  for (const root of roots) {
    let meta;
    try {
      meta = JSON.parse(reader.readFileSync(path.join(root, "package.json"), "utf8"));
    } catch (error) {
      if (["ENOENT", "ENOTDIR"].includes(error.code)) continue;
      throw error;
    }
    if (meta.name !== "@deepseek-ai/dsh") continue;
    const bin = typeof meta.bin === "string" ? meta.bin : meta.bin?.dsh;
    if (typeof bin !== "string" || !bin) return "";
    const cli = path.resolve(root, bin);
    const inside = (base, file) => {
      const relative = path.relative(base, file);
      return relative && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
    };
    if (!inside(root, cli)) return "";
    try {
      if (reader.statSync(cli).isFile() && inside(reader.realpathSync(root), reader.realpathSync(cli))) return cli;
    } catch (error) {
      if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
    }
    return ""; // The owning package has a broken bin. Never select a neighboring app.
  }
  return "";
}
export function resolveDshCli(options = {}) {
  const {
    env = process.env,
    argv = process.argv,
    reader = fs,
    execPath = process.execPath,
    resourcesPath = process.resourcesPath,
    platform = process.platform,
  } = options;
  let cli = "",
    source = "",
    desktop = false;
  if (env.PURGE_DSH_CLI) {
    cli = canonical(env.PURGE_DSH_CLI, reader);
    source = "PURGE_DSH_CLI";
    if (!reader.existsSync(cli))
      throw Error(`PURGE_DSH_CLI 가 가리키는 파일이 없습니다: ${cli}`);
    desktop = /[\\/]resources[\\/](?:app|app\.asar|app\.asar\.unpacked)[\\/]/i.test(cli);
  } else {
    const host = currentHost({ ...options, env, argv, reader });
    const resources =
      desktopResourcesForHost(host) || (!host ? resourcesPath : "");
    if (resources) {
      cli = desktopCliFromResources(resources, reader);
      desktop = true;
      source = "현재 Desktop 인스턴스";
    } else if (host) {
      cli = npmCli(host, reader);
      source = "현재 npm/Node 인스턴스";
    }
  }
  if (!cli)
    throw Error(
      "현재 DSH 인스턴스의 CLI 를 찾을 수 없습니다; 이 서비스가 쓰는 dsh 실행 파일을 PURGE_DSH_CLI 로 지정하고 DSH_PROFILE(예: web)을 분명히 밝히세요. 다른 전역 설치를 시도하지 않습니다.",
    );
  let command = cli,
    args = [], runtimeEnv = {};
  if (/\.[cm]?js$/i.test(cli)) {
    command = execPath;
    const resources = desktop ? /^(.*[\\/]resources)[\\/](?:app|app\.asar|app\.asar\.unpacked)[\\/]/i.exec(cli)?.[1] : '';
    const wrapper = resources && path.join(resources, 'harness-node-entry.mjs');
    if (wrapper && reader.existsSync(wrapper)) runtimeEnv = desktopPackageManager(cli, reader);
    args = [...(desktop ? ["--expose-internals"] : []), ...(wrapper && reader.existsSync(wrapper) ? [wrapper] : []), cli];
  } else if (platform !== "win32") {
    try {
      reader.accessSync(cli, fs.constants.X_OK);
    } catch {
      if (
        !/^#!\/bin\/(?:ba)?sh(?:\r?\n|$)/.test(
          reader.readFileSync(cli, "utf8").slice(0, 64),
        )
      )
        throw Error("DSH CLI 를 실행할 수 없습니다; 현재 인스턴스의 CLI 파일을 지정하세요");
      command = "/bin/sh";
      args = [cli];
    }
  }
  return { command, args, cli, source, node: command === execPath, env: runtimeEnv };
}
