#!/usr/bin/env node
import {
  ACTIVE_LIFECYCLE_STATES,
  CAPABILITY_AUTHORITY_FILE,
  assignmentRecords,
  capabilityRecords,
  capabilityViolation,
  requireCapabilityFiles,
} from './capability-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanCapabilityDelegation(root) {
  const violations = [];
  requireCapabilityFiles(root, violations);
  const capabilities = new Map(capabilityRecords(root).map((record) => [record['Capability ID'], record]));
  const assignments = assignmentRecords(root);
  const byId = new Map(assignments.map((record) => [record['Assignment ID'], record]));

  for (const assignment of assignments) {
    if (assignment['Parent Assignment'] === 'Root' && assignment['Lifecycle State'] === 'Delegated') {
      violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Assignment ID']} is Delegated but has no parent assignment`, 'CAP-V-002'));
      continue;
    }
    if (assignment['Parent Assignment'] === 'Root') continue;
    const capability = capabilities.get(assignment['Capability ID']);
    const parent = byId.get(assignment['Parent Assignment']);
    if (capability?.Delegable !== 'Yes' || capability?.['Capability Class'] === 'Constitutional') {
      violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Assignment ID']} delegates non-delegable capability '${assignment['Capability ID']}'`, 'CAP-V-002'));
    }
    if (assignment['Lifecycle State'] !== 'Delegated') violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Assignment ID']} has a parent but is not in Delegated state`, 'CAP-V-002'));
    if (parent && parent['Capability ID'] !== assignment['Capability ID']) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Assignment ID']} changes capability from parent ${parent['Assignment ID']}`, 'CAP-V-009'));
    if (parent && parent.Holder !== assignment['Granted By']) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Assignment ID']} was not granted by parent holder '${parent.Holder}'`, 'CAP-V-002'));
    if (parent && !ACTIVE_LIFECYCLE_STATES.includes(parent['Lifecycle State'])) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Assignment ID']} delegates from inactive parent ${parent['Assignment ID']}`, 'CAP-V-008'));
    if (assignment['Parent Assignment'] === assignment['Assignment ID']) violations.push(capabilityViolation(CAPABILITY_AUTHORITY_FILE, `${assignment['Assignment ID']} delegates from itself`, 'CAP-V-002'));
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runScanner('Capability delegation scanner', scanCapabilityDelegation);
}
