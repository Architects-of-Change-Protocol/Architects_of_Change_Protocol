#!/usr/bin/env node
import { GOVERNANCE_PROPOSAL_FILE, VALID_PROPOSAL_STATUSES, governanceAmendments, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceProposals(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_PROPOSAL_FILE)??'','Proposal policy catalog');
  const amendments=new Set(governanceAmendments(root).map((r)=>r.id));
  for(const r of records){
    if(!/^GPP-\d{4}$/.test(r['Proposal Policy ID'])) violations.push(governanceViolationMsg(GOVERNANCE_PROPOSAL_FILE,`invalid proposal policy ID '${r['Proposal Policy ID']}'`,'GOV-V-003'));
    if(!r['Governance Class']) violations.push(governanceViolationMsg(GOVERNANCE_PROPOSAL_FILE,`proposal policy is missing governance class`,'GOV-V-003'));
    if(!amendments.has(r.Amendment)) violations.push(governanceViolationMsg(GOVERNANCE_PROPOSAL_FILE,`proposal policy amendment '${r.Amendment}' is not a ratified governance amendment`,'GOV-V-014'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance proposal scanner',scanGovernanceProposals);
