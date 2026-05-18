import fs from 'node:fs';

const requiredDocs = [
  'RUNTIME_MEMORY_ARCHITECTURE.md',
  'MEMORY_DECLARATION_MODEL.md',
  'MEMORY_LINEAGE_MODEL.md',
  'MEMORY_RETENTION_GOVERNANCE.md',
  'MEMORY_REPLAY_SEMANTICS.md',
  'MEMORY_VISIBILITY_MODEL.md',
  'MEMORY_TRUST_POSTURE.md',
  'MEMORY_CONTINUITY_MODEL.md',
  'MEMORY_EXPLAINABILITY_TRACE.md',
  'FEDERATED_MEMORY_GOVERNANCE.md',
  'PERSISTENT_COGNITION_MODEL.md',
  'MEMORY_PUBLIC_INTERNAL_BOUNDARIES.md',
  'SOVEREIGN_COGNITIVE_STATE.md',
  'MEMORY_EVOLUTION_ROADMAP.md'
];

for (const doc of requiredDocs) {
  if (!fs.existsSync(doc)) throw new Error(`Missing required memory governance document: ${doc}`);
}

const source = fs.readFileSync('runtime/memory/governance.ts', 'utf8');
for (const marker of [
  'declareMemory',
  'validateMemoryLineage',
  'normalizeMemoryAssertion',
  'classifyMemoryConflict',
  'validateMemoryContinuity',
  'validateMemoryTrust',
  'classifyMemoryVisibility',
  'normalizeMemoryRetention',
  'buildMemoryAttestation',
  'buildCognitiveMemoryAssertion',
  'validateCognitiveContinuity',
  'normalizeCognitionDecision',
  'classifyCognitionConflict'
]) {
  if (!source.includes(`function ${marker}`)) throw new Error(`Missing required helper: ${marker}`);
}

console.log('Memory governance checks passed.');
