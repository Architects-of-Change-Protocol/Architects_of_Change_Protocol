import { AudienceRing } from '../components/enterprise/AudienceRing';
import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { MOCK_REQUESTER_ID, MOCK_SUBJECT_ID } from '../lib/runtimeClient';

type ActivityItem = {
  actor: string;
  action: string;
  time: string;
  status: 'ok' | 'warning';
};

const activity: ActivityItem[] = [
  { actor: 'Acme Analytics', action: 'Read permission renewed for Behavior Events', time: '5m ago', status: 'ok' },
  { actor: 'Compliance Bot', action: 'Revocation window detected for Financial Metadata', time: '27m ago', status: 'warning' },
  { actor: 'Ops Team', action: 'Scoped access request approved', time: '1h ago', status: 'ok' },
  { actor: 'Trust Engine', action: 'Anomalous access blocked by policy', time: '2h ago', status: 'ok' },
];

export function EnterpriseConsolePage() {
  const { requests, loading: requestsLoading } = useAccessRequests({
    subjectId: MOCK_SUBJECT_ID,
    requesterId: MOCK_REQUESTER_ID,
  });
  const { grants, loading: grantsLoading } = useGrants({ requesterId: MOCK_REQUESTER_ID });

  const loading = requestsLoading || grantsLoading;
  const activeGrants = grants.filter((grant) => grant.status === 'active').length;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Phase 2</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Consent Relationship Console</h1>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300">
          Relationship infrastructure only · Campaign automation disabled
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[['Audience Profiles', 19420], ['Active Consents', activeGrants], ['Pending Reviews', requests.length], ['Revocations (30d)', 14]].map((item) => (
          <article key={item[0]} className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{item[0]}</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-white">{Number(item[1]).toLocaleString()}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900 xl:col-span-2">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Audience overview</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AudienceRing label="Explicit Opt-In" value={15210} total={19420} tone="emerald" />
            <AudienceRing label="Limited Scope" value={8240} total={19420} tone="sky" />
            <AudienceRing label="Needs Reconfirmation" value={2310} total={19420} tone="amber" />
            <AudienceRing label="High Trust Continuity" value={12980} total={19420} tone="violet" />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Expiring permissions</h2>
          <div className="mt-4 space-y-3">
            {['Behavioral insights · 12h', 'Purchase history · 1d', 'Preference center · 2d'].map((item) => (
              <div key={item} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 dark:border-white/10 dark:text-zinc-200">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Consent activity panel</h2>
          {loading ? (
            <div className="mt-4 space-y-2">
              {[1, 2, 3].map((r) => <div key={r} className="h-10 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />)}
            </div>
          ) : requests.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">No consent requests yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {requests.slice(0, 5).map((request) => (
                <li key={request.request_id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10">
                  <span className="text-zinc-700 dark:text-zinc-200">{request.dataset_id}</span>
                  <span className="text-xs uppercase text-zinc-500">{request.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Relationship continuity metrics</h2>
          <div className="mt-4 space-y-4">
            {[
              ['Continuity score', 92],
              ['Trust retention', 88],
              ['Renewal completion', 81],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div>
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800"><div className="h-2 rounded-full bg-zinc-900 transition-all dark:bg-white" style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Audit activity stream</h2>
        <ul className="mt-4 space-y-3">
          {activity.map((item) => (
            <li key={`${item.actor}-${item.time}`} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3 dark:border-white/10">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.action}</p>
                <p className="text-xs text-zinc-500">{item.actor}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs ${item.status === 'ok' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}>{item.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
