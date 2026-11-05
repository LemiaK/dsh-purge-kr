// LLM 호출 계층: OpenAI 호환 /chat/completions 만 쓴다.
// 보안 규칙
//  - 키는 환경변수(LLM_API_KEY)로만 받고, 어떤 로그·파일·에러 메시지에도 남기지 않는다.
//  - 실패 시 응답 본문을 그대로 출력하지 않는다(자격 증명·프롬프트 유출 방지). 상태 코드와 길이만 남긴다.
//  - 네트워크 호출은 --allow-network 를 명시했을 때만 일어난다.
import { setTimeout as delay } from "node:timers/promises";

export const DEFAULT_MODEL = "gpt-4o-mini";
export const DEFAULT_BASE_URL = "https://api.openai.com/v1";

/** 키를 로그/에러에서 지운다. 호출부는 항상 이 함수를 거쳐 출력한다. */
export function sanitize(text, key = process.env.LLM_API_KEY) {
  let out = String(text ?? "");
  if (key && key.length >= 6) out = out.split(key).join("***");
  return out.replace(/(Bearer\s+)[A-Za-z0-9._\-]{8,}/gi, "$1***");
}

export function llmConfig(env = process.env) {
  return {
    key: env.LLM_API_KEY || "",
    baseUrl: (env.LLM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    model: env.LLM_MODEL || DEFAULT_MODEL,
    reasoningEffort: normalizeEffort(env.LLM_REASONING_EFFORT),
    timeoutMs: Number(env.LLM_TIMEOUT_MS || 120000),
  };
}

/** 추론 강도는 제공자마다 표기가 달라서, 받아들이는 값만 통과시키고 나머지는 조용히 무시한다. */
export const REASONING_EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh", "max"];
export function normalizeEffort(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return REASONING_EFFORTS.includes(v) ? v : "";
}

/**
 * 요청 본문을 만든다. 추론 강도(LLM_REASONING_EFFORT)를 지정한 경우에만 필드를 넣는다.
 * 일부 게이트웨이는 이 필드를 400 으로 거절하므로, 호출부는 400 이면 필드를 빼고 한 번 더 시도한다.
 */
export function buildRequest(cfg, batch, { withReasoning = Boolean(cfg.reasoningEffort) } = {}) {
  const body = {
    model: cfg.model,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ items: batch }) },
    ],
    response_format: { type: "json_object" },
  };
  if (withReasoning && cfg.reasoningEffort) body.reasoning_effort = cfg.reasoningEffort;
  return body;
}

const SYSTEM_PROMPT = [
  "You translate strings and comments from a JavaScript repository's Chinese source text into Korean.",
  "Rules:",
  "1. Output Korean only. Keep English words, identifiers, file paths, numbers, URLs and CLI flags exactly as they are.",
  "2. Never translate host source snippets, patch anchors or marker strings — if a segment looks like source code, return it unchanged.",
  "3. Use a polite technical register (합니다/하세요). Labels stay noun-form (적용, 되돌리기).",
  "4. Preserve leading/trailing punctuation and interpolation placeholders such as ${...} or {{model}}.",
  "5. Return JSON only: {\"items\":[{\"id\":<number>,\"ko\":\"<translation>\"}]} with exactly the ids you were given.",
].join("\n");

/**
 * @param {{id:number,text:string}[]} batch
 * @param {ReturnType<typeof llmConfig>} cfg
 * @returns {Promise<Map<number,string>>}
 */
export async function translateBatch(batch, cfg) {
  if (!cfg.key) throw new Error("LLM_API_KEY is not set");
  let withReasoning = Boolean(cfg.reasoningEffort);
  let lastError = "";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const body = buildRequest(cfg, batch, { withReasoning });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
    try {
      const res = await fetch(cfg.baseUrl + "/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + cfg.key },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        // 본문을 읽지 않고 상태 코드만 남긴다.
        lastError = "http " + res.status;
        // 추론 강도 필드를 모르는 제공자(400)라면 필드를 빼고 한 번 더 시도한다.
        if (res.status === 400 && withReasoning) {
          withReasoning = false;
          continue;
        }
        if (res.status >= 400 && res.status < 500 && res.status !== 429) break;
        await delay(800 * attempt);
        continue;
      }
      const json = await res.json();
      const content = json?.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(content);
      const out = new Map();
      for (const row of parsed?.items ?? []) {
        if (typeof row?.id === "number" && typeof row?.ko === "string" && row.ko.trim()) out.set(row.id, row.ko);
      }
      if (!out.size) throw new Error("empty translation payload");
      return out;
    } catch (error) {
      lastError = error?.name === "AbortError" ? "timeout" : sanitize(error?.message ?? String(error), cfg.key);
      await delay(800 * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("translation failed: " + lastError);
}

/** 배치 크기로 나눠 순서대로 호출한다(레이트리밋 보호). */
export async function translateAll(items, cfg, { batchSize = 40 } = {}) {
  const out = new Map();
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const got = await translateBatch(batch, cfg);
    for (const [id, ko] of got) out.set(id, ko);
  }
  return out;
}
