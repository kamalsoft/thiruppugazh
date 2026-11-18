#!/usr/bin/env bash
# Stop hook: stop the session from ending while code changes have no recorded review.
#   code-review-gate.sh           gate mode, run by the Stop hook
#   code-review-gate.sh record    run after the code-reviewer agent has reported
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
STATE="$ROOT/.claude/.code-review-state"
BLOCKS="$ROOT/.claude/.code-review-blocks"
MAX_BLOCKS=3
cd "$ROOT" || exit 0

# Code files only. Docs, song data and build output are not reviewed.
is_code() {
  grep -E '\.(py|ts|tsx|js|jsx|mjs|css|sh)$|(^|/)(vercel\.json|pyproject\.toml|package\.json|tsconfig\.json|tailwind\.config\.js|next\.config\.[a-z]+)$' \
    | grep -v -E '(^|/)(node_modules|\.venv|venv|\.next|\.vercel|dist|build|songs|docs)/'
}

# quotePath=false keeps non-ASCII filenames unquoted so the filter can match them.
changed_files() {
  { git -c core.quotePath=false diff HEAD --name-only; git -c core.quotePath=false ls-files --others --exclude-standard; } \
    | sort -u | is_code
}

# Hash of the changed file list plus the working-tree content of each file.
fingerprint() {
  local files
  files=$(changed_files)
  [ -n "$files" ] || return 1
  {
    echo "$files"
    echo "$files" | while IFS= read -r f; do [ -f "$f" ] && cat "$f"; done
  } | git hash-object --stdin
}

if [ "${1:-}" = "record" ]; then
  if fp=$(fingerprint); then
    echo "$fp" > "$STATE" || { echo "Could not write $STATE; the review is not recorded." >&2; exit 1; }
    rm -f "$BLOCKS"
    echo "Code review recorded for the current changes."
  else
    rm -f "$STATE" "$BLOCKS"
    echo "No code changes to record."
  fi
  exit 0
fi

fp=$(fingerprint) || exit 0
if [ -f "$STATE" ] && [ "$(cat "$STATE")" = "$fp" ]; then
  exit 0
fi

# Block at most MAX_BLOCKS times for the same changes, so a session that never
# records cannot loop forever. After that the session ends with a warning.
blocks=0
if [ -f "$BLOCKS" ] && [ "$(cut -d' ' -f1 "$BLOCKS")" = "$fp" ]; then
  blocks=$(cut -d' ' -f2 "$BLOCKS")
fi
if [ "$blocks" -ge "$MAX_BLOCKS" ]; then
  echo "Warning: code changes are still unreviewed after $MAX_BLOCKS attempts. Ending the session without a review." >&2
  exit 0
fi
if ! echo "$fp $((blocks + 1))" > "$BLOCKS"; then
  echo "Warning: cannot write $BLOCKS, so the block limit cannot be enforced. Ending the session without a review." >&2
  exit 0
fi

{
  echo "Code changed since the last review. Before finishing:"
  echo "1. Invoke the code-reviewer agent on these files: $(changed_files | tr '\n' ' ')"
  echo "2. Show both pass results to the user. Fix any confirmed Blocker or High finding, then review again."
  echo "3. When the review is complete, run: bash .claude/hooks/code-review-gate.sh record"
} >&2
exit 2
