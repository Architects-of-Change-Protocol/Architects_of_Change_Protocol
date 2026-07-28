import { Eyebrow } from './primitives';

export function Hero() {
  return (
    <section id="overview" className="scroll-mt-16 max-w-7xl mx-auto px-6 pt-16 pb-4 md:pt-20">
      <Eyebrow>AOC Enterprise · built on AOC Protocol</Eyebrow>
      <h1 className="mt-5 max-w-4xl text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
        Design the center of gravity of your digital system.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-white/65 leading-relaxed">
        AOC Enterprise is the commercial operating layer built on AOC Protocol. Choose what your
        system is sovereign around, compose the governance capabilities it needs, and operate it
        with continuous evidence and assurance.
      </p>

      <div className="mt-9 flex flex-col sm:flex-row gap-3">
        <a
          href="#architecture"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-200 transition-colors"
        >
          Start designing
        </a>
        <a
          href="mailto:hello@aocprotocol.xyz?subject=AOC%20Enterprise%20Governance%20Walkthrough"
          className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white/80 hover:border-white/35 hover:text-white transition-colors"
        >
          Talk to architecture
        </a>
      </div>
    </section>
  );
}
