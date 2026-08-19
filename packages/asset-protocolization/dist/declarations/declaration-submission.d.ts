import type { CanonicalClaim, CanonicalClaimId, CanonicalEvidenceId, CanonicalPrincipalRef, CanonicalReferenceSource, ClaimType } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationMaterialId } from '../case/case-identifiers';
import type { DeclarationId } from './declaration-identifiers';
/**
 * `ProtocolizationDeclarationSubmission` — an *attempt* by a participant to
 * record an assertion into a `ProtocolizationCase`.
 *
 * This is the vertical's declaration envelope. It is **not** Protocol's claim
 * primitive, it does not extend one, and it never becomes one: a submission
 * describes a workflow act — who is asserting what, about which case, against
 * which requirements, pointing at which already-admitted evidence — and it
 * stops existing the moment the operation resolves. What survives is a
 * `ProtocolizationDeclarationRecord` and, for an accepted submission, an APV-04
 * material association.
 *
 * ### What a submission is, in one line
 *
 * ```text
 * this participant says this proposition, about this case's subject, now.
 * ```
 *
 * Not: the proposition is true. Not: the participant is who they say they are.
 * Not: the participant is entitled to say it. Not: the evidence they point at
 * supports it. Each of those is a later slice's question, and none of them is
 * representable on this type — there is no field to put an answer in.
 *
 * ### Why there is no `tenantId` field
 *
 * The acting tenant travels in the operation context, exactly as it does for
 * every APV-04 case operation and every APV-05 intake, and for the same reason:
 * a tenant read off the value being operated on can never disagree with itself,
 * so a cross-tenant call would be invisible. The record notes the tenant that
 * actually acted.
 */
/**
 * How the caller supplies the Protocol claim this declaration is carried by.
 *
 * Both pathways end at the same place — a `CanonicalClaimId` naming a Protocol
 * record — and differ only in what the caller already holds.
 *
 * ### Why this package never *constructs* a `CanonicalClaim`
 *
 * There is deliberately no third pathway in which APV-06 builds one, and the
 * reason is structural rather than stylistic. Look at what `CanonicalClaim`
 * actually requires:
 *
 * ```text
 * id              a minted canonical record identifier
 * assertionRef    a CanonicalAssertionId naming a CanonicalAssertion
 *                 that must itself exist somewhere
 * issuer          who issued the claim
 * subject         what it is about
 * evidenceRefs    the evidence the claim travels with
 * attestationRefs the attestations it travels with
 * issuedAt        when it was issued
 * ```
 *
 * Two of those — `id` and `assertionRef` — cannot be honestly produced here.
 * Minting a canonical record identifier is not this vertical's act, and
 * `assertionRef` would require APV-06 to mint a *second* identifier for a
 * `CanonicalAssertion` record it neither builds nor stores, leaving a claim in
 * circulation that points at an assertion that does not exist. Fabricating
 * either to make a declaration convenient would put a counterfeit Protocol
 * record into the world, which is precisely the failure the whole boundary
 * exists to prevent. APV-05 refused to construct `CanonicalEvidence` for the
 * same reason and this is the same refusal, applied to the claim substrate.
 *
 * What APV-06 owns instead is the *declaration record*: the vertical's
 * auditable account of who asserted what, when, into which case, correlated to
 * which requirements, pointing at which evidence. That is a workflow fact this
 * package is entitled to state, and it is the thing a later verification slice
 * reads.
 */
export declare const DeclarationPathway: {
    /**
     * The caller names an already-recorded `CanonicalClaim` by its id, and states
     * the claim's `ClaimType` (plus, where the profile narrows it, a
     * `claimSubtype`) so the correlation can be checked.
     *
     * Nothing here dereferences the claim: this package has no way to resolve a
     * Protocol record and must not pretend otherwise, so naming one asserts that
     * it exists no more than naming a file asserts that it is readable. The
     * declared `claimType` is likewise the *caller's* statement about the record
     * it named, checked for compatibility with the profile and never against the
     * record itself.
     */
    readonly Reference: "Reference";
    /**
     * The caller supplies the `CanonicalClaim` document it constructed elsewhere.
     *
     * The operation reads its `id` — which becomes the recorded reference — and
     * its `type` — which becomes the declared claim type — checks that the fields
     * it actually reads are structurally admissible, and then **discards the
     * document**. It is not copied onto the record and not copied into the case:
     * a second copy of a Protocol record living in vertical workflow state is a
     * copy that can go stale, and storing claim records is not this layer's job.
     *
     * This arm carries no `claimType` field of its own precisely so that the two
     * can never disagree — the document is the single spelling of it.
     */
    readonly Canonical: "Canonical";
};
export type DeclarationPathway = (typeof DeclarationPathway)[keyof typeof DeclarationPathway];
interface ProtocolizationDeclarationSubmissionBase {
    /** Identity of this declaration attempt. Unique within the tenant. */
    readonly declarationId: DeclarationId;
    /** The case this declaration is offered to. Must be the case being operated on. */
    readonly caseId: ProtocolizationCaseId;
    /**
     * Identity the resulting APV-04 material association will carry.
     *
     * Supplied rather than derived from `declarationId`, for the reason APV-05
     * gave: deriving it would make two layers share one identifier space, so a
     * later change to either layer's identity rules would silently constrain the
     * other.
     */
    readonly materialId: ProtocolizationMaterialId;
    /**
     * Who the vertical records as having made this declaration.
     *
     * Protocol's own `CanonicalPrincipalRef`, which is documented as identifying
     * a principal *without proving identity, standing, or authority* — exactly
     * the assertion this layer is entitled to make. The vertical therefore
     * declares no participant, actor or party type of its own, and a human, an
     * organization, a system and an AI are all representable through
     * `PrincipalKind` without APV-06 knowing the difference.
     *
     * ### Recording a declarant is not authenticating one
     *
     * Nothing here verifies that the principal exists, that the caller is that
     * principal, or that the principal may make this assertion. `Actor A says X`
     * is the whole of what is recorded; `Actor A was entitled to say X` is an
     * authority question that belongs to a later slice, and — for anything about
     * *governed actions* — outside this vertical altogether.
     *
     * ### Why this is not cross-checked against `claim.issuer`
     *
     * On the `Canonical` pathway the supplied claim names its own issuer, and
     * APV-06 deliberately does not require it to equal the declarant. A
     * participant may legitimately submit a claim issued by someone else — an
     * agent acting for a party is the obvious case — and deciding whether a
     * *particular* differing pair is legitimate is exactly the delegation
     * question this layer must not answer. Requiring equality would silently
     * forbid a legal arrangement; asserting equivalence would silently
     * manufacture one. Recording both, unjudged, does neither.
     */
    readonly declarant: CanonicalPrincipalRef;
    readonly pathway: DeclarationPathway;
    /**
     * The vertical token narrowing the claim type, when the pinned profile's
     * declaration requirement names one.
     *
     * This is APV-03's `AssetDeclarationRequirement.claimSubtype`, carried on the
     * submission so a `ClaimType.Custom` declaration says *which* custom
     * proposition it is. Opaque: nothing here parses it, and no member of any
     * subtype vocabulary is declared anywhere in this package.
     */
    readonly claimSubtype?: string;
    /**
     * Human-readable text, for people.
     *
     * Presentation only, and bounded. It is never a machine semantic: no
     * behaviour anywhere in this package reads it, parses it, matches on it,
     * derives a requirement from it, or compares two statements to decide that
     * two declarations are the same declaration. What a declaration *means* to a
     * machine is `claimType` plus `claimSubtype`; this is what it reads like to a
     * reviewer.
     *
     * Deliberately optional: a declaration is complete without it. Callers should
     * keep personal data out of it — the record it lands on is the vertical's
     * audit trail, and unlike everything else on this type this field is
     * unstructured.
     */
    readonly statement?: string;
    /**
     * Requirements of the case's pinned profile this declaration is offered
     * against. Non-empty and unique; every id is checked against the pinned
     * version, and at least one must be a declaration requirement whose declared
     * claim type this submission matches.
     */
    readonly requirementIds: readonly AssetRequirementId[];
    /**
     * Evidence, already admitted into this case through APV-05, that the
     * declarant offers as bearing on this assertion.
     *
     * A *linkage*, and nothing more. Recording that a declarant pointed at
     * evidence does not record that the evidence supports the declaration: it may
     * support it, contradict it, be irrelevant, be stale, be ambiguous or be
     * forged, and which of those is true is a verification question APV-06 cannot
     * and does not answer. There is deliberately no `supports`, `weight`,
     * `relevance` or `sufficiency` field to put an answer in.
     *
     * Each reference must already be evidence material *in this case*, which is
     * the only thing about it this layer can mechanically know — and is what
     * makes another tenant's evidence unlinkable without any tenant comparison at
     * all. Optional and, when present, non-empty and unique: a declaration may
     * legitimately be made long before any evidence exists.
     */
    readonly supportingEvidenceRefs?: readonly CanonicalEvidenceId[];
    /**
     * When the declarant says the declaration was made.
     *
     * Optional and never invented. A submission that does not supply one leaves
     * it absent rather than defaulting to the operation instant, because "they
     * declared it then" and "we recorded it now" are different assertions and
     * only the second one is ours to make — the same rule APV-05 applies to
     * `observedAt`. Preserved verbatim, never compared against the clock and
     * never repaired.
     */
    readonly declaredAt?: UtcDateTime;
    /**
     * Where the declaration reached the workflow from, as Protocol's own
     * provenance primitive — a signing surface, an intake channel, an upstream
     * system.
     *
     * Recording a source does **not** make it trustworthy, and it is not a proof
     * of anything: it records what was said about where this came from, so a
     * later evaluator and an auditor can weigh it.
     */
    readonly sourceRef?: CanonicalReferenceSource;
    /** Correlates this attempt with the request that produced it. */
    readonly correlationId?: CanonicalId;
}
export interface ReferencedDeclarationSubmission extends ProtocolizationDeclarationSubmissionBase {
    readonly pathway: typeof DeclarationPathway.Reference;
    readonly claimRef: CanonicalClaimId;
    /** The caller's statement of the named record's `ClaimType`. Never dereferenced. */
    readonly claimType: ClaimType;
}
export interface CanonicalClaimDeclarationSubmission extends ProtocolizationDeclarationSubmissionBase {
    readonly pathway: typeof DeclarationPathway.Canonical;
    /** Protocol's `CanonicalClaim`, reused as-is. Read, then discarded. */
    readonly claim: CanonicalClaim;
}
export type ProtocolizationDeclarationSubmission = ReferencedDeclarationSubmission | CanonicalClaimDeclarationSubmission;
/** The keys every pathway shares. */
export declare const DECLARATION_SUBMISSION_BASE_KEYS: readonly string[];
export declare function declarationPathwayKeys(pathway: DeclarationPathway): readonly string[];
export declare function isDeclarationPathway(value: unknown): value is DeclarationPathway;
/**
 * The `CanonicalClaimId` a submission resolves to, whichever pathway it used.
 *
 * Total over *structurally admitted* submissions only — validation runs first,
 * so by the time this is called a `Canonical` submission is known to carry a
 * claim document with an admissible `id`.
 */
export declare function submittedClaimRef(submission: ProtocolizationDeclarationSubmission): CanonicalClaimId;
/**
 * The `ClaimType` a submission declares, whichever pathway it used — read off
 * the document when there is one, so the two spellings can never disagree.
 *
 * Same totality precondition as `submittedClaimRef`.
 */
export declare function submittedClaimType(submission: ProtocolizationDeclarationSubmission): ClaimType;
export {};
//# sourceMappingURL=declaration-submission.d.ts.map