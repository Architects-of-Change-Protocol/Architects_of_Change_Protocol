import { ActorRef, GovernancePolicy, GovernanceScope, NamespaceRef } from "@aoc-runtime/shared-types";
import { PolicyProvider } from "@aoc-runtime/provider-interfaces";
export interface GovernanceContext {
    actor: ActorRef;
    namespace: NamespaceRef;
    scope: GovernanceScope;
    machineActor?: ActorRef;
}
export interface GovernancePolicyState {
    scopeId: string;
    effectivePolicies: GovernancePolicy[];
}
export declare class GovernanceRuntime {
    private readonly policies;
    constructor(policies: PolicyProvider);
    resolveActor(actor: ActorRef, machineActor?: ActorRef): ActorRef;
    policyState(scopeId: string): Promise<GovernancePolicyState>;
    evaluatePolicy(context: GovernanceContext, condition: string): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map