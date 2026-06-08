#!/usr/bin/env node
import { DECISION_APPEALS_FILE, appealRecords, decisionRecords, decisionViolation, duplicated, ratifiedDecisionAmendments } from './decision-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanDecisionAppeals(root) {
  const violations = [];
  const decisions = new Map(decisionRecords(root).map((decision) => [decision['Decision ID'], decision]));
  const amendments = new Set(ratifiedDecisionAmendments(root).map((record) => record.id));
  const appeals = appealRecords(root);
  for (const duplicate of duplicated(appeals.map((record) => record['Appeal ID']))) violations.push(decisionViolation(DECISION_APPEALS_FILE, `duplicate appeal ID '${duplicate}'`, 'DEC-V-005'));
  for (const appeal of appeals) {
    const id = appeal['Appeal ID'];
    const decision = decisions.get(appeal['Decision ID']);
    if (!/^APL-\d{4}$/.test(id)) violations.push(decisionViolation(DECISION_APPEALS_FILE, `invalid appeal ID '${id}'`, 'DEC-V-005'));
    if (!decision) violations.push(decisionViolation(DECISION_APPEALS_FILE, `${id} references unknown decision '${appeal['Decision ID']}'`, 'DEC-V-005'));
    else if (decision.Appealable !== 'Yes') violations.push(decisionViolation(DECISION_APPEALS_FILE, `${id} targets non-appealable decision '${appeal['Decision ID']}'`, 'DEC-V-005'));
    if (!appeal.Grounds) violations.push(decisionViolation(DECISION_APPEALS_FILE, `${id} has no grounds`, 'DEC-V-005'));
    if (!appeal.Evidence) violations.push(decisionViolation(DECISION_APPEALS_FILE, `${id} has no evidence`, 'DEC-V-005'));
    if (!['Approved', 'Rejected', 'Revoked'].includes(appeal.Resolution)) violations.push(decisionViolation(DECISION_APPEALS_FILE, `${id} has invalid or missing resolution '${appeal.Resolution}'`, 'DEC-V-005'));
    if (!amendments.has(appeal.Amendment)) violations.push(decisionViolation(DECISION_APPEALS_FILE, `${id} lacks a ratified Type B or Type C amendment`, 'DEC-V-005'));
    if (appeal.Status !== 'Resolved') violations.push(decisionViolation(DECISION_APPEALS_FILE, `${id} has invalid status '${appeal.Status}'`, 'DEC-V-005'));
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Decision appeals scanner', scanDecisionAppeals);
