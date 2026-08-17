import { type SovereigntyPortabilityBundleV1, type SovereigntyPortabilityReasonCode } from './bundle';
/**
 * The canonical wire representation of a portability bundle, and the parser
 * that accepts one back.
 *
 * There is exactly one serialization implementation, and it is
 * `aoc-canonical-json/1` — the profile the rest of Protocol already hashes and
 * signs under. No second canonicalizer, no stable-stringify variant, no
 * pretty-printed "canonical" form (a caller wanting readable output can
 * re-indent the parsed value itself), and no ZIP, TAR, CBOR, MessagePack,
 * protobuf, custom extension, compression or encryption. Those are transport
 * and storage concerns; adding them here would bind sovereignty semantics to an
 * encoding choice, and they can be layered outside without redefining anything.
 */
export type SovereigntyPortabilityBundleParseResult = {
    readonly valid: true;
    readonly bundle: SovereigntyPortabilityBundleV1;
} | {
    readonly valid: false;
    readonly reasons: readonly SovereigntyPortabilityReasonCode[];
};
/**
 * Serializes a bundle to its canonical transport string.
 *
 * The bundle is validated first and a malformed one throws: emitting a wire
 * representation of a bundle that cannot be imported anywhere would produce a
 * transport artifact that only looks portable. Use
 * `tryBuildSovereigntyPortabilityBundleV1` when a malformed artifact set is an
 * expected outcome rather than a fault.
 */
export declare function serializeSovereigntyPortabilityBundle(bundle: SovereigntyPortabilityBundleV1): string;
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
export declare function parseSovereigntyPortabilityBundle(serialized: string): SovereigntyPortabilityBundleParseResult;
//# sourceMappingURL=serialization.d.ts.map