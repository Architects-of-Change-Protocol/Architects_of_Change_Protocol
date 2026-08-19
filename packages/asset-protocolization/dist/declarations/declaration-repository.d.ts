import type { AdapterResult } from '@aoc/protocol/adapters';
import type { ProtocolizationCaseId, ProtocolizationTenantId } from '../case/case-identifiers';
import type { DeclarationId } from './declaration-identifiers';
import type { ProtocolizationDeclarationRecord } from './declaration-record';
/**
 * Where declaration records live.
 *
 * In the vertical, for the reason Gate A0 / `U-6` settled for cases and APV-05
 * extended to intake receipts: no vertical workflow persistence port goes into
 * AOC Protocol, and Protocol never learns that declarations exist. APV-06 ships
 * the **port** and one deterministic in-memory implementation — no database
 * adapter, no migration, no schema, no blob store. Binding this interface to a
 * store is an infrastructure decision with its own owner and its own review.
 *
 * ### What it stores, and what it does not
 *
 * Records of declarations. Not claims. A `CanonicalClaim` lives wherever
 * Protocol records live; this holds the vertical's audit trail of who asserted
 * what, into which case, when, under which pinned profile, against which
 * requirements and pointing at which evidence. There is no file, no blob and no
 * document body.
 *
 * ### Identity model — `(tenantId, declarationId)`
 *
 * Tenant-scoped, exactly like `(tenantId, caseId)` and `(tenantId, intakeId)`.
 * Declaration ids are minted by tenants, so a globally unique constraint would
 * let one tenant's choice of identifier collide with another's — which both
 * leaks the existence of a declaration across a tenant boundary and makes a
 * legitimate `save` fail for a reason its caller can neither see nor fix. Two
 * tenants may therefore hold the same `declarationId`, and neither can observe
 * the other's.
 *
 * The other identity layers are scoped differently and deliberately are not
 * conflated with this one. A `ProtocolizationMaterialId` is unique *within a
 * case*, enforced by the case aggregate. A `CanonicalClaimId` is not unique at
 * all here: it may appear in at most one declaration material per case
 * (`recordProtocolizationDeclaration` enforces that) and in as many cases as
 * legitimately reference it. Statement text is never an identity of anything.
 *
 * ### Append-only
 *
 * There is no update and no delete — and no retraction. A record says that
 * somebody asserted something at a time; rewriting one would be rewriting
 * history, and removing one would erase the only evidence that the assertion
 * was ever made. That matters more here than for any other record in the
 * vertical: a declaration log whose entries can be quietly withdrawn is worth
 * nothing to the verification and review slices that read it. A correction is a
 * new declaration with a new `declarationId`; a future retraction, if the
 * frozen architecture ever calls for one, is itself an auditable assertion
 * rather than a deletion. `save` therefore rejects a second write under the
 * same `(tenantId, declarationId)` rather than overwriting.
 *
 * ### Tenancy
 *
 * Every method takes the tenant. There is deliberately no `get(declarationId)`
 * overload, no `listByCase(caseId)` overload and no cross-tenant enumeration:
 * knowing another tenant's `declarationId` or `caseId` must be worth nothing.
 */
export interface DeclarationRepository {
    /** The record, or `undefined` when this tenant has no such declaration. */
    get(tenantId: ProtocolizationTenantId, declarationId: DeclarationId): AdapterResult<ProtocolizationDeclarationRecord | undefined>;
    exists(tenantId: ProtocolizationTenantId, declarationId: DeclarationId): AdapterResult<boolean>;
    /**
     * Every declaration recorded for one of this tenant's cases, in the order it
     * was saved — which is the order the declarations were made, and is what
     * makes the progressive history readable. Empty for a case that belongs to
     * another tenant: indistinguishable, on purpose, from a case with no
     * declarations.
     */
    listByCase(tenantId: ProtocolizationTenantId, caseId: ProtocolizationCaseId): AdapterResult<readonly ProtocolizationDeclarationRecord[]>;
    /**
     * Records a declaration. Rejects a duplicate `(tenantId, declarationId)`
     * (`DECLARATION_DUPLICATE`) and never overwrites.
     */
    save(record: ProtocolizationDeclarationRecord): AdapterResult<void>;
}
/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection and append-only history are behaviours a port can state but only an
 * implementation can demonstrate — and it is the reference a database adapter
 * must match. Records are validated on the way in and deeply frozen, so a
 * caller cannot mutate stored history by holding on to a reference it saved.
 */
export declare function createInMemoryDeclarationRepository(): DeclarationRepository;
//# sourceMappingURL=declaration-repository.d.ts.map