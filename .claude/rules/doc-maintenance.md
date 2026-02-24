## Living Documentation Rule

After any work that changes the system's architecture, update the relevant docs **in the same session** — before recommending a commit. The commit message should include the doc files.

### What triggers a doc update

| Change made | Files to update |
|---|---|
| New feature promoted from stub → active | `CLAUDE.md` architecture tree, `ARCHITECTURE.md` module table + data flow |
| Feature removed or renamed | Same as above |
| New auth/session mechanism added | `CLAUDE.md` guardrails, `ARCHITECTURE.md` auth data flow, `MEMORY.md` |
| New external service integrated | `ARCHITECTURE.md` integrations table, `CLAUDE.md` tech stack if applicable |
| Hook added, removed, or repurposed | `ARCHITECTURE.md` shared layers table + dependency graph |
| Backend route or middleware added | `ARCHITECTURE.md` backend section |
| localStorage keys added or changed | `CLAUDE.md` Demo Mode guardrail, `MEMORY.md` |
| Context/provider added, renamed, or replaced | `CLAUDE.md` architecture tree, `ARCHITECTURE.md` context section + dependency graph, `MEMORY.md` |

### Files and their roles

- `CLAUDE.md` — Authoritative source of truth for AI behavior: guardrails, conventions, feature status. Update first.
- `ARCHITECTURE.md` — Human-readable system design doc: data flows, module responsibilities, external integrations. Update second.
- `MEMORY.md` (`~/.claude/projects/.../memory/MEMORY.md`) — Cross-session AI memory: patterns, key paths, completed migrations. Update to reflect any state change that would affect future sessions.
- `.claude/rules/` — Anti-patterns and rules that prevent recurring mistakes. Add a rule whenever a mistake is made or a new invariant is established.

### Commit hygiene

Always include doc files in the same commit as the code change that motivated them:
```
feat: add demo mode with 48h localStorage session

Co-updates: CLAUDE.md, ARCHITECTURE.md, MEMORY.md
```
