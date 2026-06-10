#!/usr/bin/env node
import { scanGovernanceAuthorities } from './check-governance-authorities.mjs';
import { scanGovernanceProposals } from './check-governance-proposals.mjs';
import { scanGovernanceMotions } from './check-governance-motions.mjs';
import { scanGovernanceMandates } from './check-governance-mandates.mjs';
import { scanGovernanceOutcomes } from './check-governance-outcomes.mjs';
import { scanGovernanceLifecycle } from './check-governance-lifecycle.mjs';
import { scanGovernanceChallenges } from './check-governance-challenges.mjs';
import { scanGovernanceExpiration } from './check-governance-expiration.mjs';
import { scanGovernanceRevocation } from './check-governance-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceGovernance(root){return[...scanGovernanceAuthorities(root),...scanGovernanceProposals(root),...scanGovernanceMotions(root),...scanGovernanceMandates(root),...scanGovernanceOutcomes(root),...scanGovernanceLifecycle(root),...scanGovernanceChallenges(root),...scanGovernanceExpiration(root),...scanGovernanceRevocation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance governance scanner',scanGovernanceGovernance);
