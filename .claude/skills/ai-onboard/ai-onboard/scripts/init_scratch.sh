#!/usr/bin/env bash
# Creates .ai-onboard-scratch/ in the target project and updates .gitignore.
# Usage: bash init_scratch.sh [project-root]

set -euo pipefail

PROJECT_ROOT="${1:-$(pwd)}"
SCRATCH_DIR="$PROJECT_ROOT/.ai-onboard-scratch"
GITIGNORE="$PROJECT_ROOT/.gitignore"

mkdir -p "$SCRATCH_DIR"
echo "Created: $SCRATCH_DIR"

if [ -f "$GITIGNORE" ]; then
  if ! grep -qF ".ai-onboard-scratch/" "$GITIGNORE"; then
    echo ".ai-onboard-scratch/" >> "$GITIGNORE"
    echo "Updated: $GITIGNORE"
  else
    echo "Already in .gitignore: .ai-onboard-scratch/"
  fi
else
  echo ".ai-onboard-scratch/" > "$GITIGNORE"
  echo "Created: $GITIGNORE"
fi
