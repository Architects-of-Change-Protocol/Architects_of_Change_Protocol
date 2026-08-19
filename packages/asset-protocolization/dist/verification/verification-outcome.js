"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFICATION_CHECK_OUTCOMES = exports.VerificationCheckOutcome = void 0;
exports.isVerificationCheckOutcome = isVerificationCheckOutcome;
/**
 * The APV-07 automated-check outcome vocabulary.
 *
 * ### This is not Protocol's `VerificationStatus`
 *
 * Read that sentence twice, because collapsing the two is the single most
 * expensive mistake available in this slice.
 *
 * ```text
 * VerificationStatus            Pending | Verified | Failed
 *   the status of one CanonicalVerification record — a generic Protocol
 *   substrate concept that exists whether or not this vertical does
 *
 * VerificationCheckOutcome      Pass | Fail | Warning | ManualReview | Unavailable
 *   the result of executing one AssetProfile-declared check against one
 *   ProtocolizationCase at one case revision — a vertical workflow fact
 * ```
 *
 * They are different concepts with different owners, so APV-07 declares its own
 * vocabulary here rather than widening Protocol's. No `VerificationStatus.Pass`,
 * `.Warning`, `.ManualReview` or `.Unavailable` is added anywhere: Protocol's
 * enum is left exactly as it was frozen (APV-00 F-2, APV-03), and this package
 * imports nothing from it. A vertical whose richer outcome model forced a
 * Protocol enum to grow would have made every other consumer of that enum pay
 * for a distinction only this vertical needs.
 *
 * ### Five members, deliberately, and never a boolean
 *
 * The set is closed and each member means one thing. There is no
 * `passed: boolean` anywhere in this slice, because every boolean spelling of
 * this vocabulary erases at least one member:
 *
 * ```text
 * passed = outcome === Pass                erases the difference between a
 *                                          real failure and a check that
 *                                          could not run at all
 *
 * passed = outcome !== Fail                silently promotes Warning,
 *                                          ManualReview and Unavailable
 *                                          into success
 * ```
 *
 * Both are wrong in the direction that matters — they turn "we do not know"
 * into an answer — so the outcome travels whole, all the way to whoever is
 * entitled to interpret it.
 *
 * ### What a `Pass` is worth
 *
 * Exactly this: *one defined check evaluated defined inputs under a defined
 * profile/check contract at a defined case revision and its pass condition
 * held*. It is not universal truth, not legal ownership, not professional
 * certification, not protocolization readiness and not authorization to do
 * anything. Those conclusions belong to later slices, to human reviewers, or to
 * nobody at all.
 */
exports.VerificationCheckOutcome = {
    /**
     * The check executed and its defined pass condition was satisfied.
     *
     * Scoped to this check, these inputs, this pinned profile version and this
     * case revision. It says nothing about other checks, other requirements, the
     * truth of anything asserted, or the readiness of the case.
     */
    Pass: 'Pass',
    /**
     * The check executed and its defined failure condition was established.
     *
     * A failure of *this check*. It does not cancel the case, does not reject it,
     * does not delete or invalidate the evidence and declarations it read, and
     * does not mean protocolization is impossible — a `Fail` is an input to a
     * later decision, never the decision.
     */
    Fail: 'Fail',
    /**
     * The check executed and identified a non-fatal concern that must stay
     * visible.
     *
     * Deliberately not a shade of `Pass`. A warning that anything downstream is
     * free to round to success is a warning that was never worth emitting, so
     * nothing in this package ever collapses one.
     */
    Warning: 'Warning',
    /**
     * The check executed and established that automated evaluation cannot
     * responsibly reach the required conclusion.
     *
     * The matter is surfaced for later human or professional consideration. This
     * is emphatically *not* an attestation, an approval, a rejection, a reviewer
     * assignment or a queue entry — APV-08 owns professional review, and APV-07
     * neither performs it nor pretends to have started it.
     */
    ManualReview: 'ManualReview',
    /**
     * The check is known and was correctly invoked, but could not obtain an input
     * or dependency it needs, so no evaluation happened.
     *
     * ```text
     * registry service unreachable   !=  registry check failed
     * canonical record unresolvable  !=  canonical record wrong
     * content bytes not readable     !=  digest mismatch
     * ```
     *
     * Converting a dependency outage into `Fail` would manufacture a negative
     * finding out of an infrastructure event, and a later reader would have no
     * way to tell the two apart. This member exists so that it never has to.
     *
     * It is also not the code for a check that has no implementation registered:
     * that is a configuration error which fails loudly
     * (`VERIFICATION_CHECK_NOT_REGISTERED`) rather than producing a result record.
     */
    Unavailable: 'Unavailable',
};
/**
 * Every outcome, in a stable order suitable for deterministic reporting.
 *
 * Ordering is presentational only. It confers no ranking, no severity scale and
 * no precedence: there is deliberately no "worst outcome wins" reduction
 * anywhere in this package, because reducing a set of findings to one verdict
 * is exactly the case-level judgement APV-07 must not make.
 */
exports.VERIFICATION_CHECK_OUTCOMES = Object.freeze([
    exports.VerificationCheckOutcome.Pass,
    exports.VerificationCheckOutcome.Fail,
    exports.VerificationCheckOutcome.Warning,
    exports.VerificationCheckOutcome.ManualReview,
    exports.VerificationCheckOutcome.Unavailable,
]);
function isVerificationCheckOutcome(value) {
    return typeof value === 'string' && Object.values(exports.VerificationCheckOutcome).includes(value);
}
