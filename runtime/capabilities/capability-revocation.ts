import { emitCapabilityAuditEvent } from './capability-audit';
import { revokeRuntimeCapability } from './capability-lifecycle';
import type { CapabilityAuditHook, CapabilityRevocation, RuntimeCapability } from './types';

export function createCapabilityRevocation(input: {
  revocationId: string;
  capabilityId: string;
  revokedByActorId: string;
  reasonCodes: string[];
  revokedAt?: string;
}): CapabilityRevocation {
  return { ...input, revokedAt: input.revokedAt ?? new Date().toISOString() };
}

export function applyCapabilityRevocation(
  capability: RuntimeCapability,
  revocation: CapabilityRevocation,
  auditHook?: CapabilityAuditHook
): RuntimeCapability {
  if (capability.capabilityId !== revocation.capabilityId) throw new Error('Revocation capabilityId mismatch.');
  const next = revokeRuntimeCapability(capability, revocation.revokedAt, auditHook);
  emitCapabilityAuditEvent(auditHook, 'capability_revoked', {
    capabilityId: capability.capabilityId,
    revocationId: revocation.revocationId,
    revokedByActorId: revocation.revokedByActorId,
    reasonCodes: revocation.reasonCodes,
  });
  return next;
}

export function listRevokedCapabilities(capabilities: readonly RuntimeCapability[]): RuntimeCapability[] {
  return capabilities.filter((capability) => capability.status === 'revoked' || capability.revokedAt !== undefined);
}
