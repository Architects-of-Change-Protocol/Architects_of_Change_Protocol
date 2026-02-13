import crypto from 'crypto';

export function signBytes(privateKey: Uint8Array, bytes: Uint8Array): Uint8Array {
  const privateKeyObject = crypto.createPrivateKey({
    key: Buffer.from(privateKey),
    format: 'der',
    type: 'pkcs8',
  });

  return new Uint8Array(crypto.sign(null, Buffer.from(bytes), privateKeyObject));
}

export function verifyBytes(
  publicKey: Uint8Array,
  bytes: Uint8Array,
  signature: Uint8Array
): boolean {
  const publicKeyObject = crypto.createPublicKey({
    key: Buffer.from(publicKey),
    format: 'der',
    type: 'spki',
  });

  return crypto.verify(null, Buffer.from(bytes), publicKeyObject, Buffer.from(signature));
}
