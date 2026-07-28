import { ARCHITECTURE_PATTERNS } from './content';
import { NodeGlyph, SectionHeader, StatusPill } from './primitives';

export function Architectures() {
  return (
    <section id="architectures" className="scroll-mt-16 max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
      <SectionHeader
        eyebrow="Stage 1 · Architecture"
        title="Architectures are reusable patterns, not products."
        description="AOC Enterprise is not organized around applications. It is organized around architecture patterns — reusable ways of modeling what is sovereign in your system, and what governs it."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ARCHITECTURE_PATTERNS.map((pattern) => (
          <article key={pattern.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <NodeGlyph shape={pattern.shape} />
              <StatusPill label={pattern.maturity} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{pattern.name}</h3>
            <p className="mt-2 text-sm text-white/60 leading-relaxed flex-1">{pattern.summary}</p>

            <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 font-mono uppercase tracking-[0.14em]">Template</span>
                <span className={pattern.template === 'Available' ? 'text-emerald-300' : 'text-white/45'}>
                  {pattern.template}
                </span>
              </div>
              <div>
                <span className="text-xs text-white/40 font-mono uppercase tracking-[0.14em]">Enabled capabilities</span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pattern.capabilities.map((cap) => (
                    <span key={cap} className="text-[11px] rounded-full border border-white/15 px-2.5 py-1 text-white/60">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
