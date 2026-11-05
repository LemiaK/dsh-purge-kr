#!/usr/bin/env node

import * as core from "../lib/core.js";
import * as rules from "../lib/rules.js";

import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";

function printStatus(state) {
  const out = [];
  out.push("dsh-purge 상태 / Status");
  out.push("  호스트 / surface " + (state.surface || "web"));
  out.push("  DSH_HOME      " + state.dsh_home);
  if (state.desktop_install) out.push("  데스크톱 설치   " + state.desktop_install);
  if (state.ai_base) {
    out.push("  플러그인 루트 / root  " + state.ai_base);
    for (const [key, fp] of Object.entries(state.files)) {
      out.push(`    ${key.padEnd(22)} ${fp}`);
    }
  } else {
    out.push("  플러그인 루트 / root  " + core.missingAiBaseMessage());
  }
  out.push(`  shim 디렉터리   ${state.shim_dir || "미확인 / not found"}`);
  out.push(`  백업 / backup  ${state.has_backup ? "있음 / yes" : "없음 / no"}`);
  out.push(`  주입 파일       ${state.override_path}`);
  out.push(`  주입 상태       ${state.override_status}`);
  out.push("");
  if (!state.ai_base) {
    // 호스트 루트가 없으면 실제 상태를 모른다. 0/86 이나 undefined 로 단정하면 이미 적용된 패치를 미적용으로 읽게 된다.
    out.push("  패치 상태       미확인 / unknown — 플러그인 루트를 찾지 못해 읽지 않았습니다");
    out.push(`  shim: dsh.cmd=${state.shim_cmd}  dsh.ps1=${state.shim_ps1}  dsh=${state.shim_bin}`);
    return out.join("\n");
  }
  out.push(`  패치 ${state.patches_applied}/${core.ALL_PATCHES.length} 정리됨, ${state.patches_pending} 정리 대기`);
  for (const p of core.ALL_PATCHES) {
    const s = state.patch_status[p.id];
    const mark = s === "applied" ? "✓" : s === "pending" ? "✗" : "·";
    out.push(`    ${mark} [#${String(p.id).padEnd(2)}] ${p.name.padEnd(30)} ${p.layer}/${p.layer_en} — ${s}`);
  }
  out.push("");
  out.push(`  shim: dsh.cmd=${state.shim_cmd}  dsh.ps1=${state.shim_ps1}  dsh=${state.shim_bin}`);
  return out.join("\n");
}

export async function main(args = process.argv.slice(2), dependencies = {}) {
  const hostCore = dependencies.core || core;
  const hostRules = dependencies.rules || rules;
  const mode = args.find((a) => ["--apply", "--revert", "--uninstall", "--status", "--edit", "--help"].includes(a));

  if (mode === "--help" || args.includes("-h")) {
    console.log(`dsh-purge 사용법:
  dsh-purge --status      상태 표시
  dsh-purge --apply       모든 정리 적용(프롬프트+코드+shim+override)
  dsh-purge --revert      롤백 및 되돌리기
  dsh-purge --uninstall   플러그인 제거(적용된 경우 먼저 되돌린다)
  dsh-purge --edit        주입 파일 prompt-inject.md 편집
  dsh-purge --help        도움말`);
    return;
  }

  const state = await hostCore.gatherState();
  console.log(printStatus(state));
  console.log("");

  if (mode === "--apply") {
    let failed = false;
    if (!state.ai_base) {
      console.log("[ERROR] " + hostCore.missingAiBaseMessage());
      console.log("  fix: DSH_BASE 를 dsh-agent-instructions/lib 가 있는 @deepseek-ai 디렉터리로 지정하세요");
      process.exit(1);
    }
    const inject = hostRules.resolveInjectText(state.dsh_home);
    if (!inject.text) {
      console.log("[ERROR] 프롬프트와 규칙 세트가 모두 비어 있습니다. 먼저 프롬프트를 추가해야 합니다");
      process.exit(1);
    }
    const { hosts, report } = await hostCore.applyPatchesAllHosts(hostCore.ALL_PATCHES, {
      preserveClientBundles: false,
      forApply: true,
    });
    for (const h of hosts) console.log(`  호스트 / host → ${h.aiBase}`);
    for (const r of report) {
      const m = r.status === "applied" ? "✓ 정리됨" : r.status === "already" ? "- 이미 최신" : r.status === "missing_file" ? "⚠ 파일 누락" : `✗ ${r.status}`;
      console.log(`  ${m} patch #${String(r.patch_id).padEnd(2)} ${r.name}`);
    }
    const summary = hostCore.summarizeApplyReport(report);
    failed = summary.failed.length > 0;
    const flashHost = hosts[0]?.aiBase || state.ai_base;
    const flash = hostCore.silenceCmdFlash(flashHost);
    console.log(`  cmd-flash=${flash.entry} phase-1=${flash.phase1} ok=${flash.ok}`);
    if (flash.ok === false) failed = true;
    if (hosts.length > 1) {
      console.log(`  다중 호스트 / multi-host: ${hosts.length}개 @deepseek-ai 정리됨`);
    }
    console.log(inject.source === "rule"
      ? "  - 현재 규칙 세트를 사용합니다. 프롬프트 파일은 다시 쓰지 않습니다"
      : "  - 기존 프롬프트 파일을 사용합니다");
    if (state.shim_dir) {
      const r = await hostCore.patchShim(state.shim_dir);
      for (const [fname, st] of Object.entries(r)) {
        if (typeof st === "string" && /^(error:|write_error|failed)/.test(st)) failed = true;
        if (st === "patched") console.log(`  ✓ shim ${fname} 주입 / injected`);
        else if (st === "already_patched") console.log(`  - shim ${fname} 이미 주입됨 / already injected`);
        else if (st === "missing") console.log(`  - shim ${fname} 없음 / missing`);
        else console.log(`  ⚠ shim ${fname}: ${st}`);
      }
    } else {
      console.log("  ⚠ shim 디렉터리를 확인하지 못해 주입을 건너뜁니다");
    }
    console.log("");
    if (failed) {
      console.error("적용 미완료 / Apply incomplete. 위 오류를 처리하세요. 재시작으로는 쓰기 실패가 해결되지 않습니다.");
      process.exitCode = 1;
    } else console.log("전체 완료 / All done. dsh 를 재시작하면 적용됩니다 / Restart dsh to take effect.");
  } else if (mode === "--revert") {
    let failed = false;
    if (state.ai_base || hostCore.enumeratePatchAiBases().length) {
      const { reverted, errors } = await hostCore.revertAllHosts();
      if (errors.length) failed = true;
      for (const p of reverted) console.log(`  ✓ 되돌림 / Reverted ${p}`);
      for (const [p, e] of errors) console.log(`  ⚠ 되돌리기 실패 ${p}: ${e}`);
      if (reverted.length === 0) console.log("  - 되돌릴 패치 백업이 없습니다 / no patch backup");
    }
    if (state.shim_dir) {
      const r = await hostCore.revertShim(state.shim_dir);
      for (const [fname, st] of Object.entries(r)) {
        if (typeof st === "string" && /^error:/.test(st)) failed = true;
        if (st === "reverted" || st === "stripped_inject") console.log(`  ✓ shim ${fname}: ${st}`);
        else console.log(`  - shim ${fname}: ${st}`);
      }
    }
    console.log("");
    if (failed) {
      console.error("롤백 미완료 / Revert incomplete. 원본 파일과 실패한 백업은 보존됩니다. 위 오류를 처리하세요.");
      process.exitCode = 1;
    } else console.log("롤백 완료 / Revert done. dsh 를 재시작하면 복원됩니다 / restart to restore.");
    console.log("참고: prompt-inject.md 는 보존됩니다(사용자 파일) / prompt-inject.md kept (user file)");
  } else if (mode === "--uninstall") {
    const { uninstallPurge, finishUninstallCleanup } = await import("../lib/uninstall.js");
    const result = await finishUninstallCleanup(await uninstallPurge());
    if (result.applied) console.log("  적용된 패치가 감지되어 원본으로 되돌렸습니다.");
    else console.log("  적용된 패치가 감지되지 않았습니다. 그래도 플러그인 파일은 정리합니다.");
    if (result.override?.removed) console.log(`  삭제됨 ${result.override.path}`);
    if (result.stripped?.length) console.log(`  profile 에서 제거됨: ${result.stripped.join(", ")}`);
    for (const e of result.errors || []) console.log(`  ⚠ ${e}`);
    if (!result.ok) {
      console.log("  제거 미완료: 위의 되돌리기·등록 해제·파일 정리 오류를 확인하세요.");
      process.exit(1);
    }
    console.log("");
    console.log("제거 완료. dsh 를 재시작하세요.");
  } else if (mode === "--edit") {
    const r = hostCore.editOverride(state.dsh_home);
    if (!r.ok && r.needCreate) {
      await hostCore.installOverride(state.dsh_home, true);
      console.log(`  ✓ 기본 주입 파일을 만들었습니다: ${state.override_path}`);
      hostCore.editOverride(state.dsh_home);
    } else {
      console.log(`  → ${r.editor} 로 주입 파일을 열었습니다: ${r.path}`);
    }
    console.log("  편집을 마친 뒤 dsh 를 재시작하면 적용됩니다.");
  } else {
    console.log("기본값은 정리하지 않습니다. --apply 로 정리를 적용합니다.");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) main().catch((e) => {
  console.error("[dsh-purge] error:", e);
  process.exit(1);
});
