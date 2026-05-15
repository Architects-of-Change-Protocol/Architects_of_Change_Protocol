export type WorkspaceId = string;
export type ProjectId = string;

/**
 * Protocol-scoped capability actions grouped by semantic domain.
 * These are protocol contracts, not implementation rules.
 */
export type CapabilityPermission =
  | "resource:read"
  | "resource:create"
  | "resource:update"
  | "resource:delete"
  | "resource:execute"
  | "governance:approve"
  | "governance:manage"
  | "identity:delegate"
  | "workspace:manage"
  | "project:manage"
  | "membership:manage"
  | "billing:manage"
  | "agent:manage"
  | "agent:execute"
  | "document:upload"
  | "memory:read"
  | "memory:write"
  | "memory:delete"
  | "audit:read"
  | "audit:export";

export type CapabilityResourceType =
  | "workspace"
  | "project"
  | "document"
  | "dataset"
  | "policy"
  | "consent"
  | "delegation"
  | "audit_log"
  | "agent"
  | "memory"
  | "execution"
  | "integration";

export type CapabilityRequestStatus =
  | "pending"
  | "approved"
  | "denied"
  | "revoked"
  | "expired"
  | "consumed";

export type CapabilityGrantStatus = "active" | "revoked" | "expired" | "consumed";

export type CapabilityRequest = {
  id: string;
  workspaceId: WorkspaceId;
  resourceType: CapabilityResourceType;
  resourceId: string;
  permission: CapabilityPermission;
  status: CapabilityRequestStatus;
  requesterPrincipalId: string;
  justification: string | null;
  createdAt: string;
  expiresAt?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CapabilityGrant = {
  id: string;
  workspaceId: WorkspaceId;
  capabilityRequestId: string;
  resourceType: CapabilityResourceType;
  resourceId: string;
  permission: CapabilityPermission;
  status: CapabilityGrantStatus;
  grantedByPrincipalId?: string | null;
  activatedAt?: string | null;
  expiresAt: string | null;
  revokedAt?: string | null;
  revokedReason?: string | null;
  consumedAt?: string | null;
  metadata?: Record<string, unknown> | null;
};
