#!/usr/bin/env node
import { federationRecognitionRecords, federationViolation, FEDERATION_RECOGNITION_FILE } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationRecognition(root){const violations=[];const records=federationRecognitionRecords(root);for(const r of records){const id=r['Recognition ID'];if(!id||!/^FREC-\d{4}$/.test(id))violations.push(federationViolation(FEDERATION_RECOGNITION_FILE,`invalid recognition ID '${id}'`,'FED-V-002'));if(!r['Federation ID'])violations.push(federationViolation(FEDERATION_RECOGNITION_FILE,`${id} is missing a federation ID`,'FED-V-002'));if(!r.Status)violations.push(federationViolation(FEDERATION_RECOGNITION_FILE,`${id} is missing a status`,'FED-V-002'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation recognition scanner',scanFederationRecognition);
