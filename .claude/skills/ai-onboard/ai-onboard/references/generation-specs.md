# Phase 4 — File Generation Specifications

**Critical rule**: Use CONCRETE examples from the actual codebase — never generic placeholders.

Write each file directly. If a file already exists, read its current content first, then update it to reflect current codebase findings — preserve intentional customizations, refresh stale auto-generated sections.

## Directory Setup

Before generating context files, ensure `.claude/context/` exists in the project root. Create it if missing.

---

## CLAUDE.md

Concise, **under 300 lines**. Every line should earn its place.

Sections:
1. **Project Overview** — 2-3 sentences: what, domain, users
2. **Tech Stack** — languages, frameworks, key deps with versions
3. **Architecture** — directory structure, modules, real paths
4. **Development Commands** — exact commands: dev, test-all, test-single, build, lint, format, migrate, seed
5. **Code Style & Conventions** — naming with real examples from THIS code, file org, import patterns
6. **Testing** — framework, structure, commands, coverage expectations; emphasize tests as specifications. Include a note that Claude should run tests after every non-trivial change and treat failing tests as the highest priority signal.
7. **Git Conventions** — branch pattern from actual branches, commit format from actual commits
8. **Guardrails** — what NOT to do: deprecated patterns found, sensitive areas, gotchas
9. **Maintenance** — "When Claude makes a mistake in this codebase, add a rule to prevent it. Quarterly: audit this file for accuracy."

---

## AGENTS.md

Create as a **symlink** to CLAUDE.md rather than a separate file:

```bash
ln -sf CLAUDE.md AGENTS.md
```

This keeps a single source of truth for all AI tools (Claude, Cursor, Copilot, Aider). Run this command in the project root. Confirm the symlink was created.

---

## .claude/settings.json

Generate deny rules based on actual security findings. Only restrict paths that actually exist in this project.

Template:
```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)",
      "Read(./secrets/**)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  }
}
```

Add project-specific paths found during security scan (e.g., `Read(./.aws/credentials)`, `Read(**/.ssh/**)`).

If settings.json already exists, merge deny rules only — preserve all other existing config.

**Important note for the security rules file**: Settings.json deny rules are the officially supported access restriction mechanism, but they have known bypass issues with auto-loaded .env files. Recommend Layers 3-5 as well:
- Layer 3: Keep actual secrets outside the project directory; project contains only `.env.example`
- Layer 4: Use secret manager references (e.g., 1Password `op://Work/Stripe/api_key`) instead of literal values
- Layer 5: Add CI/CD scanning (gitleaks, dependabot) — note this in the security rules file

---

## .claude/rules/

Modular, topic-specific rules files. Only create rules for patterns that actually exist in this codebase.

**How rules loading works:**
- All `.md` files in `.claude/rules/` are discovered recursively
- Rules **without** `paths` frontmatter → loaded unconditionally into every session (same priority as `.claude/CLAUDE.md`)
- Rules **with** `paths` frontmatter → loaded only when Claude works with files matching the specified glob patterns
- Use `paths` frontmatter sparingly — only when rules truly apply to specific file types

**Always create (unconditional — no frontmatter):**
- `rules/naming.md` — variable, function, class, file, directory naming with real examples from THIS code
- `rules/testing.md` — test structure, commands, coverage expectations, BDD patterns if used
- `rules/security.md` — credential handling, sensitive operations requiring human approval, Layer 3-5 guidance
- `rules/anti-patterns.md` — patterns to avoid — every codebase has them; derive from conventions.md and architecture findings

**Create if applicable (path-scoped — use `paths` frontmatter):**
- `rules/frontend/components.md` — if frontend exists; scope to frontend file paths
- `rules/frontend/styling.md` — if CSS/Tailwind/styled-components exists; scope to style-related files
- `rules/backend/api.md` — if API layer exists; scope to API source files
- `rules/backend/database.md` — if database layer exists; scope to database/migration files

Each file: **15-40 lines**, scannable, with concrete examples from THIS codebase. Include WHY for non-obvious rules.

### Template structures for mandatory rules files:

**naming.md** (unconditional — no frontmatter):
```markdown
## Variables & Functions
- [language conventions with real examples]

## Files & Directories
- [naming pattern with real examples]

## [Language-specific section if needed]
```

**testing.md** (unconditional — no frontmatter):
```markdown
## Test Commands
- Full suite: [exact command]
- Single file: [exact command]
- Watch mode: [exact command]

## Tests as Specifications
- Tests define "correct" behavior — write failing tests before implementation
- Test names should read as requirements: `test('applies 10% discount for orders over $100')`
- [coverage threshold if known]

## Test Structure
- [framework, location patterns]
```

> Critical: Emphasize that tests are machine-readable specifications for AI. Well-named tests teach Claude business rules unambiguously. Flag if coverage is below 70% — low coverage severely limits AI effectiveness.

**security.md** (unconditional — no frontmatter):
```markdown
## Credential Handling
- NEVER hardcode credentials, API keys, or secrets
- NEVER read from .env files directly
- NEVER log credentials or tokens
- DO use environment variables at runtime
- NOTE: Claude Code may auto-load .env — keep actual secrets outside the project directory

## Sensitive Operations (require human approval)
- [project-specific sensitive ops from security scan]
```

**anti-patterns.md** (unconditional — no frontmatter):
```markdown
## [Domain 1 — e.g., Database]
- [specific anti-pattern found in THIS codebase]

## [Domain 2 — e.g., Frontend]
- [specific anti-pattern found in THIS codebase]

## General
- [cross-cutting anti-patterns]
```

### Template structures for path-scoped rules files:

Path-scoped rules use YAML frontmatter with `paths` — a list of glob patterns. Brace expansion is supported (e.g., `*.{ts,tsx}`). The rules only load when Claude works with matching files.

**frontend/components.md** (example for a React/Next.js project):
```markdown
---
paths:
  - "src/components/**/*.{tsx,jsx}"
  - "app/**/*.{tsx,jsx}"
---

# Component Rules

- [component structure patterns with real examples]
- [prop naming conventions]
- [state management patterns used in THIS codebase]
```

**frontend/styling.md** (example for a Tailwind project):
```markdown
---
paths:
  - "src/**/*.{tsx,jsx,css}"
  - "app/**/*.{tsx,jsx,css}"
---

# Styling Rules

- [styling approach: Tailwind classes, CSS modules, styled-components, etc.]
- [design token usage if applicable]
```

**backend/api.md** (example for an Express/Laravel project):
```markdown
---
paths:
  - "src/api/**/*.ts"
  - "routes/**/*.{ts,php}"
  - "app/Http/**/*.php"
---

# API Rules

- [route naming conventions]
- [request validation patterns]
- [response format standards]
```

**backend/database.md** (example for a project with migrations):
```markdown
---
paths:
  - "src/models/**/*"
  - "database/**/*"
  - "migrations/**/*"
  - "prisma/**/*"
---

# Database Rules

- [ORM patterns and conventions]
- [migration naming and structure]
- [query patterns to prefer/avoid]
```

> Important: The `paths` globs shown above are examples. The generator MUST derive actual paths from the project's real directory structure found during discovery. Use the architecture.md and conventions.md findings to determine correct glob patterns.

---

## .claude/context/architecture.md

`.claude/context/` files are loaded by Claude Code on-demand based on relevance — more token-efficient than docs/.

Include:
- System overview with ASCII diagram showing module relationships
- Module responsibilities (1-2 sentences each)
- Data flow description
- External integrations
- **Dependency rules** — what can import what (critical for preventing AI-introduced circular deps)

---

## .claude/context/dependency-map.md

Explicit import rules to prevent AI from creating circular dependencies:

```markdown
## Module Import Rules

### [module-name]
- CAN import from: [list]
- CANNOT import from: [list]
- Reason: [why this boundary exists]
```

Base this on actual module structure from architecture.md findings.

---

## CI/CD

CI/CD setup (PR review automation, secret scanning, dependabot) is handled by the companion `ai-ci-onboard` skill. Run `/ai-ci-onboard` after completing this skill.

---

## .claude/commands/

Generate project-specific custom slash commands based on actual dev workflow found. Common patterns:

**`commands/test.md`** — run tests with useful flags:
```markdown
---
description: Run tests for the current file or pattern
---
Run: [actual test command from package.json/Makefile] $ARGUMENTS
If no argument, run the full suite.
```

**`commands/review.md`** — pre-commit self-review:
```markdown
---
description: Review staged changes before committing
---
Review the staged changes (git diff --staged) for:
1. Bugs or logic errors
2. Missing tests
3. Violations of project conventions in CLAUDE.md
4. Security issues
Summarize findings and suggest fixes.
```

Only generate commands for workflows that actually exist in this project.

---

## .claude/context/ai-context.md

Document what makes THIS codebase tricky for AI:

```markdown
## Areas Where AI Makes Mistakes in This Codebase
- [specific naming inconsistencies found]
- [legacy vs current patterns that coexist]

## Questions to Ask Before Writing Code
1. [critical paths requiring extra care]
2. [modules with side effects or transactions]

## Critical Paths Needing Extra Care
- [e.g., auth, payments, migrations]

## Legacy vs Current Patterns
- Legacy: [pattern] → Current: [pattern]

## Domain Terminology
- [project-specific terms and what they mean]
```

---

## .claude/context/api-contracts.md

Document API response format standards, versioning rules, error codes. Base on actual API patterns found.

---

## .claude/context/database-schema.md

Document tables/collections, key relationships, naming conventions. Note migration strategy.

---

## .claude/context/integrations.md

Document external services, how they're configured (env vars, not values), failure modes, retry patterns.
