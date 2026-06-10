#!/usr/bin/env node
import { validateAuditIntegrity } from './audit-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditIntegrity(root){const violations=[];validateAuditIntegrity(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit integrity scanner',scanAuditIntegrity);
