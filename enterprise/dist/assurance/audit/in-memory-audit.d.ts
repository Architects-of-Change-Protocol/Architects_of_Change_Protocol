import type { AdapterLookupContext, AuditEventSink } from '@aoc/protocol/adapters';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
export declare const LEGACY_AUDIT_EVENT_TYPES: readonly ["CONSENT_EVALUATED", "CAPABILITY_ISSUED", "CAPABILITY_VALIDATED", "CAPABILITY_AUTHORIZED", "CAPABILITY_DENIED"];
export type LegacyAuditEventType = (typeof LEGACY_AUDIT_EVENT_TYPES)[number];
export interface LegacyAuditEvent {
    readonly event_id: string;
    readonly event_type: string;
    readonly occurred_at: string;
    readonly allowed?: boolean;
    readonly reason_code?: string;
    readonly subject_id?: string;
    readonly requester_id?: string;
    readonly resource?: string;
    readonly action?: string;
    readonly consent_id?: string | null;
    readonly capability_id?: string | null;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface LegacyAuditEventQuery {
    readonly event_type?: string;
    readonly subject_id?: string;
    readonly requester_id?: string;
    readonly consent_id?: string;
    readonly capability_id?: string;
    readonly from?: Date;
    readonly to?: Date;
}
/** Historical root-runtime audit types retained only for compatibility facades. */
export type HostedProtocolAuditEventType = 'policy_decision' | 'relationship_created' | 'relationship_activated' | 'relationship_revoked' | 'delegation_created' | 'delegation_revoked' | 'identity_denied' | 'ai_escalation_required' | 'ai_scope_blocked' | 'intent_activated' | 'audience_access_evaluated';
export interface HostedProtocolAuditEvent {
    readonly eventId: string;
    readonly eventType: HostedProtocolAuditEventType;
    readonly timestamp: string;
    readonly actorId?: string;
    readonly targetActorId?: string;
    readonly relationshipId?: string;
    readonly policyTraceId?: string;
    readonly delegationGrantIds: string[];
    readonly trustChainRef?: string;
    readonly resourceId?: string;
    readonly action?: string;
    readonly decision?: 'allow' | 'deny' | 'conditional' | 'unknown';
    readonly reasons: string[];
    readonly obligations: string[];
    readonly metadata: Record<string, unknown>;
}
export interface HostedAuditEventQuery {
    readonly event_type?: LegacyAuditEventType;
    readonly subject_id?: string;
    readonly requester_id?: string;
    readonly consent_id?: string;
    readonly capability_id?: string;
    readonly from?: Date;
    readonly to?: Date;
}
export declare class InMemoryAuditService {
    private readonly events;
    private readonly maxEvents;
    constructor(maxEvents?: number);
    recordEvent<T extends LegacyAuditEvent>(event: T): void;
    listEvents<T extends LegacyAuditEvent = LegacyAuditEvent>(query?: LegacyAuditEventQuery): T[];
    private matchesQuery;
}
export declare class InMemoryAuditEventSink implements AuditEventSink {
    private readonly maxEvents;
    private readonly events;
    constructor(maxEvents?: number);
    recordAuditEvent(event: AuditEventEnvelope, _context?: AdapterLookupContext): void;
    listAuditEvents(): readonly AuditEventEnvelope[];
}
export interface RuntimeAuditEventLike {
    readonly event_type: string;
    readonly at: string;
    readonly subject_hash?: string;
    readonly consumer_id?: string;
}
export interface AuditEventSource<TEvent extends RuntimeAuditEventLike> {
    getAuditEvents(): readonly TEvent[];
}
export interface RuntimeAuditListInput {
    readonly subject_hash?: string;
    readonly consumer_id?: string;
    readonly event_type?: string;
    readonly from?: Date;
    readonly to?: Date;
}
export declare class RuntimeAuditService<TEvent extends RuntimeAuditEventLike> {
    private readonly sources;
    constructor(sources: readonly AuditEventSource<TEvent>[]);
    listEvents(input: RuntimeAuditListInput): TEvent[];
    private matchesFilters;
}
//# sourceMappingURL=in-memory-audit.d.ts.map