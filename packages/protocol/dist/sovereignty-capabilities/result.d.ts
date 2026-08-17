import type { UtcDateTime } from '../contracts';
import type { SovereignSubjectRef } from '../identity';
import type { SovereigntyCapabilityRef } from './capability-ref';
import type { SovereigntyCapabilityInvocationEvidenceV1 } from './evidence';
import type { SovereigntyCapabilityExecutionOutcome } from './implementation';
import type { SovereigntyCapabilityInvocation } from './invocation';
import type { SovereigntyCapabilityInvocationId } from './invocation-id';
export declare const SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION: "aoc-sovereignty-capability-result/1";
export type SovereigntyCapabilityResultSchemaVersion = typeof SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION;
interface SovereigntyCapabilityResultBase {
    readonly schemaVersion: SovereigntyCapabilityResultSchemaVersion;
    readonly invocationId: SovereigntyCapabilityInvocationId;
    readonly capability: SovereigntyCapabilityRef;
    readonly completedAt: UtcDateTime;
    readonly correlationId?: string;
    readonly subject?: SovereignSubjectRef;
    /**
     * Always present. Evidence exists because the invocation completed, not
     * because infrastructure was configured to store it — a sink is optional
     * persistence, and Protocol stays usable with none.
     */
    readonly evidence: SovereigntyCapabilityInvocationEvidenceV1;
}
export interface SovereigntyCapabilitySuccessResult<TOutput> extends SovereigntyCapabilityResultBase {
    readonly status: 'succeeded';
    /** The capability-specific output, verbatim. Never copied into evidence. */
    readonly output: TOutput;
}
export interface SovereigntyCapabilityFailureResult extends SovereigntyCapabilityResultBase {
    readonly status: 'failed';
    readonly reasonCodes: readonly string[];
}
/**
 * SovereigntyCapabilityResult — "what happened", as returned to the caller.
 *
 * Invariants the invoker guarantees for every result it returns:
 *
 *   result.invocationId  === invocation.invocationId
 *   result.capability    === invocation.capability   (id and version)
 *   result.correlationId === invocation.correlationId
 *
 * A result can therefore never claim a different capability, version or
 * invocation than the one that was requested.
 *
 * `status` here and `outcome` on the evidence record are the same fact under
 * the two names the contract gives them; they cannot disagree, because both
 * are derived from one execution outcome.
 */
export type SovereigntyCapabilityResult<TOutput> = SovereigntyCapabilitySuccessResult<TOutput> | SovereigntyCapabilityFailureResult;
/**
 * The subject-precedence rule, in one place so the result and its evidence
 * can never disagree about which subject an invocation concerned:
 *
 *   1. the subject the implementation returned, if it returned one
 *      — Identity creating a brand new `SovereignAssetId` is exactly this case;
 *   2. otherwise the subject the invocation carried, if it carried one
 *      — the ordinary "operate on an existing subject" case;
 *   3. otherwise no subject at all
 *      — standalone Integrity over loose bytes is exactly this case.
 *
 * Note that (1) does not have to equal (2): an implementation that returns a
 * subject is stating the affected or resulting subject, and the invoker takes
 * it at its word rather than asserting the request's subject over it.
 */
export declare function resolveSovereigntyCapabilitySubject<TInput, TOutput>(invocation: SovereigntyCapabilityInvocation<TInput>, outcome: SovereigntyCapabilityExecutionOutcome<TOutput>): SovereignSubjectRef | undefined;
export {};
//# sourceMappingURL=result.d.ts.map