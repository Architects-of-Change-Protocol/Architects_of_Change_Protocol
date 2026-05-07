import { RuntimeAIGovernanceProfile } from './types';

const aiProfiles = new Map<string, RuntimeAIGovernanceProfile>();
export function validateRuntimeAIGovernanceProfile(p: RuntimeAIGovernanceProfile): boolean {
  if (p.escalationPolicyRefs.some((r) => !r)) return false;
  return Object.values(p.autonomousExecutionLimits).every((v) => v >= 0);
}
export function createRuntimeAIGovernanceProfile(input: RuntimeAIGovernanceProfile): RuntimeAIGovernanceProfile { if (!validateRuntimeAIGovernanceProfile(input)) throw new Error('Invalid runtime AI governance profile'); aiProfiles.set(input.aiGovernanceProfileId,input); return input; }
export function evaluateRuntimeAIExecutionEligibility(profile: RuntimeAIGovernanceProfile, request: { aiActorType: string; scope: string; action: string; requestedAutonomyLevel: number; humanReviewCompleted: boolean; }): boolean {
  if (!profile.allowedAiActorTypes.includes(request.aiActorType)) return false;
  if (profile.blockedScopes.includes(request.scope)) return false;
  if (profile.humanReviewRequiredActions.includes(request.action) && !request.humanReviewCompleted) return false;
  const max = profile.autonomousExecutionLimits[request.action] ?? 0;
  return request.requestedAutonomyLevel <= max;
}
