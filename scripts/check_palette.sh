#!/usr/bin/env bash
# Palette guard — extension of the gate (UI-DESIGN §2).
# Colour literals are allowed in exactly one file: src/ui/theme/palette.ts.
# A screen/component that "just needs one colour" adds a named token or prop
# colour there instead — that is the escape hatch, and it is review-visible.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CANON="$ROOT/src/ui/theme/palette.ts"

fail=0
hits=$(grep -rEn --include='*.ts' --include='*.tsx' \
  '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|(bg|text|border|color)-\[#[^]]*\]' \
  "$ROOT/src" 2>/dev/null | grep -vF "$CANON" | grep -v 'reuse-exempt' || true)

if [ -n "$hits" ]; then
  echo ">>> palette scan FAILED — colour literals outside src/ui/theme/palette.ts:"
  echo "$hits"
  fail=1
else
  echo "  ✓ no colour literals outside src/ui/theme/palette.ts"
fi

if (( fail )); then
  echo ">>> palette guard: put the colour in palette.ts as a named token (or document reuse-exempt)."
  exit 1
fi
