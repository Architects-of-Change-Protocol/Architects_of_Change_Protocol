export class EnforcementRequestParseError extends Error {
  readonly name = 'EnforcementRequestParseError';

  constructor(message: string) {
    super(message);
  }
}
