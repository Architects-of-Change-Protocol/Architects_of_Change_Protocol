import type { CanonicalId } from '@aoc/protocol/contracts';
import type { AssetProfileId, AssetProfileVersion } from '../identifiers';
/**
 * Identifier vocabulary for the vertical's *workflow instance* layer.
 *
 * APV-03's identifiers name *definitions* — a profile line, a requirement, a
 * check — and are therefore dotted lowercase tokens authored by hand and
 * reviewed like code. The identifiers here name *instances*: one attempt, one
 * tenant, one submitted reference. They are minted per case rather than
 * authored, so they need a grammar that admits the shapes a caller will
 * actually have (a UUID, a namespaced `aoc:`-style token, an upstream request
 * id) while staying safe to put in a log line, a URL and an audit envelope.
 *
 * Every identifier here is opaque. Nothing in this package parses one, derives
 * meaning from one, case-folds one, or reconstructs one from another value:
 * two identifiers are the same identifier only when their bytes match.
 */
/**
 * Stable identity of one `ProtocolizationCase`.
 *
 * Caller-provided, never generated here. Minting is non-deterministic — it
 * needs a UUID source or a counter — and a pure domain layer that mints its own
 * identifiers cannot be tested by asserting on its output. The composition
 * layer supplies the value (Protocol's `mintSovereignAssetId` shows the same
 * split: `node:crypto` lives with the identity module, not with the callers
 * that pass ids around). What this package owns is the *rule* the value must
 * satisfy, enforced at creation and again at reconstruction.
 */
export type ProtocolizationCaseId = string;
/**
 * The tenant one case belongs to.
 *
 * Deliberately Protocol's `CanonicalId`, the same type carried by
 * `ResourceRef.tenantId` — so the tenant a case is bound to is the tenant that
 * later reaches Enterprise through `ProtocolizationResultV1.governedResource`
 * (APV-02 §4) with no re-spelling in between. What the vertical adds is
 * obligation, not a new type: `ResourceRef.tenantId` is optional and advisory
 * at the substrate level (APV-00 F-4), and a `ProtocolizationCase` without a
 * tenant is not representable at all.
 */
export type ProtocolizationTenantId = CanonicalId;
/** Stable identity of one material association inside one case. Unique per case. */
export type ProtocolizationMaterialId = string;
/** Shared upper bound with APV-03's identifiers — same rationale, same limit. */
export declare const PROTOCOLIZATION_IDENTIFIER_MAX_LENGTH = 128;
/**
 * Exported for reuse *inside* this package only — it is not part of the package
 * facade. APV-05 mints an evidence-intake id per intake operation, which is the
 * same *instance* identifier kind as a case id or a material id, so it must
 * satisfy this grammar rather than a second one that happens to look like it.
 */
export declare function isProtocolizationInstanceIdentifier(value: unknown): value is string;
export declare function isValidProtocolizationCaseId(value: unknown): value is ProtocolizationCaseId;
export declare function isValidProtocolizationMaterialId(value: unknown): value is ProtocolizationMaterialId;
/**
 * Deliberately more permissive than a case id.
 *
 * A case id and a material id are minted by this vertical, so it may impose a
 * grammar on them. A tenant id is minted somewhere else — an identity provider,
 * a control plane, a customer record — and Protocol places no grammar on
 * `CanonicalId` at all. Inventing one here would reject legitimate tenants for
 * a cosmetic reason, so this checks only what the vertical actually needs:
 * present, non-blank, bounded, and free of the whitespace and control
 * characters that would make it unsafe to carry. The value is never trimmed —
 * the same reason `validateSovereignExternalReference` rejects blanks instead
 * of rewriting them.
 */
export declare function isValidProtocolizationTenantId(value: unknown): value is ProtocolizationTenantId;
/**
 * The exact `(profileId, profileVersion)` pair one case is assessed under.
 *
 * This is the shape APV-02 §2.1 froze for `ProtocolizationResultV1.profile`,
 * materialized here because the case is the first thing in the vertical that
 * pins a profile — and the pin a case is created with must be the pin the
 * eventual result carries, byte for byte, with no second spelling in between.
 *
 * Field names follow APV-02 rather than APV-03: the profile document calls its
 * own field `version` because the id is implicit in the document, while a
 * *reference* has to say which version of what.
 */
export interface ProtocolizationProfileRef {
    readonly profileId: AssetProfileId;
    readonly profileVersion: AssetProfileVersion;
}
export declare function isValidProtocolizationProfileRef(value: unknown): value is ProtocolizationProfileRef;
/**
 * Exact equality of two pins. There is deliberately no "compatible with" or
 * "supersedes" comparison: a case pinned to `1.0.0` is never satisfied by
 * `1.0.1`, and offering a looser comparison would be exactly the silent
 * semantic migration that pinning exists to prevent.
 */
export declare function protocolizationProfileRefsEqual(left: ProtocolizationProfileRef, right: ProtocolizationProfileRef): boolean;
//# sourceMappingURL=case-identifiers.d.ts.map