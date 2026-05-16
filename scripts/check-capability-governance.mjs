import fs from 'node:fs';

const requiredDocs = [
  'CAPABILITY_RUNTIME_ARCHITECTURE.md',
  'CAPABILITY_DELEGATION_MODEL.md',
  'CAPABILITY_ATTENUATION_MODEL.md',
  'CAPABILITY_LINEAGE_MODEL.md',
  'CAPABILITY_REVOCATION_MODEL.md',
  'CAPABILITY_EXPLAINABILITY_TRACE.md',
  'CAPABILITY_CONSTRAINT_MODEL.md',
  'CAPABILITY_PUBLIC_INTERNAL_BOUNDARIES.md',
  'SOVEREIGN_EXECUTION_SEMANTICS.md',
  'CAPABILITY_EVOLUTION_ROADMAP.md'
];

for (const doc of requiredDocs) {
  if (!fs.existsSync(doc)) {
    throw new Error(`Missing required governance document: ${doc}`);
  }
}

const governanceSource = fs.readFileSync('runtime/capabilities/governance.ts', 'utf8');
for (const marker of ['validateDelegation', 'attenuateCapability', 'evaluateCapabilityLineage']) {
  if (!governanceSource.includes(`function ${marker}`)) {
    throw new Error(`Missing required helper: ${marker}`);
  }
}

console.log('Capability governance checks passed.');
