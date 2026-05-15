#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const protectedSymbols = [
  'CapabilityToken',
  'CapabilityGrant',
  'ConsentGrant',
  'Delegation',
  'AgentScope',
  'AuditEventEnvelope',
  'PolicyDecision',
  'ResourceRef',
  'ScopedAccessRequest',
  'ProtocolError',
  'TrustDomainIdentifier',
];

const compatibilityContracts = [
  'packages/capability-tokens/src/contracts.ts',
  'packages/consent-engine/src/contracts.ts',
  'packages/scoped-access/src/contracts.ts',
  'packages/audit-sdk/src/contracts.ts',
];

const violations = [];
for (const rel of compatibilityContracts) {
  const source = readFileSync(resolve(rel), 'utf8');
  for (const symbol of protectedSymbols) {
    const pattern = new RegExp(`\\bexport\\s+(?:interface|type)\\s+${symbol}\\b`);
    if (pattern.test(source)) {
      violations.push(`${rel}: illegally redefines canonical symbol ${symbol}`);
    }
  }
  if (!source.includes("from '@aoc/protocol/contracts'")) {
    violations.push(`${rel}: expected compatibility re-export from @aoc/protocol/contracts`);
  }
}

if (violations.length > 0) {
  console.error('Semantic ownership violations found:');
  for (const v of violations) console.error(` - ${v}`);
  process.exit(1);
}

console.log('Semantic ownership lint passed. Canonical contracts remain centralized.');
