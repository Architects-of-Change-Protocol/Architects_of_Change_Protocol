import type { AuditEventSink, ObservabilityEventSink, ProtocolEventSink, RegistryLookup, SecurityEventSink, TrustRegistryProvider, VerificationKeyResolver, VerificationProvider } from '@aoc/protocol/adapters';
import { AdapterRegistry } from '@aoc/protocol/runtime-registry';
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
export type AssuranceRuntimeAdapters = VerificationRuntimeAdapters & TrustRuntimeAdapters & EventSinkRuntimeAdapters;
export declare const resolveVerificationRuntimeAdapters: (registry: AdapterRegistry) => VerificationRuntimeAdapters;
export declare const resolveTrustRuntimeAdapters: (registry: AdapterRegistry) => TrustRuntimeAdapters;
export declare const resolveEventSinkRuntimeAdapters: (registry: AdapterRegistry) => EventSinkRuntimeAdapters;
/** Resolve once at the Enterprise composition boundary, then inject these typed dependencies. */
export declare const resolveAssuranceRuntimeAdapters: (registry: AdapterRegistry) => AssuranceRuntimeAdapters;
//# sourceMappingURL=runtime-adapter-resolver.d.ts.map