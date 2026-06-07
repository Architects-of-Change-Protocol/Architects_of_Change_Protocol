"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllAdapterTokens = exports.AdapterTokens = exports.createAdapterToken = void 0;
const CONTRACT_VERSION = '1.0';
const createAdapterToken = (id, displayName) => Object.freeze({ id, displayName, contractVersion: CONTRACT_VERSION });
exports.createAdapterToken = createAdapterToken;
exports.AdapterTokens = Object.freeze({
    VerificationProvider: (0, exports.createAdapterToken)('verification.provider', 'VerificationProvider'),
    VerificationKeyResolver: (0, exports.createAdapterToken)('verification.key-resolver', 'VerificationKeyResolver'),
    PolicyDecisionProvider: (0, exports.createAdapterToken)('policy.provider', 'PolicyDecisionProvider'),
    ExecutionAuthorizationProvider: (0, exports.createAdapterToken)('execution.authorization', 'ExecutionAuthorizationProvider'),
    AuditEventSink: (0, exports.createAdapterToken)('audit.sink', 'AuditEventSink'),
    ObservabilityEventSink: (0, exports.createAdapterToken)('observability.sink', 'ObservabilityEventSink'),
    GovernanceDecisionProvider: (0, exports.createAdapterToken)('governance.provider', 'GovernanceDecisionProvider'),
    RevocationLookup: (0, exports.createAdapterToken)('revocation.lookup', 'RevocationLookup'),
    RegistryLookup: (0, exports.createAdapterToken)('registry.lookup', 'RegistryLookup'),
    TrustRegistryProvider: (0, exports.createAdapterToken)('trust-registry.provider', 'TrustRegistryProvider'),
    CapabilityLookup: (0, exports.createAdapterToken)('capability.lookup', 'CapabilityLookup'),
    AttestationLookup: (0, exports.createAdapterToken)('attestation.lookup', 'AttestationLookup'),
    CredentialStatusLookup: (0, exports.createAdapterToken)('credential-status.lookup', 'CredentialStatusLookup'),
    SecurityEventSink: (0, exports.createAdapterToken)('security.sink', 'SecurityEventSink'),
    ProtocolEventSink: (0, exports.createAdapterToken)('protocol-event.sink', 'ProtocolEventSink'),
});
exports.AllAdapterTokens = Object.freeze(Object.values(exports.AdapterTokens));
