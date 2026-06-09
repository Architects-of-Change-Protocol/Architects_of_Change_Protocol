"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayloadSignature = exports.signPayload = exports.createRuntimeAuthority = exports.decryptObject = exports.encryptObject = exports.stableHash = exports.canonicalSerialize = void 0;
const node_crypto_1 = require("node:crypto");
const NONCE_LENGTH = 12;
const KEY_LENGTH = 32;
const toBase64Url = (data) => Buffer.from(data).toString('base64url');
const fromBase64Url = (data) => new Uint8Array(Buffer.from(data, 'base64url'));
const assertKeyLength = (key) => {
    if (key.length !== KEY_LENGTH) {
        throw new Error(`Invalid key length: expected ${KEY_LENGTH} bytes`);
    }
};
const canonicalize = (value) => {
    if (value === null || value === undefined)
        return value;
    if (Array.isArray(value))
        return value.map(canonicalize);
    if (typeof value !== 'object')
        return value;
    const obj = value;
    return Object.keys(obj).sort().reduce((acc, key) => {
        acc[key] = canonicalize(obj[key]);
        return acc;
    }, {});
};
const canonicalSerialize = (value) => JSON.stringify(canonicalize(value));
exports.canonicalSerialize = canonicalSerialize;
const stableHash = (value) => (0, node_crypto_1.createHash)('sha256').update((0, exports.canonicalSerialize)(value)).digest('base64url');
exports.stableHash = stableHash;
const encryptObject = (key, plaintext) => {
    assertKeyLength(key);
    const nonce = (0, node_crypto_1.randomBytes)(NONCE_LENGTH);
    const cipher = (0, node_crypto_1.createCipheriv)('aes-256-gcm', key, nonce);
    const ciphertext = Buffer.concat([
        cipher.update(plaintext),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return {
        version: 1,
        algorithm: 'AES-256-GCM',
        nonce: toBase64Url(nonce),
        ciphertext: toBase64Url(ciphertext),
        auth_tag: toBase64Url(authTag),
    };
};
exports.encryptObject = encryptObject;
const decryptObject = (key, encrypted) => {
    assertKeyLength(key);
    if (encrypted.version !== 1 || encrypted.algorithm !== 'AES-256-GCM') {
        throw new Error('Unsupported encrypted object');
    }
    const nonce = fromBase64Url(encrypted.nonce);
    const ciphertext = fromBase64Url(encrypted.ciphertext);
    const authTag = fromBase64Url(encrypted.auth_tag);
    const decipher = (0, node_crypto_1.createDecipheriv)('aes-256-gcm', key, nonce);
    decipher.setAuthTag(Buffer.from(authTag));
    const plaintext = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]);
    return new Uint8Array(plaintext);
};
exports.decryptObject = decryptObject;
const createRuntimeAuthority = (runtimeId, issuerId, authorityId = `authority:${runtimeId}`) => {
    const { publicKey, privateKey } = (0, node_crypto_1.generateKeyPairSync)('ed25519');
    const pub = publicKey.export({ type: 'spki', format: 'pem' }).toString();
    const priv = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
    const keyId = (0, exports.stableHash)({ runtimeId, issuerId, publicKey: pub });
    return {
        identity: { authorityId, issuerId, runtimeId, algorithm: 'ed25519', publicKey: pub, keyId },
        privateKey: priv
    };
};
exports.createRuntimeAuthority = createRuntimeAuthority;
const signPayload = (payload, privateKeyPem, signer, provenance) => {
    const payloadHash = (0, exports.stableHash)(payload);
    const signatureBytes = (0, node_crypto_1.sign)(null, Buffer.from(payloadHash), privateKeyPem);
    const signedAt = new Date().toISOString();
    return {
        algorithm: 'ed25519',
        keyId: signer.keyId,
        signer,
        signature: Buffer.from(signatureBytes).toString('base64url'),
        signedAt,
        payloadHash,
        provenance
    };
};
exports.signPayload = signPayload;
const verifyPayloadSignature = (payload, signatureEnvelope) => {
    const payloadHash = (0, exports.stableHash)(payload);
    if (payloadHash !== signatureEnvelope.payloadHash) {
        return false;
    }
    return (0, node_crypto_1.verify)(null, Buffer.from(payloadHash), signatureEnvelope.signer.publicKey, Buffer.from(signatureEnvelope.signature, 'base64url'));
};
exports.verifyPayloadSignature = verifyPayloadSignature;
