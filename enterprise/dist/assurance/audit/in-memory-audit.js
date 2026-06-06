"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeAuditService = exports.InMemoryAuditEventSink = exports.InMemoryAuditService = void 0;
const DEFAULT_MAX_AUDIT_EVENTS = 10000;
const cloneLegacyEvent = (event) => ({
    ...event,
    metadata: event.metadata === undefined ? undefined : { ...event.metadata },
});
class InMemoryAuditService {
    constructor(maxEvents = DEFAULT_MAX_AUDIT_EVENTS) {
        this.events = [];
        this.maxEvents = Number.isFinite(maxEvents) && maxEvents > 0 ? Math.floor(maxEvents) : DEFAULT_MAX_AUDIT_EVENTS;
    }
    recordEvent(event) {
        this.events.push(cloneLegacyEvent(event));
        while (this.events.length > this.maxEvents)
            this.events.shift();
    }
    listEvents(query = {}) {
        return this.events
            .filter((event) => this.matchesQuery(event, query))
            .slice()
            .sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at))
            .map((event) => cloneLegacyEvent(event));
    }
    matchesQuery(event, query) {
        if (query.event_type !== undefined && event.event_type !== query.event_type)
            return false;
        if (query.subject_id !== undefined && event.subject_id !== query.subject_id)
            return false;
        if (query.requester_id !== undefined && event.requester_id !== query.requester_id)
            return false;
        if (query.consent_id !== undefined && event.consent_id !== query.consent_id)
            return false;
        if (query.capability_id !== undefined && event.capability_id !== query.capability_id)
            return false;
        const occurredAt = Date.parse(event.occurred_at);
        if (query.from !== undefined && occurredAt < query.from.getTime())
            return false;
        if (query.to !== undefined && occurredAt > query.to.getTime())
            return false;
        return true;
    }
}
exports.InMemoryAuditService = InMemoryAuditService;
class InMemoryAuditEventSink {
    constructor(maxEvents = DEFAULT_MAX_AUDIT_EVENTS) {
        this.maxEvents = maxEvents;
        this.events = [];
    }
    recordAuditEvent(event, _context) {
        this.events.push({ ...event, payload: { ...event.payload } });
        while (this.events.length > this.maxEvents)
            this.events.shift();
    }
    listAuditEvents() {
        return this.events.map((event) => ({ ...event, payload: { ...event.payload } }));
    }
}
exports.InMemoryAuditEventSink = InMemoryAuditEventSink;
class RuntimeAuditService {
    constructor(sources) {
        this.sources = sources;
    }
    listEvents(input) {
        return this.sources
            .flatMap((source) => [...source.getAuditEvents()])
            .filter((event) => this.matchesFilters(event, input))
            .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    }
    matchesFilters(event, input) {
        if (input.subject_hash !== undefined && event.subject_hash !== input.subject_hash)
            return false;
        if (input.consumer_id !== undefined && event.consumer_id !== input.consumer_id)
            return false;
        if (input.event_type !== undefined && event.event_type !== input.event_type)
            return false;
        const eventAt = Date.parse(event.at);
        if (input.from !== undefined && eventAt < input.from.getTime())
            return false;
        if (input.to !== undefined && eventAt > input.to.getTime())
            return false;
        return true;
    }
}
exports.RuntimeAuditService = RuntimeAuditService;
