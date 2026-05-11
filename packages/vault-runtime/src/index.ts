import { NamespaceRef } from "@aoc-runtime/shared-types";

export interface VaultNode {
  vaultId: string;
  namespacePath: string;
  parentVaultId?: string;
  kind: "organization" | "workspace" | "project";
}

export interface VaultTopology {
  organizationVault: VaultNode;
  workspaceVaults: VaultNode[];
  projectVaults: VaultNode[];
}

export function resolveNamespacePath(namespace: NamespaceRef): string {
  return [namespace.organizationId, namespace.workspaceId, namespace.projectId, namespace.path]
    .filter(Boolean)
    .join(":");
}
