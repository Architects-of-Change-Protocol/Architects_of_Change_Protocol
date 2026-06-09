/**
 * Compatibility facades for the historical hosted audit runtime.
 *
 * @deprecated Use `@aoc/enterprise/assurance/audit` instead.
 * Migrate to Enterprise Assurance; only signature translation is retained here.
 */
import { InMemoryAuditService as EnterpriseInMemoryAuditService, RuntimeAuditService as EnterpriseRuntimeAuditService, } from '../../enterprise/src/assurance/audit';
/**
 * @deprecated Use `InMemoryAuditService` from `@aoc/enterprise/assurance/audit`.
 * Compatibility facade preserving the historical audit signatures.
 */
export class InMemoryAuditService {
    implementation;
    constructor(maxEvents) {
        this.implementation = new EnterpriseInMemoryAuditService(maxEvents);
    }
    recordEvent(event) {
        this.implementation.recordEvent(event);
    }
    listEvents(query = {}) {
        return this.implementation.listEvents(query);
    }
}
/**
 * @deprecated Use `RuntimeAuditService` from `@aoc/enterprise/assurance/audit`.
 * Compatibility facade preserving the historical three-source constructor.
 */
export class RuntimeAuditService {
    implementation;
    constructor(trustService, payoutExecutor, dataAccessService) {
        this.implementation = new EnterpriseRuntimeAuditService([
            trustService,
            payoutExecutor,
            dataAccessService,
        ]);
    }
    listEvents(input) {
        return this.implementation.listEvents(input);
    }
}
