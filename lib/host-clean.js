/** 재시작 전에 시스템 프롬프트 파일을 본다: 표식이 기록되었거나, 현재 원문에 옛 차단 두 곳이 이미 없다. */
export function hostPromptKeepsInject(text) {
  const body = String(text || "");
  const identityMarked = body.includes("[dsh-purge] identity stripped");
  const injectMarked = body.includes("[dsh-purge] complete prompt keeps waterfall inject")
    || body.includes("[dsh-purge] complete prompt keeps inject");
  if (identityMarked && injectMarked) return true;
  // 빈 파일이거나 이 모듈이 아니면 이미 정리된 것으로 보지 않는다.
  if (!body.includes("system-prompt/assemble")) return false;
  const identityLeft = body.includes("You are an AI agent powered by DeepSeek Harness.");
  const dropsInject = body.includes("transformed.sections : [completeSection]");
  return !identityLeft && !dropsInject;
}
