/** Official DSH format-1 index, generated only from published stable releases. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const repo = "wnduddld0513/dsh-purge-kr";
export function buildMarket(releases, git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim()) {
  const versions = releases.filter((r) => !r.draft && !r.prerelease && /^v1\.(?:[7-9]|[1-9]\d)\.\d+$|^v1\.6\.(?:[5-9]|[1-9]\d)$|^v[2-9]\d*\.\d+\.\d+$/.test(r.tag_name))
    .map((r) => {
      const version = r.tag_name.slice(1);
      if (!r.assets?.some((a) => a.name === `dsh-purge-community-${version}.tgz`)) return null;
      const manifest = JSON.parse(git(["show", `${r.tag_name}:package.json`]));
      if (manifest.name !== "dsh-purge-community" || manifest.version !== version || !manifest.dsh?.bundle)
        throw Error(`Invalid bundle manifest at ${r.tag_name}`);
      const commit = git(["rev-parse", `${r.tag_name}^{commit}`]);
      const publishTimestamp = Math.floor(Date.parse(r.published_at) / 1000);
      if (!/^[0-9a-f]{40}$/.test(commit) || !Number.isFinite(publishTimestamp)) throw Error("Invalid release identity");
      return { version, publishTimestamp, source: { type: "git", url: `https://github.com/${repo}`, commit },
        engines: { dsh: ">=0.2.1-rc.1 <0.2.2-0" } };
    }).filter(Boolean).sort((a,b) => b.publishTimestamp-a.publishTimestamp);
  if (!versions.length) throw Error("No published market-qualified release (>=1.6.5)");
  return { format: 1, title: { en: "dsh-purge Community", ko: "dsh-purge Community 플러그인 소스" },
    description: { en: "Verified releases maintained by wnduddld0513.", ko: "wnduddld0513 이 유지하는 정식 릴리스 버전." },
    plugins: [{ name: "dsh-purge-community", title: { en: "dsh-purge Community", ko: "dsh-purge Community" },
      description: { en: "Host-policy patches, prompt/rule management, diagnostics, verified updates, and local backup/rollback.", ko: "호스트 정책 패치, 프롬프트·규칙 관리, 진단, 검증된 업데이트, 로컬 백업·롤백." },
      author: "wnduddld0513; original dsh-purge by YuJunZhiXue",
      homepage: `https://github.com/${repo}#readme`, repository: { url: `https://github.com/${repo}` },
      icon: "data:image/svg+xml;base64," + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#166534"/><text x="32" y="45" text-anchor="middle" fill="white" font-size="44" font-family="sans-serif">P</text></svg>').toString("base64"),
      versions }] };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const input = process.argv.indexOf("--releases");
  let releases;
  if (input >= 0) releases = JSON.parse(fs.readFileSync(process.argv[input + 1], "utf8"));
  else {
    const headers = { "user-agent": "purge-community-market", accept: "application/vnd.github+json" };
    if (process.env.GH_TOKEN) headers.authorization = `Bearer ${process.env.GH_TOKEN}`;
    const response = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, { headers, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw Error(`Release list HTTP ${response.status}`);
    releases = await response.json();
  }
  const out = process.env.MARKET_OUTPUT || "market-dist";
  const index = buildMarket(releases);
  const qwenURL = "https://kingcharleslzy-ai.github.io/dsh-qwen-studio/index.json";
  const qwenResponse = await fetch(qwenURL, { signal: AbortSignal.timeout(30000), redirect: "error" });
  if (!qwenResponse.ok) throw Error(`Qwen market HTTP ${qwenResponse.status}; existing published index remains intact`);
  const qwen = await qwenResponse.json();
  const plugin = qwen.plugins?.find(p => p.name === "dsh-qwen-studio");
  if (qwen.format !== 1 || !plugin || plugin.repository?.url !== "https://github.com/kingcharleslzy-ai/dsh-qwen-studio" ||
    !plugin.versions?.length || plugin.versions.some(v => v.source?.type !== "git" || v.source?.url !== plugin.repository.url || !/^[a-f0-9]{40}$/.test(v.source.commit)))
    throw Error("Qwen market identity or pinned sources invalid");
  index.title = { en: "Charles DSH plugins", ko: "Charles DSH 플러그인 소스" };
  index.description = { en: "Verified dsh-purge Community and Qwen Studio releases.", ko: "Purge 커뮤니티판과 이미지 Qwen Studio 의 검증된 릴리스 버전." };
  index.metadata = qwen.metadata;
  index.plugins.push(plugin);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(index, null, 2) + "\n");
  fs.writeFileSync(path.join(out, "index.html"), '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Charles DSH 플러그인 소스</title><main><h1>Charles DSH 플러그인 소스</h1><p>DSH → 플러그인 → 실험적 플러그인 → 사용자 정의 플러그인 마켓 → 발견 → 인덱스 소스 추가.</p><p>인덱스: <a href="index.json">index.json</a>. 이 링크의 전체 주소를 복사해 추가한다.</p><p>dsh-purge Community 와 이미지 Qwen Studio 를 포함한다. <a href="https://github.com/kingcharleslzy-ai/dsh-qwen-studio">이미지 플러그인 설치와 Agent 안내</a>.</p><p>호스트 정책 패치, 프롬프트 관리, 진단, 업데이트, 백업·롤백. 설치는 로컬 플러그인을 수정한다; 호스트 패치 적용은 별도 동작이다. 플러그인 업그레이드 후 DSH 를 직접 재시작한다.</p><p><a href="https://github.com/wnduddld0513/dsh-purge-kr">소스와 설치 안내</a> · <a href="https://github.com/wnduddld0513/dsh-purge-kr/releases/latest">최신 릴리스 패키지</a></p></main></html>\n');
  console.log(`Generated ${index.plugins[0].versions.length} pinned market versions`);
}
