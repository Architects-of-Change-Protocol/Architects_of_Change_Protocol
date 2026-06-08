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

export const TRUST_CONSTITUTION_FILE = 'docs/constitution/TRUST-CONSTITUTION.md';
export const TRUST_AUTHORITY_FILE = 'docs/constitution/TRUST-AUTHORITIES.md';
export const TRUST_EVIDENCE_FILE = 'docs/constitution/TRUST-EVIDENCE-POLICY.md';
export const TRUST_LIFECYCLE_FILE = 'docs/constitution/TRUST-LIFECYCLE.md';
export const TRUST_ISSUANCE_FILE = 'docs/constitution/TRUST-ISSUANCE-POLICY.md';
export const TRUST_DECAY_FILE = 'docs/constitution/TRUST-DECAY-POLICY.md';
export const TRUST_REVOCATION_FILE = 'docs/constitution/TRUST-REVOCATION-POLICY.md';
export const TRUST_VIOLATION_FILE = 'docs/constitution/TRUST-VIOLATION-CATALOG.md';
export const TRUST_GOVERNANCE_FILES = Object.freeze([
  TRUST_CONSTITUTION_FILE, TRUST_AUTHORITY_FILE, TRUST_EVIDENCE_FILE, TRUST_LIFECYCLE_FILE,
  TRUST_ISSUANCE_FILE, TRUST_DECAY_FILE, TRUST_REVOCATION_FILE, TRUST_VIOLATION_FILE,
]);
export const VALID_TRUST_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_TRUST_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const TRUST_TRANSITIONS = new Map([
  ['Proposed', new Set(['Pending Evaluation'])],
  ['Pending Evaluation', new Set(['Active', 'Revoked'])],
  ['Active', new Set(['Suspended', 'Revoked', 'Retired'])],
  ['Suspended', new Set(['Active', 'Revoked', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);
export const VALID_DECAY_TRIGGERS = Object.freeze(['Time', 'Inactivity', 'Evidence Expiration', 'Superseded Claims', 'Governance Events']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Evidence Failure', 'Identity Failure', 'Standing Failure', 'Constitutional Override', 'Governance Decision']);

export const trustRecords = (root) => markdownTable(readText(root, TRUST_AUTHORITY_FILE), 'Trust authority catalog');
export const trustEvidenceRecords = (root) => markdownTable(readText(root, TRUST_EVIDENCE_FILE), 'Trust evidence registry');
export const trustLifecycleRecords = (root) => markdownTable(readText(root, TRUST_LIFECYCLE_FILE), 'Trust lifecycle transition ledger');
export const trustIssuanceRecords = (root) => markdownTable(readText(root, TRUST_ISSUANCE_FILE), 'Trust issuance requirements registry');
export const trustDecayRecords = (root) => markdownTable(readText(root, TRUST_DECAY_FILE), 'Trust decay rules registry');
export const trustRevocationAuthorityRecords = (root) => markdownTable(readText(root, TRUST_REVOCATION_FILE), 'Trust revocation authority registry');
export const trustRevocationRecords = (root) => markdownTable(readText(root, TRUST_REVOCATION_FILE), 'Trust revocation registry');
export function trustViolation(path, message, id = 'TRS-V-010') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function trustAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Trust|Confidence|TRS-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireTrustFiles(root, violations) { for(const file of TRUST_GOVERNANCE_FILES) requireFile(root,file,violations,'required trust governance artifact is missing'); }
export function validateTrustVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of TRUST_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(trustViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateTrustCatalog(root, violations) {
  const records=trustRecords(root), amendments=new Set(trustAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(trustViolation(TRUST_AUTHORITY_FILE,'trust authority catalog contains no records','TRS-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Trust ID']))) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`duplicate trust ID '${duplicate}'`,'TRS-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Trust Name']))) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`duplicate trust name '${duplicate}'`,'TRS-V-001'));
  for(const r of records){const id=r['Trust ID'];
    if(!/^TRS-\d{4}$/.test(id)) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`invalid trust ID '${id}'`,'TRS-V-001'));
    if(!r['Trust Name']) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} is missing a trust name`,'TRS-V-001'));
    if(!VALID_TRUST_CLASSES.includes(r['Trust Class'])) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} has invalid trust class '${r['Trust Class']}'`,'TRS-V-001'));
    if(!owners.has(r.Owner)) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'TRS-V-001'));
    if(!/^TEP-\d{4}$/.test(r['Evidence Policy'])) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} has invalid evidence policy '${r['Evidence Policy']}'`,'TRS-V-002'));
    for(const field of ['Decay Enabled','Revocable']) if(!['Yes','No'].includes(r[field])) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} has invalid ${field} value '${r[field]}'`,'TRS-V-001'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified trust amendment`,'TRS-V-001'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'TRS-V-001'));
    if(!VALID_TRUST_STATUSES.includes(r.Status)) violations.push(trustViolation(TRUST_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'TRS-V-001'));
  }
}
