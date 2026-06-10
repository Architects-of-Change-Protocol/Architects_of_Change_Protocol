#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireEconomicsFiles, validateEconomicsCatalog, validateEconomicsVersionParity } from './economics-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanEconomicsAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireEconomicsFiles(root,violations);validateEconomicsVersionParity(root,violations);validateEconomicsCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Economics authority scanner',scanEconomicsAuthorities);
