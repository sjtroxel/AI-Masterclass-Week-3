#!/usr/bin/env bash
# Removes the .ai-ci-onboard-scratch/ directory and its .gitignore entry.
# Usage: bash cleanup.sh [project-root]

set -euo pipefail

PROJECT_ROOT="${1:-$(pwd)}"
SCRATCH_DIR="$PROJECT_ROOT/.ai-ci-onboard-scratch"
GITIGNORE="$PROJECT_ROOT/.gitignore"

if [ -d "$SCRATCH_DIR" ]; then
  rm -rf "$SCRATCH_DIR"
  echo "Removed: $SCRATCH_DIR"
else
  echo "Already gone: $SCRATCH_DIR"
fi

if [ -f "$GITIGNORE" ]; then
  if grep -qF ".ai-ci-onboard-scratch/" "$GITIGNORE"; then
    TMP=$(mktemp)
    grep -vF ".ai-ci-onboard-scratch/" "$GITIGNORE" > "$TMP"
    mv "$TMP" "$GITIGNORE"
    echo "Removed .ai-ci-onboard-scratch/ from $GITIGNORE"
  else
    echo "Not in .gitignore, nothing to remove"
  fi
fi

echo "Done."
