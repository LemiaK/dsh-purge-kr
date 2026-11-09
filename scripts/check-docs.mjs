// 문서는 버전을 따라간다: 버전 번호, 릴리스 노트 첫 줄, README 의 버전 줄이 일치해야 한다.
// README.md 는 한국어 기본 본이고 docs/README.en.md 가 영문 사본이다. 두 벌 모두 같은 버전을 가리켜야 한다.
// CI 에서 실행해 "코드는 릴리스했는데 README 는 이전 버전에 멈춰 있는" 상태를 막는다.
import fs from "node:fs";
import { checkInstallExamples } from "./lib/check-install-examples.mjs";

const read = (file) => fs.readFileSync(file, "utf8");
const has = (file) => fs.existsSync(file);
const pkg = JSON.parse(read("package.json"));
const version = pkg.version;
const readme = read("README.md");
const agents = read("AGENTS.md");
const notes = read("release-notes.md");
const repository = pkg.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "") || "";
const rawBase = `raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install`;

const problems = [];

// 1. 릴리스 노트 첫 줄은 버전을 따른다.
const notesFirst = notes.split("\n")[0].trim();
if (notesFirst !== `# ${version}`) {
  problems.push(`release-notes.md 첫 줄은 "# ${version}" 이어야 하는데 실제는 "${notesFirst}"`);
}

// 2. AGENTS.md 사람용 머리말과 §9 버전 표.
if (!agents.includes(`현재 버전 **${version}**`)) {
  problems.push(`AGENTS.md 에 "현재 버전 **${version}**" 가 없다`);
}
if (!agents.includes(`\`dsh-purge-community\` ${version}`)) {
  problems.push(`AGENTS.md §9 버전 표가 ${version} 로 동기화되지 않았다`);
}

// 3. 유지보수·설치 문서의 현재 버전.
for (const file of ["docs/MAINTENANCE.md", "docs/INSTALLATION.md"]) {
  if (!has(file)) {
    problems.push(`${file} 가 없다`);
    continue;
  }
  if (!read(file).includes(`현재 버전 **${version}**`)) problems.push(`${file} 의 현재 버전이 ${version} 로 동기화되지 않았다`);
}

// 4. README(한국어 기본 본)에 반드시 있어야 하는 버전·설치 경계 문구.
for (const needle of ["scripts/install.ps1", "issue #7", "플러그인이 로드되기 전", "전역 npm 레지스트리"]) {
  if (!readme.includes(needle)) problems.push(`README.md 에 설치 경계 문구가 없다: ${needle}`);
}
if (!readme.includes(`**${version}**`)) {
  problems.push(`README.md 첫 화면에 버전 번호 **${version}** 가 없다`);
}
const hostLine = readme.match(/\*\*DSH Desktop ([0-9a-z.\-]+)\*\*/i);
if (!hostLine) problems.push("README.md 에 “**DSH Desktop …**” 대응 버전 줄이 없다");

// 4b. 영문 사본도 같은 버전을 가리켜야 한다(사본이 뒤처지면 바로 드러나게).
if (has("docs/README.en.md")) {
  const readmeEn = read("docs/README.en.md");
  if (!readmeEn.includes(`**${version}**`)) problems.push(`docs/README.en.md 의 버전이 ${version} 로 동기화되지 않았다`);
  if (!readmeEn.includes("README.md")) problems.push("docs/README.en.md 에 한국어 본으로 돌아가는 링크가 없다");
}

// 5. 설치기는 이 포크의 master 에서 내려받아야 한다(다른 저장소 raw 경로 금지).
for (const ext of ["sh", "ps1"]) {
  if (!readme.includes(`scripts/install.${ext}`)) continue;
  if (!readme.includes(`${rawBase}.${ext}`)) problems.push(`README.md 의 install.${ext} raw URL 이 이 포크(${rawBase}.${ext})가 아니다`);
}
const foreignInstallers = new Set();
for (const [, host] of readme.matchAll(/raw\.githubusercontent\.com\/([^/\s]+\/[^/\s]+)\/master\/scripts\/install\./g)) {
  if (host !== "wnduddld0513/dsh-purge-kr") foreignInstallers.add(host);
}
for (const host of foreignInstallers) problems.push(`README.md 에 다른 저장소의 설치기 raw URL 이 남아 있다: ${host}`);

// 6. 복사해 쓰는 릴리스 명령은 패키지 버전을 따라가야 하며, 옛 TGZ 를 남기면 안 된다.
{
  const links = [...readme.matchAll(/releases\/download\/v([0-9.]+)\/dsh-purge-community-([0-9.]+)\.tgz/g)];
  if (!links.length) problems.push(`README.md 에 고정 버전 v${version} TGZ 설치 출처가 없다`);
  for (const [, tag, archive] of links) if (tag !== version || archive !== version)
    problems.push(`README.md 의 CLI 설치 링크 버전은 ${version} 이어야 하는데 v${tag}/dsh-purge-community-${archive}.tgz 가 있다`);
}

// 7. 설치기가 호스트를 전혀 쓰지 않는다는 약속은 사실이 아니므로 금지.
if (/installer leaves DSH itself untouched|설치기가 DSH 본체를 건드리지 않는다/.test(readme))
  problems.push("README.md 는 설치기가 호스트 디렉터리를 전혀 쓰지 않는다고 약속할 수 없다");

// 8. 릴리스 저장소 식별자가 이 포크를 가리키는지(설치 명령이 상류로 새는 것을 막는다).
if (repository && !repository.endsWith("wnduddld0513/dsh-purge-kr")) {
  problems.push(`package.json repository 는 wnduddld0513/dsh-purge-kr 이어야 하는데 ${repository} 이다`);
}

// 9. 과거 YAML 예시는 원문 그대로 두되 실제 코드 블록에 경고를 붙인다.
// 인용부호 변형으로 검사를 우회하지 못하도록 YAML 을 파싱하고, 산문은 설정으로 오인하지 않는다.
for (const file of ["docs/upstream/README.md", "docs/upstream/README.zh-CN.md"]) {
  if (!has(file)) continue;
  for (const problem of checkInstallExamples(read(file), { archive: true })) problems.push(`${file}: ${problem}`);
}
for (const file of ["README.md", "docs/INSTALLATION.md", "docs/MAINTENANCE.md", "AGENTS.md"]) {
  if (!has(file)) continue;
  for (const problem of checkInstallExamples(read(file))) problems.push(`${file}: ${problem}`);
}

if (problems.length) {
  console.error("✗ 문서와 버전이 일치하지 않는다:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`✓ 문서 버전 일치: ${version} (README / release-notes / 유지보수 문서가 같은 버전을 가리킨다)`);
