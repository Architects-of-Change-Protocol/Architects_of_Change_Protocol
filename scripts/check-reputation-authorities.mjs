#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireReputationFiles, validateReputationCatalog, validateReputationVersionParity } from './reputation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanReputationAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireReputationFiles(root,violations);validateReputationVersionParity(root,violations);validateReputationCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Reputation authority scanner',scanReputationAuthorities);
