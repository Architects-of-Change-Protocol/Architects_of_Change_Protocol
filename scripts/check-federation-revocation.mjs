#!/usr/bin/env node
import { federationRevocationRecords, federationViolation, FEDERATION_REVOCATION_FILE } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationRevocation(root){const violations=[];const records=federationRevocationRecords(root);if(!records.length)violations.push(federationViolation(FEDERATION_REVOCATION_FILE,'revocation authority registry contains no records','FED-V-009'));for(const r of records){if(!['Yes','No'].includes(r.Revocable))violations.push(federationViolation(FEDERATION_REVOCATION_FILE,`revocation record has invalid Revocable value '${r.Revocable}'`,'FED-V-009'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation revocation scanner',scanFederationRevocation);
