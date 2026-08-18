import type { AssetCategoryId, AssetProfileId, AssetProfileVersion } from './identifiers';
import type { JurisdictionRef } from './jurisdiction';
import type { AssetProfileMetadata } from './metadata';
import type { AssetRequirement } from './requirements';

/**
 * An `AssetProfile` states what must be satisfied for one category of asset to
 * be processed by the Asset Protocolization Vertical.
 *
 * It defines *vertical requirements*. It does not redefine truth, does not
 * redefine any Protocol primitive, does not govern Enterprise capabilities, and
 * never executes an action against an external system.
 *
 * Adding a new asset category means adding a profile — and, where an external
 * system is involved, a vertical adapter. It never means changing Protocol.
 * That is the hard acceptance criterion this type exists to make true.
 */
export const ASSET_PROFILE_SCHEMA_VERSION = 'aoc-asset-profile/1';

/**
 * Who a profile definition belongs to.
 *
 * `Global` is the only member in v1, and it is a member rather than an implicit
 * default so that the decision is on the record and mechanically enforced:
 * profile *definitions* are system-level, shared, and carry no `tenantId`.
 *
 * This does not weaken tenancy for the vertical's workflow state. Protocol's
 * `tenantId` is optional and advisory (APV-00 F-4), so a required tenant on
 * `ProtocolizationCase` is a vertical obligation — one APV-04 must discharge on
 * the case aggregate, where the tenant actually exists. A tenant-scoped profile
 * would be an additive amendment to this enum, not a silent reinterpretation of
 * an existing one.
 */
export const AssetProfileScope = {
  Global: 'Global',
} as const;
export type AssetProfileScope = (typeof AssetProfileScope)[keyof typeof AssetProfileScope];

export interface AssetProfile {
  readonly schemaVersion: typeof ASSET_PROFILE_SCHEMA_VERSION;

  /** Stable identity of the profile line. Opaque outside this package. */
  readonly profileId: AssetProfileId;

  /**
   * Version of the profile line, `<major>.<minor>.<patch>`.
   *
   * A published (profileId, version) pair is immutable: the catalogue refuses to
   * replace one, so a case that recorded `test.profile.v1@1.0.0` can never have
   * the rules it was assessed under changed underneath it. Evolution is a new
   * version, and both versions coexist.
   */
  readonly version: AssetProfileVersion;

  /** The category of subject this profile applies to. An opaque vertical token. */
  readonly assetCategory: AssetCategoryId;

  readonly scope: AssetProfileScope;

  /**
   * Jurisdictions this profile applies within. Absent, or containing
   * `GLOBAL`, places no jurisdictional restriction on its requirements.
   */
  readonly jurisdictions?: readonly JurisdictionRef[];

  /** The machine-readable requirement set. Requirement ids are unique within a profile. */
  readonly requirements: readonly AssetRequirement[];

  readonly metadata?: AssetProfileMetadata;
}
