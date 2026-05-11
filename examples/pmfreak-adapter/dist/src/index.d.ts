import { AuditProvider, CapabilityProvider, PolicyProvider } from "@aoc-runtime/provider-interfaces";
import { ActorRef, AuditEvent, GovernanceScope, NamespaceRef } from "@aoc-runtime/shared-types";
export interface SupabaseProviderBundle {
    capabilities: CapabilityProvider;
    policies: PolicyProvider;
    audit: AuditProvider;
}
export declare class PMFreakAocAdapter {
    private readonly providers;
    private readonly governance;
    private readonly capability;
    constructor(providers: SupabaseProviderBundle);
    evaluateAction(input: {
        actor: ActorRef;
        namespace: NamespaceRef;
        scope: GovernanceScope;
        action: string;
        resource: string;
    }): Promise<boolean>;
    writeAudit(event: AuditEvent): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map