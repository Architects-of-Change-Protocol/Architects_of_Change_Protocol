import { mintCapabilityToken } from '../../capability';
import { buildConsentObject } from '../../consent';
import { capabilityAccessReasonCodes } from '../../enforcement';
import { InMemoryConsentUsageRegistry } from '../../protocol/capabilities';
import { interpretWithCapability, runInterpreter } from '../aiInterpreter';

const NOW = '2025-06-15T10:00:00Z';
const EXPIRES_AT = '2025-06-15T10:05:00Z';
const CONTENT_REF = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function buildRequest(overrides: Partial<Parameters<typeof interpretWithCapability>[0]> = {}) {
  const consent = buildConsentObject(
    'did:aoc:subject123',
    'did:aoc:grantee456',
    'grant',
    [{ type: 'content', ref: CONTENT_REF }],
    ['read'],
    {
      now: new Date(NOW),
      expires_at: EXPIRES_AT
    }
  );

  const capability = mintCapabilityToken(
    consent,
    [{ type: 'content', ref: CONTENT_REF }],
    ['read'],
    EXPIRES_AT,
    { now: new Date(NOW) }
  );

  return {
    consent,
    capability,
    action: 'read',
    resource: `content:${CONTENT_REF}`,
    input: {
      query: 'Summarize the reference payload',
      context: {
        resources: {
          [`content:${CONTENT_REF}`]: {
            candidate: 'Taylor',
            role: 'Engineer',
            rating: 'strong'
          }
        }
      }
    },
    now: NOW,
    ...overrides
  };
}

describe('runInterpreter', () => {
  it('returns deterministic structure', () => {
    const data = { b: 2, a: 1 };
    expect(runInterpreter('Explain', data)).toBe(runInterpreter('Explain', data));
  });
});

describe('interpretWithCapability', () => {
  it('allows interpretation with valid capability', () => {
    const usageRegistry = new InMemoryConsentUsageRegistry();
    const response = interpretWithCapability(buildRequest(), {
      registries: { consentUsageRegistry: usageRegistry }
    });

    expect(response.allowed).toBe(true);
    expect(response.result?.metadata?.source).toBe('capability-context');
    expect(response.usage.usageCount).toBe(1);
  });

  it('denies when capability invalid', () => {
    const request = buildRequest();
    const response = interpretWithCapability({
      ...request,
      capability: {
        ...request.capability,
        permissions: []
      }
    });

    expect(response.allowed).toBe(false);
    expect(response.error?.code).toBe(capabilityAccessReasonCodes.CAPABILITY_INVALID);
  });

  it('denies when payment required but not paid', () => {
    const request = buildRequest({
      consent: buildConsentObject(
        'did:aoc:subject123',
        'did:aoc:grantee456',
        'grant',
        [{ type: 'content', ref: CONTENT_REF }],
        ['read'],
        {
          now: new Date(NOW),
          expires_at: EXPIRES_AT,
          pricing: { model: 'per_use', amount: 25, currency: 'USD' }
        }
      )
    });

    const capability = mintCapabilityToken(
      request.consent!,
      [{ type: 'content', ref: CONTENT_REF }],
      ['read'],
      EXPIRES_AT,
      { now: new Date(NOW) }
    );

    const response = interpretWithCapability({
      ...request,
      capability
    });

    expect(response.allowed).toBe(false);
    expect(response.error?.code).toBe(capabilityAccessReasonCodes.PAYMENT_REQUIRED);
    expect(response.payment).toEqual({ required: true, amount: 25, currency: 'USD' });
  });

  it('executes AI when paid', () => {
    const pricedConsent = buildConsentObject(
      'did:aoc:subject123',
      'did:aoc:grantee456',
      'grant',
      [{ type: 'content', ref: CONTENT_REF }],
      ['read'],
      {
        now: new Date(NOW),
        expires_at: EXPIRES_AT,
        pricing: { model: 'per_use', amount: 25, currency: 'USD' }
      }
    );
    const capability = mintCapabilityToken(
      pricedConsent,
      [{ type: 'content', ref: CONTENT_REF }],
      ['read'],
      EXPIRES_AT,
      { now: new Date(NOW) }
    );

    const response = interpretWithCapability(
      buildRequest({
        consent: pricedConsent,
        capability,
        paymentContext: { paid: true }
      }),
      { registries: { consentUsageRegistry: new InMemoryConsentUsageRegistry() } }
    );

    expect(response.allowed).toBe(true);
    expect(response.result?.interpretation).toContain('Deterministic interpretation');
    expect(response.payment).toEqual({ required: false, amount: 25, currency: 'USD' });
  });

  it('does not increment usage on denied access', () => {
    const usageRegistry = new InMemoryConsentUsageRegistry();
    const request = buildRequest();

    const response = interpretWithCapability(
      {
        ...request,
        capability: {
          ...request.capability,
          permissions: []
        }
      },
      { registries: { consentUsageRegistry: usageRegistry } }
    );

    expect(response.allowed).toBe(false);
    expect(usageRegistry.get(request.capability.consent_ref)).toBeUndefined();
  });

  it('increments usage on successful interpretation', () => {
    const usageRegistry = new InMemoryConsentUsageRegistry();
    const request = buildRequest();

    const response = interpretWithCapability(request, {
      registries: { consentUsageRegistry: usageRegistry }
    });

    expect(response.allowed).toBe(true);
    expect(usageRegistry.get(request.capability.consent_ref)?.usageCount).toBe(1);
  });

  it('returns deterministic structure', () => {
    const request = buildRequest();
    const usageRegistry = new InMemoryConsentUsageRegistry();

    const first = interpretWithCapability(request, {
      registries: { consentUsageRegistry: usageRegistry }
    });
    const second = interpretWithCapability(request, {
      registries: { consentUsageRegistry: new InMemoryConsentUsageRegistry() }
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(first.result?.interpretation).toBe(second.result?.interpretation);
  });

  it('supports HRKey reference payload metadata', () => {
    const response = interpretWithCapability(
      buildRequest({
        input: {
          query: 'Summarize the HRKey reference',
          context: {
            hrkeyReference: {
              [`content:${CONTENT_REF}`]: {
                referee: 'Jordan',
                relationship: 'Manager',
                recommendation: 'hire'
              }
            }
          }
        }
      }),
      { registries: { consentUsageRegistry: new InMemoryConsentUsageRegistry() } }
    );

    expect(response.allowed).toBe(true);
    expect(response.result?.metadata).toMatchObject({ source: 'hrkey-reference' });
  });
});
