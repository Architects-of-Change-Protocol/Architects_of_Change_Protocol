#!/usr/bin/env node
import { validateRatificationDecisions, validateRatificationVersionParity } from './ratification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRatificationDecisions(root){const violations=[];validateRatificationVersionParity(root,violations);validateRatificationDecisions(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Ratification decision scanner',scanRatificationDecisions);
