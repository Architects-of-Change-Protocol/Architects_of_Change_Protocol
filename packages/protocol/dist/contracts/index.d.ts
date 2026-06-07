export type CanonicalId = string;
export type UtcDateTime = string;
export interface ResourceRef {
    readonly kind: string;
    readonly id: CanonicalId;
    readonly tenantId?: CanonicalId;
    readonly attributes?: Readonly<Record<string, string>>;
}
export interface Delegation {
    readonly delegator: CanonicalId;
    readonly chainDepth: number;
    readonly maxDepth: number;
    readonly allowedReDelegation: boolean;
}
export interface Constraint {
    readonly name: string;
    readonly operator: 'eq' | 'in' | 'lt' | 'lte' | 'gt' | 'gte' | 'regex';
    readonly value: string | number | boolean | readonly string[];
}
export interface ProofMetadata {
    readonly proofType: 'jwt' | 'mTLS' | 'detached-signature' | 'custom';
    readonly proofRef?: string;
    readonly issuedAt: UtcDateTime;
}
export interface CapabilityToken {
    readonly schemaVersion: '1.0.0';
    readonly tokenId: CanonicalId;
    readonly issuer: CanonicalId;
    readonly subject: CanonicalId;
    readonly resource: ResourceRef;
    readonly scope: readonly string[];
    readonly constraints?: readonly Constraint[];
    readonly delegation?: Delegation;
    readonly expiresAt: UtcDateTime;
    readonly notBefore?: UtcDateTime;
    readonly revocationRefs?: readonly string[];
    readonly proof: ProofMetadata;
}
export type CapabilityGrant = CapabilityToken;
export type AgentScope = readonly string[];
export interface ContextCondition {
    readonly key: string;
    readonly operator: 'eq' | 'neq' | 'in' | 'contains' | 'exists';
    readonly value?: string | number | boolean | readonly string[];
}
export interface ConsentGrant {
    readonly schemaVersion: '1.0.0';
    readonly grantId: CanonicalId;
    readonly grantor: CanonicalId;
    readonly grantee: CanonicalId;
    readonly purpose: string;
    readonly allowedOperations: readonly string[];
    readonly issuedAt: UtcDateTime;
    readonly legalBasis: {
        readonly basisType: 'contract' | 'legitimate-interest' | 'consent' | 'public-task' | 'custom';
    };
    readonly contextualConditions?: readonly ContextCondition[];
}
export type PolicyDecision = 'allow' | 'deny' | 'conditional';
export interface ScopedAccessRequest {
    readonly principalId: CanonicalId;
    readonly resource: ResourceRef;
    readonly requestedScope: AgentScope;
    readonly requestedAt: UtcDateTime;
}
export interface AuditEventEnvelope {
    readonly eventId: CanonicalId;
    readonly eventType: string;
    readonly emittedAt: UtcDateTime;
    readonly actorId?: CanonicalId;
    readonly payload: Readonly<Record<string, unknown>>;
}
export type TrustDomainIdentifier = string;
export type * from './legacy-contracts';
//# sourceMappingURL=index.d.ts.map