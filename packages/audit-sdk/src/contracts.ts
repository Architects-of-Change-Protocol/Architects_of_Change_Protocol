export type CanonicalId = string;
export type UtcDateTime = string;

export interface CausalityLink {
  readonly eventId: CanonicalId;
  readonly relationship: 'triggered-by' | 'caused-by' | 'correlated-with';
}

export interface TenantIsolationMetadata {
  readonly tenantId: CanonicalId;
  readonly organizationId: CanonicalId;
  readonly dataBoundary: string;
  readonly isolationMode: 'logical' | 'physical' | 'hybrid';
}

export interface AuditEventEnvelope {
  readonly schemaVersion: '1.0.0';
  readonly eventId: CanonicalId;
  readonly actor: {
    readonly principalId: CanonicalId;
    readonly principalType: 'human' | 'service' | 'agent' | 'workload';
  };
  readonly action: string;
  readonly resource: {
    readonly kind: string;
    readonly id: CanonicalId;
  };
  readonly timestamp: UtcDateTime;
  readonly correlationIds?: readonly CanonicalId[];
  readonly causalityChain?: readonly CausalityLink[];
  readonly policyRefs?: readonly CanonicalId[];
  readonly consentRefs?: readonly CanonicalId[];
  readonly capabilityRefs?: readonly CanonicalId[];
  readonly tenantIsolation: TenantIsolationMetadata;
  readonly integrity?: {
    readonly hashAlgorithm: 'sha256' | 'sha512' | 'custom';
    readonly digest: string;
  };
  readonly extensions?: Readonly<Record<string, unknown>>;
}

export const auditEventSchemaExample = {
  $id: 'https://aoc.protocol/schemas/audit-event-envelope/1-0-0',
  type: 'object',
  required: ['schemaVersion', 'eventId', 'actor', 'action', 'resource', 'timestamp', 'tenantIsolation'],
} as const;
