"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentDigestAlgorithm = void 0;
exports.computeContentIdentity = computeContentIdentity;
exports.isValidContentIdentity = isValidContentIdentity;
exports.contentIdentitiesEqual = contentIdentitiesEqual;
exports.verifyContentIdentity = verifyContentIdentity;
exports.contentIdentityKey = contentIdentityKey;
const node_crypto_1 = require("node:crypto");
/**
 * ContentIdentity — the identity/integrity of exact content bytes,
 * independent of `SovereignAssetId`, `manifestDigest`, and
 * `StoragePointer`. See `docs/architecture/sovereign-asset-core.md`.
 *
 * v1 scope: exact byte identity only. Re-encoding, transcoding, or any
 * perceptual/fingerprint-based recognition of "the same work" is
 * explicitly out of scope for this slice — same bytes always produce the
 * same digest, but a re-encoded copy of otherwise-identical content will
 * legitimately produce a different one. That is expected, not a defect.
 */
exports.ContentDigestAlgorithm = {
    Sha256: 'sha256',
};
const DIGEST_HEX_PATTERNS = {
    [exports.ContentDigestAlgorithm.Sha256]: /^[0-9a-f]{64}$/,
};
/**
 * contentDigest = sha256(raw content bytes). Nothing else. This must never
 * be confused with a manifest-metadata hash (legacy `content_hash` in
 * `content/types.ts` mixes in `manifest.storage`/`subject`/etc — that
 * legacy behavior is preserved unchanged for backwards compatibility, and
 * is not what this function computes).
 */
function computeContentIdentity(bytes) {
    return {
        algorithm: exports.ContentDigestAlgorithm.Sha256,
        digest: (0, node_crypto_1.createHash)('sha256').update(bytes).digest('hex'),
    };
}
function isValidContentIdentity(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value;
    if (typeof candidate.algorithm !== 'string' || typeof candidate.digest !== 'string') {
        return false;
    }
    const pattern = DIGEST_HEX_PATTERNS[candidate.algorithm];
    if (!pattern) {
        return false;
    }
    return pattern.test(candidate.digest);
}
function contentIdentitiesEqual(a, b) {
    return a.algorithm === b.algorithm && a.digest === b.digest;
}
/**
 * Verifies that `bytes` produce the exact content identity declared in
 * `expected`. Fails closed on an unsupported algorithm rather than
 * silently skipping the check.
 */
function verifyContentIdentity(bytes, expected) {
    if (expected.algorithm !== exports.ContentDigestAlgorithm.Sha256) {
        return { valid: false, reason: 'UNSUPPORTED_CONTENT_DIGEST_ALGORITHM' };
    }
    const actual = computeContentIdentity(bytes);
    if (actual.digest !== expected.digest) {
        return { valid: false, reason: 'CONTENT_DIGEST_MISMATCH' };
    }
    return { valid: true };
}
/**
 * Stable map key for a ContentIdentity, used to detect exact-content
 * matches across otherwise-unrelated SovereignAssetIds. See
 * `SovereignAssetRegistry.findByContentDigest`.
 */
function contentIdentityKey(identity) {
    return `${identity.algorithm}:${identity.digest}`;
}
