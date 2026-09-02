import { describe, it, expect } from 'vitest';
import * as circle from '../circle';

/**
 * The crypto core's real test suite is the NEGATIVE properties — the security
 * claims, not the happy path. See docs/reference/TESTING.md and CRYPTO-SPEC.md §8.
 *
 * They are `it.todo` until the core is implemented in R-002, at which point each
 * becomes a real assertion IN THE SAME COMMIT as the code it guards.
 */

describe('crypto core — sanity', () => {
  it('module loads and exposes the specced surface', () => {
    expect(typeof circle.generateIdentity).toBe('function');
    expect(typeof circle.encryptBlob).toBe('function');
    expect(typeof circle.rotateCircleKey).toBe('function');
  });

  it('stubs refuse to run until implemented (no accidental no-op crypto)', () => {
    expect(() => circle.createCircleKey()).toThrow(/not implemented/);
  });
});

describe('crypto core — the five negative properties (todo until R-002)', () => {
  it.todo('1. a removed friend cannot decrypt blobs at an epoch after their removal');
  it.todo('2. the server (ciphertext + public keys only) cannot recover any plaintext');
  it.todo('3. a non-friend with no epoch key cannot open a circle blob');
  it.todo('4. a tampered ciphertext or signature is rejected');
  it.todo('5. a pigeon letter opens only with the recipient key — not the server, before or after release');
});
