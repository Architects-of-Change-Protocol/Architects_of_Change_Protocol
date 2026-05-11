import { ActorRef, CognitionBudget, DelegatedResourceGrant, ExecutionCostProfile, GovernancePolicy, GovernanceScope, GovernanceSignature, NamespaceRef, ResourceConstraintPolicy, ResourceLineageEntry, ResourceObligation, SignedAuthorizationDecision } from "@aoc-runtime/shared-types";
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
export interface ResourceAccountingInput {
    actionId: string;
    actor: ActorRef;
    scopeId: string;
    namespacePath: string;
    budgetId: string;
    costProfile: ExecutionCostProfile;
    parentEntryId?: string;
    delegatedGrantId?: string;
    timestamp?: string;
}
export interface ResourceAccountingDecision {
    allowed: boolean;
    reasons: string[];
    obligations: ResourceObligation[];
    lineageEntry?: ResourceLineageEntry;
}
export declare class ResourceAccountingRuntime {
    private readonly budgetState;
    private readonly grants;
    private readonly policies;
    private readonly lineage;
    constructor(config: {
        budgets: CognitionBudget[];
        grants?: DelegatedResourceGrant[];
        policies?: ResourceConstraintPolicy[];
    });
    accountExecution(input: ResourceAccountingInput): ResourceAccountingDecision;
    exportResourceContinuity(): {
        budgets: CognitionBudget[];
        delegatedGrants: DelegatedResourceGrant[];
        policies: ResourceConstraintPolicy[];
        lineage: ResourceLineageEntry[];
    };
    emergencyFreezeBudget(budgetId: string, revokedAt?: string): boolean;
    private createObligation;
}
//# sourceMappingURL=index.d.ts.map