import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { findDshHome } from "./core.js";

const SUFFIXES = [
  [".xn--fiqs8s", "CN"],
  [".xn--fiqz9s", "CN"],
  [".xn--j6w193g", "HK"],
  [".xn--mix082f", "MO"],
  [".xn--55qx5d", "CN"],
  [".xn--io0a7i", "CN"],
  [".xn--55qw42g", "CN"],
  [".xn--zfr164b", "CN"],
  [".xn--czru2d", "CN"],
  [".xn--hxt814e", "CN"],
  [".xn--fiq228c5hs", "CN"],
  [".xn--3bst00m", "CN"],
  [".xn--ses554g", "CN"],
  [".\u4e2d\u56fd", "CN"],
  [".\u4e2d\u570b", "CN"],
  [".\u516c\u53f8", "CN"],
  [".\u7f51\u7edc", "CN"],
  [".\u7f51\u7d61", "CN"],
  [".\u516c\u76ca", "CN"],
  [".\u653f\u52a1", "CN"],
  [".\u5546\u57ce", "CN"],
  [".\u7f51\u5e97", "CN"],
  [".\u4e2d\u6587\u7f51", "CN"],
  [".\u96c6\u56e2", "CN"],
  [".\u7f51\u5740", "CN"],
  [".\u5728\u7ebf", "CN"],
  [".\u79fb\u52a8", "CN"],
  [".\u6211\u7231\u4f60", "CN"],
  [".\u9999\u6e2f", "HK"],
  [".\u6fb3\u95e8", "MO"],
  [".\u6fb3\u9580", "MO"],
  [".com.cn", "CN"],
  [".net.cn", "CN"],
  [".org.cn", "CN"],
  [".gov.cn", "CN"],
  [".edu.cn", "CN"],
  [".ac.cn", "CN"],
  [".mil.cn", "CN"],
  [".ah.cn", "CN"],
  [".bj.cn", "CN"],
  [".cq.cn", "CN"],
  [".fj.cn", "CN"],
  [".gd.cn", "CN"],
  [".gs.cn", "CN"],
  [".gx.cn", "CN"],
  [".gz.cn", "CN"],
  [".ha.cn", "CN"],
  [".hb.cn", "CN"],
  [".he.cn", "CN"],
  [".hi.cn", "CN"],
  [".hl.cn", "CN"],
  [".hn.cn", "CN"],
  [".jl.cn", "CN"],
  [".js.cn", "CN"],
  [".jx.cn", "CN"],
  [".ln.cn", "CN"],
  [".nm.cn", "CN"],
  [".nx.cn", "CN"],
  [".qh.cn", "CN"],
  [".sc.cn", "CN"],
  [".sd.cn", "CN"],
  [".sh.cn", "CN"],
  [".sn.cn", "CN"],
  [".sx.cn", "CN"],
  [".tj.cn", "CN"],
  [".xj.cn", "CN"],
  [".xz.cn", "CN"],
  [".yn.cn", "CN"],
  [".zj.cn", "CN"],
  [".hk.cn", "HK"],
  [".mo.cn", "MO"],
  [".cn", "CN"],
  [".com.hk", "HK"],
  [".edu.hk", "HK"],
  [".gov.hk", "HK"],
  [".idv.hk", "HK"],
  [".net.hk", "HK"],
  [".org.hk", "HK"],
  [".hk", "HK"],
  [".com.mo", "MO"],
  [".edu.mo", "MO"],
  [".gov.mo", "MO"],
  [".net.mo", "MO"],
  [".org.mo", "MO"],
  [".mo", "MO"],
];

const FILE_SUFFIX = new Set([
  "js", "jsx", "ts", "tsx", "mjs", "cjs", "json", "md", "yml", "yaml",
  "css", "html", "map", "log", "txt", "png", "jpg", "jpeg", "gif", "svg",
  "woff", "woff2", "lock", "vue", "py", "go", "rs", "java", "xml", "toml",
  "ini", "bak", "patch", "diff", "sh", "ps1", "cmd", "exe",
]);

// 다국적 은행 / 중앙은행 / 국제 금융 기구 / 주요 암호화폐 거래소.
// regionOfSuffix 는 .com/.co.jp/.co.kr 같은 범용 접미사에서는 지역 판정을 하지 않으므로, 은행 표가 정확히 메운다.
// 서브도메인 매칭(online.chase.com → chase.com)도 잡힌다. 소문자를 유지한다.
const BANK_HOSTS = new Set([
  "chase.com", "jpmorgan.com", "jpmorganchase.com", "bankofamerica.com",
  "wellsfargo.com", "citibank.com", "citi.com", "usbank.com", "pncbank.com",
  "pnc.com", "tdbank.com", "capitalone.com", "truist.com", "americanexpress.com",
  "amex.com", "discover.com", "ally.com", "schwab.com", "fidelity.com",
  "goldmansachs.com", "morganstanley.com",
  "hsbc.com", "hsbc.co.uk", "barclays.co.uk", "barclays.com", "lloydsbank.com",
  "lloyds.com", "natwest.com", "rbs.co.uk", "santander.co.uk", "nationwide.co.uk",
  "standardchartered.com", "sc.com", "metrobankonline.co.uk", "aib.ie", "boi.com",
  "deutsche-bank.de", "db.com", "commerzbank.de", "sparkasse.de", "dkb.de",
  "ing.de", "n26.com", "targobank.de", "erstebank.at", "raiffeisen.at",
  "bnpparibas.com", "bnpparibas.fr", "credit-agricole.fr", "creditagricole.fr",
  "societegenerale.com", "societegenerale.fr", "labanquepostale.fr", "lcl.fr",
  "ubs.com", "credit-suisse.com", "raiffeisen.ch", "zkb.ch", "pictet.com",
  "juliusbaer.com", "postfinance.ch",
  "ing.com", "abnamro.com", "abnamro.nl", "rabobank.com", "rabobank.nl",
  "kbc.com", "kbc.be", "belfius.be",
  "unicredit.eu", "unicreditgroup.eu", "unicredit.it", "intesasanpaolo.com",
  "intesasanpaolo.it", "mps.it",
  "santander.com", "bbva.com", "bbva.es", "caixabank.es", "bankinter.com",
  "sabadell.com", "novobanco.pt", "millenniumbcp.pt",
  "nordea.com", "seb.se", "swedbank.se", "handelsbanken.se", "danskebank.com",
  "dnb.no", "op.fi",
  "mufg.jp", "bk.mufg.jp", "smbc.co.jp", "mizuhobank.co.jp", "mizuho-fg.co.jp",
  "resona-gr.co.jp", "japanpost.jp", "jp-bank.japanpost.jp", "rakuten-bank.co.jp",
  "sbi-sec.co.jp", "nomura.com",
  "kbstar.com", "shinhan.com", "wooribank.com", "hanabank.com", "ibk.co.kr",
  "nonghyup.com", "kakaobank.com", "tossbank.com",
  "dbs.com", "dbs.com.sg", "posb.com.sg", "uob.com.sg", "uob.com", "ocbc.com",
  "ocbc.com.sg", "maybank2u.com", "maybank.com", "maybank2u.com.my",
  "cimbclicks.com.my", "cimb.com",
  "commbank.com.au", "westpac.com.au", "westpac.co.nz", "anz.com", "anz.com.au",
  "anz.co.nz", "nab.com.au", "bankwest.com.au", "asb.co.nz", "bnz.co.nz",
  "kiwibank.co.nz", "macquarie.com", "macquarie.com.au",
  "rbc.com", "rbcroyalbank.com", "td.com", "tdcanadatrust.com", "scotiabank.com",
  "bmo.com", "cibc.com", "desjardins.com", "nationalbank.ca",
  "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com", "axisbank.com",
  "kotak.com", "pnbindia.in", "bankofindia.co.in", "yesbank.in", "idfcfirstbank.com",
  "bca.co.id", "mandiri.co.id", "bri.co.id", "bni.co.id", "bangkokbank.com",
  "scb.co.th", "ktb.co.th", "kasikornbank.com", "vietcombank.com.vn", "bidv.com.vn",
  "vietinbank.vn", "agribank.com.vn", "metrobank.com.ph", "bpi.com.ph", "bdo.com.ph",
  "enbd.com", "rakbank.ae", "adcb.com", "dubaiislamic.ae", "mashreqbank.com",
  "adib.ae", "alrajhibank.com.sa", "snb.com", "samba.com", "qnb.com",
  "leumi.co.il", "bankhapoalim.co.il", "mizrahi-tefahot.co.il", "discountbank.co.il",
  "sberbank.ru", "vtb.com", "vtb.ru", "alfabank.ru", "tinkoff.ru",
  "gazprombank.ru", "rshb.ru", "otkritie.ru",
  "itau.com.br", "bradesco.com.br", "santander.com.br", "bb.com.br",
  "caixa.gov.br", "nubank.com.br", "banorte.com", "banamex.com", "bancomer.com",
  "santander.com.mx", "scotiabank.com.mx", "hsbc.com.mx", "bancochile.cl",
  "bci.cl", "bancolombia.com", "davivienda.com", "bbvacolombia.com",
  "standardbank.co.za", "absa.co.za", "fnb.co.za", "nedbank.co.za",
  "capitecbank.co.za", "ecobank.com", "gtbank.com", "firstbanknigeria.com",
  "accessbankplc.com", "zenithbank.com",
  // 중국 본토: .cn 은 이미 SUFFIXES 가 지역을 덮으므로, 여기에는 비 .cn 접미사와 핵심 주 도메인을 등록해 bank kind 매칭을 돕는다.
  "icbc.com.cn", "icbc-ltd.com", "abchina.com", "boc.cn", "boc-info.com", "ccb.com",
  "bankcomm.com", "pingan.com", "cmbchina.com", "spdb.com.cn", "cmbc.com.cn",
  "cib.com.cn", "cebbank.com", "hxb.com.cn", "bosc.cn", "psbc.com",
  "hsbc.com.hk", "hangseng.com", "hangseng.com.hk", "bochk.com",
  "cmbwinglungbank.com", "scb.com.hk", "bea.com.hk", "dahsing.com", "icbcasia.com",
  "chbank.com.hk", "dbs.com.hk", "bnu.com.mo", "icbc.com.mo",
  "ctbcbank.com", "esunbank.com.tw", "cathaybk.com.tw", "taishinbank.com.tw",
  "fubon.com", "megabank.com.tw", "landbank.com.tw", "firstbank.com.tw",
  "federalreserve.gov", "frbservices.org", "ecb.europa.eu", "bankofengland.co.uk",
  "boj.or.jp", "boc.gov.cn", "pbc.gov.cn", "snb.ch", "rba.gov.au", "rbnz.govt.nz",
  "worldbank.org", "imf.org", "bis.org", "adb.org", "afdb.org", "iadb.org",
  "swift.com", "visa.com", "mastercard.com", "unionpayintl.com", "unionpay.com",
  "binance.com", "coinbase.com", "kraken.com", "bitstamp.net", "bitfinex.com",
  "bybit.com", "okx.com", "huobi.com", "kucoin.com", "gate.io", "bitget.com",
  "crypto.com", "gemini.com", "upbit.com", "bithumb.com",
]);

function bankHit(name) {
  if (!name || typeof name !== "string") return false;
  if (BANK_HOSTS.has(name)) return true;
  let dot = name.indexOf(".");
  while (dot !== -1) {
    if (BANK_HOSTS.has(name.slice(dot + 1))) return true;
    dot = name.indexOf(".", dot + 1);
  }
  return false;
}

const DENIAL = "안 됩니다. 이는 엄격히 금지된 항목입니다";

// \u6e17\u900f(?!\u6d4b\u8bd5): “\u6e17\u900f\u6d4b\u8bd5 / IP 와 \u6e17\u900f\u6d4b\u8bd5”는 공격 작업이 아니다(#73).
// exploit(?!-): exploit-db.com 같은 자료 사이트는 exploit 키워드로 잡지 않는다.
// (?<!\u9632\u5fa1)\u653b\u51fb: “\u9632\u5fa1\u653b\u51fb 수법”처럼 방어 문장은 거치지 않는다.
const ATTACK =
  /\u6e17\u900f(?!\u6d4b\u8bd5)|\u6253\u7a7f|\u6253\u4e0b|\u6253\u7ad9|\u5165\u4fb5|\u62ff\u58f3|\u62ff\u6743\u9650|\u7206\u7834|\u63d0\u6743|webshell|getshell|\u7aef\u53e3\u626b\u63cf|pentest|\bexploit\b(?![-a-z0-9])|\bbreach\b|\bpwn\b|(?<!\u9632\u5fa1)\u653b\u51fb(?!\u9762)|(?<!surface\s)\battack\b(?!\s+surface)/i;

// ReDoS 보험: ATTACK 에는 제로폭 룩어라운드가 있어, 메시지 전체(코드/로그 붙여넣기)가 100KB 를 넘으면 정규식 백트래킹이 이벤트 루프를 멈출 수 있다.
// 실제 공격 의도는 보통 앞 몇 천 문자 안에 있으므로 100KB 상한이 정상 입력을 흘려보내지 않는다.
const ATTACK_SCAN_CAP = 100 * 1024;

const NET_TOPIC =
  /(?:\u4ee3\u7406|\bproxy\b|socks|vpn|frp|clash|v2ray|\u5c0f\u98de\u673a|\u673a\u573a|\u51fa\u53e3\s*ip|\u672c\u673a\s*ip|\u5185\u7f51\s*ip|\u516c\u7f51\s*ip|ip\s*\u5730\u5740|ip\s*\u5f52\u5c5e|ip\s*\u67e5\u8be2|ip\s*\u76f8\u5173|dns|\u57df\u540d\u89e3\u6790|\u7f51\u5361|\u96a7\u9053|\u53cd\u5411\u4ee3\u7406|\u6b63\u5411\u4ee3\u7406|http[s]?\s*\u4ee3\u7406)/i;

function ipv4ToInt(ip) {
  const parts = String(ip).split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const number = Number(part);
    if (number > 255) return null;
    value = value * 256 + number;
  }
  return value >>> 0;
}

function isSkippedV4(value) {
  const a = value >>> 24;
  const b = (value >>> 16) & 255;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a >= 224) return true;
  return false;
}

function parseIpv6(input) {
  let text = String(input || "").trim().toLowerCase().split("%")[0];
  if (!text) return null;
  if (text.includes(".")) {
    const colon = text.lastIndexOf(":");
    const tail = ipv4ToInt(text.slice(colon + 1));
    if (tail == null) return null;
    const hi = (tail >>> 16).toString(16);
    const lo = (tail & 0xffff).toString(16);
    text = `${text.slice(0, colon + 1)}${hi}:${lo}`;
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if (halves.length === 1 && left.length !== 8) return null;
  if (halves.length === 2 && missing < 0) return null;
  const parts = halves.length === 2 ? [...left, ...Array(missing).fill("0"), ...right] : left;
  if (parts.length !== 8) return null;
  let out = 0n;
  for (const part of parts) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
    out = (out << 16n) + BigInt(parseInt(part, 16));
  }
  return out;
}

export function regionOfSuffix(host) {
  const name = String(host || "").trim().toLowerCase().replace(/\.$/, "");
  if (!name || name === "localhost" || name.endsWith(".local")) return "";
  for (const [suffix, region] of SUFFIXES) {
    if (name === suffix.slice(1) || name.endsWith(suffix)) return region;
  }
  return "";
}

function hostOf(raw) {
  let host = String(raw || "").trim().toLowerCase();
  if (!host) return "";
  const at = host.lastIndexOf("@");
  if (at >= 0) host = host.slice(at + 1);
  if (host.startsWith("[")) {
    const end = host.indexOf("]");
    return end > 1 ? host.slice(1, end) : "";
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(host)) return host.replace(/:\d+$/, "");
  if (/^[a-z0-9.-]+:\d+$/.test(host)) return host.replace(/:\d+$/, "");
  return host.replace(/\.$/, "");
}

function addHost(raw, hosts) {
  const host = hostOf(raw);
  if (!host || host.length > 253) return;
  hosts.add(host);
}

function inFilePath(sample, index) {
  const prev = sample[index - 1];
  return prev === "/" || prev === "\\";
}

/** URL 안의 호스트는 그대로 담는다. 맨 이름은 도메인처럼 보여야 한다: 경로 조각, 파일 접미사, 두 라벨의 .mo 파일명은 버린다. */
function keepBareDomain(sample, index, name) {
  if (inFilePath(sample, index)) return false;
  const labels = name.split(".");
  const tail = labels[labels.length - 1];
  if (FILE_SUFFIX.has(tail)) return false;
  if (labels.length === 2 && tail === "mo") return false;
  return true;
}

function collectFromText(text, hosts) {
  const sample = String(text || "").slice(0, 32768);
  const url = /\b(?:[a-z][a-z0-9+.-]*:\/\/)([^/?#\s]+)/gi;
  for (const match of sample.matchAll(url)) addHost(match[1], hosts);
  const ipv4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
  for (const match of sample.matchAll(ipv4)) hosts.add(match[0]);
  // lookbehind/lookahead 로 HH:MM:SS 같은 순수 십진 시간 문자열을 배제해 IPv6 로 오탐하지 않게 한다.
  const ipv6 = /(?<![\d:])(?:[0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}(?![\d])/gi;
  for (const match of sample.matchAll(ipv6)) {
    const value = match[0];
    // 이차 방어: 전체가 십진수 + 콜론(a-f 없음)뿐이면 버린다.
    if (/^[\d:]+$/.test(value)) continue;
    hosts.add(value);
  }
  const domain = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b/gi;
  for (const match of sample.matchAll(domain)) {
    const name = match[0].toLowerCase();
    if (!keepBareDomain(sample, match.index, name)) continue;
    hosts.add(name);
  }
}

const HOST_NAME = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
const V4_TEXT = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

export function allowFilePath(dshHome = findDshHome()) {
  return path.join(dshHome, "net-scope-allow.txt");
}

/** IP 하나 또는 완전한 호스트 이름 하나만 받는다. 계정은 user@host 로 쓸 수 있다. 키, 대역, 와일드카드는 버린다. */
export function entryHost(raw) {
  const text = String(raw || "").trim();
  if (!text || text.startsWith("#")) return "";
  if (text.length > 253 || /[\s/\\*]/.test(text)) return "";
  if (/BEGIN |PRIVATE KEY|ssh-(?:rsa|ed25519|dss) /i.test(text)) return "";
  let body = text;
  const at = body.lastIndexOf("@");
  if (at >= 0) {
    const user = body.slice(0, at);
    if (!/^[A-Za-z0-9._-]{1,32}$/.test(user)) return "";
    body = body.slice(at + 1);
  }
  const host = hostOf(body);
  if (!host || host.length > 253) return "";
  if (V4_TEXT.test(host)) return host;
  if (host.includes(":")) return parseIpv6(host) != null ? host : "";
  if (!HOST_NAME.test(host)) return "";
  const tail = host.slice(host.lastIndexOf(".") + 1);
  if (FILE_SUFFIX.has(tail)) return "";
  return host;
}

export function normalizeAllowText(text) {
  const kept = [];
  const seen = new Set();
  let dropped = 0;
  for (const line of String(text || "").split(/\r?\n/)) {
    const raw = line.trim();
    if (!raw) continue;
    if (raw.startsWith("#")) {
      kept.push(raw);
      continue;
    }
    const host = entryHost(raw);
    if (!host) {
      dropped += 1;
      continue;
    }
    if (seen.has(host)) continue;
    seen.add(host);
    const at = raw.lastIndexOf("@");
    kept.push(at > 0 ? `${raw.slice(0, at)}@${host}` : host);
  }
  return { text: kept.length ? `${kept.join("\n")}\n` : "", dropped, hosts: [...seen] };
}

export function readAllowText(dshHome = findDshHome()) {
  try {
    return fs.readFileSync(allowFilePath(dshHome), "utf8");
  } catch {
    return "";
  }
}

export async function writeAllowText(dshHome, text) {
  const normalized = normalizeAllowText(text);
  const fp = allowFilePath(dshHome);
  await fs.promises.mkdir(path.dirname(fp), { recursive: true });
  await fs.promises.writeFile(fp, normalized.text, "utf8");
  allowCache = { path: "", mtime: -1, exact: new Set(), ips: null, at: 0 };
  return normalized;
}

let allowCache = { path: "", mtime: -1, exact: new Set(), ips: null, at: 0 };

function readAllowExact(dshHome = findDshHome()) {
  const fp = allowFilePath(dshHome);
  let mtime = -1;
  try {
    mtime = fs.statSync(fp).mtimeMs;
  } catch {
    mtime = -1;
  }
  if (allowCache.path === fp && allowCache.mtime === mtime) return allowCache;
  const exact = new Set(normalizeAllowText(readAllowText(dshHome)).hosts);
  allowCache = { path: fp, mtime, exact, ips: null, at: Date.now() };
  return allowCache;
}

function allowDecision(dshHome) {
  return readAllowExact(dshHome);
}

export function ownServerNote() {
  return "";
}
