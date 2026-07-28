import { ASSURANCE_WIDGETS } from './content';
import { SectionHeader } from './primitives';

export function Assurance() {
  return (
    <section id="assurance" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Stage 6 · Assurance"
        title="A governance control plane, not a compliance checklist."
        description="Assurance continuously evaluates how well an architecture is actually governed — coverage, evidence quality, open findings, and a scored trajectory over time."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ASSURANCE_WIDGETS.map((widget) => (
          <div key={widget.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45 font-mono">{widget.label}</p>
            <p className="mt-2.5 text-2xl font-semibold text-white tracking-tight">{widget.value}</p>
            <p className="mt-1.5 text-sm text-white/50">{widget.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] px-6 py-5">
        <p className="text-sm text-white/70 max-w-xl">
          Assurance is a first-class capability of AOC Enterprise — one of its strongest differentiators from
          general-purpose governance tooling built for a single application.
        </p>
        <a
          href="/?view=assurance"
          className="shrink-0 inline-flex items-center rounded-xl border border-cyan-300/35 px-4 py-2.5 text-sm font-medium text-cyan-200 hover:bg-cyan-300/10 transition-colors"
        >
          Open the Assurance control plane
        </a>
      </div>
    </section>
  );
}
