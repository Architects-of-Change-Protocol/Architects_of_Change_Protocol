#!/usr/bin/env node
import { scanConstitutionalVersioning } from './check-constitutional-versioning.mjs';
import { requireVotingFiles, validateVotingCatalog, validateVotingVersionParity } from './voting-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVotingAuthorities(root){const violations=[...scanConstitutionalVersioning(root)];requireVotingFiles(root,violations);validateVotingVersionParity(root,violations);validateVotingCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Voting authority scanner',scanVotingAuthorities);
