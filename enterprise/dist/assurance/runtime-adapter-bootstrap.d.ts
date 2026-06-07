import type { AttestationLookup, AuditEventSink, CapabilityLookup, CredentialStatusLookup, ExecutionAuthorizationProvider, GovernanceDecisionProvider, ObservabilityEventSink, PolicyDecisionProvider, ProtocolEventSink, RegistryLookup, RevocationLookup, SecurityEventSink, TrustRegistryProvider, VerificationKeyResolver, VerificationProvider } from '@aoc/protocol/adapters';
import { AdapterRegistry, RuntimeAdapterBootstrap, type AdapterRegistryLogger, type AdapterToken, type RuntimeAdapterStartupReport, type RuntimeCompositionOptions, type RuntimeCompositionResult, type RuntimeCompositionRoot } from '@aoc/protocol/runtime-registry';
import { type AssuranceRuntimeAdapters } from './runtime-adapter-resolver';
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
export declare const createEnterpriseRuntimeAdapterBootstrap: (registry: AdapterRegistry, options?: EnterpriseRuntimeAdapterBootstrapOptions) => RuntimeAdapterBootstrap;
export declare const bootstrapEnterpriseRuntimeAdapters: (registry: AdapterRegistry, options?: EnterpriseRuntimeAdapterBootstrapOptions) => RuntimeAdapterStartupReport;
export interface EnterpriseAssuranceRuntime extends RuntimeCompositionResult<AssuranceRuntimeAdapters> {
    /** Backward-compatible alias for resolvedContext. */
    readonly adapters: AssuranceRuntimeAdapters;
}
export interface EnterpriseAssuranceCompositionOptions extends RuntimeCompositionOptions {
    readonly adapters?: EnterpriseRuntimeAdapters;
    readonly source?: string;
    readonly version?: string;
}
/** Enterprise-owned composition root: constructs defaults/overrides and resolves typed dependencies. */
export declare class EnterpriseAssuranceRuntimeCompositionRoot implements RuntimeCompositionRoot<EnterpriseAssuranceCompositionOptions, AssuranceRuntimeAdapters> {
    readonly profile: import("@aoc/protocol/runtime-registry").RuntimeProfile;
    compose(options?: EnterpriseAssuranceCompositionOptions): EnterpriseAssuranceRuntime;
}
/** Bootstrap the complete assurance profile and resolve its dependencies at the composition boundary. */
export declare const bootstrapEnterpriseAssuranceRuntime: (registry: AdapterRegistry, options?: Omit<EnterpriseRuntimeAdapterBootstrapOptions, "required">) => EnterpriseAssuranceRuntime;
export { resolveAssuranceRuntimeAdapters, resolveEventSinkRuntimeAdapters, resolveTrustRuntimeAdapters, resolveVerificationRuntimeAdapters, type AssuranceRuntimeAdapters, type EventSinkRuntimeAdapters, type TrustRuntimeAdapters, type VerificationRuntimeAdapters, } from './runtime-adapter-resolver';
export { AssuranceRuntimeAdapterTokens, EnterpriseAssuranceRuntimeProfile, } from './runtime-profile';
//# sourceMappingURL=runtime-adapter-bootstrap.d.ts.map