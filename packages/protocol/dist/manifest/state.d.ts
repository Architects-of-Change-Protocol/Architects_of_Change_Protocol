/**
 * Protocol-legitimate Sovereign Asset lifecycle state. This is NOT an
 * access-control or execution state — `allowed`/`blocked`/`revoked-access`/
 * `payment-pending`/`execution-denied` and similar enforcement concepts
 * belong to AOC Enterprise, not Protocol. State transitions must preserve
 * history rather than silently mutate facts; full append-only manifest
 * history is out of scope for this slice (see
 * `docs/architecture/sovereign-asset-core.md`) but `manifestVersion`
 * anchors the point future revisions will chain from.
 */
export declare const SovereignAssetState: {
    /** The asset's current manifest is the operative sovereign record. */
    readonly Active: "active";
    /** A competing or challenging claim exists; both sides remain on record. */
    readonly Disputed: "disputed";
    /** A newer manifest revision has replaced this one for the same asset id. */
    readonly Superseded: "superseded";
    /** The registrant has withdrawn the asset's active standing. */
    readonly Withdrawn: "withdrawn";
};
export type SovereignAssetState = (typeof SovereignAssetState)[keyof typeof SovereignAssetState];
export declare function isValidSovereignAssetState(value: unknown): value is SovereignAssetState;
//# sourceMappingURL=state.d.ts.map