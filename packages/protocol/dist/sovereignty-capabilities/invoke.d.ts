import type { AuditEventSink } from '../adapters';
import { type SovereigntyCapabilityImplementation } from './implementation';
import { type SovereigntyCapabilityInvocation } from './invocation';
import { type SovereigntyCapabilityResult } from './result';
import { type SovereigntyCapabilityClock } from './time';
export interface InvokeSovereigntyCapabilityOptions {
    /**
     * Optional persistence/delivery for the invocation evidence.
     *
     * Typed as the existing Protocol-owned `AuditEventSink`
     * (`@aoc/protocol/adapters`) rather than a new port: it is
     * provider-neutral, Enterprise-independent and already the repository's
     * generic evidence egress. Reusing it means SM-03 adds no second logging
     * architecture, and it is imported as a type only, so nothing is added to
     * this subpath's runtime graph.
     *
     * Optional in the strong sense: with no sink the invocation still runs and
     * the result still carries the full portable evidence record. Protocol does
     * not require hosted infrastructure to be usable.
     */
    readonly evidenceSink?: AuditEventSink;
    /** Injectable time source; defaults to the system clock. */
    readonly clock?: SovereigntyCapabilityClock;
}
/**
 * invokeSovereigntyCapability — the common socket every canonical
 * Sovereignty Capability implementation plugs into.
 *
 * It knows *which* mineral, *which* version, *which* invocation and *what
 * outcome*, and deliberately nothing about what the mineral means. It makes
 * no governance decision: no policy is evaluated, no grant is issued or
 * checked, no access is authorized, no credential is brokered, nothing is
 * enforced, priced, metered or rate-limited. Those are AOC Enterprise
 * concerns and are absent by construction, not by convention.
 *
 * Implementations are passed in explicitly. There is no global mutable
 * implementation registry, because SM-01 deliberately made the canonical
 * mineral inventory read-only and a registration API here would undo that
 * from the other end.
 *
 * ## Three outcomes, three shapes
 *
 * 1. **Accepted and completed** — a `SovereigntyCapabilityResult`, either
 *    `succeeded` or `failed`, always carrying portable evidence. An expected
 *    capability failure is this, not an exception.
 * 2. **Rejected before execution** — throws with code
 *    `SOVEREIGNTY_CAPABILITY_INVOCATION_REJECTED` and no evidence. The
 *    invocation was never accepted, so claiming evidence that it "occurred"
 *    would be false, and the implementation is never called.
 * 3. **Implementation fault or evidence-delivery failure** — throws with
 *    code `SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR` or
 *    `SOVEREIGNTY_CAPABILITY_EVIDENCE_DELIVERY_FAILED`, carrying the
 *    sanitized evidence that was built. A thrown implementation is a bug,
 *    not a capability result, and is never quietly converted into one.
 *
 * The implementation is invoked at most once in every path.
 */
export declare function invokeSovereigntyCapability<TInput, TOutput>(invocation: SovereigntyCapabilityInvocation<TInput>, implementation: SovereigntyCapabilityImplementation<TInput, TOutput>, options?: InvokeSovereigntyCapabilityOptions): Promise<SovereigntyCapabilityResult<TOutput>>;
//# sourceMappingURL=invoke.d.ts.map