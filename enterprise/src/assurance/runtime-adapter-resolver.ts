import type {
  AuditEventSink,
  ObservabilityEventSink,
  ProtocolEventSink,
  RegistryLookup,
  SecurityEventSink,
  TrustRegistryProvider,
  VerificationKeyResolver,
  VerificationProvider,
} from '@aoc/protocol/adapters';
import {
  AdapterRegistry,
  AdapterTokens,
  type AdapterToken,
} from '@aoc/protocol/runtime-registry';

export interface VerificationRuntimeAdapters {
  readonly verificationProvider: VerificationProvider;
  readonly verificationKeyResolver: VerificationKeyResolver;
}

export interface TrustRuntimeAdapters {
  readonly registryLookup: RegistryLookup;
  readonly trustRegistryProvider: TrustRegistryProvider;
}

export interface EventSinkRuntimeAdapters {
  readonly auditEventSink: AuditEventSink;
  readonly securityEventSink: SecurityEventSink;
  readonly protocolEventSink: ProtocolEventSink;
  readonly observabilityEventSink: ObservabilityEventSink;
}

export type AssuranceRuntimeAdapters = VerificationRuntimeAdapters &
  TrustRuntimeAdapters &
  EventSinkRuntimeAdapters;

export const AssuranceRuntimeAdapterTokens: readonly AdapterToken[] = Object.freeze([
  AdapterTokens.VerificationProvider,
  AdapterTokens.VerificationKeyResolver,
  AdapterTokens.RegistryLookup,
  AdapterTokens.TrustRegistryProvider,
  AdapterTokens.AuditEventSink,
  AdapterTokens.SecurityEventSink,
  AdapterTokens.ProtocolEventSink,
  AdapterTokens.ObservabilityEventSink,
]);

export const resolveVerificationRuntimeAdapters = (
  registry: AdapterRegistry,
): VerificationRuntimeAdapters => ({
  verificationProvider: registry.resolve(AdapterTokens.VerificationProvider),
  verificationKeyResolver: registry.resolve(AdapterTokens.VerificationKeyResolver),
});

export const resolveTrustRuntimeAdapters = (
  registry: AdapterRegistry,
): TrustRuntimeAdapters => ({
  registryLookup: registry.resolve(AdapterTokens.RegistryLookup),
  trustRegistryProvider: registry.resolve(AdapterTokens.TrustRegistryProvider),
});

export const resolveEventSinkRuntimeAdapters = (
  registry: AdapterRegistry,
): EventSinkRuntimeAdapters => ({
  auditEventSink: registry.resolve(AdapterTokens.AuditEventSink),
  securityEventSink: registry.resolve(AdapterTokens.SecurityEventSink),
  protocolEventSink: registry.resolve(AdapterTokens.ProtocolEventSink),
  observabilityEventSink: registry.resolve(AdapterTokens.ObservabilityEventSink),
});

/** Resolve once at the Enterprise composition boundary, then inject these typed dependencies. */
export const resolveAssuranceRuntimeAdapters = (
  registry: AdapterRegistry,
): AssuranceRuntimeAdapters => ({
  ...resolveVerificationRuntimeAdapters(registry),
  ...resolveTrustRuntimeAdapters(registry),
  ...resolveEventSinkRuntimeAdapters(registry),
});
