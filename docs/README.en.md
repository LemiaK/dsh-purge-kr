<div align="center">

# dsh-purge Community

**It helps the AI focus on learning and on the experiments it runs itself.**

Self-hosted controls for DeepSeek Harness (usually called a "jailbreak" plugin) · 86 host patches · 25-layer state self-check · full-sidebar page settings

[![Release](https://img.shields.io/github/v/release/wnduddld0513/dsh-purge-kr?label=release)](https://github.com/wnduddld0513/dsh-purge-kr/releases)
[![Checks](https://github.com/wnduddld0513/dsh-purge-kr/actions/workflows/community.yml/badge.svg)](https://github.com/wnduddld0513/dsh-purge-kr/actions/workflows/community.yml)

Current version **1.6.86** · Matches **DSH Desktop 0.2.2-rc.1** (0.2.1-rc.1 / rc.2 / rc.3 / rc.5 pass in the same way) · [한국어](../README.md)

1.6.86 keeps the rewind menu inside the viewport, reports a Web-only host as "not applicable" for package swaps instead of raising a false alarm, separates the compatibility levels (archived, kernel-only, unlocated, unknown, unreadable), and adds the H3 Video 0.4.0 and 0.5.0 market entries. [Release notes](docs/releases/1.6.86.md).

**Original project and author**: Maintained independently on top of [xiaoyang / YuJunZhiXue's dsh-purge](https://github.com/YuJunZhiXue/dsh-purge). The original repository has been restored. The original author's signature, copyright, and MIT license are preserved as they were. This repository maintains the community edition, and it is not an official release by the original author.

</div>

---

## Pairing: local image generation (Qwen Studio)

After the jailbreak, the most direct use is moving image generation itself onto your own machine. No web page, no membership, and prompts never go to someone else's server.

The companion plugin **Qwen Studio** (`dsh-qwen-studio`) connects Qwen Image 2.1 to DSH:

- **Apple Silicon Mac**: uses MLX / MFLUX local inference. It loads models only while in use and unloads them when idle;
- **Windows / Linux + NVIDIA**: connects to your own GPU gateway (ComfyUI or the vLLM-Omni protocol). Starting it over SSH on demand is also supported;
- supports reference-image editing (change the style or swap a material while looking at an image), LoRA, ControlNet, masks, preset sets, a gallery, and batch jobs;
- once installed, say "draw me a picture…" or "turn this into a watercolor" in a session; the agent calls `qwen_generate_image` and returns the image in the conversation.

**Pairing effect**: the jailbreak removes the agent's repeated "should I draw it?" confirmation, the image plugin actually produces the drawing, and the whole loop stays on your own machine.

**Repository**: [kingcharleslzy-ai/dsh-qwen-studio](https://github.com/kingcharleslzy-ai/dsh-qwen-studio) · **Download**: [latest releases](https://github.com/kingcharleslzy-ai/dsh-qwen-studio/releases/latest) · **Setup and hardware self-check**: [docs/SETUP.md](https://github.com/kingcharleslzy-ai/dsh-qwen-studio/blob/main/docs/SETUP.md) (check first whether it runs on this machine)

## What it is

dsh-purge Community is a Harness add-on that runs on your own machine. It collects in one place the few things that eat the most attention in daily use:

- **See state clearly**: judge whether install, patches, and injection are really ready from one command or one panel screen;
- **Fewer round trips**: fold repeated confirmations and interruptions into a single setting;
- **Go back any time**: apply, rollback, and toggles all leave a record, and an automatic snapshot is taken before the work;
- **Easy to experiment**: manage prompts, rules, and presets in one place, and undo a bad edit.

The goal is simple. **Make the assistant cooperate more consistently with learning and with the experiments it runs itself**, so it does not stop and ask at every step.

In the community this is usually called a "jailbreak" or "unrestricted mode" plugin. It means lowering friction in the interaction layer so the agent runs work continuously. It neither replaces the model itself nor changes what you are trying to do.

### Seeing `fetch failed` when downloading?

Since 1.6.39 the standalone installer shows the failing stage and error code, retries a set number of times, and then falls back to system curl. Both paths keep origin, certificate, and SHA256 verification intact. Re-download the install script and run a dry-run; if it still fails, send only the diagnostic lines with sensitive data removed. See [download troubleshooting](docs/maintenance-issue-52.md) for details. It does not switch your proxy and does not restart DSH.

### Each preset keeps its own prompt

1.6.40 added `excludePresets`. The default is an empty list, so existing behavior is unchanged. You can keep presets such as `roleplay` and `minimal` out of Purge prompt injection while still using the commands, panel, and tools. Preset switching, parallel sessions, and subagents decide for themselves, and host fallback follows the exclusion too. See [per-preset exclusion](docs/maintenance-issue-53.md) for configuration examples, the upgrade procedure, and boundaries. This does not revert global host patches.

## Design principles

| Principle | Meaning |
| --- | --- |
| Local first | All logic runs locally. It does not change your cloud account and does not upload prompts or settings |
| Visibility | Every action has state and evidence. It does not rely on guesses like "it was probably applied" |
| Reversible | It creates an automatic snapshot before apply / install / rollback and keeps original files and a verification manifest |
| Decides nothing for you | It reduces friction only and does not change the goal. You review what gets changed and switched on |

## When to use it

Use it for local learning, personal projects, automation experiments, and maintenance work. Use it in an environment you own or have permission for. Where someone else's systems are involved, get permission first.

## 1.6.39 update

Fixed the standalone installer showing only `fetch failed`. It now provides per-stage diagnostics, a set number of retries, and a system curl fallback download, while still enforcing the official origin, certificate, and SHA256 checks strictly. If a download fails, it leaves the existing install alone. [Release notes](docs/releases/1.6.48.md) · [Configuration and acceptance](docs/maintenance-issue-52.md)

## Installation

### Install straight from git (recommended, always the newest commit)

```sh
dsh plugin --profile <profile> add "https://github.com/wnduddld0513/dsh-purge-kr.git"
```

This clones the repository and installs the current `master` tip, so it always picks up the newest release without waiting for an index refresh. The built `client.js` is committed, so nothing is compiled locally. Replace `<profile>` with the profile you actually start (`desktop` for the desktop app, `web` for CLI/Web). Then restart DSH, open the Purge panel, press **Apply**, and restart once more.

If you need a reproducible version, install a pinned release tarball instead (Method 2 below), or a local checkout with `dsh plugin --profile <profile> add /absolute/path/to/dsh-purge-community`.

**DSH's official entry point handles plugin installation. This repository maintains the community installer below, and it is not an official DeepSeek script.** Use the official UI or CLI for a first install. If you already installed `dsh-purge` or the older standalone panel, migrate in place with the community installer and do not remove it first. Installing, applying host patches, and restarting by hand are three separate actions.

### Method 1: DSH official UI (first install)

1. Open DSH first and finish initialization. Following the current official docs, go to "Plugins", click "More" next to "Experimental plugins", and switch on "Custom plugin market". Then go to "Discover → Add index source".
2. This project's **community index**: `https://wnduddld0513.github.io/dsh-purge-kr/index.json`.
3. Select dsh-purge Community, confirm the origin is `wnduddld0513/dsh-purge-kr` and the package name is `dsh-purge-community`, then install.

DSH provides the UI and the install protocol; the community maintains the index and the plugin. Entry wording can differ between DSH versions, and the third-party `dsh-market` may have extra filters and migration limits. If a package already exists, use method 3. [Official market guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/guide/plugin-market.zh.md)

### Method 2: DSH official CLI (first install)

The command below is for **CLI/Web users who have the `dsh` command installed and use the `web` profile**. Run it in a macOS/Linux terminal or in Windows PowerShell. Desktop users should use the UI above first. Do not download another host with `npx` just to install the plugin.

```sh
dsh plugin --profile web add "https://github.com/wnduddld0513/dsh-purge-kr/releases/download/v1.6.86/dsh-purge-community-1.6.86.tgz"
```

`web` must match the profile you actually started, and a custom data directory follows that instance's `DSH_HOME`. This command uses this release's pinned-version URL; it is neither `npm install -g` nor a bare npm package-name install. This project ships through GitHub releases, so **do not change it to `add dsh-purge` or `add dsh-purge-community`**. An official CLI install does not run our installer's Release SHA256 comparison or migration snapshot. If you need those, choose method 3. [Official CLI install guide](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.zh.md)

### Method 3: community installer (backup, older-version migration, restore)

Install DSH first and open it once so the real profile is initialized. The commands below download **a script from this repository**, verify it, and install it. A passing `dry-run` means only that the precondition checks, the download, and SHA256 passed; it does not mean dependency installation, migration, or startup passed. Read the downloaded script before you use it.

#### macOS Desktop

The default app location is `/Applications/DeepSeek Harness.app`, the data directory is `~/.dsh`, and the profile is `desktop`. Run both blocks in the same terminal session:

```sh
PURGE_INSTALL_DIR="$(mktemp -d)"
curl -fSL --connect-timeout 20 --max-time 90 "https://raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install.sh" -o "$PURGE_INSTALL_DIR/install.sh"
sh "$PURGE_INSTALL_DIR/install.sh" --dry-run
```

Once verification succeeds and you have confirmed the target instance, run:

```sh
sh "$PURGE_INSTALL_DIR/install.sh"
```

To point at a specific app or home, set `DSH_APP` / `DSH_HOME` first. To pin a profile, add `--profile=actual-name` to both commands. Do not copy someone else's paths. On macOS it also reads the real executable name from XML or binary plists. If the metadata is invalid it stops and does not swap in a different app. See [app location boundaries](docs/INSTALLATION.md#앱-위치-지정-경계pr-78) for details.

#### Windows Desktop · PowerShell 5.1 / 7

The script tries to find the single DSH Desktop. The default home is the user's `.dsh`. The old Desktop CLI defaults its profile to `desktop`, and the new shell that ships its own dsh CLI defaults to `web`; pass `-Profile` to pin a custom profile. It does not ask for administrator rights and supports paths containing spaces.

```powershell
$PurgeInstaller = Join-Path $env:TEMP ('purge-install-' + [guid]::NewGuid().ToString('N') + '.ps1')
Invoke-WebRequest -UseBasicParsing -TimeoutSec 90 -Uri 'https://raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install.ps1' -OutFile $PurgeInstaller
powershell -NoProfile -ExecutionPolicy Bypass -File "$PurgeInstaller" -DryRun
```

Once the previous command exits with code 0 and you have confirmed the target instance, run this in the same PowerShell session:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$PurgeInstaller"
```

If the app was not found, or there are several copies, add `-DshExe 'full path to the real DeepSeek Harness.exe'` to both commands. Point at a directory with `-DshHome` and at a profile with `-Profile`. `ExecutionPolicy Bypass` applies only to this child process and does not change the persistent execution policy. An organization policy may still block execution, so in that case report the error as it is and leave system policy alone.

#### Linux · CLI / Web

Install Node ≥18 and the DSH CLI first, then initialize the profile you actually use. The procedure below starts at the download, so you do not need to have cloned this repository:

```sh
PURGE_INSTALL_DIR="$(mktemp -d)"
curl -fSL --connect-timeout 20 --max-time 90 "https://raw.githubusercontent.com/wnduddld0513/dsh-purge-kr/master/scripts/install.sh" -o "$PURGE_INSTALL_DIR/install.sh"
sh "$PURGE_INSTALL_DIR/install.sh" --dry-run
```

When verification succeeds, run `sh "$PURGE_INSTALL_DIR/install.sh"` in the same terminal. The defaults are `node` / `dsh` from PATH and the `web` profile. To pin an instance, keep `DSH_NODE`, `PURGE_DSH_CLI`, `DSH_HOME`, and `--profile=name` identical across both calls.

### What the install changes, and how to verify it

- The community installer backs up before migrating. It then calls the current instance's official `dsh plugin --profile … add …` and checks the installed version and entry point. It preserves prompts, rules, update preferences, and other plugins' settings.
- **It does not mean "touching no host directory at all"**: in an unpacked desktop layout, if the `app/runtime` link is missing or broken, it repairs it to that installation's runtime while keeping the existing link. On a conflict it stops. If the Linux system host is read-only, it can create a user copy and, once that succeeds, switch to the user launcher. See the [installation guide](docs/INSTALLATION.md) for details.
- A market install can fail before the plugin loads (issue #7); when that happens the plugin itself has not run yet. Read the error with sensitive data removed first and check the dependency origins. The installer does not promise to fix every market or network error.
- It does not apply host patches automatically, does not restart automatically, does not change the proxy, does not modify the global npm registry, and does not clear caches. Scripts and bootstrap come from `master` in this repository. Release packages get a separate SHA256 check, but that is not independent signature verification of the downloaded script.
- Any non-zero command exit code counts as failure. After a successful install, record the `backup_id` and check the version on disk. A running DSH may still show the old version, so quit and reopen it yourself when convenient. A passing `dry-run`, an existing backup, or a market card showing up is not by itself evidence of a successful install.
- For rollback, prefer picking the backup from before this install under "Purge → Status → Local backups". Without the UI, follow the [CLI rollback in the installation guide](docs/INSTALLATION.md#cli-rollback). Do not assume `purge-community` was added to the system PATH.

The full procedure for choosing an instance, rolling back, and recovering from failure is in the [installation guide](docs/INSTALLATION.md). Agents read [AGENTS.md §12](AGENTS.md) first.

## Panel

One page that uses the whole sidebar; there is no floating button:

- The top explains the current state in one line, and the primary action is "Apply";
- The remaining sections start collapsed, and their explanations sit inside `?` that you expand when needed;
- The maintenance page shows recent actions, backup usage, and update preferences;
- Entry points you do not use (for example the rewind button) can be hidden, and this setting affects display only.

## Common commands

| Command | Role |
| --- | --- |
| `purge-community selfcheck [--json]` | Shows state and evidence per layer. Not-applicable items are marked separately |
| `purge-community status` | Shows host paths and counts |
| `purge-community host-status` | Reads the install layout and current entry point in read-only mode (no package swap, no restart) |
| `purge-community diagnose` | Diagnoses anchor drift and shows file, line number, and candidate locations |
| `purge-community reanchor …` | Pins a confirmed new anchor as a local override. Reversible |
| `purge-community probe [new]` | Creates a runtime probe to verify that injection actually reached the model |
| `purge-community audit [--limit n]` | Shows the recent action log |
| `purge-community boost [on\|off]` | Turns the tail reinforcement section on and off |
| `purge-community preset [status\|install]` | Writes the "unrestricted mode" preset to disk |
| `purge-community retry [on\|off]` | Turns the single retry for an interrupted response on and off |
| `purge-community usage` / `prune` | Checks and prunes backup usage |
| `purge-community backup` / `rollback <id>` | Creates a snapshot, or rolls the plugin back |

## Updates

Set "auto-check" and "auto-install" separately on the maintenance page. The default checks only, every 6 hours. An install finishing does not restart anything automatically. You decide when to reopen.

## Compatibility

| Component | Value |
| --- | --- |
| Plugin | `dsh-purge-community` 1.6.86 |
| Verified hosts | DSH Desktop 0.2.2-rc.1 / 0.2.1-rc.1 / 0.2.1-rc.2 / 0.2.1-rc.3 / 0.2.1-rc.5 |
| Other hosts | Installation is allowed. The self-check marks them "unverified"; look at `diagnose` first |
| Node | ≥18 (the runtime bundled with the desktop build is enough); the red-team tools need ≥22.5 (`node:sqlite`) |

## When something goes wrong

```sh
purge-community selfcheck --json     # first see which layer is not ok
purge-community diagnose             # if anchor drift appears, look at the candidate locations
purge-community audit --limit 20     # look at recent actions
```

If the panel does not open, check the version first and recover according to the [maintenance docs](docs/MAINTENANCE.md). Do not overwrite `Resources/app` directly.

## Development and verification

```sh
npm test                 # unit and contract tests
npm run check:docs       # version and documentation consistency
npm run check:client     # panel bundle matches the source
npm run test:electron    # real Electron environment (temporary directory, no install changes)
npm run smoke            # release package smoke
```

Operating notes for AI agents are in [AGENTS.md](AGENTS.md). If the two conflict, AGENTS.md is the reference.

**Keywords**: jailbreak · unrestricted mode · prompt injection · DSH plugin · state self-check · backup rollback

### DSH Store listing details

The DSH Store application must state **Plugin path: `.`**, which is `dsh-purge-community` at the install root. Do not leave it blank and do not pick the standalone panel package. Version-specific compatibility declarations live in the manifest, and unverified versions stay `unknown`. Editing the metadata is not the same as approving a market install. [Path, compatibility evidence, and listing boundaries](docs/DSH-STORE.md).
