#!/usr/bin/env node
import { scanReputationAuthorities } from './check-reputation-authorities.mjs';
import { scanReputationSources } from './check-reputation-sources.mjs';
import { scanReputationLifecycle } from './check-reputation-lifecycle.mjs';
import { scanReputationCalculation } from './check-reputation-calculation.mjs';
import { scanReputationDecay } from './check-reputation-decay.mjs';
import { scanReputationDisputes } from './check-reputation-disputes.mjs';
import { scanReputationCorrections } from './check-reputation-corrections.mjs';
import { scanReputationRevocation } from './check-reputation-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanReputationGovernance(root){return [...scanReputationAuthorities(root),...scanReputationSources(root),...scanReputationLifecycle(root),...scanReputationCalculation(root),...scanReputationDecay(root),...scanReputationDisputes(root),...scanReputationCorrections(root),...scanReputationRevocation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Reputation governance scanner',scanReputationGovernance);
