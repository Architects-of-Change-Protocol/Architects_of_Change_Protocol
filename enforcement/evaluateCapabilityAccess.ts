import { capabilityAccessReasonCodes } from './reasonCodes';
import {
  allowDecision,
  classifyIntegrityError,
  denyDecision,
  normalizeCapabilityAccessRequest,
  normalizeEvaluationTime
} from './normalize';
import type {
  CapabilityAccessChecks,
  CapabilityAccessDecision,
  CapabilityAccessRequest,
  CapabilityAccessHookResult,
  CapabilityPolicyHook,
  CapabilityUsageHook,
  NormalizedCapabilityAccessRequest
} from './types';

function makeChecks(): CapabilityAccessChecks {
  return {
    integrity: 'fail',
    temporal: 'not_applicable',
    action: 'fail',
    resource: 'fail',
    marketMaker: 'not_applicable',
    usage: 'not_applicable',
    policy: 'not_applicable'
  };
}

function evaluateConsentBinding(
  input: NormalizedCapabilityAccessRequest
): CapabilityAccessDecision | null {
  if (!input.consent) {
    return null;
  }

  if (input.consent.action !== 'grant') {
    return denyDecision(
      input.evaluatedAt,
      capabilityAccessReasonCodes.CONSENT_INVALID,
      'Parent consent must be an active grant for capability access.',
      makeChecks(),
      {
        failureStage: 'integrity',
        capabilityHash: input.capability.capabilityHash,
        consentRef: input.capability.consentRef
      }
    );
  }

  if (input.capability.consentRef !== input.consent.consent_hash) {
    return denyDecision(
      input.evaluatedAt,
      capabilityAccessReasonCodes.CONSENT_MISMATCH,
      'Capability consent reference does not match the supplied parent consent.',
      makeChecks(),
      {
        failureStage: 'integrity',
        capabilityHash: input.capability.capabilityHash,
        consentRef: input.capability.consentRef
      }
    );
  }

  const rawCapability = input.capability.raw as Record<string, unknown>;

  if (rawCapability.subject !== input.consent.subject) {
    return denyDecision(
      input.evaluatedAt,
      capabilityAccessReasonCodes.CONSENT_MISMATCH,
      'Capability subject does not match the supplied parent consent.',
      makeChecks(),
      {
        failureStage: 'integrity',
        capabilityHash: input.capability.capabilityHash,
        consentRef: input.capability.consentRef
      }
    );
  }

  if (rawCapability.grantee !== input.consent.grantee) {
    return denyDecision(
      input.evaluatedAt,
      capabilityAccessReasonCodes.CONSENT_MISMATCH,
      'Capability grantee does not match the supplied parent consent.',
      makeChecks(),
      {
        failureStage: 'integrity',
        capabilityHash: input.capability.capabilityHash,
        consentRef: input.capability.consentRef
      }
    );
  }

  if (input.capability.marketMakerId !== (input.consent.marketMakerId ?? null)) {
    return denyDecision(
      input.evaluatedAt,
      capabilityAccessReasonCodes.CONSENT_MISMATCH,
      'Capability marketMakerId does not match the supplied parent consent.',
      makeChecks(),
      {
        failureStage: 'integrity',
        capabilityHash: input.capability.capabilityHash,
        consentRef: input.capability.consentRef,
        boundMarketMakerId: input.capability.marketMakerId ?? undefined,
        consentMarketMakerId: input.consent.marketMakerId
      }
    );
  }

  return null;
}

function evaluateHookResult(
  hookResult: CapabilityAccessHookResult,
  evaluatedAt: string,
  checks: CapabilityAccessChecks,
  kind: 'usage' | 'policy',
  defaultReasonCode: 'USAGE_DENIED' | 'POLICY_DENIED'
): CapabilityAccessDecision | null {
  if (hookResult.allowed) {
    checks[kind] = 'pass';
    return null;
  }

  checks[kind] = 'fail';
  return denyDecision(
    evaluatedAt,
    hookResult.reasonCode ?? capabilityAccessReasonCodes[defaultReasonCode],
    hookResult.reason ?? `${kind === 'usage' ? 'Usage' : 'Policy'} evaluation denied access.`,
    checks,
    {
      failureStage: kind,
      ...(hookResult.metadata ?? {})
    }
  );
}

function invokeOptionalHook(
  hook: CapabilityUsageHook | CapabilityPolicyHook | undefined,
  normalized: NormalizedCapabilityAccessRequest,
  evaluatedAt: string,
  checks: CapabilityAccessChecks,
  kind: 'usage' | 'policy',
  defaultReasonCode: 'USAGE_DENIED' | 'POLICY_DENIED'
): CapabilityAccessDecision | null {
  if (!hook) {
    return null;
  }

  try {
    return evaluateHookResult(
      hook(normalized),
      evaluatedAt,
      checks,
      kind,
      defaultReasonCode
    );
  } catch (error) {
    checks[kind] = 'fail';
    return denyDecision(
      evaluatedAt,
      capabilityAccessReasonCodes.INTERNAL_EVALUATION_ERROR,
      (error as Error).message || 'Internal capability evaluation error.',
      checks,
      { failureStage: kind }
    );
  }
}

export function evaluateCapabilityAccess(
  input: CapabilityAccessRequest
): CapabilityAccessDecision {
  const checks = makeChecks();

  try {
    const evaluatedAt = normalizeEvaluationTime(input.now);
    const normalized = normalizeCapabilityAccessRequest(input, evaluatedAt);
    const consentDecision = evaluateConsentBinding(normalized);

    if (consentDecision) {
      return consentDecision;
    }

    try {
      checks.integrity = 'pass';

      if (
        normalized.capability.status !== null &&
        normalized.capability.status !== 'active'
      ) {
        return denyDecision(
          evaluatedAt,
          capabilityAccessReasonCodes.CAPABILITY_INACTIVE,
          `Capability status ${normalized.capability.status} does not permit access.`,
          checks,
          {
            failureStage: 'integrity',
            capabilityHash: normalized.capability.capabilityHash,
            tokenId: normalized.capability.tokenId,
            consentRef: normalized.capability.consentRef
          }
        );
      }

      checks.temporal = 'pass';
      const effectiveStart = normalized.capability.notBefore;
      if (effectiveStart !== null && evaluatedAt < effectiveStart) {
        checks.temporal = 'fail';
        return denyDecision(
          evaluatedAt,
          capabilityAccessReasonCodes.CAPABILITY_NOT_YET_VALID,
          'Capability is not yet valid at the requested evaluation time.',
          checks,
          {
            failureStage: 'temporal',
            capabilityHash: normalized.capability.capabilityHash,
            tokenId: normalized.capability.tokenId,
            consentRef: normalized.capability.consentRef
          }
        );
      }

      if (evaluatedAt > normalized.capability.expiresAt) {
        checks.temporal = 'fail';
        return denyDecision(
          evaluatedAt,
          capabilityAccessReasonCodes.CAPABILITY_EXPIRED,
          'Capability has expired at the requested evaluation time.',
          checks,
          {
            failureStage: 'temporal',
            capabilityHash: normalized.capability.capabilityHash,
            tokenId: normalized.capability.tokenId,
            consentRef: normalized.capability.consentRef
          }
        );
      }

      if (!normalized.capability.permissions.includes(normalized.action)) {
        checks.action = 'fail';
        return denyDecision(
          evaluatedAt,
          capabilityAccessReasonCodes.ACTION_NOT_ALLOWED,
          `Capability does not allow action "${normalized.action}".`,
          checks,
          {
            failureStage: 'action',
            capabilityHash: normalized.capability.capabilityHash,
            tokenId: normalized.capability.tokenId,
            consentRef: normalized.capability.consentRef
          }
        );
      }
      checks.action = 'pass';

      const requestedResourceKey = `${normalized.resource.type}:${normalized.resource.ref}`;
      const matchedResource = normalized.capability.scope.find(
        (scopeEntry) => `${scopeEntry.type}:${scopeEntry.ref}` === requestedResourceKey
      );

      if (!matchedResource) {
        checks.resource = 'fail';
        return denyDecision(
          evaluatedAt,
          capabilityAccessReasonCodes.RESOURCE_NOT_ALLOWED,
          `Capability does not allow resource "${requestedResourceKey}".`,
          checks,
          {
            failureStage: 'resource',
            capabilityHash: normalized.capability.capabilityHash,
            tokenId: normalized.capability.tokenId,
            consentRef: normalized.capability.consentRef
          }
        );
      }
      checks.resource = 'pass';

      if (normalized.capability.marketMakerId !== null) {
        if (!normalized.marketMakerId) {
          checks.marketMaker = 'fail';
          return denyDecision(
            evaluatedAt,
            capabilityAccessReasonCodes.MARKET_MAKER_REQUIRED,
            'Capability is bound to a market maker and requires marketMakerId in the request.',
            checks,
            {
              failureStage: 'marketMaker',
              capabilityHash: normalized.capability.capabilityHash,
              tokenId: normalized.capability.tokenId,
              consentRef: normalized.capability.consentRef,
              boundMarketMakerId: normalized.capability.marketMakerId ?? undefined
            }
          );
        }

        if (normalized.marketMakerId !== normalized.capability.marketMakerId) {
          checks.marketMaker = 'fail';
          return denyDecision(
            evaluatedAt,
            capabilityAccessReasonCodes.MARKET_MAKER_MISMATCH,
            'Requested market maker does not match the capability binding.',
            checks,
            {
              failureStage: 'marketMaker',
              capabilityHash: normalized.capability.capabilityHash,
              tokenId: normalized.capability.tokenId,
              consentRef: normalized.capability.consentRef,
              marketMakerId: normalized.marketMakerId,
              boundMarketMakerId: normalized.capability.marketMakerId ?? undefined
            }
          );
        }

        checks.marketMaker = 'pass';
      }

      const usageDecision = invokeOptionalHook(
        input.hooks?.usage,
        normalized,
        evaluatedAt,
        checks,
        'usage',
        'USAGE_DENIED'
      );
      if (usageDecision) {
        return usageDecision;
      }

      const policyDecision = invokeOptionalHook(
        input.hooks?.policy,
        normalized,
        evaluatedAt,
        checks,
        'policy',
        'POLICY_DENIED'
      );
      if (policyDecision) {
        return policyDecision;
      }

      return allowDecision(
        evaluatedAt,
        'Capability explicitly authorizes the requested action on the requested resource.',
        checks,
        {
          capabilityHash: normalized.capability.capabilityHash,
          tokenId: normalized.capability.tokenId,
          consentRef: normalized.capability.consentRef,
          matchedAction: normalized.action,
          matchedResource: requestedResourceKey,
          marketMakerId: normalized.marketMakerId,
          boundMarketMakerId: normalized.capability.marketMakerId ?? undefined
        }
      );
    } catch (error) {
      return denyDecision(
        evaluatedAt,
        capabilityAccessReasonCodes.INTERNAL_EVALUATION_ERROR,
        (error as Error).message || 'Internal capability evaluation error.',
        checks,
        { failureStage: 'completed' }
      );
    }
  } catch (error) {
    const evaluatedAt =
      input.now === undefined
        ? new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
        : new Date(0).toISOString().replace(/\.\d{3}Z$/, 'Z');
    const classified = classifyIntegrityError(error);

    return denyDecision(
      evaluatedAt,
      classified.code,
      classified.message,
      checks,
      { failureStage: 'integrity' }
    );
  }
}
