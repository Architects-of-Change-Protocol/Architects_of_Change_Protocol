import type { AdapterToken, RuntimeAdapterStartupReport } from './types';
export declare class AdapterNotRegisteredError extends Error {
    readonly token: AdapterToken;
    constructor(token: AdapterToken);
}
export declare class AdapterAlreadyRegisteredError extends Error {
    readonly token: AdapterToken;
    constructor(token: AdapterToken);
}
export declare class RegistryValidationError extends Error {
    readonly report: RuntimeAdapterStartupReport;
    constructor(report: RuntimeAdapterStartupReport);
}
//# sourceMappingURL=errors.d.ts.map