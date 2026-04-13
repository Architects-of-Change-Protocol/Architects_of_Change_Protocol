import { createHmac } from 'crypto';

export function signCapabilityHash(capabilityHash: string, secret: string): string {
  return createHmac('sha256', secret).update(capabilityHash).digest('hex');
}
