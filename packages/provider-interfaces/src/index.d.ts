import { ActorRef, AuditEvent, CapabilityRef, ConsentGrant, GovernancePolicy, NamespaceRef, PortableCognitionPackage } from "@aoc-runtime/shared-types";
export interface MemoryProvider {
    read(namespace: NamespaceRef, key: string): Promise<unknown>;
    write(namespace: NamespaceRef, key: string, value: unknown): Promise<void>;
}
export interface VaultProvider {
    resolve(namespace: NamespaceRef): Promise<{
        vaultId: string;
        path: string;
    }>;
}
export interface PolicyProvider {
    getPolicies(scopeId: string): Promise<GovernancePolicy[]>;
}
export interface ConsentProvider {
    getActiveGrants(actorId: string, capability: CapabilityRef): Promise<ConsentGrant[]>;
}
export interface CapabilityProvider {
    resolve(actor: ActorRef, namespace: NamespaceRef): Promise<CapabilityRef[]>;
}
export interface AuditProvider {
    append(event: AuditEvent): Promise<void>;
}
export interface PortableMemoryProvider {
    export(namespace: NamespaceRef): Promise<PortableCognitionPackage>;
    import(pkg: PortableCognitionPackage): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map