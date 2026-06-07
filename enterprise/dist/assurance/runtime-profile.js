"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssuranceRuntimeAdapterTokens = exports.EnterpriseAssuranceRuntimeProfile = void 0;
const runtime_registry_1 = require("@aoc/protocol/runtime-registry");
/** Canonical declaration for the complete Enterprise Assurance runtime. */
exports.EnterpriseAssuranceRuntimeProfile = Object.freeze({
    id: 'enterprise.assurance',
    name: 'Enterprise Assurance Runtime',
    description: 'Verification, trust-registry, audit, security, protocol, and observability assurance adapters.',
    requiredTokens: Object.freeze([
        runtime_registry_1.AdapterTokens.VerificationProvider,
        runtime_registry_1.AdapterTokens.VerificationKeyResolver,
        runtime_registry_1.AdapterTokens.RegistryLookup,
        runtime_registry_1.AdapterTokens.TrustRegistryProvider,
        runtime_registry_1.AdapterTokens.AuditEventSink,
        runtime_registry_1.AdapterTokens.SecurityEventSink,
        runtime_registry_1.AdapterTokens.ProtocolEventSink,
        runtime_registry_1.AdapterTokens.ObservabilityEventSink,
    ]),
    optionalTokens: Object.freeze([
        runtime_registry_1.AdapterTokens.PolicyDecisionProvider,
        runtime_registry_1.AdapterTokens.ExecutionAuthorizationProvider,
        runtime_registry_1.AdapterTokens.GovernanceDecisionProvider,
        runtime_registry_1.AdapterTokens.RevocationLookup,
        runtime_registry_1.AdapterTokens.CapabilityLookup,
        runtime_registry_1.AdapterTokens.AttestationLookup,
        runtime_registry_1.AdapterTokens.CredentialStatusLookup,
    ]),
    allowDefaults: true,
    validationMode: runtime_registry_1.RuntimeProfileValidationMode.Profile,
});
/** @deprecated Use EnterpriseAssuranceRuntimeProfile.requiredTokens. */
exports.AssuranceRuntimeAdapterTokens = exports.EnterpriseAssuranceRuntimeProfile.requiredTokens;
