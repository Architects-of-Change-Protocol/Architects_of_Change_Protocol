import { ASSET_PROFILE_ERROR_CODES, AssetProfileError } from './errors';
import {
  assetProfileVersionKey,
  compareAssetProfileVersions,
} from './identifiers';
import type { AssetCategoryId, AssetProfileId, AssetProfileVersion } from './identifiers';
import type { AssetProfile } from './profile';
import { validateAssetProfile } from './profile-validation';

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

function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null) return value;
  for (const entry of Object.values(value as Record<string, unknown>)) {
    deepFreeze(entry);
  }
  return Object.freeze(value);
}

/**
 * Builds a catalogue, optionally pre-populated. Pre-population is ordinary
 * registration, so an invalid or duplicated profile fails at construction
 * rather than at first use.
 */
export function createAssetProfileCatalog(
  profiles: readonly AssetProfile[] = [],
): AssetProfileCatalog {
  const entries = new Map<string, AssetProfile>();

  const catalog: AssetProfileCatalog = {
    register(profile: AssetProfile): void {
      const validation = validateAssetProfile(profile);
      if (!validation.valid) {
        throw new AssetProfileError(
          ASSET_PROFILE_ERROR_CODES.invalidProfile,
          `Invalid AssetProfile: ${validation.reasons.join(', ')}`,
          {
            reasonCodes: validation.reasons,
            ...(typeof profile?.profileId === 'string' ? { profileId: profile.profileId } : {}),
            ...(typeof profile?.version === 'string' ? { version: profile.version } : {}),
          },
        );
      }

      const key = assetProfileVersionKey(profile.profileId, profile.version);
      if (entries.has(key)) {
        throw new AssetProfileError(
          ASSET_PROFILE_ERROR_CODES.versionAlreadyRegistered,
          `AssetProfile ${key} is already registered`,
          {
            reasonCodes: [ASSET_PROFILE_ERROR_CODES.versionAlreadyRegistered],
            profileId: profile.profileId,
            version: profile.version,
          },
        );
      }

      // A catalogued version is immutable from here on, so a holder of the
      // original reference cannot retroactively change the rules a case was
      // assessed under.
      entries.set(key, deepFreeze(profile));
    },

    get(profileId: AssetProfileId, version: AssetProfileVersion): AssetProfile | undefined {
      return entries.get(assetProfileVersionKey(profileId, version));
    },

    has(profileId: AssetProfileId, version: AssetProfileVersion): boolean {
      return entries.has(assetProfileVersionKey(profileId, version));
    },

    list(filter: AssetProfileCatalogFilter = {}): readonly AssetProfile[] {
      return [...entries.values()]
        .filter((profile) => {
          if (filter.profileId !== undefined && profile.profileId !== filter.profileId) return false;
          if (filter.assetCategory !== undefined && profile.assetCategory !== filter.assetCategory) {
            return false;
          }
          return true;
        })
        .sort(
          (left, right) =>
            left.profileId.localeCompare(right.profileId) ||
            compareAssetProfileVersions(left.version, right.version),
        );
    },

    versionsOf(profileId: AssetProfileId): readonly AssetProfileVersion[] {
      return catalog.list({ profileId }).map((profile) => profile.version);
    },
  };

  for (const profile of profiles) {
    catalog.register(profile);
  }

  return catalog;
}
