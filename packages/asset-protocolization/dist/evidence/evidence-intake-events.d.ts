import type { CanonicalEvidenceId } from '@aoc/protocol/claims';
import type { CanonicalId, UtcDateTime } from '@aoc/protocol/contracts';
import type { AssetRequirementId } from '../identifiers';
import type { ProtocolizationCaseId, ProtocolizationMaterialId, ProtocolizationProfileRef, ProtocolizationTenantId } from '../case/case-identifiers';
import type { EvidenceIntakeCategoryId, EvidenceIntakeId } from './evidence-intake-identifiers';
/**
 * The auditable fact evidence intake produces.
 *
 * One event, because this slice performs one operation. There is no
 * `EvidenceVerified`, `EvidenceApproved`, `RegistryConfirmed`, `ClaimProven`,
 * `OwnershipEstablished`, `ProfessionalApproved`, `CaseReady` or
 * `AssetProtocolized` — an event named for something that cannot happen yet is
 * a promise the code does not keep, and each of those names would additionally
 * assert a conclusion no part of this vertical is entitled to reach.
 *
 * ### Why this is a separate union from APV-04's
 *
 * A successful intake mutates the case through APV-04's own
 * `addProtocolizationCaseMaterial`, which emits its own
 * `ProtocolizationMaterialAdded` event. That event is returned unchanged
 * alongside this one. Widening `PROTOCOLIZATION_CASE_EVENT_TYPES` to carry
 * intake concerns would have made a closed, reviewed union of case facts grow a
 * member that is not a case fact — so APV-05 declares its own union instead and
 * APV-04's stays exactly as it was frozen.
 *
 * The two events describe the same instant from two layers: the case says
 * *material was associated*, intake says *evidence was received through this
 * pathway from this source*. They share `occurredAt` and `caseRevision`, which
 * is what lets an audit reader join them without inventing an ordering.
 *
 * Events are **outputs**, not the source of truth. The receipt is the record;
 * a dropped event loses a notification, never intake history.
 */
export declare const PROTOCOLIZATION_EVIDENCE_EVENT_TYPES: Readonly<{
    readonly received: "ProtocolizationEvidenceReceived";
}>;
export type ProtocolizationEvidenceEventType = (typeof PROTOCOLIZATION_EVIDENCE_EVENT_TYPES)[keyof typeof PROTOCOLIZATION_EVIDENCE_EVENT_TYPES];
/**
 * "Evidence was structurally accepted into this case."
 *
 * Read the name literally: *received*. Not checked, not accepted as true, not
 * counted toward anything.
 */
export interface ProtocolizationEvidenceReceivedEvent {
    readonly eventType: typeof PROTOCOLIZATION_EVIDENCE_EVENT_TYPES.received;
    readonly intakeId: EvidenceIntakeId;
    readonly tenantId: ProtocolizationTenantId;
    readonly caseId: ProtocolizationCaseId;
    readonly profile: ProtocolizationProfileRef;
    readonly categoryId: EvidenceIntakeCategoryId;
    readonly evidenceRef: CanonicalEvidenceId;
    readonly materialId: ProtocolizationMaterialId;
    readonly requirementIds: readonly AssetRequirementId[];
    /** The intake instant. Identical to the case event's `occurredAt`. */
    readonly occurredAt: UtcDateTime;
    /** The source observation instant, when one was supplied. Never invented. */
    readonly observedAt?: UtcDateTime;
    /** The case revision this intake produced. Identical to the case event's. */
    readonly caseRevision: number;
    readonly correlationId?: CanonicalId;
}
export type ProtocolizationEvidenceEvent = ProtocolizationEvidenceReceivedEvent;
//# sourceMappingURL=evidence-intake-events.d.ts.map