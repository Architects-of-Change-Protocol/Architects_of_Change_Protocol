#!/usr/bin/env node
import { validateRatificationAuthorityCatalog, requireRatificationFiles, validateRatificationVersionParity } from './ratification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRatificationAuthorities(root){const violations=[];requireRatificationFiles(root,violations);validateRatificationVersionParity(root,violations);validateRatificationAuthorityCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Ratification authority scanner',scanRatificationAuthorities);
