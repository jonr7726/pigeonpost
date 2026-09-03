#!/usr/bin/env bash
# The correctness gate. Run before every commit. Never commit red.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ typecheck"
npx tsc --noEmit

echo "▶ unit tests (incl. crypto negatives)"
npx vitest run

echo "▶ ui reuse gate"
bash scripts/check_ui_reuse.sh

echo "▶ palette guard"
bash scripts/check_palette.sh

echo "▶ copy-paste gate"
bash scripts/check_clones.sh

echo "✓ all green"
