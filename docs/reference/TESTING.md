# TESTING

Three tiers. The crypto tier is the one that makes this product trustworthy, and it is
**not** covered by e2e — so it gets its own fast, adversarial unit suite.

## 1. Crypto core — adversarial unit tests (the important tier)
Fast `vitest` tests over the crypto module, asserting the **negative** properties
directly on keys/ciphertext. A happy path that renders your own feed proves nothing;
these prove the security. From [`../plans/CRYPTO-SPEC.md`](../plans/CRYPTO-SPEC.md) §8:

1. **Removed friend can't read the future** — after removal, blobs at a later epoch
   fail to open with the keys the removed member held.
2. **Server can't read** — given only stored ciphertext + public keys, no plaintext is
   recoverable.
3. **Non-friend can't read** — without an epoch key, a circle blob won't open.
4. **Tampering fails** — a mutated ciphertext or signature is rejected.
5. **Pigeon is recipient-only** — a letter opens with the recipient's key and nothing
   else, before or after release.

These live in `src/crypto/__tests__/` and must stay green. They are `it.todo` until the
core lands in R-002, then become real assertions **in the same commit** as the code.

## 2. Component tests
Key UI states (loading / empty / error / populated) for shared components in
`src/ui/components/`. Added with the features that introduce them. The palette
tier also lives here: `src/ui/theme/__tests__/palette.test.ts` computes WCAG
contrast for `text`/`textDim`/`accent` on `bg`/`panel` and `ink` on `paper` for
**both** palettes (dark + parchment) and fails a palette that can't read; it
also pins every palette to the full token set.

## 3. e2e (journeys)
Playwright over the web build for real user journeys (sign up → add friend → post →
comment → send a pigeon). e2e exercises the running app, so the specs and their
harness (ports, per-worktree DBs, seeds) live in the **server repo** and run
against the contract in [`API.md`](API.md); this repo only states the tier's rule:
each journey is a client-facing flow, and e2e is the functional test for flows.
It complements, and never replaces, tier 1.

## The gate
`bash scripts/check.sh` runs typecheck + unit tests + the reuse ratchet + the
palette guard + the copy-paste ratchet. Never commit red. Bug fix / behaviour
change to existing code → **write the failing test first** (TDD).

Gate details:
- **Reuse ratchet** (`scripts/check_ui_reuse.sh`) — named-primitive ceilings
  that only ever go DOWN (C21): raw `TextInput`, `Text`, `ActivityIndicator`,
  vertical `ScrollView`, and imports deeper than the barrel (`src/ui/components`)
  in a screen are all ceiling 0; screens compose shared components
  (`src/ui/components/`), or use `reuse-exempt: <why>` as the conscious one-off
  escape hatch.
- **Palette guard** (`scripts/check_palette.sh`) — colour literals and
  Tailwind-style arbitrary colour classes are banned everywhere except
  `src/ui/theme/palette.ts`. A UI that "just needs one colour" adds a named
  token/prop colour there — review-visible, swappable.
- **Copy-paste ratchet** (`scripts/check_clones.sh`) — jscpd counts cross-file
  clones in `src/` against a falling ceiling (currently 3); intra-file
  repetition is local structure, not a leak, and is ignored.
