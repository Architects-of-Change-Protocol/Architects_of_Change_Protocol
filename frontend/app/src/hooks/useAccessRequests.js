import { useCallback, useEffect, useState } from 'react';
import { runtimeClient } from '../lib/runtimeClient';
export function useAccessRequests(input) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load requests.');
            setRequests([]);
        }
        finally {
            setLoading(false);
        }
    }, [input.requesterId, input.status, input.subjectId]);
    useEffect(() => {
        void load();
    }, [load]);
    return { requests, loading, error, reload: load };
}
