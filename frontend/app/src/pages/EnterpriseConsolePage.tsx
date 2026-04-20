import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { MOCK_REQUESTER_ID, MOCK_SUBJECT_ID } from '../lib/runtimeClient';

export function EnterpriseConsolePage() {
  const { requests, loading: requestsLoading, error: requestsError } = useAccessRequests({
    subjectId: MOCK_SUBJECT_ID,
    requesterId: MOCK_REQUESTER_ID,
  });
  const { grants, loading: grantsLoading, error: grantsError } = useGrants({
    requesterId: MOCK_REQUESTER_ID,
  });

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Enterprise Dashboard</h1>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Requests Sent</h2>
        {requestsError !== null && <p className="text-red-300 text-sm">{requestsError}</p>}
        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Request</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Dataset</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Status</th>
              <th className="p-2">Scope</th>
            </tr>
          </thead>
          <tbody>
            {!requestsLoading && requests.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={6}>
                  No requests found.
                </td>
              </tr>
            )}
            {requests.map((request) => (
              <tr key={request.request_id} className="border-t border-white/10">
                <td className="p-2">{request.request_id}</td>
                <td className="p-2">{request.subject_id}</td>
                <td className="p-2">{request.dataset_id}</td>
                <td className="p-2">{request.purpose}</td>
                <td className="p-2">{request.status}</td>
                <td className="p-2">{request.requested_scope.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Active Access Inventory</h2>
        {grantsError !== null && <p className="text-red-300 text-sm">{grantsError}</p>}
        <table className="w-full text-sm border border-white/10">
          <thead className="text-left bg-white/5">
            <tr>
              <th className="p-2">Grant</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Dataset</th>
              <th className="p-2">Status</th>
              <th className="p-2">Scope</th>
            </tr>
          </thead>
          <tbody>
            {!grantsLoading && grants.length === 0 && (
              <tr>
                <td className="p-2 text-white/60" colSpan={5}>
                  No active grants found.
                </td>
              </tr>
            )}
            {grants.map((grant) => (
              <tr key={grant.grant_id} className="border-t border-white/10">
                <td className="p-2">{grant.grant_id}</td>
                <td className="p-2">{grant.subject_id}</td>
                <td className="p-2">{grant.dataset_id}</td>
                <td className="p-2">{grant.status}</td>
                <td className="p-2">{grant.scope.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
