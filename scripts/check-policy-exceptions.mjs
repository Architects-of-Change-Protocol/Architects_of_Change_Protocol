#!/usr/bin/env node
import { exceptionRecords, policyRecords, policyViolation, ratifiedPolicyAmendments, VALID_EXCEPTION_TYPES, POLICY_EXCEPTION_FILE } from './policy-governance-lib.mjs';
import { runScanner } from './constitutional-governance-lib.mjs';

export function scanPolicyExceptions(root) {
  const violations = [];
  const policies = new Map(policyRecords(root).map((policy) => [policy['Policy ID'], policy]));
  const amendments = new Map(ratifiedPolicyAmendments(root).map((record) => [record.id, record]));
  const today = new Date().toISOString().slice(0, 10);
  for (const exception of exceptionRecords(root)) {
    const id = exception['Exception ID']; const policy = policies.get(exception['Affected Policy']);
    if (!/^PEX-\d{4}$/.test(id)) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `invalid exception ID '${id}'`, 'POL-V-004'));
    if (!VALID_EXCEPTION_TYPES.includes(exception.Type)) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `${id} has invalid type '${exception.Type}'`, 'POL-V-004'));
    if (!policy || ![policy.Owner, 'Constitution'].includes(exception.Owner)) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `${id} has unauthorized owner '${exception.Owner}'`, 'POL-V-004'));
    const amendment = amendments.get(exception['Ratified Amendment']);
    if (!amendment || !/\*\*Type:\*\*\s*Type C/.test(amendment.body)) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `${id} lacks a ratified Type C amendment`, 'POL-V-004'));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.Expiration)) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `${id} lacks a concrete expiration`, 'POL-V-004'));
    else {
      if (exception.Expiration <= exception['Effective Date']) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `${id} expiration does not follow its effective date`, 'POL-V-004'));
      if (exception.Status === 'Active' && exception.Expiration < today) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `${id} expired on ${exception.Expiration}`, 'POL-V-004'));
    }
    if (!exception.Duration || !exception['Replacement Constraint']) violations.push(policyViolation(POLICY_EXCEPTION_FILE, `${id} lacks duration or replacement constraint`, 'POL-V-004'));
  }
  return violations;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) runScanner('Policy exception scanner', scanPolicyExceptions);
