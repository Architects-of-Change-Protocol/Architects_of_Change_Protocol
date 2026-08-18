import { canonicalizeJSON } from '@aoc/protocol/canonical';
import { StandingStatus } from '@aoc/protocol/claims';
import type { CanonicalStanding } from '@aoc/protocol/claims';
import {
  buildSovereignExternalReference,
  mintSovereignAssetId,
  parseSovereignAssetId,
} from '@aoc/protocol/identity';
import type { SovereignSubjectRef } from '@aoc/protocol/identity';
import {
  DerivationRelationKind,
  generateSovereignKeyPair,
  signClaim,
} from '@aoc/protocol/manifest';
import type {
  DerivationClaim,
  SignedClaim,
  SovereignManifestV1,
  VerifiableSovereignClaim,
} from '@aoc/protocol/manifest';
import type { SovereigntyInteroperabilityDescriptorV1 } from '@aoc/protocol/interoperability';
import {
  AOC_LICENSING_ACTION_TERM_IDS,
  AOC_LICENSING_SEMANTIC_NAMESPACE,
  SovereignLicenseTermsRuleEffect,
  buildLicenseTermsClaim,
} from '@aoc/protocol/licensing';
import type { LicenseTermsClaim, SovereignLicenseTermsRuleV1 } from '@aoc/protocol/licensing';
import { buildSovereigntyPortabilityBundleV1, portableClaimOf } from '@aoc/protocol/portability';
import type { SovereigntyPortabilityBundleV1 } from '@aoc/protocol/portability';
import {
  SOVEREIGN_GOVERNED_RESOURCE_KIND,
  buildSovereignGovernanceHandoffV1,
} from '@aoc/protocol/governance-compatibility';
import type { SovereignGovernanceHandoffV1 } from '@aoc/protocol/governance-compatibility';
import {
  SOVEREIGNTY_CAPABILITY_IDS,
  buildSovereigntyCapabilityInvocation,
  createGovernanceCompatibilitySovereigntyCapabilityImplementation,
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
  GovernanceCompatibilitySovereigntyCapabilityInput,
  GovernanceCompatibilitySovereigntyCapabilityOutput,
  IdentitySovereigntyCapabilityInput,
  IntegritySovereigntyCapabilityInput,
  InteroperabilitySovereigntyCapabilityInput,
  LicensingTermsSovereigntyCapabilityInput,
  PortabilitySovereigntyCapabilityInput,
  PrepareGovernanceHandoffOutput,
  ProvenanceSovereigntyCapabilityInput,
  SovereigntyCapabilityImplementation,
  SovereigntyCapabilityRef,
  SovereigntyCapabilityResult,
  ValidateGovernanceHandoffOutput,
  VerifiabilitySovereigntyCapabilityInput,
  VerifiabilitySovereigntyCapabilityOutput,
} from '@aoc/protocol/sovereignty-capabilities';

/**
 * SM-10 composition proofs — the full eight-mineral flow, closing the canonical
 * shelf.
 *
 * All eight production minerals are composed by the *caller*, through public
 * package APIs, with one shared correlation id and one invocation each. No
 * capsule calls another. The final step hands an external governance consumer a
 * document it can address and interpret, and the Protocol stops there.
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
const GOVERNANCE_REF = REF('governance_compatibility');

const CORRELATION_ID = 'sm10-sovereign-governance-boundary-001';
const ISSUER = 'principal:sm10-issuer';
const REGISTRANT = 'principal:sm10-registrant';
const AT = '2026-08-18T09:00:00.000Z';
const SIGNED_AT = new Date(AT);
const BYTES = new TextEncoder().encode('a sovereign work handed to external governance');

/** TEST ONLY signing material — never production key management. */
const KEY_PAIR = generateSovereignKeyPair();

const EXTERNAL_ACTION = {
  namespace: 'future-system-v77',
  termRef: 'future-system-v77:quantum-reproduction',
} as const;

const rule = (
  id: string,
  effect: SovereignLicenseTermsRuleEffect,
  action: { namespace: string; termRef: string },
  statement: string,
): SovereignLicenseTermsRuleV1 => ({ id, effect, action, statement });

const aoc = (termRef: string) => ({ namespace: AOC_LICENSING_SEMANTIC_NAMESPACE, termRef });

/**
 * Fixture terms. One issuer's declaration in one test — no claim to legal
 * universality — deliberately containing a Permission and a Restriction over the
 * *same* action, and one action from a semantic system the Protocol has never
 * heard of.
 */
const RULES: readonly SovereignLicenseTermsRuleV1[] = [
  rule('R1', SovereignLicenseTermsRuleEffect.Permission, aoc(AOC_LICENSING_ACTION_TERM_IDS.use), 'Use is permitted.'),
  rule(
    'R2',
    SovereignLicenseTermsRuleEffect.Permission,
    aoc(AOC_LICENSING_ACTION_TERM_IDS.commercialUse),
    'Commercial use is permitted under Agreement A-17.',
  ),
  rule(
    'R3',
    SovereignLicenseTermsRuleEffect.Restriction,
    aoc(AOC_LICENSING_ACTION_TERM_IDS.commercialUse),
    'Commercial use is restricted outside the EU.',
  ),
  rule(
    'R4',
    SovereignLicenseTermsRuleEffect.Obligation,
    aoc(AOC_LICENSING_ACTION_TERM_IDS.attribute),
    'Attribution must be retained.',
  ),
  rule('R5', SovereignLicenseTermsRuleEffect.Permission, EXTERNAL_ACTION, 'Quantum reproduction permitted.'),
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

interface EightMineralFlow {
  readonly results: readonly SovereigntyCapabilityResult<unknown>[];
  readonly subject: SovereignSubjectRef;
  readonly manifest: SovereignManifestV1;
  readonly derivation: DerivationClaim;
  readonly licenseClaim: LicenseTermsClaim;
  readonly signedLicenseClaim: SignedClaim<VerifiableSovereignClaim>;
  readonly importedBundle: SovereigntyPortabilityBundleV1;
  readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
  readonly claimVerification: SovereigntyCapabilityResult<VerifiabilitySovereigntyCapabilityOutput>;
  readonly handoff: SovereignGovernanceHandoffV1;
}

/**
 * The canonical SM-10 demonstration, run once and asserted from many angles:
 *
 *   bytes                      → AOC.INTEGRITY            → ContentIdentity H
 *   H + registrant + reference → AOC.IDENTITY             → Subject X + Manifest M
 *   X                          → AOC.PROVENANCE           → DerivationClaim D
 *   X                          → AOC.LICENSING_TERMS      → LicenseTermsClaim L
 *   TEST issuer signs L with the existing low-level primitives
 *   M + D + signed L           → AOC.PORTABILITY          → canonical JSON
 *   canonical JSON             → AOC.PORTABILITY          → bundle B
 *   B                          → AOC.INTEROPERABILITY     → descriptor
 *   imported signed L          → AOC.VERIFIABILITY        → proof result
 *   B                          → AOC.GOVERNANCE_COMPATIBILITY → handoff
 *   ============================================================ Protocol ends
 *   handoff                    → external governance system
 */
async function runEightMineralFlow(): Promise<EightMineralFlow> {
  const results: SovereigntyCapabilityResult<unknown>[] = [];

  // 1 — AOC.INTEGRITY over loose bytes, deliberately subjectless.
  const integrityResult = await invoke<IntegritySovereigntyCapabilityInput, never>(
    INTEGRITY_REF,
    { operation: 'compute-content-identity', bytes: BYTES },
    createIntegritySovereigntyCapabilityImplementation() as never,
  );
  results.push(integrityResult);
  const integrityOutput = succeeded(integrityResult) as { contentIdentity: never };

  // 2 — AOC.IDENTITY mints the subject and the unsigned manifest.
  const identityResult = await invoke<IdentitySovereigntyCapabilityInput, never>(
    IDENTITY_REF,
    {
      registrant: REGISTRANT,
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
      claimId: 'claim:sm10-derivation',
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
      claimId: 'claim:sm10-license',
      issuer: ISSUER,
      statement: 'Terms declared by the issuer over this subject.',
      audience: { kind: 'Public' },
      rules: RULES,
      issuedAt: AT,
      evidenceRefs: ['evidence:contract:A-17'],
    },
    createLicensingTermsSovereigntyCapabilityImplementation() as never,
    { subject },
  );
  results.push(licensingResult);
  const licenseClaim = (succeeded(licensingResult) as unknown as { claim: LicenseTermsClaim }).claim;

  // 5 — the TEST issuer signs, using the pre-existing low-level primitives.
  const signedLicenseClaim = signClaim(
    licenseClaim as unknown as VerifiableSovereignClaim,
    KEY_PAIR.privateKeyPem,
    KEY_PAIR.signingKey,
    SIGNED_AT,
  );

  // 6 — AOC.PORTABILITY exports, carrying a Contested standing over the
  // derivation: a real dispute travels to governance rather than being resolved.
  const standings: readonly CanonicalStanding[] = [
    { id: 'standing:sm10-1', claimRef: derivation.id, status: StandingStatus.Contested, effectiveAt: AT },
  ];
  const exportResult = await invoke<PortabilitySovereigntyCapabilityInput, never>(
    PORTABILITY_REF,
    {
      operation: 'export-bundle',
      manifests: [{ kind: 'manifest', manifest }],
      claims: [
        { kind: 'claim', claim: derivation },
        { kind: 'signed-claim', signedClaim: signedLicenseClaim },
      ],
      standings,
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
  const importedBundle = (succeeded(importResult) as unknown as { bundle: SovereigntyPortabilityBundleV1 })
    .bundle;

  // 8 — AOC.INTEROPERABILITY describes what arrived.
  const describeResult = await invoke<InteroperabilitySovereigntyCapabilityInput, never>(
    INTEROPERABILITY_REF,
    { operation: 'describe-bundle', bundle: importedBundle },
    createInteroperabilitySovereigntyCapabilityImplementation() as never,
  );
  results.push(describeResult);
  const descriptor = (
    succeeded(describeResult) as unknown as { descriptor: SovereigntyInteroperabilityDescriptorV1 }
  ).descriptor;

  // 9 — AOC.VERIFIABILITY independently checks the imported signed terms. This
  // runs *before* the handoff purely to show how a governance consumer could
  // prepare itself; its ephemeral result is deliberately not embedded anywhere
  // in the handoff, so the handoff is never coupled to one verification run.
  const importedLicense = importedBundle.claims.find((artifact) => artifact.kind === 'signed-claim');
  if (importedLicense === undefined || importedLicense.kind !== 'signed-claim') {
    throw new Error('the signed licensing claim did not survive transport');
  }
  const claimVerification = await invoke<
    VerifiabilitySovereigntyCapabilityInput,
    VerifiabilitySovereigntyCapabilityOutput
  >(
    VERIFIABILITY_REF,
    { operation: 'verify-signed-claim', signedClaim: importedLicense.signedClaim },
    createVerifiabilitySovereigntyCapabilityImplementation(),
  );
  results.push(claimVerification);

  // 10 — AOC.GOVERNANCE_COMPATIBILITY projects the whole thing into the
  // boundary object. The Protocol stops here.
  const governanceResult = await invoke<
    GovernanceCompatibilitySovereigntyCapabilityInput,
    GovernanceCompatibilitySovereigntyCapabilityOutput
  >(
    GOVERNANCE_REF,
    { operation: 'prepare-governance-handoff', representation: importedBundle, tenantId: 'tenant-alpha' },
    createGovernanceCompatibilitySovereigntyCapabilityImplementation(),
  );
  results.push(governanceResult);
  const { handoff } = succeeded(governanceResult) as PrepareGovernanceHandoffOutput;

  return {
    results,
    subject,
    manifest,
    derivation,
    licenseClaim,
    signedLicenseClaim,
    importedBundle,
    descriptor,
    claimVerification,
    handoff,
  };
};

/**
 * An external governance consumer, written the way a real one would be: it
 * knows the public handoff contract and nothing about AOC's internals, the
 * subject's asset class, or which capsules produced what.
 *
 * It reads. It does not decide — it returns no allow and no deny, because it is
 * not a policy engine, and neither is anything upstream of it.
 */
function externalGovernanceConsumer(handoff: SovereignGovernanceHandoffV1): {
  readonly resourceKind: string;
  readonly resourceId: string;
  readonly tenantId: string | undefined;
  readonly semanticRequirements: readonly { namespace: string; termRef: string }[];
  readonly claimCount: number;
  readonly contested: boolean;
} {
  return {
    resourceKind: handoff.resource.kind,
    resourceId: handoff.resource.id,
    tenantId: handoff.resource.tenantId,
    semanticRequirements: handoff.semantics.present.semanticRequirements.map((requirement) => ({
      namespace: requirement.namespace,
      termRef: requirement.termRef,
    })),
    claimCount: handoff.representation.claims.length,
    contested: handoff.semantics.present.standingStatuses.includes(StandingStatus.Contested),
  };
}

describe('SM-10 / all eight production minerals compose (COMPOSITION)', () => {
  let flow: EightMineralFlow;

  beforeAll(async () => {
    flow = await runEightMineralFlow();
  });

  it('every one of the eight canonical capability ids appears in the composition', () => {
    const ids = flow.results.map((result) => result.capability.id);
    expect(new Set(ids)).toEqual(
      new Set([
        SOVEREIGNTY_CAPABILITY_IDS.integrity,
        SOVEREIGNTY_CAPABILITY_IDS.identity,
        SOVEREIGNTY_CAPABILITY_IDS.provenance,
        SOVEREIGNTY_CAPABILITY_IDS.licensing_terms,
        SOVEREIGNTY_CAPABILITY_IDS.portability,
        SOVEREIGNTY_CAPABILITY_IDS.interoperability,
        SOVEREIGNTY_CAPABILITY_IDS.verifiability,
        SOVEREIGNTY_CAPABILITY_IDS.governance_compatibility,
      ]),
    );
    expect(new Set(ids).size).toBe(8);
    // Every invocation succeeded, and each advertises version 1.0.0.
    for (const result of flow.results) {
      expect(result.status).toBe('succeeded');
      expect(result.capability.version).toBe('1.0.0');
      expect(isValidSovereigntyCapabilityInvocationEvidence(result.evidence)).toBe(true);
    }
  });

  it('one correlation id ties the chain together, and every invocation id is distinct', () => {
    expect(new Set(flow.results.map((result) => result.correlationId))).toEqual(new Set([CORRELATION_ID]));
    const invocationIds = flow.results.map((result) => result.invocationId);
    expect(new Set(invocationIds).size).toBe(invocationIds.length);
    // Nine invocations across eight distinct capabilities: AOC.PORTABILITY is
    // invoked twice, once to export and once to import, because the caller is
    // deliberately modelling two runtimes.
    expect(invocationIds).toHaveLength(9);
    expect(new Set(flow.results.map((result) => result.capability.id)).size).toBe(8);
  });

  it('prints the actual execution chain the caller composed', () => {
    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        'AOC PROTOCOL — eight-mineral composition',
        `  correlationId = ${CORRELATION_ID}`,
        ...flow.results.map(
          (result, index) =>
            `  ${String(index + 1).padStart(2, ' ')}. ${result.capability.id}@${result.capability.version}`
            + `  ${result.status}  invocationId=${result.invocationId}`,
        ),
        '  ========================================== AOC PROTOCOL ENDS HERE',
        `  handoff.resource = ${canonicalizeJSON(flow.handoff.resource)}`,
        '',
      ].join('\n'),
    );
    expect(flow.results[flow.results.length - 1].capability.id).toBe(
      SOVEREIGNTY_CAPABILITY_IDS.governance_compatibility,
    );
  });

  it('the handoff addresses the same sovereign subject the chain started from', () => {
    expect(flow.handoff.subject).toEqual(flow.subject);
    expect(flow.handoff.resource).toEqual({
      kind: SOVEREIGN_GOVERNED_RESOURCE_KIND,
      id: flow.subject.sovereignAssetId,
      tenantId: 'tenant-alpha',
    });
    expect(flow.handoff.representation).toEqual(flow.importedBundle);
    expect(flow.handoff.semantics).toEqual(flow.descriptor);
  });

  it('the descriptor the caller obtained from AOC.INTEROPERABILITY is exactly the handoff semantics', () => {
    // SM-10 derived its own copy with the pure helper and never invoked the
    // Interoperability capsule; both must be the same document.
    expect(canonicalizeJSON(flow.handoff.semantics)).toBe(canonicalizeJSON(flow.descriptor));
  });
});

describe('SM-10 / Governance Compatibility is not Verifiability (INVALID CRYPTO SEPARATION)', () => {
  it('a tampered proof produces a successful handoff and an independent negative verification', async () => {
    const flow = await runEightMineralFlow();
    const signed = flow.signedLicenseClaim;
    // One leading base64 character replaced by a deterministically different
    // one: the proof stays structurally representable, and the tamper can never
    // accidentally leave the signature unchanged.
    const tamperedSignedClaim = {
      ...signed,
      proof: {
        ...signed.proof,
        signature: `${signed.proof.signature.startsWith('A') ? 'B' : 'A'}${signed.proof.signature.slice(1)}`,
      },
    };
    const representation = buildSovereigntyPortabilityBundleV1({
      subject: flow.subject,
      manifests: [{ kind: 'manifest', manifest: flow.manifest }],
      claims: [{ kind: 'signed-claim', signedClaim: tamperedSignedClaim }],
    });

    const governanceResult = await invoke<
      GovernanceCompatibilitySovereigntyCapabilityInput,
      GovernanceCompatibilitySovereigntyCapabilityOutput
    >(
      GOVERNANCE_REF,
      { operation: 'prepare-governance-handoff', representation },
      createGovernanceCompatibilitySovereigntyCapabilityImplementation(),
    );

    const verifiabilityResult = await invoke<
      VerifiabilitySovereigntyCapabilityInput,
      VerifiabilitySovereigntyCapabilityOutput
    >(
      VERIFIABILITY_REF,
      { operation: 'verify-signed-claim', signedClaim: tamperedSignedClaim },
      createVerifiabilitySovereigntyCapabilityImplementation(),
    );

    const verification = (succeeded(verifiabilityResult) as { verification: { valid: boolean } }).verification;

    // Side by side, and both are correct at once.
    // eslint-disable-next-line no-console
    console.log(
      [
        '',
        'AOC.GOVERNANCE_COMPATIBILITY prepare-governance-handoff :',
        `  execution               = ${governanceResult.status}`,
        'AOC.VERIFIABILITY          verify-signed-claim          :',
        `  execution               = ${verifiabilityResult.status}`,
        `  verification.valid      = ${verification.valid}`,
        '',
      ].join('\n'),
    );

    expect(governanceResult.status).toBe('succeeded');
    expect(verifiabilityResult.status).toBe('succeeded');
    expect(verification.valid).toBe(false);

    // The handoff exists and is structurally valid, and says nothing about the
    // proof it carries.
    const { handoff } = succeeded(governanceResult) as PrepareGovernanceHandoffOutput;
    expect(handoff.representation.claims[0]).toEqual({
      kind: 'signed-claim',
      signedClaim: tamperedSignedClaim,
    });
    const serialized = canonicalizeJSON(handoff);
    for (const forbidden of ['verified', 'signatureValid', 'trustScore', 'proofValid']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('the handoff never embeds an ephemeral verification result', async () => {
    const flow = await runEightMineralFlow();
    const verification = canonicalizeJSON(succeeded(flow.claimVerification));
    expect(canonicalizeJSON(flow.handoff)).not.toContain(verification);
    expect(Object.keys(flow.handoff)).not.toContain('verification');
  });
});

describe('SM-10 / contested and contradictory sovereign state is valid governance input', () => {
  it('CONTESTED SEPARATION — the standing survives, with no verdict, denial or resolution', async () => {
    const flow = await runEightMineralFlow();
    expect(flow.handoff.representation.standings).toHaveLength(1);
    expect(flow.handoff.representation.standings[0].status).toBe(StandingStatus.Contested);
    expect(flow.handoff.semantics.present.standingStatuses).toContain(StandingStatus.Contested);

    const serialized = canonicalizeJSON(flow.handoff);
    for (const forbidden of ['"allow"', '"deny"', 'verdict', 'resolution', 'adjudicat']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('CONTRADICTORY LICENSING — a Permission and a Restriction over one action both survive', async () => {
    const flow = await runEightMineralFlow();
    const licensing = flow.handoff.representation.claims
      .map((artifact) => portableClaimOf(artifact))
      .find((claim) => claim.id === 'claim:sm10-license') as LicenseTermsClaim | undefined;
    if (licensing === undefined) throw new Error('the licensing claim did not reach the handoff');

    const commercial = licensing.metadata.terms.rules.filter(
      (entry) => entry.action.termRef === AOC_LICENSING_ACTION_TERM_IDS.commercialUse,
    );
    expect(commercial.map((entry) => entry.effect).sort()).toEqual(['Permission', 'Restriction']);
    // Byte-identical to what the issuer declared: no rule was dropped, reordered
    // or reinterpreted on the way across the boundary.
    expect(licensing.metadata.terms.rules).toEqual(flow.licenseClaim.metadata.terms.rules);

    const serialized = canonicalizeJSON(flow.handoff);
    for (const forbidden of ['winner', 'precedence', 'resolvedTerms', 'effectiveEffect', 'conflict']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('EXTERNAL SEMANTICS — a term from a system the Protocol has never heard of survives intact', async () => {
    const flow = await runEightMineralFlow();
    const requirements = flow.handoff.semantics.present.semanticRequirements;
    expect(requirements).toContainEqual(
      expect.objectContaining({ namespace: EXTERNAL_ACTION.namespace, termRef: EXTERNAL_ACTION.termRef }),
    );
    // Carried, never interpreted: nothing in the handoff acts on it.
    expect(canonicalizeJSON(flow.handoff)).toContain(EXTERNAL_ACTION.termRef);
  });
});

describe('SM-10 / a generic handoff requires nothing of the representation', () => {
  const subjectFor = (): SovereignSubjectRef => ({
    sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()),
  });

  const prepare = async (
    representation: SovereigntyPortabilityBundleV1,
  ): Promise<SovereigntyCapabilityResult<GovernanceCompatibilitySovereigntyCapabilityOutput>> =>
    invoke<GovernanceCompatibilitySovereigntyCapabilityInput, GovernanceCompatibilitySovereigntyCapabilityOutput>(
      GOVERNANCE_REF,
      { operation: 'prepare-governance-handoff', representation },
      createGovernanceCompatibilitySovereigntyCapabilityImplementation(),
    );

  it('NO LICENSE — a representation with no LicenseTermsClaim prepares', async () => {
    const subject = subjectFor();
    const derivation = {
      kind: 'claim' as const,
      claim: (
        succeeded(
          await invoke<ProvenanceSovereigntyCapabilityInput, never>(
            PROVENANCE_REF,
            {
              operation: 'record-derivation',
              claimId: 'claim:sm10-no-license',
              issuer: ISSUER,
              issuedAt: AT,
              sourceSovereignAssetIds: [parseSovereignAssetId(mintSovereignAssetId())],
              relation: DerivationRelationKind.DerivedFrom,
            },
            createProvenanceSovereigntyCapabilityImplementation() as never,
            { subject },
          ),
        ) as unknown as { claim: DerivationClaim }
      ).claim,
    };
    const representation = buildSovereigntyPortabilityBundleV1({ subject, claims: [derivation] });

    const result = await prepare(representation);
    expect(result.status).toBe('succeeded');
    const { handoff } = succeeded(result) as PrepareGovernanceHandoffOutput;
    expect(handoff.semantics.present.claimTypes).toEqual(['Derivation']);
  });

  it('UNSIGNED — a representation carrying only unsigned artifacts prepares', async () => {
    const subject = subjectFor();
    const claim = buildLicenseTermsClaim({
      id: 'claim:sm10-unsigned-license',
      sovereignAssetId: subject.sovereignAssetId,
      issuer: ISSUER,
      statement: 'Terms declared, and deliberately unsigned.',
      audience: { kind: 'Public' },
      rules: [rule('R1', SovereignLicenseTermsRuleEffect.Permission, aoc(AOC_LICENSING_ACTION_TERM_IDS.use), 'ok')],
      issuedAt: AT,
    });
    const result = await prepare(
      buildSovereigntyPortabilityBundleV1({ subject, claims: [{ kind: 'claim', claim }] }),
    );
    expect(result.status).toBe('succeeded');
    const { handoff } = succeeded(result) as PrepareGovernanceHandoffOutput;
    expect(handoff.semantics.present.claimArtifactKinds).toEqual(['claim']);
  });

  it('EMPTY — a subject-only representation prepares, because governance can still address it', async () => {
    const subject = subjectFor();
    const result = await prepare(buildSovereigntyPortabilityBundleV1({ subject }));
    expect(result.status).toBe('succeeded');
    const { handoff } = succeeded(result) as PrepareGovernanceHandoffOutput;
    expect(handoff.resource.id).toBe(subject.sovereignAssetId);
    expect(handoff.representation.claims).toEqual([]);
  });

  it('DERIVED CHILD — a derived subject gets its own resource, with nothing inherited', async () => {
    const parent = subjectFor();
    const child = subjectFor();
    const derivation = (
      succeeded(
        await invoke<ProvenanceSovereigntyCapabilityInput, never>(
          PROVENANCE_REF,
          {
            operation: 'record-derivation',
            claimId: 'claim:sm10-child-derivation',
            issuer: ISSUER,
            issuedAt: AT,
            sourceSovereignAssetIds: [parent.sovereignAssetId],
            relation: DerivationRelationKind.DerivedFrom,
          },
          createProvenanceSovereigntyCapabilityImplementation() as never,
          { subject: child },
        ),
      ) as unknown as { claim: DerivationClaim }
    ).claim;

    const parentHandoff = buildSovereignGovernanceHandoffV1({
      representation: buildSovereigntyPortabilityBundleV1({ subject: parent }),
    });
    const childResult = await prepare(
      buildSovereigntyPortabilityBundleV1({ subject: child, claims: [{ kind: 'claim', claim: derivation }] }),
    );
    const { handoff: childHandoff } = succeeded(childResult) as PrepareGovernanceHandoffOutput;

    expect(parentHandoff.resource.id).toBe(parent.sovereignAssetId);
    expect(childHandoff.resource.id).toBe(child.sovereignAssetId);
    expect(childHandoff.resource.id).not.toBe(parentHandoff.resource.id);
    // The lineage travels as a claim; no grant, authority or licence follows it.
    expect(childHandoff.representation.claims).toHaveLength(1);
    expect(canonicalizeJSON(childHandoff)).not.toContain('inherit');
  });
});

describe('SM-10 / an external consumer can use the handoff without knowing AOC internals', () => {
  it('reads the resource, the semantics and the claims — and returns no decision', async () => {
    const flow = await runEightMineralFlow();
    const read = externalGovernanceConsumer(flow.handoff);

    expect(read.resourceKind).toBe('aoc:sovereign-asset');
    expect(read.resourceId).toBe(flow.subject.sovereignAssetId);
    expect(read.tenantId).toBe('tenant-alpha');
    expect(read.claimCount).toBe(2);
    expect(read.contested).toBe(true);
    expect(read.semanticRequirements.length).toBeGreaterThan(0);

    // The consumer produced information, not a verdict.
    for (const key of ['allow', 'deny', 'decision', 'grant', 'approved']) {
      expect(Object.keys(read)).not.toContain(key);
    }
  });

  it('the same consumer reads every kind of subject through the identical code path', async () => {
    const shapes = await Promise.all(
      [
        { namespace: 'museum-registry', id: 'painting-1874' },
        { namespace: 'land-registry', id: 'ES-28-0114-77' },
        { namespace: 'ethereum', id: '0xabc/17' },
        { namespace: 'agent-fleet', id: 'agent-alpha-9' },
      ].map(async (reference) => {
        const subject: SovereignSubjectRef = {
          sovereignAssetId: parseSovereignAssetId(mintSovereignAssetId()),
          externalReference: buildSovereignExternalReference(reference),
        };
        const result = await invoke<
          GovernanceCompatibilitySovereigntyCapabilityInput,
          GovernanceCompatibilitySovereigntyCapabilityOutput
        >(
          GOVERNANCE_REF,
          {
            operation: 'prepare-governance-handoff',
            representation: buildSovereigntyPortabilityBundleV1({ subject }),
          },
          createGovernanceCompatibilitySovereigntyCapabilityImplementation(),
        );
        const { handoff } = succeeded(result) as PrepareGovernanceHandoffOutput;
        return externalGovernanceConsumer(handoff);
      }),
    );

    expect(new Set(shapes.map((shape) => shape.resourceKind))).toEqual(new Set(['aoc:sovereign-asset']));
    expect(new Set(shapes.map((shape) => Object.keys(shape).sort().join(',')))).toHaveProperty('size', 1);
  });

  it('a handoff that crossed a wire round trip validates through the capsule', async () => {
    const flow = await runEightMineralFlow();
    const wire = JSON.parse(JSON.stringify(flow.handoff)) as unknown;

    const result = await invoke<
      GovernanceCompatibilitySovereigntyCapabilityInput,
      GovernanceCompatibilitySovereigntyCapabilityOutput
    >(
      GOVERNANCE_REF,
      { operation: 'validate-governance-handoff', handoff: wire },
      createGovernanceCompatibilitySovereigntyCapabilityImplementation(),
    );
    expect(result.status).toBe('succeeded');
    const output = succeeded(result) as ValidateGovernanceHandoffOutput;
    expect(output.validation).toEqual({ valid: true, reasons: [] });
  });
});
