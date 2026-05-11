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
    async policyState(scopeId) {
        return { scopeId, effectivePolicies: await this.policies.getPolicies(scopeId) };
    }
    async evaluatePolicy(context, condition) {
        const state = await this.policyState(context.scope.scopeId);
        const matches = state.effectivePolicies.flatMap((policy) => policy.rules.filter((rule) => rule.condition === condition).map((rule) => rule.effect));
        if (matches.includes("deny"))
            return false;
        return matches.includes("allow");
    }
}
exports.GovernanceRuntime = GovernanceRuntime;
