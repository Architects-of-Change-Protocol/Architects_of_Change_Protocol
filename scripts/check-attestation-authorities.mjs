#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireAttestationFiles, validateAttestationCatalog, validateAttestationVersionParity } from './attestation-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAttestationAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireAttestationFiles(root,violations);validateAttestationVersionParity(root,violations);validateAttestationCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Attestation authority scanner',scanAttestationAuthorities);
