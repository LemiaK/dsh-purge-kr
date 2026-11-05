#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { Maintenance, compatibility, ROOT, PACKAGE } from "../lib/community.js";
import { findDshHome, patchDrift } from "../lib/core.js";
import { currentHost, diagnosticHost, hostSurface } from "../lib/instance.js";
import { readOverrides, writeOverride, clearOverride } from "../lib/anchors.js";
import { logAudit, readAudit } from "../lib/audit.js";
import { readFileSync, writeFileSync } from "node:fs";
import { installPreset, presetStatus } from "../lib/presets.js";
import { readBoost, writeBoost } from "../lib/boost.js";
import { readTuning, writeTuning } from "../lib/tuning.js";
import { createProbe, readProbe } from "../lib/probe.js";
const rawArgs = process.argv.slice(2);
// 원본 CLI 의 모든 동작(apply/revert/uninstall/edit/status)은 그대로 둔다.
// purge-community 는 전달만 해 두 구현이 어긋나는 일을 막는다.
const LEGACY = { apply: "--apply", revert: "--revert", uninstall: "--uninstall", edit: "--edit", "legacy-status": "--status" };
const [op = "status", argument, argument2] = rawArgs,
  home = process.env.DSH_HOME || findDshHome();
// Resolve the running/explicit installation, not another machine-wide Desktop.
const aiBase = currentHost();
// 지연 생성: status / diagnose / selfcheck 는 profile 디렉터리가 잠시 쓸 수 없다고 바로 죽으면 안 된다.
const maintenance = () => new Maintenance({
  home,
  profile: process.env.PURGE_PROFILE_DIR,
  aiBase,
});
if (LEGACY[op]) {
  const run = spawnSync(process.execPath, [path.join(ROOT, "bin", "dsh-purge.js"), LEGACY[op], ...rawArgs.slice(1)], { stdio: "inherit" });
  process.exitCode = run.status === null ? 1 : run.status;
} else try {
  let result;
  if (op === "audit") {
    const n = rawArgs.includes("--limit") ? Number(rawArgs[rawArgs.indexOf("--limit") + 1]) : 20;
    result = { ok: true, entries: readAudit({ limit: Number.isFinite(n) ? n : 20, home }) };
  } else if (op === "reanchor") {
    const sub = argument || "list";
    const host = aiBase || currentHost();
    const drift = await patchDrift(host);
    const rows = [...drift.drifted, ...drift.optionalDrift];
    const byId = (id) => rows.find((r) => r.id === Number(id));
    if (sub === "list") {
      result = {
        host: drift.host,
        overrides: readOverrides(),
        drifted: rows.map((r) => ({
          id: r.id,
          name: r.name,
          optional: r.optional,
          anchors: r.anchors.map((a) => ({ index: a.index, file: a.file, line: a.suggestion?.line })),
        })),
      };
    } else if (sub === "show") {
      const row = byId(argument2);
      if (!row) throw Error(`드리프트된 패치가 없습니다: #${argument2}`);
      result = row;
    } else if (sub === "clear") {
      const idx = rawArgs.indexOf("--index");
      const wanted = idx >= 0 ? Number(rawArgs[idx + 1]) : undefined;
      if (idx >= 0 && !Number.isInteger(wanted)) throw Error("--index 에는 정수가 필요합니다");
      result = { cleared: true, overrides: clearOverride(home, argument2, wanted) };
    } else if (sub === "apply") {
      const row = byId(argument2);
      if (!row) throw Error(`드리프트된 패치가 없습니다: #${argument2}`);
      const idxFlag = rawArgs.indexOf("--index");
      const wanted = idxFlag >= 0 ? Number(rawArgs[idxFlag + 1]) : NaN;
      if (idxFlag >= 0 && !Number.isInteger(wanted)) throw Error("--index 에는 정수가 필요합니다");
      const target = idxFlag >= 0 ? row.anchors.find((a) => a.index === wanted) : row.anchors[0];
      if (!target) throw Error("해당 앵커를 찾지 못했습니다(--index 로 지정하세요)");
      const text = readFileSync(target.file, "utf8").replace(/\r\n/g, "\n");
      const lines = text.split("\n");
      const oldCount = String(target.head || "").split("\n").length;
      const linesFlag = rawArgs.indexOf("--lines");
      let from;
      let to;
      if (linesFlag >= 0) {
        const [a, b] = String(rawArgs[linesFlag + 1]).split("-").map(Number);
        if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < a) throw Error("--lines 는 120-132 같은 형식이어야 합니다");
        from = a - 1;
        to = b;
      } else {
        const center = (target.suggestion?.line || 1) - 1;
        const span = Math.max(1, Math.min(oldCount || 3, 40));
        from = Math.max(0, center - Math.floor(span / 2));
        to = Math.min(lines.length, from + span);
      }
      const candidate = lines.slice(from, to).join("\n");
      if (!candidate.trim()) throw Error("가져온 스니펫이 비어 있습니다. --lines 로 범위를 지정하세요");
      const occurrences = text.split(candidate).length - 1;
      if (occurrences !== 1) throw Error(`후보 스니펫이 파일에 ${occurrences}번 나타납니다. 유일해야 하므로 --lines 로 범위를 좁히세요`);
      const preview = {
        patch: row.id,
        name: row.name,
        index: target.index,
        file: target.file,
        lines: `${from + 1}-${to}`,
        candidate: candidate.slice(0, 800),
        applies: (await import("../lib/core.js")).applyReplacementsToText(
          text,
          { ...row, replacements: [{ pattern: candidate, replace: "x" }], markers: ["__never__"] },
          target.file,
        ).changed,
      };
      if (!rawArgs.includes("--yes")) {
        result = { dryRun: true, ...preview, hint: "확인했으면 --yes 를 붙여 로컬 재앵커 오버라이드를 기록하세요" };
      } else {
        writeOverride(home, row.id, target.index, candidate, { host: drift.host });
        logAudit("reanchor", { patch: row.id, index: target.index, host: drift.host }, home);
        const core = await import("../lib/core.js");
        core.refreshAnchorOverrides();
        result = { written: true, ...preview, status: (await core.patchStatus(host))[row.id] };
      }
    } else {
      throw Error("사용법: purge-community reanchor list | show <id> | apply <id> [--index n] [--lines a-b] [--yes] | clear <id>");
    }
  } else if (op === "patches") {
    const sub = (argument || "list").toLowerCase();
    const current = readTuning(home).extraPatches || [];
    const ids = String(argument2 || "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
    const optIn = (await import("../lib/core.js")).ALL_PATCHES.filter((p) => p.disabledByDefault).map((p) => p.id);
    if (sub === "enable" || sub === "disable") {
      if (!ids.length) throw Error(`사용법: purge-community patches ${sub} ${optIn.join(",") || "<id,id>"}`);
      const known = new Set(optIn);
      const unknown = ids.filter((id) => !known.has(id));
      if (unknown.length) throw Error(`기본 비활성 패치만 수동으로 켜고 끌 수 있습니다: ${[...known].join(",")} (알 수 없음: ${unknown.join(",")})`);
      const next = sub === "enable"
        ? [...new Set([...current, ...ids])].sort((a, b) => a - b)
        : current.filter((id) => !ids.includes(id));
      const saved = writeTuning({ extraPatches: next }, home);
      logAudit("patches_setting", { action: sub, ids: ids.join(","), effective: saved.extraPatches.join(",") }, home);
      result = { ok: true, extraPatches: saved.extraPatches, restart_required: false, hint: sub === "enable" ? "“적용”을 한 번 눌러 호스트에 기록한 뒤 종료하고 다시 여세요" : "끄기는 이후 “적용”에만 영향을 줍니다. 호스트에서 실제로 제거하려면 “되돌리기”를 한 번 누르세요" };
    } else {
      result = {
        ok: true,
        optIn,
        extraPatches: current,
        hint: "purge-community patches enable 18,19 | disable 18",
        note: "기본 비활성: 켜면 중복 호출 알림과 도구 결과 트리밍이 해제되어 긴 세션의 컨텍스트가 커집니다",
      };
    }
  } else if (op === "retry") {
    const sub = (argument || "status").toLowerCase();
    if (sub === "on" || sub === "off") {
      const next = writeTuning({ refusalRetry: sub === "on" });
      result = { ok: true, refusalRetry: next.refusalRetry, restart_required: false, effective: "next-turn" };
    } else {
      result = { ok: true, refusalRetry: readTuning(home).refusalRetry === true, hint: "purge-community retry on|off" };
    }
  } else if (op === "rewind") {
    const sub = (argument || "status").toLowerCase();
    if (sub === "on" || sub === "off") {
      const next = writeTuning({ rewind: sub === "on" });
      result = { ok: true, rewind: next.rewind, restart_required: true };
    } else {
      result = { ok: true, rewind: readTuning(home).rewind !== false, hint: "purge-community rewind on|off" };
    }
  } else if (op === "inject") {
    // 주입 위치: head / tail / both. 바꾸면 다음 대화 라운드부터 적용된다(section 이 매 라운드 tuning 을 다시 읽는다).
    // 재시작은 필요 없고, 패널이 표시하는 위치는 다음 읽기에서 갱신된다.
    const sub = (argument || "status").toLowerCase();
    const allowed = ["head", "tail", "both"];
    if (allowed.includes(sub)) {
      const next = writeTuning({ injectPosition: sub });
      logAudit("tuning_setting", { setting: "injectPosition", value: next.injectPosition }, home);
      result = { ok: true, injectPosition: next.injectPosition, restart_required: false };
    } else if (sub === "status" || !argument) {
      result = { ok: true, injectPosition: readTuning(home).injectPosition || "head", hint: "purge-community inject head|tail|both" };
    } else {
      result = { ok: false, error: "injectPosition 은 head / tail / both 만 받습니다", value: sub };
      process.exitCode = 2;
    }
  } else if (op === "probe") {
    if (argument === "new" || argument === "create") {
      const probe = createProbe();
      logAudit("probe", { nonce: probe.nonce }, home);
      result = { ok: true, ...probe };
    } else {
      const probe = readProbe();
      result = { ok: true, active: !!probe, nonce: probe?.nonce || "", hint: "purge-community probe new" };
    }
  } else if (op === "preset") {
    const sub = argument || "status";
    if (sub === "install" || sub === "update") {
      result = installPreset({ force: rawArgs.includes("--force") });
      logAudit("preset", { action: result.action, dir: result.dir }, home);
    } else if (sub === "status" || sub === "path") {
      result = presetStatus(home);
    } else {
      throw Error("사용법: purge-community preset [status|install [--force]]");
    }
  } else if (op === "boost") {
    if (argument === "on" || argument === "off") result = { enabled: writeBoost(argument === "on") };
    else result = { enabled: readBoost(), hint: "purge-community boost on|off" };
  } else if (op === "selfcheck" || op === "check-bypass") {
    // The extracted installer runs migrate before runtime dependencies are installed.
    const { selfCheck } = await import("../lib/selfcheck.js");
    // CLI 에서 직접 실행하면(node bin/community.js) argv 가 플러그인 자신을 가리켜 currentHost() 가 호스트를 못 알아본다.
    // selfCheck 는 빈 aiBase 를 넘기면 자체 해석을 쓰므로, 여기서 DSH_HOME 을 함께 넘겨 기본값으로 다시 추측하지 않게 한다.
    const report = await selfCheck(aiBase || "", process.env.DSH_HOME || findDshHome());
    process.exitCode = report.state === "broken" ? 1 : 0;
    if (rawArgs.includes("--json")) result = report;
    else {
      const notApplicable = report.patch.not_applicable || 0;
      const naNote = notApplicable ? `(별도 ${notApplicable}건은 명확히 해당 없음·비활성 또는 마이그레이션 불필요)` : "";
      const missingNote = report.patch.missing_file ? ` · 대상 누락 ${report.patch.missing_file}건(진단 참고)` : "";
      const lines = [
        `Purge 탈옥 자체 점검 · ${report.host || "(호스트 미확인)"}`,
        `  DSH ${report.host_version} · ${report.level} · 호스트 패치 ${report.patch.applied}/${report.patch.total}${naNote}${missingNote}`,
        "",
      ];
      for (const layer of report.layers) {
        const mark = ["pending", "inferred", "unknown"].includes(layer.state) ? "⏳" : layer.ok ? "✓" : "✗";
        const tail = layer.note
          || (layer.broken.length ? JSON.stringify(layer.broken) : "")
          || (layer.pending && layer.pending.length ? `적용 대기 #${layer.pending.join("/#")}` : "");
        lines.push(`  ${mark} ${layer.title}  ${layer.applied}/${layer.required ?? layer.total}${tail ? "  " + tail : ""}`);
      }
      const pendingCount = (report.summary && report.summary.pending && report.summary.pending.patches) || 0;
      lines.push(
        "",
        report.state === "pending"
          ? `결론: ${pendingCount}건의 패치가 적용 대기 상태입니다. “적용”을 한 번 누른 뒤 DSH 를 종료하고 다시 열면 됩니다.`
          : report.state === "broken"
            ? "결론: 실제로 적용되지 않은 계층이 있습니다(✗). 위를 참고하세요."
            : ["unknown", "inferred"].includes(report.state)
              ? "결론: 확인된 장애는 없지만 추론값이나 미확인 항목이 있습니다. 계층별 설명을 참고하세요."
              : "결론: 모든 계층이 정상 위치에 있습니다.",
      );
      if (rawArgs.includes("--text")) {
        console.log(lines.join("\n"));
        process.exit(report.state === "broken" ? 1 : 0);
      }
      result = { ok: report.ok, text: lines.join("\n"), summary: report.summary };
    }
  } else if (op === "host-status") {
    const { hostLayoutEvidence } = await import("../lib/host-layout.js");
    result = hostLayoutEvidence(aiBase);
  } else if (op === "diagnose") {
    const target = diagnosticHost();
    const drift = target
      ? await patchDrift(target, undefined, {surface:hostSurface(target),dshHome:home})
      : {host:"",state:"unknown",checked:0,drifted:[],optionalDrift:[],chained:[],missing:[],
          note:"현재 인스턴스를 확인하지 못했습니다. DSH_BASE 또는 PURGE_DSH_CLI 를 명시하세요. 다른 설치를 스캔하지 않습니다"};
    result = { name: "Purge Community", package: PACKAGE, compatibility: compatibility(target), ...drift };
  } else if (op === "status") {
    const target = diagnosticHost();
    result = {
      name: "Purge Community",
      package: PACKAGE,
      compatibility: compatibility(target),
      host_selection: target ? "explicit-or-running" : "unresolved",
      ...(target ? {} : { hint: "현재 인스턴스 진입점을 확인하지 못했습니다. DSH_BASE / PURGE_DSH_CLI 를 지정하거나 실행 중인 호스트의 패널 진단을 보세요. 이것은 플러그인 미설치의 증거가 아닙니다." }),
      backups: (() => { try { return maintenance().list(); } catch { return []; } })(),
    };
  } else if (op === "backup") result = await maintenance().backup("cli");
  else if (op === "prune") result = await maintenance().pruneLocked();
  else if (op === "usage") result = maintenance().usage();
  else if (op === "rollback") result = await maintenance().rollback(argument);
  else if (op === "install" || op === "migrate") {
    if (!argument) throw Error("설치 패키지 경로가 필요합니다");
    result = await maintenance().install(path.resolve(argument), {
      reason: op === "migrate" ? "before-migration" : "before-update",
      migrate: op === "migrate",
    });
  } else
    throw Error(
      "사용법: purge-community status | host-status | diagnose | selfcheck [--json] | boost on|off | rewind on|off | patches [list|enable ids|disable ids] | probe [new] | audit [--limit n] | preset [status|install] | backup [prune|usage] | rollback <백업ID> | migrate <tgz> | apply | revert | uninstall | edit",
    );
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
