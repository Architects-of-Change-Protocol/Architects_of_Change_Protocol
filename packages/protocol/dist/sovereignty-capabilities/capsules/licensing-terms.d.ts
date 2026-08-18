import type { CanonicalClaimId, CanonicalEvidenceId, CanonicalIssuer, CanonicalStandingId, CanonicalTimestamp } from '../../claims/primitives';
import type { CanonicalStanding } from '../../claims/standing';
import { type LicenseTermsClaim, type LicensingTermsReasonCode, type LicensingTermsValidationResult, type SovereignLicenseTermsAudience, type SovereignLicenseTermsRuleV1 } from '../../licensing';
import type { SovereigntyCapabilityImplementation } from '../implementation';
import { type SovereigntyCapabilityClock } from '../time';
/**
 * AOC.LICENSING_TERMS — the production Sovereignty Capability capsule that
 * answers:
 *
 *   "What permissions, restrictions and obligations does an issuer declare
 *    over this sovereign subject — in a structured, attributable, portable
 *    form that another system can read?"
 *
 * It is the seventh of the canonical eight to become a real implementation of
 * the SM-03 socket. The claim architecture it builds on already existed:
 * `AuthorityClaimKind.License` has been part of `@aoc/protocol/manifest` since
 * the manifest layer was written, and SM-05 deliberately left it outside the
 * formal Provenance capsule for exactly this mineral to take up. What SM-09
 * adds underneath is the genuinely missing piece — a structured, versioned
 * `SovereignLicenseTermsV1` document, so a licensing declaration is
 * machine-readable rather than buried in free text.
 *
 * ## Declaration is not enforcement
 *
 * This is the load-bearing boundary, and it holds in every direction:
 *
 *     declared permission   != runtime authorization
 *     declared restriction  != enforced denial
 *     declared obligation   != proof of compliance
 *     signed license claim  != legal validity
 *     issuer declares rights!= issuer proven to hold rights
 *     license terms         != ownership transfer
 *     license terms         != policy decision
 *     license terms         != access grant
 *     license terms         != DRM
 *
 * A `Permission`/`CommercialUse` clause means *"the issuer declares commercial
 * use permitted under these terms"*. It produces no `CapabilityGrant`, no
 * `CapabilityToken`, no `AccessGrant`, no credential, no signed URL, no ACL
 * entry and no authorization result. A `Restriction` clause blocks no request,
 * deletes no file, revokes no URL, disables no playback and prevents no copy.
 * An `Obligation`/`Attribute` clause does not establish that attribution
 * happened, and an `Obligation` to pay does not establish that anyone paid.
 *
 * ## No evaluation, in any form
 *
 * There is deliberately no `evaluate-license`, `is-action-permitted`,
 * `is-action-restricted`, `isAllowed`, `isDenied`, `authorize-use`, `canUse`,
 * `canDistribute`, `canDerive` or `check-obligation` operation, and no
 * condition language to write one with — no `and`, `or`, `not`, comparison
 * operator, expression tree, CEL, Rego, Cedar, JSON Logic or XACML. This is an
 * absolute boundary rather than deferred work.
 *
 * It follows that Protocol applies **no precedence**. A document may declare a
 * `Permission` and a `Restriction` over the identical action; both are
 * structurally valid, both are recorded, and Protocol says only *"the issuer
 * declared both"*. It does not say commercial use is allowed, does not say it
 * is denied, and does not decide that restriction beats permission, that the
 * latest claim wins, that a signed claim beats an unsigned one, that a verified
 * issuer beats an unverified one, or that a principal-specific document beats a
 * public one. A subject may carry many licensing declarations from many
 * issuers, with different dates, audiences and contradictory terms, and nothing
 * here resolves which is "current".
 *
 * ## No wall clock, no derived standing
 *
 * `issuedAt`, `effectiveAt` and `expiresAt` are declaration *data*. Nothing
 * here compares them to now, so there is no `isActive`,
 * `isCurrentlyEffective`, `isExpiredNow` or `isNotYetEffective`, and no
 * `StandingStatus.Active` or `StandingStatus.Expired` is ever created. A
 * future-effective declaration is structurally valid; an expired historical
 * declaration is structurally valid historical data.
 *
 * ## What this capsule deliberately does not do
 *
 * - **Create identity.** It never calls `mintSovereignAssetId`. Terms are
 *   declared over a subject that already exists, so `invocation.subject` is
 *   required for a declaration — see `LICENSING_TERMS_SUBJECT_REQUIRED` — and
 *   `declare-license-terms` accepts no `sovereignAssetId` of its own, so a
 *   claim can never disagree with the invocation it was made under.
 * - **Require content.** No bytes, no `ContentIdentity`, no manifest digest.
 *   Terms attach to sovereign subject *identity*, which is what lets a
 *   building, a parcel of land, an API resource, an AI agent, an external token
 *   and a physical painting receive terms exactly as a file does.
 * - **Sign.** `signClaim`, `signSovereignManifest`, `signSovereignPayload` and
 *   `generateSovereignKeyPair` are not called here, and no input field carries
 *   a private key, secret key, seed, mnemonic or KMS secret in any spelling. An
 *   issuer signs a returned claim with the existing public primitives, and
 *   AOC.VERIFIABILITY checks it.
 * - **Verify.** Cryptographic validity is AOC.VERIFIABILITY's contract. The two
 *   are independent: an issuer can sign a structurally malformed terms
 *   document, so "signature valid" and "terms invalid" is an ordinary,
 *   representable pair rather than a contradiction.
 * - **Create provenance.** No `OriginClaim`, authorship claim or
 *   `DerivationClaim` appears as a side effect. One declaration produces one
 *   licensing claim.
 * - **Inherit anything.** Terms never travel along a derivation edge. There is
 *   no `inheritLicense`, `copyTerms`, `propagateRestrictions` or
 *   `propagateRights`, and a `Permission`/`Derive` clause on a parent does not
 *   give a child the parent's terms — the child needs its own declaration.
 * - **Conclude ownership.** No `owner`, `legalOwner`, `copyrightOwner`,
 *   `titleHolder` or `beneficialOwner` field exists, and the manifest's
 *   `registrant` is never read as the licensing issuer: registering a subject
 *   and declaring terms over it are different acts, possibly by different
 *   parties, so the issuer is always supplied explicitly. There is no
 *   `transfer`, `assign`, `convey`, `sell` or `title-transfer` operation.
 * - **Do economics.** No price, currency, royalty rate, fee, revenue share,
 *   payment schedule, wallet or settlement address; no
 *   `calculateRoyalty`, `settleRoyalty`, `splitRevenue`, `invoice` or
 *   `meterUsage`; no billing, tax or jurisdiction engine.
 * - **Do DRM.** No encryption, watermarking, playback control, kill switch,
 *   remote disable or copy prevention. Enforcement is external, always.
 * - **Translate.** No SPDX, Creative Commons, ODRL, RightsML or NFT-licence
 *   mapping. Those are adapters over this model, and inventing them here would
 *   bake somebody else's semantics into the Protocol contract.
 * - **Reach out.** No filesystem, network, database, chain, provider, registry
 *   or resolver. An action term is an identifier and is never dereferenced,
 *   URL-shaped or not; a custom audience is never expanded into members.
 * - **Invoke another mineral.** `invokeSovereigntyCapability` is not called
 *   here. Composition stays the caller's decision, visible in the caller's own
 *   evidence.
 * - **Branch on the subject or the action.** No namespace, media type,
 *   filename, asset type or business domain is read, and even the core action
 *   concepts — `CommercialUse`, `Derive`, `Attribute` — trigger no distinct
 *   production behaviour. Rules are generic structured declarations.
 *
 * ## Deferred on purpose
 *
 * `supersede-license-terms` is **not** implemented in v1. The standing model
 * can already express `Superseded`, but supersession implies precedence between
 * declarations, and precedence deserves its own explicit design rather than
 * arriving as a side effect of a convenience operation. Governance handoff
 * belongs to SM-10, AOC.GOVERNANCE_COMPATIBILITY, and nothing here anticipates
 * it.
 */
/**
 * The operations AOC.LICENSING_TERMS 1.0.0 supports. Closed for this capability
 * version: an unrecognized operation is reported rather than guessed at.
 */
export declare const LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS: readonly ["declare-license-terms", "validate-license-terms", "contest-license-terms-claim"];
export type LicensingTermsSovereigntyCapabilityOperation = (typeof LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS)[number];
/**
 * Capability-specific input for `declare-license-terms`.
 *
 * Fields deliberately absent, and why:
 *
 * - **`sovereignAssetId`** — the subject is always
 *   `invocation.subject.sovereignAssetId`. Letting the caller name a second,
 *   potentially different asset id would allow a claim that contradicts the
 *   invocation it was recorded under.
 * - **any private key** — this capsule does not sign, and the SM-03 invocation
 *   input is a generic transport shared by every capability. Key material has
 *   no business travelling through it.
 * - **content bytes** — terms attach to subject identity, not to a byte
 *   representation.
 *
 * `claimId` is caller-supplied and is emphatically not the `invocationId`: one
 * identifies *this execution of a capability*, the other identifies *this
 * declaration*, with different lifetimes and different holders. Protocol has no
 * claim-id minting primitive, and SM-09 does not invent an id grammar.
 *
 * `issuedAt` is optional. Supplied, it is preserved — which is what makes
 * importing historical declarations possible. Omitted, it comes from the
 * injectable Protocol clock as a canonical UTC timestamp.
 *
 * `effectiveAt` has no default at all. It is a distinct fact from `issuedAt`,
 * and deriving one from the other would record a declaration the issuer never
 * made.
 */
export interface DeclareLicenseTermsInput {
    readonly operation: 'declare-license-terms';
    readonly claimId: CanonicalClaimId;
    readonly issuer: CanonicalIssuer;
    readonly statement: string;
    readonly audience: SovereignLicenseTermsAudience;
    readonly rules: readonly SovereignLicenseTermsRuleV1[];
    readonly issuedAt?: CanonicalTimestamp;
    readonly effectiveAt?: CanonicalTimestamp;
    readonly expiresAt?: CanonicalTimestamp;
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
/**
 * Capability-specific input for `validate-license-terms`.
 *
 * `claim` is `unknown` on purpose. Validation is an *external trust boundary*
 * operation — the candidate is exactly the kind of document that arrived from
 * somewhere else — and typing it as `LicenseTermsClaim` would let a malformed
 * document become authoritative by assertion, which is the failure the operation
 * exists to prevent.
 */
export interface ValidateLicenseTermsInput {
    readonly operation: 'validate-license-terms';
    readonly claim: unknown;
}
/**
 * Capability-specific input for `contest-license-terms-claim`.
 *
 * Recording a dispute, never resolving one. No adjudication, no approval, no
 * governance body, no oracle and no reviewer is consulted, and no conclusion
 * about ownership or legal validity is reached.
 */
export interface ContestLicenseTermsClaimInput {
    readonly operation: 'contest-license-terms-claim';
    readonly standingId: CanonicalStandingId;
    /** The claim to contest, unchanged. It is read, never rewritten. */
    readonly claim: LicenseTermsClaim;
    readonly reason: string;
    readonly effectiveAt?: CanonicalTimestamp;
}
export type LicensingTermsSovereigntyCapabilityInput = DeclareLicenseTermsInput | ValidateLicenseTermsInput | ContestLicenseTermsClaimInput;
/**
 * The declared terms, as one canonical claim.
 *
 * Deliberately no `signature`, `standing`, `grant`, `token`, `credential`,
 * `authorization`, `decision` or `effectiveNow` field. The operation declares;
 * anything further is another mineral's contract or another system's job.
 */
export interface DeclareLicenseTermsOutput {
    readonly operation: 'declare-license-terms';
    readonly claim: LicenseTermsClaim;
}
export interface ValidateLicenseTermsOutput {
    readonly operation: 'validate-license-terms';
    readonly validation: LicensingTermsValidationResult;
}
/**
 * The contested claim and the standing recording the challenge.
 *
 * `claim` is the caller's original object, returned untouched — contestation
 * preserves history rather than replacing it. `standing.status` is `Contested`,
 * which states only that a challenge exists: not that the challenger is right,
 * not that the terms are void, and not that any signature over the claim has
 * stopped verifying. A cryptographically valid licensing claim and a
 * `Contested` standing coexist without contradiction.
 */
export interface ContestLicenseTermsClaimOutput {
    readonly operation: 'contest-license-terms-claim';
    readonly claim: LicenseTermsClaim;
    readonly standing: CanonicalStanding;
}
export type LicensingTermsSovereigntyCapabilityOutput = DeclareLicenseTermsOutput | ValidateLicenseTermsOutput | ContestLicenseTermsClaimOutput;
export interface LicensingTermsSovereigntyCapabilityInputValidationResult {
    readonly valid: boolean;
    readonly reasons: readonly LicensingTermsReasonCode[];
}
export interface CreateLicensingTermsSovereigntyCapabilityImplementationOptions {
    /**
     * Injectable time source for a claim's `issuedAt` and a standing's
     * `effectiveAt` when the caller supplied neither. Reuses the existing SM-03
     * `SovereigntyCapabilityClock` rather than adding a second clock abstraction.
     *
     * It is never used to default a terms document's `effectiveAt`, and never
     * consulted to decide whether a declaration is currently in force.
     *
     * `invocation.requestedAt` is deliberately not used: it is caller-supplied
     * envelope metadata about when a request was constructed, which is a
     * different fact from when a declaration was issued.
     */
    readonly clock?: SovereigntyCapabilityClock;
}
/**
 * Validates the capability-specific Licensing & Terms input, accumulating every
 * reason rather than reporting only the first, and never mutating what it was
 * given — no array is sorted, deduplicated, trimmed or frozen in place.
 *
 * Subject-dependent rules are deliberately *not* checked here: whether a
 * contested claim is about the invocation's subject is a question about the
 * pairing of an input with an invocation, and this function only sees the
 * input. The capsule applies it once the subject is known.
 */
export declare function validateLicensingTermsSovereigntyCapabilityInput(value: unknown): LicensingTermsSovereigntyCapabilityInputValidationResult;
export declare function isValidLicensingTermsSovereigntyCapabilityInput(value: unknown): value is LicensingTermsSovereigntyCapabilityInput;
export interface LicensingTermsSovereigntyCapabilityImplementation extends SovereigntyCapabilityImplementation<LicensingTermsSovereigntyCapabilityInput, LicensingTermsSovereigntyCapabilityOutput> {
}
/**
 * Builds the production AOC.LICENSING_TERMS capsule.
 *
 * A factory, for the injectable clock and so that importing this module
 * performs no work: nothing is registered, nothing is mutated, no global is
 * touched, no clock is read, no id is generated, no vocabulary is resolved and
 * no policy is evaluated at import time. There is no implementation registry —
 * the capsule is passed explicitly to `invokeSovereigntyCapability`, which is
 * the only supported way to execute it.
 *
 * Deterministic: the same subject, the same input and the same clock produce
 * the same claim, byte for byte. Claim ids and rule ids are caller-supplied and
 * the generated `semanticRefs` ids are derived from the claim id, so nothing
 * random or time-dependent reaches a document that is meant to be signed.
 */
export declare function createLicensingTermsSovereigntyCapabilityImplementation(options?: CreateLicensingTermsSovereigntyCapabilityImplementationOptions): LicensingTermsSovereigntyCapabilityImplementation;
//# sourceMappingURL=licensing-terms.d.ts.map