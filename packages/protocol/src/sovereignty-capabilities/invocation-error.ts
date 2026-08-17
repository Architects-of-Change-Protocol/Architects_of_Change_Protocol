import type { ProtocolError } from '../errors';
import type { SovereigntyCapabilityRef } from './capability-ref';
import type { SovereigntyCapabilityInvocationEvidenceV1 } from './evidence';
import type { SovereigntyCapabilityInvocationId } from './invocation-id';

/**
 * The closed set of ways a call to `invokeSovereigntyCapability` can fail
 * *as a call*, as opposed to the capability failing as a capability.
 *
 * An expected capability failure is never one of these — it comes back as an
 * ordinary `status: 'failed'` result with failed evidence. These three are
 * reserved for situations where returning a result would be a lie.
 */
export const SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES = Object.freeze({
  /** Metadata was rejected before the implementation was called. No evidence: the invocation was never accepted. */
  rejected: 'SOVEREIGNTY_CAPABILITY_INVOCATION_REJECTED',
  /** The implementation threw, or returned something that is not a valid outcome. A bug, not a result. */
  implementationError: 'SOVEREIGNTY_CAPABILITY_IMPLEMENTATION_ERROR',
  /** An explicitly configured evidence sink did not accept the record. */
  evidenceDeliveryFailed: 'SOVEREIGNTY_CAPABILITY_EVIDENCE_DELIVERY_FAILED',
} as const);

export type SovereigntyCapabilityInvocationErrorCode =
  (typeof SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES)[keyof typeof SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES];

/**
 * Declared as a type alias rather than an interface deliberately: TypeScript
 * only infers an implicit index signature for the former, and without one
 * this would not satisfy `ProtocolError.details`
 * (`Readonly<Record<string, unknown>>`).
 */
export type SovereigntyCapabilityInvocationErrorDetails = {
  readonly reasonCodes: readonly string[];
  readonly invocationId?: SovereigntyCapabilityInvocationId;
  readonly capability?: SovereigntyCapabilityRef;
  /**
   * Whether an explicitly configured sink accepted the evidence. `false`
   * both when delivery was attempted and failed and when there was nothing
   * to deliver; `undefined` when no sink was configured at all.
   */
  readonly evidenceDelivered?: boolean;
};

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
export class SovereigntyCapabilityInvocationError extends Error implements ProtocolError {
  readonly code: SovereigntyCapabilityInvocationErrorCode;

  readonly details: SovereigntyCapabilityInvocationErrorDetails;

  /** Sanitized failure evidence, when the invocation got far enough to have any. */
  readonly evidence?: SovereigntyCapabilityInvocationEvidenceV1;

  constructor(
    code: SovereigntyCapabilityInvocationErrorCode,
    details: SovereigntyCapabilityInvocationErrorDetails,
    options?: { readonly cause?: unknown; readonly evidence?: SovereigntyCapabilityInvocationEvidenceV1 },
  ) {
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
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export function isSovereigntyCapabilityInvocationError(
  value: unknown,
): value is SovereigntyCapabilityInvocationError {
  return value instanceof SovereigntyCapabilityInvocationError;
}
