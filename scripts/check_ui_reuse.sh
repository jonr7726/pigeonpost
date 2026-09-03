#!/usr/bin/env bash
# UI-reuse ratchet (ported from Mogul Music's gate, R-002/R-056 shape).
# Ceilings only ever go DOWN. A line carries `reuse-exempt: <why>` to be a
# conscious, documented one-off — exempt lines never count against a ceiling.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIRS=()
for d in src/screens src/ui/screens; do
  [ -d "$ROOT/$d" ] && DIRS+=("$ROOT/$d")
done
[ ${#DIRS[@]} -gt 0 ] || exit 0

fail=0
check() {
  local name="$1" ceiling="$2" pattern="$3" hint="$4"
  local n
  n=$({ grep -rhE --include='*.tsx' --include='*.ts' "$pattern" "${DIRS[@]}" 2>/dev/null || true; } \
        | { grep -vi 'reuse-exempt' || true; } | wc -l | tr -d ' ')
  if (( n > ceiling )); then
    printf '  \342\234\227 %-22s %2d  (ceiling %d) — %s\n' "$name" "$n" "$ceiling" "$hint"
    fail=1
  else
    printf '  \342\234\223 %-22s %2d / %d\n' "$name" "$n" "$ceiling"
  fi
}

echo ">>> UI-reuse ratchet (src/screens)"
# Hard ban: the shared UsernameField exists — no raw TextInput in a screen.
check "raw TextInput"    0  '[^a-zA-Z]TextInput'          "use src/ui/components (UsernameField)"
# Hard ban: build UI from tokens/shared components, not new private widgets
# that never get promoted (Mogul Music's leak signature).
check "private _Screen/_Widget" 0 'function _[A-Z]|const _[A-Z][A-Za-z0-9]* = \(' \
  "put reusable pieces in src/ui/components/, or // reuse-exempt with a reason"

if (( fail )); then
  echo ">>> UI-reuse ratchet FAILED — a primitive count grew. Use the shared component."
  exit 1
fi
echo ">>> UI-reuse ratchet OK"
