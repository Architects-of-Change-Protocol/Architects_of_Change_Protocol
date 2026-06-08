#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import {
  AUTHORIZED_COMPOSITION_FILES,
  lineNumber,
  relativePath,
  repositorySourceFiles,
  runScanner,
  violation,
} from './constitutional-boundary-lib.mjs';

const compositionPath = (path) => AUTHORIZED_COMPOSITION_FILES.includes(path)
  || /(?:^|\/)[^/]*(?:composition-root|bootstrap|container|wiring)[^/]*\.(?:ts|tsx|js|mjs|cjs)$/.test(path);

export function scanCompositionBoundaries(root) {
  const violations = [];
  for (const file of repositorySourceFiles(root)) {
    const path = relativePath(root, file);
    const source = readFileSync(file, 'utf8');
    if (compositionPath(path)) continue;

    for (const match of source.matchAll(/\bregistry\s*\.\s*resolve\s*\(/g)) {
      violations.push(violation('LAW-007', path, lineNumber(source, match.index ?? 0), 'registry.resolve() is only permitted in an authorized composition root or resolver'));
    }
    for (const match of source.matchAll(/\bnew\s+([A-Za-z_$][\w$]*(?:Runtime|Adapter|Provider))\s*\(/g)) {
      const symbol = match[1];
      if (symbol.endsWith('Error')) continue;
      violations.push(violation('LAW-006', path, lineNumber(source, match.index ?? 0), `implementation construction 'new ${symbol}()' is outside an authorized composition root`));
    }
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Composition boundary scanner', scanCompositionBoundaries);
}
