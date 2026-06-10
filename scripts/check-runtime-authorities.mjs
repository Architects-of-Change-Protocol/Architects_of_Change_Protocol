#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireRuntimeFiles, validateRuntimeCatalog, validateRuntimeVersionParity } from './runtime-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRuntimeAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireRuntimeFiles(root,violations);validateRuntimeVersionParity(root,violations);validateRuntimeCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Runtime authority scanner',scanRuntimeAuthorities);
