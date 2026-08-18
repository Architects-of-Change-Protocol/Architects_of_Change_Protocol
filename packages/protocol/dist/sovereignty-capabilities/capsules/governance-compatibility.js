"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = void 0;
exports.validateGovernanceCompatibilitySovereigntyCapabilityInput = validateGovernanceCompatibilitySovereigntyCapabilityInput;
exports.isValidGovernanceCompatibilitySovereigntyCapabilityInput = isValidGovernanceCompatibilitySovereigntyCapabilityInput;
exports.createGovernanceCompatibilitySovereigntyCapabilityImplementation = createGovernanceCompatibilitySovereigntyCapabilityImplementation;
const governance_compatibility_1 = require("../../governance-compatibility");
const portability_1 = require("../../portability");
const canonical_ref_1 = require("./canonical-ref");
/**
 * AOC.GOVERNANCE_COMPATIBILITY — the production Sovereignty Capability capsule
 * that answers:
 *
 *   "What does an external governance system need in order to address and
 *    interpret this sovereign subject — and how does the Protocol supply it
 *    without becoming that governance system?"
 *
 * It is the eighth and last of the canonical eight to become a real
 * implementation of the SM-03 socket, and it is the mineral that defines where
 * the Protocol ends. The handoff data contracts — the generic sovereign
 * resource kind, the `ResourceRef` projection, `SovereignGovernanceHandoffV1`,
 * its builder and its validator — live in
 * `@aoc/protocol/governance-compatibility`; this capsule is what makes
 * preparing and validating a handoff ordinary capability invocations producing
 * capability-attributed evidence.
 *
 * ## Two operations, deliberately
 *
 *   prepare-governance-handoff    representation (+ tenant) -> handoff
 *   validate-governance-handoff   candidate document        -> validation report
 *
 * That is the whole surface. There is deliberately no `evaluate`, `authorize`,
 * `decide`, `approve`, `grant` or `enforce` operation, because each of those is
 * a governance act rather than a projection of sovereign state, and adding one
 * would put the Protocol on the far side of the boundary this mineral exists to
 * draw.
 *
 * ## What a successful prepare means
 *
 * That a structurally valid handoff exists — no more. It does not mean allow,
 * deny, approved, complete, sufficient, ready or governable. There is no
 * readiness flag in the output for the same reason there is no completeness
 * flag: the Protocol cannot know what artifacts exist beyond the ones it was
 * handed, and cannot know what a policy it has never seen requires.
 *
 * ## What this capsule never does
 *
 * - **Invoke another mineral.** `invokeSovereigntyCapability` is not called
 *   here at all. The SM-06 bundle validator and the SM-07 descriptor helper are
 *   reused as *pure libraries*, which is why preparing a handoff produces
 *   exactly one evidence record rather than a hidden chain of them. A caller
 *   who wants Verifiability run over the artifacts inside a representation
 *   invokes AOC.VERIFIABILITY itself, and that invocation appears in the
 *   caller's own evidence where it belongs.
 * - **Verify.** No signature is checked, no key is resolved, no issuer is
 *   bound. A representation carrying a structurally intact but cryptographically
 *   tampered proof prepares successfully, and AOC.VERIFIABILITY independently
 *   reports `valid: false` for the same artifact. Those two facts are supposed
 *   to be able to coexist: conflating them would make "handed to governance"
 *   silently read as "cryptographically sound".
 * - **Adjudicate.** A `Contested` standing travels through unchanged. So does a
 *   `Permission` and a `Restriction` over the same action. There is no winner,
 *   no precedence, no `resolvedTerms`, no allow and no deny — a governance
 *   engine may need to decide *precisely because* something is contested or
 *   contradictory, and resolving it here would destroy the input it needs.
 * - **Translate terms into policy.** A declared `Permission` does not become a
 *   grant or a scope, a `Restriction` does not become a deny, and an
 *   `Obligation` does not acquire a pending/fulfilled/violated status. SM-09
 *   declares; governance interprets.
 * - **Produce authority.** No `CanonicalCapability`, `CanonicalAuthority` or
 *   `CanonicalDecision` is constructed, and none is inferred from a registrant,
 *   a claim issuer, a license issuer or a valid signature. The trust chain runs
 *   evidence -> assertion -> claim -> attestation -> verification -> standing ->
 *   capability -> authority -> decision, and this mineral must not jump from
 *   its left half to its right half.
 * - **Grant or request access.** No `PolicyDecision`, `ScopedAccessRequest`,
 *   `CapabilityToken`, `CapabilityGrant`, `ConsentGrant` or `Delegation` is
 *   created. A handoff is object/state context; an access request is an
 *   actor/action event; they are different concepts and neither implies the
 *   other.
 * - **Mint, hash, or assert.** No `mintSovereignAssetId`, no content bytes, no
 *   digest computation, no origin, authorship or derivation claim.
 * - **Reach outside.** No network, filesystem, database, cache, registry,
 *   provider SDK or blockchain. No global mutable state and no import-time side
 *   effect. The handoff is returned, never persisted.
 * - **Branch on the subject.** No namespace, asset type or business domain is
 *   read, and `subject.externalReference.namespace` is opaque. A byte document,
 *   a physical painting, a plot of land, an external token, an autonomous
 *   agent, an API resource and a subject from a system nobody has heard of all
 *   project through exactly the same code, onto exactly the same resource kind.
 */
/** The operations AOC.GOVERNANCE_COMPATIBILITY 1.0.0 supports. Closed for this version. */
exports.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = Object.freeze([
    'prepare-governance-handoff',
    'validate-governance-handoff',
]);
/**
 * The reason codes this capsule reports.
 *
 * The **same** frozen constant as the contract layer's, not a capsule-local
 * copy: Governance Compatibility's structural codes are meaningful on their own
 * — a caller can validate a handoff without ever constructing a capsule — so
 * both readers share one vocabulary instead of two spellings drifting apart.
 */
exports.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = governance_compatibility_1.SOVEREIGN_GOVERNANCE_COMPATIBILITY_REASON_CODES;
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Validates the capability-specific Governance Compatibility input.
 *
 * This checks the *operation envelope* only — that the operation is one this
 * capability version supports, and that the document it names is present as an
 * object. It deliberately does not restate the representation or handoff rules:
 * those belong to the real validators in
 * `@aoc/protocol/governance-compatibility` and `@aoc/protocol/portability`, a
 * second copy of them here would be a drift source, and the capsule applies
 * them by running those validators and reporting their reasons verbatim.
 *
 * `handoff` is deliberately *not* required to be an object: validating a
 * malformed candidate is the whole point of that operation, and `null`, a
 * string or an array is a perfectly ordinary thing to be asked about.
 */
function validateGovernanceCompatibilitySovereigntyCapabilityInput(value) {
    const codes = exports.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
    if (!isPlainObject(value)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    const operation = value.operation;
    if (typeof operation !== 'string'
        || !exports.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS.includes(operation)) {
        return { valid: false, reasons: [codes.unsupportedOperation] };
    }
    if (operation === 'prepare-governance-handoff' && !isPlainObject(value.representation)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    if (operation === 'validate-governance-handoff' && !hasOwn(value, 'handoff')) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    return { valid: true, reasons: [] };
}
function isValidGovernanceCompatibilitySovereigntyCapabilityInput(value) {
    return validateGovernanceCompatibilitySovereigntyCapabilityInput(value).valid;
}
/**
 * Builds the production AOC.GOVERNANCE_COMPATIBILITY capsule.
 *
 * A factory, so importing this module performs no work: no registry is touched,
 * no global is written, no clock is read and no id is generated at import time.
 * There is no implementation registry, no governed-resource registry and no
 * handoff registry — the capsule is passed explicitly to
 * `invokeSovereigntyCapability`, and a handoff is returned to its caller rather
 * than stored anywhere.
 *
 * No options are needed because neither operation reads the clock or reaches
 * outside: both are deterministic functions of their inputs, and *when* a
 * projection or a validation happened is recorded truthfully in the invocation
 * evidence instead. There is likewise no retry policy, because there is no
 * external dependency that could fail.
 */
function createGovernanceCompatibilitySovereigntyCapabilityImplementation() {
    const capability = (0, canonical_ref_1.requireSovereigntyCapabilityRef)('governance_compatibility');
    return Object.freeze({
        capability,
        async invoke(invocation) {
            const codes = exports.GOVERNANCE_COMPATIBILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
            const validation = validateGovernanceCompatibilitySovereigntyCapabilityInput(invocation.input);
            if (!validation.valid) {
                return { status: 'failed', reasonCodes: validation.reasons };
            }
            const input = invocation.input;
            if (input.operation === 'prepare-governance-handoff') {
                // The representation is checked before anything is read off it, so a
                // malformed one is a *failed execution* — the caller asked for a
                // projection that cannot be made — rather than a partial handoff.
                const representationValidation = (0, portability_1.validateSovereigntyPortabilityBundleV1)(input.representation);
                if (!representationValidation.valid) {
                    return { status: 'failed', reasonCodes: [codes.invalidRepresentation] };
                }
                // An explicitly supplied subject is an assertion about which
                // representation this is. It is checked before the handoff is composed,
                // never reconciled, so a mismatch produces no document at all.
                if (invocation.subject !== undefined
                    && !(0, governance_compatibility_1.sovereignGovernanceSubjectsEqual)(invocation.subject, input.representation.subject)) {
                    return { status: 'failed', reasonCodes: [codes.subjectMismatch] };
                }
                const built = (0, governance_compatibility_1.tryBuildSovereignGovernanceHandoffV1)(input.tenantId === undefined
                    ? { representation: input.representation }
                    : { representation: input.representation, tenantId: input.tenantId });
                if (!built.valid) {
                    return { status: 'failed', reasonCodes: built.reasons };
                }
                return {
                    status: 'succeeded',
                    output: Object.freeze({
                        operation: 'prepare-governance-handoff',
                        handoff: built.handoff,
                    }),
                    // The EXISTING subject the representation is about, stated explicitly
                    // so a subjectless prepare still resolves the common result and
                    // evidence onto it. Nothing was minted: this is the same
                    // `SovereignAssetId` the representation arrived with.
                    subject: built.handoff.subject,
                };
            }
            const handoffValidation = (0, governance_compatibility_1.validateSovereignGovernanceHandoffV1)(input.handoff);
            // Note what this returns for an invalid candidate: `succeeded`. The caller
            // asked whether this document is a valid governance handoff, and the
            // capability determined the answer — "no" is a successful validation,
            // exactly as an Integrity check that correctly reports a digest mismatch
            // has successfully checked. Reporting a capability failure here would make
            // "the question could not be answered" indistinguishable from "the answer
            // was negative".
            if (!handoffValidation.valid) {
                return {
                    status: 'succeeded',
                    output: Object.freeze({
                        operation: 'validate-governance-handoff',
                        validation: Object.freeze({ valid: false, reasons: handoffValidation.reasons }),
                    }),
                    // No subject is stated for an invalid candidate. Reading one out of a
                    // malformed payload would be fabricating attribution from a document
                    // that just failed validation; SM-03's precedence rule then attributes
                    // the evidence to the invocation's own subject, if it had one.
                };
            }
            const handoff = input.handoff;
            // A mismatch here is an attribution error, not ordinary handoff
            // invalidity: the document is a perfectly valid handoff, it is simply not
            // about the subject the caller said it was. That is a question the
            // capability could not answer, so it fails rather than reporting the
            // document invalid.
            if (invocation.subject !== undefined
                && !(0, governance_compatibility_1.sovereignGovernanceSubjectsEqual)(invocation.subject, handoff.subject)) {
                return { status: 'failed', reasonCodes: [codes.subjectMismatch] };
            }
            return {
                status: 'succeeded',
                output: Object.freeze({
                    operation: 'validate-governance-handoff',
                    validation: Object.freeze({ valid: true, reasons: handoffValidation.reasons }),
                }),
                subject: handoff.subject,
            };
        },
    });
}
