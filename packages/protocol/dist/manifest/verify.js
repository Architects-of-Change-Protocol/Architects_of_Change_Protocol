"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySovereignManifest = verifySovereignManifest;
const content_identity_1 = require("../identity/content-identity");
const proof_1 = require("./proof");
const manifest_1 = require("./manifest");
/**
 * Independently verifies a `SignedSovereignManifest`. Never returns a bare
 * `true`/`false` — every attempted check is reported individually, and a
 * check that was never attempted is reported as `not_performed` rather
 * than folded silently into an optimistic overall result. `valid` reflects
 * whether every *attempted* check passed; checks that were not attempted
 * (e.g. no `contentBytes` supplied) do not by themselves make the result
 * invalid, but they are visible in `checks` so callers can decide whether
 * that is acceptable for their use case.
 */
async function verifySovereignManifest(signed, options = {}) {
    const reasons = [];
    const structuralValidation = (0, manifest_1.validateSovereignManifestV1)(signed.manifest);
    const manifestStructure = structuralValidation.valid ? 'valid' : 'invalid';
    if (!structuralValidation.valid) {
        reasons.push(...structuralValidation.reasons);
    }
    const recomputedDigest = (0, manifest_1.computeManifestDigest)(signed.manifest);
    const manifestDigest = recomputedDigest === signed.manifestDigest ? 'valid' : 'invalid';
    if (manifestDigest === 'invalid') {
        reasons.push('MANIFEST_DIGEST_MISMATCH');
    }
    const signatureValid = (0, proof_1.verifySovereignSignature)(signed.manifest, signed.proof);
    const signature = signatureValid ? 'valid' : 'invalid';
    if (!signatureValid) {
        reasons.push('SIGNATURE_INVALID');
    }
    if (signed.proof.payloadHash !== signed.manifestDigest) {
        reasons.push('PROOF_PAYLOAD_HASH_MISMATCH');
    }
    let contentDigest = 'not_performed';
    if (options.contentBytes) {
        const contentCheck = (0, content_identity_1.verifyContentIdentity)(options.contentBytes, signed.manifest.contentIdentity);
        contentDigest = contentCheck.valid ? 'valid' : 'invalid';
        if (!contentCheck.valid && contentCheck.reason) {
            reasons.push(contentCheck.reason);
        }
    }
    let issuerBinding = 'not_performed';
    if (options.verificationKeyResolver) {
        const issuer = options.issuer ?? (typeof signed.manifest.registrant === 'string' ? signed.manifest.registrant : undefined);
        if (!issuer) {
            issuerBinding = 'not_performed';
            reasons.push('ISSUER_BINDING_NOT_PERFORMED_NO_ISSUER');
        }
        else {
            const descriptor = await options.verificationKeyResolver.resolveVerificationKey(issuer);
            if (descriptor && descriptor.keyId === signed.proof.keyId) {
                issuerBinding = 'verified';
            }
            else {
                issuerBinding = 'unverified';
                reasons.push('ISSUER_BINDING_UNVERIFIED');
            }
        }
    }
    const valid = manifestStructure === 'valid' &&
        manifestDigest === 'valid' &&
        signature === 'valid' &&
        contentDigest !== 'invalid' &&
        issuerBinding !== 'unverified';
    return {
        valid,
        checks: { manifestStructure, manifestDigest, signature, contentDigest, issuerBinding },
        reasons,
    };
}
