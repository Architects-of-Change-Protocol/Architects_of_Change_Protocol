"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetProfileScope = exports.ASSET_PROFILE_SCHEMA_VERSION = void 0;
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
exports.ASSET_PROFILE_SCHEMA_VERSION = 'aoc-asset-profile/1';
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
exports.AssetProfileScope = {
    Global: 'Global',
};
