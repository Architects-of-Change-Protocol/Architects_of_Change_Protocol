export class ExecutionRequestParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionRequestParseError';
  }
}
