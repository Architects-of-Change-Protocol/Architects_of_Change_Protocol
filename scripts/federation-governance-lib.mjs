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

export const FEDERATION_CONSTITUTION_FILE = 'docs/constitution/FEDERATION-CONSTITUTION.md';
export const FEDERATION_AUTHORITY_FILE = 'docs/constitution/FEDERATION-AUTHORITIES.md';
export const FEDERATION_RECOGNITION_FILE = 'docs/constitution/FEDERATION-RECOGNITION-POLICY.md';
export const FEDERATION_TRUST_FILE = 'docs/constitution/FEDERATION-TRUST-POLICY.md';
export const FEDERATION_DELEGATION_FILE = 'docs/constitution/FEDERATION-DELEGATION-POLICY.md';
export const FEDERATION_CAPABILITY_FILE = 'docs/constitution/FEDERATION-CAPABILITY-POLICY.md';
export const FEDERATION_GOVERNANCE_FILE = 'docs/constitution/FEDERATION-GOVERNANCE-POLICY.md';
export const FEDERATION_LIFECYCLE_FILE = 'docs/constitution/FEDERATION-LIFECYCLE.md';
export const FEDERATION_CHALLENGE_FILE = 'docs/constitution/FEDERATION-CHALLENGE-POLICY.md';
export const FEDERATION_REVOCATION_FILE = 'docs/constitution/FEDERATION-REVOCATION-POLICY.md';
export const FEDERATION_VIOLATION_FILE = 'docs/constitution/FEDERATION-VIOLATION-CATALOG.md';
export const FEDERATION_GOVERNANCE_FILES = Object.freeze([
  FEDERATION_CONSTITUTION_FILE, FEDERATION_AUTHORITY_FILE, FEDERATION_RECOGNITION_FILE,
  FEDERATION_TRUST_FILE, FEDERATION_DELEGATION_FILE, FEDERATION_CAPABILITY_FILE,
  FEDERATION_GOVERNANCE_FILE, FEDERATION_LIFECYCLE_FILE, FEDERATION_CHALLENGE_FILE,
  FEDERATION_REVOCATION_FILE, FEDERATION_VIOLATION_FILE,
]);
export const VALID_FEDERATION_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_FEDERATION_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_TRUST_LEVELS = Object.freeze(['No Trust', 'Limited Trust', 'Conditional Trust', 'Operational Trust', 'Constitutional Trust']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Trust Failure', 'Governance Failure', 'Constitutional Violation', 'Sovereignty Violation', 'Evidence Failure', 'Constitutional Override', 'Federated Decision']);
export const VALID_CHALLENGE_GROUNDS = Object.freeze(['Invalid Recognition', 'Invalid Trust', 'Invalid Delegation', 'Invalid Capability Sharing', 'Governance Conflict', 'Constitutional Conflict', 'Sovereignty Violation', 'Evidence Failure']);
export const VALID_DELEGATION_STATES = Object.freeze(['Draft', 'Proposed', 'Active', 'Expired', 'Revoked', 'Retired']);
export const FEDERATION_TRANSITIONS = new Map([
  ['Observed', new Set(['Proposed'])],
  ['Proposed', new Set(['Recognized', 'Rejected'])],
  ['Recognized', new Set(['Active', 'Restricted'])],
  ['Active', new Set(['Restricted', 'Suspended', 'Revoked'])],
  ['Restricted', new Set(['Active', 'Suspended'])],
  ['Suspended', new Set(['Active', 'Revoked'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const federationRecords = (root) => markdownTable(readText(root, FEDERATION_AUTHORITY_FILE), 'Federation authority catalog');
export const federationRecognitionRecords = (root) => markdownTable(readText(root, FEDERATION_RECOGNITION_FILE), 'Recognition registry');
export const federationTrustRecords = (root) => markdownTable(readText(root, FEDERATION_TRUST_FILE), 'Trust registry');
export const federationDelegationRecords = (root) => markdownTable(readText(root, FEDERATION_DELEGATION_FILE), 'Delegation registry');
export const federationCapabilityRecords = (root) => markdownTable(readText(root, FEDERATION_CAPABILITY_FILE), 'Capability sharing registry');
export const federationGovernanceRecords = (root) => markdownTable(readText(root, FEDERATION_GOVERNANCE_FILE), 'Federated governance registry');
export const federationLifecycleRecords = (root) => markdownTable(readText(root, FEDERATION_LIFECYCLE_FILE), 'Federation lifecycle transition ledger');
export const federationChallengeRecords = (root) => markdownTable(readText(root, FEDERATION_CHALLENGE_FILE), 'Challenge registry');
export const federationRevocationRecords = (root) => markdownTable(readText(root, FEDERATION_REVOCATION_FILE), 'Revocation authority registry');

export function federationViolation(path, message, id = 'FED-V-013') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function federationAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Federation|FED-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireFederationFiles(root, violations) { for(const file of FEDERATION_GOVERNANCE_FILES) requireFile(root, file, violations, 'required federation governance artifact is missing'); }
export function validateFederationVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of FEDERATION_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(federationViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateFederationCatalog(root, violations) {
  const records=federationRecords(root), amendments=new Set(federationAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,'federation authority catalog contains no records','FED-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Federation ID']))) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`duplicate federation ID '${duplicate}'`,'FED-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Federation Name']))) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`duplicate federation name '${duplicate}'`,'FED-V-001'));
  for(const r of records){const id=r['Federation ID'];
    if(!/^FED-\d{4}$/.test(id)) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`invalid federation ID '${id}'`,'FED-V-001'));
    if(!r['Federation Name']) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} is missing a federation name`,'FED-V-013'));
    if(!VALID_FEDERATION_CLASSES.includes(r['Federation Class'])) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid federation class '${r['Federation Class']}'`,'FED-V-013'));
    if(!owners.has(r.Owner)) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'FED-V-013'));
    if(!/^FRP-\d{4}$/.test(r['Recognition Policy'])) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid recognition policy '${r['Recognition Policy']}'`,'FED-V-002'));
    if(!/^FTP-\d{4}$/.test(r['Trust Policy'])) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid trust policy '${r['Trust Policy']}'`,'FED-V-003'));
    if(!['Yes','No'].includes(r['Delegation Allowed'])) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid Delegation Allowed value '${r['Delegation Allowed']}'`,'FED-V-013'));
    if(!['Yes','No'].includes(r.Revocable)) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid Revocable value '${r.Revocable}'`,'FED-V-013'));
    if(!['Yes','No'].includes(r.Challengeable)) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid Challengeable value '${r.Challengeable}'`,'FED-V-013'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified federation amendment`,'FED-V-011'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'FED-V-011'));
    if(!VALID_FEDERATION_STATUSES.includes(r.Status)) violations.push(federationViolation(FEDERATION_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'FED-V-013'));
  }
}
