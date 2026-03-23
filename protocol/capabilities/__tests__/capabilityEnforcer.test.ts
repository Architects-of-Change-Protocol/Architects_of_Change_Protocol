import { buildConsentObject } from '../../../consent';
import { mintCapabilityToken } from '../../../capability';
import { capabilityAccessReasonCodes } from '../../../enforcement';
import { enforceCapability } from '../capabilityEnforcer';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const CONTENT_REF = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const CONSENT_EXPIRES = '2026-01-15T14:30:00Z';
const NOW = new Date('2025-08-01T00:00:00Z');

function buildConsent(marketMakerId?: string) {
  return buildConsentObject(
    SUBJECT,
    GRANTEE,
    'grant',
    [{ type: 'content', ref: CONTENT_REF }],
    ['read'],
    {
      now: new Date('2025-01-15T14:30:00Z'),
      expires_at: CONSENT_EXPIRES,
      ...(marketMakerId !== undefined ? { marketMakerId } : {})
    }
  );
}

function buildToken(overrides: Record<string, unknown> = {}) {
  const consent = buildConsent(
    typeof overrides.marketMakerId === 'string' ? overrides.marketMakerId : undefined
  );

  return {
    consent,
    token: {
      ...mintCapabilityToken(
        consent,
        [{ type: 'content', ref: CONTENT_REF }],
        ['read'],
        '2025-12-31T23:59:59Z',
        { now: new Date('2025-06-15T10:00:00Z') }
      ),
      ...overrides
    }
  };
}

describe('legacy capability bridge mapping', () => {
  it('maps consent mismatch pre-checks to CONSENT_MISMATCH', () => {
    const { token } = buildToken();
    const mismatchedConsent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: CONTENT_REF }],
      ['read'],
      { now: new Date('2025-02-01T00:00:00Z'), expires_at: CONSENT_EXPIRES }
    );

    const decision = enforceCapability({
      token,
      consent: mismatchedConsent,
      required_scope: `content:${CONTENT_REF}`,
      now: NOW
    });

    expect(decision.code).toBe('CONSENT_MISMATCH');
  });

  it('maps consent-invalid bridge pre-checks to CONSENT_MISMATCH', () => {
    const { token, consent } = buildToken();

    const decision = enforceCapability({
      token,
      consent: {
        ...consent,
        action: 'revoke',
        scope: [],
        permissions: [],
        expires_at: null,
        revoke_target: { capability_hash: token.capability_hash }
      } as any,
      required_scope: `content:${CONTENT_REF}`,
      now: NOW
    });

    expect(decision.code).toBe('CONSENT_MISMATCH');
  });

  it('maps market-maker binding decisions to REQUEST_CONTEXT_MISMATCH', () => {
    const { token, consent } = buildToken({ marketMakerId: 'hrkey-v1' });

    const requiredDecision = enforceCapability({
      token,
      consent,
      required_scope: `content:${CONTENT_REF}`,
      now: NOW
    });
    expect(requiredDecision.code).toBe('REQUEST_CONTEXT_MISMATCH');

    const mismatchDecision = enforceCapability({
      token,
      consent,
      required_scope: `content:${CONTENT_REF}`,
      request_context: { marketMakerId: 'other-maker' },
      now: NOW
    });
    expect(mismatchDecision.code).toBe('REQUEST_CONTEXT_MISMATCH');
  });

  it('maps usage and policy denies to RESOURCE_RESTRICTION_FAILED', () => {
    const { token, consent } = buildToken();

    const usageDecision = enforceCapability({
      token,
      consent,
      required_scope: `content:${CONTENT_REF}`,
      now: NOW,
      hooks: {
        usage: () => ({
          allowed: false,
          reasonCode: capabilityAccessReasonCodes.USAGE_DENIED,
          reason: 'Usage quota exceeded.'
        })
      }
    });
    expect(usageDecision.code).toBe('RESOURCE_RESTRICTION_FAILED');

    const policyDecision = enforceCapability({
      token,
      consent,
      required_scope: `content:${CONTENT_REF}`,
      now: NOW,
      hooks: {
        policy: () => ({
          allowed: false,
          reasonCode: capabilityAccessReasonCodes.POLICY_DENIED,
          reason: 'Policy denied the request.'
        })
      }
    });
    expect(policyDecision.code).toBe('RESOURCE_RESTRICTION_FAILED');
  });

  it('denies non-read actions when the legacy bridge is misused outside its read-only contract', () => {
    const { token, consent } = buildToken();

    const decision = enforceCapability({
      token,
      consent,
      required_scope: `content:${CONTENT_REF}`,
      action: 'share' as any,
      now: NOW
    });

    expect(decision.code).toBe('INVALID_CAPABILITY');
    expect(decision.reason).toContain('Capability does not allow action "share".');
    expect(decision.metadata?.legacyBridgeAction).toBe('share');
  });

  it('defaults the bridge to read access and supports explicit read access', () => {
    const { token, consent } = buildToken();

    const implicitDecision = enforceCapability({
      token,
      consent,
      required_scope: `content:${CONTENT_REF}`,
      now: NOW
    });
    expect(implicitDecision.code).toBe('OK');
    expect(implicitDecision.metadata?.legacyBridgeAction).toBe('read');

    const explicitDecision = enforceCapability({
      token,
      consent,
      required_scope: `content:${CONTENT_REF}`,
      action: 'read',
      now: NOW
    });
    expect(explicitDecision.code).toBe('OK');
    expect(explicitDecision.metadata?.legacyBridgeAction).toBe('read');
  });
});
