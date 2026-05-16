import { access } from 'node:fs/promises';

const requiredDocs = [
  'docs/governance/POLICY_ENGINE_ARCHITECTURE.md',
  'docs/governance/POLICY_SEMANTICS_MODEL.md',
  'docs/governance/POLICY_EVALUATION_ORDER.md',
  'docs/governance/POLICY_CONFLICT_RESOLUTION.md',
  'docs/governance/POLICY_EXPLAINABILITY_TRACE.md',
  'docs/governance/POLICY_PUBLIC_INTERNAL_BOUNDARIES.md',
  'docs/governance/POLICY_ADAPTER_GUIDANCE.md',
  'docs/governance/POLICY_EVOLUTION_ROADMAP.md'
];

for (const file of requiredDocs) {
  try { await access(file); } catch { throw new Error(`Missing policy governance doc: ${file}`); }
}

console.log('Policy governance docs check passed.');
