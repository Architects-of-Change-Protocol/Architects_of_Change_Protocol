import { AIAttestation, AIAttestationValidationOptions, ValidationResult } from './types';

const aiAttestations = new Map<string, AIAttestation>();

export function createAIAttestation(input: AIAttestation): AIAttestation {
  aiAttestations.set(input.aiActorId, input);
  return input;
}

export function validateAIAttestation(input: AIAttestation, options: AIAttestationValidationOptions = {}): ValidationResult {
  const reasons: string[] = [];
  if (!input.aiActorId || input.allowedScopes.length === 0) reasons.push('missing_required_fields');

  const unauthorizedActions = input.executedActions.filter((action) => !input.allowedScopes.includes(action));
  if (unauthorizedActions.length > 0) reasons.push('allowed_scope_incompatible');

  if (typeof options.maxAutonomousUseCount === 'number' && input.autonomousUseCount > options.maxAutonomousUseCount) {
    reasons.push('autonomous_use_limit_exceeded');
  }

  const humanReviewRequired = options.humanReviewRequiredActions ?? [];
  if (input.executedActions.some((action) => humanReviewRequired.includes(action)) && input.humanReviewRefs.length === 0) {
    reasons.push('human_review_required');
  }

  const escalationRequired = options.escalationRequiredActions ?? [];
  if (input.executedActions.some((action) => escalationRequired.includes(action)) && input.escalationRefs.length === 0) {
    reasons.push('escalation_required');
  }

  return { valid: reasons.length === 0, reasons };
}

export function resolveAIAttestation(aiActorId: string): AIAttestation | undefined {
  return aiAttestations.get(aiActorId);
}
