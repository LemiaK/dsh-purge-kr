import {hasDesktopIdentity} from "./desktop-identity.js";
import path from "node:path";
import fs from "node:fs";

/** 현재 연결된 호스트 표면. gui / tui 는 우선 인식만 하고, 대응은 아직 web 으로 되돌린다. */
export const SURFACES = Object.freeze(["web", "desktop", "gui", "tui"]);

function norm(value) {
  return String(value || "").trim().toLowerCase();
}

function slash(value) {
  return String(value || "").replace(/\\/g, "/").toLowerCase();
}

export function pathLooksDesktop(p) {
  const n = slash(p);
  if (!n) return false;
  // 설치 디렉터리 이름은 "DeepSeek Harness" / "deepseek-harness" / "DeepseekHarnessDesktop" 일 수 있다.
  // 소스 저장소도 deepseek-harness 이름을 자주 쓰므로, resources/ 나 exe, .app/ 까지 있어야 데스크톱 설치로 본다.
  const harnessDir =
    n.includes("/deepseek harness/") ||
    n.includes("/deepseek-harness/") ||
    n.includes("/deepseekharness") ||
    /\/deepseek[\s._-]*harness/.test(n);
  return (
    n.includes("/dsh desktop/") ||
    n.includes("/dsh desktop.app/") ||
    n.includes("dsh-desktop") ||
    n.includes("dsh-plugin-desktop") ||
    n.includes("/deepseek harness.app/") ||
    (harnessDir && (n.includes("/resources/") || n.includes("/contents/resources/") || n.endsWith("/resources"))) ||
    /\/dsh desktop\.exe$/i.test(n) ||
    /\/deepseek[\s._-]*harness\.exe$/i.test(n) ||
    n.endsWith("/host-process-entry.js") ||
    n.endsWith("/desktop-cli.js")
  );
}

function inferResourcesFromExec(execPath) {
  if (!execPath) return "";
  try {
    const norm = path.normalize(execPath);
    const slashPath = norm.replace(/\\/g, "/").toLowerCase();
    if (slashPath.includes("/contents/macos/")) {
      const macosDir = path.dirname(norm);
      const res = path.resolve(macosDir, "../Resources");
      if (fs.existsSync(res)) return res;
    }
    const res = path.join(path.dirname(norm), "resources");
    if (fs.existsSync(res)) return res;
  } catch {}
  return "";
}

function resourcesLookLikeDesktopInstall(resourcesPath) {
  return hasDesktopIdentity(resourcesPath);
}

export function isDesktopSurface(input = {}) {
  const env = input.env ?? process.env;
  const forced = norm(env.DSH_SURFACE);
  if (forced === "desktop") return true;
  if (forced && SURFACES.includes(forced)) return false;
  const execPath = input.execPath ?? process.execPath;
  const resourcesPath = input.resourcesPath ?? (input.execPath !== undefined ? inferResourcesFromExec(execPath) : process.resourcesPath ?? inferResourcesFromExec(execPath));
  return resourcesLookLikeDesktopInstall(resourcesPath);
}

function forcedSurface(env) {
  const forced = norm(env.DSH_SURFACE);
  return SURFACES.includes(forced) ? forced : "";
}

export function detectSurface(input = {}) {
  const env = input.env ?? process.env;
  const forced = forcedSurface(env);
  if (forced) return forced;
  if (isDesktopSurface(input)) return "desktop";
  return "web";
}

/** gui / tui 는 아직 따로 대응하지 않았으므로 우선 web 재시작과 프로브를 쓴다. */
export function adapterFor(kind) {
  return kind === "desktop" ? "desktop" : "web";
}
