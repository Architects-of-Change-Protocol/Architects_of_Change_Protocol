import type { AssetVerificationCheckId } from '../identifiers';
import type { AssetVerificationCheck } from './verification-check';
/**
 * Resolution of `AssetVerificationCheckId -> implementation`.
 *
 * ### Exact ids, and nothing else
 *
 * Lookup is by exact identifier. There is deliberately no prefix match, no
 * suffix match, no substring match, no case folding, no normalization, no
 * fallback to a "closest" check and no resolution by the profile's display
 * label. A check id is opaque (APV-03), and a registry that guessed would let a
 * profile silently execute an implementation it never named — which is the same
 * class of failure as resolving a profile version by "latest".
 *
 * The registry likewise never branches on asset category, profile id, subject
 * shape or jurisdiction. It is a map. Everything that varies between asset
 * classes varies in the *profile* and in the *registered implementation*, never
 * here.
 *
 * ### Registration is the extension mechanism
 *
 * Adding a check to a deployment is `register(check)`. It is not a change to
 * Soberanía Protocol, not a change to `ProtocolizationCase`, not a change to
 * this file, and not a new branch anywhere in the engine. That property is what
 * the whole slice is for, and the extensibility test exercises it by registering
 * a check the engine has never heard of and executing it through a profile
 * fixture.
 *
 * ### Duplicate registration fails
 *
 * A second registration under the same id is refused rather than replacing the
 * first. Silent replacement would mean the meaning of a `checkId` — and
 * therefore the meaning of every historical result carrying it — could change
 * with load order, and two deployments of the same profile could disagree about
 * what a check did while producing identically-shaped records.
 *
 * ### Scope
 *
 * The registry is system/configuration-level, exactly like the profile
 * catalogue: it carries no tenant, holds no case data and is shared. Everything
 * tenant-bound lives on the *results* the engine produces, never here.
 */
export interface VerificationCheckRegistry {
    /**
     * Registers one check.
     *
     * Throws `VerificationError` (`VERIFICATION_CHECK_REGISTRATION_INVALID`) when
     * the check id is malformed, when the implementation does not match its own
     * declared id, or when the id is already registered.
     */
    register(check: AssetVerificationCheck): void;
    /** The implementation, or `undefined`. Exact id match only. */
    get(checkId: AssetVerificationCheckId): AssetVerificationCheck | undefined;
    has(checkId: AssetVerificationCheckId): boolean;
    /** Every registered check id, in ascending lexicographic order. Deterministic. */
    registeredCheckIds(): readonly AssetVerificationCheckId[];
}
/**
 * Builds a registry, optionally pre-populated.
 *
 * Pre-population is ordinary registration, so a malformed or duplicated check
 * fails at construction rather than at first execution — the same choice
 * `createAssetProfileCatalog` makes, for the same reason: a deployment that
 * cannot perform the checks its profiles declare should not start.
 */
export declare function createVerificationCheckRegistry(checks?: readonly AssetVerificationCheck[]): VerificationCheckRegistry;
//# sourceMappingURL=verification-check-registry.d.ts.map