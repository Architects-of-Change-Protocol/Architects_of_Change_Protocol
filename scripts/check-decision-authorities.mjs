#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireDecisionFiles, validateDecisionCatalog, validateDecisionVersionParity } from './decision-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanDecisionAuthorities(root) {
  const violations = [...scanConstitutionalVersioning(root)];
  requireDecisionFiles(root, violations);
  validateDecisionVersionParity(root, violations);
  validateDecisionCatalog(root, violations);
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Decision authority scanner', scanDecisionAuthorities);
