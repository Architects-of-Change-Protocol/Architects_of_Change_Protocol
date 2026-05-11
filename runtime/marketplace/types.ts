export type CapabilityLeaseStatus = 'pending' | 'active' | 'revoked' | 'expired' | 'frozen';

export interface CapabilityProvider {
  providerId: string;
  runtimeId: string;
  federationId: string;
  capabilityIds: string[];
  consentPolicyRefs: string[];
  executionRegions: string[];
  sovereignOptOut?: boolean;
}

export interface CapabilityConsumer {
  consumerId: string;
  runtimeId: string;
  federationId: string;
  budgetCeiling: number;
  acceptedPolicyRefs: string[];
}

export interface CapabilityOffer {
  offerId: string;
  providerId: string;
  capabilityId: string;
  scope: string[];
  maxBudget: number;
  obligations: string[];
  constraints: string[];
  expiresAt: string;
  revocable: true;
}

export interface CapabilityExecutionAgreement {
  agreementId: string;
  offerId: string;
  providerId: string;
  consumerId: string;
  capabilityId: string;
  scope: string[];
  budgetLimit: number;
  federationBoundary: string;
  delegationLineage: string[];
  obligations: string[];
  behavioralConstraints: string[];
  expiresAt: string;
  createdAt: string;
  revocable: true;
}

export interface CapabilityLease {
  leaseId: string;
  agreementId: string;
  status: CapabilityLeaseStatus;
  startedAt: string;
  expiresAt: string;
  revokedAt?: string;
  revocationReason?: string;
}

export interface ExecutionReputationRecord {
  recordId: string;
  providerId: string;
  consumerId: string;
  capabilityId: string;
  fulfilled: boolean;
  obligationsMet: number;
  obligationsTotal: number;
  escalationResolved: boolean;
  auditIntegrityScore: number;
  recordedAt: string;
}

export interface CapabilityTrustScore {
  providerId: string;
  score: number;
  asOf: string;
  evidenceRefs: string[];
}

export interface MachineReputationProfile {
  profileId: string;
  providerId: string;
  records: ExecutionReputationRecord[];
  trustScore: CapabilityTrustScore;
  portabilityRef: string;
  exposure: 'private' | 'federated' | 'public';
}

export interface BrokerageRequest {
  requestId: string;
  consumer: CapabilityConsumer;
  capabilityId: string;
  requiredScope: string[];
  maxBudget: number;
  federationId: string;
  requireConsentRef: string;
  lineage: string[];
}

export interface ExplainableBrokerageDecision {
  decisionId: string;
  requestId: string;
  selectedProviderId?: string;
  selectedOfferId?: string;
  allowed: boolean;
  reasons: string[];
  trustPath: string[];
  budgetEvaluation: { requested: number; offered: number; consumerCeiling: number; pass: boolean };
  federationCompatibility: { pass: boolean; reason: string };
  consentEvaluation: { pass: boolean; requiredRef: string; providerSupportsRef: boolean; consumerAcceptsRef: boolean };
  constraintEvaluation: { pass: boolean; missingScopes: string[]; violatedConstraints: string[] };
}

export interface PortableMarketContinuityExport {
  exportedAt: string;
  providerId: string;
  reputationProfile: MachineReputationProfile;
  agreements: CapabilityExecutionAgreement[];
  leases: CapabilityLease[];
  trustRelationships: string[];
}

export interface CapabilityMarketplace {
  providers: CapabilityProvider[];
  offers: CapabilityOffer[];
  agreements: CapabilityExecutionAgreement[];
  leases: CapabilityLease[];
  reputations: MachineReputationProfile[];
}
