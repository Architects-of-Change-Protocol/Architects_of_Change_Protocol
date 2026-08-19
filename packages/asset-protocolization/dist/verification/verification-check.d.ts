import type { AdapterResult } from '@aoc/protocol/adapters';
import type { CanonicalVerificationId } from '@aoc/protocol/claims';
import type { AssetVerificationCheckId } from '../identifiers';
import type { VerificationCheckContext } from './verification-context';
import type { VerificationReasonCode } from './verification-identifiers';
import type { VerificationCheckOutcome } from './verification-outcome';
import type { VerificationInputRef } from './verification-result';
/**
 * One executable APV verification check.
 *
 * ### The whole contract
 *
 * ```text
 * checkId                       which AssetProfile-declared check this is
 * execute(context) -> execution what it found, and on what basis
 * ```
 *
 * That is deliberately all of it. A check is not told which tenant may run it,
 * whether the case is in an acceptable state, whether the pinned profile
 * declares it for the requirement it is being run against, or how to persist
 * anything — every one of those is enforced by the engine *before* `execute` is
 * called, in one place, so a new check cannot forget one of them.
 *
 * ### Sync or async, by the repository's own convention
 *
 * `AdapterResult<T> = T | Promise<T>` is how this repository already spells "a
 * port that may or may not need to go somewhere" (`@aoc/protocol/adapters`).
 * A pure check returns its execution directly; one that awaits a resolver
 * returns a promise; the engine awaits either. The abstraction therefore never
 * forecloses an asynchronous check, and no pure check is made impure to pay for
 * that — everything else in this slice (validation, plan construction, result
 * construction, projections, the repository) stays synchronous.
 *
 * ### Extension is registration, not modification
 *
 * Adding a check means writing an implementation of this interface and
 * registering it. It never means changing Protocol, changing
 * `ProtocolizationCase`, changing the engine, or adding a branch on what kind of
 * asset is being processed. The engine resolves `checkId -> implementation`
 * through the registry and knows nothing else about any check.
 *
 * ### An outcome is not an error
 *
 * A check that returns `Fail` completed successfully; it did its job and the
 * answer was negative. Throwing is reserved for a check that cannot run *as
 * written* — a bug, a broken invariant, a malformed implementation — and those
 * deliberately propagate rather than being laundered into `Unavailable`. Hiding
 * a defect behind a normal outcome would make a broken check indistinguishable
 * from a working one reporting a dependency outage.
 */
export interface AssetVerificationCheck {
    readonly checkId: AssetVerificationCheckId;
    execute(context: VerificationCheckContext): AdapterResult<VerificationCheckExecution>;
}
/**
 * What a check returns.
 *
 * The engine validates this structurally before building a result: `outcome`
 * must be a member of the closed outcome set, `reasonCode` must be a dotted
 * token, `summary` must be bounded text, `inputRefs` must be well-formed, and
 * an unknown field is rejected. An executor cannot put an arbitrary string where
 * an outcome belongs, and a malformed execution fails loudly
 * (`VERIFICATION_CHECK_EXECUTION_INVALID`) rather than being stored.
 */
export interface VerificationCheckExecution {
    readonly outcome: VerificationCheckOutcome;
    /**
     * Why, as a stable machine token. Optional, but strongly preferred for
     * anything other than an unqualified `Pass` — an outcome without a reason
     * makes a later reader parse prose to learn what happened.
     */
    readonly reasonCode?: VerificationReasonCode;
    /**
     * Human-readable detail, bounded and for people only.
     *
     * Never the machine semantic. Checks must keep declaration statements,
     * document contents, personal data and secrets out of it — the result it lands
     * on travels further than the material it describes.
     */
    readonly summary?: string;
    /** What this execution actually read. References only; never copies. */
    readonly inputRefs?: readonly VerificationInputRef[];
    /**
     * A `CanonicalVerification` this execution legitimately observed.
     *
     * Optional, and never to be synthesized. A check that has no genuine
     * `CanonicalVerification` behind it leaves this absent; fabricating one to
     * populate the field would put a counterfeit Protocol record into circulation.
     */
    readonly canonicalVerificationRef?: CanonicalVerificationId;
}
//# sourceMappingURL=verification-check.d.ts.map