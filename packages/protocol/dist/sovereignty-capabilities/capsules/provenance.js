"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES = void 0;
exports.validateProvenanceSovereigntyCapabilityInput = validateProvenanceSovereigntyCapabilityInput;
exports.isValidProvenanceSovereigntyCapabilityInput = isValidProvenanceSovereigntyCapabilityInput;
exports.createProvenanceSovereigntyCapabilityImplementation = createProvenanceSovereigntyCapabilityImplementation;
const timestamps_1 = require("../../claims/timestamps");
const identity_1 = require("../../identity");
const manifest_1 = require("../../manifest");
const time_1 = require("../time");
const canonical_ref_1 = require("./canonical-ref");
/**
 * AOC.PROVENANCE — the production Sovereignty Capability capsule that answers:
 *
 *   "What does someone assert about where this sovereign subject came from,
 *    who claims to have authored it, what it derives from — and does anyone
 *    dispute that?"
 *
 * It is the third of the canonical eight to become a real implementation of
 * the SM-03 socket. Origin, authorship, signing and contestation primitives
 * already existed in `@aoc/protocol/manifest` and are reused verbatim
 * (`buildOriginClaim`, `buildAuthorityClaim`, `contestClaim`). What SM-05 adds
 * underneath is the one genuinely missing piece: a first-class
 * `DerivationClaim`, so a derivation relationship between sovereign subjects
 * is machine-identifiable rather than buried in free text.
 *
 * ## Assertions, not history
 *
 * Every operation here records what an issuer *asserts*. Protocol does not
 * determine whether the assertion is historically true, whether the issuer
 * owns anything, whether copyright exists, whether a derivation was legally
 * authorized, whether a licence was breached, or whether a court would accept
 * any of it:
 *
 *     provenance assertion ≠ historical truth
 *     provenance assertion ≠ legal ownership
 *     derivation relation  ≠ permission to derive
 *     signature            ≠ truth
 *
 * A caller asserting something disputable is therefore an ordinary *success*,
 * not a capability failure — the assertion was well formed and was recorded.
 * Disagreement is expressed by contesting the claim, which records that a
 * challenge exists without deciding who is right.
 *
 * ## What this capsule deliberately does not do
 *
 * - **Create identity.** It never calls `mintSovereignAssetId`. Provenance
 *   operates on subjects that already exist, so `invocation.subject` is
 *   required rather than minted — see `PROVENANCE_SUBJECT_REQUIRED`.
 * - **Compute or require integrity.** No bytes, no `ContentIdentity`, no
 *   manifest digest. A building, a legal entity or an API resource with no
 *   byte representation receives provenance exactly like a file does.
 * - **Sign or verify anything.** `signClaim`, `verifySignedClaim`,
 *   `signSovereignManifest`, key generation and signature verification are
 *   AOC.VERIFIABILITY's contract and none of them are called here. The claims
 *   this capsule returns are ordinary unsigned canonical records; a caller who
 *   wants cryptographic attribution passes one through those primitives, which
 *   remain public and unchanged.
 * - **Mutate a manifest.** Claims are appendable assertions. Nothing here
 *   rewrites `SovereignManifestV1` to insert a claim, and contesting a claim
 *   does not set a manifest's lifecycle state to disputed — a hidden state
 *   change is not a provenance record.
 * - **Infer anything along an edge.** A derivation copies no licence, rights,
 *   obligations, authority, authorship, evidence or governance policy from
 *   source to child. Those belong to AOC.LICENSING_TERMS and
 *   AOC.GOVERNANCE_COMPATIBILITY.
 * - **Touch the outside world.** `assertedOrigin` is an assertion value, never
 *   dereferenced even when it looks like a URL. No network, provider, chain,
 *   registry, database or filesystem access, and no key or credential input.
 *
 * ## Why licence and generic authority kinds are not exposed
 *
 * `AuthorityClaimKind` includes `Rights`, `License` and `Custom`, and the
 * low-level `buildAuthorityClaim` primitive still offers all of them. The
 * formal Provenance capsule exposes only `declare-authorship`, with the kind
 * fixed to `Authorship`. Offering licence creation as a headline Provenance
 * operation would blur the boundary with AOC.LICENSING_TERMS before that
 * mineral exists, and a generic declare-any-authority-kind operation would
 * make this capsule an authority factory rather than a provenance capsule.
 */
/** Stable, machine-readable reason codes this capsule can report. */
exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES = Object.freeze({
    /**
     * No sovereign subject was named. Provenance describes something that
     * already exists, and minting an identity to have something to describe
     * would make this capsule quietly become AOC.IDENTITY.
     */
    subjectRequired: 'PROVENANCE_SUBJECT_REQUIRED',
    invalidInput: 'PROVENANCE_INVALID_INPUT',
    unsupportedOperation: 'PROVENANCE_UNSUPPORTED_OPERATION',
    invalidClaimId: 'PROVENANCE_INVALID_CLAIM_ID',
    invalidStandingId: 'PROVENANCE_INVALID_STANDING_ID',
    invalidIssuer: 'PROVENANCE_INVALID_ISSUER',
    invalidOrigin: 'PROVENANCE_INVALID_ORIGIN',
    invalidAuthorshipStatement: 'PROVENANCE_INVALID_AUTHORSHIP_STATEMENT',
    derivationSourcesRequired: 'PROVENANCE_DERIVATION_SOURCES_REQUIRED',
    invalidSourceSubject: 'PROVENANCE_INVALID_SOURCE_SUBJECT',
    duplicateDerivationSource: 'PROVENANCE_DUPLICATE_DERIVATION_SOURCE',
    /** The invocation subject appeared among its own asserted sources. */
    derivationSelfReference: 'PROVENANCE_DERIVATION_SELF_REFERENCE',
    invalidDerivationRelation: 'PROVENANCE_INVALID_DERIVATION_RELATION',
    invalidStatement: 'PROVENANCE_INVALID_STATEMENT',
    invalidTimestamp: 'PROVENANCE_INVALID_TIMESTAMP',
    invalidEvidenceRefs: 'PROVENANCE_INVALID_EVIDENCE_REFS',
    invalidProvenanceClaim: 'PROVENANCE_INVALID_PROVENANCE_CLAIM',
    /** The claim being contested is about a different subject than the invocation. */
    claimSubjectMismatch: 'PROVENANCE_CLAIM_SUBJECT_MISMATCH',
    invalidContestationReason: 'PROVENANCE_INVALID_CONTESTATION_REASON',
    invalidLineageData: 'PROVENANCE_INVALID_LINEAGE_DATA',
    invalidLineageDirection: 'PROVENANCE_INVALID_LINEAGE_DIRECTION',
    invalidMaxDepth: 'PROVENANCE_INVALID_MAX_DEPTH',
});
/**
 * The operations AOC.PROVENANCE 1.0.0 supports. Closed for this capability
 * version: an unrecognized operation is reported rather than guessed at.
 */
exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS = Object.freeze([
    'declare-origin',
    'declare-authorship',
    'record-derivation',
    'contest-provenance-claim',
    'trace-lineage',
]);
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Same structural floor as the claims layer's issuer rule: a non-blank string,
 * or an object with a non-blank `id` and `kind`. Protocol still has no fully
 * canonical runtime validator for `CanonicalPrincipalRef` — SM-04 recorded the
 * same gap for `SovereignRegistrant`, and SM-05 documents rather than closes
 * it, because redesigning the principal model is neither work package's job.
 */
function isValidIssuer(value) {
    if (isNonBlankString(value))
        return true;
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return false;
    const candidate = value;
    return isNonBlankString(candidate.id) && isNonBlankString(candidate.kind);
}
function isValidEvidenceRefs(value) {
    return Array.isArray(value) && value.every((ref) => isNonBlankString(ref));
}
function claimBaseReasons(candidate) {
    const codes = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES;
    const reasons = [];
    if (!isNonBlankString(candidate.claimId))
        reasons.push(codes.invalidClaimId);
    if (!isValidIssuer(candidate.issuer))
        reasons.push(codes.invalidIssuer);
    if (hasOwn(candidate, 'issuedAt') && !(0, timestamps_1.isCanonicalTimestamp)(candidate.issuedAt)) {
        reasons.push(codes.invalidTimestamp);
    }
    if (hasOwn(candidate, 'evidenceRefs') && !isValidEvidenceRefs(candidate.evidenceRefs)) {
        reasons.push(codes.invalidEvidenceRefs);
    }
    return reasons;
}
/**
 * Validates the capability-specific Provenance input, accumulating every
 * reason rather than reporting only the first, and never mutating what it was
 * given — no array is sorted, deduplicated, trimmed or frozen in place.
 *
 * Subject-dependent rules are deliberately *not* checked here: whether the
 * child appears among its own sources, and whether a contested claim is about
 * the invocation's subject, are questions about the pairing of an input with
 * an invocation, and this function only sees the input. The capsule applies
 * them once the subject is known.
 */
function validateProvenanceSovereigntyCapabilityInput(value) {
    const codes = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES;
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    const operation = value.operation;
    if (typeof operation !== 'string'
        || !exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_OPERATIONS.includes(operation)) {
        return { valid: false, reasons: [codes.unsupportedOperation] };
    }
    const reasons = [];
    if (operation === 'declare-origin') {
        const candidate = value;
        reasons.push(...claimBaseReasons(candidate));
        if (!isNonBlankString(candidate.assertedOrigin))
            reasons.push(codes.invalidOrigin);
    }
    if (operation === 'declare-authorship') {
        const candidate = value;
        reasons.push(...claimBaseReasons(candidate));
        if (!isNonBlankString(candidate.statement))
            reasons.push(codes.invalidAuthorshipStatement);
    }
    if (operation === 'record-derivation') {
        const candidate = value;
        reasons.push(...claimBaseReasons(candidate));
        const sources = candidate.sourceSovereignAssetIds;
        if (!Array.isArray(sources) || sources.length === 0) {
            reasons.push(codes.derivationSourcesRequired);
        }
        else {
            if (!sources.every((source) => (0, identity_1.isValidSovereignAssetId)(source))) {
                reasons.push(codes.invalidSourceSubject);
            }
            // Reported, never silently collapsed: `[A, A, B]` is a malformed
            // assertion, and quietly rewriting a caller's assertion is not
            // Protocol's job.
            if (new Set(sources).size !== sources.length) {
                reasons.push(codes.duplicateDerivationSource);
            }
        }
        if (!manifest_1.DERIVATION_RELATION_KINDS.includes(candidate.relation)) {
            reasons.push(codes.invalidDerivationRelation);
        }
        if (hasOwn(candidate, 'statement') && !isNonBlankString(candidate.statement)) {
            reasons.push(codes.invalidStatement);
        }
        if (hasOwn(candidate, 'occurredAt') && !(0, timestamps_1.isCanonicalTimestamp)(candidate.occurredAt)) {
            reasons.push(codes.invalidTimestamp);
        }
    }
    if (operation === 'contest-provenance-claim') {
        const candidate = value;
        if (!isNonBlankString(candidate.standingId))
            reasons.push(codes.invalidStandingId);
        if (!(0, manifest_1.isValidOriginClaim)(candidate.claim)
            && !(0, manifest_1.isValidAuthorityClaim)(candidate.claim)
            && !(0, manifest_1.isValidDerivationClaim)(candidate.claim)) {
            reasons.push(codes.invalidProvenanceClaim);
        }
        if (!isNonBlankString(candidate.reason))
            reasons.push(codes.invalidContestationReason);
        if (hasOwn(candidate, 'effectiveAt') && !(0, timestamps_1.isCanonicalTimestamp)(candidate.effectiveAt)) {
            reasons.push(codes.invalidTimestamp);
        }
    }
    if (operation === 'trace-lineage') {
        const candidate = value;
        if (!manifest_1.SOVEREIGN_LINEAGE_DIRECTIONS.includes(candidate.direction)) {
            reasons.push(codes.invalidLineageDirection);
        }
        // The dataset is judged here; the *root* is not, because it comes from the
        // invocation rather than the input and this function only sees the input.
        // Malformed or ambiguous claims fail closed rather than being skipped: a
        // lineage silently computed from the readable half of a dataset would look
        // exactly like a complete one.
        const claims = candidate.derivationClaims;
        if (!Array.isArray(claims) || !claims.every((claim) => (0, manifest_1.isValidDerivationClaim)(claim))) {
            reasons.push(codes.invalidLineageData);
        }
        else {
            const ids = claims.map((claim) => claim.id);
            if (new Set(ids).size !== ids.length)
                reasons.push(codes.invalidLineageData);
        }
        if (hasOwn(candidate, 'maxDepth') && !(0, manifest_1.isValidSovereignLineageMaxDepth)(candidate.maxDepth)) {
            reasons.push(codes.invalidMaxDepth);
        }
    }
    return { valid: reasons.length === 0, reasons };
}
function isValidProvenanceSovereigntyCapabilityInput(value) {
    return validateProvenanceSovereigntyCapabilityInput(value).valid;
}
/**
 * Builds the production AOC.PROVENANCE capsule.
 *
 * A factory, for the injectable clock and so that importing this module
 * performs no work: nothing is registered, nothing is mutated, no global is
 * touched and no id is generated at import time. There is no implementation
 * registry — the capsule is passed explicitly to `invokeSovereigntyCapability`,
 * which is the only supported way to execute it.
 */
function createProvenanceSovereigntyCapabilityImplementation(options = {}) {
    const clock = options.clock ?? time_1.systemSovereigntyCapabilityClock;
    const capability = (0, canonical_ref_1.requireSovereigntyCapabilityRef)('provenance');
    return Object.freeze({
        capability,
        async invoke(invocation) {
            const codes = exports.PROVENANCE_SOVEREIGNTY_CAPABILITY_REASON_CODES;
            // An expected semantic refusal, not an exception: provenance is *about*
            // an existing sovereign subject, and there is nothing to be about.
            if (invocation.subject === undefined) {
                return { status: 'failed', reasonCodes: [codes.subjectRequired] };
            }
            const validation = validateProvenanceSovereigntyCapabilityInput(invocation.input);
            if (!validation.valid) {
                return { status: 'failed', reasonCodes: validation.reasons };
            }
            const subjectId = invocation.subject.sovereignAssetId;
            const input = invocation.input;
            // Past this point the input is valid, so the claim builders are expected
            // to succeed. If one throws anyway that is a programming or runtime
            // fault and it propagates: SM-03 turns it into a typed implementation
            // fault with sanitized evidence rather than a misleading ordinary
            // capability failure, and nothing is retried.
            switch (input.operation) {
                case 'declare-origin':
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'declare-origin',
                            claim: (0, manifest_1.buildOriginClaim)({
                                id: input.claimId,
                                sovereignAssetId: subjectId,
                                issuer: input.issuer,
                                assertedOrigin: input.assertedOrigin,
                                assertedAt: input.issuedAt ?? (0, time_1.toUtcTimestamp)(clock()),
                                ...(input.evidenceRefs === undefined ? {} : { evidenceRefs: input.evidenceRefs }),
                            }),
                        }),
                        // No subject is returned: Provenance never creates one, so SM-03's
                        // precedence rule leaves the invocation's own subject on the
                        // result and its evidence.
                    };
                case 'declare-authorship':
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'declare-authorship',
                            claim: (0, manifest_1.buildAuthorityClaim)({
                                id: input.claimId,
                                sovereignAssetId: subjectId,
                                issuer: input.issuer,
                                // Fixed, not caller-selectable. See the licence/authority note
                                // in this module's header.
                                kind: manifest_1.AuthorityClaimKind.Authorship,
                                statement: input.statement,
                                issuedAt: input.issuedAt ?? (0, time_1.toUtcTimestamp)(clock()),
                                ...(input.evidenceRefs === undefined ? {} : { evidenceRefs: input.evidenceRefs }),
                            }),
                        }),
                    };
                case 'record-derivation': {
                    // The only self-reference a single claim can honestly rule out. It
                    // does *not* follow that the wider lineage graph is acyclic: the
                    // rest of the graph was never supplied, and claiming otherwise from
                    // one assertion would be false. Cycles across several claims are a
                    // finding of `trace-lineage` over a supplied dataset.
                    if (input.sourceSovereignAssetIds.includes(subjectId)) {
                        return { status: 'failed', reasonCodes: [codes.derivationSelfReference] };
                    }
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'record-derivation',
                            claim: (0, manifest_1.buildDerivationClaim)({
                                id: input.claimId,
                                // The child is the invocation subject and nothing else.
                                sovereignAssetId: subjectId,
                                issuer: input.issuer,
                                sourceSovereignAssetIds: input.sourceSovereignAssetIds,
                                relation: input.relation,
                                ...(input.statement === undefined ? {} : { statement: input.statement }),
                                ...(input.occurredAt === undefined ? {} : { occurredAt: input.occurredAt }),
                                issuedAt: input.issuedAt ?? (0, time_1.toUtcTimestamp)(clock()),
                                ...(input.evidenceRefs === undefined ? {} : { evidenceRefs: input.evidenceRefs }),
                            }),
                        }),
                    };
                }
                case 'contest-provenance-claim': {
                    if (input.claim.subject !== subjectId) {
                        return { status: 'failed', reasonCodes: [codes.claimSubjectMismatch] };
                    }
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'contest-provenance-claim',
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
                case 'trace-lineage':
                    // A cycle in the supplied data is an analysis *result*, not an
                    // execution failure — the caller asked what the graph looks like and
                    // is being told, accurately, that it loops.
                    return {
                        status: 'succeeded',
                        output: Object.freeze({
                            operation: 'trace-lineage',
                            trace: (0, manifest_1.traceSovereignLineage)({
                                rootSovereignAssetId: subjectId,
                                direction: input.direction,
                                derivationClaims: input.derivationClaims,
                                ...(input.maxDepth === undefined ? {} : { maxDepth: input.maxDepth }),
                            }),
                        }),
                    };
            }
        },
    });
}
