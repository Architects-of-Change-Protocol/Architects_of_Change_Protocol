"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSovereignKeyPair = exports.SOVEREIGN_MANIFEST_SCHEMA_VERSION = void 0;
exports.validateSovereignManifestV1 = validateSovereignManifestV1;
exports.buildSovereignManifestV1 = buildSovereignManifestV1;
exports.computeManifestDigest = computeManifestDigest;
exports.signSovereignManifest = signSovereignManifest;
const node_crypto_1 = require("node:crypto");
const canonical_1 = require("../canonical");
const content_identity_1 = require("../identity/content-identity");
const sovereign_asset_id_1 = require("../identity/sovereign-asset-id");
const subject_reference_1 = require("../identity/subject-reference");
const state_1 = require("./state");
const proof_1 = require("./proof");
Object.defineProperty(exports, "generateSovereignKeyPair", { enumerable: true, get: function () { return proof_1.generateSovereignKeyPair; } });
exports.SOVEREIGN_MANIFEST_SCHEMA_VERSION = 'aoc-sovereign-manifest/1';
function hasOwnField(manifest, key) {
    return typeof manifest === 'object' && manifest !== null && Object.prototype.hasOwnProperty.call(manifest, key);
}
/**
 * Structural + cross-field validation for a `SovereignManifestV1`. This is
 * used both when building a new manifest and when verifying a resolved
 * one — it fails closed (reports a reason) rather than silently accepting
 * malformed input.
 */
function validateSovereignManifestV1(manifest) {
    const reasons = [];
    if (manifest.schemaVersion !== exports.SOVEREIGN_MANIFEST_SCHEMA_VERSION) {
        reasons.push('UNSUPPORTED_SCHEMA_VERSION');
    }
    if (manifest.canonicalizationProfile !== canonical_1.CANONICAL_JSON_PROFILE) {
        reasons.push('UNSUPPORTED_CANONICALIZATION_PROFILE');
    }
    if (!(0, sovereign_asset_id_1.isValidSovereignAssetId)(manifest.sovereignAssetId)) {
        reasons.push('INVALID_SOVEREIGN_ASSET_ID');
    }
    if (!Number.isInteger(manifest.manifestVersion) || manifest.manifestVersion < 1) {
        reasons.push('INVALID_MANIFEST_VERSION');
    }
    // Optional fields are validated only when structurally present. A
    // present-but-`undefined` optional field is treated as invalid rather
    // than absent: `aoc-canonical-json/1` refuses to serialize `undefined`,
    // so such a manifest could never be canonicalized or signed, and
    // reporting that as a structural defect here is more truthful than
    // letting canonicalization throw later.
    if (hasOwnField(manifest, 'contentIdentity') && !(0, content_identity_1.isValidContentIdentity)(manifest.contentIdentity)) {
        reasons.push('INVALID_CONTENT_IDENTITY');
    }
    if (hasOwnField(manifest, 'externalReference') && !(0, subject_reference_1.isValidSovereignExternalReference)(manifest.externalReference)) {
        reasons.push('INVALID_EXTERNAL_REFERENCE');
    }
    if (!(0, state_1.isValidSovereignAssetState)(manifest.state)) {
        reasons.push('INVALID_STATE');
    }
    if (typeof manifest.createdAt !== 'string' || Number.isNaN(Date.parse(manifest.createdAt))) {
        reasons.push('INVALID_TIMESTAMP');
    }
    if (manifest.originClaim && manifest.originClaim.subject !== manifest.sovereignAssetId) {
        reasons.push('ORIGIN_CLAIM_SUBJECT_MISMATCH');
    }
    for (const claim of manifest.authorityClaims) {
        if (claim.subject !== manifest.sovereignAssetId) {
            reasons.push('AUTHORITY_CLAIM_SUBJECT_MISMATCH');
            break;
        }
    }
    return { valid: reasons.length === 0, reasons };
}
/**
 * Builds and validates a v1 sovereign manifest. Throws if the resulting
 * manifest fails `validateSovereignManifestV1` — this is a construction
 * helper, not a lenient/partial builder.
 */
function buildSovereignManifestV1(input, now = new Date()) {
    const manifest = {
        schemaVersion: exports.SOVEREIGN_MANIFEST_SCHEMA_VERSION,
        canonicalizationProfile: canonical_1.CANONICAL_JSON_PROFILE,
        sovereignAssetId: input.sovereignAssetId,
        manifestVersion: input.manifestVersion ?? 1,
        // Absent optional fields are omitted structurally, never emitted as
        // `undefined` — canonical JSON rejects ambiguous values, and an
        // absent integrity assertion must stay absent rather than being
        // invented from the external reference, the locator, or the subject.
        ...(input.externalReference === undefined ? {} : { externalReference: input.externalReference }),
        ...(input.contentIdentity === undefined ? {} : { contentIdentity: input.contentIdentity }),
        registrant: input.registrant,
        ...(input.originClaim ? { originClaim: input.originClaim } : {}),
        authorityClaims: input.authorityClaims ?? [],
        state: input.state ?? state_1.SovereignAssetState.Active,
        createdAt: input.createdAt ?? now.toISOString(),
    };
    const validation = validateSovereignManifestV1(manifest);
    if (!validation.valid) {
        throw new Error(`Invalid SovereignManifestV1: ${validation.reasons.join(', ')}`);
    }
    return manifest;
}
/**
 * manifestDigest = sha256(canonicalize(manifest)) under `aoc-canonical-
 * json/1`. Computed independently of the Ed25519 proof's own internal
 * `payloadHash` so callers can cross-check both agree (see
 * `verifySovereignManifest`).
 */
function computeManifestDigest(manifest) {
    return (0, node_crypto_1.createHash)('sha256').update((0, canonical_1.canonicalizeJSON)(manifest)).digest('hex');
}
/**
 * Signs a manifest: canonicalize -> manifestDigest -> Ed25519 sign.
 * Throws if the manifest does not pass `validateSovereignManifestV1`.
 */
function signSovereignManifest(manifest, privateKeyPem, signingKey, now = new Date()) {
    const validation = validateSovereignManifestV1(manifest);
    if (!validation.valid) {
        throw new Error(`Cannot sign invalid SovereignManifestV1: ${validation.reasons.join(', ')}`);
    }
    const manifestDigest = computeManifestDigest(manifest);
    const proof = (0, proof_1.signSovereignPayload)(manifest, privateKeyPem, signingKey, now);
    return { manifest, manifestDigest, proof };
}
