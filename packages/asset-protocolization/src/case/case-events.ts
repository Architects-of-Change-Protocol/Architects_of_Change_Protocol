import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { SovereignSubjectRef } from '@aoc/protocol/identity';

import type { AssetRequirementId } from '../identifiers';
import type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from './case-identifiers';
import type { ProtocolizationMaterialKind } from './case-material';

/**
 * The auditable facts a case operation produces.
 *
 * Protocolization is meant to be auditable, so every state change has to leave
 * a record of what happened, to which case, under which profile, and when. That
 * record is a typed vertical event rather than an `AuditEventEnvelope`: an
 * envelope needs an `eventId`, and minting one is a non-deterministic act this
 * package deliberately cannot perform (see `case-clock.ts` for the same
 * reasoning applied to timestamps). Projecting these events into
 * `AuditEventEnvelope` and handing them to an `AuditEventSink` is the job of the
 * layer that owns identifier minting and the sink — reuse-map row 17, APV-09.
 *
 * This is not a second audit framework. It is a closed union of five facts, one
 * per operation this slice actually performs. There is no speculative event for
 * a future slice: an event named for something that cannot happen yet would be
 * a promise the code does not keep.
 *
 * Events are **outputs**, not the source of truth. The aggregate is, and it
 * carries the timestamps that answer the audit questions on its own
 * (`createdAt`, `activatedAt`, `cancelledAt`, each material's `addedAt`). An
 * event that is dropped therefore loses a notification, never case history.
 */
export const PROTOCOLIZATION_CASE_EVENT_TYPES = Object.freeze({
  created: 'ProtocolizationCaseCreated',
  activated: 'ProtocolizationCaseActivated',
  materialAdded: 'ProtocolizationMaterialAdded',
  materialAssociated: 'ProtocolizationMaterialAssociated',
  cancelled: 'ProtocolizationCaseCancelled',
} as const);

export type ProtocolizationCaseEventType =
  (typeof PROTOCOLIZATION_CASE_EVENT_TYPES)[keyof typeof PROTOCOLIZATION_CASE_EVENT_TYPES];

/**
 * Correlation data every event carries, and no more. Large domain objects stay
 * out: an event names the case, and a reader who needs the case reads the case.
 */
interface ProtocolizationCaseEventBase {
  readonly eventType: ProtocolizationCaseEventType;
  readonly caseId: ProtocolizationCaseId;
  readonly tenantId: ProtocolizationTenantId;
  readonly profile: ProtocolizationProfileRef;
  /** The case's revision *after* this event. Orders events within one case. */
  readonly caseRevision: number;
  readonly occurredAt: UtcDateTime;
  readonly correlationId?: CanonicalId;
}

export interface ProtocolizationCaseCreatedEvent extends ProtocolizationCaseEventBase {
  readonly eventType: typeof PROTOCOLIZATION_CASE_EVENT_TYPES.created;
  /**
   * Which subject the case was opened about. Carried because "which subject"
   * is unanswerable from a case id alone, and because a `SovereignSubjectRef`
   * is two opaque fields rather than a domain object.
   */
  readonly subjectRef: SovereignSubjectRef;
  /** The requirements projected from the pinned profile at creation. */
  readonly requirementIds: readonly AssetRequirementId[];
}

export interface ProtocolizationCaseActivatedEvent extends ProtocolizationCaseEventBase {
  readonly eventType: typeof PROTOCOLIZATION_CASE_EVENT_TYPES.activated;
}

export interface ProtocolizationMaterialAddedEvent extends ProtocolizationCaseEventBase {
  readonly eventType: typeof PROTOCOLIZATION_CASE_EVENT_TYPES.materialAdded;
  readonly materialId: ProtocolizationMaterialId;
  readonly materialKind: ProtocolizationMaterialKind;
  /** The requirements the material was correlated to when it was added. */
  readonly requirementIds: readonly AssetRequirementId[];
}

export interface ProtocolizationMaterialAssociatedEvent extends ProtocolizationCaseEventBase {
  readonly eventType: typeof PROTOCOLIZATION_CASE_EVENT_TYPES.materialAssociated;
  readonly materialId: ProtocolizationMaterialId;
  /** Only the requirements added by this operation, not the material's full set. */
  readonly requirementIds: readonly AssetRequirementId[];
}

export interface ProtocolizationCaseCancelledEvent extends ProtocolizationCaseEventBase {
  readonly eventType: typeof PROTOCOLIZATION_CASE_EVENT_TYPES.cancelled;
  /** Presentation only; nothing downstream may branch on it. */
  readonly reason?: string;
}

export type ProtocolizationCaseEvent =
  | ProtocolizationCaseCreatedEvent
  | ProtocolizationCaseActivatedEvent
  | ProtocolizationMaterialAddedEvent
  | ProtocolizationMaterialAssociatedEvent
  | ProtocolizationCaseCancelledEvent;
