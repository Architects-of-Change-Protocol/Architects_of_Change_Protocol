#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import {
  CAPABILITY_AUTHORITY_FILE,
  capabilityRecords,
  capabilityViolation,
  requireCapabilityFiles,
  validateCatalogBasics,
  validateNewCapabilityGovernance,
  validateVersionParity,
} from './capability-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanCapabilityAuthorities(root) {
  const violations = [...scanConstitutionalVersioning(root)];
  requireCapabilityFiles(root, violations);
  validateVersionParity(root, violations);
  validateCatalogBasics(root, violations);
  validateNewCapabilityGovernance(root, violations);

  const names = new Set();
  for (const capability of capabilityRecords(root)) {
    const normalized = capability.Name.toLowerCase();
    if (names.has(normalized)) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `duplicate capability definition name '${capability.Name}'`, 'CAP-V-006'));
    names.add(normalized);
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Capability authority scanner', scanCapabilityAuthorities);
}
