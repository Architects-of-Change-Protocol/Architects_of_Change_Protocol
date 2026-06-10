#!/usr/bin/env node
import { votingWeightRecords, votingViolation, VALID_VOTING_CLASSES, VOTING_WEIGHT_FILE } from './voting-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVotingWeights(root){const violations=[];const records=votingWeightRecords(root);if(!records.length)violations.push(votingViolation(VOTING_WEIGHT_FILE,'weight policy catalog contains no records','VOTE-V-004'));for(const r of records){const id=r['Weight Policy ID'];if(!id||!/^VWT-\d{4}$/.test(id))violations.push(votingViolation(VOTING_WEIGHT_FILE,`invalid weight policy ID '${id}'`,'VOTE-V-004'));if(!VALID_VOTING_CLASSES.includes(r['Voting Class']))violations.push(votingViolation(VOTING_WEIGHT_FILE,`${id} has invalid voting class '${r['Voting Class']}'`,'VOTE-V-004'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Voting weight scanner',scanVotingWeights);
