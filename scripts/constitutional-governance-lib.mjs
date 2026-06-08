import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  AUTHORIZED_COMPOSITION_FILES,
  COMPATIBILITY_ROOTS,
  TRANSITIONAL_RUNTIME_OWNERS,
  relativePath,
  runScanner,
  violation,
} from './constitutional-boundary-lib.mjs';

export { runScanner };

export const CONSTITUTION_DIR = 'docs/constitution';
export const CONSTITUTION_FILE = `${CONSTITUTION_DIR}/CONSTITUTION.md`;
export const VERSION_HISTORY_FILE = `${CONSTITUTION_DIR}/CONSTITUTION-VERSION-HISTORY.md`;
export const AMENDMENT_PROCEDURE_FILE = `${CONSTITUTION_DIR}/AMENDMENT-PROCEDURE.md`;
export const AMENDMENT_CATALOG_FILE = `${CONSTITUTION_DIR}/AMENDMENT-CATALOG.md`;
export const AUTHORITY_CATALOG_FILE = `${CONSTITUTION_DIR}/CONSTITUTIONAL-AUTHORITIES.md`;

export const PROTECTED_CONSTITUTIONAL_FILES = Object.freeze([
  `${CONSTITUTION_DIR}/ARCHITECTURAL-LAWS.md`,
  `${CONSTITUTION_DIR}/CONSTITUTIONAL-BOUNDARY-POLICY.md`,
  `${CONSTITUTION_DIR}/BOUNDARY-VIOLATION-CATALOG.md`,
  `${CONSTITUTION_DIR}/BOUNDARY-ENFORCEMENT-MATRIX.md`,
]);

export const GOVERNANCE_FILES = Object.freeze([
  CONSTITUTION_FILE,
  VERSION_HISTORY_FILE,
  AMENDMENT_PROCEDURE_FILE,
  AMENDMENT_CATALOG_FILE,
  AUTHORITY_CATALOG_FILE,
]);

export const VERSION_PATTERN = /v\d+\.\d+/g;
export const AMENDMENT_ID_PATTERN = /AOC-AMD-\d{4}/g;
export const VALID_RATIFICATION_STATUSES = Object.freeze(['Ratified', 'Pending', 'Rejected', 'Superseded']);
export const VALID_AUTHORITY_STATUSES = Object.freeze(['Canonical', 'Transitional', 'Deprecated', 'Retired']);

export function readText(root, path) {
  const absolute = resolve(root, path);
  if (!existsSync(absolute)) return null;
  return readFileSync(absolute, 'utf8');
}

export function requireFile(root, path, violations, message = 'required constitutional governance artifact is missing') {
  if (!existsSync(resolve(root, path))) violations.push(violation('LAW-008', path, 1, message));
}

export function uniqueMatches(text, pattern) {
  return [...new Set([...(text ?? '').matchAll(pattern)].map((match) => match[0]))];
}


export function gitHeadText(root, path) {
  const result = spawnSync('git', ['-C', root, 'show', `HEAD:${path}`], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout : null;
}

export function versionFromText(text) {
  return text?.match(/\*\*Constitution Version:\*\*\s*(v\d+\.\d+)/)?.[1] ?? null;
}

export function parseVersion(version) {
  const match = version?.match(/^v(\d+)\.(\d+)$/);
  return match ? { major: Number(match[1]), minor: Number(match[2]) } : null;
}

export function amendmentRecordsFromText(catalog = '') {
  const blocks = [];
  const headings = [...catalog.matchAll(/^##\s+(AOC-AMD-\d{4})\s+—\s+(.+)$/gm)];
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const start = heading.index ?? 0;
    const end = headings[index + 1]?.index ?? catalog.length;
    const body = catalog.slice(start, end);
    blocks.push({
      id: heading[1],
      title: heading[2].trim(),
      body,
      version: body.match(/\*\*Version:\*\*\s*(v\d+\.\d+)/)?.[1] ?? null,
      status: body.match(/\*\*Ratification Status:\*\*\s*(Ratified|Pending|Rejected|Superseded)/)?.[1] ?? null,
      affectedLaws: body.match(/\*\*Affected Laws:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? '',
      affectedAuthorities: body.match(/\*\*Affected Authorities:\*\*\s*([^\n]+)/)?.[1]?.trim() ?? '',
    });
  }
  return blocks;
}

export function currentConstitutionVersion(root) {
  const constitution = readText(root, CONSTITUTION_FILE);
  return versionFromText(constitution);
}

export function catalogAmendments(root) {
  return amendmentRecordsFromText(readText(root, AMENDMENT_CATALOG_FILE) ?? '');
}

export function ratifiedAmendments(root) {
  return catalogAmendments(root).filter((amendment) => amendment.status === 'Ratified');
}

export function hasRatifiedConstitutionalAmendment(root) {
  return ratifiedAmendments(root).some((amendment) => /LAW-\d{3}|Constitution|Violation catalog|Enforcement matrix|Constitutional policy/i.test(`${amendment.affectedLaws} ${amendment.affectedAuthorities} ${amendment.body}`));
}

export function hasRatifiedAuthorityAmendment(root) {
  return ratifiedAmendments(root).some((amendment) => /Authority|Ownership|Compatibility|Composition|Transitional|Canonical/i.test(`${amendment.affectedAuthorities} ${amendment.body}`));
}

export function gitChangedFiles(root) {
  const gitCheck = spawnSync('git', ['-C', root, 'rev-parse', '--is-inside-work-tree'], { encoding: 'utf8' });
  if (gitCheck.status !== 0 || gitCheck.stdout.trim() !== 'true') return null;
  const changed = new Set();
  for (const args of [
    ['-C', root, 'diff', '--name-only', 'HEAD', '--'],
    ['-C', root, 'ls-files', '--others', '--exclude-standard'],
  ]) {
    const result = spawnSync('git', args, { encoding: 'utf8' });
    if (result.status !== 0) return null;
    for (const file of result.stdout.split(/\r?\n/).filter(Boolean)) changed.add(file);
  }
  return [...changed];
}

export function changedConstitutionalFiles(root) {
  const changed = gitChangedFiles(root);
  if (changed) return changed.filter((file) => PROTECTED_CONSTITUTIONAL_FILES.includes(file));
  return PROTECTED_CONSTITUTIONAL_FILES.filter((file) => existsSync(resolve(root, file)));
}

export function listedAuthorities() {
  return Object.freeze([
    'packages/protocol/src',
    'enterprise/src',
    ...COMPATIBILITY_ROOTS,
    ...TRANSITIONAL_RUNTIME_OWNERS,
    ...AUTHORIZED_COMPOSITION_FILES,
    'docs/constitution',
  ]);
}

export function catalogAuthorityOwners(root) {
  const text = readText(root, AUTHORITY_CATALOG_FILE) ?? '';
  return new Set([...text.matchAll(/`([^`]+)`/g)].map((match) => match[1]));
}

export function runtimeAuthorityCandidates(root) {
  const candidates = [];
  const packagesRoot = resolve(root, 'packages');
  if (existsSync(packagesRoot)) {
    for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && /-runtime$/.test(entry.name) && existsSync(resolve(packagesRoot, entry.name, 'src'))) {
        candidates.push(`packages/${entry.name}/src`);
      }
    }
  }
  const examplesRoot = resolve(root, 'examples');
  if (existsSync(examplesRoot)) {
    for (const entry of readdirSync(examplesRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && /adapter$/.test(entry.name) && existsSync(resolve(examplesRoot, entry.name, 'src'))) {
        candidates.push(`examples/${entry.name}/src`);
      }
    }
  }
  return candidates;
}

export function governanceViolation(file, message) {
  return violation('LAW-008', file, 1, message);
}
