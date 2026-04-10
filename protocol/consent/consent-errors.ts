export class ConsentParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConsentParseError';
  }
}

export class ConsentValidationError extends Error {
  readonly errors: string[];

  constructor(message: string, errors: string[]) {
    super(message);
    this.name = 'ConsentValidationError';
    this.errors = errors;
  }
}
