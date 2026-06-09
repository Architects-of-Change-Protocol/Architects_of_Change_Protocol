import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ProblemCard({ title, children }) {
    return (_jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-red-800/30 bg-red-950/10 p-8 md:p-10 min-h-[420px] hover:-translate-y-1 transition", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,42,42,0.08)_0%,transparent_70%)] pointer-events-none" }), _jsxs("div", { className: "relative flex h-full flex-col justify-between gap-8", children: [_jsx("div", { className: "flex items-center justify-center min-h-[240px]", children: children }), _jsx("p", { className: "text-2xl text-red-100", children: title })] })] }));
}
