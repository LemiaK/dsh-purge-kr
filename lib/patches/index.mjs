// [dsh-purge] 패치 집계 진입점; export 는 core.js 원문과 글자 단위로 동일하다.
import { PATCHES } from './prompt.mjs';
import { CODE_PATCHES } from './code.mjs';
import { ENGINE_PATCHES } from './engine.mjs';
import { NEW_TOOL_PATCHES } from './new-tools.mjs';
import { OPT_IN_PATCHES } from './opt-in.mjs';

export const ALL_PATCHES = [...PATCHES, ...CODE_PATCHES, ...ENGINE_PATCHES, ...NEW_TOOL_PATCHES, ...OPT_IN_PATCHES];

/** 같은 정리 작업의 업그레이드 사슬. Apply 는 여전히 ALL_PATCHES 대로 전부 적용하고, 정리 페이지 / 카운트 표시에서만 한 줄로 합친다. */
export const PATCH_DISPLAY_GROUPS = {
  disclaimer: [1, 2, 3],
  approval_sentence: [5, 11, 12],
  approval_policy: [8, 9, 10],
  desktop_update: [45, 46],
  desktop_close: [83, 84],
  // #85/#86 은 #90(RESTORE_NATIVE_STEERING)으로 대체되어 ALL_PATCHES 에서 빠졌고,
  // 여기서 그룹만 남기면 영원히 적중할 수 없는 죽은 id 만 남으므로 삭제한다.
  hang: [87, 88],
  hooks_deny: [30, 31],
  hooks_steer: [64, 65],
};
