import { existsSync, readFileSync } from 'node:fs';

const docs = [
  'RUNTIME_FEDERATION_ARCHITECTURE.md',
  'FEDERATED_RUNTIME_IDENTITY_MODEL.md',
  'FEDERATED_TRUST_SEMANTICS.md',
  'FEDERATED_CAPABILITY_MODEL.md',
  'FEDERATED_EXECUTION_LINEAGE.md',
  'FEDERATED_REPLAY_SEMANTICS.md',
  'FEDERATED_ATTESTATION_MODEL.md',
  'FEDERATED_HANDSHAKE_MODEL.md',
  'FEDERATED_COMPATIBILITY_MODEL.md',
  'FEDERATED_EXPLAINABILITY_TRACE.md',
  'FEDERATED_PUBLIC_INTERNAL_BOUNDARIES.md',
  'SOVEREIGN_RUNTIME_FEDERATION.md',
  'FEDERATION_EVOLUTION_ROADMAP.md',
];

const missing = docs.filter((d) => !existsSync(d));
if (missing.length) {
  console.error('Missing federation governance docs:', missing.join(', '));
  process.exit(1);
}

const requiredTerms = ['federation', 'runtime', 'trust', 'lineage'];
const corpus = docs.map((doc) => readFileSync(doc, 'utf8').toLowerCase()).join('\n');
for (const term of requiredTerms) {
  if (!corpus.includes(term)) {
    console.error(`Federation governance corpus missing required term: ${term}`);
    process.exit(1);
  }
}

const sovereignDoc = readFileSync('SOVEREIGN_RUNTIME_FEDERATION.md', 'utf8').toLowerCase();
const requiredExamples = [
  'trusted runtime federation',
  'degraded runtime posture',
  'remote delegated execution',
  'federated replay lineage',
  'remote attestation chain',
  'federation compatibility failure',
  'sdk-safe federation trace',
  'audit-safe federation lineage',
  'future sovereign ai runtime federation',
  'enterprise federated governance flow',
];
for (const example of requiredExamples) {
  if (!sovereignDoc.includes(example)) {
    console.error(`SOVEREIGN_RUNTIME_FEDERATION.md missing example: ${example}`);
    process.exit(1);
  }
}

console.log('Federation governance checks passed.');
