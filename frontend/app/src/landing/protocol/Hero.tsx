import { LogoRotating } from '../../components/logo/LogoRotating';
import { MINERALS } from '../enterprise/minerals';

const m = MINERALS.amethyst;

// Dark bookend, matching the visual rhythm every other AOC surface's hero
// uses (../enterprise/Hero.tsx, governed-access/Hero.tsx, assurance/Hero.tsx):
// light-primary page, dark #0B1220 hero + closing CTA. Copy is unchanged
// from the W004 rebuild — only the shell now matches the unified system.
export function Hero() {
  return (
    <section id="overview" className="scroll-mt-16 bg-[#0B1220] px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2.5">
          <LogoRotating size={18} inverted />
          <p className={`text-xs font-bold uppercase tracking-[0.14em] ${m.onDark}`}>
            Open Protocol &middot; Digital Assets &amp; Sovereignty
          </p>
        </div>

        <h1 className="mt-7 text-[44px] md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
          Digital assets should be capable of more than being stored.
        </h1>

        <p className="mt-6 max-w-xl text-lg md:text-xl text-slate-400">
          AOC Protocol is an open, provider-neutral language for digital assets — a way to give any
          file or resource identity, integrity, provenance and declared capabilities that
          compatible systems can interpret.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#digital-asset"
            className={`inline-flex items-center justify-center rounded-full ${m.solid} px-7 py-3.5 text-sm font-semibold text-white ${m.solidHover} transition-colors`}
          >
            Explore the capabilities &darr;
          </a>

          <a
            href="/?view=enterprise"
            className="inline-flex items-center justify-center rounded-full border border-white/15 hover:border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors"
          >
            See AOC Enterprise
          </a>
        </div>
      </div>
    </section>
  );
}
