#!/usr/bin/env node
import { votingRevocationRecords, votingViolation, VOTING_REVOCATION_FILE } from './voting-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVotingRevocation(root){const violations=[];const records=votingRevocationRecords(root);if(!records.length)violations.push(votingViolation(VOTING_REVOCATION_FILE,'revocation authority registry contains no records','VOTE-V-008'));for(const r of records){if(!['Yes','No'].includes(r.Revocable))violations.push(votingViolation(VOTING_REVOCATION_FILE,`revocation record has invalid Revocable value '${r.Revocable}'`,'VOTE-V-008'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Voting revocation scanner',scanVotingRevocation);
