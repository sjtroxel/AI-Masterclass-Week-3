#!/usr/bin/env bash
# Scans a project for likely secret exposures — hardcoded keys, tokens, credentials.
# Does NOT read .env files. Only scans source code.
# Usage: bash scan_secrets.sh [project-root]
# Output: prints findings to stdout; exit 0 always (findings are informational, not errors)

set -euo pipefail

PROJECT_ROOT="${1:-$(pwd)}"

# Directories to skip
SKIP_DIRS=".git node_modules vendor .venv venv dist build coverage __pycache__ .ai-onboard-scratch"

SKIP_ARGS=()
for d in $SKIP_DIRS; do
  SKIP_ARGS+=(--exclude-dir="$d")
done

# File extensions to skip (binaries, lockfiles, generated)
SKIP_FILES=(
  "*.lock" "*.sum" "*.min.js" "*.min.css" "*.map"
  "*.png" "*.jpg" "*.jpeg" "*.gif" "*.ico" "*.woff" "*.woff2" "*.ttf" "*.eot"
  "*.pdf" "*.zip" "*.tar.gz"
)
for f in "${SKIP_FILES[@]}"; do
  SKIP_ARGS+=(--exclude="$f")
done

echo "=== Secret Scan: $PROJECT_ROOT ==="
echo ""

found_any=0

scan() {
  local label="$1"
  local pattern="$2"
  local matches
  matches=$(grep -rn "${SKIP_ARGS[@]}" -E "$pattern" "$PROJECT_ROOT" 2>/dev/null \
    | grep -v '\.env' \
    | grep -v '\.example' \
    | grep -v 'test\|spec\|fixture\|mock\|fake\|dummy\|placeholder\|example\|sample' \
    || true)
  if [ -n "$matches" ]; then
    local count
    count=$(echo "$matches" | grep -c . || true)
    echo "[$label]"
    if [ "$count" -gt 20 ]; then
      echo "$matches" | head -20
      echo "... ($count total matches, showing first 20)"
    else
      echo "$matches"
    fi
    echo ""
    found_any=1
  fi
}

# AWS keys
scan "AWS Access Key" "AKIA[0-9A-Z]{16}"
scan "AWS Secret" "(aws_secret|AWS_SECRET)[_A-Za-z]*\s*[=:]\s*['\"][A-Za-z0-9/+=]{40}"

# Generic API key patterns
scan "API Key assignment" "(api_key|apikey|API_KEY|APIKEY)\s*[=:]\s*['\"][A-Za-z0-9_\-]{16,}"
scan "Bearer token" "Bearer [A-Za-z0-9\-._~+/]+=*"

# Common service tokens
scan "Stripe key" "sk_(live|test)_[A-Za-z0-9]{24,}"
scan "GitHub token" "gh[pousr]_[A-Za-z0-9]{36,}"
scan "Slack token" "xox[baprs]-[A-Za-z0-9\-]+"
scan "OpenAI key" "sk-[A-Za-z0-9]{32,}"
scan "Anthropic key" "sk-ant-[A-Za-z0-9\-]+"
scan "Twilio SID" "AC[a-f0-9]{32}"
scan "SendGrid key" "SG\.[A-Za-z0-9_\-]{22,}\.[A-Za-z0-9_\-]{43,}"

# Private keys
scan "Private key header" "-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY"

# Passwords hardcoded
scan "Hardcoded password" "(password|passwd|pwd)\s*[=:]\s*['\"][^'\"\s]{6,}"

# Database URLs with credentials
scan "DB URL with credentials" "(mysql|postgres|postgresql|mongodb|redis)://[^:]+:[^@]+@"

if [ "$found_any" -eq 0 ]; then
  echo "No obvious secret patterns found in source code."
  echo "(Note: .env files were excluded from this scan intentionally.)"
fi

echo ""
echo "=== End of scan ==="
