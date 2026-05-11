import { ActorRef, CapabilityRef, NamespaceRef } from "@aoc-runtime/shared-types";
import { CapabilityProvider } from "@aoc-runtime/provider-interfaces";
export interface CapabilityEvaluationInput {
    actor: ActorRef;
    namespace: NamespaceRef;
    action: string;
    resource: string;
    now?: string;
}
export type CapabilityDecisionReason = "allowed" | "denied" | "missing_capability" | "expired_capability";
export interface CapabilityDecision {
    allowed: boolean;
    reason: CapabilityDecisionReason;
    matchedCapability?: CapabilityRef;
    inheritedFromNamespace?: string;
    reasons: string[];
}
export declare class CapabilityRuntime {
    private readonly provider;
    constructor(provider: CapabilityProvider);
    private namespacePathIncludes;
    evaluate(input: CapabilityEvaluationInput): Promise<CapabilityDecision>;
}
//# sourceMappingURL=index.d.ts.map