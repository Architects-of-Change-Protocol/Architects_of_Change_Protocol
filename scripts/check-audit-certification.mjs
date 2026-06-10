#!/usr/bin/env node
import { validateAuditCertification } from './audit-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditCertification(root){const violations=[];validateAuditCertification(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit certification scanner',scanAuditCertification);
