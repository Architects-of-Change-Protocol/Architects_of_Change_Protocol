import { LogoRotating } from '../../../components/logo/LogoRotating';
import { ASSESSMENT_MAILTO } from './content';

// Dark bookend, matching the visual rhythm of ../Hero.tsx (Enterprise) and
// ../governed-access/Hero.tsx: light-primary page, dark hero + closing CTA.
// See docs/audits/w007a-assurance-commercial-audit.md for why Assurance
// needed its own page rather than only the homepage's AssuranceSection.tsx
// summary.
export function Hero() {
  return (
    <section id="overview" className="scroll-mt-16 bg-[#0B1220] px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2.5">
          <LogoRotating size={18} inverted />
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-300">
            AOC Enterprise &middot; Assurance
          </p>
        </div>

        <h1 className="mt-7 text-[40px] md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Prove your governance and sovereignty posture, continuously
        </h1>

        <p className="mt-6 max-w-xl text-lg md:text-xl text-slate-400">
          A technical assessment of whether your architecture is actually Enterprise-ready — followed by
          continuous validation as you evolve.
        </p>

        <a
          href={ASSESSMENT_MAILTO}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Request Technical Assessment
        </a>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-slate-400 tracking-wide font-mono">
          <span>Assessment</span>
          <span aria-hidden>&rarr;</span>
          <span>Recommendations</span>
          <span aria-hidden>&rarr;</span>
          <span>Implementation</span>
          <span aria-hidden>&rarr;</span>
          <span>Validation</span>
          <span aria-hidden>&rarr;</span>
          <span>Continuous Assurance</span>
        </div>
      </div>
    </section>
  );
}
