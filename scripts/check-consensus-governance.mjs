#!/usr/bin/env node
import { scanConsensusAuthorities } from './check-consensus-authorities.mjs';
import { scanConsensusModels } from './check-consensus-models.mjs';
import { scanConsensusThresholds } from './check-consensus-thresholds.mjs';
import { scanConsensusLifecycle } from './check-consensus-lifecycle.mjs';
import { scanConsensusExpiration } from './check-consensus-expiration.mjs';
import { scanConsensusRevocation } from './check-consensus-revocation.mjs';
import { scanConsensusDisputes } from './check-consensus-disputes.mjs';
import { scanConsensusRecomputation } from './check-consensus-recomputation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanConsensusGovernance(root){return [...scanConsensusAuthorities(root),...scanConsensusModels(root),...scanConsensusThresholds(root),...scanConsensusLifecycle(root),...scanConsensusExpiration(root),...scanConsensusRevocation(root),...scanConsensusDisputes(root),...scanConsensusRecomputation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Consensus governance scanner',scanConsensusGovernance);
