import type { CanonicalSemanticRef } from '../claims/vocabulary';
import type { CanonicalClaimId, CanonicalEvidenceId, CanonicalIssuer, CanonicalTimestamp } from '../claims/primitives';
import type { SovereignAssetId } from '../identity/sovereign-asset-id';
import { AuthorityClaimKind, type AuthorityClaim } from '../manifest/claims';
import { type LicensingTermsValidationResult } from './reason-codes';
import { type SovereignLicenseActionRef, type SovereignLicenseTermsAudience, type SovereignLicenseTermsRuleV1, type SovereignLicenseTermsV1 } from './terms';
/**
 * `LicenseTermsClaim` — a **specialized `AuthorityClaim`**, not a new claim
 * family.
 *
 * ## Why it reuses AuthorityClaim
 *
 * The claim architecture already had the right primitive.
 * `AuthorityClaimKind.License` has existed since the manifest layer was
 * written, and SM-05 deliberately left it outside the formal Provenance capsule
 * precisely so this mineral could own it. SM-09 therefore adds no
 * `ClaimType.License`, no `LicenseClaimBase`, `TermsClaimBase`,
 * `PermissionClaimBase` or `RestrictionClaimBase`, and forks no
 * `CanonicalClaim`. What was genuinely missing was *structure*: a generic
 * `AuthorityClaim` requires only a free-text `statement`, which is not enough
 * for a production Licensing & Terms capability. `metadata.terms` is that
 * missing structure.
 *
 * ## Why not ClaimType.Authorization
 *
 * `ClaimType.Authorization` means something close to *"principal P is
 * authorized to perform action A"* — the output of a decision about a
 * particular actor. A licensing declaration means *"issuer I declares these
 * permissions, restrictions and obligations over subject X"*. The first is a
 * conclusion; the second is a premise somebody else may later reason from.
 * Collapsing them would make every stored declaration read as an authorization
 * result, which is the single most consequential mistake this mineral could
 * make.
 *
 * ## What a LicenseTermsClaim means
 *
 *     "Issuer I declared these terms over subject X."
 *
 * and nothing further. It does **not** mean the issuer owns the copyright,
 * holds title, had authority to grant anything, or that the terms are
 * enforceable in any jurisdiction. A valid signature over one proves the issuer
 * made the declaration, never that the declaration is legally sound.
 *
 * ## `type` stays `Authorship`
 *
 * The claim's `ClaimType` remains the existing `Authorship` family, whose
 * semantic sub-kinds are `Authorship`, `Rights`, `License` and `Custom`. SM-09
 * performs no legacy claim-model convergence: the licensing specificity comes
 * from `metadata.kind === License`, `metadata.terms` and the claim's
 * `semanticRefs`, which is exactly what the sub-kind mechanism exists for.
 */
export interface LicenseTermsClaim extends AuthorityClaim {
    readonly metadata: Readonly<{
        readonly kind: typeof AuthorityClaimKind.License;
        readonly statement: string;
        readonly terms: SovereignLicenseTermsV1;
    } & Record<string, unknown>>;
    /** Always present on a claim this module builds; see `buildLicenseTermsSemanticRefs`. */
    readonly semanticRefs: readonly CanonicalSemanticRef[];
}
export interface BuildLicenseTermsClaimInput {
    readonly id: CanonicalClaimId;
    readonly sovereignAssetId: SovereignAssetId;
    readonly issuer: CanonicalIssuer;
    readonly statement: string;
    readonly audience: SovereignLicenseTermsAudience;
    readonly rules: readonly SovereignLicenseTermsRuleV1[];
    /** When the claim was asserted/recorded. Distinct from `effectiveAt`. */
    readonly issuedAt: CanonicalTimestamp;
    /** When the issuer says the terms begin applying. Never defaulted from `issuedAt`. */
    readonly effectiveAt?: CanonicalTimestamp;
    /**
     * When the declaration stops applying, stored in the existing
     * `CanonicalClaim.expiresAt`. There is deliberately no second expiration
     * field inside the terms document.
     */
    readonly expiresAt?: CanonicalTimestamp;
    /**
     * Real, caller-owned canonical evidence references, preserved verbatim — a
     * signed contract, a licence instrument, a written consent, a registry
     * record. Nothing is ever fabricated here and nothing is resolved: a
     * reference is not proof that its target exists, let alone that it says what
     * the terms say. The full legal instrument lives behind one of these; the
     * structured rules are the machine-readable skeleton beside it, never a
     * replacement for it.
     */
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
/**
 * The semantic concepts a terms document requires a consumer to understand, as
 * `(namespace, termRef)` concept pairs in canonical order:
 *
 *   1. `aoc.licensing:license-terms-declaration` — always
 *   2. the permission concept, if any clause declares one
 *   3. the restriction concept, if any clause declares one
 *   4. the obligation concept, if any clause declares one
 *   5. every distinct action concept, sorted by namespace then term
 *
 * Deduplicated by concept identity: three `CommercialUse` clauses impose one
 * requirement, not three. Deterministic by construction — the same document
 * always yields the same list, in the same order, with no clock, no counter and
 * no random value anywhere in it.
 *
 * The *rules themselves* are never reordered by any of this. Ordering a derived
 * concept list is canonicalization of a derived artifact; reordering a caller's
 * authored clauses would be rewriting their declaration.
 */
export declare function licenseTermsSemanticConcepts(terms: SovereignLicenseTermsV1): readonly SovereignLicenseActionRef[];
/**
 * The claim-level `CanonicalSemanticRef`s a licensing declaration carries.
 *
 * ## Why they matter
 *
 * They are what lets the **unchanged** SM-07 Interoperability machinery
 * discover that an arriving claim carries licensing semantics — including
 * semantics defined by somebody else. A clause over `example.real-estate:lease`
 * surfaces that concept as a requirement, so a receiving system is told "you
 * need to understand this" without Protocol ever defining, resolving or
 * interpreting it. No interoperability descriptor schema change, no profile
 * bump and no mutation of the SM-07 core vocabulary is needed for any of it.
 *
 * ## Why the ids are derived from the claim id
 *
 * A `CanonicalSemanticRef.id` identifies one reference *occurrence*, so it has
 * to exist — but minting `randomUUID()` here would make the same declaration
 * serialize, digest and sign differently on every construction, which is fatal
 * for a claim meant to be signed and compared. `<claimId>:semantic:<n>` is
 * deterministic, collision-free within a claim, and follows the same
 * `<claimId>:assertion` convention the claim builders already use.
 */
export declare function buildLicenseTermsSemanticRefs(claimId: CanonicalClaimId, terms: SovereignLicenseTermsV1): readonly CanonicalSemanticRef[];
/**
 * Builds a canonical `LicenseTermsClaim`.
 *
 * Reuses `buildAuthorityClaim` with `kind: AuthorityClaimKind.License` rather
 * than reconstructing the `CanonicalClaim` base by hand, so the base fields —
 * `type`, `subject`, `assertionRef`, `evidenceRefs`, `attestationRefs` — keep
 * exactly one construction site in the package.
 *
 * Throws on a malformed declaration rather than repairing it: a construction
 * helper, not a lenient parser, matching `buildDerivationClaim`. Absent
 * optionals are omitted structurally, never emitted as `undefined`, so the
 * claim stays canonicalizable under `aoc-canonical-json/1`.
 *
 * It **never** signs, and it mints nothing: no claim id, no rule id, no
 * subject, no standing, no evidence reference. It creates exactly one claim —
 * no `OriginClaim`, no authorship claim and no `DerivationClaim` appears as a
 * side effect — and it copies no terms from anywhere: a subject derived from
 * another subject inherits none of that subject's terms, and a
 * `Permission`/`Derive` clause declares that deriving is permitted while saying
 * nothing at all about what terms the resulting child carries.
 */
export declare function buildLicenseTermsClaim(input: BuildLicenseTermsClaimInput): LicenseTermsClaim;
/**
 * Structural validation for a `LicenseTermsClaim`.
 *
 * Every rule is local and offline. It confirms that the *declaration* is well
 * formed — never that it is true, that the issuer had authority to make it,
 * that the terms are lawful, or that anything about the world matches them. It
 * consults no clock, so an expired declaration and one that takes effect in
 * 2030 are both structurally valid, and it creates no `StandingStatus`: nothing
 * here turns a date into `Active`, `Expired` or `NotYetActive`.
 *
 * Cryptographic validity and terms validity are independent, in both
 * directions. An issuer can perfectly well sign a malformed terms document —
 * AOC.VERIFIABILITY will report that signature as valid, and this function will
 * still report the terms as invalid. Neither is wrong, and neither repairs the
 * other.
 */
export declare function validateLicenseTermsClaim(value: unknown): LicensingTermsValidationResult;
export declare function isValidLicenseTermsClaim(value: unknown): value is LicenseTermsClaim;
//# sourceMappingURL=claim.d.ts.map