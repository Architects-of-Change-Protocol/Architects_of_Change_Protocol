#!/usr/bin/env node
import { scanTrustAuthorities } from './check-trust-authorities.mjs';
import { scanTrustEvidence } from './check-trust-evidence.mjs';
import { scanTrustLifecycle } from './check-trust-lifecycle.mjs';
import { scanTrustIssuance } from './check-trust-issuance.mjs';
import { scanTrustDecay } from './check-trust-decay.mjs';
import { scanTrustRevocation } from './check-trust-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanTrustGovernance(root){return [...scanTrustAuthorities(root),...scanTrustEvidence(root),...scanTrustLifecycle(root),...scanTrustIssuance(root),...scanTrustDecay(root),...scanTrustRevocation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Trust governance scanner',scanTrustGovernance);
