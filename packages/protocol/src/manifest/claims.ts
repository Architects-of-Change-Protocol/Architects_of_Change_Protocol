import { createHash } from 'node:crypto';

import { ClaimType, StandingStatus } from '../claims/claim-enums';
import type { CanonicalClaim } from '../claims/claim';
import type { CanonicalStanding } from '../claims/standing';
import type { CanonicalEvidenceId, CanonicalIssuer, CanonicalTimestamp } from '../claims/primitives';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import { canonicalizeJSON } from '../canonical';
import { generateSovereignKeyPair, signSovereignPayload, verifySovereignSignature } from './proof';
import type { SovereignKeyPair, SovereignProof, SovereignSigningKey } from './proof';

/**
 * OriginClaim — a `CanonicalClaim` recording where/how a SovereignAssetId's
 * subject is asserted to have originated. This is reuse, not a parallel
 * rights system: it is a `CanonicalClaim` with `type: ClaimType.Origin`
 * whose `subject` is the SovereignAssetId. A valid signature over this
 * claim proves the issuer made the assertion — it does not prove the
 * asserted origin is historically or legally true.
 */
export interface OriginClaim extends CanonicalClaim {
  readonly type: typeof ClaimType.Origin;
  readonly metadata: Readonly<{ assertedOrigin: string } & Record<string, unknown>>;
}

/**
 * Sub-kind of an AuthorityClaim, carried in `metadata.kind` rather than as
 * a new top-level `ClaimType` per role — keeps the core `ClaimType`
 * vocabulary generic (per-domain rights taxonomies, e.g. music roles,
 * belong to future domain profiles, not core Protocol).
 */
export const AuthorityClaimKind = {
  Authorship: 'Authorship',
  Rights: 'Rights',
  License: 'License',
  Custom: 'Custom',
} as const;
export type AuthorityClaimKind = (typeof AuthorityClaimKind)[keyof typeof AuthorityClaimKind];

/**
 * AuthorityClaim — a `CanonicalClaim` with `type: ClaimType.Authorship`
 * recording a declared authority/authorship/rights assertion over a
 * SovereignAssetId. Registering an asset (`registrant`) is never the same
 * fact as an AuthorityClaim, and neither ever establishes legal ownership
 * on its own — see `docs/architecture/sovereign-asset-core.md`.
 */
export interface AuthorityClaim extends CanonicalClaim {
  readonly type: typeof ClaimType.Authorship;
  readonly metadata: Readonly<{ kind: AuthorityClaimKind; statement: string } & Record<string, unknown>>;
}

export interface BuildOriginClaimInput {
  readonly id: string;
  readonly sovereignAssetId: SovereignAssetId;
  readonly issuer: CanonicalIssuer;
  readonly assertedOrigin: string;
  readonly assertedAt: CanonicalTimestamp;
  readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}

export function buildOriginClaim(input: BuildOriginClaimInput): OriginClaim {
  return {
    id: input.id,
    type: ClaimType.Origin,
    subject: input.sovereignAssetId,
    issuer: input.issuer,
    assertionRef: `${input.id}:assertion`,
    evidenceRefs: input.evidenceRefs ?? [],
    attestationRefs: [],
    issuedAt: input.assertedAt,
    metadata: { assertedOrigin: input.assertedOrigin },
  };
}

export interface BuildAuthorityClaimInput {
  readonly id: string;
  readonly sovereignAssetId: SovereignAssetId;
  readonly issuer: CanonicalIssuer;
  readonly kind: AuthorityClaimKind;
  readonly statement: string;
  readonly issuedAt: CanonicalTimestamp;
  readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}

export function buildAuthorityClaim(input: BuildAuthorityClaimInput): AuthorityClaim {
  return {
    id: input.id,
    type: ClaimType.Authorship,
    subject: input.sovereignAssetId,
    issuer: input.issuer,
    assertionRef: `${input.id}:assertion`,
    evidenceRefs: input.evidenceRefs ?? [],
    attestationRefs: [],
    issuedAt: input.issuedAt,
    metadata: { kind: input.kind, statement: input.statement },
  };
}

/**
 * A claim that matters to sovereignty must be cryptographically
 * attributable. `SignedClaim` wraps any `CanonicalClaim` (including
 * `OriginClaim`/`AuthorityClaim`) with a digest and an Ed25519 proof over
 * its `aoc-canonical-json/1` serialization — mutation after signing
 * invalidates verification.
 */
export interface SignedClaim<TClaim extends CanonicalClaim = CanonicalClaim> {
  readonly claim: TClaim;
  readonly digest: string;
  readonly proof: SovereignProof;
}

export function signClaim<TClaim extends CanonicalClaim>(
  claim: TClaim,
  privateKeyPem: string,
  signingKey: SovereignSigningKey,
  now?: Date,
): SignedClaim<TClaim> {
  const digest = createHash('sha256').update(canonicalizeJSON(claim)).digest('hex');
  const proof = signSovereignPayload(claim, privateKeyPem, signingKey, now);
  return { claim, digest, proof };
}

export interface SignedClaimVerificationResult {
  readonly valid: boolean;
  readonly reasons: readonly string[];
}

export function verifySignedClaim(signed: SignedClaim): SignedClaimVerificationResult {
  const reasons: string[] = [];

  const recomputedDigest = createHash('sha256').update(canonicalizeJSON(signed.claim)).digest('hex');
  if (recomputedDigest !== signed.digest) {
    reasons.push('CLAIM_DIGEST_MISMATCH');
  }

  if (!verifySovereignSignature(signed.claim, signed.proof)) {
    reasons.push('CLAIM_SIGNATURE_INVALID');
  }

  return { valid: reasons.length === 0, reasons };
}

/**
 * Marks a claim's standing as `Contested` without deleting or mutating the
 * claim itself. Both the original claim and this standing record remain
 * independently verifiable/resolvable — the Protocol records the dispute;
 * it does not adjudicate a winner.
 */
export interface ContestClaimInput {
  readonly id: string;
  readonly claimRef: string;
  readonly reason: string;
  readonly effectiveAt: CanonicalTimestamp;
}

export function contestClaim(input: ContestClaimInput): CanonicalStanding {
  return {
    id: input.id,
    claimRef: input.claimRef,
    status: StandingStatus.Contested,
    reason: input.reason,
    effectiveAt: input.effectiveAt,
  };
}

export type { SovereignKeyPair, SovereignSigningKey, SovereignProof };
export { generateSovereignKeyPair };
