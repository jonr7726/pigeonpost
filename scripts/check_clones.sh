#!/usr/bin/env bash
# Copy-paste ratchet (ported from Mogul Music's R-056 check_clones.sh).
# Floors: count only CROSS-FILE clones; intra-file structure is local design.
# The number is a CEILING that only ever goes DOWN — harvest the duplicate into
# a shared module to lower it. A reviewed non-leak gets a .jscpd.json exclusion
# with a reason.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CEILING="${1:-3}"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

echo ">>> copy-paste ratchet (jscpd, cross-file clones in src/)"
if ! command -v npx >/dev/null 2>&1; then
  echo "    SKIPPED: npx (node) not found — run on a box with node."
  exit 0
fi

( cd "$ROOT" && npx --yes jscpd src \
    --min-lines 8 --min-tokens 50 --format tsx,ts \
    --reporters json --output "$OUT" --silent >/dev/null 2>&1 ) || true

REPORT="$OUT/jscpd-report.json"
if [[ ! -f "$REPORT" ]]; then
  echo "    jscpd produced no report — treating as a failure so it can't silently pass."
  exit 1
fi

node -e '
const r = require(process.argv[1]);
const ceiling = parseInt(process.argv[2], 10);
const dups = (r.duplicates || []).filter(c => c.firstFile.name !== c.secondFile.name);
const norm = n => n.replace(/.*src\//, "");
dups.sort((a,b) => (b.lines||0)-(a.lines||0));
for (const c of dups) {
  console.log(`    [${String(c.lines).padStart(3)}L] ${norm(c.firstFile.name)}:${c.firstFile.start} <-> ${norm(c.secondFile.name)}:${c.secondFile.start}`);
}
const n = dups.length;
if (n > ceiling) {
  console.log(`>>> copy-paste ratchet FAILED — ${n} cross-file clones (ceiling ${ceiling}). Harvest the duplicate into a shared module, or lower nothing.`);
  process.exit(1);
}
console.log(`>>> copy-paste ratchet OK — ${n} / ${ceiling} cross-file clones`);
' "$REPORT" "$CEILING"
