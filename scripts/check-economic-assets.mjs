#!/usr/bin/env node
import { economicsAssetRecords, economicsViolation, ECONOMIC_ASSET_FILE, VALID_ECONOMICS_CLASSES, VALID_ECONOMICS_STATUSES } from './economics-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanEconomicAssets(root){const violations=[];const records=economicsAssetRecords(root);for(const r of records){const id=r['Asset Class ID'];if(!id||!/^EAC-\d{4}$/.test(id))violations.push(economicsViolation(ECONOMIC_ASSET_FILE,`invalid asset class ID '${id}'`,'ECO-V-003'));if(!r['Asset Class'])violations.push(economicsViolation(ECONOMIC_ASSET_FILE,`${id} is missing asset class name`,'ECO-V-003'));if(!VALID_ECONOMICS_STATUSES.includes(r.Status))violations.push(economicsViolation(ECONOMIC_ASSET_FILE,`${id} has invalid status '${r.Status}'`,'ECO-V-003'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Economics assets scanner',scanEconomicAssets);
