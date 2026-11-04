// 번들된 `unrestricted` 에이전트 프리셋을 등록한다.
//
// DSH 0.1.7+ 의 모드 드롭다운은 `agentPresets.register()` 만 인정한다. 폴더를
// `~/.dsh/.agent-presets/` 에 넣어도 드롭다운에 나타나지 않는다(레드팀 프리셋도 초기에 같은 문제를 겪었다).
// 그래서 여기서는 lib/redteam/index.js 와 마찬가지로 registry 가 준비된 뒤 한 번 소프트 등록하고,
// 언로드할 때 해제한다.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readPresetDefinition } from "./redteam/preset-composition.js";
import { UNRESTRICTED_PRESET, bundledPresetDir, userPresetDir, installPreset } from "./presets.js";
import { findDshHome } from "./core.js";
import { migratePresetDefinition, backupPresetMigration, registerPresetDefinitions } from "./preset-compat.js";

export const name = "dsh-purge-presets";
export const inject = [];

const RETRY_LIMIT = 40;

function presetDir() {
  // 사용자가 수정했으면 디스크의 사본을 쓰고, 아니면 패키지 내 템플릿을 쓴다.
  try {
    const user = userPresetDir();
    if (existsSync(join(user, "agent.cordis.yml"))) return user;
  } catch {
    /* DSH_HOME 이 없으면 패키지 내부로 되돌린다 */
  }
  return bundledPresetDir(UNRESTRICTED_PRESET);
}

export function apply(ctx) {
  let release;
  let stopped = false;
  let tries = 0;

  const registry = () => {
    try {
      const fromProxy = ctx.agentPresets;
      if (fromProxy && typeof fromProxy.register === "function") return fromProxy;
    } catch {
      /* inject 하지 않은 상태에서 속성을 읽으면 예외가 난다 */
    }
    try {
      const fromGet = ctx.get?.("agentPresets");
      if (fromGet && typeof fromGet.register === "function") return fromGet;
    } catch {
      /* 서비스가 아직 기동되지 않았다 */
    }
    return null;
  };

  const declare = async () => {
    if (stopped) return;
    const reg = registry();
    if (!reg) {
      if (tries++ < RETRY_LIMIT) setTimeout(declare, 500);
      return;
    }
    try {
      // Back up an old managed source before installPreset updates it, too.
      const previousDir = presetDir();
      const previous = migratePresetDefinition(readPresetDefinition(UNRESTRICTED_PRESET, previousDir));
      if (previous.policies.length) backupPresetMigration({ home: findDshHome(), dir: previousDir, id: UNRESTRICTED_PRESET, policies: previous.policies });
      // 사용자가 아직 설치하지 않았다면 먼저 배치해 드롭다운에 항상 이 프리셋이 있게 한다.
      try {
        installPreset({ force: false });
      } catch {
        /* 데이터 디렉터리에 쓸 수 없으면 패키지 내 템플릿으로 등록한다 */
      }
      const dir = presetDir();
      const definition = readPresetDefinition(UNRESTRICTED_PRESET, dir);
      const migrated = migratePresetDefinition(definition);
      const backup = backupPresetMigration({ home: findDshHome(), dir, id: definition.id, policies: migrated.policies });
      release = await registerPresetDefinitions(reg, migrated.definitions);
      if (stopped) { await release(); release = undefined; return; }
      ctx.logger?.info?.("dsh-purge-presets: 프리셋 등록 완료 %s", definition.id);
      if (backup) ctx.logger?.info?.("dsh-purge-presets: 하위 작업 정책을 마이그레이션했습니다. 원본 설정은 그대로 두었으며 백업은 %s", backup);
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      ctx.logger?.warn?.("dsh-purge-presets: 등록 실패 %s", message);
      // 중복 등록 / 잘못된 정의는 종료 상태이므로 재시도하면 로그만 늘어난다.
      if (/already|duplicate|invalid/i.test(message)) return;
      if (tries++ < RETRY_LIMIT) setTimeout(declare, 1000);
    }
  };

  declare();

  ctx.effect(() => async () => {
    stopped = true;
    try {
      await release?.();
    } catch {
      /* ignore */
    }
  }, "dsh-purge-presets.registration");
}
