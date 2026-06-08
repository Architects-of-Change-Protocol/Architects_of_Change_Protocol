#!/usr/bin/env node
import {
  AMENDMENT_CATALOG_FILE,
  AUTHORITY_CATALOG_FILE,
  VALID_AUTHORITY_STATUSES,
  amendmentRecordsFromText,
  catalogAuthorityOwners,
  gitHeadText,
  governanceViolation,
  hasRatifiedAuthorityAmendment,
  listedAuthorities,
  readText,
  versionFromText,
  currentConstitutionVersion,
  parseVersion,
  requireFile,
  runtimeAuthorityCandidates,
  runScanner,
} from './constitutional-governance-lib.mjs';
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';

export function scanAuthorityGovernance(root) {
  const violations = [...scanConstitutionalVersioning(root)];
  requireFile(root, AUTHORITY_CATALOG_FILE, violations);

  const text = readText(root, AUTHORITY_CATALOG_FILE) ?? '';
  const catalogOwners = catalogAuthorityOwners(root);
  const expected = listedAuthorities();

  const previousAuthorityCatalog = gitHeadText(root, AUTHORITY_CATALOG_FILE);
  if (previousAuthorityCatalog !== null) {
    const previousOwners = new Set([...previousAuthorityCatalog.matchAll(/`([^`]+)`/g)].map((match) => match[1]));
    const addedOwners = [...catalogOwners].filter((owner) => !previousOwners.has(owner));
    if (addedOwners.length > 0) {
      const previousAmendmentIds = new Set(amendmentRecordsFromText(gitHeadText(root, AMENDMENT_CATALOG_FILE) ?? '').map((amendment) => amendment.id));
      const newAuthorityAmendment = amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '').some((amendment) => amendment.status === 'Ratified'
        && !previousAmendmentIds.has(amendment.id)
        && /Authority|Ownership|Compatibility|Composition|Transitional|Canonical/i.test(`${amendment.affectedAuthorities} ${amendment.body}`));
      if (!newAuthorityAmendment) {
        violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `authority catalog adds owners without a new ratified authority amendment: ${addedOwners.join(', ')}`));
      }
      const previousVersion = versionFromText(gitHeadText(root, 'docs/constitution/CONSTITUTION.md'));
      const currentVersion = currentConstitutionVersion(root);
      const previous = parseVersion(previousVersion);
      const current = parseVersion(currentVersion);
      if (!current || !previous || current.major <= previous.major) {
        violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `new constitutional authorities require a major Constitution version increment from ${previousVersion ?? 'the previous version'}`));
      }
    }
  }

  for (const owner of expected) {
    if (!catalogOwners.has(owner)) violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `constitutional authority owner '${owner}' is missing from the authority catalog`));
  }

  for (const owner of runtimeAuthorityCandidates(root)) {
    if (!catalogOwners.has(owner)) {
      const suffix = hasRatifiedAuthorityAmendment(root) ? 'update the authority catalog to complete the ratified amendment' : 'no ratified authority amendment exists';
      violations.push(governanceViolation(owner, `runtime or adapter authority root '${owner}' is not cataloged; ${suffix}`));
    }
  }

  const tableRows = text.split(/\r?\n/).filter((line) => /^\|[^-]/.test(line) && !/^\|\s*Authority\s*\|/.test(line));
  for (const row of tableRows) {
    const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 6) continue;
    const [authority, owner, purpose, creation, retirement, status] = cells;
    if (!authority || !owner || !purpose || !creation || !retirement || !status) {
      violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `authority row '${row}' is missing required lifecycle fields`));
    }
    if (!VALID_AUTHORITY_STATUSES.includes(status)) {
      violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `authority '${authority}' has invalid status '${status}'`));
    }
    if (!/AOC-AMD-\d{4}/.test(creation)) {
      violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `authority '${authority}' is missing a creation amendment`));
    }
    if (!(/AOC-AMD-\d{4}/.test(retirement) || /Not scheduled|Required before retirement/.test(retirement))) {
      violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `authority '${authority}' is missing a retirement amendment policy`));
    }
  }

  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Authority governance scanner', scanAuthorityGovernance);
}
