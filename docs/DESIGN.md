# DESIGN — how pigeonpost works

The living description of the system today. Update this in the same commit as any
structural change. The *why* behind each choice is in [`DECISIONS.md`](DECISIONS.md);
the exact crypto is in [`plans/CRYPTO-SPEC.md`](plans/CRYPTO-SPEC.md).

## The one-paragraph model

Your friends are a **circle**. Everything you share — a post, a story, a comment, a
profile photo, an event — is a **typed encrypted blob** sealed with your circle's
symmetric key. The server stores ciphertext and never holds a key. Friends already
hold the circle key (they got it when they joined), so publishing is: encrypt once,
upload one blob, friends pull and decrypt. Membership changes rotate the key.

## Layers

### 1. Identity & accounts
- Each user has a long-term **signing keypair** (Ed25519) and an **encryption
  keypair** (X25519). Anonymous by design: **username + password**, no email/phone.
- The password is stretched with **Argon2id** into a key that unlocks an
  **encrypted key-bundle** stored server-side as ciphertext. The server never sees
  the password or any private key. (MFA/TOTP is deferred — see ROADMAP R-012.)
- *Today's build:* accounts exist as **username only in a server `users` table**
  — signup/login screens hit `POST /api/users/*` with no password. This is a
  dev-rig probe only (see the first-exercise plan in the server repo); real
  auth is R-001 exactly as above.

### 2. The circle key (private mode)
- Each user owns a symmetric **circle key**. It is **shared** with every friend, so
  any circle member can both read and *author* content the circle can read — this is
  what makes comments work (a friend must encrypt to your audience).
- **History-visible:** a new friend receives the current circle key *and* past keys,
  so they can read your back-catalogue — like accepting a follower on Instagram.
- Keys are handed to friends wrapped to their X25519 public key (age / sealed box).

### 3. The encrypted-blob core
- One generic mechanism: `encrypt(blob, circleKey) → ciphertext`, stored by type.
- **Everything is a blob:** `post`, `story` (blob + TTL), `comment` (blob → postId),
  `profile` (photo + bio), `event`. Build the core once; posts are the first consumer
  that proves it.

### 4. Membership operations
- **Add friend:** exchange public keys; hand over the circle key(s) wrapped to their
  key. History-visible ⇒ include past keys.
- **Remove friend:** rotate the circle key; re-wrap the new key for the ≤999 who
  remain. Future blobs use the new key; the removed friend keeps only what they
  already had. At ≤1,000 members with low churn this is ~a thousand tiny ops.
- **Cap: 1,000 friends** in private mode — a deliberate design choice that keeps the
  crypto simple (no MLS/ratchet-tree needed).

### 5. Two account modes
- **Private** — E2EE, ≤1,000 circle. The default and the point.
- **Public** — plaintext, unlimited reach. Broadcasting to strangers has no secret to
  keep; influencers live here. No encryption, no cap.

### 6. Pigeon mail (separate stream)
- A 1:1 letter, **not** a circle blob. Sealed to one recipient's public key
  (`crypto_box_seal`) with a server-held **release time** — the server holds opaque
  ciphertext and delivers it after N days. It can't read it before or after.

## Trust model

pigeonpost is a **web app**, so be precise about what it does and doesn't promise:

- **What it defends against:** the server only ever stores ciphertext and public
  keys. A database breach, a leaked backup, or a subpoena for stored data yields
  nothing readable. A removed friend can't read future posts.
- **What it does *not* claim:** true "zero-knowledge against a malicious operator."
  A web app re-downloads its code from the server on every visit, so a hostile
  server could serve poisoned code. We close that gap with **honesty, not
  cryptography**: the client is open source (AGPL-3.0) and every release publishes a
  **build hash** anyone can verify against the source; the truly paranoid can build
  and run the client themselves. This is the same posture as Proton and Ente's web
  tiers. A native/installed client (stronger tier) is a later option, not required.
- **Never market beyond this.** Overclaiming is disqualifying for a privacy product.

## Hosting
Fully **self-hosted, local-first** (decision C15): everything runs on Jon's own
machine today and on his own server in production. The server itself is a
separate **private** repo (`pigeonpost-server`) that implements the wire contract
in [`reference/API.md`](reference/API.md); this repo remains the open-source one.
From the client's point of view the server is only "an API that stores ciphertext",
so hosting choices don't leak into client code or docs.

## UI design (C18–C20)

The FE/UI how-to lives here (per the parent procedure's ownership table). The
exhaustive design notes, wireframes and open questions that led here were
[`plans/UI-DESIGN.md`](plans/UI-DESIGN.md), now folded into this section.

### 4.1 Theme system — semantic tokens, two swappable palettes
- **Tokens are the contract; palettes are values.** Components never name a
  colour — they read `palette.bg / panel / text / textDim / accent / accentAlt /
  success / error / warning / overlay` plus the **props** `paper / ink / wax`
  (a letter's physical surfaces) through the `useTheme()` hook. The only file
  where a colour literal may appear is `src/ui/theme/palette.ts` — enforced by
  `scripts/check_palette.sh` (see [TESTING](reference/TESTING.md)). Swapping a
  palette is swapping one file's values.
- **Two palettes:** **dark** (default, the product identity — coal/walnut/brass,
  ported from privacymogul's palette) and **light** ("parchment" — cream paper,
  walnut ink, darkened brass, re-derived for WCAG contrast). Both implement the
  same 11 tokens + 3 props; the light accent is *not* the raw brass because raw
  brass fails contrast on cream.
- **Mode behaviour:** default dark; first run follows `prefers-color-scheme`;
  the toggle (sun/moon, in Settings) persists the user's choice. Only **global
  chrome** — NavBar, TopBar, banners — follows the viewer's theme. Profile
  **pages** are themed by their owner (below): a light profile page inside your
  dark chrome is intentional, not a bug.
- **Letters are physical:** `paper` stays light and `ink` stays dark in both
  modes; the mail stream should never look themeable.

### 4.2 Responsive — one component library, two layouts
Desktop and mobile web reuse everything; the foolproof split is by **viewport
breakpoint + semantic container widths**, not by writing screen pairs:
- Breakpoints in `src/ui/theme/breakpoints.ts` — tablet ≥768, desktop ≥1080
  (`useLayoutMode()`); a screen may branch *layout*, never *components*.
- Content is centred columns via `Screen width=` (narrow 560 / reading 640 /
  wide 960): every screen is one code path, and the column just widens.
- Global chrome adapts: bottom **NavBar (mobile/tablet)** vs **TopNav
  header-band (desktop, ported from privacymogul's walnut/brass band)** — the
  same four content tabs in both; the profile lives behind the user image
  (never a nav item), the notification bell rides in the bar, and detail
  screens get universal back buttons in their TopBar.
- Content splits only where the viewport demands: the letters inbox is
  stack-on-mobile / **two-pane on desktop** (list + reading pane); profile
  layouts carry per-widget `span` (bridge one or both columns on desktop,
  collapse to a stack on mobile).
- **One measured column: desktop content is a standard 2/3-width centre
  column** (min 560 / max 980) regardless of tab — the margins stay clear as
  the reserved canvas for owner-chosen profile banners (a later editor
  feature). `Screen width="full"` is the only exception (letters two-pane).
- **Web scroll is page-level:** screens wrap their content in the shared
  `ScreenScroll`; `List` lists without owning scroll, so banners, charts and
  headers travel with the page. On web the native scrollbar is hidden and a
  **brass rail with a travelling pigeon** (PM `CogScrollbar` port, negligible
  drag/click affordances kept) indicates progress; `prefers-reduced-motion`
  holds it still.

### 4.3 Shared component library + the screens rule
`src/ui/components/` (one barrel, `components.ts`): AppText, AppButton, Panel,
AppInput, SearchBar, Avatar, Divider/PageRule, Icon (curated glyph set),
NavBar/SideRail/TopBar, Screen, List, Loading, EmptyState, Banner, Modal,
ThemeToggle, PostCard, StoryRow, CommentRow, LikeButton, WorldMap, Rule (PM hairline). **Jon's rule,
gate-enforced:** a screen never imports a UI primitive — it composes shared
components (raw `Text`/`TextInput`/`ActivityIndicator`/vertical `ScrollView` and
deep imports are ceiling-0 in `check_ui_reuse.sh`). "We only need one" is never
a reason to inline; build the generic one.

### 4.4 Profiles — the MySpace-based, XSS-safe widget engine (C19)
- A profile is a **page of widgets** (about / wall / recent-posts / pigeons …)
  rendered by `src/ui/profile/PageRenderer` from a stored **layout/theme blob**
  (C08 blob type): page-level mode + colour picks, per-widget overrides. No
  user markup ever executes (the MySpace XSS lesson — the editor later edits
  the blob, it cannot inject code). MySpace 2004–2010 model notes live in the
  frozen plan (§8.2) if a widget design question needs the history.
- The v1 layouts are hardcoded as sample blobs (Instagram-ish + MySpace-maximal
  in the sample data) but render through the same engine the future editor
  drives — customisation later is a blob editor, not a rebuild.
- Walls: friends post on a profile's wall; the owner deletes (not edits) any
  post. No repost/quote ever (C18 below).

### 4.5 Letters — the model of record (C20)
- **A map, not an Earth:** a hand-drawn parchment world of pins. Your pin is
  movable; pin distance maps to delivery days (average ≈ 3 days).
- **Delivery:** a letter is *stamped* (press-and-hold chop), then **in transit**
  with a server-held release time. Recipient sees "sealed, arrives Tue"; opening
  **breaks the seal once, ever** (animated; `prefers-reduced-motion` gets the
  single still frame). Reads after that are plain paper.
- **Text-only, ~10k char silent cap** (inline error past the cap); **drafts
  yes; no self-letters**; **immutable once delivered** — no edit, no delete,
  email-like.
- **Friends-only addressing**, and pigeons are **visible in flight to the
  circle by default** ("from → to" readable); each viewer can switch that
  visibility off — honest metadata, never marketed as hidden.
- Seal art is decorative (never in the blob); the map position is profile-type
  blob data; the server computing delivery from two coordinates is the honest
  timing-metadata trade (see [Trust model](#trust-model)).
