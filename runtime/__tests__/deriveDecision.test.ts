import { readFileSync } from 'fs';
import { join } from 'path';
import { deriveDecision } from '../api/routes';

describe('deriveDecision hardening', () => {
  it('handles /data/access allowed and denied decisions', () => {
    const allowed = deriveDecision('/data/access', { allowed: true, reason_code: 'ACCESS_ALLOWED' });
    const denied = deriveDecision('/data/access', { allowed: false, reason_code: 'ACCESS_DENIED_CONSENT_REQUIRED' });

    expect(allowed).toEqual({ decision: 'allow', reasonCode: 'ACCESS_ALLOWED' });
    expect(denied).toEqual({ decision: 'deny', reasonCode: 'ACCESS_DENIED_CONSENT_REQUIRED' });
  });

  it('handles /audit/events explicitly', () => {
    const decision = deriveDecision('/audit/events', { events: [] });

    expect(decision).toEqual({ decision: 'allow', reasonCode: 'AUDIT_EVENTS_LISTED' });
  });

  it('denies unknown endpoints defensively', () => {
    const decision = deriveDecision('/unknown/endpoint' as never, {});

    expect(decision).toEqual({ decision: 'deny', reasonCode: 'UNKNOWN_ENDPOINT' });
  });

  it('does not contain duplicate reasonCode keys in return object literals', () => {
    const routesSource = readFileSync(join(__dirname, '..', 'api', 'routes.ts'), 'utf8');
    const returnObjects = routesSource.match(/return\s*\{[\s\S]*?\};/g) ?? [];

    for (const objectLiteral of returnObjects) {
      expect(objectLiteral.match(/reasonCode:/g)?.length ?? 0).toBeLessThanOrEqual(1);
    }
  });
});
