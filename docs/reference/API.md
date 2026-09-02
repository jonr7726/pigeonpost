# API — the pigeonpost wire contract

**Status: scaffold.** Filled in with R-001. This doc is the single source of truth
for the client/server protocol. The **client repo defines it**; the private
`pigeonpost-server` repo implements it and **must not** be documented here
beyond what a client needs to interoperate.

Everything is JSON over HTTPS unless noted. All content payloads the app shares
(`post`, `story`, `comment`, `profile`, `event`) are **typed encrypted blobs** —
the client encrypts with the circle key; the server stores opaque ciphertext
(see [`../plans/CRYPTO-SPEC.md`](../plans/CRYPTO-SPEC.md)).

## Accounts (skeleton — first-exercise; superseded by R-001's real contract)
- `POST /api/users/signup` `{username}` → `201 {id, username}`; error codes:
  `409` username taken, `400` invalid (1–32 chars of letters, digits, `_`).
- `POST /api/users/login` `{username}` → `200 {id, username}`; error: `404`
  no such user.
- `GET /api/health` → `{ok: true}`.
- **No passwords in this pass** (deliberate scaffolding; auth lands with R-001).
  A conforming server stores what it must; the client only sees the JSON above.

## Shape of the contract (per feature, landing with R-001+)
- **Accounts** — register (username only, no email/phone), fetch/rotate the
  encrypted key-bundle, auth session.
- **Friends** — request, accept, remove; circle-key (re-)exchange.
- **Blobs** — put/get typed ciphertext by kind, ordered feeds.
- **Pigeon mail** — upload sealed letter + release time; server releases after N days.

## Rules
- Endpoints are named for **what they do**, not how the server implements it.
- Any doc here must remain true for *any* conforming server — no deployment,
  storage or ops detail (that's server-repo-private).
