#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireVerificationFiles, validateVerificationCatalog, validateVerificationVersionParity } from './verification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVerificationAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireVerificationFiles(root,violations);validateVerificationVersionParity(root,violations);validateVerificationCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Verification authority scanner',scanVerificationAuthorities);
