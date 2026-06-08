#!/usr/bin/env node
import { scanPolicyAuthorities } from './check-policy-authorities.mjs';
import { scanPolicyHierarchy } from './check-policy-hierarchy.mjs';
import { scanPolicyConflicts } from './check-policy-conflicts.mjs';
import { scanPolicyExceptions } from './check-policy-exceptions.mjs';
import { lifecycleRecords, policyRecords, policyViolation, ratifiedPolicyAmendments, POLICY_LIFECYCLE_FILE, POLICY_TRANSITIONS } from './policy-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanPolicyLifecycle(root) {
  const violations = [];
  const policies = new Map(policyRecords(root).map((policy) => [policy['Policy ID'], policy]));
  const amendments = new Set(ratifiedPolicyAmendments(root).map((record) => record.id));
  const state = new Map();
  for (const transition of lifecycleRecords(root)) {
    const id = transition['Transition ID']; const policyId = transition['Policy ID'];
    if (!policies.has(policyId)) { violations.push(policyViolation(POLICY_LIFECYCLE_FILE, `${id} references unknown policy '${policyId}'`, 'POL-V-008')); continue; }
    if (!POLICY_TRANSITIONS.get(transition.From)?.has(transition.To)) violations.push(policyViolation(POLICY_LIFECYCLE_FILE, `${id} contains invalid lifecycle transition '${transition.From}' → '${transition.To}'`, 'POL-V-008'));
    if (state.has(policyId) && state.get(policyId) !== transition.From) violations.push(policyViolation(POLICY_LIFECYCLE_FILE, `${id} starts at '${transition.From}' instead of prior state '${state.get(policyId)}'`, 'POL-V-008'));
    if (!amendments.has(transition.Amendment)) violations.push(policyViolation(POLICY_LIFECYCLE_FILE, `${id} lacks a ratified Type B or Type C amendment`, 'POL-V-008'));
    state.set(policyId, transition.To);
  }
  for (const [id, policy] of policies) if (state.get(id) !== policy['Lifecycle State']) violations.push(policyViolation(POLICY_LIFECYCLE_FILE, `${id} catalog state '${policy['Lifecycle State']}' does not match lifecycle ledger '${state.get(id) ?? 'missing'}'`, 'POL-V-008'));
  return violations;
}

export function scanPolicyGovernance(root) {
  return [...scanPolicyAuthorities(root), ...scanPolicyHierarchy(root), ...scanPolicyConflicts(root), ...scanPolicyExceptions(root), ...scanPolicyLifecycle(root)];
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Policy governance scanner', scanPolicyGovernance);
