import { CommunityMaintenance } from "./maintenance.js";
// UI derived from YuJunZhiXue/dsh-purge 1.1.71 (MIT). See LICENSE.
import { h, useState, useEffect } from "../shared/react.js";
import {
  compatibilityLevelText,
  setTranslate,
  useT,
} from "../shared/locale.js";
import { apiJson } from "../api/client.js";
import { PURGE_CSS, NATIVE_CSS } from "../styles/index.js";
import { Btn } from "./primitives.js";
import { PurgifySection } from "./settings-form.js";
import { RulesSection } from "./rules.js";
import { SkillsSection } from "./skills.js";
import { __dshPurgeDrill } from "../vendor/drill.js";
import {
  readDrillAuth,
  setDock,
  useDock,
  requestDrill,
} from "../state/dock.js";

/**
 * 커뮤니티판 호환 안내: 백엔드 /dsh-purge/community 가 보고하는 호스트 버전과 호환 수준을 읽는다.
 * 원본 1.1.71 의 CompatibilityNote 는 공식 인터페이스 버전에만 경고했다. 커뮤니티판은 이 fork 의
 * 실제 호스트 버전/호환 수준으로 바꾸고, 항상 렌더한다(더 이상 무조건 return null 하지 않는다).
 */
export function CommunityCompatibilityNote() {
  const t = useT();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    apiJson("/dsh-purge/community")
      .then((d) => {
        if (d && d.ok !== false) setInfo(d);
        else setError((d && d.error) || "bad response");
      })
      .catch((e) => setError((e && e.message) || String(e)));
  }, []);
  const compat = (info && info.compatibility) || null;
  const host = (compat && compat.host_version) || "unknown";
  const text = compat
    ? t("compat.host", {
        version: info && info.version ? info.version : "—",
        host,
        level: compatibilityLevelText(t, compat.level),
      })
    : error
      ? t("compat.unavailable", { error })
      : t("compat.loading");
  return h(
    "p",
    {
      role: "status",
      className: "dshpp-hint",
      style: { margin: "0 20px 10px" },
    },
    text,
    compat && compat.message ? " " + compat.message : "",
  );
}

export function CompatibilityNote({ status }) {
  if (__COMMUNITY__) return h(CommunityCompatibilityNote);
  if (!status) return null;
  const v = String(status.plugin_version || "");
  const valid = typeof status.patches_total === "number" && !!v;
  if (valid && v === "1.1.71") return null;
  return h(
    "p",
    {
      role: "status",
      className: "dshpp-hint",
      style: { margin: "0 20px 10px" },
    },
    valid
      ? "공식 버전 " +
          v +
          ". 이 UI 는 1.1.71 에서 검증했습니다. 설정이 이상하면 UI 플러그인을 업데이트하세요."
      : "공식 Purge 인터페이스를 확인할 수 없습니다. 공식 플러그인이 활성화되어 있는지 확인하거나 UI 플러그인을 업데이트하세요.",
  );
}

export function SettingsRoot(props = {}) {
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
    h("style", null, PURGE_CSS + NATIVE_CSS),
    h(
      "header",
      { className: "dshpp-native-head" },
      h("div", null, h("h2", null, "Purge"), h("p", null, "플러그인 설정")),
      h(
        "span",
        { className: "dshpp-native-badge" },
        (__COMMUNITY__ ? "커뮤니티판 " : "독립 UI ") + __PANEL_VERSION__,
      ),
    ),
    h(CompatibilityNote, { status: backendStatus }),
    h(
      "nav",
      { className: "dshpp-native-nav", "aria-label": "Purge 설정 분류" },
      [
        ["status", "상태"],
        ["prompt", "프롬프트"],
        ["rules", "규칙"],
        ["skills", "스킬"],
        ["more", "더 보기"],
      ].map(([id, label]) =>
        h(
          "button",
          {
            key: id,
            type: "button",
            "aria-pressed": page === id,
            onClick: () => select(id),
          },
          label,
        ),
      ),
    ),
    h(
      "div",
      { className: "dshpp-native-content" },
      __COMMUNITY__ && page === "status" ? h(CommunityMaintenance) : null,
      h(
        "div",
        { hidden: !["status", "prompt", "more"].includes(page) },
        h(PurgifySection, { page, onStatus: setBackendStatus }),
      ),
      visited.rules
        ? h("div", { hidden: page !== "rules" }, h(RulesSection))
        : null,
      visited.skills
        ? h("div", { hidden: page !== "skills" }, h(SkillsSection))
        : null,
      h(
        "div",
        { hidden: page !== "more", className: "dshpp-more" },
        h("h3", null, "드릴 콘솔"),
        h("p", null, "플러그인에 원래 있던 드릴 도구와 환경 설정을 엽니다."),
        h(
          Btn,
          {
            onClick: () => {
              select("drill");
              requestDrill("tab");
            },
          },
          "드릴 콘솔 열기",
        ),
        h(
          "p",
          { className: "dshpp-attribution" },
          __COMMUNITY__
            ? "YuJunZhiXue/dsh-purge 1.1.71 기반 독립 유지, 원저자 표기 보존. 업데이트는 이 fork 에서만 옵니다."
            : "UI 독립 유지. 공식 Purge 는 따로 업데이트할 수 있습니다. YuJunZhiXue/dsh-purge 1.1.71 기반(MIT).",
        ),
      ),
      page === "drill"
        ? h(
            "div",
            { className: "dshpp-native-drill" },
            // 드릴 콘솔은 자체 CSS(.rt-*)를 쓴다. 옛 버전은 dock 이 <head> 에 주입했지만 재구성 때 빠져서,
            // 결과 패널이 오른쪽 사이드바에서 스타일 없이 글자가 한 열로 눌렸다. 여기서 컴포넌트와 함께 붙인다.
            __dshPurgeDrill && __dshPurgeDrill.CSS
              ? h("style", { "data-dsh-purge-drill": "1" }, __dshPurgeDrill.CSS)
              : null,
            h(
              Btn,
              {
                onClick: () => {
                  setDock({ tab: "clean" });
                  select("more");
                },
              },
              "설정으로 돌아가기",
            ),
            readDrillAuth()
              ? h(__dshPurgeDrill.Panel, { embedded: true })
              : h("p", null, "먼저 드릴 콘솔 승인을 마쳐야 합니다."),
          )
        : null,
    ),
  );
}
