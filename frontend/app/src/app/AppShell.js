import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSession } from '../auth/session';
import { useRouter } from './router';
export function AppShell({ children }) {
    const { session, signOut } = useSession();
    const { navigate } = useRouter();
    return (_jsxs("main", { className: "min-h-screen bg-zinc-50 text-zinc-900 font-sans dark:bg-[#09090b] dark:text-white", children: [_jsx("header", { className: "border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs uppercase tracking-[0.2em] text-zinc-500", children: "AOC Control Plane" }), _jsx("div", { className: "text-lg font-semibold", children: "Consent Infrastructure" })] }), _jsxs("nav", { className: "flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-300", children: [_jsx("button", { type: "button", className: "hover:text-zinc-900 dark:hover:text-white", onClick: () => navigate('/app'), children: "Entry" }), _jsx("button", { type: "button", className: "hover:text-zinc-900 dark:hover:text-white", onClick: () => navigate('/app/user'), children: "User" }), _jsx("button", { type: "button", className: "hover:text-zinc-900 dark:hover:text-white", onClick: () => navigate('/app/enterprise'), children: "Enterprise" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "rounded-full border border-zinc-300 px-3 py-1 text-xs dark:border-white/20", children: session.role ?? 'anonymous' }), _jsx("button", { type: "button", onClick: () => {
                                        signOut();
                                        navigate('/login', true);
                                    }, className: "rounded-md border border-zinc-300 px-3 py-2 text-xs hover:bg-zinc-100 dark:border-white/20 dark:hover:bg-white/10", children: "Sign out" })] })] }) }), _jsx("section", { className: "mx-auto max-w-7xl px-4 py-8 md:px-6", children: children })] }));
}
