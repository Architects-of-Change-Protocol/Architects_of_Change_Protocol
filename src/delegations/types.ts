import type { CapabilityPermission, CapabilityResourceType, WorkspaceId } from "../capabilities/types";

export type Delegation = {
  id: string;
  workspace_id: WorkspaceId;
  delegator_actor_type: "human" | "ai_agent";
  delegator_user_id: string | null;
  delegator_agent_id: string | null;
  delegate_actor_type: "human" | "ai_agent";
  delegatee_user_id: string | null;
  delegatee_agent_id: string | null;
  source_capability_grant_id: string | null;
  parent_delegation_id?: string | null;
  resource_type: CapabilityResourceType | null;
  resource_id: string | null;
  permission: CapabilityPermission;
  delegated_scope: Record<string, unknown>;
  status: "active" | "expired" | "revoked" | "consumed";
  delegation_depth: number;
  expires_at: string;
  created_at: string;
  revoked_at: string | null;
  revoked_reason?: string | null;
  metadata?: Record<string, unknown> | null;
};
