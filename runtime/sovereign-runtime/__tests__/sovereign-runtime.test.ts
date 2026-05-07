import {
  canRuntimeFederate,
  clearSovereignRuntimes,
  createRuntimeAIGovernanceProfile,
  createRuntimeCapabilityDomain,
  createRuntimeIsolationProfile,
  createRuntimePolicyEnvelope,
  createRuntimeTrustPosture,
  degradeRuntimeTrust,
  evaluateCapabilityDomainCompatibility,
  evaluateRuntimeAIExecutionEligibility,
  evaluateRuntimeIsolationCompatibility,
  evaluateRuntimeTrustEligibility,
  isRuntimeFederationCompatible,
  registerSovereignRuntime,
  revokeSovereignRuntime,
  suspendSovereignRuntime,
  updateSovereignRuntime,
  validateRuntimePolicyEnvelope,
} from '..';

describe('sovereign runtime layer', () => {
  beforeEach(() => clearSovereignRuntimes());

  it('supports registration suspension and revocation', () => {
    registerSovereignRuntime({ runtimeId: 'rt1', runtimeType: 'ai_runtime', ownerActorId: 'actor1', trustDomainId: 'd1', displayName: 'R1', runtimeStatus: 'active' });
    expect(suspendSovereignRuntime('rt1').runtimeStatus).toBe('suspended');
    expect(canRuntimeFederate('rt1')).toBe(false);
    expect(revokeSovereignRuntime('rt1').runtimeStatus).toBe('revoked');
  });

  it('prevents revoked runtime reactivation and enforces isolated profile requirement', () => {
    registerSovereignRuntime({ runtimeId: 'rt2', runtimeType: 'user_runtime', ownerActorId: 'a2', trustDomainId: 'd2', displayName: 'R2', runtimeStatus: 'active' });
    revokeSovereignRuntime('rt2');
    expect(() => updateSovereignRuntime('rt2', { runtimeStatus: 'active' })).toThrow();
    expect(() => registerSovereignRuntime({ runtimeId: 'rt3', runtimeType: 'partner_runtime', ownerActorId: 'a3', trustDomainId: 'd2', displayName: 'R3', runtimeStatus: 'isolated' })).toThrow();
  });

  it('validates policy envelope', () => {
    const e = createRuntimePolicyEnvelope({ policyEnvelopeId: 'pe1', runtimeId: 'rt1', allowedPolicyRefs: ['pol:a'], blockedPolicyRefs: ['pol:b'], requiredAttestationTypes: ['integrity'], requiredAuditEvents: ['evt'], delegationLimits: { maxDelegations: 2 } });
    expect(validateRuntimePolicyEnvelope(e)).toBe(true);
  });

  it('tracks trust degradation and recovery', () => {
    const t = createRuntimeTrustPosture({ trustPostureId: 'tp1', runtimeId: 'rt1', trustLevel: 'high', riskFlags: [], lastReviewedAt: new Date().toISOString(), trustEvidenceRefs: ['ev:1'], degradationSignals: [], recoverySignals: [] });
    degradeRuntimeTrust('tp1', 'signal:x');
    expect(evaluateRuntimeTrustEligibility({ ...t, degradationSignals: ['signal:x'] })).toBe(true);
  });

  it('evaluates capability domain compatibility', () => {
    const d = createRuntimeCapabilityDomain({ capabilityDomainId: 'cd1', runtimeId: 'rt1', allowedCapabilityTypes: ['read'], blockedCapabilityTypes: ['delete'], maxCapabilityTTLSeconds: 60, revocationMode: 'federated', remoteValidationRequired: true });
    expect(evaluateCapabilityDomainCompatibility(d, { capabilityType: 'read', ttlSeconds: 30, requiresRemoteValidation: true, revocationMode: 'local_only' })).toBe(true);
  });

  it('evaluates isolation and AI governance eligibility plus federation seam', () => {
    const iso = createRuntimeIsolationProfile({ isolationProfileId: 'ip1', runtimeId: 'rt1', isolationLevel: 'strict', allowedFederationModes: ['limited', 'audit_only'], blockedRuntimeTypes: ['public_runtime'], dataEgressRestrictions: ['deny:*'], aiExecutionRestrictions: ['no-external-tools'] });
    expect(evaluateRuntimeIsolationCompatibility(iso, 'partner_runtime', 'limited')).toBe(true);

    const ai = createRuntimeAIGovernanceProfile({ aiGovernanceProfileId: 'ai1', runtimeId: 'rt1', allowedAiActorTypes: ['assistant'], blockedScopes: ['scope:admin'], humanReviewRequiredActions: ['deploy'], autonomousExecutionLimits: { classify: 3, deploy: 0 }, escalationPolicyRefs: ['esc:1'] });
    expect(evaluateRuntimeAIExecutionEligibility(ai, { aiActorType: 'assistant', scope: 'scope:user', action: 'classify', requestedAutonomyLevel: 2, humanReviewCompleted: false })).toBe(true);

    const source = registerSovereignRuntime({ runtimeId: 'rs', runtimeType: 'organization_runtime', ownerActorId: 'oa', trustDomainId: 'd1', displayName: 'S', runtimeStatus: 'active' });
    const target = registerSovereignRuntime({ runtimeId: 'rt', runtimeType: 'partner_runtime', ownerActorId: 'ob', trustDomainId: 'd1', displayName: 'T', runtimeStatus: 'active' });
    expect(isRuntimeFederationCompatible(source, target, iso)).toBe(true);
  });
});
