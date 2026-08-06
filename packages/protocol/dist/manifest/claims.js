"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSovereignKeyPair = exports.AuthorityClaimKind = void 0;
exports.buildOriginClaim = buildOriginClaim;
exports.buildAuthorityClaim = buildAuthorityClaim;
exports.signClaim = signClaim;
exports.verifySignedClaim = verifySignedClaim;
exports.contestClaim = contestClaim;
const node_crypto_1 = require("node:crypto");
const claim_enums_1 = require("../claims/claim-enums");
const canonical_1 = require("../canonical");
const proof_1 = require("./proof");
Object.defineProperty(exports, "generateSovereignKeyPair", { enumerable: true, get: function () { return proof_1.generateSovereignKeyPair; } });
/**
 * Sub-kind of an AuthorityClaim, carried in `metadata.kind` rather than as
 * a new top-level `ClaimType` per role — keeps the core `ClaimType`
 * vocabulary generic (per-domain rights taxonomies, e.g. music roles,
 * belong to future domain profiles, not core Protocol).
 */
exports.AuthorityClaimKind = {
    Authorship: 'Authorship',
    Rights: 'Rights',
    License: 'License',
    Custom: 'Custom',
};
function buildOriginClaim(input) {
    return {
        id: input.id,
        type: claim_enums_1.ClaimType.Origin,
        subject: input.sovereignAssetId,
        issuer: input.issuer,
        assertionRef: `${input.id}:assertion`,
        evidenceRefs: input.evidenceRefs ?? [],
        attestationRefs: [],
        issuedAt: input.assertedAt,
        metadata: { assertedOrigin: input.assertedOrigin },
    };
}
function buildAuthorityClaim(input) {
    return {
        id: input.id,
        type: claim_enums_1.ClaimType.Authorship,
        subject: input.sovereignAssetId,
        issuer: input.issuer,
        assertionRef: `${input.id}:assertion`,
        evidenceRefs: input.evidenceRefs ?? [],
        attestationRefs: [],
        issuedAt: input.issuedAt,
        metadata: { kind: input.kind, statement: input.statement },
    };
}
function signClaim(claim, privateKeyPem, signingKey, now) {
    const digest = (0, node_crypto_1.createHash)('sha256').update((0, canonical_1.canonicalizeJSON)(claim)).digest('hex');
    const proof = (0, proof_1.signSovereignPayload)(claim, privateKeyPem, signingKey, now);
    return { claim, digest, proof };
}
function verifySignedClaim(signed) {
    const reasons = [];
    const recomputedDigest = (0, node_crypto_1.createHash)('sha256').update((0, canonical_1.canonicalizeJSON)(signed.claim)).digest('hex');
    if (recomputedDigest !== signed.digest) {
        reasons.push('CLAIM_DIGEST_MISMATCH');
    }
    if (!(0, proof_1.verifySovereignSignature)(signed.claim, signed.proof)) {
        reasons.push('CLAIM_SIGNATURE_INVALID');
    }
    return { valid: reasons.length === 0, reasons };
}
function contestClaim(input) {
    return {
        id: input.id,
        claimRef: input.claimRef,
        status: claim_enums_1.StandingStatus.Contested,
        reason: input.reason,
        effectiveAt: input.effectiveAt,
    };
}
