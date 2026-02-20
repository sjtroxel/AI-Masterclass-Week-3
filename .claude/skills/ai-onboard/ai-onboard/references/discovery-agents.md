# Phase 2 — Discovery Agent Prompts

Launch all 7 simultaneously in one message. Each writes to `$SCRATCH_DIR/[file].md` (absolute path) and returns a 3-5 sentence summary.

The orchestrator must resolve `$PROJECT_ROOT`, `$SCRATCH_DIR`, and `$SKILL_PATH` to absolute paths before injecting them into these prompts.

---

## Agent 1: Tech Stack Analyzer

`Task(subagent_type="general-purpose", model="sonnet", description="Analyze tech stack")`

> Project root: $PROJECT_ROOT
> Scratch dir: $SCRATCH_DIR
>
> Find package manifests (package.json, composer.json, Cargo.toml, requirements.txt, go.mod, Gemfile, pyproject.toml, etc.), languages and versions, frameworks, major dependencies with versions, build tools, task runners, runtime requirements, package managers.
>
> Write findings to `$SCRATCH_DIR/tech-stack.md`. Return only a 3-5 sentence summary.

---

## Agent 2: Architecture Mapper

`Task(subagent_type="general-purpose", model="sonnet", description="Map architecture")`

> Project root: $PROJECT_ROOT
> Scratch dir: $SCRATCH_DIR
>
> Map: top-level directory structure with what each dir contains, module boundaries and responsibilities, entry points (main files, route definitions, index files), configuration files and purposes, key abstractions and design patterns, data flow between modules, external service integrations, database connections and ORMs.
>
> Pay special attention to **module boundaries** — what can import what, and why. Note any circular dependency risks.
>
> Write findings to `$SCRATCH_DIR/architecture.md`. Return only a 3-5 sentence summary.

---

## Agent 3: Convention Extractor

`Task(subagent_type="general-purpose", model="sonnet", description="Extract conventions")`

> Project root: $PROJECT_ROOT
> Scratch dir: $SCRATCH_DIR
>
> Extract coding conventions by examining EXISTING CODE (not config files alone). Document:
> - Naming conventions (variables, functions, classes, files, directories) with real examples from the code
> - File organization patterns
> - Import/export patterns
> - Code style (indentation, quotes, semicolons, trailing commas)
> - Error handling patterns
> - Logging patterns
> - Comment style
>
> Also find linter/formatter configs (.eslintrc, .prettierrc, rustfmt.toml, phpcs.xml, etc.) and note their rules.
>
> Write findings to `$SCRATCH_DIR/conventions.md`. Return only a 3-5 sentence summary.

---

## Agent 4: Testing Auditor

`Task(subagent_type="general-purpose", model="sonnet", description="Audit testing setup")`

> Project root: $PROJECT_ROOT
> Scratch dir: $SCRATCH_DIR
>
> Find: test frameworks used, test file locations and naming patterns, test directory structure, test commands (from package.json scripts, Makefile, composer.json, etc.), coverage config and thresholds, CI test configuration, types of tests (unit/integration/e2e), mocking patterns, fixture/factory patterns.
>
> Also estimate test coverage quality — are tests descriptive? Do they encode business rules clearly? Are they useful as AI specifications?
>
> Write findings to `$SCRATCH_DIR/testing.md`. Return only a 3-5 sentence summary.

---

## Agent 5: Security Scanner

`Task(subagent_type="general-purpose", model="sonnet", description="Scan security posture")`

> Project root: $PROJECT_ROOT
> Scratch dir: $SCRATCH_DIR
>
> First, run the secrets scan script:
> ```
> bash $SKILL_PATH/scripts/scan_secrets.sh $PROJECT_ROOT
> ```
> Capture its output and include the results in your findings.
>
> Then find:
> - .env files and their locations — **do NOT read .env file contents**, only note existence and location
> - Secret/credential references in code (look for patterns like `process.env.`, `getenv(`, `os.environ`, hardcoded API key patterns)
> - .gitignore patterns for sensitive files
> - Existing security configs
> - Sensitive file paths (keys, certs, credentials)
> - Authentication/authorization patterns
> - API key handling patterns
>
> Write findings to `$SCRATCH_DIR/security.md`. Return only a 3-5 sentence summary.

---

## Agent 6: Documentation Scout

`Task(subagent_type="general-purpose", model="sonnet", description="Survey existing docs")`

> Project root: $PROJECT_ROOT
> Scratch dir: $SCRATCH_DIR
>
> Find: README files and what they cover, existing CLAUDE.md or AGENTS.md content and quality, .claude/ directory contents, docs/ directory contents, inline documentation quality (sample 3-4 key files), API documentation, architecture decision records, contributing guidelines, any existing rules or coding standards docs.
>
> Write findings to `$SCRATCH_DIR/documentation.md`. Return only a 3-5 sentence summary.

---

## Agent 7: Dev Workflow Analyzer

`Task(subagent_type="general-purpose", model="sonnet", description="Analyze dev workflow")`

> Project root: $PROJECT_ROOT
> Scratch dir: $SCRATCH_DIR
>
> Find: dev server commands, build commands, deployment configs, CI/CD pipelines (GitHub Actions, GitLab CI, etc.).
>
> Run these git commands to extract conventions:
> - `git -C $PROJECT_ROOT branch -a` — document branch naming conventions
> - `git -C $PROJECT_ROOT log --oneline -20` — document commit message conventions
>
> Also find: database migration commands, seed/fixture commands, linting/formatting commands, pre-commit hooks.
>
> Write findings to `$SCRATCH_DIR/dev-workflow.md`. Return only a 3-5 sentence summary.
