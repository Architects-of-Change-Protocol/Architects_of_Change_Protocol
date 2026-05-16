import fs from 'node:fs';

const requiredDocs = [
  'EXECUTION_FABRIC_ARCHITECTURE.md',
  'EXECUTION_LIFECYCLE_MODEL.md',
  'EXECUTION_ORCHESTRATION_SEMANTICS.md',
  'EXECUTION_CHECKPOINT_MODEL.md',
  'EXECUTION_REPLAY_MODEL.md',
  'EXECUTION_ATTESTATION_MODEL.md',
  'EXECUTION_LINEAGE_MODEL.md',
  'EXECUTION_EXPLAINABILITY_TRACE.md',
  'EXECUTION_PUBLIC_INTERNAL_BOUNDARIES.md',
  'SOVEREIGN_EXECUTION_FABRIC.md',
  'EXECUTION_EVOLUTION_ROADMAP.md',
];

const missing = requiredDocs.filter((f) => !fs.existsSync(f));
if (missing.length) {
  console.error('Execution governance docs missing:');
  for (const f of missing) console.error(` - ${f}`);
  process.exit(1);
}

const fabricTypes = fs.readFileSync('runtime/execution-fabric/types.ts', 'utf8');
const requiredTokens = [
  'ExecutionCheckpointRecord',
  'ExecutionReplayRecord',
  'ExecutionAttestationRecord',
  "'checkpointed'",
  "'suspended'",
  "'replayed'",
  "'invalid'",
];
for (const token of requiredTokens) {
  if (!fabricTypes.includes(token)) {
    console.error(`Missing execution governance token in runtime/execution-fabric/types.ts: ${token}`);
    process.exit(1);
  }
}

console.log('Execution governance checks passed.');
