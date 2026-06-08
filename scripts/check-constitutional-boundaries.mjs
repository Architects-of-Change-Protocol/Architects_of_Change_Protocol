#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  COMPATIBILITY_ROOTS,
  collectSourceFiles,
  lineNumber,
  readModuleSpecifiers,
  relativePath,
  runScanner,
  violation,
} from './constitutional-boundary-lib.mjs';

export function scanConstitutionalBoundaries(root) {
  const violations = [];
  const protocolRoot = resolve(root, 'packages/protocol/src');
  if (!existsSync(protocolRoot)) {
    return [violation('LAW-001', 'packages/protocol/src', 1, 'canonical Protocol source root is missing')];
  }

  const protocolForbidden = [
    ['Enterprise', /(^@aoc\/enterprise(?:\/|$))|(?:^|\/)enterprise(?:\/|$)/],
    ['runtime implementation', /(^@aoc-runtime\/)|(?:^|\/)packages\/[^/]*-runtime(?:\/|$)|(?:^|\/)runtime(?:\/|$)/],
    ['infrastructure', /(?:^|\/)(?:infrastructure|persistence|storage|database|db|supabase|transport|http|external-sdk)(?:\/|$)/],
  ];
  for (const file of collectSourceFiles(protocolRoot)) {
    const source = readFileSync(file, 'utf8');
    for (const { specifier, index } of readModuleSpecifiers(source)) {
      for (const [label, pattern] of protocolForbidden) {
        if (pattern.test(specifier)) violations.push(violation(label === 'Enterprise' ? 'LAW-005' : 'LAW-001', relativePath(root, file), lineNumber(source, index), `Protocol imports ${label} '${specifier}'`));
      }
    }
    for (const match of source.matchAll(/\bnew\s+((?:Enterprise|InMemory|Default)[A-Za-z0-9_$]*(?:Runtime|Adapter|Provider|Service))\s*\(/g)) {
      violations.push(violation('LAW-001', relativePath(root, file), lineNumber(source, match.index ?? 0), `Protocol constructs implementation '${match[1]}'`));
    }
  }

  const enterpriseRoot = resolve(root, 'enterprise/src');
  if (!existsSync(enterpriseRoot)) violations.push(violation('LAW-002', 'enterprise/src', 1, 'Enterprise ownership root is missing'));
  else for (const file of collectSourceFiles(enterpriseRoot)) {
    const source = readFileSync(file, 'utf8');
    for (const { specifier, index } of readModuleSpecifiers(source)) {
      if (/(?:^|\/)(?:packages\/protocol\/src|protocol\/src)(?:\/|$)|^@aoc\/protocol\/src(?:\/|$)/.test(specifier)) {
        violations.push(violation('LAW-004', relativePath(root, file), lineNumber(source, index), `Enterprise imports Protocol source '${specifier}' instead of a declared export`));
      }
    }
  }

  for (const compatibilityRoot of COMPATIBILITY_ROOTS) {
    const absolute = resolve(root, compatibilityRoot);
    for (const file of collectSourceFiles(absolute)) {
      const source = readFileSync(file, 'utf8');
      for (const { specifier, index } of readModuleSpecifiers(source)) {
        if (/(?:^|\/)(?:packages\/protocol\/src|protocol\/src|frontend\/app|examples\/pmfreak-adapter)(?:\/|$)|^@aoc\/protocol\/src(?:\/|$)/.test(specifier)) {
          violations.push(violation('LAW-003', relativePath(root, file), lineNumber(source, index), `compatibility source imports an illegal owner '${specifier}'`));
        }
      }
      for (const match of source.matchAll(/\b(?:export\s+)?class\s+([A-Za-z_$][\w$]*)|\bnew\s+(AdapterRegistry|RuntimeBootstrapEngine)\s*\(/g)) {
        const explicitFacade = source.includes('Compatibility facade') && source.includes('@deprecated') && source.includes('private readonly implementation');
        if (!explicitFacade) violations.push(violation('LAW-003', relativePath(root, file), lineNumber(source, match.index ?? 0), 'compatibility source owns behavior or registry state instead of re-exporting/delegating'));
      }
    }
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Constitutional boundary scanner', scanConstitutionalBoundaries);
}
