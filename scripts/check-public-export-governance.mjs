#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import {
  declaredExportKeys,
  exportAllows,
  lineNumber,
  packageNameFromSpecifier,
  packageSubpath,
  readModuleSpecifiers,
  relativePath,
  repositorySourceFiles,
  runScanner,
  violation,
  workspaceManifests,
} from './constitutional-boundary-lib.mjs';

const VIRTUAL_MODULES = new Set(['@aoc-runtime/crypto']);

export function scanPublicExportGovernance(root) {
  const violations = [];
  const manifests = workspaceManifests(root);
  const packages = new Map(manifests.filter(({ manifest }) => manifest.name).map((entry) => [entry.manifest.name, entry]));

  for (const file of repositorySourceFiles(root)) {
    const source = readFileSync(file, 'utf8');
    const consumer = relativePath(root, file);
    for (const { specifier, index } of readModuleSpecifiers(source)) {
      if (!specifier.startsWith('@aoc/') && !specifier.startsWith('@aoc-runtime/')) continue;
      const line = lineNumber(source, index);
      if (/(?:^|\/)(?:src|internal|private)(?:\/|$)/.test(specifier)) {
        violations.push(violation('LAW-004', consumer, line, `deep/internal package import '${specifier}' is forbidden`));
        continue;
      }
      const packageName = packageNameFromSpecifier(specifier);
      if (VIRTUAL_MODULES.has(packageName)) continue;
      const workspace = packages.get(packageName);
      if (!workspace) {
        violations.push(violation('LAW-004', consumer, line, `AOC package '${packageName}' has no governed workspace manifest`));
        continue;
      }
      const keys = declaredExportKeys(workspace.manifest);
      const subpath = packageSubpath(specifier);
      if (!exportAllows(keys, subpath)) {
        violations.push(violation('LAW-004', consumer, line, `package import '${specifier}' is not declared by ${relativePath(root, workspace.path)} exports`));
      }
    }
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Public export governance scanner', scanPublicExportGovernance);
}
