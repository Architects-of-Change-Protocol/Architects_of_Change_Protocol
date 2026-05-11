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

export class GovernanceRuntime {
  constructor(private readonly policies: PolicyProvider) {}

  resolveActor(actor: ActorRef, machineActor?: ActorRef): ActorRef {
    return machineActor ?? actor;
  }

  async policyState(scopeId: string): Promise<GovernancePolicyState> {
    return { scopeId, effectivePolicies: await this.policies.getPolicies(scopeId) };
  }

  async evaluatePolicy(context: GovernanceContext, condition: string): Promise<boolean> {
    const state = await this.policyState(context.scope.scopeId);
    const matches = state.effectivePolicies.flatMap((policy) =>
      policy.rules.filter((rule) => rule.condition === condition).map((rule) => rule.effect)
    );
    if (matches.includes("deny")) return false;
    return matches.includes("allow");
  }
}
