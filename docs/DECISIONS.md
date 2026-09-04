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

**C18 — No repost/quote, ever, and no ranking: the feed is frugal.** Sharing
someone's post to your own audience broadcasts *their* words to *your* reach —
a privacy violation, not a feature. The feed is friends-only, strictly
reverse-chronological, stories on top (S5); no letters band on it (that's the
Letters tab's whole reason to exist). Revisit only if a circle explicitly asks.

**C19 — Profiles are owner-themed widget pages, never user HTML.** The MySpace
profile-as-homepage model is the product shape, but MySpace's raw-HTML custom
profiles were an XSS farm, and E2EE raises the stakes (a profile-script flaw
reads plaintext in-session). So: profiles render a curated, registered widget
set (about / wall / recent-posts / pigeons / …) from a stored layout/theme blob —
page-level mode + colour picks from palette tokens, per-widget overrides, zero
user markup executed. v1 hardcodes the layout as a sample blob but through the
renderer engine the future editor will drive; the editor is a feature of the
blob, not a rewrite. The page theme belongs to the page's owner; the viewer's
chrome (NavBar/TopBar/banners) always follows the viewer's own app theme.

**C20 — Letters: parchment world, once-only seals, immutable once delivered.**
From Jon's brief, decided round 2/3 (2026-09-03, §7 of the frozen plan): a
hand-drawn map of movable pins; distance ⇄ delivery days (average ≈ 3 days);
press-and-hold stamping; server-held release time while in transit; seal breaks
once, ever, animated with a reduced-motion still. Letters are text-only with a
silent ~10k cap (inline error past it, never surfaced), drafts fine, no
self-letters, no edit/delete after delivery. Cannot address non-friends.
Pigeons in flight are visible to the circle ("from → to") unless a viewer
toggles that visibility off — honest metadata; the server computing delivery
from two coordinates is the same trade and is stated in DESIGN's trust model.

**C21 — Colour lives in one file; screens compose shared components.** The
theme system is semantic tokens read via `useTheme()`, with the only colour
literals in `src/ui/theme/palette.ts` (guard script + WCAG contrast unit tests
in the gate), and the reuse ratchet extended to ban raw `Text`,
`ActivityIndicator`, vertical `ScrollView`, and deep component imports in
screens. Desktop vs mobile is one component library: breakpoint + a semantic
column width (`Screen width=`), chrome that swaps itself (NavBar ↔ SideRail),
and per-widget spans — never a screen split in two by breakpoint. (Mogul
Music's ported ratchet discipline, now also guarding colour.)

**C22 — One subset only: "close friends."** Post/story audiences are
`circle | close | public`, where `close` is a *single* optional subset — never
per-friend selects, never arbitrary named subsets. Each allowed audience is its
own key + epoch chain (same §-3 machinery of CRYPTO-SPEC), so a whole family of
subset-proliferation problems never exists. Supersedes nothing; narrows C04/C05
to the single-subset shape.

**C23 — Sealed content, plaintext metadata; no searchable encryption, ever.**
The tension-Jon-faq: a server must filter/sort/route (recent posts from my
friends, unread counts, delivery times, who's in a group), so content lives in
one sealed `payload` column and *declared* metadata fields stay plaintext —
Signal/WhatsApp/Apple-ADP all converge on the same split, and Apple's own
explanation is that sorting is impossible otherwise. Rule of record: any field a
required query must filter/sort/count on is plaintext and **published in the
trust model's metadata list** (each new filterable field = an explicit decision
to expose metadata); content search stays client-side over fetched pages.
Searchable / order-preserving / "queryable" encryption (beacons, OPE/ORE, SSE) is
ruled out: documented access-pattern reconstruction attacks are practical, no
vendor supports sorting on encrypted columns, and it would violate the
reuse-vetted-libs rule (C10). Schema stays crypto-agnostic (typed tables with a
single nullable `payload` column). Refines C08 (typed blobs → typed tables with a
`payload` column; blob core still one mechanism).

**C24 — Groups: server-enforced membership, member-held keys.** A group is a
single-channel shared feed: one symmetric group key, epoch chain exactly like a
circle (§3.2 — kick = mint `K_{n+1}` sealed to remaining members, **no
re-encryption of old payloads**; removed members keep old epochs — "cut the
future, not the past," same honesty line as unfriending). Membership, invites
(any member may invite), kick, and post rights are **server-enforced** (E2EE
protects content from the server; access control is the server's job), with
epoch-key distribution gated by that roster. Stated limits: past group content
stays visible to a removed member; a current member can always share the current
key out-of-band — equivalent to screenshotting, logged as a trust limit, not
designed around.
