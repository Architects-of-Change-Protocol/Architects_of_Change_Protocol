export type {
  Agent,
  AgentId,
  AgentRiskLevel,
  AgentScope,
  AuditActor,
  AuditEventCategory,
  AuditEventType,
  AuditSeverity,
  AuditSubject,
  AuditTimelineItem,
  CapabilityGrant,
  CapabilityGrantStatus,
  CapabilityPermission,
  CapabilityRequest,
  CapabilityRequestStatus,
  CapabilityResourceType,
  DecisionContext,
  Delegation,
  DelegationLineage,
  DelegationPrincipal,
  DelegationRevocation,
  DelegationStatus,
  EvaluationSource,
  Policy,
  PolicyDecision,
  PolicyEffect,
  PolicyReference,
  PrincipalType,
  ProjectId,
  WorkspaceId,
} from '@aoc/protocol/contracts';

export type AocClientConfig = {
  baseUrl: string;
  token?: string;
  apiKey?: string;
  workspaceId?: string;
  agentId?: string;
  delegationToken?: string;
  executionGrant?: string;
  agentToken?: string;
  fetch?: typeof globalThis.fetch;
};
