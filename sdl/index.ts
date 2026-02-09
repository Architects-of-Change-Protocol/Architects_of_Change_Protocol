export { parseSDLPath } from './parser';
export { validateSDLPath, parseAndValidateSDLPath, CANONICAL_DOMAINS } from './validator';
export type {
  SDLScopeSegment,
  SDLPath,
  SDLFieldRef,
  SDLParseResult,
  SDLParseError,
  SDLErrorCode,
  SDLValidationResult,
} from './types';
