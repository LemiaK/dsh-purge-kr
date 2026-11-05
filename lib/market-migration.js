import { installedCommunityPackage } from "./installed-package.js";
// Installer-only migration of package references. Never evaluates YAML tags or
// edits prompt text, permissions, plugin options, or the user's other plugins.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ids = new Map([
  ['dsh-purge', ''], ['dsh-purge-redteam', '/redteam'],
  ['dsh-purge-presets', '/presets-plugin'],
  ['dsh-purge-redteam-store', '/redteam/store'],
  ['dsh-purge-redteam-ui', '/redteam/ui'],
]);

// Manual snapshots have no install-specific migration journal. Restore only
// known package references when the snapshot explicitly selected the old alias.
export function aliasRollbackReferences() {
  return [...ids].map(([id, suffix]) => ({id, from:'dsh-purge'+suffix, to:'dsh-purge-community'+suffix}));
}

export function migrateReferences(text, yaml, reverse = []) {
  if (!Array.isArray(reverse) || reverse.some(r => !ids.has(r.id) || !((r.from === 'dsh-purge' + ids.get(r.id) && r.to === 'dsh-purge-community' + ids.get(r.id)) || (r.to === 'dsh-purge' + ids.get(r.id) && r.from === 'dsh-purge-community' + ids.get(r.id)))))
    throw Error('마이그레이션 기록이 유효하지 않습니다; 설정을 수정하지 않았습니다');
  const doc = yaml.parseDocument(text);
  if (doc.errors.length) throw Error('마이그레이션 전 설정 YAML 을 파싱할 수 없습니다: ' + doc.errors[0].message);
  if (!yaml.isSeq(doc.contents)) {
    if (!text.trim()) return { text, changes: [] };
    throw Error('마이그레이션은 cordis.patch.yml 이 패치 목록일 것을 요구합니다; 원래 설정을 보존했습니다');
  }
  const edits = [], changes = [];
  const inspect = (row, inserted = false) => {
    if (!yaml.isMap(row)) return;
    const name = row.get('name', true), id = row.get('id');
    if (yaml.isScalar(name) && typeof name.value === 'string') {
      const undo = reverse.find(r => r.id === id && r.to === name.value);
      const suffix = ids.get(id);
      const legacy = name.value === 'dsh-purge' || name.value.startsWith('dsh-purge/');
      if (legacy && suffix === undefined && !reverse.length)
        throw Error('사용자 정의 옛 패키지 진입점을 발견해 대응 관계를 자동으로 판정할 수 없습니다; 원래 설정과 백업을 보존했습니다. 진입점 ID 를 확인하세요');
      if (legacy && !reverse.length && name.value !== 'dsh-purge' + suffix)
        throw Error('옛 패키지 진입점과 ID 가 일치하지 않습니다; 원래 설정을 보존했습니다');
      const replacement = undo?.from ?? (!reverse.length && legacy && name.value === 'dsh-purge' + suffix ? 'dsh-purge-community' + suffix : null);
      if (replacement) {
        // An insert may be a manually registered entry, not an override of a
        // bundle. Do not silently create duplicate IDs or remove its options.
        if (inserted) throw Error('수동 insert 로 추가된 옛 패키지 진입점을 발견했습니다. 먼저 bundle 과의 중복 ID 를 확인해야 합니다; 진입점을 삭제하거나 비활성화하지 않았고 원래 설정을 보존했습니다');
        if (name.tag || !name.range) throw Error('동적 패키지 진입점은 자동 마이그레이션할 수 없습니다; 원래 설정을 보존했습니다');
        edits.push({ start: name.range[0], end: name.range[1], value: JSON.stringify(replacement) });
        changes.push({ id, from: name.value, to: replacement });
      }
    }
    const insert = row.get('insert', true);
    if (yaml.isSeq(insert)) for (const child of insert.items) inspect(child, true);
  };
  for (const row of doc.contents.items) inspect(row);
  for (const e of edits.sort((a,b) => b.start-a.start)) text = text.slice(0,e.start) + e.value + text.slice(e.end);
  return { text, changes };
}

export function installedYaml(profile, options) {
  // Bootstrap has no node_modules yet. Resolve the parser only AFTER DSH has
  // installed the verified candidate and its declared dependencies.
  const require = createRequire(installedCommunityPackage(profile, options).file);
  return require('yaml');
}

export function readProfilePatch(profile) {
  const file = path.join(profile, 'cordis.patch.yml');
  try { return { file, text: fs.readFileSync(file, 'utf8') }; }
  catch (e) { if (e.code === 'ENOENT') return {file, text: ''}; throw e; }
}
