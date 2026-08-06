"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSovereignKeyPair = generateSovereignKeyPair;
exports.signSovereignPayload = signSovereignPayload;
exports.verifySovereignSignature = verifySovereignSignature;
const node_crypto_1 = require("node:crypto");
const canonical_1 = require("../canonical");
function digestCanonicalPayload(payload) {
    return (0, node_crypto_1.createHash)('sha256').update((0, canonical_1.canonicalizeJSON)(payload)).digest('hex');
}
/**
 * Generates a fresh Ed25519 key pair for signing sovereign manifests/claims.
 * Test/fixture callers should label their generated keys clearly; production
 * composition must source real keys from its own key-management
 * infrastructure rather than silently falling back to a generated or
 * hard-coded test key.
 */
function generateSovereignKeyPair() {
    const { publicKey, privateKey } = (0, node_crypto_1.generateKeyPairSync)('ed25519');
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const keyId = (0, node_crypto_1.createHash)('sha256').update(publicKeyPem).digest('hex');
    return {
        signingKey: { keyId, algorithm: 'ed25519', publicKey: publicKeyPem },
        privateKeyPem,
    };
}
/**
 * Signs `payload` (any canonicalizable value) and returns a portable proof.
 * The signature covers the SHA-256 digest of the payload's
 * `aoc-canonical-json/1` serialization — any later mutation of the payload,
 * however small, changes `payloadHash` and invalidates the signature.
 */
function signSovereignPayload(payload, privateKeyPem, signingKey, now = new Date()) {
    const payloadHash = digestCanonicalPayload(payload);
    const signatureBytes = (0, node_crypto_1.sign)(null, Buffer.from(payloadHash, 'hex'), privateKeyPem);
    return {
        algorithm: 'ed25519',
        canonicalizationProfile: canonical_1.CANONICAL_JSON_PROFILE,
        keyId: signingKey.keyId,
        publicKey: signingKey.publicKey,
        signature: signatureBytes.toString('base64url'),
        signedAt: now.toISOString(),
        payloadHash,
    };
}
/**
 * Recomputes the payload digest and verifies the Ed25519 signature over it.
 * Returns `false` (fail closed) for any unsupported algorithm/profile,
 * digest mismatch, or cryptographic verification failure — including
 * malformed signature/key material that throws inside Node's `verify()`.
 */
function verifySovereignSignature(payload, proof) {
    if (proof.algorithm !== 'ed25519') {
        return false;
    }
    if (proof.canonicalizationProfile !== canonical_1.CANONICAL_JSON_PROFILE) {
        return false;
    }
    const payloadHash = digestCanonicalPayload(payload);
    if (payloadHash !== proof.payloadHash) {
        return false;
    }
    try {
        return (0, node_crypto_1.verify)(null, Buffer.from(payloadHash, 'hex'), proof.publicKey, Buffer.from(proof.signature, 'base64url'));
    }
    catch {
        return false;
    }
}
