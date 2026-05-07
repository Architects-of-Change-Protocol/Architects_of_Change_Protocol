import { emitCapabilityAuditEvent } from './capability-audit';
import type { CapabilityAuditHook, RuntimeCapability } from './types';

function nowIso(now?: string): string {
  return now ?? new Date().toISOString();
}

export function issueRuntimeCapability(input: Omit<RuntimeCapability, 'issuedAt' | 'status'> & { issuedAt?: string }): RuntimeCapability {
  return { ...input, issuedAt: nowIso(input.issuedAt), status: 'issued' };
}

export function activateRuntimeCapability(capability: RuntimeCapability, auditHook?: CapabilityAuditHook, at?: string): RuntimeCapability {
  if (capability.status === 'revoked') throw new Error('Revoked capability cannot be reactivated.');
  if (capability.status === 'expired') throw new Error('Expired capability cannot be reactivated.');
  if (capability.status === 'suspended') throw new Error('Suspended capability requires explicit restore flow.');
  const next = { ...capability, status: 'active' as const };
  emitCapabilityAuditEvent(auditHook, 'capability_activated', { capabilityId: capability.capabilityId, at: nowIso(at) });
  return next;
}

export function suspendRuntimeCapability(capability: RuntimeCapability, auditHook?: CapabilityAuditHook, at?: string): RuntimeCapability {
  if (capability.status === 'revoked' || capability.status === 'expired') throw new Error('Terminal capability state cannot be suspended.');
  const next = { ...capability, status: 'suspended' as const };
  emitCapabilityAuditEvent(auditHook, 'capability_suspended', { capabilityId: capability.capabilityId, at: nowIso(at) });
  return next;
}

export function revokeRuntimeCapability(capability: RuntimeCapability, at?: string, auditHook?: CapabilityAuditHook): RuntimeCapability {
  const next = { ...capability, status: 'revoked' as const, revokedAt: nowIso(at) };
  emitCapabilityAuditEvent(auditHook, 'capability_revoked', { capabilityId: capability.capabilityId, revokedAt: next.revokedAt });
  return next;
}

export function expireRuntimeCapability(capability: RuntimeCapability, at?: string, auditHook?: CapabilityAuditHook): RuntimeCapability {
  const next = { ...capability, status: 'expired' as const, expiresAt: capability.expiresAt ?? nowIso(at) };
  emitCapabilityAuditEvent(auditHook, 'capability_expired', { capabilityId: capability.capabilityId, expiresAt: next.expiresAt });
  return next;
}

export function isCapabilityCurrentlyValid(capability: RuntimeCapability, at?: string): boolean {
  const now = new Date(nowIso(at));
  if (capability.status !== 'active') return false;
  if (capability.revokedAt !== undefined) return false;
  if (capability.notBefore !== undefined && now < new Date(capability.notBefore)) return false;
  if (capability.expiresAt !== undefined && now > new Date(capability.expiresAt)) return false;
  return true;
}
