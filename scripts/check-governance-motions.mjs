#!/usr/bin/env node
import { GOVERNANCE_MOTION_FILE, governanceAmendments, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceMotions(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_MOTION_FILE)??'','Motion policy catalog');
  const amendments=new Set(governanceAmendments(root).map((r)=>r.id));
  for(const r of records){
    if(!/^GMP-\d{4}$/.test(r['Motion Policy ID'])) violations.push(governanceViolationMsg(GOVERNANCE_MOTION_FILE,`invalid motion policy ID '${r['Motion Policy ID']}'`,'GOV-V-004'));
    if(!r['Governance Class']) violations.push(governanceViolationMsg(GOVERNANCE_MOTION_FILE,`motion policy is missing governance class`,'GOV-V-004'));
    if(!amendments.has(r.Amendment)) violations.push(governanceViolationMsg(GOVERNANCE_MOTION_FILE,`motion policy amendment '${r.Amendment}' is not a ratified governance amendment`,'GOV-V-014'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance motion scanner',scanGovernanceMotions);
