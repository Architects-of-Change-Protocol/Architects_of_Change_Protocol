#!/usr/bin/env node
import { economicsViolation, economicsLifecycleRecords, ECONOMIC_LIFECYCLE_FILE } from './economics-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanEconomicGovernance(root){const violations=[];const records=economicsLifecycleRecords(root);for(const r of records){const id=r['Transition ID'];if(!id||!/^EGOV-\d{4}$/.test(id))violations.push(economicsViolation(ECONOMIC_LIFECYCLE_FILE,`invalid governance record ID '${id}'`,'ECO-V-008'));if(!r['Economic Authority ID'])violations.push(economicsViolation(ECONOMIC_LIFECYCLE_FILE,`${id} is missing an economic authority ID`,'ECO-V-008'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Economics governance scanner',scanEconomicGovernance);
