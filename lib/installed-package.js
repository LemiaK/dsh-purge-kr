// Resolve only the selected profile. Never fall back to loaded code or another host.
import fs from 'node:fs';
import path from 'node:path';

export const COMMUNITY_PACKAGE = 'dsh-purge-community';
const aliases = [COMMUNITY_PACKAGE, 'dsh-purge'];

export function installedCommunityPackage(profile, {dependencyName} = {}) {
  if (dependencyName && !aliases.includes(dependencyName)) throw Error('Unsupported plugin dependency name');
  let manifest = {};
  try { manifest = JSON.parse(fs.readFileSync(path.join(profile, 'package.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const bundles = manifest.dsh?.profile?.bundles;
  if (bundles !== undefined && !Array.isArray(bundles)) throw Error('Invalid profile bundles');
  const selected = aliases.filter(name => bundles?.includes(name));
  const names = dependencyName ? [dependencyName] : selected.length ? selected : aliases;
  const found = [];
  for (const name of names) {
    const file = path.join(profile, 'node_modules', name, 'package.json');
    let pkg;
    try { pkg = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (error) {
      if (error.code === 'ENOENT' && !dependencyName && !selected.includes(name)) continue;
      throw error;
    }
    if (pkg.name !== COMMUNITY_PACKAGE || typeof pkg.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/.test(pkg.version)) {
      // A genuine upstream package is not a community installation.
      if (!dependencyName && !selected.includes(name) && name === 'dsh-purge' && pkg.name === name) continue;
      throw Error('현재 profile 의 플러그인 패키지 식별자 또는 버전이 유효하지 않습니다: ' + name);
    }
    const directory = fs.realpathSync(path.dirname(file));
    found.push({dependencyName:name, directory, file:path.join(directory,'package.json'), package:pkg});
  }
  if (!found.length) throw Object.assign(Error('ENOENT: 현재 profile 에서 커뮤니티 버전 플러그인 설치를 찾지 못했습니다'), {code:'ENOENT'});
  if (new Set(found.map(item => item.directory)).size !== 1) throw Error('현재 profile 에 커뮤니티 버전 설치가 여러 개 있어 적용 진입점을 확정할 수 없습니다');
  return found[0];
}
