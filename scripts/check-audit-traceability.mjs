#!/usr/bin/env node
import { validateAuditTraceability } from './audit-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditTraceability(root){const violations=[];validateAuditTraceability(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit traceability scanner',scanAuditTraceability);
