import {
  completeGovernanceSession,
  createGovernanceSession,
  failGovernanceSession,
  setSessionState,
  startGovernanceEvaluation,
} from './governance-session';
import { createEscalation, resolveEscalation } from './escalation-runtime';
import { approveHumanReview, createHumanReviewRequest, denyHumanReview } from './human-review';
import { completeObligation, failObligation, registerObligation } from './obligation-runtime';
import type {
  AiGovernanceFlags,
  AuditHook,
  EscalationPath,
  GovernanceObligation,
  GovernanceSession,
  HumanReviewRequest,
  RelationshipValidationHook,
} from './types';

export class GovernanceRuntime {
  private readonly auditHook?: AuditHook;
  private readonly relationshipValidationHook?: RelationshipValidationHook;

  constructor(deps: { auditHook?: AuditHook; relationshipValidationHook?: RelationshipValidationHook } = {}) {
    this.auditHook = deps.auditHook;
    this.relationshipValidationHook = deps.relationshipValidationHook;
  }

  createGovernanceSession = createGovernanceSession;
  startGovernanceEvaluation = startGovernanceEvaluation;
  completeGovernanceSession = completeGovernanceSession;
  failGovernanceSession = failGovernanceSession;

  applyPdpObligations(session: GovernanceSession, obligations: readonly GovernanceObligation[]): GovernanceSession {
    let current = session;
    for (const obligation of obligations) {
      current = registerObligation(current, obligation);
    }
    this.emit('PDP_OBLIGATIONS_REGISTERED', { sessionId: current.sessionId, obligationCount: obligations.length });
    return current;
  }

  applyIdentityGovernanceFlags(
    session: GovernanceSession,
    flags: AiGovernanceFlags
  ): { session: GovernanceSession; escalations: EscalationPath[]; humanReview?: HumanReviewRequest } {
    let current = session;
    const escalations: EscalationPath[] = [];
    let review: HumanReviewRequest | undefined;

    if (flags.requiresEscalation) {
      const result = createEscalation(current, {
        escalationId: `esc_${current.sessionId}`,
        escalationType: 'ai_governance_restriction',
        triggeredBy: 'identity_policy',
        targetActorId: current.actorId,
        reasonCodes: flags.reasonCodes ?? ['AI_GOVERNANCE_ESCALATION'],
      });
      current = result.session;
      escalations.push(result.escalation);
    }

    if (flags.requiresHumanReview) {
      const created = createHumanReviewRequest(current, {
        reviewId: `review_${current.sessionId}`,
        actorId: current.actorId,
        requestedAction: 'resolve_ai_governance_restriction',
        requestedScopes: [],
        reasonCodes: flags.reasonCodes ?? ['HUMAN_REVIEW_REQUIRED'],
        escalationRef: escalations[0]?.escalationId,
      });
      current = created.session;
      review = created.review;
    }

    this.emit('AI_GOVERNANCE_FLAGS_APPLIED', { sessionId: current.sessionId, flags });
    return { session: current, escalations, humanReview: review };
  }

  validateRelationship(session: GovernanceSession): GovernanceSession {
    if (this.relationshipValidationHook === undefined) return session;
    const validation = this.relationshipValidationHook(session.actorId, session.relationshipId);
    if (!validation.valid) {
      const failed = failGovernanceSession(session);
      this.emit('RELATIONSHIP_VALIDATION_FAILED', {
        sessionId: failed.sessionId,
        reasonCodes: validation.reasonCodes ?? ['RELATIONSHIP_VALIDATION_FAILED'],
      });
      return failed;
    }
    this.emit('RELATIONSHIP_VALIDATED', { sessionId: session.sessionId });
    return session;
  }

  resolveEscalationAndResume(session: GovernanceSession, escalation: EscalationPath): { session: GovernanceSession; escalation: EscalationPath } {
    const resolved = resolveEscalation(escalation);
    const resumed = setSessionState(session, 'evaluating');
    return { session: resumed, escalation: resolved };
  }

  approveHumanReview = approveHumanReview;
  denyHumanReview = denyHumanReview;
  registerObligation = registerObligation;
  completeObligation = completeObligation;
  failObligation = failObligation;

  private emit(eventType: string, payload: Record<string, unknown>): void {
    this.auditHook?.(eventType, payload);
  }
}
