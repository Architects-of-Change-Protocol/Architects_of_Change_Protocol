#!/usr/bin/env node
import { GOVERNANCE_EXPIRATION_FILE, VALID_EXPIRATION_TRIGGERS, governanceAmendments, governanceViolationMsg, requireGovernanceFiles } from './governance-governance-lib.mjs';
import { markdownTable } from './capability-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceExpiration(root){
  const violations=[];
  requireGovernanceFiles(root,violations);
  const records=markdownTable(readText(root,GOVERNANCE_EXPIRATION_FILE)??'','Expiration policy catalog');
  const amendments=new Set(governanceAmendments(root).map((r)=>r.id));
  for(const r of records){
    if(!/^GXP-\d{4}$/.test(r['Expiration Policy ID'])) violations.push(governanceViolationMsg(GOVERNANCE_EXPIRATION_FILE,`invalid expiration policy ID '${r['Expiration Policy ID']}'`,'GOV-V-011'));
    const triggers=(r['Valid Expiration Triggers']??'').split(';').map((t)=>t.trim()).filter(Boolean);
    for(const trigger of triggers){
      if(!VALID_EXPIRATION_TRIGGERS.includes(trigger)) violations.push(governanceViolationMsg(GOVERNANCE_EXPIRATION_FILE,`invalid expiration trigger '${trigger}'`,'GOV-V-011'));
    }
    if(!amendments.has(r.Amendment)) violations.push(governanceViolationMsg(GOVERNANCE_EXPIRATION_FILE,`expiration policy amendment '${r.Amendment}' is not a ratified governance amendment`,'GOV-V-014'));
  }
  return violations;
}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance expiration scanner',scanGovernanceExpiration);
