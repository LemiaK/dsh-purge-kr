// Legacy source archives have no publisher SHA256SUMS. Pin the commit first,
// then verify every file against GitHub's Git tree, before copying any code.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fetchJson, UPSTREAM_REPO } from './update-net.js';
const shaPattern = /^[0-9a-f]{40}$/i;
export async function sourceManifest(ref, { json = fetchJson, ms = 45000 } = {}) {
  const base = `https://api.github.com/repos/${UPSTREAM_REPO}`;
  const commit = await json(`${base}/commits/${encodeURIComponent(ref)}`, ms);
  if (!shaPattern.test(commit?.sha || '') || !shaPattern.test(commit?.commit?.tree?.sha || ''))
    throw Error('업스트림 commit/tree 를 검증할 수 없습니다; 다운로드나 설치를 진행하지 않았습니다');
  if (shaPattern.test(ref) && ref.toLowerCase() !== commit.sha.toLowerCase()) throw Error('업스트림 commit 이 일치하지 않습니다');
  const tree = await json(`${base}/git/trees/${commit.commit.tree.sha}?recursive=1`, ms);
  if (tree?.truncated || tree?.sha !== commit.commit.tree.sha || !Array.isArray(tree.tree) || !tree.tree.length)
    throw Error('업스트림 Git tree 가 불완전합니다; 설치하지 않았습니다');
  const files = new Map();
  for (const entry of tree.tree) {
    const rel = entry.path;
    if (typeof rel !== 'string' || !rel || /[\\\x00-\x1f:]/.test(rel) || rel.split('/').some(x => !x || x === '.' || x === '..'))
      throw Error('업스트림 Git tree 경로가 유효하지 않습니다');
    if (entry.type === 'tree' && entry.mode === '040000') continue;
    if (entry.type !== 'blob' || !['100644','100755'].includes(entry.mode) || !shaPattern.test(entry.sha) || files.has(rel))
      throw Error('업스트림 Git tree 에 지원하지 않는 파일 형식 또는 중복 파일이 있습니다; 설치하지 않았습니다');
    files.set(rel, entry);
  }
  if (!files.has('package.json')) throw Error('업스트림 Git tree 에 package.json 이 없습니다');
  return { sha: commit.sha, files };
}
export function verifySourceTree(root, manifest) {
  const seen = new Set();
  function visit(dir, prefix = '') {
    for (const name of fs.readdirSync(dir)) {
      const rel = prefix + name, file = path.join(dir, name), stat = fs.lstatSync(file);
      if (stat.isDirectory()) { visit(file, rel + '/'); continue; }
      if (!stat.isFile()) throw Error(`아카이브에 일반 파일이 아닌 항목이 있습니다: ${rel}`);
      const entry = manifest.files.get(rel);
      if (!entry) throw Error(`아카이브에 등록되지 않은 파일이 있습니다: ${rel}`);
      const bytes = fs.readFileSync(file);
      const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
      if (hash !== entry.sha) throw Error(`아카이브 무결성 검증에 실패했습니다: ${rel}`);
      seen.add(rel);
      if (process.platform !== 'win32') fs.chmodSync(file, entry.mode === '100755' ? 0o755 : 0o644);
    }
  }
  visit(root);
  for (const file of manifest.files.keys()) if (!seen.has(file)) throw Error(`아카이브에 빠진 파일이 있습니다: ${file}`);
  return { sha: manifest.sha, verifiedFiles: seen.size, method: 'github-git-tree' };
}
