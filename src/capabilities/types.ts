export type WorkspaceId = string;
export type ProjectId = string;

export type CapabilityPermission =
  | "read"
  | "write"
  | "approve"
  | "manage"
  | "execute"
  | "delegate"
  | "delete"
  | "write_memory"
  | "delete_memory"
  | "manage_members"
  | "manage_projects"
  | "manage_workspace"
  | "manage_ai"
  | "manage_billing"
  | "execute_ai_action"
  | "view_executive"
  | "upload_documents";

export type CapabilityResourceType =
  | "workspace"
  | "project"
  | "operational_memory"
  | "governance_object"
  | "ai_coprocess"
  | "copilot";

export type CapabilityRequest = {
  id: string;
  workspace_id: WorkspaceId;
  target_resource_type: CapabilityResourceType;
  target_resource_id: string;
  requested_permission: CapabilityPermission;
  status: "pending" | "approved" | "denied" | "revoked";
  requester_user_id: string;
  justification: string | null;
  created_at: string;
};

export type CapabilityGrant = {
  id: string;
  workspace_id: WorkspaceId;
  capability_request_id: string;
  permission: CapabilityPermission;
  target_resource_type: CapabilityResourceType;
  target_resource_id: string;
  status: "active" | "revoked" | "expired";
  expires_at: string | null;
};
