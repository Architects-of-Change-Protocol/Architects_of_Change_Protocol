"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityRuntime = void 0;
class CapabilityRuntime {
    constructor(provider) {
        this.provider = provider;
    }
    async evaluate(input) {
        const capabilities = await this.provider.resolve(input.actor, input.namespace);
        const matched = capabilities.find((c) => c.action === input.action && c.resource === input.resource);
        if (!matched)
            return { allowed: false, reason: "no_capability_match" };
        return { allowed: true, matchedCapability: matched, reason: "capability_granted" };
    }
}
exports.CapabilityRuntime = CapabilityRuntime;
