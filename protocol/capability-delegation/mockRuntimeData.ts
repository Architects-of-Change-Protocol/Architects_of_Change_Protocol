import type { CapabilityTimelineEvent, CapabilityToken, GovernanceGraphEdge, GovernanceGraphNode, RelationshipEntity } from './types';

export const entities: RelationshipEntity[] = [
  { id: 'usr_01', displayName: 'Northstar Retail User Cohort', entityType: 'user' },
  { id: 'org_01', displayName: 'Analytics Partner', entityType: 'organization' },
  { id: 'agt_01', displayName: 'Forecast Agent v2.4', entityType: 'ai_agent' },
  { id: 'agt_02', displayName: 'Support Diagnostics Agent', entityType: 'ai_agent' },
  { id: 'rt_01', displayName: 'Compliance Runtime', entityType: 'runtime' }
];

export const capabilityTokens: CapabilityToken[] = [
  {
    capabilityId: 'cap_01_fcast_runtime',
    delegatedBy: 'usr_01',
    delegatedTo: 'agt_01',
    runtimeStatus: 'active',
    trustState: 'verified',
    signedRuntimeVerification: true,
    autonomousRevocationEnabled: true,
    window: { issuedAt: '2026-05-01T09:00:00Z', effectiveAt: '2026-05-01T09:01:00Z', expiresAt: '2026-06-01T09:00:00Z' },
    scopes: [
      { id: 'scp_01', key: 'ai.forecasting.runtime', description: 'Forecasting signal execution', restrictions: ['no_export', 'region:us'], minimizationRule: 'aggregate_only' },
      { id: 'scp_02', key: 'read:behavioral_segments', description: 'Segment reads only', inheritedFrom: 'scp_01', restrictions: ['mask_pii'], minimizationRule: 'minimum_columns' }
    ]
  },
  {
    capabilityId: 'cap_02_support_diag',
    delegatedBy: 'usr_01',
    delegatedTo: 'agt_02',
    runtimeStatus: 'expiring',
    trustState: 'attested',
    signedRuntimeVerification: true,
    autonomousRevocationEnabled: true,
    window: { issuedAt: '2026-04-28T10:30:00Z', effectiveAt: '2026-04-28T10:31:00Z', expiresAt: '2026-05-08T10:30:00Z' },
    scopes: [
      { id: 'scp_03', key: 'support.diagnostics', description: 'Diagnostic decision traces', restrictions: ['case_scoped', '72h_retention'], minimizationRule: 'ticket_bound' }
    ]
  }
];

export const capabilityTimeline: CapabilityTimelineEvent[] = [
  { id: 'evt_01', capabilityId: 'cap_01_fcast_runtime', eventType: 'issued', timestamp: '2026-05-01T09:00:00Z', actorId: 'rt_01', details: 'Capability issued from policy runtime.' },
  { id: 'evt_02', capabilityId: 'cap_01_fcast_runtime', eventType: 'delegated', timestamp: '2026-05-01T09:01:00Z', actorId: 'usr_01', details: 'Delegated to Forecast Agent v2.4.' },
  { id: 'evt_03', capabilityId: 'cap_01_fcast_runtime', eventType: 'consumed', timestamp: '2026-05-03T13:22:00Z', actorId: 'agt_01', details: 'Scope executed within regional boundary.' },
  { id: 'evt_04', capabilityId: 'cap_02_support_diag', eventType: 'restricted', timestamp: '2026-05-05T08:10:00Z', actorId: 'rt_01', details: 'Diagnostics scope narrowed after drift signal.' },
  { id: 'evt_05', capabilityId: 'cap_02_support_diag', eventType: 'renewed', timestamp: '2026-05-06T07:15:00Z', actorId: 'usr_01', details: 'Temporal extension approved with attestation.' }
];

export const governanceGraphNodes: GovernanceGraphNode[] = [
  { id: 'usr_01', label: 'User', kind: 'user' },
  { id: 'rel_01', label: 'Relationship', kind: 'relationship' },
  { id: 'cap_01_fcast_runtime', label: 'Capability', kind: 'capability' },
  { id: 'org_01', label: 'Organization', kind: 'organization' },
  { id: 'agt_01', label: 'AI Agent', kind: 'ai_agent' },
  { id: 'rt_01', label: 'Policy Runtime', kind: 'policy_runtime' }
];

export const governanceGraphEdges: GovernanceGraphEdge[] = [
  { id: 'edge_1', from: 'usr_01', to: 'rel_01', relationship: 'governs' },
  { id: 'edge_2', from: 'rel_01', to: 'cap_01_fcast_runtime', relationship: 'delegates' },
  { id: 'edge_3', from: 'cap_01_fcast_runtime', to: 'org_01', relationship: 'inherits' },
  { id: 'edge_4', from: 'org_01', to: 'agt_01', relationship: 'delegates' },
  { id: 'edge_5', from: 'agt_01', to: 'rt_01', relationship: 'attests' },
  { id: 'edge_6', from: 'rt_01', to: 'cap_01_fcast_runtime', relationship: 'enforces' }
];
