import {
  validateCapabilityToken,
  type CapabilityTokenV1
} from '../../capability';
import { isRevoked } from '../../capability/revocation';
import type { NonceRegistry } from '../../capability/registries/NonceRegistry';
import type { RevocationRegistry } from '../../capability/registries/RevocationRegistry';
import {
  validateConsentObject,
  type ConsentObjectV1
} from '../../consent';
import type {
  CapabilityAccessChecks,
  CapabilityAccessRequest,
  CapabilityResource
} from '../../enforcement';
import {
  capabilityAccessReasonCodes,
  evaluateCapabilityAccess
} from '../../enforcement';
import type { CapabilityAccessReasonCode } from '../../enforcement/reasonCodes';
import { validateCapabilityActions } from '../../shared/capabilityActions';
import type { MarketMakerRegistry } from '../../shared/marketMakerRegistry';
import { verifyCapabilityConsentBinding } from './consentBinding';

const CLOCK_SKEW_SECONDS = 300;
const ALLOWED_RESOURCE_TYPES = new Set(['field', 'content', 'pack']);
const HASH_HEX_PATTERN = /^[a-f0-9]{64}$/;

export const capabilityConsumptionReasonCodes = {
  ...capabilityAccessReasonCodes,
  CAPABILITY_REVOKED: 'CAPABILITY_REVOKED',
  CAPABILITY_REPLAYED: 'CAPABILITY_REPLAYED',
  REPLAY_PROTECTION_REQUIRED: 'REPLAY_PROTECTION_REQUIRED'
} as const;

export type CapabilityConsumptionReasonCode =
  | CapabilityAccessReasonCode
  | (typeof capabilityConsumptionReasonCodes)[keyof Omit<
      typeof capabilityConsumptionReasonCodes,
      keyof typeof capabilityAccessReasonCodes
    >];

export type CapabilityConsumptionCheckState = 'pass' | 'fail' | 'not_applicable';

export type CapabilityConsumptionChecks = CapabilityAccessChecks & {
  consent: CapabilityConsumptionCheckState;
  revocation: CapabilityConsumptionCheckState;
  replay: CapabilityConsumptionCheckState;
};

export type ConsentUsageResult = 'allow' | 'deny';

export type ConsentUsageState = {
  consentRef: string;
  usageCount: number;
  lastAccessedAt: string;
  lastAccessResult: ConsentUsageResult;
};

export interface ConsentUsageRegistry {
  get(consentRef: string): ConsentUsageState | undefined;
  record(
    consentRef: string,
    result: ConsentUsageResult,
    timestamp: string
  ): ConsentUsageState;
}

export class InMemoryConsentUsageRegistry implements ConsentUsageRegistry {
  private readonly states = new Map<string, ConsentUsageState>();

  get(consentRef: string): ConsentUsageState | undefined {
    const state = this.states.get(consentRef);
    return state ? { ...state } : undefined;
  }

  record(
    consentRef: string,
    result: ConsentUsageResult,
    timestamp: string
  ): ConsentUsageState {
    const current = this.states.get(consentRef);
    const next: ConsentUsageState = {
      consentRef,
      usageCount: (current?.usageCount ?? 0) + (result === 'allow' ? 1 : 0),
      lastAccessedAt: timestamp,
      lastAccessResult: result
    };

    this.states.set(consentRef, next);
    return { ...next };
  }
}

export type CapabilityConsumptionRequest = {
  capability: CapabilityAccessRequest['capability'];
  consent?: ConsentObjectV1 | null;
  action: string;
  resource: CapabilityResource;
  marketMakerId?: string;
  now?: string | number | Date;
  usageContext?: Record<string, unknown>;
  paymentContext?: {
    paid: boolean;
  };
  policyContext?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  marketMakerRegistry?: Pick<MarketMakerRegistry, 'exists' | 'getStatus'>;
  hooks?: CapabilityAccessRequest['hooks'];
  registries?: {
    nonceRegistry?: NonceRegistry;
    revocationRegistry?: RevocationRegistry;
    consentUsageRegistry?: ConsentUsageRegistry;
  };
  consume?: boolean;
  requireReplayProtection?: boolean;
};

export type CapabilityConsumptionDecision = {
  allowed: boolean;
  decision: 'allow' | 'deny';
  reasonCode: CapabilityConsumptionReasonCode;
  reason: string;
  evaluatedAt: string;
  checks: CapabilityConsumptionChecks;
  metadata: Record<string, unknown>;
  consumed: boolean;
  replayChecked: boolean;
  revocationChecked: boolean;
  usage?: Pick<ConsentUsageState, 'usageCount' | 'lastAccessedAt' | 'lastAccessResult'>;
  payment?: {
    required: boolean;
    amount?: number;
    currency?: string;
  };
};

function normalizeNow(now?: string | number | Date): Date {
  const normalized = now instanceof Date ? new Date(now.getTime()) : now !== undefined ? new Date(now) : new Date();
  if (Number.isNaN(normalized.getTime())) {
    throw new Error('Evaluation timestamp must be a valid date.');
  }
  return normalized;
}

function normalizeEvaluatedAt(now?: string | number | Date): string {
  return normalizeNow(now)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z');
}

function makeChecks(): CapabilityConsumptionChecks {
  return {
    integrity: 'fail',
    consent: 'not_applicable',
    revocation: 'not_applicable',
    replay: 'not_applicable',
    temporal: 'not_applicable',
    action: 'fail',
    resource: 'fail',
    marketMaker: 'not_applicable',
    usage: 'not_applicable',
    policy: 'not_applicable'
  };
}

function deepCloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  const entries = Array.isArray(value) ? value : Object.values(value as Record<string, unknown>);
  for (const entry of entries) {
    deepFreeze(entry);
  }

  return Object.freeze(value);
}

function cloneCapability(
  capability: CapabilityConsumptionRequest['capability']
): CapabilityConsumptionRequest['capability'] {
  if (capability === null || capability === undefined) {
    return capability;
  }
  return deepFreeze(deepCloneJson(capability));
}

function cloneConsent(
  consent: CapabilityConsumptionRequest['consent']
): CapabilityConsumptionRequest['consent'] {
  if (consent === null || consent === undefined) {
    return consent;
  }
  return deepFreeze(deepCloneJson(consent));
}

function normalizeAction(action: string): string {
  const normalizedAction = action.trim().toLowerCase();
  validateCapabilityActions([normalizedAction], {
    containerLabel: 'Requested actions',
    itemLabel: 'Requested action',
    emptyMessage: 'Requested action is required for access evaluation.',
    maxEntries: 1
  });
  return normalizedAction;
}

function normalizeResource(resource: CapabilityResource): { type: 'field' | 'content' | 'pack'; ref: string } {
  const raw =
    typeof resource === 'string'
      ? (() => {
          const [type, ref, ...rest] = resource.trim().split(':');
          if (!type || !ref || rest.length > 0) {
            throw new Error('Requested resource must be a canonical "type:ref" string.');
          }
          return { type, ref };
        })()
      : resource && typeof resource === 'object'
        ? {
            type: typeof resource.type === 'string' ? resource.type.trim() : '',
            ref: typeof resource.ref === 'string' ? resource.ref.trim() : ''
          }
        : null;

  if (!raw) {
    throw new Error('Requested resource must include string type and ref fields.');
  }

  if (!ALLOWED_RESOURCE_TYPES.has(raw.type)) {
    throw new Error('Requested resource type must be one of: field, content, pack.');
  }

  if (!HASH_HEX_PATTERN.test(raw.ref)) {
    throw new Error('Requested resource ref must be 64 lowercase hex characters.');
  }

  return raw as { type: 'field' | 'content' | 'pack'; ref: string };
}

function parseTimestamp(timestamp: string, label: string): Date {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} must be a valid date.`);
  }
  return parsed;
}

function enforceTimestampWithinSkew(
  timestamp: string,
  now: Date,
  label: string
): Date {
  const parsed = parseTimestamp(timestamp, label);
  if (Math.abs(parsed.getTime() - now.getTime()) > CLOCK_SKEW_SECONDS * 1000) {
    throw new Error(`${label} exceeds allowed clock skew.`);
  }
  return parsed;
}

function enforceCapabilityTemporalIntegrity(
  capability: CapabilityTokenV1,
  consent: ConsentObjectV1 | null | undefined,
  now: Date
): void {
  enforceTimestampWithinSkew(capability.issued_at, now, 'Capability issued_at');

  if (capability.not_before) {
    const notBefore = enforceTimestampWithinSkew(capability.not_before, now, 'Capability not_before');
    if (now.getTime() < notBefore.getTime()) {
      throw new Error('Capability not yet valid.');
    }
  }

  const expiresAt = enforceTimestampWithinSkew(capability.expires_at, now, 'Capability expires_at');
  if (expiresAt.getTime() < now.getTime()) {
    throw new Error('Capability has expired.');
  }

  if (consent) {
    enforceTimestampWithinSkew(consent.issued_at, now, 'Consent issued_at');
  }
}

function sanitizeMetadata(base: {
  capabilityHash?: string;
  tokenId?: string;
  failureStage?: string;
}): Record<string, unknown> {
  return {
    ...(base.capabilityHash !== undefined ? { capabilityHash: base.capabilityHash } : {}),
    ...(base.tokenId !== undefined ? { tokenId: base.tokenId } : {}),
    ...(base.failureStage !== undefined ? { failureStage: base.failureStage } : {})
  };
}

function toUsageOutput(
  state: ConsentUsageState
): Pick<ConsentUsageState, 'usageCount' | 'lastAccessedAt' | 'lastAccessResult'> {
  return {
    usageCount: state.usageCount,
    lastAccessedAt: state.lastAccessedAt,
    lastAccessResult: state.lastAccessResult
  };
}

function recordUsage(
  request: CapabilityConsumptionRequest,
  capability: CapabilityTokenV1 | null | undefined,
  result: ConsentUsageResult,
  evaluatedAt: string
): Pick<ConsentUsageState, 'usageCount' | 'lastAccessedAt' | 'lastAccessResult'> | undefined {
  const registry = request.registries?.consentUsageRegistry;
  const consentRef = capability?.consent_ref;

  if (!registry || typeof consentRef !== 'string' || consentRef.length === 0) {
    return undefined;
  }

  try {
    return toUsageOutput(registry.record(consentRef, result, evaluatedAt));
  } catch {
    return undefined;
  }
}

function deny(
  evaluatedAt: string,
  reasonCode: CapabilityConsumptionReasonCode,
  reason: string,
  checks: CapabilityConsumptionChecks,
  metadata: Record<string, unknown>,
  replayChecked: boolean,
  revocationChecked: boolean,
  usage?: Pick<ConsentUsageState, 'usageCount' | 'lastAccessedAt' | 'lastAccessResult'>,
  payment?: CapabilityConsumptionDecision['payment']
): CapabilityConsumptionDecision {
  return {
    allowed: false,
    decision: 'deny',
    reasonCode,
    reason,
    evaluatedAt,
    checks,
    metadata,
    consumed: false,
    replayChecked,
    revocationChecked,
    ...(usage ? { usage } : {}),
    ...(payment ? { payment } : {})
  };
}

function buildPaymentDecision(consent: ConsentObjectV1 | null | undefined, paid: boolean): CapabilityConsumptionDecision['payment'] | undefined {
  if (!consent?.pricing) {
    return undefined;
  }

  return {
    required: paid !== true,
    amount: consent.pricing.amount,
    currency: consent.pricing.currency
  };
}

function buildEvaluationRequest(
  request: CapabilityConsumptionRequest,
  normalizedCapability: CapabilityConsumptionRequest['capability'],
  normalizedConsent: CapabilityConsumptionRequest['consent'],
  normalizedAction: string,
  normalizedResource: { type: 'field' | 'content' | 'pack'; ref: string },
  evaluatedAt: string
): CapabilityAccessRequest {
  return {
    capability: normalizedCapability,
    consent: normalizedConsent,
    action: normalizedAction,
    resource: normalizedResource,
    marketMakerId: request.marketMakerId,
    now: evaluatedAt,
    usageContext: request.usageContext ? { ...request.usageContext } : undefined,
    policyContext: request.policyContext ? { ...request.policyContext } : undefined,
    metadata: undefined,
    marketMakerRegistry: request.marketMakerRegistry,
    hooks: request.hooks
  };
}

export function consumeCapabilityAccess(
  request: CapabilityConsumptionRequest
): CapabilityConsumptionDecision {
  const now = normalizeNow(request.now);
  const evaluatedAt = normalizeEvaluatedAt(now);
  const checks = makeChecks();
  let capabilityForUsage: CapabilityTokenV1 | undefined;

  try {
    const normalizedCapability = cloneCapability(request.capability);
    const normalizedConsent = cloneConsent(request.consent);
    const normalizedAction = normalizeAction(request.action);
    const normalizedResource = normalizeResource(request.resource);

    validateCapabilityToken(normalizedCapability as CapabilityTokenV1);
    checks.integrity = 'pass';
    checks.action = 'pass';
    checks.resource = 'pass';

    const capability = normalizedCapability as CapabilityTokenV1;
    capabilityForUsage = capability;
    const metadata = sanitizeMetadata({
      capabilityHash: capability.capability_hash,
      tokenId: capability.token_id
    });

    if (normalizedConsent) {
      validateConsentObject(normalizedConsent);
      verifyCapabilityConsentBinding(capability, normalizedConsent);
      checks.consent = 'pass';
    }

    try {
      enforceCapabilityTemporalIntegrity(capability, normalizedConsent, now);
      checks.temporal = 'pass';
    } catch (error) {
      checks.temporal = 'fail';
      return deny(
        evaluatedAt,
        capabilityAccessReasonCodes.CAPABILITY_INVALID,
        (error as Error).message || 'Capability temporal validation failed.',
        checks,
        sanitizeMetadata({ ...metadata, failureStage: 'temporal' }),
        false,
        false,
        recordUsage(request, capability, 'deny', evaluatedAt)
      );
    }

    checks.revocation = 'pass';
    if (isRevoked(capability.capability_hash, request.registries?.revocationRegistry)) {
      checks.revocation = 'fail';
      return deny(
        evaluatedAt,
        capabilityConsumptionReasonCodes.CAPABILITY_REVOKED,
        'Capability token has been revoked.',
        checks,
        sanitizeMetadata({ ...metadata, failureStage: 'revocation' }),
        false,
        true,
        recordUsage(request, capability, 'deny', evaluatedAt)
      );
    }

    const nonceRegistry = request.registries?.nonceRegistry;
    const shouldConsume = request.consume !== false;
    const shouldCheckReplay = Boolean(nonceRegistry) && shouldConsume;

    if (shouldCheckReplay) {
      checks.replay = 'pass';
      if (nonceRegistry!.hasSeen(capability.token_id, now)) {
        checks.replay = 'fail';
        return deny(
          evaluatedAt,
          capabilityConsumptionReasonCodes.CAPABILITY_REPLAYED,
          'Capability token_id has already been presented (replay detected).',
          checks,
          sanitizeMetadata({ ...metadata, failureStage: 'replay' }),
          true,
          true,
          recordUsage(request, capability, 'deny', evaluatedAt)
        );
      }
    } else if (request.requireReplayProtection) {
      checks.replay = 'fail';
      return deny(
        evaluatedAt,
        capabilityConsumptionReasonCodes.REPLAY_PROTECTION_REQUIRED,
        'Replay protection is required for consumption but no nonce registry was supplied.',
        checks,
        sanitizeMetadata({ ...metadata, failureStage: 'replay' }),
        false,
        true,
        recordUsage(request, capability, 'deny', evaluatedAt)
      );
    }

    const accessDecision = evaluateCapabilityAccess(
      buildEvaluationRequest(
        request,
        normalizedCapability,
        normalizedConsent,
        normalizedAction,
        normalizedResource,
        evaluatedAt
      )
    );
    checks.temporal = accessDecision.checks.temporal;
    checks.action = accessDecision.checks.action;
    checks.resource = accessDecision.checks.resource;
    checks.marketMaker = accessDecision.checks.marketMaker;
    checks.usage = accessDecision.checks.usage;
    checks.policy = accessDecision.checks.policy;

    if (!accessDecision.allowed) {
      return deny(
        evaluatedAt,
        accessDecision.reasonCode,
        accessDecision.reason,
        checks,
        sanitizeMetadata({
          ...metadata,
          failureStage:
            typeof accessDecision.metadata.failureStage === 'string'
              ? accessDecision.metadata.failureStage
              : 'integrity'
        }),
        shouldCheckReplay,
        true,
        recordUsage(request, capability, 'deny', evaluatedAt),
        buildPaymentDecision(normalizedConsent, request.paymentContext?.paid === true)
      );
    }

    const paid = request.paymentContext?.paid === true;
    const payment = buildPaymentDecision(normalizedConsent, paid);

    if (normalizedConsent?.pricing && !paid) {
      return deny(
        evaluatedAt,
        capabilityAccessReasonCodes.PAYMENT_REQUIRED,
        'Payment is required before this capability can be consumed.',
        checks,
        sanitizeMetadata({ ...metadata, failureStage: 'payment' }),
        shouldCheckReplay,
        true,
        recordUsage(request, capability, 'deny', evaluatedAt),
        payment
      );
    }

    let consumed = false;
    if (shouldConsume && nonceRegistry) {
      nonceRegistry.markSeen(capability.token_id, capability.expires_at);
      nonceRegistry.cleanup?.(now);
      consumed = true;
    }

    const usage = recordUsage(request, capability, 'allow', evaluatedAt);

    return {
      allowed: true,
      decision: 'allow',
      reasonCode: accessDecision.reasonCode,
      reason: accessDecision.reason,
      evaluatedAt,
      checks,
      metadata: sanitizeMetadata({ ...metadata, failureStage: 'completed' }),
      consumed,
      replayChecked: shouldCheckReplay,
      revocationChecked: true,
      ...(usage ? { usage } : {}),
      ...(payment ? { payment } : {})
    };
  } catch (error) {
    if (checks.consent === 'not_applicable' && request.consent) {
      checks.consent = 'fail';
    }

    return deny(
      evaluatedAt,
      capabilityAccessReasonCodes.CAPABILITY_INVALID,
      (error as Error).message || 'Capability consumption request is invalid.',
      checks,
      sanitizeMetadata({ failureStage: 'integrity' }),
      false,
      checks.revocation !== 'not_applicable',
      recordUsage(request, capabilityForUsage, 'deny', evaluatedAt)
    );
  }
}
