#!/usr/bin/env node
import { economicsChallengeRecords, economicsViolation, ECONOMIC_CHALLENGE_FILE, VALID_CHALLENGE_GROUNDS } from './economics-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanEconomicChallenges(root){const violations=[];const records=economicsChallengeRecords(root);for(const r of records){const id=r['Challenge ID'];if(!id||!/^ECHAL-\d{4}$/.test(id))violations.push(economicsViolation(ECONOMIC_CHALLENGE_FILE,`invalid challenge ID '${id}'`,'ECO-V-008'));if(r.Grounds&&!VALID_CHALLENGE_GROUNDS.includes(r.Grounds))violations.push(economicsViolation(ECONOMIC_CHALLENGE_FILE,`${id} has invalid grounds '${r.Grounds}'`,'ECO-V-008'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Economics challenges scanner',scanEconomicChallenges);
