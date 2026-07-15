import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { useDecisions } from '../hooks/useDecisions';
import {
  getDatasetLabel,
  getPurposeLabel,
  getRequesterLabel,
  getScopeLabel,
} from '../lib/labels';
import { MOCK_SUBJECT_ID } from '../aoc/runtime-consumer';

export function UserConsolePage() {
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useAccessRequests({
    subjectId: MOCK_SUBJECT_ID,
    status: 'pending',
  });

  const {
    grants,
    loading: grantsLoading,
    error: grantsError,
    reload: reloadGrants,
  } = useGrants({
    subjectId: MOCK_SUBJECT_ID,
  });

  const {
    decide,
    revoke,
    decisionLoadingId,
    revokeLoadingId,
    dismissedRequestIds,
    recentlyApprovedRequestId,
  } = useDecisions(reloadRequests, reloadGrants);

  const visibleRequests = requests.filter(
    (request) => dismissedRequestIds[request.request_id] === undefined,
  );

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">User Dashboard</h1>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Who wants your data</h2>
        <p className="text-sm text-white/60">You decide who can access your data</p>

        {recentlyApprovedRequestId !== null && (
          <p className="text-emerald-300 text-sm">Approved</p>
        )}

        {requestsError !== null && <p className="text-red-300 text-sm">{requestsError}</p>}

        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Requester</th>
              <th className="p-2">Dataset</th>
              <th className="p-2">Why</th>
              <th className="p-2">What they want</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!requestsLoading && visibleRequests.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={5}>
                  No one is requesting your data
                </td>
              </tr>
            )}

            {visibleRequests.map((request) => (
              <tr key={request.request_id} className="border-t border-white/10">
                <td className="p-2">{getRequesterLabel(request.requester_id)}</td>
                <td className="p-2">{getDatasetLabel(request.dataset_id)}</td>
                <td className="p-2">{getPurposeLabel(request.purpose)}</td>
                <td className="p-2">{getScopeLabel(request.requested_scope)}</td>
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
                      {decisionLoadingId === request.request_id ? 'Approving...' : 'Approve'}
                    </button>

                    <button
                      type="button"
                      disabled={decisionLoadingId === request.request_id}
                      className="px-2 py-1 border border-white/25 rounded"
                      onClick={() => {
                        void decide(request.request_id, 'deny');
                      }}
                    >
                      {decisionLoadingId === request.request_id ? 'Working...' : 'Deny'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Who has access now</h2>

        {grantsError !== null && <p className="text-red-300 text-sm">{grantsError}</p>}

        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Who</th>
              <th className="p-2">Dataset</th>
              <th className="p-2">Why</th>
              <th className="p-2">What they can access</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!grantsLoading && grants.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={5}>
                  No active access to your data
                </td>
              </tr>
            )}

            {grants.map((grant) => (
              <tr key={grant.grant_id} className="border-t border-white/10">
                <td className="p-2">{getRequesterLabel(grant.requester_id)}</td>
                <td className="p-2">{getDatasetLabel(grant.dataset_id)}</td>
                <td className="p-2">Approved data access</td>
                <td className="p-2">{getScopeLabel(grant.scope)}</td>
                <td className="p-2">
                  <button
                    type="button"
                    disabled={revokeLoadingId === grant.grant_id}
                    className="px-2 py-1 border border-white/25 rounded"
                    onClick={() => {
                      void revoke(grant.grant_id);
                    }}
                  >
                    {revokeLoadingId === grant.grant_id ? 'Revoking...' : 'Revoke'}
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
