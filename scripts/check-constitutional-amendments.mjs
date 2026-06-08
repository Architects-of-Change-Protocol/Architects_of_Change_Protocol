#!/usr/bin/env node
import {
  AMENDMENT_CATALOG_FILE,
  CONSTITUTION_FILE,
  VERSION_HISTORY_FILE,
  amendmentRecordsFromText,
  changedConstitutionalFiles,
  currentConstitutionVersion,
  gitChangedFiles,
  gitHeadText,
  governanceViolation,
  hasRatifiedConstitutionalAmendment,
  readText,
  requireFile,
  runScanner,
  versionFromText,
} from './constitutional-governance-lib.mjs';
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';

export function scanConstitutionalAmendments(root) {
  const violations = [...scanConstitutionalVersioning(root)];
  for (const file of [CONSTITUTION_FILE, VERSION_HISTORY_FILE, AMENDMENT_CATALOG_FILE]) requireFile(root, file, violations);

  const protectedChanges = changedConstitutionalFiles(root);
  if (protectedChanges.length === 0) return violations;

  const changedFiles = gitChangedFiles(root);
  const version = currentConstitutionVersion(root);
  const history = readText(root, VERSION_HISTORY_FILE) ?? '';
  const catalog = readText(root, AMENDMENT_CATALOG_FILE) ?? '';
  const headCatalog = gitHeadText(root, AMENDMENT_CATALOG_FILE);
  const headConstitution = gitHeadText(root, CONSTITUTION_FILE);

  if (headCatalog !== null) {
    const previousIds = new Set(amendmentRecordsFromText(headCatalog).map((amendment) => amendment.id));
    const newRatified = amendmentRecordsFromText(catalog).filter((amendment) => amendment.status === 'Ratified'
      && !previousIds.has(amendment.id)
      && /LAW-\d{3}|Constitution|Violation catalog|Enforcement matrix|Constitutional policy/i.test(`${amendment.affectedLaws} ${amendment.affectedAuthorities} ${amendment.body}`));
    if (newRatified.length === 0) {
      violations.push(governanceViolation(AMENDMENT_CATALOG_FILE, `protected constitutional files changed without a new ratified amendment record: ${protectedChanges.join(', ')}`));
    }
    for (const required of [CONSTITUTION_FILE, VERSION_HISTORY_FILE, AMENDMENT_CATALOG_FILE]) {
      if (!changedFiles?.includes(required)) violations.push(governanceViolation(required, `protected constitutional changes require ${required} to be updated in the same change`));
    }
    const previousVersion = versionFromText(headConstitution);
    if (!version || version === previousVersion) {
      violations.push(governanceViolation(CONSTITUTION_FILE, `protected constitutional changes require a version increment from ${previousVersion ?? 'the previous version'}`));
    }
  } else if (!hasRatifiedConstitutionalAmendment(root)) {
    violations.push(governanceViolation(AMENDMENT_CATALOG_FILE, `protected constitutional files changed without a ratified amendment record: ${protectedChanges.join(', ')}`));
  }

  if (!version || !history.includes(version) || !catalog.includes(version)) {
    violations.push(governanceViolation(CONSTITUTION_FILE, 'protected constitutional file changes require a Constitution version, version history entry, and catalog version reference'));
  }

  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Constitutional amendment scanner', scanConstitutionalAmendments);
}
