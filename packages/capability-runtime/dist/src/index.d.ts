import { ActorRef, CapabilityRef, NamespaceRef } from "@aoc-runtime/shared-types";
import { CapabilityProvider } from "@aoc-runtime/provider-interfaces";
export interface CapabilityEvaluationInput {
    actor: ActorRef;
    namespace: NamespaceRef;
    action: string;
    resource: string;
}
export interface CapabilityDecision {
    allowed: boolean;
    matchedCapability?: CapabilityRef;
    reason: string;
}
export declare class CapabilityRuntime {
    private readonly provider;
    constructor(provider: CapabilityProvider);
    evaluate(input: CapabilityEvaluationInput): Promise<CapabilityDecision>;
}
//# sourceMappingURL=index.d.ts.map