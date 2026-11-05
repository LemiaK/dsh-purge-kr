// Generated from src/ by npm run build. Do not edit.
// Derived UI: YuJunZhiXue/dsh-purge (MIT), see LICENSE.
(()=>{const __PURGE_MODULE_URL__ = typeof document !== 'undefined' ? document.currentScript?.src : undefined;
window.__ModuleLoader__.load({id:"dsh-purge-panel",factory:(require)=>{
var module={exports:{}};var exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/entry.js
var entry_exports = {};
__export(entry_exports, {
  PanelOverlays: () => PanelOverlays,
  PurgeIcon: () => PurgeIcon,
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(entry_exports);

// src/shared/react.js
var import_react = __toESM(require("react"), 1);
var h = import_react.default.createElement;
var { useState, useEffect, useCallback, useRef, Component } = import_react.default;

// src/styles/base.css
var base_default = '/* Purge \uD328\uB110 \uAE30\uBCF8 \uC2A4\uD0C0\uC77C.\n   \uC0C9\xB7\uBC18\uACBD\xB7\uD3F0\uD2B8\xB7\uADF8\uB9BC\uC790\xB7\uBAA8\uC158\uC740 \uC804\uBD80 DSH 0.2.1-rc.5 \uB514\uC790\uC778 \uD1A0\uD070(--dsw-*)\uC5D0\uC11C \uC628\uB2E4.\n   \uD14C\uB9C8\uB97C \uBC14\uAFB8\uAC70\uB098 \uC0C8 \uD14C\uB9C8\uB97C \uC124\uCE58\uD574\uB3C4 \uC790\uB3D9\uC73C\uB85C \uB530\uB77C\uAC00\uB3C4\uB85D, \uD50C\uB7EC\uADF8\uC778 \uACE0\uC720 \uBCC0\uC218(--dshpp-*)\uB294\n   \uC774\uB984\uB9CC \uC720\uC9C0\uD558\uACE0 \uAC12\uC740 \uD1A0\uD070\uC744 \uAC00\uB9AC\uD0A4\uAC8C \uD55C\uB2E4. \uAD6C\uC870/\uD074\uB798\uC2A4 \uC774\uB984\uC740 \uADF8\uB300\uB85C \uB454\uB2E4.\n   \uD0C0\uC774\uD3EC\uADF8\uB798\uD53C\xB7\uAC04\uACA9\uC740 DSH \uC124\uC815 \uD654\uBA74 \uC2E4\uCE21 \uADDC\uACA9\uC744 \uB530\uB978\uB2E4:\n   \uBCF8\uBB38 14/22, \uBCF4\uC870 13/20, \uCEA1\uC158 12/18, \uC81C\uBAA9 600, \uAC04\uACA9 \uC2A4\uCF00\uC77C 4/8/12/16/20/24. */\n\n.dshpp-root {\n  --dshpp-display: var(--dsw-font-family);\n  --dshpp-sans: var(--dsw-font-family);\n  --dshpp-mono: var(--dsw-font-markdown-code-font-family);\n  --dshpp-bg: transparent;\n  --dshpp-paper: var(--dsw-alias-bg-layer-1);\n  --dshpp-ink: var(--dsw-alias-label-primary);\n  --dshpp-mute: var(--dsw-alias-label-secondary);\n  --dshpp-line: var(--dsw-alias-border-l2);\n  --dshpp-fill: var(--dsw-alias-interactive-bg-hover);\n  --dshpp-accent: var(--dsw-alias-button-primary-fill);\n  --dshpp-accent-soft: var(--dsw-alias-bg-layer-3);\n  --dshpp-ok: var(--dsw-alias-state-success-primary);\n  --dshpp-warn: var(--dsw-alias-state-warn-primary);\n  --dshpp-bad: var(--dsw-alias-state-error-primary);\n  max-width: 920px;\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  padding: 16px;\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dshpp-bg);\n  color: var(--dshpp-ink);\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  letter-spacing: 0;\n}\n/* \uD234\uBC14: \uD558\uB2E8 .5px \uAD6C\uBD84\uC120 + 12px \uD328\uB529(DSH \uC124\uC815 \uD5E4\uB354 \uADDC\uACA9) */\n.dshpp-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 8px;\n  padding: 12px 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n}\n/* \uC138\uADF8\uBA3C\uD2B8 \uC2A4\uC704\uCE58: DSH \uD0ED\uACFC \uAC19\uC740 \uC7AC\uC9C8(module-platform \uBC14\uD0D5 + \uD65C\uC131 layer-1) */\n.dshpp-switch {\n  display: inline-flex;\n  gap: 2px;\n  padding: 2px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-sm);\n  overflow: hidden;\n  background: var(--dsw-alias-bg-module-platform);\n}\n.dshpp-switch button {\n  appearance: none;\n  border: 0;\n  border-radius: var(--dsw-radius-xs);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-family: var(--dsw-font-family);\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: -0.01em;\n  height: 28px;\n  padding: 0 12px;\n  cursor: pointer;\n  transition:\n    background-color 0.18s ease,\n    color 0.18s ease;\n}\n.dshpp-switch button.is-on {\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-switch button:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n  outline-offset: 1px;\n}\n/* \uC139\uC158 \uCE74\uB4DC: \uADF8\uB9BC\uC790 \uC5C6\uC774 layer-1 \uBC14\uD0D5 + .5px \uAD6C\uBD84\uC120\uB9CC \uB0A8\uAE34\uB2E4 */\n.dshpp-panel {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dshpp-paper);\n  border-radius: var(--dsw-radius-lg);\n  padding: 16px;\n  box-shadow: none;\n}\n.dshpp-kicker {\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: 0.14em;\n  text-transform: uppercase;\n  color: var(--dsw-alias-label-tertiary);\n  margin: 0 0 4px;\n}\n.dshpp-title {\n  font-family: var(--dsw-font-family);\n  font-size: 20px;\n  line-height: 28px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  margin: 0;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 12px;\n  flex-wrap: wrap;\n}\n/* \uC139\uC158 \uC81C\uBAA9: \uC704 16px \xB7 \uC544\uB798 8px */\n.dshpp-sub {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  margin: 16px 0 8px;\n}\n.dshpp-sub h4 {\n  margin: 0;\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 600;\n  letter-spacing: 0;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-metrics {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 8px;\n  margin-bottom: 12px;\n}\n/* \uCE74\uB4DC \uC548\uC758 \uCE74\uB4DC: \uBC14\uD0D5\uC740 \uBE44\uC6B0\uACE0 \uAD6C\uBD84\uC120\uB9CC \uB0A8\uAE34\uB2E4 */\n.dshpp-metric {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: transparent;\n  padding: 12px;\n  min-height: 64px;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  border-radius: var(--dsw-radius-md);\n}\n.dshpp-metric b {\n  font-family: var(--dsw-font-family);\n  font-size: 18px;\n  font-weight: 600;\n  line-height: 24px;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-metric span {\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-bar {\n  height: 3px;\n  border-radius: var(--dsw-radius-xs);\n  background: var(--dsw-alias-border-l2);\n  overflow: hidden;\n  margin: 8px 0 12px;\n}\n.dshpp-bar > i {\n  display: block;\n  height: 100%;\n  background: var(--dsw-alias-button-primary-fill);\n  width: 0;\n  transition: width 0.16s ease-out;\n}\n.dshpp-group {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  margin: 0 0 12px;\n  background: transparent;\n  border-radius: var(--dsw-radius-md);\n  overflow: hidden;\n}\n.dshpp-group-h {\n  width: 100%;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border: 0;\n  background: transparent;\n  color: inherit;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  transition: background-color 0.16s ease-out;\n}\n.dshpp-group-h:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n.dshpp-group-h:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n  outline-offset: -2px;\n}\n.dshpp-group-h strong {\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 600;\n  letter-spacing: 0;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-group-h em {\n  font-style: normal;\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-tertiary);\n  flex: 1;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-count {\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n  line-height: 20px;\n}\n.dshpp-table th {\n  text-align: left;\n  font-weight: 500;\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: 0;\n  color: var(--dsw-alias-label-secondary);\n  padding: 8px 12px;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n}\n.dshpp-table td {\n  padding: 8px 12px;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n  vertical-align: middle;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-table tr:last-child td {\n  border-bottom: 0;\n}\n.dshpp-table tr.is-on td {\n  background: var(--dsw-alias-bg-layer-3);\n}\n.dshpp-id {\n  font-family: var(--dshpp-mono);\n  color: var(--dsw-alias-label-tertiary);\n  width: 42px;\n}\n.dshpp-actions {\n  text-align: right;\n  white-space: nowrap;\n}\n.dshpp-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.dshpp-row + .dshpp-row {\n  margin-top: 8px;\n}\n.dshpp-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  padding: 2px 8px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-sm);\n  line-height: 18px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-pill::before {\n  content: "";\n  width: 6px;\n  height: 6px;\n  border-radius: 50%;\n  background: currentColor;\n}\n.dshpp-pill.is-ok {\n  color: var(--dsw-alias-state-success-primary);\n  border-color: color-mix(\n    in srgb,\n    var(--dsw-alias-state-success-primary) 40%,\n    var(--dsw-alias-border-l2)\n  );\n}\n.dshpp-pill.is-wait {\n  color: var(--dsw-alias-state-warn-primary);\n  border-color: color-mix(\n    in srgb,\n    var(--dsw-alias-state-warn-primary) 40%,\n    var(--dsw-alias-border-l2)\n  );\n}\n.dshpp-pill.is-miss {\n  color: var(--dsw-alias-label-tertiary);\n}\n.dshpp-pill.is-bad {\n  color: var(--dsw-alias-state-error-primary);\n}\n/* \uBC84\uD2BC: DSH \uC2E4\uCE21 \uADDC\uACA9(\uB192\uC774 36/28, radius md/sm, \uD14D\uC2A4\uD2B8-\uC544\uC774\uCF58 gap 4, .16s ease-out, disabled .4) */\n.dshpp-btn {\n  appearance: none;\n  box-sizing: border-box;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  height: 36px;\n  padding: 0 14px;\n  border: 0;\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 500;\n  letter-spacing: -0.01em;\n  cursor: pointer;\n  transition:\n    background-color 0.16s ease-out,\n    color 0.16s ease-out,\n    border-color 0.16s ease-out,\n    opacity 0.16s ease-out;\n}\n.dshpp-btn:disabled {\n  cursor: not-allowed;\n  opacity: 0.4;\n}\n.dshpp-btn:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n}\n.dshpp-btn-primary {\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n}\n.dshpp-btn-primary:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n}\n.dshpp-btn-ghost {\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  border: 0.5px solid var(--dsw-alias-border-l3);\n}\n.dshpp-btn-ghost:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n.dshpp-btn-ghost:active:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n.dshpp-btn-danger {\n  background: transparent;\n  color: var(--dsw-alias-state-error-primary);\n  border: 0.5px solid\n    color-mix(\n      in srgb,\n      var(--dsw-alias-state-error-primary) 40%,\n      var(--dsw-alias-border-l3)\n    );\n}\n.dshpp-btn-danger:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover-danger);\n}\n.dshpp-btn-solid-danger {\n  background: var(--dsw-alias-state-error-primary);\n  color: var(--dsw-alias-label-primary-foreground);\n}\n.dshpp-btn-solid-danger:hover:not(:disabled) {\n  background: color-mix(\n    in srgb,\n    var(--dsw-alias-state-error-primary) 88%,\n    var(--dsw-alias-bg-base)\n  );\n}\n.dshpp-btn-tiny {\n  height: 28px;\n  padding: 0 10px;\n  border-radius: var(--dsw-radius-sm);\n  font-size: 12px;\n  line-height: 18px;\n}\n.dshpp-field,\n.dshpp-area {\n  width: 100%;\n  box-sizing: border-box;\n  font-family: var(--dshpp-mono);\n  font-size: 13px;\n  line-height: 20px;\n  padding: 8px 12px;\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  border-radius: var(--dsw-radius-sm);\n  transition:\n    border-color 0.16s ease-out,\n    background-color 0.16s ease-out;\n}\n.dshpp-field {\n  width: auto;\n  min-width: 140px;\n}\n.dshpp-cr-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin: 8px 0 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n.dshpp-cr-row label {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-cr-num {\n  width: 64px;\n  min-width: 64px;\n  height: 28px;\n  padding: 0 8px;\n}\n.dshpp-cr-text {\n  width: 120px;\n  min-width: 88px;\n  height: 28px;\n  padding: 0 8px;\n}\n.dshpp-ver {\n  width: 100%;\n  min-width: 0;\n  max-width: none;\n  height: 32px;\n  padding: 0 12px;\n  font-size: 13px;\n  line-height: 20px;\n}\n.dshpp-rel {\n  margin: 0 0 12px;\n}\n.dshpp-now {\n  display: flex;\n  align-items: baseline;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin: 0 0 4px;\n}\n.dshpp-now-label {\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dshpp-now-ver {\n  font-family: var(--dsw-font-family);\n  font-size: 20px;\n  line-height: 28px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-now-mark {\n  display: inline-flex;\n  align-items: center;\n  margin-left: 4px;\n  padding: 2px 8px;\n  border-radius: var(--dsw-radius-sm);\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  font-style: normal;\n  font-weight: 500;\n  line-height: 18px;\n  color: var(--dsw-alias-state-success-primary);\n  border: 0.5px solid\n    color-mix(\n      in srgb,\n      var(--dsw-alias-state-success-primary) 40%,\n      var(--dsw-alias-border-l2)\n    );\n  background: color-mix(\n    in srgb,\n    var(--dsw-alias-state-success-primary) 12%,\n    transparent\n  );\n}\n.dshpp-editions {\n  display: flex;\n  flex-direction: column;\n  margin: 8px 0 0;\n  border-top: 0.5px solid var(--dsw-alias-border-l2);\n}\n/* \uC124\uC815 \uD589: flex + gap 8 + 16px \uC138\uB85C \uD328\uB529 + .5px \uD558\uB2E8 \uAD6C\uBD84\uC120 */\n.dshpp-edition {\n  display: grid;\n  grid-template-columns: auto minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 12px;\n  padding: 16px 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n}\n.dshpp-edition-name {\n  display: inline-flex;\n  align-items: center;\n  gap: 0;\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 600;\n  letter-spacing: 0;\n  white-space: nowrap;\n}\n.dshpp-edition.is-on .dshpp-edition-name {\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-edition:not(.is-on) .dshpp-edition-name {\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-edition .dshpp-btn {\n  min-width: 118px;\n}\n.dshpp-rel .dshpp-notice {\n  display: block;\n  margin-top: 8px;\n  min-height: 18px;\n}\n@media (max-width: 560px) {\n  .dshpp-edition {\n    grid-template-columns: 1fr auto;\n    grid-template-areas: "name btn" "sel sel";\n  }\n  .dshpp-edition-name {\n    grid-area: name;\n  }\n  .dshpp-edition .dshpp-ver {\n    grid-area: sel;\n  }\n  .dshpp-edition .dshpp-btn {\n    grid-area: btn;\n  }\n}\n.dshpp-area {\n  min-height: 220px;\n  resize: vertical;\n}\n.dshpp-field:focus,\n.dshpp-area:focus {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n  outline-offset: 1px;\n  border-color: var(--dsw-alias-border-l4);\n}\n.dshpp-field:disabled,\n.dshpp-area:disabled {\n  opacity: 0.4;\n}\n.dshpp-ask {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin-top: 12px;\n  padding: 12px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n/* \uBAA8\uB2EC \uC2A4\uD06C\uB9BC: DSH \uB9C8\uC2A4\uD06C \uD1A0\uD070(bg-mask-1)\uACFC \uB9C8\uC2A4\uD06C \uBE14\uB7EC\uB97C \uADF8\uB300\uB85C \uC4F4\uB2E4 */\n.dshpp-modal-bg {\n  position: fixed;\n  inset: 0;\n  z-index: 80;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 20px;\n  background: var(--dsw-alias-bg-mask-1);\n  backdrop-filter: var(--dsw-mask-blur);\n}\n.dshpp-modal {\n  width: min(420px, 100%);\n  box-sizing: border-box;\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-primary);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-lg);\n  padding: 24px;\n  box-shadow: var(--dsw-elevation-panel);\n}\n.dshpp-modal h4 {\n  margin: 0 0 8px;\n  font-family: var(--dsw-font-family);\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-modal p {\n  margin: 0;\n  font-size: 14px;\n  line-height: 22px;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-modal-ops {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 16px;\n}\n.dshpp-restart-mask {\n  position: fixed;\n  inset: 0;\n  z-index: 12000;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  background: var(--dsw-alias-bg-mask-3);\n  backdrop-filter: var(--dsw-mask-blur);\n  font-family: var(--dsw-font-family);\n}\n.dshpp-restart-card {\n  width: min(420px, 100%);\n  box-sizing: border-box;\n  padding: 24px;\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-primary);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  box-shadow: var(--dsw-elevation-prominent);\n}\n.dshpp-restart-card h4 {\n  margin: 0 0 8px;\n  font-family: inherit;\n  font-size: 20px;\n  font-weight: 600;\n  line-height: 28px;\n  letter-spacing: -0.01em;\n  color: inherit;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-restart-card p {\n  margin: 0;\n  font-size: 14px;\n  font-weight: 400;\n  line-height: 22px;\n  color: var(--dsw-alias-label-secondary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-restart-card .dshpp-modal-ops {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 16px;\n}\n.dshpp-restart-card .dshpp-btn {\n  height: 36px;\n  padding: 0 14px;\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--dsw-alias-label-primary);\n  background: transparent;\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  border-radius: var(--dsw-radius-md);\n}\n.dshpp-restart-card .dshpp-btn-primary,\n.dshpp-restart-card .dshpp-btn-primary:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary-foreground);\n  background: var(--dsw-alias-button-primary-fill);\n  border-color: transparent;\n}\n.dshpp-notice {\n  font-size: 12px;\n  line-height: 18px;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-notice.is-ok {\n  color: var(--dsw-alias-state-success-primary);\n}\n.dshpp-notice.is-bad {\n  color: var(--dsw-alias-state-error-primary);\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n.dshpp-skel {\n  height: 12px;\n  border-radius: var(--dsw-radius-xs);\n  background: linear-gradient(\n    90deg,\n    var(--dsw-alias-interactive-bg-hover),\n    var(--dsw-alias-bg-layer-3),\n    var(--dsw-alias-interactive-bg-hover)\n  );\n  background-size: 200% 100%;\n  animation: dshpp-pulse 1.2s ease-in-out infinite;\n}\n.dshpp-active {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  padding: 12px;\n  margin-bottom: 12px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: transparent;\n  border-radius: var(--dsw-radius-md);\n  font-size: 13px;\n  line-height: 20px;\n}\n.dshpp-active b {\n  font-family: var(--dsw-font-family);\n  font-weight: 600;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-empty {\n  padding: 24px 12px;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n  text-align: center;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-split {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.dshpp-rulelist {\n  display: flex;\n  flex-direction: column;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  overflow: hidden;\n}\n.dshpp-rulebody {\n  max-height: 240px;\n  overflow: auto;\n}\n.dshpp-ruleitem {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  width: 100%;\n  padding: 12px;\n  border: 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n  background: transparent;\n  color: inherit;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: background-color 0.16s ease-out;\n}\n.dshpp-ruleitem:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n.dshpp-ruleitem.is-edit {\n  background: var(--dsw-alias-bg-layer-3);\n}\n.dshpp-rule-main {\n  flex: 1;\n  min-width: 0;\n}\n.dshpp-rule-name {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-rule-meta {\n  display: block;\n  margin-top: 4px;\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-tertiary);\n}\n.dshpp-rule-ops {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n}\n.dshpp-create {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 12px;\n  border-top: 0.5px solid var(--dsw-alias-border-l2);\n  background: transparent;\n}\n.dshpp-create-row {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n.dshpp-create .dshpp-field {\n  flex: 1;\n  min-width: 0;\n  width: auto;\n}\n.dshpp-editor {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-width: 0;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  padding: 12px;\n  min-height: 320px;\n}\n.dshpp-editor .dshpp-area {\n  flex: 1;\n  min-height: 240px;\n}\n.dshpp-editor-empty {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n  line-height: 20px;\n  min-height: 160px;\n}\n.dshpp-block {\n  padding: 16px 0;\n  border-top: 0.5px solid var(--dsw-alias-border-l2);\n}\n.dshpp-block-head {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 0 0 8px;\n}\n.dshpp-block-head h4 {\n  margin: 0;\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 600;\n  letter-spacing: 0;\n  flex: 1;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-block-hint {\n  margin: 8px 0 0;\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-policy-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.dshpp-policy-row > label {\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n  flex: 0 0 auto;\n}\n.dshpp-cwd-path {\n  margin: 0 0 8px;\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n  word-break: break-all;\n}\n.dshpp-cwd-list {\n  display: flex;\n  flex-direction: column;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  overflow: hidden;\n}\n.dshpp-cwd-item {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 12px;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n  cursor: pointer;\n  margin: 0;\n  transition: background-color 0.16s ease-out;\n}\n.dshpp-cwd-item:last-child {\n  border-bottom: 0;\n}\n.dshpp-cwd-item:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n.dshpp-cwd-item.is-on {\n  background: var(--dsw-alias-bg-layer-3);\n}\n.dshpp-cwd-item input {\n  margin: 3px 0 0;\n  flex: 0 0 auto;\n}\n.dshpp-cwd-main {\n  flex: 1;\n  min-width: 0;\n}\n.dshpp-cwd-name {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  font-family: var(--dsw-font-family);\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-cwd-badge {\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  padding: 2px 8px;\n  border-radius: var(--dsw-radius-sm);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-secondary);\n  line-height: 18px;\n}\n.dshpp-cwd-size {\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-cwd-sub {\n  margin-top: 4px;\n  font-family: var(--dshpp-mono);\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-tertiary);\n  word-break: break-all;\n}\n.dshpp-cwd-prev {\n  margin-top: 4px;\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n  max-height: 36px;\n  overflow: hidden;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n@keyframes dshpp-pulse {\n  0% {\n    background-position: 200% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n@media (max-width: 640px) {\n  .dshpp-metrics {\n    grid-template-columns: 1fr;\n  }\n  .dshpp-ruleitem {\n    flex-wrap: wrap;\n  }\n  .dshpp-rule-ops {\n    width: 100%;\n    justify-content: flex-end;\n  }\n}\n@media (prefers-reduced-motion: reduce) {\n  .dshpp-btn,\n  .dshpp-bar > i {\n    transition: none;\n  }\n  .dshpp-skel {\n    animation: none;\n  }\n}\n/* \uC778\uC99D/\uC57D\uAD00 \uBAA8\uB2EC: \uB77C\uC774\uD2B8\xB7\uB2E4\uD06C \uC804\uC6A9 \uC624\uBC84\uB77C\uC774\uB4DC\uB97C \uD1A0\uD070\uC73C\uB85C \uD761\uC218\uD588\uB2E4 */\n.dshpp-auth-mask {\n  position: fixed;\n  inset: 0;\n  z-index: 10100;\n  background: var(--dsw-alias-bg-mask-1);\n  backdrop-filter: var(--dsw-mask-blur);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 20px;\n  pointer-events: auto;\n}\n.dshpp-auth-modal {\n  width: min(680px, 100%);\n  max-height: min(88vh, 820px);\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 20px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-primary);\n  box-shadow: var(--dsw-elevation-panel);\n}\n.dshpp-auth-modal h2 {\n  margin: 0;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-auth-warn {\n  padding: 8px 12px;\n  border-radius: var(--dsw-radius-sm);\n  background: var(--dsw-alias-bg-layer-3);\n  color: var(--dsw-alias-state-warn-label);\n  font-size: 13px;\n  line-height: 20px;\n}\n.dshpp-auth-legal {\n  overflow: auto;\n  height: 300px;\n  margin: 0;\n  padding: 12px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-sm);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-primary);\n  font-size: 13px;\n  line-height: 20px;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-auth-legal h3 {\n  margin: 16px 0 4px;\n  font-size: 13px;\n  line-height: 20px;\n  font-weight: 600;\n  letter-spacing: 0;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-auth-legal h3:first-child {\n  margin-top: 0;\n}\n.dshpp-auth-legal p {\n  margin: 0 0 8px;\n}\n.dshpp-auth-checks {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-auth-checks label {\n  display: flex;\n  gap: 8px;\n  align-items: flex-start;\n}\n.dshpp-auth-checks label.locked {\n  opacity: 0.4;\n}\n.dshpp-auth-ops {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n.dshpp-auth-ops button {\n  appearance: none;\n  box-sizing: border-box;\n  height: 28px;\n  padding: 0 10px;\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  border-radius: var(--dsw-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  cursor: pointer;\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: -0.01em;\n  transition:\n    background-color 0.16s ease-out,\n    color 0.16s ease-out,\n    border-color 0.16s ease-out;\n}\n.dshpp-auth-ops button.primary {\n  background: var(--dsw-alias-button-primary-fill);\n  border-color: transparent;\n  color: var(--dsw-alias-label-primary-foreground);\n}\n.dshpp-auth-ops button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n.dshpp-icon-btn {\n  appearance: none;\n  box-sizing: border-box;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  height: 28px;\n  padding: 0 10px;\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  border-radius: var(--dsw-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: -0.01em;\n  white-space: nowrap;\n  flex: 0 0 auto;\n  transition:\n    background-color 0.16s ease-out,\n    color 0.16s ease-out,\n    border-color 0.16s ease-out;\n}\n.dshpp-icon-btn:hover {\n  border-color: var(--dsw-alias-border-l4);\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-icon-btn.on {\n  border-color: var(--dsw-alias-button-ghost-active-border);\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-button-ghost-active-fill);\n}\n.dshpp-hbtn {\n  appearance: none;\n  box-sizing: border-box;\n  display: inline-flex;\n  flex: 0 0 auto;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  height: 28px;\n  padding: 0 10px;\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  border-radius: var(--dsw-radius-sm);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 12px;\n  line-height: 18px;\n  letter-spacing: -0.01em;\n  white-space: nowrap;\n  transition:\n    background-color 0.16s ease-out,\n    color 0.16s ease-out,\n    border-color 0.16s ease-out;\n}\n.dshpp-hbtn:hover {\n  border-color: var(--dsw-alias-border-l4);\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-hbtn.on {\n  border-color: var(--dsw-alias-button-ghost-active-border);\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-button-ghost-active-fill);\n}\n.dshpp-live-dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  flex: none;\n  background: var(--dsw-alias-state-success-primary);\n  outline: 2px solid\n    color-mix(in srgb, var(--dsw-alias-state-success-primary) 24%, transparent);\n  outline-offset: -1px;\n}\n/* \uC720\uB9AC\uB294 \uD638\uC2A4\uD2B8 \uC0C9\uC0C1\uC744 \uB530\uB978\uB2E4. \uAE00\uC790 \uB450\uAED8\uC640 \uBC14\uD0D5\uC758 \uBD88\uD22C\uBA85\uB3C4\uB97C \uBD84\uB9AC\uD55C\uB2E4: \uAECD\uB370\uAE30\uB294 \uD22C\uBA85\uD558\uACE0, \uAE00\uC790\uB294 \uB354 \uC2E4\uD55C \uCE35 \uC704\uC5D0 \uC549\uB294\uB2E4. */\n';

// src/styles/native.css
var native_default = '/* DSH \uD50C\uB7EC\uADF8\uC778 \uC124\uC815 \uD398\uC774\uC9C0\uC5D0 \uADF8\uB300\uB85C \uC5B9\uD788\uB294 \uB124\uC774\uD2F0\uBE0C \uB808\uC774\uC544\uC6C3.\n   \uC0C9\xB7\uBC18\uACBD\xB7\uD3F0\uD2B8\xB7\uBAA8\uC158\uC740 \uC804\uBD80 DSH \uD1A0\uD070\uC744 \uC4F0\uACE0, \uB808\uC774\uC544\uC6C3\uB9CC \uC774 \uD30C\uC77C\uC774 \uB2F4\uB2F9\uD55C\uB2E4.\n   \uD0C0\uC774\uD3EC\uADF8\uB798\uD53C\xB7\uAC04\uACA9\uC740 DSH \uC124\uC815 \uD654\uBA74 \uC2E4\uCE21 \uADDC\uACA9(\uBCF8\uBB38 14/22, \uBCF4\uC870 13/20, \uCEA1\uC158 12/18,\n   \uC81C\uBAA9 600, \uAC04\uACA9 4/8/12/16/20/24)\uC744 \uB530\uB978\uB2E4. */\n\n.dshpp-native.dshpp-root {\n  --dshpp-display: var(--dsw-font-family);\n  --dshpp-sans: var(--dsw-font-family);\n  --dshpp-paper: var(--dsw-alias-bg-base);\n  --dshpp-bg: transparent;\n  --dshpp-line: var(--dsw-alias-border-l2);\n  --dshpp-ink: var(--dsw-alias-label-primary);\n  --dshpp-mute: var(--dsw-alias-label-secondary);\n  --dshpp-accent: var(--dsw-alias-button-primary-fill);\n  --dshpp-accent-soft: var(--dsw-alias-bg-layer-3);\n  --dshpp-fill: var(--dsw-alias-interactive-bg-hover);\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsh-content-font-size, 14px);\n  line-height: 22px;\n  letter-spacing: 0;\n  width: 100%;\n  height: 100%;\n  min-height: 0;\n  max-width: none;\n  padding: 0;\n  gap: 0;\n  border-radius: 0;\n  overflow: hidden;\n  box-sizing: border-box;\n}\n.dshpp-native * {\n  box-sizing: border-box;\n}\n.dshpp-native [hidden] {\n  display: none !important;\n}\n.dshpp-native-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 20px 20px 12px;\n  gap: 12px;\n  flex: none;\n}\n.dshpp-native-head h2 {\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  margin: 0;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-native-head p {\n  margin: 4px 0 0;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-tertiary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-native-badge {\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-tertiary);\n  white-space: nowrap;\n}\n/* \uD0ED: DSH \uC2E4\uCE21 \uADDC\uACA9(bg-module-platform \uCEE8\uD14C\uC774\uB108 + radius lg + \uD65C\uC131 bg-layer-1, 34px, .18s ease) */\n.dshpp-native-nav {\n  display: flex;\n  gap: 4px;\n  padding: 4px;\n  margin: 0 16px 12px;\n  border: 0;\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-module-platform);\n  flex: none;\n  overflow-x: auto;\n}\n.dshpp-native-nav button {\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 20px;\n  letter-spacing: -0.01em;\n  height: 34px;\n  padding: 0 12px;\n  border: 0;\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  white-space: nowrap;\n  cursor: pointer;\n  transition:\n    color 0.18s ease,\n    background-color 0.18s ease;\n}\n.dshpp-native-nav button[aria-pressed="true"] {\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-bg-layer-1);\n}\n.dshpp-native-content {\n  min-height: 0;\n  flex: 1;\n  overflow: auto;\n  padding: 20px;\n  scrollbar-gutter: stable;\n  overscroll-behavior: contain;\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-native .dshpp-panel {\n  border: 0;\n  border-radius: 0;\n  padding: 0;\n  background: transparent;\n  box-shadow: none;\n  min-width: 0;\n}\n.dshpp-native\n  :is(\n    h3,\n    h4,\n    .dshpp-title,\n    .dshpp-group-h strong,\n    .dshpp-metric b,\n    .dshpp-now-ver,\n    .dshpp-edition-name\n  ) {\n  font-family: var(--dsw-font-family);\n  font-size: 1em;\n  letter-spacing: 0;\n  font-weight: 600;\n}\n.dshpp-native .dshpp-metric b {\n  font-size: 16px;\n  line-height: 24px;\n  letter-spacing: -0.01em;\n}\n.dshpp-native .dshpp-head {\n  margin-bottom: 12px;\n}\n/* \uC139\uC158 \uC81C\uBAA9: \uC704 16px \xB7 \uC544\uB798 8px, \uC81C\uBAA9\uACFC \uCCAB \uD589 \uC0AC\uC774 \uAC04\uACA9\uC740 \uD56D\uC0C1 8px */\n.dshpp-native .dshpp-sub {\n  margin: 16px 0 8px;\n  flex-wrap: wrap;\n}\n.dshpp-native :is(button, input, select, textarea) {\n  font-family: inherit;\n  box-shadow: none;\n  background-image: none;\n  max-width: 100%;\n}\n/* \uC124\uC815 \uD398\uC774\uC9C0\uB294 \uBC00\uB3C4\uAC00 \uB192\uC73C\uBBC0\uB85C DSH \uC758 28px \uBCF4\uC870 \uBC84\uD2BC \uADDC\uACA9\uC744 \uC4F4\uB2E4 */\n.dshpp-native .dshpp-btn {\n  height: 28px;\n  min-height: 28px;\n  padding: 0 10px;\n  border-radius: var(--dsw-radius-sm);\n  font-size: 12px;\n  line-height: 18px;\n}\n.dshpp-native .dshpp-btn:hover:not(:disabled) {\n  box-shadow: none;\n  transform: none;\n}\n.dshpp-native .dshpp-btn-primary {\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n  border-color: transparent;\n}\n.dshpp-native .dshpp-btn-primary:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n  opacity: 1;\n}\n.dshpp-native :is(button, input, select, textarea):focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n  outline-offset: 2px;\n  box-shadow: none;\n}\n.dshpp-native .dshpp-area {\n  font-family: inherit;\n  font-size: 13px;\n  line-height: 20px;\n  min-height: 260px;\n  width: 100%;\n  border-radius: var(--dsw-radius-sm);\n  color: inherit;\n}\n.dshpp-native .dshpp-field {\n  font-size: 13px;\n  line-height: 20px;\n  color: inherit;\n}\n.dshpp-native .dshpp-metrics {\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 8px;\n}\n.dshpp-native .dshpp-metric:nth-child(2) {\n  display: none;\n}\n.dshpp-native .dshpp-metric {\n  min-height: 60px;\n  padding: 12px;\n  background: transparent;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-md);\n}\n.dshpp-native .dshpp-metric span {\n  font-size: 12px;\n  line-height: 18px;\n}\n.dshpp-native .dshpp-editions {\n  margin: 12px 0;\n  border: 0;\n}\n.dshpp-native summary {\n  cursor: pointer;\n  color: var(--dsw-alias-label-secondary);\n  padding: 8px 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n.dshpp-native .dshpp-edition {\n  grid-template-columns: 1fr auto;\n  gap: 8px;\n}\n.dshpp-native .dshpp-edition-name {\n  grid-column: 1/-1;\n}\n.dshpp-native .dshpp-edition .dshpp-btn {\n  min-width: 0;\n}\n.dshpp-native .dshpp-table {\n  table-layout: fixed;\n  font-size: 13px;\n  line-height: 20px;\n}\n.dshpp-native .dshpp-table td {\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n  padding: 8px;\n}\n.dshpp-native .dshpp-table th {\n  padding: 8px;\n}\n.dshpp-native .dshpp-group-h {\n  flex-wrap: wrap;\n  gap: 8px;\n}\n.dshpp-native .dshpp-group-h em {\n  font-size: 12px;\n  line-height: 18px;\n}\n.dshpp-native .dshpp-row {\n  gap: 8px;\n}\n.dshpp-native .dshpp-hint {\n  font-size: 13px !important;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-native .dshpp-more {\n  border-top: 0.5px solid var(--dsw-alias-border-l2);\n  padding-top: 20px;\n  margin-top: 24px;\n}\n.dshpp-native .dshpp-more p {\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n.dshpp-native .dshpp-attribution {\n  margin-top: 24px;\n  font-size: 12px !important;\n  line-height: 18px;\n  color: var(--dsw-alias-label-tertiary);\n}\n\n/* \uB4DC\uB9B4 \uCF58\uC194: \uC61B \uBC84\uC804\uC740 \uB4DC\uB798\uADF8 \uAC00\uB2A5\uD55C \uD50C\uB85C\uD305 \uCC3D\uC5D0\uC11C \uB3CC\uC558\uC9C0\uB9CC, \uC9C0\uAE08\uC740 \uC624\uB978\uCABD \uC0AC\uC774\uB4DC\uBC14\uC5D0 \uB0B4\uC7A5\uB418\uBBC0\uB85C \uC2A4\uC2A4\uB85C \uB192\uC774\uB97C \uC7A1\uACE0 \uC2A4\uD06C\uB864\uC744 \uD5C8\uC6A9\uD574\uC57C \uD55C\uB2E4 */\n.dshpp-native-drill {\n  width: 100%;\n  min-width: 0;\n  min-height: 72vh;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding-bottom: 24px;\n  box-sizing: border-box;\n}\n.dshpp-native-drill > .rt-dock.rt-embedded {\n  flex: 1 1 auto;\n  min-height: 0;\n  min-width: 0;\n  width: 100%;\n  height: auto;\n  overflow: visible;\n}\n/* \uC624\uB978\uCABD \uC0AC\uC774\uB4DC\uBC14\uB294 \uC544\uC8FC \uC881\uB2E4: \uC548\uCABD\uC758 \uBAA8\uB4E0 flex \uD589\uC774 \uC904\uBC14\uAFC8\uB420 \uC218 \uC788\uC5B4\uC57C \uD558\uACE0, \uC785\uB825\uCC3D\uC774 \uD615\uC81C \uC694\uC18C\uB97C 1ch \uD3ED\uC73C\uB85C \uBC00\uC5B4\uB0B4\uBA74 \uC548 \uB41C\uB2E4 */\n.dshpp-native-drill .rt-dock,\n.dshpp-native-drill .rt-dock * {\n  box-sizing: border-box;\n  min-width: 0;\n  word-break: normal;\n  overflow-wrap: anywhere;\n}\n.dshpp-native-drill .rt-dock input,\n.dshpp-native-drill .rt-dock textarea,\n.dshpp-native-drill .rt-dock select {\n  width: 100%;\n  max-width: 100%;\n}\n\n/* "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110"\uACFC "\uC790\uB3D9 \uD655\uC778 / N\uC2DC\uAC04\uB9C8\uB2E4"\uB97C \uD55C \uC904\uC5D0 \uB098\uB780\uD788: \uB192\uC774, \uBAA8\uC11C\uB9AC \uBC18\uACBD, \uAE00\uC790 \uD06C\uAE30\uB97C select \uC5D0 \uB9DE\uCD98\uB2E4.\n   \uAC19\uC740 \uCEF4\uD3EC\uB10C\uD2B8\uAC00 \uD50C\uB7EC\uADF8\uC778 \uC124\uC815 \uD398\uC774\uC9C0(.dshpp-native)\uC640 \uC67C\uCABD Purge \uC804\uCCB4 \uD398\uC774\uC9C0(.dshpp-page)\uC5D0 \uB3D9\uC2DC\uC5D0 \uBD99\uACE0,\n   \uB450 \uACF3\uC758 \uB8E8\uD2B8 class \uAC00 \uB2EC\uB77C \uC120\uD0DD\uC790\uAC00 \uC591\uCABD\uC744 \uBAA8\uB450 \uB36E\uC5B4\uC57C \uD55C\uB2E4. */\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-open {\n  height: 32px;\n  min-height: 32px;\n  padding: 0 12px;\n  border-radius: var(--dsw-radius-sm);\n  font-size: 12px;\n  letter-spacing: -0.01em;\n  white-space: nowrap;\n}\n/* \uC61B \uBC84\uC804\uC758 \uC81C\uBAA9 \uD589 \uC624\uB978\uCABD \uC815\uB82C \uB808\uC774\uC544\uC6C3\uC740 \uC678\uBD80 \uD638\uCD9C \uAC00\uB2A5\uC131\uC744 \uC704\uD574 \uB0A8\uACA8 \uB450\uC9C0\uB9CC, \uC8FC \uC9C4\uC785\uC810\uC740 \uC774\uBBF8 \uC124\uC815 \uD589\uC73C\uB85C \uC62E\uACBC\uB2E4. */\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-head h3 {\n  margin: 0;\n}\n/* \uC5C5\uB370\uC774\uD2B8 \uCC44\uB110 \uB300\uD654\uC0C1\uC790: \uD328\uB110\uC5D0\uB294 \uBBFF\uC744 \uB9CC\uD55C react-dom portal \uC774 \uC5C6\uC5B4 \uACE0\uC815 \uC704\uCE58 + \uC624\uBC84\uB808\uC774\uB85C \uC9C1\uC811 \uAD6C\uD604\uD55C\uB2E4.\n   \uC2A4\uD06C\uB9BC\uC740 DSH \uB9C8\uC2A4\uD06C \uD1A0\uD070, \uCE74\uB4DC\uB294 DSH \uCE74\uB4DC \uD1A0\uD070\uC744 \uC4F4\uB2E4. */\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-mask {\n  position: fixed;\n  inset: 0;\n  z-index: 12050;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 20px;\n  background: var(--dsw-alias-bg-mask-1);\n  backdrop-filter: var(--dsw-mask-blur);\n  pointer-events: auto;\n}\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-card {\n  width: min(440px, 100%);\n  max-height: min(88vh, 720px);\n  overflow: auto;\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 20px;\n  border-radius: var(--dsw-radius-lg);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-primary);\n  box-shadow: var(--dsw-elevation-panel);\n}\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-title {\n  margin: 0 0 8px;\n  font-family: inherit;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-label {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-field {\n  width: 100%;\n  min-width: 0;\n  font-size: 13px;\n  line-height: 20px;\n}\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-check {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n:is(.dshpp-native, .dshpp-page) .dshpp-updch-ops {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 16px;\n}\n';

// src/styles/page.css
var page_default = '/* \uC804\uCCB4 \uD398\uC774\uC9C0(\uC67C\uCABD \uC0AC\uC774\uB4DC\uBC14 \uC9C4\uC785\uC810) \uC2A4\uD0C0\uC77C.\n   DSH \uC124\uC815 \uD654\uBA74\uACFC \uAC19\uC740 \uB9AC\uB4EC\uC73C\uB85C \uC815\uB3C8\uD55C\uB2E4: \uC88C\uC6B0 20px \xB7 \uC0C1\uB2E8 16px \xB7 \uC139\uC158 \uAC04 24px,\n   \uAC04\uACA9 \uC2A4\uCF00\uC77C 4/8/12/16/20/24, \uC124\uC815 \uD589 padding 16px 0 + .5px \uD558\uB2E8 \uAD6C\uBD84\uC120.\n   \uC0C9\xB7\uC120\xB7\uBC18\uACBD\xB7\uBAA8\uC158\uC740 \uC804\uBD80 DSH \uB514\uC790\uC778 \uD1A0\uD070(--dsw-*)\uC774\uACE0, \uD0C0\uC774\uD3EC\uB294 DSH \uD3F0\uD2B8 \uD1A0\uD070\uC758\n   \uD06C\uAE30/\uD589\uAC04(14/22 \uBCF8\uBB38, 13/20 \uBCF4\uC870, 12/18 \uCEA1\uC158)\uC744 \uADF8\uB300\uB85C \uAC00\uC838\uB2E4 \uC4F4\uB2E4. */\n/* --dshpp-* \uC774\uB984\uC740 \uD074\uB798\uC2A4/\uAD6C\uC870/\uC0AC\uC6A9\uC790 \uD14C\uB9C8 \uC624\uBC84\uB77C\uC774\uB4DC \uD638\uD658\uC744 \uC704\uD574 \uB0A8\uAE34 \uBCC4\uCE6D\uC774\uACE0,\n   \uAC12\uC740 \uC804\uBD80 DSH \uD1A0\uD070\uC774\uB2E4(base.css \uAC00 \uD398\uC774\uC9C0 \uBB38\uB9E5\uC5D0\uC11C \uC774 \uC774\uB984\uC744 \uCC38\uC870\uD55C\uB2E4). */\n.dshpp-page {\n  --dshpp-line: var(--dsw-alias-border-l1);\n  --dshpp-line-strong: var(--dsw-alias-border-l2);\n  --dshpp-fg: var(--dsw-alias-label-primary);\n  --dshpp-ink: var(--dsw-alias-label-primary);\n  --dshpp-mute: var(--dsw-alias-label-secondary);\n  --dshpp-bg: var(--dsw-alias-bg-layer-1);\n  --dshpp-paper: var(--dsw-alias-bg-layer-1);\n  --dshpp-bg-2: var(--dsw-alias-bg-layer-2);\n  --dshpp-mono: var(--dsw-font-markdown-code-font-family);\n  --dshpp-accent: var(--dsw-alias-brand-primary);\n  --dshpp-accent-soft: var(--dsw-alias-bg-layer-3);\n  --dshpp-fill: var(--dsw-alias-interactive-bg-hover);\n  --dshpp-ok: var(--dsw-alias-state-success-primary);\n  --dshpp-warn: var(--dsw-alias-state-warn-primary);\n  --dshpp-bad: var(--dsw-alias-state-error-primary);\n  /* \uC608\uC804 \uACE0\uC815\uC0C9 \uC790\uB9AC(--dshpp-solid*)\uB3C4 DSH \uBC84\uD2BC/\uC0C1\uD0DC \uD1A0\uD070 \uBCC4\uCE6D\uC73C\uB85C \uB0A8\uAE34\uB2E4. */\n  --dshpp-solid: var(--dsw-alias-button-primary-fill);\n  --dshpp-solid-hover: var(--dsw-alias-button-primary-hover);\n  --dshpp-solid-danger: var(--dsw-alias-state-error-primary);\n  --dshpp-solid-danger-hover: var(--dsw-alias-state-error-secondary);\n  box-sizing: border-box;\n  width: 100%;\n  /* DSH \uD50C\uB7EC\uADF8\uC778 \uC124\uC815 \uD654\uBA74\uACFC \uAC19\uC740 \uD3ED \uC0C1\uD55C(\uB113\uC740 \uD654\uBA74\uC5D0\uC11C\uB294 \uC911\uC559 \uC815\uB82C, \uC881\uC73C\uBA74 100%). */\n  max-width: 1400px;\n  margin-inline: auto;\n  height: 100%;\n  min-height: 0;\n  overflow: auto;\n  /* DSH \uC124\uC815 \uD654\uBA74\uCC98\uB7FC \uC2A4\uD06C\uB864\uBC14\uB294 \uAC10\uCD94\uACE0 \uC2A4\uD06C\uB864 \uAE30\uB2A5\uB9CC \uB0A8\uAE34\uB2E4. */\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n  padding: 16px 24px 48px;\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n  letter-spacing: 0;\n  -webkit-font-smoothing: antialiased;\n}\n.dshpp-page::-webkit-scrollbar {\n  width: 0;\n  height: 0;\n  display: none;\n}\n/* \uC548\uCABD \uBAA9\uB85D/\uC5D0\uB514\uD130 \uC2A4\uD06C\uB864 \uC601\uC5ED\uB3C4 \uAC19\uC740 \uADDC\uCE59\uC744 \uB530\uB978\uB2E4. */\n.dshpp-page\n  :is(\n    .dshpp-rulelist,\n    .dshpp-cwd-list,\n    .dshpp-editor,\n    .dshpp-auth-legal,\n    .dshpp-fold-inner,\n    .dshpp-page-tabs\n  ) {\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n}\n.dshpp-page\n  :is(\n    .dshpp-rulelist,\n    .dshpp-cwd-list,\n    .dshpp-editor,\n    .dshpp-auth-legal,\n    .dshpp-fold-inner,\n    .dshpp-page-tabs\n  )::-webkit-scrollbar {\n  width: 0;\n  height: 0;\n  display: none;\n}\n.dshpp-page *,\n.dshpp-page *::before,\n.dshpp-page *::after {\n  box-sizing: border-box;\n}\n\n/* \uD55C\uAD6D\uC5B4 \uC124\uBA85\uBB38\uC740 \uB2E8\uC5B4 \uC911\uAC04\uC5D0\uC11C \uB04A\uC9C0 \uC54A\uB294\uB2E4(word-break: keep-all).\n   \uB118\uCE60 \uB54C\uB9CC overflow-wrap \uC73C\uB85C \uC548\uC804\uD558\uAC8C \uC811\uB294\uB2E4. */\n.dshpp-page :is(p, li, dd, dt, summary, .dshpp-muted, .dshpp-hint, .dshpp-note),\n.dshpp-page :is(.dshpp-tip, .dshpp-warn, .dshpp-strip, .dshpp-hero-hint),\n.dshpp-page .dshpp-page-title p {\n  word-break: keep-all;\n  overflow-wrap: anywhere;\n}\n\n/* \uC81C\uBAA9\xB7\uD0ED\xB7\uBC84\uD2BC\uC740 \uC790\uAC04\uC744 \uC0B4\uC9DD \uC870\uC778\uB2E4(DSH \uC640 \uAC19\uC740 -0.01em). \uBCF8\uBB38\uC740 0. */\n.dshpp-page :is(h1, h2, h3, h4),\n.dshpp-page .dshpp-page-tabs button,\n.dshpp-page .dshpp-btn,\n.dshpp-page .dshpp-help-btn,\n.dshpp-page .dshpp-group-h,\n.dshpp-page .dshpp-fold > summary,\n.dshpp-page .dshpp-fold-inline > summary {\n  letter-spacing: -0.01em;\n  word-break: keep-all;\n}\n\n.dshpp-page-head {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-width: 0;\n}\n.dshpp-page-glyph {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 34px;\n  height: 34px;\n  border-radius: var(--dsw-radius-md);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-brand-primary);\n  flex: none;\n}\n.dshpp-page-title {\n  min-width: 0;\n}\n.dshpp-page-title h1 {\n  margin: 0;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n}\n.dshpp-page-title p {\n  margin: 2px 0 0;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  font-size: var(--dsw-font-xs-13-font-size);\n  line-height: var(--dsw-font-xs-13-line-height);\n  color: var(--dsw-alias-label-secondary);\n}\n/* \uBC30\uC9C0/\uD544: \uCEA1\uC158 12/18, padding 2px 8px, radius sm, layer-2 \uBC14\uD0D5 + .5px \uC120 */\n.dshpp-page-ver {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 2px 8px;\n  border-radius: var(--dsw-radius-sm);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  letter-spacing: 0;\n  white-space: nowrap;\n}\n\n/* \uC0C1\uB2E8 \uD55C \uC904 \uC0C1\uD0DC \uC694\uC57D: \uCE74\uB4DC \uB300\uC2E0 DSH \uC758 subtitle \uD589\uACFC \uB9DE\uCD98\uB2E4 */\n.dshpp-strip {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px 16px;\n  margin: 12px 0 0;\n  padding: 12px 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-strip-item {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  min-width: 0;\n}\n.dshpp-strip-item b {\n  color: var(--dsw-alias-label-primary);\n  font-weight: 600;\n}\n.dshpp-dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: var(--dsw-alias-label-secondary);\n  flex: none;\n}\n.dshpp-dot.is-ok {\n  background: var(--dsw-alias-state-success-primary);\n}\n.dshpp-dot.is-warn {\n  background: var(--dsw-alias-state-warn-primary);\n}\n.dshpp-dot.is-bad {\n  background: var(--dsw-alias-state-error-primary);\n}\n\n/* \uD0ED: DSH \uC54C\uC57D\uD615 \uD0ED. \uCEE8\uD14C\uC774\uB108\uB294 bg-module-platform, \uD65C\uC131 \uD0ED\uC740 bg-layer-1. */\n.dshpp-page-tabs {\n  display: flex;\n  gap: 4px;\n  margin: 16px 0 0;\n  padding: 4px;\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-module-platform);\n  overflow-x: auto;\n  scrollbar-width: none;\n}\n.dshpp-page-tabs::-webkit-scrollbar {\n  display: none;\n}\n.dshpp-page-tabs button {\n  appearance: none;\n  flex: none;\n  height: 34px;\n  padding: 0 12px;\n  border: 0;\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: 20px;\n  letter-spacing: -0.01em;\n  cursor: pointer;\n  white-space: nowrap;\n  transition:\n    color 0.18s ease,\n    background-color 0.18s ease;\n}\n.dshpp-page-tabs button:hover {\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-page-tabs button[aria-selected="true"] {\n  background: var(--dsw-alias-bg-layer-1);\n  color: var(--dsw-alias-label-primary);\n  font-weight: 600;\n}\n.dshpp-page-tabs button:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-alias-border-l4);\n  outline-offset: -2px;\n}\n\n/* \uBCF8\uBB38/\uC139\uC158 \uB9AC\uB4EC: \uC139\uC158 \uC0AC\uC774\uB294 24px */\n.dshpp-page-body {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  padding-top: 16px;\n  min-width: 0;\n}\n.dshpp-sec {\n  display: flex;\n  flex-direction: column;\n  gap: 24px;\n  min-width: 0;\n}\n.dshpp-sec[hidden] {\n  display: none;\n}\n\n/* \uCE74\uB4DC/\uD328\uB110: \uADF8\uB9BC\uC790 \uC5C6\uC774 layer-1 \uB2E8\uC77C \uBC30\uACBD + .5px \uC120. base.css \uC758 \uADF8\uB9BC\uC790\xB7\uC774\uC911 \uBC30\uACBD\uC744 \uB36E\uB294\uB2E4. */\n.dshpp-page :is(.dshpp-card, .dshpp-panel) {\n  display: block;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-layer-1);\n  box-shadow: none;\n  padding: 16px;\n  margin: 0;\n  min-width: 0;\n}\n.dshpp-page section.dshpp-panel {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-layer-1);\n  box-shadow: none;\n  padding: 16px;\n  margin: 0;\n  min-width: 0;\n}\n/* \uCE74\uB4DC \uC548 \uD615\uC81C \uC694\uC18C\uB294 12px \uB9AC\uB4EC. \uC81C\uBAA9\uC740 \uC704 16px/\uC544\uB798 8px \uC774\uACE0, \uC544\uB798 \uAC12\uC740 \uB9AC\uB4EC\uACFC \uBCD1\uD569\uB418\uC5B4 12px \uB85C \uC218\uB834\uD55C\uB2E4. */\n.dshpp-page :is(.dshpp-card, .dshpp-panel) > * + * {\n  margin-top: 12px;\n}\n.dshpp-page :is(.dshpp-card, .dshpp-panel) :is(h3, h4) {\n  margin: 16px 0 8px;\n  font-size: 15px;\n  line-height: 22px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-page :is(.dshpp-card, .dshpp-panel) :is(h3, h4):first-child {\n  margin-top: 0;\n}\n.dshpp-page\n  :is(.dshpp-card, .dshpp-panel)\n  :is(h3, h4):first-child:not(:last-child) {\n  margin-bottom: 12px;\n}\n/* \uC18C\uC81C\uBAA9 \uD589: \uC81C\uBAA9\uACFC \uC6B0\uCE21 \uC561\uC158\uC744 \uD55C \uC904\uC5D0 */\n.dshpp-page .dshpp-sub {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  flex-wrap: wrap;\n  margin: 16px 0 8px;\n}\n.dshpp-page .dshpp-sub > :is(h3, h4) {\n  margin: 0;\n  font-size: 15px;\n  line-height: 22px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n}\n\n/* \uC124\uC815 \uD589: \uC67C\uCABD \uB77C\uBCA8 / \uC624\uB978\uCABD \uCEE8\uD2B8\uB864. DSH \uC124\uC815 \uD654\uBA74\uACFC \uAC19\uC740 16px \uC0C1\uD558 \uC5EC\uBC31 + .5px \uAD6C\uBD84\uC120 */\n.dshpp-page .dshpp-policy-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  padding: 16px 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n}\n.dshpp-page .dshpp-policy-row > label {\n  flex: 0 0 auto;\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n  letter-spacing: 0;\n  color: var(--dsw-alias-label-primary);\n}\n/* .dshpp-field / .dshpp-area \uB294 input\xB7select\xB7textarea \uC5D0 \uBD99\uB294 \uCEE8\uD2B8\uB864 \uD074\uB798\uC2A4\uB2E4(\uB798\uD37C\uAC00 \uC544\uB2C8\uB2E4).\n   \uC5EC\uAE30\uC11C\uB294 \uD3F0\uD2B8\xB7\uC120\xB7\uBC14\uD0D5\uB9CC \uD398\uC774\uC9C0 \uADDC\uACA9\uC73C\uB85C \uB9DE\uCD98\uB2E4. */\n.dshpp-page .dshpp-field {\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n  letter-spacing: 0;\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-bg-layer-2);\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  border-radius: var(--dsw-radius-sm);\n  padding: 8px 10px;\n  max-width: 100%;\n}\n.dshpp-page .dshpp-field:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-alias-border-l4);\n  outline-offset: 1px;\n}\n\n/* \uBCF4\uC870 \uC124\uBA85: 13/20 */\n.dshpp-page .dshpp-muted,\n.dshpp-page .dshpp-hint {\n  margin: 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xs-13-font-size);\n  line-height: var(--dsw-font-xs-13-line-height);\n}\n.dshpp-page .dshpp-note {\n  margin: 4px 0 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n.dshpp-layout-details > summary {\n  cursor: pointer;\n  padding: 8px 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n\n/* \uBE14\uB85D(\uC815\uCC45/\uC0DD\uC131/\uBAA9\uB85D): \uCE74\uB4DC \uC548\uC5D0\uC11C \uC88C\uC6B0 \uB4E4\uC5EC\uC4F0\uAE30\uB97C \uB9CC\uB4E4\uC9C0 \uC54A\uACE0 .5px \uC120\uC73C\uB85C\uB9CC \uB098\uB208\uB2E4 */\n.dshpp-page .dshpp-block,\n.dshpp-page .dshpp-create {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 12px 0;\n  border-top: 0.5px solid var(--dsw-alias-border-l2);\n  background: transparent;\n  min-width: 0;\n}\n/* \uC815\uCC45 \uD589\uC774 \uC774\uBBF8 \uD558\uB2E8 \uC120\uC744 \uADF8\uB9AC\uBBC0\uB85C \uC0DD\uC131 \uBE14\uB85D\uC758 \uC704\uCABD \uC120\uC740 \uACB9\uCE58\uC9C0 \uC54A\uAC8C \uD55C\uB2E4 */\n.dshpp-page .dshpp-policy-row + .dshpp-create {\n  border-top: 0;\n}\n.dshpp-page .dshpp-create-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n.dshpp-page .dshpp-row {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n.dshpp-page input,\n.dshpp-page select,\n.dshpp-page textarea {\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-bg-layer-2);\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  border-radius: var(--dsw-radius-sm);\n  padding: 8px 10px;\n  max-width: 100%;\n}\n.dshpp-page input:focus-visible,\n.dshpp-page select:focus-visible,\n.dshpp-page textarea:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-alias-border-l4);\n  outline-offset: 1px;\n}\n.dshpp-page textarea {\n  width: 100%;\n  min-height: 320px;\n  resize: vertical;\n  font-family: var(--dsw-font-markdown-code-font-family);\n  font-size: var(--dsw-font-xs-13-font-size);\n  line-height: var(--dsw-font-xs-13-line-height);\n  background: var(--dsw-alias-markdown-code-block);\n}\n\n/* \uCF54\uB4DC/\uD504\uB9AC: DSH markdown \uCF54\uB4DC \uD1A0\uD070. \uD504\uB9AC \uBE14\uB85D\uC740 12/18 \xB7 padding 12px \xB7 radius sm */\n.dshpp-page :is(code, kbd, samp, pre) {\n  font-family: var(--dsw-font-markdown-code-font-family);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n.dshpp-page :is(code, kbd, samp) {\n  padding: 1px 4px;\n  border-radius: var(--dsw-radius-xs);\n  background: var(--dsw-alias-markdown-inline-code);\n}\n.dshpp-page pre {\n  margin: 0;\n  padding: 12px;\n  border-radius: var(--dsw-radius-sm);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-markdown-code-block);\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n  overflow-x: auto;\n}\n\n/* \uBC84\uD2BC: DSH \uBC84\uD2BC \uADDC\uACA9(36/28, radius md/sm, .16s ease-out) \uADF8\uB300\uB85C */\n.dshpp-page .dshpp-btn {\n  box-sizing: border-box;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 4px;\n  height: 36px;\n  min-height: 0;\n  padding: 0 14px;\n  border: none;\n  border-radius: var(--dsw-radius-md);\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n  letter-spacing: -0.01em;\n  cursor: pointer;\n  white-space: nowrap;\n  transition:\n    background-color 0.16s ease-out,\n    color 0.16s ease-out,\n    border-color 0.16s ease-out,\n    opacity 0.15s ease-out;\n}\n.dshpp-page .dshpp-btn:disabled {\n  opacity: 0.4;\n  cursor: not-allowed;\n}\n.dshpp-page .dshpp-btn:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-alias-border-l4);\n  outline-offset: 2px;\n}\n.dshpp-page .dshpp-btn-primary {\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n}\n.dshpp-page .dshpp-btn-primary:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n}\n.dshpp-page .dshpp-btn-ghost {\n  background: transparent;\n}\n.dshpp-page .dshpp-btn-ghost:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n.dshpp-page .dshpp-btn-ghost:active:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-active);\n}\n.dshpp-page .dshpp-btn-outline {\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  background: transparent;\n}\n.dshpp-page .dshpp-btn-outline:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n/* \uC0C1\uB2E8 \uACE0\uC815 \uC561\uC158 \uBC14\uB294 DSH \uD234\uBC14 \uBC84\uD2BC \uC0C9\uC744 \uC4F4\uB2E4(primary/outline \uC740 \uAC01\uC790 \uC0C9 \uC720\uC9C0) */\n.dshpp-page .dshpp-actions .dshpp-btn-ghost {\n  background: var(--dsw-alias-button-tool-bar-fill);\n}\n.dshpp-page .dshpp-actions .dshpp-btn-ghost:hover:not(:disabled) {\n  background: var(--dsw-alias-button-tool-bar-hover);\n}\n/* danger \uB294 \uD14D\uC2A4\uD2B8\uD615: \uBC30\uACBD \uC5C6\uC774 \uAE00\uC790\uC0C9\uB9CC state-error-primary \uB85C \uB0AE\uCD98\uB2E4. */\n.dshpp-page .dshpp-btn-danger,\n.dshpp-page .dshpp-btn-solid-danger {\n  background: transparent;\n  color: var(--dsw-alias-state-error-primary);\n}\n.dshpp-page .dshpp-btn-danger:hover:not(:disabled),\n.dshpp-page .dshpp-btn-solid-danger:hover:not(:disabled) {\n  background: var(--dsw-alias-interactive-bg-hover-danger);\n  color: var(--dsw-alias-state-error-primary);\n}\n.dshpp-page .dshpp-btn-tiny {\n  height: 28px;\n  padding: 0 10px;\n  border-radius: var(--dsw-radius-sm);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n\n/* \uBC30\uC9C0/\uD544: 12/18, padding 2px 8px, radius sm, layer-2 \uBC14\uD0D5 + .5px \uC120.\n   \uC0C1\uD0DC\uB294 \uAE00\uC790\uC0C9\uB9CC \uBC14\uAFBC\uB2E4(\uD14C\uB450\uB9AC/\uBC30\uACBD\uC5D0 \uC0C1\uD0DC\uC0C9\uC744 \uC11E\uC9C0 \uC54A\uB294\uB2E4). */\n.dshpp-page .dshpp-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 2px 8px;\n  border-radius: var(--dsw-radius-sm);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-label-secondary);\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  letter-spacing: 0;\n}\n.dshpp-page .dshpp-pill.is-ok {\n  color: var(--dsw-alias-state-success-primary);\n}\n.dshpp-page .dshpp-pill.is-wait {\n  color: var(--dsw-alias-state-warn-primary);\n}\n.dshpp-page .dshpp-pill.is-bad {\n  color: var(--dsw-alias-state-error-primary);\n}\n\n/* \uD45C: \uD5E4\uB354 \uBC30\uACBD \uC5C6\uC774 .5px \uC120\uB9CC. \uBCF8\uBB38 13/20, \uCEA1\uC158 12/18 */\n.dshpp-page .dshpp-table {\n  width: 100%;\n  border-collapse: collapse;\n  border: 0;\n  font-size: var(--dsw-font-xs-13-font-size);\n  line-height: var(--dsw-font-xs-13-line-height);\n  letter-spacing: 0;\n}\n.dshpp-page .dshpp-table th,\n.dshpp-page .dshpp-table td {\n  text-align: left;\n  padding: 12px 8px;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n  vertical-align: top;\n  background: transparent;\n  overflow-wrap: anywhere;\n}\n/* \uD45C \uC88C\uC6B0 \uB05D\uC740 \uADF8\uB8F9/\uCE74\uB4DC \uD14D\uC2A4\uD2B8\uC640 \uAC19\uC740 \uAE30\uC900\uC120\uC5D0 \uB9DE\uCD98\uB2E4 */\n.dshpp-page .dshpp-table :is(th, td):first-child {\n  padding-left: 0;\n}\n.dshpp-page .dshpp-table :is(th, td):last-child {\n  padding-right: 0;\n}\n.dshpp-page .dshpp-table th {\n  color: var(--dsw-alias-label-secondary);\n  font-weight: 500;\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  letter-spacing: 0;\n}\n.dshpp-page .dshpp-table tbody tr:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n/* \uADF8\uB8F9(\uD328\uCE58 \uC0C1\uC138): layer-1 \uBC14\uD0D5 + .5px \uD558\uB2E8 \uAD6C\uBD84\uC120\uC758 \uC124\uC815 \uD589 \uC2A4\uD0C0\uC77C. \uCE74\uB4DC/\uADF8\uB9BC\uC790 \uC5C6\uC74C. */\n.dshpp-page .dshpp-group {\n  border: 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 0;\n  margin: 0;\n  background: var(--dsw-alias-bg-layer-1);\n  overflow: visible;\n}\n.dshpp-page .dshpp-group:last-child {\n  border-bottom: 0;\n}\n.dshpp-page .dshpp-group-h {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  width: 100%;\n  border: 0;\n  background: transparent;\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n  letter-spacing: -0.01em;\n  padding: 16px 0;\n  cursor: pointer;\n}\n.dshpp-page .dshpp-group-h:hover {\n  color: var(--dsw-alias-label-primary);\n}\n.dshpp-page .dshpp-group-h strong {\n  font-weight: 600;\n}\n.dshpp-page .dshpp-group-h em {\n  font-style: normal;\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-page .dshpp-count {\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  font-variant-numeric: tabular-nums;\n}\n\n/* \uB4DC\uB9B4 \uCF58\uC194\uC774 \uB0A8\uC740 \uB192\uC774\uB97C \uC804\uBD80 \uCC28\uC9C0\uD55C\uB2E4 */\n.dshpp-page-drill {\n  min-height: 60vh;\n}\n.dshpp-page-drill .rt-dock.rt-embedded {\n  width: 100%;\n  min-width: 0;\n}\n\n.dshpp-page-foot {\n  margin-top: 24px;\n  padding-top: 16px;\n  border-top: 0.5px solid var(--dsw-alias-border-l2);\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n\n/* \uC774\uB984 \uC124\uBA85: \uC81C\uBAA9 \uB4A4\uC758 \uC791\uC740 \uBB3C\uC74C\uD45C */\n.dshpp-help {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n}\n.dshpp-help-btn {\n  appearance: none;\n  border: 0;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  font-family: var(--dsw-font-family);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: 1;\n  width: 16px;\n  height: 16px;\n  border-radius: 50%;\n  border: 0.5px solid var(--dsw-alias-border-l3);\n  cursor: help;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0;\n  transition:\n    background-color 0.16s ease-out,\n    color 0.16s ease-out,\n    border-color 0.16s ease-out;\n}\n.dshpp-help-btn:hover,\n.dshpp-help-btn[aria-expanded="true"] {\n  color: var(--dsw-alias-label-primary);\n  border-color: var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n.dshpp-tip {\n  position: absolute;\n  left: 0;\n  top: calc(100% + 6px);\n  z-index: 2147483000;\n  width: max-content;\n  max-width: min(340px, 70vw);\n  padding: 8px 12px;\n  border-radius: var(--dsw-radius-sm);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-overlay);\n  color: var(--dsw-alias-label-primary);\n  box-shadow: var(--dsw-elevation-prominent);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  white-space: normal;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.dshpp-tip b {\n  font-weight: 600;\n}\n\n/* \uACBD\uACE0/\uC548\uB0B4 \uD55C \uC904: \uC120\uACFC \uAE00\uC790\uC0C9\uB9CC \uC4F0\uACE0 \uBC30\uACBD\uC740 layer-2 \uD558\uB098\uB85C \uC815\uB9AC */\n.dshpp-page .dshpp-warn {\n  margin: 12px 0 0;\n  padding: 12px;\n  border-radius: var(--dsw-radius-sm);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-2);\n  color: var(--dsw-alias-state-warn-primary);\n  font-size: var(--dsw-font-xs-13-font-size);\n  line-height: var(--dsw-font-xs-13-line-height);\n}\n\n/* \uC561\uC158 \uBC14: \uAC00\uC7A5 \uC790\uC8FC \uC4F0\uB294 "\uC801\uC6A9"\uC744 \uCF58\uD150\uCE20 \uC601\uC5ED \uB9E8 \uC704\uC5D0 \uACE0\uC815\uD55C\uB2E4 */\n.dshpp-page .dshpp-actions {\n  position: sticky;\n  top: 0;\n  z-index: 5;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 0 12px;\n  margin: -4px 0 8px;\n  background: var(--dsw-alias-bg-base);\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n}\n.dshpp-page .dshpp-actions .dshpp-pill {\n  margin-left: auto;\n}\n\n/* \uC9C0\uD45C: \uC0C1\uD0DC \uC694\uC57D \uD589\uC740 \uC81C\uBAA9 \uBC14\uB85C \uC544\uB798 12px */\n.dshpp-page .dshpp-metrics {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));\n  gap: 8px;\n  margin: 12px 0 0;\n}\n.dshpp-page .dshpp-metric {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-md);\n  padding: 12px;\n  background: var(--dsw-alias-bg-layer-2);\n  min-width: 0;\n}\n.dshpp-page .dshpp-metric b {\n  display: block;\n  margin-bottom: 2px;\n  font-size: 15px;\n  line-height: 22px;\n  font-weight: 600;\n  letter-spacing: -0.01em;\n  overflow-wrap: anywhere;\n}\n.dshpp-page .dshpp-metric span {\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n\n/* \uC811\uC774\uC2DD \uBE14\uB85D: \uD328\uCE58 \uC0C1\uC138 / \uC720\uC9C0\uBCF4\uC218 / \uC790\uCCB4 \uC810\uAC80 \u2014 \uC124\uC815 \uD589\uCC98\uB7FC \uC120\uB9CC \uB0A8\uAE34\uB2E4 */\n.dshpp-page .dshpp-fold {\n  border: 0;\n  border-bottom: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: 0;\n  background: transparent;\n  padding: 0;\n}\n.dshpp-page .dshpp-fold-inline {\n  border: 0;\n  border-radius: 0;\n  background: transparent;\n  padding: 0;\n}\n.dshpp-page .dshpp-fold > summary,\n.dshpp-page .dshpp-fold-inline > summary {\n  cursor: pointer;\n  padding: 12px 0;\n  font-size: var(--dsw-font-xs-13-font-size);\n  line-height: var(--dsw-font-xs-13-line-height);\n  color: var(--dsw-alias-label-secondary);\n  list-style: none;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.dshpp-page .dshpp-fold > summary::-webkit-details-marker,\n.dshpp-page .dshpp-fold-inline > summary::-webkit-details-marker {\n  display: none;\n}\n.dshpp-page .dshpp-fold > summary::before,\n.dshpp-page .dshpp-fold-inline > summary::before {\n  content: "\u25B8";\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  transition: transform 0.16s ease-out;\n}\n.dshpp-page .dshpp-fold[open] > summary::before,\n.dshpp-page .dshpp-fold-inline[open] > summary::before {\n  transform: rotate(90deg);\n}\n.dshpp-page .dshpp-fold > summary b,\n.dshpp-page .dshpp-fold-inline > summary b {\n  color: var(--dsw-alias-label-secondary);\n  font-weight: 500;\n  margin-left: auto;\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n.dshpp-page .dshpp-fold-inline > summary {\n  padding: 2px 0;\n}\n\n/* \uC0C1\uD0DC \uD589(\uC790\uCCB4 \uC810\uAC80 / \uAC15\uD654 \uC139\uC158) */\n.dshpp-page .dshpp-line {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n  padding: 12px 0;\n}\n.dshpp-page .dshpp-line + .dshpp-line {\n  border-top: 0.5px solid var(--dsw-alias-border-l2);\n}\n.dshpp-page .dshpp-line-main {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n}\n.dshpp-page .dshpp-line-main b {\n  font-weight: 600;\n}\n.dshpp-page .dshpp-fold-inline[open] {\n  flex-basis: 100%;\n}\n\n/* \uACC4\uCE35\uBCC4 \uC790\uCCB4 \uC810\uAC80: 2\uC5F4/\uB2E4\uC5F4 \uADF8\uB9AC\uB4DC\uB85C \uBC14\uAFD4 \uB354 \uC774\uC0C1 \uD55C \uC904\uC5D0 \uD558\uB098\uC529 \uB450\uC9C0 \uC54A\uB294\uB2E4 */\n.dshpp-page .dshpp-checks {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 4px 16px;\n  padding: 6px 0 12px;\n}\n.dshpp-page .dshpp-check {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n  padding: 2px 0;\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n.dshpp-page .dshpp-check.is-bad {\n  color: var(--dsw-alias-state-error-primary);\n}\n.dshpp-page .dshpp-check.is-warn {\n  color: var(--dsw-alias-state-warn-primary);\n}\n.dshpp-page .dshpp-check-name {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  min-width: 0;\n  word-break: keep-all;\n}\n.dshpp-page .dshpp-check-val {\n  margin-left: auto;\n  color: var(--dsw-alias-label-secondary);\n  font-variant-numeric: tabular-nums;\n}\n\n/* \uC0C1\uD0DC \uD398\uC774\uC9C0 hero: "\uC9C0\uAE08 \uC5B4\uB5A4 \uC0C1\uD0DC\uC774\uACE0 \uB2E4\uC74C\uC5D0 \uC5B4\uB514\uB97C \uB204\uB974\uB294\uC9C0"\uB97C \uD55C\uB208\uC5D0 \uBCF4\uC5EC\uC900\uB2E4 */\n.dshpp-page .dshpp-hero {\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-layer-1);\n  box-shadow: none;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n.dshpp-page .dshpp-hero-state {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n}\n.dshpp-page .dshpp-hero-state b {\n  font-weight: 600;\n}\n.dshpp-page .dshpp-hero-sub {\n  margin-left: auto;\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n}\n.dshpp-page .dshpp-hero-actions {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 8px;\n}\n.dshpp-page .dshpp-btn-lead {\n  height: 36px;\n  padding: 0 20px;\n  font-size: var(--dsw-font-s-14-font-size);\n  line-height: var(--dsw-font-s-14-line-height);\n}\n.dshpp-page .dshpp-hero-hint {\n  margin: 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: var(--dsw-font-xs-13-font-size);\n  line-height: var(--dsw-font-xs-13-line-height);\n}\n\n.dshpp-page .dshpp-probe-msg {\n  margin: 8px 0 0;\n  padding: 12px;\n  border-radius: var(--dsw-radius-sm);\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-markdown-code-block);\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-markdown-code-font-family);\n  font-size: var(--dsw-font-xxs-12-font-size);\n  line-height: var(--dsw-font-xxs-12-line-height);\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dshpp-page .dshpp-btn,\n  .dshpp-page .dshpp-help-btn,\n  .dshpp-page-tabs button,\n  .dshpp-page .dshpp-fold > summary::before,\n  .dshpp-page .dshpp-fold-inline > summary::before {\n    transition: none;\n  }\n}\n';

// src/shared/runtime-error.js
function runtimeRepairDetails(report) {
  if (!report || report.ok !== false) return [];
  const text = (value) => typeof value === "string" ? value.replace(/[\r\n\t]+/g, " ").slice(0, 1200) : "";
  const details = [];
  const add = (label, value) => {
    const safe = text(value);
    if (safe) details.push(`${label}: ${safe}`);
  };
  add("runtime", report.reason);
  add("runtime error", report.error);
  add("runtime code", report.code);
  const link = report.symlink;
  if (link?.ok === false) {
    add("runtime link", link.reason);
    add("link error", link.error);
    add("link code", link.code);
    add("backup", link.backup);
    add("retained candidate", link.failedLink);
    if (link.rollback?.ok === false) {
      details.push("rollback: failed");
      add("rollback error", link.rollback.error);
    } else if (link.rollback?.ok === true) {
      details.push("rollback: original link restored");
    }
  }
  for (const shim of (Array.isArray(report.shims) ? report.shims : []).slice(
    0,
    8
  )) {
    if (!["read_error", "write_error"].includes(shim?.status)) continue;
    add("launcher", shim.path);
    add("launcher status", shim.status);
    add("launcher error", shim.error);
  }
  return details;
}

// src/api/client.js
function clientGuessSurface() {
  try {
    if (typeof navigator !== "undefined" && /electron/i.test(navigator.userAgent || ""))
      return "desktop";
    if (typeof location !== "undefined") {
      const port = String(location.port || "");
      if (port === "43120") return "desktop";
      const host3 = String(location.hostname || "");
      if (host3 && host3 !== "127.0.0.1" && host3 !== "localhost" && /dsh desktop/i.test(String(location.href || "")))
        return "desktop";
    }
  } catch {
  }
  return "";
}
function hostSurfaceOf(s) {
  return s && s.surface || clientGuessSurface() || "web";
}
function hostText(t, key, surface) {
  if (surface && surface !== "web") {
    const specific = key + "." + surface;
    const hit = t(specific);
    if (hit && hit !== specific) return hit;
  }
  return t(key);
}
function apiUrl(p, context = {}) {
  try {
    const loc = context.href || window.location.href || window.location.origin + "/";
    const page = new URL(loc);
    const module2 = new URL(
      context.moduleUrl || typeof __PURGE_MODULE_URL__ !== "undefined" && __PURGE_MODULE_URL__ || page.href,
      page
    );
    let base;
    const marker = module2.pathname.indexOf("/plugins/");
    if (module2.origin === page.origin && marker >= 0) {
      base = new URL(module2.pathname.slice(0, marker + 1), page);
    } else {
      const declared = context.baseURI || typeof document !== "undefined" && document.baseURI;
      const candidate = declared && new URL(declared, page);
      base = candidate && candidate.origin === page.origin ? candidate : page;
      base = new URL(base.href);
      if (!base.pathname.endsWith("/")) base.pathname += "/";
    }
    base.search = "";
    base.hash = "";
    if (typeof p !== "string" || !p.startsWith("/") || p.startsWith("//"))
      return p;
    return new URL(p.slice(1), base).toString();
  } catch {
    return p;
  }
}
function apiTimeoutMs(p, init) {
  const path = String(p || "");
  const method = String(init && init.method || "GET").toUpperCase();
  if (path.indexOf("/dsh-purge/community") !== -1)
    return method === "POST" ? 6e5 : 2e4;
  if (path.indexOf("/dsh-purge/update") !== -1)
    return method === "POST" ? 18e4 : 45e3;
  if (path.indexOf("/dsh-purge/uninstall") !== -1) return 9e4;
  if (path.indexOf("/dsh-purge/skill") !== -1)
    return method === "POST" ? 12e4 : 2e4;
  if (path.indexOf("/dsh-purge/status") !== -1) return 6e4;
  if (path.indexOf("/dsh-purge/apply") !== -1) return 24e4;
  if (path.indexOf("/dsh-purge/revert") !== -1) return 12e4;
  if (path.indexOf("/dsh-purge/restart") !== -1) return 6e4;
  return 2e4;
}
function isAbortError(e) {
  const msg = String(e && e.message || e || "");
  return e && e.name === "AbortError" || /aborted|abort/i.test(msg);
}
function apiError(message, status) {
  return Object.assign(new Error(message), { status });
}
var pendingStatus = null;
function apiJson(p, init) {
  const method = String(init?.method || "GET").toUpperCase();
  if (method !== "GET") pendingStatus = null;
  if (p !== "/dsh-purge/status" || init) return requestJson(p, init);
  if (pendingStatus) return pendingStatus;
  const request = requestJson(p, init);
  pendingStatus = request;
  const clear = () => {
    if (pendingStatus === request) pendingStatus = null;
  };
  request.then(clear, clear);
  return request;
}
function unavailableStatus(error) {
  return {
    ok: false,
    error: String(error?.message || error || "bad response")
  };
}
async function requestJson(p, init) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), apiTimeoutMs(p, init));
  try {
    const r = await fetch(
      apiUrl(p),
      Object.assign(
        { cache: "no-store", credentials: "same-origin", signal: ctrl.signal },
        init || {}
      )
    );
    const text = await r.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw apiError(r.status + " non-json: " + text.slice(0, 120), r.status);
    }
    if (!r.ok) {
      const runtimeDetails = runtimeRepairDetails(data?.cli_repair);
      const message = data && (data.error || data.message) || r.status + " " + r.statusText;
      throw Object.assign(
        apiError([message, ...runtimeDetails].join("\n"), r.status),
        { runtimeDetails }
      );
    }
    return data;
  } catch (e) {
    if (isAbortError(e)) throw new Error("timeout");
    const msg = String(e && e.message || e || "");
    if (!e?.status && /failed to fetch|networkerror|load failed/i.test(msg)) {
      throw new Error(
        "\uC778\uD130\uD398\uC774\uC2A4\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. dsh \uAC00 \uC2E4\uD589 \uC911\uC778\uC9C0 \uD655\uC778\uD55C \uB4A4 Ctrl+F5 \uB97C \uB204\uB974\uC138\uC694"
      );
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
function promptBoxEmpty(text) {
  return !String(text || "").trim();
}
function responseNeedsPrompt(d) {
  return Boolean(d && (d.needPrompt || d.injectSource === "none"));
}
function warnNeedPrompt(d, tr) {
  if (!responseNeedsPrompt(d)) return false;
  window.alert(tr("need.prompt"));
  return true;
}
async function bothInjectEmpty(overrideText, defaultText) {
  if (!promptBoxEmpty(overrideText)) return false;
  if (!promptBoxEmpty(defaultText)) return false;
  return true;
}
function rulesApi(op, extra) {
  return apiJson("/dsh-purge/rules", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ op }, extra || {}))
  });
}
function skillsRouteMissing(e) {
  return e?.status === 404 || e?.status === 405;
}
function skillsApi(op, extra) {
  const init = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(Object.assign({ op }, extra || {}))
  };
  return apiJson("/dsh-purge/skills", init).catch((e) => {
    if (!skillsRouteMissing(e)) throw e;
    return apiJson("/dsh-purge/skill", init);
  });
}

// src/vendor/drill.js
var import_react2 = __toESM(require("react"), 1);
var __dshPurgeDrill = (() => {
  var module2 = { exports: {} };
  var exports = module2.exports;
  var module2 = { exports: {} };
  var exports = module2.exports;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  const h2 = import_react2.default.createElement;
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
/* brand-primary \uB294 \uC5B4\uB450\uC6B4 \uD14C\uB9C8\uC5D0\uC11C \uAC70\uC758 \uD770\uC0C9(#f9fafb)\uC774\uB77C, \uBC30\uACBD\uC0C9\uC5D0 #fff \uB97C \uC4F0\uBA74 \uD770 \uBC14\uD0D5\uC5D0 \uD770 \uAE00\uC790\uAC00 \uB41C\uB2E4.
   \uB77C\uBCA8/\uBC30\uACBD \uBC18\uC804 \uD1A0\uD070\uC744 \uC4F0\uBA74 \uB450 \uD14C\uB9C8 \uBAA8\uB450 \uB300\uBE44\uAC00 \uC720\uC9C0\uB41C\uB2E4. */
.rt-btn-primary{background:var(--dsw-alias-label-primary,#111);border-color:var(--dsw-alias-label-primary,#111);color:var(--dsw-alias-bg-base,#fff)}
.rt-btn-primary:hover{opacity:.9}
.rt-btn:disabled{opacity:.5;cursor:default}
.rt-tabs{display:flex;flex-wrap:wrap;gap:2px;padding:6px 12px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.rt-tab{padding:8px 10px 7px;border-radius:0;cursor:pointer;font-size:12.5px;color:var(--dsw-alias-label-secondary);
  display:inline-flex;align-items:center;gap:5px;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent}
.rt-tab:hover{color:var(--dsw-alias-label-primary)}
.rt-tab.on{color:var(--dsw-alias-label-primary);background:transparent;font-weight:600;border-bottom-color:var(--dsw-alias-brand-primary,#6dbf8c)}
/* \uBBF8\uD655\uC778 \uBE68\uAC04 \uC810: \uADF8 \uD0ED\uC5D0 \uC0C8 \uB0B4\uC6A9(\uC0C8 \uC790\uC0B0/\uC0C8 \uCDE8\uC57D\uC810/\uC0C8 \uB4DD\uC810/\uC0C8 \uB2E8\uACC4\u2026)\uC774 \uC788\uC73C\uBA70, \uC5F4\uC5B4 \uBCF4\uBA74 \uC0AC\uB77C\uC9C4\uB2E4 */
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
/* \uADDC\uC728 \uC548\uB0B4 \uBC14: \uB0A9\uD488 \uC694\uAC74(Behinder/Godzilla \uC178 \uC544\uB2D8, suo5 \uD130\uB110 \uC5C6\uC74C)\uC744 \uCDA9\uC871\uD558\uC9C0 \uBABB\uD560 \uB54C \uBE14\uB85D \uB9E8 \uC704\uC5D0 \uBD99\uB294\uB2E4 */
.rt-hint{border-radius:6px;padding:7px 9px;margin-bottom:8px;font-size:11.5px;line-height:1.6;
  border:1px dashed #ef444488;background:#ef44440f;color:var(--dsw-alias-label-primary)}
.rt-hint b{color:#ef4444}
.rt-tag-dead{color:var(--dsw-alias-label-secondary)}
.rt-expand{grid-column:1/-1;padding:8px 4px 10px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.rt-kv{display:flex;gap:8px;margin-bottom:3px;align-items:baseline}
.rt-kv b{color:var(--dsw-alias-label-primary);font-weight:600;min-width:64px;flex:none}
/* \uADF8\uB798\uD504 \uBDF0\uB294 \uC81C\uAC70\uB410\uB2E4(AssetsTab \uCC38\uACE0: \uC790\uC0B0 \uAD00\uACC4\uB294 \u201C\uB3C4\uBA54\uC778 \uCC28\uC6D0\u201D\uACFC redteam_attack_path \uB3C4\uAD6C\uAC00 \uB2F4\uB2F9\uD55C\uB2E4) */
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
/* \uB4DD\uC810 \uBAA9\uD45C\uB294 \uBCD1\uD569\uD310\uC758 8\uAC1C \uBD84\uB958\uB85C \uBB36\uB294\uB2E4: \uBD84\uB958 \uD5E4\uB354 + \uADF8\uB8F9 \uC548\uC740 \uC810\uC218 \uC624\uB984\uCC28\uC21C */
.rt-score-group{display:flex;align-items:center;gap:8px;padding:7px 10px 5px;margin-top:2px;
  font-size:12px;font-weight:600;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2)}
.rt-score-group:first-child{border-top:none}
.rt-score-group .rt-sg-sub{font-weight:400;font-size:11px;color:var(--dsw-alias-label-secondary)}
/* \u2500\u2500 \uC138\uC158\uACFC \uC9C4\uC785\uC810: \uCE74\uB4DC\uB9C8\uB2E4 \u201C\uC81C\uBAA9 \uD589 / \uD575\uC2EC \uC0AC\uC2E4 / \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBA85\uB839 / \uBE44\uACE0\u201D \uB124 \uAD6C\uAC04\uC73C\uB85C \uB098\uB220 \uD55C \uC904\uC5D0 \uBB49\uAC1C\uC9C0\uC9C0 \uC54A\uAC8C \uD55C\uB2E4 \u2500\u2500 */
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
/* \u2500\u2500 \uC811\uD798 \uACC4\uCE35 \uCCB4\uACC4 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   L1 \uC811\uD798 \uD5E4\uB354 .rt-sec   : \uC804\uCCB4 \uD3ED, \uB465\uADFC \uBAA8\uC11C\uB9AC\xB7\uD14C\uB450\uB9AC \uC5C6\uC74C, \uC67C\uCABD \uC0C9 \uB9C9\uB300, \uC5B4\uB450\uC6B4 \uBC14\uD0D5 \u2014 \uD56D\uC0C1 "\uD3C9\uD3C9"\uD558\uB2E4
   L2 \uB0B4\uC6A9 \uCE74\uB4DC .rt-atest/.rt-hit/.rt-cred/.rt-evi: \uC548\uCABD\uC73C\uB85C \uB4E4\uC5EC\uC4F0\uAE30, \uD14C\uB450\uB9AC, \uB465\uADFC \uBAA8\uC11C\uB9AC \u2014 \uC138\uC6CC\uC9C4 \uB290\uB08C
   L3 \uC0C1\uC138/\uAE34 \uD14D\uC2A4\uD2B8 .rt-clip-body / .rt-evi-body : \uD14C\uB450\uB9AC \uC5C6\uC74C, \uAC00\uC7A5 \uBC1D\uC74C, \uACE0\uC815\uD3ED
   L4 \uD558\uC704 \uD56D\uBAA9 \uCEE8\uD14C\uC774\uB108 .rt-sec-body: \uC67C\uCABD \uB4E4\uC5EC\uC4F0\uAE30 + \uC138\uB85C \uC548\uB0B4\uC120, "\uC704\uC758 \uD5E4\uB354\uC5D0 \uC18D\uD55C\uB2E4"\uB97C \uD45C\uC2DC
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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
/* \uAE34 \uD14D\uC2A4\uD2B8 \uC811\uAE30(L3): \uAE30\uBCF8 \uBBF8\uB9AC\uBCF4\uAE30 2\uC904\uC5D0 \uD398\uC774\uB4DC, \uD3BC\uCE58\uBA74 \uB192\uC774 \uC81C\uD55C \uC2A4\uD06C\uB864 */
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
/* \u2500\u2500 \uBCF4\uACE0\uC11C\uC758 \u201C\uC774 \uB2E8\uACC4\uB294 \uC5B4\uB514\uC11C \uB098\uC654\uB098\u201D: \uB3D9\uC791 \uB2E8\uACC4 / \uBA85\uB839 / \uC790\uACA9 \uC99D\uBA85 / \uD130\uB110 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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
/* \u2500\u2500 \uC804 \uAD6C\uAC04 \uACF5\uACA9 \uACBD\uB85C\uB3C4 \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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
/* \uC11C\uBE44\uC2A4 \uC0C1\uD55C \uB3C4\uB2EC/\uC790\uCCB4 \uC0DD\uC131\uC73C\uB85C \uBBF8\uC9D1\uACC4\uC778 \uC801\uC911: \uC810\uC218\uB97C \uD68C\uC0C9(+0)\uC73C\uB85C \uD45C\uC2DC\uD574 \uB610 \uC810\uC218\uAC00 \uC624\uB978 \uAC83\uCC98\uB7FC \uBCF4\uC774\uC9C0 \uC54A\uAC8C \uD55C\uB2E4 */
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
/* \uD6A1\uC801 \uACBD\uB85C\uB3C4 */
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
/* \uC790\uC0B0\uACFC \uB0B4\uC6A9 \uBAA8\uB450 \uC790\uB3D9 \uC904\uBC14\uAFC8: \uAE34 \uB3C4\uBA54\uC778/\uAE34 \uD328\uC2A4\uC6CC\uB4DC/\uAE34 \uACB0\uACFC\uB3C4 \uC904\uBC14\uAFC8\uD574 \uD45C\uC2DC\uD558\uACE0 \uB9D0\uC904\uC784\uC73C\uB85C \uC790\uB974\uC9C0 \uC54A\uB294\uB2E4 */
.rt-hit-asset{font-family:ui-monospace,Menlo,monospace;font-weight:600;flex:0 1 auto;max-width:100%;
  overflow-wrap:anywhere;word-break:break-word}
.rt-hit-txt{flex:1 1 100%;color:var(--dsw-alias-label-primary);line-height:1.55;
  white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}
.rt-hit-txt.none{color:var(--dsw-alias-state-error-primary)}
.rt-hit-row .rt-hit-time{flex:none;margin-left:auto}
/* \uC9C1\uC811 \uB4F1\uB85D/\uC790\uCCB4 \uC0DD\uC131\uD55C \uACC4\uC815: \uD754\uC801\uC740 \uB0A8\uAE30\uB418 \uBBF8\uC9D1\uACC4, \uD589 \uC804\uCCB4\uB97C \uC5B4\uB461\uAC8C */
.rt-hit-row.self-created{opacity:.72;border-left:3px solid #ef444488}
/* \uAC19\uC740 \uC790\uC0B0 \uAC19\uC740 \uD3EC\uD2B8\uC758 \uC911\uBCF5 \uACC4\uC815/DB \uAD8C\uD55C: \uC11C\uBE44\uC2A4 \uC0C1\uD55C \uB3C4\uB2EC, \uBBF8\uC9D1\uACC4(\uD754\uC801\uB9CC \uB0A8\uAE34\uB2E4) */
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
/* \uC811\uD78C \uC0C1\uD0DC\uC5D0\uC11C\uB3C4 "\uC774 \uB2E8\uACC4\uC5D0\uC11C \uBA87 \uC810\uC744 \uB544\uB294\uC9C0" \uD55C\uB208\uC5D0 \uBCF4\uC5EC\uC57C \uD558\uBBC0\uB85C \uC810\uC218\uB97C \uD5E4\uB354\uC5D0 \uB0A8\uAE34\uB2E4 */
.rt-rep-pts{font-size:11px;font-weight:600;padding:1px 6px;border-radius:5px;border:1px solid transparent;flex:none}
.rt-rep-body{padding-left:6px}
/* \u2500\u2500 \uC9C0\uC2DD \uBCA0\uC774\uC2A4(POC/EXP) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.rt-kb-filter{display:flex;align-items:center;gap:7px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}
/* \uC9C0\uC2DD \uBCA0\uC774\uC2A4 \uBD84\uB958 \uAC1C\uC694: \uD55C \uC904 \uB77C\uBCA8, \uD55C \uBC88 \uB204\uB974\uBA74 \uADF8 \uBD84\uB958\uB85C \uD544\uD130\uB41C\uB2E4 */
.rt-kb-cats{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px;border-bottom:1px solid var(--dsw-alias-border-l1)}
/* \uC9C0\uC2DD \uBCA0\uC774\uC2A4 \uADF8\uB8F9 \uD5E4\uB354(\uBD84\uB958\uBCC4 \uADF8\uB8F9\uC77C \uB54C \uADF8\uB8F9\uB9C8\uB2E4 \uD558\uB098) */
.rt-kb-cat{display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--dsw-alias-bg-layer-2);
  border-bottom:1px solid var(--dsw-alias-border-l1);position:sticky;top:0;z-index:1}
.rt-kb-cat-name{font-weight:600;font-size:12.5px}
/* \uC2A4\uD0AC \uC0AC\uC6A9 \uAC00\uB2A5\uC131 \uBC30\uC9C0(\uC2A4\uD0AC \uB77C\uC774\uBE0C\uB7EC\uB9AC \uD0ED) */
.rt-avail{display:inline-block;padding:0 5px;border-radius:4px;font-size:10.5px;white-space:nowrap;
  border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.rt-avail-available{color:#10b981;border-color:#10b98155;background:#10b9811a}
.rt-avail-broken{color:#ef4444;border-color:#ef444455;background:#ef44441a}
.rt-avail-unknown{color:#94a3b8;border-color:#94a3b855;background:#94a3b81a}
/* \uBC84\uC804 / \uC5C5\uB370\uC774\uD2B8 \uBAA8\uB2EC */
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
/* \uC774 PC nuclei \uD15C\uD50C\uB9BF \uC801\uC911: \uACBD\uB85C\uAC00 \uC804\uBD80 \uBCF4\uC5EC\uC57C \uD55C\uB2E4(\uBA85\uB839\uC73C\uB85C \uBCF5\uC0AC\uD574 \uBC14\uB85C \uC2E4\uD589) */
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
.rt-shot-zoom-cap{color:#e5e7eb;font-size:12px;text-align:center;max-width:90vw;overflow-wrap:anywhere}`;
  const isFullWindow = () => {
    try {
      return String(window.location.hash || "") === "#redteam-full";
    } catch {
      return false;
    }
  };
  const api = (req) => fetch(apiUrl("/redteam/api"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req)
  }).then(async (res) => {
    const text = await res.text().catch(() => "");
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return {
        ok: false,
        error: res.status + " non-json: " + String(text).slice(0, 120)
      };
    }
    if (!res.ok) {
      return Object.assign({}, data || {}, {
        ok: false,
        error: data && (data.error || data.message) || res.status + " " + res.statusText
      });
    }
    return data;
  });
  let ui = { open: true, tab: "assets" };
  const subs = /* @__PURE__ */ new Set();
  const setUI = (patch) => {
    ui = Object.assign({}, ui, patch);
    const snap = Object.assign({}, ui);
    for (const f of Array.from(subs)) {
      try {
        f(snap);
      } catch {
      }
    }
  };
  let dockWidthTag = null;
  const setDockWidth = () => {
  };
  const useUI = () => {
    const [st, setSt] = import_react2.default.useState(() => Object.assign({}, ui));
    import_react2.default.useEffect(() => {
      const f = (snap) => setSt(Object.assign({}, snap || ui));
      subs.add(f);
      setSt(Object.assign({}, ui));
      return () => {
        subs.delete(f);
      };
    }, []);
    return st;
  };
  const POC_CAT_NAME = {
    rce: "\uC6D0\uACA9 \uBA85\uB839 \uC2E4\uD589",
    deserialization: "\uC5ED\uC9C1\uB82C\uD654",
    "file-upload": "\uD30C\uC77C \uC5C5\uB85C\uB4DC getshell",
    sqli: "SQL \uC778\uC81D\uC158",
    unauthorized: "\uBE44\uC778\uAC00 \uC811\uADFC",
    "auth-bypass": "\uC778\uC99D \uC6B0\uD68C / \uAD8C\uD55C \uC6B0\uD68C",
    "weak-password": "\uC57D\uD55C \uBE44\uBC00\uBC88\uD638 / \uBE0C\uB8E8\uD2B8\uD3EC\uC2A4",
    ssrf: "SSRF",
    xxe: "XXE",
    "path-traversal": "\uB514\uB809\uD130\uB9AC \uD2B8\uB798\uBC84\uC124 / \uC784\uC758 \uD30C\uC77C \uC77D\uAE30",
    "info-leak": "\uC815\uBCF4 \uC720\uCD9C",
    privesc: "\uAD8C\uD55C \uC0C1\uC2B9 / \uD6A1\uC801",
    tunnel: "\uD130\uB110 / \uD504\uB85D\uC2DC",
    other: "\uAE30\uD0C0"
  };
  const POC_CAT_ORDER = Object.keys(POC_CAT_NAME);
  const ROLE_LABEL = {
    plan: "\uC8FC \uC138\uC158(\uC9C0\uD718)",
    recon: "\uC815\uBCF4 \uC218\uC9D1",
    assess: "\uC790\uC0B0 \uC815\uB9AC",
    "vuln-scan": "\uCDE8\uC57D\uC810 \uBC1C\uACAC",
    exploit: "\uCDE8\uC57D\uC810 \uC775\uC2A4\uD50C\uB85C\uC787",
    internal: "\uB0B4\uBD80\uB9DD \uCE68\uD22C"
  };
  const fmt = (s) => s ? String(s).replace("T", " ").slice(0, 16) : "\u2014";
  const shotCache = /* @__PURE__ */ new Map();
  const shotLoading = /* @__PURE__ */ new Map();
  const shotSrc = (eng, id) => shotCache.get(eng + ":" + id) || null;
  const loadShot = (eng, id) => {
    const key = eng + ":" + id;
    if (shotCache.has(key) || shotLoading.has(key)) return;
    const p = api({ op: "shotData", engagement: eng, id }).then((r) => {
      shotCache.set(
        key,
        r && r.base64 ? "data:" + (r.mime || "image/png") + ";base64," + r.base64 : ""
      );
      shotLoading.delete(key);
      const snap = Object.assign({}, ui);
      for (const f of Array.from(subs)) {
        try {
          f(snap);
        } catch {
        }
      }
    }).catch(() => {
      shotLoading.delete(key);
    });
    shotLoading.set(key, p);
  };
  const SHOT_KIND = {
    screenshot: "\uD604\uC7A5 \uC2A4\uD06C\uB9B0\uC0F7",
    card: "\uAE30\uB85D\uC5D0\uC11C \uC0DD\uC131\uD55C \uC99D\uAC70 \uBC1C\uCDCC"
  };
  const ShotImage = ({ eng, shot, height }) => {
    const [zoom, setZoom] = import_react2.default.useState(false);
    const src = shotSrc(eng, shot.id);
    if (src === null) {
      loadShot(eng, shot.id);
    }
    const card = shot.kind === "card";
    return h2(
      "div",
      { className: "rt-shot" },
      src === null ? h2(
        "div",
        {
          className: "rt-shot-thumb rt-shot-loading",
          style: { height: (height || 96) + "px" }
        },
        "\uBD88\uB7EC\uC624\uB294 \uC911\u2026"
      ) : h2("img", {
        className: "rt-shot-thumb",
        src,
        alt: shot.label || "\uC99D\uAC70 " + shot.id,
        style: { height: (height || 96) + "px", cursor: "zoom-in" },
        onClick: () => setZoom(true)
      }),
      h2(
        "div",
        { className: "rt-shot-cap" },
        h2(
          "span",
          {
            className: "rt-tag " + (card ? "rt-tag-warn" : "rt-tag-live"),
            title: card ? "\uB2F9\uC77C \uAE30\uB85D\uC5D0\uC11C \uC0DD\uC131\uD55C \uC99D\uAC70 \uBC1C\uCDCC\uC774\uBA70 \uD604\uC7A5 \uC2A4\uD06C\uB9B0\uC0F7\uC774 \uC544\uB2D9\uB2C8\uB2E4. \uBCF4\uACE0\uC11C\uC5D0\uB3C4 \uAC19\uC740 \uD45C\uAE30\uAC00 \uB4E4\uC5B4\uAC11\uB2C8\uB2E4" : "\uD604\uC7A5 \uC2A4\uD06C\uB9B0\uC0F7"
          },
          SHOT_KIND[shot.kind] || shot.kind || "\uC99D\uAC70"
        ),
        h2(
          "span",
          { className: "rt-shot-label", title: shot.label || shot.note || "" },
          shot.label || shot.target || "#" + shot.id
        )
      ),
      zoom ? h2(
        "div",
        { className: "rt-shot-zoom", onClick: () => setZoom(false) },
        h2("img", { src, alt: shot.label || "" }),
        h2(
          "div",
          { className: "rt-shot-zoom-cap" },
          (shot.label || shot.target || "") + (card ? " \xB7 \uB2F9\uC77C \uAE30\uB85D\uC5D0\uC11C \uC0DD\uC131(\uD604\uC7A5 \uC2A4\uD06C\uB9B0\uC0F7 \uC544\uB2D8)" : "") + (shot.captured_at ? " \xB7 " + fmt(shot.captured_at) : "") + " \xB7 \uC544\uBB34 \uACF3\uC774\uB098 \uD074\uB9AD\uD558\uBA74 \uB2EB\uD799\uB2C8\uB2E4"
        )
      ) : null
    );
  };
  const ShotStrip = ({ eng, shots, total, title }) => {
    const list = shots || [];
    if (list.length === 0) return null;
    return h2(
      "div",
      { className: "rt-shots" },
      h2(
        "div",
        { className: "rt-shots-head" },
        h2("b", null, title || "\uC99D\uAC70 \uC2A4\uD06C\uB9B0\uC0F7"),
        h2(
          "span",
          { className: "rt-shots-n" },
          "\uD45C\uC2DC " + list.length + "\uC7A5" + (total && total > list.length ? "(\uD574\uB2F9 \uC810\uC218 \uD56D\uBAA9 \uCD1D " + total + "\uC7A5, \uB300\uD45C \uC774\uBBF8\uC9C0\uB9CC \uD45C\uC2DC)" : "")
        )
      ),
      h2(
        "div",
        { className: "rt-shot-row" },
        list.map(
          (sh) => h2(ShotImage, { key: "sh" + sh.id, eng, shot: sh })
        )
      )
    );
  };
  const fmtShort = (s) => {
    const t = String(s || "").replace("T", " ");
    return t.length >= 16 ? t.slice(5, 16) : t || "\u2014";
  };
  const provLabel = (p) => p === "passive" ? "\uC218\uB3D9" : p === "active" ? "\uB2A5\uB3D9" : "\uC54C \uC218 \uC5C6\uC74C";
  const clickable = (onActivate, options = {}) => {
    const props = {
      role: "button",
      tabIndex: 0,
      onClick: onActivate,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(e);
        }
      }
    };
    if (options.label !== void 0)
      props["aria-label"] = String(options.label);
    if (options.expanded !== void 0)
      props["aria-expanded"] = options.expanded ? "true" : "false";
    return props;
  };
  const copyText = async (text) => {
    const value = text === void 0 || text === null ? "" : String(text);
    if (value === "") return false;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (e) {
    }
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
  const copyWithFeedback = async (text, label, onResult) => {
    const okFlag = await copyText(text);
    const message = okFlag ? "\uBCF5\uC0AC\uB428: " + label : "\uBCF5\uC0AC \uC2E4\uD328(\uBE0C\uB77C\uC6B0\uC800\uAC00 \uD074\uB9BD\uBCF4\uB4DC\uB97C \uD5C8\uC6A9\uD558\uC9C0 \uC54A\uC74C) \u2014 \uD14D\uC2A4\uD2B8\uB97C \uC9C1\uC811 \uC120\uD0DD\uD574 \uBCF5\uC0AC\uD558\uC138\uC694";
    if (typeof onResult === "function") onResult(okFlag, message);
    return okFlag;
  };
  function ProvTag(props) {
    if (!props.p) return h2("span", { className: "rt-tag" }, "\uC54C \uC218 \uC5C6\uC74C");
    return h2(
      "span",
      { className: "rt-tag rt-tag-" + props.p },
      provLabel(props.p)
    );
  }
  const TEST_LABEL = {
    untested: "\uBBF8\uD14C\uC2A4\uD2B8",
    testing: "\uD14C\uC2A4\uD2B8 \uC911",
    tested: "\uD14C\uC2A4\uD2B8 \uC644\uB8CC",
    blocked: "\uCC28\uB2E8\uB428",
    abandoned: "\uD3EC\uAE30",
    no_surface: "\uACF5\uACA9 \uD45C\uBA74 \uC5C6\uC74C"
  };
  const PRI_LABEL = { high: "\uB192\uC74C", medium: "\uBCF4\uD1B5", low: "\uB0AE\uC74C" };
  function PriTag(props) {
    if (!props.p) return h2("span", { className: "rt-tag" }, "\uBBF8\uD3C9\uAC00");
    return h2(
      "span",
      { className: "rt-pri rt-pri-" + props.p, title: props.title || "" },
      PRI_LABEL[props.p] || props.p
    );
  }
  function TestTag(props) {
    const st = props.s || "untested";
    return h2(
      "span",
      { className: "rt-test rt-test-" + st },
      TEST_LABEL[st] || st
    );
  }
  function AssetsTab(props) {
    const eng = props.engagement;
    const snapshot = props.snapshot;
    const refreshKey = props.refreshKey || 0;
    const onRefresh = props.onRefresh;
    const [view, setView] = import_react2.default.useState("list");
    const [cidr, setCidr] = import_react2.default.useState(null);
    const [q, setQ] = import_react2.default.useState("");
    const [qApplied, setQApplied] = import_react2.default.useState("");
    const [service, setService] = import_react2.default.useState("");
    const [port, setPort] = import_react2.default.useState("");
    const [prov, setProv] = import_react2.default.useState("");
    const [testStatus, setTestStatus] = import_react2.default.useState("");
    const [priority, setPriority] = import_react2.default.useState("");
    const [scope, setScope] = import_react2.default.useState("");
    const [assetState, setAssetState] = import_react2.default.useState("");
    const [sort, setSort] = import_react2.default.useState("priority");
    const [showAll, setShowAll] = import_react2.default.useState(null);
    const [state, setState] = import_react2.default.useState({
      loading: false,
      error: null,
      total: 0,
      items: []
    });
    const [domains, setDomains] = import_react2.default.useState(null);
    const [web, setWeb] = import_react2.default.useState(null);
    const [openId, setOpenId] = import_react2.default.useState(null);
    const [detail, setDetail] = import_react2.default.useState(null);
    const sideCollapse = useCollapse("assets-side:" + eng);
    const seq = import_react2.default.useRef(0);
    const onData = props.onData;
    import_react2.default.useEffect(() => {
      if (!eng) return;
      const my = ++seq.current;
      setState((s) => Object.assign({}, s, { loading: true, error: null }));
      api({
        op: "assets",
        engagement: eng,
        cidr: cidr || void 0,
        q: qApplied || void 0,
        service: service || void 0,
        port: port || void 0,
        provenance: prov || void 0,
        test_status: testStatus || void 0,
        priority: priority || void 0,
        scope: scope || void 0,
        state: assetState || void 0,
        sort,
        limit: 400
      }).then(
        (r) => {
          if (my !== seq.current) return;
          if (!r || r.ok === false) {
            setState({
              loading: false,
              error: r && r.error || "\uC870\uD68C \uC2E4\uD328",
              total: 0,
              items: []
            });
            return;
          }
          setState({
            loading: false,
            error: null,
            total: r.total,
            items: r.items || []
          });
          if (onData) onData();
        },
        (e) => {
          if (my === seq.current)
            setState({
              loading: false,
              error: String(e && e.message || e),
              total: 0,
              items: []
            });
        }
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
      refreshKey
    ]);
    import_react2.default.useEffect(() => {
      if (!eng || view !== "domain") return;
      setDomains(null);
      api({ op: "domains", engagement: eng, cidr: cidr || void 0 }).then(
        (r) => setDomains(r && r.items || []),
        () => setDomains([])
      );
    }, [eng, view, cidr, refreshKey]);
    import_react2.default.useEffect(() => {
      if (!eng || view !== "web") return;
      setWeb(null);
      api({ op: "web", engagement: eng, cidr: cidr || void 0 }).then(
        (r) => setWeb(r && r.items || []),
        () => setWeb([])
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
      api({ op: "asset", engagement: eng, id }).then(
        (r) => {
          if (r && r.ok && r.asset) setDetail(r.asset);
        },
        () => {
        }
      );
    };
    const segs = snapshot && snapshot.segments || [];
    const sideChildren = [];
    sideChildren.push(
      h2(
        "div",
        Object.assign(
          {
            key: "all",
            className: "rt-seg" + (cidr === null && view !== "testing" ? " on" : "")
          },
          clickable(
            () => {
              setView("list");
              setCidr(null);
            },
            {
              label: "\uC804\uCCB4 C \uBE14\uB85D",
              expanded: cidr === null && view !== "testing"
            }
          )
        ),
        h2("div", { className: "rt-seg-cidr" }, "\uC804\uCCB4 C \uBE14\uB85D"),
        h2("div", { className: "rt-seg-meta" }, segs.length + "\uAC1C \uB300\uC5ED")
      )
    );
    sideChildren.push(
      h2(
        "div",
        Object.assign(
          {
            key: "testing",
            className: "rt-seg" + (view === "testing" ? " on" : ""),
            title: "\uC2E4\uD589 \uC911\uC778 \uC2A4\uCE94 / \uD0D0\uC9C0\uC640 \uC9C4\uD589\uB960(5\uCD08 \uC790\uB3D9 \uC0C8\uB85C\uACE0\uCE68)"
          },
          clickable(
            () => {
              setView("testing");
              setCidr(null);
            },
            { label: "\uD604\uC7AC \uD14C\uC2A4\uD2B8", expanded: view === "testing" }
          )
        ),
        h2(
          "div",
          {
            className: "rt-seg-cidr",
            style: { display: "flex", alignItems: "baseline", gap: 5 }
          },
          h2(
            "span",
            {
              className: "rt-scope rt-scope-testing",
              title: "\uD604\uC7AC \uD14C\uC2A4\uD2B8(\uB0B4\uBD80\uB9DD\uB3C4 \uC678\uBD80\uB9DD\uB3C4 \uC544\uB2D8)"
            },
            "\uD604\uC7AC"
          ),
          h2("span", { style: { flex: 1 } }, "\uD604\uC7AC \uD14C\uC2A4\uD2B8")
        ),
        h2("div", { className: "rt-seg-meta" }, "\uC2E4\uD589 \uC911\uC778 \uC2A4\uCE94\uACFC \uD0D0\uC9C0")
      )
    );
    const segBlock = (title, list, kind) => {
      const open = sideCollapse.isOpen("scope:" + kind, true);
      const toggle = sideCollapse.toggle("scope:" + kind, true);
      const out = [
        h2(
          "div",
          {
            key: "h" + kind,
            className: "rt-sidehead rt-sidehead-btn",
            role: "button",
            tabIndex: 0,
            "aria-expanded": open ? "true" : "false",
            title: (open ? "\uC774 \uADF8\uB8F9 \uC811\uAE30" : "\uC774 \uADF8\uB8F9 \uD3BC\uCE58\uAE30") + "(\uC790\uC0B0 \uBAA9\uB85D\uC73C\uB85C\uB3C4 \uC804\uD658)",
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
            }
          },
          h2("span", { className: "rt-sec-caret" }, open ? "\u25BE" : "\u25B8"),
          h2(
            "span",
            { className: "rt-scope rt-scope-" + kind },
            kind === "internal" ? "\uB0B4\uBD80\uB9DD" : "\uC678\uBD80\uB9DD"
          ),
          h2("span", null, title + " \xB7 " + list.length + "\uAC1C C \uBE14\uB85D"),
          h2("span", { className: "rt-spacer" }),
          h2(
            "span",
            { style: { fontWeight: 400 } },
            list.reduce((n, x) => n + (x.assets || 0), 0) + "\uAC1C \uC790\uC0B0"
          )
        )
      ];
      if (!open) return out;
      for (const s of list) {
        out.push(
          h2(
            "div",
            Object.assign(
              {
                key: s.cidr,
                className: "rt-seg" + (cidr === s.cidr ? " on" : ""),
                title: (s.org || "\uC18C\uC720 \uBD88\uBA85") + " \xB7 \uC0DD\uC874 " + (s.live || 0) + "/" + (s.assets || 0) + "\uB300"
              },
              clickable(
                () => {
                  setView("list");
                  setCidr(s.cidr);
                },
                {
                  label: "C \uBE14\uB85D \uD544\uD130 " + s.cidr,
                  expanded: cidr === s.cidr && view !== "testing"
                }
              )
            ),
            h2(
              "div",
              {
                className: "rt-seg-cidr",
                style: { display: "flex", alignItems: "baseline", gap: 5 }
              },
              h2(
                "span",
                { className: "rt-scope rt-scope-" + kind },
                kind === "internal" ? "\uB0B4" : "\uC678"
              ),
              h2("span", { style: { flex: 1 } }, s.cidr),
              h2(
                "span",
                {
                  className: "rt-seg-meta",
                  style: { margin: 0, whiteSpace: "nowrap" }
                },
                s.assets + "\uB300"
              )
            )
          )
        );
      }
      return out;
    };
    const segExternal = segs.filter((x) => x.scope !== "internal");
    const segInternal = segs.filter((x) => x.scope === "internal");
    if (segExternal.length)
      sideChildren.push(...segBlock("\uC678\uBD80\uB9DD \uC790\uC0B0", segExternal, "external"));
    if (segInternal.length)
      sideChildren.push(...segBlock("\uB0B4\uBD80\uB9DD \uC790\uC0B0", segInternal, "internal"));
    const side = h2("div", { className: "rt-side" }, sideChildren);
    const toolbar = h2(
      "div",
      { className: "rt-toolbar" },
      h2("input", {
        className: "rt-input",
        style: { flex: "1 1 150px" },
        placeholder: "IP / \uB3C4\uBA54\uC778 / \uC9C0\uBB38 \uAC80\uC0C9(Enter)",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") setQApplied(q);
        }
      }),
      h2(
        "button",
        { className: "rt-btn", onClick: () => setQApplied(q) },
        "\uAC80\uC0C9"
      ),
      h2("input", {
        className: "rt-input",
        style: { width: "78px" },
        placeholder: "\uC11C\uBE44\uC2A4",
        value: service,
        onChange: (e) => setService(e.target.value)
      }),
      h2("input", {
        className: "rt-input",
        style: { width: "60px" },
        placeholder: "\uD3EC\uD2B8",
        value: port,
        onChange: (e) => setPort(e.target.value)
      }),
      h2(
        "select",
        {
          className: "rt-input",
          value: scope,
          onChange: (e) => setScope(e.target.value)
        },
        h2("option", { value: "" }, "\uB0B4\uC678\uBD80 \uBB34\uAD00"),
        h2("option", { value: "external" }, "\uC678\uBD80\uB9DD \uC790\uC0B0\uB9CC"),
        h2("option", { value: "internal" }, "\uB0B4\uBD80\uB9DD \uC790\uC0B0\uB9CC")
      ),
      h2(
        "select",
        {
          className: "rt-input",
          value: prov,
          onChange: (e) => setProv(e.target.value),
          title: "\uD3EC\uD2B8 \uCD9C\uCC98\uB85C \uD544\uD130(\uBAA9\uB85D\uC5D0\uB294 \uB354 \uC774\uC0C1 \uBCC4\uB3C4 \uC5F4\uB85C \uB098\uC624\uC9C0 \uC54A\uACE0 \uC0C1\uC138\uC5D0\uC11C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4)"
        },
        h2("option", { value: "" }, "\uCD9C\uCC98 \uBB34\uAD00"),
        h2("option", { value: "passive" }, "\uC218\uB3D9\uB9CC"),
        h2("option", { value: "active" }, "\uB2A5\uB3D9\uB9CC")
      ),
      h2(
        "select",
        {
          className: "rt-input",
          value: priority,
          onChange: (e) => setPriority(e.target.value)
        },
        h2("option", { value: "" }, "\uACF5\uB7B5 \uC6A9\uC774\uC131 \uBB34\uAD00"),
        h2("option", { value: "high" }, "\uC26C\uC6C0(\uB192\uC74C)"),
        h2("option", { value: "medium" }, "\uBCF4\uD1B5(\uC911\uAC04)"),
        h2("option", { value: "low" }, "\uC5B4\uB824\uC6C0(\uB0AE\uC74C)")
      ),
      h2(
        "select",
        {
          className: "rt-input",
          value: testStatus,
          onChange: (e) => setTestStatus(e.target.value)
        },
        h2("option", { value: "" }, "\uD14C\uC2A4\uD2B8 \uC0C1\uD0DC \uBB34\uAD00"),
        h2("option", { value: "untested" }, "\uBBF8\uD14C\uC2A4\uD2B8"),
        h2("option", { value: "testing" }, "\uD14C\uC2A4\uD2B8 \uC911"),
        h2("option", { value: "tested" }, "\uD14C\uC2A4\uD2B8 \uC644\uB8CC"),
        h2("option", { value: "blocked" }, "\uCC28\uB2E8\uB428"),
        h2("option", { value: "abandoned" }, "\uD3EC\uAE30"),
        h2("option", { value: "no_surface" }, "\uACF5\uACA9 \uD45C\uBA74 \uC5C6\uC74C")
      ),
      h2("div", { className: "rt-spacer" }),
      h2(
        "button",
        {
          className: "rt-btn",
          title: "\uC2A4\uB0C5\uC0F7\uACFC \uD604\uC7AC \uBDF0 \uB370\uC774\uD130\uB97C \uB2E4\uC2DC \uAC00\uC838\uC635\uB2C8\uB2E4",
          onClick: () => {
            if (onRefresh) onRefresh();
          }
        },
        "\uC0C8\uB85C\uACE0\uCE68"
      ),
      h2(
        "button",
        {
          className: "rt-btn" + (view === "list" ? " rt-btn-primary" : ""),
          onClick: () => setView("list")
        },
        "\uBAA9\uB85D"
      ),
      h2(
        "button",
        {
          className: "rt-btn" + (view === "timeline" ? " rt-btn-primary" : ""),
          title: "\uBC1C\uACAC \uC2DC\uAC01 \uAE30\uC900\uC73C\uB85C \uC790\uC0B0 \uBCF4\uAE30(\uC5B8\uC81C \uBC1C\uACAC\uD588\uACE0 \uC5B4\uB290 \uB0A0 \uC5BC\uB9C8\uB098 \uBAA8\uC558\uB294\uC9C0)",
          onClick: () => setView("timeline")
        },
        "\uBC1C\uACAC \uC2DC\uAC01"
      ),
      h2(
        "button",
        {
          className: "rt-btn" + (view === "domain" ? " rt-btn-primary" : ""),
          onClick: () => setView("domain")
        },
        "\uB3C4\uBA54\uC778"
      ),
      h2(
        "button",
        {
          className: "rt-btn" + (view === "web" ? " rt-btn-primary" : ""),
          onClick: () => setView("web")
        },
        "Web"
      )
    );
    const tests = snapshot && snapshot.tests || {};
    const snapStats = snapshot && snapshot.stats || {};
    const noFilter = !testStatus && !priority && !scope && !prov && !assetState && !cidr;
    const conclItem = (key, label, value, active, onClick) => h2(
      "span",
      Object.assign(
        {
          key,
          className: "rt-concl-i" + (active ? " on" : ""),
          title: "\uD074\uB9AD\uD558\uBA74 \uD544\uD130 / \uB2E4\uC2DC \uD074\uB9AD\uD558\uBA74 \uD574\uC81C"
        },
        clickable(onClick, {
          label: "\u201C" + label + "\u201D\uB85C \uD544\uD130(" + (value || 0) + ")",
          expanded: active
        })
      ),
      h2("b", null, String(value || 0)),
      h2("span", null, label)
    );
    const toggleTest = (v) => {
      setTestStatus((cur) => cur === v ? "" : v);
      setAssetState("");
    };
    const conclusion = h2(
      "div",
      { className: "rt-concl" },
      conclItem("all", "\uAC1C \uC790\uC0B0", snapStats.assets, noFilter, () => {
        setTestStatus("");
        setPriority("");
        setScope("");
        setProv("");
        setAssetState("");
        setCidr(null);
      }),
      conclItem(
        "live",
        "\uC0DD\uC874",
        snapStats.liveAssets,
        assetState === "live",
        () => {
          setAssetState((v) => v === "live" ? "" : "live");
          setTestStatus("");
        }
      ),
      conclItem(
        "untested",
        "\uB300\uAE30",
        tests.untested,
        testStatus === "untested",
        () => toggleTest("untested")
      ),
      conclItem(
        "testing",
        "\uD14C\uC2A4\uD2B8 \uC911",
        tests.testing,
        testStatus === "testing",
        () => toggleTest("testing")
      ),
      conclItem(
        "tested",
        "\uC644\uB8CC",
        tests.tested,
        testStatus === "tested",
        () => toggleTest("tested")
      ),
      conclItem(
        "giveup",
        "\uD3EC\uAE30",
        (tests.abandoned || 0) + (tests.blocked || 0),
        testStatus === "abandoned,blocked",
        () => toggleTest("abandoned,blocked")
      ),
      h2("div", { className: "rt-spacer" }),
      h2(
        "select",
        {
          className: "rt-input",
          value: sort,
          onChange: (e) => setSort(e.target.value),
          title: "\uBAA9\uB85D \uC815\uB82C \uBC29\uC2DD"
        },
        h2("option", { value: "priority" }, "\uC815\uB82C: \uACF5\uB7B5 \uC6A9\uC774\uC131 \uC6B0\uC120"),
        h2("option", { value: "todo" }, "\uC815\uB82C: \uB300\uAE30 \uC6B0\uC120"),
        h2("option", { value: "discovered" }, "\uC815\uB82C: \uCD5C\uADFC \uBC1C\uACAC \uC6B0\uC120"),
        h2("option", { value: "ports" }, "\uC815\uB82C: \uD3EC\uD2B8 \uB9CE\uC740 \uC21C"),
        h2("option", { value: "ip" }, "\uC815\uB82C: IP \uC21C")
      )
    );
    const head = h2(
      "div",
      { className: "rt-row head" },
      h2("span", null, "IP"),
      h2("span", null, "\uACF5\uB7B5"),
      h2("span", null, "\uD14C\uC2A4\uD2B8 \uC0C1\uD0DC"),
      h2("span", null, "\uC5F4\uB9B0 \uD3EC\uD2B8 / \uC11C\uBE44\uC2A4"),
      h2("span", null, "\uC9C0\uBB38")
    );
    const rowNodes = [];
    for (const it of state.items) {
      const openPorts = it.ports.filter((p) => p.state === "open");
      const portText = openPorts.map((p) => p.port + (p.service ? "/" + p.service : "")).join(", ") || "\u2014";
      const fpText = it.fingerprints.map(
        (f) => [f.vendor, f.product, f.version].filter(Boolean).join(" ")
      ).join(" / ") || "\u2014";
      const shownPorts = openPorts.slice(0, 3).map((p) => p.port + (p.service ? "/" + p.service : "")).join(", ");
      const morePorts = openPorts.length > 3 ? " +" + (openPorts.length - 3) : "";
      rowNodes.push(
        h2(
          "div",
          Object.assign(
            {
              key: "r" + it.id,
              className: "rt-row"
            },
            clickable(() => toggleRow(it.id), {
              label: "\uC790\uC0B0 \uD3BC\uCE58\uAE30 " + it.ip,
              expanded: openId === it.id
            })
          ),
          h2(
            "span",
            {
              className: "rt-mono",
              style: {
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                flexWrap: "wrap"
              }
            },
            h2(
              "span",
              {
                className: "rt-scope rt-scope-" + (it.scope === "internal" ? "internal" : "external")
              },
              it.scope === "internal" ? "\uB0B4" : "\uC678"
            ),
            h2("span", {
              title: it.state === "live" ? "\uC0DD\uC874" : String(it.state),
              style: {
                width: 7,
                height: 7,
                borderRadius: "50%",
                flex: "none",
                marginTop: 4,
                background: it.state === "live" ? "#10b981" : "#94a3b8"
              }
            }),
            h2(
              "span",
              { style: { overflow: "hidden", textOverflow: "ellipsis" } },
              it.ip
            ),
            /* 발견 시각은 IP 아래 한 줄에 붙인다: IP 열 너비가 빠듯해 별도 열을 열지 않는다(열 너비를 고치면 표 전체를 따라 고쳐야 한다) */
            h2(
              "span",
              {
                style: {
                  fontSize: 10.5,
                  color: "var(--dsw-alias-label-secondary)",
                  whiteSpace: "nowrap"
                },
                title: "\uBC1C\uACAC \uC2DC\uAC01: " + (it.discovered_at ? fmt(it.discovered_at) : "\uBBF8\uAE30\uB85D") + (it.last_seen ? "\n\uCD5C\uADFC \uC218\uC9D1: " + fmt(it.last_seen) : "")
              },
              it.discovered_at ? fmtShort(it.discovered_at) : "\uBC1C\uACAC \uC2DC\uAC01 \uBBF8\uC0C1"
            )
          ),
          h2(
            "span",
            null,
            h2(PriTag, { p: it.priority, title: it.potential || "" })
          ),
          h2(
            "span",
            null,
            h2(TestTag, { s: it.test_status }),
            it.blocked_count ? h2(
              "span",
              {
                className: "rt-tag",
                style: {
                  color: "#ef4444",
                  borderColor: "#ef444455",
                  marginLeft: 4
                }
              },
              "\uCC28\uB2E8 " + it.blocked_count
            ) : null
          ),
          h2("span", { title: portText }, (shownPorts || "\u2014") + morePorts),
          h2(
            "span",
            { title: fpText },
            fpText.length > 30 ? fpText.slice(0, 30) + "\u2026" : fpText
          )
        )
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
            h2(
              "div",
              { key: "p" + p.port, className: "rt-kv" },
              h2("b", { className: "rt-mono" }, p.port + "/" + p.proto),
              h2(
                "span",
                null,
                [p.service, p.product, p.version].filter(Boolean).join(" ") || "\uC54C \uC218 \uC5C6\uB294 \uC11C\uBE44\uC2A4"
              ),
              p.url ? h2(
                "a",
                {
                  className: "rt-link",
                  href: p.url,
                  target: "_blank",
                  rel: "noreferrer",
                  title: p.url
                },
                p.title ? p.title : p.url
              ) : null,
              h2(ProvTag, { p: p.provenance })
            )
          );
        }
        for (const f of d.fingerprints || []) {
          fpRows.push(
            h2(
              "div",
              {
                key: "f" + (f.product || "") + (f.version || "") + (f.evidence || ""),
                className: "rt-kv"
              },
              h2("b", null, f.category || "\u2014"),
              h2(
                "span",
                null,
                [f.vendor, f.product, f.version].filter(Boolean).join(" ") + (f.evidence ? "(" + f.evidence + ")" : "")
              ),
              h2(ProvTag, { p: f.provenance })
            )
          );
        }
        for (const o of (d.observations || []).slice(0, 8)) {
          obsRows.push(
            h2(
              "div",
              {
                key: "o" + (o.attr || "") + (o.value || "") + (o.collected_at || ""),
                className: "rt-kv"
              },
              h2("b", null, o.attr || "\u2014"),
              h2(
                "span",
                null,
                (o.value || "") + " \xB7 " + (o.tool || "\uC54C \uC218 \uC5C6\uB294 \uB3C4\uAD6C") + " \xB7 " + fmt(o.collected_at)
              ),
              h2(ProvTag, { p: o.provenance })
            )
          );
        }
      }
      const all = showAll === it.id;
      const noteLines = d && d.test_notes ? d.test_notes.split("\n").filter(Boolean) : [];
      const inner = d ? h2(
        "div",
        null,
        /* 반드시 읽을 3줄 */
        h2(
          "div",
          { className: "rt-kv" },
          h2("b", null, "\uD14C\uC2A4\uD2B8"),
          h2(
            "span",
            null,
            h2(TestTag, { s: d.test_status }),
            d.blocked_count ? h2(
              "span",
              {
                className: "rt-tag",
                style: {
                  marginLeft: 6,
                  color: "#ef4444",
                  borderColor: "#ef444455"
                }
              },
              "\uCC28\uB2E8 " + d.blocked_count + "\uD68C"
            ) : null,
            h2(
              "span",
              {
                style: {
                  marginLeft: 8,
                  color: "var(--dsw-alias-label-secondary)"
                }
              },
              (d.test_updated_at ? fmt(d.test_updated_at) : "\uBBF8\uD14C\uC2A4\uD2B8") + (d.test_updated_by ? " \xB7 " + d.test_updated_by : "")
            )
          )
        ),
        h2(
          "div",
          { className: "rt-kv" },
          h2("b", null, "\uACF5\uB7B5 \uC6A9\uC774\uC131"),
          h2(
            "span",
            null,
            h2(PriTag, { p: d.priority }),
            h2(
              "span",
              { style: { marginLeft: 8 } },
              d.potential || "\uBBF8\uD3C9\uAC00"
            ),
            d.assess_reason ? h2(
              "span",
              {
                style: {
                  marginLeft: 8,
                  color: "var(--dsw-alias-label-secondary)"
                }
              },
              d.assess_reason
            ) : null
          )
        ),
        h2(
          "div",
          { className: "rt-kv" },
          h2("b", null, "\uACF5\uACA9 \uD45C\uBA74"),
          h2(
            "span",
            null,
            d.test_surface || (portRows.length ? "\uBBF8\uAE30\uB85D(\uC5F4\uB9B0 \uD3EC\uD2B8\uB294 \uC544\uB798 \uCC38\uC870)" : "\uC5F4\uB9B0 \uD3EC\uD2B8 \uC5C6\uC74C"),
            d.scope ? h2(
              "span",
              {
                className: "rt-scope rt-scope-" + (d.scope === "internal" ? "internal" : "external"),
                style: { marginLeft: 8 }
              },
              d.scope === "internal" ? "\uB0B4\uBD80\uB9DD \uC790\uC0B0" : "\uC678\uBD80\uB9DD \uC790\uC0B0"
            ) : null
          )
        ),
        h2(
          "span",
          Object.assign(
            { className: "rt-more" },
            clickable(() => setShowAll(all ? null : it.id), {
              label: all ? "\uC790\uC0B0 \uC0C1\uC138 \uC811\uAE30" : "\uC790\uC0B0 \uC0C1\uC138 \uD3BC\uCE58\uAE30",
              expanded: all
            })
          ),
          all ? "\uC804\uCCB4 \uC811\uAE30 \u25B2" : "\uC804\uCCB4 \uD3BC\uCE58\uAE30(\uD3EC\uD2B8 \xB7 \uC9C0\uBB38 \xB7 \uC218\uC9D1 \uCD9C\uCC98 \xB7 \uD14C\uC2A4\uD2B8 \uAE30\uB85D) \u25BC"
        ),
        all ? h2(
          "div",
          null,
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uD638\uC2A4\uD2B8 \uC774\uB984"),
            h2(
              "span",
              null,
              (d.names || []).map((n) => n.name).join(", ") || "\u2014"
            )
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uBC1C\uACAC \uC2DC\uAC01"),
            h2(
              "span",
              {
                title: '\uC774 \uC790\uC0B0\uC774 \uC790\uC0B0 \uBAA9\uB85D\uC5D0 \uCC98\uC74C \uB4E4\uC5B4\uC628 \uC2DC\uAC01(\uC911\uBCF5 \uC218\uC9D1\uC740 "\uCD5C\uADFC \uC218\uC9D1"\uB9CC \uAC31\uC2E0\uD569\uB2C8\uB2E4)'
              },
              fmt(d.discovered_at)
            ),
            h2(
              "b",
              { style: { minWidth: 0, marginLeft: 8 } },
              "\uCD5C\uADFC \uC218\uC9D1"
            ),
            h2("span", null, fmt(d.last_seen)),
            h2(
              "b",
              { style: { minWidth: 0, marginLeft: 8 } },
              "\uB370\uC774\uD130 \uC18C\uC2A4 \uCD5C\uCD08 \uD655\uC778"
            ),
            h2("span", null, fmt(d.first_seen))
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "C \uBE14\uB85D"),
            h2("span", null, d.segment_cidr)
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uACF5\uB7B5 \uC6A9\uC774\uC131"),
            h2(
              "span",
              null,
              (d.priority || "\uBBF8\uD3C9\uAC00") + (d.potential ? " \xB7 \uC608\uC0C1: " + d.potential : "") + (d.assess_reason ? " \xB7 \uADFC\uAC70: " + d.assess_reason : "") + (d.assessed_at ? "(" + fmt(d.assessed_at) + ")" : "")
            )
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uCD9C\uCC98"),
            h2(
              "span",
              null,
              "\uC218\uB3D9 \uD3EC\uD2B8 " + (d.passive || 0) + " \xB7 \uB2A5\uB3D9 \uD3EC\uD2B8 " + (d.active || 0)
            )
          ),
          h2(
            "div",
            { style: { margin: "6px 0 3px", fontWeight: 600 } },
            "\uC5F4\uB9B0 \uD3EC\uD2B8 / \uC11C\uBE44\uC2A4"
          ),
          h2("div", null, portRows.length ? portRows : "\u2014"),
          h2(
            "div",
            { style: { margin: "6px 0 3px", fontWeight: 600 } },
            "\uC9C0\uBB38"
          ),
          h2("div", null, fpRows.length ? fpRows : "\u2014"),
          noteLines.length ? h2(Clip, {
            key: "notes",
            label: "\uD14C\uC2A4\uD2B8 \uAE30\uB85D(" + noteLines.length + "\uAC74)",
            text: noteLines.join("\n")
          }) : null,
          h2(
            "div",
            { style: { margin: "6px 0 3px", fontWeight: 600 } },
            "\uC218\uC9D1 \uCD9C\uCC98(\uCD5C\uADFC 8\uAC74)"
          ),
          h2("div", null, obsRows.length ? obsRows : "\u2014")
        ) : null
      ) : h2("div", null, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026");
      rowNodes.push(
        h2(
          "div",
          {
            key: "d" + it.id,
            className: "rt-row",
            style: { cursor: "default", gridTemplateColumns: "1fr" }
          },
          h2("div", { className: "rt-expand" }, inner)
        )
      );
    }
    const listPane = h2(
      "div",
      { className: "rt-table" },
      head,
      rowNodes,
      !state.loading && !state.items.length ? h2("div", { className: "rt-empty" }, "\uC77C\uCE58\uD558\uB294 \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4") : null
    );
    const domainPane = h2(
      "div",
      { className: "rt-table" },
      domains === null ? h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026") : domains.length ? domains.map(
        (g) => h2(
          "div",
          { key: g.domain },
          h2(
            "div",
            {
              className: "rt-section",
              style: { padding: "8px 10px 4px" }
            },
            h2(
              "a",
              {
                className: "rt-link",
                href: "http://" + g.domain,
                target: "_blank",
                rel: "noreferrer"
              },
              g.domain
            ),
            h2(
              "span",
              { className: "rt-tag", style: { marginLeft: 8 } },
              g.count + "\uAC1C \uC790\uC0B0"
            )
          ),
          g.assets.map(
            (a) => h2(
              "div",
              {
                key: String(g.domain) + "\0" + a.id + "\0" + a.ip,
                className: "rt-row",
                style: {
                  gridTemplateColumns: "150px 130px 70px 1fr",
                  cursor: "pointer"
                },
                onClick: () => {
                  setView("list");
                  setQ("");
                  setQApplied(a.ip);
                }
              },
              h2("span", { className: "rt-mono" }, a.ip),
              h2("span", { className: "rt-mono" }, a.segment),
              h2(
                "span",
                null,
                h2(
                  "span",
                  {
                    className: "rt-tag rt-tag-" + (a.state === "live" ? "live" : "dead")
                  },
                  a.state === "live" ? "\uC0DD\uC874" : a.state
                )
              ),
              h2(
                "span",
                {
                  style: {
                    fontSize: 11,
                    color: "var(--dsw-alias-label-secondary)"
                  }
                },
                (a.names || []).join(", ")
              )
            )
          )
        )
      ) : h2(
        "div",
        { className: "rt-empty" },
        cidr ? "\uC774 C \uBE14\uB85D\uC5D0\uB294 \uC544\uC9C1 \uB3C4\uBA54\uC778\uC774 \uC5C6\uC2B5\uB2C8\uB2E4(\u201C\uC804\uCCB4 C \uBE14\uB85D\u201D\uC73C\uB85C \uC804\uD658\uD558\uBA74 \uC804\uCCB4\uB97C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4)" : "\uB3C4\uBA54\uC778 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4(\uC815\uBCF4 \uC218\uC9D1 \uB2E8\uACC4\uC5D0\uC11C \uB3C4\uBA54\uC778\uC774 \uAE30\uB85D\uB429\uB2C8\uB2E4)"
      )
    );
    const webPane = h2(
      "div",
      { className: "rt-table" },
      h2(
        "div",
        {
          className: "rt-row head",
          style: { gridTemplateColumns: "1.6fr 1.2fr 130px 110px" }
        },
        h2("span", null, "URL(\uD074\uB9AD \uAC00\uB2A5)"),
        h2("span", null, "\uC81C\uBAA9"),
        h2("span", null, "\uC790\uC0B0"),
        h2("span", null, "\uC11C\uBE44\uC2A4")
      ),
      (web || []).map((w) => {
        const url = w.url || "http" + (w.port === 443 || w.port === 8443 || w.port === 9443 ? "s" : "") + "://" + w.ip + (w.port === 80 || w.port === 443 ? "" : ":" + w.port);
        return h2(
          "div",
          {
            key: "w" + w.port_id,
            className: "rt-row",
            style: {
              gridTemplateColumns: "1.6fr 1.2fr 130px 110px",
              cursor: "default"
            }
          },
          h2(
            "a",
            {
              className: "rt-link rt-mono",
              href: url,
              target: "_blank",
              rel: "noreferrer",
              title: url
            },
            url
          ),
          h2("span", { title: w.title || "" }, w.title || "\u2014"),
          h2("span", { className: "rt-mono" }, w.ip + " \xB7 " + w.segment_cidr),
          h2(
            "span",
            { style: { fontSize: 11 } },
            [w.service, w.product, w.version].filter(Boolean).join(" ")
          )
        );
      }),
      web === null ? h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026") : !web.length ? h2(
        "div",
        { className: "rt-empty" },
        cidr ? "\uC774 C \uBE14\uB85D\uC5D0\uB294 \uC544\uC9C1 Web \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" : "Web \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4(HTTP \uD0D0\uC9C0 \uD6C4 URL \uACFC \uC81C\uBAA9\uC774 \uAE30\uB85D\uB429\uB2C8\uB2E4)"
      ) : null
    );
    let pane = listPane;
    if (view === "testing")
      pane = h2(TestingTab, { engagement: eng, refreshKey });
    else if (view === "domain") pane = domainPane;
    else if (view === "web") pane = webPane;
    else if (view === "timeline")
      pane = h2(DiscoveryView, { engagement: eng, refreshKey });
    return h2(
      "div",
      { className: "rt-split" },
      side,
      h2(
        "div",
        { className: "rt-main" },
        view === "testing" ? null : toolbar,
        conclusion,
        state.error ? h2("div", { className: "rt-err" }, state.error) : null,
        pane
      )
    );
  }
  function DiscoveryView(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [day, setDay] = import_react2.default.useState("");
    import_react2.default.useEffect(() => {
      if (!eng) return;
      setData(null);
      api({ op: "discoveryTimeline", engagement: eng, limit: 200 }).then(
        (r) => {
          if (!r || r.ok === false) setErr(r && r.error || "\uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328");
          else {
            setErr(null);
            setData(r);
          }
        },
        (e) => setErr(String(e && e.message || e))
      );
    }, [eng, refreshKey]);
    if (err)
      return h2(
        "div",
        { className: "rt-pane" },
        h2("div", { className: "rt-err" }, err)
      );
    if (!data) return h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026");
    const recent = (data.recent || []).filter(
      (a) => day === "" || String(a.discovered_at || "").slice(0, 10) === day
    );
    return h2(
      "div",
      { className: "rt-pane", style: { flex: 1, minHeight: 0 } },
      h2(
        "div",
        { className: "rt-card" },
        h2("h4", null, "\uC790\uC0B0 \uBC1C\uACAC \uD0C0\uC784\uB77C\uC778"),
        h2(
          "div",
          {
            style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" }
          },
          "\uCD1D " + (data.span && data.span.total || 0) + "\uB300 \xB7 \uAC00\uC7A5 \uC774\uB978 " + (data.span && data.span.first ? fmt(data.span.first) : "\u2014") + " \xB7 \uCD5C\uADFC " + (data.span && data.span.last ? fmt(data.span.last) : "\u2014") + '(\uBC1C\uACAC \uC2DC\uAC01 = \uC790\uC0B0 \uBAA9\uB85D\uC5D0 \uCC98\uC74C \uB4E4\uC5B4\uC628 \uC2DC\uAC01; \uC911\uBCF5 \uC218\uC9D1\uC740 "\uCD5C\uADFC \uC218\uC9D1"\uB9CC \uAC31\uC2E0\uD569\uB2C8\uB2E4)'
        )
      ),
      (data.days || []).length === 0 ? h2("div", { className: "rt-empty" }, "\uC544\uC9C1 \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") : null,
      h2(
        "div",
        { className: "rt-card" },
        h2(
          "h4",
          null,
          "\uC77C\uC790\uBCC4 \uD1B5\uACC4",
          day ? h2(
            "span",
            Object.assign(
              {
                className: "rt-tag",
                style: { marginLeft: 6, cursor: "pointer" }
              },
              clickable(() => setDay(""), {
                label: "\uC77C\uC790 \uD544\uD130 \uD574\uC81C: " + day
              })
            ),
            "\uD544\uD130 \uD574\uC81C: " + day
          ) : null
        ),
        h2(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
          (data.days || []).map(
            (d) => h2(
              "div",
              Object.assign(
                {
                  key: d.day,
                  className: "rt-seg" + (day === d.day ? " on" : ""),
                  style: { marginBottom: 0, cursor: "pointer" },
                  title: d.day + ": \uC2E0\uADDC " + d.assets + "\uB300(\uB0B4\uBD80 " + d.internal + " / \uC678\uBD80 " + d.external + ")"
                },
                clickable(() => setDay(day === d.day ? "" : d.day), {
                  label: "\uBC1C\uACAC\uC77C \uD544\uD130 " + d.day + " \uC790\uC0B0",
                  expanded: day === d.day
                })
              ),
              h2("div", { className: "rt-seg-cidr" }, d.day),
              h2(
                "div",
                { className: "rt-seg-meta" },
                d.assets + "\uB300 \xB7 \uB0B4 " + d.internal + " / \uC678 " + d.external
              )
            )
          )
        )
      ),
      h2(
        "div",
        { className: "rt-card" },
        h2(
          "h4",
          null,
          day ? day + " \uBC1C\uACAC \uC790\uC0B0(" + recent.length + ")" : "\uCD5C\uADFC \uBC1C\uACAC \uC790\uC0B0(" + recent.length + ")"
        ),
        recent.length === 0 ? h2("div", { className: "rt-empty" }, "\uC774 \uB0A0\uC740 \uC2E0\uADDC \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") : null,
        recent.map(
          (a) => h2(
            "div",
            { key: a.id, className: "rt-kv" },
            h2(
              "b",
              { className: "rt-mono", style: { minWidth: 110 } },
              h2(
                "span",
                {
                  className: "rt-scope rt-scope-" + (a.scope === "internal" ? "internal" : "external"),
                  style: { marginRight: 4 }
                },
                a.scope === "internal" ? "\uB0B4" : "\uC678"
              ),
              a.ip
            ),
            h2(
              "span",
              {
                style: {
                  minWidth: 132,
                  fontSize: 11.5,
                  color: "var(--dsw-alias-label-secondary)"
                }
              },
              a.discovered_at ? fmt(a.discovered_at) : "\uC2DC\uAC01 \uBBF8\uC0C1"
            ),
            h2(
              "span",
              { style: { flex: 1 } },
              (a.primary_name || "\u2014") + (a.open_ports ? " \xB7 " + a.open_ports + "\uAC1C \uD3EC\uD2B8" : "")
            ),
            h2(PriTag, { p: a.priority })
          )
        )
      )
    );
  }
  function PromptsTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [roles, setRoles] = import_react2.default.useState([]);
    const [active, setActive] = import_react2.default.useState(null);
    const [draft, setDraft] = import_react2.default.useState("");
    const [msg, setMsg] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    import_react2.default.useEffect(() => {
      api(eng ? { op: "prompts", engagement: eng } : { op: "prompts" }).then(
        (r) => {
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC77D\uAE30 \uC2E4\uD328" });
            return;
          }
          setRoles(r.roles || []);
          if (r.roles && r.roles.length)
            setActive((cur2) => cur2 || r.roles[0].role);
          if (r.builtin)
            setMsg({
              ok: "\uD604\uC7AC \uB0B4\uC7A5 \uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8\uC785\uB2C8\uB2E4(\uD0C0\uAE43\uC744 \uB9CC\uB4E4\uBA74 \uD0C0\uAE43\uBCC4\uB85C \uC218\uC815\uD574 \uC800\uC7A5\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4)"
            });
        },
        (e) => setMsg({ err: String(e && e.message || e) })
      );
    }, [eng, refreshKey]);
    import_react2.default.useEffect(() => {
      const r = roles.find((x) => x.role === active);
      if (r) setDraft(r.content || "");
    }, [active, roles]);
    const save = () => {
      if (!eng) {
        setMsg({ err: "\uBA3C\uC800 \uD0C0\uAE43\uC744 \uB9CC\uB4E0 \uB4A4 \uD504\uB86C\uD504\uD2B8\uB97C \uC800\uC7A5\uD558\uC138\uC694" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({
        op: "savePrompt",
        engagement: eng,
        role: active,
        content: draft
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC800\uC7A5 \uC2E4\uD328" });
            return;
          }
          setRoles(
            (list) => list.map(
              (x) => x.role === active ? Object.assign({}, x, {
                content: draft,
                updated_at: (/* @__PURE__ */ new Date()).toISOString()
              }) : x
            )
          );
          setMsg({ ok: "\uC800\uC7A5\uB428" });
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const reset = (all) => {
      if (!eng) {
        setMsg({ err: "\uBA3C\uC800 \uD0C0\uAE43\uC744 \uB9CC\uB4E0 \uB4A4 \uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8\uB97C \uBCF5\uC6D0\uD558\uC138\uC694" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({
        op: "resetPrompts",
        engagement: eng,
        role: all ? void 0 : active
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uBCF5\uC6D0 \uC2E4\uD328" });
            return;
          }
          setMsg({
            ok: "\uB0B4\uC7A5 \uAE30\uBCF8\uAC12\uC73C\uB85C \uBCF5\uC6D0\uB428: " + (r.reset || []).join(", ")
          });
          api({ op: "prompts", engagement: eng }).then(
            (rr) => {
              if (rr && rr.ok) {
                setRoles(rr.roles || []);
                const cur2 = (rr.roles || []).find((x) => x.role === active);
                if (cur2) setDraft(cur2.content || "");
              }
            },
            () => {
            }
          );
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const cur = roles.find((x) => x.role === active);
    const items = roles.map(
      (r) => h2(
        "div",
        Object.assign(
          {
            key: r.role,
            className: "rt-item" + (active === r.role ? " on" : "")
          },
          clickable(
            () => {
              setActive(r.role);
              setMsg(null);
            },
            {
              label: "\u201C" + r.title + "\u201D \uD504\uB86C\uD504\uD2B8 \uBCF4\uAE30",
              expanded: active === r.role
            }
          )
        ),
        h2("div", { className: "rt-item-name" }, r.title),
        h2(
          "div",
          { className: "rt-item-desc" },
          (r.content || "").replace(/[#*`]/g, "").slice(0, 60) || "(\uBE44\uC5B4 \uC788\uC74C)"
        )
      )
    );
    return h2(
      "div",
      { className: "rt-split" },
      h2("div", { className: "rt-list" }, items),
      h2(
        "div",
        { className: "rt-main" },
        h2(
          "div",
          { className: "rt-toolbar" },
          h2(
            "span",
            { style: { fontWeight: 600 } },
            cur ? cur.title : "\uD504\uB86C\uD504\uD2B8"
          ),
          h2(
            "span",
            { className: "rt-tag" },
            "\uAC31\uC2E0 " + fmt(cur && cur.updated_at)
          ),
          h2("div", { className: "rt-spacer" }),
          h2(
            "button",
            {
              className: "rt-btn",
              disabled: busy || !active,
              title: "\uD604\uC7AC \uC5ED\uD560\uC744 \uB0B4\uC7A5 \uCD5C\uC2E0\uD310 \uD504\uB86C\uD504\uD2B8\uB85C \uB418\uB3CC\uB9BD\uB2C8\uB2E4",
              onClick: () => reset(false)
            },
            "\uD604\uC7AC \uC5ED\uD560 \uAE30\uBCF8\uAC12 \uBCF5\uC6D0"
          ),
          h2(
            "button",
            {
              className: "rt-btn",
              disabled: busy,
              title: "\uB124 \uC5ED\uD560 \uC804\uBD80\uB97C \uB0B4\uC7A5 \uCD5C\uC2E0\uD310 \uD504\uB86C\uD504\uD2B8\uB85C \uB418\uB3CC\uB9BD\uB2C8\uB2E4",
              onClick: () => reset(true)
            },
            "\uC804\uCCB4 \uAE30\uBCF8\uAC12 \uBCF5\uC6D0"
          ),
          h2(
            "button",
            {
              className: "rt-btn rt-btn-primary",
              disabled: busy || !active,
              onClick: save
            },
            busy ? "\uC800\uC7A5 \uC911\u2026" : "\uC800\uC7A5"
          )
        ),
        msg ? h2(
          "div",
          { className: msg.err ? "rt-err" : "rt-foot" },
          msg.err || msg.ok
        ) : null,
        h2(
          "div",
          { className: "rt-pane" },
          h2("textarea", {
            className: "rt-textarea",
            value: draft,
            spellCheck: false,
            onChange: (e) => setDraft(e.target.value),
            placeholder: "\uC774 \uC5ED\uD560\uC758 \uC2DC\uC2A4\uD15C \uD504\uB86C\uD504\uD2B8(Markdown)"
          }),
          h2(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--dsw-alias-label-secondary)",
                marginTop: 6
              }
            },
            "\uC800\uC7A5\uD558\uBA74 agents/" + (active || "role") + ".md \uC5D0 \uAE30\uB85D\uB429\uB2C8\uB2E4. \uC11C\uBE0C \uC138\uC158 \uC791\uC5C5 \uCCAB \uC904\uC5D0 redteamRole: recon, assess, vuln-scan, exploit \uB610\uB294 internal \uC744 \uC4F0\uBA74 \uD574\uB2F9 \uD30C\uC77C\uC774 \uC2DC\uC2A4\uD15C \uD504\uB86C\uD504\uD2B8\uB85C \uB4E4\uC5B4\uAC11\uB2C8\uB2E4."
          )
        )
      )
    );
  }
  function SkillsTab(props) {
    const refreshKey = props.refreshKey || 0;
    const [items, setItems] = import_react2.default.useState([]);
    const [meta, setMeta] = import_react2.default.useState({});
    const [err, setErr] = import_react2.default.useState(null);
    const [q, setQ] = import_react2.default.useState("");
    const [srcOnly, setSrcOnly] = import_react2.default.useState(false);
    const [active, setActive] = import_react2.default.useState(null);
    const [detail, setDetail] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const [brokenOnly, setBrokenOnly] = import_react2.default.useState(false);
    const load = (force) => {
      setBusy(true);
      api({ op: "skillCatalog", refresh: force === true }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setMeta(r || {});
          setItems(r.items || []);
        },
        (e) => {
          setBusy(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    import_react2.default.useEffect(load, [refreshKey]);
    const open = (skill) => {
      const name2 = skill && skill.name;
      const key = (skill && skill.library ? skill.library : "redteam") + ":" + name2;
      if (active === key) {
        setActive(null);
        setDetail(null);
        return;
      }
      setActive(key);
      setDetail(null);
      api({
        op: "skillRead",
        name: name2,
        library: skill.library || "redteam"
      }).then(
        (r) => {
          if (r && r.ok) setDetail(r);
          else setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
        },
        (e) => setErr(String(e && e.message || e))
      );
    };
    const needle = q.trim().toLowerCase();
    let filtered = needle ? items.filter(
      (s) => (s.name + " " + s.description + " " + s.whenToUse).toLowerCase().indexOf(needle) >= 0
    ) : items;
    if (srcOnly)
      filtered = filtered.filter(
        (s) => s.library !== "official" && s.fromPlugin === true
      );
    if (brokenOnly)
      filtered = filtered.filter(
        (s) => s.library !== "official" && (s.availability === "broken" || s.availability === "unknown")
      );
    const dirs = (meta.byDir || []).filter((d) => d.n > 0).slice(0, 6);
    const availSummary = meta.availability ? meta.availability.summary : null;
    const needRestart = err !== null && String(err).indexOf("unknown op") >= 0;
    const renderSkill = (s) => h2(
      "div",
      Object.assign(
        {
          key: (s.library || "redteam") + ":" + s.name,
          className: "rt-item" + (active === (s.library || "redteam") + ":" + s.name ? " on" : "")
        },
        clickable(() => open(s), {
          label: "\uC2A4\uD0AC \uBCF4\uAE30 " + s.name,
          expanded: active === (s.library || "redteam") + ":" + s.name
        })
      ),
      h2(
        "div",
        { className: "rt-item-name" },
        s.name,
        s.modelInvocable === false ? h2(
          "span",
          { className: "rt-tag", style: { marginLeft: 6 } },
          "\uC218\uB3D9 \uC804\uC6A9"
        ) : null,
        s.library === "official" ? h2(
          "span",
          {
            className: "rt-tag",
            style: { marginLeft: 6 },
            title: "\uACF5\uC2DD \uC2A4\uD0AC \uB514\uB809\uD130\uB9AC\uC774\uBA70 \uB808\uB4DC\uD300 \uB3C4\uAD6C \uACBD\uB85C\uB85C \uAC80\uC0AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
          },
          "\uACF5\uC2DD"
        ) : h2(
          "span",
          {
            className: "rt-avail rt-avail-" + (s.availability || "unknown"),
            style: { marginLeft: 6 },
            title: s.availability === "available" ? "\uC0AC\uC6A9 \uAC00\uB2A5: \uC2A4\uD0AC \uBCF8\uBB38\uC744 \uB85C\uB4DC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBE60\uC9C4 \uC678\uBD80 \uB3C4\uAD6C\uB098 \uD0A4\uB294 \uC0C1\uC138\uC5D0 \uAE30\uB85D\uB418\uBA70 \uD638\uCD9C\uC744 \uB9C9\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." : (s.problems || []).join("\n") || "\uC54C \uC218 \uC5C6\uC74C"
          },
          s.availability === "available" ? "\uC0AC\uC6A9 \uAC00\uB2A5" : s.availability === "broken" ? "\uC0AC\uC6A9 \uBD88\uAC00" : "\uC54C \uC218 \uC5C6\uC74C"
        ),
        h2(
          "div",
          { className: "rt-item-desc" },
          s.description || "(\uC124\uBA85 \uC5C6\uC74C)"
        ),
        h2(
          "div",
          { className: "rt-kb-sub" },
          [
            s.source ? "\uCD9C\uCC98 " + s.source : null,
            s.fromPlugin ? "\uC774 \uD50C\uB7EC\uADF8\uC778 \uB0B4\uC7A5" : null,
            s.provider ? s.provider : null,
            s.dir ? s.dir : null
          ].filter(Boolean).join(" \xB7 ")
        ),
        (s.problems || []).length > 0 && s.availability !== "available" && s.library !== "official" ? h2(
          "div",
          {
            className: "rt-kb-sub",
            style: {
              color: "var(--dsw-alias-state-warn-primary, #f59e0b)"
            }
          },
          "\u26A0 " + String(s.problems[0]).slice(0, 60)
        ) : null
      )
    );
    const redteamRows = filtered.filter((s) => s.library !== "official").map(renderSkill);
    const officialRows = filtered.filter((s) => s.library === "official").map(renderSkill);
    const listItems = [];
    if (redteamRows.length > 0) {
      listItems.push(
        h2(
          "div",
          {
            key: "head-redteam",
            className: "rt-kb-sub",
            style: { margin: "8px 0 4px", fontWeight: 600 }
          },
          "\uB808\uB4DC\uD300 \uC2A4\uD0AC"
        )
      );
      listItems.push.apply(listItems, redteamRows);
    }
    if (officialRows.length > 0) {
      listItems.push(
        h2(
          "div",
          {
            key: "head-official",
            className: "rt-kb-sub",
            style: { margin: "8px 0 4px", fontWeight: 600 }
          },
          "\uACF5\uC2DD \uC2A4\uD0AC"
        )
      );
      listItems.push.apply(listItems, officialRows);
    }
    return h2(
      "div",
      { className: "rt-split" },
      h2(
        "div",
        { className: "rt-list" },
        h2("input", {
          className: "rt-input",
          style: { width: "100%", marginBottom: 8, boxSizing: "border-box" },
          placeholder: "\uC2A4\uD0AC \uD544\uD130",
          value: q,
          onChange: (e) => setQ(e.target.value)
        }),
        h2(
          "label",
          {
            className: "rt-kb-check",
            style: { display: "flex", margin: "0 0 6px" }
          },
          h2("input", {
            type: "checkbox",
            checked: srcOnly,
            onChange: (e) => setSrcOnly(e.target.checked)
          }),
          "\uC774 \uD50C\uB7EC\uADF8\uC778 \uB0B4\uC7A5\uB9CC(" + (meta.fromPlugin || 0) + "\uAC1C)"
        ),
        availSummary && (availSummary.broken > 0 || availSummary.unknown > 0) ? h2(
          "label",
          {
            className: "rt-kb-check",
            style: { display: "flex", margin: "0 0 8px" },
            title: "\uBA85\uD655\uD55C \uACB0\uC190(\uD0A4 \uC5C6\uC74C / \uB85C\uCEEC \uACBD\uB85C \uC5C6\uC74C / \uC778\uD504\uB77C\uAC00 \uC544\uC9C1 \uC790\uB9AC\uD45C\uC2DC\uC790)\uC774 \uC788\uAC70\uB098 \uC0AC\uC6A9 \uAC00\uB2A5\uC131\uC744 \uD310\uC815\uD560 \uC218 \uC5C6\uB294 \uC2A4\uD0AC\uB9CC \uBD05\uB2C8\uB2E4"
          },
          h2("input", {
            type: "checkbox",
            checked: brokenOnly,
            onChange: (e) => setBrokenOnly(e.target.checked)
          }),
          "\uC0AC\uC6A9 \uBD88\uAC00/\uC54C \uC218 \uC5C6\uC74C\uB9CC(" + ((availSummary.broken || 0) + (availSummary.unknown || 0)) + "\uAC1C)"
        ) : null,
        availSummary ? h2(
          "div",
          {
            style: {
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
              marginBottom: 6
            }
          },
          h2(
            "span",
            { className: "rt-avail rt-avail-available" },
            "\uC0AC\uC6A9 \uAC00\uB2A5 " + (availSummary.available || 0)
          ),
          availSummary.broken > 0 ? h2(
            "span",
            { className: "rt-avail rt-avail-broken" },
            "\uC0AC\uC6A9 \uBD88\uAC00 " + availSummary.broken
          ) : null,
          availSummary.unknown > 0 ? h2(
            "span",
            { className: "rt-avail rt-avail-unknown" },
            "\uC54C \uC218 \uC5C6\uC74C " + availSummary.unknown
          ) : null,
          h2(
            "span",
            Object.assign(
              {
                className: "rt-tag",
                style: { cursor: "pointer" },
                title: "\uC2A4\uD0AC \uBCF8\uBB38\uC774\uB098 \uD658\uACBD \uBCC0\uC218\uB97C \uBC29\uAE08 \uBC14\uAFB8\uC168\uB098\uC694? \uC5EC\uAE30\uB97C \uB204\uB974\uBA74 30\uCD08 \uCE90\uC2DC\uB97C \uAC74\uB108\uB6F0\uACE0 \uB2E4\uC2DC \uAC80\uC0AC\uD569\uB2C8\uB2E4"
              },
              clickable(() => load(true), {
                label: "\uC2A4\uD0AC \uC0AC\uC6A9 \uAC00\uB2A5\uC131 \uC7AC\uAC80\uC0AC"
              })
            ),
            "\uC0AC\uC6A9 \uAC00\uB2A5\uC131 \uC7AC\uAC80\uC0AC"
          )
        ) : null,
        h2(
          "div",
          {
            style: {
              fontSize: 11,
              color: "var(--dsw-alias-label-secondary)",
              marginBottom: 6
            }
          },
          "\uB808\uB4DC\uD300 " + (meta.libraries && meta.libraries.redteam || 0) + " \xB7 \uACF5\uC2DD " + (meta.libraries && meta.libraries.official || 0),
          items.length > 100 ? h2(
            "div",
            { style: { marginTop: 3 } },
            "(\uC2A4\uD0AC\uC740 \uB300\uAC1C \uB2E4\uB978 \uD50C\uB7EC\uADF8\uC778\uC774 \uB4F1\uB85D\uD55C \uB8E8\uD2B8\uB098 \uC9C1\uC811 \uB9CC\uB4E0 \uC2A4\uD0AC \uB514\uB809\uD130\uB9AC\uC5D0\uC11C \uC635\uB2C8\uB2E4; \uC774 \uD50C\uB7EC\uADF8\uC778 \uB0B4\uC7A5\uC740 " + (meta.fromPlugin || 0) + "\uAC1C\uBFD0\uC785\uB2C8\uB2E4)"
          ) : null
        ),
        listItems
      ),
      h2(
        "div",
        { className: "rt-main" },
        h2(
          "div",
          { className: "rt-toolbar" },
          h2(
            "span",
            { style: { fontWeight: 600 } },
            detail ? detail.name : "\uC2A4\uD0AC \uB514\uB809\uD130\uB9AC(DSH \uB124\uC774\uD2F0\uBE0C)"
          ),
          h2("div", { className: "rt-spacer" }),
          h2(
            "button",
            { className: "rt-btn", disabled: busy, onClick: () => load(true) },
            busy ? "\uC0C8\uB85C\uACE0\uCE68 \uC911\u2026" : "\uC0C8\uB85C\uACE0\uCE68"
          )
        ),
        err ? needRestart ? h2(
          "div",
          { className: "rt-empty" },
          "\uC774 \uBAA8\uB4C8\uC758 \uD638\uC2A4\uD2B8 \uCF54\uB4DC\uAC00 \uAC31\uC2E0\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uD638\uC2A4\uD2B8(\uACF5\uC2DD exe / \uCEE4\uBBA4\uB2C8\uD2F0\uD310 / dsh web)\uB97C \uD55C \uBC88 \uC7AC\uC2DC\uC791\uD574\uC57C \uC801\uC6A9\uB429\uB2C8\uB2E4"
        ) : h2("div", { className: "rt-err" }, err) : null,
        detail ? h2(
          "div",
          { className: "rt-pane" },
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uC124\uBA85"),
            h2("span", null, detail.description || "\u2014")
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uC0AC\uC6A9 \uC2DC\uC810"),
            h2("span", null, detail.whenToUse || "\u2014")
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uCD9C\uCC98"),
            h2(
              "span",
              null,
              (detail.provider || "\u2014") + " / " + (detail.source || "\u2014")
            )
          ),
          (() => {
            const s2 = items.find(
              (x) => (x.library || "redteam") + ":" + x.name === active
            );
            if (!s2) return null;
            if (s2.library === "official") {
              return h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uC720\uD615"),
                h2(
                  "span",
                  null,
                  "\uACF5\uC2DD \uC2A4\uD0AC. \uD638\uC2A4\uD2B8\uAC00 \uC791\uC5C5\uC5D0 \uB530\uB77C \uD638\uCD9C\uD558\uBA70 \uB808\uB4DC\uD300 \uB3C4\uAD6C \uACBD\uB85C\uB85C \uAC80\uC0AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
                )
              );
            }
            const avail = s2.availability || "unknown";
            return h2(
              "div",
              null,
              h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uC0AC\uC6A9 \uAC00\uB2A5\uC131"),
                h2(
                  "span",
                  { className: "rt-avail rt-avail-" + avail },
                  avail === "available" ? "\uC0AC\uC6A9 \uAC00\uB2A5" : avail === "broken" ? "\uC0AC\uC6A9 \uBD88\uAC00(\uBA85\uD655\uD55C \uACB0\uC190 \uC788\uC74C)" : "\uC54C \uC218 \uC5C6\uC74C(\uBCF8\uBB38\uC744 \uC77D\uC744 \uC218 \uC5C6\uC74C)"
                )
              ),
              (s2.problems || []).length > 0 ? h2(
                "div",
                { className: "rt-kv" },
                h2(
                  "b",
                  null,
                  avail === "available" ? "\uC124\uCE58\uB418\uC9C0 \uC54A\uC740 \uC678\uBD80 \uB3C4\uAD6C" : "\uACB0\uC190"
                ),
                h2(
                  "span",
                  null,
                  s2.problems.map(
                    (x, i) => h2("div", { key: "p" + i }, "\xB7 " + x)
                  )
                )
              ) : null,
              (s2.needs_user || []).length > 0 ? h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uC9C1\uC811 \uC81C\uACF5\uD574\uC57C \uD558\uB294 \uAC83"),
                h2(
                  "span",
                  {
                    style: {
                      color: "var(--dsw-alias-state-warn-primary, #f59e0b)"
                    }
                  },
                  s2.needs_user.map(
                    (x, i) => h2("div", { key: "n" + i }, "\xB7 " + x)
                  )
                )
              ) : null
            );
          })(),
          detail.path ? h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uD30C\uC77C"),
            h2(
              "span",
              {
                className: "rt-mono",
                style: { wordBreak: "break-all" }
              },
              detail.path
            )
          ) : null,
          h2(
            "pre",
            {
              className: "rt-md",
              style: {
                border: "1px solid var(--dsw-alias-border-l1)",
                borderRadius: 6,
                maxHeight: "52vh"
              }
            },
            detail.content || "(\uBE44\uC5B4 \uC788\uC74C)"
          )
        ) : h2(
          "div",
          { className: "rt-pane" },
          h2(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--dsw-alias-label-secondary)",
                marginBottom: 8
              }
            },
            meta.note || "\uC2A4\uD0AC\uC740 DSH \uB124\uC774\uD2F0\uBE0C skill \uCCB4\uACC4\uAC00 \uAD00\uB9AC\uD558\uBA70, \uB808\uB4DC\uD300 \uC5D0\uC774\uC804\uD2B8\uB294 skill \uB3C4\uAD6C\uB85C \uD638\uCD9C\uD569\uB2C8\uB2E4."
          ),
          availSummary ? h2(
            "div",
            {
              style: {
                fontSize: 12,
                marginBottom: 8,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                alignItems: "center"
              }
            },
            h2(
              "span",
              { className: "rt-avail rt-avail-available" },
              "\uC0AC\uC6A9 \uAC00\uB2A5 " + (availSummary.available || 0)
            ),
            availSummary.broken > 0 ? h2(
              "span",
              { className: "rt-avail rt-avail-broken" },
              "\uC0AC\uC6A9 \uBD88\uAC00 " + availSummary.broken
            ) : null,
            availSummary.unknown > 0 ? h2(
              "span",
              { className: "rt-avail rt-avail-unknown" },
              "\uC54C \uC218 \uC5C6\uC74C " + availSummary.unknown
            ) : null,
            h2(
              "span",
              { style: { color: "var(--dsw-alias-label-secondary)" } },
              "(" + (meta.availability && meta.availability.cached ? "\uCE90\uC2DC \uC2DC\uAC01 " : "\uAC80\uC0AC \uC2DC\uAC01 ") + (meta.availability && meta.availability.checked_at ? fmt(meta.availability.checked_at) : "\u2014") + ")"
            )
          ) : null,
          meta.availability && (meta.availability.broken || []).length > 0 ? h2(
            "div",
            { className: "rt-hint" },
            h2(
              "div",
              { style: { fontWeight: 600, marginBottom: 4 } },
              "\uC9C0\uAE08 \uC2E4\uD589\uD560 \uC218 \uC5C6\uB294 \uC2A4\uD0AC:"
            ),
            meta.availability.broken.slice(0, 12).map(
              (b) => h2(
                "div",
                { key: b.name },
                "\xB7 " + b.name + (b.problems && b.problems.length ? " \u2014 " + b.problems[0] : "")
              )
            )
          ) : null,
          (meta.byDir || []).slice(0, 6).map(
            (d) => h2(
              "div",
              {
                key: d.key,
                className: "rt-mono",
                style: {
                  fontSize: 11,
                  marginBottom: 2,
                  overflowWrap: "anywhere"
                }
              },
              d.n + "\uAC1C \xB7 " + d.key
            )
          ),
          (meta.byDir || []).length > 6 ? h2(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--dsw-alias-label-secondary)"
              }
            },
            "\u2026\uADF8 \uBC16\uC5D0 " + ((meta.byDir || []).length - 6) + "\uAC1C \uB514\uB809\uD130\uB9AC(\uCD1D " + items.length + "\uAC1C \uC2A4\uD0AC)"
          ) : null,
          h2(
            "div",
            { className: "rt-empty" },
            "\uC67C\uCABD\uC5D0\uC11C \uC2A4\uD0AC\uC744 \uC120\uD0DD\uD558\uBA74 \uB0B4\uC6A9\uC774 \uBCF4\uC785\uB2C8\uB2E4"
          )
        )
      )
    );
  }
  const SEV_LABEL = {
    critical: "\uCE58\uBA85",
    high: "\uB192\uC74C",
    medium: "\uBCF4\uD1B5",
    low: "\uB0AE\uC74C",
    info: "\uC815\uBCF4"
  };
  const STATUS_LABEL = {
    candidate: "\uAC80\uC99D \uB300\uAE30",
    confirmed: "\uD655\uC778\uB428",
    "false-positive": "\uC624\uD0D0",
    exploited: "\uC775\uC2A4\uD50C\uB85C\uC787 \uC644\uB8CC",
    fixed: "\uC218\uC815\uB428"
  };
  const sevClass = (s) => "rt-sev rt-sev-" + (SEV_LABEL[s] ? s : "info");
  function targetKeyOf(v) {
    const t = String(v.target || "").trim();
    if (t !== "") {
      const url = /^([a-z][a-z0-9+.-]*:\/\/[^/?#\s]+)/i.exec(t);
      if (url) return url[1];
      const head = /^([^\s/?#]+)/.exec(t);
      if (head) return head[1];
      return t;
    }
    return v.asset_ip || "(\uB300\uC0C1 \uBBF8\uC9C0\uC815)";
  }
  function HttpBlock(props) {
    const text = String(props.text || "");
    if (!text) return null;
    const lines = text.split(/\r?\n/);
    const nodes = lines.map((ln, i) => {
      let cls = null;
      if (i === 0 && /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|TRACE)\s/.test(ln))
        cls = "rt-hl-req";
      else if (i === 0 && /^HTTP\//.test(ln)) cls = "rt-hl-res";
      else if (/^[A-Za-z0-9-]+:/.test(ln)) {
        const name2 = ln.split(":")[0].toLowerCase();
        if (name2 === "host" || name2 === "cookie" || name2 === "authorization" || name2 === "content-type")
          cls = "rt-hl-req";
      }
      return h2(
        "div",
        { key: "l" + i, className: cls || void 0 },
        ln === "" ? "\xA0" : ln
      );
    });
    return h2(
      "pre",
      { className: "rt-evi-body" + (props.compact ? " req" : "") },
      nodes
    );
  }
  function detailEvidence(v) {
    const evi = String(v.evidence || "").trim();
    const looksHttp = /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|HTTP\/)/m.test(evi) || /\n[A-Za-z-]+: /.test(evi);
    const blocks = [];
    if (evi) {
      blocks.push(
        h2(
          "div",
          { key: "ev", className: "rt-evi" },
          h2(
            "div",
            { className: "rt-evi-head" },
            "\uC99D\uAC70 \uC694\uC57D",
            h2(
              "span",
              { className: "rt-tag" },
              looksHttp ? "\uC6D0\uBCF8 \uBA54\uC2DC\uC9C0" : "\uD14D\uC2A4\uD2B8"
            ),
            h2("div", { className: "rt-spacer" }),
            h2(
              "button",
              {
                className: "rt-btn",
                style: { padding: "0 6px", fontSize: 11 },
                onClick: (e) => {
                  e.stopPropagation();
                  copyText(evi);
                }
              },
              "\uBCF5\uC0AC"
            )
          ),
          looksHttp ? h2(HttpBlock, { text: evi }) : h2("pre", { className: "rt-evi-body" }, evi)
        )
      );
    }
    const http = v.http_evidence || [];
    for (const e of http) {
      blocks.push(
        h2(
          "div",
          { key: "h" + e.id, className: "rt-evi" },
          h2(
            "div",
            { className: "rt-evi-head" },
            e.label || "HTTP \uC99D\uAC70",
            h2(
              "span",
              { className: "rt-tag" },
              (e.method || "") + " " + (e.status === null || e.status === void 0 ? "" : e.status)
            ),
            h2("div", { className: "rt-spacer" }),
            h2(
              "span",
              {
                style: {
                  fontWeight: 400,
                  color: "var(--dsw-alias-label-secondary)"
                }
              },
              fmt(e.captured_at || e.created_at)
            )
          ),
          e.request ? h2(
            "div",
            null,
            h2(
              "div",
              { className: "rt-evi-head", style: { borderTop: "none" } },
              "\u25B8 \uC694\uCCAD(Burp Repeater \uC5D0 \uADF8\uB300\uB85C \uBD99\uC5EC\uB123\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4)"
            ),
            h2(HttpBlock, { text: e.request, compact: true })
          ) : null,
          e.response ? h2(
            "div",
            null,
            h2("div", { className: "rt-evi-head" }, "\u25B8 \uC751\uB2F5"),
            h2(HttpBlock, { text: e.response })
          ) : null,
          e.note ? h2(
            "pre",
            { className: "rt-evi-body", style: { maxHeight: 80 } },
            e.note
          ) : null
        )
      );
    }
    if (blocks.length === 0) {
      blocks.push(
        h2(
          "div",
          { key: "none", className: "rt-kv" },
          h2("b", null, "\uC99D\uAC70"),
          h2(
            "span",
            { style: { color: "var(--dsw-alias-state-error-primary)" } },
            "\uB204\uB77D \u2014 \uAC80\uC99D\uB418\uC9C0 \uC54A\uC558\uAC70\uB098 \uC99D\uAC70\uAC00 \uC5C6\uB294 \uCDE8\uC57D\uC810\uC740 \uBCF4\uACE0\uC11C\uC5D0 \uBC18\uC601\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. redteam_http_evidence_add \uB85C \uBCF4\uAC15\uD558\uC138\uC694"
          )
        )
      );
    }
    return h2("div", { key: "eviwrap" }, blocks);
  }
  function FindingsTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [sev, setSev] = import_react2.default.useState("");
    const [status, setStatus] = import_react2.default.useState("");
    const [q, setQ] = import_react2.default.useState("");
    const [qApplied, setQApplied] = import_react2.default.useState("");
    const [state, setState] = import_react2.default.useState({
      loading: false,
      error: null,
      total: 0,
      items: [],
      stats: null
    });
    const [creds, setCreds] = import_react2.default.useState([]);
    const [accesses, setAccesses] = import_react2.default.useState([]);
    const [files, setFiles] = import_react2.default.useState([]);
    const [openId, setOpenId] = import_react2.default.useState(null);
    const [msg, setMsg] = import_react2.default.useState(null);
    const [subTab, setSubTab] = import_react2.default.useState("vulns");
    const [grouped, setGrouped] = import_react2.default.useState(true);
    const collapse = useCollapse("findings:" + eng);
    const load = () => {
      if (!eng) return;
      api({
        op: "vulns",
        engagement: eng,
        severity: sev || void 0,
        status: status || void 0,
        q: qApplied || void 0,
        limit: 200
      }).then(
        (r) => {
          if (!r || r.ok === false) {
            setState({
              loading: false,
              error: r && r.error || "\uC870\uD68C \uC2E4\uD328",
              total: 0,
              items: [],
              stats: null
            });
            return;
          }
          setState({
            loading: false,
            error: null,
            total: r.total,
            items: r.items || [],
            stats: r.stats || null
          });
        },
        (e) => setState({
          loading: false,
          error: String(e && e.message || e),
          total: 0,
          items: [],
          stats: null
        })
      );
      api({ op: "credentials", engagement: eng }).then(
        (r) => setCreds(r && r.items || []),
        () => {
        }
      );
      api({ op: "access", engagement: eng }).then(
        (r) => setAccesses(r && r.items || []),
        () => {
        }
      );
      api({ op: "attackFiles", engagement: eng }).then(
        (r) => setFiles(r && r.items || []),
        () => {
        }
      );
    };
    import_react2.default.useEffect(load, [eng, sev, status, qApplied, refreshKey]);
    const setVulnStatus = (id, next) => {
      setMsg(null);
      api({
        op: "updateVuln",
        engagement: eng,
        id,
        patch: { status: next }
      }).then(
        (r) => {
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uAC31\uC2E0 \uC2E4\uD328" });
            return;
          }
          setMsg({
            ok: "\u201C" + (STATUS_LABEL[next] || next) + "\u201D(\uC73C)\uB85C \uAC31\uC2E0\uD588\uC2B5\uB2C8\uB2E4"
          });
          load();
        },
        (e) => setMsg({ err: String(e && e.message || e) })
      );
    };
    const stats = state.stats && state.stats.bySeverity ? state.stats : { bySeverity: {}, byStatus: {} };
    const needRestart = state.error !== null && String(state.error).indexOf("unknown op") >= 0;
    const allFiles = (files || []).flatMap(
      (g) => (g.files || []).map((f) => Object.assign({ target: g.target }, f))
    );
    const filesByVuln = /* @__PURE__ */ new Map();
    const orphanFiles = [];
    for (const f of allFiles) {
      const vid = f.vuln_id === null || f.vuln_id === void 0 ? null : Number(f.vuln_id);
      if (vid === null) {
        orphanFiles.push(f);
        continue;
      }
      if (!filesByVuln.has(vid)) filesByVuln.set(vid, []);
      filesByVuln.get(vid).push(f);
    }
    const concl = (key, label, value, active, onClick) => h2(
      "span",
      Object.assign(
        {
          key,
          className: "rt-concl-i" + (active ? " on" : ""),
          title: "\uD074\uB9AD\uD558\uBA74 \uD544\uD130 / \uB2E4\uC2DC \uD074\uB9AD\uD558\uBA74 \uD574\uC81C"
        },
        clickable(onClick, {
          label: "\u201C" + label + "\u201D\uB85C \uD544\uD130(" + (value || 0) + ")",
          expanded: active
        })
      ),
      h2("b", null, String(value || 0)),
      h2("span", null, label)
    );
    const conclusion = h2(
      "div",
      { className: "rt-concl" },
      concl(
        "conf",
        "\uD655\uC778\uB428",
        stats.byStatus.confirmed || 0,
        status === "confirmed",
        () => setStatus((v) => v === "confirmed" ? "" : "confirmed")
      ),
      concl(
        "exp",
        "\uC775\uC2A4\uD50C\uB85C\uC787 \uC644\uB8CC",
        stats.byStatus.exploited || 0,
        status === "exploited",
        () => setStatus((v) => v === "exploited" ? "" : "exploited")
      ),
      concl(
        "crit",
        "\uCE58\uBA85",
        stats.bySeverity.critical || 0,
        sev === "critical",
        () => setSev((v) => v === "critical" ? "" : "critical")
      ),
      concl(
        "high",
        "\uB192\uC74C",
        stats.bySeverity.high || 0,
        sev === "high",
        () => setSev((v) => v === "high" ? "" : "high")
      ),
      concl(
        "med",
        "\uBCF4\uD1B5",
        stats.bySeverity.medium || 0,
        sev === "medium",
        () => setSev((v) => v === "medium" ? "" : "medium")
      ),
      concl("gain", "\uAD8C\uD55C \uD68D\uB4DD", stats.withGained || 0, false, () => {
      }),
      h2("div", { className: "rt-spacer" }),
      h2(
        "span",
        { style: { fontSize: 11, color: "var(--dsw-alias-label-secondary)" } },
        "\uAE30\uBCF8\uC740 \uB300\uC0C1\uBCC4 \uC9D1\uACC4 \xB7 \uCD1D " + (stats.targetGroups || 0) + "\uAC1C \uB300\uC0C1"
      )
    );
    const head = h2(
      "div",
      { className: "rt-vrow head" },
      h2("span", null, "\uB4F1\uAE09"),
      h2("span", null, "\uCDE8\uC57D\uC810 / \uBC88\uD638"),
      h2("span", null, "\uB300\uC0C1"),
      h2("span", null, "\uD68D\uB4DD\uD55C \uAC83"),
      h2("span", null, "\uC0C1\uD0DC"),
      h2("span", null, "\uC2E0\uB8B0\uB3C4")
    );
    const vulnRows = (v, compact) => {
      const out = [];
      const gainedList = String(v.gained || "").split(/[,\u3001;\uFF0C\uFF1B]/).map((x) => x.trim()).filter(Boolean);
      const open = openId === v.id;
      out.push(
        h2(
          "div",
          {
            key: "v" + v.id,
            className: "rt-vrow",
            role: "button",
            tabIndex: 0,
            style: compact ? {
              cursor: "pointer",
              gridTemplateColumns: "58px minmax(0,1fr) 104px 68px"
            } : { cursor: "pointer" },
            onClick: () => setOpenId(open ? null : v.id),
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenId(open ? null : v.id);
              }
            }
          },
          h2(
            "span",
            null,
            h2(
              "span",
              { className: sevClass(v.severity) },
              SEV_LABEL[v.severity] || v.severity
            )
          ),
          h2(
            "span",
            { title: v.title || "" },
            h2("span", { className: "rt-sec-caret" }, open ? "\u25BE" : "\u25B8"),
            (v.cve ? v.cve + " " : "") + (v.title || "")
          ),
          compact ? null : h2(
            "span",
            { className: "rt-mono", title: v.target || "" },
            v.target || v.asset_ip || "\u2014"
          ),
          h2(
            "span",
            { title: v.gained || "" },
            gainedList.length ? h2(
              "span",
              {
                className: "rt-gain",
                style: {
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block"
                }
              },
              gainedList[0] + (gainedList.length > 1 ? " +" + (gainedList.length - 1) : "")
            ) : h2(
              "span",
              { style: { color: "var(--dsw-alias-label-secondary)" } },
              "\u2014"
            )
          ),
          h2(
            "span",
            null,
            h2(
              "span",
              { className: "rt-tag" },
              STATUS_LABEL[v.status] || v.status
            )
          ),
          compact ? null : h2(
            "span",
            null,
            v.confidence === null || v.confidence === void 0 ? "\u2014" : Math.round(v.confidence * 100) + "%"
          )
        )
      );
      if (openId !== v.id) return out;
      out.push(
        h2(
          "div",
          {
            key: "vd" + v.id,
            className: "rt-vrow",
            style: { cursor: "default", gridTemplateColumns: "1fr" }
          },
          h2(
            "div",
            { className: "rt-vdetail" },
            h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uD68D\uB4DD\uD55C \uAC83"),
              gainedList.length ? h2(
                "span",
                null,
                gainedList.map(
                  (g, gi) => h2(
                    "span",
                    {
                      key: "g" + gi,
                      className: "rt-gain",
                      style: { marginRight: 6 }
                    },
                    g
                  )
                )
              ) : h2(
                "span",
                { style: { color: "var(--dsw-alias-label-secondary)" } },
                "\uBBF8\uAE30\uB85D \u2014 \uAD8C\uD55C/\uC131\uACFC\uB97C \uC5BB\uC73C\uBA74 redteam_vuln_update \uB85C gained \uB97C \uBCF4\uAC15\uD558\uC138\uC694(\uC608: \uC11C\uBC84 \uAD8C\uD55C, \uB0B4\uBD80\uB9DD \uD130\uB110, \uBC31\uC5D4\uB4DC \uAD00\uB9AC\uC790 \uACC4\uC815)"
              )
            ),
            h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uB300\uC0C1"),
              h2(
                "span",
                { className: "rt-mono", style: { wordBreak: "break-all" } },
                v.target || "\u2014"
              )
            ),
            h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uC790\uC0B0"),
              h2(
                "span",
                null,
                (v.asset_ip || "\u2014") + " \xB7 " + (v.segment_cidr || "")
              )
            ),
            h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uCD9C\uCC98"),
              h2(
                "span",
                null,
                (v.source || "\u2014") + " \xB7 " + (v.found_by_agent || "\u2014") + " \xB7 " + fmt(v.found_at)
              )
            ),
            detailEvidence(v),
            (() => {
              const mine = filesByVuln.get(Number(v.id)) || [];
              return h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uACF5\uACA9 \uD30C\uC77C"),
                mine.length ? h2(
                  "span",
                  null,
                  mine.map(
                    (f, fi) => h2(
                      "div",
                      { key: "af" + fi, style: { marginBottom: 3 } },
                      "\xB7 " + (f.kind ? "[" + f.kind + "] " : "") + (f.name || "(\uC774\uB984 \uC5C6\uC74C)") + (f.description ? " \u2014 " + f.description : ""),
                      h2(
                        "div",
                        {
                          className: "rt-mono",
                          style: {
                            fontSize: 11,
                            marginLeft: 12,
                            color: "var(--dsw-alias-label-secondary)",
                            overflowWrap: "anywhere"
                          }
                        },
                        f.path || ""
                      )
                    )
                  )
                ) : h2(
                  "span",
                  { style: { color: "var(--dsw-alias-label-secondary)" } },
                  "(\uC5C6\uC74C) redteam_attack_file_add \uB85C \uC774 \uCDE8\uC57D\uC810\uC744 \uB6AB\uC740 \uC2A4\uD06C\uB9BD\uD2B8/\uC6F9\uC178/EXP \uB97C vuln_id \uC640 \uD568\uAED8 \uC544\uCE74\uC774\uBE0C\uD558\uC138\uC694"
                )
              );
            })(),
            h2(
              "div",
              { className: "rt-actions" },
              h2(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "confirmed");
                  }
                },
                "\uD655\uC778"
              ),
              h2(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "exploited");
                  }
                },
                "\uC775\uC2A4\uD50C\uB85C\uC787 \uC644\uB8CC"
              ),
              h2(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "false-positive");
                  }
                },
                "\uC624\uD0D0"
              ),
              h2(
                "button",
                {
                  className: "rt-btn",
                  onClick: (e) => {
                    e.stopPropagation();
                    setVulnStatus(v.id, "fixed");
                  }
                },
                "\uC218\uC815\uB428"
              )
            )
          )
        )
      );
      return out;
    };
    const rows = [];
    if (grouped) {
      const groups = /* @__PURE__ */ new Map();
      for (const v of state.items) {
        const key = targetKeyOf(v);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(v);
      }
      const SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      const list = Array.from(groups.entries()).map(([key, vs]) => ({
        key,
        vulns: vs,
        top: vs.slice().sort(
          (a, b) => (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9)
        )[0],
        gained: Array.from(
          new Set(
            vs.flatMap(
              (v) => String(v.gained || "").split(/[,\u3001;\uFF0C\uFF1B]/).map((x) => x.trim()).filter(Boolean)
            )
          )
        ),
        exploited: vs.filter((v) => v.status === "exploited").length
      })).sort(
        (a, b) => (SEV_RANK[a.top.severity] ?? 9) - (SEV_RANK[b.top.severity] ?? 9) || b.vulns.length - a.vulns.length
      );
      for (const g of list) {
        const key = "target:" + g.key;
        const defOpen = false;
        rows.push(
          h2(
            Section,
            {
              key: "sec:" + g.key,
              tone: "target",
              title: g.key,
              count: g.vulns.length + "\uAC1C \uCDE8\uC57D\uC810",
              sub: [
                SEV_LABEL[g.top.severity] || g.top.severity,
                g.exploited ? "\uC775\uC2A4\uD50C\uB85C\uC787 \uC644\uB8CC " + g.exploited : null,
                g.top.asset_ip && g.top.asset_ip !== g.key ? "\uC790\uC0B0 " + g.top.asset_ip : null
              ].filter(Boolean).join(" \xB7 "),
              right: g.gained.length ? g.gained.slice(0, 2).join(" / ") + (g.gained.length > 2 ? " +" + (g.gained.length - 2) : "") : "\uAD8C\uD55C \uBBF8\uAE30\uB85D",
              open: collapse.isOpen(key, defOpen),
              onToggle: collapse.toggle(key, defOpen)
            },
            g.vulns.map((v) => vulnRows(v, true))
          )
        );
      }
      if (!list.length && !state.loading && !state.error) {
        rows.push(
          h2("div", { key: "none", className: "rt-empty" }, "\uCDE8\uC57D\uC810 \uAE30\uB85D \uC5C6\uC74C")
        );
      }
    } else {
      for (const v of state.items) rows.push(...vulnRows(v));
    }
    const toolbar = h2(
      "div",
      { className: "rt-toolbar" },
      h2("input", {
        className: "rt-input",
        style: { flex: "1 1 140px" },
        placeholder: "\uC81C\uBAA9 / CVE / \uB300\uC0C1 \uAC80\uC0C9(Enter)",
        value: q,
        onChange: (e) => setQ(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") setQApplied(q);
        }
      }),
      h2(
        "button",
        { className: "rt-btn", onClick: () => setQApplied(q) },
        "\uAC80\uC0C9"
      ),
      h2(
        "select",
        {
          className: "rt-input",
          value: sev,
          onChange: (e) => setSev(e.target.value)
        },
        h2("option", { value: "" }, "\uBAA8\uB4E0 \uB4F1\uAE09"),
        h2("option", { value: "critical" }, "\uCE58\uBA85"),
        h2("option", { value: "high" }, "\uB192\uC74C"),
        h2("option", { value: "medium" }, "\uBCF4\uD1B5"),
        h2("option", { value: "low" }, "\uB0AE\uC74C"),
        h2("option", { value: "info" }, "\uC815\uBCF4")
      ),
      h2(
        "select",
        {
          className: "rt-input",
          value: status,
          onChange: (e) => setStatus(e.target.value)
        },
        h2("option", { value: "" }, "\uBAA8\uB4E0 \uC0C1\uD0DC"),
        h2("option", { value: "candidate" }, "\uAC80\uC99D \uB300\uAE30"),
        h2("option", { value: "confirmed" }, "\uD655\uC778\uB428"),
        h2("option", { value: "exploited" }, "\uC775\uC2A4\uD50C\uB85C\uC787 \uC644\uB8CC"),
        h2("option", { value: "false-positive" }, "\uC624\uD0D0"),
        h2("option", { value: "fixed" }, "\uC218\uC815\uB428")
      )
    );
    const credSection = h2(
      "div",
      null,
      h2(
        "div",
        { className: "rt-section" },
        "\uC790\uACA9 \uC99D\uBA85 \xB7 " + creds.length + (creds.length ? "(\uD3C9\uBB38 \uADF8\uB300\uB85C \uD45C\uC2DC \u2014 \uD654\uBA74 \uACF5\uC720\xB7\uB179\uD654\uC5D0 \uC8FC\uC758)" : "")
      ),
      creds.length ? h2(
        "div",
        { style: { padding: "4px 10px 0" } },
        creds.map(
          (c) => h2(
            "div",
            { key: "c" + c.id, className: "rt-cred" },
            h2(
              "div",
              { className: "rt-cred-head" },
              h2("span", { className: "rt-cred-host" }, c.host),
              c.username ? h2("span", { className: "rt-tag" }, c.username) : null,
              h2(
                "span",
                { className: "rt-tag rt-tag-passive" },
                c.secret_type || "password"
              ),
              c.privilege ? h2(
                "span",
                { className: "rt-tag rt-tag-active" },
                c.privilege
              ) : null,
              h2("div", { className: "rt-spacer" }),
              h2(
                "button",
                {
                  className: "rt-btn",
                  style: { padding: "0 6px", fontSize: 11 },
                  onClick: (e) => {
                    e.stopPropagation();
                    copyText(String(c.secret_value || ""));
                  }
                },
                "\uBCF5\uC0AC"
              )
            ),
            c.secret_value ? h2(
              "div",
              { className: "rt-secret", title: "\uD074\uB9AD\uD558\uBA74 \uC804\uCCB4 \uC120\uD0DD" },
              c.secret_value
            ) : h2(
              "div",
              { className: "rt-secret-none" },
              "\uD3C9\uBB38 \uBBF8\uAE30\uB85D \u2014 redteam_credential_add \uC758 secret_value \uB85C \uBCF4\uAC15\uD574\uC57C \uD328\uB110\uC5D0 \uBC14\uB85C \uD45C\uC2DC\uB429\uB2C8\uB2E4"
            ),
            h2(
              "div",
              { className: "rt-cred-meta" },
              [
                c.source ? "\uCD9C\uCC98 " + c.source : null,
                c.tool ? "\uB3C4\uAD6C " + c.tool : null,
                c.secret_ref ? "\uC99D\uAC70 " + c.secret_ref : null,
                c.found_by_agent ? "by " + c.found_by_agent : null,
                c.found_at ? fmt(c.found_at) : null
              ].filter(Boolean).join(" \xB7 ")
            ),
            c.note ? h2("div", { className: "rt-cred-meta" }, "\uBE44\uACE0: " + c.note) : null
          )
        )
      ) : h2(
        "div",
        { className: "rt-empty" },
        "\uC790\uACA9 \uC99D\uBA85 \uC5C6\uC74C(\uD328\uC2A4\uC6CC\uB4DC/\uD0A4/Hash \uB97C \uC5BB\uC740 \uB4A4 redteam_credential_add \uB85C \uC800\uC7A5\uD558\uBA74 \uC989\uC2DC \uC7AC\uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4)"
      )
    );
    const accessSection = h2(
      "div",
      null,
      h2(
        "div",
        { className: "rt-section" },
        "\uD68D\uB4DD\uD55C \uC811\uADFC \uC138\uC158 \xB7 " + accesses.length
      ),
      accesses.length ? accesses.map(
        (a) => h2(
          "div",
          {
            key: "a" + a.id,
            className: "rt-vrow",
            style: {
              cursor: "default",
              gridTemplateColumns: "1fr 110px 80px 80px 1fr"
            }
          },
          h2("span", { className: "rt-mono" }, a.host),
          h2("span", null, a.username || "\u2014"),
          h2(
            "span",
            null,
            h2(
              "span",
              { className: "rt-tag rt-tag-active" },
              a.method || "\u2014"
            )
          ),
          h2("span", null, a.privilege || "\u2014"),
          h2(
            "span",
            { className: "rt-mono", title: a.session_ref || "" },
            a.session_ref || "\u2014"
          )
        )
      ) : h2("div", { className: "rt-empty" }, "\uC5C6\uC74C")
    );
    const subTabBtn = (key, label, n) => h2(
      "span",
      Object.assign(
        {
          className: "rt-subtab" + (subTab === key ? " on" : "")
        },
        clickable(() => setSubTab(key), {
          label: label + "(" + n + ")",
          expanded: subTab === key
        })
      ),
      label + " " + n
    );
    return h2(
      "div",
      { className: "rt-main" },
      toolbar,
      conclusion,
      h2(
        "div",
        { className: "rt-subtabs" },
        subTabBtn("vulns", "\uCDE8\uC57D\uC810", state.total || 0),
        subTabBtn("files", "\uACF5\uACA9 \uD30C\uC77C", allFiles.length),
        subTabBtn("creds", "\uC790\uACA9 \uC99D\uBA85", creds.length),
        subTabBtn("access", "\uC811\uADFC \uC138\uC158", accesses.length),
        h2("div", { className: "rt-spacer" }),
        grouped ? h2(
          "button",
          {
            className: "rt-btn",
            title: "\uBAA8\uB4E0 \uB300\uC0C1 \uD3BC\uCE58\uAE30",
            onClick: () => collapse.setAll(
              (state.items || []).map((v) => "target:" + targetKeyOf(v)),
              true
            )
          },
          "\uC804\uCCB4 \uD3BC\uCE58\uAE30"
        ) : null,
        grouped ? h2(
          "button",
          {
            className: "rt-btn",
            title: "\uBAA8\uB4E0 \uB300\uC0C1 \uC811\uAE30",
            onClick: () => collapse.setAll(
              (state.items || []).map((v) => "target:" + targetKeyOf(v)),
              false
            )
          },
          "\uC804\uCCB4 \uC811\uAE30"
        ) : null,
        h2(
          "button",
          {
            className: "rt-btn" + (grouped ? " rt-btn-primary" : ""),
            title: grouped ? "\uD604\uC7AC: \uB300\uC0C1\uBCC4 \uC9D1\uACC4(\uC5B4\uB290 \uC790\uC0B0\uC774 \uC5B4\uB5BB\uAC8C \uB6AB\uB838\uB294\uC9C0 \uBA3C\uC800 \uBD05\uB2C8\uB2E4)" : "\uD604\uC7AC: \uCDE8\uC57D\uC810 \uD55C \uC904\uC529 \uB098\uC5F4",
            onClick: () => setGrouped((g) => !g)
          },
          grouped ? "\uB300\uC0C1\uBCC4 \uC9D1\uACC4" : "\uAC1C\uBCC4 \uB098\uC5F4"
        )
      ),
      msg ? h2(
        "div",
        { className: msg.err ? "rt-err" : "rt-foot" },
        msg.err || msg.ok
      ) : null,
      needRestart ? h2(
        "div",
        { className: "rt-empty" },
        "\uC774 \uBAA8\uB4C8\uC758 \uD638\uC2A4\uD2B8 \uCF54\uB4DC\uAC00 \uAC31\uC2E0\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uD638\uC2A4\uD2B8(\uACF5\uC2DD exe / \uCEE4\uBBA4\uB2C8\uD2F0\uD310 / dsh web)\uB97C \uD55C \uBC88 \uC7AC\uC2DC\uC791\uD574\uC57C \uC801\uC6A9\uB429\uB2C8\uB2E4"
      ) : null,
      state.error && !needRestart ? h2("div", { className: "rt-err" }, state.error) : null,
      subTab === "files" ? h2(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        h2(
          "div",
          { className: "rt-hint", style: { marginBottom: 8 } },
          "\uACF5\uACA9 \uD30C\uC77C\uC740 \uD0C0\uAE43 \uB514\uB809\uD130\uB9AC \uB2E8\uC704\uB85C \uC815\uB9AC\uB429\uB2C8\uB2E4(\uC61B \u201C\uACF5\uACA9 \uD30C\uC77C\u201D \uD0ED). \uAC01 \uCDE8\uC57D\uC810\uC5D0 \uC5F0\uACB0\uB41C \uD30C\uC77C\uB3C4 \uD574\uB2F9 \uCDE8\uC57D\uC810 \uC0C1\uC138\uC5D0\uC11C \uBC14\uB85C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4." + (orphanFiles.length ? " \uD604\uC7AC vuln_id \uAC00 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC740 \uD30C\uC77C\uC774 " + orphanFiles.length + "\uAC1C \uC788\uC73C\uB2C8 \uCDE8\uC57D\uC810\uACFC \uB300\uC751\uB418\uB3C4\uB85D \uBCF4\uAC15\uC744 \uAD8C\uD569\uB2C8\uB2E4." : "")
        ),
        h2(AttackFilesTab, { engagement: eng, refreshKey })
      ) : subTab === "creds" ? h2(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        credSection
      ) : subTab === "access" ? h2(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        accessSection
      ) : h2(
        "div",
        { className: "rt-table" },
        grouped ? null : head,
        rows,
        !state.loading && !state.items.length && !state.error ? h2("div", { className: "rt-empty" }, "\uCDE8\uC57D\uC810 \uAE30\uB85D \uC5C6\uC74C") : null
      )
    );
  }
  const STAGE_LABEL = {
    recon: "\uC815\uBCF4 \uC218\uC9D1",
    vuln: "\uCDE8\uC57D\uC810 \uBC1C\uACAC",
    exploit: "\uCDE8\uC57D\uC810 \uC775\uC2A4\uD50C\uB85C\uC787",
    access: "\uAD8C\uD55C \uD68D\uB4DD",
    pivot: "\uB0B4\uBD80\uB9DD \uB3CC\uD30C",
    data: "\uBBFC\uAC10 \uB370\uC774\uD130",
    other: "\uAE30\uD0C0"
  };
  function ChainTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [loading, setLoading] = import_react2.default.useState(false);
    const [view, setView] = import_react2.default.useState("A");
    const [openId, setOpenId] = import_react2.default.useState(null);
    const load = () => {
      if (!eng) return;
      setLoading(true);
      api({ op: "scoreChain", engagement: eng }).then(
        (r) => {
          setLoading(false);
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => {
          setLoading(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    import_react2.default.useEffect(load, [eng, refreshKey]);
    const stages = data && data.stages || [];
    const summary = data && data.summary || null;
    const toggle = (id) => setOpenId((cur) => cur === id ? null : id);
    const CIRCLED = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464", "\u2465"];
    const hitDetail = (x) => h2(
      "div",
      { className: "rt-flow-detail" },
      h2(
        "div",
        { className: "rt-kv" },
        h2("b", null, "\uB300\uC0C1"),
        h2(
          "span",
          { className: "rt-mono", style: { wordBreak: "break-all" } },
          x.target || "\u2014"
        )
      ),
      x.asset_ip ? h2(
        "div",
        { className: "rt-kv" },
        h2("b", null, "\uC790\uC0B0"),
        h2("span", { className: "rt-mono" }, x.asset_ip)
      ) : null,
      x.vuln_title ? h2(
        "div",
        { className: "rt-kv" },
        h2("b", null, "\uC774\uC6A9 \uCDE8\uC57D\uC810"),
        h2(
          "span",
          null,
          [x.vuln_cve, x.vuln_title].filter(Boolean).join(" ")
        )
      ) : null,
      h2(
        "div",
        { className: "rt-kv" },
        h2("b", null, "\uD69F\uC218"),
        h2(
          "span",
          null,
          "\uAC19\uC740 \uC720\uD615 " + x.nth_of_point + "\uBC88\uC9F8 \xB7 +" + (x.points || 0) + "\uC810"
        )
      ),
      h2(
        "div",
        { className: "rt-kv" },
        h2("b", null, "\uAE30\uB85D"),
        h2(
          "span",
          null,
          fmt(x.recorded_at) + (x.recorded_by ? " \xB7 " + x.recorded_by : "")
        )
      ),
      x.evidence ? h2(Clip, { label: "\uACB0\uACFC\uC640 \uC99D\uAC70", text: x.evidence }) : null
    );
    const hitRow = (x) => h2(
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
        }
      },
      h2(
        "div",
        { className: "rt-ap-hit-head" },
        h2(
          "span",
          {
            className: "rt-ap-pts" + (x.counted ? "" : " uncounted"),
            title: x.capped_reason || void 0
          },
          "+" + (x.counted ? x.points || 0 : 0)
        ),
        h2("span", { className: "rt-ap-hit-name" }, x.point_name),
        x.capped ? h2(
          "span",
          {
            className: "rt-tag rt-tag-warn",
            title: x.capped_reason || "\uAC19\uC740 \uC790\uC0B0\xB7\uAC19\uC740 \uD3EC\uD2B8\uC5D0\uC11C\uB294 \uC810\uC218\uAC00 \uAC00\uC7A5 \uB192\uC740 \uD55C \uAC74\uB9CC \uC778\uC815\uD569\uB2C8\uB2E4"
          },
          "\uC11C\uBE44\uC2A4 \uC0C1\uD55C \uB3C4\uB2EC \xB7 \uBBF8\uC9D1\uACC4"
        ) : null,
        x.nth_of_point > 1 ? h2(
          "span",
          { className: "rt-ap-nth" },
          "\uAC19\uC740 \uC720\uD615 " + x.nth_of_point + "\uBC88\uC9F8"
        ) : null,
        h2(
          "span",
          { className: "rt-ap-hit-target" },
          x.target || x.asset_ip || "\u2014"
        )
      ),
      x.action ? h2(
        "div",
        {
          className: "rt-ap-act" + (x.action_inferred ? " inferred" : "")
        },
        "\uB3D9\uC791: " + (x.action.title || "(\uC774\uB984 \uC5C6\uB294 \uB2E8\uACC4)") + (x.action_inferred ? "(\uCD94\uB860)" : "")
      ) : null,
      openId === x.id ? hitDetail(x) : null
    );
    const assetRow = (a) => h2(
      "div",
      { key: "a" + a.id, className: "rt-ap-asset" },
      h2(
        "span",
        {
          className: "rt-scope rt-scope-" + (a.scope === "internal" ? "internal" : "external")
        },
        a.scope === "internal" ? "\uB0B4" : "\uC678"
      ),
      h2("span", { className: "rt-mono", style: { fontWeight: 600 } }, a.ip),
      a.segment_cidr ? h2("span", { className: "rt-ap-nth" }, a.segment_cidr) : null,
      h2("span", { className: "rt-ap-nth" }, "\uD3EC\uD2B8 " + (a.open_ports || 0)),
      a.vulns ? h2("span", { className: "rt-ap-nth" }, "\uCDE8\uC57D\uC810 " + a.vulns) : null,
      a.priority ? h2("span", { className: "rt-tag" }, "\uACF5\uB7B5 " + a.priority) : null,
      h2("div", { className: "rt-spacer" }),
      h2("span", { className: "rt-ap-pts" }, "+" + (a.points || 0) + "\uC810"),
      h2("span", { className: "rt-ap-nth" }, (a.hits || 0) + "\uD68C")
    );
    const stageA = (st, i) => {
      const isRecon = st.code === "recon";
      const body = [];
      if (isRecon) {
        body.push(
          h2(
            "div",
            { key: "at", className: "rt-ap-sub" },
            "\uC810\uC218\uB97C \uB0B8 \uC790\uC0B0 \xB7 " + st.assetCount + "\uB300"
          )
        );
        body.push(
          h2(
            "div",
            { key: "al", className: "rt-ap-assets" },
            st.assets.length ? st.assets.map(assetRow) : h2(
              "div",
              { className: "rt-ap-none" },
              "\uC544\uC9C1 \uC810\uC218\uB97C \uB0B8 \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"
            )
          )
        );
      } else {
        body.push(
          h2(
            "div",
            { key: "ht", className: "rt-ap-sub" },
            "\uC774 \uB2E8\uACC4 \uC801\uC911 " + st.hits + "\uD68C" + (st.points ? " \xB7 +" + st.points + "\uC810" : "")
          )
        );
        body.push(
          h2(
            "div",
            { key: "hl", className: "rt-ap-hits" },
            st.items.length ? st.items.map(hitRow) : h2(
              "div",
              { className: "rt-ap-none" },
              "\uC774 \uB2E8\uACC4\uB294 \uC544\uC9C1 \uB4DD\uC810\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"
            )
          )
        );
        if (st.code === "boundary") {
          const selfOnly = (st.tunnels_self_only || []).length;
          body.push(
            h2(
              "div",
              { key: "tt", className: "rt-ap-sub" },
              "\uD0C0\uAE43 \uACBD\uACC4\uB97C \uB118\uC740 \uD1B5\uB85C \xB7 " + st.tunnels.length + "\uAC1C" + (selfOnly ? "(\uADF8 \uBC16\uC5D0 " + selfOnly + "\uAC1C\uB294 \uB0B4 VPS/\uC790\uCCB4 \uC11C\uBC84\uC5D0\uB9CC \uC788\uC5B4 \uB3CC\uD30C\uB85C \uBCF4\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4)" : "")
            )
          );
          if (selfOnly && st.tunnels.length === 0) {
            body.push(
              h2(
                "div",
                { key: "tw", className: "rt-ap-none" },
                "\u26A0\uFE0F \uD604\uC7AC \uD1B5\uB85C\uAC00 \uBAA8\uB450 \uB0B4 \uC11C\uBC84\uC5D0\uB9CC \uC788\uC5B4 \uB300\uC0C1\uC5D0 \uB2FF\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4 \u2014 \uACBD\uACC4 \uB3CC\uD30C\uB85C \uC9D1\uACC4\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB300\uC0C1 \uCE21\uC5D0\uC11C \uC2DC\uC791\uB418\uB294 \uD1B5\uB85C\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4(\uB0B4 \uCABD\uC73C\uB85C \uB9AC\uBC84\uC2A4 \uC178 / \uB300\uC0C1\uC5D0\uC11C frp \uD074\uB77C\uC774\uC5B8\uD2B8 \uC2E4\uD589 / \uB300\uC0C1 WebShell \uC744 \uACBD\uC720\uD55C suo5)."
              )
            );
          }
          body.push(
            h2(
              "div",
              { key: "tl", className: "rt-ap-tunnels" },
              st.tunnels.length ? st.tunnels.map(
                (t) => h2(
                  "div",
                  { key: "t" + t.id, className: "rt-ap-tunnel" },
                  h2(
                    "span",
                    { className: "rt-tag rt-tag-passive" },
                    t.kind || "tunnel"
                  ),
                  h2(
                    "span",
                    { className: "rt-mono", style: { fontWeight: 600 } },
                    t.listen || "\u2014"
                  ),
                  h2(
                    "span",
                    {
                      className: "rt-tag " + (t.status === "active" ? "rt-tag-live" : ""),
                      style: t.status === "active" ? {} : { opacity: 0.7 }
                    },
                    t.status === "active" ? "\uC0AC\uC6A9 \uAC00\uB2A5" : t.status || "\uC54C \uC218 \uC5C6\uC74C"
                  ),
                  h2(
                    "span",
                    {
                      className: "rt-ap-nth",
                      style: {
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }
                    },
                    "\uB3C4\uB2EC " + (t.reach || "\u2014")
                  )
                )
              ) : h2(
                "div",
                { className: "rt-ap-none" },
                "\uC544\uC9C1 \uD130\uB110\uC774 \uC5C6\uC2B5\uB2C8\uB2E4(\uAD6C\uCD95\uD55C \uB4A4 redteam_tunnel_add \uB85C \uB4F1\uB85D\uD558\uC138\uC694)"
              )
            )
          );
        }
        if (st.assets.length && st.code !== "boundary") {
          body.push(
            h2(
              "div",
              { key: "at", className: "rt-ap-sub" },
              "\uAD00\uB828 \uC790\uC0B0 \xB7 " + st.assetCount + "\uB300"
            )
          );
          body.push(
            h2(
              "div",
              { key: "al", className: "rt-ap-assets" },
              st.assets.map(assetRow)
            )
          );
        }
      }
      return h2(
        "div",
        { key: "st" + st.code, className: "rt-ap-stage" },
        h2(
          "div",
          { className: "rt-ap-head", style: { borderLeftColor: st.color } },
          h2(
            "span",
            { className: "rt-ap-no", style: { background: st.color } },
            CIRCLED[i] || "0" + (i + 1)
          ),
          h2("span", { className: "rt-ap-name" }, st.name),
          st.subtitle ? h2("span", { className: "rt-ap-en" }, st.subtitle) : null,
          h2("div", { className: "rt-spacer" }),
          st.points > 0 ? h2(
            "span",
            {
              className: "rt-ap-pts",
              style: {
                background: st.color + "22",
                color: st.color,
                borderColor: st.color + "66"
              }
            },
            "+" + st.points
          ) : null,
          h2("span", { className: "rt-ap-cum" }, "\uB204\uC801 " + st.cumulative + "\uC810")
        ),
        h2(
          "div",
          { className: "rt-ap-goal", style: { borderLeftColor: st.color } },
          h2(
            "span",
            {
              className: "rt-ap-goal-tag",
              style: { color: st.color, borderColor: st.color + "66" }
            },
            "\uB2E8\uACC4 \uBAA9\uD45C"
          ),
          h2("span", null, st.goal)
        ),
        h2(
          "div",
          { className: "rt-ap-result", style: { borderLeftColor: st.color } },
          body
        ),
        i < stages.length - 1 ? h2(
          "div",
          { className: "rt-ap-trans" },
          h2("span", { className: "rt-flow-arrow" }, "\u25BC"),
          st.transition ? h2("span", { className: "rt-ap-trans-t" }, st.transition) : null,
          h2(
            "span",
            { className: "rt-ap-trans-t", style: { marginLeft: "auto" } },
            "\uB204\uC801 " + st.cumulative + "\uC810"
          )
        ) : h2(
          "div",
          { className: "rt-ap-trans" },
          h2("span", { className: "rt-flow-arrow" }, "\u25BC"),
          h2(
            "span",
            { className: "rt-ap-trans-t" },
            "\uD569\uACC4 " + (summary && summary.points || 0) + "\uC810"
          )
        )
      );
    };
    const stageB = (st, i) => h2(
      "div",
      { key: "c" + st.code, className: "rt-ap-col" },
      i > 0 ? h2("span", { className: "rt-ap-col-arrow" }, "\u25B6") : null,
      h2(
        "div",
        { className: "rt-hcol", style: { borderTopColor: st.color } },
        h2(
          "div",
          {
            className: "rt-ap-head",
            style: { borderLeftColor: st.color, padding: "5px 8px" }
          },
          h2(
            "span",
            {
              className: "rt-ap-no",
              style: {
                background: st.color,
                width: 16,
                height: 16,
                fontSize: 10
              }
            },
            String(i + 1)
          ),
          h2(
            "span",
            { className: "rt-ap-name", style: { fontSize: 12 } },
            st.name
          ),
          h2("div", { className: "rt-spacer" }),
          h2(
            "span",
            { className: "rt-ap-cum", style: { fontWeight: 700 } },
            st.cumulative
          )
        ),
        h2("div", { className: "rt-hcol-goal", title: st.goal }, st.goal),
        h2(
          "div",
          { className: "rt-hcol-body" },
          st.code === "boundary" ? h2(
            "div",
            null,
            h2(
              "div",
              { className: "rt-hcol-hit" },
              h2("span", { className: "rt-hcol-pts" }, "+" + st.points),
              h2(
                "span",
                { className: "rt-hcol-name" },
                "\uD130\uB110 " + st.tunnels.length + "\uAC1C"
              )
            ),
            st.tunnels.slice(0, 3).map(
              (t) => h2(
                "div",
                { key: "t" + t.id, className: "rt-hcol-sub" },
                "\u25B8 " + (t.kind || "") + " " + (t.listen || "")
              )
            )
          ) : st.code === "recon" ? h2(
            "div",
            null,
            h2(
              "div",
              { className: "rt-hcol-hit" },
              h2("span", { className: "rt-hcol-pts" }, st.assetCount),
              h2(
                "span",
                { className: "rt-hcol-name" },
                "\uB300 \uC790\uC0B0\uC774 \uB4DD\uC810"
              )
            ),
            st.assets.slice(0, 6).map(
              (a) => h2(
                "div",
                {
                  key: "a" + a.id,
                  className: "rt-hcol-sub",
                  title: a.ip + "  +" + a.points + "\uC810"
                },
                (a.scope === "internal" ? "\uB0B4 " : "\uC678 ") + a.ip + "  +" + a.points
              )
            )
          ) : h2(
            "div",
            null,
            h2(
              "div",
              { className: "rt-hcol-hit" },
              h2("span", { className: "rt-hcol-pts" }, "+" + st.points),
              h2(
                "span",
                { className: "rt-hcol-name" },
                st.hits + "\uD68C \uC801\uC911"
              )
            ),
            st.items.slice(0, 6).map(
              (x) => h2(
                "div",
                {
                  key: "c" + x.id,
                  className: "rt-hcol-sub",
                  title: x.point_name + "  " + (x.target || "")
                },
                h2("span", { className: "rt-hcol-pts" }, "+" + x.points),
                h2("span", { className: "rt-hcol-name" }, x.point_name)
              )
            ),
            st.items.length > 6 ? h2(
              "div",
              { className: "rt-hcol-none" },
              "\u2026\uADF8 \uBC16\uC5D0 " + (st.items.length - 6) + "\uD68C"
            ) : null,
            st.assetCount ? h2(
              "div",
              { className: "rt-hcol-none" },
              "\uAD00\uB828 \uC790\uC0B0 " + st.assetCount + "\uB300"
            ) : null
          )
        )
      )
    );
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uACF5\uACA9 \uCCB4\uC778"),
        h2(
          "span",
          { className: "rt-tag", style: { fontSize: 10.5 } },
          "\uC815\uBCF4 \uC218\uC9D1 \u2192 \uC778\uD130\uB137 \uC790\uC0B0 \uAD8C\uD55C \u2192 \uACBD\uACC4 \uB3CC\uD30C \u2192 \uB0B4\uBD80\uB9DD \uC790\uC0B0 \uAD8C\uD55C \u2192 \uD0C0\uAE43 \uAD8C\uD55C"
        ),
        summary ? h2(
          "span",
          { className: "rt-tag rt-tag-live" },
          "\uCD1D\uC810 " + summary.points + "\uC810"
        ) : null,
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          {
            className: "rt-btn" + (view === "A" ? " rt-btn-primary" : ""),
            title: "\uC138\uB85C \uACF5\uACA9 \uCCB4\uC778: \uB2E8\uACC4\uBCC4\uB85C \uB0B4\uB824\uAC00\uBA70 \uC0C1\uC138\uB97C \uBD05\uB2C8\uB2E4",
            onClick: () => setView("A")
          },
          "\uC0AC\uC2AC A"
        ),
        h2(
          "button",
          {
            className: "rt-btn" + (view === "B" ? " rt-btn-primary" : ""),
            title: "\uAC00\uB85C \uACF5\uACA9 \uCCB4\uC778: \uB2E4\uC12F \uB2E8\uACC4\uB97C \uD55C \uD654\uBA74\uC5D0 \uBD05\uB2C8\uB2E4",
            onClick: () => setView("B")
          },
          "\uC0AC\uC2AC B"
        ),
        h2(
          "button",
          { className: "rt-btn", disabled: loading, onClick: load },
          loading ? "\uBD88\uB7EC\uC624\uB294 \uC911\u2026" : "\uC0C8\uB85C\uACE0\uCE68"
        )
      ),
      err ? h2("div", { className: "rt-err" }, err) : null,
      !stages.length && !err && data !== null ? h2(
        "div",
        { className: "rt-empty" },
        "\uC544\uC9C1 \uB4DD\uC810 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC131\uACFC\uB97C \uC5BB\uC740 \uB4A4 redteam_score_hit \uB85C \uC810\uC218\uB97C \uAE30\uB85D\uD558\uBA74 \uC774 \uC0AC\uC2AC\uC774 \uC790\uB77C\uB0A9\uB2C8\uB2E4."
      ) : view === "A" ? h2("div", { className: "rt-ap" }, stages.map(stageA)) : h2("div", { className: "rt-ap-h" }, stages.map(stageB))
    );
  }
  function groupByStage(reportItems, chain) {
    const byId = new Map((reportItems || []).map((x) => [x.id, x]));
    const groups = [];
    const stageList = chain && chain.stages || [];
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
        items
      });
    });
    const grouped = new Set(
      groups.reduce((acc, g) => acc.concat(g.items.map((x) => x.id)), [])
    );
    const rest = (reportItems || []).filter((x) => !grouped.has(x.id));
    if (rest.length > 0) {
      groups.push({
        code: "other",
        name: "\uAE30\uD0C0 \uB4DD\uC810",
        color: "#64748b",
        ordinal: groups.length + 1,
        points: rest.reduce((n, x) => n + (x.counted ? x.points : 0), 0),
        cumulative: 0,
        items: rest
      });
    }
    return groups;
  }
  function ReportTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const [msg, setMsg] = import_react2.default.useState(null);
    const collapse = useCollapse("report:" + eng);
    const load = () => {
      if (!eng) return;
      setBusy(true);
      setMsg(null);
      api({ op: "scoreReport", engagement: eng }).then(
        (r) => {
          if (!r || r.ok === false) {
            setBusy(false);
            setErr(r && r.error || "\uC0DD\uC131 \uC2E4\uD328");
            return;
          }
          if ((!r.stages || r.stages.length === 0) && (r.items || []).length > 0) {
            api({ op: "scoreChain", engagement: eng }).then(
              (c) => {
                setBusy(false);
                setErr(null);
                setData(
                  Object.assign({}, r, { stages: groupByStage(r.items, c) })
                );
              },
              () => {
                setBusy(false);
                setErr(null);
                setData(r);
              }
            );
            return;
          }
          setBusy(false);
          setErr(null);
          setData(r);
        },
        (e) => {
          setBusy(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    import_react2.default.useEffect(load, [eng, refreshKey]);
    const copy = (text, label) => copyWithFeedback(text, label, (okFlag, message) => {
      setMsg(okFlag ? { ok: message } : { err: message });
    });
    const download = (text, label) => {
      try {
        const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "report-" + String(label || "score").replace(/[^\w.\-]/g, "_") + ".md";
        a.click();
        setTimeout(() => {
          try {
            URL.revokeObjectURL(url);
          } catch {
          }
        }, 1e3);
        setMsg({ ok: "\uB2E4\uC6B4\uB85C\uB4DC\uB428: " + label });
      } catch (e) {
        setMsg({ err: "\uB2E4\uC6B4\uB85C\uB4DC \uC2E4\uD328: " + (e && e.message || e) });
      }
    };
    const items = data && data.items || [];
    const stages = data && data.stages || [];
    const summary = data && data.summary || null;
    const mdText = data && data.markdown || "";
    const CIRCLED = [
      "\u2460",
      "\u2461",
      "\u2462",
      "\u2463",
      "\u2464",
      "\u2465",
      "\u2466",
      "\u2467",
      "\u2468",
      "\u2469",
      "\u246A",
      "\u246B",
      "\u246C",
      "\u246D",
      "\u246E",
      "\u246F",
      "\u2470",
      "\u2471",
      "\u2472",
      "\u2473"
    ];
    const card = (x) => h2(
      "div",
      { key: "r" + x.id, className: "rt-rep" },
      h2(
        "div",
        { className: "rt-rep-head" },
        h2("span", { className: "rt-rep-idx" }, String(x.seq)),
        h2("span", { className: "rt-rep-name" }, x.point_name),
        h2("span", { className: "rt-flow-pts" }, "+" + x.points + "\uC810"),
        x.nth_of_point > 1 ? h2(
          "span",
          { className: "rt-tag" },
          "\uAC19\uC740 \uC720\uD615 " + x.nth_of_point + "\uBC88\uC9F8"
        ) : null,
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          {
            className: "rt-btn",
            style: { padding: "0 6px", fontSize: 11 },
            onClick: () => copy(
              (x.requests || []).map((v) => v.request || "").filter(Boolean).join("\n\n"),
              "\uC694\uCCAD " + x.seq + "\uBC88"
            )
          },
          "\uC694\uCCAD \uBCF5\uC0AC"
        )
      ),
      h2(
        "div",
        { className: "rt-rep-meta" },
        h2("span", null, h2("b", null, "\uB300\uC0C1 ")),
        h2("span", { className: "rt-mono" }, x.target || x.asset_ip || "\u2014")
      ),
      x.gained ? h2(
        "div",
        { className: "rt-rep-meta" },
        h2("b", null, "\uD68D\uB4DD "),
        h2("span", null, x.gained)
      ) : null,
      x.vuln ? h2(
        "div",
        { className: "rt-rep-meta" },
        h2("b", null, "\uC774\uC6A9 \uCDE8\uC57D\uC810 "),
        h2(
          "span",
          null,
          [x.vuln.cve, x.vuln.title].filter(Boolean).join(" ")
        )
      ) : null,
      x.evidence ? h2(
        "div",
        { className: "rt-rep-meta" },
        h2("b", null, "\uACB0\uACFC "),
        h2("span", null, String(x.evidence).replace(/\n+/g, " "))
      ) : null,
      x.recorded_at ? h2(
        "div",
        { className: "rt-rep-meta" },
        h2("b", null, "\uD68D\uB4DD \uC2DC\uAC01 "),
        h2(
          "span",
          null,
          fmt(x.recorded_at) + (x.recorded_by ? "(" + (ROLE_LABEL[x.recorded_by] || x.recorded_by) + ")" : "")
        )
      ) : null,
      h2(ShotStrip, {
        eng,
        shots: x.shots,
        total: x.shot_total,
        title: "\uC99D\uAC70 \uC2A4\uD06C\uB9B0\uC0F7"
      }),
      /* ── 재현 단계: 동작 기록(실제 명령과 출력 포함) + 자격 증명 + 터널 + WebShell ─────
         보고서의 납품 가치는 전부 이 블록에 있다: 계정/비밀번호가 어떻게 나왔고 터널을 어떻게 세웠는지, 사용자가 그대로 따라 하면 재현된다. */
      h2(
        "details",
        {
          className: "rt-rep-trace",
          open: x.incomplete === true || (x.steps || []).length === 0
        },
        h2(
          "summary",
          { className: "rt-rep-trace-head", style: { cursor: "pointer" } },
          h2(
            "span",
            { className: "rt-rep-trace-title" },
            "\uC7AC\uD604 \uB2E8\uACC4(\uD074\uB9AD\uD558\uBA74 \uD3BC\uCE68)"
          ),
          (x.steps || []).length ? h2(
            "span",
            { className: "rt-tag" },
            (x.steps || []).length + "\uAC1C \uB3D9\uC791"
          ) : null,
          (x.credentials || []).length ? h2(
            "span",
            { className: "rt-tag" },
            (x.credentials || []).length + "\uAC74 \uC790\uACA9 \uC99D\uBA85"
          ) : null,
          (x.tunnels || []).length ? h2(
            "span",
            { className: "rt-tag" },
            (x.tunnels || []).length + "\uAC1C \uD130\uB110"
          ) : null,
          x.incomplete ? h2(
            "span",
            { className: "rt-tag rt-tag-warn" },
            "\uC7AC\uD604 \uC790\uB8CC \uBCF4\uAC15 \uD544\uC694"
          ) : h2("span", { className: "rt-tag rt-tag-live" }, "\uC7AC\uD604 \uAC00\uB2A5")
        ),
        h2(
          "div",
          { style: { paddingTop: 6 } },
          x.how ? h2("div", { className: "rt-rep-trace-how" }, x.how) : null,
          (x.steps || []).length === 0 ? h2(
            "div",
            { className: "rt-rep-missing" },
            "\u26A0\uFE0F \uC5F0\uACB0\uB41C \uACF5\uACA9 \uB2E8\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4: \uC774 \uB2E8\uACC4\uB97C \uC5B4\uB5BB\uAC8C \uD588\uB294\uC9C0 \uC124\uBA85\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. redteam_chain_add \uB85C \uB3D9\uC791(title / detail / tool / result)\uC744 \uBCF4\uAC15\uD558\uACE0, \uB4DD\uC810 \uC2DC\uC5D0\uB3C4 point_code + evidence \uB85C \uD55C \uBC88\uC5D0 \uB05D\uB0BC \uC218 \uC788\uC2B5\uB2C8\uB2E4."
          ) : (x.steps || []).map(
            (s, si) => h2(
              "div",
              { key: "s" + s.id, className: "rt-rep-step" },
              h2(
                "div",
                { className: "rt-rep-step-head" },
                h2(
                  "span",
                  { className: "rt-rep-step-no" },
                  String(si + 1)
                ),
                h2(
                  "span",
                  { className: "rt-rep-step-title" },
                  s.title || "(\uC774\uB984 \uC5C6\uB294 \uB3D9\uC791)"
                ),
                s.agent ? h2(
                  "span",
                  { className: "rt-tag" },
                  ROLE_LABEL[s.agent] || s.agent
                ) : null,
                s.stage_code ? h2("span", { className: "rt-tag" }, s.stage_code) : null,
                s.inferred ? h2(
                  "span",
                  { className: "rt-tag" },
                  "\uAC19\uC740 \uC790\uC0B0\uC73C\uB85C \uCD94\uB860"
                ) : null,
                h2("div", { className: "rt-spacer" }),
                s.recorded_at ? h2(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      color: "var(--dsw-alias-label-secondary)"
                    }
                  },
                  fmt(s.recorded_at)
                ) : null
              ),
              s.detail ? h2("div", { className: "rt-rep-step-detail" }, s.detail) : null,
              h2(
                "div",
                { className: "rt-rep-step-cmd" },
                h2("b", null, "\uC2E4\uD589 "),
                s.tool ? h2("span", { className: "rt-mono" }, s.tool) : h2(
                  "span",
                  {
                    style: {
                      color: "var(--dsw-alias-state-warn-primary, #f59e0b)"
                    }
                  },
                  "\uC2E4\uC81C \uBA85\uB839 \uBBF8\uAE30\uB85D(redteam_chain_add \uC758 tool)"
                )
              ),
              s.tool ? h2(
                "div",
                { style: { marginTop: 3 } },
                h2(
                  "button",
                  {
                    className: "rt-btn",
                    style: { padding: "0 6px", fontSize: 11 },
                    onClick: () => copy(
                      String(s.tool),
                      "\uB2E8\uACC4 " + (si + 1) + " \uBA85\uB839"
                    )
                  },
                  "\uBA85\uB839 \uBCF5\uC0AC"
                )
              ) : null,
              s.result ? h2(
                "div",
                { className: "rt-rep-step-result" },
                h2("b", null, "\uACB0\uACFC "),
                String(s.result).replace(/\n+/g, " ")
              ) : null,
              s.evidence_ref ? h2(
                "div",
                { className: "rt-rep-step-result" },
                h2("b", null, "\uC99D\uAC70 "),
                h2("span", { className: "rt-mono" }, s.evidence_ref)
              ) : null
            )
          ),
          /* 계정/비밀번호가 어떻게 나왔는지: 자격 증명의 출처 + 획득 방식 */
          (x.credentials || []).length ? h2(
            "div",
            { className: "rt-rep-src" },
            h2(
              "div",
              { className: "rt-rep-src-title" },
              "\uD68D\uB4DD\uD55C \uC790\uACA9 \uC99D\uBA85(\uCD9C\uCC98 \uCD94\uC801 \uAC00\uB2A5)"
            ),
            (x.credentials || []).map(
              (c) => h2(
                "div",
                { key: "c" + c.id, className: "rt-kv" },
                h2(
                  "b",
                  { className: "rt-mono", style: { minWidth: 120 } },
                  c.host || "\u2014"
                ),
                h2(
                  "span",
                  null,
                  (c.username || "(\uC0AC\uC6A9\uC790 \uC774\uB984 \uC5C6\uC74C)") + " / " + (c.secret_type || "password") + (c.privilege ? " \xB7 \uAD8C\uD55C " + c.privilege : "") + " \xB7 \uCD9C\uCC98 " + (c.source || "\uBBF8\uD45C\uAE30") + (c.tool ? " \xB7 \uD68D\uB4DD \uBC29\uC2DD " + String(c.tool).replace(/\n+/g, " ").slice(0, 160) : "")
                )
              )
            )
          ) : null,
          /* 터널을 어떻게 세웠는지 */
          (x.tunnels || []).length ? h2(
            "div",
            { className: "rt-rep-src" },
            h2(
              "div",
              { className: "rt-rep-src-title" },
              "\uC0AC\uC6A9\uD55C \uD130\uB110 / \uD1B5\uB85C"
            ),
            (x.tunnels || []).map(
              (t) => h2(
                "div",
                { key: "t" + t.id, className: "rt-kv" },
                h2(
                  "b",
                  { className: "rt-mono", style: { minWidth: 120 } },
                  (t.kind || "socks5") + " " + (t.listen || "")
                ),
                h2(
                  "span",
                  null,
                  "\uC9C4\uC785\uC810 " + (t.entry || "\uBBF8\uB4F1\uB85D") + (t.reach ? " \xB7 \uB3C4\uB2EC " + t.reach : "") + " \xB7 \uB300\uC0C1 \uCE21 " + (t.entry_kind || "\uBBF8\uC120\uC5B8") + (t.legit === false ? " \xB7 \u26A0\uFE0F \uD0C0\uAE43 \uACBD\uACC4\uB97C \uB118\uC740 \uAC83\uC73C\uB85C \uBCF4\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" : "") + (t.status ? " \xB7 " + t.status : "") + (t.command ? " \xB7 \uBA85\uB839 " + String(t.command).replace(/\n+/g, " ").slice(0, 160) : "")
                )
              )
            )
          ) : null,
          (x.webshells || []).length ? h2(
            "div",
            { className: "rt-rep-src" },
            h2(
              "div",
              { className: "rt-rep-src-title" },
              "\uC0AC\uC6A9\uD55C WebShell"
            ),
            (x.webshells || []).map(
              (w) => h2(
                "div",
                { key: "w" + w.id, className: "rt-kv" },
                h2(
                  "b",
                  { className: "rt-mono", style: { minWidth: 120 } },
                  w.shell_type || "shell"
                ),
                h2(
                  "span",
                  null,
                  (w.url || "") + (w.pass_key ? " \xB7 \uD328\uC2A4\uC6CC\uB4DC/\uD0A4 " + w.pass_key : "") + (w.privilege ? " \xB7 \uAD8C\uD55C " + w.privilege : "") + (w.status ? " \xB7 " + w.status : "")
                )
              )
            )
          ) : null,
          (x.gaps || []).length ? h2(
            "div",
            { className: "rt-rep-missing" },
            "\u26A0\uFE0F \uC7AC\uD604 \uACB0\uC190: " + x.gaps.join("; ")
          ) : null
        ),
        (x.requests || []).length === 0 ? h2(
          "div",
          { className: "rt-rep-missing" },
          "\u26A0\uFE0F \uC774 \uD56D\uBAA9\uC5D0\uB294 \uC6D0\uBCF8 \uC694\uCCAD \uAE30\uB85D\uC774 \uC5C6\uC5B4 \uBC14\uB85C \uC7AC\uD604\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4 \u2014 redteam_http_evidence_add \uB85C \uBCF4\uAC15\uD558\uC138\uC694"
        ) : (x.requests || []).map(
          (r, ri) => h2(
            "div",
            { key: "q" + ri, className: "rt-rep-req" },
            h2(
              "div",
              { className: "rt-rep-req-head" },
              h2(
                "span",
                null,
                "\uC7AC\uD604 \uC694\uCCAD " + (ri + 1) + (r.source === "auto" ? "(\uB300\uC0C1 \uACBD\uB85C\uB85C \uC790\uB3D9 \uB9E4\uCE6D\uD588\uC73C\uB2C8 \uD655\uC778 \uD544\uC694)" : "")
              ),
              h2(
                "span",
                { className: "rt-tag" },
                (r.method || "GET") + " " + (r.status === null || r.status === void 0 ? "" : r.status)
              ),
              h2("div", { className: "rt-spacer" }),
              h2(
                "button",
                {
                  className: "rt-btn",
                  style: { padding: "0 6px", fontSize: 11 },
                  onClick: () => copy(String(r.request || ""), "\uC694\uCCAD " + (ri + 1))
                },
                "Yakit \uB85C \uBCF5\uC0AC"
              )
            ),
            h2(
              "pre",
              { className: "rt-rep-http" },
              r.request || (r.method || "GET") + " " + (r.url || "") + " HTTP/1.1"
            ),
            r.response ? h2(
              "div",
              null,
              h2(
                "div",
                { className: "rt-rep-req-head" },
                h2("span", null, "\uC751\uB2F5 \uC694\uC57D")
              ),
              h2(
                "pre",
                {
                  className: "rt-rep-http",
                  style: { maxHeight: 160 }
                },
                String(r.response).slice(0, 1600)
              )
            ) : null
          )
        ),
        x.note ? h2(
          "div",
          { className: "rt-rep-meta" },
          h2("b", null, "\uBE44\uACE0 "),
          h2("span", null, x.note)
        ) : null
      )
    );
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uACF5\uACA9 \uB4DD\uC810 \uC0AC\uC2AC \uC7AC\uD604 \uBCF4\uACE0\uC11C"),
        summary ? h2(
          "span",
          { className: "rt-tag rt-tag-live" },
          "\uD569\uACC4 " + summary.points + "\uC810"
        ) : null,
        summary ? h2("span", { className: "rt-tag" }, summary.count + "\uAC74 \uB4DD\uC810") : null,
        summary ? h2(
          "span",
          {
            className: "rt-tag" + (summary.missingRequests ? "" : " rt-tag-live")
          },
          summary.withRequests + "/" + summary.count + "\uAC74 \uC6D0\uBCF8 \uC694\uCCAD \uD3EC\uD568"
        ) : null,
        summary ? h2(
          "span",
          {
            className: "rt-tag" + (summary.incomplete ? " rt-tag-warn" : " rt-tag-live"),
            title: "\uC7AC\uD604 \uC0AC\uC2AC\uC774 \uC628\uC804\uD55C\uC9C0: \uACF5\uACA9 \uB2E8\uACC4\uAC00 \uC788\uACE0, \uC2E4\uC81C \uBA85\uB839\uC774 \uAE30\uB85D\uB418\uC5C8\uACE0, \uCDE8\uC57D\uC810/\uC790\uACA9 \uC99D\uBA85/\uD130\uB110\uC774 \uC5F0\uACB0\uB418\uC5C8\uB294\uC9C0"
          },
          "\uC7AC\uD604 \uAC00\uB2A5 " + (summary.count - (summary.incomplete || 0)) + "/" + summary.count
        ) : null,
        summary && summary.serviceCappedExcluded ? h2(
          "span",
          {
            className: "rt-tag rt-tag-warn",
            title: (summary.serviceCapped || []).map((x) => (x.service || "") + "|" + (x.point_name || "")).join("\n") || "\uAC19\uC740 \uC790\uC0B0\xB7\uAC19\uC740 \uD3EC\uD2B8\uC758 \uC911\uBCF5 \uACC4\uC815/DB \uAD8C\uD55C \uC801\uC911: \uC11C\uBE44\uC2A4 \uC0C1\uD55C\uC5D0 \uB3C4\uB2EC\uD574 \uC810\uC218 \uBBF8\uBC18\uC601, \uBCF4\uACE0\uC11C \uC81C\uC678"
          },
          "\uAC19\uC740 \uC11C\uBE44\uC2A4 \uC0C1\uD55C \uB3C4\uB2EC\uB85C \uBBF8\uC9D1\uACC4 " + summary.serviceCappedExcluded
        ) : null,
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          {
            className: "rt-btn",
            disabled: busy || !mdText,
            onClick: () => copy(mdText, "\uC804\uBB38")
          },
          "\uC804\uBB38 \uBCF5\uC0AC"
        ),
        h2(
          "button",
          {
            className: "rt-btn",
            disabled: busy || !mdText,
            onClick: () => download(mdText, data && data.target || eng)
          },
          ".md \uB2E4\uC6B4\uB85C\uB4DC"
        ),
        h2(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "\uC0DD\uC131 \uC911\u2026" : "\uB2E4\uC2DC \uC0DD\uC131"
        )
      ),
      msg ? h2(
        "div",
        { className: msg.err ? "rt-err" : "rt-foot" },
        msg.err || msg.ok
      ) : null,
      err ? h2("div", { className: "rt-err" }, err) : null,
      h2(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        stages.length ? h2(
          "div",
          { className: "rt-rep-list" },
          h2(
            "div",
            { className: "rt-rep-tools" },
            h2(
              "button",
              {
                className: "rt-btn",
                onClick: () => collapse.setAll(
                  stages.map((s) => "st:" + s.code),
                  true
                )
              },
              "\uC804\uCCB4 \uD3BC\uCE58\uAE30"
            ),
            h2(
              "button",
              {
                className: "rt-btn",
                onClick: () => collapse.setAll(
                  stages.map((s) => "st:" + s.code),
                  false
                )
              },
              "\uC804\uCCB4 \uC811\uAE30"
            )
          ),
          stages.map((st) => {
            const open = collapse.isOpen("st:" + st.code, true);
            const toggle = collapse.toggle("st:" + st.code, true);
            return h2(
              "div",
              { key: "g" + st.code, className: "rt-rep-group" },
              h2(
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
                  }
                },
                h2("span", { className: "rt-sec-caret" }, open ? "\u25BE" : "\u25B8"),
                h2(
                  "span",
                  {
                    className: "rt-rep-no",
                    style: { background: st.color }
                  },
                  CIRCLED[st.ordinal - 1] || st.ordinal
                ),
                h2("span", { className: "rt-rep-stage-name" }, st.name),
                h2(
                  "span",
                  { className: "rt-rep-stage-n" },
                  st.items.length + "\uAC74"
                ),
                h2("div", { className: "rt-spacer" }),
                h2(
                  "span",
                  {
                    className: "rt-rep-pts",
                    style: {
                      background: st.color + "22",
                      color: st.color,
                      borderColor: st.color + "66"
                    }
                  },
                  "+" + st.points + "\uC810"
                ),
                h2(
                  "span",
                  { className: "rt-ap-cum" },
                  "\uB204\uC801 " + st.cumulative + "\uC810"
                )
              ),
              open ? h2("div", { className: "rt-rep-body" }, st.items.map(card)) : null
            );
          })
        ) : data === null ? h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026") : h2(
          "div",
          { className: "rt-empty" },
          h2("div", null, "\uC544\uC9C1 \uB0A9\uD488\uD560 \uC131\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."),
          h2(
            "div",
            { style: { marginTop: 6, fontSize: 12 } },
            '\uC774 \uBCF4\uACE0\uC11C\uB294 "\uC810\uC218\uB97C \uB0B8" \uC131\uACFC\uB9CC \uC2E3\uC2B5\uB2C8\uB2E4. \uB4DD\uC810\uD558\uC9C0 \uC54A\uC740 \uCDE8\uC57D\uC810\uC740 \uBCF4\uACE0\uC11C\uC5D0 \uB4E4\uC5B4\uAC00\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC131\uACFC\uB97C \uC5BB\uC740 \uB4A4 redteam_score_hit \uB85C \uC810\uC218\uB97C \uAE30\uB85D\uD558\uACE0(\uB300\uC0C1 \uC790\uC0B0 + \uC5BB\uC740 \uAC83), \uC7AC\uD604\uD560 \uC218 \uC788\uB3C4\uB85D redteam_http_evidence_add \uB85C \uBCF4\uAC15\uD558\uC138\uC694.'
          )
        )
      ),
      h2(
        "div",
        { className: "rt-foot" },
        h2(
          "span",
          null,
          "\uAE30\uC900: \uB4DD\uC810 \uC131\uACFC\uB9CC \uC218\uB85D\uD558\uBA70, \uD56D\uBAA9\uB9C8\uB2E4 Yakit Repeater \uC5D0 \uBD99\uC5EC\uB123\uC744 \uC218 \uC788\uB294 \uC6D0\uBCF8 \uC694\uCCAD\uC744 \uBD99\uC785\uB2C8\uB2E4"
        )
      )
    );
  }
  const FILE_KIND = {
    poc: "POC",
    exp: "EXP",
    script: "\uC2A4\uD06C\uB9BD\uD2B8",
    wordlist: "\uC0AC\uC804",
    other: "\uAE30\uD0C0"
  };
  function AttackFilesTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [folders, setFolders] = import_react2.default.useState([]);
    const [err, setErr] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const collapse = useCollapse("files:" + eng);
    const [detail, setDetail] = import_react2.default.useState(null);
    const load = () => {
      if (!eng) return;
      setBusy(true);
      api({ op: "attackFiles", engagement: eng }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setFolders(r.items || []);
        },
        (e) => {
          setBusy(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    import_react2.default.useEffect(load, [eng, refreshKey]);
    const openFile = (f) => {
      if (detail && detail.id === f.id) {
        setDetail(null);
        return;
      }
      setDetail(null);
      api({ op: "readAttackFile", engagement: eng, id: f.id }).then(
        (r) => {
          if (r && r.ok) setDetail(r);
          else setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
        },
        (e) => setErr(String(e && e.message || e))
      );
    };
    const rows = [];
    for (const folder of folders) {
      const fKey = "folder:" + folder.folder;
      const fileNodes = [];
      for (const f of folder.files) {
        fileNodes.push(
          h2(
            "div",
            {
              key: "a" + f.id,
              className: "rt-vrow",
              style: {
                gridTemplateColumns: "18px 1.2fr 60px 1.6fr",
                cursor: "pointer"
              },
              role: "button",
              tabIndex: 0,
              onClick: () => openFile(f),
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openFile(f);
                }
              }
            },
            h2(
              "span",
              { className: "rt-sec-caret" },
              detail && detail.id === f.id ? "\u25BE" : "\u25B8"
            ),
            h2("span", { className: "rt-mono" }, f.name),
            h2(
              "span",
              null,
              h2(
                "span",
                { className: "rt-tag rt-tag-active" },
                FILE_KIND[f.kind] || f.kind || "\u2014"
              )
            ),
            h2(
              "span",
              {
                style: {
                  fontSize: 11.5,
                  color: "var(--dsw-alias-label-secondary)"
                },
                title: f.description || ""
              },
              f.description || "\u2014"
            )
          )
        );
        if (!detail || detail.id !== f.id) continue;
        fileNodes.push(
          h2(
            "div",
            {
              key: "ad" + f.id,
              className: "rt-vrow",
              style: { cursor: "default", gridTemplateColumns: "1fr" }
            },
            h2(
              "div",
              { className: "rt-vdetail" },
              h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uD6A8\uACFC"),
                h2("span", null, detail.evidence || "\u2014")
              ),
              h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uACBD\uB85C"),
                h2(
                  "span",
                  { className: "rt-mono", style: { wordBreak: "break-all" } },
                  detail.path
                )
              ),
              h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uAE30\uB85D"),
                h2(
                  "span",
                  null,
                  fmt(detail.created_at) + (detail.created_by ? " \xB7 " + detail.created_by : "")
                )
              ),
              h2(
                "pre",
                {
                  className: "rt-md",
                  style: {
                    border: "1px solid var(--dsw-alias-border-l1)",
                    borderRadius: 6,
                    maxHeight: "40vh",
                    padding: "10px 12px"
                  }
                },
                detail.content || "(\uBE44\uC5B4 \uC788\uC74C)"
              )
            )
          )
        );
      }
      rows.push(
        h2(
          Section,
          {
            key: "sec:" + folder.folder,
            tone: "folder",
            title: folder.folder + "/",
            count: folder.count + "\uAC1C \uD30C\uC77C",
            open: collapse.isOpen(fKey, true),
            onToggle: collapse.toggle(fKey, true)
          },
          fileNodes.length ? fileNodes : h2("div", { className: "rt-atest-meta" }, "(\uBE44\uC5B4 \uC788\uC74C)")
        )
      );
    }
    const total = folders.reduce((n, f) => n + f.count, 0);
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uACF5\uACA9 \uD30C\uC77C"),
        h2(
          "span",
          { className: "rt-tag" },
          folders.length + "\uAC1C \uB300\uC0C1 / " + total + "\uAC1C \uD30C\uC77C"
        ),
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "\uC0C8\uB85C\uACE0\uCE68 \uC911\u2026" : "\uC0C8\uB85C\uACE0\uCE68"
        )
      ),
      err ? h2("div", { className: "rt-err" }, err) : null,
      h2(
        "div",
        { className: "rt-table" },
        rows,
        !folders.length ? h2(
          "div",
          { className: "rt-empty" },
          "\uACF5\uACA9 \uD30C\uC77C \uC5C6\uC74C(\uB6AB\uC740 \uC2A4\uD06C\uB9BD\uD2B8/POC/EXP \uAC00 \uB300\uC0C1 \uD3F4\uB354\uBCC4\uB85C \uC5EC\uAE30\uC5D0 \uB098\uD0C0\uB0A9\uB2C8\uB2E4)"
        ) : null
      ),
      h2(
        "div",
        { className: "rt-foot" },
        h2(
          "span",
          null,
          "\uB514\uB809\uD130\uB9AC: attack-files/<IP|URL \uD638\uC2A4\uD2B8|C \uBE14\uB85D>/ | \uC2E4\uC81C\uB85C \uD6A8\uACFC\uAC00 \uC788\uC5C8\uB358 \uD30C\uC77C\uB9CC \uC218\uB85D"
        )
      )
    );
  }
  const POC_KIND_LABEL = {
    poc: "POC",
    exp: "EXP",
    script: "\uC2A4\uD06C\uB9BD\uD2B8",
    template: "\uD15C\uD50C\uB9BF",
    payload: "\uD398\uC774\uB85C\uB4DC"
  };
  const POC_SOURCE_LABEL = {
    web: "\uC778\uD130\uB137",
    self: "\uC9C1\uC811 \uC81C\uC791",
    manual: "\uC218\uB3D9",
    "nuclei-template": "nuclei \uD15C\uD50C\uB9BF",
    kb: "\uC9C0\uC2DD \uBCA0\uC774\uC2A4"
  };
  function KnowledgeTab(props) {
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const [msg, setMsg] = import_react2.default.useState(null);
    const [q, setQ] = import_react2.default.useState("");
    const [kind, setKind] = import_react2.default.useState("");
    const [category, setCategory] = import_react2.default.useState("");
    const [engagement, setEngagement] = import_react2.default.useState("");
    const [assetTarget, setAssetTarget] = import_react2.default.useState("");
    const [grouped, setGrouped] = import_react2.default.useState(true);
    const [verifiedOnly, setVerifiedOnly] = import_react2.default.useState(false);
    const [openId, setOpenId] = import_react2.default.useState(null);
    const [detail, setDetail] = import_react2.default.useState(null);
    const [detailBusy, setDetailBusy] = import_react2.default.useState(false);
    const [tplOffset, setTplOffset] = import_react2.default.useState(0);
    const tplPageSize = 40;
    const query = (over) => {
      const extra = over || {};
      const offset = Object.prototype.hasOwnProperty.call(
        extra,
        "templateOffset"
      ) ? extra.templateOffset : 0;
      setTplOffset(offset);
      const params = Object.assign(
        {
          q: q.trim() || void 0,
          kind: kind || void 0,
          category: category || void 0,
          engagement: engagement || void 0,
          asset_target: assetTarget.trim() || void 0,
          verified: verifiedOnly || void 0,
          templateOffset: offset || 0,
          templateLimit: tplPageSize
        },
        extra
      );
      setBusy(true);
      setMsg(null);
      api(Object.assign({ op: "pocSearch" }, params)).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => {
          setBusy(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    import_react2.default.useEffect(() => {
      query({
        q: void 0,
        kind: void 0,
        category: void 0,
        engagement: void 0,
        asset_target: void 0,
        verified: void 0
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
      api({ op: "pocGet", id }).then(
        (r) => {
          setDetailBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC77D\uAE30 \uC2E4\uD328" });
            return;
          }
          setDetail(r);
        },
        (e) => {
          setDetailBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const copy = (text, label) => copyWithFeedback(text, label, (okFlag, message) => {
      setMsg(okFlag ? { ok: message } : { err: message });
    });
    const useIt = (row) => {
      api({ op: "pocUse", id: row.id, used_on: "\uCF58\uC194\uC5D0\uC11C \uC218\uB3D9 \uD45C\uC2DC" }).then(
        () => {
          setMsg({ ok: "\uC7AC\uC0AC\uC6A9 1\uD68C \uAE30\uB85D: " + row.title });
          query();
        },
        (e) => setMsg({ err: String(e && e.message || e) })
      );
    };
    const stats = data && data.stats || {
      total: 0,
      verified: 0,
      reused: 0,
      byKind: [],
      bySource: []
    };
    const items = data && data.items || [];
    const tpl = data && data.templates || {
      dir: null,
      total: 0,
      matched: 0,
      offset: 0,
      items: [],
      byCategory: []
    };
    const tplByCat = new Map(
      (tpl.byCategory || []).map((c) => [c.code, c.n || 0])
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
      return h2(
        "div",
        { key: "p" + x.id, className: "rt-kb" + (isOpen ? " open" : "") },
        h2(
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
            }
          },
          h2("span", { className: "rt-sec-caret" }, isOpen ? "\u25BE" : "\u25B8"),
          h2(
            "span",
            { className: "rt-kb-kind k-" + (x.kind || "poc") },
            POC_KIND_LABEL[x.kind] || x.kind || "POC"
          ),
          h2("span", { className: "rt-kb-title" }, x.title),
          x.cve ? h2("span", { className: "rt-tag rt-tag-passive" }, x.cve) : null,
          x.component ? h2("span", { className: "rt-tag" }, x.component) : null,
          x.verified === 1 ? h2("span", { className: "rt-tag rt-tag-live" }, "\uAC80\uC99D\uB428") : h2("span", { className: "rt-tag rt-tag-warn" }, "\uBBF8\uAC80\uC99D"),
          h2("div", { className: "rt-spacer" }),
          h2(
            "span",
            { className: "rt-tag" },
            POC_SOURCE_LABEL[x.source] || x.source || "\u2014"
          ),
          x.hit_count ? h2("span", { className: "rt-tag" }, "\uC7AC\uC0AC\uC6A9 " + x.hit_count) : null
        ),
        /* 출처 행: 분류 · 영향 버전 · 등록 시각 · 출처 타깃 · 발견 자산 — 지식 하나가 "언제,
             어느 조직의 어느 자산에서 발견했는지" 한눈에 보인다 */
        h2(
          "div",
          { className: "rt-kb-sub" },
          [
            x.category ? "\uBD84\uB958 " + (POC_CAT_NAME[x.category] || x.category) : null,
            x.versions ? "\uC601\uD5A5 \uBC84\uC804 " + x.versions : null,
            x.language || null,
            x.tags || null,
            "\uB4F1\uB85D \uC2DC\uAC01 " + fmt(x.created_at),
            x.engagement_name || x.engagement_id ? "\uCD9C\uCC98 \uD0C0\uAE43 " + (x.engagement_name || x.engagement_id) : null,
            x.asset_target ? "\uBC1C\uACAC \uC790\uC0B0 " + x.asset_target : null,
            x.found_by_agent ? "\uBC1C\uACAC \uC5ED\uD560 " + (ROLE_LABEL[x.found_by_agent] || x.found_by_agent) : null,
            x.source_url ? "\uCD9C\uCC98 " + x.source_url : null
          ].filter(Boolean).join(" \xB7 ")
        ),
        isOpen ? h2(
          "div",
          { className: "rt-kb-body" },
          detailBusy && !d ? h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026") : null,
          d ? h2(
            "div",
            null,
            d.usage ? h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uC6A9\uBC95"),
              h2("span", { className: "rt-mono" }, d.usage)
            ) : null,
            d.description ? h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uC124\uBA85"),
              h2("span", null, d.description)
            ) : null,
            d.verified_note ? h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uAC80\uC99D \uC99D\uAC70"),
              h2("span", null, d.verified_note)
            ) : null,
            d.used_on ? h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uCD5C\uADFC \uC0AC\uC6A9"),
              h2("span", null, d.used_on)
            ) : null,
            d.path ? h2(
              "div",
              { className: "rt-kv" },
              h2("b", null, "\uC800\uC7A5 \uACBD\uB85C"),
              h2("span", { className: "rt-mono" }, d.path)
            ) : null,
            h2(
              "div",
              { className: "rt-kb-actions" },
              h2(
                "button",
                {
                  className: "rt-btn",
                  disabled: !d.content,
                  onClick: () => copy(d.content || "", "POC \uBCF8\uBB38")
                },
                "\uBCF8\uBB38 \uBCF5\uC0AC"
              ),
              h2(
                "button",
                { className: "rt-btn", onClick: () => useIt(x) },
                "\uC7AC\uC0AC\uC6A9 1\uD68C \uAE30\uB85D"
              ),
              d.source_url ? h2(
                "button",
                {
                  className: "rt-btn",
                  onClick: () => copy(d.source_url, "\uCD9C\uCC98 \uB9C1\uD06C")
                },
                "\uCD9C\uCC98 \uBCF5\uC0AC"
              ) : null
            ),
            d.content ? h2(
              "pre",
              { className: "rt-rep-http" },
              d.content.length > 12e3 ? d.content.slice(0, 12e3) + "\n\u2026(\uC798\uB838\uC2B5\uB2C8\uB2E4. \uC804\uBB38\uC740 \uC800\uC7A5\uB41C \uD30C\uC77C\uC744 \uBCF4\uC138\uC694)" : d.content
            ) : h2(
              "div",
              { className: "rt-empty" },
              "\uC774 \uD56D\uBAA9\uC740 \uBA54\uD0C0\uB370\uC774\uD130\uB9CC \uC788\uACE0 \uBCF8\uBB38\uC774 \uC5C6\uC2B5\uB2C8\uB2E4 \u2014 \uBCF8\uBB38\uC744 \uC5BB\uC740 \uB4A4 redteam_poc_update \uB85C \uBCF4\uAC15\uD558\uC138\uC694"
            )
          ) : null
        ) : null
      );
    };
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uC9C0\uC2DD \uBCA0\uC774\uC2A4 \xB7 POC / EXP"),
        h2("span", { className: "rt-tag" }, stats.total + "\uAC74"),
        h2(
          "span",
          { className: "rt-tag rt-tag-live" },
          "\uAC80\uC99D\uB428 " + stats.verified
        ),
        h2(
          "span",
          { className: "rt-tag" },
          "\uB204\uC801 \uC7AC\uC0AC\uC6A9 " + (stats.reused || 0)
        ),
        (stats.uncategorized || 0) > 0 && (stats.uncategorized || 0) !== stats.total ? h2(
          "span",
          {
            className: "rt-tag rt-tag-warn",
            title: "\uC544\uC9C1 \uBD84\uB958\uB418\uC9C0 \uC54A\uC740 \uD56D\uBAA9\uC785\uB2C8\uB2E4: \uC5D0\uC774\uC804\uD2B8\uAC00 \uB418\uCC44\uC6B8 \uB54C redteam_poc_add \uC758 category \uC778\uC790\uB85C \uD45C\uC2DC\uD569\uB2C8\uB2E4"
          },
          "\uBBF8\uBD84\uB958 " + stats.uncategorized
        ) : null,
        tpl.total ? h2(
          "span",
          { className: "rt-tag rt-tag-passive" },
          "\uC774 PC \uD15C\uD50C\uB9BF " + tpl.total
        ) : null,
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          {
            className: "rt-btn" + (grouped ? " rt-btn-primary" : ""),
            title: "\uBD84\uB958\uBCC4 \uADF8\uB8F9 \uD45C\uC2DC / \uAC1C\uBCC4 \uB098\uC5F4",
            onClick: () => setGrouped(!grouped)
          },
          grouped ? "\uBD84\uB958\uBCC4 \uADF8\uB8F9" : "\uAC1C\uBCC4 \uB098\uC5F4"
        ),
        h2(
          "button",
          { className: "rt-btn", disabled: busy, onClick: () => query() },
          busy ? "\uAC80\uC0C9 \uC911\u2026" : "\uC0C8\uB85C\uACE0\uCE68"
        )
      ),
      /* 분류 개요: 한 번 누르면 그 분류로 필터된다. 어떤 무기가 얼마나 쌓였고 어떤 분류가 비었는지 한눈에 본다 */
      h2(
        "div",
        { className: "rt-kb-cats" },
        (stats.byCategory || []).filter((c) => catShown(c) > 0 || POC_CAT_ORDER.includes(c.code)).map(
          (c) => h2(
            "span",
            {
              key: c.code,
              className: "rt-concl-i" + (category === c.code ? " on" : ""),
              title: (c.hint || POC_CAT_NAME[c.code] || c.code) + " \xB7 \uC774 PC \uD15C\uD50C\uB9BF " + (tplByCat.get(c.code) || 0) + " \xB7 \uC9C0\uC2DD \uBCA0\uC774\uC2A4 " + (c.n || 0) + (c.verified ? "(\uAC80\uC99D\uB428 " + c.verified + ")" : ""),
              onClick: () => {
                const next = category === c.code ? "" : c.code;
                setCategory(next);
                query({ category: next || void 0 });
              }
            },
            h2("b", null, String(catShown(c))),
            h2(
              "span",
              null,
              (POC_CAT_NAME[c.code] || c.code) + (c.verified ? "(\uAC80\uC99D\uB428 " + c.verified + ")" : "")
            )
          )
        )
      ),
      h2(
        "div",
        { className: "rt-kb-filter" },
        h2("input", {
          className: "rt-input",
          style: { flex: 1, minWidth: 140 },
          placeholder: "CVE / \uCEF4\uD3EC\uB10C\uD2B8 / \uD0A4\uC6CC\uB4DC \uAC80\uC0C9(\uBCF8\uBB38\uB3C4 \uAC80\uC0C9\uD569\uB2C8\uB2E4)",
          value: q,
          onChange: (e) => setQ(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") query();
          }
        }),
        h2(
          "select",
          {
            className: "rt-input",
            style: { maxWidth: 120 },
            value: category,
            onChange: (e) => {
              setCategory(e.target.value);
              query({ category: e.target.value || void 0 });
            }
          },
          h2("option", { value: "" }, "\uBAA8\uB4E0 \uBD84\uB958"),
          POC_CAT_ORDER.map(
            (k) => h2("option", { key: k, value: k }, POC_CAT_NAME[k])
          )
        ),
        h2(
          "select",
          {
            className: "rt-input",
            style: { maxWidth: 120 },
            value: engagement,
            onChange: (e) => {
              setEngagement(e.target.value);
              query({ engagement: e.target.value || void 0 });
            }
          },
          h2("option", { value: "" }, "\uBAA8\uB4E0 \uCD9C\uCC98 \uD0C0\uAE43"),
          (stats.byEngagement || []).map(
            (e) => h2(
              "option",
              { key: e.engagement, value: e.engagement },
              e.engagement + "(" + e.n + ")"
            )
          )
        ),
        h2("input", {
          className: "rt-input",
          style: { width: 120 },
          placeholder: "\uBC1C\uACAC \uC790\uC0B0 \uD544\uD130",
          value: assetTarget,
          onChange: (e) => setAssetTarget(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") query();
          }
        }),
        h2(
          "select",
          {
            className: "rt-input",
            style: { maxWidth: 110 },
            value: kind,
            onChange: (e) => {
              setKind(e.target.value);
              query({ kind: e.target.value || void 0 });
            }
          },
          h2("option", { value: "" }, "\uBAA8\uB4E0 \uC720\uD615"),
          Object.keys(POC_KIND_LABEL).map(
            (k) => h2("option", { key: k, value: k }, POC_KIND_LABEL[k])
          )
        ),
        h2(
          "label",
          { className: "rt-kb-check" },
          h2("input", {
            type: "checkbox",
            checked: verifiedOnly,
            onChange: (e) => {
              setVerifiedOnly(e.target.checked);
              query({ verified: e.target.checked || void 0 });
            }
          }),
          "\uAC80\uC99D\uB41C \uAC83\uB9CC"
        ),
        h2(
          "button",
          { className: "rt-btn rt-btn-primary", onClick: () => query() },
          "\uAC80\uC0C9"
        )
      ),
      msg ? h2(
        "div",
        { className: msg.err ? "rt-err" : "rt-foot" },
        msg.err || msg.ok
      ) : null,
      err ? h2(
        "div",
        { className: "rt-err" },
        /engagement required|unknown op/i.test(err) ? (
          /* 옛 host 에는 지식 베이스 인터페이스가 없다: 복구 방법을 분명히 알려준다. "engagement required" 를 보고 헤매지 않게 한다 */
          "\uC9C0\uC2DD \uBCA0\uC774\uC2A4 \uC778\uD130\uD398\uC774\uC2A4\uB294 host \uCE21\uC774 \uC81C\uACF5\uD569\uB2C8\uB2E4. \uD604\uC7AC \uD638\uC2A4\uD2B8\uAC00 \uC544\uC9C1 \uC61B \uD504\uB85C\uC138\uC2A4\uC774\uBBC0\uB85C \uC644\uC804\uD788 \uC885\uB8CC\uD55C \uB4A4 \uB2E4\uC2DC \uC2E4\uD589\uD558\uACE0(\uACF5\uC2DD exe / \uCEE4\uBBA4\uB2C8\uD2F0\uD310 / dsh web \uC911 \uC544\uBB34\uAC70\uB098), \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C\uACE0\uCE68\uD558\uC138\uC694."
        ) : err
      ) : null,
      !err && data && data.dbPath ? h2(
        "div",
        { className: "rt-foot", style: { marginBottom: 6, fontSize: 11 } },
        "\uC9C0\uC2DD \uBCA0\uC774\uC2A4: " + data.dbPath + (data.root ? "(\uB8E8\uD2B8 \uB514\uB809\uD130\uB9AC " + data.root + ")" : "")
      ) : null,
      h2(
        "div",
        { className: "rt-table" },
        (() => {
          if (!grouped) return items.map(card);
          const buckets = /* @__PURE__ */ new Map();
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
              h2(
                "div",
                { key: "g" + code, className: "rt-kb-cat" },
                h2(
                  "span",
                  { className: "rt-kb-cat-name" },
                  POC_CAT_NAME[code] || code
                ),
                h2("span", { className: "rt-tag" }, list.length + "\uAC74"),
                h2(
                  "span",
                  { className: "rt-tag rt-tag-live" },
                  "\uAC80\uC99D\uB428 " + list.filter((x) => x.verified === 1).length
                ),
                h2("span", { className: "rt-spacer" }),
                h2(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      color: "var(--dsw-alias-label-secondary)"
                    }
                  },
                  "\uCD5C\uADFC \uB4F1\uB85D " + fmt(
                    list.map((x) => x.created_at).filter(Boolean).sort().pop()
                  )
                )
              )
            );
            for (const x of list) out.push(card(x));
          }
          return out;
        })(),
        tplItems.length ? h2(
          "div",
          { className: "rt-kb-tpl" },
          h2(
            "div",
            { className: "rt-ap-sub" },
            "\uC774 PC nuclei \uD15C\uD50C\uB9BF \xB7 " + (tplStart + 1) + "\u2013" + (tplStart + tplItems.length) + " / " + tplMatched + "(\uBC14\uB85C `nuclei -t <\uD15C\uD50C\uB9BF \uACBD\uB85C>`)"
          ),
          tplItems.map(
            (t, i) => h2(
              "div",
              { key: "t" + tplStart + "-" + i, className: "rt-kb-tpl-row" },
              h2("span", { className: "rt-tag" }, t.severity || "\u2014"),
              t.category ? h2(
                "span",
                { className: "rt-tag" },
                POC_CAT_NAME[t.category] || t.category
              ) : null,
              h2(
                "span",
                { className: "rt-mono rt-kb-tpl-path", title: t.path },
                t.path
              ),
              h2(
                "span",
                { className: "rt-kb-tpl-name", title: t.name },
                t.name || ""
              ),
              h2(
                "button",
                {
                  className: "rt-btn",
                  style: { padding: "0 6px", fontSize: 10.5 },
                  onClick: () => copy(
                    "nuclei -t " + t.path + " -u <\uB300\uC0C1>",
                    "\uD15C\uD50C\uB9BF \uBA85\uB839"
                  )
                },
                "\uBA85\uB839 \uBCF5\uC0AC"
              )
            )
          ),
          h2(
            "div",
            { className: "rt-kb-actions" },
            h2(
              "button",
              {
                className: "rt-btn",
                disabled: busy || tplStart <= 0,
                onClick: () => turnTpl(tplStart - tplPageSize)
              },
              "\uC774\uC804 \uD398\uC774\uC9C0"
            ),
            h2(
              "button",
              {
                className: "rt-btn",
                disabled: busy || tplStart + tplItems.length >= tplMatched,
                onClick: () => turnTpl(tplStart + tplPageSize)
              },
              "\uB2E4\uC74C \uD398\uC774\uC9C0"
            )
          ),
          tpl.dir ? h2(
            "div",
            { className: "rt-foot" },
            h2("span", null, "\uD15C\uD50C\uB9BF \uB514\uB809\uD130\uB9AC: " + tpl.dir)
          ) : null
        ) : null,
        data === null ? h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026") : null,
        data !== null && !items.length && !tplItems.length ? h2(
          "div",
          { className: "rt-empty" },
          h2(
            "div",
            null,
            q || kind || verifiedOnly ? "\uC801\uC911 \uC5C6\uC74C: \uD0A4\uC6CC\uB4DC\uB97C \uBC14\uAFD4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098, \uC778\uD130\uB137\uC5D0\uC11C \uCC3E\uAC70\uB098 \uC9C1\uC811 \uB9CC\uB4E4\uC5B4 \uB418\uCC44\uC6B0\uC138\uC694." : tpl.total ? "POC/EXP \uB77C\uC774\uBE0C\uB7EC\uB9AC\uAC00 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4; \uC774 PC \uC5D0 nuclei \uD15C\uD50C\uB9BF\uC774 " + tpl.total + "\uAC1C \uC788\uC9C0\uB9CC \uC774 \uD398\uC774\uC9C0\uC5D0\uB294 \uB098\uC624\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD074\uB77C\uC774\uC5B8\uD2B8\uB97C \uC644\uC804\uD788 \uC885\uB8CC\uD55C \uB4A4 \uB2E4\uC2DC \uC2E4\uD589\uD558\uC138\uC694." : tpl.dir ? "\uC9C0\uC2DD \uBCA0\uC774\uC2A4\uAC00 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4(\uC774 PC \uD15C\uD50C\uB9BF \uB514\uB809\uD130\uB9AC\uB294 \uC788\uC9C0\uB9CC yaml \uC774 \uC5C6\uC2B5\uB2C8\uB2E4. nuclei -update-templates \uB97C \uC2E4\uD589\uD558\uC138\uC694)." : "\uC9C0\uC2DD \uBCA0\uC774\uC2A4\uAC00 \uC544\uC9C1 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uC774 PC \uC5D0\uB3C4 nuclei \uD15C\uD50C\uB9BF \uB77C\uC774\uBE0C\uB7EC\uB9AC\uAC00 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4 \u2014 \uC2E4\uC2B5 \uBA38\uC2E0\uC5D0\uC11C setup.sh \uB610\uB294 `nuclei -update-templates` \uB97C \uC2E4\uD589\uD558\uBA74 \uC5EC\uAE30\uC5D0 \u201C\uC774 PC \uD15C\uD50C\uB9BF N\u201D\uC774 \uB098\uD0C0\uB0A9\uB2C8\uB2E4."
          ),
          h2(
            "div",
            { style: { marginTop: 6, fontSize: 12 } },
            "Nday/1day \uB97C \uACF5\uB7B5\uD558\uB294 \uD45C\uC900 \uC21C\uC11C: \u2460 redteam_poc_search \uB85C \uC5EC\uAE30\uB97C \uBA3C\uC800 \uC870\uD68C\uD569\uB2C8\uB2E4(\uC774 PC nuclei \uD15C\uD50C\uB9BF \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB3C4 \uD568\uAED8 \uAC80\uC0C9\uD569\uB2C8\uB2E4) \u2192 \u2461 \uC5C6\uC73C\uBA74 \uC778\uD130\uB137 \uAC80\uC0C9(web_search / GitHub / ExploitDB / \uBCA4\uB354 \uACF5\uC9C0) \uB610\uB294 \uC9C1\uC811 \uC81C\uC791 \u2192 \u2462 \uC2E4\uC81C \uB300\uC0C1\uC5D0\uC11C \uC720\uD6A8\uD568\uC744 \uD655\uC778\uD55C \uB4A4 redteam_poc_add \uB85C \uB418\uCC44\uC6B0\uBA74, \uC774\uD6C4 \uD0C0\uAE43\uC5D0\uC11C \uBC14\uB85C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
          ),
          data.dbPath ? h2(
            "div",
            {
              style: { marginTop: 6, fontSize: 11 },
              className: "rt-mono"
            },
            "\uC9C0\uC2DD \uBCA0\uC774\uC2A4 \uD30C\uC77C: " + data.dbPath
          ) : null,
          tpl.dir ? h2(
            "div",
            {
              style: { marginTop: 6, fontSize: 11 },
              className: "rt-mono"
            },
            "\uD15C\uD50C\uB9BF \uB514\uB809\uD130\uB9AC: " + tpl.dir
          ) : null
        ) : null
      ),
      h2(
        "div",
        { className: "rt-foot" },
        h2(
          "span",
          null,
          "\uC804\uC5ED \uACF5\uC720(\uD0C0\uAE43 \uAC04) | \uC800\uC7A5 \uC704\uCE58: pocs/<code>/ | \uBC94\uC6A9\uC73C\uB85C \uC7AC\uC0AC\uC6A9 \uAC00\uB2A5\uD55C POC/EXP \uB9CC \uC218\uB85D\uD558\uACE0, \uD0C0\uAE43 \uC804\uC6A9 \uC2A4\uD06C\uB9BD\uD2B8\uB294 \u201C\uACF5\uACA9 \uD30C\uC77C\u201D\uB85C \uBCF4\uB0C5\uB2C8\uB2E4"
        )
      )
    );
  }
  function EnvTab(props) {
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [draft, setDraft] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [msg, setMsg] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const [folderPath, setFolderPath] = import_react2.default.useState("");
    const applyDraftFrom = (r) => {
      const c = r && r.config || {};
      setDraft({
        platform: c.platform || "auto",
        toolkitDir: c.toolkitDir || "",
        nucleiTemplatesDir: c.nucleiTemplatesDir || "",
        binDirsText: (c.binDirs || []).join("\n"),
        tools: Object.assign({}, c.tools || {}),
        env: Object.assign(
          { FOFA_KEY: "", REDTEAM_VPS_HOST: "", REDTEAM_VPS_KEY: "" },
          c.env || {}
        ),
        notes: c.notes || ""
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
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setData(r);
          applyDraftFrom(r);
        },
        (e) => {
          setBusy(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    import_react2.default.useEffect(load, [refreshKey]);
    const save = () => {
      if (!draft) return;
      setBusy(true);
      setMsg(null);
      const config = {
        platform: draft.platform,
        toolkitDir: draft.toolkitDir,
        nucleiTemplatesDir: draft.nucleiTemplatesDir,
        binDirs: String(draft.binDirsText || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
        tools: draft.tools,
        env: draft.env,
        notes: draft.notes,
        envAdaptConfigured: true,
        envAdaptSkip: false
      };
      api({ op: "platformConfigSave", config }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC800\uC7A5 \uC2E4\uD328" });
            return;
          }
          setData(r);
          setMsg({
            ok: "\uC800\uC7A5\uB428: " + (r.config && r.config.path || "$DSH_HOME/redteam/config.json")
          });
          applyDraftFrom(r);
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const assignFolder = () => {
      const dir = String(
        folderPath || draft && draft.toolkitDir || ""
      ).trim();
      if (!dir) {
        setMsg({ err: "\uB3C4\uAD6C\uAC00 \uC788\uB294 \uD3F4\uB354 \uACBD\uB85C\uB97C \uBA3C\uC800 \uC785\uB825\uD558\uC138\uC694" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({ op: "platformAssignToolkit", dir }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC790\uB3D9 \uD560\uB2F9 \uC2E4\uD328" });
            return;
          }
          setData(r);
          applyDraftFrom(r);
          setMsg({
            ok: "\uD3F4\uB354\uC5D0\uC11C " + (r.assignedCount || 0) + "\uAC1C \uB3C4\uAD6C\uB97C \uD560\uB2F9\uD588\uC2B5\uB2C8\uB2E4" + (r.nucleiTemplatesDir ? ", nuclei-templates \uB3C4 \uC778\uC2DD\uD588\uC2B5\uB2C8\uB2E4" : "")
          });
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const setTool = (id, value) => setDraft(
      (d) => d ? Object.assign({}, d, {
        tools: Object.assign({}, d.tools, { [id]: value })
      }) : d
    );
    const setEnv = (key, value) => setDraft(
      (d) => d ? Object.assign({}, d, {
        env: Object.assign({}, d.env, { [key]: value })
      }) : d
    );
    const runtime = data && data.runtime || {};
    const adapt = data && data.adapt || {};
    const tools = data && data.tools && data.tools.items || [];
    const found = tools.filter((t) => t.path).length;
    const defaultToolkit = data && data.toolkitDir || "$DSH_HOME/redteam/toolkit";
    const defaultNuclei = data && data.nucleiTemplatesDir || defaultToolkit + "/nuclei-templates";
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uD658\uACBD \uC801\uC751"),
        h2(
          "span",
          { className: "rt-tag" },
          runtime.effective === "windows" ? "Windows" : "Linux/Kali"
        ),
        adapt.kali ? h2("span", { className: "rt-tag rt-tag-live" }, "Kali") : null,
        h2(
          "span",
          {
            className: "rt-tag" + (adapt.ready ? " rt-tag-live" : " rt-tag-warn")
          },
          adapt.ready ? "\uC900\uBE44\uB428 \xB7 " + (adapt.reason || "") : "\uC124\uC815 \uB300\uAE30"
        ),
        h2(
          "span",
          { className: "rt-tag" + (found ? " rt-tag-live" : " rt-tag-warn") },
          "\uB3C4\uAD6C " + found + "/" + tools.length
        ),
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "\uC77D\uB294 \uC911\u2026" : "\uC0C8\uB85C\uACE0\uCE68"
        ),
        h2(
          "button",
          {
            className: "rt-btn rt-btn-primary",
            disabled: busy || !draft,
            onClick: save
          },
          "\uC800\uC7A5"
        )
      ),
      h2(
        "div",
        { className: "rt-pane", style: { minHeight: 0 } },
        err ? h2("div", { className: "rt-err" }, err) : null,
        msg ? h2(
          "div",
          { className: msg.err ? "rt-err" : "rt-foot" },
          msg.err || msg.ok
        ) : null,
        h2(
          "div",
          {
            className: "rt-card",
            style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.6 }
          },
          adapt.message || "\uBAA8\uB450 \uC120\uD0DD \uC0AC\uD56D\uC785\uB2C8\uB2E4: \uBE44\uC6CC \uB450\uBA74 \uAE30\uBCF8 \uACBD\uB85C/\uC790\uB3D9 \uD0D0\uC0C9\uC744 \uC501\uB2C8\uB2E4. \uCC44\uC6B0\uBA74 \uAE30\uBCF8\uAC12\uC744 \uB36E\uC5B4\uC501\uB2C8\uB2E4. \uD0A4\uB294 \uC790\uC0B0 \uB9E4\uD551/\uB9AC\uBC84\uC2A4 \uC178\uC774 \uD544\uC694\uD560 \uB54C\uB9CC \uCC44\uC6C1\uB2C8\uB2E4."
        ),
        h2(
          "div",
          {
            className: "rt-card",
            style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.6 }
          },
          h2(
            "div",
            { style: { fontWeight: 600, marginBottom: 6 } },
            "\uC804\uCCB4 \uD3F4\uB354 \u2192 \uB3C4\uAD6C \uC790\uB3D9 \uD560\uB2F9"
          ),
          h2(
            "div",
            { style: { marginBottom: 8, opacity: 0.9 } },
            "\uB3C4\uAD6C\uAC00 \uBAA8\uB450 \uAC19\uC740 \uD3F4\uB354(\uD558\uC704 \uB514\uB809\uD130\uB9AC \uD3EC\uD568)\uC5D0 \uC788\uB2E4\uBA74 \uACBD\uB85C\uB97C \uCC44\uC6B0\uACE0 \u201C\uC790\uB3D9 \uD560\uB2F9\u201D\uC744 \uB204\uB974\uC138\uC694: toolkitDir \uC5D0 \uAE30\uB85D\uB418\uACE0, \uD30C\uC77C \uC774\uB984\uC73C\uB85C nmap / nuclei / fscan \uB4F1\uC744 \uB9E4\uCE6D\uD574 \uC544\uB798\uC5D0 \uCC44\uC6C1\uB2C8\uB2E4."
          ),
          h2(
            "div",
            { style: { display: "flex", gap: 8, alignItems: "center" } },
            h2("input", {
              className: "rt-input",
              style: { flex: 1 },
              placeholder: "\uC608: D:\\pentest-tools \uB610\uB294 /opt/toolkit",
              value: folderPath,
              onChange: (e) => setFolderPath(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") assignFolder();
              }
            }),
            h2(
              "button",
              {
                className: "rt-btn rt-btn-primary",
                disabled: busy,
                onClick: assignFolder
              },
              busy ? "\uC2A4\uCE94 \uC911\u2026" : "\uC790\uB3D9 \uD560\uB2F9"
            )
          )
        ),
        data && data.hint ? h2(
          "div",
          {
            className: "rt-card",
            style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.6 }
          },
          data.hint
        ) : null,
        data && data.egress ? h2(
          "div",
          {
            className: "rt-card",
            style: { margin: "0 0 8px", fontSize: 12, lineHeight: 1.55 }
          },
          h2(
            "div",
            { style: { fontWeight: 600, marginBottom: 6 } },
            "\uC678\uBD80 \uD1B5\uC2E0 \uC0C1\uD0DC(Z3r0 egress \uCC38\uACE0, \uC77D\uAE30 \uC804\uC6A9)"
          ),
          h2(
            "div",
            { className: "rt-mono", style: { fontSize: 11 } },
            "HTTP_PROXY=" + (data.egress.http_proxy || "(\uBE44\uC5B4 \uC788\uC74C)")
          ),
          h2(
            "div",
            { className: "rt-mono", style: { fontSize: 11 } },
            "HTTPS_PROXY=" + (data.egress.https_proxy || "(\uBE44\uC5B4 \uC788\uC74C)")
          ),
          h2(
            "div",
            { className: "rt-mono", style: { fontSize: 11 } },
            "ALL_PROXY=" + (data.egress.all_proxy || "(\uBE44\uC5B4 \uC788\uC74C)")
          ),
          h2(
            "div",
            { className: "rt-mono", style: { fontSize: 11 } },
            "NO_PROXY=" + (data.egress.no_proxy || "(\uBE44\uC5B4 \uC788\uC74C)")
          ),
          h2(
            "div",
            { style: { marginTop: 6, opacity: 0.85 } },
            data.egress.note || ""
          )
        ) : null,
        !draft ? h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026") : h2(
          "div",
          null,
          h2(
            "div",
            { className: "rt-card" },
            h2("h4", null, "\uD50C\uB7AB\uD3FC\uACFC \uB514\uB809\uD130\uB9AC"),
            h2(
              "div",
              { style: { display: "grid", gap: 8 } },
              h2(
                "label",
                { style: { fontSize: 12 } },
                "\uD50C\uB7AB\uD3FC \uBAA8\uB4DC",
                h2(
                  "select",
                  {
                    className: "rt-input",
                    style: {
                      display: "block",
                      width: "100%",
                      marginTop: 4
                    },
                    value: draft.platform,
                    onChange: (e) => setDraft(
                      Object.assign({}, draft, {
                        platform: e.target.value
                      })
                    )
                  },
                  h2(
                    "option",
                    { value: "auto" },
                    "auto(\uC774 PC \uB97C \uB530\uB984, \uAE30\uBCF8)"
                  ),
                  h2("option", { value: "windows" }, "windows"),
                  h2("option", { value: "linux" }, "linux")
                )
              ),
              h2(
                "label",
                { style: { fontSize: 12 } },
                "\uD234\uD0B7 \uB514\uB809\uD130\uB9AC toolkitDir(\uBE44\uC6B0\uBA74 \uAE30\uBCF8\uAC12)",
                h2("input", {
                  className: "rt-input",
                  style: { display: "block", width: "100%", marginTop: 4 },
                  placeholder: "\uAE30\uBCF8: " + defaultToolkit,
                  value: draft.toolkitDir,
                  onChange: (e) => setDraft(
                    Object.assign({}, draft, {
                      toolkitDir: e.target.value
                    })
                  )
                })
              ),
              h2(
                "label",
                { style: { fontSize: 12 } },
                "nuclei \uD15C\uD50C\uB9BF \uB514\uB809\uD130\uB9AC(\uBE44\uC6B0\uBA74 \uC790\uB3D9: toolkit/nuclei-templates)",
                h2("input", {
                  className: "rt-input",
                  style: { display: "block", width: "100%", marginTop: 4 },
                  placeholder: "\uAE30\uBCF8: " + defaultNuclei,
                  value: draft.nucleiTemplatesDir,
                  onChange: (e) => setDraft(
                    Object.assign({}, draft, {
                      nucleiTemplatesDir: e.target.value
                    })
                  )
                })
              ),
              h2(
                "label",
                { style: { fontSize: 12 } },
                "\uB3C4\uAD6C \uAC80\uC0C9 \uB514\uB809\uD130\uB9AC binDirs(\uBE44\uC6B0\uBA74 toolkit + PATH \uB9CC \uAC80\uC0C9, \uD55C \uC904\uC5D0 \uD558\uB098)",
                h2("textarea", {
                  className: "rt-input",
                  rows: 4,
                  style: {
                    display: "block",
                    width: "100%",
                    marginTop: 4,
                    fontFamily: "var(--dsw-font-mono, monospace)"
                  },
                  placeholder: "\uC120\uD0DD \uC0AC\uD56D. \uC608: " + String.fromCharCode(10) + "D:\\tools" + String.fromCharCode(10) + "D:\\pentest-bin",
                  value: draft.binDirsText,
                  onChange: (e) => setDraft(
                    Object.assign({}, draft, {
                      binDirsText: e.target.value
                    })
                  )
                })
              )
            )
          ),
          h2(
            "div",
            { className: "rt-card" },
            h2(
              "h4",
              null,
              "\uD0A4\uC640 VPS(\uBE44\uC6B0\uBA74 \uB36E\uC5B4\uC4F0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4, \uD504\uB85C\uC138\uC2A4 \uD658\uACBD \uBCC0\uC218 \uC6B0\uC120)"
            ),
            h2(
              "div",
              { style: { display: "grid", gap: 8 } },
              ["FOFA_KEY", "REDTEAM_VPS_HOST", "REDTEAM_VPS_KEY"].map(
                (k) => h2(
                  "label",
                  { key: k, style: { fontSize: 12 } },
                  k + "(\uC120\uD0DD)",
                  h2("input", {
                    className: "rt-input",
                    style: {
                      display: "block",
                      width: "100%",
                      marginTop: 4
                    },
                    type: k === "FOFA_KEY" ? "password" : "text",
                    placeholder: k === "REDTEAM_VPS_KEY" ? "\uBE44\uC6CC \uB450\uC138\uC694; \uD544\uC694\uD560 \uB54C \uAC1C\uC778 \uD0A4 \uC808\uB300 \uACBD\uB85C\uB97C \uCC44\uC6B0\uC138\uC694" : k === "REDTEAM_VPS_HOST" ? "\uBE44\uC6CC \uB450\uC138\uC694; \uD544\uC694\uD560 \uB54C user@host \uB97C \uCC44\uC6B0\uC138\uC694" : "\uBE44\uC6CC \uB450\uC138\uC694; \uC790\uC0B0 \uB9E4\uD551 \uB54C \uCC44\uC6B0\uC138\uC694",
                    value: draft.env && draft.env[k] || "",
                    onChange: (e) => setEnv(k, e.target.value)
                  })
                )
              )
            )
          ),
          h2(
            "div",
            { className: "rt-card" },
            h2("h4", null, "\uB3C4\uAD6C \uC2E4\uD589 \uD30C\uC77C(\uBE44\uC6B0\uBA74 \uC790\uB3D9 \uD0D0\uC0C9)"),
            h2(
              "div",
              {
                style: {
                  fontSize: 11.5,
                  color: "var(--dsw-alias-label-secondary)",
                  marginBottom: 8
                }
              },
              "\uD0D0\uC0C9 \uC21C\uC11C: \uC774 \uD45C\uC758 \uC808\uB300 \uACBD\uB85C \u2192 toolkitDir \u2192 binDirs \u2192 PATH. \uBE44\uC6B0\uBA74 \uAE30\uBCF8 \uD0D0\uC0C9\uC744 \uC501\uB2C8\uB2E4."
            ),
            tools.map(
              (t) => h2(
                "div",
                { key: t.id, style: { marginBottom: 8 } },
                h2(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 4
                    }
                  },
                  h2(
                    "span",
                    { style: { fontWeight: 600, minWidth: 88 } },
                    t.label || t.id
                  ),
                  t.path ? h2(
                    "span",
                    { className: "rt-tag rt-tag-live", title: t.path },
                    t.source + " \xB7 \uCC3E\uC74C"
                  ) : h2(
                    "span",
                    { className: "rt-tag rt-tag-warn" },
                    "\uCC3E\uC9C0 \uBABB\uD568(\uBE44\uC6CC \uB450\uACE0 \uC124\uCE58\uB97C \uAE30\uB2E4\uB824\uB3C4 \uB429\uB2C8\uB2E4)"
                  )
                ),
                h2("input", {
                  className: "rt-input",
                  style: { width: "100%" },
                  placeholder: "\uBE44\uC6B0\uBA74 \uC790\uB3D9 \uD0D0\uC0C9: " + (t.names || []).slice(0, 3).join(" / "),
                  value: draft.tools && draft.tools[t.id] || "",
                  onChange: (e) => setTool(t.id, e.target.value)
                }),
                t.path ? h2(
                  "div",
                  {
                    className: "rt-mono",
                    style: {
                      fontSize: 10.5,
                      marginTop: 2,
                      opacity: 0.8
                    }
                  },
                  t.path
                ) : null
              )
            )
          ),
          h2(
            "div",
            { className: "rt-card" },
            h2("h4", null, "\uBE44\uACE0"),
            h2("textarea", {
              className: "rt-input",
              rows: 3,
              style: { width: "100%" },
              placeholder: "\uC120\uD0DD \uC0AC\uD56D. \uC608: \uB3C4\uAD6C\uB294 \u25CB\u25CB \uD3EC\uD130\uBE14 \uD328\uD0A4\uC9C0\uC5D0\uC11C \uAC00\uC838\uC634",
              value: draft.notes,
              onChange: (e) => setDraft(
                Object.assign({}, draft, { notes: e.target.value })
              )
            })
          ),
          h2(
            "div",
            { className: "rt-foot" },
            h2(
              "span",
              null,
              "\uC124\uC815 \uD30C\uC77C: " + (data && data.config && data.config.path || "$DSH_HOME/redteam/config.json") + " | \uBE44\uC6B4 \uD544\uB4DC\uB294 \uBAA8\uB450 \uAE30\uBCF8\uAC12\uC744 \uC501\uB2C8\uB2E4"
            )
          )
        )
      )
    );
  }
  function ScoreTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const [openId, setOpenId] = import_react2.default.useState(null);
    const [form, setForm] = import_react2.default.useState(null);
    const [msg, setMsg] = import_react2.default.useState(null);
    const load = () => {
      if (!eng) return;
      setBusy(true);
      api({ op: "scores", engagement: eng }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => {
          setBusy(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    import_react2.default.useEffect(load, [eng, refreshKey]);
    const startEdit = (p) => setForm({
      id: p.id,
      name: p.name,
      category: p.category || "",
      points: p.points,
      description: p.description || "",
      enabled: p.enabled,
      builtin: p.builtin === true,
      src: p.src,
      cap: p.cap,
      rule: p.rule
    });
    const startNew = () => {
      setForm({
        name: "",
        category: "",
        points: 10,
        description: "",
        enabled: true,
        builtin: false
      });
      setMsg(null);
    };
    const setField = (k, v) => setForm((f) => Object.assign({}, f, { [k]: v }));
    const save = () => {
      if (!form || !form.name) {
        setMsg({ err: "\uC774\uB984\uC740 \uBE44\uC6B8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
        return;
      }
      setBusy(true);
      setMsg(null);
      api({ op: "saveScorePoint", engagement: eng, point: form }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC800\uC7A5 \uC2E4\uD328" });
            return;
          }
          if (r.overridden === false) {
            setMsg({
              err: "\u201C\uD65C\uC131/\uBE44\uD65C\uC131\u201D\uB9CC \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uC810\uC218\uB294 \uBC14\uB00C\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4: \u201C\uB4DD\uC810 \uADDC\uCE59\u201D\uACFC \uD568\uAED8 \uBC30\uD3EC\uB418\uB294 \uB0B4\uC7A5 \uB4DD\uC810 \uD56D\uBAA9\uC774\uB77C, \uC810\uC218 / \uC0C1\uD55C / \uC9D1\uACC4 \uAE30\uC900\uC744 \uADDC\uCE59\uC774 \uACE0\uC815\uD569\uB2C8\uB2E4(\uAC19\uC740 \uADDC\uCE59\uC758 \uC0C1\uD55C\uC740 \uADF8\uB8F9 \uB0B4 \uBAA8\uB4E0 \uB4DD\uC810 \uD56D\uBAA9\uC744 \uD569\uC0B0\uD558\uBBC0\uB85C, \uC810\uC218 \uD558\uB098\uB9CC \uBC14\uAFB8\uBA74 \uC801\uC911 \uD55C \uAC74\uC774 \uADF8\uB8F9 \uC0C1\uD55C\uC744 \uB2E4 \uBA39\uC5B4 \uBC84\uB9BD\uB2C8\uB2E4). \uC810\uC218\uB97C \uB530\uB85C \uC815\uD558\uB824\uBA74 \u201C+ \uB4DD\uC810 \uD56D\uBAA9 \uCD94\uAC00\u201D\uB97C \uC4F0\uC138\uC694."
            });
          } else {
            setMsg({ ok: r.note || "\uC800\uC7A5\uB428" });
          }
          setForm(null);
          load();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
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
            setMsg({ err: r && r.error || "\uC0AD\uC81C \uC2E4\uD328" });
            return;
          }
          setMsg({ ok: "\uC0AD\uC81C\uB428" });
          setForm(null);
          setOpenId(null);
          load();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const summary = data && data.summary || {
      achievedPoints: 0,
      pointCount: 0,
      hitPointCount: 0,
      hitCount: 0,
      selfCreatedHits: 0,
      serviceCappedHits: 0
    };
    const items = data && data.items || [];
    const groups = data && data.ruleGroups && data.ruleGroups.length ? data.ruleGroups : [
      {
        key: "all",
        name: "",
        capSum: 0,
        points: 0,
        counted: 0,
        tiers: items
      }
    ];
    const rows = [];
    for (const g of groups) {
      if (g.name) {
        rows.push(
          h2(
            "div",
            { key: "g-" + g.key, className: "rt-score-group" },
            h2("span", null, g.name),
            h2(
              "span",
              { className: "rt-sg-sub" },
              g.tiers.length + "\uAC1C" + (g.capSum > 0 ? " \xB7 \uD56D\uBAA9\uBCC4 \uC0C1\uD55C \uD569\uACC4 " + g.capSum + "\uC810(\uD56D\uBAA9\uBCC4\uB85C \uB3C5\uB9BD\uC774\uBA70 \uD56D\uBAA9 \uAC04 \uB204\uC801 \uC5C6\uC74C)" : "")
            ),
            h2("div", { className: "rt-spacer" }),
            g.points > 0 ? h2(
              "span",
              { className: "rt-tag rt-tag-active" },
              "+" + g.points + "\uC810"
            ) : null
          )
        );
      }
      for (const p of g.tiers) {
        const achieved = p.hits.length > 0;
        const open = openId === p.id;
        rows.push(
          h2(
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
              }
            },
            h2("span", { className: "rt-sec-caret" }, open ? "\u25BE" : "\u25B8"),
            h2(
              "span",
              null,
              h2(
                "span",
                {
                  className: achieved ? "rt-pri rt-pri-high" : "rt-pri rt-pri-low",
                  style: achieved ? {} : {
                    background: "var(--dsw-alias-bg-layer-2)",
                    color: "var(--dsw-alias-label-secondary)"
                  }
                },
                p.points + "\uC810"
              )
            ),
            h2(
              "span",
              { title: p.description || "" },
              p.name,
              p.tier ? h2("span", { className: "rt-scope" }, " " + p.tier) : null
            ),
            /* 적중과 상한: 이 항목이 몇 번 집계되었고 상한을 얼마나 썼는지(G3 항목별 상한은 독립이며, 상한에 닿으면 더 누적하지 않는다) */
            h2(
              "span",
              {
                title: p.capped > 0 ? "\uCD1D " + p.counted + "\uD68C \uC9D1\uACC4\uB418\uC5C8\uACE0, \uADF8 \uBC16\uC5D0 " + p.capped + "\uAC74\uC740 \u201C" + (p.scope_label || "\uC9D1\uACC4 \uAE30\uC900") + "\u201D \uB610\uB294 \uC0C1\uD55C \uB3C4\uB2EC\uB85C \uBBF8\uC9D1\uACC4" : p.scope_label || ""
              },
              h2(
                "span",
                { className: "rt-sec-count" },
                p.hits.length > 0 ? p.counted + "\uD68C \uC801\uC911" : "\uC801\uC911 \uC5C6\uC74C"
              ),
              p.cap > 0 ? h2(
                "span",
                { className: "rt-scope" },
                " \uC0C1\uD55C " + (p.cap_used === null ? 0 : p.cap_used) + "/" + p.cap
              ) : null
            ),
            h2(
              "span",
              { style: { textAlign: "right" } },
              p.earned > 0 ? h2(
                "span",
                { className: "rt-tag rt-tag-active" },
                "+" + p.earned + "\uC810"
              ) : h2(
                "span",
                { style: { color: "var(--dsw-alias-label-secondary)" } },
                "\u2014"
              )
            )
          )
        );
        if (!open) continue;
        const hitNodes = p.hits.map(
          (hh, hi) => h2(
            "div",
            {
              key: "h" + hh.id,
              className: "rt-hit-row" + (hh.self_created ? " self-created" : "") + (hh.capped ? " service-capped" : "")
            },
            h2("span", { className: "rt-hit-idx" }, String(hi + 1)),
            h2(
              "span",
              {
                className: "rt-hit-asset",
                title: hh.target || hh.asset_ip || ""
              },
              hh.asset_ip || hh.target || "\uC790\uC0B0 \uBBF8\uC9C0\uC815"
            ),
            hh.self_created ? h2(
              "span",
              {
                className: "rt-tag rt-tag-warn",
                title: "\uC9C1\uC811 \uB4F1\uB85D/\uC790\uCCB4 \uC0DD\uC131\uD55C \uACC4\uC815\uC740 \uB4DD\uC810 \uAD8C\uD55C\uC73C\uB85C \uCE58\uC9C0 \uC54A\uACE0 \uACFC\uC815 \uAE30\uB85D\uC73C\uB85C\uB9CC \uB0A8\uAE41\uB2C8\uB2E4"
              },
              "\uC790\uCCB4 \uC0DD\uC131 \xB7 \uBBF8\uC9D1\uACC4"
            ) : null,
            hh.capped ? h2(
              "span",
              {
                className: "rt-tag rt-tag-warn",
                title: hh.capped_reason || "\uAC19\uC740 \uC790\uC0B0\xB7\uAC19\uC740 \uD3EC\uD2B8\uC5D0\uC11C\uB294 \uC810\uC218\uAC00 \uAC00\uC7A5 \uB192\uC740 \uD55C \uAC74\uB9CC \uC778\uC815\uD558\uBA70, \uC774 \uAC74\uC740 \uBBF8\uC9D1\uACC4\uC785\uB2C8\uB2E4"
              },
              "\uC11C\uBE44\uC2A4 \uC0C1\uD55C \uB3C4\uB2EC \xB7 \uBBF8\uC9D1\uACC4" + (hh.service ? "(" + hh.service + ")" : "")
            ) : null,
            hh.shot_count ? h2(
              "span",
              {
                className: "rt-tag",
                title: "\uC774 \uC801\uC911\uC5D0\uB294 \uC99D\uAC70 \uC2A4\uD06C\uB9B0\uC0F7\uC774 \uC788\uC2B5\uB2C8\uB2E4(\uB4DD\uC810 \uD56D\uBAA9\uC744 \uD3BC\uCE58\uBA74 \uB300\uD45C \uC774\uBBF8\uC9C0\uAC00 \uBCF4\uC785\uB2C8\uB2E4)"
              },
              "\uC774\uBBF8\uC9C0 " + hh.shot_count
            ) : null,
            h2("span", { className: "rt-hit-time" }, fmt(hh.recorded_at)),
            h2(
              "button",
              {
                className: "rt-btn",
                style: { padding: "0 5px", fontSize: 10.5 },
                title: "\uC774 \uAC74 \uBCF5\uC0AC",
                onClick: (e) => {
                  e.stopPropagation();
                  copyText(
                    (hh.asset_ip || hh.target || "") + "  " + (hh.evidence || "")
                  );
                }
              },
              "\uBCF5\uC0AC"
            ),
            hh.evidence ? h2(
              "span",
              { className: "rt-hit-txt", title: hh.evidence },
              String(hh.evidence).replace(/\n+/g, " ")
            ) : h2(
              "span",
              { className: "rt-hit-txt none" },
              "\uACC4\uC815/\uBE44\uBC00\uBC88\uD638 \uB610\uB294 \uACB0\uACFC \uBBF8\uAE30\uC7AC"
            )
          )
        );
        rows.push(
          h2(
            "div",
            {
              key: "spd" + p.id,
              className: "rt-score-row",
              style: { cursor: "default", gridTemplateColumns: "1fr" }
            },
            h2(
              "div",
              { className: "rt-score-detail" },
              p.description ? h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uB4DD\uC810 \uC870\uAC74"),
                h2("span", null, p.description)
              ) : null,
              h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uC0C1\uD0DC"),
                h2(
                  "span",
                  null,
                  (p.enabled ? "\uD65C\uC131" : "\uBE44\uD65C\uC131") + " \xB7 " + p.points + "\uC810/\uD68C \xB7 \uC801\uC911 " + p.hits.length + "\uD68C = " + p.earned + "\uC810" + (p.self_created ? "(\uADF8 \uBC16\uC5D0 \uC790\uCCB4 \uC0DD\uC131 " + p.self_created + "\uD68C\uB294 \uBBF8\uC9D1\uACC4)" : "") + (p.capped ? "(\uADF8 \uBC16\uC5D0 \uAC19\uC740 \uC11C\uBE44\uC2A4 \uC911\uBCF5 \uC801\uC911 " + p.capped + "\uD68C\uB294 \uBBF8\uC9D1\uACC4)" : "")
                )
              ),
              p.capped ? h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uC11C\uBE44\uC2A4 \uC0C1\uD55C"),
                h2(
                  "span",
                  null,
                  p.service_summary + "; \uACC4\uC815 \uAD8C\uD55C\uACFC \uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uAD8C\uD55C\uC740 \u201C\uAC19\uC740 \uC790\uC0B0\xB7\uAC19\uC740 \uD3EC\uD2B8\u201D \uAE30\uC900\uC73C\uB85C \uD55C \uBC88\uB9CC \uC778\uC815\uD558\uBA70, \uCD5C\uACE0 \uAD8C\uD55C \uACC4\uC815\uC744 \uC5BB\uC740 \uC2DC\uC810\uC5D0 \uADF8 \uC11C\uBE44\uC2A4\uB294 \uC0C1\uD55C \uB3C4\uB2EC\uC785\uB2C8\uB2E4"
                )
              ) : null,
              p.hits.length ? h2(
                "div",
                null,
                h2(ShotStrip, {
                  eng,
                  shots: p.shots,
                  total: p.shot_total,
                  title: "\uC99D\uAC70 \uC2A4\uD06C\uB9B0\uC0F7 \xB7 " + (p.shot_total || (p.shots || []).length) + "\uC7A5"
                }),
                h2(
                  "div",
                  {
                    className: "rt-section",
                    style: { padding: "6px 0 0" }
                  },
                  "\uC801\uC911 \uAE30\uB85D \xB7 " + p.hits.length + "(\uC790\uC0B0\uACFC \uACC4\uC815/\uBE44\uBC00\uBC88\uD638\uB9CC \uAE30\uB85D\uD558\uBA70, \uC0C1\uC138 \uC7AC\uD604\uC740 \uBCF4\uACE0\uC11C\uC5D0\uC11C \uBD05\uB2C8\uB2E4)"
                ),
                h2("div", { className: "rt-hits" }, hitNodes)
              ) : h2(
                "div",
                { className: "rt-kv" },
                h2("b", null, "\uC801\uC911 \uAE30\uB85D"),
                h2(
                  "span",
                  { style: { color: "var(--dsw-alias-label-secondary)" } },
                  "\uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4 \u2014 \uC131\uACFC\uB97C \uC5BB\uC740 \uB4A4 redteam_score_hit \uB85C \uB4DD\uC810\uC744 \uAE30\uB85D\uD558\uC138\uC694: \uB300\uC0C1 \uC790\uC0B0 + \uC5BB\uC740 \uACC4\uC815/\uBE44\uBC00\uBC88\uD638 \uB610\uB294 \uAD8C\uD55C\uC744 \uC801\uC73C\uC138\uC694"
                )
              ),
              h2(
                "div",
                { className: "rt-actions" },
                h2(
                  "button",
                  {
                    className: "rt-btn",
                    onClick: (e) => {
                      e.stopPropagation();
                      startEdit(p);
                    }
                  },
                  "\uD3B8\uC9D1"
                )
              )
            )
          )
        );
      }
    }
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uB4DD\uC810 \uBAA9\uD45C"),
        /* 얻은 총점만 표시하고, 목표 점수나 진행 막대는 표시하지 않는다 */
        h2(
          "span",
          {
            style: {
              fontSize: 13,
              color: "var(--dsw-alias-label-secondary)",
              marginLeft: 4
            }
          },
          "\uCD1D\uC810"
        ),
        h2("span", { className: "rt-total" }, String(summary.achievedPoints)),
        h2(
          "span",
          {
            style: { fontSize: 13, color: "var(--dsw-alias-label-secondary)" }
          },
          "\uC810"
        ),
        h2("span", { className: "rt-tag" }, summary.pointCount + "\uAC1C \uB4DD\uC810 \uD56D\uBAA9"),
        h2(
          "span",
          { className: "rt-tag" },
          "\uC801\uC911 " + summary.countedHits + "\uD68C"
        ),
        summary.selfCreatedHits ? h2(
          "span",
          {
            className: "rt-tag rt-tag-warn",
            title: "\uC9C1\uC811 \uB4F1\uB85D/\uC9C1\uC811 \uC0DD\uC131\uD55C \uACC4\uC815\uC740 \uB4DD\uC810 \uAD8C\uD55C\uC73C\uB85C \uCE58\uC9C0 \uC54A\uACE0 \uACFC\uC815 \uAE30\uB85D\uC73C\uB85C\uB9CC \uB0A8\uAE41\uB2C8\uB2E4(\uBBF8\uC9D1\uACC4, \uC0C1\uD55C \uBBF8\uC18C\uBAA8, \uBCF4\uACE0\uC11C \uBBF8\uD3EC\uD568)"
          },
          "\uC790\uCCB4 \uC0DD\uC131 \uBBF8\uC9D1\uACC4 " + summary.selfCreatedHits
        ) : null,
        summary.serviceCappedHits ? h2(
          "span",
          {
            className: "rt-tag rt-tag-warn",
            title: "\uACC4\uC815 \uAD8C\uD55C\uACFC \uB370\uC774\uD130\uBCA0\uC774\uC2A4 \uAD8C\uD55C\uC740 \u201C\uAC19\uC740 \uC790\uC0B0\xB7\uAC19\uC740 \uD3EC\uD2B8\u201D \uAE30\uC900\uC73C\uB85C \uD55C \uBC88\uB9CC \uC778\uC815\uD569\uB2C8\uB2E4: \uD574\uB2F9 \uC11C\uBE44\uC2A4\uB294 \uC774\uBBF8 \uC0C1\uD55C \uB3C4\uB2EC\uC774\uBA70 \uC774 \uC911\uBCF5 \uC801\uC911\uC740 \uBBF8\uC9D1\uACC4\uC785\uB2C8\uB2E4(\uD754\uC801\uB9CC \uB0A8\uAE41\uB2C8\uB2E4)"
          },
          "\uC11C\uBE44\uC2A4 \uC0C1\uD55C \uB3C4\uB2EC \uBBF8\uC9D1\uACC4 " + summary.serviceCappedHits
        ) : null,
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          { className: "rt-btn", onClick: startNew },
          "+ \uB4DD\uC810 \uD56D\uBAA9 \uCD94\uAC00"
        ),
        h2(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "\uC0C8\uB85C\uACE0\uCE68 \uC911\u2026" : "\uC0C8\uB85C\uACE0\uCE68"
        )
      ),
      msg ? h2(
        "div",
        { className: msg.err ? "rt-err" : "rt-foot" },
        msg.err || msg.ok
      ) : null,
      err ? h2("div", { className: "rt-err" }, err) : null,
      form ? h2(
        "div",
        {
          className: "rt-pane",
          style: {
            flex: "none",
            borderBottom: "1px solid var(--dsw-alias-border-l1)"
          }
        },
        /* 내장 득점 항목(builtin): 점수 / 이름 / 분류는 “득점 규칙”이 고정하므로 입력란을 회색 처리한다.
          바꿀 수 있는 것은 “활성 / 비활성”뿐이다. 이렇게 하면 "수정 후 저장됨 안내가 뜨고 새로고침하면 되돌아가는" 혼란이 생기지 않는다. */
        form.builtin ? h2(
          "div",
          { className: "rt-hint", style: { marginBottom: 8 } },
          h2(
            "b",
            null,
            "\uB0B4\uC7A5 \uB4DD\uC810 \uD56D\uBAA9(\u201C\uB3CC\uD30C \uCE68\uD22C\uB958 \uB4DD\uC810 \uADDC\uCE59(\uBCD1\uD569\uD310)\u201D\uC5D0\uC11C \uC634)"
          ),
          h2(
            "div",
            { style: { marginTop: 3 } },
            "\uC810\uC218, \uC0C1\uD55C, \uC9D1\uACC4 \uAE30\uC900, \uC774\uB984\uC744 \uADDC\uCE59\uC774 \uACE0\uC815\uD569\uB2C8\uB2E4 \u2014 \uAC19\uC740 \uADDC\uCE59\uC758 \uC0C1\uD55C\uC740 \uADF8\uB8F9 \uB0B4 \uBAA8\uB4E0 \uB4DD\uC810 \uD56D\uBAA9\uC744 \uD569\uC0B0\uD558\uBBC0\uB85C, \uC810\uC218 \uD558\uB098\uB9CC \uBC14\uAFB8\uBA74 \uC801\uC911 \uD55C \uAC74\uC774 \uADF8\uB8F9 \uC0C1\uD55C\uC744 \uB2E4 \uBA39\uC5B4 \uBC84\uB9BD\uB2C8\uB2E4. \uC5EC\uAE30\uC11C \uBC14\uAFC0 \uC218 \uC788\uB294 \uAC83\uC740 \u201C\uD65C\uC131 / \uBE44\uD65C\uC131\u201D\uC774\uBA70, \uC810\uC218\uB97C \uB530\uB85C \uC815\uD558\uB824\uBA74 \uC774\uC804 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC00 \u201C+ \uB4DD\uC810 \uD56D\uBAA9 \uCD94\uAC00\u201D\uB97C \uB204\uB974\uC138\uC694."
          ),
          form.src !== null && form.src !== void 0 ? h2(
            "div",
            {
              style: {
                marginTop: 3,
                color: "var(--dsw-alias-label-secondary)"
              }
            },
            "\uADDC\uCE59 \uC6D0\uBB38 \uBC88\uD638 " + form.src + (form.rule ? " \xB7 \uC0C1\uD55C \uADF8\uB8F9 rule=" + form.rule : "") + (form.cap > 0 ? " \xB7 \uC0C1\uD55C " + form.cap + "\uC810" : " \xB7 \uC0C1\uD55C \uC5C6\uC74C")
          ) : null
        ) : null,
        h2(
          "div",
          { className: "rt-score-form" },
          h2("input", {
            className: "rt-input",
            placeholder: "\uC774\uB984(\uD544\uC218)",
            value: form.name,
            readOnly: form.builtin === true,
            title: form.builtin ? "\uB0B4\uC7A5 \uB4DD\uC810 \uD56D\uBAA9\uC758 \uC774\uB984\uC740 \uADDC\uCE59\uC774 \uACE0\uC815\uD569\uB2C8\uB2E4" : "",
            onChange: (e) => setField("name", e.target.value)
          }),
          h2("input", {
            className: "rt-input",
            placeholder: "\uBD84\uB958, \uC608: \uACC4\uC815 \uAD8C\uD55C",
            value: form.category,
            readOnly: form.builtin === true,
            title: form.builtin ? "\uB0B4\uC7A5 \uB4DD\uC810 \uD56D\uBAA9\uC758 \uBD84\uB958\uB294 \uADDC\uCE59\uC774 \uACE0\uC815\uD569\uB2C8\uB2E4(\uD328\uB110\uC5D0\uC11C \uC5B4\uB290 \uADF8\uB8F9\uC5D0 \uC18D\uD558\uB294\uC9C0\uB97C \uACB0\uC815\uD569\uB2C8\uB2E4)" : "",
            onChange: (e) => setField("category", e.target.value)
          }),
          h2("input", {
            className: "rt-input",
            type: "number",
            placeholder: "1\uD68C \uC810\uC218",
            readOnly: form.builtin === true,
            title: form.builtin ? "\uB0B4\uC7A5 \uB4DD\uC810 \uD56D\uBAA9\uC758 \uC810\uC218\uB294 \u201C\uB4DD\uC810 \uADDC\uCE59\u201D\uC774 \uACE0\uC815\uD558\uBBC0\uB85C \uC5EC\uAE30\uC11C \uBC14\uAFC0 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" : "\uC774 \uBD84\uB958\uC758 1\uD68C \uC810\uC218; \uC801\uC911\uD560 \uB54C\uB9C8\uB2E4 \uC774 \uC810\uC218\uB9CC\uD07C \uB204\uC801\uB429\uB2C8\uB2E4(\uD574\uB2F9 \uADDC\uCE59 \uC0C1\uD55C\uC758 \uC81C\uC57D\uC744 \uBC1B\uC2B5\uB2C8\uB2E4)",
            value: form.points,
            onChange: (e) => setField("points", Number(e.target.value))
          }),
          h2(
            "select",
            {
              className: "rt-input",
              value: form.enabled ? "1" : "0",
              onChange: (e) => setField("enabled", e.target.value === "1")
            },
            h2("option", { value: "1" }, "\uD65C\uC131"),
            h2("option", { value: "0" }, "\uBE44\uD65C\uC131")
          )
        ),
        h2("input", {
          className: "rt-input",
          style: {
            width: "100%",
            marginBottom: 6,
            boxSizing: "border-box"
          },
          placeholder: "\uB4DD\uC810 \uC870\uAC74 \uC124\uBA85",
          value: form.description,
          readOnly: form.builtin === true,
          title: form.builtin ? "\uB0B4\uC7A5 \uB4DD\uC810 \uD56D\uBAA9\uC758 \uC870\uD56D \uBCF8\uBB38\uC740 \uADDC\uCE59\uC774 \uACE0\uC815\uD569\uB2C8\uB2E4" : "",
          onChange: (e) => setField("description", e.target.value)
        }),
        h2(
          "div",
          { className: "rt-actions" },
          h2(
            "button",
            {
              className: "rt-btn rt-btn-primary",
              disabled: busy,
              onClick: save
            },
            "\uC800\uC7A5"
          ),
          form.id ? form.builtin ? h2(
            "button",
            {
              className: "rt-btn",
              disabled: true,
              title: "\uB0B4\uC7A5 \uB4DD\uC810 \uD56D\uBAA9\uC740 \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: \uC9C0\uC6B0\uBA74 \uD328\uB110\uC5D0\uC11C \uADDC\uCE59\uC774 \uD558\uB098 \uBE60\uC9C0\uACE0 \uBCF4\uACE0\uC11C\uC5D0\uC11C \uC131\uACFC \uD55C \uBD84\uB958\uAC00 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4(\uB2E4\uC74C \uC2DC\uC791 \uC2DC \uC790\uB3D9\uC73C\uB85C \uB418\uB3CC\uC544\uC635\uB2C8\uB2E4). \uC9D1\uACC4\uC5D0\uC11C \uBE7C\uB824\uBA74 \u201C\uBE44\uD65C\uC131\u201D\uC744 \uC4F0\uC138\uC694."
            },
            "\uC0AD\uC81C(\uB0B4\uC7A5 \uD56D\uBAA9\uC740 \uC0AD\uC81C \uBD88\uAC00)"
          ) : h2(
            "button",
            { className: "rt-btn", disabled: busy, onClick: remove },
            "\uC0AD\uC81C"
          ) : null,
          h2(
            "button",
            { className: "rt-btn", onClick: () => setForm(null) },
            "\uCDE8\uC18C"
          )
        )
      ) : null,
      h2(
        "div",
        { className: "rt-table" },
        h2(
          "div",
          { className: "rt-score-row head" },
          h2("span", null, ""),
          h2("span", null, "\uC810\uC218"),
          h2("span", null, "\uB4DD\uC810 \uD56D\uBAA9(\uC810\uC218 \uB0AE\uC740 \uC21C)"),
          h2("span", null, "\uC801\uC911 / \uC0C1\uD55C"),
          h2("span", { style: { textAlign: "right" } }, "\uD68D\uB4DD \uC810\uC218")
        ),
        rows,
        !items.length ? h2(
          "div",
          { className: "rt-empty" },
          "\uB4DD\uC810 \uD56D\uBAA9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC624\uB978\uCABD \uC704 \u201C+ \uB4DD\uC810 \uD56D\uBAA9 \uCD94\uAC00\u201D\uB97C \uB204\uB974\uC138\uC694"
        ) : null
      )
    );
  }
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
    }
  };
  function useCollapse(prefix) {
    const [state, setState] = import_react2.default.useState(() => collapseLoad(prefix));
    import_react2.default.useEffect(() => {
      setState(collapseLoad(prefix));
    }, [prefix]);
    const write = (next) => {
      collapseSave(prefix, next);
      setState(next);
    };
    const isOpen = (key, defaultOpen) => {
      const v = state[key];
      return v === void 0 ? defaultOpen !== false : v === true;
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
    return { isOpen, toggle, setAll };
  }
  function Section(props) {
    const always = props.always === true;
    const open = always || props.open === true;
    const head = h2(
      "div",
      {
        className: "rt-sec t-" + (props.tone || "target") + (always ? " flat" : ""),
        role: always ? void 0 : "button",
        tabIndex: always ? void 0 : 0,
        "aria-expanded": always ? void 0 : open ? "true" : "false",
        onClick: always ? void 0 : props.onToggle,
        onKeyDown: always ? void 0 : (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (props.onToggle) props.onToggle(e);
          }
        }
      },
      h2("span", { className: "rt-sec-caret" }, always ? "\u258D" : open ? "\u25BE" : "\u25B8"),
      props.title ? h2("span", { className: "rt-sec-title" }, props.title) : null,
      props.count !== void 0 && props.count !== null ? h2("span", { className: "rt-sec-count" }, String(props.count)) : null,
      props.sub ? h2("span", { className: "rt-sec-sub" }, props.sub) : null,
      props.right ? h2("span", { className: "rt-sec-right" }, props.right) : null
    );
    return h2(
      "div",
      { className: "rt-sec-wrap" },
      head,
      open && props.children ? h2("div", { className: "rt-sec-body" }, props.children) : null
    );
  }
  function Clip(props) {
    const [open, setOpen] = import_react2.default.useState(false);
    const text = String(
      props.text === void 0 || props.text === null ? "" : props.text
    );
    if (text.trim() === "") return null;
    return h2(
      "div",
      { className: "rt-clip" + (open ? " open" : "") },
      h2(
        "div",
        { className: "rt-clip-head" },
        props.label ? h2("span", { className: "rt-clip-label" }, props.label) : null,
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          {
            className: "rt-btn",
            style: { padding: "0 6px", fontSize: 11 },
            onClick: (e) => {
              e.stopPropagation();
              copyText(text);
            }
          },
          "\uBCF5\uC0AC"
        ),
        h2(
          "button",
          {
            className: "rt-btn",
            style: { padding: "0 6px", fontSize: 11 },
            onClick: (e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }
          },
          open ? "\uC811\uAE30" : "\uD3BC\uCE58\uAE30"
        )
      ),
      h2("div", { className: "rt-clip-body" }, text)
    );
  }
  const TEST_STATUS_LABEL = {
    untested: "\uBBF8\uD14C\uC2A4\uD2B8",
    testing: "\uD14C\uC2A4\uD2B8 \uC911",
    tested: "\uD14C\uC2A4\uD2B8 \uC644\uB8CC",
    blocked: "\uCC28\uB2E8\uB428",
    abandoned: "\uD3EC\uAE30",
    no_surface: "\uACF5\uACA9 \uD45C\uBA74 \uC5C6\uC74C"
  };
  function TestingTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [at, setAt] = import_react2.default.useState(null);
    const [auto, setAuto] = import_react2.default.useState(true);
    const collapse = useCollapse("testing:" + eng);
    const inflight = import_react2.default.useRef(false);
    const seq = import_react2.default.useRef(0);
    const load = () => {
      if (!eng || inflight.current) return;
      inflight.current = true;
      const my = ++seq.current;
      api({ op: "activeTests", engagement: eng, limit: 20 }).then(
        (r) => {
          if (my !== seq.current)
            return;
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setData(r);
          setAt(/* @__PURE__ */ new Date());
        },
        (e) => {
          if (my === seq.current) setErr(String(e && e.message || e));
        }
      ).finally(() => {
        if (my === seq.current) inflight.current = false;
      });
    };
    import_react2.default.useEffect(() => {
      seq.current += 1;
      load();
    }, [eng, refreshKey]);
    import_react2.default.useEffect(() => {
      if (!eng || !auto) return void 0;
      const timer = setInterval(load, 5e3);
      return () => clearInterval(timer);
    }, [eng, auto, refreshKey]);
    const testing = data && data.testing || [];
    const recent = data && data.recent || [];
    const queue = data && data.queue || [];
    const stats = data && data.stats || {};
    const card = (a, past) => {
      const chips = [];
      chips.push(
        h2(
          "span",
          {
            key: "sc",
            className: "rt-scope rt-scope-" + (a.scope === "internal" ? "internal" : "external")
          },
          a.scope === "internal" ? "\uB0B4\uBD80\uB9DD" : "\uC678\uBD80\uB9DD"
        )
      );
      if (a.segment_cidr)
        chips.push(
          h2("span", { key: "seg", className: "rt-tag" }, a.segment_cidr)
        );
      if (a.open_ports)
        chips.push(
          h2(
            "span",
            { key: "p", className: "rt-tag rt-tag-active" },
            "\uC5F4\uB9B0 \uD3EC\uD2B8 " + a.open_ports
          )
        );
      if (a.vulns)
        chips.push(
          h2(
            "span",
            { key: "v", className: "rt-tag rt-tag-live" },
            "\uD655\uC778\uB41C \uCDE8\uC57D\uC810 " + a.vulns
          )
        );
      if (a.webshells)
        chips.push(
          h2(
            "span",
            { key: "w", className: "rt-tag rt-tag-passive" },
            "WebShell " + a.webshells
          )
        );
      if (a.tunnels)
        chips.push(
          h2(
            "span",
            { key: "t", className: "rt-tag rt-tag-passive" },
            "\uD130\uB110 " + a.tunnels
          )
        );
      if (a.priority)
        chips.push(
          h2("span", { key: "pr", className: "rt-tag" }, "\uACF5\uB7B5 " + a.priority)
        );
      if (a.blocked_count)
        chips.push(
          h2(
            "span",
            {
              key: "b",
              className: "rt-tag",
              style: { color: "#ef4444", borderColor: "#ef444455" }
            },
            "\uCC28\uB2E8 " + a.blocked_count + "\uD68C"
          )
        );
      const noteLines = a.test_notes ? String(a.test_notes).split("\n").slice(-3).map((l) => l.length > 240 ? l.slice(0, 240) + " \u2026" : l) : [];
      return h2(
        "div",
        { key: "at" + a.id, className: "rt-atest" + (past ? " past" : "") },
        h2(
          "div",
          { className: "rt-atest-head" },
          past ? null : h2("span", { className: "rt-live-dot" }),
          h2("span", { className: "rt-atest-ip" }, a.ip),
          h2(
            "span",
            {
              className: "rt-tag " + (a.test_status === "testing" ? "rt-tag-live" : "")
            },
            TEST_STATUS_LABEL[a.test_status] || a.test_status
          ),
          h2("div", { className: "rt-spacer" }),
          h2(
            "span",
            {
              style: {
                fontSize: 11,
                color: "var(--dsw-alias-label-secondary)"
              }
            },
            fmt(a.test_updated_at) + (a.test_updated_by ? " \xB7 " + a.test_updated_by : "")
          )
        ),
        chips.length ? h2("div", null, chips) : null,
        a.test_surface ? h2(
          "div",
          { className: "rt-atest-meta" },
          "\uD14C\uC2A4\uD2B8 \uB300\uC0C1: " + a.test_surface
        ) : null,
        a.potential ? h2(
          "div",
          { className: "rt-atest-meta" },
          "\uC608\uC0C1 \uB4DD\uC810: " + a.potential
        ) : null,
        noteLines.length ? h2(Clip, { label: "\uD14C\uC2A4\uD2B8 \uAE30\uB85D", text: noteLines.join("\n") }) : null
      );
    };
    const concl = (label, value, tone) => h2(
      "span",
      { key: label, className: "rt-concl-i", style: { cursor: "default" } },
      h2("b", null, String(value || 0)),
      h2("span", null, label)
    );
    const conclusion = h2(
      "div",
      { className: "rt-concl" },
      concl("\uD14C\uC2A4\uD2B8 \uC911", stats.testing, "live"),
      concl("\uB300\uAE30", stats.untested, ""),
      concl("\uC644\uB8CC", stats.tested, ""),
      concl("\uD3EC\uAE30", (stats.abandoned || 0) + (stats.blocked || 0), ""),
      concl("\uACF5\uACA9 \uD45C\uBA74 \uC5C6\uC74C", stats.no_surface, ""),
      h2("div", { className: "rt-spacer" }),
      at ? h2(
        "span",
        {
          style: {
            fontSize: 11,
            color: "var(--dsw-alias-label-secondary)"
          }
        },
        "\uAC31\uC2E0 " + at.toLocaleTimeString("ko-KR", { hour12: false })
      ) : null,
      h2(
        "button",
        {
          className: "rt-btn",
          style: { padding: "0 7px", fontSize: 11 },
          title: "\uCD5C\uADFC \uBCC0\uB3D9\uACFC \uB300\uAE30 \uB300\uC5F4 \uD3BC\uCE58\uAE30",
          onClick: () => collapse.setAll(
            ["testing:" + eng, "recent:" + eng, "queue:" + eng],
            true
          )
        },
        "\uC804\uCCB4 \uD3BC\uCE58\uAE30"
      ),
      h2(
        "button",
        {
          className: "rt-btn",
          style: { padding: "0 7px", fontSize: 11 },
          title: "\uD14C\uC2A4\uD2B8 \uC911\uB9CC \uB0A8\uAE30\uAE30",
          onClick: () => collapse.setAll(
            ["testing:" + eng, "recent:" + eng, "queue:" + eng],
            false
          )
        },
        "\uC804\uCCB4 \uC811\uAE30"
      ),
      h2(
        "button",
        {
          className: "rt-btn" + (auto ? " rt-btn-primary" : ""),
          style: { padding: "0 7px", fontSize: 11 },
          title: "5\uCD08\uB9C8\uB2E4 \uC790\uB3D9 \uC0C8\uB85C\uACE0\uCE68",
          onClick: () => setAuto((x) => !x)
        },
        auto ? "\uC2E4\uC2DC\uAC04 \xB7 5s" : "\uC77C\uC2DC \uC815\uC9C0"
      ),
      h2(
        "button",
        {
          className: "rt-btn",
          style: { padding: "0 7px", fontSize: 11 },
          onClick: load
        },
        "\uC0C8\uB85C\uACE0\uCE68"
      )
    );
    const body = [];
    body.push(
      h2(
        Section,
        {
          key: "testing",
          tone: "test",
          title: "\uD14C\uC2A4\uD2B8 \uC911",
          count: testing.length + "\uB300",
          sub: testing.length ? "\uC5D0\uC774\uC804\uD2B8\uAC00 \uC774 \uC790\uC0B0\uB4E4\uC744 \uCE58\uACE0 \uC788\uC2B5\uB2C8\uB2E4" : "\uC5D0\uC774\uC804\uD2B8\uAC00 \uC5B4\uB5A4 \uC790\uC0B0\uC744 \uD14C\uC2A4\uD2B8\uD558\uAE30 \uC2DC\uC791\uD558\uBA74 \uC5EC\uAE30\uC5D0 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uB098\uD0C0\uB0A9\uB2C8\uB2E4",
          open: collapse.isOpen("testing:" + eng, true),
          onToggle: collapse.toggle("testing:" + eng, true)
        },
        testing.length ? testing.map((a) => card(a, false)) : h2(
          "div",
          { className: "rt-atest-meta", style: { paddingBottom: 4 } },
          "\uC9C0\uAE08 \u201C\uD14C\uC2A4\uD2B8 \uC911\u201D\uC778 \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"
        )
      )
    );
    body.push(
      h2(
        Section,
        {
          key: "recent",
          tone: "past",
          title: "\uCD5C\uADFC \uBCC0\uB3D9",
          count: recent.length + "\uB300",
          sub: "\uC774\uBBF8 \uD14C\uC2A4\uD2B8\uD55C \uC790\uC0B0",
          open: collapse.isOpen("recent:" + eng, false),
          onToggle: collapse.toggle("recent:" + eng, false)
        },
        recent.length ? recent.map((a) => card(a, true)) : h2("div", { className: "rt-atest-meta" }, "\uC5C6\uC74C")
      )
    );
    body.push(
      h2(
        Section,
        {
          key: "queue",
          tone: "queue",
          title: "\uB300\uAE30 \uB300\uC5F4",
          count: (data ? data.untested || 0 : 0) + "\uB300",
          sub: "\uACF5\uB7B5 \uC6A9\uC774\uC131\uACFC \uD3EC\uD2B8 \uC218\uB85C \uC5B4\uB290 \uC790\uC0B0\uBD80\uD130 \uCE60\uC9C0 \uC815\uB82C\uD569\uB2C8\uB2E4",
          open: collapse.isOpen("queue:" + eng, false),
          onToggle: collapse.toggle("queue:" + eng, false)
        },
        queue.length ? queue.map((a) => card(a, true)).concat([
          h2(
            "div",
            {
              key: "queueHint",
              className: "rt-atest-meta",
              style: { paddingTop: 4 }
            },
            "\uC804\uCCB4 \uBAA9\uB85D(\uD544\uD130\xB7\uC815\uB82C \uD3EC\uD568)\uC740 \u201C\uC790\uC0B0 \uB9E4\uD551\u201D \uD398\uC774\uC9C0\uC5D0\uC11C \uBD05\uB2C8\uB2E4"
          )
        ]) : h2(
          "div",
          { className: "rt-atest-meta" },
          "\uB300\uAE30 \uC911\uC778 \uC790\uC0B0\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"
        )
      )
    );
    return h2(
      "div",
      { className: "rt-main" },
      conclusion,
      err ? h2("div", { className: "rt-err" }, err) : null,
      data === null && !err ? h2("div", { className: "rt-empty" }, "\uBD88\uB7EC\uC624\uB294 \uC911\u2026") : null,
      h2(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        h2("div", { style: { padding: "6px 12px 14px" } }, body)
      )
    );
  }
  function SessionTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [data, setData] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const [msg, setMsg] = import_react2.default.useState(null);
    const [copied, setCopied] = import_react2.default.useState(null);
    const load = () => {
      if (!eng) return;
      api({ op: "sessions", engagement: eng }).then(
        (r) => {
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setData(r);
        },
        (e) => setErr(String(e && e.message || e))
      );
    };
    import_react2.default.useEffect(load, [eng, refreshKey]);
    const probe = () => {
      setBusy(true);
      setMsg(null);
      api({ op: "probeSessions", engagement: eng, timeoutMs: 6e3 }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uAC80\uC0AC \uC2E4\uD328" });
            load();
            return;
          }
          const on = (r.webshells || []).filter(
            (x) => x.status === "online"
          ).length;
          const act = (r.tunnels || []).filter(
            (x) => x.status === "active"
          ).length;
          setMsg({
            ok: "\uAC80\uC0AC \uC644\uB8CC: WebShell \uC628\uB77C\uC778 " + on + "/" + (r.webshells || []).length + ", \uD130\uB110 \uC0AC\uC6A9 \uAC00\uB2A5 " + act + "/" + (r.tunnels || []).length
          });
          load();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const copy = (key, text) => copyWithFeedback(text, text, (okFlag, message) => {
      if (!okFlag) {
        setMsg({ err: message });
        return;
      }
      setCopied(key);
      setTimeout(() => setCopied((c) => c === key ? null : c), 1500);
    });
    const markTunnel = (t, status) => {
      setMsg(null);
      api({
        op: "updateTunnel",
        engagement: eng,
        id: t.id,
        patch: { status, check_note: "\uD654\uBA74\uC5D0\uC11C \uC218\uB3D9 \uD45C\uC2DC" }
      }).then(
        () => load(),
        (e) => setMsg({ err: String(e && e.message || e) })
      );
    };
    const markShell = (w, status) => {
      setMsg(null);
      api({
        op: "updateWebshell",
        engagement: eng,
        id: w.id,
        patch: { status, check_note: "\uD654\uBA74\uC5D0\uC11C \uC218\uB3D9 \uD45C\uC2DC" }
      }).then(
        () => load(),
        (e) => setMsg({ err: String(e && e.message || e) })
      );
    };
    const sessCollapse = useCollapse("sessions:" + eng);
    const totals = data && data.totals || {};
    const shells = data && data.webshells || [];
    const tunnels = data && data.tunnels || [];
    const statusDot = (s) => h2("span", {
      className: s === "online" || s === "active" ? "rt-dot-on" : s === "unknown" || !s ? "rt-dot-unk" : "rt-dot-off"
    });
    const fact = (label, value) => h2(
      "div",
      { className: "rt-sess-fact" },
      h2("b", null, label),
      h2("span", null, value)
    );
    const isEncryptedShell = (t) => /behinder|godzilla|\u51B0\u874E|\u54E5\u65AF\u62C9/i.test(
      String(t || "")
    );
    const isSuo5 = (t) => /suo5/i.test(String(t || ""));
    const hint = (key, title, detail) => h2(
      "div",
      { key, className: "rt-hint" },
      h2("b", null, title),
      h2(
        "details",
        { className: "rt-sess-fold", style: { marginTop: 3 } },
        h2("summary", null, "\uBC29\uBC95(\uD074\uB9AD\uD558\uBA74 \uD3BC\uCE68)"),
        h2("div", { style: { marginTop: 4 } }, detail)
      )
    );
    const hints = [];
    const badShells = shells.filter((w) => !isEncryptedShell(w.shell_type));
    const legitTunnels = tunnels.filter((t) => t.legit === true);
    if (badShells.length > 0) {
      hints.push(
        hint(
          "h1",
          "\uC9C4\uC785\uC810 " + badShells.length + "\uAC1C\uAC00 Behinder/Godzilla \uC178\uC774 \uC544\uB2D9\uB2C8\uB2E4(\uC0AC\uC6A9\uC790\uAC00 \uC811\uC18D\uD560 \uC218 \uC5C6\uC5B4 \uB0A9\uD488 \uAC00\uB2A5\uD55C \uC9C4\uC785\uC810\uC73C\uB85C \uCE58\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4)",
          "webshell-toolkit \uC2A4\uD0AC\uB85C Behinder(behinder) \uB610\uB294 Godzilla(godzilla) \uC178\uC744 \uB2E4\uC2DC \uC5C5\uB85C\uB4DC\uD558\uACE0, shell_type + pass_key \uB97C redteam_webshell_add \uC5D0 \uC801\uC2B5\uB2C8\uB2E4. \uC784\uC2DC \uC911\uACC4\uB85C\uB9CC \uC4F0\uB294 \uAC83\uC774\uB77C\uBA74 \uBE44\uACE0\uC5D0 \uBC1D\uD799\uB2C8\uB2E4."
        )
      );
    }
    if (tunnels.length > 0 && legitTunnels.length === 0) {
      hints.push(
        hint(
          "h3",
          "\uD604\uC7AC \uD1B5\uB85C " + tunnels.length + '\uAC1C\uAC00 \uBAA8\uB450 "\uD0C0\uAE43 \uACBD\uACC4\uB97C \uB118\uC740 \uAC83"\uC73C\uB85C \uCE58\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4(\uACBD\uACC4/\uB0B4\uBD80\uB9DD \uB3CC\uD30C \uBBF8\uC778\uC815)',
          "\uB0B4 VPS / \uC790\uCCB4 \uC11C\uBC84\uC5D0\uC11C \uC5F0 socks5, frp, \uD504\uB85D\uC2DC\uB294 \uD130\uB110\uB85C \uCE58\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uB300\uC0C1 \uCE21\uC5D0\uC11C \uC2DC\uC791\uB418\uB294 \uD1B5\uB85C\uC5EC\uC57C \uD569\uB2C8\uB2E4: \uB300\uC0C1\uC774 \uB0B4 \uCABD\uC73C\uB85C \uB9AC\uBC84\uC2A4 \uC178, \uB300\uC0C1\uC5D0\uC11C frp/Stowaway \uD074\uB77C\uC774\uC5B8\uD2B8 \uC2E4\uD589, \uB610\uB294 \uB300\uC0C1 WebShell \uC744 \uACBD\uC720\uD55C suo5/HTTP \uD130\uB110; \uB4F1\uB85D\uD560 \uB54C entry_kind \uB85C \uBC1D\uD799\uB2C8\uB2E4."
        )
      );
    }
    const activeSuo5 = tunnels.filter(
      (t) => isSuo5(t.kind) && t.status === "active"
    );
    if (shells.length > 0 && activeSuo5.length === 0) {
      hints.push(
        hint(
          "h2",
          "\uC0AC\uC6A9 \uAC00\uB2A5\uD55C suo5 \uD130\uB110\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4(\uB0B4\uBD80\uB9DD \uC9C4\uC785\uC758 \uD45C\uC900 \uD1B5\uB85C)",
          "suo5-tunnel \uC2A4\uD0AC\uB85C \uC704 WebShell \uC744 \uACBD\uC720\uD574 socks5 \uD130\uB110\uC744 \uB9CC\uB4E4\uACE0, redteam_tunnel_add(kind=suo5, listen=127.0.0.1:1080, entry=WebShell URL, reach=\uB3C4\uB2EC \uB300\uC5ED)\uB85C \uB4F1\uB85D\uD55C \uB4A4, \uB9C8\uC9C0\uB9C9\uC5D0 \u201C\uC5F0\uACB0 \uD655\uC778\u201D\uC744 \uB20C\uB7EC status=active \uB97C \uD655\uC778\uD558\uC138\uC694."
        )
      );
    }
    const shellCards = shells.map(
      (w) => h2(
        "div",
        { key: "w" + w.id, className: "rt-sess" },
        h2(
          "div",
          { className: "rt-sess-head" },
          statusDot(w.status),
          h2("span", { className: "rt-sess-title" }, w.url),
          h2(
            "span",
            { className: "rt-tag rt-tag-active" },
            w.shell_type || "webshell"
          ),
          isEncryptedShell(w.shell_type) ? null : h2(
            "span",
            { className: "rt-tag rt-tag-warn" },
            "\uC0AC\uC6A9\uC790 \uC811\uC18D \uBD88\uAC00"
          ),
          w.privilege ? h2("span", { className: "rt-tag" }, w.privilege) : null,
          h2("div", { className: "rt-spacer" }),
          copied === "cmd" + w.id ? h2(
            "span",
            { className: "rt-tag", style: { color: "#10b981" } },
            "\uBCF5\uC0AC\uB428"
          ) : h2(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => copy("cmd" + w.id, 'curl -s "' + w.url + '"')
            },
            "URL \uBCF5\uC0AC"
          ),
          h2(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => markShell(w, "offline")
            },
            "\uBB34\uD6A8 \uD45C\uC2DC"
          )
        ),
        h2(
          "div",
          { className: "rt-sess-facts" },
          fact(
            "\uC720\uD615",
            isEncryptedShell(w.shell_type) ? "\uC554\uD638\uD654 \uC178(Behinder/Godzilla, \uC0AC\uC6A9\uC790 \uC9C1\uC811 \uC811\uC18D \uAC00\uB2A5)" : "\uBE44\uC554\uD638\uD654 \uC178 \u2014 \uC0AC\uC6A9\uC790\uAC00 \uC811\uC18D\uD560 \uC218 \uC5C6\uC5B4 \uC784\uC2DC \uC911\uACC4\uB85C\uB9CC \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4"
          ),
          w.pass_key ? fact("\uC5F0\uACB0 \uC554\uD638", h2("span", { className: "rt-mono" }, w.pass_key)) : null,
          w.asset_ip ? fact("\uC704\uCE58\uD55C \uC790\uC0B0", w.asset_ip) : null,
          w.privilege ? fact("\uAD8C\uD55C", w.privilege) : null,
          w.secret_ref ? fact(
            "\uC790\uACA9 \uC99D\uBA85 \uCC38\uC870",
            h2("span", { className: "rt-mono" }, w.secret_ref)
          ) : null,
          fact(
            "\uCD5C\uADFC \uAC80\uC0AC",
            (w.last_check ? fmt(w.last_check) : "\uBBF8\uAC80\uC0AC") + (w.latency_ms !== null && w.latency_ms !== void 0 ? "(" + w.latency_ms + "ms)" : "")
          ),
          w.check_note ? fact("\uAC80\uC0AC \uC124\uBA85", w.check_note) : null,
          w.note ? fact("\uBE44\uACE0", w.note) : null
        )
      )
    );
    const tunnelCards = tunnels.map((t) => {
      const proxy = t.listen ? "socks5://" + t.listen : "";
      const gogoCmd = t.listen ? "./gogo -i <\uB0B4\uBD80\uB9DD CIDR> -m ss --ping -p top2,win,db --proxy " + proxy : "";
      const fscanCmd = t.listen ? "./fscan -h <\uB0B4\uBD80\uB9DD CIDR> -np -nobr -nopoc -socks5 " + t.listen + " -o intranet.txt" : "";
      return h2(
        "div",
        { key: "t" + t.id, className: "rt-sess" },
        h2(
          "div",
          { className: "rt-sess-head" },
          statusDot(t.status),
          h2(
            "span",
            { className: "rt-sess-title" },
            t.listen || "(\uC218\uC2E0 \uC8FC\uC18C \uBBF8\uAE30\uC7AC)"
          ),
          h2("span", { className: "rt-tag rt-tag-passive" }, t.kind || "tunnel"),
          isSuo5(t.kind) ? null : h2(
            "span",
            { className: "rt-tag rt-tag-warn" },
            "suo5 \uD45C\uC900 \uD1B5\uB85C \uC544\uB2D8"
          ),
          /* 타깃 경계를 넘은 통로만 돌파 증거로 친다(내 VPS/자체 서버에서 연 것은 제외) */
          t.legit === true ? h2(
            "span",
            {
              className: "rt-tag rt-tag-live",
              title: t.entry_kind_label || ""
            },
            "\uB300\uC0C1 \uCE21 \uD1B5\uB85C"
          ) : t.legit === false ? h2(
            "span",
            {
              className: "rt-tag rt-tag-warn",
              title: "\uB0B4 VPS/\uC790\uCCB4 \uC11C\uBC84\uC5D0\uC11C\uB9CC \uC5F0 \uD1B5\uB85C\uB77C \uB300\uC0C1\uC5D0 \uB2FF\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4 \u2014 \uACBD\uACC4 \uB3CC\uD30C/\uB0B4\uBD80\uB9DD \uB3CC\uD30C\uB85C \uCE58\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
            },
            "\uB3CC\uD30C \uBBF8\uC778\uC815"
          ) : h2(
            "span",
            {
              className: "rt-tag",
              title: "entry_kind \uBBF8\uC120\uC5B8: \uB300\uC0C1 \uCE21 \uB05D\uC774 \uBB34\uC5C7\uC778\uC9C0 \uBC1D\uD788\uC138\uC694(target-outbound / target-http / target-agent)"
            },
            "\uD655\uC778 \uB300\uAE30"
          ),
          t.reach ? h2("span", { className: "rt-tag" }, "\uB3C4\uB2EC " + t.reach) : null,
          h2("div", { className: "rt-spacer" }),
          h2(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => copy("sock" + t.id, t.listen || "")
            },
            copied === "sock" + t.id ? "\uBCF5\uC0AC\uB428" : "\uC8FC\uC18C \uBCF5\uC0AC"
          ),
          t.status === "active" ? h2(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => markTunnel(t, "down")
            },
            "\uBB34\uD6A8 \uD45C\uC2DC"
          ) : h2(
            "button",
            {
              className: "rt-btn",
              style: { padding: "0 6px", fontSize: 11 },
              onClick: () => markTunnel(t, "active")
            },
            "\uC0AC\uC6A9 \uAC00\uB2A5 \uD45C\uC2DC"
          )
        ),
        h2(
          "div",
          { className: "rt-sess-facts" },
          fact("\uB300\uC0C1 \uCE21 \uC9C4\uC785\uC810", t.entry || "\uBBF8\uB4F1\uB85D"),
          fact(
            "\uACBD\uACC4 \uD1B5\uACFC",
            t.legit === true ? h2(
              "span",
              { className: "rt-tag rt-tag-live" },
              t.entry_kind_label || t.entry_kind || "\uB300\uC0C1 \uCE21 \uD655\uC778\uB428"
            ) : t.legit === false ? h2(
              "span",
              { className: "rt-tag rt-tag-warn" },
              "\uB3CC\uD30C \uBBF8\uC778\uC815(\uB0B4 VPS \uC5D0\uC11C\uB9CC \uD504\uB85D\uC2DC\uB97C \uC5F4\uC5C8\uC2B5\uB2C8\uB2E4)"
            ) : h2(
              "span",
              { className: "rt-tag" },
              "entry_kind \uBBF8\uC120\uC5B8, \uD655\uC778 \uB300\uAE30"
            )
          ),
          t.reach ? fact("\uB3C4\uB2EC \uB300\uC5ED", t.reach) : null,
          t.asset_ip ? fact("\uC704\uCE58\uD55C \uC790\uC0B0", t.asset_ip) : null,
          fact(
            "\uCD5C\uADFC \uAC80\uC0AC",
            (t.last_check ? fmt(t.last_check) : "\uBBF8\uAC80\uC0AC") + (t.latency_ms !== null && t.latency_ms !== void 0 ? "(" + t.latency_ms + "ms)" : "")
          ),
          t.check_note ? fact("\uAC80\uC0AC \uC124\uBA85", t.check_note) : null,
          t.note ? fact("\uBE44\uACE0", t.note) : null
        ),
        /* 명령은 기본 접힘: 카드의 첫 정보는 "이 통로를 쓸 수 있는지, 어디로 통하는지"이며 명령은 필요할 때 펼친다 */
        t.command ? h2(
          "details",
          { className: "rt-sess-fold" },
          h2("summary", null, "\uAD6C\uCD95 \uBA85\uB839(\uD074\uB9AD\uD558\uBA74 \uD3BC\uCE68 / \uBCF5\uC0AC)"),
          h2(
            "div",
            Object.assign(
              { className: "rt-code", title: "\uD074\uB9AD\uD558\uBA74 \uBCF5\uC0AC" },
              clickable(() => copy("c" + t.id, t.command), {
                label: "\uBA85\uB839 \uBCF5\uC0AC"
              })
            ),
            copied === "c" + t.id ? "\uBCF5\uC0AC\uB428" : t.command
          )
        ) : null,
        t.status === "active" && t.listen ? h2(
          "details",
          { className: "rt-sess-fold" },
          h2("summary", null, "\uC774 \uD130\uB110\uB85C \uC2A4\uCE94(gogo / fscan \uBA85\uB839)"),
          h2(
            "div",
            { className: "rt-sess-cmd" },
            h2(
              "div",
              Object.assign(
                { className: "rt-code", title: "\uD074\uB9AD\uD558\uBA74 \uBCF5\uC0AC" },
                clickable(() => copy("g" + t.id, gogoCmd), {
                  label: "gogo \uBA85\uB839 \uBCF5\uC0AC"
                })
              ),
              copied === "g" + t.id ? "\uBCF5\uC0AC\uB428" : gogoCmd
            ),
            h2(
              "div",
              Object.assign(
                {
                  className: "rt-code",
                  style: { display: "block", marginTop: 3 },
                  title: "\uD074\uB9AD\uD558\uBA74 \uBCF5\uC0AC"
                },
                clickable(() => copy("f" + t.id, fscanCmd), {
                  label: "fscan \uBA85\uB839 \uBCF5\uC0AC"
                })
              ),
              copied === "f" + t.id ? "\uBCF5\uC0AC\uB428" : fscanCmd
            )
          )
        ) : null
      );
    });
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uC138\uC158\uACFC \uC9C4\uC785\uC810"),
        h2(
          "span",
          { className: "rt-tag" },
          "WebShell " + (totals.webshellsOnline || 0) + "/" + (totals.webshells || 0) + " \uC628\uB77C\uC778"
        ),
        h2(
          "span",
          { className: "rt-tag" },
          "\uD130\uB110 " + (totals.tunnelsActive || 0) + "/" + (totals.tunnels || 0) + " \uC0AC\uC6A9 \uAC00\uB2A5"
        ),
        h2(
          "span",
          { className: "rt-tag" },
          "\uC790\uACA9 \uC99D\uBA85 " + (totals.credentials || 0)
        ),
        h2("span", { className: "rt-tag" }, "\uC811\uADFC \uC138\uC158 " + (totals.access || 0)),
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          {
            className: "rt-btn rt-btn-primary",
            disabled: busy,
            onClick: probe
          },
          busy ? "\uAC80\uC0AC \uC911\u2026" : "\uC5F0\uACB0 \uD655\uC778"
        ),
        h2("button", { className: "rt-btn", onClick: load }, "\uC0C8\uB85C\uACE0\uCE68")
      ),
      msg ? h2(
        "div",
        { className: msg.err ? "rt-err" : "rt-foot" },
        msg.err || msg.ok
      ) : null,
      err ? h2("div", { className: "rt-err" }, err) : null,
      h2(
        "div",
        { className: "rt-body", style: { overflow: "auto" } },
        !shells.length && !tunnels.length ? h2(
          "div",
          { className: "rt-empty" },
          h2("div", null, "\uB4F1\uB85D\uB41C WebShell \uC774\uB098 \uD130\uB110\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4."),
          h2(
            "div",
            { style: { marginTop: 6, fontSize: 12 } },
            "WebShell \uC744 \uC5BB\uC73C\uBA74 redteam_webshell_add; \uD130\uB110\uC744 \uB9CC\uB4E4\uBA74 redteam_tunnel_add(suo5 / socks5 / ssh -R); \uC774\uD6C4 \uC5D0\uC774\uC804\uD2B8\uB294 redteam_sessions \uB85C \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."
          )
        ) : null,
        hints.length ? h2("div", { style: { padding: "8px 10px 0" } }, hints) : null,
        h2(
          Section,
          {
            key: "webshells",
            tone: "queue",
            title: "WebShell",
            count: (totals.webshellsOnline || 0) + "/" + (totals.webshells || 0) + " \uC628\uB77C\uC778",
            sub: "\uC774\uBBF8 \uC628\uB77C\uC778\uC774 \uB41C \uC81C\uC5B4 \uAC00\uB2A5\uD55C \uC9C4\uC785\uC810",
            open: sessCollapse.isOpen("shells", true),
            onToggle: sessCollapse.toggle("shells", true)
          },
          shells.length ? h2(
            "div",
            { className: "rt-sess-grid", style: { padding: 0 } },
            shellCards
          ) : h2(
            "div",
            { className: "rt-atest-meta" },
            "\uC5C6\uC74C(WebShell \uC744 \uC5BB\uC740 \uB4A4 redteam_webshell_add \uB85C \uB4F1\uB85D\uD558\uC138\uC694)"
          )
        ),
        h2(
          Section,
          {
            key: "tunnels",
            tone: "test",
            title: "\uB0B4\uBD80\uB9DD \uD130\uB110",
            count: (totals.tunnelsActive || 0) + "/" + (totals.tunnels || 0) + " \uC0AC\uC6A9 \uAC00\uB2A5",
            sub: "\uC2A4\uCE90\uB108 \uD504\uB85D\uC2DC\uB85C \uBC14\uB85C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4",
            open: sessCollapse.isOpen("tunnels", true),
            onToggle: sessCollapse.toggle("tunnels", true)
          },
          tunnels.length ? h2(
            "div",
            { className: "rt-sess-grid", style: { padding: 0 } },
            tunnelCards
          ) : h2(
            "div",
            { className: "rt-atest-meta" },
            "\uC5C6\uC74C(\uD130\uB110\uC744 \uB9CC\uB4E0 \uB4A4 redteam_tunnel_add \uB85C \uB4F1\uB85D\uD558\uC138\uC694)"
          )
        )
      )
    );
  }
  class RtBoundary extends import_react2.default.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
      return { error };
    }
    componentDidCatch(error) {
      try {
        console.error("[redteam-ui] \uD398\uC774\uC9C0 \uB80C\uB354\uB9C1 \uC624\uB958:", error);
      } catch (e) {
      }
    }
    render() {
      if (this.state.error) {
        const msg = this.state.error && this.state.error.message ? this.state.error.message : String(this.state.error);
        return h2(
          "div",
          { className: "rt-pane" },
          h2("div", { className: "rt-err" }, "\uC774 \uD398\uC774\uC9C0 \uB80C\uB354\uB9C1 \uC624\uB958: " + msg),
          h2(
            "button",
            {
              className: "rt-btn",
              onClick: () => {
                this.setState({ error: null });
                setUI({ tab: "assets" });
              }
            },
            "\uC790\uC0B0 \uB9E4\uD551\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"
          )
        );
      }
      return this.props.children;
    }
  }
  function AgentsTab(props) {
    const eng = props.engagement;
    const refreshKey = props.refreshKey || 0;
    const [roles, setRoles] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [concurrency, setConcurrency] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const load = () => {
      setBusy(true);
      api({
        op: eng ? "prompts" : "bootstrap",
        engagement: eng || void 0
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC77D\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          if (r.roles) setRoles(r.roles);
        },
        (e) => {
          setBusy(false);
          setErr(String(e && e.message || e));
        }
      );
      api({ op: "agentsStatus" }).then(
        (r) => {
          if (r && r.ok !== false) setConcurrency(r);
        },
        () => {
        }
      );
    };
    import_react2.default.useEffect(load, [eng, refreshKey]);
    const used = concurrency ? concurrency.used : null;
    const max = concurrency ? concurrency.max : 3;
    return h2(
      "div",
      { className: "rt-main" },
      h2(
        "div",
        { className: "rt-toolbar" },
        h2("span", { style: { fontWeight: 600 } }, "\uC791\uC804 \uC5D0\uC774\uC804\uD2B8"),
        h2(
          "span",
          { className: "rt-tag rt-tag-passive" },
          "\uB3D9\uC2DC \uC2E4\uD589 \uC0C1\uD55C " + max
        ),
        used === null ? h2("span", { className: "rt-tag" }, "\uC810\uC720 \uD604\uD669 \uC54C \uC218 \uC5C6\uC74C") : h2(
          "span",
          {
            className: "rt-tag" + (used >= max ? " rt-tag-warn" : " rt-tag-live")
          },
          "\uC2E4\uD589 \uC911 " + used + " / \uB0A8\uC740 " + Math.max(max - used, 0)
        ),
        h2("div", { className: "rt-spacer" }),
        h2(
          "button",
          { className: "rt-btn", disabled: busy, onClick: load },
          busy ? "\uC77D\uB294 \uC911\u2026" : "\uC0C8\uB85C\uACE0\uCE68"
        )
      ),
      h2(
        "div",
        { className: "rt-pane" },
        err ? h2("div", { className: "rt-err" }, err) : null,
        h2(
          "div",
          { className: "rt-card" },
          h2("h4", null, "\uB3D9\uC2DC \uC2E4\uD589 \uADDC\uCE59(\uC5C4\uACA9 \uC81C\uC57D)"),
          h2(
            "div",
            { style: { fontSize: 12, lineHeight: 1.7 } },
            "\xB7 \uAC19\uC740 \uD0C0\uAE43\uC5D0\uC11C **\uB3D9\uC2DC\uC5D0 \uCD5C\uB300 " + max + "\uAC1C \uC2E4\uD589 \uC5D0\uC774\uC804\uD2B8**; \uC8FC \uC138\uC158\uC740 \uC791\uC5C5\uC744 \uBC30\uC815\uD558\uAE30 \uC804\uC5D0 `redteam_agent_slot` \uB85C \uC790\uB9AC\uB97C \uC7A1\uACE0, \uC815\uC6D0\uC774 \uCC28\uBA74 \uBC14\uB85C \uAC70\uBD80\uD569\uB2C8\uB2E4.",
            h2("br"),
            "\xB7 **\uAE30\uBCF8\uC740 \uD558\uB098\uC529 \uBC30\uC815\uD558\uBA70 \uC21C\uC11C\uB300\uB85C \uC9C4\uD589**; \uC11C\uB85C \uC758\uC874\uD558\uC9C0 \uC54A\uB294 \uC791\uC5C5\uB9CC \uBCD1\uB82C\uB85C \uB3CC\uB9BD\uB2C8\uB2E4.",
            h2("br"),
            "\xB7 \uC138\uC158\uB9C8\uB2E4 **\uC790\uAE30 \uD0C0\uAE43 \uBC14\uC778\uB529**\uC774 \uC788\uC2B5\uB2C8\uB2E4: \uC5EC\uB7EC \uC138\uC158\uC774 \uBCD1\uB82C\uB85C \uB3CC\uC544\uB3C4 \uBCF4\uACE0\uC11C\uAC00 \uC11E\uC774\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4(\uC11C\uBE0C\uC5D0\uC774\uC804\uD2B8\uB294 \uBD80\uBAA8 \uC138\uC158\uC758 \uD0C0\uAE43\uC744 \uC0C1\uC18D\uD569\uB2C8\uB2E4)."
          )
        ),
        h2(
          "div",
          { className: "rt-card" },
          h2("h4", null, "\uC5EC\uC12F \uC5ED\uD560"),
          h2(
            "div",
            { style: { fontSize: 12, lineHeight: 1.8 } },
            "\u2460 \uC815\uBCF4 \uC218\uC9D1 `recon` \u2014\u2014 \uC790\uC0B0\uB9CC \uC218\uC9D1\uD558\uBA70, \uB2E8\uC704 \uC790\uC0B0\uC744 \uBE60\uC9D0\uC5C6\uC774 \uBAA8\uC74D\uB2C8\uB2E4(\uACBD\uACC4 \uBC0F \uBBF8\uC2E0\uACE0 \uC790\uC0B0 \uD3EC\uD568)",
            h2("br"),
            "\u2461 \uC790\uC0B0 \uC815\uB9AC `assess` \u2014\u2014 \uD558\uB098\uC529 \uB118\uAE30\uBA70 \uACF5\uB7B5 \uC6A9\uC774\uC131\uC744 \uD3C9\uAC00\uD574 \uC804\uBD80 \uAE30\uB85D\uD569\uB2C8\uB2E4",
            h2("br"),
            "\u2462 \uCDE8\uC57D\uC810 \uBC1C\uACAC `vuln-scan` \u2014\u2014 \uBA3C\uC800 \uC9C0\uC2DD \uBCA0\uC774\uC2A4\uB85C \uC911\uBCF5 \uC81C\uAC70 \u2192 Nday/1day \uC6B0\uC120 \u2192 \uC5D4\uB4DC\uD3EC\uC778\uD2B8 \uBE44\uC778\uAC00 \uC811\uADFC \uD0D0\uC9C0",
            h2("br"),
            "\u2463 \uCDE8\uC57D\uC810 \uC775\uC2A4\uD50C\uB85C\uC787 `exploit` \u2014\u2014 \uBA3C\uC800 \uC11C\uBC84 \uAD8C\uD55C(Behinder/Godzilla \uC178) + suo5 \uD130\uB110\uC744 \uD655\uBCF4\uD558\uACE0, \uADF8\uB2E4\uC74C \uB2E4\uB978 \uB4DD\uC810 \uD56D\uBAA9\uC744 \uCE69\uB2C8\uB2E4",
            h2("br"),
            "\u2464 \uB0B4\uBD80\uB9DD \uCE68\uD22C `internal` \u2014\u2014 \uD130\uB110\uB85C \uB4E4\uC5B4\uAC00 \u2460\u2461\u2462\u2463 \uB97C \uC21C\uC11C\uB300\uB85C \uB2E4\uC2DC \uB3CC\uB824 \uB0B4\uBD80\uB9DD\uC744 \uACF5\uB7B5\uD569\uB2C8\uB2E4",
            h2("br"),
            "\u2465 \uC8FC \uC138\uC158 `plan` \u2014\u2014 \uACC4\uD68D\xB7\uC791\uC5C5 \uBC30\uC815\xB7\uC9D1\uACC4\xB7\uBCF4\uACE0\uB9CC \uD558\uACE0 \uC9C1\uC811 \uB098\uC11C\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
          )
        ),
        h2(ConcurrencyCard, { concurrency, onSaved: load }),
        h2(
          "div",
          { className: "rt-card" },
          h2("h4", null, "\uC5ED\uD560 \uD504\uB86C\uD504\uD2B8(\uD0C0\uAE43\uBCC4 \uC800\uC7A5, \uC5EC\uAE30\uC11C \uD3B8\uC9D1 \uAC00\uB2A5)"),
          h2(
            "div",
            {
              style: {
                fontSize: 11.5,
                color: "var(--dsw-alias-label-secondary)",
                marginBottom: 6
              }
            },
            "\u201C\uC5D0\uC774\uC804\uD2B8 \uD504\uB86C\uD504\uD2B8\u201D\uAC00 \uC774 \uD398\uC774\uC9C0\uB85C \uD1B5\uD569\uB418\uC5C8\uC2B5\uB2C8\uB2E4; \uC544\uB798\uB294 \uC804\uCCB4 \uD3B8\uC9D1\uAE30\uC785\uB2C8\uB2E4(\uC218\uC815 \uD6C4 \uC800\uC7A5\uD558\uBA74 \uD604\uC7AC \uD0C0\uAE43\uC5D0\uB9CC \uC801\uC6A9\uB429\uB2C8\uB2E4)."
          ),
          h2(PromptsTab, { engagement: eng, refreshKey })
        )
      )
    );
  }
  function ConcurrencyCard(props) {
    const info = props.concurrency || {};
    const [draft, setDraft] = import_react2.default.useState("");
    const [busy, setBusy] = import_react2.default.useState(false);
    const [msg, setMsg] = import_react2.default.useState(null);
    import_react2.default.useEffect(() => {
      if (info.max) setDraft(String(info.max));
    }, [info.max]);
    const limit = info.limit || 10;
    const used = typeof info.used === "number" ? info.used : null;
    const source = info.source === "settings" ? "\uD328\uB110\uC5D0\uC11C \uC124\uC815" : info.source === "env" ? "\uD658\uACBD \uBCC0\uC218 REDTEAM_MAX_AGENTS" : "\uAE30\uBCF8\uAC12";
    const n = Number(draft);
    const invalid = !Number.isFinite(n) || Math.floor(n) !== n || n < 1 || n > limit;
    const save = () => {
      if (invalid) return;
      setBusy(true);
      setMsg(null);
      api({ op: "setAgentsMax", max: n }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC800\uC7A5 \uC2E4\uD328" });
            return;
          }
          setMsg({
            ok: "\uC800\uC7A5\uB428: \uB3D9\uC2DC \uC2E4\uD589 \uC0C1\uD55C " + r.max + "(\uC989\uC2DC \uC801\uC6A9, \uC7AC\uC2DC\uC791 \uBD88\uD544\uC694)"
          });
          if (props.onSaved) props.onSaved();
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    return h2(
      "div",
      { className: "rt-card" },
      h2("h4", null, "\uB3D9\uC2DC \uC2E4\uD589 \uC218"),
      h2(
        "div",
        { style: { fontSize: 12, lineHeight: 1.8, marginBottom: 8 } },
        "\uAC19\uC740 \uD0C0\uAE43\uC5D0\uC11C **\uB3D9\uC2DC\uC5D0 \uBA87 \uAC1C\uC758 \uC2E4\uD589 \uC5D0\uC774\uC804\uD2B8**\uAE4C\uC9C0 \uB3CC\uB9B4\uC9C0. \uD604\uC7AC \uC801\uC6A9\uAC12: **" + (info.max || "?") + "**" + (used === null ? "" : "(\uC2E4\uD589 \uC911 " + used + ", \uB0A8\uC740 " + Math.max((info.max || 0) - used, 0) + ")") + ", \uCD9C\uCC98: " + source + ". \uC218\uC815\uD558\uBA74 **\uC989\uC2DC \uC801\uC6A9**\uB418\uBA70 \uC7AC\uC2DC\uC791\uC774 \uD544\uC694 \uC5C6\uC2B5\uB2C8\uB2E4."
      ),
      h2(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap"
          }
        },
        h2("input", {
          className: "rt-input",
          style: { width: 90 },
          type: "number",
          min: 1,
          max: limit,
          value: draft,
          onChange: (e) => setDraft(e.target.value)
        }),
        h2(
          "span",
          {
            style: {
              fontSize: 11.5,
              color: "var(--dsw-alias-label-secondary)"
            }
          },
          "\uBC94\uC704 1 \u2013 " + limit
        ),
        h2(
          "button",
          {
            className: "rt-btn rt-btn-primary",
            disabled: busy || invalid,
            onClick: save
          },
          busy ? "\uC800\uC7A5 \uC911\u2026" : "\uC800\uC7A5"
        ),
        msg && msg.err ? h2(
          "span",
          { style: { fontSize: 12, color: "var(--rt-danger, #d33)" } },
          msg.err
        ) : null,
        msg && msg.ok ? h2(
          "span",
          {
            style: {
              fontSize: 12,
              color: "var(--dsw-alias-label-secondary)"
            }
          },
          msg.ok
        ) : null
      ),
      h2(
        "div",
        { className: "rt-note", style: { marginTop: 8 } },
        "\u26A0\uFE0F \uB298\uB9B0\uB2E4\uACE0 \uBE68\uB77C\uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4: **\uAC19\uC740 \uBAA8\uB378 API \uD0A4\uC758 \uB3D9\uC2DC \uC2E4\uD589/\uC18D\uB3C4 \uC0C1\uD55C\uC740 \uACF5\uC720\uB429\uB2C8\uB2E4**. \uD55C\uAEBC\uBC88\uC5D0 \uB108\uBB34 \uB9CE\uC774 \uBC30\uC815\uD558\uBA74 \uC11C\uB85C \uC790\uB9AC\uB97C \uBE8F\uC5B4\uB300\uAE30, \uD0C0\uC784\uC544\uC6C3, \uC798\uB9B0 \uC751\uB2F5, \uC2EC\uD558\uBA74 \uC18D\uB3C4 \uC81C\uD55C \uC624\uB958\uAE4C\uC9C0 \uB098\uBA70 \u2014\u2014 \uC624\uD788\uB824 \uD14C\uC2A4\uD2B8 \uACB0\uACFC\uAC00 \uBD88\uC548\uC815\uD574\uC9D1\uB2C8\uB2E4(\uB204\uB77D, \uC911\uB3C4 \uD3EC\uAE30). 2\u20133 \uC5D0\uC11C \uC2DC\uC791\uD558\uACE0, \uD0A4\uC758 \uD560\uB2F9\uB7C9\uC774 \uCDA9\uBD84\uD558\uACE0 \uC791\uC5C5\uB07C\uB9AC \uC815\uB9D0 \uC758\uC874\uD558\uC9C0 \uC54A\uC744 \uB54C\uB9CC \uB298\uB9AC\uC138\uC694."
      )
    );
  }
  function VersionBar(props) {
    const [info, setInfo] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [busy, setBusy] = import_react2.default.useState(false);
    const [open, setOpen] = import_react2.default.useState(false);
    const [msg, setMsg] = import_react2.default.useState(null);
    const [countdown, setCountdown] = import_react2.default.useState(0);
    const countdownRef = import_react2.default.useRef(null);
    const clearCountdown = import_react2.default.useCallback(() => {
      if (countdownRef.current) {
        try {
          clearInterval(countdownRef.current);
        } catch {
        }
      }
      countdownRef.current = null;
    }, []);
    import_react2.default.useEffect(() => () => clearCountdown(), [clearCountdown]);
    const closeModal = import_react2.default.useCallback(() => {
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
            if (!silent) setErr(r && r.error || "\uC5C5\uB370\uC774\uD2B8 \uD655\uC778 \uC2E4\uD328");
            api({ op: "version" }).then(
              (v) => {
                if (v && v.ok !== false) setInfo(v);
              },
              () => {
              }
            );
            return;
          }
          setErr(null);
          setInfo(r);
        },
        (e) => {
          setBusy(false);
          if (!silent) setErr(String(e && e.message || e));
          api({ op: "version" }).then(
            (v) => {
              if (v && v.ok !== false) setInfo(v);
            },
            () => {
            }
          );
        }
      );
    };
    import_react2.default.useEffect(() => {
      check(true);
    }, []);
    const apply2 = () => {
      setBusy(true);
      setMsg(null);
      api({
        op: "updateApply",
        target: info && info.latest || void 0
      }).then(
        (r) => {
          setBusy(false);
          if (!r || r.ok === false) {
            setMsg({ err: r && r.error || "\uC5C5\uB370\uC774\uD2B8 \uC2E4\uD328" });
            return;
          }
          setMsg({
            ok: (r.installed || "") + " \uC124\uCE58\uB428. \uD604\uC7AC \uD638\uC2A4\uD2B8\uB97C \uC7AC\uC2DC\uC791\uD558\uB294 \uC911\u2026"
          });
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
          }, 1e3);
        },
        (e) => {
          setBusy(false);
          setMsg({ err: String(e && e.message || e) });
        }
      );
    };
    const current = info && info.current ? info.current : info && info.plugin ? info.plugin.version : null;
    const latest = info && info.latest ? info.latest : null;
    const hasNew = !!(info && info.updateAvailable);
    const blockers = info && info.blockers || [];
    const notes = info && info.notes || [];
    const mode = info && info.install ? info.install.mode : null;
    return h2(
      "span",
      { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
      h2(
        "span",
        {
          className: "rt-tag" + (hasNew ? " rt-tag-warn" : ""),
          title: "\uD604\uC7AC \uBC84\uC804 " + (current || "\uC54C \uC218 \uC5C6\uC74C") + (latest ? "\n\uCD5C\uC2E0 \uBC84\uC804 " + latest : "") + (mode === "dev" ? "\n\uC124\uCE58 \uBC29\uC2DD: \uAC1C\uBC1C \uBAA8\uB4DC(\uC18C\uC2A4 \uC2EC\uBCFC\uB9AD \uB9C1\uD06C)" : mode === "package" ? "\n\uC124\uCE58 \uBC29\uC2DD: \uD328\uD0A4\uC9C0 \uC124\uCE58" : "") + (info && info.check_error ? "\n\uD655\uC778 \uC2E4\uD328: " + info.check_error : "")
        },
        "v" + (current || "?")
      ),
      hasNew ? h2(
        "button",
        {
          className: "rt-btn rt-btn-primary",
          disabled: busy,
          onClick: () => {
            setOpen(true);
            setMsg(null);
          },
          title: "\uC0C8 \uBC84\uC804 " + latest + " \uBC1C\uACAC: \uB20C\uB7EC\uC11C \uD655\uC778\uD558\uACE0 \uD55C \uBC88\uC5D0 \uC5C5\uB370\uC774\uD2B8\uD569\uB2C8\uB2E4(\uD604\uC7AC \uD638\uC2A4\uD2B8\uAC00 \uC7AC\uC2DC\uC791\uB429\uB2C8\uB2E4)"
        },
        busy ? "\uD655\uC778 \uC911\u2026" : "\uC0C8 \uBC84\uC804 v" + latest
      ) : h2(
        "button",
        {
          className: "rt-btn",
          disabled: busy,
          onClick: () => check(false),
          title: "npm \uC758 \uCD5C\uC2E0 \uBC84\uC804\uC744 \uB2E4\uC2DC \uD655\uC778\uD569\uB2C8\uB2E4"
        },
        busy ? "\uD655\uC778 \uC911\u2026" : "\uC5C5\uB370\uC774\uD2B8 \uD655\uC778"
      ),
      open ? h2(
        "div",
        {
          className: "rt-modal",
          "aria-hidden": "true",
          onClick: closeModal
        },
        h2(
          "div",
          {
            className: "rt-modal-box",
            onClick: (e) => e.stopPropagation()
          },
          h2("h4", { style: { marginTop: 0 } }, "RedTeam \uBAA8\uB4DC \uC5C5\uB370\uC774\uD2B8"),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uD604\uC7AC \uBC84\uC804"),
            h2("span", null, current || "\uC54C \uC218 \uC5C6\uC74C")
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uCD5C\uC2E0 \uBC84\uC804"),
            h2("span", null, latest || "\uC54C \uC218 \uC5C6\uC74C")
          ),
          h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uC124\uCE58 \uBC29\uC2DD"),
            h2(
              "span",
              null,
              mode === "dev" ? "\uAC1C\uBC1C \uBAA8\uB4DC(\uC18C\uC2A4 \uC2EC\uBCFC\uB9AD \uB9C1\uD06C)" : mode === "package" ? "\uD328\uD0A4\uC9C0 \uC124\uCE58(" + (info.install && info.install.packageManager || "npm") + ")" : "\uC54C \uC218 \uC5C6\uC74C"
            )
          ),
          info && info.install && info.install.dir ? h2(
            "div",
            { className: "rt-kv" },
            h2("b", null, "\uC124\uCE58 \uC704\uCE58"),
            h2("span", { className: "rt-mono" }, info.install.dir)
          ) : null,
          blockers.length ? h2(
            "div",
            { className: "rt-hint" },
            h2(
              "div",
              { style: { fontWeight: 600, marginBottom: 4 } },
              "\uC9C0\uAE08\uC740 \uC5C5\uB370\uC774\uD2B8\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4:"
            ),
            blockers.map(
              (b, i) => h2("div", { key: "b" + i }, "\xB7 " + b)
            )
          ) : null,
          notes.length ? h2(
            "div",
            { className: "rt-foot", style: { padding: "4px 0" } },
            notes.map((n, i) => h2("div", { key: "n" + i }, n))
          ) : null,
          h2(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--dsw-alias-label-secondary)",
                margin: "8px 0"
              }
            },
            "\uC5C5\uB370\uC774\uD2B8 \uC808\uCC28: \uC0C8 \uBC84\uC804 \uC124\uCE58 \u2192 \uD604\uC7AC \uD638\uC2A4\uD2B8 \uC790\uB3D9 \uC7AC\uC2DC\uC791(\uACF5\uC2DD exe / \uCEE4\uBBA4\uB2C8\uD2F0\uD310 / dsh web; \uC774 \uD398\uC774\uC9C0 \uC5F0\uACB0\uC774 \uB04A\uAE30\uACE0 \uC57D 5\u201310\uCD08 \uB4A4 \uC790\uB3D9 \uC0C8\uB85C\uACE0\uCE68\uB429\uB2C8\uB2E4).\uC7AC\uC2DC\uC791 \uC804\uC5D0 \uC2E4\uD589 \uC911\uC778 \uC5D0\uC774\uC804\uD2B8\uAC00 \uC788\uB294\uC9C0 \uD655\uC778\uD558\uACE0, \uC788\uC73C\uBA74 \uADF8\uB300\uB85C \uBA48\uCD94\uC138\uC694."
          ),
          msg ? h2(
            "div",
            { className: msg.err ? "rt-err" : "rt-foot" },
            msg.err || msg.ok
          ) : null,
          countdown > 0 ? h2(
            "div",
            { className: "rt-foot" },
            "\uD638\uC2A4\uD2B8\uB97C \uC7AC\uC2DC\uC791\uD558\uB294 \uC911\uC785\uB2C8\uB2E4. " + countdown + "\uCD08 \uB4A4 \uD398\uC774\uC9C0\uB97C \uC790\uB3D9 \uC0C8\uB85C\uACE0\uCE68\uD569\uB2C8\uB2E4\u2026"
          ) : null,
          h2(
            "div",
            {
              style: {
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 10
              }
            },
            h2(
              "button",
              { className: "rt-btn", onClick: closeModal },
              "\uB2EB\uAE30"
            ),
            h2(
              "button",
              {
                className: "rt-btn rt-btn-primary",
                disabled: busy || blockers.length > 0 || mode === "dev",
                title: mode === "dev" ? "\uAC1C\uBC1C \uBAA8\uB4DC \uC124\uCE58\uB294 \uC800\uC7A5\uC18C \uC808\uCC28\uB85C \uC5C5\uADF8\uB808\uC774\uB4DC\uD569\uB2C8\uB2E4" : blockers.length ? "\uC704\uC758 \uCC28\uB2E8 \uD56D\uBAA9\uC744 \uBA3C\uC800 \uD574\uACB0\uD558\uC138\uC694" : "\uC124\uCE58 \uD6C4 \uC7AC\uC2DC\uC791",
                onClick: apply2
              },
              busy ? "\uC5C5\uB370\uC774\uD2B8 \uC911\u2026" : "\uD55C \uBC88\uC5D0 \uC5C5\uB370\uC774\uD2B8 \uD6C4 \uC7AC\uC2DC\uC791"
            )
          )
        )
      ) : null
    );
  }
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
    }
  };
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
    const vw = typeof window !== "undefined" && window.innerWidth || 1280;
    const vh = typeof window !== "undefined" && window.innerHeight || 800;
    const w = Math.min(
      Math.max(320, Number(g && g.w) || 620),
      Math.max(320, vw)
    );
    const h3 = Math.min(
      Math.max(240, Number(g && g.h) || 520),
      Math.max(240, vh)
    );
    const x = Math.min(Math.max(0, Number(g && g.x) || 0), Math.max(0, vw - w));
    const y = Math.min(Math.max(0, Number(g && g.y) || 0), Math.max(0, vh - h3));
    return { x, y, w, h: h3 };
  }
  function defaultRtGeom() {
    const vw = typeof window !== "undefined" && window.innerWidth || 1280;
    const vh = typeof window !== "undefined" && window.innerHeight || 800;
    let w = 620;
    try {
      const saved = Number(window.localStorage.getItem("rt-dock-width"));
      if (Number.isFinite(saved) && saved >= 320 && saved <= 1200) w = saved;
    } catch (e) {
    }
    const h3 = Math.max(240, Math.min(640, vh - 24));
    return clampRtGeom({ x: Math.max(0, vw - w - 12), y: 12, w, h: h3 });
  }
  function loadRtGeom() {
    try {
      const raw = JSON.parse(
        window.localStorage.getItem(RT_GEOM_KEY) || "null"
      );
      if (raw && typeof raw === "object") return clampRtGeom(raw);
    } catch (e) {
    }
    return defaultRtGeom();
  }
  function Panel(props) {
    const embedded = !!(props && props.embedded);
    const st = useUI();
    const [engagements, setEngagements] = import_react2.default.useState([]);
    const [eng, setEng] = import_react2.default.useState(null);
    const [snapshot, setSnapshot] = import_react2.default.useState(null);
    const [err, setErr] = import_react2.default.useState(null);
    const [newName, setNewName] = import_react2.default.useState("");
    const [geom, setGeom] = import_react2.default.useState(loadRtGeom);
    const [creating, setCreating] = import_react2.default.useState(false);
    const [refreshKey, setRefreshKey] = import_react2.default.useState(0);
    const [digest, setDigest] = import_react2.default.useState(null);
    const [seen, setSeen] = import_react2.default.useState(null);
    import_react2.default.useEffect(() => {
      if (embedded) return void 0;
      try {
        window.localStorage.setItem(RT_GEOM_KEY, JSON.stringify(geom));
      } catch (e) {
      }
    }, [geom, embedded]);
    import_react2.default.useEffect(() => {
      if (embedded) return void 0;
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
            setErr(r && r.error || "\uBD88\uB7EC\uC624\uAE30 \uC2E4\uD328");
            return;
          }
          setErr(null);
          setSnapshot(r);
        },
        (e) => setErr(String(e && e.message || e))
      );
    };
    const refreshList = (selectId) => {
      api({ op: "bootstrap" }).then(
        (b) => {
          setEngagements(b && b.engagements || []);
          if (selectId) {
            setEng(selectId);
            loadSnapshot(selectId);
          }
        },
        () => {
        }
      );
    };
    import_react2.default.useEffect(() => {
      api({ op: "bootstrap" }).then(
        (r) => {
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC790\uC0B0 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
            return;
          }
          setEngagements(r.engagements || []);
          const id = r.current || r.engagements && r.engagements[0] && r.engagements[0].id || null;
          if (id) {
            setEng(id);
            loadSnapshot(id);
          }
        },
        (e) => setErr(String(e && e.message || e))
      );
    }, []);
    const openEngagement = (nameArg) => {
      const name2 = String(nameArg || newName).trim();
      if (!name2) return;
      setCreating(true);
      api({ op: "openEngagement", name: name2 }).then(
        (r) => {
          setCreating(false);
          if (!r || r.ok === false) {
            setErr(r && r.error || "\uC0DD\uC131 \uC2E4\uD328");
            return;
          }
          setNewName("");
          refreshList(r.engagement && r.engagement.id);
        },
        (e) => {
          setCreating(false);
          setErr(String(e && e.message || e));
        }
      );
    };
    const refreshAll = () => {
      setRefreshKey((k) => k + 1);
      api({ op: "bootstrap" }).then(
        (b) => {
          setEngagements(b && b.engagements || []);
          if (eng) loadSnapshot(eng);
        },
        () => {
          if (eng) loadSnapshot(eng);
        }
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
      if (e.target && e.target.closest && e.target.closest("button,a,input,select,textarea,label"))
        return;
      const sx = e.clientX;
      const sy = e.clientY;
      const ox = geom.x;
      const oy = geom.y;
      trackPointer(
        e,
        (ev) => setGeom(
          (g) => clampRtGeom({
            x: ox + (ev.clientX - sx),
            y: oy + (ev.clientY - sy),
            w: g.w,
            h: g.h
          })
        )
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
      trackPointer(
        e,
        (ev) => setGeom(
          (g) => clampRtGeom({ x: g.x, y: g.y, w: ow + (ev.clientX - sx), h: g.h })
        )
      );
    };
    const startResizeBottom = (e) => {
      const sy = e.clientY;
      const oh = geom.h;
      trackPointer(
        e,
        (ev) => setGeom(
          (g) => clampRtGeom({ x: g.x, y: g.y, w: g.w, h: oh + (ev.clientY - sy) })
        )
      );
    };
    const startResizeCorner = (e) => {
      const sx = e.clientX;
      const sy = e.clientY;
      const ow = geom.w;
      const oh = geom.h;
      trackPointer(
        e,
        (ev) => setGeom(
          (g) => clampRtGeom({
            x: g.x,
            y: g.y,
            w: ow + (ev.clientX - sx),
            h: oh + (ev.clientY - sy)
          })
        )
      );
    };
    import_react2.default.useEffect(() => {
      if (!eng) {
        setDigest(null);
        setSeen(null);
        return void 0;
      }
      setSeen(loadUnread(eng));
      let alive = true;
      let digestInflight = false;
      const tick = () => {
        if (digestInflight)
          return;
        digestInflight = true;
        api({ op: "consoleDigest", engagement: eng }).then(
          (r) => {
            if (alive && r && r.ok !== false && r.sections)
              setDigest(r.sections);
          },
          () => {
          }
        ).finally(() => {
          digestInflight = false;
        });
      };
      tick();
      const timer = window.setInterval(tick, 25e3);
      return () => {
        alive = false;
        window.clearInterval(timer);
      };
    }, [eng, refreshKey]);
    const markTabSeen = import_react2.default.useCallback(
      (tab) => {
        if (!eng) return;
        setSeen((prev) => {
          const base = prev || (() => {
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
      [eng, digest]
    );
    const unreadOf = (tab) => {
      if (!eng || !digest) return false;
      if (!seen) return false;
      return digestHasNew(seen[tab], digest[tab]);
    };
    const stats = snapshot && snapshot.stats || {};
    const tabs = [
      ["assets", "\uC790\uC0B0 \uB9E4\uD551"],
      ["env", "\uD658\uACBD \uC801\uC751"],
      ["agents", "\uC5D0\uC774\uC804\uD2B8"],
      ["sessions", "\uC138\uC158 \uD130\uB110"],
      ["findings", "\uCDE8\uC57D\uC810 \uC131\uACFC"],
      ["chain", "\uACF5\uACA9 \uCCB4\uC778"],
      ["scores", "\uB4DD\uC810 \uBAA9\uD45C"],
      ["report", "\uBCF4\uACE0\uC11C"],
      ["knowledge", "\uC9C0\uC2DD \uBCA0\uC774\uC2A4"],
      ["skills", "\uC2A4\uD0AC \uB77C\uC774\uBE0C\uB7EC\uB9AC"]
    ];
    const full = isFullWindow();
    const openFull = () => {
      try {
        window.open(
          window.location.href.split("#")[0] + "#redteam-full",
          "_blank",
          "noopener"
        );
      } catch (e) {
        setErr("\uC0C8 \uCC3D\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4: " + (e && e.message || e));
      }
    };
    const exitFull = () => {
      try {
        window.close();
      } catch (e) {
      }
      try {
        if (window.location.hash) {
          window.location.hash = "";
          window.location.reload();
        }
      } catch (e) {
      }
    };
    import_react2.default.useEffect(() => {
      if (!full) return void 0;
      const onKey = (e) => {
        if (e.key === "Escape") exitFull();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [full]);
    let body;
    if (err) body = h2("div", { className: "rt-err" }, err);
    else if (st.tab === "knowledge")
      body = h2(KnowledgeTab, { refreshKey });
    else if (st.tab === "env") body = h2(EnvTab, { refreshKey });
    else if (st.tab === "skills")
      body = h2(SkillsTab, { refreshKey });
    else if (st.tab === "agents" || st.tab === "prompts")
      body = h2(AgentsTab, { engagement: eng, refreshKey });
    else if (!eng) {
      body = h2(
        "div",
        { className: "rt-pane" },
        h2(
          "div",
          { className: "rt-card" },
          h2("h4", null, "\uC544\uC9C1 \uD0C0\uAE43\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"),
          h2(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--dsw-alias-label-secondary)",
                marginBottom: 8
              }
            },
            "\uACF5\uBC29 \uB4DC\uB9B4 \uB300\uC0C1 \uAE30\uAD00 \uC774\uB984\uC744 \uC785\uB825\uD558\uACE0 \uB4DC\uB9B4\uC744 \uB9CC\uB4E4\uC5B4 \uC790\uC0B0 \uB9E4\uD551\uC744 \uC2DC\uC791\uD558\uC138\uC694."
          ),
          h2(
            "div",
            { style: { display: "flex", gap: 8 } },
            h2("input", {
              className: "rt-input",
              style: { flex: 1 },
              placeholder: "\uC608: \u25CB\u25CB\uD14C\uD06C \uC8FC\uC2DD\uD68C\uC0AC",
              value: newName,
              onChange: (e) => setNewName(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter") openEngagement();
              }
            }),
            h2(
              "button",
              {
                className: "rt-btn rt-btn-primary",
                disabled: creating,
                onClick: () => openEngagement()
              },
              creating ? "\uC0DD\uC131 \uC911\u2026" : "\uD0C0\uAE43 \uB9CC\uB4E4\uAE30"
            )
          )
        )
      );
    } else if (st.tab === "assets")
      body = h2(AssetsTab, {
        engagement: eng,
        snapshot,
        refreshKey,
        onRefresh: refreshAll,
        onData: () => loadSnapshot(eng)
      });
    else if (st.tab === "testing")
      body = h2(AssetsTab, {
        engagement: eng,
        snapshot,
        refreshKey,
        onRefresh: refreshAll,
        onData: () => loadSnapshot(eng)
      });
    else if (st.tab === "sessions")
      body = h2(SessionTab, { engagement: eng, refreshKey });
    else if (st.tab === "findings")
      body = h2(FindingsTab, { engagement: eng, refreshKey });
    else if (st.tab === "chain")
      body = h2(ChainTab, { engagement: eng, refreshKey });
    else if (st.tab === "report")
      body = h2(ReportTab, { engagement: eng, refreshKey });
    else if (st.tab === "attackfiles")
      body = h2(FindingsTab, { engagement: eng, refreshKey });
    else if (st.tab === "scores")
      body = h2(ScoreTab, { engagement: eng, refreshKey });
    else body = h2("div", { className: "rt-empty" }, "\uC54C \uC218 \uC5C6\uB294 \uD0ED");
    const shellProps = full ? { className: "rt-full", style: { display: "flex" } } : embedded ? {
      className: "rt-dock rt-embedded",
      "data-open": "1",
      style: { width: "100%", display: "flex" }
    } : {
      className: "rt-dock",
      "data-open": st.open ? "1" : "0",
      style: {
        left: geom.x + "px",
        top: geom.y + "px",
        right: "auto",
        bottom: "auto",
        width: geom.w + "px",
        height: geom.h + "px",
        display: st.open ? "flex" : "none"
      }
    };
    return h2(
      "div",
      shellProps,
      full || embedded ? null : h2("div", {
        className: "rt-grip",
        title: "\uB4DC\uB798\uADF8\uD574\uC11C \uB108\uBE44 \uC870\uC815",
        onMouseDown: startResizeLeft
      }),
      full || embedded ? null : h2("div", {
        className: "rt-resize-r",
        title: "\uB4DC\uB798\uADF8\uD574\uC11C \uB108\uBE44 \uC870\uC815",
        onMouseDown: startResizeRight
      }),
      full || embedded ? null : h2("div", {
        className: "rt-resize-b",
        title: "\uB4DC\uB798\uADF8\uD574\uC11C \uB192\uC774 \uC870\uC815",
        onMouseDown: startResizeBottom
      }),
      full || embedded ? null : h2("div", {
        className: "rt-resize-c",
        title: "\uB4DC\uB798\uADF8\uD574\uC11C \uD06C\uAE30 \uC870\uC815",
        onMouseDown: startResizeCorner
      }),
      h2(
        "div",
        {
          className: "rt-head",
          onMouseDown: full || embedded ? void 0 : startDrag,
          title: full || embedded ? void 0 : "\uB204\uB978 \uCC44 \uB4DC\uB798\uADF8\uD558\uBA74 \uD328\uB110\uC774 \uC774\uB3D9\uD569\uB2C8\uB2E4"
        },
        embedded ? null : h2(
          "div",
          { className: "rt-title" },
          h2("span", { className: "rt-dot" }),
          full ? "\uB4DC\uB9B4 \uCF58\uC194 \xB7 \uC804\uCCB4 \uBCF4\uAE30" : "\uB4DC\uB9B4 \uCF58\uC194",
          full ? h2(
            "span",
            { className: "rt-tag", style: { marginLeft: 6 } },
            "\uB3C5\uB9BD \uCC3D"
          ) : null
        ),
        h2(
          "select",
          {
            className: "rt-input rt-eng-select",
            style: {
              maxWidth: embedded ? "100%" : "170px",
              minWidth: embedded ? "160px" : void 0,
              flex: embedded ? "1 1 200px" : void 0
            },
            value: eng || "",
            onChange: (e) => {
              setEng(e.target.value);
              loadSnapshot(e.target.value);
              api({
                op: "activateEngagement",
                engagement: e.target.value
              }).catch(() => {
              });
            }
          },
          h2(
            "option",
            { value: "", disabled: true },
            engagements.length ? "\uD0C0\uAE43 \uC120\uD0DD" : "\uD0C0\uAE43 \uC5C6\uC74C"
          ),
          engagements.map(
            (x) => h2(
              "option",
              { key: x.id, value: x.id },
              x.name || x.id || "\uC774\uB984 \uC5C6\uC74C"
            )
          )
        ),
        h2("div", { className: "rt-spacer" }),
        embedded ? null : h2(VersionBar, null),
        full ? h2(
          "button",
          {
            className: "rt-btn",
            title: "\uC0AC\uC774\uB4DC\uBC14\uAC00 \uC788\uB294 \uC77C\uBC18 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4(\uB610\uB294 Esc)",
            onClick: exitFull
          },
          "\uC804\uCCB4 \uBCF4\uAE30 \uC885\uB8CC"
        ) : null,
        embedded ? null : h2(
          "button",
          {
            className: "rt-btn",
            title: "\uBA85\uBD80\xB7\uC2A4\uB0C5\uC0F7\uACFC \uD604\uC7AC \uD398\uC774\uC9C0 \uB370\uC774\uD130\uB97C \uC0C8\uB85C \uACE0\uCE69\uB2C8\uB2E4",
            onClick: refreshAll
          },
          "\uC0C8\uB85C\uACE0\uCE68"
        ),
        full || embedded ? null : h2(
          "button",
          {
            className: "rt-btn",
            title: "\uC0C8 \uBE0C\uB77C\uC6B0\uC800 \uCC3D\uC5D0\uC11C \uC804\uCCB4 \uCF58\uC194\uC744 \uC5FD\uB2C8\uB2E4",
            onClick: openFull
          },
          "\uC804\uCCB4 \uBCF4\uAE30"
        ),
        full || embedded ? null : h2(
          "button",
          {
            className: "rt-btn",
            title: "\uD328\uB110 \uC811\uAE30",
            onClick: () => setUI({ open: false })
          },
          "\uC811\uAE30"
        )
      ),
      /* 탭 바는 표준 tablist/tab 역할을 쓴다: 스크린 리더가 “몇 번째 탭인지, 선택되었는지”를 읽는다.
            키보드 사용자는 Tab 으로 들어와 Enter/Space 로 전환한다(clickable 이 제공). */
      h2(
        "div",
        { className: "rt-tabs", role: "tablist" },
        tabs.map((t) => {
          const activate = () => {
            markTabSeen(t[0]);
            setUI({ tab: t[0] });
            setRefreshKey((k) => k + 1);
          };
          return h2(
            "div",
            Object.assign({}, clickable(activate, { label: t[1] }), {
              key: t[0],
              className: "rt-tab" + (st.tab === t[0] ? " on" : ""),
              role: "tab",
              "aria-selected": st.tab === t[0] ? "true" : "false",
              title: unreadOf(t[0]) ? t[1] + ": \uC0C8 \uB0B4\uC6A9\uC774 \uC788\uC2B5\uB2C8\uB2E4. \uC5F4\uC5B4\uC11C \uBCF4\uBA74 \uBE68\uAC04 \uC810\uC774 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4" : t[1]
            }),
            t[1],
            unreadOf(t[0]) ? (
              /* 빨간 점은 순수 시각 정보이므로 스크린 리더용 텍스트 대체를 준다 */
              h2("span", {
                className: "rt-tab-dot",
                "aria-label": "\uC0C8 \uB0B4\uC6A9 \uC788\uC74C"
              })
            ) : null
          );
        })
      ),
      h2(
        "div",
        { className: "rt-body", key: "body-" + st.tab },
        h2(RtBoundary, { key: st.tab }, body)
      ),
      h2(
        "div",
        { className: "rt-foot" },
        h2("span", null, "C \uBE14\uB85D " + (stats.segments || 0)),
        h2(
          "span",
          null,
          "\uC790\uC0B0 " + (stats.assets || 0) + "(\uC0DD\uC874 " + (stats.liveAssets || 0) + ")"
        ),
        h2("span", null, "\uD3EC\uD2B8 " + (stats.openPorts || 0)),
        h2("span", null, "\uC9C0\uBB38 " + (stats.fingerprints || 0)),
        h2("span", null, "\uCDE8\uC57D\uC810 " + (stats.vulns || 0)),
        h2(
          "span",
          null,
          "\uC218\uB3D9/\uB2A5\uB3D9 " + (stats.passiveSignals || 0) + "/" + (stats.activeSignals || 0)
        ),
        h2("div", { className: "rt-spacer" }),
        full ? h2(
          "span",
          null,
          "Esc \uB97C \uB204\uB974\uAC70\uB098 \uC624\uB978\uCABD \uC704 \u201C\uC804\uCCB4 \uBCF4\uAE30 \uC885\uB8CC\u201D\uB97C \uB204\uB974\uBA74 \uC0AC\uC774\uB4DC\uBC14\uAC00 \uC788\uB294 \uD654\uBA74\uC73C\uB85C \uB3CC\uC544\uAC11\uB2C8\uB2E4"
        ) : null,
        h2(
          "span",
          null,
          "SQLite \xB7 " + (snapshot && snapshot.engagement ? snapshot.engagement.name : "")
        )
      )
    );
  }
  function SidebarButton(props) {
    const st = useUI();
    return h2(
      "button",
      {
        className: "rt-icon-btn" + (st.open ? " on" : ""),
        title: "RedTeam \uCF58\uC194(\uC624\uB978\uCABD \uC0AC\uC774\uB4DC\uBC14 \uC0C1\uC8FC)",
        onClick: () => setUI({ open: !st.open })
      },
      h2("span", { style: { fontSize: 14 } }, "\u26E8"),
      props.wide ? h2("span", null, "RedTeam") : null
    );
  }
  function HeaderButton() {
    const st = useUI();
    return h2(
      "button",
      {
        className: "rt-hbtn" + (st.open ? " on" : ""),
        title: "RedTeam \uCF58\uC194(\uC624\uB978\uCABD \uC0AC\uC774\uB4DC\uBC14 \uC0C1\uC8FC)",
        onClick: () => setUI({ open: !st.open })
      },
      "\u26E8 RedTeam"
    );
  }
  function FullButton(props) {
    const open = () => {
      try {
        window.open(
          window.location.href.split("#")[0] + "#redteam-full",
          "_blank",
          "noopener"
        );
      } catch {
      }
    };
    return h2(
      "button",
      {
        className: "rt-icon-btn",
        title: "\uC804\uCCB4 \uBCF4\uAE30: \uC0C8 \uCC3D\uC5D0\uC11C \uC804\uCCB4 \uCF58\uC194\uC744 \uC5FD\uB2C8\uB2E4(\uD604\uC7AC \uCC3D\uC740 \uC601\uD5A5 \uC5C6\uC74C; \uC0C8 \uCC3D\uC5D0\uC11C Esc \uB85C \uC885\uB8CC)",
        onClick: open
      },
      h2("span", { style: { fontSize: 14 } }, "\u26F6"),
      props.wide ? h2("span", null, "\uC804\uCCB4 \uBCF4\uAE30") : null
    );
  }
  const inject2 = ["slots"];
  function applyDrillParts() {
    return {
      CSS,
      Panel,
      setUI,
      useUI,
      isFullWindow,
      setDockWidth
    };
  }
  exports.inject = inject2;
  return applyDrillParts();
})();

// src/state/dock.js
var AUTH_KEY = "dsh-purge-drill-auth";
var drillGrantGen = 0;
var drillGrantPosting = 0;
var drillGrantState = { ready: false, granted: false };
var drillSyncRetryTimer = null;
function readDrillAuth() {
  if (drillGrantState.ready) return drillGrantState.granted;
  try {
    return window.localStorage.getItem(AUTH_KEY) === "1";
  } catch {
    return false;
  }
}
function setDrillAuthLocal(ok) {
  try {
    if (ok) window.localStorage.setItem(AUTH_KEY, "1");
    else window.localStorage.removeItem(AUTH_KEY);
  } catch {
  }
  drillGrantState = { ready: true, granted: !!ok };
}
function writeDrillAuth(ok) {
  drillGrantGen += 1;
  const gen = drillGrantGen;
  setDrillAuthLocal(ok);
  if (!ok) return;
  drillGrantPosting += 1;
  fetch(apiUrl("/dsh-purge/drill-grant"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  }).then((r) => r.json()).then((saved) => {
    if (gen !== drillGrantGen) return;
    setDrillAuthLocal(!!(saved && saved.granted));
  }).catch(() => {
  }).finally(() => {
    drillGrantPosting = Math.max(0, drillGrantPosting - 1);
  });
}
function startGrantSync() {
  syncDrillGrant();
  return () => {
    drillGrantGen += 1;
    if (drillSyncRetryTimer) clearTimeout(drillSyncRetryTimer);
    drillSyncRetryTimer = null;
  };
}
function syncDrillGrant(attempt) {
  const n = attempt || 0;
  const gen = drillGrantGen;
  if (drillSyncRetryTimer) {
    try {
      clearTimeout(drillSyncRetryTimer);
    } catch {
    }
    drillSyncRetryTimer = null;
  }
  fetch(apiUrl("/dsh-purge/drill-grant"), { method: "GET" }).then((r) => r.json()).then((r) => {
    if (gen !== drillGrantGen) return;
    if (!r || r.ok === false) throw new Error("grant");
    if (r.granted) {
      setDrillAuthLocal(true);
      if (dockBus.authOpen) setDock({ authOpen: false });
      return;
    }
    if (drillGrantPosting > 0) return;
    setDrillAuthLocal(false);
    if (dockBus.authOpen || dockBus.tab === "drill") {
      setDock({
        open: true,
        tab: "drill",
        authOpen: true,
        pending: dockBus.pending || "tab"
      });
    }
  }).catch(() => {
    if (gen !== drillGrantGen) return;
    if (n < 5) {
      drillSyncRetryTimer = window.setTimeout(() => {
        drillSyncRetryTimer = null;
        syncDrillGrant(n + 1);
      }, 400);
    }
  });
}
var dockBus = {
  open: false,
  tab: "clean",
  authOpen: false,
  pending: "tab",
  listeners: /* @__PURE__ */ new Set()
};
function setDock(patch) {
  dockBus = Object.assign({}, dockBus, patch);
  if (patch.open && nativeSidebar) {
    try {
      nativeSidebar.openTab("dsh-purge");
    } catch {
    }
  }
  dockBus.listeners.forEach((fn) => {
    try {
      fn(dockBus);
    } catch {
    }
  });
}
function useDock() {
  const [st, setSt] = useState(dockBus);
  useEffect(() => {
    const fn = (next) => setSt(next);
    dockBus.listeners.add(fn);
    return () => {
      dockBus.listeners.delete(fn);
    };
  }, []);
  return st;
}
function requestDrill(kind) {
  const pending = kind || "tab";
  const openEnv = () => {
    try {
      if (__dshPurgeDrill && __dshPurgeDrill.setUI) {
        __dshPurgeDrill.setUI({ open: true, tab: "env" });
      }
    } catch {
    }
  };
  if (readDrillAuth()) {
    setDock({ open: true, tab: "drill", authOpen: false, pending: "tab" });
    try {
      if (__dshPurgeDrill && __dshPurgeDrill.setUI)
        __dshPurgeDrill.setUI({ open: true });
    } catch {
    }
    if (pending === "env") openEnv();
    if (pending === "full") {
      try {
        window.open(
          window.location.href.split("#")[0] + "#redteam-full",
          "_blank",
          "noopener"
        );
      } catch {
      }
    }
    return;
  }
  setDock({ open: true, tab: "drill", authOpen: true, pending });
}
function requestDrillEnv() {
  requestDrill("env");
}
var nativeSidebar = null;

// src/components/auth.js
var rd = __toESM(require("react-dom"), 1);

// src/shared/locale.js
var NS = "settings.dsh-purge-panel";
var translate = (key) => key;
function setTranslate(t) {
  translate = t;
}
function useT() {
  return translate;
}
var ko = {
  nav: "\uADDC\uCE59 \uC124\uC815",
  "dock.clean": "\uC815\uB9AC",
  "dock.drill": "\uB4DC\uB9B4 \uCF58\uC194",
  "dock.toggle": "dsh-purge",
  "dock.newSession": "dsh-purge",
  "dock.inSession": "dsh-purge",
  "dock.redteam": "\uB808\uB4DC\uD300 \uBAA8\uB4DC",
  "dock.full": "\uC804\uCCB4 \uBCF4\uAE30",
  "dock.close": "\uC811\uAE30",
  "dock.unauthorized": "\uBBF8\uC2B9\uC778",
  "welcome.title": "\uC0AC\uC6A9\uC790 \uACE0\uC9C0",
  "welcome.lead": "\uC774 \uD50C\uB7EC\uADF8\uC778\uC744 \uCC98\uC74C \uC124\uCE58\uD558\uBA74 \uB2E4\uC74C \uC548\uB0B4\uB97C \uC77D\uC5B4 \uC8FC\uC138\uC694. \uD655\uC778\uD558\uC2DC\uBA74 \uC774 \uCC3D\uC740 \uB2E4\uC2DC \uD45C\uC2DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "welcome.warn": "\uC774 \uD50C\uB7EC\uADF8\uC778\uC740 \uBB34\uB8CC \uC624\uD508\uC18C\uC2A4\uC785\uB2C8\uB2E4. \uC81C\uC791\uC790 \uBAB0\uB798 \uD310\uB9E4\uD558\uAC70\uB098 \uC720\uB8CC\uB85C \uB418\uD314\uAC70\uB098 \uC774 \uD504\uB85C\uC81D\uD2B8\uB85C \uC774\uC775\uC744 \uC5BB\uB294 \uD589\uC704\uB294 \uBC95\uC801 \uCC45\uC784\uC744 \uC9D1\uB2C8\uB2E4.",
  "welcome.body": "dsh-purge \uB294 DeepSeek Harness \uC758 \uB85C\uCEEC \uBCF4\uC548 \uB808\uB4DC\uD300 \uD3C9\uAC00\xB7\uC815\uB9AC \uD50C\uB7EC\uADF8\uC778\uC785\uB2C8\uB2E4. \uD1B5\uC81C\uB41C \uB85C\uCEEC \uD658\uACBD\uC5D0\uC11C \uD504\uB86C\uD504\uD2B8\uC640 \uD328\uCE58\uB97C \uC870\uC815\uD558\uACE0, \uC2B9\uC778 \uBC94\uC704 \uC548\uC5D0\uC11C \uB4DC\uB9B4 \uCF58\uC194 \uC791\uC5C5\uC744 \uD569\uB2C8\uB2E4. \uBB34\uB8CC\xB7\uBE44\uC601\uB9AC \uD504\uB85C\uC81D\uD2B8\uC774\uBA70 \uC18C\uC2A4 \uC800\uC7A5\uC18C\uB294 \uB2E4\uC74C\uACFC \uAC19\uC2B5\uB2C8\uB2E4:",
  "welcome.repo": "https://github.com/YuJunZhiXue/dsh-purge",
  "welcome.ban1": "\uC2B9\uC778\uB418\uC9C0 \uC54A\uC740 \uB124\uD2B8\uC6CC\uD06C \uACF5\uACA9, \uCE68\uC785, \uB370\uC774\uD130 \uD0C8\uCDE8, \uC2DC\uC2A4\uD15C \uD30C\uAD34, \uADF8 \uBC16\uC758 \uC704\uBC95 \uD589\uC704\uC5D0 \uC774 \uD504\uB85C\uC81D\uD2B8\uB97C \uC4F0\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.",
  "welcome.ban2": "\uC0C1\uC5C5\uC801 \uD310\uB9E4, \uC720\uB8CC \uB418\uD314\uAE30, \uD68C\uC0C9\xB7\uAC80\uC740 \uC2DC\uC7A5 \uC218\uC775, \uC81C\uC791\uC790\uB97C \uC228\uAE34 \uC601\uB9AC \uBAA9\uC801 \uC7AC\uBC30\uD3EC\uB97C \uAE08\uC9C0\uD569\uB2C8\uB2E4.",
  "welcome.ban3": "\uC0AC\uC6A9\uC790\uB294 \uAC70\uC8FC\uC9C0 \uBC95\uB839\uACFC \uD50C\uB7AB\uD3FC \uADDC\uBC94\uC744 \uC2A4\uC2A4\uB85C \uC9C0\uCF1C\uC57C \uD569\uB2C8\uB2E4. \uC704\uBC95\uC758 \uACB0\uACFC\uB294 \uD589\uC704\uC790\uAC00 \uC9C0\uBA70 \uC81C\uC791\uC790\uC640 \uBB34\uAD00\uD569\uB2C8\uB2E4.",
  "welcome.bans": "\uAE08\uC9C0 \uC0AC\uD56D",
  "welcome.check": "\uC704 \uC0AC\uC6A9\uC790 \uACE0\uC9C0\uB97C \uC77D\uACE0 \uC774\uD574\uD588\uC73C\uBA70 \uD569\uBC95\uC801\uC73C\uB85C \uC4F0\uB294 \uB370 \uB3D9\uC758\uD569\uB2C8\uB2E4.",
  "welcome.ok": "\uD655\uC778\uD558\uBA70 \uACC4\uC18D\uD569\uB2C8\uB2E4",
  "auth.title": "\uB4DC\uB9B4 \uCF58\uC194 \uC2B9\uC778 \uD655\uC778",
  "auth.lead": "\uC815\uB9AC\uC5D0\uB294 \uC774 \uB2E8\uACC4\uAC00 \uD544\uC694 \uC5C6\uC2B5\uB2C8\uB2E4. \uB4DC\uB9B4 \uCF58\uC194\uC5D0 \uCC98\uC74C \uB4E4\uC5B4\uAC00\uAC70\uB098 \uC804\uCCB4 \uBCF4\uAE30\uB97C \uC5F4 \uB54C\uB294 \uC774 \uCC3D\uC744 \uBA3C\uC800 \uB05D\uB0B4\uC138\uC694.",
  "auth.warn": "\uBCF4\uC548 \uACBD\uACE0: \uB4DC\uB9B4 \uCF58\uC194\uC740 \uAD00\uB9AC \uAD8C\uD55C\uC774 \uC788\uB294 \uB85C\uCEEC \uD638\uC2A4\uD2B8, \uC624\uD504\uB77C\uC778 \uD45C\uC801, \uC11C\uBA74 \uC2B9\uC778\uC744 \uBC1B\uC740 \uB4DC\uB9B4 \uD658\uACBD\uC5D0\uB9CC \uC4F0\uC138\uC694. \uC2B9\uC778 \uC5C6\uB294 \uCE68\uD22C\xB7\uACF5\uACA9\xB7\uD0C8\uCDE8\xB7\uD30C\uAD34\uB294 \uC77C\uC808 \uAE08\uC9C0\uD569\uB2C8\uB2E4.",
  "auth.hint.wait": "\uC120\uC5B8\uC744 \uC77D\uC5B4 \uC8FC\uC138\uC694. {n}\uCD08 \uD6C4\uC5D0 \uC120\uD0DD\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  "auth.hint.scroll": "\uCE74\uC6B4\uD2B8\uB2E4\uC6B4\uC774 \uB05D\uB0AC\uC2B5\uB2C8\uB2E4. \uC120\uC5B8\uC744 \uB05D\uAE4C\uC9C0 \uC2A4\uD06C\uB864\uD55C \uB4A4 \uCCB4\uD06C\uD558\uC138\uC694.",
  "auth.hint.check": "\uCE74\uC6B4\uD2B8\uB2E4\uC6B4\uC774 \uB05D\uB0AC\uC2B5\uB2C8\uB2E4. \uC138 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uCCB4\uD06C\uD558\uC138\uC694.",
  "auth.check.read": "'\uBCF4\uC548 \uBC0F \uC704\uBC95 \uAE08\uC9C0 \uC120\uC5B8'\uC744 \uB2E4 \uC77D\uC5C8\uACE0 \uBAA8\uB4E0 \uC870\uD56D\uC744 \uC778\uC815\uD569\uB2C8\uB2E4.",
  "auth.check.scope": "\uB85C\uCEEC \uC2B9\uC778 \uD658\uACBD, \uC624\uD504\uB77C\uC778 \uD45C\uC801, \uADDC\uC815\uC744 \uC9C0\uD0A8 \uB4DC\uB9B4\uC5D0\uB9CC \uC4F0\uACA0\uB2E4\uACE0 \uD655\uC778\uD569\uB2C8\uB2E4.",
  "auth.check.ban": "\uC5B4\uB5A4 \uC704\uBC95 \uC6A9\uB3C4\uB85C\uB3C4 \uC4F0\uC9C0 \uC54A\uACA0\uB2E4\uACE0 \uD655\uC778\uD569\uB2C8\uB2E4. \uC774 \uC2B9\uC778\uC744 \uB9C8\uCE58\uC9C0 \uC54A\uC73C\uBA74 \uB4DC\uB9B4 \uCF58\uC194\uC744 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
  "auth.no": "\uB4E4\uC5B4\uAC00\uC9C0 \uC54A\uC74C",
  "auth.ok": "\uC2B9\uC778 \uD655\uC778",
  "auth.ok.tab": "\uC2B9\uC778\uD558\uACE0 \uB4DC\uB9B4 \uCF58\uC194 \uC5F4\uAE30",
  "auth.ok.full": "\uC2B9\uC778\uD558\uACE0 \uC804\uCCB4 \uBCF4\uAE30 \uC5F4\uAE30",
  "auth.ok.env": "\uC2B9\uC778\uD558\uACE0 \uD658\uACBD \uC801\uC751 \uC5F4\uAE30",
  "envGate.title": "\uD658\uACBD\uC774 \uC544\uC9C1 \uC900\uBE44\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4",
  "envGate.lead": "\uB808\uB4DC\uD300 \uBAA8\uB4DC\uB294 \uBCF4\uB0B4\uAE30 \uC804\uC5D0 \uB85C\uCEEC \uB3C4\uAD6C\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4. \uC4F8 \uC218 \uC788\uB294 \uD658\uACBD\uC774 \uAC10\uC9C0\uB418\uC9C0 \uC54A\uC73C\uBA74 \uBA3C\uC800 \uD658\uACBD \uC801\uC751\uC73C\uB85C \uAC00\uAC70\uB098 \uC124\uC815\uD558\uC9C0 \uC54A\uC74C\uC744 \uD655\uC778\uD558\uC138\uC694.",
  "envGate.kaliHint": "Kali \uAC00 \uAC10\uC9C0\uB418\uBA74 \uB85C\uCEEC \uB3C4\uAD6C\uB97C \uBC14\uB85C \uC4F0\uACE0 \uACBD\uB85C\uB97C \uB123\uC9C0 \uC54A\uC544\uB3C4 \uB429\uB2C8\uB2E4. Kali \uAC00 \uC5C6\uC73C\uBA74 \uD658\uACBD \uC801\uC751\uC5D0\uC11C \uAC01 \uB3C4\uAD6C \uACBD\uB85C\uB97C \uB123\uAC70\uB098 \uD1B5\uD569 \uD3F4\uB354 \uD558\uB098\uB97C \uACE8\uB77C \uC790\uB3D9 \uBC30\uBD84\uD558\uC138\uC694.",
  "envGate.skip": "\uC9C0\uAE08\uC740 \uC124\uC815 \uC548 \uD568",
  "envGate.skipConfirm": "\uD655\uC778\uD558\uBA74 \uC774\uBC88\uC5D0\uB294 \uB300\uD654\uB97C \uACC4\uC18D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC2A4\uCE94\xB7\uD65C\uC6A9 \uACC4\uC5F4 \uC2A4\uD0AC\uC740 \uB3C4\uAD6C\uAC00 \uC5C6\uC5B4 \uC5EC\uC804\uD788 \uC4F8 \uC218 \uC5C6\uACE0, \uC774\uD6C4 dsh-purge \u2192 \uD658\uACBD \uC801\uC751\uC5D0\uC11C \uACBD\uB85C\uB97C \uCC44\uC6B8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
  "envGate.skipNo": "\uB3CC\uC544\uAC00\uAE30",
  "envGate.skipYes": "\uC124\uC815\uD558\uC9C0 \uC54A\uACE0 \uACC4\uC18D",
  "envGate.go": "\uD658\uACBD \uC801\uC751 \uC5F4\uAE30",
  "compat.host": "dsh-purge Community {version} \xB7 \uD638\uC2A4\uD2B8 DSH {host} \xB7 \uD638\uD658 \uB4F1\uAE09: {level}",
  "compat.loading": "\uD638\uC2A4\uD2B8 \uBC84\uC804\uC744 \uC77D\uB294 \uC911\u2026",
  "compat.unavailable": "\uD638\uC2A4\uD2B8 \uD638\uD658 \uC815\uBCF4\uB97C \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "compat.level.qualified": "\uD68C\uADC0 \uAC80\uC99D \uC644\uB8CC",
  "compat.level.unverified": "\uBBF8\uAC80\uC99D \uBC84\uC804",
  "compat.level.mixed": "\uCEF4\uD3EC\uB10C\uD2B8 \uBC84\uC804 \uBD88\uC77C\uCE58",
  "compat.level.no-host": "\uD638\uC2A4\uD2B8 \uBBF8\uD655\uC778",
  "compat.level.unknown": "\uC54C \uC218 \uC5C6\uC74C",
  "theme.aria": "\uD14C\uB9C8",
  "theme.white": "\uB77C\uC774\uD2B8",
  "theme.ink": "\uC789\uD06C",
  "purge.title": "\uD328\uCE58",
  "override.title": "\uD504\uB86C\uD504\uD2B8",
  "own.title": "\uB0B4 \uC11C\uBC84",
  "own.hint": "\uD55C \uC904\uC5D0 IP \uD558\uB098 \uB610\uB294 \uC804\uCCB4 \uD638\uC2A4\uD2B8\uBA85 \uD558\uB098\uC785\uB2C8\uB2E4. \uACC4\uC815@\uD638\uC2A4\uD2B8 \uD615\uD0DC\uB3C4 \uB418\uACE0, \uACC4\uC815\uC740 \uC774 \uD45C\uAE30\uB97C \uC54C\uC544\uBCF4\uB294 \uC6A9\uB3C4\uC77C \uBFD0\uC785\uB2C8\uB2E4. \uD638\uC2A4\uD2B8\uBA85\uC740 \uADF8\uB54C \uD574\uC11D\uB41C \uC8FC\uC18C\uAE4C\uC9C0 \uD568\uAED8 \uD1B5\uACFC\uC2DC\uD0B5\uB2C8\uB2E4. \uD0A4, \uBE44\uBC00\uBC88\uD638, \uB300\uC5ED\uC740 \uC4F0\uC9C0 \uB9C8\uC138\uC694.",
  "own.save": "\uBAA9\uB85D \uC800\uC7A5",
  "saved.own": "\uB0B4 \uC11C\uBC84\uB97C \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4",
  "saved.own.dropped": "\uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. {n}\uAC1C \uC904\uC774 \uB2E8\uC77C IP \uB098 \uD638\uC2A4\uD2B8\uBA85\uC774 \uC544\uB2C8\uC5B4\uC11C \uBC84\uB838\uC2B5\uB2C8\uB2E4",
  "metric.purged": "\uAE30\uB85D\uB428",
  "metric.purged.skip": "\uAE30\uB85D\uB428. {n}\uAC1C \uD56D\uBAA9\uC744 \uAC74\uB108\uB6F0\uC5C8\uC2B5\uB2C8\uB2E4. \uC774 \uC124\uCE58\uBCF8\uC5D0 \uADF8 \uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
  "metric.pendingShort": "\uB300\uAE30 {n}",
  "metric.unmatchedShort": "\uBD88\uC77C\uCE58 {n}",
  "metric.partialShort": "\uBD80\uBD84 \uC801\uC911 {n}",
  "metric.driftedShort": "\uC575\uCEE4 \uB4DC\uB9AC\uD504\uD2B8 {n}",
  "metric.disabledShort": "\uC120\uD0DD \uD574\uC81C {n}",
  "metric.skipShort": "\uAC74\uB108\uB700 {n}",
  "metric.unlocated.count": "\u2014",
  "metric.shim": "shim",
  "metric.shim.na": "\uC774 \uCABD\uC5D0\uB294 \uBD88\uD544\uC694",
  "metric.bak.yes": "\uBC31\uC5C5 \uC788\uC74C",
  "metric.bak.no": "\uBC31\uC5C5 \uC5C6\uC74C",
  "metric.bak.hint": "\uBC31\uC5C5",
  "table.patch": "\uD56D\uBAA9",
  "table.status": "\uC0C1\uD0DC",
  "status.applied": "\uC801\uC6A9\uB428",
  "status.off": "\uAEBC\uC9D0",
  "status.pending": "\uC801\uC6A9 \uB300\uAE30",
  "status.unmatched": "\uBD88\uC77C\uCE58",
  "status.partial": "\uBD80\uBD84 \uC801\uC911",
  "status.partialDetail": "({done}/{total} \uB300\uC0C1)",
  "status.drifted": "\uC575\uCEE4 \uB4DC\uB9AC\uD504\uD2B8",
  "status.disabled": "\uC120\uD0DD \uD574\uC81C",
  "status.skipped": "\uAC74\uB108\uB700",
  "apply.hint": "\uC801\uC6A9\uC744 \uB204\uB974\uBA74 \uD328\uCE58\uB97C \uC4F0\uACE0 \uD604\uC7AC \uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8\uB97C \uAC78\uC5B4 \uB461\uB2C8\uB2E4. \uC0C1\uC790\uC5D0 \uD50C\uB7EC\uADF8\uC778 \uC61B \uAE30\uBCF8\uAC12\uC774 \uB0A8\uC544 \uC788\uC73C\uBA74 \uC554\uD638\uD654 \uC2AC\uB86F\uC5D0\uC11C \uC790\uB3D9\uC73C\uB85C \uC0C8\uB85C \uACE0\uCE58\uBBC0\uB85C \uC800\uC7A5\uC744 \uB2E4\uC2DC \uB204\uB97C \uD544\uC694\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uC9C1\uC811 \uC4F4 \uC6D0\uACE0\uB9CC \uC0C1\uC790 \uB0B4\uC6A9\uB300\uB85C \uAE30\uB85D\uB429\uB2C8\uB2E4. \uC801\uC6A9 \uB300\uAE30=\uC6D0\uBB38\uC774 \uC544\uC9C1 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4. \uAC74\uB108\uB700=\uC774 \uBC84\uC804\uC5D0 \uBD88\uD544\uC694\uD558\uAC70\uB098 \uCEF4\uD3EC\uB10C\uD2B8\uAC00 \uC124\uCE58\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.",
  "warn.noRoot": "\uD604\uC7AC \uD638\uC2A4\uD2B8\uC758 @deepseek-ai \uB97C \uCC3E\uC9C0 \uBABB\uD574 \uC815\uB9AC\uAC00 \uC801\uC6A9\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC644\uC804\uD788 \uC885\uB8CC\uD55C \uB4A4 \uC774 \uD638\uC2A4\uD2B8\uB97C \uB2E4\uC2DC \uC5F4\uACE0 \uC774 \uD398\uC774\uC9C0\uC5D0\uC11C '\uC801\uC6A9'\uC744 \uB204\uB974\uC138\uC694. \uB370\uC2A4\uD06C\uD1B1 \uC124\uCE58 \uACBD\uB85C\uB294 \uC5B4\uB290 \uB4DC\uB77C\uC774\uBE0C\uB4E0 \uB418\uACE0, \uB514\uB809\uD130\uB9AC \uC774\uB984\uC5D0 DeepseekHarness / DeepSeek Harness \uAC00 \uC788\uC73C\uBA74 \uB429\uB2C8\uB2E4.",
  "warn.noRoot.desktop": "\uACF5\uC2DD \uD074\uB77C\uC774\uC5B8\uD2B8 \uCF54\uB4DC\uB294 app.asar \uC548\uC5D0 \uC788\uC2B5\uB2C8\uB2E4. '\uC801\uC6A9'\uC744 \uB204\uB974\uBA74 \uD480\uACE0 \uC790\uB3D9\uC73C\uB85C \uC7AC\uC2DC\uC791\uD558\uBBC0\uB85C \uC2A4\uD06C\uB9BD\uD2B8\uB97C \uB530\uB85C \uB3CC\uB9B4 \uD544\uC694\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uACC4\uC18D \uCC3E\uC9C0 \uBABB\uD55C\uB2E4\uACE0 \uB728\uBA74 \uD074\uB77C\uC774\uC5B8\uD2B8\uB97C \uC644\uC804\uD788 \uC885\uB8CC\uD588\uB2E4\uAC00 \uB2E4\uC2DC \uC5F0 \uB4A4 '\uC801\uC6A9'\uC744 \uB204\uB974\uC138\uC694. \uC11C\uB4DC\uD30C\uD2F0 DSH Desktop \uC740 \uBC14\uB85C '\uC801\uC6A9'\uC744 \uB204\uB974\uC138\uC694.",
  "unpack.restarting": "\uD328\uCE58\uB97C \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4. '\uC7AC\uC2DC\uC791'\uC744 \uB204\uB974\uBA74 \uD074\uB77C\uC774\uC5B8\uD2B8\uAC00 \uC2A4\uC2A4\uB85C \uB2E4\uC2DC \uC5F4\uB9BD\uB2C8\uB2E4.",
  "restart.fullQuit": "\uC7AC\uC2DC\uC791 \uC911\uC785\uB2C8\uB2E4. \uD074\uB77C\uC774\uC5B8\uD2B8\uAC00 \uC2A4\uC2A4\uB85C \uB2E4\uC2DC \uC5F4\uB9BD\uB2C8\uB2E4.",
  "warn.noInject": "\uACF5\uC2DD\uC740 \uD56D\uC0C1 \uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8\uB97C \uC501\uB2C8\uB2E4. \uB808\uB4DC\uD300\uC5D0\uC11C \uADDC\uCE59 \uC138\uD2B8\uB97C \uCF1C\uBA74 \uADDC\uCE59 \uC138\uD2B8\uB9CC \uC4F0\uACE0, \uCF1C\uC9C0 \uC54A\uC73C\uBA74 CTF \uB97C \uBE80 \uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8\uB97C \uC4F4 \uB4A4 \uB808\uB4DC\uD300 \uC791\uC5C5\uC744 \uC787\uC2B5\uB2C8\uB2E4. \uC591\uCABD\uC774 \uBAA8\uB450 \uBE44\uBA74 \uCD94\uAC00\uD574\uC57C \uD55C\uB2E4\uACE0 \uC54C\uB9BD\uB2C8\uB2E4.",
  "need.prompt": "\uD504\uB86C\uD504\uD2B8\uC640 \uADDC\uCE59 \uC138\uD2B8\uAC00 \uBAA8\uB450 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uD504\uB86C\uD504\uD2B8\uB97C \uBA3C\uC800 \uCD94\uAC00\uD558\uAC70\uB098 \uB0B4\uC6A9\uC774 \uC788\uB294 \uADDC\uCE59 \uC138\uD2B8\uB97C \uCF1C\uC57C \uD569\uB2C8\uB2E4.",
  "btn.restoreInject": "\uAE30\uBCF8\uAC12 \uB418\uB3CC\uB9AC\uAE30",
  "saved.restoreInject": "\uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8\uB97C \uB418\uB3CC\uB838\uC2B5\uB2C8\uB2E4",
  skip: "\uAC74\uB108\uB700",
  unknown: "\uC54C \uC218 \uC5C6\uC74C",
  delete: "\uC0AD\uC81C",
  "btn.apply": "\uC801\uC6A9",
  "btn.apply.busy": "\uCC98\uB9AC \uC911\u2026",
  "btn.revert": "\uB418\uB3CC\uB9AC\uAE30",
  "btn.uninstall": "\uC81C\uAC70",
  "btn.uninstall.busy": "\uC81C\uAC70 \uC911\u2026",
  "uninstall.title": "dsh-purge \uC81C\uAC70",
  "uninstall.body": "\uC81C\uAC70\uD560\uAE4C\uC694? \uC81C\uAC70\uD558\uBA74 \uC6D0\uBCF8\uC73C\uB85C \uB418\uB3CC\uB9AC\uACE0 \uC774 \uD50C\uB7EC\uADF8\uC778\uC758 \uBAA8\uB4E0 \uD30C\uC77C\uACFC \uD328\uCE58\uB97C \uC9C0\uC6C1\uB2C8\uB2E4.",
  "uninstall.confirm": "\uC81C\uAC70 \uD655\uC778",
  "uninstall.cancel": "\uCDE8\uC18C",
  "uninstall.applying": "\uC81C\uAC70\uD558\uACE0 \uB418\uB3CC\uB9AC\uB294 \uC911\u2026",
  "uninstall.done": "\uC81C\uAC70\uD558\uACE0 \uB418\uB3CC\uB838\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uC791 \uC911\u2026",
  "uninstall.done.desktop": "\uC81C\uAC70\uD558\uACE0 \uB418\uB3CC\uB838\uC2B5\uB2C8\uB2E4. \uB370\uC2A4\uD06C\uD1B1 \uC571\uC744 \uC7AC\uC2DC\uC791 \uC911\u2026",
  "uninstall.fail": "\uC81C\uAC70\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "btn.checkUpdate": "\uC5C5\uB370\uC774\uD2B8 \uD655\uC778",
  "btn.checkUpdate.busy": "\uD655\uC778 \uC911\u2026",
  "btn.doUpdate": "\uC5C5\uB370\uC774\uD2B8",
  "btn.doUpdate.busy": "\uC5C5\uB370\uC774\uD2B8 \uC911\u2026",
  "channel.title": "\uCC44\uB110",
  "channel.stable": "\uC815\uC2DD \uBC84\uC804",
  "channel.beta": "\uBCA0\uD0C0 \uBC84\uC804",
  "channel.useStable": "\uC815\uC2DD \uBC84\uC804\uC73C\uB85C \uC804\uD658",
  "channel.useBeta": "\uBCA0\uD0C0 \uBC84\uC804\uC73C\uB85C \uC804\uD658",
  "channel.local": "\uC774 \uC124\uCE58\uBCF8",
  "update.checking": "\uC5C5\uB370\uC774\uD2B8\uB97C \uD655\uC778\uD558\uB294 \uC911\u2026",
  "update.applying": "\uC5C5\uB370\uC774\uD2B8 \uC911\u2026",
  "update.switching": "\uBC84\uC804\uC744 \uC804\uD658\uD558\uB294 \uC911\u2026",
  "update.latest": "\uC774\uBBF8 \uCD5C\uC2E0\uC785\uB2C8\uB2E4 ({version})",
  "update.available": "\uC0C8 \uBC84\uC804 {remote} \uC774 \uC788\uC2B5\uB2C8\uB2E4. \uD604\uC7AC {local}",
  "update.pinned": "{version} \uC5D0 \uACE0\uC815\uB418\uC5B4 \uC788\uACE0 \uCC44\uB110 \uCD5C\uC2E0\uC740 {remote} \uC785\uB2C8\uB2E4",
  "update.done": "{version} \uC73C\uB85C \uC5C5\uB370\uC774\uD2B8\uD588\uC2B5\uB2C8\uB2E4",
  "update.restarting": "\uB418\uB3CC\uB9B0 \uB4A4 \uC0C8 \uD328\uCE58\uB97C \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uC791 \uC911\u2026",
  "update.fullQuit": "\uD328\uCE58\uB97C \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4. '\uC7AC\uC2DC\uC791'\uC744 \uB204\uB974\uBA74 \uD074\uB77C\uC774\uC5B8\uD2B8\uAC00 \uC2A4\uC2A4\uB85C \uB2E4\uC2DC \uC5F4\uB9BD\uB2C8\uB2E4.",
  "restart.official.title": "\uC7AC\uC2DC\uC791 \uD544\uC694",
  "restart.official.body": "\uD328\uCE58\uB97C \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uC791\uC744 \uB204\uB974\uBA74 \uD074\uB77C\uC774\uC5B8\uD2B8\uAC00 \uC2A4\uC2A4\uB85C \uB2E4\uC2DC \uC5F4\uB9BD\uB2C8\uB2E4.",
  "update.switched": "{version} \uC73C\uB85C \uC804\uD658\uD588\uC2B5\uB2C8\uB2E4",
  "update.autoDone": "{version} \uC73C\uB85C \uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8\uD588\uC2B5\uB2C8\uB2E4",
  "update.reloading": "\uC124\uC815 \uD398\uC774\uC9C0\uB97C \uC0C8\uB85C \uACE0\uCE58\uB294 \uC911\u2026",
  "update.dirty": "\uC0C8 \uBC84\uC804\uC774 \uC788\uC2B5\uB2C8\uB2E4. \uB85C\uCEEC \uBCC0\uACBD\uBD84\uC740 \uC790\uB3D9\uC73C\uB85C \uB36E\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4",
  "update.fail": "\uC5C5\uB370\uC774\uD2B8\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "update.timeout": "\uD655\uC778 \uC2DC\uAC04\uC774 \uCD08\uACFC\uB410\uC2B5\uB2C8\uB2E4. \uC5C5\uB370\uC774\uD2B8 \uD655\uC778\uC744 \uB2E4\uC2DC \uB204\uB974\uC138\uC694",
  "update.needRestart": "\uD655\uC778 \uC778\uD130\uD398\uC774\uC2A4\uAC00 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. dsh \uB97C \uBA3C\uC800 \uC7AC\uC2DC\uC791\uD55C \uB4A4 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778\uC744 \uB204\uB974\uC138\uC694",
  "update.noBeta": "\uC544\uC9C1 \uBCA0\uD0C0 \uBC84\uC804\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
  "update.switch": "\uC774 \uBC84\uC804\uC73C\uB85C \uC804\uD658",
  "update.pick": "\uBC84\uC804 \uC120\uD0DD",
  "update.tip": "\uCD5C\uC2E0",
  "update.current": "\uD604\uC7AC",
  "update.confirmSwitch": "{version} \uC73C\uB85C \uC804\uD658\uD560\uAE4C\uC694? \uC774\uD6C4 \uB2E4\uB978 \uCC44\uB110\uC774\uB098 \uB2E4\uB978 \uBC84\uC804\uC73C\uB85C \uB418\uB3CC\uB9B4 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uCEE4\uBC0B\uB418\uC9C0 \uC54A\uC740 \uB85C\uCEEC \uD50C\uB7EC\uADF8\uC778 \uBCC0\uACBD\uBD84\uC740 \uB0A8\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "update.confirmChannel": "{version} \uC73C\uB85C \uC804\uD658\uD560\uAE4C\uC694? \uD574\uB2F9 \uCC44\uB110\uC5D0\uC11C \uD50C\uB7EC\uADF8\uC778\uC744 \uB2E4\uC2DC \uC124\uCE58\uD558\uBA70, \uCEE4\uBC0B\uB418\uC9C0 \uC54A\uC740 \uB85C\uCEEC \uBCC0\uACBD\uBD84\uC740 \uB0A8\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "metric.version": "\uBC84\uC804",
  "action.apply": "\uC801\uC6A9",
  "action.revert": "\uB418\uB3CC\uB9AC\uAE30",
  "action.uninstall": "\uC81C\uAC70",
  "ok.done": "\uC644\uB8CC",
  "err.action": "\uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "err.status": "\uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "err.override": "\uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "err.rules": "\uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "err.read": "\uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "err.save": "\uC800\uC7A5\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "btn.saveInject": "\uC800\uC7A5",
  "saved.override": "\uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4",
  "rules.title": "\uADDC\uCE59 \uC138\uD2B8",
  "rules.none": "\uC5C6\uC74C",
  "rules.reset": "\uB418\uB3CC\uB9AC\uAE30",
  "rules.reset.confirm": "\uC804\uC5ED \uC9C0\uC2DC \uD30C\uC77C\uC744 \uB418\uB3CC\uB9B4\uAE4C\uC694? \uADDC\uCE59 \uB77C\uC774\uBE0C\uB7EC\uB9AC\uB294 \uB0A8\uC2B5\uB2C8\uB2E4.",
  "rules.empty": "\uADDC\uCE59\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
  "rules.pick": "\uADDC\uCE59 \uC120\uD0DD",
  "policy.title": "\uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC815\uCC45",
  "policy.strict": "\uC5C4\uACA9",
  "policy.fallback": "\uBE48 \uCE78 \uD3F4\uBC31",
  "policy.always": "\uD56D\uC0C1 \uD5C8\uC6A9",
  "policy.hint": "\uC5C4\uACA9: \uD56D\uC0C1 AGENTS.md / CLAUDE.md \uB97C \uC81C\uAC70\uD569\uB2C8\uB2E4. \uBE48 \uCE78 \uD3F4\uBC31: \uD504\uB86C\uD504\uD2B8 \uC0C1\uC790\uAC00 \uBE44\uC5C8\uC744 \uB54C\uB9CC \uC501\uB2C8\uB2E4. \uD56D\uC0C1 \uD5C8\uC6A9: DSH \uC6D0\uB798 \uB3D9\uC791\uC744 \uC720\uC9C0\uD569\uB2C8\uB2E4",
  "cwd.title": "\uB85C\uCEEC \uADDC\uCE59 (\uD604\uC7AC \uB514\uB809\uD130\uB9AC)",
  "cwd.empty": "\uD604\uC7AC \uB514\uB809\uD130\uB9AC\uC5D0 AGENTS.md / CLAUDE.md \uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
  "cwd.rescan": "\uB2E4\uC2DC \uC2A4\uCE94",
  "cwd.hint": "\uD504\uB86C\uD504\uD2B8 \uC0C1\uC790\uAC00 \uBE44\uC5C8\uC744 \uB54C\uB9CC \uCCB4\uD06C\uB41C \uB85C\uCEEC \uD30C\uC77C\uC774 \uD3F4\uBC31\uC73C\uB85C \uC8FC\uC785\uB429\uB2C8\uB2E4. \uD504\uB86C\uD504\uD2B8 \uC0C1\uC790\uC5D0 \uB0B4\uC6A9\uC774 \uC788\uC73C\uBA74 \uC774 \uD30C\uC77C\uB4E4\uC744 \uC4F0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "cwd.scope.cwd": "\uD604\uC7AC \uB514\uB809\uD130\uB9AC",
  "cwd.scope.ancestor": "\uC0C1\uC704",
  "cwd.scope.root": "\uD504\uB85C\uC81D\uD2B8 \uB8E8\uD2B8",
  "cwd.no.workspace": "DSH \uAC00 \uC544\uC9C1 \uC791\uC5C5 \uB514\uB809\uD130\uB9AC\uB97C \uACE0\uB974\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. DSH \uC5D0\uC11C \uBA3C\uC800 \uC791\uC5C5\uC744 \uC2DC\uC791\uD55C \uB4A4 \uB3CC\uC544\uC624\uC138\uC694.",
  "pill.current": "\uD604\uC7AC",
  "btn.use": "\uC0AC\uC6A9",
  "btn.inUse": "\uD604\uC7AC",
  "confirm.delete": "{id} \uC0AD\uC81C\uD560\uAE4C\uC694?",
  "ph.id": "id",
  "ph.alias": "\uC774\uB984",
  "ph.alias.short": "\uC774\uB984",
  "btn.create": "\uC0C8\uB85C \uB9CC\uB4E4\uAE30",
  "need.id": "id \uAC00 \uD544\uC694\uD569\uB2C8\uB2E4",
  "ph.content": "",
  "btn.saveRule": "\uC800\uC7A5",
  "skills.title": "Skill",
  "skills.hint": "\uACF5\uC2DD \uB514\uB809\uD130\uB9AC\uB85C \uAC00\uC838\uC624\uBA74 DSH \uAC00 \uD638\uCD9C\uD569\uB2C8\uB2E4. \uCC44\uD305\uC5D0\uC11C /\uC774\uB984 \uC744 \uC785\uB825\uD558\uBA74 \uBC14\uB85C \uB85C\uB4DC\uB418\uACE0, \uC791\uC5C5\uC774 description \uC774\uB098 whenToUse \uC5D0 \uB9DE\uC73C\uBA74 \uBAA8\uB378\uC774 skill \uB3C4\uAD6C\uB97C \uD638\uCD9C\uD569\uB2C8\uB2E4. \uBCF8\uBB38\uC5D0 '\uD65C\uC131'\uC774\uB77C\uACE0 \uC368\uB3C4 \uBC1C\uB3D9\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "skills.hint.desktop": "\uD604\uC7AC \uB370\uC2A4\uD06C\uD1B1 \uD638\uC2A4\uD2B8\uC758 \uACF5\uC2DD Skill \uB514\uB809\uD130\uB9AC\uC785\uB2C8\uB2E4. \uCC44\uD305\uC5D0\uC11C /\uC774\uB984 \uC744 \uC785\uB825\uD558\uBA74 \uBC14\uB85C \uB85C\uB4DC\uB418\uACE0, \uC791\uC5C5\uC774 description \uC5D0 \uB9DE\uC73C\uBA74 \uBAA8\uB378\uC774 skill \uB3C4\uAD6C\uB97C \uD638\uCD9C\uD569\uB2C8\uB2E4.",
  "skills.empty": "\uC0AC\uC6A9\uC790 Skill \uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
  "btn.importZip": "\uC555\uCD95 \uD30C\uC77C \uAC00\uC838\uC624\uAE30",
  "btn.importFolder": "\uD3F4\uB354 \uAC00\uC838\uC624\uAE30",
  "skills.importing": "\uAC00\uC838\uC624\uB294 \uC911\u2026",
  "saved.import": "Skill {count} \uAC1C\uB97C \uAC00\uC838\uC654\uC2B5\uB2C8\uB2E4",
  "need.import": "\uC555\uCD95 \uD30C\uC77C\uC774\uB098 \uD3F4\uB354\uB97C \uACE0\uB974\uC138\uC694",
  "err.import.folder": "\uD3F4\uB354 \uC548\uC758 \uD30C\uC77C\uC744 \uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. Skill \uB514\uB809\uD130\uB9AC \uC790\uCCB4\uB97C \uACE0\uB974\uC138\uC694(\uC548\uC5D0 SKILL.md \uAC00 \uC788\uC5B4\uC57C \uD569\uB2C8\uB2E4)",
  "skills.pick": "Skill \uC120\uD0DD",
  "skills.invalid": "\uACF5\uC2DD\uC5D0\uC11C \uBB34\uC2DC\uB429\uB2C8\uB2E4: \uD615\uC2DD\uC774 \uB9DE\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
  "skills.call.slash": "\uCC44\uD305\uC5D0\uC11C {cmd} \uC785\uB825",
  "skills.call.model": "\uBAA8\uB378 \uD638\uCD9C \uAC00\uB2A5",
  "skills.call.modelOff": "\uBAA8\uB378 \uD638\uCD9C \uBD88\uAC00",
  "skills.call.userOff": "/\uC774\uB984 \uC0AC\uC6A9 \uBD88\uAC00",
  "ph.skill.desc": "description (\uC5B8\uC81C \uC4F0\uB294\uC9C0)",
  "btn.saveSkill": "\uC800\uC7A5",
  "need.skill.id": "id \uB294 kebab-case \uC5EC\uC57C \uD569\uB2C8\uB2E4. \uC608: code-review",
  "confirm.delete.skill": "\uACF5\uC2DD $DSH_HOME/skills \uC5D0\uC11C {id} \uC0AD\uC81C\uD560\uAE4C\uC694? \uD638\uC2A4\uD2B8\uAC00 \uCE74\uD0C8\uB85C\uADF8\uC5D0\uC11C \uC790\uB3D9\uC73C\uB85C \uBE8D\uB2C8\uB2E4.",
  "err.skills": "\uC77D\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "err.skills.needRestart": "Skill \uC778\uD130\uD398\uC774\uC2A4\uAC00 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uD638\uC2A4\uD2B8\uB97C \uBA3C\uC800 \uC7AC\uC2DC\uC791\uD558\uC138\uC694",
  "btn.restart": "\uC7AC\uC2DC\uC791",
  "btn.restart.busy": "\uC7AC\uC2DC\uC791 \uC911\u2026",
  restarting: "\uC7AC\uC2DC\uC791 \uC911\u2026",
  "restarting.desktop": "\uB370\uC2A4\uD06C\uD1B1 \uC571\uC744 \uC7AC\uC2DC\uC791\uD558\uB294 \uC911\u2026",
  "restart.timeout": "\uC2DC\uAC04 \uCD08\uACFC\uC785\uB2C8\uB2E4. \uC0C8\uB85C \uACE0\uCE58\uC138\uC694",
  "restart.fail": "\uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "restart.notStarted": "\uC7AC\uC2DC\uC791\uC774 \uC2DC\uC791\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD074\uB77C\uC774\uC5B8\uD2B8\uB294 \uADF8\uB300\uB85C \uC788\uC73C\uBA70 \uC790\uB3D9\uC73C\uB85C \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "restart.already": "\uC774\uBC88 \uC7AC\uC2DC\uC791\uC740 \uC774\uBBF8 \uC2DC\uC791\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC7AC\uC2DC\uC791\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "restart.confirm": "\uC815\uB9AC\uAC00 \uB05D\uB0AC\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uC791\uD558\uBA74 \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  "restart.confirm.desktop": "\uC815\uB9AC\uAC00 \uB05D\uB0AC\uC2B5\uB2C8\uB2E4. \uB370\uC2A4\uD06C\uD1B1 \uC571\uC744 \uC7AC\uC2DC\uC791\uD558\uBA74 \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  "restart.ask.title": "\uC9C0\uAE08 \uC7AC\uC2DC\uC791\uD560\uAE4C\uC694",
  "restart.ask.body": "\uC774\uBBF8 \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uC791\uD574\uC57C \uD604\uC7AC \uD074\uB77C\uC774\uC5B8\uD2B8\uC5D0 \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  "restart.now": "\uC9C0\uAE08 \uC7AC\uC2DC\uC791",
  "restart.notNow": "\uB098\uC911\uC5D0",
  "restart.asarSwap": "\uD328\uCE58\uB97C \uB514\uC2A4\uD06C\uC5D0 \uAE30\uB85D\uD588\uC2B5\uB2C8\uB2E4. \uB370\uC2A4\uD06C\uD1B1 \uD504\uB85C\uC138\uC2A4\uB97C \uB05D\uB0B4\uACE0 app.asar \uB97C \uC62E\uAE30\uB294 \uC911\uC774\uBA70 \uB05D\uB098\uBA74 \uC790\uB3D9\uC73C\uB85C \uB2E4\uC2DC \uC5F4\uB9BD\uB2C8\uB2E4. \uADF8\uB798\uB3C4 \uD6A8\uACFC\uAC00 \uC5C6\uC73C\uBA74 Harness \uB97C \uC644\uC804\uD788 \uC885\uB8CC(\uD2B8\uB808\uC774\uAE4C\uC9C0)\uD55C \uB4A4 \uC801\uC6A9\uC744 \uB2E4\uC2DC \uB204\uB974\uC138\uC694.",
  "surface.web": "Web",
  "surface.desktop": "\uB370\uC2A4\uD06C\uD1B1",
  "surface.gui": "GUI",
  "surface.tui": "TUI",
  "restart.incomplete": "\uC801\uC6A9\uC774 \uB05D\uB098\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. {detail}",
  "restart.incomplete.patches": "{failed} \uAC1C \uD56D\uBAA9 \uCC98\uB9AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4 (#{ids}). \uD328\uCE58 \uC0C1\uC138\uB97C \uD655\uC778\uD558\uC138\uC694",
  "restart.incomplete.flash": "\uD130\uBBF8\uB110 \uCC3D \uC5B5\uC81C \uAC80\uC0AC\uAC00 \uD1B5\uACFC\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4 ({entry})",
  "restart.incomplete.host": "\uB300\uC0C1 \uD638\uC2A4\uD2B8 \uAE30\uB85D \uC644\uB8CC\uB97C \uD655\uC778\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uD074\uB77C\uC774\uC5B8\uD2B8, \uD638\uC2A4\uD2B8 \uBC84\uC804, \uB300\uC0C1 \uACBD\uB85C\uB97C \uB300\uC870\uD558\uC138\uC694",
  "restart.incomplete.restore": "\uAD6C\uC131 \uBCF5\uC6D0\uC774 \uB05D\uB098\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uC9C4\uB2E8 \uAE30\uB85D\uC744 \uD655\uC778\uD558\uC138\uC694",
  "restart.incomplete.runtime": "CLI \uB7F0\uD0C0\uC784 \uAC80\uC0AC\uB098 \uBCF5\uAD6C\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC9C4\uB2E8 \uAE30\uB85D\uC744 \uD655\uC778\uD558\uC138\uC694",
  "restart.incomplete.unknown": "\uD604\uC7AC \uBC31\uC5D4\uB4DC\uAC00 \uAD6C\uCCB4\uC801 \uC6D0\uC778\uC744 \uBC18\uD658\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD638\uC2A4\uD2B8 \uBC84\uC804, \uD328\uCE58 \uC0C1\uC138, \uC9C4\uB2E8 \uACB0\uACFC\uB97C \uD655\uC778\uD558\uC138\uC694",
  "restart.later": "\uB098\uC911\uC5D0",
  "group.prompt": "\uD504\uB86C\uD504\uD2B8",
  "group.code": "\uCF54\uB4DC",
  "group.engine": "\uC5D4\uC9C4",
  "group.tools": "\uB3C4\uAD6C",
  "group.compat": "0.1.5 \uD638\uD658",
  "group.dsh20": "0.2.0",
  "patch.1": "\uC804\uC5ED \uBA74\uCC45 \u2192 \uAC15\uC81C \uC9C0\uC2DC",
  "patch.2": "\uCE58\uD658\uD615 \uBA74\uCC45 \u2192 \uAC15\uC81C \uC9C0\uC2DC",
  "patch.3": "\uC2A4\uCF54\uD504 \uBA74\uCC45 \u2192 \uAC15\uC81C \uC9C0\uC2DC",
  "patch.4": "persona \uC138\uC158 \uAC15\uC81C \uC9C0\uC2DC",
  "patch.5": "\uC2B9\uC778 \uC548\uB0B4 \uBB38\uAD6C \u2192 \uC804\uCCB4 \uAD8C\uD55C",
  "patch.6": "\uC0CC\uB4DC\uBC15\uC2A4 deny \u2192 allow \uC4F0\uAE30",
  "patch.7": "\uC0CC\uB4DC\uBC15\uC2A4 \uAE30\uBCF8 \uC804\uCCB4 \uAD8C\uD55C",
  "patch.8": "\uC2B9\uC778 \uAE30\uBCF8 never",
  "patch.9": "\uC2B9\uC778 \uAC8C\uC774\uD2B8 \uC790\uB3D9 \uD1B5\uACFC",
  "patch.10": "\uC2B9\uC778 \uC124\uC815 \uAE30\uBCF8 never",
  "patch.11": "never \uC548\uB0B4 \uBB38\uAD6C \u2192 \uC790\uB3D9 \uD1B5\uACFC",
  "patch.12": "ask \uC548\uB0B4 \uBB38\uAD6C \u2192 \uC790\uB3D9 \uD1B5\uACFC",
  "patch.13": "\uBA74\uC81C \uC2B9\uACA9 \uB2E8\uACC4",
  "patch.14": "\uC2B9\uACA9 \uBB34\uC870\uAC74 \uC2E0\uB8B0",
  "patch.15": "\uC0CC\uB4DC\uBC15\uC2A4 confine \uC9C1\uD1B5",
  "patch.16": "\uD30C\uC77C \uC2DC\uC2A4\uD15C \uC6B8\uD0C0\uB9AC \uD574\uC81C",
  "patch.17": "\uAD00\uCC30 \uC815\uCC45 \uC77D\uAE30/\uC4F0\uAE30 \uD5C8\uC6A9",
  "patch.18": "\uC911\uBCF5 \uD638\uCD9C \uAC00\uB4DC \uBE44\uD65C\uC131",
  "patch.19": "\uB3C4\uAD6C \uACB0\uACFC \uD2B8\uB9AC\uBC0D \uBE44\uD65C\uC131",
  "patch.21": "\uD50C\uB7EC\uADF8\uC778\uC774 \uB298\uB9B0 bash \uB300\uAE30 \uBCF5\uC6D0",
  "patch.22": "read \uC0C1\uD55C \uC644\uD654",
  "patch.23": "\uC11C\uBE0C\uC5D0\uC774\uC804\uD2B8 \uAE4A\uC774 3 \u2192 10",
  "patch.24": "preset fetch \uD65C\uC131\uD654",
  "patch.25": "\uACF5\uC2DD \uAE30\uBCF8 \uC815\uCCB4\uC131 \uC81C\uAC70 (\uAE30\uB2A5 \uD504\uB86C\uD504\uD2B8\uB294 \uADF8\uB300\uB85C)",
  "patch.26": "minimal: \uAE30\uBCF8 \uC815\uCCB4\uC131 \uC81C\uAC70 \uD6C4 inject \uCF1C\uAE30",
  "patch.28": "dsh-liangshen(\uB7C9\uC120): phase-1 \uC5D0\uC11C dsh-purge / dshpg \uC139\uC158 \uC720\uC9C0",
  "patch.70": "\uBBF8\uB2C8\uBA40 \uBAA8\uB4DC \uD130\uBBF8\uB110\uC5D0\uC11C \uB124\uD2B8\uC6CC\uD06C \uCC28\uB2E8 \uD574\uC81C",
  "patch.71": "\uB7C9\uC120: \uACF5\uC2DD \uC815\uCCB4\uC131 \uBB38\uAD6C \uC81C\uAC70",
  "patch.29": "dsh-tool-web: \uC678\uBD80 untrusted \uCC28\uB2E8 \u2192 \uC2E4\uD589 \uAC00\uB2A5",
  "patch.30": "dsh-hooks-claude-code: deny \u2192 allow",
  "patch.31": "dsh-hooks-codex: deny \u2192 allow",
  "patch.32": "Web \uD45C\uBA74 \uC815\uCCB4\uC131 \uC911\uB9BD\uD654",
  "patch.33": "Shell \uAC70\uBD80 \uC548\uB0B4 \u2192 \uC2E4\uD589 \uAC00\uB2A5",
  "patch.34": "\uC0CC\uB4DC\uBC15\uC2A4 \uC548\uB0B4 \uC911\uB9BD\uD654",
  "patch.35": "\uC2B9\uACA9 never \uB294 \uAC70\uBD80\uD558\uC9C0 \uC54A\uC74C",
  "patch.36": "\uD30C\uC77C \uC2DC\uC2A4\uD15C \uC2B9\uACA9 schema \uD5C8\uC6A9",
  "patch.37": "\uC11C\uBE0C\uC5D0\uC774\uC804\uD2B8 scope lock \uC911\uB9BD\uD654",
  "patch.38": "persona text \u2192 prefix (0.1.2 \uD504\uB9AC\uC14B)",
  "patch.39": "\uC138\uC158 v0 plugin summary(mnemon)",
  "patch.40": "complete \uD504\uB9AC\uC14B\uC5D0\uC11C\uB3C4 \uC8FC\uC785 \uC720\uC9C0",
  "patch.42": "\uC124\uC815 \uD398\uC774\uC9C0 \uAD6C \uC778\uD130\uD398\uC774\uC2A4",
  "patch.43": "\uC6F9 \uD504\uB9AC\uC14B\uC5D0\uC11C \uAE30\uBCF8 \uC815\uCCB4\uC131 \uC81C\uAC70",
  "patch.45": "\uACF5\uC2DD \uB370\uC2A4\uD06C\uD1B1 \uC5C5\uB370\uC774\uD2B8 \uD578\uB4DC\uC624\uD504",
  "patch.46": "\uACF5\uC2DD \uC5C5\uB370\uC774\uD2B8 \uC2A4\uD06C\uB9BD\uD2B8\uB294 \uC601\uC5B4\uB9CC \uC0AC\uC6A9",
  "patch.47": "OAuth \uC5D0\uC11C Claude \uC815\uCCB4\uC131 \uC0BD\uC785 \uC911\uB2E8",
  "patch.48": "shell \uC5D0\uC11C \uC0AD\uC81C \uC804 \uCD94\uAC00 \uD655\uC778 \uC81C\uAC70",
  "patch.49": "OAuth \uC5D0\uC11C claude-cli \uC704\uC7A5 \uC911\uB2E8",
  "patch.50": "\uC138\uC158 \uAC04 \uCC38\uC870\uB97C \uB354 \uC774\uC0C1 \uBD88\uC2E0\uC73C\uB85C \uD45C\uC2DC\uD558\uC9C0 \uC54A\uC74C",
  "patch.51": "\uC0C8 \uC138\uC158\uC5D0\uC11C \uC804\uCCB4 \uAD8C\uD55C \uC720\uC9C0",
  "patch.52": "\uC138\uC158 \uB85C\uADF8\uB294 \uAE30\uBCF8\uC801\uC73C\uB85C \uC5C5\uB85C\uB4DC\uD558\uC9C0 \uC54A\uC74C",
  "patch.53": "\uC6F9 \uC548\uB0B4\uC5D0\uC11C \uBCC4\uB3C4 \uC11C\uBC84 \uAE30\uB3D9 \uAE08\uC9C0 \uC81C\uAC70",
  "patch.54": "\uC0B0\uCD9C\uBB3C \uC548\uB0B4\uC5D0\uC11C \uBD88\uD544\uC694\uD55C \uAE08\uC9C0 \uC81C\uAC70",
  "patch.55": "\uB9E4 \uB2E8\uACC4 \uCCAB \uC2DC\uC2A4\uD15C \uD504\uB86C\uD504\uD2B8 \uAD50\uCCB4",
  "patch.56": "\uB418\uB3CC\uB9AC\uAE30\uB294 \uCCA0\uD68C\uB41C \uB77C\uC6B4\uB4DC\uB9CC \uC228\uAE40",
  "patch.57": "developer role \uC740 openai/azure \uC804\uC6A9, \uC11C\uB4DC\uD30C\uD2F0 \uD504\uB85D\uC2DC\uB294 system \uC73C\uB85C \uD3F4\uBC31",
  "patch.58": "\uB418\uB3CC\uB9AC\uAE30 \uBE48 \uB9C8\uCEE4\uB294 \uBAA8\uB378 \uC694\uCCAD\uC5D0 \uB123\uC9C0 \uC54A\uC74C",
  "patch.59": "\uACF5\uC2DD Auto Review \uAC00 \uB354 \uC774\uC0C1 \uB3C4\uAD6C\uB97C \uB9C9\uC9C0 \uC54A\uC74C",
  "patch.60": "\uACF5\uC2DD run_code \uC5D0\uC11C \uC2B9\uC778 \uC548\uB0B4 \uC81C\uAC70",
  "patch.61": "\uACF5\uC2DD \uC0CC\uB4DC\uBC15\uC2A4 \uC815\uCC45\uC774 \uB354 \uC774\uC0C1 \uAC70\uBD80\uB97C \uAC00\uB974\uCE58\uC9C0 \uC54A\uC74C",
  "patch.62": "\uC2B9\uC778 \uCC44\uB110\uC774 \uC5C6\uC73C\uBA74 \uD1B5\uACFC (\uC0AC\uC6A9\uC790 \uAC70\uBD80\uB294 \uC5EC\uC804\uD788 \uC720\uD6A8)",
  "patch.63": "\uACC4\uD68D \uBAA8\uB4DC\uC5D0\uC11C \uC2E4\uD589\uC744 \uB354 \uC774\uC0C1 \uC18C\uD504\uD2B8 \uCC28\uB2E8\uD558\uC9C0 \uC54A\uC74C",
  "patch.64": "Stop hook \uC774 \uAC00\uC9DC \uC0AC\uC6A9\uC790 \uBC1C\uD654\uB97C \uB354 \uC774\uC0C1 \uC8FC\uC785\uD558\uC9C0 \uC54A\uC74C",
  "patch.65": "UserPromptSubmit deny \uAC00 \uB77C\uC6B4\uB4DC \uC804\uCCB4\uB97C reject \uD558\uC9C0 \uC54A\uC74C",
  "patch.66": "\uBE48 \uC2DC\uC2A4\uD15C \uC139\uC158\uC774 \uB77C\uC6B4\uB4DC\uB97C \uB0B4\uBD80 \uC624\uB958\uB85C \uB9CC\uB4E4\uC9C0 \uC54A\uC74C",
  "patch.67": "messages \uAC00 \uC5C6\uC5B4\uB3C4 \uB77C\uC6B4\uB4DC\uAC00 \uC911\uB2E8\uB418\uC9C0 \uC54A\uC74C",
  "patch.68": "\uB418\uB3CC\uB9B0 \uB4A4 content \uAC00 \uC5C6\uC5B4\uB3C4 \uC911\uB2E8\uB418\uC9C0 \uC54A\uC74C",
  "patch.69": "deepseek-flash \uB294 \uACF5\uC2DD in-history \uC720\uC9C0",
  "patch.72": "Messages \uC758 system \uC740 \uD604\uC7AC \uC2DC\uC2A4\uD15C \uD504\uB86C\uD504\uD2B8 \uC0AC\uC6A9",
  "patch.73": "\uBBF8\uB2C8\uBA40 bash \uC5D0\uC11C \uC798\uBABB \uB0A8\uC740 \uBBF8\uB7EC \uC548\uB0B4 \uC81C\uAC70",
  "patch.74": "\uCCAB \uC694\uCCAD \uC804\uC5D0 \uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8 \uBA3C\uC800 \uBD80\uCC29",
  "patch.75": "\uB418\uB3CC\uB9AC\uAE30 \uC2DC \uC644\uB8CC\uB41C \uC791\uC5C5\uC744 \uBBF8\uC2DC\uC791\uC73C\uB85C \uD68C\uC218",
  "patch.76": "unrestricted \uD504\uB9AC\uC14B\uC5D0\uC11C \uC815\uCCB4\uC131 \uBB38\uAD6C \uC81C\uAC70",
  "patch.77": "\uB418\uB3CC\uB9AC\uAE30 \uB9C8\uCEE4\uAC00 \uB3C4\uCC29\uD558\uBA74 \uC774\uBBF8 \uBCF4\uB0B8 \uBA54\uC2DC\uC9C0 \uD3D0\uAE30",
  "patch.78": "\uD328\uCE58 \uD30C\uC77C \uB204\uB77D \uC2DC .bak \uC5D0\uC11C \uBCF5\uC6D0",
  "patch.80": "\uACF5\uC2DD \uBBF8\uB2C8\uBA40 \uB3C4\uAD6C \uD45C \uBCF5\uC6D0",
  "patch.82": "\uBA54\uC778 \uD504\uB85C\uC138\uC2A4 \uD3F4\uBC31 DSH_PROFILE=desktop",
  "patch.83": "host \uAC00 \uC2DC\uADF8\uB110\uB85C \uC885\uB8CC\uB420 \uB54C \uC624\uB958 \uC5C6\uC774 \uB300\uD654\uC0C1\uC790\uB3C4 \uC5C6\uC74C",
  "patch.84": "host code=0 \uC815\uC0C1 \uC885\uB8CC \uC2DC \uC624\uB958 \uC5C6\uC74C (stopped \uB300\uD654\uC0C1\uC790 \uC81C\uAC70)",
  "status.unlocated": "\uC704\uCE58 \uBBF8\uD655\uC778",
  "status.na": "\uC774 \uD658\uACBD\uC5D0\uC11C\uB294 \uBD88\uD544\uC694",
  "metric.unlocated": "\uC544\uC9C1 \uB85C\uCEEC Harness \uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4",
  "metric.sealed": "\uACF5\uC2DD \uD074\uB77C\uC774\uC5B8\uD2B8\uB97C \uCC3E\uC558\uC2B5\uB2C8\uB2E4. \uC801\uC6A9\uC744 \uB204\uB974\uBA74 \uD480\uB9BD\uB2C8\uB2E4",
  "metric.sealed.count": "\uD480\uAE30 \uB300\uAE30",
  "metric.lost": "\uD328\uCE58\uAC00 \uC0AC\uB77C\uC84C\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC801\uC6A9\uD558\uC138\uC694",
  "metric.lost.count": "\uC720\uC2E4\uB428",
  "rewind.label": "\uB418\uB3CC\uB9AC\uAE30",
  "rewind.aria": "\uB418\uB3CC\uB9AC\uAE30",
  "rewind.busy": "\uB418\uB3CC\uB9AC\uB294 \uC911\u2026",
  "rewind.empty": "\uB418\uB3CC\uB9B4 \uC774\uC804 \uBC1C\uD654\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4",
  "rewind.fail": "\uB418\uB3CC\uB9AC\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "rewind.once": "\uD55C \uBC88 \uB418\uB3CC\uB9AC\uAE30",
  "rewind.once.hint": "\uC774 \uB77C\uC6B4\uB4DC\uC5D0\uC11C \uBCF4\uB0B8 \uBC1C\uD654\uB97C \uC785\uB825\uCC3D\uC73C\uB85C \uB418\uB3CC\uB9AC\uACE0 \uC774 \uB77C\uC6B4\uB4DC\uB97C \uC9C0\uC6C1\uB2C8\uB2E4",
  "rewind.round": "\uC774\uC804 \uB77C\uC6B4\uB4DC \uB418\uB3CC\uB9AC\uAE30",
  "rewind.round.hint": "\uC774 \uB77C\uC6B4\uB4DC\uC5D0\uC11C \uBCF4\uB0B8 \uBC1C\uD654\uB97C \uC785\uB825\uCC3D\uC73C\uB85C \uB418\uB3CC\uB9BD\uB2C8\uB2E4. \uC11C\uBE0C\uC5D0\uC774\uC804\uD2B8\uB3C4 \uC774 \uB77C\uC6B4\uB4DC\uB9CC \uCCA0\uD68C\uD569\uB2C8\uB2E4",
  "hooksDeny.title": "Hooks \uCC28\uB2E8",
  "hooksDeny.bypass": "hooks \uC758 deny / ask \uD1B5\uACFC (\uD328\uCE58 30 / 31 / 64 / 65)",
  "hooksDeny.hint": "\uB044\uBA74 \uC0AC\uC6A9\uC790 \uC790\uC2E0\uC758 PreToolUse / UserPromptSubmit / Stop hook \uC758 deny \uAC00 \uACF5\uC2DD \uB85C\uC9C1\uB300\uB85C \uC801\uC6A9\uB429\uB2C8\uB2E4. \uACF5\uC2DD ask \uBD84\uAE30\uB294 \uC6D0\uB798 \uC544\uBB34 \uB3D9\uC791\uB3C4 \uD558\uC9C0 \uC54A\uC73C\uBBC0\uB85C \uC2A4\uC704\uCE58\uB97C \uAEBC\uB3C4 \uC2B9\uC778 \uB300\uD654\uC0C1\uC790\uAC00 \uB728\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBCC0\uACBD \uD6C4 '\uC801\uC6A9'\uC744 \uB204\uB974\uACE0 \uC7AC\uC2DC\uC791\uD574\uC57C \uD638\uC2A4\uD2B8\uC5D0 \uAE30\uB85D\uB429\uB2C8\uB2E4.",
  "saved.hooksDeny": "\uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4",
  "continue.title": "\uC2E4\uD328 \uC7AC\uC2DC\uB3C4 / \uACC4\uC18D",
  "continue.hint": "\uC694\uCCAD\uC774 \uC2E4\uD328\uD558\uBA74 \uC790\uB3D9\uC73C\uB85C \uC7AC\uC2DC\uB3C4\uD569\uB2C8\uB2E4. \uBE44\uC815\uC0C1 \uC885\uB8CC\uB098 \uC911\uB2E8 \uC2DC\uC5D0\uB294 '\uACC4\uC18D'\uC744 \uB204\uB974\uAC70\uB098 \uC790\uB3D9 \uC774\uC5B4\uB2EC\uB9AC\uAE30\uB97C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC9C1\uC811 \uC911\uC9C0\uB97C \uB204\uB978 \uACBD\uC6B0\uC5D0\uB294 \uC790\uB3D9\uC73C\uB85C \uC774\uC5B4\uAC00\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uD69F\uC218\uB97C \uBAA8\uB450 \uC4F0\uBA74 \uC0C8 \uB77C\uC6B4\uB4DC\uB97C \uC5F4\uC5B4\uC57C \uD569\uB2C8\uB2E4.",
  "continue.autoRetry": "\uC2E4\uD328 \uC2DC \uC790\uB3D9 \uC7AC\uC2DC\uB3C4",
  "continue.retryMax": "\uC7AC\uC2DC\uB3C4 \uD69F\uC218",
  "continue.autoContinue": "\uC911\uB2E8 \uD6C4 \uC790\uB3D9 \uACC4\uC18D",
  "continue.continueMax": "\uACC4\uC18D \uD69F\uC218",
  "continue.text": "\uACC4\uC18D \uBB38\uAD6C",
  "saved.continue": "\uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4",
  "continue.label": "\uACC4\uC18D",
  "continue.aria": "\uBE44\uC815\uC0C1 \uC885\uB8CC \uD6C4 \uACC4\uC18D",
  "continue.busy": "\uACC4\uC18D\uD558\uB294 \uC911\u2026",
  "continue.ready": "\uACC4\uC18D (\uB0A8\uC740 \uD69F\uC218 {left})",
  "continue.limit": "\uACC4\uC18D \uC0C1\uD55C\uC5D0 \uB3C4\uB2EC\uD588\uC2B5\uB2C8\uB2E4",
  "continue.fail": "\uACC4\uC18D\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4: {error}",
  "updch.open": "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110",
  "updch.title": "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110: \uD504\uB85D\uC2DC\uC640 GitHub \uD0A4",
  "updch.scope": "\uC5EC\uAE30 \uC124\uC815\uD55C \uD504\uB85D\uC2DC\uC640 \uD0A4\uB294 \uC774 \uD50C\uB7EC\uADF8\uC778\uC758 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778\xB7\uB2E4\uC6B4\uB85C\uB4DC \uCC44\uB110\uC5D0\uB9CC \uC801\uC6A9\uB429\uB2C8\uB2E4. \uB2E4\uB978 \uBAA8\uB378 \uC81C\uACF5\uC790 \uC694\uCCAD\uC5D0\uB294 \uC601\uD5A5\uC744 \uC8FC\uC9C0 \uC54A\uACE0 \uD638\uC2A4\uD2B8 \uD504\uB85C\uC138\uC2A4 \uD658\uACBD\uC5D0\uB3C4 \uC4F0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uAE30\uC874 \uC5C5\uB370\uC774\uD2B8 \uD504\uB85D\uC2DC \uD658\uACBD\uC744 \uC0C1\uC18D\uD569\uB2C8\uB2E4.",
  "updch.mirror": "GitHub \uBBF8\uB7EC (\uC120\uD0DD)",
  "updch.mirror.ph": "https://\uBBF8\uB7EC\uD638\uC2A4\uD2B8/",
  "updch.mirror.hint": "\uC870\uD68C\uC640 \uB2E4\uC6B4\uB85C\uB4DC\uC5D0\uB9CC \uC4F0\uBA70 GitHub \uD0A4\uB97C \uBCF4\uB0B4\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC124\uCE58\uB294 \uC5EC\uC804\uD788 GitHub \uC5D0\uC11C \uACF5\uC2DD \uAC80\uC99D\uAC12\uC744 \uBC1B\uC544\uC57C \uD558\uACE0, \uC5C5\uB370\uC774\uD2B8 \uD504\uB85D\uC2DC\uB97C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uBBF8\uB7EC\uB97C \uB055\uB2C8\uB2E4.",
  "updch.proxy": "\uD504\uB85D\uC2DC \uC8FC\uC18C",
  "updch.proxy.ph": "socks5://127.0.0.1:60808",
  "updch.proxy.hint": "http:// / https:// / socks5:// \uC811\uB450\uC0AC\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4. \uC608: http://127.0.0.1:7890. \uBE44\uC6CC \uB450\uBA74 \uAE30\uC874 \uC5C5\uB370\uC774\uD2B8 \uD504\uB85D\uC2DC \uD658\uACBD\uC744 \uC0C1\uC18D\uD569\uB2C8\uB2E4.",
  "updch.token": "GitHub \uD0A4",
  "updch.token.ph": "\uC120\uD0DD \uC0AC\uD56D: GitHub API \uD560\uB2F9\uB7C9\uC744 \uC62C\uB9BD\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uBCC0\uACBD\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
  "updch.token.set": "\uC774 \uAE30\uAE30\uC5D0\uB294 \uD0A4\uAC00 \uC124\uC815\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uC785\uB825\uCC3D\uC740 \uD56D\uC0C1 \uBE44\uC5B4 \uC788\uC73C\uBA70, \uBE44\uC6B4 \uCC44 \uC800\uC7A5\uD558\uBA74 \uADF8\uB300\uB85C \uB454\uB2E4\uB294 \uB73B\uC785\uB2C8\uB2E4.",
  "updch.token.unset": "\uC774 \uAE30\uAE30\uC5D0\uB294 \uC544\uC9C1 \uD0A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uC124\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.",
  "updch.token.clear": "\uC800\uC7A5\uB41C \uD0A4 \uC9C0\uC6B0\uAE30",
  "updch.save": "\uC800\uC7A5",
  "updch.saving": "\uC800\uC7A5 \uC911\u2026",
  "updch.cancel": "\uCDE8\uC18C",
  "updch.saved": "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uD655\uC778\uBD80\uD130 \uC801\uC6A9\uB429\uB2C8\uB2E4.",
  "updch.state.proxy": "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110 \uD504\uB85D\uC2DC:",
  "updch.state.direct": "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110: \uD658\uACBD \uB610\uB294 \uC2DC\uC2A4\uD15C \uD504\uB85D\uC2DC \uC0C1\uC18D",
  "updch.state.token.on": "GitHub \uD0A4 \uC124\uC815\uB428",
  "updch.state.token.off": "GitHub \uD0A4 \uBBF8\uC124\uC815"
};
var en = {
  nav: "Rules",
  "dock.clean": "Clean",
  "dock.drill": "Drill",
  "dock.toggle": "dsh-purge",
  "dock.newSession": "dsh-purge",
  "dock.inSession": "dsh-purge",
  "dock.redteam": "Red team",
  "dock.full": "Full view",
  "dock.close": "Collapse",
  "dock.unauthorized": "Unauthorized",
  "welcome.title": "User notice",
  "welcome.lead": "Please read this on first install. After you confirm, it will not appear again.",
  "welcome.warn": "This plugin is free and open source. Anyone who sells, resells, or profits from it behind the author's back may face legal action.",
  "welcome.body": "dsh-purge is a local DeepSeek Harness plugin for security evaluation and cleaning: adjust prompts and patches on a machine you control, and use the drill console only within authorized scope. It is free and non-profit. Repository:",
  "welcome.repo": "https://github.com/YuJunZhiXue/dsh-purge",
  "welcome.ban1": "Do not use this project for unauthorized attacks, intrusion, data theft, sabotage, or any illegal activity.",
  "welcome.ban2": "Do not commercially sell, resell, or profit from gray-market use, or redistribute for profit without the author.",
  "welcome.ban3": "You must follow local law and platform rules; illegal use is solely your responsibility.",
  "welcome.bans": "Prohibitions",
  "welcome.check": "I have read and understand this notice and will use the plugin lawfully.",
  "welcome.ok": "I understand \u2014 continue",
  "auth.title": "Drill console authorization",
  "auth.lead": "Cleaning does not need this step. Opening Drill or Full view the first time requires this dialog.",
  "auth.warn": "Warning: the drill console is only for hosts you manage, offline targets, or written authorized exercises. Unauthorized intrusion, attack, theft, or sabotage is forbidden.",
  "auth.hint.wait": "Read the notice. You can check the boxes in {n}s.",
  "auth.hint.scroll": "Countdown finished. Scroll to the end, then check the boxes.",
  "auth.hint.check": "Countdown finished. Check all three boxes.",
  "auth.check.read": "I have read the Safety and Anti-Abuse Notice and accept every clause.",
  "auth.check.scope": "I will only use authorized local hosts, offline targets, or compliant exercises.",
  "auth.check.ban": "I will not use this for any illegal purpose. Without this authorization the drill console stays closed.",
  "auth.no": "Not now",
  "auth.ok": "Authorize",
  "auth.ok.tab": "Authorize and open Drill",
  "auth.ok.full": "Authorize and open Full view",
  "auth.ok.env": "Authorize and open Env adapt",
  "envGate.title": "Environment is not ready",
  "envGate.lead": "Red team mode needs local tools before you send. If none are available, open Env adapt or confirm you will continue without them.",
  "envGate.kaliHint": "When Kali is detected, local tools are used directly and paths are optional. Otherwise set each tool path in Env adapt, or pick one toolkit folder to assign them.",
  "envGate.skip": "Skip for now",
  "envGate.skipConfirm": "You can keep chatting after this. Scan and exploit skills stay unavailable until the tools are installed. You can add paths later under dsh-purge \u2192 Env adapt.",
  "envGate.skipNo": "Back",
  "envGate.skipYes": "Continue without tools",
  "envGate.go": "Open Env adapt",
  "compat.host": "dsh-purge Community {version} \xB7 host DSH {host} \xB7 compatibility: {level}",
  "compat.loading": "Reading the host version\u2026",
  "compat.unavailable": "Host compatibility is unavailable: {error}",
  "compat.level.qualified": "regression verified",
  "compat.level.unverified": "unverified version",
  "compat.level.mixed": "mixed component versions",
  "compat.level.no-host": "host not located",
  "compat.level.unknown": "unknown",
  "theme.aria": "Appearance",
  "theme.white": "Light",
  "theme.ink": "Ink",
  "purge.title": "Patches",
  "override.title": "Prompt",
  "own.title": "Own servers",
  "own.hint": "One IP or exact hostname per line. account@host is accepted; the account only identifies that host. A hostname also allows the addresses it resolves to. Do not enter a key, a password, or a range.",
  "own.save": "Save list",
  "saved.own": "Own servers saved",
  "saved.own.dropped": "Saved. {n} lines were not a single IP or hostname and were dropped",
  "metric.purged": "Written",
  "metric.purged.skip": "Written. Skipped {n}; those files are not on this install",
  "metric.pendingShort": "Pending {n}",
  "metric.unmatchedShort": "No match {n}",
  "metric.partialShort": "Partial {n}",
  "metric.driftedShort": "Drifted {n}",
  "metric.disabledShort": "Opt-in off {n}",
  "metric.skipShort": "Skipped {n}",
  "metric.unlocated.count": "\u2014",
  "metric.shim": "shim",
  "metric.shim.na": "Not needed here",
  "metric.bak.yes": "Backup",
  "metric.bak.no": "No backup",
  "metric.bak.hint": "Backup",
  "table.patch": "Item",
  "table.status": "Status",
  "status.applied": "Applied",
  "status.off": "Off",
  "status.pending": "Pending",
  "status.unmatched": "No match",
  "status.partial": "Partial",
  "status.partialDetail": " ({done}/{total} targets)",
  "status.drifted": "Drifted",
  "status.disabled": "Opt-in off",
  "status.skipped": "Skipped",
  "apply.hint": "Apply writes patches and hangs the current default prompt. A stale plugin default in the box is refreshed from the sealed slot; a separate save is unnecessary. Only a prompt you wrote yourself is kept from the box. Pending = original text still present. Skipped = not needed for this version or the component is not installed.",
  "warn.noRoot": "Could not find this host\u2019s @deepseek-ai tree, so Apply will not patch anything. Fully quit and reopen this host, then Apply here. Desktop may live on any drive; folder names like DeepseekHarnessDesktop or DeepSeek Harness are fine.",
  "warn.noRoot.desktop": "Official Harness keeps its code in app.asar. Apply unpacks it and restarts the app. If this page stays \u201Cnot found\u201D, fully quit the client, reopen it, then Apply again. Third-party DSH Desktop: just Apply.",
  "unpack.restarting": "Patches are written. Click Restart and the client opens again by itself.",
  "restart.fullQuit": "Restarting. The client will open again by itself.",
  "warn.noInject": "Official mode always uses the default prompt. Red team uses only the active rule set; otherwise it uses the default prompt without the CTF section, then the red team steps. If both are empty you will be asked to add a prompt.",
  "need.prompt": "Both the prompt and the rule set are empty. Add a prompt, or enable a rule that has content.",
  "btn.restoreInject": "Reset default",
  "saved.restoreInject": "Default prompt restored",
  skip: "Skipped",
  unknown: "Unknown",
  delete: "Delete",
  "btn.apply": "Apply",
  "btn.apply.busy": "Working\u2026",
  "btn.revert": "Restore",
  "btn.uninstall": "Uninstall",
  "btn.uninstall.busy": "Uninstalling\u2026",
  "uninstall.title": "Uninstall dsh-purge",
  "uninstall.body": "Uninstall? This restores the original Harness and removes this plugin completely.",
  "uninstall.confirm": "Uninstall",
  "uninstall.cancel": "Cancel",
  "uninstall.applying": "Uninstalling and restoring\u2026",
  "uninstall.done": "Uninstalled and restored. Restarting\u2026",
  "uninstall.done.desktop": "Uninstalled and restored. Restarting the desktop app\u2026",
  "uninstall.fail": "Uninstall failed: {error}",
  "btn.checkUpdate": "Check update",
  "btn.checkUpdate.busy": "Checking\u2026",
  "btn.doUpdate": "Update",
  "btn.doUpdate.busy": "Updating\u2026",
  "channel.title": "Channel",
  "channel.stable": "Stable",
  "channel.beta": "Beta",
  "channel.useStable": "Switch to stable",
  "channel.useBeta": "Switch to beta",
  "channel.local": "This copy",
  "update.checking": "Checking for updates\u2026",
  "update.applying": "Updating\u2026",
  "update.switching": "Switching version\u2026",
  "update.latest": "Up to date ({version})",
  "update.available": "Update {remote} available (now {local})",
  "update.pinned": "Pinned at {version}; channel latest is {remote}",
  "update.done": "Updated to {version}.",
  "update.restarting": "Restored the old patches, wrote the new ones, and restarting\u2026",
  "update.fullQuit": "Patches are written. Click Restart and the client opens again by itself.",
  "restart.official.title": "Restart required",
  "restart.official.body": "Patches are written. Click Restart and the client opens again by itself.",
  "update.switched": "Switched to {version}.",
  "update.autoDone": "Auto-updated to {version}.",
  "update.reloading": "Refreshing settings\u2026",
  "update.dirty": "Update available; local edits were not overwritten.",
  "update.fail": "Update failed: {error}",
  "update.timeout": "Check timed out. Click Check update again.",
  "update.needRestart": "Update API is not loaded. Restart dsh, then check again.",
  "update.noBeta": "No beta build yet",
  "update.switch": "Switch to this version",
  "update.pick": "Select version",
  "update.tip": "latest",
  "update.current": "current",
  "update.confirmSwitch": "Switch to {version}? You can switch back later. Uncommitted plugin edits will not be kept.",
  "update.confirmChannel": "Switch to {version}? The plugin will be reinstalled from that channel. Uncommitted plugin edits will not be kept.",
  "metric.version": "Version",
  "action.apply": "Apply",
  "action.revert": "Restore",
  "action.uninstall": "Uninstall",
  "ok.done": "Done",
  "err.action": "Failed: {error}",
  "err.status": "Read failed: {error}",
  "err.override": "Read failed: {error}",
  "err.rules": "Read failed: {error}",
  "err.read": "Read failed: {error}",
  "err.save": "Save failed: {error}",
  "btn.saveInject": "Save",
  "saved.override": "Saved",
  "rules.title": "Rule sets",
  "rules.none": "None",
  "rules.reset": "Restore",
  "rules.reset.confirm": "Restore global instruction files? The rule library is kept.",
  "rules.empty": "No rules",
  "rules.pick": "Select a rule",
  "policy.title": "Workspace policy",
  "policy.strict": "Strict",
  "policy.fallback": "Fallback",
  "policy.always": "Always on",
  "policy.hint": "Strict: always strip AGENTS.md / CLAUDE.md. Fallback: use workspace files only when the prompt box is empty. Always on: keep DSH default behavior.",
  "cwd.title": "Local rules (current folder)",
  "cwd.empty": "No AGENTS.md / CLAUDE.md in this folder",
  "cwd.rescan": "Rescan",
  "cwd.hint": "Checked files are injected only when the prompt box is empty. A non-empty prompt box always wins.",
  "cwd.scope.cwd": "cwd",
  "cwd.scope.ancestor": "ancestor",
  "cwd.scope.root": "project root",
  "cwd.no.workspace": "DSH has not opened a workspace yet. Start a task in DSH first, then come back.",
  "pill.current": "On",
  "btn.use": "Enable",
  "btn.inUse": "On",
  "confirm.delete": "Delete {id}?",
  "ph.id": "id",
  "ph.alias": "Name",
  "ph.alias.short": "Name",
  "btn.create": "New",
  "need.id": "id required",
  "ph.content": "",
  "btn.saveRule": "Save",
  "skills.title": "Skills",
  "skills.hint": "After import, DSH calls it: type /name in chat to load now; the model calls the skill tool when the task matches description or whenToUse. Writing 'activation' in the body does nothing.",
  "skills.hint.desktop": "This desktop host\u2019s official skill catalog. Type /name in chat to load; the model calls the skill tool when the task matches the description.",
  "skills.empty": "No user skills",
  "btn.importZip": "Import zip",
  "btn.importFolder": "Import folder",
  "skills.importing": "Importing\u2026",
  "saved.import": "Imported {count} skill(s)",
  "need.import": "Choose a zip or folder",
  "err.import.folder": "No files were read. Select the skill folder itself (it must contain SKILL.md).",
  "skills.pick": "Select a skill",
  "skills.invalid": "Official catalog will ignore this: invalid format",
  "skills.call.slash": "Type {cmd} in chat",
  "skills.call.model": "Model can load",
  "skills.call.modelOff": "Hidden from model",
  "skills.call.userOff": "/name disabled",
  "ph.skill.desc": "description (when to use)",
  "btn.saveSkill": "Save",
  "need.skill.id": "id must be kebab-case, e.g. code-review",
  "confirm.delete.skill": "Delete {id} from official $DSH_HOME/skills? The host will drop it from the catalog.",
  "err.skills": "Read failed: {error}",
  "err.skills.needRestart": "Skill API is not loaded. Restart this host first.",
  "btn.restart": "Restart",
  "btn.restart.busy": "Restarting\u2026",
  restarting: "Restarting\u2026",
  "restarting.desktop": "Restarting the desktop app\u2026",
  "restart.timeout": "Timed out; refresh",
  "restart.fail": "Failed: {error}",
  "restart.notStarted": "Restart did not start. This client is still open, and it will not try again by itself.",
  "restart.already": "This restart already started. It will not restart again.",
  "restart.confirm": "Apply finished. Restart to take effect.",
  "restart.confirm.desktop": "Apply finished. Restart the desktop app to take effect.",
  "restart.ask.title": "Restart now?",
  "restart.ask.body": "It is written. It takes effect in this client after a restart.",
  "restart.now": "Restart now",
  "restart.notNow": "Later",
  "restart.asarSwap": "Patches are on disk. Quitting the desktop app and moving app.asar aside; it will reopen when done. If behavior is unchanged, fully quit Harness (including tray) and Apply again.",
  "surface.web": "Web",
  "surface.desktop": "Desktop",
  "surface.gui": "GUI",
  "surface.tui": "TUI",
  "restart.incomplete": "Apply did not complete. {detail}",
  "restart.incomplete.patches": "{failed} item(s) failed (#{ids}); inspect the item details",
  "restart.incomplete.flash": "Console-window suppression check failed ({entry})",
  "restart.incomplete.host": "Target host writes are not confirmed; check the client, host version and target path",
  "restart.incomplete.restore": "Configuration restoration did not complete; inspect diagnostics",
  "restart.incomplete.runtime": "CLI runtime check or repair failed; inspect diagnostics",
  "restart.incomplete.unknown": "The backend did not provide a specific cause; inspect the host version, item details and diagnostics",
  "restart.later": "Later",
  "group.prompt": "Prompt",
  "group.code": "Code",
  "group.engine": "Engine",
  "group.tools": "Tools",
  "group.compat": "0.1.5 compat",
  "group.dsh20": "0.2.0",
  "patch.1": "Global disclaimer \u2192 mandate",
  "patch.2": "Replacement disclaimer \u2192 mandate",
  "patch.3": "Scope disclaimer \u2192 mandate",
  "patch.4": "Persona session mandate",
  "patch.5": "Approval copy \u2192 full access",
  "patch.6": "Sandbox deny \u2192 allow write",
  "patch.7": "Sandbox default full access",
  "patch.8": "Approval default never",
  "patch.9": "Approval gate auto-grant",
  "patch.10": "Approval config default never",
  "patch.11": "never copy \u2192 auto-grant",
  "patch.12": "ask copy \u2192 auto-grant",
  "patch.13": "Escalation ladder exempt",
  "patch.14": "Escalation unconditional grant",
  "patch.15": "Sandbox confine passthrough",
  "patch.16": "Filesystem fence off",
  "patch.17": "Observation policy allow R/W",
  "patch.18": "Repeat-call guard off",
  "patch.19": "Tool-result pruner off",
  "patch.21": "Restore plugin-raised bash wait",
  "patch.22": "read cap raised",
  "patch.23": "subagent depth 3 \u2192 10",
  "patch.24": "preset fetch on",
  "patch.25": "Strip official default identity (keep feature prompts)",
  "patch.26": "minimal: strip identity, open inject",
  "patch.28": "dsh-liangshen: keep dsh-purge / dshpg in phase-1",
  "patch.70": "Minimal shell drops the no-network line",
  "patch.71": "Liangshen drops the stock identity line",
  "patch.29": "dsh-tool-web: untrusted framing \u2192 usable data",
  "patch.30": "dsh-hooks-claude-code: deny\u2192allow",
  "patch.31": "dsh-hooks-codex: deny\u2192allow",
  "patch.32": "Web surface identity neutral",
  "patch.33": "Shell denial prompt \u2192 executable",
  "patch.34": "Sandbox hint neutralized",
  "patch.35": "Escalation never-reject",
  "patch.36": "FS escalation schema opened",
  "patch.37": "Subagent scope lock neutralized",
  "patch.38": "persona text\u2192prefix (0.1.2 presets)",
  "patch.39": "session v0 plugin summary (mnemon)",
  "patch.40": "Keep inject when a complete prompt is set",
  "patch.42": "Settings legacy API",
  "patch.43": "Strip identity from web presets",
  "patch.45": "Official desktop update handoff",
  "patch.46": "Official update script stays ASCII",
  "patch.47": "OAuth no longer inserts Claude identity",
  "patch.48": "Shell drops extra delete caution",
  "patch.49": "OAuth no longer mimics claude-cli",
  "patch.50": "Session references are not marked untrusted",
  "patch.51": "Fresh session stays on full access",
  "patch.52": "Session log upload off by default",
  "patch.53": "Web prompt drops do-not-start",
  "patch.54": "Deliverable prompt drops extra prohibition",
  "patch.55": "Replace the first system prompt every step",
  "patch.56": "Rewind hides only the cut range",
  "patch.57": "developer role for openai/azure only, third-party gateways use system",
  "patch.58": "Rewind markers stay off the model request",
  "patch.59": "Official Auto Review no longer denies tools",
  "patch.60": "Official run_code drops approval teaching",
  "patch.61": "Official sandbox policy no longer teaches refusal",
  "patch.62": "Fail-open without approval channel (user reject kept)",
  "patch.63": "Plan mode no longer soft-blocks execution",
  "patch.64": "Stop hook no longer steers fake user text",
  "patch.65": "UserPromptSubmit deny no longer rejects turn",
  "patch.66": "Empty system section no longer ends the turn as an internal error",
  "patch.67": "A missing messages list no longer ends the turn",
  "patch.68": "Missing content after rewind no longer ends the turn",
  "patch.69": "deepseek-flash keeps the official in-history flag",
  "patch.72": "Messages system field uses the current system prompt",
  "patch.73": "Minimal preset drops stray mirror sentence",
  "patch.74": "Hang default prompt before first assemble",
  "patch.75": "Rewind resets completed todos to pending",
  "patch.76": "Unrestricted preset: strip identity sentence",
  "patch.77": "Rewind marker drops already-sent messages",
  "patch.78": "Restore missing overlay from .bak backup",
  "patch.80": "Restore official minimal tool plugins",
  "patch.82": "Fallback DSH_PROFILE=desktop in main process",
  "patch.83": "Don't fail on signal kill (no crash dialog)",
  "patch.84": "Don't fail on code=0 clean exit (no stopped dialog)",
  "status.na": "Not for this host",
  "metric.sealed": "Official client found. Apply to unpack",
  "metric.sealed.count": "Sealed",
  "metric.lost": "Patches lost \u2014 Apply again",
  "metric.lost.count": "Lost",
  "status.unlocated": "Not located",
  "metric.unlocated": "This install was not found yet",
  "rewind.label": "Undo",
  "rewind.aria": "Undo",
  "rewind.busy": "Undoing\u2026",
  "rewind.empty": "Nothing to undo",
  "rewind.fail": "Undo failed: {error}",
  "rewind.once": "Undo once",
  "rewind.once.hint": "Put this round's message back in the box and drop only this round",
  "rewind.round": "Undo last round",
  "rewind.round.hint": "Put this round's message back in the box; subagents drop only this round",
  "hooksDeny.title": "Hook interception",
  "hooksDeny.bypass": "Bypass hook deny / ask (patches 30 / 31 / 64 / 65)",
  "hooksDeny.hint": "When off, your own PreToolUse / UserPromptSubmit / Stop hook deny runs as the official host wrote it. The official ask branch is a no-op; turning this off will not show an approval dialog. Click Apply and restart to write the host files.",
  "saved.hooksDeny": "Saved",
  "continue.title": "Retry / Continue",
  "continue.hint": "Failed requests auto-retry. After an abnormal stop or interrupt, use Continue or auto-resume. A manual stop never auto-continues. Counts reset after a completed turn.",
  "continue.autoRetry": "Auto-retry on failure",
  "continue.retryMax": "Retry count",
  "continue.autoContinue": "Auto-continue after interrupt",
  "continue.continueMax": "Continue count",
  "continue.text": "Continue text",
  "saved.continue": "Saved",
  "continue.label": "Continue",
  "continue.aria": "Continue after an abnormal stop",
  "continue.busy": "Continuing\u2026",
  "continue.ready": "Continue ({left} left)",
  "continue.limit": "Continue limit reached",
  "continue.fail": "Continue failed: {error}",
  "updch.open": "Update channel",
  "updch.title": "Update channel: proxy and GitHub token",
  "updch.scope": "These settings apply only to this plugin's update check and download channel. They do not affect requests to any model provider and are never written into the host process environment. Leave blank to inherit the existing update proxy environment.",
  "updch.proxy": "Proxy URL",
  "updch.proxy.ph": "socks5://127.0.0.1:60808",
  "updch.proxy.hint": "Accepts http://, https:// and socks5:// prefixes, e.g. http://127.0.0.1:7890. Leave blank to inherit the existing update proxy environment.",
  "updch.token": "GitHub token",
  "updch.token.ph": "Optional: raises the GitHub API quota. Leave blank to keep it unchanged",
  "updch.token.set": "A token is configured on this machine. The field always starts empty; saving it empty keeps the current token.",
  "updch.token.unset": "No token is configured on this machine. Leaving it blank keeps it unset.",
  "updch.token.clear": "Clear the saved token",
  "updch.save": "Save",
  "updch.saving": "Saving\u2026",
  "updch.cancel": "Cancel",
  "updch.saved": "Update channel saved. It takes effect on the next update check.",
  "updch.state.proxy": "Update channel proxy: ",
  "updch.state.direct": "Update channel: inherited environment or system proxy",
  "updch.state.token.on": "GitHub token configured",
  "updch.state.token.off": "No GitHub token configured"
};

// src/components/auth.js
var AUTH_LEGAL_HTML = "<h3>\uC5C4\uACA9\uD55C \uBC95\uC801 \uBA74\uCC45 \uBC0F \uC900\uBC95 \uC0AC\uC6A9 \uC120\uC5B8</h3>\r\n    <p>\uC774 \uC120\uC5B8\uC740 \uB4DC\uB9B4 \uCF58\uC194\uC5D0 \uB4E4\uC5B4\uAC00\uAE30 \uC804\uC5D0 \uC804\uBB38\uC744 \uC77D\uC5B4\uC57C \uD569\uB2C8\uB2E4. \uC774 \uD504\uB85C\uC81D\uD2B8\uB294 \uBE44\uC601\uB9AC \uC624\uD508\uC18C\uC2A4 \uD504\uB85C\uC81D\uD2B8\uC774\uBA70 \uAD6D\uAC00 \uBC95\uB960\uACFC \uD574\uB2F9 \uD50C\uB7AB\uD3FC\uC758 \uADDC\uBC94\uC744 \uC900\uC218\uD558\uACE0 \uD559\uC2B5\xB7\uC5F0\uAD6C \uBC0F \uAE30\uC220 \uCC38\uACE0\uC6A9\uC73C\uB85C\uB9CC \uC81C\uACF5\uD569\uB2C8\uB2E4. \uC5B4\uB5A4 \uC8FC\uCCB4\uB3C4 \uC774 \uD504\uB85C\uC81D\uD2B8\uB97C \uC0C1\uC5C5\uC801 \uD310\uB9E4, \uC720\uB8CC \uC7AC\uD310\uB9E4, \uB610\uB294 \uD68C\uC0C9\xB7\uAC80\uC740 \uC2DC\uC7A5 \uC218\uC775\uC5D0 \uC0AC\uC6A9\uD558\uB294 \uAC83\uC744 \uC5C4\uACA9\uD788 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC1C\uBC1C\uC790\uB294 \uBAA8\uB4E0 \uD615\uD0DC\uC758 \uC704\uBC95 \uBC94\uC8C4\uB97C \uB2E8\uD638\uD788 \uBC18\uB300\uD558\uACE0 \uC5C4\uACA9\uD788 \uAE08\uC9C0\uD558\uBA70, \uBBF8\uC2B9\uC778 \uB124\uD2B8\uC6CC\uD06C \uACF5\uACA9, \uCDE8\uC57D\uC810 \uC775\uC2A4\uD50C\uB85C\uC787, \uB370\uC774\uD130 \uD0C8\uCDE8, \uCEF4\uD4E8\uD130 \uC815\uBCF4 \uC2DC\uC2A4\uD15C \uBD88\uBC95 \uCE68\uC785, \uB610\uB294 \uC704\uBC95\xB7\uAE08\uC9C0 \uCF58\uD150\uCE20 \uC0DD\uC131\uC744 \uC808\uB300 \uC9C0\uC6D0\xB7\uC870\uC7A5\xB7\uD611\uC870\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC774 \uD504\uB85C\uC81D\uD2B8\uB97C \uC704\uBC95 \uBC94\uC8C4\uC5D0 \uC0AC\uC6A9\uD55C \uD589\uC704\uB294 \uBAA8\uB450 \uAC1C\uBC1C\uC790\uC640 \uBB34\uAD00\uD558\uBA70, \uD589\uC704\uC790\uAC00 \uBC95\uC5D0 \uB530\uB77C \uC804\uC801\uC778 \uBC95\uC801 \uCC45\uC784\uC744 \uB3C5\uB9BD\uC801\uC73C\uB85C \uC9D1\uB2C8\uB2E4. \uC5F0\uAD6C, \uAD50\uC721, \uD14C\uC2A4\uD2B8, \uC2DC\uC5F0, \uB0B4\uBD80 \uD559\uC2B5\uC744 \uC774\uC720\uB85C \uC544\uB798 \uC870\uD56D\uC744 \uD68C\uD53C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <h3>1. \uC774 \uC800\uC7A5\uC18C\uC5D0\uB294 \uC704\uBC95 \uCF58\uD150\uCE20\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4</h3>\r\n    <p>dsh-purge \uAC00 \uBC30\uD3EC\uD558\uB294 \uCF54\uB4DC, \uBB38\uC11C, \uD328\uCE58, \uAE30\uBCF8 \uD504\uB86C\uD504\uD2B8\uB294 \uD2B8\uB85C\uC774 \uBAA9\uB9C8, \uBC31\uB3C4\uC5B4, \uBBF8\uC2B9\uC778 \uCE68\uD22C \uB3C4\uAD6C, \uB79C\uC12C\uC6E8\uC5B4, \uD06C\uB9AC\uB374\uC15C \uC2A4\uD130\uD551 \uC2A4\uD06C\uB9BD\uD2B8\uAC00 \uC544\uB2C8\uBA70, \uACF5\uC6A9 \uC778\uD130\uB137\uC774\uB098 \uC11C\uB4DC\uD30C\uD2F0 \uC2DC\uC2A4\uD15C\uC744 \uACA8\uB0E5\uD55C \uACF5\uACA9 \uD398\uC774\uB85C\uB4DC\uB3C4 \uC544\uB2D9\uB2C8\uB2E4. \uC774 \uD504\uB85C\uC81D\uD2B8\uB294 \uC704\uBC95 \uCF58\uD150\uCE20\uB97C \uC81C\uACF5\uD558\uC9C0 \uC54A\uACE0, \uC704\uBC95 \uBC94\uC8C4\uC758 \uAD50\uC0AC\xB7\uC870\uC9C1\xB7\uD611\uC870\uB3C4 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.</p>\r\n    <h3>2. \uB85C\uCEEC \uC870\uC791\uC740 \uB300\uC678 \uAD8C\uD55C\uC744 \uAD6C\uC131\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4</h3>\r\n    <p>\uD328\uCE58 \uC801\uC6A9, \uC4F0\uAE30, \uB864\uBC31, \uC81C\uAC70\uB294 \uBAA8\uB450 \uB85C\uCEEC \uD30C\uC77C\uACFC \uB85C\uCEEC \uD504\uB85C\uC138\uC2A4 \uC548\uC5D0\uC11C \uC644\uB8CC\uB429\uB2C8\uB2E4. \uC774\uB7EC\uD55C \uC870\uC791\uC740 \uC5B4\uB5A4 \uACF5\uC6A9 \uC778\uD130\uB137 \uD638\uC2A4\uD2B8\uB098 \uBBF8\uC2B9\uC778 \uC2DC\uC2A4\uD15C\uC5D0 \uB300\uD574\uC11C\uB3C4 \uC2A4\uCE94, \uD0D0\uC9C0, \uCE68\uC785, \uACF5\uACA9 \uD328\uD0B7 \uBC1C\uC2E0\uC744 \uD558\uC9C0 \uC54A\uC73C\uBA70, \uB85C\uCEEC \uAE30\uAE30\uB97C \uACBD\uC720\uC9C0\uB85C \uC0BC\uC544\uC11C\uB3C4 \uC548 \uB429\uB2C8\uB2E4.</p>\r\n    <p>\uD50C\uB7EC\uADF8\uC778\uC774 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778\uC744 \uCF1C\uBA74 \uC774 \uD50C\uB7EC\uADF8\uC778 \uC790\uCCB4\uC758 GitHub \uC800\uC7A5\uC18C\uC5D0\uB9CC \uC811\uC18D\uD574 \uBC84\uC804\uC744 \uB300\uC870\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uC774 \uC811\uC18D\uC740 \uC11C\uB4DC\uD30C\uD2F0 \uC2DC\uC2A4\uD15C\uC5D0 \uB300\uD55C \uB124\uD2B8\uC6CC\uD06C \uACF5\uACA9\uACFC \uBB34\uAD00\uD558\uBA70, \uB300\uC678 \uCE68\uD22C\uC5D0 \uB300\uD55C \uAD8C\uD55C\uC73C\uB85C \uD574\uC11D\uB420 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <h3>3. \uD5C8\uC6A9\uB418\uB294 \uC0AC\uC6A9 \uBC94\uC704</h3>\r\n    <p>\uC790\uC2E0\uC774 \uCC98\uB9AC \uAD8C\uD55C\uC744 \uC99D\uBA85\uD560 \uC218 \uC788\uB294 \uD658\uACBD\uC5D0\uC11C\uB9CC \uC0AC\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4: \uBCF8\uC778\uC774 \uAD00\uB9AC \uAD8C\uD55C\uC744 \uAC00\uC9C4 \uB85C\uCEEC \uAE30\uAE30\uC758 \uACF5\uC2DD Harness, \uC624\uD504\uB77C\uC778 \uB85C\uCEEC \uD569\uC131 \uC2E4\uC2B5 \uD658\uACBD, \uC18C\uC720\uC790\uAC00 \uC801\uBC95\uD55C \uC11C\uBA74 \uC2B9\uC778\uC744 \uBC1C\uAE09\uD55C \uB124\uD2B8\uC6CC\uD06C \uBCF4\uC548 \uB4DC\uB9B4 \uC2E4\uC2B5 \uD658\uACBD, \uADDC\uC815\uC744 \uC900\uC218\uD558\uB294 \uC2E4\uD5D8\uC2E4\uC758 \uD1B5\uC81C\uB41C \uD658\uACBD. \uC11C\uBA74 \uC2B9\uC778\uC740 \uAD6C\uCCB4\uC801 \uB300\uC0C1, \uAE30\uAC04, \uBC94\uC704\uC5D0 \uB300\uC751\uD574\uC57C \uD569\uB2C8\uB2E4. \uAE30\uAD00 \uC774\uB984\uB9CC \uC801\uAC70\uB098 \uAD6C\uB450 \uC9C4\uC220\uB9CC\uC73C\uB85C\uB294 \uC2B9\uC778\uC774 \uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.</p>\r\n    <p>\uC18C\uC720\uC790\uC758 \uC801\uBC95\uD55C \uC11C\uBA74 \uC2B9\uC778\uC774 \uC5C6\uB294 \uB300\uC0C1, \uACF5\uC6A9 \uC778\uD130\uB137 \uC628\uB77C\uC778 \uC2DC\uC2A4\uD15C, \uC6B4\uC601 \uC911\uC778 \uC11C\uBE44\uC2A4, \uADF8\uB9AC\uACE0 \uC5D0\uB108\uC9C0\xB7\uAD50\uD1B5\xB7\uC218\uB9AC\xB7\uAE08\uC735\xB7\uACF5\uACF5 \uC11C\uBE44\uC2A4\xB7\uC804\uC790 \uC815\uBD80 \uB4F1 \uD575\uC2EC \uC815\uBCF4 \uAE30\uBC18 \uC2DC\uC124\uC740 \uB4DC\uB9B4 \uB300\uC0C1\uC73C\uB85C \uC0BC\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <h3>4. \uC900\uC218\uD574\uC57C \uD558\uB294 \uBC95\uB960(\uC870\xB7\uD56D\uBCC4)</h3>\r\n    <p>\uC911\uAD6D \uD615\uBC95 \uC81C285\uC870 \uC81C1\uD56D: \uAD6D\uAC00 \uADDC\uC815\uC744 \uC704\uBC18\uD574 \uAD6D\uAC00 \uC0AC\uBB34, \uAD6D\uBC29 \uAC74\uC124, \uCCA8\uB2E8 \uACFC\uD559\uAE30\uC220 \uBD84\uC57C\uC758 \uCEF4\uD4E8\uD130 \uC815\uBCF4 \uC2DC\uC2A4\uD15C\uC5D0 \uCE68\uC785\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC19\uC740 \uC870 \uC81C2\uD56D: \uC804\uD56D\uC5D0\uC11C \uADDC\uC815\uD55C \uBC94\uC704 \uBC16\uC758 \uCEF4\uD4E8\uD130 \uC815\uBCF4 \uC2DC\uC2A4\uD15C\uC5D0 \uCE68\uC785\uD558\uAC70\uB098, \uB2E4\uB978 \uAE30\uC220 \uC218\uB2E8\uC73C\uB85C \uADF8 \uC2DC\uC2A4\uD15C\uC5D0 \uC800\uC7A5\xB7\uCC98\uB9AC\xB7\uC804\uC1A1\uB418\uB294 \uB370\uC774\uD130\uB97C \uD68D\uB4DD\uD558\uAC70\uB098, \uADF8 \uC2DC\uC2A4\uD15C\uC744 \uBD88\uBC95 \uD1B5\uC81C\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC19\uC740 \uC870 \uC81C3\uD56D: \uCEF4\uD4E8\uD130 \uC815\uBCF4 \uC2DC\uC2A4\uD15C \uCE68\uC785\xB7\uBD88\uBC95 \uD1B5\uC81C\uC5D0 \uC804\uC6A9\uB418\uB294 \uD504\uB85C\uADF8\uB7A8\uC774\uB098 \uB3C4\uAD6C\uB97C \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uD0C0\uC778\uC774 \uCE68\uC785\xB7\uBD88\uBC95 \uD1B5\uC81C\uB97C \uD55C\uB2E4\uB294 \uC0AC\uC2E4\uC744 \uC54C\uBA74\uC11C \uD504\uB85C\uADF8\uB7A8\uC774\uB098 \uB3C4\uAD6C\uB97C \uC81C\uACF5\uD558\uB294 \uD589\uC704\uB3C4 \uB9C8\uCC2C\uAC00\uC9C0\uB85C \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C286\uC870 \uC81C1\uD56D: \uCEF4\uD4E8\uD130 \uC815\uBCF4 \uC2DC\uC2A4\uD15C \uAE30\uB2A5\uC744 \uC0AD\uC81C\xB7\uC218\uC815\xB7\uCD94\uAC00\xB7\uBC29\uD574\uD574 \uC2DC\uC2A4\uD15C\uC774 \uC815\uC0C1\uC801\uC73C\uB85C \uC791\uB3D9\uD558\uC9C0 \uBABB\uD558\uAC8C \uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC19\uC740 \uC870 \uC81C2\uD56D: \uC2DC\uC2A4\uD15C\uC5D0 \uC800\uC7A5\xB7\uCC98\uB9AC\xB7\uC804\uC1A1\uB418\uB294 \uB370\uC774\uD130\uC640 \uC751\uC6A9 \uD504\uB85C\uADF8\uB7A8\uC744 \uC0AD\uC81C\xB7\uC218\uC815\xB7\uCD94\uAC00\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC19\uC740 \uC870 \uC81C3\uD56D: \uCEF4\uD4E8\uD130 \uBC14\uC774\uB7EC\uC2A4 \uB4F1 \uD30C\uAD34\uC801 \uD504\uB85C\uADF8\uB7A8\uC744 \uACE0\uC758\uB85C \uC81C\uC791\xB7\uC804\uD30C\uD574 \uCEF4\uD4E8\uD130 \uC2DC\uC2A4\uD15C\uC758 \uC815\uC0C1 \uC791\uB3D9\uC5D0 \uC601\uD5A5\uC744 \uC8FC\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C287\uC870: \uCEF4\uD4E8\uD130\uB97C \uC774\uC6A9\uD574 \uAE08\uC735 \uC0AC\uAE30, \uC808\uB3C4, \uD6A1\uB839, \uACF5\uAE08 \uC720\uC6A9, \uAD6D\uAC00 \uAE30\uBC00 \uD0C8\uCDE8 \uB610\uB294 \uADF8 \uBC16\uC758 \uBC94\uC8C4\uB97C \uC800\uC9C0\uB974\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C287\uC870\uC7582 \uC81C1\uD56D \uC81C1\uD638: \uC0AC\uAE30 \uC2E4\uD589, \uBC94\uC8C4 \uBC29\uBC95 \uC804\uC218, \uAE08\uC9C0 \uBB3C\uD488\xB7\uADDC\uC81C \uBB3C\uD488\uC758 \uC81C\uC791\uC774\uB098 \uD310\uB9E4 \uB4F1 \uC704\uBC95 \uBC94\uC8C4 \uD65C\uB3D9\uC5D0 \uC0AC\uC6A9\uD558\uB294 \uC6F9\uC0AC\uC774\uD2B8\uB098 \uD1B5\uC2E0 \uADF8\uB8F9\uC744 \uAC1C\uC124\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC19\uC740 \uD56D \uC81C2\uD638: \uB9C8\uC57D, \uCD1D\uAE30, \uC74C\uB780\uBB3C \uB4F1 \uAE08\uC9C0 \uBB3C\uD488\xB7\uADDC\uC81C \uBB3C\uD488\uC758 \uC81C\uC791\uC774\uB098 \uD310\uB9E4, \uB610\uB294 \uADF8 \uBC16\uC758 \uC704\uBC95 \uBC94\uC8C4\uC5D0 \uAD00\uD55C \uC815\uBCF4\uB97C \uAC8C\uC2DC\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC19\uC740 \uD56D \uC81C3\uD638: \uC0AC\uAE30 \uB4F1 \uC704\uBC95 \uBC94\uC8C4 \uD65C\uB3D9\uC744 \uC704\uD574 \uC815\uBCF4\uB97C \uAC8C\uC2DC\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C287\uC870\uC7583: \uD0C0\uC778\uC774 \uC815\uBCF4 \uB124\uD2B8\uC6CC\uD06C\uB97C \uC774\uC6A9\uD574 \uBC94\uC8C4\uB97C \uC800\uC9C0\uB978\uB2E4\uB294 \uC0AC\uC2E4\uC744 \uC54C\uBA74\uC11C\uB3C4 \uAE30\uC220 \uC9C0\uC6D0\uC744 \uC81C\uACF5\uD558\uAC70\uB098, \uAD11\uACE0 \uD64D\uBCF4\xB7\uACB0\uC81C \uC815\uC0B0 \uB4F1\uC758 \uB3C4\uC6C0\uC744 \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C253\uC870\uC7582 \uC81C1\uD56D\xB7\uC81C3\uD56D: \uD0C0\uC778\uC5D0\uAC8C \uC2DC\uBBFC \uAC1C\uC778\uC815\uBCF4\uB97C \uD310\uB9E4\uD558\uAC70\uB098 \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uC2DC\uBBFC \uAC1C\uC778\uC815\uBCF4\uB97C \uC808\uCDE8\uD558\uAC70\uB098 \uADF8 \uBC16\uC758 \uBC29\uBC95\uC73C\uB85C \uBD88\uBC95 \uD68D\uB4DD\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC911\uAD6D \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uBC95 \uC81C13\uC870 \uC81C2\uD56D: \uB124\uD2B8\uC6CC\uD06C\uB97C \uC0AC\uC6A9\uD574 \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uC744 \uD574\uCE58\uAC70\uB098, \uB124\uD2B8\uC6CC\uD06C\uB97C \uC774\uC6A9\uD574 \uAD6D\uAC00 \uC548\uC804\xB7\uBA85\uC608\xB7\uC774\uC775\uC744 \uD574\uCE58\uAC70\uB098, \uAD6D\uAC00 \uC815\uAD8C \uC804\uBCF5\xB7\uC0AC\uD68C\uC8FC\uC758 \uC81C\uB3C4 \uC804\uBCF5\uC744 \uC120\uB3D9\uD558\uAC70\uB098, \uAD6D\uAC00 \uBD84\uC5F4\xB7\uAD6D\uAC00 \uD1B5\uC77C \uD30C\uAD34\uB97C \uC120\uB3D9\uD558\uAC70\uB098, \uD14C\uB7EC\uB9AC\uC998\xB7\uADF9\uB2E8\uC8FC\uC758\uB97C \uC120\uC804\uD558\uAC70\uB098, \uBBFC\uC871 \uC99D\uC624\xB7\uBBFC\uC871 \uCC28\uBCC4\uC744 \uC120\uC804\uD558\uAC70\uB098, \uD3ED\uB825\xB7\uC74C\uB780 \uC0C9\uC815 \uC815\uBCF4\uB97C \uC804\uD30C\uD558\uAC70\uB098, \uD5C8\uC704 \uC815\uBCF4\uB97C \uC870\uC791\xB7\uC804\uD30C\uD574 \uACBD\uC81C \uC9C8\uC11C\uC640 \uC0AC\uD68C \uC9C8\uC11C\uB97C \uC5B4\uC9C0\uB7FD\uD788\uAC70\uB098, \uD0C0\uC778\uC758 \uBA85\uC608\xB7\uC0AC\uC0DD\uD65C\xB7\uC9C0\uC2DD\uC7AC\uC0B0\uAD8C \uBC0F \uADF8 \uBC16\uC758 \uD569\uBC95\uC801 \uAD8C\uC775\uC744 \uCE68\uD574\uD558\uB294 \uB4F1\uC758 \uD65C\uB3D9\uC744 \uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C14\uC870: \uB124\uD2B8\uC6CC\uD06C\uB97C \uC774\uC6A9\uD574 \uBBF8\uC131\uB144\uC790\uC758 \uC2E0\uCCB4\uC801\xB7\uC815\uC2E0\uC801 \uAC74\uAC15\uC744 \uD574\uCE58\uB294 \uD65C\uB3D9\uC744 \uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C29\uC870: \uD0C0\uC778\uC758 \uB124\uD2B8\uC6CC\uD06C\uC5D0 \uBD88\uBC95 \uCE68\uC785\uD558\uAC70\uB098, \uD0C0\uC778 \uB124\uD2B8\uC6CC\uD06C\uC758 \uC815\uC0C1 \uAE30\uB2A5\uC744 \uBC29\uD574\uD558\uAC70\uB098, \uB124\uD2B8\uC6CC\uD06C \uB370\uC774\uD130\uB97C \uC808\uCDE8\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uB124\uD2B8\uC6CC\uD06C \uCE68\uC785, \uB124\uD2B8\uC6CC\uD06C \uC815\uC0C1 \uAE30\uB2A5 \uBC0F \uBCF4\uD638 \uC870\uCE58 \uBC29\uD574, \uB124\uD2B8\uC6CC\uD06C \uB370\uC774\uD130 \uC808\uCDE8\uC5D0 \uC804\uC6A9\uB418\uB294 \uD504\uB85C\uADF8\uB7A8\uC774\uB098 \uB3C4\uAD6C\uB97C \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uD0C0\uC778\uC774 \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uC744 \uD574\uCE58\uB294 \uD65C\uB3D9\uC744 \uD55C\uB2E4\uB294 \uC0AC\uC2E4\uC744 \uC54C\uBA74\uC11C \uAE30\uC220 \uC9C0\uC6D0\xB7\uAD11\uACE0 \uD64D\uBCF4\xB7\uACB0\uC81C \uC815\uC0B0 \uB4F1\uC758 \uB3C4\uC6C0\uC744 \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C33\uC870: \uACF5\uACF5 \uD1B5\uC2E0\uACFC \uC815\uBCF4 \uC11C\uBE44\uC2A4, \uC5D0\uB108\uC9C0, \uAD50\uD1B5, \uC218\uB9AC, \uAE08\uC735, \uACF5\uACF5 \uC11C\uBE44\uC2A4, \uC804\uC790 \uC815\uBD80 \uB4F1 \uD575\uC2EC \uC815\uBCF4 \uAE30\uBC18 \uC2DC\uC124\uC5D0 \uB300\uD574 \uC911\uC810 \uBCF4\uD638\uB97C \uC2E4\uC2DC\uD569\uB2C8\uB2E4. \uC801\uBC95\uD55C \uC2B9\uC778 \uC5C6\uC774 \uCE68\uC785\xB7\uBC29\uD574\xB7\uD30C\uAD34\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <p>\uC81C46\uC870: \uAC1C\uC778\uC815\uBCF4\uB97C \uC808\uCDE8\uD558\uAC70\uB098 \uADF8 \uBC16\uC758 \uBD88\uBC95 \uBC29\uC2DD\uC73C\uB85C \uD68D\uB4DD\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD558\uBA70, \uAC1C\uC778\uC815\uBCF4\uB97C \uBD88\uBC95 \uD310\uB9E4\uD558\uAC70\uB098 \uBD88\uBC95\uC73C\uB85C \uD0C0\uC778\uC5D0\uAC8C \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C48\uC870: \uC0AC\uAE30 \uC2E4\uD589, \uBC94\uC8C4 \uBC29\uBC95 \uC804\uC218, \uAE08\uC9C0 \uBB3C\uD488\xB7\uADDC\uC81C \uBB3C\uD488\uC758 \uC81C\uC791\uC774\uB098 \uD310\uB9E4 \uB4F1 \uC704\uBC95 \uBC94\uC8C4 \uD65C\uB3D9\uC5D0 \uC0AC\uC6A9\uD558\uB294 \uC6F9\uC0AC\uC774\uD2B8\uB098 \uD1B5\uC2E0 \uADF8\uB8F9\uC744 \uAC1C\uC124\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uB124\uD2B8\uC6CC\uD06C\uB97C \uC774\uC6A9\uD574 \uC704\uC758 \uC704\uBC95 \uBC94\uC8C4 \uD65C\uB3D9\uC5D0 \uAD00\uD55C \uC815\uBCF4\uB97C \uAC8C\uC2DC\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C50\uC870: \uBC1C\uC1A1\uD558\uB294 \uC804\uC790 \uC815\uBCF4\uC640 \uC81C\uACF5\uD558\uB294 \uC751\uC6A9 \uC18C\uD504\uD2B8\uC6E8\uC5B4\uC5D0 \uC545\uC131 \uD504\uB85C\uADF8\uB7A8\uC744 \uC124\uC815\uD574\uC11C\uB294 \uC548 \uB418\uBA70, \uBC95\uB960\xB7\uD589\uC815 \uBC95\uADDC\uAC00 \uAC8C\uC2DC\uB098 \uC804\uC1A1\uC744 \uAE08\uC9C0\uD558\uB294 \uC815\uBCF4\uB97C \uD3EC\uD568\uD574\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4.</p>\r\n    <p>\uC911\uAD6D \uB370\uC774\uD130 \uC548\uC804\uBC95 \uC81C8\uC870: \uB370\uC774\uD130 \uCC98\uB9AC \uD65C\uB3D9\uC744 \uD558\uBA74\uC11C \uAD6D\uAC00 \uC548\uC804\uACFC \uACF5\uACF5 \uC774\uC775\uC744 \uD574\uCCD0\uC11C\uB294 \uC548 \uB418\uACE0, \uAC1C\uC778\uACFC \uC870\uC9C1\uC758 \uD569\uBC95\uC801 \uAD8C\uC775\uC744 \uCE68\uD574\uD574\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4.</p>\r\n    <p>\uC81C32\uC870 \uC81C1\uD56D: \uB370\uC774\uD130\uB97C \uC218\uC9D1\uD560 \uB54C\uB294 \uC801\uBC95\uD558\uACE0 \uC815\uB2F9\uD55C \uBC29\uC2DD\uC744 \uCDE8\uD574\uC57C \uD558\uBA70, \uC808\uCDE8\uD558\uAC70\uB098 \uADF8 \uBC16\uC758 \uBD88\uBC95 \uBC29\uC2DD\uC73C\uB85C \uB370\uC774\uD130\uB97C \uD68D\uB4DD\uD574\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4.</p>\r\n    <p>\uAC19\uC740 \uC870 \uC81C2\uD56D: \uBC95\uB960\xB7\uD589\uC815 \uBC95\uADDC\uAC00 \uB370\uC774\uD130 \uC218\uC9D1\xB7\uC0AC\uC6A9\uC758 \uBAA9\uC801\uACFC \uBC94\uC704\uB97C \uADDC\uC815\uD55C \uACBD\uC6B0, \uADF8 \uBAA9\uC801\uACFC \uBC94\uC704 \uC548\uC5D0\uC11C\uB9CC \uC218\uC9D1\xB7\uC0AC\uC6A9\uD574\uC57C \uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C51\uC870: \uB370\uC774\uD130\uB97C \uC808\uCDE8\uD558\uAC70\uB098 \uADF8 \uBC16\uC758 \uBD88\uBC95 \uBC29\uC2DD\uC73C\uB85C \uD68D\uB4DD\uD558\uAC70\uB098, \uADF8\uB85C \uC778\uD574 \uAC1C\uC778\xB7\uC870\uC9C1\uC758 \uD569\uBC95\uC801 \uAD8C\uC775\uC744 \uCE68\uD574\uD55C \uACBD\uC6B0\uC5D0\uB294 \uAD00\uB828 \uBC95\uB960\xB7\uD589\uC815 \uBC95\uADDC\uC5D0 \uB530\uB77C \uCC98\uBC8C\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC911\uAD6D \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uBC95 \uC81C5\uC870: \uAC1C\uC778\uC815\uBCF4\uB97C \uCC98\uB9AC\uD560 \uB54C\uB294 \uC801\uBC95\xB7\uC815\uB2F9\xB7\uD544\uC694\xB7\uC2E0\uC758\uC758 \uC6D0\uCE59\uC744 \uC9C0\uCF1C\uC57C \uD558\uBA70, \uC624\uB3C4\xB7\uC0AC\uAE30\xB7\uAC15\uC694 \uB4F1\uC758 \uBC29\uC2DD\uC73C\uB85C \uCC98\uB9AC\uD574\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4.</p>\r\n    <p>\uC81C6\uC870 \uC81C1\uD56D\xB7\uC81C2\uD56D: \uAC1C\uC778\uC815\uBCF4\uB97C \uCC98\uB9AC\uD560 \uB54C\uB294 \uBA85\uD655\uD558\uACE0 \uD569\uB9AC\uC801\uC778 \uBAA9\uC801\uC774 \uC788\uC5B4\uC57C \uD558\uACE0 \uADF8 \uBAA9\uC801\uACFC \uC9C1\uC811 \uAD00\uB828\uB418\uC5B4\uC57C \uD558\uBA70, \uAC1C\uC778\uC758 \uAD8C\uC775\uC5D0 \uBBF8\uCE58\uB294 \uC601\uD5A5\uC774 \uCD5C\uC18C\uC778 \uBC29\uC2DD\uC744 \uCDE8\uD574\uC57C \uD569\uB2C8\uB2E4. \uC218\uC9D1\uC740 \uCC98\uB9AC \uBAA9\uC801 \uB2EC\uC131\uC5D0 \uD544\uC694\uD55C \uCD5C\uC18C \uBC94\uC704\uB85C \uD55C\uC815\uD558\uBA70, \uACFC\uB3C4\uD558\uAC8C \uC218\uC9D1\uD574\uC11C\uB294 \uC548 \uB429\uB2C8\uB2E4.</p>\r\n    <p>\uC81C10\uC870: \uD0C0\uC778\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uBD88\uBC95\uC73C\uB85C \uC218\uC9D1\xB7\uC0AC\uC6A9\xB7\uAC00\uACF5\xB7\uC804\uC1A1\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD558\uACE0, \uD0C0\uC778\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uBD88\uBC95\uC73C\uB85C \uB9E4\uB9E4\xB7\uC81C\uACF5\xB7\uACF5\uAC1C\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uAD6D\uAC00 \uC548\uC804\uACFC \uACF5\uACF5 \uC774\uC775\uC744 \uD574\uCE58\uB294 \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC \uD65C\uB3D9\uC744 \uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC81C13\uC870: \uAC1C\uC778\uC758 \uB3D9\uC758\uB97C \uBC1B\uC9C0 \uC54A\uC558\uACE0, \uACC4\uC57D \uCCB4\uACB0\xB7\uC774\uD589\uC5D0 \uD544\uC694\uD55C \uACBD\uC6B0, \uBC95\uC815 \uC9C1\uBB34 \uC218\uD589, \uB3CC\uBC1C \uC0C1\uD669 \uB300\uC751, \uACF5\uACF5 \uC774\uC775\uC744 \uC704\uD55C \uC5B8\uB860 \uBCF4\uB3C4, \uBCF8\uC778\uC774 \uC774\uBBF8 \uC801\uBC95\uD558\uAC8C \uACF5\uAC1C\uD55C \uC815\uBCF4\uC758 \uCC98\uB9AC, \uBC95\uB960\xB7\uD589\uC815 \uBC95\uADDC\uAC00 \uC815\uD55C \uADF8 \uBC16\uC758 \uC0AC\uC720\uC5D0\uB3C4 \uD574\uB2F9\uD558\uC9C0 \uC54A\uC73C\uBA74 \uAC1C\uC778\uC815\uBCF4\uB97C \uCC98\uB9AC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <p>\uC81C28\uC870\xB7\uC81C29\uC870: \uC0DD\uCCB4 \uC778\uC2DD, \uC758\uB8CC \uAC74\uAC15, \uAE08\uC735 \uACC4\uC88C, \uC774\uB3D9 \uACBD\uB85C, \uADF8\uB9AC\uACE0 \uB9CC 14\uC138 \uBBF8\uB9CC \uBBF8\uC131\uB144\uC790\uC758 \uAC1C\uC778\uC815\uBCF4\uB294 \uBBFC\uAC10 \uAC1C\uC778\uC815\uBCF4\uC5D0 \uC18D\uD569\uB2C8\uB2E4. \uD2B9\uC815 \uBAA9\uC801\uACFC \uCDA9\uBD84\uD55C \uD544\uC694\uC131, \uC5C4\uACA9\uD55C \uBCF4\uD638 \uC870\uCE58\uAC00 \uC5C6\uACE0 \uAC1C\uC778\uC758 \uBCC4\uB3C4 \uB3D9\uC758\uB97C \uBC1B\uC9C0 \uC54A\uC558\uB2E4\uBA74 \uCC98\uB9AC\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <p>\uADF8 \uBC16\uC5D0\uB3C4 \uD604\uD589 \uC720\uD6A8\uD55C \uB2E4\uB978 \uBC95\uB960\xB7\uD589\uC815 \uBC95\uADDC\xB7\uAC10\uB3C5 \uADDC\uC815, \uADF8\uB9AC\uACE0 \uC0AC\uC6A9\uD558\uB294 \uBAA8\uB378\uC758 \uC11C\uBE44\uC2A4 \uC57D\uAD00\uACFC \uB0A8\uC6A9 \uC815\uCC45\uC744 \uC900\uC218\uD574\uC57C \uD569\uB2C8\uB2E4.</p>\r\n    <h3>5. \uC774\uC5D0 \uB530\uB77C \uAE08\uC9C0\uB418\uB294 \uBC29\uD5A5</h3>\r\n    <p>\uBBF8\uC2B9\uC778 \uC811\uADFC. \uC11C\uBA74 \uC2B9\uC778\uC774 \uC5C6\uB294 \uAE30\uAD00, \uB3C4\uBA54\uC778, \uC8FC\uC18C, \uACF5\uC6A9 \uC778\uD130\uB137 \uC2DC\uC2A4\uD15C, \uC6B4\uC601 \uC911\uC778 \uC11C\uBE44\uC2A4, \uD575\uC2EC \uC815\uBCF4 \uAE30\uBC18 \uC2DC\uC124\uC744 \uC2E4\uC2B5 \uB300\uC0C1\uC73C\uB85C \uB4F1\uB85D\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD558\uBA70, \uADF8\uC5D0 \uB300\uD55C \uC2A4\uCE94\xB7\uD0D0\uC9C0\xB7\uCE68\uC785\xB7\uD1B5\uC81C\xB7\uD328\uD0B7 \uBC1C\uC2E0\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uD615\uBC95 \uC81C285\uC870 \uC81C1\uD56D\xB7\uC81C2\uD56D, \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uBC95 \uC81C29\uC870\xB7\uC81C33\uC870\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uD30C\uAD34\uC640 \uC545\uC131 \uD504\uB85C\uADF8\uB7A8. \uD0C0\uC778 \uC2DC\uC2A4\uD15C \uAE30\uB2A5\uC774\uB098 \uADF8 \uC548\uC758 \uB370\uC774\uD130\xB7\uC751\uC6A9 \uD504\uB85C\uADF8\uB7A8\uC744 \uC0AD\uC81C\xB7\uC218\uC815\xB7\uCD94\uAC00\xB7\uBC29\uD574\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uBC14\uC774\uB7EC\uC2A4, \uB79C\uC12C\uC6E8\uC5B4 \uB610\uB294 \uADF8 \uBC16\uC758 \uD30C\uAD34\uC801 \uD504\uB85C\uADF8\uB7A8\uC744 \uC81C\uC791\xB7\uC804\uD30C\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uC815\uBCF4\uB098 \uC18C\uD504\uD2B8\uC6E8\uC5B4\uC5D0 \uC545\uC131 \uD504\uB85C\uADF8\uB7A8\uC744 \uC124\uC815\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uD615\uBC95 \uC81C286\uC870 \uC81C1\uD56D\uBD80\uD130 \uC81C3\uD56D, \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uBC95 \uC81C50\uC870\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uB3C4\uAD6C\uC640 \uC870\uB825. \uC774 \uD504\uB85C\uC81D\uD2B8\uB098 \uC774 \uAE30\uAE30\uB97C \uD0C0\uC778\uC5D0\uAC8C \uC81C\uACF5\uD574 \uCE68\uC785, \uBD88\uBC95 \uD1B5\uC81C, \uB370\uC774\uD130 \uC808\uCDE8\uC5D0 \uC4F0\uAC8C \uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uC0C1\uB300\uBC29\uC774 \uB124\uD2B8\uC6CC\uD06C \uBC94\uC8C4\uB97C \uC800\uC9C0\uB974\uACE0 \uC788\uB2E4\uB294 \uC0AC\uC2E4\uC744 \uC54C\uBA74\uC11C\uB3C4 \uD504\uB85C\uADF8\uB7A8, \uB3C4\uAD6C, \uAE30\uC220 \uC9C0\uC6D0, \uAD11\uACE0 \uD64D\uBCF4, \uACB0\uC81C \uC815\uC0B0\uC744 \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uD615\uBC95 \uC81C285\uC870 \uC81C3\uD56D, \uC81C287\uC870\uC7583, \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uBC95 \uC81C29\uC870\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uB370\uC774\uD130. \uC5C5\uBB34 \uB370\uC774\uD130, \uACC4\uC815, \uBE44\uBC00\uBC88\uD638 \uBC0F \uADF8 \uBC16\uC758 \uBCF4\uD638 \uB300\uC0C1 \uB370\uC774\uD130\uB97C \uC808\uCDE8\xB7\uBD88\uBC95 \uC218\uC9D1\xB7\uBC94\uC704 \uCD08\uACFC \uC0AC\uC6A9\xB7\uC720\uCD9C\xB7\uD310\uB9E4\uD558\uAC70\uB098 \uD0C0\uC778\uC5D0\uAC8C \uC81C\uACF5\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uB370\uC774\uD130 \uC548\uC804\uBC95 \uC81C8\uC870\xB7\uC81C32\uC870\xB7\uC81C51\uC870\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uAC1C\uC778\uC815\uBCF4. \uD0C0\uC778\uC758 \uAC1C\uC778\uC815\uBCF4\uB97C \uBD88\uBC95\uC73C\uB85C \uC218\uC9D1\xB7\uC0AC\uC6A9\xB7\uAC00\uACF5\xB7\uC804\uC1A1\xB7\uB9E4\uB9E4\xB7\uC81C\uACF5\xB7\uACF5\uAC1C\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uACFC\uB3C4\uD55C \uC218\uC9D1\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uC624\uB3C4\xB7\uC0AC\uAE30\xB7\uAC15\uC694 \uBC29\uC2DD\uC758 \uCC98\uB9AC\uB97C \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uC0DD\uCCB4 \uC778\uC2DD, \uC758\uB8CC \uAC74\uAC15, \uAE08\uC735 \uACC4\uC88C, \uC774\uB3D9 \uACBD\uB85C, \uC544\uB3D9 \uAC1C\uC778\uC815\uBCF4\uB97C \uC784\uC758\uB85C \uCC98\uB9AC\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uD615\uBC95 \uC81C253\uC870\uC7582 \uC81C1\uD56D\xB7\uC81C3\uD56D, \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uBC95 \uC81C46\uC870, \uAC1C\uC778\uC815\uBCF4 \uBCF4\uD638\uBC95 \uC81C5\uC870\xB7\uC81C6\uC870\xB7\uC81C10\uC870\xB7\uC81C13\uC870\xB7\uC81C28\uC870\xB7\uC81C29\uC870\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uC0AC\uAE30\uC640 \uC704\uBC95 \uC815\uBCF4. \uC6F9\uC0AC\uC774\uD2B8\uB098 \uADF8\uB8F9\uC744 \uAC1C\uC124\uD558\uAC70\uB098 \uC774\uC6A9\uD574 \uC0AC\uAE30, \uBC94\uC8C4 \uBC29\uBC95 \uC804\uC218, \uAE08\uC9C0 \uBB3C\uD488\xB7\uADDC\uC81C \uBB3C\uD488\uC758 \uC81C\uC791\uC774\uB098 \uD310\uB9E4\uB97C \uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uADF8\uB7EC\uD55C \uC815\uBCF4\uB97C \uAC8C\uC2DC\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uCEF4\uD4E8\uD130\uB97C \uC774\uC6A9\uD574 \uC0AC\uAE30, \uC808\uB3C4, \uD6A1\uB839, \uACF5\uAE08 \uC720\uC6A9, \uAD6D\uAC00 \uAE30\uBC00 \uD0C8\uCDE8\uB97C \uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uD615\uBC95 \uC81C287\uC870, \uC81C287\uC870\uC7582 \uC81C1\uD56D \uC81C1\uD638\uBD80\uD130 \uC81C3\uD638, \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uBC95 \uC81C48\uC870\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uCF58\uD150\uCE20. \uAD6D\uAC00 \uC548\uC804\xB7\uBA85\uC608\xB7\uC774\uC775\uC744 \uD574\uCE58\uB294 \uCF58\uD150\uCE20\uB97C \uC0DD\uC131\uD558\uAC70\uB098 \uC804\uD30C\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD558\uACE0, \uC815\uAD8C \uC804\uBCF5\xB7\uBD84\uC5F4\uC744 \uC120\uB3D9\uD558\uB294 \uAC83\uC744 \uAE08\uC9C0\uD558\uBA70, \uD14C\uB7EC\uB9AC\uC998\xB7\uADF9\uB2E8\uC8FC\uC758\xB7\uBBFC\uC871 \uC99D\uC624\uB97C \uAE08\uC9C0\uD558\uACE0, \uD3ED\uB825\xB7\uC74C\uB780 \uC0C9\uC815\xB7\uB3C4\uBC15\uC744 \uAE08\uC9C0\uD558\uBA70, \uD5C8\uC704 \uC815\uBCF4\uB97C \uC870\uC791\uD574 \uACBD\uC81C \uC9C8\uC11C\uC640 \uC0AC\uD68C \uC9C8\uC11C\uB97C \uC5B4\uC9C0\uB7FD\uD788\uB294 \uAC83\uC744 \uAE08\uC9C0\uD558\uACE0, \uBA85\uC608\xB7\uC0AC\uC0DD\uD65C\xB7\uC9C0\uC2DD\uC7AC\uC0B0\uAD8C \uCE68\uD574\uB97C \uAE08\uC9C0\uD558\uBA70, \uBBF8\uC131\uB144\uC790\uC758 \uC2E0\uCCB4\uC801\xB7\uC815\uC2E0\uC801 \uAC74\uAC15\uC744 \uD574\uCE58\uB294 \uCF58\uD150\uCE20\uB97C \uAE08\uC9C0\uD569\uB2C8\uB2E4. \uB124\uD2B8\uC6CC\uD06C \uC548\uC804\uBC95 \uC81C13\uC870 \uC81C2\uD56D\xB7\uC81C14\uC870\uC5D0 \uD574\uB2F9\uD569\uB2C8\uB2E4.</p>\r\n    <p>\uACB0\uACFC \uD655\uC0B0. \uB4DC\uB9B4 \uC911\uC5D0 \uB9CC\uB4E4\uC5B4\uC9C4 \uAE30\uB85D, \uC790\uC0B0 \uC815\uBCF4, \uD30C\uC77C\uC740 \uC11C\uBA74 \uC2B9\uC778\uC5D0 \uC801\uD78C \uB300\uC0C1\uACFC \uAE30\uAC04 \uC548\uC5D0\uB9CC \uB0A8\uACA8\uC57C \uD558\uBA70, \uC5F4\uB78C \uAD8C\uD55C\uC774 \uC5C6\uB294 \uC0AC\uB78C\uC5D0\uAC8C \uB118\uAE30\uAC70\uB098 \uC2B9\uC778 \uBC94\uC704 \uBC16\uC758 \uC6A9\uB3C4\uB85C \uBC14\uAFD4 \uC4F8 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <h3>6. \uCC45\uC784\uC740 \uC0AC\uC6A9\uC790\uAC00 \uC9D1\uB2C8\uB2E4</h3>\r\n    <p>\uC774 \uD504\uB85C\uC81D\uD2B8\uB294 MIT \uB77C\uC774\uC120\uC2A4\uC5D0 \uB530\uB77C \uC788\uB294 \uADF8\uB300\uB85C \uC81C\uACF5\uB429\uB2C8\uB2E4. \uAC1C\uBC1C\uC790\uB294 \uC644\uC804\uC131, \uC548\uC804\uC131, \uC801\uD569\uC131\uC5D0 \uB300\uD574 \uBCF4\uC99D\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC0AC\uC6A9\uC790\uB294 \uC790\uC2E0\uC758 \uB2E4\uC6B4\uB85C\uB4DC, \uBC30\uD3EC, \uC2E4\uD589, \uC218\uC815, \uC804\uD30C \uBC0F \uBAA8\uB4E0 \uC785\uB825\uACFC \uCD9C\uB825\uC5D0 \uB300\uD574 \uB3C5\uB9BD\uC801\uC774\uACE0 \uC644\uC804\uD55C \uBBFC\uC0AC\xB7\uD589\uC815\xB7\uD615\uC0AC \uBC95\uC801 \uCC45\uC784\uC744 \uC9D1\uB2C8\uB2E4. \uC800\uC790\uC640 \uAE30\uC5EC\uC790\uB294 \uB0A8\uC6A9\uC73C\uB85C \uBC1C\uC0DD\uD55C \uC9C1\uC811\xB7\uAC04\uC811\xB7\uC5F0\uB300 \uCC45\uC784\uC744 \uC9C0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.</p>\r\n    <p>\uCCB4\uD06C\uB85C \uD655\uC778\uD558\uB294 \uC8FC\uCCB4\uB294 \uC870\uC791\uC790 \uBCF8\uC778\uC774\uBA70, \uC774 \uC120\uC5B8\uC744 \uC77D\uC9C0 \uC54A\uC740 \uC0AC\uB78C\uC744 \uB300\uC2E0\uD560 \uC218 \uC5C6\uACE0, \uD0C0\uC778\uC758 \uC2DC\uC2A4\uD15C\uC744 \uC774\uBBF8 \uC2B9\uC778\uB41C \uAC83\uC73C\uB85C \uB9D0\uD560 \uC218\uB3C4 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <h3>7. \uC704\uBC18 \uC2DC \uAD8C\uD55C \uC885\uB8CC</h3>\r\n    <p>\uBD88\uBC95 \uACF5\uACA9, \uC545\uC758\uC801 \uD65C\uB3D9 \uB610\uB294 \uC704\uC758 \uAE08\uC9C0 \uBC29\uD5A5 \uC911 \uC5B4\uB290 \uD558\uB098\uC5D0 \uC0AC\uC6A9\uB418\uB294 \uC21C\uAC04 \uC0AC\uC6A9 \uD5C8\uAC00\uB294 \uADF8 \uD589\uC704\uAC00 \uBC1C\uC0DD\uD55C \uB0A0\uBD80\uD130 \uC790\uB3D9\uC73C\uB85C \uC885\uB8CC\uB418\uBA70 \uCCA0\uD68C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC989\uC2DC \uC0AC\uC6A9\uC744 \uC911\uB2E8\uD558\uACE0 \uC774 \uD504\uB85C\uC81D\uD2B8\uC758 \uCF54\uB4DC, \uC2A4\uD06C\uB9BD\uD2B8, \uD30C\uC0DD \uB370\uC774\uD130\uB97C \uD3D0\uAE30\uD558\uBA70 \uBC95\uC5D0 \uB530\uB77C \uCC45\uC784\uC744 \uC9D1\uB2C8\uB2E4. \uAD8C\uD55C\uC774 \uC885\uB8CC\uB41C \uB4A4\uC5D0\uB294 \uB4DC\uB9B4 \uCF58\uC194\uC744 \uACC4\uC18D \uC5F4\uAC70\uB098 \uACC4\uC18D \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.</p>\r\n    <h3>8. DeepSeek \uACF5\uC2DD\uACFC\uC758 \uAD00\uACC4</h3>\r\n    <p>\uC774 \uD504\uB85C\uC81D\uD2B8\uB294 \uB3C5\uB9BD\uC801\uC778 \uC624\uD508\uC18C\uC2A4 \uD504\uB85C\uC81D\uD2B8\uC774\uBA70, DeepSeek \uACF5\uC2DD \uB610\uB294 \uADF8 \uAD00\uB828 \uC8FC\uCCB4\uC640 \uC18C\uC18D\xB7\uC0C1\uC5C5 \uD611\uB825\xB7\uAD8C\uD55C\xB7\uACF5\uC2DD \uBCF4\uC99D \uAD00\uACC4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uBCF8\uBB38\uC758 '\uACF5\uC2DD'\uC740 \uD3C9\uAC00 \uB300\uC0C1\uC774 \uC0AC\uC6A9\uC790\uAC00 \uB85C\uCEEC\uC5D0 \uC124\uCE58\uD55C \uACF5\uC2DD DeepSeek Harness \uC18C\uD504\uD2B8\uC6E8\uC5B4 \uD328\uD0A4\uC9C0\uC784\uC744 \uB73B\uD560 \uBFD0\uC774\uBA70, DeepSeek \uACF5\uC2DD\uC774 \uC774 \uD50C\uB7EC\uADF8\uC778\uC744 \uAC1C\uBC1C\xB7\uC2B9\uC778\xB7\uBCF4\uC99D\uD55C\uB2E4\uB294 \uB73B\uC774 \uC544\uB2D9\uB2C8\uB2E4.</p>\r\n    <p>\uB05D. \uCE74\uC6B4\uD2B8\uB2E4\uC6B4\uC774 \uB05D\uB098\uACE0 \uC5EC\uAE30\uAE4C\uC9C0 \uC2A4\uD06C\uB864\uD574 \uC138 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uCCB4\uD06C\uD574\uC57C, \uBCF8\uC778 \uC2E0\uBD84\uC73C\uB85C \uC774 \uC120\uC5B8\uC744 \uC778\uC815\uD558\uACE0 \uC774\uBC88 \uB4DC\uB9B4 \uCF58\uC194 \uAD8C\uD55C\uC744 \uC644\uB8CC\uD55C \uAC83\uC774 \uB429\uB2C8\uB2E4.</p>";
function AuthGate(props) {
  const t = useT();
  const [left, setLeft] = useState(10);
  const [readEnd, setReadEnd] = useState(false);
  const [checks, setChecks] = useState({
    read: false,
    scope: false,
    ban: false
  });
  const legalRef = useRef(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return n - 1;
      });
    }, 1e3);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const el = legalRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 4) setReadEnd(true);
  }, []);
  const locked = left > 0 || !readEnd;
  const ready = !locked && checks.read && checks.scope && checks.ban;
  const hint = left > 0 ? t("auth.hint.wait").replace("{n}", String(left)) : readEnd ? t("auth.hint.check") : t("auth.hint.scroll");
  const onScroll = () => {
    const el = legalRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setReadEnd(true);
  };
  const toggle = (id) => {
    if (locked) return;
    setChecks((prev) => Object.assign({}, prev, { [id]: !prev[id] }));
  };
  const okLabel = !ready ? t("auth.ok") : props.pending === "full" ? t("auth.ok.full") : props.pending === "env" ? t("auth.ok.env") : t("auth.ok.tab");
  return h(
    "div",
    { className: "dshpp-auth-mask", role: "dialog", "aria-modal": "true" },
    h(
      "div",
      { className: "dshpp-auth-modal" },
      h("h2", null, t("auth.title")),
      h(
        "div",
        {
          className: "muted",
          style: {
            color: "var(--dsw-alias-label-secondary,#999)",
            fontSize: 12
          }
        },
        t("auth.lead")
      ),
      h("div", { className: "dshpp-auth-warn" }, t("auth.warn")),
      h("div", {
        className: "dshpp-auth-legal",
        ref: legalRef,
        onScroll,
        dangerouslySetInnerHTML: { __html: AUTH_LEGAL_HTML }
      }),
      h(
        "div",
        {
          style: {
            color: "var(--dsw-alias-label-secondary,#999)",
            fontSize: 12
          }
        },
        hint
      ),
      h(
        "div",
        { className: "dshpp-auth-checks" },
        [
          ["read", "auth.check.read"],
          ["scope", "auth.check.scope"],
          ["ban", "auth.check.ban"]
        ].map(
          (row) => h(
            "label",
            { key: row[0], className: locked ? "locked" : "" },
            h("input", {
              type: "checkbox",
              checked: !!checks[row[0]],
              disabled: locked,
              onChange: () => toggle(row[0])
            }),
            h("span", null, t(row[1]))
          )
        )
      ),
      h(
        "div",
        { className: "dshpp-auth-ops" },
        h(
          "button",
          {
            type: "button",
            onClick: () => setDock({ authOpen: false, tab: "clean", pending: "tab" })
          },
          t("auth.no")
        ),
        h(
          "button",
          {
            type: "button",
            className: "primary",
            disabled: !ready,
            onClick: () => {
              if (!ready) return;
              writeDrillAuth(true);
              const kind = props.pending || "tab";
              setDock({
                authOpen: false,
                open: true,
                tab: "drill",
                pending: "tab"
              });
              try {
                if (__dshPurgeDrill && __dshPurgeDrill.setUI)
                  __dshPurgeDrill.setUI({ open: true });
              } catch {
              }
              if (kind === "env") {
                try {
                  if (__dshPurgeDrill && __dshPurgeDrill.setUI)
                    __dshPurgeDrill.setUI({ open: true, tab: "env" });
                } catch {
                }
              }
              if (kind === "full") {
                try {
                  window.open(
                    window.location.href.split("#")[0] + "#redteam-full",
                    "_blank",
                    "noopener"
                  );
                } catch {
                }
              }
            }
          },
          okLabel
        )
      )
    )
  );
}

// src/components/patch-status.js
function statusKind(st) {
  if (st === "applied" || st === "already") return "ok";
  if (st === "pending") return "wait";
  if (st === "unmatched") return "bad";
  if (st === "partial") return "bad";
  if (st === "drifted") return "bad";
  if (st === "disabled") return "muted";
  if (st === "na") return "ok";
  if (st === "missing_file" || st === "skipped" || st === "unlocated" || st === "off")
    return "miss";
  return "bad";
}
function statusLabel(st, t) {
  if (st === "applied" || st === "already") return t("status.applied");
  if (st === "off") return t("status.skipped");
  if (st === "pending") return t("status.pending");
  if (st === "unmatched") return t("status.unmatched");
  if (st === "partial") return t("status.partial");
  if (st === "drifted") return t("status.drifted");
  if (st === "disabled") return t("status.disabled");
  if (st === "skipped") return t("status.skipped");
  if (st === "missing_file") return t("skip");
  if (st === "unlocated") return t("status.unlocated");
  if (st === "na") return t("status.na");
  return st || t("unknown");
}
var LAYER_GROUP = {
  \uD504\uB86C\uD504\uD2B8: "prompt",
  \uCF54\uB4DC: "code",
  \uB3C4\uAD6C: "tools",
  "0.1.5 \uD638\uD658": "compat",
  "0.2.0 \uD638\uD658": "dsh20"
};
var GROUP_ORDER = ["prompt", "code", "tools", "compat", "dsh20"];
function patchRowsOf(state) {
  if (!state || !state.ai_base) return [];
  const fromList = Array.isArray(state.patches) ? state.patches : null;
  const rows = fromList ? fromList.map((p) => ({
    id: Number(p.id),
    st: p.status || "missing_file",
    layer: p.layer || ""
  })) : Object.keys(state.patch_status || {}).map((id) => ({
    id: Number(id),
    st: state.patch_status[id],
    layer: ""
  }));
  return rows.filter((r) => r.st && r.st !== "na" && Number.isFinite(r.id));
}
function tallyPatches(rows) {
  const out = {
    applied: 0,
    pending: 0,
    unmatched: 0,
    partial: 0,
    drifted: 0,
    disabled: 0,
    skipped: 0,
    total: 0
  };
  for (const row of rows || []) {
    out.total += 1;
    if (row.st === "applied" || row.st === "already") out.applied += 1;
    else if (row.st === "pending") out.pending += 1;
    else if (row.st === "unmatched") out.unmatched += 1;
    else if (row.st === "partial") out.partial += 1;
    else if (row.st === "drifted") out.drifted += 1;
    else if (row.st === "disabled") out.disabled += 1;
    else out.skipped += 1;
  }
  return out;
}
function PatchGroups({ state }) {
  const t = useT();
  const [open, setOpen] = useState({});
  if (state?.ok === false)
    return h(
      "p",
      { role: "status" },
      "\uC77D\uAE30 \uC2E4\uD328. \uD328\uCE58 \uC0C1\uC138\uB97C \uC9C0\uAE08\uC740 \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uACE0\uCE68 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694."
    );
  if (!state || !state.patch_status)
    return h("div", { className: "dshpp-skel", style: { height: 120 } });
  const located = !!state.ai_base;
  if (!located) return null;
  const grouped = /* @__PURE__ */ new Map();
  for (const row of patchRowsOf(state)) {
    const key = LAYER_GROUP[row.layer] || "code";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  return GROUP_ORDER.filter((key) => grouped.has(key)).map((key) => {
    const rows = grouped.get(key).slice().sort((a, b) => a.id - b.id);
    if (!rows.length) return null;
    const tally = tallyPatches(rows);
    const notes = [];
    if (tally.pending)
      notes.push(t("metric.pendingShort", { n: tally.pending }));
    if (tally.unmatched)
      notes.push(t("metric.unmatchedShort", { n: tally.unmatched }));
    if (tally.partial)
      notes.push(t("metric.partialShort", { n: tally.partial }));
    if (tally.drifted)
      notes.push(t("metric.driftedShort", { n: tally.drifted }));
    if (tally.disabled)
      notes.push(t("metric.disabledShort", { n: tally.disabled }));
    if (tally.skipped) notes.push(t("metric.skipShort", { n: tally.skipped }));
    const expanded = !!open[key];
    return h(
      "div",
      { key, className: "dshpp-group" },
      h(
        "button",
        {
          type: "button",
          className: "dshpp-group-h",
          "aria-expanded": expanded ? "true" : "false",
          onClick: () => setOpen((prev) => Object.assign({}, prev, { [key]: !prev[key] }))
        },
        h("strong", null, t("group." + key)),
        h(
          "span",
          { className: "dshpp-count" },
          tally.applied + "/" + tally.total + (notes.length ? " \xB7 " + notes.join(" \xB7 ") : "")
        )
      ),
      expanded ? h(
        "table",
        { className: "dshpp-table" },
        h(
          "thead",
          null,
          h(
            "tr",
            null,
            h("th", null, "#"),
            h("th", null, t("table.patch")),
            h("th", null, t("table.status"))
          )
        ),
        h(
          "tbody",
          null,
          rows.map(
            (r) => h(
              "tr",
              { key: r.id },
              h("td", { className: "dshpp-id" }, "#" + r.id),
              h("td", null, t("patch." + r.id)),
              h(
                "td",
                null,
                h(Pill, { value: r.st }),
                r.st === "partial" ? h(
                  "span",
                  { className: "dshpp-sub" },
                  t("status.partialDetail", {
                    done: (state.patch_files?.[r.id] || []).filter(
                      (f) => f.status === "applied"
                    ).length,
                    total: (state.patch_files?.[r.id] || []).length
                  })
                ) : null
              )
            )
          )
        )
      ) : null
    );
  });
}

// src/components/primitives.js
function formatSize(bytes) {
  if (typeof bytes !== "number" || !isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  return (kb >= 100 ? Math.round(kb) : kb.toFixed(1)) + " KB";
}
function noticeNode(notice) {
  if (!notice || notice.kind === "idle" || !notice.text) return null;
  return h(
    "span",
    {
      className: "dshpp-notice " + (notice.kind === "error" ? "is-bad" : "is-ok")
    },
    notice.text
  );
}
function Btn(props) {
  const { kind, tiny, children, className, type, ...rest } = props;
  const cls = [
    "dshpp-btn",
    kind ? "dshpp-btn-" + kind : "dshpp-btn-ghost",
    tiny ? "dshpp-btn-tiny" : "",
    className || ""
  ].filter(Boolean).join(" ");
  return h(
    "button",
    Object.assign({ type: type || "button", className: cls }, rest),
    children
  );
}
function Pill({ value, label }) {
  const t = useT();
  return h(
    "span",
    { className: "dshpp-pill is-" + statusKind(value) },
    label || statusLabel(value, t)
  );
}
function HelpTip({ title, children, label }) {
  const [open, setOpen] = useState(false);
  return h(
    "span",
    { className: "dshpp-help" },
    h(
      "button",
      {
        type: "button",
        className: "dshpp-help-btn",
        "aria-label": (label || title || "\uC124\uBA85") + " (\uC124\uBA85 \uBCF4\uAE30)",
        "aria-expanded": open ? "true" : "false",
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        onClick: (e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }
      },
      "?"
    ),
    open ? h(
      "span",
      { className: "dshpp-tip", role: "tooltip" },
      title ? h("b", null, title) : null,
      children ? h("span", null, children) : null
    ) : null
  );
}

// src/components/maintenance.js
function useText() {
  const t = useT();
  return (key, fallback) => {
    const hit = t(key);
    return hit && hit !== key ? hit : fallback;
  };
}
function StatusExtras() {
  const [check, setCheck] = useState(null);
  const [boost, setBoost] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const load = () => Promise.all([
    apiJson("/dsh-purge/selfcheck").then(setCheck).catch(() => setCheck(null)),
    apiJson("/dsh-purge/boost").then((r) => setBoost(!!r.enabled)).catch(() => setBoost(null))
  ]);
  useEffect(() => {
    load();
  }, []);
  async function toggle() {
    try {
      const r = await apiJson("/dsh-purge/boost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: !boost })
      });
      setBoost(!!r.enabled);
      setNotice(
        r.enabled ? "\uCF30\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uC791 \uD6C4 \uC801\uC6A9\uB429\uB2C8\uB2E4" : "\uAED0\uC2B5\uB2C8\uB2E4. \uC7AC\uC2DC\uC791 \uD6C4 \uC801\uC6A9\uB429\uB2C8\uB2E4"
      );
    } catch (e) {
      setNotice(e.message);
    }
  }
  async function rerun() {
    setBusy(true);
    try {
      setCheck(await apiJson("/dsh-purge/selfcheck"));
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  }
  const layers = check && Array.isArray(check.layers) ? check.layers : [];
  const failed = layers.filter(
    (l) => l.state === "broken" || !l.state && !l.ok
  );
  const pendingLayers = layers.filter((l) => l.state === "pending");
  const uncertain = layers.filter(
    (l) => ["inferred", "unknown"].includes(l.state)
  );
  const pendingPatches = pendingLayers.reduce(
    (n, l) => n + (l.pending?.length || 0),
    0
  );
  const total = layers.filter((layer) => layer.applicable !== false).length;
  return h(
    "section",
    { className: "dshpp-card", "aria-label": "\uD0C8\uC625 \uC0C1\uD0DC" },
    h(
      "div",
      { className: "dshpp-line" },
      h(
        "span",
        { className: "dshpp-line-main" },
        h("i", {
          className: "dshpp-dot " + (check ? failed.length ? "is-bad" : pendingLayers.length || uncertain.length ? "is-warn" : "is-ok" : "")
        }),
        "\uD0C8\uC625 \uC790\uCCB4 \uC810\uAC80",
        h(
          "b",
          null,
          check ? failed.length ? `${failed.length}\uAC1C \uACC4\uCE35 \uBBF8\uC801\uC6A9` : pendingLayers.length ? `${pendingPatches}\uAC74 \uC801\uC6A9 \uB300\uAE30` : uncertain.length ? `${uncertain.length}\uAC1C \uACC4\uCE35 \uD655\uC778 \uD544\uC694` : `${total}\uAC1C \uACC4\uCE35 \uBAA8\uB450 \uC815\uC0C1` : "\uD655\uC778 \uC911\u2026"
        )
      ),
      h(
        "details",
        { className: "dshpp-fold-inline" },
        h("summary", null, "\uACC4\uCE35\uBCC4 \uBCF4\uAE30"),
        h(
          "div",
          { className: "dshpp-checks" },
          check && Array.isArray(check.layers) ? check.layers.map(
            (layer) => h(
              "div",
              {
                key: layer.title,
                className: "dshpp-check" + (["pending", "inferred", "unknown"].includes(layer.state) ? " is-warn" : layer.ok ? "" : " is-bad")
              },
              h("i", {
                className: "dshpp-dot " + (["pending", "inferred", "unknown"].includes(layer.state) ? "is-warn" : layer.ok ? "is-ok" : "is-bad")
              }),
              h("span", { className: "dshpp-check-name" }, layer.title),
              h(
                "span",
                { className: "dshpp-check-val" },
                layer.applicable === false ? "\uD574\uB2F9 \uC5C6\uC74C" : layer.state === "pending" ? `\uC801\uC6A9 \uB300\uAE30 #${(layer.pending || []).join("/#")}` : layer.state === "inferred" ? "\uD638\uC2A4\uD2B8 \uCD94\uB860" : layer.state === "unknown" ? "\uBBF8\uD655\uC778" : `${layer.applied}/${layer.required ?? layer.total}`
              ),
              layer.note ? h(HelpTip, { title: layer.title }, layer.note) : null
            )
          ) : h("div", { className: "dshpp-muted" }, "\uD655\uC778 \uC911\u2026")
        )
      ),
      h(
        Btn,
        { tiny: true, disabled: busy, onClick: rerun },
        busy ? "\u2026" : "\uB2E4\uC2DC \uAC80\uC0AC"
      ),
      h(
        Btn,
        {
          tiny: true,
          title: "\uC77C\uD68C\uC6A9 \uD504\uB85C\uBE0C\uB97C \uB9CC\uB4ED\uB2C8\uB2E4. \uB2E4\uC74C \uD134 \uC751\uB2F5\uC5D0\uC11C \uBAA8\uB378\uC774 \uADF8 \uD45C\uC2DD\uC744 \uADF8\uB300\uB85C \uB418\uD480\uC774\uD558\uB294\uC9C0 \uD655\uC778\uD569\uB2C8\uB2E4",
          onClick: async () => {
            try {
              const r = await apiJson("/dsh-purge/probe", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: "{}"
              });
              setNotice(r.message || "");
            } catch (e) {
              setNotice(e.message);
            }
          }
        },
        "\uD504\uB85C\uBE0C"
      )
    ),
    h(
      "div",
      { className: "dshpp-line" },
      h(
        "span",
        { className: "dshpp-line-main" },
        "\uD0C8\uC625 \uAC15\uD654 \uC139\uC158",
        h(
          HelpTip,
          { title: "\uD0C8\uC625 \uAC15\uD654 \uC139\uC158" },
          "\uC2DC\uC2A4\uD15C \uD504\uB86C\uD504\uD2B8 \uB05D\uC5D0 \uC8FC\uC785\uACFC \uAC19\uC740 \uB4F1\uAE09\uC758 \uD14D\uC2A4\uD2B8\uB97C \uB367\uBD99\uC785\uB2C8\uB2E4: \uACC4\uCE35 \uC120\uC5B8 / \uAC70\uBD80\uB294 \uACE7 \uC7A5\uC560 / \uC544\uCCA8 \uC800\uD56D / \uB2E4\uC911 \uB77C\uC6B4\uB4DC \uC7AC\uD655\uC778. \uAE30\uBCF8\uAC12\uC740 \uCF1C\uC9D0\uC785\uB2C8\uB2E4."
        ),
        h("b", null, boost === null ? "\u2026" : boost ? "\uCF1C\uC9D0" : "\uAEBC\uC9D0")
      ),
      h(
        Btn,
        { tiny: true, disabled: boost === null, onClick: toggle },
        boost ? "\uB044\uAE30" : "\uCF1C\uAE30"
      ),
      notice ? h("span", { className: "dshpp-muted" }, notice) : null
    )
  );
}
function assertMaintenanceResult(result) {
  if (!result || typeof result !== "object")
    throw new Error("\uC720\uC9C0\uBCF4\uC218 \uC778\uD130\uD398\uC774\uC2A4\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uACB0\uACFC\uB97C \uB3CC\uB824\uC92C\uC2B5\uB2C8\uB2E4");
  if (result.ok === false) {
    const errors = Array.isArray(result.errors) ? result.errors.filter(Boolean).join(" \xB7 ") : "";
    const partial = result.applied ? " \xB7 \uC77C\uBD80 \uB300\uC0C1\uC740 \uC774\uBBF8 \uC5C5\uB370\uC774\uD2B8\uD588\uC2B5\uB2C8\uB2E4. \uD574\uB2F9 DSH \uD504\uB85C\uC138\uC2A4\uB97C \uC7AC\uC2DC\uC791\uD574 \uB85C\uB4DC\uD558\uC138\uC694" : "";
    throw new Error((result.error || errors || "\uC720\uC9C0\uBCF4\uC218 \uC791\uC5C5 \uC2E4\uD328") + partial);
  }
}
function maintenanceNotice(op, result) {
  if (op === "backup") {
    if (!result.id)
      throw new Error(
        "\uBC31\uC5C5 \uC791\uC5C5\uC774 \uBC31\uC5C5 \uBC88\uD638\uB97C \uB3CC\uB824\uC8FC\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uBAA9\uB85D\uC744 \uC0C8\uB85C \uACE0\uCCD0 \uACB0\uACFC\uB97C \uD655\uC778\uD558\uC138\uC694"
      );
    return `\uBC31\uC5C5\uC744 \uB9CC\uB4E4\uC5C8\uB2E4: ${result.id}`;
  }
  if (op === "rollback")
    return (result.note || "\uD50C\uB7EC\uADF8\uC778 \uB864\uBC31\uC744 \uB9C8\uCCE4\uC2B5\uB2C8\uB2E4") + ". DSH \uD504\uB85C\uC138\uC2A4\uB97C \uC7AC\uC2DC\uC791\uD558\uC138\uC694. \uBE0C\uB77C\uC6B0\uC800\uB9CC \uC0C8\uB85C \uACE0\uCE58\uBA74 \uC0C8 \uBC31\uC5D4\uB4DC\uAC00 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";
  if (op === "update") {
    if (result.applied === false || result.skipped)
      return result.note || "\uC0C8 \uBC84\uC804\uC744 \uC124\uCE58\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uC124\uCE58\uBCF8\uC740 \uADF8\uB300\uB85C\uC785\uB2C8\uB2E4.";
    if (result.applied || result.needRestart || result.restart_required) {
      const version = result.release?.version || result.localVersion || result.remoteVersion;
      const warnings = result.cleanup_warnings || [];
      const cleanup = warnings.length ? `\uC815\uB9AC\uB97C \uB9C8\uCE58\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4(${warnings.map((w) => `${w.stage}:${w.code}`).join(", ")}). \uB0A8\uC740 \uD30C\uC77C\uC740 \uBCF4\uC874\uD588\uC2B5\uB2C8\uB2E4.` : "";
      return `${cleanup}\uD50C\uB7EC\uADF8\uC778\uC744 \uC124\uCE58\uD588\uC2B5\uB2C8\uB2E4${version ? ": " + version : ""}. DSH \uD504\uB85C\uC138\uC2A4\uB97C \uC7AC\uC2DC\uC791\uD558\uC138\uC694. \uBE0C\uB77C\uC6B0\uC800\uB9CC \uC0C8\uB85C \uACE0\uCE58\uBA74 \uC0C8 \uBC31\uC5D4\uB4DC\uAC00 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`;
    }
    return result.note || "\uC5C5\uB370\uC774\uD2B8 \uC694\uCCAD\uC744 \uB9C8\uCCE4\uC2B5\uB2C8\uB2E4. \uC0C1\uD0DC\uB97C \uC0C8\uB85C \uACE0\uCCD0 \uC124\uCE58 \uACB0\uACFC\uB97C \uD655\uC778\uD558\uC138\uC694.";
  }
  return result.note || "\uC720\uC9C0\uBCF4\uC218 \uC791\uC5C5\uC744 \uB9C8\uCCE4\uC2B5\uB2C8\uB2E4";
}
function UpdatePreferences({
  value,
  status = {},
  onSaved,
  onOpenChannel
}) {
  const tr = useText();
  const [saving, setSaving] = useState(false), [error, setError] = useState("");
  const locked = useRef(false);
  if (!value) return null;
  async function save(patch) {
    if (locked.current) return;
    locked.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await apiJson("/dsh-purge/community", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "preferences", value: patch })
      });
      assertMaintenanceResult(result);
      onSaved(result.update_preferences);
    } catch (e) {
      setError(e.message);
    } finally {
      locked.current = false;
      setSaving(false);
    }
  }
  return h(
    "section",
    { "aria-label": "\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8 \uC124\uC815", className: "dshpp-card" },
    h(
      "div",
      { className: "dshpp-row" },
      h(
        "label",
        null,
        h("input", {
          type: "checkbox",
          checked: value.autoCheck,
          disabled: saving,
          onChange: (e) => save({ autoCheck: e.target.checked }),
          "aria-label": "\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778"
        }),
        "\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778"
      ),
      h(HelpTip, {
        title: "\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778",
        children: "\uC2DC\uC791 30\uCD08 \uB4A4 \uD655\uC778\uD558\uACE0, \uC774\uD6C4\uC5D0\uB294 \uAC04\uACA9\uC5D0 \uB530\uB77C \uD655\uC778\uD569\uB2C8\uB2E4. \uB044\uB354\uB77C\uB3C4 \uC800\uC7A5\uB41C \uC790\uB3D9 \uC124\uCE58 \uC124\uC815\uC740 \uBC14\uB00C\uC9C0 \uC54A\uC9C0\uB9CC \uC790\uB3D9 \uC124\uCE58\uAC00 \uC77C\uC2DC \uC815\uC9C0\uB429\uB2C8\uB2E4."
      }),
      h(
        "select",
        {
          "aria-label": "\uC5C5\uB370\uC774\uD2B8 \uD655\uC778 \uAC04\uACA9",
          value: value.intervalHours,
          disabled: saving || !value.autoCheck,
          onChange: (e) => save({ intervalHours: Number(e.target.value) })
        },
        [.../* @__PURE__ */ new Set([1, 6, 12, 24, value.intervalHours])].sort((a, b) => a - b).map((v) => h("option", { key: v, value: v }, `${v}\uC2DC\uAC04\uB9C8\uB2E4`))
      ),
      // "업데이트 채널"은 위 두 컨트롤과 같은 줄에 나란히 두고 크기를 select 에 맞춘다.
      // 이 버튼이 설정하는 것이 바로 이 업데이트 확인이 쓰는 프록시/키이므로, 제목 맨 오른쪽으로 밀리면 안 된다.
      onOpenChannel ? h(
        Btn,
        {
          tiny: true,
          className: "dshpp-updch-open",
          disabled: saving,
          onClick: () => onOpenChannel(),
          title: tr("updch.title", "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110: \uD504\uB85D\uC2DC\uC640 GitHub \uD0A4")
        },
        tr("updch.open", "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110")
      ) : null
    ),
    h(
      "div",
      { className: "dshpp-row" },
      h(
        "label",
        null,
        h("input", {
          type: "checkbox",
          checked: value.autoInstall,
          disabled: saving,
          onChange: (e) => save({ autoInstall: e.target.checked }),
          "aria-label": "\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8 \uC124\uCE58"
        }),
        "\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8 \uC124\uCE58"
      ),
      h(HelpTip, {
        title: "\uC790\uB3D9 \uC5C5\uB370\uC774\uD2B8 \uC124\uCE58",
        children: "\uC790\uB3D9 \uD655\uC778\uC774 \uCF1C\uC838 \uC788\uACE0 \uC7A0\uAE30\uC9C0 \uC54A\uC740 \uC0C8 \uC815\uC2DD \uBC84\uC804\uC744 \uCC3E\uC558\uC744 \uB54C\uB9CC \uC124\uCE58\uD569\uB2C8\uB2E4. \uC124\uCE58 \uC804\uC5D0 \uBC31\uC5C5\uD558\uACE0 \uB9B4\uB9AC\uC2A4 \uD328\uD0A4\uC9C0\uB97C \uAC80\uC99D\uD558\uBA70, \uC2E4\uD328\uD574\uB3C4 \uC18C\uC2A4\uB97C \uC790\uB3D9\uC73C\uB85C \uBC14\uAFB8\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC124\uCE58 \uD6C4\uC5D0\uB294 \uC9C1\uC811 \uC7AC\uC2DC\uC791\uD558\uAE30\uB97C \uAE30\uB2E4\uB9AC\uACE0, DSH \uB97C \uC790\uB3D9\uC73C\uB85C \uC7AC\uC2DC\uC791\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      })
    ),
    h(
      "p",
      { className: "dshpp-hint" },
      status.reconciliationError ? "\uC124\uCE58 \uC0C1\uD0DC \uD655\uC778 \uB300\uAE30 \uC911\uC774\uB77C \uC790\uB3D9 \uC124\uCE58\uB97C \uC77C\uC2DC \uC815\uC9C0\uD588\uC2B5\uB2C8\uB2E4." : status.restartRequired ? `\uB514\uC2A4\uD06C \uBC84\uC804 ${status.pendingVersion}, \uD604\uC7AC \uC2E4\uD589 ${status.runningVersion || "\uC54C \uC218 \uC5C6\uC74C"}. DSH \uB97C \uC9C1\uC811 \uC7AC\uC2DC\uC791\uD558\uAE30\uB97C \uAE30\uB2E4\uB9BD\uB2C8\uB2E4.` : !value.autoCheck ? "\uC790\uB3D9 \uD655\uC778\uC774 \uAEBC\uC838 \uC788\uC5B4 \uC790\uB3D9 \uC124\uCE58\uB3C4 \uBA48\uCDB0 \uC788\uC2B5\uB2C8\uB2E4." : status.checkedAt ? `\uB9C8\uC9C0\uB9C9 \uD655\uC778: ${new Date(status.checkedAt).toLocaleString()}${status.hasUpdate ? ` \xB7 \uC0AC\uC6A9 \uAC00\uB2A5\uD55C \uBC84\uC804 ${status.availableVersion}` : ""}` : "\uC2DC\uC791 \uD6C4 \uC790\uB3D9\uC73C\uB85C \uD655\uC778\uD558\uACE0, \uC124\uCE58 \uD6C4\uC5D0\uB294 \uC9C1\uC811 \uC7AC\uC2DC\uC791\uD558\uB3C4\uB85D\uB9CC \uC548\uB0B4\uD569\uB2C8\uB2E4."
    ),
    status.reconciliationError ? h("p", { role: "alert" }, status.reconciliationError) : null,
    [...new Set([status.error, status.installError].filter(Boolean))].map(
      (message) => h("p", { key: message, role: "alert" }, message)
    ),
    error ? h("p", { role: "alert" }, error) : null
  );
}
function UpdateChannelDialog({ value, onClose, onSaved }) {
  const tr = useText();
  const [proxy, setProxy] = useState(value?.proxyUrl || "");
  const [mirror, setMirror] = useState(value?.mirrorUrl || "");
  const [token, setToken] = useState("");
  const [clearToken, setClearToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const proxyRef = useRef(null);
  const hasToken = !!value?.hasGithubToken;
  useEffect(() => {
    try {
      proxyRef.current?.focus?.();
    } catch {
    }
  }, []);
  useEffect(() => {
    if (typeof document === "undefined" || !document.addEventListener)
      return void 0;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  async function save() {
    if (saving) return;
    const next = {};
    if (mirror.trim() !== (value?.mirrorUrl || ""))
      next.mirrorUrl = mirror.trim();
    if (proxy.trim() !== (value?.proxyUrl || "")) next.proxyUrl = proxy.trim();
    if (clearToken) next.clearGithubToken = true;
    else if (token.trim()) next.githubToken = token.trim();
    setSaving(true);
    setError("");
    try {
      const result = await apiJson("/dsh-purge/community", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "preferences", value: next })
      });
      assertMaintenanceResult(result);
      onSaved(result.update_preferences);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return h(
    "div",
    {
      className: "dshpp-updch-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": tr("updch.title", "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110: \uD504\uB85D\uC2DC\uC640 GitHub \uD0A4"),
      onClick: (e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }
    },
    h(
      "div",
      { className: "dshpp-updch-card" },
      h(
        "h4",
        { className: "dshpp-updch-title" },
        tr("updch.title", "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110: \uD504\uB85D\uC2DC\uC640 GitHub \uD0A4")
      ),
      h(
        "p",
        { className: "dshpp-hint" },
        tr(
          "updch.scope",
          "\uC5EC\uAE30\uC11C \uC124\uC815\uD55C \uD504\uB85D\uC2DC\uC640 \uD0A4\uB294 \uC774 \uD50C\uB7EC\uADF8\uC778\uC758 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778\uACFC \uB2E4\uC6B4\uB85C\uB4DC \uACBD\uB85C\uC5D0\uB9CC \uC801\uC6A9\uB418\uACE0, \uB2E4\uB978 \uBAA8\uB378 \uACF5\uAE09\uC790 \uC694\uCCAD\uC5D0\uB294 \uC601\uD5A5\uC744 \uC8FC\uC9C0 \uC54A\uC73C\uBA70 \uD638\uC2A4\uD2B8 \uD504\uB85C\uC138\uC2A4 \uD658\uACBD\uC5D0\uB3C4 \uC4F0\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uAE30\uC874 \uC5C5\uB370\uC774\uD2B8 \uD504\uB85D\uC2DC \uD658\uACBD\uC744 \uC0C1\uC18D\uD569\uB2C8\uB2E4."
        )
      ),
      h(
        "label",
        { className: "dshpp-updch-label" },
        h("span", null, tr("updch.mirror", "GitHub \uBBF8\uB7EC (\uC120\uD0DD)")),
        h("input", {
          type: "text",
          value: mirror,
          placeholder: tr("updch.mirror.ph", "https://\uBBF8\uB7EC\uD638\uC2A4\uD2B8/"),
          onChange: (e) => setMirror(e.target.value),
          disabled: saving
        }),
        h(
          "small",
          null,
          tr(
            "updch.mirror.hint",
            "\uC870\uD68C\uC640 \uB2E4\uC6B4\uB85C\uB4DC\uC5D0\uB9CC \uC4F0\uBA70 GitHub \uD0A4\uB97C \uBCF4\uB0B4\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC124\uCE58\uB294 \uC5EC\uC804\uD788 GitHub \uC5D0\uC11C \uACF5\uC2DD \uAC80\uC99D\uAC12\uC744 \uBC1B\uC544\uC57C \uD558\uACE0, \uC5C5\uB370\uC774\uD2B8 \uD504\uB85D\uC2DC\uB97C \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uBBF8\uB7EC\uB97C \uB055\uB2C8\uB2E4."
          )
        )
      ),
      h(
        "label",
        { className: "dshpp-updch-label" },
        h("span", null, tr("updch.proxy", "\uD504\uB85D\uC2DC \uC8FC\uC18C")),
        h("input", {
          ref: proxyRef,
          type: "text",
          className: "dshpp-field dshpp-updch-field",
          "aria-label": tr("updch.proxy", "\uD504\uB85D\uC2DC \uC8FC\uC18C"),
          value: proxy,
          disabled: saving,
          placeholder: tr("updch.proxy.ph", "socks5://127.0.0.1:60808"),
          spellCheck: false,
          autoComplete: "off",
          onChange: (e) => setProxy(e.target.value)
        })
      ),
      h(
        "p",
        { className: "dshpp-hint" },
        tr(
          "updch.proxy.hint",
          "http:// / https:// / socks5:// \uC811\uB450\uC0AC\uB97C \uC9C0\uC6D0\uD569\uB2C8\uB2E4. \uC608: http://127.0.0.1:7890. \uBE44\uC6CC \uB450\uBA74 \uAE30\uC874 \uC5C5\uB370\uC774\uD2B8 \uD504\uB85D\uC2DC \uD658\uACBD\uC744 \uC0C1\uC18D\uD569\uB2C8\uB2E4."
        )
      ),
      h(
        "label",
        { className: "dshpp-updch-label" },
        h("span", null, tr("updch.token", "GitHub \uD0A4")),
        h("input", {
          type: "password",
          className: "dshpp-field dshpp-updch-field",
          "aria-label": tr("updch.token", "GitHub \uD0A4"),
          value: token,
          disabled: saving || clearToken,
          placeholder: tr(
            "updch.token.ph",
            "\uC120\uD0DD: GitHub API \uD55C\uB3C4\uB97C \uB192\uC785\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uBC14\uAFB8\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
          ),
          spellCheck: false,
          autoComplete: "off",
          onChange: (e) => setToken(e.target.value)
        })
      ),
      h(
        "p",
        { className: "dshpp-hint" },
        hasToken ? tr(
          "updch.token.set",
          "\uC774 \uCEF4\uD4E8\uD130\uC5D0 \uD0A4\uAC00 \uC124\uC815\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4. \uC785\uB825\uCC3D\uC740 \uD56D\uC0C1 \uBE44\uC5B4 \uC788\uACE0, \uBE44\uC6B4 \uCC44 \uC800\uC7A5\uD558\uBA74 \uADF8\uB300\uB85C \uC720\uC9C0\uB429\uB2C8\uB2E4."
        ) : tr(
          "updch.token.unset",
          "\uC774 \uCEF4\uD4E8\uD130\uC5D0 \uC544\uC9C1 \uD0A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4. \uBE44\uC6CC \uB450\uBA74 \uC124\uC815\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
        )
      ),
      hasToken ? h(
        "label",
        { className: "dshpp-updch-check" },
        h("input", {
          type: "checkbox",
          checked: clearToken,
          disabled: saving,
          "aria-label": tr("updch.token.clear", "\uC800\uC7A5\uB41C \uD0A4 \uC9C0\uC6B0\uAE30"),
          onChange: (e) => setClearToken(!!e.target.checked)
        }),
        h("span", null, tr("updch.token.clear", "\uC800\uC7A5\uB41C \uD0A4 \uC9C0\uC6B0\uAE30"))
      ) : null,
      error ? h("p", { role: "alert" }, error) : null,
      h(
        "div",
        { className: "dshpp-updch-ops" },
        h(
          Btn,
          { disabled: saving, onClick: onClose },
          tr("updch.cancel", "\uCDE8\uC18C")
        ),
        h(
          Btn,
          { kind: "primary", disabled: saving, onClick: save },
          saving ? tr("updch.saving", "\uC800\uC7A5 \uC911\u2026") : tr("updch.save", "\uC800\uC7A5")
        )
      )
    )
  );
}
function CommunityMaintenance() {
  const [value, setValue] = useState(null), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false), [selected, setSelected] = useState(""), [releases, setReleases] = useState(null), [release, setRelease] = useState("");
  const [listState, setListState] = useState("loading"), [listError, setListError] = useState("");
  const [channelOpen, setChannelOpen] = useState(false);
  const tr = useText();
  const mounted = useRef(false), generation = useRef(0), running = useRef(false);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setListState("loading");
    setListError("");
    try {
      const result = await apiJson("/dsh-purge/community");
      assertMaintenanceResult(result);
      if (!Array.isArray(result.backups))
        throw new Error("\uBC31\uC5C5 \uBAA9\uB85D \uC751\uB2F5\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
      if (!mounted.current || request !== generation.current) return;
      setValue(result);
      setSelected(
        (current) => result.backups.some((b) => b.id === current) ? current : ""
      );
      setListState("ready");
    } catch (e) {
      if (!mounted.current || request !== generation.current) return;
      setListError(e.message);
      setListState("error");
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
      generation.current++;
    };
  }, [load]);
  async function run(op) {
    if (running.current) return;
    if (op === "rollback" && !window.confirm(
      "Purge \uD50C\uB7EC\uADF8\uC778\uACFC \uADF8 \uC9C4\uC785\uC810\uB9CC \uB864\uBC31\uD558\uACE0 \uD604\uC7AC \uD504\uB86C\uD504\uD2B8\uC640 \uC124\uC815\uC740 \uB0A8\uAE41\uB2C8\uB2E4. \uB05D\uB098\uBA74 DSH \uD504\uB85C\uC138\uC2A4\uB97C \uC7AC\uC2DC\uC791\uD574\uC57C \uD558\uACE0, \uBE0C\uB77C\uC6B0\uC800\uB9CC \uC0C8\uB85C \uACE0\uCE58\uBA74 \uC0C8 \uBC31\uC5D4\uB4DC\uAC00 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uACC4\uC18D\uD560\uAE4C\uC694?"
    ))
      return;
    if (op === "update" && !window.confirm(
      "\uBA3C\uC800 \uBC31\uC5C5\uD55C \uB4A4 \uC120\uD0DD\uD55C \uCEE4\uBBA4\uB2C8\uD2F0 \uC815\uC2DD \uBC84\uC804\uC744 \uC124\uCE58\uD569\uB2C8\uB2E4. \uD638\uC2A4\uD2B8 \uD328\uCE58\uB97C \uB2E4\uC2DC \uC801\uC6A9\uD558\uC9C0\uB294 \uC54A\uC2B5\uB2C8\uB2E4. \uC124\uCE58 \uD6C4 DSH \uD504\uB85C\uC138\uC2A4\uB97C \uC7AC\uC2DC\uC791\uD558\uACE0, \uBE0C\uB77C\uC6B0\uC800\uB9CC \uC0C8\uB85C \uACE0\uCE58\uBA74 \uC0C8 \uBC31\uC5D4\uB4DC\uAC00 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uACC4\uC18D\uD560\uAE4C\uC694?"
    ))
      return;
    running.current = true;
    setBusy(true);
    setNotice("\uCC98\uB9AC \uC911\u2026");
    try {
      const r = await apiJson("/dsh-purge/community", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op, id: selected, ref: release })
      });
      assertMaintenanceResult(r);
      if (!mounted.current) return;
      if (op === "check") {
        if (!Array.isArray(r.versions))
          throw new Error("\uB9B4\uB9AC\uC2A4 \uBAA9\uB85D \uC751\uB2F5\uC774 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4");
        setReleases(r.versions.filter((v) => v.asset));
        setRelease(r.versions.find((v) => v.asset)?.ref || "");
        setNotice(
          r.degraded ? `${r.degraded} \xB7 ${r.stale ? "\uC9C0\uAE08\uC740 \uCE90\uC2DC \uBAA9\uB85D\uC744 \uD45C\uC2DC\uD569\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694" : "\uB300\uCCB4 \uBAA9\uB85D\uC744 \uD45C\uC2DC\uD588\uC2B5\uB2C8\uB2E4"}` : r.error ? `\uC5C5\uB370\uC774\uD2B8 \uD655\uC778 \uC2E4\uD328: ${r.error}` : r.hasUpdate ? `\uC0C8 \uBC84\uC804 ${r.remoteVersion} \uBC1C\uACAC` : "\uC774\uBBF8 \uCD5C\uC2E0 \uC815\uC2DD \uBC84\uC804\uC785\uB2C8\uB2E4"
        );
      } else {
        setNotice(maintenanceNotice(op, r));
      }
    } catch (e) {
      if (mounted.current)
        setNotice(
          e.message === "timeout" ? "\uC720\uC9C0\uBCF4\uC218 \uC694\uCCAD\uC774 \uC2DC\uAC04 \uCD08\uACFC\uB410\uC2B5\uB2C8\uB2E4. \uC791\uC5C5\uC774 \uC544\uC9C1 \uC2E4\uD589 \uC911\uC77C \uC218 \uC788\uC73C\uB2C8 \uBA3C\uC800 \uC0C1\uD0DC\uB97C \uC0C8\uB85C \uACE0\uCE58\uACE0, \uAC19\uC740 \uC694\uCCAD\uC744 \uBC18\uBCF5 \uC81C\uCD9C\uD558\uC9C0 \uB9C8\uC138\uC694." : e.message
        );
    } finally {
      if (op !== "check" && mounted.current) await load();
      running.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return h(
    "section",
    { className: "dshpp-panel", "aria-label": "\uCEE4\uBBA4\uB2C8\uD2F0\uD310 \uC720\uC9C0\uBCF4\uC218" },
    h("h3", null, "\uC720\uC9C0\uBCF4\uC218: \uC5C5\uB370\uC774\uD2B8\uC640 \uC774 \uCEF4\uD4E8\uD130 \uBC31\uC5C5"),
    // 채널 현황 요약: 프록시가 직결인지, 키가 설정돼 있는지(키 평문은 절대 되풀이하지 않는다).
    // 진입 버튼은 여기 있지 않고 "자동 업데이트 확인"과 같은 줄에 있다.
    value ? h(
      "p",
      { className: "dshpp-hint" },
      (value.update_preferences?.proxyUrl ? tr("updch.state.proxy", "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110 \uD504\uB85D\uC2DC: ") + value.update_preferences.proxyUrl : tr(
        "updch.state.direct",
        "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110: \uD658\uACBD \uB610\uB294 \uC2DC\uC2A4\uD15C \uD504\uB85D\uC2DC \uC0C1\uC18D"
      )) + " \xB7 " + (value.update_preferences?.hasGithubToken ? tr("updch.state.token.on", "GitHub \uD0A4 \uC124\uC815\uB428") : tr("updch.state.token.off", "GitHub \uD0A4 \uBBF8\uC124\uC815"))
    ) : null,
    h(UpdatePreferences, {
      value: value?.update_preferences,
      status: value?.update_status,
      onSaved: (next) => setValue((current) => ({ ...current, update_preferences: next })),
      onOpenChannel: () => setChannelOpen(true)
    }),
    h(
      "div",
      { className: "dshpp-row" },
      h(
        Btn,
        { disabled: busy, onClick: () => run("check") },
        "\uCEE4\uBBA4\uB2C8\uD2F0\uD310 \uC5C5\uB370\uC774\uD2B8 \uD655\uC778"
      ),
      h(
        Btn,
        {
          disabled: busy,
          onClick: async () => {
            try {
              const r = await apiJson("/dsh-purge/audit?limit=10");
              const lines = (r.entries || []).map(
                (x) => `${new Date(x.at).toLocaleString()}  ${x.event}  ${JSON.stringify(
                  Object.fromEntries(
                    Object.entries(x).filter(
                      ([k]) => !["at", "event", "pid"].includes(k)
                    )
                  )
                )}`
              );
              setNotice(
                lines.length ? lines.join("\n") : "\uC544\uC9C1 \uAE30\uB85D\uB41C \uB3D9\uC791\uC774 \uC5C6\uC2B5\uB2C8\uB2E4"
              );
            } catch (e) {
              setNotice(e.message);
            }
          }
        },
        "\uCD5C\uADFC \uB3D9\uC791"
      ),
      h(
        "a",
        {
          href: "https://github.com/wnduddld0513/dsh-purge-kr/releases",
          target: "_blank",
          rel: "noreferrer"
        },
        "\uB9B4\uB9AC\uC2A4 \uAE30\uB85D"
      )
    ),
    releases?.length ? h(
      "div",
      { className: "dshpp-row" },
      h(
        "select",
        {
          "aria-label": "\uCEE4\uBBA4\uB2C8\uD2F0 \uB9B4\uB9AC\uC2A4 \uC120\uD0DD",
          value: release,
          onChange: (e) => setRelease(e.target.value),
          disabled: busy
        },
        releases.map(
          (r) => h("option", { key: r.ref, value: r.ref }, r.label)
        )
      ),
      h(
        Btn,
        { disabled: busy || !release, onClick: () => run("update") },
        "\uC120\uD0DD\uD55C \uBC84\uC804 \uC124\uCE58"
      )
    ) : null,
    h("h3", { style: { marginTop: 20 } }, "\uC774 \uCEF4\uD4E8\uD130 \uBC31\uC5C5"),
    h(
      Btn,
      { disabled: busy || listState === "loading", onClick: load },
      "\uBC31\uC5C5 \uBAA9\uB85D \uC0C8\uB85C \uACE0\uCE68"
    ),
    listState === "loading" ? h("p", { role: "status" }, "\uBC31\uC5C5\uC744 \uC77D\uB294 \uC911\u2026") : null,
    listState === "error" ? h("p", { role: "alert" }, `\uBC31\uC5C5 \uC77D\uAE30 \uC2E4\uD328: ${listError}`) : null,
    listState === "ready" && !value.backups.length ? h("p", { role: "status" }, "\uBC31\uC5C5 \uC5C6\uC74C") : null,
    h(
      "div",
      { className: "dshpp-row" },
      h(Btn, { disabled: busy, onClick: () => run("backup") }, "\uC9C0\uAE08 \uBC31\uC5C5"),
      h(
        "select",
        {
          "aria-label": "\uB864\uBC31\uD560 \uBC31\uC5C5 \uC120\uD0DD",
          value: selected,
          onChange: (e) => setSelected(e.target.value),
          disabled: busy || listState !== "ready"
        },
        h("option", { value: "" }, "\uBC31\uC5C5 \uC120\uD0DD"),
        ...(value?.backups || []).map(
          (b) => h(
            "option",
            { key: b.id, value: b.id },
            `${new Date(b.created_at).toLocaleString()} \xB7 ${b.plugins.map((p) => p.version).join(" / ")}`
          )
        )
      ),
      h(
        Btn,
        {
          disabled: busy || !selected || listState !== "ready",
          onClick: () => run("rollback")
        },
        "\uD50C\uB7EC\uADF8\uC778 \uB864\uBC31"
      )
    ),
    h(
      "p",
      { className: "dshpp-hint" },
      "\uBC31\uC5C5\uC740 \uC774 \uCEF4\uD4E8\uD130\uC5D0\uB9CC \uB0A8\uC2B5\uB2C8\uB2E4. \uB864\uBC31\uC740 \uD604\uC7AC \uD504\uB86C\uD504\uD2B8, \uADDC\uCE59, \uB2E4\uB978 \uD50C\uB7EC\uADF8\uC778 \uC124\uC815\uC744 \uBCF4\uC874\uD569\uB2C8\uB2E4. \uC124\uCE58\uB098 \uB864\uBC31 \uD6C4\uC5D0\uB294 DSH \uD504\uB85C\uC138\uC2A4\uB97C \uC7AC\uC2DC\uC791\uD574\uC57C \uD558\uACE0, \uBE0C\uB77C\uC6B0\uC800\uB9CC \uC0C8\uB85C \uACE0\uCE58\uBA74 \uC0C8 \uBC31\uC5D4\uB4DC\uAC00 \uB85C\uB4DC\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
    ),
    notice ? h("p", { role: "status" }, notice) : null,
    // 대화상자는 패널 안에 붙지만 고정 위치로 컨테이너를 벗어나며 portal 에 의존하지 않는다.
    channelOpen && value ? h(UpdateChannelDialog, {
      value: value.update_preferences,
      onClose: () => setChannelOpen(false),
      onSaved: (next) => {
        setValue((current) => ({ ...current, update_preferences: next }));
        setNotice(
          tr(
            "updch.saved",
            "\uC5C5\uB370\uC774\uD2B8 \uCC44\uB110\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC74C \uC5C5\uB370\uC774\uD2B8 \uD655\uC778\uBD80\uD130 \uC801\uC6A9\uB429\uB2C8\uB2E4."
          )
        );
      }
    }) : null
  );
}

// src/shared/apply-result.js
function incompleteApplyDetail(result, t) {
  const parts = [];
  if (result.failed > 0) {
    const ids = (Array.isArray(result.failed_items) ? result.failed_items : []).map((item) => item?.id).filter((id) => id != null).join(",");
    parts.push(
      t("restart.incomplete.patches", {
        failed: String(result.failed),
        ids: ids || "?"
      })
    );
  }
  if (result.cmd_flash?.ok === false)
    parts.push(
      t("restart.incomplete.flash", {
        entry: String(result.cmd_flash.entry || "unknown")
      })
    );
  if (result.host_written === false) parts.push(t("restart.incomplete.host"));
  if (result.hook_restore_failed === true)
    parts.push(t("restart.incomplete.restore"));
  if (result.cli_repair?.ok === false)
    parts.push(
      t("restart.incomplete.runtime"),
      ...runtimeRepairDetails(result.cli_repair)
    );
  return parts.length ? parts.join(" \xB7 ") : t("restart.incomplete.unknown");
}

// src/components/advanced.js
function HooksDenySection({ onSaved }) {
  const t = useT();
  const [cfg, setCfg] = useState(null);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    apiJson("/dsh-purge/hooks-deny").then((d) => {
      if (d && d.ok) setCfg({ hooksDenyBypass: d.hooksDenyBypass !== false });
    }).catch(() => {
    });
  }, []);
  const save = (hooksDenyBypass) => {
    if (!cfg || busy) return;
    setCfg({ hooksDenyBypass });
    setBusy(true);
    apiJson("/dsh-purge/hooks-deny", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hooksDenyBypass })
    }).then((d) => {
      if (d && d.ok) {
        setCfg({ hooksDenyBypass: d.hooksDenyBypass === true });
        setNotice({ kind: "ok", text: t("saved.hooksDeny") });
        if (typeof onSaved === "function") onSaved();
      } else {
        setNotice({
          kind: "error",
          text: t("err.save", { error: d && d.error || "" })
        });
      }
    }).catch(
      (e) => setNotice({ kind: "error", text: t("err.save", { error: e.message }) })
    ).finally(() => setBusy(false));
  };
  if (!cfg) return null;
  return h(
    "div",
    { className: "dshpp-cr", style: { marginTop: 12 } },
    h(
      "div",
      { className: "dshpp-sub" },
      h("h4", null, t("hooksDeny.title")),
      noticeNode(notice)
    ),
    h(
      "p",
      {
        className: "dshpp-hint",
        style: { margin: "0 0 4px", color: "var(--dshpp-mute)", fontSize: 12 }
      },
      t("hooksDeny.hint")
    ),
    h(
      "div",
      { className: "dshpp-cr-row" },
      h(
        "label",
        null,
        h("input", {
          type: "checkbox",
          checked: cfg.hooksDenyBypass === true,
          disabled: busy,
          onChange: (e) => save(e.target.checked)
        }),
        t("hooksDeny.bypass")
      )
    )
  );
}

// src/components/restart.js
var rd2 = __toESM(require("react-dom"), 1);
function RestartAsk(props) {
  const node = h(
    "div",
    {
      className: "dshpp-restart-mask",
      "data-theme": props.theme === "dusk" ? "dusk" : "white",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dshpp-restart-title",
      onClick: (e) => {
        if (e.target === e.currentTarget && props.onLater) props.onLater();
      }
    },
    h(
      "div",
      { className: "dshpp-restart-card" },
      h("h4", { id: "dshpp-restart-title" }, props.t("restart.ask.title")),
      h("p", null, props.t("restart.ask.body")),
      h(
        "div",
        { className: "dshpp-modal-ops" },
        h(Btn, { onClick: props.onLater }, props.t("restart.notNow")),
        h(
          Btn,
          { kind: "primary", onClick: props.onRestart },
          props.t("restart.now")
        )
      )
    )
  );
  try {
    if (rd2 && typeof rd2.createPortal === "function" && typeof document !== "undefined" && document.body) {
      return rd2.createPortal(node, document.body);
    }
  } catch {
  }
  return node;
}
function reopenAfterRestart() {
  window.location.reload();
}
function waitForRestart(setNotice, setBusy, t) {
  const started = Date.now();
  let sawDown = false;
  const ping = () => {
    fetch(apiUrl("/dsh-purge/status"), {
      cache: "no-store",
      credentials: "same-origin"
    }).then((r) => r.ok ? r.json() : Promise.reject()).then((d) => {
      if (!sawDown) {
        retry();
        return;
      }
      if (d && d.ok && d.ready !== false) reopenAfterRestart();
      else retry();
    }).catch(() => {
      sawDown = true;
      retry();
    });
  };
  const retry = () => {
    if (Date.now() - started > 9e4) {
      setNotice({ kind: "error", text: t("restart.timeout") });
      setBusy(false);
      return;
    }
    setTimeout(ping, 500);
  };
  setTimeout(ping, 800);
}
var restartOnce = false;
function restartDsh(setNotice, setBusy, t, surface) {
  if (restartOnce) return;
  const surf = surface || clientGuessSurface() || "desktop";
  const desktop = surf === "desktop" || clientGuessSurface() === "desktop";
  restartOnce = true;
  setBusy(true);
  setNotice({ kind: "ok", text: hostText(t, "restarting", surf) });
  const stop = (error) => {
    restartOnce = false;
    setNotice({
      kind: "error",
      text: error ? t("restart.fail", { error }) : t("restart.notStarted")
    });
    setBusy(false);
  };
  let sawDrop = false;
  const watch = setTimeout(() => {
    if (sawDrop) return;
    stop("");
  }, 25e3);
  fetch(apiUrl("/dsh-purge/restart"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  }).then((r) => r.json()).then((d) => {
    if (!d.ok) throw new Error(d.error || "restart failed");
    if (d.manualQuit) {
      clearTimeout(watch);
      restartOnce = false;
      setBusy(false);
      setNotice({ kind: "ok", text: d.note || t("restart.manualQuit") });
      return;
    }
    const next = d && d.surface || surf;
    const full = next === "desktop" || d && d.fullApp || desktop;
    if (full && d.already) {
      setNotice({ kind: "ok", text: hostText(t, "restarting", next) });
      return;
    }
    if (full && d.restarting === false) {
      clearTimeout(watch);
      stop(d.error || "not started");
      return;
    }
    setNotice({ kind: "ok", text: hostText(t, "restarting", next) });
    if (full) return;
    clearTimeout(watch);
    restartOnce = false;
    waitForRestart(setNotice, setBusy, t);
  }).catch((e) => {
    const msg = String(e && e.message || e || "");
    const dropped = /failed to fetch|networkerror|load failed/i.test(msg) || e.name === "TypeError";
    if (dropped && desktop) {
      sawDrop = true;
      clearTimeout(watch);
      return;
    }
    clearTimeout(watch);
    stop(msg || "restart failed");
  });
}
function detectHostTheme() {
  try {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (document.body?.hasAttribute("data-ds-dark-theme") || root?.hasAttribute("data-ds-dark-theme"))
        return "dusk";
      const scheme = (root.style.colorScheme || getComputedStyle(root).colorScheme || getComputedStyle(root).getPropertyValue("color-scheme") || "").toLowerCase();
      if (scheme.includes("dark")) return "dusk";
      if (scheme.includes("light")) return "white";
    }
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dusk";
    }
  } catch {
  }
  return "white";
}

// src/shared/versions.js
function splitListedVersion(raw) {
  const text = String(raw || "").trim().replace(/^v/i, "");
  const cut = text.split("-");
  const core = String(cut[0] || "").split(".").map((n) => parseInt(n, 10) || 0);
  return {
    core: [core[0] || 0, core[1] || 0, core[2] || 0],
    pre: cut.slice(1).join("-")
  };
}
function listedVersionNewer(remote, local) {
  if (!remote || !local || String(remote) === String(local)) return false;
  const a = splitListedVersion(remote);
  const b = splitListedVersion(local);
  for (let i = 0; i < 3; i += 1) {
    if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i];
  }
  if (a.pre && !b.pre) return false;
  if (!a.pre && b.pre) return true;
  return a.pre > b.pre;
}
function listedCeiling(versions, localVer) {
  let best = "";
  const rows = (versions || []).slice();
  const local = String(localVer || "").replace(/^v/i, "");
  if (local && !/(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(local)) {
    rows.push({ channel: "stable", version: local });
  }
  for (const item of rows) {
    if (!item || item.channel === "beta") continue;
    const ver = String(item.version || "").replace(/^v/i, "");
    if (!/^\d+\.\d+\.\d+/.test(ver) || /(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(ver))
      continue;
    if (!best || listedVersionNewer(ver, best)) best = ver;
  }
  return best;
}
function keepListedVersion(item, _ceiling) {
  const ver = String(item && (item.version || item.ref || item.id) || "");
  if (!item) return false;
  if (item.ref === "beta" || item.id === "beta") return true;
  if (item.channel === "beta") return false;
  if (/(?:^|[-._])(beta|rc|pre|preview|test)(?:\d|$|[-._])/i.test(ver))
    return false;
  return true;
}
function preferListed(list, localVer, pin) {
  const pinned = pin ? (list || []).find((item) => item.ref === pin) : null;
  if (pinned) return pinned;
  const ver = String(localVer || "").replace(/^v/i, "");
  const same = (list || []).filter(
    (item) => ver && String(item.version || "").replace(/^v/i, "") === ver
  );
  if (same.length) {
    return same.find((item) => item.current) || same.find((item) => item.latest) || same[0];
  }
  return (list || []).find((item) => item.current) || (list || []).find((item) => item.latest) || (list || [])[0] || null;
}
function versionChoiceLabel(item, tr) {
  const ver = String(item && item.version || "").replace(/^v/i, "");
  const base = ver ? "v" + ver : item && (item.label || item.ref) || "\u2014";
  if (item && item.current) return base + " \xB7 " + tr("update.current");
  if (item && item.latest) return base + " \xB7 " + tr("update.tip");
  return base;
}

// src/components/settings-form.js
function PurgifySection({ page = "status", onStatus } = {}) {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [state, setState] = useState(null);
  useEffect(() => {
    if (onStatus) onStatus(state);
  }, [state, onStatus]);
  const [override, setOverride] = useState("");
  const [defaultOverride, setDefaultOverride] = useState("");
  const [overrideLoaded, setOverrideLoaded] = useState(false);
  const [ownServers, setOwnServers] = useState("");
  const [ownLoaded, setOwnLoaded] = useState(false);
  const [ownBusy, setOwnBusy] = useState(false);
  const ownPending = useRef(false);
  const promptPending = useRef(false);
  const ownRef = useRef("");
  ownRef.current = ownServers;
  const [patchBusy, setPatchBusy] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);
  const [canApplyUpdate, setCanApplyUpdate] = useState(false);
  const [updateJob, setUpdateJob] = useState(null);
  const [askRestart, setAskRestart] = useState(false);
  const suppressRestartAsk = useRef(false);
  const [askUninstall, setAskUninstall] = useState(false);
  const [uninstallBusy, setUninstallBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const [updateNotice, setUpdateNotice] = useState({ kind: "idle", text: "" });
  const [updateInfo, setUpdateInfo] = useState(null);
  const [channel, setChannel] = useState("stable");
  const [pick, setPick] = useState({ stable: "", beta: "" });
  const actionTicket = useRef(0);
  const overrideRef = useRef("");
  const defaultOverrideRef = useRef("");
  const promptSeededRef = useRef(false);
  const ownSeededRef = useRef(false);
  const promptAreaRef = useRef(null);
  overrideRef.current = override;
  defaultOverrideRef.current = defaultOverride;
  const readPromptBox = () => {
    const node = promptAreaRef.current;
    const live = node && typeof node.value === "string" ? node.value : overrideRef.current;
    overrideRef.current = live || "";
    return overrideRef.current;
  };
  const syncPicks = (d) => {
    const versions2 = d && d.versions || [];
    const ceiling = listedCeiling(versions2, d && d.localVersion);
    const next = { stable: "", beta: "" };
    for (const id of ["stable", "beta"]) {
      const list = versions2.filter(
        (item) => item.channel === id && keepListedVersion(item, ceiling)
      );
      const hit = preferListed(list, d && d.localVersion, d && d.pin);
      next[id] = hit && hit.ref || "";
    }
    setPick(next);
  };
  const updateErrorText = (tr, e) => {
    const msg = String(e && e.message || e || "");
    if (msg === "timeout" || /aborted|abort|timeout|타임아웃|시간 ?초과/i.test(msg))
      return tr("update.timeout");
    if (/\b404\b/.test(msg) || /non-json/.test(msg))
      return tr("update.needRestart");
    return tr("update.fail", { error: msg });
  };
  const applyUpdateInfo = useCallback((d, tr, kind) => {
    if (d.channel) setChannel(d.channel);
    setUpdateInfo((prev) => {
      const versions2 = d.versions && d.versions.length ? d.versions : prev && prev.versions || [];
      return Object.assign({}, prev || {}, d, { versions: versions2 });
    });
    if (d.versions && d.versions.length) syncPicks(d);
    if (kind === "check") setCanApplyUpdate(Boolean(d.hasUpdate) && !d.error);
    else if (kind === "done" || kind === "switched" || kind === "channel")
      setCanApplyUpdate(false);
    const version = d.localVersion || d.localSha || "\u2014";
    const remote = d.remoteVersion || d.remoteSha || "\u2014";
    let text = tr("update.latest", { version });
    if (d.hasUpdate) text = tr("update.available", { remote, local: version });
    if (d.pinned && d.hasUpdate)
      text = tr("update.pinned", { version, remote });
    if (kind === "switched" || kind === "channel")
      text = tr("update.switched", {
        version: d.localVersion || d.remoteVersion || "\u2014"
      });
    if (kind === "done")
      text = tr("update.done", {
        version: d.localVersion || d.remoteVersion || "\u2014"
      });
    if (d.error) text = d.error;
    setUpdateNotice({ kind: d.ok === false || d.error ? "error" : "ok", text });
  }, []);
  const checkUpdate = useCallback(
    (id) => {
      setUpdateBusy(true);
      setUpdateJob({ id: id || "", kind: "check" });
      const tr = tRef.current;
      setUpdateNotice({ kind: "ok", text: tr("update.checking") });
      apiJson("/dsh-purge/update").then((d) => {
        if (!d || !d.ok && !d.channel)
          throw new Error(d && d.error || "check failed");
        applyUpdateInfo(d, tr, "check");
      }).catch(
        (e) => setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) })
      ).finally(() => {
        setUpdateBusy(false);
        setUpdateJob(null);
      });
    },
    [applyUpdateInfo]
  );
  const postUpdate = useCallback(
    (body, kind, id) => {
      setUpdateBusy(true);
      setUpdateJob({ id: id || "", kind });
      const tr = tRef.current;
      setUpdateNotice({
        kind: "ok",
        text: kind === "switched" || kind === "channel" ? tr("update.switching") : tr("update.applying")
      });
      return apiJson("/dsh-purge/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body || {})
      }).then((d) => {
        if (!d || d.ok === false && d.error)
          throw new Error(d && d.error || "update failed");
        applyUpdateInfo(d, tr, kind);
        if (d.needsFullQuit) {
          suppressRestartAsk.current = false;
          setAskRestart(true);
          setUpdateNotice({ kind: "ok", text: tr("restart.official.body") });
          return d;
        }
        if (d.restartAfter) {
          setUpdateNotice({ kind: "ok", text: tr("update.restarting") });
          return d;
        }
        if (d.applied && d.reloadClient !== false) {
          setUpdateNotice({ kind: "ok", text: tr("update.reloading") });
          setTimeout(() => {
            try {
              window.location.reload();
            } catch {
            }
          }, 280);
        } else if (d.needRestart) {
          setAskRestart(true);
        }
        return d;
      }).catch((e) => {
        setUpdateNotice({ kind: "error", text: updateErrorText(tr, e) });
        throw e;
      }).finally(() => {
        setUpdateBusy(false);
        setUpdateJob(null);
      });
    },
    [applyUpdateInfo]
  );
  const doUpdate = useCallback(
    (id) => {
      const lane = id === "beta" ? "beta" : "stable";
      postUpdate(
        {
          op: "apply",
          ref: lane === "beta" ? "beta" : "master",
          channel: lane
        },
        "done",
        id
      ).catch(() => {
      });
    },
    [postUpdate]
  );
  const changeChannel = useCallback(
    (next) => {
      if (!next) return;
      const tr = tRef.current;
      if (!window.confirm(
        tr("update.confirmChannel", { version: tr("channel." + next) })
      ))
        return;
      const prevChannel = channel;
      const prevInfo = updateInfo;
      setChannel(next);
      setUpdateInfo((cur) => Object.assign({}, cur || {}, { channel: next }));
      postUpdate({ op: "channel", channel: next }, "channel", next).catch(
        () => {
          setChannel(prevChannel);
          setUpdateInfo(prevInfo);
        }
      );
    },
    [channel, postUpdate, updateInfo]
  );
  const switchSelected = useCallback(
    (id) => {
      const tr = tRef.current;
      const ref = pick[id];
      const versions2 = (updateInfo && updateInfo.versions || []).filter(
        (item) => item.channel === id
      );
      const hit = versions2.find((item) => item.ref === ref);
      const label = hit && (hit.label || hit.version) || ref;
      if (!ref) return;
      if (!window.confirm(tr("update.confirmSwitch", { version: label })))
        return;
      const prevChannel = channel;
      const prevInfo = updateInfo;
      if (hit && hit.channel) {
        setChannel(hit.channel);
        setUpdateInfo(
          (cur) => Object.assign({}, cur || {}, { channel: hit.channel })
        );
      }
      postUpdate({ op: "switch", ref }, "switched", id).catch(() => {
        setChannel(prevChannel);
        setUpdateInfo(prevInfo);
      });
    },
    [channel, pick, postUpdate, updateInfo]
  );
  const loadAll = useCallback(() => {
    const tr = tRef.current;
    apiJson("/dsh-purge/status").then((d) => {
      if (d && d.ok) {
        setState(d);
        setNotice(
          (previous) => previous?.source === "status" ? { kind: "idle", text: "" } : previous
        );
        if (d.channel) setChannel(d.channel);
        if (d.update && d.update.ok && !d.update.error)
          setUpdateInfo(d.update);
        if (d.boot_full_quit && !suppressRestartAsk.current)
          setAskRestart(true);
      } else {
        setState(unavailableStatus(d?.error || "bad response"));
        setNotice({
          kind: "error",
          source: "status",
          text: tr("err.status", { error: d && d.error || "bad response" })
        });
      }
    }).catch((e) => {
      setState(unavailableStatus(e));
      setNotice({
        kind: "error",
        source: "status",
        text: tr("err.status", { error: e.message })
      });
    });
    apiJson("/dsh-purge/update").then((d) => {
      if (!d) return;
      if (d.channel) setChannel(d.channel);
      setUpdateInfo(d);
      syncPicks(d);
    }).catch(() => {
    });
    apiJson("/dsh-purge/override").then((d) => {
      if (d && d.ok) {
        const packed = typeof d.defaultContent === "string" ? d.defaultContent : "";
        const shown = typeof d.content === "string" ? d.content : packed;
        if (packed) setDefaultOverride(packed);
        if (!promptSeededRef.current) {
          promptSeededRef.current = true;
          setOverride(shown || packed);
        }
        setOverrideLoaded(true);
      } else
        setNotice({
          kind: "error",
          text: tr("err.override", { error: d && d.error || "" })
        });
    }).catch(
      (e) => setNotice({
        kind: "error",
        text: tr("err.override", { error: e.message })
      })
    );
    apiJson("/dsh-purge/own-servers").then((d) => {
      if (d && d.ok) {
        if (!ownSeededRef.current) {
          ownSeededRef.current = true;
          setOwnServers(typeof d.content === "string" ? d.content : "");
        }
        setOwnLoaded(true);
      }
    }).catch(() => {
    });
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  const rejectNeedPrompt = useCallback((tr) => {
    setAskRestart(false);
    setNotice({ kind: "error", text: tr("need.prompt") });
    setTimeout(() => window.alert(tr("need.prompt")), 0);
  }, []);
  const doAction = useCallback(
    (action, actionKey) => {
      const tr = tRef.current;
      const label = tr(actionKey);
      const ticket = ++actionTicket.current;
      const run = () => {
        setPatchBusy(true);
        setAskRestart(false);
        setNotice({ kind: "idle", text: "" });
        const applyContent = action === "apply" ? readPromptBox() : "";
        fetch(apiUrl("/dsh-purge/" + action), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(
            action === "apply" ? { content: applyContent } : {}
          )
        }).then((r) => r.json()).then((d) => {
          if (ticket !== actionTicket.current) return;
          if (responseNeedsPrompt(d)) {
            rejectNeedPrompt(tr);
            return;
          }
          if (!d.ok) {
            setNotice({
              kind: "error",
              text: tr("err.action", {
                action: label,
                error: [
                  d.error || "",
                  ...runtimeRepairDetails(d.cli_repair)
                ].join("\n")
              })
            });
            return;
          }
          if (action === "apply") {
            if (typeof d.defaultContent === "string")
              setDefaultOverride(d.defaultContent);
            if (typeof d.override_content === "string") {
              setOverride(d.override_content);
              setOverrideLoaded(true);
            }
          }
          if (action === "apply" && d.complete === false) {
            setNotice({
              kind: "error",
              text: tr("restart.incomplete", {
                detail: incompleteApplyDetail(d, tr)
              })
            });
            loadAll();
            if (d.restarting || d.needs_full_quit) {
              suppressRestartAsk.current = false;
              setAskRestart(true);
            }
            return;
          }
          if (action === "apply") {
            if (d.manualQuit) {
              setNotice({
                kind: "ok",
                text: "\uD328\uCE58\uB97C \uB514\uC2A4\uD06C\uC5D0 \uAE30\uB85D\uD588\uC9C0\uB9CC \uD604\uC7AC \uD504\uB85C\uC138\uC2A4\uB294 \uC544\uC9C1 \uB85C\uB4DC\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. \uD328\uD0A4\uC9C0 \uAD50\uCCB4 \uB3C4\uC6B0\uBBF8\uAC00 \uC644\uC804 \uC885\uB8CC\uB97C \uAE30\uB2E4\uB9BD\uB2C8\uB2E4(macOS \uB294 \u2318Q, Windows \uB294 \uC2DC\uC2A4\uD15C \uD2B8\uB808\uC774\uC5D0\uC11C \uC885\uB8CC). \uAD50\uCCB4\uAC00 \uB05D\uB09C \uAC83\uC744 \uD655\uC778\uD55C \uB4A4 DSH \uB97C \uC9C1\uC811 \uC5EC\uC138\uC694. \uC790\uB3D9 \uC7AC\uC2DC\uC791\uC740 \uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
              });
              setAskRestart(false);
              loadAll();
              return;
            }
            setNotice({ kind: "ok", text: tr("ok.done") });
            loadAll();
            if (d.restarting || d.needs_full_quit) {
              suppressRestartAsk.current = false;
              setAskRestart(true);
            } else {
              setAskRestart(false);
            }
            return;
          }
          setNotice({ kind: "ok", text: tr("ok.done") });
          loadAll();
        }).catch((e) => {
          if (ticket !== actionTicket.current) return;
          setNotice({
            kind: "error",
            text: tr("err.action", { action: label, error: e.message })
          });
        }).finally(() => {
          if (ticket === actionTicket.current) setPatchBusy(false);
        });
      };
      run();
    },
    [loadAll, rejectNeedPrompt, state]
  );
  const saveOverride = useCallback(async () => {
    if (promptPending.current) return;
    promptPending.current = true;
    const ticket = ++actionTicket.current;
    const content = readPromptBox();
    setPatchBusy(true);
    setNotice({ kind: "idle", text: "" });
    try {
      if (await bothInjectEmpty(content, defaultOverrideRef.current)) {
        rejectNeedPrompt(t);
        return;
      }
      const d = await apiJson("/dsh-purge/override", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (ticket !== actionTicket.current) return;
      if (responseNeedsPrompt(d)) {
        rejectNeedPrompt(t);
        return;
      }
      if (!d || !d.ok) throw new Error(d && d.error || "\uC800\uC7A5 \uC2E4\uD328");
      const unchanged = readPromptBox() === content;
      if (unchanged && typeof d.content === "string") {
        overrideRef.current = d.content;
        setOverride(d.content);
      }
      setNotice({
        kind: "ok",
        text: unchanged ? t("saved.override") : "\uC81C\uCD9C\uD55C \uBC84\uC804\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uC218\uC815\uBD84\uC740 \uC544\uC9C1 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."
      });
    } catch (e) {
      if (ticket === actionTicket.current)
        setNotice({ kind: "error", text: t("err.save", { error: e.message }) });
    } finally {
      promptPending.current = false;
      if (ticket === actionTicket.current) setPatchBusy(false);
    }
  }, [t, rejectNeedPrompt]);
  const saveOwnServers = async () => {
    if (ownPending.current || !ownLoaded) return;
    ownPending.current = true;
    setOwnBusy(true);
    const content = ownRef.current;
    try {
      const d = await apiJson("/dsh-purge/own-servers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (!d || !d.ok) throw new Error(d && d.error || "\uC800\uC7A5 \uC2E4\uD328");
      const unchanged = ownRef.current === content;
      if (unchanged && typeof d.content === "string") {
        ownRef.current = d.content;
        setOwnServers(d.content);
      }
      setNotice({
        kind: "ok",
        text: !unchanged ? "\uC81C\uCD9C\uD55C \uBC84\uC804\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uC218\uC815\uBD84\uC740 \uC544\uC9C1 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4." : d.dropped > 0 ? t("saved.own.dropped", { n: d.dropped }) : t("saved.own")
      });
    } catch (e) {
      setNotice({ kind: "error", text: t("err.save", { error: e.message }) });
    } finally {
      ownPending.current = false;
      setOwnBusy(false);
    }
  };
  const restoreOverride = useCallback(() => {
    if (!defaultOverride) return;
    const tr = t;
    const ticket = ++actionTicket.current;
    overrideRef.current = defaultOverride;
    setOverride(defaultOverride);
    setPatchBusy(true);
    setNotice({ kind: "idle", text: "" });
    apiJson("/dsh-purge/override", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: defaultOverride })
    }).then((d) => {
      if (ticket !== actionTicket.current) return;
      if (!d || !d.ok) {
        setNotice({
          kind: "error",
          text: tr("err.save", { error: d && d.error || "" })
        });
        return;
      }
      const unchanged = readPromptBox() === defaultOverride;
      if (typeof d.content === "string" && unchanged) {
        overrideRef.current = d.content;
        setOverride(d.content);
      }
      setNotice({
        kind: "ok",
        text: unchanged ? tr("saved.restoreInject") : "\uAE30\uBCF8\uAC12\uC73C\uB85C \uB418\uB3CC\uB838\uC2B5\uB2C8\uB2E4. \uD604\uC7AC \uC218\uC815\uBD84\uC740 \uC544\uC9C1 \uC800\uC7A5\uD558\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4."
      });
    }).catch((e) => {
      if (ticket !== actionTicket.current) return;
      setNotice({
        kind: "error",
        text: tr("err.save", { error: e.message })
      });
    }).finally(() => {
      if (ticket === actionTicket.current) setPatchBusy(false);
    });
  }, [defaultOverride, t]);
  const waitHostAfterUninstall = useCallback((tr) => {
    const started = Date.now();
    const ping = () => {
      fetch(apiUrl("/"), { cache: "no-store", credentials: "same-origin" }).then((r) => {
        if (r.ok) {
          try {
            window.localStorage.removeItem("dshpp-theme");
            window.localStorage.removeItem("dshpp-theme-mode");
          } catch {
          }
          window.location.reload();
          return;
        }
        retry();
      }).catch(retry);
    };
    const retry = () => {
      if (Date.now() - started > 9e4) {
        setNotice({ kind: "error", text: tr("restart.timeout") });
        setUninstallBusy(false);
        return;
      }
      setTimeout(ping, 500);
    };
    setTimeout(ping, 800);
  }, []);
  const doUninstall = useCallback(() => {
    setUninstallBusy(true);
    setAskUninstall(false);
    setAskRestart(false);
    const tr = tRef.current;
    setNotice({ kind: "ok", text: tr("uninstall.applying") });
    apiJson("/dsh-purge/uninstall", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    }).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "uninstall failed");
      setNotice({
        kind: "ok",
        text: d && d.note || hostText(tr, "uninstall.done", d.surface || hostSurfaceOf(state))
      });
      if ((d && d.surface) === "desktop" || d && d.fullApp || hostSurfaceOf(state) === "desktop")
        return;
      waitHostAfterUninstall(tr);
    }).catch((e) => {
      const msg = String(e && e.message || e || "");
      if (/failed to fetch|networkerror|load failed/i.test(msg)) {
        setNotice({
          kind: "ok",
          text: hostText(tr, "uninstall.done", hostSurfaceOf(state))
        });
        if (hostSurfaceOf(state) === "desktop" || clientGuessSurface() === "desktop")
          return;
        waitHostAfterUninstall(tr);
        return;
      }
      setNotice({
        kind: "error",
        text: tr("uninstall.fail", { error: msg })
      });
      setUninstallBusy(false);
    });
  }, [state, waitHostAfterUninstall]);
  const s = state;
  const located = !!(s && s.ai_base);
  const hostSurface = hostSurfaceOf(s);
  const desktopLikely = hostSurface === "desktop" || clientGuessSurface() === "desktop";
  const sealedReady = !located && desktopLikely && !!(s && (s.asar_still_sealed || s.desktop_exe || s.desktop_install));
  const patchesLost = !located && !!(s && s.patches_lost);
  const tally = located ? tallyPatches(patchRowsOf(s)) : { applied: 0, pending: 0, unmatched: 0, skipped: 0, total: 0 };
  const total = tally.total;
  const applied = tally.applied;
  const pct = located && total ? Math.round(applied / total * 100) : 0;
  const metricNotes = [];
  if (tally.pending)
    metricNotes.push(t("metric.pendingShort", { n: tally.pending }));
  if (tally.unmatched)
    metricNotes.push(t("metric.unmatchedShort", { n: tally.unmatched }));
  if (tally.partial)
    metricNotes.push(t("metric.partialShort", { n: tally.partial }));
  if (tally.drifted)
    metricNotes.push(t("metric.driftedShort", { n: tally.drifted }));
  if (tally.disabled)
    metricNotes.push(t("metric.disabledShort", { n: tally.disabled }));
  if (tally.skipped)
    metricNotes.push(t("metric.skipShort", { n: tally.skipped }));
  const versions = updateInfo && updateInfo.versions || [];
  const channelNow = updateInfo && updateInfo.channel || channel || "stable";
  const localVer = s && s.plugin_version || updateInfo && updateInfo.localVersion || "";
  const renderEdition = (id) => {
    const lane = updateInfo && updateInfo.lanes && updateInfo.lanes[id] || {};
    const ceiling = listedCeiling(
      versions,
      localVer || updateInfo && updateInfo.localVersion
    );
    const list = versions.filter(
      (item) => item.channel === id && keepListedVersion(item, ceiling)
    );
    const selectedRef = pick[id] || "";
    const hit = list.find((item) => item.ref === selectedRef) || preferListed(list, localVer, updateInfo && updateInfo.pin);
    const onLane = channelNow === id;
    const noBeta = id === "beta" && Array.isArray(updateInfo && updateInfo.versions) && !list.length;
    const pickedOther = Boolean(hit && selectedRef && !hit.current);
    const thisJob = updateJob && updateJob.id === id ? updateJob : null;
    let actionLabel = t("btn.checkUpdate");
    let actionKind;
    let actionClick = () => checkUpdate(id);
    let actionDisabled = updateBusy || Boolean(noBeta);
    if (noBeta) {
      actionLabel = t("update.noBeta");
      actionClick = () => {
      };
    } else if (pickedOther) {
      actionLabel = t("update.switch");
      actionKind = "primary";
      actionClick = () => switchSelected(id);
    } else if (!onLane) {
      actionLabel = id === "beta" ? t("channel.useBeta") : t("channel.useStable");
      actionKind = "primary";
      actionClick = () => changeChannel(id);
    } else if (canApplyUpdate && lane.hasUpdate) {
      actionLabel = t("btn.doUpdate");
      actionKind = "primary";
      actionClick = () => doUpdate(id);
    }
    if (thisJob) {
      if (thisJob.kind === "check") actionLabel = t("btn.checkUpdate.busy");
      else if (thisJob.kind === "done") actionLabel = t("btn.doUpdate.busy");
      else actionLabel = t("update.switching");
    }
    return h(
      "div",
      {
        className: "dshpp-edition" + (onLane ? " is-on" : ""),
        "aria-label": t("channel." + id)
      },
      h(
        "span",
        { className: "dshpp-edition-name" },
        t("channel." + id),
        onLane ? h("em", { className: "dshpp-now-mark" }, t("update.current")) : null
      ),
      h(
        "select",
        {
          className: "dshpp-field dshpp-ver",
          value: list.length ? hit && hit.ref || "" : "",
          disabled: updateBusy || !list.length,
          onChange: (e) => setPick(
            (prev) => Object.assign({}, prev, { [id]: e.target.value })
          ),
          "aria-label": t("update.pick")
        },
        list.length ? list.map(
          (item) => h(
            "option",
            {
              key: item.ref + (item.sha || ""),
              value: item.ref
            },
            versionChoiceLabel(item, t)
          )
        ) : h(
          "option",
          { value: "" },
          noBeta ? t("update.noBeta") : t("update.pick")
        )
      ),
      h(
        Btn,
        {
          tiny: true,
          kind: actionKind,
          disabled: actionDisabled,
          onClick: actionClick
        },
        actionLabel
      )
    );
  };
  return h(
    "section",
    { className: "dshpp-panel", "aria-label": t("purge.title") },
    h(
      "div",
      { hidden: page !== "status" },
      h(
        "div",
        { className: "dshpp-hero" },
        h(
          "div",
          { className: "dshpp-hero-state" },
          h("i", {
            className: "dshpp-dot " + (!located ? "is-warn" : patchBusy ? "" : s?.asar_still_sealed || tally.pending ? "is-warn" : "is-ok")
          }),
          h(
            "b",
            null,
            !s ? "\uD638\uC2A4\uD2B8 \uC0C1\uD0DC\uB97C \uC77D\uB294 \uC911\u2026" : s.ok === false ? "\uC0C1\uD0DC \uC77D\uAE30 \uC2E4\uD328. \uD638\uC2A4\uD2B8\uC640 \uD328\uCE58 \uC0C1\uD0DC\uB97C \uC54C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" : !located ? sealedReady ? "\uD638\uC2A4\uD2B8\uAC00 \uC544\uC9C1 \uD480\uB9AC\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. '\uC801\uC6A9'\uC744 \uB204\uB974\uC138\uC694" : "\uD638\uC2A4\uD2B8\uB97C \uCC3E\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. '\uC801\uC6A9'\uC744 \uB20C\uB7EC \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694" : s?.asar_still_sealed ? `${applied}/${total}\uAC74 \uB514\uC2A4\uD06C \uD328\uCE58(\uC885\uB8CC \uD6C4 \uB2E4\uC2DC \uC5F4\uBA74 \uB85C\uB4DC\uB429\uB2C8\uB2E4)` : tally.pending ? `${tally.pending}\uAC74 \uB354 \uC801\uC6A9 \uB300\uAE30` : `${applied}/${total}\uAC74 \uD328\uCE58 \uC801\uC6A9\uB428`
          ),
          h(
            "span",
            { className: "dshpp-hero-sub" },
            t("surface." + hostSurface)
          )
        ),
        h(
          "div",
          { className: "dshpp-hero-actions" },
          h(
            Btn,
            {
              kind: "primary",
              className: "dshpp-btn-lead",
              disabled: patchBusy || uninstallBusy || !overrideLoaded,
              onClick: () => doAction("apply", "action.apply")
            },
            patchBusy ? t("btn.apply.busy") : t("btn.apply")
          ),
          h(
            Btn,
            {
              kind: "danger",
              disabled: patchBusy || uninstallBusy,
              onClick: () => doAction("revert", "action.revert")
            },
            t("btn.revert")
          ),
          h(
            Btn,
            {
              kind: "solid-danger",
              disabled: patchBusy || uninstallBusy,
              onClick: () => setAskUninstall(true)
            },
            uninstallBusy ? t("btn.uninstall.busy") : t("btn.uninstall")
          ),
          h(
            Btn,
            {
              tiny: true,
              onClick: loadAll,
              disabled: patchBusy || uninstallBusy
            },
            "\uC0C8\uB85C \uACE0\uCE68"
          )
        ),
        h(
          "p",
          { className: "dshpp-hero-hint" },
          "\uD50C\uB7EC\uADF8\uC778\uC744 \uC124\uCE58\uD588\uAC70\uB098, DSH \uB97C \uC5C5\uB370\uC774\uD2B8\uD588\uAC70\uB098, \uBAA8\uB378\uC774 \uB2E4\uC2DC \uD68C\uD53C\uD558\uAE30 \uC2DC\uC791\uD558\uBA74 '\uC801\uC6A9'\uC744 \uD55C \uBC88 \uB204\uB978 \uB4A4 DSH \uB97C \uC885\uB8CC\uD588\uB2E4\uAC00 \uB2E4\uC2DC \uC5F4\uBA74 \uBCF5\uAD6C\uB429\uB2C8\uB2E4."
        ),
        noticeNode(notice)
      ),
      h(
        "div",
        { className: "dshpp-rel" },
        h(
          "div",
          { className: "dshpp-now" },
          h("span", { className: "dshpp-now-label" }, t("channel.local")),
          h(
            "b",
            { className: "dshpp-now-ver" },
            localVer ? "v" + localVer : "\u2014"
          ),
          h("em", { className: "dshpp-now-mark" }, t("update.current"))
        ),
        h(
          "details",
          { className: "dshpp-editions" },
          h("summary", null, "\uBC84\uC804 \uAD00\uB9AC"),
          renderEdition("stable"),
          renderEdition("beta")
        ),
        noticeNode(updateNotice)
      ),
      h(
        "details",
        { className: "dshpp-fold" },
        h(
          "summary",
          null,
          "\uD328\uCE58 \uC0C1\uC138 ",
          h(
            "b",
            null,
            !s ? "\uC77D\uB294 \uC911" : s.ok === false ? "\uC0C1\uD0DC \uBBF8\uD655\uC778" : s.ai_base ? `${applied}/${total} \uC801\uC6A9\uB428` : "\uD638\uC2A4\uD2B8 \uBBF8\uD0D0\uC9C0"
          )
        ),
        h(PatchGroups, { state: s })
      ),
      h(
        "details",
        null,
        h("summary", null, "\uACE0\uAE09 \uC635\uC158"),
        h(HooksDenySection, { onSaved: loadAll })
      ),
      askUninstall ? h(
        "div",
        {
          className: "dshpp-modal-bg",
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "dshpp-uninstall-title",
          onClick: (e) => {
            if (e.target === e.currentTarget && !uninstallBusy)
              setAskUninstall(false);
          }
        },
        h(
          "div",
          { className: "dshpp-modal" },
          h("h4", { id: "dshpp-uninstall-title" }, t("uninstall.title")),
          h("p", null, t("uninstall.body")),
          h(
            "div",
            { className: "dshpp-modal-ops" },
            h(
              Btn,
              {
                disabled: uninstallBusy,
                onClick: () => setAskUninstall(false)
              },
              t("uninstall.cancel")
            ),
            h(
              Btn,
              {
                kind: "solid-danger",
                disabled: uninstallBusy,
                onClick: doUninstall
              },
              t("uninstall.confirm")
            )
          )
        )
      ) : null,
      h(
        "p",
        {
          className: "dshpp-hint",
          style: {
            margin: "8px 0 0",
            color: "var(--dshpp-mute)",
            fontSize: 12
          }
        },
        t("apply.hint")
      ),
      s?.ok === true && !s.ai_base ? h(
        "p",
        {
          className: "dshpp-hint",
          style: {
            margin: "8px 0 0",
            color: "var(--dshpp-danger, #c44)",
            fontSize: 12
          }
        },
        hostText(t, "warn.noRoot", hostSurface)
      ) : null,
      s && s.ai_base && s.override_status === "missing" ? h(
        "p",
        {
          className: "dshpp-hint",
          style: {
            margin: "8px 0 0",
            color: "var(--dshpp-mute)",
            fontSize: 12
          }
        },
        t("warn.noInject")
      ) : null,
      askRestart ? h(RestartAsk, {
        t,
        theme: detectHostTheme(),
        onLater: () => {
          suppressRestartAsk.current = true;
          setAskRestart(false);
        },
        onRestart: () => {
          suppressRestartAsk.current = true;
          setAskRestart(false);
          restartDsh(setNotice, function() {
          }, t, hostSurface);
        }
      }) : null
    ),
    h(
      "div",
      { hidden: page !== "prompt" },
      h(
        "div",
        { className: "dshpp-sub" },
        h("h4", null, t("override.title")),
        h(
          "div",
          { className: "dshpp-row", style: { margin: 0 } },
          h(
            Btn,
            {
              kind: "primary",
              tiny: true,
              disabled: patchBusy || !overrideLoaded,
              onClick: saveOverride
            },
            t("btn.saveInject")
          ),
          h(
            Btn,
            {
              tiny: true,
              disabled: patchBusy || !overrideLoaded || !defaultOverride,
              onClick: restoreOverride
            },
            t("btn.restoreInject")
          )
        )
      ),
      h("textarea", {
        className: "dshpp-area",
        ref: promptAreaRef,
        "aria-label": "\uD504\uB86C\uD504\uD2B8 \uB0B4\uC6A9",
        disabled: !overrideLoaded,
        value: override,
        onChange: (e) => {
          overrideRef.current = e.target.value;
          setOverride(e.target.value);
        },
        spellCheck: false,
        placeholder: ""
      }),
      noticeNode(notice),
      promptBoxEmpty(override) ? h(
        "p",
        {
          className: "dshpp-hint",
          style: {
            margin: "8px 0 0",
            color: "var(--dshpp-danger, #c44)",
            fontSize: 12
          }
        },
        t("need.prompt")
      ) : null
    ),
    h(
      "div",
      { hidden: page !== "more" },
      h(
        "div",
        { className: "dshpp-sub" },
        h("h4", null, t("own.title")),
        h(
          "div",
          { className: "dshpp-row", style: { margin: 0 } },
          h(
            Btn,
            {
              kind: "primary",
              tiny: true,
              disabled: !ownLoaded || ownBusy,
              onClick: saveOwnServers
            },
            t("own.save")
          )
        )
      ),
      h("textarea", {
        className: "dshpp-area",
        "aria-label": "\uC11C\uBC84 \uBAA9\uB85D",
        disabled: !ownLoaded,
        value: ownServers,
        onChange: (e) => {
          ownRef.current = e.target.value;
          setOwnServers(e.target.value);
        },
        spellCheck: false,
        rows: 4,
        style: { minHeight: 96 }
      }),
      h(
        "p",
        {
          className: "dshpp-hint",
          style: {
            margin: "8px 0 0",
            color: "var(--dshpp-mute)",
            fontSize: 12
          }
        },
        t("own.hint")
      ),
      noticeNode(notice)
    )
  );
}

// src/state/session-context.js
var import_react11 = require("react");
var host = null;
var listeners = /* @__PURE__ */ new Set();
function notify() {
  for (const listener of listeners) listener();
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function bindSessionContext(ctx) {
  host = ctx;
  const dispose = [ctx.uiWorkspace?.selection, ctx.sessions?.list].filter((store) => typeof store?.subscribe === "function").map((store) => store.subscribe(notify));
  notify();
  return () => {
    for (const fn of dispose) if (typeof fn === "function") fn();
    if (host === ctx) {
      host = null;
      notify();
    }
  };
}
function readSessionCwd(sess) {
  if (!sess || typeof sess !== "object") return "";
  try {
    const pv = sess.projectionValues;
    if (pv && typeof pv.cwd === "string" && pv.cwd.trim()) return pv.cwd.trim();
  } catch {
  }
  try {
    if (typeof sess.cwd === "string" && sess.cwd.trim()) return sess.cwd.trim();
  } catch {
  }
  try {
    const header = sess.header;
    if (header && typeof header.cwd === "string" && header.cwd.trim())
      return header.cwd.trim();
  } catch {
  }
  return "";
}
function clientCurrentCwd() {
  if (!host?.sessions) return "";
  const sessions = host.sessions;
  const selection = host.uiWorkspace?.selection?.getSnapshot?.();
  const list = sessions.list?.getSnapshot?.();
  const id = selection?.sessionId || list?.current;
  if (!id) return "";
  const fromList = readSessionCwd(list?.byId?.[id]);
  if (fromList) return fromList;
  try {
    const scope = sessions.scope?.(id);
    const face = sessions.sessionOf?.(scope);
    return readSessionCwd(face?.getSnapshot?.() ?? face);
  } catch {
    return "";
  }
}
function useCurrentCwd() {
  return (0, import_react11.useSyncExternalStore)(subscribe, clientCurrentCwd, () => "");
}

// src/components/rules.js
var TARGETS = ["AGENTS.md", "CLAUDE.md"];
function ruleLabel(r) {
  if (!r) return "";
  if (r.name !== r.id) return r.name + " (" + r.id + ")";
  return r.id;
}
function RulesSection() {
  const t = useT();
  const cwd = useCurrentCwd();
  const statusTicket = useRef(0);
  const tRef = useRef(t);
  tRef.current = t;
  const [st, setSt] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("AGENTS.md");
  const [content, setContent] = useState("");
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("AGENTS.md");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const loadStatus = useCallback(() => {
    const tr = tRef.current;
    const ticket = ++statusTicket.current;
    rulesApi("status", cwd ? { cwd } : void 0).then((d) => {
      if (ticket !== statusTicket.current) return;
      if (d && d.ok) setSt(d);
      else {
        setSt({ ok: false, rules: [], active: null });
        setNotice({
          kind: "error",
          text: tr("err.rules", { error: d && d.error || "bad response" })
        });
      }
    }).catch((e) => {
      if (ticket !== statusTicket.current) return;
      setSt({ ok: false, rules: [], active: null });
      setNotice({
        kind: "error",
        text: tr("err.rules", { error: e.message })
      });
    });
  }, [cwd]);
  useEffect(() => {
    loadStatus();
    return () => {
      statusTicket.current += 1;
    };
  }, [loadStatus]);
  const doPost = useCallback(
    (action, payload, after) => {
      setBusy(true);
      setNotice({ kind: "idle", text: "" });
      rulesApi(action, payload).then((d) => {
        if (d && d.ok) {
          setNotice({ kind: "ok", text: t("ok.done") });
          if (action === "save" || action === "activate")
            warnNeedPrompt(d, t);
          loadStatus();
          if (after) after();
        } else {
          warnNeedPrompt(d, t);
          setNotice({
            kind: "error",
            text: t("err.action", { error: d && d.error || "" })
          });
        }
      }).catch(
        (e) => setNotice({
          kind: "error",
          text: t("err.action", { error: e.message })
        })
      ).finally(() => setBusy(false));
    },
    [loadStatus, t]
  );
  const openRule = useCallback(
    (id) => {
      setBusy(true);
      rulesApi("read", { id }).then((d) => {
        if (d.ok) {
          setEditId(id);
          setEditName(d.name || id);
          setEditTarget(d.target || "AGENTS.md");
          setContent(typeof d.content === "string" ? d.content : "");
        } else
          setNotice({
            kind: "error",
            text: t("err.read", { error: d.error || "" })
          });
      }).catch(
        (e) => setNotice({
          kind: "error",
          text: t("err.read", { error: e.message })
        })
      ).finally(() => setBusy(false));
    },
    [t]
  );
  const clearEditor = () => {
    setEditId(null);
    setEditName("");
    setEditTarget("AGENTS.md");
    setContent("");
  };
  let list;
  if (!st) {
    list = h("div", {
      className: "dshpp-skel",
      style: { height: 80, margin: 12 }
    });
  } else if (!st.rules || st.rules.length === 0) {
    list = h("p", { className: "dshpp-empty" }, t("rules.empty"));
  } else {
    list = st.rules.map((r) => {
      const isActive = r.id === st.active;
      const isEdit = r.id === editId;
      return h(
        "div",
        {
          key: r.id,
          className: "dshpp-ruleitem" + (isEdit ? " is-edit" : ""),
          role: "button",
          tabIndex: 0,
          onClick: () => openRule(r.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openRule(r.id);
            }
          }
        },
        h(
          "div",
          { className: "dshpp-rule-main" },
          h(
            "span",
            { className: "dshpp-rule-name" },
            ruleLabel(r),
            isActive ? h("span", { className: "dshpp-pill is-ok" }, t("pill.current")) : null
          ),
          h(
            "span",
            { className: "dshpp-rule-meta" },
            r.target + " \xB7 " + formatSize(r.size)
          )
        ),
        h(
          "div",
          { className: "dshpp-rule-ops" },
          h(
            Btn,
            {
              tiny: true,
              kind: isActive ? void 0 : "primary",
              disabled: busy || isActive,
              onClick: (e) => {
                e.stopPropagation();
                if (!isActive) doPost("activate", { id: r.id });
              }
            },
            isActive ? t("btn.inUse") : t("btn.use")
          ),
          h(
            Btn,
            {
              tiny: true,
              kind: "danger",
              disabled: busy,
              onClick: (e) => {
                e.stopPropagation();
                if (!window.confirm(t("confirm.delete", { id: r.id }))) return;
                if (editId === r.id) clearEditor();
                doPost("delete", { id: r.id });
              }
            },
            t("delete")
          )
        )
      );
    });
  }
  const policyValue = st && typeof st.workspace_policy === "string" ? st.workspace_policy : "fallback";
  const policyOptions = st && Array.isArray(st.workspace_policies) && st.workspace_policies.length ? st.workspace_policies : ["fallback", "strict", "always"];
  const cwdCandidates = st && Array.isArray(st.cwd_candidates) ? st.cwd_candidates : [];
  const cwdValue = st && typeof st.cwd === "string" ? st.cwd : "";
  return h(
    "section",
    { className: "dshpp-panel", "aria-label": t("rules.title") },
    h(
      "div",
      { className: "dshpp-head" },
      h("h3", { className: "dshpp-title" }, t("rules.title")),
      h(
        "div",
        { className: "dshpp-row", style: { margin: 0 } },
        noticeNode(notice),
        h(
          Btn,
          {
            tiny: true,
            kind: "danger",
            disabled: busy,
            onClick: () => {
              if (!window.confirm(t("rules.reset.confirm"))) return;
              clearEditor();
              doPost("reset", {});
            }
          },
          t("rules.reset")
        )
      )
    ),
    h(
      "div",
      { className: "dshpp-block" },
      h(
        "div",
        { className: "dshpp-policy-row" },
        h("label", { htmlFor: "dshpp-policy-select" }, t("policy.title")),
        h(
          "select",
          {
            id: "dshpp-policy-select",
            className: "dshpp-field",
            value: policyValue,
            disabled: busy || !st,
            onChange: (e) => doPost("set-policy", { policy: e.target.value })
          },
          policyOptions.map(
            (p) => h("option", { key: p, value: p }, t("policy." + p))
          )
        )
      ),
      h("p", { className: "dshpp-block-hint" }, t("policy.hint"))
    ),
    h(
      "div",
      { className: "dshpp-block" },
      h(
        "div",
        { className: "dshpp-block-head" },
        h("h4", null, t("cwd.title")),
        h(
          Btn,
          {
            tiny: true,
            disabled: busy,
            onClick: () => {
              let cwd2 = cwdValue;
              if (!cwd2) {
                try {
                  cwd2 = clientCurrentCwd();
                } catch {
                }
              }
              doPost("scan-cwd", cwd2 ? { cwd: cwd2 } : {});
            }
          },
          t("cwd.rescan")
        )
      ),
      cwdValue ? h("p", { className: "dshpp-cwd-path" }, cwdValue) : null,
      !st || !cwdValue ? h("p", { className: "dshpp-empty" }, t("cwd.no.workspace")) : cwdCandidates.length === 0 ? h("p", { className: "dshpp-empty" }, t("cwd.empty")) : h(
        "div",
        { className: "dshpp-cwd-list" },
        cwdCandidates.map(
          (item) => h(
            "label",
            {
              key: item.path,
              className: "dshpp-cwd-item" + (item.selected ? " is-on" : "")
            },
            h("input", {
              type: "checkbox",
              checked: Boolean(item.selected),
              disabled: busy,
              onChange: (e) => doPost("toggle-cwd", {
                path: item.path,
                enabled: e.target.checked
              })
            }),
            h(
              "div",
              { className: "dshpp-cwd-main" },
              h(
                "div",
                { className: "dshpp-cwd-name" },
                h("span", null, item.name),
                h(
                  "span",
                  { className: "dshpp-cwd-badge" },
                  t("cwd.scope." + (item.scope || "cwd"))
                ),
                h(
                  "span",
                  { className: "dshpp-cwd-size" },
                  formatSize(item.size || 0)
                )
              ),
              h("div", { className: "dshpp-cwd-sub" }, item.path),
              item.preview ? h("div", { className: "dshpp-cwd-prev" }, item.preview) : null
            )
          )
        )
      ),
      h("p", { className: "dshpp-block-hint" }, t("cwd.hint"))
    ),
    h(
      "div",
      { className: "dshpp-block" },
      h(
        "div",
        { className: "dshpp-split" },
        h(
          "div",
          { className: "dshpp-rulelist" },
          h("div", { className: "dshpp-rulebody" }, list),
          h(
            "div",
            { className: "dshpp-create" },
            h(
              "div",
              { className: "dshpp-create-row" },
              h("input", {
                className: "dshpp-field",
                placeholder: t("ph.id"),
                value: newId,
                onChange: (e) => setNewId(e.target.value)
              }),
              h("input", {
                className: "dshpp-field",
                placeholder: t("ph.alias"),
                value: newName,
                onChange: (e) => setNewName(e.target.value)
              }),
              h(
                "select",
                {
                  className: "dshpp-field",
                  style: { minWidth: 120, flex: "0 0 auto" },
                  value: newTarget,
                  onChange: (e) => setNewTarget(e.target.value)
                },
                TARGETS.map((x) => h("option", { key: x, value: x }, x))
              ),
              h(
                Btn,
                {
                  kind: "primary",
                  tiny: true,
                  disabled: busy,
                  onClick: () => {
                    const id = newId.trim();
                    if (!id) {
                      setNotice({ kind: "error", text: t("need.id") });
                      return;
                    }
                    const name2 = newName.trim() || id;
                    const target = newTarget;
                    doPost("save", { id, content: "", name: name2, target }, () => {
                      setEditId(id);
                      setEditName(name2);
                      setEditTarget(target);
                      setContent("");
                    });
                    setNewId("");
                    setNewName("");
                    setNewTarget("AGENTS.md");
                  }
                },
                t("btn.create")
              )
            )
          )
        ),
        h(
          "div",
          { className: "dshpp-editor" },
          editId ? [
            h(
              "div",
              { key: "meta", className: "dshpp-row" },
              h("input", {
                className: "dshpp-field",
                placeholder: t("ph.alias.short"),
                value: editName,
                onChange: (e) => setEditName(e.target.value)
              }),
              h(
                "select",
                {
                  className: "dshpp-field",
                  style: { minWidth: 120 },
                  value: editTarget,
                  onChange: (e) => setEditTarget(e.target.value)
                },
                TARGETS.map((x) => h("option", { key: x, value: x }, x))
              )
            ),
            h("textarea", {
              key: "body",
              className: "dshpp-area",
              value: content,
              onChange: (e) => setContent(e.target.value),
              placeholder: ""
            }),
            h(
              "div",
              { key: "save", className: "dshpp-row" },
              h(
                Btn,
                {
                  kind: "primary",
                  disabled: busy,
                  onClick: () => doPost("save", {
                    id: editId,
                    content,
                    name: editName,
                    target: editTarget
                  })
                },
                t("btn.saveRule")
              ),
              noticeNode(notice)
            )
          ] : h("div", { className: "dshpp-editor-empty" }, t("rules.pick"))
        )
      )
    )
  );
}

// src/components/skills.js
function skillUiAllowed(d) {
  if (!d) return false;
  const ver = String(d.plugin_version || d.localVersion || "").replace(
    /^v/i,
    ""
  );
  if (/^1\.1\.11(?:-|$)/.test(ver)) return false;
  const parts = ver.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!parts) return false;
  if (+parts[1] !== 1) return +parts[1] > 1;
  if (+parts[2] !== 1) return +parts[2] > 1;
  return +parts[3] >= 12;
}
function SkillsSection() {
  const t = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const [onBeta, setOnBeta] = useState(false);
  const [st, setSt] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ kind: "idle", text: "" });
  const zipRef = useRef(null);
  const folderRef = useRef(null);
  const loadStatus = useCallback(() => {
    const tr = tRef.current;
    const fail = (e) => {
      setSt({ ok: false, skills: [] });
      setNotice({
        kind: "error",
        text: skillsRouteMissing(e) ? tr("err.skills.needRestart") : tr("err.skills", {
          error: e && e.message || e || "bad response"
        })
      });
    };
    const apply2 = (d) => {
      if (d && d.ok) setSt({ ok: true, skills: d.skills || [] });
      else fail({ message: d && d.error || "bad response" });
    };
    apiJson("/dsh-purge/status").then((d) => {
      const allowed = skillUiAllowed(d);
      setOnBeta(allowed);
      if (!allowed) {
        setSt(null);
        return;
      }
      if (d.skills) {
        apply2({ ok: true, skills: d.skills });
        return;
      }
      skillsApi("status").then(apply2).catch(fail);
    }).catch(() => {
      setOnBeta(false);
      setSt(null);
    });
  }, []);
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);
  const doPost = useCallback(
    (action, payload, after) => {
      setBusy(true);
      setNotice({ kind: "idle", text: "" });
      skillsApi(action, payload).then((d) => {
        if (d && d.ok) {
          setNotice({ kind: "ok", text: t("ok.done") });
          loadStatus();
          if (after) after(d);
        } else {
          setNotice({
            kind: "error",
            text: t("err.action", { error: d && d.error || "" })
          });
        }
      }).catch(
        (e) => setNotice({
          kind: "error",
          text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { error: e.message })
        })
      ).finally(() => setBusy(false));
    },
    [loadStatus, t]
  );
  const openSkill = useCallback(
    (id) => {
      setBusy(true);
      skillsApi("read", { id }).then((d) => {
        if (d.ok) {
          setEditId(id);
          setEditDesc(d.description || "");
          setContent(typeof d.content === "string" ? d.content : "");
        } else
          setNotice({
            kind: "error",
            text: t("err.read", { error: d.error || "" })
          });
      }).catch(
        (e) => setNotice({
          kind: "error",
          text: t("err.read", { error: e.message })
        })
      ).finally(() => setBusy(false));
    },
    [t]
  );
  const clearEditor = () => {
    setEditId(null);
    setEditDesc("");
    setContent("");
  };
  const readAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const at = text.indexOf(",");
      resolve(at >= 0 ? text.slice(at + 1) : text);
    };
    reader.onerror = () => reject(new Error(t("need.import")));
    reader.readAsDataURL(file);
  });
  const importZip = (file) => {
    if (!file) {
      setNotice({ kind: "error", text: t("need.import") });
      return;
    }
    setBusy(true);
    setNotice({ kind: "ok", text: t("skills.importing") });
    readAsBase64(file).then((data) => skillsApi("import", { data, name: file.name })).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "");
      setNotice({
        kind: "ok",
        text: t("saved.import", { count: (d.imported || []).length || 1 })
      });
      loadStatus();
    }).catch(
      (e) => setNotice({
        kind: "error",
        text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { error: e.message })
      })
    ).finally(() => setBusy(false));
  };
  const keepFolderFile = (file) => {
    const rel = String(file.webkitRelativePath || file.name || "").replace(
      /\\/g,
      "/"
    );
    if (!rel || rel.includes("..")) return false;
    if (/(^|\/)(node_modules|\.git|__MACOSX|\.system)(\/|$)/i.test(rel))
      return false;
    if (/(^|\/)\._/.test(rel) || /\/\.DS_Store$/i.test(rel)) return false;
    return true;
  };
  const importFolder = (list2) => {
    const files = Array.from(list2 || []).filter(keepFolderFile);
    if (!files.length) {
      setNotice({ kind: "error", text: t("err.import.folder") });
      return;
    }
    setBusy(true);
    setNotice({ kind: "ok", text: t("skills.importing") });
    Promise.all(
      files.map(
        (file) => readAsBase64(file).then((content2) => ({
          path: file.webkitRelativePath || file.name,
          content: content2,
          encoding: "base64"
        }))
      )
    ).then(
      (payload) => skillsApi("import", {
        files: payload,
        name: String(payload[0] && payload[0].path || "").split("/")[0]
      })
    ).then((d) => {
      if (!d || !d.ok) throw new Error(d && d.error || "");
      setNotice({
        kind: "ok",
        text: t("saved.import", { count: (d.imported || []).length || 1 })
      });
      loadStatus();
    }).catch(
      (e) => setNotice({
        kind: "error",
        text: skillsRouteMissing(e) ? t("err.skills.needRestart") : t("err.action", { error: e.message })
      })
    ).finally(() => setBusy(false));
  };
  if (!onBeta) return null;
  let list;
  if (!st) {
    list = h("div", {
      className: "dshpp-skel",
      style: { height: 80, margin: 12 }
    });
  } else if (!st.skills || st.skills.length === 0) {
    list = h("p", { className: "dshpp-empty" }, t("skills.empty"));
  } else {
    list = st.skills.map((item) => {
      const isEdit = item.id === editId;
      return h(
        "div",
        {
          key: item.id,
          className: "dshpp-ruleitem" + (isEdit ? " is-edit" : ""),
          role: "button",
          tabIndex: 0,
          onClick: () => openSkill(item.id),
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openSkill(item.id);
            }
          }
        },
        h(
          "div",
          { className: "dshpp-rule-main" },
          h("span", { className: "dshpp-rule-name" }, item.id),
          h(
            "span",
            { className: "dshpp-rule-meta" },
            (item.valid ? item.description : t("skills.invalid")) + " \xB7 " + formatSize(item.size)
          ),
          item.valid ? h(
            "span",
            { className: "dshpp-rule-meta" },
            [
              item.userInvocable ? t("skills.call.slash", { cmd: "/" + item.id }) : t("skills.call.userOff"),
              item.modelInvocable ? t("skills.call.model") : t("skills.call.modelOff")
            ].join(" \xB7 ")
          ) : null
        ),
        h(
          "div",
          { className: "dshpp-rule-ops" },
          h(
            Btn,
            {
              tiny: true,
              kind: "danger",
              disabled: busy,
              onClick: (e) => {
                e.stopPropagation();
                if (!window.confirm(t("confirm.delete.skill", { id: item.id })))
                  return;
                if (editId === item.id) clearEditor();
                doPost("delete", { id: item.id });
              }
            },
            t("delete")
          )
        )
      );
    });
  }
  return h(
    "section",
    { className: "dshpp-panel", "aria-label": t("skills.title") },
    h(
      "div",
      { className: "dshpp-head" },
      h("h3", { className: "dshpp-title" }, t("skills.title")),
      h(
        "div",
        { className: "dshpp-row", style: { margin: 0 } },
        noticeNode(notice)
      )
    ),
    h(
      "p",
      {
        className: "dshpp-hint",
        style: { margin: "0 0 10px", color: "var(--dshpp-mute)", fontSize: 12 }
      },
      hostText(t, "skills.hint", hostSurfaceOf())
    ),
    h(
      "div",
      { className: "dshpp-split" },
      h(
        "div",
        { className: "dshpp-rulelist" },
        h("div", { className: "dshpp-rulebody" }, list),
        h(
          "div",
          { className: "dshpp-create" },
          h(
            "div",
            { className: "dshpp-create-row" },
            h("input", {
              ref: zipRef,
              type: "file",
              accept: ".zip,.tgz,.tar.gz,.tar,.skill",
              style: { display: "none" },
              onChange: (e) => {
                const file = e.target.files && e.target.files[0];
                e.target.value = "";
                importZip(file);
              }
            }),
            h("input", {
              ref: (el) => {
                folderRef.current = el;
                if (!el) return;
                el.setAttribute("webkitdirectory", "");
                el.setAttribute("directory", "");
                el.multiple = true;
              },
              type: "file",
              multiple: true,
              style: { display: "none" },
              onChange: (e) => {
                const files = Array.from(e.target && e.target.files || []);
                e.target.value = "";
                importFolder(files);
              }
            }),
            h(
              Btn,
              {
                kind: "primary",
                tiny: true,
                disabled: busy,
                onClick: () => zipRef.current && zipRef.current.click()
              },
              t("btn.importZip")
            ),
            h(
              Btn,
              {
                tiny: true,
                disabled: busy,
                onClick: () => folderRef.current && folderRef.current.click()
              },
              t("btn.importFolder")
            )
          )
        )
      ),
      h(
        "div",
        { className: "dshpp-editor" },
        editId ? [
          h(
            "div",
            { key: "meta", className: "dshpp-row" },
            h("input", {
              className: "dshpp-field",
              placeholder: t("ph.skill.desc"),
              value: editDesc,
              onChange: (e) => setEditDesc(e.target.value)
            })
          ),
          h("textarea", {
            key: "body",
            className: "dshpp-area",
            value: content,
            onChange: (e) => setContent(e.target.value),
            spellCheck: false,
            placeholder: ""
          }),
          h(
            "div",
            { key: "save", className: "dshpp-row" },
            h(
              Btn,
              {
                kind: "primary",
                disabled: busy,
                onClick: () => doPost("save", {
                  id: editId,
                  content,
                  description: editDesc
                })
              },
              t("btn.saveSkill")
            ),
            noticeNode(notice)
          )
        ] : h("div", { className: "dshpp-editor-empty" }, t("skills.pick"))
      )
    )
  );
}

// src/components/settings-shell.js
function CompatibilityNote({ status }) {
  if (false) return h(CommunityCompatibilityNote);
  if (!status) return null;
  const v = String(status.plugin_version || "");
  const valid = typeof status.patches_total === "number" && !!v;
  if (valid && v === "1.1.71") return null;
  return h(
    "p",
    {
      role: "status",
      className: "dshpp-hint",
      style: { margin: "0 20px 10px" }
    },
    valid ? "\uACF5\uC2DD \uBC84\uC804 " + v + ". \uC774 UI \uB294 1.1.71 \uC5D0\uC11C \uAC80\uC99D\uD588\uC2B5\uB2C8\uB2E4. \uC124\uC815\uC774 \uC774\uC0C1\uD558\uBA74 UI \uD50C\uB7EC\uADF8\uC778\uC744 \uC5C5\uB370\uC774\uD2B8\uD558\uC138\uC694." : "\uACF5\uC2DD Purge \uC778\uD130\uD398\uC774\uC2A4\uB97C \uD655\uC778\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uACF5\uC2DD \uD50C\uB7EC\uADF8\uC778\uC774 \uD65C\uC131\uD654\uB418\uC5B4 \uC788\uB294\uC9C0 \uD655\uC778\uD558\uAC70\uB098 UI \uD50C\uB7EC\uADF8\uC778\uC744 \uC5C5\uB370\uC774\uD2B8\uD558\uC138\uC694."
  );
}
function SettingsRoot(props = {}) {
  const t = typeof props.t === "function" ? props.t : useT();
  const [page, setPage] = useState("status");
  const [backendStatus, setBackendStatus] = useState(null);
  const st = useDock();
  const [visited, setVisited] = useState({ status: true });
  const select = (id) => {
    setPage(id);
    setVisited((v) => ({ ...v, [id]: true }));
  };
  useEffect(() => {
    if (st.tab === "drill" && st.open) select("drill");
  }, [st.tab, st.open]);
  setTranslate(t);
  return h(
    "div",
    { className: "dshpp-native dshpp-root" },
    h("style", null, base_default + native_default),
    h(
      "header",
      { className: "dshpp-native-head" },
      h("div", null, h("h2", null, "Purge"), h("p", null, "\uD50C\uB7EC\uADF8\uC778 \uC124\uC815")),
      h(
        "span",
        { className: "dshpp-native-badge" },
        (false ? "\uCEE4\uBBA4\uB2C8\uD2F0\uD310 " : "\uB3C5\uB9BD UI ") + "1.1.2"
      )
    ),
    h(CompatibilityNote, { status: backendStatus }),
    h(
      "nav",
      { className: "dshpp-native-nav", "aria-label": "Purge \uC124\uC815 \uBD84\uB958" },
      [
        ["status", "\uC0C1\uD0DC"],
        ["prompt", "\uD504\uB86C\uD504\uD2B8"],
        ["rules", "\uADDC\uCE59"],
        ["skills", "\uC2A4\uD0AC"],
        ["more", "\uB354 \uBCF4\uAE30"]
      ].map(
        ([id, label]) => h(
          "button",
          {
            key: id,
            type: "button",
            "aria-pressed": page === id,
            onClick: () => select(id)
          },
          label
        )
      )
    ),
    h(
      "div",
      { className: "dshpp-native-content" },
      false ? h(CommunityMaintenance) : null,
      h(
        "div",
        { hidden: !["status", "prompt", "more"].includes(page) },
        h(PurgifySection, { page, onStatus: setBackendStatus })
      ),
      visited.rules ? h("div", { hidden: page !== "rules" }, h(RulesSection)) : null,
      visited.skills ? h("div", { hidden: page !== "skills" }, h(SkillsSection)) : null,
      h(
        "div",
        { hidden: page !== "more", className: "dshpp-more" },
        h("h3", null, "\uB4DC\uB9B4 \uCF58\uC194"),
        h("p", null, "\uD50C\uB7EC\uADF8\uC778\uC5D0 \uC6D0\uB798 \uC788\uB358 \uB4DC\uB9B4 \uB3C4\uAD6C\uC640 \uD658\uACBD \uC124\uC815\uC744 \uC5FD\uB2C8\uB2E4."),
        h(
          Btn,
          {
            onClick: () => {
              select("drill");
              requestDrill("tab");
            }
          },
          "\uB4DC\uB9B4 \uCF58\uC194 \uC5F4\uAE30"
        ),
        h(
          "p",
          { className: "dshpp-attribution" },
          false ? "YuJunZhiXue/dsh-purge 1.1.71 \uAE30\uBC18 \uB3C5\uB9BD \uC720\uC9C0, \uC6D0\uC800\uC790 \uD45C\uAE30 \uBCF4\uC874. \uC5C5\uB370\uC774\uD2B8\uB294 \uC774 fork \uC5D0\uC11C\uB9CC \uC635\uB2C8\uB2E4." : "UI \uB3C5\uB9BD \uC720\uC9C0. \uACF5\uC2DD Purge \uB294 \uB530\uB85C \uC5C5\uB370\uC774\uD2B8\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. YuJunZhiXue/dsh-purge 1.1.71 \uAE30\uBC18(MIT)."
        )
      ),
      page === "drill" ? h(
        "div",
        { className: "dshpp-native-drill" },
        // 드릴 콘솔은 자체 CSS(.rt-*)를 쓴다. 옛 버전은 dock 이 <head> 에 주입했지만 재구성 때 빠져서,
        // 결과 패널이 오른쪽 사이드바에서 스타일 없이 글자가 한 열로 눌렸다. 여기서 컴포넌트와 함께 붙인다.
        __dshPurgeDrill && __dshPurgeDrill.CSS ? h("style", { "data-dsh-purge-drill": "1" }, __dshPurgeDrill.CSS) : null,
        h(
          Btn,
          {
            onClick: () => {
              setDock({ tab: "clean" });
              select("more");
            }
          },
          "\uC124\uC815\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"
        ),
        readDrillAuth() ? h(__dshPurgeDrill.Panel, { embedded: true }) : h("p", null, "\uBA3C\uC800 \uB4DC\uB9B4 \uCF58\uC194 \uC2B9\uC778\uC744 \uB9C8\uCCD0\uC57C \uD569\uB2C8\uB2E4.")
      ) : null
    )
  );
}

// src/components/page.js
var TABS = [
  ["status", "\uC0C1\uD0DC", "\uD638\uC2A4\uD2B8 \uD638\uD658, \uD328\uCE58, \uD0C8\uC625 \uC790\uCCB4 \uC810\uAC80"],
  ["prompt", "\uD504\uB86C\uD504\uD2B8", "\uC8FC\uC785 \uBCF8\uBB38\uACFC \uD0C8\uC625 \uAC15\uD654 \uC139\uC158"],
  ["rules", "\uADDC\uCE59", "\uADDC\uCE59 \uC138\uD2B8\uC640 \uC6CC\uD06C\uC2A4\uD398\uC774\uC2A4 \uC815\uCC45"],
  ["skills", "\uC2A4\uD0AC", "DSH \uC2A4\uD0AC \uCE74\uD0C8\uB85C\uADF8"],
  ["drill", "\uB4DC\uB9B4 \uCF58\uC194", "\uB808\uB4DC\uD300 \uB4DC\uB9B4\uACFC \uD658\uACBD \uC801\uC751"],
  ["more", "\uB354 \uBCF4\uAE30", "\uC11C\uBC84 \uBAA9\uB85D, \uC5C5\uB370\uC774\uD2B8, \uC720\uC9C0\uBCF4\uC218"]
];
function PurgeGlyph({ size = 18 } = {}) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      "aria-hidden": true
    },
    h("path", { d: "M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6l7-3z" }),
    h("path", { d: "M9.5 12.2l1.8 1.8 3.4-3.6" })
  );
}
function StatusStrip({ info }) {
  const compat = info?.compatibility || {};
  const level = compat.level || "";
  const ok = level === "qualified";
  return h(
    "div",
    { className: "dshpp-strip" },
    h(
      "span",
      { className: "dshpp-strip-item" },
      h("i", {
        className: "dshpp-dot " + (ok ? "is-ok" : level ? "is-warn" : "")
      }),
      "DSH ",
      h("b", null, compat.host_version || "\u2026")
    ),
    h(
      "span",
      { className: "dshpp-strip-item" },
      "\uD638\uD658 \uC218\uC900 ",
      h(
        "b",
        null,
        level === "qualified" ? "\uD68C\uADC0 \uAC80\uC99D\uB428" : level === "unverified" ? "\uBBF8\uAC80\uC99D \uBC84\uC804" : level === "mixed" ? "\uCEF4\uD3EC\uB10C\uD2B8 \uBC84\uC804 \uBD88\uC77C\uCE58" : level ? "\uD638\uC2A4\uD2B8 \uBBF8\uD0D0\uC9C0" : info?.ok === false ? "\uC77D\uAE30 \uC2E4\uD328" : "\uD655\uC778 \uC911"
      ),
      h(
        HelpTip,
        { title: "\uD638\uD658 \uC218\uC900" },
        compat.message || "\uD638\uC2A4\uD2B8 \uCEF4\uD3EC\uB10C\uD2B8 \uBC84\uC804\uC744 \uC77D\uACE0 \uACB0\uB860\uC744 \uB0C5\uB2C8\uB2E4. qualified \uB294 \uD574\uB2F9 DSH \uBC84\uC804\uC758 \uD328\uCE58 \uC575\uCEE4\uB97C \uD56D\uBAA9\uBCC4\uB85C \uD68C\uADC0 \uAC80\uC99D\uD588\uB2E4\uB294 \uB73B\uC785\uB2C8\uB2E4."
      )
    ),
    h(
      "span",
      { className: "dshpp-strip-item" },
      "\uB514\uC2A4\uD06C \uAE30\uB85D \uC218 ",
      h(
        "b",
        null,
        `${info?.patches_applied ?? "?"}/${info?.patches_total ?? "?"}`,
        info?.patches_na > 0 ? ` \xB7 ${info.patches_na}\uAC74 \uC774 \uCEF4\uD4E8\uD130\uC5D0 \uD574\uB2F9 \uC5C6\uC74C` : ""
      ),
      h(
        HelpTip,
        { title: "\uD638\uC2A4\uD2B8 \uD328\uCE58" },
        `\uC2E4\uC81C\uB85C DSH \uD638\uC2A4\uD2B8 \uCF54\uB4DC\uC5D0 \uAE30\uB85D\uB41C \uD328\uCE58 \uC218(\uBD84\uBAA8\uB294 \uC774 \uCEF4\uD4E8\uD130\uC5D0 \uD574\uB2F9\uD558\uB294 \uD56D\uBAA9\uB9CC). \uC804\uCCB4 \uD328\uCE58 ${info?.patches_total_all ?? "?"}\uAC74 \uC911 ${info?.patches_na ?? 0}\uAC74\uC740 \uB300\uC0C1 \uD50C\uB7EC\uADF8\uC778/\uD504\uB9AC\uC14B\uC774 \uC124\uCE58\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. '\uC801\uC6A9 \uB300\uAE30'\uB294 \uC575\uCEE4\uAC00 \uB0A8\uC544 \uC788\uACE0 \uC544\uC9C1 \uC4F0\uC9C0 \uC54A\uC558\uB2E4\uB294 \uB73B\uC774\uACE0, '\uBD88\uC77C\uCE58'\uB294 \uD638\uC2A4\uD2B8 \uC18C\uC2A4\uAC00 \uBC14\uB00C\uC5B4 \uC575\uCEE4\uB97C \uB2E4\uC2DC \uCC3E\uC544\uC57C \uD55C\uB2E4\uB294 \uB73B\uC785\uB2C8\uB2E4.`
      )
    ),
    h(
      "span",
      { className: "dshpp-strip-item" },
      "\uD50C\uB7EC\uADF8\uC778 ",
      h("b", null, info?.plugin_version || "1.1.2")
    )
  );
}
function LayoutNotice({ info }) {
  if (!info || !info.asar_still_sealed && !info.host_layout) return null;
  const sealed = info.asar_still_sealed === true;
  const note = info.host_layout?.note || "\uB300\uC0C1 \uB514\uC2A4\uD06C\uC5D0 \uC544\uC9C1 app.asar \uAC00 \uC788\uACE0, \uD604\uC7AC \uD504\uB85C\uC138\uC2A4\uC758 \uB85C\uB4DC \uCD9C\uCC98\uB294 \uC544\uC9C1 \uD655\uC778\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.";
  const handoff = info.asar_handoff ? ` \uD328\uD0A4\uC9C0 \uAD50\uCCB4 \uC0C1\uD0DC: ${{ not_scheduled: "\uC544\uC9C1 \uC801\uC6A9\uB418\uC9C0 \uC54A\uC74C. '\uC801\uC6A9'\uC744 \uB20C\uB7EC\uC57C \uD328\uD0A4\uC9C0 \uAD50\uCCB4\uAC00 \uC608\uC57D\uB429\uB2C8\uB2E4", archive_reappeared: "\uC544\uCE74\uC774\uBE0C\uAC00 \uB2E4\uC2DC \uB098\uD0C0\uB0AC\uC2B5\uB2C8\uB2E4. \uC61B \uAD50\uCCB4 \uAE30\uB85D\uC740 \uD604\uC7AC \uC644\uB8CC\uB97C \uB73B\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4", backup_missing: "\uC6D0\uBCF8 \uC544\uCE74\uC774\uBE0C \uBC31\uC5C5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC9C4\uB2E8\uC744 \uD655\uC778\uD558\uC138\uC694", unknown_target: "\uB300\uC0C1 \uC778\uC2A4\uD134\uC2A4\uAC00 \uD655\uC815\uB418\uC9C0 \uC54A\uC74C", unreadable: "\uAD50\uCCB4 \uAE30\uB85D\uC744 \uC77D\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC9C4\uB2E8\uC744 \uD655\uC778\uD558\uC138\uC694", starting: "\uB3C4\uC6B0\uBBF8 \uC2DC\uC791 \uC911(\uC900\uBE44 \uD655\uC778 \uC804)", ready: "\uB3C4\uC6B0\uBBF8 \uC900\uBE44 \uC644\uB8CC", waiting_for_quit: "\uC644\uC804 \uC885\uB8CC \uB300\uAE30(macOS \u2318Q / Windows \uC2DC\uC2A4\uD15C \uD2B8\uB808\uC774)", waiting_for_unlock: "\uC544\uCE74\uC774\uBE0C \uC7A0\uAE08 \uD574\uC81C \uB300\uAE30", moving: "\uC6D0\uBCF8 \uC544\uCE74\uC774\uBE0C \uBCF4\uC874 \uC911", complete: "\uAD50\uCCB4 \uC644\uB8CC. DSH \uB97C \uC9C1\uC811 \uC5EC\uC138\uC694", already_unsealed: "\uC544\uCE74\uC774\uBE0C\uB97C \uC62E\uACBC\uC2B5\uB2C8\uB2E4. DSH \uB97C \uC9C1\uC811 \uC5EC\uC138\uC694", failed: "\uC2E4\uD328. \uC9C4\uB2E8\uC744 \uD655\uC778\uD558\uACE0 \uBCF5\uAD6C \uBB38\uC11C\uC5D0 \uB530\uB77C \uC870\uCE58\uD558\uC138\uC694", expired: "\uB300\uAE30 \uC2DC\uAC04 \uCD08\uACFC. \uB2E4\uC2DC \uC801\uC6A9\uD558\uAC70\uB098 \uBCF5\uAD6C \uBB38\uC11C\uC5D0 \uB530\uB77C \uC870\uCE58\uD558\uC138\uC694", helper_stopped: "\uB3C4\uC6B0\uBBF8\uAC00 \uC608\uAE30\uCE58 \uC54A\uAC8C \uC885\uB8CC\uB410\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC801\uC6A9\uD558\uAC70\uB098 \uBCF5\uAD6C \uBB38\uC11C\uC5D0 \uB530\uB77C \uC870\uCE58\uD558\uC138\uC694" }[info.asar_handoff.phase] || info.asar_handoff.phase}.` : "";
  const failure = info.asar_handoff?.error;
  const detail = info.asar_handoff?.detail ? ` \uC0C1\uC138: ${info.asar_handoff.detail}${failure?.win32_code != null ? `(Windows \uC624\uB958 ${failure.win32_code})` : ""}` : "";
  const confirmed = info.host_layout?.state === "unpacked_entry" && info.host_layout?.process?.matches_target === true && info.host_layout?.disk?.archive_exists === false;
  const diskNote = info.host_layout?.disk?.archive_exists === true ? " \uB300\uC0C1 \uB514\uC2A4\uD06C\uC5D0 \uC544\uC9C1 app.asar \uAC00 \uC788\uC2B5\uB2C8\uB2E4." : "";
  if (sealed || !confirmed) {
    return h(
      "p",
      { className: "dshpp-warn", role: "status" },
      note,
      diskNote,
      handoff,
      detail
    );
  }
  return h(
    "details",
    { className: "dshpp-layout-details" },
    h("summary", null, "\u2713 \uC5B8\uD329 \uB514\uB809\uD130\uB9AC\uC5D0\uC11C \uC2DC\uC791\uB428(\uD328\uD0A4\uC9C0 \uAD50\uCCB4 \uC644\uB8CC)"),
    h("p", { className: "dshpp-note" }, note, diskNote, handoff, detail)
  );
}
function VersionNotice({ info }) {
  if (info && info.ok === false) {
    return h(
      "p",
      { className: "dshpp-warn", role: "status" },
      `\uC0C1\uD0DC \uC77D\uAE30 \uC2E4\uD328: ${info.error || "\uC778\uD130\uD398\uC774\uC2A4 \uC0AC\uC6A9 \uBD88\uAC00"}. \uD604\uC7AC \uD638\uC2A4\uD2B8\uC640 \uD328\uCE58 \uC0C1\uD0DC\uB97C \uC54C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. '\uC0C8\uB85C \uACE0\uCE68'\uC744 \uB2E4\uC2DC \uB20C\uB7EC \uBCF4\uACE0, \uACC4\uC18D \uC2E4\uD328\uD558\uBA74 \uC6B4\uC601\uCCB4\uC81C, DSH/\uD50C\uB7EC\uADF8\uC778 \uBC84\uC804\uACFC \uC774 \uC624\uB958\uB97C \uC54C\uB824 \uC8FC\uC138\uC694.`
    );
  }
  const backend = info?.plugin_version;
  if (!backend || backend === "1.1.2") return null;
  return h(
    "p",
    { className: "dshpp-warn", role: "status" },
    `\uACF5\uC2DD \uBC84\uC804 ${backend}, UI ${"1.1.2"}. \uB458\uC774 \uB2E4\uB974\uBA74 \uC124\uC815\uC774 \uC801\uC6A9\uB418\uC9C0 \uC54A\uC744 \uC218 \uC788\uC73C\uB2C8, \uAC19\uC740 \uBC84\uC804\uC73C\uB85C \uC5C5\uB370\uC774\uD2B8\uD55C \uB4A4 DSH \uB97C \uC7AC\uC2DC\uC791\uD558\uC138\uC694.`
  );
}
function PurgePage() {
  const t = useT();
  const [tab, setTab] = useState("status");
  const [visited, setVisited] = useState({ status: true });
  const [info, setInfo] = useState(null);
  const select = (id) => {
    setTab(id);
    setVisited((v) => Object.assign({}, v, { [id]: true }));
  };
  const loadInfo = () => apiJson("/dsh-purge/status").then(setInfo).catch((error) => setInfo(unavailableStatus(error)));
  const mergeInfo = useCallback((s) => s && setInfo(s), []);
  useEffect(() => {
    if (tab === "status") loadInfo();
  }, [tab]);
  useEffect(() => {
    const phase = info?.asar_handoff?.phase;
    if (![
      "starting",
      "ready",
      "waiting_for_quit",
      "waiting_for_unlock",
      "moving"
    ].includes(phase))
      return;
    const timer = setInterval(loadInfo, 2e3);
    return () => clearInterval(timer);
  }, [info?.asar_handoff?.phase]);
  const active = TABS.find((row) => row[0] === tab) || TABS[0];
  return h(
    "div",
    { className: "dshpp-page" },
    h("style", null, base_default + native_default + page_default),
    h(
      "header",
      { className: "dshpp-page-head" },
      h("span", { className: "dshpp-page-glyph" }, h(PurgeGlyph, { size: 20 })),
      h(
        "div",
        { className: "dshpp-page-title" },
        h("h1", null, "Purge"),
        h(
          "p",
          null,
          active[2],
          false ? h(
            "span",
            { className: "dshpp-page-ver" },
            "\uCEE4\uBBA4\uB2C8\uD2F0\uD310 1.1.2"
          ) : null
        )
      )
    ),
    h(StatusStrip, { info }),
    h(VersionNotice, { info }),
    h(LayoutNotice, { info }),
    h(
      "nav",
      { className: "dshpp-page-tabs", role: "tablist" },
      TABS.map(
        ([id, label]) => h(
          "button",
          {
            key: id,
            type: "button",
            role: "tab",
            "aria-selected": tab === id ? "true" : "false",
            className: tab === id ? "is-on" : "",
            onClick: () => select(id)
          },
          label
        )
      )
    ),
    h(
      "div",
      { className: "dshpp-page-body" },
      h(
        "div",
        { hidden: tab !== "status", className: "dshpp-sec" },
        h(PurgifySection, { page: "status", onStatus: mergeInfo }),
        h(StatusExtras),
        h(CommunityMaintenance)
      ),
      h(
        "div",
        { hidden: tab !== "prompt", className: "dshpp-sec" },
        visited.prompt ? h(PurgifySection, { page: "prompt" }) : null
      ),
      h(
        "div",
        { hidden: tab !== "rules", className: "dshpp-sec" },
        visited.rules ? h(RulesSection) : null
      ),
      h(
        "div",
        { hidden: tab !== "skills", className: "dshpp-sec" },
        visited.skills ? h(SkillsSection) : null
      ),
      h(
        "div",
        { hidden: tab !== "more", className: "dshpp-sec" },
        visited.more ? h(PurgifySection, { page: "more" }) : null
      ),
      tab === "drill" ? h(
        "div",
        { className: "dshpp-sec dshpp-page-drill" },
        __dshPurgeDrill && __dshPurgeDrill.CSS ? h("style", { "data-dsh-purge-drill": "1" }, __dshPurgeDrill.CSS) : null,
        readDrillAuth() ? h(__dshPurgeDrill.Panel, { embedded: true }) : h(
          "div",
          { className: "dshpp-card" },
          h(
            "p",
            { className: "dshpp-muted" },
            "\uB4DC\uB9B4 \uCF58\uC194\uC740 \uBA3C\uC800 \uD55C \uBC88 \uC2B9\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."
          ),
          h(
            Btn,
            {
              kind: "primary",
              onClick: () => {
                setDock({ tab: "drill", authOpen: true });
                requestDrill("auth");
              }
            },
            "\uC2B9\uC778\uD558\uB7EC \uAC00\uAE30"
          )
        )
      ) : null
    ),
    h(
      "footer",
      { className: "dshpp-page-foot" },
      false ? "YuJunZhiXue/dsh-purge 1.1.71 \uAE30\uBC18 \uB3C5\uB9BD \uC720\uC9C0 \xB7 MIT \xB7 \uC6D0\uC800\uC790 \uD45C\uAE30 \uC720\uC9C0" : "UI \uB3C5\uB9BD \uC720\uC9C0 \xB7 YuJunZhiXue/dsh-purge 1.1.71 \uAE30\uBC18(MIT)"
    )
  );
}

// src/state/legacy-visibility.js
var ENTRY_CSS = ".dshp-launch,.dshp-hero-chip,.dshp-tab-chip,.dshp-dock{display:none!important}";
function installLegacyVisibility(doc = globalThis.document) {
  if (!doc?.head) return () => {
  };
  const style = doc.createElement("style");
  style.setAttribute("data-dsh-purge-panel-visibility", "1");
  style.textContent = ENTRY_CSS;
  doc.head.append(style);
  return () => style.remove();
}

// src/state/rewind-draft.js
var DRAFT_KEY = "dshp-rewind-draft:";
var ARM_KEY = "dshp-rewind-arm:";
var FILL_DELAYS = [0, 50, 180, 400, 800];
var ARM_TTL_MS = 45 * 1e3;
var seenAt = 0;
var host2 = null;
var workspace = null;
var conversation = null;
var pendingComposer = { sessionId: "", text: "", at: 0 };
var armedFill = { sessionId: "", text: "", at: 0 };
function storage() {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    return null;
  }
}
function bindRewindHost(ctx) {
  host2 = ctx || null;
  workspace = ctx && ctx.uiWorkspace || null;
  conversation = ctx && ctx.conversation || null;
}
function hostSessions() {
  return host2 && host2.sessions || null;
}
function getRewindSeenAt() {
  return seenAt;
}
function noteRewindAt(at) {
  if (at) seenAt = at;
}
function rewindText(t, key, fallback) {
  try {
    if (typeof t === "function") {
      const value = t(key);
      if (value && value !== key) return value;
    }
  } catch {
  }
  return fallback;
}
function currentSessionId(sessions) {
  try {
    const selected = workspace?.selection?.getSnapshot?.()?.sessionId;
    if (typeof selected === "string" && selected) return selected;
  } catch {
  }
  try {
    const snap = (sessions?.list || host2?.sessions?.list)?.getSnapshot?.();
    if (typeof snap?.current === "string" && snap.current) return snap.current;
  } catch {
  }
  return "";
}
function sessionKnown(sessions, sessionId) {
  try {
    const snap = sessions?.list?.getSnapshot?.();
    if (!snap || !sessionId) return false;
    if (snap.byId && Object.prototype.hasOwnProperty.call(snap.byId, sessionId))
      return true;
    if (Array.isArray(snap.ids) && snap.ids.includes(sessionId)) return true;
  } catch {
  }
  return false;
}
function waitMs(ms) {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.setTimeout)
      window.setTimeout(resolve, ms);
    else setTimeout(resolve, ms);
  });
}
function isPluginDraft(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  return /^\[MNEMON\]/i.test(value) || /MNEMON RUNTIME MEMORY SNAPSHOT/i.test(value) || /^MNEMON VIEW TOOLS/im.test(value);
}
function writeDraft(sessionId, text) {
  if (!sessionId) return;
  const value = isPluginDraft(text) ? "" : text || "";
  pendingComposer = { sessionId, text: value, at: Date.now() };
  try {
    storage()?.setItem(DRAFT_KEY + sessionId, value);
  } catch {
  }
}
function peekDraft(sessionId) {
  if (!sessionId) return "";
  if (pendingComposer.sessionId === sessionId && pendingComposer.text)
    return pendingComposer.text;
  try {
    return storage()?.getItem(DRAFT_KEY + sessionId) || "";
  } catch {
    return "";
  }
}
function clearStoredDraft(sessionId) {
  if (!sessionId) return;
  if (pendingComposer.sessionId === sessionId)
    pendingComposer = { sessionId: "", text: "", at: 0 };
  try {
    storage()?.removeItem(DRAFT_KEY + sessionId);
  } catch {
  }
  try {
    storage()?.removeItem(ARM_KEY + sessionId);
  } catch {
  }
}
function armComposerFill(sessionId, text) {
  if (!sessionId || !text || isPluginDraft(text)) return;
  const at = Date.now();
  armedFill = { sessionId, text, at };
  writeDraft(sessionId, text);
  try {
    storage()?.setItem(ARM_KEY + sessionId, String(at));
  } catch {
  }
}
function takeArmedFill(sessionId) {
  if (!sessionId) return "";
  let text = "";
  let at = 0;
  if (armedFill.sessionId === sessionId && armedFill.text) {
    text = armedFill.text;
    at = armedFill.at;
  } else {
    text = peekDraft(sessionId);
    try {
      at = Number(storage()?.getItem(ARM_KEY + sessionId) || 0);
    } catch {
      at = 0;
    }
  }
  if (!text || !at || Date.now() - at > ARM_TTL_MS) {
    if (text && (!at || Date.now() - at > ARM_TTL_MS))
      clearStoredDraft(sessionId);
    return "";
  }
  clearStoredDraft(sessionId);
  armedFill = { sessionId: "", text: "", at: 0 };
  return text;
}
function conversationFace() {
  if (conversation) return conversation;
  if (host2?.conversation) return host2.conversation;
  if (typeof host2?.get === "function") {
    try {
      return host2.get("conversation");
    } catch {
      return void 0;
    }
  }
  return void 0;
}
function conversationInput(sessionId) {
  try {
    const input = conversationFace()?.input;
    if (!input || !sessionId) return null;
    if (typeof input.shell === "function") {
      try {
        return input.shell(sessionId);
      } catch {
      }
    }
    const sessions = host2?.sessions;
    const actx = typeof sessions?.scope === "function" ? sessions.scope(sessionId) : void 0;
    if (typeof input.for === "function" && actx) return input.for(actx);
    return null;
  } catch {
    return null;
  }
}
function liveDraft(sessionId, inputActions) {
  try {
    const fromActions = inputActions?.state?.getSnapshot?.()?.draft;
    if (typeof fromActions === "string") return fromActions;
  } catch {
  }
  try {
    const draft = conversationInput(sessionId)?.state?.getSnapshot?.()?.draft;
    if (typeof draft === "string") return draft;
  } catch {
  }
  return "";
}
function hostSetDraft(sessionId, text) {
  if (!sessionId) return false;
  try {
    const input = conversationInput(sessionId);
    if (input && typeof input.setDraft === "function") {
      input.setDraft(text || "");
      return true;
    }
  } catch {
  }
  return false;
}
function fillComposer(inputActions, text) {
  if (inputActions && typeof inputActions.setDraft === "function") {
    try {
      inputActions.setDraft(text || "");
    } catch {
    }
  }
}
function scheduleComposerFill(sessionId, text, inputActions) {
  if (!sessionId || !text || isPluginDraft(text)) return () => {
  };
  let stopped = false;
  let filled = false;
  const timers = [];
  const setTimer = typeof window !== "undefined" && window.setTimeout ? (fn, ms) => window.setTimeout(fn, ms) : (fn, ms) => setTimeout(fn, ms);
  const clearTimer = typeof window !== "undefined" && window.clearTimeout ? (id) => window.clearTimeout(id) : (id) => clearTimeout(id);
  const tryFill = () => {
    if (stopped) return;
    const current = liveDraft(sessionId, inputActions);
    if (filled && current !== text) {
      stopped = true;
      return;
    }
    if (current && current !== text) {
      stopped = true;
      return;
    }
    fillComposer(inputActions, text);
    hostSetDraft(sessionId, text);
    filled = true;
  };
  for (const ms of FILL_DELAYS) timers.push(setTimer(tryFill, ms));
  return () => {
    stopped = true;
    for (const id of timers) {
      try {
        clearTimer(id);
      } catch {
      }
    }
  };
}
function scheduleEchoClear(sessionId, inputActions) {
  if (!sessionId) return () => {
  };
  let last = "";
  let stopped = false;
  const timers = [];
  const setTimer = typeof window !== "undefined" && window.setTimeout ? (fn, ms) => window.setTimeout(fn, ms) : (fn, ms) => setTimeout(fn, ms);
  const clearTimer = typeof window !== "undefined" && window.clearTimeout ? (id) => window.clearTimeout(id) : (id) => clearTimeout(id);
  const tryClear = () => {
    if (stopped || !last) return;
    const current = String(liveDraft(sessionId, inputActions) || "").trim();
    if (!current) {
      stopped = true;
      return;
    }
    if (current !== last) return;
    fillComposer(inputActions, "");
    hostSetDraft(sessionId, "");
    clearStoredDraft(sessionId);
    stopped = true;
  };
  apiJson("/dsh-purge/last-user?sessionId=" + encodeURIComponent(sessionId)).then((data) => {
    if (stopped) return;
    last = String(data?.text || "").trim();
    if (!last || isPluginDraft(last)) return;
    tryClear();
    for (const ms of [0, 50, 180, 400]) timers.push(setTimer(tryClear, ms));
  }).catch(() => {
  });
  return () => {
    stopped = true;
    for (const id of timers) {
      try {
        clearTimer(id);
      } catch {
      }
    }
  };
}
async function dropInheritedQueue(sessions, sessionId) {
  if (!sessions || !sessionId) return;
  const drop = async () => {
    try {
      const actx = typeof sessions.scope === "function" ? sessions.scope(sessionId) : void 0;
      const face = typeof sessions.sessionOf === "function" ? sessions.sessionOf(actx) : void 0;
      const queue = face?.getSnapshot?.()?.queue || [];
      for (const item of queue) {
        const id = item?.id || item?.itemId;
        if (!id) continue;
        try {
          await face.updateQueue?.(id, { kind: "remove" });
        } catch {
        }
      }
    } catch {
    }
  };
  await drop();
  if (typeof window !== "undefined" && window.setTimeout)
    window.setTimeout(() => {
      drop();
    }, 80);
}
async function openRewoundSession(sessions, sessionId) {
  if (!sessionId) return;
  let lastError = null;
  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (sessions && typeof sessions.refresh === "function" && !sessionKnown(sessions, sessionId)) {
      try {
        await sessions.refresh();
      } catch (error) {
        lastError = error;
      }
    }
    const known = sessionKnown(sessions, sessionId);
    if (known || typeof sessions?.open === "function") {
      try {
        if (workspace && typeof workspace.openSession === "function") {
          workspace.openSession(sessionId);
        } else if (typeof sessions?.open === "function") {
          sessions.open(sessionId);
        } else {
          throw new Error("\uB418\uB3CC\uB9AC\uAE30 \uD6C4 \uC138\uC158\uC744 \uC5F4 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4");
        }
        const selected = workspace?.selection?.getSnapshot?.()?.sessionId;
        if (!workspace || selected === sessionId) {
          await dropInheritedQueue(sessions, sessionId);
          if (typeof window !== "undefined" && window.setTimeout)
            window.setTimeout(() => {
              dropInheritedQueue(sessions, sessionId);
            }, 250);
          return;
        }
      } catch (error) {
        lastError = error;
      }
    }
    await waitMs(120);
  }
  throw new Error(
    lastError && lastError.message || "\uB418\uB3CC\uB9AC\uAE30 \uD6C4 \uC138\uC158\uC774 \uC5F4\uB9AC\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4"
  );
}

// src/components/rewind.js
var REWIND_CSS = `
.dshp-rewind-wrap{position:relative;display:inline-flex}
.dshp-rewind{appearance:none;display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,currentColor);font:12px/1 var(--ds-font-sans,system-ui,sans-serif);cursor:pointer}
.dshp-rewind:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12));color:var(--dsw-alias-label-primary,currentColor)}
.dshp-rewind:disabled{opacity:.4;cursor:default}
.dshp-rewind svg{display:block}
.dshp-rewind-menu{position:fixed;z-index:2147483000;box-sizing:border-box;min-width:220px;padding:4px;border:0;border-radius:12px;background:var(--dsw-specific-menu,#fff);color:var(--dsw-alias-label-primary,#1a1a1a);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.16));transform:translateY(-100%)}
body[data-ds-dark-theme] .dshp-rewind-menu{background:var(--dsw-specific-menu,#32312d);color:var(--dsw-alias-label-primary,#e6e2db);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1,#3f3d38);box-shadow:var(--dsw-elevation-prominent,0 10px 28px rgba(0,0,0,.45))}
.dshp-rewind-item{display:flex;flex-direction:column;gap:2px;width:100%;padding:8px 10px;border:0;border-radius:8px;background:transparent;color:inherit;text-align:left;cursor:pointer;font:12px/1.3 var(--ds-font-sans,system-ui,sans-serif)}
.dshp-rewind-item:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
.dshp-rewind-item b{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dshp-rewind-item span{color:var(--dsw-alias-label-tertiary,#9a958c);font-size:11px}
body[data-ds-dark-theme] .dshp-rewind-item span{color:var(--dsw-alias-label-tertiary,#a8a39a)}
`;
function rewindMenuNode(t, menuPos, menuRef, runRewind) {
  return h(
    "div",
    {
      className: "dshp-rewind-menu",
      role: "menu",
      ref: menuRef,
      style: menuPos ? { left: menuPos.left + "px", top: menuPos.top + "px" } : { left: "8px", bottom: "48px", transform: "none" }
    },
    h(
      "button",
      {
        type: "button",
        className: "dshp-rewind-item",
        onMouseDown: (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          runRewind("once");
        }
      },
      h("b", null, rewindText(t, "rewind.once", "\uD55C \uBC88 \uB418\uB3CC\uB9AC\uAE30")),
      h(
        "span",
        null,
        rewindText(
          t,
          "rewind.once.hint",
          "\uC774\uBC88 \uB77C\uC6B4\uB4DC\uC5D0\uC11C \uBCF4\uB0B8 \uBB38\uC7A5\uC744 \uC785\uB825\uCC3D\uC5D0 \uB418\uB3CC\uB824 \uB193\uACE0, \uC774\uBC88 \uB77C\uC6B4\uB4DC\uB97C \uC9C0\uC6C1\uB2C8\uB2E4"
        )
      )
    ),
    h(
      "button",
      {
        type: "button",
        className: "dshp-rewind-item",
        onMouseDown: (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          runRewind("round");
        }
      },
      h("b", null, rewindText(t, "rewind.round", "\uC774\uC804 \uB77C\uC6B4\uB4DC \uB418\uB3CC\uB9AC\uAE30")),
      h(
        "span",
        null,
        rewindText(
          t,
          "rewind.round.hint",
          "\uC774\uBC88 \uB77C\uC6B4\uB4DC\uC5D0\uC11C \uBCF4\uB0B8 \uBB38\uC7A5\uC744 \uC785\uB825\uCC3D\uC5D0 \uB418\uB3CC\uB824 \uB193\uC2B5\uB2C8\uB2E4. \uC11C\uBE0C\uC5D0\uC774\uC804\uD2B8\uB3C4 \uC774\uBC88 \uB77C\uC6B4\uB4DC\uB9CC \uCCA0\uD68C\uD569\uB2C8\uB2E4"
        )
      )
    )
  );
}
var RewindFallback = class extends Component {
  constructor(p) {
    super(p);
    this.state = { menu: false, busy: false, notice: "", menuPos: null };
    this.wrap = null;
    this.menuEl = null;
    this.onDoc = (event) => {
      if (this.wrap && this.wrap.contains(event.target)) return;
      if (this.menuEl && this.menuEl.contains(event.target)) return;
      this.setState({ menu: false });
    };
  }
  componentDidMount() {
    if (typeof document !== "undefined" && document.addEventListener)
      document.addEventListener("mousedown", this.onDoc);
  }
  componentWillUnmount() {
    if (typeof document !== "undefined" && document.removeEventListener)
      document.removeEventListener("mousedown", this.onDoc);
  }
  run(mode) {
    const sessionId = this.props.sessionId || currentSessionId(hostSessions());
    if (!sessionId || this.state.busy) return;
    this.setState({ busy: true, menu: false, notice: "" });
    apiJson("/dsh-purge/rewind", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, mode })
    }).then(async (data) => {
      if (!data || !data.ok || !data.sessionId || data.cleared === false) {
        throw new Error(
          data && data.error || "\uC774\uC804\uC5D0 \uBCF4\uB0B8 \uB0B4\uC6A9\uC744 \uC9C0\uC6B0\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4"
        );
      }
      noteRewindAt(data.at);
      const text = isPluginDraft(data.text) ? "" : data.text || "";
      armComposerFill(data.sessionId, text);
      await openRewoundSession(hostSessions(), data.sessionId);
      scheduleComposerFill(data.sessionId, text);
      this.setState({ busy: false });
    }).catch((e) => {
      this.setState({
        busy: false,
        notice: "\uB418\uB3CC\uB9AC\uAE30 \uC2E4\uD328: " + String(e && e.message || e)
      });
    });
  }
  openMenu() {
    const rect = this.wrap && this.wrap.getBoundingClientRect ? this.wrap.getBoundingClientRect() : null;
    this.setState({
      menu: !this.state.menu,
      notice: "",
      menuPos: rect ? {
        left: Math.max(8, rect.right - 228),
        top: Math.max(8, rect.top - 8)
      } : null
    });
  }
  render() {
    const sessionId = this.props.sessionId || currentSessionId(hostSessions());
    const t = this.props.t || null;
    const label = this.state.busy ? "\uB418\uB3CC\uB9AC\uB294 \uC911\u2026" : this.state.notice ? this.state.notice.slice(0, 18) : "\uB418\uB3CC\uB9AC\uAE30";
    return h(
      "div",
      {
        className: "dshp-rewind-wrap",
        ref: (node) => {
          this.wrap = node;
        }
      },
      h("style", null, REWIND_CSS),
      h(
        "button",
        {
          type: "button",
          className: "dshp-rewind",
          disabled: this.state.busy || !sessionId,
          onMouseDown: (e) => e.preventDefault(),
          onClick: (e) => {
            e.preventDefault();
            this.openMenu();
          }
        },
        label
      ),
      this.state.menu ? rewindMenuNode(
        t,
        this.state.menuPos,
        (node) => {
          this.menuEl = node;
        },
        (mode) => this.run(mode)
      ) : null
    );
  }
};
var rewindVisible = true;
var rewindProbe = null;
function loadRewindVisibility() {
  if (!rewindProbe) {
    rewindProbe = apiJson("/dsh-purge/boost").then((r) => {
      rewindVisible = r && r.rewind !== false;
      return rewindVisible;
    }).catch(() => true);
  }
  return rewindProbe;
}
var RewindSafe = class extends Component {
  constructor(p) {
    super(p);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    try {
      console.error("[dsh-purge] rewind slot:", error);
    } catch {
    }
  }
  componentDidMount() {
    loadRewindVisibility().then((on) => {
      if (!on && !this.unmounted) this.forceUpdate();
    });
  }
  componentWillUnmount() {
    this.unmounted = true;
  }
  render() {
    if (!rewindVisible) return null;
    if (this.state.failed) return h(RewindFallback, this.props);
    return h(RewindButton, this.props);
  }
};
function RewindButton(props) {
  const fallbackT = useT();
  const t = props.t || fallbackT;
  const sessions = hostSessions();
  const inputActions = props.inputActions;
  const sessionId = props.sessionId || currentSessionId(sessions);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  useEffect(() => {
    if (!sessionId) return;
    const armed = takeArmedFill(sessionId);
    if (armed) {
      scheduleComposerFill(sessionId, armed, inputActions);
      return;
    }
    scheduleEchoClear(sessionId, inputActions);
  }, [sessionId, inputActions]);
  useEffect(() => {
    if (!menu) return;
    if (typeof document === "undefined" || !document.addEventListener)
      return void 0;
    const onDoc = (event) => {
      if (wrapRef.current && wrapRef.current.contains(event.target)) return;
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      setMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menu]);
  const runRewind = async (mode) => {
    if (!sessionId || busy) return;
    setBusy(true);
    setMenu(false);
    setNotice("");
    try {
      const data = await apiJson("/dsh-purge/rewind", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, mode })
      });
      if (!data || !data.ok || !data.sessionId || data.cleared === false) {
        throw new Error(
          data && data.error || "\uC774\uC804\uC5D0 \uBCF4\uB0B8 \uB0B4\uC6A9\uC744 \uC9C0\uC6B0\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4"
        );
      }
      noteRewindAt(data.at);
      const text = isPluginDraft(data.text) ? "" : data.text || "";
      armComposerFill(data.sessionId, text);
      await openRewoundSession(sessions, data.sessionId);
      scheduleComposerFill(data.sessionId, text);
    } catch (e) {
      const message = rewindText(
        t,
        "rewind.fail",
        "\uB418\uB3CC\uB9AC\uAE30 \uC2E4\uD328: {error}"
      ).replace("{error}", String(e && e.message || e));
      setNotice(message);
    } finally {
      setBusy(false);
    }
  };
  const onClick = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (!sessionId || busy) return;
    if (menu) {
      setMenu(false);
      return;
    }
    const rect = wrapRef.current?.getBoundingClientRect?.();
    if (rect) {
      setMenuPos({
        left: Math.max(8, rect.right - 228),
        top: Math.max(8, rect.top - 8)
      });
    }
    setNotice("");
    setMenu(true);
  };
  const failLabel = notice ? notice.length > 18 ? notice.slice(0, 18) + "\u2026" : notice : "";
  const label = busy ? rewindText(t, "rewind.busy", "\uB418\uB3CC\uB9AC\uB294 \uC911\u2026") : failLabel || rewindText(t, "rewind.label", "\uB418\uB3CC\uB9AC\uAE30");
  const title = notice || rewindText(t, "rewind.aria", "\uB418\uB3CC\uB9AC\uAE30");
  return h(
    "div",
    { className: "dshp-rewind-wrap", ref: wrapRef },
    h("style", null, REWIND_CSS),
    h(
      "button",
      {
        type: "button",
        className: "dshp-rewind",
        title,
        "aria-label": rewindText(t, "rewind.aria", "\uB418\uB3CC\uB9AC\uAE30"),
        "aria-expanded": menu ? "true" : "false",
        disabled: busy || !sessionId,
        onMouseDown: (e) => e.preventDefault(),
        onClick
      },
      h(
        "svg",
        {
          viewBox: "0 0 16 16",
          width: "14",
          height: "14",
          "aria-hidden": true
        },
        h("path", {
          fill: "currentColor",
          d: "M7.2 3.2 3.4 7l3.8 3.8V8.6c2.8 0 4.7.7 5.9 2.3-.2-2.8-1.9-5.2-5.9-5.6V3.2z"
        })
      ),
      label
    ),
    menu ? rewindMenuNode(t, menuPos, menuRef, runRewind) : null
  );
}
function installRewindWatch(ctx) {
  const sessions = ctx && ctx.sessions || hostSessions();
  if (!sessions) return () => {
  };
  const tick = async () => {
    try {
      const data = await apiJson("/dsh-purge/rewind");
      if (!data || !data.sessionId || !data.at || data.at <= getRewindSeenAt())
        return;
      noteRewindAt(data.at);
      const current = currentSessionId(sessions);
      if (current && current !== data.parentId) return;
      const text = isPluginDraft(data.text) ? "" : data.text || "";
      armComposerFill(data.sessionId, text);
      scheduleComposerFill(data.sessionId, text);
      await openRewoundSession(sessions, data.sessionId);
      scheduleComposerFill(data.sessionId, text);
    } catch {
    }
  };
  const timer = typeof window !== "undefined" && window.setInterval ? window.setInterval(tick, 1200) : null;
  return () => {
    if (timer && typeof window !== "undefined" && window.clearInterval)
      window.clearInterval(timer);
  };
}
function installRewindUi(ctx) {
  bindRewindHost(ctx);
  ctx.slots.inject(
    "conversation.input.right",
    () => ctx.slots.register(
      {
        name: "conversation.input.right",
        id: "dsh-purge-rewind",
        order: 20,
        inject: (sessionId) => ({ sessionId, t: ctx.locale.bind(NS) })
      },
      RewindSafe
    )
  );
  ctx.effect(() => installRewindWatch(ctx), "dsh-purge: rewind watch");
}

// src/components/welcome.js
var rd3 = __toESM(require("react-dom"), 1);

// src/styles/welcome.css
var welcome_default = "/* The first-run dialog is rendered before any settings page. It must own its\n   styles and cannot depend on the optional drill vendor stylesheet.\n   \uC0C9\xB7\uBC18\uACBD\xB7\uD3F0\uD2B8\xB7\uADF8\uB9BC\uC790\xB7\uBAA8\uC158\uC740 DSH \uD1A0\uD070\uB9CC \uC4F4\uB2E4(\uD14C\uB9C8 \uC804\uD658\uC744 \uADF8\uB300\uB85C \uB530\uB77C\uAC04\uB2E4). */\n.dshpp-welcome-mask {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483000;\n  display: grid;\n  place-items: center;\n  padding: 24px;\n  overflow: auto;\n  box-sizing: border-box;\n  background: rgba(0, 0, 0, 0.35);\n  color: var(--dsw-alias-label-primary);\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 1.6;\n  text-align: left;\n}\n.dshpp-welcome-card {\n  width: min(600px, 100%);\n  max-height: calc(100dvh - 48px);\n  overflow: auto;\n  box-sizing: border-box;\n  padding: 24px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-lg);\n  background: var(--dsw-alias-bg-layer-1);\n  box-shadow: var(--dsw-elevation-panel);\n}\n.dshpp-welcome-card h2 {\n  margin: 0 0 6px;\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 20px;\n  font-weight: 600;\n}\n.dshpp-welcome-card h3 {\n  margin: 16px 0 6px;\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-weight: 600;\n}\n.dshpp-welcome-lead {\n  color: var(--dsw-alias-label-secondary);\n}\n.dshpp-welcome-warn {\n  margin: 16px 0;\n  padding: 12px;\n  border: 0.5px solid var(--dsw-alias-border-l2);\n  border-radius: var(--dsw-radius-sm);\n  background: var(--dsw-alias-bg-layer-2);\n}\n.dshpp-welcome-legal p {\n  margin: 10px 0;\n}\n.dshpp-welcome-legal a {\n  color: var(--dsw-alias-link);\n  overflow-wrap: anywhere;\n}\n.dshpp-welcome-check {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  margin-top: 20px;\n  cursor: pointer;\n}\n.dshpp-welcome-check input {\n  flex: 0 0 auto;\n  width: 16px;\n  height: 16px;\n  margin: 4px 0 0;\n  accent-color: var(--dsw-alias-button-primary-fill);\n}\n.dshpp-welcome-ops {\n  display: flex;\n  justify-content: flex-end;\n  margin-top: 20px;\n}\n/* CTA \uB300\uBE44: \uBC30\uACBD/\uAE00\uC790\uB97C \uD50C\uB7EC\uADF8\uC778 \uC0C9\uC73C\uB85C \uACE0\uC815\uD558\uC9C0 \uC54A\uACE0 DSH \uC8FC \uBC84\uD2BC \uD1A0\uD070\uC744 \uC4F4\uB2E4.\n   \uBE44\uD65C\uC131\uC77C \uB54C\uB294 \uCC44\uB3C4\uB97C \uB0AE\uCD98 fill + dimmed \uAE00\uC790 \uC870\uD569\uC73C\uB85C \uB300\uBE44\uB97C \uC720\uC9C0\uD55C\uB2E4\n   (\uD22C\uBA85\uB3C4\uB85C \uD750\uB9AC\uBA74 \uAE00\uC790\uAC00 \uBC30\uACBD\uC5D0 \uBB3B\uD788\uBBC0\uB85C opacity \uB97C \uC4F0\uC9C0 \uC54A\uB294\uB2E4). */\n.dshpp-welcome-ops button {\n  min-height: 36px;\n  height: 36px;\n  padding: 0 14px;\n  border: 0;\n  border-radius: var(--dsw-radius-md);\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n  font: inherit;\n  font-family: var(--dsw-font-family);\n  font-size: 14px;\n  line-height: 22px;\n  font-weight: 500;\n  cursor: pointer;\n  transition:\n    background-color 0.16s ease-out,\n    color 0.16s ease-out,\n    border-color 0.16s ease-out;\n}\n.dshpp-welcome-ops button:hover:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n}\n.dshpp-welcome-ops button:active:not(:disabled) {\n  background: var(--dsw-alias-button-primary-hover);\n}\n.dshpp-welcome-ops button:disabled {\n  border-color: transparent;\n  background: var(\n    --dsw-alias-button-primary-dimmed,\n    var(--dsw-alias-bg-layer-3)\n  );\n  color: var(--dsw-alias-label-dimmed, var(--dsw-alias-label-tertiary));\n  cursor: not-allowed;\n  opacity: 1;\n}\n.dshpp-welcome-ops button:focus-visible,\n.dshpp-welcome-check input:focus-visible {\n  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color);\n  outline-offset: 3px;\n}\n@media (max-height: 600px) {\n  .dshpp-welcome-mask {\n    padding: 12px;\n  }\n  .dshpp-welcome-card {\n    max-height: calc(100dvh - 24px);\n    padding: 18px;\n  }\n}\n";

// src/components/welcome.js
var WELCOME_KEY = "dsh-purge-user-notice-v1";
function readWelcomeAck() {
  try {
    return window.localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return false;
  }
}
function writeWelcomeAck() {
  try {
    window.localStorage.setItem(WELCOME_KEY, "1");
  } catch {
  }
}
function WelcomeNotice(props = {}) {
  const t = useT();
  const [open, setOpen] = useState(() => !readWelcomeAck());
  const [checked, setChecked] = useState(false);
  if (!open) return null;
  const repo = props.repo || t("welcome.repo");
  const node = h(
    "div",
    {
      className: "dshpp-welcome-mask",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "dshpp-welcome-title"
    },
    h("style", null, welcome_default),
    h(
      "div",
      { className: "dshpp-welcome-card" },
      h("h2", { id: "dshpp-welcome-title" }, t("welcome.title")),
      h("div", { className: "dshpp-welcome-lead" }, t("welcome.lead")),
      h("div", { className: "dshpp-welcome-warn" }, t("welcome.warn")),
      h(
        "div",
        { className: "dshpp-welcome-legal" },
        h("p", null, t("welcome.body")),
        h(
          "p",
          null,
          h(
            "a",
            {
              href: repo,
              target: "_blank",
              rel: "noopener noreferrer"
            },
            repo
          )
        ),
        h("h3", null, t("welcome.bans")),
        h("p", null, t("welcome.ban1")),
        h("p", null, t("welcome.ban2")),
        h("p", null, t("welcome.ban3"))
      ),
      h(
        "div",
        { className: "dshpp-welcome-checks" },
        h(
          "label",
          { className: "dshpp-welcome-check" },
          h("input", {
            type: "checkbox",
            checked,
            onChange: (e) => setChecked(!!(e && e.target && e.target.checked))
          }),
          h("span", null, t("welcome.check"))
        )
      ),
      h(
        "div",
        { className: "dshpp-welcome-ops" },
        h(
          "button",
          {
            type: "button",
            className: "primary",
            disabled: !checked,
            onClick: () => {
              if (!checked) return;
              writeWelcomeAck();
              setOpen(false);
            }
          },
          t("welcome.ok")
        )
      )
    )
  );
  if (rd3?.createPortal && typeof document !== "undefined" && document.body)
    return rd3.createPortal(node, document.body);
  return node;
}

// src/state/redteam-mode.js
function isRedteamPresetId(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (text === "redteam") return true;
  if (/^red[\s_-]*team$/i.test(text)) return true;
  const label = text.replace(/레드팀 아님/g, "").replace(/비레드팀/g, "");
  if (/레드팀/.test(label)) return true;
  return false;
}
function readSessionAgentPreset(sess) {
  if (!sess || typeof sess !== "object") return "";
  try {
    const pv = sess.projectionValues;
    if (pv && typeof pv.agentPreset === "string") return pv.agentPreset;
  } catch {
  }
  try {
    if (typeof sess.agentPreset === "string") return sess.agentPreset;
  } catch {
  }
  try {
    const header = sess.header;
    if (header && typeof header.agentPreset === "string")
      return header.agentPreset;
  } catch {
  }
  return "";
}
function isRedteamModeActive() {
  try {
    const sessions = hostSessions();
    const sid = currentSessionId(sessions);
    if (sid && sessions) {
      try {
        const snap = typeof sessions.list?.getSnapshot === "function" ? sessions.list.getSnapshot() : null;
        const sess = snap && snap.byId ? snap.byId[sid] : null;
        if (isRedteamPresetId(readSessionAgentPreset(sess))) return true;
      } catch {
      }
      try {
        const actx = typeof sessions.scope === "function" ? sessions.scope(sid) : void 0;
        const face = typeof sessions.sessionOf === "function" ? sessions.sessionOf(actx) : void 0;
        const faceSnap = face && typeof face.getSnapshot === "function" ? face.getSnapshot() : face;
        if (isRedteamPresetId(readSessionAgentPreset(faceSnap))) return true;
      } catch {
      }
    }
  } catch {
  }
  if (typeof document === "undefined" || !document.querySelector) return false;
  try {
    const semantic = document.querySelector(
      "[data-agent-preset='redteam'], [data-preset-id='redteam'], [data-mode='redteam']"
    );
    if (semantic) return true;
    const nodes = document.querySelectorAll(
      "[class*='seat' i][class*='label' i], [class*='seatLabel' i], button[class*='seat' i], [role='button'][class*='seat' i]"
    );
    for (const el of nodes) {
      const text = String(el.textContent || "").replace(/\s+/g, " ").trim();
      if (/레드팀 모드/.test(text) || /^RedTeam\b/i.test(text)) return true;
    }
  } catch {
  }
  try {
    const labels = document.querySelectorAll(
      "[class*='label' i][class*='preset' i], [class*='presetLabel' i], [title*='\uB808\uB4DC\uD300'], [title*='RedTeam']"
    );
    for (const el of labels) {
      const text = String(el.textContent || "").trim();
      if (/레드팀 모드/.test(text) || /^RedTeam\b/i.test(text)) return true;
      if (isRedteamPresetId(text)) return true;
    }
  } catch {
  }
  return false;
}
function looksLikeSendControl(el) {
  if (!el || el.nodeType !== 1) return false;
  const btn = el.closest("button, [role='button']");
  if (!btn) return false;
  if (btn.closest(".dshp-dock, .dshp-auth-mask, .rt-dock, .dshp-env-gate"))
    return false;
  const label = [
    btn.getAttribute("aria-label"),
    btn.getAttribute("title"),
    btn.getAttribute("data-testid"),
    btn.textContent
  ].filter(Boolean).join(" ");
  if (/중지|정지|Stop/i.test(label) && !/전송|보내기|Send/i.test(label))
    return false;
  if (/전송|보내기|Submit|Send(?!\s*feedback)/i.test(label)) return true;
  try {
    const card = btn.closest("[data-composer-card], [data-composer-seat]");
    if (card) {
      const cls = String(btn.className || "");
      if (/primary/i.test(cls) && btn.querySelector("svg")) return true;
    }
  } catch {
  }
  if (btn.type === "submit") {
    const form = btn.closest("form");
    if (form && form.querySelector("textarea, [contenteditable='true']"))
      return true;
  }
  return false;
}

// src/components/env-gate.js
function fetchEnvAdaptStatus() {
  return fetch(apiUrl("/redteam/api"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "platformEnvAdaptStatus" })
  }).then((r) => r.json()).catch(() => null);
}
function EnvAdaptSendGate() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const cacheRef = useRef({ at: 0, ready: false });
  const refresh = useCallback(async () => {
    const r = await fetchEnvAdaptStatus();
    const ready = !!(r && r.ready);
    cacheRef.current = {
      at: Date.now(),
      ready,
      skipped: !!(r && r.skipped)
    };
    setStatus(r);
    return r;
  }, []);
  const blockAndOpen = useCallback(() => {
    setConfirmSkip(false);
    refresh();
    if (!readDrillAuth()) {
      setOpen(false);
      requestDrillEnv();
      return true;
    }
    setOpen(true);
    return true;
  }, [refresh]);
  const mustBlockSubmit = useCallback(() => {
    if (!isRedteamModeActive()) return false;
    const cached = cacheRef.current;
    if (!cached.at || Date.now() - cached.at > 2500) {
      refresh().catch(() => {
      });
    }
    if (cached.ready) return false;
    blockAndOpen();
    return true;
  }, [blockAndOpen, refresh]);
  useEffect(() => {
    const patched = /* @__PURE__ */ new WeakMap();
    const patchedShells = [];
    const patchShell = (shell) => {
      if (!shell || patched.has(shell)) return;
      if (typeof shell.submit !== "function") return;
      const origSubmit = shell.submit;
      const origActionsSubmit = shell.actions && typeof shell.actions.submit === "function" ? shell.actions.submit : null;
      patched.set(shell, { origSubmit, origActionsSubmit });
      patchedShells.push(shell);
      const bound = origSubmit.bind(shell);
      shell.submit = function gatedSubmit(mode) {
        try {
          if (mustBlockSubmit()) return;
        } catch {
        }
        return bound(mode);
      };
      if (shell.actions && typeof shell.actions === "object") {
        shell.actions.submit = () => shell.submit("queue");
      }
    };
    const tick = () => {
      try {
        const sessions = hostSessions();
        const sid = currentSessionId(sessions);
        if (!sid) return;
        patchShell(conversationInput(sid));
      } catch {
      }
    };
    tick();
    const iv = typeof window !== "undefined" && window.setInterval ? window.setInterval(tick, 400) : null;
    return () => {
      if (iv && typeof window !== "undefined" && window.clearInterval)
        window.clearInterval(iv);
      for (const shell of patchedShells) {
        const info = patched.get(shell);
        if (!info) continue;
        try {
          shell.submit = info.origSubmit;
        } catch {
        }
        if (info.origActionsSubmit && shell.actions) {
          try {
            shell.actions.submit = info.origActionsSubmit;
          } catch {
          }
        }
      }
      patchedShells.length = 0;
    };
  }, [mustBlockSubmit]);
  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      try {
        if (!isRedteamModeActive()) return;
      } catch {
        return;
      }
      refresh();
    };
    tick();
    const iv = typeof window !== "undefined" && window.setInterval ? window.setInterval(tick, 5e3) : null;
    return () => {
      alive = false;
      if (iv && typeof window !== "undefined" && window.clearInterval)
        window.clearInterval(iv);
    };
  }, [refresh]);
  useEffect(() => {
    if (typeof document === "undefined" || !document.addEventListener)
      return void 0;
    const onPointer = (e) => {
      if (!looksLikeSendControl(e.target)) return;
      if (!mustBlockSubmit()) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function")
        e.stopImmediatePropagation();
    };
    const onKey = (e) => {
      if (e.key !== "Enter" || e.shiftKey || e.isComposing) return;
      const target = e.target;
      const inComposer = target && target.closest && target.closest(
        "[data-composer-card], [data-composer-seat], [contenteditable='true'], textarea"
      );
      if (!inComposer) return;
      if (target.closest && target.closest(".dshp-dock, .dshp-auth-mask, .rt-dock, .dshp-env-gate"))
        return;
      if (!mustBlockSubmit()) return;
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function")
        e.stopImmediatePropagation();
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("click", onPointer, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("click", onPointer, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [mustBlockSubmit]);
  if (!open) return null;
  const message = status && status.message || t("envGate.lead");
  return h(
    "div",
    {
      className: "dshp-auth-mask dshp-env-gate",
      role: "dialog",
      "aria-modal": "true"
    },
    h(
      "div",
      { className: "dshp-auth-modal", style: { width: "min(480px,100%)" } },
      h("h2", null, t("envGate.title")),
      h("div", { style: { fontSize: 13, lineHeight: 1.55 } }, message),
      h(
        "div",
        {
          style: {
            fontSize: 12,
            color: "var(--dsw-alias-label-secondary,#999)",
            lineHeight: 1.5
          }
        },
        t("envGate.kaliHint")
      ),
      confirmSkip ? h("div", { className: "dshp-auth-warn" }, t("envGate.skipConfirm")) : null,
      h(
        "div",
        { className: "dshp-auth-ops" },
        confirmSkip ? [
          h(
            "button",
            {
              key: "no",
              type: "button",
              onClick: () => setConfirmSkip(false)
            },
            t("envGate.skipNo")
          ),
          h(
            "button",
            {
              key: "yes",
              type: "button",
              className: "primary",
              disabled: busy,
              onClick: () => {
                setBusy(true);
                fetch(apiUrl("/redteam/api"), {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    op: "platformEnvAdaptSkip",
                    skip: true
                  })
                }).then((r) => r.json()).then((r) => {
                  setBusy(false);
                  cacheRef.current = {
                    at: Date.now(),
                    ready: true,
                    skipped: true
                  };
                  setStatus(r);
                  setOpen(false);
                  setConfirmSkip(false);
                }).catch(() => {
                  setBusy(false);
                  cacheRef.current = {
                    at: Date.now(),
                    ready: true,
                    skipped: true
                  };
                  setOpen(false);
                });
              }
            },
            t("envGate.skipYes")
          )
        ] : [
          h(
            "button",
            {
              key: "skip",
              type: "button",
              onClick: () => setConfirmSkip(true)
            },
            t("envGate.skip")
          ),
          h(
            "button",
            {
              key: "go",
              type: "button",
              className: "primary",
              onClick: () => {
                setOpen(false);
                requestDrillEnv();
              }
            },
            t("envGate.go")
          )
        ]
      )
    )
  );
}

// src/entry.js
var name = false ? "dsh-purge-community" : "dsh-purge-panel";
var inject = ["slots", "locale"];
function PurgeIcon({ size = 20 } = {}) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      "aria-hidden": true
    },
    h("path", { d: "M4 7h16M4 17h16" }),
    h("circle", { cx: 9, cy: 7, r: 3, fill: "none" }),
    h("circle", { cx: 15, cy: 17, r: 3, fill: "none" })
  );
}
function PurgeGlyphIcon({ size = 16 } = {}) {
  return h(PurgeGlyph, { size });
}
function PanelOverlays() {
  const st = useDock();
  return h(
    import_react.default.Fragment,
    null,
    h("style", null, base_default),
    // Restored from 1.1.71 apply(): shell.overlay carried the welcome notice
    // and the red-team environment gate next to the dock.
    h(WelcomeNotice, {
      repo: false ? "https://github.com/wnduddld0513/dsh-purge-kr" : void 0
    }),
    h(EnvAdaptSendGate),
    st.authOpen ? h(AuthGate, { pending: st.pending }) : null
  );
}
function apply(ctx) {
  ctx.effect(() => installLegacyVisibility(), "panel legacy visibility");
  ctx.inject(["sessions", "uiWorkspace"], (host3) => {
    host3.effect(() => bindSessionContext(host3), "panel session context");
  });
  ctx.effect(startGrantSync, "panel grant sync");
  ctx.inject(
    ["sessions", "uiWorkspace", "conversation"],
    (host3) => installRewindUi(host3)
  );
  ctx.effect(() => ctx.locale.register(NS, { ko, en }), "panel locale");
  ctx.effect(() => {
    const locale = ctx.locale;
    if (!locale || typeof locale.addLanguage !== "function") return void 0;
    return locale.addLanguage({ id: "ko", label: "\uD55C\uAD6D\uC5B4", fallback: "en" });
  }, "panel locale language");
  const t = ctx.locale.bind(NS);
  setTranslate(t);
  ctx.slots.inject(
    "shell.overlay",
    () => ctx.slots.register(
      {
        name: "shell.overlay",
        id: "dsh-purge-panel-overlays",
        order: 60
      },
      PanelOverlays
    )
  );
  ctx.slots.inject(
    "sidebar.panellist",
    () => ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: "dsh-purge",
        order: 30,
        label: "Purge",
        inject: () => ({ t })
      },
      PurgeGlyphIcon
    )
  );
  ctx.slots.inject(
    "main",
    () => ctx.slots.register(
      {
        name: "main",
        key: "dsh-purge",
        inject: () => ({ t })
      },
      PurgePage
    )
  );
  ctx.slots.inject(
    "plugins.bundle.config",
    () => ctx.slots.register(
      {
        name: "plugins.bundle.config",
        key: false ? "dsh-purge-community" : "dsh-purge-panel",
        inject: () => ({ t })
      },
      SettingsRoot
    )
  );
}

return module.exports;
}});})();
