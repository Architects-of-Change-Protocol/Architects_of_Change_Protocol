export type { WorkspaceId, ProjectId, CapabilityPermission, CapabilityResourceType, CapabilityRequestStatus, CapabilityGrantStatus, CapabilityRequest, CapabilityGrant } from "../capabilities/types";
export type { AgentId, AgentRiskLevel, Agent, AgentScope } from "../agents/types";
export type { Policy, PolicyEffect } from "../policies/types";
export type { PolicyDecision, DecisionContext, PolicyReference, EvaluationSource } from "../decisions/types";
export type { Delegation, DelegationStatus, DelegationPrincipal, DelegationLineage, DelegationRevocation, PrincipalType } from "../delegations/types";
export type { AuditTimelineItem, AuditActor, AuditSubject, AuditEventCategory, AuditEventType, AuditSeverity } from "../audit/types";

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
