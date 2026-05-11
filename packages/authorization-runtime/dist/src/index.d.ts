import { AuditRuntime } from "@aoc-runtime/audit-runtime";
import { CapabilityRuntime } from "@aoc-runtime/capability-runtime";
import { ConsentRuntime } from "@aoc-runtime/consent-runtime";
import { GovernanceRuntime } from "@aoc-runtime/governance-runtime";
import { ActorRef, GovernanceScope, NamespaceRef } from "@aoc-runtime/shared-types";
export interface AuthorizationInput {
    actor: ActorRef;
    namespace: NamespaceRef;
    scope: GovernanceScope;
    action: string;
    resource: string;
    machineActor?: ActorRef;
    at?: string;
}
export interface AuthorizationDecision {
    decision: "allow" | "deny";
    allowed: boolean;
    failedStage?: "governance" | "capability" | "consent";
    reasoningChain: string[];
    provenance: Record<string, unknown>;
    explainability: Record<string, unknown>;
}
export declare class AuthorizationRuntime {
    private readonly governance;
    private readonly capability;
    private readonly consent;
    private readonly audit;
    constructor(governance: GovernanceRuntime, capability: CapabilityRuntime, consent: ConsentRuntime, audit: AuditRuntime);
    evaluate(input: AuthorizationInput): Promise<AuthorizationDecision>;
}
//# sourceMappingURL=index.d.ts.map