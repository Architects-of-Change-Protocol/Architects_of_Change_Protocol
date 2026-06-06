"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseVerificationProvider = exports.InMemoryVerificationKeyResolver = void 0;
class InMemoryVerificationKeyResolver {
    constructor() {
        this.keys = new Map();
    }
    register(key) {
        this.keys.set(`${key.issuer}:${key.keyId}`, key);
        this.keys.set(key.issuer, key);
    }
    resolveVerificationKey(issuer) {
        return this.keys.get(issuer);
    }
}
exports.InMemoryVerificationKeyResolver = InMemoryVerificationKeyResolver;
class EnterpriseVerificationProvider {
    constructor(keyResolver, strategy, verifier = 'aoc-enterprise:assurance') {
        this.keyResolver = keyResolver;
        this.strategy = strategy;
        this.verifier = verifier;
    }
    async verifyClaim(claim, context) {
        const issuer = typeof claim.issuer === 'string' ? claim.issuer : claim.issuer.id;
        const key = await this.keyResolver.resolveVerificationKey(issuer, claim.proofRefs?.[0], context);
        const outcome = await this.strategy.verify(claim, key, context);
        const findings = typeof outcome === 'boolean' ? (outcome ? [] : ['Verification strategy rejected the claim.']) : [...outcome];
        const verifiedAt = (context?.requestedAt ?? new Date().toISOString());
        return {
            id: `${claim.id}:verification:${verifiedAt}`,
            claimRef: claim.id,
            status: findings.length === 0 ? 'Verified' : 'Failed',
            verifier: this.verifier,
            verifiedAt,
            findings,
            credentialRefs: claim.credentialRefs,
            proofRefs: claim.proofRefs,
            registryRefs: claim.registryRefs,
            semanticRefs: claim.semanticRefs,
            confidence: findings.length === 0 ? 1 : 0,
        };
    }
}
exports.EnterpriseVerificationProvider = EnterpriseVerificationProvider;
