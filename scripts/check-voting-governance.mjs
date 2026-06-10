#!/usr/bin/env node
import { scanVotingAuthorities } from './check-voting-authorities.mjs';
import { scanVotingEligibility } from './check-voting-eligibility.mjs';
import { scanVotingWeights } from './check-voting-weights.mjs';
import { scanVotingDelegations } from './check-voting-delegations.mjs';
import { scanVotingMotions } from './check-voting-motions.mjs';
import { scanVotingLifecycle } from './check-voting-lifecycle.mjs';
import { scanVotingExpiration } from './check-voting-expiration.mjs';
import { scanVotingChallenges } from './check-voting-challenges.mjs';
import { scanVotingRevocation } from './check-voting-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVotingGovernance(root){return[...scanVotingAuthorities(root),...scanVotingEligibility(root),...scanVotingWeights(root),...scanVotingDelegations(root),...scanVotingMotions(root),...scanVotingLifecycle(root),...scanVotingExpiration(root),...scanVotingChallenges(root),...scanVotingRevocation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Voting governance scanner',scanVotingGovernance);
