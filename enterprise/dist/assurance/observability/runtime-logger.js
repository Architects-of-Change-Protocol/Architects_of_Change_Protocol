"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeLogger = void 0;
class RuntimeLogger {
    log(entry) {
        // Structured JSON logs for ingestion by future observability pipeline.
        console.log(JSON.stringify(entry));
    }
}
exports.RuntimeLogger = RuntimeLogger;
