// 패치 표 앵커 판독기.
// 패치 표는 `pattern`(호스트 소스와 바이트 단위로 같아야 하는 앵커)과
// `replace`/`markers`(우리가 주입하는 내용)로 이루어진다. 둘은 규칙이 다르다:
//  - pattern 은 절대 번역하지 않는다(어긋나면 패치가 조용히 적용되지 않는다).
//  - replace/markers 의 설명 문장은 한국어로 유지한다(사라지면 사용자에게 중국어가 주입된다).
// 이 모듈은 문자열 스팬을 필드별로 분류해 그 차이를 계산 가능하게 만든다.
import { scanCode } from "./spans.mjs";

const FIELD_RE = /(pattern|replace|markers?|marker)\s*:\s*[\[{(]?\s*$/;
const CONTINUE_RE = /^\s*\+\s*$/;
const HANGUL_RE = /[\uAC00-\uD7A3]/;
const CJK_RE = /[\u3400-\u4DBF\u4E00-\u9FFF]/;

export const hasHangul = (text) => HANGUL_RE.test(String(text ?? ""));
export const hasCjkText = (text) => CJK_RE.test(String(text ?? ""));

/**
 * 소스의 문자열 스팬을 필드별로 분류한다.
 * @returns {{start:number,end:number,kind:string,text:string,field:string}[]}
 */
export function classifySpans(source) {
  const spans = scanCode(String(source));
  const out = [];
  let prevEnd = 0;
  let lastField = "";
  for (const span of spans) {
    const gap = String(source).slice(prevEnd, span.start);
    const match = gap.match(FIELD_RE);
    let field = match ? match[1] : "";
    if (field === "markers" || field === "marker") field = "markers";
    if (!field && CONTINUE_RE.test(gap)) field = lastField;
    if (field) lastField = field;
    out.push({ ...span, field });
    prevEnd = span.end;
  }
  return out;
}

/** 호스트 앵커(번역 금지) 문자열만. */
export function patternSpans(source) {
  return classifySpans(source).filter((s) => s.field === "pattern" && s.kind === "string");
}

/** 우리가 주입하는 문장(번역 유지 대상) 중 설명이 담긴 문자열만. */
export function payloadSpans(source) {
  return classifySpans(source).filter(
    (s) => s.field === "replace" && s.kind === "string" && s.text.length > 8,
  );
}

/**
 * 업스트림이 호스트 문자열을 바꿔 앵커가 어긋났는지 본다.
 * 같은 순서의 pattern 스팬끼리 비교하고, 개수가 다르면 개수 차이를 따로 보고한다.
 * @param {string} upstreamText 업스트림(또는 새 호스트) 쪽 패치 표
 * @param {string} currentText 우리 쪽 패치 표
 */
export function patternDrift(upstreamText, currentText) {
  const a = patternSpans(upstreamText);
  const b = patternSpans(currentText);
  const drift = [];
  const count = Math.min(a.length, b.length);
  for (let i = 0; i < count; i += 1) {
    if (a[i].text !== b[i].text) {
      drift.push({ index: i, upstream: a[i].text, current: b[i].text });
    }
  }
  return { upstreamCount: a.length, currentCount: b.length, drift };
}

/**
 * 이전(한국어) 판과 지금 판을 비교해 "번역이 사라진 문자열" 을 찾는다.
 * 업스트림 병합으로 파일이 통째로 교체되면 우리가 한국어로 두었던 주입 문장이 중국어로 되돌아간다.
 * 필드 이름에 기대지 않고 "한국어였던 문자열이 중국어가 되었는가" 만 본다
 * (포크는 주입 문장을 상수로 빼 두기도 해서 `replace:` 안에만 있지 않다).
 * @param {string} previousText 병합 이전 우리 판
 * @param {string} currentText 지금 판
 */
export function lostPayloads(previousText, currentText) {
  const strings = (text) => scanCode(String(text)).filter((s) => s.kind === "string" && s.text.length > 20);
  const a = strings(previousText);
  const b = strings(currentText);
  const lost = [];
  if (a.length !== b.length) return { previousCount: a.length, currentCount: b.length, lost, misaligned: true };
  for (let i = 0; i < a.length; i += 1) {
    const wasKorean = hasHangul(a[i].text);
    const stillKorean = hasHangul(b[i].text);
    if (wasKorean && !stillKorean && hasCjkText(b[i].text)) {
      lost.push({ index: i, previous: a[i].text, current: b[i].text, start: b[i].start, end: b[i].end });
    }
  }
  return { previousCount: a.length, currentCount: b.length, lost, misaligned: false };
}
