#!/usr/bin/env python3
"""
Validates the AI onboarding output files after Phase 4 generation.
Usage: python3 validate_output.py [project-root]
Exit code: 0 if all checks pass, 1 if any fail.
"""

import json
import os
import re
import sys
from pathlib import Path

project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()

checks_passed = []
checks_failed = []
checks_skipped = []

def ok(msg):
    checks_passed.append(f"  ✓ {msg}")

def fail(msg):
    checks_failed.append(f"  ✗ {msg}")

def skip(msg):
    checks_skipped.append(f"  - {msg}")


# --- CLAUDE.md ---
claude_md = project_root / "CLAUDE.md"
if claude_md.exists():
    lines = claude_md.read_text().splitlines()
    count = len(lines)
    if count <= 300:
        ok(f"CLAUDE.md: {count} lines (≤300)")
    else:
        fail(f"CLAUDE.md: {count} lines (exceeds 300-line guideline)")

    required_sections = [
        "Project Overview",
        "Tech Stack",
        "Architecture",
        "Development Commands",
        "Code Style",
        "Testing",
        "Git Conventions",
        "Guardrails",
    ]
    content = claude_md.read_text()
    for section in required_sections:
        if section in content:
            ok(f"CLAUDE.md: contains '{section}' section")
        else:
            fail(f"CLAUDE.md: missing '{section}' section")

    placeholder_patterns = ["[PROJECT_NAME]", "[TODO]", "[your project]", "TODO:", "FIXME:"]
    found_placeholders = [p for p in placeholder_patterns if p in content]
    if found_placeholders:
        fail(f"CLAUDE.md: contains placeholder text: {found_placeholders}")
    else:
        ok("CLAUDE.md: no placeholder text detected")
else:
    skip("CLAUDE.md: not generated")


# --- .claude/settings.json ---
settings = project_root / ".claude" / "settings.json"
if settings.exists():
    try:
        data = json.loads(settings.read_text())
        ok(".claude/settings.json: valid JSON")
        if "permissions" in data and "deny" in data["permissions"]:
            deny_rules = data["permissions"]["deny"]
            if any(".env" in r for r in deny_rules):
                ok(".claude/settings.json: deny rule for .env* present")
            else:
                fail(".claude/settings.json: no deny rule for .env files")
            ok(f".claude/settings.json: {len(deny_rules)} deny rule(s)")
        else:
            fail(".claude/settings.json: missing permissions.deny block")
    except json.JSONDecodeError as e:
        fail(f".claude/settings.json: invalid JSON — {e}")
else:
    skip(".claude/settings.json: not generated")


# --- .claude/rules/ ---
rules_dir = project_root / ".claude" / "rules"
if rules_dir.exists():
    # Mandatory unconditional rules (at root of rules/ — no frontmatter)
    for expected in ["naming.md", "testing.md", "security.md", "anti-patterns.md"]:
        # Check both new location (rules/) and legacy location (rules/shared/)
        f = rules_dir / expected
        legacy_f = rules_dir / "shared" / expected
        actual = f if f.exists() else legacy_f if legacy_f.exists() else None
        label = f"rules/{expected}"
        if actual:
            if actual == legacy_f:
                fail(f"{label}: found at legacy path rules/shared/{expected} — move to rules/{expected}")
            lines = len(actual.read_text().splitlines())
            if lines < 10:
                fail(f"{label}: only {lines} lines (likely too thin — add concrete examples)")
            elif lines <= 40:
                ok(f"{label}: {lines} lines")
            else:
                fail(f"{label}: {lines} lines (guideline is 10-40)")
            content = actual.read_text()
            if "```" in content or "- " in content:
                ok(f"{label}: contains examples/lists")
            else:
                fail(f"{label}: no code examples or lists found — add concrete examples from the codebase")
            # Unconditional rules should NOT have paths frontmatter
            if content.startswith("---"):
                fm_match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
                if fm_match and "paths:" in fm_match.group(1):
                    fail(f"{label}: unconditional rule should NOT have paths frontmatter")
        else:
            fail(f"{label}: missing")

    # Path-scoped rules (in subdirs like frontend/, backend/) — should have paths frontmatter
    import re
    for subdir in rules_dir.iterdir():
        if subdir.is_dir() and subdir.name not in ("shared",):
            for rule_file in subdir.glob("*.md"):
                rel = rule_file.relative_to(rules_dir)
                content = rule_file.read_text()
                lines = len(content.splitlines())
                if lines < 10:
                    fail(f"rules/{rel}: only {lines} lines (likely too thin)")
                elif lines <= 40:
                    ok(f"rules/{rel}: {lines} lines")
                else:
                    fail(f"rules/{rel}: {lines} lines (guideline is 10-40)")
                # Path-scoped rules SHOULD have paths frontmatter
                if content.startswith("---"):
                    fm_match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
                    if fm_match and "paths:" in fm_match.group(1):
                        ok(f"rules/{rel}: has paths frontmatter (scoped)")
                    else:
                        fail(f"rules/{rel}: in subdirectory but missing paths frontmatter — add paths: glob patterns")
                else:
                    fail(f"rules/{rel}: in subdirectory but missing paths frontmatter — add paths: glob patterns")
else:
    skip(".claude/rules/: not generated")


# --- AGENTS.md ---
agents_md = project_root / "AGENTS.md"
if agents_md.exists():
    if agents_md.is_symlink():
        target = os.readlink(agents_md)
        if "CLAUDE.md" in target:
            ok(f"AGENTS.md: symlink → {target}")
        else:
            fail(f"AGENTS.md: symlink but points to unexpected target ({target})")
    else:
        # Standalone file — not wrong, but not the recommended pattern
        lines = len(agents_md.read_text().splitlines())
        ok(f"AGENTS.md: standalone file ({lines} lines) — consider symlinking to CLAUDE.md")
else:
    skip("AGENTS.md: not generated")


# --- .claude/context/ ---
context_dir = project_root / ".claude" / "context"
if context_dir.exists():
    for doc in ["architecture.md", "dependency-map.md", "ai-context.md"]:
        f = context_dir / doc
        if f.exists():
            lines = len(f.read_text().splitlines())
            ok(f".claude/context/{doc}: {lines} lines")
        else:
            skip(f".claude/context/{doc}: not generated")
else:
    skip(".claude/context/: directory not created")


# --- .github/workflows/claude-review.yml ---
workflow = project_root / ".github" / "workflows" / "claude-review.yml"
if workflow.exists():
    content = workflow.read_text()
    if "anthropic_api_key" in content or "ANTHROPIC_API_KEY" in content:
        ok(".github/workflows/claude-review.yml: present and references ANTHROPIC_API_KEY")
    else:
        fail(".github/workflows/claude-review.yml: exists but missing ANTHROPIC_API_KEY reference")
else:
    skip(".github/workflows/claude-review.yml: not generated")


# --- Summary ---
print(f"\n=== AI Onboard Output Validation: {project_root} ===\n")

if checks_passed:
    print("Passed:")
    print("\n".join(checks_passed))
    print()

if checks_failed:
    print("Failed:")
    print("\n".join(checks_failed))
    print()

if checks_skipped:
    print("Skipped (not generated):")
    print("\n".join(checks_skipped))
    print()

total = len(checks_passed) + len(checks_failed)
print(f"Result: {len(checks_passed)}/{total} checks passed")

sys.exit(1 if checks_failed else 0)
