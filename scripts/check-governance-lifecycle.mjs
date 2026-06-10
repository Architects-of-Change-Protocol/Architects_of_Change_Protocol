#!/usr/bin/env node
import { GOVERNANCE_LIFECYCLE_FILE, GOVERNANCE_TRANSITIONS, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceLifecycle(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_LIFECYCLE_FILE)??'','Governance lifecycle transition ledger');
  for(const r of records){
    const from=r.From, to=r.To;
    if(!GOVERNANCE_TRANSITIONS.has(from)) violations.push(governanceViolationMsg(GOVERNANCE_LIFECYCLE_FILE,`invalid lifecycle state '${from}'`,'GOV-V-009'));
    else if(!GOVERNANCE_TRANSITIONS.get(from).has(to)) violations.push(governanceViolationMsg(GOVERNANCE_LIFECYCLE_FILE,`invalid lifecycle transition from '${from}' to '${to}'`,'GOV-V-009'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance lifecycle scanner',scanGovernanceLifecycle);
