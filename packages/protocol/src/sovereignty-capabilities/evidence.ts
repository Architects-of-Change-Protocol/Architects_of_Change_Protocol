import type { CanonicalEvidenceId } from '../claims/primitives';
import type { AuditEventEnvelope, UtcDateTime } from '../contracts';
import { isValidSovereignSubjectRef, type SovereignSubjectRef } from '../identity';
import { isValidSovereigntyCapabilityRef, type SovereigntyCapabilityRef } from './capability-ref';
import {
  isValidSovereigntyCapabilityInvocationId,
  type SovereigntyCapabilityInvocationId,
} from './invocation-id';
import { isUtcTimestamp } from './time';

export const SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION =
  'aoc-sovereignty-capability-invocation-evidence/1' as const;

export type SovereigntyCapabilityInvocationEvidenceSchemaVersion =
  typeof SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION;

/**
 * Canonical `AuditEventEnvelope.eventType` for a completed capability
 * invocation. Stable and machine-readable — the attribution a consumer reads
 * comes from `capability`, never from this string.
 */
export const SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE =
  'aoc.sovereignty-capability.invocation.completed' as const;

export type SovereigntyCapabilityInvocationOutcomeStatus = 'succeeded' | 'failed';

/**
 * SovereigntyCapabilityInvocationEvidenceV1 — "what portable record states
 * that this invocation occurred, and what it produced".
 *
 * ## What it proves
 *
 * Exactly one thing: *this Protocol record states that capability `id` at
 * version `version` ran under invocation `invocationId` between `requestedAt`
 * and `completedAt` and reported `outcome`.* Attribution is readable from the
 * record alone — no handler class name, file path, frontend copy, permission
 * token or Enterprise workflow is needed to know which of the canonical eight
 * was consumed.
 *
 * ## What it does NOT prove
 *
 * It is a *statement*, not an attestation. Unsigned invocation evidence is
 * not cryptographic proof and must never be described as such. It does not
 * establish that the implementation was trustworthy or correct, that the
 * subject exists outside AOC, that any claim it made is true, that ownership
 * exists, or that a provider behaved. Verifiability (SM-later) is what
 * strengthens evidence where strengthening is warranted.
 *
 * ## What it deliberately does not contain
 *
 * Never `input`, never `output`, never bytes, never provider credentials or
 * tokens, never key material, never exception messages, never stack traces.
 * This is a privacy and portability invariant, not a size optimisation:
 * inputs may be binary or non-canonicalizable, outputs may be confidential,
 * and evidence has to stay small enough and safe enough to hand to someone
 * who is not entitled to the payload. Capability-specific artifacts are
 * referenced through `evidenceRefs`, never inlined.
 *
 * Every field is JSON-safe and canonicalizes under `aoc-canonical-json/1`;
 * absent optional fields are omitted structurally rather than serialized as
 * `undefined`, which that profile refuses outright.
 */
export interface SovereigntyCapabilityInvocationEvidenceV1 {
  readonly schemaVersion: SovereigntyCapabilityInvocationEvidenceSchemaVersion;
  readonly invocationId: SovereigntyCapabilityInvocationId;
  readonly capability: SovereigntyCapabilityRef;
  readonly requestedAt: UtcDateTime;
  readonly completedAt: UtcDateTime;
  readonly outcome: SovereigntyCapabilityInvocationOutcomeStatus;
  readonly correlationId?: string;
  readonly subject?: SovereignSubjectRef;
  /** Present for a failed outcome; the implementation's stable codes, verbatim. */
  readonly reasonCodes?: readonly string[];
  /** Pointers to capability-specific artifacts. Never the artifacts themselves. */
  readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isNonBlankStringArray(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value)
    && value.length > 0
    && value.every((entry) => typeof entry === 'string' && entry.trim() !== '')
  );
}

export function isValidSovereigntyCapabilityInvocationEvidence(
  value: unknown,
): value is SovereigntyCapabilityInvocationEvidenceV1 {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Partial<SovereigntyCapabilityInvocationEvidenceV1>;

  if (candidate.schemaVersion !== SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION) return false;
  if (!isValidSovereigntyCapabilityInvocationId(candidate.invocationId)) return false;
  if (!isValidSovereigntyCapabilityRef(candidate.capability)) return false;
  if (!isUtcTimestamp(candidate.requestedAt) || !isUtcTimestamp(candidate.completedAt)) return false;
  if (candidate.outcome !== 'succeeded' && candidate.outcome !== 'failed') return false;

  if (hasOwn(candidate, 'correlationId')) {
    if (typeof candidate.correlationId !== 'string' || candidate.correlationId.trim() === '') return false;
  }
  if (hasOwn(candidate, 'subject') && !isValidSovereignSubjectRef(candidate.subject)) return false;
  if (hasOwn(candidate, 'reasonCodes') && !isNonBlankStringArray(candidate.reasonCodes)) return false;
  if (hasOwn(candidate, 'evidenceRefs') && !isNonBlankStringArray(candidate.evidenceRefs)) return false;

  return true;
}

/**
 * Maps invocation evidence onto the Protocol's existing generic audit
 * envelope so a configured sink receives it in the shape it already speaks.
 *
 * `AuditEventSink` / `AuditEventEnvelope` (`@aoc/protocol/adapters` and
 * `@aoc/protocol/contracts`) were reused rather than reimplemented: they are
 * Protocol-owned, provider-neutral, Enterprise-independent and generic. This
 * work package therefore introduces no second logging or persistence
 * architecture; both are imported as types only, so nothing is added to this
 * subpath's runtime graph.
 *
 * The envelope's own fields are routing/indexing metadata; the authoritative
 * record is `payload.evidence`, carried whole and unmodified. `eventId` is
 * the invocation id because the contract is exactly one evidence record per
 * accepted completed invocation — which also makes delivery idempotent for a
 * sink that de-duplicates by event id. `actorId` is deliberately never set:
 * Protocol does not know who requested an invocation, and inventing an actor
 * would be an Enterprise governance claim this layer has no basis for.
 */
export function toSovereigntyCapabilityInvocationAuditEvent(
  evidence: SovereigntyCapabilityInvocationEvidenceV1,
): AuditEventEnvelope {
  return {
    eventId: evidence.invocationId,
    eventType: SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE,
    emittedAt: evidence.completedAt,
    occurredAt: evidence.requestedAt,
    ...(evidence.subject === undefined
      ? {}
      : { subject: { kind: 'aoc:sovereign-asset', id: evidence.subject.sovereignAssetId } }),
    ...(evidence.correlationId === undefined ? {} : { correlationId: evidence.correlationId }),
    ...(evidence.reasonCodes === undefined ? {} : { reasonCodes: evidence.reasonCodes }),
    payload: { evidence },
    schemaVersion: evidence.schemaVersion,
  };
}
