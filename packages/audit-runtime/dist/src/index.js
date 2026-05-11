"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRuntime = void 0;
class AuditRuntime {
    finalizeDecision(decision) {
        return {
            ...decision,
            provenance: {
                runtimeAttribution: "aoc-runtime",
                policySourceAttribution: decision.provenance.policySource,
                machineAttribution: decision.explainability.governance?.effectiveActor?.actorType === "machine",
                ...decision.provenance
            }
        };
    }
}
exports.AuditRuntime = AuditRuntime;
