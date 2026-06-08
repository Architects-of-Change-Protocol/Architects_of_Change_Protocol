#!/usr/bin/env node
import {
  AMENDMENT_CATALOG_FILE,
  AMENDMENT_ID_PATTERN,
  AUTHORITY_CATALOG_FILE,
  CONSTITUTION_FILE,
  VERSION_HISTORY_FILE,
  VERSION_PATTERN,
  catalogAmendments,
  currentConstitutionVersion,
  gitHeadText,
  governanceViolation,
  parseVersion,
  versionFromText,
  readText,
  requireFile,
  runScanner,
  uniqueMatches,
} from './constitutional-governance-lib.mjs';

export function scanConstitutionalVersioning(root) {
  const violations = [];
  for (const file of [CONSTITUTION_FILE, VERSION_HISTORY_FILE, AMENDMENT_CATALOG_FILE, AUTHORITY_CATALOG_FILE]) requireFile(root, file, violations);

  const version = currentConstitutionVersion(root);
  if (!version) violations.push(governanceViolation(CONSTITUTION_FILE, 'Constitution version is missing or not in vMAJOR.MINOR format'));

  const history = readText(root, VERSION_HISTORY_FILE) ?? '';
  const catalog = readText(root, AMENDMENT_CATALOG_FILE) ?? '';
  const authority = readText(root, AUTHORITY_CATALOG_FILE) ?? '';

  if (version && !uniqueMatches(history, VERSION_PATTERN).includes(version)) {
    violations.push(governanceViolation(VERSION_HISTORY_FILE, `current Constitution version ${version} is missing from version history`));
  }
  if (version && !uniqueMatches(catalog, VERSION_PATTERN).includes(version)) {
    violations.push(governanceViolation(AMENDMENT_CATALOG_FILE, `current Constitution version ${version} is missing from amendment catalog`));
  }
  if (version && !uniqueMatches(authority, VERSION_PATTERN).includes(version)) {
    violations.push(governanceViolation(AUTHORITY_CATALOG_FILE, `current Constitution version ${version} is missing from authority catalog`));
  }

  const previousVersion = versionFromText(gitHeadText(root, CONSTITUTION_FILE));
  if (version && previousVersion && version !== previousVersion) {
    const current = parseVersion(version);
    const previous = parseVersion(previousVersion);
    if (!current || !previous || current.major < previous.major || (current.major === previous.major && current.minor <= previous.minor)) {
      violations.push(governanceViolation(CONSTITUTION_FILE, `Constitution version ${version} must advance beyond ${previousVersion}`));
    }
    if (!history.includes(version)) violations.push(governanceViolation(VERSION_HISTORY_FILE, `version upgrade ${previousVersion} → ${version} is not tracked`));
  }

  const amendments = catalogAmendments(root);
  if (amendments.length === 0) violations.push(governanceViolation(AMENDMENT_CATALOG_FILE, 'amendment catalog contains no AOC-AMD-#### amendment records'));
  for (const amendment of amendments) {
    if (!amendment.version) violations.push(governanceViolation(AMENDMENT_CATALOG_FILE, `${amendment.id} is missing a Version field`));
    if (!amendment.status) violations.push(governanceViolation(AMENDMENT_CATALOG_FILE, `${amendment.id} is missing a valid Ratification Status`));
    if (amendment.version && !history.includes(amendment.version)) violations.push(governanceViolation(VERSION_HISTORY_FILE, `${amendment.id} version ${amendment.version} is missing from version history`));
    if (!history.includes(amendment.id)) violations.push(governanceViolation(VERSION_HISTORY_FILE, `${amendment.id} is missing from version history`));
  }

  const historyAmendments = uniqueMatches(history, AMENDMENT_ID_PATTERN);
  const catalogIds = new Set(amendments.map((amendment) => amendment.id));
  for (const id of historyAmendments) {
    if (!catalogIds.has(id)) violations.push(governanceViolation(VERSION_HISTORY_FILE, `${id} appears in version history but has no amendment catalog record`));
  }

  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Constitutional versioning scanner', scanConstitutionalVersioning);
}
