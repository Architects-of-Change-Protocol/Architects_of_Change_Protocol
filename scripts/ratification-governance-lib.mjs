import {
  AMENDMENT_CATALOG_FILE,
  amendmentRecordsFromText,
  currentConstitutionVersion,
  governanceViolation,
  readText,
  requireFile,
  versionFromText,
} from './constitutional-governance-lib.mjs';
import { authorityNames, markdownTable } from './capability-governance-lib.mjs';

export const RATIFICATION_CONSTITUTION_FILE = 'docs/constitution/RATIFICATION-CONSTITUTION.md';
export const RATIFICATION_AUTHORITY_FILE = 'docs/constitution/RATIFICATION-AUTHORITIES.md';
export const RATIFICATION_READINESS_POLICY_FILE = 'docs/constitution/RATIFICATION-READINESS-POLICY.md';
export const RATIFICATION_DECISION_POLICY_FILE = 'docs/constitution/RATIFICATION-DECISION-POLICY.md';
export const RATIFICATION_SIGNATURE_POLICY_FILE = 'docs/constitution/RATIFICATION-SIGNATURE-POLICY.md';
export const RATIFICATION_RELEASE_POLICY_FILE = 'docs/constitution/RATIFICATION-RELEASE-POLICY.md';
export const RATIFICATION_LIFECYCLE_FILE = 'docs/constitution/RATIFICATION-LIFECYCLE.md';
export const RATIFICATION_AMENDMENT_LOCK_POLICY_FILE = 'docs/constitution/RATIFICATION-AMENDMENT-LOCK-POLICY.md';
export const RATIFICATION_VIOLATION_FILE = 'docs/constitution/RATIFICATION-VIOLATION-CATALOG.md';
export const RATIFICATION_GOVERNANCE_FILES = Object.freeze([
  RATIFICATION_CONSTITUTION_FILE, RATIFICATION_AUTHORITY_FILE,
  RATIFICATION_READINESS_POLICY_FILE, RATIFICATION_DECISION_POLICY_FILE,
  RATIFICATION_SIGNATURE_POLICY_FILE, RATIFICATION_RELEASE_POLICY_FILE,
  RATIFICATION_LIFECYCLE_FILE, RATIFICATION_AMENDMENT_LOCK_POLICY_FILE,
  RATIFICATION_VIOLATION_FILE,
]);
export const VALID_RATIFICATION_AUTHORITY_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Certification']);
export const VALID_RATIFICATION_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_RATIFICATION_OUTCOMES = Object.freeze(['Ratified', 'Rejected', 'Deferred', 'Conditionally Ratified', 'Superseded']);
export const VALID_RATIFICATION_LIFECYCLE_STATES = Object.freeze(['Draft', 'Readiness Review', 'Pending Decision', 'Ratified', 'Released', 'Superseded', 'Rejected', 'Retired']);
export const VALID_READINESS_OUTCOMES = Object.freeze(['Ready', 'Not Ready', 'Conditionally Ready', 'Deferred']);

export const ratificationRecords = (root) => markdownTable(readText(root, RATIFICATION_AUTHORITY_FILE), 'Ratification authority catalog');
export const ratificationDecisionRecords = (root) => markdownTable(readText(root, RATIFICATION_DECISION_POLICY_FILE), 'Decision Registry');
export const ratificationSignatureRecords = (root) => markdownTable(readText(root, RATIFICATION_SIGNATURE_POLICY_FILE), 'Signature Registry');
export const ratificationReleaseRecords = (root) => markdownTable(readText(root, RATIFICATION_RELEASE_POLICY_FILE), 'Release Registry');
export const ratificationLifecycleRecords = (root) => markdownTable(readText(root, RATIFICATION_LIFECYCLE_FILE), 'Ratification lifecycle transition ledger');

export function ratificationViolation(path, message, id = 'RAT-V-001') { return governanceViolation(path, `${id} ${message}`); }
export function ratificationAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Ratif|RAT-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireRatificationFiles(root, violations) { for(const file of RATIFICATION_GOVERNANCE_FILES) requireFile(root, file, violations, 'required ratification governance artifact is missing'); }
export function validateRatificationVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of RATIFICATION_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(ratificationViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`,'RAT-V-009'));} }

export function validateRatificationAuthorityCatalog(root, violations) {
  const records=ratificationRecords(root), amendments=new Set(ratificationAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(ratificationViolation(RATIFICATION_AUTHORITY_FILE,'ratification authority catalog contains no records','RAT-V-001'));
  for(const r of records){const id=r['Ratification Authority ID'];
    if(!/^RAT-\d{4}$/.test(id)) violations.push(ratificationViolation(RATIFICATION_AUTHORITY_FILE,`invalid ratification authority ID '${id}'`,'RAT-V-001'));
    if(!r['Ratification Authority Name']) violations.push(ratificationViolation(RATIFICATION_AUTHORITY_FILE,`${id} is missing a ratification authority name`,'RAT-V-001'));
    if(!VALID_RATIFICATION_AUTHORITY_CLASSES.includes(r['Authority Class'])) violations.push(ratificationViolation(RATIFICATION_AUTHORITY_FILE,`${id} has invalid authority class '${r['Authority Class']}'`,'RAT-V-001'));
    if(!owners.has(r.Owner)) violations.push(ratificationViolation(RATIFICATION_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'RAT-V-001'));
    if(!amendments.has(r.Amendment)) violations.push(ratificationViolation(RATIFICATION_AUTHORITY_FILE,`${id} amendment '${r.Amendment}' is not a ratified ratification amendment`,'RAT-V-010'));
    if(!VALID_RATIFICATION_STATUSES.includes(r.Status)) violations.push(ratificationViolation(RATIFICATION_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'RAT-V-001'));
  }
}

export function validateRatificationReadiness(root, violations) {
  const text = readText(root, RATIFICATION_READINESS_POLICY_FILE);
  if (!text) { violations.push(ratificationViolation(RATIFICATION_READINESS_POLICY_FILE, 'ratification readiness policy is missing', 'RAT-V-003')); return; }
  const required = ['All constitutional domains exist', 'All constitutional artifacts declare the same version', 'All amendments are cataloged', 'All scanners pass', 'All tests pass', 'Audit matrix complete', 'Gap analysis complete', 'Integrity report complete', 'No critical audit findings remain open'];
  for (const req of required) { if (!text.includes(req)) violations.push(ratificationViolation(RATIFICATION_READINESS_POLICY_FILE, `missing readiness requirement '${req}'`, 'RAT-V-003')); }
}

export function validateRatificationDecisions(root, violations) {
  const text = readText(root, RATIFICATION_DECISION_POLICY_FILE);
  if (!text) { violations.push(ratificationViolation(RATIFICATION_DECISION_POLICY_FILE, 'ratification decision policy is missing', 'RAT-V-004')); return; }
  const required = ['Decision ID', 'Constitution Version', 'Ratification Authority', 'Audit Reference', 'Readiness Reference', 'Integrity Reference', 'Outcome', 'Rationale', 'Effective Date', 'Status'];
  for (const field of required) { if (!text.includes(field)) violations.push(ratificationViolation(RATIFICATION_DECISION_POLICY_FILE, `missing decision field '${field}'`, 'RAT-V-004')); }
  for (const outcome of VALID_RATIFICATION_OUTCOMES) { if (!text.includes(outcome)) violations.push(ratificationViolation(RATIFICATION_DECISION_POLICY_FILE, `missing valid outcome '${outcome}'`, 'RAT-V-004')); }
}

export function validateRatificationSignatures(root, violations) {
  const text = readText(root, RATIFICATION_SIGNATURE_POLICY_FILE);
  if (!text) { violations.push(ratificationViolation(RATIFICATION_SIGNATURE_POLICY_FILE, 'ratification signature policy is missing', 'RAT-V-005')); return; }
  const required = ['Signature ID', 'Signer', 'Signer Authority', 'Constitution Version', 'Ratification Decision', 'Timestamp', 'Integrity Reference', 'Status'];
  for (const field of required) { if (!text.includes(field)) violations.push(ratificationViolation(RATIFICATION_SIGNATURE_POLICY_FILE, `missing signature field '${field}'`, 'RAT-V-005')); }
}

export function validateRatificationRelease(root, violations) {
  const text = readText(root, RATIFICATION_RELEASE_POLICY_FILE);
  if (!text) { violations.push(ratificationViolation(RATIFICATION_RELEASE_POLICY_FILE, 'ratification release policy is missing', 'RAT-V-006')); return; }
  const required = ['Release ID', 'Constitution Version', 'Ratification Decision', 'Release Date', 'Release Artifacts', 'Integrity Reference', 'Supersession Rule', 'Status'];
  for (const field of required) { if (!text.includes(field)) violations.push(ratificationViolation(RATIFICATION_RELEASE_POLICY_FILE, `missing release field '${field}'`, 'RAT-V-006')); }
  const artifacts = ['CONSTITUTION.md', 'AOC-CONSTITUTION-v1.0.md', 'AMENDMENT-CATALOG.md', 'CONSTITUTION-VERSION-HISTORY.md', 'CONSTITUTIONAL-AUDIT-MATRIX.md', 'CONSTITUTIONAL-GAP-ANALYSIS.md', 'CONSTITUTIONAL-INTEGRITY-REPORT.md'];
  for (const artifact of artifacts) { if (!text.includes(artifact)) violations.push(ratificationViolation(RATIFICATION_RELEASE_POLICY_FILE, `missing release artifact '${artifact}'`, 'RAT-V-006')); }
}

export function validateRatificationLifecycle(root, violations) {
  const text = readText(root, RATIFICATION_LIFECYCLE_FILE);
  if (!text) { violations.push(ratificationViolation(RATIFICATION_LIFECYCLE_FILE, 'ratification lifecycle is missing', 'RAT-V-001')); return; }
  for (const state of VALID_RATIFICATION_LIFECYCLE_STATES) { if (!text.includes(state)) violations.push(ratificationViolation(RATIFICATION_LIFECYCLE_FILE, `missing lifecycle state '${state}'`, 'RAT-V-001')); }
}

export function validateRatificationAmendmentLock(root, violations) {
  const text = readText(root, RATIFICATION_AMENDMENT_LOCK_POLICY_FILE);
  if (!text) { violations.push(ratificationViolation(RATIFICATION_AMENDMENT_LOCK_POLICY_FILE, 'ratification amendment lock policy is missing', 'RAT-V-008')); return; }
  const required = ['No new constitutional domain may be introduced during ratification', 'v1.0 becomes the sovereign baseline', 'amendment process'];
  for (const req of required) { if (!text.includes(req)) violations.push(ratificationViolation(RATIFICATION_AMENDMENT_LOCK_POLICY_FILE, `missing amendment lock rule '${req}'`, 'RAT-V-008')); }
}

export function validateRatificationViolations(root, violations) {
  const text = readText(root, RATIFICATION_VIOLATION_FILE);
  if (!text) { violations.push(ratificationViolation(RATIFICATION_VIOLATION_FILE, 'ratification violation catalog is missing', 'RAT-V-001')); return; }
  const required = ['RAT-V-001', 'RAT-V-002', 'RAT-V-003', 'RAT-V-004', 'RAT-V-005', 'RAT-V-006', 'RAT-V-007', 'RAT-V-008', 'RAT-V-009', 'RAT-V-010', 'RAT-V-011', 'RAT-V-012'];
  for (const vid of required) { if (!text.includes(vid)) violations.push(ratificationViolation(RATIFICATION_VIOLATION_FILE, `missing violation ID '${vid}'`, 'RAT-V-001')); }
}
