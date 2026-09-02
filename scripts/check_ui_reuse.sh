#!/usr/bin/env bash
# Reuse ratchet (backstop, mirrors Mogul Music's gate). Ceilings only ever go DOWN.
# No screens yet, so this passes trivially. Build it out with R-003:
#   - fail on raw primitives in src/screens/ where a shared component exists
#   - fail on raw icon sizes / raw colours (must use tokens)
#   - fail on reusable private components defined inside a screen (promote to src/ui/components/)
set -euo pipefail
echo "  (reuse gate: no src/screens/ primitives to check yet)"
exit 0
