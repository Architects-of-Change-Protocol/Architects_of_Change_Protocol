#!/usr/bin/env node
import { inheritanceRecords, parseCapabilityIds, policyRecords, policyViolation, ratifiedPolicyAmendments, POLICY_HIERARCHY_FILE } from './policy-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanPolicyHierarchy(root) {
  const violations = [];
  const policies = new Map(policyRecords(root).map((policy) => [policy['Policy ID'], policy]));
  const amendments = new Set(ratifiedPolicyAmendments(root).map((record) => record.id));
  const order = new Map(['Constitutional', 'Governance', 'Runtime', 'Operational'].map((value, index) => [value, index]));
  const graph = new Map();

  for (const link of inheritanceRecords(root)) {
    const parent = policies.get(link['Parent Policy']);
    const child = policies.get(link['Child Policy']);
    if (!parent || !child) {
      violations.push(policyViolation(POLICY_HIERARCHY_FILE, `${link['Inheritance ID']} references an unknown parent or child policy`, 'POL-V-006'));
      continue;
    }
    if (parent === child) violations.push(policyViolation(POLICY_HIERARCHY_FILE, `${link['Inheritance ID']} makes '${parent['Policy ID']}' its own parent`, 'POL-V-006'));
    if (link.Relationship !== 'Narrows') violations.push(policyViolation(POLICY_HIERARCHY_FILE, `${link['Inheritance ID']} uses forbidden inheritance relationship '${link.Relationship}'`, 'POL-V-002'));
    if ((order.get(child['Policy Class']) ?? -1) < (order.get(parent['Policy Class']) ?? -1)) violations.push(policyViolation(POLICY_HIERARCHY_FILE, `${child['Policy ID']} class broadens above parent ${parent['Policy ID']}`, 'POL-V-006'));
    if (Number(child['Constraint Strength']) < Number(parent['Constraint Strength'])) violations.push(policyViolation(POLICY_HIERARCHY_FILE, `${child['Policy ID']} weakens parent ${parent['Policy ID']}`, 'POL-V-002'));
    const parentScope = parseCapabilityIds(parent['Applies To Capability IDs']);
    for (const capability of parseCapabilityIds(child['Applies To Capability IDs'])) if (!parentScope.has(capability)) violations.push(policyViolation(POLICY_HIERARCHY_FILE, `${child['Policy ID']} expands beyond parent ${parent['Policy ID']} to ${capability}`, 'POL-V-002'));
    if (!amendments.has(link.Amendment)) violations.push(policyViolation(POLICY_HIERARCHY_FILE, `${link['Inheritance ID']} lacks a ratified Type B or Type C amendment`, 'POL-V-006'));
    const children = graph.get(parent['Policy ID']) ?? [];
    children.push(child['Policy ID']); graph.set(parent['Policy ID'], children);
  }

  const visiting = new Set(); const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) { violations.push(policyViolation(POLICY_HIERARCHY_FILE, `policy inheritance contains a cycle at '${id}'`, 'POL-V-006')); return; }
    if (visited.has(id)) return;
    visiting.add(id); for (const child of graph.get(id) ?? []) visit(child); visiting.delete(id); visited.add(id);
  };
  for (const id of policies.keys()) visit(id);
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Policy hierarchy scanner', scanPolicyHierarchy);
