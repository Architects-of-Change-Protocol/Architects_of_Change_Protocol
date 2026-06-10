#!/usr/bin/env node
import { validateRatificationReadiness, validateRatificationVersionParity } from './ratification-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanRatificationReadiness(root){const violations=[];validateRatificationVersionParity(root,violations);validateRatificationReadiness(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Ratification readiness scanner',scanRatificationReadiness);
