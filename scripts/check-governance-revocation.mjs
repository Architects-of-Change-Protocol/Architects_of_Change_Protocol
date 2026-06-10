#!/usr/bin/env node
import { GOVERNANCE_REVOCATION_FILE, VALID_REVOCATION_CAUSES, governanceAmendments, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceRevocation(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_REVOCATION_FILE)??'','Revocation authority registry');
  const amendments=new Set(governanceAmendments(root).map((r)=>r.id));
  for(const r of records){
    const causes=(r['Valid Causes']??'').split(';').map((c)=>c.trim()).filter(Boolean);
    for(const cause of causes){
      if(!VALID_REVOCATION_CAUSES.includes(cause)) violations.push(governanceViolationMsg(GOVERNANCE_REVOCATION_FILE,`invalid revocation cause '${cause}'`,'GOV-V-012'));
    }
    if(!amendments.has(r.Amendment)) violations.push(governanceViolationMsg(GOVERNANCE_REVOCATION_FILE,`revocation authority amendment '${r.Amendment}' is not a ratified governance amendment`,'GOV-V-014'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance revocation scanner',scanGovernanceRevocation);
