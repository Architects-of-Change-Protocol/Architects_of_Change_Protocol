import type { CapabilityPermission, CapabilityResourceType, WorkspaceId } from '@aoc/protocol/contracts';

export type AgentId = string;

export type AgentRiskLevel = "low" | "medium" | "high" | "critical";

export type Agent = {
  id: AgentId;
  workspaceId: WorkspaceId;
  name: string;
  status: "active" | "disabled" | "revoked";
  agentType: "autonomous" | "assistive" | "system" | "external";
  riskLevel: AgentRiskLevel;
  parentAgentId?: AgentId | null;
  delegationAuthority?: "none" | "limited" | "full";
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
};

export type AgentScope = {
  id: string;
  agentId: AgentId;
  workspaceId: WorkspaceId;
  resourceType: CapabilityResourceType;
  resourceId: string;
  permission: CapabilityPermission;
  executionBoundary?: Record<string, unknown> | null;
  delegationDepthLimit?: number | null;
  status: "active" | "expired" | "revoked";
  expiresAt: string | null;
  grantedByPrincipalId?: string | null;
};
