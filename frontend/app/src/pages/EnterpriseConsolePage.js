import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AudienceRing } from '../components/enterprise/AudienceRing';
import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { MOCK_REQUESTER_ID, MOCK_SUBJECT_ID } from '../lib/runtimeClient';
const timelineEvents = [
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
const accessHistory = [
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
const statusStyles = {
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
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("header", { className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400", children: "AOC Auditability Engine" }), _jsx("h1", { className: "text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white", children: "Operational Trust & Consent Traceability" })] }), _jsx("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300", children: "Trust State: Verified \u00B7 Cryptographic event chain intact" })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-5", children: [['Active Consents', activeGrants], ['Access Decisions (24h)', 1284], ['Consent Uses (24h)', 4380], ['Scope Expirations', 53], ['Revocations', 14]].map((item) => (_jsxs("article", { className: "rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("p", { className: "text-sm text-zinc-500 dark:text-zinc-400", children: item[0] }), _jsx("p", { className: "mt-3 text-3xl font-semibold text-zinc-900 dark:text-white", children: Number(item[1]).toLocaleString() })] }, item[0]))) }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900 xl:col-span-2", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "Trust posture overview" }), _jsxs("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [_jsx(AudienceRing, { label: "Traceable Access", value: 18820, total: 19420, tone: "emerald" }), _jsx(AudienceRing, { label: "Consent-Bound Usage", value: 17680, total: 19420, tone: "sky" }), _jsx(AudienceRing, { label: "Scope Near Expiry", value: 2410, total: 19420, tone: "amber" }), _jsx(AudienceRing, { label: "Revocation Coverage", value: 19420, total: 19420, tone: "violet" })] })] }), _jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "AI-agent access tracking" }), _jsxs("div", { className: "mt-4 space-y-3 text-sm", children: [_jsxs("div", { className: "rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10", children: [_jsx("p", { className: "font-medium", children: "12 active agents" }), _jsx("p", { className: "text-zinc-500", children: "All sessions capability-scoped" })] }), _jsxs("div", { className: "rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10", children: [_jsx("p", { className: "font-medium", children: "2 autonomous revocations" }), _jsx("p", { className: "text-zinc-500", children: "Policy drift caught before execution" })] }), _jsxs("div", { className: "rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10", children: [_jsx("p", { className: "font-medium", children: "100% event attestation" }), _jsx("p", { className: "text-zinc-500", children: "Signed runtime proof for each call" })] })] })] })] }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [_jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "Audit timeline" }), _jsx("ul", { className: "mt-4 space-y-3", children: timelineEvents.map((item) => (_jsx("li", { className: "rounded-xl border border-zinc-200 px-4 py-3 dark:border-white/10", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-zinc-900 dark:text-white", children: item.title }), _jsxs("p", { className: "text-xs text-zinc-500", children: [item.actor, " \u00B7 ", item.channel, " \u00B7 ", item.details] })] }), _jsx("span", { className: `rounded-full px-2 py-1 text-xs ${statusStyles[item.status]}`, children: item.time })] }) }, item.id))) })] }), _jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "Access history" }), _jsx("div", { className: "mt-4 overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[620px] text-sm", children: [_jsx("thead", { className: "text-left text-xs uppercase text-zinc-500", children: _jsxs("tr", { children: [_jsx("th", { children: "Requester" }), _jsx("th", { children: "Dataset" }), _jsx("th", { children: "Scope" }), _jsx("th", { children: "Decision" }), _jsx("th", { children: "Time" })] }) }), _jsx("tbody", { children: accessHistory.map((row) => (_jsxs("tr", { className: "border-t border-zinc-200 dark:border-white/10", children: [_jsx("td", { className: "py-2 pr-2", children: row.requester }), _jsx("td", { children: row.dataset }), _jsx("td", { children: row.scope }), _jsx("td", { children: _jsx("span", { className: `rounded-full px-2 py-1 text-xs ${row.decision === 'allowed' ? statusStyles.verified : row.decision === 'restricted' ? statusStyles.warning : statusStyles.blocked}`, children: row.decision }) }), _jsx("td", { className: "text-zinc-500", children: row.time })] }, row.id))) })] }) })] })] }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "Consent usage history" }), _jsx("ul", { className: "mt-4 space-y-2 text-sm", children: consentUsageHistory.map((item) => _jsxs("li", { className: "rounded-lg border border-zinc-200 p-3 dark:border-white/10", children: [_jsx("p", { className: "font-medium", children: item.scope }), _jsxs("p", { className: "text-xs text-zinc-500", children: [item.grant, " \u00B7 ", item.lawfulBasis, " \u00B7 ", item.uses, " uses \u00B7 ", item.lastUse] })] }, item.grant)) })] }), _jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "Scope expiration events" }), _jsx("ul", { className: "mt-4 space-y-2 text-sm", children: scopeExpirationEvents.map((item) => _jsxs("li", { className: "rounded-lg border border-zinc-200 p-3 dark:border-white/10", children: [_jsx("p", { className: "font-medium", children: item.scope }), _jsxs("p", { className: "text-xs text-zinc-500", children: [item.impacted, " impacted \u00B7 ", item.window, " \u00B7 ", item.nextAction] })] }, item.scope)) })] }), _jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "Revocation history" }), _jsx("ul", { className: "mt-4 space-y-2 text-sm", children: revocationHistory.map((item) => _jsxs("li", { className: "rounded-lg border border-zinc-200 p-3 dark:border-white/10", children: [_jsx("p", { className: "font-medium", children: item.principal }), _jsxs("p", { className: "text-xs text-zinc-500", children: [item.scope, " \u00B7 ", item.reason, " \u00B7 ", item.time] })] }, item.id)) })] })] }), _jsxs("section", { className: "rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-zinc-900", children: [_jsx("h2", { className: "text-sm font-medium text-zinc-600 dark:text-zinc-300", children: "Request review queue" }), loading ? (_jsx("div", { className: "mt-4 space-y-2", children: [1, 2, 3].map((r) => _jsx("div", { className: "h-10 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" }, r)) })) : requests.length === 0 ? (_jsx("p", { className: "mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400", children: "No consent requests yet." })) : (_jsx("ul", { className: "mt-4 space-y-2 text-sm", children: requests.slice(0, 5).map((request) => (_jsxs("li", { className: "flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-white/10", children: [_jsx("span", { className: "text-zinc-700 dark:text-zinc-200", children: request.dataset_id }), _jsx("span", { className: "text-xs uppercase text-zinc-500", children: request.status })] }, request.request_id))) }))] })] }));
}
