import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useSession } from '../auth/session';
import { useRouter } from '../app/router';
export function LoginPage() {
    const { session, signInAs } = useSession();
    const { navigate } = useRouter();
    useEffect(() => {
        if (session.authenticated) {
            navigate('/app', true);
        }
    }, [navigate, session.authenticated]);
    if (session.authenticated)
        return null;
    return (_jsx("main", { className: "min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6", children: _jsxs("div", { className: "w-full max-w-md border border-white/10 rounded-2xl p-8 bg-white/[0.02]", children: [_jsx("h1", { className: "text-2xl font-semibold mb-2", children: "Mock Sign In" }), _jsx("p", { className: "text-white/60 text-sm mb-6", children: "P0 role/session foundation for dashboard routing." }), _jsxs("div", { className: "grid gap-3", children: [_jsx("button", { type: "button", onClick: () => {
                                signInAs('user');
                                navigate('/app/user');
                            }, className: "px-4 py-3 rounded-lg bg-cyan-400 text-black font-semibold", children: "Continue as User" }), _jsx("button", { type: "button", onClick: () => {
                                signInAs('market_maker');
                                navigate('/app/enterprise');
                            }, className: "px-4 py-3 rounded-lg border border-white/20 hover:border-white/40", children: "Continue as Market Maker" })] })] }) }));
}
