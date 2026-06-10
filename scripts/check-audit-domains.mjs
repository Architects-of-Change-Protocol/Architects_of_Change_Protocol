#!/usr/bin/env node
import { AUDIT_DOMAIN_POLICY_FILE, auditViolation } from './audit-governance-lib.mjs';
import { readText, runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditDomains(root){const violations=[];const text=readText(root,AUDIT_DOMAIN_POLICY_FILE);if(!text){violations.push(auditViolation(AUDIT_DOMAIN_POLICY_FILE,'audit domain policy is missing','AUD-V-008'));return violations;}const domains=['Authority','Capability','Policy','Standing','Claim','Trust','Verification','Reputation','Attestation','Consensus','Governance','Voting','Federation','Economics','Runtime'];for(const d of domains){if(!text.includes(d))violations.push(auditViolation(AUDIT_DOMAIN_POLICY_FILE,`missing domain '${d}' in audit domain policy`,'AUD-V-008'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit domain scanner',scanAuditDomains);
