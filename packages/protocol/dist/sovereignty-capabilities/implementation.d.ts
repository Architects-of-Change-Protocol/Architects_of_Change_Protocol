import type { CanonicalEvidenceId } from '../claims/primitives';
import { type SovereignSubjectRef } from '../identity';
import type { SovereigntyCapabilityRef } from './capability-ref';
import type { SovereigntyCapabilityInvocation } from './invocation';
/**
 * The capability succeeded and produced its capability-specific output.
 *
 * `subject` is the subject the invocation *affected or produced*, which is
 * not necessarily the subject it was given — see the precedence rule in
 * `result.ts`. An Identity-shaped implementation returns a subject it just
 * created; an Integrity-shaped implementation over loose bytes returns none.
 *
 * `evidenceRefs` lets an implementation point at capability-specific proof
 * artifacts (a signed manifest, a verification result, a future lineage
 * record) without embedding them in the common evidence. It reuses
 * `CanonicalEvidenceId` — the same Protocol-owned evidence reference the
 * repository already uses for `AuthorityClaim.evidenceRefs` and
 * `CanonicalClaim.evidenceRefs` — rather than inventing a parallel one.
 */
export interface SovereigntyCapabilitySuccessOutcome<TOutput> {
    readonly status: 'succeeded';
    readonly output: TOutput;
    readonly subject?: SovereignSubjectRef;
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
/**
 * The capability ran and *expectedly* did not succeed — a precondition was
 * not met, a verification did not hold, a declaration was refused.
 *
 * This is an ordinary invocation outcome, not an error: it returns a normal
 * failed result with failed evidence. `reasonCodes` are stable
 * machine-readable codes, never prose, never an exception message, and never
 * a stack trace — they are copied verbatim into portable evidence.
 */
export interface SovereigntyCapabilityFailureOutcome {
    readonly status: 'failed';
    readonly reasonCodes: readonly string[];
    readonly subject?: SovereignSubjectRef;
    readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}
/**
 * Explicit success/failure discriminated union. Truthiness, `null` returns
 * and thrown `Error` objects are all deliberately excluded as ways of
 * signalling an ordinary outcome: an outcome has to say which it is.
 */
export type SovereigntyCapabilityExecutionOutcome<TOutput> = SovereigntyCapabilitySuccessOutcome<TOutput> | SovereigntyCapabilityFailureOutcome;
/**
 * SovereigntyCapabilityImplementation — the socket a real capability capsule
 * plugs into.
 *
 * One implementation implements exactly one canonical capability at exactly
 * one semantic version, declared up front in `capability` so the invoker can
 * refuse a mismatched invocation *before* executing anything.
 *
 * SM-04 will make Identity and Integrity the first real implementations of
 * this interface, wrapping the existing `mintSovereignAssetId`,
 * `buildSovereignManifestV1` and `computeContentIdentity` primitives. SM-03
 * ships the socket only: no production implementation of any of the eight is
 * exported from this package, and no global registry exists for one to
 * register itself into — an implementation is passed explicitly to
 * `invokeSovereigntyCapability`.
 *
 * `invoke` is asynchronous because later capsules will need to be (signing,
 * external verification, provider I/O in a *capability implementation*, not
 * in this layer). A purely synchronous capsule simply returns from an `async`
 * method. No event bus, reactive library or runtime framework is involved.
 */
export interface SovereigntyCapabilityImplementation<TInput, TOutput> {
    readonly capability: SovereigntyCapabilityRef;
    invoke(invocation: SovereigntyCapabilityInvocation<TInput>): Promise<SovereigntyCapabilityExecutionOutcome<TOutput>>;
}
/**
 * Runtime shape check for a value returned by an *external* implementation.
 *
 * The interface is typed, but an implementation can come from outside this
 * package and from outside TypeScript, so the invoker verifies the outcome
 * rather than trusting it. A malformed outcome is treated as a programming
 * fault, not as a capability failure — inventing a plausible outcome from an
 * unreadable one is precisely how a bug becomes indistinguishable from a
 * legitimate result.
 */
export declare function isValidSovereigntyCapabilityExecutionOutcome(value: unknown): value is SovereigntyCapabilityExecutionOutcome<unknown>;
//# sourceMappingURL=implementation.d.ts.map