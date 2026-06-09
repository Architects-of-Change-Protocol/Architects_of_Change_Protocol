import { useCallback, useEffect, useState } from 'react';
import type { AccessRequest } from '../../../../runtime/controlPlane';
import { runtimeClient } from '../lib/runtimeClient';

type UseAccessRequestsInput = {
  subjectId: string;
  requesterId?: string;
  status?: 'pending' | 'approved' | 'denied';
};

export function useAccessRequests(input: UseAccessRequestsInput) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await runtimeClient.listAccessRequests({
        subject_id: input.subjectId,
        requester_id: input.requesterId,
        status: input.status,
      });

      const filtered = input.requesterId === undefined ? data : data.filter((item) => item.requester_id === input.requesterId);
      setRequests(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [input.requesterId, input.status, input.subjectId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { requests, loading, error, reload: load };
}
