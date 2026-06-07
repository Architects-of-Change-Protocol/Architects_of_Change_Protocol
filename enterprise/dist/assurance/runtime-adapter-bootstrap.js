"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnterpriseAssuranceRuntimeProfile = exports.AssuranceRuntimeAdapterTokens = exports.resolveVerificationRuntimeAdapters = exports.resolveTrustRuntimeAdapters = exports.resolveEventSinkRuntimeAdapters = exports.resolveAssuranceRuntimeAdapters = exports.bootstrapEnterpriseAssuranceRuntime = exports.EnterpriseAssuranceRuntimeCompositionRoot = exports.bootstrapEnterpriseRuntimeAdapters = exports.createEnterpriseRuntimeAdapterBootstrap = void 0;
const runtime_registry_1 = require("@aoc/protocol/runtime-registry");
const observability_1 = require("./observability");
const trust_1 = require("./trust");
const runtime_adapter_resolver_1 = require("./runtime-adapter-resolver");
const runtime_profile_1 = require("./runtime-profile");
const registration = (token, adapter, source, version) => adapter === undefined ? undefined : { token, adapter, metadata: { source, version } };
const present = (value) => value !== undefined;
const createEnterpriseRuntimeAdapterRegistrations = (options = {}) => {
    const source = options.source ?? '@aoc/enterprise/assurance';
    const version = options.version ?? '0.1.0';
    const eventSink = new observability_1.InMemoryAssuranceEventSink();
    const trustRegistry = new trust_1.InMemoryCanonicalTrustRegistry();
    const adapters = {
        auditEventSink: eventSink,
        observabilityEventSink: eventSink,
        registryLookup: trustRegistry,
        trustRegistryProvider: trustRegistry,
        securityEventSink: eventSink,
        protocolEventSink: eventSink,
        ...options.adapters,
    };
    const registrations = [
        registration(runtime_registry_1.AdapterTokens.VerificationProvider, adapters.verificationProvider, source, version),
        registration(runtime_registry_1.AdapterTokens.VerificationKeyResolver, adapters.verificationKeyResolver, source, version),
        registration(runtime_registry_1.AdapterTokens.PolicyDecisionProvider, adapters.policyDecisionProvider, source, version),
        registration(runtime_registry_1.AdapterTokens.ExecutionAuthorizationProvider, adapters.executionAuthorizationProvider, source, version),
        registration(runtime_registry_1.AdapterTokens.AuditEventSink, adapters.auditEventSink, source, version),
        registration(runtime_registry_1.AdapterTokens.ObservabilityEventSink, adapters.observabilityEventSink, source, version),
        registration(runtime_registry_1.AdapterTokens.GovernanceDecisionProvider, adapters.governanceDecisionProvider, source, version),
        registration(runtime_registry_1.AdapterTokens.RevocationLookup, adapters.revocationLookup, source, version),
        registration(runtime_registry_1.AdapterTokens.RegistryLookup, adapters.registryLookup, source, version),
        registration(runtime_registry_1.AdapterTokens.TrustRegistryProvider, adapters.trustRegistryProvider, source, version),
        registration(runtime_registry_1.AdapterTokens.CapabilityLookup, adapters.capabilityLookup, source, version),
        registration(runtime_registry_1.AdapterTokens.AttestationLookup, adapters.attestationLookup, source, version),
        registration(runtime_registry_1.AdapterTokens.CredentialStatusLookup, adapters.credentialStatusLookup, source, version),
        registration(runtime_registry_1.AdapterTokens.SecurityEventSink, adapters.securityEventSink, source, version),
        registration(runtime_registry_1.AdapterTokens.ProtocolEventSink, adapters.protocolEventSink, source, version),
    ].filter(present);
    return registrations;
};
const createEnterpriseRuntimeAdapterBootstrap = (registry, options = {}) => {
    const registrations = createEnterpriseRuntimeAdapterRegistrations(options);
    return new runtime_registry_1.RuntimeAdapterBootstrap(registry, registrations, options.required ?? registrations.map(({ token }) => token), options.logger);
};
exports.createEnterpriseRuntimeAdapterBootstrap = createEnterpriseRuntimeAdapterBootstrap;
const bootstrapEnterpriseRuntimeAdapters = (registry, options = {}) => (0, exports.createEnterpriseRuntimeAdapterBootstrap)(registry, options).bootstrap();
exports.bootstrapEnterpriseRuntimeAdapters = bootstrapEnterpriseRuntimeAdapters;
/** Enterprise-owned composition root: constructs defaults/overrides and resolves typed dependencies. */
class EnterpriseAssuranceRuntimeCompositionRoot {
    constructor() {
        this.profile = runtime_profile_1.EnterpriseAssuranceRuntimeProfile;
    }
    compose(options = {}) {
        const registry = options.registry ?? new runtime_registry_1.AdapterRegistry(options.logger);
        const bootstrapResult = new runtime_registry_1.RuntimeBootstrapEngine().bootstrap({
            profile: this.profile,
            registry,
            registrations: createEnterpriseRuntimeAdapterRegistrations(options),
            logger: options.logger,
        });
        const resolvedContext = (0, runtime_adapter_resolver_1.resolveAssuranceRuntimeAdapters)(registry);
        return Object.freeze({
            ...bootstrapResult,
            resolvedContext,
            adapters: resolvedContext,
        });
    }
}
exports.EnterpriseAssuranceRuntimeCompositionRoot = EnterpriseAssuranceRuntimeCompositionRoot;
/** Bootstrap the complete assurance profile and resolve its dependencies at the composition boundary. */
const bootstrapEnterpriseAssuranceRuntime = (registry, options = {}) => new EnterpriseAssuranceRuntimeCompositionRoot().compose({
    ...options,
    registry,
});
exports.bootstrapEnterpriseAssuranceRuntime = bootstrapEnterpriseAssuranceRuntime;
var runtime_adapter_resolver_2 = require("./runtime-adapter-resolver");
Object.defineProperty(exports, "resolveAssuranceRuntimeAdapters", { enumerable: true, get: function () { return runtime_adapter_resolver_2.resolveAssuranceRuntimeAdapters; } });
Object.defineProperty(exports, "resolveEventSinkRuntimeAdapters", { enumerable: true, get: function () { return runtime_adapter_resolver_2.resolveEventSinkRuntimeAdapters; } });
Object.defineProperty(exports, "resolveTrustRuntimeAdapters", { enumerable: true, get: function () { return runtime_adapter_resolver_2.resolveTrustRuntimeAdapters; } });
Object.defineProperty(exports, "resolveVerificationRuntimeAdapters", { enumerable: true, get: function () { return runtime_adapter_resolver_2.resolveVerificationRuntimeAdapters; } });
var runtime_profile_2 = require("./runtime-profile");
Object.defineProperty(exports, "AssuranceRuntimeAdapterTokens", { enumerable: true, get: function () { return runtime_profile_2.AssuranceRuntimeAdapterTokens; } });
Object.defineProperty(exports, "EnterpriseAssuranceRuntimeProfile", { enumerable: true, get: function () { return runtime_profile_2.EnterpriseAssuranceRuntimeProfile; } });
