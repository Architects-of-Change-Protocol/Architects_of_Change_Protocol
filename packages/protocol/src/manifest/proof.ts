import { createHash, generateKeyPairSync, sign, verify } from 'node:crypto';

import { canonicalizeJSON, CANONICAL_JSON_PROFILE } from '../canonical';

/**
 * Ed25519 signing primitives native to `@aoc/protocol`.
 *
 * `@aoc/protocol` has zero runtime-package dependencies (see
 * `scripts/check-version-graph.mjs`'s `role === 'protocol'` rule and
 * `docs/release/RELEASE_CANDIDATE_READINESS.md`), so this module cannot
 * import `@aoc-runtime/crypto`'s `signPayload`/`verifyPayloadSignature`/
 * `GovernanceSignature` even though they are the existing production-real
 * Ed25519 implementation this slice was asked to "connect". Instead, this
 * module reimplements the *identical primitive pattern* natively:
 * Ed25519 sign/verify via Node's built-in `node:crypto` over the SHA-256
 * digest of the `aoc-canonical-json/1` serialization of the payload — the
 * exact same algorithm choices `crypto/engine.ts`'s `signPayload`/
 * `verifyPayloadSignature`/`stableHash` make, using the one authoritative
 * canonicalizer (now owned by `@aoc/protocol/canonical`, which
 * `crypto/canonicalize.ts` itself re-exports). No new cryptographic
 * algorithm is introduced. See
 * `docs/architecture/sovereign-asset-core.md` for the full rationale.
 */

export interface SovereignSigningKey {
  readonly keyId: string;
  readonly algorithm: 'ed25519';
  readonly publicKey: string;
}

export interface SovereignKeyPair {
  readonly signingKey: SovereignSigningKey;
  readonly privateKeyPem: string;
}

export interface SovereignProof {
  readonly algorithm: 'ed25519';
  readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;
  readonly keyId: string;
  readonly publicKey: string;
  readonly signature: string;
  readonly signedAt: string;
  readonly payloadHash: string;
}

function digestCanonicalPayload(payload: unknown): string {
  return createHash('sha256').update(canonicalizeJSON(payload)).digest('hex');
}

/**
 * Generates a fresh Ed25519 key pair for signing sovereign manifests/claims.
 * Test/fixture callers should label their generated keys clearly; production
 * composition must source real keys from its own key-management
 * infrastructure rather than silently falling back to a generated or
 * hard-coded test key.
 */
export function generateSovereignKeyPair(): SovereignKeyPair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const keyId = createHash('sha256').update(publicKeyPem).digest('hex');

  return {
    signingKey: { keyId, algorithm: 'ed25519', publicKey: publicKeyPem },
    privateKeyPem,
  };
}

/**
 * Signs `payload` (any canonicalizable value) and returns a portable proof.
 * The signature covers the SHA-256 digest of the payload's
 * `aoc-canonical-json/1` serialization — any later mutation of the payload,
 * however small, changes `payloadHash` and invalidates the signature.
 */
export function signSovereignPayload(
  payload: unknown,
  privateKeyPem: string,
  signingKey: SovereignSigningKey,
  now: Date = new Date(),
): SovereignProof {
  const payloadHash = digestCanonicalPayload(payload);
  const signatureBytes = sign(null, Buffer.from(payloadHash, 'hex'), privateKeyPem);

  return {
    algorithm: 'ed25519',
    canonicalizationProfile: CANONICAL_JSON_PROFILE,
    keyId: signingKey.keyId,
    publicKey: signingKey.publicKey,
    signature: signatureBytes.toString('base64url'),
    signedAt: now.toISOString(),
    payloadHash,
  };
}

/**
 * Recomputes the payload digest and verifies the Ed25519 signature over it.
 * Returns `false` (fail closed) for any unsupported algorithm/profile,
 * digest mismatch, or cryptographic verification failure — including
 * malformed signature/key material that throws inside Node's `verify()`.
 */
export function verifySovereignSignature(payload: unknown, proof: SovereignProof): boolean {
  if (proof.algorithm !== 'ed25519') {
    return false;
  }
  if (proof.canonicalizationProfile !== CANONICAL_JSON_PROFILE) {
    return false;
  }

  const payloadHash = digestCanonicalPayload(payload);
  if (payloadHash !== proof.payloadHash) {
    return false;
  }

  try {
    return verify(null, Buffer.from(payloadHash, 'hex'), proof.publicKey, Buffer.from(proof.signature, 'base64url'));
  } catch {
    return false;
  }
}
