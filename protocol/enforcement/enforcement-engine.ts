import { evaluateCapabilityAccess, evaluateCapabilityState, verifyCapability } from '../capability';
import type { ScopeEntry } from '../consent/consent-types';
import { parseEnforcementRequest, normalizeEnforcementRequest } from './enforcement-request';
import type { EnforcementDecision, EnforcementRequest, NormalizedEnforcementRequest } from './enforcement-types';
import { ENFORCEMENT_REASON_CODES } from './enforcement-types';
import { buildAllowDecision, buildDenyDecision, mapCapabilityStateToReason } from './enforcement-policy';

function toScopeKey(entry: ScopeEntry): string {
  return `${entry.type}:${entry.ref}`;
}

function findScopeMismatch(
  normalizedRequest: NormalizedEnforcementRequest,
  allowedScope: ScopeEntry[]
): { matched: ScopeEntry[]; mismatch?: ScopeEntry } {
  const allowed = new Set(allowedScope.map(toScopeKey));
  const matched: ScopeEntry[] = [];

  for (const requested of normalizedRequest.requested_scope) {
    if (!allowed.has(toScopeKey(requested))) {
      return { matched, mismatch: requested };
    }
    matched.push(requested);
  }

  return { matched };
}

function findPermissionMismatch(
  normalizedRequest: NormalizedEnforcementRequest,
  allowedPermissions: string[]
): { matched: string[]; mismatch?: string } {
  const allowed = new Set(allowedPermissions);
  const matched: string[] = [];

  for (const permission of normalizedRequest.requested_permissions) {
    if (!allowed.has(permission)) {
      return { matched, mismatch: permission };
    }
    matched.push(permission);
  }

  return { matched };
}

export function evaluateEnforcement(request: EnforcementRequest): EnforcementDecision {
  const now = request.now ?? new Date();

  let normalizedRequest: NormalizedEnforcementRequest;
  try {
    normalizedRequest = normalizeEnforcementRequest(parseEnforcementRequest(request));
  } catch (error) {
    return buildDenyDecision(
      ENFORCEMENT_REASON_CODES.REQUEST_INVALID,
      [error instanceof Error ? error.message : 'Enforcement request parsing failed.'],
      { now }
    );
  }

  const verification = verifyCapability(normalizedRequest.capability);
  if (!verification.valid || verification.normalized === undefined) {
    return buildDenyDecision(ENFORCEMENT_REASON_CODES.CAPABILITY_INVALID, verification.errors, {
      now,
      normalized_request: normalizedRequest,
    });
  }

  const normalizedCapability = verification.normalized;
  const state = evaluateCapabilityState(normalizedCapability, {
    now: normalizedRequest.now ?? now,
    isRevoked: normalizedRequest.isRevoked,
  });

  if (state.state !== 'active') {
    return buildDenyDecision(mapCapabilityStateToReason(state.state), state.reasons, {
      now,
      normalized_request: normalizedRequest,
      normalized_capability: normalizedCapability,
    });
  }

  const scopeMatch = findScopeMismatch(normalizedRequest, normalizedCapability.scope);
  if (scopeMatch.mismatch !== undefined) {
    return buildDenyDecision(
      ENFORCEMENT_REASON_CODES.SCOPE_NOT_ALLOWED,
      [`Requested scope is not allowed: ${scopeMatch.mismatch.type}:${scopeMatch.mismatch.ref}.`],
      {
        now,
        normalized_request: normalizedRequest,
        normalized_capability: normalizedCapability,
        matched_scope: scopeMatch.matched,
      }
    );
  }

  const permissionMatch = findPermissionMismatch(normalizedRequest, normalizedCapability.permissions);
  if (permissionMatch.mismatch !== undefined) {
    return buildDenyDecision(
      ENFORCEMENT_REASON_CODES.PERMISSION_NOT_ALLOWED,
      [`Requested permission is not allowed: ${permissionMatch.mismatch}.`],
      {
        now,
        normalized_request: normalizedRequest,
        normalized_capability: normalizedCapability,
        matched_scope: scopeMatch.matched,
        matched_permissions: permissionMatch.matched,
      }
    );
  }

  if (
    normalizedRequest.subject !== undefined &&
    normalizedRequest.subject !== normalizedCapability.subject
  ) {
    return buildDenyDecision(
      ENFORCEMENT_REASON_CODES.SUBJECT_MISMATCH,
      ['Request subject does not match capability subject.'],
      {
        now,
        normalized_request: normalizedRequest,
        normalized_capability: normalizedCapability,
        matched_scope: scopeMatch.matched,
        matched_permissions: permissionMatch.matched,
      }
    );
  }

  if (
    normalizedRequest.grantee !== undefined &&
    normalizedRequest.grantee !== normalizedCapability.grantee
  ) {
    return buildDenyDecision(
      ENFORCEMENT_REASON_CODES.GRANTEE_MISMATCH,
      ['Request grantee does not match capability grantee.'],
      {
        now,
        normalized_request: normalizedRequest,
        normalized_capability: normalizedCapability,
        matched_scope: scopeMatch.matched,
        matched_permissions: permissionMatch.matched,
      }
    );
  }

  if (
    normalizedRequest.marketMakerId !== undefined &&
    normalizedRequest.marketMakerId !== (normalizedCapability.marketMakerId ?? undefined)
  ) {
    return buildDenyDecision(
      ENFORCEMENT_REASON_CODES.MARKET_MAKER_MISMATCH,
      ['Request market maker binding does not match capability marketMakerId.'],
      {
        now,
        normalized_request: normalizedRequest,
        normalized_capability: normalizedCapability,
        matched_scope: scopeMatch.matched,
        matched_permissions: permissionMatch.matched,
      }
    );
  }

  const accessAllowed = evaluateCapabilityAccess(normalizedCapability, {
    requested_scope: normalizedRequest.requested_scope,
    requested_permissions: normalizedRequest.requested_permissions,
    subject: normalizedRequest.subject,
    grantee: normalizedRequest.grantee,
    marketMakerId: normalizedRequest.marketMakerId,
    now: normalizedRequest.now ?? now,
    isRevoked: normalizedRequest.isRevoked,
  });

  if (!accessAllowed) {
    return buildDenyDecision(
      ENFORCEMENT_REASON_CODES.REQUEST_INVALID,
      ['Capability access evaluation denied the request.'],
      {
        now,
        normalized_request: normalizedRequest,
        normalized_capability: normalizedCapability,
        matched_scope: scopeMatch.matched,
        matched_permissions: permissionMatch.matched,
      }
    );
  }

  return buildAllowDecision({
    now,
    normalized_request: normalizedRequest,
    normalized_capability: normalizedCapability,
    matched_scope: scopeMatch.matched,
    matched_permissions: permissionMatch.matched,
  });
}
