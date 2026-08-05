import { LogoRotating } from '../../../components/logo/LogoRotating';
import { ASSESSMENT_MAILTO } from './content';

// Dark bookend, matching the visual rhythm of ../Hero.tsx (Enterprise) and
// ../governed-access/Hero.tsx: light-primary page, dark hero + closing CTA.
// Copy is the canonical W007 definition, verbatim.
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
          Know how governed your digital architecture really is.
        </h1>

        <p className="mt-6 max-w-xl text-lg md:text-xl text-slate-400">
          AOC Assurance continuously evaluates every sovereignty capability defined by AOC Protocol and every
          governance capability implemented by AOC Enterprise.
        </p>

        <a
          href={ASSESSMENT_MAILTO}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Request Technical Assessment
        </a>
      </div>
    </section>
  );
}
