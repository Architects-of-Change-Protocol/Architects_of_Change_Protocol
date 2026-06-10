#!/usr/bin/env node
import { federationCapabilityRecords, federationViolation, FEDERATION_CAPABILITY_FILE } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationCapabilities(root){const violations=[];const records=federationCapabilityRecords(root);for(const r of records){const id=r['Sharing ID'];if(!id||!/^FSHARE-\d{4}$/.test(id))violations.push(federationViolation(FEDERATION_CAPABILITY_FILE,`invalid capability sharing ID '${id}'`,'FED-V-001'));if(!r['Federation ID'])violations.push(federationViolation(FEDERATION_CAPABILITY_FILE,`${id} is missing a federation ID`,'FED-V-001'));if(!r.Mode)violations.push(federationViolation(FEDERATION_CAPABILITY_FILE,`${id} is missing a sharing mode`,'FED-V-001'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation capability scanner',scanFederationCapabilities);
