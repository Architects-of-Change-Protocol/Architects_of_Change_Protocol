export { parseConsent } from './consent-object';
export { normalizeConsent } from './consent-normalizer';
export { validateConsent } from './consent-validator';
export { evaluateConsentState, isConsentActive, isConsentRevoked } from './consent-state';
export { doesConsentAllowScope } from './consent-machine';

export { ConsentParseError, ConsentValidationError } from './consent-errors';

export type {
  ProtocolConsent,
  ConsentState,
  ConsentValidationResult,
  ConsentStateResult,
  ConsentEvaluationOptions,
  ConsentScopeRequest,
} from './consent-types';
