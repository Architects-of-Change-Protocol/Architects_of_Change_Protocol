import {
  AMENDMENT_CATALOG_FILE,
  amendmentRecordsFromText,
  currentConstitutionVersion,
  governanceViolation,
  readText,
  requireFile,
  versionFromText,
} from './constitutional-governance-lib.mjs';
import { authorityNames, capabilityRecords, markdownTable } from './capability-governance-lib.mjs';

export const POLICY_CONSTITUTION_FILE = 'docs/constitution/POLICY-CONSTITUTION.md';
export const POLICY_AUTHORITY_FILE = 'docs/constitution/POLICY-AUTHORITIES.md';
export const POLICY_LIFECYCLE_FILE = 'docs/constitution/POLICY-LIFECYCLE.md';
export const POLICY_HIERARCHY_FILE = 'docs/constitution/POLICY-HIERARCHY.md';
export const POLICY_EXCEPTION_FILE = 'docs/constitution/POLICY-EXCEPTION-POLICY.md';
export const POLICY_CONFLICT_FILE = 'docs/constitution/POLICY-CONFLICT-RESOLUTION.md';
export const POLICY_VIOLATION_FILE = 'docs/constitution/POLICY-VIOLATION-CATALOG.md';

export const POLICY_GOVERNANCE_FILES = Object.freeze([
  POLICY_CONSTITUTION_FILE,
  POLICY_AUTHORITY_FILE,
  POLICY_LIFECYCLE_FILE,
  POLICY_HIERARCHY_FILE,
  POLICY_EXCEPTION_FILE,
  POLICY_CONFLICT_FILE,
  POLICY_VIOLATION_FILE,
]);
export const VALID_POLICY_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_POLICY_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_POLICY_STATES = Object.freeze(['Proposed', 'Ratified', 'Active', 'Suspended', 'Revoked', 'Retired']);
export const VALID_EXCEPTION_TYPES = Object.freeze(['Temporary', 'Emergency', 'Migration', 'Transitional']);
export const POLICY_TRANSITIONS = new Map([
  ['Proposed', new Set(['Ratified', 'Retired'])],
  ['Ratified', new Set(['Active', 'Revoked', 'Retired'])],
  ['Active', new Set(['Suspended', 'Revoked', 'Retired'])],
  ['Suspended', new Set(['Active', 'Revoked', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

export const policyRecords = (root) => markdownTable(readText(root, POLICY_AUTHORITY_FILE), 'Policy catalog');
export const delegationRecords = (root) => markdownTable(readText(root, POLICY_AUTHORITY_FILE), 'Policy delegation records');
export const lifecycleRecords = (root) => markdownTable(readText(root, POLICY_LIFECYCLE_FILE), 'Lifecycle transition ledger');
export const inheritanceRecords = (root) => markdownTable(readText(root, POLICY_HIERARCHY_FILE), 'Inheritance registry');
export const exceptionRecords = (root) => markdownTable(readText(root, POLICY_EXCEPTION_FILE), 'Exception registry');
export const conflictRecords = (root) => markdownTable(readText(root, POLICY_CONFLICT_FILE), 'Conflict registry');

export function policyViolation(path, message, id = 'POL-V-010') {
  return governanceViolation(path, `${id} ${message}`);
}

export function duplicated(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function ratifiedPolicyAmendments(root) {
  return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) =>
    record.status === 'Ratified' && /\*\*Type:\*\*\s*Type [BC]/.test(record.body));
}

export function requirePolicyFiles(root, violations) {
  for (const file of POLICY_GOVERNANCE_FILES) requireFile(root, file, violations, 'required policy governance artifact is missing');
}

export function validatePolicyVersionParity(root, violations) {
  const version = currentConstitutionVersion(root);
  for (const file of POLICY_GOVERNANCE_FILES) {
    const text = readText(root, file);
    if (text !== null && version && versionFromText(text) !== version) {
      violations.push(policyViolation(file, `declares ${versionFromText(text) ?? 'no Constitution version'} instead of ${version}`));
    }
  }
}

export function parseCapabilityIds(value = '') {
  const ids = new Set();
  for (const part of value.split(/\s*,\s*/).filter(Boolean)) {
    const range = part.match(/^CAP-(\d{4})\s*[–-]\s*CAP-(\d{4})$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start <= end && end - start <= 9999) {
        for (let id = start; id <= end; id += 1) ids.add(`CAP-${String(id).padStart(4, '0')}`);
      }
      continue;
    }
    if (/^CAP-\d{4}$/.test(part)) ids.add(part);
  }
  return ids;
}

export function activePolicies(root) {
  return policyRecords(root).filter((policy) => policy.Status === 'Canonical' && policy['Lifecycle State'] === 'Active');
}

export function validatePolicyCatalog(root, violations) {
  const policies = policyRecords(root);
  const amendments = new Map(ratifiedPolicyAmendments(root).map((record) => [record.id, record]));
  const owners = authorityNames(root);
  const capabilities = new Set(capabilityRecords(root).map((record) => record['Capability ID']));

  if (policies.length === 0) violations.push(policyViolation(POLICY_AUTHORITY_FILE, 'policy catalog contains no policy records', 'POL-V-001'));
  for (const duplicate of duplicated(policies.map((policy) => policy['Policy ID']))) {
    violations.push(policyViolation(POLICY_AUTHORITY_FILE, `duplicate policy ID '${duplicate}'`, 'POL-V-001'));
  }
  for (const policy of policies) {
    const id = policy['Policy ID'];
    if (!/^POL-\d{4}$/.test(id)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `invalid policy ID '${id}'`, 'POL-V-001'));
    if (!VALID_POLICY_CLASSES.includes(policy['Policy Class'])) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has invalid policy class '${policy['Policy Class']}'`, 'POL-V-001'));
    if (!owners.has(policy.Owner)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has invalid owner '${policy.Owner}'`, 'POL-V-001'));
    if (!['Yes', 'No'].includes(policy.Delegable)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has invalid Delegable value '${policy.Delegable}'`, 'POL-V-009'));
    if (!VALID_POLICY_STATUSES.includes(policy.Status)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has invalid status '${policy.Status}'`, 'POL-V-001'));
    if (!VALID_POLICY_STATES.includes(policy['Lifecycle State'])) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has invalid lifecycle state '${policy['Lifecycle State']}'`, 'POL-V-008'));
    for (const field of ['Priority', 'Constraint Strength']) {
      if (!/^\d+$/.test(policy[field]) || Number(policy[field]) < 0) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has invalid ${field.toLowerCase()} '${policy[field]}'`, 'POL-V-001'));
    }
    if (!['Require', 'Deny', 'Allow'].includes(policy.Effect)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has invalid effect '${policy.Effect}'`, 'POL-V-001'));
    const amendment = amendments.get(policy['Creation Amendment']);
    if (!amendment) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} creation amendment '${policy['Creation Amendment']}' is not a ratified Type B or Type C amendment`, 'POL-V-001'));
    const applied = parseCapabilityIds(policy['Applies To Capability IDs']);
    if (applied.size === 0) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} has no valid applicable capability IDs`, 'POL-V-001'));
    for (const capability of applied) if (!capabilities.has(capability)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} references unknown capability '${capability}'`, 'POL-V-001'));
    if (policy.Status === 'Retired' && policy['Retirement Amendment'] === 'Not scheduled') violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${id} is retired without a retirement amendment`, 'POL-V-005'));
  }

  const covered = new Set(activePolicies(root).flatMap((policy) => [...parseCapabilityIds(policy['Applies To Capability IDs'])]));
  for (const capability of capabilityRecords(root).filter((record) => record.Status === 'Canonical')) {
    if (!covered.has(capability['Capability ID'])) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${capability['Capability ID']} has no active applicable policy`, 'POL-V-007'));
  }

  for (const delegation of delegationRecords(root)) {
    const policy = policies.find((record) => record['Policy ID'] === delegation['Policy ID']);
    if (!policy || policy.Delegable !== 'Yes') violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${delegation['Delegation ID']} delegates a missing or non-delegable policy '${delegation['Policy ID']}'`, 'POL-V-009'));
    if (!amendments.has(delegation.Amendment)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${delegation['Delegation ID']} lacks a ratified Type B or Type C amendment`, 'POL-V-009'));
    if (!delegation.Expiration || !/^\d{4}-\d{2}-\d{2}$/.test(delegation.Expiration)) violations.push(policyViolation(POLICY_AUTHORITY_FILE, `${delegation['Delegation ID']} lacks a concrete expiration`, 'POL-V-009'));
  }
}
