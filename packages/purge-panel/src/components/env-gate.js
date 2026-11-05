import { apiUrl } from "../api/client.js";
// Red-team "environment not ready" send gate, ported from
// YuJunZhiXue/dsh-purge 1.1.71 (MIT). Original block: client.js 1.1.71
// lines 8134-8346: fetchEnvAdaptStatus / fetchEnvAdaptStatusSync /
// EnvAdaptSendGate.
import {
  h,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "../shared/react.js";
import { useT } from "../shared/locale.js";
import { readDrillAuth, requestDrillEnv } from "../state/dock.js";
import {
  conversationInput,
  currentSessionId,
  hostSessions,
} from "../state/rewind-draft.js";
import {
  isRedteamModeActive,
  looksLikeSendControl,
} from "../state/redteam-mode.js";

export function fetchEnvAdaptStatus() {
  return fetch(apiUrl("/redteam/api"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ op: "platformEnvAdaptStatus" }),
  })
    .then((r) => r.json())
    .catch(() => null);
}

/* 동기 프로브 자리: 더 이상 동기 XHR 을 하지 않는다(UI 메인 스레드가 막힌다). 호출자 mustBlockSubmit
 * 은 cache 가 만료되었거나 없으면 "미지 → 보수적 block" 으로 처리하고, 동시에 EnvAdaptSendGate 의
 * useEffect 폴링이 비동기로 refresh 하므로 다음 호출에서 통과한다. */
export function fetchEnvAdaptStatusSync() {
  return null;
}

/** 레드팀 전송 전 게이트: 준비되지 않음 → 승인하고 환경 적응을 연다. 확인 후 건너뛸 수 있다. */
export function EnvAdaptSendGate() {
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
      ready: ready,
      skipped: !!(r && r.skipped),
    };
    setStatus(r);
    return r;
  }, []);

  const blockAndOpen = useCallback(() => {
    setConfirmSkip(false);
    refresh();
    /* 첫 번째: 전체 승인 창만 띄운다 → 승인되면 환경 적응 페이지로 넘어간다 */
    if (!readDrillAuth()) {
      setOpen(false);
      requestDrillEnv();
      return true;
    }
    /* 이미 승인된 경우: 간소한 환경 적응 창만 띄우고 드릴 콘솔 전체를 다시 열지 않는다 */
    setOpen(true);
    return true;
  }, [refresh]);

  const mustBlockSubmit = useCallback(() => {
    if (!isRedteamModeActive()) return false;
    const cached = cacheRef.current;
    /* cache 가 만료되면 비동기 갱신을 트리거한다. 이번 호출은 마지막 cache 로 판정하고, 미지는 보수적으로 block */
    if (!cached.at || Date.now() - cached.at > 2500) {
      refresh().catch(() => {});
    }
    if (cached.ready) return false;
    blockAndOpen();
    return true;
  }, [blockAndOpen, refresh]);

  /* 호스트의 SessionInputShell.submit 을 붙잡는다 — 버튼 클릭 휴리스틱보다 확실하다.
   * patch 는 되돌릴 수 있어야 한다: origSubmit 을 WeakMap 에 저장하고 unmount / 의존성 변경 시 복원한다. */
  useEffect(() => {
    const patched = new WeakMap();
    const patchedShells = [];
    const patchShell = (shell) => {
      if (!shell || patched.has(shell)) return;
      if (typeof shell.submit !== "function") return;
      const origSubmit = shell.submit;
      const origActionsSubmit =
        shell.actions && typeof shell.actions.submit === "function"
          ? shell.actions.submit
          : null;
      patched.set(shell, { origSubmit, origActionsSubmit });
      patchedShells.push(shell);
      const bound = origSubmit.bind(shell);
      shell.submit = function gatedSubmit(mode) {
        try {
          if (mustBlockSubmit()) return;
        } catch {
          /* 게이트가 예외를 내도 전송을 삼키지 않는다 */
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
        /* ignore */
      }
    };
    tick();
    const iv =
      typeof window !== "undefined" && window.setInterval
        ? window.setInterval(tick, 400)
        : null;
    return () => {
      if (iv && typeof window !== "undefined" && window.clearInterval)
        window.clearInterval(iv);
      for (const shell of patchedShells) {
        const info = patched.get(shell);
        if (!info) continue;
        try {
          shell.submit = info.origSubmit;
        } catch {
          /* ignore */
        }
        if (info.origActionsSubmit && shell.actions) {
          try {
            shell.actions.submit = info.origActionsSubmit;
          } catch {
            /* ignore */
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
    const iv =
      typeof window !== "undefined" && window.setInterval
        ? window.setInterval(tick, 5000)
        : null;
    return () => {
      alive = false;
      if (iv && typeof window !== "undefined" && window.clearInterval)
        window.clearInterval(iv);
    };
  }, [refresh]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.addEventListener)
      return undefined;
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
      const inComposer =
        target &&
        target.closest &&
        target.closest(
          "[data-composer-card], [data-composer-seat], [contenteditable='true'], textarea",
        );
      if (!inComposer) return;
      if (
        target.closest &&
        target.closest(".dshp-dock, .dshp-auth-mask, .rt-dock, .dshp-env-gate")
      )
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

  const message = (status && status.message) || t("envGate.lead");
  return h(
    "div",
    {
      className: "dshp-auth-mask dshp-env-gate",
      role: "dialog",
      "aria-modal": "true",
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
            lineHeight: 1.5,
          },
        },
        t("envGate.kaliHint"),
      ),
      confirmSkip
        ? h("div", { className: "dshp-auth-warn" }, t("envGate.skipConfirm"))
        : null,
      h(
        "div",
        { className: "dshp-auth-ops" },
        confirmSkip
          ? [
              h(
                "button",
                {
                  key: "no",
                  type: "button",
                  onClick: () => setConfirmSkip(false),
                },
                t("envGate.skipNo"),
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
                        skip: true,
                      }),
                    })
                      .then((r) => r.json())
                      .then((r) => {
                        setBusy(false);
                        cacheRef.current = {
                          at: Date.now(),
                          ready: true,
                          skipped: true,
                        };
                        setStatus(r);
                        setOpen(false);
                        setConfirmSkip(false);
                      })
                      .catch(() => {
                        setBusy(false);
                        cacheRef.current = {
                          at: Date.now(),
                          ready: true,
                          skipped: true,
                        };
                        setOpen(false);
                      });
                  },
                },
                t("envGate.skipYes"),
              ),
            ]
          : [
              h(
                "button",
                {
                  key: "skip",
                  type: "button",
                  onClick: () => setConfirmSkip(true),
                },
                t("envGate.skip"),
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
                  },
                },
                t("envGate.go"),
              ),
            ],
      ),
    ),
  );
}
