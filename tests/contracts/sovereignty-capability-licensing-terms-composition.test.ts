import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  AuthorityClaimKind,
  DerivationRelationKind,
  buildAuthorityClaim,
  generateSovereignKeyPair,
  signClaim,
} from '@aoc/protocol/manifest';
import type {
  AuthorityClaim,
  DerivationClaim,
  SignedClaim,
  SovereignManifestV1,
  VerifiableSovereignClaim,
} from '@aoc/protocol/manifest';
import {
  INTEROPERABLE_CLAIM_TYPES,
  INTEROPERABLE_STANDING_STATUSES,
  SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS,
  buildSovereigntyInteroperabilityConsumerSupportV1,
} from '@aoc/protocol/interoperability';
import type {
  InteroperabilitySemanticRequirement,
  SovereigntyInteroperabilityConsumerSupportV1,
  SovereigntyInteroperabilityDescriptorV1,
} from '@aoc/protocol/interoperability';
import {
  AOC_LICENSING_ACTION_TERM_IDS,
  AOC_LICENSING_DECLARATION_TERM_IDS,
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
  SovereignLicenseTermsRuleEffect,
  isValidLicenseTermsClaim,
  validateLicenseTermsClaim,
} from '@aoc/protocol/licensing';
import type { LicenseTermsClaim, SovereignLicenseTermsRuleV1 } from '@aoc/protocol/licensing';
import { portableClaimOf } from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import {
  buildSovereigntyCapabilityInvocation,
  createIdentitySovereigntyCapabilityImplementation,
  createIntegritySovereigntyCapabilityImplementation,
  createInteroperabilitySovereigntyCapabilityImplementation,
  createLicensingTermsSovereigntyCapabilityImplementation,
  createPortabilitySovereigntyCapabilityImplementation,
  createProvenanceSovereigntyCapabilityImplementation,
  createVerifiabilitySovereigntyCapabilityImplementation,
  getSovereigntyCapabilityRefByKey,
  invokeSovereigntyCapability,
  isValidSovereigntyCapabilityInvocationEvidence,
} from '@aoc/protocol/sovereignty-capabilities';
import type {
  IdentitySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityInput,
  InteroperabilitySovereigntyCapabilityInput,
  LicensingTermsSovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityInput,
  ProvenanceSovereigntyCapabilityInput,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  VerifiabilitySovereigntyCapabilityInput,
  VerifiabilitySovereigntyCapabilityOutput,
} from '@aoc/protocol/sovereignty-capabilities';

/**
 * SM-09 composition proofs.
 *
 * The seven production minerals are composed by the *caller*, through public
 * package APIs, with one shared correlation id and one invocation each. No
 * capsule calls another; the signing between them uses the pre-existing
 * low-level primitives with TEST ONLY key material, exactly as a real issuer
 * with its own key management would.
 */

const REF = (key: Parameters<typeof getSovereigntyCapabilityRefByKey>[0]): SovereigntyCapabilityRef =>
  getSovereigntyCapabilityRefByKey(key) as SovereigntyCapabilityRef;

const IDENTITY_REF = REF('identity');
const INTEGRITY_REF = REF('integrity');
const PROVENANCE_REF = REF('provenance');
const LICENSING_REF = REF('licensing_terms');
const PORTABILITY_REF = REF('portability');
const INTEROPERABILITY_REF = REF('interoperability');
const VERIFIABILITY_REF = REF('verifiability');

const CORRELATION_ID = 'sm09-portable-terms-declaration-001';
const ISSUER = 'principal:sm09-issuer';
const AT = '2026-08-18T09:00:00.000Z';
const SIGNED_AT = new Date(AT);
const BYTES = new TextEncoder().encode('a sovereign work with declared terms');

const ACTIONS = AOC_LICENSING_ACTION_TERM_IDS;
const DECLARATION = AOC_LICENSING_DECLARATION_TERM_IDS;
const EXTERNAL_ACTION = { namespace: 'example.domain', termRef: 'example.domain:special-use' } as const;

/** TEST ONLY signing material — never production key management. */
const KEY_PAIR = generateSovereignKeyPair();

const rule = (
  id: string,
  effect: SovereignLicenseTermsRuleEffect,
  action: { namespace: string; termRef: string },
  statement: string,
): SovereignLicenseTermsRuleV1 => ({ id, effect, action, statement });

const aoc = (termRef: string) => ({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef });

/**
 * The fixture terms. Fixture data only: this is one issuer's declaration in one
 * test, and it makes no claim to legal universality.
 */
const RULES: readonly SovereignLicenseTermsRuleV1[] = [
  rule('R1', SovereignLicenseTermsRuleEffect.Permission, aoc(ACTIONS.use), 'Use is permitted.'),
  rule('R2', SovereignLicenseTermsRuleEffect.Permission, aoc(ACTIONS.reproduce), 'Reproduction is permitted.'),
  rule('R3', SovereignLicenseTermsRuleEffect.Restriction, aoc(ACTIONS.commercialUse), 'Commercial use is restricted.'),
  rule('R4', SovereignLicenseTermsRuleEffect.Obligation, aoc(ACTIONS.attribute), 'Attribution must be retained.'),
  rule('R5', SovereignLicenseTermsRuleEffect.Permission, EXTERNAL_ACTION, 'Special use permitted per Agreement A-17.'),
];

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

interface SevenMineralFlow {
  readonly results: readonly SovereigntyCapabilityResult<unknown>[];
  readonly subject: SovereignSubjectRef;
  readonly manifest: SovereignManifestV1;
  readonly derivation: DerivationClaim;
  readonly licenseClaim: LicenseTermsClaim;
  readonly signedLicenseClaim: SignedClaim<VerifiableSovereignClaim>;
  readonly serializedBundle: string;
  readonly importedBundle: SovereigntyPortabilityBundleV1;
  readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
  readonly claimVerification: SovereigntyCapabilityResult<VerifiabilitySovereigntyCapabilityOutput>;
}

/**
 * The canonical SM-09 demonstration, run once and asserted from many angles:
 *
 *   bytes → AOC.INTEGRITY → ContentIdentity H
 *   H + registrant + externalReference → AOC.IDENTITY → Subject X + Manifest M
 *   X → AOC.PROVENANCE → DerivationClaim D
 *   X → AOC.LICENSING_TERMS → LicenseTermsClaim L
 *   TEST issuer signs L with the existing low-level primitives
 *   signed L → AOC.PORTABILITY → canonical JSON → AOC.PORTABILITY → bundle
 *   bundle → AOC.INTEROPERABILITY → descriptor carrying licensing semantics
 *   imported signed L → AOC.VERIFIABILITY → cryptographic verification
 */
async function runSevenMineralFlow(): Promise<SevenMineralFlow> {
  const results: SovereigntyCapabilityResult<unknown>[] = [];

  // 1 — AOC.INTEGRITY over loose bytes, deliberately subjectless.
  const integrityResult = await invoke<IntegritySovereigntyCapabilityInput, never>(
    INTEGRITY_REF,
    { operation: 'compute-content-identity', bytes: BYTES },
    createIntegritySovereigntyCapabilityImplementation() as never,
  );
  results.push(integrityResult);
  const integrityOutput = succeeded(integrityResult) as { operation: string; contentIdentity: never };

  // 2 — AOC.IDENTITY mints the subject and the unsigned manifest.
  const identityResult = await invoke<IdentitySovereigntyCapabilityInput, never>(
    IDENTITY_REF,
    {
      registrant: 'principal:sm09-registrant',
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
  const { subject, manifest } = succeeded(identityResult) as unknown as {
    subject: SovereignSubjectRef;
    manifest: SovereignManifestV1;
  };

  // 3 — AOC.PROVENANCE asserts a derivation over the existing subject.
  const provenanceResult = await invoke<ProvenanceSovereigntyCapabilityInput, never>(
    PROVENANCE_REF,
    {
      operation: 'record-derivation',
      claimId: 'claim:sm09-derivation',
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

  // 4 — AOC.LICENSING_TERMS declares the structured terms. The registrant that
  // recorded the subject and the issuer declaring terms over it are different
  // principals, and nothing infers one from the other.
  const licensingResult = await invoke<LicensingTermsSovereigntyCapabilityInput, never>(
    LICENSING_REF,
    {
      operation: 'declare-license-terms',
      claimId: 'claim:sm09-license',
      issuer: ISSUER,
      statement: 'Terms declared by the issuer over this subject.',
      audience: { kind: 'Public' },
      rules: RULES,
      issuedAt: AT,
      effectiveAt: '2026-09-01T00:00:00.000Z',
      expiresAt: '2027-09-01T00:00:00.000Z',
      evidenceRefs: ['evidence:contract:A-17'],
    },
    createLicensingTermsSovereigntyCapabilityImplementation() as never,
    { subject },
  );
  results.push(licensingResult);
  const licenseClaim = (succeeded(licensingResult) as unknown as { claim: LicenseTermsClaim }).claim;

  // 5 — the TEST issuer signs, using the pre-existing low-level primitives.
  // Not a mineral: proof *issuance* belongs to neither Licensing nor
  // Verifiability.
  const signedLicenseClaim = signClaim(
    licenseClaim as unknown as VerifiableSovereignClaim,
    KEY_PAIR.privateKeyPem,
    KEY_PAIR.signingKey,
    SIGNED_AT,
  );

  // 6 — AOC.PORTABILITY exports the signed licensing claim beside the
  // provenance claim, through the unchanged six-field bundle.
  const exportResult = await invoke<PortabilitySovereigntyCapabilityInput, never>(
    PORTABILITY_REF,
    {
      operation: 'export-bundle',
      manifests: [{ kind: 'manifest', manifest }],
      claims: [
        { kind: 'claim', claim: derivation },
        { kind: 'signed-claim', signedClaim: signedLicenseClaim },
      ],
    },
    createPortabilitySovereigntyCapabilityImplementation() as never,
    { subject },
  );
  results.push(exportResult);
  const { serializedBundle } = succeeded(exportResult) as unknown as { serializedBundle: string };

  // 7 — a second runtime holding only the JSON string imports it.
  const importResult = await invoke<PortabilitySovereigntyCapabilityInput, never>(
    PORTABILITY_REF,
    { operation: 'import-bundle', serializedBundle },
    createPortabilitySovereigntyCapabilityImplementation() as never,
  );
  results.push(importResult);
  const importedBundle = (succeeded(importResult) as unknown as { bundle: SovereigntyPortabilityBundleV1 }).bundle;

  // 8 — AOC.INTEROPERABILITY describes what arrived, discovering the licensing
  // semantics generically through ordinary claim semanticRefs.
  const describeResult = await invoke<InteroperabilitySovereigntyCapabilityInput, never>(
    INTEROPERABILITY_REF,
    { operation: 'describe-bundle', bundle: importedBundle },
    createInteroperabilitySovereigntyCapabilityImplementation() as never,
  );
  results.push(describeResult);
  const descriptor = (succeeded(describeResult) as unknown as { descriptor: SovereigntyInteroperabilityDescriptorV1 })
    .descriptor;

  // 9 — AOC.VERIFIABILITY independently checks the imported signed terms.
  const importedLicense = importedBundle.claims.find((artifact) => artifact.kind === 'signed-claim');
  if (importedLicense === undefined || importedLicense.kind !== 'signed-claim') {
    throw new Error('the signed licensing claim did not survive transport');
  }
  const claimVerification = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
    VERIFIABILITY_REF,
    { operation: 'verify-signed-claim', signedClaim: importedLicense.signedClaim },
    createVerifiabilitySovereigntyCapabilityImplementation(),
  );
  results.push(claimVerification);

  return {
    results,
    subject,
    manifest,
    derivation,
    licenseClaim,
    signedLicenseClaim,
    serializedBundle,
    importedBundle,
    descriptor,
    claimVerification,
  };
}

const consumerSupport = (
  descriptor: SovereigntyInteroperabilityDescriptorV1,
  overrides: { semanticTerms?: readonly InteroperabilitySemanticRequirement[] } = {},
): SovereigntyInteroperabilityConsumerSupportV1 =>
  buildSovereigntyInteroperabilityConsumerSupportV1({
    profile: { id: descriptor.profile.id, acceptedVersions: [descriptor.profile.version] },
    mediaTypes: [descriptor.mediaType],
    representationSchemaVersions: [descriptor.representation.schemaVersion],
    canonicalizationProfiles: [descriptor.representation.canonicalizationProfile],
    artifactKinds: [...SOVEREIGNTY_INTEROPERABILITY_ARTIFACT_KINDS],
    claimTypes: [...INTEROPERABLE_CLAIM_TYPES],
    standingStatuses: [...INTEROPERABLE_STANDING_STATUSES],
    semanticTerms: overrides.semanticTerms ?? [...descriptor.present.semanticRequirements],
  });

const importedLicenseClaim = (bundle: SovereigntyPortabilityBundleV1): LicenseTermsClaim => {
  const artifact = bundle.claims.find((entry) => entry.kind === 'signed-claim');
  if (artifact === undefined) throw new Error('no signed claim in the bundle');
  return portableClaimOf(artifact) as unknown as LicenseTermsClaim;
};

describe('SM-09 / seven-mineral composition', () => {
  it('all seven production minerals compose over one subject under one correlation id', async () => {
    const flow = await runSevenMineralFlow();
    const attributed = new Set(flow.results.map((result) => result.evidence.capability.id));
    expect([...attributed].sort()).toEqual([
      'aoc:sovereignty-capability:identity',
      'aoc:sovereignty-capability:integrity',
      'aoc:sovereignty-capability:interoperability',
      'aoc:sovereignty-capability:licensing-terms',
      'aoc:sovereignty-capability:portability',
      'aoc:sovereignty-capability:provenance',
      'aoc:sovereignty-capability:verifiability',
    ]);
    for (const result of flow.results) {
      expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
      expect(result.evidence.correlationId).toBe(CORRELATION_ID);
    }
    const invocationIds = new Set(flow.results.map((result) => result.invocationId));
    expect(invocationIds.size).toBe(flow.results.length);
  });

  it('Licensing declares over the Identity subject without minting or requiring bytes', async () => {
    const flow = await runSevenMineralFlow();
    expect(flow.licenseClaim.subject).toBe(flow.subject.sovereignAssetId);
    // The declaration reached no byte representation at all.
    expect(canonicalizeJSON(flow.licenseClaim)).not.toContain('contentIdentity');
    expect(canonicalizeJSON(flow.licenseClaim)).not.toContain('manifestDigest');
  });

  it('the registrant and the licensing issuer are different principals, and neither is inferred', async () => {
    const flow = await runSevenMineralFlow();
    expect(flow.manifest.registrant).toBe('principal:sm09-registrant');
    expect(flow.licenseClaim.issuer).toBe(ISSUER);
    expect(flow.licenseClaim.issuer).not.toBe(flow.manifest.registrant);
  });
});

describe('SM-09 / Portability composition (REQUIRED TESTS)', () => {
  it('carries the licensing claim with no bundle schema change and exactly six envelope fields', async () => {
    const flow = await runSevenMineralFlow();
    expect(Object.keys(flow.importedBundle).sort()).toEqual([
      'canonicalizationProfile', 'claims', 'manifests', 'schemaVersion', 'standings', 'subject',
    ]);
    expect(Object.keys(flow.importedBundle)).toHaveLength(6);
    for (const forbidden of ['licenses', 'terms', 'permissions', 'restrictions', 'obligations']) {
      expect(Object.prototype.hasOwnProperty.call(flow.importedBundle, forbidden)).toBe(false);
    }
  });

  it('an unsigned licensing claim travels as `claim`, a signed one as `signed-claim`', async () => {
    const flow = await runSevenMineralFlow();
    const kinds = flow.importedBundle.claims.map((artifact) => artifact.kind).sort();
    expect(kinds).toEqual(['claim', 'signed-claim']);
    // No `license` artifact kind was invented: the wrapper says signed/unsigned
    // claim, and the claim's own metadata says License.
    expect(kinds).not.toContain('license');
    expect(importedLicenseClaim(flow.importedBundle).metadata.kind).toBe(AuthorityClaimKind.License);
  });

  it('the round trip is exact — id, subject, issuer, rules, order, audience and every date', async () => {
    const flow = await runSevenMineralFlow();
    const imported = importedLicenseClaim(flow.importedBundle);
    expect(canonicalizeJSON(imported)).toBe(canonicalizeJSON(flow.licenseClaim));
    expect(imported.id).toBe('claim:sm09-license');
    expect(imported.subject).toBe(flow.subject.sovereignAssetId);
    expect(imported.issuer).toBe(ISSUER);
    expect(imported.issuedAt).toBe(AT);
    expect(imported.expiresAt).toBe('2027-09-01T00:00:00.000Z');
    expect(imported.evidenceRefs).toEqual(['evidence:contract:A-17']);
    expect(imported.metadata.terms.audience).toEqual({ kind: 'Public' });
    expect(imported.metadata.terms.effectiveAt).toBe('2026-09-01T00:00:00.000Z');
    expect(imported.metadata.terms.rules.map((entry) => entry.id)).toEqual(['R1', 'R2', 'R3', 'R4', 'R5']);
    expect(imported.semanticRefs).toEqual(flow.licenseClaim.semanticRefs);
  });

  it('the external action concept survives transport untouched', async () => {
    const flow = await runSevenMineralFlow();
    const imported = importedLicenseClaim(flow.importedBundle);
    expect(imported.metadata.terms.rules[4].action).toEqual(EXTERNAL_ACTION);
  });

  it('Portability applies no licensing validation of its own', async () => {
    const flow = await runSevenMineralFlow();
    // The bundle validator admits the claim as an ordinary AuthorityClaim; the
    // licensing rules are SM-09's validator's business, and it agrees.
    expect(isValidLicenseTermsClaim(importedLicenseClaim(flow.importedBundle))).toBe(true);
    expect(flow.serializedBundle).toContain(SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION);
  });
});

describe('SM-09 / Interoperability composition (REQUIRED TESTS)', () => {
  it('the descriptor discovers the licensing semantics without any schema change', async () => {
    const flow = await runSevenMineralFlow();
    expect(flow.descriptor.schemaVersion).toBe('aoc-sovereignty-interoperability-descriptor/1');
    expect(flow.descriptor.profile.version).toBe('1.0.0');
    // The underlying claim type stays the existing AuthorityClaim family.
    expect(flow.descriptor.present.claimTypes).toContain('Authorship');
    expect(flow.descriptor.present.claimTypes).not.toContain('License');

    const requirements = flow.descriptor.present.semanticRequirements;
    expect(requirements).toContainEqual({
      namespace: AOC_LICENSING_SEMANTIC_NAMESPACE,
      termRef: DECLARATION.licenseTermsDeclaration,
    });
    for (const termRef of [DECLARATION.permissionRule, DECLARATION.restrictionRule, DECLARATION.obligationRule]) {
      expect(requirements).toContainEqual({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef });
    }
    for (const termRef of [ACTIONS.use, ACTIONS.reproduce, ACTIONS.commercialUse, ACTIONS.attribute]) {
      expect(requirements).toContainEqual({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef });
    }
    expect(requirements).toContainEqual({ ...EXTERNAL_ACTION });
  });

  it('a consumer that understands every licensing concept is compatible', async () => {
    const flow = await runSevenMineralFlow();
    const report = succeeded(
      await invoke<InteroperabilitySovereigntyCapabilityInput, never>(
        INTEROPERABILITY_REF,
        {
          operation: 'assess-compatibility',
          descriptor: flow.descriptor,
          consumerSupport: consumerSupport(flow.descriptor),
        },
        createInteroperabilitySovereigntyCapabilityImplementation() as never,
      ),
    ) as unknown as { report: { status: string; unsupportedSemanticTerms: readonly unknown[] } };
    expect(report.report.status).toBe('compatible');
    expect(report.report.unsupportedSemanticTerms).toEqual([]);
  });

  it('a consumer missing one licensing action concept is partially compatible, and nothing is dropped', async () => {
    const flow = await runSevenMineralFlow();
    const withoutExternal = flow.descriptor.present.semanticRequirements.filter(
      (requirement) => requirement.termRef !== EXTERNAL_ACTION.termRef,
    );
    const output = succeeded(
      await invoke<InteroperabilitySovereigntyCapabilityInput, never>(
        INTEROPERABILITY_REF,
        {
          operation: 'assess-compatibility',
          descriptor: flow.descriptor,
          consumerSupport: consumerSupport(flow.descriptor, { semanticTerms: withoutExternal }),
        },
        createInteroperabilitySovereigntyCapabilityImplementation() as never,
      ),
    ) as unknown as {
      report: { status: string; unsupportedSemanticTerms: readonly InteroperabilitySemanticRequirement[] };
    };
    expect(output.report.status).toBe('partially-compatible');
    expect(output.report.unsupportedSemanticTerms).toEqual([{ ...EXTERNAL_ACTION }]);
    // Partial compatibility never authorizes data loss: the bundle is unchanged.
    expect(flow.importedBundle.claims).toHaveLength(2);
    expect(canonicalizeJSON(importedLicenseClaim(flow.importedBundle)))
      .toBe(canonicalizeJSON(flow.licenseClaim));
  });

  it('a consumer missing the licence declaration concept itself is partially compatible', async () => {
    const flow = await runSevenMineralFlow();
    const withoutDeclaration = flow.descriptor.present.semanticRequirements.filter(
      (requirement) => requirement.termRef !== DECLARATION.licenseTermsDeclaration,
    );
    const output = succeeded(
      await invoke<InteroperabilitySovereigntyCapabilityInput, never>(
        INTEROPERABILITY_REF,
        {
          operation: 'assess-compatibility',
          descriptor: flow.descriptor,
          consumerSupport: consumerSupport(flow.descriptor, { semanticTerms: withoutDeclaration }),
        },
        createInteroperabilitySovereigntyCapabilityImplementation() as never,
      ),
    ) as unknown as { report: { status: string } };
    expect(output.report.status).toBe('partially-compatible');
  });
});

describe('SM-09 / Verifiability composition (REQUIRED TESTS)', () => {
  it('the existing signClaim signs a licensing claim, and real Verifiability verifies it', async () => {
    const flow = await runSevenMineralFlow();
    const result = flow.claimVerification;
    if (result.status !== 'succeeded') throw new Error('expected success');
    const output = result.output;
    if (output.operation !== 'verify-signed-claim') throw new Error('wrong operation');
    expect(output.verification.valid).toBe(true);
    expect(output.verification.checks).toEqual({
      claimStructure: 'valid',
      claimDigest: 'valid',
      signature: 'valid',
      issuerBinding: 'not_performed',
    });
  });

  it('a valid signature reaches no licensing, ownership or legality conclusion', async () => {
    const flow = await runSevenMineralFlow();
    const serialized = canonicalizeJSON(succeeded(flow.claimVerification)).toLowerCase();
    for (const forbidden of ['permitted', 'allowed', 'owner', 'licence', 'license', 'enforceable', 'rights']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it.each([
    ['a rule statement', (claim: LicenseTermsClaim) => ({
      ...claim,
      metadata: {
        ...claim.metadata,
        terms: {
          ...claim.metadata.terms,
          rules: claim.metadata.terms.rules.map((entry, index) =>
            index === 0 ? { ...entry, statement: 'Use is UNRESTRICTED.' } : entry),
        },
      },
    })],
    ['a rule effect', (claim: LicenseTermsClaim) => ({
      ...claim,
      metadata: {
        ...claim.metadata,
        terms: {
          ...claim.metadata.terms,
          rules: claim.metadata.terms.rules.map((entry, index) =>
            index === 2 ? { ...entry, effect: SovereignLicenseTermsRuleEffect.Permission } : entry),
        },
      },
    })],
    ['the audience', (claim: LicenseTermsClaim) => ({
      ...claim,
      metadata: {
        ...claim.metadata,
        terms: { ...claim.metadata.terms, audience: { kind: 'Principal' as const, principal: 'principal:attacker' } },
      },
    })],
    ['an action', (claim: LicenseTermsClaim) => ({
      ...claim,
      metadata: {
        ...claim.metadata,
        terms: {
          ...claim.metadata.terms,
          rules: claim.metadata.terms.rules.map((entry, index) =>
            index === 2 ? { ...entry, action: aoc(ACTIONS.attribute) } : entry),
        },
      },
    })],
  ])('tampering with %s in transit is detected, and nothing is repaired', async (_label, tamper) => {
    const flow = await runSevenMineralFlow();
    const tampered = {
      ...flow.signedLicenseClaim,
      claim: tamper(flow.licenseClaim) as unknown as VerifiableSovereignClaim,
    };
    const result = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim: tampered },
      createVerifiabilitySovereigntyCapabilityImplementation(),
    );
    if (result.status !== 'succeeded') throw new Error('expected a successful verification result');
    const output = result.output;
    if (output.operation !== 'verify-signed-claim') throw new Error('wrong operation');
    expect(output.verification.valid).toBe(false);
    expect(output.verification.reasons).toContain('CLAIM_DIGEST_MISMATCH');
    // Licensing re-signs nothing and repairs nothing: the tampered document is
    // simply evaluated on its own current structure.
    expect(tampered.digest).toBe(flow.signedLicenseClaim.digest);
  });

  it('CRYPTO VALID / TERMS INVALID — an issuer can sign a malformed terms document', async () => {
    // A base-valid AuthorityClaim with `kind: License` whose structured terms
    // carry no rules at all. `buildLicenseTermsClaim` would refuse to produce
    // this, so it is assembled from the low-level primitive on purpose.
    const subject = parseSovereignAssetId(mintSovereignAssetId());
    const base = buildAuthorityClaim({
      id: 'claim:sm09-malformed-license',
      sovereignAssetId: subject,
      issuer: ISSUER,
      kind: AuthorityClaimKind.License,
      statement: 'Terms with no clauses.',
      issuedAt: AT,
    });
    const malformed: AuthorityClaim = {
      ...base,
      metadata: {
        ...base.metadata,
        terms: {
          schemaVersion: SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION,
          audience: { kind: 'Public' },
          rules: [],
        },
      },
    };
    const signed = signClaim(malformed, KEY_PAIR.privateKeyPem, KEY_PAIR.signingKey, SIGNED_AT);

    const verification = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim: signed },
      createVerifiabilitySovereigntyCapabilityImplementation(),
    );
    if (verification.status !== 'succeeded') throw new Error('expected success');
    const output = verification.output;
    if (output.operation !== 'verify-signed-claim') throw new Error('wrong operation');

    // AOC.VERIFIABILITY: the signature is genuinely valid.
    expect(output.verification.valid).toBe(true);
    expect(output.verification.checks.signature).toBe('valid');

    // AOC.LICENSING_TERMS: the terms are just as genuinely invalid.
    const licensingResult = await invoke<LicensingTermsSovereigntyCapabilityInput, never>(
      LICENSING_REF,
      { operation: 'validate-license-terms', claim: malformed },
      createLicensingTermsSovereigntyCapabilityImplementation() as never,
      { subject: { sovereignAssetId: subject } },
    );
    const report = succeeded(licensingResult) as unknown as {
      validation: { valid: boolean; reasons: readonly string[] };
    };
    expect(report.validation.valid).toBe(false);
    expect(report.validation.reasons).toContain('LICENSING_TERMS_RULES_REQUIRED');

    // Neither result is wrong, and neither repairs the other.
    expect(validateLicenseTermsClaim(malformed).valid).toBe(false);
  });

  it('a cryptographically valid licensing claim can be Contested at the same moment', async () => {
    const flow = await runSevenMineralFlow();
    const contested = succeeded(
      await invoke<LicensingTermsSovereigntyCapabilityInput, never>(
        LICENSING_REF,
        {
          operation: 'contest-license-terms-claim',
          standingId: 'standing:sm09-001',
          claim: flow.licenseClaim,
          reason: 'A competing party disputes the declared terms.',
          effectiveAt: AT,
        },
        createLicensingTermsSovereigntyCapabilityImplementation() as never,
        { subject: flow.subject },
      ),
    ) as unknown as { claim: LicenseTermsClaim; standing: { status: string } };

    expect(contested.standing.status).toBe(StandingStatus.Contested);
    // The claim is byte-identical, so the original signature still verifies.
    expect(canonicalizeJSON(contested.claim)).toBe(canonicalizeJSON(flow.licenseClaim));
    const reverify = await invoke<VerifiabilitySovereigntyCapabilityInput, VerifiabilitySovereigntyCapabilityOutput>(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim: flow.signedLicenseClaim },
      createVerifiabilitySovereigntyCapabilityImplementation(),
    );
    if (reverify.status !== 'succeeded') throw new Error('expected success');
    const output = reverify.output;
    if (output.operation !== 'verify-signed-claim') throw new Error('wrong operation');
    expect(output.verification.valid).toBe(true);
  });
});

describe('SM-09 / Provenance boundary (REQUIRED TESTS)', () => {
  it('a declaration creates no origin, authorship or derivation claim', async () => {
    const flow = await runSevenMineralFlow();
    const licensingResults = flow.results.filter(
      (result) => result.evidence.capability.id === 'aoc:sovereignty-capability:licensing-terms',
    );
    expect(licensingResults).toHaveLength(1);
    const output = succeeded(licensingResults[0]) as unknown as Record<string, unknown>;
    expect(Object.keys(output).sort()).toEqual(['claim', 'operation']);
    expect(canonicalizeJSON(output)).not.toContain('Origin');
    expect(canonicalizeJSON(output)).not.toContain('Derivation');
  });

  it('a derived child inherits no terms from its parent, and Derive does not copy them', async () => {
    const flow = await runSevenMineralFlow();

    // A is the parent, carrying terms including an explicit Derive permission.
    const parent = flow.subject;
    const parentTerms = succeeded(
      await invoke<LicensingTermsSovereigntyCapabilityInput, never>(
        LICENSING_REF,
        {
          operation: 'declare-license-terms',
          claimId: 'claim:parent-license',
          issuer: ISSUER,
          statement: 'Derivation is permitted.',
          audience: { kind: 'Public' },
          rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, aoc(ACTIONS.derive), 'Derivation is permitted.')],
          issuedAt: AT,
        },
        createLicensingTermsSovereigntyCapabilityImplementation() as never,
        { subject: parent },
      ),
    ) as unknown as { claim: LicenseTermsClaim };

    // C is the child, recorded as derived from A.
    const child: SovereignSubjectRef = { sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) };
    const derivationResult = succeeded(
      await invoke<ProvenanceSovereigntyCapabilityInput, never>(
        PROVENANCE_REF,
        {
          operation: 'record-derivation',
          claimId: 'claim:child-derivation',
          issuer: ISSUER,
          issuedAt: AT,
          sourceSovereignAssetIds: [parent.sovereignAssetId],
          relation: DerivationRelationKind.DerivedFrom,
        },
        createProvenanceSovereigntyCapabilityImplementation() as never,
        { subject: child },
      ),
    ) as unknown as { claim: DerivationClaim };

    // Recording the derivation produced exactly one derivation claim and no
    // licensing claim at all: the child carries no terms.
    expect(Object.keys(derivationResult).sort()).toEqual(['claim', 'operation']);
    expect(canonicalizeJSON(derivationResult.claim)).not.toContain('terms');
    expect(canonicalizeJSON(derivationResult.claim)).not.toContain(AOC_LICENSING_SEMANTIC_NAMESPACE);
    expect(derivationResult.claim.subject).toBe(child.sovereignAssetId);

    // And the parent's terms are still only about the parent.
    expect(parentTerms.claim.subject).toBe(parent.sovereignAssetId);
    expect(parentTerms.claim.subject).not.toBe(child.sovereignAssetId);
  });

  it('provenance and licensing claims coexist over one subject with no inference between them', async () => {
    const flow = await runSevenMineralFlow();
    expect(flow.derivation.subject).toBe(flow.subject.sovereignAssetId);
    expect(flow.licenseClaim.subject).toBe(flow.subject.sovereignAssetId);
    expect(canonicalizeJSON(flow.derivation)).not.toContain(AOC_LICENSING_SEMANTIC_NAMESPACE);
    expect(canonicalizeJSON(flow.licenseClaim)).not.toContain('sourceSovereignAssetIds');
  });
});

describe('SM-09 / multiple, contradictory and open-world declarations', () => {
  const declare = async (
    subject: SovereignSubjectRef,
    claimId: string,
    issuer: string,
    rules: readonly SovereignLicenseTermsRuleV1[],
    issuedAt: string,
  ): Promise<LicenseTermsClaim> =>
    (succeeded(
      await invoke<LicensingTermsSovereigntyCapabilityInput, never>(
        LICENSING_REF,
        {
          operation: 'declare-license-terms',
          claimId,
          issuer,
          statement: 'Terms.',
          audience: { kind: 'Public' },
          rules,
          issuedAt,
        },
        createLicensingTermsSovereigntyCapabilityImplementation() as never,
        { subject },
      ),
    ) as unknown as { claim: LicenseTermsClaim }).claim;

  it('a subject may carry many declarations from many issuers, with no latest-wins resolution', async () => {
    const subject: SovereignSubjectRef = { sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) };
    const first = await declare(subject, 'claim:a', 'principal:issuer-a',
      [rule('R1', SovereignLicenseTermsRuleEffect.Permission, aoc(ACTIONS.commercialUse), 'permitted')],
      '2026-01-01T00:00:00.000Z');
    const second = await declare(subject, 'claim:b', 'principal:issuer-b',
      [rule('R1', SovereignLicenseTermsRuleEffect.Restriction, aoc(ACTIONS.commercialUse), 'restricted')],
      '2026-06-01T00:00:00.000Z');

    expect(first.subject).toBe(second.subject);
    expect(first.id).not.toBe(second.id);
    expect(isValidLicenseTermsClaim(first)).toBe(true);
    expect(isValidLicenseTermsClaim(second)).toBe(true);
    // Nothing in the package selects a winner, and nothing marks one superseded.
    for (const claim of [first, second]) {
      const serialized = canonicalizeJSON(claim).toLowerCase();
      for (const forbidden of ['supersede', 'current', 'winner', 'precedence', 'effective_now']) {
        expect(serialized).not.toContain(forbidden);
      }
    }
  });

  it('contradictory clauses inside one declaration are recorded, never resolved', async () => {
    const subject: SovereignSubjectRef = { sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()) };
    const claim = await declare(subject, 'claim:contradictory', ISSUER, [
      rule('R1', SovereignLicenseTermsRuleEffect.Permission, aoc(ACTIONS.commercialUse), 'commercial use permitted'),
      rule('R2', SovereignLicenseTermsRuleEffect.Restriction, aoc(ACTIONS.commercialUse), 'commercial use restricted'),
    ], AT);
    expect(claim.metadata.terms.rules.map((entry) => entry.effect)).toEqual(['Permission', 'Restriction']);
    expect(isValidLicenseTermsClaim(claim)).toBe(true);
    // One semantic requirement for the action, plus both effect concepts.
    expect(claim.semanticRefs.map((ref) => ref.termRef)).toEqual([
      DECLARATION.licenseTermsDeclaration,
      DECLARATION.permissionRule,
      DECLARATION.restrictionRule,
      ACTIONS.commercialUse,
    ]);
  });

  it.each([
    ['an alien resource', 'alien-system-v89', 'alien-license-system-v89:quantum-fold'],
    ['a property parcel', 'example.real-estate', 'example.real-estate:lease'],
    ['an external token', 'example.token', 'example.token:transfer'],
    ['an AI agent', 'example.ai', 'example.ai:fine-tune'],
    ['an API resource', 'example.api', 'example.api:invoke'],
  ])('%s receives terms through the same architecture, with no domain branch', async (_label, namespace, termRef) => {
    const subject: SovereignSubjectRef = {
      sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()),
      externalReference: buildSovereignExternalReference({ namespace, id: 'external-1' }),
    };
    const claim = await declare(subject, `claim:${namespace}`, ISSUER,
      [rule('R1', SovereignLicenseTermsRuleEffect.Permission, { namespace, termRef }, 'permitted')], AT);
    expect(claim.metadata.terms.rules[0].action).toEqual({ namespace, termRef });
    expect(claim.semanticRefs).toContainEqual(expect.objectContaining({ namespace, termRef }));
    // Nothing about the subject's namespace reached the claim's structure.
    expect(claim.metadata.terms.schemaVersion).toBe(SOVEREIGN_LICENSE_TERMS_SCHEMA_VERSION);
  });
});
