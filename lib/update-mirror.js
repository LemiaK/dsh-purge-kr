// Mirrors are opt-in transports, never authorities for installation checksums.
export const MIRROR_HOSTS = new Set(['github.com', 'api.github.com', 'raw.githubusercontent.com', 'codeload.github.com', 'objects.githubusercontent.com', 'release-assets.githubusercontent.com']);
export function normalizeMirror(value) {
  if (typeof value !== 'string') throw Error('업데이트 미러는 문자열이어야 합니다');
  if (!value.trim()) return '';
  let url;
  try { url = new URL(value.trim() === 'gh-proxy.org' ? 'https://gh-proxy.org/' : value.trim()); }
  catch { throw Error('업데이트 미러 접두사가 올바르지 않습니다'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || (url.port && url.port !== '443') || MIRROR_HOSTS.has(url.hostname))
    throw Error('업데이트 미러는 자격 증명과 쿼리 파라미터가 없는 독립 호스트의 HTTPS 접두사여야 합니다(443 포트)');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
}
export function mirrorTarget(value, env) {
  const prefix = normalizeMirror(env.PURGE_GH_MIRROR || '');
  const target = new URL(value);
  if (!prefix || !MIRROR_HOSTS.has(target.hostname)) return null;
  if (target.protocol !== 'https:' || target.username || target.password || (target.port && target.port !== '443')) throw Error('업데이트 다운로드 출처가 올바르지 않습니다');
  return new URL(prefix + target.href);
}
