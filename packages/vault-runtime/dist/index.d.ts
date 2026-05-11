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
export declare function resolveNamespacePath(namespace: NamespaceRef): string;
//# sourceMappingURL=index.d.ts.map