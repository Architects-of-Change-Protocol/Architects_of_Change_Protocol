#!/usr/bin/env node
import { validateRatificationRelease, validateRatificationVersionParity } from './ratification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRatificationRelease(root){const violations=[];validateRatificationVersionParity(root,violations);validateRatificationRelease(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Ratification release scanner',scanRatificationRelease);
