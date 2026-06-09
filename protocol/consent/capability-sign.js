import { createHmac } from 'crypto';
export function signCapabilityHash(capabilityHash, secret) {
    return createHmac('sha256', secret).update(capabilityHash).digest('hex');
}
