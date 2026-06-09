import { AudienceRing } from '../components/enterprise/AudienceRing';
import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { MOCK_REQUESTER_ID, MOCK_SUBJECT_ID } from '../lib/runtimeClient';

type EventType = 'access' | 'consent' | 'scope_expiry' | 'revocation' | 'agent';
type EventStatus = 'verified' | 'warning' | 'blocked';

type TimelineEvent = {
  id: string;
  actor: string;
  channel: string;
  title: string;
  details: string;
  time: string;
  type: EventType;
  status: EventStatus;
};

type AccessRow = {
  id: string;
  requester: string;
  dataset: string;
  scope: string;
  purpose: string;
  decision: 'allowed' | 'restricted' | 'denied';
  time: string;
};

const timelineEvents: TimelineEvent[] = [
  {
    id: 'evt-0134',
    actor: 'Forecast Agent v2.4',
    channel: 'AI-agent',
    title: 'Agent access token consumed',
    details: 'Read-only usage on behavioral segments with policy checksum validation.',
    time: '2m ago',
    type: 'agent',
    status: 'verified',
  },
  {
    id: 'evt-0133',
    actor: 'Acme Analytics',
    channel: 'Partner app',
    title: 'Consent usage recorded',
    details: 'Purchase-intent model retraining executed under explicit renewal grant.',
    time: '7m ago',
    type: 'consent',
    status: 'verified',
  },
  {
    id: 'evt-0132',
    actor: 'Trust Runtime',
    channel: 'Policy engine',
    title: 'Scope expiration event raised',
    details: 'Scope marketing.email.personalization expired for 129 profiles.',
    time: '18m ago',
    type: 'scope_expiry',
    status: 'warning',
  },
  {
    id: 'evt-0131',
    actor: 'Compliance Bot',
    channel: 'Control plane',
    title: 'Revocation enforced',
    details: 'Financial metadata access revoked and cache invalidated across adapters.',
    time: '34m ago',
    type: 'revocation',
    status: 'blocked',
  },
  {
    id: 'evt-0130',
    actor: 'Ops Team',
    channel: 'Console',
    title: 'Privileged access approved',
    details: 'Support-led approval for bounded support diagnostics window (4 hours).',
    time: '1h ago',
    type: 'access',
    status: 'verified',
  },
];

const accessHistory: AccessRow[] = [
  { id: 'acc-9001', requester: 'Forecast Agent v2.4', dataset: 'Behavioral Events', scope: 'read:segments', purpose: 'Audience prediction', decision: 'allowed', time: '2m ago' },
  { id: 'acc-9000', requester: 'Acme Analytics', dataset: 'Purchase History', scope: 'read:aggregates', purpose: 'Model retraining', decision: 'allowed', time: '7m ago' },
  { id: 'acc-8999', requester: 'Support Bot', dataset: 'Profile Metadata', scope: 'read:identity', purpose: 'Ticket enrichment', decision: 'restricted', time: '23m ago' },
  { id: 'acc-8998', requester: 'Legacy Exporter', dataset: 'Financial Metadata', scope: 'read:ledger', purpose: 'Nightly export', decision: 'denied', time: '35m ago' },
];

const consentUsageHistory = [
  { grant: 'grant_291K', scope: 'marketing.personalization', uses: 33, lawfulBasis: 'Explicit opt-in', lastUse: '7m ago' },
  { grant: 'grant_208A', scope: 'analytics.behavioral', uses: 112, lawfulBasis: 'Explicit opt-in', lastUse: '2m ago' },
  { grant: 'grant_188P', scope: 'support.diagnostics', uses: 5, lawfulBasis: 'Contextual consent', lastUse: '1h ago' },
];

const scopeExpirationEvents = [
  { scope: 'marketing.email.personalization', impacted: 129, window: 'Expired 18m ago', nextAction: 'Re-consent required' },
  { scope: 'support.diagnostics', impacted: 41, window: 'Expires in 3h', nextAction: 'Monitor active sessions' },
  { scope: 'analytics.lookalike', impacted: 320, window: 'Expires in 1d', nextAction: 'Batch renewal scheduled' },
];

const revocationHistory = [
  { id: 'rev-4129', principal: 'Legacy Exporter', scope: 'financial.read', reason: 'Policy conflict', time: '34m ago' },
  { id: 'rev-4124', principal: 'Growth Toolkit', scope: 'marketing.full', reason: 'Subject withdrawal', time: '5h ago' },
  { id: 'rev-4110', principal: 'Support Bot', scope: 'identity.write', reason: 'Scope minimization', time: '1d ago' },
];

const statusStyles: Record<EventStatus, string> = {
  verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
};

export function EnterpriseConsolePage() {
  const { requests, loading: requestsLoading } = useAccessRequests({
    subjectId: MOCK_SUBJECT_ID,
    requesterId: MOCK_REQUESTER_ID,
  });
  const { grants, loading: grantsLoading } = useGrants({ requesterId: MOCK_REQUESTER_ID });

  const loading = requestsLoading || grantsLoading;
  const activeGrants = grants.filter((grant) => !grant.revoked_at).length;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">AOC Auditability Engine</p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Operational Trust & Consent Traceability</h1>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
          Trust State: Verified · Cryptographic event chain intact
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[['Active Consents', activeGrants], ['Access Decisions (24h)', 1284], ['Consent Uses (24h)', 4380], ['Scope Expirations', 53], ['Revocations', 14]].map((item) => (
          <article key={item[0]} className="rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{item[0]}</p>
            <p className="mt-3 text-3xl font-semibold text-zinc-900 dark:text-white">{Number(item[1]).toLocaleString()}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900 xl:col-span-2">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Trust posture overview</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <AudienceRing label="Traceable Access" value={18820} total={19420} tone="emerald" />
            <AudienceRing label="Consent-Bound Usage" value={17680} total={19420} tone="sky" />
            <AudienceRing label="Scope Near Expiry" value={2410} total={19420} tone="amber" />
            <AudienceRing label="Revocation Coverage" value={19420} total={19420} tone="violet" />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">AI-agent access tracking</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10"><p className="font-medium">12 active agents</p><p className="text-zinc-500">All sessions capability-scoped</p></div>
            <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10"><p className="font-medium">2 autonomous revocations</p><p className="text-zinc-500">Policy drift caught before execution</p></div>
            <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10"><p className="font-medium">100% event attestation</p><p className="text-zinc-500">Signed runtime proof for each call</p></div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Audit timeline</h2>
          <ul className="mt-4 space-y-3">
            {timelineEvents.map((item) => (
              <li key={item.id} className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.actor} · {item.channel} · {item.details}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${statusStyles[item.status]}`}>{item.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Access history</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="text-left text-xs uppercase text-zinc-500"><tr><th>Requester</th><th>Dataset</th><th>Scope</th><th>Decision</th><th>Time</th></tr></thead>
              <tbody>
                {accessHistory.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-200 dark:border-white/10">
                    <td className="py-2 pr-2">{row.requester}</td><td>{row.dataset}</td><td>{row.scope}</td>
                    <td><span className={`rounded-full px-2 py-1 text-xs ${row.decision === 'allowed' ? statusStyles.verified : row.decision === 'restricted' ? statusStyles.warning : statusStyles.blocked}`}>{row.decision}</span></td>
                    <td className="text-zinc-500">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Consent usage history</h2>
          <ul className="mt-4 space-y-2 text-sm">{consentUsageHistory.map((item) => <li key={item.grant} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><p className="font-medium">{item.scope}</p><p className="text-xs text-zinc-500">{item.grant} · {item.lawfulBasis} · {item.uses} uses · {item.lastUse}</p></li>)}</ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Scope expiration events</h2>
          <ul className="mt-4 space-y-2 text-sm">{scopeExpirationEvents.map((item) => <li key={item.scope} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><p className="font-medium">{item.scope}</p><p className="text-xs text-zinc-500">{item.impacted} impacted · {item.window} · {item.nextAction}</p></li>)}</ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Revocation history</h2>
          <ul className="mt-4 space-y-2 text-sm">{revocationHistory.map((item) => <li key={item.id} className="rounded-lg border border-zinc-200 p-3 dark:border-white/10"><p className="font-medium">{item.principal}</p><p className="text-xs text-zinc-500">{item.scope} · {item.reason} · {item.time}</p></li>)}</ul>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Request review queue</h2>
        {loading ? (
          <div className="mt-4 space-y-2">{[1, 2, 3].map((r) => <div key={r} className="h-10 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />)}</div>
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
    </section>
  );
}
