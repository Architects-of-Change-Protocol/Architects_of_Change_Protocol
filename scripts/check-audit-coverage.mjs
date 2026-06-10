#!/usr/bin/env node
import { validateAuditCoverage } from './audit-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditCoverage(root){const violations=[];validateAuditCoverage(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit coverage scanner',scanAuditCoverage);
