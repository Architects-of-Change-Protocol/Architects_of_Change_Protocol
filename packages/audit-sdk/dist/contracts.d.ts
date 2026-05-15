/**
 * Compatibility facade.
 * Canonical semantic ownership lives in:
 * @aoc/protocol/contracts
 */
export type { CanonicalId, UtcDateTime, AuditEventEnvelope, } from '@aoc/protocol/contracts';
export interface CausalityLink {
    readonly eventId: string;
    readonly relationship: 'triggered-by' | 'caused-by' | 'correlated-with';
}
export interface TenantIsolationMetadata {
    readonly tenantId: string;
    readonly organizationId: string;
    readonly dataBoundary: string;
    readonly isolationMode: 'logical' | 'physical' | 'hybrid';
}
export declare const auditEventSchemaExample: {
    readonly $id: "https://aoc.protocol/schemas/audit-event-envelope/1-0-0";
    readonly type: "object";
    readonly required: readonly ["schemaVersion", "eventId", "actor", "action", "resource", "timestamp", "tenantIsolation"];
};
//# sourceMappingURL=contracts.d.ts.map