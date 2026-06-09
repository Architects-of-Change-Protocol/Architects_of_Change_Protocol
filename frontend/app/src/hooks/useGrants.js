import { useCallback, useEffect, useState } from 'react';
import { runtimeClient } from '../lib/runtimeClient';
export function useGrants(input) {
    const [grants, setGrants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await runtimeClient.listActiveGrants({
                subject_id: input.subjectId,
                requester_id: input.requesterId,
            });
            setGrants(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load grants.');
            setGrants([]);
        }
        finally {
            setLoading(false);
        }
    }, [input.requesterId, input.subjectId]);
    useEffect(() => {
        void load();
    }, [load]);
    return { grants, loading, error, reload: load };
}
