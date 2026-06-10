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

export const VOTING_CONSTITUTION_FILE = 'docs/constitution/VOTING-CONSTITUTION.md';
export const VOTING_AUTHORITY_FILE = 'docs/constitution/VOTING-AUTHORITIES.md';
export const VOTING_ELIGIBILITY_FILE = 'docs/constitution/VOTING-ELIGIBILITY-POLICY.md';
export const VOTING_WEIGHT_FILE = 'docs/constitution/VOTING-WEIGHT-POLICY.md';
export const VOTING_DELEGATION_FILE = 'docs/constitution/VOTING-DELEGATION-POLICY.md';
export const VOTING_MOTION_FILE = 'docs/constitution/VOTING-MOTION-POLICY.md';
export const VOTING_LIFECYCLE_FILE = 'docs/constitution/VOTING-LIFECYCLE.md';
export const VOTING_EXPIRATION_FILE = 'docs/constitution/VOTING-EXPIRATION-POLICY.md';
export const VOTING_CHALLENGE_FILE = 'docs/constitution/VOTING-CHALLENGE-POLICY.md';
export const VOTING_REVOCATION_FILE = 'docs/constitution/VOTING-REVOCATION-POLICY.md';
export const VOTING_VIOLATION_FILE = 'docs/constitution/VOTING-VIOLATION-CATALOG.md';
export const VOTING_GOVERNANCE_FILES = Object.freeze([
  VOTING_CONSTITUTION_FILE, VOTING_AUTHORITY_FILE, VOTING_ELIGIBILITY_FILE,
  VOTING_WEIGHT_FILE, VOTING_DELEGATION_FILE, VOTING_MOTION_FILE,
  VOTING_LIFECYCLE_FILE, VOTING_EXPIRATION_FILE, VOTING_CHALLENGE_FILE,
  VOTING_REVOCATION_FILE, VOTING_VIOLATION_FILE,
]);
export const VALID_VOTING_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_VOTING_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_EXPIRATION_TRIGGERS = Object.freeze(['Time Limit', 'Standing Revocation', 'Governance Expiration', 'Consensus Expiration', 'Constitutional Override', 'Governance Decision']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Eligibility Failure', 'Delegation Abuse', 'Evidence Failure', 'Constitutional Override', 'Governance Decision']);
export const VALID_CHALLENGE_GROUNDS = Object.freeze(['Invalid Eligibility', 'Invalid Weight', 'Invalid Delegation', 'Improper Motion', 'Evidence Failure', 'Constitutional Conflict', 'Governance Conflict']);
export const VALID_DELEGATION_STATUSES = Object.freeze(['Pending', 'Active', 'Expired', 'Revoked', 'Retired']);
export const VALID_MOTION_STATUSES = Object.freeze(['Draft', 'Prepared', 'Open', 'Closed', 'Resolved', 'Retired']);
export const VOTING_TRANSITIONS = new Map([
  ['Draft', new Set(['Prepared'])],
  ['Prepared', new Set(['Open'])],
  ['Open', new Set(['Active', 'Closed', 'Expired'])],
  ['Active', new Set(['Closed', 'Challenged', 'Expired', 'Revoked'])],
  ['Closed', new Set(['Resolved', 'Challenged'])],
  ['Resolved', new Set(['Retired'])],
  ['Challenged', new Set(['Resolved', 'Revoked', 'Retired'])],
  ['Expired', new Set(['Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const votingRecords = (root) => markdownTable(readText(root, VOTING_AUTHORITY_FILE), 'Voting authority catalog');
export const votingEligibilityRecords = (root) => markdownTable(readText(root, VOTING_ELIGIBILITY_FILE), 'Eligibility policy catalog');
export const votingWeightRecords = (root) => markdownTable(readText(root, VOTING_WEIGHT_FILE), 'Weight policy catalog');
export const votingDelegationRecords = (root) => markdownTable(readText(root, VOTING_DELEGATION_FILE), 'Delegation permission catalog');
export const votingMotionRecords = (root) => markdownTable(readText(root, VOTING_MOTION_FILE), 'Motion policy catalog');
export const votingLifecycleRecords = (root) => markdownTable(readText(root, VOTING_LIFECYCLE_FILE), 'Voting lifecycle transition ledger');
export const votingExpirationRecords = (root) => markdownTable(readText(root, VOTING_EXPIRATION_FILE), 'Expiration policy catalog');
export const votingChallengeRecords = (root) => markdownTable(readText(root, VOTING_CHALLENGE_FILE), 'Challenge registry');
export const votingRevocationRecords = (root) => markdownTable(readText(root, VOTING_REVOCATION_FILE), 'Revocation authority registry');

export function votingViolation(path, message, id = 'VOTE-V-013') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function votingAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Voting|VOT-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireVotingFiles(root, violations) { for(const file of VOTING_GOVERNANCE_FILES) requireFile(root, file, violations, 'required voting governance artifact is missing'); }
export function validateVotingVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of VOTING_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(votingViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateVotingCatalog(root, violations) {
  const records=votingRecords(root), amendments=new Set(votingAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(votingViolation(VOTING_AUTHORITY_FILE,'voting authority catalog contains no records','VOTE-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Voting ID']))) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`duplicate voting ID '${duplicate}'`,'VOTE-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Voting Name']))) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`duplicate voting name '${duplicate}'`,'VOTE-V-001'));
  for(const r of records){const id=r['Voting ID'];
    if(!/^VOT-\d{4}$/.test(id)) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`invalid voting ID '${id}'`,'VOTE-V-001'));
    if(!r['Voting Name']) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} is missing a voting name`,'VOTE-V-013'));
    if(!VALID_VOTING_CLASSES.includes(r['Voting Class'])) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid voting class '${r['Voting Class']}'`,'VOTE-V-013'));
    if(!owners.has(r.Owner)) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'VOTE-V-013'));
    if(!/^VEL-\d{4}$/.test(r['Eligibility Policy'])) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid eligibility policy '${r['Eligibility Policy']}'`,'VOTE-V-003'));
    if(!/^VWT-\d{4}$/.test(r['Weight Policy'])) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid weight policy '${r['Weight Policy']}'`,'VOTE-V-004'));
    if(!['Yes','No'].includes(r['Delegation Allowed'])) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid Delegation Allowed value '${r['Delegation Allowed']}'`,'VOTE-V-013'));
    if(!/^VEX-\d{4}$/.test(r['Expiration Policy'])) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid expiration policy '${r['Expiration Policy']}'`,'VOTE-V-007'));
    if(!['Yes','No'].includes(r.Revocable)) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid Revocable value '${r.Revocable}'`,'VOTE-V-013'));
    if(!['Yes','No'].includes(r.Challengeable)) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid Challengeable value '${r.Challengeable}'`,'VOTE-V-013'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified voting amendment`,'VOTE-V-011'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'VOTE-V-011'));
    if(!VALID_VOTING_STATUSES.includes(r.Status)) violations.push(votingViolation(VOTING_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'VOTE-V-013'));
  }
}
