export type RuntimeStatus = 'active' | 'expiring' | 'suspended' | 'revoked';
export type TrustState = 'verified' | 'attested' | 'degraded' | 'unverified';

export interface RelationshipEntity {
  id: string;
  displayName: string;
  entityType: 'user' | 'organization' | 'ai_agent' | 'runtime';
}

export interface CapabilityScope {
  id: string;
  key: string;
  description: string;
  inheritedFrom?: string;
  restrictions: string[];
  minimizationRule: string;
}

export interface DelegationWindow {
  issuedAt: string;
  effectiveAt: string;
  expiresAt: string;
}

export interface CapabilityToken {
  capabilityId: string;
  delegatedBy: string;
  delegatedTo: string;
  runtimeStatus: RuntimeStatus;
  trustState: TrustState;
  signedRuntimeVerification: boolean;
  autonomousRevocationEnabled: boolean;
  window: DelegationWindow;
  scopes: CapabilityScope[];
}

export interface CapabilityTimelineEvent {
  id: string;
  capabilityId: string;
  eventType: 'issued' | 'delegated' | 'consumed' | 'renewed' | 'restricted' | 'expired' | 'revoked';
  timestamp: string;
  actorId: string;
  details: string;
}

export interface GovernanceGraphNode {
  id: string;
  label: string;
  kind: 'user' | 'relationship' | 'capability' | 'organization' | 'ai_agent' | 'policy_runtime';
}

export interface GovernanceGraphEdge {
  id: string;
  from: string;
  to: string;
  relationship: 'governs' | 'delegates' | 'inherits' | 'attests' | 'enforces';
}
