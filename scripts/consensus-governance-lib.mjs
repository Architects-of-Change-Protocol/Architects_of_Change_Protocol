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

export const CONSENSUS_CONSTITUTION_FILE = 'docs/constitution/CONSENSUS-CONSTITUTION.md';
export const CONSENSUS_AUTHORITY_FILE = 'docs/constitution/CONSENSUS-AUTHORITIES.md';
export const CONSENSUS_MODELS_FILE = 'docs/constitution/CONSENSUS-MODELS-POLICY.md';
export const CONSENSUS_THRESHOLD_FILE = 'docs/constitution/CONSENSUS-THRESHOLD-POLICY.md';
export const CONSENSUS_LIFECYCLE_FILE = 'docs/constitution/CONSENSUS-LIFECYCLE.md';
export const CONSENSUS_EXPIRATION_FILE = 'docs/constitution/CONSENSUS-EXPIRATION-POLICY.md';
export const CONSENSUS_REVOCATION_FILE = 'docs/constitution/CONSENSUS-REVOCATION-POLICY.md';
export const CONSENSUS_DISPUTE_FILE = 'docs/constitution/CONSENSUS-DISPUTE-POLICY.md';
export const CONSENSUS_RECOMPUTATION_FILE = 'docs/constitution/CONSENSUS-RECOMPUTATION-POLICY.md';
export const CONSENSUS_VIOLATION_FILE = 'docs/constitution/CONSENSUS-VIOLATION-CATALOG.md';
export const CONSENSUS_GOVERNANCE_FILES = Object.freeze([
  CONSENSUS_CONSTITUTION_FILE, CONSENSUS_AUTHORITY_FILE, CONSENSUS_MODELS_FILE,
  CONSENSUS_THRESHOLD_FILE, CONSENSUS_LIFECYCLE_FILE, CONSENSUS_EXPIRATION_FILE,
  CONSENSUS_REVOCATION_FILE, CONSENSUS_DISPUTE_FILE, CONSENSUS_RECOMPUTATION_FILE,
  CONSENSUS_VIOLATION_FILE,
]);
export const VALID_CONSENSUS_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_CONSENSUS_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const CONSENSUS_TRANSITIONS = new Map([
  ['Proposed', new Set(['Collecting'])],
  ['Collecting', new Set(['Pending Evaluation'])],
  ['Pending Evaluation', new Set(['Established', 'Revoked'])],
  ['Established', new Set(['Disputed', 'Expired', 'Revoked', 'Retired'])],
  ['Disputed', new Set(['Established', 'Revoked', 'Retired'])],
  ['Expired', new Set(['Established', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);
export const VALID_CONSENSUS_MODELS = Object.freeze(['Simple Majority Consensus', 'Supermajority Consensus', 'Unanimous', 'Weighted Consensus', 'Reputation Weighted Consensus', 'Trust Weighted Consensus', 'Constitutional Consensus']);
export const VALID_EXPIRATION_TRIGGERS = Object.freeze(['Attestation Expiration', 'Trust Decay', 'Verification Expiration', 'Standing Revocation', 'Threshold Failure', 'Governance Decision', 'Constitutional Override']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Threshold Failure', 'Invalid Attestations', 'Standing Failure', 'Verification Failure', 'Trust Failure', 'Constitutional Override', 'Governance Decision']);
export const VALID_DISPUTE_GROUNDS = Object.freeze(['Threshold Miscalculation', 'Invalid Weighting', 'Invalid Participants', 'Improper Attestations', 'Evidence Failure', 'Constitutional Conflict', 'Governance Conflict']);

export const consensusRecords = (root) => markdownTable(readText(root, CONSENSUS_AUTHORITY_FILE), 'Consensus authority catalog');
export const consensusLifecycleRecords = (root) => markdownTable(readText(root, CONSENSUS_LIFECYCLE_FILE), 'Consensus lifecycle transition ledger');
export const consensusRevocationAuthorityRecords = (root) => markdownTable(readText(root, CONSENSUS_REVOCATION_FILE), 'Revocation authority registry');
export const consensusDisputeRecords = (root) => markdownTable(readText(root, CONSENSUS_DISPUTE_FILE), 'Dispute registry');
export const consensusModelsRecords = (root) => markdownTable(readText(root, CONSENSUS_MODELS_FILE), 'Consensus models registry');
export const consensusThresholdRecords = (root) => markdownTable(readText(root, CONSENSUS_THRESHOLD_FILE), 'Threshold policy catalog');
export const consensusExpirationRecords = (root) => markdownTable(readText(root, CONSENSUS_EXPIRATION_FILE), 'Expiration policy catalog');
export const consensusRecomputationRecords = (root) => markdownTable(readText(root, CONSENSUS_RECOMPUTATION_FILE), 'Recomputation trigger catalog');

export function consensusViolation(path, message, id = 'CNS-V-010') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function consensusAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Consensus|CNS-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireConsensusFiles(root, violations) { for(const file of CONSENSUS_GOVERNANCE_FILES) requireFile(root, file, violations, 'required consensus governance artifact is missing'); }
export function validateConsensusVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of CONSENSUS_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(consensusViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateConsensusCatalog(root, violations) {
  const records=consensusRecords(root), amendments=new Set(consensusAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,'consensus authority catalog contains no records','CNS-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Consensus ID']))) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`duplicate consensus ID '${duplicate}'`,'CNS-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Consensus Name']))) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`duplicate consensus name '${duplicate}'`,'CNS-V-001'));
  for(const r of records){const id=r['Consensus ID'];
    if(!/^CNS-\d{4}$/.test(id)) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`invalid consensus ID '${id}'`,'CNS-V-001'));
    if(!r['Consensus Name']) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} is missing a consensus name`,'CNS-V-010'));
    if(!VALID_CONSENSUS_CLASSES.includes(r['Consensus Class'])) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid consensus class '${r['Consensus Class']}'`,'CNS-V-010'));
    if(!owners.has(r.Owner)) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'CNS-V-010'));
    if(!/^CMP-\d{4}$/.test(r['Consensus Model'])) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid consensus model '${r['Consensus Model']}'`,'CNS-V-005'));
    if(!/^CTP-\d{4}$/.test(r['Threshold Policy'])) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid threshold policy '${r['Threshold Policy']}'`,'CNS-V-002'));
    if(!/^CXP-\d{4}$/.test(r['Expiration Policy'])) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid expiration policy '${r['Expiration Policy']}'`,'CNS-V-008'));
    if(!['Yes','No'].includes(r.Revocable)) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid Revocable value '${r.Revocable}'`,'CNS-V-010'));
    if(!['Yes','No'].includes(r.Disputable)) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid Disputable value '${r.Disputable}'`,'CNS-V-010'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified consensus amendment`,'CNS-V-011'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'CNS-V-011'));
    if(!VALID_CONSENSUS_STATUSES.includes(r.Status)) violations.push(consensusViolation(CONSENSUS_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'CNS-V-010'));
  }
}
