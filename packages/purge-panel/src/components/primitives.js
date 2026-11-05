// UI derived from YuJunZhiXue/dsh-purge 1.1.71 (MIT). See LICENSE.
import { h, useState } from "../shared/react.js";
import { useT } from "../shared/locale.js";
import { statusKind, statusLabel } from "./patch-status.js";

export function formatSize(bytes) {
  if (typeof bytes !== "number" || !isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  const kb = bytes / 1024;
  return (kb >= 100 ? Math.round(kb) : kb.toFixed(1)) + " KB";
}

export function noticeNode(notice) {
  if (!notice || notice.kind === "idle" || !notice.text) return null;
  return h(
    "span",
    {
      className:
        "dshpp-notice " + (notice.kind === "error" ? "is-bad" : "is-ok"),
    },
    notice.text,
  );
}

export function Btn(props) {
  const { kind, tiny, children, className, type, ...rest } = props;
  const cls = [
    "dshpp-btn",
    kind ? "dshpp-btn-" + kind : "dshpp-btn-ghost",
    tiny ? "dshpp-btn-tiny" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");
  return h(
    "button",
    Object.assign({ type: type || "button", className: cls }, rest),
    children,
  );
}

export function Pill({ value, label }) {
  const t = useT();
  return h(
    "span",
    { className: "dshpp-pill is-" + statusKind(value) },
    label || statusLabel(value, t),
  );
}

/**
 * 이름 설명: DSH 자체 설정 페이지도 "제목 + 작은 물음표 + 호버 설명" 형태이고,
 * 여기서는 같은 구조의 경량 구현을 쓴다(react-dom portal 에 의존하지 않으므로 오른쪽 사이드바/전체 페이지 어디서든 쓸 수 있다).
 */
export function HelpTip({ title, children, label }) {
  const [open, setOpen] = useState(false);
  return h(
    "span",
    { className: "dshpp-help" },
    h(
      "button",
      {
        type: "button",
        className: "dshpp-help-btn",
        "aria-label": (label || title || "설명") + " (설명 보기)",
        "aria-expanded": open ? "true" : "false",
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        onClick: (e) => {
          e.preventDefault();
          setOpen((v) => !v);
        },
      },
      "?",
    ),
    open
      ? h(
          "span",
          { className: "dshpp-tip", role: "tooltip" },
          title ? h("b", null, title) : null,
          children ? h("span", null, children) : null,
        )
      : null,
  );
}
