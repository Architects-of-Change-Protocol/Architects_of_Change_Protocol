import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { getDatasetLabel, getPurposeLabel, getScopeLabel } from '../lib/labels';
import { MOCK_REQUESTER_ID, MOCK_SUBJECT_ID } from '../lib/runtimeClient';

export function EnterpriseConsolePage() {
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
  } = useAccessRequests({
    subjectId: MOCK_SUBJECT_ID,
    requesterId: MOCK_REQUESTER_ID,
  });

  const {
    grants,
    loading: grantsLoading,
    error: grantsError,
  } = useGrants({
    requesterId: MOCK_REQUESTER_ID,
  });

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Enterprise Dashboard</h1>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Data access requests</h2>

        {requestsError !== null && <p className="text-red-300 text-sm">{requestsError}</p>}

        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Dataset</th>
              <th className="p-2">Why</th>
              <th className="p-2">What was requested</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {!requestsLoading && requests.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={4}>
                  No data requests sent
                </td>
              </tr>
            )}

            {requests.map((request) => (
              <tr key={request.request_id} className="border-t border-white/10">
                <td className="p-2">{getDatasetLabel(request.dataset_id)}</td>
                <td className="p-2">{getPurposeLabel(request.purpose)}</td>
                <td className="p-2">{getScopeLabel(request.requested_scope)}</td>
                <td className="p-2">{request.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Active data access</h2>

        {grantsError !== null && <p className="text-red-300 text-sm">{grantsError}</p>}

        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Dataset</th>
              <th className="p-2">Why</th>
              <th className="p-2">What is accessible</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {!grantsLoading && grants.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={4}>
                  No active data access
                </td>
              </tr>
            )}

            {grants.map((grant) => (
              <tr key={grant.grant_id} className="border-t border-white/10">
                <td className="p-2">{getDatasetLabel(grant.dataset_id)}</td>
                <td className="p-2">Approved data access</td>
                <td className="p-2">{getScopeLabel(grant.scope)}</td>
                <td className="p-2">{grant.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
