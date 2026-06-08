#!/usr/bin/env node
import { scanStandingAuthorities } from './check-standing-authorities.mjs';
import { scanStandingEligibility } from './check-standing-eligibility.mjs';
import { scanStandingLifecycle } from './check-standing-lifecycle.mjs';
import { scanStandingDelegation } from './check-standing-delegation.mjs';
import { scanStandingRepresentation } from './check-standing-representation.mjs';
import { scanStandingRevocation } from './check-standing-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanStandingGovernance(root){return [...scanStandingAuthorities(root),...scanStandingEligibility(root),...scanStandingLifecycle(root),...scanStandingDelegation(root),...scanStandingRepresentation(root),...scanStandingRevocation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Standing governance scanner',scanStandingGovernance);
