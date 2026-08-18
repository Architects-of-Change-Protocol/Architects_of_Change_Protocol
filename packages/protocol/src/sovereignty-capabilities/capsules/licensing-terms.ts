import type {
  CanonicalClaimId,
  CanonicalEvidenceId,
  CanonicalIssuer,
  CanonicalStandingId,
  CanonicalTimestamp,
} from '../../claims/primitives';
import type { CanonicalStanding } from '../../claims/standing';
import { isCanonicalTimestamp } from '../../claims/timestamps';
import type { SovereignSubjectRef } from '../../identity';
import { isValidSovereignAssetId } from '../../identity';
import {
  LICENSING_TERMS_REASON_CODES,
  buildLicenseTermsClaim,
  isValidLicenseTermsClaim,
  validateLicenseTermsClaim,
  validateSovereignLicenseTermsRuleV1,
  type LicenseTermsClaim,
  type LicensingTermsReasonCode,
  type LicensingTermsValidationResult,
  type SovereignLicenseTermsAudience,
  type SovereignLicenseTermsRuleV1,
} from '../../licensing';
import { isValidSovereignLicenseTermsAudience } from '../../licensing';
import { contestClaim } from '../../manifest';
import type { SovereigntyCapabilityRef } from '../capability-ref';
import type {
  SovereigntyCapabilityExecutionOutcome,
  SovereigntyCapabilityImplementation,
} from '../implementation';
import type { SovereigntyCapabilityInvocation } from '../invocation';
import { systemSovereigntyCapabilityClock, toUtcTimestamp, type SovereigntyCapabilityClock } from '../time';
import { requireSovereigntyCapabilityRef } from './canonical-ref';

/**
 * AOC.LICENSING_TERMS — the production Sovereignty Capability capsule that
 * answers:
 *
 *   "What permissions, restrictions and obligations does an issuer declare
 *    over this sovereign subject — in a structured, attributable, portable
 *    form that another system can read?"
 *
 * It is the seventh of the canonical eight to become a real implementation of
 * the SM-03 socket. The claim architecture it builds on already existed:
 * `AuthorityClaimKind.License` has been part of `@aoc/protocol/manifest` since
 * the manifest layer was written, and SM-05 deliberately left it outside the
 * formal Provenance capsule for exactly this mineral to take up. What SM-09
 * adds underneath is the genuinely missing piece — a structured, versioned
 * `SovereignLicenseTermsV1` document, so a licensing declaration is
 * machine-readable rather than buried in free text.
 *
 * ## Declaration is not enforcement
 *
 * This is the load-bearing boundary, and it holds in every direction:
 *
 *     declared permission   != runtime authorization
 *     declared restriction  != enforced denial
 *     declared obligation   != proof of compliance
 *     signed license claim  != legal validity
 *     issuer declares rights!= issuer proven to hold rights
 *     license terms         != ownership transfer
 *     license terms         != policy decision
 *     license terms         != access grant
 *     license terms         != DRM
 *
 * A `Permission`/`CommercialUse` clause means *"the issuer declares commercial
 * use permitted under these terms"*. It produces no `CapabilityGrant`, no
 * `CapabilityToken`, no `AccessGrant`, no credential, no signed URL, no ACL
 * entry and no authorization result. A `Restriction` clause blocks no request,
 * deletes no file, revokes no URL, disables no playback and prevents no copy.
 * An `Obligation`/`Attribute` clause does not establish that attribution
 * happened, and an `Obligation` to pay does not establish that anyone paid.
 *
 * ## No evaluation, in any form
 *
 * There is deliberately no `evaluate-license`, `is-action-permitted`,
 * `is-action-restricted`, `isAllowed`, `isDenied`, `authorize-use`, `canUse`,
 * `canDistribute`, `canDerive` or `check-obligation` operation, and no
 * condition language to write one with — no `and`, `or`, `not`, comparison
 * operator, expression tree, CEL, Rego, Cedar, JSON Logic or XACML. This is an
 * absolute boundary rather than deferred work.
 *
 * It follows that Protocol applies **no precedence**. A document may declare a
 * `Permission` and a `Restriction` over the identical action; both are
 * structurally valid, both are recorded, and Protocol says only *"the issuer
 * declared both"*. It does not say commercial use is allowed, does not say it
 * is denied, and does not decide that restriction beats permission, that the
 * latest claim wins, that a signed claim beats an unsigned one, that a verified
 * issuer beats an unverified one, or that a principal-specific document beats a
 * public one. A subject may carry many licensing declarations from many
 * issuers, with different dates, audiences and contradictory terms, and nothing
 * here resolves which is "current".
 *
 * ## No wall clock, no derived standing
 *
 * `issuedAt`, `effectiveAt` and `expiresAt` are declaration *data*. Nothing
 * here compares them to now, so there is no `isActive`,
 * `isCurrentlyEffective`, `isExpiredNow` or `isNotYetEffective`, and no
 * `StandingStatus.Active` or `StandingStatus.Expired` is ever created. A
 * future-effective declaration is structurally valid; an expired historical
 * declaration is structurally valid historical data.
 *
 * ## What this capsule deliberately does not do
 *
 * - **Create identity.** It never calls `mintSovereignAssetId`. Terms are
 *   declared over a subject that already exists, so `invocation.subject` is
 *   required for a declaration — see `LICENSING_TERMS_SUBJECT_REQUIRED` — and
 *   `declare-license-terms` accepts no `sovereignAssetId` of its own, so a
 *   claim can never disagree with the invocation it was made under.
 * - **Require content.** No bytes, no `ContentIdentity`, no manifest digest.
 *   Terms attach to sovereign subject *identity*, which is what lets a
 *   building, a parcel of land, an API resource, an AI agent, an external token
 *   and a physical painting receive terms exactly as a file does.
 * - **Sign.** `signClaim`, `signSovereignManifest`, `signSovereignPayload` and
 *   `generateSovereignKeyPair` are not called here, and no input field carries
 *   a private key, secret key, seed, mnemonic or KMS secret in any spelling. An
 *   issuer signs a returned claim with the existing public primitives, and
 *   AOC.VERIFIABILITY checks it.
 * - **Verify.** Cryptographic validity is AOC.VERIFIABILITY's contract. The two
 *   are independent: an issuer can sign a structurally malformed terms
 *   document, so "signature valid" and "terms invalid" is an ordinary,
 *   representable pair rather than a contradiction.
 * - **Create provenance.** No `OriginClaim`, authorship claim or
 *   `DerivationClaim` appears as a side effect. One declaration produces one
 *   licensing claim.
 * - **Inherit anything.** Terms never travel along a derivation edge. There is
 *   no `inheritLicense`, `copyTerms`, `propagateRestrictions` or
 *   `propagateRights`, and a `Permission`/`Derive` clause on a parent does not
 *   give a child the parent's terms — the child needs its own declaration.
 * - **Conclude ownership.** No `owner`, `legalOwner`, `copyrightOwner`,
 *   `titleHolder` or `beneficialOwner` field exists, and the manifest's
 *   `registrant` is never read as the licensing issuer: registering a subject
 *   and declaring terms over it are different acts, possibly by different
 *   parties, so the issuer is always supplied explicitly. There is no
 *   `transfer`, `assign`, `convey`, `sell` or `title-transfer` operation.
 * - **Do economics.** No price, currency, royalty rate, fee, revenue share,
 *   payment schedule, wallet or settlement address; no
 *   `calculateRoyalty`, `settleRoyalty`, `splitRevenue`, `invoice` or
 *   `meterUsage`; no billing, tax or jurisdiction engine.
 * - **Do DRM.** No encryption, watermarking, playback control, kill switch,
 *   remote disable or copy prevention. Enforcement is external, always.
 * - **Translate.** No SPDX, Creative Commons, ODRL, RightsML or NFT-licence
 *   mapping. Those are adapters over this model, and inventing them here would
 *   bake somebody else's semantics into the Protocol contract.
 * - **Reach out.** No filesystem, network, database, chain, provider, registry
 *   or resolver. An action term is an identifier and is never dereferenced,
 *   URL-shaped or not; a custom audience is never expanded into members.
 * - **Invoke another mineral.** `invokeSovereigntyCapability` is not called
 *   here. Composition stays the caller's decision, visible in the caller's own
 *   evidence.
 * - **Branch on the subject or the action.** No namespace, media type,
 *   filename, asset type or business domain is read, and even the core action
 *   concepts — `CommercialUse`, `Derive`, `Attribute` — trigger no distinct
 *   production behaviour. Rules are generic structured declarations.
 *
 * ## Deferred on purpose
 *
 * `supersede-license-terms` is **not** implemented in v1. The standing model
 * can already express `Superseded`, but supersession implies precedence between
 * declarations, and precedence deserves its own explicit design rather than
 * arriving as a side effect of a convenience operation. Governance handoff
 * belongs to SM-10, AOC.GOVERNANCE_COMPATIBILITY, and nothing here anticipates
 * it.
 */

/**
 * The operations AOC.LICENSING_TERMS 1.0.0 supports. Closed for this capability
 * version: an unrecognized operation is reported rather than guessed at.
 */
export const LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS = Object.freeze([
  'declare-license-terms',
  'validate-license-terms',
  'contest-license-terms-claim',
] as const);

export type LicensingTermsSovereigntyCapabilityOperation =
  (typeof LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS)[number];

/**
 * Capability-specific input for `declare-license-terms`.
 *
 * Fields deliberately absent, and why:
 *
 * - **`sovereignAssetId`** — the subject is always
 *   `invocation.subject.sovereignAssetId`. Letting the caller name a second,
 *   potentially different asset id would allow a claim that contradicts the
 *   invocation it was recorded under.
 * - **any private key** — this capsule does not sign, and the SM-03 invocation
 *   input is a generic transport shared by every capability. Key material has
 *   no business travelling through it.
 * - **content bytes** — terms attach to subject identity, not to a byte
 *   representation.
 *
 * `claimId` is caller-supplied and is emphatically not the `invocationId`: one
 * identifies *this execution of a capability*, the other identifies *this
 * declaration*, with different lifetimes and different holders. Protocol has no
 * claim-id minting primitive, and SM-09 does not invent an id grammar.
 *
 * `issuedAt` is optional. Supplied, it is preserved — which is what makes
 * importing historical declarations possible. Omitted, it comes from the
 * injectable Protocol clock as a canonical UTC timestamp.
 *
 * `effectiveAt` has no default at all. It is a distinct fact from `issuedAt`,
 * and deriving one from the other would record a declaration the issuer never
 * made.
 */
export interface DeclareLicenseTermsInput {
  readonly operation: 'declare-license-terms';
  readonly claimId: CanonicalClaimId;
  readonly issuer: CanonicalIssuer;
  readonly statement: string;
  readonly audience: SovereignLicenseTermsAudience;
  readonly rules: readonly SovereignLicenseTermsRuleV1[];
  readonly issuedAt?: CanonicalTimestamp;
  readonly effectiveAt?: CanonicalTimestamp;
  readonly expiresAt?: CanonicalTimestamp;
  readonly evidenceRefs?: readonly CanonicalEvidenceId[];
}

/**
 * Capability-specific input for `validate-license-terms`.
 *
 * `claim` is `unknown` on purpose. Validation is an *external trust boundary*
 * operation — the candidate is exactly the kind of document that arrived from
 * somewhere else — and typing it as `LicenseTermsClaim` would let a malformed
 * document become authoritative by assertion, which is the failure the operation
 * exists to prevent.
 */
export interface ValidateLicenseTermsInput {
  readonly operation: 'validate-license-terms';
  readonly claim: unknown;
}

/**
 * Capability-specific input for `contest-license-terms-claim`.
 *
 * Recording a dispute, never resolving one. No adjudication, no approval, no
 * governance body, no oracle and no reviewer is consulted, and no conclusion
 * about ownership or legal validity is reached.
 */
export interface ContestLicenseTermsClaimInput {
  readonly operation: 'contest-license-terms-claim';
  readonly standingId: CanonicalStandingId;
  /** The claim to contest, unchanged. It is read, never rewritten. */
  readonly claim: LicenseTermsClaim;
  readonly reason: string;
  readonly effectiveAt?: CanonicalTimestamp;
}

export type LicensingTermsSovereigntyCapabilityInput =
  | DeclareLicenseTermsInput
  | ValidateLicenseTermsInput
  | ContestLicenseTermsClaimInput;

/**
 * The declared terms, as one canonical claim.
 *
 * Deliberately no `signature`, `standing`, `grant`, `token`, `credential`,
 * `authorization`, `decision` or `effectiveNow` field. The operation declares;
 * anything further is another mineral's contract or another system's job.
 */
export interface DeclareLicenseTermsOutput {
  readonly operation: 'declare-license-terms';
  readonly claim: LicenseTermsClaim;
}

export interface ValidateLicenseTermsOutput {
  readonly operation: 'validate-license-terms';
  readonly validation: LicensingTermsValidationResult;
}

/**
 * The contested claim and the standing recording the challenge.
 *
 * `claim` is the caller's original object, returned untouched — contestation
 * preserves history rather than replacing it. `standing.status` is `Contested`,
 * which states only that a challenge exists: not that the challenger is right,
 * not that the terms are void, and not that any signature over the claim has
 * stopped verifying. A cryptographically valid licensing claim and a
 * `Contested` standing coexist without contradiction.
 */
export interface ContestLicenseTermsClaimOutput {
  readonly operation: 'contest-license-terms-claim';
  readonly claim: LicenseTermsClaim;
  readonly standing: CanonicalStanding;
}

export type LicensingTermsSovereigntyCapabilityOutput =
  | DeclareLicenseTermsOutput
  | ValidateLicenseTermsOutput
  | ContestLicenseTermsClaimOutput;

export interface LicensingTermsSovereigntyCapabilityInputValidationResult {
  readonly valid: boolean;
  readonly reasons: readonly LicensingTermsReasonCode[];
}

export interface CreateLicensingTermsSovereigntyCapabilityImplementationOptions {
  /**
   * Injectable time source for a claim's `issuedAt` and a standing's
   * `effectiveAt` when the caller supplied neither. Reuses the existing SM-03
   * `SovereigntyCapabilityClock` rather than adding a second clock abstraction.
   *
   * It is never used to default a terms document's `effectiveAt`, and never
   * consulted to decide whether a declaration is currently in force.
   *
   * `invocation.requestedAt` is deliberately not used: it is caller-supplied
   * envelope metadata about when a request was constructed, which is a
   * different fact from when a declaration was issued.
   */
  readonly clock?: SovereigntyCapabilityClock;
}

const codes = LICENSING_TERMS_REASON_CODES;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Same structural floor as the claims layer's issuer rule: a non-blank string,
 * or an object with a non-blank `id` and `kind`. Protocol still has no fully
 * canonical runtime validator for `CanonicalPrincipalRef`; SM-04, SM-05 and
 * SM-09 all document that gap rather than each inventing a different answer to
 * it.
 */
function isValidIssuer(value: unknown): value is CanonicalIssuer {
  if (isNonBlankString(value)) return true;
  if (!isPlainObject(value)) return false;
  return isNonBlankString(value.id) && isNonBlankString(value.kind);
}

function isValidEvidenceRefs(value: unknown): value is readonly CanonicalEvidenceId[] {
  // `Array.from` densifies: `Array.prototype.every` skips holes, so a sparse
  // array from an untyped caller would otherwise pass and carry a missing
  // reference into a canonical claim.
  return Array.isArray(value) && Array.from(value).every((ref) => isNonBlankString(ref));
}

/**
 * Validates the capability-specific Licensing & Terms input, accumulating every
 * reason rather than reporting only the first, and never mutating what it was
 * given — no array is sorted, deduplicated, trimmed or frozen in place.
 *
 * Subject-dependent rules are deliberately *not* checked here: whether a
 * contested claim is about the invocation's subject is a question about the
 * pairing of an input with an invocation, and this function only sees the
 * input. The capsule applies it once the subject is known.
 */
export function validateLicensingTermsSovereigntyCapabilityInput(
  value: unknown,
): LicensingTermsSovereigntyCapabilityInputValidationResult {
  if (!isPlainObject(value)) {
    return { valid: false, reasons: [codes.invalidInput] };
  }

  const operation = value.operation;
  if (
    typeof operation !== 'string'
    || !(LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS as readonly string[]).includes(operation)
  ) {
    return { valid: false, reasons: [codes.unsupportedOperation] };
  }

  const reasons: LicensingTermsReasonCode[] = [];

  if (operation === 'declare-license-terms') {
    if (!isNonBlankString(value.claimId)) reasons.push(codes.invalidClaimId);
    if (!isValidIssuer(value.issuer)) reasons.push(codes.invalidIssuer);
    if (!isNonBlankString(value.statement)) reasons.push(codes.invalidStatement);
    if (!isValidSovereignLicenseTermsAudience(value.audience)) reasons.push(codes.invalidAudience);

    const rules = value.rules;
    if (!Array.isArray(rules) || rules.length === 0) {
      reasons.push(codes.rulesRequired);
    } else {
      const dense = Array.from(rules);
      const ids: string[] = [];
      for (const rule of dense) {
        reasons.push(...validateSovereignLicenseTermsRuleV1(rule));
        if (isPlainObject(rule) && typeof rule.id === 'string') ids.push(rule.id);
      }
      // Reported, never silently collapsed: two clauses under one id is a
      // malformed declaration, and quietly rewriting an issuer's declaration is
      // not Protocol's job.
      if (new Set(ids).size !== ids.length) reasons.push(codes.duplicateRuleId);
    }

    // A present-but-blank or present-but-`undefined` optional is a malformed
    // request rather than an absent value, matching every other optional in
    // this package.
    for (const key of ['issuedAt', 'effectiveAt', 'expiresAt'] as const) {
      if (hasOwn(value, key) && !isCanonicalTimestamp(value[key])) reasons.push(codes.invalidTimestamp);
    }
    if (hasOwn(value, 'evidenceRefs') && !isValidEvidenceRefs(value.evidenceRefs)) {
      reasons.push(codes.invalidEvidenceRefs);
    }
  }

  if (operation === 'validate-license-terms') {
    // The candidate is deliberately *not* checked here. "Is this a valid
    // licensing claim?" is the question the operation exists to answer, and
    // answering it during input validation would make an invalid candidate
    // indistinguishable from an unreadable request. Only the presence of
    // something to examine is required — `null`, `0` and `{}` are all
    // legitimate things to be asked about.
    if (!hasOwn(value, 'claim')) reasons.push(codes.invalidInput);
  }

  if (operation === 'contest-license-terms-claim') {
    if (!isNonBlankString(value.standingId)) reasons.push(codes.invalidStandingId);
    if (!isValidLicenseTermsClaim(value.claim)) reasons.push(codes.invalidClaim);
    if (!isNonBlankString(value.reason)) reasons.push(codes.invalidContestationReason);
    if (hasOwn(value, 'effectiveAt') && !isCanonicalTimestamp(value.effectiveAt)) {
      reasons.push(codes.invalidTimestamp);
    }
  }

  const distinct = [...new Set(reasons)];
  return { valid: distinct.length === 0, reasons: distinct };
}

export function isValidLicensingTermsSovereigntyCapabilityInput(
  value: unknown,
): value is LicensingTermsSovereigntyCapabilityInput {
  return validateLicensingTermsSovereigntyCapabilityInput(value).valid;
}

export interface LicensingTermsSovereigntyCapabilityImplementation
  extends SovereigntyCapabilityImplementation<
    LicensingTermsSovereigntyCapabilityInput,
    LicensingTermsSovereigntyCapabilityOutput
  > {}

/**
 * Builds the production AOC.LICENSING_TERMS capsule.
 *
 * A factory, for the injectable clock and so that importing this module
 * performs no work: nothing is registered, nothing is mutated, no global is
 * touched, no clock is read, no id is generated, no vocabulary is resolved and
 * no policy is evaluated at import time. There is no implementation registry —
 * the capsule is passed explicitly to `invokeSovereigntyCapability`, which is
 * the only supported way to execute it.
 *
 * Deterministic: the same subject, the same input and the same clock produce
 * the same claim, byte for byte. Claim ids and rule ids are caller-supplied and
 * the generated `semanticRefs` ids are derived from the claim id, so nothing
 * random or time-dependent reaches a document that is meant to be signed.
 */
export function createLicensingTermsSovereigntyCapabilityImplementation(
  options: CreateLicensingTermsSovereigntyCapabilityImplementationOptions = {},
): LicensingTermsSovereigntyCapabilityImplementation {
  const clock = options.clock ?? systemSovereigntyCapabilityClock;
  const capability: SovereigntyCapabilityRef = requireSovereigntyCapabilityRef('licensing_terms');

  return Object.freeze({
    capability,
    async invoke(
      invocation: SovereigntyCapabilityInvocation<LicensingTermsSovereigntyCapabilityInput>,
    ): Promise<SovereigntyCapabilityExecutionOutcome<LicensingTermsSovereigntyCapabilityOutput>> {
      const validation = validateLicensingTermsSovereigntyCapabilityInput(invocation.input);
      if (!validation.valid) {
        // A malformed *request* is an execution failure and produces no partial
        // claim — distinct from a malformed *candidate* under
        // `validate-license-terms`, which is a successful execution reporting
        // an invalid document.
        return { status: 'failed', reasonCodes: validation.reasons };
      }

      const input = invocation.input;

      switch (input.operation) {
        case 'declare-license-terms': {
          // An expected semantic refusal, not an exception: terms are declared
          // *over* an existing sovereign subject, and there is nothing to
          // declare them over. Minting one would make this capsule quietly
          // become AOC.IDENTITY.
          if (invocation.subject === undefined) {
            return { status: 'failed', reasonCodes: [codes.subjectRequired] };
          }

          return {
            status: 'succeeded',
            output: Object.freeze({
              operation: 'declare-license-terms' as const,
              claim: buildLicenseTermsClaim({
                id: input.claimId,
                // The subject is the invocation's and nothing else.
                sovereignAssetId: invocation.subject.sovereignAssetId,
                issuer: input.issuer,
                statement: input.statement,
                audience: input.audience,
                rules: input.rules,
                issuedAt: input.issuedAt ?? toUtcTimestamp(clock()),
                // Never defaulted, in either direction.
                ...(input.effectiveAt === undefined ? {} : { effectiveAt: input.effectiveAt }),
                ...(input.expiresAt === undefined ? {} : { expiresAt: input.expiresAt }),
                ...(input.evidenceRefs === undefined ? {} : { evidenceRefs: input.evidenceRefs }),
              }),
            }),
            // No subject is returned: Licensing never creates one, so SM-03's
            // precedence rule leaves the invocation's own subject — external
            // reference included — on the result and its evidence.
          };
        }

        case 'validate-license-terms': {
          const result = validateLicenseTermsClaim(input.claim);

          // The subject the *candidate* names, read off the document and only
          // when it is genuinely a valid sovereign identity. A candidate whose
          // identity cannot be read yields no subject at all — Protocol never
          // fabricates one to fill the gap.
          const rawSubject: unknown = isPlainObject(input.claim) ? input.claim.subject : undefined;
          const candidateSubject = isValidSovereignAssetId(rawSubject) ? rawSubject : undefined;

          // An explicitly supplied invocation subject is an assertion about
          // *which* document this is. When the candidate names a different one
          // the execution fails rather than reconciling them: reporting one
          // claim's validity under evidence attributed to another subject is
          // precisely the confusion this rejects. A candidate that names no
          // readable subject has nothing to disagree with, so it is reported as
          // the invalid document it is instead.
          if (
            invocation.subject !== undefined
            && candidateSubject !== undefined
            && invocation.subject.sovereignAssetId !== candidateSubject
          ) {
            return { status: 'failed', reasonCodes: [codes.claimSubjectMismatch] };
          }

          // Validation works with no invocation subject at all: a receiving
          // system holding only a document can still ask whether it is well
          // formed. When it is, the document's own subject becomes the result's
          // attribution.
          const attributedSubject: SovereignSubjectRef | undefined =
            invocation.subject === undefined && result.valid && candidateSubject !== undefined
              ? { sovereignAssetId: candidateSubject }
              : undefined;

          // Note the status for an invalid candidate: `succeeded`. The caller
          // asked whether the document is a valid licensing declaration and the
          // capability determined the answer — "no" is a successful validation.
          return {
            status: 'succeeded',
            output: Object.freeze({
              operation: 'validate-license-terms' as const,
              validation: Object.freeze({ valid: result.valid, reasons: Object.freeze([...result.reasons]) }),
            }),
            ...(attributedSubject === undefined ? {} : { subject: attributedSubject }),
          };
        }

        case 'contest-license-terms-claim': {
          if (invocation.subject === undefined) {
            return { status: 'failed', reasonCodes: [codes.subjectRequired] };
          }
          if (input.claim.subject !== invocation.subject.sovereignAssetId) {
            return { status: 'failed', reasonCodes: [codes.claimSubjectMismatch] };
          }

          return {
            status: 'succeeded',
            output: Object.freeze({
              operation: 'contest-license-terms-claim' as const,
              // Returned by reference, unmodified: contestation adds a record
              // beside history, it does not rewrite it.
              claim: input.claim,
              standing: contestClaim({
                id: input.standingId,
                claimRef: input.claim.id,
                reason: input.reason,
                effectiveAt: input.effectiveAt ?? toUtcTimestamp(clock()),
              }),
            }),
          };
        }
      }
    },
  });
}
