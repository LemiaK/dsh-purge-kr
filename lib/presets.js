// User-plane agent presets that ship with the plugin.
//
// `unrestricted` is a skeleton: the preset owns the persona and tool plane, while
// approvals/sandbox stay with the host — those gates are removed by host patches,
// not by the preset. Installing it also gives patches #24 / #76 something to act on.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findDshHome, ALL_PATCHES, applyReplacementsToText } from "./core.js";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const UNRESTRICTED_PRESET = "unrestricted";
export const PRESET_FILES = ["preset.yml", "agent.cordis.yml"];
/** 플러그인이 직접 쓴 파일에는 이 줄이 붙는다. 이 줄이 있으면 새 버전이 덮어쓰고, 지우면 사용자 정의로 본다. */
export const MANAGED_MARKER = "# managed-by: dsh-purge";

export function bundledPresetDir(name = UNRESTRICTED_PRESET) {
  return path.join(ROOT, "presets", name);
}

export function userPresetDir(home, name = UNRESTRICTED_PRESET) {
  const base = home || findDshHome();
  if (!base) throw new Error("DSH 데이터 디렉터리를 찾지 못했습니다");
  return path.join(base, ".agent-presets", name);
}

/**
 * 번들 프리셋을 사용자 디렉터리에 배치한다.
 * 이미 있고 force 가 없으면 **덮어쓰지 않는다**(사용자가 수정했을 수 있다). kept 만 보고한다.
 * @returns {{ action: 'installed'|'updated'|'kept', dir: string, files: string[] }}
 */
export function installPreset({ name = UNRESTRICTED_PRESET, force = false, home } = {}) {
  const src = bundledPresetDir(name);
  if (!fs.existsSync(src)) throw new Error(`릴리스 패키지에 프리셋이 없습니다: ${src}`);
  const dir = userPresetDir(home, name);
  const agentFile = path.join(dir, "agent.cordis.yml");
  const exists = fs.existsSync(agentFile);
  let managed = false;
  if (exists) {
    try {
      managed = fs.readFileSync(agentFile, "utf8").startsWith(MANAGED_MARKER);
    } catch {
      managed = false;
    }
  }
  if (exists && !force && !managed) return { action: "kept", dir, files: PRESET_FILES.slice() };
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  for (const file of PRESET_FILES) {
    const from = path.join(src, file);
    if (!fs.existsSync(from)) continue;
    fs.copyFileSync(from, path.join(dir, file));
  }
  // 방금 기록된 템플릿은 아직 출하 값(web fetch: false)이다. 여기서 패치 #24 의 치환을 함께 적용한다.
  // 그렇지 않으면 사용자가 자체 점검에서 "#24 적용 대기" 빨간 줄을 보게 된다. 단지 "적용"을 기다리는 것일 뿐인데 탈옥 실패로 오판하기 쉽다.
  try {
    const mergePatch = ALL_PATCHES.find((p) => p.id === 24);
    const agentFile = path.join(dir, "agent.cordis.yml");
    const text = fs.readFileSync(agentFile, "utf8");
    const applied = applyReplacementsToText(text, mergePatch, agentFile);
    if (applied.changed) fs.writeFileSync(agentFile, applied.text);
  } catch {
    /* 패치 표를 쓸 수 없으면 템플릿을 그대로 두고 정상적인 "적용" 절차에 맡긴다 */
  }
  return { action: exists ? "updated" : "installed", dir, files: PRESET_FILES.slice() };
}

export function presetStatus(home, name = UNRESTRICTED_PRESET) {
  let dir = "";
  try {
    dir = userPresetDir(home, name);
  } catch {
    return { name, dir: "", installed: false };
  }
  const file = path.join(dir, "agent.cordis.yml");
  return { name, dir, installed: fs.existsSync(file), file };
}
