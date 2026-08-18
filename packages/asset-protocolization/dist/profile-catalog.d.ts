import type { AssetCategoryId, AssetProfileId, AssetProfileVersion } from './identifiers';
import type { AssetProfile } from './profile';
/**
 * Resolution of profiles by stable identity and version.
 *
 * Deliberately in-process and deterministic. Profile definitions are
 * system-level, small, authored in code and reviewed like code (see
 * `AssetProfileScope`), so nothing about APV-03 needs storage — and putting the
 * vertical's state behind a database now would prejudge APV-04's persistence
 * decision, which Gate A0 / U-6 assigned to the vertical rather than to
 * Protocol.
 *
 * Extensibility does not go through this module: a new asset category is a new
 * profile document registered here, never a change to this implementation.
 */
export interface AssetProfileCatalogFilter {
    readonly profileId?: AssetProfileId;
    readonly assetCategory?: AssetCategoryId;
}
export interface AssetProfileCatalog {
    /**
     * Validates and catalogues one profile version.
     *
     * Throws `AssetProfileError` when the document is malformed
     * (`ASSET_PROFILE_INVALID`) or when the (profileId, version) pair is already
     * present (`ASSET_PROFILE_VERSION_ALREADY_REGISTERED`). Registration never
     * replaces a catalogued version: a case assessed under a version must be able
     * to re-read exactly the rules it was assessed under.
     */
    register(profile: AssetProfile): void;
    get(profileId: AssetProfileId, version: AssetProfileVersion): AssetProfile | undefined;
    has(profileId: AssetProfileId, version: AssetProfileVersion): boolean;
    /** All catalogued profiles matching the filter, ordered by profile id then version. */
    list(filter?: AssetProfileCatalogFilter): readonly AssetProfile[];
    /** Every catalogued version of one profile line, in ascending version order. */
    versionsOf(profileId: AssetProfileId): readonly AssetProfileVersion[];
}
/**
 * Builds a catalogue, optionally pre-populated. Pre-population is ordinary
 * registration, so an invalid or duplicated profile fails at construction
 * rather than at first use.
 */
export declare function createAssetProfileCatalog(profiles?: readonly AssetProfile[]): AssetProfileCatalog;
//# sourceMappingURL=profile-catalog.d.ts.map