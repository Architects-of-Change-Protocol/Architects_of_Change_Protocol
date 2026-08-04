import { Eyebrow } from './primitives';

// AOC Enterprise is the commercial umbrella; Solutions and Services are the
// categories of what it sells. Each currently holds exactly one live
// offering. This section gives those offerings a body-level presence (not
// just a nav entry), pointing toward their own dedicated pages rather than
// explaining them in full — those pages get their own refactor later.
export function SolutionsAndServices() {
  return (
    <section id="solutions-services" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <Eyebrow>Built on AOC Enterprise</Eyebrow>
      <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-white">
        Packaged on top of the platform.
      </h2>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        <a
          href="/?view=governed-access"
          className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-cyan-300/40 hover:bg-white/[0.035]"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-mono">Solution</p>
          <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-cyan-200">Governed Access</h3>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">
            AOC Enterprise&apos;s first packaged commercial solution: governed access over externally
            stored digital assets, built on the identity, consent, and capability primitives above.
          </p>
        </a>

        <a
          href="/?view=assurance"
          className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-cyan-300/40 hover:bg-white/[0.035]"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80 font-mono">Service</p>
          <h3 className="mt-3 text-lg font-semibold text-white group-hover:text-cyan-200">Assurance</h3>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">
            An assessment and advisory service that evaluates an organization&apos;s sovereignty,
            governance, and operational maturity — often the first step toward implementation.
          </p>
        </a>
      </div>
    </section>
  );
}
