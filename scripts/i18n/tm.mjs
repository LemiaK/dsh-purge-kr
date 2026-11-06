// 번역 메모리(TM): "뼈대 번역" 을 파일로 유지한다.
// 형식(JSONL): {"k":키,"ctx":문맥,"src":원문,"ko":번역,"v":처음 만든 버전}
// 키는 원문 문자열의 SHA-256 앞 16자다. 같은 원문이 여러 문맥에서 다르게 번역될 수 있으므로 ctx 를 함께 본다.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export const TM_PATH = path.join("i18n", "tm.ko.jsonl");

export function tmKey(ctx, src) {
  return createHash("sha256").update(ctx + "\u0000" + src).digest("hex").slice(0, 16);
}

/** @returns {Map<string,string>} key → 번역문 */
export function loadTm(file = TM_PATH) {
  const map = new Map();
  if (!fs.existsSync(file)) return map;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const raw = line.trim();
    if (!raw || raw.startsWith("#")) continue;
    let row;
    try { row = JSON.parse(raw); } catch { continue; }
    if (!row || typeof row.k !== "string" || typeof row.ko !== "string") continue;
    map.set(row.k, row.ko);
  }
  return map;
}

/** 기존 TM 에 없는 항목만 덧붙인다(정렬 유지, 중복 키는 최신 번역으로 교체). */
export function saveTm(entries, file = TM_PATH) {
  const current = new Map();
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const raw = line.trim();
      if (!raw) continue;
      try {
        const row = JSON.parse(raw);
        if (row && typeof row.k === "string") current.set(row.k, row);
      } catch { /* 손상된 줄은 버린다 */ }
    }
  }
  for (const row of entries) current.set(row.k, row);
  const lines = [...current.values()]
    .sort((a, b) => String(a.k).localeCompare(String(b.k)))
    .map((row) => JSON.stringify({ k: row.k, ctx: row.ctx, src: row.src, ko: row.ko, v: row.v }));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, lines.join("\n") + (lines.length ? "\n" : ""), "utf8");
  return lines.length;
}
