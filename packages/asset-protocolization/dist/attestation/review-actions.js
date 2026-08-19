"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROFESSIONAL_REVIEW_ACTIONS = exports.ProfessionalReviewAction = void 0;
exports.isProfessionalReviewAction = isProfessionalReviewAction;
/**
 * The APV-08 professional review action vocabulary.
 *
 * ### These are vertical workflow decisions, not Protocol members
 *
 * Read that first, because widening a Protocol enum to hold them is the single
 * most expensive mistake available in this slice.
 *
 * ```text
 * AttestationType        Human | Organization | System | AI | Remote | Governance
 *   what *kind* of attester a CanonicalAttestation came from — a generic
 *   Protocol substrate concept that exists whether or not this vertical does
 *
 * VerificationStatus     Pending | Verified | Failed
 *   the status of one CanonicalVerification record — likewise Protocol's
 *
 * ProfessionalReviewAction
 *                        Attest | Reject | RequestMoreEvidence | Abstain
 *   what a reviewer *did* when asked to consider one attestation requirement
 *   of one pinned profile version against one case revision — a vertical
 *   workflow fact
 * ```
 *
 * No `Attest`, `Reject`, `RequestMoreEvidence` or `Abstain` member is added to
 * any Protocol enum anywhere. A vertical whose workflow vocabulary forced a
 * Protocol enum to grow would have made every other consumer of that enum pay
 * for a distinction only this vertical needs — and worse, would have implied
 * that Protocol recognizes a canonical artifact for a rejection, which it does
 * not.
 *
 * ### Four members, deliberately, and never a boolean
 *
 * The set is closed and each member means one thing. There is no
 * `approved: boolean`, no `attested: boolean` and no `passed` anywhere in this
 * slice, because every boolean spelling of this vocabulary erases at least two
 * members:
 *
 * ```text
 * approved = action === Attest        collapses Reject, RequestMoreEvidence
 *                                     and Abstain into one indistinguishable
 *                                     "not approved" — losing the difference
 *                                     between "I decline", "I need more" and
 *                                     "I am not the right person to say"
 *
 * approved = action !== Reject        silently promotes an abstention and an
 *                                     unanswered request for material into
 *                                     approval
 * ```
 *
 * Both are wrong in the direction that matters — they turn "not yet" and "not
 * me" into an answer — so the action travels whole, all the way to whoever is
 * entitled to interpret it.
 *
 * ### What an action is worth
 *
 * Exactly what its own documentation says, and nothing broader. In particular
 * none of the four transitions any case state: APV-09 owns state, and this slice
 * adds no state, no readiness and no lifecycle member.
 */
exports.ProfessionalReviewAction = {
    /**
     * The reviewer is willing to make the requested attestation, within the
     * declared scope, on the basis of the bounded packet they reviewed.
     *
     * ```text
     * Attest != universal truth              Attest != legal title
     * Attest != full ownership determination Attest != case READY
     * Attest != protocolization complete     Attest != permission to tokenize
     * ```
     *
     * It is scoped by construction: a decision carrying this action without a
     * machine-readable scope is not representable
     * (`REVIEW_SCOPE_REQUIRED`). It is also the only action that may
     * legitimately produce or reference a Protocol `CanonicalAttestation`.
     */
    Attest: 'Attest',
    /**
     * The reviewer declines to make the requested attestation, having reviewed
     * the packet.
     *
     * ```text
     * Reject != case rejected      Reject != case cancelled
     * Reject != subject invalid    Reject != fraud
     * Reject != legal invalidity
     * ```
     *
     * It is a *successful* workflow decision, recorded and preserved. What
     * consequence it has for the case is a policy question APV-09 answers; this
     * slice records the fact and stops.
     */
    Reject: 'Reject',
    /**
     * The reviewer cannot responsibly issue the requested attestation on the
     * current review basis, and identifies what further material they need.
     *
     * ```text
     * RequestMoreEvidence != state transition
     * RequestMoreEvidence != MoreEvidenceRequired
     * RequestMoreEvidence != a deletion of anything already recorded
     * ```
     *
     * It deletes no evidence, invalidates no declaration, rewrites no
     * verification result and changes no case state. The material the reviewer
     * asks for is named machine-readably, so a follow-up intake can be driven
     * from the record rather than from prose.
     */
    RequestMoreEvidence: 'RequestMoreEvidence',
    /**
     * The reviewer declines to reach a substantive decision at all.
     *
     * ```text
     * Abstain != Fail    Abstain != Reject    Abstain != Pass
     * ```
     *
     * A conflict, a scope mismatch, a competency boundary or an inability to
     * review are all reasons a professional may legitimately step back, and the
     * reason travels as a machine-readable code rather than as a hard-coded set
     * of legal grounds this package would have to know. Abstention is a
     * recorded professional position, not a failure of the workflow.
     */
    Abstain: 'Abstain',
};
/**
 * Every action, in a stable order suitable for deterministic reporting.
 *
 * Ordering is presentational only. It confers no ranking, no severity scale and
 * no precedence: there is deliberately no "strongest decision wins" reduction
 * anywhere in this package, because choosing between two professionals'
 * conclusions is exactly the adjudication APV-08 must not perform.
 */
exports.PROFESSIONAL_REVIEW_ACTIONS = Object.freeze([
    exports.ProfessionalReviewAction.Attest,
    exports.ProfessionalReviewAction.Reject,
    exports.ProfessionalReviewAction.RequestMoreEvidence,
    exports.ProfessionalReviewAction.Abstain,
]);
function isProfessionalReviewAction(value) {
    return typeof value === 'string' && Object.values(exports.ProfessionalReviewAction).includes(value);
}
