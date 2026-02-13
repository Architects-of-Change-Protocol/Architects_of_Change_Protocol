import crypto from 'crypto';

export type Ed25519Keypair = {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
};

export function encode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

export function decode(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, 'base64url'));
}

export function generateKeypair(): Ed25519Keypair {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

  return {
    privateKey: new Uint8Array(privateKey.export({ format: 'der', type: 'pkcs8' })),
    publicKey: new Uint8Array(publicKey.export({ format: 'der', type: 'spki' })),
  };
}

export function publicKeyFromPrivate(privateKey: Uint8Array): Uint8Array {
  const privateKeyObject = crypto.createPrivateKey({
    key: Buffer.from(privateKey),
    format: 'der',
    type: 'pkcs8',
  });

  return new Uint8Array(
    crypto.createPublicKey(privateKeyObject).export({ format: 'der', type: 'spki' })
  );
}
