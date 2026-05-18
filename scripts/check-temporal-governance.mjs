import fs from 'node:fs';

const requiredDocs = [
  'RUNTIME_TEMPORAL_ARCHITECTURE.md',
  'TEMPORAL_CONSISTENCY_MODEL.md',
  'DETERMINISTIC_REPLAY_SEMANTICS.md',
  'CAUSAL_EXECUTION_MODEL.md',
  'TEMPORAL_CONTINUITY_MODEL.md',
  'TEMPORAL_FEDERATION_GOVERNANCE.md',
  'TEMPORAL_EXPLAINABILITY_TRACE.md',
  'TEMPORAL_TRUST_POSTURE.md',
  'DETERMINISTIC_COGNITION_MODEL.md',
  'TEMPORAL_PUBLIC_INTERNAL_BOUNDARIES.md',
  'SOVEREIGN_TEMPORAL_CONSISTENCY.md',
  'TEMPORAL_EVOLUTION_ROADMAP.md',
];

const missing = requiredDocs.filter((file) => !fs.existsSync(file));
if (missing.length > 0) {
  console.error('Temporal governance docs missing:');
  for (const file of missing) console.error(` - ${file}`);
  process.exit(1);
}

const temporalTypes = fs.readFileSync('runtime/execution-fabric/temporal.ts', 'utf8');
const requiredTokens = [
  'TemporalExecutionReference',
  'TemporalLineage',
  'TemporalContinuityReference',
  'TemporalReplayReference',
  'TemporalSequenceEnvelope',
  'validateTemporalConsistency',
  'validateReplayChronology',
  'validateCausalOrdering',
  'validateDeterministicReplay',
  'classifyChronologyConflict',
  "'sequence_regression'",
  "'federated_chronology'",
];

for (const token of requiredTokens) {
  if (!temporalTypes.includes(token)) {
    console.error(`Missing temporal governance token in runtime/execution-fabric/temporal.ts: ${token}`);
    process.exit(1);
  }
}

console.log('Temporal governance checks passed.');
