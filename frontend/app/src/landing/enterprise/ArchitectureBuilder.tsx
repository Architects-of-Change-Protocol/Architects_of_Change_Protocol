import { ARCHITECTURE_PATTERNS, CAPABILITY_CATALOG, type ArchitecturePattern } from './content';
import { NodeGlyph, SectionHeader, StatusPill } from './primitives';

export function ArchitectureBuilder({
  selected,
  onSelect,
}: {
  selected: ArchitecturePattern;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="Stage 1 · Center of Gravity"
        title="Choose the center of gravity of your system."
        description="Every architecture starts with one decision: what is the sovereign entity everything else operates on behalf of? This is not a template choice — it changes which capabilities and governance concepts apply."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5" role="radiogroup" aria-label="Choose the center of gravity of your system">
        {ARCHITECTURE_PATTERNS.map((pattern) => {
          const isSelected = pattern.id === selected.id;
          return (
            <button
              key={pattern.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(pattern.id)}
              className={`text-left rounded-2xl border p-5 transition-colors ${
                isSelected
                  ? 'border-cyan-300/50 bg-cyan-300/[0.06]'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.035]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <NodeGlyph shape={pattern.shape} />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isSelected ? 'border-cyan-300 bg-cyan-300' : 'border-white/25'
                  }`}
                  aria-hidden
                />
              </div>
              <h3 className="mt-4 font-semibold text-white">{pattern.name}</h3>
              <p className="mt-1.5 text-sm text-white/55 leading-relaxed">{pattern.tagline}</p>
            </button>
          );
        })}
      </div>

      <ArchitectureDetail pattern={selected} />
    </div>
  );
}

function ArchitectureDetail({ pattern }: { pattern: ArchitecturePattern }) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.015] p-6 md:p-7">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-mono">Stage 2 · Architecture</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h3 className="text-2xl font-semibold text-white tracking-tight">{pattern.name} Architecture</h3>
        <StatusPill label={pattern.maturity} />
        <span className={`text-xs font-mono ${pattern.template === 'Available' ? 'text-emerald-300' : 'text-white/40'}`}>
          Template · {pattern.template}
        </span>
      </div>

      <p className="mt-3 max-w-2xl text-sm text-white/60 leading-relaxed">{pattern.summary}</p>

      {pattern.implementations ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-white/50 leading-relaxed">
            <span className="text-white/70 font-medium">Implementations, not the architecture itself:</span>{' '}
            {pattern.implementations.join(' · ')}. A tool like PMFreak is one implementation of this architecture —
            not the architecture itself.
          </p>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="text-xs text-white/40 font-mono uppercase tracking-[0.14em] mb-2.5">Recommended capabilities</p>
        <div className="flex flex-wrap gap-2">
          {pattern.capabilitySet.enabled.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 text-[13px] rounded-full border border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-1.5 text-cyan-100">
              <span className="text-cyan-300">✓</span>
              {CAPABILITY_CATALOG[id].name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
