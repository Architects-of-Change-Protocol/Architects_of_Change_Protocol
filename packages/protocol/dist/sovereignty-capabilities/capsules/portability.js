"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = void 0;
exports.validatePortabilitySovereigntyCapabilityInput = validatePortabilitySovereigntyCapabilityInput;
exports.isValidPortabilitySovereigntyCapabilityInput = isValidPortabilitySovereigntyCapabilityInput;
exports.createPortabilitySovereigntyCapabilityImplementation = createPortabilitySovereigntyCapabilityImplementation;
const identity_1 = require("../../identity");
const portability_1 = require("../../portability");
const canonical_ref_1 = require("./canonical-ref");
/**
 * AOC.PORTABILITY — the production Sovereignty Capability capsule that answers:
 *
 *   "Can this subject's sovereign representation leave the system it is
 *    currently used in, and remain the SAME sovereign representation
 *    elsewhere?"
 *
 * It is the fourth of the canonical eight to become a real implementation of
 * the SM-03 socket. The portable data contract itself lives in
 * `@aoc/protocol/portability`; this capsule is what makes export and import
 * ordinary capability invocations producing capability-attributed evidence.
 *
 * ## Two operations, deliberately
 *
 *   export-bundle   supplied artifacts        → canonical bundle + wire string
 *   import-bundle   canonical wire string     → canonical bundle + its subject
 *
 * That is the whole surface. There is no file manager, no directory listing, no
 * partial patch, no diff, no merge and no sync: each of those would be a
 * lifecycle or reconciliation semantic that portability does not own.
 *
 * ## What this capsule never does
 *
 * - **Mint identity.** `mintSovereignAssetId` is not called, on either
 *   operation. Export transports an existing `SovereignAssetId`; import returns
 *   the one that arrived in the bundle. Export therefore requires
 *   `invocation.subject` rather than creating one.
 * - **Persist or register.** No `SovereignAssetRegistry` is injected, nothing
 *   is written to a database, a filesystem or a provider. Import means "this
 *   canonical AOC representation was accepted and reconstructed in memory" —
 *   storing it afterwards is the consumer's infrastructure decision, and
 *   registry persistence would additionally have made *signing* a precondition
 *   of portability, since `SovereignAssetRegistry.register` takes a
 *   `SignedSovereignManifest` while AOC.IDENTITY produces unsigned ones.
 * - **Verify or sign.** `verifySignedClaim`, `verifySovereignManifest`,
 *   `verifySovereignSignature`, `signClaim` and `signSovereignManifest` are not
 *   called. Supplied proof material is preserved exactly — public key,
 *   signature, payload hash, timestamps and digests — and judged later by
 *   whoever is entitled to judge it. Portability preserves proof; Verifiability
 *   interprets it, and "portable" never means "verified".
 * - **Compute integrity.** `computeContentIdentity` and `computeManifestDigest`
 *   are not called, and a supplied `manifestDigest` is never "fixed". Integrity
 *   over a bundle is explicit composition: serialize, then invoke
 *   AOC.INTEGRITY over the bytes.
 * - **Create provenance.** Moving a bundle from one system to another asserts
 *   no origin, authorship, derivation or custody. Transport history is not
 *   sovereign provenance.
 * - **Transfer anything.** Exporting conveys no ownership, title, rights,
 *   custody or authority, and importing conveys none either. Possession of a
 *   bundle is possession of data.
 * - **Touch the outside world.** No fetch, no upload, no download, no IPFS, no
 *   S3, no chain RPC. `externalReference.locator` is carried verbatim and never
 *   dereferenced, and no key material, credential or secret is accepted.
 * - **Discover artifacts.** Export bundles what the caller supplied and never
 *   queries a registry, index, provider or Enterprise service to "complete" the
 *   set — Protocol has no universal claim registry and could not guarantee
 *   completeness if it tried. Explicit input is the honest contract.
 * - **Recurse.** A `DerivationClaim` naming sources A and B is transported with
 *   those references intact; bundles for A and B are not fetched, built or
 *   implied. Exporting one subject never expands into exporting a graph.
 */
/** The operations AOC.PORTABILITY 1.0.0 supports. Closed for this version. */
exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS = Object.freeze([
    'export-bundle',
    'import-bundle',
]);
/**
 * Stable, machine-readable reason codes this capsule can report.
 *
 * The bundle-level codes are not restated here: they are spread in from
 * `@aoc/protocol/portability`'s single map, so the code a consumer sees for a
 * duplicate manifest version is identical whether it came from the bundle
 * validator, the parser, or a failed capability invocation.
 */
exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES = Object.freeze({
    ...portability_1.SOVEREIGNTY_PORTABILITY_REASON_CODES,
    /**
     * `export-bundle` was invoked with no sovereign subject. Portability
     * transports an identity that already exists; minting one to have something
     * to export would make this capsule quietly become AOC.IDENTITY.
     */
    subjectRequired: 'PORTABILITY_SUBJECT_REQUIRED',
    invalidInput: 'PORTABILITY_INVALID_INPUT',
    unsupportedOperation: 'PORTABILITY_UNSUPPORTED_OPERATION',
    /**
     * `import-bundle` was invoked with an explicit subject that is not the
     * bundle's subject. The two references are never merged and no winner is
     * picked — reconciling a changed locator or a different external reference is
     * a lifecycle decision, not a transport one.
     */
    subjectMismatch: 'PORTABILITY_SUBJECT_MISMATCH',
});
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isNonBlankString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
/**
 * Validates the capability-specific Portability input.
 *
 * This checks the *operation envelope* only — that the operation is one this
 * capability version supports, that the export artifact lists are lists, and
 * that an import carries a non-blank transport string. It deliberately does not
 * restate the nested artifact rules: those belong to the real bundle validators
 * in `@aoc/protocol/portability`, a second copy of them here would be a drift
 * source, and the subject-dependent rules (manifest and claim subject
 * consistency, standing resolution) cannot be answered from the input alone
 * because the subject arrives on the invocation. The capsule applies those by
 * running the real builder and parser, whose reasons it reports verbatim.
 */
function validatePortabilitySovereigntyCapabilityInput(value) {
    const codes = exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
    if (!isPlainObject(value)) {
        return { valid: false, reasons: [codes.invalidInput] };
    }
    const operation = value.operation;
    if (typeof operation !== 'string'
        || !exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_OPERATIONS.includes(operation)) {
        return { valid: false, reasons: [codes.unsupportedOperation] };
    }
    const reasons = [];
    if (operation === 'export-bundle') {
        for (const key of ['manifests', 'claims', 'standings']) {
            const artifacts = value[key];
            if (artifacts !== undefined && !Array.isArray(artifacts)) {
                reasons.push(codes.invalidInput);
            }
        }
    }
    if (operation === 'import-bundle' && !isNonBlankString(value.serializedBundle)) {
        reasons.push(codes.invalidInput);
    }
    return { valid: reasons.length === 0, reasons };
}
function isValidPortabilitySovereigntyCapabilityInput(value) {
    return validatePortabilitySovereigntyCapabilityInput(value).valid;
}
/**
 * Exact equality of two subject references.
 *
 * Two references naming the same `SovereignAssetId` under different external
 * references — or one with an external reference and one without — are not
 * equal. That inequality is the point: an importer that said "close enough" and
 * picked one would be silently reconciling a locator change nobody asked it to
 * reconcile. SM-02's `sovereignExternalReferencesEqual` is reused for the
 * reference half rather than restating its rules.
 */
function subjectsExactlyEqual(a, b) {
    if (a.sovereignAssetId !== b.sovereignAssetId)
        return false;
    if (a.externalReference === undefined || b.externalReference === undefined) {
        return a.externalReference === b.externalReference;
    }
    return (0, identity_1.sovereignExternalReferencesEqual)(a.externalReference, b.externalReference);
}
/**
 * Builds the production AOC.PORTABILITY capsule.
 *
 * A factory, so that importing this module performs no work: nothing is
 * registered, nothing is mutated, no global is touched, no clock is read and no
 * id is generated at import time. There is no implementation registry — the
 * capsule is passed explicitly to `invokeSovereigntyCapability`, which is the
 * only supported way to execute it, and no options are needed because neither
 * operation reads the clock: the bundle is a deterministic function of the
 * artifacts it carries, and *when* an export happened is recorded truthfully in
 * the invocation evidence instead.
 */
function createPortabilitySovereigntyCapabilityImplementation() {
    const capability = (0, canonical_ref_1.requireSovereigntyCapabilityRef)('portability');
    return Object.freeze({
        capability,
        async invoke(invocation) {
            const codes = exports.PORTABILITY_SOVEREIGNTY_CAPABILITY_REASON_CODES;
            const validation = validatePortabilitySovereigntyCapabilityInput(invocation.input);
            if (!validation.valid) {
                return { status: 'failed', reasonCodes: validation.reasons };
            }
            const input = invocation.input;
            if (input.operation === 'export-bundle') {
                // An expected semantic refusal, not an exception: there is no identity
                // to transport, and Portability does not create one.
                if (invocation.subject === undefined) {
                    return { status: 'failed', reasonCodes: [codes.subjectRequired] };
                }
                const built = (0, portability_1.tryBuildSovereigntyPortabilityBundleV1)({
                    subject: invocation.subject,
                    ...(input.manifests === undefined ? {} : { manifests: input.manifests }),
                    ...(input.claims === undefined ? {} : { claims: input.claims }),
                    ...(input.standings === undefined ? {} : { standings: input.standings }),
                });
                if (!built.valid) {
                    return { status: 'failed', reasonCodes: built.reasons };
                }
                return {
                    status: 'succeeded',
                    output: Object.freeze({
                        operation: 'export-bundle',
                        bundle: built.bundle,
                        serializedBundle: (0, portability_1.serializeSovereigntyPortabilityBundle)(built.bundle),
                    }),
                    // No subject is returned: export creates none, so SM-03's precedence
                    // rule leaves the invocation's own subject on the result and evidence.
                };
            }
            const parsed = (0, portability_1.parseSovereigntyPortabilityBundle)(input.serializedBundle);
            if (!parsed.valid) {
                return { status: 'failed', reasonCodes: parsed.reasons };
            }
            const { bundle } = parsed;
            if (invocation.subject !== undefined && !subjectsExactlyEqual(invocation.subject, bundle.subject)) {
                return { status: 'failed', reasonCodes: [codes.subjectMismatch] };
            }
            return {
                status: 'succeeded',
                output: Object.freeze({
                    operation: 'import-bundle',
                    bundle,
                    serializedBundle: (0, portability_1.serializeSovereigntyPortabilityBundle)(bundle),
                }),
                // The EXISTING subject that arrived in the bundle, stated explicitly so
                // a subjectless import still resolves the common result and evidence
                // onto the subject the bundle is about. Nothing was minted: this is the
                // same `SovereignAssetId` the exporting runtime had.
                subject: bundle.subject,
            };
        },
    });
}
