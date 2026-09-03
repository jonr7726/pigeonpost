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
check "raw TextInput"    0  '[^a-zA-Z]TextInput'          "use src/ui/components (AppInput)"
# Hard ban: build UI from tokens/shared components, not new private widgets
# that never get promoted (Mogul Music's leak signature).
check "private _Screen/_Widget" 0 'function _[A-Z]|const _[A-Z][A-Za-z0-9]* = \(' \
  "put reusable pieces in src/ui/components/, or // reuse-exempt with a reason"
# Jon's rule: a screen never imports a UI primitive; it composes shared
# components. "We only need one" is never a reason to inline.
check "raw <Text> in screens" 0 '<Text[ />]' "use AppText — fonts/colour/tone live there"
check "raw ActivityIndicator" 0 '<ActivityIndicator' "use src/ui/components (Loading)"
check "raw vertical ScrollView" 0 '<ScrollView' "use src/ui/components (List/ScreenScroll)"
# A screen imports the shared-component barrel, not deep paths — the component
# API surface lives in exactly one place.
check "deep component imports" 0 "from '.*src/ui/components/[A-Za-z]" "import from the barrel src/ui/components"

if (( fail )); then
  echo ">>> UI-reuse ratchet FAILED — a primitive count grew. Use the shared component."
  exit 1
fi
echo ">>> UI-reuse ratchet OK"
