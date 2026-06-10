#!/usr/bin/env node
import { federationTrustRecords, federationViolation, VALID_TRUST_LEVELS, FEDERATION_TRUST_FILE } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationTrust(root){const violations=[];const records=federationTrustRecords(root);for(const r of records){const id=r['Trust Record ID'];if(!id||!/^FTRS-\d{4}$/.test(id))violations.push(federationViolation(FEDERATION_TRUST_FILE,`invalid trust record ID '${id}'`,'FED-V-003'));if(r['Trust Level']&&!VALID_TRUST_LEVELS.includes(r['Trust Level']))violations.push(federationViolation(FEDERATION_TRUST_FILE,`${id} has invalid trust level '${r['Trust Level']}'`,'FED-V-003'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation trust scanner',scanFederationTrust);
