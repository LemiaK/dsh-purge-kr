// Release downloads have a different budget from small version queries.
// Mirrors only transport archives; their bytes must match an official digest.
import { requestUpdate, UPDATE_HOSTS } from './update-http.js';

export function downloadTimeout(env = process.env) {
  const raw = env.PURGE_DOWNLOAD_TIMEOUT_MS;
  if (raw === undefined || raw === '') return 180000;
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 30000 || value > 900000)
    throw Error('PURGE_DOWNLOAD_TIMEOUT_MS 는 30000–900000 밀리초여야 합니다');
  return value;
}
export function mirrorPrefix(env = process.env) {
  if (!env.PURGE_GH_MIRROR) return null;
  let url;
  try { url = new URL(env.PURGE_GH_MIRROR); } catch { throw Error('업데이트 미러 접두사가 유효하지 않습니다'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || (url.port && url.port !== '443'))
    throw Error('업데이트 미러는 자격 증명과 쿼리 파라미터가 없는 HTTPS 접두사여야 합니다(443 포트)');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}
export async function downloadArchive(url, { request, env = process.env } = {}) {
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.username || target.password || !['github.com','release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(target.hostname))
    throw Error('릴리스 패키지 다운로드 출처가 유효하지 않습니다');
  const prefix = mirrorPrefix(env);
  const allowedHosts = new Set(UPDATE_HOSTS);
  if (prefix) allowedHosts.add(prefix.hostname);
  const destination = prefix ? prefix.href + target.href : target.href;
  const result = await requestUpdate(destination, { timeout: downloadTimeout(env), fetch: request, env, allowedHosts });
  return result.body;
}
