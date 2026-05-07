import {
  appendAttestationChain,
  clearAttestationChains,
  clearGovernanceAttestations,
  clearIntegrityProofs,
  createAIAttestation,
  createCapabilityAttestation,
  createChainedIntegrityProof,
  createGovernanceAttestation,
  createIntegrityProof,
  createRemoteGovernanceAttestation,
  validateAIAttestation,
  validateAttestationChain,
  validateCapabilityAttestation,
  validateGovernanceAttestation,
  validateIntegrityProof,
  validateRemoteGovernanceAttestation
} from '../index';

describe('governance attestation layer', () => {
  beforeEach(() => {
    clearIntegrityProofs();
    clearGovernanceAttestations();
    clearAttestationChains();
  });

  it('creates and validates governance attestations', () => {
    const proof = createIntegrityProof({ proofId: 'p1', proofType: 'local_hash', payload: { d: 1 } });
    const att = createGovernanceAttestation({
      attestationId: 'a1', attestationType: 'governance_decision', actorId: 'actor', governanceSessionId: 'gs',
      policyTraceId: 'pt', relationshipId: 'rel', capabilityRefs: ['cap-a'], decision: 'allow',
      issuedAt: new Date().toISOString(), integrityProofRef: proof.proofId
    });
    expect(validateGovernanceAttestation(att).valid).toBe(true);
  });

  it('validates integrity proof chains', () => {
    const root = createIntegrityProof({ proofId: 'root', proofType: 'local_hash', payload: { x: 1 } });
    const child = createChainedIntegrityProof({ proofId: 'child', parentProofRef: root.proofId, payload: { x: 2 } });
    expect(validateIntegrityProof(child).valid).toBe(true);
  });

  it('validates chained attestation continuity', () => {
    const p1 = createIntegrityProof({ proofId: 'cp1', proofType: 'local_hash', payload: { i: 1 } });
    const a1 = createGovernanceAttestation({
      attestationId: 'ca1', attestationType: 'governance_decision', actorId: 'actor', governanceSessionId: 'gs',
      policyTraceId: 'pt', relationshipId: 'rel', capabilityRefs: [], decision: 'allow',
      issuedAt: '2026-01-01T00:00:00.000Z', integrityProofRef: p1.proofId
    });
    const p2 = createChainedIntegrityProof({ proofId: 'cp2', parentProofRef: p1.proofId, payload: { i: 2 } });
    const a2 = createGovernanceAttestation({
      attestationId: 'ca2', attestationType: 'capability_used', actorId: 'actor', governanceSessionId: 'gs',
      policyTraceId: 'pt2', relationshipId: 'rel', capabilityRefs: ['cap'], decision: 'conditional',
      issuedAt: '2026-01-02T00:00:00.000Z', integrityProofRef: p2.proofId, previousAttestationRef: a1.attestationId
    });
    appendAttestationChain('chain-1', a1);
    appendAttestationChain('chain-1', a2);
    expect(validateAttestationChain('chain-1').valid).toBe(true);
  });

  it('validates capability attestations', () => {
    const p = createIntegrityProof({ proofId: 'cap-proof', proofType: 'local_hash', payload: { c: 1 } });
    const g = createGovernanceAttestation({
      attestationId: 'cap-g', attestationType: 'capability_issued', actorId: 'actor', governanceSessionId: 'gs',
      policyTraceId: 'pt', relationshipId: 'rel', capabilityRefs: ['cap-a'], decision: 'allow',
      issuedAt: new Date().toISOString(), integrityProofRef: p.proofId
    });
    const cap = createCapabilityAttestation({
      capabilityId: 'cap-a', issuingRuntimeId: 'runtime-a', governanceAttestationRef: g.attestationId,
      validityWindow: { notBefore: '2026-01-01T00:00:00.000Z', notAfter: '2026-12-31T00:00:00.000Z' }, revocationRefs: []
    });
    expect(validateCapabilityAttestation(cap).valid).toBe(true);
  });

  it('enforces AI attestation constraints', () => {
    const ai = createAIAttestation({
      aiActorId: 'ai-agent', allowedScopes: ['read_policy', 'execute_low_risk'], executedActions: ['execute_low_risk'],
      humanReviewRefs: ['review-1'], escalationRefs: ['esc-1'], autonomousUseCount: 2
    });
    expect(validateAIAttestation(ai, {
      maxAutonomousUseCount: 3,
      humanReviewRequiredActions: ['execute_low_risk'],
      escalationRequiredActions: ['execute_low_risk']
    }).valid).toBe(true);
  });

  it('validates remote governance attestations and trust boundaries', () => {
    const remote = createRemoteGovernanceAttestation({
      sourceRuntimeId: 'runtime-a', targetRuntimeId: 'runtime-b', federationRef: 'fed-1',
      remoteDecisionRef: 'decision-1', remoteAuditRefs: ['audit-1']
    });
    expect(validateRemoteGovernanceAttestation(remote, {
      allowedFederationRefs: ['fed-1'],
      allowedTrustDomainPairs: [{ sourceRuntimeId: 'runtime-a', targetRuntimeId: 'runtime-b' }]
    }).valid).toBe(true);
  });
});
