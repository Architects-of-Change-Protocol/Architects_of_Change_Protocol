import {
  calculateMemoryWeight,
  classifyMemoryByPolicyThreshold,
  decayMemoryWeight,
  reinforceMemoryWeight,
  updateMemoryWeight,
  type MemoryWeightState
} from '../index';

describe('sovereign memory weighting engine', () => {
  const baseState: MemoryWeightState = {
    score: 0,
    dimensions: {
      governanceImpact: 8,
      operationalRecurrence: 7,
      stakeholderAuthority: 9,
      legalSignificance: 8,
      referenceFrequency: 4,
      temporalFreshness: 6,
      crossDomainLinkage: 7,
      policyDependency: 8,
      contradictionPresence: 1,
      executionOutcomeImpact: 9
    },
    referenceCount: 0,
    linkedExecutiveSummaryCount: 0,
    approvedDecisionCount: 0,
    isTransient: false,
    lastAccessedAt: '2026-05-01T00:00:00.000Z',
    createdAt: '2026-05-01T00:00:00.000Z'
  };

  it('calculates deterministic base weight', () => {
    expect(calculateMemoryWeight(baseState.dimensions)).toBe(67.6);
  });

  it('reinforces on repeated references and approved decisions', () => {
    const seeded = { ...baseState, score: 50 };
    const reinforced = reinforceMemoryWeight(seeded, {
      additionalReferences: 3,
      additionalExecutiveSummaryLinks: 2,
      additionalApprovedDecisions: 1
    });
    expect(reinforced.score).toBe(66.25);
    expect(reinforced.referenceCount).toBe(3);
    expect(reinforced.approvedDecisionCount).toBe(1);
  });

  it('updates and applies event reinforcement deterministically', () => {
    const updated = updateMemoryWeight(baseState, {
      referenced: true,
      linkedExecutiveSummary: true,
      approvedDecision: true,
      dimensions: { referenceFrequency: 8 }
    });

    expect(updated.score).toBeGreaterThan(calculateMemoryWeight(baseState.dimensions));
    expect(updated.referenceCount).toBe(1);
    expect(updated.linkedExecutiveSummaryCount).toBe(1);
    expect(updated.approvedDecisionCount).toBe(1);
  });

  it('decays transient context faster than non-transient', () => {
    const active = { ...baseState, score: 80, isTransient: false };
    const transient = { ...baseState, score: 80, isTransient: true };
    const now = '2026-05-11T00:00:00.000Z';
    expect(decayMemoryWeight(transient, now).score).toBeLessThan(decayMemoryWeight(active, now).score);
  });

  it('classifies policy thresholds deterministically', () => {
    const thresholds = { archivalThreshold: 70, compressionThreshold: 45, purgeThreshold: 20 };
    expect(classifyMemoryByPolicyThreshold(80, thresholds)).toBe('retain_active');
    expect(classifyMemoryByPolicyThreshold(60, thresholds)).toBe('archive');
    expect(classifyMemoryByPolicyThreshold(30, thresholds)).toBe('compress');
    expect(classifyMemoryByPolicyThreshold(10, thresholds)).toBe('purge');
  });
});
