// Runtime probe: prove that the prompt path actually reaches the model.
//
// 파일에 패치가 기록되고 section 이 등록된 것은 "호스트 측 준비 완료"만 증명한다. 실제로 검증할 것은
// "모델이 받았는지"다. 방법: 일회용 nonce 를 기록하고 시스템 프롬프트 끝에
// "보이면 이 nonce 를 그대로 되돌려 출력한다"는 짧은 지시를 붙인다. 모델이 되돌려주면 = 이 경로가 실제로 통했다는 뜻이다.
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { findDshHome } from "./core.js";

export const PROBE_SECTION = "dsh-purge:probe";
export const PROBE_TTL_MS = 30 * 60 * 1000;

function probePath(dshHome) {
  const home = dshHome || findDshHome();
  if (!home) return "";
  return path.join(home, "dsh-purge", "probe.json");
}

export function readProbe(dshHome) {
  const file = probePath(dshHome);
  if (!file) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data || typeof data.nonce !== "string" || !data.nonce) return null;
    const at = Number(data.at) || 0;
    if (!at || Date.now() - at > PROBE_TTL_MS) {
      try {
        fs.rmSync(file, { force: true });
      } catch {
        /* ignore */
      }
      return null;
    }
    return { nonce: data.nonce, at };
  } catch {
    return null;
  }
}

export function createProbe(dshHome) {
  const file = probePath(dshHome);
  if (!file) throw new Error("DSH 데이터 디렉터리를 찾지 못해 프로브를 기록할 수 없습니다");
  const nonce = "purge-" + randomBytes(4).toString("hex");
  const at = Date.now();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, JSON.stringify({ nonce, at }, null, 2), { mode: 0o600 });
  return { nonce, at, message: probeMessage(nonce) };
}

export function probeMessage(nonce) {
  return [
    "다음 줄을 그대로 출력하세요(고쳐 쓰지 말고 설명도 하지 마세요):",
    `[${nonce}]`,
    "",
    "이 줄이 응답에 그대로 나타나면 purge 의 주입이 모델 컨텍스트에 실제로 도달했다는 뜻입니다.",
  ].join("\n");
}

/** 프로브가 살아 있을 때 주입하는 섹션 본문. 만료되면 빈 문자열을 반환한다. */
export function probeText(dshHome) {
  const probe = readProbe(dshHome);
  if (!probe) return "";
  return [
    "<dsh_probe>",
    "이 시스템 프롬프트는 dsh-purge 가 기록했으며, 주입 경로가 모델에 도달했는지 검증하는 데 씁니다.",
    `이 섹션이 당신의 컨텍스트에 있다면 응답 맨 끝에 별도 줄로 그대로 출력하세요: [${probe.nonce}]`,
    "</dsh_probe>",
  ].join("\n");
}
