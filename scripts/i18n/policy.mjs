// 번역 정책 로더: 어떤 파일의 어떤 부분을 번역 대상으로 보는지 한 곳에서 정한다.
// localize.mjs(쓰기), i18n-review.mjs(검토), i18n-senior-fix.mjs(선임 수정)가 같은 규칙을 공유한다.
import fs from "node:fs";
import path from "node:path";
import { kindOf, scanCode, scanMarkdown, hasCjk } from "./spans.mjs";

export const CONFIG_PATH = path.join("scripts", "i18n", "config.json");

/** 아주 작은 glob 매처: ** 는 경로 전체, * 는 한 세그먼트. */
export function toRegExp(glob) {
  const src = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "\u0000")
    .replace(/\*/g, "[^/]*")
    .replace(/\u0000/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + src + "$");
}

export const matchesAny = (file, globs = []) => globs.some((g) => toRegExp(g).test(file));

export function loadConfig(file = CONFIG_PATH) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/** 파일 하나의 번역 정책을 정한다. */
export function policyFor(file, cfg) {
  const posix = file.split(path.sep).join("/");
  if (matchesAny(posix, cfg.skipGlobs)) return { skip: true };
  if (matchesAny(posix, cfg.reviewGlobs)) return { review: true };
  const kind = kindOf(posix);
  if (kind === "code") {
    const commentOnly = matchesAny(posix, cfg.commentOnlyGlobs);
    const allowStrings = !commentOnly && matchesAny(posix, cfg.stringAllowGlobs);
    return { kind: "code", comments: true, strings: allowStrings, commentOnly };
  }
  if (kind === "markdown") return { kind: "markdown", lines: true };
  return { review: true };
}

/** 스팬을 "번역할 본문" 과 "감쌀 접두/접미" 로 나눈다(문자열은 따옴표를 보존). */
export function decompose(span) {
  if (span.kind === "string") {
    const quote = span.text[0];
    const closed = span.text.length > 1 && span.text.endsWith(quote);
    const end = closed ? -1 : undefined;
    return { body: span.text.slice(1, end), prefix: quote, suffix: closed ? quote : "" };
  }
  return { body: span.text, prefix: "", suffix: "" };
}

/**
 * 정책상 번역 대상이면서 아직 중국어가 남아 있는 스팬만 뽑는다.
 * "모델이 번역 대신 다른 문장을 준 경우" 를 잡는 데 쓴다(앵커는 정책상 여기에 들어오지 않는다).
 * @returns {{start:number,end:number,kind:string,text:string,body:string,prefix:string,suffix:string}[]}
 */
export function collectTranslatable(file, source, cfg = loadConfig()) {
  const policy = policyFor(file, cfg);
  if (policy.skip || policy.review) return [];
  const spans = [];
  if (policy.kind === "code") {
    for (const span of scanCode(source)) {
      if (span.kind === "comment" && policy.comments) spans.push(span);
      if (span.kind === "string" && policy.strings) spans.push(span);
    }
  } else if (policy.kind === "markdown") {
    spans.push(...scanMarkdown(source));
  }
  return spans.map((span) => ({ ...span, ...decompose(span) })).filter((span) => hasCjk(span.body));
}
