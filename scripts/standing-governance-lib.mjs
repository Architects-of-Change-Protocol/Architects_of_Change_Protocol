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

export const STANDING_CONSTITUTION_FILE = 'docs/constitution/STANDING-CONSTITUTION.md';
export const STANDING_AUTHORITY_FILE = 'docs/constitution/STANDING-AUTHORITIES.md';
export const STANDING_LIFECYCLE_FILE = 'docs/constitution/STANDING-LIFECYCLE.md';
export const STANDING_ELIGIBILITY_FILE = 'docs/constitution/STANDING-ELIGIBILITY-POLICY.md';
export const STANDING_DELEGATION_FILE = 'docs/constitution/STANDING-DELEGATION-POLICY.md';
export const STANDING_REPRESENTATION_FILE = 'docs/constitution/STANDING-REPRESENTATION-POLICY.md';
export const STANDING_REVOCATION_FILE = 'docs/constitution/STANDING-REVOCATION-POLICY.md';
export const STANDING_VIOLATION_FILE = 'docs/constitution/STANDING-VIOLATION-CATALOG.md';

export const STANDING_GOVERNANCE_FILES = Object.freeze([
  STANDING_CONSTITUTION_FILE, STANDING_AUTHORITY_FILE, STANDING_LIFECYCLE_FILE,
  STANDING_ELIGIBILITY_FILE, STANDING_DELEGATION_FILE, STANDING_REPRESENTATION_FILE,
  STANDING_REVOCATION_FILE, STANDING_VIOLATION_FILE,
]);
export const VALID_STANDING_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_STANDING_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_STANDING_STATES = Object.freeze(['Proposed', 'Pending Validation', 'Active', 'Suspended', 'Revoked', 'Retired']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Identity Failure', 'Eligibility Failure', 'Evidence Failure', 'Constitutional Override', 'Voluntary Withdrawal']);
export const STANDING_TRANSITIONS = new Map([
  ['Proposed', new Set(['Pending Validation'])],
  ['Pending Validation', new Set(['Active', 'Revoked'])],
  ['Active', new Set(['Suspended', 'Revoked', 'Retired'])],
  ['Suspended', new Set(['Active', 'Revoked', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const standingRecords = (root) => markdownTable(readText(root, STANDING_AUTHORITY_FILE), 'Standing authority catalog');
export const eligibilityRecords = (root) => markdownTable(readText(root, STANDING_ELIGIBILITY_FILE), 'Eligibility policy registry');
export const lifecycleRecords = (root) => markdownTable(readText(root, STANDING_LIFECYCLE_FILE), 'Standing lifecycle transition ledger');
export const delegationPermissions = (root) => markdownTable(readText(root, STANDING_DELEGATION_FILE), 'Delegation permissions');
export const delegationRecords = (root) => markdownTable(readText(root, STANDING_DELEGATION_FILE), 'Delegation registry');
export const representationPermissions = (root) => markdownTable(readText(root, STANDING_REPRESENTATION_FILE), 'Representation permissions');
export const representationRecords = (root) => markdownTable(readText(root, STANDING_REPRESENTATION_FILE), 'Representation registry');
export const revocationRecords = (root) => markdownTable(readText(root, STANDING_REVOCATION_FILE), 'Revocation registry');

export function standingViolation(path, message, id = 'STD-V-010') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen = new Set(); const dup = new Set(); for (const value of values.filter(Boolean)) { if (seen.has(value)) dup.add(value); seen.add(value); } return [...dup]; }
export function ratifiedStandingAmendments(root) {
  return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /\*\*Type:\*\*\s*Type [BC]/.test(record.body));
}
export function requireStandingFiles(root, violations) { for (const file of STANDING_GOVERNANCE_FILES) requireFile(root, file, violations, 'required standing governance artifact is missing'); }
export function validateStandingVersionParity(root, violations) {
  const version = currentConstitutionVersion(root);
  for (const file of STANDING_GOVERNANCE_FILES) {
    const text = readText(root, file);
    if (text !== null && version && versionFromText(text) !== version) violations.push(standingViolation(file, `declares ${versionFromText(text) ?? 'no Constitution version'} instead of ${version}`));
  }
}
export function validateStandingCatalog(root, violations) {
  const records = standingRecords(root); const amendments = new Set(ratifiedStandingAmendments(root).map((r) => r.id)); const owners = authorityNames(root);
  if (!records.length) violations.push(standingViolation(STANDING_AUTHORITY_FILE, 'standing authority catalog contains no records', 'STD-V-001'));
  for (const duplicate of duplicated(records.map((r) => r['Standing ID']))) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `duplicate standing ID '${duplicate}'`, 'STD-V-001'));
  for (const record of records) {
    const id=record['Standing ID'];
    if (!/^STD-\d{4}$/.test(id)) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `invalid standing ID '${id}'`, 'STD-V-001'));
    if (!record['Standing Name']) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} is missing a standing name`, 'STD-V-001'));
    if (!VALID_STANDING_CLASSES.includes(record['Standing Class'])) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} has invalid standing class '${record['Standing Class']}'`, 'STD-V-001'));
    if (!owners.has(record.Owner)) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} has invalid owner '${record.Owner}'`, 'STD-V-001'));
    if (!/^SEP-\d{4}$/.test(record['Eligibility Policy'])) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} has invalid eligibility policy '${record['Eligibility Policy']}'`, 'STD-V-003'));
    for (const field of ['Delegable','Representable','Revocable']) if (!['Yes','No'].includes(record[field])) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} has invalid ${field.toLowerCase()} posture '${record[field]}'`, 'STD-V-001'));
    if (!amendments.has(record['Creation Amendment'])) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} creation amendment '${record['Creation Amendment']}' is not a ratified Type B or Type C amendment`, 'STD-V-001'));
    if (!record['Retirement Amendment']) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} is missing retirement amendment`, 'STD-V-001'));
    if (!VALID_STANDING_STATUSES.includes(record.Status)) violations.push(standingViolation(STANDING_AUTHORITY_FILE, `${id} has invalid status '${record.Status}'`, 'STD-V-001'));
  }
}
