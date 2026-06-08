#!/usr/bin/env node
import { scanDecisionAuthorities } from './check-decision-authorities.mjs';
import { scanDecisionLifecycle } from './check-decision-lifecycle.mjs';
import { scanDecisionEvidence } from './check-decision-evidence.mjs';
import { scanDecisionExplainability } from './check-decision-explainability.mjs';
import { scanDecisionAppeals } from './check-decision-appeals.mjs';
import { validateRevocations } from './decision-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanDecisionGovernance(root) {
  const revocationViolations = [];
  validateRevocations(root, revocationViolations);
  return [
    ...scanDecisionAuthorities(root),
    ...scanDecisionLifecycle(root),
    ...scanDecisionEvidence(root),
    ...scanDecisionExplainability(root),
    ...scanDecisionAppeals(root),
    ...revocationViolations,
  ];
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Decision governance scanner', scanDecisionGovernance);
