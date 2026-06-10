#!/usr/bin/env node
import { votingMotionRecords, votingViolation, VALID_VOTING_CLASSES, VOTING_MOTION_FILE } from './voting-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVotingMotions(root){const violations=[];const records=votingMotionRecords(root);if(!records.length)violations.push(votingViolation(VOTING_MOTION_FILE,'motion policy catalog contains no records','VOTE-V-006'));for(const r of records){const id=r['Motion Policy ID'];if(!id||!/^VMN-\d{4}$/.test(id))violations.push(votingViolation(VOTING_MOTION_FILE,`invalid motion policy ID '${id}'`,'VOTE-V-006'));if(!VALID_VOTING_CLASSES.includes(r['Voting Class']))violations.push(votingViolation(VOTING_MOTION_FILE,`${id} has invalid voting class '${r['Voting Class']}'`,'VOTE-V-006'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Voting motion scanner',scanVotingMotions);
