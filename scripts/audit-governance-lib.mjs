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

export const AUDIT_CONSTITUTION_FILE = 'docs/constitution/AUDIT-CONSTITUTION.md';
export const AUDIT_AUTHORITY_FILE = 'docs/constitution/AUDIT-AUTHORITIES.md';
export const AUDIT_DOMAIN_POLICY_FILE = 'docs/constitution/AUDIT-DOMAIN-POLICY.md';
export const AUDIT_COVERAGE_POLICY_FILE = 'docs/constitution/AUDIT-COVERAGE-POLICY.md';
export const AUDIT_TRACEABILITY_POLICY_FILE = 'docs/constitution/AUDIT-TRACEABILITY-POLICY.md';
export const AUDIT_INTEGRITY_POLICY_FILE = 'docs/constitution/AUDIT-INTEGRITY-POLICY.md';
export const AUDIT_CERTIFICATION_POLICY_FILE = 'docs/constitution/AUDIT-CERTIFICATION-POLICY.md';
export const AUDIT_LIFECYCLE_FILE = 'docs/constitution/AUDIT-LIFECYCLE.md';
export const AUDIT_REMEDIATION_POLICY_FILE = 'docs/constitution/AUDIT-REMEDIATION-POLICY.md';
export const AUDIT_VIOLATION_FILE = 'docs/constitution/AUDIT-VIOLATION-CATALOG.md';
export const AUDIT_GOVERNANCE_FILES = Object.freeze([
  AUDIT_CONSTITUTION_FILE, AUDIT_AUTHORITY_FILE, AUDIT_DOMAIN_POLICY_FILE,
  AUDIT_COVERAGE_POLICY_FILE, AUDIT_TRACEABILITY_POLICY_FILE, AUDIT_INTEGRITY_POLICY_FILE,
  AUDIT_CERTIFICATION_POLICY_FILE, AUDIT_LIFECYCLE_FILE, AUDIT_REMEDIATION_POLICY_FILE,
  AUDIT_VIOLATION_FILE,
]);
export const VALID_AUDIT_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Operational', 'Certification']);
export const VALID_AUDIT_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_AUDIT_LIFECYCLE_STATES = Object.freeze(['Planned', 'Running', 'Blocked', 'Failed', 'Remediating', 'Verified', 'Certified', 'Ratification Ready', 'Retired']);
export const VALID_CERTIFICATION_LEVELS = Object.freeze(['Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']);
export const VALID_SEVERITY_LEVELS = Object.freeze(['Critical', 'High', 'Medium', 'Low']);

export const auditRecords = (root) => markdownTable(readText(root, AUDIT_AUTHORITY_FILE), 'Audit authority catalog');
export const auditLifecycleRecords = (root) => markdownTable(readText(root, AUDIT_LIFECYCLE_FILE), 'Audit lifecycle transition ledger');
export const auditCertificationRecords = (root) => markdownTable(readText(root, AUDIT_CERTIFICATION_POLICY_FILE), 'Certification level catalog');
export const auditRemediationRecords = (root) => markdownTable(readText(root, AUDIT_REMEDIATION_POLICY_FILE), 'Finding registry');

export function auditViolation(path, message, id = 'AUD-V-001') { return governanceViolation(path, `${id} ${message}`); }
export function duplicated(values) { const seen=new Set(), duplicates=new Set(); for(const value of values.filter(Boolean)){if(seen.has(value))duplicates.add(value);seen.add(value);} return [...duplicates]; }
export function auditAmendments(root) { return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) => record.status === 'Ratified' && /Audit|AUD-/i.test(`${record.affectedAuthorities} ${record.body}`) && /\*\*Type:\*\*\s*Type [BC]/.test(record.body)); }
export function requireAuditFiles(root, violations) { for(const file of AUDIT_GOVERNANCE_FILES) requireFile(root, file, violations, 'required audit governance artifact is missing'); }
export function validateAuditVersionParity(root, violations) { const version=currentConstitutionVersion(root); for(const file of AUDIT_GOVERNANCE_FILES){const text=readText(root,file); if(text!==null&&version&&versionFromText(text)!==version)violations.push(auditViolation(file,`declares ${versionFromText(text)??'no Constitution version'} instead of ${version}`));} }
export function validateAuditCatalog(root, violations) {
  const records=auditRecords(root), amendments=new Set(auditAmendments(root).map((r)=>r.id)), owners=authorityNames(root);
  if(!records.length) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,'audit authority catalog contains no records','AUD-V-001'));
  for(const duplicate of duplicated(records.map((r)=>r['Audit Authority ID']))) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,`duplicate audit authority ID '${duplicate}'`,'AUD-V-001'));
  for(const r of records){const id=r['Audit Authority ID'];
    if(!/^AUD-\d{4}$/.test(id)) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,`invalid audit authority ID '${id}'`,'AUD-V-001'));
    if(!r['Audit Authority Name']) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,`${id} is missing an audit authority name`,'AUD-V-001'));
    if(!VALID_AUDIT_CLASSES.includes(r['Authority Class'])) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,`${id} has invalid authority class '${r['Authority Class']}'`,'AUD-V-001'));
    if(!owners.has(r.Owner)) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,`${id} has invalid owner '${r.Owner}'`,'AUD-V-001'));
    if(!amendments.has(r.Amendment)) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,`${id} amendment '${r.Amendment}' is not a ratified audit amendment`,'AUD-V-005'));
    if(!VALID_AUDIT_STATUSES.includes(r.Status)) violations.push(auditViolation(AUDIT_AUTHORITY_FILE,`${id} has invalid status '${r.Status}'`,'AUD-V-001'));
  }
}

export function validateAuditCoverage(root, violations) {
  const text = readText(root, AUDIT_COVERAGE_POLICY_FILE);
  if (!text) { violations.push(auditViolation(AUDIT_COVERAGE_POLICY_FILE, 'audit coverage policy is missing', 'AUD-V-007')); return; }
  const required = ['Artifact Coverage', 'Scanner Coverage', 'Test Coverage', 'Lifecycle Coverage', 'Authority Coverage', 'Violation Coverage', 'Amendment Coverage'];
  for (const category of required) { if (!text.includes(category)) violations.push(auditViolation(AUDIT_COVERAGE_POLICY_FILE, `missing coverage category '${category}'`, 'AUD-V-007')); }
}

export function validateAuditTraceability(root, violations) {
  const text = readText(root, AUDIT_TRACEABILITY_POLICY_FILE);
  if (!text) { violations.push(auditViolation(AUDIT_TRACEABILITY_POLICY_FILE, 'audit traceability policy is missing', 'AUD-V-006')); return; }
  const required = ['Authority', 'Amendment', 'Version', 'Scanner', 'Test', 'Domain'];
  for (const item of required) { if (!text.includes(item)) violations.push(auditViolation(AUDIT_TRACEABILITY_POLICY_FILE, `missing traceability dimension '${item}'`, 'AUD-V-006')); }
}

export function validateAuditIntegrity(root, violations) {
  const text = readText(root, AUDIT_INTEGRITY_POLICY_FILE);
  if (!text) { violations.push(auditViolation(AUDIT_INTEGRITY_POLICY_FILE, 'audit integrity policy is missing', 'AUD-V-008')); return; }
  const required = ['Version Integrity', 'Amendment Integrity', 'Authority Integrity', 'Lifecycle Integrity', 'Policy Integrity', 'Cross-Domain Integrity', 'Scanner Integrity', 'Test Integrity'];
  for (const dim of required) { if (!text.includes(dim)) violations.push(auditViolation(AUDIT_INTEGRITY_POLICY_FILE, `missing integrity dimension '${dim}'`, 'AUD-V-008')); }
}

export function validateAuditCertification(root, violations) {
  const text = readText(root, AUDIT_CERTIFICATION_POLICY_FILE);
  if (!text) { violations.push(auditViolation(AUDIT_CERTIFICATION_POLICY_FILE, 'audit certification policy is missing', 'AUD-V-010')); return; }
  for (const level of VALID_CERTIFICATION_LEVELS) { if (!text.includes(level)) violations.push(auditViolation(AUDIT_CERTIFICATION_POLICY_FILE, `missing certification level '${level}'`, 'AUD-V-010')); }
}

export function validateAuditRemediation(root, violations) {
  const text = readText(root, AUDIT_REMEDIATION_POLICY_FILE);
  if (!text) { violations.push(auditViolation(AUDIT_REMEDIATION_POLICY_FILE, 'audit remediation policy is missing', 'AUD-V-001')); return; }
  const required = ['Finding ID', 'Severity', 'Root Cause', 'Remediation'];
  for (const field of required) { if (!text.includes(field)) violations.push(auditViolation(AUDIT_REMEDIATION_POLICY_FILE, `missing remediation field '${field}'`, 'AUD-V-001')); }
}
