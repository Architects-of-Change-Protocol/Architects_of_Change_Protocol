import {
  evaluateMemoryDecay,
  shouldArchiveMemory,
  shouldCompressMemory,
  shouldFossilizeMemory,
  shouldPurgeMemory,
  transitionMemoryState,
  type MemoryDecayPolicy,
  type MemoryDecayRecord
} from '../index';

describe('governed memory decay engine', () => {
  const policy: MemoryDecayPolicy = {
    retention: {
      coolingAfterDays: 3,
      compressAfterDays: 7,
      archiveAfterDays: 30,
      fossilizeAfterDays: 120,
      purgeAfterDays: 365
    },
    legalHold: false,
    auditPreservationMode: false
  };

  const transientMemory: MemoryDecayRecord = {
    memoryId: 'mem-1',
    decayClass: 'transient',
    state: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastAccessedAt: '2025-01-01T00:00:00.000Z',
    lastStateChangedAt: '2025-01-01T00:00:00.000Z'
  };

  it('progressively transitions transient memory into terminal lifecycle states', () => {
    expect(evaluateMemoryDecay(transientMemory, policy, '2025-01-05T00:00:00.000Z')).toBe('COOLING');
    expect(evaluateMemoryDecay(transientMemory, policy, '2025-01-10T00:00:00.000Z')).toBe('COMPRESSED');
    expect(evaluateMemoryDecay(transientMemory, policy, '2025-02-05T00:00:00.000Z')).toBe('ARCHIVED');
    expect(evaluateMemoryDecay(transientMemory, policy, '2025-05-05T00:00:00.000Z')).toBe('FOSSILIZED');
    expect(evaluateMemoryDecay(transientMemory, policy, '2026-02-05T00:00:00.000Z')).toBe('PURGED');
  });

  it('provides deterministic stage predicates', () => {
    expect(shouldCompressMemory(transientMemory, policy, '2025-01-10T00:00:00.000Z')).toBe(true);
    expect(shouldArchiveMemory(transientMemory, policy, '2025-02-05T00:00:00.000Z')).toBe(true);
    expect(shouldFossilizeMemory(transientMemory, policy, '2025-05-05T00:00:00.000Z')).toBe(true);
    expect(shouldPurgeMemory(transientMemory, policy, '2026-02-05T00:00:00.000Z')).toBe(true);
  });

  it('makes policy/governance memory resist decay by widening windows', () => {
    const governanceMemory: MemoryDecayRecord = { ...transientMemory, memoryId: 'mem-2', decayClass: 'policy_governance' };
    expect(evaluateMemoryDecay(governanceMemory, policy, '2026-02-05T00:00:00.000Z')).toBe('FOSSILIZED');
  });

  it('prevents purge under legal hold and audit-preservation protections', () => {
    const auditRequired: MemoryDecayRecord = { ...transientMemory, memoryId: 'mem-3', decayClass: 'audit_required', auditRequired: true };
    expect(shouldPurgeMemory(auditRequired, policy, '2030-01-01T00:00:00.000Z')).toBe(false);
    expect(evaluateMemoryDecay(auditRequired, policy, '2030-01-01T00:00:00.000Z')).toBe('FOSSILIZED');

    const legalHoldPolicy: MemoryDecayPolicy = { ...policy, legalHold: true };
    expect(shouldPurgeMemory(transientMemory, legalHoldPolicy, '2030-01-01T00:00:00.000Z')).toBe(false);
  });

  it('supports governance override hooks for hold/force behavior', () => {
    const held = evaluateMemoryDecay(transientMemory, policy, '2026-02-05T00:00:00.000Z', () => ({ holdState: 'ARCHIVED' }));
    expect(held).toBe('ARCHIVED');

    const forced = evaluateMemoryDecay(transientMemory, policy, '2025-01-02T00:00:00.000Z', () => ({ forceState: 'COMPRESSED' }));
    expect(forced).toBe('COMPRESSED');
  });

  it('transitions state with auditable timestamp updates', () => {
    const transitioned = transitionMemoryState(transientMemory, policy, '2025-01-05T00:00:00.000Z');
    expect(transitioned.state).toBe('COOLING');
    expect(transitioned.lastStateChangedAt).toBe('2025-01-05T00:00:00.000Z');
  });
});
