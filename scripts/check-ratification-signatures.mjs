#!/usr/bin/env node
import { validateRatificationSignatures, validateRatificationVersionParity } from './ratification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRatificationSignatures(root){const violations=[];validateRatificationVersionParity(root,violations);validateRatificationSignatures(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Ratification signature scanner',scanRatificationSignatures);
