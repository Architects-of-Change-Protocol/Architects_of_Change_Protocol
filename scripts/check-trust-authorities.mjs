#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireTrustFiles, validateTrustCatalog, validateTrustVersionParity } from './trust-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanTrustAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireTrustFiles(root,violations);validateTrustVersionParity(root,violations);validateTrustCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Trust authority scanner',scanTrustAuthorities);
