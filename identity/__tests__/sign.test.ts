import {
  decode,
  encode,
  generateKeypair,
  publicKeyFromPrivate,
  signBytes,
  verifyBytes
} from '..';

describe('identity-lite signing', () => {
  it('roundtrips key encode/decode', () => {
    const { privateKey, publicKey } = generateKeypair();
    expect(decode(encode(privateKey))).toEqual(privateKey);
    expect(decode(encode(publicKey))).toEqual(publicKey);
  });

  it('derives public key from private key', () => {
    const { privateKey, publicKey } = generateKeypair();
    expect(publicKeyFromPrivate(privateKey)).toEqual(publicKey);
  });

  it('accepts valid signatures', () => {
    const { privateKey, publicKey } = generateKeypair();
    const bytes = new Uint8Array(Buffer.from('aoc-signature-test', 'utf8'));
    const signature = signBytes(privateKey, bytes);
    expect(verifyBytes(publicKey, bytes, signature)).toBe(true);
  });

  it('rejects tampered payload signatures', () => {
    const { privateKey, publicKey } = generateKeypair();
    const bytes = new Uint8Array(Buffer.from('aoc-signature-test', 'utf8'));
    const tampered = new Uint8Array(Buffer.from('aoc-signature-test-tampered', 'utf8'));
    const signature = signBytes(privateKey, bytes);
    expect(verifyBytes(publicKey, tampered, signature)).toBe(false);
  });
});
