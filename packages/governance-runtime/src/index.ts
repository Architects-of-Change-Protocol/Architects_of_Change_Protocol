import { ActorRef, GovernancePolicy, GovernanceScope, GovernanceSignature, NamespaceRef, SignedAuthorizationDecision } from "@aoc-runtime/shared-types";
import { PolicyProvider } from "@aoc-runtime/provider-interfaces";
import { signPayload, stableHash } from "../../../crypto";

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

export class GovernanceRuntime {
  constructor(private readonly policies: PolicyProvider) {}

  resolveActor(actor: ActorRef, machineActor?: ActorRef): ActorRef {
    return machineActor ?? actor;
  }

  private async resolveScopeChain(scopeId: string): Promise<string[]> {
    const chain = [scopeId];
    if (!this.policies.getParentScopeId) return chain;

    let current = scopeId;
    const guard = new Set<string>(chain);
    while (true) {
      const parent = await this.policies.getParentScopeId(current);
      if (!parent || guard.has(parent)) break;
      chain.push(parent);
      guard.add(parent);
      current = parent;
    }
    return chain;
  }

  async policyState(scopeId: string): Promise<GovernancePolicyState> {
    const scopeChain = await this.resolveScopeChain(scopeId);
    const inheritedFrom = scopeChain.slice(1);
    const policySets = await Promise.all(scopeChain.map((id) => this.policies.getPolicies(id)));
    return { scopeId, effectivePolicies: policySets.flat(), inheritedFrom };
  }

  async evaluate(context: GovernanceContext, condition: string): Promise<GovernanceDecision> {
    const state = await this.policyState(context.scope.scopeId);
    const effectiveActor = this.resolveActor(context.actor, context.machineActor);
    const matchingRules = state.effectivePolicies.flatMap((policy) =>
      policy.rules
        .filter((rule) => rule.condition === condition)
        .map((rule) => ({ policyId: policy.policyId, effect: rule.effect }))
    );

    const denied = matchingRules.filter((rule) => rule.effect === "deny");
    if (denied.length > 0) {
      return {
        decision: "deny",
        allowed: false,
        evaluatedScopeId: context.scope.scopeId,
        effectiveActor,
        reasons: [`Denied by ${denied.length} governance rule(s) for condition ${condition}.`],
        policySourceIds: denied.map((d) => d.policyId),
        inheritedScopeChain: state.inheritedFrom
      };
    }

    const allowed = matchingRules.filter((rule) => rule.effect === "allow");
    if (allowed.length > 0) {
      return {
        decision: "allow",
        allowed: true,
        evaluatedScopeId: context.scope.scopeId,
        effectiveActor,
        reasons: [`Allowed by ${allowed.length} governance rule(s) for condition ${condition}.`],
        policySourceIds: allowed.map((a) => a.policyId),
        inheritedScopeChain: state.inheritedFrom
      };
    }

    return {
      decision: "conditional",
      allowed: false,
      evaluatedScopeId: context.scope.scopeId,
      effectiveActor,
      reasons: [`No explicit governance rule matched condition ${condition}.`],
      policySourceIds: [],
      inheritedScopeChain: state.inheritedFrom
    };
  }

  signDecision(decision: GovernanceDecision, privateKey: string, signer: GovernanceSignature["signer"], runtimeSource: string): SignedAuthorizationDecision<GovernanceDecision> {
    const decisionHash = stableHash(decision);
    const evaluationHash = stableHash({ decisionHash, runtimeSource, scope: decision.evaluatedScopeId });
    const signaturePayload = { decisionHash, evaluationHash, decision };
    const signature = signPayload(signaturePayload, privateKey, signer, { runtimeSource, timestamp: new Date().toISOString() });
    return { decision, decisionHash, evaluationHash, signature };
  }
}
