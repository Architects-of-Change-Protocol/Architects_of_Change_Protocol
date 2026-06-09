import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const toneMap = {
    emerald: 'from-emerald-500 to-emerald-300',
    sky: 'from-sky-500 to-cyan-300',
    violet: 'from-violet-500 to-fuchsia-300',
    amber: 'from-amber-500 to-yellow-300',
};
export function AudienceRing({ label, value, total, tone }) {
    const safeTotal = Math.max(total, 1);
    const pct = Math.round((value / safeTotal) * 100);
    const angle = Math.round((pct / 100) * 360);
    return (_jsxs("article", { className: "rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/80", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm text-zinc-600 dark:text-zinc-300", children: label }), _jsxs("span", { className: "text-xs font-medium text-zinc-500 dark:text-zinc-400", children: [pct, "%"] })] }), _jsxs("div", { className: "mt-4 flex items-center gap-3", children: [_jsx("div", { className: `h-12 w-12 rounded-full bg-gradient-to-br ${toneMap[tone]} shadow-sm`, style: {
                            maskImage: `conic-gradient(black ${angle}deg, transparent ${angle}deg)`,
                            WebkitMaskImage: `conic-gradient(black ${angle}deg, transparent ${angle}deg)`,
                            ...{ '--tw-shadow-color': 'rgb(0 0 0 / 0.1)' },
                        } }), _jsx("p", { className: "text-xl font-semibold text-zinc-900 dark:text-white", children: value.toLocaleString() })] })] }));
}
