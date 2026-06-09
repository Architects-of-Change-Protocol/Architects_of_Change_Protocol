#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireConsensusFiles, validateConsensusCatalog, validateConsensusVersionParity } from './consensus-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanConsensusAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireConsensusFiles(root,violations);validateConsensusVersionParity(root,violations);validateConsensusCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Consensus authority scanner',scanConsensusAuthorities);
