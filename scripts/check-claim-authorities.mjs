#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireClaimFiles, validateClaimCatalog, validateClaimVersionParity } from './claim-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanClaimAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireClaimFiles(root,violations);validateClaimVersionParity(root,violations);validateClaimCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Claim authority scanner',scanClaimAuthorities);
