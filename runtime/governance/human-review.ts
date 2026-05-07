import { setSessionState } from './governance-session';
import type { HumanReviewRequest, GovernanceSession } from './types';

export function createHumanReviewRequest(
  session: GovernanceSession,
  input: {
    reviewId: string;
    actorId: string;
    requestedAction: string;
    requestedScopes: string[];
    reasonCodes: string[];
    escalationRef?: string;
  }
): { session: GovernanceSession; review: HumanReviewRequest } {
  const review: HumanReviewRequest = {
    reviewId: input.reviewId,
    actorId: input.actorId,
    requestedAction: input.requestedAction,
    requestedScopes: input.requestedScopes,
    reasonCodes: input.reasonCodes,
    escalationRef: input.escalationRef,
    reviewStatus: 'pending',
  };
  return { session: setSessionState(session, 'awaiting_human_review'), review };
}

export function approveHumanReview(session: GovernanceSession, review: HumanReviewRequest): { session: GovernanceSession; review: HumanReviewRequest } {
  if (review.reviewStatus !== 'pending') throw new Error(`Review already resolved: ${review.reviewId}`);
  return { session: setSessionState(session, 'evaluating'), review: { ...review, reviewStatus: 'approved' } };
}

export function denyHumanReview(session: GovernanceSession, review: HumanReviewRequest): { session: GovernanceSession; review: HumanReviewRequest } {
  if (review.reviewStatus !== 'pending') throw new Error(`Review already resolved: ${review.reviewId}`);
  return { session: setSessionState(session, 'denied'), review: { ...review, reviewStatus: 'denied' } };
}
