import type {
  PolicyConflict,
  PolicyDecision,
  PolicyEffect,
  PolicyEvaluationContext,
  PolicyEvaluationTrace,
  PolicyRule,
  PolicyRuleEvaluation,
  PolicySet,
} from './types';

function compareRulePriority(a: PolicyRule, b: PolicyRule): number {
  return (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id);
}

export function evaluatePolicyRule(rule: PolicyRule, context: PolicyEvaluationContext): {
  evaluation: PolicyRuleEvaluation;
  conditionResults: Array<{ ruleId: string; conditionId: string; passed: boolean }>;
  indeterminate: boolean;
} {
  const conditions = rule.conditions ?? [];
  const conditionResults: Array<{ ruleId: string; conditionId: string; passed: boolean }> = [];
  for (const condition of conditions) {
    try {
      const passed = condition.evaluate(context);
      conditionResults.push({ ruleId: rule.id, conditionId: condition.id, passed });
      if (!passed) {
        return {
          evaluation: { ruleId: rule.id, category: rule.category, effect: 'abstain', matched: false, reasonCode: rule.reasonCode },
          conditionResults,
          indeterminate: false,
        };
      }
    } catch {
      conditionResults.push({ ruleId: rule.id, conditionId: condition.id, passed: false });
      return {
        evaluation: { ruleId: rule.id, category: rule.category, effect: 'abstain', matched: false, reasonCode: 'POLICY_CONDITION_EVALUATION_FAILED' },
        conditionResults,
        indeterminate: true,
      };
    }
  }
  return {
    evaluation: { ruleId: rule.id, category: rule.category, effect: rule.effect, matched: true, reasonCode: rule.reasonCode },
    conditionResults,
    indeterminate: false,
  };
}

export function classifyPolicyConflict(effects: PolicyEffect[], ruleIds: string[]): PolicyConflict | null {
  if (effects.includes('allow') && effects.includes('deny')) {
    return { conflictType: 'allow_vs_deny', ruleIds, reason: 'allow + deny = deny' };
  }
  return null;
}

export function mergePolicyDecisions(input: {
  protectedOperation: boolean;
  requiredCategories: string[];
  evaluations: PolicyRuleEvaluation[];
  indeterminate: boolean;
  obligations: PolicyDecision['obligations'];
  conflicts: PolicyConflict[];
}): PolicyDecision {
  const effects = input.evaluations.filter((e) => e.matched).map((e) => e.effect);
  const denies = effects.includes('deny');
  const allows = effects.includes('allow');

  const matchedCategories = new Set(input.evaluations.filter((e) => e.matched && e.effect === 'allow').map((e) => e.category));
  const missingRequiredCategory = input.requiredCategories.find((category) => !matchedCategories.has(category as never));

  if (denies) {
    return { outcome: 'denied', effect: 'deny', reasonCode: 'POLICY_DENY_OVERRIDES', obligations: input.obligations, conflicts: input.conflicts, evaluatedCategories: [...new Set(input.evaluations.map((e) => e.category))] };
  }
  if (input.indeterminate && input.protectedOperation) {
    return { outcome: 'denied', effect: 'deny', reasonCode: 'POLICY_INDETERMINATE_FAIL_CLOSED', obligations: input.obligations, conflicts: input.conflicts, evaluatedCategories: [...new Set(input.evaluations.map((e) => e.category))] };
  }
  if (allows && !missingRequiredCategory) {
    return { outcome: input.obligations.length > 0 ? 'conditional' : 'allowed', effect: 'allow', reasonCode: input.obligations.length > 0 ? 'POLICY_ALLOWED_WITH_OBLIGATIONS' : 'POLICY_ALLOWED', obligations: input.obligations, conflicts: input.conflicts, evaluatedCategories: [...new Set(input.evaluations.map((e) => e.category))] };
  }
  return { outcome: 'indeterminate', effect: 'abstain', reasonCode: missingRequiredCategory ? 'POLICY_REQUIRED_CATEGORY_UNMET' : 'POLICY_ABSTAIN', obligations: input.obligations, conflicts: input.conflicts, evaluatedCategories: [...new Set(input.evaluations.map((e) => e.category))] };
}

export function buildPolicyTrace(params: {
  visibility: PolicyEvaluationTrace['visibility'];
  evaluations: PolicyRuleEvaluation[];
  skippedRules: string[];
  conditionResults: PolicyEvaluationTrace['conditionsEvaluated'];
  decision: PolicyDecision;
  traceId: string;
  evaluatedAt?: Date;
}): PolicyEvaluationTrace {
  return {
    traceId: params.traceId,
    evaluatedRules: params.evaluations.map((e) => e.ruleId),
    matchedRules: params.evaluations.filter((e) => e.matched).map((e) => e.ruleId),
    skippedRules: params.skippedRules,
    conditionsEvaluated: params.conditionResults,
    obligations: params.decision.obligations.map((o) => o.id),
    conflicts: params.decision.conflicts,
    finalDecision: params.decision.outcome,
    decisionReason: params.decision.reasonCode,
    evaluatedAt: (params.evaluatedAt ?? new Date()).toISOString(),
    visibility: params.visibility,
  };
}

export function evaluatePolicySet(policySet: PolicySet, context: PolicyEvaluationContext) {
  const sortedRules = [...policySet.rules].sort(compareRulePriority);
  const evaluations: PolicyRuleEvaluation[] = [];
  const conditionResults: PolicyEvaluationTrace['conditionsEvaluated'] = [];
  let indeterminate = false;
  for (const rule of sortedRules) {
    const result = evaluatePolicyRule(rule, context);
    evaluations.push(result.evaluation);
    conditionResults.push(...result.conditionResults);
    indeterminate = indeterminate || result.indeterminate;
  }

  const conflicts: PolicyConflict[] = [];
  const conflict = classifyPolicyConflict(evaluations.filter((e) => e.matched).map((e) => e.effect), evaluations.filter((e) => e.matched).map((e) => e.ruleId));
  if (conflict) {
    conflicts.push(conflict);
  }

  const obligations = sortedRules
    .filter((rule) => evaluations.some((evaluation) => evaluation.ruleId === rule.id && evaluation.matched))
    .flatMap((rule) => rule.obligations ?? []);

  const decision = mergePolicyDecisions({
    protectedOperation: context.action.protectedOperation ?? true,
    requiredCategories: context.requiredCategories ?? policySet.categories,
    evaluations,
    indeterminate,
    obligations,
    conflicts,
  });

  return {
    decision,
    trace: buildPolicyTrace({
      visibility: 'internal',
      evaluations,
      skippedRules: evaluations.filter((e) => !e.matched).map((e) => e.ruleId),
      conditionResults,
      decision,
      traceId: `${policySet.id}:${context.subject.id}:${context.action.verb}`,
      evaluatedAt: context.now,
    }),
  };
}

export function normalizePolicyDecision(outcome: PolicyDecision['outcome']): 'allow' | 'deny' {
  return outcome === 'allowed' || outcome === 'conditional' ? 'allow' : 'deny';
}
