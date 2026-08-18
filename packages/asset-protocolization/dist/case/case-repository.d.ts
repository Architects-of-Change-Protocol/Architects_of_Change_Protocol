import type { AdapterResult } from '@aoc/protocol/adapters';
import type { ProtocolizationCaseId, ProtocolizationTenantId } from './case-identifiers';
import type { ProtocolizationCase } from './protocolization-case';
/**
 * Where `ProtocolizationCase` persistence lives.
 *
 * In the vertical. Gate A0 / U-6 settled this: no vertical workflow persistence
 * port goes into AOC Protocol, and Protocol never learns the case exists. This
 * file is that decision in code — the port is declared here, in the package that
 * owns the aggregate.
 *
 * APV-04 ships the **port** and one deterministic in-memory implementation.
 * It ships no database adapter, no migration and no schema, because the domain
 * slice does not need one: binding this interface to a store is an
 * infrastructure decision with its own owner and its own review, and making it
 * now would couple the vertical's domain package to a database in the slice that
 * defines the domain.
 *
 * ### Identity model
 *
 * A case is identified by `(tenantId, caseId)`, not by `caseId` alone.
 *
 * Cases are minted by tenants, so a globally-unique constraint would let one
 * tenant's choice of identifier collide with another's — which both leaks the
 * existence of a case across a tenant boundary and makes a legitimate
 * `create` fail for a reason its caller cannot see or fix. Tenant scoping is
 * the only rule that keeps a tenant's identifier space its own.
 *
 * ### Tenancy
 *
 * Every method takes the tenant. There is deliberately no `get(caseId)`
 * overload and no "find across tenants" escape hatch: a lookup that can be
 * called without a tenant is a lookup that will eventually be called without
 * one, and Protocol's advisory `tenantId?` will not catch it (APV-00 F-4).
 * Knowing another tenant's `caseId` must be worth nothing.
 */
export interface ProtocolizationCaseRepository {
    /** The case, or `undefined` when this tenant has no such case. */
    get(tenantId: ProtocolizationTenantId, caseId: ProtocolizationCaseId): AdapterResult<ProtocolizationCase | undefined>;
    exists(tenantId: ProtocolizationTenantId, caseId: ProtocolizationCaseId): AdapterResult<boolean>;
    /**
     * Persists a case.
     *
     * Revision-checked: a case at revision 1 must not already exist
     * (`PROTOCOLIZATION_CASE_ALREADY_EXISTS`), and a case at revision *n* must
     * replace a stored revision *n - 1* (`PROTOCOLIZATION_CASE_REVISION_CONFLICT`).
     * That single rule covers duplicate creation and lost updates without any
     * locking, because the aggregate already increments its revision once per
     * operation.
     */
    save(protocolizationCase: ProtocolizationCase): AdapterResult<void>;
}
/**
 * A deterministic, in-process implementation of the port.
 *
 * It exists to make the contract executable — tenant isolation, duplicate
 * rejection and lost-update detection are behaviours a port cannot state, only a
 * implementation can demonstrate — and it is the reference a database adapter
 * must match. It is in-process and synchronous, like
 * `createAssetProfileCatalog`, and it holds nothing but the cases it was given.
 *
 * Stored cases are validated on the way in and deeply frozen, so a caller
 * cannot mutate stored state by holding on to a reference it saved or received.
 * Every mutation goes back through the aggregate operations.
 */
export declare function createInMemoryProtocolizationCaseRepository(): ProtocolizationCaseRepository;
//# sourceMappingURL=case-repository.d.ts.map