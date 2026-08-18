"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_EVIDENCE_EVENT_TYPES = void 0;
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
exports.PROTOCOLIZATION_EVIDENCE_EVENT_TYPES = Object.freeze({
    received: 'ProtocolizationEvidenceReceived',
});
