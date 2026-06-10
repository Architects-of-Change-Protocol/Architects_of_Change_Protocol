#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireGovernanceFiles, validateGovernanceCatalog, validateGovernanceVersionParity } from './governance-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanGovernanceAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireGovernanceFiles(root,violations);validateGovernanceVersionParity(root,violations);validateGovernanceCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Governance authority scanner',scanGovernanceAuthorities);
