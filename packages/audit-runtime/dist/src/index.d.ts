import { ActorRef, AuditEvent, NamespaceRef } from "@aoc-runtime/shared-types";
export interface DecisionExplanation {
    decisionId: string;
    outcome: "allow" | "deny";
    evaluatedPolicies: string[];
    evaluatedCapabilities: string[];
    reason: string;
}
export interface GovernanceProvenance {
    scopeId: string;
    policyVersion: string;
    actor: ActorRef;
    namespace: NamespaceRef;
}
export interface Attribution {
    initiatingActor: ActorRef;
    effectiveActor: ActorRef;
}
export interface AuditContract {
    event: AuditEvent;
    attribution: Attribution;
    explanation?: DecisionExplanation;
    provenance?: GovernanceProvenance;
}
export interface RuntimeDecisionEnvelope {
    decision: "allow" | "deny";
    allowed: boolean;
    failedStage?: "governance" | "capability" | "consent";
    reasoningChain: string[];
    provenance: Record<string, unknown>;
    explainability: Record<string, unknown>;
}
export declare class AuditRuntime {
    finalizeDecision<T extends RuntimeDecisionEnvelope>(decision: T): T;
}
//# sourceMappingURL=index.d.ts.map