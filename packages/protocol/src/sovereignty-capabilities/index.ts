export {
  SOVEREIGNTY_CAPABILITY_IDS,
  SOVEREIGNTY_CAPABILITY_KEYS,
  SOVEREIGNTY_CAPABILITY_NAMESPACE,
  isSovereigntyCapabilityId,
  isSovereigntyCapabilityKey,
} from './ids';
export type {
  SovereigntyCapabilityId,
  SovereigntyCapabilityKey,
  SovereigntyCapabilityNamespace,
} from './ids';

export type { SovereigntyCapabilityDefinition } from './types';

export { isSovereigntyCapabilityVersion } from './version';
export type { SovereigntyCapabilityVersion } from './version';

export { SOVEREIGNTY_CAPABILITIES } from './definitions';

export {
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  listSovereigntyCapabilities,
} from './registry';

// --- SM-03: common capability invocation & evidence spine -------------------

export {
  getSovereigntyCapabilityRef,
  getSovereigntyCapabilityRefByKey,
  isValidSovereigntyCapabilityRef,
  sovereigntyCapabilityRefsEqual,
  toSovereigntyCapabilityRef,
} from './capability-ref';
export type { SovereigntyCapabilityRef } from './capability-ref';

export {
  isValidSovereigntyCapabilityInvocationId,
  mintSovereigntyCapabilityInvocationId,
} from './invocation-id';
export type { SovereigntyCapabilityInvocationId } from './invocation-id';

export {
  SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION,
  buildSovereigntyCapabilityInvocation,
  isValidSovereigntyCapabilityInvocation,
  validateSovereigntyCapabilityInvocation,
} from './invocation';
export type {
  BuildSovereigntyCapabilityInvocationInput,
  SovereigntyCapabilityInvocation,
  SovereigntyCapabilityInvocationSchemaVersion,
  SovereigntyCapabilityInvocationValidationResult,
} from './invocation';

export { isValidSovereigntyCapabilityExecutionOutcome } from './implementation';
export type {
  SovereigntyCapabilityExecutionOutcome,
  SovereigntyCapabilityFailureOutcome,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilitySuccessOutcome,
} from './implementation';

export {
  SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE,
  SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION,
  isValidSovereigntyCapabilityInvocationEvidence,
  toSovereigntyCapabilityInvocationAuditEvent,
} from './evidence';
export type {
  SovereigntyCapabilityInvocationEvidenceSchemaVersion,
  SovereigntyCapabilityInvocationEvidenceV1,
  SovereigntyCapabilityInvocationOutcomeStatus,
} from './evidence';

export {
  SOVEREIGNTY_CAPABILITY_RESULT_SCHEMA_VERSION,
  resolveSovereigntyCapabilitySubject,
} from './result';
export type {
  SovereigntyCapabilityFailureResult,
  SovereigntyCapabilityResult,
  SovereigntyCapabilityResultSchemaVersion,
  SovereigntyCapabilitySuccessResult,
} from './result';

export {
  SOVEREIGNTY_CAPABILITY_INVOCATION_ERROR_CODES,
  SovereigntyCapabilityInvocationError,
  isSovereigntyCapabilityInvocationError,
} from './invocation-error';
export type {
  SovereigntyCapabilityInvocationErrorCode,
  SovereigntyCapabilityInvocationErrorDetails,
} from './invocation-error';

export { invokeSovereigntyCapability } from './invoke';
export type { InvokeSovereigntyCapabilityOptions } from './invoke';

export type { SovereigntyCapabilityClock } from './time';

/**
 * Re-exported for consumer ergonomics: an implementation returning
 * `evidenceRefs`, and anything reading them off an evidence record, needs
 * this type without also depending on `@aoc/protocol/claims`. It is the same
 * Protocol-owned evidence reference the repository already uses for
 * `AuthorityClaim.evidenceRefs` — a re-export, not a second definition.
 */
export type { CanonicalEvidenceId } from '../claims/primitives';
