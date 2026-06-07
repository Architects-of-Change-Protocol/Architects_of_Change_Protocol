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
} from '../adapters';
import type { AdapterToken } from './types';

const CONTRACT_VERSION = '1.0';

export const createAdapterToken = <TAdapter>(id: string, displayName: string): AdapterToken<TAdapter> =>
  Object.freeze({ id, displayName, contractVersion: CONTRACT_VERSION });

export const AdapterTokens = Object.freeze({
  VerificationProvider: createAdapterToken<VerificationProvider>('verification.provider', 'VerificationProvider'),
  VerificationKeyResolver: createAdapterToken<VerificationKeyResolver>(
    'verification.key-resolver',
    'VerificationKeyResolver',
  ),
  PolicyDecisionProvider: createAdapterToken<PolicyDecisionProvider>('policy.provider', 'PolicyDecisionProvider'),
  ExecutionAuthorizationProvider: createAdapterToken<ExecutionAuthorizationProvider>(
    'execution.authorization',
    'ExecutionAuthorizationProvider',
  ),
  AuditEventSink: createAdapterToken<AuditEventSink>('audit.sink', 'AuditEventSink'),
  ObservabilityEventSink: createAdapterToken<ObservabilityEventSink>('observability.sink', 'ObservabilityEventSink'),
  GovernanceDecisionProvider: createAdapterToken<GovernanceDecisionProvider>(
    'governance.provider',
    'GovernanceDecisionProvider',
  ),
  RevocationLookup: createAdapterToken<RevocationLookup>('revocation.lookup', 'RevocationLookup'),
  RegistryLookup: createAdapterToken<RegistryLookup>('registry.lookup', 'RegistryLookup'),
  TrustRegistryProvider: createAdapterToken<TrustRegistryProvider>('trust-registry.provider', 'TrustRegistryProvider'),
  CapabilityLookup: createAdapterToken<CapabilityLookup>('capability.lookup', 'CapabilityLookup'),
  AttestationLookup: createAdapterToken<AttestationLookup>('attestation.lookup', 'AttestationLookup'),
  CredentialStatusLookup: createAdapterToken<CredentialStatusLookup>('credential-status.lookup', 'CredentialStatusLookup'),
  SecurityEventSink: createAdapterToken<SecurityEventSink>('security.sink', 'SecurityEventSink'),
  ProtocolEventSink: createAdapterToken<ProtocolEventSink>('protocol-event.sink', 'ProtocolEventSink'),
});

export const AllAdapterTokens: readonly AdapterToken[] = Object.freeze(Object.values(AdapterTokens));
