"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOLIZATION_CASE_EVENT_TYPES = void 0;
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
exports.PROTOCOLIZATION_CASE_EVENT_TYPES = Object.freeze({
    created: 'ProtocolizationCaseCreated',
    activated: 'ProtocolizationCaseActivated',
    materialAdded: 'ProtocolizationMaterialAdded',
    materialAssociated: 'ProtocolizationMaterialAssociated',
    cancelled: 'ProtocolizationCaseCancelled',
});
