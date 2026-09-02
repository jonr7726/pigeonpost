# CRYPTO-SPEC — the Phase 0 blueprint

**Status: Active** — foundation for R-001–R-008.

The exact key hierarchy and operations, at the level an implementer needs. Written
before code deliberately: the crypto core is small and unforgiving, so it gets a spec
first. Properties are what matter — we compose vetted libraries, never hand-roll
primitives (`age-encryption`, `libsodium-wrappers`). Rules the code must honour are in
[`../reference/TESTING.md`](../reference/TESTING.md).

## 0. Primitives we lean on (and their promise)
- **Symmetric AEAD** (libsodium `crypto_secretbox` / XChaCha20-Poly1305): one key
  locks & unlocks; tamper fails loudly. → encrypts the actual blob.
- **Public-key seal** (libsodium `crypto_box_seal` / X25519): seal *to* a public key,
  only that private key opens it. → hands a circle key to a friend; also the whole of
  pigeon mail.
- **Signature** (Ed25519): private signs, public verifies authorship + integrity.
- **age** (`age-encryption`): multi-recipient blob encryption — a convenient wrapper
  when a blob must open for a *set* of keys.
- **Argon2id** (libsodium `crypto_pwhash`): password → key, slow + salted.

## 1. Identity
Per user, generated client-side:
- `idSign` — Ed25519 keypair (long-term authorship).
- `idEnc` — X25519 keypair (receiving wrapped keys / pigeon letters).
- Public halves are published to the server's key directory. Private halves live only
  inside the encrypted key-bundle (§2).

## 2. Anonymous account & key-bundle
- Account = `username` + `password` (no email/phone). **PAKE** (e.g. OPAQUE) so the
  server verifies login without ever seeing the password.
- `unlockKey = Argon2id(password, salt)`. The **key-bundle** = `secretbox(unlockKey,
  { idSign.sk, idEnc.sk, circleKeys… })`, stored server-side as ciphertext.
- Login on any device: PAKE → download bundle → `unlockKey` opens it locally. Server
  learns nothing. (TOTP later, R-012. Recovery phrase, R-010.)

## 3. Circle key & the epoch chain (private mode)
- A user's audience is one **circle**. Content is sealed with a symmetric **circle
  key**. It is **shared** with every friend so members can also *author* (comments).
- Membership changes advance an **epoch**: `K₀, K₁, K₂…`. A blob records the epoch it
  was sealed under. A member holds the set of epoch keys they're entitled to.
- Distribution: each epoch key is handed to a friend `crypto_box_seal`-ed to their
  `idEnc.pk` (or via age with all friends as recipients).

## 4. Blob format
```
Blob {
  id, authorId, type: 'post'|'story'|'comment'|'profile'|'event',
  epoch,                 // which circle-key epoch sealed this
  refId?,                // e.g. comment → postId
  ttl?,                  // stories
  ciphertext,            // secretbox(K_epoch, plaintext)
  sig                    // Ed25519 over the ciphertext + header, by authorId
}
```
Server stores blobs opaquely, indexed by `authorId`/`type`/`epoch`. It can route and
list; it cannot read.

## 5. Operations
- **Publish:** `ct = secretbox(K_current, plaintext)`; `sig = sign(idSign.sk, ct||hdr)`;
  upload one blob. O(1), independent of friend count.
- **Add friend (history-visible):** exchange public keys; seal **all** epoch keys
  `K₀…K_current` to their `idEnc.pk`. They can now read past + future. Cap: **1,000**.
- **Remove friend:** mint `K_{n+1}`; seal it to the ≤999 remaining. New blobs use
  `K_{n+1}`; the removed member keeps only `K₀…K_n` (past they already saw). ~1,000
  seals — milliseconds. No re-encryption of old blobs.
- **Read:** fetch blob → verify `sig` against author's published `idSign.pk` → pick
  `K_epoch` → `secretbox_open`.

## 6. Pigeon mail (separate 1:1 stream)
- `letter_ct = crypto_box_seal(recipient.idEnc.pk, plaintext)` — only the recipient's
  private key opens it. Server stores `letter_ct` + `releaseAt`, delivers after the
  delay. Server can't read it before or after. No circle, no epochs.

## 7. Public mode
No circle key. Blobs stored plaintext; unlimited audience. Same blob shape, `epoch`
and `ciphertext` fields simply carry cleartext + a null key marker. (R-009.)

## 8. The properties the implementation MUST satisfy
These are the [negative tests](../reference/TESTING.md). If any can fail, the design
is broken:
1. A removed friend cannot open blobs with `epoch > removalEpoch`.
2. Given only stored ciphertext + public keys, the server cannot recover any plaintext.
3. A non-friend (no epoch key) cannot open a circle blob.
4. A modified `ciphertext`/`sig` fails `secretbox_open` / verify.
5. A pigeon letter opens only with the recipient's `idEnc.sk`.

## Open spec questions
- PAKE library choice (OPAQUE implementation maturity in TS) — R-001 spike.
- age vs raw `crypto_box_seal` for epoch-key distribution — both viable; pick in R-002.
