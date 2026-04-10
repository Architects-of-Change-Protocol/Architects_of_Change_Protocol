export class AdapterParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterParseError';
  }
}

export class AdapterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterValidationError';
  }
}

export class AdapterRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdapterRegistryError';
  }
}
