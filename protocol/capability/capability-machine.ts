import { evaluateCapabilityState } from './capability-state';
import { verifyCapability } from './capability-verify';
import type { CapabilityAccessRequest } from './capability-types';
import type { ScopeEntry } from '../consent/consent-types';

function toScopeKey(entry: ScopeEntry): string {
  return `${entry.type}:${entry.ref}`;
}

export function evaluateCapabilityAccess(capabilityInput: unknown, request: CapabilityAccessRequest): boolean {
  const state = evaluateCapabilityState(capabilityInput, {
    now: request.now,
    isRevoked: request.isRevoked,
  });

  if (state.state !== 'active') {
    return false;
  }

  if (!Array.isArray(request.requested_scope) || request.requested_scope.length === 0) {
    return false;
  }

  if (!Array.isArray(request.requested_permissions) || request.requested_permissions.length === 0) {
    return false;
  }

  const verification = verifyCapability(capabilityInput);
  if (!verification.valid || verification.normalized === undefined) {
    return false;
  }

  const capability = verification.normalized;

  if (request.subject !== undefined && request.subject !== capability.subject) {
    return false;
  }

  if (request.grantee !== undefined && request.grantee !== capability.grantee) {
    return false;
  }

  if (request.marketMakerId !== undefined && request.marketMakerId !== (capability.marketMakerId ?? undefined)) {
    return false;
  }

  const allowedScope = new Set(capability.scope.map(toScopeKey));
  for (const requested of request.requested_scope) {
    if (!requested || typeof requested.ref !== 'string' || requested.ref.trim() === '') {
      return false;
    }

    const scopeKey = toScopeKey({ type: requested.type, ref: requested.ref.trim().toLowerCase() });
    if (!allowedScope.has(scopeKey)) {
      return false;
    }
  }

  const allowedPermissions = new Set(capability.permissions);
  for (const permission of request.requested_permissions) {
    if (typeof permission !== 'string' || permission.trim() === '') {
      return false;
    }

    if (!allowedPermissions.has(permission.trim().toLowerCase())) {
      return false;
    }
  }

  return true;
}
