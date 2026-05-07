import { DelegationGrant, DelegationValidationResult } from './types';

export function createDelegationGrant(input: {
  grantId: string;
  delegatorActorId: string;
  delegateActorId: string;
  allowedActions: string[];
  allowedScopes: string[];
  expiresAt?: string;
  now?: Date;
  metadata?: Record<string, unknown>;
}): DelegationGrant {
  const issuedAt = (input.now ?? new Date()).toISOString();
  if (input.allowedActions.length === 0) throw new Error('allowedActions must be non-empty.');
  if (input.allowedScopes.length === 0) throw new Error('allowedScopes must be non-empty.');

  return {
    grantId: input.grantId,
    delegatorActorId: input.delegatorActorId,
    delegateActorId: input.delegateActorId,
    allowedActions: Array.from(new Set(input.allowedActions)),
    allowedScopes: Array.from(new Set(input.allowedScopes)),
    issuedAt,
    expiresAt: input.expiresAt,
    metadata: input.metadata
  };
}

export function revokeDelegationGrant(grant: DelegationGrant, now: Date = new Date()): DelegationGrant {
  return { ...grant, revokedAt: now.toISOString() };
}

export function validateDelegationGrant(
  grant: DelegationGrant,
  requestedAction: string,
  requestedScopes: string[],
  now: Date = new Date()
): DelegationValidationResult {
  const reasons: string[] = [];
  const nowIso = now.toISOString();

  if (grant.revokedAt && grant.revokedAt <= nowIso) reasons.push('GRANT_REVOKED');
  if (grant.expiresAt && grant.expiresAt <= nowIso) reasons.push('GRANT_EXPIRED');
  if (!grant.allowedActions.includes(requestedAction)) reasons.push('ACTION_NOT_ALLOWED');

  const missingScopes = requestedScopes.filter((scope) => !grant.allowedScopes.includes(scope));
  if (missingScopes.length > 0) reasons.push(`SCOPE_NOT_ALLOWED:${missingScopes.join(',')}`);

  return { valid: reasons.length === 0, reasons };
}

export function listActiveDelegations(grants: DelegationGrant[], now: Date = new Date()): DelegationGrant[] {
  const nowIso = now.toISOString();
  return grants.filter((grant) => !grant.revokedAt && (!grant.expiresAt || grant.expiresAt > nowIso));
}


export function evaluateDelegationAwareAccess(input: {
  grants: DelegationGrant[];
  delegatorActorId: string;
  delegateActorId: string;
  action: string;
  scopes: string[];
  now?: Date;
}): DelegationValidationResult {
  const now = input.now ?? new Date();
  const candidate = listActiveDelegations(input.grants, now).find(
    (grant) =>
      grant.delegatorActorId === input.delegatorActorId &&
      grant.delegateActorId === input.delegateActorId
  );

  if (!candidate) {
    return { valid: false, reasons: ['NO_ACTIVE_DELEGATION'] };
  }

  return validateDelegationGrant(candidate, input.action, input.scopes, now);
}
