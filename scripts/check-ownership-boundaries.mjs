#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  COMPATIBILITY_ROOTS,
  TRANSITIONAL_RUNTIME_OWNERS,
  collectSourceFiles,
  isWithin,
  lineNumber,
  relativePath,
  repositorySourceFiles,
  runScanner,
  violation,
} from './constitutional-boundary-lib.mjs';

const enterpriseOwners = ['enterprise/src'];
const protocolContractOwners = ['packages/protocol/src/runtime-registry'];
const ownerDeclaration = /\b(?:export\s+)?(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*(?:Runtime|Adapter|Provider|Registry|CompositionRoot|Profile|Defaults?))\b|\b(?:const|let|var)\s+([A-Za-z_$][\w$]*(?:Defaults?|Registry|CompositionRoot|Profile))\b/g;

export function scanOwnershipBoundaries(root) {
  const violations = [];
  for (const file of repositorySourceFiles(root)) {
    const path = relativePath(root, file);
    const source = readFileSync(file, 'utf8');
    const compatibility = COMPATIBILITY_ROOTS.some((prefix) => isWithin(path, prefix));
    const authorized = enterpriseOwners.some((prefix) => isWithin(path, prefix))
      || protocolContractOwners.some((prefix) => isWithin(path, prefix))
      || TRANSITIONAL_RUNTIME_OWNERS.some((prefix) => isWithin(path, prefix))
      || path === 'packages/provider-interfaces/src/index.ts'
      || path === 'protocol/adapters/adapter-registry.ts';
    for (const match of source.matchAll(ownerDeclaration)) {
      const symbol = match[1] ?? match[2];
      if (compatibility) {
        const facade = source.includes('Compatibility facade') && source.includes('@deprecated');
        if (!facade) violations.push(violation('LAW-003', path, lineNumber(source, match.index ?? 0), `compatibility layer declares owner '${symbol}'`));
      } else if (!authorized) {
        violations.push(violation('LAW-002', path, lineNumber(source, match.index ?? 0), `implementation owner '${symbol}' is outside an authorized ownership domain`));
      }
    }
  }

  const requiredOwner = resolve(root, 'enterprise/src/assurance/runtime-adapter-bootstrap.ts');
  if (collectSourceFiles(requiredOwner).length === 0) violations.push(violation('LAW-002', 'enterprise/src/assurance/runtime-adapter-bootstrap.ts', 1, 'canonical Enterprise composition owner is missing'));
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Ownership boundary scanner', scanOwnershipBoundaries);
}
