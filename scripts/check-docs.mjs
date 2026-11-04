// 문서는 버전을 따라간다: 버전 번호, 릴리스 노트 첫 줄, README 의 버전 줄이 일치해야 한다.
// CI 에서 실행해 "코드는 릴리스했는데 README 는 이전 버전에 멈춰 있는" 상태를 막는다.
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const pkg = JSON.parse(read("package.json"));
const version = pkg.version;
const notesFirst = read("release-notes.md").split("\n")[0].trim();
const readme = read("README.md");
const agents = read("AGENTS.md");

const problems = [];
for (const file of ["docs/MAINTENANCE.md", "docs/INSTALLATION.md"]) {
  if (!read(file).includes(`현재 버전 **${version}**`)) problems.push(`${file} 의 현재 버전이 ${version} 로 동기화되지 않았다`);
}
for (const [file, needles] of [
  ["README.md", ["scripts/install.ps1", "issue #7", "before the plugin loads", "global npm registry"]],
  ["AGENTS.md", ["scripts/install.ps1", "minimumReleaseAge=0", "설치 후 자동 apply/restart"]],
]) {
  for (const needle of needles) if (!read(file).includes(needle)) problems.push(`${file} 에 설치 경계 문구가 없다: ${needle}`);
}
if (notesFirst !== `# ${version}`) {
  problems.push(`release-notes.md 첫 줄은 "# ${version}" 이어야 하는데 실제는 "${notesFirst}"`);
}
if (!readme.includes(`**${version}**`)) {
  problems.push(`README.md 첫 화면에 버전 번호 **${version}** 가 없다`);
}
if (!readme.includes("raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install.sh")) {
  problems.push("README.md 에 설치기 다운로드 명령이 없다");
}
if (!agents.includes(`현재 버전 **${version}**`)) {
  problems.push(`AGENTS.md 에 "현재 버전 **${version}**" 가 없다`);
}
if (!agents.includes(`\`dsh-purge-community\` ${version}`)) {
  problems.push(`AGENTS.md §9 버전 표가 ${version} 로 동기화되지 않았다`);
}
const hostLine = readme.match(/\*\*DSH Desktop ([0-9a-z.\-]+)\*\*/i);
if (!hostLine) problems.push("README.md 에 “DSH Desktop … 대응” 버전 줄이 없다");

// 복사해 쓰는 릴리스 명령은 패키지 버전을 따라가야 하며, 옛 TGZ 를 남기면 안 된다.
{
  const links = [...readme.matchAll(/releases\/download\/v([0-9.]+)\/dsh-purge-community-([0-9.]+)\.tgz/g)];
  if (!links.length) problems.push("README.md 에 고정 버전 공식 CLI 설치 출처가 없다");
  for (const [, tag, archive] of links) if (tag !== version || archive !== version)
    problems.push(`README.md 의 CLI 설치 링크 버전은 ${version} 이어야 한다`);
}
if (/설치기가 DSH 본체를 건드리지 않는다|installer leaves DSH itself untouched/.test(readme))
  problems.push("설치 안내는 설치기가 호스트 디렉터리를 전혀 쓰지 않는다고 약속할 수 없다");

if (problems.length) {
  console.error("✗ 문서와 버전이 일치하지 않는다:");
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log(`✓ 문서 버전 일치: ${version} (README / release-notes / 유지보수 문서가 같은 버전을 가리킨다)`);
