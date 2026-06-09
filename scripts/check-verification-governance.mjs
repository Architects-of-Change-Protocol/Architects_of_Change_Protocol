#!/usr/bin/env node
import { scanVerificationAuthorities } from './check-verification-authorities.mjs';
import { scanVerificationEvidence } from './check-verification-evidence.mjs';
import { scanVerificationLifecycle } from './check-verification-lifecycle.mjs';
import { scanVerificationMethods } from './check-verification-methods.mjs';
import { scanVerificationExpiration } from './check-verification-expiration.mjs';
import { scanVerificationRevocation } from './check-verification-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanVerificationGovernance(root){return [...scanVerificationAuthorities(root),...scanVerificationEvidence(root),...scanVerificationLifecycle(root),...scanVerificationMethods(root),...scanVerificationExpiration(root),...scanVerificationRevocation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Verification governance scanner',scanVerificationGovernance);
