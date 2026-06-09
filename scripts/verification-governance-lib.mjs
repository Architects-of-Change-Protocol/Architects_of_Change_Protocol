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

export const VERIFICATION_CONSTITUTION_FILE = 'docs/constitution/VERIFICATION-CONSTITUTION.md';
export const VERIFICATION_AUTHORITY_FILE = 'docs/constitution/VERIFICATION-AUTHORITIES.md';
export const VERIFICATION_EVIDENCE_FILE = 'docs/constitution/VERIFICATION-EVIDENCE-POLICY.md';
export const VERIFICATION_LIFECYCLE_FILE = 'docs/constitution/VERIFICATION-LIFECYCLE.md';
export const VERIFICATION_METHOD_FILE = 'docs/constitution/VERIFICATION-METHOD-POLICY.md';
export const VERIFICATION_EXPIRATION_FILE = 'docs/constitution/VERIFICATION-EXPIRATION-POLICY.md';
export const VERIFICATION_REVOCATION_FILE = 'docs/constitution/VERIFICATION-REVOCATION-POLICY.md';
export const VERIFICATION_VIOLATION_FILE = 'docs/constitution/VERIFICATION-VIOLATION-CATALOG.md';
export const VERIFICATION_GOVERNANCE_FILES = Object.freeze([
  VERIFICATION_CONSTITUTION_FILE, VERIFICATION_AUTHORITY_FILE, VERIFICATION_EVIDENCE_FILE,
  VERIFICATION_LIFECYCLE_FILE, VERIFICATION_METHOD_FILE, VERIFICATION_EXPIRATION_FILE,
  VERIFICATION_REVOCATION_FILE, VERIFICATION_VIOLATION_FILE,
]);
export const VALID_VERIFICATION_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_VERIFICATION_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VERIFICATION_TRANSITIONS = new Map([
  ['Proposed', new Set(['Pending Verification'])],
  ['Pending Verification', new Set(['Verified', 'Revoked'])],
  ['Verified', new Set(['Expired', 'Revoked', 'Retired'])],
  ['Expired', new Set(['Verified', 'Revoked', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);
export const VALID_EXPIRATION_TRIGGERS = Object.freeze(['Evidence Expiration', 'Time Limit', 'Claim Supersession', 'Trust Revocation', 'Governance Decision', 'Constitutional Override']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Evidence Failure', 'Method Failure', 'Claim Failure', 'Trust Failure', 'Standing Failure', 'Constitutional Override', 'Governance Decision']);

export const verificationRecords = (root) => markdownTable(readText(root, VERIFICATION_AUTHORITY_FILE), 'Verification authority catalog');
export const verificationEvidenceRecords = (root) => markdownTable(readText(root, VERIFICATION_EVIDENCE_FILE), 'Verification evidence registry');
export const verificationLifecycleRecords = (root) => markdownTable(readText(root, VERIFICATION_LIFECYCLE_FILE), 'Verification lifecycle transition ledger');
export const verificationMethodRecords = (root) => markdownTable(readText(root, VERIFICATION_METHOD_FILE), 'Verification method catalog');
export const verificationExpirationRecords = (root) => markdownTable(readText(root, VERIFICATION_EXPIRATION_FILE), 'Verification expiration policy catalog');
export const verificationRevocationAuthorityRecords = (root) => markdownTable(readText(root, VERIFICATION_REVOCATION_FILE), 'Verification revocation authority registry');
export const verificationRevocationRecords = (root) => markdownTable(readText(root, VERIFICATION_REVOCATION_FILE), 'Verification revocation registry');
export function verificationViolation(path, message, id = 'VER-V-010') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function verificationAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Verification|VER-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireVerificationFiles(root, violations) { for(const file of VERIFICATION_GOVERNANCE_FILES) requireFile(root,file,violations,'required verification governance artifact is missing'); }
export function validateVerificationVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of VERIFICATION_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(verificationViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateVerificationCatalog(root, violations) {
  const records=verificationRecords(root), amendments=new Set(verificationAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,'verification authority catalog contains no records','VER-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Verification ID']))) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`duplicate verification ID '${duplicate}'`,'VER-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Verification Name']))) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`duplicate verification name '${duplicate}'`,'VER-V-001'));
  for(const r of records){const id=r['Verification ID'];
    if(!/^VER-\d{4}$/.test(id)) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`invalid verification ID '${id}'`,'VER-V-001'));
    if(!r['Verification Name']) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} is missing a verification name`,'VER-V-001'));
    if(!VALID_VERIFICATION_CLASSES.includes(r['Verification Class'])) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} has invalid verification class '${r['Verification Class']}'`,'VER-V-001'));
    if(!owners.has(r.Owner)) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'VER-V-001'));
    if(!/^VMP-\d{4}$/.test(r['Verification Method'])) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} has invalid verification method '${r['Verification Method']}'`,'VER-V-003'));
    if(!/^VEP-\d{4}$/.test(r['Evidence Policy'])) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} has invalid evidence policy '${r['Evidence Policy']}'`,'VER-V-002'));
    if(!/^VXP-\d{4}$/.test(r['Expiration Policy'])) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} has invalid expiration policy '${r['Expiration Policy']}'`,'VER-V-006'));
    if(!['Yes','No'].includes(r['Revocable'])) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} has invalid Revocable value '${r['Revocable']}'`,'VER-V-001'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified verification amendment`,'VER-V-001'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'VER-V-001'));
    if(!VALID_VERIFICATION_STATUSES.includes(r.Status)) violations.push(verificationViolation(VERIFICATION_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'VER-V-001'));
  }
}
