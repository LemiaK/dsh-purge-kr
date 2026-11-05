#!/usr/bin/env node
// 로케일 정합 검사: 영어(en) 사전의 모든 키가 한국어(ko) 사전에도 있어야 한다.
// 업스트림이 새 UI 문자열을 추가하면 en 키가 늘어난다. 그때 ko 가 비면 화면에 영어/키가 노출되므로
// 자동 동기화 파이프라인의 게이트로 쓴다.
import { ko, en } from "../packages/purge-panel/src/shared/locale.js";

/** @returns {{missing:string[], koCount:number, enCount:number, extra:string[]}} */
export function checkLocale(koDict = ko, enDict = en) {
  const koKeys = new Set(Object.keys(koDict || {}));
  const enKeys = Object.keys(enDict || {});
  const missing = enKeys.filter((k) => !koKeys.has(k));
  const extra = [...koKeys].filter((k) => !(k in (enDict || {})));
  return { missing, extra, koCount: koKeys.size, enCount: enKeys.length };
}

if (process.argv[1] && process.argv[1].endsWith("i18n-check-locale.mjs")) {
  const { missing, extra, koCount, enCount } = checkLocale();
  console.log(`locale: ko=${koCount} en=${enCount} missing=${missing.length} extra=${extra.length}`);
  if (missing.length) {
    console.error("locale: 한국어 사전에 없는 키 — " + missing.slice(0, 12).join(", "));
    process.exit(1);
  }
}
