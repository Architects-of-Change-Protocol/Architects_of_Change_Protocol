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
export declare const ContentDigestAlgorithm: {
    readonly Sha256: "sha256";
};
export type ContentDigestAlgorithm = (typeof ContentDigestAlgorithm)[keyof typeof ContentDigestAlgorithm];
export interface ContentIdentity {
    readonly algorithm: ContentDigestAlgorithm;
    readonly digest: string;
}
/**
 * contentDigest = sha256(raw content bytes). Nothing else. This must never
 * be confused with a manifest-metadata hash (legacy `content_hash` in
 * `content/types.ts` mixes in `manifest.storage`/`subject`/etc — that
 * legacy behavior is preserved unchanged for backwards compatibility, and
 * is not what this function computes).
 */
export declare function computeContentIdentity(bytes: Uint8Array): ContentIdentity;
export declare function isValidContentIdentity(value: unknown): value is ContentIdentity;
export declare function contentIdentitiesEqual(a: ContentIdentity, b: ContentIdentity): boolean;
/**
 * Verifies that `bytes` produce the exact content identity declared in
 * `expected`. Fails closed on an unsupported algorithm rather than
 * silently skipping the check.
 */
export declare function verifyContentIdentity(bytes: Uint8Array, expected: ContentIdentity): {
    valid: boolean;
    reason?: 'UNSUPPORTED_CONTENT_DIGEST_ALGORITHM' | 'CONTENT_DIGEST_MISMATCH';
};
/**
 * Stable map key for a ContentIdentity, used to detect exact-content
 * matches across otherwise-unrelated SovereignAssetIds. See
 * `SovereignAssetRegistry.findByContentDigest`.
 */
export declare function contentIdentityKey(identity: ContentIdentity): string;
//# sourceMappingURL=content-identity.d.ts.map