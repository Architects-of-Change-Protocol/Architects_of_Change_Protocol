import type {
  CanonicalClaimId,
  CanonicalEvidenceId,
  CanonicalPrincipalRef,
  ClaimType,
} from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';

import type { AssetRequirementId } from '../identifiers';
import type {
  ProtocolizationCaseId,
  ProtocolizationMaterialId,
  ProtocolizationProfileRef,
  ProtocolizationTenantId,
} from '../case/case-identifiers';
import type { DeclarationId } from './declaration-identifiers';

/**
 * The auditable fact the declaration layer produces.
 *
 * One event, because this slice performs one operation. There is no
 * `ProtocolizationClaimPrepared` alongside it: this package prepares no
 * `CanonicalClaim` (see `declaration-submission.ts`), so a second event named
 * for preparing one would describe something that never happens. And there is
 * no `DeclarationVerified`, `DeclarationApproved`, `ClaimProven`,
 * `OwnershipConfirmed`, `AuthorityConfirmed`, `ProfessionalAttested`,
 * `CaseReady` or `AssetProtocolized` — an event named for something that cannot
 * happen yet is a promise the code does not keep, and each of those names would
 * additionally assert a conclusion no part of this vertical is entitled to
 * reach.
 *
 * Read the name literally: *recorded*. Not believed, not accepted as true, not
 * counted toward anything.
 *
 * ### Why this is a separate union from APV-04's
 *
 * A successful declaration mutates the case through APV-04's own
 * `addProtocolizationCaseMaterial`, which emits its own
 * `ProtocolizationMaterialAdded` event. That event is returned unchanged
 * alongside this one. Widening `PROTOCOLIZATION_CASE_EVENT_TYPES` to carry
 * declaration concerns would have made a closed, reviewed union of case facts
 * grow a member that is not a case fact — so this slice declares its own union,
 * exactly as APV-05 did, and APV-04's stays as it was frozen.
 *
 * The two events describe the same instant from two layers: the case says
 * *material was associated*, this says *this participant asserted this
 * proposition and pointed at this evidence*. They share `occurredAt` and
 * `caseRevision`, which is what lets an audit reader join them without
 * inventing an ordering.
 *
 * ### Why the statement is not on the event
 *
 * The human-readable `statement` is deliberately absent. An event is a
 * notification that fans out to subscribers who may have no business reading
 * free text a participant typed, it is the one unstructured field in the slice,
 * and nothing downstream may derive machine meaning from it anyway — `claimType`
 * and `claimSubtype` carry the semantics. A reader who is entitled to the text
 * reads the record.
 *
 * Events are **outputs**, not the source of truth. The record is the record; a
 * dropped event loses a notification, never declaration history.
 */
export const PROTOCOLIZATION_DECLARATION_EVENT_TYPES = Object.freeze({
  recorded: 'ProtocolizationDeclarationRecorded',
} as const);

export type ProtocolizationDeclarationEventType =
  (typeof PROTOCOLIZATION_DECLARATION_EVENT_TYPES)[keyof typeof PROTOCOLIZATION_DECLARATION_EVENT_TYPES];

/** "A participant was recorded as asserting this proposition into this case." */
export interface ProtocolizationDeclarationRecordedEvent {
  readonly eventType: typeof PROTOCOLIZATION_DECLARATION_EVENT_TYPES.recorded;
  readonly declarationId: DeclarationId;
  readonly tenantId: ProtocolizationTenantId;
  readonly caseId: ProtocolizationCaseId;
  readonly profile: ProtocolizationProfileRef;
  /** Who declared. Never the tenant, and never a statement of their authority. */
  readonly declarant: CanonicalPrincipalRef;
  readonly claimType: ClaimType;
  readonly claimSubtype?: string;
  readonly claimRef: CanonicalClaimId;
  readonly materialId: ProtocolizationMaterialId;
  readonly requirementIds: readonly AssetRequirementId[];
  /** The evidence the declarant pointed at. Linkage, never support. */
  readonly supportingEvidenceRefs?: readonly CanonicalEvidenceId[];
  /** The recording instant. Identical to the case event's `occurredAt`. */
  readonly occurredAt: UtcDateTime;
  /** When the declarant says it was made, when one was supplied. Never invented. */
  readonly declaredAt?: UtcDateTime;
  /** The case revision this declaration produced. Identical to the case event's. */
  readonly caseRevision: number;
  readonly correlationId?: CanonicalId;
}

export type ProtocolizationDeclarationEvent = ProtocolizationDeclarationRecordedEvent;
