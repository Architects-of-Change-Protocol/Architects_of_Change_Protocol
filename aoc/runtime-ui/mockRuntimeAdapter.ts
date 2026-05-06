import {
  CapabilityRuntimeCard,
  GovernanceEdge,
  GovernanceNode,
  LifecycleEvent,
  RuntimeAgent,
  RuntimeEvent,
} from './types';

const now = Date.now();

export const mockCapabilityCards: CapabilityRuntimeCard[] = [
  {
    capabilityId: 'cap_forecast_2_4_read_01',
    delegatedBy: 'Maya Chen',
    delegatedTo: 'Forecast Agent v2.4',
    activeScopes: ['orders:read', 'inventory:trend:read'],
    expiresAt: new Date(now + 1000 * 60 * 42).toISOString(),
    runtimeVerification: 'passing',
    trustHealth: 'verified',
    revocationReadiness: 'ready',
    activityLevel: 'active',
    attestationState: 'attested',
  },
  {
    capabilityId: 'cap_support_diag_01',
    delegatedBy: 'Rafael Singh',
    delegatedTo: 'Support Diagnostics Agent',
    activeScopes: ['tickets:read', 'diagnostics:run:bounded'],
    expiresAt: new Date(now + 1000 * 60 * 12).toISOString(),
    runtimeVerification: 'warning',
    trustHealth: 'degraded',
    revocationReadiness: 'monitoring',
    activityLevel: 'burst',
    attestationState: 'pending',
  },
];

export const mockRuntimeEvents: RuntimeEvent[] = [
  {
    id: 'evt_101',
    timestamp: new Date(now - 1000 * 30).toISOString(),
    type: 'scope_minimized',
    capabilityId: 'cap_support_diag_01',
    relationshipId: 'rel_customer_success_09',
    trustState: 'attested',
    summary: 'Policy runtime reduced diagnostic scope after anomaly.',
  },
  {
    id: 'evt_102',
    timestamp: new Date(now - 1000 * 12).toISOString(),
    type: 'drift_detected',
    capabilityId: 'cap_support_diag_01',
    relationshipId: 'rel_customer_success_09',
    trustState: 'degraded',
    summary: 'Behavioral baseline drift detected for Support Diagnostics Agent.',
  },
];

export const mockRuntimeAgents: RuntimeAgent[] = [
  {
    id: 'agt_forecast_24',
    name: 'Forecast Agent v2.4',
    delegatedCapabilities: ['cap_forecast_2_4_read_01'],
    trustStatus: 'verified',
    attestationProof: 'attest://proof/9f1',
    policyDriftAlerts: 0,
    autonomousRevocations: 1,
    boundedScopes: ['orders:read', 'inventory:trend:read'],
    minimizationEnforcement: 'strict',
  },
  {
    id: 'agt_compliance_runtime',
    name: 'Compliance Runtime',
    delegatedCapabilities: ['cap_compliance_03'],
    trustStatus: 'attested',
    attestationProof: 'attest://proof/a33',
    policyDriftAlerts: 1,
    autonomousRevocations: 0,
    boundedScopes: ['policy:validate', 'consent:lifecycle:read'],
    minimizationEnforcement: 'adaptive',
  },
];

export const mockGraph = {
  nodes: [
    { id: 'u1', label: 'User: Maya Chen', type: 'user', trustState: 'verified' },
    { id: 'r1', label: 'Relationship: Retail Ops', type: 'relationship', trustState: 'attested' },
    { id: 'c1', label: 'Capability: cap_forecast_2_4_read_01', type: 'capability', trustState: 'verified' },
    { id: 'a1', label: 'AI: Forecast Agent v2.4', type: 'ai_agent', trustState: 'verified' },
    { id: 'p1', label: 'Policy Runtime', type: 'policy_runtime', trustState: 'attested' },
  ] as GovernanceNode[],
  edges: [
    { id: 'e1', from: 'u1', to: 'c1', relation: 'delegates', scope: ['orders:read'] },
    { id: 'e2', from: 'c1', to: 'a1', relation: 'governs', scope: ['inventory:trend:read'] },
    { id: 'e3', from: 'p1', to: 'a1', relation: 'enforces' },
    { id: 'e4', from: 'r1', to: 'p1', relation: 'attests' },
  ] as GovernanceEdge[],
};

export const mockLifecycle: LifecycleEvent[] = [
  { id: 'l1', capabilityId: 'cap_forecast_2_4_read_01', type: 'issued', at: new Date(now - 1000 * 3600).toISOString(), trustSnapshot: 'verified', metadata: { issuer: 'Maya Chen' } },
  { id: 'l2', capabilityId: 'cap_forecast_2_4_read_01', type: 'delegated', at: new Date(now - 1000 * 2400).toISOString(), trustSnapshot: 'attested', metadata: { to: 'Forecast Agent v2.4' } },
  { id: 'l3', capabilityId: 'cap_forecast_2_4_read_01', type: 'consumed', at: new Date(now - 1000 * 1200).toISOString(), trustSnapshot: 'verified', metadata: { policyGate: 'allow' } },
  { id: 'l4', capabilityId: 'cap_forecast_2_4_read_01', type: 'renewed', at: new Date(now - 1000 * 600).toISOString(), trustSnapshot: 'verified', metadata: { ttlMinutes: 60 } },
];
