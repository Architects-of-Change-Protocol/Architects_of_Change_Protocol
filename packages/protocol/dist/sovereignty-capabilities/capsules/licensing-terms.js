"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS = void 0;
exports.validateLicensingTermsSovereigntyCapabilityInput = validateLicensingTermsSovereigntyCapabilityInput;
exports.isValidLicensingTermsSovereigntyCapabilityInput = isValidLicensingTermsSovereigntyCapabilityInput;
exports.createLicensingTermsSovereigntyCapabilityImplementation = createLicensingTermsSovereigntyCapabilityImplementation;
const timestamps_1 = require("../../claims/timestamps");
const identity_1 = require("../../identity");
const licensing_1 = require("../../licensing");
const licensing_2 = require("../../licensing");
const manifest_1 = require("../../manifest");
const time_1 = require("../time");
const canonical_ref_1 = require("./canonical-ref");
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
exports.LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS = Object.freeze([
    'declare-license-terms',
    'validate-license-terms',
    'contest-license-terms-claim',
]);
const codes = licensing_1.LICENSING_TERMS_REASON_CODES;
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Same structural floor as the claims layer's issuer rule: a non-blank string,
 * or an object with a non-blank `id` and `kind`. Protocol still has no fully
 * canonical runtime validator for `CanonicalPrincipalRef`; SM-04, SM-05 and
 * SM-09 all document that gap rather than each inventing a different answer to
 * it.
 */
function isValidIssuer(value) {
    if (isNonBlankString(value))
        return true;
    if (!isPlainObject(value))
        return false;
    return isNonBlankString(value.id) && isNonBlankString(value.kind);
}
function isValidEvidenceRefs(value) {
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
function validateLicensingTermsSovereigntyCapabilityInput(value) {
    if (!isPlainObject(value)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    const operation = value.operation;
    if (typeof operation !== 'string'
        || !exports.LICENSING_TERMS_SOVEREIGNTY_CAPABILITY_OPERATIONS.includes(operation)) {
        return { valid: false, reasons: [codes.unsupportedOperation] };
    }
    const reasons = [];
    if (operation === 'declare-license-terms') {
        if (!isNonBlankString(value.claimId))
            reasons.push(codes.invalidClaimId);
        if (!isValidIssuer(value.issuer))
            reasons.push(codes.invalidIssuer);
        if (!isNonBlankString(value.statement))
            reasons.push(codes.invalidStatement);
        if (!(0, licensing_2.isValidSovereignLicenseTermsAudience)(value.audience))
            reasons.push(codes.invalidAudience);
        const rules = value.rules;
        if (!Array.isArray(rules) || rules.length === 0) {
            reasons.push(codes.rulesRequired);
        }
        else {
            const dense = Array.from(rules);
            const ids = [];
            for (const rule of dense) {
                reasons.push(...(0, licensing_1.validateSovereignLicenseTermsRuleV1)(rule));
                if (isPlainObject(rule) && typeof rule.id === 'string')
                    ids.push(rule.id);
            }
            // Reported, never silently collapsed: two clauses under one id is a
            // malformed declaration, and quietly rewriting an issuer's declaration is
            // not Protocol's job.
            if (new Set(ids).size !== ids.length)
                reasons.push(codes.duplicateRuleId);
        }
        // A present-but-blank or present-but-`undefined` optional is a malformed
        // request rather than an absent value, matching every other optional in
        // this package.
        for (const key of ['issuedAt', 'effectiveAt', 'expiresAt']) {
            if (hasOwn(value, key) && !(0, timestamps_1.isCanonicalTimestamp)(value[key]))
                reasons.push(codes.invalidTimestamp);
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
        if (!hasOwn(value, 'claim'))
            reasons.push(codes.invalidInput);
    }
    if (operation === 'contest-license-terms-claim') {
        if (!isNonBlankString(value.standingId))
            reasons.push(codes.invalidStandingId);
        if (!(0, licensing_1.isValidLicenseTermsClaim)(value.claim))
            reasons.push(codes.invalidClaim);
        if (!isNonBlankString(value.reason))
            reasons.push(codes.invalidContestationReason);
        if (hasOwn(value, 'effectiveAt') && !(0, timestamps_1.isCanonicalTimestamp)(value.effectiveAt)) {
            reasons.push(codes.invalidTimestamp);
        }
    }
    const distinct = [...new Set(reasons)];
    return { valid: distinct.length === 0, reasons: distinct };
}
function isValidLicensingTermsSovereigntyCapabilityInput(value) {
    return validateLicensingTermsSovereigntyCapabilityInput(value).valid;
}
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
function createLicensingTermsSovereigntyCapabilityImplementation(options = {}) {
    const clock = options.clock ?? time_1.systemSovereigntyCapabilityClock;
    const capability = (0, canonical_ref_1.requireSovereigntyCapabilityRef)('licensing_terms');
    return Object.freeze({
        capability,
        async invoke(invocation) {
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
                            operation: 'declare-license-terms',
                            claim: (0, licensing_1.buildLicenseTermsClaim)({
                                id: input.claimId,
                                // The subject is the invocation's and nothing else.
                                sovereignAssetId: invocation.subject.sovereignAssetId,
                                issuer: input.issuer,
                                statement: input.statement,
                                audience: input.audience,
                                rules: input.rules,
                                issuedAt: input.issuedAt ?? (0, time_1.toUtcTimestamp)(clock()),
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
                    const result = (0, licensing_1.validateLicenseTermsClaim)(input.claim);
                    // The subject the *candidate* names, read off the document and only
                    // when it is genuinely a valid sovereign identity. A candidate whose
                    // identity cannot be read yields no subject at all — Protocol never
                    // fabricates one to fill the gap.
                    const rawSubject = isPlainObject(input.claim) ? input.claim.subject : undefined;
                    const candidateSubject = (0, identity_1.isValidSovereignAssetId)(rawSubject) ? rawSubject : undefined;
                    // An explicitly supplied invocation subject is an assertion about
                    // *which* document this is. When the candidate names a different one
                    // the execution fails rather than reconciling them: reporting one
                    // claim's validity under evidence attributed to another subject is
                    // precisely the confusion this rejects. A candidate that names no
                    // readable subject has nothing to disagree with, so it is reported as
                    // the invalid document it is instead.
                    if (invocation.subject !== undefined
                        && candidateSubject !== undefined
                        && invocation.subject.sovereignAssetId !== candidateSubject) {
                        return { status: 'failed', reasonCodes: [codes.claimSubjectMismatch] };
                    }
                    // Validation works with no invocation subject at all: a receiving
                    // system holding only a document can still ask whether it is well
                    // formed. When it is, the document's own subject becomes the result's
                    // attribution.
                    const attributedSubject = invocation.subject === undefined && result.valid && candidateSubject !== undefined
                        ? { sovereignAssetId: candidateSubject }
                        : undefined;
                    // Note the status for an invalid candidate: `succeeded`. The caller
                    // asked whether the document is a valid licensing declaration and the
                    // capability determined the answer — "no" is a successful validation.
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'validate-license-terms',
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
                            operation: 'contest-license-terms-claim',
                            // Returned by reference, unmodified: contestation adds a record
                            // beside history, it does not rewrite it.
                            claim: input.claim,
                            standing: (0, manifest_1.contestClaim)({
                                id: input.standingId,
                                claimRef: input.claim.id,
                                reason: input.reason,
                                effectiveAt: input.effectiveAt ?? (0, time_1.toUtcTimestamp)(clock()),
                            }),
                        }),
                    };
                }
            }
        },
    });
}
