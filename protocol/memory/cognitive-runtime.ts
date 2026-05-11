import { createHash } from 'crypto';
import type { ExecutiveSynthesisRecord } from './executive-synthesis-engine';
import type { MemoryNutrient } from './nutrient-engine';

/**
 * Sovereign Cognitive Runtime
 * ---------------------------
 * Deterministic orchestration layer that transforms executive syntheses,
 * nutrient evidence, and memory evidence into governance-safe runtime signals.
 *
 * Design invariants:
 * - No AI calls.
 * - No storage assumptions.
 * - No vector DB assumptions.
 * - Pure deterministic transformations.
 * - Full lineage preservation for auditability.
 */
export const COGNITIVE_RUNTIME_SIGNAL_TYPES = [
  'OPERATIONAL_TRUTH_DRIFT',
  'STAKEHOLDER_GRAVITY_SHIFT',
  'RECURRING_BLOCKER_ESCALATION',
  'GOVERNANCE_CONTRADICTION',
  'STRATEGIC_RISK_CONVERGENCE',
  'POLICY_DEPENDENCY_PRESSURE',
  'EXECUTION_PATTERN_STABILIZED',
  'GOVERNANCE_MEMORY_CANDIDATE',
  'AI_CONTEXT_READY',
  'HUMAN_REVIEW_REQUIRED'
] as const;

export type CognitiveRuntimeSignalType = (typeof COGNITIVE_RUNTIME_SIGNAL_TYPES)[number];
export type CognitiveQueryType =
  | 'WHAT_TRUTHS_ARE_DRIFTING'
  | 'WHICH_STAKEHOLDERS_ARE_INFLUENTIAL'
  | 'WHAT_BLOCKERS_ARE_RECURRING'
  | 'WHICH_RISKS_ARE_CONVERGING'
  | 'WHAT_REQUIRES_HUMAN_REVIEW'
  | 'WHAT_IS_READY_FOR_AI_CONTEXT'
  | 'WHAT_SHOULD_PROMOTE_TO_GOVERNANCE';

export type CognitiveRuntimePolicy = {
  aiContextConfidenceThreshold: number;
  governanceCandidateConfidenceThreshold: number;
  humanReviewSeverityThreshold: number;
  truthDriftConfidenceDropThreshold: number;
  riskConvergenceMinSharedEvidence: number;
  minimumSignalConfidence: number;
};

export type CognitiveRuntimeInput = {
  syntheses: ReadonlyArray<ExecutiveSynthesisRecord>;
  nutrients: ReadonlyArray<MemoryNutrient>;
  memories: ReadonlyArray<{ memoryId: string }>;
  now: string;
  policy: CognitiveRuntimePolicy;
};

export type CognitiveRuntimeSignal = {
  signalId: string;
  signalType: CognitiveRuntimeSignalType;
  sourceSynthesisIds: string[];
  sourceNutrientIds: string[];
  sourceMemoryIds: string[];
  createdAt: string;
  confidenceScore: number;
  severity: number;
  explanation: string;
  recommendedAction: string;
  auditRequired: boolean;
  lineagePreserved: boolean;
  humanReviewRequired: boolean;
  aiContextEligible: boolean;
};

export type CognitiveQuery = {
  queryId: string;
  queryType: CognitiveQueryType;
  createdAt: string;
  requiredSignalTypes: CognitiveRuntimeSignalType[];
  minimumConfidence: number;
  includeAuditRequired: boolean;
  requireHumanReviewExclusion: boolean;
  explanation: string;
};

export type CognitiveRuntimeResult = {
  signals: CognitiveRuntimeSignal[];
  queries: CognitiveQuery[];
};

const round2 = (v: number): number => Math.round(v * 100) / 100;
const uniqueSorted = (items: string[]): string[] => [...new Set(items)].sort();

const buildId = (prefix: string, material: string): string => `${prefix}-${createHash('sha256').update(material).digest('hex').slice(0, 16)}`;

export const shouldRequireHumanReview = (
  synthesis: ExecutiveSynthesisRecord,
  signalType: CognitiveRuntimeSignalType,
  severity: number,
  policy: CognitiveRuntimePolicy
): boolean => synthesis.reviewRequired || signalType === 'HUMAN_REVIEW_REQUIRED' || signalType === 'GOVERNANCE_CONTRADICTION' || severity >= policy.humanReviewSeverityThreshold;

export const shouldBeAiContextEligible = (
  synthesis: ExecutiveSynthesisRecord,
  confidenceScore: number,
  humanReviewRequired: boolean,
  policy: CognitiveRuntimePolicy
): boolean => confidenceScore >= policy.aiContextConfidenceThreshold && synthesis.lineagePreserved && !humanReviewRequired;

export const buildRuntimeLineage = (
  synthesis: ExecutiveSynthesisRecord,
  nutrientsById: ReadonlyMap<string, MemoryNutrient>
): Pick<CognitiveRuntimeSignal, 'sourceSynthesisIds' | 'sourceNutrientIds' | 'sourceMemoryIds'> => {
  const sourceNutrientIds = uniqueSorted(synthesis.sourceNutrientIds);
  const sourceMemoryIds = uniqueSorted([
    ...synthesis.sourceMemoryIds,
    ...sourceNutrientIds.flatMap((id) => nutrientsById.get(id)?.sourceMemoryIds ?? [])
  ]);
  return { sourceSynthesisIds: [synthesis.synthesisId], sourceNutrientIds, sourceMemoryIds };
};

export const classifyRuntimeSignalType = (
  synthesis: ExecutiveSynthesisRecord,
  input: CognitiveRuntimeInput,
  nutrientsById: ReadonlyMap<string, MemoryNutrient>
): CognitiveRuntimeSignalType[] => {
  const types: CognitiveRuntimeSignalType[] = [];
  if (synthesis.category === 'CONTRADICTION_REQUIRES_REVIEW') types.push('GOVERNANCE_CONTRADICTION', 'HUMAN_REVIEW_REQUIRED');
  if (synthesis.category === 'RECURRING_FAILURE_MODE') types.push('RECURRING_BLOCKER_ESCALATION');
  if (synthesis.category === 'STAKEHOLDER_GRAVITY') types.push('STAKEHOLDER_GRAVITY_SHIFT');
  if (synthesis.category === 'POLICY_IMPACT') types.push('POLICY_DEPENDENCY_PRESSURE');
  if (synthesis.category === 'EXECUTION_PATTERN') types.push('EXECUTION_PATTERN_STABILIZED');
  if (synthesis.promotedToGovernanceMemory) types.push('GOVERNANCE_MEMORY_CANDIDATE');

  if (synthesis.category === 'ORGANIZATIONAL_TRUTH') {
    const contradictionLinked = synthesis.sourceNutrientIds.some((id) => nutrientsById.get(id)?.nutrientType === 'CONTRADICTION_CLUSTER');
    if (synthesis.confidenceScore <= input.policy.truthDriftConfidenceDropThreshold || contradictionLinked) types.push('OPERATIONAL_TRUTH_DRIFT');
  }

  if (synthesis.category === 'STRATEGIC_RISK') {
    const shared = input.syntheses.some((other) => other.synthesisId !== synthesis.synthesisId && other.category === 'STRATEGIC_RISK' && (
      other.sourceMemoryIds.filter((id) => synthesis.sourceMemoryIds.includes(id)).length +
      other.sourceNutrientIds.filter((id) => synthesis.sourceNutrientIds.includes(id)).length
    ) >= input.policy.riskConvergenceMinSharedEvidence);
    if (shared) types.push('STRATEGIC_RISK_CONVERGENCE');
  }

  return uniqueSorted(types) as CognitiveRuntimeSignalType[];
};

export const calculateRuntimeSignalConfidence = (synthesis: ExecutiveSynthesisRecord, signalType: CognitiveRuntimeSignalType): number => {
  const boost: Record<CognitiveRuntimeSignalType, number> = {
    OPERATIONAL_TRUTH_DRIFT: 0.04,
    STAKEHOLDER_GRAVITY_SHIFT: 0.03,
    RECURRING_BLOCKER_ESCALATION: 0.05,
    GOVERNANCE_CONTRADICTION: 0.08,
    STRATEGIC_RISK_CONVERGENCE: 0.06,
    POLICY_DEPENDENCY_PRESSURE: 0.04,
    EXECUTION_PATTERN_STABILIZED: 0.03,
    GOVERNANCE_MEMORY_CANDIDATE: 0.05,
    AI_CONTEXT_READY: 0.02,
    HUMAN_REVIEW_REQUIRED: 0.07
  };
  return round2(Math.min(1, synthesis.confidenceScore + boost[signalType]));
};

export const calculateRuntimeSignalSeverity = (signalType: CognitiveRuntimeSignalType, confidenceScore: number): number => {
  const base: Record<CognitiveRuntimeSignalType, number> = {
    OPERATIONAL_TRUTH_DRIFT: 0.7,
    STAKEHOLDER_GRAVITY_SHIFT: 0.5,
    RECURRING_BLOCKER_ESCALATION: 0.75,
    GOVERNANCE_CONTRADICTION: 0.95,
    STRATEGIC_RISK_CONVERGENCE: 0.85,
    POLICY_DEPENDENCY_PRESSURE: 0.68,
    EXECUTION_PATTERN_STABILIZED: 0.4,
    GOVERNANCE_MEMORY_CANDIDATE: 0.35,
    AI_CONTEXT_READY: 0.2,
    HUMAN_REVIEW_REQUIRED: 0.9
  };
  return round2(Math.min(1, base[signalType] * 0.7 + confidenceScore * 0.3));
};

export const consolidateDuplicateRuntimeSignals = (signals: ReadonlyArray<CognitiveRuntimeSignal>): CognitiveRuntimeSignal[] => {
  const map = new Map<string, CognitiveRuntimeSignal>();
  for (const signal of signals) {
    const key = `${signal.signalType}::${signal.sourceSynthesisIds.join('|')}`;
    const existing = map.get(key);
    if (!existing) { map.set(key, signal); continue; }
    map.set(key, {
      ...existing,
      sourceNutrientIds: uniqueSorted([...existing.sourceNutrientIds, ...signal.sourceNutrientIds]),
      sourceMemoryIds: uniqueSorted([...existing.sourceMemoryIds, ...signal.sourceMemoryIds]),
      confidenceScore: Math.max(existing.confidenceScore, signal.confidenceScore),
      severity: Math.max(existing.severity, signal.severity),
      auditRequired: existing.auditRequired || signal.auditRequired,
      humanReviewRequired: existing.humanReviewRequired || signal.humanReviewRequired,
      aiContextEligible: existing.aiContextEligible || signal.aiContextEligible,
      explanation: `${existing.explanation} ${signal.explanation}`.trim()
    });
  }
  return [...map.values()];
};

export const generateRuntimeSignals = (input: CognitiveRuntimeInput): CognitiveRuntimeSignal[] => {
  const nutrientsById = new Map(input.nutrients.map((n) => [n.nutrientId, n] as const));
  const signals: CognitiveRuntimeSignal[] = [];

  for (const synthesis of input.syntheses) {
    const signalTypes = classifyRuntimeSignalType(synthesis, input, nutrientsById);
    for (const signalType of signalTypes) {
      const confidenceScore = calculateRuntimeSignalConfidence(synthesis, signalType);
      if (confidenceScore < input.policy.minimumSignalConfidence) continue;
      const severity = calculateRuntimeSignalSeverity(signalType, confidenceScore);
      const humanReviewRequired = shouldRequireHumanReview(synthesis, signalType, severity, input.policy);
      const aiContextEligible = shouldBeAiContextEligible(synthesis, confidenceScore, humanReviewRequired, input.policy);
      const lineage = buildRuntimeLineage(synthesis, nutrientsById);

      signals.push({
        signalId: buildId('signal', `${signalType}::${lineage.sourceSynthesisIds.join('|')}::${lineage.sourceNutrientIds.join('|')}`),
        signalType,
        ...lineage,
        createdAt: input.now,
        confidenceScore,
        severity,
        explanation: `Deterministic runtime classification ${signalType} from ${synthesis.category}.`,
        recommendedAction: synthesis.recommendedAction,
        auditRequired: synthesis.auditRequired,
        lineagePreserved: synthesis.lineagePreserved,
        humanReviewRequired,
        aiContextEligible
      });
    }

    if (shouldBeAiContextEligible(synthesis, synthesis.confidenceScore, synthesis.reviewRequired, input.policy)) {
      const lineage = buildRuntimeLineage(synthesis, nutrientsById);
      signals.push({
        signalId: buildId('signal', `AI_CONTEXT_READY::${lineage.sourceSynthesisIds.join('|')}::${lineage.sourceNutrientIds.join('|')}`),
        signalType: 'AI_CONTEXT_READY',
        ...lineage,
        createdAt: input.now,
        confidenceScore: calculateRuntimeSignalConfidence(synthesis, 'AI_CONTEXT_READY'),
        severity: calculateRuntimeSignalSeverity('AI_CONTEXT_READY', synthesis.confidenceScore),
        explanation: 'Synthesis is high-confidence, lineage-preserved, and non-review-required.',
        recommendedAction: 'Eligible for bounded AI context envelope.',
        auditRequired: synthesis.auditRequired,
        lineagePreserved: synthesis.lineagePreserved,
        humanReviewRequired: false,
        aiContextEligible: true
      });
    }
  }

  return consolidateDuplicateRuntimeSignals(signals);
};

export const buildCognitiveQuery = (
  queryType: CognitiveQueryType,
  now: string,
  requiredSignalTypes: CognitiveRuntimeSignalType[],
  minimumConfidence: number,
  includeAuditRequired: boolean,
  requireHumanReviewExclusion: boolean,
  explanation: string
): CognitiveQuery => ({
  queryId: buildId('query', `${queryType}::${now}`),
  queryType,
  createdAt: now,
  requiredSignalTypes,
  minimumConfidence,
  includeAuditRequired,
  requireHumanReviewExclusion,
  explanation
});

export const filterSignalsForQuery = (signals: ReadonlyArray<CognitiveRuntimeSignal>, query: CognitiveQuery): CognitiveRuntimeSignal[] =>
  signals.filter((signal) =>
    query.requiredSignalTypes.includes(signal.signalType) &&
    signal.confidenceScore >= query.minimumConfidence &&
    (query.includeAuditRequired || !signal.auditRequired) &&
    (!query.requireHumanReviewExclusion || !signal.humanReviewRequired)
  );

export const generateCognitiveQueries = (input: CognitiveRuntimeInput): CognitiveQuery[] => [
  buildCognitiveQuery('WHAT_TRUTHS_ARE_DRIFTING', input.now, ['OPERATIONAL_TRUTH_DRIFT'], input.policy.minimumSignalConfidence, true, false, 'Track drifting organizational truths.'),
  buildCognitiveQuery('WHICH_STAKEHOLDERS_ARE_INFLUENTIAL', input.now, ['STAKEHOLDER_GRAVITY_SHIFT'], input.policy.minimumSignalConfidence, true, false, 'Track influential stakeholder shifts.'),
  buildCognitiveQuery('WHAT_BLOCKERS_ARE_RECURRING', input.now, ['RECURRING_BLOCKER_ESCALATION'], input.policy.minimumSignalConfidence, true, false, 'Track recurring blockers.'),
  buildCognitiveQuery('WHICH_RISKS_ARE_CONVERGING', input.now, ['STRATEGIC_RISK_CONVERGENCE'], input.policy.minimumSignalConfidence, true, false, 'Track risk convergence.'),
  buildCognitiveQuery('WHAT_REQUIRES_HUMAN_REVIEW', input.now, ['HUMAN_REVIEW_REQUIRED', 'GOVERNANCE_CONTRADICTION'], input.policy.minimumSignalConfidence, true, false, 'Collect human-gated governance signals.'),
  buildCognitiveQuery('WHAT_IS_READY_FOR_AI_CONTEXT', input.now, ['AI_CONTEXT_READY'], input.policy.aiContextConfidenceThreshold, true, true, 'Bounded non-review AI-eligible context.'),
  buildCognitiveQuery('WHAT_SHOULD_PROMOTE_TO_GOVERNANCE', input.now, ['GOVERNANCE_MEMORY_CANDIDATE'], input.policy.governanceCandidateConfidenceThreshold, true, false, 'Governance memory promotion candidates.')
];

export const runSovereignCognitiveRuntime = (input: CognitiveRuntimeInput): CognitiveRuntimeResult => ({
  signals: generateRuntimeSignals(input),
  queries: generateCognitiveQueries(input)
});
