"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceAccountingRuntime = exports.GovernanceRuntime = void 0;
const crypto_1 = require("../../../crypto");
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
    signDecision(decision, privateKey, signer, runtimeSource) {
        const decisionHash = (0, crypto_1.stableHash)(decision);
        const evaluationHash = (0, crypto_1.stableHash)({ decisionHash, runtimeSource, scope: decision.evaluatedScopeId });
        const signaturePayload = { decisionHash, evaluationHash, decision };
        const signature = (0, crypto_1.signPayload)(signaturePayload, privateKey, signer, { runtimeSource, timestamp: new Date().toISOString() });
        return { decision, decisionHash, evaluationHash, signature };
    }
}
exports.GovernanceRuntime = GovernanceRuntime;
class ResourceAccountingRuntime {
    constructor(config) {
        this.budgetState = new Map();
        this.grants = new Map();
        this.policies = new Map();
        this.lineage = [];
        config.budgets.forEach((budget) => this.budgetState.set(budget.budgetId, { ...budget, consumed: { ...budget.consumed } }));
        config.grants?.forEach((grant) => this.grants.set(grant.grantId, grant));
        config.policies?.forEach((policy) => this.policies.set(policy.scopeId, policy));
    }
    accountExecution(input) {
        const budget = this.budgetState.get(input.budgetId);
        if (!budget)
            return { allowed: false, reasons: [`Unknown budget ${input.budgetId}.`], obligations: [] };
        if (budget.revokedAt)
            return { allowed: false, reasons: [`Budget ${budget.budgetId} revoked at ${budget.revokedAt}.`], obligations: [] };
        const consumed = {
            executionUnits: input.costProfile.executionUnits,
            computeUnits: input.costProfile.computeUnits,
            escalationUnits: input.costProfile.escalationUnits ?? 0,
            memoryGrowthMb: input.costProfile.memoryGrowthMb ?? 0,
            delegationUnits: input.costProfile.delegationUnits ?? 0
        };
        const policy = this.policies.get(input.scopeId);
        const reasons = [];
        const obligations = [];
        const next = {
            executionUnits: (budget.consumed?.executionUnits ?? 0) + consumed.executionUnits,
            computeUnits: (budget.consumed?.computeUnits ?? 0) + consumed.computeUnits,
            escalationUnits: (budget.consumed?.escalationUnits ?? 0) + consumed.escalationUnits,
            memoryGrowthMb: (budget.consumed?.memoryGrowthMb ?? 0) + consumed.memoryGrowthMb,
            delegationUnits: (budget.consumed?.delegationUnits ?? 0) + consumed.delegationUnits
        };
        const exhausted = next.executionUnits > budget.executionUnits || next.computeUnits > budget.computeUnits || next.escalationUnits > budget.escalationUnits || next.memoryGrowthMb > budget.memoryGrowthMb || next.delegationUnits > budget.delegationUnits;
        if (exhausted)
            reasons.push(`Budget ${budget.budgetId} exhausted by requested execution.`);
        if (policy) {
            if (next.executionUnits > policy.executionCeiling)
                reasons.push(`Scope ${input.scopeId} exceeds execution ceiling ${policy.executionCeiling}.`);
            if (next.escalationUnits > policy.escalationLimit)
                reasons.push(`Scope ${input.scopeId} exceeds escalation limit ${policy.escalationLimit}.`);
            const threshold = (policy.exhaustionThresholdPercent / 100) * budget.executionUnits;
            if (next.executionUnits >= threshold) {
                obligations.push(this.createObligation(input, "budget-warning", `Execution consumption reached ${next.executionUnits}/${budget.executionUnits} (${policy.exhaustionThresholdPercent}% threshold).`));
            }
        }
        if (consumed.escalationUnits > 0)
            obligations.push(this.createObligation(input, "escalation-cost", `Escalation cost recorded: ${consumed.escalationUnits} units.`));
        if (consumed.memoryGrowthMb > 0)
            obligations.push(this.createObligation(input, "memory-growth", `Memory growth recorded: ${consumed.memoryGrowthMb} MB.`));
        if (input.delegatedGrantId)
            obligations.push(this.createObligation(input, "delegation-cost", `Delegated execution consumed against grant ${input.delegatedGrantId}.`));
        if (input.delegatedGrantId) {
            const grant = this.grants.get(input.delegatedGrantId);
            if (!grant || grant.revokedAt)
                reasons.push(`Delegated resource grant ${input.delegatedGrantId} is unavailable.`);
            if (grant && (consumed.executionUnits > grant.maxExecutionUnits || consumed.computeUnits > grant.maxComputeUnits || consumed.escalationUnits > grant.maxEscalationUnits || consumed.memoryGrowthMb > grant.maxMemoryGrowthMb)) {
                reasons.push(`Execution exceeds delegated resource ceilings for grant ${input.delegatedGrantId}.`);
            }
        }
        const allowed = reasons.length === 0;
        if (!allowed)
            return { allowed, reasons, obligations };
        budget.consumed = next;
        const lineageEntry = {
            entryId: `${input.actionId}:resource-lineage`,
            actionId: input.actionId,
            namespacePath: input.namespacePath,
            actorId: input.actor.actorId,
            budgetId: budget.budgetId,
            delegatedGrantId: input.delegatedGrantId,
            parentEntryId: input.parentEntryId,
            costProfileId: input.costProfile.costProfileId,
            consumed,
            obligations,
            timestamp: input.timestamp ?? new Date().toISOString()
        };
        this.lineage.push(lineageEntry);
        return { allowed, reasons, obligations, lineageEntry };
    }
    exportResourceContinuity() {
        return {
            budgets: Array.from(this.budgetState.values()),
            delegatedGrants: Array.from(this.grants.values()),
            policies: Array.from(this.policies.values()),
            lineage: [...this.lineage]
        };
    }
    emergencyFreezeBudget(budgetId, revokedAt = new Date().toISOString()) {
        const budget = this.budgetState.get(budgetId);
        if (!budget)
            return false;
        budget.revokedAt = revokedAt;
        return true;
    }
    createObligation(input, obligationType, detail) {
        return {
            obligationId: `${input.actionId}:${obligationType}`,
            obligationType,
            actorId: input.actor.actorId,
            scopeId: input.scopeId,
            status: "pending",
            detail,
            issuedAt: input.timestamp ?? new Date().toISOString()
        };
    }
}
exports.ResourceAccountingRuntime = ResourceAccountingRuntime;
