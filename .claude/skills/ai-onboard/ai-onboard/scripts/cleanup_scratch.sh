#!/usr/bin/env bash
# Removes the .ai-onboard-scratch/ directory and its .gitignore entry.
# Usage: bash cleanup_scratch.sh [project-root]

set -euo pipefail

PROJECT_ROOT="${1:-$(pwd)}"
SCRATCH_DIR="$PROJECT_ROOT/.ai-onboard-scratch"
GITIGNORE="$PROJECT_ROOT/.gitignore"

if [ -d "$SCRATCH_DIR" ]; then
  rm -rf "$SCRATCH_DIR"
  echo "Removed: $SCRATCH_DIR"
else
  echo "Already gone: $SCRATCH_DIR"
fi

if [ -f "$GITIGNORE" ]; then
  if grep -qF ".ai-onboard-scratch/" "$GITIGNORE"; then
    # Remove the line (portable sed -i workaround for both macOS and Linux)
    TMP=$(mktemp)
    grep -vF ".ai-onboard-scratch/" "$GITIGNORE" > "$TMP"
    mv "$TMP" "$GITIGNORE"
    echo "Removed .ai-onboard-scratch/ from $GITIGNORE"
  else
    echo "Not in .gitignore, nothing to remove"
  fi
fi

echo "Done."
