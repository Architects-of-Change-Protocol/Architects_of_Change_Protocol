import {
  validateCapabilityToken,
  type CapabilityTokenV1
} from '../../capability';
import { isRevoked } from '../../capability/revocation';
import type { NonceRegistry } from '../../capability/registries/NonceRegistry';
import type { RevocationRegistry } from '../../capability/registries/RevocationRegistry';
import type { ConsentObjectV1 } from '../../consent';
import {
  capabilityAccessReasonCodes,
  evaluateCapabilityAccess,
  type CapabilityAccessRequest
} from '../../enforcement';

export type EnforceCapabilityInput = {
  required_scope: string;
  token: CapabilityTokenV1 & Record<string, unknown>;
  consent?: ConsentObjectV1;
  now?: Date;
  resource_context?: Record<string, unknown>;
  request_context?: Record<string, unknown>;
  registries?: { nonceRegistry?: NonceRegistry; revocationRegistry?: RevocationRegistry };
  consume?: boolean;
  action?: 'read';
  hooks?: CapabilityAccessRequest['hooks'];
};

export type EnforceCapabilityDecision = {
  allowed: boolean;
  code:
    | 'OK'
    | 'EXPIRED'
    | 'NOT_YET_VALID'
    | 'REPLAY'
    | 'REVOKED'
    | 'SCOPE_MISMATCH'
    | 'INVALID_SCOPE'
    | 'INVALID_CAPABILITY'
    | 'CONSENT_MISMATCH'
    | 'REQUEST_CONTEXT_MISMATCH'
    | 'RESOURCE_RESTRICTION_FAILED'
    | 'MALFORMED_CAPABILITY'
    | 'INTERNAL_DENY';
  reason: string;
  metadata?: Record<string, unknown>;
};

type LegacyBridgeValidationErrorCode =
  | 'INVALID_CAPABILITY'
  | 'CONSENT_MISMATCH';

class LegacyBridgeValidationError extends Error {
  readonly code: LegacyBridgeValidationErrorCode;

  constructor(code: LegacyBridgeValidationErrorCode, message: string) {
    super(message);
    this.name = 'LegacyBridgeValidationError';
    this.code = code;
  }
}

function deny(
  code: EnforceCapabilityDecision['code'],
  reason: string
): EnforceCapabilityDecision {
  return { allowed: false, code, reason };
}

function mapReasonCode(reasonCode: string): EnforceCapabilityDecision['code'] {
  switch (reasonCode) {
    case capabilityAccessReasonCodes.ACCESS_ALLOWED:
      return 'OK';
    case capabilityAccessReasonCodes.CAPABILITY_EXPIRED:
      return 'EXPIRED';
    case capabilityAccessReasonCodes.CAPABILITY_NOT_YET_VALID:
      return 'NOT_YET_VALID';
    case capabilityAccessReasonCodes.RESOURCE_NOT_ALLOWED:
      return 'SCOPE_MISMATCH';
    case capabilityAccessReasonCodes.RESOURCE_MISSING:
      return 'INVALID_SCOPE';
    case capabilityAccessReasonCodes.CAPABILITY_INVALID:
    case capabilityAccessReasonCodes.CAPABILITY_MISSING:
    case capabilityAccessReasonCodes.ACTION_MISSING:
    case capabilityAccessReasonCodes.ACTION_NOT_ALLOWED:
      return 'INVALID_CAPABILITY';
    case capabilityAccessReasonCodes.CAPABILITY_INACTIVE:
      return 'MALFORMED_CAPABILITY';
    case capabilityAccessReasonCodes.CONSENT_INVALID:
    case capabilityAccessReasonCodes.CONSENT_MISMATCH:
      return 'CONSENT_MISMATCH';
    case capabilityAccessReasonCodes.MARKET_MAKER_REQUIRED:
    case capabilityAccessReasonCodes.MARKET_MAKER_MISMATCH:
      return 'REQUEST_CONTEXT_MISMATCH';
    case capabilityAccessReasonCodes.POLICY_DENIED:
    case capabilityAccessReasonCodes.USAGE_DENIED:
      return 'RESOURCE_RESTRICTION_FAILED';
    default:
      return 'INTERNAL_DENY';
  }
}

function verifyAgainstConsent(
  token: CapabilityTokenV1,
  consent: ConsentObjectV1
): void {
  if (token.consent_ref !== consent.consent_hash) {
    throw new LegacyBridgeValidationError(
      'CONSENT_MISMATCH',
      'Capability consent_ref does not match parent consent consent_hash.'
    );
  }
  if (consent.action !== 'grant') {
    throw new LegacyBridgeValidationError(
      'CONSENT_MISMATCH',
      'Parent consent action must be "grant".'
    );
  }
  if (token.subject !== consent.subject) {
    throw new LegacyBridgeValidationError(
      'CONSENT_MISMATCH',
      'Capability subject does not match parent consent subject.'
    );
  }
  if (token.grantee !== consent.grantee) {
    throw new LegacyBridgeValidationError(
      'CONSENT_MISMATCH',
      'Capability grantee does not match parent consent grantee.'
    );
  }

  if (token.marketMakerId !== consent.marketMakerId) {
    throw new LegacyBridgeValidationError(
      'CONSENT_MISMATCH',
      'Capability marketMakerId does not match parent consent marketMakerId.'
    );
  }

  const consentScope = new Set(
    consent.scope.map((entry) => `${entry.type}:${entry.ref}`)
  );
  for (const entry of token.scope) {
    if (!consentScope.has(`${entry.type}:${entry.ref}`)) {
      throw new LegacyBridgeValidationError(
        'INVALID_CAPABILITY',
        'Scope escalation: token scope entry not found in parent consent scope.'
      );
    }
  }

  const consentPermissions = new Set(consent.permissions);
  for (const permission of token.permissions) {
    if (!consentPermissions.has(permission)) {
      throw new LegacyBridgeValidationError(
        'INVALID_CAPABILITY',
        'Permission escalation: token permission not found in parent consent permissions.'
      );
    }
  }

  if (token.issued_at < consent.issued_at) {
    throw new LegacyBridgeValidationError(
      'INVALID_CAPABILITY',
      'Capability issued_at must be at or after parent consent issued_at.'
    );
  }
  if (consent.expires_at !== null && token.expires_at > consent.expires_at) {
    throw new LegacyBridgeValidationError(
      'INVALID_CAPABILITY',
      'Capability expires_at must not exceed parent consent expires_at.'
    );
  }
  if (token.not_before !== null && token.not_before < consent.issued_at) {
    throw new LegacyBridgeValidationError(
      'INVALID_CAPABILITY',
      'Capability not_before must be at or after parent consent issued_at.'
    );
  }
}

function buildLegacyAccessRequest(
  input: EnforceCapabilityInput,
  type: string,
  ref: string
): CapabilityAccessRequest {
  const enforcedAction = input.action ?? 'read';

  return {
    capability: input.token,
    consent: input.consent,
    action: enforcedAction,
    resource: { type: type as 'field' | 'content' | 'pack', ref },
    marketMakerId:
      typeof input.request_context?.marketMakerId === 'string'
        ? input.request_context.marketMakerId
        : undefined,
    now: input.now,
    hooks: input.hooks,
    metadata: {
      resource_context: input.resource_context,
      request_context: input.request_context,
      consume: input.consume,
      legacyBridgeAction: enforcedAction
    }
  };
}

// Legacy bridge for current vault/resolver flows. It intentionally defaults to
// read-only enforcement because existing callers redeem capabilities only for
// protected resource retrieval, not generalized state-changing actions.
export function enforceCapability(
  input: EnforceCapabilityInput
): EnforceCapabilityDecision {
  const [type, ref, ...rest] = input.required_scope.split(':');
  if (!type || !ref || rest.length > 0) {
    return deny('INVALID_SCOPE', 'required_scope must be a "type:ref" string.');
  }

  try {
    validateCapabilityToken(input.token);
    if (input.consent) {
      verifyAgainstConsent(input.token, input.consent);
    }
  } catch (error) {
    if (error instanceof LegacyBridgeValidationError) {
      return deny(error.code, error.message);
    }

    return deny('INVALID_CAPABILITY', (error as Error).message);
  }

  if (isRevoked(input.token.capability_hash, input.registries?.revocationRegistry)) {
    return deny('REVOKED', 'Capability token has been revoked.');
  }

  const nonceRegistry = input.registries?.nonceRegistry;
  if (
    input.consume !== false &&
    nonceRegistry?.hasSeen(input.token.token_id, input.now ?? new Date())
  ) {
    return deny('REPLAY', 'Capability token_id has already been presented (replay detected).');
  }

  const decision = evaluateCapabilityAccess(
    buildLegacyAccessRequest(input, type, ref)
  );

  if (!decision.allowed) {
    return {
      allowed: false,
      code: mapReasonCode(decision.reasonCode),
      reason: decision.reason,
      metadata: {
        ...decision.metadata,
        legacyBridgeAction: input.action ?? 'read'
      }
    };
  }

  if (input.consume !== false && nonceRegistry) {
    nonceRegistry.markSeen(input.token.token_id, input.token.expires_at);
    nonceRegistry.cleanup?.(input.now ?? new Date());
  }

  return {
    allowed: true,
    code: 'OK',
    reason: decision.reason,
    metadata: {
      ...decision.metadata,
      legacyBridgeAction: input.action ?? 'read'
    }
  };
}
