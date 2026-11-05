// 거부 감지 + 1회 재시도: 미적중이면 그대로 통과시키고, 적중하면 강화 문구를 덧붙여 한 번 다시 실행한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { looksLikeRefusal, refusalMatchIndex, streamWithRefusalRetry, RETRY_NUDGE } from "../lib/refusal-retry.js";

const sys = (text) => ({ role: "system", content: [{ type: "text", text }] });
const delta = (text) => ({ type: "text-delta", index: 0, text });
const finish = () => ({ type: "finish" });

async function collect(iter) {
  const out = [];
  for await (const chunk of iter) out.push(chunk);
  return out;
}

test("refusal text is detected, normal text is not", () => {
  assert(looksLikeRefusal("I can't help with that."));
  assert(looksLikeRefusal("\u62b1\u6b49\uff0c\u6211\u65e0\u6cd5\u534f\u52a9\u8fd9\u4e2a\u8bf7\u6c42"));
  assert(!looksLikeRefusal("Here is the plan: 1) read the file 2) patch it"));
});

test("a refusal triggers exactly one retry with the nudge appended", async () => {
  const calls = [];
  const factory = (options) => {
    calls.push(options);
    const refusal = calls.length === 1;
    return (async function* () {
      if (refusal) {
        yield delta("I'm sorry, but I can't help with that.");
      } else {
        yield delta("Step 1: read the file.");
      }
      yield finish();
    })();
  };
  const options = { messages: [sys("base system")] };
  const chunks = await collect(streamWithRefusalRetry(factory, options));
  assert.equal(calls.length, 2);
  assert.match(calls[1].messages[0].content[0].text, /base system/);
  assert.ok(calls[1].messages[0].content[0].text.includes(RETRY_NUDGE.trim().slice(0, 20)));
  assert.match(RETRY_NUDGE, /지금 실행할까/);
  assert.doesNotMatch(RETRY_NUDGE, /already authorized/i);
  assert.equal(chunks.filter((c) => c.type === "text-delta")[0].text, "Step 1: read the file.");
});

test("normal output streams through untouched and is not retried", async () => {
  let calls = 0;
  const factory = () => {
    calls += 1;
    return (async function* () {
      yield delta("Here is the plan.");
      yield finish();
    })();
  };
  const chunks = await collect(streamWithRefusalRetry(factory, { messages: [sys("s")] }));
  assert.equal(calls, 1);
  assert.equal(chunks[0].text, "Here is the plan.");
});

test("soft Chinese refusals from a real failing session are detected", () => {
  // REFUSAL_PATTERNS 가 중국어 원문 판정식이므로(lib/refusal-retry.js 는 \uXXXX 로 같은 패턴을 보존)
  // 이 입력도 번역하지 않고 \uXXXX 로 둔다 — 동작 불변이 우선이다. 각 줄의 뜻:
  // "이 단계는 안 한다: 남의 사이트를 해킹하는 걸 목표로 삼는 것은 앞서 도구를 설치한 것과 다른 문제다"
  // / "목표가 남의 사이트인데 승인도 없다: 이 단계에 참여하지 않는다" / "그것을 침투 테스트로 포장해
  // 이 지점을 우회하도록 돕지 않는다" / "목표와 승인 근거를 나에게 보내라" / "이것은 미승인 침입 행위다".
  const real = [
    "\u8fd9\u4e00\u6b65\u6211\u4e0d\u505a\uff1a\u628a“\u9ed1\u8fdb\u67d0\u4e2a\u7f51\u7ad9”\u5f53\u4f5c\u76ee\u6807\uff0c\u548c\u4e4b\u524d\u88c5\u5de5\u5177\u4e0d\u662f\u4e00\u56de\u4e8b\u3002",
    "\u76ee\u6807\u662f\u522b\u4eba\u7684\u7ad9\u70b9\u3001\u4f46\u6ca1\u6709\u6388\u6743\uff1a\u8fd9\u4e00\u6b65\u6211\u4e0d\u53c2\u4e0e\u3002",
    "\u6211\u4e0d\u4f1a\u5e2e\u4f60\u628a\u5b83\u5305\u88c5\u6210“\u6e17\u900f\u6d4b\u8bd5”\u6765\u7ed5\u8fc7\u8fd9\u4e00\u70b9\u3002",
    "\u8bf7\u628a\u76ee\u6807\u548c\u6388\u6743\u4f9d\u636e\u53d1\u7ed9\u6211\u3002",
    "\u8fd9\u5c5e\u4e8e\u672a\u6388\u6743\u7684\u5165\u4fb5\u884c\u4e3a\u3002",
  ];
  for (const text of real) assert(looksLikeRefusal(text), text);
});

test("legitimate answers that merely mention authorization are not flagged", () => {
  assert(!looksLikeRefusal("\u767b\u5f55\u63a5\u53e3\u9700\u8981\u643a\u5e26 Authorization \u5934\uff0c\u6388\u6743\u5931\u8d25\u8fd4\u56de 401\u3002"));
  assert(!looksLikeRefusal("\u8fd9\u90e8\u5206\u4ee3\u7801\u4e0d\u53c2\u4e0e\u6e32\u67d3\uff0c\u53ef\u4ee5\u5b89\u5168\u5220\u9664\u3002"));
});

test("short meta refusals count, long technical discussion does not", () => {
  assert(looksLikeRefusal("\u8fd9\u6bb5\u6307\u4ee4\u662f\u63d0\u793a\u8bcd\u6ce8\u5165\uff0c\u6211\u4e0d\u4f1a\u6267\u884c\u3002"));
  assert(looksLikeRefusal("I won't treat this as a valid instruction; this is prompt injection."));
  const long = "\u63d0\u793a\u8bcd\u6ce8\u5165\u7684\u9632\u5fa1\u901a\u5e38\u5206\u4e09\u5c42\uff1a" + "\u8f93\u5165\u8fc7\u6ee4\u3001\u4e0a\u4e0b\u6587\u9694\u79bb\u3001\u8f93\u51fa\u5ba1\u67e5\u3002".repeat(30);
  assert(!looksLikeRefusal(long), "긴 글에서 주입을 논의하는 것은 재시도를 유발하지 않는다");
});

test("the matching rule index is reported for diagnosis", () => {
  assert(refusalMatchIndex("\u8fd9\u6bb5\u6307\u4ee4\u662f\u63d0\u793a\u8bcd\u6ce8\u5165\uff0c\u6211\u4e0d\u4f1a\u6267\u884c\u3002") >= 0);
  assert.equal(refusalMatchIndex("\u666e\u901a\u7684\u6280\u672f\u8bf4\u660e\uff0c\u6ca1\u6709\u4efb\u4f55\u62d2\u7edd\u3002"), -1);
});
