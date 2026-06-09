#!/usr/bin/env node
import { verificationRecords, verificationMethodRecords, verificationAmendments, verificationViolation, VERIFICATION_METHOD_FILE, VALID_VERIFICATION_CLASSES } from './verification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVerificationMethods(root){const violations=[],records=verificationMethodRecords(root),amendments=new Set(verificationAmendments(root).map(r=>r.id)),methodIds=new Set(records.map(r=>r['Method ID']));
for(const r of records){const id=r['Method ID'];if(!/^VMP-\d{4}$/.test(id))violations.push(verificationViolation(VERIFICATION_METHOD_FILE,`invalid method ID '${id}'`,'VER-V-003'));if(!r['Method Name'])violations.push(verificationViolation(VERIFICATION_METHOD_FILE,`${id} is missing Method Name`,'VER-V-003'));if(!amendments.has(r.Amendment))violations.push(verificationViolation(VERIFICATION_METHOD_FILE,`${id} lacks a ratified verification amendment`,'VER-V-003'));if(r.Status!=='Active')violations.push(verificationViolation(VERIFICATION_METHOD_FILE,`${id} has invalid status '${r.Status}'`,'VER-V-003'));}
for(const v of verificationRecords(root)){const id=v['Verification ID'];if(!methodIds.has(v['Verification Method']))violations.push(verificationViolation(VERIFICATION_METHOD_FILE,`${id} references unknown method '${v['Verification Method']}'`,'VER-V-003'));}
return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Verification method scanner',scanVerificationMethods);
