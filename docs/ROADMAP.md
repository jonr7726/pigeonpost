# ROADMAP — future work only

What's next. Items **leave this file when they ship** (removal is the "done" signal;
the history lives in `DECISIONS.md`, frozen plans, and git). IDs are immutable
`R-NNN`, never reused; next = highest + 1.

The build is two streams after the foundation, per [`DESIGN.md`](DESIGN.md) and
[`reference/CRYPTO-SPEC.md`](reference/CRYPTO-SPEC.md).

## Now — foundation
- **R-001 — Accounts & friends.** Anonymous username + password (PAKE), Ed25519 +
  X25519 keypairs, encrypted key-bundle, friend request, circle-key exchange.
- **R-002 — Encrypted-blob core.** Generic `encrypt/decrypt(blob, circleKey)` over
  age/libsodium; storage of typed ciphertext blobs; the five negative tests.
- **R-003 — Posts.** First blob consumer — proves the core end to end (compose, feed,
  pull, decrypt, render).

## Next — Stream A (social)
- **R-004 — Comments.** Blob authored by any circle member, pointing at a post.
- **R-005 — Stories.** Blob + TTL, ephemeral.
- **R-006 — Events.** Structured blob (Facebook-events-lite).
- **R-007 — Profiles.** Blob: photo + bio + MySpace-style customisation.

## Next — Stream B (parallel)
- **R-008 — Pigeon mail.** 1:1 sealed-box letter + server-held delayed release.
- **R-014 — Wire the UI storyboard to the real streams.** The UI foundation
  ships ahead of the BE: every screen renders from `src/data/sample/` and swaps
  to the API mechanically as R-001–R-008 land. Includes the profile
  customisation editor (a blob editor over C19's PageRenderer) and real seal /
  map / media assets replacing the storyboard glyph set. Sequencing is Jon's
  roadmap call; see `DESIGN.md` "UI design".

## Later
- **R-009 — Public account mode.** Plaintext, unlimited reach.
- **R-010 — Multi-device + recovery phrase.** Add a device to your key-bundle; a
  recovery passphrase as the no-email safety net.
- **R-011 — Verifiable builds.** Open-source is done; add reproducible build +
  per-release hash manifest + a visible build id in the UI.
- **R-012 — MFA (TOTP).**
- **R-013 — Key transparency log.** Append-only username→key log so the server can't
  hand you a fake key for a friend.

## Unscheduled (park ideas/bugs here as one-liners)
- Metadata privacy (hide the social graph — sealed-sender / mixing). Hard; v2+.
- Moderation via client-side reporting + reputation (server can't see content).
- Monetisation (only if it gains traction).
- Native/desktop client as the stronger trust tier.

## Open questions
- Media storage — own object storage from the start, or move it into it when the
  Postgres blob table grows uncomfortable?
- Circle-key rotation: re-encrypt old blobs on removal, or keep the epoch-key chain?
  (Spec leans epoch-key chain — cheaper, history-visible friendly.)
