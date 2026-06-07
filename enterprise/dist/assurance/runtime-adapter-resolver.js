"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAssuranceRuntimeAdapters = exports.resolveEventSinkRuntimeAdapters = exports.resolveTrustRuntimeAdapters = exports.resolveVerificationRuntimeAdapters = void 0;
const runtime_registry_1 = require("@aoc/protocol/runtime-registry");
const resolveVerificationRuntimeAdapters = (registry) => ({
    verificationProvider: registry.resolve(runtime_registry_1.AdapterTokens.VerificationProvider),
    verificationKeyResolver: registry.resolve(runtime_registry_1.AdapterTokens.VerificationKeyResolver),
});
exports.resolveVerificationRuntimeAdapters = resolveVerificationRuntimeAdapters;
const resolveTrustRuntimeAdapters = (registry) => ({
    registryLookup: registry.resolve(runtime_registry_1.AdapterTokens.RegistryLookup),
    trustRegistryProvider: registry.resolve(runtime_registry_1.AdapterTokens.TrustRegistryProvider),
});
exports.resolveTrustRuntimeAdapters = resolveTrustRuntimeAdapters;
const resolveEventSinkRuntimeAdapters = (registry) => ({
    auditEventSink: registry.resolve(runtime_registry_1.AdapterTokens.AuditEventSink),
    securityEventSink: registry.resolve(runtime_registry_1.AdapterTokens.SecurityEventSink),
    protocolEventSink: registry.resolve(runtime_registry_1.AdapterTokens.ProtocolEventSink),
    observabilityEventSink: registry.resolve(runtime_registry_1.AdapterTokens.ObservabilityEventSink),
});
exports.resolveEventSinkRuntimeAdapters = resolveEventSinkRuntimeAdapters;
/** Resolve once at the Enterprise composition boundary, then inject these typed dependencies. */
const resolveAssuranceRuntimeAdapters = (registry) => ({
    ...(0, exports.resolveVerificationRuntimeAdapters)(registry),
    ...(0, exports.resolveTrustRuntimeAdapters)(registry),
    ...(0, exports.resolveEventSinkRuntimeAdapters)(registry),
});
exports.resolveAssuranceRuntimeAdapters = resolveAssuranceRuntimeAdapters;
