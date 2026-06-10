#!/usr/bin/env node
import { validateAuditCatalog, requireAuditFiles, validateAuditVersionParity } from './audit-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAuditAuthorities(root){const violations=[];requireAuditFiles(root,violations);validateAuditVersionParity(root,violations);validateAuditCatalog(root,violations);return violations;}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Audit authority scanner',scanAuditAuthorities);
