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

export const CLAIM_CONSTITUTION_FILE = 'docs/constitution/CLAIM-CONSTITUTION.md';
export const CLAIM_AUTHORITY_FILE = 'docs/constitution/CLAIM-AUTHORITIES.md';
export const CLAIM_LIFECYCLE_FILE = 'docs/constitution/CLAIM-LIFECYCLE.md';
export const CLAIM_EVIDENCE_FILE = 'docs/constitution/CLAIM-EVIDENCE-POLICY.md';
export const CLAIM_DISPUTE_FILE = 'docs/constitution/CLAIM-DISPUTE-POLICY.md';
export const CLAIM_SUPERSESSION_FILE = 'docs/constitution/CLAIM-SUPERSESSION-POLICY.md';
export const CLAIM_WITHDRAWAL_FILE = 'docs/constitution/CLAIM-WITHDRAWAL-POLICY.md';
export const CLAIM_VIOLATION_FILE = 'docs/constitution/CLAIM-VIOLATION-CATALOG.md';
export const CLAIM_GOVERNANCE_FILES = Object.freeze([
  CLAIM_CONSTITUTION_FILE, CLAIM_AUTHORITY_FILE, CLAIM_LIFECYCLE_FILE, CLAIM_EVIDENCE_FILE,
  CLAIM_DISPUTE_FILE, CLAIM_SUPERSESSION_FILE, CLAIM_WITHDRAWAL_FILE, CLAIM_VIOLATION_FILE,
]);
export const VALID_CLAIM_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_CLAIM_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const CLAIM_TRANSITIONS = new Map([
  ['Draft', new Set(['Submitted'])], ['Submitted', new Set(['Pending Review'])],
  ['Pending Review', new Set(['Accepted', 'Rejected'])],
  ['Accepted', new Set(['Disputed', 'Withdrawn', 'Superseded', 'Retired'])],
  ['Rejected', new Set(['Retired'])], ['Disputed', new Set(['Accepted', 'Rejected', 'Superseded'])],
  ['Withdrawn', new Set(['Retired'])], ['Superseded', new Set(['Retired'])], ['Retired', new Set()],
]);
export const VALID_DISPUTE_GROUNDS = Object.freeze(['Evidence Failure', 'Fraud', 'Identity Conflict', 'Policy Conflict', 'Standing Conflict', 'Decision Conflict']);
export const VALID_SUPERSESSION_REASONS = Object.freeze(['Higher Evidence Quality', 'More Recent Evidence', 'Constitutional Override', 'Decision Authority']);
export const VALID_WITHDRAWAL_AUTHORITIES = Object.freeze(['Claim Owner', 'Authorized Representative', 'Constitutional Override']);

export const claimRecords = (root) => markdownTable(readText(root, CLAIM_AUTHORITY_FILE), 'Claim authority catalog');
export const evidenceRecords = (root) => markdownTable(readText(root, CLAIM_EVIDENCE_FILE), 'Evidence requirements registry');
export const lifecycleRecords = (root) => markdownTable(readText(root, CLAIM_LIFECYCLE_FILE), 'Claim lifecycle transition ledger');
export const disputeRecords = (root) => markdownTable(readText(root, CLAIM_DISPUTE_FILE), 'Dispute registry');
export const supersessionRecords = (root) => markdownTable(readText(root, CLAIM_SUPERSESSION_FILE), 'Supersession registry');
export const withdrawalRecords = (root) => markdownTable(readText(root, CLAIM_WITHDRAWAL_FILE), 'Withdrawal registry');
export function claimViolation(path, message, id = 'CLM-V-010') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function claimAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Claim|Assertion|CLM-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireClaimFiles(root, violations) { for(const file of CLAIM_GOVERNANCE_FILES) requireFile(root,file,violations,'required claim governance artifact is missing'); }
export function validateClaimVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of CLAIM_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(claimViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateClaimCatalog(root, violations) {
  const records=claimRecords(root), amendments=new Set(claimAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,'claim authority catalog contains no records','CLM-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Claim ID']))) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`duplicate claim ID '${duplicate}'`,'CLM-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Claim Name']))) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`duplicate claim name '${duplicate}'`,'CLM-V-001'));
  for(const record of records){const id=record['Claim ID'];
    if(!/^CLM-\d{4}$/.test(id)) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`invalid claim ID '${id}'`,'CLM-V-001'));
    if(!record['Claim Name']) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} is missing a claim name`,'CLM-V-001'));
    if(!VALID_CLAIM_CLASSES.includes(record['Claim Class'])) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} has invalid claim class '${record['Claim Class']}'`,'CLM-V-001'));
    if(!owners.has(record.Owner)) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} has invalid owner '${record.Owner}'`,'CLM-V-001'));
    if(!/^CEP-\d{4}$/.test(record['Evidence Policy'])) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} has invalid evidence policy '${record['Evidence Policy']}'`,'CLM-V-003'));
    for(const field of ['Disputable','Withdrawable','Supersedable']) if(!['Yes','No'].includes(record[field])) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} has invalid ${field} value '${record[field]}'`,'CLM-V-001'));
    if(!amendments.has(record['Creation Amendment'])) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} creation amendment '${record['Creation Amendment']}' is not a ratified Type B or Type C claim amendment`,'CLM-V-001'));
    if(!VALID_CLAIM_STATUSES.includes(record.Status)) violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} has invalid status '${record.Status}'`,'CLM-V-001'));
    if(record.Status==='Retired'&&record['Retirement Amendment']==='Not scheduled') violations.push(claimViolation(CLAIM_AUTHORITY_FILE,`${id} is retired without a retirement amendment`,'CLM-V-001'));
  }
}
