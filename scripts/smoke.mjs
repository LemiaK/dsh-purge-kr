import { removeTreeNoFollowSync } from "../lib/remove-tree.js";
// 릴리스 패키지 smoke test: DSH 실기 없이 "만들어진 tgz 가 최소한 import·파싱은 된다"를 검증한다.
// CI 는 npm pack 이후에 이 스크립트를 실행한다. 로컬 `npm run smoke` 도 같다.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const ok = (label) => console.log("  ✓ " + label);

const sourceManifest = JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const tgz = process.env.SMOKE_TGZ || path.join(root, `${sourceManifest.name}-${sourceManifest.version}.tgz`);
if (!tgz || !fs.existsSync(tgz)) {
  console.error("✗ tgz 를 찾지 못했다. 먼저 npm pack 을 실행한다");
  process.exit(1);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "purge-smoke-"));
try {
  execFileSync("tar", ["-xzf", tgz, "-C", tmp]);
  const pkgDir = path.join(tmp, "package");
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));

  if (pkg.name !== sourceManifest.name || pkg.version !== sourceManifest.version) throw Error("Packed artifact does not match current manifest");

  // The standalone bootstrap invokes migrate before npm has installed yaml or peers.
  const bootstrapHome = path.join(tmp,"bootstrap-home"), profile = path.join(bootstrapHome,"profiles/desktop");
  fs.mkdirSync(profile,{recursive:true});fs.writeFileSync(path.join(profile,"package.json"),"{}");
  const bootEnv={...process.env,DSH_HOME:bootstrapHome,DSH_PROFILE:"desktop",PURGE_PROFILE_DIR:profile,PURGE_DSH_CLI:"",DSH_BASE:""};
  const boot = execFileSync(process.execPath,[path.join(pkgDir,"bin/community.js"),"status"],{env:bootEnv,encoding:"utf8",timeout:30000});
  if(JSON.parse(boot).package !== pkg.name) throw Error("Dependency-free bootstrap entry failed");
  ok("의존성을 설치하지 않은 압축 해제 패키지가 bootstrap CLI 를 기동한다");

  // Install the packed artifact's declared dependencies, not source-tree node_modules.
  const installArgs = ["install", "--ignore-scripts", "--legacy-peer-deps", "--omit=dev", "--no-audit", "--no-fund"];
  // Node cannot exec a .cmd file directly. This command contains only fixed arguments;
  // the temporary package path is passed as cwd, never interpolated into shell code.
  if (process.platform === "win32") {
    execFileSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `npm ${installArgs.join(" ")}`], {cwd:pkgDir,stdio:"pipe",timeout:120000});
  } else {
    execFileSync("npm", installArgs, {cwd:pkgDir,stdio:"pipe",timeout:120000});
  }

  // 1) export 매핑이 가리키는 파일이 모두 존재한다
  for (const [key, target] of Object.entries(pkg.exports || {})) {
    const rel = typeof target === "string" ? target : target && target.default;
    if (!rel) continue;
    if (!fs.existsSync(path.join(pkgDir, rel))) problems.push(`exports["${key}"] -> ${rel} 없음`);
  }
  if (!problems.length) ok(`${Object.keys(pkg.exports || {}).length}개 export 대상이 모두 존재한다`);

  // 2) 모든 진입점을 import 할 수 있다
  for (const spec of ["./lib/index.js", "./lib/presets-plugin.js", "./lib/selfcheck.js", "./lib/probe.js", "./lib/audit.js"]) {
    const mod = await import(pathToFileURL(path.join(pkgDir, spec)).href);
    if (!mod || typeof mod !== "object") problems.push(`${spec} import 실패`);
  }
  ok("핵심 모듈을 릴리스 패키지에서 import 할 수 있다");

  // 3) 기본 프리셋이 registry 파서로 합법 정의로 읽힌다
  const composition = await import(pathToFileURL(path.join(pkgDir, "lib/redteam/preset-composition.js")).href);
  const def = composition.readPresetDefinition("unrestricted", path.join(pkgDir, "presets/unrestricted"));
  if (def.id !== "unrestricted" || !Array.isArray(def.plugins) || def.plugins.length < 15)
    problems.push(`프리셋 파싱 이상: ${def.id} / ${def.plugins?.length}행`);
  else ok(`프리셋 파싱: ${def.plugins.length}행`);

  // 4) bundle patch 의 항목 이름이 패키지 이름과 일치한다
  const yml = fs.readFileSync(path.join(pkgDir, "cordis.patch.yml"), "utf8");
  for (const needle of ["dsh-purge-community", "dsh-purge-community/presets-plugin", "dsh-purge-community/redteam"])
    if (!yml.includes(needle)) problems.push(`cordis.patch.yml 에 ${needle} 가 없다`);
  if (!problems.length) ok("bundle patch 항목이 완전하다");

  // 5) CLI 가 빈 디렉터리에서도 status 를 낸다(죽지 않는다)
  const home = path.join(tmp, "home");
  fs.mkdirSync(home, { recursive: true });
  const out = execFileSync(process.execPath, [path.join(pkgDir, "bin/community.js"), "status"], {
    env: { ...process.env, DSH_HOME: home },
    encoding: "utf8",
  });
  if (!out.includes("Purge")) problems.push("status 출력 이상");
  else ok("CLI status 사용 가능");

  // 6) 호스트가 없을 때 자체 점검은 예외 대신 broken 을 낸다
  const selfcheck = await import(pathToFileURL(path.join(pkgDir, "lib/selfcheck.js")).href);
  const report = await selfcheck.selfCheck("", home);
  if (report.state !== "broken") problems.push(`호스트가 없으면 selfcheck 는 broken 이어야 하는데 실제는 ${report.state}`);
  else ok("selfcheck 는 호스트가 없을 때 안전하게 저하한다");
} finally {
  removeTreeNoFollowSync(tmp);
}

if (problems.length) {
  console.error("✗ smoke 실패:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("✓ 릴리스 패키지 smoke 통과");
