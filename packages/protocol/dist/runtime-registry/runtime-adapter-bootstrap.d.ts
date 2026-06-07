import { AdapterRegistry } from './adapter-registry';
import { type AdapterRegistration, type AdapterRegistryLogger, type AdapterToken, type RuntimeAdapterStartupReport } from './types';
export declare class RuntimeAdapterBootstrap {
    private readonly registry;
    private readonly registrations;
    private readonly required;
    private readonly logger?;
    constructor(registry: AdapterRegistry, registrations: readonly AdapterRegistration[], required: readonly AdapterToken[], logger?: AdapterRegistryLogger | undefined);
    bootstrap(): RuntimeAdapterStartupReport;
}
//# sourceMappingURL=runtime-adapter-bootstrap.d.ts.map