/**
 * Identifier vocabulary for the evidence *intake* layer.
 *
 * Two identifiers, and they are deliberately not the same kind of thing.
 *
 * `EvidenceIntakeId` names one **intake operation** — one attempt to introduce
 * one piece of evidence into one case. It is an *instance* identifier, minted
 * per attempt like a case id or a material id, so it carries APV-04's instance
 * grammar rather than a second one that merely resembles it.
 *
 * `EvidenceIntakeCategoryId` names a **configured intake pathway** — "an
 * uploaded document", "an external registry observation", "a credential
 * presentation". It is a *definition* identifier, authored and reviewed like a
 * profile id, so it carries APV-03's dotted-token grammar.
 *
 * Both are opaque. Nothing in this package parses one, derives meaning from
 * one, case-folds one or reconstructs one from another value.
 */
/**
 * Stable identity of one evidence intake operation.
 *
 * Caller-provided, never generated here — the same split APV-04 made for case
 * ids, for the same reason: minting needs a UUID source or a counter, and a
 * pure domain layer that mints its own identifiers cannot be tested by
 * asserting on its output.
 *
 * ### Why this is not the material id
 *
 * An intake id and a `ProtocolizationMaterialId` sit at different layers and
 * are deliberately not conflated. The intake id identifies *the attempt*: it
 * exists for a submission that was rejected, and it is what an audit reader
 * follows to answer "what did we do with what arrived at 14:02?". The material
 * id identifies *the association inside the case*: it exists only for an intake
 * that succeeded, and material can also reach a case through APV-04's own
 * pathway with no intake behind it at all. A successful intake produces one of
 * each and records the correspondence on its receipt.
 */
export type EvidenceIntakeId = string;
/**
 * Which configured intake pathway a submission arrived through.
 *
 * **Deliberately an opaque identifier and not an enum.** The frozen roadmap
 * expects intake to grow: uploaded documents, external registry observations,
 * cryptographic material, identity material, professional material, technical
 * material, provenance material — and more that nobody has named yet. A closed
 * union here would mean every new evidence source is a change to this package's
 * core, reviewed and released as such; an opaque token means a new source is a
 * new *configuration* plus, where normalization is needed, a composition-layer
 * adapter that produces a submission. Neither requires a change to AOC Protocol,
 * and neither requires a change to the case aggregate.
 *
 * It is also emphatically **not** an asset category and not a jurisdiction. No
 * member of any such vocabulary is declared anywhere in this package, and a
 * category id is never branched on: `evidence-intake-operations.ts` reads this
 * value to record it and for nothing else.
 *
 * ### Category is not `EvidenceType`
 *
 * A category says *how the evidence reached the workflow*. Protocol's
 * `EvidenceType` says *what generic kind of evidence record it is*. They vary
 * independently: a `Document` may arrive by upload or by registry export, and
 * one upload pathway may carry `Document`, `Certification` or `AuditRecord`
 * records. The vertical owns the first; Protocol owns the second, and this
 * package never widens it.
 */
export type EvidenceIntakeCategoryId = string;
export declare function isValidEvidenceIntakeId(value: unknown): value is EvidenceIntakeId;
export declare function isValidEvidenceIntakeCategoryId(value: unknown): value is EvidenceIntakeCategoryId;
//# sourceMappingURL=evidence-intake-identifiers.d.ts.map