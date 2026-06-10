#!/usr/bin/env node
import { GOVERNANCE_CHALLENGE_FILE, VALID_CHALLENGE_GROUNDS, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceChallenges(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_CHALLENGE_FILE)??'','Challenge registry');
  for(const r of records){
    const grounds=(r.Grounds??'').split(';').map((g)=>g.trim()).filter(Boolean);
    for(const ground of grounds){
      if(!VALID_CHALLENGE_GROUNDS.includes(ground)) violations.push(governanceViolationMsg(GOVERNANCE_CHALLENGE_FILE,`invalid challenge ground '${ground}'`,'GOV-V-010'));
    }
    if(!r['Challenge ID']) violations.push(governanceViolationMsg(GOVERNANCE_CHALLENGE_FILE,`challenge is missing challenge ID`,'GOV-V-010'));
    if(!r.Evidence) violations.push(governanceViolationMsg(GOVERNANCE_CHALLENGE_FILE,`challenge '${r['Challenge ID']}' is missing evidence`,'GOV-V-010'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance challenge scanner',scanGovernanceChallenges);
