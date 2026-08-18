import { type SovereignSubjectRef } from '../identity';
import { type SovereignGovernanceHandoffV1, type SovereignGovernanceHandoffValidationResult } from './handoff';
/**
 * Exact equality of two subject references, under SM-02 semantics.
 *
 * Two references naming the same `SovereignAssetId` under different external
 * references — or one with an external reference and one without — are not
 * equal, and that inequality is the point. A handoff that said "close enough"
 * would silently reconcile a reference change nobody asked it to reconcile,
 * and hand governance a subject that is not quite the one the representation
 * is about. SM-02's own `sovereignExternalReferencesEqual` is reused for the
 * reference half rather than restating its rules, so `namespace`, `id` and an
 * optional `locator` are all compared exactly once, in one place.
 */
export declare function sovereignGovernanceSubjectsEqual(a: SovereignSubjectRef, b: SovereignSubjectRef): boolean;
/**
 * Structural validity for a complete governance handoff value, suitable for use
 * at an external trust boundary.
 *
 * ## What it proves
 *
 * A supported handoff schema and canonicalization profile; a canonical subject;
 * a structurally valid SM-06 representation, checked with SM-06's own
 * validator; a governance resource that projects from that subject; an SM-07
 * descriptor that is well-formed *and* is exactly the canonical descriptor of
 * the representation it travels with; and one subject shared by all three.
 *
 * ## What it deliberately does not prove
 *
 * It runs no cryptographic verification, no licensing evaluation, no provenance
 * adjudication, no identity minting and no content hashing, and it invokes no
 * other capability. A handoff carrying a tampered signature, a contested
 * standing or a permission and a restriction over the same action is
 * structurally valid — those are sovereign facts governance may need, not
 * defects. An external system may refuse such a handoff under policy; the
 * Protocol must not refuse it under structure.
 *
 * Pure, deterministic, and non-mutating: the candidate value is only read.
 */
export declare function validateSovereignGovernanceHandoffV1(value: unknown): SovereignGovernanceHandoffValidationResult;
export declare function isValidSovereignGovernanceHandoffV1(value: unknown): value is SovereignGovernanceHandoffV1;
//# sourceMappingURL=validation.d.ts.map