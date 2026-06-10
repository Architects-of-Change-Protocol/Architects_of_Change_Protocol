#!/usr/bin/env node
import { GOVERNANCE_MANDATE_FILE, governanceAmendments, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceMandates(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_MANDATE_FILE)??'','Mandate policy catalog');
  const amendments=new Set(governanceAmendments(root).map((r)=>r.id));
  for(const r of records){
    if(!/^GMD-\d{4}$/.test(r['Mandate Policy ID'])) violations.push(governanceViolationMsg(GOVERNANCE_MANDATE_FILE,`invalid mandate policy ID '${r['Mandate Policy ID']}'`,'GOV-V-006'));
    if(!r['Governance Class']) violations.push(governanceViolationMsg(GOVERNANCE_MANDATE_FILE,`mandate policy is missing governance class`,'GOV-V-006'));
    if(!amendments.has(r.Amendment)) violations.push(governanceViolationMsg(GOVERNANCE_MANDATE_FILE,`mandate policy amendment '${r.Amendment}' is not a ratified governance amendment`,'GOV-V-014'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance mandate scanner',scanGovernanceMandates);
