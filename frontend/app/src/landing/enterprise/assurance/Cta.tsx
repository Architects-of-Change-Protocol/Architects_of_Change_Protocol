import { ASSESSMENT_MAILTO, CLOSING_FLOW } from './content';

// Section 9 — closing section: single commercial CTA (dark bookend,
// matching ../governed-access/Assessment.tsx) — no secondary "Contact
// Sales" / "Book Demo" links, per brief.
export function Cta() {
  return (
    <section className="scroll-mt-16 bg-[#0B1220] px-6 py-24 md:py-28 text-center">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="text-[32px] md:text-5xl font-extrabold tracking-tight text-white">
          Request a Technical Assessment
        </h2>
        <p className="mt-4 max-w-xl text-base md:text-lg text-slate-400">
          A scoped evaluation of your architecture's sovereignty and governance capabilities. No commitment
          beyond the assessment itself.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-slate-400 tracking-wide font-mono">
          {CLOSING_FLOW.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              {step}
              {i < CLOSING_FLOW.length - 1 ? <span aria-hidden>&rarr;</span> : null}
            </span>
          ))}
        </div>

        <a
          href={ASSESSMENT_MAILTO}
          className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-transform hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          Request Technical Assessment
          <svg viewBox="0 0 256 256" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
            <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
          </svg>
        </a>
      </div>
    </section>
  );
}
