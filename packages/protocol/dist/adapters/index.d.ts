import type { AuditEventEnvelope, CanonicalId, CapabilityToken, PolicyDecision, ResourceRef, UtcDateTime } from '../contracts';
import type { CanonicalAttestation } from '../claims/attestation';
import type { CanonicalCapability } from '../claims/capability';
import type { CanonicalClaim } from '../claims/claim';
import type { CanonicalCredentialRef } from '../claims/credentials/credential-reference';
import type { CanonicalDecision } from '../claims/decision';
import type { CanonicalProofRef } from '../claims/proofs/proof-reference';
import type { CanonicalRegistryLookupRequest, CanonicalRegistryLookupResult } from '../claims/registries/registry-lookup';
import type { CanonicalRegistryEntry } from '../claims/registries/registry-entry';
import type { CanonicalRegistryEntryRef } from '../claims/registries/registry-entry-reference';
import type { CanonicalRegistryRef } from '../claims/registries/registry-reference';
import type { CanonicalVerification } from '../claims/verification';
export type AdapterResult<T> = T | Promise<T>;
export interface AdapterLookupContext {
    readonly tenantId?: CanonicalId;
    readonly trustDomain?: CanonicalId;
    readonly requestedAt?: UtcDateTime;
    readonly correlationId?: CanonicalId;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface VerificationKeyDescriptor {
    readonly keyId: CanonicalId;
    readonly issuer: CanonicalId;
    readonly algorithm?: string;
    readonly publicKeyRef?: string;
    readonly publicKeyJwk?: Readonly<Record<string, unknown>>;
    readonly validFrom?: UtcDateTime;
    readonly validUntil?: UtcDateTime;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface VerificationKeyResolver {
    resolveVerificationKey(issuer: CanonicalId, proofRef?: CanonicalProofRef, context?: AdapterLookupContext): AdapterResult<VerificationKeyDescriptor | undefined>;
}
export interface RevocationStatus {
    readonly revoked: boolean;
    readonly checkedAt: UtcDateTime;
    readonly reason?: string;
    readonly sourceRef?: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface RevocationLookup {
    lookupRevocationStatus(revocationRef: string, subjectRef?: CanonicalId, context?: AdapterLookupContext): AdapterResult<RevocationStatus>;
}
export interface RegistryLookup {
    lookupRegistry(request: CanonicalRegistryLookupRequest, context?: AdapterLookupContext): AdapterResult<CanonicalRegistryLookupResult>;
}
export interface TrustRegistryProvider {
    getRegistry(registryRef: CanonicalRegistryRef, context?: AdapterLookupContext): AdapterResult<CanonicalRegistryRef | undefined>;
    getRegistryEntry(entryRef: CanonicalRegistryEntryRef, context?: AdapterLookupContext): AdapterResult<CanonicalRegistryEntry | undefined>;
}
export interface CapabilityLookup {
    lookupCapability(capabilityId: CanonicalId, context?: AdapterLookupContext): AdapterResult<CanonicalCapability | CapabilityToken | undefined>;
}
export interface AttestationLookup {
    lookupAttestation(attestationId: CanonicalId, context?: AdapterLookupContext): AdapterResult<CanonicalAttestation | undefined>;
}
export interface CredentialStatusLookup {
    lookupCredentialStatus(credentialRef: CanonicalCredentialRef, context?: AdapterLookupContext): AdapterResult<RevocationStatus | undefined>;
}
export interface AuditEventSink {
    recordAuditEvent(event: AuditEventEnvelope, context?: AdapterLookupContext): AdapterResult<void>;
}
export interface SecurityEvent {
    readonly eventId: CanonicalId;
    readonly eventType: string;
    readonly occurredAt: UtcDateTime;
    readonly subjectRef?: CanonicalId;
    readonly resource?: ResourceRef;
    readonly severity?: 'info' | 'warning' | 'critical';
    readonly payload?: Readonly<Record<string, unknown>>;
}
export interface SecurityEventSink {
    recordSecurityEvent(event: SecurityEvent, context?: AdapterLookupContext): AdapterResult<void>;
}
export interface ProtocolEvent {
    readonly eventId: CanonicalId;
    readonly eventType: string;
    readonly emittedAt: UtcDateTime;
    readonly claimRef?: CanonicalId;
    readonly payload?: Readonly<Record<string, unknown>>;
}
export interface ProtocolEventSink {
    emitProtocolEvent(event: ProtocolEvent, context?: AdapterLookupContext): AdapterResult<void>;
}
export interface PolicyDecisionRequest {
    readonly subject: CanonicalId;
    readonly resource: ResourceRef;
    readonly action: string;
    readonly claimRefs?: readonly CanonicalId[];
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface PolicyDecisionResult {
    readonly decision: PolicyDecision;
    readonly decidedAt: UtcDateTime;
    readonly reason?: string;
    readonly decisionRef?: CanonicalDecision;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface PolicyDecisionProvider {
    decidePolicy(request: PolicyDecisionRequest, context?: AdapterLookupContext): AdapterResult<PolicyDecisionResult>;
}
export interface GovernanceDecisionProvider {
    resolveGovernanceDecision(claim: CanonicalClaim, context?: AdapterLookupContext): AdapterResult<CanonicalDecision | undefined>;
}
export interface ExecutionAuthorizationRequest {
    readonly subject: CanonicalId;
    readonly resource: ResourceRef;
    readonly capabilityRef?: CanonicalId;
    readonly action: string;
    readonly requestedAt: UtcDateTime;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface ExecutionAuthorizationResult {
    readonly authorized: boolean;
    readonly decidedAt: UtcDateTime;
    readonly reason?: string;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface ExecutionAuthorizationProvider {
    authorizeExecution(request: ExecutionAuthorizationRequest, context?: AdapterLookupContext): AdapterResult<ExecutionAuthorizationResult>;
}
export interface VerificationProvider {
    verifyClaim(claim: CanonicalClaim, context?: AdapterLookupContext): AdapterResult<CanonicalVerification>;
}
export interface ObservabilityEventSink {
    recordObservation(event: ProtocolEvent | SecurityEvent | AuditEventEnvelope, context?: AdapterLookupContext): AdapterResult<void>;
}
//# sourceMappingURL=index.d.ts.map