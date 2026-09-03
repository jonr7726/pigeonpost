# DECISIONS — the ADR log

One entry per locked choice, newest at the bottom. **Supersede, don't edit** — if a
decision changes, add a new `Cnn` that references and overrides the old one. This is
the *why*; the living *what* is in [`DESIGN.md`](DESIGN.md).

---

**C01 — Web-first, not native, for v1.** True zero-knowledge wants a native/installed
client, but the product is a browsable web app. We adopt the honest-operator model
(same as Proton/Ente web tiers): encrypt client-side, store only ciphertext, and make
trust *checkable* via open source + published build hashes. Native is a later,
optional stronger tier — not a launch blocker.

**C02 — Licence: AGPL-3.0.** For a trust-based privacy product, anyone who hosts a
modified version must publish their source. As sole copyright holder Jon retains the
right to dual-license commercially later. Dependencies stay permissive (MIT/BSD/ISC/
Apache); `age`/`libsodium` qualify.

**C03 — Stack: TypeScript + Expo (React Native Web).** One codebase → web now,
iOS/Android later ("free win"). Lets us reuse the JS crypto libraries directly.
Content is E2EE and behind login, so Expo/RN-Web's weaker web-SEO is irrelevant here.
Flutter was rejected: it fights the JS crypto libs and Flutter Web is heavy for a
content app.

**C04 — Hard cap: 1,000 friends (private mode).** A deliberate product limit that
collapses the hardest crypto: at ≤1,000 members with low churn we do **not** need MLS
/ ratchet trees — a naive key rotate + re-wrap on membership change is trivial
(~1,000 tiny ops, milliseconds).

**C05 — Two account modes: private (E2EE, ≤1,000) and public (plaintext, unlimited).**
Broadcast content is public by nature — there is no secret to protect when posting to
a million strangers, and E2EE there is infeasible *and* pointless. Influencers use
public mode.

**C06 — History-visible membership.** A new friend receives current + past circle keys
and can read the back-catalogue, matching Instagram's "accept a follower" behaviour.
(Rejected history-sealed / forward-secrecy-for-newcomers as a messaging property we
don't want for a social feed.)

**C07 — Shared symmetric circle key (not per-post asymmetric).** All circle members
hold the same key, so a friend can *author* content the circle reads — required for
comments. Simpler than per-recipient wrapping and comment-friendly.

**C08 — Everything is a typed encrypted blob.** One generic encrypted-blob core;
`post`/`story`/`comment`/`profile`/`event` are all blobs sealed with the circle key.
Build the core once, verify it by shipping posts first.

**C09 — Pigeon mail is a separate 1:1 stream.** Sealed to one recipient
(`crypto_box_seal`) with a server-held release time — not a circle blob, simpler
crypto, built in parallel with the social features.

**C10 — Reuse crypto, never hand-roll.** `age-encryption` (typage) for
multi-recipient/blob encryption; `libsodium-wrappers` for keypairs, signatures, and
1:1 sealed boxes. We write only the thin app-specific glue (circles, membership,
rotation) — never a primitive.

**C11 — Hosting: Vercel + Supabase free tiers for the alpha.** Vercel Hobby (free,
legitimately, while non-commercial) for the web app + per-PR preview rigs; Supabase
Free for Postgres + ciphertext blobs. Use **two Supabase projects** (prod + seeded
staging) rather than paid branching. Keep the DB layer swappable (plain Postgres) so
production can move to a self-hosted server later, like Mogul Music. Media may
outgrow the 500 MB free storage and move to own object storage.

**C12 — Adversarial crypto tests are mandatory and distinct from e2e.** e2e verifies
user journeys but cannot assert the security properties. The crypto core carries fast
unit tests for the five negative properties (see `reference/TESTING.md`). e2e does not
replace them.

**C13 — MFA (TOTP) deferred post-MVP.** MVP auth is anonymous username + password
(PAKE, so the server never sees the password) unlocking an encrypted key-bundle. TOTP
is a later add (ROADMAP R-012); it does not change the key model.

**C14 — Two-repo split; only the client is open source.** The project is two
separate repos under one parent folder: `pigeonpost` (client, this repo) and
`pigeonpost-server` (private, never published). Only the client — plus its docs,
crypto spec, and the API contract (`reference/API.md`) — is publish-bound and
treated as public from day one. Server implementation docs are private and never
enter this repo. Rationale: keeps the trust posture of open code (C02, C01) without
handing anyone a ready-to-run copy of the service.

**C15 — Hosting + testing: fully self-hosted, local-first. No cloud, no CI, no
Vercel, no Supabase.** All hosting is our own server, from day one. There is no
CI pipeline: verification is a **local gate run before every commit, and a
compulsory re-run before merge** — the gate must be green in the session handoff,
reported honestly as "ran locally" (no pipeline exists to trail behind).
Supersedes **C11** (Vercel + Supabase free tiers): the 500 MB ceilings and
cloud-sprawl for an alpha aren't worth it; a self-hosted Postgres costs nothing
extra and the test rig (per-worktree DBs, seeded) works the same way, one
directory per session. e2e rigs live in the server repo.

**C16 — e2e lives in the server repo, per-session worktrees + DBs.** e2e specs are
Playwright over the *running app*, not imports; they assert journeys by spinning
the client and server of the session's own worktrees and hitting the API
contract. They live in the server repo because the rig (ports, DB seeds,
`new-worktree.sh`) lives there too. Journeys that are pure-client crypto
properties still belong in this repo's unit tier (C12, `reference/TESTING.md`).

**C17 — Production CORS: none — the client is served same-origin.** The web
client and API share one origin in production, so no CORS headers are emitted
there at all (the safest posture: no origin wildcard for anyone to lean on).
Cross-origin requests only exist in dev (Expo web on one port, API on another),
and there they are **opt-in**: the dev rig writes `CORS_ORIGIN` into the
worktree's `.env`, and the API emits CORS headers only when that variable is
set — production never sets it, so the middleware doesn't even exist. Pinned by
`__tests__/cors.test.ts` on the server side. (First-exercise friction #6/#14;
decided there, formalised here.)
