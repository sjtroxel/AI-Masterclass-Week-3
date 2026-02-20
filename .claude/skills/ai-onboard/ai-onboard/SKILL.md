---
name: ai-onboard
description: Deep-analyze any codebase and generate comprehensive AI development infrastructure — CLAUDE.md, .claude/rules/, settings.json, AGENTS.md, docs, CI/CD workflow, and custom commands. Like claude init, but on steroids. Use when a user wants to onboard a codebase for AI-assisted development, prepare an existing project for Claude Code, or generate CLAUDE.md and related configuration files from scratch.
---

# AI Onboard

Preparing a codebase for AI is like onboarding a developer with zero institutional knowledge, perfect memory within a session, and zero memory between sessions. Everything implicit must become explicit.

**TARGET**: $ARGUMENTS (defaults to current working directory)
**Scratch dir**: `.ai-onboard-scratch/` in project root — agents communicate here between phases.

## Setup

Before Phase 1, resolve the skill path:
- `SKILL_PATH` = the directory containing this skill file (`~/.claude/skills/ai-onboard/` by default, or the path where this skill is installed)
- Use `SKILL_PATH` wherever `[skill-path]` appears in these instructions

---

## Phase 1 — Pre-Flight Check

`Task(subagent_type="general-purpose", model="sonnet")`

> You are running a pre-flight check on a codebase before AI onboarding.
>
> Project root: [TARGET or cwd]
>
> 1. **Run the init script** — `bash [skill-path]/scripts/init_scratch.sh [TARGET]`
>    This creates `.ai-onboard-scratch/` and updates `.gitignore`.
> 2. **Survey existing AI config** — check for: CLAUDE.md, AGENTS.md, .claude/ directory (list settings.json, rules/, commands/, skills/), .cursorrules, .github/copilot-instructions.md
> 3. **Get git context** — branch name, `git log --oneline -5`, .gitignore patterns
> 4. **Write findings to `.ai-onboard-scratch/preflight.md`**
>
> Return: `Project: [name] | Git: [yes/no, branch] | Existing AI config: [list or "none"] | Scratch dir: created`

---

## Phase 2 — Deep Discovery (7 parallel Tasks)

Wait for Phase 1. Then launch ALL 7 agents **simultaneously in one message**.

Read `references/discovery-agents.md` for full prompts for all 7 agents. All discovery agents use `general-purpose` for maximum portability.

**Note for Security Scanner agent (Agent 5)**: Run `bash [skill-path]/scripts/scan_secrets.sh [TARGET]` and include its output in the security findings. This catches hardcoded keys and tokens deterministically.

---

## Phase 3a — Synthesis

`Task(subagent_type="general-purpose", model="sonnet")`

> Read all files from `.ai-onboard-scratch/`: preflight.md, tech-stack.md, architecture.md, conventions.md, testing.md, security.md, documentation.md, dev-workflow.md.
>
> Write `.ai-onboard-scratch/synthesis.md`:
>
> ```markdown
> ## Discovery Results
>
> ### Tech Stack
> [Framework] project using [language] [version]
> Key deps: [top 5-8] | Build: [tool] | Package manager: [pm]
>
> ### Architecture
> [2-3 sentences] | Key modules: [list]
>
> ### Conventions
> Naming: [pattern] | Style: [key points]
> Linter/Formatter: [tools or "none"]
>
> ### Testing
> Framework: [name] | Coverage: [%/unknown]
> Test commands: [key commands]
> Coverage gaps: [note if <70% or unknown — AI effectiveness depends on good tests]
>
> ### Security
> Env files: [count/locations] | Sensitive paths: [list]
>
> ### Documentation
> Existing AI config: [what exists or "none"] | Docs quality: [brief]
>
> ### Dev Workflow
> Dev: [cmd] | Build: [cmd] | Test: [cmd]
> CI/CD: [what exists or "none"] | Git style: [branch pattern, commit style]
>
> ### Notable gaps or ambiguities
> [anything unclear or missing]
> ```
>
> Return: path `.ai-onboard-scratch/synthesis.md` + 5-7 sentence summary.

---

## Phase 3b — User Review (main context — no Task)

Present the summary returned by Phase 3a. Mention: `Full synthesis: .ai-onboard-scratch/synthesis.md`

Use **AskUserQuestion**:
- **Q1** (free text, optional): "Any corrections or context not visible in the code? Leave blank to continue."

Tier 1 files (CLAUDE.md, .claude/settings.json, .claude/rules/, .claude/context/ARCHITECTURE.md) will always be generated.

- **Q2** (multiSelect): "Which Tier 2 files should I also generate?"
  - `AGENTS.md` — symlink to CLAUDE.md (Cursor/Copilot/Aider support)
  - `.claude/context/DEPENDENCY_MAP.md` — explicit module import rules
  - `.claude/commands/` — custom slash commands (test, deploy, review)
  - `.claude/context/AI_CONTEXT.md` — codebase gotchas for AI

- **Q3** (multiSelect): "Any Tier 3 docs?"
  - `.claude/context/API_CONTRACTS.md`
  - `.claude/context/DATABASE_SCHEMA.md`
  - `.claude/context/INTEGRATIONS.md`
  - None — skip Tier 3

> CI/CD setup is handled by the companion `/ai-ci-onboard` skill — run it separately after this skill completes for GitHub Actions, secret scanning, and PR automation.

Write answers to `.ai-onboard-scratch/user-input.md`.

---

## Phase 4 — File Generation

`Task(subagent_type="general-purpose", model="opus")`

> You are generating AI development infrastructure files for this project.
>
> Read ALL files in `.ai-onboard-scratch/`. Read `[skill-path]/references/generation-specs.md` for full generation specifications.
>
> Generate each selected file per the specs:
> - Write each file directly.
> - If a file already exists, update it to reflect current codebase state (treat it as stale and refresh). Preserve intentional customizations by reading the existing content first and merging new discoveries in.
> - After writing each file, note the filepath and a 1-sentence summary of what was written.
>
> Write list of all generated files to `.ai-onboard-scratch/generated-files.md`.
>
> After writing all files, run: `python3 [skill-path]/scripts/validate_output.py [TARGET]`
> Report any failures to the user before proceeding.
>
> After validation, present the summary:
>
> ```
> ## AI Onboard Complete
>
> ### Files Generated:
> [list with line counts]
>
> ### Recommended Next Steps:
> 1. Review generated files and customize to your preferences
> 2. Add rules as Claude makes mistakes in this codebase
> 3. CI/CD: run `/ai-ci-onboard` for GitHub Actions PR review setup
> 4. Commit .claude/ to version control — benefits the whole team
>
> ### Ongoing Maintenance:
> - Claude makes a mistake → add a rule to prevent it
> - Quarterly: audit CLAUDE.md accuracy and docs freshness
> ```

---

## Phase 5 — Cleanup

`Task(subagent_type="Bash", model="haiku")`

> ```bash
> bash [skill-path]/scripts/cleanup_scratch.sh [TARGET]
> ```
> Confirm when done.

---

## Orchestration Rules

- Sequential phases — never start before previous completes
- **Phase 2 exception** — all 7 discovery agents launch simultaneously in ONE message
- Scratch dir is the state bus between phases
- Phase 4 uses opus — generation quality matters
