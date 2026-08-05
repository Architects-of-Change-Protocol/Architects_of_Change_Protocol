import { LogoRotating } from '../../../components/logo/LogoRotating';

const EMAIL = 'hello@aocprotocol.xyz';
const CTA_HREF = `mailto:${EMAIL}?subject=${encodeURIComponent('AOC Assurance — Technical Assessment Request')}`;

// Dark bookend, matching the visual rhythm of governed-access/Hero.tsx and
// ../CtaSection.tsx: light-primary page, dark hero + closing CTA. One H1,
// one CTA, no pricing, no checkout — the hero's job is to define Assurance
// correctly in the first two lines. See
// docs/w007-assurance-canonical-assessment-layer.md.
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

        <h1 className="mt-7 text-[38px] md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
          Know how governed and sovereign your digital architecture really is.
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-slate-400">
          AOC Assurance evaluates every sovereignty capability defined by AOC Protocol and every
          governance capability operated by AOC Enterprise.
        </p>

        <a
          href={CTA_HREF}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Request Technical Assessment
        </a>

        <p className="mt-8 max-w-xl text-sm text-slate-500">
          A point-in-time assessment today, evolving toward continuous monitoring as that capability matures
          — see Continuous Assurance below for what is available now.
        </p>
      </div>
    </section>
  );
}
