import {
  h,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "../shared/react.js";
import { apiJson } from "../api/client.js";
import { useT } from "../shared/locale.js";
import { Btn, HelpTip } from "./primitives.js";
/**
 * 항목이 등록되지 않으면 t() 가 key 를 그대로 돌려준다. 여기서 한국어 기본값을 한 겹 받쳐
 * 패널에 "updch.open" 같은 문자열이 그대로 노출되지 않게 한다.
 */
function useText() {
  const t = useT();
  return (key, fallback) => {
    const hit = t(key);
    return hit && hit !== key ? hit : fallback;
  };
}
/**
 * 상태 페이지 위쪽의 정보 두 가지: 탈옥 자체 점검(기본 접힘) + 탈옥 강화 섹션 스위치.
 * 따로 떼어 둔 이유는 "적용" 버튼을 페이지 맨 위에 두고, 자체 점검이 한 화면을 차지하지 않게 하기 위함이다.
 */
export function StatusExtras() {
  const [check, setCheck] = useState(null);
  const [boost, setBoost] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const load = () =>
    Promise.all([
      apiJson("/dsh-purge/selfcheck")
        .then(setCheck)
        .catch(() => setCheck(null)),
      apiJson("/dsh-purge/boost")
        .then((r) => setBoost(!!r.enabled))
        .catch(() => setBoost(null)),
    ]);
  useEffect(() => {
    load();
  }, []);
  async function toggle() {
    try {
      const r = await apiJson("/dsh-purge/boost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: !boost }),
      });
      setBoost(!!r.enabled);
      setNotice(r.enabled ? "켰습니다. 재시작 후 적용됩니다" : "껐습니다. 재시작 후 적용됩니다");
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
    (l) => l.state === "broken" || (!l.state && !l.ok),
  );
  const pendingLayers = layers.filter((l) => l.state === "pending");
  const uncertain = layers.filter((l) =>
    ["inferred", "unknown"].includes(l.state),
  );
  const pendingPatches = pendingLayers.reduce(
    (n, l) => n + (l.pending?.length || 0),
    0,
  );
  const total = layers.filter((layer) => layer.applicable !== false).length;
  return h(
    "section",
    { className: "dshpp-card", "aria-label": "탈옥 상태" },
    h(
      "div",
      { className: "dshpp-line" },
      h(
        "span",
        { className: "dshpp-line-main" },
        h("i", {
          className:
            "dshpp-dot " +
            (check
              ? failed.length
                ? "is-bad"
                : pendingLayers.length || uncertain.length
                  ? "is-warn"
                  : "is-ok"
              : ""),
        }),
        "탈옥 자체 점검",
        h(
          "b",
          null,
          check
            ? failed.length
              ? `${failed.length}개 계층 미적용`
              : pendingLayers.length
                ? `${pendingPatches}건 적용 대기`
                : uncertain.length
                  ? `${uncertain.length}개 계층 확인 필요`
                  : `${total}개 계층 모두 정상`
            : "확인 중…",
        ),
      ),
      h(
        "details",
        { className: "dshpp-fold-inline" },
        h("summary", null, "계층별 보기"),
        h(
          "div",
          { className: "dshpp-checks" },
          check && Array.isArray(check.layers)
            ? check.layers.map((layer) =>
                h(
                  "div",
                  {
                    key: layer.title,
                    className:
                      "dshpp-check" +
                      (["pending", "inferred", "unknown"].includes(layer.state)
                        ? " is-warn"
                        : layer.ok
                          ? ""
                          : " is-bad"),
                  },
                  h("i", {
                    className:
                      "dshpp-dot " +
                      (["pending", "inferred", "unknown"].includes(layer.state)
                        ? "is-warn"
                        : layer.ok
                          ? "is-ok"
                          : "is-bad"),
                  }),
                  h("span", { className: "dshpp-check-name" }, layer.title),
                  h(
                    "span",
                    { className: "dshpp-check-val" },
                    layer.applicable === false
                      ? "해당 없음"
                      : layer.state === "pending"
                        ? `적용 대기 #${(layer.pending || []).join("/#")}`
                        : layer.state === "inferred"
                          ? "호스트 추론"
                          : layer.state === "unknown"
                            ? "미확인"
                            : `${layer.applied}/${layer.required ?? layer.total}`,
                  ),
                  layer.note
                    ? h(HelpTip, { title: layer.title }, layer.note)
                    : null,
                ),
              )
            : h("div", { className: "dshpp-muted" }, "확인 중…"),
        ),
      ),
      h(
        Btn,
        { tiny: true, disabled: busy, onClick: rerun },
        busy ? "…" : "다시 검사",
      ),
      h(
        Btn,
        {
          tiny: true,
          title: "일회용 프로브를 만듭니다. 다음 턴 응답에서 모델이 그 표식을 그대로 되풀이하는지 확인합니다",
          onClick: async () => {
            try {
              const r = await apiJson("/dsh-purge/probe", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: "{}",
              });
              setNotice(r.message || "");
            } catch (e) {
              setNotice(e.message);
            }
          },
        },
        "프로브",
      ),
    ),
    h(
      "div",
      { className: "dshpp-line" },
      h(
        "span",
        { className: "dshpp-line-main" },
        "탈옥 강화 섹션",
        h(
          HelpTip,
          { title: "탈옥 강화 섹션" },
          "시스템 프롬프트 끝에 주입과 같은 등급의 텍스트를 덧붙입니다: 계층 선언 / 거부는 곧 장애 / 아첨 저항 / 다중 라운드 재확인. 기본값은 켜짐입니다.",
        ),
        h("b", null, boost === null ? "…" : boost ? "켜짐" : "꺼짐"),
      ),
      h(
        Btn,
        { tiny: true, disabled: boost === null, onClick: toggle },
        boost ? "끄기" : "켜기",
      ),
      notice ? h("span", { className: "dshpp-muted" }, notice) : null,
    ),
  );
}

export function assertMaintenanceResult(result) {
  if (!result || typeof result !== "object")
    throw new Error("유지보수 인터페이스가 유효하지 않은 결과를 돌려줬습니다");
  if (result.ok === false) {
    const errors = Array.isArray(result.errors)
      ? result.errors.filter(Boolean).join(" · ")
      : "";
    const partial = result.applied
      ? " · 일부 대상은 이미 업데이트했습니다. 해당 DSH 프로세스를 재시작해 로드하세요"
      : "";
    throw new Error((result.error || errors || "유지보수 작업 실패") + partial);
  }
}
export function maintenanceNotice(op, result) {
  if (op === "backup") {
    if (!result.id)
      throw new Error("백업 작업이 백업 번호를 돌려주지 않았습니다. 목록을 새로 고쳐 결과를 확인하세요");
    return `백업을 만들었다: ${result.id}`;
  }
  if (op === "rollback")
    return (
      (result.note || "플러그인 롤백을 마쳤습니다") +
      ". DSH 프로세스를 재시작하세요. 브라우저만 새로 고치면 새 백엔드가 로드되지 않습니다."
    );
  if (op === "update") {
    if (result.applied === false || result.skipped)
      return result.note || "새 버전을 설치하지 않았습니다. 현재 설치본은 그대로입니다.";
    if (result.applied || result.needRestart || result.restart_required) {
      const version =
        result.release?.version || result.localVersion || result.remoteVersion;
      const warnings = result.cleanup_warnings || [];
      const cleanup = warnings.length
        ? `정리를 마치지 못했습니다(${warnings.map((w) => `${w.stage}:${w.code}`).join(", ")}). 남은 파일은 보존했습니다.`
        : "";
      return `${cleanup}플러그인을 설치했습니다${version ? ": " + version : ""}. DSH 프로세스를 재시작하세요. 브라우저만 새로 고치면 새 백엔드가 로드되지 않습니다.`;
    }
    return result.note || "업데이트 요청을 마쳤습니다. 상태를 새로 고쳐 설치 결과를 확인하세요.";
  }
  return result.note || "유지보수 작업을 마쳤습니다";
}

export function UpdatePreferences({
  value,
  status = {},
  onSaved,
  onOpenChannel,
}) {
  const tr = useText();
  const [saving, setSaving] = useState(false),
    [error, setError] = useState("");
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
        body: JSON.stringify({ op: "preferences", value: patch }),
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
    { "aria-label": "자동 업데이트 설정", className: "dshpp-card" },
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
          "aria-label": "자동 업데이트 확인",
        }),
        "자동 업데이트 확인",
      ),
      h(HelpTip, {
        title: "자동 업데이트 확인",
        children:
          "시작 30초 뒤 확인하고, 이후에는 간격에 따라 확인합니다. 끄더라도 저장된 자동 설치 설정은 바뀌지 않지만 자동 설치가 일시 정지됩니다.",
      }),
      h(
        "select",
        {
          "aria-label": "업데이트 확인 간격",
          value: value.intervalHours,
          disabled: saving || !value.autoCheck,
          onChange: (e) => save({ intervalHours: Number(e.target.value) }),
        },
        [...new Set([1, 6, 12, 24, value.intervalHours])]
          .sort((a, b) => a - b)
          .map((v) => h("option", { key: v, value: v }, `${v}시간마다`)),
      ),
      // "업데이트 채널"은 위 두 컨트롤과 같은 줄에 나란히 두고 크기를 select 에 맞춘다.
      // 이 버튼이 설정하는 것이 바로 이 업데이트 확인이 쓰는 프록시/키이므로, 제목 맨 오른쪽으로 밀리면 안 된다.
      onOpenChannel
        ? h(
            Btn,
            {
              tiny: true,
              className: "dshpp-updch-open",
              disabled: saving,
              onClick: () => onOpenChannel(),
              title: tr("updch.title", "업데이트 채널: 프록시와 GitHub 키"),
            },
            tr("updch.open", "업데이트 채널"),
          )
        : null,
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
          "aria-label": "자동 업데이트 설치",
        }),
        "자동 업데이트 설치",
      ),
      h(HelpTip, {
        title: "자동 업데이트 설치",
        children:
          "자동 확인이 켜져 있고 잠기지 않은 새 정식 버전을 찾았을 때만 설치합니다. 설치 전에 백업하고 릴리스 패키지를 검증하며, 실패해도 소스를 자동으로 바꾸지 않습니다. 설치 후에는 직접 재시작하기를 기다리고, DSH 를 자동으로 재시작하지 않습니다.",
      }),
    ),
    h(
      "p",
      { className: "dshpp-hint" },
      status.reconciliationError
        ? "설치 상태 확인 대기 중이라 자동 설치를 일시 정지했습니다."
        : status.restartRequired
          ? `디스크 버전 ${status.pendingVersion}, 현재 실행 ${status.runningVersion || "알 수 없음"}. DSH 를 직접 재시작하기를 기다립니다.`
          : !value.autoCheck
            ? "자동 확인이 꺼져 있어 자동 설치도 멈춰 있습니다."
            : status.checkedAt
              ? `마지막 확인: ${new Date(status.checkedAt).toLocaleString()}${status.hasUpdate ? ` · 사용 가능한 버전 ${status.availableVersion}` : ""}`
              : "시작 후 자동으로 확인하고, 설치 후에는 직접 재시작하도록만 안내합니다.",
    ),
    status.reconciliationError
      ? h("p", { role: "alert" }, status.reconciliationError)
      : null,
    [...new Set([status.error, status.installError].filter(Boolean))].map(
      (message) => h("p", { key: message, role: "alert" }, message),
    ),
    error ? h("p", { role: "alert" }, error) : null,
  );
}

/**
 * 업데이트 채널: 프록시 주소 + GitHub 키.
 * GET /dsh-purge/community 가 돌려주는 update_preferences 의 githubToken 은 항상 빈 문자열이고,
 * hasGithubToken 만으로 이 컴퓨터에 설정돼 있는지 알 수 있다. 그래서 입력창은 항상 비어 있고 평문을 되돌려 채우지 않는다.
 * 저장 규칙: value.proxyUrl 은 항상 보낸다(빈 문자열 = 상속). 키를 실제로 입력했을 때만 githubToken 을 보내고,
 * 비워 두면 기존 키를 유지한다. 지우려면 clearGithubToken:true 를 보낸다.
 * 패널에는 믿을 만한 react-dom portal 이 없어 고정 위치 + 오버레이 div 로 대화상자를 직접 구현한다.
 */
export function UpdateChannelDialog({ value, onClose, onSaved }) {
  const tr = useText();
  const [proxy, setProxy] = useState(value?.proxyUrl || "");
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
      /* 호스트 환경에 실제 DOM 이 없을 수 있다. 포커스 실패는 저장에 영향이 없다 */
    }
  }, []);
  useEffect(() => {
    if (typeof document === "undefined" || !document.addEventListener)
      return undefined;
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
    if (proxy.trim() !== (value?.proxyUrl || "")) next.proxyUrl = proxy.trim();
    // 지우기를 체크했다면 입력창 내용을 보내지 않는다. 두 동작이 서로를 덮지 않게 하기 위함이다.
    if (clearToken) next.clearGithubToken = true;
    else if (token.trim()) next.githubToken = token.trim();
    setSaving(true);
    setError("");
    try {
      const result = await apiJson("/dsh-purge/community", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op: "preferences", value: next }),
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
      "aria-label": tr("updch.title", "업데이트 채널: 프록시와 GitHub 키"),
      onClick: (e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      },
    },
    h(
      "div",
      { className: "dshpp-updch-card" },
      h(
        "h4",
        { className: "dshpp-updch-title" },
        tr("updch.title", "업데이트 채널: 프록시와 GitHub 키"),
      ),
      h(
        "p",
        { className: "dshpp-hint" },
        tr(
          "updch.scope",
          "여기서 설정한 프록시와 키는 이 플러그인의 업데이트 확인과 다운로드 경로에만 적용되고, 다른 모델 공급자 요청에는 영향을 주지 않으며 호스트 프로세스 환경에도 쓰지 않습니다. 비워 두면 기존 업데이트 프록시 환경을 상속합니다.",
        ),
      ),
      h(
        "label",
        { className: "dshpp-updch-label" },
        h("span", null, tr("updch.proxy", "프록시 주소")),
        h("input", {
          ref: proxyRef,
          type: "text",
          className: "dshpp-field dshpp-updch-field",
          "aria-label": tr("updch.proxy", "프록시 주소"),
          value: proxy,
          disabled: saving,
          placeholder: tr("updch.proxy.ph", "socks5://127.0.0.1:60808"),
          spellCheck: false,
          autoComplete: "off",
          onChange: (e) => setProxy(e.target.value),
        }),
      ),
      h(
        "p",
        { className: "dshpp-hint" },
        tr(
          "updch.proxy.hint",
          "http:// / https:// / socks5:// 접두사를 지원합니다. 예: http://127.0.0.1:7890. 비워 두면 기존 업데이트 프록시 환경을 상속합니다.",
        ),
      ),
      h(
        "label",
        { className: "dshpp-updch-label" },
        h("span", null, tr("updch.token", "GitHub 키")),
        h("input", {
          type: "password",
          className: "dshpp-field dshpp-updch-field",
          "aria-label": tr("updch.token", "GitHub 키"),
          value: token,
          disabled: saving || clearToken,
          placeholder: tr(
            "updch.token.ph",
            "선택: GitHub API 한도를 높입니다. 비워 두면 바꾸지 않습니다",
          ),
          spellCheck: false,
          autoComplete: "off",
          onChange: (e) => setToken(e.target.value),
        }),
      ),
      h(
        "p",
        { className: "dshpp-hint" },
        hasToken
          ? tr(
              "updch.token.set",
              "이 컴퓨터에 키가 설정되어 있습니다. 입력창은 항상 비어 있고, 비운 채 저장하면 그대로 유지됩니다.",
            )
          : tr("updch.token.unset", "이 컴퓨터에 아직 키가 없습니다. 비워 두면 설정하지 않습니다."),
      ),
      hasToken
        ? h(
            "label",
            { className: "dshpp-updch-check" },
            h("input", {
              type: "checkbox",
              checked: clearToken,
              disabled: saving,
              "aria-label": tr("updch.token.clear", "저장된 키 지우기"),
              onChange: (e) => setClearToken(!!e.target.checked),
            }),
            h("span", null, tr("updch.token.clear", "저장된 키 지우기")),
          )
        : null,
      error ? h("p", { role: "alert" }, error) : null,
      h(
        "div",
        { className: "dshpp-updch-ops" },
        h(
          Btn,
          { disabled: saving, onClick: onClose },
          tr("updch.cancel", "취소"),
        ),
        h(
          Btn,
          { kind: "primary", disabled: saving, onClick: save },
          saving ? tr("updch.saving", "저장 중…") : tr("updch.save", "저장"),
        ),
      ),
    ),
  );
}

export function CommunityMaintenance() {
  const [value, setValue] = useState(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(""),
    [releases, setReleases] = useState(null),
    [release, setRelease] = useState("");
  const [listState, setListState] = useState("loading"),
    [listError, setListError] = useState("");
  const [channelOpen, setChannelOpen] = useState(false);
  const tr = useText();
  const mounted = useRef(false),
    generation = useRef(0),
    running = useRef(false);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setListState("loading");
    setListError("");
    try {
      const result = await apiJson("/dsh-purge/community");
      assertMaintenanceResult(result);
      if (!Array.isArray(result.backups)) throw new Error("백업 목록 응답이 유효하지 않습니다");
      if (!mounted.current || request !== generation.current) return;
      setValue(result);
      setSelected((current) =>
        result.backups.some((b) => b.id === current) ? current : "",
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
    if (
      op === "rollback" &&
      !window.confirm(
        "Purge 플러그인과 그 진입점만 롤백하고 현재 프롬프트와 설정은 남깁니다. 끝나면 DSH 프로세스를 재시작해야 하고, 브라우저만 새로 고치면 새 백엔드가 로드되지 않습니다. 계속할까요?",
      )
    )
      return;
    if (
      op === "update" &&
      !window.confirm(
        "먼저 백업한 뒤 선택한 커뮤니티 정식 버전을 설치합니다. 호스트 패치를 다시 적용하지는 않습니다. 설치 후 DSH 프로세스를 재시작하고, 브라우저만 새로 고치면 새 백엔드가 로드되지 않습니다. 계속할까요?",
      )
    )
      return;
    running.current = true;
    setBusy(true);
    setNotice("처리 중…");
    try {
      const r = await apiJson("/dsh-purge/community", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ op, id: selected, ref: release }),
      });
      assertMaintenanceResult(r);
      if (!mounted.current) return;
      if (op === "check") {
        if (!Array.isArray(r.versions)) throw new Error("릴리스 목록 응답이 유효하지 않습니다");
        setReleases(r.versions.filter((v) => v.asset));
        setRelease(r.versions.find((v) => v.asset)?.ref || "");
        setNotice(
          r.degraded
            ? `${r.degraded} · ${r.stale ? "지금은 캐시 목록을 표시합니다. 잠시 후 다시 시도하세요" : "대체 목록을 표시했습니다"}`
            : r.error
              ? `업데이트 확인 실패: ${r.error}`
              : r.hasUpdate
                ? `새 버전 ${r.remoteVersion} 발견`
                : "이미 최신 정식 버전입니다",
        );
      } else {
        setNotice(maintenanceNotice(op, r));
      }
    } catch (e) {
      if (mounted.current)
        setNotice(
          e.message === "timeout"
            ? "유지보수 요청이 시간 초과됐습니다. 작업이 아직 실행 중일 수 있으니 먼저 상태를 새로 고치고, 같은 요청을 반복 제출하지 마세요."
            : e.message,
        );
    } finally {
      // A failed write may already have created a recovery snapshot. Read once;
      // never replay the mutation to discover whether it succeeded.
      if (op !== "check" && mounted.current) await load();
      running.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return h(
    "section",
    { className: "dshpp-panel", "aria-label": "커뮤니티판 유지보수" },
    h("h3", null, "유지보수: 업데이트와 이 컴퓨터 백업"),
    // 채널 현황 요약: 프록시가 직결인지, 키가 설정돼 있는지(키 평문은 절대 되풀이하지 않는다).
    // 진입 버튼은 여기 있지 않고 "자동 업데이트 확인"과 같은 줄에 있다.
    value
      ? h(
          "p",
          { className: "dshpp-hint" },
          (value.update_preferences?.proxyUrl
            ? tr("updch.state.proxy", "업데이트 채널 프록시: ") +
              value.update_preferences.proxyUrl
            : tr("updch.state.direct", "업데이트 채널: 환경 또는 시스템 프록시 상속")) +
            " · " +
            (value.update_preferences?.hasGithubToken
              ? tr("updch.state.token.on", "GitHub 키 설정됨")
              : tr("updch.state.token.off", "GitHub 키 미설정")),
        )
      : null,
    h(UpdatePreferences, {
      value: value?.update_preferences,
      status: value?.update_status,
      onSaved: (next) =>
        setValue((current) => ({ ...current, update_preferences: next })),
      onOpenChannel: () => setChannelOpen(true),
    }),
    h(
      "div",
      { className: "dshpp-row" },
      h(Btn, { disabled: busy, onClick: () => run("check") }, "커뮤니티판 업데이트 확인"),
      h(
        Btn,
        {
          disabled: busy,
          onClick: async () => {
            try {
              const r = await apiJson("/dsh-purge/audit?limit=10");
              const lines = (r.entries || []).map(
                (x) =>
                  `${new Date(x.at).toLocaleString()}  ${x.event}  ${JSON.stringify(
                    Object.fromEntries(
                      Object.entries(x).filter(
                        ([k]) => !["at", "event", "pid"].includes(k),
                      ),
                    ),
                  )}`,
              );
              setNotice(lines.length ? lines.join("\n") : "아직 기록된 동작이 없습니다");
            } catch (e) {
              setNotice(e.message);
            }
          },
        },
        "최근 동작",
      ),
      h(
        "a",
        {
          href: "https://github.com/wnduddld0513/dsh-purge-kr/releases",
          target: "_blank",
          rel: "noreferrer",
        },
        "릴리스 기록",
      ),
    ),
    releases?.length
      ? h(
          "div",
          { className: "dshpp-row" },
          h(
            "select",
            {
              "aria-label": "커뮤니티 릴리스 선택",
              value: release,
              onChange: (e) => setRelease(e.target.value),
              disabled: busy,
            },
            releases.map((r) =>
              h("option", { key: r.ref, value: r.ref }, r.label),
            ),
          ),
          h(
            Btn,
            { disabled: busy || !release, onClick: () => run("update") },
            "선택한 버전 설치",
          ),
        )
      : null,
    h("h3", { style: { marginTop: 20 } }, "이 컴퓨터 백업"),
    h(
      Btn,
      { disabled: busy || listState === "loading", onClick: load },
      "백업 목록 새로 고침",
    ),
    listState === "loading"
      ? h("p", { role: "status" }, "백업을 읽는 중…")
      : null,
    listState === "error"
      ? h("p", { role: "alert" }, `백업 읽기 실패: ${listError}`)
      : null,
    listState === "ready" && !value.backups.length
      ? h("p", { role: "status" }, "백업 없음")
      : null,
    h(
      "div",
      { className: "dshpp-row" },
      h(Btn, { disabled: busy, onClick: () => run("backup") }, "지금 백업"),
      h(
        "select",
        {
          "aria-label": "롤백할 백업 선택",
          value: selected,
          onChange: (e) => setSelected(e.target.value),
          disabled: busy || listState !== "ready",
        },
        h("option", { value: "" }, "백업 선택"),
        ...(value?.backups || []).map((b) =>
          h(
            "option",
            { key: b.id, value: b.id },
            `${new Date(b.created_at).toLocaleString()} · ${b.plugins.map((p) => p.version).join(" / ")}`,
          ),
        ),
      ),
      h(
        Btn,
        {
          disabled: busy || !selected || listState !== "ready",
          onClick: () => run("rollback"),
        },
        "플러그인 롤백",
      ),
    ),
    h(
      "p",
      { className: "dshpp-hint" },
      "백업은 이 컴퓨터에만 남습니다. 롤백은 현재 프롬프트, 규칙, 다른 플러그인 설정을 보존합니다. 설치나 롤백 후에는 DSH 프로세스를 재시작해야 하고, 브라우저만 새로 고치면 새 백엔드가 로드되지 않습니다.",
    ),
    notice ? h("p", { role: "status" }, notice) : null,
    // 대화상자는 패널 안에 붙지만 고정 위치로 컨테이너를 벗어나며 portal 에 의존하지 않는다.
    channelOpen && value
      ? h(UpdateChannelDialog, {
          value: value.update_preferences,
          onClose: () => setChannelOpen(false),
          onSaved: (next) => {
            setValue((current) => ({ ...current, update_preferences: next }));
            setNotice(
              tr("updch.saved", "업데이트 채널을 저장했습니다. 다음 업데이트 확인부터 적용됩니다."),
            );
          },
        })
      : null,
  );
}
