#!/usr/bin/env node
import { DECISION_EVIDENCE_FILE, decisionRecords, decisionViolation, duplicated, evidenceRecords, ratifiedDecisionAmendments } from './decision-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanDecisionEvidence(root) {
  const violations = [];
  const decisions = new Map(decisionRecords(root).map((decision) => [decision['Decision ID'], decision]));
  const amendments = new Set(ratifiedDecisionAmendments(root).map((record) => record.id));
  const evidence = evidenceRecords(root);
  for (const duplicate of duplicated(evidence.map((record) => record['Evidence ID']))) violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `duplicate evidence ID '${duplicate}'`, 'DEC-V-001'));
  const byId = new Map(evidence.map((record) => [record['Evidence ID'], record]));
  for (const record of evidence) {
    const id = record['Evidence ID'];
    if (!/^EVID-\d{4}$/.test(id)) violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `invalid evidence ID '${id}'`, 'DEC-V-001'));
    if (!decisions.has(record['Decision ID'])) violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `${id} references unknown decision '${record['Decision ID']}'`, 'DEC-V-001'));
    for (const field of ['Evidence Minimums', 'Evidence Sources', 'Evidence Traceability', 'Evidence Integrity']) if (!record[field]) violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `${id} is missing ${field}`, field.includes('Traceability') ? 'DEC-V-008' : 'DEC-V-001'));
    if (!amendments.has(record.Amendment)) violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `${id} lacks a ratified Type B or Type C amendment`, 'DEC-V-001'));
    if (record.Status !== 'Active') violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `${id} has invalid status '${record.Status}'`, 'DEC-V-001'));
  }
  for (const [id, decision] of decisions) {
    const record = byId.get(decision['Required Evidence']);
    if (!record) violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `${id} has no evidence requirement '${decision['Required Evidence']}'`, 'DEC-V-001'));
    else if (record['Decision ID'] !== id) violations.push(decisionViolation(DECISION_EVIDENCE_FILE, `${id} evidence requirement '${decision['Required Evidence']}' belongs to '${record['Decision ID']}'`, 'DEC-V-008'));
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Decision evidence scanner', scanDecisionEvidence);
