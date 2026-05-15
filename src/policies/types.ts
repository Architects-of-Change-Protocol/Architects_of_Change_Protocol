import type { CapabilityPermission, CapabilityResourceType, WorkspaceId } from "../capabilities/types";

export type PolicyEffect = "allow" | "deny" | "require_approval";

export type Policy = {
  id: string;
  workspace_id: WorkspaceId;
  name: string;
  description: string | null;
  resource_type: CapabilityResourceType;
  permission: CapabilityPermission;
  effect: PolicyEffect;
  enabled: boolean;
  priority: number;
  conditions: Record<string, unknown> | null;
};
