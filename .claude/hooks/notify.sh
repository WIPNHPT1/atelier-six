#!/bin/bash
# Shows a Mac notification when Claude Code needs you or has finished. Silent on non-Mac systems.
msg="${1:-Claude Code needs you}"
if command -v osascript >/dev/null 2>&1; then
  osascript -e "display notification \"$msg\" with title \"Atelier Six\" sound name \"Glass\"" >/dev/null 2>&1 || true
fi
exit 0
