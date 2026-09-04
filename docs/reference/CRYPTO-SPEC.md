# CRYPTO-SPEC — the crypto blueprint

**Status: Active** — reference of record for all crypto decisions (R-001–R-008 and
beyond). Lives in `docs/reference/` (it never "freezes" like a plan); changes land
with the code they describe.

The exact key hierarchy and operations, at the level an implementer needs. Properties
are what matter — we compose vetted libraries, never hand-roll
primitives (`age-encryption`, `libsodium-wrappers`). Rules the code must honour are in
[`TESTING.md`](TESTING.md).

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

## 3. Audience keys & the epoch chain (private mode)

### 3.1 Audiences
A post carries one `audience` value: `circle` | `close` | `public` (letters are a
separate stream, §6). Each of `circle` and `close` is its own key + epoch chain;
`close` (C23) is a *single* optional subset — at most one `close` key stream per
user, never arbitrary per-friend subsets. Modeled as one mechanism we instantiate as
a **store**: a key stream `(scope, ownerId|groupId)` producing an epoch chain.

### 3.2 Epoch chains — fresh key per epoch, never derived
- Each stream starts at `K₀`, a fresh random symmetric key.
- Membership changes **mint a new random key `K_{n+1}`** — it is *not* derived from
  `K_n` and does **not** decrypt anything `K_n` encrypted. Decryption works because
  every payload records the **epoch it was sealed under** in its header, and every
  member holds a **set** of epoch keys `{K₀ … K_current}`. Reading = pick the key
  matching the blob's epoch.
- Consequences (exact, tested against in §8):
  - **Nothing is re-encrypted when membership changes.** The only cost is minting
    `K_{n+1}` and sealing it — O(members) tiny seals, milliseconds — never O(posts).
  - **Add member:** seal all absent epoch keys `K₀…K_current` to their `idEnc.pk`
    → full history (C06).
  - **Remove member:** don't hand them `K_{n+1}`. They already hold `K₀…K_n` —
    content from before their removal stays readable to them, forever, because keys
    once shared cannot be un-shared. We keep that honesty line in
    [`DESIGN.md#trust-model`](../DESIGN.md#trust-model): removal cuts the future,
    not the past.
- No MLS / ratchet trees (C04): at ≤1,000 members, flat re-wrap is fine.

## 4. Payload shape
```
Payload {
  id, authorId, type: 'post'|'story'|'comment'|'profile'|'event',
  audience,              // circle | close | public | group | letter
  epoch,                 // which epoch key sealed the payload (streams per §3.2)
  refId?,                // e.g. comment → postId
  ttl?,                  // stories
  payload,               // sealed: secretbox(K_epoch, plaintext)
                         // clear:   plaintext bytes (audience=public) — one
                         //         column, either way; `audience` says which
  sig                    // Ed25519 over the payload + header, by authorId
}
```
Server stores payloads opaquely, indexed by plaintext metadata (§7). It can route
and list; it cannot read sealed content.

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
- Sequenced letters (many recipients, future) stay **per-recipient sealing** — never
  a shared key, so reopening the group never re-shares it.
- Read state is its own **plaintext** per-recipient row
  (`letter_reads: letterId, recipientId, readAt`) — unread counts are a server-side
  indexed `COUNT(*)`. `who-read-when` is declared normal metadata (two-person
  stream); see §7 and C24.

## 7. Data model: sealed content, plaintext metadata (C24)

### 7.1 The rule
**Content or content-evocative → sealed in one `payload` column. Anything a
required query must filter, sort, route, or count on → a plaintext column.** Per
field, decided up front and listed in the trust model — never a search-enabled
encryption scheme.

Currently-declared plaintext metadata: `authorId`, timestamps (`createdAt`,
`updatedAt`, `releaseAt`), `audience`, `type`, `refId`, `epoch`, stream scope
(`circle`/`close` owner or `groupId`), `ttl`, roster/group-membership and
administrative roles (server-enforced, §6b), letters' sender/recipients/`readAt`,
story expiry.

Currently-declared sealed: everything inside `payload` (text, images, profiles,
comments). Content **search stays client-side** over fetched pages (Signal-style);
feed reads are server-side metadata queries returning N rows, client decrypts
those N payloads — never a full-library download.

**No searchable / order-preserving encryption, ever** (equality beacons, OPE/ORE,
MongoDB-style queryable encryption): documented leakage-reconstruction attacks
against them are practical and no vendor supports sorting on encrypted columns —
explicitly out of scope; do not reach for it when a new filter is requested. A new
filterable field is a *decision to expose metadata*, made explicitly in this list,
never silently.

### 7.2 Schema shape
- Typed tables (`posts`, `letters`, `stories`, `profiles`, …), each inheriting
  `id`, `createdAt`, `updatedAt` and carrying one nullable `payload` column plus
  its declared plaintext metadata columns. Public content = clear bytes in the
  same `payload` column (`audience: 'public'`), per §4.
- Per-recipient facts (letter reads, delivery receipts) are their own small
  plaintext tables, not columns on shared rows.
- The ciphertext column is crypto-agnostic: swapping the AEAD or key scheme never
  changes the schema. New filterable fields start plaintext (or as a fresh
  nullable column) and backfill on write.

## 7b. Stories & expiry
Stories are ordinary posts with `ttl`. At expiry the server **deletes the
payload** — deletion beats re-encryption with an unshared key, because anyone who
already read it has it anyway. Stated honesty line: a TTL protects the server
copy, not anyone's memory or screenshots. An author who wants an archive keeps a
private copy sealed to their own key before expiry (optional, client-side).

## 7c. Public mode
No circle key. `audience: 'public'`, `payload` holds cleartext. Unlimited
audience. Same shape, minimal special-casing (R-009).

## 7d. Groups (invite-only shared feed) — server-enforced membership (C25)
A group is a shared single-channel feed — the circle machinery pointed at a
`groupId` instead of a personal stream:
- **One shared symmetric group key, epoch chain exactly as §3.2.** Every member
  can *author* (posts, comments) and read existing content. Anyone already in the
  group may invite a new member (the server enforces this policy; see below).
- **Add member:** server records membership; clients (any member is sufficient to
  satisfy the invite policy) seal the current epoch key — and past epoch keys for
  full-history groups — to the newcomer's `idEnc.pk`.
- **Kick / leave:** the server revokes access at once (it knows the roster and
  refuses the ex-member's reads and writes on group payloads — E2EE protects
  content *from the server*; access control *is* the server's job). Cryptography
  catches up: members mint `K_{n+1}`, sealed to remaining members only, so saved
  group ciphertexts stop decrypting for the ex-member going forward. Same
  "future, not past" honesty line as §3.2: no old content is re-encrypted.
- **Rekey coordination is server-gated:** epoch-key distribution happens under
  server-enforced membership (the server will serve wrapped epoch keys only to
  current members), so there is no client-side enforcement machinery and no
  dependence on every member "adopting" the new epoch — the server cut-off applies
  from the moment of removal, the rekey just keeps old saved ciphertexts useless.
- **Stated limit:** a *current* member can always share the current epoch key with
  an ex-member out-of-band (paste the key, screenshot content). Unfixable and
  equivalent to screenshotting; log it as a trust limit, not a design problem.
- Group membership changes are signed events (`idSign` of the acting member) so
  clients can verify the *chain* of membership even though the server is the
  enforcement authority.

## 8. The properties the implementation MUST satisfy
These are the [negative tests](TESTING.md). If any can fail, the design
is broken:
1. A removed friend cannot open payloads with `epoch > removalEpoch` (circle or
   close) — and `K_{n+1}` does **not** decrypt anything sealed under `K_n`
   (fresh-per-epoch).
2. Given only stored ciphertext + public keys, the server cannot recover any
   sealed plaintext.
3. A non-friend (no epoch key) cannot open a circle/close payload; a non-member
   cannot open a group payload.
4. A modified `payload`/`sig` fails `secretbox_open` / signature verify, and a
   payload claiming epoch *n* without holding `K_n` fails to open.
5. A pigeon letter opens only with the recipient's `idEnc.sk`.
6. A public payload opens with **no key at all** (`audience: 'public'`); a close
   payload does not open with the circle key (and vice versa) — streams are
   independent.
7. A kicked group member cannot read group payloads sealed under epochs after
   their removal, even with saved ciphertext.
8. Every filterable field listed §7.1 is served as plaintext METADATA only; no
   query path (sort, search, count over content) exists that requires decrypted
   content.

## Open spec questions
- PAKE library choice (OPAQUE implementation maturity in TS) — R-001 spike.
- age vs raw `crypto_box_seal` for epoch-key distribution — both viable; pick in
  R-002.
- Group epoch-key generation when any member may invite (who mints `K_{n+1}`,
  how it's signed) — pin down before R-groupship.
