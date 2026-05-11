"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrityVerificationRuntime = void 0;
exports.computePortableIntegrity = computePortableIntegrity;
exports.validatePortablePackage = validatePortablePackage;
const crypto_1 = require("../../../crypto");
function computePortableIntegrity(pkg) {
    const topologyHash = (0, crypto_1.stableHash)(pkg.topology);
    const governanceSnapshotHash = (0, crypto_1.stableHash)(pkg.governanceSnapshot);
    const auditContinuityHash = (0, crypto_1.stableHash)(pkg.auditContinuity);
    const packageHash = (0, crypto_1.stableHash)(pkg);
    const provenanceHash = (0, crypto_1.stableHash)({ packageId: pkg.packageId, sourceOrganizationId: pkg.sourceOrganizationId, exportedAt: pkg.exportedAt });
    return { packageHash, governanceSnapshotHash, auditContinuityHash, topologyHash, provenanceHash };
}
function validatePortablePackage(pkg) {
    const errors = [];
    if (!pkg.packageId)
        errors.push("missing_package_id");
    if (!pkg.sourceOrganizationId)
        errors.push("missing_source_organization_id");
    if (!pkg.topology.namespaces.length)
        errors.push("empty_topology");
    if (pkg.integrity) {
        const computed = computePortableIntegrity(pkg);
        if (computed.packageHash !== pkg.integrity.packageHash)
            errors.push("package_hash_mismatch");
        if (computed.governanceSnapshotHash !== pkg.integrity.governanceSnapshotHash)
            errors.push("governance_hash_mismatch");
        if (computed.auditContinuityHash !== pkg.integrity.auditContinuityHash)
            errors.push("audit_hash_mismatch");
        if (computed.topologyHash !== pkg.integrity.topologyHash)
            errors.push("topology_hash_mismatch");
    }
    return { valid: errors.length === 0, errors };
}
class IntegrityVerificationRuntime {
    verifyAuthorizationDecision(decision) {
        return (0, crypto_1.verifyPayloadSignature)({ decisionHash: decision.decisionHash, evaluationHash: decision.evaluationHash, decision: decision.decision }, decision.signature);
    }
    verifyConsentGrant(grant) {
        return (0, crypto_1.verifyPayloadSignature)({ grantHash: grant.grantHash, grant: grant.grant }, grant.issuerSignature);
    }
    verifyAuditChain(events) {
        return events.every((event, index) => {
            const previous = index === 0 ? undefined : events[index - 1];
            const previousHash = previous?.eventHash;
            if (event.chainPosition !== index)
                return false;
            if (event.previousEventHash !== previousHash)
                return false;
            const computedHash = (0, crypto_1.stableHash)({ chainId: event.chainId, chainPosition: event.chainPosition, previousEventHash: event.previousEventHash, event: event.event });
            if (computedHash !== event.eventHash)
                return false;
            return (0, crypto_1.verifyPayloadSignature)({ eventHash: event.eventHash, event: event.event }, event.signature);
        });
    }
    verifyExportIntegrity(pkg) {
        if (!pkg.integrity)
            return false;
        return validatePortablePackage(pkg).valid;
    }
}
exports.IntegrityVerificationRuntime = IntegrityVerificationRuntime;
