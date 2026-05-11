"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationRuntime = void 0;
class AuthorizationRuntime {
    constructor(governance, capability, consent, audit) {
        this.governance = governance;
        this.capability = capability;
        this.consent = consent;
        this.audit = audit;
    }
    async evaluate(input) {
        const governance = await this.governance.evaluate(input, `action:${input.action}`);
        if (!governance.allowed) {
            return this.audit.finalizeDecision({
                decision: "deny", allowed: false, failedStage: "governance", reasoningChain: governance.reasons,
                provenance: { policySource: governance.policySourceIds, inheritedScopeChain: governance.inheritedScopeChain },
                explainability: { governance }
            });
        }
        const capability = await this.capability.evaluate(input);
        if (!capability.allowed || !capability.matchedCapability) {
            return this.audit.finalizeDecision({
                decision: "deny", allowed: false, failedStage: "capability", reasoningChain: capability.reasons,
                provenance: { capabilitySource: capability.matchedCapability?.capabilityId, inheritedCapabilitySource: capability.inheritedFromNamespace },
                explainability: { governance, capability }
            });
        }
        const consent = await this.consent.evaluate({
            actorId: input.actor.actorId,
            capability: capability.matchedCapability,
            at: input.at,
            machineActorId: input.machineActor?.actorId
        });
        if (!consent.allowed) {
            return this.audit.finalizeDecision({
                decision: "deny", allowed: false, failedStage: "consent", reasoningChain: consent.reasons,
                provenance: { consentSource: consent.grant?.grantId },
                explainability: { governance, capability, consent }
            });
        }
        return this.audit.finalizeDecision({
            decision: "allow", allowed: true,
            reasoningChain: [...governance.reasons, ...capability.reasons, ...consent.reasons],
            provenance: {
                policySource: governance.policySourceIds,
                capabilitySource: capability.matchedCapability.capabilityId,
                consentSource: consent.grant?.grantId,
                inheritedScopeChain: governance.inheritedScopeChain,
                inheritedCapabilitySource: capability.inheritedFromNamespace
            },
            explainability: { governance, capability, consent }
        });
    }
}
exports.AuthorizationRuntime = AuthorizationRuntime;
