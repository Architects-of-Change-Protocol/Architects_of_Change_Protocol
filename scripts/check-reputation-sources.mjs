#!/usr/bin/env node
import { reputationRecords, reputationSourceRecords, reputationAmendments, reputationViolation, REPUTATION_SOURCES_FILE } from './reputation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanReputationSources(root){const violations=[],reputations=new Map(reputationRecords(root).map(r=>[r['Reputation ID'],r])),amendments=new Set(reputationAmendments(root).map(r=>r.id)),records=reputationSourceRecords(root);
if(!records.length)violations.push(reputationViolation(REPUTATION_SOURCES_FILE,'reputation sources registry contains no records','REP-V-002'));
const coveredClasses=new Set(records.map(r=>r['Reputation Class']));
for(const [,rep] of reputations){if(!coveredClasses.has(rep['Reputation Class']))violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`no source policy covers reputation class '${rep['Reputation Class']}'`,'REP-V-002'));}
for(const r of records){const id=r['Source Policy ID'];
if(!/^RSP-\d{4}$/.test(id))violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`invalid source policy ID '${id}'`,'REP-V-002'));
if(!r['Reputation Class'])violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} is missing Reputation Class`,'REP-V-002'));
if(!r['Allowed Sources'])violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} is missing Allowed Sources`,'REP-V-002'));
if(!r['Source Weight'])violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} is missing Source Weight`,'REP-V-002'));
if(!r['Source Freshness'])violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} is missing Source Freshness`,'REP-V-002'));
if(!r['Source Integrity'])violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} is missing Source Integrity`,'REP-V-002'));
if(!r['Source Traceability'])violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} is missing Source Traceability`,'REP-V-002'));
if(!r['Minimum Source Coverage'])violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} is missing Minimum Source Coverage`,'REP-V-002'));
if(!amendments.has(r.Amendment))violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} lacks a ratified reputation amendment`,'REP-V-002'));
if(r.Status!=='Active')violations.push(reputationViolation(REPUTATION_SOURCES_FILE,`${id} has invalid status '${r.Status}'`,'REP-V-002'));}
return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Reputation sources scanner',scanReputationSources);
