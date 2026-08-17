import type { UtcDateTime } from '../contracts';
import { isValidSovereignSubjectRef, type SovereignSubjectRef } from '../identity';
import { isValidSovereigntyCapabilityRef, type SovereigntyCapabilityRef } from './capability-ref';
import {
  isValidSovereigntyCapabilityInvocationId,
  mintSovereigntyCapabilityInvocationId,
  type SovereigntyCapabilityInvocationId,
} from './invocation-id';
import { isUtcTimestamp, toUtcTimestamp } from './time';

/**
 * Version of the *invocation envelope* contract — not of any capability.
 * Bumping a capability's `SovereigntyCapabilityVersion` says its semantics
 * changed; bumping this says the shape of the envelope carrying it changed.
 */
export const SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION = 'aoc-sovereignty-capability-invocation/1' as const;

export type SovereigntyCapabilityInvocationSchemaVersion =
  typeof SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION;

/**
 * SovereigntyCapabilityInvocation — "what was requested".
 *
 * The common half of every capability consumption: which capability, at
 * which version, under which invocation identity, optionally correlated with
 * a wider operation, optionally about a sovereign subject. `input` is the
 * capability-specific half and Protocol knows nothing about it.
 *
 * ## `subject` is optional, and that is load-bearing
 *
 * Requiring a `SovereignSubjectRef` here would make two of the eight
 * canonical capabilities impossible to express:
 *
 * - **Identity** may *create* the first `SovereignAssetId` for a thing. Before
 *   it runs there is, by construction, no subject to name — only an external
 *   reference. The subject is an output, not a precondition.
 * - **Integrity** must stay independently usable over bytes or state material
 *   that no sovereign identity has ever been minted for.
 *
 * So the common layer permits a subject and never demands one. Whether a
 * particular capability requires, ignores, returns or creates a subject is a
 * capability-specific rule, declared and enforced by its own implementation.
 *
 * ## `input` is a runtime value, not canonical JSON
 *
 * `TInput` is never canonicalized, hashed, frozen, copied or inspected by
 * this layer, and it never reaches portable evidence. A `Uint8Array`, a
 * stream handle, a class instance or a value `aoc-canonical-json/1` would
 * refuse outright are all legitimate capability inputs. The invocation
 * object is an in-process API contract; the *evidence* is the portable
 * artifact, and it describes the invocation rather than duplicating its
 * payload.
 */
export interface SovereigntyCapabilityInvocation<TInput> {
  readonly schemaVersion: SovereigntyCapabilityInvocationSchemaVersion;
  readonly invocationId: SovereigntyCapabilityInvocationId;
  readonly capability: SovereigntyCapabilityRef;
  readonly requestedAt: UtcDateTime;
  /**
   * Optional opaque grouping key for several invocations belonging to one
   * larger operation (an Identity mint followed by an Integrity commitment,
   * say). Protocol propagates it exactly and interprets nothing: it implies
   * no ordering, no causality, no dependency and no workflow. It is not an
   * invocation id, and it is never generated automatically — an absent
   * correlation is a truthful statement that the caller did not correlate.
   */
  readonly correlationId?: string;
  readonly subject?: SovereignSubjectRef;
  readonly input: TInput;
}

export interface SovereigntyCapabilityInvocationValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly string[];
}

export interface BuildSovereigntyCapabilityInvocationInput<TInput> {
  readonly capability: SovereigntyCapabilityRef;
  readonly input: TInput;
  readonly invocationId?: SovereigntyCapabilityInvocationId;
  readonly requestedAt?: UtcDateTime;
  readonly correlationId?: string;
  readonly subject?: SovereignSubjectRef;
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/** Matches the `trim()`-based emptiness rule used by `SovereignExternalReference`. */
function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Validates the invocation *envelope* only.
 *
 * `input` is checked for presence and nothing else — no type constraint, no
 * canonicalization, no size limit — because the common layer does not own it.
 * A present-but-`undefined` optional field is rejected rather than accepted,
 * matching `validateSovereignExternalReference`: an absent optional must be
 * structurally omitted so anything derived from it stays canonicalizable.
 */
export function validateSovereigntyCapabilityInvocation(
  value: unknown,
): SovereigntyCapabilityInvocationValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { valid: false, reasons: ['INVALID_INVOCATION_STRUCTURE'] };
  }

  const reasons: string[] = [];
  const candidate = value as Partial<SovereigntyCapabilityInvocation<unknown>>;

  if (candidate.schemaVersion !== SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION) {
    reasons.push('INVALID_INVOCATION_SCHEMA_VERSION');
  }

  if (!isValidSovereigntyCapabilityInvocationId(candidate.invocationId)) {
    reasons.push('INVALID_INVOCATION_ID');
  }

  if (!isValidSovereigntyCapabilityRef(candidate.capability)) {
    reasons.push('INVALID_INVOCATION_CAPABILITY_REF');
  }

  if (!isUtcTimestamp(candidate.requestedAt)) {
    reasons.push('INVALID_INVOCATION_REQUESTED_AT');
  }

  if (hasOwn(candidate, 'correlationId') && !isNonBlankString(candidate.correlationId)) {
    reasons.push('INVALID_INVOCATION_CORRELATION_ID');
  }

  if (hasOwn(candidate, 'subject') && !isValidSovereignSubjectRef(candidate.subject)) {
    reasons.push('INVALID_INVOCATION_SUBJECT');
  }

  if (!hasOwn(candidate, 'input')) {
    reasons.push('MISSING_INVOCATION_INPUT');
  }

  return { valid: reasons.length === 0, reasons };
}

export function isValidSovereigntyCapabilityInvocation(
  value: unknown,
): value is SovereigntyCapabilityInvocation<unknown> {
  return validateSovereigntyCapabilityInvocation(value).valid;
}

/**
 * Builds and validates an invocation envelope, minting an invocation id and
 * stamping `requestedAt` when they were not supplied. Absent optional fields
 * are omitted structurally, never emitted as `undefined`. Throws rather than
 * repairing malformed input — a construction helper, not a lenient parser.
 */
export function buildSovereigntyCapabilityInvocation<TInput>(
  input: BuildSovereigntyCapabilityInvocationInput<TInput>,
  now: Date = new Date(),
): SovereigntyCapabilityInvocation<TInput> {
  const invocation: SovereigntyCapabilityInvocation<TInput> = {
    schemaVersion: SOVEREIGNTY_CAPABILITY_INVOCATION_SCHEMA_VERSION,
    invocationId: input.invocationId ?? mintSovereigntyCapabilityInvocationId(),
    capability: input.capability,
    requestedAt: input.requestedAt ?? toUtcTimestamp(now),
    ...(input.correlationId === undefined ? {} : { correlationId: input.correlationId }),
    ...(input.subject === undefined ? {} : { subject: input.subject }),
    input: input.input,
  };

  const validation = validateSovereigntyCapabilityInvocation(invocation);
  if (!validation.valid) {
    throw new Error(`Invalid SovereigntyCapabilityInvocation: ${validation.reasons.join(', ')}`);
  }

  return invocation;
}
