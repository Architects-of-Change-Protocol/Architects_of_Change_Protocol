export type TrustDomainType = 'organization' | 'platform' | 'sovereign_user' | 'ai_runtime' | 'partner' | 'public';

export type FederationMode = 'isolated' | 'delegated' | 'reciprocal' | 'limited' | 'audit_only';

export type TrustLevel = 'low' | 'moderate' | 'high' | 'strict';

export type DistributedGovernanceDecision = 'allow' | 'deny' | 'conditional';

export type RevocationPropagationState = 'pending' | 'propagated' | 'acknowledged' | 'failed';

export interface TrustDomain {
  domainId: string;
  domainType: TrustDomainType;
  displayName: string;
  parentDomainId?: string;
  trustLevel: TrustLevel;
  governancePolicies: string[];
  allowedFederationModes: FederationMode[];
  suspendedAt?: string;
}

export interface RuntimeFederation {
  federationId: string;
  sourceDomainId: string;
  targetDomainId: string;
  federationMode: FederationMode;
  allowedCapabilities: string[];
  delegationPolicies: string[];
  establishedAt: string;
  suspendedAt?: string;
  revokedAt?: string;
}

export interface RemoteAuditReference {
  auditRefId: string;
  sourceRuntimeId: string;
  sourceDomainId: string;
  targetRuntimeId: string;
  eventRef: string;
  createdAt: string;
}

export interface RemoteGovernanceDecision {
  decisionId: string;
  sourceRuntimeId: string;
  targetRuntimeId: string;
  policyTraceRef: string;
  decision: DistributedGovernanceDecision;
  obligations: string[];
  remoteAuditRefs: string[];
  evaluatedAt: string;
}

export interface DistributedCapabilityReference {
  capabilityId: string;
  issuingRuntimeId: string;
  originatingDomainId: string;
  remoteValidationRequired: boolean;
  federationRef?: string;
  revocationRefs: string[];
}

export interface DistributedRevocationReference {
  revocationId: string;
  originatingRuntimeId: string;
  capabilityId: string;
  propagatedAt: string;
  propagationState: RevocationPropagationState;
}

export interface FederationCompatibilityResult {
  compatible: boolean;
  reasons: string[];
}

export type TenantId = string;
export type RelationshipId = string;
export type RuntimeEventId = string;

export type RuntimeEventType =
  | 'relationship.created'
  | 'relationship.lifecycle.changed'
  | 'relationship.trust.changed'
  | 'relationship.capability.delegated'
  | 'relationship.capability.revoked'
  | 'policy.decision.recorded'
  | 'policy.enforcement.denied'
  | 'trust.propagation.applied'
  | 'ai.execution.attested'
  | 'telemetry.stream.published';

export interface RuntimeEvent<TPayload = unknown> {
  eventId: RuntimeEventId;
  tenantId: TenantId;
  relationshipId: RelationshipId;
  type: RuntimeEventType;
  ts: string;
  sequence: number;
  replaySafe: true;
  payload: TPayload;
  traceId?: string;
}

export interface RelationshipRuntimeState {
  tenantId: TenantId;
  relationshipId: RelationshipId;
  trustScore: number;
  lifecycleState: 'proposed' | 'active' | 'paused' | 'revoked' | 'expired';
  delegatedCapabilities: string[];
  continuityHealth: 'stable' | 'degraded' | 'critical';
  revocationReadiness: number;
  aiRuntimeExposure: 'none' | 'limited' | 'extended';
  resilienceScore: number;
  lastEventSequence: number;
}

export interface RelationshipStateSnapshot {
  tenantId: TenantId;
  relationshipId: RelationshipId;
  asOfSequence: number;
  capturedAt: string;
  state: RelationshipRuntimeState;
}

export interface PolicyDecisionRecord {
  provider: 'opa' | 'cedar' | 'custom';
  decision: 'allow' | 'deny';
  reason: string;
  obligations?: string[];
  trace: Record<string, unknown>;
}

export interface RuntimeTelemetryWindow {
  tenantId: TenantId;
  fromSequence: number;
  toSequence: number;
  events: RuntimeEvent[];
  checkpoint: string;
}

export interface AIConnectorAttestation {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  agentId: string;
  capabilityBoundary: string[];
  policyScoped: boolean;
  tokenUsage?: { input: number; output: number };
}

export type RuntimeId = string;
export type RuntimeDomain = string;
export type RuntimeFederationCategory =
  | 'trust'
  | 'delegation'
  | 'replay'
  | 'attestation'
  | 'compatibility'
  | 'lineage'
  | 'transport'
  | 'execution'
  | 'governance'
  | 'tenant'
  | 'sdk'
  | 'orchestration';

export type RuntimeFederationState =
  | 'trusted'
  | 'untrusted'
  | 'suspended'
  | 'revoked'
  | 'degraded'
  | 'incompatible'
  | 'delegated'
  | 'attested'
  | 'replay-authorized'
  | 'replay-denied';

export type RuntimeFederationTrustLevel =
  | 'trusted'
  | 'partially-trusted'
  | 'capability-limited'
  | 'replay-authorized'
  | 'degraded-trust'
  | 'revoked';

export interface RuntimeFederationIdentity {
  runtimeId: RuntimeId;
  runtimeDomain: RuntimeDomain;
  tenantId: TenantId;
  sovereign: boolean;
  delegatedFromRuntimeId?: RuntimeId;
  attestationIdentityRef?: string;
}

export interface RuntimeFederationBoundary {
  sourceRuntimeId: RuntimeId;
  targetRuntimeId: RuntimeId;
  policyIsolation: 'strict' | 'shared';
  delegation: 'none' | 'attenuated' | 'scoped';
  replay: 'deny-by-default' | 'allow-with-attestation';
  visibility: 'internal' | 'audit-safe' | 'sdk-safe' | 'operator' | 'federation-partner' | 'user-facing';
}

export interface RuntimeTrustAssertion {
  runtimeId: RuntimeId;
  state: RuntimeFederationState;
  trustLevel: RuntimeFederationTrustLevel;
  allowedCapabilities: string[];
  maxDelegationDepth: number;
  replayAuthorized: boolean;
}

export interface RuntimeAttestation {
  attestationId: string;
  runtimeId: RuntimeId;
  attestedByRuntimeId: RuntimeId;
  checksum: string;
  issuedAt: string;
}

export interface RuntimeFederationCapability {
  capabilityId: string;
  sourceRuntimeId: RuntimeId;
  targetRuntimeId: RuntimeId;
  allowedScopes: string[];
  delegationDepth: number;
  tenantBound: boolean;
  replayBound: boolean;
}

export interface FederatedExecutionReference {
  executionId: string;
  runtimeId: RuntimeId;
  parentExecutionId?: string;
  checkpointRef?: string;
}

export interface FederatedExecutionLineage {
  lineageId: string;
  ancestry: FederatedExecutionReference[];
  attestationChain: RuntimeAttestation[];
}

export interface RuntimeCompatibilityAssertion {
  sourceRuntimeId: RuntimeId;
  targetRuntimeId: RuntimeId;
  compatible: boolean;
  reasons: string[];
}

export interface RuntimeFederationRelationship {
  relationshipId: string;
  sourceRuntimeId: RuntimeId;
  targetRuntimeId: RuntimeId;
  state: RuntimeFederationState;
}

export interface RuntimeFederationConstraint {
  constraintId: string;
  category: RuntimeFederationCategory;
  reasonCode: string;
  enforcement: 'warn' | 'deny';
}

export interface RuntimeFederationPolicy {
  policyId: string;
  categories: RuntimeFederationCategory[];
  constraints: RuntimeFederationConstraint[];
}

export interface RuntimeFederationDecision {
  decisionId: string;
  category: RuntimeFederationCategory;
  state: RuntimeFederationState;
  decision: 'allow' | 'deny' | 'conditional';
  reasons: string[];
  trustLevel?: RuntimeFederationTrustLevel;
  explainabilityRef?: string;
}

export interface RuntimeFederationReplay {
  replayId: string;
  lineageId: string;
  authorized: boolean;
  attestationRefs: string[];
}

export interface RuntimeFederationTrace {
  traceId: string;
  runtimeOrigin: RuntimeId;
  decisionId: string;
  visibility: RuntimeFederationBoundary['visibility'];
  redactedFields: string[];
}

export type RuntimeFederationVisibility = RuntimeFederationBoundary['visibility'];

export interface RuntimeFederationVersionAssertion {
  federationVersion: string;
  runtimeProtocolVersion: string;
  transportProfile: string;
}

export interface RuntimeFederationCompatibilityMatrix {
  supportedFederationVersions: string[];
  runtimeProtocolVersion: string;
  supportedTransportProfiles: string[];
}

export interface RuntimeFederationHandshake {
  handshakeId: string;
  sourceIdentity: RuntimeFederationIdentity;
  targetIdentity: RuntimeFederationIdentity;
  trust: RuntimeTrustAssertion;
  version: RuntimeFederationVersionAssertion;
}

export interface RuntimeFederationHandshakeEnvelope extends RuntimeFederationHandshake {
  compatibilityMatrix: RuntimeFederationCompatibilityMatrix;
  constraints: RuntimeFederationConstraint[];
}
