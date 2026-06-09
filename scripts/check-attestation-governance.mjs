#!/usr/bin/env node
import { scanAttestationAuthorities } from './check-attestation-authorities.mjs';
import { scanAttestationScope } from './check-attestation-scope.mjs';
import { scanAttestationEligibility } from './check-attestation-eligibility.mjs';
import { scanAttestationLifecycle } from './check-attestation-lifecycle.mjs';
import { scanAttestationWeight } from './check-attestation-weight.mjs';
import { scanAttestationExpiration } from './check-attestation-expiration.mjs';
import { scanAttestationRevocation } from './check-attestation-revocation.mjs';
import { scanAttestationDisputes } from './check-attestation-disputes.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanAttestationGovernance(root){return [...scanAttestationAuthorities(root),...scanAttestationScope(root),...scanAttestationEligibility(root),...scanAttestationLifecycle(root),...scanAttestationWeight(root),...scanAttestationExpiration(root),...scanAttestationRevocation(root),...scanAttestationDisputes(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Attestation governance scanner',scanAttestationGovernance);
