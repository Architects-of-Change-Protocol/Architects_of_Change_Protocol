"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustRegistryRuntime = void 0;
class TrustRegistryRuntime {
    constructor(federation) {
        this.federation = federation;
        this.signers = new Map();
    }
    registerSigner(record) { this.signers.set(record.signerKeyId, record); }
    revokeSigner(signerKeyId, revokedAt = new Date().toISOString()) {
        const existing = this.signers.get(signerKeyId);
        if (existing)
            this.signers.set(signerKeyId, { ...existing, revokedAt });
    }
    evaluateSignatureTrust(signature, scope, at = new Date().toISOString()) {
        const signer = this.signers.get(signature.keyId);
        const reasons = [];
        const boundary = [];
        const rejected = [];
        const revoked = [];
        if (!signer)
            return { trusted: false, trustedAuthorityPath: [], rejectedAuthorityPath: [signature.keyId], revokedIntermediaries: [], trustScopeReasoning: ["Signer not registered."], federationBoundaryReasoning: [] };
        if (signer.revokedAt && signer.revokedAt <= at) {
            revoked.push(signer.signerKeyId);
            rejected.push(signer.signerKeyId);
            reasons.push("Signer revoked.");
        }
        if (signer.expiresAt && signer.expiresAt < at) {
            rejected.push(signer.signerKeyId);
            reasons.push("Signer expired.");
        }
        if (scope && !this.scopeAllowed(signer.scopes, scope)) {
            rejected.push(signer.signerKeyId);
            reasons.push("Signer scope mismatch.");
        }
        const chain = this.resolveTrustChain(signature.signer.runtimeId, at);
        if (!chain.valid) {
            rejected.push(...chain.path);
            revoked.push(...chain.revokedIntermediaries);
            reasons.push(...chain.reasons);
        }
        else {
            boundary.push(`Federation ${this.federation.federationId} trust path accepted.`);
        }
        const trusted = rejected.length === 0 && revoked.length === 0;
        return { trusted, trustedAuthorityPath: trusted ? chain.path : [], rejectedAuthorityPath: [...new Set(rejected)], revokedIntermediaries: [...new Set(revoked)], trustScopeReasoning: reasons, federationBoundaryReasoning: boundary };
    }
    resolveTrustChain(targetRuntimeId, at) {
        const roots = this.federation.nodes.filter((n) => !n.revokedAt && (!n.activeUntil || n.activeUntil >= at));
        const queue = roots.map((r) => ({ runtimeId: r.runtimeId, path: [r.runtimeId] }));
        const visited = new Set();
        const revokedIntermediaries = [];
        while (queue.length) {
            const cur = queue.shift();
            if (cur.runtimeId === targetRuntimeId)
                return { valid: true, path: cur.path, revokedIntermediaries, reasons: [] };
            if (visited.has(cur.runtimeId))
                continue;
            visited.add(cur.runtimeId);
            for (const edge of this.federation.edges.filter((e) => e.fromRuntimeId === cur.runtimeId)) {
                if (!this.edgeActive(edge, at)) {
                    if (edge.revokedAt)
                        revokedIntermediaries.push(edge.edgeId);
                    continue;
                }
                queue.push({ runtimeId: edge.toRuntimeId, path: [...cur.path, edge.toRuntimeId] });
            }
        }
        return { valid: false, path: [], revokedIntermediaries, reasons: ["No active federated trust path to runtime."] };
    }
    edgeActive(edge, at) {
        if (edge.revokedAt && edge.revokedAt <= at)
            return false;
        if (edge.expiresAt && edge.expiresAt < at)
            return false;
        return edge.issuedAt <= at;
    }
    scopeAllowed(allowed, requested) {
        return allowed.some((scope) => scope.type === requested.type
            && (scope.organizationId === undefined || scope.organizationId === requested.organizationId)
            && (scope.workspaceId === undefined || scope.workspaceId === requested.workspaceId)
            && (scope.namespacePath === undefined || scope.namespacePath === requested.namespacePath)
            && (scope.machineId === undefined || scope.machineId === requested.machineId));
    }
}
exports.TrustRegistryRuntime = TrustRegistryRuntime;
