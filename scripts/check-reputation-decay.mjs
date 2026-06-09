#!/usr/bin/env node
import { reputationRecords, reputationDecayRecords, reputationAmendments, reputationViolation, REPUTATION_DECAY_FILE } from './reputation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanReputationDecay(root){const violations=[],reputations=new Map(reputationRecords(root).map(r=>[r['Reputation ID'],r])),amendments=new Set(reputationAmendments(root).map(r=>r.id)),records=reputationDecayRecords(root);
if(!records.length)violations.push(reputationViolation(REPUTATION_DECAY_FILE,'reputation decay policy catalog contains no records','REP-V-007'));
const coveredClasses=new Set(records.map(r=>r['Reputation Class']));
for(const [,rep] of reputations){if(!coveredClasses.has(rep['Reputation Class']))violations.push(reputationViolation(REPUTATION_DECAY_FILE,`no decay policy covers reputation class '${rep['Reputation Class']}'`,'REP-V-007'));}
for(const r of records){const id=r['Decay Policy ID'];
if(!/^RDP-\d{4}$/.test(id))violations.push(reputationViolation(REPUTATION_DECAY_FILE,`invalid decay policy ID '${id}'`,'REP-V-007'));
if(!r['Reputation Class'])violations.push(reputationViolation(REPUTATION_DECAY_FILE,`${id} is missing Reputation Class`,'REP-V-007'));
if(!r['Decay Triggers'])violations.push(reputationViolation(REPUTATION_DECAY_FILE,`${id} is missing Decay Triggers`,'REP-V-007'));
if(!r['Decay Rate'])violations.push(reputationViolation(REPUTATION_DECAY_FILE,`${id} is missing Decay Rate`,'REP-V-007'));
if(!r['Historical Preservation'])violations.push(reputationViolation(REPUTATION_DECAY_FILE,`${id} is missing Historical Preservation`,'REP-V-007'));
if(!amendments.has(r.Amendment))violations.push(reputationViolation(REPUTATION_DECAY_FILE,`${id} lacks a ratified reputation amendment`,'REP-V-007'));
if(r.Status!=='Active')violations.push(reputationViolation(REPUTATION_DECAY_FILE,`${id} has invalid status '${r.Status}'`,'REP-V-007'));}
return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Reputation decay scanner',scanReputationDecay);
