import type { CapabilityPermission, CapabilityResourceType, WorkspaceId } from "../capabilities/types";

export type AgentId = string;

export type Agent = {
  id: AgentId;
  workspace_id: WorkspaceId;
  name: string;
  status: "active" | "disabled" | "revoked";
  agent_type: string;
  risk_level: "low" | "medium" | "high";
  created_at?: string;
};

export type AgentScope = {
  id: string;
  agent_id: AgentId;
  workspace_id: WorkspaceId;
  resource_type: CapabilityResourceType;
  resource_id: string;
  permission: CapabilityPermission;
  status: "active" | "expired" | "revoked";
  expires_at: string | null;
};
