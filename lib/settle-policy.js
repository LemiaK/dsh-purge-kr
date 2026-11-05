/** 공식 데스크톱 기동 중에는 Fiber._reload 가 아직 desktop-office 를 붙이고 있으므로 settle 은 언팩/프로세스 종료를 해서는 안 된다. */

export const DESKTOP_SETTLE_DELAY_MS = 4000;

export function isInactiveContextError(error) {
  if (!error) return false;
  if (error.code === "INACTIVE_EFFECT") return true;
  return /inactive context/i.test(String(error.message || error));
}

export function watchContextLife(ctx) {
  const life = { alive: true };
  if (!ctx || typeof ctx.effect !== "function") return life;
  try {
    ctx.effect(() => () => {
      life.alive = false;
    });
  } catch (error) {
    if (isInactiveContextError(error)) {
      life.alive = false;
      return life;
    }
    throw error;
  }
  return life;
}

export function settleDelayMs(surface) {
  return surface === "desktop" ? DESKTOP_SETTLE_DELAY_MS : 0;
}

/** 데스크톱 기동 자가 복구는 requestRestart / taskkill 하지 않는다. 그러면 Cordis 가 INACTIVE_EFFECT 를 낸다. */
export function settleMayRestart({ surface, sealed = false } = {}) {
  if (surface === "desktop") return false;
  if (sealed) return false;
  return true;
}

/** 밀봉 asar 에서 제자리 extract/swap 은 공식 Host 의 Fiber._reload 와 잠금을 다툰다. */
export function settleMayReapply({ surface, sealed = false } = {}) {
  if (surface === "desktop" && sealed) return false;
  return true;
}

/**
 * "적용" 후 재시작 여부. 웹과 데스크톱이 같은 판정을 쓴다.
 * 프롬프트가 이미 기록되었거나 이번에 패치를 기록했으면 재시작한다. 현재 버전과 맞지 않는 코드 패치는 재시작을 취소하지 않는다.
 * 밀봉 패키지에서 추가로 필요한 것은 패키지 교체뿐이며, 별도 판정을 두지 않는다.
 * 쿨다운은 여기에 두지 않는다. 그러면 첫 재시작에서 asar 가 교체되지 않았을 때 두 번째 적용이 취소로 처리된다.
 */
export function applyShouldRestart({
  complete = false,
  sealed = false,
  appliedCount = 0,
  promptReady = false,
} = {}) {
  // 밀봉 데스크톱: "적용" 후 완전히 종료해야 asar 를 교체하고 resources/app 을 로드한다. 패치에 applied 표시가 있는지와 무관하다.
  if (sealed) return true;
  if (complete || promptReady) return true;
  return Number(appliedCount) > 0;
}
