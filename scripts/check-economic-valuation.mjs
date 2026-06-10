#!/usr/bin/env node
import { economicsValuationRecords, economicsViolation, ECONOMIC_VALUATION_FILE, VALID_ECONOMICS_STATUSES } from './economics-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanEconomicValuation(root){const violations=[];const records=economicsValuationRecords(root);for(const r of records){const id=r['Valuation Model ID'];if(!id||!/^EVM-\d{4}$/.test(id))violations.push(economicsViolation(ECONOMIC_VALUATION_FILE,`invalid valuation model ID '${id}'`,'ECO-V-007'));if(!r['Model Name'])violations.push(economicsViolation(ECONOMIC_VALUATION_FILE,`${id} is missing model name`,'ECO-V-007'));if(!VALID_ECONOMICS_STATUSES.includes(r.Status))violations.push(economicsViolation(ECONOMIC_VALUATION_FILE,`${id} has invalid status '${r.Status}'`,'ECO-V-007'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Economics valuation scanner',scanEconomicValuation);
