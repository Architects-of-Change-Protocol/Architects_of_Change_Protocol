import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const REPO_URL = 'https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol';
const protocolLinks = [
    { label: 'Architecture' },
    { label: 'Consent Engine' },
    { label: 'Capability Model' },
    { label: 'Audit Layer' },
];
const navigationLinks = [
    { label: 'Docs', href: '/?view=docs' },
    { label: 'Enterprise', href: '/?view=enterprise' },
    { label: 'Contact Us', href: '/?view=contact' },
    { label: 'GitHub', href: REPO_URL, external: true },
];
export function ProtocolFooter() {
    return (_jsxs("section", { className: "border-t border-white/10 bg-[#050816]", children: [_jsxs("div", { className: "mx-auto w-full max-w-7xl px-4 sm:px-6 pb-6 pt-12 md:pt-16", children: [_jsxs("div", { className: "footer-fade rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-4 sm:px-6 py-8 text-center md:px-10 md:py-12", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.24em] text-cyan-200/60", children: "Protocol handoff" }), _jsx("h2", { className: "mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl", children: "Ship access systems with explicit control semantics." }), _jsx("p", { className: "mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/65 md:text-base", children: "Explore the docs, review enterprise positioning, or contact the protocol directly." }), _jsxs("div", { className: "mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center", children: [_jsx("a", { href: "/?view=docs", className: "footer-link-hover inline-flex w-full sm:w-auto sm:min-w-[170px] items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/90 px-5 py-3 text-sm font-semibold text-[#031018] transition-colors hover:bg-cyan-200", children: "Read the Docs" }), _jsx("a", { href: "/?view=enterprise", className: "footer-link-hover inline-flex w-full sm:w-auto sm:min-w-[170px] items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white", children: "Enterprise" }), _jsx("a", { href: REPO_URL, target: "_blank", rel: "noreferrer", className: "footer-link-hover inline-flex w-full sm:w-auto sm:min-w-[170px] items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white", children: "View GitHub" })] })] }), _jsxs("footer", { className: "footer-fade mt-10 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008))] px-4 sm:px-6 py-8 md:px-10 md:py-12", children: [_jsxs("div", { className: "grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8", children: [_jsxs("div", { className: "max-w-sm", children: [_jsx("h3", { className: "text-base font-semibold tracking-tight text-white", children: "AOC Protocol" }), _jsx("div", { className: "mt-4 h-px w-16 bg-cyan-200/20" }), _jsx("p", { className: "mt-4 text-sm leading-6 text-white/62", children: "Programmable control layer for consent-aware access, capability control, and auditable machine interaction." })] }), _jsx(FooterColumn, { title: "Protocol", items: protocolLinks }), _jsx(FooterColumn, { title: "Navigation", items: navigationLinks })] }), _jsxs("div", { className: "mt-10 flex flex-col gap-4 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between", children: [_jsx("p", { children: "\u00A9 2026 AOC Protocol" }), _jsxs("div", { className: "flex items-center gap-5", children: [_jsx("span", { className: "text-white/35", children: "Privacy" }), _jsx("span", { className: "text-white/35", children: "Terms" })] })] })] })] }), _jsx("style", { children: `
        :root {
          --aoc-ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes footer-fade-up {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .footer-fade {
          animation: footer-fade-up 560ms var(--aoc-ease-premium) both;
        }

        .footer-link-hover {
          transition:
            opacity 180ms var(--aoc-ease-premium),
            transform 180ms var(--aoc-ease-premium),
            border-color 180ms var(--aoc-ease-premium),
            color 180ms var(--aoc-ease-premium),
            background-color 180ms var(--aoc-ease-premium);
        }

        .footer-link-hover:hover {
          transform: translateY(-1px);
        }

        @media (prefers-reduced-motion: reduce) {
          .footer-fade,
          .footer-link-hover,
          .footer-link-hover:hover {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      ` })] }));
}
function FooterColumn({ title, items }) {
    return (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium uppercase tracking-[0.16em] text-white/62", children: title }), _jsx("ul", { className: "mt-4 space-y-2.5", children: items.map((item) => (_jsx("li", { children: item.href ? (_jsx("a", { href: item.href, target: item.external ? '_blank' : undefined, rel: item.external ? 'noreferrer' : undefined, className: "footer-link-hover inline-block text-sm text-white/55 hover:text-white/80", children: item.label })) : (_jsx("span", { className: "inline-block text-sm text-white/38", children: item.label })) }, item.label))) })] }));
}
