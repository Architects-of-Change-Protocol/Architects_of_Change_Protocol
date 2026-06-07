import {
  AdapterAlreadyRegisteredError,
  AdapterNotRegisteredError,
  AdapterRegistry,
  AdapterTokens,
  RegisteredAdapterStatus,
} from '@aoc/protocol/runtime-registry';
import type { AuditEventSink } from '@aoc/protocol/adapters';

const auditSink: AuditEventSink = { recordAuditEvent: () => undefined };
const metadata = { implementation: 'TestAuditSink', source: 'adapter-registry.test', version: '1.2.3' };

describe('AdapterRegistry', () => {
  it('registers, resolves, inventories, and removes typed adapters', () => {
    const registry = new AdapterRegistry();
    const registered = registry.register(AdapterTokens.AuditEventSink, auditSink, metadata);

    expect(registry.has(AdapterTokens.AuditEventSink)).toBe(true);
    expect(registry.resolve(AdapterTokens.AuditEventSink)).toBe(auditSink);
    expect(registered).toMatchObject({
      token: AdapterTokens.AuditEventSink,
      adapter: auditSink,
      implementation: 'TestAuditSink',
      source: metadata.source,
      version: metadata.version,
      status: RegisteredAdapterStatus.Registered,
    });
    expect(registry.list()).toEqual([registered]);
    expect(registry.remove(AdapterTokens.AuditEventSink)).toBe(true);
    expect(registry.has(AdapterTokens.AuditEventSink)).toBe(false);
  });

  it('rejects duplicate registrations and unresolved tokens', () => {
    const registry = new AdapterRegistry();
    registry.register(AdapterTokens.AuditEventSink, auditSink, metadata);

    expect(() => registry.register(AdapterTokens.AuditEventSink, auditSink, metadata)).toThrow(
      AdapterAlreadyRegisteredError,
    );
    expect(() => registry.resolve(AdapterTokens.VerificationProvider)).toThrow(AdapterNotRegisteredError);
  });

  it('resolves contract versions independently', () => {
    const registry = new AdapterRegistry();
    const versionTwoToken = { ...AdapterTokens.AuditEventSink, contractVersion: '2.0' };
    const versionTwoSink: AuditEventSink = { recordAuditEvent: () => undefined };
    registry.register(AdapterTokens.AuditEventSink, auditSink, metadata);
    registry.register(versionTwoToken, versionTwoSink, { ...metadata, version: '2.0.0' });

    expect(registry.resolve(AdapterTokens.AuditEventSink)).toBe(auditSink);
    expect(registry.resolve(versionTwoToken)).toBe(versionTwoSink);
  });

  it('uses stable, human-readable, serializable, versioned tokens', () => {
    expect(JSON.parse(JSON.stringify(AdapterTokens.ExecutionAuthorizationProvider))).toEqual({
      id: 'execution.authorization',
      displayName: 'ExecutionAuthorizationProvider',
      contractVersion: '1.0',
    });
    expect(Object.isFrozen(AdapterTokens.ExecutionAuthorizationProvider)).toBe(true);
  });

  it('resolves adapters with less than one millisecond average overhead', () => {
    const registry = new AdapterRegistry();
    registry.register(AdapterTokens.AuditEventSink, auditSink, metadata);
    const iterations = 10_000;
    const startedAt = process.hrtime.bigint();
    for (let index = 0; index < iterations; index += 1) registry.resolve(AdapterTokens.AuditEventSink);
    const averageMilliseconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000 / iterations;

    expect(averageMilliseconds).toBeLessThan(1);
  });
});
