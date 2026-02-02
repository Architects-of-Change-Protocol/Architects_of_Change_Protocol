export type EncryptedObject = {
  version: 1;
  algorithm: 'AES-256-GCM';
  nonce: string;
  ciphertext: string;
  auth_tag: string;
};
