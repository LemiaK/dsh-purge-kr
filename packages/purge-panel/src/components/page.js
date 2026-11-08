// Full-page shell for the left sidebar entry. Replaces the old right-sidebar
// drawer: same components, but laid out like a DSH settings page (host font,
// host tokens, one column, explanations in "?" tips instead of paragraphs).
import { h, useState, useEffect, useCallback } from "../shared/react.js";
import { PURGE_CSS, NATIVE_CSS, PAGE_CSS } from "../styles/index.js";
import { compatibilityLevelText, useT } from "../shared/locale.js";
import { apiJson, unavailableStatus } from "../api/client.js";
import { Btn, HelpTip } from "./primitives.js";
import { PurgifySection } from "./settings-form.js";
import { RulesSection } from "./rules.js";
import { SkillsSection } from "./skills.js";
import { CommunityMaintenance, StatusExtras } from "./maintenance.js";
import { __dshPurgeDrill } from "../vendor/drill.js";
import { readDrillAuth, setDock, requestDrill } from "../state/dock.js";

const TABS = [
  ["status", "상태", "호스트 호환, 패치, 탈옥 자체 점검"],
  ["prompt", "프롬프트", "주입 본문과 탈옥 강화 섹션"],
  ["rules", "규칙", "규칙 세트와 워크스페이스 정책"],
  ["skills", "스킬", "DSH 스킬 카탈로그"],
  ["drill", "드릴 콘솔", "레드팀 드릴과 환경 적응"],
  ["more", "더 보기", "서버 목록, 업데이트, 유지보수"],
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
      "aria-hidden": true,
    },
    h("path", { d: "M12 3l7 3v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9V6l7-3z" }),
    h("path", { d: "M9.5 12.2l1.8 1.8 3.4-3.6" }),
  );
}

export function StatusStrip({ info }) {
  const t = useT();
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
        className: "dshpp-dot " + (ok ? "is-ok" : level ? "is-warn" : ""),
      }),
      "DSH ",
      h("b", null, compat.host_version || "…"),
    ),
    h(
      "span",
      { className: "dshpp-strip-item" },
      "호환 수준 ",
      h(
        "b",
        null,
        level
          ? compatibilityLevelText(t, level)
          : info?.ok === false
            ? "读取失败"
            : "检测中",
      ),
      h(
        HelpTip,
        { title: "호환 수준" },
        compat.message ||
          "호스트 컴포넌트 버전을 읽고 결론을 냅니다. qualified 는 해당 DSH 버전의 패치 앵커를 항목별로 회귀 검증했다는 뜻입니다.",
      ),
    ),
    h(
      "span",
      { className: "dshpp-strip-item" },
      "디스크 기록 수 ",
      h(
        "b",
        null,
        `${info?.patches_applied ?? "?"}/${info?.patches_total ?? "?"}`,
        info?.patches_na > 0
          ? ` · ${info.patches_na}건 이 컴퓨터에 해당 없음`
          : "",
      ),
      h(
        HelpTip,
        { title: "호스트 패치" },
        `실제로 DSH 호스트 코드에 기록된 패치 수(분모는 이 컴퓨터에 해당하는 항목만). 전체 패치 ${info?.patches_total_all ?? "?"}건 중 ${info?.patches_na ?? 0}건은 대상 플러그인/프리셋이 설치되지 않았습니다. '적용 대기'는 앵커가 남아 있고 아직 쓰지 않았다는 뜻이고, '불일치'는 호스트 소스가 바뀌어 앵커를 다시 찾아야 한다는 뜻입니다.`,
      ),
    ),
    h(
      "span",
      { className: "dshpp-strip-item" },
      "플러그인 ",
      h("b", null, info?.plugin_version || __PANEL_VERSION__),
    ),
  );
}

/** 디스크 아카이브와 프로세스 진입점은 따로 표시한다. 디스크 기록만으로 런타임 로드를 추론하면 안 된다. */
export function LayoutNotice({ info }) {
  if (!info || (!info.asar_still_sealed && !info.host_layout)) return null;
  const sealed = info.asar_still_sealed === true;
  const note =
    info.host_layout?.note ||
    "대상 디스크에 아직 app.asar 가 있고, 현재 프로세스의 로드 출처는 아직 확인되지 않았습니다.";
  const handoff = info.asar_handoff
    ? ` 패키지 교체 상태: ${{ not_scheduled: "아직 적용되지 않음. '적용'을 눌러야 패키지 교체가 예약됩니다", archive_reappeared: "아카이브가 다시 나타났습니다. 옛 교체 기록은 현재 완료를 뜻하지 않습니다", backup_missing: "원본 아카이브 백업이 없습니다. 진단을 확인하세요", unknown_target: "대상 인스턴스가 확정되지 않음", unreadable: "교체 기록을 읽을 수 없습니다. 진단을 확인하세요", starting: "도우미 시작 중(준비 확인 전)", ready: "도우미 준비 완료", waiting_for_quit: "완전 종료 대기(macOS ⌘Q / Windows 시스템 트레이)", waiting_for_unlock: "아카이브 잠금 해제 대기", moving: "원본 아카이브 보존 중", complete: "교체 완료. DSH 를 직접 여세요", already_unsealed: "아카이브를 옮겼습니다. DSH 를 직접 여세요", failed: "실패. 진단을 확인하고 복구 문서에 따라 조치하세요", expired: "대기 시간 초과. 다시 적용하거나 복구 문서에 따라 조치하세요", helper_stopped: "도우미가 예기치 않게 종료됐습니다. 다시 적용하거나 복구 문서에 따라 조치하세요" }[info.asar_handoff.phase] || info.asar_handoff.phase}.`
    : "";
  const failure = info.asar_handoff?.error;
  const detail = info.asar_handoff?.detail
    ? ` 상세: ${info.asar_handoff.detail}${failure?.win32_code != null ? `(Windows 오류 ${failure.win32_code})` : ""}`
    : "";
  const layout = info.host_layout;
  if (
    info.ok !== false &&
    info.surface === "web" &&
    layout?.disk?.surface === "web" &&
    layout.state === "unknown_runtime" &&
    layout.process?.entry_layout === "unknown" &&
    layout.process.matches_target === null &&
    layout.disk.archive_exists === null &&
    layout.disk.unpacked_exists === null &&
    !info.desktop_exe &&
    !info.desktop_install &&
    !sealed &&
    !layout.errors?.length &&
    info.asar_handoff?.phase === "unknown_target" &&
    !info.asar_handoff.error &&
    !info.asar_handoff.detail
  ) {
    return h(
      "details",
      { className: "dshpp-layout-details" },
      h("summary", null, "换包状态：不适用（Web 宿主）"),
      h(
        "p",
        { className: "dshpp-note" },
        "Web 服务无需桌面归档换包。原始诊断：",
        layout.state,
        " / ",
        info.asar_handoff.phase,
      ),
    );
  }
  const confirmed =
    info.host_layout?.state === "unpacked_entry" &&
    info.host_layout?.process?.matches_target === true &&
    info.host_layout?.disk?.archive_exists === false;
  const diskNote =
    info.host_layout?.disk?.archive_exists === true
      ? " 대상 디스크에 아직 app.asar 가 있습니다."
      : "";
  if (sealed || !confirmed) {
    return h(
      "p",
      { className: "dshpp-warn", role: "status" },
      note,
      diskNote,
      handoff,
      detail,
    );
  }
  // 패키지 교체가 정상이면 확인 한 줄만 남기고 설명은 details 로 접는다. "진입점이 곧 재로드"는
  // 상시 설명이라 매번 한 줄을 차지할 이유가 없다.
  return h(
    "details",
    { className: "dshpp-layout-details" },
    h("summary", null, "✓ 언팩 디렉터리에서 시작됨(패키지 교체 완료)"),
    h("p", { className: "dshpp-note" }, note, diskNote, handoff, detail),
  );
}

/** UI 와 백엔드가 같은 패키지가 아니면 눈에 띄게 알린다. 그렇지 않으면 사용자는 설정이 적용되지 않았다고 여긴다. */
export function VersionNotice({ info }) {
  if (info && info.ok === false) {
    return h(
      "p",
      { className: "dshpp-warn", role: "status" },
      `상태 읽기 실패: ${info.error || "인터페이스 사용 불가"}. 현재 호스트와 패치 상태를 알 수 없습니다. '새로 고침'을 다시 눌러 보고, 계속 실패하면 운영체제, DSH/플러그인 버전과 이 오류를 알려 주세요.`,
    );
  }
  const backend = info?.plugin_version;
  if (!backend || backend === __PANEL_VERSION__) return null;
  return h(
    "p",
    { className: "dshpp-warn", role: "status" },
    `공식 버전 ${backend}, UI ${__PANEL_VERSION__}. 둘이 다르면 설정이 적용되지 않을 수 있으니, 같은 버전으로 업데이트한 뒤 DSH 를 재시작하세요.`,
  );
}

export function PurgePage() {
  const t = useT();
  const [tab, setTab] = useState("status");
  const [visited, setVisited] = useState({ status: true });
  const [info, setInfo] = useState(null);
  const select = (id) => {
    setTab(id);
    setVisited((v) => Object.assign({}, v, { [id]: true }));
  };
  const loadInfo = () =>
    apiJson("/dsh-purge/status")
      .then(setInfo)
      .catch((error) => setInfo(unavailableStatus(error)));
  // 하위 컴포넌트의 onStatus 가 의존성에 들어가므로 안정적인 참조여야 한다. 그렇지 않으면 렌더링마다 setInfo 가 한 번 더 실행된다.
  const mergeInfo = useCallback((s) => s && setInfo(s), []);
  useEffect(() => {
    if (tab === "status") loadInfo();
  }, [tab]);
  useEffect(() => {
    const phase = info?.asar_handoff?.phase;
    if (
      ![
        "starting",
        "ready",
        "waiting_for_quit",
        "waiting_for_unlock",
        "moving",
      ].includes(phase)
    )
      return;
    const timer = setInterval(loadInfo, 2000);
    return () => clearInterval(timer);
  }, [info?.asar_handoff?.phase]);
  const active = TABS.find((row) => row[0] === tab) || TABS[0];
  return h(
    "div",
    { className: "dshpp-page" },
    h("style", null, PURGE_CSS + NATIVE_CSS + PAGE_CSS),
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
          __COMMUNITY__
            ? h(
                "span",
                { className: "dshpp-page-ver" },
                "커뮤니티판 " + __PANEL_VERSION__,
              )
            : null,
        ),
      ),
    ),
    h(StatusStrip, { info }),
    h(VersionNotice, { info }),
    h(LayoutNotice, { info }),
    h(
      "nav",
      { className: "dshpp-page-tabs", role: "tablist" },
      TABS.map(([id, label]) =>
        h(
          "button",
          {
            key: id,
            type: "button",
            role: "tab",
            "aria-selected": tab === id ? "true" : "false",
            className: tab === id ? "is-on" : "",
            onClick: () => select(id),
          },
          label,
        ),
      ),
    ),
    h(
      "div",
      { className: "dshpp-page-body" },
      h(
        "div",
        { hidden: tab !== "status", className: "dshpp-sec" },
        h(PurgifySection, { page: "status", onStatus: mergeInfo }),
        h(StatusExtras),
        h(CommunityMaintenance),
      ),
      h(
        "div",
        { hidden: tab !== "prompt", className: "dshpp-sec" },
        visited.prompt ? h(PurgifySection, { page: "prompt" }) : null,
      ),
      h(
        "div",
        { hidden: tab !== "rules", className: "dshpp-sec" },
        visited.rules ? h(RulesSection) : null,
      ),
      h(
        "div",
        { hidden: tab !== "skills", className: "dshpp-sec" },
        visited.skills ? h(SkillsSection) : null,
      ),
      h(
        "div",
        { hidden: tab !== "more", className: "dshpp-sec" },
        visited.more ? h(PurgifySection, { page: "more" }) : null,
      ),
      tab === "drill"
        ? h(
            "div",
            { className: "dshpp-sec dshpp-page-drill" },
            __dshPurgeDrill && __dshPurgeDrill.CSS
              ? h("style", { "data-dsh-purge-drill": "1" }, __dshPurgeDrill.CSS)
              : null,
            readDrillAuth()
              ? h(__dshPurgeDrill.Panel, { embedded: true })
              : h(
                  "div",
                  { className: "dshpp-card" },
                  h(
                    "p",
                    { className: "dshpp-muted" },
                    "드릴 콘솔은 먼저 한 번 승인이 필요합니다.",
                  ),
                  h(
                    Btn,
                    {
                      kind: "primary",
                      onClick: () => {
                        setDock({ tab: "drill", authOpen: true });
                        requestDrill("auth");
                      },
                    },
                    "승인하러 가기",
                  ),
                ),
          )
        : null,
    ),
    h(
      "footer",
      { className: "dshpp-page-foot" },
      __COMMUNITY__
        ? "YuJunZhiXue/dsh-purge 1.1.71 기반 독립 유지 · MIT · 원저자 표기 유지"
        : "UI 독립 유지 · YuJunZhiXue/dsh-purge 1.1.71 기반(MIT)",
    ),
  );
}

export { PurgeGlyph };
