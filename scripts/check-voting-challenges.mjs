#!/usr/bin/env node
import { votingChallengeRecords, votingViolation, VALID_CHALLENGE_GROUNDS, VOTING_CHALLENGE_FILE } from './voting-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVotingChallenges(root){const violations=[];const records=votingChallengeRecords(root);for(const r of records){if(r.Grounds&&!VALID_CHALLENGE_GROUNDS.includes(r.Grounds))violations.push(votingViolation(VOTING_CHALLENGE_FILE,`challenge has invalid grounds '${r.Grounds}'`,'VOTE-V-009'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Voting challenge scanner',scanVotingChallenges);
