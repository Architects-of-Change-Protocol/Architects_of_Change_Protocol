#!/usr/bin/env node
import { validateRatificationAmendmentLock, validateRatificationVersionParity } from './ratification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRatificationAmendmentLock(root){const violations=[];validateRatificationVersionParity(root,violations);validateRatificationAmendmentLock(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Ratification amendment lock scanner',scanRatificationAmendmentLock);
