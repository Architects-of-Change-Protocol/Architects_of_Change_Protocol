#!/usr/bin/env node
import { validateRatificationLifecycle, validateRatificationVersionParity } from './ratification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRatificationLifecycle(root){const violations=[];validateRatificationVersionParity(root,violations);validateRatificationLifecycle(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Ratification lifecycle scanner',scanRatificationLifecycle);
