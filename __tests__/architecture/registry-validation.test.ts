import {
  AdapterRegistry,
  AdapterRegistryEventType,
  AdapterTokens,
  type AdapterRegistryEvent,
} from '@aoc/protocol/runtime-registry';
import type { AuditEventSink } from '@aoc/protocol/adapters';

describe('adapter registry validation', () => {
  it('reports registered and missing required adapters without business-side effects', () => {
    const events: AdapterRegistryEvent[] = [];
    const registry = new AdapterRegistry({ log: (event) => events.push(event) });
    const sink: AuditEventSink = { recordAuditEvent: () => undefined };
    registry.register(AdapterTokens.AuditEventSink, sink, { source: 'test', version: '1.0.0' });

    const result = registry.validate([AdapterTokens.AuditEventSink, AdapterTokens.VerificationProvider]);

    expect(result.valid).toBe(false);
    expect(result.registered).toEqual([AdapterTokens.AuditEventSink]);
    expect(result.missing).toEqual([AdapterTokens.VerificationProvider]);
    expect(result.durationMs).toBeLessThan(100);
    expect(events.map(({ type }) => type)).toEqual([
      AdapterRegistryEventType.AdapterRegistered,
      AdapterRegistryEventType.AdapterValidation,
      AdapterRegistryEventType.AdapterMissing,
    ]);
  });

  it('passes startup validation when every required token is registered', () => {
    const registry = new AdapterRegistry();
    registry.register(
      AdapterTokens.AuditEventSink,
      { recordAuditEvent: () => undefined },
      { source: 'test', version: '1.0.0' },
    );

    expect(registry.validate([AdapterTokens.AuditEventSink])).toMatchObject({ valid: true, missing: [] });
  });
});
