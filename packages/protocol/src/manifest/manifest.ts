import { createHash } from 'node:crypto';

import { CANONICAL_JSON_PROFILE, canonicalizeJSON } from '../canonical';
import { isValidContentIdentity } from '../identity/content-identity';
import type { ContentIdentity } from '../identity/content-identity';
import { isValidSovereignAssetId } from '../identity/sovereign-asset-id';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import type { CanonicalPrincipalRef } from '../claims/references';
import { isValidSovereignAssetState, SovereignAssetState } from './state';
import type { AuthorityClaim, OriginClaim } from './claims';
import { generateSovereignKeyPair, signSovereignPayload } from './proof';
import type { SovereignProof, SovereignSigningKey } from './proof';

export const SOVEREIGN_MANIFEST_SCHEMA_VERSION = 'aoc-sovereign-manifest/1' as const;
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
export function validateSovereignManifestV1(manifest: SovereignManifestV1): ManifestValidationResult {
  const reasons: string[] = [];

  if (manifest.schemaVersion !== SOVEREIGN_MANIFEST_SCHEMA_VERSION) {
    reasons.push('UNSUPPORTED_SCHEMA_VERSION');
  }

  if (manifest.canonicalizationProfile !== CANONICAL_JSON_PROFILE) {
    reasons.push('UNSUPPORTED_CANONICALIZATION_PROFILE');
  }

  if (!isValidSovereignAssetId(manifest.sovereignAssetId)) {
    reasons.push('INVALID_SOVEREIGN_ASSET_ID');
  }

  if (!Number.isInteger(manifest.manifestVersion) || manifest.manifestVersion < 1) {
    reasons.push('INVALID_MANIFEST_VERSION');
  }

  if (!isValidContentIdentity(manifest.contentIdentity)) {
    reasons.push('INVALID_CONTENT_IDENTITY');
  }

  if (!isValidSovereignAssetState(manifest.state)) {
    reasons.push('INVALID_STATE');
  }

  if (typeof manifest.createdAt !== 'string' || Number.isNaN(Date.parse(manifest.createdAt))) {
    reasons.push('INVALID_TIMESTAMP');
  }

  if (manifest.originClaim && manifest.originClaim.subject !== manifest.sovereignAssetId) {
    reasons.push('ORIGIN_CLAIM_SUBJECT_MISMATCH');
  }

  for (const claim of manifest.authorityClaims) {
    if (claim.subject !== manifest.sovereignAssetId) {
      reasons.push('AUTHORITY_CLAIM_SUBJECT_MISMATCH');
      break;
    }
  }

  return { valid: reasons.length === 0, reasons };
}

/**
 * Builds and validates a v1 sovereign manifest. Throws if the resulting
 * manifest fails `validateSovereignManifestV1` — this is a construction
 * helper, not a lenient/partial builder.
 */
export function buildSovereignManifestV1(
  input: BuildSovereignManifestV1Input,
  now: Date = new Date(),
): SovereignManifestV1 {
  const manifest: SovereignManifestV1 = {
    schemaVersion: SOVEREIGN_MANIFEST_SCHEMA_VERSION,
    canonicalizationProfile: CANONICAL_JSON_PROFILE,
    sovereignAssetId: input.sovereignAssetId,
    manifestVersion: input.manifestVersion ?? 1,
    contentIdentity: input.contentIdentity,
    registrant: input.registrant,
    ...(input.originClaim ? { originClaim: input.originClaim } : {}),
    authorityClaims: input.authorityClaims ?? [],
    state: input.state ?? SovereignAssetState.Active,
    createdAt: input.createdAt ?? now.toISOString(),
  };

  const validation = validateSovereignManifestV1(manifest);
  if (!validation.valid) {
    throw new Error(`Invalid SovereignManifestV1: ${validation.reasons.join(', ')}`);
  }

  return manifest;
}

/**
 * manifestDigest = sha256(canonicalize(manifest)) under `aoc-canonical-
 * json/1`. Computed independently of the Ed25519 proof's own internal
 * `payloadHash` so callers can cross-check both agree (see
 * `verifySovereignManifest`).
 */
export function computeManifestDigest(manifest: SovereignManifestV1): string {
  return createHash('sha256').update(canonicalizeJSON(manifest)).digest('hex');
}

/**
 * Signs a manifest: canonicalize -> manifestDigest -> Ed25519 sign.
 * Throws if the manifest does not pass `validateSovereignManifestV1`.
 */
export function signSovereignManifest(
  manifest: SovereignManifestV1,
  privateKeyPem: string,
  signingKey: SovereignSigningKey,
  now: Date = new Date(),
): SignedSovereignManifest {
  const validation = validateSovereignManifestV1(manifest);
  if (!validation.valid) {
    throw new Error(`Cannot sign invalid SovereignManifestV1: ${validation.reasons.join(', ')}`);
  }

  const manifestDigest = computeManifestDigest(manifest);
  const proof = signSovereignPayload(manifest, privateKeyPem, signingKey, now);

  return { manifest, manifestDigest, proof };
}

export { generateSovereignKeyPair };
