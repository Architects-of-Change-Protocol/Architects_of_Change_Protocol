import { buildCapabilityAuthorizedEvent, buildCapabilityDeniedEvent } from '../../protocol/audit/builders';
import { authorizeWithCapability, type CapabilityAuthorizationResult, type CapabilityToken } from '../../protocol/consent';
import type { AuditEvent } from '../../protocol/audit';

export type EnforcementMode = 'soft' | 'strict';

export type CapabilityRequestContext = {
  endpoint: string;
  headers: Record<string, string | string[] | undefined>;
  payload: unknown;
  subject_id: string;
  requester_id: string;
  mode: EnforcementMode;
  capabilitySecret: string;
};

export type CapabilityEnforcementResult = {
  allowed: boolean;
  reason_code: string;
  status_code: number;
  token_present: boolean;
  authorization?: CapabilityAuthorizationResult;
  auditEvent?: AuditEvent;
};

function normalizeHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function maybeParseCapabilityHeader(value: string | undefined): unknown {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getCapabilityFromPayload(payload: unknown): unknown {
  if (payload === null || typeof payload !== 'object') {
    return undefined;
  }

  const candidate = payload as { capability?: unknown; capability_token?: unknown; token?: unknown };
  if (candidate.capability !== undefined) {
    return candidate.capability;
  }
  if (candidate.capability_token !== undefined) {
    return candidate.capability_token;
  }
  if (candidate.token !== undefined) {
    return candidate.token;
  }

  return undefined;
}

function extractCapabilityToken(context: CapabilityRequestContext): unknown {
  const headerToken = maybeParseCapabilityHeader(normalizeHeaderValue(context.headers['x-aoc-capability']));
  if (headerToken !== undefined) {
    return headerToken;
  }

  return getCapabilityFromPayload(context.payload);
}

function buildAudit(result: CapabilityAuthorizationResult, context: CapabilityRequestContext): AuditEvent {
  const builderInput = {
    allowed: result.allowed,
    reason_code: result.reason_code,
    subject_id: context.subject_id,
    requester_id: context.requester_id,
    resource: context.endpoint,
    action: 'execute',
    capability_id: result.capability_id,
    metadata: {
      enforcement_mode: context.mode,
    },
  };

  return result.allowed ? buildCapabilityAuthorizedEvent(builderInput) : buildCapabilityDeniedEvent(builderInput);
}

export function enforceCapabilityAccess(context: CapabilityRequestContext): CapabilityEnforcementResult {
  const token = extractCapabilityToken(context);
  const tokenPresent = token !== undefined;

  if (!tokenPresent && context.mode === 'soft') {
    return {
      allowed: true,
      reason_code: 'CAPABILITY_SOFT_ALLOW_MISSING',
      status_code: 200,
      token_present: false,
    };
  }

  if (!tokenPresent) {
    const authorization: CapabilityAuthorizationResult = {
      allowed: false,
      reason_code: 'DENY_INVALID_CAPABILITY',
      evaluated_at: new Date().toISOString(),
      capability_id: null,
    };

    return {
      allowed: false,
      reason_code: 'CAPABILITY_MISSING',
      status_code: 403,
      token_present: false,
      authorization,
      auditEvent: buildAudit(authorization, context),
    };
  }

  const authorization = authorizeWithCapability(
    {
      subject_id: context.subject_id,
      requester_id: context.requester_id,
      resource: context.endpoint,
      action: 'execute',
    },
    token,
    context.capabilitySecret
  );

  return {
    allowed: authorization.allowed,
    reason_code: authorization.allowed ? 'CAPABILITY_AUTHORIZED' : 'CAPABILITY_DENIED',
    status_code: authorization.allowed ? 200 : 403,
    token_present: true,
    authorization,
    auditEvent: buildAudit(authorization, context),
  };
}

export function asCapabilityToken(token: unknown): CapabilityToken | undefined {
  if (!token || typeof token !== 'object') {
    return undefined;
  }
  return token as CapabilityToken;
}
