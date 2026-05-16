import {
  buildRuntimeFederationAssertion,
  constrainFederatedCapability,
  normalizeRuntimeFederationDecision,
  redactFederationTrace,
  validateFederatedReplay,
  validateRuntimeCompatibility,
  validateRuntimeTrust,
} from '../federation-semantics';

describe('federation semantics', () => {
  test('incompatible runtimes fail closed', () => {
    const result = validateRuntimeCompatibility(
      { federationVersion: '2.0', runtimeProtocolVersion: '1', transportProfile: 'http-json' },
      { supportedFederationVersions: ['1.0'], runtimeProtocolVersion: '1', supportedTransportProfiles: ['http-json'] },
    );
    expect(result.compatible).toBe(false);
  });

  test('revoked runtime trust invalidates federation', () => {
    const result = validateRuntimeTrust({
      runtimeId: 'r1',
      state: 'revoked',
      trustLevel: 'revoked',
      allowedCapabilities: ['cap.read'],
      maxDelegationDepth: 0,
      replayAuthorized: false,
    });
    expect(result.compatible).toBe(false);
  });

  test('remote runtime cannot exceed delegated scope', () => {
    const constrained = constrainFederatedCapability(
      {
        capabilityId: 'cap1',
        sourceRuntimeId: 'r1',
        targetRuntimeId: 'r2',
        allowedScopes: ['cap.read', 'cap.write'],
        delegationDepth: 3,
        tenantBound: true,
        replayBound: true,
      },
      {
        runtimeId: 'r2',
        state: 'trusted',
        trustLevel: 'capability-limited',
        allowedCapabilities: ['cap.read'],
        maxDelegationDepth: 1,
        replayAuthorized: true,
      },
    );

    expect(constrained.allowedScopes).toEqual(['cap.read']);
    expect(constrained.delegationDepth).toBe(1);
  });

  test('federation decision normalization is deterministic', () => {
    const normalized = normalizeRuntimeFederationDecision({
      decisionId: 'd1',
      category: 'governance',
      state: 'trusted',
      decision: 'allow',
      reasons: ['b', 'a', 'a'],
    });

    expect(normalized.reasons).toEqual(['a', 'b']);
    expect(normalized.explainabilityRef).toBe('federation:d1');
  });

  test('federation constraints fail closed', () => {
    const decision = buildRuntimeFederationAssertion(
      {
        handshakeId: 'h1',
        sourceIdentity: { runtimeId: 'r1', runtimeDomain: 'd1', tenantId: 't1', sovereign: true },
        targetIdentity: { runtimeId: 'r2', runtimeDomain: 'd2', tenantId: 't1', sovereign: true },
        trust: { runtimeId: 'r2', state: 'trusted', trustLevel: 'trusted', allowedCapabilities: ['cap.read'], maxDelegationDepth: 2, replayAuthorized: true },
        version: { federationVersion: '1.0', runtimeProtocolVersion: '1', transportProfile: 'http-json' },
        compatibilityMatrix: { supportedFederationVersions: ['1.0'], runtimeProtocolVersion: '1', supportedTransportProfiles: ['http-json'] },
        constraints: [],
      },
      { runtimeId: 'r2', state: 'trusted', trustLevel: 'trusted', allowedCapabilities: ['cap.read'], maxDelegationDepth: 2, replayAuthorized: true },
      [{ constraintId: 'c1', category: 'trust', reasonCode: 'trust.denied', enforcement: 'deny' }],
    );

    expect(decision.decision).toBe('deny');
  });

  test('replay preserves attestation requirement', () => {
    const result = validateFederatedReplay(
      { replayId: 'rp1', lineageId: 'ln1', authorized: true, attestationRefs: [] },
      { runtimeId: 'r2', state: 'replay-authorized', trustLevel: 'replay-authorized', allowedCapabilities: ['cap.read'], maxDelegationDepth: 1, replayAuthorized: true },
    );

    expect(result.compatible).toBe(false);
  });

  test('trace redaction normalization remains deterministic', () => {
    const trace = redactFederationTrace({
      traceId: 'tr1',
      runtimeOrigin: 'r1',
      decisionId: 'd1',
      visibility: 'audit-safe',
      redactedFields: ['tenant.secrets', 'token.raw', 'tenant.secrets'],
    });

    expect(trace.redactedFields).toEqual(['tenant.secrets', 'token.raw']);
  });
});
