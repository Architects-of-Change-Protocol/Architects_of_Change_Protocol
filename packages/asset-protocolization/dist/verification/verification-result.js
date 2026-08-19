"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationInputKind = exports.PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION = void 0;
exports.isVerificationInputKind = isVerificationInputKind;
/**
 * `ProtocolizationVerificationResult` — the immutable record that one
 * profile-declared check **was executed** against one case at one revision and
 * returned one outcome.
 *
 * ### What a result means
 *
 * Exactly this, and it is worth spelling out because reading more into it is
 * the central risk of this slice:
 *
 * ```text
 * this check, declared by this exact profile version for this requirement,
 * was executed by a caller acting as this tenant,
 * against this case as it stood at this revision,
 * over the inputs named below,
 * at this instant,
 * and returned this outcome for this reason.
 * ```
 *
 * ### What a result does not mean
 *
 * ```text
 * Pass          != universal truth        != legal ownership
 * Pass          != professional approval  != case READY
 * Fail          != case rejected          != case cancelled
 * Warning       != Pass                   != ignorable
 * ManualReview  != attestation            != reviewer assigned
 * Unavailable   != Fail                   != dependency is wrong
 * all Pass      != READY                  != protocolized
 * ```
 *
 * There is deliberately no `passed` boolean, no score, no confidence number and
 * no case-level verdict field anywhere on this type. Each would be a lossy
 * re-spelling of `outcome`, and the loss always falls in the same direction —
 * toward reporting certainty the check did not have.
 *
 * ### The result is a historical fact, not a live view
 *
 * `evaluatedCaseRevision` is what makes that true. A result produced at revision
 * `4` remains a statement about revision `4` forever: adding evidence at
 * revision `5` neither updates it nor invalidates it, and nothing in this
 * package rewrites one. Whether a prior result still describes the case's
 * current state is a question a *reader* answers by comparing revisions
 * (`verification-projections.ts`), never something the record silently changes
 * its mind about.
 *
 * ### Immutability and re-execution
 *
 * Every field is fixed at construction, and there is no operation anywhere in
 * this package that rewrites one — no update, no delete, no "current result"
 * pointer. Running the same check again produces a *new* result with a new
 * `executionId`; a `Pass` from yesterday and a `Fail` today coexist, in order,
 * each bound to the revision it actually evaluated. Overwriting the first would
 * destroy the only evidence of what the case looked like when it passed, which
 * is the one thing an execution log exists to preserve.
 */
exports.PROTOCOLIZATION_VERIFICATION_RESULT_SCHEMA_VERSION = 'aoc-protocolization-verification/1';
/**
 * What kind of thing one `VerificationInputRef` names.
 *
 * Every member names something the vertical or Protocol already identifies, and
 * the set is closed to what a check in this slice can legitimately have read. A
 * new asset category never adds a member here.
 */
exports.VerificationInputKind = {
    /** An APV-04 material association inside the case. */
    Material: 'Material',
    /** A requirement of the pinned profile. */
    Requirement: 'Requirement',
    /** Protocol's identifier for an evidence record. */
    EvidenceRecord: 'EvidenceRecord',
    /** Protocol's identifier for a claim record. */
    ClaimRecord: 'ClaimRecord',
    /** An APV-05 evidence intake receipt. */
    IntakeReceipt: 'IntakeReceipt',
    /** An APV-06 declaration record. */
    DeclarationRecord: 'DeclarationRecord',
    /** The case's subject, by its sovereign asset id. */
    Subject: 'Subject',
    /** An entry inside an external registry, by its entry id. */
    RegistryEntry: 'RegistryEntry',
    /** An observation an injected resolver returned, named by whatever the resolver named it. */
    Observation: 'Observation',
};
function isVerificationInputKind(value) {
    return typeof value === 'string' && Object.values(exports.VerificationInputKind).includes(value);
}
