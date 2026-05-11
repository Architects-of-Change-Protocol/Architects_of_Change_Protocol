import { ActorRef, AuditEvent, GovernanceSignature, NamespaceRef, SignedAuditEvent } from "@aoc-runtime/shared-types";
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
    createSignedEvent(event: AuditEvent, chainId: string, signature: GovernanceSignature, previous?: SignedAuditEvent<AuditEvent>): SignedAuditEvent<AuditEvent>;
    verifyChain(events: SignedAuditEvent<AuditEvent>[]): boolean;
}
export declare const signAuditEvent: (payload: {
    eventHash: string;
    event: AuditEvent;
}, privateKey: string, signer: GovernanceSignature["signer"], provenance: GovernanceSignature["provenance"]) => GovernanceSignature;
//# sourceMappingURL=index.d.ts.map