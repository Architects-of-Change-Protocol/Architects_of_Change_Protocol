import {
  consolidateDuplicateNutrients,
  extractMemoryNutrients,
  shouldPromoteNutrient,
  type NutrientExtractionInput,
  type NutrientExtractionPolicy
} from '../index';

const basePolicy: NutrientExtractionPolicy = {
  minEvidenceCount: 2,
  promoteConfidenceThreshold: 0.6,
  recurringBlockerMinCount: 2,
  stakeholderSignalMinCount: 2,
  decisionTrailMinCount: 2,
  contradictionClusterMinContradictions: 2,
  operationalPatternMinCount: 2,
  operationalPatternMinWeightAverage: 60,
  riskEvolutionMinCount: 2,
  strategicCrossDomainMinCount: 3,
  strategicCrossDomainMinDomains: 2
};

describe('deterministic nutrient extraction engine', () => {
  const now = '2026-05-11T00:00:00.000Z';

  const memories: NutrientExtractionInput['memories'] = [
    { memoryId: 'm1', createdAt: now, memoryWeight: 75, blockerKey: 'vendor-delay', stakeholderIds: ['ops'], decisionId: 'd1', policyIds: ['p1'], domain: 'ops', contradictionCount: 0, auditRequired: true },
    { memoryId: 'm2', createdAt: now, memoryWeight: 72, blockerKey: 'vendor-delay', stakeholderIds: ['ops'], decisionId: 'd1', policyIds: ['p1'], domain: 'finance', contradictionCount: 1 },
    { memoryId: 'm3', createdAt: now, memoryWeight: 65, stakeholderIds: ['ops'], decisionId: 'd1', linkedMemoryIds: ['m1'], domain: 'ops', contradictionCount: 3 },
    { memoryId: 'm4', createdAt: now, memoryWeight: 80, contradictionCount: 3, riskTopic: 'counterparty', domain: 'risk' },
    { memoryId: 'm5', createdAt: now, memoryWeight: 70, riskTopic: 'counterparty', domain: 'legal' }
  ];

  it('extracts recurring blockers deterministically', () => {
    const result = extractMemoryNutrients({ memories, now, policy: basePolicy });
    expect(result.nutrients.some((n) => n.nutrientType === 'RECURRING_BLOCKER')).toBe(true);
  });

  it('extracts stakeholder signals from repeated stakeholder references', () => {
    const result = extractMemoryNutrients({ memories, now, policy: basePolicy });
    const signal = result.nutrients.find((n) => n.nutrientType === 'STAKEHOLDER_SIGNAL');
    expect(signal?.sourceMemoryIds).toEqual(['m1', 'm2', 'm3']);
  });

  it('extracts decision trails from linked decisions', () => {
    const result = extractMemoryNutrients({ memories, now, policy: basePolicy });
    expect(result.nutrients.some((n) => n.nutrientType === 'DECISION_TRAIL')).toBe(true);
  });

  it('extracts contradiction clusters for contradiction-heavy memories', () => {
    const result = extractMemoryNutrients({ memories, now, policy: basePolicy });
    const cluster = result.nutrients.find((n) => n.nutrientType === 'CONTRADICTION_CLUSTER');
    expect(cluster?.sourceMemoryIds).toEqual(['m3', 'm4']);
  });

  it('propagates auditRequired from source memories', () => {
    const result = extractMemoryNutrients({ memories, now, policy: basePolicy });
    const blocker = result.nutrients.find((n) => n.nutrientType === 'RECURRING_BLOCKER');
    expect(blocker?.auditRequired).toBe(true);
  });

  it('consolidates duplicate nutrients without losing lineage', () => {
    const extracted = extractMemoryNutrients({ memories, now, policy: basePolicy }).nutrients;
    const duplicateSet = [extracted[0], { ...extracted[0], extractionReason: 'duplicate reason' }];
    const consolidated = consolidateDuplicateNutrients(duplicateSet);
    expect(consolidated).toHaveLength(1);
    expect(consolidated[0].sourceMemoryIds.length).toBeGreaterThan(0);
  });

  it('applies promotion thresholds deterministically', () => {
    const result = extractMemoryNutrients({ memories, now, policy: basePolicy });
    expect(result.promotedNutrients.length).toBeGreaterThan(0);
    expect(result.nutrients.every((n) => n.promoted === shouldPromoteNutrient(n, basePolicy))).toBe(true);
  });

  it('preserves lineage and source evidence for every nutrient', () => {
    const result = extractMemoryNutrients({ memories, now, policy: basePolicy });
    for (const nutrient of result.nutrients) {
      expect(nutrient.lineagePreserved).toBe(true);
      expect(nutrient.sourceMemoryIds.length).toBeGreaterThan(0);
    }
  });
});
