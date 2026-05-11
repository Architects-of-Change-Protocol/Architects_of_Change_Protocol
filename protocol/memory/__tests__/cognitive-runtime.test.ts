import {
  runSovereignCognitiveRuntime,
  filterSignalsForQuery,
  consolidateDuplicateRuntimeSignals,
  type CognitiveRuntimeInput,
  type CognitiveRuntimePolicy
} from '../cognitive-runtime';
import type { ExecutiveSynthesisRecord } from '../executive-synthesis-engine';
import type { MemoryNutrient } from '../nutrient-engine';

const policy: CognitiveRuntimePolicy = {
  aiContextConfidenceThreshold: 0.75,
  governanceCandidateConfidenceThreshold: 0.6,
  humanReviewSeverityThreshold: 0.8,
  truthDriftConfidenceDropThreshold: 0.55,
  riskConvergenceMinSharedEvidence: 1,
  minimumSignalConfidence: 0.4
};

const nutrient: MemoryNutrient = {
  nutrientId: 'n1', nutrientType: 'CONTRADICTION_CLUSTER', sourceMemoryIds: ['m1'], createdAt: '2026-01-01', updatedAt: '2026-01-01', confidenceScore: 0.8,
  evidenceCount: 3, memoryWeightAverage: 70, extractionReason: 'x', auditRequired: true, lineagePreserved: true, promoted: true
};

const buildSynthesis = (overrides: Partial<ExecutiveSynthesisRecord>): ExecutiveSynthesisRecord => ({
  synthesisId: 's1', category: 'CONTRADICTION_REQUIRES_REVIEW', sourceNutrientIds: ['n1'], sourceMemoryIds: ['m1'], createdAt: '2026-01-01', updatedAt: '2026-01-01', confidenceScore: 0.8,
  evidenceCount: 3, averageNutrientConfidence: 0.8, averageMemoryWeight: 70, executiveSummary: 'sum', recommendedAction: 'act', auditRequired: true,
  lineagePreserved: true, reviewRequired: true, promotedToGovernanceMemory: false, ...overrides
});

const run = (syntheses: ExecutiveSynthesisRecord[], nutrients: MemoryNutrient[] = [nutrient]) => runSovereignCognitiveRuntime({
  syntheses, nutrients, memories: [{ memoryId: 'm1' }], now: '2026-05-11T00:00:00Z', policy
} as CognitiveRuntimeInput);

test('contradiction -> governance contradiction + human review required', () => {
  const result = run([buildSynthesis({})]);
  expect(result.signals.some((s) => s.signalType === 'GOVERNANCE_CONTRADICTION')).toBe(true);
  expect(result.signals.some((s) => s.signalType === 'HUMAN_REVIEW_REQUIRED')).toBe(true);
});

test('recurring failure -> recurring blocker escalation', () => {
  const result = run([buildSynthesis({ category: 'RECURRING_FAILURE_MODE', reviewRequired: false })]);
  expect(result.signals.some((s) => s.signalType === 'RECURRING_BLOCKER_ESCALATION')).toBe(true);
});

test('stakeholder gravity -> stakeholder gravity shift', () => {
  const result = run([buildSynthesis({ category: 'STAKEHOLDER_GRAVITY', reviewRequired: false })]);
  expect(result.signals.some((s) => s.signalType === 'STAKEHOLDER_GRAVITY_SHIFT')).toBe(true);
});

test('policy impact -> policy dependency pressure', () => {
  const result = run([buildSynthesis({ category: 'POLICY_IMPACT', reviewRequired: false })]);
  expect(result.signals.some((s) => s.signalType === 'POLICY_DEPENDENCY_PRESSURE')).toBe(true);
});

test('execution pattern -> execution pattern stabilized', () => {
  const result = run([buildSynthesis({ category: 'EXECUTION_PATTERN', reviewRequired: false })]);
  expect(result.signals.some((s) => s.signalType === 'EXECUTION_PATTERN_STABILIZED')).toBe(true);
});

test('governance promotion -> governance memory candidate', () => {
  const result = run([buildSynthesis({ promotedToGovernanceMemory: true, reviewRequired: false, auditRequired: false })]);
  expect(result.signals.some((s) => s.signalType === 'GOVERNANCE_MEMORY_CANDIDATE')).toBe(true);
});

test('AI context eligibility gating', () => {
  const eligible = run([buildSynthesis({ category: 'GOVERNANCE_SIGNAL', reviewRequired: false, auditRequired: false, confidenceScore: 0.9 })]);
  expect(eligible.signals.some((s) => s.signalType === 'AI_CONTEXT_READY')).toBe(true);
  const ineligible = run([buildSynthesis({ category: 'GOVERNANCE_SIGNAL', reviewRequired: true, confidenceScore: 0.9 })]);
  expect(ineligible.signals.some((s) => s.signalType === 'AI_CONTEXT_READY')).toBe(false);
});

test('cognitive query generation', () => {
  const result = run([buildSynthesis({})]);
  expect(result.queries.length).toBe(7);
  const q = result.queries.find((x) => x.queryType === 'WHAT_REQUIRES_HUMAN_REVIEW');
  expect(q).toBeDefined();
  expect(filterSignalsForQuery(result.signals, q!).length).toBeGreaterThan(0);
});

test('lineage preservation', () => {
  const result = run([buildSynthesis({ category: 'POLICY_IMPACT', reviewRequired: false })]);
  const signal = result.signals.find((s) => s.signalType === 'POLICY_DEPENDENCY_PRESSURE');
  expect(signal?.lineagePreserved).toBe(true);
  expect(signal?.sourceNutrientIds).toEqual(['n1']);
  expect(signal?.sourceMemoryIds).toContain('m1');
});

test('duplicate signal consolidation', () => {
  const result = run([buildSynthesis({ synthesisId: 's1', category: 'POLICY_IMPACT', reviewRequired: false }), buildSynthesis({ synthesisId: 's1', category: 'POLICY_IMPACT', reviewRequired: false })]);
  const filtered = result.signals.filter((s) => s.signalType === 'POLICY_DEPENDENCY_PRESSURE');
  expect(filtered.length).toBe(1);
  expect(consolidateDuplicateRuntimeSignals(filtered).length).toBe(1);
});
