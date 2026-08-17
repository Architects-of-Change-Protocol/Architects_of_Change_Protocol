"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SovereigntyCapabilityInvocationError = exports.SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES = void 0;
exports.isSovereigntyCapabilityInvocationError = isSovereigntyCapabilityInvocationError;
/**
 * The closed set of ways a call to `invokeSovereigntyCapability` can fail
 * *as a call*, as opposed to the capability failing as a capability.
 *
 * An expected capability failure is never one of these — it comes back as an
 * ordinary `status: 'failed'` result with failed evidence. These three are
 * reserved for situations where returning a result would be a lie.
 */
exports.SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES = Object.freeze({
    /** Metadata was rejected before the implementation was called. No evidence: the invocation was never accepted. */
    rejected: 'SOVEREIGNTY_CAPABILITY_INVOCATION_REJECTED',
    /** The implementation threw, or returned something that is not a valid outcome. A bug, not a result. */
    implementationError: 'SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR',
    /** An explicitly configured evidence sink did not accept the record. */
    evidenceDeliveryFailed: 'SOVEREIGNTY_CAPABILITY_EVIDENCE_DELIVERY_FAILED',
});
/**
 * Typed, sanitized invocation execution error.
 *
 * Structurally a `ProtocolError` (`code` + `message` + `details`), so it
 * reads the same as every other Protocol error while remaining a real
 * `Error` that a caller can `throw`/`catch` and that keeps a JS stack for
 * local debugging.
 *
 * The distinction that matters: the stack, the `message` and `cause` are
 * *runtime debugging aids and never portable evidence*. `evidence`, when
 * present, is the sanitized record built for the invocation — it carries
 * stable reason codes only, and no part of the underlying exception reaches
 * it. Nothing here is retried: the implementation ran at most once, and it
 * is never re-run to satisfy evidence delivery.
 */
class SovereigntyCapabilityInvocationError extends Error {
    constructor(code, details, options) {
        super(`${code}: ${details.reasonCodes.join(', ')}`);
        this.name = 'SovereigntyCapabilityInvocationError';
        this.code = code;
        this.details = Object.freeze({
            ...details,
            reasonCodes: Object.freeze([...details.reasonCodes]),
        });
        if (options?.evidence !== undefined) {
            this.evidence = options.evidence;
        }
        if (options !== undefined && 'cause' in options) {
            this.cause = options.cause;
        }
    }
}
exports.SovereigntyCapabilityInvocationError = SovereigntyCapabilityInvocationError;
function isSovereigntyCapabilityInvocationError(value) {
    return value instanceof SovereigntyCapabilityInvocationError;
}
