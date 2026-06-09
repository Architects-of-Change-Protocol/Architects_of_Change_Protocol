import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAccessRequests } from '../hooks/useAccessRequests';
import { useGrants } from '../hooks/useGrants';
import { getDatasetLabel, getPurposeLabel, getRequesterLabel, getScopeLabel, } from '../lib/labels';
import { MOCK_SUBJECT_ID, runtimeClient } from '../lib/runtimeClient';
export function UserConsolePage() {
    const { requests, loading: requestsLoading, error: requestsError, reload: reloadRequests, } = useAccessRequests({
        subjectId: MOCK_SUBJECT_ID,
        status: 'pending',
    });
    const { grants, loading: grantsLoading, error: grantsError, reload: reloadGrants, } = useGrants({
        subjectId: MOCK_SUBJECT_ID,
    });
    const [decisionLoadingId, setDecisionLoadingId] = useState(null);
    const [revokeLoadingId, setRevokeLoadingId] = useState(null);
    const [dismissedRequestIds, setDismissedRequestIds] = useState({});
    const [recentlyApprovedRequestId, setRecentlyApprovedRequestId] = useState(null);
    const decide = async (requestId, decision) => {
        setDecisionLoadingId(requestId);
        try {
            await runtimeClient.decideAccessRequest({
                request_id: requestId,
                subject_id: MOCK_SUBJECT_ID,
                decision,
            });
            setDismissedRequestIds((current) => ({ ...current, [requestId]: true }));
            if (decision === 'approve') {
                setRecentlyApprovedRequestId(requestId);
                window.setTimeout(() => {
                    setRecentlyApprovedRequestId((current) => (current === requestId ? null : current));
                }, 1400);
            }
            await Promise.all([reloadRequests(), reloadGrants()]);
        }
        finally {
            setDecisionLoadingId(null);
        }
    };
    const revoke = async (grantId) => {
        setRevokeLoadingId(grantId);
        try {
            await runtimeClient.revokeGrant({
                grant_id: grantId,
                subject_id: MOCK_SUBJECT_ID,
            });
            await reloadGrants();
        }
        finally {
            setRevokeLoadingId(null);
        }
    };
    const visibleRequests = requests.filter((request) => dismissedRequestIds[request.request_id] === undefined);
    return (_jsxs("section", { className: "space-y-8", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "User Dashboard" }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Who wants your data" }), _jsx("p", { className: "text-sm text-white/60", children: "You decide who can access your data" }), recentlyApprovedRequestId !== null && (_jsx("p", { className: "text-emerald-300 text-sm", children: "Approved" })), requestsError !== null && _jsx("p", { className: "text-red-300 text-sm", children: requestsError }), _jsxs("table", { className: "w-full text-sm border border-white/10", children: [_jsx("thead", { className: "text-left bg-white/5", children: _jsxs("tr", { children: [_jsx("th", { className: "p-2", children: "Requester" }), _jsx("th", { className: "p-2", children: "Dataset" }), _jsx("th", { className: "p-2", children: "Why" }), _jsx("th", { className: "p-2", children: "What they want" }), _jsx("th", { className: "p-2", children: "Actions" })] }) }), _jsxs("tbody", { children: [!requestsLoading && visibleRequests.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "p-2 text-white/60", colSpan: 5, children: "No one is requesting your data" }) })), visibleRequests.map((request) => (_jsxs("tr", { className: "border-t border-white/10", children: [_jsx("td", { className: "p-2", children: getRequesterLabel(request.requester_id) }), _jsx("td", { className: "p-2", children: getDatasetLabel(request.dataset_id) }), _jsx("td", { className: "p-2", children: getPurposeLabel(request.purpose) }), _jsx("td", { className: "p-2", children: getScopeLabel(request.requested_scope) }), _jsx("td", { className: "p-2", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", disabled: decisionLoadingId === request.request_id, className: "px-2 py-1 border border-white/25 rounded", onClick: () => {
                                                                void decide(request.request_id, 'approve');
                                                            }, children: decisionLoadingId === request.request_id ? 'Approving...' : 'Approve' }), _jsx("button", { type: "button", disabled: decisionLoadingId === request.request_id, className: "px-2 py-1 border border-white/25 rounded", onClick: () => {
                                                                void decide(request.request_id, 'deny');
                                                            }, children: decisionLoadingId === request.request_id ? 'Working...' : 'Deny' })] }) })] }, request.request_id)))] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Who has access now" }), grantsError !== null && _jsx("p", { className: "text-red-300 text-sm", children: grantsError }), _jsxs("table", { className: "w-full text-sm border border-white/10", children: [_jsx("thead", { className: "text-left bg-white/5", children: _jsxs("tr", { children: [_jsx("th", { className: "p-2", children: "Who" }), _jsx("th", { className: "p-2", children: "Dataset" }), _jsx("th", { className: "p-2", children: "Why" }), _jsx("th", { className: "p-2", children: "What they can access" }), _jsx("th", { className: "p-2", children: "Actions" })] }) }), _jsxs("tbody", { children: [!grantsLoading && grants.length === 0 && (_jsx("tr", { children: _jsx("td", { className: "p-2 text-white/60", colSpan: 5, children: "No active access to your data" }) })), grants.map((grant) => (_jsxs("tr", { className: "border-t border-white/10", children: [_jsx("td", { className: "p-2", children: getRequesterLabel(grant.requester_id) }), _jsx("td", { className: "p-2", children: getDatasetLabel(grant.dataset_id) }), _jsx("td", { className: "p-2", children: "Approved data access" }), _jsx("td", { className: "p-2", children: getScopeLabel(grant.scope) }), _jsx("td", { className: "p-2", children: _jsx("button", { type: "button", disabled: revokeLoadingId === grant.grant_id, className: "px-2 py-1 border border-white/25 rounded", onClick: () => {
                                                        void revoke(grant.grant_id);
                                                    }, children: revokeLoadingId === grant.grant_id ? 'Revoking...' : 'Revoke' }) })] }, grant.grant_id)))] })] })] })] }));
}
