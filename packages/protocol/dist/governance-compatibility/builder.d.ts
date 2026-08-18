import { type BuildSovereignGovernanceHandoffInput, type SovereignGovernanceHandoffBuildResult, type SovereignGovernanceHandoffV1 } from './handoff';
/**
 * Non-throwing handoff construction, for callers sitting on a boundary where a
 * malformed representation is an expected outcome rather than a programming
 * fault — the production AOC.GOVERNANCE_COMPATIBILITY capsule is exactly such a
 * caller, and it turns these reasons into an ordinary failed capability
 * outcome.
 *
 * ## Procedure
 *
 *   1. validate the representation with SM-06's own canonical validator;
 *   2. take the subject *from* the representation — never from the caller;
 *   3. project the governance resource from that subject;
 *   4. derive the semantics with SM-07's pure descriptor helper;
 *   5. compose the exact six-field handoff;
 *   6. validate the composed document;
 *   7. return it.
 *
 * ## What does not happen here
 *
 * No capability is invoked. `invokeSovereigntyCapability` is not called for
 * Portability, Interoperability or anything else: the *contracts* of those
 * minerals are reused as pure libraries, which is why this produces no nested
 * evidence receipt and no second invocation the caller did not ask for.
 * Composing minerals stays the caller's decision, visible in the caller's own
 * evidence. In particular a caller may prepare a handoff directly from a valid
 * representation without having run Interoperability first.
 *
 * Nothing is verified, hashed, minted, declared or adjudicated. No clock is
 * read and no id is generated, so the same representation and the same tenant
 * produce a byte-identical canonical handoff every time.
 *
 * The representation is carried by reference, not rebuilt: its claims, proofs,
 * standings and semantic refs are the caller's own objects, untouched, so
 * nothing inside it can be silently reordered, repaired or dropped on the way
 * to governance.
 */
export declare function tryBuildSovereignGovernanceHandoffV1(input: BuildSovereignGovernanceHandoffInput): SovereignGovernanceHandoffBuildResult;
/**
 * Builds a validated canonical governance handoff, throwing on a malformed
 * representation rather than projecting it partially — a construction helper,
 * not a lenient parser, matching `buildSovereigntyPortabilityBundleV1` and
 * `buildSovereigntyInteroperabilityDescriptorV1`.
 */
export declare function buildSovereignGovernanceHandoffV1(input: BuildSovereignGovernanceHandoffInput): SovereignGovernanceHandoffV1;
//# sourceMappingURL=builder.d.ts.map