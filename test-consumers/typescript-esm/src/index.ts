import type { CapabilityToken } from '@aoc/protocol';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType } from '@aoc/protocol/claims';
import type { CanonicalClaim } from '@aoc/protocol/claims';
import type { ProtocolError } from '@aoc/protocol/errors';
import type { RevocationLookup } from '@aoc/protocol/adapters';
import { AdapterRegistry, AdapterTokens } from '@aoc/protocol/runtime-registry';
import {
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';
import type { SovereigntyCapabilityId, SovereigntyCapabilityKey } from '@aoc/protocol/sovereignty-capabilities';

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

const sovereigntyCapabilities = listSovereigntyCapabilities();
if (sovereigntyCapabilities.length !== 8) {
  throw new Error(`expected 8 sovereignty capabilities, got ${sovereigntyCapabilities.length}`);
}
assertType<readonly SovereigntyCapabilityKey[]>(sovereigntyCapabilities.map((capability) => capability.key));
if (
  sovereigntyCapabilities.map((capability) => capability.key).join(',') !==
  'identity,integrity,provenance,portability,interoperability,verifiability,licensing_terms,governance_compatibility'
) {
  throw new Error('sovereignty capability enumeration is not in canonical order');
}

const identityCapabilityId: SovereigntyCapabilityId = 'aoc:sovereignty-capability:identity';
const identityCapability = getSovereigntyCapability(identityCapabilityId);
if (!identityCapability || identityCapability.name !== 'Identity') {
  throw new Error('Identity lookup by canonical id failed');
}
if (!/^\d+\.\d+\.\d+$/.test(identityCapability.version)) {
  throw new Error('Identity has no explicit capability version');
}
if (getSovereigntyCapabilityByKey('governance_compatibility')?.id !== 'aoc:sovereignty-capability:governance-compatibility') {
  throw new Error('Governance Compatibility lookup failed');
}
if (getSovereigntyCapability('aoc:sovereignty-capability:wallet') !== undefined) {
  throw new Error('unknown sovereignty capability id resolved');
}

console.log(
  `typescript-esm consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilities.length}`,
);
