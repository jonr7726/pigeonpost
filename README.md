# pigeonpost (client)

A small, private social network. Post to your circle, not to the world — your
posts, stories, comments and profile are **end-to-end encrypted** so the server
that stores them can't read them. Plus a **pigeon mail** feature: a letter that
takes days to arrive.

> **Honest about the threat model.** pigeonpost is a web app. Content is
> encrypted in your browser and the server only ever holds ciphertext — that
> defeats database breaches, backups leaking, and subpoenas. It is **not**
> "zero-knowledge against a malicious operator": a web app downloads its code
> from the server on every visit, so you are trusting us to serve honest code.
> We make that trust *checkable* — the client is open source (AGPL-3.0) and every
> release publishes a build hash you can verify. See [`docs/DESIGN.md`](docs/DESIGN.md#trust-model).

## Status

Early build: the app runs, accounts exist as usernames (real auth lands next —
see [`docs/ROADMAP.md`](docs/ROADMAP.md)). The architecture and the crypto spec
are already here and are the best guides to what this becomes.

## Stack

TypeScript + [Expo](https://expo.dev) (React Native Web) — one codebase targets
web now, iOS/Android later. Crypto is **reused, never hand-rolled**:
[age-encryption](https://github.com/FiloSottile/typage) for multi-recipient
blobs and [libsodium](https://doc.libsodium.org/) for keys, signatures and 1:1
sealed boxes.

## Start here

- [`docs/README.md`](docs/README.md) — the docs index (read this first).
- [`docs/DESIGN.md`](docs/DESIGN.md) — how it works.
- [`docs/plans/CRYPTO-SPEC.md`](docs/plans/CRYPTO-SPEC.md) — the crypto blueprint (Phase 0).

## Licence

[AGPL-3.0](LICENSE). If you host a modified version, you must publish your source
— that's the point: it keeps the operator honest.

## Deploying

The web build is a standard Expo web export (static: `npx expo
export --platform web` → `dist/`). Our public deployment: the FE is served on
Cloudflare Pages (auto-deploy on push to `main`), the API is self-hosted
(pointed at via the `EXPO_PUBLIC_API_URL` build-time env var — see
`src/data/api.ts` for the default fallback used in dev). If you self-host, set
`EXPO_PUBLIC_API_URL` to your API origin and deploy `dist/` anywhere static.
