export type AttestationType =
  | 'governance_decision'
  | 'capability_issued'
  | 'capability_used'
  | 'delegation_validated'
  | 'ai_execution'
  | 'remote_governance'
  | 'audit_snapshot';

export type IntegrityProofType = 'local_hash' | 'chained_hash' | 'replay_guard';

export interface IntegrityProof {
  proofId: string;
  proofType: IntegrityProofType;
  payloadHash: string;
  generatedAt: string;
  parentProofRef?: string;
}

export interface GovernanceAttestation {
  attestationId: string;
  attestationType: AttestationType;
  actorId: string;
  governanceSessionId: string;
  policyTraceId: string;
  relationshipId: string;
  capabilityRefs: string[];
  decision: 'allow' | 'deny' | 'conditional';
  issuedAt: string;
  integrityProofRef: string;
  previousAttestationRef?: string;
  metadata?: Record<string, unknown>;
}

export interface CapabilityValidityWindow {
  notBefore: string;
  notAfter: string;
}

export interface CapabilityAttestation {
  capabilityId: string;
  issuingRuntimeId: string;
  governanceAttestationRef: string;
  validityWindow: CapabilityValidityWindow;
  revocationRefs: string[];
}

export interface AIAttestation {
  aiActorId: string;
  allowedScopes: string[];
  executedActions: string[];
  humanReviewRefs: string[];
  escalationRefs: string[];
  autonomousUseCount: number;
}

export interface RemoteGovernanceAttestation {
  sourceRuntimeId: string;
  targetRuntimeId: string;
  federationRef: string;
  remoteDecisionRef: string;
  remoteAuditRefs: string[];
}

export interface ValidationResult {
  valid: boolean;
  reasons: string[];
}

export interface AIAttestationValidationOptions {
  maxAutonomousUseCount?: number;
  humanReviewRequiredActions?: string[];
  escalationRequiredActions?: string[];
}

export interface RemoteGovernanceValidationOptions {
  allowedFederationRefs?: string[];
  allowedTrustDomainPairs?: Array<{ sourceRuntimeId: string; targetRuntimeId: string }>;
}
