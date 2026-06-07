import type {
  ProtocolEvent,
  SecurityEvent,
  VerificationProvider,
} from '@aoc/protocol/adapters';
import type { CanonicalClaim, CanonicalRegistryEntry, CanonicalRegistryRef } from '@aoc/protocol/claims';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
import {
  AdapterNotRegisteredError,
  AdapterRegistry,
  AdapterTokens,
  RegistryValidationError,
} from '@aoc/protocol/runtime-registry';
import {
  bootstrapEnterpriseAssuranceRuntime,
  createEnterpriseRuntimeAdapterBootstrap,
  resolveAssuranceRuntimeAdapters,
  resolveEventSinkRuntimeAdapters,
  resolveTrustRuntimeAdapters,
  resolveVerificationRuntimeAdapters,
} from '../../enterprise/src/assurance/runtime-adapter-bootstrap';
import { InMemoryAssuranceEventSink } from '../../enterprise/src/assurance/observability';
import { InMemoryCanonicalTrustRegistry } from '../../enterprise/src/assurance/trust';
import {
  EnterpriseVerificationProvider,
  InMemoryVerificationKeyResolver,
} from '../../enterprise/src/assurance/verification';

const claim = {
  id: 'claim:migration',
  type: 'Identity',
  subject: 'subject:1',
  issuer: 'issuer:1',
  assertionRef: 'assertion:1',
  evidenceRefs: [],
  attestationRefs: [],
  issuedAt: '2026-01-01T00:00:00.000Z',
} as CanonicalClaim;

const createVerificationAdapters = (verifier = 'migration-test') => {
  const verificationKeyResolver = new InMemoryVerificationKeyResolver();
  verificationKeyResolver.register({ keyId: 'key:1', issuer: 'issuer:1', algorithm: 'ed25519' });
  const verificationProvider = new EnterpriseVerificationProvider(
    verificationKeyResolver,
    { verify: (_claim, key) => key !== undefined },
    verifier,
  );
  return { verificationKeyResolver, verificationProvider };
};

describe('PR-08 runtime adapter migration', () => {
  it('bootstraps and resolves the complete assurance adapter profile once at composition', () => {
    const registry = new AdapterRegistry();
    const verification = createVerificationAdapters();
    const runtime = bootstrapEnterpriseAssuranceRuntime(registry, { adapters: verification });

    expect(runtime.registry).toBe(registry);
    expect(runtime.startupReport.validation.valid).toBe(true);
    expect(runtime.adapters.verificationProvider).toBe(verification.verificationProvider);
    expect(runtime.adapters.verificationKeyResolver).toBe(verification.verificationKeyResolver);
    expect(runtime.adapters.registryLookup).toBe(runtime.adapters.trustRegistryProvider);
    expect(runtime.adapters.auditEventSink).toBe(runtime.adapters.securityEventSink);
    expect(runtime.adapters.auditEventSink).toBe(runtime.adapters.protocolEventSink);
    expect(runtime.adapters.auditEventSink).toBe(runtime.adapters.observabilityEventSink);
  });

  it('preserves verification output through registry-backed resolution', async () => {
    const verification = createVerificationAdapters();
    const registry = new AdapterRegistry();
    createEnterpriseRuntimeAdapterBootstrap(registry, {
      adapters: verification,
      required: [AdapterTokens.VerificationProvider, AdapterTokens.VerificationKeyResolver],
    }).bootstrap();
    const resolved = resolveVerificationRuntimeAdapters(registry);
    const context = { requestedAt: '2026-06-07T00:00:00.000Z' };

    await expect(resolved.verificationProvider.verifyClaim(claim, context))
      .resolves.toEqual(await verification.verificationProvider.verifyClaim(claim, context));
    expect(resolved.verificationKeyResolver).toBe(verification.verificationKeyResolver);
  });

  it('preserves trust registry store semantics through registry-backed resolution', () => {
    const registryRef = {
      id: 'registry:migration',
      type: 'CredentialRegistry',
      namespace: 'enterprise',
      authorityLevel: 'OrganizationDeclared',
    } as CanonicalRegistryRef;
    const entry = {
      id: 'entry:migration',
      registryRef,
      entryType: 'Credential',
      subject: 'subject:1',
      locator: 'credential:1',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
    } as CanonicalRegistryEntry;
    const implementation = new InMemoryCanonicalTrustRegistry();
    implementation.registerEntry(entry);
    const registry = new AdapterRegistry();
    createEnterpriseRuntimeAdapterBootstrap(registry, {
      adapters: { registryLookup: implementation, trustRegistryProvider: implementation },
      required: [AdapterTokens.RegistryLookup, AdapterTokens.TrustRegistryProvider],
    }).bootstrap();
    const resolved = resolveTrustRuntimeAdapters(registry);
    const request = { registryRef, subject: 'subject:1' };
    const context = { requestedAt: '2026-06-07T00:00:00.000Z' };

    expect(resolved.registryLookup.lookupRegistry(request, context))
      .toEqual(implementation.lookupRegistry(request, context));
    expect(resolved.trustRegistryProvider.getRegistry(registryRef)).toEqual(registryRef);
    expect(resolved.registryLookup).toBe(resolved.trustRegistryProvider);
  });

  it('preserves event values and ordering without duplication or mutation', () => {
    const direct = new InMemoryAssuranceEventSink();
    const registered = new InMemoryAssuranceEventSink();
    const registry = new AdapterRegistry();
    createEnterpriseRuntimeAdapterBootstrap(registry, {
      adapters: {
        auditEventSink: registered,
        securityEventSink: registered,
        protocolEventSink: registered,
        observabilityEventSink: registered,
      },
      required: [
        AdapterTokens.AuditEventSink,
        AdapterTokens.SecurityEventSink,
        AdapterTokens.ProtocolEventSink,
        AdapterTokens.ObservabilityEventSink,
      ],
    }).bootstrap();
    const resolved = resolveEventSinkRuntimeAdapters(registry);
    const audit: AuditEventEnvelope = {
      eventId: 'audit:migration',
      eventType: 'verification.completed',
      emittedAt: '2026-06-07T00:00:00.000Z',
      payload: { order: 1 },
    };
    const security: SecurityEvent = {
      eventId: 'security:migration',
      eventType: 'verification.key.checked',
      occurredAt: '2026-06-07T00:00:01.000Z',
      payload: { order: 2 },
    };
    const protocol: ProtocolEvent = {
      eventId: 'protocol:migration',
      eventType: 'claim.verified',
      emittedAt: '2026-06-07T00:00:02.000Z',
      payload: { order: 3 },
    };

    direct.recordAuditEvent(audit);
    direct.recordSecurityEvent(security);
    direct.emitProtocolEvent(protocol);
    resolved.auditEventSink.recordAuditEvent(audit);
    resolved.securityEventSink.recordSecurityEvent(security);
    resolved.protocolEventSink.emitProtocolEvent(protocol);
    (audit.payload as { order: number }).order = 99;

    expect(registered.listObservations()).toEqual(direct.listObservations());
    expect(registered.listObservations().map(({ eventId }) => eventId))
      .toEqual(['audit:migration', 'security:migration', 'protocol:migration']);
    expect(registered.listObservations()[0].payload).toEqual({ order: 1 });
  });

  it('fails closed when a required profile adapter is missing', () => {
    expect(() => bootstrapEnterpriseAssuranceRuntime(new AdapterRegistry()))
      .toThrow(RegistryValidationError);
    expect(() => resolveAssuranceRuntimeAdapters(new AdapterRegistry()))
      .toThrow(AdapterNotRegisteredError);
  });

  it('does not use hidden global registry state', () => {
    const firstVerification = createVerificationAdapters('first');
    const secondVerification = createVerificationAdapters('second');
    const first = bootstrapEnterpriseAssuranceRuntime(new AdapterRegistry(), { adapters: firstVerification });
    const second = bootstrapEnterpriseAssuranceRuntime(new AdapterRegistry(), { adapters: secondVerification });

    expect(first.registry).not.toBe(second.registry);
    expect(first.adapters.verificationProvider).toBe(firstVerification.verificationProvider);
    expect(second.adapters.verificationProvider).toBe(secondVerification.verificationProvider);
    expect(first.adapters.verificationProvider).not.toBe(second.adapters.verificationProvider);
  });
});
