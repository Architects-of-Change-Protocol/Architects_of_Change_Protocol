#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { scanCapabilityAuthorities } from './check-capability-authorities.mjs';
import { scanCapabilityDelegation } from './check-capability-delegation.mjs';
import { scanCapabilityRevocation } from './check-capability-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

const legacyRuntimeDocuments = [
  'CAPABILITY_RUNTIME_ARCHITECTURE.md',
  'CAPABILITY_DELEGATION_MODEL.md',
  'CAPABILITY_ATTENUATION_MODEL.md',
  'CAPABILITY_LINEAGE_MODEL.md',
  'CAPABILITY_REVOCATION_MODEL.md',
  'CAPABILITY_EXPLAINABILITY_TRACE.md',
  'CAPABILITY_CONSTRAINT_MODEL.md',
  'CAPABILITY_PUBLIC_INTERNAL_BOUNDARIES.md',
  'SOVEREIGN_EXECUTION_SEMANTICS.md',
  'CAPABILITY_EVOLUTION_ROADMAP.md',
];

export function scanCapabilityGovernance(root) {
  const violations = [
    ...scanCapabilityAuthorities(root),
    ...scanCapabilityDelegation(root),
    ...scanCapabilityRevocation(root),
  ];

  for (const document of legacyRuntimeDocuments) {
    if (!existsSync(resolve(root, document))) violations.push({ law: 'CAP-V-010', path: document, line: 1, message: 'required runtime capability governance document is missing' });
  }
  const governancePath = resolve(root, 'runtime/capabilities/governance.ts');
  if (!existsSync(governancePath)) {
    violations.push({ law: 'CAP-V-010', path: 'runtime/capabilities/governance.ts', line: 1, message: 'required runtime capability governance source is missing' });
  } else {
    const source = readFileSync(governancePath, 'utf8');
    for (const marker of ['validateDelegation', 'attenuateCapability', 'evaluateCapabilityLineage']) {
      if (!source.includes(`function ${marker}`)) violations.push({ law: 'CAP-V-010', path: 'runtime/capabilities/governance.ts', line: 1, message: `required runtime governance helper '${marker}' is missing` });
    }
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Capability governance scanner', scanCapabilityGovernance);
}
