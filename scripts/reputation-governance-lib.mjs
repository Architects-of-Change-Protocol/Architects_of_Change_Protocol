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

export const REPUTATION_CONSTITUTION_FILE = 'docs/constitution/REPUTATION-CONSTITUTION.md';
export const REPUTATION_AUTHORITY_FILE = 'docs/constitution/REPUTATION-AUTHORITIES.md';
export const REPUTATION_SOURCES_FILE = 'docs/constitution/REPUTATION-SOURCES-POLICY.md';
export const REPUTATION_LIFECYCLE_FILE = 'docs/constitution/REPUTATION-LIFECYCLE.md';
export const REPUTATION_CALCULATION_FILE = 'docs/constitution/REPUTATION-CALCULATION-POLICY.md';
export const REPUTATION_DECAY_FILE = 'docs/constitution/REPUTATION-DECAY-POLICY.md';
export const REPUTATION_DISPUTE_FILE = 'docs/constitution/REPUTATION-DISPUTE-POLICY.md';
export const REPUTATION_CORRECTION_FILE = 'docs/constitution/REPUTATION-CORRECTION-POLICY.md';
export const REPUTATION_REVOCATION_FILE = 'docs/constitution/REPUTATION-REVOCATION-POLICY.md';
export const REPUTATION_VIOLATION_FILE = 'docs/constitution/REPUTATION-VIOLATION-CATALOG.md';
export const REPUTATION_GOVERNANCE_FILES = Object.freeze([
  REPUTATION_CONSTITUTION_FILE, REPUTATION_AUTHORITY_FILE, REPUTATION_SOURCES_FILE,
  REPUTATION_LIFECYCLE_FILE, REPUTATION_CALCULATION_FILE, REPUTATION_DECAY_FILE,
  REPUTATION_DISPUTE_FILE, REPUTATION_CORRECTION_FILE, REPUTATION_REVOCATION_FILE,
  REPUTATION_VIOLATION_FILE,
]);
export const VALID_REPUTATION_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_REPUTATION_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const REPUTATION_TRANSITIONS = new Map([
  ['Proposed', new Set(['Pending Source Evaluation'])],
  ['Pending Source Evaluation', new Set(['Active', 'Revoked'])],
  ['Active', new Set(['Suspended', 'Disputed', 'Corrected', 'Revoked', 'Retired'])],
  ['Suspended', new Set(['Active', 'Disputed', 'Revoked', 'Retired'])],
  ['Disputed', new Set(['Active', 'Corrected', 'Revoked', 'Retired'])],
  ['Corrected', new Set(['Active', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);
export const VALID_DECAY_TRIGGERS = Object.freeze(['Time', 'Inactivity', 'Evidence Expiration', 'Trust Decay', 'Verification Expiration', 'Claim Supersession', 'Decision Revocation', 'Standing Revocation', 'Governance Events']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Source Integrity Failure', 'Standing Failure', 'Claim Failure', 'Trust Failure', 'Verification Failure', 'Decision Failure', 'Constitutional Override', 'Governance Decision']);
export const VALID_DISPUTE_GROUNDS = Object.freeze(['Incorrect Source', 'Missing Source', 'Invalid Weight', 'Expired Evidence', 'Disputed Claim', 'Revoked Decision', 'Incorrect Aggregation', 'Constitutional Conflict']);
export const VALID_CORRECTION_CAUSES = Object.freeze(['Source Correction', 'Weight Correction', 'Aggregation Correction', 'Appeal Outcome', 'Dispute Resolution', 'Constitutional Override']);

export const reputationRecords = (root) => markdownTable(readText(root, REPUTATION_AUTHORITY_FILE), 'Reputation authority catalog');
export const reputationSourceRecords = (root) => markdownTable(readText(root, REPUTATION_SOURCES_FILE), 'Reputation sources registry');
export const reputationLifecycleRecords = (root) => markdownTable(readText(root, REPUTATION_LIFECYCLE_FILE), 'Reputation lifecycle transition ledger');
export const reputationCalculationRecords = (root) => markdownTable(readText(root, REPUTATION_CALCULATION_FILE), 'Reputation calculation registry');
export const reputationDecayRecords = (root) => markdownTable(readText(root, REPUTATION_DECAY_FILE), 'Reputation decay policy catalog');
export const reputationDisputeRecords = (root) => markdownTable(readText(root, REPUTATION_DISPUTE_FILE), 'Reputation dispute registry');
export const reputationCorrectionRecords = (root) => markdownTable(readText(root, REPUTATION_CORRECTION_FILE), 'Reputation correction registry');
export const reputationRevocationAuthorityRecords = (root) => markdownTable(readText(root, REPUTATION_REVOCATION_FILE), 'Reputation revocation authority registry');
export const reputationRevocationRecords = (root) => markdownTable(readText(root, REPUTATION_REVOCATION_FILE), 'Reputation revocation registry');

export function reputationViolation(path, message, id = 'REP-V-012') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function reputationAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Reputation|REP-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireReputationFiles(root, violations) { for(const file of REPUTATION_GOVERNANCE_FILES) requireFile(root, file, violations, 'required reputation governance artifact is missing'); }
export function validateReputationVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of REPUTATION_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(reputationViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateReputationCatalog(root, violations) {
  const records=reputationRecords(root), amendments=new Set(reputationAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,'reputation authority catalog contains no records','REP-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Reputation ID']))) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`duplicate reputation ID '${duplicate}'`,'REP-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Reputation Name']))) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`duplicate reputation name '${duplicate}'`,'REP-V-001'));
  for(const r of records){const id=r['Reputation ID'];
    if(!/^REP-\d{4}$/.test(id)) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`invalid reputation ID '${id}'`,'REP-V-001'));
    if(!r['Reputation Name']) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} is missing a reputation name`,'REP-V-001'));
    if(!VALID_REPUTATION_CLASSES.includes(r['Reputation Class'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid reputation class '${r['Reputation Class']}'`,'REP-V-001'));
    if(!owners.has(r.Owner)) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'REP-V-001'));
    if(!/^RSP-\d{4}$/.test(r['Source Policy'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid source policy '${r['Source Policy']}'`,'REP-V-002'));
    if(!/^RCP-\d{4}$/.test(r['Calculation Policy'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid calculation policy '${r['Calculation Policy']}'`,'REP-V-003'));
    if(!/^RDP-\d{4}$/.test(r['Decay Policy'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid decay policy '${r['Decay Policy']}'`,'REP-V-007'));
    if(!['Yes','No'].includes(r['Disputable'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid Disputable value '${r['Disputable']}'`,'REP-V-001'));
    if(!['Yes','No'].includes(r['Correctable'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid Correctable value '${r['Correctable']}'`,'REP-V-001'));
    if(!['Yes','No'].includes(r['Revocable'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid Revocable value '${r['Revocable']}'`,'REP-V-001'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified reputation amendment`,'REP-V-001'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'REP-V-001'));
    if(!VALID_REPUTATION_STATUSES.includes(r.Status)) violations.push(reputationViolation(REPUTATION_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'REP-V-001'));
  }
}
