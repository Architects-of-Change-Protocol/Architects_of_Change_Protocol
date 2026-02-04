import { sha256Hex } from '../storage/hash';

export function computeFieldHash(payloadBytes: Uint8Array): string {
  return sha256Hex(payloadBytes);
}
