"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolizationMaterialKind = void 0;
exports.protocolizationMaterialPayloadKey = protocolizationMaterialPayloadKey;
exports.isProtocolizationMaterialKind = isProtocolizationMaterialKind;
exports.isValidProtocolizationCaseMaterial = isValidProtocolizationCaseMaterial;
const identity_1 = require("@aoc/protocol/identity");
const freshness_1 = require("../freshness");
const identifiers_1 = require("../identifiers");
const case_identifiers_1 = require("./case-identifiers");
/**
 * *Material* — what a case has been given, correlated to what a profile asked
 * for.
 *
 * A material entry is an **association**, never a record. It says: this case
 * was told about this reference, at this instant, in connection with these
 * requirements. The referenced thing itself — the claim, the evidence, the
 * attestation, the verification, the credential — is a Protocol record living
 * wherever Protocol records live, and this package neither carries it, copies
 * it, stores its payload, nor defines a parallel type for it. That is the reuse
 * map's line: evidence *requirement* and evidence *association* belong to the
 * vertical; evidence *representation* belongs to Protocol.
 *
 * Nothing here is a blob. There are no bytes, no documents, no upload, no
 * storage adapter and no PII by construction — the same exclusion APV-02 §2.3
 * froze for the result envelope, for the same reason: a record must stay small
 * and safe enough to hand to someone not entitled to the payload.
 *
 * **Presence is not truth.** Adding an attestation reference does not make the
 * case attested. Adding a verification reference does not make anything
 * verified — a `CanonicalVerification` may have any status, including `Failed`,
 * and this package deliberately does not carry it. Adding a credential
 * reference does not make the credential current. What material presence
 * supports is a *later* evaluator; it decides nothing on its own.
 */
/**
 * The kinds of thing a case can be told about.
 *
 * Each member names an existing Protocol concept, and the set is closed to what
 * an APV-03 profile can require: the three identity strategies
 * (`ContentIdentity`, `ExternalReference`, `RegistryEntry`), the four
 * requirement families that name a Protocol record (`Declaration` for a claim,
 * `Evidence`, `Verification`, `Attestation`), and `Credential` for the
 * credential an attester constraint refers to. A new asset category never adds a
 * member here — it writes a profile.
 */
exports.ProtocolizationMaterialKind = {
    /** A digest over the subject's bytes. Payload: Protocol's `ContentIdentity`. */
    ContentIdentity: 'ContentIdentity',
    /** How an external namespace names the subject. Payload: `SovereignExternalReference`. */
    ExternalReference: 'ExternalReference',
    /** An entry inside an external registry. Payload: `CanonicalRegistryEntryRef`. */
    RegistryEntry: 'RegistryEntry',
    /** "The applicant asserts X." Payload: a `CanonicalClaimId`. */
    Declaration: 'Declaration',
    /** Supporting evidence. Payload: a `CanonicalEvidenceId`. */
    Evidence: 'Evidence',
    /** A verification record — of any status. Payload: a `CanonicalVerificationId`. */
    Verification: 'Verification',
    /** An attestation record. Payload: a `CanonicalAttestationId`. */
    Attestation: 'Attestation',
    /** A credential an attester relies on. Payload: a `CanonicalCredentialId`. */
    Credential: 'Credential',
};
const MATERIAL_BASE_KEYS = [
    'materialId',
    'kind',
    'requirementIds',
    'addedAt',
    'correlationId',
];
const MATERIAL_PAYLOAD_KEY = Object.freeze({
    [exports.ProtocolizationMaterialKind.ContentIdentity]: 'contentIdentity',
    [exports.ProtocolizationMaterialKind.ExternalReference]: 'externalReference',
    [exports.ProtocolizationMaterialKind.RegistryEntry]: 'registryEntryRef',
    [exports.ProtocolizationMaterialKind.Declaration]: 'claimRef',
    [exports.ProtocolizationMaterialKind.Evidence]: 'evidenceRef',
    [exports.ProtocolizationMaterialKind.Verification]: 'verificationRef',
    [exports.ProtocolizationMaterialKind.Attestation]: 'attestationRef',
    [exports.ProtocolizationMaterialKind.Credential]: 'credentialRef',
});
/**
 * The payload key one material kind carries, so a caller (and this package's
 * own validator) can read a reference without a per-kind branch.
 */
function protocolizationMaterialPayloadKey(kind) {
    return MATERIAL_PAYLOAD_KEY[kind];
}
function isProtocolizationMaterialKind(value) {
    return typeof value === 'string' && Object.values(exports.ProtocolizationMaterialKind).includes(value);
}
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
/**
 * A `CanonicalId` naming a Protocol record. Bounded and non-blank; never parsed,
 * never resolved, and never checked for existence — this package has no way to
 * dereference one and must not pretend otherwise.
 */
function isCanonicalRecordId(value) {
    return typeof value === 'string' && value.trim() !== '' && value.length <= case_identifiers_1.PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH;
}
/**
 * The minimum that makes a registry entry reference usable as a correlation
 * key: it names an entry, inside a named registry. Deeper validation of the
 * record belongs to whoever owns the record — restating
 * `CanonicalRegistryEntryRef`'s full shape here would be a second, drifting copy
 * of a Protocol contract, which is precisely what this package must not build.
 */
function isUsableRegistryEntryRef(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    if (!isCanonicalRecordId(candidate.id))
        return false;
    const registry = candidate.registryRef;
    if (typeof registry !== 'object' || registry === null || Array.isArray(registry))
        return false;
    return isCanonicalRecordId(registry.id);
}
function isValidRequirementIdList(value) {
    if (!Array.isArray(value) || value.length === 0)
        return false;
    const seen = new Set();
    for (const entry of value) {
        if (!(0, identifiers_1.isValidAssetRequirementId)(entry))
            return false;
        if (seen.has(entry))
            return false;
        seen.add(entry);
    }
    return true;
}
function isValidMaterialPayload(candidate, kind) {
    const payload = candidate[MATERIAL_PAYLOAD_KEY[kind]];
    switch (kind) {
        case exports.ProtocolizationMaterialKind.ContentIdentity:
            return (0, identity_1.isValidContentIdentity)(payload);
        case exports.ProtocolizationMaterialKind.ExternalReference:
            return (0, identity_1.isValidSovereignExternalReference)(payload);
        case exports.ProtocolizationMaterialKind.RegistryEntry:
            return isUsableRegistryEntryRef(payload);
        default:
            return isCanonicalRecordId(payload);
    }
}
/**
 * Structural validation of one material association. Shape only: it never
 * decides that the referenced record exists, is authentic, is current, or
 * satisfies anything.
 *
 * Requirement ids are checked for *form* here. Checking them against the
 * pinned profile needs the profile, so it happens where the profile is
 * resolved — in the case operations and in `validateProtocolizationCase`.
 */
function isValidProtocolizationCaseMaterial(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    const kind = candidate.kind;
    if (!isProtocolizationMaterialKind(kind))
        return false;
    const allowedKeys = [...MATERIAL_BASE_KEYS, MATERIAL_PAYLOAD_KEY[kind]];
    for (const key of Object.keys(candidate)) {
        if (!allowedKeys.includes(key))
            return false;
    }
    if (!(0, case_identifiers_1.isValidProtocolizationMaterialId)(candidate.materialId))
        return false;
    if (!isValidRequirementIdList(candidate.requirementIds))
        return false;
    if (!(0, freshness_1.isValidUtcDateTime)(candidate.addedAt))
        return false;
    if (hasOwn(candidate, 'correlationId') && !isCanonicalRecordId(candidate.correlationId))
        return false;
    return isValidMaterialPayload(candidate, kind);
}
