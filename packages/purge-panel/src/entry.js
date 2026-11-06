// UI derived from YuJunZhiXue/dsh-purge 1.1.71 (MIT). See LICENSE.
import { h, react } from "./shared/react.js";
import { PURGE_CSS } from "./styles/index.js";
import { useDock, startGrantSync } from "./state/dock.js";
import { AuthGate } from "./components/auth.js";
import { setTranslate, translate } from "./shared/locale.js";
import { SettingsRoot } from "./components/settings-shell.js";
import { PurgePage, PurgeGlyph } from "./components/page.js";
import { bindSessionContext } from "./state/session-context.js";
import { installLegacyVisibility } from "./state/legacy-visibility.js";
import { installRewindUi } from "./components/rewind.js";
import { WelcomeNotice } from "./components/welcome.js";
import { EnvAdaptSendGate } from "./components/env-gate.js";

export const name = __COMMUNITY__ ? "dsh-purge-community" : "dsh-purge-panel";

export const inject = ["slots"];

export function PurgeIcon({ size = 20 } = {}) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.6,
      "aria-hidden": true,
    },
    h("path", { d: "M4 7h16M4 17h16" }),
    h("circle", { cx: 9, cy: 7, r: 3, fill: "none" }),
    h("circle", { cx: 15, cy: 17, r: 3, fill: "none" }),
  );
}

function PurgeGlyphIcon({ size = 16 } = {}) {
  return h(PurgeGlyph, { size });
}

export function PanelOverlays() {
  const st = useDock();
  return h(
    react.Fragment,
    null,
    h("style", null, PURGE_CSS),
    // Restored from 1.1.71 apply(): shell.overlay carried the welcome notice
    // and the red-team environment gate next to the dock.
    h(WelcomeNotice, {
      repo: __COMMUNITY__
        ? "https://github.com/wnduddld0513/dsh-purge-kr"
        : undefined,
    }),
    h(EnvAdaptSendGate),
    st.authOpen ? h(AuthGate, { pending: st.pending }) : null,
  );
}

export function apply(ctx) {
  ctx.effect(() => installLegacyVisibility(), "panel legacy visibility");
  ctx.inject(["sessions", "uiWorkspace"], (host) => {
    host.effect(() => bindSessionContext(host), "panel session context");
  });
  ctx.effect(startGrantSync, "panel grant sync");
  // Restored from 1.1.71 apply(): conversation.input.right rewind button.
  ctx.inject(["sessions", "uiWorkspace", "conversation"], (host) =>
    installRewindUi(host),
  );
  // 호스트 locale 카탈로그에 언어를 추가하거나 사전을 등록하지 않는다.
  // (전역 언어 목록 오염과, 공식/서드파티 한국어 언어팩과의 "ko" 중복 충돌을 막는다.)
  // 패널 문구는 번들 안의 사전으로 해석하므로 클라이언트 언어와 무관하게 항상 한국어다.
  setTranslate(translate);
  const t = translate;
  ctx.slots.inject("shell.overlay", () =>
    ctx.slots.register(
      {
        name: "shell.overlay",
        id: "dsh-purge-panel-overlays",
        order: 60,
      },
      PanelOverlays,
    ),
  );
  // 왼쪽 사이드바 진입점: 아이콘 + 전체 페이지. 오른쪽 드로어는 중복을 피하기 위해 더 이상 등록하지 않는다.
  ctx.slots.inject("sidebar.panellist", () =>
    ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: "dsh-purge",
        order: 30,
        label: "Purge",
        inject: () => ({ t }),
      },
      PurgeGlyphIcon,
    ),
  );
  ctx.slots.inject("main", () =>
    ctx.slots.register(
      {
        name: "main",
        key: "dsh-purge",
        inject: () => ({ t }),
      },
      PurgePage,
    ),
  );
  ctx.slots.inject("plugins.bundle.config", () =>
    ctx.slots.register(
      {
        name: "plugins.bundle.config",
        key: __COMMUNITY__ ? "dsh-purge-community" : "dsh-purge-panel",
        inject: () => ({ t }),
      },
      SettingsRoot,
    ),
  );
}
