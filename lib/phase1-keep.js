export const PHASE1_KEEP_EXPR =
  'PERSONA_SECTION_NAMES.has(section?.name) || String(section?.name || "").startsWith("dsh-purge") || String(section?.name || "").startsWith("dshpg-")';

/**
 * 공식 phase-1 화이트리스트를 dsh-purge* + dshpg-* 까지 넓힌다.
 * 이미 dsh-purge 를 허용한 옛 패치는 dshpg 까지 포함하는 형태로 승격된다.
 */
export function widenPhase1KeepFilter(text) {
  const raw = String(text || "");
  const crlf = raw.includes("\r\n");
  let next = raw.replace(/\r\n/g, "\n");
  next = next.replace(
    /PERSONA_SECTION_NAMES\.has\(section\?\.name\) \|\| String\(section\?\.name \|\| ""\)\.startsWith\("dsh-purge"\)(?! \|\| String\(section\?\.name \|\| ""\)\.startsWith\("dshpg-"\))/g,
    PHASE1_KEEP_EXPR,
  );
  next = next.replace(
    /section => PERSONA_SECTION_NAMES\.has\(section\?\.name\)(?! \|\|)/g,
    `section => ${PHASE1_KEEP_EXPR}`,
  );
  return crlf ? next.replace(/\n/g, "\r\n") : next;
}
