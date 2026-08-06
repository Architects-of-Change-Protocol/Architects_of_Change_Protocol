import { CANONICAL_JSON_PROFILE } from '../canonical';
import type { ContentIdentity } from '../identity/content-identity';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import type { CanonicalPrincipalRef } from '../claims/references';
import { SovereignAssetState } from './state';
import type { AuthorityClaim, OriginClaim } from './claims';
import { generateSovereignKeyPair } from './proof';
import type { SovereignProof, SovereignSigningKey } from './proof';
export declare const SOVEREIGN_MANIFEST_SCHEMA_VERSION: "aoc-sovereign-manifest/1";
export type SovereignManifestSchemaVersion = typeof SOVEREIGN_MANIFEST_SCHEMA_VERSION;
/**
 * A "registrant" records who submitted the asset for registration. It is
 * deliberately not named `owner`/`legalOwner` — registration is a
 * verifiable fact about who acted, never an assertion of legal ownership.
 * See `AuthorityClaim` for declared (and disputable) authority assertions.
 */
export type SovereignRegistrant = string | CanonicalPrincipalRef;
/**
 * SovereignManifestV1 — the canonical, unsigned sovereign record for a
 * Sovereign Digital Asset. See `docs/architecture/sovereign-asset-core.md`
 * for the full invariant this type encodes:
 *
 *   SovereignAssetId  = persistent asset identity (never derived from
 *                       content/manifest/storage)
 *   ContentIdentity   = identity/integrity of content bytes
 *   manifestDigest    = integrity identity of this manifest (computed by
 *                       `signSovereignManifest`, not stored inside it)
 *   StoragePointer    = where bytes currently live (deliberately absent
 *                       from this type — storage bindings are operational
 *                       metadata tracked outside the sovereign core)
 *
 * `manifestVersion` is a real, validated field in v1 but this slice does
 * not implement the supersession/history chain those versions will one
 * day link into — see `docs/architecture/sovereign-asset-core.md` §
 * "Versioning and lineage (out of scope, not precluded)".
 */
export interface SovereignManifestV1 {
    readonly schemaVersion: SovereignManifestSchemaVersion;
    readonly canonicalizationProfile: typeof CANONICAL_JSON_PROFILE;
    readonly sovereignAssetId: SovereignAssetId;
    readonly manifestVersion: number;
    readonly contentIdentity: ContentIdentity;
    readonly registrant: SovereignRegistrant;
    readonly originClaim?: OriginClaim;
    readonly authorityClaims: readonly AuthorityClaim[];
    readonly state: SovereignAssetState;
    readonly createdAt: string;
}
export interface SignedSovereignManifest {
    readonly manifest: SovereignManifestV1;
    readonly manifestDigest: string;
    readonly proof: SovereignProof;
}
export interface BuildSovereignManifestV1Input {
    readonly sovereignAssetId: SovereignAssetId;
    readonly contentIdentity: ContentIdentity;
    readonly registrant: SovereignRegistrant;
    readonly manifestVersion?: number;
    readonly originClaim?: OriginClaim;
    readonly authorityClaims?: readonly AuthorityClaim[];
    readonly state?: SovereignAssetState;
    readonly createdAt?: string;
}
export interface ManifestValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly string[];
}
/**
 * Structural + cross-field validation for a `SovereignManifestV1`. This is
 * used both when building a new manifest and when verifying a resolved
 * one — it fails closed (reports a reason) rather than silently accepting
 * malformed input.
 */
export declare function validateSovereignManifestV1(manifest: SovereignManifestV1): ManifestValidationResult;
/**
 * Builds and validates a v1 sovereign manifest. Throws if the resulting
 * manifest fails `validateSovereignManifestV1` — this is a construction
 * helper, not a lenient/partial builder.
 */
export declare function buildSovereignManifestV1(input: BuildSovereignManifestV1Input, now?: Date): SovereignManifestV1;
/**
 * manifestDigest = sha256(canonicalize(manifest)) under `aoc-canonical-
 * json/1`. Computed independently of the Ed25519 proof's own internal
 * `payloadHash` so callers can cross-check both agree (see
 * `verifySovereignManifest`).
 */
export declare function computeManifestDigest(manifest: SovereignManifestV1): string;
/**
 * Signs a manifest: canonicalize -> manifestDigest -> Ed25519 sign.
 * Throws if the manifest does not pass `validateSovereignManifestV1`.
 */
export declare function signSovereignManifest(manifest: SovereignManifestV1, privateKeyPem: string, signingKey: SovereignSigningKey, now?: Date): SignedSovereignManifest;
export { generateSovereignKeyPair };
//# sourceMappingURL=manifest.d.ts.map