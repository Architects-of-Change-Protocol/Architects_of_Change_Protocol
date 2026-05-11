"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PMFreakAocAdapter = void 0;
const governance_runtime_1 = require("@aoc-runtime/governance-runtime");
const capability_runtime_1 = require("@aoc-runtime/capability-runtime");
class PMFreakAocAdapter {
    constructor(providers) {
        this.providers = providers;
        this.governance = new governance_runtime_1.GovernanceRuntime(providers.policies);
        this.capability = new capability_runtime_1.CapabilityRuntime(providers.capabilities);
    }
    async evaluateAction(input) {
        const policyAllowed = await this.governance.evaluatePolicy(input, `action:${input.action}`);
        if (!policyAllowed)
            return false;
        const capabilityDecision = await this.capability.evaluate(input);
        return capabilityDecision.allowed;
    }
    async writeAudit(event) {
        await this.providers.audit.append(event);
    }
}
exports.PMFreakAocAdapter = PMFreakAocAdapter;
