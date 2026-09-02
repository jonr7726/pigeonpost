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
