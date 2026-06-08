import {
  AMENDMENT_CATALOG_FILE,
  amendmentRecordsFromText,
  currentConstitutionVersion,
  governanceViolation,
  readText,
  requireFile,
  versionFromText,
} from './constitutional-governance-lib.mjs';
import { authorityNames, capabilityRecords, markdownTable } from './capability-governance-lib.mjs';
import { activePolicies } from './policy-governance-lib.mjs';

export const DECISION_CONSTITUTION_FILE = 'docs/constitution/DECISION-CONSTITUTION.md';
export const DECISION_AUTHORITY_FILE = 'docs/constitution/DECISION-AUTHORITIES.md';
export const DECISION_LIFECYCLE_FILE = 'docs/constitution/DECISION-LIFECYCLE.md';
export const DECISION_EVIDENCE_FILE = 'docs/constitution/DECISION-EVIDENCE-POLICY.md';
export const DECISION_EXPLAINABILITY_FILE = 'docs/constitution/DECISION-EXPLAINABILITY-POLICY.md';
export const DECISION_APPEALS_FILE = 'docs/constitution/DECISION-APPEALS-POLICY.md';
export const DECISION_REVOCATION_FILE = 'docs/constitution/DECISION-REVOCATION-POLICY.md';
export const DECISION_VIOLATION_FILE = 'docs/constitution/DECISION-VIOLATION-CATALOG.md';

export const DECISION_GOVERNANCE_FILES = Object.freeze([
  DECISION_CONSTITUTION_FILE,
  DECISION_AUTHORITY_FILE,
  DECISION_LIFECYCLE_FILE,
  DECISION_EVIDENCE_FILE,
  DECISION_EXPLAINABILITY_FILE,
  DECISION_APPEALS_FILE,
  DECISION_REVOCATION_FILE,
  DECISION_VIOLATION_FILE,
]);
export const VALID_DECISION_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_DECISION_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_DECISION_STATES = Object.freeze(['Proposed', 'Pending Evidence', 'Pending Review', 'Approved', 'Rejected', 'Appealed', 'Revoked', 'Retired']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Evidence Invalid', 'Policy Invalid', 'Authority Invalid', 'Capability Revoked', 'Fraud', 'Constitutional Override']);
export const DECISION_TRANSITIONS = new Map([
  ['Proposed', new Set(['Pending Evidence'])],
  ['Pending Evidence', new Set(['Pending Review'])],
  ['Pending Review', new Set(['Approved', 'Rejected'])],
  ['Approved', new Set(['Appealed', 'Revoked', 'Retired'])],
  ['Rejected', new Set(['Appealed', 'Retired'])],
  ['Appealed', new Set(['Approved', 'Rejected', 'Revoked'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const decisionRecords = (root) => markdownTable(readText(root, DECISION_AUTHORITY_FILE), 'Decision catalog');
export const lifecycleRecords = (root) => markdownTable(readText(root, DECISION_LIFECYCLE_FILE), 'Lifecycle transition ledger');
export const evidenceRecords = (root) => markdownTable(readText(root, DECISION_EVIDENCE_FILE), 'Evidence requirements registry');
export const explanationRecords = (root) => markdownTable(readText(root, DECISION_EXPLAINABILITY_FILE), 'Explanation registry');
export const appealRecords = (root) => markdownTable(readText(root, DECISION_APPEALS_FILE), 'Appeal registry');
export const revocationRecords = (root) => markdownTable(readText(root, DECISION_REVOCATION_FILE), 'Revocation registry');

export function decisionViolation(path, message, id = 'DEC-V-010') {
  return governanceViolation(path, `${id} ${message}`);
}

export function duplicated(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function ratifiedDecisionAmendments(root) {
  return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) =>
    record.status === 'Ratified' && /\*\*Type:\*\*\s*Type [BC]/.test(record.body));
}

export function requireDecisionFiles(root, violations) {
  for (const file of DECISION_GOVERNANCE_FILES) requireFile(root, file, violations, 'required decision governance artifact is missing');
}

export function validateDecisionVersionParity(root, violations) {
  const version = currentConstitutionVersion(root);
  for (const file of DECISION_GOVERNANCE_FILES) {
    const text = readText(root, file);
    if (text !== null && version && versionFromText(text) !== version) {
      violations.push(decisionViolation(file, `declares ${versionFromText(text) ?? 'no Constitution version'} instead of ${version}`));
    }
  }
}

export function validateDecisionCatalog(root, violations) {
  const decisions = decisionRecords(root);
  const amendments = new Set(ratifiedDecisionAmendments(root).map((record) => record.id));
  const owners = authorityNames(root);
  const policies = new Set(activePolicies(root).map((record) => record['Policy ID']));

  if (decisions.length === 0) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, 'decision catalog contains no decision records', 'DEC-V-004'));
  for (const duplicate of duplicated(decisions.map((decision) => decision['Decision ID']))) {
    violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `duplicate decision ID '${duplicate}'`, 'DEC-V-004'));
  }
  for (const decision of decisions) {
    const id = decision['Decision ID'];
    if (!/^DEC-\d{4}$/.test(id)) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `invalid decision ID '${id}'`, 'DEC-V-004'));
    if (!decision['Decision Name']) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} is missing a decision name`, 'DEC-V-004'));
    if (!VALID_DECISION_CLASSES.includes(decision['Decision Class'])) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} has invalid decision class '${decision['Decision Class']}'`, 'DEC-V-004'));
    if (!owners.has(decision.Owner)) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} has invalid owner '${decision.Owner}'`, 'DEC-V-004'));
    if (!/^EVID-\d{4}$/.test(decision['Required Evidence'])) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} has invalid required evidence '${decision['Required Evidence']}'`, 'DEC-V-001'));
    if (!policies.has(decision['Required Policy Coverage'])) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} references unknown policy '${decision['Required Policy Coverage']}'`, 'DEC-V-002'));
    if (!['Yes', 'No'].includes(decision.Appealable)) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} has invalid appealability '${decision.Appealable}'`, 'DEC-V-004'));
    if (!['Yes', 'No'].includes(decision.Revocable)) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} has invalid revocability '${decision.Revocable}'`, 'DEC-V-004'));
    if (!amendments.has(decision['Creation Amendment'])) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} creation amendment '${decision['Creation Amendment']}' is not a ratified Type B or Type C amendment`, 'DEC-V-004'));
    if (!decision['Retirement Amendment']) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} is missing a retirement amendment disposition`, 'DEC-V-004'));
    if (!VALID_DECISION_STATUSES.includes(decision.Status)) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} has invalid status '${decision.Status}'`, 'DEC-V-004'));
    if (!VALID_DECISION_STATES.includes(decision['Lifecycle State'])) violations.push(decisionViolation(DECISION_AUTHORITY_FILE, `${id} has invalid lifecycle state '${decision['Lifecycle State']}'`, 'DEC-V-006'));
  }
}

export function validateRevocations(root, violations) {
  const decisions = new Map(decisionRecords(root).map((decision) => [decision['Decision ID'], decision]));
  const amendments = new Set(ratifiedDecisionAmendments(root).map((record) => record.id));
  for (const duplicate of duplicated(revocationRecords(root).map((record) => record['Revocation ID']))) {
    violations.push(decisionViolation(DECISION_REVOCATION_FILE, `duplicate revocation ID '${duplicate}'`, 'DEC-V-009'));
  }
  for (const revocation of revocationRecords(root)) {
    const id = revocation['Revocation ID'];
    const decision = decisions.get(revocation['Decision ID']);
    if (!/^DRV-\d{4}$/.test(id)) violations.push(decisionViolation(DECISION_REVOCATION_FILE, `invalid revocation ID '${id}'`, 'DEC-V-009'));
    if (!decision) violations.push(decisionViolation(DECISION_REVOCATION_FILE, `${id} references unknown decision '${revocation['Decision ID']}'`, 'DEC-V-009'));
    else if (decision.Revocable !== 'Yes') violations.push(decisionViolation(DECISION_REVOCATION_FILE, `${id} targets non-revocable decision '${revocation['Decision ID']}'`, 'DEC-V-009'));
    if (!VALID_REVOCATION_CAUSES.includes(revocation.Cause)) violations.push(decisionViolation(DECISION_REVOCATION_FILE, `${id} has invalid cause '${revocation.Cause}'`, 'DEC-V-009'));
    if (!revocation.Evidence || !revocation['Revoked By'] || !revocation['Effective Date']) violations.push(decisionViolation(DECISION_REVOCATION_FILE, `${id} is missing evidence, revoking authority, or effective date`, 'DEC-V-009'));
    if (!amendments.has(revocation.Amendment)) violations.push(decisionViolation(DECISION_REVOCATION_FILE, `${id} lacks a ratified Type B or Type C amendment`, 'DEC-V-009'));
    if (revocation.Status !== 'Revoked') violations.push(decisionViolation(DECISION_REVOCATION_FILE, `${id} has invalid status '${revocation.Status}'`, 'DEC-V-009'));
  }
}
