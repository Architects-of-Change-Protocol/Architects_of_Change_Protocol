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

export const GOVERNANCE_CONSTITUTION_FILE = 'docs/constitution/GOVERNANCE-CONSTITUTION.md';
export const GOVERNANCE_AUTHORITY_FILE = 'docs/constitution/GOVERNANCE-AUTHORITIES.md';
export const GOVERNANCE_PROPOSAL_FILE = 'docs/constitution/GOVERNANCE-PROPOSAL-POLICY.md';
export const GOVERNANCE_MOTION_FILE = 'docs/constitution/GOVERNANCE-MOTION-POLICY.md';
export const GOVERNANCE_MANDATE_FILE = 'docs/constitution/GOVERNANCE-MANDATE-POLICY.md';
export const GOVERNANCE_OUTCOME_FILE = 'docs/constitution/GOVERNANCE-OUTCOME-POLICY.md';
export const GOVERNANCE_LIFECYCLE_FILE = 'docs/constitution/GOVERNANCE-LIFECYCLE.md';
export const GOVERNANCE_CHALLENGE_FILE = 'docs/constitution/GOVERNANCE-CHALLENGE-POLICY.md';
export const GOVERNANCE_EXPIRATION_FILE = 'docs/constitution/GOVERNANCE-EXPIRATION-POLICY.md';
export const GOVERNANCE_REVOCATION_FILE = 'docs/constitution/GOVERNANCE-REVOCATION-POLICY.md';
export const GOVERNANCE_VIOLATION_FILE = 'docs/constitution/GOVERNANCE-VIOLATION-CATALOG.md';
export const GOVERNANCE_GOVERNANCE_FILES = Object.freeze([
  GOVERNANCE_CONSTITUTION_FILE, GOVERNANCE_AUTHORITY_FILE, GOVERNANCE_PROPOSAL_FILE,
  GOVERNANCE_MOTION_FILE, GOVERNANCE_MANDATE_FILE, GOVERNANCE_OUTCOME_FILE,
  GOVERNANCE_LIFECYCLE_FILE, GOVERNANCE_CHALLENGE_FILE, GOVERNANCE_EXPIRATION_FILE,
  GOVERNANCE_REVOCATION_FILE, GOVERNANCE_VIOLATION_FILE,
]);
export const VALID_GOVERNANCE_CLASSES = Object.freeze(['Constitutional', 'Protocol', 'Runtime', 'Operational']);
export const VALID_GOVERNANCE_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_MOTION_TYPES = Object.freeze(['Constitutional Motion', 'Policy Motion', 'Authority Motion', 'Runtime Motion', 'Operational Motion']);
export const VALID_MOTION_STATUSES = Object.freeze(['Prepared', 'Open', 'Passed', 'Failed', 'Expired', 'Withdrawn', 'Retired']);
export const VALID_PROPOSAL_STATUSES = Object.freeze(['Draft', 'Submitted', 'Admissible', 'Rejected', 'Withdrawn', 'Superseded', 'Retired']);
export const VALID_MANDATE_STATUSES = Object.freeze(['Pending', 'Active', 'Suspended', 'Expired', 'Revoked', 'Retired']);
export const VALID_OUTCOME_TYPES = Object.freeze(['Approved', 'Rejected', 'Modified', 'Deferred', 'Superseded', 'Invalidated']);
export const VALID_CHALLENGE_GROUNDS = Object.freeze(['Invalid Standing', 'Invalid Proposal', 'Invalid Motion', 'Invalid Consensus', 'Invalid Mandate', 'Scope Violation', 'Conflict Of Interest', 'Evidence Failure', 'Constitutional Conflict', 'Governance Conflict']);
export const VALID_EXPIRATION_TRIGGERS = Object.freeze(['Time Limit', 'Consensus Expiration', 'Mandate Expiration', 'Standing Revocation', 'Policy Change', 'Constitutional Override', 'Governance Decision']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Invalid Consensus', 'Invalid Standing', 'Invalid Mandate', 'Scope Violation', 'Conflict Of Interest', 'Evidence Failure', 'Constitutional Override', 'Governance Decision']);
export const GOVERNANCE_TRANSITIONS = new Map([
  ['Proposed', new Set(['Submitted'])],
  ['Submitted', new Set(['Admissible', 'Rejected', 'Withdrawn'])],
  ['Admissible', new Set(['Motioned', 'Withdrawn'])],
  ['Motioned', new Set(['Open'])],
  ['Open', new Set(['Passed', 'Failed', 'Expired', 'Withdrawn'])],
  ['Passed', new Set(['Mandated'])],
  ['Mandated', new Set(['Active', 'Suspended', 'Revoked', 'Expired'])],
  ['Active', new Set(['Completed', 'Challenged', 'Suspended', 'Expired', 'Revoked'])],
  ['Suspended', new Set(['Active', 'Revoked', 'Expired'])],
  ['Challenged', new Set(['Active', 'Revoked', 'Completed', 'Retired'])],
  ['Completed', new Set(['Retired'])],
  ['Expired', new Set(['Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const governanceAuthorityRecords = (root) => markdownTable(readText(root, GOVERNANCE_AUTHORITY_FILE), 'Governance authority catalog');
export const governanceProposalPolicyRecords = (root) => markdownTable(readText(root, GOVERNANCE_PROPOSAL_FILE), 'Proposal policy catalog');
export const governanceMotionPolicyRecords = (root) => markdownTable(readText(root, GOVERNANCE_MOTION_FILE), 'Motion policy catalog');
export const governanceMandatePolicyRecords = (root) => markdownTable(readText(root, GOVERNANCE_MANDATE_FILE), 'Mandate policy catalog');
export const governanceOutcomePolicyRecords = (root) => markdownTable(readText(root, GOVERNANCE_OUTCOME_FILE), 'Outcome policy catalog');
export const governanceLifecycleRecords = (root) => markdownTable(readText(root, GOVERNANCE_LIFECYCLE_FILE), 'Governance lifecycle transition ledger');
export const governanceChallengeRecords = (root) => markdownTable(readText(root, GOVERNANCE_CHALLENGE_FILE), 'Challenge registry');
export const governanceExpirationRecords = (root) => markdownTable(readText(root, GOVERNANCE_EXPIRATION_FILE), 'Expiration policy catalog');
export const governanceRevocationRecords = (root) => markdownTable(readText(root, GOVERNANCE_REVOCATION_FILE), 'Revocation authority registry');

export function governanceViolationMsg(path, message, id = 'GOV-V-013') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function governanceAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Governance|GOV-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireGovernanceFiles(root, violations) { for(const file of GOVERNANCE_GOVERNANCE_FILES) requireFile(root, file, violations, 'required governance governance artifact is missing'); }
export function validateGovernanceVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of GOVERNANCE_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(governanceViolationMsg(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateGovernanceCatalog(root, violations) {
  const records=governanceAuthorityRecords(root), amendments=new Set(governanceAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,'governance authority catalog contains no records','GOV-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Governance ID']))) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`duplicate governance ID '${duplicate}'`,'GOV-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Governance Name']))) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`duplicate governance name '${duplicate}'`,'GOV-V-001'));
  for(const r of records){const id=r['Governance ID'];
    if(!/^GOV-\d{4}$/.test(id)) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`invalid governance ID '${id}'`,'GOV-V-001'));
    if(!r['Governance Name']) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} is missing a governance name`,'GOV-V-016'));
    if(!VALID_GOVERNANCE_CLASSES.includes(r['Governance Class'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid governance class '${r['Governance Class']}'`,'GOV-V-016'));
    if(!owners.has(r.Owner)) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'GOV-V-016'));
    if(!/^GPP-\d{4}$/.test(r['Proposal Policy'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid proposal policy '${r['Proposal Policy']}'`,'GOV-V-003'));
    if(!/^GMP-\d{4}$/.test(r['Motion Policy'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid motion policy '${r['Motion Policy']}'`,'GOV-V-004'));
    if(!/^GMD-\d{4}$/.test(r['Mandate Policy'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid mandate policy '${r['Mandate Policy']}'`,'GOV-V-006'));
    if(!/^GOP-\d{4}$/.test(r['Outcome Policy'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid outcome policy '${r['Outcome Policy']}'`,'GOV-V-008'));
    if(!['Yes','No'].includes(r['Consensus Required'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid Consensus Required value '${r['Consensus Required']}'`,'GOV-V-016'));
    if(!['Yes','No'].includes(r.Revocable)) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid Revocable value '${r.Revocable}'`,'GOV-V-016'));
    if(!['Yes','No'].includes(r.Disputable)) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid Disputable value '${r.Disputable}'`,'GOV-V-016'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified governance amendment`,'GOV-V-014'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'GOV-V-014'));
    if(!VALID_GOVERNANCE_STATUSES.includes(r.Status)) violations.push(governanceViolationMsg(GOVERNANCE_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'GOV-V-016'));
  }
}
