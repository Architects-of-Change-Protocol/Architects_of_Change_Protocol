import crypto from 'crypto';

export function sha256(data: Uint8Array): Uint8Array {
  return crypto.createHash('sha256').update(data).digest();
}

export function sha256Hex(data: Uint8Array): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
