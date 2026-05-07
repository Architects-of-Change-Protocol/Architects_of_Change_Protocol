export type RuntimeType =
  | 'user_runtime'
  | 'organization_runtime'
  | 'ai_runtime'
  | 'partner_runtime'
  | 'public_runtime'
  | 'test_runtime';

export type RuntimeStatus = 'active' | 'suspended' | 'revoked' | 'isolated';
export type RevocationMode = 'local_only' | 'federated' | 'remote_required' | 'emergency_stop';
export type IsolationLevel = 'open' | 'limited' | 'strict' | 'air_gapped';
export type FederationMode = 'isolated' | 'delegated' | 'reciprocal' | 'limited' | 'audit_only';
export type TrustLevel = 'low' | 'moderate' | 'high' | 'strict';

export interface SovereignRuntime { runtimeId: string; runtimeType: RuntimeType; ownerActorId: string; trustDomainId: string; displayName: string; runtimeStatus: RuntimeStatus; policyEnvelopeRef?: string; capabilityDomainRef?: string; trustPostureRef?: string; isolationProfileRef?: string; aiGovernanceProfileRef?: string; createdAt: string; suspendedAt?: string; revokedAt?: string; }
export interface RuntimePolicyEnvelope { policyEnvelopeId: string; runtimeId: string; allowedPolicyRefs: string[]; blockedPolicyRefs: string[]; requiredAttestationTypes: string[]; requiredAuditEvents: string[]; delegationLimits: Record<string, number>; createdAt: string; updatedAt: string; }
export interface RuntimeTrustPosture { trustPostureId: string; runtimeId: string; trustLevel: TrustLevel; riskFlags: string[]; lastReviewedAt: string; trustEvidenceRefs: string[]; degradationSignals: string[]; recoverySignals: string[]; }
export interface RuntimeCapabilityDomain { capabilityDomainId: string; runtimeId: string; allowedCapabilityTypes: string[]; blockedCapabilityTypes: string[]; maxCapabilityTTLSeconds: number; revocationMode: RevocationMode; remoteValidationRequired: boolean; }
export interface RuntimeIsolationProfile { isolationProfileId: string; runtimeId: string; isolationLevel: IsolationLevel; allowedFederationModes: FederationMode[]; blockedRuntimeTypes: RuntimeType[]; dataEgressRestrictions: string[]; aiExecutionRestrictions: string[]; }
export interface RuntimeAIGovernanceProfile { aiGovernanceProfileId: string; runtimeId: string; allowedAiActorTypes: string[]; blockedScopes: string[]; humanReviewRequiredActions: string[]; autonomousExecutionLimits: Record<string, number>; escalationPolicyRefs: string[]; }
