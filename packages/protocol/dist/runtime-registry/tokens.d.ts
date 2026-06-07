import type { AttestationLookup, AuditEventSink, CapabilityLookup, CredentialStatusLookup, ExecutionAuthorizationProvider, GovernanceDecisionProvider, ObservabilityEventSink, PolicyDecisionProvider, ProtocolEventSink, RegistryLookup, RevocationLookup, SecurityEventSink, TrustRegistryProvider, VerificationKeyResolver, VerificationProvider } from '../adapters';
import type { AdapterToken } from './types';
export declare const createAdapterToken: <TAdapter>(id: string, displayName: string) => AdapterToken<TAdapter>;
export declare const AdapterTokens: Readonly<{
    VerificationProvider: AdapterToken<VerificationProvider>;
    VerificationKeyResolver: AdapterToken<VerificationKeyResolver>;
    PolicyDecisionProvider: AdapterToken<PolicyDecisionProvider>;
    ExecutionAuthorizationProvider: AdapterToken<ExecutionAuthorizationProvider>;
    AuditEventSink: AdapterToken<AuditEventSink>;
    ObservabilityEventSink: AdapterToken<ObservabilityEventSink>;
    GovernanceDecisionProvider: AdapterToken<GovernanceDecisionProvider>;
    RevocationLookup: AdapterToken<RevocationLookup>;
    RegistryLookup: AdapterToken<RegistryLookup>;
    TrustRegistryProvider: AdapterToken<TrustRegistryProvider>;
    CapabilityLookup: AdapterToken<CapabilityLookup>;
    AttestationLookup: AdapterToken<AttestationLookup>;
    CredentialStatusLookup: AdapterToken<CredentialStatusLookup>;
    SecurityEventSink: AdapterToken<SecurityEventSink>;
    ProtocolEventSink: AdapterToken<ProtocolEventSink>;
}>;
export declare const AllAdapterTokens: readonly AdapterToken[];
//# sourceMappingURL=tokens.d.ts.map