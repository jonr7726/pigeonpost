# ui-layout — the UI foundation: theme, palette, shared components, screens-first shell

**Status: Active** (design for review; next session implements)

Build the real UI foundation (no mockups), wired to **sample data only** — nothing
maps to the API or DB yet. Every screen renders from a typed `sample/` module so a
later session can swap sample data for real API calls without touching screen code.

Scope decision:
Everything here is client-side (UI/theme/components/tests) — it all lives in this
repo. Server repo untouched this slice.

---

## 1. Theme system (design from day one, dark + light)

### Architecture

    src/ui/theme/
      palette.ts        ← the ONLY place a colour literal may appear (see §2)
      theme.ts          ← semantic token type + mapping: token → palette colour
      ThemeProvider.tsx ← React context: mode ('dark' | 'light'), default dark,
                          persists to AsyncStorage, exposes palette + toggle
      useTheme.ts       ← hook: `const { palette, mode, toggle } = useTheme()`

**Semantic tokens are the contract; palettes are swappable values.** Components
never say "brass" — they say `accent`. Two palettes implement the same token set:

    type Palette = {
      bg: string;          // page background
      panel: string;       // cards / panels
      panelEdge: string;   // hairline borders
      text: string;        // primary text
      textDim: string;     // secondary text
      accent: string;      // primary accent (links, active)
      accentAlt: string;   // secondary accent
      success: string; error: string; warning: string;
      overlay: string;     // scrims/press states
      /* props (physical objects, not theme):
         paper, ink, wax — letter pages, seals. Same names in both palettes
         but values may differ (paper is light in dark mode, natural in light). */
    }

**Dark palette (default)** — ported from privacymogul `globals.css` verbatim:

| token     | value     | from PM          |
|-----------|-----------|------------------|
| bg        | `#14100b` | coal             |
| panel     | `#1f1812` | walnut           |
| panelEdge | brass 35% | brass hairline   |
| text      | `#ece3cf` | cream            |
| textDim   | cream 62% | as in PM         |
| accent    | `#c9a24b` | brass            |
| accentAlt | `#b87333` | copper           |
| success   | `#4a7c6f` | patina           |
| error     | `#c0453a` | PM red           |
| warning   | `#b8860b` (dark goldenrod family, kept near PM's `.pm-caution` `#e6b422`) |

Light palette ("parchment)", same token names, inverted for a paper feel:
bg `#ece3cf`-family paper, panel slightly-darker parchment, text walnut `#1f1812`,
accent **darkened brass** (≈`#8a6a1f`) — raw `#c9a24b` fails contrast on cream, so
the light palette's accents are the dark-mode accents re-derived for contrast. Exact
values get tuned against the contrast test in §2 when implemented.
Success/error/warning keep hue, adjust lightness. `paper`/`ink`/`wax` stay natural
(paper light, ink dark in both modes — a letter is a physical object in both).

**The toggle:** lives in Settings (and the account screen header initially). Default
**dark** (it's the product's identity), `prefers-color-scheme` on first run, persisted
after the user touches it. Implementation note (Expo web): a `data-theme`-style class
on the root plus tokens from context — no CSS vars needed on RN-Web; components read
`palette` via the hook. **Components must always read the hook, never import
`palette.ts` directly** (ratchet-checked, §2) so the mode switch is instant and
global.

---

## 2. Guardrails (extension of the existing gate)

Current gate (all kept): typecheck, unit tests incl. crypto negatives,
`check_ui_reuse.sh` (raw-TextInput ban, private-widget ban), `check_clones.sh`.

**New: palette test** — `scripts/check_palette.sh` + a vitest case, both in the gate:

1. Scan all `src/**/*.{ts,tsx}` for colour literals: `#[0-9a-f]{3,8}`,
   `rgb(a)?(`, `hsl(a)?(`, and Tailwind arbitrary colour classes (`bg-[#…]`,
   `text-[#…]`, `border-[#…]`, …). **Zero allowed outside `src/ui/theme/palette.ts`**
   (the single source of truth — swap a palette, swap one file + tokens).
2. Contrast check (vitest, in the unit tier): for each palette, compute WCAG
   contrast for `text`/`textDim` on `bg` and `panel`, and `accent` on `bg`/`panel`.
   Fail a palette that can't read. (Tuned once when values are implemented.)
3. No `reuse-exempt`-style colour exemptions: if a literal is truly needed it goes
   into `palette.ts` as a named (token or prop) colour — that is the escape hatch,
   and it's review-visible.

**Reuse ratchet extensions** (same file, same ratchet mechanics — ceilings only go down):

- Ban raw `Text` (RN) in screens — the shared `AppText` handles font/colour/tone.
  (Raw `View` and layout primitives stay allowed; they're layout, not UI surface.)
- Ban raw `ActivityIndicator`, `ScrollView` (vertical) in screens — shared
  `Loading`, `ScreenScroll` instead. Add to on demand; each new shared component
  gets a ban line so the promotion actually happens.
- New rule: **a screen may not import from `src/ui/components/*` deeper than the
  barrel** (`src/ui/components.ts` index) — keeps the component API surface one
  place.

Jon's rule, now written into the reuse gate's header comment and
`reference/TESTING.md`: *a screen never imports a UI primitive; it composes shared
components. "We only need one" is never a reason to inline — build the generic one.*

---

## 3. Initial component library (build these first, all generic)

    src/ui/components/
      AppText        (tone: body/dim/display/mono; size steps; inherits palette)
      AppButton      (variant: primary/secondary/ghost/danger; loading/disabled)
      Panel          (the walnut/brass card surface — everything sits on one)
      AppInput       (single text input incl. multiline; used by UsernameField)
      SearchBar      (AppInput + icon + clear; friend search is its first user)
      Avatar         (photo or initial, size steps, story/ring slot)
      Divider / PageRule   (PM's brass hairline separator)
      Icon           (one icon component, curated Feather-style set)
      NavBar         (bottom tab bar: Letters / Feed / Discover(compose) / Profile)
      TopBar         (title + optional back/menu; reused by every screen)
      Screen         (safe-area + padding wrapper every screen wraps in)
      List           (flatlist wrapper w/ loading/empty/error states — one impl)
      Loading / EmptyState / Banner
      Modal          (one shared sheet/modal)
      Feed           (publisher of PostCard/StoryRow scrolls) — via List + PostCard
      PostCard       (photo post, text post, blog-post: one component, content types)
      StoryRow       (avatars row with story rings)
      CommentRow, LikeButton, AvatarButton (composed from the above)
      ThemeToggle    (sun/moon segmented control)

Nothing is screen-specific. Components exist even where v1 shows them once
(SearchBar, Banner…) — that's the standing rule.

---

## 4. Sample data (no BE/DB mapping)

    src/data/sample/
      types-shared.ts   ← the screen-facing types (User, Post, Story, Letter, Seal...)
      sample.ts         ← deterministic seed: 4–6 users, bios, avatars (initials),
                          stories, mixed posts (photo/text/blog + comments/likes),
                          letters in every state (in-transit, delivered-sealed,
                          opened, overdue), friend requests (one w/ message)
      useSampleData.ts  ← assumed-reactive store (useState/useMemo config so screens
                          behave like the real thing; swapped for API later)

**Screen rule enforced by convention + reuse gate:** a screen imports only
`useSampleData()` and components — zero direct API imports — so the future swap is
mechanical. `src/data/api.ts` stays untouched this slice.

---

## 5. Screens to build (shell-first, static but fully interactive with sample data)

0. **App shell** — bottom NavBar (5 tabs: Letters, Feed, Discover, Profile portrait,
   Settings) + TopBar. Chosen so every later screen lands inside it.
1. **Feed (Discover/home)** — StoryRow on top (friends' 24h), then friends' latest
   posts via Feed/PostCard.
2. **Account / Profile** — top: avatar, username, friend count, bio, ThemeToggle row;
   then stories + historical Posts grid → tapping a grid cell opens the post.
3. **Post detail** — PostCard full + comments + like.
4. **Letters — inbox** — threaded list: sealed (arrived, unopened → tap = Seal
   break animation, once), open (read), in transit ("~3 days", travelling-pigeon
   marker on the map row), overdue.
5. **Letters — read** — paper prop (`paper`/`ink`) drops in, text in ink, wax seal
   break animation on first open (framer-motion style; reduced-motion collapses to
   a single still frame — PM pattern), then plain paper.
6. **Letters — compose** — pick friend → map picker (see §6) → write → **Stamp**
   button: press-and-hold chop animation → "wing off" send animation → back to
   inbox with the letter in transit.
7. **Friend search / request** — SearchBar by exact username, result card, optional
   one-shot message with the request (the message shows to the recipient when they
   review the request — it does NOT open a persistent chat).
8. **Settings** — theme toggle, about.

Animations (send stamp, seal break, pigeon in transit) get implemented as shared
components in a `src/ui/animations/` folder using the existing
reduced-motion global pattern; each ships with a `prefers-reduced-motion`
static-equivalent (PM precedent).

---

## 6. Letters (the confident spec — lock these before implementation)

(From Jon's brief — restated here as the spec of record for the letters stream.)

- **Map**, not Earth: a hand-drawn "Middle-earth-style" world; your position is a
  pin you can move at any time. Distance between pins → delivery days, tuned
  so an **average letter ≈ 3 days**. Same map doubles as the travel view (a pigeon
  dot sliding from sender pin to receiver pin, live ETA).
- **Delivery model:** a letter is *stamped* (press-and-hold; hold long enough and
  the seal commits), then **in transit** with a server-held release time. Recipient
  sees "sealed, arrives Tue". Opening breaks the seal **once**, ever; later reads
  are plain paper.
- **Cannot request/send to non-friends.** To reach someone you must be friends —
  the letters and the circle share one notion of friendship.
- **Seals** (user config): pick from a set of hand-drawn seal templates, or compose
  one (shape + inset motif + edge pattern — a guided editor, not free canvas).
- **Letters are email-like, not chat-like:** one-offs between two people, no
  thread view unless we later decide to show "your correspondence" as a timeline
  of past letters (open question in §7).

Crypto placement (from existing DESIGN/DECISIONS, reconsidered here): a letter is a
1:1 sealed blob (C09) with a server-held release time — unchanged. The seal/paper
**art is decorative**: never enters the blob; the map position is a profile-type
blob (it's your circle-visible "where I am"). Map distance does NOT enter the
crypto path — the server computes delivery from two coordinate numbers, which the
server may see (this is honest metadata: the server knows letter *timing*, not
content; DESIGN's trust model line for it will be added at implementation).

---

## 7. Open questions (Jon decides; listed in the plan so nothing is silently decided)

Letters — **decided with Jon (2026-09-03, round 2)**:
- L1 — **Text-only letters** (they model a handwritten letter — no images). Hard
  cap ≈ **10,000 characters**, never surfaced in the UI; if the writer goes over,
  an inline error appears as they type past the cap. Most people never learn the
  limit exists.
- L2 — **Pigeons are visible in flight to all friends, by default:** the map shows
  pigeons carrying letters, readable as "from/A→to" — you can deduce your friends'
  correspondence paths. Anyone can **toggle that visibility off** for themselves
  (privacy choice, per viewer). Map has a **friend search/filter**; the filter
  matches a pigeon on **sender OR recipient**, so filtering to a friend shows their
  pigeons both ways. (This is the honest-metadata call: the circle can see
  correlation of flight paths unless a viewer toggles it off — never compare to
  E2EE metadata-hiding marketing.)
- L3 — **Drafts: yes**, a nice-to-have for MVP.
- L4 — **No self-letters.**

Social — **decided with Jon (2026-09-03)**:
- S1 — **No repost/quote — ever, not just v1.** Jon's call: sharing someone's post
  to your own feed broadcasts *their* content to *your* audience — a privacy
  violation, not a feature. (Revisit only if a circle ever asks for it explicitly.)
- S2 — **Friends can post on your profile** (MySpace wall), as a wall post blob.
  The **profile owner can delete any post on their wall** (harmful-content control);
  see §8 for the MySpace-based shape still being settled. v1: no per-user wall
  toggle (add one if noise shows up).
- S3 — **No Top 8 / inner circle** (skip ranking drama).
- S7 — **Bell icon in the TopBar** (badge dot; no sixth tab). NavBar stays 5 slots.
- S4 — **Like only for v1** if we keep an Instagram-style post surface at all —
  S4/S5/S6 glom onto the not-yet-settled "how do posts work" question (§8).

Editing / deletion — **decided (2026-09-03)**:
- Everything a user *authors* except letters they can **edit or delete forever**:
  their own posts, comments, wall posts, profile. Profile **owner** can also delete
  (not edit) anything on their wall. Post edits are visible as "edited" (no history
  surface) unless Jon asks for Facebook-style edit logs.
- **Letters are immutable, once delivered** — like email. No edit, no delete, both
  sides keep what was said. (Implicit: nothing models "unsending" a pigeon.)
- S5 (stories shape) is **unresolved** pending the MySpace-design discussion.

---

## 8. Social shape — MySpace-first (exploration for review, not yet decided)

Jon wants to understand MySpace's actual model before settling how posts/profiles
work. Wireframes → mind-model → the custom-HTML question.

### 8.1 Wireframes (lo-fi)

**Profile (MySpace-style — the profile IS the page):**

    ╔══════════════════════════════════════════════╗
    ║  @wren           [avatar]        412 friends ║
    ║  ✎ theme editor · this page can look like THIS ║
    ╟──────────────┬───────────────────┬───────────╢
    ║ ABOUT ME     │ WALL              │ RECENT    ║
    ║ bio + "who   │ Marta: message…   │ post · 2d │
    ║  I'd like to │ Hubert: hello…    │ post · 5d │
    ║  meet"       │ ┌──── write on   │ post · 1w │
    ║              │ │   this wall ─┐ │           │
    ║ pigeons: 12  │ └───────────────┘ │           │
    ║  in flight 3 ╚═══════════════════╧═══════════╝

- The profile is a **page of modules**, not a header above a grid. Modules:
  about, wall, recent posts (reverse-chron — no curation, no ranking).
- **Theme customisation lives on THIS page** — every profile can look different
  (MySpace's soul). Built with the structured theme editor (8.3), palette tokens.
- Wall (S2, decided) is its own surface with its own composer; comments *under*
  posts stay separate.

**Feed (friends page):**

    ┌ ─ ─ letters band ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
    │ 🕊 pigeon arrived (unread) · 3 in flight │
    └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
    ┌ post ────────────────────────────────┐
    │ Hubert · 2d                          │
    │ photo / text / blog content          │
    │ ♡ 3   💬 2   [comment box]           │
    └──────────────────────────────────────┘
    friends' posts only, strictly reverse-chron

Friends' posts (chronological, no algorithm) + their stories at the top, or no
stories at all — that's exactly the S5 decision the wireframe keeps open.

### 8.2 The MySpace mind (what made it, recorded so we don't guess)

From the record of the product ~2004–2010:
- **Profile-as-homepage.** Users pasted CSS/HTML into dedicated profile fields —
  sanitised, loosely — so "custom layouts" sites existed and every profile looked
  different. The profile was the product.
- **Interaction surface was: wall comments, messages, bulletins (broadcast to all
  friends), photos, Top 8.** The individual "post" as a unit-of-attention barely
  existed — no likes on content, no share/repost, no ranking feed.
- Everything was **reverse chronological and friend-scoped.** Discovery of new
  people existed, but "the feed" wasn't attention-optimised — the *page* was.
- **Bulletins** map cleanly to our letters/social split — worth remembering if
  we want a "post to all your friends" primitive that is NOT a letter (they're
  different surfaces, and MySpace kept them different for this reason).

### 8.3 Custom profile HTML — security take

MySpace allowed users to submit HTML/CSS rendered in-page. That's how it worked —
and why it was an **XSS farm**: sanitiser bugs let injection (the "Samy worm" —
1M+ friends in 20 hours — was a MySpace-profile XSS), session theft, defacement.
The stakes are *higher* here: E2EE means the decrypted content lives in the
browser, so an XSS isn't "stub a profile", it's **arbitrary JS running inside the
render app**, able to read other friends' plaintext for the session.

So the safe and MySpace-faithful shape is a **structured theme editor, not raw
HTML**: user picks modules (about / wall / recent / music / lore), palette-token
colours (dark/light become *user themes* — exactly why the token system earns its
keep), headline art, accent glyphs. Stored as a canonical theme blob, rendered by
our components — zero user markup executes, ever.

If real HTML is ever wanted: strict allowlist sanitizer + no script/handlers +
CSP + sandboxed iframe (the Tumblr/Reddit approach) — the honest fallback, but the
riskiest surface in an E2EE app. **Recommendation: theme editor now; revisit raw
HTML only with a threat-model doc if a real ask appears.**

---

## 9. Implementation order for the next session (suggested commits) + both palettes + ThemeProvider + palette check script + contrast
   test; extend reuse ratchet (§2). Docs lift §1/§2 into `DESIGN.md` + `TESTING.md`.
2. Core primitive components (AppText → … → Modal) + component tests for the
   key states (loading/empty/error/populated, per `TESTING.md` tier 2).
3. Social components (PostCard, Feed, StoryRow…) on sample data.
4. Screens 0–3, sample data module.
5. Letters screens 4–6 (animations: stamp, seal break, pigeon travel).
6. Friend search + Settings + ThemeToggle polish.
7. Full gate green from clean checkouts; hand back branch for review.

Per-project procedure: worktree, session DBs, and `check-all.sh` per the parent
`CLAUDE.md`; commit doc updates (DESIGN/TESTING/ROADMAP) in the same commits as
the code they describe. Friction log: append troubles/fixes as you go (this file).
