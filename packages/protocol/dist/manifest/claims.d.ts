import { ClaimType } from '../claims/claim-enums';
import type { CanonicalClaim } from '../claims/claim';
import type { CanonicalStanding } from '../claims/standing';
import type { CanonicalClaimId, CanonicalEvidenceId, CanonicalIssuer, CanonicalTimestamp } from '../claims/primitives';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import { generateSovereignKeyPair } from './proof';
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
    readonly metadata: Readonly<{
        assertedOrigin: string;
    } & Record<string, unknown>>;
}
/**
 * Sub-kind of an AuthorityClaim, carried in `metadata.kind` rather than as
 * a new top-level `ClaimType` per role — keeps the core `ClaimType`
 * vocabulary generic (per-domain rights taxonomies, e.g. music roles,
 * belong to future domain profiles, not core Protocol).
 */
export declare const AuthorityClaimKind: {
    readonly Authorship: "Authorship";
    readonly Rights: "Rights";
    readonly License: "License";
    readonly Custom: "Custom";
};
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
    readonly metadata: Readonly<{
        kind: AuthorityClaimKind;
        statement: string;
    } & Record<string, unknown>>;
}
export interface BuildOriginClaimInput {
    readonly id: string;
    readonly sovereignAssetId: SovereignAssetId;
    readonly issuer: CanonicalIssuer;
    readonly assertedOrigin: string;
    readonly assertedAt: CanonicalTimestamp;
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
export declare function buildOriginClaim(input: BuildOriginClaimInput): OriginClaim;
export interface BuildAuthorityClaimInput {
    readonly id: string;
    readonly sovereignAssetId: SovereignAssetId;
    readonly issuer: CanonicalIssuer;
    readonly kind: AuthorityClaimKind;
    readonly statement: string;
    readonly issuedAt: CanonicalTimestamp;
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
export declare function buildAuthorityClaim(input: BuildAuthorityClaimInput): AuthorityClaim;
/**
 * How a child sovereign subject is asserted to relate to the sources it came
 * from. Carried in `metadata.relation` rather than as a per-relationship
 * `ClaimType`, for the same reason `AuthorityClaimKind` is: the core
 * `ClaimType` vocabulary stays generic, and per-domain derivation taxonomies
 * (a music stem, a model fine-tune, a legal redaction) belong to future
 * domain profiles rather than to core Protocol.
 *
 * Deliberately generic and deliberately non-judgmental. There is no
 * `PlagiarizedFrom`, `Infringes`, `AuthorizedDerivative` or `IllegalCopy`:
 * those are legal or factual conclusions, and Protocol records asserted
 * relationships rather than adjudicating them. A derivation relation says
 * nothing about whether the derivation was permitted.
 */
export declare const DerivationRelationKind: {
    /** The child is asserted to come from the sources, unspecified how. */
    readonly DerivedFrom: "DerivedFrom";
    /** The child is asserted to be the result of transforming the sources. */
    readonly TransformedFrom: "TransformedFrom";
    /** The child is asserted to compose or merge several sources. */
    readonly CombinedFrom: "CombinedFrom";
    /** The child is asserted to be a part taken out of the sources. */
    readonly ExtractedFrom: "ExtractedFrom";
    /** The child is asserted to have been produced from the sources by some process. */
    readonly GeneratedFrom: "GeneratedFrom";
    /** An issuer-specific relation; `statement` carries what it means. */
    readonly Custom: "Custom";
};
export type DerivationRelationKind = (typeof DerivationRelationKind)[keyof typeof DerivationRelationKind];
/** Every canonical relation, in a stable order, for validation and discovery. */
export declare const DERIVATION_RELATION_KINDS: readonly DerivationRelationKind[];
/**
 * DerivationClaim — a `CanonicalClaim` with `type: ClaimType.Derivation`
 * recording that its subject is asserted to derive from one or more *other*
 * sovereign subjects.
 *
 *     metadata.sourceSovereignAssetIds        claim.subject
 *          A ──┐
 *              ├────────── relation ────────────► C
 *          B ──┘
 *
 * `subject` is the **child**; the parents/sources are in the metadata. That
 * direction is what lets a subject carry zero, one or many derivation
 * assertions — from one issuer, or from several who disagree — with none of
 * them being an identity field. `SovereignManifestV1` deliberately has no
 * `parentId`: a single manifest field would force a tree, make multi-parent
 * composition inexpressible, turn a contestable assertion into identity, and
 * conflate manifest evolution (the same subject at version 2) with asset
 * derivation (a different subject made from this one).
 *
 * ## Why the edges are SovereignAssetIds
 *
 * Sources are named by `SovereignAssetId` and never by an
 * `externalReference.id`, a locator, a URL, a CID, a `ContentIdentity`, a
 * `manifestDigest` or a provider id. Lineage has to survive provider
 * migration, locator changes and re-encoding: `A → C` must stay true after A
 * moves to another provider or its bytes change. Lineage identity is
 * therefore *subject* identity, never location or representation. A source
 * that has no `SovereignAssetId` yet is given one through AOC.IDENTITY
 * first — Protocol grows no second, weaker kind of ancestor.
 *
 * ## What it does not mean
 *
 * A derivation assertion is not historical truth, not legal authorization,
 * not a licence, and not proof the issuer had any right to derive. Nothing is
 * inherited along the edge: not licences, rights, obligations, authority,
 * authorship, governance policy or evidence. It also implies nothing about
 * bytes in either direction — a derived child normally has a *different*
 * `ContentIdentity`, and two subjects with the same `ContentIdentity` are not
 * thereby related. A valid signature over this claim would prove the issuer
 * asserted it, never that it happened.
 */
export interface DerivationClaim extends CanonicalClaim {
    readonly type: typeof ClaimType.Derivation;
    readonly metadata: Readonly<{
        /** The asserted parents/sources. At least one, no duplicates, never the child. */
        readonly sourceSovereignAssetIds: readonly SovereignAssetId[];
        readonly relation: DerivationRelationKind;
        /** Optional free-text characterization of the transformation. Data, never executed. */
        readonly statement?: string;
        /**
         * Optional: when the issuer asserts the derivation *itself* happened.
         * Distinct from `issuedAt`, which is when this claim was recorded — a
         * 2026 claim about a 2019 transformation is an ordinary case, and
         * collapsing the two would silently invent history. Still an asserted
         * value: Protocol does not establish that it is true.
         */
        readonly occurredAt?: CanonicalTimestamp;
    } & Record<string, unknown>>;
}
export interface BuildDerivationClaimInput {
    readonly id: CanonicalClaimId;
    /** The child — the subject asserted to derive from the sources. */
    readonly sovereignAssetId: SovereignAssetId;
    readonly issuer: CanonicalIssuer;
    readonly sourceSovereignAssetIds: readonly SovereignAssetId[];
    readonly relation: DerivationRelationKind;
    readonly statement?: string;
    readonly occurredAt?: CanonicalTimestamp;
    readonly issuedAt: CanonicalTimestamp;
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
export interface ClaimValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly string[];
}
/**
 * Structural validation for an `OriginClaim`.
 *
 * `assertedOrigin` is validated as a non-blank string and nothing more: it is
 * an *assertion value*, so a value that looks like a URL is never parsed,
 * resolved or dereferenced, and an origin nobody has a syntax for stays
 * expressible.
 */
export declare function validateOriginClaim(value: unknown): ClaimValidationResult;
export declare function isValidOriginClaim(value: unknown): value is OriginClaim;
/** Structural validation for an `AuthorityClaim`, including its `metadata.kind` sub-kind. */
export declare function validateAuthorityClaim(value: unknown): ClaimValidationResult;
export declare function isValidAuthorityClaim(value: unknown): value is AuthorityClaim;
/**
 * Structural validation for a `DerivationClaim`.
 *
 * Every rule here is local and offline: no network, no provider, no registry,
 * no resolution of a source id to an actual registered subject. It confirms
 * that the *assertion* is well formed, never that it is true.
 *
 * The source list must be non-empty (an assertion of derivation from nothing
 * is not an assertion), free of duplicates by exact sovereign identity, and
 * must not contain the child. Duplicates are reported rather than silently
 * collapsed: a caller that sent `[A, A, B]` made a mistake worth surfacing,
 * and quietly rewriting a caller's assertion is not Protocol's job.
 *
 * Direct self-derivation (`A → A`) is rejected because no reading of it is
 * meaningful. That is the *only* cycle claim this function makes: a single
 * claim cannot establish that a wider lineage graph is acyclic, because the
 * rest of the graph is not in front of it. Cycles across several claims are a
 * finding of `traceSovereignLineage` over a supplied dataset, not something
 * this validator can or does rule out.
 */
export declare function validateDerivationClaim(value: unknown): ClaimValidationResult;
export declare function isValidDerivationClaim(value: unknown): value is DerivationClaim;
/**
 * Builds a canonical `DerivationClaim`, reusing the same `CanonicalClaim`
 * shape as `buildOriginClaim`/`buildAuthorityClaim` rather than introducing a
 * parallel lineage object model.
 *
 * Throws on a malformed assertion rather than repairing it — a construction
 * helper, not a lenient parser, matching `buildSovereignExternalReference`.
 * The caller's `sourceSovereignAssetIds` array is copied, never sorted,
 * deduplicated or frozen in place: the assertion that reaches the claim is
 * exactly the one the issuer made, and the caller's own array is left alone.
 * Absent optionals are omitted structurally, never emitted as `undefined`,
 * so the claim stays canonicalizable under `aoc-canonical-json/1`.
 */
export declare function buildDerivationClaim(input: BuildDerivationClaimInput): DerivationClaim;
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
export declare function signClaim<TClaim extends CanonicalClaim>(claim: TClaim, privateKeyPem: string, signingKey: SovereignSigningKey, now?: Date): SignedClaim<TClaim>;
export interface SignedClaimVerificationResult {
    readonly valid: boolean;
    readonly reasons: readonly string[];
}
export declare function verifySignedClaim(signed: SignedClaim): SignedClaimVerificationResult;
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
export declare function contestClaim(input: ContestClaimInput): CanonicalStanding;
export type { SovereignKeyPair, SovereignSigningKey, SovereignProof };
export { generateSovereignKeyPair };
//# sourceMappingURL=claims.d.ts.map