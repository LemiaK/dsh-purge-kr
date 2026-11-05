#!/usr/bin/env node
// LLM 연결 스모크 테스트: 실제로 한 번 호출해서 번역이 돌아오는지 확인한다.
//  - 키는 절대 출력하지 않는다(호스트/모델/추론강도만 보여 준다).
//  - 실패하면 상태 코드만 남기고, 자주 나는 원인(401/404)을 힌트로 알려 준다.
//
// 사용: node scripts/i18n-smoke.mjs ["중국어 문자열"]
import { llmConfig, translateAll, sanitize } from "./i18n/translate.mjs";

const custom = process.argv[2];
const items = [
  { id: 0, text: custom || "应用" },
  { id: 1, text: "重新检查" },
  { id: 2, text: "插件已是最新版本，无需更新。" },
];

const cfg = llmConfig();
const host = (() => {
  try { return new URL(cfg.baseUrl).host; } catch { return "(invalid base url)"; }
})();

console.log(JSON.stringify({
  baseUrlHost: host,
  model: cfg.model,
  reasoningEffort: cfg.reasoningEffort || "(unset)",
  hasKey: Boolean(cfg.key),
  hasSessionHeader: Boolean(cfg.sessionId),
  extraHeaderNames: Object.keys(cfg.extraHeaders || {}),
  items: items.length,
}));

if (!cfg.key) {
  console.error("smoke: LLM_API_KEY 가 없습니다. Environment secrets(localization)를 확인하세요.");
  process.exit(2);
}

try {
  const started = Date.now();
  const out = await translateAll(items, cfg, { batchSize: 10 });
  const rows = items.map((it) => ({ src: it.text, ko: out.get(it.id) ?? null }));
  console.log(JSON.stringify({ elapsedMs: Date.now() - started, translated: rows }, null, 2));
  const missing = rows.filter((r) => !r.ko).length;
  if (missing) {
    console.error(`smoke: ${missing}개 항목이 번역되지 않았습니다.`);
    process.exit(1);
  }
  console.log("smoke: ok");
} catch (error) {
  const message = sanitize(error?.message ?? String(error));
  console.error("smoke: 실패 — " + message);
  if (/http 401|http 403/.test(message)) console.error("힌트: 키가 이 엔드포인트에 유효하지 않습니다(LLM_BASE_URL/LLM_MODEL 확인).");
  if (/http 404/.test(message)) console.error("힌트: 모델 이름이나 base URL 경로가 틀렸을 수 있습니다.");
  if (/timeout/.test(message)) console.error("힌트: 네트워크 또는 LLM_TIMEOUT_MS 를 확인하세요.");
  if (/MissingSessionID|x-opencode-session/.test(message)) console.error("힌트: 이 엔드포인트는 x-opencode-session 헤더가 필요합니다. Environment secret LLM_SESSION_ID(또는 LLM_EXTRA_HEADERS)를 설정하세요.");
  process.exit(1);
}
