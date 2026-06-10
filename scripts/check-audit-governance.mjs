#!/usr/bin/env node
import { auditLifecycleRecords, auditViolation, AUDIT_LIFECYCLE_FILE } from './audit-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditGovernance(root){const violations=[];const records=auditLifecycleRecords(root);for(const r of records){const id=r['Transition ID'];if(!id||!/^AGOV-\d{4}$/.test(id))violations.push(auditViolation(AUDIT_LIFECYCLE_FILE,`invalid audit governance record ID '${id}'`,'AUD-V-001'));if(!r['Audit ID'])violations.push(auditViolation(AUDIT_LIFECYCLE_FILE,`${id} is missing an audit ID`,'AUD-V-001'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit governance scanner',scanAuditGovernance);
