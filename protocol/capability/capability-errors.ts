export class CapabilityMintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CapabilityMintError';
  }
}

export class CapabilityParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CapabilityParseError';
  }
}
