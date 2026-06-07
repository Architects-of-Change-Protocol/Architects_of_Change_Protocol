import type {
  AttestationLookup,
  AuditEventSink,
  CapabilityLookup,
  CredentialStatusLookup,
  ExecutionAuthorizationProvider,
  GovernanceDecisionProvider,
  ObservabilityEventSink,
  PolicyDecisionProvider,
  ProtocolEventSink,
  RegistryLookup,
  RevocationLookup,
  SecurityEventSink,
  TrustRegistryProvider,
  VerificationKeyResolver,
  VerificationProvider,
} from '@aoc/protocol/adapters';
import {
  AdapterRegistry,
  AdapterTokens,
  RuntimeAdapterBootstrap,
  type AdapterRegistration,
  type AdapterRegistryLogger,
  type AdapterToken,
  type RuntimeAdapterStartupReport,
} from '@aoc/protocol/runtime-registry';
import { InMemoryAssuranceEventSink } from './observability';
import { InMemoryCanonicalTrustRegistry } from './trust';
import {
  AssuranceRuntimeAdapterTokens,
  resolveAssuranceRuntimeAdapters,
  type AssuranceRuntimeAdapters,
} from './runtime-adapter-resolver';

export interface EnterpriseRuntimeAdapters {
  readonly verificationProvider?: VerificationProvider;
  readonly verificationKeyResolver?: VerificationKeyResolver;
  readonly policyDecisionProvider?: PolicyDecisionProvider;
  readonly executionAuthorizationProvider?: ExecutionAuthorizationProvider;
  readonly auditEventSink?: AuditEventSink;
  readonly observabilityEventSink?: ObservabilityEventSink;
  readonly governanceDecisionProvider?: GovernanceDecisionProvider;
  readonly revocationLookup?: RevocationLookup;
  readonly registryLookup?: RegistryLookup;
  readonly trustRegistryProvider?: TrustRegistryProvider;
  readonly capabilityLookup?: CapabilityLookup;
  readonly attestationLookup?: AttestationLookup;
  readonly credentialStatusLookup?: CredentialStatusLookup;
  readonly securityEventSink?: SecurityEventSink;
  readonly protocolEventSink?: ProtocolEventSink;
}

export interface EnterpriseRuntimeAdapterBootstrapOptions {
  readonly adapters?: EnterpriseRuntimeAdapters;
  readonly required?: readonly AdapterToken[];
  readonly source?: string;
  readonly version?: string;
  readonly logger?: AdapterRegistryLogger;
}

const registration = <TAdapter>(
  token: AdapterToken<TAdapter>,
  adapter: TAdapter | undefined,
  source: string,
  version: string,
): AdapterRegistration<TAdapter> | undefined =>
  adapter === undefined ? undefined : { token, adapter, metadata: { source, version } };

const present = <T>(value: T | undefined): value is T => value !== undefined;

export const createEnterpriseRuntimeAdapterBootstrap = (
  registry: AdapterRegistry,
  options: EnterpriseRuntimeAdapterBootstrapOptions = {},
): RuntimeAdapterBootstrap => {
  const source = options.source ?? '@aoc/enterprise/assurance';
  const version = options.version ?? '0.1.0';
  const eventSink = new InMemoryAssuranceEventSink();
  const trustRegistry = new InMemoryCanonicalTrustRegistry();
  const adapters: EnterpriseRuntimeAdapters = {
    auditEventSink: eventSink,
    observabilityEventSink: eventSink,
    registryLookup: trustRegistry,
    trustRegistryProvider: trustRegistry,
    securityEventSink: eventSink,
    protocolEventSink: eventSink,
    ...options.adapters,
  };

  const registrations = [
    registration(AdapterTokens.VerificationProvider, adapters.verificationProvider, source, version),
    registration(AdapterTokens.VerificationKeyResolver, adapters.verificationKeyResolver, source, version),
    registration(AdapterTokens.PolicyDecisionProvider, adapters.policyDecisionProvider, source, version),
    registration(AdapterTokens.ExecutionAuthorizationProvider, adapters.executionAuthorizationProvider, source, version),
    registration(AdapterTokens.AuditEventSink, adapters.auditEventSink, source, version),
    registration(AdapterTokens.ObservabilityEventSink, adapters.observabilityEventSink, source, version),
    registration(AdapterTokens.GovernanceDecisionProvider, adapters.governanceDecisionProvider, source, version),
    registration(AdapterTokens.RevocationLookup, adapters.revocationLookup, source, version),
    registration(AdapterTokens.RegistryLookup, adapters.registryLookup, source, version),
    registration(AdapterTokens.TrustRegistryProvider, adapters.trustRegistryProvider, source, version),
    registration(AdapterTokens.CapabilityLookup, adapters.capabilityLookup, source, version),
    registration(AdapterTokens.AttestationLookup, adapters.attestationLookup, source, version),
    registration(AdapterTokens.CredentialStatusLookup, adapters.credentialStatusLookup, source, version),
    registration(AdapterTokens.SecurityEventSink, adapters.securityEventSink, source, version),
    registration(AdapterTokens.ProtocolEventSink, adapters.protocolEventSink, source, version),
  ].filter(present) as AdapterRegistration[];

  return new RuntimeAdapterBootstrap(
    registry,
    registrations,
    options.required ?? registrations.map(({ token }) => token),
    options.logger,
  );
};

export const bootstrapEnterpriseRuntimeAdapters = (
  registry: AdapterRegistry,
  options: EnterpriseRuntimeAdapterBootstrapOptions = {},
): RuntimeAdapterStartupReport => createEnterpriseRuntimeAdapterBootstrap(registry, options).bootstrap();

export interface EnterpriseAssuranceRuntime {
  readonly registry: AdapterRegistry;
  readonly adapters: AssuranceRuntimeAdapters;
  readonly startupReport: RuntimeAdapterStartupReport;
}

/** Bootstrap the complete assurance profile and resolve its dependencies at the composition boundary. */
export const bootstrapEnterpriseAssuranceRuntime = (
  registry: AdapterRegistry,
  options: Omit<EnterpriseRuntimeAdapterBootstrapOptions, 'required'> = {},
): EnterpriseAssuranceRuntime => {
  const startupReport = bootstrapEnterpriseRuntimeAdapters(registry, {
    ...options,
    required: AssuranceRuntimeAdapterTokens,
  });

  return {
    registry,
    adapters: resolveAssuranceRuntimeAdapters(registry),
    startupReport,
  };
};

export {
  AssuranceRuntimeAdapterTokens,
  resolveAssuranceRuntimeAdapters,
  resolveEventSinkRuntimeAdapters,
  resolveTrustRuntimeAdapters,
  resolveVerificationRuntimeAdapters,
  type AssuranceRuntimeAdapters,
  type EventSinkRuntimeAdapters,
  type TrustRuntimeAdapters,
  type VerificationRuntimeAdapters,
} from './runtime-adapter-resolver';
