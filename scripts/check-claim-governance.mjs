#!/usr/bin/env node
import { scanClaimAuthorities } from './check-claim-authorities.mjs';
import { scanClaimEvidence } from './check-claim-evidence.mjs';
import { scanClaimLifecycle } from './check-claim-lifecycle.mjs';
import { scanClaimDisputes } from './check-claim-disputes.mjs';
import { scanClaimSupersession } from './check-claim-supersession.mjs';
import { scanClaimWithdrawal } from './check-claim-withdrawal.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanClaimGovernance(root){return [...scanClaimAuthorities(root),...scanClaimEvidence(root),...scanClaimLifecycle(root),...scanClaimDisputes(root),...scanClaimSupersession(root),...scanClaimWithdrawal(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Claim governance scanner',scanClaimGovernance);
