import { ActorRef, GovernancePolicy, GovernanceScope, GovernanceSignature, NamespaceRef, SignedAuthorizationDecision } from "@aoc-runtime/shared-types";
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
    inheritedFrom: string[];
}
export interface GovernanceDecision {
    decision: "allow" | "deny" | "conditional";
    allowed: boolean;
    evaluatedScopeId: string;
    effectiveActor: ActorRef;
    reasons: string[];
    policySourceIds: string[];
    inheritedScopeChain: string[];
}
export declare class GovernanceRuntime {
    private readonly policies;
    constructor(policies: PolicyProvider);
    resolveActor(actor: ActorRef, machineActor?: ActorRef): ActorRef;
    private resolveScopeChain;
    policyState(scopeId: string): Promise<GovernancePolicyState>;
    evaluate(context: GovernanceContext, condition: string): Promise<GovernanceDecision>;
    signDecision(decision: GovernanceDecision, privateKey: string, signer: GovernanceSignature["signer"], runtimeSource: string): SignedAuthorizationDecision<GovernanceDecision>;
}
//# sourceMappingURL=index.d.ts.map