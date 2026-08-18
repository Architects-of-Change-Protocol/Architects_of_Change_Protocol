import type { AdapterResult } from '@aoc/protocol/adapters';
import type { ProtocolizationCaseId, ProtocolizationTenantId } from '../case/case-identifiers';
import type { EvidenceIntakeId } from './evidence-intake-identifiers';
import type { EvidenceIntakeReceipt } from './evidence-intake-receipt';
/**
 * Where evidence intake receipts live.
 *
 * In the vertical, for the reason Gate A0 / `U-6` settled for cases: no vertical
 * workflow persistence port goes into AOC Protocol, and Protocol never learns
 * that intake exists. APV-05 ships the **port** and one deterministic in-memory
 * implementation — no database adapter, no migration, no schema, no blob store.
 * Binding this interface to a store is an infrastructure decision with its own
 * owner and its own review.
 *
 * ### What it stores, and what it does not
 *
 * Receipts. Not evidence. A `CanonicalEvidence` record lives wherever Protocol
 * records live; this holds the vertical's audit trail of what entered which
 * case, when, through which pathway, and from which stated source. There is no
 * file, no blob, no document body and no PII by construction.
 *
 * ### Identity model — `(tenantId, intakeId)`
 *
 * Tenant-scoped, exactly like `(tenantId, caseId)`. Intake ids are minted by
 * tenants, so a globally unique constraint would let one tenant's choice of
 * identifier collide with another's — which both leaks the existence of an
 * intake across a tenant boundary and makes a legitimate `save` fail for a
 * reason its caller can neither see nor fix.
 *
 * The other two identity layers are scoped differently and deliberately are not
 * conflated with this one. A `ProtocolizationMaterialId` is unique *within a
 * case*, enforced by the case aggregate. A `CanonicalEvidenceId` is not unique
 * at all here: it may appear in at most one evidence material per case
 * (`intakeProtocolizationEvidence` enforces that) and in as many cases as
 * legitimately reference it.
 *
 * ### Immutability
 *
 * There is no update and no delete. A receipt records that something happened;
 * rewriting one would be rewriting history, and removing one would erase the
 * only record that evidence entered a case. A correction is a new intake with a
 * new `intakeId`. `save` therefore rejects a second write under the same
 * `(tenantId, intakeId)` rather than overwriting.
 *
 * ### Tenancy
 *
 * Every method takes the tenant. There is deliberately no `get(intakeId)`
 * overload, no `listByCase(caseId)` overload and no cross-tenant enumeration:
 * knowing another tenant's `intakeId` or `caseId` must be worth nothing.
 */
export interface EvidenceIntakeRepository {
    /** The receipt, or `undefined` when this tenant has no such intake. */
    get(tenantId: ProtocolizationTenantId, intakeId: EvidenceIntakeId): AdapterResult<EvidenceIntakeReceipt | undefined>;
    exists(tenantId: ProtocolizationTenantId, intakeId: EvidenceIntakeId): AdapterResult<boolean>;
    /**
     * Every receipt recorded for one of this tenant's cases, in the order it was
     * saved. Empty for a case that belongs to another tenant — indistinguishable,
     * on purpose, from a case with no intakes.
     */
    listByCase(tenantId: ProtocolizationTenantId, caseId: ProtocolizationCaseId): AdapterResult<readonly EvidenceIntakeReceipt[]>;
    /**
     * Records a receipt. Rejects a duplicate `(tenantId, intakeId)`
     * (`EVIDENCE_INTAKE_DUPLICATE`) and never overwrites.
     */
    save(receipt: EvidenceIntakeReceipt): AdapterResult<void>;
}
/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection and append-only history are behaviours a port can state but only an
 * implementation can demonstrate — and it is the reference a database adapter
 * must match. Receipts are validated on the way in and deeply frozen, so a
 * caller cannot mutate stored state by holding on to a reference it saved.
 */
export declare function createInMemoryEvidenceIntakeRepository(): EvidenceIntakeRepository;
//# sourceMappingURL=evidence-intake-repository.d.ts.map