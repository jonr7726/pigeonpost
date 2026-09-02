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

## This repo vs the project

This repo holds the **client** and everything publishable: the app, the crypto
spec, the design, the API contract, the decisions. It is **the open-source repo**.
The server implementation lives in a separate **private** repo
(`pigeonpost-server`, sibling folder) — there is no reason for a client to know
how a server is stored or deployed, only what the wire contract says. The
project's working procedure, session rules and cross-repo layout live in the
parent folder's `CLAUDE.md`.

## Status

Early scaffold. No features yet — this repo currently holds the architecture,
the crypto spec, and the working conventions. See [`docs/ROADMAP.md`](docs/ROADMAP.md).

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
