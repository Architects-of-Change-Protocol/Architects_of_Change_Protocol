import type { CapabilityToken } from '@aoc/protocol';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType } from '@aoc/protocol/claims';
import type { CanonicalClaim } from '@aoc/protocol/claims';
import type { ProtocolError } from '@aoc/protocol/errors';
import type { RevocationLookup } from '@aoc/protocol/adapters';
import { AdapterRegistry, AdapterTokens } from '@aoc/protocol/runtime-registry';

const assertType = <T>(_value: T): void => undefined;

const token: CapabilityToken = {
  schemaVersion: '1.0.0',
  tokenId: 'tok-1',
  issuer: 'issuer-1',
  subject: 'subject-1',
  resource: { kind: 'document', id: 'doc-1' },
  scope: ['read'],
  expiresAt: new Date().toISOString(),
  proof: { proofType: 'jwt', issuedAt: new Date().toISOString() },
};

assertType<AuditEventEnvelope | undefined>(undefined);
assertType<CanonicalClaim | undefined>(undefined);
assertType<ProtocolError | undefined>(undefined);
assertType<RevocationLookup | undefined>(undefined);

const registry = new AdapterRegistry();
registry.register(
  AdapterTokens.AuditEventSink,
  { recordAuditEvent: () => undefined },
  { implementation: 'noop', source: 'test-consumer', version: '0.0.0' },
);

if (ClaimType.Identity !== 'Identity') {
  throw new Error('ClaimType.Identity runtime value mismatch');
}

console.log(`typescript-esm consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name}`);
