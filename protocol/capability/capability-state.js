import { verifyCapability } from './capability-verify';
export function evaluateCapabilityState(capabilityInput, opts = {}) {
    const verification = verifyCapability(capabilityInput);
    if (!verification.valid || verification.normalized === undefined) {
        return { state: 'invalid', reasons: verification.errors };
    }
    const capability = verification.normalized;
    if (opts.isRevoked?.(capability) === true) {
        return { state: 'revoked', reasons: ['Capability was revoked by registry hook.'] };
    }
    const now = opts.now ?? new Date();
    if (capability.not_before !== undefined && now.toISOString() < capability.not_before) {
        return { state: 'not_yet_active', reasons: ['Capability not_before is in the future.'] };
    }
    if (now.toISOString() >= capability.expires_at) {
        return { state: 'expired', reasons: ['Capability is expired.'] };
    }
    return { state: 'active', reasons: [] };
}
