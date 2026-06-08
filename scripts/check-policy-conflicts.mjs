#!/usr/bin/env node
import { activePolicies, conflictRecords, parseCapabilityIds, policyViolation, ratifiedPolicyAmendments, POLICY_CONFLICT_FILE } from './policy-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

const overlap = (left, right) => [...left].some((value) => right.has(value));
export function scanPolicyConflicts(root) {
  const violations = [];
  const policies = activePolicies(root);
  const byId = new Map(policies.map((policy) => [policy['Policy ID'], policy]));
  const policyAmendments = ratifiedPolicyAmendments(root);
  const amendments = new Set(policyAmendments.map((record) => record.id));
  const amendmentDates = new Map(policyAmendments.map((record) => [record.id, record.body.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? '']));
  const records = conflictRecords(root);

  for (let leftIndex = 0; leftIndex < policies.length; leftIndex += 1) for (let rightIndex = leftIndex + 1; rightIndex < policies.length; rightIndex += 1) {
    const left = policies[leftIndex]; const right = policies[rightIndex];
    if (left['Rule Domain'] !== right['Rule Domain'] || left.Effect === right.Effect || !overlap(parseCapabilityIds(left['Applies To Capability IDs']), parseCapabilityIds(right['Applies To Capability IDs']))) continue;
    const candidates = [left, right];
    let winners = candidates.filter((policy) => Number(policy.Priority) === Math.max(...candidates.map((item) => Number(item.Priority))));
    if (winners.length > 1) winners = winners.filter((policy) => Number(policy['Constraint Strength']) === Math.max(...winners.map((item) => Number(item['Constraint Strength']))));
    if (winners.length > 1) {
      const latestDate = [...winners].map((policy) => amendmentDates.get(policy['Creation Amendment']) ?? '').sort().at(-1);
      winners = winners.filter((policy) => (amendmentDates.get(policy['Creation Amendment']) ?? '') === latestDate);
    }
    const record = records.find((item) => item['Policy IDs'].split(/\s*,\s*/).includes(left['Policy ID']) && item['Policy IDs'].split(/\s*,\s*/).includes(right['Policy ID']));
    if (winners.length !== 1 && !record) violations.push(policyViolation(POLICY_CONFLICT_FILE, `${left['Policy ID']} and ${right['Policy ID']} have ambiguous conflicting rules and no unique winner`, 'POL-V-003'));
    if (record && (!byId.has(record.Winner) || (winners.length === 1 && record.Winner !== winners[0]['Policy ID']))) violations.push(policyViolation(POLICY_CONFLICT_FILE, `${record['Conflict ID']} declares invalid winner '${record.Winner}'`, 'POL-V-003'));
  }
  for (const record of records) {
    const ids = record['Policy IDs'].split(/\s*,\s*/).filter(Boolean);
    if (ids.length < 2 || ids.some((id) => !byId.has(id))) violations.push(policyViolation(POLICY_CONFLICT_FILE, `${record['Conflict ID']} references fewer than two active policies`, 'POL-V-003'));
    if (!ids.includes(record.Winner)) violations.push(policyViolation(POLICY_CONFLICT_FILE, `${record['Conflict ID']} winner is not a conflicting policy`, 'POL-V-003'));
    if (!amendments.has(record.Amendment)) violations.push(policyViolation(POLICY_CONFLICT_FILE, `${record['Conflict ID']} lacks a ratified amendment`, 'POL-V-003'));
    if (record.Status === 'Unresolved') violations.push(policyViolation(POLICY_CONFLICT_FILE, `${record['Conflict ID']} remains unresolved`, 'POL-V-003'));
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Policy conflict scanner', scanPolicyConflicts);
