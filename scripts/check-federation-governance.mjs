#!/usr/bin/env node
import { federationGovernanceRecords, federationViolation, FEDERATION_GOVERNANCE_FILE } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationGovernance(root){const violations=[];const records=federationGovernanceRecords(root);for(const r of records){const id=r['Governance Record ID'];if(!id||!/^FGOV-\d{4}$/.test(id))violations.push(federationViolation(FEDERATION_GOVERNANCE_FILE,`invalid governance record ID '${id}'`,'FED-V-007'));if(!r['Federation ID'])violations.push(federationViolation(FEDERATION_GOVERNANCE_FILE,`${id} is missing a federation ID`,'FED-V-007'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation governance scanner',scanFederationGovernance);
