import { buildConsentObject } from '../../consent';
import { mintCapabilityToken } from '../../capability';
import {
  capabilityAccessReasonCodes,
  evaluateCapabilityAccess
} from '..';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const GRANTEE = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const CONTENT_REF = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const PACK_REF = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const CONSENT_NOW = new Date('2025-01-15T14:30:00Z');
const TOKEN_NOW = new Date('2025-06-15T10:00:00Z');
const CONSENT_EXPIRES = '2026-01-15T14:30:00Z';
const TOKEN_EXPIRES = '2025-12-31T23:59:59Z';

function buildConsent() {
  return buildConsentObject(
    SUBJECT,
    GRANTEE,
    'grant',
    [
      { type: 'content', ref: CONTENT_REF },
      { type: 'pack', ref: PACK_REF }
    ],
    ['read', 'store'],
    { now: CONSENT_NOW, expires_at: CONSENT_EXPIRES }
  );
}

function buildCapability(overrides: Record<string, unknown> = {}) {
  const consent = buildConsent();
  const capability = mintCapabilityToken(
    consent,
    [
      { type: 'content', ref: CONTENT_REF },
      { type: 'pack', ref: PACK_REF }
    ],
    ['read'],
    TOKEN_EXPIRES,
    { now: TOKEN_NOW }
  ) as Record<string, unknown>;

  return {
    consent,
    capability: {
      ...capability,
      ...overrides
    }
  };
}

describe('evaluateCapabilityAccess', () => {
  it('allows access for a valid capability', () => {
    const { capability, consent } = buildCapability();
    const decision = evaluateCapabilityAccess({
      capability,
      consent,
      action: 'read',
      resource: { type: 'content', ref: CONTENT_REF },
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.allowed).toBe(true);
    expect(decision.decision).toBe('allow');
    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.ACCESS_ALLOWED);
    expect(decision.checks).toEqual({
      integrity: 'pass',
      temporal: 'pass',
      action: 'pass',
      resource: 'pass',
      marketMaker: 'not_applicable',
      usage: 'not_applicable',
      policy: 'not_applicable'
    });
    expect(decision.metadata.matchedResource).toBe(`content:${CONTENT_REF}`);
  });

  it('denies when capability is missing', () => {
    const decision = evaluateCapabilityAccess({
      capability: undefined,
      action: 'read',
      resource: { type: 'content', ref: CONTENT_REF },
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.CAPABILITY_MISSING);
  });

  it('denies malformed capability objects', () => {
    const { capability } = buildCapability({ permissions: [] });
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: { type: 'content', ref: CONTENT_REF },
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.CAPABILITY_INVALID);
  });

  it('denies inactive capabilities', () => {
    const { capability } = buildCapability({ status: 'inactive' });
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: { type: 'content', ref: CONTENT_REF },
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.CAPABILITY_INACTIVE);
  });

  it('denies not-yet-valid capabilities', () => {
    const { consent } = buildCapability();
    const capability = mintCapabilityToken(
      consent,
      [{ type: 'content', ref: CONTENT_REF }],
      ['read'],
      TOKEN_EXPIRES,
      { now: TOKEN_NOW, not_before: '2025-09-01T00:00:00Z' }
    );

    const decision = evaluateCapabilityAccess({
      capability,
      consent,
      action: 'read',
      resource: { type: 'content', ref: CONTENT_REF },
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.CAPABILITY_NOT_YET_VALID);
  });

  it('denies expired capabilities', () => {
    const { capability } = buildCapability();
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: { type: 'content', ref: CONTENT_REF },
      now: '2026-01-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.CAPABILITY_EXPIRED);
  });

  it('denies action mismatch', () => {
    const { capability } = buildCapability();
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'write',
      resource: { type: 'content', ref: CONTENT_REF },
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.ACTION_NOT_ALLOWED);
  });

  it('denies resource mismatch', () => {
    const { capability } = buildCapability();
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: { type: 'content', ref: 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc' },
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.RESOURCE_NOT_ALLOWED);
  });

  it('allows exact resource string matches', () => {
    const { capability } = buildCapability();
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.allowed).toBe(true);
  });

  it('allows when a bound market maker matches', () => {
    const { capability } = buildCapability({ marketMakerId: 'hrkey-v1' });
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      marketMakerId: 'hrkey-v1',
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.allowed).toBe(true);
    expect(decision.checks.marketMaker).toBe('pass');
  });

  it('denies when a bound market maker is missing', () => {
    const { capability } = buildCapability({ marketMakerId: 'hrkey-v1' });
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.MARKET_MAKER_REQUIRED);
  });

  it('denies when a bound market maker mismatches', () => {
    const { capability } = buildCapability({ marketMakerId: 'hrkey-v1' });
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      marketMakerId: 'other-maker',
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.MARKET_MAKER_MISMATCH);
  });

  it('denies malformed timestamps fail-closed', () => {
    const { capability } = buildCapability({ expires_at: 'not-a-time' });
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.CAPABILITY_INVALID);
  });

  it('denies when usage or policy hooks deny', () => {
    const { capability } = buildCapability();
    const usageDecision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z',
      hooks: {
        usage: () => ({
          allowed: false,
          reasonCode: capabilityAccessReasonCodes.USAGE_DENIED,
          reason: 'Usage quota exceeded.'
        })
      }
    });
    expect(usageDecision.reasonCode).toBe(capabilityAccessReasonCodes.USAGE_DENIED);

    const policyDecision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z',
      hooks: {
        policy: () => ({
          allowed: false,
          reasonCode: capabilityAccessReasonCodes.POLICY_DENIED,
          reason: 'Policy denied the request.'
        })
      }
    });
    expect(policyDecision.reasonCode).toBe(capabilityAccessReasonCodes.POLICY_DENIED);
  });

  it('classifies structured integrity failures without relying on message fragments', () => {
    expect(
      evaluateCapabilityAccess({
        capability: undefined,
        action: 'read',
        resource: `content:${CONTENT_REF}`,
        now: '2025-08-01T00:00:00Z'
      }).reasonCode
    ).toBe(capabilityAccessReasonCodes.CAPABILITY_MISSING);

    expect(
      evaluateCapabilityAccess({
        capability: buildCapability({ permissions: [] }).capability,
        action: 'read',
        resource: `content:${CONTENT_REF}`,
        now: '2025-08-01T00:00:00Z'
      }).reasonCode
    ).toBe(capabilityAccessReasonCodes.CAPABILITY_INVALID);

    expect(
      evaluateCapabilityAccess({
        capability: buildCapability().capability,
        action: '',
        resource: `content:${CONTENT_REF}`,
        now: '2025-08-01T00:00:00Z'
      }).reasonCode
    ).toBe(capabilityAccessReasonCodes.ACTION_MISSING);

    expect(
      evaluateCapabilityAccess({
        capability: buildCapability().capability,
        action: 'read',
        resource: 'bad-resource',
        now: '2025-08-01T00:00:00Z'
      }).reasonCode
    ).toBe(capabilityAccessReasonCodes.RESOURCE_MISSING);

    expect(
      evaluateCapabilityAccess({
        capability: buildCapability().capability,
        consent: { ...buildConsent(), subject: 'not-a-did' } as any,
        action: 'read',
        resource: `content:${CONTENT_REF}`,
        now: '2025-08-01T00:00:00Z'
      }).reasonCode
    ).toBe(capabilityAccessReasonCodes.CONSENT_INVALID);
  });

  it('fails closed with usage-stage INTERNAL_EVALUATION_ERROR when the usage hook throws', () => {
    const { capability } = buildCapability();
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z',
      hooks: {
        usage: () => {
          throw new Error('usage boom');
        }
      }
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.INTERNAL_EVALUATION_ERROR);
    expect(decision.metadata.failureStage).toBe('usage');
  });

  it('fails closed with policy-stage INTERNAL_EVALUATION_ERROR when the policy hook throws', () => {
    const { capability } = buildCapability();
    const decision = evaluateCapabilityAccess({
      capability,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z',
      hooks: {
        policy: () => {
          throw new Error('policy boom');
        }
      }
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.INTERNAL_EVALUATION_ERROR);
    expect(decision.metadata.failureStage).toBe('policy');
  });

  it('denies when supplied consent mismatches capability provenance', () => {
    const { capability } = buildCapability();
    const otherConsent = buildConsentObject(
      SUBJECT,
      GRANTEE,
      'grant',
      [{ type: 'content', ref: CONTENT_REF }],
      ['read'],
      { now: new Date('2025-02-01T00:00:00Z'), expires_at: CONSENT_EXPIRES }
    );

    const decision = evaluateCapabilityAccess({
      capability,
      consent: otherConsent,
      action: 'read',
      resource: `content:${CONTENT_REF}`,
      now: '2025-08-01T00:00:00Z'
    });

    expect(decision.reasonCode).toBe(capabilityAccessReasonCodes.CONSENT_MISMATCH);
  });
});
