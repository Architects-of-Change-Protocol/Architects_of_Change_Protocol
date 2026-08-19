"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalReviewBasisKind = void 0;
exports.isProfessionalReviewBasisKind = isProfessionalReviewBasisKind;
/**
 * What a professional is being asked to attest, and what they actually
 * attested — as structure, never as prose.
 *
 * ### Why scope is mandatory
 *
 * An unscoped attestation is an assertion about everything, which is an
 * assertion nobody can responsibly make and nobody can responsibly rely on.
 * "The professional approved the case" is exactly the sentence this type exists
 * to make unrepresentable: what a reviewer signs their name to is one
 * proposition, about one subject, over one identified basis, at one case
 * revision — and every one of those four is a field below.
 *
 * ### Why machine semantics never depend on prose
 *
 * `scopeStatement` and `limitations` exist because a professional often has
 * something to say that no schema anticipates. Nothing in this package reads
 * them, matches on them, branches on them or derives meaning from them, and a
 * later readiness evaluator must not either: downstream behaviour depends on
 * `requirementId`, `attestationType`, `subjectRef`, `caseRevision` and
 * `propositionRefs`, and on nothing else. A system whose readiness depended on
 * parsing a sentence would be a system whose readiness could be changed by
 * rephrasing one.
 */
/**
 * What kind of thing one `ProfessionalReviewBasisRef` names.
 *
 * ### Deliberately not APV-07's `VerificationInputKind`
 *
 * The two vocabularies look similar and mean different things.
 * `VerificationInputKind` names *what an automated check read*;
 * this names *what a professional reviewed*. The difference is load-bearing in
 * both directions: a professional must be able to point at a **verification
 * result**, which no check can read (a check that read another check's output
 * would make execution order part of the answer), and a check may cite an
 * `Observation` a resolver returned, which never appears in a review basis
 * because a reviewer reads records, not resolver call results.
 *
 * Widening APV-07's enum to cover this slice would have been the same mistake as
 * widening Protocol's to cover APV-07's — a member added for one consumer that
 * every other consumer then has to understand.
 */
exports.ProfessionalReviewBasisKind = {
    /** An APV-04 material association inside the case. */
    Material: 'Material',
    /** A requirement of the pinned profile. */
    Requirement: 'Requirement',
    /** An APV-05 evidence intake receipt. */
    IntakeReceipt: 'IntakeReceipt',
    /** Protocol's identifier for an evidence record. */
    EvidenceRecord: 'EvidenceRecord',
    /** An APV-06 declaration record. */
    DeclarationRecord: 'DeclarationRecord',
    /** Protocol's identifier for a claim record. */
    ClaimRecord: 'ClaimRecord',
    /** An APV-07 verification result, by its execution id. */
    VerificationResult: 'VerificationResult',
    /** The case's subject, by its sovereign asset id. */
    Subject: 'Subject',
};
function isProfessionalReviewBasisKind(value) {
    return (typeof value === 'string' && Object.values(exports.ProfessionalReviewBasisKind).includes(value));
}
