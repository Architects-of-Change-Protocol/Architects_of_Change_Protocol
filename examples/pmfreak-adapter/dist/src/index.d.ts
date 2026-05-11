import { AuditProvider, CapabilityProvider, ConsentProvider, PolicyProvider } from "@aoc-runtime/provider-interfaces";
import { ActorRef, AuditEvent, GovernanceScope, NamespaceRef } from "@aoc-runtime/shared-types";
export interface SupabaseProviderBundle {
    capabilities: CapabilityProvider;
    policies: PolicyProvider;
    consent: ConsentProvider;
    audit: AuditProvider;
}
export declare class PMFreakAocAdapter {
    private readonly providers;
    private readonly authorization;
    constructor(providers: SupabaseProviderBundle);
    evaluateAction(input: {
        actor: ActorRef;
        namespace: NamespaceRef;
        scope: GovernanceScope;
        action: string;
        resource: string;
        machineActor?: ActorRef;
        at?: string;
    }): Promise<boolean>;
    writeAudit(event: AuditEvent): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map