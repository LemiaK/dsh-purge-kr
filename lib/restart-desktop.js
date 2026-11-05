import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";

const encoded = process.env.DSH_PURGE_RESTART;
if (!encoded) process.exit(1);

let info;
try {
  info = JSON.parse(encoded);
} catch {
  process.exit(1);
}

const cleanup = Array.isArray(info.cleanup) ? info.cleanup : [];
const logPath = path.join(
  process.env.TEMP || process.env.TMPDIR || "/tmp",
  "dsh-purge-restart-desktop.log",
);

function log(msg) {
  try {
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${msg}\n`);
  } catch {
    // ignore
  }
}

function spawnEnv() {
  const env = { ...process.env };
  delete env.DSH_PERMISSION_MODE;
  delete env.DSH_PURGE_RESTART;
  for (const key of Object.keys(env)) {
    if (key.toUpperCase() === "ELECTRON_RUN_AS_NODE") delete env[key];
  }
  // [dsh-purge-fix 2026-10-09] explorer 에서 물려받은 env 에는 DSH_PROFILE 이 자주 빠진다
  // (WM_SETTINGCHANGE broadcast 는 오래 살아 있는 explorer 를 새로 고치지 않는다). helper relaunch 시
  // 폴백이 없으면 새 Electron → host 자식 프로세스가 계속 빠진 채로 "cannot determine the
  // boot profile" host crash 가 나고 → dsh-purge 플러그인이 activate 되지 않아 → inject 가 모두 끊긴다.
  if (!env.DSH_PROFILE) env.DSH_PROFILE = "desktop";
  return env;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pidAlive(pid) {
  const n = Number(pid);
  if (!n) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitPidGone(pid) {
  if (!pid) {
    await sleep(400);
    return true;
  }
  for (let i = 0; i < 80; i++) {
    if (!pidAlive(pid)) return true;
    await sleep(120);
  }
  return !pidAlive(pid);
}

function rmTree(dir) {
  if (!dir) return;
  try {
    removeTreeNoFollowSync(dir, { maxRetries: 8, retryDelay: 120 });
  } catch {
    // 잠겨 있으면 그대로 둔다
  }
}

function pidsForImage(image) {
  const out = execFileSync("tasklist", ["/FI", `IMAGENAME eq ${image}`, "/FO", "CSV", "/NH"], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 8000,
  });
  const pids = [];
  for (const line of String(out || "").split(/\r?\n/)) {
    const cols = line.split(",");
    const pid = Number(String(cols[1] || "").replace(/"/g, "").trim());
    if (pid) pids.push(pid);
  }
  return pids;
}

function darwinBundleOf(exe) {
  const n = String(exe || "").replace(/\\/g, "/");
  const m = n.match(/^(.*\.app)\/Contents\/MacOS\//i);
  return m ? m[1] : "";
}

function darwinBundleName(bundle) {
  if (!bundle) return "";
  const infoPlist = path.join(bundle, "Contents", "Info.plist");
  try {
    return execFileSync("defaults", ["read", path.join(bundle, "Contents", "Info"), "CFBundleName"], {
      encoding: "utf8",
      timeout: 5000,
    }).trim();
  } catch {
    // fall through
  }
  try {
    return execFileSync("plutil", ["-extract", "CFBundleName", "raw", infoPlist], {
      encoding: "utf8",
      timeout: 5000,
    }).trim();
  } catch {
    return path.basename(bundle, ".app");
  }
}

function listDarwinPids(exe) {
  const bundle = darwinBundleOf(exe);
  if (!exe || !bundle) return [];
  let out = "";
  try {
    out = execFileSync("ps", ["-Ao", "pid=,command="], {
      encoding: "utf8",
      timeout: 8000,
    });
  } catch {
    return [];
  }
  const frameworks = `${bundle}/Contents/Frameworks/`;
  const pids = [];
  for (const line of String(out || "").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sp = trimmed.search(/\s/);
    if (sp < 0) continue;
    const pid = Number(trimmed.slice(0, sp).trim());
    const cmd = trimmed.slice(sp + 1).trim();
    if (!pid) continue;
    // CLI 독립 호스트(dsh web / plugin 등)는 데스크톱 단일 인스턴스 잠금을 쓰지 않으므로 함께 죽이면 안 된다.
    if (cmd.includes("/dsh-desktop-host/lib/cli.js")) continue;
    if (cmd === exe || cmd.startsWith(`${exe} `) || cmd.startsWith(frameworks)) {
      pids.push(pid);
    }
  }
  return [...new Set(pids)];
}

function commandMatchesExe(cmd, exe) {
  if (!cmd || !exe) return false;
  if (cmd.includes("/dsh-desktop-host/lib/cli.js")) return false;
  return cmd === exe || cmd.startsWith(`${exe} `) || cmd.startsWith(`${exe}\t`);
}

function listPosixPids(exe) {
  if (!exe) return [];
  let out = "";
  try {
    out = execFileSync("ps", ["-Ao", "pid=,command="], {
      encoding: "utf8",
      timeout: 8000,
    });
  } catch {
    return [];
  }
  const pids = [];
  for (const line of String(out || "").split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const sp = trimmed.search(/\s/);
    if (sp < 0) continue;
    const pid = Number(trimmed.slice(0, sp).trim());
    const cmd = trimmed.slice(sp + 1).trim();
    if (!pid || !commandMatchesExe(cmd, exe)) continue;
    pids.push(pid);
  }
  return [...new Set(pids)];
}

function listDesktopPids(exe = info.execPath) {
  if (process.platform === "darwin") return listDarwinPids(exe);
  if (process.platform !== "win32") return listPosixPids(exe);
  const images = ["DeepSeek Harness.exe", "DSH Desktop.exe"];
  const pids = [];
  for (const image of images) {
    try {
      pids.push(...pidsForImage(image));
    } catch {
      // 해당 프로세스 이름이 없다
    }
  }
  return pids;
}

function signalPids(pids, signal) {
  for (const pid of pids) {
    if (pid === process.pid) continue;
    try {
      process.kill(pid, signal);
    } catch {
      // 이미 종료됐다
    }
  }
}

async function waitDesktopGone(exe, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const left = listDesktopPids(exe).filter((pid) => pid !== process.pid);
    if (left.length === 0) return true;
    await sleep(200);
  }
  return listDesktopPids(exe).filter((pid) => pid !== process.pid).length === 0;
}

async function quitPosixDesktop(exe) {
  signalPids(listDesktopPids(exe), "SIGTERM");
  if (await waitDesktopGone(exe, 8000)) {
    log("quit by SIGTERM");
    return "SIGTERM";
  }
  signalPids(listDesktopPids(exe), "SIGKILL");
  await waitDesktopGone(exe, 2000);
  log("quit by SIGKILL");
  return "SIGKILL";
}

async function quitDarwinDesktop(exe) {
  const bundle = darwinBundleOf(exe);
  const name = darwinBundleName(bundle);
  if (name) {
    try {
      execFileSync(
        "osascript",
        ["-e", `if application "${name}" is running then tell application "${name}" to quit`],
        { timeout: 15000 },
      );
      log("osascript quit sent");
    } catch (e) {
      log(`osascript quit failed: ${e && e.message ? e.message : e}`);
    }
    if (await waitDesktopGone(exe, 8000)) {
      log("quit by apple event");
      return "apple-event";
    }
  }
  signalPids(listDesktopPids(exe), "SIGTERM");
  if (await waitDesktopGone(exe, 5000)) {
    log("quit by SIGTERM");
    return "SIGTERM";
  }
  signalPids(listDesktopPids(exe), "SIGKILL");
  await waitDesktopGone(exe, 2000);
  log("quit by SIGKILL");
  return "SIGKILL";
}

function killOtherDesktopProcesses(keepPid, exe = info.execPath) {
  for (const pid of listDesktopPids(exe)) {
    if (pid === keepPid || pid === process.pid) continue;
    try {
      process.kill(pid, process.platform === "darwin" ? "SIGTERM" : undefined);
    } catch {
      // 이미 종료됐다
    }
  }
}

async function moveAsarAsideAsync(asar) {
  if (!asar) return false;
  try {
    if (!fs.existsSync(asar) || !fs.statSync(asar).isFile()) return true;
  } catch {
    return true;
  }
  const bak = `${asar}.bak`;
  try {
    if (fs.existsSync(bak)) fs.rmSync(bak, { force: true });
  } catch {
    // keep going
  }
  for (let i = 0; i < 80; i++) {
    try {
      if (!fs.existsSync(asar) || !fs.statSync(asar).isFile()) {
        log("asar already absent");
        return true;
      }
      fs.renameSync(asar, bak);
      log(`asar moved to ${bak}`);
      return true;
    } catch {
      await sleep(300);
    }
  }
  log("asar move failed after retries");
  return false;
}

function asarStillSealed(asar) {
  try {
    return Boolean(asar) && fs.existsSync(asar) && fs.statSync(asar).isFile();
  } catch {
    return false;
  }
}

async function releaseSealedAsar(asar, exe) {
  if (!asar) return true;
  if (await moveAsarAsideAsync(asar)) return true;
  log("retry quit then move asar");
  if (process.platform === "darwin") await quitDarwinDesktop(exe);
  else if (process.platform === "win32") {
    killOtherDesktopProcesses(process.pid, exe);
    await sleep(800);
  } else await quitPosixDesktop(exe);
  if (await moveAsarAsideAsync(asar)) return true;
  return !asarStillSealed(asar);
}

function relaunchDesktop() {
  if (!info.execPath) {
    process.exit(1);
  }
  const env = spawnEnv();
  if (process.platform === "darwin") {
    const bundle = darwinBundleOf(info.execPath);
    if (bundle) {
      const child = spawn("open", [bundle], {
        detached: true,
        stdio: "ignore",
        env,
        shell: false,
      });
      child.on("error", () => process.exit(1));
      child.unref();
      log("relaunched via open");
      return;
    }
  }
  // [dsh-purge-fix 2026-10-09] Electron 자체의 --updated argv 분기를 재사용한다:
  // main.js:11256 process.argv.includes("--updated") → raiseAfterUpdate=true
  // → enterWorkspace 때 window.moveTop() + window.focus() 가 내부적으로 포그라운드를 강제한다.
  // 외부 PS SetForegroundWindow 보다 훨씬 안정적이다 (Win11 포그라운드 보호는 외부 프로세스만 막는다).
  const baseArgv = Array.isArray(info.argv) ? info.argv.slice() : [];
  if (process.platform === "win32" && !baseArgv.includes("--updated")) {
    baseArgv.push("--updated");
  }
  const child = spawn(info.execPath, baseArgv, {
    detached: true,
    stdio: "ignore",
    cwd: info.cwd || process.cwd(),
    env,
    windowsHide: true,
    shell: false,
  });
  child.on("error", () => process.exit(1));
  child.unref();
  log("relaunched via execPath (argv=" + JSON.stringify(baseArgv) + ")");

  // [dsh-purge-fix 2026-10-09] Windows: 새 Electron 을 detached helper 로 spawn 하면,
  // Windows 포커스 규칙 때문에 백그라운드에서 돈다. helper 는 이미 포그라운드가 아니고(옛 Electron 이 kill 됐다),
  // 그대로 SetForegroundWindow 하면 Windows 가 조용히 reject 한다.
  // 3중 트릭으로 포그라운드를 강제한다:
  //   1) keybd_event 로 가상 Alt 키를 보낸다 — 사용자 입력을 흉내 내 foreground lock 을 푼다
  //   2) AttachThreadInput 으로 현재 포그라운드 스레드의 input queue 에 붙는다 — 포그라운드 권한을 물려받는다
  //   3) ShowWindow(SW_RESTORE) + BringWindowToTop + SetForegroundWindow
  if (process.platform === "win32") {
    const exeLiteral = info.execPath.replace(/'/g, "''");
    const psScript =
      "$ErrorActionPreference='SilentlyContinue';" +
      "$sig=@'\n" +
      "[DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr h);\n" +
      "[DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr h,int c);\n" +
      "[DllImport(\"user32.dll\")] public static extern bool BringWindowToTop(IntPtr h);\n" +
      "[DllImport(\"user32.dll\")] public static extern IntPtr GetForegroundWindow();\n" +
      "[DllImport(\"user32.dll\")] public static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);\n" +
      "[DllImport(\"kernel32.dll\")] public static extern uint GetCurrentThreadId();\n" +
      "[DllImport(\"user32.dll\")] public static extern bool AttachThreadInput(uint a,uint b,bool f);\n" +
      "[DllImport(\"user32.dll\")] public static extern void keybd_event(byte k,byte s,uint f,int e);\n" +
      "'@;" +
      "$t=Add-Type -MemberDefinition $sig -Name W -Namespace U -PassThru;" +
      "[void]$t::keybd_event(0x12,0,0,0);" +
      "[void]$t::keybd_event(0x12,0,2,0);" +
      "for($i=0;$i -lt 25;$i++){" +
      "  Start-Sleep -Milliseconds 300;" +
      "  $p=Get-Process | Where-Object {$_.Path -eq '" + exeLiteral + "' -and $_.MainWindowHandle -ne 0} | Select-Object -First 1;" +
      "  if($p){" +
      "    $h=$p.MainWindowHandle;" +
      "    $fg=$t::GetForegroundWindow();" +
      "    $pid2=0;" +
      "    $fgTid=$t::GetWindowThreadProcessId($fg,[ref]$pid2);" +
      "    $curTid=$t::GetCurrentThreadId();" +
      "    [void]$t::AttachThreadInput($curTid,$fgTid,$true);" +
      "    [void]$t::ShowWindow($h,9);" +
      "    [void]$t::BringWindowToTop($h);" +
      "    [void]$t::SetForegroundWindow($h);" +
      "    [void]$t::AttachThreadInput($curTid,$fgTid,$false);" +
      "    break;" +
      "  }" +
      "}";
    try {
      const ps = spawn("powershell.exe", [
        "-NoProfile", "-WindowStyle", "Hidden", "-ExecutionPolicy", "Bypass",
        "-Command", psScript,
      ], { detached: true, stdio: "ignore", windowsHide: true, shell: false });
      // detached + unref 뒤에는 ENOENT 같은 비동기 오류가 'error' 이벤트로 가서 바깥 try/catch 가 못 잡는다 → uncaught 로 프로세스가 죽는다.
      ps.on("error", (err) => log("ps bring-to-front spawn error: " + String(err?.message || err)));
      ps.unref();
      log("spawned ps bring-to-front helper (keybd+attach+setfg)");
    } catch (err) {
      log("ps bring-to-front spawn failed: " + String(err));
    }
  }
}

let asarReleased = true;
if (info.killApp) {
  // #85: Electron 을 먼저 죽이고, 그 다음 sleep + cleanup. 원래 순서는 sleep 400ms 가 앞이라 →
  // host 는 이미 exit → Electron 은 아직 살아 옛 close 콜백을 돌려 crash dialog 를 띄웠다.
  // 새 순서: 즉시 kill (host 쪽 killInstallElectronSync 가 이미 죽였고, 여기서는 폴백),
  // Electron 이 빨리 죽을수록 옛 콜백이 돌 기회가 없다.
  if (process.platform === "darwin") {
    await quitDarwinDesktop(info.execPath);
  } else if (process.platform === "win32") {
    killOtherDesktopProcesses(process.pid);
    await sleep(500);
    // 2차 안전장치: 한 번 더 죽여 첫 번째에서 놓친 pid 를 막는다
    killOtherDesktopProcesses(process.pid);
  } else {
    await quitPosixDesktop(info.execPath);
  }
  for (const dir of cleanup) rmTree(dir);
  if (info.helper) {
    try {
      fs.unlinkSync(info.helper);
    } catch {
      /* ignore */
    }
  }
  if (info.asar) asarReleased = await releaseSealedAsar(info.asar, info.execPath);
} else {
  const gone = await waitPidGone(info.pid);
  if (!gone) process.exit(1);
  for (const dir of cleanup) rmTree(dir);
  if (info.helper) {
    try {
      fs.unlinkSync(info.helper);
    } catch {
      /* ignore */
    }
  }
  if (info.asar) asarReleased = await releaseSealedAsar(info.asar, info.execPath);
}

if (info.respawn === false) {
  process.exit(asarReleased ? 0 : 1);
}

if (info.asar && !asarReleased) {
  log("asar still sealed; not relaunching");
  process.exit(1);
}

if (!info.execPath) process.exit(1);

relaunchDesktop();
await sleep(400);
process.exit(0);

// BEGIN standalone no-follow cleanup (checked against lib/remove-tree.js)
function removeTreeNoFollowSync(target, options = {}) {
  const io = options.fs || fs;
  const root = path.resolve(target);
  if (root === path.parse(root).root) throw Error('Refusing to remove a filesystem root');
  const maxRetries = options.maxRetries ?? 0;
  const retryDelay = options.retryDelay ?? 100;
  const retryable = new Set(['EBUSY', 'EMFILE', 'ENFILE', 'ENOTEMPTY', 'EPERM']);
  const walk = file => {
    let stat;
    try { stat = io.lstatSync(file); } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    // lstat must come before isDirectory: never stat / realpath a deletion target.
    try {
      if (stat.isSymbolicLink()) { io.unlinkSync(file); return; }
      if (stat.isDirectory()) {
        for (const name of io.readdirSync(file)) walk(path.join(file, name));
        io.rmdirSync(file); // Non-recursive: no native recursive rm fallback.
      } else io.unlinkSync(file);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  };
  for (let attempt = 0; ; attempt++) {
    try { walk(root); return; } catch (error) {
      if (error.code === 'ENOENT') return;
      if (attempt >= maxRetries || !retryable.has(error.code)) throw error;
      // Each retry re-lstats every remaining entry, including the root.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, retryDelay * (attempt + 1));
    }
  }
}
// END standalone no-follow cleanup
