import {
  classifyExecutiveSynthesisCategory,
  consolidateDuplicateSyntheses,
  synthesizeExecutiveMemory,
  type ExecutiveSynthesisInputNutrient,
  type ExecutiveSynthesisPolicy
} from '../executive-synthesis-engine';

const now = '2026-05-11T00:00:00.000Z';

const policy: ExecutiveSynthesisPolicy = {
  recurringBlockerHighWeightThreshold: 65,
  stakeholderHighConfidenceThreshold: 0.7,
  operationalPatternHighEvidenceThreshold: 3,
  governanceHeavyWeightThreshold: 80,
  organizationalTruthMinEvidence: 3,
  organizationalTruthMinConfidence: 0.8,
  strategicOpportunityMinConfidence: 0.8,
  governancePromotionConfidenceThreshold: 0.8,
  governancePromotionMinEvidenceCount: 5
};

const nutrient = (overrides: Partial<ExecutiveSynthesisInputNutrient>): ExecutiveSynthesisInputNutrient => ({
  nutrientId: 'n1',
  nutrientType: 'OPERATIONAL_PATTERN',
  sourceMemoryIds: ['m1'],
  createdAt: now,
  updatedAt: now,
  confidenceScore: 0.8,
  evidenceCount: 2,
  memoryWeightAverage: 70,
  extractionReason: 'test reason',
  auditRequired: false,
  lineagePreserved: true,
  promoted: true,
  ...overrides
});

describe('executive synthesis engine', () => {
  it('maps recurring blocker to recurring failure mode', () => {
    const category = classifyExecutiveSynthesisCategory([nutrient({ nutrientType: 'RECURRING_BLOCKER' })], policy);
    expect(category).toBe('RECURRING_FAILURE_MODE');
  });

  it('maps contradiction cluster to review-required synthesis', () => {
    const result = synthesizeExecutiveMemory({ nutrients: [nutrient({ nutrientType: 'CONTRADICTION_CLUSTER' })], now, policy });
    expect(result.syntheses[0].category).toBe('CONTRADICTION_REQUIRES_REVIEW');
    expect(result.syntheses[0].reviewRequired).toBe(true);
  });

  it('maps stakeholder signal to stakeholder gravity', () => {
    const category = classifyExecutiveSynthesisCategory([nutrient({ nutrientType: 'STAKEHOLDER_SIGNAL', confidenceScore: 0.92 })], policy);
    expect(category).toBe('STAKEHOLDER_GRAVITY');
  });

  it('maps policy dependency to policy impact', () => {
    const category = classifyExecutiveSynthesisCategory([nutrient({ nutrientType: 'POLICY_DEPENDENCY' })], policy);
    expect(category).toBe('POLICY_IMPACT');
  });

  it('maps risk evolution to strategic risk', () => {
    const category = classifyExecutiveSynthesisCategory([nutrient({ nutrientType: 'RISK_EVOLUTION' })], policy);
    expect(category).toBe('STRATEGIC_RISK');
  });

  it('maps strategic summary candidate to executive briefing candidate', () => {
    const category = classifyExecutiveSynthesisCategory([nutrient({ nutrientType: 'STRATEGIC_SUMMARY_CANDIDATE' })], policy);
    expect(category).toBe('EXECUTIVE_BRIEFING_CANDIDATE');
  });

  it('propagates audit and preserves lineage', () => {
    const result = synthesizeExecutiveMemory({ nutrients: [nutrient({ auditRequired: true, sourceMemoryIds: ['m1', 'm2'] })], now, policy });
    expect(result.syntheses[0].auditRequired).toBe(true);
    expect(result.syntheses[0].lineagePreserved).toBe(true);
    expect(result.syntheses[0].sourceNutrientIds.length).toBeGreaterThan(0);
    expect(result.syntheses[0].sourceMemoryIds).toEqual(['m1', 'm2']);
  });

  it('applies governance memory promotion threshold', () => {
    const result = synthesizeExecutiveMemory({ nutrients: [nutrient({ confidenceScore: 0.95 })], now, policy });
    expect(result.syntheses[0].promotedToGovernanceMemory).toBe(true);
  });

  it('consolidates duplicate syntheses deterministically', () => {
    const synthesized = synthesizeExecutiveMemory({ nutrients: [nutrient({ nutrientId: 'n2' })], now, policy }).syntheses[0];
    const consolidated = consolidateDuplicateSyntheses([synthesized, { ...synthesized, executiveSummary: 'duplicate' }]);
    expect(consolidated).toHaveLength(1);
    expect(consolidated[0].evidenceCount).toBeGreaterThan(synthesized.evidenceCount);
  });
});
