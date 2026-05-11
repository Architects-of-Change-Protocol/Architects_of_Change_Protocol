"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceRuntime = void 0;
class GovernanceRuntime {
    constructor(policies) {
        this.policies = policies;
    }
    resolveActor(actor, machineActor) {
        return machineActor ?? actor;
    }
    async resolveScopeChain(scopeId) {
        const chain = [scopeId];
        if (!this.policies.getParentScopeId)
            return chain;
        let current = scopeId;
        const guard = new Set(chain);
        while (true) {
            const parent = await this.policies.getParentScopeId(current);
            if (!parent || guard.has(parent))
                break;
            chain.push(parent);
            guard.add(parent);
            current = parent;
        }
        return chain;
    }
    async policyState(scopeId) {
        const scopeChain = await this.resolveScopeChain(scopeId);
        const inheritedFrom = scopeChain.slice(1);
        const policySets = await Promise.all(scopeChain.map((id) => this.policies.getPolicies(id)));
        return { scopeId, effectivePolicies: policySets.flat(), inheritedFrom };
    }
    async evaluate(context, condition) {
        const state = await this.policyState(context.scope.scopeId);
        const effectiveActor = this.resolveActor(context.actor, context.machineActor);
        const matchingRules = state.effectivePolicies.flatMap((policy) => policy.rules
            .filter((rule) => rule.condition === condition)
            .map((rule) => ({ policyId: policy.policyId, effect: rule.effect })));
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
}
exports.GovernanceRuntime = GovernanceRuntime;
