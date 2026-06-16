import { useState } from 'react';
import { runtimeClient } from '../lib/runtimeClient';
import { MOCK_SUBJECT_ID } from '../aoc/runtime-consumer';

export function useDecisions(reload: () => Promise<void>, reloadGrants: () => Promise<void>) {
  const [decisionLoadingId, setDecisionLoadingId] = useState<string | null>(null);
  const [revokeLoadingId, setRevokeLoadingId] = useState<string | null>(null);
  const [dismissedRequestIds, setDismissedRequestIds] = useState<Record<string, true>>({});
  const [recentlyApprovedRequestId, setRecentlyApprovedRequestId] = useState<string | null>(null);

  const decide = async (requestId: string, decision: 'approve' | 'deny') => {
    setDecisionLoadingId(requestId);
    try {
      await runtimeClient.decideAccessRequest({
        request_id: requestId,
        subject_id: MOCK_SUBJECT_ID,
        decision,
      });
      setDismissedRequestIds((current) => ({ ...current, [requestId]: true }));
      if (decision === 'approve') {
        setRecentlyApprovedRequestId(requestId);
        window.setTimeout(() => {
          setRecentlyApprovedRequestId((current) => (current === requestId ? null : current));
        }, 1400);
      }
      await Promise.all([reload(), reloadGrants()]);
    } finally {
      setDecisionLoadingId(null);
    }
  };

  const revoke = async (grantId: string) => {
    setRevokeLoadingId(grantId);
    try {
      await runtimeClient.revokeGrant({
        grant_id: grantId,
        subject_id: MOCK_SUBJECT_ID,
      });
      await reloadGrants();
    } finally {
      setRevokeLoadingId(null);
    }
  };

  return { decide, revoke, decisionLoadingId, revokeLoadingId, dismissedRequestIds, recentlyApprovedRequestId };
}
