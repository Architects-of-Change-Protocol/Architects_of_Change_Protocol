"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAssuranceEventSink = void 0;
class InMemoryAssuranceEventSink {
    constructor() {
        this.observations = [];
    }
    recordAuditEvent(event, context) {
        this.recordObservation(event, context);
    }
    recordSecurityEvent(event, context) {
        this.recordObservation(event, context);
    }
    emitProtocolEvent(event, context) {
        this.recordObservation(event, context);
    }
    recordObservation(event, _context) {
        this.observations.push({ ...event, payload: event.payload === undefined ? undefined : { ...event.payload } });
    }
    listObservations() {
        return this.observations.map((event) => ({
            ...event,
            payload: event.payload === undefined ? undefined : { ...event.payload },
        }));
    }
}
exports.InMemoryAssuranceEventSink = InMemoryAssuranceEventSink;
