// 번역 대상 스팬 추출기.
// 원칙: 코드 골격(공백·구두점·식별자·순서)은 절대 건드리지 않고, 문자열 리터럴과 주석만
// "위치(start/end) + 원문" 으로 뽑아 번역한 뒤 같은 위치에 되돌려 넣는다.
// 호스트 앵커(pattern/markers/replace)는 이 스팬 집합에 들어오지 않도록 파일 정책으로 제외한다.

/** 파일 확장자로 스크립트/문서/기타를 나눈다. */
export function kindOf(file) {
  if (/\.(mjs|cjs|js|ts)$/i.test(file)) return "code";
  if (/\.md$/i.test(file)) return "markdown";
  if (/\.(json|ya?ml)$/i.test(file)) return "data";
  return "other";
}

/** 중국어(한자) 포함 여부. 번역할 필요가 없는 스팬을 걸러내는 데 쓴다. */
export function hasCjk(text) {
  return /[\u3400-\u4DBF\u4E00-\u9FFF]/.test(text);
}

/**
 * JS 계열 소스에서 문자열/주석 스팬을 뽑는다.
 * 정규식 리터럴 안의 따옴표는 오탐이 될 수 있으므로, CJK 가 없는 스팬은 어차피 버려진다.
 * @param {string} source
 * @returns {{start:number,end:number,kind:"string"|"comment",text:string}[]}
 */
export function scanCode(source) {
  const spans = [];
  let i = 0;
  const n = source.length;
  while (i < n) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "/") {
      const start = i;
      let j = i + 2;
      while (j < n && source[j] !== "\n") j += 1;
      spans.push({ start, end: j, kind: "comment", text: source.slice(start, j) });
      i = j;
      continue;
    }
    if (c === "/" && next === "*") {
      const start = i;
      const close = source.indexOf("*/", i + 2);
      const end = close === -1 ? n : close + 2;
      spans.push({ start, end, kind: "comment", text: source.slice(start, end) });
      i = end;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      const start = i;
      let j = i + 1;
      let closed = false;
      while (j < n) {
        if (source[j] === "\\") { j += 2; continue; }
        if (source[j] === quote) { j += 1; closed = true; break; }
        j += 1;
      }
      if (!closed) { i = j; continue; }
      spans.push({ start, end: j, kind: "string", text: source.slice(start, j) });
      i = j;
      continue;
    }
    i += 1;
  }
  return spans;
}

/**
 * 마크다운에서 코드펜스 밖의 "줄" 을 스팬으로 뽑는다(한 줄 = 한 스팬).
 * 표·목록·제목 구조는 그대로 두고 텍스트만 바꾸기 위함이다.
 */
export function scanMarkdown(source) {
  const spans = [];
  let offset = 0;
  let inFence = false;
  for (const line of source.split("\n")) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) inFence = !inFence;
    else if (!inFence) spans.push({ start: offset, end: offset + line.length, kind: "markdown", text: line });
    offset += line.length + 1;
  }
  return spans;
}

/** 스팬 배열에 번역문을 되돌려 넣는다. 겹치지 않는 스팬만 허용한다. */
export function applySpans(source, replacements) {
  const ordered = [...replacements].sort((a, b) => a.start - b.start);
  let out = "";
  let cursor = 0;
  for (const r of ordered) {
    if (r.start < cursor) throw new Error("span overlap at " + r.start);
    out += source.slice(cursor, r.start) + r.text;
    cursor = r.end;
  }
  return out + source.slice(cursor);
}

/** 번역 후에도 코드 골격이 그대로인지 확인하기 위한 지문: 영숫자/기호만 남긴다. */
export function skeleton(text) {
  return String(text)
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)) // 전각 → ASCII
    .replace(/[\u3001\u3002\u300A-\u300F\u2018-\u201F\u2026]/g, (c) =>
      ({ "\u3001": ",", "\u3002": ".", "\u300A": "<", "\u300B": ">", "\u2026": "..." }[c] ?? "'"))
    .replace(/[\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7A3]/g, "") // 번역으로 바뀌는 글자
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 번역 대상(문자열·주석·마크다운 줄)을 지운 "구조 골격".
 * 번역만 했다면 두 버전의 구조 골격은 완전히 같아야 한다 — 이 불변식이 리뷰의 핵심이다.
 */
export function structuralSkeleton(text, kind = "code") {
  if (kind === "markdown") {
    return scanMarkdown(String(text))
      .reduce((acc, span) => acc.slice(0, span.start) + acc.slice(span.end), String(text))
      .replace(/\s+/g, " ")
      .trim();
  }
  const source = String(text);
  let out = "";
  let cursor = 0;
  for (const span of scanCode(source)) {
    out += source.slice(cursor, span.start) + "\u0000";
    cursor = span.end;
  }
  out += source.slice(cursor);
  return out.replace(/\s+/g, " ").trim();
}

/**
 * 코드 지문: 번역 대상(문자열·주석)을 지운 뒤 영숫자/밑줄 토큰만 남긴다.
 * 구두점 표기 차이(전각/반각)나 공백 변화에 흔들리지 않으면서, 코드가 실제로 바뀌면 반드시 달라진다.
 */
export function codeFingerprint(text) {
  return structuralSkeleton(text, "code").replace(/[^A-Za-z0-9_$]+/g, " ").trim();
}
