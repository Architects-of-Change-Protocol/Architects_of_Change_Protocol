export class ExecutionRequestParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExecutionRequestParseError';
    }
}
