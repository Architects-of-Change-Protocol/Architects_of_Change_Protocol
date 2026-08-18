import { sovereignExternalReferencesEqual, type SovereignSubjectRef } from '../../identity';
import {
  AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
  SOVEREIGNTY_INTEROPERABILITY_REASON_CODES,
  assessSovereigntyInteroperabilityCompatibility,
  tryBuildSovereigntyInteroperabilityDescriptorV1,
  validateSovereigntyInteroperabilityConsumerSupportV1,
  validateSovereigntyInteroperabilityDescriptorV1,
  type SovereigntyInteroperabilityCompatibilityReportV1,
  type SovereigntyInteroperabilityConsumerSupportV1,
  type SovereigntyInteroperabilityDescriptorV1,
  type SovereigntyInteroperabilityProfileV1,
} from '../../interoperability';
import type { SovereigntyPortabilityBundleV1 } from '../../portability';
import type { SovereigntyCapabilityRef } from '../capability-ref';
import type {
  SovereigntyCapabilityExecutionOutcome,
  SovereigntyCapabilityImplementation,
} from '../implementation';
import type { SovereigntyCapabilityInvocation } from '../invocation';
import { requireSovereigntyCapabilityRef } from './canonical-ref';

/**
 * AOC.INTEROPERABILITY — the production Sovereignty Capability capsule that
 * answers:
 *
 *   "When this sovereign representation arrives somewhere else, can the
 *    receiving system determine what it is, which of its semantics that system
 *    understands, which it does not, and whether it can safely consume it?"
 *
 * It is the fifth of the canonical eight to become a real implementation of the
 * SM-03 socket. The interoperability data contracts — profile, semantic
 * vocabulary, descriptor, consumer support and compatibility report — live in
 * `@aoc/protocol/interoperability`; this capsule is what makes describing and
 * assessing ordinary capability invocations producing capability-attributed
 * evidence.
 *
 * ## Two operations, deliberately
 *
 *   describe-bundle        canonical bundle          -> profile + descriptor
 *   assess-compatibility   descriptor + support      -> compatibility report
 *
 * That is the whole surface. There is no translate operation, no downgrade, no
 * projection and no adapter registration, because each of those would be a
 * transformation of sovereign data rather than a description of it.
 *
 * ## Interoperability is not Portability
 *
 * Portability moves the representation; Interoperability describes it and
 * compares it against what a receiver declares it understands. This capsule
 * reuses the Portability *contract* — the bundle type and its validator, by way
 * of the descriptor builder — because describing a representation requires
 * knowing what a valid one is. It never invokes the AOC.PORTABILITY capsule:
 * `invokeSovereigntyCapability` is not called here at all, and composing
 * minerals stays the caller's decision, visible in the caller's own evidence.
 *
 * ## What this capsule never does
 *
 * - **Verify.** `verifySignedClaim`, `verifySovereignManifest` and
 *   `verifySovereignSignature` are not called. A descriptor may report that a
 *   `signed-claim` is present and that its underlying type is `Derivation`; it
 *   never reports that the signature holds. Understanding what an artifact
 *   claims to be is Interoperability; establishing whether its proof is
 *   authentic is Verifiability, and conflating the two would let "described"
 *   quietly read as "verified".
 * - **Compute integrity.** `computeContentIdentity` and `computeManifestDigest`
 *   are not called and no digest is repaired. The descriptor may state that a
 *   manifest carries a `ContentIdentity` and that the representation
 *   canonicalizes under `aoc-canonical-json/1`; describing integrity metadata
 *   is not producing it.
 * - **Mint identity.** `mintSovereignAssetId` is not called on either
 *   operation. `describe-bundle` returns the subject that was already in the
 *   bundle, which is why it needs no invocation subject of its own.
 * - **Create provenance.** Describing a `DerivationClaim` asserts nothing about
 *   derivation. No claim, standing or lineage is built here.
 * - **Decide.** A report says `compatible`, `partially-compatible` or
 *   `incompatible`. It never says allow, deny, approve, reject, grant or
 *   enforce. What an application does with an incomplete understanding is the
 *   application's decision, at the application or Enterprise layer.
 * - **Score or trust.** No trust score, confidence value, reputation or
 *   authority level. A system can perfectly understand a claim it has every
 *   reason to distrust; understandable is not trusted, and compatible is not
 *   true.
 * - **Project or drop.** No `stripUnsupportedArtifacts`, no `downgradeBundle`,
 *   no `bestEffortImport`. A partial result reports incomplete understanding
 *   and leaves the representation exactly as it was; silently emitting a
 *   reduced bundle is how sovereign data disappears in transit.
 * - **Translate.** No W3C VC, DID, C2PA, SPDX, JSON-LD, Open Badges, XACML,
 *   Rego, Cedar or chain-metadata mapping exists here, in any form. Those are
 *   possible future profiles and adapters, and none of them is needed to prove
 *   that AOC semantics can be described and negotiated.
 * - **Discover.** Consumer support is explicit caller input. It is never
 *   fetched from a well-known URL, a DID document, a registry, DNS or a service
 *   endpoint, and never inferred from a user-agent, package name, runtime or
 *   provider.
 * - **Branch on the subject.** No namespace, asset type or business domain is
 *   read. A physical property, an external token, an autonomous agent, an API
 *   resource and a subject from a system nobody has heard of all describe
 *   through exactly the same architecture, differing only in their data.
 */

/** The operations AOC.INTEROPERABILITY 1.0.0 supports. Closed for this version. */
export const INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = Object.freeze([
  'describe-bundle',
  'assess-compatibility',
] as const);

export type InteroperabilitySovereigntyCapabilityOperation =
  (typeof INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS)[number];

/**
 * Stable, machine-readable reason codes this capsule can report.
 *
 * The contract-level codes are not restated here: they are spread in from
 * `@aoc/protocol/interoperability`'s single map, so the code a consumer sees
 * for an unsupported claim type is identical whether it came from a
 * compatibility report or from a failed capability invocation.
 */
export const INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = Object.freeze({
  ...SOVEREIGNTY_INTEROPERABILITY_REASON_CODES,
  unsupportedOperation: 'INTEROPERABILITY_UNSUPPORTED_OPERATION',
} as const);

export type InteroperabilitySovereigntyCapabilityReasonCode =
  (typeof INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES)[keyof typeof INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES];

/**
 * Capability-specific input for `describe-bundle`.
 *
 * There is deliberately no subject field: the bundle already carries the one
 * subject the representation is about, and a second one on the input would be
 * a value for the two to drift apart on. Supplying `invocation.subject` is
 * optional and means "I expect this bundle to be about exactly that reference",
 * which is checked for exact equality rather than reconciled.
 *
 * A serialized bundle is deliberately not accepted either. Turning transport
 * bytes into a bundle is `parseSovereigntyPortabilityBundle`'s job, and a
 * second JSON entry point into the representation living inside a describing
 * capsule would be a parser this layer has no business owning.
 */
export interface DescribeInteroperabilityBundleInput {
  readonly operation: 'describe-bundle';
  readonly bundle: SovereigntyPortabilityBundleV1;
}

/**
 * Capability-specific input for `assess-compatibility`.
 *
 * Both documents are supplied. Nothing about the consuming system is detected,
 * and no provider, runtime or deployment information participates in the
 * assessment.
 */
export interface AssessInteroperabilityCompatibilityInput {
  readonly operation: 'assess-compatibility';
  /** May have crossed an external trust boundary; structurally validated, never trusted by cast. */
  readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
  readonly consumerSupport: SovereigntyInteroperabilityConsumerSupportV1;
}

export type InteroperabilitySovereigntyCapabilityInput =
  | DescribeInteroperabilityBundleInput
  | AssessInteroperabilityCompatibilityInput;

/**
 * The descriptor, and the profile whose meanings it uses.
 *
 * Returning the profile is what makes the result self-describing. A consumer
 * that receives this output — rather than importing AOC's TypeScript constants
 * — can read the profile id and version, the wire media type, the bundle schema,
 * the canonicalization profile, the artifact kinds, the claim types and the
 * full semantic vocabulary straight out of it, without inspecting any internal
 * source. The descriptor additionally carries a versioned `profile` reference,
 * so the two can never be separated and leave the descriptor ambiguous.
 */
export interface DescribeInteroperabilityBundleOutput {
  readonly operation: 'describe-bundle';
  readonly profile: SovereigntyInteroperabilityProfileV1;
  readonly descriptor: SovereigntyInteroperabilityDescriptorV1;
}

export interface AssessInteroperabilityCompatibilityOutput {
  readonly operation: 'assess-compatibility';
  readonly report: SovereigntyInteroperabilityCompatibilityReportV1;
}

export type InteroperabilitySovereigntyCapabilityOutput =
  | DescribeInteroperabilityBundleOutput
  | AssessInteroperabilityCompatibilityOutput;

export interface InteroperabilitySovereigntyCapabilityInputValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly InteroperabilitySovereigntyCapabilityReasonCode[];
}

export interface InteroperabilitySovereigntyCapabilityImplementation
  extends SovereigntyCapabilityImplementation<
    InteroperabilitySovereigntyCapabilityInput,
    InteroperabilitySovereigntyCapabilityOutput
  > {}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates the capability-specific Interoperability input.
 *
 * This checks the *operation envelope* only — that the operation is one this
 * capability version supports, and that the documents it names are present as
 * objects. It deliberately does not restate the bundle, descriptor or support
 * rules: those belong to the real validators in
 * `@aoc/protocol/interoperability` and `@aoc/protocol/portability`, a second
 * copy of them here would be a drift source, and the capsule applies them by
 * running those validators and reporting their reasons verbatim.
 */
export function validateInteroperabilitySovereigntyCapabilityInput(
  value: unknown,
): InteroperabilitySovereigntyCapabilityInputValidationResult {
  const codes = INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;

  if (!isPlainObject(value)) {
    return { valid: false, reasons: [codes.invalidInput] };
  }

  const operation = value.operation;
  if (
    typeof operation !== 'string'
    || !(INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS as readonly string[]).includes(operation)
  ) {
    return { valid: false, reasons: [codes.unsupportedOperation] };
  }

  const reasons: InteroperabilitySovereigntyCapabilityReasonCode[] = [];

  if (operation === 'describe-bundle' && !isPlainObject(value.bundle)) {
    reasons.push(codes.invalidInput);
  }

  if (operation === 'assess-compatibility') {
    if (!isPlainObject(value.descriptor) || !isPlainObject(value.consumerSupport)) {
      reasons.push(codes.invalidInput);
    }
  }

  return { valid: reasons.length === 0, reasons };
}

export function isValidInteroperabilitySovereigntyCapabilityInput(
  value: unknown,
): value is InteroperabilitySovereigntyCapabilityInput {
  return validateInteroperabilitySovereigntyCapabilityInput(value).valid;
}

/**
 * Exact equality of two subject references.
 *
 * Two references naming the same `SovereignAssetId` under different external
 * references — or one with an external reference and one without — are not
 * equal, and that inequality is the point: a describer that said "close enough"
 * would be silently reconciling a reference change nobody asked it to
 * reconcile. SM-02's `sovereignExternalReferencesEqual` is reused for the
 * reference half rather than restating its rules.
 */
function subjectsExactlyEqual(a: SovereignSubjectRef, b: SovereignSubjectRef): boolean {
  if (a.sovereignAssetId !== b.sovereignAssetId) return false;
  if (a.externalReference === undefined || b.externalReference === undefined) {
    return a.externalReference === b.externalReference;
  }
  return sovereignExternalReferencesEqual(a.externalReference, b.externalReference);
}

/**
 * Builds the production AOC.INTEROPERABILITY capsule.
 *
 * A factory, so importing this module performs no work: no profile is
 * registered, no global is touched, no clock is read and no id is generated at
 * import time. There is no implementation registry and no profile registry —
 * the capsule is passed explicitly to `invokeSovereigntyCapability`, and the
 * one canonical profile is a frozen constant rather than an entry in a mutable
 * catalogue. No options are needed because neither operation reads the clock:
 * both are deterministic functions of their inputs, and *when* a description or
 * an assessment happened is recorded truthfully in the invocation evidence
 * instead.
 */
export function createInteroperabilitySovereigntyCapabilityImplementation(): InteroperabilitySovereigntyCapabilityImplementation {
  const capability: SovereigntyCapabilityRef = requireSovereigntyCapabilityRef('interoperability');

  return Object.freeze({
    capability,
    async invoke(
      invocation: SovereigntyCapabilityInvocation<InteroperabilitySovereigntyCapabilityInput>,
    ): Promise<SovereigntyCapabilityExecutionOutcome<InteroperabilitySovereigntyCapabilityOutput>> {
      const codes = INTEROPERABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;

      const validation = validateInteroperabilitySovereigntyCapabilityInput(invocation.input);
      if (!validation.valid) {
        return { status: 'failed', reasonCodes: validation.reasons };
      }

      const input = invocation.input;

      if (input.operation === 'describe-bundle') {
        const described = tryBuildSovereigntyInteroperabilityDescriptorV1(input.bundle);
        if (!described.valid) {
          return { status: 'failed', reasonCodes: described.reasons };
        }

        const { descriptor } = described;

        // An explicitly supplied subject is an assertion about which
        // representation this is. It is checked, never reconciled.
        if (invocation.subject !== undefined && !subjectsExactlyEqual(invocation.subject, descriptor.subject)) {
          return { status: 'failed', reasonCodes: [codes.subjectMismatch] };
        }

        return {
          status: 'succeeded',
          output: Object.freeze({
            operation: 'describe-bundle' as const,
            profile: AOC_SOVEREIGNTY_INTEROPERABILITY_PROFILE_V1,
            descriptor,
          }),
          // The EXISTING subject the bundle is about, stated explicitly so a
          // subjectless description still resolves the common result and
          // evidence onto it. Nothing was minted: this is the same
          // `SovereignAssetId` the exporting runtime had.
          subject: descriptor.subject,
        };
      }

      // Both documents may have arrived from outside this runtime, so both are
      // structurally validated before anything is read off them. A malformed
      // document is a *failed execution* — the caller asked a question that
      // cannot be answered — which is a different thing from the question being
      // answered "no".
      const descriptorValidation = validateSovereigntyInteroperabilityDescriptorV1(input.descriptor);
      if (!descriptorValidation.valid) {
        return { status: 'failed', reasonCodes: descriptorValidation.reasons };
      }
      const supportValidation = validateSovereigntyInteroperabilityConsumerSupportV1(input.consumerSupport);
      if (!supportValidation.valid) {
        return { status: 'failed', reasonCodes: supportValidation.reasons };
      }

      const { descriptor, consumerSupport } = input;

      if (invocation.subject !== undefined && !subjectsExactlyEqual(invocation.subject, descriptor.subject)) {
        return { status: 'failed', reasonCodes: [codes.subjectMismatch] };
      }

      // Note what this returns for an incompatible result: `succeeded`. The
      // caller asked whether this consumer can consume this representation, and
      // Interoperability determined the answer — "no" is a successful
      // assessment, exactly as an Integrity check that correctly reports a
      // digest mismatch has successfully checked. Reporting a capability
      // failure here would make "the question could not be answered"
      // indistinguishable from "the answer was negative".
      return {
        status: 'succeeded',
        output: Object.freeze({
          operation: 'assess-compatibility' as const,
          report: assessSovereigntyInteroperabilityCompatibility(descriptor, consumerSupport),
        }),
        subject: descriptor.subject,
      };
    },
  });
}
