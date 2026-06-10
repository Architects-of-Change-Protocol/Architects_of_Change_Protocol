#!/usr/bin/env node
import { runtimeLifecycleRecords, runtimeViolation, RUNTIME_LIFECYCLE_FILE } from './runtime-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRuntimeGovernance(root){const violations=[];const records=runtimeLifecycleRecords(root);for(const r of records){const id=r['Transition ID'];if(!id||!/^RGOV-\d{4}$/.test(id))violations.push(runtimeViolation(RUNTIME_LIFECYCLE_FILE,`invalid governance record ID '${id}'`,'RUN-V-014'));if(!r['Execution ID'])violations.push(runtimeViolation(RUNTIME_LIFECYCLE_FILE,`${id} is missing an execution ID`,'RUN-V-014'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Runtime governance scanner',scanRuntimeGovernance);
