/**
 * Human-readable metadata for profiles and requirements.
 *
 * Presentation only. **No machine semantics in this package may depend on any
 * field here** — validation, lookup, readiness evaluation and catalogue
 * ordering all read identifiers and structural fields exclusively, so these
 * strings can be replaced by a localized rendering at any point without
 * changing behaviour.
 *
 * Localization *infrastructure* is deliberately out of scope for APV-03. The
 * only obligation this shape carries is not to foreclose it: the strings are
 * plain, unstructured, and never parsed.
 */
export interface AssetProfileMetadata {
    /** Short human-facing name. */
    readonly label?: string;
    /** Longer human-facing explanation of what is being described. */
    readonly description?: string;
    /**
     * Why the requirement exists, for display in a review or applicant UI.
     *
     * Never a legal conclusion: the vertical records what was declared, supplied,
     * checked and attested, and states no legal outcome (ADR §5).
     */
    readonly reason?: string;
}
export declare function isValidAssetProfileMetadata(value: unknown): value is AssetProfileMetadata;
//# sourceMappingURL=metadata.d.ts.map