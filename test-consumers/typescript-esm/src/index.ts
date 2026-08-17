import type { CapabilityToken } from '@aoc/protocol';
import type { AuditEventEnvelope } from '@aoc/protocol/contracts';
import { ClaimType } from '@aoc/protocol/claims';
import type { CanonicalClaim } from '@aoc/protocol/claims';
import type { ProtocolError } from '@aoc/protocol/errors';
import type { RevocationLookup } from '@aoc/protocol/adapters';
import { AdapterRegistry, AdapterTokens } from '@aoc/protocol/runtime-registry';
import {
  buildSovereigntyCapabilityInvocation,
  getSovereigntyCapability,
  getSovereigntyCapabilityByKey,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidSovereigntyCapabilityInvocationEvidence,
  listSovereigntyCapabilities,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  SovereigntyCapabilityId,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityKey,
  SovereigntyCapabilityRef,
} from '@aoc/protocol/sovereignty-capabilities';
import type { AuditEventSink } from '@aoc/protocol/adapters';
import {
  buildSovereignExternalReference,
  isValidSovereignSubjectRef,
  mintSovereignAssetId,
  sovereignExternalReferencesEqual,
} from '@aoc/protocol/identity';
import type { SovereignExternalReference, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  buildSovereignManifestV1,
  generateSovereignKeyPair,
  signSovereignManifest,
  verifySovereignManifest,
} from '@aoc/protocol/manifest';
import type { SignedSovereignManifest } from '@aoc/protocol/manifest';
import { canonicalizeJSON } from '@aoc/protocol/canonical';

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

// A sovereign subject with no byte representation, from the packed tarball:
// identity + an opaque external reference, no fabricated content integrity.
const sovereignAssetId = mintSovereignAssetId();
const externalReference: SovereignExternalReference = buildSovereignExternalReference({
  namespace: 'alien-system-v47',
  id: 'alien-resource-92817',
  locator: 'future://provider/object/92817',
});
const subject: SovereignSubjectRef = { sovereignAssetId, externalReference };
if (!isValidSovereignSubjectRef(subject)) {
  throw new Error('subject reference rejected');
}

const nonByteManifest = buildSovereignManifestV1({
  sovereignAssetId,
  externalReference,
  registrant: 'principal:consumer',
  // deliberately NO contentIdentity
});
if ('contentIdentity' in nonByteManifest) {
  throw new Error('absent contentIdentity was serialized instead of omitted');
}
if (canonicalizeJSON(nonByteManifest).includes('contentIdentity')) {
  throw new Error('canonical payload leaked contentIdentity');
}

const { signingKey, privateKeyPem } = generateSovereignKeyPair();
const signedNonByteManifest = signSovereignManifest(nonByteManifest, privateKeyPem, signingKey);
const roundTripped = JSON.parse(JSON.stringify(signedNonByteManifest)) as SignedSovereignManifest;
if (
  !roundTripped.manifest.externalReference ||
  !sovereignExternalReferencesEqual(roundTripped.manifest.externalReference, externalReference)
) {
  throw new Error('external reference did not survive serialization exactly');
}

const verification = await verifySovereignManifest(roundTripped);
if (
  verification.checks.manifestStructure !== 'valid' ||
  verification.checks.manifestDigest !== 'valid' ||
  verification.checks.signature !== 'valid'
) {
  throw new Error('non-byte subject manifest failed cryptographic verification');
}
if (verification.checks.contentDigest !== 'not_performed') {
  throw new Error(`contentDigest must be not_performed, got ${verification.checks.contentDigest}`);
}
if (!verification.valid) {
  throw new Error('non-byte subject manifest failed verification');
}


// An external ESM consumer implements the public Sovereignty Capability
// interface and drives it through the public invoker, from the packed tarball
// only. Demo/test code — not a real mineral capsule.
const identityCapabilityRef = getSovereigntyCapabilityRefByKey('identity') as SovereigntyCapabilityRef;
const createdSubject: SovereignSubjectRef = {
  sovereignAssetId: mintSovereignAssetId(),
  externalReference: buildSovereignExternalReference({
    namespace: 'alien-system-v47',
    id: 'alien-resource-92817',
  }),
};

const consumerIdentityShapedImplementation: SovereigntyCapabilityImplementation<
  { externalReference: SovereignExternalReference },
  { minted: true }
> = {
  capability: identityCapabilityRef,
  async invoke() {
    return { status: 'succeeded', output: { minted: true }, subject: createdSubject };
  },
};

const consumerEvents: AuditEventEnvelope[] = [];
const consumerEvidenceSink: AuditEventSink = {
  recordAuditEvent(event) {
    consumerEvents.push(event);
  },
};

// Identity-shaped: no subject before, a subject after.
const identityInvocation = buildSovereigntyCapabilityInvocation({
  capability: identityCapabilityRef,
  correlationId: 'consumer-flow-esm-001',
  input: { externalReference },
});
if (identityInvocation.subject !== undefined) {
  throw new Error('common invocation required a subject it should not have');
}

const identityResult = await invokeSovereigntyCapability(identityInvocation, consumerIdentityShapedImplementation, {
  evidenceSink: consumerEvidenceSink,
});
if (identityResult.status !== 'succeeded') throw new Error('consumer capability invocation failed');
if (identityResult.subject?.sovereignAssetId !== createdSubject.sovereignAssetId) {
  throw new Error('the subject created by the capability did not reach the result');
}
if (!isValidSovereigntyCapabilityInvocationEvidence(identityResult.evidence)) {
  throw new Error('capability invocation evidence is not valid');
}
if (identityResult.evidence.capability.id !== 'aoc:sovereignty-capability:identity') {
  throw new Error('evidence does not attribute the canonical Identity capability');
}
if (identityResult.evidence.capability.version !== identityCapabilityRef.version) {
  throw new Error('evidence lost the exact capability version');
}
if (identityResult.evidence.invocationId !== identityInvocation.invocationId) {
  throw new Error('evidence lost the invocation id');
}
if (identityResult.evidence.correlationId !== 'consumer-flow-esm-001') {
  throw new Error('evidence lost the correlation id');
}
if (JSON.stringify(identityResult.evidence).includes('minted')) {
  throw new Error('evidence embedded the raw capability output');
}
if (
  canonicalizeJSON(JSON.parse(JSON.stringify(identityResult.evidence))) !==
  canonicalizeJSON(identityResult.evidence)
) {
  throw new Error('evidence did not survive a canonical round trip');
}
if (consumerEvents.length !== 1 || consumerEvents[0].eventId !== identityInvocation.invocationId) {
  throw new Error('evidence sink did not receive exactly one matching record');
}

// Integrity-shaped: raw bytes, no subject, no sink at all.
const integrityCapabilityRef = getSovereigntyCapabilityRefByKey('integrity') as SovereigntyCapabilityRef;
const bytesResult = await invokeSovereigntyCapability(
  buildSovereigntyCapabilityInvocation({
    capability: integrityCapabilityRef,
    input: new Uint8Array([7, 8, 9]),
  }),
  {
    capability: integrityCapabilityRef,
    async invoke(invocation) {
      return { status: 'succeeded' as const, output: { byteLength: invocation.input.byteLength } };
    },
  },
);
if (bytesResult.status !== 'succeeded' || bytesResult.output.byteLength !== 3) {
  throw new Error('raw byte input did not survive the common invocation layer');
}
if (bytesResult.subject !== undefined) throw new Error('a subject was invented for a subject-less invocation');
if (!isValidSovereigntyCapabilityInvocationEvidence(bytesResult.evidence)) {
  throw new Error('evidence must exist even with no sink configured');
}

console.log(
  `typescript-esm consumer OK: token=${token.tokenId} claimType=${ClaimType.Identity} registry=${registry.constructor.name} sovereigntyCapabilities=${sovereigntyCapabilities.length} nonByteSubject=${sovereignAssetId} capabilityInvocation=${identityResult.invocationId}`,
);
