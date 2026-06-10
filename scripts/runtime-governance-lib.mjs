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

export const RUNTIME_CONSTITUTION_FILE = 'docs/constitution/RUNTIME-CONSTITUTION.md';
export const RUNTIME_AUTHORITY_FILE = 'docs/constitution/RUNTIME-AUTHORITIES.md';
export const RUNTIME_EXECUTION_FILE = 'docs/constitution/RUNTIME-EXECUTION-POLICY.md';
export const RUNTIME_CAPABILITY_FILE = 'docs/constitution/RUNTIME-CAPABILITY-POLICY.md';
export const RUNTIME_EVIDENCE_FILE = 'docs/constitution/RUNTIME-EVIDENCE-POLICY.md';
export const RUNTIME_INTEGRITY_FILE = 'docs/constitution/RUNTIME-INTEGRITY-POLICY.md';
export const RUNTIME_OBLIGATION_FILE = 'docs/constitution/RUNTIME-OBLIGATION-POLICY.md';
export const RUNTIME_OUTCOME_FILE = 'docs/constitution/RUNTIME-OUTCOME-POLICY.md';
export const RUNTIME_AUDIT_FILE = 'docs/constitution/RUNTIME-AUDIT-POLICY.md';
export const RUNTIME_LIFECYCLE_FILE = 'docs/constitution/RUNTIME-LIFECYCLE.md';
export const RUNTIME_CHALLENGE_FILE = 'docs/constitution/RUNTIME-CHALLENGE-POLICY.md';
export const RUNTIME_REVOCATION_FILE = 'docs/constitution/RUNTIME-REVOCATION-POLICY.md';
export const RUNTIME_VIOLATION_FILE = 'docs/constitution/RUNTIME-VIOLATION-CATALOG.md';
export const RUNTIME_GOVERNANCE_FILES = Object.freeze([
  RUNTIME_CONSTITUTION_FILE, RUNTIME_AUTHORITY_FILE, RUNTIME_EXECUTION_FILE,
  RUNTIME_CAPABILITY_FILE, RUNTIME_EVIDENCE_FILE, RUNTIME_INTEGRITY_FILE,
  RUNTIME_OBLIGATION_FILE, RUNTIME_OUTCOME_FILE, RUNTIME_AUDIT_FILE,
  RUNTIME_LIFECYCLE_FILE, RUNTIME_CHALLENGE_FILE, RUNTIME_REVOCATION_FILE,
  RUNTIME_VIOLATION_FILE,
]);
export const VALID_RUNTIME_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_RUNTIME_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_REVOCATION_CAUSES = Object.freeze(['Fraud', 'Integrity Failure', 'Evidence Failure', 'Authority Failure', 'Capability Failure', 'Constitutional Override', 'Governance Decision']);
export const VALID_CHALLENGE_GROUNDS = Object.freeze(['Invalid Authority', 'Invalid Capability', 'Invalid Policy', 'Invalid Execution', 'Invalid Evidence', 'Integrity Failure', 'Compliance Failure', 'Audit Failure', 'Economic Failure']);
export const VALID_LIFECYCLE_STATES = Object.freeze(['Planned', 'Authorized', 'Queued', 'Executing', 'Completed', 'Failed', 'Suspended', 'Challenged', 'Revoked', 'Retired']);
export const VALID_EXECUTION_STATUSES = Object.freeze(['Planned', 'Authorized', 'Executing', 'Completed', 'Failed', 'Suspended', 'Revoked', 'Retired']);
export const VALID_RESULT_TYPES = Object.freeze(['Succeeded', 'Partially Succeeded', 'Failed', 'Rejected', 'Superseded', 'Revoked']);
export const RUNTIME_TRANSITIONS = new Map([
  ['Planned', new Set(['Authorized'])],
  ['Authorized', new Set(['Queued', 'Revoked'])],
  ['Queued', new Set(['Executing', 'Revoked'])],
  ['Executing', new Set(['Completed', 'Failed', 'Suspended'])],
  ['Failed', new Set(['Executing', 'Retired'])],
  ['Suspended', new Set(['Executing', 'Revoked'])],
  ['Completed', new Set(['Retired'])],
  ['Challenged', new Set(['Executing', 'Revoked', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const runtimeRecords = (root) => markdownTable(readText(root, RUNTIME_AUTHORITY_FILE), 'Runtime authority catalog');
export const runtimeExecutionRecords = (root) => markdownTable(readText(root, RUNTIME_EXECUTION_FILE), 'Execution policy catalog');
export const runtimeCapabilityRecords = (root) => markdownTable(readText(root, RUNTIME_CAPABILITY_FILE), 'Capability policy catalog');
export const runtimeEvidenceRecords = (root) => markdownTable(readText(root, RUNTIME_EVIDENCE_FILE), 'Evidence policy catalog');
export const runtimeIntegrityRecords = (root) => markdownTable(readText(root, RUNTIME_INTEGRITY_FILE), 'Integrity policy catalog');
export const runtimeObligationRecords = (root) => markdownTable(readText(root, RUNTIME_OBLIGATION_FILE), 'Obligation policy catalog');
export const runtimeOutcomeRecords = (root) => markdownTable(readText(root, RUNTIME_OUTCOME_FILE), 'Outcome policy catalog');
export const runtimeAuditRecords = (root) => markdownTable(readText(root, RUNTIME_AUDIT_FILE), 'Audit policy catalog');
export const runtimeLifecycleRecords = (root) => markdownTable(readText(root, RUNTIME_LIFECYCLE_FILE), 'Runtime lifecycle transition ledger');
export const runtimeChallengeRecords = (root) => markdownTable(readText(root, RUNTIME_CHALLENGE_FILE), 'Challenge registry');
export const runtimeRevocationRecords = (root) => markdownTable(readText(root, RUNTIME_REVOCATION_FILE), 'Revocation authority registry');

export function runtimeViolation(path, message, id = 'RUN-V-014') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function runtimeAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Runtime|RUN-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireRuntimeFiles(root, violations) { for(const file of RUNTIME_GOVERNANCE_FILES) requireFile(root, file, violations, 'required runtime governance artifact is missing'); }
export function validateRuntimeVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of RUNTIME_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(runtimeViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateRuntimeCatalog(root, violations) {
  const records=runtimeRecords(root), amendments=new Set(runtimeAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,'runtime authority catalog contains no records','RUN-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Runtime Authority ID']))) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`duplicate runtime authority ID '${duplicate}'`,'RUN-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Runtime Authority Name']))) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`duplicate runtime authority name '${duplicate}'`,'RUN-V-001'));
  for(const r of records){const id=r['Runtime Authority ID'];
    if(!/^RUN-\d{4}$/.test(id)) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`invalid runtime authority ID '${id}'`,'RUN-V-001'));
    if(!r['Runtime Authority Name']) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} is missing a runtime authority name`,'RUN-V-014'));
    if(!VALID_RUNTIME_CLASSES.includes(r['Authority Class'])) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} has invalid authority class '${r['Authority Class']}'`,'RUN-V-014'));
    if(!owners.has(r.Owner)) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'RUN-V-014'));
    if(!/^REP-\d{4}$/.test(r['Execution Policy'])) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} has invalid execution policy '${r['Execution Policy']}'`,'RUN-V-001'));
    if(!/^RCP-\d{4}$/.test(r['Capability Policy'])) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} has invalid capability policy '${r['Capability Policy']}'`,'RUN-V-002'));
    if(!['Yes','No'].includes(r.Revocable)) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} has invalid Revocable value '${r.Revocable}'`,'RUN-V-014'));
    if(!['Yes','No'].includes(r.Challengeable)) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} has invalid Challengeable value '${r.Challengeable}'`,'RUN-V-014'));
    if(!amendments.has(r['Creation Amendment'])) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} creation amendment '${r['Creation Amendment']}' is not a ratified runtime amendment`,'RUN-V-010'));
    if(r['Retirement Amendment']!=='Not scheduled'&&!amendments.has(r['Retirement Amendment'])) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} retirement amendment '${r['Retirement Amendment']}' is invalid`,'RUN-V-010'));
    if(!VALID_RUNTIME_STATUSES.includes(r.Status)) violations.push(runtimeViolation(RUNTIME_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'RUN-V-014'));
  }
}
