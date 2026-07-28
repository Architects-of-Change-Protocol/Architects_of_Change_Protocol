import { Eyebrow, FlowRail } from './primitives';

export function Hero() {
  return (
    <section id="overview" className="scroll-mt-16 max-w-7xl mx-auto px-6 pt-16 pb-16 md:pt-24 md:pb-20">
      <Eyebrow>AOC Enterprise · built on AOC Protocol</Eyebrow>
      <h1 className="mt-5 max-w-3xl text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
        Every organization composes a different architecture.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-white/65 leading-relaxed">
        AOC Enterprise helps you compose the right protocol capabilities for yours — before governance is defined.
      </p>

      <a
        href="#composition"
        className="mt-9 inline-flex items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-200 transition-colors"
      >
        Start composing
      </a>

      <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.015] px-5 py-6 md:px-8 md:py-8 overflow-x-auto">
        <FlowRail size="large" />
      </div>
    </section>
  );
}
