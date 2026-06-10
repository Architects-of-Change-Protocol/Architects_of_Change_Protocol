#!/usr/bin/env node
import { runtimeChallengeRecords, runtimeViolation, RUNTIME_CHALLENGE_FILE, VALID_CHALLENGE_GROUNDS } from './runtime-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRuntimeChallenges(root){const violations=[];const records=runtimeChallengeRecords(root);for(const r of records){const id=r['Challenge ID'];if(!id||!/^RCHAL-\d{4}$/.test(id))violations.push(runtimeViolation(RUNTIME_CHALLENGE_FILE,`invalid challenge ID '${id}'`,'RUN-V-009'));if(r.Grounds&&!VALID_CHALLENGE_GROUNDS.includes(r.Grounds))violations.push(runtimeViolation(RUNTIME_CHALLENGE_FILE,`${id} has invalid grounds '${r.Grounds}'`,'RUN-V-009'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Runtime challenges scanner',scanRuntimeChallenges);
