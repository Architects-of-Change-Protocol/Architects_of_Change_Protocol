"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE = exports.SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION = void 0;
exports.isValidSovereigntyCapabilityInvocationEvidence = isValidSovereigntyCapabilityInvocationEvidence;
exports.toSovereigntyCapabilityInvocationAuditEvent = toSovereigntyCapabilityInvocationAuditEvent;
const identity_1 = require("../identity");
const capability_ref_1 = require("./capability-ref");
const invocation_id_1 = require("./invocation-id");
const time_1 = require("./time");
exports.SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION = 'aoc-sovereignty-capability-invocation-evidence/1';
/**
 * Canonical `AuditEventEnvelope.eventType` for a completed capability
 * invocation. Stable and machine-readable — the attribution a consumer reads
 * comes from `capability`, never from this string.
 */
exports.SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE = 'aoc.sovereignty-capability.invocation.completed';
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isNonBlankStringArray(value) {
    return (Array.isArray(value)
        && value.length > 0
        && value.every((entry) => typeof entry === 'string' && entry.trim() !== ''));
}
function isValidSovereigntyCapabilityInvocationEvidence(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    const candidate = value;
    if (candidate.schemaVersion !== exports.SOVEREIGNTY_CAPABILITY_INVOCATION_EVIDENCE_SCHEMA_VERSION)
        return false;
    if (!(0, invocation_id_1.isValidSovereigntyCapabilityInvocationId)(candidate.invocationId))
        return false;
    if (!(0, capability_ref_1.isValidSovereigntyCapabilityRef)(candidate.capability))
        return false;
    if (!(0, time_1.isUtcTimestamp)(candidate.requestedAt) || !(0, time_1.isUtcTimestamp)(candidate.completedAt))
        return false;
    if (candidate.outcome !== 'succeeded' && candidate.outcome !== 'failed')
        return false;
    if (hasOwn(candidate, 'correlationId')) {
        if (typeof candidate.correlationId !== 'string' || candidate.correlationId.trim() === '')
            return false;
    }
    if (hasOwn(candidate, 'subject') && !(0, identity_1.isValidSovereignSubjectRef)(candidate.subject))
        return false;
    if (hasOwn(candidate, 'reasonCodes') && !isNonBlankStringArray(candidate.reasonCodes))
        return false;
    if (hasOwn(candidate, 'evidenceRefs') && !isNonBlankStringArray(candidate.evidenceRefs))
        return false;
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
function toSovereigntyCapabilityInvocationAuditEvent(evidence) {
    return {
        eventId: evidence.invocationId,
        eventType: exports.SOVEREIGNTY_CAPABILITY_INVOCATION_EVENT_TYPE,
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
