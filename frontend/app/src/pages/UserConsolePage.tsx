import { useState } from 'react';
import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { MOCK_SUBJECT_ID, runtimeClient } from '../lib/runtimeClient';

export function UserConsolePage() {
  const { requests, loading: requestsLoading, error: requestsError, reload: reloadRequests } = useAccessRequests({
    subjectId: MOCK_SUBJECT_ID,
    status: 'pending',
  });
  const { grants, loading: grantsLoading, error: grantsError, reload: reloadGrants } = useGrants({
    subjectId: MOCK_SUBJECT_ID,
  });

  const [decisionLoadingId, setDecisionLoadingId] = useState<string | null>(null);
  const [revokeLoadingId, setRevokeLoadingId] = useState<string | null>(null);

  const decide = async (requestId: string, decision: 'approve' | 'deny') => {
    setDecisionLoadingId(requestId);
    try {
      await runtimeClient.decideAccessRequest({
        request_id: requestId,
        subject_id: MOCK_SUBJECT_ID,
        decision,
      });
      await Promise.all([reloadRequests(), reloadGrants()]);
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

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">User Dashboard</h1>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Requests Inbox</h2>
        {requestsError !== null && <p className="text-red-300 text-sm">{requestsError}</p>}
        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Request</th>
              <th className="p-2">Requester</th>
              <th className="p-2">Dataset</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Scope</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!requestsLoading && requests.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={6}>
                  No pending requests.
                </td>
              </tr>
            )}
            {requests.map((request) => (
              <tr key={request.request_id} className="border-t border-white/10">
                <td className="p-2">{request.request_id}</td>
                <td className="p-2">{request.requester_id}</td>
                <td className="p-2">{request.dataset_id}</td>
                <td className="p-2">{request.purpose}</td>
                <td className="p-2">{request.requested_scope.join(', ')}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={decisionLoadingId === request.request_id}
                      className="px-2 py-1 border border-white/25 rounded"
                      onClick={() => {
                        void decide(request.request_id, 'approve');
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={decisionLoadingId === request.request_id}
                      className="px-2 py-1 border border-white/25 rounded"
                      onClick={() => {
                        void decide(request.request_id, 'deny');
                      }}
                    >
                      Deny
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Active Accesses</h2>
        {grantsError !== null && <p className="text-red-300 text-sm">{grantsError}</p>}
        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Grant</th>
              <th className="p-2">Requester</th>
              <th className="p-2">Dataset</th>
              <th className="p-2">Scope</th>
              <th className="p-2">Granted At</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!grantsLoading && grants.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={6}>
                  No active grants.
                </td>
              </tr>
            )}
            {grants.map((grant) => (
              <tr key={grant.grant_id} className="border-t border-white/10">
                <td className="p-2">{grant.grant_id}</td>
                <td className="p-2">{grant.requester_id}</td>
                <td className="p-2">{grant.dataset_id}</td>
                <td className="p-2">{grant.scope.join(', ')}</td>
                <td className="p-2">{grant.granted_at}</td>
                <td className="p-2">
                  <button
                    type="button"
                    disabled={revokeLoadingId === grant.grant_id}
                    className="px-2 py-1 border border-white/25 rounded"
                    onClick={() => {
                      void revoke(grant.grant_id);
                    }}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
