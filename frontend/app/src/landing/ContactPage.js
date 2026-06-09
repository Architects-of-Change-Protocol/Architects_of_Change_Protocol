import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const CONTACT_EMAIL = 'vicvalch@onchainfest.xyz';
export function renderContactPage() {
    return _jsx(ContactPage, {});
}
function ContactPage() {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const onSubmit = (event) => {
        event.preventDefault();
        const body = [
            `Name: ${name}`,
            `Company / Organization: ${company}`,
            `Email: ${email}`,
            '',
            'Message:',
            message,
        ].join('\n');
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || 'AOC Protocol Inquiry')}&body=${encodeURIComponent(body)}`;
    };
    return (_jsxs("main", { className: "min-h-screen bg-[#0a0a0a] text-white font-sans", children: [_jsx("section", { className: "border-b border-white/10", children: _jsxs("div", { className: "mx-auto max-w-6xl px-6 py-20 md:py-24", children: [_jsx("p", { className: "text-[11px] uppercase tracking-[0.24em] text-cyan-300/70", children: "Contact AOC Protocol" }), _jsx("h1", { className: "mt-4 text-5xl font-semibold tracking-tight md:text-6xl", children: "Let's design explicit access together." }), _jsx("p", { className: "mt-6 max-w-3xl text-lg leading-8 text-white/65", children: "Questions about developer collaboration, enterprise integration, partnerships, or the protocol itself? Send us your inquiry." })] }) }), _jsx("section", { className: "py-16", children: _jsxs("div", { className: "mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[1.25fr_1fr]", children: [_jsxs("form", { onSubmit: onSubmit, className: "rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10", children: [_jsx("h2", { className: "text-2xl font-semibold tracking-tight", children: "Start a conversation" }), _jsxs("p", { className: "mt-3 text-sm leading-7 text-white/62", children: ["This form opens a prefilled email to ", CONTACT_EMAIL, ". No backend storage is used yet."] }), _jsxs("div", { className: "mt-8 grid gap-5 md:grid-cols-2", children: [_jsx(Input, { label: "Name", value: name, onChange: setName, required: true }), _jsx(Input, { label: "Company / Organization", value: company, onChange: setCompany }), _jsx(Input, { label: "Email", type: "email", value: email, onChange: setEmail, required: true }), _jsx(Input, { label: "Subject", value: subject, onChange: setSubject, required: true })] }), _jsxs("label", { className: "mt-5 block", children: [_jsx("span", { className: "text-sm font-medium text-white/80", children: "Message" }), _jsx("textarea", { value: message, required: true, rows: 6, onChange: (event) => setMessage(event.target.value), className: "mt-2 w-full resize-y rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/[0.05]" })] }), _jsx("button", { type: "submit", className: "mt-7 inline-flex items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/90 px-6 py-3 text-sm font-semibold text-[#031018] transition-colors hover:bg-cyan-200", children: "Open email draft" })] }), _jsxs("aside", { className: "rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-10", children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-[0.2em] text-cyan-300/70", children: "Next steps" }), _jsx("h2", { className: "mt-3 text-2xl font-semibold tracking-tight", children: "Explore before reaching out" }), _jsx("p", { className: "mt-4 text-sm leading-7 text-white/62", children: "Review implementation concepts and enterprise patterns before starting the conversation." }), _jsxs("div", { className: "mt-7 flex flex-col gap-3", children: [_jsx("a", { href: "/?view=docs", className: "inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:text-white", children: "Review Docs" }), _jsx("a", { href: "/?view=enterprise", className: "inline-flex items-center justify-center rounded-xl border border-cyan-300/35 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/65 hover:bg-cyan-300/10", children: "Visit Enterprise" })] })] })] }) })] }));
}
function Input({ label, value, onChange, type = 'text', required = false, }) {
    return (_jsxs("label", { className: "block", children: [_jsx("span", { className: "text-sm font-medium text-white/80", children: label }), _jsx("input", { type: type, value: value, required: required, onChange: (event) => onChange(event.target.value), className: "mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/[0.05]" })] }));
}
