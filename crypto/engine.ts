import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

import type { EncryptedObject } from './types';

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
