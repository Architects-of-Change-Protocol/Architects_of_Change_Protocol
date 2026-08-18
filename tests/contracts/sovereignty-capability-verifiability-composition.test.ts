import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalStanding } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignAssetId, SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  DerivationRelationKind,
  generateSovereignKeyPair,
  signClaim,
  signSovereignManifest,
} from '@aoc/protocol/manifest';
import type {
  DerivationClaim,
  SignedClaim,
  SignedSovereignManifest,
  SovereignManifestV1,
  VerifiableSovereignClaim,
} from '@aoc/protocol/manifest';
import { portableClaimOf, portableManifestOf } from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import type { SovereigntyInteroperabilityDescriptorV1 } from '@aoc/protocol/interoperability';
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createInteroperabilitySovereigntyCapabilityImplementation,
  createPortabilitySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  createVerifiabilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  IdentitySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityInput,
  InteroperabilitySovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityInput,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  VerifiabilitySovereigntyCapabilityInput,
  VerifiabilitySovereigntyCapabilityOutput,
} from '@aoc/protocol/sovereignty-capabilities';

/**
 * SM-08 composition proofs.
 *
 * The six production minerals are composed by the *caller*, through public
 * package APIs, with one shared correlation id and six distinct invocations.
 * No capsule calls another; the signing between them uses the pre-existing
 * low-level primitives with TEST ONLY key material, exactly as a real issuer
 * with its own key management would.
 */

const REF = (key: Parameters<typeof getSovereigntyCapabilityRefByKey>[0]): SovereigntyCapabilityRef =>
  getSovereigntyCapabilityRefByKey(key) as SovereigntyCapabilityRef;

const IDENTITY_REF = REF('identity');
const INTEGRITY_REF = REF('integrity');
const PROVENANCE_REF = REF('provenance');
const PORTABILITY_REF = REF('portability');
const INTEROPERABILITY_REF = REF('interoperability');
const VERIFIABILITY_REF = REF('verifiability');

const CORRELATION_ID = 'sm08-independent-verification-001';
const ISSUER = 'principal:sm08-issuer';
const AT = '2026-04-01T09:00:00.000Z';
const SIGNED_AT = new Date(AT);
const BYTES = new TextEncoder().encode('hello sovereign world');

/** TEST ONLY signing material — never production key management. */
const KEY_PAIR = generateSovereignKeyPair();

const verifiability = createVerifiabilitySovereigntyCapabilityImplementation();

const invoke = async <TInput, TOutput>(
  capability: SovereigntyCapabilityRef,
  input: TInput,
  implementation: SovereigntyCapabilityImplementation<TInput, TOutput>,
  options: { subject?: SovereignSubjectRef } = {},
): Promise<SovereigntyCapabilityResult<TOutput>> =>
  invokeSovereigntyCapability(
    buildSovereigntyCapabilityInvocation({
      capability,
      correlationId: CORRELATION_ID,
      input,
      ...(options.subject === undefined ? {} : { subject: options.subject }),
    }),
    implementation,
  );

const succeeded = <TOutput>(result: SovereigntyCapabilityResult<TOutput>): TOutput => {
  if (result.status !== 'succeeded') throw new Error(`expected success: ${result.reasonCodes.join(', ')}`);
  return result.output;
};

interface SixMineralFlow {
  readonly results: readonly SovereigntyCapabilityResult<unknown>[];
  readonly subject: SovereignSubjectRef;
  readonly manifest: SovereignManifestV1;
  readonly signedManifest: SignedSovereignManifest;
  readonly derivation: DerivationClaim;
  readonly signedClaim: SignedClaim<VerifiableSovereignClaim>;
  readonly importedBundle: SovereigntyPortabilityBundleV1;
  readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
  readonly manifestVerification: SovereigntyCapabilityResult<VerifiabilitySovereigntyCapabilityOutput>;
  readonly claimVerification: SovereigntyCapabilityResult<VerifiabilitySovereigntyCapabilityOutput>;
}

/**
 * The canonical SM-08 demonstration, run once and asserted from many angles:
 *
 *   bytes → AOC.INTEGRITY → ContentIdentity H
 *   H + registrant + externalReference → AOC.IDENTITY → Subject X + Manifest M
 *   X → AOC.PROVENANCE → DerivationClaim C
 *   TEST issuer signs M and C with the existing low-level primitives
 *   signed M/C → AOC.PORTABILITY → canonical JSON → AOC.PORTABILITY → bundle
 *   bundle → AOC.INTEROPERABILITY → descriptor naming signed-manifest/signed-claim
 *   imported signed M/C → AOC.VERIFIABILITY → cryptographic verification
 */
async function runSixMineralFlow(): Promise<SixMineralFlow> {
  const results: SovereigntyCapabilityResult<unknown>[] = [];

  // 1 — AOC.INTEGRITY over loose bytes, deliberately subjectless.
  const integrityResult = await invoke<IntegritySovereigntyCapabilityInput, never>(
    INTEGRITY_REF,
    { operation: 'compute-content-identity', bytes: BYTES },
    createIntegritySovereigntyCapabilityImplementation() as never,
  );
  results.push(integrityResult);
  const integrityOutput = succeeded(integrityResult) as { operation: string; contentIdentity: never };
  if (integrityOutput.operation !== 'compute-content-identity') throw new Error('wrong operation');

  // 2 — AOC.IDENTITY mints the subject and the unsigned manifest.
  const identityResult = await invoke<IdentitySovereigntyCapabilityInput, never>(
    IDENTITY_REF,
    {
      registrant: ISSUER,
      externalReference: buildSovereignExternalReference({
        namespace: 'alien-system-v47',
        id: 'alien-resource-92817',
        locator: 'future://provider-p1/object/92817',
      }),
      contentIdentity: integrityOutput.contentIdentity,
    },
    createIdentitySovereigntyCapabilityImplementation() as never,
  );
  results.push(identityResult);
  const identityOutput = succeeded(identityResult) as unknown as {
    subject: SovereignSubjectRef;
    manifest: SovereignManifestV1;
  };
  const { subject, manifest } = identityOutput;

  // 3 — AOC.PROVENANCE asserts a derivation over the existing subject.
  const provenanceResult = await invoke<ProvenanceSovereigntyCapabilityInput, never>(
    PROVENANCE_REF,
    {
      operation: 'record-derivation',
      claimId: 'claim:sm08-derivation',
      issuer: ISSUER,
      issuedAt: AT,
      sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
      relation: DerivationRelationKind.TransformedFrom,
      statement: 'asserted, never established',
    },
    createProvenanceSovereigntyCapabilityImplementation() as never,
    { subject },
  );
  results.push(provenanceResult);
  const derivation = (succeeded(provenanceResult) as unknown as { claim: DerivationClaim }).claim;

  // 4 — the TEST issuer signs, using the pre-existing low-level primitives.
  // Not a mineral: proof *issuance* is not an AOC.VERIFIABILITY operation.
  const signedManifest = signSovereignManifest(manifest, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, SIGNED_AT);
  const signedClaim = signClaim(derivation, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, SIGNED_AT);

  // 5 — AOC.PORTABILITY exports the signed artifacts.
  const exportResult = await invoke<PortabilitySovereigntyCapabilityInput, never>(
    PORTABILITY_REF,
    {
      operation: 'export-bundle',
      manifests: [{ kind: 'signed-manifest', signedManifest }],
      claims: [{ kind: 'signed-claim', signedClaim }],
    },
    createPortabilitySovereigntyCapabilityImplementation() as never,
    { subject },
  );
  results.push(exportResult);
  const exported = succeeded(exportResult) as unknown as { serializedBundle: string };

  // 6 — a second runtime holding only the JSON string imports it.
  const importResult = await invoke<PortabilitySovereigntyCapabilityInput, never>(
    PORTABILITY_REF,
    { operation: 'import-bundle', serializedBundle: exported.serializedBundle },
    createPortabilitySovereigntyCapabilityImplementation() as never,
  );
  results.push(importResult);
  const importedBundle = (succeeded(importResult) as unknown as { bundle: SovereigntyPortabilityBundleV1 }).bundle;

  // 7 — AOC.INTEROPERABILITY describes what arrived.
  const describeResult = await invoke<InteroperabilitySovereigntyCapabilityInput, never>(
    INTEROPERABILITY_REF,
    { operation: 'describe-bundle', bundle: importedBundle },
    createInteroperabilitySovereigntyCapabilityImplementation() as never,
  );
  results.push(describeResult);
  const descriptor = (succeeded(describeResult) as unknown as { descriptor: SovereigntyInteroperabilityDescriptorV1 })
    .descriptor;

  // 8 — AOC.VERIFIABILITY independently checks the imported signed artifacts.
  const importedManifestArtifact = importedBundle.manifests[0];
  if (importedManifestArtifact?.kind !== 'signed-manifest') throw new Error('signed manifest did not survive transport');
  const importedClaimArtifact = importedBundle.claims[0];
  if (importedClaimArtifact?.kind !== 'signed-claim') throw new Error('signed claim did not survive transport');

  const manifestVerification = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
    VERIFIABILITY_REF,
    { operation: 'verify-signed-manifest', signedManifest: importedManifestArtifact.signedManifest },
    verifiability,
  );
  results.push(manifestVerification);

  const claimVerification = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
    VERIFIABILITY_REF,
    { operation: 'verify-signed-claim', signedClaim: importedClaimArtifact.signedClaim },
    verifiability,
  );
  results.push(claimVerification);

  return {
    results,
    subject,
    manifest,
    signedManifest,
    derivation,
    signedClaim,
    importedBundle,
    descriptor,
    manifestVerification,
    claimVerification,
  };
}

const outputOf = (
  result: SovereigntyCapabilityResult<VerifiabilitySovereigntyCapabilityOutput>,
): VerifiabilitySovereigntyCapabilityOutput => {
  if (result.status !== 'succeeded') throw new Error(`expected success: ${result.reasonCodes.join(', ')}`);
  return result.output;
};

const verificationOf = (
  result: SovereigntyCapabilityResult<VerifiabilitySovereigntyCapabilityOutput>,
): VerifiabilitySovereigntyCapabilityOutput['verification'] => outputOf(result).verification;

describe('SM-08 / six-mineral composition (COMPOSITION TESTS 1-8)', () => {
  it('COMPOSITION TEST 1 — Integrity → Identity → signed manifest → Verifiability', async () => {
    const flow = await runSixMineralFlow();
    const verification = verificationOf(flow.manifestVerification);
    expect(verification.valid).toBe(true);
    const manifestOutput = outputOf(flow.manifestVerification);
    if (manifestOutput.operation !== 'verify-signed-manifest') throw new Error('wrong operation');
    expect(manifestOutput.verification.checks).toEqual({
      manifestStructure: 'valid',
      manifestDigest: 'valid',
      signature: 'valid',
      // The Integrity boundary, visible in the report.
      contentDigest: 'not_performed',
      issuerBinding: 'not_performed',
    });
    // The manifest genuinely carries the Integrity digest, unchanged.
    expect(flow.manifest.contentIdentity).toBeDefined();
  });

  it('COMPOSITION TEST 2 — Provenance → signed claim → Verifiability', async () => {
    const flow = await runSixMineralFlow();
    const verification = verificationOf(flow.claimVerification);
    expect(verification.valid).toBe(true);
    const claimOutput = outputOf(flow.claimVerification);
    if (claimOutput.operation !== 'verify-signed-claim') throw new Error('wrong operation');
    expect(claimOutput.verification.checks).toEqual({
      claimStructure: 'valid',
      claimDigest: 'valid',
      signature: 'valid',
      issuerBinding: 'not_performed',
    });
    expect(flow.derivation.type).toBe('Derivation');
  });

  it('COMPOSITION TEST 3 — signed artifacts survive Portability and verify identically after import', async () => {
    const flow = await runSixMineralFlow();
    const importedManifest = flow.importedBundle.manifests[0];
    const importedClaim = flow.importedBundle.claims[0];
    if (importedManifest?.kind !== 'signed-manifest' || importedClaim?.kind !== 'signed-claim') {
      throw new Error('signed artifacts did not survive transport');
    }
    // Byte-for-byte identical proof material: nothing re-signed, re-digested or repaired.
    expect(canonicalizeJSON(importedManifest.signedManifest)).toBe(canonicalizeJSON(flow.signedManifest));
    expect(canonicalizeJSON(importedClaim.signedClaim)).toBe(canonicalizeJSON(flow.signedClaim));
    expect(importedManifest.signedManifest.proof).toEqual(flow.signedManifest.proof);
    expect(importedClaim.signedClaim.proof).toEqual(flow.signedClaim.proof);

    // …and the pre-transport originals verify to exactly the same report.
    const before = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-manifest', signedManifest: flow.signedManifest },
      verifiability,
    );
    expect(canonicalizeJSON(verificationOf(before))).toBe(canonicalizeJSON(verificationOf(flow.manifestVerification)));

    const claimBefore = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim: flow.signedClaim },
      verifiability,
    );
    expect(canonicalizeJSON(verificationOf(claimBefore))).toBe(canonicalizeJSON(verificationOf(flow.claimVerification)));
  });

  it('COMPOSITION TEST 4 — Interoperability detects the signed artifacts; Verifiability checks them', async () => {
    const flow = await runSixMineralFlow();
    expect([...flow.descriptor.present.manifestArtifactKinds]).toContain('signed-manifest');
    expect([...flow.descriptor.present.claimArtifactKinds]).toContain('signed-claim');

    // The descriptor describes; it never reports a signature verdict.
    const serializedDescriptor = JSON.stringify(flow.descriptor);
    for (const term of [
      'verified', 'signatureValid', 'valid:true', 'issuerBinding', 'manifestDigest', 'proof', 'signature',
    ]) {
      expect(serializedDescriptor).not.toContain(term);
    }
    // Verifiability is where the cryptographic verdict comes from.
    expect(verificationOf(flow.manifestVerification).valid).toBe(true);
    expect(verificationOf(flow.claimVerification).valid).toBe(true);
  });

  it('COMPOSITION TEST 5 — one correlationId is shared across all six production minerals', async () => {
    const flow = await runSixMineralFlow();
    for (const result of flow.results) {
      expect(result.correlationId).toBe(CORRELATION_ID);
      expect(result.evidence.correlationId).toBe(CORRELATION_ID);
    }
  });

  it('COMPOSITION TEST 6 — every invocation id is distinct', async () => {
    const flow = await runSixMineralFlow();
    const ids = new Set(flow.results.map((result) => result.invocationId));
    expect(ids.size).toBe(flow.results.length);
    expect(flow.results).toHaveLength(8);
  });

  it('COMPOSITION TEST 7 — the evidence attributes six different canonical capability ids', async () => {
    const flow = await runSixMineralFlow();
    const attributed = new Set(flow.results.map((result) => result.evidence.capability.id));
    expect([...attributed].sort()).toEqual([
      'aoc:sovereignty-capability:identity',
      'aoc:sovereignty-capability:integrity',
      'aoc:sovereignty-capability:interoperability',
      'aoc:sovereignty-capability:portability',
      'aoc:sovereignty-capability:provenance',
      'aoc:sovereignty-capability:verifiability',
    ]);
    for (const result of flow.results) {
      expect(result.evidence.capability.version).toBe('1.0.0');
      expect(result.evidence.outcome).toBe('succeeded');
    }
  });

  it('COMPOSITION TEST 8 — no hidden capability invocation happened: exactly eight invocations produced eight evidence records', async () => {
    const flow = await runSixMineralFlow();
    const verifiabilityInvocations = flow.results.filter(
      (result) => result.evidence.capability.id === 'aoc:sovereignty-capability:verifiability',
    );
    // Two Verifiability invocations, because the caller asked twice.
    expect(verifiabilityInvocations).toHaveLength(2);
    for (const result of flow.results) {
      expect(result.evidence.invocationId).toBe(result.invocationId);
    }
  });

  it('the imported signed manifest still names the subject Identity minted, with no remint', async () => {
    const flow = await runSixMineralFlow();
    expect(flow.manifestVerification.subject).toEqual(flow.subject);
    expect(portableManifestOf(flow.importedBundle.manifests[0]).sovereignAssetId).toBe(flow.subject.sovereignAssetId);
    expect(portableClaimOf(flow.importedBundle.claims[0]).subject).toBe(flow.subject.sovereignAssetId);
    expect(flow.claimVerification.subject).toEqual({ sovereignAssetId: flow.subject.sovereignAssetId });
  });
});

describe('SM-08 / a cryptographically valid claim can simultaneously be Contested', () => {
  it('signature verification and claim standing are independent facts that coexist', async () => {
    const flow = await runSixMineralFlow();

    // Before contesting: the signature verifies.
    expect(verificationOf(flow.claimVerification).valid).toBe(true);

    // AOC.PROVENANCE records a challenge against the very same claim.
    const contestResult = await invoke<ProvenanceSovereigntyCapabilityInput, never>(
      PROVENANCE_REF,
      {
        operation: 'contest-provenance-claim',
        standingId: 'standing:sm08-contest',
        claim: flow.derivation,
        reason: 'the asserted source is disputed by another party',
        effectiveAt: AT,
      },
      createProvenanceSovereigntyCapabilityImplementation() as never,
      { subject: flow.subject },
    );
    const contested = succeeded(contestResult) as unknown as { standing: CanonicalStanding };
    expect(contested.standing.status).toBe(StandingStatus.Contested);

    // After contesting: the signature still verifies, byte for byte the same
    // report. Verifiability never saw the standing and never changed it.
    const after = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim: flow.signedClaim },
      verifiability,
    );
    expect(verificationOf(after).valid).toBe(true);
    expect(canonicalizeJSON(verificationOf(after))).toBe(canonicalizeJSON(verificationOf(flow.claimVerification)));

    // Both facts are true at once, and neither adjudicates the other.
    expect({
      signatureVerifies: verificationOf(after).valid,
      standing: contested.standing.status,
    }).toEqual({ signatureVerifies: true, standing: StandingStatus.Contested });

    // The claim itself was never rewritten by either capability.
    expect(canonicalizeJSON(flow.signedClaim.claim)).toBe(canonicalizeJSON(flow.derivation));
    // No standing leaked into the verification result.
    expect(JSON.stringify(outputOf(after))).not.toContain('Contested');
  });

  it('a signature over a factually dubious assertion still verifies, and states nothing about truth', async () => {
    const id = parseSovereignAssetId(mintSovereignAssetId());
    const claimResult = await invoke<ProvenanceSovereigntyCapabilityInput, never>(
      PROVENANCE_REF,
      {
        operation: 'declare-origin',
        claimId: 'claim:sm08-dubious-origin',
        issuer: 'principal:someone-with-no-connection-to-this-asset',
        issuedAt: AT,
        assertedOrigin: 'created by me personally in 1602, honestly',
      },
      createProvenanceSovereigntyCapabilityImplementation() as never,
      { subject: { sovereignAssetId: id } },
    );
    const claim = (succeeded(claimResult) as unknown as { claim: VerifiableSovereignClaim }).claim;
    const signedClaim = signClaim(claim, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, SIGNED_AT);

    const result = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim },
      verifiability,
    );
    // Cryptographically impeccable, historically worthless. Both are reported
    // honestly because only the first is something Protocol can determine.
    expect(verificationOf(result).valid).toBe(true);
    // The report says the *signature* is valid and stops there. It carries no
    // field claiming the assertion itself is true, authorized or owned.
    const keys = new Set<string>();
    JSON.parse(JSON.stringify(outputOf(result)), function collect(this: unknown, key: string, value: unknown) {
      if (key !== '') keys.add(key);
      return value;
    });
    expect([...keys].sort()).toEqual([
      'checks', 'claimDigest', 'claimStructure', 'issuerBinding', 'operation', 'reasons', 'signature',
      'valid', 'verification',
    ]);
    const serialized = JSON.stringify(outputOf(result));
    for (const term of ['historicallyTrue', 'truth', 'authorized', 'legalOwner', 'ownership', 'trustScore']) {
      expect(serialized).not.toContain(term);
    }
  });
});

describe('SM-08 / open-world subjects verify identically (OPEN-WORLD TESTS)', () => {
  const namespaces = [
    { namespace: 'alien-system-v47', id: 'alien-resource-92817', locator: 'future://provider-p1/object/92817' },
    { namespace: 'example:property-registry', id: 'parcel-88-201-B', locator: 'registry://county/parcel/88-201-B' },
    { namespace: 'example:external-token-system', id: 'token-4471', locator: 'ledger://chain-x/token/4471' },
    { namespace: 'example:agent-namespace', id: 'agent-orchestrator-12', locator: 'agent://fleet/orchestrator/12' },
    { namespace: 'example:api-resource', id: '/v2/reports/9f3', locator: 'https://api.example/v2/reports/9f3' },
  ] as const;

  it('every namespace produces the same checks and the same overall verdict', async () => {
    const reports: string[] = [];
    for (const reference of namespaces) {
      const identityResult = await invoke<IdentitySovereigntyCapabilityInput, never>(
        IDENTITY_REF,
        { registrant: ISSUER, externalReference: buildSovereignExternalReference(reference) },
        createIdentitySovereigntyCapabilityImplementation() as never,
      );
      const { manifest, subject } = succeeded(identityResult) as unknown as {
        manifest: SovereignManifestV1;
        subject: SovereignSubjectRef;
      };
      const signedManifest = signSovereignManifest(manifest, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, SIGNED_AT);
      const result = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
        VERIFIABILITY_REF,
        { operation: 'verify-signed-manifest', signedManifest },
        verifiability,
      );
      const verification = verificationOf(result);
      expect(verification.valid).toBe(true);
      expect(result.subject).toEqual(subject);
      reports.push(canonicalizeJSON(verification));
    }
    // Identical reports across every namespace: no domain branch exists.
    expect(new Set(reports).size).toBe(1);
  });

  it('tampering is detected identically regardless of namespace', async () => {
    for (const reference of namespaces) {
      const identityResult = await invoke<IdentitySovereigntyCapabilityInput, never>(
        IDENTITY_REF,
        { registrant: ISSUER, externalReference: buildSovereignExternalReference(reference) },
        createIdentitySovereigntyCapabilityImplementation() as never,
      );
      const { manifest } = succeeded(identityResult) as unknown as { manifest: SovereignManifestV1 };
      const signedManifest = signSovereignManifest(manifest, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, SIGNED_AT);
      const result = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
        VERIFIABILITY_REF,
        { operation: 'verify-signed-manifest', signedManifest: { ...signedManifest, manifestDigest: '0'.repeat(64) } },
        verifiability,
      );
      expect(result.status).toBe('succeeded');
      expect(verificationOf(result).valid).toBe(false);
    }
  });
});

describe('SM-08 / Verifiability requires no other mineral at runtime', () => {
  it('a locally held signed claim verifies with no Identity, Portability or Interoperability invocation', async () => {
    const id: SovereignAssetId = parseSovereignAssetId(mintSovereignAssetId());
    const claimResult = await invoke<ProvenanceSovereigntyCapabilityInput, never>(
      PROVENANCE_REF,
      {
        operation: 'declare-authorship',
        claimId: 'claim:sm08-standalone',
        issuer: ISSUER,
        issuedAt: AT,
        statement: 'asserted authorship, not legal ownership',
      },
      createProvenanceSovereigntyCapabilityImplementation() as never,
      { subject: { sovereignAssetId: id } },
    );
    const claim = (succeeded(claimResult) as unknown as { claim: VerifiableSovereignClaim }).claim;
    const signedClaim = signClaim(claim, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, SIGNED_AT);

    const result = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim },
      verifiability,
    );
    expect(verificationOf(result).valid).toBe(true);
    expect(result.subject).toEqual({ sovereignAssetId: id });
  });
});
