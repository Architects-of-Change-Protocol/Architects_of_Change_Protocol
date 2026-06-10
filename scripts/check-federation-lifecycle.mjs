#!/usr/bin/env node
import { federationLifecycleRecords, federationViolation, FEDERATION_TRANSITIONS, FEDERATION_LIFECYCLE_FILE } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationLifecycle(root){const violations=[];const records=federationLifecycleRecords(root);for(const r of records){const from=r.From,to=r.To;if(!FEDERATION_TRANSITIONS.has(from)||!FEDERATION_TRANSITIONS.get(from).has(to))violations.push(federationViolation(FEDERATION_LIFECYCLE_FILE,`invalid lifecycle transition from '${from}' to '${to}'`,'FED-V-008'));}return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation lifecycle scanner',scanFederationLifecycle);
