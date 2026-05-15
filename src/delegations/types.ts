import type { CapabilityPermission, CapabilityResourceType, WorkspaceId } from "../capabilities/types";

export type PrincipalType = "human" | "agent" | "service";

export type DelegationStatus = "active" | "expired" | "revoked" | "consumed";

export type DelegationPrincipal = {
  principalType: PrincipalType;
  principalId: string;
};

export type DelegationLineage = {
  rootDelegationId: string;
  parentDelegationId: string | null;
  ancestorDelegationIds: string[];
  depth: number;
};

export type DelegationRevocation = {
  revokedAt: string;
  revokedByPrincipalId: string;
  reason?: string | null;
  propagationMode?: "none" | "downstream" | "chain";
  propagatedFromDelegationId?: string | null;
};

export type Delegation = {
  id: string;
  workspaceId: WorkspaceId;
  delegator: DelegationPrincipal;
  delegatee: DelegationPrincipal;
  sourceCapabilityGrantId: string | null;
  lineage: DelegationLineage;
  resourceType: CapabilityResourceType | null;
  resourceId: string | null;
  permission: CapabilityPermission;
  scope: Record<string, unknown>;
  status: DelegationStatus;
  createdAt: string;
  expiresAt: string | null;
  revocation?: DelegationRevocation | null;
  metadata?: Record<string, unknown> | null;
};
