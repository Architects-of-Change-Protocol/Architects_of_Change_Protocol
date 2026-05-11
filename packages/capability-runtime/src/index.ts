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

export class CapabilityRuntime {
  constructor(private readonly provider: CapabilityProvider) {}

  async evaluate(input: CapabilityEvaluationInput): Promise<CapabilityDecision> {
    const capabilities = await this.provider.resolve(input.actor, input.namespace);
    const matched = capabilities.find((c) => c.action === input.action && c.resource === input.resource);
    if (!matched) return { allowed: false, reason: "no_capability_match" };
    return { allowed: true, matchedCapability: matched, reason: "capability_granted" };
  }
}
