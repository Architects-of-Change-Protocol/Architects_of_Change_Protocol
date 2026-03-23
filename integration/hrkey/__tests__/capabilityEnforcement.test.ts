import { buildConsentObject } from '../../../consent';
import { mintCapabilityToken } from '../../../capability';
import { evaluateCapabilityAccess } from '../../../enforcement';

const SUBJECT = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
const EMPLOYER = 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH';
const CONTENT_REF = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function buildHrKeyCapability() {
  const consent = buildConsentObject(
    SUBJECT,
    EMPLOYER,
    'grant',
    [{ type: 'content', ref: CONTENT_REF }],
    ['read'],
    { now: new Date('2025-01-15T14:30:00Z'), expires_at: '2026-01-15T14:30:00Z' }
  );

  const capability = {
    ...mintCapabilityToken(
      consent,
      [{ type: 'content', ref: CONTENT_REF }],
      ['read'],
      '2025-12-31T23:59:59Z',
      { now: new Date('2025-06-15T10:00:00Z') }
    ),
    marketMakerId: 'hrkey-v1'
  };

  return { consent, capability };
}

describe('HRKey capability enforcement integration', () => {
  it('evaluates a market-maker-bound access request at the service boundary', () => {
    const { consent, capability } = buildHrKeyCapability();

    const decision = evaluateCapabilityAccess({
      capability,
      consent,
      action: 'read',
      resource: { type: 'content', ref: CONTENT_REF },
      marketMakerId: 'hrkey-v1',
      now: '2025-08-01T00:00:00Z',
      metadata: {
        endpoint: 'hrkey.capability.redeem'
      }
    });

    expect(decision).toMatchObject({
      allowed: true,
      decision: 'allow',
      reasonCode: 'ACCESS_ALLOWED',
      checks: {
        integrity: 'pass',
        temporal: 'pass',
        action: 'pass',
        resource: 'pass',
        marketMaker: 'pass'
      }
    });
    expect(decision.metadata.boundMarketMakerId).toBe('hrkey-v1');
  });
});
