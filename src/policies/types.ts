import type { CapabilityPermission, CapabilityResourceType, WorkspaceId } from "../capabilities/types";

export type PolicyEffect = "allow" | "deny" | "require_approval" | "conditional_allow";

export type Policy = {
  id: string;
  workspaceId: WorkspaceId;
  name: string;
  description: string | null;
  resourceType: CapabilityResourceType;
  permission: CapabilityPermission;
  effect: PolicyEffect;
  enabled: boolean;
  priority: number;
  conditions: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
};
