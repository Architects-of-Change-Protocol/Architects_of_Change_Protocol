"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeSovereigntyPortabilityBundle = serializeSovereigntyPortabilityBundle;
exports.parseSovereigntyPortabilityBundle = parseSovereigntyPortabilityBundle;
const canonical_1 = require("../canonical");
const bundle_1 = require("./bundle");
/**
 * Serializes a bundle to its canonical transport string.
 *
 * The bundle is validated first and a malformed one throws: emitting a wire
 * representation of a bundle that cannot be imported anywhere would produce a
 * transport artifact that only looks portable. Use
 * `tryBuildSovereigntyPortabilityBundleV1` when a malformed artifact set is an
 * expected outcome rather than a fault.
 */
function serializeSovereigntyPortabilityBundle(bundle) {
    const validation = (0, bundle_1.validateSovereigntyPortabilityBundleV1)(bundle);
    if (!validation.valid) {
        throw new Error(`Cannot serialize invalid SovereigntyPortabilityBundleV1: ${validation.reasons.join(', ')}`);
    }
    return (0, canonical_1.canonicalizeJSON)(bundle);
}
/**
 * Parses an untrusted serialized bundle. This is the import trust boundary, and
 * one of the few places in Protocol where accepting an arbitrary external value
 * is legitimate — so it fails closed on every defect and never lets a raw
 * `JSON.parse` exception be the public failure model.
 *
 * Rejected, each with a stable reason: malformed JSON, an unsupported bundle
 * schema (including a *future* one — a v1 importer does not pretend to
 * understand `…/2`), an unsupported canonicalization profile, an invalid
 * subject, an unknown artifact kind, a manifest or claim about a different
 * subject, a duplicate manifest version or claim id, an invalid or duplicate
 * standing, a standing whose `claimRef` is not in the bundle, and any value the
 * canonical profile refuses to serialize. Unknown data is never silently
 * dropped: for a sovereignty transport, a failed import is strictly better than
 * a quietly lossy one.
 *
 * Nothing is fetched, resolved, verified or persisted. A supplied signature is
 * not checked, a `manifestDigest` is not recomputed, an `evidenceRef` is not
 * resolved and an `externalReference.locator` is not dereferenced.
 *
 * On success the canonical *envelope* ordering is reconstructed, so a
 * non-canonical producer that shuffled the bundle's arrays still yields a
 * bundle that re-serializes to the canonical form. Envelope ordering is the
 * only normalization performed; nested artifacts are returned exactly as they
 * arrived.
 */
function parseSovereigntyPortabilityBundle(serialized) {
    const codes = bundle_1.SOVEREIGNTY_PORTABILITY_REASON_CODES;
    if (typeof serialized !== 'string') {
        return { valid: false, reasons: [codes.invalidJson] };
    }
    let parsed;
    try {
        parsed = JSON.parse(serialized);
    }
    catch {
        return { valid: false, reasons: [codes.invalidJson] };
    }
    const validation = (0, bundle_1.validateSovereigntyPortabilityBundleV1)(parsed);
    if (!validation.valid) {
        return { valid: false, reasons: validation.reasons };
    }
    const accepted = parsed;
    return (0, bundle_1.tryBuildSovereigntyPortabilityBundleV1)({
        subject: accepted.subject,
        manifests: accepted.manifests,
        claims: accepted.claims,
        standings: accepted.standings,
    });
}
