import type { AssetRequirementId, AssetVerificationCheckId } from '../identifiers';
import type { VerificationCheckOutcome } from './verification-outcome';
import type { ProtocolizationVerificationResult } from './verification-result';
/**
 * Read-only views over verification history.
 *
 * **None of these is a readiness decision, and none may be read as one.** Every
 * name here is deliberately about *results* and *currency*: nothing is called
 * `ready`, `verified`, `satisfied`, `complete`, `approved` or `protocolizable`,
 * because this package cannot honestly say any of those. What it can say is
 * which checks ran, against which case revision, and what each returned.
 *
 * The gap is the whole point. A case where every declared check returned `Pass`
 * is a case where every declared check returned `Pass` — no more. Whether that
 * makes it ready depends on conditions nobody has evaluated, on professional
 * attestation nobody has performed, and on a state machine that does not exist
 * yet. APV-09 owns that question; these functions prepare it.
 *
 * Pure and synchronous. No I/O, no clock, no case, no repository.
 */
/**
 * Whether a result describes the case as it stands at a given revision.
 *
 * ### Result currency is not evidence freshness
 *
 * They are different questions and this package keeps them apart:
 *
 * ```text
 * evidence freshness   was the observation recent enough, per the
 *                      constraint the pinned profile declares?
 *                      -> a check evaluates it, and the answer is an outcome
 *
 * result currency      was this check executed against the case state a
 *                      reader is now looking at?
 *                      -> nobody evaluates it; it is a comparison of two
 *                         integers, and this is it
 * ```
 *
 * A `Pass` at revision `4` never becomes a `Pass` over material added at
 * revision `5`. This function is how a reader notices, and it is deliberately
 * exact rather than "at least": a check that ran against an *older* revision saw
 * strictly less, and a check that somehow carried a *newer* one is describing a
 * case this reader is not holding.
 *
 * Notice what it does not do: it does not mark the result stale, expire it,
 * invalidate it or suggest re-running it. Whether a non-current result must be
 * re-executed before some further step is a policy question, and policy belongs
 * to APV-09.
 */
export declare function isVerificationResultCurrentForRevision(result: ProtocolizationVerificationResult, caseRevision: number): boolean;
/** The results that evaluated exactly this case revision, in execution order. */
export declare function listVerificationResultsForRevision(results: readonly ProtocolizationVerificationResult[], caseRevision: number): readonly ProtocolizationVerificationResult[];
/** The correlation key for one check obligation: the requirement that asked, and the check. */
export interface VerificationResultKey {
    readonly requirementId: AssetRequirementId;
    readonly checkId: AssetVerificationCheckId;
}
/**
 * The most recent result for each `(requirementId, checkId)` pair.
 *
 * ### A view, never a mutation
 *
 * "Latest" is computed on read. Nothing is overwritten, nothing is marked
 * superseded, and no result loses its place in history because a newer one
 * exists — a `Pass` from yesterday and a `Fail` from today both remain
 * addressable, each still bound to the revision it evaluated. A stored
 * "current result" pointer would have had to be updated, and updating history is
 * the one thing an execution log must never do.
 *
 * ### Why the key is the pair and not the check
 *
 * One `checkId` may legitimately be declared by several verification
 * requirements of the same profile — the same mechanical proposition, demanded
 * in two places for two reasons. Correlating by check alone would let one
 * requirement's result stand in for another's, which is exactly the kind of
 * silent substitution the pinned-profile rules exist to prevent.
 */
export declare function listLatestVerificationResults(results: readonly ProtocolizationVerificationResult[]): readonly ProtocolizationVerificationResult[];
/** How many results carried each outcome. Every member is present, including zeros. */
export type VerificationOutcomeCounts = Readonly<Record<VerificationCheckOutcome, number>>;
/**
 * Counts results by outcome.
 *
 * ### This is a tally, not a verdict
 *
 * It reports how many of each of the five outcomes occurred, and it stops there.
 * There is deliberately no score, no percentage, no weighting, no
 * majority-wins rule, no confidence number and no "worst outcome wins"
 * reduction anywhere in this package:
 *
 * ```text
 * 4 Pass + 1 Warning = 80%          not implemented, and not an oversight
 * score > 75 => verified            not implemented
 * anything !== Fail => passed       not implemented
 * ```
 *
 * Each of those turns five distinguishable states into one number and then loses
 * the state that mattered. Every member of the outcome set is reported
 * separately and unweighted, so a single `Warning`, `ManualReview` or
 * `Unavailable` stays visible next to any number of passes rather than
 * disappearing into an average.
 *
 * And an all-`Pass` tally is still not readiness. It means every check that ran
 * passed — not that the right checks ran, not that unevaluated conditions apply
 * or do not, and not that a professional has attested anything.
 */
export declare function countVerificationOutcomes(results: readonly ProtocolizationVerificationResult[]): VerificationOutcomeCounts;
//# sourceMappingURL=verification-projections.d.ts.map