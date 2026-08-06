import { createCipheriv, createDecipheriv, createHash, generateKeyPairSync, randomBytes, sign, verify } from 'node:crypto';

import { canonicalizeJSON } from './canonicalize';
import type { EncryptedObject, GovernanceSignature, RuntimeAuthorityIdentity } from './types';

const NONCE_LENGTH = 12;
const KEY_LENGTH = 32;

const toBase64Url = (data: Uint8Array): string =>
  Buffer.from(data).toString('base64url');

const fromBase64Url = (data: string): Uint8Array =>
  new Uint8Array(Buffer.from(data, 'base64url'));

const assertKeyLength = (key: Uint8Array): void => {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Invalid key length: expected ${KEY_LENGTH} bytes`);
  }
};

/**
 * The crypto engine's serialization step for hashing and signing. Delegates
 * entirely to the single authoritative AOC Canonical JSON implementation
 * (see ./canonicalize.ts) — this engine must never carry its own inline
 * canonicalization logic, since any divergence here is directly
 * security-relevant (it would let the same logical payload hash/sign
 * differently depending on call path).
 */
export const canonicalSerialize = (value: unknown): string => canonicalizeJSON(value);

export const stableHash = (value: unknown): string =>
  createHash('sha256').update(canonicalSerialize(value)).digest('base64url');

export const encryptObject = (
  key: Uint8Array,
  plaintext: Uint8Array
): EncryptedObject => {
  assertKeyLength(key);

  const nonce = randomBytes(NONCE_LENGTH);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);

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

export const decryptObject = (
  key: Uint8Array,
  encrypted: EncryptedObject
): Uint8Array => {
  assertKeyLength(key);

  if (encrypted.version !== 1 || encrypted.algorithm !== 'AES-256-GCM') {
    throw new Error('Unsupported encrypted object');
  }

  const nonce = fromBase64Url(encrypted.nonce);
  const ciphertext = fromBase64Url(encrypted.ciphertext);
  const authTag = fromBase64Url(encrypted.auth_tag);

  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(Buffer.from(authTag));

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return new Uint8Array(plaintext);
};

export const createRuntimeAuthority = (runtimeId: string, issuerId: string, authorityId = `authority:${runtimeId}`): {
  identity: RuntimeAuthorityIdentity;
  privateKey: string;
} => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const pub = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const priv = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const keyId = stableHash({ runtimeId, issuerId, publicKey: pub });

  return {
    identity: { authorityId, issuerId, runtimeId, algorithm: 'ed25519', publicKey: pub, keyId },
    privateKey: priv
  };
};

export const signPayload = (
  payload: unknown,
  privateKeyPem: string,
  signer: RuntimeAuthorityIdentity,
  provenance: GovernanceSignature['provenance']
): GovernanceSignature => {
  const payloadHash = stableHash(payload);
  const signatureBytes = sign(null, Buffer.from(payloadHash), privateKeyPem);
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

export const verifyPayloadSignature = (payload: unknown, signatureEnvelope: GovernanceSignature): boolean => {
  const payloadHash = stableHash(payload);
  if (payloadHash !== signatureEnvelope.payloadHash) {
    return false;
  }

  return verify(
    null,
    Buffer.from(payloadHash),
    signatureEnvelope.signer.publicKey,
    Buffer.from(signatureEnvelope.signature, 'base64url')
  );
};
