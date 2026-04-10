import type { ScopeEntry, ConsentScopeRequest, ProtocolConsent } from './consent-types';
import { evaluateConsentState } from './consent-state';

function toScopeKey(entry: ScopeEntry): string {
  return `${entry.type}:${entry.ref}`;
}

export function doesConsentAllowScope(
  consent: ProtocolConsent,
  request: ConsentScopeRequest
): boolean {
  const state = evaluateConsentState(consent, {
    now: request.now,
    isRevoked: request.isRevoked,
  });

  if (state.state !== 'active') {
    return false;
  }

  if (!Array.isArray(request.scope) || request.scope.length === 0) {
    return false;
  }
  if (!Array.isArray(request.permissions) || request.permissions.length === 0) {
    return false;
  }
  if (request.subject !== undefined && request.subject !== consent.subject) {
    return false;
  }
  if (request.grantee !== undefined && request.grantee !== consent.grantee) {
    return false;
  }
  if (
    request.marketMakerId !== undefined &&
    consent.marketMakerId !== undefined &&
    request.marketMakerId !== consent.marketMakerId
  ) {
    return false;
  }

  const allowedScope = new Set(consent.scope.map(toScopeKey));
  const allowedPermissions = new Set(consent.permissions);

  for (const requiredEntry of request.scope) {
    if (!requiredEntry || typeof requiredEntry.ref !== 'string' || requiredEntry.ref.trim() === '') {
      return false;
    }

    if (!allowedScope.has(toScopeKey(requiredEntry))) {
      return false;
    }
  }

  for (const permission of request.permissions) {
    if (typeof permission !== 'string' || permission.trim() === '') {
      return false;
    }
    if (!allowedPermissions.has(permission)) {
      return false;
    }
  }

  return true;
}
