import { verifyCapability } from './capability-verify';
import type { CapabilityStateResult, EvaluateCapabilityStateOptions, ProtocolCapability } from './capability-types';
import { revocationLookupFailedStatus } from '../revocation';

function resolveCapabilityRevocationStatus(
  capability: ProtocolCapability,
  checkRevocation: EvaluateCapabilityStateOptions['checkRevocation']
) {
  try {
    const status = checkRevocation({ subjectId: capability.capability_hash, subjectType: 'capability_grant' });
    if (!status || typeof status.status !== 'string') {
      return revocationLookupFailedStatus({ subjectId: capability.capability_hash, subjectType: 'capability_grant' });
    }
    return status;
  } catch {
    return revocationLookupFailedStatus({ subjectId: capability.capability_hash, subjectType: 'capability_grant' });
  }
}

export function evaluateCapabilityState(
  capabilityInput: unknown,
  opts: EvaluateCapabilityStateOptions
): CapabilityStateResult {
  const verification = verifyCapability(capabilityInput);
  if (!verification.valid || verification.normalized === undefined) {
    return { state: 'invalid', reasons: verification.errors };
  }

  const capability: ProtocolCapability = verification.normalized;

  const revocationStatus = resolveCapabilityRevocationStatus(capability, opts.checkRevocation);
  if (revocationStatus.status === 'revoked') {
    return { state: 'revoked', reasons: ['Capability was revoked.'], revocationStatus };
  }
  if (revocationStatus.status === 'unknown') {
    return {
      state: 'revocation_unknown',
      reasons: [`Capability revocation status could not be verified (${revocationStatus.errorCode}).`],
      revocationStatus,
    };
  }

  const now = opts.now ?? new Date();

  if (capability.not_before !== undefined && now.toISOString() < capability.not_before) {
    return { state: 'not_yet_active', reasons: ['Capability not_before is in the future.'], revocationStatus };
  }

  if (now.toISOString() >= capability.expires_at) {
    return { state: 'expired', reasons: ['Capability is expired.'], revocationStatus };
  }

  return { state: 'active', reasons: [], revocationStatus };
}
