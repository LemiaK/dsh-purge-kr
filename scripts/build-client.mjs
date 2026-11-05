/**
 * lib/redteam/client.js 를 임베드 가능한 팩토리 조각으로 뽑아,
 * client.js 안의 DSH_PURGE_DRILL 표식 사이에 기록한다.
 *
 * 사용법: node scripts/build-client.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const drillSrc = join(root, "lib", "redteam", "client.js");
const clientPath = join(root, "client.js");

const BEGIN = "/* __DSH_PURGE_DRILL_BEGIN__ */";
const END = "/* __DSH_PURGE_DRILL_END__ */";

let raw = readFileSync(drillSrc, "utf8").replace(/\r\n/g, "\n");
const startMark = "factory: (require) => {";
const start = raw.indexOf(startMark);
if (start < 0) throw new Error("cannot find ModuleLoader factory in drill client");
const endMark = "\n    return module.exports\n  },\n})";
const end = raw.lastIndexOf(endMark);
if (end < 0) throw new Error("cannot find factory end in drill client");
let body = raw.slice(start + startMark.length, end);

// 끝부분 exports 제거(return 은 endMark 바깥에 있다)
body = body
	.replace(/\n\s*exports\.apply\s*=\s*apply\s*\n/, "\n")
	.replace(/\n\s*exports\.inject\s*=\s*inject\s*\n/, "\n");

// apply(ctx) 교체: 더 이상 직접 슬롯을 등록하지 않고 Panel / CSS / 상태만 export 한다
const applyAt = body.lastIndexOf("function apply(ctx) {");
if (applyAt < 0) throw new Error("apply(ctx) not found in drill client");
// apply() 본문은 CSS(앞부분에 있음)까지 중첩 함수 중괄호가 부딪히지 않으므로 괄호 깊이만 세면 된다
let d = 0;
let j = body.indexOf("{", applyAt);
for (; j < body.length; j += 1) {
	const ch = body[j];
	if (ch === "{") d += 1;
	else if (ch === "}") {
		d -= 1;
		if (d === 0) {
			j += 1;
			break;
		}
	}
}
const applyParts = `function applyDrillParts() {
      return { CSS: CSS, Panel: Panel, setUI: setUI, useUI: useUI, isFullWindow: isFullWindow, setDockWidth: setDockWidth };
    }
`;
body = body.slice(0, applyAt) + applyParts + body.slice(j);

const fragment = `${BEGIN}
		// 내장 드릴 콘솔(소스는 lib/redteam, 이 플러그인에 합쳐져 있다)
		const __dshPurgeDrill = (() => {
			var module = { exports: {} };
			var exports = module.exports;
${body}
			return applyDrillParts();
		})();
${END}`;

let client = readFileSync(clientPath, "utf8");
if (!client.includes(BEGIN) || !client.includes(END)) {
	throw new Error("client.js missing drill markers; run patch-client-dock.mjs first");
}
const beginAt = client.indexOf(BEGIN);
const endAt = client.indexOf(END);
if (beginAt < 0 || endAt < 0 || endAt < beginAt) throw new Error("drill markers out of order");
client = client.slice(0, beginAt) + fragment + client.slice(endAt + END.length);
writeFileSync(clientPath, client);
console.log("embedded drill client into client.js (" + Buffer.byteLength(fragment) + " bytes fragment)");
