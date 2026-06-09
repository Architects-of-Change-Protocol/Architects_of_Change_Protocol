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

export const ATTESTATION_CONSTITUTION_FILE = 'docs/constitution/ATTESTATION-CONSTITUTION.md';
export const ATTESTATION_AUTHORITY_FILE = 'docs/constitution/ATTESTATION-AUTHORITIES.md';
export const ATTESTATION_SCOPE_FILE = 'docs/constitution/ATTESTATION-SCOPE-POLICY.md';
export const ATTESTATION_ELIGIBILITY_FILE = 'docs/constitution/ATTESTATION-ELIGIBILITY-POLICY.md';
export const ATTESTATION_LIFECYCLE_FILE = 'docs/constitution/ATTESTATION-LIFECYCLE.md';
export const ATTESTATION_WEIGHT_FILE = 'docs/constitution/ATTESTATION-WEIGHT-POLICY.md';
export const ATTESTATION_EXPIRATION_FILE = 'docs/constitution/ATTESTATION-EXPIRATION-POLICY.md';
export const ATTESTATION_REVOCATION_FILE = 'docs/constitution/ATTESTATION-REVOCATION-POLICY.md';
export const ATTESTATION_DISPUTE_FILE = 'docs/constitution/ATTESTATION-DISPUTE-POLICY.md';
export const ATTESTATION_VIOLATION_FILE = 'docs/constitution/ATTESTATION-VIOLATION-CATALOG.md';
export const ATTESTATION_GOVERNANCE_FILES = Object.freeze([
  ATTESTATION_CONSTITUTION_FILE, ATTESTATION_AUTHORITY_FILE, ATTESTATION_SCOPE_FILE,
  ATTESTATION_ELIGIBILITY_FILE, ATTESTATION_LIFECYCLE_FILE, ATTESTATION_WEIGHT_FILE,
  ATTESTATION_EXPIRATION_FILE, ATTESTATION_REVOCATION_FILE, ATTESTATION_DISPUTE_FILE,
  ATTESTATION_VIOLATION_FILE,
]);
export const VALID_ATTESTATION_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_ATTESTATION_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const ATTESTATION_TRANSITIONS = new Map([
  ['Proposed', new Set(['Pending Validation'])],
  ['Pending Validation', new Set(['Active', 'Revoked'])],
  ['Active', new Set(['Expired', 'Disputed', 'Revoked', 'Retired'])],
  ['Disputed', new Set(['Active', 'Revoked', 'Retired'])],
  ['Expired', new Set(['Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);
export const VALID_WEIGHT_LEVELS = Object.freeze(['No Weight', 'Advisory Weight', 'Constitutional Weight', 'Governance Weight', 'Consensus Weight']);
export const VALID_EXPIRATION_TRIGGERS = Object.freeze(['Time Limit', 'Trust Decay', 'Verification Expiration', 'Reputation Revocation', 'Standing Revocation', 'Governance Decision', 'Constitutional Override']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Standing Failure', 'Trust Failure', 'Verification Failure', 'Reputation Failure', 'Conflict Of Interest', 'Constitutional Override', 'Governance Decision']);
export const VALID_DISPUTE_GROUNDS = Object.freeze(['Improper Eligibility', 'False Endorsement', 'Scope Violation', 'Conflict Of Interest', 'Evidence Failure', 'Constitutional Conflict', 'Governance Conflict']);

export const attestationRecords = (root) => markdownTable(readText(root, ATTESTATION_AUTHORITY_FILE), 'Attestation authority catalog');
export const attestationLifecycleRecords = (root) => markdownTable(readText(root, ATTESTATION_LIFECYCLE_FILE), 'Attestation lifecycle transition ledger');
export const attestationRevocationAuthorityRecords = (root) => markdownTable(readText(root, ATTESTATION_REVOCATION_FILE), 'Revocation authority registry');
export const attestationDisputeRecords = (root) => markdownTable(readText(root, ATTESTATION_DISPUTE_FILE), 'Dispute registry');
export const attestationScopeRecords = (root) => markdownTable(readText(root, ATTESTATION_SCOPE_FILE), 'Scope registry');
export const attestationEligibilityRecords = (root) => markdownTable(readText(root, ATTESTATION_ELIGIBILITY_FILE), 'Eligibility policy registry');
export const attestationWeightRecords = (root) => markdownTable(readText(root, ATTESTATION_WEIGHT_FILE), 'Weight policy registry');
export const attestationExpirationRecords = (root) => markdownTable(readText(root, ATTESTATION_EXPIRATION_FILE), 'Expiration policy catalog');

export function attestationViolation(path, message, id = 'ATT-V-012') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function attestationAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Attestation|ATT-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireAttestationFiles(root, violations) { for(const file of ATTESTATION_GOVERNANCE_FILES) requireFile(root, file, violations, 'required attestation governance artifact is missing'); }
export function validateAttestationVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of ATTESTATION_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(attestationViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateAttestationCatalog(root, violations) {
  const records=attestationRecords(root), amendments=new Set(attestationAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,'attestation authority catalog contains no records','ATT-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Attestation ID']))) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`duplicate attestation ID '${duplicate}'`,'ATT-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Attestation Name']))) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`duplicate attestation name '${duplicate}'`,'ATT-V-001'));
  for(const r of records){const id=r['Attestation ID'];
    if(!/^ATT-\d{4}$/.test(id)) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`invalid attestation ID '${id}'`,'ATT-V-001'));
    if(!r['Attestation Name']) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} is missing an attestation name`,'ATT-V-009'));
    if(!VALID_ATTESTATION_CLASSES.includes(r['Attestation Class'])) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid attestation class '${r['Attestation Class']}'`,'ATT-V-009'));
    if(!owners.has(r.Owner)) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'ATT-V-009'));
    if(!/^AEP-\d{4}$/.test(r['Eligibility Policy'])) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid eligibility policy '${r['Eligibility Policy']}'`,'ATT-V-003'));
    if(!/^AWP-\d{4}$/.test(r['Weight Policy'])) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid weight policy '${r['Weight Policy']}'`,'ATT-V-011'));
    if(!/^AXP-\d{4}$/.test(r['Expiration Policy'])) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid expiration policy '${r['Expiration Policy']}'`,'ATT-V-007'));
    if(!['Yes','No'].includes(r.Revocable)) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid Revocable value '${r.Revocable}'`,'ATT-V-009'));
    if(!['Yes','No'].includes(r.Disputable)) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid Disputable value '${r.Disputable}'`,'ATT-V-009'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified attestation amendment`,'ATT-V-010'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'ATT-V-010'));
    if(!VALID_ATTESTATION_STATUSES.includes(r.Status)) violations.push(attestationViolation(ATTESTATION_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'ATT-V-009'));
  }
}
