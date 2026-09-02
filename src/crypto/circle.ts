/**
 * Circle crypto — the thin, critical glue over vetted primitives.
 *
 * We NEVER hand-roll cryptography: the actual algorithms come from
 * `libsodium-wrappers` and `age-encryption`. This module only arranges them into
 * pigeonpost's circle model (see docs/plans/CRYPTO-SPEC.md).
 *
 * Skeleton only — the real implementation lands in R-002, alongside the five
 * negative tests in ./__tests__/negative.test.ts. Every export here is specified
 * in CRYPTO-SPEC.md §1–§5.
 */

export type Ed25519PublicKey = Uint8Array;
export type X25519PublicKey = Uint8Array;

export interface KeyPair {
  readonly publicKey: Uint8Array;
  readonly secretKey: Uint8Array;
}

export interface Identity {
  /** Ed25519 — long-term authorship (signs blobs). */
  readonly sign: KeyPair;
  /** X25519 — receives wrapped circle keys and pigeon letters. */
  readonly enc: KeyPair;
}

/** A symmetric circle key at a given epoch. Advances on every membership change. */
export interface CircleKey {
  readonly epoch: number;
  readonly key: Uint8Array;
}

export type BlobType = 'post' | 'story' | 'comment' | 'profile' | 'event';

export interface EncryptedBlob {
  readonly id: string;
  readonly authorId: string;
  readonly type: BlobType;
  readonly epoch: number;
  readonly refId?: string;
  readonly ttl?: number;
  readonly ciphertext: Uint8Array;
  readonly sig: Uint8Array;
}

const NOT_IMPLEMENTED = 'not implemented until R-002 (see docs/plans/CRYPTO-SPEC.md)';

/** Generate a fresh anonymous identity (Ed25519 + X25519). CRYPTO-SPEC §1. */
export function generateIdentity(): Promise<Identity> {
  throw new Error(NOT_IMPLEMENTED);
}

/** Mint the first circle key (epoch 0). CRYPTO-SPEC §3. */
export function createCircleKey(): Promise<CircleKey> {
  throw new Error(NOT_IMPLEMENTED);
}

/** Seal a circle key to a friend's X25519 public key (crypto_box_seal). CRYPTO-SPEC §3. */
export function wrapCircleKeyFor(
  _friendEncPk: X25519PublicKey,
  _circleKey: CircleKey,
): Promise<Uint8Array> {
  throw new Error(NOT_IMPLEMENTED);
}

/** Encrypt + sign a blob under the current circle key. CRYPTO-SPEC §5 (publish). */
export function encryptBlob(
  _plaintext: Uint8Array,
  _type: BlobType,
  _circleKey: CircleKey,
  _authorSign: KeyPair,
): Promise<EncryptedBlob> {
  throw new Error(NOT_IMPLEMENTED);
}

/** Verify signature, then open with the matching epoch key. CRYPTO-SPEC §5 (read). */
export function decryptBlob(
  _blob: EncryptedBlob,
  _authorSignPk: Ed25519PublicKey,
  _epochKeys: ReadonlyMap<number, Uint8Array>,
): Promise<Uint8Array> {
  throw new Error(NOT_IMPLEMENTED);
}

/** Advance to a new epoch key on member removal. CRYPTO-SPEC §5 (remove). */
export function rotateCircleKey(_current: CircleKey): Promise<CircleKey> {
  throw new Error(NOT_IMPLEMENTED);
}
