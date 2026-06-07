import type { VerificationProvider } from '@aoc/protocol/adapters';
import {
  AdapterRegistry,
  AdapterRegistryEventType,
  AdapterTokens,
  RegistryValidationError,
  RuntimeAdapterBootstrap,
  RuntimeAdapterBootstrapStatus,
  type AdapterRegistryEvent,
} from '@aoc/protocol/runtime-registry';
import { createEnterpriseRuntimeAdapterBootstrap } from '../../enterprise/src/assurance/runtime-adapter-bootstrap';

const verificationProvider: VerificationProvider = {
  verifyClaim: async (claim) => ({
    id: `${claim.id}:verification`,
    claimRef: claim.id,
    status: 'Verified',
    verifier: 'runtime-adapter-bootstrap.test',
    verifiedAt: new Date(0).toISOString(),
    findings: [],
  }),
};

describe('RuntimeAdapterBootstrap', () => {
  it('registers Enterprise implementations, validates startup, and reports inventory', () => {
    const events: AdapterRegistryEvent[] = [];
    const registry = new AdapterRegistry({ log: (event) => events.push(event) });
    const bootstrap = createEnterpriseRuntimeAdapterBootstrap(registry, {
      adapters: { verificationProvider },
      required: [
        AdapterTokens.VerificationProvider,
        AdapterTokens.AuditEventSink,
        AdapterTokens.RegistryLookup,
        AdapterTokens.TrustRegistryProvider,
      ],
      logger: { log: (event) => events.push(event) },
    });

    const report = bootstrap.bootstrap();

    expect(report.status).toBe(RuntimeAdapterBootstrapStatus.Ready);
    expect(report.validation.valid).toBe(true);
    expect(report.durationMs).toBeLessThan(100);
    expect(registry.resolve(AdapterTokens.VerificationProvider)).toBe(verificationProvider);
    expect(report.inventory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ token: AdapterTokens.AuditEventSink, source: '@aoc/enterprise/assurance' }),
        expect.objectContaining({ token: AdapterTokens.RegistryLookup, source: '@aoc/enterprise/assurance' }),
      ]),
    );
    expect(events.some(({ type }) => type === AdapterRegistryEventType.RegistryReady)).toBe(true);
  });

  it('fails startup with a report when a required adapter is missing', () => {
    const bootstrap = new RuntimeAdapterBootstrap(
      new AdapterRegistry(),
      [],
      [AdapterTokens.ExecutionAuthorizationProvider],
    );

    expect(() => bootstrap.bootstrap()).toThrow(RegistryValidationError);
    try {
      bootstrap.bootstrap();
    } catch (error) {
      expect((error as RegistryValidationError).report).toMatchObject({
        status: RuntimeAdapterBootstrapStatus.Failed,
        validation: { valid: false, missing: [AdapterTokens.ExecutionAuthorizationProvider] },
      });
    }
  });
});
