import {
  AMENDMENT_CATALOG_FILE,
  AUTHORITY_CATALOG_FILE,
  amendmentRecordsFromText,
  currentConstitutionVersion,
  gitHeadText,
  governanceViolation,
  parseVersion,
  readText,
  requireFile,
  versionFromText,
} from './constitutional-governance-lib.mjs';

export const CAPABILITY_CONSTITUTION_FILE = 'docs/constitution/CAPABILITY-CONSTITUTION.md';
export const CAPABILITY_AUTHORITY_FILE = 'docs/constitution/CAPABILITY-AUTHORITIES.md';
export const CAPABILITY_LIFECYCLE_FILE = 'docs/constitution/CAPABILITY-LIFECYCLE.md';
export const CAPABILITY_DELEGATION_FILE = 'docs/constitution/CAPABILITY-DELEGATION-POLICY.md';
export const CAPABILITY_REVOCATION_FILE = 'docs/constitution/CAPABILITY-REVOCATION-POLICY.md';
export const CAPABILITY_VIOLATION_FILE = 'docs/constitution/CAPABILITY-VIOLATION-CATALOG.md';

export const CAPABILITY_GOVERNANCE_FILES = Object.freeze([
  CAPABILITY_CONSTITUTION_FILE,
  CAPABILITY_AUTHORITY_FILE,
  CAPABILITY_LIFECYCLE_FILE,
  CAPABILITY_DELEGATION_FILE,
  CAPABILITY_REVOCATION_FILE,
  CAPABILITY_VIOLATION_FILE,
]);

export const VALID_CAPABILITY_CLASSES = Object.freeze(['Constitutional', 'Governance', 'Runtime', 'Operational']);
export const VALID_CAPABILITY_STATUSES = Object.freeze(['Canonical', 'Deprecated', 'Retired']);
export const VALID_LIFECYCLE_STATES = Object.freeze(['Proposed', 'Ratified', 'Delegated', 'Suspended', 'Revoked', 'Retired']);
export const ACTIVE_LIFECYCLE_STATES = Object.freeze(['Ratified', 'Delegated']);
export const ALLOWED_TRANSITIONS = new Map([
  ['Proposed', new Set(['Ratified', 'Retired'])],
  ['Ratified', new Set(['Delegated', 'Suspended', 'Revoked', 'Retired'])],
  ['Delegated', new Set(['Delegated', 'Suspended', 'Revoked', 'Retired'])],
  ['Suspended', new Set(['Ratified', 'Delegated', 'Revoked', 'Retired'])],
  ['Revoked', new Set(['Retired'])],
  ['Retired', new Set()],
]);

function cleanCell(value) {
  return value.trim().replace(/^`|`$/g, '');
}

export function markdownTable(text, heading) {
  const headingPattern = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\s*$`, 'mi');
  const match = headingPattern.exec(text ?? '');
  if (!match) return [];
  const section = (text ?? '').slice(match.index + match[0].length).split(/^##\s+/m)[0];
  const lines = section.split(/\r?\n/).filter((line) => line.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const headers = lines[0].split('|').slice(1, -1).map(cleanCell);
  return lines.slice(2).map((line) => {
    const cells = line.split('|').slice(1, -1).map(cleanCell);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? '']));
  }).filter((row) => Object.values(row).some(Boolean));
}

export function capabilityRecords(root) {
  return markdownTable(readText(root, CAPABILITY_AUTHORITY_FILE), 'Capability catalog');
}

export function assignmentRecords(root) {
  return markdownTable(readText(root, CAPABILITY_AUTHORITY_FILE), 'Capability authority assignments');
}

export function transitionRecords(root) {
  return markdownTable(readText(root, CAPABILITY_AUTHORITY_FILE), 'Capability lifecycle transition ledger');
}

export function authorityNames(root) {
  const text = readText(root, AUTHORITY_CATALOG_FILE) ?? '';
  const names = new Set();
  for (const line of text.split(/\r?\n/)) {
    if (!/^\|[^-]/.test(line) || /^\|\s*Authority\s*\|/.test(line)) continue;
    const name = cleanCell(line.split('|')[1] ?? '');
    if (name) names.add(name);
  }
  return names;
}

export function ratifiedAmendmentIds(root) {
  return new Set(amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '')
    .filter((record) => record.status === 'Ratified')
    .map((record) => record.id));
}

export function capabilityAmendments(root) {
  return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').filter((record) =>
    record.status === 'Ratified'
    && /Capability|CAP-\d{4}|Delegation|Revocation/i.test(`${record.affectedAuthorities} ${record.body}`)
    && /\*\*Type:\*\*\s*Type [BC]/.test(record.body));
}

export function capabilityViolation(path, message, id = 'CAP-V-010') {
  return governanceViolation(path, `${id} ${message}`);
}

export function requireCapabilityFiles(root, violations) {
  for (const file of CAPABILITY_GOVERNANCE_FILES) requireFile(root, file, violations, 'required capability governance artifact is missing');
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

export function validateVersionParity(root, violations) {
  const version = currentConstitutionVersion(root);
  for (const file of CAPABILITY_GOVERNANCE_FILES) {
    const text = readText(root, file);
    if (text !== null && version && versionFromText(text) !== version) {
      violations.push(capabilityViolation(file, `declares ${versionFromText(text) ?? 'no Constitution version'} instead of ${version}`, 'CAP-V-010'));
    }
  }
}

export function validateCatalogBasics(root, violations) {
  const capabilities = capabilityRecords(root);
  const assignments = assignmentRecords(root);
  const transitions = transitionRecords(root);
  const amendments = ratifiedAmendmentIds(root);
  const owners = authorityNames(root);

  if (capabilities.length === 0) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, 'capability catalog contains no capability records', 'CAP-V-001'));
  if (assignments.length === 0) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, 'capability catalog contains no authority assignments', 'CAP-V-001'));

  for (const duplicate of duplicated(capabilities.map((record) => record['Capability ID']))) {
    violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `duplicate capability ID '${duplicate}'`, 'CAP-V-006'));
  }
  for (const duplicate of duplicated(assignments.map((record) => record['Assignment ID']))) {
    violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `duplicate assignment ID '${duplicate}'`, 'CAP-V-006'));
  }
  for (const duplicate of duplicated(transitions.map((record) => record['Transition ID']))) {
    violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `duplicate transition ID '${duplicate}'`, 'CAP-V-006'));
  }

  const capabilityIds = new Set(capabilities.map((record) => record['Capability ID']));
  const assignmentIds = new Set(assignments.map((record) => record['Assignment ID']));
  for (const record of capabilities) {
    const id = record['Capability ID'];
    if (!/^CAP-\d{4}$/.test(id)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `invalid capability ID '${id}'`, 'CAP-V-001'));
    if (!record.Name) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id || 'capability row'} is missing Name`, 'CAP-V-001'));
    if (!VALID_CAPABILITY_CLASSES.includes(record['Capability Class'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} has invalid capability class '${record['Capability Class']}'`, 'CAP-V-010'));
    if (!owners.has(record.Owner)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} has invalid owner '${record.Owner}'`, 'CAP-V-005'));
    if (!['Yes', 'No'].includes(record.Delegable)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} has invalid Delegable value '${record.Delegable}'`, 'CAP-V-002'));
    if (!['Yes', 'No'].includes(record.Revocable)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} has invalid Revocable value '${record.Revocable}'`, 'CAP-V-003'));
    if (record['Capability Class'] === 'Constitutional' && record.Delegable !== 'No') violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} is Constitutional and must be non-delegable`, 'CAP-V-002'));
    if (!amendments.has(record['Creation Amendment'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} creation amendment '${record['Creation Amendment']}' is not ratified`, 'CAP-V-001'));
    if (!(record['Retirement Amendment'] === 'Not scheduled' || amendments.has(record['Retirement Amendment']))) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} retirement amendment '${record['Retirement Amendment']}' is neither ratified nor 'Not scheduled'`, 'CAP-V-010'));
    if (!VALID_CAPABILITY_STATUSES.includes(record.Status)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} has invalid status '${record.Status}'`, 'CAP-V-010'));
    if (record.Status === 'Retired' && record['Retirement Amendment'] === 'Not scheduled') violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} is Retired without a retirement amendment`, 'CAP-V-004'));
  }

  for (const record of assignments) {
    const id = record['Assignment ID'];
    if (!/^CAA-\d{4}$/.test(id)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `invalid assignment ID '${id}'`, 'CAP-V-006'));
    if (!capabilityIds.has(record['Capability ID'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} references unknown capability '${record['Capability ID']}'`, 'CAP-V-001'));
    if (!owners.has(record.Holder) || !owners.has(record['Granted By'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} has invalid holder or grantor authority`, 'CAP-V-005'));
    if (record['Parent Assignment'] !== 'Root' && !assignmentIds.has(record['Parent Assignment'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} references unknown parent assignment '${record['Parent Assignment']}'`, 'CAP-V-002'));
    if (!VALID_LIFECYCLE_STATES.includes(record['Lifecycle State'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} has invalid lifecycle state '${record['Lifecycle State']}'`, 'CAP-V-007'));
    if (!amendments.has(record.Amendment)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${id} amendment '${record.Amendment}' is not ratified`, 'CAP-V-001'));
  }

  for (const record of transitions) {
    if (!/^CAT-\d{4}$/.test(record['Transition ID'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `invalid transition ID '${record['Transition ID']}'`, 'CAP-V-006'));
    if (!VALID_LIFECYCLE_STATES.includes(record.From) || !VALID_LIFECYCLE_STATES.includes(record.To) || !ALLOWED_TRANSITIONS.get(record.From)?.has(record.To)) {
      violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${record['Transition ID']} contains invalid lifecycle transition '${record.From}' → '${record.To}'`, 'CAP-V-007'));
    }
    const range = /^CAA-(\d{4})\.\.CAA-(\d{4})$/.exec(record['Assignment ID']);
    if (!assignmentIds.has(record['Assignment ID']) && !range) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${record['Transition ID']} references unknown assignment '${record['Assignment ID']}'`, 'CAP-V-007'));
    if (range && (Number(range[1]) > Number(range[2]) || record.Amendment !== 'AOC-AMD-0002')) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${record['Transition ID']} uses an unauthorized assignment range`, 'CAP-V-007'));
    if (!owners.has(record['Authorized By'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${record['Transition ID']} has invalid authorizing authority '${record['Authorized By']}'`, 'CAP-V-005'));
    if (!amendments.has(record.Amendment)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${record['Transition ID']} amendment '${record.Amendment}' is not ratified`, 'CAP-V-007'));
  }

  return { capabilities, assignments, transitions };
}

export function validateNewCapabilityGovernance(root, violations) {
  const previousCatalog = gitHeadText(root, CAPABILITY_AUTHORITY_FILE);
  if (previousCatalog === null) return;
  const previousCapabilities = markdownTable(previousCatalog, 'Capability catalog');
  const previousAssignments = markdownTable(previousCatalog, 'Capability authority assignments');
  const currentCapabilities = capabilityRecords(root);
  const currentAssignments = assignmentRecords(root);
  const previousById = new Map(previousCapabilities.map((record) => [record['Capability ID'], record]));
  const previousAssignmentsById = new Map(previousAssignments.map((record) => [record['Assignment ID'], record]));
  const changedCapabilities = currentCapabilities.filter((record) => JSON.stringify(record) !== JSON.stringify(previousById.get(record['Capability ID'])));
  const changedAssignments = currentAssignments.filter((record) => JSON.stringify(record) !== JSON.stringify(previousAssignmentsById.get(record['Assignment ID'])));
  if (changedCapabilities.length === 0 && changedAssignments.length === 0) return;

  const previousAmendments = new Set(amendmentRecordsFromText(gitHeadText(root, AMENDMENT_CATALOG_FILE) ?? '').map((record) => record.id));
  const newAmendments = capabilityAmendments(root).filter((record) => !previousAmendments.has(record.id));
  if (newAmendments.length === 0) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, 'new or changed capability definitions or authority assignments require a new ratified Type B or Type C amendment', 'CAP-V-001'));

  const previousVersion = versionFromText(gitHeadText(root, 'docs/constitution/CONSTITUTION.md'));
  const currentVersion = currentConstitutionVersion(root);
  const previous = parseVersion(previousVersion);
  const current = parseVersion(currentVersion);
  if (!previous || !current || current.major <= previous.major) {
    violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `new or changed capability definitions require a major Constitution version increment from ${previousVersion ?? 'the previous version'}`, 'CAP-V-010'));
  }
}
