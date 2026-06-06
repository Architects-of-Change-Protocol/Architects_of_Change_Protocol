export type RuntimeLogDecision = 'allow' | 'deny';
export type RuntimeLogEntry = {
    requestId: string;
    endpoint: string;
    decision: RuntimeLogDecision;
    reason_code: string;
};
export declare class RuntimeLogger {
    log(entry: RuntimeLogEntry): void;
}
//# sourceMappingURL=runtime-logger.d.ts.map