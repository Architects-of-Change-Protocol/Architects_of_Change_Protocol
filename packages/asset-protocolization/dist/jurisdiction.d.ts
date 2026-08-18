/**
 * Jurisdiction context for the profile framework.
 *
 * This is deliberately the smallest structure that lets a later profile say
 * "this requirement applies within jurisdiction X". It is **not** a legal-rules
 * engine, not an ontology, and not a claim that anything is lawful anywhere:
 * the code is an opaque token this package validates structurally and never
 * interprets, resolves, or reasons about. Legal requirements are established
 * only in the later, citation-bearing work packages, never here.
 */
/**
 * The conventional wildcard: a profile scoped to `GLOBAL` places no
 * jurisdictional restriction on its requirements.
 *
 * This constant exists so the one place that needs the convention —
 * profile/requirement scope consistency in `profile-validation.ts` — can name
 * it instead of hard-coding a string. Nothing else in the framework branches on
 * a jurisdiction value.
 */
export declare const GLOBAL_JURISDICTION_CODE = "GLOBAL";
/**
 * Names a jurisdiction without asserting anything about it.
 *
 * `label` is presentation-only (see `metadata.ts`): no machine semantics of this
 * framework may depend on it.
 */
export interface JurisdictionRef {
    readonly code: string;
    readonly label?: string;
}
export declare function isValidJurisdictionCode(value: unknown): value is string;
/**
 * Structural check only. A present-but-`undefined` `label` is invalid rather
 * than absent, matching the canonical contracts: `aoc-canonical-json/1` refuses
 * `undefined`, so an absent optional must be structurally omitted.
 */
export declare function isValidJurisdictionRef(value: unknown): value is JurisdictionRef;
export declare function jurisdictionRefsEqual(left: JurisdictionRef, right: JurisdictionRef): boolean;
//# sourceMappingURL=jurisdiction.d.ts.map