export type TrustState = 'verified' | 'attested' | 'degraded' | 'unverified';

export type LifecycleEventType =
  | 'issued'
  | 'delegated'
  | 'consumed'
  | 'renewed'
  | 'restricted'
  | 'expired'
  | 'revoked';

export interface CapabilityRuntimeCard {
  capabilityId: string;
  delegatedBy: string;
  delegatedTo: string;
  activeScopes: string[];
  expiresAt: string;
  runtimeVerification: 'passing' | 'warning' | 'failing';
  trustHealth: TrustState;
  revocationReadiness: 'ready' | 'monitoring' | 'blocked';
  activityLevel: 'idle' | 'active' | 'burst';
  attestationState: 'pending' | 'attested' | 'expired';
}

export interface RuntimeEvent {
  id: string;
  timestamp: string;
  type:
    | 'scope_minimized'
    | 'runtime_attested'
    | 'capability_consumed'
    | 'drift_detected'
    | 'revocation_triggered'
    | 'access_denied'
    | 'policy_updated';
  capabilityId: string;
  relationshipId: string;
  trustState: TrustState;
  summary: string;
}

export interface RuntimeAgent {
  id: string;
  name: string;
  delegatedCapabilities: string[];
  trustStatus: TrustState;
  attestationProof: string;
  policyDriftAlerts: number;
  autonomousRevocations: number;
  boundedScopes: string[];
  minimizationEnforcement: 'strict' | 'adaptive';
}

export interface GovernanceNode {
  id: string;
  label: string;
  type: 'user' | 'relationship' | 'capability' | 'organization' | 'ai_agent' | 'policy_runtime';
  trustState: TrustState;
}

export interface GovernanceEdge {
  id: string;
  from: string;
  to: string;
  relation: 'governs' | 'delegates' | 'attests' | 'inherits' | 'enforces';
  scope?: string[];
}

export interface LifecycleEvent {
  id: string;
  capabilityId: string;
  type: LifecycleEventType;
  at: string;
  trustSnapshot: TrustState;
  metadata: Record<string, string | number | boolean>;
}
