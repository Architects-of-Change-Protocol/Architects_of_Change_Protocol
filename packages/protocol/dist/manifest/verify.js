"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySovereignManifest = verifySovereignManifest;
exports.verifySignedSovereignClaim = verifySignedSovereignClaim;
const canonical_1 = require("../canonical");
const claim_enums_1 = require("../claims/claim-enums");
const content_identity_1 = require("../identity/content-identity");
const proof_1 = require("./proof");
const claims_1 = require("./claims");
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
    // Content verification is performed only when there is both something to
    // check (`contentBytes`) and a declared commitment to check it against
    // (`manifest.contentIdentity`). A manifest that declares no content
    // identity is not an integrity failure — it asserted no
    // content-integrity claim, so there is nothing to confirm or refute, and
    // fabricating a comparison target (hashing the external reference, the
    // locator, or the manifest) would manufacture a verification result
    // nobody ever signed. Both honest gaps are reported as `not_performed`,
    // never as `valid` and never as `invalid`.
    let contentDigest = 'not_performed';
    const declaredContentIdentity = signed.manifest.contentIdentity;
    if (options.contentBytes && declaredContentIdentity) {
        const contentCheck = (0, content_identity_1.verifyContentIdentity)(options.contentBytes, declaredContentIdentity);
        contentDigest = contentCheck.valid ? 'valid' : 'invalid';
        if (!contentCheck.valid && contentCheck.reason) {
            reasons.push(contentCheck.reason);
        }
    }
    else if (options.contentBytes && !declaredContentIdentity) {
        reasons.push('CONTENT_DIGEST_NOT_PERFORMED_NO_CONTENT_IDENTITY');
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
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * The issuer id a binding check resolves against.
 *
 * `CanonicalIssuer` is `string | CanonicalPrincipalRef`, and only the
 * identifier participates: `displayName`, `source` and `metadata` are never
 * read, never resolved and never treated as identity. Returning `undefined`
 * for anything else is what makes a binding honestly `not_performed` instead
 * of guessed.
 */
function canonicalIssuerId(issuer) {
    if (isNonBlankString(issuer))
        return issuer;
    if (isPlainObject(issuer) && isNonBlankString(issuer.id))
        return issuer.id;
    return undefined;
}
/**
 * Whether a value can be serialized under `aoc-canonical-json/1` at all.
 *
 * Uses the one authoritative canonicalizer rather than reimplementing its
 * rules; the thrown error is discarded rather than surfaced, so no raw
 * exception text or stack reaches a verification result.
 */
function isCanonicalizable(value) {
    // The outcome is assigned rather than returned out of the `catch`, so the
    // failing branch is an explicit negative result rather than a swallowed
    // error. The thrown value itself is deliberately discarded: no raw exception
    // text, message or stack ever reaches a verification result or evidence.
    let canonicalizable = true;
    try {
        (0, canonical_1.canonicalizeJSON)(value);
    }
    catch {
        canonicalizable = false;
    }
    return canonicalizable;
}
function validateVerifiableSovereignClaim(claim) {
    if (!isPlainObject(claim)) {
        return { valid: false, reasons: ['INVALID_CLAIM_STRUCTURE'] };
    }
    switch (claim.type) {
        case claim_enums_1.ClaimType.Origin:
            return (0, claims_1.validateOriginClaim)(claim);
        case claim_enums_1.ClaimType.Authorship:
            return (0, claims_1.validateAuthorityClaim)(claim);
        case claim_enums_1.ClaimType.Derivation:
            return (0, claims_1.validateDerivationClaim)(claim);
        default:
            // Structurally inspectable, but not a claim type this version can
            // structurally verify. Reported honestly as an invalid target rather
            // than waved through on the strength of a passing signature.
            return { valid: false, reasons: ['UNSUPPORTED_SOVEREIGN_CLAIM_TYPE'] };
    }
}
/**
 * Independently verifies a `SignedClaim`, reporting each dimension separately.
 *
 * Additive companion to `verifySovereignManifest`, with the same shape and the
 * same honesty rules. The cryptographic work is **not** reimplemented here:
 * `verifySignedClaim` remains the owning primitive for the claim digest and
 * the Ed25519 signature, and its existing reason codes
 * (`CLAIM_DIGEST_MISMATCH`, `CLAIM_SIGNATURE_INVALID`) are preserved verbatim
 * and mapped onto explicit check outcomes. What this adds on top is the two
 * things a bare digest/signature check cannot answer on its own: whether the
 * signed artifact is a structurally valid canonical sovereign claim, and
 * whether the signing key binds to the asserted issuer.
 *
 * What a passing result establishes, at most: the holder of the private key
 * matching `proof.publicKey` signed this canonical claim, and — when
 * `issuerBinding` is `verified` — the supplied resolver binds that key id to
 * the asserted issuer. It does not establish that the assertion is
 * historically true, that the issuer had authority to make it, that ownership
 * or a licence exists, that the key has not been revoked, or that the claim is
 * uncontested. A cryptographically valid claim can be `Contested`, and this
 * function neither reads nor writes claim standing.
 */
async function verifySignedSovereignClaim(signed, options = {}) {
    const reasons = [];
    const structuralValidation = validateVerifiableSovereignClaim(signed.claim);
    const claimStructure = structuralValidation.valid ? 'valid' : 'invalid';
    if (!structuralValidation.valid) {
        reasons.push(...structuralValidation.reasons);
    }
    let claimDigest;
    let signature;
    if (isCanonicalizable(signed.claim)) {
        const cryptographic = (0, claims_1.verifySignedClaim)(signed);
        reasons.push(...cryptographic.reasons);
        claimDigest = cryptographic.reasons.includes('CLAIM_DIGEST_MISMATCH') ? 'invalid' : 'valid';
        signature = cryptographic.reasons.includes('CLAIM_SIGNATURE_INVALID') ? 'invalid' : 'valid';
    }
    else {
        // A claim that cannot be canonicalized cannot match any digest or any
        // signature, because there is no canonical serialization to recompute
        // either over. Failing both checks closed is the truthful answer; the
        // alternative — letting the canonicalizer throw out of a verification
        // call — would turn "this artifact does not verify" into a crash.
        claimDigest = 'invalid';
        signature = 'invalid';
        reasons.push('CLAIM_NOT_CANONICALIZABLE');
    }
    let issuerBinding = 'not_performed';
    if (options.verificationKeyResolver) {
        const issuer = options.issuer ?? canonicalIssuerId(signed.claim?.issuer);
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
    const valid = claimStructure === 'valid'
        && claimDigest === 'valid'
        && signature === 'valid'
        && issuerBinding !== 'unverified';
    return { valid, checks: { claimStructure, claimDigest, signature, issuerBinding }, reasons };
}
