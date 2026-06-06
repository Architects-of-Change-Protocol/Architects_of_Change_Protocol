import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getReasonCode, normalizeReasonCode, classifyReasonCode } from '../../runtime/governance/reason-codes';
import { parseExecutionRequest, normalizeExecutionRequest, ExecutionRequestParseError } from '../../protocol/execution';
import {
  canonicalExecutionRequestFixture,
  invalidExecutionRequestFixture,
  invalidReasonCodeFixture,
  stableCanonicalFixtures,
} from './contract-fixtures';

const serialize = (value: unknown): string => JSON.stringify(value, null, 2);
const deserialize = (value: string): unknown => JSON.parse(value);

describe('protocol contract drift fixtures', () => {
  it('keeps serialized JSON snapshots for every stable canonical fixture', () => {
    expect(Object.keys(stableCanonicalFixtures)).toEqual([
      'principalRef',
      'authority',
      'capabilityClaim',
      'capabilityToken',
      'capabilityGrant',
      'consentGrant',
      'auditEventEnvelope',
      'attestation',
      'proofEnvelope',
      'verification',
      'registryReference',
      'policyDecision',
      'decision',
      'reasonCode',
      'executionRequest',
    ]);

    expect(serialize(stableCanonicalFixtures)).toMatchSnapshot();
  });

  it('round-trips fixture JSON without mutating serializable contract shapes', () => {
    const { executionRequest: _executionRequest, ...serializableFixtures } = stableCanonicalFixtures;

    expect(deserialize(serialize(serializableFixtures))).toEqual(serializableFixtures);
    expect(deserialize(serialize(stableCanonicalFixtures.executionRequest))).toEqual({
      ...stableCanonicalFixtures.executionRequest,
      now: '2026-06-05T00:00:00.000Z',
    });
  });

  it('validates execution requests through the existing parser and normalizer', () => {
    const parsed = parseExecutionRequest(canonicalExecutionRequestFixture);
    const normalized = normalizeExecutionRequest(parsed);

    expect(normalized.execution_target).toEqual({ adapter: 'fixture-adapter', operation: 'summarize' });
    expect(normalized.requested_scope).toEqual([{ type: 'content', ref: 'dataset-1' }]);
    expect(() => parseExecutionRequest(invalidExecutionRequestFixture)).toThrow(ExecutionRequestParseError);
    expect(serialize({ parsed, normalized })).toMatchSnapshot();
  });

  it('validates reason-code fixtures through the existing registry helpers', () => {
    expect(getReasonCode(stableCanonicalFixtures.reasonCode.code)).toEqual(stableCanonicalFixtures.reasonCode);
    expect(normalizeReasonCode('POLICY_DENIED')).toBe('POLICY_DENY_OVERRIDES');
    expect(classifyReasonCode(invalidReasonCodeFixture)).toBe('unknown');
    expect(getReasonCode(invalidReasonCodeFixture)).toBeUndefined();
    expect(serialize({ valid: stableCanonicalFixtures.reasonCode, invalid: invalidReasonCodeFixture })).toMatchSnapshot();
  });

  it('documents contract gaps instead of inventing fake canonical contracts', () => {
    const manifest = readFileSync(join(__dirname, 'fixture-manifest.md'), 'utf8');

    expect(manifest).toContain('| DelegationChain | Gap: no stable canonical export found |');
    expect(manifest).toContain('| AttestationEnvelope | `@aoc/protocol/claims` `CanonicalAttestation` |');
    expect(manifest).toContain('| VerificationResult | `@aoc/protocol/claims` `CanonicalVerification` |');
    expect(manifest).toContain('| ExecutionPlan / ExecutionRequest | `protocol/execution` `ExecutionRequest`');
  });
});
