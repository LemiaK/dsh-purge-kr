// Restore only known Purge rewrites of ordinary message delivery. No profile,
// prompt, permissions, or live Agent state is read or written by this module.
export const NATIVE_QUEUE_GUARD =
  '\t\tif (request.action.kind === "steer" && (target !== "next-turn" || agent.status !== "running")) throw new RemoteError("session/steer-unavailable", "current turn no longer accepts steering", { itemId: request.itemId });';
export const NATIVE_PROMPT =
  '\t\t\t\t\tif (request.mode === "steer") agent.steer(message);\n\t\t\t\t\telse agent.followup(message);';
export const NATIVE_QUEUE_CASE =
  '\t\t\tcase "steer":\n\t\t\t\tagent.inbox.remove(request.itemId);\n\t\t\t\tagent.steer(message);';
export const NATIVE_STEER =
  '\tsteer(input) {\n\t\tthis.send(input, "next-step", true);\n\t}';
export const OLD_QUEUE_FALLBACK =
  '\t\tif (request.action.kind === "steer" && (target !== "next-turn" || agent.status !== "running")) {\n' +
  "\t\t\t// [dsh-purge] steer degrades to followup instead of failing\n" +
  "\t\t\tagent.inbox.remove(request.itemId);\n" +
  "\t\t\tagent.followup(message);\n" +
  '\t\t\treturn { accepted: true, degraded: "followup" };\n' +
  "\t\t}";
export const OLD_PROMPT =
  "\t\t\t\t\tagent.followup(message); // [dsh-purge-85] user prompt always next-turn (kill steer→next-step race)";
export const OLD_QUEUE_CASE =
  '\t\t\tcase "steer":\n\t\t\t\tagent.inbox.remove(request.itemId);\n\t\t\t\tagent.followup(message); // [dsh-purge-86] queue steer → next-turn';
export const OLD_STEER =
  '\tsteer(input) {\n\t\tthis.send(input, "next-turn", true); // [dsh-purge-86] user steer always next-turn\n\t}';
export const UPSTREAM_RECOVERED_STEER =
  '\tsteer(input) {\n\t\tthis.send(input, "next-step", true); // [dsh-purge-86] steer() stays next-step for send_message\n\t}';

export const STEERING_RESTORE_PATCH = {
  id: 90,
  name: "RESTORE_NATIVE_STEERING",
  layer: "코드",
  layer_en: "Code",
  desc: "네이티브 끼어들기와 대기열 순서를 복원하고 옛 #85/#86/#90 를 마이그레이션한다 / restore native steering and queue order",
  file: ["api-session-controller", "agent-loop"],
  // optional 을 쓰지 않는다: 끼어들기는 사용자가 직접 체감하는 동작이므로 앵커 불일치는 반드시 보고해야 하고,
  // 선택 패치처럼 soft-ok 로 조용히 넘어가면 안 된다(strictFiles 의 강제 실패 의미를 유지한다).
  strictFiles: true,
  forbid: [
    "[dsh-purge-85]",
    "[dsh-purge-86]",
    "[dsh-purge] steer degrades to followup",
  ],
  replacements: [
    { pattern: OLD_QUEUE_FALLBACK, replace: NATIVE_QUEUE_GUARD },
    { pattern: OLD_PROMPT, replace: NATIVE_PROMPT },
    { pattern: OLD_QUEUE_CASE, replace: NATIVE_QUEUE_CASE },
    { pattern: OLD_STEER, replace: NATIVE_STEER },
    { pattern: UPSTREAM_RECOVERED_STEER, replace: NATIVE_STEER },
  ],
};

// A marker on one branch cannot certify a whole controller. Unknown or partial
// rewrites stay unmodified and are reported by strictFiles, not silently settled.
export function nativeSteeringRestored(text) {
  const source = String(text).replace(/\r\n/g, "\n");
  if (STEERING_RESTORE_PATCH.forbid.some((marker) => source.includes(marker)))
    return false;
  const controller = source.includes("async updateQueue(");
  const loop = source.includes("\tsteer(input) {");
  if (!controller && !loop) return false;
  return (
    (!controller ||
      [NATIVE_QUEUE_GUARD, NATIVE_PROMPT, NATIVE_QUEUE_CASE].every((part) =>
        source.includes(part),
      )) &&
    (!loop || source.includes(NATIVE_STEER))
  );
}
