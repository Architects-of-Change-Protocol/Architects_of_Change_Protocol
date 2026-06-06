export type RuntimeLogDecision = 'allow' | 'deny';

export type RuntimeLogEntry = {
  requestId: string;
  endpoint: string;
  decision: RuntimeLogDecision;
  reason_code: string;
};

export class RuntimeLogger {
  log(entry: RuntimeLogEntry): void {
    // Structured JSON logs for ingestion by future observability pipeline.
    console.log(JSON.stringify(entry));
  }
}
