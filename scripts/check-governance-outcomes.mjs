#!/usr/bin/env node
import { GOVERNANCE_OUTCOME_FILE, governanceAmendments, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceOutcomes(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_OUTCOME_FILE)??'','Outcome policy catalog');
  const amendments=new Set(governanceAmendments(root).map((r)=>r.id));
  for(const r of records){
    if(!/^GOP-\d{4}$/.test(r['Outcome Policy ID'])) violations.push(governanceViolationMsg(GOVERNANCE_OUTCOME_FILE,`invalid outcome policy ID '${r['Outcome Policy ID']}'`,'GOV-V-008'));
    if(!r['Governance Class']) violations.push(governanceViolationMsg(GOVERNANCE_OUTCOME_FILE,`outcome policy is missing governance class`,'GOV-V-008'));
    if(!amendments.has(r.Amendment)) violations.push(governanceViolationMsg(GOVERNANCE_OUTCOME_FILE,`outcome policy amendment '${r.Amendment}' is not a ratified governance amendment`,'GOV-V-014'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance outcome scanner',scanGovernanceOutcomes);
