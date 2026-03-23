const MARKET_MAKER_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/;

export function validateMarketMakerId(
  marketMakerId: string | undefined,
  fieldName: string
): void {
  if (marketMakerId === undefined) {
    return;
  }

  if (typeof marketMakerId !== 'string' || marketMakerId.trim() === '') {
    throw new Error(`${fieldName} must be a non-empty string when provided.`);
  }

  if (!MARKET_MAKER_ID_PATTERN.test(marketMakerId)) {
    throw new Error(
      `${fieldName} must contain only lowercase letters, numbers, dots, underscores, or hyphens and be at most 128 characters.`
    );
  }
}
