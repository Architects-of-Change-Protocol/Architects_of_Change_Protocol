import fs from 'node:fs';

const requiredDocs = [
  'RUNTIME_INTENT_ARCHITECTURE.md',
  'INTENT_DECLARATION_MODEL.md',
  'INTENT_LINEAGE_MODEL.md',
  'INTENT_NEGOTIATION_SEMANTICS.md',
  'INTENT_CONFLICT_RESOLUTION.md',
  'INTENT_EXPLAINABILITY_TRACE.md',
  'INTENT_POLICY_ALIGNMENT.md',
  'INTENT_CAPABILITY_ALIGNMENT.md',
  'INTENT_EXECUTION_ALIGNMENT.md',
  'AGENTIC_COORDINATION_MODEL.md',
  'FEDERATED_INTENT_GOVERNANCE.md',
  'INTENT_PUBLIC_INTERNAL_BOUNDARIES.md',
  'SOVEREIGN_MACHINE_INTENTION.md',
  'INTENT_EVOLUTION_ROADMAP.md'
];

for (const doc of requiredDocs) {
  if (!fs.existsSync(doc)) throw new Error(`Missing required governance document: ${doc}`);
}

const source = fs.readFileSync('runtime/intent/governance.ts', 'utf8');
for (const marker of ['declareIntent', 'validateIntentDeclaration', 'normalizeIntentAssertion', 'classifyIntentConflict', 'validateIntentLineage']) {
  if (!source.includes(`function ${marker}`)) throw new Error(`Missing required helper: ${marker}`);
}

console.log('Intent governance checks passed.');
