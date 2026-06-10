#!/usr/bin/env node
import { scanFederationAuthorities } from './check-federation-authorities.mjs';
import { scanFederationRecognition } from './check-federation-recognition.mjs';
import { scanFederationTrust } from './check-federation-trust.mjs';
import { scanFederationDelegation } from './check-federation-delegation.mjs';
import { scanFederationCapabilities } from './check-federation-capabilities.mjs';
import { scanFederationGovernance } from './check-federation-governance.mjs';
import { scanFederationLifecycle } from './check-federation-lifecycle.mjs';
import { scanFederationChallenges } from './check-federation-challenges.mjs';
import { scanFederationRevocation } from './check-federation-revocation.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';
export function scanFederationFederation(root){return[...scanFederationAuthorities(root),...scanFederationRecognition(root),...scanFederationTrust(root),...scanFederationDelegation(root),...scanFederationCapabilities(root),...scanFederationGovernance(root),...scanFederationLifecycle(root),...scanFederationChallenges(root),...scanFederationRevocation(root)];}
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)runScanner('Federation governance scanner',scanFederationFederation);
