#!/usr/bin/env node
import { DECISION_EXPLAINABILITY_FILE, decisionRecords, decisionViolation, duplicated, explanationRecords, ratifiedDecisionAmendments } from './decision-governance-lib.mjs';
import { capabilityRecords } from './capability-governance-lib.mjs';
import { activePolicies } from './policy-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanDecisionExplainability(root) {
  const violations = [];
  const decisions = new Map(decisionRecords(root).map((decision) => [decision['Decision ID'], decision]));
  const capabilities = new Set(capabilityRecords(root).map((record) => record['Capability ID']));
  const policies = new Set(activePolicies(root).map((record) => record['Policy ID']));
  const amendments = new Set(ratifiedDecisionAmendments(root).map((record) => record.id));
  const explanations = explanationRecords(root);
  for (const duplicate of duplicated(explanations.map((record) => record['Explanation ID']))) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `duplicate explanation ID '${duplicate}'`, 'DEC-V-003'));
  const byDecision = new Map(explanations.map((record) => [record['Decision ID'], record]));
  for (const explanation of explanations) {
    const id = explanation['Explanation ID'];
    if (!/^DEX-\d{4}$/.test(id)) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `invalid explanation ID '${id}'`, 'DEC-V-003'));
    if (!decisions.has(explanation['Decision ID'])) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} references unknown decision '${explanation['Decision ID']}'`, 'DEC-V-003'));
    if (!/^EVID-\d{4}$/.test(explanation['Evidence Used'])) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} is missing valid evidence used`, 'DEC-V-003'));
    if (!policies.has(explanation['Policies Applied'])) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} has missing or unknown policy chain '${explanation['Policies Applied']}'`, 'DEC-V-002'));
    if (!capabilities.has(explanation['Capabilities Used'])) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} has missing or unknown capability '${explanation['Capabilities Used']}'`, 'DEC-V-008'));
    if (!explanation['Authority Chain']) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} is missing authority chain`, 'DEC-V-008'));
    if (!explanation.Outcome || !explanation['Reasoning Summary']) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} is missing outcome or reasoning summary`, 'DEC-V-003'));
    if (!amendments.has(explanation.Amendment)) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} lacks a ratified Type B or Type C amendment`, 'DEC-V-003'));
    if (explanation.Status !== 'Complete') violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `${id} has invalid status '${explanation.Status}'`, 'DEC-V-003'));
  }
  for (const [id, decision] of decisions) if (decision['Lifecycle State'] === 'Approved' && !byDecision.has(id)) violations.push(decisionViolation(DECISION_EXPLAINABILITY_FILE, `approved decision ${id} has no explanation`, 'DEC-V-003'));
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Decision explainability scanner', scanDecisionExplainability);
