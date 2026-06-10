#!/usr/bin/env node
import { federationChallengeRecords, federationViolation, VALID_CHALLENGE_GROUNDS, FEDERATION_CHALLENGE_FILE } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationChallenges(root){const violations=[];const records=federationChallengeRecords(root);for(const r of records){if(r.Grounds&&!VALID_CHALLENGE_GROUNDS.includes(r.Grounds))violations.push(federationViolation(FEDERATION_CHALLENGE_FILE,`challenge has invalid grounds '${r.Grounds}'`,'FED-V-010'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation challenge scanner',scanFederationChallenges);
