#!/usr/bin/env node
import {
  ACTIVE_LIFECYCLE_STATES,
  CAPABILITY_AUTHORITY_FILE,
  assignmentRecords,
  capabilityRecords,
  capabilityViolation,
  requireCapabilityFiles,
  transitionRecords,
} from './capability-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanCapabilityRevocation(root) {
  const violations = [];
  requireCapabilityFiles(root, violations);
  const capabilities = new Map(capabilityRecords(root).map((record) => [record['Capability ID'], record]));
  const assignments = assignmentRecords(root);
  const byId = new Map(assignments.map((record) => [record['Assignment ID'], record]));
  const transitions = transitionRecords(root);

  for (const transition of transitions) {
    const assignment = byId.get(transition['Assignment ID']);
    if (assignment && ['Suspended', 'Revoked', 'Retired'].includes(transition.To) && ACTIVE_LIFECYCLE_STATES.includes(assignment['Lifecycle State'])) {
      violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${transition.To.toLowerCase()} assignment ${assignment['Assignment ID']} is still recorded as active`, transition.To === 'Suspended' ? 'CAP-V-008' : 'CAP-V-004'));
    }
  }

  for (const assignment of assignments) {
    const capability = capabilities.get(assignment['Capability ID']);
    if (capability?.Status === 'Retired') {
      violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `retired capability ${capability['Capability ID']} remains assigned by ${assignment['Assignment ID']}`, 'CAP-V-004'));
    }
    if (['Revoked', 'Retired'].includes(assignment['Lifecycle State'])) {
      for (const child of assignments.filter((candidate) => candidate['Parent Assignment'] === assignment['Assignment ID'])) {
        if (ACTIVE_LIFECYCLE_STATES.includes(child['Lifecycle State'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Lifecycle State'].toLowerCase()} assignment ${assignment['Assignment ID']} retains active child ${child['Assignment ID']}`, 'CAP-V-004'));
      }
    }
    if (assignment['Lifecycle State'] === 'Suspended') {
      for (const child of assignments.filter((candidate) => candidate['Parent Assignment'] === assignment['Assignment ID'])) {
        if (child['Lifecycle State'] === 'Delegated') violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `suspended assignment ${assignment['Assignment ID']} retains delegated child ${child['Assignment ID']}`, 'CAP-V-008'));
      }
    }
    if (assignment['Parent Assignment'] !== 'Root' && !byId.has(assignment['Parent Assignment'])) continue;
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Capability revocation scanner', scanCapabilityRevocation);
}
