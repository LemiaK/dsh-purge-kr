#!/usr/bin/env node
// 업스트림 동기화 자동화(결정론 부분).
//  1) upstream 새 버전 감지  2) 병합(트리=업스트림)  3) 델타 밖 파일은 우리 번역 그대로 복원
//  4) 델타 파일만 localize.mjs 로 번역(TM 재사용 + 신규만 AI)
//  5) 영역별 커밋  6) 번들 재생성  7) 게이트(check:docs/test/bundle --check)
//
// AI/키는 localize.mjs 가 담당한다. 이 스크립트는 키를 읽지도 출력하지도 않는다.
// 사용: node scripts/sync-upstream.mjs [--dry-run] [--no-ai] [--force] [--keep-branch]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const OUT_DIR = ".sync";
const DROP_FILES = ["README.zh-CN.md", "docs/README.en.md"]; // 포크 정책: README 는 영문 1벌

const run = (cmd, args, opts = {}) => {
  const res = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...opts });
  if (res.status !== 0 && !opts.allowFail) {
    throw new Error(`${cmd} ${args.join(" ")} 실패(${res.status}): ${(res.stderr || res.stdout || "").slice(0, 500)}`);
  }
  return res;
};
const git = (args, opts = {}) => run("git", args, opts);
const out = (cmd, args) => run(cmd, args).stdout.trim();

const flag = (name) => process.argv.includes(name);
const dryRun = flag("--dry-run");
const noAi = flag("--no-ai");
const force = flag("--force");

function log(msg) { console.log("[sync] " + msg); }

/** 마지막으로 병합한 업스트림 커밋(머지 커밋의 두 번째 부모). */
function lastSyncedUpstream() {
  const res = git(["log", "--merges", "--grep=merge upstream", "-1", "--format=%P"], { allowFail: true });
  const parents = (res.stdout || "").trim().split(/\s+/).filter(Boolean);
  return parents[1] || "";
}

function upstreamVersion() {
  const raw = out("git", ["show", "upstream/master:package.json"]);
  return JSON.parse(raw).version;
}
const localVersion = () => JSON.parse(fs.readFileSync("package.json", "utf8")).version;

function ensureClean() {
  const dirty = git(["status", "--porcelain"]).stdout.trim();
  if (dirty && !force) throw new Error("작업 트리가 깨끗하지 않습니다. 먼저 정리하거나 --force 를 쓰세요.");
}

function commitArea(stage, message, body = "") {
  if (!stage.length) return false;
  git(["add", "-A", "--", ...stage]);
  const staged = git(["diff", "--cached", "--name-only"]).stdout.trim();
  if (!staged) return false;
  const args = ["commit", "-q", "-m", message];
  if (body) args.push("-m", body);
  git(args);
  log("commit: " + message);
  return true;
}

function listChangedFiles(baseRef, ref) {
  return git(["diff", "--name-only", baseRef, ref]).stdout.split("\n").map((s) => s.trim()).filter(Boolean);
}

function filesUnder(list, prefixes) {
  return list.filter((f) => prefixes.some((p) => f === p || f.startsWith(p.endsWith("/") ? p : p + "/") || f.startsWith(p)));
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  ensureClean();
  git(["fetch", "upstream", "--tags", "--prune"], { allowFail: true });

  const nextVersion = upstreamVersion();
  const current = localVersion();
  log(`upstream=${nextVersion} local=${current}`);
  if (nextVersion === current && !force) {
    log("이미 최신입니다. 종료.");
    return;
  }

  const branch = `sync/upstream-${nextVersion}`;
  const base = out("git", ["rev-parse", "HEAD"]);
  git(["checkout", "-B", branch]);
  log("branch: " + branch);

  // 1) 병합: 트리는 업스트림과 동일하게 맞춘 뒤 우리 정책 파일을 다시 지운다.
  const syncedUpstream = lastSyncedUpstream();
  git(["merge", "upstream/master", "-s", "recursive", "-X", "theirs", "--no-commit"], { allowFail: true });
  git(["checkout", "upstream/master", "--", "."]);
  for (const f of DROP_FILES) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  git(["add", "-A"]);
  commitArea(["."], `chore: merge upstream ${nextVersion}`,
    "The tree is upstream's; localizations and fork-specific changes are re-applied by scripts/sync-upstream.mjs.");

  // 2) 델타 밖 파일은 우리 번역을 그대로 되돌린다.
  const changed = syncedUpstream ? listChangedFiles(syncedUpstream, "upstream/master") : [];
  const ours = git(["ls-tree", "-r", "--name-only", base]).stdout.split("\n").filter(Boolean);
  const restore = ours.filter((f) => !changed.includes(f));
  if (restore.length) {
    // 명령행 길이 제한을 피해 배치로 복원한다.
    for (let i = 0; i < restore.length; i += 200) {
      git(["checkout", base, "--", ...restore.slice(i, i + 200)]);
    }
    for (const f of DROP_FILES) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
    git(["add", "-A"]);
    commitArea(["."], "chore: keep the existing localization outside the upstream delta",
      `Restored ${restore.length} files that upstream did not touch.`);
  }

  // 3) 델타 파일만 번역: TM 재사용 → 신규만 AI.
  const delta = changed.filter((f) => fs.existsSync(f));
  const manifest = path.join(OUT_DIR, "changed.txt");
  fs.writeFileSync(manifest, delta.join("\n") + "\n", "utf8");
  const localizeArgs = ["scripts/localize.mjs", "--manifest", manifest, "--write", "--write-tm"];
  if (!noAi) localizeArgs.push("--allow-network");
  const loc = run("node", localizeArgs, { allowFail: true });
  process.stdout.write(loc.stdout || "");
  if (loc.stderr) process.stderr.write(loc.stderr);
  if (loc.status !== 0) log("localize 실패 — 남은 문자열은 검토 대상으로 보고합니다.");

  // 4) 영역별 커밋
  const after = git(["status", "--porcelain"]).stdout.split("\n").map((l) => l.slice(3).trim()).filter(Boolean);
  commitArea(filesUnder(after, ["lib/patches", "lib/core", "lib/core.js"]), `i18n(lib): localize upstream ${nextVersion} patch and core changes`);
  commitArea(filesUnder(after, ["lib/redteam"]), `i18n(redteam): localize upstream ${nextVersion} redteam changes`);
  commitArea(filesUnder(after, ["lib/", "bin/"]), `i18n(lib): localize upstream ${nextVersion} CLI and pipeline changes`);
  commitArea(filesUnder(after, ["packages/"]), `i18n(panel): localize upstream ${nextVersion} panel changes`);
  commitArea(filesUnder(after, ["README.md", "AGENTS.md", "docs/", "skills/", "presets/"]), `i18n(docs): localize upstream ${nextVersion} documentation`);
  commitArea(filesUnder(after, ["scripts/", ".github/", "package.json", "package-lock.json", "market/"]), `chore(fork): upstream ${nextVersion} metadata and scripts`);
  commitArea(filesUnder(after, ["test/"]), `test: align expectations with the localized ${nextVersion} messages`);

  // 5) 번들 재생성 + 커밋
  run("node", ["packages/purge-panel/scripts/build.mjs"], { allowFail: true });
  run("node", ["packages/purge-panel/scripts/build.mjs", "--community"], { allowFail: true });
  commitArea(["client.js", "packages/purge-panel/client.js"], `build: regenerate panel bundles for ${nextVersion}`);

  // 6) 게이트
  const gates = [];
  const gate = (name, cmd, args) => {
    const res = run(cmd, args, { allowFail: true });
    gates.push({ name, status: res.status });
    log(`gate ${name}: ${res.status === 0 ? "ok" : "FAIL"}`);
    return res.status === 0;
  };
  // 6-b) 검토: 코드 골격·앵커 불변(결정론) + 새 번역의 톤·용어(AI). 문제가 남으면 게이트 실패로 본다.
  const reviewArgs = ["scripts/i18n-review.mjs", "--manifest", manifest, "--report", path.join(OUT_DIR, "review.md")];
  if (!noAi) reviewArgs.push("--allow-network", "--apply-fixes");
  const review = run("node", reviewArgs, { allowFail: true });
  process.stdout.write(review.stdout || "");
  if (review.stderr) process.stderr.write(review.stderr);
  const reviewOk = review.status === 0;
  if (!reviewOk) log("검토에서 문제가 발견되었습니다 — " + path.join(OUT_DIR, "review.md"));

  const ok =
    reviewOk &&
    gate("check:docs", "node", ["scripts/check-docs.mjs"]) &&
    gate("bundle --check", "node", ["packages/purge-panel/scripts/build.mjs", "--check"]) &&
    gate("community --check", "node", ["packages/purge-panel/scripts/build.mjs", "--community", "--check"]) &&
    gate("npm test", "npm", ["test"]);

  const summary = [
    `# upstream ${nextVersion} sync`,
    "",
    `- base: \`${base.slice(0, 8)}\` → branch \`${branch}\``,
    `- upstream delta: ${changed.length} files (${delta.length} localized)`,
    `- restored outside delta: ${restore.length} files`,
    `- gates: ${gates.map((g) => `${g.name}=${g.status === 0 ? "ok" : "FAIL"}`).join(", ")}`,
    `- leftover translation targets: see ${OUT_DIR}/../i18n/last-report.json`,
    "",
    ok ? "모든 게이트 통과." : "게이트 실패 — 자동 머지하지 말고 검토하세요.",
    "",
    fs.existsSync(path.join(OUT_DIR, "review.md")) ? fs.readFileSync(path.join(OUT_DIR, "review.md"), "utf8") : "",
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "summary.md"), summary + "\n", "utf8");
  log(ok ? "게이트 통과" : "게이트 실패");
  if (!ok) process.exitCode = 3;
}

try {
  main();
} catch (error) {
  console.error("[sync] " + (error?.message ?? error));
  process.exitCode = 1;
}
