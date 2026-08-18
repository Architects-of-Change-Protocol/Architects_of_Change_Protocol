"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECLARATION_SUBMISSION_BASE_KEYS = exports.DeclarationPathway = void 0;
exports.declarationPathwayKeys = declarationPathwayKeys;
exports.isDeclarationPathway = isDeclarationPathway;
exports.submittedClaimRef = submittedClaimRef;
exports.submittedClaimType = submittedClaimType;
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
exports.DeclarationPathway = {
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
    Reference: 'Reference',
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
    Canonical: 'Canonical',
};
/** The keys every pathway shares. */
exports.DECLARATION_SUBMISSION_BASE_KEYS = [
    'declarationId',
    'caseId',
    'materialId',
    'declarant',
    'pathway',
    'claimSubtype',
    'statement',
    'requirementIds',
    'supportingEvidenceRefs',
    'declaredAt',
    'sourceRef',
    'correlationId',
];
/** The keys one pathway adds, so a reader needs no per-pathway branch. */
const PATHWAY_KEYS = Object.freeze({
    [exports.DeclarationPathway.Reference]: Object.freeze(['claimRef', 'claimType']),
    [exports.DeclarationPathway.Canonical]: Object.freeze(['claim']),
});
function declarationPathwayKeys(pathway) {
    return PATHWAY_KEYS[pathway];
}
function isDeclarationPathway(value) {
    return typeof value === 'string' && Object.values(exports.DeclarationPathway).includes(value);
}
/**
 * The `CanonicalClaimId` a submission resolves to, whichever pathway it used.
 *
 * Total over *structurally admitted* submissions only — validation runs first,
 * so by the time this is called a `Canonical` submission is known to carry a
 * claim document with an admissible `id`.
 */
function submittedClaimRef(submission) {
    return submission.pathway === exports.DeclarationPathway.Canonical
        ? submission.claim.id
        : submission.claimRef;
}
/**
 * The `ClaimType` a submission declares, whichever pathway it used — read off
 * the document when there is one, so the two spellings can never disagree.
 *
 * Same totality precondition as `submittedClaimRef`.
 */
function submittedClaimType(submission) {
    return submission.pathway === exports.DeclarationPathway.Canonical
        ? submission.claim.type
        : submission.claimType;
}
