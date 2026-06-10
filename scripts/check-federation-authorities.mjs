#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireFederationFiles, validateFederationCatalog, validateFederationVersionParity } from './federation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireFederationFiles(root,violations);validateFederationVersionParity(root,violations);validateFederationCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation authority scanner',scanFederationAuthorities);
