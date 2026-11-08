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
// 업스트림이 파일을 통째로 다시 써도 포크 판을 유지하는 파일(포크 정책이 내용을 소유한다).
const FORK_OWNED = ["README.md"];

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
  if (parents[1]) return parents[1];
  // 이력이 하나로 정리되어 "merge upstream" 커밋이 없으면, 업스트림과의 공통 조상이 마지막 동기화 지점이다.
  const base = git(["merge-base", "HEAD", "upstream/master"], { allowFail: true });
  return (base.stdout || "").trim();
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
  // .sync/ 같은 생성물은 커밋 대상이 아니다(업스트림 .gitignore 로 병합되면 무시 목록에서 빠질 수 있다).
  const paths = stage.filter((p) => !/^(\.sync|node_modules)(\/|$)/.test(p));
  if (!paths.length) return false;
  git(["add", "-A", "--", ...paths]);
  const staged = git(["diff", "--cached", "--name-only"]).stdout.trim();
  if (!staged) return false;
  const args = ["commit", "-q", "-m", message];
  if (body) args.push("-m", body);
  git(args);
  log("commit: " + message);
  return true;
}

/** 병합 뒤에도 .sync/ 가 무시되도록 보장한다(포크가 추가한 줄이 업스트림 쪽으로 덮일 수 있다). */
function ensureSyncIgnore() {
  const file = ".gitignore";
  const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (/^\.sync\/?$/m.test(text)) return;
  fs.writeFileSync(file, text.replace(/\s*$/, "\n") + ".sync/\n", "utf8");
  log(".gitignore 에 .sync/ 를 다시 넣었습니다");
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

  // 1) 3-방향 병합. 업스트림이 건드린 줄은 업스트림(-X theirs)을 쓰고, 건드리지 않은 우리 변경은 남긴다.
  //    예전처럼 `git checkout upstream/master -- .` 로 트리를 통째로 덮으면 README·package.json 같은
  //    포크 고유 변경이 매번 사라져 check:docs 와 테스트가 깨진다.
  const syncedUpstream = lastSyncedUpstream();
  git(["merge", "upstream/master", "-s", "recursive", "-X", "theirs", "--no-commit"], { allowFail: true });
  const conflicted = git(["diff", "--name-only", "--diff-filter=U"]).stdout.split("\n").map((s) => s.trim()).filter(Boolean);
  for (const f of conflicted) git(["checkout", "--theirs", "--", f], { allowFail: true });
  if (conflicted.length) log(`충돌 ${conflicted.length}건은 업스트림 쪽으로 정리했습니다`);
  // 포크가 소유하는 파일: 업스트림이 통째로 다시 써도 우리 판을 유지한다(README 는 영문 1벌 정책).
  for (const f of FORK_OWNED) git(["checkout", base, "--", f], { allowFail: true });
  for (const f of DROP_FILES) if (fs.existsSync(f)) fs.rmSync(f, { force: true });
  ensureSyncIgnore();
  git(["add", "-A"]);
  commitArea(["."], `chore: merge upstream ${nextVersion}`,
    "Upstream wins on the lines it changed; fork-only changes survive, and the fork-owned files are restored from the previous commit.");

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

  // 6) 게이트 + 검토: 단축 평가로 게이트를 건너뛰지 않도록 모두 실행한 뒤 결과를 합친다.
  const gates = [];
  const failureLog = [];
  const gate = (name, cmd, args) => {
    const res = run(cmd, args, { allowFail: true });
    gates.push({ name, status: res.status });
    if (res.status !== 0) {
      failureLog.push(`### ${name}\n` + (res.stdout || "") + (res.stderr || ""));
    }
    log(`gate ${name}: ${res.status === 0 ? "ok" : "FAIL"}`);
    return res.status === 0;
  };

  // 6-b) 검토: 앵커 불변·번역 유지(결정론) + 새 번역의 톤·용어(AI). 문제가 남으면 게이트 실패로 본다.
  const reviewArgs = [
    "scripts/i18n-review.mjs",
    "--manifest", manifest,
    "--report", path.join(OUT_DIR, "review.md"),
    "--json", path.join(OUT_DIR, "review.json"),
  ];
  if (base) reviewArgs.push("--base", base);
  if (!noAi) reviewArgs.push("--allow-network", "--apply-fixes", "--strict-leftover");
  const runReview = () => {
    const res = run("node", reviewArgs, { allowFail: true });
    process.stdout.write(res.stdout || "");
    if (res.stderr) process.stderr.write(res.stderr);
    if (res.status !== 0) log("검토에서 문제가 발견되었습니다 — " + path.join(OUT_DIR, "review.md"));
    return res.status === 0;
  };
  let reviewOk = runReview();

  // 검토가 고친 내용(용어 교정 재번역 등)은 그대로 커밋해서 다음 단계로 넘긴다.
  const commitReviewChanges = () => {
    const reviewChanges = git(["status", "--porcelain"]).stdout.split("\n").map((l) => l.slice(3).trim()).filter(Boolean);
    if (reviewChanges.length) {
      commitArea(reviewChanges, "fix(i18n): apply review corrections",
        "Re-translate the strings the review flagged and refresh the translation memory.");
    }
  };
  commitReviewChanges();

  // 검토가 실패해도 게이트는 모두 돌린다(단축 평가 금지) — 실패 로그가 복구/선임 패스의 입력이기 때문이다.
  const gateOk = [
    gate("check:docs", "node", ["scripts/check-docs.mjs"]),
    gate("bundle --check", "node", ["packages/purge-panel/scripts/build.mjs", "--check"]),
    gate("community --check", "node", ["packages/purge-panel/scripts/build.mjs", "--community", "--check"]),
    gate("npm test", "npm", ["test"]),
  ].every(Boolean);
  let ok = reviewOk && gateOk;

  // 7) 좁은 복구: 게이트 실패 로그를 모델에 보여 주고 최소 편집만 받는다(앵커는 손대지 않는다).
  let repaired = false;
  if (!ok) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, "failure.log"), failureLog.join("\n\n") || "(게이트 출력 없음)\n", "utf8");
    if (!noAi) {
      log("실패 로그로 AI 복구를 시도합니다");
      const rep = run("node", ["scripts/i18n-repair.mjs", "--log", path.join(OUT_DIR, "failure.log"), "--write", "--allow-network", "--report", path.join(OUT_DIR, "repair.md")], { allowFail: true });
      process.stdout.write(rep.stdout || "");
      if (rep.stderr) process.stderr.write(rep.stderr);
      repaired = rep.status === 0;
      if (repaired) {
        // 복구 과정에서 번들이 다시 생성됐다면 함께 커밋한다.
        const rest = git(["status", "--porcelain"]).stdout.split("\n").map((l) => l.slice(3).trim()).filter(Boolean);
        commitArea(rest, `fix(ci): rebuild after repair for ${nextVersion}`, "Bundles regenerated by the repair pass.");
        // 복구는 게이트만 다시 돌리므로, 검토도 다시 통과해야 통과로 본다.
        reviewOk = runReview();
        commitReviewChanges();
        ok = reviewOk;
        if (ok) log("복구 성공 — 게이트를 다시 통과했습니다");
      }
    }
  }

  // 8) 선임 수정 패스(1회): 사람 이슈를 열기 전에, 권한이 더 넓은 모델이 앵커·주입 문장·미번역을 직접 고친다.
  let seniorFixed = false;
  if (!ok && !noAi) {
    log("선임 수정 패스를 1회 시도합니다(앵커·주입 문장·미번역)");
    const seniorArgs = [
      "scripts/i18n-senior-fix.mjs",
      "--manifest", manifest,
      "--review", path.join(OUT_DIR, "review.json"),
      "--log", path.join(OUT_DIR, "failure.log"),
      "--report", path.join(OUT_DIR, "senior-fix.md"),
      "--write", "--allow-network",
    ];
    if (base) seniorArgs.push("--base", base);
    const senior = run("node", seniorArgs, { allowFail: true });
    process.stdout.write(senior.stdout || "");
    if (senior.stderr) process.stderr.write(senior.stderr);
    seniorFixed = senior.status === 0;
    if (seniorFixed) {
      ok = true;
      log("선임 수정 성공 — 이슈 없이 다음 단계로 넘어갑니다");
    }
  }

  const summary = [
    `# upstream ${nextVersion} sync`,
    "",
    `- base: \`${base.slice(0, 8)}\` → branch \`${branch}\``,
    `- upstream delta: ${changed.length} files (${delta.length} localized)`,
    `- restored outside delta: ${restore.length} files`,
    `- gates: ${gates.map((g) => `${g.name}=${g.status === 0 ? "ok" : "FAIL"}`).join(", ")}`,
    `- review: ${reviewOk ? "ok" : "FAIL"}`,
    `- repair: ${repaired ? "applied" : "not applied"}`,
    `- senior fix: ${seniorFixed ? "applied" : "not applied"}`,
    `- leftover translation targets: see ${OUT_DIR}/../i18n/last-report.json`,
    "",
    ok ? "모든 게이트 통과." : "게이트 실패 — 자동 머지하지 말고 검토하세요.",
    "",
    fs.existsSync(path.join(OUT_DIR, "review.md")) ? fs.readFileSync(path.join(OUT_DIR, "review.md"), "utf8") : "",
    fs.existsSync(path.join(OUT_DIR, "senior-fix.md")) ? fs.readFileSync(path.join(OUT_DIR, "senior-fix.md"), "utf8") : "",
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, "summary.md"), summary + "\n", "utf8");
  log(ok ? "게이트 통과" : "게이트 실패");
  if (!ok) process.exitCode = 3;
  if (ok && repaired) log("복구 후 게이트 통과 — PR 을 만들 수 있습니다");
}

try {
  main();
} catch (error) {
  console.error("[sync] " + (error?.message ?? error));
  process.exitCode = 1;
}
