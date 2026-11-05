import { apiUrl } from "../api/client.js";
import React from "react";
// UI derived from YuJunZhiXue/dsh-purge 1.1.71 (MIT). See LICENSE.

export const __dshPurgeDrill = (() => {
  var module = { exports: {} };
  var exports = module.exports;

  var module = { exports: {} };
  var exports = module.exports;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

  const h = React.createElement;

  /*
   * 드릴 콘솔 자체는 하나의 플로팅 창이다: position:fixed, left/top/width/height 로 배치한다.
   * 공식 frame 에 padding 을 주지 않고, 공식 입력란의 너비도 바꾸지 않는다. 정리 패널에 끼워 넣을 때는 .rt-embedded 를 쓴다.
   */
  const CSS = `
.rt-dock{position:fixed;top:12px;right:12px;z-index:20;display:flex;flex-direction:column;box-sizing:border-box;
  background:color-mix(in srgb,var(--dsw-alias-bg-layer-1,#1c1c1c) 52%,transparent);
  backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);
  border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#444) 70%,transparent);
  border-radius:12px;
  box-shadow:0 18px 48px color-mix(in srgb,#000 28%,transparent);pointer-events:auto;color:var(--dsw-alias-label-primary);
  font-size:13px;line-height:1.5}
.rt-dock.rt-embedded{position:relative;inset:auto;width:100%;height:100%;max-width:none;border:0;border-radius:0;box-shadow:none;background:transparent!important;backdrop-filter:none;-webkit-backdrop-filter:none}
.rt-grip,.rt-resize-r,.rt-resize-b,.rt-resize-c{position:absolute;z-index:3;touch-action:none}
.rt-grip{left:-3px;top:0;bottom:0;width:8px;cursor:ew-resize;background:transparent}
.rt-resize-r{right:-3px;top:0;bottom:14px;width:8px;cursor:ew-resize}
.rt-resize-b{left:8px;right:14px;bottom:-3px;height:8px;cursor:ns-resize}
.rt-resize-c{right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize}
.rt-head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.rt-title{font-weight:600;font-size:14px;display:flex;align-items:center;gap:6px;white-space:nowrap}
.rt-dot{width:8px;height:8px;border-radius:50%;background:var(--dsw-alias-brand-primary)}
.rt-spacer{flex:1}
.rt-btn{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:inherit;
  border-radius:6px;padding:3px 9px;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap}
.rt-btn:hover{border-color:var(--dsw-alias-border-l2)}
/* brand-primary 는 어두운 테마에서 거의 흰색(#f9fafb)이라, 배경색에 #fff 를 쓰면 흰 바탕에 흰 글자가 된다.
   라벨/배경 반전 토큰을 쓰면 두 테마 모두 대비가 유지된다. */
.rt-btn-primary{background:var(--dsw-alias-label-primary,#111);border-color:var(--dsw-alias-label-primary,#111);color:var(--dsw-alias-bg-base,#fff)}
.rt-btn-primary:hover{opacity:.9}
.rt-btn:disabled{opacity:.5;cursor:default}
.rt-tabs{display:flex;flex-wrap:wrap;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.rt-tab{padding:8px 10px 7px;border-radius:0;cursor:pointer;font-size:12.5px;color:var(--dsw-alias-label-secondary);
  display:inline-flex;align-items:center;gap:5px;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent}
.rt-tab:hover{color:var(--dsw-alias-label-primary)}
.rt-tab.on{color:var(--dsw-alias-label-primary);background:transparent;font-weight:600;border-bottom-color:var(--dsw-alias-brand-primary,#6dbf8c)}
/* 미확인 빨간 점: 그 탭에 새 내용(새 자산/새 취약점/새 득점/새 단계…)이 있으며, 열어 보면 사라진다 */
.rt-tab-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;flex:none;
  box-shadow:0 0 0 2px color-mix(in srgb, #ef4444 22%, transparent)}
.rt-body{flex:1;min-height:0;display:flex;flex-direction:column}
.rt-split{flex:1;min-height:0;display:flex}
.rt-side{width:200px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow:auto;padding:8px}
.rt-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.rt-seg{padding:7px 8px;border-radius:6px;cursor:pointer;margin-bottom:4px;border:1px solid transparent}
.rt-seg:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-seg.on{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-brand-primary)}
.rt-seg-cidr{font-family:ui-monospace,Menlo,monospace;font-size:12.5px}
.rt-seg-meta{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:2px}
.rt-toolbar{display:flex;gap:6px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);flex-wrap:wrap;align-items:center}
.rt-input{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);color:inherit;
  border-radius:6px;padding:4px 8px;font-size:12px;font-family:inherit;outline:none;min-width:0}
.rt-input:focus{border-color:var(--dsw-alias-brand-primary)}
.rt-input option,.rt-eng-select option{background:var(--dsw-alias-bg-layer-1,#1c1c1c);color:var(--dsw-alias-label-primary,#f2f2f2)}
.rt-eng-select{color:var(--dsw-alias-label-primary,#f2f2f2);background:var(--dsw-alias-bg-layer-2,#2a2a2a)}
.rt-table{flex:1;overflow:auto}
.rt-row{display:grid;grid-template-columns:150px 74px 104px 1.15fr 1fr;gap:8px;padding:6px 10px;
  border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;cursor:pointer;font-size:12.5px}
.rt-row:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-row.head{cursor:default;color:var(--dsw-alias-label-secondary);font-size:11.5px;font-weight:600;position:sticky;top:0;
  background:var(--dsw-alias-bg-layer-1);z-index:1}
.rt-row.head:hover{background:var(--dsw-alias-bg-layer-1)}
.rt-mono{font-family:ui-monospace,Menlo,monospace}
.rt-tag{display:inline-block;padding:0 5px;border-radius:4px;font-size:11px;margin-right:4px;
  border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.rt-tag-passive{color:#8b5cf6;border-color:#8b5cf655;background:#8b5cf61a}
.rt-tag-active{color:#f59e0b;border-color:#f59e0b55;background:#f59e0b1a}
.rt-tag-live{color:#10b981;border-color:#10b98155;background:#10b9811a}
.rt-tag-warn{color:#ef4444;border-color:#ef444455;background:#ef44441a}
/* 규율 안내 바: 납품 요건(Behinder/Godzilla 셸 아님, suo5 터널 없음)을 충족하지 못할 때 블록 맨 위에 붙는다 */
.rt-hint{border-radius:6px;padding:7px 9px;margin-bottom:8px;font-size:11.5px;line-height:1.6;
  border:1px dashed #ef444488;background:#ef44440f;color:var(--dsw-alias-label-primary)}
.rt-hint b{color:#ef4444}
.rt-tag-dead{color:var(--dsw-alias-label-secondary)}
.rt-expand{grid-column:1/-1;padding:8px 4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.rt-kv{display:flex;gap:8px;margin-bottom:3px;align-items:baseline}
.rt-kv b{color:var(--dsw-alias-label-primary);font-weight:600;min-width:64px;flex:none}
/* 그래프 뷰는 제거됐다(AssetsTab 참고: 자산 관계는 “도메인 차원”과 redteam_attack_path 도구가 담당한다) */
.rt-pane{flex:1;min-height:0;overflow:auto;padding:12px}
.rt-card{border:1px solid color-mix(in srgb,var(--dsw-alias-border-l1,#444) 75%,transparent);border-radius:8px;padding:10px;margin-bottom:10px;
  background:color-mix(in srgb,var(--dsw-alias-bg-layer-2,#2a2a2a) 48%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.rt-card h4{margin:0 0 6px;font-size:13px}
.rt-textarea{width:100%;min-height:260px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);
  color:inherit;border-radius:6px;padding:8px;font-size:12.5px;font-family:ui-monospace,Menlo,monospace;
  line-height:1.6;resize:vertical;outline:none;box-sizing:border-box}
.rt-textarea:focus{border-color:var(--dsw-alias-brand-primary)}
.rt-list{width:210px;flex:none;border-right:1px solid var(--dsw-alias-border-l1);overflow:auto;padding:8px}
.rt-item{padding:7px 8px;border-radius:6px;cursor:pointer;margin-bottom:4px;border:1px solid transparent}
.rt-item:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-item.on{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-brand-primary)}
.rt-item-name{font-weight:600;font-size:12.5px}
.rt-item-desc{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:2px;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rt-empty{padding:24px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12.5px}
.rt-err{color:var(--dsw-alias-state-error-primary);font-size:12px;padding:6px 10px}
.rt-foot{padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l1);font-size:11px;
  color:var(--dsw-alias-label-secondary);display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.rt-icon-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;border:1px solid var(--dsw-alias-border-l1);
  background:transparent;color:inherit;border-radius:6px;padding:6px 8px;cursor:pointer;font-family:inherit;font-size:12.5px}
.rt-icon-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-icon-btn.on{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.rt-hbtn{border:1px solid var(--dsw-alias-border-l1);background:transparent;color:inherit;border-radius:6px;
  padding:2px 8px;font-size:12px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px}
.rt-hbtn:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-hbtn.on{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
.rt-test{display:inline-block;padding:0 5px;border-radius:4px;font-size:11px;white-space:nowrap;
  border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.rt-test-testing{color:#f59e0b;border-color:#f59e0b55;background:#f59e0b1a}
.rt-test-tested{color:#10b981;border-color:#10b98155;background:#10b9811a}
.rt-test-blocked{color:#fff;background:#ef4444;border-color:#ef4444}
.rt-test-abandoned{color:#94a3b8;border-color:#94a3b855;background:#94a3b81a}
.rt-test-no_surface{color:#6366f1;border-color:#6366f155;background:#6366f11a}
.rt-scope-testing{color:#5b21b6;background:#ddd6fe}
.rt-pri{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap}
.rt-pri-high{color:#fff;background:#ef4444}
.rt-pri-medium{color:#fff;background:#f59e0b}
.rt-pri-low{color:#fff;background:#94a3b8}
.rt-score-row{display:grid;grid-template-columns:16px 62px minmax(0,1fr) 116px 66px;gap:8px;padding:7px 10px;
  border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;font-size:12.5px;cursor:pointer}
.rt-score-row:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-score-row.head{cursor:default;color:var(--dsw-alias-label-secondary);font-size:11.5px;font-weight:600;
  position:sticky;top:0;background:var(--dsw-alias-bg-layer-1);z-index:1}
.rt-score-detail{grid-column:1/-1;padding:8px 4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
/* 득점 목표는 병합판의 8개 분류로 묶는다: 분류 헤더 + 그룹 안은 점수 오름차순 */
.rt-score-group{display:flex;align-items:center;gap:8px;padding:7px 10px 5px;margin-top:2px;
  font-size:12px;font-weight:600;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.rt-score-group:first-child{border-top:none}
.rt-score-group .rt-sg-sub{font-weight:400;font-size:11px;color:var(--dsw-alias-label-secondary)}
/* ── 세션과 진입점: 카드마다 “제목 행 / 핵심 사실 / 사용 가능한 명령 / 비고” 네 구간으로 나눠 한 줄에 뭉개지지 않게 한다 ── */
.rt-sess-facts{display:flex;flex-direction:column;gap:2px;margin-top:5px}
.rt-sess-fact{display:flex;gap:6px;font-size:11.5px;line-height:1.5}
.rt-sess-fact>b{flex:none;min-width:62px;font-weight:600;color:var(--dsw-alias-label-secondary)}
.rt-sess-fact>span{min-width:0;overflow-wrap:anywhere}
.rt-sess-cmd{margin-top:6px}
.rt-sess-cmd>b{display:block;font-size:11px;color:var(--dsw-alias-label-secondary);margin-bottom:3px;font-weight:600}
.rt-sess-fold{margin-top:6px;font-size:11.5px}
.rt-sess-fold>summary{cursor:pointer;color:var(--dsw-alias-label-secondary);user-select:none}
.rt-sess-fold>summary:hover{color:var(--dsw-alias-label-primary)}
.rt-score-row .rt-scope{font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.rt-score-form{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}
.rt-score-form input,.rt-score-form select{width:100%;box-sizing:border-box}
.rt-vrow{display:grid;grid-template-columns:62px minmax(0,1fr) 132px 108px 74px 52px;gap:8px;padding:6px 10px;
  border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;font-size:12.5px;cursor:pointer}
.rt-vrow:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-vrow.head{cursor:default;color:var(--dsw-alias-label-secondary);font-size:11.5px;font-weight:600;
  position:sticky;top:0;background:var(--dsw-alias-bg-layer-1);z-index:1}
.rt-vdetail{grid-column:1/-1;padding:8px 4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.rt-vdetail .rt-kv{margin-bottom:4px}
.rt-actions{display:flex;gap:6px;margin-top:6px}
.rt-section{padding:8px 10px 2px;font-size:11.5px;font-weight:600;color:var(--dsw-alias-label-secondary)}
.rt-link{color:var(--dsw-alias-brand-primary);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-link:hover{text-decoration:underline}
.rt-full{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;
  background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5;
  border-top:3px solid var(--dsw-alias-brand-primary)}
.rt-full .rt-head{padding:12px 18px}
.rt-full .rt-tabs{padding:10px 18px 0;gap:6px;flex-wrap:wrap}
.rt-full .rt-side{width:260px}
.rt-full .rt-list{width:280px}
.rt-full .rt-row{grid-template-columns:190px 90px 130px 1.4fr 1.2fr}
.rt-full .rt-vrow{grid-template-columns:80px minmax(0,1.6fr) 200px 150px 90px 64px}
.rt-full .rt-pane{padding:18px}
.rt-full .rt-textarea{min-height:60vh}
.rt-full .rt-foot{padding:10px 18px;font-size:12px}
.rt-full .rt-body{max-width:1400px;width:100%;margin:0 auto;flex:1;min-height:0;display:flex;flex-direction:column}
.rt-chain{flex:1;overflow:auto;padding:10px 12px}
.rt-step{display:flex;gap:10px;padding:8px 6px;border-left:2px solid var(--dsw-alias-border-l1);margin-left:6px}
.rt-step:last-child{border-left-color:transparent}
.rt-step-dot{width:22px;height:22px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;color:#fff;background:#64748b;margin-left:-13px}
.rt-step-body{min-width:0}
.rt-step-title{font-weight:600;font-size:13px}
.rt-step-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:2px;word-break:break-word}
.rt-stage-recon{background:#6366f1}
.rt-stage-vuln{background:#f59e0b}
.rt-stage-exploit{background:#ef4444}
.rt-stage-access{background:#10b981}
.rt-stage-pivot{background:#8b5cf6}
.rt-stage-data{background:#0ea5e9}
.rt-stage-other{background:#64748b}
.rt-step-head{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}
.rt-step-time{font-size:11px;color:var(--dsw-alias-label-secondary);margin-left:auto;white-space:nowrap}
.rt-step-detail{font-size:12px;margin-top:5px;white-space:pre-wrap;word-break:break-word;
  border-left:2px solid var(--dsw-alias-border-l1);padding:2px 0 2px 9px;line-height:1.6}
.rt-chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;padding:1px 7px;border-radius:5px;
  border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);margin:4px 5px 0 0;max-width:100%}
.rt-chip>i{font-style:normal;color:var(--dsw-alias-label-secondary);font-size:10.5px}
.rt-chip>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:420px}
.rt-stage-tag{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;color:#fff;font-weight:600}
.rt-st-recon{background:#6366f1}.rt-st-vuln{background:#f59e0b}.rt-st-exploit{background:#ef4444}
.rt-st-access{background:#10b981}.rt-st-pivot{background:#8b5cf6}.rt-st-data{background:#0ea5e9}.rt-st-other{background:#64748b}
.rt-sev{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;font-weight:600;border:1px solid transparent}
.rt-sev-critical{color:#fff;background:#b91c1c}.rt-sev-high{color:#fff;background:#ef4444}
.rt-sev-medium{color:#7c2d12;background:#fdba74}.rt-sev-low{color:#1e3a8a;background:#bfdbfe}
.rt-sev-info{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l1)}
.rt-dot-on{display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 0 3px #10b98133}
.rt-dot-off{display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;box-shadow:0 0 0 3px #ef444433}
.rt-dot-unk{display:inline-block;width:7px;height:7px;border-radius:50%;background:#94a3b8;box-shadow:0 0 0 3px #94a3b833}
.rt-sess-grid{display:grid;grid-template-columns:1fr;gap:8px;padding:10px 12px}
.rt-sess{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:9px 10px;background:var(--dsw-alias-bg-layer-2)}
.rt-sess-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rt-sess-title{font-weight:600;font-size:12.5px;font-family:ui-monospace,Menlo,monospace;word-break:break-all}
.rt-sess-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:3px;word-break:break-word}
.rt-code{font-family:ui-monospace,Menlo,monospace;font-size:11px;background:var(--dsw-alias-bg-base);
  border:1px solid var(--dsw-alias-border-l1);border-radius:4px;padding:1px 5px;cursor:pointer;word-break:break-all}
.rt-code:hover{border-color:var(--dsw-alias-brand-primary)}
.rt-evi{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden;margin-top:8px}
.rt-evi-head{display:flex;align-items:center;gap:8px;padding:5px 9px;background:var(--dsw-alias-bg-layer-2);
  font-size:11.5px;font-weight:600;border-bottom:1px solid var(--dsw-alias-border-l1)}
.rt-evi-body{margin:0;padding:9px 11px;font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.6;
  white-space:pre-wrap;word-break:break-word;max-height:340px;overflow:auto;background:var(--dsw-alias-bg-base)}
.rt-evi-body.req{max-height:220px}
.rt-hl-req{color:#10b981;font-weight:600}
.rt-hl-res{color:#0ea5e9;font-weight:600}
.rt-gain{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;padding:2px 8px;border-radius:12px;
  color:#065f46;background:#a7f3d0;border:1px solid #10b98155}
.rt-total{font-size:20px;font-weight:700;font-family:ui-monospace,Menlo,monospace}
.rt-sidehead{padding:7px 8px 2px;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);
  display:flex;align-items:center;gap:5px}
.rt-sidehead-btn{cursor:pointer;outline:none;padding:6px 6px 5px;border-radius:5px;user-select:none}
.rt-sidehead-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}
.rt-sidehead-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.rt-scope{display:inline-block;padding:0 4px;border-radius:3px;font-size:10px;font-weight:700;line-height:15px;flex:none}
.rt-scope-internal{color:#0e7490;background:#a5f3fc}
.rt-scope-external{color:#9a3412;background:#fed7aa}
.rt-hits{display:flex;flex-direction:column;gap:6px;margin-top:7px}
.rt-hit{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid #10b981;border-radius:6px;
  padding:7px 9px;background:var(--dsw-alias-bg-layer-2)}
.rt-hit-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rt-hit-idx{width:16px;height:16px;border-radius:50%;background:#10b981;color:#fff;font-size:10.5px;font-weight:700;
  display:inline-flex;align-items:center;justify-content:center;flex:none}
.rt-hit-target{font-family:ui-monospace,Menlo,monospace;font-weight:600;font-size:12px;word-break:break-all}
.rt-hit-time{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.rt-hit-evi{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;
  background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:5px;padding:6px 8px;margin-top:5px}
.rt-hit-note{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:4px}
.rt-cred{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid #f59e0b;border-radius:6px;
  padding:8px 10px;background:var(--dsw-alias-bg-layer-2);margin-bottom:7px}
.rt-cred-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rt-cred-host{font-family:ui-monospace,Menlo,monospace;font-weight:600;font-size:12.5px;word-break:break-all}
.rt-secret{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;line-height:1.6;background:#fef3c7;color:#78350f;
  border:1px solid #f59e0b66;border-radius:5px;padding:6px 9px;margin-top:6px;white-space:pre-wrap;word-break:break-all;
  user-select:all;cursor:text}
.rt-secret-none{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--dsw-alias-state-error-primary);
  border:1px dashed var(--dsw-alias-state-error-primary);border-radius:5px;padding:5px 9px;margin-top:6px}
.rt-cred-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:5px;word-break:break-word}
.rt-stage-score{background:#10b981}
.rt-counted{font-family:ui-monospace,Menlo,monospace;font-size:12px;font-weight:700;color:#065f46;background:#a7f3d0;border:1px solid #10b98155;border-radius:9px;padding:0 7px}
.rt-scorepts{font-size:11.5px;font-weight:700;color:#065f46;background:#a7f3d0;border:1px solid #10b98155;
  border-radius:10px;padding:0 7px;white-space:nowrap}
.rt-livebar{display:flex;align-items:center;gap:7px;padding:7px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-layer-2);flex-wrap:wrap}
.rt-live-dot{width:8px;height:8px;border-radius:50%;background:#10b981;flex:none;animation:rt-pulse 1.6s ease-in-out infinite}
.rt-live-dot.idle{background:#94a3b8;animation:none}
@keyframes rt-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 #10b98166}50%{opacity:.5;box-shadow:0 0 0 5px #10b98100}}
.rt-live-body{padding:8px 12px 2px;max-height:44vh;overflow:auto}
.rt-atest{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid #10b981;border-radius:6px;
  padding:7px 10px;background:var(--dsw-alias-bg-layer-2);margin-bottom:6px}
.rt-atest.past{border-left-color:#94a3b8;opacity:.85}
.rt-atest-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rt-atest-ip{font-family:ui-monospace,Menlo,monospace;font-weight:600;font-size:12.5px;word-break:break-all}
.rt-atest-meta{font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-top:3px;word-break:break-word}
.rt-atest-notes{font-family:ui-monospace,Menlo,monospace;font-size:11px;line-height:1.6;white-space:pre-wrap;
  word-break:break-word;background:var(--dsw-alias-bg-base);border-radius:4px;padding:5px 7px;margin-top:4px;max-height:76px;overflow:auto}
.rt-concl{display:flex;align-items:center;gap:4px;padding:6px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);
  background:var(--dsw-alias-bg-layer-2);flex-wrap:wrap}
.rt-concl-i{display:inline-flex;align-items:baseline;gap:4px;padding:2px 8px;border-radius:6px;cursor:pointer;
  border:1px solid transparent}
.rt-concl-i:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1)}
.rt-concl-i.on{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1)}
.rt-concl-i b{font-family:ui-monospace,Menlo,monospace;font-size:14px;font-weight:700}
.rt-concl-i>span{color:var(--dsw-alias-label-secondary);font-size:11.5px}
.rt-more{color:var(--dsw-alias-brand-primary);font-size:11.5px;cursor:pointer;user-select:none;margin-top:4px;display:inline-block}
.rt-more:hover{text-decoration:underline}
.rt-subtabs{display:flex;gap:4px;padding:6px 10px 0;border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center}
.rt-subtab{padding:4px 10px;border-radius:6px 6px 0 0;cursor:pointer;font-size:12px;color:var(--dsw-alias-label-secondary)}
.rt-subtab.on{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font-weight:600}
.rt-sevbar{width:3px;border-radius:2px;align-self:stretch;flex:none;margin-right:2px}
/* ── 접힘 계층 체계 ─────────────────────────────────────────────────────────────
   L1 접힘 헤더 .rt-sec   : 전체 폭, 둥근 모서리·테두리 없음, 왼쪽 색 막대, 어두운 바탕 — 항상 "평평"하다
   L2 내용 카드 .rt-atest/.rt-hit/.rt-cred/.rt-evi: 안쪽으로 들여쓰기, 테두리, 둥근 모서리 — 세워진 느낌
   L3 상세/긴 텍스트 .rt-clip-body / .rt-evi-body : 테두리 없음, 가장 밝음, 고정폭
   L4 하위 항목 컨테이너 .rt-sec-body: 왼쪽 들여쓰기 + 세로 안내선, "위의 헤더에 속한다"를 표시
   ──────────────────────────────────────────────────────────────────────────── */
.rt-sec-wrap{margin:0}
.rt-sec{display:flex;align-items:center;gap:8px;padding:7px 12px 7px 9px;cursor:pointer;
  background:var(--dsw-alias-bg-layer-2);border-left:3px solid var(--dsw-alias-border-l2);
  border-top:1px solid var(--dsw-alias-border-l1);user-select:none;outline:none}
.rt-sec:hover{background:var(--dsw-alias-bg-layer-1)}
.rt-sec:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.rt-sec.flat{cursor:default}
.rt-sec.flat:hover{background:var(--dsw-alias-bg-layer-2)}
.rt-sec-caret{flex:none;width:11px;font-size:10px;color:var(--dsw-alias-label-secondary);text-align:center}
.rt-sec-title{font-weight:600;font-size:13px;white-space:nowrap}
.rt-sec-count{font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.rt-sec-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-sec-right{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none}
.rt-sec.t-stage{border-left-color:#8b5cf6}
.rt-sec.t-target{border-left-color:#0ea5e9}
.rt-sec.t-folder{border-left-color:#64748b}
.rt-sec.t-test{border-left-color:#10b981}
.rt-sec.t-queue{border-left-color:#f59e0b}
.rt-sec.t-past{border-left-color:#94a3b8}
.rt-sec-body{margin-left:12px;border-left:1px solid var(--dsw-alias-border-l1);padding:7px 0 3px 10px}
.rt-sec-body>.rt-atest:last-child,.rt-sec-body>.rt-hit:last-child{margin-bottom:2px}
/* 긴 텍스트 접기(L3): 기본 미리보기 2줄에 페이드, 펼치면 높이 제한 스크롤 */
.rt-clip{margin-top:6px}
.rt-clip-head{display:flex;align-items:center;gap:6px}
.rt-clip-label{font-size:11px;color:var(--dsw-alias-label-secondary);font-weight:600}
.rt-clip-body{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.65;white-space:pre-wrap;
  word-break:break-word;background:var(--dsw-alias-bg-base);border-radius:5px;padding:6px 8px;margin-top:3px}
.rt-clip:not(.open) .rt-clip-body{max-height:46px;overflow:hidden;
  -webkit-mask-image:linear-gradient(180deg,#000 55%,transparent);mask-image:linear-gradient(180deg,#000 55%,transparent)}
.rt-clip.open .rt-clip-body{max-height:340px;overflow:auto}
.rt-flow{padding:10px 12px 16px}
.rt-flow-start,.rt-flow-end{font-size:11.5px;color:var(--dsw-alias-label-secondary);padding:4px 0}
.rt-flow-end{font-weight:600;color:var(--dsw-alias-label-primary)}
.rt-flow-link{display:flex;align-items:center;gap:8px;padding:3px 0 3px 10px}
.rt-flow-arrow{color:var(--dsw-alias-border-l2);font-size:11px;flex:none}
.rt-flow-action{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-flow-action.inferred{opacity:.7;font-style:italic}
.rt-flow-node{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid #10b981;border-radius:8px;
  padding:8px 11px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;outline:none}
.rt-flow-node:hover{border-color:var(--dsw-alias-border-l2)}
.rt-flow-node:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.rt-flow-node.overflow{border-left-color:#94a3b8;opacity:.75}
.rt-flow-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.rt-flow-idx{width:18px;height:18px;border-radius:50%;background:#10b981;color:#fff;font-size:11px;font-weight:700;
  display:inline-flex;align-items:center;justify-content:center;flex:none}
.rt-flow-node.overflow .rt-flow-idx{background:#94a3b8}
.rt-flow-name{font-weight:600;font-size:13px}
.rt-flow-pts{margin-left:auto;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;font-weight:700;color:#065f46;
  background:#a7f3d0;border:1px solid #10b98155;border-radius:10px;padding:0 8px;white-space:nowrap}
.rt-flow-pts.off{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}
.rt-flow-times{font-size:11px;color:var(--dsw-alias-label-secondary)}
.rt-flow-target{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;margin-top:4px;word-break:break-all;
  color:var(--dsw-alias-label-secondary)}
.rt-flow-gain{font-size:12px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-flow-detail{margin-top:7px;padding-top:7px;border-top:1px dashed var(--dsw-alias-border-l1)}
.rt-hflow-wrap{flex:1;min-height:0;display:flex;flex-direction:column;overflow:auto}
.rt-hflow{display:flex;align-items:center;gap:0;padding:16px 12px;overflow-x:auto;flex-wrap:nowrap}
.rt-hflow-item{display:flex;align-items:center;flex:none}
.rt-hflow-start,.rt-hflow-end{font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;padding:0 4px}
.rt-hflow-end{font-weight:600;color:var(--dsw-alias-label-primary)}
.rt-hflow-arrow{color:var(--dsw-alias-border-l2);padding:0 5px;font-size:13px;flex:none}
.rt-hflow-node{display:flex;align-items:center;gap:5px;border:1px solid var(--dsw-alias-border-l1);
  border-left:3px solid #10b981;border-radius:7px;padding:5px 8px;background:var(--dsw-alias-bg-layer-2);
  cursor:pointer;white-space:nowrap;outline:none}
.rt-hflow-node:hover{border-color:var(--dsw-alias-border-l2)}
.rt-hflow-node:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.rt-hflow-node.overflow{border-left-color:#94a3b8;opacity:.72}
.rt-hflow-node.open{border-color:var(--dsw-alias-brand-primary)}
.rt-hflow-pts{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;font-weight:700;color:#065f46;background:#a7f3d0;
  border-radius:8px;padding:0 6px}
.rt-hflow-node.overflow .rt-hflow-pts{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}
.rt-hflow-name{font-size:11.5px}
.rt-hflow-n{font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.rt-rep-list{padding:10px 12px 14px}
.rt-rep-tools{display:flex;gap:6px;justify-content:flex-end;margin-bottom:8px}
.rt-rep{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid #10b981;border-radius:8px;
  padding:9px 11px;margin-bottom:10px;background:var(--dsw-alias-bg-layer-2)}
.rt-rep-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.rt-rep-idx{font-size:15px;color:#10b981;font-weight:700;flex:none}
.rt-rep-name{font-weight:600;font-size:13px}
.rt-rep-meta{font-size:12px;margin-top:4px;color:var(--dsw-alias-label-secondary);word-break:break-word}
.rt-rep-meta b{color:var(--dsw-alias-label-primary);font-weight:600;margin-right:2px}
.rt-rep-missing{font-size:11.5px;color:var(--dsw-alias-state-error-primary);margin-top:6px;
  border:1px dashed var(--dsw-alias-state-error-primary);border-radius:5px;padding:5px 8px}
.rt-rep-req{margin-top:7px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;overflow:hidden}
.rt-rep-req-head{display:flex;align-items:center;gap:7px;padding:4px 8px;font-size:11.5px;font-weight:600;
  background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1)}
.rt-rep-http{margin:0;padding:8px 10px;font-family:ui-monospace,Menlo,monospace;font-size:11.5px;line-height:1.6;white-space:pre-wrap;word-break:break-word;max-height:240px;overflow:auto;background:var(--dsw-alias-bg-base)}
/* ── 보고서의 “이 단계는 어디서 나왔나”: 동작 단계 / 명령 / 자격 증명 / 터널 ───────────── */
.rt-rep-trace{margin-top:8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;padding:8px 10px;
  background:var(--dsw-alias-bg-base)}
.rt-rep-trace-head{display:flex;align-items:center;gap:7px;margin-bottom:5px}
.rt-rep-trace-title{font-weight:600;font-size:12.5px}
.rt-rep-trace-how{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:6px}
.rt-rep-step{border-left:2px solid var(--dsw-alias-border-l1);padding:2px 0 6px 9px;margin-bottom:6px}
.rt-rep-step-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.rt-rep-step-no{width:17px;height:17px;border-radius:50%;background:var(--dsw-alias-label-primary,#111);color:var(--dsw-alias-bg-base,#fff);
  font-size:10.5px;display:flex;align-items:center;justify-content:center;flex:none}
.rt-rep-step-title{font-weight:600;font-size:12.5px}
.rt-rep-step-detail{font-size:12px;color:var(--dsw-alias-label-secondary);margin-top:2px}
.rt-rep-step-cmd{font-size:11.5px;margin-top:4px;display:flex;gap:6px;align-items:flex-start;flex-wrap:wrap}
.rt-rep-step-cmd .rt-mono{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);
  border-radius:5px;padding:2px 6px;word-break:break-all}
.rt-rep-step-result{font-size:11.5px;margin-top:3px;word-break:break-word}
.rt-rep-src{margin-top:6px;padding-top:6px;border-top:1px dashed var(--dsw-alias-border-l1)}
.rt-rep-src-title{font-weight:600;font-size:12px;margin-bottom:3px}
/* ── 전 구간 공격 경로도 ─────────────────────────────────────────────── */
.rt-ap{padding:10px 12px 18px;overflow:auto}
.rt-ap-stage{margin-bottom:2px}
.rt-ap-head{display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--dsw-alias-bg-layer-2);
  border-left:4px solid #64748b;border-top:1px solid var(--dsw-alias-border-l1);border-radius:6px 6px 0 0}
.rt-ap-no{width:20px;height:20px;border-radius:5px;color:#fff;font-size:11px;font-weight:700;flex:none;
  display:inline-flex;align-items:center;justify-content:center}
.rt-ap-name{font-weight:700;font-size:13.5px}
.rt-ap-en{font-size:10px;color:var(--dsw-alias-label-secondary);letter-spacing:.3px}
.rt-ap-phase{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.rt-ap-goal{display:flex;align-items:baseline;gap:8px;padding:6px 10px 6px 9px;font-size:12px;
  border-left:4px solid #64748b;background:var(--dsw-alias-bg-layer-1)}
.rt-ap-goal-tag{font-size:10.5px;font-weight:700;border:1px solid;border-radius:4px;padding:0 5px;white-space:nowrap;flex:none}
.rt-ap-result{padding:7px 10px 3px;border-left:4px solid transparent}
.rt-ap-result-head{display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap}
.rt-ap-pts{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;font-weight:700;color:#065f46;background:#a7f3d0;
  border:1px solid #10b98155;border-radius:10px;padding:0 7px;white-space:nowrap}
.rt-ap-pts.off{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}
/* 서비스 상한 도달/자체 생성으로 미집계인 적중: 점수를 회색(+0)으로 표시해 또 점수가 오른 것처럼 보이지 않게 한다 */
.rt-ap-pts.uncounted{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l1)}
.rt-ap-nth{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.rt-ap-hit{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid #10b981;border-radius:6px;
  padding:6px 9px;margin-bottom:5px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;outline:none}
.rt-ap-hit:hover{border-color:var(--dsw-alias-border-l2)}
.rt-ap-hit:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.rt-ap-hit.overflow{border-left-color:#94a3b8;opacity:.75}
.rt-ap-hit-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rt-ap-hit-name{font-weight:600;font-size:12.5px}
.rt-ap-hit-target{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--dsw-alias-label-secondary);
  margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:46%}
.rt-ap-act{font-size:11px;color:var(--dsw-alias-label-secondary);margin-top:3px}
.rt-ap-act.inferred{font-style:italic;opacity:.75}
.rt-ap-none{font-size:11.5px;color:var(--dsw-alias-label-secondary);padding:2px 0 4px}
.rt-ap-trans{display:flex;align-items:center;gap:7px;padding:2px 0 2px 14px}
.rt-ap-trans-t{font-size:11px;color:var(--dsw-alias-label-secondary)}
/* 횡적 경로도 */
.rt-ap-h{display:flex;align-items:stretch;padding:10px 12px 14px;overflow-x:auto;flex:1;min-height:0}
.rt-ap-col{display:flex;align-items:stretch;flex:none}
.rt-ap-col-arrow{align-self:center;color:var(--dsw-alias-border-l2);padding:0 6px;font-size:12px;flex:none}
.rt-hcol{width:228px;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l1);
  border-top:3px solid #64748b;border-radius:7px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.rt-hcol-goal{font-size:11px;color:var(--dsw-alias-label-secondary);padding:5px 8px;line-height:1.45;
  border-bottom:1px solid var(--dsw-alias-border-l1);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rt-hcol-body{padding:6px 8px;flex:1;min-height:0;overflow:auto}
.rt-hcol-hit{display:flex;align-items:center;gap:5px;font-size:11px;margin-bottom:3px}
.rt-hcol-hit.off{opacity:.6}
.rt-hcol-pts{font-family:ui-monospace,Menlo,monospace;font-size:10.5px;font-weight:700;color:#065f46;background:#a7f3d0;
  border-radius:7px;padding:0 5px;flex:none}
.rt-hcol-hit.off .rt-hcol-pts{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2)}
.rt-hcol-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-hcol-none{font-size:11px;color:var(--dsw-alias-label-secondary)}
.rt-hcol-secs{display:flex;flex-wrap:wrap;gap:3px;margin-top:6px}
.rt-hcol-sec{font-size:10px;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l1);
  border-radius:4px;padding:0 4px}
.rt-hcol-attck{font-family:ui-monospace,Menlo,monospace;font-size:9.5px;color:var(--dsw-alias-label-secondary);
  padding:4px 8px;border-top:1px solid var(--dsw-alias-border-l1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-ap-cum{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.rt-ap-sub{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary);margin:6px 0 3px}
.rt-ap-assets,.rt-ap-tunnels{display:flex;flex-direction:column;gap:3px}
.rt-ap-asset{display:flex;align-items:center;gap:6px;font-size:11.5px;padding:3px 6px;border-radius:5px;
  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1)}
.rt-ap-tunnel{display:flex;align-items:center;gap:6px;font-size:11.5px;padding:4px 7px;border-radius:5px;
  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-left:3px solid #f59e0b}
.rt-hcol-sub{font-size:10.5px;color:var(--dsw-alias-label-secondary);margin-bottom:2px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:flex;gap:5px;align-items:center}
.rt-hcol-sub.off{opacity:.6}
.rt-hit-row{display:flex;flex-wrap:wrap;align-items:center;gap:2px 7px;font-size:11.5px;padding:4px 7px;border-radius:5px;
  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);margin-bottom:3px}
/* 자산과 내용 모두 자동 줄바꿈: 긴 도메인/긴 패스워드/긴 결과도 줄바꿈해 표시하고 말줄임으로 자르지 않는다 */
.rt-hit-asset{font-family:ui-monospace,Menlo,monospace;font-weight:600;flex:0 1 auto;max-width:100%;
  overflow-wrap:anywhere;word-break:break-word}
.rt-hit-txt{flex:1 1 100%;color:var(--dsw-alias-label-primary);line-height:1.55;
  white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}
.rt-hit-txt.none{color:var(--dsw-alias-state-error-primary)}
.rt-hit-row .rt-hit-time{flex:none;margin-left:auto}
/* 직접 등록/자체 생성한 계정: 흔적은 남기되 미집계, 행 전체를 어둡게 */
.rt-hit-row.self-created{opacity:.72;border-left:3px solid #ef444488}
/* 같은 자산 같은 포트의 중복 계정/DB 권한: 서비스 상한 도달, 미집계(흔적만 남긴다) */
.rt-hit-row.service-capped{opacity:.72;border-left:3px solid #f59e0b88}
.rt-hit-row.service-capped .rt-hit-idx{background:#f59e0b}
.rt-rep-group{margin-bottom:14px}
.rt-rep-stage{display:flex;align-items:center;gap:8px;padding:7px 10px;margin-bottom:7px;
  background:var(--dsw-alias-bg-layer-2);border-left:4px solid #64748b;border-radius:6px;
  cursor:pointer;outline:none;user-select:none}
.rt-rep-stage:hover{background:var(--dsw-alias-bg-layer-1)}
.rt-rep-stage:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.rt-rep-no{width:20px;height:20px;border-radius:5px;color:#fff;font-size:11px;font-weight:700;flex:none;
  display:inline-flex;align-items:center;justify-content:center}
.rt-rep-stage-name{font-weight:700;font-size:13px}
.rt-rep-stage-n{font-size:11px;color:var(--dsw-alias-label-secondary)}
/* 접힌 상태에서도 "이 단계에서 몇 점을 땄는지" 한눈에 보여야 하므로 점수를 헤더에 남긴다 */
.rt-rep-pts{font-size:11px;font-weight:600;padding:1px 6px;border-radius:5px;border:1px solid transparent;flex:none}
.rt-rep-body{padding-left:6px}
/* ── 지식 베이스(POC/EXP) ──────────────────────────────────────────── */
.rt-kb-filter{display:flex;align-items:center;gap:7px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}
/* 지식 베이스 분류 개요: 한 줄 라벨, 한 번 누르면 그 분류로 필터된다 */
.rt-kb-cats{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}
/* 지식 베이스 그룹 헤더(분류별 그룹일 때 그룹마다 하나) */
.rt-kb-cat{display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--dsw-alias-bg-layer-2);
  border-bottom:1px solid var(--dsw-alias-border-l1);position:sticky;top:0;z-index:1}
.rt-kb-cat-name{font-weight:600;font-size:12.5px}
/* 스킬 사용 가능성 배지(스킬 라이브러리 탭) */
.rt-avail{display:inline-block;padding:0 5px;border-radius:4px;font-size:10.5px;white-space:nowrap;
  border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.rt-avail-available{color:#10b981;border-color:#10b98155;background:#10b9811a}
.rt-avail-broken{color:#ef4444;border-color:#ef444455;background:#ef44441a}
.rt-avail-unknown{color:#94a3b8;border-color:#94a3b855;background:#94a3b81a}
/* 버전 / 업데이트 모달 */
.rt-modal{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center}
.rt-modal-box{width:min(560px,92vw);max-height:80vh;overflow:auto;background:var(--dsw-alias-bg-layer-1);
  border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:14px 16px;font-size:12.5px;line-height:1.7;
  box-shadow:0 18px 48px rgba(0,0,0,.35);color:var(--dsw-alias-label-primary)}
.rt-modal-box .rt-kv b{min-width:76px}
.rt-kb-check{display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;cursor:pointer}
.rt-kb{border:1px solid var(--dsw-alias-border-l1);border-radius:7px;margin:0 0 8px;overflow:hidden;
  background:var(--dsw-alias-bg-layer-2)}
.rt-kb.open{border-color:var(--dsw-alias-brand-primary)}
.rt-kb-head{display:flex;align-items:center;gap:7px;padding:7px 9px;cursor:pointer;outline:none;flex-wrap:wrap}
.rt-kb-head:hover{background:var(--dsw-alias-bg-layer-1)}
.rt-kb-head:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.rt-kb-title{font-weight:600;font-size:12.5px;overflow-wrap:anywhere}
.rt-kb-kind{font-size:10px;font-weight:700;letter-spacing:.4px;padding:1px 5px;border-radius:4px;
  color:#fff;background:#64748b;flex:none}
.rt-kb-kind.k-exp{background:#ef4444}
.rt-kb-kind.k-poc{background:#f59e0b}
.rt-kb-kind.k-template{background:#8b5cf6}
.rt-kb-kind.k-script{background:#0ea5e9}
.rt-kb-kind.k-payload{background:#10b981}
.rt-kb-sub{font-size:11px;color:var(--dsw-alias-label-secondary);padding:0 9px 7px;overflow-wrap:anywhere}
.rt-kb-body{padding:0 9px 9px}
.rt-kb-actions{display:flex;gap:6px;margin:7px 0}
.rt-kb-body .rt-kv span{overflow-wrap:anywhere;word-break:break-word}
/* 이 PC nuclei 템플릿 적중: 경로가 전부 보여야 한다(명령으로 복사해 바로 실행) */
.rt-kb-tpl{margin-top:12px;border-top:1px dashed var(--dsw-alias-border-l1);padding-top:8px}
.rt-kb-tpl-row{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:3px 7px;border-radius:5px;
  background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);margin-bottom:3px}
.rt-kb-tpl-path{flex:0 1 auto;font-weight:600;overflow-wrap:anywhere}
.rt-kb-tpl-name{flex:1 1 auto;min-width:0;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.rt-md{flex:1;overflow:auto;margin:0;padding:14px 16px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px;
  line-height:1.65;white-space:pre-wrap;word-break:break-word;background:var(--dsw-alias-bg-base)}
.rt-weblink{display:block;font-size:11.5px;margin-top:1px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rt-shots{margin:8px 0 4px;padding:7px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;
  background:var(--dsw-alias-bg-layer-1)}
.rt-shots-head{display:flex;align-items:baseline;gap:8px;font-size:11.5px;margin-bottom:6px}
.rt-shots-n{color:var(--dsw-alias-label-secondary)}
.rt-shot-row{display:flex;gap:8px;flex-wrap:wrap}
.rt-shot{display:flex;flex-direction:column;gap:3px;max-width:220px}
.rt-shot-thumb{border:1px solid var(--dsw-alias-border-l1);border-radius:5px;background:#0b1020;
  object-fit:contain;display:block;width:auto;max-width:216px}
.rt-shot-loading{display:flex;align-items:center;justify-content:center;width:150px;font-size:11px;
  color:var(--dsw-alias-label-secondary)}
.rt-shot-cap{display:flex;align-items:center;gap:5px;font-size:10.5px;overflow-wrap:anywhere}
.rt-shot-label{color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:170px}
.rt-shot-zoom{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:10px;cursor:zoom-out;padding:18px}
.rt-shot-zoom img{max-width:96vw;max-height:86vh;border-radius:6px;box-shadow:0 18px 48px rgba(0,0,0,.5)}
.rt-shot-zoom-cap{color:#e5e7eb;font-size:12px;text-align:center;max-width:90vw;overflow-wrap:anywhere}`; /* ---------------------------------------------------------- 브리지와 상태 */
  /** “전체 보기” 독립 창 안인지 여부(URL hash 표시, 같은 UI 코드를 재사용한다). */
  const isFullWindow = () => {
    try {
      return String(window.location.hash || "") === "#redteam-full";
    } catch {
      return false;
    }
  };

  const api = (req) =>
    fetch(apiUrl("/redteam/api"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    }).then(async (res) => {
      const text = await res.text().catch(() => "");
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        return {
          ok: false,
          error: res.status + " non-json: " + String(text).slice(0, 120),
        };
      }
      if (!res.ok) {
        return Object.assign({}, data || {}, {
          ok: false,
          error:
            (data && (data.error || data.message)) ||
            res.status + " " + res.statusText,
        });
      }
      return data;
    });

  let ui = { open: true, tab: "assets" };
  const subs = new Set();
  const setUI = (patch) => {
    ui = Object.assign({}, ui, patch);
    const snap = Object.assign({}, ui);
    for (const f of Array.from(subs)) {
      try {
        f(snap);
      } catch {
        /* ignore subscriber errors */
      }
    }
  };
  /* 내보내기는 유지한다. 패널 크기는 자기 요소에만 쓰고, 공식 frame 의 너비는 더 이상 바꾸지 않는다. */
  let dockWidthTag = null;
  const setDockWidth = () => {};
  const useUI = () => {
    const [st, setSt] = React.useState(() => Object.assign({}, ui));
    React.useEffect(() => {
      const f = (snap) => setSt(Object.assign({}, snap || ui));
      subs.add(f);
      setSt(Object.assign({}, ui));
      return () => {
        subs.delete(f);
      };
    }, []);
    return st;
  };

  /* 지식 베이스 분류(core.js 의 POC_CATEGORIES 와 일치; 패널은 이 이름으로 묶는다) */
  const POC_CAT_NAME = {
    rce: "원격 명령 실행",
    deserialization: "역직렬화",
    "file-upload": "파일 업로드 getshell",
    sqli: "SQL 인젝션",
    unauthorized: "비인가 접근",
    "auth-bypass": "인증 우회 / 권한 우회",
    "weak-password": "약한 비밀번호 / 브루트포스",
    ssrf: "SSRF",
    xxe: "XXE",
    "path-traversal": "디렉터리 트래버설 / 임의 파일 읽기",
    "info-leak": "정보 유출",
    privesc: "권한 상승 / 횡적",
    tunnel: "터널 / 프록시",
    other: "기타",
  };
  const POC_CAT_ORDER = Object.keys(POC_CAT_NAME);
  /* 역할 code → 한국어(보고서/지식 베이스 모두 “누가 발견했는지” 표시한다) */
  const ROLE_LABEL = {
    plan: "주 세션(지휘)",
    recon: "정보 수집",
    assess: "자산 정리",
    "vuln-scan": "취약점 발견",
    exploit: "취약점 익스플로잇",
    internal: "내부망 침투",
  };

  const fmt = (s) => (s ? String(s).replace("T", " ").slice(0, 16) : "—");
  const shotCache = new Map();
  const shotLoading = new Map();
  const shotSrc = (eng, id) => shotCache.get(eng + ":" + id) || null;
  const loadShot = (eng, id) => {
    const key = eng + ":" + id;
    if (shotCache.has(key) || shotLoading.has(key)) return;
    const p = api({ op: "shotData", engagement: eng, id: id })
      .then((r) => {
        shotCache.set(
          key,
          r && r.base64
            ? "data:" + (r.mime || "image/png") + ";base64," + r.base64
            : "",
        );
        shotLoading.delete(key);
        const snap = Object.assign({}, ui);
        for (const f of Array.from(subs)) {
          try {
            f(snap);
          } catch {
            /* ignore subscriber errors */
          }
        }
      })
      .catch(() => {
        shotLoading.delete(key);
      });
    shotLoading.set(key, p);
  };
  const SHOT_KIND = {
    screenshot: "현장 스크린샷",
    card: "기록에서 생성한 증거 발췌",
  };
  const ShotImage = ({ eng, shot, height }) => {
    const [zoom, setZoom] = React.useState(false);
    const src = shotSrc(eng, shot.id);
    if (src === null) {
      loadShot(eng, shot.id);
    }
    const card = shot.kind === "card";
    return h(
      "div",
      { className: "rt-shot" },
      src === null
        ? h(
            "div",
            {
              className: "rt-shot-thumb rt-shot-loading",
              style: { height: (height || 96) + "px" },
            },
            "불러오는 중…",
          )
        : h("img", {
            className: "rt-shot-thumb",
            src: src,
            alt: shot.label || "증거 " + shot.id,
            style: { height: (height || 96) + "px", cursor: "zoom-in" },
            onClick: () => setZoom(true),
          }),
      h(
        "div",
        { className: "rt-shot-cap" },
        h(
          "span",
          {
            className: "rt-tag " + (card ? "rt-tag-warn" : "rt-tag-live"),
            title: card
              ? "당일 기록에서 생성한 증거 발췌이며 현장 스크린샷이 아닙니다. 보고서에도 같은 표기가 들어갑니다"
              : "현장 스크린샷",
          },
          SHOT_KIND[shot.kind] || shot.kind || "증거",
        ),
        h(
          "span",
          { className: "rt-shot-label", title: shot.label || shot.note || "" },
          shot.label || shot.target || "#" + shot.id,
        ),
      ),
      zoom
        ? h(
            "div",
            { className: "rt-shot-zoom", onClick: () => setZoom(false) },
            h("img", { src: src, alt: shot.label || "" }),
            h(
              "div",
              { className: "rt-shot-zoom-cap" },
              (shot.label || shot.target || "") +
                (card ? " · 당일 기록에서 생성(현장 스크린샷 아님)" : "") +
                (shot.captured_at ? " · " + fmt(shot.captured_at) : "") +
                " · 아무 곳이나 클릭하면 닫힙니다",
            ),
          )
        : null,
    );
  };
  const ShotStrip = ({ eng, shots, total, title }) => {
    const list = shots || [];
    if (list.length === 0) return null;
    return h(
      "div",
      { className: "rt-shots" },
      h(
        "div",
        { className: "rt-shots-head" },
        h("b", null, title || "증거 스크린샷"),
        h(
          "span",
          { className: "rt-shots-n" },
          "표시 " +
            list.length +
            "장" +
            (total && total > list.length
              ? "(해당 점수 항목 총 " + total + "장, 대표 이미지만 표시)"
              : ""),
        ),
      ),
      h(
        "div",
        { className: "rt-shot-row" },
        list.map((sh) =>
          h(ShotImage, { key: "sh" + sh.id, eng: eng, shot: sh }),
        ),
      ),
    );
  };
  /** 발견 시각은 목록에서 “월-일 시:분”만 남긴다: 행 전체 너비가 빠듯하고 전체 시각은 툴팁에 넣는다 */
  const fmtShort = (s) => {
    const t = String(s || "").replace("T", " ");
    return t.length >= 16 ? t.slice(5, 16) : t || "—";
  };
  const provLabel = (p) =>
    p === "passive" ? "수동" : p === "active" ? "능동" : "알 수 없음";

  /**
   * “클릭은 되지만 <button> 이 아닌” 요소에 키보드 접근성을 붙여, props 로 바로 펼칠 수 있는 객체를 돌려준다.
   *
   * 왜 필요한가: 패널에서 div/span 을 버튼처럼 쓰는 곳이 많다(표 행, 탭, 결론 줄, C 블록 항목…).
   * 마우스로는 눌리지만 키보드로는 전혀 닿지 않는다 — 이런 요소가 예전에는 16곳에 제각각 구현되어 있었고,
   * 표기 방식도 달랐다(role 만 있는 곳, Space 키를 빠뜨린 곳).
   * 하나의 팩토리로 통일하면, 새 클릭 요소는 `...clickable(fn, { label })` 만 붙이면 전체 의미를 갖는다.
   *
   * 주의: 진짜 `<button>` 을 이걸로 감싸지 않는다(네이티브 버튼은 의미를 스스로 갖는다).
   * @param onActivate - 활성화 콜백(마우스 클릭 / Enter / Space 모두 이리로 온다).
   * @param options - `{ label?, expanded? }`: label 은 aria-label, expanded 는 aria-expanded 로 간다.
   * @returns props 조각: role / tabIndex / onClick / onKeyDown / aria-*
   */
  const clickable = (onActivate, options = {}) => {
    const props = {
      role: "button",
      tabIndex: 0,
      onClick: onActivate,
      onKeyDown: (e) => {
        /* Enter 와 Space 는 버튼의 표준 활성 키다; Space 는 페이지 스크롤도 막아야 한다 */
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(e);
        }
      },
    };
    if (options.label !== undefined)
      props["aria-label"] = String(options.label);
    if (options.expanded !== undefined)
      props["aria-expanded"] = options.expanded ? "true" : "false";
    return props;
  };

  /**
   * 텍스트를 클립보드에 복사하고 **실제 성공 여부를 돌려준다**.
   *
   * clipboard API 는 비보안 컨텍스트(http + localhost 아님), 페이지 포커스 아웃, 권한 거부 시
   * 거부된 Promise 를 돌려준다 — 동기 try/catch 로는 잡히지 않아서, 화면에는 "복사됨"이 뜨고 클립보드는 비어 있게 된다.
   * 여기서는 실제 결과를 await 하고, 쓸 수 없을 때 execCommand('copy')로 물러난다(구형 브라우저/비보안 컨텍스트에서도 동작).
   * @param text - 복사할 텍스트.
   * @returns Promise<boolean>
   */
  const copyText = async (text) => {
    const value = text === undefined || text === null ? "" : String(text);
    if (value === "") return false;
    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (e) {
      /* 아래 폴백으로 넘어간다 */
    }
    /* 폴백: 임시 textarea + execCommand — 비보안 컨텍스트에서 유일하게 쓸 수 있는 방법 */
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const okFlag = document.execCommand("copy");
      document.body.removeChild(ta);
      return okFlag === true;
    } catch (e) {
      return false;
    }
  };

  /**
   * 복사하고 **사실대로** 화면 피드백을 준다(성공/실패 문구 통일).
   * @param text - 복사할 텍스트.
   * @param label - 성공 시 안내에 표시할 이름.
   * @param onResult - 선택 콜백: `(ok, message) => void`; 넘기지 않으면 Promise<boolean> 을 돌려준다.
   */
  const copyWithFeedback = async (text, label, onResult) => {
    const okFlag = await copyText(text);
    const message = okFlag
      ? "복사됨: " + label
      : "복사 실패(브라우저가 클립보드를 허용하지 않음) — 텍스트를 직접 선택해 복사하세요";
    if (typeof onResult === "function") onResult(okFlag, message);
    return okFlag;
  };

  function ProvTag(props) {
    if (!props.p) return h("span", { className: "rt-tag" }, "알 수 없음");
    return h(
      "span",
      { className: "rt-tag rt-tag-" + props.p },
      provLabel(props.p),
    );
  }

  const TEST_LABEL = {
    untested: "미테스트",
    testing: "테스트 중",
    tested: "테스트 완료",
    blocked: "차단됨",
    abandoned: "포기",
    no_surface: "공격 표면 없음",
  };
  const PRI_LABEL = { high: "높음", medium: "보통", low: "낮음" };

  /** 자산 공략 용이성 배지. */
  function PriTag(props) {
    if (!props.p) return h("span", { className: "rt-tag" }, "미평가");
    return h(
      "span",
      { className: "rt-pri rt-pri-" + props.p, title: props.title || "" },
      PRI_LABEL[props.p] || props.p,
    );
  }

  /** 자산 테스트 상태 배지. */
  function TestTag(props) {
    const st = props.s || "untested";
    return h(
      "span",
      { className: "rt-test rt-test-" + st },
      TEST_LABEL[st] || st,
    );
  }

  /* ---------------------------------------------------------- 자산 매핑 */
  function AssetsTab(props) {
    const eng = props.engagement;
    const snapshot = props.snapshot;
    const refreshKey = props.refreshKey || 0;
    const onRefresh = props.onRefresh;
    const [view, setView] = React.useState("list");
    const [cidr, setCidr] = React.useState(null);
    const [q, setQ] = React.useState("");
    const [qApplied, setQApplied] = React.useState("");
    const [service, setService] = React.useState("");
    const [port, setPort] = React.useState("");
    const [prov, setProv] = React.useState("");
    const [testStatus, setTestStatus] = React.useState("");
    const [priority, setPriority] = React.useState("");
    const [scope, setScope] = React.useState("");
    const [assetState, setAssetState] = React.useState("");
    const [sort, setSort] = React.useState("priority");
    const [showAll, setShowAll] = React.useState(null);
    const [state, setState] = React.useState({
      loading: false,
      error: null,
      total: 0,
      items: [],
    });
    const [domains, setDomains] = React.useState(null);
    const [web, setWeb] = React.useState(null);
    const [openId, setOpenId] = React.useState(null);
    const [detail, setDetail] = React.useState(null);
    /* 왼쪽 “외부망 C 블록 / 내부망 C 블록” 두 그룹은 각각 접히며, 상태는 타깃별로 기억한다 */
    const sideCollapse = useCollapse("assets-side:" + eng);
    const seq = React.useRef(0);
    const onData = props.onData;

    React.useEffect(() => {
      if (!eng) return;
      const my = ++seq.current;
      setState((s) => Object.assign({}, s, { loading: true, error: null }));
      api({
        op: "assets",
        engagement: eng,
        cidr: cidr || undefined,
        q: qApplied || undefined,
        service: service || undefined,
        port: port || undefined,
        provenance: prov || undefined,
        test_status: testStatus || undefined,
        priority: priority || undefined,
        scope: scope || undefined,
        state: assetState || undefined,
        sort: sort,
        limit: 400,
      }).then(
        (r) => {
          if (my !== seq.current) return;
          if (!r || r.ok === false) {
            setState({
              loading: false,
              error: (r && r.error) || "조회 실패",
              total: 0,
              items: [],
            });
            return;
          }
          setState({
            loading: false,
            error: null,
            total: r.total,
            items: r.items || [],
          });
          /* C 블록/통계는 이번 수집으로 늘어날 수 있다: 바깥에서 스냅샷을 다시 받아 왼쪽 분류를 즉시 갱신한다 */
          if (onData) onData();
        },
        (e) => {
          if (my === seq.current)
            setState({
              loading: false,
              error: String((e && e.message) || e),
              total: 0,
              items: [],
            });
        },
      );
    }, [
      eng,
      cidr,
      qApplied,
      service,
      port,
      prov,
      testStatus,
      priority,
      scope,
      assetState,
      sort,
      refreshKey,
    ]);

    React.useEffect(() => {
      if (!eng || view !== "domain") return;
      setDomains(null);
      api({ op: "domains", engagement: eng, cidr: cidr || undefined }).then(
        (r) => setDomains((r && r.items) || []),
        () => setDomains([]),
      );
    }, [eng, view, cidr, refreshKey]);

    React.useEffect(() => {
      if (!eng || view !== "web") return;
      setWeb(null);
      api({ op: "web", engagement: eng, cidr: cidr || undefined }).then(
        (r) => setWeb((r && r.items) || []),
        () => setWeb([]),
      );
    }, [eng, view, cidr, refreshKey]);

    const toggleRow = (id) => {
      if (openId === id) {
        setOpenId(null);
        setDetail(null);
        return;
      }
      setOpenId(id);
      setDetail(null);
      api({ op: "asset", engagement: eng, id: id }).then(
        (r) => {
          if (r && r.ok && r.asset) setDetail(r.asset);
        },
        () => {},
      );
    };

    const segs = (snapshot && snapshot.segments) || [];

    const sideChildren = [];
    sideChildren.push(
      h(
        "div",
        Object.assign(
          {
            key: "all",
            className:
              "rt-seg" + (cidr === null && view !== "testing" ? " on" : ""),
          },
          clickable(
            () => {
              setView("list");
              setCidr(null);
            },
            {
              label: "전체 C 블록",
              expanded: cidr === null && view !== "testing",
            },
          ),
        ),
        h("div", { className: "rt-seg-cidr" }, "전체 C 블록"),
        h("div", { className: "rt-seg-meta" }, segs.length + "개 대역"),
      ),
    );
    sideChildren.push(
      h(
        "div",
        Object.assign(
          {
            key: "testing",
            className: "rt-seg" + (view === "testing" ? " on" : ""),
            title: "실행 중인 스캔 / 탐지와 진행률(5초 자동 새로고침)",
          },
          clickable(
            () => {
              setView("testing");
              setCidr(null);
            },
            { label: "현재 테스트", expanded: view === "testing" },
          ),
        ),
        h(
          "div",
          {
            className: "rt-seg-cidr",
            style: { display: "flex", alignItems: "baseline", gap: 5 },
          },
          h(
            "span",
            {
              className: "rt-scope rt-scope-testing",
              title: "현재 테스트(내부망도 외부망도 아님)",
            },
            "현재",
          ),
          h("span", { style: { flex: 1 } }, "현재 테스트"),
        ),
        h("div", { className: "rt-seg-meta" }, "실행 중인 스캔과 탐지"),
      ),
    );
    /* C 블록을 내외부로 묶는다: 먼저 외부망(인터넷 도달 가능, 보통 진입점) 그리고 내부망(뚫고 들어간 뒤에야 보인다) */
    const segBlock = (title, list, kind) => {
      /* 외부망 / 내부망 두 그룹은 각각 접을 수 있고(상태는 타깃별 기억), 기본은 펼침 */
      const open = sideCollapse.isOpen("scope:" + kind, true);
      const toggle = sideCollapse.toggle("scope:" + kind, true);
      const out = [
        h(
          "div",
          {
            key: "h" + kind,
            className: "rt-sidehead rt-sidehead-btn",
            role: "button",
            tabIndex: 0,
            "aria-expanded": open ? "true" : "false",
            title:
              (open ? "이 그룹 접기" : "이 그룹 펼치기") +
              "(자산 목록으로도 전환)",
            onClick: () => {
              setView("list");
              toggle();
            },
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setView("list");
                toggle(e);
              }
            },
          },
          h("span", { className: "rt-sec-caret" }, open ? "▾" : "▸"),
          h(
            "span",
            { className: "rt-scope rt-scope-" + kind },
            kind === "internal" ? "내부망" : "외부망",
          ),
          h("span", null, title + " · " + list.length + "개 C 블록"),
          h("span", { className: "rt-spacer" }),
          h(
            "span",
            { style: { fontWeight: 400 } },
            list.reduce((n, x) => n + (x.assets || 0), 0) + "개 자산",
          ),
        ),
      ];
      if (!open) return out;
      for (const s of list) {
        /* 한 줄에 한 대역: C 블록 + 자산 수만 준다(포트 수는 자리를 차지하지 않고, 소유/생존은 툴팁에 넣는다) */
        out.push(
          h(
            "div",
            Object.assign(
              {
                key: s.cidr,
                className: "rt-seg" + (cidr === s.cidr ? " on" : ""),
                title:
                  (s.org || "소유 불명") +
                  " · 생존 " +
                  (s.live || 0) +
                  "/" +
                  (s.assets || 0) +
                  "대",
              },
              clickable(
                () => {
                  setView("list");
                  setCidr(s.cidr);
                },
                {
                  label: "C 블록 필터 " + s.cidr,
                  expanded: cidr === s.cidr && view !== "testing",
                },
              ),
            ),
            h(
              "div",
              {
                className: "rt-seg-cidr",
                style: { display: "flex", alignItems: "baseline", gap: 5 },
              },
              h(
                "span",
                { className: "rt-scope rt-scope-" + kind },
                kind === "internal" ? "내" : "외",
              ),
              h("span", { style: { flex: 1 } }, s.cidr),
              h(
                "span",
                {
                  className: "rt-seg-meta",
                  style: { margin: 0, whiteSpace: "nowrap" },
                },
                s.assets + "대",
              ),
            ),
          ),
        );
      }
      return out;
    };
    const segExternal = segs.filter((x) => x.scope !== "internal");
    const segInternal = segs.filter((x) => x.scope === "internal");
    if (segExternal.length)
      sideChildren.push(...segBlock("외부망 자산", segExternal, "external"));
    if (segInternal.length)
      sideChildren.push(...segBlock("내부망 자산", segInternal, "internal"));
    const side = h("div", { className: "rt-side" }, sideChildren);

    const toolbar = h(
      "div",
      { className: "rt-toolbar" },
      h("input", {
        className: "rt-input",
        style: { flex: "1 1 150px" },
        placeholder: "IP / 도메인 / 지문 검색(Enter)",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") setQApplied(q);
        },
      }),
      h(
        "button",
        { className: "rt-btn", onClick: () => setQApplied(q) },
        "검색",
      ),
      h("input", {
        className: "rt-input",
        style: { width: "78px" },
        placeholder: "서비스",
        value: service,
        onChange: (e) => setService(e.target.value),
      }),
      h("input", {
        className: "rt-input",
        style: { width: "60px" },
        placeholder: "포트",
        value: port,
        onChange: (e) => setPort(e.target.value),
      }),
      h(
        "select",
        {
          className: "rt-input",
          value: scope,
          onChange: (e) => setScope(e.target.value),
        },
        h("option", { value: "" }, "내외부 무관"),
        h("option", { value: "external" }, "외부망 자산만"),
        h("option", { value: "internal" }, "내부망 자산만"),
      ),
      h(
        "select",
        {
          className: "rt-input",
          value: prov,
          onChange: (e) => setProv(e.target.value),
          title:
            "포트 출처로 필터(목록에는 더 이상 별도 열로 나오지 않고 상세에서 볼 수 있습니다)",
        },
        h("option", { value: "" }, "출처 무관"),
        h("option", { value: "passive" }, "수동만"),
        h("option", { value: "active" }, "능동만"),
      ),
      h(
        "select",
        {
          className: "rt-input",
          value: priority,
          onChange: (e) => setPriority(e.target.value),
        },
        h("option", { value: "" }, "공략 용이성 무관"),
        h("option", { value: "high" }, "쉬움(높음)"),
        h("option", { value: "medium" }, "보통(중간)"),
        h("option", { value: "low" }, "어려움(낮음)"),
      ),
      h(
        "select",
        {
          className: "rt-input",
          value: testStatus,
          onChange: (e) => setTestStatus(e.target.value),
        },
        h("option", { value: "" }, "테스트 상태 무관"),
        h("option", { value: "untested" }, "미테스트"),
        h("option", { value: "testing" }, "테스트 중"),
        h("option", { value: "tested" }, "테스트 완료"),
        h("option", { value: "blocked" }, "차단됨"),
        h("option", { value: "abandoned" }, "포기"),
        h("option", { value: "no_surface" }, "공격 표면 없음"),
      ),
      h("div", { className: "rt-spacer" }),
      h(
        "button",
        {
          className: "rt-btn",
          title: "스냅샷과 현재 뷰 데이터를 다시 가져옵니다",
          onClick: () => {
            if (onRefresh) onRefresh();
          },
        },
        "새로고침",
      ),
      h(
        "button",
        {
          className: "rt-btn" + (view === "list" ? " rt-btn-primary" : ""),
          onClick: () => setView("list"),
        },
        "목록",
      ),
      h(
        "button",
        {
          className: "rt-btn" + (view === "timeline" ? " rt-btn-primary" : ""),
          title:
            "발견 시각 기준으로 자산 보기(언제 발견했고 어느 날 얼마나 모았는지)",
          onClick: () => setView("timeline"),
        },
        "발견 시각",
      ),
      h(
        "button",
        {
          className: "rt-btn" + (view === "domain" ? " rt-btn-primary" : ""),
          onClick: () => setView("domain"),
        },
        "도메인",
      ),
      h(
        "button",
        {
          className: "rt-btn" + (view === "web" ? " rt-btn-primary" : ""),
          onClick: () => setView("web"),
        },
        "Web",
      ),
    );

    /* ── 결론줄: 한 화면에서 현황을 다 보고, 숫자를 누르면 그것이 필터가 된다 ───────────────────── */
    const tests = (snapshot && snapshot.tests) || {};
    const snapStats = (snapshot && snapshot.stats) || {};
    const noFilter =
      !testStatus && !priority && !scope && !prov && !assetState && !cidr;
    const conclItem = (key, label, value, active, onClick) =>
      h(
        "span",
        Object.assign(
          {
            key: key,
            className: "rt-concl-i" + (active ? " on" : ""),
            title: "클릭하면 필터 / 다시 클릭하면 해제",
          },
          clickable(onClick, {
            label: "“" + label + "”로 필터(" + (value || 0) + ")",
            expanded: active,
          }),
        ),
        h("b", null, String(value || 0)),
        h("span", null, label),
      );
    const toggleTest = (v) => {
      setTestStatus((cur) => (cur === v ? "" : v));
      setAssetState("");
    };
    const conclusion = h(
      "div",
      { className: "rt-concl" },
      conclItem("all", "개 자산", snapStats.assets, noFilter, () => {
        setTestStatus("");
        setPriority("");
        setScope("");
        setProv("");
        setAssetState("");
        setCidr(null);
      }),
      conclItem(
        "live",
        "생존",
        snapStats.liveAssets,
        assetState === "live",
        () => {
          setAssetState((v) => (v === "live" ? "" : "live"));
          setTestStatus("");
        },
      ),
      conclItem(
        "untested",
        "대기",
        tests.untested,
        testStatus === "untested",
        () => toggleTest("untested"),
      ),
      conclItem(
        "testing",
        "테스트 중",
        tests.testing,
        testStatus === "testing",
        () => toggleTest("testing"),
      ),
      conclItem("tested", "완료", tests.tested, testStatus === "tested", () =>
        toggleTest("tested"),
      ),
      conclItem(
        "giveup",
        "포기",
        (tests.abandoned || 0) + (tests.blocked || 0),
        testStatus === "abandoned,blocked",
        () => toggleTest("abandoned,blocked"),
      ),
      h("div", { className: "rt-spacer" }),
      h(
        "select",
        {
          className: "rt-input",
          value: sort,
          onChange: (e) => setSort(e.target.value),
          title: "목록 정렬 방식",
        },
        h("option", { value: "priority" }, "정렬: 공략 용이성 우선"),
        h("option", { value: "todo" }, "정렬: 대기 우선"),
        h("option", { value: "discovered" }, "정렬: 최근 발견 우선"),
        h("option", { value: "ports" }, "정렬: 포트 많은 순"),
        h("option", { value: "ip" }, "정렬: IP 순"),
      ),
    );

    const head = h(
      "div",
      { className: "rt-row head" },
      h("span", null, "IP"),
      h("span", null, "공략"),
      h("span", null, "테스트 상태"),
      h("span", null, "열린 포트 / 서비스"),
      h("span", null, "지문"),
    );

    const rowNodes = [];
    for (const it of state.items) {
      const openPorts = it.ports.filter((p) => p.state === "open");
      const portText =
        openPorts
          .map((p) => p.port + (p.service ? "/" + p.service : ""))
          .join(", ") || "—";
      const fpText =
        it.fingerprints
          .map((f) =>
            [f.vendor, f.product, f.version].filter(Boolean).join(" "),
          )
          .join(" / ") || "—";
      /* 포트는 최대 3개만 나열하고 나머지는 +N; 수동/능동 출처는 더 이상 열을 차지하지 않고 상세로 간다 */
      const shownPorts = openPorts
        .slice(0, 3)
        .map((p) => p.port + (p.service ? "/" + p.service : ""))
        .join(", ");
      const morePorts =
        openPorts.length > 3 ? " +" + (openPorts.length - 3) : "";
      rowNodes.push(
        h(
          "div",
          Object.assign(
            {
              key: "r" + it.id,
              className: "rt-row",
            },
            clickable(() => toggleRow(it.id), {
              label: "자산 펼치기 " + it.ip,
              expanded: openId === it.id,
            }),
          ),
          h(
            "span",
            {
              className: "rt-mono",
              style: {
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                flexWrap: "wrap",
              },
            },
            h(
              "span",
              {
                className:
                  "rt-scope rt-scope-" +
                  (it.scope === "internal" ? "internal" : "external"),
              },
              it.scope === "internal" ? "내" : "외",
            ),
            h("span", {
              title: it.state === "live" ? "생존" : String(it.state),
              style: {
                width: 7,
                height: 7,
                borderRadius: "50%",
                flex: "none",
                marginTop: 4,
                background: it.state === "live" ? "#10b981" : "#94a3b8",
              },
            }),
            h(
              "span",
              { style: { overflow: "hidden", textOverflow: "ellipsis" } },
              it.ip,
            ),
            /* 발견 시각은 IP 아래 한 줄에 붙인다: IP 열 너비가 빠듯해 별도 열을 열지 않는다(열 너비를 고치면 표 전체를 따라 고쳐야 한다) */
            h(
              "span",
              {
                style: {
                  fontSize: 10.5,
                  color: "var(--dsw-alias-label-secondary)",
                  whiteSpace: "nowrap",
                },
                title:
                  "발견 시각: " +
                  (it.discovered_at ? fmt(it.discovered_at) : "미기록") +
                  (it.last_seen ? "\n최근 수집: " + fmt(it.last_seen) : ""),
              },
              it.discovered_at ? fmtShort(it.discovered_at) : "발견 시각 미상",
            ),
          ),
          h(
            "span",
            null,
            h(PriTag, { p: it.priority, title: it.potential || "" }),
          ),
          h(
            "span",
            null,
            h(TestTag, { s: it.test_status }),
            it.blocked_count
              ? h(
                  "span",
                  {
                    className: "rt-tag",
                    style: {
                      color: "#ef4444",
                      borderColor: "#ef444455",
                      marginLeft: 4,
                    },
                  },
                  "차단 " + it.blocked_count,
                )
              : null,
          ),
          h("span", { title: portText }, (shownPorts || "—") + morePorts),
          h(
            "span",
            { title: fpText },
            fpText.length > 30 ? fpText.slice(0, 30) + "…" : fpText,
          ),
        ),
      );

      if (openId !== it.id) continue;
      const d = detail && detail.id === it.id ? detail : null;
      const portRows = [];
      const fpRows = [];
      const obsRows = [];
      if (d) {
        for (const p of d.ports || []) {
          if (p.state !== "open") continue;
          portRows.push(
            h(
              "div",
              { key: "p" + p.port, className: "rt-kv" },
              h("b", { className: "rt-mono" }, p.port + "/" + p.proto),
              h(
                "span",
                null,
                [p.service, p.product, p.version].filter(Boolean).join(" ") ||
                  "알 수 없는 서비스",
              ),
              p.url
                ? h(
                    "a",
                    {
                      className: "rt-link",
                      href: p.url,
                      target: "_blank",
                      rel: "noreferrer",
                      title: p.url,
                    },
                    p.title ? p.title : p.url,
                  )
                : null,
              h(ProvTag, { p: p.provenance }),
            ),
          );
        }
        for (const f of d.fingerprints || []) {
          fpRows.push(
            h(
              "div",
              {
                key:
                  "f" +
                  (f.product || "") +
                  (f.version || "") +
                  (f.evidence || ""),
                className: "rt-kv",
              },
              h("b", null, f.category || "—"),
              h(
                "span",
                null,
                [f.vendor, f.product, f.version].filter(Boolean).join(" ") +
                  (f.evidence ? "(" + f.evidence + ")" : ""),
              ),
              h(ProvTag, { p: f.provenance }),
            ),
          );
        }
        for (const o of (d.observations || []).slice(0, 8)) {
          obsRows.push(
            h(
              "div",
              {
                key:
                  "o" +
                  (o.attr || "") +
                  (o.value || "") +
                  (o.collected_at || ""),
                className: "rt-kv",
              },
              h("b", null, o.attr || "—"),
              h(
                "span",
                null,
                (o.value || "") +
                  " · " +
                  (o.tool || "알 수 없는 도구") +
                  " · " +
                  fmt(o.collected_at),
              ),
              h(ProvTag, { p: o.provenance }),
            ),
          );
        }
      }
      /* 상세는 세 층이다: 반드시 읽을 3줄 → “전체 펼치기” 후에야 출처 추적, 원본 기록, 비고 전문 */
      const all = showAll === it.id;
      const noteLines =
        d && d.test_notes ? d.test_notes.split("\n").filter(Boolean) : [];
      const inner = d
        ? h(
            "div",
            null,
            /* 반드시 읽을 3줄 */
            h(
              "div",
              { className: "rt-kv" },
              h("b", null, "테스트"),
              h(
                "span",
                null,
                h(TestTag, { s: d.test_status }),
                d.blocked_count
                  ? h(
                      "span",
                      {
                        className: "rt-tag",
                        style: {
                          marginLeft: 6,
                          color: "#ef4444",
                          borderColor: "#ef444455",
                        },
                      },
                      "차단 " + d.blocked_count + "회",
                    )
                  : null,
                h(
                  "span",
                  {
                    style: {
                      marginLeft: 8,
                      color: "var(--dsw-alias-label-secondary)",
                    },
                  },
                  (d.test_updated_at ? fmt(d.test_updated_at) : "미테스트") +
                    (d.test_updated_by ? " · " + d.test_updated_by : ""),
                ),
              ),
            ),
            h(
              "div",
              { className: "rt-kv" },
              h("b", null, "공략 용이성"),
              h(
                "span",
                null,
                h(PriTag, { p: d.priority }),
                h(
                  "span",
                  { style: { marginLeft: 8 } },
                  d.potential || "미평가",
                ),
                d.assess_reason
                  ? h(
                      "span",
                      {
                        style: {
                          marginLeft: 8,
                          color: "var(--dsw-alias-label-secondary)",
                        },
                      },
                      d.assess_reason,
                    )
                  : null,
              ),
            ),
            h(
              "div",
              { className: "rt-kv" },
              h("b", null, "공격 표면"),
              h(
                "span",
                null,
                d.test_surface ||
                  (portRows.length
                    ? "미기록(열린 포트는 아래 참조)"
                    : "열린 포트 없음"),
                d.scope
                  ? h(
                      "span",
                      {
                        className:
                          "rt-scope rt-scope-" +
                          (d.scope === "internal" ? "internal" : "external"),
                        style: { marginLeft: 8 },
                      },
                      d.scope === "internal" ? "내부망 자산" : "외부망 자산",
                    )
                  : null,
              ),
            ),
            h(
              "span",
              Object.assign(
                { className: "rt-more" },
                clickable(() => setShowAll(all ? null : it.id), {
                  label: all ? "자산 상세 접기" : "자산 상세 펼치기",
                  expanded: all,
                }),
              ),
              all
                ? "전체 접기 ▲"
                : "전체 펼치기(포트 · 지문 · 수집 출처 · 테스트 기록) ▼",
            ),
            all
              ? h(
                  "div",
                  null,
                  h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "호스트 이름"),
                    h(
                      "span",
                      null,
                      (d.names || []).map((n) => n.name).join(", ") || "—",
                    ),
                  ),
                  h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "발견 시각"),
                    h(
                      "span",
                      {
                        title:
                          '이 자산이 자산 목록에 처음 들어온 시각(중복 수집은 "최근 수집"만 갱신합니다)',
                      },
                      fmt(d.discovered_at),
                    ),
                    h(
                      "b",
                      { style: { minWidth: 0, marginLeft: 8 } },
                      "최근 수집",
                    ),
                    h("span", null, fmt(d.last_seen)),
                    h(
                      "b",
                      { style: { minWidth: 0, marginLeft: 8 } },
                      "데이터 소스 최초 확인",
                    ),
                    h("span", null, fmt(d.first_seen)),
                  ),
                  h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "C 블록"),
                    h("span", null, d.segment_cidr),
                  ),
                  h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "공략 용이성"),
                    h(
                      "span",
                      null,
                      (d.priority || "미평가") +
                        (d.potential ? " · 예상: " + d.potential : "") +
                        (d.assess_reason ? " · 근거: " + d.assess_reason : "") +
                        (d.assessed_at ? "(" + fmt(d.assessed_at) + ")" : ""),
                    ),
                  ),
                  h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "출처"),
                    h(
                      "span",
                      null,
                      "수동 포트 " +
                        (d.passive || 0) +
                        " · 능동 포트 " +
                        (d.active || 0),
                    ),
                  ),
                  h(
                    "div",
                    { style: { margin: "6px 0 3px", fontWeight: 600 } },
                    "열린 포트 / 서비스",
                  ),
                  h("div", null, portRows.length ? portRows : "—"),
                  h(
                    "div",
                    { style: { margin: "6px 0 3px", fontWeight: 600 } },
                    "지문",
                  ),
                  h("div", null, fpRows.length ? fpRows : "—"),
                  noteLines.length
                    ? h(Clip, {
                        key: "notes",
                        label: "테스트 기록(" + noteLines.length + "건)",
                        text: noteLines.join("\n"),
                      })
                    : null,
                  h(
                    "div",
                    { style: { margin: "6px 0 3px", fontWeight: 600 } },
                    "수집 출처(최근 8건)",
                  ),
                  h("div", null, obsRows.length ? obsRows : "—"),
                )
              : null,
          )
        : h("div", null, "불러오는 중…");
      rowNodes.push(
        h(
          "div",
          {
            key: "d" + it.id,
            className: "rt-row",
            style: { cursor: "default", gridTemplateColumns: "1fr" },
          },
          h("div", { className: "rt-expand" }, inner),
        ),
      );
    }

    const listPane = h(
      "div",
      { className: "rt-table" },
      head,
      rowNodes,
      !state.loading && !state.items.length
        ? h("div", { className: "rt-empty" }, "일치하는 자산이 없습니다")
        : null,
    );

    /* 도메인 차원: 도메인 → 연관 자산 */
    const domainPane = h(
      "div",
      { className: "rt-table" },
      domains === null
        ? h("div", { className: "rt-empty" }, "불러오는 중…")
        : domains.length
          ? domains.map((g) =>
              h(
                "div",
                { key: g.domain },
                h(
                  "div",
                  {
                    className: "rt-section",
                    style: { padding: "8px 10px 4px" },
                  },
                  h(
                    "a",
                    {
                      className: "rt-link",
                      href: "http://" + g.domain,
                      target: "_blank",
                      rel: "noreferrer",
                    },
                    g.domain,
                  ),
                  h(
                    "span",
                    { className: "rt-tag", style: { marginLeft: 8 } },
                    g.count + "개 자산",
                  ),
                ),
                g.assets.map((a) =>
                  h(
                    "div",
                    {
                      key: String(g.domain) + "\u0000" + a.id + "\u0000" + a.ip,
                      className: "rt-row",
                      style: {
                        gridTemplateColumns: "150px 130px 70px 1fr",
                        cursor: "pointer",
                      },
                      onClick: () => {
                        setView("list");
                        setQ("");
                        setQApplied(a.ip);
                      },
                    },
                    h("span", { className: "rt-mono" }, a.ip),
                    h("span", { className: "rt-mono" }, a.segment),
                    h(
                      "span",
                      null,
                      h(
                        "span",
                        {
                          className:
                            "rt-tag rt-tag-" +
                            (a.state === "live" ? "live" : "dead"),
                        },
                        a.state === "live" ? "생존" : a.state,
                      ),
                    ),
                    h(
                      "span",
                      {
                        style: {
                          fontSize: 11,
                          color: "var(--dsw-alias-label-secondary)",
                        },
                      },
                      (a.names || []).join(", "),
                    ),
                  ),
                ),
              ),
            )
          : h(
              "div",
              { className: "rt-empty" },
              cidr
                ? "이 C 블록에는 아직 도메인이 없습니다(“전체 C 블록”으로 전환하면 전체를 볼 수 있습니다)"
                : "도메인 데이터가 없습니다(정보 수집 단계에서 도메인이 기록됩니다)",
            ),
    );

    /* Web 자산: 제목 + 바로 클릭할 수 있는 URL */
    const webPane = h(
      "div",
      { className: "rt-table" },
      h(
        "div",
        {
          className: "rt-row head",
          style: { gridTemplateColumns: "1.6fr 1.2fr 130px 110px" },
        },
        h("span", null, "URL(클릭 가능)"),
        h("span", null, "제목"),
        h("span", null, "자산"),
        h("span", null, "서비스"),
      ),
      (web || []).map((w) => {
        const url =
          w.url ||
          "http" +
            (w.port === 443 || w.port === 8443 || w.port === 9443 ? "s" : "") +
            "://" +
            w.ip +
            (w.port === 80 || w.port === 443 ? "" : ":" + w.port);
        return h(
          "div",
          {
            key: "w" + w.port_id,
            className: "rt-row",
            style: {
              gridTemplateColumns: "1.6fr 1.2fr 130px 110px",
              cursor: "default",
            },
          },
          h(
            "a",
            {
              className: "rt-link rt-mono",
              href: url,
              target: "_blank",
              rel: "noreferrer",
              title: url,
            },
            url,
          ),
          h("span", { title: w.title || "" }, w.title || "—"),
          h("span", { className: "rt-mono" }, w.ip + " · " + w.segment_cidr),
          h(
            "span",
            { style: { fontSize: 11 } },
            [w.service, w.product, w.version].filter(Boolean).join(" "),
          ),
        );
      }),
      web === null
        ? h("div", { className: "rt-empty" }, "불러오는 중…")
        : !web.length
          ? h(
              "div",
              { className: "rt-empty" },
              cidr
                ? "이 C 블록에는 아직 Web 자산이 없습니다"
                : "Web 자산이 없습니다(HTTP 탐지 후 URL 과 제목이 기록됩니다)",
            )
          : null,
    );

    let pane = listPane;
    if (view === "testing")
      pane = h(TestingTab, { engagement: eng, refreshKey: refreshKey });
    else if (view === "domain") pane = domainPane;
    else if (view === "web") pane = webPane;
    /* 발견 시각 뷰는 자체 스크롤 컨테이너를 가지므로 rt-main 의 flex 에 그대로 넣는다 */
    else if (view === "timeline")
      pane = h(DiscoveryView, { engagement: eng, refreshKey: refreshKey });

    return h(
      "div",
      { className: "rt-split" },
      side,
      h(
        "div",
        { className: "rt-main" },
        view === "testing" ? null : toolbar,
        conclusion,
        state.error ? h("div", { className: "rt-err" }, state.error) : null,
        pane,
      ),
    );
  }

  /* ---------------------------------------------------------- 자산 발견 타임라인 */
  /**
   * 자산 발견 타임라인: 언제 무엇을 발견했고 어느 날 얼마나 모았는지.
   * ⚠️ 이 컴포넌트는 "그래프 뷰 제거" 때 함께 삭제된 적이 있다 — 삭제 구간의 끝 표시를 너무 넓게 잡아
   *    (그래프 캔버스의 마무리와 붙어 있었다) bundle 자체 점검의 "client.js 에 자산 “발견 시각” 뷰가 있다"
   *    가 빨간불이 되었다. 복구할 때 삽입 지점을 "자산 매핑 주석 블록 앞"으로 고정해 다른 삭제에 휩쓸리지 않게 한다.
   */
  function DiscoveryView(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [day, setDay] = React.useState("");
    React.useEffect(() => {
      if (!eng) return;
      setData(null);
      api({ op: "discoveryTimeline", engagement: eng, limit: 200 }).then(
        (r) => {
          if (!r || r.ok === false) setErr((r && r.error) || "불러오기 실패");
          else {
            setErr(null);
            setData(r);
          }
        },
        (e) => setErr(String((e && e.message) || e)),
      );
    }, [eng, refreshKey]);
    if (err)
      return h(
        "div",
        { className: "rt-pane" },
        h("div", { className: "rt-err" }, err),
      );
    if (!data) return h("div", { className: "rt-empty" }, "불러오는 중…");
    const recent = (data.recent || []).filter(
      (a) => day === "" || String(a.discovered_at || "").slice(0, 10) === day,
    );
    return h(
      "div",
      { className: "rt-pane", style: { flex: 1, minHeight: 0 } },
      h(
        "div",
        { className: "rt-card" },
        h("h4", null, "자산 발견 타임라인"),
        h(
          "div",
          {
            style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" },
          },
          "총 " +
            ((data.span && data.span.total) || 0) +
            "대 · 가장 이른 " +
            (data.span && data.span.first ? fmt(data.span.first) : "—") +
            " · 최근 " +
            (data.span && data.span.last ? fmt(data.span.last) : "—") +
            '(발견 시각 = 자산 목록에 처음 들어온 시각; 중복 수집은 "최근 수집"만 갱신합니다)',
        ),
      ),
      (data.days || []).length === 0
        ? h("div", { className: "rt-empty" }, "아직 자산이 없습니다.")
        : null,
      h(
        "div",
        { className: "rt-card" },
        h(
          "h4",
          null,
          "일자별 통계",
          day
            ? h(
                "span",
                Object.assign(
                  {
                    className: "rt-tag",
                    style: { marginLeft: 6, cursor: "pointer" },
                  },
                  clickable(() => setDay(""), {
                    label: "일자 필터 해제: " + day,
                  }),
                ),
                "필터 해제: " + day,
              )
            : null,
        ),
        h(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
          (data.days || []).map((d) =>
            h(
              "div",
              Object.assign(
                {
                  key: d.day,
                  className: "rt-seg" + (day === d.day ? " on" : ""),
                  style: { marginBottom: 0, cursor: "pointer" },
                  title:
                    d.day +
                    ": 신규 " +
                    d.assets +
                    "대(내부 " +
                    d.internal +
                    " / 외부 " +
                    d.external +
                    ")",
                },
                clickable(() => setDay(day === d.day ? "" : d.day), {
                  label: "발견일 필터 " + d.day + " 자산",
                  expanded: day === d.day,
                }),
              ),
              h("div", { className: "rt-seg-cidr" }, d.day),
              h(
                "div",
                { className: "rt-seg-meta" },
                d.assets + "대 · 내 " + d.internal + " / 외 " + d.external,
              ),
            ),
          ),
        ),
      ),
      h(
        "div",
        { className: "rt-card" },
        h(
          "h4",
          null,
          day
            ? day + " 발견 자산(" + recent.length + ")"
            : "최근 발견 자산(" + recent.length + ")",
        ),
        recent.length === 0
          ? h("div", { className: "rt-empty" }, "이 날은 신규 자산이 없습니다.")
          : null,
        recent.map((a) =>
          h(
            "div",
            { key: a.id, className: "rt-kv" },
            h(
              "b",
              { className: "rt-mono", style: { minWidth: 110 } },
              h(
                "span",
                {
                  className:
                    "rt-scope rt-scope-" +
                    (a.scope === "internal" ? "internal" : "external"),
                  style: { marginRight: 4 },
                },
                a.scope === "internal" ? "내" : "외",
              ),
              a.ip,
            ),
            h(
              "span",
              {
                style: {
                  minWidth: 132,
                  fontSize: 11.5,
                  color: "var(--dsw-alias-label-secondary)",
                },
              },
              a.discovered_at ? fmt(a.discovered_at) : "시각 미상",
            ),
            h(
              "span",
              { style: { flex: 1 } },
              (a.primary_name || "—") +
                (a.open_ports ? " · " + a.open_ports + "개 포트" : ""),
            ),
            h(PriTag, { p: a.priority }),
          ),
        ),
      ),
    );
  }

  /* ---------------------------------------------------------- 에이전트 프롬프트 */
  function PromptsTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [roles, setRoles] = React.useState([]);
    const [active, setActive] = React.useState(null);
    const [draft, setDraft] = React.useState("");
    const [msg, setMsg] = React.useState(null);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
      /* 타깃이 없어도 허용한다: 서버가 내장 기본값을 돌려주며 engagement required 를 더 이상 내지 않는다 */
      api(eng ? { op: "prompts", engagement: eng } : { op: "prompts" }).then(
        (r) => {
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "읽기 실패" });
            return;
          }
          setRoles(r.roles || []);
          if (r.roles && r.roles.length)
            setActive((cur) => cur || r.roles[0].role);
          if (r.builtin)
            setMsg({
              ok: "현재 내장 기본 프롬프트입니다(타깃을 만들면 타깃별로 수정해 저장할 수 있습니다)",
            });
        },
        (e) => setMsg({ err: String((e && e.message) || e) }),
      );
    }, [eng, refreshKey]);

    React.useEffect(() => {
      const r = roles.find((x) => x.role === active);
      if (r) setDraft(r.content || "");
    }, [active, roles]);

    const save = () => {
      if (!eng) {
        setMsg({ err: "먼저 타깃을 만든 뒤 프롬프트를 저장하세요" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({
        op: "savePrompt",
        engagement: eng,
        role: active,
        content: draft,
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "저장 실패" });
            return;
          }
          setRoles((list) =>
            list.map((x) =>
              x.role === active
                ? Object.assign({}, x, {
                    content: draft,
                    updated_at: new Date().toISOString(),
                  })
                : x,
            ),
          );
          setMsg({ ok: "저장됨" });
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    /* 옛 타깃의 프롬프트는 구버전 템플릿이다; 여기서 현재 역할(또는 전체)을 내장 최신판으로 복원할 수 있다 */
    const reset = (all) => {
      if (!eng) {
        setMsg({ err: "먼저 타깃을 만든 뒤 기본 프롬프트를 복원하세요" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({
        op: "resetPrompts",
        engagement: eng,
        role: all ? undefined : active,
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "복원 실패" });
            return;
          }
          setMsg({
            ok: "내장 기본값으로 복원됨: " + (r.reset || []).join(", "),
          });
          api({ op: "prompts", engagement: eng }).then(
            (rr) => {
              if (rr && rr.ok) {
                setRoles(rr.roles || []);
                const cur2 = (rr.roles || []).find((x) => x.role === active);
                if (cur2) setDraft(cur2.content || "");
              }
            },
            () => {},
          );
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    const cur = roles.find((x) => x.role === active);
    const items = roles.map((r) =>
      h(
        "div",
        Object.assign(
          {
            key: r.role,
            className: "rt-item" + (active === r.role ? " on" : ""),
          },
          clickable(
            () => {
              setActive(r.role);
              setMsg(null);
            },
            {
              label: "“" + r.title + "” 프롬프트 보기",
              expanded: active === r.role,
            },
          ),
        ),
        h("div", { className: "rt-item-name" }, r.title),
        h(
          "div",
          { className: "rt-item-desc" },
          (r.content || "").replace(/[#*`]/g, "").slice(0, 60) || "(비어 있음)",
        ),
      ),
    );

    return h(
      "div",
      { className: "rt-split" },
      h("div", { className: "rt-list" }, items),
      h(
        "div",
        { className: "rt-main" },
        h(
          "div",
          { className: "rt-toolbar" },
          h(
            "span",
            { style: { fontWeight: 600 } },
            cur ? cur.title : "프롬프트",
          ),
          h(
            "span",
            { className: "rt-tag" },
            "갱신 " + fmt(cur && cur.updated_at),
          ),
          h("div", { className: "rt-spacer" }),
          h(
            "button",
            {
              className: "rt-btn",
              disabled: busy || !active,
              title: "현재 역할을 내장 최신판 프롬프트로 되돌립니다",
              onClick: () => reset(false),
            },
            "현재 역할 기본값 복원",
          ),
          h(
            "button",
            {
              className: "rt-btn",
              disabled: busy,
              title: "네 역할 전부를 내장 최신판 프롬프트로 되돌립니다",
              onClick: () => reset(true),
            },
            "전체 기본값 복원",
          ),
          h(
            "button",
            {
              className: "rt-btn rt-btn-primary",
              disabled: busy || !active,
              onClick: save,
            },
            busy ? "저장 중…" : "저장",
          ),
        ),
        msg
          ? h(
              "div",
              { className: msg.err ? "rt-err" : "rt-foot" },
              msg.err || msg.ok,
            )
          : null,
        h(
          "div",
          { className: "rt-pane" },
          h("textarea", {
            className: "rt-textarea",
            value: draft,
            spellCheck: false,
            onChange: (e) => setDraft(e.target.value),
            placeholder: "이 역할의 시스템 프롬프트(Markdown)",
          }),
          h(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--dsw-alias-label-secondary)",
                marginTop: 6,
              },
            },
            "저장하면 agents/" +
              (active || "role") +
              ".md 에 기록됩니다. 서브 세션 작업 첫 줄에 redteamRole: recon, assess, vuln-scan, exploit 또는 internal 을 쓰면 해당 파일이 시스템 프롬프트로 들어갑니다.",
          ),
        ),
      ),
    );
  }

  /* ---------------------------------------------------------- 스킬 라이브러리(DSH 네이티브) */
  function SkillsTab(props) {
    const refreshKey = props.refreshKey || 0;
    const [items, setItems] = React.useState([]);
    const [meta, setMeta] = React.useState({});
    const [err, setErr] = React.useState(null);
    const [q, setQ] = React.useState("");
    const [srcOnly, setSrcOnly] = React.useState(false);
    const [active, setActive] = React.useState(null);
    const [detail, setDetail] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [brokenOnly, setBrokenOnly] = React.useState(false);

    /* refresh=true 는 백엔드의 30초 사용 가능성 캐시를 건너뛴다(스킬 본문/환경 변수를 방금 바꿨을 수 있다) */
    const load = (force) => {
      setBusy(true);
      api({ op: "skillCatalog", refresh: force === true }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          setMeta(r || {});
          setItems(r.items || []);
        },
        (e) => {
          setBusy(false);
          setErr(String((e && e.message) || e));
        },
      );
    };
    React.useEffect(load, [refreshKey]);

    const open = (skill) => {
      const name = skill && skill.name;
      const key =
        (skill && skill.library ? skill.library : "redteam") + ":" + name;
      if (active === key) {
        setActive(null);
        setDetail(null);
        return;
      }
      setActive(key);
      setDetail(null);
      api({
        op: "skillRead",
        name: name,
        library: skill.library || "redteam",
      }).then(
        (r) => {
          if (r && r.ok) setDetail(r);
          else setErr((r && r.error) || "읽기 실패");
        },
        (e) => setErr(String((e && e.message) || e)),
      );
    };

    const needle = q.trim().toLowerCase();
    let filtered = needle
      ? items.filter(
          (s) =>
            (s.name + " " + s.description + " " + s.whenToUse)
              .toLowerCase()
              .indexOf(needle) >= 0,
        )
      : items;
    if (srcOnly)
      filtered = filtered.filter(
        (s) => s.library !== "official" && s.fromPlugin === true,
      );
    if (brokenOnly)
      filtered = filtered.filter(
        (s) =>
          s.library !== "official" &&
          (s.availability === "broken" || s.availability === "unknown"),
      );
    /* 디렉터리 집계: "이 많은 스킬이 어디서 왔는지" 한눈에 본다(이 프로젝트/다른 플러그인/기본 루트…) */
    const dirs = (meta.byDir || []).filter((d) => d.n > 0).slice(0, 6);
    const availSummary = meta.availability ? meta.availability.summary : null;
    const needRestart = err !== null && String(err).indexOf("unknown op") >= 0;

    const renderSkill = (s) =>
      h(
        "div",
        Object.assign(
          {
            key: (s.library || "redteam") + ":" + s.name,
            className:
              "rt-item" +
              (active === (s.library || "redteam") + ":" + s.name ? " on" : ""),
          },
          clickable(() => open(s), {
            label: "스킬 보기 " + s.name,
            expanded: active === (s.library || "redteam") + ":" + s.name,
          }),
        ),
        h(
          "div",
          { className: "rt-item-name" },
          s.name,
          s.modelInvocable === false
            ? h(
                "span",
                { className: "rt-tag", style: { marginLeft: 6 } },
                "수동 전용",
              )
            : null,
          s.library === "official"
            ? h(
                "span",
                {
                  className: "rt-tag",
                  style: { marginLeft: 6 },
                  title:
                    "공식 스킬 디렉터리이며 레드팀 도구 경로로 검사하지 않습니다",
                },
                "공식",
              )
            : h(
                "span",
                {
                  className:
                    "rt-avail rt-avail-" + (s.availability || "unknown"),
                  style: { marginLeft: 6 },
                  title:
                    s.availability === "available"
                      ? "사용 가능: 스킬 본문을 로드할 수 있습니다. 빠진 외부 도구나 키는 상세에 기록되며 호출을 막지 않습니다."
                      : (s.problems || []).join("\n") || "알 수 없음",
                },
                s.availability === "available"
                  ? "사용 가능"
                  : s.availability === "broken"
                    ? "사용 불가"
                    : "알 수 없음",
              ),
          h(
            "div",
            { className: "rt-item-desc" },
            s.description || "(설명 없음)",
          ),
          h(
            "div",
            { className: "rt-kb-sub" },
            [
              s.source ? "출처 " + s.source : null,
              s.fromPlugin ? "이 플러그인 내장" : null,
              s.provider ? s.provider : null,
              s.dir ? s.dir : null,
            ]
              .filter(Boolean)
              .join(" · "),
          ),
          (s.problems || []).length > 0 &&
            s.availability !== "available" &&
            s.library !== "official"
            ? h(
                "div",
                {
                  className: "rt-kb-sub",
                  style: {
                    color: "var(--dsw-alias-state-warn-primary, #f59e0b)",
                  },
                },
                "⚠ " + String(s.problems[0]).slice(0, 60),
              )
            : null,
        ),
      );
    const redteamRows = filtered
      .filter((s) => s.library !== "official")
      .map(renderSkill);
    const officialRows = filtered
      .filter((s) => s.library === "official")
      .map(renderSkill);
    const listItems = [];
    if (redteamRows.length > 0) {
      listItems.push(
        h(
          "div",
          {
            key: "head-redteam",
            className: "rt-kb-sub",
            style: { margin: "8px 0 4px", fontWeight: 600 },
          },
          "레드팀 스킬",
        ),
      );
      listItems.push.apply(listItems, redteamRows);
    }
    if (officialRows.length > 0) {
      listItems.push(
        h(
          "div",
          {
            key: "head-official",
            className: "rt-kb-sub",
            style: { margin: "8px 0 4px", fontWeight: 600 },
          },
          "공식 스킬",
        ),
      );
      listItems.push.apply(listItems, officialRows);
    }

    return h(
      "div",
      { className: "rt-split" },
      h(
        "div",
        { className: "rt-list" },
        h("input", {
          className: "rt-input",
          style: { width: "100%", marginBottom: 8, boxSizing: "border-box" },
          placeholder: "스킬 필터",
          value: q,
          onChange: (e) => setQ(e.target.value),
        }),
        h(
          "label",
          {
            className: "rt-kb-check",
            style: { display: "flex", margin: "0 0 6px" },
          },
          h("input", {
            type: "checkbox",
            checked: srcOnly,
            onChange: (e) => setSrcOnly(e.target.checked),
          }),
          "이 플러그인 내장만(" + (meta.fromPlugin || 0) + "개)",
        ),
        availSummary && (availSummary.broken > 0 || availSummary.unknown > 0)
          ? h(
              "label",
              {
                className: "rt-kb-check",
                style: { display: "flex", margin: "0 0 8px" },
                title:
                  "명확한 결손(키 없음 / 로컬 경로 없음 / 인프라가 아직 자리표시자)이 있거나 사용 가능성을 판정할 수 없는 스킬만 봅니다",
              },
              h("input", {
                type: "checkbox",
                checked: brokenOnly,
                onChange: (e) => setBrokenOnly(e.target.checked),
              }),
              "사용 불가/알 수 없음만(" +
                ((availSummary.broken || 0) + (availSummary.unknown || 0)) +
                "개)",
            )
          : null,
        availSummary
          ? h(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  marginBottom: 6,
                },
              },
              h(
                "span",
                { className: "rt-avail rt-avail-available" },
                "사용 가능 " + (availSummary.available || 0),
              ),
              availSummary.broken > 0
                ? h(
                    "span",
                    { className: "rt-avail rt-avail-broken" },
                    "사용 불가 " + availSummary.broken,
                  )
                : null,
              availSummary.unknown > 0
                ? h(
                    "span",
                    { className: "rt-avail rt-avail-unknown" },
                    "알 수 없음 " + availSummary.unknown,
                  )
                : null,
              h(
                "span",
                Object.assign(
                  {
                    className: "rt-tag",
                    style: { cursor: "pointer" },
                    title:
                      "스킬 본문이나 환경 변수를 방금 바꾸셨나요? 여기를 누르면 30초 캐시를 건너뛰고 다시 검사합니다",
                  },
                  clickable(() => load(true), {
                    label: "스킬 사용 가능성 재검사",
                  }),
                ),
                "사용 가능성 재검사",
              ),
            )
          : null,
        h(
          "div",
          {
            style: {
              fontSize: 11,
              color: "var(--dsw-alias-label-secondary)",
              marginBottom: 6,
            },
          },
          "레드팀 " +
            ((meta.libraries && meta.libraries.redteam) || 0) +
            " · 공식 " +
            ((meta.libraries && meta.libraries.official) || 0),
          items.length > 100
            ? h(
                "div",
                { style: { marginTop: 3 } },
                "(스킬은 대개 다른 플러그인이 등록한 루트나 직접 만든 스킬 디렉터리에서 옵니다; 이 플러그인 내장은 " +
                  (meta.fromPlugin || 0) +
                  "개뿐입니다)",
              )
            : null,
        ),
        listItems,
      ),
      h(
        "div",
        { className: "rt-main" },
        h(
          "div",
          { className: "rt-toolbar" },
          h(
            "span",
            { style: { fontWeight: 600 } },
            detail ? detail.name : "스킬 디렉터리(DSH 네이티브)",
          ),
          h("div", { className: "rt-spacer" }),
          h(
            "button",
            { className: "rt-btn", disabled: busy, onClick: () => load(true) },
            busy ? "새로고침 중…" : "새로고침",
          ),
        ),
        err
          ? needRestart
            ? h(
                "div",
                { className: "rt-empty" },
                "이 모듈의 호스트 코드가 갱신되었습니다. 현재 호스트(공식 exe / 커뮤니티판 / dsh web)를 한 번 재시작해야 적용됩니다",
              )
            : h("div", { className: "rt-err" }, err)
          : null,
        detail
          ? h(
              "div",
              { className: "rt-pane" },
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "설명"),
                h("span", null, detail.description || "—"),
              ),
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "사용 시점"),
                h("span", null, detail.whenToUse || "—"),
              ),
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "출처"),
                h(
                  "span",
                  null,
                  (detail.provider || "—") + " / " + (detail.source || "—"),
                ),
              ),
              (() => {
                const s2 = items.find(
                  (x) => (x.library || "redteam") + ":" + x.name === active,
                );
                if (!s2) return null;
                if (s2.library === "official") {
                  return h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "유형"),
                    h(
                      "span",
                      null,
                      "공식 스킬. 호스트가 작업에 따라 호출하며 레드팀 도구 경로로 검사하지 않습니다.",
                    ),
                  );
                }
                const avail = s2.availability || "unknown";
                return h(
                  "div",
                  null,
                  h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "사용 가능성"),
                    h(
                      "span",
                      { className: "rt-avail rt-avail-" + avail },
                      avail === "available"
                        ? "사용 가능"
                        : avail === "broken"
                          ? "사용 불가(명확한 결손 있음)"
                          : "알 수 없음(본문을 읽을 수 없음)",
                    ),
                  ),
                  (s2.problems || []).length > 0
                    ? h(
                        "div",
                        { className: "rt-kv" },
                        h(
                          "b",
                          null,
                          avail === "available"
                            ? "설치되지 않은 외부 도구"
                            : "결손",
                        ),
                        h(
                          "span",
                          null,
                          s2.problems.map((x, i) =>
                            h("div", { key: "p" + i }, "· " + x),
                          ),
                        ),
                      )
                    : null,
                  (s2.needs_user || []).length > 0
                    ? h(
                        "div",
                        { className: "rt-kv" },
                        h("b", null, "직접 제공해야 하는 것"),
                        h(
                          "span",
                          {
                            style: {
                              color:
                                "var(--dsw-alias-state-warn-primary, #f59e0b)",
                            },
                          },
                          s2.needs_user.map((x, i) =>
                            h("div", { key: "n" + i }, "· " + x),
                          ),
                        ),
                      )
                    : null,
                );
              })(),
              detail.path
                ? h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "파일"),
                    h(
                      "span",
                      {
                        className: "rt-mono",
                        style: { wordBreak: "break-all" },
                      },
                      detail.path,
                    ),
                  )
                : null,
              h(
                "pre",
                {
                  className: "rt-md",
                  style: {
                    border: "1px solid var(--dsw-alias-border-l1)",
                    borderRadius: 6,
                    maxHeight: "52vh",
                  },
                },
                detail.content || "(비어 있음)",
              ),
            )
          : h(
              "div",
              { className: "rt-pane" },
              h(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "var(--dsw-alias-label-secondary)",
                    marginBottom: 8,
                  },
                },
                meta.note ||
                  "스킬은 DSH 네이티브 skill 체계가 관리하며, 레드팀 에이전트는 skill 도구로 호출합니다.",
              ),
              availSummary
                ? h(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        marginBottom: 8,
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        alignItems: "center",
                      },
                    },
                    h(
                      "span",
                      { className: "rt-avail rt-avail-available" },
                      "사용 가능 " + (availSummary.available || 0),
                    ),
                    availSummary.broken > 0
                      ? h(
                          "span",
                          { className: "rt-avail rt-avail-broken" },
                          "사용 불가 " + availSummary.broken,
                        )
                      : null,
                    availSummary.unknown > 0
                      ? h(
                          "span",
                          { className: "rt-avail rt-avail-unknown" },
                          "알 수 없음 " + availSummary.unknown,
                        )
                      : null,
                    h(
                      "span",
                      { style: { color: "var(--dsw-alias-label-secondary)" } },
                      "(" +
                        (meta.availability && meta.availability.cached
                          ? "캐시 시각 "
                          : "검사 시각 ") +
                        (meta.availability && meta.availability.checked_at
                          ? fmt(meta.availability.checked_at)
                          : "—") +
                        ")",
                    ),
                  )
                : null,
              meta.availability && (meta.availability.broken || []).length > 0
                ? h(
                    "div",
                    { className: "rt-hint" },
                    h(
                      "div",
                      { style: { fontWeight: 600, marginBottom: 4 } },
                      "지금 실행할 수 없는 스킬:",
                    ),
                    meta.availability.broken
                      .slice(0, 12)
                      .map((b) =>
                        h(
                          "div",
                          { key: b.name },
                          "· " +
                            b.name +
                            (b.problems && b.problems.length
                              ? " — " + b.problems[0]
                              : ""),
                        ),
                      ),
                  )
                : null,
              (meta.byDir || []).slice(0, 6).map((d) =>
                h(
                  "div",
                  {
                    key: d.key,
                    className: "rt-mono",
                    style: {
                      fontSize: 11,
                      marginBottom: 2,
                      overflowWrap: "anywhere",
                    },
                  },
                  d.n + "개 · " + d.key,
                ),
              ),
              (meta.byDir || []).length > 6
                ? h(
                    "div",
                    {
                      style: {
                        fontSize: 11,
                        color: "var(--dsw-alias-label-secondary)",
                      },
                    },
                    "…그 밖에 " +
                      ((meta.byDir || []).length - 6) +
                      "개 디렉터리(총 " +
                      items.length +
                      "개 스킬)",
                  )
                : null,
              h(
                "div",
                { className: "rt-empty" },
                "왼쪽에서 스킬을 선택하면 내용이 보입니다",
              ),
            ),
      ),
    );
  }

  /* ---------------------------------------------------------- 취약점 성과 */
  const SEV_LABEL = {
    critical: "치명",
    high: "높음",
    medium: "보통",
    low: "낮음",
    info: "정보",
  };
  const STATUS_LABEL = {
    candidate: "검증 대기",
    confirmed: "확인됨",
    "false-positive": "오탐",
    exploited: "익스플로잇 완료",
    fixed: "수정됨",
  };
  const sevClass = (s) => "rt-sev rt-sev-" + (SEV_LABEL[s] ? s : "info");

  /** 대상 병합: “scheme://host:port” 기준으로 집계해, 경로가 붙은 URL 이 그룹을 흩뜨리지 않게 한다. */
  function targetKeyOf(v) {
    const t = String(v.target || "").trim();
    if (t !== "") {
      const url = /^([a-z][a-z0-9+.-]*:\/\/[^/?#\s]+)/i.exec(t);
      if (url) return url[1];
      const head = /^([^\s/?#]+)/.exec(t);
      if (head) return head[1];
      return t;
    }
    return v.asset_ip || "(대상 미지정)";
  }

  /* ---------------------------------------------------------- 증거 렌더링 */
  /** 원본 HTTP 메시지를 “요청행/상태행 + 헤더 + 본문” 순으로 색칠해 눈으로 훑기 쉽게 한다. */
  function HttpBlock(props) {
    const text = String(props.text || "");
    if (!text) return null;
    const lines = text.split(/\r?\n/);
    const nodes = lines.map((ln, i) => {
      let cls = null;
      if (
        i === 0 &&
        /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|TRACE)\s/.test(ln)
      )
        cls = "rt-hl-req";
      else if (i === 0 && /^HTTP\//.test(ln)) cls = "rt-hl-res";
      else if (/^[A-Za-z0-9-]+:/.test(ln)) {
        const name = ln.split(":")[0].toLowerCase();
        if (
          name === "host" ||
          name === "cookie" ||
          name === "authorization" ||
          name === "content-type"
        )
          cls = "rt-hl-req";
      }
      return h(
        "div",
        { key: "l" + i, className: cls || undefined },
        ln === "" ? "\u00a0" : ln,
      );
    });
    return h(
      "pre",
      { className: "rt-evi-body" + (props.compact ? " req" : "") },
      nodes,
    );
  }

  /** 취약점 상세의 증거 영역: 구조화된 증거 텍스트 + 해당 취약점의 원본 HTTP 요청/응답 기록. */
  function detailEvidence(v) {
    const evi = String(v.evidence || "").trim();
    const looksHttp =
      /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|HTTP\/)/m.test(evi) ||
      /\n[A-Za-z-]+: /.test(evi);
    const blocks = [];
    if (evi) {
      blocks.push(
        h(
          "div",
          { key: "ev", className: "rt-evi" },
          h(
            "div",
            { className: "rt-evi-head" },
            "증거 요약",
            h(
              "span",
              { className: "rt-tag" },
              looksHttp ? "원본 메시지" : "텍스트",
            ),
            h("div", { className: "rt-spacer" }),
            h(
              "button",
              {
                className: "rt-btn",
                style: { padding: "0 6px", fontSize: 11 },
                onClick: (e) => {
                  e.stopPropagation();
                  copyText(evi);
                },
              },
              "복사",
            ),
          ),
          looksHttp
            ? h(HttpBlock, { text: evi })
            : h("pre", { className: "rt-evi-body" }, evi),
        ),
      );
    }
    const http = v.http_evidence || [];
    for (const e of http) {
      blocks.push(
        h(
          "div",
          { key: "h" + e.id, className: "rt-evi" },
          h(
            "div",
            { className: "rt-evi-head" },
            e.label || "HTTP 증거",
            h(
              "span",
              { className: "rt-tag" },
              (e.method || "") +
                " " +
                (e.status === null || e.status === undefined ? "" : e.status),
            ),
            h("div", { className: "rt-spacer" }),
            h(
              "span",
              {
                style: {
                  fontWeight: 400,
                  color: "var(--dsw-alias-label-secondary)",
                },
              },
              fmt(e.captured_at || e.created_at),
            ),
          ),
          e.request
            ? h(
                "div",
                null,
                h(
                  "div",
                  { className: "rt-evi-head", style: { borderTop: "none" } },
                  "▸ 요청(Burp Repeater 에 그대로 붙여넣을 수 있습니다)",
                ),
                h(HttpBlock, { text: e.request, compact: true }),
              )
            : null,
          e.response
            ? h(
                "div",
                null,
                h("div", { className: "rt-evi-head" }, "▸ 응답"),
                h(HttpBlock, { text: e.response }),
              )
            : null,
          e.note
            ? h(
                "pre",
                { className: "rt-evi-body", style: { maxHeight: 80 } },
                e.note,
              )
            : null,
        ),
      );
    }
    if (blocks.length === 0) {
      blocks.push(
        h(
          "div",
          { key: "none", className: "rt-kv" },
          h("b", null, "증거"),
          h(
            "span",
            { style: { color: "var(--dsw-alias-state-error-primary)" } },
            "누락 — 검증되지 않았거나 증거가 없는 취약점은 보고서에 반영되지 않습니다. redteam_http_evidence_add 로 보강하세요",
          ),
        ),
      );
    }
    return h("div", { key: "eviwrap" }, blocks);
  }

  function FindingsTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [sev, setSev] = React.useState("");
    const [status, setStatus] = React.useState("");
    const [q, setQ] = React.useState("");
    const [qApplied, setQApplied] = React.useState("");
    const [state, setState] = React.useState({
      loading: false,
      error: null,
      total: 0,
      items: [],
      stats: null,
    });
    const [creds, setCreds] = React.useState([]);
    const [accesses, setAccesses] = React.useState([]);
    const [files, setFiles] = React.useState([]);
    const [openId, setOpenId] = React.useState(null);
    const [msg, setMsg] = React.useState(null);
    /* 하위 탭: 취약점 / 자격 증명 / 접근 세션(자격 증명을 더 이상 취약점 페이지 하단에 깔지 않는다) */
    const [subTab, setSubTab] = React.useState("vulns");
    /* 기본은 대상별 집계다: 322건을 그대로 나열하면 읽을 수 없으니 "어느 자산이 어떻게 뚫렸는지" 먼저 본다 */
    const [grouped, setGrouped] = React.useState(true);
    const collapse = useCollapse("findings:" + eng);

    const load = () => {
      if (!eng) return;
      api({
        op: "vulns",
        engagement: eng,
        severity: sev || undefined,
        status: status || undefined,
        q: qApplied || undefined,
        limit: 200,
      }).then(
        (r) => {
          if (!r || r.ok === false) {
            setState({
              loading: false,
              error: (r && r.error) || "조회 실패",
              total: 0,
              items: [],
              stats: null,
            });
            return;
          }
          setState({
            loading: false,
            error: null,
            total: r.total,
            items: r.items || [],
            stats: r.stats || null,
          });
        },
        (e) =>
          setState({
            loading: false,
            error: String((e && e.message) || e),
            total: 0,
            items: [],
            stats: null,
          }),
      );
      api({ op: "credentials", engagement: eng }).then(
        (r) => setCreds((r && r.items) || []),
        () => {},
      );
      api({ op: "access", engagement: eng }).then(
        (r) => setAccesses((r && r.items) || []),
        () => {},
      );
      api({ op: "attackFiles", engagement: eng }).then(
        (r) => setFiles((r && r.items) || []),
        () => {},
      );
    };
    React.useEffect(load, [eng, sev, status, qApplied, refreshKey]);

    const setVulnStatus = (id, next) => {
      setMsg(null);
      api({
        op: "updateVuln",
        engagement: eng,
        id: id,
        patch: { status: next },
      }).then(
        (r) => {
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "갱신 실패" });
            return;
          }
          setMsg({
            ok: "“" + (STATUS_LABEL[next] || next) + "”(으)로 갱신했습니다",
          });
          load();
        },
        (e) => setMsg({ err: String((e && e.message) || e) }),
      );
    };

    const stats =
      state.stats && state.stats.bySeverity
        ? state.stats
        : { bySeverity: {}, byStatus: {} };
    const needRestart =
      state.error !== null && String(state.error).indexOf("unknown op") >= 0;

    const allFiles = (files || []).flatMap((g) =>
      (g.files || []).map((f) => Object.assign({ target: g.target }, f)),
    );
    const filesByVuln = new Map();
    const orphanFiles = [];
    for (const f of allFiles) {
      const vid =
        f.vuln_id === null || f.vuln_id === undefined
          ? null
          : Number(f.vuln_id);
      if (vid === null) {
        orphanFiles.push(f);
        continue;
      }
      if (!filesByVuln.has(vid)) filesByVuln.set(vid, []);
      filesByVuln.get(vid).push(f);
    }

    /* ── 결론줄: 결론만 보여주고 숫자를 누르면 그것이 필터가 된다 ─────────────────────── */
    const concl = (key, label, value, active, onClick) =>
      h(
        "span",
        Object.assign(
          {
            key: key,
            className: "rt-concl-i" + (active ? " on" : ""),
            title: "클릭하면 필터 / 다시 클릭하면 해제",
          },
          clickable(onClick, {
            label: "“" + label + "”로 필터(" + (value || 0) + ")",
            expanded: active,
          }),
        ),
        h("b", null, String(value || 0)),
        h("span", null, label),
      );
    const conclusion = h(
      "div",
      { className: "rt-concl" },
      concl(
        "conf",
        "확인됨",
        stats.byStatus.confirmed || 0,
        status === "confirmed",
        () => setStatus((v) => (v === "confirmed" ? "" : "confirmed")),
      ),
      concl(
        "exp",
        "익스플로잇 완료",
        stats.byStatus.exploited || 0,
        status === "exploited",
        () => setStatus((v) => (v === "exploited" ? "" : "exploited")),
      ),
      concl(
        "crit",
        "치명",
        stats.bySeverity.critical || 0,
        sev === "critical",
        () => setSev((v) => (v === "critical" ? "" : "critical")),
      ),
      concl("high", "높음", stats.bySeverity.high || 0, sev === "high", () =>
        setSev((v) => (v === "high" ? "" : "high")),
      ),
      concl("med", "보통", stats.bySeverity.medium || 0, sev === "medium", () =>
        setSev((v) => (v === "medium" ? "" : "medium")),
      ),
      concl("gain", "권한 획득", stats.withGained || 0, false, () => {}),
      h("div", { className: "rt-spacer" }),
      h(
        "span",
        { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)" } },
        "기본은 대상별 집계 · 총 " + (stats.targetGroups || 0) + "개 대상",
      ),
    );

    const head = h(
      "div",
      { className: "rt-vrow head" },
      h("span", null, "등급"),
      h("span", null, "취약점 / 번호"),
      h("span", null, "대상"),
      h("span", null, "획득한 것"),
      h("span", null, "상태"),
      h("span", null, "신뢰도"),
    );

    /* 단일 취약점(행 + 펼친 상세). 집계 뷰와 개별 나열 뷰가 함께 쓴다 */
    const vulnRows = (v, compact) => {
      const out = [];
      const gainedList = String(v.gained || "")
        .split(/[,\u3001;\uFF0C\uFF1B]/)
        .map((x) => x.trim())
        .filter(Boolean);
      const open = openId === v.id;
      out.push(
        h(
          "div",
          {
            key: "v" + v.id,
            className: "rt-vrow",
            role: "button",
            tabIndex: 0,
            style: compact
              ? {
                  cursor: "pointer",
                  gridTemplateColumns: "58px minmax(0,1fr) 104px 68px",
                }
              : { cursor: "pointer" },
            onClick: () => setOpenId(open ? null : v.id),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenId(open ? null : v.id);
              }
            },
          },
          h(
            "span",
            null,
            h(
              "span",
              { className: sevClass(v.severity) },
              SEV_LABEL[v.severity] || v.severity,
            ),
          ),
          h(
            "span",
            { title: v.title || "" },
            h("span", { className: "rt-sec-caret" }, open ? "▾" : "▸"),
            (v.cve ? v.cve + " " : "") + (v.title || ""),
          ),
          compact
            ? null
            : h(
                "span",
                { className: "rt-mono", title: v.target || "" },
                v.target || v.asset_ip || "—",
              ),
          h(
            "span",
            { title: v.gained || "" },
            gainedList.length
              ? h(
                  "span",
                  {
                    className: "rt-gain",
                    style: {
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                    },
                  },
                  gainedList[0] +
                    (gainedList.length > 1
                      ? " +" + (gainedList.length - 1)
                      : ""),
                )
              : h(
                  "span",
                  { style: { color: "var(--dsw-alias-label-secondary)" } },
                  "—",
                ),
          ),
          h(
            "span",
            null,
            h(
              "span",
              { className: "rt-tag" },
              STATUS_LABEL[v.status] || v.status,
            ),
          ),
          compact
            ? null
            : h(
                "span",
                null,
                v.confidence === null || v.confidence === undefined
                  ? "—"
                  : Math.round(v.confidence * 100) + "%",
              ),
        ),
      );
      if (openId !== v.id) return out;
      out.push(
        h(
          "div",
          {
            key: "vd" + v.id,
            className: "rt-vrow",
            style: { cursor: "default", gridTemplateColumns: "1fr" },
          },
          h(
            "div",
            { className: "rt-vdetail" },
            h(
              "div",
              { className: "rt-kv" },
              h("b", null, "획득한 것"),
              gainedList.length
                ? h(
                    "span",
                    null,
                    gainedList.map((g, gi) =>
                      h(
                        "span",
                        {
                          key: "g" + gi,
                          className: "rt-gain",
                          style: { marginRight: 6 },
                        },
                        g,
                      ),
                    ),
                  )
                : h(
                    "span",
                    { style: { color: "var(--dsw-alias-label-secondary)" } },
                    "미기록 — 권한/성과를 얻으면 redteam_vuln_update 로 gained 를 보강하세요(예: 서버 권한, 내부망 터널, 백엔드 관리자 계정)",
                  ),
            ),
            h(
              "div",
              { className: "rt-kv" },
              h("b", null, "대상"),
              h(
                "span",
                { className: "rt-mono", style: { wordBreak: "break-all" } },
                v.target || "—",
              ),
            ),
            h(
              "div",
              { className: "rt-kv" },
              h("b", null, "자산"),
              h(
                "span",
                null,
                (v.asset_ip || "—") + " · " + (v.segment_cidr || ""),
              ),
            ),
            h(
              "div",
              { className: "rt-kv" },
              h("b", null, "출처"),
              h(
                "span",
                null,
                (v.source || "—") +
                  " · " +
                  (v.found_by_agent || "—") +
                  " · " +
                  fmt(v.found_at),
              ),
            ),
            detailEvidence(v),
            (() => {
              const mine = filesByVuln.get(Number(v.id)) || [];
              return h(
                "div",
                { className: "rt-kv" },
                h("b", null, "공격 파일"),
                mine.length
                  ? h(
                      "span",
                      null,
                      mine.map((f, fi) =>
                        h(
                          "div",
                          { key: "af" + fi, style: { marginBottom: 3 } },
                          "· " +
                            (f.kind ? "[" + f.kind + "] " : "") +
                            (f.name || "(이름 없음)") +
                            (f.description ? " — " + f.description : ""),
                          h(
                            "div",
                            {
                              className: "rt-mono",
                              style: {
                                fontSize: 11,
                                marginLeft: 12,
                                color: "var(--dsw-alias-label-secondary)",
                                overflowWrap: "anywhere",
                              },
                            },
                            f.path || "",
                          ),
                        ),
                      ),
                    )
                  : h(
                      "span",
                      { style: { color: "var(--dsw-alias-label-secondary)" } },
                      "(없음) redteam_attack_file_add 로 이 취약점을 뚫은 스크립트/웹셸/EXP 를 vuln_id 와 함께 아카이브하세요",
                    ),
              );
            })(),
            h(
              "div",
              { className: "rt-actions" },
              h(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "confirmed");
                  },
                },
                "확인",
              ),
              h(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "exploited");
                  },
                },
                "익스플로잇 완료",
              ),
              h(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "false-positive");
                  },
                },
                "오탐",
              ),
              h(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "fixed");
                  },
                },
                "수정됨",
              ),
            ),
          ),
        ),
      );
      return out;
    };

    const rows = [];
    if (grouped) {
      /* 대상별로 묶는다: "어느 자산이 어떻게 뚫렸는지" 먼저 보고, 클릭해 구체 취약점을 본다 */
      const groups = new Map();
      for (const v of state.items) {
        const key = targetKeyOf(v);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(v);
      }
      const SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      const list = Array.from(groups.entries())
        .map(([key, vs]) => ({
          key,
          vulns: vs,
          top: vs
            .slice()
            .sort(
              (a, b) =>
                (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9),
            )[0],
          gained: Array.from(
            new Set(
              vs.flatMap((v) =>
                String(v.gained || "")
                  .split(/[,\u3001;\uFF0C\uFF1B]/)
                  .map((x) => x.trim())
                  .filter(Boolean),
              ),
            ),
          ),
          exploited: vs.filter((v) => v.status === "exploited").length,
        }))
        .sort(
          (a, b) =>
            (SEV_RANK[a.top.severity] ?? 9) - (SEV_RANK[b.top.severity] ?? 9) ||
            b.vulns.length - a.vulns.length,
        );
      for (const g of list) {
        const key = "target:" + g.key;
        const defOpen = false;
        rows.push(
          h(
            Section,
            {
              key: "sec:" + g.key,
              tone: "target",
              title: g.key,
              count: g.vulns.length + "개 취약점",
              sub: [
                SEV_LABEL[g.top.severity] || g.top.severity,
                g.exploited ? "익스플로잇 완료 " + g.exploited : null,
                g.top.asset_ip && g.top.asset_ip !== g.key
                  ? "자산 " + g.top.asset_ip
                  : null,
              ]
                .filter(Boolean)
                .join(" · "),
              right: g.gained.length
                ? g.gained.slice(0, 2).join(" / ") +
                  (g.gained.length > 2 ? " +" + (g.gained.length - 2) : "")
                : "권한 미기록",
              open: collapse.isOpen(key, defOpen),
              onToggle: collapse.toggle(key, defOpen),
            },
            g.vulns.map((v) => vulnRows(v, true)),
          ),
        );
      }
      if (!list.length && !state.loading && !state.error) {
        rows.push(
          h("div", { key: "none", className: "rt-empty" }, "취약점 기록 없음"),
        );
      }
    } else {
      for (const v of state.items) rows.push(...vulnRows(v));
    }

    const toolbar = h(
      "div",
      { className: "rt-toolbar" },
      h("input", {
        className: "rt-input",
        style: { flex: "1 1 140px" },
        placeholder: "제목 / CVE / 대상 검색(Enter)",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") setQApplied(q);
        },
      }),
      h(
        "button",
        { className: "rt-btn", onClick: () => setQApplied(q) },
        "검색",
      ),
      h(
        "select",
        {
          className: "rt-input",
          value: sev,
          onChange: (e) => setSev(e.target.value),
        },
        h("option", { value: "" }, "모든 등급"),
        h("option", { value: "critical" }, "치명"),
        h("option", { value: "high" }, "높음"),
        h("option", { value: "medium" }, "보통"),
        h("option", { value: "low" }, "낮음"),
        h("option", { value: "info" }, "정보"),
      ),
      h(
        "select",
        {
          className: "rt-input",
          value: status,
          onChange: (e) => setStatus(e.target.value),
        },
        h("option", { value: "" }, "모든 상태"),
        h("option", { value: "candidate" }, "검증 대기"),
        h("option", { value: "confirmed" }, "확인됨"),
        h("option", { value: "exploited" }, "익스플로잇 완료"),
        h("option", { value: "false-positive" }, "오탐"),
        h("option", { value: "fixed" }, "수정됨"),
      ),
    );

    const credSection = h(
      "div",
      null,
      h(
        "div",
        { className: "rt-section" },
        "자격 증명 · " +
          creds.length +
          (creds.length ? "(평문 그대로 표시 — 화면 공유·녹화에 주의)" : ""),
      ),
      creds.length
        ? h(
            "div",
            { style: { padding: "4px 10px 0" } },
            creds.map((c) =>
              h(
                "div",
                { key: "c" + c.id, className: "rt-cred" },
                h(
                  "div",
                  { className: "rt-cred-head" },
                  h("span", { className: "rt-cred-host" }, c.host),
                  c.username
                    ? h("span", { className: "rt-tag" }, c.username)
                    : null,
                  h(
                    "span",
                    { className: "rt-tag rt-tag-passive" },
                    c.secret_type || "password",
                  ),
                  c.privilege
                    ? h(
                        "span",
                        { className: "rt-tag rt-tag-active" },
                        c.privilege,
                      )
                    : null,
                  h("div", { className: "rt-spacer" }),
                  h(
                    "button",
                    {
                      className: "rt-btn",
                      style: { padding: "0 6px", fontSize: 11 },
                      onClick: (e) => {
                        e.stopPropagation();
                        copyText(String(c.secret_value || ""));
                      },
                    },
                    "복사",
                  ),
                ),
                c.secret_value
                  ? h(
                      "div",
                      { className: "rt-secret", title: "클릭하면 전체 선택" },
                      c.secret_value,
                    )
                  : h(
                      "div",
                      { className: "rt-secret-none" },
                      "평문 미기록 — redteam_credential_add 의 secret_value 로 보강해야 패널에 바로 표시됩니다",
                    ),
                h(
                  "div",
                  { className: "rt-cred-meta" },
                  [
                    c.source ? "출처 " + c.source : null,
                    c.tool ? "도구 " + c.tool : null,
                    c.secret_ref ? "증거 " + c.secret_ref : null,
                    c.found_by_agent ? "by " + c.found_by_agent : null,
                    c.found_at ? fmt(c.found_at) : null,
                  ]
                    .filter(Boolean)
                    .join(" · "),
                ),
                c.note
                  ? h("div", { className: "rt-cred-meta" }, "비고: " + c.note)
                  : null,
              ),
            ),
          )
        : h(
            "div",
            { className: "rt-empty" },
            "자격 증명 없음(패스워드/키/Hash 를 얻은 뒤 redteam_credential_add 로 저장하면 즉시 재사용할 수 있습니다)",
          ),
    );

    const accessSection = h(
      "div",
      null,
      h(
        "div",
        { className: "rt-section" },
        "획득한 접근 세션 · " + accesses.length,
      ),
      accesses.length
        ? accesses.map((a) =>
            h(
              "div",
              {
                key: "a" + a.id,
                className: "rt-vrow",
                style: {
                  cursor: "default",
                  gridTemplateColumns: "1fr 110px 80px 80px 1fr",
                },
              },
              h("span", { className: "rt-mono" }, a.host),
              h("span", null, a.username || "—"),
              h(
                "span",
                null,
                h(
                  "span",
                  { className: "rt-tag rt-tag-active" },
                  a.method || "—",
                ),
              ),
              h("span", null, a.privilege || "—"),
              h(
                "span",
                { className: "rt-mono", title: a.session_ref || "" },
                a.session_ref || "—",
              ),
            ),
          )
        : h("div", { className: "rt-empty" }, "없음"),
    );

    const subTabBtn = (key, label, n) =>
      h(
        "span",
        Object.assign(
          {
            className: "rt-subtab" + (subTab === key ? " on" : ""),
          },
          clickable(() => setSubTab(key), {
            label: label + "(" + n + ")",
            expanded: subTab === key,
          }),
        ),
        label + " " + n,
      );

    return h(
      "div",
      { className: "rt-main" },
      toolbar,
      conclusion,
      h(
        "div",
        { className: "rt-subtabs" },
        subTabBtn("vulns", "취약점", state.total || 0),
        subTabBtn("files", "공격 파일", allFiles.length),
        subTabBtn("creds", "자격 증명", creds.length),
        subTabBtn("access", "접근 세션", accesses.length),
        h("div", { className: "rt-spacer" }),
        grouped
          ? h(
              "button",
              {
                className: "rt-btn",
                title: "모든 대상 펼치기",
                onClick: () =>
                  collapse.setAll(
                    (state.items || []).map((v) => "target:" + targetKeyOf(v)),
                    true,
                  ),
              },
              "전체 펼치기",
            )
          : null,
        grouped
          ? h(
              "button",
              {
                className: "rt-btn",
                title: "모든 대상 접기",
                onClick: () =>
                  collapse.setAll(
                    (state.items || []).map((v) => "target:" + targetKeyOf(v)),
                    false,
                  ),
              },
              "전체 접기",
            )
          : null,
        h(
          "button",
          {
            className: "rt-btn" + (grouped ? " rt-btn-primary" : ""),
            title: grouped
              ? "현재: 대상별 집계(어느 자산이 어떻게 뚫렸는지 먼저 봅니다)"
              : "현재: 취약점 한 줄씩 나열",
            onClick: () => setGrouped((g) => !g),
          },
          grouped ? "대상별 집계" : "개별 나열",
        ),
      ),
      msg
        ? h(
            "div",
            { className: msg.err ? "rt-err" : "rt-foot" },
            msg.err || msg.ok,
          )
        : null,
      needRestart
        ? h(
            "div",
            { className: "rt-empty" },
            "이 모듈의 호스트 코드가 갱신되었습니다. 현재 호스트(공식 exe / 커뮤니티판 / dsh web)를 한 번 재시작해야 적용됩니다",
          )
        : null,
      state.error && !needRestart
        ? h("div", { className: "rt-err" }, state.error)
        : null,
      subTab === "files"
        ? h(
            "div",
            { className: "rt-body", style: { overflow: "auto" } },
            h(
              "div",
              { className: "rt-hint", style: { marginBottom: 8 } },
              "공격 파일은 타깃 디렉터리 단위로 정리됩니다(옛 “공격 파일” 탭). 각 취약점에 연결된 파일도 해당 취약점 상세에서 바로 볼 수 있습니다." +
                (orphanFiles.length
                  ? " 현재 vuln_id 가 연결되지 않은 파일이 " +
                    orphanFiles.length +
                    "개 있으니 취약점과 대응되도록 보강을 권합니다."
                  : ""),
            ),
            h(AttackFilesTab, { engagement: eng, refreshKey: refreshKey }),
          )
        : subTab === "creds"
          ? h(
              "div",
              { className: "rt-body", style: { overflow: "auto" } },
              credSection,
            )
          : subTab === "access"
            ? h(
                "div",
                { className: "rt-body", style: { overflow: "auto" } },
                accessSection,
              )
            : h(
                "div",
                { className: "rt-table" },
                grouped ? null : head,
                rows,
                !state.loading && !state.items.length && !state.error
                  ? h("div", { className: "rt-empty" }, "취약점 기록 없음")
                  : null,
              ),
    );
  }

  /* ---------------------------------------------------------- 공격 체인 */
  const STAGE_LABEL = {
    recon: "정보 수집",
    vuln: "취약점 발견",
    exploit: "취약점 익스플로잇",
    access: "권한 획득",
    pivot: "내부망 돌파",
    data: "민감 데이터",
    other: "기타",
  };

  /* ---------------------------------------------------------- 공격 체인(5단계) */
  /**
   * 공격 표면 위치에 따라 하나의 사슬로 잇는다:
   * ① 정보 수집 → ② 인터넷 자산 권한 → ③ 경계 돌파 → ④ 내부망 자산 권한 → ⑤ 타깃 권한.
   * 각 단계는 두 가지만 말한다: 이 단계에서 몇 점을 땄는지(누적 몇 점), 관련 자산/터널은 무엇인지.
   * A = 세로 사슬(상세); B = 가로 사슬(한 화면에 다 본다).
   */
  function ChainTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [view, setView] = React.useState("A");
    const [openId, setOpenId] = React.useState(null);

    const load = () => {
      if (!eng) return;
      setLoading(true);
      api({ op: "scoreChain", engagement: eng }).then(
        (r) => {
          setLoading(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => {
          setLoading(false);
          setErr(String((e && e.message) || e));
        },
      );
    };
    React.useEffect(load, [eng, refreshKey]);

    const stages = (data && data.stages) || [];
    const summary = (data && data.summary) || null;
    const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));
    const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥"];

    /* 단일 득점 상세 */
    const hitDetail = (x) =>
      h(
        "div",
        { className: "rt-flow-detail" },
        h(
          "div",
          { className: "rt-kv" },
          h("b", null, "대상"),
          h(
            "span",
            { className: "rt-mono", style: { wordBreak: "break-all" } },
            x.target || "—",
          ),
        ),
        x.asset_ip
          ? h(
              "div",
              { className: "rt-kv" },
              h("b", null, "자산"),
              h("span", { className: "rt-mono" }, x.asset_ip),
            )
          : null,
        x.vuln_title
          ? h(
              "div",
              { className: "rt-kv" },
              h("b", null, "이용 취약점"),
              h(
                "span",
                null,
                [x.vuln_cve, x.vuln_title].filter(Boolean).join(" "),
              ),
            )
          : null,
        h(
          "div",
          { className: "rt-kv" },
          h("b", null, "횟수"),
          h(
            "span",
            null,
            "같은 유형 " + x.nth_of_point + "번째 · +" + (x.points || 0) + "점",
          ),
        ),
        h(
          "div",
          { className: "rt-kv" },
          h("b", null, "기록"),
          h(
            "span",
            null,
            fmt(x.recorded_at) + (x.recorded_by ? " · " + x.recorded_by : ""),
          ),
        ),
        x.evidence ? h(Clip, { label: "결과와 증거", text: x.evidence }) : null,
      );

    const hitRow = (x) =>
      h(
        "div",
        {
          key: "h" + x.id,
          className: "rt-ap-hit" + (openId === x.id ? " open" : ""),
          role: "button",
          tabIndex: 0,
          onClick: () => toggle(x.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle(x.id);
            }
          },
        },
        h(
          "div",
          { className: "rt-ap-hit-head" },
          h(
            "span",
            {
              className: "rt-ap-pts" + (x.counted ? "" : " uncounted"),
              title: x.capped_reason || undefined,
            },
            "+" + (x.counted ? x.points || 0 : 0),
          ),
          h("span", { className: "rt-ap-hit-name" }, x.point_name),
          x.capped
            ? h(
                "span",
                {
                  className: "rt-tag rt-tag-warn",
                  title:
                    x.capped_reason ||
                    "같은 자산·같은 포트에서는 점수가 가장 높은 한 건만 인정합니다",
                },
                "서비스 상한 도달 · 미집계",
              )
            : null,
          x.nth_of_point > 1
            ? h(
                "span",
                { className: "rt-ap-nth" },
                "같은 유형 " + x.nth_of_point + "번째",
              )
            : null,
          h(
            "span",
            { className: "rt-ap-hit-target" },
            x.target || x.asset_ip || "—",
          ),
        ),
        x.action
          ? h(
              "div",
              {
                className: "rt-ap-act" + (x.action_inferred ? " inferred" : ""),
              },
              "동작: " +
                (x.action.title || "(이름 없는 단계)") +
                (x.action_inferred ? "(추론)" : ""),
            )
          : null,
        openId === x.id ? hitDetail(x) : null,
      );

    /* 자산 행(정보 수집 단계 / 각 단계 관련 자산) */
    const assetRow = (a) =>
      h(
        "div",
        { key: "a" + a.id, className: "rt-ap-asset" },
        h(
          "span",
          {
            className:
              "rt-scope rt-scope-" +
              (a.scope === "internal" ? "internal" : "external"),
          },
          a.scope === "internal" ? "내" : "외",
        ),
        h("span", { className: "rt-mono", style: { fontWeight: 600 } }, a.ip),
        a.segment_cidr
          ? h("span", { className: "rt-ap-nth" }, a.segment_cidr)
          : null,
        h("span", { className: "rt-ap-nth" }, "포트 " + (a.open_ports || 0)),
        a.vulns
          ? h("span", { className: "rt-ap-nth" }, "취약점 " + a.vulns)
          : null,
        a.priority
          ? h("span", { className: "rt-tag" }, "공략 " + a.priority)
          : null,
        h("div", { className: "rt-spacer" }),
        h("span", { className: "rt-ap-pts" }, "+" + (a.points || 0) + "점"),
        h("span", { className: "rt-ap-nth" }, (a.hits || 0) + "회"),
      );

    /* 공격 체인은 "어디까지 뚫었고 몇 점을 땄는지"만 말한다: 공략 요령과 도구 목록은
         실행 세부이므로 사슬에 섞으면 득점과 자산 정보가 묻힌다. */

    /* ── A: 세로 공격 체인 ─────────────────────────────────────────── */
    const stageA = (st, i) => {
      const isRecon = st.code === "recon";
      const body = [];
      if (isRecon) {
        body.push(
          h(
            "div",
            { key: "at", className: "rt-ap-sub" },
            "점수를 낸 자산 · " + st.assetCount + "대",
          ),
        );
        body.push(
          h(
            "div",
            { key: "al", className: "rt-ap-assets" },
            st.assets.length
              ? st.assets.map(assetRow)
              : h(
                  "div",
                  { className: "rt-ap-none" },
                  "아직 점수를 낸 자산이 없습니다",
                ),
          ),
        );
      } else {
        body.push(
          h(
            "div",
            { key: "ht", className: "rt-ap-sub" },
            "이 단계 적중 " +
              st.hits +
              "회" +
              (st.points ? " · +" + st.points + "점" : ""),
          ),
        );
        body.push(
          h(
            "div",
            { key: "hl", className: "rt-ap-hits" },
            st.items.length
              ? st.items.map(hitRow)
              : h(
                  "div",
                  { className: "rt-ap-none" },
                  "이 단계는 아직 득점이 없습니다",
                ),
          ),
        );
        if (st.code === "boundary") {
          const selfOnly = (st.tunnels_self_only || []).length;
          body.push(
            h(
              "div",
              { key: "tt", className: "rt-ap-sub" },
              "타깃 경계를 넘은 통로 · " +
                st.tunnels.length +
                "개" +
                (selfOnly
                  ? "(그 밖에 " +
                    selfOnly +
                    "개는 내 VPS/자체 서버에만 있어 돌파로 보지 않습니다)"
                  : ""),
            ),
          );
          if (selfOnly && st.tunnels.length === 0) {
            body.push(
              h(
                "div",
                { key: "tw", className: "rt-ap-none" },
                "⚠️ 현재 통로가 모두 내 서버에만 있어 대상에 닿지 않았습니다 — 경계 돌파로 집계하지 않습니다. 대상 측에서 시작되는 통로가 필요합니다(내 쪽으로 리버스 셸 / 대상에서 frp 클라이언트 실행 / 대상 WebShell 을 경유한 suo5).",
              ),
            );
          }
          body.push(
            h(
              "div",
              { key: "tl", className: "rt-ap-tunnels" },
              st.tunnels.length
                ? st.tunnels.map((t) =>
                    h(
                      "div",
                      { key: "t" + t.id, className: "rt-ap-tunnel" },
                      h(
                        "span",
                        { className: "rt-tag rt-tag-passive" },
                        t.kind || "tunnel",
                      ),
                      h(
                        "span",
                        { className: "rt-mono", style: { fontWeight: 600 } },
                        t.listen || "—",
                      ),
                      h(
                        "span",
                        {
                          className:
                            "rt-tag " +
                            (t.status === "active" ? "rt-tag-live" : ""),
                          style: t.status === "active" ? {} : { opacity: 0.7 },
                        },
                        t.status === "active"
                          ? "사용 가능"
                          : t.status || "알 수 없음",
                      ),
                      h(
                        "span",
                        {
                          className: "rt-ap-nth",
                          style: {
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        },
                        "도달 " + (t.reach || "—"),
                      ),
                    ),
                  )
                : h(
                    "div",
                    { className: "rt-ap-none" },
                    "아직 터널이 없습니다(구축한 뒤 redteam_tunnel_add 로 등록하세요)",
                  ),
            ),
          );
        }
        if (st.assets.length && st.code !== "boundary") {
          body.push(
            h(
              "div",
              { key: "at", className: "rt-ap-sub" },
              "관련 자산 · " + st.assetCount + "대",
            ),
          );
          body.push(
            h(
              "div",
              { key: "al", className: "rt-ap-assets" },
              st.assets.map(assetRow),
            ),
          );
        }
      }

      return h(
        "div",
        { key: "st" + st.code, className: "rt-ap-stage" },
        h(
          "div",
          { className: "rt-ap-head", style: { borderLeftColor: st.color } },
          h(
            "span",
            { className: "rt-ap-no", style: { background: st.color } },
            CIRCLED[i] || "0" + (i + 1),
          ),
          h("span", { className: "rt-ap-name" }, st.name),
          st.subtitle
            ? h("span", { className: "rt-ap-en" }, st.subtitle)
            : null,
          h("div", { className: "rt-spacer" }),
          st.points > 0
            ? h(
                "span",
                {
                  className: "rt-ap-pts",
                  style: {
                    background: st.color + "22",
                    color: st.color,
                    borderColor: st.color + "66",
                  },
                },
                "+" + st.points,
              )
            : null,
          h("span", { className: "rt-ap-cum" }, "누적 " + st.cumulative + "점"),
        ),
        h(
          "div",
          { className: "rt-ap-goal", style: { borderLeftColor: st.color } },
          h(
            "span",
            {
              className: "rt-ap-goal-tag",
              style: { color: st.color, borderColor: st.color + "66" },
            },
            "단계 목표",
          ),
          h("span", null, st.goal),
        ),
        h(
          "div",
          { className: "rt-ap-result", style: { borderLeftColor: st.color } },
          body,
        ),
        i < stages.length - 1
          ? h(
              "div",
              { className: "rt-ap-trans" },
              h("span", { className: "rt-flow-arrow" }, "▼"),
              st.transition
                ? h("span", { className: "rt-ap-trans-t" }, st.transition)
                : null,
              h(
                "span",
                { className: "rt-ap-trans-t", style: { marginLeft: "auto" } },
                "누적 " + st.cumulative + "점",
              ),
            )
          : h(
              "div",
              { className: "rt-ap-trans" },
              h("span", { className: "rt-flow-arrow" }, "▼"),
              h(
                "span",
                { className: "rt-ap-trans-t" },
                "합계 " + ((summary && summary.points) || 0) + "점",
              ),
            ),
      );
    };

    /* ── B: 가로 공격 체인(한 화면에 다 본다) ─────────────────────────────── */
    const stageB = (st, i) =>
      h(
        "div",
        { key: "c" + st.code, className: "rt-ap-col" },
        i > 0 ? h("span", { className: "rt-ap-col-arrow" }, "▶") : null,
        h(
          "div",
          { className: "rt-hcol", style: { borderTopColor: st.color } },
          h(
            "div",
            {
              className: "rt-ap-head",
              style: { borderLeftColor: st.color, padding: "5px 8px" },
            },
            h(
              "span",
              {
                className: "rt-ap-no",
                style: {
                  background: st.color,
                  width: 16,
                  height: 16,
                  fontSize: 10,
                },
              },
              String(i + 1),
            ),
            h(
              "span",
              { className: "rt-ap-name", style: { fontSize: 12 } },
              st.name,
            ),
            h("div", { className: "rt-spacer" }),
            h(
              "span",
              { className: "rt-ap-cum", style: { fontWeight: 700 } },
              st.cumulative,
            ),
          ),
          h("div", { className: "rt-hcol-goal", title: st.goal }, st.goal),
          h(
            "div",
            { className: "rt-hcol-body" },
            st.code === "boundary"
              ? h(
                  "div",
                  null,
                  h(
                    "div",
                    { className: "rt-hcol-hit" },
                    h("span", { className: "rt-hcol-pts" }, "+" + st.points),
                    h(
                      "span",
                      { className: "rt-hcol-name" },
                      "터널 " + st.tunnels.length + "개",
                    ),
                  ),
                  st.tunnels
                    .slice(0, 3)
                    .map((t) =>
                      h(
                        "div",
                        { key: "t" + t.id, className: "rt-hcol-sub" },
                        "▸ " + (t.kind || "") + " " + (t.listen || ""),
                      ),
                    ),
                )
              : st.code === "recon"
                ? h(
                    "div",
                    null,
                    h(
                      "div",
                      { className: "rt-hcol-hit" },
                      h("span", { className: "rt-hcol-pts" }, st.assetCount),
                      h(
                        "span",
                        { className: "rt-hcol-name" },
                        "대 자산이 득점",
                      ),
                    ),
                    st.assets.slice(0, 6).map((a) =>
                      h(
                        "div",
                        {
                          key: "a" + a.id,
                          className: "rt-hcol-sub",
                          title: a.ip + "  +" + a.points + "점",
                        },
                        (a.scope === "internal" ? "내 " : "외 ") +
                          a.ip +
                          "  +" +
                          a.points,
                      ),
                    ),
                  )
                : h(
                    "div",
                    null,
                    h(
                      "div",
                      { className: "rt-hcol-hit" },
                      h("span", { className: "rt-hcol-pts" }, "+" + st.points),
                      h(
                        "span",
                        { className: "rt-hcol-name" },
                        st.hits + "회 적중",
                      ),
                    ),
                    st.items.slice(0, 6).map((x) =>
                      h(
                        "div",
                        {
                          key: "c" + x.id,
                          className: "rt-hcol-sub",
                          title: x.point_name + "  " + (x.target || ""),
                        },
                        h("span", { className: "rt-hcol-pts" }, "+" + x.points),
                        h("span", { className: "rt-hcol-name" }, x.point_name),
                      ),
                    ),
                    st.items.length > 6
                      ? h(
                          "div",
                          { className: "rt-hcol-none" },
                          "…그 밖에 " + (st.items.length - 6) + "회",
                        )
                      : null,
                    st.assetCount
                      ? h(
                          "div",
                          { className: "rt-hcol-none" },
                          "관련 자산 " + st.assetCount + "대",
                        )
                      : null,
                  ),
          ),
        ),
      );

    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "공격 체인"),
        h(
          "span",
          { className: "rt-tag", style: { fontSize: 10.5 } },
          "정보 수집 → 인터넷 자산 권한 → 경계 돌파 → 내부망 자산 권한 → 타깃 권한",
        ),
        summary
          ? h(
              "span",
              { className: "rt-tag rt-tag-live" },
              "총점 " + summary.points + "점",
            )
          : null,
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          {
            className: "rt-btn" + (view === "A" ? " rt-btn-primary" : ""),
            title: "세로 공격 체인: 단계별로 내려가며 상세를 봅니다",
            onClick: () => setView("A"),
          },
          "사슬 A",
        ),
        h(
          "button",
          {
            className: "rt-btn" + (view === "B" ? " rt-btn-primary" : ""),
            title: "가로 공격 체인: 다섯 단계를 한 화면에 봅니다",
            onClick: () => setView("B"),
          },
          "사슬 B",
        ),
        h(
          "button",
          { className: "rt-btn", disabled: loading, onClick: load },
          loading ? "불러오는 중…" : "새로고침",
        ),
      ),
      err ? h("div", { className: "rt-err" }, err) : null,
      !stages.length && !err && data !== null
        ? h(
            "div",
            { className: "rt-empty" },
            "아직 득점 기록이 없습니다. 성과를 얻은 뒤 redteam_score_hit 로 점수를 기록하면 이 사슬이 자라납니다.",
          )
        : view === "A"
          ? h("div", { className: "rt-ap" }, stages.map(stageA))
          : h("div", { className: "rt-ap-h" }, stages.map(stageB)),
    );
  }

  /* ---------------------------------------------------------- 득점 재현 보고서 */
  /**
   * 보고서 그룹 폴백: host 가 개별 나열 항목만 줄 때, scoreChain 의 단계 정보로 항목을 공격 체인 순서로 묶는다.
   * 근거는 양쪽이 공유하는 score_hit id — scoreChain 의 각 item 은 stage_code 를,
   * scoreReport 의 각 item 은 같은 id 를 들고 있다. 이렇게 하면 host 측 버전이 낮거나 단계 행이 빠져도
   * 보고서 페이지가 정상 표시되며, "아직 납품할 성과가 없다"는 오탐을 내지 않는다.
   */
  function groupByStage(reportItems, chain) {
    const byId = new Map((reportItems || []).map((x) => [x.id, x]));
    const groups = [];
    const stageList = (chain && chain.stages) || [];
    stageList.forEach((st, si) => {
      const items = (st.items || []).map((x) => byId.get(x.id)).filter(Boolean);
      if (items.length === 0) return;
      groups.push({
        code: st.code,
        name: st.name,
        color: st.color || "#64748b",
        ordinal: st.ordinal || si + 1,
        points: st.points || 0,
        cumulative: st.cumulative || 0,
        items,
      });
    });
    /* scoreChain 에 단계 정보가 전혀 없으면 최소한 득점을 “기타”로 묶는다. 항목이 사라지게 두지 않는다 */
    const grouped = new Set(
      groups.reduce((acc, g) => acc.concat(g.items.map((x) => x.id)), []),
    );
    const rest = (reportItems || []).filter((x) => !grouped.has(x.id));
    if (rest.length > 0) {
      groups.push({
        code: "other",
        name: "기타 득점",
        color: "#64748b",
        ordinal: groups.length + 1,
        points: rest.reduce((n, x) => n + (x.counted ? x.points : 0), 0),
        cumulative: 0,
        items: rest,
      });
    }
    return groups;
  }

  function ReportTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [msg, setMsg] = React.useState(null);
    /* 보고서는 단계별로 접힌다: 기본은 전부 펼침, 접힘 상태는 타깃별로 기억한다(단계가 많을 때 구간별 납품에 편하다) */
    const collapse = useCollapse("report:" + eng);

    const load = () => {
      if (!eng) return;
      setBusy(true);
      setMsg(null);
      api({ op: "scoreReport", engagement: eng }).then(
        (r) => {
          if (!r || r.ok === false) {
            setBusy(false);
            setErr((r && r.error) || "생성 실패");
            return;
          }
          /* 옛 host 는 개별 항목만 주고 단계 그룹을 주지 않는다(또는 단계 행이 빠졌다): 직접 공격 체인 순서로 묶는다,
              그렇지 않으면 보고서 페이지가 "아직 납품할 성과가 없다"는 오탐을 낸다. 그룹 데이터는 scoreChain 에서 가져온다. */
          if (
            (!r.stages || r.stages.length === 0) &&
            (r.items || []).length > 0
          ) {
            api({ op: "scoreChain", engagement: eng }).then(
              (c) => {
                setBusy(false);
                setErr(null);
                setData(
                  Object.assign({}, r, { stages: groupByStage(r.items, c) }),
                );
              },
              () => {
                setBusy(false);
                setErr(null);
                setData(r);
              },
            );
            return;
          }
          setBusy(false);
          setErr(null);
          setData(r);
        },
        (e) => {
          setBusy(false);
          setErr(String((e && e.message) || e));
        },
      );
    };
    React.useEffect(load, [eng, refreshKey]);

    /* 복사 결과는 반드시 사실이어야 한다: clipboard API 가 실패하면(비보안 컨텍스트/포커스 상실/거부) 그대로 알린다,
         그렇지 않으면 사용자는 복사에 성공했다고 믿고 Yakit 에 빈 내용을 붙여넣게 된다. */
    const copy = (text, label) =>
      copyWithFeedback(text, label, (okFlag, message) => {
        setMsg(okFlag ? { ok: message } : { err: message });
      });
    const download = (text, label) => {
      try {
        const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          "report-" +
          String(label || "score").replace(/[^\w.\-]/g, "_") +
          ".md";
        a.click();
        /* 즉시 revoke 하면 일부 브라우저에서 click 으로 시작된 다운로드가 끊긴다, 한 박자 늦춘다 */
        setTimeout(() => {
          try {
            URL.revokeObjectURL(url);
          } catch {
            /* ignore */
          }
        }, 1000);
        setMsg({ ok: "다운로드됨: " + label });
      } catch (e) {
        setMsg({ err: "다운로드 실패: " + ((e && e.message) || e) });
      }
    };

    const items = (data && data.items) || [];
    const stages = (data && data.stages) || [];
    const summary = (data && data.summary) || null;
    const mdText = (data && data.markdown) || "";
    const CIRCLED = [
      "①",
      "②",
      "③",
      "④",
      "⑤",
      "⑥",
      "⑦",
      "⑧",
      "⑨",
      "⑩",
      "⑪",
      "⑫",
      "⑬",
      "⑭",
      "⑮",
      "⑯",
      "⑰",
      "⑱",
      "⑲",
      "⑳",
    ];

    /* 항목당 한 줄, 개별 나열이며 접지 않는다: 대상 → 획득한 것 → 재현 요청(Yakit 에 바로 붙여넣기) → 응답 */
    const card = (x) =>
      h(
        "div",
        { key: "r" + x.id, className: "rt-rep" },
        h(
          "div",
          { className: "rt-rep-head" },
          h("span", { className: "rt-rep-idx" }, String(x.seq)),
          h("span", { className: "rt-rep-name" }, x.point_name),
          h("span", { className: "rt-flow-pts" }, "+" + x.points + "점"),
          x.nth_of_point > 1
            ? h(
                "span",
                { className: "rt-tag" },
                "같은 유형 " + x.nth_of_point + "번째",
              )
            : null,
          h("div", { className: "rt-spacer" }),
          h(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () =>
                copy(
                  (x.requests || [])
                    .map((v) => v.request || "")
                    .filter(Boolean)
                    .join("\n\n"),
                  "요청 " + x.seq + "번",
                ),
            },
            "요청 복사",
          ),
        ),
        h(
          "div",
          { className: "rt-rep-meta" },
          h("span", null, h("b", null, "대상 ")),
          h("span", { className: "rt-mono" }, x.target || x.asset_ip || "—"),
        ),
        x.gained
          ? h(
              "div",
              { className: "rt-rep-meta" },
              h("b", null, "획득 "),
              h("span", null, x.gained),
            )
          : null,
        x.vuln
          ? h(
              "div",
              { className: "rt-rep-meta" },
              h("b", null, "이용 취약점 "),
              h(
                "span",
                null,
                [x.vuln.cve, x.vuln.title].filter(Boolean).join(" "),
              ),
            )
          : null,
        x.evidence
          ? h(
              "div",
              { className: "rt-rep-meta" },
              h("b", null, "결과 "),
              h("span", null, String(x.evidence).replace(/\n+/g, " ")),
            )
          : null,
        x.recorded_at
          ? h(
              "div",
              { className: "rt-rep-meta" },
              h("b", null, "획득 시각 "),
              h(
                "span",
                null,
                fmt(x.recorded_at) +
                  (x.recorded_by
                    ? "(" + (ROLE_LABEL[x.recorded_by] || x.recorded_by) + ")"
                    : ""),
              ),
            )
          : null,
        h(ShotStrip, {
          eng: eng,
          shots: x.shots,
          total: x.shot_total,
          title: "증거 스크린샷",
        }),
        /* ── 재현 단계: 동작 기록(실제 명령과 출력 포함) + 자격 증명 + 터널 + WebShell ─────
           보고서의 납품 가치는 전부 이 블록에 있다: 계정/비밀번호가 어떻게 나왔고 터널을 어떻게 세웠는지, 사용자가 그대로 따라 하면 재현된다. */
        h(
          "details",
          {
            className: "rt-rep-trace",
            open: x.incomplete === true || (x.steps || []).length === 0,
          },
          h(
            "summary",
            { className: "rt-rep-trace-head", style: { cursor: "pointer" } },
            h(
              "span",
              { className: "rt-rep-trace-title" },
              "재현 단계(클릭하면 펼침)",
            ),
            (x.steps || []).length
              ? h(
                  "span",
                  { className: "rt-tag" },
                  (x.steps || []).length + "개 동작",
                )
              : null,
            (x.credentials || []).length
              ? h(
                  "span",
                  { className: "rt-tag" },
                  (x.credentials || []).length + "건 자격 증명",
                )
              : null,
            (x.tunnels || []).length
              ? h(
                  "span",
                  { className: "rt-tag" },
                  (x.tunnels || []).length + "개 터널",
                )
              : null,
            x.incomplete
              ? h(
                  "span",
                  { className: "rt-tag rt-tag-warn" },
                  "재현 자료 보강 필요",
                )
              : h("span", { className: "rt-tag rt-tag-live" }, "재현 가능"),
          ),
          h(
            "div",
            { style: { paddingTop: 6 } },
            x.how ? h("div", { className: "rt-rep-trace-how" }, x.how) : null,
            (x.steps || []).length === 0
              ? h(
                  "div",
                  { className: "rt-rep-missing" },
                  "⚠️ 연결된 공격 단계가 없습니다: 이 단계를 어떻게 했는지 설명할 수 없습니다. redteam_chain_add 로 동작(title / detail / tool / result)을 보강하고, 득점 시에도 point_code + evidence 로 한 번에 끝낼 수 있습니다.",
                )
              : (x.steps || []).map((s, si) =>
                  h(
                    "div",
                    { key: "s" + s.id, className: "rt-rep-step" },
                    h(
                      "div",
                      { className: "rt-rep-step-head" },
                      h(
                        "span",
                        { className: "rt-rep-step-no" },
                        String(si + 1),
                      ),
                      h(
                        "span",
                        { className: "rt-rep-step-title" },
                        s.title || "(이름 없는 동작)",
                      ),
                      s.agent
                        ? h(
                            "span",
                            { className: "rt-tag" },
                            ROLE_LABEL[s.agent] || s.agent,
                          )
                        : null,
                      s.stage_code
                        ? h("span", { className: "rt-tag" }, s.stage_code)
                        : null,
                      s.inferred
                        ? h(
                            "span",
                            { className: "rt-tag" },
                            "같은 자산으로 추론",
                          )
                        : null,
                      h("div", { className: "rt-spacer" }),
                      s.recorded_at
                        ? h(
                            "span",
                            {
                              style: {
                                fontSize: 11,
                                color: "var(--dsw-alias-label-secondary)",
                              },
                            },
                            fmt(s.recorded_at),
                          )
                        : null,
                    ),
                    s.detail
                      ? h("div", { className: "rt-rep-step-detail" }, s.detail)
                      : null,
                    h(
                      "div",
                      { className: "rt-rep-step-cmd" },
                      h("b", null, "실행 "),
                      s.tool
                        ? h("span", { className: "rt-mono" }, s.tool)
                        : h(
                            "span",
                            {
                              style: {
                                color:
                                  "var(--dsw-alias-state-warn-primary, #f59e0b)",
                              },
                            },
                            "실제 명령 미기록(redteam_chain_add 의 tool)",
                          ),
                    ),
                    s.tool
                      ? h(
                          "div",
                          { style: { marginTop: 3 } },
                          h(
                            "button",
                            {
                              className: "rt-btn",
                              style: { padding: "0 6px", fontSize: 11 },
                              onClick: () =>
                                copy(
                                  String(s.tool),
                                  "단계 " + (si + 1) + " 명령",
                                ),
                            },
                            "명령 복사",
                          ),
                        )
                      : null,
                    s.result
                      ? h(
                          "div",
                          { className: "rt-rep-step-result" },
                          h("b", null, "결과 "),
                          String(s.result).replace(/\n+/g, " "),
                        )
                      : null,
                    s.evidence_ref
                      ? h(
                          "div",
                          { className: "rt-rep-step-result" },
                          h("b", null, "증거 "),
                          h("span", { className: "rt-mono" }, s.evidence_ref),
                        )
                      : null,
                  ),
                ),
            /* 계정/비밀번호가 어떻게 나왔는지: 자격 증명의 출처 + 획득 방식 */
            (x.credentials || []).length
              ? h(
                  "div",
                  { className: "rt-rep-src" },
                  h(
                    "div",
                    { className: "rt-rep-src-title" },
                    "획득한 자격 증명(출처 추적 가능)",
                  ),
                  (x.credentials || []).map((c) =>
                    h(
                      "div",
                      { key: "c" + c.id, className: "rt-kv" },
                      h(
                        "b",
                        { className: "rt-mono", style: { minWidth: 120 } },
                        c.host || "—",
                      ),
                      h(
                        "span",
                        null,
                        (c.username || "(사용자 이름 없음)") +
                          " / " +
                          (c.secret_type || "password") +
                          (c.privilege ? " · 권한 " + c.privilege : "") +
                          " · 출처 " +
                          (c.source || "미표기") +
                          (c.tool
                            ? " · 획득 방식 " +
                              String(c.tool).replace(/\n+/g, " ").slice(0, 160)
                            : ""),
                      ),
                    ),
                  ),
                )
              : null,
            /* 터널을 어떻게 세웠는지 */
            (x.tunnels || []).length
              ? h(
                  "div",
                  { className: "rt-rep-src" },
                  h(
                    "div",
                    { className: "rt-rep-src-title" },
                    "사용한 터널 / 통로",
                  ),
                  (x.tunnels || []).map((t) =>
                    h(
                      "div",
                      { key: "t" + t.id, className: "rt-kv" },
                      h(
                        "b",
                        { className: "rt-mono", style: { minWidth: 120 } },
                        (t.kind || "socks5") + " " + (t.listen || ""),
                      ),
                      h(
                        "span",
                        null,
                        "진입점 " +
                          (t.entry || "미등록") +
                          (t.reach ? " · 도달 " + t.reach : "") +
                          " · 대상 측 " +
                          (t.entry_kind || "미선언") +
                          (t.legit === false
                            ? " · ⚠️ 타깃 경계를 넘은 것으로 보지 않습니다"
                            : "") +
                          (t.status ? " · " + t.status : "") +
                          (t.command
                            ? " · 명령 " +
                              String(t.command)
                                .replace(/\n+/g, " ")
                                .slice(0, 160)
                            : ""),
                      ),
                    ),
                  ),
                )
              : null,
            (x.webshells || []).length
              ? h(
                  "div",
                  { className: "rt-rep-src" },
                  h(
                    "div",
                    { className: "rt-rep-src-title" },
                    "사용한 WebShell",
                  ),
                  (x.webshells || []).map((w) =>
                    h(
                      "div",
                      { key: "w" + w.id, className: "rt-kv" },
                      h(
                        "b",
                        { className: "rt-mono", style: { minWidth: 120 } },
                        w.shell_type || "shell",
                      ),
                      h(
                        "span",
                        null,
                        (w.url || "") +
                          (w.pass_key ? " · 패스워드/키 " + w.pass_key : "") +
                          (w.privilege ? " · 권한 " + w.privilege : "") +
                          (w.status ? " · " + w.status : ""),
                      ),
                    ),
                  ),
                )
              : null,
            (x.gaps || []).length
              ? h(
                  "div",
                  { className: "rt-rep-missing" },
                  "⚠️ 재현 결손: " + x.gaps.join("; "),
                )
              : null,
          ),
          (x.requests || []).length === 0
            ? h(
                "div",
                { className: "rt-rep-missing" },
                "⚠️ 이 항목에는 원본 요청 기록이 없어 바로 재현할 수 없습니다 — redteam_http_evidence_add 로 보강하세요",
              )
            : (x.requests || []).map((r, ri) =>
                h(
                  "div",
                  { key: "q" + ri, className: "rt-rep-req" },
                  h(
                    "div",
                    { className: "rt-rep-req-head" },
                    h(
                      "span",
                      null,
                      "재현 요청 " +
                        (ri + 1) +
                        (r.source === "auto"
                          ? "(대상 경로로 자동 매칭했으니 확인 필요)"
                          : ""),
                    ),
                    h(
                      "span",
                      { className: "rt-tag" },
                      (r.method || "GET") +
                        " " +
                        (r.status === null || r.status === undefined
                          ? ""
                          : r.status),
                    ),
                    h("div", { className: "rt-spacer" }),
                    h(
                      "button",
                      {
                        className: "rt-btn",
                        style: { padding: "0 6px", fontSize: 11 },
                        onClick: () =>
                          copy(String(r.request || ""), "요청 " + (ri + 1)),
                      },
                      "Yakit 로 복사",
                    ),
                  ),
                  h(
                    "pre",
                    { className: "rt-rep-http" },
                    r.request ||
                      (r.method || "GET") + " " + (r.url || "") + " HTTP/1.1",
                  ),
                  r.response
                    ? h(
                        "div",
                        null,
                        h(
                          "div",
                          { className: "rt-rep-req-head" },
                          h("span", null, "응답 요약"),
                        ),
                        h(
                          "pre",
                          {
                            className: "rt-rep-http",
                            style: { maxHeight: 160 },
                          },
                          String(r.response).slice(0, 1600),
                        ),
                      )
                    : null,
                ),
              ),
          x.note
            ? h(
                "div",
                { className: "rt-rep-meta" },
                h("b", null, "비고 "),
                h("span", null, x.note),
              )
            : null,
        ),
      );

    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "공격 득점 사슬 재현 보고서"),
        summary
          ? h(
              "span",
              { className: "rt-tag rt-tag-live" },
              "합계 " + summary.points + "점",
            )
          : null,
        summary
          ? h("span", { className: "rt-tag" }, summary.count + "건 득점")
          : null,
        summary
          ? h(
              "span",
              {
                className:
                  "rt-tag" + (summary.missingRequests ? "" : " rt-tag-live"),
              },
              summary.withRequests + "/" + summary.count + "건 원본 요청 포함",
            )
          : null,
        summary
          ? h(
              "span",
              {
                className:
                  "rt-tag" +
                  (summary.incomplete ? " rt-tag-warn" : " rt-tag-live"),
                title:
                  "재현 사슬이 온전한지: 공격 단계가 있고, 실제 명령이 기록되었고, 취약점/자격 증명/터널이 연결되었는지",
              },
              "재현 가능 " +
                (summary.count - (summary.incomplete || 0)) +
                "/" +
                summary.count,
            )
          : null,
        summary && summary.serviceCappedExcluded
          ? h(
              "span",
              {
                className: "rt-tag rt-tag-warn",
                title:
                  (summary.serviceCapped || [])
                    .map((x) => (x.service || "") + "|" + (x.point_name || ""))
                    .join("\n") ||
                  "같은 자산·같은 포트의 중복 계정/DB 권한 적중: 서비스 상한에 도달해 점수 미반영, 보고서 제외",
              },
              "같은 서비스 상한 도달로 미집계 " + summary.serviceCappedExcluded,
            )
          : null,
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          {
            className: "rt-btn",
            disabled: busy || !mdText,
            onClick: () => copy(mdText, "전문"),
          },
          "전문 복사",
        ),
        h(
          "button",
          {
            className: "rt-btn",
            disabled: busy || !mdText,
            onClick: () => download(mdText, (data && data.target) || eng),
          },
          ".md 다운로드",
        ),
        h(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "생성 중…" : "다시 생성",
        ),
      ),
      msg
        ? h(
            "div",
            { className: msg.err ? "rt-err" : "rt-foot" },
            msg.err || msg.ok,
          )
        : null,
      err ? h("div", { className: "rt-err" }, err) : null,
      h(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        stages.length
          ? h(
              "div",
              { className: "rt-rep-list" },
              h(
                "div",
                { className: "rt-rep-tools" },
                h(
                  "button",
                  {
                    className: "rt-btn",
                    onClick: () =>
                      collapse.setAll(
                        stages.map((s) => "st:" + s.code),
                        true,
                      ),
                  },
                  "전체 펼치기",
                ),
                h(
                  "button",
                  {
                    className: "rt-btn",
                    onClick: () =>
                      collapse.setAll(
                        stages.map((s) => "st:" + s.code),
                        false,
                      ),
                  },
                  "전체 접기",
                ),
              ),
              stages.map((st) => {
                const open = collapse.isOpen("st:" + st.code, true);
                const toggle = collapse.toggle("st:" + st.code, true);
                return h(
                  "div",
                  { key: "g" + st.code, className: "rt-rep-group" },
                  h(
                    "div",
                    {
                      className: "rt-rep-stage",
                      role: "button",
                      tabIndex: 0,
                      style: { borderLeftColor: st.color },
                      "aria-expanded": open ? "true" : "false",
                      onClick: toggle,
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggle(e);
                        }
                      },
                    },
                    h("span", { className: "rt-sec-caret" }, open ? "▾" : "▸"),
                    h(
                      "span",
                      {
                        className: "rt-rep-no",
                        style: { background: st.color },
                      },
                      CIRCLED[st.ordinal - 1] || st.ordinal,
                    ),
                    h("span", { className: "rt-rep-stage-name" }, st.name),
                    h(
                      "span",
                      { className: "rt-rep-stage-n" },
                      st.items.length + "건",
                    ),
                    h("div", { className: "rt-spacer" }),
                    h(
                      "span",
                      {
                        className: "rt-rep-pts",
                        style: {
                          background: st.color + "22",
                          color: st.color,
                          borderColor: st.color + "66",
                        },
                      },
                      "+" + st.points + "점",
                    ),
                    h(
                      "span",
                      { className: "rt-ap-cum" },
                      "누적 " + st.cumulative + "점",
                    ),
                  ),
                  open
                    ? h("div", { className: "rt-rep-body" }, st.items.map(card))
                    : null,
                );
              }),
            )
          : data === null
            ? h("div", { className: "rt-empty" }, "불러오는 중…")
            : h(
                "div",
                { className: "rt-empty" },
                h("div", null, "아직 납품할 성과가 없습니다."),
                h(
                  "div",
                  { style: { marginTop: 6, fontSize: 12 } },
                  '이 보고서는 "점수를 낸" 성과만 싣습니다. 득점하지 않은 취약점은 보고서에 들어가지 않습니다. 성과를 얻은 뒤 redteam_score_hit 로 점수를 기록하고(대상 자산 + 얻은 것), 재현할 수 있도록 redteam_http_evidence_add 로 보강하세요.',
                ),
              ),
      ),
      h(
        "div",
        { className: "rt-foot" },
        h(
          "span",
          null,
          "기준: 득점 성과만 수록하며, 항목마다 Yakit Repeater 에 붙여넣을 수 있는 원본 요청을 붙입니다",
        ),
      ),
    );
  }

  /* ---------------------------------------------------------- 공격 파일 */
  const FILE_KIND = {
    poc: "POC",
    exp: "EXP",
    script: "스크립트",
    wordlist: "사전",
    other: "기타",
  };

  function AttackFilesTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [folders, setFolders] = React.useState([]);
    const [err, setErr] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const collapse = useCollapse("files:" + eng);
    const [detail, setDetail] = React.useState(null);

    const load = () => {
      if (!eng) return;
      setBusy(true);
      api({ op: "attackFiles", engagement: eng }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          setFolders(r.items || []);
        },
        (e) => {
          setBusy(false);
          setErr(String((e && e.message) || e));
        },
      );
    };
    React.useEffect(load, [eng, refreshKey]);

    const openFile = (f) => {
      if (detail && detail.id === f.id) {
        setDetail(null);
        return;
      }
      setDetail(null);
      api({ op: "readAttackFile", engagement: eng, id: f.id }).then(
        (r) => {
          if (r && r.ok) setDetail(r);
          else setErr((r && r.error) || "읽기 실패");
        },
        (e) => setErr(String((e && e.message) || e)),
      );
    };

    const rows = [];
    for (const folder of folders) {
      const fKey = "folder:" + folder.folder;
      const fileNodes = [];
      for (const f of folder.files) {
        fileNodes.push(
          h(
            "div",
            {
              key: "a" + f.id,
              className: "rt-vrow",
              style: {
                gridTemplateColumns: "18px 1.2fr 60px 1.6fr",
                cursor: "pointer",
              },
              role: "button",
              tabIndex: 0,
              onClick: () => openFile(f),
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openFile(f);
                }
              },
            },
            h(
              "span",
              { className: "rt-sec-caret" },
              detail && detail.id === f.id ? "▾" : "▸",
            ),
            h("span", { className: "rt-mono" }, f.name),
            h(
              "span",
              null,
              h(
                "span",
                { className: "rt-tag rt-tag-active" },
                FILE_KIND[f.kind] || f.kind || "—",
              ),
            ),
            h(
              "span",
              {
                style: {
                  fontSize: 11.5,
                  color: "var(--dsw-alias-label-secondary)",
                },
                title: f.description || "",
              },
              f.description || "—",
            ),
          ),
        );
        if (!detail || detail.id !== f.id) continue;
        fileNodes.push(
          h(
            "div",
            {
              key: "ad" + f.id,
              className: "rt-vrow",
              style: { cursor: "default", gridTemplateColumns: "1fr" },
            },
            h(
              "div",
              { className: "rt-vdetail" },
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "효과"),
                h("span", null, detail.evidence || "—"),
              ),
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "경로"),
                h(
                  "span",
                  { className: "rt-mono", style: { wordBreak: "break-all" } },
                  detail.path,
                ),
              ),
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "기록"),
                h(
                  "span",
                  null,
                  fmt(detail.created_at) +
                    (detail.created_by ? " · " + detail.created_by : ""),
                ),
              ),
              h(
                "pre",
                {
                  className: "rt-md",
                  style: {
                    border: "1px solid var(--dsw-alias-border-l1)",
                    borderRadius: 6,
                    maxHeight: "40vh",
                    padding: "10px 12px",
                  },
                },
                detail.content || "(비어 있음)",
              ),
            ),
          ),
        );
      }
      rows.push(
        h(
          Section,
          {
            key: "sec:" + folder.folder,
            tone: "folder",
            title: folder.folder + "/",
            count: folder.count + "개 파일",
            open: collapse.isOpen(fKey, true),
            onToggle: collapse.toggle(fKey, true),
          },
          fileNodes.length
            ? fileNodes
            : h("div", { className: "rt-atest-meta" }, "(비어 있음)"),
        ),
      );
    }

    const total = folders.reduce((n, f) => n + f.count, 0);
    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "공격 파일"),
        h(
          "span",
          { className: "rt-tag" },
          folders.length + "개 대상 / " + total + "개 파일",
        ),
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "새로고침 중…" : "새로고침",
        ),
      ),
      err ? h("div", { className: "rt-err" }, err) : null,
      h(
        "div",
        { className: "rt-table" },
        rows,
        !folders.length
          ? h(
              "div",
              { className: "rt-empty" },
              "공격 파일 없음(뚫은 스크립트/POC/EXP 가 대상 폴더별로 여기에 나타납니다)",
            )
          : null,
      ),
      h(
        "div",
        { className: "rt-foot" },
        h(
          "span",
          null,
          "디렉터리: attack-files/<IP|URL 호스트|C 블록>/ | 실제로 효과가 있었던 파일만 수록",
        ),
      ),
    );
  }

  /* ---------------------------------------------------------- 지식 베이스(POC/EXP, 전역 공유) */
  /**
   * 지식 베이스 페이지: Nday/1day 를 공략하기 전에 여기서 먼저 검색한다. 검색창은 CVE / 컴포넌트 / 키워드 / 본문 키워드를 지원한다;
   * 적중하면 펼쳐서 전문을 가져다 쓴다(그대로 복사해 쓸 수 있다), 없으면 인터넷에서 찾거나 직접 만들고, 검증 후 되채운다.
   * 여기는 **전역**이다: 타깃에 따라 바뀌지 않으며, 한 타깃에서 쌓은 범용 POC 는 이후 모든 타깃에서 쓸 수 있다.
   */
  const POC_KIND_LABEL = {
    poc: "POC",
    exp: "EXP",
    script: "스크립트",
    template: "템플릿",
    payload: "페이로드",
  };
  const POC_SOURCE_LABEL = {
    web: "인터넷",
    self: "직접 제작",
    manual: "수동",
    "nuclei-template": "nuclei 템플릿",
    kb: "지식 베이스",
  };

  function KnowledgeTab(props) {
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [msg, setMsg] = React.useState(null);
    const [q, setQ] = React.useState("");
    const [kind, setKind] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [engagement, setEngagement] = React.useState("");
    const [assetTarget, setAssetTarget] = React.useState("");
    const [grouped, setGrouped] = React.useState(true);
    const [verifiedOnly, setVerifiedOnly] = React.useState(false);
    const [openId, setOpenId] = React.useState(null);
    const [detail, setDetail] = React.useState(null);
    const [detailBusy, setDetailBusy] = React.useState(false);
    const [tplOffset, setTplOffset] = React.useState(0);
    const tplPageSize = 40;

    const query = (over) => {
      const extra = over || {};
      const offset = Object.prototype.hasOwnProperty.call(
        extra,
        "templateOffset",
      )
        ? extra.templateOffset
        : 0;
      setTplOffset(offset);
      const params = Object.assign(
        {
          q: q.trim() || undefined,
          kind: kind || undefined,
          category: category || undefined,
          engagement: engagement || undefined,
          asset_target: assetTarget.trim() || undefined,
          verified: verifiedOnly || undefined,
          templateOffset: offset || 0,
          templateLimit: tplPageSize,
        },
        extra,
      );
      setBusy(true);
      setMsg(null);
      api(Object.assign({ op: "pocSearch" }, params)).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => {
          setBusy(false);
          setErr(String((e && e.message) || e));
        },
      );
    };
    /* 첫 진입과 새로고침 키 변경 시 전량을 가져온다(검색은 명시적 동작이며, 타이핑 중에 인터페이스를 때리지 않게 한다) */
    React.useEffect(() => {
      query({
        q: undefined,
        kind: undefined,
        category: undefined,
        engagement: undefined,
        asset_target: undefined,
        verified: undefined,
      });
    }, [refreshKey]);

    const open = (id) => {
      if (openId === id) {
        setOpenId(null);
        setDetail(null);
        return;
      }
      setOpenId(id);
      setDetail(null);
      setDetailBusy(true);
      api({ op: "pocGet", id: id }).then(
        (r) => {
          setDetailBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "읽기 실패" });
            return;
          }
          setDetail(r);
        },
        (e) => {
          setDetailBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    /* 보고서 페이지와 같다: await 로 실제 결과를 받은 뒤 알린다 */
    const copy = (text, label) =>
      copyWithFeedback(text, label, (okFlag, message) => {
        setMsg(okFlag ? { ok: message } : { err: message });
      });
    const useIt = (row) => {
      api({ op: "pocUse", id: row.id, used_on: "콘솔에서 수동 표시" }).then(
        () => {
          setMsg({ ok: "재사용 1회 기록: " + row.title });
          query();
        },
        (e) => setMsg({ err: String((e && e.message) || e) }),
      );
    };

    const stats = (data && data.stats) || {
      total: 0,
      verified: 0,
      reused: 0,
      byKind: [],
      bySource: [],
    };
    const items = (data && data.items) || [];
    const tpl = (data && data.templates) || {
      dir: null,
      total: 0,
      matched: 0,
      offset: 0,
      items: [],
      byCategory: [],
    };
    const tplByCat = new Map(
      (tpl.byCategory || []).map((c) => [c.code, c.n || 0]),
    );
    const catShown = (c) => (c.n || 0) + (tplByCat.get(c.code) || 0);
    const tplItems = tpl.items || [];
    const tplMatched = tpl.matched != null ? tpl.matched : tpl.total;
    const tplStart = Number(tpl.offset) || 0;
    const turnTpl = (next) => {
      const offset = Math.max(0, next);
      setTplOffset(offset);
      query({ templateOffset: offset });
    };

    const card = (x) => {
      const isOpen = openId === x.id;
      const d = isOpen && detail && detail.id === x.id ? detail : null;
      return h(
        "div",
        { key: "p" + x.id, className: "rt-kb" + (isOpen ? " open" : "") },
        h(
          "div",
          {
            className: "rt-kb-head",
            role: "button",
            tabIndex: 0,
            "aria-expanded": isOpen ? "true" : "false",
            onClick: () => open(x.id),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open(x.id);
              }
            },
          },
          h("span", { className: "rt-sec-caret" }, isOpen ? "▾" : "▸"),
          h(
            "span",
            { className: "rt-kb-kind k-" + (x.kind || "poc") },
            POC_KIND_LABEL[x.kind] || x.kind || "POC",
          ),
          h("span", { className: "rt-kb-title" }, x.title),
          x.cve
            ? h("span", { className: "rt-tag rt-tag-passive" }, x.cve)
            : null,
          x.component ? h("span", { className: "rt-tag" }, x.component) : null,
          x.verified === 1
            ? h("span", { className: "rt-tag rt-tag-live" }, "검증됨")
            : h("span", { className: "rt-tag rt-tag-warn" }, "미검증"),
          h("div", { className: "rt-spacer" }),
          h(
            "span",
            { className: "rt-tag" },
            POC_SOURCE_LABEL[x.source] || x.source || "—",
          ),
          x.hit_count
            ? h("span", { className: "rt-tag" }, "재사용 " + x.hit_count)
            : null,
        ),
        /* 출처 행: 분류 · 영향 버전 · 등록 시각 · 출처 타깃 · 발견 자산 — 지식 하나가 "언제,
             어느 조직의 어느 자산에서 발견했는지" 한눈에 보인다 */
        h(
          "div",
          { className: "rt-kb-sub" },
          [
            x.category
              ? "분류 " + (POC_CAT_NAME[x.category] || x.category)
              : null,
            x.versions ? "영향 버전 " + x.versions : null,
            x.language || null,
            x.tags || null,
            "등록 시각 " + fmt(x.created_at),
            x.engagement_name || x.engagement_id
              ? "출처 타깃 " + (x.engagement_name || x.engagement_id)
              : null,
            x.asset_target ? "발견 자산 " + x.asset_target : null,
            x.found_by_agent
              ? "발견 역할 " +
                (ROLE_LABEL[x.found_by_agent] || x.found_by_agent)
              : null,
            x.source_url ? "출처 " + x.source_url : null,
          ]
            .filter(Boolean)
            .join(" · "),
        ),
        isOpen
          ? h(
              "div",
              { className: "rt-kb-body" },
              detailBusy && !d
                ? h("div", { className: "rt-empty" }, "불러오는 중…")
                : null,
              d
                ? h(
                    "div",
                    null,
                    d.usage
                      ? h(
                          "div",
                          { className: "rt-kv" },
                          h("b", null, "용법"),
                          h("span", { className: "rt-mono" }, d.usage),
                        )
                      : null,
                    d.description
                      ? h(
                          "div",
                          { className: "rt-kv" },
                          h("b", null, "설명"),
                          h("span", null, d.description),
                        )
                      : null,
                    d.verified_note
                      ? h(
                          "div",
                          { className: "rt-kv" },
                          h("b", null, "검증 증거"),
                          h("span", null, d.verified_note),
                        )
                      : null,
                    d.used_on
                      ? h(
                          "div",
                          { className: "rt-kv" },
                          h("b", null, "최근 사용"),
                          h("span", null, d.used_on),
                        )
                      : null,
                    d.path
                      ? h(
                          "div",
                          { className: "rt-kv" },
                          h("b", null, "저장 경로"),
                          h("span", { className: "rt-mono" }, d.path),
                        )
                      : null,
                    h(
                      "div",
                      { className: "rt-kb-actions" },
                      h(
                        "button",
                        {
                          className: "rt-btn",
                          disabled: !d.content,
                          onClick: () => copy(d.content || "", "POC 본문"),
                        },
                        "본문 복사",
                      ),
                      h(
                        "button",
                        { className: "rt-btn", onClick: () => useIt(x) },
                        "재사용 1회 기록",
                      ),
                      d.source_url
                        ? h(
                            "button",
                            {
                              className: "rt-btn",
                              onClick: () => copy(d.source_url, "출처 링크"),
                            },
                            "출처 복사",
                          )
                        : null,
                    ),
                    d.content
                      ? h(
                          "pre",
                          { className: "rt-rep-http" },
                          d.content.length > 12000
                            ? d.content.slice(0, 12000) +
                                "\n…(잘렸습니다. 전문은 저장된 파일을 보세요)"
                            : d.content,
                        )
                      : h(
                          "div",
                          { className: "rt-empty" },
                          "이 항목은 메타데이터만 있고 본문이 없습니다 — 본문을 얻은 뒤 redteam_poc_update 로 보강하세요",
                        ),
                  )
                : null,
            )
          : null,
      );
    };

    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "지식 베이스 · POC / EXP"),
        h("span", { className: "rt-tag" }, stats.total + "건"),
        h(
          "span",
          { className: "rt-tag rt-tag-live" },
          "검증됨 " + stats.verified,
        ),
        h(
          "span",
          { className: "rt-tag" },
          "누적 재사용 " + (stats.reused || 0),
        ),
        (stats.uncategorized || 0) > 0 &&
          (stats.uncategorized || 0) !== stats.total
          ? h(
              "span",
              {
                className: "rt-tag rt-tag-warn",
                title:
                  "아직 분류되지 않은 항목입니다: 에이전트가 되채울 때 redteam_poc_add 의 category 인자로 표시합니다",
              },
              "미분류 " + stats.uncategorized,
            )
          : null,
        tpl.total
          ? h(
              "span",
              { className: "rt-tag rt-tag-passive" },
              "이 PC 템플릿 " + tpl.total,
            )
          : null,
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          {
            className: "rt-btn" + (grouped ? " rt-btn-primary" : ""),
            title: "분류별 그룹 표시 / 개별 나열",
            onClick: () => setGrouped(!grouped),
          },
          grouped ? "분류별 그룹" : "개별 나열",
        ),
        h(
          "button",
          { className: "rt-btn", disabled: busy, onClick: () => query() },
          busy ? "검색 중…" : "새로고침",
        ),
      ),
      /* 분류 개요: 한 번 누르면 그 분류로 필터된다. 어떤 무기가 얼마나 쌓였고 어떤 분류가 비었는지 한눈에 본다 */
      h(
        "div",
        { className: "rt-kb-cats" },
        (stats.byCategory || [])
          .filter((c) => catShown(c) > 0 || POC_CAT_ORDER.includes(c.code))
          .map((c) =>
            h(
              "span",
              {
                key: c.code,
                className: "rt-concl-i" + (category === c.code ? " on" : ""),
                title:
                  (c.hint || POC_CAT_NAME[c.code] || c.code) +
                  " · 이 PC 템플릿 " +
                  (tplByCat.get(c.code) || 0) +
                  " · 지식 베이스 " +
                  (c.n || 0) +
                  (c.verified ? "(검증됨 " + c.verified + ")" : ""),
                onClick: () => {
                  const next = category === c.code ? "" : c.code;
                  setCategory(next);
                  query({ category: next || undefined });
                },
              },
              h("b", null, String(catShown(c))),
              h(
                "span",
                null,
                (POC_CAT_NAME[c.code] || c.code) +
                  (c.verified ? "(검증됨 " + c.verified + ")" : ""),
              ),
            ),
          ),
      ),
      h(
        "div",
        { className: "rt-kb-filter" },
        h("input", {
          className: "rt-input",
          style: { flex: 1, minWidth: 140 },
          placeholder: "CVE / 컴포넌트 / 키워드 검색(본문도 검색합니다)",
          value: q,
          onChange: (e) => setQ(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") query();
          },
        }),
        h(
          "select",
          {
            className: "rt-input",
            style: { maxWidth: 120 },
            value: category,
            onChange: (e) => {
              setCategory(e.target.value);
              query({ category: e.target.value || undefined });
            },
          },
          h("option", { value: "" }, "모든 분류"),
          POC_CAT_ORDER.map((k) =>
            h("option", { key: k, value: k }, POC_CAT_NAME[k]),
          ),
        ),
        h(
          "select",
          {
            className: "rt-input",
            style: { maxWidth: 120 },
            value: engagement,
            onChange: (e) => {
              setEngagement(e.target.value);
              query({ engagement: e.target.value || undefined });
            },
          },
          h("option", { value: "" }, "모든 출처 타깃"),
          (stats.byEngagement || []).map((e) =>
            h(
              "option",
              { key: e.engagement, value: e.engagement },
              e.engagement + "(" + e.n + ")",
            ),
          ),
        ),
        h("input", {
          className: "rt-input",
          style: { width: 120 },
          placeholder: "발견 자산 필터",
          value: assetTarget,
          onChange: (e) => setAssetTarget(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") query();
          },
        }),
        h(
          "select",
          {
            className: "rt-input",
            style: { maxWidth: 110 },
            value: kind,
            onChange: (e) => {
              setKind(e.target.value);
              query({ kind: e.target.value || undefined });
            },
          },
          h("option", { value: "" }, "모든 유형"),
          Object.keys(POC_KIND_LABEL).map((k) =>
            h("option", { key: k, value: k }, POC_KIND_LABEL[k]),
          ),
        ),
        h(
          "label",
          { className: "rt-kb-check" },
          h("input", {
            type: "checkbox",
            checked: verifiedOnly,
            onChange: (e) => {
              setVerifiedOnly(e.target.checked);
              query({ verified: e.target.checked || undefined });
            },
          }),
          "검증된 것만",
        ),
        h(
          "button",
          { className: "rt-btn rt-btn-primary", onClick: () => query() },
          "검색",
        ),
      ),
      msg
        ? h(
            "div",
            { className: msg.err ? "rt-err" : "rt-foot" },
            msg.err || msg.ok,
          )
        : null,
      err
        ? h(
            "div",
            { className: "rt-err" },
            /engagement required|unknown op/i.test(err)
              ? /* 옛 host 에는 지식 베이스 인터페이스가 없다: 복구 방법을 분명히 알려준다. "engagement required" 를 보고 헤매지 않게 한다 */
                "지식 베이스 인터페이스는 host 측이 제공합니다. 현재 호스트가 아직 옛 프로세스이므로 완전히 종료한 뒤 다시 실행하고(공식 exe / 커뮤니티판 / dsh web 중 아무거나), 페이지를 새로고침하세요."
              : err,
          )
        : null,
      !err && data && data.dbPath
        ? h(
            "div",
            { className: "rt-foot", style: { marginBottom: 6, fontSize: 11 } },
            "지식 베이스: " +
              data.dbPath +
              (data.root ? "(루트 디렉터리 " + data.root + ")" : ""),
          )
        : null,
      h(
        "div",
        { className: "rt-table" },
        (() => {
          if (!grouped) return items.map(card);
          /* 그룹 렌더링: 내장 분류 순서를 따르고, 알 수 없는 분류는 맨 끝의 “기타”에 붙인다 */
          const buckets = new Map();
          for (const x of items) {
            const code = POC_CAT_NAME[x.category] ? x.category : "other";
            if (!buckets.has(code)) buckets.set(code, []);
            buckets.get(code).push(x);
          }
          const order = POC_CAT_ORDER.filter((c) => buckets.has(c));
          for (const code of buckets.keys())
            if (!order.includes(code)) order.push(code);
          const out = [];
          for (const code of order) {
            const list = buckets.get(code);
            out.push(
              h(
                "div",
                { key: "g" + code, className: "rt-kb-cat" },
                h(
                  "span",
                  { className: "rt-kb-cat-name" },
                  POC_CAT_NAME[code] || code,
                ),
                h("span", { className: "rt-tag" }, list.length + "건"),
                h(
                  "span",
                  { className: "rt-tag rt-tag-live" },
                  "검증됨 " + list.filter((x) => x.verified === 1).length,
                ),
                h("span", { className: "rt-spacer" }),
                h(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      color: "var(--dsw-alias-label-secondary)",
                    },
                  },
                  "최근 등록 " +
                    fmt(
                      list
                        .map((x) => x.created_at)
                        .filter(Boolean)
                        .sort()
                        .pop(),
                    ),
                ),
              ),
            );
            for (const x of list) out.push(card(x));
          }
          return out;
        })(),
        tplItems.length
          ? h(
              "div",
              { className: "rt-kb-tpl" },
              h(
                "div",
                { className: "rt-ap-sub" },
                "이 PC nuclei 템플릿 · " +
                  (tplStart + 1) +
                  "–" +
                  (tplStart + tplItems.length) +
                  " / " +
                  tplMatched +
                  "(바로 `nuclei -t <템플릿 경로>`)",
              ),
              tplItems.map((t, i) =>
                h(
                  "div",
                  { key: "t" + tplStart + "-" + i, className: "rt-kb-tpl-row" },
                  h("span", { className: "rt-tag" }, t.severity || "—"),
                  t.category
                    ? h(
                        "span",
                        { className: "rt-tag" },
                        POC_CAT_NAME[t.category] || t.category,
                      )
                    : null,
                  h(
                    "span",
                    { className: "rt-mono rt-kb-tpl-path", title: t.path },
                    t.path,
                  ),
                  h(
                    "span",
                    { className: "rt-kb-tpl-name", title: t.name },
                    t.name || "",
                  ),
                  h(
                    "button",
                    {
                      className: "rt-btn",
                      style: { padding: "0 6px", fontSize: 10.5 },
                      onClick: () =>
                        copy(
                          "nuclei -t " + t.path + " -u <대상>",
                          "템플릿 명령",
                        ),
                    },
                    "명령 복사",
                  ),
                ),
              ),
              h(
                "div",
                { className: "rt-kb-actions" },
                h(
                  "button",
                  {
                    className: "rt-btn",
                    disabled: busy || tplStart <= 0,
                    onClick: () => turnTpl(tplStart - tplPageSize),
                  },
                  "이전 페이지",
                ),
                h(
                  "button",
                  {
                    className: "rt-btn",
                    disabled: busy || tplStart + tplItems.length >= tplMatched,
                    onClick: () => turnTpl(tplStart + tplPageSize),
                  },
                  "다음 페이지",
                ),
              ),
              tpl.dir
                ? h(
                    "div",
                    { className: "rt-foot" },
                    h("span", null, "템플릿 디렉터리: " + tpl.dir),
                  )
                : null,
            )
          : null,
        data === null
          ? h("div", { className: "rt-empty" }, "불러오는 중…")
          : null,
        data !== null && !items.length && !tplItems.length
          ? h(
              "div",
              { className: "rt-empty" },
              h(
                "div",
                null,
                q || kind || verifiedOnly
                  ? "적중 없음: 키워드를 바꿔 다시 시도하거나, 인터넷에서 찾거나 직접 만들어 되채우세요."
                  : tpl.total
                    ? "POC/EXP 라이브러리가 아직 비어 있습니다; 이 PC 에 nuclei 템플릿이 " +
                      tpl.total +
                      "개 있지만 이 페이지에는 나오지 않았습니다. 클라이언트를 완전히 종료한 뒤 다시 실행하세요."
                    : tpl.dir
                      ? "지식 베이스가 아직 비어 있습니다(이 PC 템플릿 디렉터리는 있지만 yaml 이 없습니다. nuclei -update-templates 를 실행하세요)."
                      : "지식 베이스가 아직 비어 있습니다. 이 PC 에도 nuclei 템플릿 라이브러리가 아직 없습니다 — 실습 머신에서 setup.sh 또는 `nuclei -update-templates` 를 실행하면 여기에 “이 PC 템플릿 N”이 나타납니다.",
              ),
              h(
                "div",
                { style: { marginTop: 6, fontSize: 12 } },
                "Nday/1day 를 공략하는 표준 순서: ① redteam_poc_search 로 여기를 먼저 조회합니다(이 PC nuclei 템플릿 라이브러리도 함께 검색합니다) → ② 없으면 인터넷 검색(web_search / GitHub / ExploitDB / 벤더 공지) 또는 직접 제작 → ③ 실제 대상에서 유효함을 확인한 뒤 redteam_poc_add 로 되채우면, 이후 타깃에서 바로 쓸 수 있습니다.",
              ),
              data.dbPath
                ? h(
                    "div",
                    {
                      style: { marginTop: 6, fontSize: 11 },
                      className: "rt-mono",
                    },
                    "지식 베이스 파일: " + data.dbPath,
                  )
                : null,
              tpl.dir
                ? h(
                    "div",
                    {
                      style: { marginTop: 6, fontSize: 11 },
                      className: "rt-mono",
                    },
                    "템플릿 디렉터리: " + tpl.dir,
                  )
                : null,
            )
          : null,
      ),
      h(
        "div",
        { className: "rt-foot" },
        h(
          "span",
          null,
          "전역 공유(타깃 간) | 저장 위치: pocs/<code>/ | 범용으로 재사용 가능한 POC/EXP 만 수록하고, 타깃 전용 스크립트는 “공격 파일”로 보냅니다",
        ),
      ),
    );
  }

  /* ---------------------------------------------------------- 환경 적응(Windows / 비 Kali) */
  /**
   * Z3r0 의 “시스템 설정” 발상을 참고한다: 경로와 키를 중앙 설정에 넣고, bash/ps1 에 기대지 않는다.
   * 저장 위치 $DSH_HOME/redteam/config.json — 사용자가 도구 절대 경로 또는 전체 검색 디렉터리를 채운다.
   */
  function EnvTab(props) {
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [draft, setDraft] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [msg, setMsg] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [folderPath, setFolderPath] = React.useState("");

    const applyDraftFrom = (r) => {
      const c = (r && r.config) || {};
      setDraft({
        platform: c.platform || "auto",
        toolkitDir: c.toolkitDir || "",
        nucleiTemplatesDir: c.nucleiTemplatesDir || "",
        binDirsText: (c.binDirs || []).join("\n"),
        tools: Object.assign({}, c.tools || {}),
        env: Object.assign(
          { FOFA_KEY: "", REDTEAM_VPS_HOST: "", REDTEAM_VPS_KEY: "" },
          c.env || {},
        ),
        notes: c.notes || "",
      });
      if (c.toolkitDir) setFolderPath(c.toolkitDir);
    };

    const load = () => {
      setBusy(true);
      setMsg(null);
      api({ op: "platformConfigGet" }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          setData(r);
          applyDraftFrom(r);
        },
        (e) => {
          setBusy(false);
          setErr(String((e && e.message) || e));
        },
      );
    };
    React.useEffect(load, [refreshKey]);

    const save = () => {
      if (!draft) return;
      setBusy(true);
      setMsg(null);
      const config = {
        platform: draft.platform,
        toolkitDir: draft.toolkitDir,
        nucleiTemplatesDir: draft.nucleiTemplatesDir,
        binDirs: String(draft.binDirsText || "")
          .split(/\r?\n/)
          .map((x) => x.trim())
          .filter(Boolean),
        tools: draft.tools,
        env: draft.env,
        notes: draft.notes,
        envAdaptConfigured: true,
        envAdaptSkip: false,
      };
      api({ op: "platformConfigSave", config }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "저장 실패" });
            return;
          }
          setData(r);
          setMsg({
            ok:
              "저장됨: " +
              ((r.config && r.config.path) || "$DSH_HOME/redteam/config.json"),
          });
          applyDraftFrom(r);
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    const assignFolder = () => {
      const dir = String(
        folderPath || (draft && draft.toolkitDir) || "",
      ).trim();
      if (!dir) {
        setMsg({ err: "도구가 있는 폴더 경로를 먼저 입력하세요" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({ op: "platformAssignToolkit", dir }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "자동 할당 실패" });
            return;
          }
          setData(r);
          applyDraftFrom(r);
          setMsg({
            ok:
              "폴더에서 " +
              (r.assignedCount || 0) +
              "개 도구를 할당했습니다" +
              (r.nucleiTemplatesDir
                ? ", nuclei-templates 도 인식했습니다"
                : ""),
          });
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    const setTool = (id, value) =>
      setDraft((d) =>
        d
          ? Object.assign({}, d, {
              tools: Object.assign({}, d.tools, { [id]: value }),
            })
          : d,
      );
    const setEnv = (key, value) =>
      setDraft((d) =>
        d
          ? Object.assign({}, d, {
              env: Object.assign({}, d.env, { [key]: value }),
            })
          : d,
      );

    const runtime = (data && data.runtime) || {};
    const adapt = (data && data.adapt) || {};
    const tools = (data && data.tools && data.tools.items) || [];
    const found = tools.filter((t) => t.path).length;
    const defaultToolkit =
      (data && data.toolkitDir) || "$DSH_HOME/redteam/toolkit";
    const defaultNuclei =
      (data && data.nucleiTemplatesDir) || defaultToolkit + "/nuclei-templates";

    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "환경 적응"),
        h(
          "span",
          { className: "rt-tag" },
          runtime.effective === "windows" ? "Windows" : "Linux/Kali",
        ),
        adapt.kali
          ? h("span", { className: "rt-tag rt-tag-live" }, "Kali")
          : null,
        h(
          "span",
          {
            className:
              "rt-tag" + (adapt.ready ? " rt-tag-live" : " rt-tag-warn"),
          },
          adapt.ready ? "준비됨 · " + (adapt.reason || "") : "설정 대기",
        ),
        h(
          "span",
          { className: "rt-tag" + (found ? " rt-tag-live" : " rt-tag-warn") },
          "도구 " + found + "/" + tools.length,
        ),
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "읽는 중…" : "새로고침",
        ),
        h(
          "button",
          {
            className: "rt-btn rt-btn-primary",
            disabled: busy || !draft,
            onClick: save,
          },
          "저장",
        ),
      ),
      h(
        "div",
        { className: "rt-pane", style: { minHeight: 0 } },
        err ? h("div", { className: "rt-err" }, err) : null,
        msg
          ? h(
              "div",
              { className: msg.err ? "rt-err" : "rt-foot" },
              msg.err || msg.ok,
            )
          : null,
        h(
          "div",
          {
            className: "rt-card",
            style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.6 },
          },
          adapt.message ||
            "모두 선택 사항입니다: 비워 두면 기본 경로/자동 탐색을 씁니다. 채우면 기본값을 덮어씁니다. 키는 자산 매핑/리버스 셸이 필요할 때만 채웁니다.",
        ),
        h(
          "div",
          {
            className: "rt-card",
            style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.6 },
          },
          h(
            "div",
            { style: { fontWeight: 600, marginBottom: 6 } },
            "전체 폴더 → 도구 자동 할당",
          ),
          h(
            "div",
            { style: { marginBottom: 8, opacity: 0.9 } },
            "도구가 모두 같은 폴더(하위 디렉터리 포함)에 있다면 경로를 채우고 “자동 할당”을 누르세요: toolkitDir 에 기록되고, 파일 이름으로 nmap / nuclei / fscan 등을 매칭해 아래에 채웁니다.",
          ),
          h(
            "div",
            { style: { display: "flex", gap: 8, alignItems: "center" } },
            h("input", {
              className: "rt-input",
              style: { flex: 1 },
              placeholder: "예: D:\\pentest-tools 또는 /opt/toolkit",
              value: folderPath,
              onChange: (e) => setFolderPath(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") assignFolder();
              },
            }),
            h(
              "button",
              {
                className: "rt-btn rt-btn-primary",
                disabled: busy,
                onClick: assignFolder,
              },
              busy ? "스캔 중…" : "자동 할당",
            ),
          ),
        ),
        data && data.hint
          ? h(
              "div",
              {
                className: "rt-card",
                style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.6 },
              },
              data.hint,
            )
          : null,
        data && data.egress
          ? h(
              "div",
              {
                className: "rt-card",
                style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.55 },
              },
              h(
                "div",
                { style: { fontWeight: 600, marginBottom: 6 } },
                "외부 통신 상태(Z3r0 egress 참고, 읽기 전용)",
              ),
              h(
                "div",
                { className: "rt-mono", style: { fontSize: 11 } },
                "HTTP_PROXY=" + (data.egress.http_proxy || "(비어 있음)"),
              ),
              h(
                "div",
                { className: "rt-mono", style: { fontSize: 11 } },
                "HTTPS_PROXY=" + (data.egress.https_proxy || "(비어 있음)"),
              ),
              h(
                "div",
                { className: "rt-mono", style: { fontSize: 11 } },
                "ALL_PROXY=" + (data.egress.all_proxy || "(비어 있음)"),
              ),
              h(
                "div",
                { className: "rt-mono", style: { fontSize: 11 } },
                "NO_PROXY=" + (data.egress.no_proxy || "(비어 있음)"),
              ),
              h(
                "div",
                { style: { marginTop: 6, opacity: 0.85 } },
                data.egress.note || "",
              ),
            )
          : null,
        !draft
          ? h("div", { className: "rt-empty" }, "불러오는 중…")
          : h(
              "div",
              null,
              h(
                "div",
                { className: "rt-card" },
                h("h4", null, "플랫폼과 디렉터리"),
                h(
                  "div",
                  { style: { display: "grid", gap: 8 } },
                  h(
                    "label",
                    { style: { fontSize: 12 } },
                    "플랫폼 모드",
                    h(
                      "select",
                      {
                        className: "rt-input",
                        style: {
                          display: "block",
                          width: "100%",
                          marginTop: 4,
                        },
                        value: draft.platform,
                        onChange: (e) =>
                          setDraft(
                            Object.assign({}, draft, {
                              platform: e.target.value,
                            }),
                          ),
                      },
                      h(
                        "option",
                        { value: "auto" },
                        "auto(이 PC 를 따름, 기본)",
                      ),
                      h("option", { value: "windows" }, "windows"),
                      h("option", { value: "linux" }, "linux"),
                    ),
                  ),
                  h(
                    "label",
                    { style: { fontSize: 12 } },
                    "툴킷 디렉터리 toolkitDir(비우면 기본값)",
                    h("input", {
                      className: "rt-input",
                      style: { display: "block", width: "100%", marginTop: 4 },
                      placeholder: "기본: " + defaultToolkit,
                      value: draft.toolkitDir,
                      onChange: (e) =>
                        setDraft(
                          Object.assign({}, draft, {
                            toolkitDir: e.target.value,
                          }),
                        ),
                    }),
                  ),
                  h(
                    "label",
                    { style: { fontSize: 12 } },
                    "nuclei 템플릿 디렉터리(비우면 자동: toolkit/nuclei-templates)",
                    h("input", {
                      className: "rt-input",
                      style: { display: "block", width: "100%", marginTop: 4 },
                      placeholder: "기본: " + defaultNuclei,
                      value: draft.nucleiTemplatesDir,
                      onChange: (e) =>
                        setDraft(
                          Object.assign({}, draft, {
                            nucleiTemplatesDir: e.target.value,
                          }),
                        ),
                    }),
                  ),
                  h(
                    "label",
                    { style: { fontSize: 12 } },
                    "도구 검색 디렉터리 binDirs(비우면 toolkit + PATH 만 검색, 한 줄에 하나)",
                    h("textarea", {
                      className: "rt-input",
                      rows: 4,
                      style: {
                        display: "block",
                        width: "100%",
                        marginTop: 4,
                        fontFamily: "var(--dsw-font-mono, monospace)",
                      },
                      placeholder:
                        "선택 사항. 예: " +
                        String.fromCharCode(10) +
                        "D:\\tools" +
                        String.fromCharCode(10) +
                        "D:\\pentest-bin",
                      value: draft.binDirsText,
                      onChange: (e) =>
                        setDraft(
                          Object.assign({}, draft, {
                            binDirsText: e.target.value,
                          }),
                        ),
                    }),
                  ),
                ),
              ),
              h(
                "div",
                { className: "rt-card" },
                h(
                  "h4",
                  null,
                  "키와 VPS(비우면 덮어쓰지 않습니다, 프로세스 환경 변수 우선)",
                ),
                h(
                  "div",
                  { style: { display: "grid", gap: 8 } },
                  ["FOFA_KEY", "REDTEAM_VPS_HOST", "REDTEAM_VPS_KEY"].map((k) =>
                    h(
                      "label",
                      { key: k, style: { fontSize: 12 } },
                      k + "(선택)",
                      h("input", {
                        className: "rt-input",
                        style: {
                          display: "block",
                          width: "100%",
                          marginTop: 4,
                        },
                        type: k === "FOFA_KEY" ? "password" : "text",
                        placeholder:
                          k === "REDTEAM_VPS_KEY"
                            ? "비워 두세요; 필요할 때 개인 키 절대 경로를 채우세요"
                            : k === "REDTEAM_VPS_HOST"
                              ? "비워 두세요; 필요할 때 user@host 를 채우세요"
                              : "비워 두세요; 자산 매핑 때 채우세요",
                        value: (draft.env && draft.env[k]) || "",
                        onChange: (e) => setEnv(k, e.target.value),
                      }),
                    ),
                  ),
                ),
              ),
              h(
                "div",
                { className: "rt-card" },
                h("h4", null, "도구 실행 파일(비우면 자동 탐색)"),
                h(
                  "div",
                  {
                    style: {
                      fontSize: 11.5,
                      color: "var(--dsw-alias-label-secondary)",
                      marginBottom: 8,
                    },
                  },
                  "탐색 순서: 이 표의 절대 경로 → toolkitDir → binDirs → PATH. 비우면 기본 탐색을 씁니다.",
                ),
                tools.map((t) =>
                  h(
                    "div",
                    { key: t.id, style: { marginBottom: 8 } },
                    h(
                      "div",
                      {
                        style: {
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 4,
                        },
                      },
                      h(
                        "span",
                        { style: { fontWeight: 600, minWidth: 88 } },
                        t.label || t.id,
                      ),
                      t.path
                        ? h(
                            "span",
                            { className: "rt-tag rt-tag-live", title: t.path },
                            t.source + " · 찾음",
                          )
                        : h(
                            "span",
                            { className: "rt-tag rt-tag-warn" },
                            "찾지 못함(비워 두고 설치를 기다려도 됩니다)",
                          ),
                    ),
                    h("input", {
                      className: "rt-input",
                      style: { width: "100%" },
                      placeholder:
                        "비우면 자동 탐색: " +
                        (t.names || []).slice(0, 3).join(" / "),
                      value: (draft.tools && draft.tools[t.id]) || "",
                      onChange: (e) => setTool(t.id, e.target.value),
                    }),
                    t.path
                      ? h(
                          "div",
                          {
                            className: "rt-mono",
                            style: {
                              fontSize: 10.5,
                              marginTop: 2,
                              opacity: 0.8,
                            },
                          },
                          t.path,
                        )
                      : null,
                  ),
                ),
              ),
              h(
                "div",
                { className: "rt-card" },
                h("h4", null, "비고"),
                h("textarea", {
                  className: "rt-input",
                  rows: 3,
                  style: { width: "100%" },
                  placeholder:
                    "선택 사항. 예: 도구는 ○○ 포터블 패키지에서 가져옴",
                  value: draft.notes,
                  onChange: (e) =>
                    setDraft(
                      Object.assign({}, draft, { notes: e.target.value }),
                    ),
                }),
              ),
              h(
                "div",
                { className: "rt-foot" },
                h(
                  "span",
                  null,
                  "설정 파일: " +
                    ((data && data.config && data.config.path) ||
                      "$DSH_HOME/redteam/config.json") +
                    " | 비운 필드는 모두 기본값을 씁니다",
                ),
              ),
            ),
      ),
    );
  }

  /* ---------------------------------------------------------- 득점 목표 */
  function ScoreTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [openId, setOpenId] = React.useState(null);
    const [form, setForm] = React.useState(null);
    const [msg, setMsg] = React.useState(null);

    const load = () => {
      if (!eng) return;
      setBusy(true);
      api({ op: "scores", engagement: eng }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => {
          setBusy(false);
          setErr(String((e && e.message) || e));
        },
      );
    };
    React.useEffect(load, [eng, refreshKey]);

    /* builtin 은 폼까지 들고 간다: 내장 득점 항목의 점수/이름/집계 기준은 “득점 규칙”이 고정하며,
         화면은 입력란을 회색 처리하고 이유를 설명해야 한다 — 예전에는 "바꿀 수 있다고 표시하고 저장됨을 알린 뒤 새로고침하면 되돌아가는" 동작이라
         사용자가 버그로 오해했다. */
    const startEdit = (p) =>
      setForm({
        id: p.id,
        name: p.name,
        category: p.category || "",
        points: p.points,
        description: p.description || "",
        enabled: p.enabled,
        builtin: p.builtin === true,
        src: p.src,
        cap: p.cap,
        rule: p.rule,
      });
    const startNew = () => {
      setForm({
        name: "",
        category: "",
        points: 10,
        description: "",
        enabled: true,
        builtin: false,
      });
      setMsg(null);
    };
    const setField = (k, v) => setForm((f) => Object.assign({}, f, { [k]: v }));

    const save = () => {
      if (!form || !form.name) {
        setMsg({ err: "이름은 비울 수 없습니다" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({ op: "saveScorePoint", engagement: eng, point: form }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "저장 실패" });
            return;
          }
          /* overridden === false 는 백엔드가 제출된 점수를 **반영하지 않았다**는 뜻이다(내장 항목은 규칙이 고정).
             이때 "저장됨" 이라고 뭉뚱그리면 사용자가 점수 변경에 성공한 것으로 오해한다. */
          if (r.overridden === false) {
            setMsg({
              err:
                "“활성/비활성”만 저장했습니다. 점수는 바뀌지 않았습니다: “득점 규칙”과 함께 배포되는 내장 득점 항목이라, " +
                "점수 / 상한 / 집계 기준을 규칙이 고정합니다(같은 규칙의 상한은 그룹 내 모든 득점 항목을 합산하므로, " +
                "점수 하나만 바꾸면 적중 한 건이 그룹 상한을 다 먹어 버립니다). 점수를 따로 정하려면 “+ 득점 항목 추가”를 쓰세요.",
            });
          } else {
            setMsg({ ok: r.note || "저장됨" });
          }
          setForm(null);
          load();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };
    const remove = () => {
      if (!form || !form.id) {
        setForm(null);
        return;
      }
      setBusy(true);
      setMsg(null);
      api({ op: "deleteScorePoint", engagement: eng, id: form.id }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "삭제 실패" });
            return;
          }
          setMsg({ ok: "삭제됨" });
          setForm(null);
          setOpenId(null);
          load();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    const summary = (data && data.summary) || {
      achievedPoints: 0,
      pointCount: 0,
      hitPointCount: 0,
      hitCount: 0,
      selfCreatedHits: 0,
      serviceCappedHits: 0,
    };
    const items = (data && data.items) || [];

    /* 병합판의 8개 분류로 묶어 렌더링한다(백엔드 ruleGroups 는 이미 정렬되어 있고, 그룹 안은 점수 오름차순).
         호환: 백엔드가 ruleGroups 를 주지 않으면(옛 host) 개별 나열로 되돌린다. */
    const groups =
      data && data.ruleGroups && data.ruleGroups.length
        ? data.ruleGroups
        : [
            {
              key: "all",
              name: "",
              capSum: 0,
              points: 0,
              counted: 0,
              tiers: items,
            },
          ];
    const rows = [];
    for (const g of groups) {
      if (g.name) {
        rows.push(
          h(
            "div",
            { key: "g-" + g.key, className: "rt-score-group" },
            h("span", null, g.name),
            h(
              "span",
              { className: "rt-sg-sub" },
              g.tiers.length +
                "개" +
                (g.capSum > 0
                  ? " · 항목별 상한 합계 " +
                    g.capSum +
                    "점(항목별로 독립이며 항목 간 누적 없음)"
                  : ""),
            ),
            h("div", { className: "rt-spacer" }),
            g.points > 0
              ? h(
                  "span",
                  { className: "rt-tag rt-tag-active" },
                  "+" + g.points + "점",
                )
              : null,
          ),
        );
      }
      for (const p of g.tiers) {
        const achieved = p.hits.length > 0;
        const open = openId === p.id;
        rows.push(
          h(
            "div",
            {
              key: "sp" + p.id,
              className: "rt-score-row",
              role: "button",
              tabIndex: 0,
              onClick: () => setOpenId(open ? null : p.id),
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId(open ? null : p.id);
                }
              },
            },
            h("span", { className: "rt-sec-caret" }, open ? "▾" : "▸"),
            h(
              "span",
              null,
              h(
                "span",
                {
                  className: achieved
                    ? "rt-pri rt-pri-high"
                    : "rt-pri rt-pri-low",
                  style: achieved
                    ? {}
                    : {
                        background: "var(--dsw-alias-bg-layer-2)",
                        color: "var(--dsw-alias-label-secondary)",
                      },
                },
                p.points + "점",
              ),
            ),
            h(
              "span",
              { title: p.description || "" },
              p.name,
              p.tier
                ? h("span", { className: "rt-scope" }, " " + p.tier)
                : null,
            ),
            /* 적중과 상한: 이 항목이 몇 번 집계되었고 상한을 얼마나 썼는지(G3 항목별 상한은 독립이며, 상한에 닿으면 더 누적하지 않는다) */
            h(
              "span",
              {
                title:
                  p.capped > 0
                    ? "총 " +
                      p.counted +
                      "회 집계되었고, 그 밖에 " +
                      p.capped +
                      "건은 “" +
                      (p.scope_label || "집계 기준") +
                      "” 또는 상한 도달로 미집계"
                    : p.scope_label || "",
              },
              h(
                "span",
                { className: "rt-sec-count" },
                p.hits.length > 0 ? p.counted + "회 적중" : "적중 없음",
              ),
              p.cap > 0
                ? h(
                    "span",
                    { className: "rt-scope" },
                    " 상한 " +
                      (p.cap_used === null ? 0 : p.cap_used) +
                      "/" +
                      p.cap,
                  )
                : null,
            ),
            h(
              "span",
              { style: { textAlign: "right" } },
              p.earned > 0
                ? h(
                    "span",
                    { className: "rt-tag rt-tag-active" },
                    "+" + p.earned + "점",
                  )
                : h(
                    "span",
                    { style: { color: "var(--dsw-alias-label-secondary)" } },
                    "—",
                  ),
            ),
          ),
        );
        if (!open) continue;
        /* 적중 기록: 한 줄에 하나 — 첫 줄은 "번호 + 자산 + 시각 + 복사", 내용은 다음 줄에 자동 줄바꿈으로 둔다 */
        const hitNodes = p.hits.map((hh, hi) =>
          h(
            "div",
            {
              key: "h" + hh.id,
              className:
                "rt-hit-row" +
                (hh.self_created ? " self-created" : "") +
                (hh.capped ? " service-capped" : ""),
            },
            h("span", { className: "rt-hit-idx" }, String(hi + 1)),
            h(
              "span",
              {
                className: "rt-hit-asset",
                title: hh.target || hh.asset_ip || "",
              },
              hh.asset_ip || hh.target || "자산 미지정",
            ),
            hh.self_created
              ? h(
                  "span",
                  {
                    className: "rt-tag rt-tag-warn",
                    title:
                      "직접 등록/자체 생성한 계정은 득점 권한으로 치지 않고 과정 기록으로만 남깁니다",
                  },
                  "자체 생성 · 미집계",
                )
              : null,
            hh.capped
              ? h(
                  "span",
                  {
                    className: "rt-tag rt-tag-warn",
                    title:
                      hh.capped_reason ||
                      "같은 자산·같은 포트에서는 점수가 가장 높은 한 건만 인정하며, 이 건은 미집계입니다",
                  },
                  "서비스 상한 도달 · 미집계" +
                    (hh.service ? "(" + hh.service + ")" : ""),
                )
              : null,
            hh.shot_count
              ? h(
                  "span",
                  {
                    className: "rt-tag",
                    title:
                      "이 적중에는 증거 스크린샷이 있습니다(득점 항목을 펼치면 대표 이미지가 보입니다)",
                  },
                  "이미지 " + hh.shot_count,
                )
              : null,
            h("span", { className: "rt-hit-time" }, fmt(hh.recorded_at)),
            h(
              "button",
              {
                className: "rt-btn",
                style: { padding: "0 5px", fontSize: 10.5 },
                title: "이 건 복사",
                onClick: (e) => {
                  e.stopPropagation();
                  copyText(
                    (hh.asset_ip || hh.target || "") +
                      "  " +
                      (hh.evidence || ""),
                  );
                },
              },
              "복사",
            ),
            hh.evidence
              ? h(
                  "span",
                  { className: "rt-hit-txt", title: hh.evidence },
                  String(hh.evidence).replace(/\n+/g, " "),
                )
              : h(
                  "span",
                  { className: "rt-hit-txt none" },
                  "계정/비밀번호 또는 결과 미기재",
                ),
          ),
        );
        rows.push(
          h(
            "div",
            {
              key: "spd" + p.id,
              className: "rt-score-row",
              style: { cursor: "default", gridTemplateColumns: "1fr" },
            },
            h(
              "div",
              { className: "rt-score-detail" },
              p.description
                ? h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "득점 조건"),
                    h("span", null, p.description),
                  )
                : null,
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "상태"),
                h(
                  "span",
                  null,
                  (p.enabled ? "활성" : "비활성") +
                    " · " +
                    p.points +
                    "점/회 · 적중 " +
                    p.hits.length +
                    "회 = " +
                    p.earned +
                    "점" +
                    (p.self_created
                      ? "(그 밖에 자체 생성 " + p.self_created + "회는 미집계)"
                      : "") +
                    (p.capped
                      ? "(그 밖에 같은 서비스 중복 적중 " +
                        p.capped +
                        "회는 미집계)"
                      : ""),
                ),
              ),
              p.capped
                ? h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "서비스 상한"),
                    h(
                      "span",
                      null,
                      p.service_summary +
                        "; 계정 권한과 데이터베이스 권한은 “같은 자산·같은 포트” 기준으로 한 번만 인정하며, 최고 권한 계정을 얻은 시점에 그 서비스는 상한 도달입니다",
                    ),
                  )
                : null,
              p.hits.length
                ? h(
                    "div",
                    null,
                    h(ShotStrip, {
                      eng: eng,
                      shots: p.shots,
                      total: p.shot_total,
                      title:
                        "증거 스크린샷 · " +
                        (p.shot_total || (p.shots || []).length) +
                        "장",
                    }),
                    h(
                      "div",
                      {
                        className: "rt-section",
                        style: { padding: "6px 0 0" },
                      },
                      "적중 기록 · " +
                        p.hits.length +
                        "(자산과 계정/비밀번호만 기록하며, 상세 재현은 보고서에서 봅니다)",
                    ),
                    h("div", { className: "rt-hits" }, hitNodes),
                  )
                : h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "적중 기록"),
                    h(
                      "span",
                      { style: { color: "var(--dsw-alias-label-secondary)" } },
                      "아직 없습니다 — 성과를 얻은 뒤 redteam_score_hit 로 득점을 기록하세요: 대상 자산 + 얻은 계정/비밀번호 또는 권한을 적으세요",
                    ),
                  ),
              h(
                "div",
                { className: "rt-actions" },
                h(
                  "button",
                  {
                    className: "rt-btn",
                    onClick: (e) => {
                      e.stopPropagation();
                      startEdit(p);
                    },
                  },
                  "편집",
                ),
              ),
            ),
          ),
        );
      }
    }

    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "득점 목표"),
        /* 얻은 총점만 표시하고, 목표 점수나 진행 막대는 표시하지 않는다 */
        h(
          "span",
          {
            style: {
              fontSize: 13,
              color: "var(--dsw-alias-label-secondary)",
              marginLeft: 4,
            },
          },
          "총점",
        ),
        h("span", { className: "rt-total" }, String(summary.achievedPoints)),
        h(
          "span",
          {
            style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" },
          },
          "점",
        ),
        h("span", { className: "rt-tag" }, summary.pointCount + "개 득점 항목"),
        h(
          "span",
          { className: "rt-tag" },
          "적중 " + summary.countedHits + "회",
        ),
        summary.selfCreatedHits
          ? h(
              "span",
              {
                className: "rt-tag rt-tag-warn",
                title:
                  "직접 등록/직접 생성한 계정은 득점 권한으로 치지 않고 과정 기록으로만 남깁니다(미집계, 상한 미소모, 보고서 미포함)",
              },
              "자체 생성 미집계 " + summary.selfCreatedHits,
            )
          : null,
        summary.serviceCappedHits
          ? h(
              "span",
              {
                className: "rt-tag rt-tag-warn",
                title:
                  "계정 권한과 데이터베이스 권한은 “같은 자산·같은 포트” 기준으로 한 번만 인정합니다: 해당 서비스는 이미 상한 도달이며 이 중복 적중은 미집계입니다(흔적만 남깁니다)",
              },
              "서비스 상한 도달 미집계 " + summary.serviceCappedHits,
            )
          : null,
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          { className: "rt-btn", onClick: startNew },
          "+ 득점 항목 추가",
        ),
        h(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "새로고침 중…" : "새로고침",
        ),
      ),
      msg
        ? h(
            "div",
            { className: msg.err ? "rt-err" : "rt-foot" },
            msg.err || msg.ok,
          )
        : null,
      err ? h("div", { className: "rt-err" }, err) : null,
      form
        ? h(
            "div",
            {
              className: "rt-pane",
              style: {
                flex: "none",
                borderBottom: "1px solid var(--dsw-alias-border-l1)",
              },
            },
            /* 내장 득점 항목(builtin): 점수 / 이름 / 분류는 “득점 규칙”이 고정하므로 입력란을 회색 처리한다.
              바꿀 수 있는 것은 “활성 / 비활성”뿐이다. 이렇게 하면 "수정 후 저장됨 안내가 뜨고 새로고침하면 되돌아가는" 혼란이 생기지 않는다. */
            form.builtin
              ? h(
                  "div",
                  { className: "rt-hint", style: { marginBottom: 8 } },
                  h(
                    "b",
                    null,
                    "내장 득점 항목(“돌파 침투류 득점 규칙(병합판)”에서 옴)",
                  ),
                  h(
                    "div",
                    { style: { marginTop: 3 } },
                    "점수, 상한, 집계 기준, 이름을 규칙이 고정합니다 — 같은 규칙의 상한은 그룹 내 모든 득점 항목을 합산하므로, " +
                      "점수 하나만 바꾸면 적중 한 건이 그룹 상한을 다 먹어 버립니다. 여기서 바꿀 수 있는 것은 “활성 / 비활성”이며, " +
                      "점수를 따로 정하려면 이전 화면으로 돌아가 “+ 득점 항목 추가”를 누르세요.",
                  ),
                  form.src !== null && form.src !== undefined
                    ? h(
                        "div",
                        {
                          style: {
                            marginTop: 3,
                            color: "var(--dsw-alias-label-secondary)",
                          },
                        },
                        "규칙 원문 번호 " +
                          form.src +
                          (form.rule ? " · 상한 그룹 rule=" + form.rule : "") +
                          (form.cap > 0
                            ? " · 상한 " + form.cap + "점"
                            : " · 상한 없음"),
                      )
                    : null,
                )
              : null,
            h(
              "div",
              { className: "rt-score-form" },
              h("input", {
                className: "rt-input",
                placeholder: "이름(필수)",
                value: form.name,
                readOnly: form.builtin === true,
                title: form.builtin
                  ? "내장 득점 항목의 이름은 규칙이 고정합니다"
                  : "",
                onChange: (e) => setField("name", e.target.value),
              }),
              h("input", {
                className: "rt-input",
                placeholder: "분류, 예: 계정 권한",
                value: form.category,
                readOnly: form.builtin === true,
                title: form.builtin
                  ? "내장 득점 항목의 분류는 규칙이 고정합니다(패널에서 어느 그룹에 속하는지를 결정합니다)"
                  : "",
                onChange: (e) => setField("category", e.target.value),
              }),
              h("input", {
                className: "rt-input",
                type: "number",
                placeholder: "1회 점수",
                readOnly: form.builtin === true,
                title: form.builtin
                  ? "내장 득점 항목의 점수는 “득점 규칙”이 고정하므로 여기서 바꿀 수 없습니다"
                  : "이 분류의 1회 점수; 적중할 때마다 이 점수만큼 누적됩니다(해당 규칙 상한의 제약을 받습니다)",
                value: form.points,
                onChange: (e) => setField("points", Number(e.target.value)),
              }),
              h(
                "select",
                {
                  className: "rt-input",
                  value: form.enabled ? "1" : "0",
                  onChange: (e) => setField("enabled", e.target.value === "1"),
                },
                h("option", { value: "1" }, "활성"),
                h("option", { value: "0" }, "비활성"),
              ),
            ),
            h("input", {
              className: "rt-input",
              style: {
                width: "100%",
                marginBottom: 6,
                boxSizing: "border-box",
              },
              placeholder: "득점 조건 설명",
              value: form.description,
              readOnly: form.builtin === true,
              title: form.builtin
                ? "내장 득점 항목의 조항 본문은 규칙이 고정합니다"
                : "",
              onChange: (e) => setField("description", e.target.value),
            }),
            h(
              "div",
              { className: "rt-actions" },
              h(
                "button",
                {
                  className: "rt-btn rt-btn-primary",
                  disabled: busy,
                  onClick: save,
                },
                "저장",
              ),
              form.id
                ? form.builtin
                  ? h(
                      "button",
                      {
                        className: "rt-btn",
                        disabled: true,
                        title:
                          "내장 득점 항목은 삭제할 수 없습니다: 지우면 패널에서 규칙이 하나 빠지고 보고서에서 성과 한 분류가 사라집니다(다음 시작 시 자동으로 되돌아옵니다). 집계에서 빼려면 “비활성”을 쓰세요.",
                      },
                      "삭제(내장 항목은 삭제 불가)",
                    )
                  : h(
                      "button",
                      { className: "rt-btn", disabled: busy, onClick: remove },
                      "삭제",
                    )
                : null,
              h(
                "button",
                { className: "rt-btn", onClick: () => setForm(null) },
                "취소",
              ),
            ),
          )
        : null,
      h(
        "div",
        { className: "rt-table" },
        h(
          "div",
          { className: "rt-score-row head" },
          h("span", null, ""),
          h("span", null, "점수"),
          h("span", null, "득점 항목(점수 낮은 순)"),
          h("span", null, "적중 / 상한"),
          h("span", { style: { textAlign: "right" } }, "획득 점수"),
        ),
        rows,
        !items.length
          ? h(
              "div",
              { className: "rt-empty" },
              "득점 항목이 없습니다. 오른쪽 위 “+ 득점 항목 추가”를 누르세요",
            )
          : null,
      ),
    );
  }

  /* ---------------------------------------------------------- 접힘 기반 */
  /**
   * 접힘 상태는 “탭 + 타깃” 단위로 localStorage 에 저장되어, 탭을 바꾸거나 새로고침해도 유지된다.
   * 사용자가 직접 누른 키만 기록하고, 누르지 않은 키는 호출 측이 준 기본값을 쓴다.
   */
  const COLLAPSE_KEY = "rt-collapse:";
  const collapseLoad = (prefix) => {
    try {
      const raw = window.localStorage.getItem(COLLAPSE_KEY + prefix);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  };
  const collapseSave = (prefix, value) => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY + prefix, JSON.stringify(value));
    } catch (e) {
      /* 프라이빗 모드 등 */
    }
  };

  /** 탭 하나에 hook 하나: isOpen(key, defaultOpen) / toggle(key, defaultOpen) / setAll(keys, open) */
  function useCollapse(prefix) {
    const [state, setState] = React.useState(() => collapseLoad(prefix));
    React.useEffect(() => {
      setState(collapseLoad(prefix));
    }, [prefix]);
    const write = (next) => {
      collapseSave(prefix, next);
      setState(next);
    };
    const isOpen = (key, defaultOpen) => {
      const v = state[key];
      return v === undefined ? defaultOpen !== false : v === true;
    };
    const toggle = (key, defaultOpen) => (e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      write(Object.assign({}, state, { [key]: !isOpen(key, defaultOpen) }));
    };
    const setAll = (keys, open) => {
      const next = Object.assign({}, state);
      for (const k of keys) next[k] = open;
      write(next);
    };
    return { isOpen: isOpen, toggle: toggle, setAll: setAll };
  }

  /**
   * 공통 접힘 헤더(L1): ▾ 는 항상 맨 왼쪽, 제목은 굵게, 개수는 바로 뒤에, 오른쪽에는 시각이나 동작을 둔다,
   * 내용은 12px 들여쓰기와 세로 안내선을 준다. always=true 는 "항상 표시"(접기 불가)를 뜻한다.
   */
  function Section(props) {
    const always = props.always === true;
    const open = always || props.open === true;
    const head = h(
      "div",
      {
        className:
          "rt-sec t-" + (props.tone || "target") + (always ? " flat" : ""),
        role: always ? undefined : "button",
        tabIndex: always ? undefined : 0,
        "aria-expanded": always ? undefined : open ? "true" : "false",
        onClick: always ? undefined : props.onToggle,
        onKeyDown: always
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (props.onToggle) props.onToggle(e);
              }
            },
      },
      h("span", { className: "rt-sec-caret" }, always ? "▍" : open ? "▾" : "▸"),
      props.title
        ? h("span", { className: "rt-sec-title" }, props.title)
        : null,
      props.count !== undefined && props.count !== null
        ? h("span", { className: "rt-sec-count" }, String(props.count))
        : null,
      props.sub ? h("span", { className: "rt-sec-sub" }, props.sub) : null,
      props.right
        ? h("span", { className: "rt-sec-right" }, props.right)
        : null,
    );
    return h(
      "div",
      { className: "rt-sec-wrap" },
      head,
      open && props.children
        ? h("div", { className: "rt-sec-body" }, props.children)
        : null,
    );
  }

  /** 긴 텍스트 접기(L3): 고정 미리보기 높이 + 페이드 + 펼치기/복사. */
  function Clip(props) {
    const [open, setOpen] = React.useState(false);
    const text = String(
      props.text === undefined || props.text === null ? "" : props.text,
    );
    if (text.trim() === "") return null;
    return h(
      "div",
      { className: "rt-clip" + (open ? " open" : "") },
      h(
        "div",
        { className: "rt-clip-head" },
        props.label
          ? h("span", { className: "rt-clip-label" }, props.label)
          : null,
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          {
            className: "rt-btn",
            style: { padding: "0 6px", fontSize: 11 },
            onClick: (e) => {
              e.stopPropagation();
              copyText(text);
            },
          },
          "복사",
        ),
        h(
          "button",
          {
            className: "rt-btn",
            style: { padding: "0 6px", fontSize: 11 },
            onClick: (e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            },
          },
          open ? "접기" : "펼치기",
        ),
      ),
      h("div", { className: "rt-clip-body" }, text),
    );
  }

  /* ---------------------------------------------------------- 현재 테스트(실시간) */
  const TEST_STATUS_LABEL = {
    untested: "미테스트",
    testing: "테스트 중",
    tested: "테스트 완료",
    blocked: "차단됨",
    abandoned: "포기",
    no_surface: "공격 표면 없음",
  };

  /**
   * 현재 테스트 화면: 에이전트가 어느 자산을 치고 있고, 어디까지 진행했고, 무엇이 대기 중인지.
   * 5초 폴링으로 자동 새로고침하며, 세 블록은 접을 수 있고 그중 “테스트 중”은 항상 완전히 펼친다.
   */
  function TestingTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [at, setAt] = React.useState(null);
    const [auto, setAuto] = React.useState(true);
    /* 접힘 상태는 “탭 + 타깃” 단위로 기억한다; 테스트 중은 항상 표시이며 접힘에 참여하지 않는다 */
    const collapse = useCollapse("testing:" + eng);

    /* 5초 폴링에는 진행 중 가드가 필요하다: 네트워크가 느리거나 백엔드가 멈추면 요청이 쌓이고,
          늦게 온 응답이 새 상태를 덮어쓴다(화면에서 숫자가 오르내리는 것으로 보인다). */
    const inflight = React.useRef(false);
    const seq = React.useRef(0);
    const load = () => {
      if (!eng || inflight.current) return;
      inflight.current = true;
      const my = ++seq.current;
      api({ op: "activeTests", engagement: eng, limit: 20 })
        .then(
          (r) => {
            if (my !== seq.current)
              return; /* 타깃이 바뀌었다: 이 응답은 이미 만료되었으므로 버린다 */
            if (!r || r.ok === false) {
              setErr((r && r.error) || "읽기 실패");
              return;
            }
            setErr(null);
            setData(r);
            setAt(new Date());
          },
          (e) => {
            if (my === seq.current) setErr(String((e && e.message) || e));
          },
        )
        .finally(() => {
          if (my === seq.current) inflight.current = false;
        });
    };
    React.useEffect(() => {
      seq.current += 1;
      load();
    }, [eng, refreshKey]);
    React.useEffect(() => {
      if (!eng || !auto) return undefined;
      const timer = setInterval(load, 5000);
      return () => clearInterval(timer);
    }, [eng, auto, refreshKey]);

    const testing = (data && data.testing) || [];
    const recent = (data && data.recent) || [];
    const queue = (data && data.queue) || [];
    const stats = (data && data.stats) || {};

    /* 자산 하나에 카드 하나: "누구를 치고 있고, 어디까지 갔고, 무엇을 얻었는지" 한눈에 본다 */
    const card = (a, past) => {
      const chips = [];
      chips.push(
        h(
          "span",
          {
            key: "sc",
            className:
              "rt-scope rt-scope-" +
              (a.scope === "internal" ? "internal" : "external"),
          },
          a.scope === "internal" ? "내부망" : "외부망",
        ),
      );
      if (a.segment_cidr)
        chips.push(
          h("span", { key: "seg", className: "rt-tag" }, a.segment_cidr),
        );
      if (a.open_ports)
        chips.push(
          h(
            "span",
            { key: "p", className: "rt-tag rt-tag-active" },
            "열린 포트 " + a.open_ports,
          ),
        );
      if (a.vulns)
        chips.push(
          h(
            "span",
            { key: "v", className: "rt-tag rt-tag-live" },
            "확인된 취약점 " + a.vulns,
          ),
        );
      if (a.webshells)
        chips.push(
          h(
            "span",
            { key: "w", className: "rt-tag rt-tag-passive" },
            "WebShell " + a.webshells,
          ),
        );
      if (a.tunnels)
        chips.push(
          h(
            "span",
            { key: "t", className: "rt-tag rt-tag-passive" },
            "터널 " + a.tunnels,
          ),
        );
      if (a.priority)
        chips.push(
          h("span", { key: "pr", className: "rt-tag" }, "공략 " + a.priority),
        );
      if (a.blocked_count)
        chips.push(
          h(
            "span",
            {
              key: "b",
              className: "rt-tag",
              style: { color: "#ef4444", borderColor: "#ef444455" },
            },
            "차단 " + a.blocked_count + "회",
          ),
        );
      const noteLines = a.test_notes
        ? String(a.test_notes)
            .split("\n")
            .slice(-3)
            .map((l) => (l.length > 240 ? l.slice(0, 240) + " …" : l))
        : [];
      return h(
        "div",
        { key: "at" + a.id, className: "rt-atest" + (past ? " past" : "") },
        h(
          "div",
          { className: "rt-atest-head" },
          past ? null : h("span", { className: "rt-live-dot" }),
          h("span", { className: "rt-atest-ip" }, a.ip),
          h(
            "span",
            {
              className:
                "rt-tag " + (a.test_status === "testing" ? "rt-tag-live" : ""),
            },
            TEST_STATUS_LABEL[a.test_status] || a.test_status,
          ),
          h("div", { className: "rt-spacer" }),
          h(
            "span",
            {
              style: {
                fontSize: 11,
                color: "var(--dsw-alias-label-secondary)",
              },
            },
            fmt(a.test_updated_at) +
              (a.test_updated_by ? " · " + a.test_updated_by : ""),
          ),
        ),
        chips.length ? h("div", null, chips) : null,
        a.test_surface
          ? h(
              "div",
              { className: "rt-atest-meta" },
              "테스트 대상: " + a.test_surface,
            )
          : null,
        a.potential
          ? h(
              "div",
              { className: "rt-atest-meta" },
              "예상 득점: " + a.potential,
            )
          : null,
        noteLines.length
          ? h(Clip, { label: "테스트 기록", text: noteLines.join("\n") })
          : null,
      );
    };

    const concl = (label, value, tone) =>
      h(
        "span",
        { key: label, className: "rt-concl-i", style: { cursor: "default" } },
        h("b", null, String(value || 0)),
        h("span", null, label),
      );
    const conclusion = h(
      "div",
      { className: "rt-concl" },
      concl("테스트 중", stats.testing, "live"),
      concl("대기", stats.untested, ""),
      concl("완료", stats.tested, ""),
      concl("포기", (stats.abandoned || 0) + (stats.blocked || 0), ""),
      concl("공격 표면 없음", stats.no_surface, ""),
      h("div", { className: "rt-spacer" }),
      at
        ? h(
            "span",
            {
              style: {
                fontSize: 11,
                color: "var(--dsw-alias-label-secondary)",
              },
            },
            "갱신 " + at.toLocaleTimeString("ko-KR", { hour12: false }),
          )
        : null,
      h(
        "button",
        {
          className: "rt-btn",
          style: { padding: "0 7px", fontSize: 11 },
          title: "최근 변동과 대기 대열 펼치기",
          onClick: () =>
            collapse.setAll(
              ["testing:" + eng, "recent:" + eng, "queue:" + eng],
              true,
            ),
        },
        "전체 펼치기",
      ),
      h(
        "button",
        {
          className: "rt-btn",
          style: { padding: "0 7px", fontSize: 11 },
          title: "테스트 중만 남기기",
          onClick: () =>
            collapse.setAll(
              ["testing:" + eng, "recent:" + eng, "queue:" + eng],
              false,
            ),
        },
        "전체 접기",
      ),
      h(
        "button",
        {
          className: "rt-btn" + (auto ? " rt-btn-primary" : ""),
          style: { padding: "0 7px", fontSize: 11 },
          title: "5초마다 자동 새로고침",
          onClick: () => setAuto((x) => !x),
        },
        auto ? "실시간 · 5s" : "일시 정지",
      ),
      h(
        "button",
        {
          className: "rt-btn",
          style: { padding: "0 7px", fontSize: 11 },
          onClick: load,
        },
        "새로고침",
      ),
    );

    const body = [];
    /* 테스트 중: 항상 표시, 완전히 펼침(접기 불가) */
    body.push(
      h(
        Section,
        {
          key: "testing",
          tone: "test",
          title: "테스트 중",
          count: testing.length + "대",
          sub: testing.length
            ? "에이전트가 이 자산들을 치고 있습니다"
            : "에이전트가 어떤 자산을 테스트하기 시작하면 여기에 실시간으로 나타납니다",
          open: collapse.isOpen("testing:" + eng, true),
          onToggle: collapse.toggle("testing:" + eng, true),
        },
        testing.length
          ? testing.map((a) => card(a, false))
          : h(
              "div",
              { className: "rt-atest-meta", style: { paddingBottom: 4 } },
              "지금 “테스트 중”인 자산이 없습니다",
            ),
      ),
    );

    /* 최근 변동(기본 접힘, 상태 기억) */
    body.push(
      h(
        Section,
        {
          key: "recent",
          tone: "past",
          title: "최근 변동",
          count: recent.length + "대",
          sub: "이미 테스트한 자산",
          open: collapse.isOpen("recent:" + eng, false),
          onToggle: collapse.toggle("recent:" + eng, false),
        },
        recent.length
          ? recent.map((a) => card(a, true))
          : h("div", { className: "rt-atest-meta" }, "없음"),
      ),
    );

    /* 대기 대열(기본 접힘, 상태 기억) */
    body.push(
      h(
        Section,
        {
          key: "queue",
          tone: "queue",
          title: "대기 대열",
          count: (data ? data.untested || 0 : 0) + "대",
          sub: "공략 용이성과 포트 수로 어느 자산부터 칠지 정렬합니다",
          open: collapse.isOpen("queue:" + eng, false),
          onToggle: collapse.toggle("queue:" + eng, false),
        },
        queue.length
          ? queue
              .map((a) => card(a, true))
              .concat([
                h(
                  "div",
                  {
                    key: "queueHint",
                    className: "rt-atest-meta",
                    style: { paddingTop: 4 },
                  },
                  "전체 목록(필터·정렬 포함)은 “자산 매핑” 페이지에서 봅니다",
                ),
              ])
          : h(
              "div",
              { className: "rt-atest-meta" },
              "대기 중인 자산이 없습니다",
            ),
      ),
    );

    return h(
      "div",
      { className: "rt-main" },
      conclusion,
      err ? h("div", { className: "rt-err" }, err) : null,
      data === null && !err
        ? h("div", { className: "rt-empty" }, "불러오는 중…")
        : null,
      h(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        h("div", { style: { padding: "6px 12px 14px" } }, body),
      ),
    );
  }

  /* ---------------------------------------------------------- 세션과 진입점(WebShell / 터널) */
  /**
   * 내부망 공략에서 가장 흔한 문제: WebShell 이나 터널을 얻고도 등록을 잊어, 얼마 뒤 "쓸 수 있는 진입점이 있었다는 사실"을 잊는다.
   * 이 탭은 사실 라이브러리의 WebShell 과 터널을 한곳에 보여주고, 연결 상태를 붙이며, 버튼 하나로 host 측 실측을 시킨다.
   */
  function SessionTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [msg, setMsg] = React.useState(null);
    const [copied, setCopied] = React.useState(null);

    const load = () => {
      if (!eng) return;
      api({ op: "sessions", engagement: eng }).then(
        (r) => {
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => setErr(String((e && e.message) || e)),
      );
    };
    React.useEffect(load, [eng, refreshKey]);

    const probe = () => {
      setBusy(true);
      setMsg(null);
      api({ op: "probeSessions", engagement: eng, timeoutMs: 6000 }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "검사 실패" });
            load();
            return;
          }
          const on = (r.webshells || []).filter(
            (x) => x.status === "online",
          ).length;
          const act = (r.tunnels || []).filter(
            (x) => x.status === "active",
          ).length;
          setMsg({
            ok:
              "검사 완료: WebShell 온라인 " +
              on +
              "/" +
              (r.webshells || []).length +
              ", 터널 사용 가능 " +
              act +
              "/" +
              (r.tunnels || []).length,
          });
          load();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    /* 실제로 클립보드에 기록된 경우에만 버튼을 "복사됨"으로 점등한다; 실패하면 그대로 알린다 */
    const copy = (key, text) =>
      copyWithFeedback(text, text, (okFlag, message) => {
        if (!okFlag) {
          setMsg({ err: message });
          return;
        }
        setCopied(key);
        setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
      });

    const markTunnel = (t, status) => {
      setMsg(null);
      api({
        op: "updateTunnel",
        engagement: eng,
        id: t.id,
        patch: { status: status, check_note: "화면에서 수동 표시" },
      }).then(
        () => load(),
        (e) => setMsg({ err: String((e && e.message) || e) }),
      );
    };
    const markShell = (w, status) => {
      setMsg(null);
      api({
        op: "updateWebshell",
        engagement: eng,
        id: w.id,
        patch: { status: status, check_note: "화면에서 수동 표시" },
      }).then(
        () => load(),
        (e) => setMsg({ err: String((e && e.message) || e) }),
      );
    };

    const sessCollapse = useCollapse("sessions:" + eng);
    const totals = (data && data.totals) || {};
    const shells = (data && data.webshells) || [];
    const tunnels = (data && data.tunnels) || [];
    const statusDot = (s) =>
      h("span", {
        className:
          s === "online" || s === "active"
            ? "rt-dot-on"
            : s === "unknown" || !s
              ? "rt-dot-unk"
              : "rt-dot-off",
      });
    /* 카드 안에서는 “라벨 + 값” 두 열로 통일하고 긴 텍스트는 자동 줄바꿈 — 한 줄에 점으로 이어 붙이는 것보다 훑기 쉽다 */
    const fact = (label, value) =>
      h(
        "div",
        { className: "rt-sess-fact" },
        h("b", null, label),
        h("span", null, value),
      );
    /* 납품 요건: 웹셸은 반드시 Behinder/Godzilla 암호화 셸이어야 하고(사용자가 접속할 수 있어야 한다), 내부망은 suo5 터널로 간다 */
    const isEncryptedShell = (t) =>
      /behinder|godzilla|\u51B0\u874E|\u54E5\u65AF\u62C9/i.test(
        String(t || ""),
      );
    const isSuo5 = (t) => /suo5/i.test(String(t || ""));
    /* 안내 바: 결론 한 줄 + 펼쳐 보는 방법만 남긴다(예전에는 세 덩어리 긴 설명을 평면 배치해 본문이 다 묻혔다) */
    const hint = (key, title, detail) =>
      h(
        "div",
        { key, className: "rt-hint" },
        h("b", null, title),
        h(
          "details",
          { className: "rt-sess-fold", style: { marginTop: 3 } },
          h("summary", null, "방법(클릭하면 펼침)"),
          h("div", { style: { marginTop: 4 } }, detail),
        ),
      );
    const hints = [];
    const badShells = shells.filter((w) => !isEncryptedShell(w.shell_type));
    const legitTunnels = tunnels.filter((t) => t.legit === true);
    if (badShells.length > 0) {
      hints.push(
        hint(
          "h1",
          "진입점 " +
            badShells.length +
            "개가 Behinder/Godzilla 셸이 아닙니다(사용자가 접속할 수 없어 납품 가능한 진입점으로 치지 않습니다)",
          "webshell-toolkit 스킬로 Behinder(behinder) 또는 Godzilla(godzilla) 셸을 다시 업로드하고, " +
            "shell_type + pass_key 를 redteam_webshell_add 에 적습니다. 임시 중계로만 쓰는 것이라면 비고에 밝힙니다.",
        ),
      );
    }
    if (tunnels.length > 0 && legitTunnels.length === 0) {
      hints.push(
        hint(
          "h3",
          "현재 통로 " +
            tunnels.length +
            '개가 모두 "타깃 경계를 넘은 것"으로 치지 않습니다(경계/내부망 돌파 미인정)',
          "내 VPS / 자체 서버에서 연 socks5, frp, 프록시는 터널로 치지 않습니다. 대상 측에서 시작되는 통로여야 합니다: " +
            "대상이 내 쪽으로 리버스 셸, 대상에서 frp/Stowaway 클라이언트 실행, 또는 대상 WebShell 을 경유한 suo5/HTTP 터널; 등록할 때 entry_kind 로 밝힙니다.",
        ),
      );
    }
    const activeSuo5 = tunnels.filter(
      (t) => isSuo5(t.kind) && t.status === "active",
    );
    if (shells.length > 0 && activeSuo5.length === 0) {
      hints.push(
        hint(
          "h2",
          "사용 가능한 suo5 터널이 아직 없습니다(내부망 진입의 표준 통로)",
          "suo5-tunnel 스킬로 위 WebShell 을 경유해 socks5 터널을 만들고, redteam_tunnel_add" +
            "(kind=suo5, listen=127.0.0.1:1080, entry=WebShell URL, reach=도달 대역)로 등록한 뒤, " +
            "마지막에 “연결 확인”을 눌러 status=active 를 확인하세요.",
        ),
      );
    }

    const shellCards = shells.map((w) =>
      h(
        "div",
        { key: "w" + w.id, className: "rt-sess" },
        h(
          "div",
          { className: "rt-sess-head" },
          statusDot(w.status),
          h("span", { className: "rt-sess-title" }, w.url),
          h(
            "span",
            { className: "rt-tag rt-tag-active" },
            w.shell_type || "webshell",
          ),
          isEncryptedShell(w.shell_type)
            ? null
            : h(
                "span",
                { className: "rt-tag rt-tag-warn" },
                "사용자 접속 불가",
              ),
          w.privilege ? h("span", { className: "rt-tag" }, w.privilege) : null,
          h("div", { className: "rt-spacer" }),
          copied === "cmd" + w.id
            ? h(
                "span",
                { className: "rt-tag", style: { color: "#10b981" } },
                "복사됨",
              )
            : h(
                "button",
                {
                  className: "rt-btn",
                  style: { padding: "0 6px", fontSize: 11 },
                  onClick: () => copy("cmd" + w.id, 'curl -s "' + w.url + '"'),
                },
                "URL 복사",
              ),
          h(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => markShell(w, "offline"),
            },
            "무효 표시",
          ),
        ),
        h(
          "div",
          { className: "rt-sess-facts" },
          fact(
            "유형",
            isEncryptedShell(w.shell_type)
              ? "암호화 셸(Behinder/Godzilla, 사용자 직접 접속 가능)"
              : "비암호화 셸 — 사용자가 접속할 수 없어 임시 중계로만 쓸 수 있습니다",
          ),
          w.pass_key
            ? fact("연결 암호", h("span", { className: "rt-mono" }, w.pass_key))
            : null,
          w.asset_ip ? fact("위치한 자산", w.asset_ip) : null,
          w.privilege ? fact("권한", w.privilege) : null,
          w.secret_ref
            ? fact(
                "자격 증명 참조",
                h("span", { className: "rt-mono" }, w.secret_ref),
              )
            : null,
          fact(
            "최근 검사",
            (w.last_check ? fmt(w.last_check) : "미검사") +
              (w.latency_ms !== null && w.latency_ms !== undefined
                ? "(" + w.latency_ms + "ms)"
                : ""),
          ),
          w.check_note ? fact("검사 설명", w.check_note) : null,
          w.note ? fact("비고", w.note) : null,
        ),
      ),
    );

    const tunnelCards = tunnels.map((t) => {
      const proxy = t.listen ? "socks5://" + t.listen : "";
      const gogoCmd = t.listen
        ? "./gogo -i <내부망 CIDR> -m ss --ping -p top2,win,db --proxy " + proxy
        : "";
      const fscanCmd = t.listen
        ? "./fscan -h <내부망 CIDR> -np -nobr -nopoc -socks5 " +
          t.listen +
          " -o intranet.txt"
        : "";
      return h(
        "div",
        { key: "t" + t.id, className: "rt-sess" },
        h(
          "div",
          { className: "rt-sess-head" },
          statusDot(t.status),
          h(
            "span",
            { className: "rt-sess-title" },
            t.listen || "(수신 주소 미기재)",
          ),
          h("span", { className: "rt-tag rt-tag-passive" }, t.kind || "tunnel"),
          isSuo5(t.kind)
            ? null
            : h(
                "span",
                { className: "rt-tag rt-tag-warn" },
                "suo5 표준 통로 아님",
              ),
          /* 타깃 경계를 넘은 통로만 돌파 증거로 친다(내 VPS/자체 서버에서 연 것은 제외) */
          t.legit === true
            ? h(
                "span",
                {
                  className: "rt-tag rt-tag-live",
                  title: t.entry_kind_label || "",
                },
                "대상 측 통로",
              )
            : t.legit === false
              ? h(
                  "span",
                  {
                    className: "rt-tag rt-tag-warn",
                    title:
                      "내 VPS/자체 서버에서만 연 통로라 대상에 닿지 않았습니다 — 경계 돌파/내부망 돌파로 치지 않습니다",
                  },
                  "돌파 미인정",
                )
              : h(
                  "span",
                  {
                    className: "rt-tag",
                    title:
                      "entry_kind 미선언: 대상 측 끝이 무엇인지 밝히세요(target-outbound / target-http / target-agent)",
                  },
                  "확인 대기",
                ),
          t.reach
            ? h("span", { className: "rt-tag" }, "도달 " + t.reach)
            : null,
          h("div", { className: "rt-spacer" }),
          h(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => copy("sock" + t.id, t.listen || ""),
            },
            copied === "sock" + t.id ? "복사됨" : "주소 복사",
          ),
          t.status === "active"
            ? h(
                "button",
                {
                  className: "rt-btn",
                  style: { padding: "0 6px", fontSize: 11 },
                  onClick: () => markTunnel(t, "down"),
                },
                "무효 표시",
              )
            : h(
                "button",
                {
                  className: "rt-btn",
                  style: { padding: "0 6px", fontSize: 11 },
                  onClick: () => markTunnel(t, "active"),
                },
                "사용 가능 표시",
              ),
        ),
        h(
          "div",
          { className: "rt-sess-facts" },
          fact("대상 측 진입점", t.entry || "미등록"),
          fact(
            "경계 통과",
            t.legit === true
              ? h(
                  "span",
                  { className: "rt-tag rt-tag-live" },
                  t.entry_kind_label || t.entry_kind || "대상 측 확인됨",
                )
              : t.legit === false
                ? h(
                    "span",
                    { className: "rt-tag rt-tag-warn" },
                    "돌파 미인정(내 VPS 에서만 프록시를 열었습니다)",
                  )
                : h(
                    "span",
                    { className: "rt-tag" },
                    "entry_kind 미선언, 확인 대기",
                  ),
          ),
          t.reach ? fact("도달 대역", t.reach) : null,
          t.asset_ip ? fact("위치한 자산", t.asset_ip) : null,
          fact(
            "최근 검사",
            (t.last_check ? fmt(t.last_check) : "미검사") +
              (t.latency_ms !== null && t.latency_ms !== undefined
                ? "(" + t.latency_ms + "ms)"
                : ""),
          ),
          t.check_note ? fact("검사 설명", t.check_note) : null,
          t.note ? fact("비고", t.note) : null,
        ),
        /* 명령은 기본 접힘: 카드의 첫 정보는 "이 통로를 쓸 수 있는지, 어디로 통하는지"이며 명령은 필요할 때 펼친다 */
        t.command
          ? h(
              "details",
              { className: "rt-sess-fold" },
              h("summary", null, "구축 명령(클릭하면 펼침 / 복사)"),
              h(
                "div",
                Object.assign(
                  { className: "rt-code", title: "클릭하면 복사" },
                  clickable(() => copy("c" + t.id, t.command), {
                    label: "명령 복사",
                  }),
                ),
                copied === "c" + t.id ? "복사됨" : t.command,
              ),
            )
          : null,
        t.status === "active" && t.listen
          ? h(
              "details",
              { className: "rt-sess-fold" },
              h("summary", null, "이 터널로 스캔(gogo / fscan 명령)"),
              h(
                "div",
                { className: "rt-sess-cmd" },
                h(
                  "div",
                  Object.assign(
                    { className: "rt-code", title: "클릭하면 복사" },
                    clickable(() => copy("g" + t.id, gogoCmd), {
                      label: "gogo 명령 복사",
                    }),
                  ),
                  copied === "g" + t.id ? "복사됨" : gogoCmd,
                ),
                h(
                  "div",
                  Object.assign(
                    {
                      className: "rt-code",
                      style: { display: "block", marginTop: 3 },
                      title: "클릭하면 복사",
                    },
                    clickable(() => copy("f" + t.id, fscanCmd), {
                      label: "fscan 명령 복사",
                    }),
                  ),
                  copied === "f" + t.id ? "복사됨" : fscanCmd,
                ),
              ),
            )
          : null,
      );
    });

    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "세션과 진입점"),
        h(
          "span",
          { className: "rt-tag" },
          "WebShell " +
            (totals.webshellsOnline || 0) +
            "/" +
            (totals.webshells || 0) +
            " 온라인",
        ),
        h(
          "span",
          { className: "rt-tag" },
          "터널 " +
            (totals.tunnelsActive || 0) +
            "/" +
            (totals.tunnels || 0) +
            " 사용 가능",
        ),
        h(
          "span",
          { className: "rt-tag" },
          "자격 증명 " + (totals.credentials || 0),
        ),
        h("span", { className: "rt-tag" }, "접근 세션 " + (totals.access || 0)),
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          {
            className: "rt-btn rt-btn-primary",
            disabled: busy,
            onClick: probe,
          },
          busy ? "검사 중…" : "연결 확인",
        ),
        h("button", { className: "rt-btn", onClick: load }, "새로고침"),
      ),
      msg
        ? h(
            "div",
            { className: msg.err ? "rt-err" : "rt-foot" },
            msg.err || msg.ok,
          )
        : null,
      err ? h("div", { className: "rt-err" }, err) : null,
      h(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        !shells.length && !tunnels.length
          ? h(
              "div",
              { className: "rt-empty" },
              h("div", null, "등록된 WebShell 이나 터널이 아직 없습니다."),
              h(
                "div",
                { style: { marginTop: 6, fontSize: 12 } },
                "WebShell 을 얻으면 redteam_webshell_add; 터널을 만들면 redteam_tunnel_add(suo5 / socks5 / ssh -R); 이후 에이전트는 redteam_sessions 로 볼 수 있습니다.",
              ),
            )
          : null,
        hints.length
          ? h("div", { style: { padding: "8px 10px 0" } }, hints)
          : null,
        h(
          Section,
          {
            key: "webshells",
            tone: "queue",
            title: "WebShell",
            count:
              (totals.webshellsOnline || 0) +
              "/" +
              (totals.webshells || 0) +
              " 온라인",
            sub: "이미 온라인이 된 제어 가능한 진입점",
            open: sessCollapse.isOpen("shells", true),
            onToggle: sessCollapse.toggle("shells", true),
          },
          shells.length
            ? h(
                "div",
                { className: "rt-sess-grid", style: { padding: 0 } },
                shellCards,
              )
            : h(
                "div",
                { className: "rt-atest-meta" },
                "없음(WebShell 을 얻은 뒤 redteam_webshell_add 로 등록하세요)",
              ),
        ),
        h(
          Section,
          {
            key: "tunnels",
            tone: "test",
            title: "내부망 터널",
            count:
              (totals.tunnelsActive || 0) +
              "/" +
              (totals.tunnels || 0) +
              " 사용 가능",
            sub: "스캐너 프록시로 바로 쓸 수 있습니다",
            open: sessCollapse.isOpen("tunnels", true),
            onToggle: sessCollapse.toggle("tunnels", true),
          },
          tunnels.length
            ? h(
                "div",
                { className: "rt-sess-grid", style: { padding: 0 } },
                tunnelCards,
              )
            : h(
                "div",
                { className: "rt-atest-meta" },
                "없음(터널을 만든 뒤 redteam_tunnel_add 로 등록하세요)",
              ),
        ),
      ),
    );
  }

  /* ---------------------------------------------------------- 오류 경계 */
  /**
   * 탭 하나의 렌더링이 실패하면 그 탭만 강등하고 패널 전체를 무너뜨리지 않는다: 패널과 사이드바 버튼은 그대로 쓸 수 있고,
   * 사용자는 버튼 하나로 자산 매핑으로 돌아갈 수 있다. (이전에는 패널이 통째로 사라져 버튼도 눌리지 않았는데, 그 층이 없었기 때문이다.)
   */
  class RtBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
      return { error: error };
    }
    componentDidCatch(error) {
      try {
        console.error("[redteam-ui] 페이지 렌더링 오류:", error);
      } catch (e) {
        /* ignore */
      }
    }
    render() {
      if (this.state.error) {
        const msg =
          this.state.error && this.state.error.message
            ? this.state.error.message
            : String(this.state.error);
        return h(
          "div",
          { className: "rt-pane" },
          h("div", { className: "rt-err" }, "이 페이지 렌더링 오류: " + msg),
          h(
            "button",
            {
              className: "rt-btn",
              onClick: () => {
                this.setState({ error: null });
                setUI({ tab: "assets" });
              },
            },
            "자산 매핑으로 돌아가기",
          ),
        );
      }
      return this.props.children;
    }
  }

  /**
   * 에이전트 탭: 동시 실행 정원(최대 3) + 여섯 역할과 그 프롬프트.
   * 주 세션이 작업을 배분하기 전에 여기서 정원을 확인하고, 사용자도 "지금 몇 개의 에이전트를 더 띄울 수 있는지" 한눈에 본다.
   */
  function AgentsTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [roles, setRoles] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [concurrency, setConcurrency] = React.useState(null);
    const [busy, setBusy] = React.useState(false);

    const load = () => {
      setBusy(true);
      api({
        op: eng ? "prompts" : "bootstrap",
        engagement: eng || undefined,
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "읽기 실패");
            return;
          }
          setErr(null);
          if (r.roles) setRoles(r.roles);
        },
        (e) => {
          setBusy(false);
          setErr(String((e && e.message) || e));
        },
      );
      /* 동시 실행 정원은 "현재 실행 중인 서브에이전트" 기준으로 센다; host 측이 subagents 레지스트리를 읽는다 */
      api({ op: "agentsStatus" }).then(
        (r) => {
          if (r && r.ok !== false) setConcurrency(r);
        },
        () => {},
      );
    };
    React.useEffect(load, [eng, refreshKey]);

    const used = concurrency ? concurrency.used : null;
    const max = concurrency ? concurrency.max : 3;
    return h(
      "div",
      { className: "rt-main" },
      h(
        "div",
        { className: "rt-toolbar" },
        h("span", { style: { fontWeight: 600 } }, "작전 에이전트"),
        h(
          "span",
          { className: "rt-tag rt-tag-passive" },
          "동시 실행 상한 " + max,
        ),
        used === null
          ? h("span", { className: "rt-tag" }, "점유 현황 알 수 없음")
          : h(
              "span",
              {
                className:
                  "rt-tag" + (used >= max ? " rt-tag-warn" : " rt-tag-live"),
              },
              "실행 중 " + used + " / 남은 " + Math.max(max - used, 0),
            ),
        h("div", { className: "rt-spacer" }),
        h(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "읽는 중…" : "새로고침",
        ),
      ),
      h(
        "div",
        { className: "rt-pane" },
        err ? h("div", { className: "rt-err" }, err) : null,
        h(
          "div",
          { className: "rt-card" },
          h("h4", null, "동시 실행 규칙(엄격 제약)"),
          h(
            "div",
            { style: { fontSize: 12, lineHeight: 1.7 } },
            "· 같은 타깃에서 **동시에 최대 " +
              max +
              "개 실행 에이전트**; 주 세션은 작업을 배정하기 전에 `redteam_agent_slot` 로 자리를 잡고, 정원이 차면 바로 거부합니다.",
            h("br"),
            "· **기본은 하나씩 배정하며 순서대로 진행**; 서로 의존하지 않는 작업만 병렬로 돌립니다.",
            h("br"),
            "· 세션마다 **자기 타깃 바인딩**이 있습니다: 여러 세션이 병렬로 돌아도 보고서가 섞이지 않습니다(서브에이전트는 부모 세션의 타깃을 상속합니다).",
          ),
        ),
        h(
          "div",
          { className: "rt-card" },
          h("h4", null, "여섯 역할"),
          h(
            "div",
            { style: { fontSize: 12, lineHeight: 1.8 } },
            "① 정보 수집 `recon` —— 자산만 수집하며, 단위 자산을 빠짐없이 모읍니다(경계 및 미신고 자산 포함)",
            h("br"),
            "② 자산 정리 `assess` —— 하나씩 넘기며 공략 용이성을 평가해 전부 기록합니다",
            h("br"),
            "③ 취약점 발견 `vuln-scan` —— 먼저 지식 베이스로 중복 제거 → Nday/1day 우선 → 엔드포인트 비인가 접근 탐지",
            h("br"),
            "④ 취약점 익스플로잇 `exploit` —— 먼저 서버 권한(Behinder/Godzilla 셸) + suo5 터널을 확보하고, 그다음 다른 득점 항목을 칩니다",
            h("br"),
            "⑤ 내부망 침투 `internal` —— 터널로 들어가 ①②③④ 를 순서대로 다시 돌려 내부망을 공략합니다",
            h("br"),
            "⑥ 주 세션 `plan` —— 계획·작업 배정·집계·보고만 하고 직접 나서지 않습니다",
          ),
        ),
        h(ConcurrencyCard, { concurrency, onSaved: load }),
        h(
          "div",
          { className: "rt-card" },
          h("h4", null, "역할 프롬프트(타깃별 저장, 여기서 편집 가능)"),
          h(
            "div",
            {
              style: {
                fontSize: 11.5,
                color: "var(--dsw-alias-label-secondary)",
                marginBottom: 6,
              },
            },
            "“에이전트 프롬프트”가 이 페이지로 통합되었습니다; 아래는 전체 편집기입니다(수정 후 저장하면 현재 타깃에만 적용됩니다).",
          ),
          h(PromptsTab, { engagement: eng, refreshKey: refreshKey }),
        ),
      ),
    );
  }

  function ConcurrencyCard(props) {
    const info = props.concurrency || {};
    const [draft, setDraft] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const [msg, setMsg] = React.useState(null);
    React.useEffect(() => {
      if (info.max) setDraft(String(info.max));
    }, [info.max]);

    const limit = info.limit || 10;
    const used = typeof info.used === "number" ? info.used : null;
    const source =
      info.source === "settings"
        ? "패널에서 설정"
        : info.source === "env"
          ? "환경 변수 REDTEAM_MAX_AGENTS"
          : "기본값";
    const n = Number(draft);
    const invalid =
      !Number.isFinite(n) || Math.floor(n) !== n || n < 1 || n > limit;
    const save = () => {
      if (invalid) return;
      setBusy(true);
      setMsg(null);
      api({ op: "setAgentsMax", max: n }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "저장 실패" });
            return;
          }
          setMsg({
            ok:
              "저장됨: 동시 실행 상한 " + r.max + "(즉시 적용, 재시작 불필요)",
          });
          if (props.onSaved) props.onSaved();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };
    return h(
      "div",
      { className: "rt-card" },
      h("h4", null, "동시 실행 수"),
      h(
        "div",
        { style: { fontSize: 12, lineHeight: 1.8, marginBottom: 8 } },
        "같은 타깃에서 **동시에 몇 개의 실행 에이전트**까지 돌릴지. 현재 적용값: **" +
          (info.max || "?") +
          "**" +
          (used === null
            ? ""
            : "(실행 중 " +
              used +
              ", 남은 " +
              Math.max((info.max || 0) - used, 0) +
              ")") +
          ", 출처: " +
          source +
          ". 수정하면 **즉시 적용**되며 재시작이 필요 없습니다.",
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          },
        },
        h("input", {
          className: "rt-input",
          style: { width: 90 },
          type: "number",
          min: 1,
          max: limit,
          value: draft,
          onChange: (e) => setDraft(e.target.value),
        }),
        h(
          "span",
          {
            style: {
              fontSize: 11.5,
              color: "var(--dsw-alias-label-secondary)",
            },
          },
          "범위 1 – " + limit,
        ),
        h(
          "button",
          {
            className: "rt-btn rt-btn-primary",
            disabled: busy || invalid,
            onClick: save,
          },
          busy ? "저장 중…" : "저장",
        ),
        msg && msg.err
          ? h(
              "span",
              { style: { fontSize: 12, color: "var(--rt-danger, #d33)" } },
              msg.err,
            )
          : null,
        msg && msg.ok
          ? h(
              "span",
              {
                style: {
                  fontSize: 12,
                  color: "var(--dsw-alias-label-secondary)",
                },
              },
              msg.ok,
            )
          : null,
      ),
      h(
        "div",
        { className: "rt-note", style: { marginTop: 8 } },
        "⚠️ 늘린다고 빨라지지 않습니다: **같은 모델 API 키의 동시 실행/속도 상한은 공유됩니다**. 한꺼번에 너무 많이 배정하면 서로 자리를 뺏어" +
          "대기, 타임아웃, 잘린 응답, 심하면 속도 제한 오류까지 나며 —— 오히려 테스트 결과가 불안정해집니다(누락, 중도 포기)." +
          " 2–3 에서 시작하고, 키의 할당량이 충분하고 작업끼리 정말 의존하지 않을 때만 늘리세요.",
      ),
    );
  }

  /**
   * 버전 표시 + 자동 업데이트 버튼.
   *
   * 동작: 마운트 시 최신 버전(npm registry)을 조용히 한 번 조회하고, 새 버전이 있으면 버튼을
   * “새 버전 vX”로 점등한다; 누르면 확인 대화상자(현재 버전 / 최신 버전 / 설치 위치 / 차단 항목)를 띄우고,
   * 확인하면 host 측이 설치 → dsh web 재시작을 수행한다(페이지 연결이 끊기며, 재시작 후 새로고침하면 된다).
   */
  function VersionBar(props) {
    const [info, setInfo] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [busy, setBusy] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [msg, setMsg] = React.useState(null);
    const [countdown, setCountdown] = React.useState(0);
    const countdownRef = React.useRef(null);
    const clearCountdown = React.useCallback(() => {
      if (countdownRef.current) {
        try {
          clearInterval(countdownRef.current);
        } catch {
          /* ignore */
        }
      }
      countdownRef.current = null;
    }, []);
    React.useEffect(() => () => clearCountdown(), [clearCountdown]);
    const closeModal = React.useCallback(() => {
      clearCountdown();
      setCountdown(0);
      setOpen(false);
    }, [clearCountdown]);

    const check = (silent) => {
      if (!silent) setBusy(true);
      api({ op: "updateCheck" }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            /* 개발 모드이거나 registry 조회 불가: 현재 버전만 표시하고 오류로 사용자를 방해하지 않는다 */
            if (!silent) setErr((r && r.error) || "업데이트 확인 실패");
            api({ op: "version" }).then(
              (v) => {
                if (v && v.ok !== false) setInfo(v);
              },
              () => {},
            );
            return;
          }
          setErr(null);
          setInfo(r);
        },
        (e) => {
          setBusy(false);
          if (!silent) setErr(String((e && e.message) || e));
          api({ op: "version" }).then(
            (v) => {
              if (v && v.ok !== false) setInfo(v);
            },
            () => {},
          );
        },
      );
    };
    React.useEffect(() => {
      check(true);
    }, []);

    const apply = () => {
      setBusy(true);
      setMsg(null);
      api({
        op: "updateApply",
        target: (info && info.latest) || undefined,
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: (r && r.error) || "업데이트 실패" });
            return;
          }
          setMsg({
            ok: (r.installed || "") + " 설치됨. 현재 호스트를 재시작하는 중…",
          });
          /* 재시작하면 이 페이지 연결이 끊긴다: 카운트다운으로 잠시 뒤 새로고침하라고 알린다 */
          setCountdown(6);
          clearCountdown();
          countdownRef.current = setInterval(() => {
            setCountdown((n) => {
              if (n <= 1) {
                clearCountdown();
                window.location.reload();
                return 0;
              }
              return n - 1;
            });
          }, 1000);
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String((e && e.message) || e) });
        },
      );
    };

    const current =
      info && info.current
        ? info.current
        : info && info.plugin
          ? info.plugin.version
          : null;
    const latest = info && info.latest ? info.latest : null;
    const hasNew = !!(info && info.updateAvailable);
    const blockers = (info && info.blockers) || [];
    const notes = (info && info.notes) || [];
    const mode = info && info.install ? info.install.mode : null;

    return h(
      "span",
      { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
      h(
        "span",
        {
          className: "rt-tag" + (hasNew ? " rt-tag-warn" : ""),
          title:
            "현재 버전 " +
            (current || "알 수 없음") +
            (latest ? "\n최신 버전 " + latest : "") +
            (mode === "dev"
              ? "\n설치 방식: 개발 모드(소스 심볼릭 링크)"
              : mode === "package"
                ? "\n설치 방식: 패키지 설치"
                : "") +
            (info && info.check_error
              ? "\n확인 실패: " + info.check_error
              : ""),
        },
        "v" + (current || "?"),
      ),
      hasNew
        ? h(
            "button",
            {
              className: "rt-btn rt-btn-primary",
              disabled: busy,
              onClick: () => {
                setOpen(true);
                setMsg(null);
              },
              title:
                "새 버전 " +
                latest +
                " 발견: 눌러서 확인하고 한 번에 업데이트합니다(현재 호스트가 재시작됩니다)",
            },
            busy ? "확인 중…" : "새 버전 v" + latest,
          )
        : h(
            "button",
            {
              className: "rt-btn",
              disabled: busy,
              onClick: () => check(false),
              title: "npm 의 최신 버전을 다시 확인합니다",
            },
            busy ? "확인 중…" : "업데이트 확인",
          ),
      open
        ? h(
            "div",
            {
              className: "rt-modal",
              "aria-hidden": "true",
              onClick: closeModal,
            },
            h(
              "div",
              {
                className: "rt-modal-box",
                onClick: (e) => e.stopPropagation(),
              },
              h("h4", { style: { marginTop: 0 } }, "RedTeam 모드 업데이트"),
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "현재 버전"),
                h("span", null, current || "알 수 없음"),
              ),
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "최신 버전"),
                h("span", null, latest || "알 수 없음"),
              ),
              h(
                "div",
                { className: "rt-kv" },
                h("b", null, "설치 방식"),
                h(
                  "span",
                  null,
                  mode === "dev"
                    ? "개발 모드(소스 심볼릭 링크)"
                    : mode === "package"
                      ? "패키지 설치(" +
                        ((info.install && info.install.packageManager) ||
                          "npm") +
                        ")"
                      : "알 수 없음",
                ),
              ),
              info && info.install && info.install.dir
                ? h(
                    "div",
                    { className: "rt-kv" },
                    h("b", null, "설치 위치"),
                    h("span", { className: "rt-mono" }, info.install.dir),
                  )
                : null,
              blockers.length
                ? h(
                    "div",
                    { className: "rt-hint" },
                    h(
                      "div",
                      { style: { fontWeight: 600, marginBottom: 4 } },
                      "지금은 업데이트할 수 없습니다:",
                    ),
                    blockers.map((b, i) =>
                      h("div", { key: "b" + i }, "· " + b),
                    ),
                  )
                : null,
              notes.length
                ? h(
                    "div",
                    { className: "rt-foot", style: { padding: "4px 0" } },
                    notes.map((n, i) => h("div", { key: "n" + i }, n)),
                  )
                : null,
              h(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "var(--dsw-alias-label-secondary)",
                    margin: "8px 0",
                  },
                },
                "업데이트 절차: 새 버전 설치 → 현재 호스트 자동 재시작(공식 exe / 커뮤니티판 / dsh web; 이 페이지 연결이 끊기고 약 5–10초 뒤 자동 새로고침됩니다)." +
                  "재시작 전에 실행 중인 에이전트가 있는지 확인하고, 있으면 그대로 멈추세요.",
              ),
              msg
                ? h(
                    "div",
                    { className: msg.err ? "rt-err" : "rt-foot" },
                    msg.err || msg.ok,
                  )
                : null,
              countdown > 0
                ? h(
                    "div",
                    { className: "rt-foot" },
                    "호스트를 재시작하는 중입니다. " +
                      countdown +
                      "초 뒤 페이지를 자동 새로고침합니다…",
                  )
                : null,
              h(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginTop: 10,
                  },
                },
                h(
                  "button",
                  { className: "rt-btn", onClick: closeModal },
                  "닫기",
                ),
                h(
                  "button",
                  {
                    className: "rt-btn rt-btn-primary",
                    disabled: busy || blockers.length > 0 || mode === "dev",
                    title:
                      mode === "dev"
                        ? "개발 모드 설치는 저장소 절차로 업그레이드합니다"
                        : blockers.length
                          ? "위의 차단 항목을 먼저 해결하세요"
                          : "설치 후 재시작",
                    onClick: apply,
                  },
                  busy ? "업데이트 중…" : "한 번에 업데이트 후 재시작",
                ),
              ),
            ),
          )
        : null,
    );
  }

  /* ---------------------------------------------------------- 상주 패널 본체 */
  /**
   * “미확인” 상태: 타깃별로 localStorage 에 기록하고, 25초마다 host 의 consoleDigest 를 묻는다
   * (탭마다 항목 수 + 최근 갱신 시각). 로컬에 기억한 스냅샷보다 새로우면 그 탭에 빨간 점이 붙고,
   * 사용자가 그 탭을 열면 현재 값을 확인함으로 기록해 빨간 점이 사라진다.
   */
  const UNREAD_KEY = "rt-unread:";
  const loadUnread = (eng) => {
    try {
      const raw = window.localStorage.getItem(UNREAD_KEY + eng);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (e) {
      return null;
    }
  };
  const saveUnread = (eng, value) => {
    try {
      window.localStorage.setItem(UNREAD_KEY + eng, JSON.stringify(value));
    } catch (e) {
      /* 프라이빗 모드 등: 저장하지 않아도 동작한다 */
    }
  };
  /** 이 탭에 지난번 확인 이후 새 내용이 있는지(항목 수가 늘었거나 최신 항목이 지난 확인보다 새로움). */
  const digestHasNew = (prev, cur) => {
    if (!cur) return false;
    if (!prev) return true;
    const pc = Number(prev.count || 0);
    const cc = Number(cur.count || 0);
    if (cc > pc) return true;
    const pa = prev.at || "";
    const ca = cur.at || "";
    return ca !== "" && ca !== pa && ca > pa;
  };

  const RT_GEOM_KEY = "rt-dock-geom-v1";
  function clampRtGeom(g) {
    const vw = (typeof window !== "undefined" && window.innerWidth) || 1280;
    const vh = (typeof window !== "undefined" && window.innerHeight) || 800;
    const w = Math.min(
      Math.max(320, Number(g && g.w) || 620),
      Math.max(320, vw),
    );
    const h = Math.min(
      Math.max(240, Number(g && g.h) || 520),
      Math.max(240, vh),
    );
    const x = Math.min(Math.max(0, Number(g && g.x) || 0), Math.max(0, vw - w));
    const y = Math.min(Math.max(0, Number(g && g.y) || 0), Math.max(0, vh - h));
    return { x: x, y: y, w: w, h: h };
  }
  function defaultRtGeom() {
    const vw = (typeof window !== "undefined" && window.innerWidth) || 1280;
    const vh = (typeof window !== "undefined" && window.innerHeight) || 800;
    let w = 620;
    try {
      const saved = Number(window.localStorage.getItem("rt-dock-width"));
      if (Number.isFinite(saved) && saved >= 320 && saved <= 1200) w = saved;
    } catch (e) {
      /* 프라이빗 모드 */
    }
    const h = Math.max(240, Math.min(640, vh - 24));
    return clampRtGeom({ x: Math.max(0, vw - w - 12), y: 12, w: w, h: h });
  }
  function loadRtGeom() {
    try {
      const raw = JSON.parse(
        window.localStorage.getItem(RT_GEOM_KEY) || "null",
      );
      if (raw && typeof raw === "object") return clampRtGeom(raw);
    } catch (e) {
      /* 프라이빗 모드 또는 손상된 데이터 */
    }
    return defaultRtGeom();
  }

  function Panel(props) {
    /* embedded: dsh-purge 바깥 dock 에 끼워 넣을 때는 접기/전체 보기/드래그 바를 스스로 갖지 않는다(바깥 버튼과 겹치지 않게) */
    const embedded = !!(props && props.embedded);
    const st = useUI();
    const [engagements, setEngagements] = React.useState([]);
    const [eng, setEng] = React.useState(null);
    const [snapshot, setSnapshot] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [newName, setNewName] = React.useState("");
    const [geom, setGeom] = React.useState(loadRtGeom);
    const [creating, setCreating] = React.useState(false);
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [digest, setDigest] = React.useState(null);
    const [seen, setSeen] = React.useState(null);

    React.useEffect(() => {
      if (embedded) return undefined;
      try {
        window.localStorage.setItem(RT_GEOM_KEY, JSON.stringify(geom));
      } catch (e) {
        /* 프라이빗 모드 */
      }
    }, [geom, embedded]);
    React.useEffect(() => {
      if (embedded) return undefined;
      const onResize = () => setGeom((g) => clampRtGeom(g));
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [embedded]);

    const loadSnapshot = (id) => {
      if (!id) {
        setSnapshot(null);
        return;
      }
      api({ op: "snapshot", engagement: id }).then(
        (r) => {
          if (!r || r.ok === false) {
            setErr((r && r.error) || "불러오기 실패");
            return;
          }
          setErr(null);
          setSnapshot(r);
        },
        (e) => setErr(String((e && e.message) || e)),
      );
    };

    const refreshList = (selectId) => {
      api({ op: "bootstrap" }).then(
        (b) => {
          setEngagements((b && b.engagements) || []);
          if (selectId) {
            setEng(selectId);
            loadSnapshot(selectId);
          }
        },
        () => {},
      );
    };

    React.useEffect(() => {
      api({ op: "bootstrap" }).then(
        (r) => {
          if (!r || r.ok === false) {
            setErr((r && r.error) || "자산 라이브러리에 연결할 수 없습니다");
            return;
          }
          setEngagements(r.engagements || []);
          const id =
            r.current ||
            (r.engagements && r.engagements[0] && r.engagements[0].id) ||
            null;
          if (id) {
            setEng(id);
            loadSnapshot(id);
          }
        },
        (e) => setErr(String((e && e.message) || e)),
      );
    }, []);

    const openEngagement = (nameArg) => {
      const name = String(nameArg || newName).trim();
      if (!name) return;
      setCreating(true);
      api({ op: "openEngagement", name: name }).then(
        (r) => {
          setCreating(false);
          if (!r || r.ok === false) {
            setErr((r && r.error) || "생성 실패");
            return;
          }
          setNewName("");
          refreshList(r.engagement && r.engagement.id);
        },
        (e) => {
          setCreating(false);
          setErr(String((e && e.message) || e));
        },
      );
    };

    /** 새로고침: 명부/스냅샷을 다시 받고, 현재 탭도 데이터를 다시 가져오게 한다. */
    const refreshAll = () => {
      setRefreshKey((k) => k + 1);
      api({ op: "bootstrap" }).then(
        (b) => {
          setEngagements((b && b.engagements) || []);
          if (eng) loadSnapshot(eng);
        },
        () => {
          if (eng) loadSnapshot(eng);
        },
      );
    };

    const trackPointer = (e, move) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    };
    const startDrag = (e) => {
      if (
        e.target &&
        e.target.closest &&
        e.target.closest("button,a,input,select,textarea,label")
      )
        return;
      const sx = e.clientX;
      const sy = e.clientY;
      const ox = geom.x;
      const oy = geom.y;
      trackPointer(e, (ev) =>
        setGeom((g) =>
          clampRtGeom({
            x: ox + (ev.clientX - sx),
            y: oy + (ev.clientY - sy),
            w: g.w,
            h: g.h,
          }),
        ),
      );
    };
    const startResizeLeft = (e) => {
      const sx = e.clientX;
      const ox = geom.x;
      const ow = geom.w;
      trackPointer(e, (ev) => {
        const dx = ev.clientX - sx;
        setGeom((g) => clampRtGeom({ x: ox + dx, y: g.y, w: ow - dx, h: g.h }));
      });
    };
    const startResizeRight = (e) => {
      const sx = e.clientX;
      const ow = geom.w;
      trackPointer(e, (ev) =>
        setGeom((g) =>
          clampRtGeom({ x: g.x, y: g.y, w: ow + (ev.clientX - sx), h: g.h }),
        ),
      );
    };
    const startResizeBottom = (e) => {
      const sy = e.clientY;
      const oh = geom.h;
      trackPointer(e, (ev) =>
        setGeom((g) =>
          clampRtGeom({ x: g.x, y: g.y, w: g.w, h: oh + (ev.clientY - sy) }),
        ),
      );
    };
    const startResizeCorner = (e) => {
      const sx = e.clientX;
      const sy = e.clientY;
      const ow = geom.w;
      const oh = geom.h;
      trackPointer(e, (ev) =>
        setGeom((g) =>
          clampRtGeom({
            x: g.x,
            y: g.y,
            w: ow + (ev.clientX - sx),
            h: oh + (ev.clientY - sy),
          }),
        ),
      );
    };

    /* 타깃 전환: 그 타깃의 미확인 스냅샷을 다시 읽고, 즉시 요약을 한 번 받는다 */
    React.useEffect(() => {
      if (!eng) {
        setDigest(null);
        setSeen(null);
        return undefined;
      }
      setSeen(loadUnread(eng));
      let alive = true;
      let digestInflight = false;
      const tick = () => {
        if (digestInflight)
          return; /* 이전 요청이 아직 안 돌아왔으면 이번 차례는 건너뛴다: 요청을 쌓지 않는다 */
        digestInflight = true;
        api({ op: "consoleDigest", engagement: eng })
          .then(
            (r) => {
              if (alive && r && r.ok !== false && r.sections)
                setDigest(r.sections);
            },
            () => {
              /* 네트워크 이상: 중단하지 않고 다음 차례를 기다린다 */
            },
          )
          .finally(() => {
            digestInflight = false;
          });
      };
      tick();
      const timer = window.setInterval(tick, 25000);
      return () => {
        alive = false;
        window.clearInterval(timer);
      };
    }, [eng, refreshKey]);

    /**
     * 탭을 연다 = 그 탭의 내용을 봤다: 현재 요약을 확인함으로 기록한다.
     * 한 번도 보지 않았으면(패널 첫 진입) 새 내용으로 치지 않는다 — 그러지 않으면 들어가자마자 화면이 빨간 점투성이가 되어
     * 오히려 "어디에 새 것이 있는지" 알 수 없다.
     */
    const markTabSeen = React.useCallback(
      (tab) => {
        if (!eng) return;
        setSeen((prev) => {
          const base =
            prev ||
            (() => {
              const fresh = {};
              for (const [k, v] of Object.entries(digest || {}))
                fresh[k] = { count: Number(v.count || 0), at: v.at || null };
              return fresh;
            })();
          const next = Object.assign({}, base);
          const cur = digest && digest[tab];
          if (cur)
            next[tab] = { count: Number(cur.count || 0), at: cur.at || null };
          saveUnread(eng, next);
          return next;
        });
      },
      [eng, digest],
    );

    const unreadOf = (tab) => {
      if (!eng || !digest) return false;
      if (!seen) return false;
      return digestHasNew(seen[tab], digest[tab]);
    };

    const stats = (snapshot && snapshot.stats) || {};
    const tabs = [
      ["assets", "자산 매핑"],
      ["env", "환경 적응"],
      ["agents", "에이전트"],
      ["sessions", "세션 터널"],
      ["findings", "취약점 성과"],
      ["chain", "공격 체인"],
      ["scores", "득점 목표"],
      ["report", "보고서"],
      ["knowledge", "지식 베이스"],
      ["skills", "스킬 라이브러리"],
    ];
    const full = isFullWindow();
    const openFull = () => {
      try {
        window.open(
          window.location.href.split("#")[0] + "#redteam-full",
          "_blank",
          "noopener",
        );
      } catch (e) {
        setErr("새 창을 열 수 없습니다: " + ((e && e.message) || e));
      }
    };
    const exitFull = () => {
      /* 먼저 스크립트로 연 창을 닫아 본다; 닫을 수 없으면 사이드바가 있는 일반 화면으로 돌아간다 */
      try {
        window.close();
      } catch (e) {
        /* 스크립트로 연 창이 아니면 닫을 수 없다 */
      }
      try {
        if (window.location.hash) {
          window.location.hash = "";
          window.location.reload();
        }
      } catch (e) {
        /* ignore */
      }
    };
    React.useEffect(() => {
      if (!full) return undefined;
      const onKey = (e) => {
        if (e.key === "Escape") exitFull();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [full]);

    let body;
    if (err) body = h("div", { className: "rt-err" }, err);
    /* 전역 페이지: 타깃이 없어도 볼 수 있다(지식 베이스 / 환경 적응 / 스킬 라이브러리 / 에이전트 개요) */
    else if (st.tab === "knowledge")
      body = h(KnowledgeTab, { refreshKey: refreshKey });
    else if (st.tab === "env") body = h(EnvTab, { refreshKey: refreshKey });
    else if (st.tab === "skills")
      body = h(SkillsTab, { refreshKey: refreshKey });
    else if (st.tab === "agents" || st.tab === "prompts")
      body = h(AgentsTab, { engagement: eng, refreshKey: refreshKey });
    else if (!eng) {
      body = h(
        "div",
        { className: "rt-pane" },
        h(
          "div",
          { className: "rt-card" },
          h("h4", null, "아직 타깃이 없습니다"),
          h(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--dsw-alias-label-secondary)",
                marginBottom: 8,
              },
            },
            "공방 드릴 대상 기관 이름을 입력하고 드릴을 만들어 자산 매핑을 시작하세요.",
          ),
          h(
            "div",
            { style: { display: "flex", gap: 8 } },
            h("input", {
              className: "rt-input",
              style: { flex: 1 },
              placeholder: "예: ○○테크 주식회사",
              value: newName,
              onChange: (e) => setNewName(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") openEngagement();
              },
            }),
            h(
              "button",
              {
                className: "rt-btn rt-btn-primary",
                disabled: creating,
                onClick: () => openEngagement(),
              },
              creating ? "생성 중…" : "타깃 만들기",
            ),
          ),
        ),
      );
    } else if (st.tab === "assets")
      body = h(AssetsTab, {
        engagement: eng,
        snapshot: snapshot,
        refreshKey: refreshKey,
        onRefresh: refreshAll,
        onData: () => loadSnapshot(eng),
      });
    else if (st.tab === "testing")
      body = h(AssetsTab, {
        engagement: eng,
        snapshot: snapshot,
        refreshKey: refreshKey,
        onRefresh: refreshAll,
        onData: () => loadSnapshot(eng),
      });
    else if (st.tab === "sessions")
      body = h(SessionTab, { engagement: eng, refreshKey: refreshKey });
    else if (st.tab === "findings")
      body = h(FindingsTab, { engagement: eng, refreshKey: refreshKey });
    else if (st.tab === "chain")
      body = h(ChainTab, { engagement: eng, refreshKey: refreshKey });
    else if (st.tab === "report")
      body = h(ReportTab, { engagement: eng, refreshKey: refreshKey });
    else if (st.tab === "attackfiles")
      body = h(FindingsTab, { engagement: eng, refreshKey: refreshKey });
    else if (st.tab === "scores")
      body = h(ScoreTab, { engagement: eng, refreshKey: refreshKey });
    else body = h("div", { className: "rt-empty" }, "알 수 없는 탭");

    const shellProps = full
      ? { className: "rt-full", style: { display: "flex" } }
      : embedded
        ? {
            className: "rt-dock rt-embedded",
            "data-open": "1",
            style: { width: "100%", display: "flex" },
          }
        : {
            className: "rt-dock",
            "data-open": st.open ? "1" : "0",
            style: {
              left: geom.x + "px",
              top: geom.y + "px",
              right: "auto",
              bottom: "auto",
              width: geom.w + "px",
              height: geom.h + "px",
              display: st.open ? "flex" : "none",
            },
          };

    return h(
      "div",
      shellProps,
      full || embedded
        ? null
        : h("div", {
            className: "rt-grip",
            title: "드래그해서 너비 조정",
            onMouseDown: startResizeLeft,
          }),
      full || embedded
        ? null
        : h("div", {
            className: "rt-resize-r",
            title: "드래그해서 너비 조정",
            onMouseDown: startResizeRight,
          }),
      full || embedded
        ? null
        : h("div", {
            className: "rt-resize-b",
            title: "드래그해서 높이 조정",
            onMouseDown: startResizeBottom,
          }),
      full || embedded
        ? null
        : h("div", {
            className: "rt-resize-c",
            title: "드래그해서 크기 조정",
            onMouseDown: startResizeCorner,
          }),
      h(
        "div",
        {
          className: "rt-head",
          onMouseDown: full || embedded ? undefined : startDrag,
          title:
            full || embedded
              ? undefined
              : "누른 채 드래그하면 패널이 이동합니다",
        },
        embedded
          ? null
          : h(
              "div",
              { className: "rt-title" },
              h("span", { className: "rt-dot" }),
              full ? "드릴 콘솔 · 전체 보기" : "드릴 콘솔",
              full
                ? h(
                    "span",
                    { className: "rt-tag", style: { marginLeft: 6 } },
                    "독립 창",
                  )
                : null,
            ),
        h(
          "select",
          {
            className: "rt-input rt-eng-select",
            style: {
              maxWidth: embedded ? "100%" : "170px",
              minWidth: embedded ? "160px" : undefined,
              flex: embedded ? "1 1 200px" : undefined,
            },
            value: eng || "",
            onChange: (e) => {
              setEng(e.target.value);
              loadSnapshot(e.target.value);
              /* “현재 타깃” 동기화: 네이티브 skill 디렉터리가 이 값으로 스킬 루트를 해석한다 */
              api({
                op: "activateEngagement",
                engagement: e.target.value,
              }).catch(() => {});
            },
          },
          h(
            "option",
            { value: "", disabled: true },
            engagements.length ? "타깃 선택" : "타깃 없음",
          ),
          engagements.map((x) =>
            h(
              "option",
              { key: x.id, value: x.id },
              x.name || x.id || "이름 없음",
            ),
          ),
        ),
        h("div", { className: "rt-spacer" }),
        embedded ? null : h(VersionBar, null),
        full
          ? h(
              "button",
              {
                className: "rt-btn",
                title: "사이드바가 있는 일반 화면으로 돌아갑니다(또는 Esc)",
                onClick: exitFull,
              },
              "전체 보기 종료",
            )
          : null,
        embedded
          ? null
          : h(
              "button",
              {
                className: "rt-btn",
                title: "명부·스냅샷과 현재 페이지 데이터를 새로 고칩니다",
                onClick: refreshAll,
              },
              "새로고침",
            ),
        full || embedded
          ? null
          : h(
              "button",
              {
                className: "rt-btn",
                title: "새 브라우저 창에서 전체 콘솔을 엽니다",
                onClick: openFull,
              },
              "전체 보기",
            ),
        full || embedded
          ? null
          : h(
              "button",
              {
                className: "rt-btn",
                title: "패널 접기",
                onClick: () => setUI({ open: false }),
              },
              "접기",
            ),
      ),
      /* 탭 바는 표준 tablist/tab 역할을 쓴다: 스크린 리더가 “몇 번째 탭인지, 선택되었는지”를 읽는다.
            키보드 사용자는 Tab 으로 들어와 Enter/Space 로 전환한다(clickable 이 제공). */
      h(
        "div",
        { className: "rt-tabs", role: "tablist" },
        tabs.map((t) => {
          const activate = () => {
            markTabSeen(t[0]);
            setUI({ tab: t[0] });
            /* 현재 페이지가 데이터를 다시 가져오게 한다: 탭을 바꿔도 이전 페이지 캐시가 남지 않도록 */
            setRefreshKey((k) => k + 1);
          };
          return h(
            "div",
            Object.assign({}, clickable(activate, { label: t[1] }), {
              key: t[0],
              className: "rt-tab" + (st.tab === t[0] ? " on" : ""),
              role: "tab",
              "aria-selected": st.tab === t[0] ? "true" : "false",
              title: unreadOf(t[0])
                ? t[1] +
                  ": 새 내용이 있습니다. 열어서 보면 빨간 점이 사라집니다"
                : t[1],
            }),
            t[1],
            unreadOf(t[0])
              ? /* 빨간 점은 순수 시각 정보이므로 스크린 리더용 텍스트 대체를 준다 */
                h("span", {
                  className: "rt-tab-dot",
                  "aria-label": "새 내용 있음",
                })
              : null,
          );
        }),
      ),
      h(
        "div",
        { className: "rt-body", key: "body-" + st.tab },
        h(RtBoundary, { key: st.tab }, body),
      ),
      h(
        "div",
        { className: "rt-foot" },
        h("span", null, "C 블록 " + (stats.segments || 0)),
        h(
          "span",
          null,
          "자산 " +
            (stats.assets || 0) +
            "(생존 " +
            (stats.liveAssets || 0) +
            ")",
        ),
        h("span", null, "포트 " + (stats.openPorts || 0)),
        h("span", null, "지문 " + (stats.fingerprints || 0)),
        h("span", null, "취약점 " + (stats.vulns || 0)),
        h(
          "span",
          null,
          "수동/능동 " +
            (stats.passiveSignals || 0) +
            "/" +
            (stats.activeSignals || 0),
        ),
        h("div", { className: "rt-spacer" }),
        full
          ? h(
              "span",
              null,
              "Esc 를 누르거나 오른쪽 위 “전체 보기 종료”를 누르면 사이드바가 있는 화면으로 돌아갑니다",
            )
          : null,
        h(
          "span",
          null,
          "SQLite · " +
            (snapshot && snapshot.engagement ? snapshot.engagement.name : ""),
        ),
      ),
    );
  }

  /* ---------------------------------------------------------- 진입 버튼 */
  function SidebarButton(props) {
    const st = useUI();
    return h(
      "button",
      {
        className: "rt-icon-btn" + (st.open ? " on" : ""),
        title: "RedTeam 콘솔(오른쪽 사이드바 상주)",
        onClick: () => setUI({ open: !st.open }),
      },
      h("span", { style: { fontSize: 14 } }, "⛨"),
      props.wide ? h("span", null, "RedTeam") : null,
    );
  }

  function HeaderButton() {
    const st = useUI();
    return h(
      "button",
      {
        className: "rt-hbtn" + (st.open ? " on" : ""),
        title: "RedTeam 콘솔(오른쪽 사이드바 상주)",
        onClick: () => setUI({ open: !st.open }),
      },
      "⛨ RedTeam",
    );
  }

  /** 사이드바 “전체 보기”: 새 브라우저 창에서 전체 콘솔을 연다(현재 창은 영향 없음). */
  function FullButton(props) {
    const open = () => {
      try {
        window.open(
          window.location.href.split("#")[0] + "#redteam-full",
          "_blank",
          "noopener",
        );
      } catch {
        /* 브라우저가 차단함 */
      }
    };
    return h(
      "button",
      {
        className: "rt-icon-btn",
        title:
          "전체 보기: 새 창에서 전체 콘솔을 엽니다(현재 창은 영향 없음; 새 창에서 Esc 로 종료)",
        onClick: open,
      },
      h("span", { style: { fontSize: 14 } }, "⛶"),
      props.wide ? h("span", null, "전체 보기") : null,
    );
  }

  /* ---------------------------------------------------------- 플러그인 진입점 */
  /** 유일한 하드 의존: 슬롯 레지스트리. */
  const inject = ["slots"];

  /**
   * 스타일 주입 + 세 곳의 슬롯. 스타일 태그와 너비 변수는 fiber 가 언마운트되면 함께 제거된다.
   * @param ctx - 클라이언트 루트 컨텍스트.
   */
  function applyDrillParts() {
    return {
      CSS: CSS,
      Panel: Panel,
      setUI: setUI,
      useUI: useUI,
      isFullWindow: isFullWindow,
      setDockWidth: setDockWidth,
    };
  }

  exports.inject = inject;
  return applyDrillParts();
})();
