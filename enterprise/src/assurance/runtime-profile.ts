import {
  AdapterTokens,
  RuntimeProfileValidationMode,
  type AdapterToken,
  type RuntimeProfile,
} from '@aoc/protocol/runtime-registry';

/** Canonical declaration for the complete Enterprise Assurance runtime. */
export const EnterpriseAssuranceRuntimeProfile: RuntimeProfile = Object.freeze({
  id: 'enterprise.assurance',
  name: 'Enterprise Assurance Runtime',
  description: 'Verification, trust-registry, audit, security, protocol, and observability assurance adapters.',
  requiredTokens: Object.freeze([
    AdapterTokens.VerificationProvider,
    AdapterTokens.VerificationKeyResolver,
    AdapterTokens.RegistryLookup,
    AdapterTokens.TrustRegistryProvider,
    AdapterTokens.AuditEventSink,
    AdapterTokens.SecurityEventSink,
    AdapterTokens.ProtocolEventSink,
    AdapterTokens.ObservabilityEventSink,
  ]),
  optionalTokens: Object.freeze([
    AdapterTokens.PolicyDecisionProvider,
    AdapterTokens.ExecutionAuthorizationProvider,
    AdapterTokens.GovernanceDecisionProvider,
    AdapterTokens.RevocationLookup,
    AdapterTokens.CapabilityLookup,
    AdapterTokens.AttestationLookup,
    AdapterTokens.CredentialStatusLookup,
  ]),
  allowDefaults: true,
  validationMode: RuntimeProfileValidationMode.Profile,
});

/** @deprecated Use EnterpriseAssuranceRuntimeProfile.requiredTokens. */
export const AssuranceRuntimeAdapterTokens: readonly AdapterToken[] =
  EnterpriseAssuranceRuntimeProfile.requiredTokens;
