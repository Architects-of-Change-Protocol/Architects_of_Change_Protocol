import {
  applyDistributedRevocation,
  clearDistributedCapabilities,
  clearDistributedRevocations,
  clearRemoteGovernanceDecisions,
  clearRuntimeFederations,
  clearTrustDomains,
  createDistributedCapabilityReference,
  createDistributedRevocationReference,
  createRemoteGovernanceDecision,
  enforceDelegationBoundary,
  establishRuntimeFederation,
  isIsolatedGovernanceDomain,
  registerTrustDomain,
  revokeRuntimeFederation,
  suspendRuntimeFederation,
  suspendTrustDomain,
  validateDistributedCapabilityReference,
  validateFederationCompatibility,
  validateRemoteGovernanceDecision,
} from '..';

describe('distributed governance foundations', () => {
  beforeEach(() => {
    clearTrustDomains();
    clearRuntimeFederations();
    clearRemoteGovernanceDecisions();
    clearDistributedCapabilities();
    clearDistributedRevocations();
  });

  it('registers and suspends trust domains', () => {
    const domain = registerTrustDomain({
      domainId: 'org-a',
      domainType: 'organization',
      displayName: 'Org A',
      trustLevel: 'high',
      governancePolicies: ['policy:a'],
      allowedFederationModes: ['delegated', 'limited'],
    });

    expect(domain.domainId).toBe('org-a');
    expect(suspendTrustDomain('org-a').suspendedAt).toBeDefined();
  });

  it('establishes then suspends and revokes federation', () => {
    registerTrustDomain({ domainId: 'a', domainType: 'organization', displayName: 'A', trustLevel: 'high', governancePolicies: [], allowedFederationModes: ['delegated', 'limited'] });
    registerTrustDomain({ domainId: 'b', domainType: 'partner', displayName: 'B', trustLevel: 'moderate', governancePolicies: [], allowedFederationModes: ['delegated', 'limited'] });

    const federation = establishRuntimeFederation({
      federationId: 'fed-1',
      sourceDomainId: 'a',
      targetDomainId: 'b',
      federationMode: 'delegated',
      allowedCapabilities: ['cap:read'],
      delegationPolicies: ['allow:read'],
    });

    expect(federation.establishedAt).toBeDefined();
    expect(suspendRuntimeFederation('fed-1').suspendedAt).toBeDefined();
    expect(revokeRuntimeFederation('fed-1').revokedAt).toBeDefined();
  });

  it('validates federation compatibility restrictions', () => {
    registerTrustDomain({ domainId: 'strict', domainType: 'platform', displayName: 'Strict', trustLevel: 'strict', governancePolicies: [], allowedFederationModes: ['reciprocal', 'isolated'] });
    registerTrustDomain({ domainId: 'peer', domainType: 'partner', displayName: 'Peer', trustLevel: 'high', governancePolicies: [], allowedFederationModes: ['reciprocal', 'isolated'] });

    const result = validateFederationCompatibility({
      federationId: 'fed-x', sourceDomainId: 'strict', targetDomainId: 'peer', federationMode: 'reciprocal',
      allowedCapabilities: ['cap:x'], delegationPolicies: ['allow:x'],
    });

    expect(result.compatible).toBe(false);
    expect(result.reasons.join(' ')).toContain('Strict trust domains');
  });

  it('validates remote governance decisions', () => {
    const decision = createRemoteGovernanceDecision({
      decisionId: 'd1',
      sourceRuntimeId: 'rt-a',
      targetRuntimeId: 'rt-b',
      policyTraceRef: 'trace://1',
      decision: 'conditional',
      obligations: ['must-log'],
      remoteAuditRefs: ['audit://1'],
      evaluatedAt: '2026-05-07T00:00:00.000Z',
    });

    expect(validateRemoteGovernanceDecision(decision)).toBe(true);
  });

  it('validates distributed capabilities and revocation propagation state', () => {
    registerTrustDomain({ domainId: 'a', domainType: 'organization', displayName: 'A', trustLevel: 'high', governancePolicies: [], allowedFederationModes: ['delegated'] });
    registerTrustDomain({ domainId: 'b', domainType: 'partner', displayName: 'B', trustLevel: 'moderate', governancePolicies: [], allowedFederationModes: ['delegated'] });

    establishRuntimeFederation({
      federationId: 'fed-2', sourceDomainId: 'a', targetDomainId: 'b', federationMode: 'delegated',
      allowedCapabilities: ['cap:write'], delegationPolicies: ['allow:write'],
    });

    const cap = createDistributedCapabilityReference({
      capabilityId: 'cap:write', issuingRuntimeId: 'rt-a', originatingDomainId: 'a',
      remoteValidationRequired: true, federationRef: 'fed-2', revocationRefs: [],
    });
    expect(validateDistributedCapabilityReference(cap)).toBe(true);

    createDistributedRevocationReference({
      revocationId: 'rev-1', originatingRuntimeId: 'rt-a', capabilityId: 'cap:write',
      propagatedAt: '2026-05-07T00:00:00.000Z', propagationState: 'pending',
    });

    expect(applyDistributedRevocation('rev-1').propagationState).toBe('propagated');
  });

  it('enforces governance isolation behavior', () => {
    const isolated = registerTrustDomain({
      domainId: 'ai-iso', domainType: 'ai_runtime', displayName: 'AI Isolated', trustLevel: 'strict', governancePolicies: [], allowedFederationModes: ['isolated'],
    });
    expect(isIsolatedGovernanceDomain(isolated)).toBe(true);

    expect(enforceDelegationBoundary({
      federationId: 'f', sourceDomainId: 'ai-iso', targetDomainId: 'x', federationMode: 'audit_only',
      allowedCapabilities: [], delegationPolicies: [], establishedAt: '2026-05-07T00:00:00.000Z',
    })).toBe(true);
  });
});
