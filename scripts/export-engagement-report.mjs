#!/usr/bin/env node
import { removeTreeNoFollowSync } from "../lib/remove-tree.js";
/**
 * 표적 하나의 점수 보고서를 옮길 수 있는 전달 패키지로 내보낸다: `<outDir>/<표적>-레드팀-성과-재현-보고서.md` + `<outDir>/shots/`.
 *
 * 패널에서 내려받은 markdown 은 증거 스크린샷이 절대 경로라서 남에게 보내면 이미지가 깨진다.
 * 여기서는 shots/ 를 출력 디렉터리에 함께 복사하고 markdown 은 상대 경로를 쓴다.
 *
 * 실행 방법:
 *   node scripts/export-engagement-report.mjs
 *   node scripts/export-engagement-report.mjs --out ~/산출물/표적명
 *   node scripts/export-engagement-report.mjs --engagement <id>
 */
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { RedteamStore } from "../lib/redteam/store-core.js";

const argv = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = argv.indexOf("--" + name);
  return i === -1 || argv[i + 1] === undefined ? fallback : argv[i + 1];
};

const root = process.env.REDTEAM_HOME || join(process.env.DSH_HOME || join(homedir(), ".dsh"), "redteam");
const store = new RedteamStore(root);
const id = argOf("engagement", store.activeEngagementId());
if (!id) {
  console.error("사용할 표적이 없다: 패널에서 먼저 만들거나 --engagement <id> 로 지정한다");
  process.exit(1);
}
const outDir = resolve(argOf("out", process.cwd()));
mkdirSync(outDir, { recursive: true });

const shotsSrc = join(root, "engagements", id, "shots");
const shotsDst = join(outDir, "shots");
if (existsSync(shotsSrc)) {
  removeTreeNoFollowSync(shotsDst);
  cpSync(shotsSrc, shotsDst, { recursive: true });
}

const rep = store.scoreReport(id, { shotRef: "relative" });
const name = String(rep.target || id).replace(/[/\\:*?"<>|]/g, "_");
const outFile = join(outDir, name + "-레드팀-성과-재현-보고서.md");
writeFileSync(outFile, rep.markdown, "utf8");
store.close();

const imgs = (rep.markdown.match(/!\[[^\]]*\]\([^)]+\)/g) || []).length;
console.log("✓ 보고서: " + outFile);
console.log("  합계 " + rep.summary.points + " 점 · 본문 " + rep.items.length + "개 · 삽입 스크린샷 " + imgs + "장"
  + (existsSync(shotsDst) ? " (shots/ " + readdirSync(shotsDst).length + "개 파일, 보고서와 함께 복사하면 된다)" : ""));
