/**
 * 능력 선택 프로토콜: 먼저 skill / MCP 카탈로그를 읽고, 현재 작업에 맞춰 고른다.
 * 공식 skill 등록을 바꾸지 않고, MCP 마운트를 바꾸지 않고, 어떤 도구도 deny 하지 않는다.
 * 공식 DSH 가 이미 도구 사용법을 싣고 있으므로 여기서 Host tools 규율을 따로 붙이지 않는다.
 */

// [dsh-purge] `dsh-purge` 접두사를 붙이지 않는다: 호스트 renderPrompt 안에는
// filter(s => s.name.startsWith("dsh-purge")) 단계가 있어 이런 section 을 삽입 순서대로 맨 앞으로 옮긴다.
// 옛 이름 "dsh-purge:capabilities" 는 이 접두사에 걸려 cap 이 inject 앞으로 나갔고(dump line 1),
// "cap 이 먼저, inject 이 나중" 이라는 렌더 순서 역전을 만들었다. 이름을 바꿔 이 필터 단계를 피한다.
export const CAPABILITY_SECTION = "dshpg-capabilities";

const OFFICIAL_PROTOCOL = `## Capability selection by task (mandatory)

1. **Read first**: Inspect \`<available_skills>\` / the skill catalog and the installed MCP / host tools for this session. Know what exists before acting.
2. **Match the task**: From that catalog, pick the skill(s) and MCP/CLI tool(s) that fit *this* user task — not “always use something”, not “never use something”.
3. **Call what matches**:
   - Matching **Skill** → load it with the host \`skill\` tool, then follow it (methods, premises, branches, counter-evidence).
   - Matching **MCP / CLI** → call that tool with real schema and context; treat failures by the tool’s semantics.
4. **Only then DIY**: If nothing in the catalog fits the task, use shell / ad-hoc steps and say what was missing.
5. **Subagents / sub-delegates inherit this rule**: Any \`subagent\`, teammate, or child agent you start must also read the catalog and call task-matched skills/MCP the same way. Put that requirement in the child brief when you dispatch.
6. Host skills and MCP stay available; this prompt does not remove them.`;

const REDTEAM_LEAD_PROTOCOL = `## Capability selection by task (redteam lead)

1. You plan, dispatch with \`subagent\`, verify results, and report. Executors do hands-on work.
2. Before dispatch, know which skills/MCP fit the next stage (from \`<available_skills>\` / redteam skills / session MCP).
3. In every \`subagent\` brief: require the child to **read the skill/MCP catalog, then call only what the assigned task needs** (name concrete skill codes when you know them).
4. Do not ban skill or MCP for children. Leaf limits apply only to further delegation tools (\`subagent_fork\` / workflow / ralph), not to skill/MCP.
5. Vague “go investigate” briefs are wrong; task-matched skill/MCP instructions are right.`;

const REDTEAM_CHILD_PROTOCOL = `## Capability selection by task (redteam executor)

1. **Read** \`<available_skills>\` / your role skills and available MCP/CLI tools.
2. **Match** them to *your assigned task* (not every skill, not zero skills).
3. **Call** matching skills via \`skill\`, and matching MCP/CLI tools by schema, before freelancing equivalent shell work.
4. DIY only for gaps the catalog does not cover; stay in role; do not re-delegate.`;

/**
 * @param {{ redteam?: boolean, redteamChild?: boolean, enabled?: boolean }} [opts]
 * @returns {string}
 */
export function capabilityProtocolText(opts = {}) {
  if (opts.enabled === false) return "";
  if (opts.redteamChild) return REDTEAM_CHILD_PROTOCOL;
  if (opts.redteam) return REDTEAM_LEAD_PROTOCOL;
  return OFFICIAL_PROTOCOL;
}
