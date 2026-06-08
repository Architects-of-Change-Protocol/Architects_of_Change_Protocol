#!/usr/bin/env node
import { DECISION_LIFECYCLE_FILE, DECISION_TRANSITIONS, decisionRecords, decisionViolation, lifecycleRecords, ratifiedDecisionAmendments } from './decision-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanDecisionLifecycle(root) {
  const violations = [];
  const decisions = new Map(decisionRecords(root).map((decision) => [decision['Decision ID'], decision]));
  const amendments = new Set(ratifiedDecisionAmendments(root).map((record) => record.id));
  const state = new Map();
  for (const transition of lifecycleRecords(root)) {
    const id = transition['Transition ID'];
    const decisionId = transition['Decision ID'];
    if (!/^DLT-\d{4}$/.test(id)) violations.push(decisionViolation(DECISION_LIFECYCLE_FILE, `invalid transition ID '${id}'`, 'DEC-V-006'));
    if (!decisions.has(decisionId)) { violations.push(decisionViolation(DECISION_LIFECYCLE_FILE, `${id} references unknown decision '${decisionId}'`, 'DEC-V-006')); continue; }
    if (!DECISION_TRANSITIONS.get(transition.From)?.has(transition.To)) violations.push(decisionViolation(DECISION_LIFECYCLE_FILE, `${id} contains invalid lifecycle transition '${transition.From}' → '${transition.To}'`, 'DEC-V-006'));
    if (state.has(decisionId) && state.get(decisionId) !== transition.From) violations.push(decisionViolation(DECISION_LIFECYCLE_FILE, `${id} starts at '${transition.From}' instead of prior state '${state.get(decisionId)}'`, 'DEC-V-006'));
    if (!amendments.has(transition.Amendment)) violations.push(decisionViolation(DECISION_LIFECYCLE_FILE, `${id} lacks a ratified Type B or Type C amendment`, 'DEC-V-006'));
    state.set(decisionId, transition.To);
  }
  for (const [id, decision] of decisions) if (state.get(id) !== decision['Lifecycle State']) violations.push(decisionViolation(DECISION_LIFECYCLE_FILE, `${id} catalog state '${decision['Lifecycle State']}' does not match lifecycle ledger '${state.get(id) ?? 'missing'}'`, 'DEC-V-006'));
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Decision lifecycle scanner', scanDecisionLifecycle);
