#!/usr/bin/env node
import { eligibilityRecords, standingRecords, duplicated, ratifiedStandingAmendments, standingViolation, STANDING_ELIGIBILITY_FILE } from './standing-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanStandingEligibility(root) {
 const violations=[]; const standing=new Map(standingRecords(root).map(r=>[r['Standing ID'],r])); const amendments=new Set(ratifiedStandingAmendments(root).map(r=>r.id)); const records=eligibilityRecords(root);
 for(const id of duplicated(records.map(r=>r['Eligibility Policy ID']))) violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`duplicate eligibility policy ID '${id}'`,'STD-V-003'));
 const byId=new Map(records.map(r=>[r['Eligibility Policy ID'],r]));
 for(const r of records){const id=r['Eligibility Policy ID']; if(!/^SEP-\d{4}$/.test(id)) violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`invalid eligibility policy ID '${id}'`,'STD-V-003')); if(!standing.has(r['Standing ID'])) violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`${id} references unknown standing '${r['Standing ID']}'`,'STD-V-003')); for(const f of ['Eligibility Requirements','Disqualifiers','Evidence Requirements','Validation Requirements','Renewal Requirements']) if(!r[f]) violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`${id} is missing ${f}`,'STD-V-003')); if(!amendments.has(r.Amendment)) violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`${id} lacks a ratified Type B or Type C amendment`,'STD-V-003')); if(r.Status!=='Active') violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`${id} has invalid status '${r.Status}'`,'STD-V-003'));}
 for(const [id,s] of standing){const e=byId.get(s['Eligibility Policy']); if(!e) violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`${id} has no eligibility definition '${s['Eligibility Policy']}'`,'STD-V-003')); else if(e['Standing ID']!==id) violations.push(standingViolation(STANDING_ELIGIBILITY_FILE,`${id} eligibility policy belongs to '${e['Standing ID']}'`,'STD-V-003'));}
 return violations;
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Standing eligibility scanner', scanStandingEligibility);
