import { LogoRotating } from '../../components/logo/LogoRotating';

// Deck slide 1 (dark bookend). Copy, chip row, and "spine" line are taken
// verbatim from the canonical SK005 pitch deck.
export function Hero() {
  return (
    <section id="overview" className="scroll-mt-16 bg-[#0B1220] px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2.5">
          <LogoRotating size={18} inverted />
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-300">Soberanía Enterprise</p>
        </div>

        <h1 className="mt-7 text-[44px] md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
          Governance should follow the asset — not stop at the platform.
        </h1>

        <p className="mt-6 max-w-xl text-lg md:text-xl text-slate-400">
          Soberanía Enterprise turns declared rights and authority into provable, revocable and auditable access.
        </p>

        <div className="mt-8 flex items-center gap-3 text-[13px] font-bold tracking-[0.16em] text-indigo-300">
          <span>PROVABLE</span>
          <span className="text-slate-600">·</span>
          <span>REVOCABLE</span>
          <span className="text-slate-600">·</span>
          <span>AUDITABLE</span>
        </div>

        <a
          href="#problem"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          See how it works
        </a>

        <div className="mt-16 text-base text-slate-400 tracking-wide">
          Request&nbsp;&nbsp;→&nbsp;&nbsp;Decision&nbsp;&nbsp;→&nbsp;&nbsp;Grant&nbsp;&nbsp;→&nbsp;&nbsp;Evidence
        </div>
      </div>
    </section>
  );
}
