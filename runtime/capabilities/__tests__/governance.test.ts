import { attenuateCapability, evaluateCapabilityLineage, validateDelegation } from '../governance';
import type { RuntimeCapability } from '../types';

const baseCapability: RuntimeCapability = {
  capabilityId: 'cap.root',
  subjectActorId: 'did:example:subject',
  granteeActorId: 'did:example:grantee',
  relationshipId: 'rel-1',
  policyTraceId: 'policy-1',
  governanceSessionId: 'gov-1',
  scope: ['tenant/a/resource/'],
  allowedActions: ['read', 'write'],
  issuedAt: '2026-01-01T00:00:00Z',
  expiresAt: '2026-01-31T00:00:00Z',
  status: 'active'
};

describe('capability governance invariants', () => {
  it('child cannot exceed parent scope', () => {
    const child = { ...baseCapability, capabilityId: 'cap.child', scope: ['tenant/b/resource/'] };
    expect(validateDelegation(baseCapability, child)).toContain('scope_escalation');
  });

  it('child cannot exceed parent lifetime', () => {
    const child = { ...baseCapability, capabilityId: 'cap.child', expiresAt: '2026-02-01T00:00:00Z' };
    expect(validateDelegation(baseCapability, child)).toContain('lifetime_escalation');
  });

  it('attenuated capability cannot regain removed authority', () => {
    const attenuated = attenuateCapability(baseCapability, { allowedActions: ['read'] });
    expect(() => attenuateCapability(attenuated, { allowedActions: ['read', 'write'] })).toThrow(/fail-closed/);
  });

  it('revoked parent invalidates descendants deterministically', () => {
    const lineage = new Map([
      ['cap.child', {
        originCapabilityId: 'cap.root',
        parentCapabilityId: 'cap.root',
        derivationChain: ['cap.root', 'cap.child'],
        delegationChain: ['cap.root', 'cap.child'],
        attenuationHistory: [],
        revocationAncestry: [],
        executionAncestry: []
      }]
    ]);
    const result = evaluateCapabilityLineage('cap.child', lineage, new Set(['cap.root']));
    expect(result).toEqual({ valid: false, revokedAncestor: 'cap.root' });
  });
});
