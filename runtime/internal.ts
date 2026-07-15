/**
 * Internal Runtime Surface
 *
 * These exports are for internal platform/runtime composition only.
 * They are not part of the semver-stable SDK contract.
 */

export * from './governance';
export * from './distributed';
export * from './capabilities';
export * from './attestations';
export * from './execution-fabric';

export * from './policy';

export * from './memory';

/**
 * SECURITY WARNING — no canonical revocation check.
 *
 * `createRuntimeServer` and `enforceCapabilityAccess` are moved here (out of the stable
 * `./index` surface) because the authorization path they use —
 * `protocol/consent/capability-authorize.ts`'s `authorizeWithCapability` — validates only
 * token shape, hash, HMAC signature, and expiry. It has no `checkRevocation` parameter and
 * no revoke mechanism exists anywhere for its `capability_id` key space. `createRuntimeServer`
 * gates live `POST /data/access` and `POST /payout/execute` traffic through this path.
 *
 * Do not use these to authorize material operations without first adding a canonical
 * `RevocationCheckPort` to `authorizeWithCapability` (see docs/security/revocation/ for the
 * pattern used everywhere else in this repo). See
 * docs/security/revocation/14-independent-review.md for the full analysis.
 */
export { createRuntimeServer } from './api/server';
export * from './enforcement';
