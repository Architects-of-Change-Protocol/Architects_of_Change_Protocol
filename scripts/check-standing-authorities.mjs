#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireStandingFiles, validateStandingCatalog, validateStandingVersionParity } from './standing-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanStandingAuthorities(root) { const violations=[...scanConstitutionalVersioning(root)]; requireStandingFiles(root,violations); validateStandingVersionParity(root,violations); validateStandingCatalog(root,violations); return violations; }
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Standing authority scanner', scanStandingAuthorities);
