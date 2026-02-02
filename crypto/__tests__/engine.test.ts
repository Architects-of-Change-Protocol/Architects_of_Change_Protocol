import { decryptObject, encryptObject } from '../engine';

const toBytes = (value: string): Uint8Array => Buffer.from(value, 'utf8');

const mutateBase64Url = (value: string): string => {
  const buffer = Buffer.from(value, 'base64url');
  buffer[0] = buffer[0] ^ 0xff;
  return buffer.toString('base64url');
};

describe('crypto engine', () => {
  const key = Buffer.alloc(32, 7);
  const plaintext = toBytes('hello world');

  it('roundtrips encryption/decryption', () => {
    const encrypted = encryptObject(key, plaintext);
    const decrypted = decryptObject(key, encrypted);

    expect(Buffer.from(decrypted).toString('utf8')).toBe('hello world');
  });

  it('fails with the wrong key', () => {
    const encrypted = encryptObject(key, plaintext);
    const wrongKey = Buffer.alloc(32, 9);

    expect(() => decryptObject(wrongKey, encrypted)).toThrow();
  });

  it('fails with modified ciphertext', () => {
    const encrypted = encryptObject(key, plaintext);
    const tampered = {
      ...encrypted,
      ciphertext: mutateBase64Url(encrypted.ciphertext),
    };

    expect(() => decryptObject(key, tampered)).toThrow();
  });

  it('fails with modified auth tag', () => {
    const encrypted = encryptObject(key, plaintext);
    const tampered = {
      ...encrypted,
      auth_tag: mutateBase64Url(encrypted.auth_tag),
    };

    expect(() => decryptObject(key, tampered)).toThrow();
  });

  it('uses a different nonce each time', () => {
    const encryptedA = encryptObject(key, plaintext);
    const encryptedB = encryptObject(key, plaintext);

    expect(encryptedA.nonce).not.toBe(encryptedB.nonce);
  });
});
