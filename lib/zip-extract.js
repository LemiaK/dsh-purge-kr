import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const HIDDEN = {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
  windowsHide: true,
  timeout: 60000,
};

/** 플랫폼별 압축 해제 순서. node 방식은 외부 명령을 쓰지 않아 macOS / Linux / Windows 어디서나 동작한다. */
export function unzipTools(platform = process.platform) {
  if (platform === "win32") return ["tar", "powershell", "node"];
  return ["tar", "unzip", "python3", "bsdtar", "node"];
}

function safeZipName(name) {
  const rel = String(name || "").replace(/\\/g, "/").replace(/^\.?\//, "").replace(/\/+$/, "");
  if (!rel) return "";
  if (rel.startsWith("/") || /^[A-Za-z]:/.test(rel)) throw new Error("zip 경로가 올바르지 않습니다");
  const parts = rel.split("/");
  if (parts.some((part) => part === ".." || part === "")) throw new Error("zip 경로가 올바르지 않습니다");
  return parts.join("/");
}

function findEocd(buf) {
  const min = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= min; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) return i;
  }
  throw new Error("zip 가 아닙니다");
}

function readZipEntries(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 22) throw new Error("zip 가 아닙니다");
  const eocd = findEocd(buf);
  const total = buf.readUInt16LE(eocd + 10);
  let cursor = buf.readUInt32LE(eocd + 16);
  const entries = [];
  for (let n = 0; n < total; n += 1) {
    if (cursor + 46 > buf.length || buf.readUInt32LE(cursor) !== 0x02014b50) {
      throw new Error("zip 목록이 손상되었습니다");
    }
    const method = buf.readUInt16LE(cursor + 10);
    const compSize = buf.readUInt32LE(cursor + 20);
    const nameLen = buf.readUInt16LE(cursor + 28);
    const extraLen = buf.readUInt16LE(cursor + 30);
    const commentLen = buf.readUInt16LE(cursor + 32);
    const localOffset = buf.readUInt32LE(cursor + 42);
    const name = buf.toString("utf8", cursor + 46, cursor + 46 + nameLen);
    entries.push({ name, method, compSize, localOffset });
    cursor += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

export function listZipEntries(buf) {
  return readZipEntries(buf).map((entry) => entry.name.replace(/\\/g, "/"));
}

export function listZipFile(zipPath) {
  return listZipEntries(fs.readFileSync(zipPath));
}

function localDataOffset(buf, localOffset) {
  if (localOffset + 30 > buf.length || buf.readUInt32LE(localOffset) !== 0x04034b50) {
    throw new Error("zip 로컬 헤더가 손상되었습니다");
  }
  const nameLen = buf.readUInt16LE(localOffset + 26);
  const extraLen = buf.readUInt16LE(localOffset + 28);
  return localOffset + 30 + nameLen + extraLen;
}

export function extractZipBuffer(buf, dest, { maxBytes = 200 * 1024 * 1024 } = {}) {
  let totalBytes = 0;
  const seen = new Set();
  fs.mkdirSync(dest, { recursive: true });
  const root = path.resolve(dest);
  for (const entry of readZipEntries(buf)) {
    const rel = safeZipName(entry.name);
    if (!rel) continue;
    if (seen.has(rel)) throw new Error("zip 에 중복 경로가 있습니다");
    seen.add(rel);
    if (entry.name.endsWith("/")) { fs.mkdirSync(path.join(root, rel), { recursive: true }); continue; }
    if (entry.compSize === 0xffffffff || entry.localOffset === 0xffffffff) {
      throw new Error("zip64 는 지원하지 않습니다");
    }
    if (entry.method !== 0 && entry.method !== 8) {
      throw new Error(`지원하지 않는 zip 압축 방식 ${entry.method}`);
    }
    const start = localDataOffset(buf, entry.localOffset);
    const end = start + entry.compSize;
    if (end > buf.length) throw new Error("zip 데이터가 잘렸습니다");
    const compressed = buf.subarray(start, end);
    const body = entry.method === 0 ? compressed : zlib.inflateRawSync(compressed, { maxOutputLength: Math.max(1, maxBytes - totalBytes) });
    totalBytes += body.length;
    if (totalBytes > maxBytes) throw new Error("zip 압축 해제 결과가 크기 상한을 넘었습니다");
    const out = path.resolve(root, rel);
    const prefix = root.endsWith(path.sep) ? root : root + path.sep;
    if (out !== root && !out.startsWith(prefix)) throw new Error("zip 경로가 올바르지 않습니다");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, body);
  }
}

function attempt(file, args, extra = {}) {
  try {
    execFileSync(file, args, {
      ...HIDDEN,
      stdio: ["ignore", "pipe", "pipe"],
      ...extra,
    });
    return "";
  } catch (error) {
    const detail = String((error && (error.stderr || error.stdout || error.message)) || "")
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)[0];
    return detail ? `${file}: ${detail}` : file;
  }
}

/** 플랫폼별 외부 도구를 차례로 시도하고 마지막에 Node 로 zip 을 푼다. 성공하면 사용한 방식을 반환한다. */
export function extractZipArchive(zipPath, dest, tools = unzipTools()) {
  fs.mkdirSync(dest, { recursive: true });
  const notes = [];
  for (const tool of tools) {
    if (tool === "node") {
      try {
        extractZipBuffer(fs.readFileSync(zipPath), dest);
        return "node";
      } catch (error) {
        notes.push(`node: ${error && error.message ? error.message : error}`);
        break;
      }
    }
    if (tool === "tar" || tool === "bsdtar") {
      const note = attempt(tool, ["-xf", zipPath, "-C", dest]);
      if (!note) return tool;
      notes.push(note);
      continue;
    }
    if (tool === "unzip") {
      const note = attempt("unzip", ["-o", "-q", zipPath, "-d", dest]);
      if (!note) return "unzip";
      notes.push(note);
      continue;
    }
    if (tool === "python3") {
      const note = attempt("python3", ["-m", "zipfile", "-e", zipPath, dest]);
      if (!note) return "python3";
      notes.push(note);
      continue;
    }
    if (tool === "powershell") {
      const note = attempt(
        "powershell",
        ["-NoProfile", "-Command", "Expand-Archive -LiteralPath $env:DSH_UPD_ZIP -DestinationPath $env:DSH_UPD_DIR -Force"],
        { env: { ...process.env, DSH_UPD_ZIP: zipPath, DSH_UPD_DIR: dest } },
      );
      if (!note) return "powershell";
      notes.push(note);
    }
  }
  throw new Error(`압축 해제 실패: ${notes.join(" | ") || "사용할 수 있는 압축 해제 도구가 없습니다"}`);
}
