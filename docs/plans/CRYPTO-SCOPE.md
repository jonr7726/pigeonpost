# Plan: crypto-scope — spec session (groups, close-friends, metadata split)

**Status: In review.** Docs-only session; no code shipped.

## Scope
Fold everything decided in the 2026-09-04 crypto-design discussion into
[`CRYPTO-SPEC.md`](../../pigeonpost/docs/plans/CRYPTO-SPEC.md) (client repo, this
is a pure-crypto session so the plan sits beside it, per the ownership table):

- **Epoch chain mechanics re-specced exactly:** fresh random key per epoch, never
  derived; payloads carry the epoch they were sealed under; members hold a key
  *set*; removal mints `K_{n+1}` but never re-encrypts old payloads ("cut the
  future, not the past").
- **Audience model:** `circle | close | public` (+ `group | letter` streams) —
  each audience = one key stream instance; "close friends" is the single allowed
  subset (no per-friend subsets — Jon's call during the discussion).
- **Letters:** per-recipient sealing always (no shared key); read state is
  plaintext per-recipient rows.
- **Data model (C23):** sealed content in a single nullable `payload` column per
  typed table; declared plaintext metadata list; client-side content search; no
  searchable/OPE encryption, ever; schema stays crypto-agnostic.
- **Stories:** ttl → server deletes payload, no re-encryption; author's private
  archive copy optional.
- **Groups (C24):** shared group key, epoch chain as circles, server-enforced
  membership/invites/kicks, stated limits (past stays readable; out-of-band key
  re-sharing unfixable).
- **Properties extended** to 8 negative tests (fresh-per-epoch, public-opens-no-key,
  stream independence, kicked group member, metadata-only queries).

## Changes
- client: `docs/plans/CRYPTO-SPEC.md` rewritten/extended; `docs/DECISIONS.md` +C22
  C23 C24.
- server: nothing.

## Out of scope / follow-ups
- Group `K_{n+1}` mint/signing detail (spec open-questions list).
- Implementation lands with the R-00x crypto slices as scheduled.

*Friction: none logged yet — see `docs/FRICTION.md` in the server repo.*
