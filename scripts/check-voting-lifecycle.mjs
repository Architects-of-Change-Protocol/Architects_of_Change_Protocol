#!/usr/bin/env node
import { votingLifecycleRecords, votingViolation, VOTING_TRANSITIONS, VOTING_LIFECYCLE_FILE } from './voting-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVotingLifecycle(root){const violations=[];const records=votingLifecycleRecords(root);for(const r of records){const from=r.From,to=r.To;if(!VOTING_TRANSITIONS.has(from)||!VOTING_TRANSITIONS.get(from).has(to))violations.push(votingViolation(VOTING_LIFECYCLE_FILE,`invalid lifecycle transition from '${from}' to '${to}'`,'VOTE-V-007'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Voting lifecycle scanner',scanVotingLifecycle);
