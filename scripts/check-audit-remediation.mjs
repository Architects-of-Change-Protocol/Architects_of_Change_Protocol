#!/usr/bin/env node
import { validateAuditRemediation } from './audit-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditRemediation(root){const violations=[];validateAuditRemediation(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit remediation scanner',scanAuditRemediation);
