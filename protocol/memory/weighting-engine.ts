import {
  MemoryWeightDimensions,
  MemoryWeightPolicyThresholds,
  MemoryWeightReinforcementInput,
  MemoryWeightState,
  MemoryWeightUpdateInput
} from './types';

const DIMENSION_WEIGHTS: Record<keyof MemoryWeightDimensions, number> = {
  governanceImpact: 0.16,
  operationalRecurrence: 0.1,
  stakeholderAuthority: 0.11,
  legalSignificance: 0.14,
  referenceFrequency: 0.09,
  temporalFreshness: 0.07,
  crossDomainLinkage: 0.09,
  policyDependency: 0.11,
  contradictionPresence: -0.08,
  executionOutcomeImpact: 0.11
};

const REFERENCE_REINFORCEMENT_FACTOR = 1.75;
const EXEC_SUMMARY_REINFORCEMENT_FACTOR = 2.5;
const APPROVED_DECISION_PERMANENT_BOOST = 6;
const TRANSIENT_DAILY_DECAY = 0.8;
const NON_TRANSIENT_DAILY_DECAY = 0.2;
const MAX_SCORE = 100;
const MIN_SCORE = 0;

const clamp = (value: number, min = MIN_SCORE, max = MAX_SCORE): number => Math.max(min, Math.min(max, value));
const normalizeDimension = (value: number): number => clamp(value, 0, 10);

/**
 * Calculates a deterministic base memory score using a weighted linear model.
 *
 * Architecture note:
 * - We avoid probabilistic models and random tie-breaking.
 * - All dimensions are normalized into [0..10], then projected to [0..100].
 * - Contradiction is a negative dimension to prevent volatile/conflicting memory
 *   from dominating retrieval and retention decisions.
 */
export const calculateMemoryWeight = (dimensions: MemoryWeightDimensions): number => {
  let weightedTotal = 0;
  for (const key of Object.keys(DIMENSION_WEIGHTS) as Array<keyof MemoryWeightDimensions>) {
    const normalizedValue = normalizeDimension(dimensions[key]);
    weightedTotal += normalizedValue * DIMENSION_WEIGHTS[key];
  }
  return clamp(Math.round(weightedTotal * 10 * 100) / 100);
};

/**
 * Applies deterministic event-based reinforcements.
 *
 * Architecture note:
 * Reinforcement is additive, not multiplicative, so the same event stream always
 * produces the same terminal score independent of execution host.
 */
export const reinforceMemoryWeight = (
  state: MemoryWeightState,
  input: MemoryWeightReinforcementInput = {}
): MemoryWeightState => {
  const additionalReferences = Math.max(0, Math.floor(input.additionalReferences ?? 0));
  const additionalExecutiveSummaryLinks = Math.max(0, Math.floor(input.additionalExecutiveSummaryLinks ?? 0));
  const additionalApprovedDecisions = Math.max(0, Math.floor(input.additionalApprovedDecisions ?? 0));

  const reinforcementDelta =
    additionalReferences * REFERENCE_REINFORCEMENT_FACTOR +
    additionalExecutiveSummaryLinks * EXEC_SUMMARY_REINFORCEMENT_FACTOR +
    additionalApprovedDecisions * APPROVED_DECISION_PERMANENT_BOOST;

  return {
    ...state,
    referenceCount: state.referenceCount + additionalReferences,
    linkedExecutiveSummaryCount: state.linkedExecutiveSummaryCount + additionalExecutiveSummaryLinks,
    approvedDecisionCount: state.approvedDecisionCount + additionalApprovedDecisions,
    score: clamp(Math.round((state.score + reinforcementDelta) * 100) / 100)
  };
};

/**
 * Time-based decay. Unused transient context decays faster to privilege durable
 * protocol memory over ephemeral chatter.
 */
export const decayMemoryWeight = (state: MemoryWeightState, now: string): MemoryWeightState => {
  const lastAccess = new Date(state.lastAccessedAt).getTime();
  const nowTime = new Date(now).getTime();
  const elapsedMs = Math.max(0, nowTime - lastAccess);
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  const decayRate = state.isTransient ? TRANSIENT_DAILY_DECAY : NON_TRANSIENT_DAILY_DECAY;
  const decayAmount = elapsedDays * decayRate;

  return {
    ...state,
    score: clamp(Math.round((state.score - decayAmount) * 100) / 100)
  };
};

export const updateMemoryWeight = (state: MemoryWeightState, input: MemoryWeightUpdateInput): MemoryWeightState => {
  const dimensions: MemoryWeightDimensions = {
    ...state.dimensions,
    ...input.dimensions
  };

  const recalculatedBase = calculateMemoryWeight(dimensions);
  let nextState: MemoryWeightState = {
    ...state,
    dimensions,
    score: recalculatedBase,
    lastAccessedAt: input.lastAccessedAt ?? state.lastAccessedAt
  };

  nextState = reinforceMemoryWeight(nextState, {
    additionalReferences: input.referenced ? 1 : 0,
    additionalExecutiveSummaryLinks: input.linkedExecutiveSummary ? 1 : 0,
    additionalApprovedDecisions: input.approvedDecision ? 1 : 0
  });

  return nextState;
};

/**
 * Threshold classifier used by retention, retrieval, compression, and purge flows.
 */
export const classifyMemoryByPolicyThreshold = (
  score: number,
  thresholds: MemoryWeightPolicyThresholds
): 'retain_active' | 'archive' | 'compress' | 'purge' => {
  if (score >= thresholds.archivalThreshold) return 'retain_active';
  if (score >= thresholds.compressionThreshold) return 'archive';
  if (score >= thresholds.purgeThreshold) return 'compress';
  return 'purge';
};
