#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requirePolicyFiles, validatePolicyCatalog, validatePolicyVersionParity } from './policy-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanPolicyAuthorities(root) {
  const violations = [...scanConstitutionalVersioning(root)];
  requirePolicyFiles(root, violations);
  validatePolicyVersionParity(root, violations);
  validatePolicyCatalog(root, violations);
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Policy authority scanner', scanPolicyAuthorities);
