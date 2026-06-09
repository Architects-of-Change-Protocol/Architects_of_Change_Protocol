#!/usr/bin/env node
import { reputationRecords, reputationCalculationRecords, reputationAmendments, reputationViolation, REPUTATION_CALCULATION_FILE } from './reputation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanReputationCalculation(root){const violations=[],reputations=new Map(reputationRecords(root).map(r=>[r['Reputation ID'],r])),amendments=new Set(reputationAmendments(root).map(r=>r.id)),records=reputationCalculationRecords(root);
if(!records.length)violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,'reputation calculation registry contains no records','REP-V-003'));
const coveredClasses=new Set(records.map(r=>r['Reputation Class']));
for(const [,rep] of reputations){if(!coveredClasses.has(rep['Reputation Class']))violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`no calculation policy covers reputation class '${rep['Reputation Class']}'`,'REP-V-003'));}
for(const r of records){const id=r['Calculation Policy ID'];
if(!/^RCP-\d{4}$/.test(id))violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`invalid calculation policy ID '${id}'`,'REP-V-003'));
if(!r['Reputation Class'])violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} is missing Reputation Class`,'REP-V-003'));
if(!r['Calculation Basis'])violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} is missing Calculation Basis`,'REP-V-003'));
if(!r['Weighting Method'])violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} is missing Weighting Method`,'REP-V-003'));
if(!r['Aggregation Window'])violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} is missing Aggregation Window`,'REP-V-003'));
if(!r['Confidence Bounds'])violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} is missing Confidence Bounds`,'REP-V-003'));
if(!r['Decision Influence Rule'])violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} is missing Decision Influence Rule`,'REP-V-003'));
if(!amendments.has(r.Amendment))violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} lacks a ratified reputation amendment`,'REP-V-003'));
if(r.Status!=='Active')violations.push(reputationViolation(REPUTATION_CALCULATION_FILE,`${id} has invalid status '${r.Status}'`,'REP-V-003'));}
return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Reputation calculation scanner',scanReputationCalculation);
